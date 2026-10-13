// Exact arithmetic: no eval, rounding tolerance, or hidden number reuse.
export const ROUNDS24 = Object.freeze([
  [1,2,3,4], [2,3,4,5], [2,4,6,8], [3,4,5,6], [1,2,7,8],
  [2,2,6,6], [4,4,7,7], [1,3,4,6], [1,5,5,5], [3,3,8,8]
].map(Object.freeze));
export const CODES = Object.freeze(['5072','3816','0497','6820','9153','40729','83061','59204','17683','26095']);
export const OPS = Object.freeze(['+','-','*','/']);
export const SYMBOL = Object.freeze({'+':'+','-':'−','*':'×','/':'÷'});
const gcd = (a,b) => b ? gcd(b,a % b) : Math.abs(a);
export function fraction(n,d=1) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d) || d === 0) throw new RangeError('Invalid fraction');
  if(d<0){n=-n;d=-d;} const g=gcd(n,d); return {n:n/g,d:d/g};
}
export const valueText = ({n,d}) => d===1?String(n):`${n}/${d}`;
export function calculate(a,b,op) {
  if(op==='+')return fraction(a.n*b.d+b.n*a.d,a.d*b.d);
  if(op==='-')return fraction(a.n*b.d-b.n*a.d,a.d*b.d);
  if(op==='*')return fraction(a.n*b.n,a.d*b.d);
  if(op==='/')return fraction(a.n*b.d,a.d*b.n);
  throw new RangeError('Unknown operation');
}
export function initialCards(numbers) {
  if(!Array.isArray(numbers)||numbers.length!==4||numbers.some(n=>!Number.isInteger(n)||n<1||n>13))throw new RangeError('Invalid cards');
  return numbers.map((n,i)=>({value:fraction(n),expression:String(n),mask:1<<i}));
}
export function combine(cards,{left,right,op}) {
  if(!Number.isInteger(left)||!Number.isInteger(right)||left===right||!cards[left]||!cards[right]||!OPS.includes(op))throw new RangeError('Invalid move');
  const a=cards[left],b=cards[right];if(a.mask&b.mask)throw new RangeError('Reused number');
  const card={value:calculate(a.value,b.value,op),expression:`(${a.expression} ${SYMBOL[op]} ${b.expression})`,mask:a.mask|b.mask};
  return [...cards.filter((_,i)=>i!==left&&i!==right),card];
}
export function replay24(numbers,moves=[]) {
  if(!Array.isArray(moves)||moves.length>3)throw new RangeError('Invalid history');
  return moves.reduce(combine,initialCards(numbers));
}
export const won24 = cards => cards.length===1&&cards[0].mask===15&&cards[0].value.n===24&&cards[0].value.d===1;
export function solve24(cards) {
  const dead=new Set();
  function visit(current) {
    if(won24(current))return [];
    const key=current.map(c=>valueText(c.value)).sort().join(',');
    if(current.length<2||dead.has(key))return null;
    for(let left=0;left<current.length;left++)for(let right=0;right<current.length;right++) {
      if(left===right)continue;
      for(const op of OPS) {
        if((op==='+'||op==='*')&&left>right||op==='/'&&current[right].value.n===0)continue;
        const move={left,right,op},path=visit(combine(current,move));
        if(path)return [move,...path];
      }
    }
    dead.add(key);return null;
  }
  return visit(cards);
}
// "Present" includes the correctly placed digits, never adds them twice.
export function scoreCode(secret,guess) {
  if(!/^\d+$/.test(secret)||!/^\d+$/.test(guess)||secret.length!==guess.length)throw new RangeError('Invalid code');
  const counts=s=>[...s].reduce((a,d)=>(a[d]++,a),Array(10).fill(0));
  const a=counts(secret),b=counts(guess);
  return {present:a.reduce((n,c,i)=>n+Math.min(c,b[i]),0),placed:[...guess].filter((d,i)=>d===secret[i]).length};
}
export function validGuess(guess,length) {return typeof guess==='string'&&guess.length===length&&/^\d+$/.test(guess)&&new Set(guess).size===length;}
export function candidateCodes(length) {
  if(![4,5].includes(length))throw new RangeError('Invalid code length');
  const result=[];
  const visit=s=>{if(s.length===length){result.push(s);return;}for(const d of '0123456789')if(!s.includes(d))visit(s+d);};
  visit('');return result;
}
export function filterCandidates(candidates,guess,score) {
  return candidates.filter(secret=>{const s=scoreCode(secret,guess);return s.present===score.present&&s.placed===score.placed;});
}
export const fresh24 = () => ({moves:[],solved:false,usedHint:false,revealed:false});
export const freshCode = () => ({guesses:[],draft:'',solved:false,usedHint:false,revealed:false});
// Randomness is for puzzle variety, not authentication or security.
export function randomUnit() {
  if(globalThis.crypto?.getRandomValues)return crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
  return Math.random();
}
const sample = rng => {const n=rng();if(!Number.isFinite(n)||n<0||n>=1)throw new RangeError('Invalid random sample');return n;};
const numberKey = numbers => [...numbers].sort((a,b)=>a-b).join(',');
export function generate24(previous=[],rng=randomUnit) {
  const previousKey=numberKey(previous);
  for(let attempt=0;attempt<80;attempt++) {
    const numbers=Array.from({length:4},()=>1+Math.floor(sample(rng)*9));
    if(numberKey(numbers)!==previousKey&&solve24(initialCards(numbers)))return numbers;
  }
  // Bounded fallback also works when a device's random source repeatedly returns one value.
  return [...ROUNDS24.find(numbers=>numberKey(numbers)!==previousKey)];
}
export function generateCode(length=4,previous='',rng=randomUnit) {
  if(![4,5].includes(length))throw new RangeError('Invalid code length');
  const digits=[...'0123456789'];
  for(let i=0;i<length;i++){const j=i+Math.floor(sample(rng)*(10-i));[digits[i],digits[j]]=[digits[j],digits[i]];}
  const code=digits.slice(0,length).join('');
  return code===previous?code.slice(1)+code[0]:code;
}
function restoreRound(r,type,puzzle) {
  const fresh=type==='twentyfour'?fresh24():freshCode();
  if(!r||typeof r!=='object')return fresh;
  try {
    const flags=Object.fromEntries(['solved','usedHint','revealed'].map(k=>[k,r[k]===true]));
    if(type==='twentyfour') {
      const cards=replay24(puzzle,r.moves);
      return {...flags,solved:flags.solved||won24(cards),moves:r.moves.map(m=>({left:m.left,right:m.right,op:m.op}))};
    }
    if(!Array.isArray(r.guesses)||r.guesses.length>1000||r.guesses.some(g=>!validGuess(g,puzzle.length)))return fresh;
    const end=r.guesses.indexOf(puzzle);
    // Spaces retain empty input slots across reloads; digits must never silently shift left.
    const draft=typeof r.draft==='string'?r.draft.replace(/[^0-9 ]/g,'').slice(0,puzzle.length):'';
    return {...flags,solved:flags.solved||end>=0,guesses:end<0?[...r.guesses]:r.guesses.slice(0,end+1),draft};
  }catch{return fresh;}
}
export function restoreProgress(raw) {
  let data;try{data=typeof raw==='string'?JSON.parse(raw):raw;}catch{}
  const result={version:1,twentyfour:ROUNDS24.map(fresh24),code:CODES.map(freshCode),free:{twentyfour:null,code4:null,code5:null}};
  if(data?.version!==1)return result;
  for(let i=0;i<10;i++)for(const type of ['twentyfour','code'])result[type][i]=restoreRound(data[type]?.[i],type,type==='twentyfour'?ROUNDS24[i]:CODES[i]);
  for(const key of Object.keys(result.free)) {
    const r=data.free?.[key];if(!r)continue;
    try {
      const valid=key==='twentyfour'?!!solve24(initialCards(r.puzzle)):validGuess(r.puzzle,Number(key.slice(-1)));
      if(valid)result.free[key]={puzzle:r.puzzle,round:restoreRound(r.round,key==='twentyfour'?'twentyfour':'code',r.puzzle)};
    }catch{}
  }
  return result;
}
