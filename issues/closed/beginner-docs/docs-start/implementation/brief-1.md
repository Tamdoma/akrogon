# Brief 1: docs/start/ pages (unit U1)

## 1. Goal

Write the five ordered start pages under `docs/start/` for a beginner who can open a terminal and has used one agent CLI: `what-it-is.md`, `why-it-works.md`, `install.md`, `set-up-a-project.md`, `one-change.md`. Plan decisions D1, D2, D3, D4, D5, D6, D7.

## 2. Acceptance criteria

1. The pages read in this order, and each one ends with a "Next" link to the page after it: what-it-is → why-it-works → install → set-up-a-project → one-change. `one-change.md` ends by linking `../use/a-working-day.md`.
2. `what-it-is.md` explains the software factory. A request becomes a written contract (leaf) at the chart door. Seat A builds it. It gets independent review by both seats, and B repairs most findings. The command lands it. The key words (chart, leaf, seat A/B, phase, worktree, landing) are introduced in plain words. Picture: `../pictures/factory-overview.svg`.
3. `why-it-works.md` covers three things. Progress lives in files the command reads, so it survives a closed conversation. Build and review are separate seats with different jobs. A contract comes before code. Picture: `../pictures/two-seats.svg`.
4. `install.md` opens with a "What you need" box: Linux desktop with a running systemd user manager, Bun, Git, flock, Herdr, one agent CLI (Claude Code, Codex or pi), and an authenticated `gh` for GitHub work only. Then comes a readiness check: a code block of commands, with the expected result of each, that lets a prepared machine skip to set-up-a-project. The commands are `systemctl --user is-system-running` (`running` or `degraded`), `bun --version`, `git --version`, `flock --version`, `herdr --version`, the agent CLI's `--version`, `gh auth status`, and `akrogon config` where Akrogon is already installed. Run each command here to confirm the real output form before writing it. If one does not exist or behaves differently, write what is true. Then the install from a checkout (`bun install`, `bun src/akrogon.ts install`), what install links (read `src/install.ts`), PATH for `~/.local/bin`, and a minimal `~/.akrogon/config.yaml` with placeholder values whose keys match `src/config.ts` (slots a/b, harnesses, repos). `AKROGON_HOME` gets one line. Release and deploy details link `../reference/releases-and-updates.md`, and rollback links `../use/roll-back-a-release.md`. No macOS, WSL or OS-install steps. Never a real key or a real personal path: use placeholders like `~/code/my-app`. Picture: `../pictures/machine-parts.svg`.
5. `set-up-a-project.md` covers running `/init-akrogon` from the project root (link `../../skills/init-akrogon/SKILL.md`). It writes a proposal, then runs `akrogon init --from <proposal.yaml>` and `akrogon config`. Then the repo config fields a beginner touches (`checks`, `grounding.index`, `default_branch`, `remote`, seat overrides) with exact meanings from `src/config.ts`, and a link to `../reference/config.md` for the rest. Then grounding: the index file, its linked AREA files, and how plan and implement agents use them. Init refuses an unreadable index, and `grounding: none` is the explicit opt-out. Pictures: `../pictures/project-folders.svg` and `../pictures/grounding.svg`.
6. `one-change.md` is a narrated story, not a task. It tells how an optional two-step (authenticator app) sign-in was added to "a translation web app": the note, charting with `/chart-issues`, handoff to `issues/open/`, `akrogon next`, plan, build, review by both seats, landing by the command, merged. Tell it with today's commands, and check each step against `skills/` and `src/`. Quote recorded output only if it matches today's tool exactly, otherwise use prose. Picture: `../pictures/change-flow.svg`.
7. Privacy for `one-change.md`: no project name, organization, repo name, registry key, client, person, home path, machine, project path, session id, commit SHA or date. Read the private source (section 3) but never copy any identifier from it. The story must also not reveal the app's language pair or brand.
8. No page asks the reader to do an exercise, try something, practice, or reach a finish line. Install and setup give exact commands the reader runs for their own machine, which is fine. Everything else is explanation.
9. Every picture is embedded as `![<alt text describing what the picture shows>](../pictures/<name>.svg)` with real descriptive alt text. Copy the style from `docs/use/a-working-day.md`.
10. Every statement matches current `src/` and `skills/`. No dates anywhere, no "was removed" or migration notes, and no retired command or setting names. Where an old `docs/guide/` page disagrees with the code, the code wins.
11. Links go only to existing files: `docs/use/*`, `docs/reference/*` (except `words.md` and `where-things-go.md`, which do not exist yet and must not be linked), `docs/examples/*`, `docs/pictures/*`, the other start pages, `skills/*/SKILL.md` and `src/*`. Never link `docs/guide/` or `README.md`. Plain, short sentences.

Planned proof run by this unit: `akrogon run-check --name u1-docs-links -- bun test --timeout=30000 tests/docs-links.test.ts` (must pass).

## 3. Read first

- `/home/ivan/.claude/skills/implement-issue/ponytail.md`
- Style to copy: `docs/use/a-working-day.md`, `docs/examples/quick-fix-story.md` (a narrated story in the house voice)
- Old sources (authoring material only, the code wins): `docs/guide/idea.md`, `docs/guide/parts.md`, `docs/guide/state.md`, `docs/guide/install.md`, `docs/guide/setup.md`, `docs/guide/phases.md`, `docs/guide/merge.md`, and README.md sections "How the pieces fit", "Install", "Initialize a repository"
- Facts: `src/install.ts`, `src/config.ts`, `src/init.ts`, `src/next.ts`, `src/land.ts`, `src/phase.ts`, `src/akrogon.ts`, `src/AREA.md`, `skills/AREA.md`, `skills/chart-issues/SKILL.md`, `skills/init-akrogon/SKILL.md`, `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`
- Existing pages to link: `docs/reference/commands.md`, `config.md`, `files.md`, `state-and-phases.md`, `checks.md`, `skills.md`, `releases-and-updates.md`, `docs/use/*.md`
- Private story source (read only, never copy identifiers): `/home/ivan/Work/infra/akrogon/issues/chart/beginner-docs/scratch/provenance.md` names the start-story leaf folder. Read that folder's `brief.md`, `design.md`, `plan.md`, `implementation/`, `review-A.md`, `review-B.md` and `state.yaml` for what happened.

## 4. Change list

Create `docs/start/what-it-is.md`, `why-it-works.md`, `install.md`, `set-up-a-project.md`, `one-change.md`. This unit owns only these five paths. It has no prerequisites and no shared test resource. Another unit later writes `README.md`, `docs/README.md` and `docs/reference/words.md`, which will link these pages, so keep the file names exact.

## 5. Do-not, reasons and exceptions

- Do not edit any other file, including README.md, docs/guide, tests or anything under issues/. Other units own those, and issue records live outside the branch.
- Do not write or edit tests. Tests are locked after planning. If the docs-links test is red for a reason outside your pages, return a mismatch.
- Do not copy private identifiers from the provenance or story folder. The repo is public.
- Do not restate agent procedure in full. Say what the reader sees and why, and link the owning skill.
- Do not link pages that do not exist yet. The docs-links test fails on dead links.
- Exception: if a criterion conflicts with the real code (for example, a readiness command does not exist), write what is true and report it as a mismatch note in your report. Do not invent behavior.

Restated: stay in your five files because others own the rest. No test edits, because tests are locked. No private details, because the repo is public. Link skills instead of copying them, and never link a missing page. The one exception is the code-wins mismatch note.

## 6. Ordered steps

1. Read section 3. Run the readiness commands locally to confirm their output form (criterion 4).
2. Write what-it-is.md and why-it-works.md (criteria 2, 3).
3. Write install.md and set-up-a-project.md (criteria 4, 5).
4. Write one-change.md (criteria 6, 7).
5. Check that the order and Next links hold (1), there are no exercise wording or dates (8, 10), and alt text is present (9).
6. Run the proof command and fix any dead links. Run `bunx prettier --check` only if you touch files prettier covers (it does not cover docs).
7. Commit the five files in one commit, `docs(start): add ordered start pages`, with no co-author line.

Advisory size: 5 files, under 25 turns.

## 7. Commands

- `bun install --frozen-lockfile` once in the worktree
- `akrogon run-check --name u1-docs-links -- bun test --timeout=30000 tests/docs-links.test.ts`

## 8. Done-when and report

All criteria hold, the proof passes, and one commit exists. Return the commit id and these four lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results with the check line>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
