/** Original implementations of three classical mathematical experiments.
 * Pure functions: no DOM, randomness or storage. Cell/slot indices are zero based. */
export const CLOCK_SIZE = 12;
export const CLOCK_STEPS = Object.freeze([4, 6]);
const index = (value, size, label) => {
  if (!Number.isInteger(value) || value < 0 || value >= size) throw new RangeError(`Invalid ${label}`);
};
export function clockMove(position, step) {
  index(position, CLOCK_SIZE, 'clock position');
  if (!CLOCK_STEPS.includes(step)) throw new RangeError('A clock step must be 4 or 6');
  return (position + step) % CLOCK_SIZE;
}
export function clockPosition(moves) {
  if (!Array.isArray(moves)) throw new TypeError('Clock moves must be an array');
  let position = 0;
  for (const step of moves) position = clockMove(position, step);
  return position;
}
/** Shortest forward-only path from position to target, or null if unreachable. */
export function clockSolution(position, target) {
  index(position, CLOCK_SIZE, 'clock position'); index(target, CLOCK_SIZE, 'clock target');
  const queue = [[position, []]], seen = new Set([position]);
  for (let i = 0; i < queue.length; i++) {
    const [current, path] = queue[i];
    if (current === target) return path;
    for (const step of CLOCK_STEPS) {
      const next = clockMove(current, step);
      if (!seen.has(next)) { seen.add(next); queue.push([next, [...path, step]]); }
    }
  }
  return null;
}
export const TILE_MODES = Object.freeze({
  corners: Object.freeze([0, 15]),
  adjacent: Object.freeze([0, 1]),
});
export function tileColor(cell) { index(cell, 16, 'cell'); return (Math.floor(cell / 4) + cell % 4) % 2; }
export function adjacentCells(a, b) {
  index(a, 16, 'cell'); index(b, 16, 'cell');
  return Math.abs(Math.floor(a / 4) - Math.floor(b / 4)) + Math.abs(a % 4 - b % 4) === 1;
}
function checkBoard(removed, dominoes) {
  if (!Array.isArray(removed) || !Array.isArray(dominoes)) throw new TypeError('Board arrays required');
  const used = new Set();
  for (const cell of removed) { index(cell, 16, 'removed cell'); if (used.has(cell)) throw new RangeError('Duplicate removed cell'); used.add(cell); }
  for (const pair of dominoes) {
    if (!Array.isArray(pair) || pair.length !== 2 || !adjacentCells(pair[0], pair[1])) throw new RangeError('A domino covers two edge-adjacent cells');
    for (const cell of pair) { if (used.has(cell)) throw new RangeError('Overlapping domino'); used.add(cell); }
  }
  return used;
}
export function placeDomino(removed, dominoes, a, b) {
  checkBoard(removed, dominoes);
  const next = [...dominoes.map(pair => pair.slice()), [a, b]];
  checkBoard(removed, next); return next;
}
/** Counts uncovered cells of the two checkerboard colors. */
export function tileCounts(removed, dominoes = []) {
  const used = checkBoard(removed, dominoes), counts = [0, 0];
  for (let cell = 0; cell < 16; cell++) if (!used.has(cell)) counts[tileColor(cell)]++;
  return counts;
}
/** Missing dominoes completing this exact partial board; null if impossible.
 * Equal color counts are necessary, not claimed sufficient for arbitrary holes. */
export function tilingSolution(removed, dominoes = []) {
  const used = checkBoard(removed, dominoes);
  const counts = tileCounts(removed, dominoes);
  if (counts[0] !== counts[1]) return null;
  function search() {
    let a = 0; while (a < 16 && used.has(a)) a++;
    if (a === 16) return [];
    used.add(a);
    for (const b of [a + 1, a + 4]) {
      if (b < 16 && !used.has(b) && adjacentCells(a, b)) {
        used.add(b); const remaining = search();
        if (remaining) return [[a, b], ...remaining];
        used.delete(b);
      }
    }
    used.delete(a); return null;
  }
  return search();
}
// Slots: top, left midpoint, right midpoint, bottom-left, base midpoint, bottom-right.
export const TRIANGLE_INITIAL = Object.freeze([1, 2, 3, 4, 5, 6]);
export const TRIANGLE_SIDES = Object.freeze([Object.freeze([0, 1, 3]), Object.freeze([0, 2, 5]), Object.freeze([3, 4, 5])]);
export const TRIANGLE_TARGETS = Object.freeze([9, 10, 11, 12]);
function checkTriangle(values) {
  if (!Array.isArray(values) || values.length !== 6 || new Set(values).size !== 6 || Array.from(values).some(v => !Number.isInteger(v) || v < 1 || v > 6)) throw new RangeError('Use 1 through 6 exactly once');
}
export function triangleSums(values) { checkTriangle(values); return TRIANGLE_SIDES.map(side => side.reduce((sum, slot) => sum + values[slot], 0)); }
export function swapTriangle(values, a, b) {
  checkTriangle(values); index(a, 6, 'triangle slot'); index(b, 6, 'triangle slot');
  const next = values.slice(); [next[a], next[b]] = [next[b], next[a]]; return next;
}
export function triangleSolutions(target) {
  if (!TRIANGLE_TARGETS.includes(target)) throw new RangeError('Target must be 9, 10, 11 or 12');
  const results = [];
  function permute(prefix, rest) {
    if (!rest.length) { if (triangleSums(prefix).every(sum => sum === target)) results.push(prefix); return; }
    rest.forEach((value, i) => permute([...prefix, value], rest.filter((_, j) => j !== i)));
  }
  permute([], [1, 2, 3, 4, 5, 6]); return results;
}
/** A shortest sequence of arbitrary two-slot swaps to any target arrangement. */
export function triangleSolution(values, target) {
  checkTriangle(values);
  let best = null;
  for (const solution of triangleSolutions(target)) {
    let state = values.slice(); const path = [];
    for (let a = 0; a < 6; a++) if (state[a] !== solution[a]) {
      const b = state.indexOf(solution[a]); path.push([a, b]); state = swapTriangle(state, a, b);
    }
    if (best === null || path.length < best.length) best = path;
  }
  return best;
}
