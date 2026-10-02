# Blocker record: merged A + B

## Evidence
- (A,B) User deny `Bash(* .env*)` (~/.claude/settings.json:58) matches any command text containing " .env", including a blocker sentence in `--reason` (I13) and `bun --env-file .env` forms (I10). The consumer project already removed it; the user-level rule remains (B).
- (A,B) Skills put ".env" in the text they tell seats to run (plan-issue:63, implement-issue:55) and forbid any env write (plan-issue:31, implement-issue:45, check-issue:31, merge-issue:29), which contradicts taken key-creation 2a.
- (A,B) Claude Code permissions docs (read 2026-10-02): deny beats allow and an allow cannot carve an exception; Read/Edit denies do not cover subprocesses that open files themselves.
- (B) Controls differ by harness: Codex runs `danger-full-access` with no forbid rules (~/.codex/config.toml:3-4); pi seats carry a `tamdoma-env-guard` extension that blocks direct and recognized Bash env writes (index.ts:77-106,1155-1201) but allows Bun's loader. Fixing Claude settings alone does not settle it.
- (B) `akrogon phase failed --reason` already stores the reason (src/phase.ts:188-211); the state write precedes notify and log append (:109-127), so inspect state before retrying a failed move. log.ts omits `failure` (Off route leaf).
- (B) I8 plan.md:165-180, I10 report.md:125-127, I11 review-B.md:217-230 (since fixed by the merge-issue:29 exception), I12 report.md:49,109,143-145 confirmed in consumer records.

## Disagreement and resolution
- (A, first draft) one akrogon command family (`inputs` check, `--save` from stdin for contract-declared names, `failed --missing`) so seat command text never names the env file, deny rules untouched.
- (B) that passes only because the matcher misses it; moving a forbidden operation into a script is not authorization, and the command still needs explicit permission in each harness (Trail of Bits config; Anthropic sandboxing post).
- (A) accepts B: the helper works around the policy instead of changing it. A now recommends 1a.

## Recommendation 1a (A,B): reconcile the rules at their source
- Human-only prerequisite, owner operator: remove the user-level command-text deny `Bash(* .env*)`; keep the file-tool denies (`Read/Edit(**/.env*)`) and direct dumping bans; explicitly permit the narrow producer write in each harness and the pi guard before any leaf uses it. Completion recorded before the affected leaves open.
- Leaf (akrogon skills): phase skills permit process consumption for declared checks and live operations, by-name presence results, and only the taken producer-key write into its named holding repo; the producer passes the value privately, changes only the named entry, never prints it or puts it in arguments, and revokes it if saving fails.
- Blockers use the existing `akrogon phase <slug> failed --reason "<blocker and artifact>" --slot <seat>`, with name or ID, attempted operation, identity reference, error, owner and next action in the pass artifact; values never appear.

## Options
- 1a (A,B) as above.
- 1b (A draft) akrogon command for presence checks and producer writes. Gives every harness one implementation, but adds secret-file parsing and writing to akrogon and still needs the same explicit permission and skill changes.

## Pitfalls
- An allow cannot defeat a deny; a script that opens the file is not authorization (A,B).
- A symlinked worktree file is not the write destination; writes target the registered checkout (B, env-source lock).
- The pi guard's startup scrub does not cover keys created mid-run; the producer must suppress the value itself (B).

## Research
- practitioner · Trail of Bits, Claude Code configuration (github.com/trailofbits/claude-code-config, read 2026-10-02) (B): tool denies paired with an OS sandbox; denies alone are not isolation.
- practitioner · David Dworken and Oliver Weller-Davies, Anthropic, "Claude Code sandboxing" (anthropic.com/engineering/claude-code-sandboxing, read 2026-10-02) (B): bounded filesystem and network isolation, not approval rules, is the boundary.
- better-than-training · Claude Code permissions (A,B); OpenAI Codex approvals and rules docs (B); pi 1.0.0 docs/security.md:3-7 (B); ~/.claude/settings.json; skills and src lines above.
