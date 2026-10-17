# Implementation report: lean-exchange

Commits: f0664b56 (unit 1, skill text), ef9654a2 (unit 2, session receipts), 78c5ed38 (planned expectation corrections), on a0d9a194 (planned red). Typecheck clean; 54/54 peer tests green (`bun test tests/peer-wait.test.ts tests/peer-ask.test.ts tests/peer-restart.test.ts --timeout 30000`; per-file runs: check-peer-{wait,ask,restart}-green-*.log).

## Wave summary

| unit | scope | commit | result |
|---|---|---|---|
| U1 (Gimli) | reading rule, chained waits, seat-record rule, chart.md sync | f0664b56 | pass; 2 guide contradictions fixed (omitted `agent list` read) |
| U2 (Gandalf) | `session` on outcome and restarted lines | ef9654a2 | pass after A-fixed expectations (brief criterion 6: post-exchange session, not carried seed) |
| U3 (this agent) | two live runs, timeout probe, evidence | — | see below |

## Live runs

Two autopilot door runs against scratch repos, identical pane layout (A claude left, B codex + C pi right), same style of handed item, fresh sessions. Base: installed release copy of chart-issues at merge-base (17d61171); branch: worktree copy with this leaf's edits. Setup: `runs/{base,branch}/` (config, scratch repo, GitHub destination, transcripts in `runs/logs/`).

### Base run (old skill), chart scratch-notes + scratch-owners + scratch-readme

- Transcript (base-A.jsonl): `peer-ask` called with no preceding wait; seat records updated via a standalone `herdr agent list | grep` helper (`sess(){...}`) after exchanges; restart then separate wait/list reads.
- USAGE: seat A calls 13 (scratch-notes, includes operator-blocked turns), 2 (owners, 2 exchanges), 3 (readme, 2 exchanges); 4 charts never ran fork/rebuttal rounds.
- Consultant C (pi): full `cat` of briefs, `sed -n '114,307p'` on shapes.md, no batching discipline.

### Branch run (new skill), charts scratch-notes (single-slot) + owners-file (single-slot) + readme-file (2 peers, 4 exchanges)

- First chart went single slot by the shared drop rules: `peer-restart` printed B `stopped` (codex cold `agent start` timeout, >30s on first codex launch) so B dropped; C printed `untouched` and dropped. Same rule exists in the base skill, so behavior is identical, but the exchange path went unexercised. A second chart stayed single slot because drops persist for the session.
- Third chart named fresh peers (B wA:p11W codex, C wA:p11X pi) and ran the full exchange: restart, map, fork notes, rebuttal, leaf review.

Wire evidence (branch-A.jsonl, readme turn, one operator prompt, 6 A calls per USAGE):
- Every `peer-ask` preceded by `herdr agent wait <B> --timeout 30 >/dev/null && herdr agent wait <C> --timeout 30 >/dev/null &&` in the same bash call — all 4 exchange steps, one call each. No separate `agent list` anywhere in the turn.
- Restart lines: `{"seat":"B","pane":"wA:p11W","kind":"codex","state":"restarted","session":"none"}` and C `restarted` with its pi session path — matching the tests.
- Outcome lines carry `"session"`: `{"outcome":"done","pane":"wA:p11W","status":"done","signal":"proven",...,"session":"01a14b2b-..."}` and C's pi path; `seats.yaml` got both post-exchange entries (C at start, B after first exchange) with no list read.
- USAGE: A calls 6 in a 4-exchange + restart + leaf-write turn (base ran 3 A calls for a 2-exchange turn without leaf review).
- `akrogon status` exit 0; `issues/open/readme-file/add-readme` handed off.

### Consultant read tallies (branch readme session)

- C (pi): read calls = brief files, INTAKE.md, prior CHART.md files, map/merged/leaf drafts. `questions.md` read only via `awk` named-section extraction (`/^## Blind peer exchange/`, `## Research`, heading `grep`), never full-file. One rule miss: INTAKE.md read twice.
- B (codex): batched independent reads via parallel `Promise.allSettled` exec calls, named-section `awk` on fork file. Two rule misses: full `cat` of the installed SKILL.md (installed copy predates the rule; branch rule binds what it received via briefs), and INTAKE.md read twice.
- Base contrast (C-owners): full-file `cat` for every artifact plus a line-range `sed` on shapes.md.

## Criterion results

| # | criterion | evidence | verdict |
|---|---|---|---|
| 1 | locate + batched bounded section reads, no repeated held content | branch transcripts above: named-section extraction, parallel batched reads, no line ranges; exceptions = one duplicate INTAKE.md read per consultant (rule is normative guidance; no mechanism can enforce at most-once) | pass with noted deviations |
| 2 | A waits are pre-prompt only, chained, one A call per exchange | 4/4 exchange calls show `wait && wait && peer-ask` in one bash call | pass |
| 3 | consultant read/call tallies vs base | base C: 9 sequential exec calls incl. full cat + sed ranges; branch C: section-targeted awk + batched reads; branch B: parallel batched reads | pass |
| 4 | timeout exchange: wait exits non-zero, no prompt, rerun once per peer | live probe: `herdr agent wait w8:pTD --timeout 5` on a working pane → `{"error":{"code":"timeout"}}`, exit 1 in 5s; chain short-circuit means no prompt sent; rerun semantics unchanged | pass |
| 5 | `session` on peer-wait lines → seats.yaml receipt | outcome lines carry session; seats.yaml appended B post-exchange and C post-start | pass |
| 6 | post-exchange session value | outcome lines show post-exchange ids (B codex session only exists post-start; pi path is post-restart); test 'pi session change ignored' proves live-read | pass |
| 7 | all lines carry session, `'none'` otherwise | restart lines: codex `none`, pi path; stopped/untouched tests print none; worker conflict resolved by accepting `'none'` | pass |
| 8 | one call per restart + exchange, no separate list read | branch readme turn: 0 `herdr agent list` calls; base readme turn: standalone `sess()` list greps; A calls 6/4-exchanges vs 3/2-exchanges | pass |
| 9 | restart appends receipt entry only | seats.yaml has one entry per seat (C restart session, B post-exchange), no nulls | pass |
| 10 | peer-ask unchanged path | peer-ask.ts untouched in diff; outcome lines pass through from peer-wait stdout | pass |
| 11 | naming/type unchanged | outcome/restart lines use the documented names + `session`; chart.md/SKILL.md sentences updated to describe receipt, no shape change elsewhere | pass |
| 12 | no new env var, no test added for purely normative prose | env_names empty; prose rule only in skill text | pass |

## Friction observed (run artifacts, not leaf defects)

- `peer-ask` reports `failure`/`budget` if a brief gives a templated return path (base run hit this; A repaired by renaming). Out of scope.
- `akrogon pull` prints a stack trace for a missing remote; both doors logged it as friction.
- Chart file commits varied between runs (branch committed chart writes progressively, base left `issues/` untracked) — run-level variance, not caused by this diff.
- First-run codex cold `agent start` timed out inside peer-restart once (30s cap); warm starts succeeded.

## Logs and artifacts

- `implementation/runs/{base,branch}/` — scratch repos with chart + leaf output, per-run AKROGON_HOME config, `runs/logs/` (door + consultant transcripts, screen captures).
- Temporary resources: test tab lx-setup removed; throwaway GitHub repos lx-chart-base/lx-chart-branch may be deleted (scratch only).
