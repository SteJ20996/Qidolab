/** Original, dependency-free rules for three classical mathematical activities.
 * Saved attempts are replayed through these functions, never trusted as outcomes. */
export const BRIDGE_TIMES = Object.freeze([1, 2, 5, 10]);
export const BRIDGE_LIMIT = 17;
const checkArray = (value, label) => { if (!Array.isArray(value)) throw new TypeError(`${label} must be an array`); };
const checkPerson = person => { if (!Number.isInteger(person) || person < 0 || person >= 4) throw new RangeError('Invalid bridge traveler'); };
function crossing(state, people) {
  checkArray(people, 'Crossing');
  if (state.mask === 15 || people.length < 1 || people.length > 2 || new Set(people).size !== people.length) throw new RangeError('Choose one or two distinct travelers before the crossing is finished');
  let mask = state.mask;
  for (const person of people) {
    checkPerson(person);
    if (Number(Boolean(state.mask & (1 << person))) !== state.lamp) throw new RangeError('Every traveler must be on the bank with the lamp');
    mask ^= 1 << person;
  }
  const minutes = Math.max(...people.map(person => BRIDGE_TIMES[person]));
  return {mask, lamp: 1 - state.lamp, total: state.total + minutes, minutes};
}
export function bridgeState(moves = []) {
  checkArray(moves, 'Bridge moves');
  let state = {mask: 0, lamp: 0, total: 0, minutes: 0};
  for (const people of moves) state = crossing(state, people);
  return {...state, finished: state.mask === 15, won: state.mask === 15 && state.total <= BRIDGE_LIMIT};
}
export function bridgeCross(moves, people) {
  const state = bridgeState(moves); crossing(state, people);
  return [...moves.map(move => move.slice()), people.slice()];
}
/** Cheapest remaining legal plan (Dijkstra on 32 positions), independent of time spent. */
export function bridgeSolution(moves = []) {
  const start = bridgeState(moves), queue = [{...start, cost: 0, moves: []}], best = new Map([[`${start.mask}:${start.lamp}`, 0]]);
  while (queue.length) {
    queue.sort((a, b) => a.cost - b.cost); const current = queue.shift();
    if (current.cost !== best.get(`${current.mask}:${current.lamp}`)) continue;
    if (current.mask === 15) return {minutes: current.cost, moves: current.moves};
    const available = BRIDGE_TIMES.map((_, i) => i).filter(i => Number(Boolean(current.mask & (1 << i))) === current.lamp);
    const choices = available.flatMap((a, i) => [[a], ...available.slice(i + 1).map(b => [a, b])]);
    for (const people of choices) {
      const next = crossing(current, people), cost = current.cost + next.minutes, key = `${next.mask}:${next.lamp}`;
      if (cost < (best.get(key) ?? Infinity)) { best.set(key, cost); queue.push({...next, cost, moves: [...current.moves, people]}); }
    }
  }
  return null;
}

export const TAKEAWAY_START = 21;
/** Normal play: take the last token to win. On a losing position, take one. */
export function optimalTakeaway(remaining) {
  if (!Number.isInteger(remaining) || remaining < 1 || remaining > TAKEAWAY_START) throw new RangeError('Expected 1–21 remaining tokens');
  return remaining % 4 || 1;
}
export function takeawayState(humanMoves = []) {
  checkArray(humanMoves, 'Takeaway moves');
  let remaining = TAKEAWAY_START, winner = null; const turns = [];
  for (const count of humanMoves) {
    if (winner || !Number.isInteger(count) || count < 1 || count > 3 || count > remaining) throw new RangeError('Take one, two or three remaining tokens on your turn');
    remaining -= count; turns.push({player: 'human', count, remaining});
    if (!remaining) { winner = 'human'; continue; }
    const computer = optimalTakeaway(remaining); remaining -= computer; turns.push({player: 'computer', count: computer, remaining});
    if (!remaining) winner = 'computer';
  }
  return {remaining, winner, turns};
}
export function takeawayMove(humanMoves, count) {
  const next = [...humanMoves, count]; takeawayState(next); return next;
}

export const PATH_NODES = Object.freeze([
  Object.freeze({id: 'A', x: 65, y: 80}), Object.freeze({id: 'B', x: 250, y: 40}),
  Object.freeze({id: 'C', x: 435, y: 100}), Object.freeze({id: 'D', x: 120, y: 280}),
  Object.freeze({id: 'E', x: 410, y: 300}),
]);
export const PATH_EDGES = Object.freeze([
  ['A', 'B'], ['B', 'C'], ['C', 'A'], ['A', 'D'], ['D', 'C'], ['C', 'E'], ['E', 'D'],
].map(edge => Object.freeze(edge)));
export function pathState(route = []) {
  checkArray(route, 'Path');
  const edges = [];
  for (let i = 0; i < route.length; i++) {
    if (!PATH_NODES.some(node => node.id === route[i])) throw new RangeError('Choose a labeled vertex');
    if (!i) continue;
    const edge = PATH_EDGES.findIndex(([from, to]) => from === route[i - 1] && to === route[i]);
    if (edge < 0 || edges.includes(edge)) throw new RangeError('Follow an unused arrow from your current vertex');
    edges.push(edge);
  }
  const current = route.at(-1) ?? null;
  const options = PATH_EDGES.filter(([from], i) => from === current && !edges.includes(i)).map(([, to]) => to);
  return {current, edges, options, won: edges.length === PATH_EDGES.length, stuck: current !== null && !options.length && edges.length < PATH_EDGES.length};
}
export function pathMove(route, next) { const result = [...route, next]; pathState(result); return result; }
/** Remaining destination vertices, or null for a legal prefix that cannot finish. */
export function pathSolution(route = []) {
  const state = pathState(route);
  function visit(current, edges) {
    if (edges.length === PATH_EDGES.length) return [];
    for (let i = 0; i < PATH_EDGES.length; i++) {
      const [from, to] = PATH_EDGES[i];
      if (from === current && !edges.includes(i)) {
        const rest = visit(to, [...edges, i]); if (rest) return [to, ...rest];
      }
    }
    return null;
  }
  if (state.current !== null) return visit(state.current, state.edges);
  for (const {id} of PATH_NODES) { const rest = visit(id, []); if (rest) return [id, ...rest]; }
  return null;
}
