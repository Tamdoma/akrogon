# Implementation report — taxonomy-rename

## Result

The charting taxonomy is renamed in place across the six changed skill files and every affected docs page. Charting mode is now No autopilot / Semi-autopilot / Full autopilot and the build routes are Direct / Lifecycle. Record keys and file names are unchanged. The new switch-on templates spell both mode values. The compatibility line preserves explicitly recorded legacy modes and reads a continuation after bare `on` as Semi-autopilot.

## Initial implementation lane

- Worktree: `/home/ivan/.akrogon/worktrees/akrogon/taxonomy-rename`, base `562611bd309252ddcbe7a18a04a88629d0e82c0e`, branch tip `c757e91a`.
- Commits: `0aaa3d58` skill files (worker u1) → `1446e953` core mode docs (worker u2) → `f475210a` remaining docs (worker u3) → `c757e91a` repair commit (A).
- Branch refresh: `git fetch origin` showed origin/main still at `562611bd` — `git merge-base HEAD origin/main` equals base, behind count 0. Nothing moved, no rebase needed.

## Workers

| Unit | Commit | Worker | Scope | Outcome |
|---|---|---|---|---|
| u1 | `0aaa3d58` | Frodo (sa-1) | 7 skill files | Merged as-is |
| u2 | `1446e953` | Merry (sa-2) | autopilot.md, plan-work.md, words.md, skills.md | Merged as-is |
| u3 | `f475210a` | Legolas (sa-3) | 9 remaining docs pages | Merged as-is |

Worker reports: `/tmp/u1-report.md`, `/tmp/u2-report.md`, `/tmp/u3-report.md`.

## Criterion proofs

Current proof snapshot compares base `4aff0f68` with head `197fdc46`.

### Criterion 1 — mode words renamed, new categories present

Hit tables (line counts per word family, `\b`-bounded, case-insensitive). Skills side covers the seven owned files; docs side covers `docs/` markdown (SVG text is out of scope per the brief's limitation, alt texts inside markdown are in scope).

**Skills — mode-meaning old words in prose:**

| Word (mode meaning) | Base | Final | Where final hits sit |
|---|---|---|---|
| `manual` (mode sense) | 2 (SKILL.md "in manual mode" ×2) | 0 | — |
| `attended` (mode sense) | 6 (SKILL.md 4, autopilot.md 1, shapes.md 1) + handover.md template `attended next` 1 | 0 | — |
| `autopilot signposts` | 1 (SKILL.md 127) | 1 | only inside the `Old record words:` compat line, where the design places it |
| `Charting mode` | 0 | 2 (SKILL.md 1, AREA.md 1) | category named once each |
| `Build route` | 0 | 2 (SKILL.md 1, AREA.md 1) | category named once each |
| `Old record words:` lines | 0 | 1 (SKILL.md:128) | exactly one |

check taxonomy-vocab-base: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/taxonomy-rename/taxonomy-rename/implementation/check-taxonomy-vocab-base-1795773419252-3960548.log
check taxonomy-hits-base: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/taxonomy-rename/taxonomy-rename/implementation/check-taxonomy-hits-base-1795773426084-3960808.log
check taxonomy-scan-fix2: 0 check-taxonomy-scan-fix2-1795777649049-3445250.log

#### Slot B vocabulary inventory

Across 37 skill lines, the inventory records 72 occurrences of the legacy terms or bare `autopilot`. The scan excludes the approved mode values and counts the two parts of Markdown links separately. The table gives the reasons for every occurrence.

| Skill line | Hits | Reason |
|---|---:|---|
| `skills/AREA.md:11` | 1 | Step file name. |
| `skills/chart-issues/SKILL.md:10` | 1 | Section key. |
| `skills/chart-issues/SKILL.md:27` | 3 | Both autopilot modes use the first-reply steps. Two file references. |
| `skills/chart-issues/SKILL.md:31` | 1 | Both modes drop a consultant whose restart fails. |
| `skills/chart-issues/SKILL.md:41` | 6 | Four shared rules for pass-end reporting, A's reading, ordinary forks and later decisions. Two file references. |
| `skills/chart-issues/SKILL.md:47` | 1 | CHART.md section key. |
| `skills/chart-issues/SKILL.md:49` | 1 | In both modes, the operator owns needs-sheet rows. |
| `skills/chart-issues/SKILL.md:59` | 3 | The drain is limited to the handed list in both modes. Two file references. |
| `skills/chart-issues/SKILL.md:65` | 1 | A's recorded pick takes the place of the operator's reply in both modes. |
| `skills/chart-issues/SKILL.md:69` | 4 | Both modes can yield an earlier pick and use the same finding rules. Two file references. |
| `skills/chart-issues/SKILL.md:83` | 3 | A handles the review in both modes. Two file references. |
| `skills/chart-issues/SKILL.md:113` | 1 | Section key. |
| `skills/chart-issues/SKILL.md:125` | 1 | Section heading kept as required. |
| `skills/chart-issues/SKILL.md:127` | 3 | The opener and wait reference describe both non-default modes. The third occurrence defines the family. |
| `skills/chart-issues/SKILL.md:128` | 7 | The line names all six legacy inputs. It repeats `autopilot signposts` in the earlier switch-on spelling that preserves Full autopilot. |
| `skills/chart-issues/SKILL.md:130` | 1 | The hc requirement applies to both modes listed in the preceding sentence. |
| `skills/chart-issues/SKILL.md:134` | 2 | Two file references. |
| `skills/chart-issues/SKILL.md:140` | 3 | Both modes use the linked resume entry. Two file references. |
| `skills/chart-issues/assets/autopilot.md:1` | 1 | Shared procedure title. Line 3 names both modes. |
| `skills/chart-issues/assets/autopilot.md:7` | 1 | CHART.md section key. |
| `skills/chart-issues/assets/autopilot.md:9` | 2 | Both modes have operator-owned switch controls and limits. |
| `skills/chart-issues/assets/autopilot.md:11` | 2 | Two uses of the CHART.md section key. |
| `skills/chart-issues/assets/autopilot.md:13` | 2 | Both modes use the same rules for an extended handed list and for its priority over destination grouping. |
| `skills/chart-issues/assets/autopilot.md:15` | 1 | Both modes use Lifecycle and drain the handed list only. |
| `skills/chart-issues/assets/autopilot.md:21` | 1 | CHART.md section key. |
| `skills/chart-issues/assets/autopilot.md:23` | 1 | Both modes hand over only to the next runnable handed chart. |
| `skills/chart-issues/assets/handover.md:5` | 1 | The folder-contents reference points to the shared procedure. |
| `skills/chart-issues/assets/questions.md:37` | 1 | Both modes use the round format. |
| `skills/chart-issues/assets/questions.md:39` | 2 | Both modes use A's recorded pick. One file reference. |
| `skills/chart-issues/assets/questions.md:62` | 2 | Both modes drop the affected consultant. One file reference. |
| `skills/chart-issues/assets/questions.md:70` | 2 | Both modes use A's pick for the notes and the takeaway. |
| `skills/chart-issues/assets/shapes.md:64` | 1 | CHART.md section key. |
| `skills/chart-issues/assets/shapes.md:90` | 3 | Both modes record mode changes and write the pass section. One section key. |
| `skills/chart-issues/assets/shapes.md:159` | 1 | Both modes label A's own fork pick. |
| `skills/chart-issues/assets/shapes.md:162` | 1 | Both modes require A's recorded pick before taking the fork. |
| `skills/chart-issues/assets/shapes.md:420` | 3 | Both modes accept A's recorded fork answer and reserve approvals for the operator. One file reference. |
| `skills/chart-issues/assets/standing-design.md:11` | 1 | In both modes A's pick cannot supply the outside source for a mechanical gate. |

**Docs — old mode words in prose:**

| Word | Base hits | Final hits |
|---|---|---|
| `manual` (mode sense) | plan-work.md ×3, words.md ×1, skills.md ×1, autopilot.md ×1 | 0 |
| `manual` (non-mode adjectives) | autopilot-story.md ×1 ("a manual step"), limits.md ×1 ("A manual akrogon next") | unchanged — autopilot-story.md:18, limits.md:15 (design pins these as non-mode uses) |
| `attended`/`Attended` (mode sense) | plan-work.md ×2, quick-fix-story.md ×1 (alt text) | 0 |

check taxonomy-docs-scan-final: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/taxonomy-rename/taxonomy-rename/implementation/check-taxonomy-docs-scan-final-1795775389355-1763269.log

The only remaining `autopilot signposts` string in docs is inside `docs/pictures/ways-to-run.svg` pixel text (out of scope, owned by the charting-pictures/guide-pictures leaves) — the scan above shows it as an SVG hit, not markdown. All `.md` hits of surviving `autopilot` substrings are mode names, the `## Autopilot` key mention, or link targets to the unchanged file names.

### Criterion 2 — keys, templates, routes intact

check taxonomy-templates-fix2: 0 check-taxonomy-templates-fix2-1795777649146-3445321.log

Quoted evidence from the final tree:

- Compat line, SKILL.md:128 — `Old record words: `manual` and `attended` read as `no autopilot`, `on autopilot` as `on semi-autopilot`, `continue attended` as `continue no autopilot`, and `autopilot signposts` as `full autopilot`. `continue autopilot` reads as `continue full autopilot` when the chart's mode record holds an earlier `on` entry recording full autopilot (`on full autopilot` or `on autopilot signposts`), and as `continue semi-autopilot` otherwise, including an earlier `on` entry with no mode word and no earlier `on` entry at all.` — exactly one line starts with `Old record words:` in SKILL.md, and zero exist anywhere else in the repo; all six old record words the brief lists appear in it.
- Record templates (shapes.md:54–60): `- mode <time> <A address> <A transcript path>: <on | off | changed list | continue <mode value>> <detail>`, the switch-on examples `- mode …: on semi-autopilot; handed <list>; consultants <named or none>` and `- mode …: on full autopilot; handed <list>; consultants <named or none>`, `continue semi-autopilot (handover <time>)` … `continue no autopilot (handover <time>)`; handover.md:5 handover entry now `handover <time> <log>: no autopilot next <chart>; …`.
- autopilot.md:23 resume entry: `` `continue <mode value> (handover <time>)` such as `continue semi-autopilot (handover <time>)` `` — `full autopilot` fits the same template (`continue full autopilot (handover <time>)` is the lower-cased mode value, per historical charts).
- Keys never renamed — counts in the five primary skill files before → after: `Route:` 2 → 2, `## Mode record` 2 → 2, `## Autopilot` 9 → 9, `signposts:` 3 → 3, `akrogon direct` 4 → 4. `Route:` values remain `<lifecycle | direct>` lower case in shapes.md:51. File names `autopilot.md`, `autopilot-story.md` untouched on disk.

### Criterion 3 — no behavior change

The rule comparisons cover all 27 added or replaced skill lines. The docs diff uses the same categories in its mode definitions, route refusals, signposts rules, examples and navigation. The compatibility row includes the repaired bare-`on` case (F5).

#### Slot B changed skill rules

| Skill line | Before | Reviewed head |
|---|---|---|
| `skills/AREA.md:11` | Index identifies the door's three modes and procedure files. | Index names the charting modes and build routes while pointing to the same procedures. |
| `skills/chart-issues/SKILL.md:10` | Door starts attended. Operator words switch it to autopilot. | Door starts under No autopilot. Operator words can start Semi-autopilot or Full autopilot. |
| `skills/chart-issues/SKILL.md:41` | The operator can take a non-counting seed section in manual mode. In the autopilot modes it is an ordinary fork. | The operator can take it in No autopilot. Semi-autopilot and Full autopilot still treat it as an ordinary fork. |
| `skills/chart-issues/SKILL.md:69` | For a seed lock with two valid readings, the manual door asks one question. | The No autopilot door asks one question in the same case. |
| `skills/chart-issues/SKILL.md:83` | The door presents one handoff review. Under autopilot, A writes and answers it. | The door still presents one handoff review. The parenthetical still gives A the review in both autopilot modes. |
| `skills/chart-issues/SKILL.md:113` | The door refuses Direct in either autopilot mode. | The bullet explicitly refuses Direct in Semi-autopilot and Full autopilot. |
| `skills/chart-issues/SKILL.md:115` | The chosen route is written to CHART.md as the `Route:` line. | The same key records Direct or Lifecycle with the existing lower-case values. |
| `skills/chart-issues/SKILL.md:127` | Operator answers both rounds in manual, signposts only in autopilot, and neither in full autopilot. Operator words set scope for one door session. | The same delegation and scope use No autopilot, Semi-autopilot and Full autopilot. The family wording groups the two non-default modes. |
| `skills/chart-issues/SKILL.md:128` | Legacy `continue autopilot` was written for both non-default modes and resumed the same session. | F5 repaired: full resolution requires an earlier `on` entry explicitly recording full autopilot; a bare or missing `on` entry resolves to Semi-autopilot — the only autopilot mode of the era those records were written in. Full autopilot keeps its conflict-handling rule. |
| `skills/chart-issues/SKILL.md:130` | Operator words in the door terminal are required. The door needs hc. | Both non-default modes still require the same words and hc context. |
| `skills/chart-issues/SKILL.md:132` | Same transcript continues after compaction. A different or unknown one starts attended until the operator asks to continue. | Same-path behavior and lost consultants are preserved. A different or unknown path starts under No autopilot and uses the new continuation wording. Legacy continuation resolves through the repaired SKILL.md:128 rule, bare-on included. |
| `skills/chart-issues/SKILL.md:134` | Read the autopilot procedure for the two non-default modes. | Read the same file under Semi-autopilot or Full autopilot. |
| `skills/chart-issues/SKILL.md:140` | A matching start prompt continues the handover. Attended appends `continue attended`. The autopilot modes follow the shared procedure. | The prompt and transcript rules stay. No autopilot appends `continue no autopilot`. Semi-autopilot and Full autopilot still follow the shared procedure. |
| `skills/chart-issues/assets/autopilot.md:3` | Both non-default modes use this procedure. | The same modes are named Semi-autopilot and Full autopilot. |
| `skills/chart-issues/assets/autopilot.md:7` | The operator supplies switch-on words. The door appends a mode line. Signposts are presented once, with A answering in full autopilot. | Signposts still apply to both modes and A answers in Full autopilot. F2 repaired (check.fix): shapes.md's template block now carries explicit switch-on examples starting `on semi-autopilot` / `on full autopilot` in lower case, so the mode line's shape is specified. |
| `skills/chart-issues/assets/autopilot.md:23` | Both modes hand over to the next runnable handed chart. An attended switch creates the pending Destination. Resume writes `continue autopilot`. | The handover and pending Destination rules stay. The resume entry uses the lower-case mode value. |
| `skills/chart-issues/assets/handover.md:5` | Old A records the named next attended chart, survivors, signposts and instructions. | The writer uses `no autopilot next <chart>` with the same contents and scope. |
| `skills/chart-issues/assets/questions.md:41` | Missing signposts are re-asked in manual, noted in autopilot and answered by A in full autopilot. Signposts conflict follows the same delegation. Operator fork conflicts still wait. | The same mode-specific choices and wait apply under the three new names. |
| `skills/chart-issues/assets/shapes.md:54` | Mode template lists `on`, `off`, `changed list` and `continue autopilot`. | The generic template now takes a mode value in a continuation. |
| `skills/chart-issues/assets/shapes.md:55` | The generic `on` record left the middle mode in the detail. | The explicit `on semi-autopilot` example specifies the mode and keeps the handed list and consultant fields. |
| `skills/chart-issues/assets/shapes.md:56` | The generic `on` record left the full mode in the detail. | The explicit `on full autopilot` example specifies the mode and keeps the handed list and consultant fields. |
| `skills/chart-issues/assets/shapes.md:58` | The non-autopilot handover example writes `attended next`. | The example writes `no autopilot next` with the same fields. |
| `skills/chart-issues/assets/shapes.md:59` | `continue autopilot` was the shared resume value for both autopilot modes. | The example is `continue semi-autopilot`. The shared procedure supplies `continue <mode value>` for both modes. |
| `skills/chart-issues/assets/shapes.md:60` | The attended example writes `continue attended`. | The matching example writes `continue no autopilot`. |
| `skills/chart-issues/assets/shapes.md:90` | The latest mode line governs. Handover resumes the handed list in autopilot and the named chart in attended mode. | The latest line still governs. Semi-autopilot and Full autopilot keep the handed list. No autopilot resumes the named chart. |
| `skills/chart-issues/assets/shapes.md:92` | Only full autopilot can record the signposts pick as A's. | Only Full autopilot retains that authority. |
| `skills/chart-issues/assets/shapes.md:420` | Handoff review is required. Under autopilot, an answer recorded as A's can satisfy a fork but cannot supply approvals. | Handoff review and the autopilot exception remain. The `attended` label is removed from the review. |

**A's repair commit `c757e91a`** fixed three semantic narrowings workers introduced, restoring the before-scope exactly:

1. shapes.md:88 — worker wrote the resume continues "the same handed list under Semi-autopilot, the named chart under No autopilot", dropping Full autopilot from the handed-list continuation. Repaired to "under Semi-autopilot or Full autopilot".
2. docs/use/autopilot.md "What the door does" — worker's "Under Semi-autopilot the signposts round is presented and answered once" made the presented-round-not-a-wait rule Semi-only; before it covered both non-default modes. Repaired to "Under Semi-autopilot and Full autopilot … answered once".
3. SKILL.md mode-change line — worker wrote `"continue <mode>"` while the shapes/autopilot templates use `<mode value>`; unified to `<mode value>` in both positions.

A fourth worker judgment (autopilot.md:3 "mode is Semi-autopilot or Full autopilot") was correct as written and kept.

### Criterion 4 — diff confined to owned paths

check taxonomy-scope-fix2: 0 check-taxonomy-scope-fix2-1795777649253-3445439.log

`git diff --name-only 4aff0f68...197fdc46` output, verbatim and complete: docs/README.md, docs/examples/README.md, docs/examples/autopilot-story.md, docs/examples/quick-fix-story.md, docs/reference/limits.md, docs/reference/skills.md, docs/reference/words.md, docs/start/what-it-is.md, docs/start/why-it-works.md, docs/use/a-working-day.md, docs/use/autopilot.md, docs/use/plan-work.md, docs/use/quick-fix.md, skills/AREA.md, skills/chart-issues/SKILL.md, skills/chart-issues/assets/autopilot.md, skills/chart-issues/assets/handover.md, skills/chart-issues/assets/questions.md, skills/chart-issues/assets/shapes.md. 19 files: six skill files and 13 docs Markdown files. `standing-design.md` is byte-identical (its one hit was a sanctioned family use). Nothing outside `skills/` + `docs/` changed. `docs/README.md` carries a two-line mode-word diff only (the charting-guide leaf owns deeper edits there).

### Verification — initial committed head

`akrogon verify --sha HEAD` on a fresh clone of `c757e91a` — the full per-check, fresh-clone gate including the complete configured `test` command (parallel full run plus rerun-each=5 of changed test files): **green**.

- verify setup: 0 …/implementation/check-setup-1795775257763-1311902.log
- verify format: 0 …/implementation/check-format-1795775260729-1311902.log
- verify typecheck: 0 …/implementation/check-typecheck-1795775263436-1311902.log
- verify test: 0 …/implementation/check-test-1795775367013-1311902.log
- `verify leaf c757e91a6773a1cebc3ac408aeca00ffb455255d: green`

Pinned-literal tests passing in that run cover: ≥3 `` `akrogon pack <chart>` `` mentions and the `Handed off`/`Closed`/`Held` markers (docs-links), `## Operator decision (` in SKILL.md and the `### readiness.yaml` fence (chart-shapes), and the AREA.md watch-doc constraints (watch-timer — additionally run targeted during assembly, `check watch-area-test: 0 …/check-watch-area-test-1795775045053-1062253.log`, 5 pass 0 fail).

## Deviations and notes

1. **No new tests** — per the plan's locked interpretation of the design; proof is the hit tables above plus slot B's reading and the pinned-literal suite.
2. **Worker u1's report claimed a green full `bun test` run, but no such check log exists** in the leaf folder and the verbatim command it cited fails on this bun version (`--concurrent false` is parsed as a file filter). Its targeted checks (docs-links, chart-shapes, scans) do exist and were green. The gap is closed by A's own `akrogon verify`, which ran the full configured test suite green on the merged head; u1's file-level evidence also passed review since its diff was read line by line before cherry-pick.
3. **SVG pixel text unchanged** — `docs/pictures/ways-to-run.svg` still reads "Attended chart" in the image itself, per the brief's open limitation; replacement belongs to the charting-pictures/guide-pictures leaves. Alt texts in markdown are updated.
4. **Wave shape** — one wave of three parallel units per the plan; no re-planning, no dependencies appeared.
5. Slot B found that the flat legacy alias changes who resolves a later signposts conflict. See F1 in `review-B.md` for the two historical records and the resulting obligation. Repaired in the check.fix pass below.

## check.fix pass, 2026-11-27

Slot A repaired the two `Handed to A` findings from `review-B.md` in one delegated wave of two workers (fix1 Pippin, fix2 Frodo).

- **Refresh**: branch rebased onto `origin/main` `5d425ea8381036e9ae0fa87ef91d7da9d0254a06` (four new main commits touch only `src/run-check.ts`, `src/tool-cgroup.ts` and `tests/run-check.test.ts` — disjoint from this leaf's files). Prior reviewed base `562611bd309252ddcbe7a18a04a88629d0e82c0e`, prior reviewed head `c757e91a6773a1cebc3ac408aeca00ffb455255d`; handed-off base `5d425ea8381036e9ae0fa87ef91d7da9d0254a06`, handed-off head `ce19da0d9d11a05f2eeff0211ae9298d06912582`.
- **Plan notes first**: two dated `## Implementation notes` entries appended to `plan.md` correcting D2's flat mapping (F1) and refining D3 rule 5's switch-on template (F2), each with its executable check.
- **F1 repair** — commit `e8918566` (worker commit `db0444e0` cherry-picked): SKILL.md:128 now resolves legacy `continue autopilot` as the continue entry of the mode in that chart's earlier `on` entry (`on full autopilot`/`on autopilot signposts` → `continue full autopilot`, `on autopilot` → `continue semi-autopilot`), falling back to `continue semi-autopilot` when no earlier `on` entry exists. The line still names all six old record words; exactly one `Old record words:` line exists repo-wide. Trace proof: `issues/chart/test-temp-leftovers/CHART.md:35–37` and `issues/chart/direct-visible/CHART.md:30,35` (`on full autopilot` → `continue autopilot`) both resolve to Full autopilot through the final text, preserving the signposts-conflict delegation of questions.md:41; `issues/chart/builder-docs/CHART.md:30` (`on autopilot`, operator signposts) resolves to Semi-autopilot as before. Worker evidence: `check fix1-docs-links: 0 …/check-fix1-docs-links-1795776611107-2412775.log` (13 pass), `check fix1-chart-shapes: 0 …/check-fix1-chart-shapes-1795776619149-2413293.log` (3 pass).
- **F2 repair** — commit `ce19da0d` (worker commit `5a59c264` cherry-picked): shapes.md `## Mode record` template block gained two switch-on lines, `- mode <time> <A address> <A transcript path>: on semi-autopilot; handed <list>; consultants <named or none>` and the same for `on full autopilot`, so a new switch-on encodes which mode started in lower case. Diff confined to those two added lines. Worker evidence: `check fix2-chart-shapes: 0 …/check-fix2-chart-shapes-1795776657532-2414932.log` (3 pass), `check fix2-docs-links: 0 …/check-fix2-docs-links-1795776657632-2415043.log` (13 pass).
- **Cherry-pick verification**: `check pick-fix1-verify: 0 …/check-pick-fix1-verify-1795776726514-2493121.log`, `check pick-fix2-verify: 0 …/check-pick-fix2-verify-1795776726730-2494682.log` (chart-shapes + docs-links green after each pick).
- **Criterion proofs rerun on the repaired head**: `check taxonomy-scan-fix: 0`, `check taxonomy-templates-fix: 0`, `check taxonomy-scope-fix: 0` (logs in `implementation/`, timestamps …762020/762128/762240). Scope scan confirms the diff is still confined to the same owned paths.
- **F4 corrected command** — `akrogon run-check --name pinned-literals -- sh -c 'bun test tests/chart-shapes.test.ts && bun test --timeout=120000 --test-name-pattern "watch" tests/watch-timer.test.ts'`: `check pinned-literals: 0 …/check-pinned-literals-1795776778687-2623359.log`. Proof-command correction record: old command omitted `--timeout=120000` so the watcher cases ran under Bun's five-second default and three unchanged cases timed out (B's logs `check-pinned-literals-1795775681823-2017672.log`, `…702351-2020474.log`); the correction restores the configured timeout the suite itself uses, same files, same selection, same assertions — equivalence guard satisfied by B's deliberate-break run (`check-pinned-literals-deliberate-break` red with the break, green without) and the green rerun here.
- **Verify on the committed head** `ce19da0d`: setup/format/typecheck/test all 0 — `verify leaf ce19da0d9d11a05f2eeff0211ae9298d06912582: green` (`check-test-1795776920462-2719084.log` and siblings).
- **Process note**: the two worker worktrees were named `-fix1`/`-fix2`, which `src/run-check.ts leafTarget()` cannot resolve (it expects `-u<N>` or the leaf's own worktree). Workers used `--leaf <absolute leaf folder>` per the error's own instruction after A verified the probe; logs landed in the leaf's implementation folder. Both worktrees removed after cherry-pick. No operator action is open; nothing else was handed to A.

## check.fix pass round 2, 2026-11-27 — F5

Slot A repaired the one `Handed to A` finding from B's re-check in a one-unit delegated wave (worker Aragorn, worktree `taxonomy-rename-u4`).

- **Refresh**: branch rebased onto `origin/main` `4aff0f68` (four new main commits — the charting-guide leaf's chapter pages `docs/guide/04–08` and its `docs/README.md` index lines, written in the new taxonomy; merged textually and semantically clean with this leaf's narrower README edit). Prior reviewed base `5d425ea8381036e9ae0fa87ef91d7da9d0254a06`, prior reviewed head `ce19da0d9d11a05f2eeff0211ae9298d06912582`; handed-off base `4aff0f6881e486a15fd98db8d595644469cd4901`, handed-off head `197fdc46feeaa9723db628d8a64477abc4ce7ab6`.
- **Plan note first**: dated `## Implementation notes` entry appended to `plan.md` refining the F1 correction with the bare-`on` resolution and its executable check.
- **F5 repair** — commit `197fdc46` (worker commit `9e0f5fd2` cherry-picked): SKILL.md:128 now reads `continue autopilot` as `continue full autopilot` only when the chart's mode record holds an earlier `on` entry recording full autopilot (`on full autopilot` or `on autopilot signposts`), and as `continue semi-autopilot` otherwise — explicitly including an earlier `on` entry with no mode word and no earlier `on` entry at all. Trace proof against the real records: Full autopilot for `test-temp-leftovers` and `direct-visible`; Semi-autopilot for `config-walls` (bare `on; handed:`), `orphan-pane` (same), `killed-run-fixture` and `pull-gh-path` (bare `on handed …`), `merge-lanes` and `builder-docs` (plain `on autopilot`). Worker evidence: `check fix3-docs-links: 0 …/check-fix3-docs-links-1795777540234-3440139.log` (13 pass), `check fix3-chart-shapes: 0 …/check-fix3-chart-shapes-1795777549564-3440524.log` (3 pass); pick verification `check pick-fix3-verify: 0 …/check-pick-fix3-verify-1795777632125-3444133.log`.
- **Criterion proofs rerun on the repaired head**: `check taxonomy-scan-fix2: 0`, `check taxonomy-templates-fix2: 0`, `check taxonomy-scope-fix2: 0` (timestamps …7649049/7649146/7649253). Scope scan confirms the diff is still confined to the same 19 owned paths. The corrected F4 command: `check pinned-literals: 0 …/check-pinned-literals-1795777665671-3445504.log` (3 chart-shape + 11 watcher cases pass).
- **Verify on the committed head** `197fdc46`: setup/format/typecheck/test all 0 — `verify leaf 197fdc46feeaa9723db628d8a64477abc4ce7ab6: green` (`check-test-1795777877507-3449779.log` and siblings).
- **F3 rows refreshed**: the compat-line quote, the SKILL.md:128 inventory-row reason, and the SKILL.md:128/132 rule-comparison rows now reflect the final text. Line numbers are unchanged because the repair replaced one line with one line, so every other row reference still matches the committed head.
- No operator action is open; nothing else was handed to A.
