#!/usr/bin/env python3
"""Conservative collision and centerline check for a Port Depot project spec."""
import argparse
import json
from pathlib import Path


def box(n):
    return (float(n['x']), float(n['y']), float(n['x']) + float(n['w']), float(n['y']) + float(n['h']))


def area_overlap(a, b):
    return max(0, min(a[2], b[2]) - max(a[0], b[0])) * max(0, min(a[3], b[3]) - max(a[1], b[1]))


def center(n):
    x1, y1, x2, y2 = box(n)
    return ((x1 + x2) / 2, (y1 + y2) / 2)


def cross(a, b, c):
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])


def segments_cross(a, b, c, d):
    return cross(a, b, c) * cross(a, b, d) < 0 and cross(c, d, a) * cross(c, d, b) < 0


def segment_hits_box(a, b, rect):
    x1, y1, x2, y2 = rect
    if x1 <= a[0] <= x2 and y1 <= a[1] <= y2: return True
    if x1 <= b[0] <= x2 and y1 <= b[1] <= y2: return True
    return any(segments_cross(a, b, p, q) for p, q in [
        ((x1,y1),(x2,y1)), ((x2,y1),(x2,y2)),
        ((x2,y2),(x1,y2)), ((x1,y2),(x1,y1))])


def check(spec):
    problems=[]
    for canvas in spec['canvases']:
        key=canvas['key']
        nodes=[n for n in canvas['nodes'] if n['type']!='group']
        by_id={n['id']:n for n in nodes}
        for i,a in enumerate(nodes):
            for b in nodes[i+1:]:
                if area_overlap(box(a),box(b))>24:
                    problems.append(f'{key}: overlap {a["id"]} / {b["id"]}')
        lines=[]
        for edge in canvas.get('connections',[]):
            if edge['from'] not in by_id or edge['to'] not in by_id: continue
            a,b=by_id[edge['from']],by_id[edge['to']]
            lines.append((edge,center(a),center(b)))
            for n in nodes:
                if n['id'] in (a['id'],b['id']): continue
                if segment_hits_box(center(a),center(b),box(n)):
                    problems.append(f'{key}: {edge["id"]} crosses node {n["id"]}')
        for i,(e1,a,b) in enumerate(lines):
            for e2,c,d in lines[i+1:]:
                if {e1['from'],e1['to']} & {e2['from'],e2['to']}: continue
                if segments_cross(a,b,c,d):
                    problems.append(f'{key}: edges {e1["id"]} / {e2["id"]} cross')
    return problems


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('spec',type=Path)
    args=parser.parse_args()
    problems=check(json.loads(args.spec.read_text()))
    for problem in problems: print(problem)
    print(f'{len(problems)} potential layout conflicts')
    raise SystemExit(bool(problems))
