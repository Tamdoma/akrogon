# Merged map: Tamdoma/akrogon#94

Sources: [A](map-A.md), [B](map-B.md), [C](map-C.md). Tags name the slots whose own lines support each point.

## Facts
- The deletion path is real and deterministic: a registered git worktree under the store or legacy root that matches no leaf, closed-leaf slug, live verify record, batch attempt or active worker falls through to `removeWorktree` when no pane cwd is inside (src/reconcile.ts candidate sweep) (A,B,C).
- The rule is inverted today: an unregistered folder is kept as `unknown directory` (tests/reconcile.test.ts:188), while a registered checkout someone made on purpose is removed once clean (A,B,C). Existing tests remove registered variants on purpose (tests/reconcile.test.ts:493-504) (B,C).
- `worktreeRemovable` passes a clean direct attempt between commits; ignored files such as `node_modules` never block (A,B,C).
- Pane cwd does not see agent tool shells. `herdr pane process-info` lists only the terminal's foreground job (B,C). C measured a running `akrogon verify` with cwd inside the direct worktree at 23:20 and no pane inside it (C). A `/proc` cwd/fd scan sees it (C).
- Removals are not recorded: `reconcile` returns `removed`, callers drop it, only kept entries persist. The caller of this deletion cannot be proven (A,B,C). Timestamps suggest a second removal at 23:08 tonight, recreated 23:09 (C, low confidence on sequence).
- The framework attempt `fork-only-effort-pin` was clean and reachable with no durable protection, removable whenever pane inventory was available and no pane sat inside (B,C). It has since landed and its chart reads `Closed 2026-10-15`, so no live direct attempt needs interim protection now (A, checked 23:40).
- `git worktree remove` in reconcile runs without `--force`, so a `git worktree lock`ed worktree survives today's code; a locked worktree needs `--force` twice (C; B cites the git docs).
- The direct route removes its own worktree at landing step 8 and on abandon; it never needs reconcile to clean it (A,B). A growth-stop handoff lets a leaf with the same slug adopt the worktree, which depends on it staying at `<store>/<slug>` (B,C).

## #93 interaction
- store-sweep (plan.synthesis) will rewrite candidate classification: it deletes unowned unregistered items, matches `<slug>-<anything>` by longest known slug prefix, and uses "no leaf of the repo is running" for unowned items. A chart door is not a leaf, so a direct worktree reads as unowned under a literal reading; a direct branch named `<finished-leaf>-x` reads as that leaf's scratch (A,B,C).
- scratch-copy-removal force-removes only named scratch kinds and brings the `/proc` veto helper; it does not touch the fallthrough rule (B,C).
- No blocked-by on the #93 leaves for the keep rule and the lock; #94 and store-sweep decide what a store candidate is, so whichever lands second takes the other's rule as a lock (A,B,C). A leaf that uses #93's `/proc` helper must be blocked-by the leaf delivering it (B).
- store-sweep's brief still names plain `akrogon status` for unprovable items; the operator moved that list to `akrogon leftovers` today (A,B).
- A new keep reason for a live attempt must be added to leftovers' in-use set, or a live attempt shows as a leftover (C).

## Options
Q1. What may cleanup delete among registered worktrees in the store?
- Only akrogon's own kinds known finished (leaf worktree by leaf state, `verify-*`, `batch-*`, `<slug>-u<N>` by record); every other registered worktree is kept and listed by `leftovers` (A,C; reporter's own pick; B lists it as valid O1d and as O2b). Cost: hand-made or crashed worktrees stay until a person removes them; reverses the variant tests.
- Delete any clean one unless it carries a keep declaration (git lock) (B O2a, conditional). Cost: a raw `git worktree add` without a lock is lost once, the a77c260 pattern.
- Reconcile reads charts' `Direct attempt` sections (C pick for direct authority). Cost: markdown becomes a deletion authority, creation gap before the section is written, manual worktrees stay exposed (A,B).
Q2. How does the direct route mark its checkout?
- `git worktree add --lock --reason <chart>` at creation, unlock just before removal at landing or abandon (B; C as interim). Works on today's code, beats prefix and single-force removal, readable in `git worktree list --porcelain`. Cost: a crashed door leaves a locked worktree a person unlocks.
- Chart reading (C). Costs above.
- Nothing extra if Q1 keeps all unknown registered worktrees (A). Cost: prefix collision with store-sweep stays unless that rule excludes registered worktrees on their own branch.
Q3. When may a direct worktree's protection end?
- Only when the door removes it (landing step 8, abandon) (A,B). A crash leaves it listed in leftovers.
- Reconcile may also remove it once the chart's last marker is `Closed` or `Held` (C). Not on `Handed off`, because a leaf adopts it.
Q4. Process veto: every deletion also needs no same-user process with cwd or open file inside, reusing #93's `/proc` helper (B,C). A: needed for akrogon's own kinds, not for foreign ones under Q1's first option.
Q5. Record removals: append each removed registered worktree with time, rule and caller (A,C). B: useful, separate scope.
Q6. Direct worktrees stay in the store (B,C), for growth-stop adoption.
Interim: B P5 proposed a proven `git worktree lock` backfill as a deploy step for any live attempt (B). Moot tonight: the attempt landed.
Landing: own small leaf now, not blocked by store-sweep; store-sweep's plan takes its rule as a lock (C; A,B agree no blocked-by).

## Pitfalls and what removes each
- Prefix or force removal of a direct branch: lock honored before any classification; done-criterion with `verify-x`, `batch-x`, `<leaf>-u1`, `<leaf>-x` names (A,B,C).
- Idle attempt with no process or pane: durable rule (Q1/Q2), not liveness (A,B,C).
- Lock without release: door unlocks right before its own remove; a failed remove leaves it locked and reported (B).
- A lock only binds `git worktree remove`. Every store deletion must go through it and never pass `--force` past a lock, or a filesystem remove of a misclassified entry ignores the lock (C).
- Unreadable evidence read as "no owner": pane-unavailable and failed reads keep with a reason (B).
- Regression proof: reconcile tests over `next` and `tab_closed`, real git fixtures, no real store (A,B).

## Where slots differ
- D1. Authority for a live direct attempt: default keep of unknown registered (A), git lock (B), chart reading (C).
- D2. Unknown registered worktrees without a declaration: keep (A,C), remove unless locked (B conditional).
- D3. Reconcile removing an ended direct worktree on `Closed`/`Held` (C) versus only the door removes (A,B).
- D4. Removal record in scope (A,C) or separate (B).

## After rebuttals
- D1: A's keep rule plus B's `git worktree add --lock` as two layers. Keep protects before any mark and across repos, the lock beats store-sweep prefix matching (C changed, B accepts keep as valid). Chart reading dropped as authority (C).
- D2: keep unknown registered worktrees and list them (A,C; B for existing ones, wants the future rule an explicit operator choice).
- D3: only the door removes a direct worktree (A,B,C). Handed off keeps protection until the leaf owns the checkout (B).
- D4: A,C record the last pass's removed registered worktrees (path, branch, head, rule) in the report reconcile rewrites each pass. B: separate scope. Caller label and append-only history out of scope (C).
