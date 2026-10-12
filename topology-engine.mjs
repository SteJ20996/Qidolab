/** Polygon quotients: equal-letter edges glue tail to tail and head to head. */
export const TOPOLOGY_KEY='qidolab-topology-v1',TOPOLOGY_LIMIT=1000;
export const TOPOLOGY_ROUNDS=Object.freeze([
 Object.freeze([['a',1],['b',1],['a',-1],['b',-1]].map(Object.freeze)),
 Object.freeze([['a',1],['b',1],['a',-1],['b',-1],['c',1],['c',-1],['d',1],['d',-1]].map(Object.freeze)),
 Object.freeze([['a',1],['b',1],['a',-1],['b',-1],['c',1],['d',1],['c',-1],['d',-1]].map(Object.freeze))
]);
export const vertexName=i=>'ABCDEFGH'[i];
export function edgeEnds(round,index){const word=TOPOLOGY_ROUNDS[round];if(!word||!word[index])throw new RangeError('Invalid edge');const next=(index+1)%word.length;return word[index][1]===1?[index,next]:[next,index];}
export function mergeGroups(groups,vertices){
 if(!Array.isArray(vertices)||vertices.length<2||vertices.length>groups.length||new Set(vertices).size!==vertices.length||Array.from(vertices).some(v=>!Number.isInteger(v)||v<0||v>=groups.length))throw new RangeError('Select distinct vertices');
 const merged=new Set(vertices.map(v=>groups[v]));if(merged.size<2)throw new RangeError('These vertices already belong together');const target=Math.min(...merged);return groups.map(g=>merged.has(g)?target:g);
}
export function topologyTarget(round){
 const word=TOPOLOGY_ROUNDS[round];if(!word)throw new RangeError('Invalid round');let groups=word.map((_,i)=>i);const pairs=[];
 for(const label of new Set(word.map(e=>e[0]))){const indices=word.map((e,i)=>e[0]===label?i:-1).filter(i=>i>=0),first=edgeEnds(round,indices[0]),second=edgeEnds(round,indices[1]);pairs.push({label,tail:[first[0],second[0]],head:[first[1],second[1]]});for(const vertices of [[first[0],second[0]],[first[1],second[1]]])if(groups[vertices[0]]!==groups[vertices[1]])groups=mergeGroups(groups,vertices);}
 const V=new Set(groups).size,E=word.length/2,F=1,chi=V-E+F,genus=(2-chi)/2;
 return {groups,V,E,F,chi,genus,pairs};
}
export const groupLists=groups=>[...new Set(groups)].map(g=>groups.map((v,i)=>v===g?i:-1).filter(i=>i>=0));
const equalGroups=(a,b)=>a.every((v,i)=>a.every((other,j)=>(v===other)===(b[i]===b[j])));
export function freshTopology(){return {version:1,moves:[]};}
export function topologyState(record){
 if(!record||record.version!==1||!Array.isArray(record.moves)||record.moves.length>TOPOLOGY_LIMIT)throw new TypeError('Invalid topology record');
 let round=0,groups=TOPOLOGY_ROUNDS[0].map((_,i)=>i),checked=false,solved=false,completed=0,feedback=null,lastGenus=null;
 for(const move of record.moves){
  if(!move||typeof move!=='object'||Array.isArray(move)||completed===3)throw new RangeError('Invalid move');
  if(move.type==='next'){if(!solved||round>=2)throw new RangeError('Solve before advancing');round++;groups=TOPOLOGY_ROUNDS[round].map((_,i)=>i);checked=false;solved=false;feedback=null;lastGenus=null;continue;}
  if(solved)throw new RangeError('This round is already solved');
  if(move.type==='merge'){if(checked)throw new RangeError('Grouping already verified');groups=mergeGroups(groups,move.vertices);feedback=null;}
  else if(move.type==='separate'){groups=TOPOLOGY_ROUNDS[round].map((_,i)=>i);checked=false;feedback=null;lastGenus=null;}
  else if(move.type==='check'){checked=equalGroups(groups,topologyTarget(round).groups);feedback=checked?'groupsCorrect':'groupsWrong';}
  else if(move.type==='answer'){if(!checked||!Number.isInteger(move.genus)||move.genus<0||move.genus>3)throw new RangeError('Verify grouping first');lastGenus=move.genus;solved=move.genus===topologyTarget(round).genus;feedback=solved?'solved':'genusWrong';if(solved)completed++;}
  else throw new RangeError('Unknown topology move');
 }
 const target=topologyTarget(round);let mismatch=null;
 for(let a=0;a<groups.length&&!mismatch;a++)for(let b=a+1;b<groups.length;b++)if((groups[a]===groups[b])!==(target.groups[a]===target.groups[b])){mismatch={a,b,together:target.groups[a]===target.groups[b]};break;}
 return {round,groups,checked,solved,completed,feedback,lastGenus,won:completed===3,mismatch,target};
}
export function topologyMove(record,move){topologyState(record);const next={version:1,moves:[...record.moves,move.type==='merge'?{type:move.type,vertices:[...move.vertices]}:{...move}]};topologyState(next);return next;}
export function polygonScene(round){
 const word=TOPOLOGY_ROUNDS[round];if(!word)throw new RangeError('Invalid round');const n=word.length,colors={a:'#e8d39b',b:'#b5e8d2',c:'#9fc8ec',d:'#e8a6ae'};
 const points=word.map((_,i)=>{const a=-Math.PI/2-Math.PI/n+2*Math.PI*i/n;return{x:180+116*Math.cos(a),y:180+116*Math.sin(a)};});
 let svg=`<polygon points="${points.map(p=>`${p.x},${p.y}`).join(' ')}" fill="#b5e8d208"/>`;
 word.forEach(([label],i)=>{const [t,h]=edgeEnds(round,i),start=points[t],end=points[h],dx=end.x-start.x,dy=end.y-start.y,length=Math.hypot(dx,dy),ux=dx/length,uy=dy/length,mx=(start.x+end.x)/2,my=(start.y+end.y)/2,tip={x:mx+12*ux,y:my+12*uy};svg+=`<path d="M${start.x} ${start.y}L${end.x} ${end.y}" fill="none" stroke="${colors[label]}" stroke-width="3"/><path d="M${tip.x-9*ux-5*uy} ${tip.y-9*uy+5*ux}L${tip.x} ${tip.y}L${tip.x-9*ux+5*uy} ${tip.y-9*uy-5*ux}" fill="none" stroke="${colors[label]}" stroke-width="3"/><text x="${mx+(mx-180)*.22}" y="${my+(my-180)*.22+5}" text-anchor="middle" fill="${colors[label]}" font-size="20">${label}</text>`;});
 points.forEach((p,i)=>{svg+=`<circle cx="${p.x}" cy="${p.y}" r="5" fill="#dcebdd"/><text x="${p.x+(p.x-180)*.28}" y="${p.y+(p.y-180)*.28+5}" fill="#e3eddf" font-size="17" text-anchor="middle">${vertexName(i)}</text>`;});return svg;
}
