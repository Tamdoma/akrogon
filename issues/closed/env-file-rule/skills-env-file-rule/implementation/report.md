# Implementation report: skills-env-file-rule

Base: 92eb1cf4c2ba293f87234facc2643ddf8d79e090
Head: 0469b58 skills-env-file-rule: state env-file rule in phase skills, by-name .env check in plan

## Changed files and reasons

- `skills/plan-issue/SKILL.md` — rule sentence appended after the shared-context stop (:31); :59 rewritten so the credential check is the by-name `bun --env-file=.env -e '<script>'` presence check printing `present`/`absent` per name, with the rest of the stop verbatim.
- `skills/implement-issue/SKILL.md` — rule sentence after the shared-context stop (:33); :43 credential stop unchanged.
- `skills/check-issue/SKILL.md` — rule sentence after the shared-context stop (:27).
- `skills/merge-issue/SKILL.md` — rule sentence after the shared-context stop (:27).
- `skills/AREA.md` — one "Non-obvious patterns" bullet naming the env-file rule as an invariant of every phase skill (file now 29 lines).

One worker (brief-1) made the edits; B aligned the embedded script's separator to the design's verified form (`VAR: present`).

## Commands run

- `bun test --changed="$AKROGON_BASE"` (base 92eb1cf): 5 changed files, no test files affected, 0/0.
- `bun test`: 244 pass, 0 fail, 12 files.
- `bun run format`: exit 0, no changes.
- `bun run typecheck` (`tsc --noEmit`): exit 0.
- `bun --env-file=<synthetic> -e '<presence script>'`: `VAR_A: present`, `VAR_B: present` (empty assignment), `VAR_C: absent` — verified during planning.

## `.env` matches under `skills/` (criterion 3)

Owned files (compliant — prohibitions, by-name checks, or the operator `add <VAR> to .env` action; none tells a seat to open/read/edit/append):

- `skills/AREA.md:23` — the rule bullet.
- `skills/check-issue/SKILL.md:27` — the rule sentence.
- `skills/implement-issue/SKILL.md:33` — the rule sentence.
- `skills/implement-issue/SKILL.md:43` — unchanged credential stop; `add <VAR> to .env` is the operator action.
- `skills/merge-issue/SKILL.md:27` — the rule sentence.
- `skills/plan-issue/SKILL.md:31` — the rule sentence.
- `skills/plan-issue/SKILL.md:59` — rewritten by-name check plus unchanged operator action.

Out of scope, unchanged:

- `skills/broadcast-issue/scripts/discord-send.test.ts:94` — `process.env` spread in a test.
- `skills/chart-issues/SKILL.md:47` — briefs list credentials by name; unchanged per design.
- `skills/chart-issues/assets/standing-design.md:11` — standing design; unchanged.

## Known limitations

Prose only; hard enforcement is the pi-extensions guard (leaf `env-guard-hooks`, Tamdoma/akrogon#22), unmerged. Until it lands a seat can still open the file, but no refusal will surprise it.

## Unverified criteria

None.
