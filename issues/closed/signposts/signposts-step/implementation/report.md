# Report: signposts-step

Serial-solo run (plan D9): every wave holds one unit, A implemented with no workers, sub-briefs or worker worktrees.

## Changed files

- `skills/chart-issues/SKILL.md` — Open: signposts-round paragraph (after intake import and consultant restart, before any map, consultant exchange adds missed angles first, map briefs carry the answers, earlier signposts offered, applies to sessions opened after it lands); first reply names mode and answerer. Drain: signposts order as the next selection source and dropped chart/seed skipped this session. Take: signposts round is the exception to "Research precedes every question". Autopilot: door session definition, three modes, ambiguous-words ask, mid-chart switch-on asks signposts first, presented round not a wait, full-autopilot echo/`signposts: A`/never-drop, pick rule gains signposts, never-list gains "drops a handed chart", autopilot handover entry gains `signposts <path>`. Handover: attended entry gains `signposts <path>`; next-chart folder gains the verbatim copy as the one added file.
- `skills/chart-issues/assets/questions.md` — signposts round as the light exception (question, 2–3 options, recommendation, what it steers; reply key and challenge check; no research line); 4–7 questions drawn from intakes; per-mode unanswered rules; short account after answers; correction and conflict rules.
- `skills/chart-issues/assets/shapes.md` — `forks/signposts.md` in the records tree; mode-record handover lines gain `signposts <path or none>`; `## Autopilot` record gains `signposts:`; signposts record paragraph (original/copy/corrections/dropped list/`## Taken` shape) with a fork-shape example; next-chart CHART.md paragraph gains the copy.
- `docs/use/plan-work.md` — new "Set the signposts" section between "Open a chart" and "Read the territory map"; note that chart-door.svg shows the per-chart exchange.
- `docs/use/autopilot.md` — three modes, ambiguous-words ask, signposts presented vs A-answered, pick rule, handover carries signposts, `## Autopilot` record names who answered.
- `docs/start/what-it-is.md` — step 2 names the signposts before the map.
- `docs/use/a-working-day.md` — step 2 names the signposts.
- `docs/reference/words.md` — Signposts entry; Autopilot entry names the three modes.

Commit: `d6bb6429` "Chart door: signposts step for session direction" (8 files, +50/−17). Base `19998b35` (`AKROGON_BASE`), head `d6bb6429495080f6574d7c7ce665f95e9d54a62c`. No refresh needed: branch was already at `origin/main` at start and at implement end; no `Test-Change:` trailer — no file matched by `src/test-files.ts` changed.

## Proofs

All run through `akrogon run-check` in the leaf worktree. Wall times: test 67s; all others seconds.

- Criterion 1–5, 7, 8 (skill + questions + docs text): `bun /tmp/signposts-check.ts "$PWD"` — `check signposts-struct-green: 0 /home/ivan/Work/infra/akrogon/issues/open/signposts/signposts-step/implementation/check-signposts-struct-green-1793751387706-3928150.log` (head d6bb6429). All 60 anchor assertions pass; red evidence at planning: `check signposts-struct-red: 1` (45 failures, unedited files) and deliberate break `check signposts-struct-break: 1` (wrong-section placement and empty `## Taken` stayed red).
- Criterion 6 (counted taken): shapes.md assertions in the same green run (signposts example block heads `# Signposts:` and keeps `## Taken` with a reply body) plus live probe `bash /tmp/signposts-probe.sh` — `check signposts-probe: 0 .../check-signposts-probe-1793751544823-357821.log`: `akrogon status --charts` printed `1/2` with a `## Taken` reply and `0/2` after emptying it on a throwaway chart at the authoritative root.
- Criterion 9 (`bun test` + owned files): `check test: 0 .../check-test-1793751463279-3928520.log` — 1309 pass, 0 fail via the configured `checks.test` command; `check signposts-owned: 0 .../check-signposts-owned-1793751387796-3928220.log` — `git diff --name-only $AKROGON_BASE...HEAD` is exactly the eight owned files; `src/`, `tests/`, `issues/` untouched.
- `akrogon verify` on committed head: `verify leaf d6bb6429495080f6574d7c7ce665f95e9d54a62c: green` (format, test, typecheck).

## Plan corrections recorded

- Checker strengthened at implement (plan.md appendix holds the final script): the `## Taken` regex now requires a block headed by a signposts title — the CHART.md template's new `signposts:` line made the first form vacuous. The next-chart-folder assertion moved to file scope — fenced `## ` headings inside `Chart records` truncate naive section splitting. Drain wording uses "a dropped chart or seed" so the `dropped` anchor matches. Not a proof-command change: same checker, same criterion observation.

## Known limitations and notes

- The `## Taken` rule means an unanswered signposts round (manual mode, question still open) must not write `## Taken` — fork-file shape's own rule covers it; recorded here because it follows from the counting behavior, not spelled out in the new text.
- `docs/pictures/chart-door.svg` and `ways-to-run.svg` untouched per plan D5: they depict the per-chart exchange and mode contrast, not the session order, so they do not contradict the procedure; a reader of only the diagram would not see the step. plan-work.md now notes this beside the diagram.
- Legacy charts and open charts are not migrated; the rule applies to door sessions opened after it lands.
- Proof scripts `/tmp/signposts-check.ts`, `/tmp/signposts-probe.sh`, `/tmp/signposts-owned.sh` are ephemeral (removed after the run); the checker is preserved in `plan.md`'s appendix, and `check-signposts-struct-green` etc. hold the captured outputs.
- No env names, grants or inputs; `akrogon status` showed no `Missing:` lines.
