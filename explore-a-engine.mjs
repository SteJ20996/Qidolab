// Original, deterministic models. Persist inputs; derive every outcome again.
export const SEARCH_MIN = 1;
export const SEARCH_MAX = 64;
function denseArray(value, max) {
  if (!Array.isArray(value) || value.length > max || Object.keys(value).length !== value.length) throw new TypeError('Expected a bounded dense array');
}
export function searchState(secret, cuts = []) {
  if (!Number.isInteger(secret) || secret < SEARCH_MIN || secret > SEARCH_MAX) throw new RangeError('Secret must be an integer from 1 to 64');
  denseArray(cuts, SEARCH_MAX - 1);
  let low = SEARCH_MIN, high = SEARCH_MAX;
  const evidence = [];
  for (const cut of cuts) {
    if (!Number.isInteger(cut) || cut < low || cut >= high) throw new RangeError('A cut must divide the remaining interval');
    const greater = secret > cut;
    if (greater) low = cut + 1; else high = cut;
    evidence.push({cut, greater, low, high, count: high - low + 1});
  }
  return {low, high, count: high - low + 1, questions: cuts.length, evidence, won: low === high};
}
export function searchAsk(secret, cuts, cut) {
  searchState(secret, cuts);
  const next = [...cuts, cut]; searchState(secret, next); return next;
}
export function searchMidpoint(secret, cuts = []) {
  const state = searchState(secret, cuts);
  return state.won ? null : Math.floor((state.low + state.high) / 2);
}

export const LOGIC_ITEMS = Object.freeze(['shell', 'leaf', 'feather', 'stone', 'lens']);
export const LOGIC_CLUES = Object.freeze(['adjacent', 'beforeLens', 'inner', 'gap', 'beforeStone']);
export function logicState(slots = [null, null, null, null, null]) {
  denseArray(slots, 5);
  if (slots.length !== 5 || slots.some(item => item !== null && !LOGIC_ITEMS.includes(item))) throw new RangeError('Use five slots with known items or null');
  const placed = slots.filter(item => item !== null);
  if (new Set(placed).size !== placed.length) throw new RangeError('Each item is distinct');
  const p = Object.fromEntries(LOGIC_ITEMS.map(item => [item, slots.indexOf(item)]));
  const check = (items, test) => items.some(item => p[item] < 0) ? null : test();
  const clues = [
    check(['shell', 'leaf'], () => p.shell + 1 === p.leaf),
    check(['feather', 'lens'], () => p.feather < p.lens),
    check(['stone'], () => p.stone > 0 && p.stone < 4),
    check(['feather', 'shell'], () => Math.abs(p.feather - p.shell) === 2),
    check(['leaf', 'stone'], () => p.leaf < p.stone),
  ];
  return {slots: [...slots], placed: placed.length, clues, satisfied: clues.filter(value => value === true).length, won: placed.length === 5 && clues.every(value => value === true)};
}
export function logicPlace(slots, item, position) {
  logicState(slots);
  if (!LOGIC_ITEMS.includes(item) || !Number.isInteger(position) || position < 0 || position > 4) throw new RangeError('Choose an item and a slot');
  const result = [...slots], old = result.indexOf(item), displaced = result[position];
  if (old >= 0) result[old] = displaced;
  result[position] = item;
  logicState(result); return result;
}
export function logicSolutions() {
  const answers = [];
  function place(prefix, rest) {
    if (!rest.length) { if (logicState(prefix).won) answers.push(prefix); return; }
    rest.forEach((item, i) => place([...prefix, item], rest.filter((_, j) => j !== i)));
  }
  place([], [...LOGIC_ITEMS]); return answers;
}

export const PROBABILITY_SIZE = 4;
export const PROBABILITY_CELLS = Object.freeze(Array.from({length: 16}, (_, id) => Object.freeze({id, first: Math.floor(id / 4) + 1, second: id % 4 + 1})));
export const PROBABILITY_EVENT = Object.freeze(PROBABILITY_CELLS.filter(({first, second}) => first + second >= 6 || first === second).map(cell => cell.id));
export function probabilityState(selected = []) {
  denseArray(selected, 16);
  if (selected.some(id => !Number.isInteger(id) || id < 0 || id > 15) || new Set(selected).size !== selected.length) throw new RangeError('Choose distinct cells from 0 to 15');
  const missing = PROBABILITY_EVENT.filter(id => !selected.includes(id));
  const extra = selected.filter(id => !PROBABILITY_EVENT.includes(id));
  return {selected: [...selected], count: selected.length, missing, extra, exact: missing.length === 0 && extra.length === 0};
}
export function probabilityToggle(selected, cell) {
  probabilityState(selected);
  if (!Number.isInteger(cell) || cell < 0 || cell > 15) throw new RangeError('Choose a cell from 0 to 15');
  const next = selected.includes(cell) ? selected.filter(id => id !== cell) : [...selected, cell];
  return next.sort((a, b) => a - b);
}
export function probabilityCheck(selected, numerator, denominator) {
  const state = probabilityState(selected);
  const validFraction = Number.isSafeInteger(numerator) && numerator >= 0 && numerator <= 999 && Number.isSafeInteger(denominator) && denominator > 0 && denominator <= 999;
  const fractionCorrect = validFraction && numerator * 2 === denominator;
  return {...state, validFraction, fractionCorrect, won: state.exact && fractionCorrect};
}
/** Replay placements so Undo and reload cannot trust a stored success flag. */
export function logicReplay(moves = []) {
  denseArray(moves, 10000);
  let slots = [null, null, null, null, null];
  for (const move of moves) {
    if (!move || typeof move !== 'object' || Array.isArray(move)) throw new TypeError('Expected a placement');
    slots = logicPlace(slots, move.item, move.position);
  }
  return logicState(slots);
}
