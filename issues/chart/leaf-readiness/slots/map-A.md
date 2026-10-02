# Map A: Tamdoma/akrogon#52

## Intake verification
- Confirmed: worktree via plain `git worktree add` (src/next.ts:263-268), seat cwd = worktree (src/next.ts:316-327 placement `--cwd worktree`), no env file linked.
- Confirmed: stateSchema has no inputs field (src/state.ts:35-58). preflight is git-only (src/preflight.ts).
- Stale: "failed reason is free text, nothing records cause". state.ts:10-16 has `failure {cause, phase, slot, reason}` since d058236 (2026-09-19). True part: log.jsonl rows omit it (src/log.ts:16-31).
- Stale/important: the door's credential-listing rule and the one-real-call proof rule landed a72fa61 on 2026-09-28, before the emdash charts (framework commits 2026-09-29/30). Prose rules existed and leaves still failed. So more prose is not the fix.
- Confirmed P2: user deny `Bash(* .env*)` (~/.claude/settings.json) is a text match on the command line. It blocks any command containing " .env", including a `--reason` string. It does not block reading: bun reads the file freely. Read/Edit tool denies are the real guard against printing values into a transcript.

## Forks (order: most reshaping first)
F1. Where are a leaf's required inputs declared and checked?
 - a (rec) Machine field in leaf state (`needs`: env names, required files) written by the door; `akrogon next` refuses to dispatch until met, and `akrogon status` lists every unmet need across all open leaves so the operator fills them once per epic. Wins: blockers move from seat time to a cheap pre-dispatch gate; prose rule already failed.
 - b Keep prose in briefs, add a door audit. Cost: same mechanism that failed in emdash.
F2. How does a seat see the registered checkout's env file?
 - a (rec) At worktree creation, symlink configured gitignored files (default `.env`) from the registered root into the worktree, refusing when the file is not gitignored there. One source of truth, operator adds a key once and every live leaf sees it, bun autoloads it from cwd so seats never type the path.
 - b Copy (Claude Code `.worktreeinclude` precedent). Cost: stale copy after the operator adds a key mid-run, the exact recovery path.
 - c Inject values into tab env. Cost: every process and `env` dump exposes all secrets; widens exposure.
F3. Does the gate verify scopes/hostnames with live probes at dispatch, or names/files only?
 - a (rec) Names + files at dispatch; scopes stay with the door's existing one-real-call proof, plus each `needs` entry may carry a read-only probe command the door already ran. Cheap, no live calls from the dispatcher.
 - b Dispatcher runs probes every dispatch. Cost: live calls from a scheduler, credentials used outside seats.
F4. How are live mutations authorized?
 - a (rec) Door records authorized live changes (accounts, resource classes, cleanup) as a binding decision in the brief; review/repair seats treat them as granted, never as Operator actions. Removes the 8 h wait (I6).
 - b Seats ask per run. Cost: status quo.
F5. How does a seat record a blocker without tripping text deny rules?
 - a (rec) Skills stop putting env-file names in command text: presence checks go through one akrogon command reading the root file by name; failed reasons name the variable only. Deny rules stay as they are.
 - b Operator loosens `Bash(* .env*)`. Cost: weakens a guard the operator chose; outside akrogon.

## Direct (no fork)
- Log `failure` (cause, reason) into log.jsonl rows for moves to failed.

## Off route (consumer repo, separate intake if wanted)
- P1 `.env.example` vs secret-env index drift (framework verify script).
- P4 canonical `deploy-accounts.yaml`, test hub, hostname (framework registry content).
- P7 R2 30-day lock, gh `delete_repo` scope (framework design + operator token).

## Split
One destination: akrogon. Issue `leaf-inputs`:
- `worktree-env-link` (F2), independent.
- `leaf-needs-gate` (F1, F3): state field, next gate, status listing, door writes it.
- `blocker-record` (F5 + log failure): skills + log.ts.
- `live-change-grant` (F4): chart shapes + check/implement skills.
`leaf-needs-gate` presence check uses the root file path, not the link, so no real dependency on `worktree-env-link`.

## Research
- better-than-training · code.claude.com/docs/en/worktrees (2026-10-02) · Claude Code copies gitignored files listed in `.worktreeinclude` into new worktrees, only when gitignored · precedent for F2, copy not link.
- practitioner-adjacent · MindStudio playbook (mindstudio.ai/blog/parallel-agentic-development-git-worktrees, 2026-10-02) · advises copy, not symlink, so one agent's edit does not leak · flips here: seats are forbidden to write env files, and the operator edits once.
- better-than-training · bun.sh/docs/runtime/env · bun autoloads `.env` from cwd · symlink makes worktree behave like root with no flag.
