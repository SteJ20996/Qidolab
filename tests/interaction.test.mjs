import assert from 'node:assert/strict';
import test, {after} from 'node:test';
import {readFile} from 'node:fs/promises';
import {JSDOM, VirtualConsole} from 'jsdom';

const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', error => errors.push(error));
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const dom = new JSDOM(html, {url: 'https://qidolab.test/', pretendToBeVisual: true, virtualConsole});
const {window} = dom;
for (const key of ['window', 'document', 'localStorage', 'location', 'Event', 'CustomEvent', 'MutationObserver', 'HTMLElement']) globalThis[key] = window[key];
globalThis.getComputedStyle = window.getComputedStyle.bind(window);
window.matchMedia = () => ({matches: false, addEventListener() {}, removeEventListener() {}});
window.HTMLElement.prototype.scrollIntoView = function () {};
window.HTMLDialogElement.prototype.showModal = function () {this.open = true;};
window.HTMLDialogElement.prototype.close = function () {this.open = false;};
localStorage.setItem('quidence-locale-v1', 'zh-TW');
localStorage.setItem('quidence-water-v1', JSON.stringify([
  {action: 'fill0', state: [7, 0]}, {action: 'pour01', state: [3, 4]}
]));
for (const script of document.querySelectorAll('script[type="module"][src]')) {
  // Geometry needs a real browser; this suite exercises the application DOM.
  if (script.getAttribute('src') === 'orbit-layout.mjs') continue;
  await import(new URL('../' + script.getAttribute('src').split('?')[0], import.meta.url));
}
const {locales, setLocale, translateDOM} = await import('../i18n.mjs');
const {visibleActivities} = await import('../catalog.mjs');
const $ = id => document.getElementById(id);
const click = id => {assert.ok($(id), id); assert.equal($(id).disabled, false, `${id} enabled`); $(id).click();};
const text = id => $(id).textContent.trim();
const route = id => {window.history.replaceState(null, '', '#' + id); window.dispatchEvent(new window.HashChangeEvent('hashchange'));};
const saves = () => Object.fromEntries(Object.keys(localStorage).filter(key => key !== 'quidence-locale-v1').sort().map(key => [key, localStorage.getItem(key)]));
after(() => window.close());
const choose = selector => {const el = document.querySelector(selector); assert.ok(el, selector); assert.equal(el.disabled, false, selector); el.click();};
const input = (id, value) => {$(id).value = value; $(id).dispatchEvent(new Event('input', {bubbles: true}));};
const submit = id => $(id).dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
const saved = id => JSON.parse(localStorage.getItem('quidence-' + id + '-v1'));

test('cold startup restores Traditional Chinese and announces the saved water amounts', () => {
  assert.equal(document.documentElement.lang, 'zh-TW');
  assert.equal($('language-select').value, 'zh-TW');
  assert.match(text('title'), /剛剛好/);
  assert.match(text('quantity0'), /^3/);
  assert.match(text('quantity1'), /^4/);
  assert.match($('jug0').getAttribute('aria-label'), /當前 3 升/);
  assert.match($('jug1').getAttribute('aria-label'), /當前 4 升/);
});

test('page IDs are unique and the Quidence link names its own heading in every language', () => {
  const ids = [...document.querySelectorAll('[id]')].map(el => el.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate IDs break labels and game selectors');
  for (const language of locales) {
    setLocale(language);
    const bridge = $('brand-bridge');
    const title = $(bridge.getAttribute('aria-labelledby'));
    assert.ok(bridge.contains(title));
    assert.ok(title.textContent.trim());
    assert.notEqual(title, $('bridge-title'), 'the promotion must not use the bridge puzzle title');
    for (const id of bridge.querySelector('a').getAttribute('aria-labelledby').split(' ')) assert.ok(bridge.contains($(id)));
  }
});

test('localized collection names keep their nested link labels and decorative arrow', () => {
  const names = {
    en: ['Think Again!', 'Just One More'],
    'zh-CN': ['十八般脑洞', '数字不打烊'],
    'zh-TW': ['十八般腦洞', '數字不打烊'],
    'es-MX': ['Dale una vuelta', '¡Una más!']
  };
  for (const language of [...locales, ...locales].reverse()) {
    setLocale(language);
    translateDOM();
    const [original, more] = names[language];
    assert.equal(document.querySelector('.collection-name').textContent, original);
    assert.equal(document.querySelector('[data-collection=more] [data-collection-text=moreName]').textContent, more);
    assert.equal(document.querySelector('[data-collection=more] .collection-state').textContent, '↗');
    assert.equal(document.querySelector('[data-collection=more]').getAttribute('href'), './2/');
    assert.ok(document.querySelector('[data-i18n="branch.audience"]').textContent.trim());
  }
});

test('each original accepts moves, keeps them through language changes, and supports its reset/undo path', () => {
  const scenarios = {
    lights() {choose('#lights-ring button'); assert.equal(saved('lights').length, 1); return 'lights-undo';},
    coins() {click('coins-new'); choose('[data-pan="left"]'); choose('#coin-tray button:nth-child(1)'); choose('[data-pan="right"]'); choose('#coin-tray button:nth-child(2)'); click('coins-weigh'); assert.equal(saved('coins').rounds.length, 1); return 'coins-new';},
    numbers() {input('number-input', '2'); submit('number-form'); assert.match(text('number-result'), /17/); return 'number-reset';},
    clock() {click('clock-add-4'); assert.deepEqual(saved('clock').moves, [4]); return 'clock-undo';},
    tiles() {choose('#tiles-board [data-cell="1"]'); choose('#tiles-board [data-cell="2"]'); assert.equal(saved('tiles').history.at(-1).length, 1); return 'tiles-undo';},
    sums() {choose('#sums-board button:nth-of-type(1)'); choose('#sums-board button:nth-of-type(2)'); assert.equal(saved('sums').moves.length, 1); return 'sums-undo';},
    bridge() {click('bridge-person-0'); click('bridge-person-1'); click('bridge-cross'); assert.equal(saved('bridge').moves.length, 1); return 'bridge-undo';},
    takeaway() {click('takeaway-take-1'); assert.equal(saved('takeaway').moves.length, 1); return 'takeaway-undo';},
    path() {click('path-node-A'); assert.ok(saved('path').moves.length); return 'path-undo';},
    search() {input('search-input', '31'); submit('search-form'); assert.equal(saved('search').cuts.length, 1); return 'search-undo';},
    logic() {click('logic-item-shell'); click('logic-slot-0'); assert.equal(saved('logic').moves.length, 1); return 'logic-undo';},
    probability() {choose('#probability-grid button'); input('probability-numerator', '1'); input('probability-denominator', '0'); submit('probability-form'); assert.equal(saved('probability').selected.length, 1); assert.ok(text('probability-status')); return 'probability-reset';},
    sorting() {click('sorting-add-0-1'); click('sorting-test'); assert.equal(saved('sorting').network.length, 1); return 'sorting-undo';},
    schedule() {input('schedule-start', '0'); click('schedule-place'); assert.equal(saved('schedule').placements.length, 1); return 'schedule-reset';},
    coloring() {click('coloring-node-A'); assert.equal(saved('coloring').colors[0], 0); return 'coloring-reset';},
    fractions() {click('fractions-piece-2'); assert.equal(saved('fractions').moves.length, 1); return 'fractions-undo';},
    reflection() {click('reflection-vertex-0'); click('reflection-vertex-1'); click('reflection-merge'); assert.ok(text('reflection-groups')); return 'reflection-undo';}
  };
  for (const language of locales) {
    setLocale(language);
    for (const [id, act] of Object.entries(scenarios)) {
      route(id);
      const undo = act();
      const before = saves();
      setLocale(locales[(locales.indexOf(language) + 1) % locales.length]);
      assert.deepEqual(saves(), before, `${language}/${id}: saved state after switching language`);
      setLocale(language);
      assert.ok(text(id === 'numbers' ? 'number-status' : id + '-status'), `${language}/${id}: feedback`);
      click(undo);
      assert.deepEqual(errors, [], `${language}/${id}: no event errors`);
    }
  }
});

test('all 18 originals render named controls, working hints and language changes without losing saved moves', () => {
  for (const language of locales) {
    setLocale(language);
    for (const id of visibleActivities) {
      route(id);
      assert.equal($('activity-' + id).hidden, false, `${language}/${id}: visible`);
      if (['en', 'es-MX'].includes(language)) {
        const walker = document.createTreeWalker($('activity-' + id), window.NodeFilter.SHOW_TEXT);
        const visibleText = [];
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (!node.parentElement.closest('[hidden]')) visibleText.push(node.data);
        }
        const leaked = visibleText.join(' ').match(/.{0,25}[\u3400-\u9fff].{0,25}/);
        assert.equal(leaked, null, `${language}/${id}: untranslated copy ${leaked?.[0]}`);
      }
      assert.ok(text(id === 'water' ? 'title' : id + '-title'), `${language}/${id}: title`);
      const link = document.querySelector(`[data-activity="${id}"]`);
      assert.ok(link.querySelector('span:not([aria-hidden])')?.textContent.trim() || link.getAttribute('aria-label')?.trim(), `${language}/${id}: navigation name`);
      for (const el of $('activity-' + id).querySelectorAll('[data-i18n], [data-i18n-html]')) {
        assert.ok(el.textContent.trim(), `${language}/${id}: ${el.dataset.i18n ?? el.dataset.i18nHtml}`);
      }
      const prefix = id === 'numbers' ? 'number' : id;
      const hint = id === 'water' ? 'hint' : prefix + '-hint';
      if ($(hint) && !$(hint).hidden) {
        click(hint);
        assert.ok(text(id === 'water' ? 'hint-text' : prefix + '-hint-text'), `${language}/${id}: hint`);
      }
    }
    const before = saves();
    setLocale(locales[(locales.indexOf(language) + 1) % locales.length]);
    assert.deepEqual(saves(), before, `${language}: changing language keeps game saves`);
  }
  assert.deepEqual(errors, []);
});

test('water fill, pour, undo, reset, history and hints work in every language', () => {
  route('water');
  for (const language of locales) {
    setLocale(language);
    if (!$('reset').disabled) click('reset');
    document.querySelector('[data-action="fill0"]').click();
    assert.match(text('quantity0'), /^7/);
    document.querySelector('[data-action="pour01"]').click();
    assert.match(text('quantity0'), /^3/);
    assert.match(text('quantity1'), /^4/);
    const labels = [$('jug0').getAttribute('aria-label'), $('jug1').getAttribute('aria-label')];
    assert.match(labels[0], /3/);
    assert.match(labels[1], /4/);
    translateDOM();
    assert.deepEqual([$('jug0').getAttribute('aria-label'), $('jug1').getAttribute('aria-label')], labels, 'later modules must not restore the initial empty-jug labels');
    assert.ok(text('status'));
    assert.equal($('history-list').children.length, 2);
    const before = saves();
    const next = locales[(locales.indexOf(language) + 1) % locales.length];
    setLocale(next);
    assert.deepEqual(saves(), before);
    assert.match(text('quantity0'), /^3/);
    click('undo');
    assert.match(text('quantity0'), /^7/);
    click('reset');
    assert.match(text('quantity0'), /^0/);
    click('hint'); click('hint-next'); click('hint-next');
    assert.ok(text('hint-text'));
  }
  assert.deepEqual(errors, []);
});

test('repeated DOM translation preserves live accessible values but keeps translating static labels', () => {
  setLocale('zh-CN');
  const fixture = document.createElement('div');
  fixture.innerHTML = '<div id="live-copy" aria-label="7 升大壶，当前 0 升"></div><button title="怎么玩">?</button>';
  document.body.append(fixture);
  translateDOM(fixture);
  const live = fixture.firstElementChild;
  live.setAttribute('aria-label', '7 升大壺，當前 3 升');
  translateDOM(fixture);
  assert.equal(live.getAttribute('aria-label'), '7 升大壺，當前 3 升');
  setLocale('en');
  assert.equal(live.getAttribute('aria-label'), '7 升大壺，當前 3 升', 'the game owns the current dynamic value');
  assert.equal(fixture.querySelector('button').title, 'How to play');
  fixture.remove();
});

test('all 18 extra steps and extremes retain answers across all languages', async () => {
  const {markCompleted} = await import('../completion.mjs');
  const {answerViewed, crownCompletion} = await import('../crown-progress.mjs');
  // Only this isolated DOM fixture unlocks routes, never a real visitor's progress.
  for (const id of visibleActivities) markCompleted(id);
  for (const language of locales) {
    setLocale(language);
    for (const id of visibleActivities) {
      route(id + '/next');
      assert.equal($('activity-next').hidden, false);
      assert.ok(text('branch-title'), `${language}/${id}/next: title`);
      if (!$('branch-restart').hidden) click('branch-restart');
      choose('#branch-first-options button'); click('branch-commit'); click('branch-inspect');
      assert.ok(text('branch-evidence-copy'));
      choose('#branch-review-options button'); click('branch-commit-review');
      const branchBefore = saves();
      setLocale(locales[(locales.indexOf(language) + 1) % locales.length]);
      assert.deepEqual(saves(), branchBefore, `${language}/${id}/next: prediction and review`);
      setLocale(language);
      route(id + '/extreme');
      assert.equal($('activity-extreme').hidden, false);
      for (const name of ['extreme-title', 'extreme-rules', 'extreme-verify']) assert.ok(text(name), `${language}/${id}: ${name}`);
      input('extreme-input-0', 'test draft');
      const before = saves();
      setLocale(locales[(locales.indexOf(language) + 1) % locales.length]);
      assert.equal($('extreme-input-0').value, 'test draft');
      assert.deepEqual(saves(), before, `${language}/${id}/extreme: draft`);
      setLocale(language);
      submit('extreme-form');
      assert.ok(text('extreme-status'), `${language}/${id}: invalid-answer feedback`);
      assert.equal(crownCompletion.has(id), false, 'invalid input cannot earn a crown');
      click('extreme-hint'); assert.ok(text('extreme-hint-copy'));
      if ($('extreme-solution').hidden) click('extreme-view-answer');
      assert.equal($('extreme-solution').hidden, false);
      assert.ok(text('extreme-solution'));
      assert.equal(answerViewed.has(id), true);
      assert.equal(crownCompletion.has(id), false, 'viewing an answer cannot earn completion');
      click('extreme-reset');
      assert.equal($('extreme-input-0').value, '');
      assert.deepEqual(errors, [], `${language}/${id}: no event errors`);
    }
  }
});
