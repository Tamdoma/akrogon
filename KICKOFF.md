# Kickoff

Steps to start the akrogon-loop leaves. Done: commit c6db449, old checkout deleted, this checkout renamed to `~/Work/infra/akrogon`, old `~/.local/bin/akrogon` and old skill folders under `~/.claude/skills` removed, herdr workspace `akrogon` created with the two charting sessions moved in.

1. Open two tabs in the `akrogon` workspace, `command` and `core-skills`, two panes each, Claude left as slot A, Codex right as slot B. Both bootstrap leaves are hand-built, run in parallel, and block on nothing.
2. Kick off each pane with one line, leaf and letter adjusted:

   `Work issues/open/akrogon-loop/bootstrap/command as slot B. Read brief.md, design.md and state.yaml. Phase is plan.synthesis.`

   No debate on the bootstrap leaves: B writes plan.md alone, A waits for check.
3. Move phases by hand: edit `phase:` in the leaf's state.yaml, then prompt the slot the phase belongs to. implement to B. check.review to both. merge to A. Then merged. Slot files: plan.md, implementation/brief.md, review-A.md, review-B.md.
4. Remote is `origin` at github.com/Tamdoma/akrogon, branch `main`, force-pushed once at kickoff over the old history.
5. After both bootstrap leaves merge, from the merged checkout:

   `bun run src/cli.ts install`
   `akrogon init`
   `akrogon next status`

   From here the hook drives the remaining six leaves: status, then seed-issue, pull-close, init-issues, chart-issues as they unblock, retire-old last.
6. Exercise the repair loop once: if the first `status` review returns ready, write one real finding into review-A.md and hand-move to check.fix.
7. When anything looks off, ask the charting Claude tab. It holds the chart and can read any pane.

Cleanup is a leaf, not a step. `new-beginning/`, `reference/`, the old skill folders, `issues/.scripts` and the old `issues/config.yaml` are sources for the leaves that replace them; `command` deletes `.scripts`, `retire-old` deletes the rest. The broadcast webhook lives in `~/.config/akrogon/env`, never in a skill folder. Deleted today: `.evidence/`, `issues/.scripts/node_modules/`, `.gitattributes`.
