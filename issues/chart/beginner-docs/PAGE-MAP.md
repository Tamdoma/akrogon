# Page map

Every human docs page: its one subject, where its facts come from, its picture, and its owner leaf. Pictures live in `docs/pictures/`. "Sources" are today's pages the facts come from. Each fact is checked against current `src/` and `skills/` before it is written, and where an old page disagrees, the code wins. Skills stay the home of agent procedure, and pages link to them. This map is public: private provenance lives only in `issues/chart/beginner-docs/scratch/provenance.md` under the registered root shown by `akrogon config` (gitignored).

Link rule: a page links only to pages and pictures owned by its own leaf or by a leaf in its `blocked-by`, plus skills and source files. New pages never link docs/guide (old pages are authoring sources only). No placeholders. docs-links stays strict at every merge.

This map is a door-owned input. Leaves read it and never edit it. A needed change goes back to the door, which makes it on main.

## Front door, home and start/ (leaf: docs-start, lands last)

| Path | Subject | Sources | Picture |
|---|---|---|---|
| README.md | What Akrogon is in one screen, a "what you need" box, a link to the docs home. No command table, install steps, rollback or counts. | README.md "How the pieces fit" | factory-overview |
| docs/README.md | Docs home: start/ in reading order, then use/, reference/, examples/. | README.md "Guide" | none |
| docs/reference-index.md | Stays the code grounding index. Its human-docs link points to docs/README.md. | itself | none |
| docs/start/what-it-is.md | The software factory: a request becomes a written contract, a seat builds it, it gets independent review and repair if needed, and the command lands it. Key words are introduced here. | guide/idea.md, guide/parts.md "The words" | factory-overview |
| docs/start/why-it-works.md | Why progress is kept in files the program reads (it survives a closed conversation), why build and review are separate seats with different jobs, and why a contract comes before code. | guide/idea.md, guide/state.md "Why the record survives…" | two-seats |
| docs/start/install.md | What you need (Linux with a running systemd user manager, Bun, Git, Herdr, one agent CLI, gh for GitHub work), the install, the first global config, and a readiness check that lets a prepared machine skip ahead. | guide/install.md, README.md "Install", guide/parts.md "Skills, commands and Herdr" | machine-parts |
| docs/start/set-up-a-project.md | Register a project with init-akrogon, the repo config fields a beginner touches, and grounding (how agents find the right code). | guide/setup.md, README.md "Initialize a repository", guide/parts.md "Folders…" | project-folders, grounding |
| docs/start/one-change.md | Narrated, not a task: one real change, optional two-step sign-in in a translation web app, from a note to merged, told with today's commands. | provenance.md, guide/phases.md, guide/merge.md | change-flow |
| docs/reference/words.md | Glossary, one line per term, each linking to where it is explained. | guide/parts.md "The words" | none |
| docs/reference/where-things-go.md | For maintainers: which page owns which fact, the link rule above, and that a code change updates its page. | this map | none |

## use/ part 1: plan and run work (leaf: docs-use-plan)

| Path | Subject | Sources | Picture |
|---|---|---|---|
| docs/use/a-working-day.md | The usual day, with optional steps marked: a request (local note or GitHub issue) → chart → handoff → `akrogon next` → seats work → land. Watch and broadcast are optional. Direct work skips handoff and next. Autopilot hands off and starts nothing. | guide/in-practice.md "A working day" | working-day |
| docs/use/plan-work.md | Plan work with /chart-issues in attended mode: rounds, forks, fog, consultants, the handoff review. Links the skill for procedure. | guide/chart.md, guide/create.md "Which door for what" | chart-door, ways-to-run |
| docs/use/quick-fix.md | Direct route: when the door builds a small settled change itself with B review, and when it refuses. | guide/chart.md "Direct route", skills/chart-issues "Direct route" | ways-to-run (shown in plan-work, linked) |
| docs/use/autopilot.md | Autopilot: a fixed list of charts answered by A and handed off. Approvals stay with you, and it starts no execution. | guide/chart.md "Autopilot", skills/chart-issues "Autopilot" | ways-to-run (linked) |
| docs/use/write-issues-by-hand.md | Write leaf files directly and order them with blocked-by. | guide/create.md "Or just write the files", "Ordering with blocked-by" | none |
| docs/use/report-an-observation.md | seed-issue: file an unverified observation as GitHub intake without inventing a fix. | guide/create.md "seed-issue…", skills/seed-issue | intake (shown in a-working-day's picture, linked) |
| docs/use/run-work.md | `akrogon next` forms, how order is decided, when picked work cannot start, and releasing work without managing every prompt. | guide/next.md "The four forms", "How order…", "When picked work…", "Release work…" | dispatch-order |
| docs/use/park-pause-stop.md | Park, pause, stop a leaf, stop a run, and clean up leftovers. | guide/next.md "Parking…", "Pausing…", "Stopping…", src/stop-run.ts, src/leftovers.ts | control-states |
| docs/use/watch-while-away.md | watch-issues: a 20-minute check in Claude Code while you are away, started and stopped only by you. | guide/in-practice.md "watch-issues…", skills/watch-issues | watch-loop |

## use/ part 2: finish and recover (leaf: docs-use-finish)

| Path | Subject | Sources | Picture |
|---|---|---|---|
| docs/use/merge-and-announce.md | Normal path: the command lands a green top with no seat. Exceptions: red, refused or rebase attempts go to B, solo rebase by hand, then command-owned landing. Then the broadcast. | guide/merge.md (stale on who merges), skills/merge-issue | change-flow (linked) |
| docs/use/when-work-fails.md | A failure is a recorded stop, not lost work: how to read it and carry the work forward. | guide/problems.md | failure-recovery |
| docs/use/roll-back-a-release.md | Roll a broken release back to the previous one. | README.md "Rollback", src/rollback.ts | releases (shown in reference, linked) |
| docs/use/learn-from-work.md | Lessons and history files, and sorting them with learn-issues. | guide/learn.md, skills/learn-issues | lessons-flow |
| docs/use/save-records.md | Save lifecycle records with `akrogon sync`, and when gacp fits instead. | guide/files.md "sync…", guide/gacp.md | records-vs-code |

## reference/ part 1: commands and settings (leaf: docs-reference-commands)

| Path | Subject | Sources | Picture |
|---|---|---|---|
| docs/reference/commands.md | Every `akrogon` command, one line each. The table is read by the command-reference test against src/akrogon.ts. | README.md "Command", src/akrogon.ts | none |
| docs/reference/skills.md | Every skill: the result it gives and when to use it. | README.md "Skills", guide/cheat.md "Pick the skill…", skills/*/SKILL.md | none |
| docs/reference/config.md | Settings layers: machine config.yaml, repo issues/config.yaml, EPIC.md and ISSUE.md `slots:` front matter. Nearest wins: issue, then epic, then repo, then machine. | guide/install.md "Global config…", guide/setup.md "Repo config…", guide/cheat.md, src/config.ts | config-layers |
| docs/reference/checks.md | Checks and verification: leaf checks versus merge checks, fresh-checkout verify, receipts, known-red results, test-change refusals, which log to read, and the remedy for each refusal. Agent proof rules are linked, not copied. | guide/setup.md, guide/phases.md, guide/merge.md, guide/files.md, src/verify.ts, src/run-check.ts, src/guard.ts, src/evidence.ts (readLog) | verification |

## reference/ part 2: records, states and runtime (leaf: docs-reference-records)

| Path | Subject | Sources | Picture |
|---|---|---|---|
| docs/reference/files.md | The issues/ folder layout and each record file, plus the timing and flaky reports. | guide/files.md, guide/parts.md "Folders…" | project-folders |
| docs/reference/state-and-phases.md | state.yaml fields, and the phase list with who moves each phase. | guide/state.md, guide/phases.md, src/state.ts, src/phase.ts | phases |
| docs/reference/releases-and-updates.md | The installed release versus the source checkout, how registered checkouts follow main, what triggers a deploy, and how a failed update is reported without replacing the active release. | README.md "Install", "Initialize a repository", guide/install.md, src/self-update.ts, src/release.ts | releases |
| docs/reference/limits.md | What Akrogon does not do, and what stays your job. | guide/limits.md | none |

## examples/ (leaf: docs-examples)

| Path | Subject | Sources | Picture |
|---|---|---|---|
| docs/examples/README.md | What each story shows. | none | none |
| docs/examples/quick-fix-story.md | Direct route: a small settled fix in a web framework project, reviewed by B and landed. The project is not named. | provenance.md | none (links ways-to-run) |
| docs/examples/autopilot-story.md | Autopilot charting a batch of website speed work, then lifecycle build and review. The project is not named. | provenance.md | none |
| docs/examples/recovery-story.md | varhop (public, named and linked): a failed leaf's work carried forward into a redo that landed. | provenance.md, varhop public issue #1 | none (links failure-recovery) |

## Pictures

Each picture is a still-readable SVG with its own background card. Moving pictures use CSS keyframes inside the file. Content is fixed below, and the implementer checks each node and edge against the named source before drawing.

### docs-pictures-concepts

- factory-overview (moving): request → chart door (you + A) → contract in issues/open → build → independent review → repair if needed → command lands → merged. A side branch marks the direct route: same charted decisions and B review, but no leaf handoff or lifecycle dispatch. Sources: skills/chart-issues, src/next.ts, src/land.ts.
- two-seats (moving loop): seat A implements. A and B review blind and independently. B repairs most findings (check.repair) and A repairs the named exceptions (check.fix). A pass goes to merge. Chart consultants are not shown. Sources: skills/implement-issue, skills/check-issue.
- machine-parts (still): akrogon command, systemd user slice, Herdr panes, agent CLIs (harness templates), machine config.yaml, registered repos. Source: src/install.ts, src/scope.ts.
- project-folders (still): two separate roots. The registered checkout's issues/ holds seeds, chart, open, parked, closed and the .jsonl records. The worktree store sits outside the checkout. Source: guide/files.md checked against src/config.ts worktreeStore, src/state-home.ts, src/sync.ts.
- grounding (still): grounding.index → linked area → source file read by the plan and implement agents. Source: guide/setup.md "Grounding".
- config-layers (still): seats only, per seat: ISSUE.md slots → EPIC.md slots → repo issues/config.yaml → machine config.yaml, nearest wins, and a present seat is a whole harness/model/effort set. Other repo settings come from issues/config.yaml alone. Source: src/config.ts indexSchema, slotConfigSchema, resolveSeats.
- phases (still): plan.positions → plan.rebuttal → plan.synthesis (debate off starts here) → implement → check.review → check.fix / check.repair → merge → merged, with failed as a stop. Source: src/phase.ts, src/state.ts.
- ways-to-run (still): attended chart → lifecycle or direct. Autopilot chart → lifecycle handoff only. Watch attaches to lifecycle execution only. Only allowed combinations are drawn. Source: skills/chart-issues, skills/watch-issues.
- chart-door (moving): you ⇄ A, A ⇄ consultants (blind notes → merge → rebuttal), rounds → forks taken → handoff review → contract. Source: skills/chart-issues.

### docs-pictures-operations

- change-flow (moving): plan → build → review → (finding → repair → re-check) → land → merged. Source: skills/plan-issue, implement-issue, check-issue, merge-issue.
- working-day (moving loop), door-supplied spec that docs-use-plan's a-working-day.md follows: intake (a local note, or a GitHub issue or seed brought in by `akrogon pull`) → /chart-issues → either direct route (door builds, B reviews, lands; bypasses handoff and next) or handoff to issues/open → `akrogon next` → seats plan, build, review, repair → command lands → merged. Optional branches: watch-issues beside execution, and broadcast after merged. Autopilot drawn as charting and handoff only, starting nothing.
- dispatch-order (still): open leaves → blocked-by satisfied? → order rule → started. Source: src/next.ts, guide/next.md "How order…".
- control-states (still): repo running ↔ paused. Whole issue open ↔ parked (refused for allocated work). Separately, leaf stop ↔ start, stop a run, leftovers cleanup. Source: src/park.ts, src/pause.ts, src/stop.ts, src/stop-run.ts, src/leftovers.ts.
- failure-recovery (still): attempt → failed with recorded reason → work kept → carried forward or retried. Source: guide/problems.md checked against src/phase.ts.
- watch-loop (still): cron every 20 min → read status → report or act within allowed steps → you. Source: skills/watch-issues.
- releases (still): source checkout → release → active, with previous kept, a hold, and rollback to previous. Source: src/release.ts, src/rollback.ts, src/self-update.ts.
- lessons-flow (still): finding → LESSONS.md line + history file → learn-issues sorts: stopped, checkable, transfer, stays. Source: skills/learn-issues, skills/lesson-rule.md.
- verification (still): leaf checks versus merge checks, fresh-checkout verify → receipt, known-red comparison against the base, test-change refusal → remedy. Source: src/verify.ts, src/run-check.ts, src/guard.ts.
- records-vs-code (still): leaf branch carries code only. Lifecycle records are saved by `akrogon sync`. Source: src/sync.ts, guide/gacp.md.

## Old pages

All 17 `docs/guide/*.md` pages stay until docs-start deletes them in its final step, after listing every remaining reference to `docs/guide` in the repo and clearing it. Every old section's facts land in the row that names it as a source. guide/cheat.md and guide/gacp.md "Beginner walkthrough" get no page of their own.

## Test owners

| Test | Owner leaf | Change |
|---|---|---|
| tests/docs-links.test.ts | docs-reference-commands | Check README plus every docs/**/*.md (nested) plus image refs |
| tests/command-reference.test.ts | docs-reference-commands | Read the table in docs/reference/commands.md. Remove the guide/files.md and guide/next.md reads together with their wording checks. |
| tests/hold-retired.test.ts, tests/run-permit.test.ts | docs-reference-commands | The docs part scans README plus every docs/**/*.md. Source, skill and AREA scans are untouched. |
| tests/door-reset.test.ts | docs-use-plan | Remove the guide/chart.md read and its "handover" wording check. Behavior tests are kept. |
| tests/rollback.test.ts | docs-use-finish | Point at docs/use/roll-back-a-release.md. The runtime proof is kept. |
| tests/log-reader.test.ts | docs-start | Remove the README "akrogon log" wording check. Runtime tests are kept. |

## Order

- docs-pictures-concepts and docs-pictures-operations: no prerequisites, run side by side.
- docs-reference-commands: after both picture leaves (config-layers, verification).
- docs-reference-records: after both picture leaves (project-folders, phases, releases).
- docs-use-plan: after both picture leaves and reference-commands.
- docs-use-finish: after pictures-operations and both reference leaves.
- docs-examples: after both picture leaves, both reference leaves and both use leaves.
- docs-start: after all seven.
