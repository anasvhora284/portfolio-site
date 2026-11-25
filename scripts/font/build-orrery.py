#!/usr/bin/env python3
"""Orrery display face: didone with orbit-arc hairlines, tilted stress and 4-point-star dots.
Usage: python3 scripts/font/build-orrery.py  -> public/fonts/Orrery.woff2 (deterministic)
Glyphs are polygons (sampled curves, RDP-simplified) with consistent winding; overlaps are fine under
the nonzero fill rule (no pathops). Extend by adding a glyph fn to GLYPHS."""
import math, os, sys
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

CAP, XH, ASC, DESC, OV = 700, 480, 750, -220, 12
S, HR, TH = 140, 30, 46          # cap stem, orbit hairline, thin vertical
LS, LH = 120, 26                 # lowercase stem, hairline
SERIF = 20
TILT = 14                        # stress tilt (degrees) of bowls: the "orbit" angle

# ---------- geometry ----------
def area(p):
    return sum(p[i][0]*p[(i+1)%len(p)][1]-p[(i+1)%len(p)][0]*p[i][1] for i in range(len(p)))/2
def cw(p):  return p if area(p) < 0 else p[::-1]
def ccw(p): return p if area(p) > 0 else p[::-1]

def cubic(p0, p1, p2, p3, n=28):
    out = []
    for i in range(n+1):
        t = i/n; u = 1-t
        out.append((u**3*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t**3*p3[0],
                    u**3*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t**3*p3[1]))
    return out
def chain(segs, n=28):
    pts = []
    for s in segs:
        c = cubic(*s, n=n); pts += c if not pts else c[1:]
    return pts
def quad(p0, c, p1, n=36):
    return [((1-t)**2*p0[0]+2*(1-t)*t*c[0]+t*t*p1[0], (1-t)**2*p0[1]+2*(1-t)*t*c[1]+t*t*p1[1])
            for t in (i/n for i in range(n+1))]
def arc(cx, cy, rx, ry, a0, a1, n=96):
    return [(cx+rx*math.cos(math.radians(a0+(a1-a0)*i/n)), cy+ry*math.sin(math.radians(a0+(a1-a0)*i/n)))
            for i in range(n+1)]

def stroke(pts, wfn, closed=False):
    """Variable-width stroke. wfn(t, tx, ty) -> width. Open -> [poly]; closed -> [outer, inner]."""
    N = len(pts); L, R = [], []
    for i, (x, y) in enumerate(pts):
        a = pts[(i-1) % N] if closed else pts[max(i-1, 0)]
        b = pts[(i+1) % N] if closed else pts[min(i+1, N-1)]
        dx, dy = b[0]-a[0], b[1]-a[1]; d = math.hypot(dx, dy) or 1
        tx, ty = dx/d, dy/d
        w = wfn(i/(N-1), tx, ty)/2
        L.append((x-ty*w, y+tx*w)); R.append((x+ty*w, y-tx*w))
    if closed:
        a, b = (L, R) if abs(area(L)) > abs(area(R)) else (R, L)
        return [cw(a), ccw(b)]
    return [cw(L+R[::-1])]

def nibw(thick, thin, ang=TILT, k=1.0):
    """Broad-nib contrast: thin where the tangent runs along the (tilted) nib edge."""
    nx, ny = math.cos(math.radians(ang)), math.sin(math.radians(ang))
    return lambda t, tx, ty: thin+(thick-thin)*abs(tx*ny-ty*nx)**k
def ramp(f, a=0.0, b=1.0, lo=0.0, hi=1.0, tail=False):
    """Scale width function by a smooth t-ramp (taper ends)."""
    def w(t, tx, ty):
        u = (t-a)/(b-a) if not tail else (b-t)/(b-a)
        u = max(0, min(1, u)); u = u*u*(3-2*u)
        return f(t, tx, ty)*(lo+(hi-lo)*u)
    return w
def lens_w(thick, floor=4, p=4):
    return lambda t, tx, ty: max(floor, thick*(1-abs(2*t-1)**p))
def orbit(x0, y0, x1, y1, bulge, thick, floor=4, p=4):
    """Hairline drawn as a thin arc bulging perpendicular to its chord, tapering at both ends."""
    mx, my = (x0+x1)/2, (y0+y1)/2; dx, dy = x1-x0, y1-y0; d = math.hypot(dx, dy)
    c = (mx-dy/d*bulge*2, my+dx/d*bulge*2)
    return stroke(quad((x0, y0), c, (x1, y1)), lens_w(thick, floor, p))
def taper(pts, w0, w1): return stroke(pts, lambda t, a, b: w0+(w1-w0)*t)

def rect(x0, y0, x1, y1): return cw([(x0, y0), (x0, y1), (x1, y1), (x1, y0)])
def ellipse(cx, cy, rx, ry, n=48, rot=0):
    c, s = math.cos(rot), math.sin(rot); pts = []
    for i in range(n):
        a = 2*math.pi*i/n; x, y = rx*math.cos(a), ry*math.sin(a)
        pts.append((cx+x*c-y*s, cy+x*s+y*c))
    return cw(pts)
def ball(x, y, r): return ellipse(x, y, r, r*1.05, 28)
def ring(cx, cy, ox, oy, thick, thin, ang=TILT, k=1.0, n=120, kx=None):
    """Closed bowl with tilted stress; ox/oy are ~outer half extents."""
    pts = arc(cx, cy, ox-thick/2, oy-thin/2, 0, 360, n)
    return stroke(pts, nibw(thick, thin, ang, k), closed=True)
def serif(cx, half, y, up=True, thick=SERIF):
    n = 20; sgn = 1 if up else -1
    top = [(cx+half*u, y+sgn*(2+thick*max(0, 1-abs(u)**2)**0.8)) for u in [i/n*2-1 for i in range(n+1)]]
    return cw(top+[(cx+half, y), (cx-half, y)])
def flag(xl, xr, y, L=58, thick=15):
    """Top-left flag serif hanging from y."""
    return serif((xl-L+xr)/2, (xr-xl+L)/2, y, False, thick)
def star(cx, cy, r, ratio=1.3, p=2.4, n=64):
    pts = []
    for i in range(n):
        a = 2*math.pi*i/n; c, s = math.cos(a), math.sin(a)
        pts.append((cx+r*math.copysign(abs(c)**p, c), cy+r*ratio*math.copysign(abs(s)**p, s)))
    return cw(pts)
def xform(polys, f):
    return [cw([f(x, y) for x, y in p]) if area(p) < 0 else ccw([f(x, y) for x, y in p]) for p in polys]
def flat(*items):
    out = []
    for it in items:
        if it and isinstance(it[0], tuple): out.append(it)
        else: out += it
    return out
def vstem(c, y0, y1, w): return rect(c-w/2, y0, c+w/2, y1)
def diag(x0, y0, x1, y1, w): return cw([(x0-w/2, y0), (x0+w/2, y0), (x1+w/2, y1), (x1-w/2, y1)])
def beak(x, y0, y1, dx=0, w0=HR+4, w1=9):
    return taper(quad((x, y0), (x+dx*0.5, (y0+y1)/2+(y1-y0)*0.15), (x+dx, y1)), w0, w1)

# ---------- CAPITALS ----------
def stem_serifs(c, top=True, bot=True, half=108, y1=CAP):
    return [serif(c, half, 0)] if bot else []
def I(c=108):
    return [vstem(c, 0, CAP, S), serif(c, 108, 0), serif(c, 108, CAP, False)]
def H():
    a, b = 108, 640
    return [vstem(a, 0, CAP, S), vstem(b, 0, CAP, S), serif(a, 108, 0), serif(a, 108, CAP, False),
            serif(b, 108, 0), serif(b, 108, CAP, False), *orbit(a, 352, b, 352, 22, HR*1.7, floor=HR, p=12)]
def L():
    c = 108
    return [vstem(c, 0, CAP, S), serif(c, 108, CAP, False), serif(c, 108, 0),
            *orbit(c, 10, 590, 10, -6, 40, floor=12, p=9), *beak(576, 20, 150, dx=-10, w0=HR+10, w1=10)]
def T():
    c = 330; y = CAP-12
    return [vstem(c, 0, CAP-14, S), serif(c, 108, 0), *orbit(0, y, 660, y, -12, 32, floor=9, p=9),
            *beak(18, y+6, y-120, dx=6, w0=HR+8, w1=10), *beak(642, y+6, y-120, dx=-6, w0=HR+8, w1=10)]
def F():
    c = 108; y = CAP-12
    return [vstem(c, 0, CAP, S), serif(c, 108, 0), *orbit(c, y, 570, y, -10, 30, floor=9, p=9),
            *beak(558, y+6, y-110, dx=-8, w0=HR+8, w1=10),
            *orbit(c, 350, 450, 350, 12, HR*1.6, floor=HR, p=12), *beak(450, 350+46, 350-40, w0=HR+4, w1=9),
            serif(c, 108, CAP, False)]
def E():
    c = 108; y = CAP-12
    return [vstem(c, 0, CAP, S), serif(c, 108, CAP, False), serif(c, 108, 0),
            *orbit(c, y, 560, y, -10, 30, floor=9, p=9), *beak(548, y+6, y-110, dx=-8, w0=HR+8, w1=10),
            *orbit(c, 352, 450, 352, 12, HR*1.6, floor=HR, p=12), *beak(450, 352+44, 352-38, w0=HR+4, w1=9),
            *orbit(c, 10, 590, 10, -6, 40, floor=12, p=9), *beak(578, 20, 140, dx=-8, w0=HR+10, w1=10)]
def a_body(h, W, sw=S, apex=None):
    top = h+12; ax = W/2 if apex is None else apex
    hw = sw*0.36
    thick = cw([(ax-hw, top), (ax+hw, top), (W-104+sw*0.1, 0), (W-104-sw*1.0, 0)])
    thin = stroke(quad((ax-8, top-4), (ax-W*0.17, h*0.5), (96, 0)), lambda t, a, b: 14+HR*0.8*t)
    return [thick, *thin, serif(96, 84, 0), serif(W-104-sw*0.45, 96, 0)]
def A():
    W = 800
    return a_body(CAP, W)+orbit(176, 226, 524, 226, 20, HR*1.7, floor=HR, p=12)
def V():
    W = 800
    return xform(a_body(CAP, W), lambda x, y: (W-x, CAP-y))
def N():
    l, r = 88, 744
    return [vstem(l, 0, CAP, TH), vstem(r, 0, CAP, TH),
            cw([(l-TH/2, CAP), (l-TH/2+170, CAP), (r+TH/2, 0), (r+TH/2-170, 0)]),
            serif(l, 94, 0), serif(l, 94, CAP, False), serif(r, 94, CAP, False), serif(r, 94, 0)]
def M():
    l, r, m = 92, 868, 480
    return [vstem(l, 0, CAP, TH+4), vstem(r, 0, CAP, S-14),
            cw([(l-14, CAP), (l+120, CAP), (m+48, 0), (m-80, 0)]),
            *stroke(quad((m+30, 24), (m+200, 380), (r-30, CAP-6)), lambda t, a, b: 22+HR*0.5*t),
            serif(l, 94, 0), serif(l, 94, CAP, False), serif(r, 100, 0), serif(r, 100, CAP, False), serif(m, 70, 0)]
def O(w=1):
    return ring(380, CAP/2, 352*w, CAP/2+OV, S+4, HR+2, k=1.1)
def Cc():
    pts = arc(372, CAP/2, 316, 336, 38, 322, 110)
    w = ramp(nibw(S+4, HR+2, k=1.1), 0, 0.18, 0.5, 1)
    return [*stroke(pts, w), ball(pts[0][0]-2, pts[0][1]-4, 40), ball(pts[-1][0]+4, pts[-1][1]+6, 24)]
def G():
    pts = arc(372, CAP/2, 316, 336, 40, 330, 110)
    w = ramp(nibw(S+4, HR+2, k=1.1), 0, 0.18, 0.5, 1)
    return [*stroke(pts, w), ball(pts[0][0]-2, pts[0][1]-4, 40),
            rect(370, 276, 716, 276+HR+6), vstem(668, 0, 306, S-8), serif(668, 100, 0), serif(560, 120, 276+HR+6, False, 12)]
def bowl(top, bot, r, x0=108, w=S-6, thin=HR+4, k=1.0):
    mid = (top+bot)/2; h = (top-bot)/2
    segs = [((x0, top), (r*0.55, top), (r, top-h*0.18), (r, mid)),
            ((r, mid), (r, bot+h*0.18), (r*0.55, bot), (x0, bot))]
    return stroke(chain(segs, 30), nibw(w, thin, 6, k))
def P():
    return [vstem(108, 0, CAP, S), serif(108, 108, 0), serif(108, 108, CAP, False), *bowl(CAP-14, 322, 550)]
def B():
    return [vstem(108, 0, CAP, S), serif(108, 108, 0), serif(108, 108, CAP, False),
            *bowl(CAP-14, 372, 520), *bowl(366, 14, 606)]
def D():
    return [vstem(108, 0, CAP, S), serif(108, 108, 0), serif(108, 108, CAP, False), *bowl(CAP-14, 14, 690, w=S+2)]
def R():
    leg = stroke(cubic((340, 330), (440, 250), (540, 140), (676, 38), 40), lambda t, a, b: 36+86*math.sin(min(1, t*1.3)*math.pi/2)**1.2*(1-0.15*t))
    return P()+[*leg, serif(668, 102, 0)]
def U():
    pts = chain([((108, CAP), (108, 300), (108, 80), (190, 16)), ((190, 16), (260, -10), (330, -12), (400, 4)),
                 ((400, 4), (500, 30), (630, 120), (640, 330)), ((640, 330), (640, 330), (640, 330), (640, CAP))], 24)
    def w(t, tx, ty):
        base = 40+78*abs(ty)**1.2
        side = 1-0.62*min(1, max(0, (t-0.62)/0.15))
        return (28+(base-28)*side) if t > 0.55 else base
    return [*stroke(pts, w), serif(108, 108, CAP, False), serif(640, 104, CAP, False)]
def J():
    c = 420
    pts = chain([((c, CAP), (c, 300), (c, 150), (c-20, 70)), ((c-20, 70), (c-50, -10), (c-130, -14), (c-220, 4)), ((c-220, 4), (c-290, 18), (c-330, 60), (c-330, 108))], 22)
    return [*stroke(pts, ramp(nibw(S+2, HR+2, 0, 1.2), 0.65, 1.0, 0.45, 1.0, tail=True)), ball(c-326, 126, 40), serif(c, 108, CAP, False)]
def K():
    c = 108
    return [vstem(c, 0, CAP, S), serif(c, 108, 0), serif(c, 108, CAP, False),
            *taper(quad((c+40, 300), (400, 480), (640, CAP-8)), 22, HR+12), serif(660, 90, CAP, False, 14),
            *stroke(quad((296, 410), (430, 250), (652, 34)), lambda t, a, b: 26+92*min(1, t*2.2)**0.8), serif(666, 100, 0)]
def W_():
    Wd = 1180
    def vv(x0, thickleft):
        return None
    ax1, ax2, ax3 = 108, 590, 1072
    return [cw([(ax1-44, CAP), (ax1+44, CAP), (356, 0), (230, 0)]), *taper(quad((344, 0), (420, 300), (ax2, CAP-4)), 14, 14+HR*0.8),
            cw([(548, CAP), (634, CAP), (880, 0), (752, 0)]),
            *stroke(quad((868, 0), (950, 300), (1082, CAP-4)), lambda t, a, b: 14+HR*0.8*(1-t)),
            serif(108, 90, CAP, False), serif(ax2, 80, CAP, False), serif(1090, 90, CAP, False), serif(294, 62, 0), serif(816, 62, 0)]
def X():
    return [cw([(84, CAP), (224, CAP), (712, 0), (572, 0)]), *stroke(quad((690, CAP-4), (400, 330), (110, 4)), lambda t, a, b: 16+HR*0.8*(1-t) if t < 0.5 else 16+HR*0.8*(1-t)),
            serif(150, 100, CAP, False), serif(660, 100, CAP, False), serif(110, 90, 0), serif(650, 100, 0)]
def Y():
    c = 380
    return [vstem(c, 0, 320, S), serif(c, 108, 0), cw([(84, CAP), (224, CAP), (c+44, 330), (c-80, 300)]),
            *stroke(quad((680, CAP-4), (c+150, 520), (c, 316)), lambda t, a, b: 16+HR*0.8*(1-t)), serif(150, 100, CAP, False), serif(676, 90, CAP, False)]
def Z():
    y = CAP-12
    return [*orbit(30, y, 640, y, -8, 34, floor=10, p=9), *beak(40, y+6, y-120, dx=4, w0=HR+10, w1=10),
            cw([(596, y), (710, y), (160, 0), (36, 0)]), *orbit(30, 10, 690, 10, -6, 40, floor=12, p=9), *beak(676, 20, 150, dx=-4, w0=HR+10, w1=10)]
def Q():
    tail = stroke(cubic((470, 110), (540, 40), (620, -60), (730, -50), 30), lambda t, a, b: 22+50*math.sin(min(1, t*1.6)*math.pi/2)*(1-t*0.7))
    return O()+tail
def S_():
    segs = [((596, 584), (562, 664), (470, 706), (360, 706)), ((360, 706), (236, 706), (150, 646), (150, 548)),
            ((150, 548), (150, 436), (290, 394), (372, 350)), ((372, 350), (462, 304), (590, 262), (590, 156)),
            ((590, 156), (590, 56), (490, -6), (360, -6)), ((360, -6), (250, -6), (156, 30), (106, 118))]
    pts = chain(segs, 26)
    body = stroke(pts, ramp(ramp(nibw(S+14, HR, 8, 0.85), 0, 0.1, 0.45, 1.0), 0.9, 1.0, 0.45, 1.0, tail=True))
    return [*body, ball(pts[0][0]+2, pts[0][1]-2, 38), ball(pts[-1][0]+2, pts[-1][1]+2, 38)]

# ---------- lowercase ----------
def lc_ring(cx=235, cy=240, ox=234, oy=248, **k): return ring(cx, cy, ox, oy, LS+2, LH+1, k=1.1, **k)
def n_poly(stems=1, ascender=False):
    top = ASC if ascender else XH
    l = 74; out = [vstem(l, 0, top, LS), serif(l, 96, 0), flag(l-LS/2, l+LS/2, top, 62 if not ascender else 70)]
    x = l
    for i in range(stems):
        pts = chain([((x+4, 330), (x+40, 442), (x+130, 470), (x+196, 470)), ((x+196, 470), (x+280, 470), (x+300, 410), (x+300, 290))], 24)
        wf = lambda t, a, b: LH+2+(LS-6-LH)*max(0, min(1, (t-0.3)/0.7))**1.1
        out += stroke(pts, wf); x += 300
        out += [vstem(x, 0, 300, LS-6), serif(x, 94, 0)]
    return out
def lc_n(): return n_poly(1)
def lc_m(): return n_poly(2)
def lc_h(): return n_poly(1, True)
def lc_u(): 
    n = n_poly(1); W = 300+74+60
    return xform(n, lambda x, y: (W-x, XH-y))
def lc_r():
    l = 74
    pts = chain([((l+4, 330), (l+40, 442), (l+120, 470), (l+190, 462))], 24)
    return [vstem(l, 0, XH, LS), serif(l, 96, 0), flag(l-LS/2, l+LS/2, XH, 62), *stroke(pts, lambda t, a, b: LH+2+(LS-30-LH)*max(0, 1-t*1.0)**1.3 if t < .5 else LH+2+30*(1-t)),
            ball(l+196, 440, 36), *taper([(l+190, 462), (l+196, 440)], 20, 20)]
def bd(kind):
    """b d p q: ring + stem; kind in 'bdpq'."""
    cx = 234; ox = 234
    r = lc_ring(cx=cx)
    if kind in "bp":
        sx = 74; ring_ = lc_ring(cx=334-60+2)
        ring_ = ring(300, 240, 234, 248, LS+2, LH+1, k=1.1)
        out = [*ring_]; sx = 300-234+LS/2+2
        if kind == "b": out += [vstem(sx, 0, ASC, LS), flag(sx-LS/2, sx+LS/2, ASC, 70), serif(sx, 96, 0)]
        else: out += [vstem(sx, DESC, XH, LS), flag(sx-LS/2, sx+LS/2, XH, 62), serif(sx, 96, DESC, True)]
        return out
    ring_ = ring(236, 240, 234, 248, LS+2, LH+1, k=1.1); sx = 236+234-LS/2-2
    if kind == "d": return [*ring_, vstem(sx, 0, ASC, LS), flag(sx-LS/2, sx+LS/2, ASC, 70), serif(sx+20, 76, 0)]
    return [*ring_, vstem(sx, DESC, XH, LS), flag(sx-LS/2, sx+LS/2, XH, 62), serif(sx, 96, DESC, True)]
def lc_o(): return lc_ring()
def lc_c():
    pts = arc(230, 240, 184, 198, 40, 322, 100)
    return [*stroke(pts, ramp(nibw(LS+4, LH+1, k=1.1), 0, 0.15, 0.5, 1)), ball(pts[0][0], pts[0][1], 34), ball(pts[-1][0]+2, pts[-1][1]+2, 20)]
def lc_e():
    pts = arc(230, 240, 184, 198, 0, 318, 100)
    return [*stroke(pts, ramp(ramp(nibw(LS+4, LH+1, k=1.1), 0, 0.2, 0.2, 1), 0.92, 1, 0.5, 1, tail=True)), *orbit(46, 240, 414, 240, 0, LH*1.6, floor=LH, p=14)]
def lc_a():
    pts = chain([((54, 372), (96, 466), (176, 494), (240, 494)), ((240, 494), (316, 494), (356, 440), (356, 330)), ((356, 330), (356, 300), (356, 270), (356, 240))], 20)
    bowl_ = ring(188, 140, 172, 152, LS-14, LH, k=1.1)
    return [*stroke(pts, lambda t, a, b: LH+2+(LS-LH)*max(0, min(1, (t-0.3)/0.3))**1.2), ball(54, 366, 34),
            vstem(356, 0, 240, LS), *bowl_, serif(356, 100, 0), *orbit(170, 286, 352, 286, -4, LH*1.3, floor=LH, p=10)]
def lc_g():
    bowl_ = ring(218, 270, 190, 216, LS-28, LH+1, k=1.1)
    sx = 218+190-LS/2
    pts = chain([((sx, 300), (sx, 160), (sx, 40), (sx-20, -40)), ((sx-20, -40), (sx-50, -150), (sx-130, -200), (sx-216, -200)), ((sx-216, -200), (sx-286, -200), (sx-320, -160), (sx-320, -112))], 22)
    return [*bowl_, vstem(sx, 200, XH, LS-4), flag(sx-LS/2, sx+LS/2, XH, 56), *stroke(pts, ramp(nibw(LS-4, LH+2, 0, 1.2), 0.62, 1.0, 0.5, 1.0, tail=True)), ball(sx-316, -126, 36)]
def lc_s():
    segs = [((322, 380), (298, 450), (240, 486), (180, 486)), ((180, 486), (104, 486), (60, 440), (60, 380)),
            ((60, 380), (60, 310), (130, 280), (196, 244)), ((196, 244), (268, 206), (336, 172), (336, 112)),
            ((336, 112), (336, 40), (276, -6), (196, -6)), ((196, -6), (120, -6), (62, 22), (36, 76))]
    pts = chain(segs, 24)
    return [*stroke(pts, ramp(ramp(nibw(LS-6, LH, 8, 0.9), 0, 0.08, 0.5, 1), 0.92, 1, 0.55, 1, tail=True)),
            ball(pts[0][0], pts[0][1], 30), ball(pts[-1][0], pts[-1][1], 30)]
def lc_i():
    c = 74
    return [vstem(c, 0, XH, LS), serif(c, 96, 0), flag(c-LS/2, c+LS/2, XH, 62), star(c, 640, 58, 1.2, 2.6)]
def lc_j():
    c = 190
    pts = chain([((c, XH), (c, 200), (c, 0), (c-14, -60)), ((c-14, -60), (c-36, -140), (c-100, -186), (c-168, -186)), ((c-168, -186), (c-210, -186), (c-236, -160), (c-236, -128))], 22)
    return [*stroke(pts, ramp(nibw(LS, LH+2, 0, 1.2), 0.62, 1.0, 0.5, 1.0, tail=True)), ball(c-232, -140, 34), flag(c-LS/2, c+LS/2, XH, 62), star(c, 640, 58, 1.2, 2.6)]
def lc_l():
    c = 74
    return [vstem(c, 0, ASC, LS), serif(c, 96, 0), flag(c-LS/2, c+LS/2, ASC, 70)]
def lc_t():
    c = 140
    pts = chain([((c, 0), (c, 0), (c, 0), (c, 0))], 2)
    hook = stroke(chain([((c+4, 150), (c+4, 40), (c+50, -8), (c+130, -8)), ((c+130, -8), (c+180, -8), (c+224, 10), (c+262, 70))], 22),
                  ramp(nibw(LS-6, LH+2, 0, 1.2), 0.55, 1.0, 0.35, 1.0, tail=True))
    return [vstem(c, 150, 640, LS-4), flag(c-LS/2, c+LS/2, 640, 40), *hook, *orbit(0, XH-8, 330, XH-8, 8, LH*1.7, floor=LH, p=12)]
def lc_f():
    c = 150
    hook = stroke(chain([((c, 560), (c, 700), (c+60, 760), (c+150, 760)), ((c+150, 760), (c+210, 760), (c+250, 726), (c+262, 676))], 22),
                  ramp(nibw(LS-4, LH+2, 0, 1.2), 0, 0.5, 1.0, 1.0))
    return [vstem(c, 0, 600, LS-2), serif(c, 96, 0), *hook, ball(c+260, 664, 38), *orbit(-8, XH-8, 330, XH-8, 8, LH*1.7, floor=LH, p=12)]
def lc_k():
    c = 74
    return [vstem(c, 0, ASC, LS), serif(c, 96, 0), flag(c-LS/2, c+LS/2, ASC, 70),
            *taper(quad((c+40, 190), (230, 340), (396, XH-6)), 18, LH+10), serif(404, 70, XH, False, 12),
            *stroke(quad((172, 270), (270, 180), (410, 30)), lambda t, a, b: 22+76*min(1, t*2.2)**0.8), serif(416, 80, 0)]
def v_poly(h, W, sw):
    return xform(a_body(h, W, sw=sw), lambda x, y: (W-x, h-y))
def lc_v(): return v_poly(XH, 560, LS+4)
def lc_w():
    ax = [74, 394, 714]
    return [cw([(ax[0]-36, XH), (ax[0]+44, XH), (284, 0), (190, 0)]), *stroke(quad((276, 0), (330, 240), (ax[1], XH-4)), lambda t, a, b: 12+LH*0.7*t),
            cw([(376, XH), (456, XH), (604, 0), (510, 0)]),
            *stroke(quad((596, 0), (660, 240), (ax[2], XH-4)), lambda t, a, b: 12+LH*0.7*(1-t)),
            serif(86, 78, XH, False), serif(ax[1]-4, 70, XH, False), serif(724, 78, XH, False), serif(238, 50, 0), serif(558, 50, 0)]
def lc_x():
    return [cw([(60, XH), (190, XH), (462, 0), (340, 0)]), *stroke(quad((430, XH-4), (260, 230), (80, 4)), lambda t, a, b: 14+LH*0.8*(1-t)),
            serif(120, 80, XH, False), serif(440, 76, XH, False), serif(80, 70, 0), serif(414, 80, 0)]
def lc_y():
    W = 560
    hook = stroke(quad((190, 50), (130, -140), (40, -170)), lambda t, a, b: 36-14*t)
    return v_poly(XH, W, LS+4)[:3]+[serif(W-98-(LS+4)*0.45, 76, XH, False), serif(84, 60, XH, False), *stroke(chain([((300, 120), (256, 0), (210, -110), (130, -180)), ((130, -180), (90, -215), (40, -210), (20, -170))], 18), lambda t, a, b: 20+66*(1-t)**0.9),
                                      ball(24, -166, 32)]
def lc_z():
    y = XH-10
    return [*orbit(30, y, 430, y, -6, 28, floor=9, p=9), *beak(34, y+4, y-80, dx=4, w0=LH+8, w1=9),
            cw([(396, y), (490, y), (126, 0), (40, 0)]), *orbit(30, 8, 470, 8, -4, 34, floor=10, p=9), *beak(458, 16, 100, dx=-4, w0=LH+8, w1=9)]
def lc_q(): return bd("q")

# ---------- digits ----------
def d_zero(): return ring(300, CAP/2, 282, CAP/2+OV, S+8, HR+4, k=1.1)
def d_one():
    c = 270
    return [vstem(c, 0, CAP, S-2), serif(c, 160, 0), *stroke(quad((c-48, CAP-4), (c-130, CAP-40), (c-200, CAP-130)), lambda t, a, b: 66-48*t**0.8), ball(c-205, CAP-128, 20)]
def d_two():
    pts = chain([((84, 540), (90, 660), (170, 712), (276, 712)), ((276, 712), (400, 712), (470, 640), (470, 548)), ((470, 548), (470, 380), (270, 230), (110, 40))], 26)
    return [*stroke(pts, ramp(nibw(S-6, HR+2, 10, 1.1), 0.66, 1.0, 1.0, 1.0)), ball(80, 542, 36),
            *orbit(80, 12, 520, 12, -6, 44, floor=14, p=9), *beak(510, 20, 140, dx=-4, w0=HR+10, w1=10)]
def d_three():
    t = chain([((84, 556), (96, 660), (180, 712), (270, 712)), ((270, 712), (380, 712), (440, 650), (440, 566)),
               ((440, 566), (440, 470), (370, 410), (246, 388))], 24)
    b = chain([((246, 388), (400, 372), (480, 300), (480, 190)), ((480, 190), (480, 60), (390, -12), (260, -12)),
               ((260, -12), (170, -12), (100, 30), (60, 100))], 24)
    w = ramp(nibw(S-8, HR+2, 12, 1.1), 0.0, 0.9, 1, 1)
    return [*stroke(t, w), *stroke(b, ramp(nibw(S-6, HR+2, 12, 1.1), 0.0, 0.1, 0.3, 1)), ball(84, 554, 36), ball(58, 108, 33)]
def d_four():
    c = 450
    return [vstem(c, 0, CAP, S), serif(c, 140, 0), *stroke(quad((c-20, CAP-6), (190, 400), (22, 190)), lambda t, a, b: 36-14*t),
            *orbit(22, 190, 590, 190, 0, HR*1.8, floor=HR, p=12), serif(c, 90, CAP, False, 12)]
def d_five():
    y = CAP-10
    bowl_ = chain([((130, 380), (230, 430), (330, 420), (400, 380)), ((400, 380), (490, 336), (500, 246), (500, 200)),
                   ((500, 200), (500, 70), (410, -12), (270, -12)), ((270, -12), (170, -12), (100, 30), (62, 100))], 24)
    return [vstem(150, 380, CAP, TH+14), *orbit(150, y, 490, y, -10, 34, floor=10, p=9), *beak(480, y+6, y-100, dx=-6, w0=HR+8, w1=10),
            *stroke(bowl_, ramp(nibw(S-8, HR+2, 14, 1.1), 0, 0.12, 0.3, 1)), ball(58, 104, 33), serif(150, 80, CAP, False, 12)]
def d_six():
    pts = chain([((470, 600), (430, 680), (350, 712), (290, 712)), ((290, 712), (130, 712), (66, 540), (66, 330)), ((66, 330), (66, 90), (130, -12), (270, -12))], 26)
    low = ring(285, 235, 238, 252, S-4, HR+3, k=1.1)
    return [*stroke(pts, ramp(nibw(S+2, HR+2, 8, 1.1), 0.0, 0.15, 0.3, 1)), *low, ball(470, 598, 30)]
def d_nine(): 
    return xform(d_six(), lambda x, y: (540-x, CAP-y))
def d_seven():
    y = CAP-12
    return [*orbit(20, y, 540, y, -6, 38, floor=11, p=9), *beak(28, y+6, y-120, dx=4, w0=HR+10, w1=10),
            *stroke(cubic((560, y), (470, 520), (340, 220), (280, 0), 30), lambda t, a, b: 40+78*math.sin(t*math.pi/2)*(1-t*0.2)), serif(280, 86, 0), serif(350, 80, y, False, 8)]
def d_eight():
    top = ring(285, 540, 200, 172, S-14, HR+2, k=1.1); bot = ring(285, 190, 250, 202, S-4, HR+3, k=1.1)
    return top+bot
GLYPH_DIGITS = [("zero", "0", d_zero), ("one", "1", d_one), ("two", "2", d_two), ("three", "3", d_three), ("four", "4", d_four),
                ("five", "5", d_five), ("six", "6", d_six), ("seven", "7", d_seven), ("eight", "8", d_eight), ("nine", "9", d_nine)]

# ---------- punctuation / symbols ----------
def dot(cx=0, cy=0, r=96): return star(cx, cy, r, 1.2, 3.0)
def g_period(): return [star(122, 122, 122, 1.15, 2.5)]
def comma_shape(x, y):
    return [ball(x, y+6, 44), *stroke(quad((x+34, y-8), (x+40, y-80), (x-30, y-150)), lambda t, a, b: 54-46*t)]
def g_comma(): return comma_shape(70, 52)
def g_colon(): return [star(100, 100, 100, 1.15, 2.6), star(100, 400, 100, 1.15, 2.6)]
def g_semi(): return [star(100, 400, 100, 1.15, 2.6), *comma_shape(90, 52)]
def g_excl():
    return [*stroke([(110, CAP), (110, 190)], lambda t, a, b: 98-70*t**0.7), dot(110, 70, 92)]
def g_quest():
    pts = chain([((60, 560), (66, 676), (150, 712), (240, 712)), ((240, 712), (350, 712), (410, 650), (410, 570)), ((410, 570), (410, 470), (270, 420), (240, 300)), ((240, 300), (236, 270), (236, 250), (236, 230))], 22)
    return [*stroke(pts, ramp(nibw(S-14, HR+2, 12, 1.1), 0.78, 1.0, 0.5, 1.0, tail=True)), ball(58, 556, 34), dot(236, 80, 92)]
def g_apos(): return [*stroke([(60, CAP), (60, 470)], lambda t, a, b: 82-62*t)]
def g_quote(): return [*stroke([(60, CAP), (60, 470)], lambda t, a, b: 82-62*t), *stroke([(210, CAP), (210, 470)], lambda t, a, b: 82-62*t)]
def g_rsq(): return xform(comma_shape(60, 52), lambda x, y: (x, y+520))
def g_lsq(): return xform(g_rsq(), lambda x, y: (120-x, y))
def g_rdq(): return flat(g_rsq(), xform(g_rsq(), lambda x, y: (x+170, y)))
def g_ldq(): return flat(g_lsq(), xform(g_lsq(), lambda x, y: (x+170, y)))
def g_lparen(): return stroke(quad((250, 740), (-40, 260), (250, -170), 60), lambda t, a, b: 14+36*math.sin(t*math.pi))
def g_rparen(): return xform(g_lparen(), lambda x, y: (310-x, y))
def g_slash(): return [cw([(0, -80), (40, -80), (380, 780), (340, 780)]) ]
def g_bslash(): return xform(g_slash(), lambda x, y: (380-x, y))
def g_hyphen(): return orbit(0, 262, 280, 262, 8, 36, floor=12, p=6)
def g_endash(): return orbit(0, 262, 520, 262, 10, 34, floor=10, p=7)
def g_emdash(): return [*orbit(0, 262, 1000, 262, 10, 30, floor=8, p=8), star(500, 262, 92, 1.0, 3.0)]
def g_midot(): return [dot(70, 262, 70)]
def g_plus(): return [*orbit(0, 330, 460, 330, 0, 38, floor=12, p=7), *stroke([(230, 100), (230, 560)], lambda t, a, b: 12+60*math.sin(t*math.pi)**0.7)]
def g_star(): return [star(200, 560, 190, 1.0, 3.0)]
def g_hash():
    return [cw([(150, 0), (206, 0), (330, 600), (274, 600)]), cw([(344, 0), (400, 0), (524, 600), (468, 600)]),
            *orbit(60, 400, 600, 400, 0, 34, floor=14, p=9), *orbit(40, 190, 580, 190, 0, 34, floor=14, p=9)]
def g_pct():
    return [*ring(160, 540, 150, 160, 70, HR+2), *ring(560, 160, 150, 160, 70, HR+2), cw([(150, 0), (200, 0), (590, 700), (540, 700)])]
def g_amp():
    head = ring(240, 556, 150, 150, 84, HR, k=1.1)
    body = ring(240, 190, 236, 204, 104, HR+2, k=1.1)
    return head+body+[cw([(250, 360), (330, 360), (650, 0), (560, 0)]), serif(620, 100, 0), *stroke(quad((470, 300), (570, 330), (660, 400)), lambda t, a, b: 40-24*t), ball(660, 396, 28) ]
def g_at():
    out = arc(340, 280, 300, 320, 30, 400, 110)
    return [*stroke(out, ramp(nibw(70, 26, 12, 1.0), 0, 0.15, 0.4, 1)), *ring(330, 270, 104, 112, 46, 20, k=1.1), vstem(432, 200, 380, 38), *stroke(quad((432, 220), (460, 150), (580, 160)), lambda t, a, b: 30)]
def g_arrow():
    return [*orbit(0, 262, 720, 262, 14, 36, floor=14, p=7),
            *stroke(quad((590, 420), (640, 320), (760, 262)), lambda t, a, b: 14+34*math.sin(t*math.pi)**0.8),
            *stroke(quad((590, 104), (640, 204), (760, 262)), lambda t, a, b: 14+34*math.sin(t*math.pi)**0.8)]
def g_larrow(): return xform(g_arrow(), lambda x, y: (760-x, y))
def g_nearrow():
    return [*stroke(quad((40, 40), (260, 260), (620, 620)), lambda t, a, b: 14+40*math.sin(t*math.pi)**0.6),
            *orbit(280, 640, 640, 640, 0, 36, floor=14, p=7), *stroke([(640, 640), (640, 280)], lambda t, a, b: 14+36*math.sin(t*math.pi)**0.7)]
def g_sparkle(): return [star(300, 300, 290, 1.0, 3.2)]

def fix(fn, *a): return lambda: fn(*a)

LC = {"a": lc_a, "b": lambda: bd("b"), "c": lc_c, "d": lambda: bd("d"), "e": lc_e, "f": lc_f, "g": lc_g, "h": lc_h, "i": lc_i,
      "j": lc_j, "k": lc_k, "l": lc_l, "m": lc_m, "n": lc_n, "o": lc_o, "p": lambda: bd("p"), "q": lambda: bd("q"), "r": lc_r,
      "s": lc_s, "t": lc_t, "u": lc_u, "v": lc_v, "w": lc_w, "x": lc_x, "y": lc_y, "z": lc_z}
UC = {"A": A, "B": B, "C": Cc, "D": D, "E": E, "F": F, "G": G, "H": H, "I": I, "J": J, "K": K, "L": L, "M": M, "N": N, "O": O,
      "P": P, "Q": Q, "R": R, "S": S_, "T": T, "U": U, "V": V, "W": W_, "X": X, "Y": Y, "Z": Z}
SYM = [("period", ".", g_period), ("comma", ",", g_comma), ("colon", ":", g_colon), ("semicolon", ";", g_semi),
       ("exclam", "!", g_excl), ("question", "?", g_quest), ("quotesingle", "'", g_apos), ("quotedbl", '"', g_quote),
       ("quoteright", "’", g_rsq), ("quoteleft", "‘", g_lsq), ("quotedblright", "”", g_rdq), ("quotedblleft", "“", g_ldq),
       ("parenleft", "(", g_lparen), ("parenright", ")", g_rparen), ("slash", "/", g_slash), ("backslash", "\\", g_bslash),
       ("ampersand", "&", g_amp), ("at", "@", g_at), ("numbersign", "#", g_hash), ("asterisk", "*", g_star), ("plus", "+", g_plus),
       ("hyphen", "-", g_hyphen), ("endash", "–", g_endash), ("emdash", "—", g_emdash), ("percent", "%", g_pct),
       ("periodcentered", "·", g_midot), ("arrowright", "→", g_arrow), ("arrowleft", "←", g_larrow),
       ("arrowupright", "↗", g_nearrow), ("sparkle", "✦", g_sparkle)]
# side bearings (lsb, rsb); default by class, tuned by eye
SB = {"A": (6, 6), "V": (6, 6), "W": (6, 6), "X": (14, 14), "Y": (8, 8), "T": (22, 22), "F": (22, 44), "L": (22, 36), "E": (22, 38),
      "K": (22, 8), "Z": (30, 30), "O": (38, 38), "Q": (38, 38), "C": (40, 30), "G": (40, 30), "S": (34, 34), "J": (20, 26),
      "U": (28, 28), "B": (22, 28), "D": (22, 34), "P": (22, 30), "R": (22, 14), "M": (22, 22), "N": (24, 24), "H": (24, 24), "I": (30, 30)}
for k in "abdgpq": SB.setdefault(k, (30, 30))
SB.update({"a": (26, 30), "b": (30, 26), "c": (28, 20), "d": (26, 34), "e": (28, 22), "f": (0, 0), "g": (26, 30), "h": (30, 32), "i": (30, 30), "j": (4, 30),
           "k": (30, 6), "l": (30, 30), "m": (30, 32), "n": (30, 32), "o": (26, 26), "p": (30, 26), "q": (26, 34), "r": (30, 0), "s": (24, 24),
           "t": (4, 4), "u": (32, 30), "v": (6, 6), "w": (6, 6), "x": (8, 8), "y": (6, 6), "z": (20, 20)})
SBS = {"period": (50, 50), "comma": (40, 40), "colon": (50, 50), "semicolon": (50, 50), "exclam": (40, 40), "question": (40, 40),
       "quotesingle": (40, 40), "quotedbl": (40, 40), "quoteright": (30, 30), "quoteleft": (30, 30), "quotedblright": (30, 30),
       "quotedblleft": (30, 30), "parenleft": (40, 30), "parenright": (30, 40), "slash": (20, 20), "backslash": (20, 20),
       "emdash": (0, 0), "endash": (30, 30), "hyphen": (40, 40), "periodcentered": (50, 50)}
for n, _, _ in GLYPH_DIGITS: SBS[n] = (40, 40)
for n in ("ampersand", "at", "numbersign", "asterisk", "plus", "percent", "arrowright", "arrowleft", "arrowupright", "sparkle"): SBS[n] = (40, 40)

KERN = [("A","V",-80),("V","A",-80),("A","T",-80),("T","A",-80),("A","W",-60),("W","A",-60),("A","Y",-80),("Y","A",-80),
        ("L","T",-130),("L","V",-100),("L","W",-80),("L","Y",-110),("P","A",-80),("F","A",-70),("T","O",-34),("O","T",-20),
        ("T","a",-90),("T","e",-90),("T","o",-90),("T","r",-50),("T","u",-50),("T","y",-60),("T","comma",-80),("T","period",-80),
        ("V","a",-60),("V","e",-60),("V","o",-60),("Y","a",-70),("Y","e",-70),("Y","o",-70),("W","a",-40),("W","e",-40),("W","o",-40),
        ("F","a",-50),("F","e",-50),("F","o",-50),("P","comma",-100),("P","period",-100),("P","a",-20),("R","T",-24),("R","Y",-30),
        ("R","A",-40),("R","V",-30),("W","H",-0),("F","comma",-90),("F","period",-90),("V","O",-24),("O","V",-24),("O","A",-24),("A","O",-24),("O","Y",-24),("Y","O",-24),
        ("A","C",-20),("A","G",-20),("A","U",-10),("L","O",-30),("K","O",-40),("K","e",-20),("K","o",-20),("K","u",-20),
        ("r","comma",-70),("r","period",-70),("v","comma",-60),("v","period",-60),("w","comma",-40),("w","period",-40),("y","comma",-60),("y","period",-60),
        ("v","a",-20),("v","e",-20),("v","o",-20),("w","a",-10),("y","a",-20),("y","e",-20),("y","o",-20),
        ("f","f",-20),("r","a",-12),("r","o",-12),("r","e",-12),("o","v",-12),("o","y",-12),("o","w",-8),("e","v",-12),("e","y",-12),
        ("one","one",-40),("seven","comma",-90),("seven","period",-90),("quoteright","s",-30),("quotesingle","s",-30)]
NAMES = {**{c: c for c in UC}, **{c: c for c in LC}}

def simplify(p, tol=1.1):
    """Ramer-Douglas-Peucker on a closed polygon (rounded ints)."""
    def rdp(a, b, pts):
        (x0, y0), (x1, y1) = pts[a], pts[b]; dx, dy = x1-x0, y1-y0; d = math.hypot(dx, dy) or 1
        mi, md = -1, tol
        for i in range(a+1, b):
            e = abs((pts[i][0]-x0)*dy-(pts[i][1]-y0)*dx)/d
            if e > md: mi, md = i, e
        return rdp(a, mi, pts)[:-1]+rdp(mi, b, pts) if mi >= 0 else [pts[a], pts[b]]
    far = max(range(len(p)), key=lambda i: (p[i][0]-p[0][0])**2+(p[i][1]-p[0][1])**2)
    q = p[:far+1]; r = p[far:]+[p[0]]
    out = rdp(0, len(q)-1, q)[:-1]+rdp(0, len(r)-1, r)[:-1]
    return out if len(out) >= 3 else p

def build(out):
    glyphs, metrics = {}, {}; order = [".notdef", "space"]; cmap = {32: "space"}
    glyphs["space"] = TTGlyphPen(None).glyph(); metrics["space"] = (270, 0)
    items = [(c, ord(c), f, SB[c][0]+(10 if c.isupper() else 8), SB[c][1]+(10 if c.isupper() else 8)) for c, f in list(UC.items())+list(LC.items())] + \
            [(n, ord(c), f, *SBS[n]) for n, c, f in GLYPH_DIGITS] + [(n, ord(c), f, *SBS[n]) for n, c, f in SYM]
    items.sort(key=lambda t: t[1])
    for name, cp, fn, lsb, rsb in items:
        polys = flat(fn())
        xs = [x for p in polys for x, _ in p]; x0, x1 = min(xs), max(xs); dx = lsb-x0
        pen = TTGlyphPen(None)
        for p in polys:
            q = [(round(x+dx), round(y)) for x, y in p]
            q = [pt for i, pt in enumerate(q) if i == 0 or pt != q[i-1]]
            q = simplify(q)
            pen.moveTo(q[0]); [pen.lineTo(pt) for pt in q[1:]]; pen.closePath()
        glyphs[name] = pen.glyph(); metrics[name] = (round(x1-x0+lsb+rsb), lsb)
        cmap[cp] = name; order.append(name)
    pen = TTGlyphPen(None)
    for p in (rect(50, 0, 450, 700), ccw([(90, 40), (410, 40), (410, 660), (90, 660)])):
        pen.moveTo(p[0]); [pen.lineTo(q) for q in p[1:]]; pen.closePath()
    glyphs[".notdef"] = pen.glyph(); metrics[".notdef"] = (500, 50)
    fb = FontBuilder(1000, isTTF=True)
    fb.font.recalcTimestamp = False
    fb.setupGlyphOrder(order); fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs); fb.setupHorizontalMetrics(metrics)
    fb.updateHead(created=3_700_000_000, modified=3_700_000_000)
    fb.setupHorizontalHeader(ascent=820, descent=-260)
    fb.setupNameTable({"familyName": "Orrery", "styleName": "Regular"})
    fb.setupOS2(sTypoAscender=820, sTypoDescender=-260, usWinAscent=900, usWinDescent=300,
                sCapHeight=CAP, sxHeight=XH, achVendID="ORRY", usWeightClass=600)
    fb.setupPost()
    have = set(order)
    fea = "languagesystem DFLT dflt;\nlanguagesystem latn dflt;\nfeature kern {\n" + \
          "".join(f"  pos {a} {b} {v};\n" for a, b, v in KERN if a in have and b in have) + "} kern;\n"
    fb.addOpenTypeFeatures(fea)
    fb.font.flavor = "woff2"; fb.save(out)
    print(out, os.path.getsize(out), "bytes,", len(order), "glyphs")

if __name__ == "__main__":
    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    build(sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, "public/fonts/Orrery.woff2"))
