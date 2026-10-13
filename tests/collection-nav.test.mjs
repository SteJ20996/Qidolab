import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {initCollectionNav, collectionCopy} from '../collection-nav.mjs';

for (const [path, current] of [['index.html', 'original'], ['2/index.html', 'more']]) {
  test(`${path}: collection links work before scripts and retain icons in every language`, async () => {
    const docUrl = path === 'index.html' ? 'https://qidolab.test/' : 'https://qidolab.test/2/';
    const dom = new JSDOM(readFileSync(new URL('../' + path, import.meta.url), 'utf8'), {url: docUrl});
    const doc = dom.window.document;
    const nav = doc.querySelector('.collection-switch');
    assert.equal(nav.querySelectorAll('a').length, 2);
    assert.equal(nav.querySelectorAll('[aria-current]').length, 1);
    assert.equal(nav.querySelector('[aria-current]').dataset.collection, current);
    assert.equal(nav.querySelector('[data-collection=original]').href, 'https://qidolab.test/');
    assert.equal(nav.querySelector('[data-collection=more]').href, 'https://qidolab.test/2/');
    assert.ok(doc.querySelector('header').compareDocumentPosition(nav) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
    for (const link of nav.querySelectorAll('a')) assert.ok(link.textContent.trim());
    const artwork = [...nav.querySelectorAll('svg')];
    const dispose = initCollectionNav(doc);
    for (const [i, lang] of ['en', 'zh-CN', 'zh-TW', 'es-MX'].entries()) {
      doc.documentElement.lang = lang;
      await Promise.resolve();
      assert.equal(nav.getAttribute('aria-label'), collectionCopy.label[i]);
      for (const el of nav.querySelectorAll('[data-collection-text]')) {
        assert.equal(el.textContent, collectionCopy[el.dataset.collectionText][i]);
      }
      assert.deepEqual([...nav.querySelectorAll('svg')], artwork);
      assert.equal(nav.querySelector('[aria-current] .collection-state').textContent, '✓');
      assert.equal(nav.querySelector('a:not([aria-current]) .collection-state').textContent, '↗');
    }
    dispose(); dom.window.close();
  });
}
