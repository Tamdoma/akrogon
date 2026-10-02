# Review A: log-tail

Base: `5bb552d` · Reviewed head: `082033a` · Verdict: **fix**

Verification performed: read full diff; read `log-tail.ts` and `log-tail.test.ts` whole; ran `bun scripts/log-tail.ts` on this session's own live, still-appending pi log (in-flight call correctly prints `running`, identities differ per command, exit 0); ran the script on two real historical pi logs containing `exec` calls; checked `skills/AREA.md`'s edited line against the live tree (both named paths exist). `checks` evidence from implement (37/0 subpackage, 356/0 root, both typechecks, format) is reused unchanged — no code changed since.

## Fix

### F1. pi wrapped `exec` calls hash every command to the same empty-target identity

**Source:** `log-tail.ts` `scanExecSource` scans only for `exec_command|write_stdin`. Real pi `exec` calls (the `arguments.code` shape the brief names for codex AND pi) in older logs wrap `tools.bash({command:"..."})`, `tools.ls`, `tools.read`, `tools.apply_patch` — never `exec_command`. Scanned target is `''`, `allLiteral` stays true, identity is `#e3b0c442` (sha256 of `''`) for every call.

**Live evidence:** `bun scripts/log-tail.ts ~/.pi/agent/sessions/--home-ivan-.pi-agent-extensions--/2026-09-13T23-58-25-640Z_...jsonl` prints 20 consecutive lines `exec  #e3b0c442 -> unknown,unknown:` for 52 recorded `exec` calls containing 8+ distinct `tools.bash` commands (`wc -l …`, `cat -n …`, `sed -n …`). Second log `…/admission-fault-no-block-u1--/2026-09-28T14-00-58-931Z_….jsonl` shows the same — including a repeated-pair shape that the Busy rule's "same command three or more times with the same result" bar would misjudge as a loop: three or more distinct commands share `#e3b0c442` and `unknown,unknown`, reading as same-command/same-result. Same risk in reverse for edit-undo detection.

**Consequence today:** the watch judges pi seats running wrapped `exec` (still produced on this machine for pi-extension/subagent seats) from lines that collapse every command to one identity — false loop evidence (mis-steer on a healthy seat) or, worse for the lock's intent, real loops of *different* commands invisible. Criterion hit: done-criterion 3's identity requirement ("two commands … print different identities" is only edge-tested on claude input) and the brief's core line `<tool> <target> <identity>` carrying no information.

**Fix direction:** scan `arguments.code` for `tools.bash({command: <lit>})` and other `tools.<name>({<key>:<lit>})` calls the same way `exec_command`/`write_stdin` are handled (first literal arg value per call joined ` ; `, `<expr>`/empty-target → `#-` not `#<empty>`), or reject the all-literal-hash path when no literal was found (print `#-`). Either removes the collision; the empty-target-`#` bug is the load-bearing part.

## Nits

### N1. Orphan result lines exceed "one line per outer tool call"
Excerpt fixtures contain results whose calls aren't in the copied lines; `log-tail.ts` prints them as `?`-named lines with empty target/`-` identity. Justified in plan notes (dropping them hides the `exit 1/143/2` evidence criterion 3 requires) and the test asserts their statuses. Deferred: spec tension documented, alternative (suppress) loses required evidence. Promote if reviewers prefer strict call-lines-only.

### N2. `slice(-20)` counts orphan lines toward the 20
A log tail with orphan results prints fewer than 20 calls. Only reachable in excerpted/truncated inputs; full logs always pair. Nit.

### N3. `exec_command` inside a string literal or comment in exec source produces a false cmd
Scanner doesn't skip top-level string literals/comments when searching for `exec_command|write_stdin` (e.g. `cmd:"… exec_command( …"` inside a command string). Requires nested quoting in real JS wrappers — not observed in any fixture or live log. Nit.

### N4. `cmd:"a"+"b"` style concatenations read only the first literal
`readArg` returns the first string token's value, so concatenated commands show only the first part (still literal, so hashed as that prefix — no `#-`). Not observed; codex/pi wrappers emit `cmd:"lit"` or expressions that hit `<expr>`. Nit.

## Doc check

- `skills/AREA.md` line names `scripts/observe.ts` and `scripts/log-tail.ts` — both exist. No documented behavior changed otherwise (brief-scoped: SKILL.md belongs to busy-rule-log).
