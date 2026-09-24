# Declarative Project Spec

The project spec is the Agent-authored source used by `scripts/apply_project.py`.

## Top-Level Shape

```json
{
  "format": "portdepot-agent-project",
  "version": 1,
  "project": {"name": "Demo project"},
  "assets": [],
  "canvases": []
}
```

## Canvas Entries

Each canvas requires a unique `key`, a `title`, and `nodes`. `parent` is another canvas key or `null`. Parents must appear before children.

```json
{
  "key": "root",
  "title": "00 Overview",
  "icon": "sparkles",
  "parent": null,
  "board_x": 0,
  "board_y": 0,
  "nodes": [],
  "connections": [],
  "settings": {"demo": true}
}
```

Use one root unless the user explicitly wants several independent root canvases.

## Assets

An online asset:

```json
{
  "key": "hero-art",
  "canvas": "characters",
  "filename": "hero-reference.jpg",
  "source_url": "https://example.com/hero.jpg",
  "source_page": "https://example.com/hero"
}
```

A local asset may use `source_path` instead of `source_url`. `canvas` determines the directory that owns the local copy. File nodes reference the asset with `assetKey`.

Keep filenames unique within each canvas. Record `source_page` or an equivalent attribution in node annotations or a source document; the script does not invent licensing claims.

The `canvas` named by an asset must match the canvas of every file node that references it. A folder node must target a direct child canvas. These constraints keep exported project folders and child navigation coherent.

## Update Behavior

The apply script matches projects by name and canvases by title plus resolved parent. Re-running the same spec updates those canvases instead of creating duplicates.

The spec is authoritative for `nodes`, `connections`, and `settings` of matched canvases. Use a new project name when experimentation must not replace a previous demo.

## Layout Guidance

Use [aesthetic-standard.md](aesthetic-standard.md) for the full quantitative system. At minimum:

- start important content at approximately `(80, 80)`;
- keep headings above groups and media;
- use 96–160 px gaps between major clusters and 40–64 px between siblings;
- give body text at least 320 px width to avoid accidental wrapping;
- keep at least 32 px padding between group bounds and every member;
- use a consistent horizontal or vertical flow for connected sequences;
- save a viewport that shows the full primary route with breathing room.

## Validation Errors

Fix rather than bypass errors for:

- duplicate canvas keys;
- missing parents or forward parent references;
- duplicate/missing node IDs;
- missing connection endpoints;
- missing group members;
- unknown folder `canvasKey` or file `assetKey`;
- unsafe asset filenames;
- failed local/remote asset retrieval.
- absent or non-writable asset-root paths during an asset-bearing apply.
