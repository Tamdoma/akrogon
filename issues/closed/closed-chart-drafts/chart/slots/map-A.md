# Map A: Tamdoma/akrogon#39

## Mechanism (verified)
- Producer: framework doors wrote full leaf drafts (brief.md, design.md, state.yaml) to `issues/chart/<c>/slots/leaf-draft/<slug>/` in 4 charts on 2026-09-28 (framework commits 3086c7430, dfaefb46b, cbfc72c66, 172cdc14c). skills/chart-issues/SKILL.md:61 says drafts go "to the scratchpad", but questions.md:46 says post-creation exchange paths live under `<chart>/slots/`, so a door put leaf-draft reviews there.
- Move: `completeOwner` src/phase.ts:173-174 renames `issues/chart/<owner>` to `issues/closed/<owner>/chart`, putting the drafts inside a scanned area.
- Scan: `discover` src/next.ts:95-105 treats any folder holding `state.yaml` under open/closed as a leaf; `validateLeafDepth` src/state.ts:86-91 rejects depth 5, counted as unreadable.
- Capacity: src/next.ts:273-274 in the unreadable branch counts every non-failed readable leaf, merged included, plus unreadable. Merged leaves never hold a seat, so a repo with many merged leaves saturates max_active.
- Wider than reported: `allLeaves` src/state.ts:104-117 (used by `findLeaf`) also throws on the bad depth, so `akrogon phase <slug>` fails for every leaf in that repo, not only dispatch.
- Live state now: no state.yaml at a bad depth in any registered repo; 8 hand-renamed state.draft.yaml files remain in framework (6 in open charts, 2 in the closed one).

## Forks
1. Which layer owns the fix: scanner (ignore `chart/` under closed owners, or only read legal leaf positions), completeOwner (stop moving chart into closed / move elsewhere), door (forbid state.yaml drafts in repo), capacity rule (exclude merged / closed from unreadable reservation). Possibly several.
2. Capacity rule under unreadable: should merged leaves (and unreadable files under issues/closed) reserve capacity? Current behavior is deliberate conservatism from f9e7ddd for unknown active leaves; merged is not.
3. Door drafting location: name an exact out-of-repo scratch path for leaf drafts, or allow slots but forbid the filename state.yaml.
4. Existing hand-renamed state.draft.yaml files in framework: leave, or clean up (operator step on main, not a leaf).

## Practitioner questions
- Should a malformed file in an archive (closed) ever affect dispatch? Closed holds only completed owners.
- Should a strict depth validator be kept as a guard against misplaced real leaves while exempting a known non-leaf subtree?

## Pitfalls
- Ignoring every deep state.yaml silently hides a genuinely misplaced leaf.
- Fixing only the door leaves already-existing charts (other repos, older drafts) able to re-trigger on close.
- Fixing only capacity leaves `akrogon phase` broken by allLeaves throwing.
- An issue named `chart` inside an epic collides with the rename target `closed/<owner>/chart`.

## Split
One destination (akrogon repo). Likely one issue with independent leaves: inventory/archive fix in src, capacity rule in src/next.ts, door wording in skills/chart-issues.
