# patch-mechanism rebuttal — slot C, 2026-11-07

Attributions to me are correct. One pick I move, one disagreement, one omission.

1. Q1 source patches: I move from "last resort" to A/E's "never" with D's rider. Signpost 3 asks for patches "that will survive upstream updates", and a source build "never updates" (AGENTS.md:674), so a source patch fails the signpost's own test by construction; writing a last-resort rule now designs the rejected machinery (path unit, timer, toolchain pin) for a gap no taken fork has. If such a gap ever appears, it is a new operator decision (D), not a prepared path.

2. Q2 E's capability assertions (`hc schema` method list, `herdr-app commands` names) in herdr-setup tests: a disagreement. They are a second copy of the contract that drifts on its own schedule, and every failure they would catch (a method or command gone) also fails the behavior test that calls it, in the same run, with a better message. Keep the tests that exercise the call (`doc.set` then re-read, notice file written then gone); drop assertions on the catalogue. `herdr-app check` in `./install` is fine: it is already herdr-setup's own check entry.

3. Omission that belongs in the post-update check (B/D's one entry point): `HC_SESSION` is undocumented and herdrapp's whole session model rests on it (`herdr-setup/README.md` Sessions: "a Herdr update could change it"). The check runs `herdrapp session list` and `hc ls` inside a named session after each core update; akrogon's per-session app home (`HERDR_APP_HOME`, notices and weights helper) depends on the same variable, so a silent change there breaks every herdr-setup patch at once, not one mod.
