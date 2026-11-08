# Round 19, slot C: herdr-app 0.1.14 vs akrogon main 873fac4c

Answer: nothing to remove, nothing to fix. akrogon calls herdr-app in one place (`src/hc.ts:526-540`: `ls` as the window check, `do tab.rename`, `do tab.close`), reads its hc document (`src/hc.ts:163-199`), and writes notice files (`src/notice.ts`). No changelog line changes any of those. Two items to prove once 0.1.14 runs (P1, P2).

## Checked, nothing applies

F1. Mods, top-of-file state shared by all copies. akrogon ships no mod: the repo has no `herdr-app/` folder, `src/install.ts:54-78` only prunes stale mod links, and `tests/deploy-shapes.test.ts:114` asserts a deploy links none. The notices reader is herdr-setup's `mods/session-status`: its module level holds one `const SESSION` from `appHome()` (main.js:10), the same for every copy in a window, and shown-state goes through `shared("akrogon.notices.shown")` (main.js:22-23), not a file-level variable. Nothing to change on either side.

F2. `herdr-app check` (Dock icon #398, shared mod state #516). akrogon never runs `check` or `status`: grep over src, skills, tests finds none. The 11-07 lesson is about akrogon's own `run-check` killing a `setsid -f` child, not herdr-app.

F3. Codex from the + menu (#657). akrogon starts codex through `hc run` with the operator's `harnesses.codex` line, which already carries `--no-daemon` (forks/config.md:22,29, decided 2026-11-07). The 0.1.14 binary's own + menu entry is `["codex","--no-daemon"]` too, so herdr-app adopted the same flag for its path. akrogon's flag stays: it covers a path herdr-app does not start. Nothing to remove.

F4. Terminal folders when several open at once (#511). akrogon passes `--cwd` on every run (`src/hc.ts:312-313`, `src/seat.ts:225,:318`). hc-level, not affected.

F5. Agents list names, toasts, sub-agent under parent (#530, #539), two agents in one tab. akrogon's `--name` is functional (`hc send <name>`, seats.yaml), not a display workaround; `--no-parent` for leaf seats and the handover helper is lifetime (forks/start-and-pane.md:38; SKILL.md:159), not display. Nothing depends on how the list renders.

F6. Lessons 11-03 (Hyprland output freezes the window), 11-07 (run-check), 11-08 (window log empty while the window runs). No changelog line covers any of them: no item about the window log flushing, headless outputs, or detached children. All three stay.

F7. `pane.swap`, `exec` timeout, focused terminal. No akrogon code they would replace: `place()` (`src/seat.ts:176-195`) waits for the hc document and renames the tab, no pane operations.

## Prove once 0.1.14 runs

P1. "Layouts you've edited by hand keep all their pieces when a terminal in them ends." akrogon's `blockSchema` (`src/hc.ts:163-167`) accepts `content: { terminal: string }` or no content. If 0.1.14 keeps a block for an ended terminal with a null or missing `terminal`, `docGet` throws and `place()` fails for every seat. Proof: with a hand-edited layout, end one terminal, run `echo '{"jsonrpc":"2.0","id":1,"method":"doc.get","params":{"name":"herdr-app"}}' | hc connect` and check every leaf block still has `content.terminal` as a string or no `content`. Low confidence that anything changed; the fixture `tests/fixtures/herdr-app-doc.json` was captured on 0.1.13 (proofs.md P7).

P2. `windowOpen` matches stderr `no Herdr window` (`src/hc.ts:532`) and `tests/fake-herdr-app.ts:31` mirrors 0.1.13. The string is in the 0.1.14 binary (one hit in each binary), and `tab.rename`/`tab.close` names are present in both. Proof: `HERDR_APP_HOME=<session home> herdr-app ls` against a stopped session home prints that phrase and exits 1; `tab.rename` on a live window exits 0.
