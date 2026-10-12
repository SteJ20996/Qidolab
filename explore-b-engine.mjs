/** Original pure rules. Stored positions are validated; saved outcome flags are ignored. */
export const SORTING_PAIRS = Object.freeze([[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]].map(Object.freeze));
export const SORTING_LIMIT = 5;
const dense = value => Array.isArray(value) && Array.from({length: value.length}, (_, index) => Object.hasOwn(value, index)).every(Boolean);
const array = (value, max, label) => { if (!Array.isArray(value) || value.length > max || !dense(value)) throw new TypeError(label); };
function validateNetwork(network) {
  array(network, SORTING_LIMIT, 'Invalid network');
  for (const pair of network) if (!Array.isArray(pair) || pair.length !== 2 || !SORTING_PAIRS.some(([a, b]) => a === pair[0] && b === pair[1])) throw new RangeError('Invalid comparator');
}
function run(network, input) {
  const output = input.slice();
  for (const [a, b] of network) if (output[a] > output[b]) [output[a], output[b]] = [output[b], output[a]];
  return output;
}
export function sortingRun(network, input) {
  validateNetwork(network);
  if (!Array.isArray(input) || input.length !== 4 || !dense(input) || input.some(value => typeof value !== 'number' || !Number.isFinite(value))) throw new TypeError('Expected four finite numbers');
  return run(network, input);
}
export function sortingState(network = []) {
  validateNetwork(network);
  let passed = 0, counterexample = null;
  for (let mask = 0; mask < 16; mask++) {
    const input = [3, 2, 1, 0].map(bit => (mask >> bit) & 1), output = run(network, input);
    if (output.every((value, index) => !index || value >= output[index - 1])) passed++;
    else counterexample ||= {input, output};
  }
  return {passed, total: 16, count: network.length, won: passed === 16, counterexample};
}
export function sortingAdd(network, pair) {
  const next = [...network.map(value => value.slice()), Array.isArray(pair) ? pair.slice() : pair];
  sortingState(next); return next;
}
/** Exhaustively find a valid extension, or null if this prefix cannot fit in five. */
export function sortingSolution(prefix = []) {
  const state = sortingState(prefix);
  if (state.won) return prefix.map(pair => pair.slice());
  if (prefix.length === SORTING_LIMIT) return null;
  for (const pair of SORTING_PAIRS) {
    const solution = sortingSolution([...prefix, pair]);
    if (solution) return solution;
  }
  return null;
}

export const SCHEDULE_TASKS = Object.freeze([
  {id: 'A', duration: 3, after: []}, {id: 'B', duration: 2, after: []},
  {id: 'C', duration: 2, after: ['A']}, {id: 'D', duration: 4, after: ['A']},
  {id: 'E', duration: 3, after: ['B', 'C']},
].map(task => Object.freeze({...task, after: Object.freeze(task.after)})));
export const SCHEDULE_HORIZON = 14;
export const SCHEDULE_OPTIMUM = 8;
const taskFor = id => SCHEDULE_TASKS.find(task => task.id === id);
function scheduleError(code, details = {}) { const error = new RangeError(code); error.code = code; Object.assign(error, details); throw error; }
function validatePlacements(placements) {
  array(placements, SCHEDULE_TASKS.length, 'Invalid schedule');
  const seen = new Set();
  for (const placement of placements) {
    if (!placement || typeof placement !== 'object') scheduleError('input');
    const {id, machine, start} = placement, task = taskFor(id);
    if (!task || seen.has(id) || !Number.isInteger(machine) || machine < 0 || machine > 1 || !Number.isInteger(start) || start < 0 || start + task.duration > SCHEDULE_HORIZON) scheduleError('input');
    seen.add(id);
  }
  for (const placement of placements) {
    const task = taskFor(placement.id);
    for (const dependency of task.after) {
      const before = placements.find(value => value.id === dependency);
      if (!before) scheduleError('missing', {task: placement.id, dependency});
      if (before.start + taskFor(dependency).duration > placement.start) scheduleError('dependency', {task: placement.id, dependency});
    }
    for (const other of placements) if (other.id !== placement.id && other.machine === placement.machine && placement.start < other.start + taskFor(other.id).duration && other.start < placement.start + task.duration) scheduleError('overlap', {task: placement.id, other: other.id});
  }
}
export function scheduleState(placements = []) {
  validatePlacements(placements);
  const makespan = Math.max(0, ...placements.map(placement => placement.start + taskFor(placement.id).duration)), finished = placements.length === SCHEDULE_TASKS.length;
  return {count: placements.length, makespan, finished, won: finished && makespan === SCHEDULE_OPTIMUM, work: SCHEDULE_TASKS.reduce((sum, task) => sum + task.duration, 0)};
}
export function schedulePlace(placements, id, machine, start) {
  scheduleState(placements);
  const next = [...placements.filter(value => value.id !== id).map(value => ({...value})), {id, machine, start}];
  scheduleState(next); return next;
}
/** Removing a predecessor also removes its dependent tasks, keeping a legal position. */
export function scheduleRemove(placements, id) {
  scheduleState(placements); if (!taskFor(id)) scheduleError('input');
  const removed = new Set([id]);
  for (const task of SCHEDULE_TASKS) if (task.after.some(dependency => removed.has(dependency))) removed.add(task.id);
  return placements.filter(placement => !removed.has(placement.id)).map(placement => ({...placement}));
}
/** Enumerate every bounded integer placement in topological order. The first
 * feasible horizon is globally optimal under the activity's integer-time rules. */
export function scheduleSolution(fixed = []) {
  scheduleState(fixed);
  function search(placements, index, horizon) {
    if (index === SCHEDULE_TASKS.length) return placements;
    const task = SCHEDULE_TASKS[index];
    if (placements.some(placement => placement.id === task.id)) return search(placements, index + 1, horizon);
    const earliest = Math.max(0, ...task.after.map(id => { const before = placements.find(placement => placement.id === id); return before.start + taskFor(id).duration; }));
    for (let start = earliest; start <= horizon - task.duration; start++) for (let machine = 0; machine < 2; machine++) {
      if (placements.some(other => other.machine === machine && start < other.start + taskFor(other.id).duration && other.start < start + task.duration)) continue;
      const result = search([...placements, {id: task.id, machine, start}], index + 1, horizon);
      if (result) return result;
    }
    return null;
  }
  const lower = Math.max(0, ...fixed.map(placement => placement.start + taskFor(placement.id).duration));
  for (let horizon = lower; horizon <= SCHEDULE_HORIZON; horizon++) {
    const placements = search(fixed.map(placement => ({...placement})), 0, horizon);
    if (placements) return {placements: SCHEDULE_TASKS.map(task => placements.find(placement => placement.id === task.id)), makespan: horizon};
  }
  return null;
}

export const COLORING_NODES = Object.freeze([
  {id: 'A', x: 250, y: 48}, {id: 'B', x: 426, y: 176}, {id: 'C', x: 359, y: 382},
  {id: 'D', x: 141, y: 382}, {id: 'E', x: 74, y: 176}, {id: 'F', x: 250, y: 232},
].map(Object.freeze));
export const COLORING_EDGES = Object.freeze([[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 5], [1, 5], [2, 5], [3, 5], [4, 5]].map(Object.freeze));
export const COLORING_MINIMUM = 4;
export function coloringState(colors = Array(6).fill(null)) {
  if (!Array.isArray(colors) || colors.length !== 6 || !dense(colors) || colors.some(value => value !== null && (!Number.isInteger(value) || value < 0 || value >= COLORING_MINIMUM))) throw new TypeError('Invalid coloring');
  const conflicts = COLORING_EDGES.filter(([a, b]) => colors[a] !== null && colors[a] === colors[b]).map(edge => edge.slice()), filled = colors.filter(value => value !== null).length;
  return {filled, used: new Set(colors.filter(value => value !== null)).size, conflicts, won: filled === 6 && conflicts.length === 0};
}
export function coloringSet(colors, node, color) {
  coloringState(colors);
  if (!Number.isInteger(node) || node < 0 || node >= 6) throw new RangeError('Invalid vertex');
  const next = colors.slice(); next[node] = color; coloringState(next); return next;
}
export function coloringSolution(prefix = Array(6).fill(null), palette = COLORING_MINIMUM) {
  coloringState(prefix);
  if (!Number.isInteger(palette) || palette < 1 || palette > COLORING_MINIMUM) throw new RangeError('Invalid palette');
  if (prefix.some(value => value !== null && value >= palette) || coloringState(prefix).conflicts.length) return null;
  const empty = prefix.indexOf(null); if (empty < 0) return prefix.slice();
  for (let color = 0; color < palette; color++) {
    const next = coloringSet(prefix, empty, color);
    if (!coloringState(next).conflicts.length) { const solution = coloringSolution(next, palette); if (solution) return solution; }
  }
  return null;
}
