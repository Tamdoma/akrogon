# Blocker record: A

## Evidence
- User deny rules (~/.claude/settings.json): `Read(**/.env)`, `Edit(**/.env)`, `Read/Edit(**/.env.*)`, `Bash(* .env*)` and per-tool `cat/head/tail/grep/sed/awk/source/cp */.env*`. No project settings in akrogon.
- `Bash(* .env*)` matches any command text containing " .env", including a `--reason "... absent from .env ..."` argument (I13: four denied fail attempts, seat idle) and `bun --env-file .env` forms (I10).
- Skills put ".env" in the very text they tell seats to run: plan-issue:63 `bun --env-file=.env -e ...` and "add <VAR> to .env" reasons; implement-issue:55 same reason shape; check-issue:31, merge-issue:29, implement-issue:45 forbid opening or writing `.env` with any tool.
- Claude Code docs (code.claude.com/docs/en/permissions, read 2026-10-02): deny beats allow and an allow cannot carve an exception (line "An allow rule can't carve an exception out of a deny rule"); Read/Edit deny rules "don't apply to ... arbitrary subprocesses that read or write files indirectly, like a Python or Node script that opens files itself". Bash argument patterns are called fragile.
- akrogon: `phase failed` takes free-text `--reason` stored as `failure.reason` with cause `blocked` (src/phase.ts:188-207). No env command exists.
- The deny rules exist only for the Claude harness; codex and pi seats have none, so behavior differs by harness.

## Recommendation 1a: one akrogon command family, no ".env" in seat command text
- `akrogon inputs <slug>`: checks the leaf's declared contract inputs against the registered checkout's env file by name, printing present/absent/empty per name, never values. Same check `next` and `status` use (readiness-contract 1a).
- `akrogon inputs <slug> --save <NAME>`: reads the value from stdin and writes it to the registered checkout's env file, only for names the contract declares as produced by this leaf (key-creation 2a); never echoes.
- `akrogon phase <slug> failed --missing <NAME>...`: akrogon composes the reason from names, so seats never type the file name.
- Skills switch their presence checks and blocker wording to these commands. Deny rules stay as they are.

## Options
- 1a as above.
- 1b operator narrows deny rules at the source. Cost: per user, per machine, per harness; already narrowed twice on two branches; an allow cannot override `Edit(**/.env)`, so key-creation 2a still has no write route without removing that deny.

## Pitfalls
- The deny rules guard against values entering model context, not against processes touching the file (Claude Code docs). 1a keeps that intent only if no subcommand ever prints a value.
- `--save` must take stdin from the producing command, not a value the model types, or the value lands in context anyway.
- Restricting `--save` to declared names stops a seat from overwriting unrelated secrets.

## Research
- better-than-training · Claude Code permissions (code.claude.com/docs/en/permissions, read 2026-10-02): precedence and subprocess limits above. Changed: 1b cannot give a write route; 1a is consistent with documented rule scope.
- better-than-training · ~/.claude/settings.json; skills plan-issue:31,63, implement-issue:45,55, check-issue:31, merge-issue:29; src/phase.ts:188-207; intake I10, I11, I13.
- model-knowledge · practitioner search not run for this fork; the question is about this repo's own mechanism and the tool it calls.
