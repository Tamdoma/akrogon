# Design: guide-markdown

## Binding decisions, verbatim

Round 1 (issues/chart/github-markdown-guide/forks/round-1.md), operator: "1a | 2a - also add the gacp script so they can put it into their .bashrc. It has to contain its own page guide with noob explainer on what it does and when to use it | 3a | 4a | 5a"
- Q1 A: README = intro and reading order on top, existing install, init, command and skills reference below. Foreclosed: moving the reference tables.
- Q2 gacp: a guide page holding the script as a bash function to paste into .bashrc with a beginner explanation of what it does and when to use it. (Its "correct only sync" bound is superseded by round 2.)
- Q3 A: drop the five illustrations, keep their caption sentences as prose. Foreclosed: Mermaid, static SVG.
- Q4 A: one bun link test. Foreclosed: no test.
- Q5 A: HTML, style.css, four specs, four configs, @playwright/test and its lockfile entries leave in this leaf. Foreclosed: compatibility window.

Round 2 (forks/round-2.md), operator: "1a | 2a - also make it stylistically good to read. Instruct the implementer to write like this: - use contractions and mix sentence lengths (short punch, long breath) - add tangents and show the thinking process - keep language conversational and simple - create texture with imperfect structure - inject opinion, edge, specific examples. | 3a | 4a"
- Q1 A: README opens with "Akrogon is a lightweight software factory that runs work you define through planning, implementation, review and merge using two configurable coding-agent seats in Herdr." followed by what the operator owns and that it stops at merge. Foreclosed: any dark-factory, unattended-success or deployment claim; claiming two vendors are required.
- Q2 A plus voice: rewrite every page for the reader against src/, config.yaml and skills/ as truth; the voice instruction above is binding for every page and README prose. Foreclosed: patch-only pass.
- Q3 A: one sentence under the README title names the reader: "You already run coding agents. Akrogon is for when you want a system that runs them for you." Foreclosed: unstated reader.
- Q4 A: every akrogon claim matches implementation, external commands match their own docs or inspected source, placeholders visible and consistent; report carries the correction list with file:line and one walkthrough. Foreclosed: prose review only, exact-prose or screenshot tests.

Operator intent, verbatim: "We need to turn the actual guide into a docs, with readme.md being the entrance just like the homepage. Intent: move from HTML to Github documentation, so everything's in one place." and "the documentation is newbie friendly, which means someone who already is into agentic engineering but they don't have their own software factory yet ... all of the steps are explained from first principles as well as in practice."

Standing design: /home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: no auth, secrets or backend here. The user-visible flow is a reader following the guide; its verification is the link test plus the walkthrough in the report, not a browser flow, so no Playwright. Negative test: the link test fails on a deliberately broken link. Nothing in this leaf touches .env.

## Leaf architecture

Owned: README.md; docs/guide/** (delete *.html and style.css, create the 17 .md files); docs/reference-index.md line 7; tests/browser/** (delete); tests/AREA.md; tests/command-reference.test.ts only for the init `--from` expectation if the README row changes; a new tests/docs-links.test.ts; package.json devDependencies and bun.lock for @playwright/test removal.
Not owned: src/, config.yaml, skills/, plugin/, learnings/, issues/, the historical audit and process-review files at the root. Code, config and skills are evidence. When two of them contradict each other, the page documents the code's behavior and the report names the conflicting instruction (both).

Pages, in reading order, each at docs/guide/<stem>.md: idea, parts, state, install, setup, create, chart, next, phases, files, gacp, merge, in-practice, limits, problems, learn, cheat. README replaces index.html. Each page ends with `Previous: [..] · Next: [..] · [Home](../../README.md)`. Headings are the anchor targets; links use GitHub's generated anchors (lowercase, hyphens).

Reader and voice. The reader already runs coding agents and knows git, PRs and worktrees. Do not explain those. Explain every akrogon word at first use: registered checkout, issue, epic, leaf, chart, fork, phase, slot, seat, tab, worktree, skill, hook. Concept pages: what it is and why it exists, how it works with the file or command that makes it so, one concrete use. Task pages: prerequisites, which directory you are in, the command, what you should see, what to do when it fails. Do not force identical headings on every page; the cheat sheet stays a sheet. One running example issue, a small invented feature, reused from create through merged. Voice, binding: contractions; mixed sentence lengths, short punch then long breath; tangents that show the thinking; conversational and simple; texture from imperfect structure; opinion, edge and specific examples. Never at the cost of a fact.

Truth anchors and known drift to correct (file:line in the old HTML → authority):
1. parts.html:72, idea.html:59,82, index.html:57 A is Claude, B is Codex, two vendors required → config.yaml:2-14, src/next.ts:218-225: slots are seats with a configured harness and model; vendor diversity is a choice.
2. create.html:67-83, parts.html:84-94 one-level leaf `issues/open/rename-flag/state.yaml` → src/state.ts:86-91 requires an issue folder holding a leaf folder (depth 2 or 3).
3. parts.html:71, state.html:79 "phase is the only signal" → src/next.ts:408-419 (done, prompted) and src/next.ts:512-542 (panes, hand_built, blocked-by) (B).
4. state.html:83, problems.html:60 attempts count prompts, fail at 3 → src/next.ts:350-391: attempts reset on delivered prompt, count consecutive failed deliveries, fail at 3.
5. next.html:61-62,97 `next --all` visits every repo → src/next.ts:674-682: current repo inside one, every repo outside.
6. limits.html:57, in-practice.html:114 blockers never re-read → src/next.ts:534-542 checks before every dispatch.
7. files.html:63, limits.html:64, cheat.html:66-67 sync stages everything → src/sync.ts:17-33,109-114 eligible issue records only.
8. problems.html:59-61, phases.html:66 failed recovery → src/routing.ts:35-38 failed routes to any active phase listed there (not merged or failed) via `akrogon phase <slug> <phase>`, subject to the command's checks (B); src/state.ts:11-28 failure record; skills/implement-issue/SKILL.md:31-33,43 seat-declared stops.
9. in-practice.html:119-120 edit phase by hand → src/phase.ts:95-112 the command resets bookkeeping; teach the command.
10. create.html:60 small item skips the chart → skills/chart-issues/SKILL.md:37 same structure, straight to handoff.
11. README.md:14 two skill roots → src/install.ts:11-21 four roots; README.md:38 `--from` required → src/akrogon.ts:32-37, src/init.ts:13-23 optional; adjust tests/command-reference.test.ts:12 with it.
12. gacp semantics from the script below: requires main, stages the current directory, commits whatever is staged, pull --rebase --autostash, prints conflicting files and aborts on conflict, pushes; the commit can exist before a failed pull, so "checkout unchanged" is not a full rollback.
Recheck every other sentence the same way; the list is a floor.

gacp page. Source script, verbatim body to wrap:
```
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
Publish it as `gacp() ( ... )` with a subshell body so `set -e` and `exit` never touch the interactive shell. Explain: it is the operator's "stage this directory, commit the whole staged index on main, rebase, push" after editing issues/ (B: `git add .` stages the current subtree, the commit includes everything staged), and when to use `akrogon sync` instead (sync commits only eligible issue records and refuses the wrong branch or staged paths outside those records, src/sync.ts:17-33) (B). Verify in a temporary repo with a bare fake origin; never against a real remote.

Link test (tests/docs-links.test.ts, bun:test): collect README.md and docs/guide/*.md, parse markdown links `[..](target)`, skip http(s) and mailto, resolve relative paths against the file, require the file to exist, and for `#anchor` require a heading in the target whose GitHub slug matches. Negative case: a fixture string with a dead link makes the checker return it.

Removal: docs/guide/*.html, docs/guide/style.css, tests/browser/ entirely (four .pw.ts, playwright.config.ts, three per-spec configs), @playwright/test from package.json, `bun install` to update bun.lock. tests/AREA.md drops the browser lines and names the link test. docs/reference-index.md links docs/guide/ as the markdown guide.

Exclusions: no site generator, Pages, Mermaid or image assets; no change to src/, config.yaml, skills/ or issues/; no edits to astra-6-akrogon-audit.md, process-review-*.md or learnings/; no exact-prose tests.

Credentials: none.
