/** Pure, validated rules for the three discovery activities. No DOM or storage. */
const LIGHT_COUNT = 6;
function checkLights(state) {
  if (!Array.isArray(state) || state.length !== LIGHT_COUNT ||
      Array.from(state).some(value => value !== 0 && value !== 1)) {
    throw new TypeError('Lights must be an array of six 0 or 1 values');
  }
}
function checkIndex(index, count, label) {
  if (!Number.isInteger(index) || index < 0 || index >= count) {
    throw new RangeError(`${label} must be an integer from 0 to ${count - 1}`);
  }
}
/** Press one light, toggling it and its two immediate neighbors on the ring. */
export function flipLights(state, index) {
  checkLights(state);
  checkIndex(index, LIGHT_COUNT, 'Light index');
  const next = [...state];
  for (const i of [(index + 5) % 6, index, (index + 1) % 6]) next[i] ^= 1;
  return next;
}
// Scramble the solved board with presses 0, 1, 2. Its shortest solution is 3 presses.
export const LIGHT_INITIAL = Object.freeze([0, 1, 2].reduce(flipLights, [0, 0, 0, 0, 0, 0]));
/** A shortest list of press indices; null means the valid state is unsolvable. */
export function lightSolution(state) {
  checkLights(state);
  const queue = [[state.slice(), []]], seen = new Set([state.join('')]);
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const [current, path] = queue[cursor];
    if (current.every(value => value === 0)) return path;
    for (let index = 0; index < LIGHT_COUNT; index++) {
      const next = flipLights(current, index), key = next.join('');
      if (!seen.has(key)) { seen.add(key); queue.push([next, [...path, index]]); }
    }
  }
  return null;
}
/** Validate saved steps shaped { index, state }, starting at LIGHT_INITIAL. */
export function validLightHistory(history) {
  if (!Array.isArray(history) || history.length > 10000) return false;
  let state = LIGHT_INITIAL;
  try {
    for (const item of history) {
      if (!item || typeof item !== 'object') return false;
      const next = flipLights(state, item.index);
      checkLights(item.state);
      if (!next.every((value, index) => value === item.state[index])) return false;
      state = next;
    }
    return true;
  } catch { return false; }
}

function checkCoins(coins, label) {
  if (!Array.isArray(coins)) throw new TypeError(`${label} must be an array of coin indices`);
  for (const coin of coins) checkIndex(coin, 8, 'Coin index');
  if (new Set(coins).size !== coins.length) throw new RangeError(`${label} contains duplicate coins`);
}
function checkPans(left, right) {
  checkCoins(left, 'Left pan');
  checkCoins(right, 'Right pan');
  if (left.length === 0 || left.length !== right.length) {
    throw new RangeError('Pans must contain equal, nonempty numbers of coins');
  }
  if (left.some(coin => right.includes(coin))) throw new RangeError('A coin cannot be on both pans');
}
/** Which pan is heavier: 'left', 'right', or 'balanced'. Exactly one coin is heavier. */
export function balanceResult(left, right, heavy) {
  checkPans(left, right);
  checkIndex(heavy, 8, 'Heavy coin index');
  return left.includes(heavy) ? 'left' : right.includes(heavy) ? 'right' : 'balanced';
}
/** Keep precisely the candidate heavy coins consistent with an observed result. */
export function candidatesAfter(candidates, left, right, result) {
  checkCoins(candidates, 'Candidates');
  checkPans(left, right);
  if (!['left', 'right', 'balanced'].includes(result)) throw new TypeError('Unknown balance result');
  return candidates.filter(coin => balanceResult(left, right, coin) === result);
}

/** Evaluate n² + n + 11 exactly for integer n in [0, 10000].
 * factors contains prime factors with multiplicity, in ascending order.
 * A prime value has factors [value]. Testing examples does not prove all n.
 */
export function evaluateGenerator(input) {
  if (typeof input !== 'number' && (typeof input !== 'string' || !/^\d+$/.test(input))) {
    throw new TypeError('Enter a whole number from 0 to 10000');
  }
  const n = Number(input);
  if (!Number.isSafeInteger(n) || n < 0 || n > 10000) {
    throw new RangeError('Enter a whole number from 0 to 10000');
  }
  const value = n * n + n + 11, factors = [];
  let remaining = value;
  for (let divisor = 2; divisor * divisor <= remaining; divisor += divisor === 2 ? 1 : 2) {
    while (remaining % divisor === 0) { factors.push(divisor); remaining /= divisor; }
  }
  if (remaining > 1) factors.push(remaining);
  return { n: n === 0 ? 0 : n, value, prime: factors.length === 1, factors };
}
