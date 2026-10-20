"""Rebuild the building list (`b`) of sf-osm.json from a full OSM building dump. Roads (`r`) and coast (`c`) are kept as they are.

  1. Dump every building in the city box (≈150 MB):
       curl -A junos -s https://overpass-api.de/api/interpreter \
         --data-urlencode 'data=[out:json][timeout:300];way["building"](37.700,-122.525,37.845,-122.300);out geom tags;' > /tmp/blds.json
  2. python3 build-sf-osm.py /tmp/blds.json [R=4000]

Keeps: every tower ≥ 50 m, every building on the ISLANDS (keep in sync with city-config.js), and a sample of the rest:
per 200 m cell, f = min(4, sqrt(n)/2.2) / (1 + (d/R)²) buildings, d = distance from downtown, randomly rounded.
Outlines are simplified (RDP, 1.2 m); footprints < 60 m² are dropped; untagged heights become 8–14 m.
"""
import json, math, random, collections, gzip, sys, os
random.seed(7)
SRC, R = sys.argv[1], float(sys.argv[2]) if len(sys.argv) > 2 else 4000
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sf-osm.json')
LAT0, LON0 = 37.7725, -122.4175; KX = 111320 * math.cos(math.radians(LAT0)); KZ = 110540     # same projection as city-geo.js
xz = lambda la, lo: ((lo - LON0) * KX, -(la - LAT0) * KZ)
ISLANDS = [(37.8240, 37.8295, -122.4265, -122.4195), (37.8050, 37.8330, -122.3800, -122.3580)]   # Alcatraz; Treasure + Yerba Buena
CELL, DOWNTOWN = 200, xz(37.7880, -122.4020)

def num(v):
    try: return float(str(v).split()[0].replace('m', ''))
    except (ValueError, IndexError): return None

def rdp(p, eps):
    if len(p) < 4: return p
    a, b = p[0], p[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; n = math.hypot(dx, dy)
    d = [abs(dy * (q[0] - a[0]) - dx * (q[1] - a[1])) / n if n > 1e-6 else math.hypot(q[0] - a[0], q[1] - a[1]) for q in p[1:-1]]
    i = max(range(len(d)), key=d.__getitem__)
    if d[i] <= eps: return [a, b]
    return rdp(p[:i + 2], eps)[:-1] + rdp(p[i + 1:], eps)

blds = []
for e in json.load(open(SRC))['elements']:
    g, t = e.get('geometry'), e.get('tags', {})
    if not g or len(g) < 4: continue
    pts = [xz(q['lat'], q['lon']) for q in g]
    area = abs(sum(pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1] for i in range(len(pts) - 1))) / 2
    if area < 60: continue
    lat, lon = sum(q['lat'] for q in g) / len(g), sum(q['lon'] for q in g) / len(g)
    blds.append(dict(pts=pts, A=area, h=num(t.get('height')) or (num(t.get('building:levels')) or 0) * 3.4 or None,
                     c=xz(lat, lon), island=any(S < lat < N and W < lon < E for S, N, W, E in ISLANDS)))

keep, cells = [], collections.defaultdict(list)
for b in blds:
    if (b['h'] or 0) >= 50 or b['island']: keep.append(b)
    else: cells[(int(b['c'][0] // CELL), int(b['c'][1] // CELL))].append(b)
always = len(keep)
for cl in cells.values():
    d = math.hypot(cl[0]['c'][0] - DOWNTOWN[0], cl[0]['c'][1] - DOWNTOWN[1])
    f = min(4, math.sqrt(len(cl)) / 2.2) / (1 + (d / R) ** 2)    # denser cells get a few more (sub-linear), fading with distance from downtown
    k = int(f) + (random.random() < f - int(f))                  # random rounding: the fade has no visible rings
    cl.sort(key=lambda b: -(b['h'] or 10) * math.sqrt(b['A']) * random.uniform(.6, 1.4)); keep += cl[:k]

out = []
for b in keep:
    p = rdp(b['pts'], 1.2)
    if len(p) < 4: p = b['pts']
    out.append([round(b['h'] or 8 + random.random() * 6)] + [round(v) for q in p for v in q])
snap = json.load(open(OUT)); snap['b'] = out
s = json.dumps(snap, separators=(',', ':')); open(OUT, 'w').write(s)
print(f'{len(blds)} candidates → {len(out)} kept ({always} towers/island) · {len(s)/1e6:.2f} MB, {len(gzip.compress(s.encode()))/1e6:.2f} MB gz')
