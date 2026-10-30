# Review B: peer-pane-anchor

Date: 2026-10-29. Phase: `check.review`. Verdict: **ready**.

Base: `dedbc3812409b47bac579d4cd0112caed05103b2`.
Reviewed head: `07390ad3e195f5895af08ab68c483ac02aae0538`.

## Findings

No Fixes or Nits. No operator actions or unresolved questions.

Reviewed the whole diff against the brief, locked design, plan D1–D7 and implementation report. Each entry checks the inherited pane before its first herdr operation. The three A-pane arguments are compared before mutation. The detached reset child retains its existing verified-env path without checking its new ancestry. Existing herdr argument lists are unchanged. The shared helper uses real `/proc`, parses the parent field after the last closing parenthesis, and refuses missing panes, missing env and ancestry misses with the required context. The fake's default hashed shell-pid path remains intact.

Opened `docs/reference-index.md`, the relevant chart skill and `skills/chart-issues/assets/questions.md`, plus the standing design. No documented successful behavior changes for verified pane environments. The existing nonzero-exit stop contract covers the new refusals. No AREA file or lesson is changed in the reviewed diff.

## Verification

Read the cited logs back with `akrogon log`. The report's final `akrogon verify` covers the reviewed head after the last test-file edit:

- `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-format-1793261544704-1633744.log` — formatting passed. This is the actual saved filename, correcting the report's abbreviated format-log timestamp.
- `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-test-1793261617123-1633744.log` — 1,262 tests passed, zero failed, including all five script suites and seat containment.
- `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-typecheck-1793261619673-1633744.log` — TypeScript passed.

The planned file suites were run by the implementation workers and grouped lane reruns. The final configured test command runs those same suites without filtering. The only subsequent test edit, `07390ad`, changes formatting, and the full test run above follows it. No configured runner, planned case, assertion, skip or filter was disabled.

Criteria 1–3 are supported by the reviewed CLI assertions and these saved results:

- `check lane-peer-ask-wait: 0 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-lane-peer-ask-wait-1793261422844-1255727.log` — 52 passed, including cross-session and non-ancestor refusals, peer-ask's spawned peer-wait and standalone reruns.
- `check lane-peer-restart-create: 0 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-lane-peer-restart-create-1793261426041-1309940.log` — 22 passed, including A-pane mismatch with no mutation and live fixture process groups left alive on refusal.
- `check lane-door-reset: 0 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-lane-door-reset-1793261430751-1312606.log` — 45 passed, including the detached child finishing reset and start after its parent exits. Its second-read decoy would reject an added child ancestry check.
- `check plan-fake-herdr-seat-containment: 0 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-plan-fake-herdr-seat-containment-1793261103984-1169195.log` — all 11 default-path cases passed, also covered by final verify.

Read the five planning red logs. They show the missing guard on the base, including prompting/restarting/splitting instead of refusing, and A-pane mismatch failures:

```text
check plan-red-peer-ask: 1 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-plan-red-peer-ask-1793261031082-1059204.log
check plan-red-peer-wait: 1 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-plan-red-peer-wait-1793261083645-1104542.log
check plan-red-peer-restart: 1 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-plan-red-peer-restart-1793261086787-1161430.log
check plan-red-peer-create: 1 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-plan-red-peer-create-1793261089647-1163911.log
check plan-red-door-reset: 1 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-plan-red-door-reset-1793261091896-1164568.log
```

Criterion 4 was independently repeated from B's real pane on the reviewed head, local user `ivan`, herdr `0.9.1`. These are local reads under the design's explicit no-grant requirement. No resources were created, retained or left for cleanup. Passed the inherited non-secret `HERDR_ENV`, `HERDR_PANE_ID` and `HERDR_SOCKET_PATH` explicitly through `env` in run-check argv, because run-check's constructed env omits them. Its scope runner preserves process ancestry. Ran the configured locked setup before dependency-using proofs.

```text
akrogon run-check --name review-b-live-anchor -- env HERDR_ENV="${HERDR_ENV:-}" HERDR_PANE_ID="${HERDR_PANE_ID:-}" HERDR_SOCKET_PATH="${HERDR_SOCKET_PATH:-}" sh -c 'test "$HERDR_ENV" = 1 && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c "bun install --frozen-lockfile --backend=copyfile" && herdr --version && bun skills/chart-issues/scripts/peer-anchor.ts'
check review-b-live-anchor: 0 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-review-b-live-anchor-1793261751391-1990416.log
```

Output: `herdr 0.9.1`, then `w8:pXP`. The product accepted B's actual pane ancestry.

Read-only `herdr session list --json` confirmed that `personal` is running before using its returned socket path:

```text
check review-b-live-sessions: 0 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-review-b-live-sessions-1793261758526-1990753.log
akrogon run-check --name review-b-live-wrong-session -- env HERDR_ENV="${HERDR_ENV:-}" HERDR_PANE_ID="${HERDR_PANE_ID:-}" HERDR_SOCKET_PATH=/home/ivan/.config/herdr/sessions/personal/herdr.sock sh -c 'test "$HERDR_ENV" = 1 && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c "bun install --frozen-lockfile --backend=copyfile" && bun skills/chart-issues/scripts/peer-anchor.ts'
check review-b-live-wrong-session: 1 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-review-b-live-wrong-session-1793261769654-1991681.log
```

The intended refusal names `HERDR_PANE_ID=w8:pXP`, the personal socket path and herdr's `pane_not_found` answer. It performs only the process-info read. This expected negative proof is not a failed configured check. No full-suite rerun was needed because the current-head verify evidence is complete and no code changed during review.

## Test-Change trailers

Listed from `dedbc3812409b47bac579d4cd0112caed05103b2..HEAD`, checked using `src/test-files.ts`:

```text
4cf14c2e
Test-Change: tests/fake-herdr.ts pane process-info answers a per-pane shell_pid fixture (plan D5); hashed default path untouched, seat-containment stays green
Test-Change: tests/peer-ask.test.ts anchor env in setup, caller pane seed, criterion-1 refusal cases and the anchor-call order ahead of agent list (criteria 1/3)
Test-Change: tests/peer-wait.test.ts anchor env in setup, caller pane seed, criterion-1 refusal cases (criterion 1)
Test-Change: tests/peer-restart.test.ts anchor env in setup, caller pane shell_pid, criterion-1 refusal and criterion-2 A-pane mismatch cases
Test-Change: tests/peer-create.test.ts anchor env in setup, caller pane shell_pid, criterion-1 refusal and criterion-2 A-pane mismatch cases
Test-Change: tests/door-reset.test.ts anchor env in setup, caller pane shell_pid, criterion-1 refusal, criterion-2 pane mismatch and criterion-3 detached-child decoy cases

07390ad
Test-Change: tests/peer-ask.test.ts prettier rejoin only, no expectation changed
Test-Change: tests/peer-create.test.ts prettier rejoin only, no expectation changed
Test-Change: tests/peer-wait.test.ts prettier rejoin only, no expectation changed
```

All six original-file edits have trailers. The fixture and setup changes directly support plan D5–D6 and the brief's refusal and preservation criteria. The two old call-order assertions retain their original list-before-prompt requirement after the new anchor read. The style commit changes whitespace only. No old behavior assertion was removed or weakened without its cited criterion.

## Result

Ready. No repair, new test, lesson or code commit is required from this seat. Submit `merge --slot B --verdict ready`; the command owns the aggregate phase result.

## Merge B: 2026-10-29

Attempt: `e86c02f4-50ae-4869-8e2f-8cc6cad6fcb8`. Applied rebase target: `dedbc3812409b47bac579d4cd0112caed05103b2`. Reviewed head, supplied top and tested head remain `07390ad3e195f5895af08ab68c483ac02aae0538`. Worktree clean. No fetch, rebase, code edit or commit by B.

The command-owned run `69f0bdaf-031a-4222-b0c2-7321cb487ee8` ran `akrogon verify --attempt e86c02f4-50ae-4869-8e2f-8cc6cad6fcb8` and returned red. Its failing command, exactly as invoked, was `bun test --timeout=30000 --parallel=4 --no-isolate`:

```text
verify test: 1 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-test-1793261972155-2007902.log
(fail) a verify pass survives its caller being SIGKILLed mid-check and finishes like an uninterrupted run
tests/run-units.test.ts:989: expect(existsSync(receipt.path)).toBe(false)
Expected: false
Received: true
1261 pass, 1 fail
```

Read this log with `akrogon log`, inspected the test and compared the diff. The test observes a completed receipt before checkout removal, so its immediate absence assertion can race cleanup. Neither this test nor its lifecycle implementation (`src/run-check.ts`, `src/verify.ts`, `src/verify-pass.ts`, `src/scope.ts`) changes in this leaf. The leaf only adds the peer-script ancestry check and its fixtures. No plausible causal path from the diff to this cleanup observation was found.

Under merge-issue's unchanged-head retry rule, ran the same `akrogon verify --attempt e86c02f4-50ae-4869-8e2f-8cc6cad6fcb8` once. Run `a1e4fabd-54d0-46c5-ab60-acb83ab8ed7d` returned green on the same head:

```text
verify setup: 0 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-setup-1793262019142-2316843.log
verify format: reused 69f0bdaf-031a-4222-b0c2-7321cb487ee8 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-format-1793261897348-2007902.log
verify test: 0 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-test-1793262089319-2316843.log
verify typecheck: reused 69f0bdaf-031a-4222-b0c2-7321cb487ee8 /home/ivan/Work/infra/akrogon/issues/open/peer-session/peer-pane-anchor/implementation/check-typecheck-1793261974526-2007902.log
verify merge 07390ad3e195f5895af08ab68c483ac02aae0538: green
```

Read the retry test log and reused format/typecheck logs with `akrogon log`. All 1,262 tests passed, including the previously failing cleanup case. Disposition: **inconsistent**, with both runs preserved above. No known-red comparison or base-red filing is warranted after a green retry. No advisory commands are configured.

Completion owner: issue `peer-session`. Gathered its `ISSUE.md` and its sole leaf brief, `peer-pane-anchor/brief.md`. The shipped outcome is refusal of stale or mismatched terminal context before peer prompts, creation, restart or reset, while valid peer flows and detached reset handovers continue to work. Proceed with the current attempt's `merged --check` and command-owned push.

`akrogon phase peer-pane-anchor merged --slot B --check --attempt e86c02f4-50ae-4869-8e2f-8cc6cad6fcb8` returned `ok`. No gate or trailer repair was needed.
