# Port Depot Aesthetic Standard

Use this standard for onboarding, demonstration, portfolio, and presentation-quality canvases. It converts “make it beautiful” into repeatable decisions and measurable checks.

## 1. Information Architecture

- The root is a map, not a storage dump. It contains one hero or orientation block, a visible start point, and folder nodes for the main learning or work stages.
- Use folders for real navigation and groups for visual clustering. Never use a fake folder-shaped card when a child canvas is intended.
- Give each child canvas one job and one archetype:
  - **overview** — scope, route, and outcomes;
  - **workflow** — ordered actions with labeled transitions;
  - **gallery** — media comparison with aligned previews and annotations;
  - **reference** — compact factual lookup;
  - **decision** — evidence, alternatives, and chosen direction;
  - **handoff** — deliverables, contract, verification, and next owner.
- Prefer 5–9 primary nodes in a zone. Split the canvas when more than three major zones compete in one default view.
- Every onboarding canvas ends with a task, checkpoint, or observable outcome.

## 2. Spatial System

Base spacing on an 8 px grid. Use these preferred values:

| Relationship | Target |
|---|---:|
| Canvas edge to primary content | 72–120 px |
| Title to orientation line | 16–24 px |
| Orientation line to first zone | 56–80 px |
| Gap between major zones | 96–160 px |
| Gap between sibling nodes | 40–64 px |
| Group inner padding | 40–56 px |
| Card inner padding | 24–32 px |

- Align sibling nodes to shared rows or columns. Misalignment under 12 px is usually accidental; snap it.
- Keep a single dominant reading direction per canvas: left-to-right for processes, top-to-bottom for guides, or a deliberate radial map for exploration.
- Leave 8–12% empty space around the content bounds in the default viewport. Primary content should occupy roughly 70–88% of the visible area.
- A group must fully contain every member with at least 32 px padding. Set locked groups to `z: 0`; keep content at `z: 2` or above.
- Do not stack explanatory text over decorative fills or images. Put captions adjacent to media when readability would otherwise depend on zoom.

## 3. Typography

Use one sans-serif family per project and at most four text sizes per canvas.

| Role | Size | Notes |
|---|---:|---|
| Canvas title | 32–40 px | one per canvas, bold |
| Section title | 22–28 px | short noun phrase |
| Body / card title | 15–19 px | 1.35–1.55 line height |
| Caption / metadata | 11–13 px | never carry critical instructions |

- Keep body text nodes at least 320 px wide. Keep primary titles 640–1100 px wide to prevent accidental wrapping.
- Port Depot text bodies default to a 520 px `maxWidth` even when the node itself is wider. For any intended line wider than 520 px, set `style.maxWidth` explicitly to the usable node width and give the node enough height for its planned line count. Treat unplanned title wrapping as a release-blocking visual defect.
- Use bold for hierarchy, not for entire paragraphs. A card should communicate one idea in a heading plus one or two short lines.
- Use sentence case consistently. Number stages only when order matters.

## 4. Color and Contrast

- Use one light neutral canvas, one dark text color, one brand accent, and no more than two semantic tints per canvas.
- Recommended neutral set: canvas `#F7F9FC`, primary text `#101828`, secondary text `#475467` or `#667085`.
- Recommended semantic tints: blue `#EEF4FF`, green `#ECFDF3`, amber `#FFF6ED`, violet `#F8F5FF`.
- Use low-chroma tints for group backgrounds. Saturated color belongs to small accents, labels, or a single focal card.
- Maintain at least 4.5:1 contrast for normal text and 3:1 for large text and essential UI boundaries.
- Color cannot be the only carrier of meaning. Pair it with a title, icon, number, or connection label.

## 5. Nodes and Media

- Use one hero media node per canvas at most. Supporting media should share a consistent height or baseline.
- Preserve media aspect ratio. In the unselected state, image and video previews should read as media rather than white cards; avoid white gutters and oversized bottom bars.
- File nodes need annotations that explain why the asset is present, how to use it, and its source or rights status.
- Text/document nodes should demonstrate editability; archive and JSON nodes should explain inheritance or automation roles.
- Avoid nearly identical duplicate assets unless the comparison itself is the lesson.

## 6. Connections

- Connections express meaning, not decoration. Label them with a short verb phrase such as “produces,” “supports,” “is reviewed by,” or “returns to.”
- Route processes left-to-right or top-to-bottom. Minimize crossings and avoid edges that pass through unrelated nodes.
- Do not connect folder navigation cards merely to form an ornamental snake. Connect them only when the relationship teaches sequence or dependency.
- A workflow with three or more steps should connect every adjacent step unless the break is intentional and explained.

## 7. Default-View Composition

- The first screen must answer: “Where am I?”, “Where do I start?”, and “What can I do here?”
- Keep essential actions, the current-canvas title, and the full primary route inside the default viewport.
- Design and inspect at both 1280×720 and 1440×900. A smaller window must not hide the route back to the main canvas, minimap, trash, or other essential controls.
- Avoid a composition that only works at one zoom level. Titles must remain legible one zoom step below the saved default.

## 8. Onboarding Narrative

Use this order unless the product brief demands another:

1. orient — explain the canvas and the route;
2. act — let the learner pan, zoom, select, and create;
3. understand — show supported node and media types;
4. organize — demonstrate folders, groups, annotations, and relations;
5. inherit — demonstrate export, JSON, Agent editing, and re-import;
6. collect — demonstrate capture/harbor and optional desktop pet flow;
7. complete — give a checklist and a visible next step.

Every explanation should be paired with a concrete micro-task and a visible success condition.

## 9. Review Score

Score the final result out of 100:

| Dimension | Points | Pass condition |
|---|---:|---|
| Hierarchy | 20 | start point and reading order are obvious |
| Spacing/alignment | 20 | grid, gaps, padding, and bounds are consistent |
| Density | 15 | no crowded or empty accidental regions |
| Color/contrast | 15 | restrained palette and readable text |
| Semantic clarity | 15 | folders, groups, annotations, and labels mean distinct things |
| Interaction/verification | 15 | tasks, media, minimap, hierarchy, and export work |

Presentation-ready threshold: **85/100**, with no dimension below half its available points. A screenshot defect overrides the numeric score.

## 10. Final Polish Checklist

- [ ] One clear title and start point per canvas.
- [ ] No clipped primary nodes, accidental overlaps, white media gutters, or unreadable wrapped text.
- [ ] Group bounds contain members and do not cover content.
- [ ] Folder nodes open real canvases with correct parent relationships.
- [ ] Labeled connections render without confusing crossings.
- [ ] Images, video first frames, audio, documents, archives, and other promised formats load.
- [ ] All external assets carry source/rights notes; original assets are labeled as original.
- [ ] Minimap count matches persisted node count and selection is synchronized.
- [ ] Export contains the current canvas, descendants, canvas JSON, and assets.
- [ ] The project remains understandable when reopened without the author present.
