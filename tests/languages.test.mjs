import assert from 'node:assert/strict';
import test from 'node:test';
import translations from '../translations.mjs';
import {locales, setLocale, t, registerTranslations} from '../i18n.mjs';
import {toTaiwanText} from '../zh-tw-copy.mjs';

test('every source-keyed translation has nonempty copy and preserves placeholders in all four languages', async () => {
  for (const language of locales) {
    // This suite runs without a document; changing language only changes copy.
    globalThis.document = {};
    await setLocale(language);
    for (const [key, copies] of Object.entries(translations)) {
      assert.ok(t(key).trim(), `${language}: ${key}`);
      assert.deepEqual([...new Set(t(key).match(/\{\w+\}/g) ?? [])].sort(), [...new Set(key.match(/\{\w+\}/g) ?? [])].sort(), `${language}: placeholders in ${key}`);
      if (language === 'zh-TW') assert.equal(t(key), toTaiwanText(copies['zh-CN']));
    }
  }
});

test('regional fallback supports source keys, named keys and explicit Taiwan wording', async () => {
  registerTranslations({
    '装满水壶': {en: 'Fill the jug', 'es-MX': 'Llenar la jarra'},
    sampleNamed: {'zh-CN': '选择一个实验', en: 'Choose an experiment'},
    sampleAuthored: {'zh-CN': '提交', 'zh-TW': '確認送出'}
  });
  await setLocale('zh-TW');
  assert.equal(t('装满水壶'), '裝滿水壺');
  assert.equal(t('sampleNamed'), '選擇一個實驗');
  assert.equal(t('sampleAuthored'), '確認送出');
  assert.match(t('还亮着 {count} 盏 · 已按 {moves} 次。点任意一盏试试。', {count: 3, moves: 1}), /3.*1/);
});
