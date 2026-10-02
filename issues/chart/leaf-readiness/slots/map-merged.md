# Merged map: Tamdoma/akrogon#52

Sources: map-A.md (A), map-B.md (B). Tags name the slots that independently reached each point.

## Verified facts
- V1 (A,B) The door already required credential listing and one real call per external operation (a72fa61, 2026-09-28) before the emdash charts (2026-09-29/30). The prose rule existed and leaves still failed. More prose alone repeats it.
- V2 (A,B) Worktrees are plain `git worktree add` (src/next.ts:264-269), seats start in the worktree (src/next.ts:343-353), no env file reaches it. Plan's literal `bun --env-file=.env` reads the wrong place there (skills/plan-issue/SKILL.md:63).
- V3 (A,B) `failure {cause, phase, slot, reason}` already lives in state (src/state.ts:11-17, d058236). Only log.jsonl drops it (src/log.ts:18-31). Intake's "free text, nothing records cause" is half stale.
- V4 (A,B) User deny `Bash(* .env*)` is a command-text match. It blocks harmless reason text, does not stop bun reading the file. Read/Edit denies are the real guard against values in transcripts. Project allows cannot override a user deny.
- V5 (B) Presence checks test `undefined` only; consumer secret-env rejects empty strings. Empty must count as missing.
- V6 (B) Intake numbers are a snapshot; fleet-backup's current blocker is browser timeouts, not credentials. Offer-join's registry file now exists.
- V7 (B) The I2 DNS miss came from a transitive call (fixture creation through existing launch/go-live), not the new flow. Operation inventory must include transitive and cleanup calls.
- V8 (B) R2 locks are removable before emptying on a test bucket; a production backup lock must never be relaxed.

## Forks, reshaping order
- D1 (A,B) Readiness: structured per-leaf contract checked before dispatch, or keep prose audit. Both recommend the contract. Detail differs: A = env names + required files, dispatch checks presence only; B = also identity/target, proof references and authorization, still no live calls from code. Merged recommendation: one contract holding names (with which repo's env), files, proof refs and granted live changes; dispatch checks presence/non-empty and file existence and that proof refs exist; no live calls.
- D2 Env source for seats. A: symlink root's gitignored env into the worktree (bun autoloads from cwd, existing scripts and `checks` work unchanged, operator edits once). B: explicit registered-root path passed as non-secret context (no write-through path, no copy). Both reject copying and injecting values into tab env (A,B).
- D3 (B) Who creates missing credentials: operator batch before handoff, or agents using existing creation authority writing to `.env`. A did not raise it. Intake asks for it ("including creating and providing API keys").
- D4 (A,B) Live-change authorization recorded at chart as named targets and operations incl. cleanup; seats treat it as granted. B adds: new targets or materially different mutations need new authorization.
- D5 (B) Proof fixtures: disposable by default, deleted with the same identity; never relax a real backup lock.
- D6 (A) Blocker recording without tripping deny rules: route presence checks through one akrogon command that reads the root env by name, so seats never type env paths; or the operator reconciles user deny rules (B prefers reconciling at the source, V4).

## Direct, no fork
- (A,B) Write the existing `failure` record into log.jsonl on moves to failed.

## Destinations
- akrogon: readiness mechanism (D1, D2, D3, D4, D6) and failure log line.
- framework, operator steps only (B): current emdash epic inputs, user settings, cleanup ownership. Not a leaf; `issues/` edits are operator steps on main.
- Off route (A): `.env.example` drift script, registry content, R2 retention design. Consumer repo.

## Round 1 draft (D1)
Q1 Should a leaf carry a structured readiness contract that `akrogon next` checks before it starts a seat?
- 1a (rec, A,B) Yes. Door writes it, `next` refuses dispatch while any declared input is absent or empty, `status` lists every gap across open leaves so the operator fills them in one pass. No live calls from akrogon.
- 1b Keep prose plus a stricter door audit. Cheapest, same mechanism that failed (V1).
Research: better-than-training · GitHub Docs, Reuse workflows (docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows, read 2026-10-02) · a reusable workflow declares required secrets in its contract and GitHub rejects a caller that does not supply them before jobs run · supports 1a.
Pitfalls: a gate that checks names cannot prove scopes; revocation after dispatch still fails mid-leaf; inputs produced by a prerequisite leaf must name that producer, not block dispatch before it exists (B).
