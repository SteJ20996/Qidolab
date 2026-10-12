import {regionalCopy} from './i18n.mjs';
import {registerTranslations} from './i18n.mjs';
import {markCompleted} from './completion.mjs';
import {reportOutcome} from './outcomes.mjs';
import {MIRROR_3D_KEY,MIRROR_3D_LIMIT,MIRROR_ROUNDS,freshMirror,mirrorState,mirrorMove,mirrorCandidates,mirrorOrder,reflect3D,CAMERA_DEFAULT,validCamera,mirrorScene} from './reflection-3d-engine.mjs';
export const MIRROR_3D_COPY={
 reflectionNav:['空间镜像','Space mirrors','Espejos en el espacio'],
 reflectionEyebrow:['换个视角，关系还成立吗？','A new viewpoint. The same relationships?','¿Se conserva la relación desde otra vista?'],
 reflectionTitle:['哪个几何体，才是镜中的它？','Which solid belongs in the mirror?','¿Cuál sólido es su reflejo?'],
 reflectionPremise:['观察三维坐标系中的不规则四面体 ABCD。浅色平面是镜面，从四个候选几何体中找出它的镜像。A′ 必须对应 A，其他顶点也一样；位置和方向都要正确。完成三组不同镜面，才算完成这一题。','Observe the irregular tetrahedron ABCD in 3D coordinates. The pale plane is the mirror. Find its reflection among four solids. A′ must match A, and so must the other labeled vertices; position and orientation both matter. Solve all three mirrors to complete the activity.','Observa el tetraedro irregular ABCD en coordenadas 3D. El plano claro es el espejo. Encuentra su reflejo entre cuatro sólidos. A′ debe corresponder a A, y lo mismo para los demás vértices; importan la posición y la orientación. Resuelve los tres espejos para completar el reto.'],
 reflectionRule:['先选一个候选，再点“验证镜像”。可以用箭头转动视角；原图和四个候选会同步转动，图形本身的位置不变。需要时展开坐标表核对。','Select a candidate, then check it. The arrow buttons rotate the viewpoint for the original and all four candidates together; the solids stay in place. Open the coordinate table when you need it.','Elige un candidato y compruébalo. Las flechas giran la vista del original y los cuatro candidatos juntos; los sólidos permanecen en su lugar. Abre la tabla de coordenadas si la necesitas.'],
 reflectionLabel:['三维镜像实验','3D mirror experiment','Experimento de reflejo 3D'],
 reflectionCount:['已完成 {count} / 3 组','{count} / 3 mirrors solved','{count} de 3 espejos resueltos'],
 reflectionRound:['第 {round} 组 · 镜面 {plane}','Round {round} · mirror {plane}','Ronda {round} · espejo {plane}'],
 reflectionOriginal:['原几何体 ABCD','Original solid ABCD','Sólido original ABCD'],
 reflectionCandidate:['候选 {letter}','Candidate {letter}','Candidato {letter}'],
 reflectionCandidateAria:['选择候选 {letter}，顶点为 {points}','Choose candidate {letter}, with vertices {points}','Elige el candidato {letter}, con vértices {points}'],
 reflectionSceneAria:['镜面 {plane}；{name}；顶点 {points}。可用视角按钮转动。','Mirror {plane}; {name}; vertices {points}. Use the viewpoint buttons to rotate.','Espejo {plane}; {name}; vértices {points}. Usa los botones de vista para girar.'],
 reflectionLegend:['浅色平面：镜面 · 彩色圆点与字母：对应顶点 · x、y、z：固定坐标轴 · O：原点','Pale plane: mirror · Colored dots and letters: corresponding vertices · x, y, z: fixed axes · O: origin','Plano claro: espejo · Puntos de color y letras: vértices correspondientes · x, y, z: ejes fijos · O: origen'],
 reflectionCoordinates:['查看原图与候选的坐标','See original and candidate coordinates','Ver coordenadas del original y los candidatos'],
 reflectionVertex:['顶点','Vertex','Vértice'],
 reflectionViewLeft:['向左转动视角','Turn viewpoint left','Girar la vista a la izquierda'],
 reflectionViewRight:['向右转动视角','Turn viewpoint right','Girar la vista a la derecha'],
 reflectionViewUp:['从更高处观察','View from higher up','Ver desde más arriba'],
 reflectionViewDown:['从更低处观察','View from lower down','Ver desde más abajo'],
 reflectionViewReset:['恢复视角','Reset view','Restablecer vista'],
 reflectionCheck:['验证镜像','Check reflection','Comprobar reflejo'],
 reflectionNext:['下一组镜面 →','Next mirror →','Siguiente espejo →'],
 reflectionStart:['先选一个候选。大小、形状相同，还不一定是这个镜面的镜像。','Choose a candidate. Matching size and shape alone do not make it the reflection in this mirror.','Elige un candidato. Tener el mismo tamaño y forma no basta para ser el reflejo en este espejo.'],
 reflectionSelected:['已选候选 {letter}。转动视角检查后，再验证。','Candidate {letter} selected. Rotate to inspect it, then check.','Elegiste el candidato {letter}. Gira la vista para revisarlo y luego compruébalo.'],
 reflectionWrong:['候选 {letter} 还不对。检查 {id} 与 {id}′：连线应垂直镜面，中点应落在镜面上。可以换个视角再试。','Candidate {letter} does not match. Check {id} and {id}′: their joining segment must be perpendicular to the mirror, with its midpoint on the plane. Try another view.','El candidato {letter} no coincide. Revisa {id} y {id}′: el segmento que los une debe ser perpendicular al espejo y su punto medio debe estar en el plano. Prueba otra vista.'],
 reflectionRoundWon:['这一组对应了！原图窗口已叠加镜像和对应连线。观察后可以继续下一组。','This mirror matches! The original view now overlays the reflection and joining segments. Inspect them, then continue.','¡Este reflejo coincide! La vista original ahora superpone el reflejo y los segmentos correspondientes. Obsérvalos y continúa.'],
 reflectionWon:['三组都对应了！坐标平面、偏移平面和斜平面都找到了正确镜像。','All three mirrors match! You found the reflections in a coordinate plane, an offset plane and a diagonal plane.','¡Los tres reflejos coinciden! Los encontraste en un plano coordenado, uno desplazado y uno diagonal.'],
 reflectionHint1:['轮廓相似不够。逐个核对带字母的顶点：对应点在镜面两侧，到镜面的垂直距离相等。','A similar outline is not enough. Check the labeled vertices: corresponding points lie on opposite sides at equal perpendicular distances from the plane.','No basta un contorno parecido. Revisa los vértices: los puntos correspondientes están en lados opuestos y a igual distancia perpendicular del plano.'],
 reflectionHintX:['镜面是 x = 0。左右位置取反，y 和 z 保持不变。转动视角不会改变这条关系。','The mirror is x = 0. Reverse x and keep y and z unchanged. Rotating the viewpoint does not change this relationship.','El espejo es x = 0. Cambia el signo de x y conserva y y z. Girar la vista no cambia esta relación.'],
 reflectionHintZ:['镜面是 z = 1，并不经过原点。只调整高度：z′ = 2 − z；x 和 y 不变。','The mirror is z = 1, not through the origin. Change only height: z′ = 2 − z; x and y stay unchanged.','El espejo es z = 1 y no pasa por el origen. Cambia solo la altura: z′ = 2 − z; x e y no cambian.'],
 reflectionHintDiagonal:['镜面是 x = z。交换 x 与 z，保持 y 不变。连线中点的 x 和 z 应相等。','The mirror is x = z. Exchange x and z, keeping y unchanged. The midpoint of each joining segment must have equal x and z.','El espejo es x = z. Intercambia x y z, conservando y. El punto medio de cada segmento debe tener x y z iguales.'],
 reflectionHintPoint:['先核对 A：{source} 的镜像是 A′ {target}。再检查 B、C、D，不能只凭一个顶点下结论。','Start with A: {source} reflects to A′ {target}. Then check B, C and D; one matching vertex is not enough.','Empieza con A: {source} se refleja en A′ {target}. Revisa también B, C y D; un solo vértice no basta.'],
 reflectionProofTitle:['镜像，保持了什么，又改变了什么？','What does a mirror preserve or change?','¿Qué conserva y qué cambia un espejo?'],
 reflectionProof:['镜像保持所有边长，但反转几何体的朝向。只靠旋转，无法让这个不对称、带顶点标记的四面体与镜像完全重合。判断某个镜面的镜像，还要检查每对顶点的连线垂直镜面，且中点在镜面上。三组坐标规则依次是 (−x,y,z)、(x,y,2−z)、(z,y,x)。','Reflection preserves every edge length but reverses orientation. A rotation alone cannot make this asymmetric, vertex-labeled tetrahedron coincide with its reflection. For the specified mirror, every joining segment must also be perpendicular to the plane and have its midpoint on it. The three coordinate rules are (−x,y,z), (x,y,2−z), and (z,y,x).','El reflejo conserva todas las longitudes, pero invierte la orientación. Una rotación por sí sola no puede hacer coincidir este tetraedro asimétrico con vértices marcados y su reflejo. Para el espejo indicado, cada segmento correspondiente debe ser perpendicular al plano y tener su punto medio en él. Las tres reglas son (−x,y,z), (x,y,2−z) y (z,y,x).'],
 reflectionQuiet:['换的是观看角度，核对的是空间关系。','Change your viewpoint. Check the spatial relationships.','Cambia tu vista y comprueba las relaciones espaciales.'],
 reflectionAttempt:['第 {round} 组 · 候选 {letter} · {result}','Round {round} · candidate {letter} · {result}','Ronda {round} · candidato {letter} · {result}'],
 reflectionCorrect:['对应正确','matched','coincide'],reflectionIncorrect:['需要调整','needs another look','hay que revisar'],
 reflectionAdvanceRecord:['进入第 {round} 组','Continue to round {round}','Pasar a la ronda {round}'],
 reflectionNoAttempts:['还没有验证。','No checks yet.','Aún no hay comprobaciones.'],
 reflectionHistory:['我的验证','My checks','Mis comprobaciones'],
 reflectionUndo:['↶ 撤回','↶ Undo','↶ Deshacer'],reflectionReset:['重来','Start over','Reiniciar'],reflectionReplay:['再探索一次','Explore again','Explorar de nuevo'],
 reflectionHint:['✧ 给我一点灵感','✧ A little hint','✧ Una pista'],reflectionMoreHint:['再给一点提示 →','One more hint →','Otra pista →'],
 reflectionLimit:['这次尝试已达到 10000 步。可以撤回或重来。','This attempt has reached 10,000 moves. Undo or start over.','Este intento llegó a 10,000 movimientos. Deshaz uno o reinicia.']
};
registerTranslations({reflectionNav:Object.fromEntries(['zh-CN','en','es-MX'].map((language,i)=>[language,MIRROR_3D_COPY.reflectionNav[i]]))});
const letters=['Ⅰ','Ⅱ','Ⅲ','Ⅳ'];
const coords=p=>`(${p.x}, ${p.y}, ${p.z})`;
export function installMirror3D(root) {
 const $=id=>document.getElementById(id);
 const tr=(key,params={})=>regionalCopy(MIRROR_3D_COPY[key][document.documentElement.lang==='es-MX'?2:document.documentElement.lang==='en'?1:0],document.documentElement.lang).replace(/\{(\w+)\}/g,(_,key)=>String(params[key]??`{${key}}`));
 const text=(id,key,params)=>{$(id).textContent=tr(key,params);};
 root.insertAdjacentHTML('beforeend',`<section id="activity-reflection" class="activity-view explore-c-game mirror3d-game" hidden aria-labelledby="reflection-title"><div class="intro"><p class="eyebrow"><span></span><span class="explore-c-eyebrow" data-mirror-text="reflectionEyebrow"></span></p><h1 id="reflection-title" data-mirror-text="reflectionTitle"></h1><p class="premise" data-mirror-text="reflectionPremise"></p></div><div class="playground mini-board"><div class="board-top"><span class="experiment-label" data-mirror-text="reflectionLabel"></span><span id="reflection-matched" class="board-caption"></span></div><p class="rule-reminder" data-mirror-text="reflectionRule"></p><h2 id="reflection-round" class="mirror3d-round"></h2><div class="mirror3d-camera"><button id="reflection-view-left" type="button">←</button><button id="reflection-view-right" type="button">→</button><button id="reflection-view-up" type="button">↑</button><button id="reflection-view-down" type="button">↓</button><button id="reflection-view-reset" type="button" data-mirror-text="reflectionViewReset"></button></div><figure class="mirror3d-original"><figcaption data-mirror-text="reflectionOriginal"></figcaption><svg id="reflection-original-scene" viewBox="0 0 320 320" role="img" focusable="false"></svg></figure><p class="explore-c-caption" data-mirror-text="reflectionLegend"></p><div id="reflection-choices" class="mirror3d-choices" role="group"></div><div class="mirror3d-actions"><button id="reflection-check" type="button" class="primary-button" data-mirror-text="reflectionCheck"></button><button id="reflection-next" type="button" class="primary-button" data-mirror-text="reflectionNext" hidden></button></div><p id="reflection-status" role="status" aria-live="polite"></p><details id="reflection-coordinates" class="mirror3d-coordinates"><summary data-mirror-text="reflectionCoordinates"></summary><div id="reflection-coordinate-table"></div></details><div class="history-controls"><button id="reflection-undo" class="text-button" data-mirror-text="reflectionUndo"></button><button id="reflection-reset" class="text-button" data-mirror-text="reflectionReset"></button></div></div><div class="mini-below"><button id="reflection-hint" class="hint-button" aria-expanded="false" aria-controls="reflection-hint-text"></button><p id="reflection-hint-text" class="hint-copy" hidden></p></div><div id="reflection-insight" class="discovery" hidden><h2 data-mirror-text="reflectionProofTitle"></h2><p data-mirror-text="reflectionProof"></p><button id="reflection-replay" class="text-button" data-mirror-text="reflectionReplay"></button></div><details class="explore-c-history"><summary data-mirror-text="reflectionHistory"></summary><ol id="reflection-log"></ol></details><p class="quiet-note" data-mirror-text="reflectionQuiet"></p></section>`);
 let record=freshMirror(),camera={...CAMERA_DEFAULT},selected=null,hint=0,message=null;
 try{const saved=JSON.parse(localStorage.getItem(MIRROR_3D_KEY));mirrorState(saved);record={version:1,seed:saved.seed,moves:saved.moves};if(validCamera(saved.camera))camera={...saved.camera};if(Number.isInteger(saved.selected)&&saved.selected>=0&&saved.selected<=3)selected=saved.selected;}catch{}
 const buttons=[],scenes=[],labels=[];
 for(let i=0;i<4;i++){
  const button=document.createElement('button');button.id=`reflection-candidate-${i}`;button.type='button';button.className='mirror3d-choice';
  button.insertAdjacentHTML('beforeend',`<span id="reflection-candidate-label-${i}"></span><svg id="reflection-candidate-scene-${i}" viewBox="0 0 320 320" aria-hidden="true" focusable="false"></svg>`);
  button.addEventListener('click',()=>{const state=mirrorState(record);if(state.locked)return;selected=state.order[i];message=null;render();});
  $('reflection-choices').append(button);buttons.push(button);scenes.push($(`reflection-candidate-scene-${i}`));labels.push($(`reflection-candidate-label-${i}`));
 }
 const persist=()=>{try{localStorage.setItem(MIRROR_3D_KEY,JSON.stringify({...record,camera,selected}));}catch{}};
 const commit=move=>{try{record=mirrorMove(record,move);message=null;hint=0;}catch{message='reflectionLimit';}render();};
 $('reflection-check').addEventListener('click',()=>{if(selected!==null)commit({type:'answer',choice:selected});});
 $('reflection-next').addEventListener('click',()=>{selected=null;commit({type:'next'});$('reflection-round').setAttribute('tabindex','-1');$('reflection-round').focus?.({preventScroll:true});});
 $('reflection-undo').addEventListener('click',()=>{record={...record,moves:record.moves.slice(0,-1)};selected=null;message=null;hint=0;render();});
 const reset=()=>{record=freshMirror();selected=null;message=null;hint=0;camera={...CAMERA_DEFAULT};render();};
 $('reflection-reset').addEventListener('click',reset);$('reflection-replay').addEventListener('click',reset);
 $('reflection-hint').addEventListener('click',()=>{hint=Math.min(3,hint+1);render();});
 for(const [direction,dy,dp] of [['left',-.26,0],['right',.26,0],['up',0,.18],['down',0,-.18],['reset',0,0]]){
  $('reflection-view-'+direction).addEventListener('click',()=>{camera=direction==='reset'?{...CAMERA_DEFAULT}:{yaw:((camera.yaw+dy+Math.PI*3)%(Math.PI*2))-Math.PI,pitch:Math.max(-1.15,Math.min(1.15,camera.pitch+dp))};render();});
 }
 function render(){
  const state=mirrorState(record),round=MIRROR_ROUNDS[state.round],candidates=mirrorCandidates(state.round);
  const names=points=>points.map(p=>`${p.id}${points===round.points?'':'′'} ${coords(p)}`).join('; ');
  root.querySelectorAll('[data-mirror-text]').forEach(el=>{el.textContent=tr(el.dataset.mirrorText);});
  text('reflection-matched','reflectionCount',{count:state.correctRounds});text('reflection-round','reflectionRound',{round:state.round+1,plane:round.plane});
  for(const direction of ['left','right','up','down','reset'])$('reflection-view-'+direction).setAttribute('aria-label',tr('reflectionView'+direction[0].toUpperCase()+direction.slice(1)));
  const original=$('reflection-original-scene');original.innerHTML=mirrorScene(state.locked?candidates[0]:round.points,state.round,camera,{primed:state.locked,original:state.locked?round.points:null});
  original.setAttribute('aria-label',tr('reflectionSceneAria',{plane:round.plane,name:tr('reflectionOriginal'),points:names(round.points)}));
  $('reflection-choices').setAttribute('aria-label',tr('reflectionCheck'));
  state.order.forEach((choice,i)=>{const points=candidates[choice];labels[i].textContent=tr('reflectionCandidate',{letter:letters[i]});scenes[i].innerHTML=mirrorScene(points,state.round,camera,{primed:true});buttons[i].disabled=state.locked;buttons[i].setAttribute('aria-pressed',String(selected===choice));buttons[i].setAttribute('aria-label',tr('reflectionCandidateAria',{letter:letters[i],points:names(points)}));buttons[i].classList.toggle('is-matched',state.locked&&choice===0);});
  const chosen=selected??state.lastChoice,letter=letters[state.order.indexOf(chosen)],wrong=state.lastChoice!==null?candidates[state.lastChoice].find((p,i)=>['x','y','z'].some(key=>p[key]!==candidates[0][i][key])):null;
  text('reflection-status',message||(state.won?'reflectionWon':state.locked?'reflectionRoundWon':selected!==null&&selected!==state.lastChoice?'reflectionSelected':state.lastCorrect===false?'reflectionWrong':selected!==null?'reflectionSelected':'reflectionStart'),{letter,id:wrong?.id??'A'});
  $('reflection-check').disabled=selected===null||state.locked;$('reflection-check').hidden=state.locked;$('reflection-next').hidden=!state.locked||state.won;
  $('reflection-undo').disabled=!record.moves.length;$('reflection-reset').disabled=!record.moves.length&&selected===null;$('reflection-insight').hidden=!state.won;
  $('reflection-hint').textContent=tr(hint===0?'reflectionHint':'reflectionMoreHint');$('reflection-hint').setAttribute('aria-expanded',String(hint>0));$('reflection-hint-text').hidden=!hint;
  if(hint)text('reflection-hint-text',hint===1?'reflectionHint1':hint===2?['reflectionHintX','reflectionHintZ','reflectionHintDiagonal'][state.round]:'reflectionHintPoint',{source:coords(round.points[0]),target:coords(reflect3D(round.points[0],round))});
  const table=$('reflection-coordinate-table');table.replaceChildren();
  for(const [name,points,prime] of [[tr('reflectionOriginal'),round.points,false],...state.order.map((choice,i)=>[tr('reflectionCandidate',{letter:letters[i]}),candidates[choice],true])]){
   const element=document.createElement('table');element.innerHTML=`<caption>${name}</caption><thead><tr><th scope="col">${tr('reflectionVertex')}</th><th scope="col">x</th><th scope="col">y</th><th scope="col">z</th></tr></thead><tbody>${points.map(p=>`<tr><th scope="row">${p.id}${prime?'′':''}</th><td>${p.x}</td><td>${p.y}</td><td>${p.z}</td></tr>`).join('')}</tbody>`;table.append(element);
  }
  const list=$('reflection-log');list.replaceChildren();let logRound=0;
  for(const [index,move] of record.moves.entries()){
   let entry;if(move.type==='next'){logRound++;entry=tr('reflectionAdvanceRecord',{round:logRound+1});}else entry=tr('reflectionAttempt',{round:logRound+1,letter:letters[mirrorOrder(logRound,record.seed).indexOf(move.choice)],result:tr(move.choice===0?'reflectionCorrect':'reflectionIncorrect')});
   if(index>=record.moves.length-30){const li=document.createElement('li');li.textContent=entry;list.append(li);}
  }
  list.setAttribute('start',String(Math.max(1,record.moves.length-29)));if(!record.moves.length){const li=document.createElement('li');li.textContent=tr('reflectionNoAttempts');list.append(li);}
  persist();if(state.won)markCompleted('reflection');
  if(state.locked&&document.activeElement===$('reflection-check')){const target=$(state.won?'reflection-round':'reflection-next');if(state.won)target.setAttribute('tabindex','-1');target.focus?.({preventScroll:true});}
  reportOutcome('reflection',state.won);
 }
 render();return render;
}
