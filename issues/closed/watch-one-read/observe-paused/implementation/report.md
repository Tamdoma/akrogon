# Implementation: observe-paused

Slot A, serial-solo. Base `4325f9ce566c5d8588f84b7a214422e1dffe62a0`. Head
`30c755f7198077473c41477f0307bd14391a1a95`. Both refreshes fetched and rebased
onto the same base. No frozen tests changed after `48f8feda`.

- `63e53ad4`, `skills/watch-issues/scripts/observe.ts`: read pause once before stdout.
  Return before inventory/seat/transcript access when paused. Leave row formatting unchanged.
- `30c755f7`, `skills/watch-issues/SKILL.md`: one observe read on start/due and the same
  fail-closed gate on re-reads. No status step. Existing command-error and Never rules stay.
- `30c755f7`, `docs/use/watch-while-away.md`, `docs/pictures/watch-loop.svg`, and
  `skills/AREA.md`: describe the single read and stop rule.

## Free proofs on head

| Criteria | Command | Result and receipt (in this directory) |
| --- | --- | --- |
| C1–C3 | `akrogon run-check --name hc-observe -- bun test --timeout=120000 tests/hc-observe.test.ts` | Exit 0, 5 pass, 3.04s. `check-hc-observe-1795642818618-3585119.log`. |
| C4/C5/C7 | `akrogon run-check --name watch-timer -- bun test --timeout=120000 tests/watch-timer.test.ts` | Exit 0, 22 pass, 26.85s. `check-watch-timer-1795642845476-3593634.log`. |
| C5/C6 mechanics | Plan's stand-in shell command, `WATCH_TICK_SECONDS=10` | Exit 0, 1 pass, 90.76s. `check-watch-live-standin-shell-1795642936238-3683740.log`, `e2e-standin-shell/`. |
| C5 | Plan's stand-in root command, `WATCH_TICK_SECONDS=10` | Exit 0, 1 pass, 75.80s. `check-watch-live-standin-root-1795643012034-3914495.log`, `e2e-standin-root/`. |
| Configured checks | `akrogon verify` | Green, 4m51s, run `8b51f111-15c8-4712-852f-72988cff7171`. Setup, format, typecheck and test all exit 0. No merge checks. |

Verify receipts: `check-setup-1795643018492-4005132.log`,
`check-format-1795643022347-4005132.log`, `check-typecheck-1795643025507-4005132.log`,
`check-test-1795643309169-4005132.log`. Planning reds and deliberate breaks are in
`../plan.md`. Static review: observe's paused return precedes all inventory work.
Pause reads and errors never defer to prior rows at the Judge and Consult re-reads.

## C6 paid proof admission

Matched readiness `grants[0]`: one foreground `watch-live-pi-shell` cell, logged-in
Pi harness account, standard cell model `devin/swe-2-max`, throwaway hc session
`akr-e2e-watch`. Paths: one new root under /var/tmp, retained evidence under
`implementation/e2e-pi-shell/`, the grant's temporary core state and Pi transcript.
Use the tier's stop and absence checks. No other harness or provider. No named
credential is missing. A fresh call is needed because the skill and observe output
changed. Budget: `AKROGON_SESSIONS=2` (one launch plus spare),
`AKROGON_SESSION_MINUTES=10` (>2× the longest same-name green at 233341ms).

Paid run root: `/var/tmp/wo.ErEJ8L`.

First attempt: run `abcb5768-8ec4-4093-be23-ec27bd0ea4b1`, watcher `t1`,
Pi session `9b848132-e46b-4037-be47-b1c59286fc8a`. Exit 1, 5m04s,
`check-watch-live-pi-shell-1795643647814-441204.log`. Devin returned
"Reached free model rate limit. Please switch to a different model" before
the first model tool call. The call log is empty. This was a provider red,
not a budget stop, and supplies no current-input model evidence. Tier
cleanup returned `{"left":[]}` in `e2e-pi-shell/absence.json`.

One live-only diagnostic is authorized by the same `grants[0]`. Change
only the requested model to the repo's configured `devin/swe-2-1-max`
on the same Pi account and Devin provider (the provider advised switching
models). Same command name, test, session target, pauses, scope, budget and
cleanup. New observation: a real completed start turn and a tool-subprocess
`call observe t=<turn>`, which the rate-limited run never produced, then
the remaining C6 assertions if it reaches them. No more paid attempts if
this one merely repeats the provider failure. Retain its evidence separately.

Diagnostic run root: `/var/tmp/wo.A1Ij5l`.

Diagnostic: run `0ddd9f2c-d4a2-435f-b0ba-a212bec5d69b`, watcher `t1`,
Pi session `570eb8d8-140f-4bfa-b021-129a7484c45b`. Exit 1, 5m05s,
`check-watch-live-pi-shell-1795643994409-1333847.log`. The configured model
returned the same Devin rate limit at startup, with a reported reset at 22:01 UTC.
There was no model tool call, observe marker or pause verdict in either run.
`e2e-pi-shell-diagnostic/absence.json` reports `{"left":[]}`.

## Blocker and operator action

C6 alone is unverified. The attempted operation was the authorized
`watch-live-pi-shell` against `akr-e2e-watch` using the machine's logged-in
Pi/Devin harness identity. Both attempted models shared the provider rate
limit. Owner: operator of the existing Pi/Devin account. No secret or grant
change was attempted. No known-red pass would supply C6, and the live-only
diagnostic repeated the failure, so lifecycle rules stop further paid launches.

After the rate limit clears, resume the leaf with
`akrogon phase observe-paused implement` (omit `--slot`) and
`akrogon next observe-paused` if it has not dispatched. The remaining action is
the planned C6 shell proof with the same approved identity. Reuse the green free
proofs and verify receipt if the inputs and head have not changed. Review still
needs the actual paused report from the Pi transcript; free tests cannot show it.

## Operator recovery and refresh

The operator moved the leaf from failed back to implement at 22:01:32 UTC,
after the provider's reported reset. Resuming the approved C6 proof, not
repeating the pre-reset diagnostic. Opening refresh moved base
`4325f9ce566c5d8588f84b7a214422e1dffe62a0` → `8ea0ff7320227e1e45785410787481e71989851e`
and head `30c755f7198077473c41477f0307bd14391a1a95` → `b161af407a8612fe953a26d59f0f441465dd2461`.
The frozens and observe implementation are unchanged; upstream changed state,
dispatch, hc code and the watch's direct-leaf guidance, so none of the old
free proofs or verify receipt substitute for this head.

All commands below ran at `b161af407`:

| Proof | Result and receipt |
| --- | --- |
| C1–C3, planned hc-observe command | Exit 0, 5 pass, 2.39s, `check-hc-observe-1795644135455-1720755.log`. |
| C4/C5/C7, planned watch-timer command | Exit 0, 22 pass, 25.15s, `check-watch-timer-1795644160599-1723293.log`. |
| C5/C6 mechanics, stand-in shell | Exit 0, 1 pass, 89.73s, `check-watch-live-standin-shell-1795644250327-1741821.log`, `e2e-standin-shell-resumed/`. |
| C5, stand-in root | Exit 0, 1 pass, 72.52s, `check-watch-live-standin-root-1795644322844-1780929.log`, `e2e-standin-root-resumed/`. |
| Configured checks | `akrogon verify` run `b03f3466-f5e5-4bbb-8aa8-111196b93480`, 3m21s. Setup, format and typecheck green. Test exit 1, `check-test-1795644523592-1862899.log`. |
| Configured retry | `akrogon verify` run `149ba4de-448e-4153-9d98-b22b6bda673c` green, 4m46s. Test `check-test-1795644836278-2455918.log`, format `check-format-1795644555272-2455918.log`, typecheck `check-typecheck-1795644559100-2455918.log`, setup `check-setup-1795644550907-2455918.log` all exit 0. |

The old standalone pin-death case raced hc's finished-watcher report in
the first verify: the unmodified timer exited with "watcher t4 finished"
rather than "pinned process ... gone". The pin fixture launches a plain shell
and timer directly, independent of the changed observe read. The same check
passed on retry, so mark it inconsistent. No test changed.

### Resumed C6 admission

Rechecked `grants[0]`: planned `watch-live-pi-shell` cell on the logged-in
Pi/Devin account, default model, one throwaway `akr-e2e-watch` watcher,
the same 2-session / 10-minute budget, no provider or account change, and
only the tier paths, transcript and retained evidence under
`implementation/e2e-pi-shell-resumed/`. Previous attempts produced no
tool turns and main changed the model-facing skill, so no replay covers C6.

Resumed paid run root: `/var/tmp/wo.97FUFo`.

Resumed run `a942d16f-060f-4c30-9adc-0cfa9e9c4113` at `b161af407`:
exit 0, 1 pass, 4m03s, `check-watch-live-pi-shell-1795645101286-2974222.log`.
Watcher `t1`, timer `t2`, Pi session `654e89a0-fbd0-41d5-a20f-1cd3f4823481`.
The call log and timer screen show exactly one observe per accepted due
(1, 2, 4, 5, 6) and no status call. After empty due 4, due 5 (turn 4)
called `next watch-staged-leaf` and recorded its seat. While the fresh
dispatchable leaf was paused, due 6 (turn 5) made no next call and its
state stayed unchanged. `pi-paused-turn.json` ties the paused due to
`pi-watch-transcript.jsonl`: the successful observe returned
`session=akr-e2e-watch` and `paused=true`, then Pi reported the repo was
paused and it had not acted. Read that report for substance, not wording.
`absence.json` shows `{"left":[]}`. All are under
`implementation/e2e-pi-shell-resumed/`.

The earlier provider blocker is resolved. C1–C7 now have evidence on this
head, and the configured verify receipt is green. No replay or additional paid
launch is needed on these inputs. The live run shows this Pi watcher and
sequence, not other prompts or harnesses.
