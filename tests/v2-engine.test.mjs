import test from 'node:test';
import assert from 'node:assert/strict';
import {ROUNDS24,CODES,initialCards,replay24,solve24,won24,calculate,fraction,combine,scoreCode,validGuess,candidateCodes,filterCandidates,generate24,generateCode,restoreProgress} from '../2/engine.mjs';
let seed=173;
const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
test('20 starter puzzles are valid; all arithmetic rounds have exact solutions',()=>{
  assert.equal(new Set(ROUNDS24.map(n=>[...n].sort().join(','))).size,10);
  assert.equal(new Set(CODES).size,10);
  for(const numbers of ROUNDS24){const solution=solve24(initialCards(numbers));assert.equal(solution.length,3);assert.ok(won24(replay24(numbers,solution)));}
  for(const code of CODES)assert.ok(validGuess(code,code.length));
  assert.equal(solve24(initialCards([1,1,1,1])),null);
  assert.deepEqual(calculate(fraction(1),fraction(5,6),'-'),fraction(1,6));
  assert.deepEqual(calculate(fraction(4),fraction(1,6),'/'),fraction(24));
  assert.throws(()=>calculate(fraction(2),fraction(0),'/'));
  assert.throws(()=>combine(initialCards([1,2,3,4]),{left:0,right:0,op:'+'}));
  assert.throws(()=>replay24([1,2,3,4],[{left:0,right:1,op:'eval'}]));
});
test('1,000 generated 24 puzzles are solvable and change the number combination',()=>{
  let before=[];for(let i=0;i<1000;i++){const n=generate24(before,rng);assert.notEqual([...n].sort().join(','),[...before].sort().join(','));assert.ok(won24(replay24(n,solve24(initialCards(n)))));before=n;}
  assert.notDeepEqual(generate24(ROUNDS24[0],()=>0),ROUNDS24[0]);
  assert.throws(()=>generate24([],()=>NaN));
});
test('code generation, leading zero, duplicate accounting and clue filtering',()=>{
  assert.deepEqual(scoreCode('1526','1234'),{present:2,placed:1});
  assert.deepEqual(scoreCode('0123','0123'),{present:4,placed:4});
  assert.deepEqual(scoreCode('1123','1111'),{present:2,placed:2});
  assert.deepEqual(scoreCode('01234','98765'),{present:0,placed:0});
  for(const length of [4,5]){
    let before='';for(let i=0;i<1000;i++){
      const code=generateCode(length,before,rng);assert.ok(validGuess(code,length));assert.notEqual(code,before);
      const guess=generateCode(length,'',rng),score=scoreCode(code,guess);
      assert.equal(score.present,[...guess].filter(d=>code.includes(d)).length);
      assert.equal(score.placed,[...guess].filter((d,j)=>code[j]===d).length);before=code;
    }
    const all=candidateCodes(length);assert.equal(all.length,length===4?5040:30240);assert.equal(new Set(all).size,all.length);
    const secret=length===4?'0382':'03825',guess=length===4?'0123':'01234';
    const remaining=filterCandidates(all,guess,scoreCode(secret,guess));assert.ok(remaining.includes(secret));assert.ok(remaining.length<all.length);
  }
  assert.notEqual(generateCode(4,'0123',()=>0),'0123');
});
test('restore validates saved puzzles and moves; preserves empty digit slots',()=>{
  assert.deepEqual(restoreProgress('{broken'),restoreProgress(null));
  const data=restoreProgress(null);data.twentyfour[0].moves=solve24(initialCards(ROUNDS24[0]));data.code[0].draft='1 3 ';
  data.free.twentyfour={puzzle:[3,3,8,8],round:{moves:[],solved:false}};
  data.free.code5={puzzle:'03825',round:{guesses:['12345'],draft:' 1 3 '}};
  const restored=restoreProgress(JSON.stringify(data));assert.ok(restored.twentyfour[0].solved);assert.equal(restored.code[0].draft,'1 3 ');assert.equal(restored.free.code5.round.draft,' 1 3 ');
  data.free.twentyfour.puzzle=[1,1,1,1];data.free.code5.puzzle='11111';data.twentyfour[1].moves=[{left:50,right:0,op:'+'}];
  const invalid=restoreProgress(data);assert.equal(invalid.free.twentyfour,null);assert.equal(invalid.free.code5,null);assert.deepEqual(invalid.twentyfour[1].moves,[]);
});
