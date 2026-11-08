# Review A: watcher-on-hc (check.review, initial, blind)

Base `e3202dff`, reviewed head `92fcae92` (tree identical to `793055a4`; `92fcae92` is a trailer-only empty commit).

## Verification evidence

- `akrogon verify` receipt on `793055a4`: green (setup, format, typecheck, `test` 1270 pass, `implementation/check-test-1794109753674-2119207.log`). A first verify on the same head had 4 fails in `tests/next.test.ts`. The diff since the green verify on `a3eb81b1` touches only SKILL.md, a user doc and `tests/e2e/*.e2e.ts`, which bun's `test` check does not run. The same-command retry was green (`check-test-retry-1794109652450-1792610.log`), so that run is inconsistent, as the report records. No code change since, so I reran nothing.
- Criterion 1: `tests/hc-observe.test.ts` green (`check-c1-observe-1794104642793-79211.log`), and its inputs are unchanged since. Seven mutation logs, each red for the case its condition names (C1.4 address-only needed the label filter removed too, recorded in plan Implementation notes).
- Criterion 2 and 4: `check watch-check-5: 0` on `793055a4` (I-8). Its inputs (SKILL.md, observe, listener, `src/hc.ts`, the e2e files) are unchanged at the reviewed head.
- Criterion 3: agy `{"key":"esc","outcome":"stopped"}` with a live `sleep 600` call on screen (I-1). Codex: `codex-tree.json` holds `sleep 600` under the seat, `hc interrupt` printed `still_working`, and a further `esc` left status `working` (I-3). SKILL.md lists codex notify-only with that screen; claude and pi use `hc interrupt` from P4. I-2 was rightly discarded: its interrupt met a model turn, not a tool call, per the rollout.
- Criterion 5: `check-c5-grep-final-1794109338783-1187734.log`: no match in SKILL.md or the scripts, no `src/shell` import in observe. The only hits are recorded codex output inside `skills/watch-issues/scripts/fixtures/codex-session.jsonl` (test data).
- Criterion 6: duration and replaced tests are recorded in the report. 92.26 s against the 75 s median is explained by identical `test` file sets on `a3eb81b1` (79.84 s) and `793055a4` (92.26 s); this leaf's own cost is about 2.4 s.
- AREA pointers: one listing over `skills/AREA.md` and `tests/AREA.md` flagged only folder-relative names (`scripts/observe.ts`, `scripts/log-tail.ts`, `watch-check.e2e.ts`, `watch-tier.ts`, the chart-issues assets). Each exists under the folder its line names (`skills/watch-issues/scripts/`, `tests/e2e/`). No dead pointer.
- Docs: `docs/use/watch-while-away.md` matches the new start, wake, stop and never-list behavior. No other doc names `OBSERVE_HERDR`, `herdr agent read` or observe.

## Decisions checked

D1 (session via `repoSpace`, refusal on stderr, no `src/shell` import), D2 (labels and recorded address and session via `leafSeats`), D3/D4 (`-` for none, finished or keep shell; `unknown` for null), D5 (`transcriptFor`, existing file, working only), D6-D9, D11 (notice lines untouched), D12 (Never list): implemented as planned. N1 (seat prints `<address>/-` rather than no line) follows the locked design's "is absent" over the brief wording, since observe lines are per leaf. Decision C2 (one check per tick) is reflected in SKILL.md, the user doc and the e2e expectations.

## Grant audit

Eight harness sessions: watch-stop-agy, watch-stop-codex, watch-stop-codex-2, and watch-check through watch-check-5. They match the eight `check-watch-*` logs and eight named run pairs in `issues/timings.jsonl`; the planning runs p1 and p2 reached no paid stage. The bound was 4, then 7. I-5, I-6 and I-8 carry a pre-launch warning in the report, so these overruns are information and the proof stands. I-6's 4th watcher check (then bound 3) arose inside one launch from the fold behavior, could not be warned before launch, was reported, and was answered by operator decision C2, which renewed the per-launch bound to 4. Cleanup: absence files `{"left": []}` for every run, codex rollouts and claude projects folders removed, agy `trustedWorkspaces` entry removed. Retained items match `retained[0..2]`.

## Findings

No Fix.

### Nit N1: codex notify-only still gets the key first

`skills/watch-issues/SKILL.md` (busy rule) names codex in the stop-key list. It sends `hc interrupt` to a "listed kind" before the confirmation step that turns a notify-only kind into a notice. I-3 shows what that key does to codex: the turn is aborted ("■ Conversation interrupted") while the background command keeps running and hc keeps reporting `working`, so the engine will not re-prompt. Deferred because pressing the key, then notifying when the seat does not stop, is today's path, which the design names for a kind that neither key stops. Promote to a Fix with evidence that a real codex seat interrupted this way stayed stuck where a key-less notice would have let it finish.

### Nit N2: unlisted kinds get `hc keys esc` where plan D10 said `hc interrupt`

D10: "a kind ... that the list names `esc` gets `hc keys esc` ... others get `hc interrupt`". The skill gives an unlisted kind `hc keys esc` plus `hc wait`. For a kind that reports status, `hc interrupt` also presses esc, so the key is the same and only the `outcome` field is lost. The confirmation step catches a seat that did not stop. Promote with a real kind where `hc keys esc` and `hc interrupt` act differently.

### Nit N3: observe writes a label

observe is described as the watch's read-only inventory, yet `transcriptFor` writes `akrogon.transcript` on a working seat the first time it resolves one. D5 accepted this as the resolver's documented behavior, and the write is idempotent and harmless when interrupted by the Bash timeout. Promote if a label write is shown to race with another writer of that label.

## Verdict

nits
