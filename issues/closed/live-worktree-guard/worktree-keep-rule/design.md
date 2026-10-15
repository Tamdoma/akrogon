# Design: worktree-keep-rule

## Binding decisions, verbatim

### Removal rule
From [removal-rule.md](../../../chart/live-worktree-guard/forks/removal-rule.md).

Operator, 2026-10-15, Round 1, verbatim: "1a | 2a | 3a | what is s1 and s2 and where?" (after the round was restated simply on "elid").
1. Reconcile deletes a registered store checkout only when it is an akrogon kind it knows is finished. Every other registered checkout is kept and listed by `akrogon leftovers`. Reason: a wrong keep is visible and reversible, a wrong delete loses work (a77c260, #94). Foreclosed: delete any clean checkout unless locked; reading charts' `Direct attempt` sections as a deletion authority.
2. The direct route creates its checkout with `git worktree add --lock --reason <chart>` and unlocks right before its own `git worktree remove` at landing or abandon. Every store deletion goes through plain `git worktree remove`, never forcing past a lock. Reason: protects the checkout whatever its name, against store-sweep's prefix match. Foreclosed: no lock, relying on the keep rule alone.
3. Each reconcile pass writes the registered checkouts it removed (path, branch, head, rule) into the report it already rewrites. Caller label and append-only history are out of scope. Reason: the next wrong deletion becomes provable. Foreclosed: no record.
Correction by A, 2026-10-15, to the record of item 2 (no operator answer changed): the presented option read "Every store deletion must go through `git worktree remove` and never force past a lock", restated simply as "Cleanup must never override a lock". Binding: every removal of a registered store worktree goes through `git worktree remove` and never passes a lock (no `--force --force`, no unlock by cleanup, no filesystem delete); a single `--force` is allowed where an existing contract has it, because it cannot pass a lock (P1). (A,B)
Correction by A, 2026-10-15, to item 1's scope (no operator answer changed): akrogon's scratch kinds (`verify-<run>`, `batch-<attempt>`, `<leaf>-u<N>` of an existing leaf) keep the sweep's scratch rules on the leaf's base, which #93 scratch-copy-removal owns; this leaf's keep rule covers every other registered worktree. (A,B,C)
Only the door removes a direct checkout (A,B,C). Process checks for akrogon's own kinds stay with #93 scratch-copy-removal.

Proof P1 (git 2.56.0, recorded in removal-rule.md Findings): `git worktree add --lock --reason` works at creation; `git worktree list --porcelain` prints `locked <reason>`; plain and single `--force` `git worktree remove` both refuse a locked worktree (exit 128); unlock then plain remove succeeds.

### Kept display
From [after-merge-remainder.md](../../../chart/worktree-cleanup/forks/after-merge-remainder.md) Taken correction 2026-10-15: plain `akrogon status` prints no kept lines; `akrogon leftovers` lists kept paths that need a person, hiding reasons a later pass clears by itself.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: each criterion is proven by the cheapest test at the real boundary, here a reconcile pass through `akrogon next` and the `tab_closed` event over a temporary repo with real `git worktree add` / `git worktree lock` worktrees in a temporary store, using the existing reconcile test fixtures and environment overrides; never the real store. The rule change is a fix of a proven bug: criterion 1's test fails on today's code and passes after; criteria 2 and 4 show one deliberate break turning their test red. The existing test that pins removal of a registered variant (tests/reconcile.test.ts, the variant-removal case) is a false expectation under decision 1 and is rewritten or deleted with that reason. Criterion 5 is skill text; no test is added for prose. No machinery, no live model or outside call.

## Leaf architecture

Owned surfaces: `src/reconcile.ts` (the candidate sweep in `reconcile`, `removeWorktree`, the kept report schema and writer), `src/leftovers.ts` (lock reason display, if a new reason needs it), `skills/chart-issues/SKILL.md` (Direct route step 1, landing step 8, growth stop continuations).

Rules:
- Lock first. Read `git worktree list --porcelain` once per pass (the registered set already comes from it) and keep every locked registered worktree with a reason naming its lock reason, before any leaf, kind or fallthrough rule, including a leaf's own recorded worktree. Nothing in this leaf adds a `--force` removal or passes a lock.
- Fallthrough. The candidate sweep's scratch branches stay as they are on this leaf's base: `verify-<run>`, `batch-<attempt>` and `<leaf>-u<N>` of an existing leaf follow today's rules, or scratch-copy-removal's once it has merged, including its single-`--force` removals and its handling of copies without a record. A leaf-slug worktree keeps its leaf rules. Every other registered store or legacy-root worktree, including `<name>-u<N>` whose prefix is no leaf slug, is kept as `unmanaged worktree` (the reason already used for outside-root registrations), which `akrogon leftovers` lists. The only change to the scratch branches is the lock check before them. (A,B,C)
- Pane checks stay as today on the removal paths; this leaf adds no process scan.
- Record. Each removal through `removeWorktree` adds `{path, branch, head, rule}` to a `removed` list in `reconcile/<repo>.json`, written with `kept` each pass. `branch` and `head` come from the porcelain read taken before removal; verify, batch and worker copies are detached, so `branch` is absent for them (A,C); `rule` names the branch of the sweep that removed it (merged leaf, failed leaf, ended verify, worker of finished leaf, unrecorded batch, old-root migration).

State changed and its consumers:
- `reconcile/<repo>.json` gains `removed`. Readers: `readKept` (src/reconcile.ts, strict schema shared with `readHostKept`), `akrogon status <slug>` (`Kept:` lines), `akrogon leftovers`. Reports written before this change have no `removed`; the reader accepts them. Open for the plan: whether `removed` lives in the same strict schema with a default or the repo report gets its own schema, given the host report shares `writeKept`.
- Removal of registered variants stops: tests that expect a registered non-kind worktree to be removed (reconcile tests around the variant case) change with the stated reason.
- The direct route's worktree is locked for its whole life. Consumers of a direct worktree: `akrogon verify --holder <chart>/direct` (reads the worktree, never removes it), direct-guards.ts (reads), landing step 8 (removes after unlock), growth-stop handoff: the leaf adopts `<store>/<slug>` through the command's worktree setup (src/next.ts, worktree adoption), which must find it unlocked so later leaf rules can remove it. Open for the plan: confirm the adoption path neither locks nor needs the lock state.

Coordination, no blocked-by (operator: no dependency on #93 leaves):
- scratch-copy-removal (#93, in review) force-removes dead verify, batch and merged-owner worker copies in the same sweep. Its single `--force` cannot pass a lock (proof P1), and its kinds match this leaf's finished kinds. Scratch kinds are its rules, not this leaf's; whichever lands second keeps both: locked stays, any other registered worktree stays, scratch kinds follow scratch-copy-removal. (A,B,C)
- store-sweep (#93, planning) deletes unregistered entries; its brief now states its `<slug>-<anything>` match applies to unregistered entries only and registered worktrees follow this leaf's rule.

Exclusions: unregistered store entries and host junk (store-sweep); force removal and process checks of akrogon's own copies (scratch-copy-removal); a caller label or append-only removal history (out of scope, decision 3); worktrees outside the store and legacy root (already kept as `unmanaged worktree`).
