# Review A: records-sync

Base `c53f6196533289555518577f08907ec9c713721c` · Reviewed head `d6ea570`

Evidence: full suite run by A during implement (`akrogon run-check test`: 800 pass / 0 fail, `/tmp/records-sync-final2.log`), plus two fresh shell probes on scratch repos reproducing both defects (output quoted below). `Test-Change` trailers on `9e28d73` and `2bc2e09` checked: both cite their authorization (plan-authorized updates; planner corrections to planned tests) and each names the one changed file — both conform.

Verdict: **fix**

## Fixes

### F1 — `reset --keep` silently drops a commit made between HEAD capture and the move

`src/self-update.ts`: `gitStage` captures `local` (HEAD) *before* `integrate` takes the global `.lock`, classifies commits under the lock, and `after` → `moveCheckout` runs `git reset --keep moveTo` using a fresh `HEAD` read but with no ancestry guard. `reset --keep` preserves uncommitted edits but silently moves the branch over committed-but-unclassified history.

Probe (scratch repo, HEAD=`a039729` containing commit "external commit" with file `f2`, target `e6c241c` lacking it):

```
git reset --keep e6c241c → exit 0
f2 exists: NO; log shows only 'incoming' and 'base' — the external commit is dropped from the branch
```

Realistic source: the design itself — an operator commits in the root checkout, or any writer lands a commit between the lock-free HEAD capture and the locked `after` move (the window spans `gitStage`'s fetch + lock acquisition). This is a concurrency/data-loss path in the exact "files agents are writing" territory the brief protects. Consequence today: a real commit vanishes from the branch (reflog-recoverable, silent). Hits the brief's core guarantee (self-update never disturbs local work; design D3/D6 "keeping local history").

Repair direction: capture the replay tip (`local`) inside `.lock` (in `move`, via fresh `rev-parse HEAD`, not the pre-lock capture), and in `moveCheckout` refuse the reset when HEAD is not an ancestor of `moveTo` (`git merge-base --is-ancestor HEAD moveTo` → `pending`), never silently moving over it.

### F2 — content-equal rescue leaves clean-changed files stale (`reset --mixed` doesn't touch the worktree)

`src/self-update.ts` `moveCheckout`: when `reset --keep` refuses and every *colliding* path is content-equal, the rescue runs `git reset --mixed moveTo`. `reset --mixed` rewrites index only — clean files that differ between HEAD and `moveTo` keep their old bytes, ending "moved" with phantom-dirty stale files.

Probe (f1 dirty-but-equal-to-target, f2 clean-and-changed HEAD→target):

```
git reset --keep NEXT → refuses on f1 (correct)
git reset --mixed NEXT → ' M f2', f2 still contains w1 (target has w2)
```

Realistic source: the pending test's own second-trigger shape — incoming touches two files, one dirty-equal, one clean — produces a checkout that reports `deployed` while `f2` holds old bytes, i.e. the desync this leaf exists to eliminate, plus a phantom dirty file blocking the next move. Consequence today: wrong file contents + a false "moved" line. Hits criterion 1/3 (checkout at the pushed commit with incoming applied).

Repair direction: run the rescue only when `colliding.length === changed.size` (every changed path is a dirty collider); otherwise `pending`. Alternatively rescue via per-path `git checkout moveTo -- <clean-paths>` — the gate is smaller.

## Nits

### N1 — "prints one line per checkout" overstated

`docs/guide/install.md` and `README.md` say the step "prints one line per checkout"; non-own repos print nothing on a no-op (`line !== null` guard). Deferred: outcome wording is otherwise accurate; evidence to promote: an operator reports missing lines as a defect.

### N2 — two fetches on work paths

The light-path fetch plus `integrate`'s locked fetch means an ahead/behind checkout fetches twice per trigger (design's cost note targets one per pass per repo). Deferred: correctness unaffected (push rejection covers drift); evidence to promote: measured fetch latency on a real remote.

## Docs check

Affected docs read against the diff: `install.md` self-update paragraphs and `README.md` match the implemented outcomes (`deployed`, `pushed`, `checkout pending`, `record conflict`, `current`, hazard refusal wording); remedies for wrong branch, detached HEAD, code commits, overlapping edits retained. `docs/guide/files.md` correctly untouched (`akrogon sync` unchanged). No dead pointers found; `src/AREA.md` mentions no `integrate`/`selfUpdate` signature, so no AREA.md update owed.
