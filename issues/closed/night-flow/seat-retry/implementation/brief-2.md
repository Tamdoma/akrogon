# Unit 2: guide corrections — delivery faults retry and never fail the leaf

Worktree: /home/ivan/.akrogon/worktrees/akrogon/seat-retry-u2
Leaf: seat-retry, akrogon repo, base `c53f619`, HEAD `f2fba96`.

## 1. Goal

Implement plan decision D4 of `plan.md` (leaf folder `/home/ivan/Work/infra/akrogon/issues/open/night-flow/seat-retry/plan.md`): the operator guide stops claiming prompt delivery failures move a leaf to `failed`. Three sentences are stale.

## 2. Acceptance criteria

1. `docs/guide/next.md` :133: "Each dispatch pass makes at most one delivery attempt per pending seat. Repeated delivery failures can put the leaf into failed. Running next again does not resume a failed leaf. Read its cause and choose a recovery phase first." → replace so it says each pass makes at most one delivery attempt, a failed delivery records the error and attempt count and retries on the next pass, delivery faults never move the leaf to `failed`; the "running next does not resume a failed leaf / recovery phase" sentences still apply to leaves failed for other causes and must remain.
2. `docs/guide/limits.md` :36: replace "Repeated failed prompt deliveries count toward failure" with the record-error/count-and-retry statement; keep "A blocked or unknown agent is not treated as idle" and the permission-dialog clause untouched.
3. `docs/guide/problems.md` :18: the sentence "A delivery failure needs a usable seat." sits inside the failed-leaf paragraph. Delivery faults no longer produce a failed leaf; remove that one sentence (or rewrite the paragraph so no delivery-fault recovery is described as needing one). Keep the human-only-blocker sentence and "Repairing ... does not change the phase automatically" — other failure causes still exist.
4. No other doc line claims delivery faults fail the leaf. Verify by `grep -rn "delivery" docs/guide/` after editing.
5. Prose matches guide style: plain sentences, no new sections or lists.

## 3. Read-first list

- `docs/guide/next.md` :125-145 (order-of-decision section containing :133).
- `docs/guide/limits.md` :30-40.
- `docs/guide/problems.md` :14-24.
- `docs/guide/state.md` :50-58 (read for consistency; its "A prompt delivery failure and a seat-declared blocker are different failures" stays — it describes `failure` records of other causes).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `docs/guide/next.md`, `docs/guide/limits.md`, `docs/guide/problems.md`. Nothing lands before this unit; disjoint from unit 1 (`src/next.ts`) which shares wave 1; no shared test resource.

## 5. Do-not, reasons and exceptions

- Do not edit `skills/watch-issues/SKILL.md` — its `failed=<cause>` lines describe other causes; design excludes it.
- Do not edit `docs/guide/state.md`, `in-practice.md`, `phases.md` or `merge.md` — their delivery mentions describe recovery of other failure causes or unrelated broadcasts; still correct.
- Do not rewrite paragraphs beyond the stale sentences — minimal diff, docs only.
- Do not touch code or tests — locked or owned by another unit.
- A mismatch names the conflicting requirement and smallest brief correction; return it instead of working around. Exception: a revised brief from A authorizes the change.

## 6. Ordered steps

1. Read the three files' surrounding paragraphs.
2. Apply the three edits (AC1-3).
3. `grep -rn "put the leaf into failed\|count toward failure\|needs a usable seat" docs/` — zero hits.
4. `git diff` review for style (AC5).
5. Commit only the three files; return the commit id.

Advisory size: 3 files, ~5 changed lines, under 10 turns.

## 7. Commands

```sh
AKROGON_BASE=c53f6196533289555518577f08907ec9c713721c bun test --changed="$AKROGON_BASE" --timeout=30000
```

(install deps first with `flock "$(git rev-parse --git-path akrogon-install.lock)" bun install --frozen-lockfile` if `node_modules` is missing; doc-only diffs may produce no changed tests — that is a valid result; also run `bun test tests/docs-links.test.ts --timeout=30000` since guide files changed)

## 8. Done-when, evidence and report

All 5 criteria hold; `docs-links` test green; one commit containing the three doc files; grep shows no stale claim remains.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
