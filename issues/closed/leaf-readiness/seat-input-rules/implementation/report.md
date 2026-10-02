# Implementation report: seat-input-rules

Base: `7c1567dbed492608e8cc104999c401b85d6db408` · Head: `5fff7dc` (branch `seat-input-rules`)

## Changed files and reasons

All changes are committed on the lane; leaf artifacts live only in this folder (registered checkout), not the worktree.

| Commit | Files | Why |
|--------|-------|-----|
| cef12e1 | `skills/plan-issue/SKILL.md` | New env rule (presence via `akrogon status <slug>` `Missing:` lines), `plan.synthesis` credential check rewritten off the `bun -e` one-liner, producer-save (`produces[].save`) and grant-reuse (`grants[]`) rules, blocker artifact fields |
| 85d1c32 | `skills/implement-issue/SKILL.md` | Same env rule, producer-save and grant-reuse rules, `Missing:`-sourced credential-absent paragraph, blocker artifact fields on all three stop sentences |
| da2592b | `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md` | Env rule, grant-reuse and fixture-cleanup (`fixtures[].cleanup`, `absence_check`, `retained[]`) rules, blocker artifact fields; `.env.example` merge-check exception kept verbatim; check-issue `check.repair` routing untouched |
| 5fff7dc | `skills/AREA.md` | Env-file invariant line rewritten to name `akrogon status` `Missing:` checks; file at 31 lines, 4 `##` sections |

No `src/` changes; no tests added — prose skill text is judged at review against the binding decisions (lesson 2026-10-01).

## Criterion → evidence

1. **Env rule once per skill + AREA.md invariant + `akrogon status` credential check.** Diff shows the env paragraph replaced in all four SKILL.md files (each beside its operator-blocker stop), `plan.synthesis` now checks names against `Missing:` lines, AREA.md:24 names the invariant. `grep -n 'env-file=.env -e\|bun -e' skills/` → no presence-check one-liner remains.
2. **Rule placement.** plan-issue + implement-issue carry `produces[].save` and `grants[]`; all four carry `grants[]` reuse and the extended blocker record (name/ID, attempted operation, identity reference, error, owner, next action, never a value); check-issue + merge-issue carry `fixtures[].cleanup`, `absence_check`, `retained[]`. Each names its `readiness.yaml` field.
3. **check-issue:69 routing unchanged.** `git diff` shows no hunk in `check.repair`; `required live runs` and `Handed to A` text intact.
4. **Live demonstration.** See table below; transcripts beside this report.

### Live demo evidence (criterion 4)

Scratch `AKROGON_HOME=/tmp/seat-demo-r9BvTd/home`, scratch repo `scratchrepo` (cloned from a bare local origin so `phase failed` log writes succeed; first attempt without origin exited 1 on `logMove` — rebuilt, rerun, recorded here). One leaf per harness under `issues/open/demo/seat-demo-<harness>/` declaring input `AKROGON_DEMO_THROWAWAY_<H>` absent from `scratchrepo/.env` (no `.env` file exists; nothing real touched). Akrogon invoked as the worktree entry point `bun .../seat-input-rules/src/akrogon.ts` because the installed `~/.local/bin/akrogon` shim points at the main checkout, which predates the `Missing:` feature.

| Harness | Invocation (template + flags) | Version | Command exits | `failure.reason` recorded | Transcript |
|---------|------------------------------|---------|---------------|---------------------------|------------|
| claude | `claude --settings '{…CLAUDE_CODE_SUBAGENT_MODEL…}' --dangerously-skip-permissions -p --output-format json <prompt>` | 2.1.287 | status 0, phase 0 | `missing AKROGON_DEMO_THROWAWAY_CLAUDE in scratchrepo/.env blocks the presence-check demo; see blocker.md in the leaf folder` | `implementation/transcript-claude.json` |
| codex | `codex -m gpt-6.1-sol -c model_reasoning_effort=medium -a never -s danger-full-access exec --json <prompt>` | codex-cli 0.160.0 | status 0, phase 0 | `missing AKROGON_DEMO_THROWAWAY_CODEX in scratchrepo/.env blocks the presence-check demo; see blocker.md in the leaf folder` | `implementation/transcript-codex.jsonl` |
| pi | `pi --model devin/swe-2-max --thinking high -a --exclude-tools request_user_input --print --session-dir <scratch>/pi-sessions <prompt>` | 1.0.0 | status 0, phase 0 | `missing AKROGON_DEMO_THROWAWAY_PI in scratchrepo/.env blocks the presence-check demo; see blocker.md in the leaf folder` | `implementation/transcript-pi.jsonl` (+ `transcript-pi.stdout.txt`) |

Each harness printed the `Missing:` line, wrote a `blocker.md` artifact (input name, attempted operation, seat identity, error, owner, next action, no values), ran the blocker command whose reason names the input and `.env`, and `state.yaml` records `cause: blocked`, `delivery: shown`. Harness exits: all 0. No `.env`/` .env.*` was opened or written anywhere (scratch has none; transcripts show none). `claude` has no configured slot, so the template's `{model}`/`{effort}` placeholders were left unset (defaults); all other flags mirror `akrogon config` `harnesses` as of 2026-10-02. Wall time per harness run: ~1–2 min each (claude needed two attempts including the scratch-repo rebuild; reported exit statuses above are the successful recorded runs).

## Commands run

- `bun test --changed="$AKROGON_BASE" --timeout=30000` after each cherry-pick → `0 pass 0 fail` (markdown-only diff, no test files affected) ×4.
- `bun run format` → all files unchanged.
- `bun run typecheck` (`tsc --noEmit`) → exit 0.
- `bun test --timeout=30000` → 383 pass, 0 fail, 17 files, 11.48s.
- `herdr notification show` probe → `{"shown":true,"reason":"shown"}` (announce path verified before demo).
- Harness demo commands per table above; scratch home/repo deleted after transcripts were copied.

## Worker execution

Units U1–U4 ran as workers in detached worktrees `seat-input-rules-u1..u4`, committed their chunk each (`13b2197`, `7c5d187`, `8b5d4f7`, `a09e9d3`), cherry-picked serially onto the lane with changed-test runs between picks; worker worktrees removed. Returns: `implementation/return-1..4.md`.

## Known limitations

- The `akrogon` shim at `~/.local/bin/akrogon` resolves to the main checkout, which lacks the merged `Missing:` feature; demo used this worktree's `src/akrogon.ts`. Once main is updated, the plain `akrogon` command reproduces the same output.
- `pi` printed `Model "swe-2-max" not found for provider "devin". Using custom model id.` — execution still completed with exit 0.
- `status <slug>` has no "present" lines; presence is inferred from absent `Missing:` lines (schema's `inputs` is the authority).

## Unverified criteria

None.
