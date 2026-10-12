import {regionalCopy} from './i18n.mjs';
import {JOSEPHUS_KEY,chiliState} from './josephus-engine.mjs';
export const CHILI_COPY={
 title:['72 人辣椒圈','The 72-person chili circle','El círculo de chile de 72 personas'],
 rule:['固定座位 1–72，顺时针报数。1 号先报 1，每数到 3，那个人吃到辣椒、去旁边喝水休息，不再报数。下一位从 1 重新报；空座位直接跳过。','Seats stay numbered 1–72, counting clockwise. Seat 1 counts first as 1. Every third person gets a chili and rests with water, leaving the count. The next person starts again at 1; skip empty seats.','Los lugares siguen numerados del 1 al 72 y se cuenta en sentido horario. El lugar 1 empieza diciendo 1. Cada tercera persona recibe un chile y descansa con agua, dejando de contar. La siguiente empieza otra vez en 1; se saltan los lugares vacíos.'],
 next:['下一位吃辣椒 🌶️','Next chili 🌶️','Siguiente chile 🌶️'],finish:['直接模拟到最后','Simulate to the end','Simular hasta el final'],reset:['从头再来','Restart the circle','Reiniciar el círculo'],
 start:['还没人吃到辣椒。1 号开始报 1，第一位会是 3 号。','No chilies yet. Seat 1 starts at 1; seat 3 gets the first chili.','Aún nadie recibe chile. El lugar 1 empieza en 1; el lugar 3 recibe el primero.'],
 status:['{last} 号吃到辣椒，下一轮从 {start} 号报 1。还有 {count} 人继续报数。','Seat {last} gets a chili. Seat {start} starts the next count at 1. {count} people still count.','El lugar {last} recibe chile. El {start} inicia la siguiente cuenta en 1. Siguen contando {count} personas.'],
 done:['最后是 {winner} 号还没吃到辣椒！其余 71 人都已休息。','Seat {winner} is the last one without a chili! The other 71 are resting.','¡El lugar {winner} es el último sin chile! Los otros 71 descansan.'],
 count:['已吃辣椒：{count} / 71 人','Chilies received: {count} / 71 people','Recibieron chile: {count} de 71 personas'],
 legend:['绿色：仍在报数 · 淡色划线：已吃辣椒休息 · 金圈：下一轮先报 1 的人','Green: still counting · Faded and crossed: resting with a chili · Gold ring: next person to count 1','Verde: siguen contando · Tenue y tachado: descansan con chile · Anillo dorado: quien cuenta 1 después'],
 alive:['展开查看仍在报数的座位','See seats still counting','Ver lugares que siguen contando'],
 order:['查看吃辣椒的先后顺序','See the chili order','Ver el orden de los chiles'],
 diagram:['72 个固定座位的圆环。已休息 {count} 人，剩余座位：{alive}。','Circle of 72 fixed seats. {count} people resting; seats still counting: {alive}.','Círculo de 72 lugares fijos. Descansan {count} personas; siguen contando los lugares: {alive}.']
};
export function installChili(parent,onChange){
 const $=id=>document.getElementById(id),tr=(key,params={})=>regionalCopy(CHILI_COPY[key][document.documentElement.lang==='es-MX'?2:document.documentElement.lang==='en'?1:0],document.documentElement.lang).replace(/\{(\w+)\}/g,(_,key)=>String(params[key]??`{${key}}`));
 parent.insertAdjacentHTML('beforeend',`<section id="chili-ring" class="chili-ring" hidden aria-labelledby="chili-title"><h3 id="chili-title"></h3><p id="chili-rule"></p><svg id="chili-diagram" viewBox="0 0 520 520" role="img" focusable="false"></svg><p id="chili-legend"></p><p id="chili-status" role="status" aria-live="polite"></p><p id="chili-count"></p><div class="chili-controls"><button id="chili-next" type="button"></button><button id="chili-finish" type="button"></button><button id="chili-reset" type="button"></button></div><details><summary id="chili-alive-label"></summary><div id="chili-alive" class="chili-alive"></div></details><details><summary id="chili-order-label"></summary><p id="chili-order"></p></details></section>`);
 let steps=0;try{const record=JSON.parse(localStorage.getItem(JOSEPHUS_KEY));if(record?.version===1){chiliState(record.steps);steps=record.steps;}}catch{}
 const save=()=>{try{localStorage.setItem(JOSEPHUS_KEY,JSON.stringify({version:1,steps}));}catch{}};
 const change=value=>{steps=value;save();render();onChange();};
 $('chili-next').addEventListener('click',()=>change(Math.min(71,steps+1)));$('chili-finish').addEventListener('click',()=>change(71));$('chili-reset').addEventListener('click',()=>change(0));
 function render(){
  const state=chiliState(steps);for(const [id,key] of [['chili-title','title'],['chili-rule','rule'],['chili-legend','legend'],['chili-next','next'],['chili-finish','finish'],['chili-reset','reset'],['chili-alive-label','alive'],['chili-order-label','order']])$(id).textContent=tr(key);
  $('chili-status').textContent=tr(state.done?'done':steps?'status':'start',{winner:state.winner,last:state.last,start:state.nextStart,count:state.alive.length});$('chili-count').textContent=tr('count',{count:steps});$('chili-next').disabled=state.done;$('chili-finish').disabled=state.done;$('chili-reset').disabled=!steps;
  const alive=new Set(state.alive);let svg='<circle cx="260" cy="260" r="210" fill="none" stroke="#ccd8cb"/>';
  for(let seat=1;seat<=72;seat++){const angle=-Math.PI/2+(seat-1)*2*Math.PI/72,x=260+210*Math.cos(angle),y=260+210*Math.sin(angle),active=alive.has(seat),start=seat===state.nextStart;svg+=`<circle cx="${x}" cy="${y}" r="10" fill="${active?'#e2eee5':'#f0ece7'}" stroke="${start?'#ad7a2a':'none'}" stroke-width="2"/><text x="${x}" y="${y+5}" font-size="14" text-anchor="middle" fill="${active?'#215745':'#8b7d74'}">${seat}</text>${active?'':`<path d="M${x-7} ${y+7}L${x+7} ${y-7}" stroke="#8b7d74"/>`}`;}
  svg+=`<text x="260" y="268" font-size="36" text-anchor="middle" fill="#215745">${state.done?state.winner:state.alive.length}</text>`;$('chili-diagram').innerHTML=svg;$('chili-diagram').setAttribute('aria-label',tr('diagram',{count:steps,alive:state.alive.join(', ')}));
  $('chili-alive').replaceChildren();state.alive.forEach(seat=>{const item=document.createElement('span');item.textContent=String(seat);$('chili-alive').append(item);});$('chili-order').textContent=state.eaten.join(' → ');
 }
 render();return {render,getState:()=>chiliState(steps),reset(){steps=0;save();render();}};
}
