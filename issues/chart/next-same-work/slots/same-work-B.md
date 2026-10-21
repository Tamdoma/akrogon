# Same work: blind notes, slot B

## Pick, reason and cost

D1. Pick (a): accept a bare name when every matching target selects exactly the same set of leaf paths. Return that set once. Refuse when any set differs, listing the matching targets as today. This covers an issue and its sole same-name leaf, and an epic and its same-name issue when both select the same leaves. Compare full selected sets, not just their size, one shared leaf, or their currently actionable members.

The command dispatches leaves. When every interpretation selects the same leaves, refusing adds no protection against selecting different work. Equality also gives one rule for every target kind instead of special precedence rules.

Cost: explicitly reverse the 2026-10-08 collision lock. Adding a sibling can turn a previously accepted name into an ambiguity error. Accept that cost: it stops rather than silently widening the selected work. Explicit paths remain available when stable owner or leaf intent matters. Bare owner names can already select more work as their owners grow, so unconditional collision refusal does not make all bare-name selections immutable.

## Rejected options

O1. Reject (b), leaf always wins. When issue `x` contains leaves `x` and `y`, `next x` would silently select only `x` although the owner interpretation includes `y`. It also leaves epic/issue collisions unsettled. A precedence rule chooses between different work sets without asking the operator.

O2. Reject (c), refuse every collision and change watch to paths. Paths are appropriate for explicit intent, but changing one caller leaves the documented same-name layout inconvenient for every direct caller. It preserves the old growth-stability preference at the cost of the requested behavior. Watch changes would also expand this intake's stated implementation scope.

O3. Reject a special exception only for a same-name issue and single leaf. It fixes the report but leaves an epic and its sole same-name issue ambiguous even when both select identical work. Set equality removes the underlying mismatch between target count and selected work.

## Evidence

F1. `operator` · 2026-10-21 · `issues/chart/next-same-work/INTAKE.md`, Scope and Source: Tamdoma/akrogon#109. Scope requests accepting matches that select the same leaves. The report describes refusal for `cache-proof/cache-proof`; its installed-release diagnosis is explicitly unverified. This supports the intended behavior, not a claim that the historical invocation was reproduced.

F2. `operator` · lock dated 2026-10-08, read 2026-10-21 · `issues/chart/next-named-targets/forks/names.md`, Taken. Every collision currently refuses, including equal sets. The reason was stable meaning as an issue grows. This is a deliberate contract reversal, not merely an implementation correction. The other listed locks remain binding.

F3. `better-than-training` · inspected 2026-10-21 · `src/next.ts`, ownerCandidates, resolveName and selectLeaves. Each match already carries its selected leaves. Owners use open leaves; leaf slug matches use the full discovered inventory. resolveName refuses based on match count before examining equality. selectLeaves preserves existing-folder precedence. The needed selection data already exists, keeping the change local.

F4. `better-than-training` · inspected 2026-10-21 · `src/state.ts`, findLeaf. It searches leaf folders and refuses duplicate leaf slugs. It has no owner-name collision rule. The report's comparison with `phase` therefore does not establish the correct owner-selection policy for `next`.

F5. `better-than-training` · inspected 2026-10-21 · `docs/guide/parts.md`, Folders, because this is where everyone trips; `skills/watch-issues/SKILL.md`, Judge. The guide treats same-name issue/leaf folders as normal but currently requires a path. Watch invokes `next <slug>` for individual leaves. Accepting equal sets directly addresses that common invocation without changing watch. Unequal-set collisions remain errors.

F6. `better-than-training` · filesystem measurement 2026-10-21 · issue trees at roots returned by `akrogon config`. No state.yaml leaf folders at supported depths were found under their `issues/open` trees. Framework has 72 closed issue/leaf pairs sharing their final two folder names, including `issues/closed/cache-proof/cache-proof`. This confirms the layout exists, but provides no live open-state command reproduction. No dispatch command or Herdr call was run.

No external research was needed: the operator's intended scope, existing lock and repository implementation directly establish the decision and its cost.

## Pitfalls and what removes each

R1. A union can start extra work when sets overlap but differ. Remove it by requiring equality of every candidate's complete set of leaf paths, returning one candidate's set only after equality succeeds.

R2. Equal counts or equal slugs can conceal different leaves, including an open and closed leaf with the same slug. Remove this by comparing leaf paths as unordered sets. Distinct physical leaf paths remain distinct selections.

R3. Filtering to runnable leaves can temporarily hide a sibling that is blocked or already merged. Remove it by comparing the full candidate selections already built in resolveName, before scheduling or phase filtering.

R4. Growth can invalidate shorthand. Remove silent behavior changes by refusing as soon as selections differ. Document that exact boundary in the existing guide passage. Use explicit owner or leaf paths when that distinction must persist.

R5. A local change could weaken unrelated locks or discovery errors. Keep the existing discovery and path-selection flow intact. Validation should cover equal singleton sets, equal multi-leaf epic/issue sets, unequal sets, open/closed duplicate slugs, path precedence, and refusal before any Herdr call. Preserve the existing unreadable-inventory behavior rather than introducing recovery or a new completeness mechanism in this change.

## Question the fork does not ask

Q2. Should the documentation explicitly recommend a leaf path when the caller requires exactly one leaf as an issue grows? My answer is yes, within the existing parts.md explanation. Equal-set acceptance is safe for the current inventory; it does not promise that a bare name will continue to resolve after the tree changes.
