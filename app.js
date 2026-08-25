const Core = window.PokerCore;
const ODDS = Core.ODDS;
const normalizedOuts = Core.normalizedOuts;
const oddsForOuts = Core.oddsForOuts;
const numericStringIsValid = Core.numericStringIsValid;
const parseCallOuts = Core.parseCallOuts;
const calculateCallMetrics = Core.calculateCallMetrics;
const calculateCallEquity = Core.calculateCallEquity;
const {
  calculateHandOuts,
  calculateFinalEquities,
  calculateSideBuyerOuts
} = window.PokerAppHandAnalysis;
const buildSidePots = Core.buildSidePots;
const sideEffectiveStakes = Core.sideEffectiveStakes;
const sidePoolLeaders = Core.sidePoolLeaders;
const sideCoverageByPlayer = Core.sideCoverageByPlayer;
const RATIOS = [1, 0.75, 0.5, 1 / 3];

const $ = (selector) => document.querySelector(selector);
const els = {
  singleWorkspace: $("#singleWorkspace"),
  doubleWorkspace: $("#doubleWorkspace"),
  callWorkspace: $("#callWorkspace"),
  modeButtons: [...document.querySelectorAll("[data-mode]")],
  poolModeButtons: [...document.querySelectorAll("[data-pool-mode]")],
  sidePotPanel: $("#sidePotPanel"),
  sidePlayerInputs: {
    A: $("#sidePlayerA"),
    B: $("#sidePlayerB"),
    C: $("#sidePlayerC"),
    D: $("#sidePlayerD")
  },
  sideRankInputs: {
    A: $("#sideRankA"),
    B: $("#sideRankB"),
    C: $("#sideRankC"),
    D: $("#sideRankD")
  },
  sideBuyerEnabled: {
    A: $("#sideBuyerAEnabled"),
    B: $("#sideBuyerBEnabled"),
    C: $("#sideBuyerCEnabled"),
    D: $("#sideBuyerDEnabled")
  },
  sideCoverage: {
    A: $("#sideCoverageA"),
    B: $("#sideCoverageB"),
    C: $("#sideCoverageC"),
    D: $("#sideCoverageD")
  },
  sidePoolRows: $("#sidePotRows"),
  sideSummaryTotal: $("#sideSummaryTotal"),
  sideSummaryBuyers: $("#sideSummaryBuyers"),
  sideSummaryReturned: $("#sideSummaryReturned"),
  sideBuyerResults: $("#sideBuyerResults"),
  range: $("#outsRange"),
  oddsScale: $("#oddsScale"),
  oddsValue: $("#oddsValue"),
  oddsHint: $("#oddsHint"),
  pot: $("#potInput"),
  stake: $("#stakeInput"),
  customBuy: $("#customBuyInput"),
  customPayout: $("#customPayout"),
  resultRows: $("#resultRows"),
  hitNet: $("#hitNetValue"),
  customBuyValue: $("#customBuyValue"),
  safeNet: $("#safeNetValue"),
  summaryOuts: $("#summaryOuts"),
  summaryOdds: $("#summaryOdds"),
  turnRange: $("#turnOutsRange"),
  turnScale: $("#turnOddsScale"),
  turnOdds: $("#turnOddsValue"),
  turnBuy: $("#turnBuyInput"),
  turnPayout: $("#turnPayoutValue"),
  riverRange: $("#riverOutsRange"),
  riverScale: $("#riverOddsScale"),
  riverOdds: $("#riverOddsValue"),
  riverBuy: $("#riverBuyInput"),
  riverPayout: $("#riverPayoutValue"),
  doubleRiverAdvance: $("#doubleRiverAdvance"),
  riverStagePanel: $("#riverStagePanel"),
  doublePot: $("#doublePotInput"),
  doubleStake: $("#doubleStakeInput"),
  doubleSummaryOdds: $("#doubleSummaryOdds"),
  doubleTurnProbability: $("#doubleTurnProbability"),
  doubleRiverProbability: $("#doubleRiverProbability"),
  doubleBothSafeProbability: $("#doubleBothSafeProbability"),
  doubleTurnMeter: $("#doubleTurnMeter"),
  doubleRiverMeter: $("#doubleRiverMeter"),
  doubleBothSafeMeter: $("#doubleBothSafeMeter"),
  doubleExpectedValue: $("#doubleExpectedValue"),
  doubleRows: $("#doubleResultRows"),
  callInvested: $("#callInvestedInput"),
  callPot: $("#callPotInput"),
  callAmount: $("#callAmountInput"),
  callHero: $("#callHeroPlayer"),
  callOuts: $("#callOutsInput"),
  callUnknownCards: $("#callUnknownCards"),
  callManualFields: $("#callManualFields"),
  callAutoFields: $("#callAutoFields"),
  callAutoStatus: $("#callAutoStatus"),
  callAnalyze: $("#callAnalyzeButton"),
  callRuleOfFour: $("#callRuleOfFourInput"),
  callPotAfter: $("#callPotAfter"),
  callTotalInvested: $("#callTotalInvested"),
  callVerdict: $("#callVerdict"),
  callNextProbability: $("#callNextProbability"),
  callRiverProbability: $("#callRiverProbability"),
  callNextLabel: $("#callNextLabel"),
  callRiverLabel: $("#callRiverLabel"),
  callPotOdds: $("#callPotOdds"),
  callPotRatio: $("#callPotRatio"),
  callEquity: $("#callEquity"),
  callRequiredEquity: $("#callRequiredEquity"),
  callEdge: $("#callEdge"),
  callEquityBar: $("#callEquityBar"),
  callPotOddsMarker: $("#callPotOddsMarker"),
  callExpectedValue: $("#callExpectedValue"),
  callRuleOfFourResult: $("#callRuleOfFourResult"),
  callResultNote: $("#callResultNote"),
  reset: $("#resetButton"),
  copy: $("#copyButton"),
  doubleCopy: $("#doubleCopyButton"),
  handPanel: $("#handPanel"),
  handDeckStatus: $("#handDeckStatus"),
  boardChipStatus: $("#boardChipStatus"),
  playerChipStatus: $("#playerChipStatus"),
  handChipHint: $("#handChipHint"),
  handPlayerCount: $("#handPlayerCount"),
  handStreet: $("#handStreet"),
  handStreetSummary: $("#handStreetSummary"),
  boardCardInputs: $("#boardCardInputs"),
  playerHandInputs: $("#playerHandInputs"),
  handAnalysisResults: $("#handAnalysisResults"),
  applyCalculatedOuts: $("#applyCalculatedOuts"),
  autoRankFromHands: $("#autoRankFromHands"),
  sideRankNote: $("#sideRankNote"),
  doubleStrategyRows: $("#doubleStrategyRows"),
  boardPickerButton: $("#boardPickerButton"),
  boardPickerSummary: $("#boardPickerSummary"),
  boardHandHint: $("#boardHandHint"),
  playerHandHint: $("#playerHandHint"),
  cardPickerBackdrop: $("#cardPickerBackdrop"),
  cardPickerTitle: $("#cardPickerTitle"),
  cardPickerHint: $("#cardPickerHint"),
  cardPickerGrid: $("#cardPickerGrid"),
  cardPickerCount: $("#cardPickerCount"),
  cardPickerClose: $("#cardPickerClose"),
  cardPickerCancel: $("#cardPickerCancel"),
  cardPickerClear: $("#cardPickerClear"),
  cardPickerConfirm: $("#cardPickerConfirm")
};

const PLAYER_KEYS = ["A", "B", "C", "D"];
let poolMode = "single";
let singlePoolSnapshot = null;
const CARD_RANKS = Core.CARD_RANKS;
const CARD_SUITS = Core.CARD_SUITS;
const CARD_DECK = Core.CARD_DECK;
const RANK_LABELS = { T: "10", J: "J", Q: "Q", K: "K", A: "A" };
const SUIT_LABELS = { s: "♠", h: "♥", d: "♦", c: "♣" };
const HAND_CATEGORY_LABELS = ["高牌", "一对", "两对", "三条", "顺子", "同花", "葫芦", "四条", "同花顺"];
let handAnalysis = null;
let cardPickerState = null;
let sideBuyerOutAnalysis = {};
let doubleRiverUnlocked = false;
let sidePotInputState = {};
// Keys explicitly edited by the user are kept separate so automatic 100%
// recommendations can follow changed outs without overwriting a manual buy.
let sidePotManualBuyKeys = new Set();
let sideBuyerMarkupSignature = "";
let sidePoolStructureSignature = "";
let sideRankManuallyEdited = false;
let callSource = "manual";
let callAutoAnalysis = null;
const DRAFT_KEY = "poker-insurance-draft-v1";
let draftSaveTimer = null;

function readDraft() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    return parsed && parsed.values && typeof parsed.values === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function applyDraft(draft) {
  if (!draft?.values) return;
  if (draft.sidePotInputState && typeof draft.sidePotInputState === "object") {
    sidePotInputState = Object.fromEntries(Object.entries(draft.sidePotInputState)
      .filter(([key, value]) => typeof key === "string" && typeof value === "string"));
  }
  sidePotManualBuyKeys = new Set(Array.isArray(draft.sidePotManualBuyKeys)
    ? draft.sidePotManualBuyKeys.filter((key) => typeof key === "string")
    : []);
  sideRankManuallyEdited = Boolean(draft.sideRankManuallyEdited);
  Object.entries(draft.values).forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (!input) return;
    if (input.type === "checkbox") input.checked = draft.checked?.[id] ?? (value === "true" || value === "1");
    else if (typeof value === "string") input.value = value;
  });
  // Dynamic side-pot controls are rendered from this state after the static
  // form values have been restored. Do not let the first render overwrite it.
  sideBuyerMarkupSignature = "";
  if (draft.mode === "call") {
    const boardCount = [...document.querySelectorAll('[data-card-kind="board"]')].filter((input) => input.value).length;
    if (els.handStreet) els.handStreet.value = boardCount >= 5 ? "river" : boardCount === 4 ? "turn" : "flop";
  }
  updateHandStreetSummary();
  updatePickerButtons();
  refreshCardAvailability();
  callSource = draft.callSource === "auto" ? "auto" : "manual";
  doubleRiverUnlocked = draft.mode === "double" && Boolean(draft.doubleRiverUnlocked);
}

function saveDraft() {
  try {
    captureSidePotInputs();
    const inputs = [...document.querySelectorAll("input[id], select[id]")];
    const values = Object.fromEntries(inputs.map((input) => [input.id, input.value]));
    const checked = Object.fromEntries(inputs.filter((input) => input.type === "checkbox")
      .map((input) => [input.id, input.checked]));
    const mode = document.body.classList.contains("call-mode-active") ? "call" : document.body.classList.contains("double-mode-active") ? "double" : "single";
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 1, mode, poolMode, callSource, doubleRiverUnlocked, sideRankManuallyEdited, sidePotInputState, sidePotManualBuyKeys: [...sidePotManualBuyKeys], values, checked }));
  } catch {
    // Private browsing or storage limits should never block calculation.
  }
}

function queueDraftSave() {
  window.clearTimeout(draftSaveTimer);
  draftSaveTimer = window.setTimeout(saveDraft, 180);
}

function cardLabel(value) {
  if (!value) return "未选择";
  const rank = value[0];
  return `${RANK_LABELS[rank] || rank}${SUIT_LABELS[value[1]] || ""}`;
}

function cardOptions() {
  return `<option value="">选择</option>${CARD_DECK.map((card) => `<option value="${card}">${cardLabel(card)}</option>`).join("")}`;
}

function renderSelectedCardPreview(container, values, emptyLabel, target) {
  if (!container) return;
  container.classList.toggle("has-cards", values.length > 0);
  if (!values.length) {
    container.innerHTML = `<span class="selected-card-empty">${emptyLabel}</span>`;
    return;
  }
  const removeTarget = target || container.dataset.pickerCards || (container.id === "boardSelectedPreview" ? "board" : "");
  container.innerHTML = values.map((value) => {
    const rank = RANK_LABELS[value[0]] || value[0];
    const suit = value[1];
    return `<span class="selected-card-item"><span class="visible-card suit-${suit}" aria-label="${cardLabel(value)}"><strong>${rank}</strong><span>${SUIT_LABELS[suit] || ""}</span></span><button class="visible-card-remove" type="button" data-remove-card="${value}" data-remove-target="${removeTarget}" aria-label="删除${cardLabel(value)}">×</button></span>`;
  }).join("");
}

function updateSelectedCardPreviews() {
  const boardValues = handTargetInputs("board").map((input) => input.value).filter(Boolean);
  renderSelectedCardPreview(document.querySelector("#boardSelectedPreview"), boardValues, "尚未选择公共牌", "board");
  document.querySelectorAll("[data-picker-cards]").forEach((preview) => {
    const key = preview.dataset.pickerCards;
    const values = handTargetInputs(key).map((input) => input.value).filter(Boolean);
    renderSelectedCardPreview(preview, values, "尚未选择手牌", key);
  });
}

function removeSelectedCard(target, value) {
  if (!target || !value) return;
  if (target === "board") {
    const inputs = [...document.querySelectorAll('[data-card-kind="board"]')];
    const index = inputs.findIndex((input) => input.value === value);
    if (index < 0) return;
    for (let cursor = index; cursor < inputs.length - 1; cursor += 1) inputs[cursor].value = inputs[cursor + 1].value;
    inputs[inputs.length - 1].value = "";
    const count = inputs.filter((input) => input.value).length;
    if (document.body.classList.contains("call-mode-active")) els.handStreet.value = count >= 5 ? "river" : count === 4 ? "turn" : "flop";
    else if (count < 4) {
      els.handStreet.value = "flop";
      doubleRiverUnlocked = false;
    }
  } else {
    const input = handTargetInputs(target).find((item) => item.value === value);
    if (!input) return;
    input.value = "";
  }
  refreshCardAvailability();
  updateHandStreetSummary();
  updatePickerButtons();
  analyzeHandSituation(false);
  queueDraftSave();
}

function handTargetInputs(target) {
  if (target === "board") {
    if (document.body.classList.contains("call-mode-active")) {
      return [...document.querySelectorAll('[data-card-kind="board"]')];
    }
    const count = els.handStreet?.value === "turn" ? 4 : 3;
    return [...document.querySelectorAll('[data-card-kind="board"]')].slice(0, count);
  }
  if (target === "advance") {
    const input = document.querySelector('[data-card-kind="board"][data-card-index="3"]');
    return input ? [input] : [];
  }
  return [...document.querySelectorAll(`[data-card-kind="hand"][data-player="${target}"]`)];
}

function pickerTargetLabel(target) {
  if (target === "board") return "公共牌";
  if (target === "advance") return "实际转牌";
  return `${target} 手牌`;
}

function updateHandActionButtons() {
  if (!els.autoRankFromHands) return;
  const isCall = document.body.classList.contains("call-mode-active");
  const selectedBoardCount = [...document.querySelectorAll('[data-card-kind="board"]')].filter((input) => input.value).length;
  const street = isCall ? Math.min(Math.max(selectedBoardCount, 3), 5) : els.handStreet?.value === "turn" ? 4 : 3;
  const boardInputs = [...document.querySelectorAll('[data-card-kind="board"]')];
  const board = boardInputs.slice(0, street).map((input) => input.value);
  const playerKeys = isCall ? [els.callHero?.value || "A"] : activeHandPlayers();
  const players = playerKeys.map((key) => handTargetInputs(key).map((input) => input.value));
  const complete = board.length >= 3 && board.every(Boolean) && players.every((cards) => cards.length === 2 && cards.every(Boolean));
  els.autoRankFromHands.disabled = isCall || !complete || poolMode !== "side";
  if (isCall) {
    setHandApplyState(complete, "⚡ 根据牌面计算 equity");
  }
}

function updatePickerButtons() {
  if (!els.boardPickerButton) return;
  const isCall = document.body.classList.contains("call-mode-active");
  const boardInputs = handTargetInputs("board");
  const boardValues = boardInputs.map((input) => input.value).filter(Boolean);
  const boardExpected = isCall ? 5 : els.handStreet?.value === "turn" ? 4 : 3;
  const activeKeys = activeHandPlayers();
  const playerKeys = isCall ? [els.callHero?.value || "A"] : activeKeys;
  const completePlayers = playerKeys.filter((key) => handTargetInputs(key).every((input) => Boolean(input.value))).length;
  if (els.boardChipStatus) els.boardChipStatus.textContent = isCall ? `${boardValues.length} / 5` : `${boardValues.length} / ${boardExpected}`;
  if (els.playerChipStatus) els.playerChipStatus.textContent = isCall ? `${completePlayers} / 1` : `${completePlayers} / ${activeKeys.length}`;
  if (els.handChipHint) {
    const ready = boardValues.length >= 3 && completePlayers === playerKeys.length;
    els.handChipHint.textContent = ready ? "可计算" : "待补全";
    els.handChipHint.classList.toggle("is-ready", ready);
  }
  if (els.boardHandHint) els.boardHandHint.textContent = isCall ? "可选择 3–5 张公共牌，点击已选牌可取消" : "点击按钮选择牌面，前三张必填";
  if (els.playerHandHint) els.playerHandHint.textContent = isCall ? "我的手牌必填；对手手牌可选，未知时留空" : "点击每位玩家的按钮选择两张底牌";
  const canChooseTurn = document.body.classList.contains("double-mode-active")
    && els.handStreet?.value !== "turn"
    && boardValues.length === 3
    && completePlayers === activeKeys.length;
  const boardPickerCopy = els.boardPickerButton.querySelector(".picker-button-copy strong");
  const boardPickerSummary = els.boardPickerButton.querySelector("[data-board-picker-summary]");
  if (boardPickerCopy) boardPickerCopy.textContent = canChooseTurn ? "选择实际转牌" : "选择公共牌";
  if (boardPickerSummary) boardPickerSummary.textContent = canChooseTurn
    ? "翻牌已完成 · 选择第 4 张公共牌"
    : isCall ? `已选 ${boardValues.length} / 5 张（至少 3 张）` : `已选 ${boardValues.length} / ${boardExpected} 张`;
  els.boardPickerButton.dataset.pickerTarget = canChooseTurn ? "advance" : "board";
  els.boardPickerButton.setAttribute("aria-label", canChooseTurn ? "选择实际转牌" : "选择公共牌");
  els.boardPickerButton.classList.toggle("has-selection", boardValues.length > 0);
  document.querySelectorAll("[data-player-picker]").forEach((button) => {
    const key = button.dataset.playerPicker;
    const values = handTargetInputs(key).map((input) => input.value).filter(Boolean);
    const summary = button.querySelector("[data-picker-summary]");
    if (summary) summary.textContent = `已选 ${values.length} / 2 张`;
    button.classList.toggle("has-selection", values.length > 0);
  });
  updateSelectedCardPreviews();
  updateHandActionButtons();
}

function closeCardPicker() {
  cardPickerState = null;
  els.cardPickerBackdrop?.classList.add("is-hidden");
}

function renderCardPickerGrid() {
  if (!cardPickerState || !els.cardPickerGrid) return;
  const selectedElsewhere = new Set([...document.querySelectorAll("[data-card-kind]")]
    .map((input) => input.value)
    .filter(Boolean)
    .filter((value) => !cardPickerState.initial.includes(value)));
  const pickerDeck = [...CARD_RANKS].reverse().flatMap((rank) => CARD_SUITS.map((suit) => `${rank}${suit}`));
  els.cardPickerGrid.innerHTML = pickerDeck.map((value) => {
    const selected = cardPickerState.selected.includes(value);
    const disabled = !selected && selectedElsewhere.has(value);
    const suit = value[1];
    return `<button class="card-picker-card suit-${suit}${selected ? " is-selected" : ""}${disabled ? " is-disabled" : ""}" type="button" data-picker-card="${value}" ${disabled ? "disabled" : ""}>
      <strong>${RANK_LABELS[value[0]] || value[0]}</strong><span>${SUIT_LABELS[suit]}</span>
    </button>`;
  }).join("");
  const { min, max } = cardPickerState;
  els.cardPickerCount.textContent = min === max
    ? `已选 ${cardPickerState.selected.length} / ${max} 张`
    : `已选 ${cardPickerState.selected.length} 张 · 选择 ${min}–${max} 张`;
  els.cardPickerConfirm.disabled = cardPickerState.selected.length < min || cardPickerState.selected.length > max;
}

function openCardPicker(target) {
  const inputs = handTargetInputs(target);
  if (!inputs.length) return;
  const initial = inputs.map((input) => input.value).filter(Boolean);
  const isCallBoard = document.body.classList.contains("call-mode-active") && target === "board";
  cardPickerState = { target, inputs, initial, selected: [...initial], min: isCallBoard ? 3 : inputs.length, max: isCallBoard ? 5 : inputs.length };
  els.cardPickerTitle.textContent = `选择${pickerTargetLabel(target)}`;
  els.cardPickerHint.textContent = target === "board"
    ? isCallBoard ? "请选择 3–5 张公共牌；点击已选牌可取消，未知对手手牌可以留空。" : `请选择 ${inputs.length} 张公共牌；重复牌和其他已录入的牌不能选择。`
    : target === "advance"
      ? "请选择实际发出的转牌；确认后会切换到转牌后，并等待你重新计算河牌 outs。"
    : `请选择 ${inputs.length} 张${target}的底牌；重复牌不能选择。`;
  els.cardPickerBackdrop.classList.remove("is-hidden");
  renderCardPickerGrid();
  setTimeout(() => els.cardPickerGrid.querySelector(".is-selected")?.focus(), 0);
}

function confirmCardPicker() {
  if (!cardPickerState || cardPickerState.selected.length < cardPickerState.min || cardPickerState.selected.length > cardPickerState.max) return;
  cardPickerState.inputs.forEach((input, index) => {
    input.value = cardPickerState.selected[index] || "";
  });
  const target = cardPickerState.target;
  if (target === "advance") {
    els.handStreet.value = "turn";
    doubleRiverUnlocked = true;
  } else if (target === "board" && document.body.classList.contains("call-mode-active")) {
    const count = cardPickerState.selected.length;
    els.handStreet.value = count >= 5 ? "river" : count === 4 ? "turn" : "flop";
  }
  updateHandStreetSummary();
  closeCardPicker();
  refreshCardAvailability();
  updatePickerButtons();
  analyzeHandSituation(false);
  queueDraftSave();
  if (target === "board") {
    els.handAnalysisResults.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

const { parseCard, compareScore, evaluateBest } = Core;

function selectedHandPlayerKeys() {
  const count = Math.min(Math.max(Number(els.handPlayerCount?.value) || 2, 2), PLAYER_KEYS.length);
  return PLAYER_KEYS.slice(0, count);
}

function activeHandPlayers() {
  const selected = selectedHandPlayerKeys();
  if (!document.body.classList.contains("call-mode-active")) return selected;
  const heroKey = els.callHero?.value || "A";
  if (selected.includes(heroKey)) return selected;
  // Keep the configured table size while ensuring a C/D hero is an active seat.
  return [heroKey, ...PLAYER_KEYS.filter((key) => key !== heroKey)].slice(0, selected.length);
}

function updateHandStreetSummary() {
  if (!els.handStreetSummary || !els.handStreet) return;
  const street = els.handStreet.value === "river" ? "河牌后 · 5 张公共牌" : els.handStreet.value === "turn" ? "转牌后 · 4 张公共牌" : "翻牌后 · 3 张公共牌";
  els.handStreetSummary.textContent = street;
}

function syncHandStreetToMode(isDouble, reset = true) {
  if (!els.handStreet) return;
  const isCall = document.body.classList.contains("call-mode-active");
  const nextStreet = isCall || isDouble ? "flop" : "turn";
  if (reset) {
    els.handStreet.value = nextStreet;
    doubleRiverUnlocked = !isDouble || isCall;
    if (isDouble || isCall) {
      const turnInput = document.querySelector('[data-card-kind="board"][data-card-index="3"]');
      if (turnInput) turnInput.value = "";
      const riverInput = document.querySelector('[data-card-kind="board"][data-card-index="4"]');
      if (riverInput) riverInput.value = "";
    }
  }
  updateHandStreetSummary();
}

function updateDoubleStageUI() {
  const unlocked = !document.body.classList.contains("double-mode-active") || doubleRiverUnlocked;
  document.body.classList.toggle("double-river-unlocked", unlocked && document.body.classList.contains("double-mode-active"));
  els.riverStagePanel?.classList.toggle("is-locked", !unlocked);
  [els.riverRange, els.riverBuy].forEach((input) => { if (input) input.disabled = !unlocked; });
  els.riverScale?.classList.toggle("is-disabled", !unlocked);
  els.riverScale?.querySelectorAll("button").forEach((button) => {
    button.disabled = !unlocked;
    button.setAttribute("aria-disabled", String(!unlocked));
  });
  document.querySelectorAll("[data-river-ratio]").forEach((button) => {
    button.disabled = !unlocked;
    button.setAttribute("aria-disabled", String(!unlocked));
  });
  if (els.doubleRiverAdvance) {
    els.doubleRiverAdvance.hidden = unlocked;
    els.doubleRiverAdvance.disabled = !document.body.classList.contains("double-mode-active");
  }
  const note = document.querySelector("#riverStageNote");
  if (note) note.textContent = unlocked ? "填写转牌未爆后的实际河牌 outs" : "先确认转牌未爆，再计算河牌保险";
}

function renderHandInputs() {
  if (!els.boardCardInputs || !els.playerHandInputs) return;
  els.boardCardInputs.innerHTML = ["翻牌 1", "翻牌 2", "翻牌 3", "转牌", "河牌"].map((label, index) => `
    <label class="card-slot ${index >= 3 ? "is-optional" : ""}">
      <span>${label}</span>
      <select data-card-kind="board" data-card-index="${index}" aria-label="${label}">${cardOptions()}</select>
    </label>`).join("");
  els.playerHandInputs.innerHTML = PLAYER_KEYS.map((key) => `
    <article class="player-hand-card" data-player-hand="${key}">
      <strong>${key} 手牌</strong>
      <button class="hand-picker-button player-picker-button" type="button" data-player-picker="${key}">
        <span class="picker-button-icon">${key}</span>
        <span class="picker-button-copy"><strong>选择手牌</strong><small data-picker-summary>已选 0 / 2 张</small></span>
        <span class="picker-button-arrow">选择</span>
      </button>
      <div class="selected-card-preview player-selected-preview" data-picker-cards="${key}"><span class="selected-card-empty">尚未选择手牌</span></div>
      <div class="player-card-selects">
        <select data-card-kind="hand" data-player="${key}" data-card-index="0" aria-label="${key} 第一张手牌">${cardOptions()}</select>
        <select data-card-kind="hand" data-player="${key}" data-card-index="1" aria-label="${key} 第二张手牌">${cardOptions()}</select>
      </div>
      <small class="player-hand-status" data-player-status="${key}">等待输入</small>
    </article>`).join("");
  updateHandPlayerVisibility();
  els.boardPickerButton?.addEventListener("click", () => openCardPicker(els.boardPickerButton.dataset.pickerTarget === "advance" ? "advance" : "board"));
  document.querySelectorAll("[data-player-picker]").forEach((button) => {
    button.addEventListener("click", () => openCardPicker(button.dataset.playerPicker));
  });
  document.querySelectorAll("[data-card-kind]").forEach((input) => input.addEventListener("change", () => {
    updatePickerButtons();
    analyzeHandSituation(false);
  }));
  updatePickerButtons();
}

function updateHandPlayerVisibility() {
  const active = new Set(activeHandPlayers());
  let cleared = false;
  document.querySelectorAll("[data-player-hand]").forEach((card) => {
    const inactive = !active.has(card.dataset.playerHand);
    card.classList.toggle("is-inactive", inactive);
    if (inactive) card.querySelectorAll("select").forEach((input) => {
      if (input.value) { input.value = ""; cleared = true; }
    });
  });
  updatePickerButtons();
  if (cleared) queueDraftSave();
}

function refreshCardAvailability() {
  const inputs = [...document.querySelectorAll("[data-card-kind]")];
  const selected = inputs.map((input) => input.value).filter(Boolean);
  const duplicates = new Set(selected.filter((value, index) => selected.indexOf(value) !== index));
  inputs.forEach((input) => {
    [...input.options].forEach((option) => {
      option.disabled = Boolean(option.value && option.value !== input.value && selected.includes(option.value));
    });
    input.classList.toggle("card-filled", Boolean(input.value));
    input.classList.toggle("card-duplicate", duplicates.has(input.value));
  });
  return duplicates;
}

function handInputsState() {
  const isCall = document.body.classList.contains("call-mode-active");
  const selectedBoardCount = [...document.querySelectorAll('[data-card-kind="board"]')].filter((input) => input.value).length;
  const street = isCall ? Math.min(Math.max(selectedBoardCount, 3), 5) : els.handStreet.value === "turn" ? 4 : 3;
  const board = [...document.querySelectorAll('[data-card-kind="board"]')].slice(0, street).map((input) => input.value);
  const players = activeHandPlayers().map((key) => ({
    key,
    cards: [...document.querySelectorAll(`[data-card-kind="hand"][data-player="${key}"]`)].map((input) => input.value)
  }));
  return { street, board, players };
}

function updatePlayerHandStatus(players) {
  const byKey = Object.fromEntries(players.map((player) => [player.key, player]));
  document.querySelectorAll("[data-player-status]").forEach((status) => {
    const player = byKey[status.dataset.playerStatus];
    if (!player) {
      status.textContent = "未参与当前计算";
      return;
    }
    const chosen = player.cards.filter(Boolean);
    status.textContent = chosen.length === 2 ? "已录入 2 张手牌" : `待补全 ${2 - chosen.length} 张手牌`;
  });
}

function handRankLabel(score) {
  return HAND_CATEGORY_LABELS[score?.[0] || 0] || "高牌";
}

function handSummaryLine(icon, text) {
  return `<div class="hand-summary-line"><span class="hand-summary-icon">${icon}</span><span>${text}</span></div>`;
}

function sidePlayerOutSummary(player, field) {
  const values = Object.entries(sidePotInputState)
    .filter(([key, value]) => key.startsWith(`${player}:`) && key.endsWith(`:${field}`) && String(value).trim())
    .map(([, value]) => Number(value))
    .filter((value) => Number.isFinite(value));
  return values.length ? Math.max(...values) : 0;
}

function renderHandCalculationSummary(result, players) {
  const isDouble = document.body.classList.contains("double-mode-active");
  const labels = { turn: "\u8f6c\u724c", river: "\u6cb3\u724c" };
  const lines = [];
  if (poolMode === "side") {
    const buyers = PLAYER_KEYS.filter((key) => els.sideBuyerEnabled[key]?.checked);
    if (!buyers.length) return `<div class="hand-result-summary"><div class="hand-result-summary-heading"><span>outs 概览</span><small>\u6682\u65e0\u81ea\u52a8\u8bc6\u522b\u7684\u4fdd\u9669\u8d2d\u4e70\u8005</small></div></div>`;
    buyers.forEach((key) => {
      const auto = sideBuyerOutAnalysis[key];
      const turnOuts = clampedOutCount(sidePlayerOutSummary(key, "turnOuts") || auto?.turnOuts || 0);
      const riverOuts = clampedOutCount(sidePlayerOutSummary(key, "riverOuts") || auto?.riverOuts || 0);
      const stat = result.stats[key];
      if (!stat) return;
      const equity = result.equities?.[key] ?? (stat && result.remainingCount ? (stat.winCards.length + stat.tieCards.length / Math.max(2, players.length)) / result.remainingCount : 0);
      lines.push(handSummaryLine("✓", `${key}：${labels.turn} outs = ${turnOuts}（赔率 ${oddsLabel(oddsForOuts(turnOuts))}），${labels.river} outs = ${riverOuts}（赔率 ${oddsLabel(oddsForOuts(riverOuts))}）`));
      lines.push(handSummaryLine("▣", `${key} 最终胜率 ${(equity * 100).toFixed(1)}% · 已自动填入各池保险区`));
    });
  } else {
    const buyerKey = result.currentLeaders.length === 1 ? result.currentLeaders[0] : null;
    if (!buyerKey) return `<div class="hand-result-summary"><div class="hand-result-summary-heading"><span>outs 概览</span><small>当前为平局，暂无唯一保险购买者</small></div></div>`;
    const stat = result.stats[buyerKey];
    const rawOuts = Math.min(17, Math.max(0, stat.lossCards.length));
    const odds = oddsForOuts(rawOuts);
    const equity = result.equities?.[buyerKey] ?? (result.remainingCount ? (stat.winCards.length + stat.tieCards.length / Math.max(2, players.length)) / result.remainingCount : 0);
    const street = handAnalysis?.street === 4 || els.handStreet?.value === "turn" ? "river" : "turn";
    lines.push(handSummaryLine("✓", `${labels[street]} outs = ${rawOuts}（赔率 ${oddsLabel(odds)}），已自动填入保险区`));
    if (isDouble && street === "turn") lines.push(handSummaryLine("↗", "河牌 outs 将在转牌未爆并确认实际转牌后计算"));
    lines.push(handSummaryLine("▣", `${buyerKey} 最终胜率 ${(equity * 100).toFixed(1)}%（平局 ${(stat.tieCards.length / Math.max(result.remainingCount, 1) * 100).toFixed(1)}%）`));
  }
  return `<div class="hand-result-summary"><div class="hand-result-summary-heading"><span>outs 概览</span><small>根据当前牌面自动更新</small></div>${lines.join("")}</div>`;
}

function renderHandResults(result, players) {
  els.handAnalysisResults.classList.remove("is-empty");
  const active = new Set(players.map((player) => player.key));
  const maxRelevant = players.reduce((max, player) => {
    const stat = result.stats[player.key];
    return Math.max(max, stat.currentStatus === "领先" ? stat.lossCards.length : stat.winCards.length);
  }, 0);
  els.handDeckStatus.textContent = `已知 ${result.knownCount} 张 · 剩余 ${result.remainingCount} 张${maxRelevant > 17 ? " · 超过保险表 17 outs 上限" : ""}`;
  const resultCards = PLAYER_KEYS.map((key) => {
    const stat = result.stats[key];
    const equity = result.equities?.[key];
    if (!active.has(key)) return `<article class="hand-result-card is-inactive" data-result-player="${key}"></article>`;
    const winCount = stat.winCards.length;
    const tieCount = stat.tieCards.length;
    const relevantCount = stat.currentStatus === "领先" ? stat.lossCards.length : winCount;
    const relevantLabel = stat.currentStatus === "领先" ? "保险 outs" : "翻盘 outs";
    return `<article class="hand-result-card" data-result-player="${key}">
      ${Number.isFinite(equity) ? `<div class="hand-result-equity"><span>最终胜率</span><strong>${(equity * 100).toFixed(1)}%</strong></div>` : ""}
      <div class="hand-result-heading"><strong>${key}</strong><span>${handRankLabel(stat.currentRank)} · ${stat.currentStatus}</span></div>
      <p>按当前牌力，下一张牌的可用 outs</p>
      <div class="hand-result-values"><div><span>${relevantLabel}</span><strong>${relevantCount}</strong></div><div><span>平局 outs</span><strong class="tie-outs">${tieCount}</strong></div></div>
    </article>`;
  }).join("");
  els.handAnalysisResults.innerHTML = `${resultCards}${renderHandCalculationSummary(result, players)}`;
  const autoBuyerAvailable = poolMode === "side" || result.currentLeaders.length === 1;
  els.applyCalculatedOuts.disabled = !autoBuyerAvailable;
  els.applyCalculatedOuts.textContent = autoBuyerAvailable
    ? "↻ 重新计算 outs 并填入保险"
    : "当前平局，暂无唯一保险购买者";
}

function setHandApplyState(enabled, label = "⚡ 选择完成后，计算 outs 并填入保险") {
  if (!els.applyCalculatedOuts) return;
  els.applyCalculatedOuts.disabled = !enabled;
  els.applyCalculatedOuts.textContent = label;
}

function clearHandResults(message = "请先选择公共牌和玩家手牌") {
  handAnalysis = null;
  sideBuyerOutAnalysis = {};
  sidePoolStructureSignature = "";
  if (document.body.classList.contains("call-mode-active")) {
    callAutoAnalysis = null;
    if (els.callAutoStatus) els.callAutoStatus.textContent = message;
    calculateCall();
  }
  els.handDeckStatus.textContent = "选择牌面后点击计算 outs";
  els.handAnalysisResults.classList.add("is-empty");
  els.handAnalysisResults.innerHTML = `<div class="hand-empty-state">${message}</div>`;
  setHandApplyState(false);
}

function renderHandReadyState(board, players) {
  handAnalysis = null;
  const knownCount = board.filter(Boolean).length + players.reduce((total, player) => total + player.cards.filter(Boolean).length, 0);
  els.handDeckStatus.textContent = `已选择 ${knownCount} 张牌 · 等待计算`;
  els.handAnalysisResults.classList.add("is-empty");
  els.handAnalysisResults.innerHTML = "";
  setHandApplyState(true, document.body.classList.contains("call-mode-active") ? "⚡ 根据牌面计算 equity" : "⚡ 计算 outs 并填入保险");
  if (document.body.classList.contains("call-mode-active") && callSource === "auto" && els.callAutoStatus) {
    clearCallResult("牌面或手牌已变化，请点击“根据牌面计算 equity”");
    els.callAutoStatus.textContent = "牌面已补全，点击“根据牌面计算 equity”";
  }
}

function clampedOutCount(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(Math.max(Math.trunc(parsed), 0), 17);
}

function applyHandOuts(result, street, activePlayers, boardValues) {
  if (document.body.classList.contains("call-mode-active")) {
    updateCallFromHands();
    return;
  }
  const isDouble = document.body.classList.contains("double-mode-active");
  const target = street === 4 && isDouble ? "river" : (isDouble ? "turn" : "single");
  if (poolMode === "side") {
    const side = calculateSidePool();
    applyAutoSideBuyerState(side, boardValues, activePlayers);
    calculateSingle();
    calculateDouble();
    const summary = document.querySelector("#handAnalysisResults .hand-result-summary");
    if (summary) summary.outerHTML = renderHandCalculationSummary(result, activePlayers);
    return;
  }
  const buyers = result.currentLeaders.length === 1
    ? [activePlayers.find((player) => player.key === result.currentLeaders[0])].filter(Boolean)
    : [];
  buyers.forEach((buyer) => {
    const stat = result.stats[buyer.key];
    const count = clampedOutCount(stat.currentStatus === "领先" ? stat.lossCards.length : stat.winCards.length);
    if (target === "river") els.riverRange.value = count;
    else if (target === "turn") els.turnRange.value = count;
    else els.range.value = count;
  });
  queueDraftSave();
  if (isDouble) calculateDouble();
  else calculateSingle();
}

function insuranceDeckCounts() {
  const { street, board, players } = handInputsState();
  const known = new Set([
    ...board.filter(Boolean),
    ...players.flatMap((player) => player.cards.filter(Boolean))
  ]);
  // When hand analysis has run, its remaining deck already includes every
  // explicitly known card. In manual mode, assume the hero's two cards and
  // the full board for the selected street even if those controls are empty;
  // this preserves the conventional 47/46/45 denominators without ignoring
  // any additional known opponent cards.
  const analyzedRemaining = Number(handAnalysis?.remainingCount);
  const expectedBoard = street === 5 ? 5 : street === 4 ? 4 : 3;
  const baselineKnown = Math.max(known.size, expectedBoard + 2);
  const first = Number.isFinite(analyzedRemaining) && analyzedRemaining > 0
    ? analyzedRemaining
    : Math.max(52 - baselineKnown, 1);
  return { first, second: Math.max(first - 1, 1) };
}

function analyzeHandSituation(apply = false) {
  if (!els.handStreet || !els.boardCardInputs) return;
  updateHandPlayerVisibility();
  updatePickerButtons();
  const duplicates = refreshCardAvailability();
  if (duplicates.size) {
    clearHandResults("存在重复牌，请更换重复的牌");
    return;
  }
  const { street, board, players } = handInputsState();
  const isCall = document.body.classList.contains("call-mode-active");
  if (isCall && !apply) callAutoAnalysis = null;
  const heroKey = els.callHero?.value || "A";
  const requiredPlayers = isCall ? players.filter((player) => player.key === heroKey) : players;
  updatePlayerHandStatus(players);
  if (board.length < 3 || board.some((value) => !value)) {
    clearHandResults(street === 5 ? "请先选择完整河牌" : street === 4 ? "请先选择 4 张公共牌" : "请先选择 3 张翻牌");
    return;
  }
  const incomplete = requiredPlayers.find((player) => player.cards.some((card) => !card));
  if (incomplete) {
    clearHandResults(`请补全 ${incomplete.key} 的两张手牌`);
    return;
  }
  if (isCall) {
    if (!apply) {
      renderHandReadyState(board, requiredPlayers);
      return;
    }
    updateCallFromHands();
    return;
  }
  if (poolMode === "side" && !sideRankManuallyEdited) autoRankFromSelectedHands({ explicit: false });
  if (!apply) {
    renderHandReadyState(board, players);
    return;
  }
  const result = calculateHandOuts(board, players);
  result.equities = calculateFinalEquities(board, players);
  handAnalysis = { ...result, street, activePlayers: players.map((player) => player.key) };
  renderHandResults(result, players);
  applyHandOuts(result, street, players, board);
}

function autoRankFromSelectedHands({ explicit = true } = {}) {
  if (poolMode !== "side") return null;
  if (explicit) sideRankManuallyEdited = false;
  const { board, players } = handInputsState();
  if (board.some((value) => !value)) {
    els.sideRankNote.textContent = "请先选择至少 3 张公共牌。";
    return;
  }
  const incomplete = players.find((player) => player.cards.some((card) => !card));
  if (incomplete) {
    els.sideRankNote.textContent = `请先补全 ${incomplete.key} 的两张手牌。`;
    return;
  }
  const scored = players.map((player) => ({ key: player.key, score: evaluateBest([...board.map(parseCard), ...player.cards.map(parseCard)]) }));
  const groups = [];
  scored.slice().sort((left, right) => compareScore(right.score, left.score)).forEach((entry) => {
    const group = groups.find((item) => compareScore(item.score, entry.score) === 0);
    if (group) group.keys.push(entry.key);
    else groups.push({ score: entry.score, keys: [entry.key] });
  });
  groups.forEach((group, index) => group.keys.forEach((key) => { els.sideRankInputs[key].value = String(index + 1); }));
  const side = calculateSidePool();
  applyAutoSideBuyerState(side, board, players);
  calculateSingle();
  calculateDouble();
  els.sideRankNote.textContent = `已按当前牌面更新：${groups.map((group, index) => `${index + 1}名 ${group.keys.join("、")}`).join("；")}。`;
  queueDraftSave();
  return { board, players, side };
}

function money(value) {
  const rounded = Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  const sign = rounded < 0 ? "−" : "+";
  const absolute = Math.abs(rounded);
  const formatted = absolute.toLocaleString("zh-CN", {
    minimumFractionDigits: Number.isInteger(absolute) ? 0 : 2,
    maximumFractionDigits: 2
  });
  return `${sign}¥${formatted}`;
}

function amount(value) {
  const rounded = Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  return `¥${rounded.toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`;
}

function safeNumber(input) {
  const raw = String(input.value ?? "").trim();
  if (!numericStringIsValid(raw)) return 0;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function percentage(value) {
  return Number.isFinite(Number(value)) ? `${(Number(value) * 100).toFixed(1)}%` : "—";
}

function callStreetInfo() {
  const street = els.handStreet?.value === "river" ? 5 : els.handStreet?.value === "turn" ? 4 : 3;
  const cardsToCome = Math.max(0, 5 - street);
  return { street, turn: street === 4, cardsToCome, unknownCards: cardsToCome === 2 ? 47 : cardsToCome === 1 ? 46 : 0 };
}

function updateCallSourceUI() {
  document.querySelectorAll("[data-call-source]").forEach((button) => {
    const active = button.dataset.callSource === callSource;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  els.callManualFields?.classList.toggle("is-hidden", callSource !== "manual");
  els.callAutoFields?.classList.toggle("is-hidden", callSource !== "auto");
}

function clearCallResult(message = "填入跟注前底池、跟注金额和 outs 后显示结果。") {
  if (!els.callVerdict) return;
  els.callVerdict.textContent = "等待输入";
  els.callVerdict.className = "call-verdict is-empty";
  [els.callNextProbability, els.callRiverProbability, els.callPotOdds, els.callEquity, els.callRequiredEquity, els.callEdge, els.callExpectedValue].forEach((element) => {
    if (element) element.textContent = "—";
  });
  if (els.callPotRatio) els.callPotRatio.textContent = "—";
  if (els.callNextLabel) els.callNextLabel.textContent = "命中率";
  if (els.callRiverLabel) els.callRiverLabel.textContent = "累计命中率";
  if (els.callEquityBar) els.callEquityBar.style.width = "0%";
  if (els.callPotOddsMarker) els.callPotOddsMarker.style.left = "0%";
  if (els.callRuleOfFourResult) els.callRuleOfFourResult.classList.add("is-hidden");
  if (els.callResultNote) els.callResultNote.textContent = message;
}

function renderCallResult(metrics, { auto = false, autoResult = null } = {}) {
  if (!metrics || !els.callVerdict) return;
  const labels = { call: "值得 Call", fold: "不建议 Call", borderline: "临界" };
  els.callVerdict.textContent = labels[metrics.decision];
  els.callVerdict.className = `call-verdict ${metrics.decision}`;
  els.callNextProbability.textContent = percentage(metrics.next);
  els.callRiverProbability.textContent = percentage(metrics.byRiver);
  els.callPotOdds.textContent = percentage(metrics.potOdds);
  els.callPotRatio.textContent = metrics.potRatio === null ? "无跟注金额" : `${metrics.potRatio.toFixed(2)}:1`;
  els.callEquity.textContent = percentage(metrics.equity);
  els.callRequiredEquity.textContent = percentage(metrics.potOdds);
  els.callEdge.textContent = `${metrics.edge >= 0 ? "+" : "−"}${Math.abs(metrics.edge * 100).toFixed(1)}%`;
  els.callExpectedValue.textContent = money(metrics.ev);
  const atRiver = callStreetInfo().street === 5;
  els.callNextLabel.textContent = auto ? (atRiver ? "当前摊牌 equity" : "实际下一街 equity") : "按有效 outs";
  els.callRiverLabel.textContent = auto ? (atRiver ? "已无后续公共牌" : "实际到河牌 equity") : "累计命中率";
  els.callEquityBar.style.width = `${Math.min(100, Math.max(0, metrics.equity * 100))}%`;
  els.callPotOddsMarker.style.left = `${Math.min(100, Math.max(0, metrics.potOdds * 100))}%`;
  if (els.callRuleOfFourResult) {
    els.callRuleOfFourResult.classList.toggle("is-hidden", !els.callRuleOfFour.checked);
    els.callRuleOfFourResult.textContent = auto
      ? `四二法参考：下一张约 ${percentage(metrics.ruleOfFourNext)} · 到河牌约 ${percentage(metrics.ruleOfFourByRiver)}（仅作概率参考，不参与 equity / EV）`
      : `四二法参考：下一张约 ${percentage(metrics.ruleOfFourNext)} · 到河牌约 ${percentage(metrics.ruleOfFourByRiver)}（不参与正式结论）`;
  }
  if (auto && autoResult) {
    els.callResultNote.textContent = autoResult.mode === "random-opponent"
      ? `${autoResult.heroKey}：未录入对手手牌，按 ${autoResult.unknownOpponentCount || 1} 个未知对手座位抽样估算 equity（${autoResult.sampleCount} 次样本）。`
      : `${autoResult.heroKey}：${autoResult.currentStatus}；赢牌 outs ${autoResult.winCards.length}，平局 outs ${autoResult.tieCards.length}，按已录入手牌计算 equity。`;
  } else {
    els.callResultNote.textContent = "手动结果假设输入 outs 都是干净 outs，实际牌局可能存在脏 outs。";
  }
}

function updateCallFromHands() {
  const { board, players } = handInputsState();
  const heroKey = els.callHero?.value || "A";
  const hero = players.find((player) => player.key === heroKey);
  const partialOpponent = players.find((player) => player.key !== heroKey && player.cards.some(Boolean) && player.cards.some((card) => !card));
  if (board.length < 3 || board.some((value) => !value) || !hero || hero.cards.some((card) => !card) || partialOpponent) {
    callAutoAnalysis = null;
    if (els.callAutoStatus) els.callAutoStatus.textContent = partialOpponent ? `请补全或清空 ${partialOpponent.key} 的手牌` : "请先选择至少 3 张公共牌和我的两张手牌";
    calculateCall();
    return;
  }
  const seatCount = Math.max(players.length, 2);
  const unknownOpponentCount = players.filter((player) => player.key !== heroKey && player.cards.every((card) => !card)).length;
  // Keep empty opponent seats in the request so the core can model the
  // configured table size instead of silently reducing a 3/4-handed pot to
  // heads-up when only the hero has known cards.
  const result = calculateCallEquity(board, players, heroKey, {
    opponentCount: unknownOpponentCount,
    unknownOpponentCount,
    seatCount
  });
  callAutoAnalysis = result;
  if (els.callAutoStatus) {
    els.callAutoStatus.textContent = result
      ? result.mode === "random-opponent"
        ? `${heroKey}：未知对手随机估算 · ${result.sampleCount} 次样本`
        : `已计算 ${heroKey}：${result.currentStatus} · ${result.remainingCount} 张未知牌`
      : "牌面存在重复或无法计算，请检查选择";
  }
  calculateCall();
}

function calculateCall() {
  if (!els.callWorkspace) return;
  const info = callStreetInfo();
  const potRaw = String(els.callPot?.value ?? "").trim();
  const callRaw = String(els.callAmount?.value ?? "").trim();
  const potReady = numericStringIsValid(potRaw) && Number(potRaw) >= 0;
  const callReady = numericStringIsValid(callRaw) && Number(callRaw) >= 0;
  const pot = safeNumber(els.callPot);
  const call = safeNumber(els.callAmount);
  const invested = safeNumber(els.callInvested);
  if (els.callPotAfter) els.callPotAfter.textContent = potReady && callReady ? amount(pot + call) : "—";
  if (els.callTotalInvested) els.callTotalInvested.textContent = potReady && callReady ? amount(invested + call) : "—";
  if (els.callUnknownCards) els.callUnknownCards.textContent = callSource === "auto" && callAutoAnalysis
    ? callAutoAnalysis.mode === "random-opponent" ? `未知对手估算 · ${callAutoAnalysis.sampleCount} 次样本` : `自动计算 ${callAutoAnalysis.remainingCount} 张`
    : info.cardsToCome === 0 ? "河牌后无下一张牌" : `${info.turn ? "转牌后" : "翻牌后"}默认 ${info.unknownCards} 张`;
  if (!potReady || !callReady) {
    clearCallResult();
    return;
  }
  let outs;
  let auto = false;
  let autoResult = null;
  let equity;
  let unknownCards = info.unknownCards;
  if (callSource === "auto") {
    autoResult = callAutoAnalysis;
    if (!autoResult) {
      clearCallResult("请在上方完成手牌选择后，点击“根据牌面计算 equity”。");
      return;
    }
    auto = true;
    outs = autoResult.winCards.length;
    unknownCards = autoResult.remainingCount;
    equity = autoResult.nextEquity;
  } else {
    const parsed = parseCallOuts(els.callOuts?.value);
    if (!parsed.valid) {
      if (els.callOuts?.value.trim()) setFieldError(els.callOuts, parsed.message);
      else clearFieldError(els.callOuts);
      clearCallResult(els.callOuts?.value.trim() ? parsed.message : "请输入有效 outs 后显示结果。");
      return;
    }
    clearFieldError(els.callOuts);
    outs = parsed.value;
  }
  const metrics = calculateCallMetrics({
    potBeforeCall: pot,
    callAmount: call,
    investedBefore: invested,
    outs,
    unknownCards,
    cardsToCome: info.cardsToCome,
    equity
  });
  if (autoResult) {
    metrics.next = autoResult.nextEquity;
    metrics.byRiver = autoResult.byRiverEquity;
    metrics.equity = autoResult.nextEquity;
    metrics.edge = metrics.equity - metrics.potOdds;
    metrics.ev = metrics.equity * metrics.potBeforeCall - (1 - metrics.equity) * metrics.callAmount;
    metrics.decision = metrics.edge > 1e-9 ? "call" : metrics.edge < -1e-9 ? "fold" : "borderline";
  }
  renderCallResult(metrics, { auto, autoResult });
}

function setFieldError(input, message) {
  const field = input.closest(".field");
  const wrap = input.closest(".input-wrap, .side-outs-wrap");
  if (!field || !wrap) return;
  let error = field.querySelector(".field-error");
  if (!error) {
    error = document.createElement("small");
    error.className = "field-error";
    field.append(error);
  }
  error.textContent = message;
  error.hidden = false;
  wrap.classList.add("input-invalid");
  input.setAttribute("aria-invalid", "true");
  input.setCustomValidity(message);
}

function clearFieldError(input) {
  const field = input.closest(".field");
  const wrap = input.closest(".input-wrap, .side-outs-wrap");
  const error = field?.querySelector(".field-error");
  error?.remove();
  wrap?.classList.remove("input-invalid");
  input.removeAttribute("aria-invalid");
  input.setCustomValidity("");
}

function validateNumberInput(input, showEmpty = false) {
  const raw = String(input.value ?? "").trim();
  if (!raw && !showEmpty) {
    if (!input.dataset.limitViolation) clearFieldError(input);
    return false;
  }
  if (!numericStringIsValid(raw) || Number(raw) < 0) {
    setFieldError(input, "请输入有效的非负数字");
    return false;
  }
  if (!input.dataset.limitViolation) clearFieldError(input);
  return true;
}

function buyLimitElement(input) {
  const field = input.closest(".field");
  if (!field) return null;
  let limit = field.querySelector(".buy-limit");
  if (!limit) {
    limit = document.createElement("small");
    limit.className = "buy-limit";
    field.append(limit);
  }
  return limit;
}

function boundedBuy(input, maximum) {
  const max = Math.max(0, Number(maximum) || 0);
  const limit = buyLimitElement(input);
  const raw = String(input.value ?? "").trim();
  if (limit) {
    limit.textContent = `最多可买 ${amount(max)}`;
    limit.hidden = max <= 0 && !raw;
  }
  input.max = String(max);
  const value = safeNumber(input);
  if (raw && numericStringIsValid(raw) && value > max + 0.000001) {
    input.dataset.limitViolation = "true";
    setFieldError(input, `超过 100% 档位，最多可买 ${amount(max)}`);
    if (limit) limit.classList.add("is-over");
    return max;
  }
  delete input.dataset.limitViolation;
  if (limit) limit.classList.remove("is-over");
  if (raw && numericStringIsValid(raw)) clearFieldError(input);
  return value;
}

function formatOdds(value) {
  return Number.isInteger(value) ? String(value) : String(value).replace(/\.0$/, "");
}

function oddsLabel(odds) {
  return odds > 0 ? `${formatOdds(odds)}x` : "—";
}

function renderOddsScale(scaleElement, activeIndex) {
  scaleElement.innerHTML = ODDS.map((odds, index) => {
    const outs = index + 1;
    const active = index === activeIndex;
    return `<button type="button" class="odds-scale-item${active ? " active" : ""}" data-odds-index="${index}" aria-label="${outs} 张 outs，赔率 ${formatOdds(odds)} 倍" aria-pressed="${active}"><strong>${formatOdds(odds)}</strong><small>${outs}</small></button>`;
  }).join("");
}

function updateOddsControls(range, scale, outsElement, oddsElement, hintElement, stageName) {
  const outs = normalizedOuts(range.value, 1);
  const odds = oddsForOuts(outs);
  renderOddsScale(scale, outs > 0 ? outs - 1 : -1);
  if (scale?.classList.contains("is-disabled")) {
    scale.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
      button.setAttribute("aria-disabled", "true");
    });
  }
  if (outsElement) outsElement.textContent = outs;
  if (oddsElement) oddsElement.textContent = oddsLabel(odds);
  if (hintElement) {
    hintElement.textContent = odds > 0 ? `每买 100，${stageName}爆赔 ${amount(100 * odds).slice(1)}` : `0 outs，${stageName}不建议购买保险`;
  }
  return { outs, odds };
}

function bindOddsScale(scale, range) {
  scale?.addEventListener("click", (event) => {
    if (scale.classList.contains("is-disabled")) return;
    const button = event.target.closest("[data-odds-index]");
    if (!button || !scale.contains(button)) return;
    range.value = String(Number(button.dataset.oddsIndex) + 1);
    range.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function sideContributions() {
  const active = new Set(selectedHandPlayerKeys());
  return PLAYER_KEYS.reduce((values, key) => {
    values[key] = active.has(key) ? safeNumber(els.sidePlayerInputs[key]) : 0;
    return values;
  }, {});
}

function sideRankings() {
  return PLAYER_KEYS.reduce((values, key) => {
    const parsed = Number.parseInt(els.sideRankInputs[key].value, 10);
    values[key] = Number.isFinite(parsed) && parsed > 0 ? parsed : 4;
    return values;
  }, {});
}

function sidePotInputKey(player, potIndex, field) {
  const potId = potIndex && typeof potIndex === "object"
    ? sidePotIdentity(potIndex)
    : String(potIndex);
  return `${player}:${potId}:${field}`;
}

// Pool indexes are presentation-only: adding a contribution level can shift
// every later index. Use the contribution range as the persistent identity.
function sidePotIdentity(pot) {
  if (!pot || typeof pot !== "object") return String(pot ?? "");
  const from = Number.isFinite(Number(pot.from)) ? Number(pot.from) : 0;
  const to = Number.isFinite(Number(pot.to)) ? Number(pot.to) : from + (Number(pot.amount) || 0);
  return `${from}-${to}`;
}

function sidePotLegacyInputKey(player, pot, field) {
  return `${player}:${Number(pot?.index) || 0}:${field}`;
}

function migrateLegacySidePotState(side) {
  if (!side?.pots?.length) return;
  side.pots.forEach((pot) => {
    ["turnOuts", "turnBuy", "riverOuts", "riverBuy"].forEach((field) => {
      PLAYER_KEYS.forEach((player) => {
        const legacyKey = sidePotLegacyInputKey(player, pot, field);
        const stableKey = sidePotInputKey(player, pot, field);
        if (!Object.prototype.hasOwnProperty.call(sidePotInputState, stableKey)
          && Object.prototype.hasOwnProperty.call(sidePotInputState, legacyKey)) {
          sidePotInputState[stableKey] = sidePotInputState[legacyKey];
        }
        if (legacyKey !== stableKey) delete sidePotInputState[legacyKey];
        if (sidePotManualBuyKeys.has(legacyKey)) {
          sidePotManualBuyKeys.add(stableKey);
          sidePotManualBuyKeys.delete(legacyKey);
        }
      });
    });
  });
}

function captureSidePotInputs() {
  document.querySelectorAll("[data-side-pot-input]").forEach((input) => {
    sidePotInputState[input.dataset.sidePotInput] = input.value;
  });
}

function sidePotValue(player, potIndex, field, fallback = "") {
  const key = sidePotInputKey(player, potIndex, field);
  if (Object.prototype.hasOwnProperty.call(sidePotInputState, key)) return sidePotInputState[key];
  if (potIndex && typeof potIndex === "object") {
    const legacyKey = sidePotLegacyInputKey(player, potIndex, field);
    if (Object.prototype.hasOwnProperty.call(sidePotInputState, legacyKey)) return sidePotInputState[legacyKey];
  }
  return fallback;
}

function sanitizeSidePotOutState() {
  Object.entries(sidePotInputState).forEach(([key, value]) => {
    if (!key.endsWith(":turnOuts") && !key.endsWith(":riverOuts")) return;
    if (!String(value ?? "").trim() || Core.parseOuts(value).valid) return;
    delete sidePotInputState[key];
    const input = [...document.querySelectorAll("[data-side-pot-input]")]
      .find((candidate) => candidate.dataset.sidePotInput === key);
    if (input) {
      input.value = "";
      clearFieldError(input);
    }
  });
}

function sidePotOutDisplayValue(player, pot, field) {
  const parsed = Core.parseOuts(sidePotValue(player, pot, field));
  return parsed.valid ? String(parsed.value) : "";
}

function sideBoardStreet() {
  const boardCount = [...document.querySelectorAll('[data-card-kind="board"]')].filter((input) => input.value).length;
  const isCall = document.body.classList.contains("call-mode-active");
  if (els.handStreet?.value === "river" || (isCall && (Number(handAnalysis?.street) >= 5 || boardCount >= 5))) return 5;
  if (els.handStreet?.value === "turn" || (isCall && (Number(handAnalysis?.street) >= 4 || boardCount >= 4))) return 4;
  return 3;
}

function renderSidePotInsuranceFields(side) {
  const isDouble = document.body.classList.contains("double-mode-active");
  const boardStreet = sideBoardStreet();
  const done = boardStreet >= 5;
  const postTurnSingle = !isDouble && boardStreet === 4;
  const turnDealt = isDouble && boardStreet >= 4;
  const primaryStreet = postTurnSingle || turnDealt ? "river" : "turn";
  const primaryLabel = postTurnSingle || turnDealt ? "河牌" : "转牌";
  const showSecondary = isDouble && doubleRiverUnlocked && !turnDealt && !done;
  const signature = `${boardStreet}:${primaryStreet}:${showSecondary}:${side.pots.map((pot) => `${sidePotIdentity(pot)}:${pot.amount}:${pot.eligible.join("")}:${sidePoolLeaders(pot, side.rankings).join("")}`).join("|")}`;
  if (signature === sideBuyerMarkupSignature) return;
  sideBuyerMarkupSignature = signature;
  PLAYER_KEYS.forEach((player) => {
    const card = document.querySelector(`[data-player-card="${player}"]`);
    const host = card?.querySelector(".side-pot-insurance-fields");
    if (!host) return;
    if (done) {
      host.innerHTML = `<p class="side-pot-insurance-empty">牌已发完，保险已停止；结果按当前牌力结算。</p>`;
      return;
    }
    const rows = side.pots.map((pot) => {
      const leaders = sidePoolLeaders(pot, side.rankings);
      if (!leaders.includes(player)) return "";
      const coverage = pot.amount / leaders.length;
      const primaryOuts = sidePotOutDisplayValue(player, pot, `${primaryStreet}Outs`);
      const primaryBuy = sidePotValue(player, pot, `${primaryStreet}Buy`);
      const riverOuts = sidePotOutDisplayValue(player, pot, "riverOuts");
      const riverBuy = sidePotValue(player, pot, "riverBuy");
      const rowKey = `${player}:${pot.index}`;
      const primaryOutsKey = sidePotInputKey(player, pot, `${primaryStreet}Outs`);
      const primaryBuyKey = sidePotInputKey(player, pot, `${primaryStreet}Buy`);
      const riverOutsKey = sidePotInputKey(player, pot, "riverOuts");
      const riverBuyKey = sidePotInputKey(player, pot, "riverBuy");
      const primaryBuyLabel = sidePotManualBuyKeys.has(primaryBuyKey) ? "手动买入" : "默认 100%";
      const primaryOddsKey = `${player}:${sidePotIdentity(pot)}:${primaryStreet}`;
      const riverOddsKey = `${player}:${sidePotIdentity(pot)}:river`;
      return `<article class="side-pot-insurance-row" data-side-pot-row="${rowKey}">
        <div class="side-pot-insurance-heading"><strong>${pot.label}</strong><span>可保 ${amount(coverage)} · ${leaders.join("、")} 领先</span></div>
        <div class="side-pot-stage-grid">
          <label class="field"><span>${primaryLabel} outs / 赔率</span><div class="side-outs-wrap"><input id="side-pot-${rowKey.replace(":", "-")}-${primaryStreet}Outs" data-side-pot-input="${primaryOutsKey}" type="number" min="0" max="17" step="1" inputmode="numeric" value="${primaryOuts}" /><strong data-side-pot-odds="${primaryOddsKey}">${oddsLabel(oddsForOuts(primaryOuts))}</strong></div></label>
          <label class="field"><span>${primaryLabel}买入 <small class="side-buy-hint">${primaryBuyLabel}</small></span><div class="input-wrap"><input id="side-pot-${rowKey.replace(":", "-")}-${primaryStreet}Buy" data-side-pot-input="${primaryBuyKey}" type="number" min="0" step="1" inputmode="decimal" value="${primaryBuy}" /><span>¥</span></div></label>
           ${showSecondary ? `<label class="field side-pot-river-field"><span>河牌 outs / 赔率</span><div class="side-outs-wrap"><input id="side-pot-${rowKey.replace(":", "-")}-riverOuts" data-side-pot-input="${riverOutsKey}" type="number" min="0" max="17" step="1" inputmode="numeric" value="${riverOuts}" /><strong data-side-pot-odds="${riverOddsKey}">${oddsLabel(oddsForOuts(riverOuts))}</strong></div></label>
           <label class="field side-pot-river-field"><span>河牌买入 <small class="side-buy-hint">${sidePotManualBuyKeys.has(riverBuyKey) ? "手动买入" : "默认 100%"}</small></span><div class="input-wrap"><input id="side-pot-${rowKey.replace(":", "-")}-riverBuy" data-side-pot-input="${riverBuyKey}" type="number" min="0" step="1" inputmode="decimal" value="${riverBuy}" /><span>¥</span></div></label>` : ""}
        </div>
        <div class="side-pot-quick-values" aria-label="${pot.label}常用买入比例">
          <span>快捷</span>${[[1,"100%"],[.85,"85%"],[.75,"75%"],[.6,"60%"],[.5,"50%"]].map(([ratio,label]) => `<button type="button" data-side-pot-ratio="${ratio}" data-side-player="${player}" data-side-pot-index="${pot.index}" data-side-street="${primaryStreet}">${label}</button>`).join("")}
        </div>
         ${showSecondary ? `<div class="side-pot-quick-values side-pot-river-quick" aria-label="${pot.label}河牌常用买入比例">
          <span>河牌</span>${[[1,"100%"],[.85,"85%"],[.75,"75%"],[.6,"60%"],[.5,"50%"]].map(([ratio,label]) => `<button type="button" data-side-pot-ratio="${ratio}" data-side-player="${player}" data-side-pot-index="${pot.index}" data-side-street="river">${label}</button>`).join("")}
        </div>` : ""}
      </article>`;
    }).filter(Boolean).join("");
    host.innerHTML = rows || `<p class="side-pot-insurance-empty">当前没有可争夺的池</p>`;
  });
}

// The reference tool starts each pool at a full-coverage recommendation. Keep
// that convenience, but leave any buy field the user touched under their
// control. Recommendations are recalculated when the outs or pool coverage
// changes, so the displayed buy always matches the current odds.
function ensureSidePotBuyDefaults(side) {
  const isDouble = document.body.classList.contains("double-mode-active");
  const boardStreet = sideBoardStreet();
  if (boardStreet >= 5) return false;
  const postTurnSingle = !isDouble && boardStreet === 4;
  const turnDealt = isDouble && boardStreet >= 4;
  const stages = isDouble && !turnDealt
    ? [{ street: "turn", outs: "turnOuts", buy: "turnBuy" }, ...(doubleRiverUnlocked ? [{ street: "river", outs: "riverOuts", buy: "riverBuy" }] : [])]
    : [{ street: postTurnSingle || turnDealt ? "river" : "turn", outs: `${postTurnSingle || turnDealt ? "river" : "turn"}Outs`, buy: `${postTurnSingle || turnDealt ? "river" : "turn"}Buy` }];
  let changed = false;
  side.pots.forEach((pot) => {
    const leaders = sidePoolLeaders(pot, side.rankings);
    const coverage = pot.amount / Math.max(leaders.length, 1);
    leaders.forEach((player) => {
      stages.forEach(({ outs, buy }) => {
        const outsRaw = sidePotValue(player, pot, outs);
        const parsed = Core.parseOuts(outsRaw);
        if (!parsed.valid) return;
        const odds = oddsForOuts(parsed.value);
        const maxBuy = odds > 0 ? coverage / odds : 0;
        const buyKey = sidePotInputKey(player, pot, buy);
        if (sidePotManualBuyKeys.has(buyKey)) {
          const rawBuy = sidePotValue(player, pot, buy);
          const numericBuy = Number(rawBuy);
          if (Number.isFinite(numericBuy) && numericBuy > maxBuy + 0.000001) {
            sidePotInputState[buyKey] = String(Math.round(maxBuy * 100) / 100);
            changed = true;
          }
          return;
        }
        const recommended = parsed.value > 0 && odds > 0 ? Math.floor(maxBuy) : 0;
        const nextValue = String(recommended);
        if (sidePotValue(player, pot, buy) !== nextValue) {
          sidePotInputState[buyKey] = nextValue;
          changed = true;
        }
      });
    });
  });
  if (changed) sideBuyerMarkupSignature = "";
  return changed;
}

function updateSidePotOddsLabels() {
  document.querySelectorAll("[data-side-pot-odds]").forEach((label) => {
    const parts = label.dataset.sidePotOdds.split(":");
    const street = parts.pop();
    const potId = parts.pop();
    const player = parts.join(":");
    const input = document.querySelector(`[data-side-pot-input="${player}:${potId}:${street}Outs"]`);
    const parsed = Core.parseOuts(input?.value);
    label.textContent = parsed.valid ? oddsLabel(oddsForOuts(parsed.value)) : "—";
  });
}

function sidePotOutcome(player, pot, rankings, isDouble) {
  const leaders = sidePoolLeaders(pot, rankings);
  const boardStreet = sideBoardStreet();
  const participates = Array.isArray(pot.eligible) && pot.eligible.includes(player);
  const isLeader = leaders.includes(player);
  const coverage = isLeader ? pot.amount / Math.max(leaders.length, 1) : 0;
  const stake = Number(pot.stakeByPlayer?.[player]) || 0;
  const base = {
    label: pot.label,
    potAmount: Number(pot.amount) || 0,
    coverage,
    stake,
    leaders,
    participates,
    isLeader,
    stage: boardStreet >= 5 ? "done" : ((!isDouble && boardStreet === 4) || (isDouble && boardStreet >= 4) ? "river" : "turn"),
    status: !participates ? "not-involved" : isLeader ? "leader" : "behind"
  };
  if (!participates) {
    return {
      ...base,
      rows: [],
      expectedReceipt: 0,
      expectedDouble: 0,
      expectedNoInsurance: 0,
      totalBuy: 0,
      turnBuy: 0,
      riverBuy: 0,
      turnOuts: 0,
      riverOuts: 0,
      turnOdds: 0,
      riverOdds: 0
    };
  }
  if (boardStreet >= 5) {
    const row = isLeader
      ? { label: "牌已发完 · 本池结算", probability: 1, buy: 0, payout: 0, receipt: coverage, net: coverage - stake }
      : { label: "牌已发完 · 本池未领先", probability: 1, buy: 0, payout: 0, receipt: 0, net: -stake };
    return {
      ...base,
      rows: [row],
      expectedReceipt: row.receipt,
      expectedDouble: row.net,
      expectedNoInsurance: row.net,
      totalBuy: 0,
      turnBuy: 0,
      riverBuy: 0,
      turnOuts: 0,
      riverOuts: 0,
      turnOdds: 0,
      riverOdds: 0,
      turnProbability: 0,
      riverProbability: 0,
      bothSafeProbability: 1,
      safeProbability: 1,
      turnHitNet: row.net,
      riverHitNet: row.net,
      bothSafeNet: row.net,
      singleSafeNet: row.net
    };
  }
  // A player who is not a pool leader has no insurance receipt in this view.
  // Keeping that loss row in the same table makes the all-in P&L complete
  // instead of silently dropping side pots from the aggregate.
  if (!isLeader) {
    const row = { label: "本池未领先 · 未计翻盘（保守估计）", probability: 1, buy: 0, payout: 0, receipt: 0, net: -stake };
    return {
      ...base,
      rows: [row],
      expectedReceipt: 0,
      expectedDouble: -stake,
      expectedNoInsurance: -stake,
      totalBuy: 0,
      turnBuy: 0,
      riverBuy: 0,
      turnOuts: 0,
      riverOuts: 0,
      turnOdds: 0,
      riverOdds: 0
    };
  }
  const postTurnSingle = !isDouble && boardStreet === 4;
  const turnDealt = isDouble && boardStreet >= 4;
  const riverOnly = postTurnSingle || turnDealt;
  const primaryStreet = riverOnly ? "river" : "turn";
  const readOuts = (street) => {
    const parsed = Core.parseOuts(sidePotValue(player, pot, `${street}Outs`));
    return parsed.valid ? parsed.value : 0;
  };
  const readBuy = (street, odds) => {
    const buyKey = sidePotInputKey(player, pot, `${street}Buy`);
    const input = document.querySelector(`[data-side-pot-input="${buyKey}"]`);
    const fallback = sidePotValue(player, pot, `${street}Buy`);
    if (input) return boundedBuy(input, odds > 0 ? coverage / odds : 0);
    const max = odds > 0 ? coverage / odds : 0;
    const value = Number(fallback);
    return Number.isFinite(value) && value >= 0 ? Math.min(value, max) : 0;
  };
  const primaryOuts = readOuts(primaryStreet);
  const turnOuts = isDouble && !turnDealt ? readOuts("turn") : 0;
  const riverOuts = isDouble ? readOuts("river") : postTurnSingle ? primaryOuts : 0;
  const effectiveRiverOuts = riverOnly ? primaryOuts : riverOuts;
  const turnOdds = oddsForOuts(turnOuts);
  const doubleUnlocked = isDouble && doubleRiverUnlocked;
  const riverOdds = (doubleUnlocked || riverOnly) ? oddsForOuts(effectiveRiverOuts) : 0;
  const turnBuy = postTurnSingle || turnDealt ? 0 : readBuy(isDouble ? "turn" : primaryStreet, turnOdds);
  const riverBuy = (doubleUnlocked || riverOnly) ? readBuy("river", riverOdds) : 0;
  const { first, second } = insuranceDeckCounts();
  const boundedProbability = (outs, denominator) => denominator > 0
    ? Math.min(1, Math.max(0, Number(outs) || 0) / denominator)
    : 0;
  const turnProbability = boundedProbability(turnOuts, first);
  const riverConditionalProbability = boundedProbability(effectiveRiverOuts, riverOnly ? first : second);
  const riverProbability = doubleUnlocked
    ? (1 - turnProbability) * riverConditionalProbability
    : 0;
  const bothSafeProbability = doubleUnlocked
    ? (1 - turnProbability) * (1 - riverConditionalProbability)
    : 0;
  const makeRow = (label, probability, buy, payout, receipt) => ({
    label,
    probability,
    buy,
    payout,
    receipt,
    net: receipt - stake
  });
  let rows;
  let safeProbability;
  if (riverOnly) {
    const hitProbability = boundedProbability(effectiveRiverOuts, first);
    safeProbability = 1 - hitProbability;
    rows = [
      makeRow("河牌爆保险", hitProbability, riverBuy, riverBuy * riverOdds, riverBuy * riverOdds),
      makeRow("河牌安全", safeProbability, riverBuy, 0, coverage - riverBuy)
    ];
  } else if (isDouble && doubleUnlocked) {
    rows = [
      makeRow("转牌爆保险（终局）", turnProbability, turnBuy, turnBuy * turnOdds, turnBuy * turnOdds),
      makeRow("转牌安全 · 河牌爆保险", riverProbability, turnBuy + riverBuy, riverBuy * riverOdds, riverBuy * riverOdds - turnBuy),
      makeRow("转牌河牌双安全", bothSafeProbability, turnBuy + riverBuy, 0, coverage - turnBuy - riverBuy)
    ];
    safeProbability = bothSafeProbability;
  } else if (isDouble) {
    safeProbability = 1 - turnProbability;
    rows = [
      makeRow("转牌爆保险（终局）", turnProbability, turnBuy, turnBuy * turnOdds, turnBuy * turnOdds),
      makeRow("转牌安全 · 等待河牌（暂估）", safeProbability, turnBuy, 0, coverage - turnBuy)
    ];
  } else {
    const hitProbability = postTurnSingle ? boundedProbability(riverOuts, first) : turnProbability;
    const buy = postTurnSingle ? riverBuy : turnBuy;
    const odds = postTurnSingle ? riverOdds : turnOdds;
    const streetLabel = postTurnSingle ? "河牌" : "转牌";
    safeProbability = 1 - hitProbability;
    rows = [
      makeRow(`${streetLabel}爆保险`, hitProbability, buy, buy * odds, buy * odds),
      makeRow(`${streetLabel}安全`, safeProbability, buy, 0, coverage - buy)
    ];
  }
  const expectedReceipt = rows.reduce((sum, row) => sum + row.probability * row.receipt, 0);
  const expectedDouble = expectedReceipt - stake;
  const expectedNoInsurance = safeProbability * coverage - stake;
  return {
    ...base,
    rows,
    expectedReceipt,
    expectedDouble,
    expectedNoInsurance,
    totalBuy: turnBuy + riverBuy,
    turnBuy,
    riverBuy,
    turnOdds,
    riverOdds,
    turnOuts,
    riverOuts,
    turnProbability,
    riverProbability,
    bothSafeProbability,
    safeProbability,
    turnHitNet: rows[0]?.net || -stake,
    riverHitNet: rows[1]?.net || -stake,
    bothSafeNet: rows[2]?.net || rows[1]?.net || -stake,
    singleSafeNet: rows[rows.length - 1]?.net || -stake
  };
}

function renderSideOutcomeTable(outcome) {
  if (!outcome.rows.length) return "";
  const roleLabel = outcome.isLeader
    ? `可保 ${amount(outcome.coverage)} · 本池投入 ${amount(outcome.stake)}`
    : `本池未领先 · 本池投入 ${amount(outcome.stake)}`;
  const outsLabel = outcome.isLeader
    ? outcome.stage === "done"
      ? "牌已发完 · 不再买保险"
      : outcome.stage === "river"
      ? `河牌 ${outcome.riverOuts} outs / ${oddsLabel(outcome.riverOdds)}`
      : `转牌 ${outcome.turnOuts} outs / ${oddsLabel(outcome.turnOdds)}${outcome.riverOdds ? ` · 河牌 ${outcome.riverOuts} outs / ${oddsLabel(outcome.riverOdds)}` : ""}`
    : "保险买入为 0";
  const rows = outcome.rows.map((row) => `
    <tr>
      <td>${row.label}</td>
      <td>${percentage(row.probability)}</td>
      <td>${row.buy > 0 ? amount(row.buy) : "—"}</td>
      <td>${row.receipt > 0 ? amount(row.receipt) : row.receipt < 0 ? money(row.receipt) : "—"}${row.payout > 0 && Math.abs(row.payout - row.receipt) > 0.000001 ? `<small class="side-result-cell-note">赔付 ${amount(row.payout)}</small>` : ""}</td>
      <td class="${resultClass(row.net)}">${money(row.net)}</td>
    </tr>`).join("");
  return `<section class="side-result-pot">
    <div class="side-result-pot-heading"><strong>${outcome.label} · ${amount(outcome.potAmount)}</strong><span>${roleLabel}</span></div>
    <div class="side-result-pot-note">${outsLabel} · 计划买入 ${amount(outcome.totalBuy)}</div>
    <div class="side-result-table-wrap"><table class="side-result-table">
      <thead><tr><th>情形</th><th>概率</th><th>买入</th><th>实收</th><th>净盈亏</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <div class="side-result-pot-expected"><span>本池期望净盈亏</span><strong class="${resultClass(outcome.expectedDouble)}">${money(outcome.expectedDouble)}</strong><small>${outcome.isLeader ? `不买保险（当前领先假设）${money(outcome.expectedNoInsurance)}` : `未计翻盘的保守值 ${money(outcome.expectedNoInsurance)}`}</small></div>
  </section>`;
}

function sideResultCard(key, side, effectiveStake, isDouble) {
  // Include every pool the player entered. A leader gets insurance scenarios;
  // a non-leader gets an explicit zero-receipt row so the all-in total is not
  // accidentally overstated by dropping losing side pots.
  const outcomes = side.pots
    .filter((pot) => pot.eligible?.includes(key))
    .map((pot) => sidePotOutcome(key, pot, side.rankings, isDouble));
  const contribution = Number(side.contributions[key]) || 0;
  const returned = Math.max(0, contribution - (Number(effectiveStake) || 0));
  const totalBuy = outcomes.reduce((total, outcome) => total + outcome.totalBuy, 0);
  const coverage = outcomes.reduce((total, outcome) => total + (outcome.isLeader ? outcome.coverage : 0), 0);
  const expectedReceipt = returned + outcomes.reduce((total, outcome) => total + outcome.expectedReceipt, 0);
  const expectedNoReceipt = returned + outcomes.reduce((total, outcome) => total + (outcome.expectedNoInsurance + outcome.stake), 0);
  const expected = expectedReceipt - contribution;
  const expectedNoInsurance = expectedNoReceipt - contribution;
  const worstGross = returned + outcomes.reduce((total, outcome) => total + (outcome.rows.length ? Math.min(...outcome.rows.map((row) => row.receipt)) : 0), 0);
  const bestGross = returned + outcomes.reduce((total, outcome) => total + (outcome.rows.length ? Math.max(...outcome.rows.map((row) => row.receipt)) : 0), 0);
  const worst = worstGross - contribution;
  const best = bestGross - contribution;
  return `<article class="side-result-card">
    <div class="side-result-heading"><strong>${key} · 最终结算</strong><span>逐池独立结算 · 最差/最好为逐池边界</span></div>
    <div class="side-result-overview-grid">
      <div><span>全押投入</span><strong>${amount(contribution)}</strong></div>
      <div><span>实际入池${returned > 0 ? ` · 退回 ${amount(returned)}` : ""}</span><strong>${amount(effectiveStake)}</strong></div>
      <div><span>计划保险买入</span><strong>${amount(totalBuy)}</strong></div>
      <div><span>可保池合计</span><strong>${amount(coverage)}</strong></div>
    </div>
    <div class="side-result-range"><span>最差净盈亏 <strong class="${resultClass(worst)}">${money(worst)}</strong></span><span>最好净盈亏 <strong class="${resultClass(best)}">${money(best)}</strong></span></div>
    <div class="side-result-expected"><span>期望净盈亏</span><strong class="${resultClass(expected)}">${money(expected)}</strong><small>不买保险（当前领先假设）${money(expectedNoInsurance)} · 保险配置差额 ${money(expected - expectedNoInsurance)}</small></div>
    <div class="side-result-pots">${outcomes.length ? outcomes.map(renderSideOutcomeTable).join("") : `<div class="side-empty-results">暂无参与的底池</div>`}</div>
  </article>`;
}

function renderSideBuyerResults(side, coverageByPlayer, effectiveStakes) {
  const isDouble = document.body.classList.contains("double-mode-active");
  const enabled = PLAYER_KEYS.filter((key) => els.sideBuyerEnabled[key].checked && coverageByPlayer[key] > 0);
  els.sideBuyerResults.innerHTML = enabled.length
    ? enabled.map((key) => sideResultCard(key, side, effectiveStakes[key], isDouble)).join("")
    : `<div class="side-empty-results">请至少勾选一个有可保金额的玩家</div>`;
}

function calculateSidePool({ capture = true } = {}) {
  if (capture) captureSidePotInputs();
  const contributions = sideContributions();
  const rankings = sideRankings();
  const { pots, highest, returned } = buildSidePots(contributions);
  const effectiveStakes = sideEffectiveStakes(contributions, highest, returned);
  const coverageByPlayer = sideCoverageByPlayer(pots, rankings);
  const totalPool = pots.reduce((total, pot) => total + pot.amount, 0);
  const coveredPlayers = PLAYER_KEYS.filter((key) => coverageByPlayer[key] > 0);
  const side = { contributions, pots, rankings, coverageByPlayer, effectiveStakes, totalPool, returned };
  migrateLegacySidePotState(side);
  sanitizeSidePotOutState();
  const structureSignature = `${pots.map((pot) => `${sidePotIdentity(pot)}:${pot.eligible.join("")}`).join("|")}::${PLAYER_KEYS.map((key) => rankings[key]).join(",")}`;
  if (structureSignature !== sidePoolStructureSignature) {
    sideBuyerOutAnalysis = {};
    sidePoolStructureSignature = structureSignature;
  }

  if (els.sideSummaryTotal) els.sideSummaryTotal.textContent = amount(totalPool);
  if (els.sideSummaryReturned) els.sideSummaryReturned.textContent = amount(returned);
  if (els.sideSummaryBuyers) {
    els.sideSummaryBuyers.textContent = coveredPlayers.length
      ? coveredPlayers.map((key) => `${key} ${amount(coverageByPlayer[key])}`).join(" · ")
      : "—";
  }
  els.sidePoolRows.innerHTML = pots.length
    ? pots.map((pot) => {
      const leaders = sidePoolLeaders(pot, rankings);
      return `<tr><td>${pot.label}</td><td>${amount(pot.amount)}</td><td>${pot.eligible.join("、")}</td><td>${leaders.join("、")} · ${amount(pot.amount / Math.max(leaders.length, 1))}</td></tr>`;
    }).join("")
    : `<tr><td colspan="4">请输入至少两名玩家的投入</td></tr>`;
  ensureSidePotBuyDefaults(side);
  renderSidePotInsuranceFields(side);
  updateSidePotOddsLabels();
  PLAYER_KEYS.forEach((key) => {
    els.sideCoverage[key].textContent = `可保 ${amount(coverageByPlayer[key])}`;
    els.sideBuyerEnabled[key].disabled = coverageByPlayer[key] <= 0;
    els.sideBuyerEnabled[key].closest(".side-buyer-card").classList.toggle("is-unavailable", coverageByPlayer[key] <= 0);
  });
  renderSideBuyerResults(side, coverageByPlayer, effectiveStakes);
  return side;
}

function applyAutoSideBuyerState(side, boardValues, players) {
  if (poolMode !== "side") return;
  const boardStreet = sideBoardStreet();
  if (boardStreet >= 5) {
    sideBuyerOutAnalysis = {};
    Object.keys(sidePotInputState).forEach((key) => {
      if (key.endsWith(":turnOuts") || key.endsWith(":riverOuts")) delete sidePotInputState[key];
    });
    PLAYER_KEYS.forEach((key) => { els.sideBuyerEnabled[key].checked = false; });
    sideBuyerMarkupSignature = "";
    calculateSidePool({ capture: false });
    queueDraftSave();
    return;
  }
  const autoOuts = calculateSideBuyerOuts(side, boardValues, players);
  sideBuyerOutAnalysis = autoOuts;
  const street = boardStreet === 4 ? 4 : 3;

  // Per-pot outs are the source of truth. Clear stale automatic values first,
  // then derive the aggregate buyer fields from the fresh per-pot analysis.
  Object.keys(sidePotInputState).forEach((key) => {
    if (key.endsWith(":turnOuts") || key.endsWith(":riverOuts")) delete sidePotInputState[key];
  });
  PLAYER_KEYS.forEach((key) => {
    const auto = autoOuts[key];
    const canBuy = side.coverageByPlayer[key] > 0 && Boolean(auto) && (auto.turnOuts > 0 || auto.riverOuts > 0);
    els.sideBuyerEnabled[key].checked = canBuy;
    auto?.pools?.forEach((pool) => {
      const pot = side.pots.find((item) => item.index === pool.potIndex);
      if (!pot) return;
      const field = street === 3 ? "turnOuts" : "riverOuts";
      const rawOuts = street === 3 ? pool.turnOuts : pool.riverOuts;
      const safeOuts = Math.min(Math.max(Math.trunc(Number(rawOuts) || 0), 0), 17);
      sidePotInputState[sidePotInputKey(key, pot, field)] = canBuy
        ? String(safeOuts)
        : "";
    });
  });
  sideBuyerMarkupSignature = "";
  calculateSidePool({ capture: false });
  queueDraftSave();
}

function getBaseAmounts(potInput, stakeInput) {
  if (poolMode === "side") {
    const side = calculateSidePool();
    const fallbackBuyer = PLAYER_KEYS.find((key) => side.coverageByPlayer[key] > 0) || "A";
    return { pot: side.coverageByPlayer[fallbackBuyer], stake: side.effectiveStakes[fallbackBuyer] };
  }
  return { pot: safeNumber(potInput), stake: safeNumber(stakeInput) };
}

function resultClass(value) {
  return value >= 0 ? "positive" : "negative";
}

function singleRow(label, buy, noHit, hit, custom = false) {
  const ratioLabel = custom ? "自定义" : label;
  return `<tr class="${custom ? "custom-row" : ""}">
    <td class="ratio-cell">${ratioLabel}</td>
    <td class="buy-cell">${amount(buy)}</td>
    <td class="${resultClass(noHit)}">${money(noHit)}</td>
    <td class="${resultClass(hit)}">${money(hit)}</td>
  </tr>`;
}

function calculateSingle() {
  const { outs, odds } = updateOddsControls(els.range, els.oddsScale, null, els.oddsValue, els.oddsHint, "保险");
  const { pot, stake } = getBaseAmounts(els.pot, els.stake);
  const hasAmounts = pot > 0 || stake > 0;
  const customBuy = boundedBuy(els.customBuy, odds > 0 ? pot / odds : 0);
  const mainWin = pot - stake;
  const mainLoss = -stake;
  const hitNet = mainLoss + customBuy * odds;
  const safeNet = mainWin - customBuy;

  els.summaryOuts.textContent = outs;
  els.summaryOdds.textContent = oddsLabel(odds);
  els.hitNet.textContent = hasAmounts ? money(hitNet) : "—";
  els.hitNet.classList.toggle("positive", hitNet >= 0);
  els.hitNet.classList.toggle("negative", hitNet < 0);
  els.customBuyValue.textContent = hasAmounts ? amount(customBuy) : "—";
  els.safeNet.textContent = hasAmounts ? money(safeNet) : "—";
  els.safeNet.classList.toggle("positive", safeNet >= 0);
  els.safeNet.classList.toggle("negative", safeNet < 0);
  els.customPayout.textContent = hasAmounts ? amount(customBuy * odds) : "—";

  const rows = !hasAmounts
    ? `<tr><td colspan="4" class="table-empty">请输入底池大小和个人投入后显示结果</td></tr>`
    : odds > 0
    ? RATIOS.map((ratio) => {
      const buy = pot * ratio / odds;
      return singleRow(`${Math.round(ratio * 100)}%`, buy, mainWin - buy, mainLoss + buy * odds);
    })
    : [singleRow("0 outs", 0, mainWin, mainLoss)];
  if (hasAmounts) rows.push(singleRow("", customBuy, safeNet, hitNet, true));
  els.resultRows.innerHTML = Array.isArray(rows) ? rows.join("") : rows;
}

function doubleRow(label, turnBuy, riverBuy, payout, net, hit = false) {
  return `<tr class="${hit ? "double-hit-row" : ""}">
    <td class="ratio-cell">${label}</td>
    <td class="buy-cell">${turnBuy}</td>
    <td class="buy-cell">${riverBuy}</td>
    <td class="${hit ? "positive" : "muted-value"}">${payout}</td>
    <td class="${resultClass(net)}">${money(net)}</td>
  </tr>`;
}

function calculateDouble() {
  updateDoubleStageUI();
  const turn = updateOddsControls(els.turnRange, els.turnScale, els.turnOuts, els.turnOdds, els.turnHint, "转牌");
  const river = doubleRiverUnlocked
    ? updateOddsControls(els.riverRange, els.riverScale, els.riverOuts, els.riverOdds, els.riverHint, "河牌")
    : { outs: 0, odds: 0 };
  // updateOddsControls rebuilds the scale buttons, so apply the lock state
  // once more to the newly created controls.
  updateDoubleStageUI();
  const { pot, stake } = getBaseAmounts(els.doublePot, els.doubleStake);
  const hasAmounts = pot > 0 || stake > 0;
  const turnBuy = boundedBuy(els.turnBuy, turn.odds > 0 ? pot / turn.odds : 0);
  const riverBuy = doubleRiverUnlocked ? boundedBuy(els.riverBuy, river.odds > 0 ? pot / river.odds : 0) : 0;
  const turnPayout = turnBuy * turn.odds;
  const riverPayout = riverBuy * river.odds;
  const { first, second } = insuranceDeckCounts();
  const turnHitProbability = turn.odds > 0 ? turn.outs / first : 0;
  const riverHitProbability = doubleRiverUnlocked && river.odds > 0 ? (1 - turnHitProbability) * river.outs / second : 0;
  const bothSafeProbability = doubleRiverUnlocked ? (1 - turnHitProbability) * (river.odds > 0 ? 1 - river.outs / second : 1) : 0;
  const turnHitNet = -stake + turnPayout;
  const riverHitNet = -stake - turnBuy + riverPayout;
  const bothSafeNet = pot - stake - turnBuy - riverBuy;
  const expectedNet = doubleRiverUnlocked ? turnHitProbability * turnHitNet
    + riverHitProbability * riverHitNet
    + bothSafeProbability * bothSafeNet : turnHitProbability * turnHitNet + (1 - turnHitProbability) * (pot - stake - turnBuy);
  const noInsuranceExpected = turnHitProbability * (-stake)
    + (doubleRiverUnlocked ? riverHitProbability * (-stake) + bothSafeProbability * (pot - stake) : (1 - turnHitProbability) * (pot - stake));
  const turnOnlyExpected = turnHitProbability * turnHitNet
    + (1 - turnHitProbability) * (pot - stake - turnBuy);

  els.turnPayout.textContent = hasAmounts ? amount(turnPayout) : "—";
  els.riverPayout.textContent = doubleRiverUnlocked && hasAmounts ? amount(riverPayout) : "—";
  els.doubleSummaryOdds.textContent = doubleRiverUnlocked ? `转牌 ${turn.outs} outs · 河牌 ${river.outs} outs` : `转牌 ${turn.outs} outs · 河牌待计算`;
  els.doubleTurnProbability.textContent = percentage(turnHitProbability);
  els.doubleRiverProbability.textContent = doubleRiverUnlocked ? percentage(riverHitProbability) : "—";
  els.doubleBothSafeProbability.textContent = doubleRiverUnlocked ? percentage(bothSafeProbability) : "—";
  els.doubleTurnMeter.style.width = `${turnHitProbability * 100}%`;
  els.doubleRiverMeter.style.width = doubleRiverUnlocked ? `${riverHitProbability * 100}%` : "0%";
  els.doubleBothSafeMeter.style.width = doubleRiverUnlocked ? `${bothSafeProbability * 100}%` : "0%";
  els.doubleExpectedValue.textContent = hasAmounts ? money(expectedNet) : "—";
  els.doubleExpectedValue.classList.toggle("positive", expectedNet >= 0);
  els.doubleExpectedValue.classList.toggle("negative", expectedNet < 0);
  const strategies = [
    { label: "不买保险", value: noInsuranceExpected },
    { label: "只买转牌", value: turnOnlyExpected },
    ...(doubleRiverUnlocked ? [{ label: "两街都买", value: expectedNet }] : [])
  ];
  const bestStrategy = Math.max(...strategies.map((strategy) => strategy.value));
  if (els.doubleStrategyRows) {
    els.doubleStrategyRows.innerHTML = hasAmounts ? strategies.map((strategy) => `
      <div class="strategy-ev-card ${Math.abs(strategy.value - bestStrategy) < 0.005 ? "is-best" : ""}">
        <span>${strategy.label}${Math.abs(strategy.value - bestStrategy) < 0.005 ? " · 最优" : ""}</span>
        <strong class="${resultClass(strategy.value)}">${money(strategy.value)}</strong>
        <small>相比不买 ${money(strategy.value - noInsuranceExpected)}</small>
      </div>`).join("") : `<div class="strategy-empty">请输入底池大小和个人投入后显示对比</div>`;
  }

  els.doubleRows.innerHTML = hasAmounts ? (doubleRiverUnlocked ? [
    doubleRow("转牌爆保险", amount(turnBuy), "不买", amount(turnPayout), turnHitNet, true),
    doubleRow("河牌爆保险", amount(turnBuy), amount(riverBuy), amount(riverPayout), riverHitNet, true),
    doubleRow("两次都不爆", amount(turnBuy), amount(riverBuy), amount(0), bothSafeNet)
  ].join("") : [
    doubleRow("转牌爆保险", amount(turnBuy), "不买", amount(turnPayout), turnHitNet, true),
    doubleRow("转牌未爆 · 等待河牌", amount(turnBuy), "待计算", "—", pot - stake - turnBuy)
  ].join("")) : `<tr><td colspan="5" class="table-empty">请输入底池大小和个人投入后显示结果</td></tr>`;
}

function reset() {
  window.clearTimeout(draftSaveTimer);
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* storage is optional */ }
  doubleRiverUnlocked = false;
  callSource = "manual";
  callAutoAnalysis = null;
  [els.pot, els.doublePot, els.stake, els.doubleStake, els.customBuy, els.turnBuy, els.riverBuy].forEach((input) => { input.value = ""; });
  [els.callInvested, els.callPot, els.callAmount, els.callOuts].forEach((input) => { if (input) input.value = ""; });
  if (els.callHero) els.callHero.value = "A";
  if (els.callRuleOfFour) els.callRuleOfFour.checked = false;
  PLAYER_KEYS.forEach((key) => {
    els.sidePlayerInputs[key].value = "";
  });
  els.sideRankInputs.A.value = 2;
  els.sideRankInputs.B.value = 3;
  els.sideRankInputs.C.value = 1;
  els.sideRankInputs.D.value = 4;
  PLAYER_KEYS.forEach((key) => { els.sideBuyerEnabled[key].checked = false; });
  els.range.value = 9;
  els.turnRange.value = 9;
  els.riverRange.value = 8;
  els.handPlayerCount.value = 2;
  els.handStreet.value = document.body.classList.contains("double-mode-active") || document.body.classList.contains("call-mode-active") ? "flop" : "turn";
  document.querySelectorAll("[data-card-kind]").forEach((input) => { input.value = ""; });
  document.querySelectorAll('input[type="number"]').forEach((input) => {
    delete input.dataset.limitViolation;
    clearFieldError(input);
  });
  singlePoolSnapshot = null;
  sideBuyerOutAnalysis = {};
  sidePoolStructureSignature = "";
  sidePotInputState = {};
  sidePotManualBuyKeys = new Set();
  sideRankManuallyEdited = false;
  sideBuyerMarkupSignature = "";
  setPoolMode("single");
  // setPoolMode recalculates once while hiding the side panel; clear the
  // dynamic fields again so an old draft cannot be captured back into state.
  sideBuyerOutAnalysis = {};
  sidePoolStructureSignature = "";
  sidePotInputState = {};
  sidePotManualBuyKeys = new Set();
  sideBuyerMarkupSignature = "";
  document.querySelectorAll("[data-side-pot-input]").forEach((input) => { input.value = ""; });
  updateCallSourceUI();
  updateHandStreetSummary();
  calculateSingle();
  calculateDouble();
  calculateCall();
  analyzeHandSituation(false);
  window.clearTimeout(draftSaveTimer);
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* storage is optional */ }
}

function setPoolMode(mode) {
  const nextMode = mode === "side" ? "side" : "single";
  if (nextMode === "side" && poolMode !== "side") {
    singlePoolSnapshot = { pot: els.pot.value, stake: els.stake.value };
  }
  if (nextMode === "single" && poolMode === "side" && singlePoolSnapshot) {
    els.pot.value = singlePoolSnapshot.pot;
    els.stake.value = singlePoolSnapshot.stake;
    els.doublePot.value = singlePoolSnapshot.pot;
    els.doubleStake.value = singlePoolSnapshot.stake;
  }
  poolMode = nextMode;
  const isSide = poolMode === "side";
  document.body.classList.toggle("pool-mode-side", isSide);
  els.sidePotPanel.classList.toggle("is-hidden", !isSide);
  els.poolModeButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.poolMode === poolMode));
  els.handPlayerCount.disabled = false;
  updateHandPlayerVisibility();
  const side = calculateSidePool();
  if (isSide) {
    const fallbackBuyer = PLAYER_KEYS.find((key) => side.coverageByPlayer[key] > 0) || "A";
    els.pot.value = side.coverageByPlayer[fallbackBuyer];
    els.stake.value = side.effectiveStakes[fallbackBuyer];
    els.doublePot.value = side.coverageByPlayer[fallbackBuyer];
    els.doubleStake.value = side.effectiveStakes[fallbackBuyer];
  }
  if (els.doubleWorkspace.classList.contains("is-hidden")) calculateSingle();
  else calculateDouble();
  analyzeHandSituation(false);
  queueDraftSave();
}

function setMode(mode) {
  const isCall = mode === "call";
  const isDouble = mode === "double";
  document.body.classList.toggle("double-mode-active", isDouble);
  document.body.classList.toggle("call-mode-active", isCall);
  syncHandStreetToMode(isDouble);
  els.singleWorkspace.classList.toggle("is-hidden", isDouble);
  els.doubleWorkspace.classList.toggle("is-hidden", !isDouble);
  els.callWorkspace.classList.toggle("is-hidden", !isCall);
  els.modeButtons.forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  // Mode changes also change which dynamic side-pot stages are editable.
  // Re-render them before the hand panel's incomplete-state early return.
  if (poolMode === "side") calculateSidePool({ capture: false });
  if (isDouble) calculateDouble();
  else if (isCall) calculateCall();
  else calculateSingle();
  if (poolMode === "side") calculateSidePool({ capture: false });
  updateCallSourceUI();
  analyzeHandSituation(false);
  queueDraftSave();
}

function writeCopy(button, text) {
  const original = button.textContent;
  if (!navigator.clipboard?.writeText) return;
  navigator.clipboard.writeText(text).then(() => {
    button.textContent = "已复制";
    setTimeout(() => { button.textContent = original; }, 1300);
  }).catch(() => {
    button.textContent = "复制失败";
    setTimeout(() => { button.textContent = original; }, 1300);
  });
}

function copySingleResults() {
  const outs = normalizedOuts(els.range.value, 1);
  const odds = oddsForOuts(outs);
  const { pot, stake } = getBaseAmounts(els.pot, els.stake);
  const customBuy = boundedBuy(els.customBuy, odds > 0 ? pot / odds : 0);
  writeCopy(els.copy, [
    "德州保险盈利计算器",
    `底池 ${amount(pot)}，个人投入 ${amount(stake)}，${outs} 张 outs，赔率 ${oddsLabel(odds)}`,
    `自定义买入 ${amount(customBuy)}：不爆 ${money(pot - stake - customBuy)}，爆保险 ${money(-stake + customBuy * odds)}`
  ].join("\n"));
}

function copyDoubleResults() {
  const { pot, stake } = getBaseAmounts(els.doublePot, els.doubleStake);
  const turnOuts = normalizedOuts(els.turnRange.value, 1);
  const riverOuts = normalizedOuts(els.riverRange.value, 1);
  const turnOdds = oddsForOuts(turnOuts);
  const riverOdds = oddsForOuts(riverOuts);
  const turnBuy = boundedBuy(els.turnBuy, turnOdds > 0 ? pot / turnOdds : 0);
  const riverBuy = boundedBuy(els.riverBuy, riverOdds > 0 ? pot / riverOdds : 0);
  writeCopy(els.doubleCopy, [
    "德州保险盈利计算器 / 两次保险",
    `底池 ${amount(pot)}，个人投入 ${amount(stake)}`,
    `转牌买入 ${amount(turnBuy)}（${oddsLabel(turnOdds)}），河牌买入 ${amount(riverBuy)}（${oddsLabel(riverOdds)}）`,
    `转牌爆 ${money(-stake + turnBuy * turnOdds)}；河牌爆 ${money(-stake - turnBuy + riverBuy * riverOdds)}；两次不爆 ${money(pot - stake - turnBuy - riverBuy)}`
  ].join("\n"));
}

bindOddsScale(els.oddsScale, els.range);
bindOddsScale(els.turnScale, els.turnRange);
bindOddsScale(els.riverScale, els.riverRange);
els.range.addEventListener("input", calculateSingle);
els.customBuy.addEventListener("input", calculateSingle);
els.pot.addEventListener("input", () => {
  els.doublePot.value = els.pot.value;
  calculateSingle();
});
els.stake.addEventListener("input", () => {
  els.doubleStake.value = els.stake.value;
  calculateSingle();
});
els.turnRange.addEventListener("input", calculateDouble);
els.riverRange.addEventListener("input", calculateDouble);
els.turnBuy.addEventListener("input", calculateDouble);
els.riverBuy.addEventListener("input", calculateDouble);
els.doublePot.addEventListener("input", () => {
  els.pot.value = els.doublePot.value;
  calculateDouble();
});
els.doubleStake.addEventListener("input", () => {
  els.stake.value = els.doubleStake.value;
  calculateDouble();
});
Object.values(els.sidePlayerInputs).forEach((input) => {
  input.addEventListener("input", () => {
    updateHandPlayerVisibility();
    calculateSidePool();
    calculateSingle();
    calculateDouble();
    analyzeHandSituation(false);
  });
});
Object.values(els.sideRankInputs).forEach((input) => {
  input.addEventListener("change", () => {
    sideRankManuallyEdited = true;
    calculateSidePool();
    calculateSingle();
    calculateDouble();
    queueDraftSave();
  });
});
Object.values(els.sideBuyerEnabled).forEach((input) => {
  input.addEventListener("change", () => {
    calculateSidePool();
    queueDraftSave();
  });
});
els.sidePotPanel.addEventListener("input", (event) => {
  const input = event.target.closest("[data-side-pot-input]");
  if (!input) return;
  if (input.dataset.sidePotInput.endsWith(":turnBuy") || input.dataset.sidePotInput.endsWith(":riverBuy")) {
    sidePotManualBuyKeys.add(input.dataset.sidePotInput);
    const hint = input.closest(".field")?.querySelector(".side-buy-hint");
    if (hint) hint.textContent = "手动买入";
  }
  if (input.dataset.sidePotInput.endsWith(":turnOuts") || input.dataset.sidePotInput.endsWith(":riverOuts")) {
    const parsed = Core.parseOuts(input.value);
    if (!parsed.valid && input.value.trim()) setFieldError(input, parsed.message);
    else clearFieldError(input);
  }
  calculateSidePool();
  queueDraftSave();
});
els.sidePotPanel.addEventListener("click", (event) => {
  const button = event.target.closest("[data-side-pot-ratio]");
  if (!button) return;
  const player = button.dataset.sidePlayer;
  const potIndex = Number(button.dataset.sidePotIndex);
  const street = button.dataset.sideStreet;
  const side = calculateSidePool();
  const pot = side.pots.find((item) => item.index === potIndex);
  if (!pot) return;
  const leaders = sidePoolLeaders(pot, side.rankings);
  const coverage = leaders.includes(player) ? pot.amount / leaders.length : 0;
  const outsValue = sidePotValue(player, pot, `${street}Outs`);
  const parsed = Core.parseOuts(outsValue);
  const odds = parsed.valid ? oddsForOuts(parsed.value) : 0;
  const buyKey = sidePotInputKey(player, pot, `${street}Buy`);
  sidePotManualBuyKeys.add(buyKey);
  const buyValue = coverage > 0 && odds > 0
    ? String(Math.floor((coverage / odds) * Number(button.dataset.sidePotRatio)))
    : "";
  sidePotInputState[buyKey] = buyValue;
  const buyInput = document.querySelector(`[data-side-pot-input="${buyKey}"]`);
  if (buyInput) buyInput.value = buyValue;
  calculateSidePool({ capture: false });
  queueDraftSave();
});
els.handPlayerCount.addEventListener("change", () => {
  updateHandPlayerVisibility();
  if (poolMode === "side") {
    const side = calculateSidePool();
    const fallbackBuyer = PLAYER_KEYS.find((key) => side.coverageByPlayer[key] > 0) || "A";
    els.pot.value = side.coverageByPlayer[fallbackBuyer];
    els.stake.value = side.effectiveStakes[fallbackBuyer];
    els.doublePot.value = side.coverageByPlayer[fallbackBuyer];
    els.doubleStake.value = side.effectiveStakes[fallbackBuyer];
    calculateSingle();
    calculateDouble();
  }
  analyzeHandSituation(false);
  queueDraftSave();
});
els.handStreet.addEventListener("change", () => {
  if (els.handStreet.value === "flop") {
    const turnInput = document.querySelector('[data-card-kind="board"][data-card-index="3"]');
    if (turnInput) turnInput.value = "";
    const riverInput = document.querySelector('[data-card-kind="board"][data-card-index="4"]');
    if (riverInput) riverInput.value = "";
  } else if (els.handStreet.value === "turn") {
    const riverInput = document.querySelector('[data-card-kind="board"][data-card-index="4"]');
    if (riverInput) riverInput.value = "";
  }
  updatePickerButtons();
  analyzeHandSituation(false);
  if (poolMode === "side") calculateSidePool({ capture: false });
  queueDraftSave();
});
els.applyCalculatedOuts.addEventListener("click", () => analyzeHandSituation(true));
els.doubleRiverAdvance?.addEventListener("click", () => {
  doubleRiverUnlocked = true;
  calculateDouble();
  if (poolMode === "side") calculateSidePool({ capture: false });
  queueDraftSave();
});
els.autoRankFromHands?.addEventListener("click", autoRankFromSelectedHands);
els.cardPickerGrid?.addEventListener("click", (event) => {
  const cardButton = event.target.closest("[data-picker-card]");
  if (!cardButton || cardButton.disabled || !cardPickerState) return;
  const value = cardButton.dataset.pickerCard;
  const index = cardPickerState.selected.indexOf(value);
  if (index >= 0) cardPickerState.selected.splice(index, 1);
  else if (cardPickerState.selected.length < cardPickerState.max) cardPickerState.selected.push(value);
  renderCardPickerGrid();
});
document.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-card]");
  if (!removeButton) return;
  event.preventDefault();
  removeSelectedCard(removeButton.dataset.removeTarget, removeButton.dataset.removeCard);
});
els.cardPickerConfirm?.addEventListener("click", confirmCardPicker);
els.cardPickerClear?.addEventListener("click", () => {
  if (!cardPickerState) return;
  cardPickerState.selected = [];
  renderCardPickerGrid();
});
els.cardPickerClose?.addEventListener("click", closeCardPicker);
els.cardPickerCancel?.addEventListener("click", closeCardPicker);
els.cardPickerBackdrop?.addEventListener("click", (event) => {
  if (event.target === els.cardPickerBackdrop) closeCardPicker();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cardPickerState) closeCardPicker();
});
document.querySelectorAll('input[type="number"]').forEach((input) => {
  input.addEventListener("input", () => validateNumberInput(input));
  input.addEventListener("blur", () => validateNumberInput(input, true));
});
document.querySelectorAll("[data-turn-ratio]").forEach((button) => {
  button.addEventListener("click", () => {
    const ratio = Number(button.dataset.turnRatio);
    const { pot } = getBaseAmounts(els.doublePot, els.doubleStake);
    const odds = oddsForOuts(els.turnRange.value);
    els.turnBuy.value = odds > 0 ? Math.round(pot * ratio / odds) : "";
    calculateDouble();
    queueDraftSave();
  });
});
document.querySelectorAll("[data-river-ratio]").forEach((button) => {
  button.addEventListener("click", () => {
    const ratio = Number(button.dataset.riverRatio);
    const { pot } = getBaseAmounts(els.doublePot, els.doubleStake);
    const odds = oddsForOuts(els.riverRange.value);
    els.riverBuy.value = odds > 0 ? Math.round(pot * ratio / odds) : "";
    calculateDouble();
    queueDraftSave();
  });
});
document.querySelectorAll("[data-single-ratio]").forEach((button) => {
  button.addEventListener("click", () => {
    const ratio = Number(button.dataset.singleRatio);
    const { pot } = getBaseAmounts(els.pot, els.stake);
    const odds = oddsForOuts(els.range.value);
    els.customBuy.value = odds > 0 ? Math.round(pot * ratio / odds) : "";
    calculateSingle();
    queueDraftSave();
  });
});
document.querySelectorAll("[data-call-source]").forEach((button) => {
  button.addEventListener("click", () => {
    callSource = button.dataset.callSource === "auto" ? "auto" : "manual";
    callAutoAnalysis = null;
    updateCallSourceUI();
    if (callSource === "auto") updateCallFromHands();
    else calculateCall();
    queueDraftSave();
  });
});
[els.callInvested, els.callPot, els.callAmount, els.callOuts].forEach((input) => {
  input?.addEventListener("input", calculateCall);
});
els.callHero?.addEventListener("change", () => {
  updateHandPlayerVisibility();
  updatePickerButtons();
  if (callSource === "auto") updateCallFromHands();
  else calculateCall();
  analyzeHandSituation(false);
  queueDraftSave();
});
els.callRuleOfFour?.addEventListener("change", calculateCall);
els.callAnalyze?.addEventListener("click", () => {
  analyzeHandSituation(true);
  if (callSource === "auto") updateCallFromHands();
});
els.reset.addEventListener("click", reset);
els.copy.addEventListener("click", copySingleResults);
els.doubleCopy.addEventListener("click", copyDoubleResults);
els.modeButtons.forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
els.poolModeButtons.forEach((button) => button.addEventListener("click", () => setPoolMode(button.dataset.poolMode)));
document.querySelectorAll("[data-pot]").forEach((button) => {
  button.addEventListener("click", () => {
    els.pot.value = button.dataset.pot;
    els.stake.value = button.dataset.stake;
    els.doublePot.value = button.dataset.pot;
    els.doubleStake.value = button.dataset.stake;
    calculateSingle();
    calculateDouble();
    queueDraftSave();
  });
});

const savedDraft = readDraft();
renderHandInputs();

const params = new URLSearchParams(window.location.search);
const requestedPool = params.has("pool") ? (params.get("pool") === "side" ? "side" : "single") : (savedDraft?.poolMode || "single");
const requestedMode = params.has("preview")
  ? (params.get("preview") === "double" ? "double" : params.get("preview") === "call" ? "call" : "single")
  : (savedDraft?.mode || "single");
setPoolMode(requestedPool);
setMode(requestedMode);
if (savedDraft) {
  applyDraft(savedDraft);
  calculateSidePool({ capture: false });
  calculateSingle();
  calculateDouble();
  updateCallSourceUI();
  calculateCall();
  analyzeHandSituation(false);
}

document.addEventListener("input", queueDraftSave, true);
document.addEventListener("change", queueDraftSave, true);

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // The calculator remains fully usable when service workers are unavailable.
    });
  });
}
