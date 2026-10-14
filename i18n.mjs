import translations from './translations.mjs';
import {syncLanguageURL} from './language-url.mjs';
export const locales = ['zh-CN', 'en', 'es-MX', 'zh-TW'];
export let locale = 'en';
try { const saved = localStorage.getItem('quidence-locale-v1'); if (locales.includes(saved)) locale = saved; } catch {}
try {const requested=new URL(location.href).searchParams.get('lang');if(locales.includes(requested))locale=requested;}catch{}
let taiwanCopy=null,taiwanPromise=null,localeRequest=0;
function loadTaiwanCopy(){
 if(taiwanCopy)return Promise.resolve();
 if(!taiwanPromise)taiwanPromise=import('./zh-tw-copy.mjs').then(module=>{taiwanCopy=module.toTaiwanText;}).catch(error=>{taiwanPromise=null;throw error;});
 return taiwanPromise;
}
function languageError(){
 if(typeof document==='undefined'||!document.body)return;
 let note=document.getElementById('language-load-error');
 if(!note){note=document.createElement('p');note.id='language-load-error';note.className='language-load-error';note.setAttribute('role','status');document.body.prepend(note);}
 note.textContent='繁體中文暫時無法載入，請重新選取以再試一次。 The selected language could not load. Please select it again to retry.';
}
// Wait only for an initially selected Traditional Chinese locale. Other visitors
// never request the conversion table. Failed loading leaves the games usable.
if(locale==='zh-TW')try{await loadTaiwanCopy();}catch{locale='en';languageError();}
const dictionary = {...translations};
export function registerTranslations(entries) { Object.assign(dictionary, entries); }
export function regionalCopy(copy,language=locale){return language==='zh-TW'&&taiwanCopy?taiwanCopy(copy):String(copy);}
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
  const entry=dictionary[key];
  const copy = locale==='zh-TW' ? (entry?.['zh-TW']??regionalCopy(entry?.['zh-CN']??key)) : (entry?.[locale]??key);
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
        let source = sources[attribute];
        if (explicit !== null) source = {key: explicit};
        else {
          // Game renderers own live labels (jug amounts, scale results, etc.).
          // If they changed an attribute, do not restore its cached initial copy
          // when another module translates the page after loading.
          if (source && current !== source.value) source = undefined;
          if (!source && dictionary[current]) source = {key: current};
        }
        if (source) {
          const value = t(source.key);
          element.setAttribute(attribute, value);
          sources[attribute] = {key: source.key, value};
        } else delete sources[attribute];
      }
      attributeSources.set(element, sources);
    });
  }
  if (document.documentElement) document.documentElement.lang = locale;
  const select = document.getElementById?.('language-select'); if (select) select.value = locale;
}
export async function setLocale(next) {
  if (!locales.includes(next)) return locale;
  const request=++localeRequest,select=typeof document!=='undefined'?document.getElementById?.('language-select'):null;
  if(next==='zh-TW'&&!taiwanCopy){
    select?.setAttribute('aria-busy','true');
    try{await loadTaiwanCopy();}catch{if(request===localeRequest){if(select)select.value=locale;select?.removeAttribute('aria-busy');languageError();}return locale;}
    if(request!==localeRequest)return locale;
  }
  select?.removeAttribute('aria-busy');
  if(typeof document!=='undefined')document.getElementById?.('language-load-error')?.remove();
  const previous = locale; locale = next;
  try { localStorage.setItem('quidence-locale-v1', locale); } catch {}
  if(typeof document!=='undefined'){translateDOM();syncLanguageURL(document,locale);}
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('languagechange', {detail: {locale, previous}}));
  return locale;
}
if (typeof document !== 'undefined') {
  translateDOM();
  syncLanguageURL(document,locale);
  document.getElementById?.('language-select')?.addEventListener('change', event => setLocale(event.target.value));
}
