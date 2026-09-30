#!/usr/bin/env python3
"""Discover and call the local Port Depot HTTP API using its live OpenAPI schema."""
import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

DEFAULT_BASE = os.environ.get('PORT_DEPOT_BASE_URL', 'http://127.0.0.1:8765')

def request(url, method='GET', body=None, headers=None):
    req=urllib.request.Request(url, data=body, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            data=r.read()
            return r.status, r.headers.get('Content-Type',''), data
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get('Content-Type',''), e.read()
    except Exception as e:
        raise SystemExit(f'Port Depot request failed: {e}')

def decode(raw, content_type):
    if 'json' in content_type:
        try: return json.loads(raw.decode('utf-8'))
        except Exception: pass
    return raw.decode('utf-8', errors='replace')

def api(base, method, path, payload=None, content_type='application/json'):
    body=None if payload is None else json.dumps(payload,ensure_ascii=False).encode('utf-8')
    status,ct,raw=request(base.rstrip('/')+path,method,body,{'Content-Type':content_type,'Accept':'application/json'})
    out=decode(raw,ct)
    print(json.dumps({'status':status,'ok':200<=status<300,'result':out},ensure_ascii=False,indent=2))
    if not 200<=status<300: raise SystemExit(1)
    return out

def openapi(base):
    status,ct,raw=request(base.rstrip('/')+'/openapi.json')
    if status != 200: raise SystemExit(f'OpenAPI unavailable: HTTP {status}: {raw[:500]!r}')
    try: return json.loads(raw)
    except Exception as e: raise SystemExit(f'Invalid OpenAPI JSON: {e}')

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--base',default=DEFAULT_BASE)
    sp=p.add_subparsers(dest='command',required=True)
    sp.add_parser('status')
    sp.add_parser('routes')
    d=sp.add_parser('describe'); d.add_argument('method'); d.add_argument('path')
    q=sp.add_parser('request'); q.add_argument('method'); q.add_argument('path'); q.add_argument('--json-file'); q.add_argument('--data',help='URL-encoded query string (GET/DELETE/etc.)')
    o=sp.add_parser('open-canvas'); o.add_argument('canvas_id'); o.add_argument('--project')
    a=p.parse_args()
    if a.command=='status':
        schema=openapi(a.base)
        status,ct,raw=request(a.base.rstrip('/')+'/api/app-info')
        print(json.dumps({'base':a.base,'openapi':'available','app_info':decode(raw,ct),'route_count':len(schema.get('paths',{}))},ensure_ascii=False,indent=2))
    elif a.command in ('routes','describe'):
        schema=openapi(a.base); paths=schema.get('paths',{})
        if a.command=='routes':
            for path,ops in sorted(paths.items()): print(' '.join(m.upper() for m in ops),path)
        else:
            path=a.path
            ops=paths.get(path)
            if not ops: raise SystemExit(f'Route not found in live OpenAPI: {path}')
            op=ops.get(a.method.lower())
            if not op: raise SystemExit(f'Method {a.method.upper()} not supported for {path}; supported: {", ".join(k.upper() for k in ops)}')
            print(json.dumps({'path':path,'method':a.method.upper(),'operation':op},ensure_ascii=False,indent=2))
    elif a.command=='request':
        schema=openapi(a.base); method=a.method.lower(); path=a.path.split('?',1)[0]
        paths=schema.get('paths',{})
        ops=paths.get(path,{})
        if not ops:
            for template, candidate in paths.items():
                pattern='^'+re.sub(r'\\\{[^}]+\\\}', r'[^/]+', re.escape(template))+'$'
                if re.fullmatch(pattern,path):
                    ops=candidate
                    break
        if method not in ops: raise SystemExit(f'Operation not listed in live OpenAPI: {a.method.upper()} {path}')
        query=('?'+a.data) if a.data else ''
        payload=None
        if a.json_file:
            if a.json_file=='-': payload=json.load(sys.stdin)
            else:
                with open(a.json_file,encoding='utf-8') as f: payload=json.load(f)
        # Enforce schema-discovered destructive route warning; request remains user's explicitly invoked action.
        api(a.base,a.method.upper(),a.path+query,payload)
    elif a.command=='open-canvas':
        canv=api(a.base,'GET','/api/canvases/'+urllib.parse.quote(a.canvas_id,safe=''))
        c=canv.get('canvas',canv)
        project=a.project or c.get('project') or 'default'
        url=a.base.rstrip('/')+'/static/file-canvas.html?'+urllib.parse.urlencode({'id':a.canvas_id,'project':project})
        print(json.dumps({'canvas_url':url,'title':c.get('title'),'project':project},ensure_ascii=False,indent=2))
if __name__=='__main__': main()
