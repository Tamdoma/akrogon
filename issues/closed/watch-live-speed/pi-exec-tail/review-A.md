# Review A: pi-exec-tail

check.review, slot A, 2026-11-20. Blind initial review.

- Base: `a52d3dad76ee78769b62a18c6798a84030a75a18`
- Reviewed head: `efb6ca4c7790707ef9d311676df73f38e74bc5c7` (c2764116 tests-red, a095fce2 feat, efb6ca4c test type fix)
- Diff: `log-tail.ts` +205/-26, `log-tail.test.ts` +188, new verbatim fixture `pi-exec-u1-excerpt.jsonl` (byte-identical to the cited U1 transcript lines, verified).

## Verification evidence

- `akrogon verify` green on reviewed head (report: `verify leaf efb6ca4c: green`, `check-test-1795200942409-2277566.log`, 1233 pass 0 fail).
- Criterion proofs green: `check c1/c2/c3: 0` (`check-c1-1795200693455-1732104.log`, `check-c2-1795200696549-1732499.log`, `check-c3-1795200696700-1732596.log`), run after the product code landed.
- Ad-hoc probes kept: `check r1: 0` (`check-r1-1795201124668-2606204.log`) — phantom scan matches plus edge traces.
- Live shape spot-checked against the same U1 transcript: trace statuses only `done`/`running`; every `details.traces` array non-empty; no `tools.*` call inside comments/strings in any of 176 exec code bodies.
- A's own run of the new tests: c1/c2/c3 logs in `implementation/` show green after the feat commit; the pre-code reds are in `plan.md`. Proof commands match `plan.md` verbatim (`bun test ./skills/watch-issues/scripts/log-tail.test.ts [-t …]`).

## Criteria check

1. Traces drive per-inner-call lines with trace name/input/status; bash exit from inner `capture.termination`; running execs scan code, non-literal → `#-`. Confirmed on real fixture output: `bash <cmd> #h -> exit 1:`, `running:`, `ok:`, per-call names `read/ls/edit/write/bash`.
2. edit/read/write/ls literal path as target; edit `old#`/`new#` joins `edits[]` exactly like the native pi `edit` branch. Confirmed (`old#5c4b4da3 new#9c2701b1` on a real trace).
3. One line per inner call in trace order (stable sort on shared result index); untraced result → single `exec  #- -> unknown:` line, `#-` never counts; codex path untouched (`format === 'pi'` guard) — all codex tests green.

Design exclusions hold: no claude/codex output change, no SKILL.md/observe.ts change. No AREA.md in the diff. Docs: no documented behavior changed (SKILL.md Busy rule's `#<hash>`/`#-`/`old#`/`new#`/`running` contract is unchanged). No model-choice checks, no paid operations, `grants: []`. No LESSONS.md changes.

## Findings

No Fixes.

### Nits

- **N1 — Scan regex matches `tools.*(` inside comments and string literals.** `scanPiExecSource` matches `\btools\.(bash|edit|read|write|ls)\s*\(` with no comment/string awareness (demo in `check-r1-1795201124668-2606204.log`: a `// const x = await tools.bash({command:"rm -rf /"})` comment and a `"tools.bash({command:'x'})"` string each printed a `running` line with a counting `#<hash>`). The pre-existing codex `scanExecSource` has the same weakness. Deferred: zero occurrences in 176 real exec bodies; each phantom line lives only while that exec is in flight and is replaced by the trace expansion when the result lands; a false loop-verdict needs 3+ identical phantom/real commands within that window. Promote to a Fix if a real pi transcript shows `tools.*(` in a comment or string inside exec code.
- **N2 — `done` trace without a `result` prints `ok`.** `traceEntry` maps `status 'done'` + absent `result` to `statusOverride 'ok'` (demo: `t2 bash true #… -> ok:` in r1). Deferred: no such record exists in the 176-result transcript (every `done` trace carries `result`), and `ok` is the plausible status for a done call; `unknown` would be the stricter print if pi ever emits resultless done traces.

## Verdict

`nits` — implementation matches plan D1–D8, all three done-criteria proven green on the reviewed head, no blocking finding.

## Operator actions

None.
