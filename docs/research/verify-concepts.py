"""Small, independently written feasibility checks, not production game engines.
Run: python3 docs/research/verify-concepts.py
Only verifies the explicit finite examples below, not originality or general difficulty.
"""
from itertools import permutations, product
from collections import Counter, defaultdict
import json

def apply(n, op):
    kind,k=op
    return n+k if kind=='+' else n-k if kind=='-' else n*k

# A: current action first, then the previous action's echo on the other dial.
# Flush the final pending echo before judging success. All intermediate values 0..40.
def echo(start, cards, order, sides):
    values=list(start); pending=None; trace=[]
    for idx, side in zip(order, sides):
        op=cards[idx];values[side]=apply(values[side],op)
        if not all(0<=v<=40 for v in values):return None
        if pending is not None:
            target,previous=pending;values[target]=apply(values[target],previous)
            if not all(0<=v<=40 for v in values):return None
        pending=(1-side,op);trace.append(values.copy())
    side,op=pending;values[side]=apply(values[side],op)
    if not all(0<=v<=40 for v in values):return None
    return tuple(values),trace+[values.copy()]
start=(2,7);cards=[('+',3),('*',2),('-',2)]
answers=defaultdict(list)
for order in permutations(range(3)):
    for sides in product(range(2),repeat=3):
        result=echo(start,cards,order,sides)
        if result:answers[result[0]].append({'order':order,'sides':sides,'trace':result[1]})
# Pick a reachable asymmetric outcome with few solutions; multiple routes are allowed.
unique=sorted([(target,routes[0],len(routes)) for target,routes in answers.items() if min(target)>5 and target[0]!=target[1] and target[1]-target[0]!=10],key=lambda item:(item[2],item[0]))
assert unique
out={'echo':{'start':start,'cards':cards,'target':unique[0][0],'solutions':unique[0][2],**unique[0][1],'choices_exhausted':48}}

# B: two machines read the same ordered operation cards in opposite directions.
start=(3,8);cards=[('+',4),('*',2),('-',3),('*',3)]
def run(n,ops):
    for op in ops:
        n=apply(n,op)
        if not 0<=n<=99:return None
    return n
outputs=defaultdict(list)
for order in permutations(range(4)):
    arranged=[cards[i] for i in order]
    a=run(start[0],arranged);b=run(start[1],arranged[::-1])
    if a is not None and b is not None:outputs[(a,b)].append(order)
unique=[(target,routes[0]) for target,routes in sorted(outputs.items()) if len(routes)==1 and min(target)>15]
assert unique
out['two_way']={'start':start,'cards':cards,'target':unique[0][0],'order':unique[0][1],'solutions':1,'orders_exhausted':24}

# C: all true feedback pairs have lost their row labels. Recover the four-digit
# secret AND pair each feedback card to a guess. Candidate pool 0..5, no repeats.
pool=[''.join(p) for p in permutations('012345',4)]
def score(secret,guess):
    return (len(set(secret)&set(guess)),sum(a==b for a,b in zip(secret,guess)))
secret='0425'
found=None
# Search a reproducible small set of clue combinations (not external questions).
import random
rng=random.Random(218)
for _ in range(20000):
    guesses=rng.sample(pool,4)
    feedback=[score(secret,g) for g in guesses]
    if len(set(feedback))<4:continue
    bag=Counter(feedback)
    possible=[s for s in pool if Counter(score(s,g) for g in guesses)==bag]
    if possible==[secret]:
        # The disordered display must actually be ambiguous row-by-row.
        found=(guesses,feedback);break
assert found
out['mixed_clues']={'digits':'012345','no_repeats':True,'secret':secret,'guesses':found[0],'unordered_feedback':sorted(found[1]),'mapping_in_guess_order':found[1],'candidate_codes_exhausted':len(pool),'solutions':1}
# D: each tile contributes one value to its row, the other to its column.
# Flipping swaps those contributions. All nine tile positions remain fixed.
pairs=[(1,4),(2,5),(1,3),(3,5),(2,6),(1,5),(2,4),(1,6),(3,6)]
def ledgers(bits):
    rows=[0,0,0];cols=[0,0,0]
    for i,bit in enumerate(bits):
        a,b=pairs[i];horizontal,vertical=(b,a) if bit else (a,b)
        rows[i//3]+=horizontal;cols[i%3]+=vertical
    return tuple(rows+cols)
ledger_outputs=defaultdict(list)
for bits in product(range(2),repeat=9):ledger_outputs[ledgers(bits)].append(bits)
chosen=next((target,patterns[0]) for target,patterns in sorted(ledger_outputs.items()) if len(patterns)==1 and sum(patterns[0])==4)
out['double_ledger']={'pairs_horizontal_vertical':pairs,'row_targets':chosen[0][:3],'column_targets':chosen[0][3:],'flips':chosen[1],'solutions':1,'orientations_exhausted':512}
print(json.dumps(out,ensure_ascii=False,indent=2))
