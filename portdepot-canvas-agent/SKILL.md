---
name: portdepot-canvas-agent
description: Create, modify, and verify complete Port Depot infinite-canvas projects from structured JSON. Use when an AI Agent should automate a Port Depot demo/project with real canvas hierarchy, text, files, groups, annotations, labeled relationship lines, local assets, and valid canvas JSON; not for rebuilding or packaging the Port Depot application itself.
---

# Port Depot Canvas Agent

Turn a user's theme and content requirements into an operable, presentation-ready Port Depot project by generating structured JSON and applying it to the local app. The result must be editable, visually coherent at the default viewport, navigable through real child canvases, and exportable for later Agent editing.

## Choose the Operating Mode

Prefer the live API at `http://127.0.0.1:8765` when Port Depot is running. It creates project/canvas IDs and directories correctly, applies concurrency checks, and lets the app observe updates.

This is a **Port Depot-specific** skill: it works on macOS and Windows installations of Port Depot, but it does not modify arbitrary whiteboard, design, or file-management software. Its scripts require Python 3.9+ only; no package installation is needed. Applying a spec with local or downloaded assets also requires Port Depot's writable `storage/library` directory. Pass it explicitly with `--asset-root` or `PORT_DEPOT_ASSET_ROOT`; do not assume an app bundle path.

Edit persisted `canvas.json` files directly only when the app is stopped and the user explicitly needs offline repair. In that mode, locate the exact canvas through `/api/canvases` data or existing metadata first, preserve unknown fields, write atomically, and keep a recoverable copy.

For a new or substantial project, generate a declarative project spec and apply it with `scripts/apply_project.py`. Start from `assets/project-spec.template.json` rather than inventing a separate format.

## Work in Seven Passes

Do not mix information architecture, content writing, and pixel polishing in one pass.

1. **Diagnose** — inventory the existing hierarchy, node types, assets, viewport, and user-authored material. Preserve unrelated work.
2. **Architect** — define one root overview and focused child canvases. Assign every canvas an archetype: overview, workflow, gallery, reference, decision, or handoff.
3. **Systemize** — choose typography, spacing, palette, node sizes, and connection semantics from `references/aesthetic-standard.md`.
4. **Compose** — write concise content, build real folder hierarchy, position nodes, place locked groups behind content, and label meaningful connections.
5. **Validate** — run the project applier without `--apply`, then run `scripts/audit_project.py`. Correct errors and review warnings before mutation.
6. **Apply** — update the intended Port Depot project through the live API.
7. **Verify** — inspect at least the root, densest child, and media-heavy child visually; then verify persisted data and export.

## Build the Project Spec

Read [references/project-spec.md](references/project-spec.md) before generating or applying a project spec. Read [references/aesthetic-standard.md](references/aesthetic-standard.md) for onboarding, demo, portfolio, or presentation-quality projects. Read [references/canvas-json.md](references/canvas-json.md) when adding unfamiliar node types or editing exported `canvas.json` directly.

Translate the brief into information architecture before positioning nodes:

- one root overview canvas;
- focused child canvases, referenced by root folder nodes;
- optional deeper canvases only when the content needs them;
- one clear purpose per canvas;
- semantic connections that express causality, contrast, dependency, sequence, or ownership.

Write a short content map before positioning nodes. Each canvas needs one sentence that states its learning or work outcome. If two regions have unrelated outcomes, split them into child canvases rather than shrinking everything.

Use stable, descriptive IDs. Never derive connection endpoints from display order. A folder node's `canvasKey` must reference a real canvas entry in the same spec.

## Compose a Demonstration Canvas

Make the case demonstrate Port Depot's product capabilities, not just its visual style:

- text nodes for headings, briefs, decisions, and explanatory notes;
- file nodes for local media and editable documents;
- file annotations containing design intent and source attribution;
- folder nodes for actual child-canvas navigation;
- groups for spatial organization, with member IDs in `items`;
- labeled connections for meaning, not decoration;
- a source/rights document when external assets are used.

Keep key content visible at the default viewport. Use columns, lanes, or clusters with consistent spacing. Place groups behind their members and do not put decorative content in the center of a group where it can obstruct text nodes.

Use a visual hierarchy that survives zooming out: one page title, one short orientation line, two or three major zones, and a clear start point. Treat whitespace as structure. Prefer fewer, larger explanatory nodes over many small notes. The root should explain where to begin, what the project contains, and what the user will be able to do after completing it.

For onboarding projects, demonstrate at least: navigation, selection/deletion, every supported node category, annotations, real child canvases, groups, labeled relationships, collection flow, export/import inheritance, keyboard shortcuts, and a completion checklist. Explain each capability with a task the learner can perform, not only descriptive prose.

When using online material, prefer authoritative sources, save a local copy under the correct canvas directory, and record the original URL in an annotation or source document. Do not imply that reference art has a new license.

## Apply JSON to Port Depot

First validate structure without mutation:

```bash
python3 scripts/apply_project.py /path/to/project-spec.json
```

Then audit presentation quality:

```bash
python3 scripts/audit_project.py /path/to/project-spec.json --strict
```

`--strict` fails on structural aesthetic violations and a score below 85. Warnings are deliberate-review prompts: fix them when they identify an accidental layout, or document why the exception is intentional.

Inspect the plan. When the user has requested creation or modification, apply it:

```bash
python3 scripts/apply_project.py /path/to/project-spec.json --apply
```

When the project includes assets, include the writable library path. Examples:

```bash
# macOS example — use the actual Port Depot data directory for this installation
python3 scripts/apply_project.py project.json --apply --asset-root "/actual/Port Depot/storage/library"

# Windows example
python scripts/apply_project.py project.json --apply --asset-root "%LOCALAPPDATA%\\Port Depot Data\\assets\\library"
```

The script is idempotent by project name plus canvas title/parent relationship. It creates missing projects/canvases, resolves `canvasKey` and `assetKey` references, stores assets in their owning canvas directories, validates connection endpoints, and updates canvas JSON through the API.

Do not bypass validation to force malformed data into the app. Correct the spec instead.

## Verify the Result

After applying:

1. Re-fetch every canvas and compare node/connection counts with the spec.
2. Assert every connection's `from` and `to` exists in the same canvas.
3. Assert every folder `canvasId` resolves and its `parent_id` is correct.
4. Open the root canvas, the densest child canvas, and one media-heavy child canvas.
5. Confirm persisted node count equals minimap node count.
6. Select a node and confirm one corresponding minimap selection.
7. Confirm images load, annotations open, relationship labels render, and group content remains readable.
8. Export the root project package and validate its manifest, canvas JSON files, and assets.
9. Check for relevant browser console errors.
10. Capture or inspect the UI at approximately 1280×720 and 1440×900. Confirm the default view has 8–12% breathing room, no clipped primary content, no accidental overlaps, no white media gutters, and readable titles.

Do not declare a presentation-quality project complete until it scores at least 85/100 in the aesthetic audit and passes the visual checks. A high score does not override visible defects.

Return the project name, root canvas ID/link, hierarchy, node/connection/asset totals, validation result, and any source or licensing caveats.

## Preserve User Work

- Never replace unrelated projects or canvases.
- Reuse an existing matching project only when its name and intended role match.
- Preserve canvas identity and unknown fields on updates.
- Do not delete extra nodes merely because they are absent from a new brief unless the user asked for replacement.
- Treat `--apply` as a write operation and use it only within the project scope authorized by the user.
