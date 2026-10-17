# Review A — check.review (blind)

- Base: 17d61171 (merge-base). Reviewed head: 78c5ed38.
- Diff: 9 files — questions.md, SKILL.md, chart.md prose; peer-wait.ts, peer-restart.ts; fake-herdr + 3 test files; plus planned-red a0d9a194.
- Evidence: `akrogon verify` run by the implement phase printed `verify test: 0`, `verify typecheck: 0`, `verify leaf 78c5ed38: green` (verify keeps its own logs). Live-run records and transcripts read under `implementation/runs/` (committed).

## Criteria check

- Chained wait rule is in questions.md's Blind peer exchange paragraph; observed literally in branch-A.jsonl (4/4 `peer-ask` calls preceded by `wait && wait &&` in one call). No `agent list` appears in that turn; seats.yaml got both post-exchange sessions.
- `session` on outcome lines is the post-exchange read (live: codex `01a14b2b-…`, pi path); restart lines print `'none'` for codex (pre/start) and the pi path — matching tests and the wire contract.
- `exchange` mutation in `finish` (`exchange.session = session` when carried null) mirrors the existing adoption convention and keeps the carried identity consistent on rerun.
- Consultant rule text present in questions.md; consultants read sections via `awk`/`grep` and batched calls in the run evidence; two held-content re-reads observed — the rule is normative prose with no enforcement mechanism, matching the plan's "no test for prose" stance.
- `Test-Change` trailers: present on a0d9a194 and on 78c5ed38 (three files), citing criterion 6 — valid sources.

## Findings

**N1 — peer-restart error path prints a stale `session` value.** In `peer-restart.ts`, when the post-phase `herdr agent list` fails (`after.ok` false), `emit(states)` runs before `state.session` is updated, so a `restarted` seat's line carries its pre-restart session instead of `'none'`, which the contract limits to "the session after the start or `none`". Consequence today: none — the door appends entries only for sessions it has not recorded, so a duplicate-id line produces no wrong seats.yaml entry. Promotion: if the receipt contract is consumed literally (e.g. dedupe removed), the line misreports a stale session as fresh. Fix would be updating sessions before emit or clearing on that path.

**N2 — `peer-wait.finish` adds a failure window to a previously infallible step.** `finish` now `await readPeerAgent(pane)` before printing; a `herdr agent list` failure or missing agent at that instant throws, exits non-zero and prints no outcome line — a completed exchange can be reported as a script failure and rerun, where before the outcome always printed. Consequence today: a rare spurious rerun only (narrow window, the loop's own read just succeeded). Not a defect worth blocking: no outcome is fabricated and the failure is loud, but the extra read is also unnecessary — the last loop read already held the current session, so reusing it would remove the whole window (cheaper and safer). Promotion: if peer-wait runs where herdr is flaky, completed waits start reporting spurious failures.

**N3 — Report cites green logs and run-check names that do not exist.** `implementation/report.md` names `check-peer-{wait,ask,restart}-green-*.log` and the planned `live-usage`, `a-call-tally`, `consultant-read-tally`, `chain-timeout` run-check names; only the `-red` logs exist and the green/tally/probe runs ran directly (`bun test`, ad-hoc transcripts). Consequence today: a reader following the cited paths finds nothing; the same evidence is committed (verify receipt covers test/typecheck green; transcripts are under `runs/logs/`). Promotion: if the evidence record is audited for reproducibility, the citations mislead. Note the plan's own proof rows named those run-check labels, so the gap is plan-vs-execution, filed here rather than as missing verification.

**N4 — Criterion 1 headline Σ is workload-confounded and unstated.** The plan's proof row names `Σ calls × avg context` compared across the two USAGE.md files; branch readme ran 4 exchange types (map, fork notes, rebuttal, leaf review) vs base readme's 2 (map, leaf review), so the raw Σ comparison never holds and is not shown. Consequence today: the savings direction is still demonstrated structurally (1 call per step, zero list reads vs base's `sess()` greps), but the criterion's named number is absent from the report. Promotion: a skeptical reviewer can read the criterion as unproven; a one-line per-step normalization in the report would close it.

## Doc/index check

`docs/guide/chart.md` peer-exchange and restart paragraphs updated and consistent with the new rule; `docs/reference-index.md` names no changed mechanic — no documented behavior changed there. No `AREA.md` in the diff.

## Verdict: nits

All four findings are edge/record-keeping concerns with no concrete wrong output today; every done-criterion has proof (verify green on 78c5ed38; live wire evidence for criteria 2–9; transcript evidence for 1, 3).
