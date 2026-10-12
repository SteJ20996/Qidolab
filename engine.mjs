export const capacities = [7, 4];
export const actions = ['fill0', 'fill1', 'pour01', 'pour10', 'empty0', 'empty1'];
export function step(state, action) {
  const s = [...state];
  if (action === 'fill0') s[0] = 7;
  else if (action === 'fill1') s[1] = 4;
  else if (action === 'empty0') s[0] = 0;
  else if (action === 'empty1') s[1] = 0;
  else if (action === 'pour01') { const n = Math.min(s[0], 4 - s[1]); s[0] -= n; s[1] += n; }
  else if (action === 'pour10') { const n = Math.min(s[1], 7 - s[0]); s[1] -= n; s[0] += n; }
  else throw new Error('Unknown action');
  return s;
}
export function solved(s) { return Array.isArray(s) && s.length === 2 && s[0] === 5 && Number.isInteger(s[1]) && s[1] >= 0 && s[1] <= capacities[1]; }
export function same(a, b) { return a[0] === b[0] && a[1] === b[1]; }
export function solution(start) {
  const queue = [[start, []]], seen = new Set([start.join(',')]);
  for (let i = 0; i < queue.length; i++) {
    const [s, path] = queue[i];
    if (solved(s)) return path;
    for (const action of actions) {
      const next = step(s, action), key = next.join(',');
      if (!seen.has(key)) { seen.add(key); queue.push([next, [...path, action]]); }
    }
  }
  return null;
}
export function validHistory(value) {
  if (!Array.isArray(value) || value.length > 10000) return false;
  let state = [0, 0];
  return value.every(item => {
    if (!item || !actions.includes(item.action)) return false;
    const next = step(state, item.action);
    if (!Array.isArray(item.state) || item.state.length !== 2 || !item.state.every((n,i) => Number.isInteger(n) && n >= 0 && n <= capacities[i]) || !same(next, item.state) || same(next, state)) return false;
    state = next; return true;
  });
}
