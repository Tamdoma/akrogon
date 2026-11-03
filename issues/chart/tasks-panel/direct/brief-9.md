# Direct brief 9: Tasks board speed and look (attempt 2)

Operator, 2026-11-03, on the live board in the herdr-app test window:
- "the tasks still looks terrible, and it's VERY slow when I click on the actual agent"
- Q2 O1, then Q4: "the same ones that herdr-app is using only appropriate size. Icons no letters, but here they need to be big to fit the design."
- Q3: "increase the Tasks overall font size by a bit. Increase it to what we have by default here in normal terminals."
- Shared look decision D19: `issues/chart/herdr-panels/direct/plan.md` Implementation notes (herdr-app shipped mods' geometry, Omarchy's controls).

Done criteria (each with its proof):
1. A click on a row or any fold redraws at once, not on the 30 s tick. Proof: `tests/tasks-mod-host.test.ts` "a click on a row or a fold redraws at once" (red before `toggle(slug, cx)`), and the live window.
2. A row shows both seats as herdr-app's own program icons (knownAgents `icon`, `tint`), sized to the row, no seat letters; a working seat's icon is the Agents-list spinner. Replaces tasks-mod brief criterion 2's "<logo>A <logo>B". Proof: host test "a row shows both seats as program icons without letters; a working seat spins".
3. Every size scales from `settings().font_size` (Herdr's documented terminal default 14 when unset, AGENTS.md Fonts). Proof: `herdr-app check herdr-app/tasks`, typecheck, live shot `issues/chart/herdr-panels/direct/live/ui-after-tasks-icons.png`.
4. Stage pills take the Agents list's status shape over the locked opaque base (look.md; host test "stage tint is composited over the pills own opaque theme background" unchanged). The second line does not repeat the group heading above it and is left out when empty; an unknown time shows nothing. Proof: `tests/tasks-mod.test.ts` "a leaf row under its group heading does not repeat the group on its second line".
5. Existing tests pass: `bun test tests/tasks-mod.test.ts tests/tasks-mod-host.test.ts`, `bun run typecheck`, `herdr-app check herdr-app/tasks`.
