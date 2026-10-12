/** Exact, dependency-free rules. Saves are move logs replayed through these rules. */
export const FRACTIONS_DENOMINATORS = Object.freeze(Array.from({length: 11}, (_, i) => i + 2));
export const FRACTIONS_TARGET = Object.freeze({numerator: 5, denominator: 6});
export const FRACTIONS_COUNT = 3;
export const EXPLORE_C_MOVE_LIMIT = 10000;
const checkMoves = moves => { if (!Array.isArray(moves) || moves.length > EXPLORE_C_MOVE_LIMIT) throw new TypeError('Expected a bounded move array'); };
const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
export function rational(numerator, denominator = 1) {
  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator) || denominator === 0) throw new RangeError('Expected safe integers and a nonzero denominator');
  const sign = denominator < 0 ? -1 : 1, divisor = gcd(Math.abs(numerator), Math.abs(denominator));
  return {numerator: (numerator * sign / divisor) || 0, denominator: Math.abs(denominator) / divisor};
}
export function addFractions(a, b) {
  a = rational(a.numerator, a.denominator); b = rational(b.numerator, b.denominator);
  const divisor = gcd(a.denominator, b.denominator);
  return rational(a.numerator * (b.denominator / divisor) + b.numerator * (a.denominator / divisor), a.denominator * (b.denominator / divisor));
}
const totalFractions = selected => selected.reduce((sum, denominator) => addFractions(sum, {numerator: 1, denominator}), rational(0));
function fractionSummary(selected) {
  const sum = totalFractions(selected), difference = addFractions(FRACTIONS_TARGET, {numerator: -sum.numerator, denominator: sum.denominator});
  return {selected: selected.slice(), sum, difference, count: selected.length, relation: -Math.sign(difference.numerator) || 0, won: selected.length === FRACTIONS_COUNT && difference.numerator === 0};
}
export function fractionsState(moves = []) {
  checkMoves(moves); let selected = [];
  for (const denominator of moves) {
    if (!FRACTIONS_DENOMINATORS.includes(denominator)) throw new RangeError('Choose a denominator from 2 to 12');
    if (fractionSummary(selected).won) throw new RangeError('Undo or reset a completed attempt');
    if (selected.includes(denominator)) selected = selected.filter(value => value !== denominator);
    else { if (selected.length === FRACTIONS_COUNT) throw new RangeError('Remove a selected fraction before adding a fourth'); selected.push(denominator); }
  }
  return fractionSummary(selected);
}
export function fractionsToggle(moves, denominator) { const next = [...moves, denominator]; fractionsState(next); return next; }
/** All three-piece solutions containing the current selection, or [] if it must change. */
export function fractionsSolutions(selected = []) {
  if (!Array.isArray(selected) || selected.length > FRACTIONS_COUNT || new Set(selected).size !== selected.length || Array.from(selected).some(d => !FRACTIONS_DENOMINATORS.includes(d))) throw new RangeError('Invalid selected denominators');
  const solutions = [];
  for (let i = 0; i < FRACTIONS_DENOMINATORS.length; i++) for (let j = i + 1; j < FRACTIONS_DENOMINATORS.length; j++) for (let k = j + 1; k < FRACTIONS_DENOMINATORS.length; k++) {
    const choice = [FRACTIONS_DENOMINATORS[i], FRACTIONS_DENOMINATORS[j], FRACTIONS_DENOMINATORS[k]];
    if (selected.every(d => choice.includes(d)) && fractionSummary(choice).won) solutions.push(choice);
  }
  return solutions;
}
export function fractionsSolution(moves = []) { const state = fractionsState(moves); return fractionsSolutions(state.selected)[0] ?? null; }

export const REFLECTION_GRID_MAX = 4;
export const REFLECTION_MIRROR = 'y=x';
export const REFLECTION_POINTS = Object.freeze([
  Object.freeze({id: 'A', x: 0, y: 2}), Object.freeze({id: 'B', x: 1, y: 4}), Object.freeze({id: 'C', x: 2, y: 3}),
]);
const validCoordinate = n => Number.isInteger(n) && n >= 0 && n <= REFLECTION_GRID_MAX;
export function reflectPoint(point) {
  if (!point || !validCoordinate(point.x) || !validCoordinate(point.y)) throw new RangeError('Expected a point on the grid');
  return {x: point.y, y: point.x};
}
function reflectionSummary(positions) {
  const points = REFLECTION_POINTS.map(point => {
    const placed = positions[point.id] ?? null, target = reflectPoint(point);
    return {...point, target, placed: placed ? {...placed} : null, correct: Boolean(placed && placed.x === target.x && placed.y === target.y)};
  });
  return {positions: Object.fromEntries(Object.entries(positions).map(([id, position]) => [id, {...position}])), points, placedCount: points.filter(point => point.placed).length, correctCount: points.filter(point => point.correct).length, won: points.every(point => point.correct)};
}
export function reflectionState(moves = []) {
  checkMoves(moves); const positions = {};
  for (const move of moves) {
    if (!move || typeof move !== 'object' || Array.isArray(move) || !REFLECTION_POINTS.some(point => point.id === move.id) || !validCoordinate(move.x) || !validCoordinate(move.y)) throw new RangeError('Choose a labeled point and integer coordinates from 0 to 4');
    if (reflectionSummary(positions).won) throw new RangeError('Undo or reset a completed attempt');
    const previous = positions[move.id];
    if (previous?.x === move.x && previous?.y === move.y) throw new RangeError('This point is already at these coordinates');
    positions[move.id] = {x: move.x, y: move.y};
  }
  return reflectionSummary(positions);
}
export function reflectionPlace(moves, id, x, y) { const next = [...moves.map(move => ({...move})), {id, x, y}]; reflectionState(next); return next; }
export function reflectionSolution(moves = []) { return reflectionState(moves).points.filter(point => !point.correct).map(point => ({id: point.id, ...point.target})); }
