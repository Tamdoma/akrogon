# Merged map · Tamdoma/akrogon#22

## Evidence
- (both) Every env touch was the pi `bash` tool: appends at log 171 and 254, inspections 250-268, `sleep` retries 226/234/260. Credentialed calls used `bun --env-file=.env` throughout.
- (B) The unredacted line is the result at log 267 of the awk/grep call at 266 and carries `BLVD_ADMIN_PASSWORD`; the cat/sed results at 259 and 265 were redacted. Numbered output is why a bare `KEY=value` scan misses it.
- (both) pi 0.85.1 `tool_call` can block or mutate input, `tool_result` can rewrite content before the tool-result message is persisted (extensions.md:798-875; B: agent-session.js:244-270, :388-398).
- (B) `tool_result` cannot erase a value already in a tool-call argument or an earlier message; partial updates have their own path (:537-545).
- (B) The consumer's "never open the env file" wording was not found in its CHART.md/EPIC.md; the seed is the source of that rule.
- (both) skills-never-ask (handed off, undispatched) already rewrites implement-issue:39 and plan-issue:55 to the seat-declared stop. Shapes forbid editing an emitted contract, so the env rule is new intake with its own leaf, ordered after it.

## Destinations
- D1 (both) pi-extensions: one extension, two hooks. `tool_call` refuses read/write/edit on a protected path and bash commands that name a protected file other than as `--env-file=<path>`, with a reason naming the loader and the seat stop. `tool_result` replaces every exact value loaded privately from the protected files in every tool result, labelled or not, before persistence. (B) Bounded promise: accidental paths in the installed toolset, not isolation from arbitrary programs; no silent rewrite of a forbidden command; refresh of values at a session/turn boundary, no poller; child runtimes must be measured, not assumed.
- D2 (both) akrogon skills: one sentence in the four phase skills and AREA.md: the env file is operator-owned, loaded only through the sanctioned loader, never read or written by a seat, and a missing value ends the attempt via the existing stop naming the variable. (A) New leaf blocked-by skills-never-ask. (B) Chart-time presence proof belongs to execution-readiness write-proof; a presence check prints names, never values or lengths.
- D3 (B) Incident handling: the existing log line and rotation are the operator's, already decided; out of scope, recorded.

## Forks for the operator
- Q1 (B) Guarantee scope: accidental-path prevention in pi's installed tools (recommended) vs an isolation boundary, which is a different architecture (broker with no shell access to the file).
- Q2 (both) Output filtering: exact-value scrub of all tool results (recommended) vs only for commands mentioning the file (misses API errors carrying a token) vs none.
- Q3 (both) Pre-execution refusal: tool_call block on protected paths and on bash mentions outside `--env-file=` (recommended) vs skill prose only (the prose rule already existed and failed).
- Q4 (both) Protected set: `.env` and `.env.*` except `.env.example`, resolved through cwd and the git common root, symlinks resolved (A recommended) vs an explicit configured list (B leans: authoritative file plus aliases).

## Measurements before handoff
- (both) m1: synthetic secret in a scratch env; a pi -p run with a scratch extension shows the rewritten result in the session jsonl, and shows what an argument-carried value does.
- (B) m2: a tamdoma-subagents child in the same fixture: does it load the global extension and where does it persist.
- (A) m3: the bash pattern refuses the incident's exact command shapes and admits `bun --env-file=.env`.

## Pitfalls
- (both) Do not block `--env-file`. (A) Exempt `.env.example`. (B) A blocked call must not become a retry loop; `terminate` is not a lifecycle stop. (B) Short or empty values must not wipe results: minimum length, no scrub of empty. (B) Never copy the incident value into fixtures. (A) Values loaded by the hook are never logged.
