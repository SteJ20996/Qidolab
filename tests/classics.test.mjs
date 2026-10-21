import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FOX_DAYS,foxEscape,initialRiver,riverMove,riverWon,initialHanoi,hanoiMove,hanoiWon,initialQueens,queenConflicts,queensWon} from '../classics/engine.mjs';
import {COPY,languages} from '../classics/copy.mjs';

function bruteFox(holes,plan){
 let routes=Array.from({length:holes},(_,i)=>[i+1]);
 for(let day=0;day<plan.length;day++){
  routes=routes.filter(path=>path.at(-1)!==plan[day]);
  if(day<plan.length-1)routes=routes.flatMap(path=>[path.at(-1)-1,path.at(-1)+1].filter(x=>x>=1&&x<=holes).map(x=>[...path,x]));
 }
 return routes;
}
test('fox search is guaranteed exactly when every allowed route is caught',()=>{
 for(const holes of [4,5,6]){
  const days=FOX_DAYS[holes];let found=false;
  for(let seed=0;seed<Math.min(holes**days,50000);seed++){
   let value=seed;const plan=Array.from({length:days},()=>{const den=value%holes+1;value=Math.floor(value/holes);return den;});
   const witness=foxEscape(holes,plan),brute=bruteFox(holes,plan);
   assert.equal(witness===null,brute.length===0);
   if(witness){assert.equal(witness.length,days);for(let i=0;i<days;i++){assert.notEqual(witness[i],plan[i]);if(i)assert.equal(Math.abs(witness[i]-witness[i-1]),1);}}
   else found=true;
  }
  if(holes===6)assert.equal(foxEscape(6,[2,3,4,5,5,4,3,2]),null);
  else assert.equal(found,true,`a winning plan exists for ${holes} dens`);
 }
});
test('river crossing rejects unsafe moves and accepts the classic seven crossings',()=>{
 let state=initialRiver();assert.equal(riverMove(state,'wolf'),null);
 for(const item of ['goat',null,'wolf','goat','cabbage',null,'goat']){
  const next=riverMove(state,item);assert.ok(next);state=next;
 }
 assert.ok(riverWon(state));
});
test('tower permits only top-to-clear moves; queens detect columns and diagonals',()=>{
 let pegs=initialHanoi(3);
 for(const [from,to] of [[0,2],[0,1],[2,1],[0,2],[1,0],[1,2],[0,2]]){const next=hanoiMove(pegs,from,to);assert.ok(next);pegs=next;}
 assert.ok(hanoiWon(pegs,3));assert.equal(hanoiMove([[2,1],[3],[]],1,0),null);
 assert.equal(queenConflicts([1,3,0,2]).size,0);assert.ok(queensWon([1,3,0,2]));
 assert.equal(queenConflicts([0,0,-1,1]).size,2);assert.equal(queensWon(initialQueens(4)),false);
});
test('four locale dictionaries cover all interactive copy and guided steps',()=>{
 const markup=readFileSync(new URL('../classics/index.html',import.meta.url),'utf8');
 for(const language of languages){const copy=COPY[language];for(const [,key] of markup.matchAll(/data-copy="([\w]+)"/g))assert.ok(copy[key],`${language}: ${key}`);for(const game of ['fox','river','hanoi','queens']){assert.equal(copy.guide[game].length,3);for(const suffix of ['Rule','Goal','Hint','Good'])assert.ok(copy[game+suffix],`${language}: ${game+suffix}`);}}
});
