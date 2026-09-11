# Implementation brief: dead-fields

## 1. Goal

Implement plan decisions D1–D5: remove unused top-level state fields with exact read-time legacy migration, preserving strict validation and existing lifecycle behavior.

## 2. Numbered acceptance criteria

1. C1: new canonical states omit both fields and direct strict schema parsing rejects either old field.
2. C2: legacy priority-only, slot-only and both-key files read without writes and save without the keys, preserving supported state and remaining stable on repeat saves. Cover fixture paths in open, closed and parked.
3. C3: other unknown keys, missing required fields, invalid known values and non-object YAML still fail validation. Legacy values are discarded regardless of type.
4. C4: fixture creation and successful CLI dispatch write neither retired field. Existing attempt/prompt behavior remains. Chart guidance no longer authors or documents these fields.
5. C5: fixture CLI overview/detail accept legacy states without writes and omit the keys from the detail state section, retaining history log slot. B verifies the edited CLI against registered repository states.
6. C6: changed tests pass. B runs all remaining gates, reviews scope and commits before handoff.

## 3. Read-first list

Read ../plan.md, ../brief.md and ../design.md relative to this file. Read /home/ivan/.codex/skills/implement-issue/ponytail.md. In the worktree read src/state.ts, dispatchSlot in src/next.ts, src/status.ts, tests/helpers.ts, tests/status.test.ts, tests/next.test.ts, skills/chart-issues/assets/shapes.md and skills/chart-issues/SKILL.md. Copy existing fixture/cli/yaml helpers and fake-Herdr boundary patterns. The plan supplies other context if needed.

## 4. Change list and needed interfaces

src/state.ts: remove schema fields and omit exactly priority and slot before strict parsing in readState(path): State. Keep saveState(path, state): void unchanged unless evidence requires otherwise. src/next.ts: remove only the top-level slot shorthand from the attempt object. tests/helpers.ts: omit priority in normal fixtures. Add tests/state.test.ts and extend tests/next.test.ts and tests/status.test.ts for criteria above. Remove priority from chart handoff sentence, template and explanation, and slot from command-authored field list. No new public interfaces or dependencies.

## 5. Do-not, reasons and exceptions

Do not edit issues/ in the worktree or bulk migrate real records. Authoritative artifacts belong in the registered root. Do not change session guards, busy tracking or other sibling work. Do not touch docs/ pages, whose stale examples are explicitly outside this plan. Keep log slot, CLI and prompt slot, per-seat maps and lifecycle types because they have consumers. Do not conceal migration literals to meet the contradictory zero-hit grep criterion. Do not loosen unknown-key validation or introduce fallback behavior. Return a mismatch with code evidence if the plan cannot be met within these surfaces. Only a revised brief from B authorizes a scope/interface exception. These exclusions preserve live state, sibling behavior and strict validation, and exceptions require the revised brief.

## 6. Ordered steps

First derive tests from C1–C5 and run the changed-test command to capture red evidence. Then implement state boundary and fixtures (C1–C3), dispatch write and CLI tests (C4–C5), and chart guidance (C4). Run changed tests to green and fill the report. This is one cohesive unit of about eight files. Return a mismatch if materially more scope is needed. Do not commit or run the full suite yourself.

## 7. Commands

Run only the configured changed-test command for testing, capturing output and exit codes for red and green at /tmp/akrogon-dead-fields-evidence/worker-red.txt and worker-green.txt:

```bash
export AKROGON_BASE=2a759dd9daf3c8f917b5723eabfd50bbca5f670e
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
```

B runs the full suite and other blocking checks after return.

## 8. Done-when, evidence and report

Tests demonstrate red then green, raw YAML proves retired keys disappear, CLI subprocess tests exercise real fixture invocations, and changes stay inside the owned files. Use real temporary repositories and existing fake Herdr at the process boundary. Do not contact real Herdr or GitHub. Retain command artifacts outside the worktree. Fill the four report lines below before returning and describe any unverified criteria explicitly.

Changed files and reasons: src/state.ts removes canonical priority/slot and omits exactly those legacy keys before strict read validation. src/next.ts removes the retired top-level slot write. tests/helpers.ts creates canonical fixtures. New tests/state.test.ts covers defaults, strict parsing, lazy migration across open/closed/parked, preservation, stable saves and invalid inputs. tests/next.test.ts checks raw dispatch YAML. tests/status.test.ts exercises legacy overview/detail without writes and preserves history slot. skills/chart-issues/SKILL.md and assets/shapes.md remove retired creation guidance. No worktree issues/ files changed.
Tests run: AKROGON_BASE=2a759dd9daf3c8f917b5723eabfd50bbca5f670e bun test --changed="$AKROGON_BASE". Red exit 1: 58 pass, 14 fail across 3 files, /tmp/akrogon-dead-fields-evidence/worker-red.txt. Final green exit 0: 155 pass, 0 fail, 1478 assertions across 10 affected files in 38.74s, /tmp/akrogon-dead-fields-evidence/worker-green.txt. Fixture CLI subprocess coverage includes next and status. git diff --check passed. No full-suite command or commit run by worker.
Known limitations: untouched legacy files retain keys until saved. docs/state.html, docs/create.html and docs/next.html retain out-of-scope stale references.
Unverified criteria: none within this leaf's scope. B completed the remaining checks and committed 093ee084d4652925f3acc723379ba9e05d117723 with a clean worktree. See report.md for final evidence.
