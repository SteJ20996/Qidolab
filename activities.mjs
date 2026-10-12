import {markCompleted, activityIds, completion} from './completion.mjs';
import {activityRoute} from './catalog.mjs';
import {reportOutcome} from './outcomes.mjs';
import { LIGHT_INITIAL, flipLights, lightSolution, balanceResult, candidatesAfter, evaluateGenerator } from './activities-engine.mjs';
import {t, locale} from './i18n.mjs';
const $ = id => document.getElementById(id);
const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
const views = activityIds;
const orbit = $('activity-orbit');
let rotation = 0;
let selected = null;
export function navigate(event) {
  const initial = selected === null || event?.type === 'activitiesready';
  if (initial) orbit.style.transition = 'none';
  const route = activityRoute(location.hash), name = route.parent;
  const branch = $('activity-next'), extreme = $('activity-extreme'), deeper = route.deeper && Boolean(route.extreme?extreme:branch) && completion.has(name);
  // An uncompleted deep link returns to its original experiment. This also
  // keeps a later successful move from opening the optional step automatically.
  if (route.deeper && (branch||extreme) && !deeper) location.hash = '#' + name;
  // Read the in-flight angle, so interrupted/repeated navigation never takes a long lap.
  const displayed = Number.parseFloat(getComputedStyle(orbit).getPropertyValue('--rotation'));
  const from = Number.isFinite(displayed) ? displayed : rotation;
  const desired = -views.indexOf(name) * (360 / views.length);
  const delta = ((desired - from + 180) % 360 + 360) % 360 - 180;
  rotation = from + delta;
  orbit.style.setProperty('--rotation', `${rotation}deg`);
  orbit.dataset.selected = name;
  if (selected !== name || orbit.dataset.deeper !== String(deeper)) $('activity-center').scrollTop = 0;
  selected = name;
  orbit.dataset.deeper = String(deeper);
  views.forEach(view => { const section = $('activity-' + view); if (section) section.hidden = deeper || view !== name; });
  if (branch) branch.hidden = !deeper || Boolean(route.extreme);
  if (extreme) extreme.hidden = !deeper || !route.extreme;
  document.querySelectorAll('[data-activity]').forEach((link) => {
    link.style.setProperty('--slot', `${views.indexOf(link.dataset.activity) * 360 / views.length}deg`);
    if (link.dataset.activity === name) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
  $('activity-center').setAttribute('aria-labelledby', deeper ? route.extreme?'extreme-title':'branch-title' : name === 'water' ? 'title' : `${name}-title`);
  window.dispatchEvent(new CustomEvent('activitynavigation',{detail:{parent:name,deeper,extreme:Boolean(route.extreme)}}));
  if (initial) {
    // Resolve the initial angle without a transition before enabling later motion.
    getComputedStyle(orbit).getPropertyValue('--rotation');
    orbit.style.transition = '';
  }
}
window.addEventListener('hashchange', navigate);
window.addEventListener('activitiesready', navigate);
navigate();

// Water keeps its original module and storage key; every activity is independent.
let lightMoves = read('quidence-lights-v1');
if (!Array.isArray(lightMoves) || lightMoves.length > 10000 || !lightMoves.every(x => Number.isInteger(x) && x >= 0 && x < 6)) lightMoves = [];
{ let state=[...LIGHT_INITIAL]; for(const move of lightMoves){state=flipLights(state,move);if(state.every(x=>!x))markCompleted('lights');} }
let lightHint = 0;
const lightState = () => lightMoves.reduce((state, index) => flipLights(state, index), [...LIGHT_INITIAL]);
for (let i = 0; i < 6; i++) {
  const button = document.createElement('button'); button.className = 'light-node light-' + i;
  button.addEventListener('click', () => { lightMoves.push(i); lightHint = 0; $('lights-hint-text').hidden = true; renderLightHint(); renderLights(); });
  $('lights-ring').append(button);
}
function renderLights() {
  const state = lightState(), won = state.every(x => !x);
  if(won)markCompleted('lights');
  reportOutcome('lights',won);
  [...$('lights-ring').children].forEach((button, i) => {
    button.textContent = `${i + 1} ${t(state[i] ? '亮' : '暗')}`;
    button.setAttribute('aria-label', t('灯 {number}，{state}。按下翻转灯 {left}、{number}、{right}', {number:i+1, state:t(state[i]?'亮':'暗'), left:((i+5)%6)+1, right:((i+1)%6)+1}));
    button.setAttribute('aria-pressed', String(Boolean(state[i]))); button.classList.toggle('lit', Boolean(state[i]));
  });
  $('lights-status').textContent = won ? t('全部熄灭了。你找到了！也可以继续试试。') : t('还亮着 {count} 盏 · 已按 {moves} 次。点任意一盏试试。', {count:state.filter(Boolean).length, moves:lightMoves.length});
  $('lights-insight').hidden = !won; $('lights-undo').disabled = !lightMoves.length; $('lights-reset').disabled = !lightMoves.length;
  save('quidence-lights-v1', lightMoves);
}
function renderLightHint() {
  $('lights-hint').textContent = t(!lightHint ? '✧ 给我一点灵感' : lightHint < 3 ? '再给一点提示 →' : '✧ 再看这条提示');
  if (!lightHint) return;
  const path = lightSolution(lightState());
  $('lights-hint-text').textContent = lightHint === 1 ? t('同一盏灯连按两次，会发生什么？先试试，再撤回。') : lightHint === 2 ? t('不必只按亮着的灯。你要改变的，是三盏灯的组合；按的顺序也不会影响最终结果。') : path?.length ? t('从现在开始，可以先按灯 {number}。这一步之后，再自己观察。', {number:path[0]+1}) : t('现在已经全暗了。你能解释为什么按同一盏两次，就回到原样吗？');
}
$('lights-undo').addEventListener('click', () => { lightMoves.pop(); lightHint = 0; $('lights-hint-text').hidden = true; renderLightHint(); renderLights(); });
$('lights-reset').addEventListener('click', () => { lightMoves = []; lightHint = 0; $('lights-hint-text').hidden = true; renderLightHint(); renderLights(); });
$('lights-hint').addEventListener('click', () => { lightHint++; $('lights-hint-text').hidden = false; renderLightHint(); });
renderLights(); renderLightHint();

const allCoins = () => Array.from({length: 8}, (_, i) => i);
function freshCoins() { return {heavy: Math.floor(Math.random() * 8), placement: Array(8).fill('table'), rounds: [], identified: false}; }
function validCoins(value) {
  if (!value || !Number.isInteger(value.heavy) || value.heavy < 0 || value.heavy > 7 || !Array.isArray(value.placement) || value.placement.length !== 8 || !value.placement.every(x => ['left', 'right', 'table'].includes(x)) || !Array.isArray(value.rounds) || value.rounds.length > 2 || typeof value.identified !== 'boolean') return false;
  try { let possible = allCoins(); for (const r of value.rounds) { if (balanceResult(r.left, r.right, value.heavy) !== r.result) return false; possible = candidatesAfter(possible, r.left, r.right, r.result); } return !value.identified || possible.length === 1; } catch { return false; }
}
let coins = read('quidence-coins-v1'); if (!validCoins(coins)) coins = freshCoins();
let destination = 'left', coinHint = 0, coinMessage = null;
const possibilities = () => coins.rounds.reduce((c, r) => candidatesAfter(c, r.left, r.right, r.result), allCoins());
const panCoins = side => allCoins().filter(i => coins.placement[i] === side);
const coinNames = list => list.map(i => i + 1).join(locale.startsWith('zh') ? '、' : ', ');
const resultNames = {left: '左盘更重', right: '右盘更重', balanced: '两盘平衡'};
const panNames = {left: '左盘', right: '右盘', table: '桌面'};
for (let i = 0; i < 8; i++) {
  const button = document.createElement('button'); button.className = 'coin';
  button.addEventListener('click', () => { coins.placement[i] = destination; renderCoins(); });
  $('coin-tray').append(button);
  const option = document.createElement('option'); option.value = String(i); option.textContent = t('{number} 号', {number:i+1}); $('coin-choice').append(option);
}
document.querySelectorAll('[data-pan]').forEach(button => button.addEventListener('click', () => {
  destination = button.dataset.pan; document.querySelectorAll('[data-pan]').forEach(b => b.setAttribute('aria-pressed', String(b === button))); renderCoins();
}));
function renderCoins(message = null) {
  coinMessage = message;
  if(coins.identified && possibilities().length===1)markCompleted('coins');
  reportOutcome('coins',coins.identified && possibilities().length===1);
  const left = panCoins('left'), right = panCoins('right'), possible = possibilities(), done = coins.rounds.length === 2 || coins.identified;
  [...$('coin-tray').children].forEach((button, i) => {
    button.textContent = `${i + 1} · ${t(panNames[coins.placement[i]])}`; button.dataset.position = coins.placement[i]; button.disabled = done;
    button.setAttribute('aria-label', t(destination === 'table' ? '{number} 号硬币，位于{position}，点击移回桌面' : '{number} 号硬币，位于{position}，点击{destination}', {number:i+1, position:t(panNames[coins.placement[i]]), destination:t('放到'+panNames[destination])}));
  });
  [...$('coin-choice').children].forEach(option => { if (option.value !== '') option.textContent = t('{number} 号', {number:Number(option.value)+1}); });
  $('coins-left').textContent = left.length ? coinNames(left) : t('空'); $('coins-right').textContent = right.length ? coinNames(right) : t('空');
  $('coins-count').textContent = t('还有 {count} 次称量', {count:2-coins.rounds.length});
  $('coins-weigh').disabled = done || !left.length || left.length !== right.length;
  $('coins-clear').disabled = done || !left.length && !right.length;
  $('coins-candidates').textContent = coins.rounds.length ? t('依据目前的称量，仍可能更重：{coins} 号。', {coins:coinNames(possible)}) : t('先安排第一轮称量。未上天平的硬币，也可能给你线索。');
  $('coins-status').textContent = message ? t(message.key, {...message.params, ...(message.result ? {result:t(resultNames[message.result])} : {})}) : t(coins.identified ? '证据和判断都对上了。就是这枚！' : possible.length === 1 ? '只剩一种可能了。选出那枚硬币，验证你的判断。' : done ? '两次用完，证据还不能确定。换一轮，试着让每种结果留下更少可能。' : !left.length || left.length !== right.length ? '两盘放相同枚数（至少 1 枚），再称一下。' : '两盘已准备好。称量前，想想三种结果各能排除谁。');
  $('coins-log').replaceChildren();
  for (const r of coins.rounds) { const li = document.createElement('li'); li.textContent = t('左 {left} / 右 {right} → {result}', {left:coinNames(r.left), right:coinNames(r.right), result:t(resultNames[r.result])}); $('coins-log').append(li); }
  const last = coins.rounds.at(-1), stillOnPans = last && JSON.stringify(last.left) === JSON.stringify(left) && JSON.stringify(last.right) === JSON.stringify(right); $('balance-symbol').textContent = stillOnPans ? {left:'↙',right:'↘',balanced:'＝'}[last.result] : '△';
  $('balance-symbol').setAttribute('title', t(stillOnPans ? resultNames[last.result] : '当前组合尚未称量'));
  $('coins-insight').hidden = !coins.identified; $('coins-identify').disabled = coins.identified; $('coin-choice').disabled = coins.identified;
  save('quidence-coins-v1', coins);
}
$('coins-weigh').addEventListener('click', () => {
  const left = panCoins('left'), right = panCoins('right'); if (coins.rounds.length >= 2 || !left.length || left.length !== right.length || coins.identified) return;
  const result = balanceResult(left, right, coins.heavy); coins.rounds.push({left, right, result}); renderCoins({key:'第 {round} 次：{result}。看看下方还剩哪些可能。', params:{round:coins.rounds.length}, result});
});
$('coins-clear').addEventListener('click', () => { coins.placement.fill('table'); renderCoins(); });
$('coins-new').addEventListener('click', () => { coins = freshCoins(); coinHint = 0; $('coins-hint-text').hidden = true; $('coin-choice').value = ''; renderCoinHint(); renderCoins({key:'新一轮开始。重币已重新藏好。'}); });
$('coins-answer').addEventListener('submit', event => {
  event.preventDefault(); if (coins.identified) return;
  if ($('coin-choice').value === '') { renderCoins({key:'先选择一枚硬币。'}); return; }
  const possible = possibilities(), choice = Number($('coin-choice').value);
  if (possible.length !== 1) { renderCoins({key:'现在还不止一种可能。即使猜中，也不能算确定；先用称量排除其他可能。'}); return; }
  if (choice !== possible[0]) { renderCoins({key:'这枚已被称量结果排除了。再看看记录，哪枚仍然可能更重？'}); return; }
  coins.identified = true; renderCoins();
});
function renderCoinHint() {
  $('coins-hint').textContent = t(!coinHint ? '✧ 给我一点灵感' : coinHint < 3 ? '再给一点提示 →' : '✧ 再看这条提示');
  if (!coinHint) return;
  $('coins-hint-text').textContent = t(coinHint === 1 ? '天平不只会告诉你“哪边重”，还会告诉你“两边一样”。平衡时，重币会在哪里？' : coinHint === 2 ? '第一次如果称 4 对 4，不论哪边重，都会剩 4 种可能；一次称量的三种结果，不足以区分 4 枚。试着让最大那组不超过 3 枚。' : '可以先称 3 对 3，另外 2 枚留在桌面。再从仍可能的硬币中称 1 对 1；平衡时，就看未称的那枚。');
}
$('coins-hint').addEventListener('click', () => { coinHint++; $('coins-hint-text').hidden = false; renderCoinHint(); });
renderCoins(); renderCoinHint();

let numberTrials = read('quidence-numbers-v1');
if (!Array.isArray(numberTrials) || numberTrials.length > 24 || !numberTrials.every(n => Number.isInteger(n) && n >= 0 && n <= 10000)) numberTrials = [];
let numberHint = 0, displayedNumber = null, numberStatus = '从 0 开始也好，跳着试也好。别急着相信这个规律。';
function renderNumbers() {
  if(numberTrials.some(n=>!evaluateGenerator(n).prime))markCompleted('numbers');
  reportOutcome('numbers',numberTrials.some(n=>!evaluateGenerator(n).prime));
  $('number-count').textContent = t('{count} 次（保留最近 24 次）', {count:numberTrials.length}); $('number-log').replaceChildren();
  for (const n of [...numberTrials].reverse()) { const r = evaluateGenerator(n), li = document.createElement('li'); li.textContent = t(r.prime ? 'n = {n} → {value}，是质数' : 'n = {n} → {value}，不是质数：{factors}', {n, value:r.value, factors:r.factors.join(' × ')}); $('number-log').append(li); }
  $('number-reset').disabled = !numberTrials.length;
  $('number-insight').hidden = !numberTrials.some(n => !evaluateGenerator(n).prime);
  $('number-status').textContent = t(numberStatus);
  save('quidence-numbers-v1', numberTrials);
}
function showNumber(n) {
  const r = evaluateGenerator(n); displayedNumber = r.n; $('number-result').hidden = false; $('number-result').replaceChildren();
  const title = document.createElement('h2'), explanation = document.createElement('p');
  title.textContent = `${r.n}² + ${r.n} + 11 = ${r.value}`;
  explanation.textContent = t(r.prime ? '{value} 是质数。又一个符合的例子，但还不能证明“总是”。' : '{value} = {factors}，不是质数。你找到反例了！', {value:r.value, factors:r.factors.join(' × ')});
  $('number-result').append(title, explanation); return r;
}
$('number-form').addEventListener('submit', event => {
  event.preventDefault();
  try { const r = showNumber($('number-input').value); numberTrials.push(r.n); numberTrials = numberTrials.slice(-24); numberStatus = r.prime ? '这个例子成立。还会不会有例外？' : '“总是质数”的说法被推翻了。还可以继续探索。'; $('number-input').removeAttribute('aria-invalid'); renderNumbers(); }
  catch { displayedNumber = null; $('number-result').hidden = true; numberStatus = '请输入 0 到 10000 的整数，不要小数、负数或其他符号。'; $('number-status').textContent = t(numberStatus); $('number-input').setAttribute('aria-invalid', 'true'); }
});
$('number-reset').addEventListener('click', () => { numberTrials = []; numberHint = 0; displayedNumber = null; $('number-result').hidden = true; $('number-hint-text').hidden = true; $('number-input').value = '0'; $('number-input').removeAttribute('aria-invalid'); numberStatus = '重新开始。一个反例，就能检验这句“总是”。'; renderNumbers(); renderNumberHint(); });
function renderNumberHint() {
  $('number-hint').textContent = t(!numberHint ? '✧ 给我一点灵感' : numberHint < 3 ? '再给一点提示 →' : '✧ 再看这条提示');
  if (!numberHint) return;
  $('number-hint-text').textContent = t(numberHint === 1 ? '连着几个例子成立，很容易让人相信。试着换一段数字，或者留意式子里的 11。' : numberHint === 2 ? '把前两项写成 n(n + 1)。如果其中一个数是 11 的倍数，整个结果会怎样？' : '试试让 n + 1 = 11，再亲手代入。结果大于 11，又能被 11 整除，就不可能是质数。');
}
$('number-hint').addEventListener('click', () => { numberHint++; $('number-hint-text').hidden = false; renderNumberHint(); });
if (numberTrials.length) { $('number-input').value = String(numberTrials.at(-1)); const r = showNumber(numberTrials.at(-1)); numberStatus = r.prime ? '已接上上次的尝试。这个例子成立，还能继续检验。' : '上次已找到反例。还可以继续探索。'; }
renderNumbers(); renderNumberHint();
window.addEventListener('languagechange', () => {
  renderLights(); renderLightHint(); renderCoins(coinMessage); renderCoinHint(); renderNumbers(); renderNumberHint();
  if (displayedNumber !== null) showNumber(displayedNumber);
});
