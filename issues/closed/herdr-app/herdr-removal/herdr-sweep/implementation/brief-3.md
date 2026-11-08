# Brief 3: docs, skills, AREA files and lessons (U3)

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/herdr-sweep-u3` (detached at the leaf head `b39d82fd`). Leaf plan: `/home/ivan/Work/infra/akrogon/issues/open/herdr-app/herdr-removal/herdr-sweep/plan.md` (D9, D10; end state from D1-D8).

## 1. Goal

README, `docs/`, `skills/` and the AREA files describe herdr-core (`hc`: terminals, labels, events, `hc send` / `<hc>` messages, the listener unit) and herdr-app (window, spaces, tabs) as current, never old herdr (panes, the herdr plugin, `herdr agent`, `herdr integration`). LESSONS line 11 is generalized and line 21 retired through the lesson rule. Decisions D9, D10.

## 2. Acceptance criteria

1. This command, run in the worktree, prints no hit in `README.md`, `docs/`, `skills/` or any `AREA.md` that describes old herdr as current (hits in `src/` and `tests/` other than AREA files belong to other units):
   `git grep -n -i -I herdr -- README.md docs skills '*AREA.md' | grep -viE 'herdr-app|herdr-core|herdr-setup|HERDR_APP_HOME|herdr\.d\.ts|from .herdr.|herdr skill|/herdr\b'`
   Allowed after reading: `herdr.tab` / `herdr.space` label keys (herdr-app's labels), recorded transcript data in `skills/watch-issues/scripts/fixtures/*.jsonl` (leave those files untouched), text that describes pre-hc data as history.
2. The concrete edits in section 4 are made, each true to the code at `src/` (read the code; do not guess).
3. `learnings/LESSONS.md`: line 11 is rewritten in place to the general outside-CLI stderr boundary, keeping `history/2026-09-10-stderr-json-parse.md`; line 21 is removed; line 43 (`headless-output-freezes-window`) is unchanged; nothing else changes.
4. `learnings/history/2026-09-10-stderr-json-parse.md` gets one appended dated paragraph (the old case text stays). `learnings/history/2026-09-28-plugin-cwd-pull.md` gets one appended line `Applied 2026-11-08 by src/install.ts:<line of linkServices after U1>: ...` (see section 4).
5. Each edited AREA file stays at most 40 lines with exactly the second-level sections Commands, Key files, Non-obvious patterns, See also.
6. `tests/docs-links.test.ts`, `tests/command-reference.test.ts` and `tests/lessons.test.ts` pass.

## 3. Read first

- `docs/reference-index.md`, `docs/reference/where-things-go.md`, `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md`.
- `src/hc.ts:1-20` and `src/AREA.md:18` (how akrogon talks to hc and herdr-app), `src/install.ts` (current install), `systemd/akrogon-listener.service`.
- `skills/lesson-rule.md` (Match, Retire clauses), `learnings/LESSONS.md`, the two history files above.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Change list (end state other units deliver; describe it, do not edit their files)

End state of the leaf, for wording:
- `akrogon install` links the binary, `akrogon.slice`, every skill into the four agent roots and the listener unit `akrogon-listener.service` when the release ships it; reloads the user manager, enables and restarts the listener. It makes no `herdr` call and links no herdr-app mod. It still prunes stale akrogon-owned links, including any left in `~/.config/herdr-app/mods` (the old `tasks` link). Deploy does the same links and prune before flipping `current`.
- `herdr-app/tasks/` (the Tasks board mod) is deleted, with its tests.
- `src/shell.ts` holds process helpers only (`run`, `command`, `spawnCaptured`, `retryCommand`, `quote`, `writeYaml`, `CommandError`, `DISCOVERY_DEADLINE_MS`); its old herdr pane/session code is deleted.
- `tests/fake-herdr.ts` is deleted; `tests/isolation.ts` no longer builds a fake herdr bundle; `tests/helpers.ts` `fakeHerdr` becomes `procFixture(f)` returning `{ env }` (proc root, run dir, leaf and retired temp roots); `tests/helpers.ts` gains `herdrStub(bin)` / `herdrCalls(bin)`, a recording `herdr` used only to assert install and deploy make no herdr call. `tests/deploy-shapes.test.ts` runs `selfUpdate` in-process and reads systemctl calls in order; with the stub it asserts no herdr call.
- Version checks: `hc --version` prints `hc <number>`; `herdr-app --version` prints `herdr-app <number>`.

Edits:
- `README.md:3` and `:13` (requirements): seats run in herdr-app tabs on herdr-core; requirement list names herdr-core (`hc`) and herdr-app.
- `docs/reference-index.md:3`: replace "every herdr call carries `--session <name>` from the resolved repo session" with the hc fact from `src/AREA.md:18` (every hc call pins `HC_SESSION`).
- `docs/start/install.md`: requirements (`:3`, `:11`), version check line `:26` (use the two commands above), `:38` (what install reads config for: harness names are no longer used by install; read `src/install.ts` and say only what is true), `:75-77` (replace the plugin and `herdr integration install` paragraph with the listener unit behavior and the mods prune).
- `docs/start/what-it-is.md:14`, `:30`; `docs/start/one-change.md:33`; `docs/use/autopilot.md:9`; `docs/use/plan-work.md:26`; `docs/use/run-work.md:80`: describe hc terminals and herdr-app tabs, hc events and `hc send` instead of Herdr panes and Herdr events. Read the linked skill or code before writing each sentence.
- `docs/reference/state-and-phases.md:90`, `:94`, `:114`, `:118`: the `tab` and `pane` rows and the delivery/command lines, true to `src/state.ts` (read its schema; `pane` may be legacy pre-hc state that a strict parse refuses with "state predates hc"; `seat` records `session` and `address`).
- `docs/reference/releases-and-updates.md:42` only if it names the plugin or herdr.
- `docs/pictures/machine-parts.svg`: `<title>` and the two `Herdr pane: seat A/B` labels become hc terminal wording; keep the layout. Also update the alt text of its image in `docs/start/install.md:15` if it names Herdr panes.
- `skills/implement-issue/brief-template.md:47`: the boundary sentence names `hc` / herdr-app / gh replaced at one boundary (the suite uses a real throwaway hc core per fixture and a strict fake `herdr-app`, never the real window or real sessions); no herdr socket.
- Any other `skills/**` hit from criterion 1 that describes old herdr as current.
- `src/AREA.md:11` (install line: drop the herdr-app mod link part, say install prunes the old mods link), `:15` (drop `src/shell.ts` from the guard sentence if it no longer holds guards; read `src/phase.ts` and `src/shell.ts` to be exact), `:26` (delete the `herdr-app/tasks/` line).
- `tests/AREA.md:11` (isolation: no fake herdr bundle), `:28` (deploy-shapes: no "drop herdr" and "systemctl and herdr log to one file"; say it reads systemctl calls in order and asserts no herdr call), and any line naming `tests/fake-herdr.ts` or the Tasks mod tests.
- `learnings/LESSONS.md:11` new text, close to: `- process boundary: an outside CLI's stderr may be plain text (a panic, usage error or socket failure) even when it normally writes JSON errors; herdr's \`retryable\` parsed it unguarded and lost the real body as a SyntaxError. Parse external stderr (\`hc\`, \`gh\`) behind a guard and keep the raw text. 2026-09-10. history/2026-09-10-stderr-json-parse.md`
- `learnings/history/2026-09-10-stderr-json-parse.md` append: `Generalized 2026-11-08 by herdr-sweep: the herdr site (\`retryable\` in \`src/shell.ts\`) is deleted with old herdr; the class still applies to every outside CLI. \`src/hc.ts\` \`errorKind\` parses hc stderr with a \`SyntaxError\` guard and keeps the raw text on \`HcError\`; it has no dedicated test.`
- `learnings/LESSONS.md:21`: delete the line. `learnings/history/2026-09-28-plugin-cwd-pull.md` append: `Applied 2026-11-08 by src/install.ts (linkServices): akrogon ships no herdr plugin (\`plugin/\` removed by engine-on-hc) and install and deploy make no \`herdr plugin link\` or \`herdr integration install\` call, so no akrogon command runs as a herdr plugin hook.` Use `src/install.ts` without a line number (the line moves when U1 lands).

Prerequisites: none. Owned paths: `README.md`, `docs/**`, `skills/**` (wording only, not `skills/watch-issues/scripts/fixtures/`), `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md`, `learnings/LESSONS.md`, the two history files. Shared test resource: none. Unit U1 edits `src/install.ts`, `src/self-update.ts`, `herdr-app/` and install/deploy tests in parallel.

## 5. Do-not, reasons and exceptions

- Do not edit any `src/*.ts`, `tests/*.ts`, `herdr-app/` or `issues/` path: other units own them, and a leaf touches no `issues/` path.
- Do not edit `learnings/history/` beyond the two appends, and never rewrite the historical case text: the lesson rule keeps history.
- Do not change other LESSONS lines, and do not run `/seed-issue` for line 11 (plan D10: after the sweep the unguarded pattern is not reachable, so it is not Checkable).
- Do not add docs, sections or pages; rewrite only the lines that describe old herdr as current.
- Do not invent behavior: every sentence must match the code you read. If code and this brief disagree, return a mismatch.
- Do not run `bun run format`; prettier is not configured for docs, so no formatting run is needed.
- Any scope change: return a mismatch with evidence; the exception is a revised brief from A.

Reasons restated: other units' files would conflict; history is append-only; seeding is decided in the plan; scope stays at wording; docs must be true to code. Exception: a revised brief from A.

## 6. Ordered steps

1. Run the criterion 1 grep; read each hit.
2. Edit README and docs (criterion 2), svg.
3. Edit skills hits.
4. Edit AREA files (criterion 5).
5. LESSONS and history (criteria 3, 4).
6. Install deps once: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`; run section 7; rerun the grep and keep it.
7. Commit once.

Advisory size: about 18 files, under 60 turns.

## 7. Commands

- `akrogon run-check --name u3-grep -- sh -c "git grep -n -i -I herdr -- README.md docs skills '*AREA.md' | grep -viE 'herdr-app|herdr-core|herdr-setup|HERDR_APP_HOME|herdr\.d\.ts|from .herdr.|herdr skill|/herdr\b'; true"`
- `akrogon run-check --name u3-tests -- bun test --timeout=30000 tests/docs-links.test.ts tests/command-reference.test.ts tests/lessons.test.ts`

## 8. Done-when, evidence and report

Done when criteria 1-6 hold, with the grep output and its reading of each remaining hit in the report, and the tests command cited by its `check <label>: <exit> <path>` line.

Commit message: `docs: describe herdr-core and herdr-app, retire the herdr plugin lesson` with a body naming D9, D10, and this final trailer block:

```
Test-Change: tests/AREA.md brief "wording: ... AREA files ... describe herdr-core and herdr-app": fake herdr, Tasks mod and deploy-shapes lines rewritten for the end state; no test expectation changed
```

Do not add a co-author line.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
