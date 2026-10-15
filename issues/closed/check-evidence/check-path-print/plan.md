# Plan: check-path-print

Debate is off (`debate: "no"`): this plan derives directly from the brief and the locked design.

## Decisions

- D1 (locked): `runCheck` in src/run-check.ts, not `checkedRun`, prints `check <name>: <code> <kept>` to stderr after `checkedRun` returns. `checkedRun` grows its return with whether the command's captured stderr ended in a newline; `runCheck` prepends `\n` only when it did not (empty or unterminated). `verify`, the other `checkedRun` caller (src/verify.ts:154,167), ignores the added field.
- D2 (locked): tests/check-names.test.ts:26 and tests/run-check.test.ts:428 anchor stderr with `/^run [0-9a-f-]{36}\n?$/`; their expectations change with the new line (append `check ` line pattern), per the standing design's false-expectation rule. No other code parses run-check stderr; a search of `skills/` and `src/` shows `run-check` output is read by humans and the `run <uuid>` line only (confirmed for the plan's open question).
- D3 (locked): the listed skill lines gain the run-check rule, the `akrogon log <path>` reader reference, and the three exemptions (printed `checks` commands and `akrogon verify`; `akrogon phase ... merged`; coordination commands whose errors are quoted as text). On the direct route the holder is the absolute `<chart>/direct` path and check-issue's standalone section allows those logs. Standalone implement-issue stays outside the rule. Line numbers were re-verified on this branch (at origin/main f3557d8): implement-issue SKILL.md:25,38,65,80; implement-issue/worker-protocol.md:29; implement-issue/brief-template.md:43; check-issue SKILL.md:18,67,69,83,85,101; merge-issue SKILL.md:18,41,53,55,75; plan-issue SKILL.md:69. chart-issues :85,:114,:121 are folder-pack's, not this leaf's.
- D4: the skill contract is pinned by a text test in the style of tests/run-units.test.ts:556, asserting each listed file contains the run-check command form, `akrogon log`, and the exemption tokens — not the sentence wording.
- D5: the newline-branch contract uses unterminated command stderr (`printf tail >&2`); `cli`/`printedChecks` trim, so the test anchors `check ` at line start (`/m`) and asserts run-check's own exit pass-through. Empty stderr needs no `\n` prepend and stays implicitly covered by the `printf tail` case.
- D6: no environment variable is named by the design; `env_names` is empty and `akrogon status` shows no `Missing:` lines. No blocker.

## Open questions from the design

- "Seats and scripts that parse run-check stderr: confirm with a search" — confirmed: `grep -rn run-check skills/ src/` shows only the `run <uuid>` start line (src/admission.ts:154) and human-facing text; nothing parses the tail. Resolved as D2 note.

## Read-first

- docs/reference-index.md → src/AREA.md, tests/AREA.md, skills/AREA.md
- src/run-check.ts (runCheck :127, checkedRun :146)
- src/verify.ts:154,167 (other checkedRun caller)
- src/admission.ts:154 (`run <uuid>` stderr line)
- tests/helpers.ts (cli trims stderr :80-104; printedChecks :188)
- tests/run-check.test.ts, tests/check-names.test.ts, tests/run-units.test.ts:556
- the five skill files at the D3 lines

## Needed interfaces

- `checkedRun` returns `{ code: number; log: string; stderr_final_nl: boolean }` (field name free; `verify` destructures only `code`/`log` already at src/verify.ts:154 and awaits the promise directly at :167 — confirm both sites type-check).
- runCheck stderr line: `check ${name}: ${code} ${kept}` where `name` is `name ?? 'run'`, `code` the command exit, `kept` the absolute copied log path.

## Units (waves)

Every unit below shares no owned path with another unit except U1/U2 vs U3: U3's new test case appends to tests/run-check.test.ts which U1 does not own, and U2 owns the anchors in the same file — a shared path, so U2 and U3 serialize. Order below is the serial order; every wave holds one unit, so the run is serial-solo and A implements it.

### Wave 1 — U3 (tests, committed first)

- Owns: new test case in tests/run-check.test.ts; new test case in tests/run-units.test.ts; anchor updates land with U2 product commit? No — anchors are existing expectations changed by new behavior; they change in the same commit as the code they pin (see Note).
- Shared test resource: none.
- Waits on: nothing.

Work: append to tests/run-check.test.ts a case: run `akrogon run-check --name probe -- sh -c 'printf tail >&2; exit 7'` in a leaf worktree; assert code 7, stderr matches `/^check probe: 7 (\S+\.log)$/m`, the captured path exists under the leaf `implementation/` dir and contains `tail`. Append to tests/run-units.test.ts a skill-text case asserting the five files (implement-issue SKILL.md, worker-protocol.md, brief-template.md; check-issue SKILL.md; merge-issue SKILL.md; plan-issue SKILL.md) each contain `akrogon run-check`, `akrogon log`, `akrogon verify`, `merged`, `fetch`/`push`; check-issue additionally matches `/<chart>\/direct/` and implement-issue additionally matches `/standalone[^\n]*outside/i`.

### Wave 2 — U1 (product change)

- Owns: src/run-check.ts; tests/check-names.test.ts:26 and tests/run-check.test.ts:428 anchors (changed expectations, `Test-Change` trailer on the commit).
- Waits on: U3's tests committed red (planning-era tests precede product code).

Work: in `checkedRun` capture `result.stderr.at(-1) === '\n'` into the return; in `runCheck` write `(stderr_final_nl ? '' : '\n') + 'check ' + name + ': ' + code + ' ' + log + '\n'` via `process.stderr.write` after `checkedRun` returns, before returning `code`. Update the two stderr regex anchors to `/^run [0-9a-f-]{36}\ncheck [\s\S]+: \d+ \S+\.log$/` equivalent covering the new line (exact form at implement; anchors keep pinning the `run` line and now the `check` line).

### Wave 3 — U2 (skill lines)

- Owns: skills/implement-issue/SKILL.md, skills/implement-issue/worker-protocol.md, skills/implement-issue/brief-template.md, skills/check-issue/SKILL.md, skills/merge-issue/SKILL.md, skills/plan-issue/SKILL.md.
- Waits on: U3 (the skill-text test defines the contract; may run parallel with U1 in principle but serial-solo anyway).

Work: edit each D3 line to state the run-check rule, `akrogon log` as reader, and the exemptions; check-issue :101 (standalone review section) names the absolute `<chart>/direct` holder and allows those logs; implement-issue's standalone paragraph states it is outside the rule.

## Acceptance criteria and proof

1. `akrogon run-check --name <n> -- <cmd>` writes `check <n>: <exit> <kept path>` to stderr on its own line after command output, even when command stderr lacks a trailing newline; run-check exit code unchanged.
   - Test: new case in tests/run-check.test.ts (U3).
   - Observation: `cli` invocation of run-check in a fixture leaf worktree; stderr before = `run <uuid>\ntail`, after = same plus line-start `check probe: 7 <abs .log path>`; catches the line missing, concatenated onto `tail`, wrong field order, or exit-code drift (expect 7). Command: `akrogon run-check --name check-path-print -- bun test tests/run-check.test.ts`. Size: seconds. Rerun: src/run-check.ts or the test changes.
2. The six skill files' named lines state the run-check rule, name `akrogon log` as reader, and carry the three exemptions incl. direct-route holder and standalone exclusion.
   - Test: new skill-text case in tests/run-units.test.ts (U3).
   - Observation: file text at the pinned tokens; before = no `run-check`/`akrogon log` tokens in those files; after = tokens present. Catches a file missed from the edit list or the reader/exemption dropped. Command: `akrogon run-check --name check-path-print-skills -- bun test tests/run-units.test.ts`. Size: seconds. Rerun: any skill file or test change.
   - Coverage note: token pins prove presence of each element, not prose quality; wording review is check.review's job.

Existing `checks` (`format`, `test`, `typecheck` via `akrogon verify`) prove no regression; no `merge_checks` addition — the brief names none.

## Doc checklist

No `README.md`, `docs/guide`, or `AREA.md` file states the run-check output contract; one line: no doc affected beyond the six skill files already in scope.

## Planned test runs (red record)

- Criterion 1 — `akrogon run-check --name check-path-print -- bun test tests/run-check.test.ts` (log kept at `issues/open/check-evidence/check-path-print/implementation/check-check-path-print-*.log`): 18 pass, 1 fail — `run-check prints check name, exit and kept path on its own stderr line` → `error: stderr carries the check line at line start / Received: null` at tests/run-check.test.ts:448. Intended red: the check line is not printed yet.
- Criterion 2 — `akrogon run-check --name check-path-print-skills -- bun test tests/run-units.test.ts -t 'run-check keeping rule'` (log at `implementation/check-check-path-print-skills-*.log`): `skills name the run-check keeping rule, its log reader and its exemptions` → `error: skills/implement-issue/SKILL.md names the run-check rule / Expected to contain: "akrogon run-check"` at tests/run-units.test.ts:568. Intended red: no skill file names the rule yet.
