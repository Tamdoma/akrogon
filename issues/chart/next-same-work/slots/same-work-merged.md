# Same work: merged notes (A, B, C)

## Options

- (a) Equal leaf-path sets collapse to one match; any difference refuses with today's listing. (A,B,C) Reason: when every reading starts the same leaves, refusal protects nothing; one rule covers issue/leaf and epic/issue. Cost: reverses names.md Taken 3a in part; adding a sibling turns a working name into a refusal, never into different work.
- (b) Leaf slug always wins. Rejected (A,B,C): silently starts a subset when the owner reading includes more leaves; a closed leaf could win over an open owner (C: "leaf slug selection keeps open and closed behavior" test shows closed leaves dispatch by slug).
- (c) Keep refusing, watch passes paths. Rejected (A,B,C): #109 stays unfixed for operators; watch observe output has `slug=` only, so it needs a second surface (C).
- Special case only for issue + single same-name leaf. Rejected (B): leaves epic/issue equal sets ambiguous with no reason.

## Evidence

- operator · names.md Taken 3a (2026-10-08) · every collision refuses incl. same work · deliberate reversal (A,B,C).
- better-than-training · src/next.ts resolveName/ownerCandidates/selectLeaves · each match already carries its leaf set; existing cwd folder resolves before resolveName, so path meaning is untouched (A,B,C).
- better-than-training · src/state.ts findLeaf/slugFolders · leaf slugs unique across open+closed, so the leaf side of a collision is at most one leaf, possibly closed (B,C).
- better-than-training · tests/next.test.ts named-target tests · "refuses an issue and its same-name leaf" (single leaf exp/exp) flips to a start; epic/issue (second issue), owner vs unrelated leaf, two same-name issues still refuse (C).
- better-than-training · skills/watch-issues/SKILL.md Observe/Judge · watch runs `next <slug>` per leaf; fixed for single-leaf same-name issues by (a) (A,B,C).
- better-than-training · counts 2026-10-21 · 72-74 closed same-name single-leaf issues; same-name leaf inside a multi-leaf issue: 0 in akrogon+framework (A), 1 across all 11 repos, varhop overlay-rework (C). No open leaves anywhere today (B,C).
- better-than-training · src/next.ts discover (line 122) · every unreadable leaf in the repo is reported as an error line on every `next` call, before selection (A).

## Pitfalls and removal

- Size/slug comparison collapses different leaves (two same-name issues under different epics). Removed: compare full leaf-path sets; existing two-epics refusal test kept (A,B,C).
- Union dispatches a leaf twice. Removed: return one match's set once; test dispatched slugs are exactly the single leaf (C).
- Filtering to runnable leaves before comparison hides a blocked/merged sibling. Removed: compare the full sets resolveName builds, before scheduling (B).
- Growth flips a working name to a refusal. Removed in part: refusal lists kind+path, starts no Herdr call; parts.md says pass a path once the readings differ; test pins that a second leaf flips `next x` to refusal (A,B,C).
- Refusal must start nothing: existing lock, kept (A,B,C).

## Points where slots differ

- D-unreadable. C: refuse the collapse when an unreadable or unknown leaf sits under a matched owner (owner sets come from readable open leaves only, so a hidden sibling fakes equality). B: keep existing unreadable-inventory behavior, add no new mechanism. A: same as B; discover already reports every unreadable leaf as an error on every call, and a non-colliding `next <issue>` with an unreadable sibling behaves the same today, so collapse hides nothing new.
- D-scope. B, A: equal-set rule is general (issue/leaf and epic/issue). C: asks whether to limit it to the #109 pair (U1).
- D-closed. C U2: should a closed leaf slug stop counting when an open owner matches? A: off route; today it refuses and still refuses under (a), and names.md lock keeps leaf slugs' open+closed search.
- D-extras. C U3 (watch passes paths), U4 (shared next/phase resolver), U5 (leaf counts in refusal). A: off route for #109; U4 is already off route in CHART.md. B Q2 (parts.md recommends a leaf path when one leaf must be meant as an issue grows): A agrees, inside the parts.md change.
