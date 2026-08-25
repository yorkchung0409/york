(function exposePokerCore(global) {
  const ODDS = [30, 15, 10, 7, 6, 5, 4, 3.5, 2.8, 2.5, 2.3, 2, 1.8, 1.65, 1.5, 1.35, 1.2];
  const CARD_RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
  const CARD_SUITS = ["s", "h", "d", "c"];
  const CARD_DECK = CARD_RANKS.flatMap((rank) => CARD_SUITS.map((suit) => `${rank}${suit}`));
  const RANK_VALUES = Object.fromEntries(CARD_RANKS.map((rank, index) => [rank, index + 2]));
  const CARD_VALUE_SET = new Set(CARD_DECK);

  function parseCard(value) {
    // Card values are deliberately kept to exactly two characters.  We still
    // normalize casing so values coming from text inputs have one canonical key.
    if (typeof value !== "string" || value.length !== 2) return null;
    const rankCode = value[0].toUpperCase();
    const suitCode = value[1].toLowerCase();
    const canonical = `${rankCode}${suitCode}`;
    if (!CARD_VALUE_SET.has(canonical)) return null;
    return { value: canonical, rank: RANK_VALUES[rankCode], suit: suitCode };
  }

  function normalizeCardInput(value) {
    if (typeof value === "string") return parseCard(value);
    try {
      if (value && typeof value === "object" && typeof value.value === "string") return parseCard(value.value);
    } catch (error) {
      return null;
    }
    return null;
  }

  function normalizeCardList(cards) {
    const result = strictCardList(cards, { allowEmpty: true });
    return result.valid ? result.cards : [];
  }

  function strictCardList(cards, options = {}) {
    const allowEmpty = Boolean(options && typeof options === "object" && options.allowEmpty);
    if (!Array.isArray(cards)) return { valid: false, cards: [], reason: "cards-not-array" };
    const normalized = [];
    const seen = new Set();
    for (const raw of cards) {
      if (allowEmpty && (raw === "" || raw === null || raw === undefined)) continue;
      const card = normalizeCardInput(raw);
      if (!card) return { valid: false, cards: normalized, reason: "invalid-card" };
      if (seen.has(card.value)) return { valid: false, cards: normalized, reason: "duplicate-card" };
      seen.add(card.value);
      normalized.push(card);
    }
    return { valid: true, cards: normalized, reason: "" };
  }

  // Normalize one board/player state and build the remaining deck once.  The
  // callers can opt into empty player seats for automatic unknown-opponent
  // sampling; partially specified hands remain invalid by design.
  function prepareCardState(boardValues, players, options = {}) {
    const allowIncompletePlayers = Boolean(options && typeof options === "object" && options.allowIncompletePlayers);
    try {
      if (!Array.isArray(boardValues) || !Array.isArray(players)) return null;
      const boardResult = strictCardList(boardValues);
      if (!boardResult.valid) return null;
      const normalizedPlayers = [];
      const playerKeys = new Set();
      for (const player of players) {
        if (!player || typeof player !== "object") return null;
        const key = player.key === null || player.key === undefined ? "" : String(player.key);
        if (!key || playerKeys.has(key)) return null;
        playerKeys.add(key);
        const rawCards = player.cards === null || player.cards === undefined
          ? (allowIncompletePlayers ? [] : null)
          : player.cards;
        const cardsResult = strictCardList(rawCards, { allowEmpty: allowIncompletePlayers });
        if (!cardsResult.valid || cardsResult.cards.length > 2) return null;
        if (!allowIncompletePlayers && cardsResult.cards.length !== 2) return null;
        if (allowIncompletePlayers && cardsResult.cards.length === 1) return null;
        normalizedPlayers.push({ ...player, key, cards: cardsResult.cards });
      }
      const knownCards = [...boardResult.cards, ...normalizedPlayers.flatMap((player) => player.cards)];
      const used = new Set();
      for (const card of knownCards) {
        if (used.has(card.value)) return null;
        used.add(card.value);
      }
      const remaining = CARD_DECK.filter((value) => !used.has(value)).map(parseCard);
      return {
        board: boardResult.cards,
        players: normalizedPlayers,
        knownCards,
        used,
        remaining,
        remainingCount: remaining.length
      };
    } catch (error) {
      return null;
    }
  }

  function compareScore(left, right) {
    if (!Array.isArray(left) || !Array.isArray(right)) return 0;
    for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
      const difference = (left[index] || 0) - (right[index] || 0);
      if (difference) return difference;
    }
    return 0;
  }

  function evaluateFive(cards) {
    if (!Array.isArray(cards) || cards.length !== 5 || cards.some((card) => !card || !Number.isInteger(card.rank) || card.rank < 2 || card.rank > 14 || !CARD_SUITS.includes(card.suit))) return [0];
    const ranks = cards.map((card) => card.rank).sort((a, b) => b - a);
    const counts = new Map();
    ranks.forEach((rank) => counts.set(rank, (counts.get(rank) || 0) + 1));
    const groups = [...counts.entries()].sort((left, right) => right[1] - left[1] || right[0] - left[0]);
    const flush = cards.every((card) => card.suit === cards[0].suit);
    const uniqueRanks = [...new Set(ranks)];
    let straightHigh = 0;
    if (uniqueRanks.length === 5) {
      if (uniqueRanks[0] - uniqueRanks[4] === 4) straightHigh = uniqueRanks[0];
      else if (uniqueRanks.join(",") === "14,5,4,3,2") straightHigh = 5;
    }
    if (flush && straightHigh) return [8, straightHigh];
    if (groups[0][1] === 4) return [7, groups[0][0], groups[1][0]];
    if (groups[0][1] === 3 && groups[1][1] === 2) return [6, groups[0][0], groups[1][0]];
    if (flush) return [5, ...ranks];
    if (straightHigh) return [4, straightHigh];
    if (groups[0][1] === 3) return [3, groups[0][0], ...groups.slice(1).map((group) => group[0]).sort((a, b) => b - a)];
    if (groups[0][1] === 2 && groups[1][1] === 2) {
      const pairs = [groups[0][0], groups[1][0]].sort((a, b) => b - a);
      return [2, ...pairs, groups[2][0]];
    }
    if (groups[0][1] === 2) return [1, groups[0][0], ...groups.slice(1).map((group) => group[0]).sort((a, b) => b - a)];
    return [0, ...ranks];
  }

  function evaluateBest(cards) {
    if (!Array.isArray(cards) || cards.length < 5 || cards.some((card) => !card || !Number.isInteger(card.rank) || card.rank < 2 || card.rank > 14 || !CARD_SUITS.includes(card.suit))) return [0];
    let best = null;
    for (let a = 0; a < cards.length - 4; a += 1) {
      for (let b = a + 1; b < cards.length - 3; b += 1) {
        for (let c = b + 1; c < cards.length - 2; c += 1) {
          for (let d = c + 1; d < cards.length - 1; d += 1) {
            for (let e = d + 1; e < cards.length; e += 1) {
              const score = evaluateFive([cards[a], cards[b], cards[c], cards[d], cards[e]]);
              if (!best || compareScore(score, best) > 0) best = score;
            }
          }
        }
      }
    }
    return best || [0];
  }

  function normalizedOuts(value, fallback = 1) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(Math.max(Math.trunc(parsed), 0), ODDS.length);
  }

  function oddsForOuts(outs) {
    const count = normalizedOuts(outs, 0);
    return count > 0 ? ODDS[count - 1] : 0;
  }

  function numericStringIsValid(raw) {
    return /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(String(raw ?? "").trim());
  }

  function parseOuts(raw) {
    const text = String(raw ?? "").trim();
    if (!/^\d+$/.test(text)) return { valid: false, value: null, message: "outs 必须是 0–17 的整数" };
    const value = Number(text);
    if (value > 17) return { valid: false, value, message: "outs 不能超过 17 张" };
    return { valid: true, value, message: "" };
  }

  function parseCallOuts(raw) {
    const text = String(raw ?? "").trim();
    if (!/^\d+$/.test(text)) return { valid: false, value: null, message: "outs 必须是 0–47 的整数" };
    const value = Number(text);
    if (value > 47) return { valid: false, value, message: "outs 不能超过 47 张" };
    return { valid: true, value, message: "" };
  }

  function clampProbability(value) {
    return Math.min(Math.max(Number(value) || 0, 0), 1);
  }

  function callProbability(outs, unknownCards = 47, cardsToCome = 2) {
    const cards = Math.max(0, Math.trunc(Number(unknownCards) || 0));
    const count = Math.min(Math.max(Math.trunc(Number(outs) || 0), 0), cards);
    const next = cards > 0 ? count / cards : 0;
    const byRiver = cardsToCome > 1 && cards > 1
      ? 1 - ((cards - count) / cards) * ((cards - 1 - count) / (cards - 1))
      : next;
    return {
      outs: count,
      unknownCards: cards,
      next,
      byRiver: clampProbability(byRiver),
      ruleOfFourNext: Math.min(1, count * 0.02),
      ruleOfFourByRiver: Math.min(1, count * 0.04)
    };
  }

  function calculateCallMetrics({ potBeforeCall = 0, callAmount = 0, investedBefore = 0, outs = 0, unknownCards = 47, cardsToCome = 2, equity } = {}) {
    const pot = Math.max(0, Number(potBeforeCall) || 0);
    const call = Math.max(0, Number(callAmount) || 0);
    const invested = Math.max(0, Number(investedBefore) || 0);
    const probability = callProbability(outs, unknownCards, cardsToCome);
    const potAfterCall = pot + call;
    const potOdds = potAfterCall > 0 ? call / potAfterCall : 0;
    const decisionEquity = Number.isFinite(Number(equity)) ? clampProbability(equity) : probability.next;
    const edge = decisionEquity - potOdds;
    const ev = decisionEquity * pot - (1 - decisionEquity) * call;
    return {
      ...probability,
      potBeforeCall: pot,
      callAmount: call,
      potAfterCall,
      investedBefore: invested,
      totalInvestedAfter: invested + call,
      potOdds,
      potRatio: call > 0 ? pot / call : null,
      equity: decisionEquity,
      edge,
      ev,
      decision: edge > 1e-9 ? "call" : edge < -1e-9 ? "fold" : "borderline"
    };
  }

  function normalizedNonNegativeInteger(value) {
    try {
      const number = Number(value);
      return Number.isFinite(number) ? Math.max(0, Math.trunc(number)) : null;
    } catch (error) {
      return null;
    }
  }

  function calculateCallEquity(boardValues, players, heroKey, options = {}) {
    const state = prepareCardState(boardValues, players, { allowIncompletePlayers: true });
    if (!state || state.board.length < 3 || state.board.length > 5) return null;
    const suppliedPlayers = state.players;
    const hero = suppliedPlayers.find((player) => player.key === String(heroKey));
    if (!hero || hero.cards.length !== 2) return null;
    const completePlayers = suppliedPlayers.filter((player) => player.cards.length === 2);
    const knownOpponents = completePlayers.filter((player) => player.key !== hero.key);
    const placeholderCount = suppliedPlayers.filter((player) => player.key !== hero.key && player.cards.length === 0).length;
    let optionValues;
    try {
      optionValues = typeof options === "number" ? { opponentCount: options } : (options && typeof options === "object" ? options : {});
    } catch (error) {
      return null;
    }
    // `unknownOpponentCount` is the explicit name. `opponentCount` as a
    // fourth-argument option is retained as a legacy alias for that count;
    // `seatCount` always means total active seats (hero included). When both
    // are supplied, the larger implied unknown-seat count wins so no seat is
    // silently dropped from the model.
    let hasUnknownMetadata;
    let explicitUnknown;
    let requestedUnknown;
    let requestedSeats;
    try {
      hasUnknownMetadata = Object.prototype.hasOwnProperty.call(optionValues, "unknownOpponentCount")
        || Object.prototype.hasOwnProperty.call(optionValues, "opponentCount")
        || Object.prototype.hasOwnProperty.call(optionValues, "seatCount");
      explicitUnknown = normalizedNonNegativeInteger(optionValues.unknownOpponentCount);
      requestedUnknown = explicitUnknown !== null ? explicitUnknown : normalizedNonNegativeInteger(optionValues.opponentCount);
      requestedSeats = normalizedNonNegativeInteger(optionValues.seatCount);
    } catch (error) {
      return null;
    }
    let unknownOpponentCount = Math.max(
      placeholderCount,
      requestedUnknown === null ? 0 : requestedUnknown,
      requestedSeats === null ? 0 : requestedSeats - completePlayers.length
    );
    // Preserve the old hero-only API: without seat metadata it modeled one
    // random opponent. Supplying seatCount: 1/opponentCount: 0 explicitly
    // disables that fallback.
    if (!hasUnknownMetadata && !unknownOpponentCount && knownOpponents.length === 0) unknownOpponentCount = 1;
    const opponentCount = knownOpponents.length + unknownOpponentCount;
    if (!opponentCount) return null;
    const remaining = state.remaining;
    const cardsToCome = Math.max(0, 5 - state.board.length);
    if (remaining.length < unknownOpponentCount * 2 + cardsToCome) return null;

    const settle = (runout, tablePlayers) => {
      const scores = tablePlayers.map((player) => evaluateBest([...state.board, ...runout, ...player.cards]));
      const best = scores.reduce((top, score) => (compareScore(score, top) > 0 ? score : top), scores[0] || [0]);
      const leaders = scores.map((score, index) => compareScore(score, best) === 0 ? index : -1).filter((index) => index >= 0);
      return { leaders, heroIndex: tablePlayers.findIndex((player) => player.key === hero.key) };
    };

    if (unknownOpponentCount > 0) {
      let seed = 0x9e3779b9;
      [...state.board, ...hero.cards].forEach((card) => {
        [...card.value].forEach((char) => { seed = (seed ^ char.charCodeAt(0)) * 1664525 + 1013904223; });
      });
      seed = (seed ^ unknownOpponentCount ^ opponentCount) >>> 0;
      const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
      const samples = state.board.length === 3 ? 12000 : state.board.length === 4 ? 8000 : 5000;
      const nextStats = { equity: 0, total: 0 };
      const riverStats = { equity: 0, total: 0 };
      const pick = (pool) => pool.length ? pool.splice(Math.floor(random() * pool.length), 1)[0] : null;
      for (let sample = 0; sample < samples; sample += 1) {
        const pool = [...remaining];
        const randomOpponents = [];
        let drawFailed = false;
        const generatedKeys = new Set(completePlayers.map((player) => player.key));
        for (let index = 0; index < unknownOpponentCount; index += 1) {
          const first = pick(pool);
          const second = pick(pool);
          if (!first || !second) { drawFailed = true; break; }
          let generatedKey = `UNKNOWN_${index + 1}`;
          while (generatedKeys.has(generatedKey)) generatedKey = `_${generatedKey}`;
          generatedKeys.add(generatedKey);
          randomOpponents.push({ key: generatedKey, cards: [first, second] });
        }
        if (drawFailed) continue;
        const tablePlayers = [...completePlayers, ...randomOpponents];
        const nextRunout = [];
        if (state.board.length < 5) {
          const next = pick(pool);
          if (!next) continue;
          nextRunout.push(next);
        }
        const nextResult = settle(nextRunout, tablePlayers);
        if (nextResult.leaders.includes(nextResult.heroIndex)) nextStats.equity += 1 / nextResult.leaders.length;
        nextStats.total += 1;
        const riverRunout = [...nextRunout];
        while (state.board.length + riverRunout.length < 5) {
          const river = pick(pool);
          if (!river) { drawFailed = true; break; }
          riverRunout.push(river);
        }
        if (drawFailed) continue;
        const riverResult = settle(riverRunout, tablePlayers);
        if (riverResult.leaders.includes(riverResult.heroIndex)) riverStats.equity += 1 / riverResult.leaders.length;
        riverStats.total += 1;
      }
      return {
        heroKey: hero.key,
        mode: "random-opponent",
        remainingCount: remaining.length,
        opponentCount,
        knownOpponentCount: knownOpponents.length,
        unknownOpponentCount,
        seatCount: opponentCount + 1,
        nextEquity: nextStats.total ? nextStats.equity / nextStats.total : 0,
        byRiverEquity: riverStats.total ? riverStats.equity / riverStats.total : 0,
        winCards: [], tieCards: [], lossCards: [],
        currentStatus: "未知对手",
        sampleCount: Math.min(nextStats.total, riverStats.total || nextStats.total)
      };
    }

    const heroIndex = completePlayers.findIndex((player) => player.key === hero.key);
    const nextStats = { equity: 0, total: 0, winCards: [], tieCards: [], lossCards: [] };
    if (state.board.length < 5) remaining.forEach((card) => {
      const result = settle([card], completePlayers);
      const heroWins = result.leaders.includes(result.heroIndex);
      nextStats.total += 1;
      if (heroWins) nextStats.equity += 1 / result.leaders.length;
      if (result.leaders.length === 1 && heroWins) nextStats.winCards.push(card.value);
      else if (heroWins) nextStats.tieCards.push(card.value);
      else nextStats.lossCards.push(card.value);
    });
    const riverStats = { equity: 0, total: 0 };
    if (state.board.length === 5) {
      const result = settle([], completePlayers);
      riverStats.equity = result.leaders.includes(heroIndex) ? 1 / result.leaders.length : 0;
      riverStats.total = 1;
    } else if (state.board.length === 4) {
      riverStats.equity = nextStats.equity;
      riverStats.total = nextStats.total;
    } else {
      for (let first = 0; first < remaining.length - 1; first += 1) {
        for (let second = first + 1; second < remaining.length; second += 1) {
          const result = settle([remaining[first], remaining[second]], completePlayers);
          if (result.leaders.includes(result.heroIndex)) riverStats.equity += 1 / result.leaders.length;
          riverStats.total += 1;
        }
      }
    }
    const current = settle([], completePlayers);
    return {
      heroKey: hero.key,
      mode: "known-opponent",
      remainingCount: remaining.length,
      opponentCount,
      knownOpponentCount: knownOpponents.length,
      unknownOpponentCount: 0,
      seatCount: opponentCount + 1,
      nextEquity: state.board.length === 5 ? riverStats.equity : nextStats.total ? nextStats.equity / nextStats.total : 0,
      byRiverEquity: riverStats.total ? riverStats.equity / riverStats.total : 0,
      winCards: nextStats.winCards,
      tieCards: nextStats.tieCards,
      lossCards: nextStats.lossCards,
      currentStatus: current.leaders.length === 1 && current.leaders[0] === heroIndex ? "领先" : current.leaders.includes(heroIndex) ? "平局领先" : "落后"
    };
  }

  function buildSidePots(contributions, playerKeys = ["A", "B", "C", "D"]) {
    const positive = playerKeys.map((key) => Number(contributions[key]) || 0).filter((value) => value > 0).sort((a, b) => a - b);
    const highest = positive[positive.length - 1] || 0;
    const secondHighest = positive[positive.length - 2] || 0;
    const levels = [...new Set(positive.filter((value) => value <= secondHighest))];
    const pots = [];
    let previous = 0;
    levels.forEach((level, index) => {
      const eligible = playerKeys.filter((key) => (Number(contributions[key]) || 0) >= level);
      const amount = (level - previous) * eligible.length;
      if (amount > 0) {
        const stakeByPlayer = playerKeys.reduce((values, key) => {
          values[key] = eligible.includes(key) ? level - previous : 0;
          return values;
        }, {});
        pots.push({ index, label: index === 0 ? "主池" : `边池 ${index}`, amount, eligible, from: previous, to: level, stakeByPlayer });
      }
      previous = level;
    });
    const topCount = highest > 0 ? playerKeys.filter((key) => (Number(contributions[key]) || 0) === highest).length : 0;
    const returned = topCount === 1 ? highest - secondHighest : 0;
    return { pots, highest, returned };
  }

  function sideEffectiveStakes(contributions, highest, returned, playerKeys = ["A", "B", "C", "D"]) {
    const uniqueHighest = highest > 0 && playerKeys.filter((key) => (Number(contributions[key]) || 0) === highest).length === 1;
    return playerKeys.reduce((values, key) => {
      values[key] = Math.max(0, (Number(contributions[key]) || 0) - (uniqueHighest && (Number(contributions[key]) || 0) === highest ? returned : 0));
      return values;
    }, {});
  }

  function sidePoolLeaders(pot, rankings) {
    const bestRank = Math.min(...pot.eligible.map((key) => Number(rankings[key]) || 4));
    return pot.eligible.filter((key) => (Number(rankings[key]) || 4) === bestRank);
  }

  function sideCoverageByPlayer(pots, rankings, playerKeys = ["A", "B", "C", "D"]) {
    const coverage = playerKeys.reduce((values, key) => ({ ...values, [key]: 0 }), {});
    pots.forEach((pot) => {
      const leaders = sidePoolLeaders(pot, rankings);
      leaders.forEach((key) => { coverage[key] += pot.amount / leaders.length; });
    });
    return coverage;
  }

  global.PokerCore = {
    ODDS,
    CARD_RANKS,
    CARD_SUITS,
    CARD_DECK,
    RANK_VALUES,
    parseCard,
    normalizeCardList,
    prepareCardState,
    compareScore,
    evaluateFive,
    evaluateBest,
    normalizedOuts,
    oddsForOuts,
    numericStringIsValid,
    parseOuts,
    parseCallOuts,
    callProbability,
    calculateCallMetrics,
    calculateCallEquity,
    buildSidePots,
    sideEffectiveStakes,
    sidePoolLeaders,
    sideCoverageByPlayer
  };
})(window);
