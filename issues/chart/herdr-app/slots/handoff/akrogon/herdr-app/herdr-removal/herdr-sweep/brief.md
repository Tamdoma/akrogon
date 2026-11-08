# Brief: herdr-sweep

## What

After the recorded end-to-end proof, everything left from old herdr leaves akrogon:

- code: the `herdr integration install` loop and any `herdr` call left in `install` and deploy, deploy-listener-ready's plugin conditional, the old `src/shell.ts` exports kept for `observe.ts` and `tests/fake-herdr.ts` (B,E), and a check that `plugin/` is gone (operator 1a);
- tests: `tests/fake-herdr.ts`, herdr fixtures and tests of removed behavior, each deletion with its reason;
- the Tasks mod: `herdr-app/tasks/`, `tests/tasks-mod.test.ts`, `tests/tasks-mod-host.test.ts`, and install's herdr-app mod linking with its stale-link pruning, so the next install removes `~/.config/herdr-app/mods/tasks`;
- wording: README, `docs/` (including `docs/pictures/machine-parts.svg`), `src/` and AREA files, skills and tests describe herdr-core and herdr-app; LESSONS `:11` generalized to the hc process boundary (B) and `:21` retired through the lesson rule, `:43` kept;
- the operator command list for the machine removal steps (2) to (5) and the source checkout save-then-delete step, refined in the implementation report from the Pending steps the door writes at handoff (C).

The rollback guard from engine-on-hc stays (deleted only after no pre-hc release remains).

Consumes from chart-door-on-hc, watcher-on-hc and notices-on-hc (blocked-by): no remaining caller of old herdr in the door, the watcher or notices. Consumes the recorded end-to-end proof (readiness input).

## Why

The operator wants everything old removed with no fallback, after the new path is proven end to end (signposts 2a, 6a; forks/cutover.md; forks/config.md Q2 for the deleted Tasks board).

## Done-criteria

1. `akrogon install` and deploy from this release make no `herdr` call and link no herdr-app mod, and an install over a home holding the old `~/.config/herdr-app/mods/tasks` link removes it. Proof: own tests in the `test` check.
2. A scoped grep for `herdr` over README, `docs/`, `src/`, AREA files, `skills/` and `tests/`, excluding `learnings/history/`, `issues/` and archives, and allowing `herdr-app`, `herdr-core`, `herdr-setup`, `HERDR_APP_HOME`, `herdr.d.ts`, the `"herdr"` mod import and the `herdr` skill, leaves only hits read for substance, none describing old herdr as current. Proof: the grep command and its read hits recorded in the report.
3. LESSONS line 11 (`history/2026-09-10-stderr-json-parse.md`) is generalized to the hc CLI boundary and line 21 (`history/2026-09-28-plugin-cwd-pull.md`) is retired, each through the lesson rule naming its history path; line 43 stays (B). Proof: the LESSONS diff in the report.
4. The implementation report refines the operator command list for removal steps (2) to (5) and the checkout step, each with its check (`herdr plugin list`, `herdr integration status`, `systemctl --user list-units`, `pacman -Q herdr`, path absence), including `~/.config/herdr-app-sessions/infra/mods/tasks` with its absence check (D) and the save-before-delete listing for `infra/herdrdev/` and `infra/herdr-plugins/`. Proof: the report.
5. The leaf's verify `test` duration and today's baseline (median 75 s) are both recorded in the implementation report, and a rise of more than about 10 s is explained there (C).
