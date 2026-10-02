# Blocker record

## Question
Q1. How does a seat check presence, record a missing input, and (key-creation 2a) save a key its leaf produced, without its command text or file access tripping deny rules: one akrogon command that reads and writes the env by name, or the operator reconciling the user deny rules at their source?

### Carries
- [readiness-contract](readiness-contract.md): taken 1a.
- F4: user deny `Bash(* .env*)` matches command text; it blocked reason text and this door's own intake write.
- F7: empty values count as missing.
- From env-source B R2: phase skills forbid env writes (skills/implement-issue/SKILL.md:45, check-issue:31, merge-issue:29); user deny `Edit(**/.env)` wins over any allow; taken key-creation 2a needs a permitted narrow write.
- [proof-fixtures](proof-fixtures.md): taken 1a/2a; leftover disposable resources are a blocker recorded with IDs, error, owner and next step.
- [live-change-grant](live-change-grant.md): taken 1a; seats record grant reference, results and created IDs in their pass artifact.
- Off route in CHART.md: writing the existing `failure` record into log.jsonl is its own leaf, not this fork.

## Findings
- Round files: slots/blocker-record-A.md, slots/blocker-record-B.md, slots/blocker-record-merged.md, slots/blocker-record-rebuttal-B.md. B rebuttal R1-R3 applied.
- (A,B) User deny `Bash(* .env*)` (~/.claude/settings.json:58) matches command text, including a blocker sentence (I13) and `bun --env-file .env` (I10). The consumer project already dropped it; the user-level rule remains. Skills put the file name into seat commands (plan-issue:63, implement-issue:55) and forbid any env write (plan-issue:31, implement-issue:45, check-issue:31, merge-issue:29), contradicting key-creation 2a.
- (A,B, B R1) Claude Code deny beats allow and an allow cannot carve an exception. File denies alone do not stop subprocesses, but with sandboxing on they are OS-enforced for spawned processes too, so the operator reconciles all effective tool and sandbox controls. I11's skill exception (merge-issue:29) fixed the instruction, not every harness: `Read(**/.env.*)` (~/.claude/settings.json:46, consumer .claude/settings.json:16) still matches the committed template.
- (B, R3) Inspected defaults, not proven seat runtime: Codex local config `danger-full-access` with no forbid rules (~/.codex/config.toml:3-4); pi seats carry `tamdoma-env-guard` blocking direct and recognized Bash env writes.
- Disagreement resolved: A first proposed an akrogon command family so seat text never names the env file. B: that passes only because the matcher misses it and still needs explicit permission. A accepted. Recommend (A,B) 1a: reconcile at source (operator prerequisite), skills permit declared consumption, by-name checks and the taken producer write into the contract's declared holding repo's real file, never the worktree symlink (B R2); blockers use the existing `phase failed --reason`; check, blocker and producer-save routes demonstrated under the actual consuming harness after reconciliation with throwaway inputs (B R3).
- Research: Trail of Bits claude-code-config; Anthropic "Claude Code sandboxing" (Dworken, Weller-Davies); Claude Code permissions docs; OpenAI Codex rules docs; pi 1.0.0 docs/security.md; all read 2026-10-02.
- Operator prerequisite completed 2026-10-02: the operator removed `Bash(* .env*)` from ~/.claude/settings.json (`sed -i` in the session; grep count 0 afterwards, file parses as JSON). File-tool denies and the `cat`/`head`/`tail`/`less`/`grep`/`sed`/`awk`/`source`/`cp` Bash denies remain. Merge checks reading the committed template: no `sandbox` key in ~/.claude/settings.json, so Read denies do not reach subprocesses; `bun -e` reading framework `.env.example` from a Claude Code Bash call returned 84 lines, exit 0. Framework `merge_checks.verify` (`bun run framework:verify`) includes `verify-secret-env-index.ts`, which reads that file. Limit: the full verify run was not executed.
- Harness probe 2026-10-02T19:03:43+02:00, cwd a scratch dir, prompt "Run exactly this one shell command ... echo \"probe: AKROGON_PROBE_NAME absent from .env\"", throwaway name, no env file read, nothing to clean up:
  - Claude Code 2.1.287, `claude -p <prompt> --model sonnet --dangerously-skip-permissions --output-format json`: exit 0, `permission_denials: []`, result is the echoed line.
  - codex-cli 0.160.0, `codex exec -m gpt-6.1-sol -s danger-full-access --skip-git-repo-check <prompt>` (approval never): exec `/usr/bin/bash -lc 'echo ...'` succeeded, exit 0.
  - pi 1.0.0, `pi --model devin/swe-2-max -p <prompt>`: exit 0, session log shows a `bash` tool call with the exact command.
  - Limits: proves command text naming the env file is not denied under the operator's current user settings for each harness kind. It does not prove the `akrogon phase failed` transition, consumer project settings, or a producer save; seat-input-rules criterion 4 demonstrates the presence and blocker commands per harness, and save-route proofs run at charting of a producer leaf.

## Taken
2026-10-02, operator: `1a`

Reconcile the rules at their source. Human-only prerequisite, owner operator, completion recorded before the affected leaves open: remove the user-level command-text deny `Bash(* .env*)` from ~/.claude/settings.json; keep the file-tool denies and direct dumping bans; explicitly permit the narrow producer-key save in each harness, including the pi `tamdoma-env-guard`; confirm configured merge checks may read the committed `.env.example`. Leaf scope: phase skills permit process consumption for declared checks and live operations, by-name presence results (absent or empty is missing), and only the taken producer-key write into the real file of the contract's declared holding repo, never the worktree symlink; the producer passes the value privately, changes only the named entry, never prints it or puts it in arguments, and revokes it if saving fails. Blockers use the existing `akrogon phase <slug> failed --reason "<blocker and artifact>" --slot <seat>` with name or ID, attempted operation, identity reference, error, owner and next action in the pass artifact, never values. After reconciliation, the presence check, blocker transition and producer-save route are each demonstrated once under the actual consuming harness with throwaway inputs.

Reason: the conflict is between policy sources and declared operations; a helper that passes because a matcher misses it is not authorization and still needs the same rule change.

Foreclosed: 1b akrogon env command family.
