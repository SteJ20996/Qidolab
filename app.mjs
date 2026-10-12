import {markCompleted} from './completion.mjs';
import {reportOutcome} from './outcomes.mjs';
import { capacities, step, solved, same, solution, validHistory } from './engine.mjs';
import {t} from './i18n.mjs';
const $ = id => document.getElementById(id);
const labels = { fill0: '装满大壶', fill1: '装满小壶', empty0: '倒空大壶', empty1: '倒空小壶', pour01: '大壶倒入小壶', pour10: '小壶倒入大壶' };
let history = [], hintLevel = 0, statusMessage = null;
try { const saved = JSON.parse(localStorage.getItem('quidence-water-v1')); if (validHistory(saved)) history = saved; } catch {}
if (history.some(item => solved(item.state))) markCompleted('water');
const current = () => history.length ? history[history.length - 1].state : [0, 0];
function save() { try { localStorage.setItem('quidence-water-v1', JSON.stringify(history)); } catch {} }
function resetHints() { hintLevel = 0; $('hint-content').hidden = true; $('hint-next').hidden = false; renderHint(); }
function render(message = statusMessage) {
  statusMessage = message;
  const state = current(), win = solved(state);
  if (win) markCompleted('water');
  reportOutcome('water',win);
  state.forEach((amount, i) => {
    $('water' + i).style.height = `${amount / capacities[i] * 100}%`;
    $('quantity' + i).innerHTML = `${amount} <span>L</span>`;
    $('jug' + i).setAttribute('aria-label', t('{capacity} 升{size}壶，当前 {amount} 升', {capacity: capacities[i], size: t(i ? '小' : '大'), amount}));
    $('jug' + i).classList.toggle('has-water', amount / capacities[i] >= .5);
    $('jug' + i).classList.toggle('solved', amount === 5);
  });
  document.querySelectorAll('[data-action]').forEach(button => { button.disabled = same(state, step(state, button.dataset.action)); });
  $('undo').disabled = !history.length; $('reset').disabled = !history.length;
  $('step-count').textContent = t('{count} 步', {count: history.length});
  $('success').hidden = !win;
  $('hint').hidden = win;
  if (win) $('hint-content').hidden = true;
  let copy;
  if (message?.action) copy = t(message.key, {...message.params, action: t(labels[message.action])});
  else copy = message ? t(message.key, message.params) : t(history.length ? '已接上你上次的尝试。想继续，也可以重来。' : '先装满任意一只壶，看看会发生什么。');
  $('status').textContent = win ? t('刚刚好！大壶里现在有 5 升水。') : copy;
  const list = $('history-list'); list.replaceChildren();
  if (!history.length) { const li = document.createElement('li'); li.className = 'empty-history'; li.textContent = t('还没有尝试。每一步都可以撤回。'); list.append(li); }
  [...history].reverse().forEach((item, index) => {
    const li = document.createElement('li'), label = document.createElement('span'), stateLabel = document.createElement('span');
    label.textContent = `${history.length - index}. ${t(labels[item.action])}`;
    stateLabel.className = 'record-state'; stateLabel.textContent = `${item.state[0]} L / ${item.state[1]} L`;
    li.append(label, stateLabel); list.append(li);
  });
}
function act(action) {
  const previous = current(), next = step(previous, action);
  if (same(previous, next)) return;
  history.push({ action, state: next }); resetHints(); save();
  let message = {key: '{action}。大壶 {large} 升，小壶 {small} 升。', action, params: {large: next[0], small: next[1]}};
  if (action.startsWith('pour')) message = {key: '倒过去 {moved} 升。大壶 {large} 升，小壶 {small} 升。', params: {moved: Math.abs(next[0] - previous[0]), large: next[0], small: next[1]}};
  render(message);
}
document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => act(button.dataset.action)));
$('undo').addEventListener('click', () => { history.pop(); resetHints(); save(); render({key:'已撤回一步。换个想法试试。'}); });
$('reset').addEventListener('click', () => { history = []; resetHints(); save(); $('why').hidden = true; $('why-toggle').setAttribute('aria-expanded', 'false'); $('insight').hidden = true; $('reveal-insight').hidden = false; render({key:'两个空壶。重新开始，慢慢来。'}); });
$('rules-toggle').addEventListener('click', () => { const open = $('rules').hidden; $('rules').hidden = !open; $('rules-toggle').setAttribute('aria-expanded', String(open)); });
function renderHint() {
  $('hint').textContent = t(hintLevel ? '✧ 灵感在这里' : '✧ 给我一点灵感');
  $('hint-next').textContent = t(hintLevel <= 1 ? '再给一点提示 →' : '只告诉我下一步 →');
  $('hint-next').hidden = hintLevel === 3;
  if (hintLevel === 1) $('hint-text').textContent = t('不一定要直接得到 5。试着留意：倒满另一只壶以后，原来的壶会剩多少？');
  else if (hintLevel === 2) $('hint-text').textContent = t('空出来的空间也能当尺子。如果小壶里已经有 3 升，它就只能再接住 1 升。你能利用这种“差一点”吗？');
  else if (hintLevel === 3) { const next = solution(current())?.[0]; $('hint-text').textContent = next ? t('从你现在的状态，可以先试试：{action}。只看这一步，再自己探索看看。', {action: t(labels[next])}) : t('你已经量出 5 升啦。'); }
}
function hint() { hintLevel = Math.min(hintLevel + 1, 3); $('hint-content').hidden = false; renderHint(); }
$('hint').addEventListener('click', () => { if (!hintLevel) hint(); else $('hint-content').hidden = !$('hint-content').hidden; });
$('hint-next').addEventListener('click', hint);
$('why-toggle').addEventListener('click', () => { const open = $('why').hidden; $('why').hidden = !open; $('why-toggle').setAttribute('aria-expanded', String(open)); });
$('reveal-insight').addEventListener('click', () => { $('insight').hidden = false; $('reveal-insight').hidden = true; });
if (typeof window !== 'undefined') window.addEventListener('languagechange', () => { render(); renderHint(); });
render(); renderHint();
