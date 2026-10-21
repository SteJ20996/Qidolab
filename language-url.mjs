export const languageCodes=['en','zh-CN','zh-TW','es-MX'];
const pages={
 '/': {en:['Think Again!','18 brain games. Try a different move, then choose whether to go further.'], 'zh-CN':['十八般脑洞','18 个小游戏，换个思路试试，再决定要不要挑战下一步。'],'zh-TW':['十八般腦洞','18 個小遊戲，換個思路試試，再決定要不要挑戰下一步。'],'es-MX':['Dale una vuelta','18 juegos para pensar. Prueba otra jugada y decide si quieres ir más allá.']},
 '/2/':{en:['Just One More · Make 24 and Codebreaker','Combine numbers to make 24 or find a secret code, with fresh rounds and optional hints.'],'zh-CN':['数字不打烊 · 24点与密码','组合数字得到24，或推理秘密密码。提供新题和可选提示。'],'zh-TW':['數字不打烊 · 24點與密碼','組合數字得到24，或推理秘密密碼。提供新題和可選提示。'],'es-MX':['¡Una más! · Forma 24 y descifra el código','Combina números para formar 24 o descubre un código secreto, con nuevas rondas y pistas opcionales.']},
 '/2/experiments/':{en:['Just One More · Repair and Borrow','Repair one operation or borrow and return a number. Explore two step-by-step puzzle games.'],'zh-CN':['数字不打烊 · 修复与借还','修复一步运算，或借用再归还一个数。逐步探索两种谜题。'],'zh-TW':['數字不打烊 · 修復與借還','修復一步運算，或借用再歸還一個數。逐步探索兩種謎題。'],'es-MX':['¡Una más! · Repara y devuelve','Repara una operación o toma prestado y devuelve un número. Explora dos juegos paso a paso.']},
 '/next/':{en:['Just One More · Four More Games','Explore echo steps, mixed clues, two-way tally and both-ways puzzles with guided introductions.'],'zh-CN':['数字不打烊 · 四种新玩法','探索回声、混合线索、双向计数与双向运算谜题，附分步玩法介绍。'],'zh-TW':['數字不打烊 · 四種新玩法','探索回聲、混合線索、雙向計數與雙向運算謎題，附逐步玩法介紹。'],'es-MX':['¡Una más! · Cuatro juegos más','Explora pasos con eco, pistas mezcladas, conteos y operaciones en ambas direcciones con guías paso a paso.']},
 '/classics/':{en:['Old Tricks, New Moves · Four Classic Puzzles','Play four classic puzzle ideas with original interactive explanations: fox search, river crossing, disk towers and queens.'],'zh-CN':['经典换个玩 · 四种经典谜题','探索狐狸搜查、过河、搬盘塔与皇后排布四种经典机制，附原创互动教学。'],'zh-TW':['經典換個玩 · 四種經典謎題','探索狐狸搜查、過河、搬盤塔與皇后排布四種經典機制，附原創互動教學。'],'es-MX':['Clásicos con giro · Cuatro acertijos','Juega cuatro ideas clásicas con guías interactivas originales: el zorro, el río, las torres y las reinas.']}
};
const privacyLabels={en:'Privacy and local progress','zh-CN':'隐私与本地进度','zh-TW':'隱私與本機進度','es-MX':'Privacidad y progreso local'};
export function syncLanguageURL(doc,language){
 const win=doc.defaultView;if(!win?.location||!languageCodes.includes(language))return;
 // A language opened directly by URL must also carry into the next collection.
 try{if(win.localStorage.getItem('quidence-locale-v1')!==language)win.localStorage.setItem('quidence-locale-v1',language);}catch{}
 const url=new URL(win.location.href);url.searchParams.set('lang',language);
 if(url.href!==win.location.href)win.history.replaceState(win.history.state,'',url);
 const route=url.pathname.replace(/index\.html$/,'');const copy=pages[route]?.[language];
 if(copy){
  doc.title='Qidolab · '+copy[0];
  let description=doc.querySelector('meta[name="description"]');if(!description){description=doc.createElement('meta');description.name='description';doc.head.append(description);}description.content=copy[1];
  const canonical=new URL(route,'https://qidolab.com');canonical.searchParams.set('lang',language);
  let link=doc.querySelector('link[rel="canonical"]');if(!link){link=doc.createElement('link');link.rel='canonical';doc.head.append(link);}link.href=canonical.href;
  for(const code of [...languageCodes,'x-default']){let alternate=doc.querySelector('link[rel="alternate"][hreflang="'+code+'"]');if(!alternate){alternate=doc.createElement('link');alternate.rel='alternate';alternate.hreflang=code;doc.head.append(alternate);}const destination=new URL(route,'https://qidolab.com');destination.searchParams.set('lang',code==='x-default'?'en':code);alternate.href=destination.href;}
  for(const [property,value]of [['og:url',canonical.href],['og:title',doc.title],['og:description',copy[1]]]){const meta=doc.querySelector('meta[property="'+property+'"]');if(meta)meta.content=value;}
 }
 for(const link of doc.querySelectorAll('[data-privacy-link]')){link.textContent=privacyLabels[language];link.href='/privacy/?lang='+language;}
}
export {pages};
