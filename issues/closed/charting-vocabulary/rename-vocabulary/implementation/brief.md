# Implementation brief: rename-vocabulary

## 1. Goal

Replace the meeting vocabulary in chart-issues with the land vocabulary (territory, map, fog, fork, question, round, chart, off route) across the skill, `src/status.ts` chart output, tests, three docs lines, the README row, and migrate all 10 charts at the authoritative root. Plan decisions D1–D7.

## 2. Acceptance criteria

Brief done-criteria 1–7 verbatim:

1. Each of territory, map, fog, fork, question, round, chart, off route appears in `skills/chart-issues/` with the design's meaning.
2. `grep -rniE "decision|batch|not yet specified|out of scope" skills/chart-issues/` matches only lines about binding decisions in leaf designs.
3. `assets/shapes.md` states: one fork file holds one or more questions always presented on one screen; a fork is taken when every material question is taken; a pre-handoff correction is a new fork naming the superseded one.
4. `bun test` and `bun run typecheck` pass.
5. `akrogon status --charts` in this repo prints header `TAKEN`/`FOG` and lists `status-empty-open` as `1/1` and `charting-vocabulary` as `5/5`, both `handed off`.
6. `find issues/chart issues/closed -type d -name decisions` prints nothing and `grep -rlE "^## (Decisions So Far|Open Decisions|Not Yet Specified|Out Of Scope|Resolution)" issues/chart issues/closed/*/chart` prints nothing — run at the authoritative root `/home/ivan/Work/infra/akrogon`.
7. `grep -niE "decision|unspecified" docs/guide/files.html docs/guide/in-practice.html docs/guide/create.html` matches only the design.md locked-decisions row (files.html:99).

## 3. Read-first

- `issues/open/charting-vocabulary/rename-vocabulary/{brief,design,plan}.md` (root)
- `skills/chart-issues/{SKILL.md,assets/questions.md,assets/shapes.md,assets/standing-design.md}`
- `src/status.ts:216-265`, `tests/status.test.ts:455-485`
- `docs/guide/{files.html:106,in-practice.html:75,create.html:58}`, `README.md:54`
- `src/phase.ts:148-160` (why no `issues/` on the branch)
- This skill folder's `ponytail.md`

## 4. Units

- brief-1: skill rewrite (SKILL.md, questions.md, shapes.md) — criteria 1, 2, 3.
- brief-2: `src/status.ts` + `tests/status.test.ts` + docs + README — criteria 4, 7 and the header half of 5.
- B direct: chart migration at the root + e2e status check — criteria 5, 6. Kept by B: it writes outside the worktree and needs judgment on which `decisions/` references are links vs verbatim history.

## 5. Do-not

- No `issues/` paths on the leaf branch: `requireCodeOnly` rejects them at check.review. The worktree's tracked `issues/` copy stays untouched; migration happens only at the root.
- No dual-format parsing in status.ts, no migrate subcommand.
- Do not touch `assets/standing-design.md`, `skills/implement-issue/`, `skills/plan-issue/`, `src/phase.ts`, or "binding decisions" in leaf designs.
- Do not touch the root checkout's other dirty files (unrelated uncommitted work).

## 6. Order

brief-1 → brief-2 → B migration → full suite + format + commit → phase call.

## 7. Commands

Workers: `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=d554f78d87bb7b29a4da8528da4c641e3ba66785`. B runs `bun test`, `bun run typecheck`, `bun run format` after all units.

## 8. Report

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

---

Changed files and reasons: skills/chart-issues/{SKILL.md,assets/questions.md,assets/shapes.md} (vocabulary rewrite, criteria 1-3); src/status.ts + tests/status.test.ts (forks/, ## Taken, Fog, TAKEN/FOG header, criterion 4 and header of 5); docs/guide/{files,in-practice,create}.html + README.md (criterion 7; files.html:102 and create.html:63 also reworded because the criterion-7 grep admits only the design.md row); all 10 charts migrated at the authoritative root (criteria 5-6): decisions/ -> forks/, four CHART.md headings, ## Resolution -> ## Taken, decisions/ links -> forks/ in CHART.md files plus three path references (loop-hardening INTAKE.md:278, akrogon-loop forks/multi-chart-layout.md:32, install-prune-dead-links forks/harness-folders.md:7). Root migration left uncommitted at the root: requireCodeOnly rejects issues/ on the leaf branch, and committing on main would diverge local main from origin/main.
Tests run: bun test 217 pass 0 fail; bun run typecheck clean; bun run format clean; changed-test red-then-green shown by worker 2; e2e `bun issues/worktrees/rename-vocabulary/src/akrogon.ts status --charts` against a scratch repo holding the real migrated charts printed `CHART TAKEN FOG STAGE AGE`, `charting-vocabulary 5/5 0 handed off`, `status-empty-open 1/1 0 handed off` (artifact: /tmp/akrogon-verify-mTJZ). Direct run at the root is blocked pre-merge: the worktree schema rejects the root state's `prompted_at` key written by the pending root work.
Known limitations: root checkout carries unrelated uncommitted work overlapping this leaf's files (src/status.ts, tests/status.test.ts, skills/chart-issues/*) — merge will conflict until it lands; migrated charts at root are uncommitted working-tree changes; worktree's inert issues/ copy keeps old names.
Unverified criteria: criterion 5 verified via worktree entrypoint on real migrated chart bytes, not via the installed symlink (runs old code until merge).
