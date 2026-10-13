// Independent implementations of the four documented Qidolab concepts.
import {apply,opText,trace} from '../playtest/engine.mjs';
export {apply,opText,trace};
export const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function permutations(items){if(!items.length)return [[]];return items.flatMap((x,i)=>permutations(items.filter((_,j)=>j!==i)).map(p=>[x,...p]));}
export function codes(digits,length=4){if(length===0)return [''];return [...digits].flatMap(c=>codes(digits.replace(c,''),length-1).map(t=>c+t));}
export function score(secret,guess){return [new Set([...guess].filter(c=>secret.includes(c))).size,[...guess].filter((c,i)=>secret[i]===c).length];}
export const validCode=(p,value)=>typeof value==='string'&&value.length===4&&new Set(value).size===4&&[...value].every(c=>p.digits.includes(c));
export const initialEcho=p=>({values:[...p.starts],pending:null,moves:[],phases:[]});
export function echoStep(p,state,move){
 if(!move||!Number.isInteger(move.card)||move.card<0||move.card>=p.cards.length||![0,1].includes(move.side)||state.moves.some(m=>m.card===move.card)||state.moves.length>=p.cards.length)return null;
 const values=[...state.values],phases=[];const change=(side,op,type)=>{const from=values[side],value=apply(from,op);if(value===null)return false;values[side]=value;phases.push({type,side,op,from,value,values:[...values]});return true;};
 if(!change(move.side,p.cards[move.card],'now'))return null;
 if(state.pending&&!change(state.pending.side,p.cards[state.pending.card],'echo'))return null;
 let pending={side:1-move.side,card:move.card};const moves=[...state.moves,{card:move.card,side:move.side}];
 if(moves.length===p.cards.length){if(!change(pending.side,p.cards[pending.card],'lastEcho'))return null;pending=null;}
 return {values,pending,moves,phases};
}
export function replayEcho(p,moves=[]){let s=initialEcho(p);for(const m of Array.isArray(moves)?moves.slice(0,p.cards.length):[]){const next=echoStep(p,s,m);if(!next)break;s=next;}return s;}
export const echoWon=(p,s)=>s.moves.length===p.cards.length&&s.pending===null&&equal(s.values,p.goals);
export function solveEcho(p,state=initialEcho(p)){const paths=[];function visit(s,path){if(echoWon(p,s)){paths.push(path);return;}for(let card=0;card<p.cards.length;card++)for(let side=0;side<2;side++){const next=echoStep(p,s,{card,side});if(next)visit(next,[...path,{card,side}]);}}visit(state,[]);return paths;}
export function tallyState(p,flips=[]){const rows=[0,0,0],cols=[0,0,0],values=p.pairs.map(([a,b],i)=>flips[i]===true?[b,a]:[a,b]);values.forEach(([a,b],i)=>{rows[Math.floor(i/3)]+=a;cols[i%3]+=b;});return {rows,cols,values,won:equal(rows,p.rows)&&equal(cols,p.cols)};}
export function solveTally(p){const out=[];for(let n=0;n<512;n++){const bits=Array.from({length:9},(_,i)=>Boolean(n&(1<<i)));if(tallyState(p,bits).won)out.push(bits);}return out;}
export function bothState(p,order=[]){const valid=Array.isArray(order)&&order.every(i=>Number.isInteger(i)&&i>=0&&i<p.cards.length)&&new Set(order).size===order.length;
 const ops=valid?order.map(i=>p.cards[i]):[],paths=[trace(p.starts[0],ops),trace(p.starts[1],[...ops].reverse())],legal=valid&&paths.every(path=>path.every(n=>n!==null));return {paths,legal,won:legal&&order.length===p.cards.length&&paths.every((path,i)=>path.at(-1)===p.goals[i])};}
export function solveBoth(p,prefix=[]){if(!Array.isArray(prefix)||new Set(prefix).size!==prefix.length||prefix.some(i=>!Number.isInteger(i)||i<0||i>=p.cards.length))return [];return permutations(p.cards.map((_,i)=>i).filter(i=>!prefix.includes(i))).map(rest=>[...prefix,...rest]).filter(order=>bothState(p,order).won);}
export const bag=rows=>rows.map(r=>r.join('/')).sort().join('|');
export function solveMixed(p){const wanted=bag(p.feedback);return codes(p.digits).filter(secret=>bag(p.guesses.map(g=>score(secret,g)))===wanted);}
export function mixedWon(p,guess,assignment){return validCode(p,guess)&&Array.isArray(assignment)&&assignment.length===p.guesses.length&&new Set(assignment).size===p.feedback.length&&assignment.every((id,row)=>Number.isInteger(id)&&id>=0&&id<p.feedback.length&&equal(score(guess,p.guesses[row]),p.feedback[id]));}
export function assignFeedback(assignment,row,card){const next=[...assignment];if(!Number.isInteger(row)||row<0||row>=next.length||!Number.isInteger(card)||card<0||card>=next.length)return next;const other=next.indexOf(card),old=next[row];next[row]=card;if(other>=0&&other!==row)next[other]=old;return next;}
