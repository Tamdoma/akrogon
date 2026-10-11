# Brief: watch-steady

## What
The watch never deletes itself and does nothing for a paused repo. Nothing in akrogon depends on it.

- `skills/watch-issues/SKILL.md` loses its self-delete stop rule (today `:45`) and every reference to it: the refusal to create a job when the rule holds (today `:16-18`), the tick's delete path (today `:38`) and the automatic-stop notice. The watch ends only on `/watch-issues stop`, session loss or the job's own expiry. The text says "never self-deletes", not "runs forever".
- The tick checks pause first: for a repo that `akrogon status` reports paused it observes nothing and acts on nothing. Typed `akrogon next <slug>` skips the pause check (`src/next.ts:738`) through its `false` argument (`:1565-1573`), so the skill must gate it (A,B,C).
- No expiry warning, and no text stating the watch is required.

Owned: `skills/watch-issues/SKILL.md`.

## Why
Tamdoma/akrogon#84: the watch deleted itself when the open tree read empty, worktree-isolation leaves were handed off afterwards, and a failed leaf waited 6.4 hours. The operator runs the watch as a habit and chose to keep it simple, with nothing depending on it (chart night-flow, fork keep-running, W).

## Done-criteria
1. `skills/watch-issues/SKILL.md` has no rule, check or notice by which the watch deletes or declines its own job. It states the watch never deletes itself and ends on `/watch-issues stop`, session loss or the job's own expiry (A,B).
2. The same file tells the tick to check pause before any observation or action, and to run nothing for a repo `akrogon status` reports paused (A,B).
3. A sweep of `skills/`, `docs/` and `README.md` by meaning finds no line stating the watch deletes itself or that akrogon requires the watch; hits outside scope are listed in the report.
