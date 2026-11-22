# Design: agy-skill-link

## Binding decisions, verbatim

From issues/chart/watch-any-harness/forks/signposts.md `## Taken`:

> Operator, 2026-11-20, door t126, verbatim: "1a | 2a | 3a | 4a | 5a - the script goes into the skills scripts folder or whatever the akrogon convention is | 6a - Do testing, do all functions testing E2E to make sure it works. I don't want any regressions compared to the Claude only functionality that we have right now. Come up with tests for different use cases so we don't miss anything. | Yes, you have the permission N1"

> Correction, operator 2026-11-20, door t126 (asked as S1 and S2 after the timer-design final-shape check found two picks against 2a and 5a), verbatim: "s1 - it needs to be symlinked to agy, like what you're doing for the other 3. Same pattern | s2a |"
>
> Read as: 5a widened to one install change: akrogon's install links every skill into agy's global skill folder `~/.gemini/config/skills`, the same pattern as the other roots.

From issues/chart/watch-any-harness/forks/timer-design.md `## Taken` (A's pick under autopilot recording the operator's S1):

> 8. Q7 (operator S1): `src/install.ts` planSkillLinks links every akrogon skill into agy's global folder `~/.gemini/config/skills`, the same way and with the same stale-link and conflict handling as the other roots.

Exclusions: every other timer-design item (timer, tick text, one watch per repo, cron removal, live proof) belongs to leaf watch-timer; this leaf changes no skill text and no doc beyond the install root list.

Standing design: /home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation for this leaf: the criteria are mechanical and proven by the repo's existing install tests under the `test` check, with one deliberate break (the root left out of the plan) turning the new expectation red; no live agy session is needed, since P3 (forks/timer-design.md) already observed agy loading a skill linked into that folder, and no new machinery is built. The test asserts the agy destination `<home>/.gemini/config/skills/<skill>` by its literal path, so leaving the root out of the plan turns it red, while it enumerates the skills from the source `skills/` folder rather than a copied list (B L11).

## Leaf architecture

Owned surfaces: `src/install.ts` `planSkillLinks` (the `roots` list; the stale scan loops over the same list), `tests/install.test.ts`, and docs/start/install.md, which lists the four skill roots (C 4).

Consumers of the changed state: `src/install.ts` install and the deploy `links` step in `src/self-update.ts` (C 4), both through `planSkillLinks`; no other consumer reads the root list.

Exclusions: no agy config edit (`~/.gemini/config` files other than skill links), no change to which skills exist, no watch-issues change (leaf watch-timer).
