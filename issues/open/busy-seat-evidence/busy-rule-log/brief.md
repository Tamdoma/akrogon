# Brief: busy-rule-log

## What
`skills/watch-issues/SKILL.md` changes only in these places:
1. The closer-look line (`:30`) reads a working seat with `herdr agent read <pane> --source visible`, since `--lines 80` is refused while a seat works.
2. The Busy rule (`:40`) judges each working seat from its log: when observe prints ` log<seat>=<path>` for the seat, run `bun <skill-folder>/scripts/log-tail.ts <path>` and judge the existing loop bar on those lines, using the `#`, `old#` and `new#` identities to decide "same command or edit" and "edit-undo" (a `#-` identity never counts as the same command), with `herdr agent read <pane> --source visible` as secondary context. When observe prints ` log<seat>=-`, judge from the visible screen and report "no log" for that seat. (A,B)
3. When `log-tail.ts` exits non-zero for a seat, judge that seat from the visible screen and report "log unreadable: <message>". A read failure alone never justifies a steer, and every other seat is still judged this fire. (A,B)
The loop bar, actions, resteer steps and "insufficient evidence" outcome stay as they are. No elapsed limit is added. SKILL.md stays the only owner of the loop rule; log-tail.ts carries none of it. (A,B)
Consumes: seat-log-path's ` log<seat>=<path|->` field, log-tail's `log-tail.ts <path>` output, and watch-scripts-check's root test.

## Why
Tamdoma/tamdoma-framework#118: during the 2026-10-01 emdash-launch run the Busy rule's read was refused on every fire and the watch judged a 3h seat from about 40 visible lines. This is stage 3 of the issue's spine (`bun test scripts` in `skills/watch-issues`).

## Done-criteria
1. `skills/watch-issues/SKILL.md` no longer tells the watch to run `--lines 80` on a working seat, and states items 1 to 3 above, including the `log<seat>=-` case, the "no log" and "log unreadable" reports, and the identity use.
2. A join test under `skills/watch-issues/scripts/` runs the real observe (fake herdr, typed agent entry pointing into a temp directory, as in seat-log-path's tests) and then the real `log-tail.ts` on the path observe printed for a working seat, holding a copy of one of log-tail's recorded fixtures, and gets expected lines written independently of the script. It proves wiring only, not the watch's judgment. (A,B)
3. The blocking `test` command passes, including watch-scripts-check's root test, which runs the join test. (A,B)
