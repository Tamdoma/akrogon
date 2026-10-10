# Brief: merge-bounce-rounds

## What
Every `merge -> check.fix` transition increments `fix_rounds` (src/phase.ts:151 today counts only `check.repair -> check.fix`), and the existing cap (src/phase.ts:302) applies to that origin. Counts already stored are unchanged. `--red-on-base` holds are not transitions and are not counted. B-only re-review after the repair is unchanged (src/routing.ts:54).

## Why
Merge bounces are uncapped today: a leaf can bounce from merge forever, each bounce costing a serial merge run (#72).

## Done-criteria
1. A leaf moved merge -> check.fix has fix_rounds one higher than before.
2. A leaf at the fix_rounds cap moved merge -> check.fix gets the same cap outcome as a check.repair origin at the cap, with the failure record naming `merge` as the phase it failed from (src/phase.ts:312) (A,C).
3. A `--red-on-base` hold leaves fix_rounds unchanged.
4. docs/guide/phases.md (or the page describing fix_rounds) states merge bounces count.
5. The blocking `checks` pass.
