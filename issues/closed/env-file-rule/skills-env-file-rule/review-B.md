# Review B: skills-env-file-rule

Base: 92eb1cf4c2ba293f87234facc2643ddf8d79e090
Reviewed head: 0469b58 skills-env-file-rule: state env-file rule in phase skills, by-name .env check in plan
Diff: 5 files, +10/−1. `git status --porcelain` clean; head is one commit ahead of base.

## Criteria check

1. One rule sentence per phase skill next to the shared-context missing-value stop — verified: plan-issue:31, implement-issue:33, check-issue:27, merge-issue:27, each carrying the four fixed elements (never open/print/append/write `.env`/`.env.*` by tool; `bun --env-file=<file> <script>` prints results not values; presence by name printing `present`/`absent`; absent value ends the pass with the existing stop). `skills/AREA.md:23` names the rule once under Non-obvious patterns; file is 29 lines with the four required sections. Placement matches plan D1 (shared stop, not the credential-specific stop); the brief's "next to that skill's existing missing-value stop sentence" is satisfied — the shared stop is the env-value stop.
2. plan-issue:59 rewritten: "checked by name with `bun --env-file=.env -e 'console.log(["VAR_A","VAR_B"].map(k => k + ": " + (process.env[k] === undefined ? "absent" : "present")).join("\n"))'` with the design names in the list". No "gitignored `.env`" phrasing remains in plan-issue. The embedded script ran verbatim on a synthetic file: `VAR_A: present`, `VAR_B: present` (empty assignment), matching the design's verified form.
3. `grep -rn '\.env' skills/` — 10 hits. Owned-file hits are the four prohibition sentences, the AREA.md bullet, the unchanged `add <VAR> to .env` operator action (implement:43, plan:59), and the by-name check. None instructs a seat to open/read/edit/append. Out-of-scope hits (chart-issues:47, standing-design.md:11, discord-send.test.ts:94) unchanged per design exclusions.
4. `bun test` 244 pass / 0 fail; `bun run format` and `bun run typecheck` exit 0 (report evidence, spot-consistent with the clean diff).

## AREA.md path check

All 10 paths named in `skills/AREA.md` exist from repo root (src/akrogon.ts, tests/install.test.ts, tests/phase.test.ts, skills/init-issues/SKILL.md, skills/implement-issue/SKILL.md, skills/implement-issue/worker-protocol.md, skills/check-issue/SKILL.md, skills/implement-issue/brief-template.md, src/routing.ts, docs/reference-index.md).

## Findings

Nit: plan-issue:59 reads "checked by name with `bun …` with the design names in the list" — a doubled "with" that is slightly awkward but unambiguous; prose style, not a defect.

## Verdict

ready
