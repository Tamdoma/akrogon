# walls return — slot C

## Q1 — in-checkout `worktree_root` vs `checkLocation`

### Pick
(a) refuse an in-checkout `worktree_root` at config read, naming `worktree_root` and `issues/config.yaml`, and delete `src/init.ts`'s gitignore branch plus the `setup.md` sentence that sanctions it. Reason: the design doc already owns this boundary (Boundary 2a: store outside every checkout), so the config value was never legal — it only passed while the main checkout's tree lacked `package.json`. Every in-checkout store sits one checkout-move from death (#115's trigger was a `git checkout` move, not a config edit), which makes write-time validation structurally insufficient. Refusing at read deletes the fragile class instead of adding a second guard. Cost: any command that resolves the store (`config`, `next`, `reconcile`, `verify`) throws the named error on a bad config; tests using relative `worktree_root` fixtures (`custom/trees`, `work/trees` in config.test.ts:247, init.test.ts:54,66) must switch to absolute fixture paths or be deleted. Both costs are one-line-and-mechanical.

Refusal placement: inside `worktreeStore` using the existing `within(path, parent)` (config.ts:234) on canonicalized paths — this is the single funnel every consumer already passes through, including `init`. Alternative I considered: run `checkLocation(store)` at read; rejected — it drags live filesystem state of ancestor folders into config parsing, when the config defect is only "store inside repo root."

### Rejected
- (b) migrate the consumer + docs only. No akrogon change; akrogon cannot edit Gljive's config (another operator's machine), and `ensureWorktree`'s mismatch error instructs a manual move anyway (next.ts:254). Leaves the trap armed for the next repo that inits an in-checkout store then gains a `package.json`. Fixes one instance, keeps the class.
- (c) delete `worktree_root`. Removes a key whose out-of-checkout values are legitimate (tests use it as the per-fixture store seam, 31 uses) and possibly needed on real hosts (disk placement). Deleting it is more diff than refusing its one illegal case, and buys nothing the refusal doesn't.

### Evidence
- `src/config.ts:42,267-271` — `worktree_root` optional text; `worktreeStore` returns `expandPath(worktree_root, repo.root)` with default `~/.akrogon/worktrees/<name>`. Inspected at HEAD 92dddada, 2026-10-22. Better than training.
- `src/guard.ts:5-22` — `checkLocation` walks canonical ancestors, refuses on `node_modules` or `package.json`. Inspected. Better than training.
- `src/init.ts:67-71` — gitignore branch adds `<rel>/` only when `worktreeRoot !== root && within(worktreeRoot, root)`. Inspected. Better than training.
- `docs/guide/setup.md:57` — "Only a store inside the checkout is gitignored." Inspected. Better than training.
- `skills/init-akrogon/SKILL.md:43` — skill has no `worktree_root` proposal rule at all (table only lists `setup` derivation); the in-checkout stores observed came from elsewhere, but init's code still sanctions them. Inspected. Better than training.
- `src/next.ts:250-255` — `ensureWorktree` refuses recorded-path mismatch with a move instruction, no auto-migration. Inspected. Better than training.
- `src/reconcile.ts:397-398,494-495` — `issues/worktrees` treated as legacy root for sweep/migration. Inspected. Better than training.
- `tests/` — 31 `worktree_root` uses across 7 files; relative-root fixtures in config.test.ts and init.test.ts assume in-checkout is legal. Inspected. Better than training.

### Pitfalls
- P1: plain `within` is lexical; a symlinked store can bypass it. Removed by canonicalizing both paths (`realpathSync`) before the comparison, matching `checkLocation`'s canonical-ancestor behavior. Done-criterion: a fixture whose `repo.root` is a symlink still refuses.
- P2: Gljive stays blocked until its operator edits config — the refusal makes the failure loud and named, not self-healing. Removed by the same done-criterion as (a): error text must name `worktree_root`, the config file, and that the store must live outside the checkout.
- P3: existing in-checkout worktrees (Gljive's four leaves) don't move on their own. No code needed — `ensureWorktree`'s mismatch error already instructs the move, and reconcile already sweeps the legacy `issues/worktrees` root.

### Question I'd ask
Q: should `akrogon config` degrade to printing the refusal as the `worktree_store` value instead of crashing? A hard throw keeps one code path (my pick); a degraded print keeps the diagnostic command usable on a broken repo. Fork doesn't decide; either is defensible.

## Q2 — package.json + no `setup` = guaranteed red

### Pick
(b) derive the installer from the committed lockfile when `setup` is unset — but derive at setup-run time via a new internal verb (`akrogon install`), not by baking a directory-specific string. Shape: `setupCommand` emits `flock ... akrogon install && akrogon guard own-modules && sh -c <cmd>` when `setup` is unset. `akrogon install` reads the lockfiles present in its cwd and execs the mapped installer (skill table at init-akrogon/SKILL.md:43 already defines the mapping verbatim: bun.lock→`bun install --frozen-lockfile`, package-lock.json→`npm ci`, pnpm-lock.yaml→`pnpm install --frozen-lockfile`, yarn.lock→`yarn install --immutable`). Reason: the lockfile is the declaration; today's config duplicates what the tree already says, and Gljive's exact failure is the duplication going stale (config landed before the lockfile existed, so init proposed no `setup`). Runtime derivation also covers the leaf-worktree case where a leaf adds a lockfile the printed command string can't know about. It composes with both candidates (a)'s message: when `package.json` exists and no lockfile does, `akrogon install` exits nonzero naming `setup` in `issues/config.yaml`; when neither exists it no-ops so dependency-free repos keep passing for free. Cost: one small verb, plus a lockfile-precedence rule when several exist (fixed order, first match wins — document the order once). Explicit `setup:` repos keep the exact current string, so the locked-install path is unchanged for them.

### Rejected
- (a) name `setup` in the own-modules refusal only. Keeps the manual requirement that already failed once by omission; a repo that gains a lockfile tomorrow still reds until someone notices. It's the right *fallback message* inside `akrogon install` for the no-lockfile case, not the fix.
- (c) no change, consumer adds `setup`. Status quo is a guaranteed-red config that `akrogon config` prints silently; #113 is the measured cost (every Gljive leaf blocked at check.review). Rejected by the chart's own scope sentence: a config that cannot work gets refused or fixed at the source, and here the source can be the tree itself.

### Evidence
- `src/config.ts:333-337` — unset-`setup` branch is `akrogon guard own-modules && sh -c <cmd>`; set branch already wraps the operator's install in flock + own-modules. Inspected at 92dddada. Better than training.
- `src/config.ts:339-341`, `src/verify.ts:331` — `setupCommand` is shared by printed checks (`withSetup`) and verify's setup run, so one change covers both consumers. Inspected. Better than training.
- `src/guard.ts:36-40` — `own-modules` checks the *result* (node_modules exists), so a wrong/missing installer still fails the same guard. Inspected. Better than training.
- `skills/init-akrogon/SKILL.md:43` — the lockfile→installer mapping exists as prose; moving it to code removes a doc-table that must be re-typed into every config. Inspected. Better than training.
- INTAKE #113 — Gljive: `checks: {}`, no `setup`, `bun install --frozen-lockfile` verified working in the leaf worktree. Inspected intake. Better than training.
- `src/verify.ts:76` — receipt requires `setup === 0`; `phase.ts:350-353` — the move refuses without one. Inspected. Better than training.

### Pitfalls
- P1: receipts bind runs to the command set; a changed setup string could orphan old receipts and force re-verifies. Done-criterion: confirm receipt matching keys on check names/tree, not the setup wrapper string (inspect `treeOf`/receipt compare before landing).
- P2: `setupCommand` currently has no directory parameter; resolving the lockfile at string-build time would inspect the wrong tree for verify (config root ≠ fresh checkout). Removed by the `akrogon install` verb: derivation happens inside the run directory, no signature change.
- P3: multiple committed lockfiles → ambiguous installer. Removed by fixed precedence documented in one comment and setup.md; exotic layouts fall back to explicit `setup:`.
- P4: skill staleness — the init skill would still propose `setup:` for plain mapped cases. Done-criterion: trim SKILL.md:20,28,43 so `setup` is proposed only when the tree's install isn't derivable (subdir, extra flags), so the config stays lean.

### Question I'd ask
Q: does the skill's `git ls-tree HEAD` rule (committed lockfile, not index) want mirroring in `akrogon install` — e.g., refuse an uncommitted lockfile? My read: no; `existsSync` on the run dir matches `own-modules`' own disk checks, and an uncommitted lockfile failing is correct evidence. Worth confirming slot A agrees rather than adding a git query.

## Q3 — one leaf or two

### Pick
One leaf, two commits (split at the Q1/Q2 seam). Both diffs are small and sit on the same surface — `src/config.ts`, `docs/guide/setup.md`, `skills/init-akrogon/SKILL.md`, `tests/config.test.ts`, `tests/init.test.ts` — and share one done-story: a config that cannot work is refused or derived at the source, naming the key. Two leaves would double plan/check/merge lifecycle cost and race each other on setup.md and the shared test fixtures; nothing in either fix is independently revertible-in-practice (a repo blocked by Q1's refusal still needs Q2 to pass verify). The counter-risk — a reviewer wants (a) but not (b) — is absorbed by the two commits, which let the leaf drop either half cleanly.

### Rejected
- Two leaves. Clean per-issue accounting, but the implementation units share files and the leaf overhead exceeds the combined diff. If convention demands one issue → one leaf, split at the boundary above; the fixes are already mechanically independent.

### Evidence
- File overlap derived from the evidence lists above (config.ts, setup.md, SKILL.md, config/init tests appear in both fixes). Inspected. Better than training.
- Leaf lifecycle cost: chart structure (one fork → leaf flow) — model knowledge of this repo's conventions; no stronger source read for the leaf-size convention itself.

### Pitfalls
- P1: leaf bundles two fixes, so a red on either half blocks the merge. Removed by the two-commit split as the rollback/drop boundary.

### Question I'd ask
Q: does the door want `akrogon install` shipped in the same release that starts refusing in-checkout roots? Gljive needs both to unblock; sequencing doesn't matter technically, but the operator-facing story is cleaner if refusal and derivation land together.
