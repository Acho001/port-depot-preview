# Port Depot Canvas JSON

Use this reference when composing nodes or editing exported canvas JSON.

## Canvas Object

Important fields:

```json
{
  "id": "stable-canvas-id",
  "title": "Canvas title",
  "icon": "layers",
  "project": "project-id",
  "parent_id": null,
  "dir": "Project/Canvas",
  "nodes": [],
  "connections": [],
  "viewport": {"x": 0, "y": 0, "scale": 1},
  "settings": {}
}
```

The backend owns `id`, `project`, `parent_id`, `dir`, creation timestamps, and update timestamps. When using the live API, create canvases first and update their content second.

## Text Node

```json
{
  "id": "brief-title",
  "type": "text",
  "x": 80,
  "y": 100,
  "w": 520,
  "h": 90,
  "text": "Title\nSupporting line",
  "html": "Title<br>Supporting line",
  "style": {
    "fontSize": 28,
    "color": "#17243b",
    "fontFamily": "PingFang SC, sans-serif",
    "bold": true,
    "italic": false,
    "align": "left"
  }
}
```

Keep `text` and `html` semantically aligned. Escape untrusted HTML.

## File Node

```json
{
  "id": "character-reference",
  "type": "file",
  "x": 80,
  "y": 260,
  "w": 320,
  "h": 220,
  "assetKey": "character-art",
  "name": "character-reference.jpg",
  "kind": "image",
  "mime": "image/jpeg",
  "format": "JPG",
  "annotation": {
    "title": "Shape language",
    "text": "What to study and why. Source: https://example.com/original"
  }
}
```

In a project spec, `assetKey` is resolved to a local `/assets/library/...` URL. In persisted canvas JSON the final node has `url`, not `assetKey`.

## Folder Node

```json
{
  "id": "folder-characters",
  "type": "folder",
  "x": 80,
  "y": 260,
  "w": 300,
  "h": 200,
  "canvasKey": "characters",
  "title": "Characters"
}
```

In a project spec, `canvasKey` is resolved to `canvasId`, `path`, title, and child count. In persisted JSON, `canvasId` must reference a real child canvas.

## Group Node

```json
{
  "id": "group-act-one",
  "type": "group",
  "x": 60,
  "y": 220,
  "w": 900,
  "h": 420,
  "title": "Act I",
  "items": ["event-1", "event-2", "event-3"],
  "color": "#fef3c7",
  "locked": true,
  "z": 0
}
```

Group member IDs must exist in the same canvas. Keep member nodes above the group (`z` greater than zero when needed). The group is a boundary; its center should not compete visually with members.

## Connection

```json
{
  "id": "event-1-to-event-2",
  "from": "event-1",
  "to": "event-2",
  "labelText": "causes"
}
```

Both endpoints must exist in the same canvas. Prefer a concise relation phrase to an unlabeled decorative line.

## Invariants

- IDs are unique within their canvas.
- Node positions and dimensions are finite numbers.
- Connection endpoints exist.
- Group members exist.
- Folder targets exist and have the correct parent.
- Local file URLs resolve.
- Unknown fields survive edits.
