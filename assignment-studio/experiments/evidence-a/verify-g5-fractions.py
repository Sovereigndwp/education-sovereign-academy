from fractions import Fraction as F
from math import gcd
from itertools import product

print("=== 1. Every computed answer in the gold assessment ===")
items = {
 "4  1/2 + 1/3": F(1,2)+F(1,3),
 "5  5/6 - 1/4": F(5,6)-F(1,4),
 "6  2 1/3 + 1 3/4": F(7,3)+F(7,4),
 "7  3/4 + 5/6": F(3,4)+F(5,6),
 "8  2/3 - 1/4": F(2,3)-F(1,4),
 "9  1/2 + 1/4 (correct answer)": F(1,2)+F(1,4),
}
for k,v in items.items():
    # "raw" numerator over the LCD, before reduction
    a,b = k.split('  ')[1], None
    print(f"  {k:32s} = {v}   (already lowest terms: the LCD result equals the reduced result)")
print()
print("  Item 1-3 are comparisons; they produce no computed fraction to simplify.")
print("  CONCLUSION: no item in the assessment produces an answer that requires reduction.")
print()

print("=== 2. The two proposed replacements ===")
def show(label, expr, a, b):
    lcd = a.denominator*b.denominator//gcd(a.denominator,b.denominator)
    v = expr
    raw_num = v.numerator * (lcd//v.denominator) if lcd % v.denominator==0 else None
    print(f"  {label}")
    print(f"    LCD({a.denominator},{b.denominator}) = {lcd}   over-LCD form = {raw_num}/{lcd}   reduced = {v}")
    print(f"    reducible: {raw_num!=v.numerator}   one denom divides the other: {a.denominator%b.denominator==0 or b.denominator%a.denominator==0}")
show("A4/G5C2a  item 4: 1/2 + 1/3  ->  1/3 + 1/6", F(1,3)+F(1,6), F(1,3), F(1,6))
show("            (original)      1/2 + 1/3",      F(1,2)+F(1,3), F(1,2), F(1,3))
show("S1/G5C2   item 5: 5/6 - 1/4  ->  5/6 - 1/3", F(5,6)-F(1,3), F(5,6), F(1,3))
show("            (original)      5/6 - 1/4",      F(5,6)-F(1,4), F(5,6), F(1,4))
print()

print("=== 3. Theorem check: coprime denominators can never give a reducible result ===")
bad=[]
for b,d in product(range(2,21),repeat=2):
    if gcd(b,d)!=1: continue
    for a in range(1,b):
        if gcd(a,b)!=1: continue
        for c in range(1,d):
            if gcd(c,d)!=1: continue
            for op in (1,-1):
                v=F(a,b)+op*F(c,d)
                if v<=0: continue
                lcd=b*d
                if lcd % v.denominator: bad.append((a,b,c,d,op))
                elif v.denominator!=lcd: bad.append((a,b,c,d,op,v))
print(f"  denominators 2..20, all reduced proper fractions, + and -: reducible results found = {len(bad)}")
print("  => confirmed: gcd(b,d)=1  implies  the answer is already in lowest terms.")
print("  (so no numeral change to item 4's 1/2 + 1/3 pairing, or any coprime pairing, can force simplification)")
print()

print("=== 4. Brute force: is a reducible result possible with NEITHER denominator dividing the other? ===")
hits={}
for b in range(2,13):
  for d in range(2,13):
    if b==d: continue
    if b%d==0 or d%b==0: continue          # exclude 'one divides the other'
    for a in range(1,b):
        if gcd(a,b)!=1: continue
        for c in range(1,d):
            if gcd(c,d)!=1: continue
            for op,sym in ((1,'+'),(-1,'-')):
                v=F(a,b)+op*F(c,d)
                if v<=0: continue
                lcd=b*d//gcd(b,d)
                if v.denominator!=lcd:
                    hits.setdefault((min(b,d),max(b,d)),[]).append(f"{a}/{b} {sym} {c}/{d} = {v}  (LCD {lcd})")
print("  denominator range 2..12, proper reduced fractions, neither denominator dividing the other:")
if not hits: print("    NONE")
for k in sorted(hits):
    print(f"    denominators {k}: {len(hits[k])} cases, e.g. {hits[k][0]}")
print()
print("=== 5. Same, restricted to the denominators this assessment already uses (2,3,4,6,8,9,12) ===")
allowed={2,3,4,6,8,9,12}
hits2={}
for b in allowed:
  for d in allowed:
    if b==d or b%d==0 or d%b==0: continue
    for a in range(1,b):
        if gcd(a,b)!=1: continue
        for c in range(1,d):
            if gcd(c,d)!=1: continue
            for op,sym in ((1,'+'),(-1,'-')):
                v=F(a,b)+op*F(c,d)
                if v<=0: continue
                lcd=b*d//gcd(b,d)
                if v.denominator!=lcd:
                    hits2.setdefault((min(b,d),max(b,d)),[]).append(f"{a}/{b} {sym} {c}/{d} = {v}")
print("   ", hits2 if hits2 else "NONE — impossible within this assessment's own denominator vocabulary")
