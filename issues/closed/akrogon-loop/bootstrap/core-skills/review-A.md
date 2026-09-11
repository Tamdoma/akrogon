# Review A: core-skills

Phase check.review, slot A, 2026-09-10. Debate was off, so no positions-A.md or rebuttal-A.md exist. Reviewed the whole diff of branch `core-skills` against main.

Base: 6e505a9 (main). Reviewed head: 36108aa (two commits, 5585ce8 and 36108aa). Worktree clean.

## Verification run by A

- Root `bun test` in the worktree: 6 pass, 0 fail, 35 assertions, one file. Matches `implementation/full-suite.txt`.
- `bun run typecheck` in `skills/broadcast-issue`: exit 0.
- `cmp` of `skills/implement-issue/ponytail.md` and `skills/check-issue/ponytail.md` against the leaf's `ponytail.md`: identical, 32 lines.
- `git diff --check main...HEAD`: clean.
- `skills/consult-issue` and `skills/explain-issue`: absent. The six intake skills remain.
- Line counts of the five skills: 54 to 68 lines each. Word counts 465 to 748, well under 4k tokens. Rule-sentence count is the operator's one-time check and is not claimed here.
- Every markdown link inside the five owned folders resolves.
- Grep of the five owned folders for gate, audit, QA pass, driver, series, category, handoff file, `akrogon next`, old phase names and `.scripts`: no hits.

## Done-criteria walk

1. Compaction first line present in all five skills. Sizes under the caps by inspection.
2. Phase sections use the routing names. Each section ends with `akrogon phase <slug> <next> --slot <A|B>`, check.review adds `--verdict`, and each skill ends with the two printed lines. No skill runs `akrogon next`, reads pane text for state, or parses YAML. Settings come from `akrogon config`.
3. `brief-template.md` has the eight sections: interfaces in section 4, the mismatch rule with its exception in section 5, an advisory size in section 6, `test_changed` only in section 7, and the four-line skeleton at the end of section 8. `worker-protocol.md` has the launch line with brief path, worktree path and the one reminder, the send-back of a report missing any of the four contents as a worker turn with no `fix_rounds` change, mismatch handling by B, the red full suite as one more sub-brief, and B's self-repair on the last round. Inline and standalone are covered in SKILL.md. Template and protocol reference nothing outside the skill folder.
4. check-issue: A reads its own positions and rebuttal first when they exist, a Fix cites a done criterion, failing check or reproducible defect, a position-only argument is a Nit, re-check reads the repair diff only, docs, index lines and lesson claims are verified, mocks of the unit under test and wording tests are rejected, and the diagnosis paragraph is appended on `moved failed`.
5. merge-issue: the reusable Nit becomes a lesson line plus history file, rebase on `<remote>/<default_branch>` from config, all `checks` rerun, fast-forward push only, ancestry check on a lost reply via `git merge-base --is-ancestor`, findings into `review-A.md` and `check.fix` on conflict or red checks, same-line index conflict keeps both entries, `akrogon phase <slug> merged` after the push, broadcast writer spawned once only on `issue complete`.
6. No removed machinery found in the five skills. The fresh-agent read is the operator's.
7. Ponytail copies verbatim, retired folders deleted.

## Sender

`discord-send.ts` reads secrets from the env file path only, so a missing file throws ENOENT and a missing or non-Discord value throws a named error before any request. Process environment cannot override the file, proven by the test that sets `PRIMARY` in the child environment and still observes the file's URL. One retry per target with a warning, then an AggregateError with the redacted failure. Successful targets are not resent. The no-record test asserts the exact file set of an isolated temp root after a run. Tests run the sender as a real subprocess with `fetch` replaced at one boundary. No test asserts skill wording.

## Findings

No Fix. Nothing cites a done criterion, a failing check, or a reproducible defect.

Nit N1: `skills/seed-issue/SKILL.md` line 143 links to `../consult-issue/series-materialization-reference.md`, which this diff deleted, and `skills/init-issues/scripts/sync-payload.ts` lists `consult-issue` and `explain-issue` as payload skills. These are real dangling references introduced by the deletion. Reason for Nit: the brief says those skills stay until their own leaves and the plan's do-not forbids touching them, so the fix belongs to the seed-issue and init-issues leaves.

Nit N2: `skills/implement-issue/SKILL.md` line 23 lists the settings read from `akrogon config` without `test_changed`, while line 35 and template section 7 rely on it. A reader could miss where the changed-tests command comes from. One word to add.

Nit N3: `skills/broadcast-issue/SKILL.md` carries the peer-question paragraph, but the writer is a subagent with no peer pane. Harmless, adds a rule sentence to a skill that the operator counts.

Nit N4: root `bun test` finds the sender test only after `bun install` in `skills/broadcast-issue`. The skill documents the install for sending, and the brief's limitations name it. Acceptable until the command leaf defines `checks`.

Verdict: nits

## Re-check after fix round 1

Slot A, 2026-09-10. State read: phase check.review, fix_rounds 1. Inspected only the repair diff, 36108aa..180d4ca, one commit touching `scripts/discord-send.ts` and `scripts/discord-send.test.ts`. Worktree clean.

B's F1 (response-body failure bypassed the retry): resolved. `deliver` now catches a TypeError thrown while reading a non-success response body and converts it to a DeliveryError carrying target, HTTP status, redacted message and request, so `sendWithRetry` retries once and `main` collects the final failure and continues to the next target. Non-TypeError errors still propagate, matching the existing fetch boundary. Two new scenarios run the sender as a subprocess with an erroring ReadableStream body: one proves retry then continuation to the next target with exit 0 and three requests, the other proves one retry only, final failure exposed with status 502 and redacted secret, and the remaining target still attempted.

Verification by A: root `bun test` 8 pass, 0 fail, 48 assertions. `bun run typecheck` exit 0. `git diff --check` on the repair range clean. Output saved by B in `implementation/fix-round-1-suite.txt`.

No defect introduced by the repair. My earlier Nits N1 to N4 are unchanged and stay Nits.

Verdict: ready
