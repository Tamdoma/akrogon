# Review B: skills-never-ask

Base: f91cea968ac46f5a30119e4ce03eac611cc66abd
Reviewed head: b35ed0427eccdd05c29efd2e8fdca00167e3dc70
Verdict: ready

## Evidence

- `git status --porcelain` empty; `git log f91cea9..HEAD` shows exactly one commit touching the six owned files, nothing under `issues/`.
- `grep -rn -i "ask the operator\|wait for the operator\|and wait" skills/` — sole hit is `skills/chart-issues/assets/questions.md:29` (attended skill, asks by design, excluded). No ask/wait instruction remains in any lifecycle skill. Criterion 1 met.
- `grep -ln "akrogon phase <slug> failed --reason"` lists all four phase skills; each stop instruction also names `--slot` and the pass artifact (plan-issue: current pass artifact; implement-issue: `implementation/report.md`; check-issue: `review-<slot>.md`; merge-issue: `review-A.md`). Criterion 2 met.
- broadcast-issue states the rule ("directs no questions elsewhere") with no stop command; implement-issue Standalone states it ("sends no questions back") with no stop command. Criterion 2 second half met.
- `skills/AREA.md` names the rule once under Non-obvious patterns.
- `bun test`: 239 pass, 0 fail (run by B at implement; prose-only diff since, no rerun needed).
- Broader sweep for `wait|ask|question|operator` in the five lifecycle skills: remaining hits are footer descriptions of command outcomes ("waiting or terminal outcomes"), the peer-blindness rule ("do not contact or wait for the peer"), and lesson handoff ("left for the operator to commit") — none instruct the seat to ask or wait.
- plan-issue design-wins rule preserved with the forbidden substring removed; both credential flows (plan.synthesis and implement) now record the blocker plus `add <VAR> to .env` action and end with `failed --slot B`, matching the design's reading of the standing rule.
- merge-issue keeps rebase-conflict, red-check, and push error paths; the stop is scoped to operator-only blockers, per D6.
- Each skill states the rule in its own words; no copied sentence across files, per D1.

## Findings

None.
