#!/usr/bin/env python3
"""Audit a Port Depot project spec for deterministic aesthetic and teaching checks."""

import argparse
import json
import math
import sys


def load(path):
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def node_bounds(node):
    return (
        float(node.get("x", 0)),
        float(node.get("y", 0)),
        float(node.get("x", 0)) + float(node.get("w", 0)),
        float(node.get("y", 0)) + float(node.get("h", 0)),
    )


def inside(inner, outer, padding=0):
    return (
        inner[0] >= outer[0] + padding
        and inner[1] >= outer[1] + padding
        and inner[2] <= outer[2] - padding
        and inner[3] <= outer[3] - padding
    )


def estimated_line_width(text, font_size):
    width = 0.0
    for char in text:
        if char.isspace():
            width += font_size * 0.34
        elif ord(char) > 127:
            width += font_size
        else:
            width += font_size * 0.58
    return width


def audit(spec):
    errors = []
    warnings = []
    dimensions = {
        "hierarchy": 20,
        "spacing_alignment": 20,
        "density": 15,
        "color_contrast": 15,
        "semantic_clarity": 15,
        "interaction_verification": 15,
    }
    canvases = spec.get("canvases") or []
    by_key = {canvas.get("key"): canvas for canvas in canvases}
    roots = [canvas for canvas in canvases if canvas.get("parent") is None]
    if len(roots) != 1:
        errors.append(f"expected one root canvas, found {len(roots)}")
        dimensions["hierarchy"] -= 8

    all_asset_keys = {asset.get("key") for asset in spec.get("assets") or []}
    used_asset_keys = set()
    demonstrated_types = set()

    for canvas in canvases:
        key = canvas.get("key", "?")
        nodes = canvas.get("nodes") or []
        ids = {node.get("id") for node in nodes}
        groups = [node for node in nodes if node.get("type") == "group"]
        text_nodes = [node for node in nodes if node.get("type") == "text"]
        file_nodes = [node for node in nodes if node.get("type") == "file"]
        folder_nodes = [node for node in nodes if node.get("type") == "folder"]
        demonstrated_types.update(node.get("type") for node in nodes)

        title_nodes = [node for node in text_nodes if float((node.get("style") or {}).get("fontSize", 0)) >= 30]
        if len(title_nodes) != 1:
            warnings.append(f"{key}: expected one 30px+ canvas title, found {len(title_nodes)}")
            dimensions["hierarchy"] -= 1

        if len(nodes) > 18:
            warnings.append(f"{key}: {len(nodes)} nodes may be dense; inspect at the saved viewport")
            dimensions["density"] -= 1

        palette = {
            (node.get("style") or {}).get("color")
            for node in text_nodes
            if (node.get("style") or {}).get("color")
        } | {node.get("color") for node in groups if node.get("color")}
        if len(palette) > 7:
            warnings.append(f"{key}: palette uses {len(palette)} colors; target seven or fewer")
            dimensions["color_contrast"] -= 1

        for node in text_nodes:
            style = node.get("style") or {}
            size = float(style.get("fontSize", 0))
            if size and size < 11:
                errors.append(f"{key}/{node.get('id')}: text is below 11px")
                dimensions["color_contrast"] -= 2
            if 14 <= size <= 20 and float(node.get("w", 0)) < 300:
                warnings.append(f"{key}/{node.get('id')}: body text width is under 300px")
                dimensions["spacing_alignment"] -= 0.25
            if size:
                node_width = max(1.0, float(node.get("w", 0)))
                effective_width = min(node_width, float(style.get("maxWidth") or 520))
                source_lines = str(node.get("text") or "").splitlines() or [""]
                visual_lines = sum(max(1, math.ceil(estimated_line_width(line, size) / effective_width)) for line in source_lines)
                required_height = visual_lines * size * 1.45
                if size >= 30 and len(source_lines) == 1 and visual_lines > 1:
                    errors.append(f"{key}/{node.get('id')}: canvas title wraps under effective maxWidth {effective_width:g}px")
                    dimensions["hierarchy"] -= 3
                if required_height > float(node.get("h", 0)) + 4:
                    errors.append(f"{key}/{node.get('id')}: estimated text height {math.ceil(required_height)}px exceeds node height {node.get('h')}px")
                    dimensions["spacing_alignment"] -= 2

        for group in groups:
            if not group.get("locked") or int(group.get("z", 0)) != 0:
                errors.append(f"{key}/{group.get('id')}: groups must be locked at z=0")
                dimensions["spacing_alignment"] -= 2
            outer = node_bounds(group)
            for member_id in group.get("items") or []:
                member = next((node for node in nodes if node.get("id") == member_id), None)
                if member and not inside(node_bounds(member), outer, 24):
                    errors.append(f"{key}/{group.get('id')}: member {member_id} lacks 24px inner padding")
                    dimensions["spacing_alignment"] -= 1

        for node in folder_nodes:
            child_key = node.get("canvasKey")
            if child_key not in by_key:
                errors.append(f"{key}/{node.get('id')}: folder has no real target canvas")
                dimensions["semantic_clarity"] -= 3

        for node in file_nodes:
            asset_key = node.get("assetKey")
            if asset_key:
                used_asset_keys.add(asset_key)
            annotation = node.get("annotation") or {}
            if len(str(annotation.get("text") or "").strip()) < 18:
                warnings.append(f"{key}/{node.get('id')}: file annotation should explain use and source")
                dimensions["semantic_clarity"] -= 0.5

        for connection in canvas.get("connections") or []:
            if connection.get("from") not in ids or connection.get("to") not in ids:
                errors.append(f"{key}/{connection.get('id')}: missing endpoint")
                dimensions["semantic_clarity"] -= 3
            if len(str(connection.get("labelText") or "").strip()) < 2:
                warnings.append(f"{key}/{connection.get('id')}: connection lacks a semantic label")
                dimensions["semantic_clarity"] -= 0.5

        primary = [node for node in nodes if node.get("type") != "group"]
        if primary:
            bounds = [node_bounds(node) for node in primary]
            width = max(item[2] for item in bounds) - min(item[0] for item in bounds)
            height = max(item[3] for item in bounds) - min(item[1] for item in bounds)
            scale = float((canvas.get("viewport") or {}).get("scale", 1))
            if width * scale > 1280 * 0.94 or height * scale > 720 * 0.90:
                warnings.append(f"{key}: saved view may clip primary content at 1280x720 ({math.ceil(width*scale)}x{math.ceil(height*scale)}px)")
                dimensions["density"] -= 1

    if all_asset_keys - used_asset_keys:
        warnings.append(f"unused assets: {sorted(all_asset_keys - used_asset_keys)}")
        dimensions["interaction_verification"] -= 1

    expected = {"text", "file", "folder", "group"}
    missing = expected - demonstrated_types
    if missing:
        warnings.append(f"project does not demonstrate node types: {sorted(missing)}")
        dimensions["interaction_verification"] -= 2 * len(missing)

    for name in list(dimensions):
        dimensions[name] = max(0, round(dimensions[name], 2))
    score = round(sum(dimensions.values()), 2)
    return {"score": score, "dimensions": dimensions, "errors": errors, "warnings": warnings}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("spec")
    parser.add_argument("--strict", action="store_true")
    args = parser.parse_args()
    result = audit(load(args.spec))
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if result["errors"] or (args.strict and result["score"] < 85):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
