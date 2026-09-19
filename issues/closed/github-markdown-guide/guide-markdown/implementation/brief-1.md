# Brief 1: README entrance + 17 guide pages + init contract fix

## 1. Goal

Replace the HTML guide's content with markdown: rewrite README.md's top as the entrance and write all 17 `docs/guide/*.md` pages. Plan decisions D1, D2, D3, D4, D5, D9, D10. Old `.html` files still exist; a later unit deletes them — do not delete anything.

## 2. Acceptance criteria

1. README.md first sentence is exactly: "Akrogon is a lightweight software factory that runs work you define through planning, implementation, review and merge using two configurable coding-agent seats in Herdr." followed by what the operator owns and that it stops at merge. Under the title, exactly: "You already run coding agents. Akrogon is for when you want a system that runs them for you." Then a reading-order list linking all 17 pages in the order below. `## Install`, `## Initialize a repository`, `## Command`, `## Skills` remain below with tables intact.
2. `docs/guide/` gains exactly these `.md` files in reading order: idea, parts, state, install, setup, create, chart, next, phases, files, gacp, merge, in-practice, limits, problems, learn, cheat. Each ends with one line `Previous: [Title](<stem>.md) · Next: [Title](<stem>.md) · [Home](../../README.md)`; on idea, Previous links to `../../README.md`; on cheat, Next links to `../../README.md`.
3. Every akrogon-behavior claim matches `src/`, `config.yaml` or `skills/`. The twelve corrections below are the floor; re-verify every sentence the same way. Keep a corrections list (old html file:line → what the page now says → evidence file:line) and paste it in your report.
4. Voice on every page and new README prose: contractions; mixed sentence lengths; tangents showing the thinking; conversational, simple; imperfect structure; opinion and specific examples. Never at the cost of a fact. No forced identical headings; cheat stays a sheet.
5. Reader already runs coding agents and knows git, PRs, worktrees — never explain those. Explain every akrogon word at first use: registered checkout, issue, epic, leaf, chart, fork, phase, slot, seat, tab, worktree, skill, hook. Concept pages: what it is/why it exists, how it works (file or command that makes it so), one concrete use. Task pages: prerequisites, which directory you're in, the command, what you should see, what to do when it fails.
6. One running example reused create→merged: repo `widgets`, issue `export-csv`, leaf slug `export-csv`, a small invented "export CSV" feature. Same names on every page.
7. `gacp.md` holds the function below as `gacp() ( ... )` (subshell body), a beginner explanation of each step, when to use it vs `akrogon sync` (sync commits only eligible issue records, refuses wrong branch and staged paths outside them — src/sync.ts:11-33), and the `.bashrc` line `source`-able paste. Note honestly: the commit can exist before a failed pull, so "checkout unchanged" is not a full rollback.
8. README init row becomes `akrogon init [--from <proposal.yaml>] [--toolkit <lang>=<runner>]` (src/akrogon.ts:32-37, src/init.ts:13-23 make `--from` optional) and `tests/command-reference.test.ts` contract for init changes to `[--from <proposal.yaml>] [--toolkit <lang>=<runner>]` in the same edit. README install prose "links each skill into ~/.claude/skills and ~/.agents/skills" must name all four roots: `.claude/skills`, `.agents/skills`, `.codex/skills`, `.pi/agent/skills` (src/install.ts:11).

## 3. Read-first

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `README.md`, `docs/guide/*.html` (old claims + captions to keep as prose; five illustrations dropped, captions stay)
- `design.md` and `plan.md` under the leaf folder (binding decisions)
- Truth: `src/next.ts`, `src/state.ts`, `src/sync.ts`, `src/routing.ts`, `src/phase.ts`, `src/install.ts`, `src/akrogon.ts`, `src/init.ts`, `config.yaml`, `skills/*/SKILL.md`

## 4. Change list

- Edit `README.md` (top rewrite + init row + four-roots fix), `tests/command-reference.test.ts` (init contract only).
- Create the 17 `docs/guide/*.md` files.
- No other files. Do not touch `src/`, `config.yaml`, `skills/`, `tests/browser/`, `package.json`.

## 5. Do-not

- No Mermaid, SVG, images, site generator — foreclosed by operator.
- No dark-factory/unattended-success/deployment claims; never claim two vendors are required (slots are seats with configured harness+model, config.yaml:2-14, src/next.ts:218-225).
- Do not delete the `.html` files or `style.css` (later unit).
- Do not change any contract besides init's; do not weaken the test.
- Mismatch → return it with evidence, don't change scope. Exception: revised brief from B.
- Restating: exclusions above stand because scope, locked decisions and test integrity matter; the only exception is a revised brief from B.

## 6. Ordered steps

1. Read old HTML pages + cited src lines; build the corrections list (criterion 3).
2. Write the 17 pages in reading order (criteria 2,4,5,6,7).
3. Rewrite README top; fix init row and four-roots prose (criteria 1,8).
4. Update init contract in command-reference.test.ts (criterion 8); run the changed-tests command.

Advisory: ~19 files, under ~80 turns.

## 7. Commands

`AKROGON_BASE=b1bdde3105a673cf57f350b8e3c636ce3b9eee6b && bun test --changed="$AKROGON_BASE"` — plus `bun test tests/command-reference.test.ts` directly since it must pass.

## 8. Done-when

All criteria met; corrections list pasted; command-reference test green.

gacp body to wrap verbatim in `gacp() ( ... )`:

```bash
set -euo pipefail
branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$branch" != "main" ]; then
  echo "gacp: on '$branch', not main. Finish or abort the rebase first: git rebase --continue / git rebase --abort" >&2
  exit 1
fi
git add .
git diff --cached --quiet || git commit -m "${1:-add issues}"
if ! git pull --rebase --autostash origin main; then
  conflicts="$(git diff --name-only --diff-filter=U)"
  git rebase --abort
  echo "gacp: conflict, rebase aborted, checkout unchanged. Files:" >&2
  echo "$conflicts" >&2
  echo "Resolve by hand: git pull --rebase --autostash origin main, fix the files, git add -A && GIT_EDITOR=true git rebase --continue && gacp" >&2
  exit 1
fi
git push origin main
```

Twelve known corrections (old html → truth):

1. parts:72, idea:59,82, index:57 "A is Claude, B is Codex, two vendors" → seats with configured harness/model (config.yaml:2-14, src/next.ts:218-225).
2. create:67-83, parts:84-94 one-level leaf → issue folder holding leaf folder, depth 2 or 3 (src/state.ts:86-91).
3. parts:71, state:79 "phase is the only signal" → done/prompted (src/next.ts:408-419), panes/hand_built/blocked-by (src/next.ts:512-542).
4. state:83, problems:60 attempts count prompts → attempts count consecutive failed deliveries, reset on delivered prompt, fail at 3 (src/next.ts:350-391).
5. next:61-62,97 `next --all` visits every repo → current repo inside one, every repo outside (src/next.ts:674-682).
6. limits:57, in-practice:114 blockers never re-read → checked before every dispatch (src/next.ts:534-542).
7. files:63, limits:64, cheat:66-67 sync stages everything → eligible issue records only (src/sync.ts:11-33,109-114).
8. problems:59-61, phases:66 failed recovery → `akrogon phase <slug> <phase>` to any active phase in routing (src/routing.ts:35-38), failure record (src/state.ts:11-28), seat-declared stops (skills/implement-issue/SKILL.md B-seat stops).
9. in-practice:119-120 edit phase by hand → teach `akrogon phase`; it resets bookkeeping (src/phase.ts:95-112).
10. create:60 small item skips chart → same structure, straight to handoff (skills/chart-issues/SKILL.md Drain section).
11. README two skill roots → four (src/install.ts:11); `--from` required → optional (criterion 8).
12. gacp semantics per the script above.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
