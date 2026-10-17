# review-A: peer-restart

Base: 14ccc59 (origin/main). Reviewed head: 4fa309a. Diff: 4 commits, 6 files (+588/-5).

## Verified

- Criteria 1–3: `akrogon run-check --name 'review peer-restart' -- bun test tests/peer-restart.test.ts` on head → 8 pass / 0 fail; `check review peer-restart: 0 .../check-review%20peer-restart-1792233652104-1268444.log`. Planned tests exist and run in the order plan.md names; each criterion has a failing-catching test: call-order assertions (close C→B, splits right/down with flags, argv array preserved through `--` including the spaced `--append-system-prompt` element, untouched foreign pane), three refusal reasons each with no-close evidence, three failure points each with stop + per-seat states + failed command on stderr.
- Criterion 4: SKILL.md `## Open` carries trigger set (entry, re-entry, collected exchanges, never compaction-only, never dropped), the sole supplied-pane close exception, printed-pane usage, seats.yaml rule (letter kept, appended on new session, never null), and both failure results; Autopilot drop list names the restart condition; questions.md + chart.md carry the exchange/operator-facing lines. Prose sweep found no stale "supplied panes never moved" outside the touched files.
- `akrogon verify` green on 4fa309a (format/test/typecheck; receipt exists for the check.review gate). The earlier red verify on af9316a was a real diff-caused defect (TS2322 signalCode), fixed in 4fa309a and re-verified.
- Read-before-mutate contract holds structurally: every refusal check (no agent, unique leader, history tokens per kind, derived-name held outside) runs inside the read loop before the first `pane close`.
- Contract details traced against live herdr: `agent list` emits `name` only for named agents (fake matches via `agent_name`); `process-info` schema matches the real `foreground_process_group_id`/`foreground_processes[].{pid,argv}`; trailing `--` is legal for zero argv; derived names satisfy `invalid_agent_name` lowercase regex.

## Judged, not findings

- Mid-split/start failure reports `closed` with `new: null` even when the replacement pane exists — that is the design's explicit output contract (`new` null unless `restarted`), exercised by the test.
- questions.md "a non-zero script exit alone does not identify a consultant to drop" stays true under autopilot: the restart drop is named separately in SKILL.md `## Autopilot` where the seat mapping exists.
- AREA.md files name areas, not script lists; none stale.
- Read-phase herdr failures (`agent list`, `process-info`) print `untouched` seats and exit non-zero — not a named criterion case; consistent with the refusal contract (nothing closed).

## Findings

None. No Fixes, no Nits, no operator actions.

Verdict: **ready**
