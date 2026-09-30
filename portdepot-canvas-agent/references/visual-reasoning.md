# Visual reasoning on Port Depot canvases

Use this reference when the user asks to organize complex investigation, worldbuilding, research, or decisions as a whiteboard. The subject can vary; choose a visual projection by the question the viewer needs to answer.

| Question | Projection | Position rule | Connector rule |
|---|---|---|---|
| What happened first, and what happened at the same time? | Timeline / swimlanes | x = time; one fixed y lane per actor | within-lane succession only; label cross-lane transfer explicitly |
| Why did this happen? | Cause chain / loop | one dominant direction; wrap only at a deliberate turn | connect only claimed causes, not mere chronology |
| Who relates to whom? | Sparse link chart | focal entity at center; direct actors nearest; institutions in outer band | keep only relationships the board's question needs |
| What explains the evidence? | Evidence × hypothesis matrix | evidence rows, competing hypotheses columns | use cell states and source labels; do not draw a full mesh |
| What conclusion is justified? | Claim–evidence map | claim, support, contradiction, source in separate zones | distinguish support from refutation and unknown |
| Where or how does something move? | Map / route / flow | preserve spatial or process coordinates | arrows mean movement or handoff |
| What remains possible? | Issue tree / decision tree | parent question above alternatives | branches represent alternatives, not social ties |
| Which references set the visual direction? | Gallery / moodboard | align images and extraction notes in cells | grouping usually communicates more than cross-image lines |

## One fact, several projections

Maintain a small source registry for recurring facts: stable fact ID, concise proposition, source, confidence/status, and affected entities/time/place. Attach the same `factIds` to each view node that projects that fact. In the current Port Depot canvas JSON this is metadata, **not automatic shared-data synchronization**. When a fact changes, update every matching projection and verify them before applying. Keep unsupported interpretations as hypotheses or open questions; do not silently promote them to facts.

## Layout before connections

1. Write the question for each canvas in one sentence. Do not put unrelated questions on a single graph merely because they share subject matter.
2. Place time, actor, or causal stages on a consistent coordinate system. Reserve separate bands for context, evidence, and unresolved points.
3. Keep repeated cards aligned and large enough to read. Prefer a few local links over a dense all-to-all network. A matrix or grouped cells often replaces dozens of lines.
4. Give every edge a claim-bearing label. If a connection would cross a card or several unrelated edges, move the nodes, split the view, or encode the relation in a matrix. Avoid aesthetic connectors.
5. Check body text wrapping, node overlap, edge crossing, and default viewport. The optional `scripts/check_layout.py SPEC.json` flags potential collisions using straight centerlines; Port Depot may render connectors differently, so inspect the actual app before calling the layout done.
6. Read the project back after applying and visually inspect the overview plus representative detail views. An API response proves persistence, not legibility.

File previews may render at their intrinsic aspect ratio beyond the declared node height. Leave image-to-caption clearance based on the longest actual rendered preview, then inspect it in Port Depot. Tune the saved zoom for the user's actual app window; a numerical viewport audit for a smaller standard window is a secondary signal when the user works on a larger display.

## Preserve the viewer's information boundary

For stories and investigations, distinguish what happened, what witnesses claim, what the investigator currently knows, what is inferred, and what is still undecided. A timeline can contain the true sequence while a separate evidence matrix shows the player's current case; label the perspective so the two are not mistaken for contradictions.
