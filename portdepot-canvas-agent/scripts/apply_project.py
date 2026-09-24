#!/usr/bin/env python3
"""Validate or apply a declarative Port Depot canvas project spec."""

import argparse
import copy
import json
import mimetypes
import math
import os
import numbers
import shutil
import sys
import urllib.parse
import urllib.request


def abort(message):
    raise ValueError(message)


def request_json(base, method, path, payload=None):
    data = None if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        base.rstrip("/") + path,
        data=data,
        method=method,
        headers={"Content-Type": "application/json", "User-Agent": "PortDepot-Canvas-Agent/1.0"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def load_spec(path):
    with open(path, "r", encoding="utf-8") as source:
        spec = json.load(source)
    if spec.get("format") != "portdepot-agent-project" or int(spec.get("version") or 0) != 1:
        abort("unsupported project spec format/version")
    project_name = str((spec.get("project") or {}).get("name") or "").strip()
    if not project_name:
        abort("project.name is required")
    return spec


def validate_spec(spec):
    canvases = spec.get("canvases") or []
    if not canvases:
        abort("at least one canvas is required")
    keys = []
    canvas_by_key = {}
    for canvas in canvases:
        key = str(canvas.get("key") or "").strip()
        if not key or key in canvas_by_key:
            abort(f"canvas key is missing or duplicated: {key!r}")
        parent = canvas.get("parent")
        if parent is not None and parent not in canvas_by_key:
            abort(f"canvas {key}: parent must exist earlier in the spec: {parent!r}")
        if not str(canvas.get("title") or "").strip():
            abort(f"canvas {key}: title is required")
        keys.append(key)
        canvas_by_key[key] = canvas

    asset_by_key = {}
    for asset in spec.get("assets") or []:
        key = str(asset.get("key") or "").strip()
        if not key or key in asset_by_key:
            abort(f"asset key is missing or duplicated: {key!r}")
        if asset.get("canvas") not in canvas_by_key:
            abort(f"asset {key}: unknown canvas {asset.get('canvas')!r}")
        filename = os.path.basename(str(asset.get("filename") or "").strip())
        if not filename or filename != str(asset.get("filename") or ""):
            abort(f"asset {key}: filename must be a safe basename")
        if bool(asset.get("source_url")) == bool(asset.get("source_path")):
            abort(f"asset {key}: provide exactly one of source_url or source_path")
        if asset.get("source_url"):
            scheme = urllib.parse.urlparse(str(asset["source_url"])).scheme.lower()
            if scheme not in ("http", "https"):
                abort(f"asset {key}: source_url must use http or https")
        if asset.get("source_path"):
            source = os.path.abspath(os.path.expanduser(str(asset["source_path"])))
            if not os.path.isfile(source):
                abort(f"asset {key}: missing local asset: {source}")
        asset_by_key[key] = asset

    for canvas in canvases:
        key = canvas["key"]
        nodes = canvas.get("nodes") or []
        node_ids = []
        for node in nodes:
            node_id = str(node.get("id") or "").strip()
            if not node_id or node_id in node_ids:
                abort(f"canvas {key}: node id is missing or duplicated: {node_id!r}")
            if not str(node.get("type") or "").strip():
                abort(f"canvas {key}, node {node_id}: type is required")
            for field in ("x", "y", "w", "h"):
                value = node.get(field)
                if not isinstance(value, numbers.Real) or isinstance(value, bool) or not math.isfinite(value):
                    abort(f"canvas {key}, node {node_id}: {field} must be a finite number")
            if node["w"] <= 0 or node["h"] <= 0:
                abort(f"canvas {key}, node {node_id}: width and height must be positive")
            node_ids.append(node_id)
            if node.get("type") == "folder":
                child_key = node.get("canvasKey")
                if child_key not in canvas_by_key:
                    abort(f"canvas {key}, node {node_id}: unknown canvasKey")
                if canvas_by_key[child_key].get("parent") != key:
                    abort(f"canvas {key}, node {node_id}: folder target must be its direct child")
            if node.get("assetKey"):
                asset_key = node["assetKey"]
                if asset_key not in asset_by_key:
                    abort(f"canvas {key}, node {node_id}: unknown assetKey")
                if asset_by_key[asset_key].get("canvas") != key:
                    abort(f"canvas {key}, node {node_id}: asset must belong to the same canvas")
        node_id_set = set(node_ids)
        for node in nodes:
            if node.get("type") == "group":
                missing = [item for item in node.get("items") or [] if item not in node_id_set]
                if missing:
                    abort(f"canvas {key}, group {node['id']}: missing members {missing}")
        connection_ids = set()
        for connection in canvas.get("connections") or []:
            connection_id = str(connection.get("id") or "").strip()
            if not connection_id or connection_id in connection_ids:
                abort(f"canvas {key}: connection id is missing or duplicated: {connection_id!r}")
            connection_ids.add(connection_id)
            if connection.get("from") not in node_id_set or connection.get("to") not in node_id_set:
                abort(f"canvas {key}, connection {connection_id}: endpoint is missing")
    return canvas_by_key, asset_by_key


def ensure_project(base, name):
    projects = request_json(base, "GET", "/api/projects").get("projects", [])
    match = next((project for project in projects if project.get("name") == name), None)
    if match:
        return match
    return request_json(base, "POST", "/api/projects", {"name": name})["project"]


def ensure_canvas(base, records, project_id, canvas_spec, resolved):
    parent_key = canvas_spec.get("parent")
    parent_id = resolved[parent_key]["id"] if parent_key else None
    title = str(canvas_spec["title"])
    match = next((item for item in records if item.get("project") == project_id and item.get("title") == title and item.get("parent_id") == parent_id), None)
    if match:
        return request_json(base, "GET", f"/api/canvases/{match['id']}")["canvas"]
    payload = {
        "title": title,
        "icon": canvas_spec.get("icon") or "layers",
        "kind": "classic",
        "project": project_id,
        "parent_id": parent_id,
        "board_x": canvas_spec.get("board_x"),
        "board_y": canvas_spec.get("board_y"),
    }
    created = request_json(base, "POST", "/api/canvases", payload)["canvas"]
    records.append(created)
    return created


def materialize_asset(asset, canvas, asset_root):
    destination = os.path.join(asset_root, canvas["dir"], asset["filename"])
    os.makedirs(os.path.dirname(destination), exist_ok=True)
    if asset.get("source_path"):
        source = os.path.abspath(os.path.expanduser(asset["source_path"]))
        if not os.path.isfile(source):
            abort(f"missing local asset: {source}")
        if os.path.abspath(destination) != source:
            shutil.copy2(source, destination)
    elif not (os.path.isfile(destination) and os.path.getsize(destination) > 0):
        request = urllib.request.Request(asset["source_url"], headers={"User-Agent": "Mozilla/5.0 PortDepot-Canvas-Agent/1.0"})
        with urllib.request.urlopen(request, timeout=60) as response, open(destination, "wb") as output:
            shutil.copyfileobj(response, output)
    relative = "/".join([canvas["dir"].strip("/"), asset["filename"]])
    mime = mimetypes.guess_type(asset["filename"])[0] or "application/octet-stream"
    kind = "image" if mime.startswith("image/") else "video" if mime.startswith("video/") else "audio" if mime.startswith("audio/") else "text" if mime.startswith("text/") else "other"
    return {
        "url": "/assets/library/" + urllib.parse.quote(relative, safe="/"),
        "name": asset["filename"],
        "mime": mime,
        "kind": kind,
        "format": os.path.splitext(asset["filename"])[1].lstrip(".").upper() or "FILE",
    }


def resolved_nodes(canvas_spec, resolved_canvases, materialized_assets, spec_by_key):
    output = copy.deepcopy(canvas_spec.get("nodes") or [])
    for node in output:
        canvas_key = node.pop("canvasKey", None)
        if canvas_key:
            child = resolved_canvases[canvas_key]
            node["canvasId"] = child["id"]
            node["path"] = f"assets/library/{child['dir']}"
            node.setdefault("title", child["title"])
            node["childCount"] = len(spec_by_key[canvas_key].get("nodes") or [])
        asset_key = node.pop("assetKey", None)
        if asset_key:
            details = materialized_assets[asset_key]
            for field, value in details.items():
                node.setdefault(field, value)
    return output


def apply_canvas(base, current, canvas_spec, nodes):
    payload = {
        "title": canvas_spec["title"],
        "icon": canvas_spec.get("icon") or current.get("icon") or "layers",
        "nodes": nodes,
        "connections": copy.deepcopy(canvas_spec.get("connections") or []),
        "viewport": canvas_spec.get("viewport") or current.get("viewport") or {"x": 0, "y": 0, "scale": 1},
        "logs": current.get("logs") or [],
        "settings": copy.deepcopy(canvas_spec.get("settings") or {}),
        "client_id": "portdepot-canvas-agent",
        "base_updated_at": int(current.get("updated_at") or 0),
        "deleted_node_ids": current.get("deleted_node_ids") or [],
    }
    return request_json(base, "PUT", f"/api/canvases/{current['id']}", payload)["canvas"]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("spec")
    parser.add_argument("--apply", action="store_true", help="write the validated spec to Port Depot")
    parser.add_argument("--base", default="http://127.0.0.1:8765")
    parser.add_argument(
        "--asset-root",
        default=os.environ.get("PORT_DEPOT_ASSET_ROOT", ""),
        help="Port Depot's writable storage/library directory; required when applying assets",
    )
    args = parser.parse_args()

    spec = load_spec(args.spec)
    spec_by_key, asset_by_key = validate_spec(spec)
    plan = {
        "ok": True,
        "mode": "apply" if args.apply else "validate-only",
        "project": spec["project"]["name"],
        "canvas_count": len(spec_by_key),
        "node_count": sum(len(canvas.get("nodes") or []) for canvas in spec_by_key.values()),
        "connection_count": sum(len(canvas.get("connections") or []) for canvas in spec_by_key.values()),
        "asset_count": len(asset_by_key),
    }
    if not args.apply:
        print(json.dumps(plan, ensure_ascii=False, indent=2))
        return

    if asset_by_key:
        if not args.asset_root:
            abort("--asset-root (or PORT_DEPOT_ASSET_ROOT) is required when applying assets")
        args.asset_root = os.path.abspath(os.path.expanduser(args.asset_root))
        if not os.path.isdir(args.asset_root):
            abort(f"asset root is not an existing directory: {args.asset_root}")
        if not os.access(args.asset_root, os.W_OK | os.X_OK):
            abort(f"asset root is not writable: {args.asset_root}")

    project = ensure_project(args.base, spec["project"]["name"])
    records = request_json(args.base, "GET", "/api/canvases").get("canvases", [])
    resolved = {}
    for canvas_spec in spec["canvases"]:
        resolved[canvas_spec["key"]] = ensure_canvas(args.base, records, project["id"], canvas_spec, resolved)

    materialized = {}
    for key, asset in asset_by_key.items():
        materialized[key] = materialize_asset(asset, resolved[asset["canvas"]], args.asset_root)

    for canvas_spec in spec["canvases"]:
        key = canvas_spec["key"]
        nodes = resolved_nodes(canvas_spec, resolved, materialized, spec_by_key)
        resolved[key] = apply_canvas(args.base, resolved[key], canvas_spec, nodes)

    root_keys = [key for key, canvas in spec_by_key.items() if canvas.get("parent") is None]
    plan.update({
        "project_id": project["id"],
        "root_canvas_ids": {key: resolved[key]["id"] for key in root_keys},
        "canvas_ids": {key: canvas["id"] for key, canvas in resolved.items()},
    })
    print(json.dumps(plan, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Port Depot canvas project failed: {error}", file=sys.stderr)
        raise SystemExit(1)
