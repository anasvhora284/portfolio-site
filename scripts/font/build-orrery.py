#!/usr/bin/env python3
"""Orrery display caps: didone with orbit-arc hairlines and 4-point-star punctuation.
Usage: python3 scripts/font/build-orrery.py  -> public/fonts/Orrery-Caps.woff2
All glyphs are polygons (dense sampled curves) with consistent winding; overlaps are
fine under the nonzero fill rule (no pathops needed). Extend by adding a glyph fn."""
import math, os, sys
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

CAP, OV = 700, 12
STEM, HAIR, THIN = 98, 18, 30     # thick stem, orbit hairline, thin vertical
SERIF = 17                        # serif lens thickness

# ---------- geometry helpers ----------
def area(p):
    return sum(p[i][0]*p[(i+1)%len(p)][1]-p[(i+1)%len(p)][0]*p[i][1] for i in range(len(p)))/2
def cw(p):  return p if area(p) < 0 else p[::-1]
def ccw(p): return p if area(p) > 0 else p[::-1]

def cubic(p0, p1, p2, p3, n=32):
    out = []
    for i in range(n+1):
        t = i/n; u = 1-t
        out.append((u**3*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t**3*p3[0],
                    u**3*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t**3*p3[1]))
    return out

def chain(segs, n=32):
    pts = []
    for s in segs:
        c = cubic(*s, n=n)
        pts += c if not pts else c[1:]
    return pts

def stroke(pts, wfn):
    """Variable-width stroke. wfn(t, tx, ty) -> width. Returns one polygon."""
    N = len(pts); L, R = [], []
    for i, (x, y) in enumerate(pts):
        a = pts[max(i-1, 0)]; b = pts[min(i+1, N-1)]
        dx, dy = b[0]-a[0], b[1]-a[1]; d = math.hypot(dx, dy) or 1
        tx, ty = dx/d, dy/d
        w = wfn(i/(N-1), tx, ty)/2
        L.append((x-ty*w, y+tx*w)); R.append((x+ty*w, y-tx*w))
    return cw(L+R[::-1])

def contrast(thick, thin, k=1.0):
    """Nib-like: horizontal tangents thin, vertical tangents thick."""
    return lambda t, tx, ty: thin + (thick-thin)*abs(ty)**k

def lens_w(thick, floor=4, p=4):
    return lambda t, tx, ty: max(floor, thick*(1-abs(2*t-1)**p))

def quad(p0, c, p1, n=40):
    return [((1-t)**2*p0[0]+2*(1-t)*t*c[0]+t*t*p1[0],
             (1-t)**2*p0[1]+2*(1-t)*t*c[1]+t*t*p1[1]) for t in (i/n for i in range(n+1))]

def orbit(x0, y0, x1, y1, bulge, thick, floor=4, p=4):
    """Hairline drawn as a thin arc (orbit sweep) bulging perpendicular to its chord."""
    mx, my = (x0+x1)/2, (y0+y1)/2
    dx, dy = x1-x0, y1-y0; d = math.hypot(dx, dy)
    c = (mx - dy/d*bulge*2, my + dx/d*bulge*2)
    return stroke(quad((x0, y0), c, (x1, y1)), lens_w(thick, floor, p))

def rect(x0, y0, x1, y1): return cw([(x0, y0), (x0, y1), (x1, y1), (x1, y0)])

def serif(cx, half, y, up=True, thick=SERIF):
    """Lens serif: flat on the stem line, top edge an orbit arc tapering to a point."""
    n = 28; sgn = 1 if up else -1
    top = [(cx+half*u, y+sgn*(2+thick*max(0, 1-abs(u)**2)**0.8)) for u in [i/n*2-1 for i in range(n+1)]]
    return cw(top + [(cx+half, y), (cx-half, y)])

def beak(x, y0, y1, dx=0, w0=HAIR+2, w1=5):
    return stroke(quad((x, y0), (x+dx*0.4, (y0+y1)/2), (x+dx, y1)), lambda t, a, b: w0+(w1-w0)*t)

def ellipse(cx, cy, rx, ry, n=120, rot=0):
    c, s = math.cos(rot), math.sin(rot)
    pts = []
    for i in range(n):
        a = 2*math.pi*i/n
        x, y = rx*math.cos(a), ry*math.sin(a)
        pts.append((cx+x*c-y*s, cy+x*s+y*c))
    return pts

def star(cx, cy, r, ratio=1.3, p=2.4, n=96):
    """4-point star (concave astroid-like); vertical points slightly longer."""
    pts = []
    for i in range(n):
        a = 2*math.pi*i/n; c, s = math.cos(a), math.sin(a)
        pts.append((cx+r*math.copysign(abs(c)**p, c), cy+r*ratio*math.copysign(abs(s)**p, s)))
    return cw(pts)

def xform(polys, f): return [cw([f(x, y) for x, y in p]) if area(p) < 0 else ccw([f(x, y) for x, y in p]) for p in polys]

# ---------- glyphs: return list of polygons in local coords ----------
def g_I():
    c = 105
    return [rect(c-STEM/2, 0, c+STEM/2, CAP), serif(c, 105, 0), serif(c, 105, CAP, False)]

def g_H():
    a, b = 105, 625
    return [rect(a-STEM/2, 0, a+STEM/2, CAP), rect(b-STEM/2, 0, b+STEM/2, CAP),
            serif(a,105,0), serif(a,105,CAP,False), serif(b,105,0), serif(b,105,CAP,False),
            orbit(a, 352, b, 352, 22, HAIR*1.6, floor=HAIR, p=12)]

def g_L():
    c = 105
    return [rect(c-STEM/2, 0, c+STEM/2, CAP), serif(c,105,CAP,False),
            serif(300, 300, 0, thick=HAIR+6), beak(574, 4, 118, dx=-4)]

def g_T():
    c = 320; y = CAP-9
    return [rect(c-STEM/2, 0, c+STEM/2, CAP-12), serif(c,105,0),
            orbit(0, y, 640, y, -12, 26, floor=8, p=10), beak(10, y+4, y-105, dx=2), beak(630, y+4, y-105, dx=-2)]

def g_F():
    c = 105; y = CAP-9
    return [rect(c-STEM/2, 0, c+STEM/2, CAP), serif(c,105,0),
            orbit(0, y, 540, y, -10, 24, floor=8, p=10), beak(532, y+4, y-100, dx=-2),
            orbit(c, 352, 440, 352, 12, HAIR*1.5, floor=HAIR, p=12), beak(440, 352+42, 352-38)]

def a_body():
    top = CAP+OV
    thick = cw([(352, top), (418, top), (704, 0), (596, 0)])
    thin = stroke(quad((380, top-4), (222, 350), (108, 0)), lambda t, a, b: 12+HAIR*0.7*(t))
    return [thick, thin, serif(108, 82, 0), serif(650, 92, 0)]

def g_A():
    b = a_body()
    bar = orbit(176, 232, 520, 232, 20, HAIR*1.6, floor=HAIR, p=12)
    return b + [bar]

def g_V():
    W = 800
    return xform(a_body(), lambda x, y: (W-x, CAP-y))

def g_N():
    l, r = 83, 717
    return [rect(l-THIN/2, 0, l+THIN/2, CAP), rect(r-THIN/2, 0, r+THIN/2, CAP),
            cw([(l-THIN/2, CAP), (l-THIN/2+128, CAP), (r+THIN/2, 0), (r+THIN/2-128, 0)]),
            serif(l,92,0), serif(l,92,CAP,False), serif(r,92,CAP,False), serif(r,92,0)]

def g_O():
    cx, cy = 372, CAP/2
    return [cw(ellipse(cx, cy, 352, 362)), ccw(ellipse(cx, cy, 352-STEM-4, 362-HAIR-2))]

def g_S():
    segs = [((582,588),(548,664),(458,700),(356,700)),
            ((356,700),(236,700),(150,640),(150,545)),
            ((150,545),(150,440),(280,395),(360,350)),
            ((360,350),(450,305),(572,262),(572,160)),
            ((572,160),(572,62),(480,0),(352,0)),
            ((352,0),(246,0),(160,36),(112,120))]
    body = stroke(chain(segs), contrast(STEM+8, HAIR, 0.85))
    return [body]

def bowl_segs(top, bot, r):
    return [((120, top), (r-150, top), (r, top-20), (r, (top+bot)/2)),
            ((r, (top+bot)/2), (r, bot+20), (r-170, bot), (120, bot))]

def g_P():
    c = 105
    return [rect(c-STEM/2, 0, c+STEM/2, CAP), serif(c,105,0), serif(c,105,CAP,False),
            stroke(chain(bowl_segs(CAP-8, 312, 560)), contrast(STEM-4, HAIR+2, 1.0))]

def g_R():
    c = 105
    leg = cw([(330, 318), (430, 318), (700, 0), (592, 0)])
    return g_P() + [leg, serif(646, 96, 0)]

def g_space(): return []

def g_period(): return [star(80, 84, 82, ratio=1.25, p=2.8)]

def g_hyphen(): return [orbit(0, 262, 280, 262, 8, 34, floor=12, p=6)]

def g_emdash():
    return [orbit(0, 262, 1000, 262, 10, 28, floor=8, p=8), star(500, 262, 92, ratio=1.0, p=3.0)]

GLYPHS = {  # name: (char, fn, lsb, rsb)
    "A": (g_A, 8, 8), "N": (g_N, 20, 20), "S": (g_S, 40, 40), "V": (g_V, 8, 8),
    "H": (g_H, 20, 20), "O": (g_O, 42, 42), "R": (g_R, 20, 20), "P": (g_P, 20, 30),
    "T": (g_T, 22, 22), "F": (g_F, 20, 40), "L": (g_L, 20, 40), "I": (g_I, 20, 20),
}
PUNCT = {"period": (".", g_period, 60, 60), "hyphen": ("-", g_hyphen, 50, 50),
         "emdash": ("—", g_emdash, 0, 0)}

KERN = [("A","V",-70),("V","A",-70),("L","T",-120),("T","A",-70),("A","T",-70),("P","A",-70),
        ("F","O",-24),("R","T",-24),("T","O",-30),("L","V",-90),("V","O",-20),("O","V",-20),
        ("A","S",0),("F","A",-60),("A","V",-70),("P","period",-60)]

def build(out):
    glyphs, metrics = {".notdef": TTGlyphPen(None).glyph()}, {".notdef": (500, 0)}
    order = [".notdef", "space"]; cmap = {32: "space"}
    pen = TTGlyphPen(None); glyphs["space"] = pen.glyph(); metrics["space"] = (260, 0)
    items = [(n, ord(n), fn, l, r) for n, (fn, l, r) in GLYPHS.items()] + \
            [(n, ord(c), fn, l, r) for n, (c, fn, l, r) in PUNCT.items()]
    for name, cp, fn, lsb, rsb in items:
        polys = fn()
        xs = [x for p in polys for x, _ in p]; x0, x1 = min(xs), max(xs)
        dx = lsb - x0
        pen = TTGlyphPen(None)
        for p in polys:
            q = [(round(x+dx), round(y)) for x, y in p]
            pen.moveTo(q[0]); [pen.lineTo(pt) for pt in q[1:]]; pen.closePath()
        glyphs[name] = pen.glyph()
        metrics[name] = (round(x1-x0+lsb+rsb), lsb)
        cmap[cp] = name; order.append(name)
    # notdef box
    pen = TTGlyphPen(None)
    for p in (rect(50, 0, 450, 700), ccw([(90, 40), (410, 40), (410, 660), (90, 660)])):
        pen.moveTo(p[0]); [pen.lineTo(q) for q in p[1:]]; pen.closePath()
    glyphs[".notdef"] = pen.glyph(); metrics[".notdef"] = (500, 50)
    fb = FontBuilder(1000, isTTF=True)
    fb.setupGlyphOrder([".notdef"] + order[1:]); fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs); fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=820, descent=-220)
    fb.setupNameTable({"familyName": "Orrery", "styleName": "Caps"})
    fb.setupOS2(sTypoAscender=820, sTypoDescender=-220, usWinAscent=900, usWinDescent=260,
                sCapHeight=CAP, sxHeight=CAP, achVendID="ORRY")
    fb.setupPost()
    kern = {(a, b): v for a, b, v in KERN if v}
    fea = "languagesystem DFLT dflt;\nlanguagesystem latn dflt;\nfeature kern {\n" + \
          "".join(f"  pos {a} {b} {v};\n" for (a, b), v in kern.items()) + "} kern;\n"
    fb.addOpenTypeFeatures(fea)
    fb.font.flavor = "woff2"; fb.save(out)
    print(out, os.path.getsize(out), "bytes")

if __name__ == "__main__":
    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    build(sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, "public/fonts/Orrery-Caps.woff2"))
