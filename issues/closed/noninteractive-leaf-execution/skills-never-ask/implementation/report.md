# Implementation report: skills-never-ask

Base: f91cea968ac46f5a30119e4ce03eac611cc66abd
Head: b35ed0427eccdd05c29efd2e8fdca00167e3dc70 (branch skills-never-ask)

## Changed files and reasons

- `skills/plan-issue/SKILL.md` — no-questions rule and `failed` stop in shared context; design-wins line reworded to drop the `ask the operator` substring; `## Operator actions` credential flow replaced with blocker-plus-stop (`failed --slot B`).
- `skills/implement-issue/SKILL.md` — no-questions rule and `failed` stop in shared context; credential line rewritten to record the blocker in `implementation/report.md` and stop with `failed --slot B` (wait and proceed-without-it paths removed); Standalone gained the no-questions rule without a stop command.
- `skills/check-issue/SKILL.md` — no-questions rule and stop instruction; blocker recorded in `review-<slot>.md`, `failed --slot <A|B>`.
- `skills/merge-issue/SKILL.md` — no-questions rule and stop instruction; blocker recorded in `review-A.md`, `failed --slot A`; existing conflict/check/push error paths explicitly unchanged.
- `skills/broadcast-issue/SKILL.md` — no-questions rule in own words, no stop command; loud-error behavior unchanged.
- `skills/AREA.md` — one line naming the rule under Non-obvious patterns.

One delegated worker (brief-1.md) made all six edits; B verified the diff against plan D1-D9, ran the greps, and ran the full suite.

## Commands run

```
$ grep -rn -i "ask the operator\|wait for the operator\|and wait" skills/
skills/chart-issues/assets/questions.md:29:Present all currently material questions in one complete round and wait for the operator's answer. ...
```
Sole hit is the chart-issues asset (attended, asks by design, excluded by the design). No instruction to ask or wait remains in any lifecycle skill.

```
$ grep -ln "akrogon phase <slug> failed --reason" skills/plan-issue/SKILL.md skills/implement-issue/SKILL.md skills/check-issue/SKILL.md skills/merge-issue/SKILL.md
skills/plan-issue/SKILL.md
skills/implement-issue/SKILL.md
skills/check-issue/SKILL.md
skills/merge-issue/SKILL.md
```
All four phase skills carry the stop instruction with `--reason` and `--slot`.

```
$ grep -n "failed" skills/broadcast-issue/SKILL.md
41:... another target failed, no outcome is recorded, and a broadcast failure does not reopen the issue.
```
Pre-existing line only; no stop command added.

```
$ bun test --changed="$AKROGON_BASE"   (worker, AKROGON_BASE=f91cea9...)
0 pass, 0 fail — 6 changed files, no test files affected (prose-only).

$ bun test   (B, full suite)
239 pass, 0 fail, 3035 expect() calls, 12 files.
```

## Known limitations

- Prose cannot physically prevent a seat from asking; enforcement is the pi harness `--exclude-tools request_user_input` flag, an operator config step outside this leaf.
- `skills/chart-issues/` and `skills/init-issues/SKILL.md` still ask by design (attended, outside the owned list).

## Unverified criteria

None.
