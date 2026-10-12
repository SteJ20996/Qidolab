/** Authored 3D mirror task. Coordinates, not the camera, determine correctness. */
export const MIRROR_3D_KEY = 'qidolab-reflection-3d-v1';
export const MIRROR_3D_LIMIT = 10000;
const ids = ['A','B','C','D'];
const base = [[1,-2,-1],[3,-1,-1],[2,2,0],[1,0,3]];
const freezePoints = values => Object.freeze(values.map((values,i)=>Object.freeze({id:ids[i],x:values[0],y:values[1],z:values[2]})));
export const MIRROR_ROUNDS = Object.freeze([
 Object.freeze({plane:'x = 0',normal:Object.freeze([1,0,0]),offset:0,points:freezePoints(base)}),
 Object.freeze({plane:'z = 1',normal:Object.freeze([0,0,1]),offset:1,points:freezePoints(base.map(([x,y,z])=>[y,z,x+1]))}),
 Object.freeze({plane:'x = z',normal:Object.freeze([1,0,-1]),offset:0,points:freezePoints(base.map(([x,y,z],i)=>[x+z,y+(i===3?1:0),z]))})
]);
export function reflect3D(point,round) {
 if(!point || !['x','y','z'].every(k=>Number.isFinite(point[k])) || !MIRROR_ROUNDS.includes(round)) throw new RangeError('Expected finite coordinates and a mirror');
 const [a,b,c]=round.normal,t=2*(a*point.x+b*point.y+c*point.z-round.offset)/(a*a+b*b+c*c);
 return {id:point.id,x:point.x-t*a,y:point.y-t*b,z:point.z-t*c};
}
export function mirrorCandidates(index) {
 const round=MIRROR_ROUNDS[index];if(!round)throw new RangeError('Unknown round');
 const transforms=index===0 ? [p=>({x:-p.x,y:-p.y,z:p.z}),p=>({x:-p.x,y:p.y,z:-p.z})] : index===1 ? [p=>({x:-p.x,y:p.y,z:2-p.z}),p=>({x:p.x,y:-p.y,z:2-p.z})] : [p=>({x:p.z,y:-p.y,z:p.x}),p=>({x:-p.z,y:p.y,z:-p.x})];
 const target=round.points.map(p=>reflect3D(p,round));
 return [target,...transforms.map(f=>round.points.map(p=>({id:p.id,...f(p)}))),target.map(p=>({...p,[index===1?'x':'y']:p[index===1?'x':'y']+1}))];
}
export function mirrorOrder(round,seed) {
 if(!Number.isInteger(round)||round<0||round>=3||!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw new RangeError('Invalid order seed');
 let n=(seed^(Math.imul(round+1,0x9e3779b9)))>>>0;
 const order=[0,1,2,3];for(let i=3;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const j=n%(i+1);[order[i],order[j]]=[order[j],order[i]];}return order;
}
export function freshMirror(seed=Math.floor(Math.random()*0x100000000)) { return {version:1,seed,moves:[]}; }
export function mirrorState(record) {
 if(!record||record.version!==1||!Number.isInteger(record.seed)||record.seed<0||record.seed>0xffffffff||!Array.isArray(record.moves)||record.moves.length>MIRROR_3D_LIMIT)throw new TypeError('Invalid 3D mirror record');
 let round=0,locked=false,lastChoice=null,correctRounds=0,lastCorrect=null;
 for(const move of record.moves){
  if(!move||typeof move!=='object'||Array.isArray(move)||correctRounds===3)throw new RangeError('Invalid move after completion');
  if(move.type==='answer'){
   if(locked||!Number.isInteger(move.choice)||move.choice<0||move.choice>3)throw new RangeError('Invalid answer');
   lastChoice=move.choice;lastCorrect=move.choice===0;locked=lastCorrect;if(locked)correctRounds++;
  }else if(move.type==='next'){
   if(!locked||round>=2)throw new RangeError('Solve this round before advancing');
   round++;locked=false;lastChoice=null;lastCorrect=null;
  }else throw new RangeError('Invalid move');
 }
 return {round,locked,correctRounds,lastChoice,lastCorrect,won:correctRounds===3,order:mirrorOrder(round,record.seed)};
}
export function mirrorMove(record,move) {mirrorState(record);const next={version:1,seed:record.seed,moves:[...record.moves,{...move}]};mirrorState(next);return next;}
export const CAMERA_DEFAULT=Object.freeze({yaw:.72,pitch:.4});
export function validCamera(camera) {return !!camera&&Number.isFinite(camera.yaw)&&Math.abs(camera.yaw)<=Math.PI&&Number.isFinite(camera.pitch)&&Math.abs(camera.pitch)<=1.15;}
export function project3D(point,camera=CAMERA_DEFAULT) {
 if(!validCamera(camera)||!point||!['x','y','z'].every(k=>Number.isFinite(point[k])))throw new RangeError('Invalid projection');
 const u=point.x*Math.cos(camera.yaw)-point.y*Math.sin(camera.yaw),v=point.x*Math.sin(camera.yaw)+point.y*Math.cos(camera.yaw);
 return {x:160+18*u,y:160-18*(point.z*Math.cos(camera.pitch)-v*Math.sin(camera.pitch)),depth:v*Math.cos(camera.pitch)+point.z*Math.sin(camera.pitch)};
}
const faces=[[0,1,2],[0,1,3],[0,2,3],[1,2,3]],edges=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]],colors=['#e8d39b','#b5e8d2','#9fc8ec','#e8a6ae'];
/** Inline SVG drawn from exact vertices; no external assets, WebGL or network. */
export function mirrorScene(points,index,camera=CAMERA_DEFAULT,{primed=false,original=null}={}) {
 const round=MIRROR_ROUNDS[index];if(!round)throw new RangeError('Unknown round');
 const point=p=>project3D(p,camera),xy=p=>{const q=point(p);return `${q.x.toFixed(2)},${q.y.toFixed(2)}`;};
 const plane=index===0?[[0,-4,-4],[0,4,-4],[0,4,4],[0,-4,4]]:index===1?[[-4,-4,1],[4,-4,1],[4,4,1],[-4,4,1]]:[[-3,-4,-3],[3,-4,3],[3,4,3],[-3,4,-3]];
 let svg=`<polygon class="mirror3d-plane" points="${plane.map(([x,y,z])=>xy({x,y,z})).join(' ')}"/>`;
 for(const [axis,vector] of [['x',[5,0,0]],['y',[0,5,0]],['z',[0,0,5]]]){
  const p={x:vector[0],y:vector[1],z:vector[2]},q=point(p),neg={x:-p.x,y:-p.y,z:-p.z};
  svg+=`<path class="mirror3d-axis" d="M${xy(neg)}L${xy(p)}"/><text class="mirror3d-axis-label" x="${q.x+5}" y="${q.y-5}">${axis}</text>`;
 }
 const origin=point({x:0,y:0,z:0});svg+=`<circle class="mirror3d-origin" cx="${origin.x}" cy="${origin.y}" r="2"/><text class="mirror3d-axis-label" x="${origin.x+5}" y="${origin.y+13}">O</text>`;
 if(original){
  for(const [a,b] of edges)svg+=`<path class="mirror3d-ghost" d="M${xy(original[a])}L${xy(original[b])}"/>`;
  original.forEach((p,i)=>{const q=point(p);svg+=`<circle cx="${q.x}" cy="${q.y}" r="3" fill="${colors[i]}"/><text class="mirror3d-point-label" x="${q.x+7}" y="${q.y+16}">${ids[i]}</text>`;});
  points.forEach((p,i)=>{svg+=`<path class="mirror3d-correspondence" d="M${xy(original[i])}L${xy(p)}"/>`;});
 }
 faces.map(face=>({face,depth:face.reduce((s,i)=>s+point(points[i]).depth,0)/3})).sort((a,b)=>a.depth-b.depth).forEach(({face})=>{svg+=`<polygon class="mirror3d-face" points="${face.map(i=>xy(points[i])).join(' ')}"/>`;});
 for(const [a,b] of edges)svg+=`<path class="mirror3d-edge" d="M${xy(points[a])}L${xy(points[b])}"/>`;
 points.forEach((p,i)=>{const q=point(p);svg+=`<circle cx="${q.x}" cy="${q.y}" r="5" fill="${colors[i]}"/><text class="mirror3d-point-label" x="${q.x+7}" y="${q.y-7}">${ids[i]}${primed?'′':''}</text>`;});
 return svg;
}
