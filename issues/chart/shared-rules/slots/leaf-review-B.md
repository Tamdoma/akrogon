# Leaf review B

Reviewed the three scratchpad contracts against the approved shape, current sources at a33d967b, and the fork record. Read-only checks only. The findings below do not reopen the approved split or its order.

## LR1. Two criteria promise whole-suite health outside their ownership

Affected: `skill-links-in-folder/brief.md`, **Done-criteria 3**, and `lifecycle-rules-source/brief.md`, **Done-criteria 5**.

The first says “The repo's `test` check … On the delivered tree it passes.” The second requires “the repo's `test` check passes”. `issues/config.yaml`, **checks**, defines `test` as `bun test --timeout=30000 --parallel=4 --no-isolate`, covering the repository suite rather than just these leaves' link behavior. A failure elsewhere can therefore make their own criteria red even when their promised outcomes hold.

`skills/chart-issues/assets/shapes.md`, **Leaf files** and **Preflight and validation**, permits existing checks as proof but rejects a repo-health claim outside leaf ownership.

Smallest change: make the criterion require the link validation to accept the delivered valid paths and reject the specified invalid paths, including reader-facing aliases. Name the existing check as its proof, without making the whole suite passing the leaf's own outcome. Normal lifecycle verification remains required.

## LR2. The door's asset-read proof is not in the cited record

Affected: `door-step-files/readiness.yaml`, first **proofs** entry.

It claims a 2026-11-11 Claude Read observation opening `assets/questions.md`, `assets/shapes.md` and `assets/standing-design.md`, together with folder-link listings, and cites `issues/chart/shared-rules/forks/shape.md`. The current **Findings** records O1's failing lesson paths, O2's ponytail link-file access, O3's source-tree link scan, and the adopted corrections. It does not record this asset-read operation or its stated result.

O2 supports the installed link-file mechanism. It is not the recorded operation this readiness entry claims. The leaf relies on this entry for the pre-existing reach of its asset files, so its evidence needs a matching home before handoff under **Preflight and validation**.

Smallest change: record the already-performed asset observations in Findings with the command/tool inputs, identity, version, date, result, cleanup and limits, and point readiness to that observation. If they were not performed, obtain the smallest authorized read-only observation or revise the entry to the evidence actually held. Do not leave an unrecorded operation described as completed proof.

## LR3. The door's section counts mix two counting conventions

Affected: `door-step-files/brief.md`, **Why**, and its second readiness **proofs** entry.

The brief gives Direct route 1,263, Autopilot 1,726 and Handover 765 words, then says they total 3,761. Those numbers total **3,754**. Read-only counting of the current named sections on 2026-11-11 gives **1,266 / 1,728 / 767** including their headings, totaling **3,761**, and **1,263 / 1,726 / 765** excluding headings. The fork's recorded 3,761/44.8% uses the former convention.

Smallest change: use the heading-inclusive counts consistently in the brief and readiness, or explicitly distinguish body counts from the full-section total. The agreed scope does not change.

Findings: LR1, LR2, LR3.
