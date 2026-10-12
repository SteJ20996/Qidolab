import translations from './translations.mjs';
import {toTaiwanText} from './zh-tw-copy.mjs';
export const locales = ['zh-CN', 'en', 'es-MX', 'zh-TW'];
export let locale = 'en';
try { const saved = localStorage.getItem('quidence-locale-v1'); if (locales.includes(saved)) locale = saved; } catch {}
function withTaiwanCopy(entries){
  return Object.fromEntries(Object.entries(entries).map(([key,copies])=>[key,{...copies,'zh-TW':copies['zh-TW']??toTaiwanText(copies['zh-CN']??'')} ]));
}
const dictionary = withTaiwanCopy(translations);
export function registerTranslations(entries) { Object.assign(dictionary, withTaiwanCopy(entries)); }
export function regionalCopy(copy,language=locale){return language==='zh-TW'?toTaiwanText(copy):String(copy);}
const pluralRules = {en: new Intl.PluralRules('en'), 'es-MX': new Intl.PluralRules('es-MX')};
// Apply singular agreement while placeholders still identify the relevant quantity.
// This is intentionally limited to the count nouns used by these activities.
export function formatCountCopy(copy, params = {}, language = locale) {
  if(language==='zh-TW')return regionalCopy(copy,language);
  if (!['en', 'es-MX'].includes(language)) return String(copy);
  const rules = pluralRules[language];
  if (!Object.values(params).some(value => typeof value === 'number' && Number.isFinite(value) && rules.select(value) === 'one')) return String(copy);
  const nouns = language === 'en'
    ? {moves:'move', presses:'press', weighings:'weighing', tests:'test', swaps:'swap', minutes:'minute', people:'person', questions:'question', pieces:'piece', tasks:'task', tokens:'token', edges:'edge', numbers:'number', possibilities:'possibility', candidates:'candidate', objects:'object', clues:'clue', cells:'cell', comparisons:'comparison', colors:'color', lines:'line', points:'point', dominoes:'domino', squares:'square'}
    : {movimientos:'movimiento', toques:'toque', pesadas:'pesada', pruebas:'prueba', intercambios:'intercambio', minutos:'minuto', personas:'persona', preguntas:'pregunta', piezas:'pieza', tareas:'tarea', fichas:'ficha', líneas:'línea', números:'número', posibilidades:'posibilidad', candidatos:'candidato', objetos:'objeto', pistas:'pista', casillas:'casilla', comparaciones:'comparación', colores:'color', puntos:'punto', cuadros:'cuadro', encendidas:'encendida'};
  let result = String(copy);
  for (const [name, value] of Object.entries(params)) {
    if (typeof value !== 'number' || !Number.isFinite(value) || rules.select(value) !== 'one') continue;
    const token = `{${name}}`;
    for (const [many, one] of Object.entries(nouns)) result = result.split(`${token} ${many}`).join(`${token} ${one}`);
    if (language === 'en') {
      result = result.split(`${token} remain`).join(`${token} remains`);
      for (const adjective of ['missing', 'extra']) result = result.split(`${token} ${adjective} cells`).join(`${token} ${adjective} cell`);
      for (const noun of ['token', 'possibility']) result = result.split(`${token} ${noun} remain`).join(`${token} ${noun} remains`);
      result = result.split(`${token} clue hold`).join(`${token} clue holds`).split(`${token} line have`).join(`${token} line has`);
    } else {
      for (const [many, one] of [['Quedan','Queda'],['quedan','queda'],['faltan','falta'],['sobran','sobra'],['Se quitaron','Se quitó'],['se cumplen','se cumple'],['Se cumplen','Se cumple'],['coinciden','coincide']]) result = result.split(`${many} ${token}`).join(`${one} ${token}`);
      result = result.split(`${token} minuto usados`).join(`${token} minuto usado`).split(`${token} color usados`).join(`${token} color usado`).split(`${token} casilla elegidas`).join(`${token} casilla elegida`).split(`${token} ficha colocadas`).join(`${token} ficha colocada`);
    }
  }
  return result;
}
export function t(key, params = {}) {
  const copy = dictionary[key]?.[locale] ?? key;
  return formatCountCopy(copy, params).replace(/\{(\w+)\}/g, (match, name) => params[name] ?? match);
}
const textSources = new WeakMap(), attributeSources = new WeakMap();
const translatedAttributes = ['aria-label', 'title', 'placeholder', 'content'];
// Keep text nodes and controls in place: a language change never recreates a game.
export function translateDOM(root = document) {
  if (!root?.querySelectorAll) return;
  root.querySelectorAll('[data-i18n], [data-i18n-html]').forEach(element => {
    const key = element.dataset.i18n ?? element.dataset.i18nHtml;
    if (element.dataset.i18nHtml !== undefined) element.innerHTML = t(key); else element.textContent = t(key);
  });
  if (document.createTreeWalker) {
    const walker = document.createTreeWalker(root, 4);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (['SCRIPT', 'STYLE'].includes(node.parentElement?.tagName) || node.parentElement?.closest('[data-i18n], [data-i18n-html]')) continue;
      if (!textSources.has(node) && dictionary[node.data.trim()]) textSources.set(node, node.data);
      const source = textSources.get(node);
      if (source !== undefined) node.data = source.replace(source.trim(), t(source.trim()));
    }
    root.querySelectorAll('*').forEach(element => {
      const sources = attributeSources.get(element) || {};
      for (const attribute of translatedAttributes) {
        const explicit = element.getAttribute(`data-i18n-${attribute}`), current = element.getAttribute(attribute);
        if (explicit !== null) sources[attribute] = explicit;
        else if (!(attribute in sources) && dictionary[current]) sources[attribute] = current;
        if (attribute in sources) element.setAttribute(attribute, t(sources[attribute]));
      }
      attributeSources.set(element, sources);
    });
  }
  if (document.documentElement) document.documentElement.lang = locale;
  const select = document.getElementById?.('language-select'); if (select) select.value = locale;
}
export function setLocale(next) {
  if (!locales.includes(next) || next === locale) return;
  const previous = locale; locale = next;
  try { localStorage.setItem('quidence-locale-v1', locale); } catch {}
  translateDOM();
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('languagechange', {detail: {locale, previous}}));
}
if (typeof document !== 'undefined') {
  translateDOM();
  document.getElementById?.('language-select')?.addEventListener('change', event => setLocale(event.target.value));
}
