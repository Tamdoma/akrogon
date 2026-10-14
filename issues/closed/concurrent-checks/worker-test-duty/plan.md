# Plan: worker-test-duty

Debate off (`debate: "no"`); synthesized directly from brief, locked design and live surfaces.

## Decisions

- D1. `brief-template.md` section 7 names the unit's targeted test commands from A's plan and states that when none are named the worker runs no changed-tests command; it stops supplying the resolved `test_changed` command and the `AKROGON_BASE` value (criterion 1).
- D2. `worker-protocol.md` and `implement-issue/SKILL.md` assign the resolved changed-tests command and every `checks` command to A (after each cherry-pick, at phase ends) and state workers never run the full changed-tests command (criterion 2). One rule per seat file; no restatement elsewhere.
- D3. `implement-issue/SKILL.md` proof-order item 3 (wait-on-exit) names the background form verbatim from the readiness proof: one fresh `mktemp -d "$TMPDIR/run.XXXXXX"` per run created before launch; the exact printed command started once there with `nohup`; output to `log`, exit status to `exit`, wrapper PID to `pid`; no `exit` + PID alive = running, no `exit` + PID gone = incomplete; never `timeout`, never a second start for that directory (criterion 3).
- D4. One sentence appended to the `Failed checks commands always block` paragraph of `skills/check-issue/SKILL.md` (the paragraph at line 61, the second location the design names at :55,61): output from a run outside the printed `checks` command can prove the specific done outcome it exercises but never replaces a required `checks` result (criterion 4).
- D5. No new tests. Standing design: skill prose is proven by meaning, no wording tests; existing literal-contract tests (`red-docs.test.ts`, `docs-links.test.ts`, `base-run.test.ts`) and the `test` check prove criterion 5. Nothing committed before code.
- D6. `docs/guide/phases.md` and `skills/init-akrogon/SKILL.md` stay unchanged: phases.md:94 already assigns changed tests to A, and init-akrogon's `test_changed` lines are config guidance, not the worker command. Reported, not owned, per design.

## Read-first

- `skills/implement-issue/brief-template.md` — sections 2 and 7 carry the worker command rule
- `skills/implement-issue/worker-protocol.md` — Launch and return, Failure ownership
- `skills/implement-issue/SKILL.md` — proof-order item 3 (~line 45), implement-mode paragraph (~line 57)
- `skills/check-issue/SKILL.md` — `Failed checks commands always block` paragraph (~line 61)
- `issues/chart/permit-bypass/forks/{worker-duty,long-run-path,evidence}.md` — locked fork resolutions
- Leaf `readiness.yaml` `proofs[0]` — verbatim background command and semantics
- `skills/implement-issue/ponytail.md`, `skills/check-issue/ponytail.md` — house style

## Needed interfaces

None (skill prose only).

## Waves

### Wave 1 — 2 units

- U1: `skills/implement-issue/brief-template.md`, `skills/implement-issue/worker-protocol.md`, `skills/implement-issue/SKILL.md` — D1, D2, D3. Edits (criteria 1–3):
  - template §7: name the unit's targeted test commands from A's plan; when none are named the worker runs no changed-tests command; remove the supplied resolved `test_changed` command and `AKROGON_BASE`; A runs that command, criterion proof and `checks` separately.
  - template §2: `run under section 7's changed-test command` → `run under the commands section 7 names`.
  - worker-protocol Launch and return: `installs dependencies ... before its changed tests` → `before its targeted tests`; report line `changed-test output` → `targeted-test output`; `runs the lane changed tests after each pick` → `runs the resolved changed-tests command after each pick`.
  - worker-protocol Failure ownership: `Workers run only the brief's changed-test command` → `Workers run only the targeted test commands their brief names, never the full changed-tests command`; repair line `worker repairs with changed tests` → `worker repairs with the targeted tests its sub-brief names`.
  - SKILL.md implement-mode paragraph: `workers receive only that command, not A's criterion proof and every checks command run` → `workers receive only their unit's targeted test commands, never the full changed-tests command and never A's criterion proof and checks command runs`.
  - SKILL.md proof-order item 3: append the D3 background-form text.
- U2: `skills/check-issue/SKILL.md` — D4. Append the criterion-4 sentence to the `Failed checks commands always block` paragraph.

No shared test resource; disjoint paths; no prerequisites. Criterion 5 is proof, not a unit.

## Verification

| Criterion | Proof command | Failure caught | Size | Rerun trigger |
|---|---|---|---|---|
| 1 | `git diff "$AKROGON_BASE" -- skills/implement-issue/brief-template.md` reviewed: §7 names targeted commands, states the none-named rule, no longer supplies the resolved command or `AKROGON_BASE` | §7 still supplies the resolved command or lacks the none-named rule | seconds | any commit touching the file |
| 2 | `git diff "$AKROGON_BASE" -- skills/implement-issue/worker-protocol.md skills/implement-issue/SKILL.md` reviewed: A owns changed-tests after each pick and `checks` at phase ends; workers never run the full command | worker still receives or runs the full command | seconds | any commit touching either file |
| 3 | `git diff "$AKROGON_BASE" -- skills/implement-issue/SKILL.md` reviewed: wait-on-exit names the mktemp/nohup/log/exit/pid form, running-vs-incomplete semantics, never `timeout`, never a second start | seat wraps in `timeout` or restarts, losing its place (Tamdoma/akrogon#89) | seconds | any commit touching the file |
| 4 | `git diff "$AKROGON_BASE" -- skills/check-issue/SKILL.md` reviewed: the one sentence present in the checks-block paragraph | reviewer rejects non-printed proof outright or treats it as a checks result | seconds | any commit touching the file |
| 5 | `akrogon run-check --name 'test' -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile'"'"' && akrogon guard own-modules && sh -c '"'"'bun test --timeout=30000'"'"''` | literal-contract or docs-links regression from the skill edits | minutes | any branch commit |

Also run the remaining blocking `checks` (`format`, `typecheck`, `test_changed` with `AKROGON_BASE` from config) at implement end per proof order.

No slow-run (hours/unknown/live) proof: no restart boundaries needed.

## Docs

- `skills/implement-issue/SKILL.md` — wait-on-exit background form; worker targeted-command rule; Standalone paragraph targeted-command/evidence wording
- `skills/implement-issue/worker-protocol.md` — targeted-tests-only worker duty; A owns changed-tests and checks
- `skills/implement-issue/brief-template.md` — §7 targeted commands; §2 wording
- `skills/check-issue/SKILL.md` — non-printed-run proof sentence
- `skills/AREA.md` — worker-return evidence wording (added by plan correction, see below)
- No human doc affected: phases.md:94 already assigns changed tests to A; no other hit under `docs/` or `skills/` restates the worker command

## Plan corrections (check.fix, 2026-10-13)

Review F1: two worker-duty spots still said `changed-test` — `skills/AREA.md:24` (worker returns) and implement-issue's Standalone paragraph (derive commands / report evidence). The plan's sweep grepped `test_changed` and plural `changed-tests`, missing the singular `changed-test` form. Corrected step: reword both spots to targeted-command/evidence terms; `skills/AREA.md` joins the owned surfaces.

Executable check for the corrected rule: `grep -rniE 'changed[- ]tests?' docs/ skills/ README.md` — every hit is inspected; only A-duty wording (the resolved changed-tests command A runs) and init-akrogon config guidance may remain; any hit assigning changed-test commands or evidence to workers is a defect to reword.
