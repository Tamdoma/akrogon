# Brief: busy-age-label

## What
The watch-issues observer prints a seat's age as busy time: `A=<pane>/<status> busy=<h>h<mm>m` instead of `A=<pane>/<status>+<h>h<mm>m`. The value still comes from `busy_since`. No new state is recorded.

## Why
`busy_since` is kept across working and blocked (`src/next.ts:196`), and `observe.ts:224-227` prints it right after the status, so `blocked+1h40m` reads as 1h40m blocked when most of it was working time (Tamdoma/akrogon#32, F4).

## Credentials
None.

## Done-criteria
1. For a seat with `busy_since` set, the observer line shows ` busy=<h>h<mm>m` after the status. For a seat without it, nothing is appended.
2. An unparsable `busy_since` and a future `busy_since` keep today's behaviour (no suffix, and zero age respectively).
3. `skills/watch-issues/SKILL.md:28` documents the new format.
4. Running the observer script against a fixture repo with one busy seat prints the new line. The test saves the output to a file under the OS temp dir, and the implementation report records that path.
5. The configured `checks` commands pass.
