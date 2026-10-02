# Save route: A

## Evidence
- pi guard (`~/.pi/agent/extensions/tamdoma-env-guard/index.ts:14-21,1104-1153`; tests `index.test.ts:260,276`): protects `.env` and `.env.*` (not `.env.example`), refuses tool writes and shell redirects such as `bun ... > .env`, allows the Bun loader. A script that opens the file itself is not inspected.
- Claude Code permissions docs (read 2026-10-02): `Edit` denies cover file tools, recognized file commands and redirect targets, not subprocesses that open files themselves. After `Bash(* .env*)` is removed, a script invocation whose text does not match another deny runs.
- Codex local config: no forbid rules (inspected default only).
- Framework secret-env library has verifiers only, no writer (`.claude/skills/_shared/libraries/secret-env/scripts/`).
- No akrogon leaf in this chart produces a key. The route serves future consumer producer leaves (key-creation 2a), which already must declare the produced name and holding repo.

## Recommendation 1a: declared save command, proven at charting
The producer's readiness contract names the save command (consumer code the producer leaf owns or an existing consumer script), the produced name and the holding repo. The door proves that command at charting with a throwaway name and value against a scratch copy, then removes it. Seats run only that command, as a subprocess; tool edits and shell redirects to the env file stay refused by Claude file denies and the pi guard. Explicit permission is the contract entry plus the door proof plus the operator's handoff approval, recorded per producer, not a harness-wide allow.

## Options
- 1a as above.
- 1b per-harness allow entries: a Claude allow rule for the exact command and a pi guard allowlist (a pi-extensions leaf). Cost: a second destination, config that drifts per command and machine, and Claude allows cannot beat denies anyway, so it only matters if a deny matches the command text.

## Pitfalls
- 1a relies on the guards not inspecting subprocesses; B's earlier point stands that this is not isolation. The authorization is the contract and proof, and a seat running any other writer is outside its grant.
- The save command must take the value privately (stdin or the creating call's output piped directly), never as an argument.
- The door's proof must not touch the real holding file; prove against a scratch copy.

## Research
- better-than-training · pi guard source and tests; Claude Code permissions docs; framework secret-env scripts; all read 2026-10-02.
- model-knowledge · no practitioner search run yet; B's round covers outside sources.
