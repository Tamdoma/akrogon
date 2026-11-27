# Plan: taxonomy-rename

Slot A, plan.synthesis. `AKROGON_BASE`: `562611bd309252ddcbe7a18a04a88629d0e82c0e` (worktree HEAD == base, clean). The brief and design agree on scope; two wording ambiguities in the locked decisions are resolved as plan decisions D1/D2 and recorded in `## Implementation notes` spirit for review, per the brief-wins-design rule. `design.md` holds no `Open for the plan:` question and no `## Held disagreements`.

## Context and pre-planning checks

- **Authoritative leaf folder**: `/home/ivan/Work/infra/akrogon/issues/open/builder-docs/taxonomy-rename/taxonomy-rename`
- **Worktree**: `/home/ivan/.akrogon/worktrees/akrogon/taxonomy-rename`
- **Credentials**: `readiness.yaml` has empty `inputs`, `produces`, `grants`, `retained`, `proofs`; the design names no credential variable; `akrogon status taxonomy-rename` prints no `Missing:` lines. No paid launch anywhere in this leaf.
- **Grounding**: `issues/config.yaml` `grounding.index: docs/reference-index.md` exists in the worktree; linked AREA files (`src/AREA.md`, `tests/AREA.md`, `skills/AREA.md`, `docs/README.md`) exist and were read; `learnings/LESSONS.md` read. No gaps.
- **Live-surface check of the design's claims** (all confirmed in the worktree):
  - No `src/` or `tests/` code parses mode words or the `Route:` line (grep of `src/*.ts` finds only an unrelated comment in `rollback.ts`; `src/status.ts` reads only the `Handed off|Closed|Held` markers).
  - Three test files read the edited files: `tests/docs-links.test.ts` (≥3 `` `akrogon pack <chart>` `` literals and the end markers in SKILL.md, all links resolve), `tests/chart-shapes.test.ts` (`## Operator decision (` in SKILL.md, `### readiness.yaml` fence in shapes.md), `tests/watch-timer.test.ts` (`skills/AREA.md`: no `cron`, no `expir`, the `scripts/observe.ts` line holds no `akrogon status`).
  - All mode-word lines located (inventory in D10).

## Read-first paths

- `docs/reference-index.md` → `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md`, `docs/README.md`
- Leaf files: `brief.md`, `design.md`, `readiness.yaml` in the leaf folder
- `skills/chart-issues/SKILL.md` — every mode-word line: opening dependency line (10), `## Open` seed rules (41), `## Take` (69), `## Direct route` refusal bullet (113), `## Autopilot` (125–133), `## Handover` (139)
- `skills/chart-issues/assets/shapes.md` — `## Mode record` template (54–58), prose at 88/90/157/160/418, `## Autopilot` section name
- `skills/chart-issues/assets/autopilot.md` — mode phrases at 3, 7, 13, 15, 23; resume-entry template at 23
- `skills/chart-issues/assets/handover.md` — handover-entry template at 5
- `skills/chart-issues/assets/questions.md` — mode sentences at 41; family uses at 37/39/62/70
- `skills/chart-issues/assets/standing-design.md` — family use "under autopilot" at 11 (keep)
- `docs/use/autopilot.md` — the mode page; `docs/use/plan-work.md` — signposts/modes paragraph (34/36); `docs/reference/words.md` — Autopilot/Signposts entries (5/29); `docs/reference/skills.md` — chart-issues result line (16); `docs/reference/limits.md` (17); `docs/examples/autopilot-story.md`, `docs/examples/README.md`, `docs/README.md`, `docs/start/what-it-is.md`, `docs/start/why-it-works.md`, `docs/use/a-working-day.md`, `docs/use/quick-fix.md`
- `tests/docs-links.test.ts`, `tests/chart-shapes.test.ts`, `tests/watch-timer.test.ts` — the pinned literals listed above
- `docs/reference/where-things-go.md` — the rule criterion 4 cites ("a change to src/ or skills/ updates the page that owns each fact it changes, in the same change")
- `learnings/LESSONS.md` — 2026-09-11 stale-rule-in-docs (grep `docs/` for a changed rule) and 2026-09-14 ambiguous-prose-after-rename (sweep prose for the old term, not only the old path); both drive the full inventory + hit table
- `issues/chart/builder-docs/slots/drafts-review-b.md` (F7/F8) and `drafts-review-c.md` (item 6) — the handoff review fixes behind criterion 2's line-start form, for reviewer context

## Decisions

### D1 — Record values for the two autopilot modes (ambiguity resolution)

The brief's examples name `on semi-autopilot`, `continue semi-autopilot (handover <time>)` and `continue no autopilot (handover <time>)`; it does not spell the Full autopilot forms. Resolution, the only reading consistent with the lower-case-value rule: record values are the mode name lower-cased, so `on full autopilot` and `continue full autopilot (handover <time>)` exist for Full autopilot, and the shapes.md mode-record template carries `<mode value>` for the continue form. Historical charts already use exactly `on full autopilot` (issues/chart/seat-turn-idle, signposts-docs CHART.md), which confirms the casing. This is noted for review as a reading of the locked examples, not a scope change.

### D2 — Compatibility mapping (ambiguity resolution)

`SKILL.md` gains exactly one line starting with `Old record words:` in `## Autopilot`, directly after the mode definitions. Mapping: `manual` → `no autopilot`; `attended` → `no autopilot`; `on autopilot` → `on semi-autopilot` (the old middle mode's switch-on); `continue attended` → `continue no autopilot`; `continue autopilot` → `continue semi-autopilot`; `autopilot signposts` → `full autopilot`. An old full-autopilot session whose entries say `on full autopilot` is already exact and untouched. Ambiguity recorded for review: an old full-autopilot session resumed mid-chart through `continue autopilot` reads as semi-autopilot by this flat mapping; harmless in practice because after signposts are answered both modes behave identically at forks, and the signposts state is carried in `signposts: <operator | A>`, not in the continue entry. Noted for review.

### D3 — The substitution table (canonical, units apply it verbatim)

Precedence top-to-bottom; the first matching rule applies. "Mode word" means used as a Charting-mode or Build-route name.

1. **`manual` / `attended` / `in manual mode` / `attended switch` / mode-meaning `attended`** → `No autopilot` in prose (capitalized taxonomy value), `no autopilot` inside backticked record-entry templates. In mode-record prose "manual and autopilot" enumerate the modes: `under No autopilot and Semi-autopilot`.
2. **Bare `autopilot` meaning the middle mode** (operator answers signposts, A answers forks) → `Semi-autopilot` / record-form `semi-autopilot`. Detection: the sentence ties it to signposts/forks, switch-on ("switch autopilot on", "run autopilot on these reports", "handed them to a chart door in Autopilot", "shows autopilot"), or `Route:`/handover semantics of an autopilot chart.
3. **Bare `autopilot` meaning the whole family** ("under autopilot", "while autopilot waits", "in autopilot mode" generic, "the autopilot rounds") → keep, since criterion 1 bans bare `autopilot` only *as the middle value*; where one word swap makes it exact at zero cost use `under Semi-autopilot`/`under Semi-autopilot or Full autopilot` as the mode requires. SKILL.md's `## Autopilot` opening defines once that "under autopilot" covers Semi-autopilot and Full autopilot together, making every surviving family use exact by reference.
4. **`full autopilot` / `Full autopilot`** → approved already; keep, capitalizing to `Full autopilot` in prose. **`autopilot signposts` as a mode name** → banned everywhere except the `Old record words:` line; the parenthetical glosses `"autopilot signposts"` disappear (the three-mode definitions need no alias).
5. **Record-entry templates** (shapes.md 54–58, handover.md 5, autopilot.md 23): `continue autopilot` → `continue semi-autopilot` or generic `continue <mode value>`; `continue attended` → `continue no autopilot`; `attended next <chart>` → `no autopilot next <chart>`; `<on | off | changed list | continue autopilot>` → `<on | off | changed list | continue <mode value>>`. The `on` entry's detail starts `on <mode value>` (`on semi-autopilot` / `on full autopilot`).
6. **Never touched** (rule 6): file names and links (`autopilot.md`, `handover.md`, `docs/use/autopilot.md`, `docs/examples/autopilot-story.md`), keys and section names (`## Mode record`, `## Autopilot`, `signposts: <operator | A>`, `Route:` with `direct | lifecycle`), the `akrogon direct` verb, unrelated adjectives (`unattended`, `a manual step`, `a manual akrogon next`), and verbatim operator words quoted as history (none of the edited lines quotes operator speech as content — the `docs/examples/autopilot-story.md` example command is a fictional illustration and gets the new word). A family use never blocks rule 2's rewrite.
7. **Category names introduced**: the three-mode definition (SKILL.md `## Autopilot`, `docs/use/autopilot.md`, `docs/use/plan-work.md`, `docs/reference/words.md`, `docs/reference/skills.md`) names the category `Charting mode` with values No autopilot, Semi-autopilot, Full autopilot; the direct-route rule area (SKILL.md `## Direct route`, `docs/use/quick-fix.md` untouched, `docs/reference/words.md` Direct-route entry, `docs/use/plan-work.md` alt text where natural) names the category `Build route` with values Direct and Lifecycle. skills/AREA.md's "three modes" line names both categories.

### D4 — SKILL.md line-by-line semantic map (the meaning-preserving core)

Meaning before = meaning after; only the words change. Representative anchors (implementation applies D3 to every line, and the report's hit table covers all):

- **L10** "an attended door by default… switch it to autopilot" → "runs under No autopilot by default … the operator's words can switch it to Semi-autopilot or Full autopilot for a session". Same fact: operator answers everything unless words switch modes.
- **L41** "in manual mode the operator may take it in words" → "under No autopilot…". Same rule: operator may take a non-counting decision section in words.
- **L69** "in manual mode the door asks one question" → "under No autopilot the door asks one question". Same rule for the two-readings case.
- **L113** refusal bullet "the door is running under autopilot (`## Autopilot`)" → "the door is running under Semi-autopilot or Full autopilot (`## Autopilot`)". **Behavior check**: the old refusal matched exactly the two non-default modes (autopilot middle + full), so spelling both keeps the rule bit-identical — criterion 3's "Direct is not offered under Semi-autopilot or Full autopilot".
- **L127** the three-mode definitions rewritten to name `Charting mode` and the three values, same delegation mapping: No autopilot = operator answers signposts and every fork (the default); Semi-autopilot = operator answers signposts once, A answers every fork; Full autopilot = A answers both. "Words that delegate only the signposts while the operator keeps the forks match none of the three modes" unchanged. The `Old record words:` line follows immediately.
- **L129** "the words carry the mode…" unchanged except family uses per D3.
- **L131** "a different or unknown path starts attended until the operator says 'continue autopilot'" → "…starts under No autopilot until the operator says `continue <mode>`" — same resume behavior; the quoted operator phrase becomes the record form since the operator speaks in plain words anyway (implementation picks the clearest phrasing keeping the mechanic).
- **L139** "an attended session appends `continue attended (handover <time>)`" → "a session under No autopilot appends `continue no autopilot (handover <time>)`"; "a session whose mode record shows autopilot" → "shows Semi-autopilot or Full autopilot". Same entries, new words.
- **shapes.md 88** "the same handed list under autopilot, the named chart under attended" → "…under Semi-autopilot, the named chart under No autopilot".
- **shapes.md 418** "the complete contracts and attended handoff review" → drop `attended` ("the complete contracts and the handoff review"): the word only said the operator attends, which is the default mode's ordinary state, and the parenthetical at the same sentence already covers the autopilot exception. Same rule.
- **autopilot.md 3** "the session's mode is autopilot or full autopilot" → "is Semi-autopilot or Full autopilot".
- **autopilot.md 23** "where an attended switch creates the CHART.md" → "where a No autopilot switch creates the CHART.md".
- **handover.md 5** template `handover <time> <log>: attended next <chart>` → `handover <time> <log>: no autopilot next <chart>` (D3 rule 5).
- **questions.md 41** "In manual mode a material signposts question…" → "Under No autopilot…"; "in autopilot mode it is recorded as unanswered" → "under Semi-autopilot…"; "asked, in manual and autopilot — A resolves it only under full autopilot" → "asked under No autopilot and Semi-autopilot — A resolves it only under Full autopilot"; "waits under autopilot" stays family-true? No — this conflict wait applies only to autopilot modes, so "waits under Semi-autopilot or Full autopilot". Careful reading at implementation; where genuinely both autopilot modes, spell both.
- **standing-design.md** "under autopilot the door's own pick never supplies that source" — family use, keep unchanged.

### D5 — docs-page vocabulary policy

- **`docs/use/autopilot.md`**: H1 `# Autopilot` → `# Charting mode`; opener rewritten so the page covers all three values with Semi-autopilot as the main use. No anchor links exist to this page's headings (verified: no `autopilot.md#` anywhere), so heading edits break nothing; the H1 is not an anchor target at all. `/chart-issues run autopilot on these two bug reports` example → `run semi-autopilot on …` (operator speaks plain words; the docs show the taxonomy). "Three modes exist…" paragraph rewritten with new words, same delegation facts.
- **`docs/reference/words.md`**: `[Autopilot]` entry becomes two entries or one entry named for the category (implementation: `[Charting mode]` linking autopilot.md) with the three values defined; `[Signposts]` line "by you in manual and autopilot, by A under full autopilot" → "by you under No autopilot and Semi-autopilot, by A under Full autopilot". `[Direct route]` entry gains the `Build route` category mention where natural.
- **`docs/reference/skills.md:16`** "three modes — manual, autopilot and full autopilot" → "three Charting modes — No autopilot, Semi-autopilot and Full autopilot".
- **`docs/examples/autopilot-story.md`**: the real case ran the middle mode → "Semi-autopilot story", `[Autopilot]` link texts → `[Semi-autopilot]`, "takes the lifecycle route in autopilot" → "under Semi-autopilot". `a manual step to every build` (line 18) untouched per rule 6.
- **`docs/use/plan-work.md`**: "Attended chart: you answer each question" → "No autopilot chart: you answer each question"; modes paragraph (36) rewritten same as autopilot.md; alt text of ways-to-run.svg: "an attended chart" → "a No autopilot chart", "an autopilot chart" → "a Semi-autopilot or Full autopilot chart" (implementation picks natural wording with the new words).
- **Alt texts** in `docs/use/a-working-day.md` and `docs/examples/quick-fix-story.md`: edit mode words only; SVG pixel content untouched (D8).
- **Unchanged-docs hits**: `docs/start/install.md` `unattended` stays (rule 6); `docs/reference/limits.md:15` `A manual akrogon next` stays; `docs/reference/limits.md:17` mode uses get new words.

### D6 — `akrogon verify` is the criterion-4 `checks` proof, and is not new proof machinery

`akrogon verify` exists at `AKROGON_BASE` (it is the command every leaf uses; `full: [test]` in `issues/config.yaml`). `tests/docs-links.test.ts`, `tests/chart-shapes.test.ts` and `tests/watch-timer.test.ts` exist at base and pin the literals D4/D3 preserve. Baseline already recorded: `check taxonomy-vocab-base`/`taxonomy-hits-base` exit 0 (inspection logs), and the sibling leaf's `check docs-links-base` exit 0 at the same base (`implementation/check-docs-links-base-1795772825029-3914446.log`, 13 pass) proves the link test green at this tree. No new test, no new proof machinery — per the design's interpretation line.

### D7 — No-test pass, and no red-first test commit

The design's locked interpretation: "this is a prose and template change with no product code, so there is no new test. Proof is the report's hit list plus slot B's reading under the model-choice line". No criterion is proven by a new test file; every mechanical proof is an existing `checks` command or a direct inspection command (`grep`, `git diff`, reading) recorded with output in `implementation/report.md`. Therefore no test commit precedes product code and no red receipt exists; this plan records that deviation-from-default explicitly. The worktree stays at base for the whole pass.

### D8 — SVG picture files are out of scope; alt text inside .md files is in scope

`design.md` limits docs edits to "mode-word edits only" on docs pages. The two SVGs embedding old words (`docs/pictures/ways-to-run.svg`, `docs/pictures/working-day.svg`) are deleted and replaced by `charting-pictures`/`guide-pictures` (Q3: "All other old pictures are deleted with their embeds" — their leaf owns the replacement drawings), so editing their pixel text here is wasted churn on files already owned elsewhere. Consequence preserved as an open limitation: until those leaves land, the rendered SVGs still show old words while the alt text around them does not. `charting-pictures` (blocked-by charting-guide, open) lands before the operator reads the charting chapter, so the window is bounded.

### D9 — Wave structure: one wave of three units + report assembly

Unit paths are disjoint, no shared test resource, no intra-wave dependency, so up to 3 share wave 1. Consistency is guaranteed by D3/D4 being verbatim decisions workers apply, not judgment calls. A assembles the report tables (criterion evidence, hit list) itself after the wave — that is seat work, not a unit.

- **U1 — skills**: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/{autopilot.md,handover.md,questions.md,shapes.md,standing-design.md}` (standing-design expected unchanged — verify only), `skills/AREA.md`. Applies D3/D4; adds the `Old record words:` line; quotes each changed template line for the report. Targeted proof: `akrogon run-check --name docs-links-u1 -- bun test tests/docs-links.test.ts` and `akrogon run-check --name chart-shapes-u1 -- bun test tests/chart-shapes.test.ts`.
- **U2 — core mode docs**: `docs/use/autopilot.md`, `docs/use/plan-work.md`, `docs/reference/words.md`, `docs/reference/skills.md`. Applies D3/D5. Targeted proof: same docs-links run.
- **U3 — remaining docs**: `docs/examples/autopilot-story.md`, `docs/examples/quick-fix-story.md` (alt text only), `docs/examples/README.md`, `docs/reference/limits.md`, `docs/start/what-it-is.md`, `docs/start/why-it-works.md`, `docs/use/a-working-day.md` (line 26 + alt text), `docs/use/quick-fix.md`, `docs/README.md`. Applies D3/D5. Targeted proof: same docs-links run.

No unit edits `tests/`, `src/`, `README.md`, any `.svg`, `docs/start/install.md`, `docs/examples/README.md` beyond its mode lines (listed), or `issues/`.

### D10 — Report hit-table shape (criterion-1 proof inputs)

`implementation/report.md` carries two tables, produced by A after the wave:
1. **Skills hit table**: every remaining hit (case-insensitive word-boundary) of `manual`, `attended`, `autopilot signposts`, bare `autopilot` in the seven owned skill files after the edit, one row per hit with the reason from D3 (e.g. `## Autopilot` section key — kept per brief; `autopilot.md` link/file name — kept; family use — allowed per criterion's "middle value" wording, with the SKILL.md definition that fixes its meaning; `unattended` — not a hit because word-boundary scan excludes it, but any adjacent `attended` residue listed anyway). The old-words line itself is listed with reason "the one allowed compatibility line".
2. **Docs hit table**: same scan over the edited docs pages, proving mode-word-only edits (each changed line pairs old→new in the diff review; unchanged adjectives listed).

Verification boundary for these tables: the scan command is run through `akrogon run-check` and its full output pasted/linked, so the "every remaining hit" claim is mechanically produced, not eyeball-estimated.

### D11 — No credentials, no paid sessions, no grants

`env_names` empty; nothing in the design touches `.env`, external APIs or harness sessions. No grant entries to consult; no `run-check` budget sizing needed beyond keeping command output.

## Needed interfaces and contracts

- **Consumers of the edited records**: the door itself reads `## Mode record` latest entries (`on autopilot`/`continue autopilot` in existing open charts — exactly the case the `Old record words:` line covers). No `src/` code parses them (verified). Existing open charts that matter: `issues/chart/builder-docs/CHART.md` has `on autopilot (operator answers signposts…)` — the compat line keeps it resumable.
- **Pinned literals that must survive** (failure = red `checks`): `` `akrogon pack <chart>` `` ×3 in SKILL.md; markers `Handed off`, `Closed`, `Held`; `## Operator decision (` in SKILL.md; `### readiness.yaml` fence in shapes.md; in `skills/AREA.md`: no `cron`/`expir` (case-insensitive — careful: any added word containing "expir" such as "expiry" would fail; rename adds none) and the `scripts/observe.ts` line must not gain `akrogon status`.
- **docs-links invariants**: every relative link in edited files must keep resolving; no heading that is a link target may be renamed unless links are updated — verified inventory: `docs/use/autopilot.md` has no inbound hash links at all; `docs/use/plan-work.md` inbound anchors `#open-a-chart`, `#answer-one-fork-per-round`, `#set-the-signposts` (from words.md) — those headings carry no mode words and stay untouched.

## Wave checklist

Execution mode: **subagents** (config), wave 1 = 3 units in parallel. Each unit's sub-brief carries D3 and D4 verbatim, the line inventory of its files, the pinned-literal warnings and the never-touch list.

### Wave 1

| Unit | Owned paths | Shared resource | Depends on | Proof |
|---|---|---|---|---|
| U1 skills | 7 files under `skills/chart-issues/` + `skills/AREA.md` | none | — | `docs-links-u1`, `chart-shapes-u1` |
| U2 core docs | `docs/use/autopilot.md`, `docs/use/plan-work.md`, `docs/reference/words.md`, `docs/reference/skills.md` | none | — | `docs-links-u1` |
| U3 remaining docs | 9 files (D9) | none | — | `docs-links-u1` |

### Affected docs checklist (one line each)

Agent docs changed: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/autopilot.md`, `…/handover.md`, `…/questions.md`, `…/shapes.md`, `skills/AREA.md`. Agent docs unchanged: `standing-design.md` (family use only, kept deliberately), `docs/reference-index.md` (names no mode word — verified), `src/AREA.md` and `tests/AREA.md` (no mode words — out of scope per chart's Off-route line: "Agent-facing docs (docs/reference-index.md, AREA.md files except skills/AREA.md wording)"). Human docs changed: the 13 docs files in D9. Human docs unchanged: `README.md` (no mode words — verified: no `manual/attended/autopilot` hits outside pictures embeds, which name no mode in prose), `docs/start/install.md` (only `unattended`), all other docs pages.

## Acceptance criteria and verification

### Standing-design test policy for this leaf

No new test (D7). The vocabulary judgment — whether a rewritten rule still means the same rule — is a model choice read by slot B under standing-design's model-choice line: **no test, case or deliberate break holds an expected value for it**. What the leaf makes anyway: the full edit diff plus the hit-scan outputs; record paths the reviewing seat reads: `implementation/report.md` (hit tables, before/after rule-meaning table, scan outputs) and the diff itself. What stays unproven: the judgment that every prose paraphrase is perfectly faithful beyond the rule-line pairs — that residual is the model choice itself, owned by slot B's reading.

### Criterion 1 — taxonomy names present, banned mode-uses absent outside the one line

- **Brief criterion**: Charting mode (No autopilot / Semi-autopilot / Full autopilot) and Build route (Direct / Lifecycle) named in `skills/chart-issues/` and `skills/AREA.md`; outside the `Old record words:` line no line uses `manual`/`attended` as a mode name, bare `autopilot` as the middle value, or `autopilot signposts` as a mode name; the report lists every remaining hit of the four words with its reason; slot B reads the diff.
- **Real boundary**: the seven owned skill files' text after the edit, scanned mechanically for the banned patterns and for the new words' presence.
- **State before**: base counts recorded — `Charting mode` 0 hits, `Build route` 0 hits, `semi-autopilot` 0 hits, no `Old record words:` line; banned mode-words present: `manual` 4 word-hits across skills files (SKILL.md lines 41/69/127, questions.md 41 twice), `attended` 10 word-hits (SKILL.md 10/139, shapes.md 56/58/88/418, handover.md 5, autopilot.md 23), `autopilot signposts` 1 hit (SKILL.md 127), plus middle-mode bare `autopilot` uses (SKILL.md 127, autopilot.md 3/7, questions.md 41) and the record templates in shapes.md 54–58 / handover.md 5 / autopilot.md 23. (Kept logs: `check taxonomy-vocab-base`, `check taxonomy-hits-base` in `implementation/`.)
- **State after**: `Charting mode` and `Build route` present with the exact values; banned-pattern scan zero outside the one line; the report hit table lists every remaining hit + reason.
- **Product failure caught**: a mode sentence still teaching the door the old words (the door speaks them to operators and writes them into new records), or a missing taxonomy name so `guide` pages and skill disagree.
- **Observation (proof command)**: `akrogon run-check --name taxonomy-scan -- sh -c '<the exact grep inventory script over the seven files: counts of banned patterns outside Old-record lines, plus the full hit list>'` run on the committed head; output pasted into the report hit tables. Presence check: same scan for `Charting mode|No autopilot|Semi-autopilot|Full autopilot|Build route` counts. Both are direct product invocations (reading the very text that ships), not machinery. Slot B's reading of the diff is the model-choice part — inputs: the diff and hit tables; unproven: paraphrase fidelity beyond rule pairs (slot B judges).
- **Size**: seconds. **Rerun trigger**: any edit to the seven files.
- **Condition checks (plan-issue rule)**: the criterion states two conditions — (a) *no line outside the one line uses the banned forms*, (b) *the report lists every remaining hit with its reason*. Decision D3/D4 can break (a) only by a wrong classification; the scan output itself is the failing evidence and the report table is compiled from the same scan, so a hit missed by the table cannot exist unless the scan lies — scan output is pasted raw, closing (b). For (b), the table generation reading the raw scan is kept in the same process (A's report assembly), so no intermediate state can drift. No test machinery; traced reason: locked "no new test" design line, and the scan is a direct invocation of the product surface.

### Criterion 2 — templates write new lower-case values; exactly one compatibility line

- **Brief criterion**: mode-record and handover templates (shapes.md `## Mode record`, handover.md, autopilot.md) write new values lower case — examples `on semi-autopilot`, `continue semi-autopilot (handover <time>)`, `continue no autopilot (handover <time>)`; SKILL.md holds one line starting with `Old record words:` mapping each old word (`manual`, `attended`, `on autopilot`, `continue attended`, `continue autopilot`, `autopilot signposts`) to its new value; the report quotes that line and each changed template line.
- **Real boundary**: the template text itself (the door copies these shapes verbatim when writing records).
- **State before**: templates carry `continue autopilot`, `continue attended`, `attended next`; zero `Old record words:` lines. **State after**: templates carry the new values; exactly one `Old record words:` line exists in SKILL.md; report quotes it and each changed template line.
- **Product failure caught**: the door writing new CHART.md entries in old vocabulary (unparseable by the renamed reading rules, colliding with the docs), or an open old chart (`issues/chart/builder-docs` holds `on autopilot …` right now) failing to resume because nothing maps its words.
- **Observation (proof command)**: `akrogon run-check --name taxonomy-templates -- sh -c 'grep -c "^Old record words:" skills/chart-issues/SKILL.md; grep -n "Old record words" skills/chart-issues/SKILL.md; grep -n -E "continue |attended next|no autopilot next|on <mode|mode value" skills/chart-issues/assets/shapes.md skills/chart-issues/assets/handover.md skills/chart-issues/assets/autopilot.md'` — function checks on the record as standing-design's model-choice line allows: it exists, keys/states valid (exactly one line, correct start, every listed old word present in it), references resolve. The mapping's *correctness* (does `continue autopilot` really mean the middle mode) is reading, judged by slot B on the quoted lines — no case holds an expected value. Unproven: resumption of a live full-autopilot session recorded pre-rename with a bare `continue autopilot` entry — accepted ambiguity, recorded in D2.
- **Size**: seconds. **Rerun trigger**: any edit to the three asset files or SKILL.md.
- **Condition checks**: (a) *one line only* — the count grep is the mechanical evidence, run in the same committed tree; a second line added in implementation fails the count. (b) *each old word appears in the mapping* — same scan lists the line's content; slot B reads it against the brief's list. (c) *templates write lower case* — the quoted template lines are the evidence; any uppercase leak is visible in the quote. No machinery.

### Criterion 3 — rule behavior unchanged; keys unchanged

- **Brief criterion**: every rule keeps its behavior including "Direct is not offered under Semi-autopilot or Full autopilot"; keys stay (`Route:` lower-case values, `## Mode record`, `## Autopilot`, `signposts: <operator | A>`, `akrogon direct`, file names); the report gives each changed rule line's meaning before and after; slot B confirms nothing else changed.
- **Real boundary**: the leaf diff itself, plus the existing tests pinning literals.
- **State before**: the seven files at base with old words and these keys present. **State after**: same files, same keys present, rules reworded, nothing else.
- **Product failure caught**: a rename that silently drops or softens a behavioral rule (e.g. the autopilot-mode conflict-wait applying to No autopilot, or the direct-route refusal widening/narrowing), or a key rename breaking `akrogon status --charts` consumers.
- **Observation (proof commands)**: (1) `akrogon run-check --name docs-links-final -- bun test tests/docs-links.test.ts` and `akrogon run-check --name pinned-literals -- sh -c 'bun test tests/chart-shapes.test.ts && bun test --test-name-pattern "watch" tests/watch-timer.test.ts'` on the committed head — the existing pins for untouched keys/literals (they exist at base; green at base per sibling evidence, and rerun here). If the watch-timer full file is heavy, fall back to its AREA-reading test names only, recorded. (2) The report's before/after table pairing each changed rule line (from the diff) with meaning-before and meaning-after — the table is the artifact slot B reads; the diff scan `git diff $AKROGON_BASE...HEAD -- skills/` pasted or linked. (3) Direct-route refusal pair explicitly quoted: old bullet vs new bullet.
- **Size**: seconds-to-minutes (test files). **Rerun trigger**: any edit under `skills/`.
- **Condition checks**: (a) *no behavior change* — the dangerous decisions are D3 rules 1–5; each changed rule line gets a before/after pair, so a semantic drift is visible in the table; the direct-route pair is quoted verbatim. (b) *keys stay* — mechanical: `grep -c` for the five keys before/after compared in the scan output (same command as criterion 1's scan, extended). A key rename would fail the comparison. No new machinery.

### Criterion 4 — docs pages updated, unrelated words untouched, diff scoped, `checks` pass

- **Brief criterion**: docs pages stating a charting-mode word today (at least words.md, skills.md, use/autopilot.md, use/plan-work.md) use the new words in the same change, mode-word edits only; unrelated words (`unattended`, `manual next`, `CLAUDE_CODE_SESSION_ATTENDED`…) untouched; diff touches only `skills/` and those docs pages; the destination's `checks` pass.
- **Real boundary**: `git diff` scope + content, the docs hit scan, and `akrogon verify`.
- **State before**: docs pages with old mode words (base counts: manual hits — words.md 0, skills.md 1, limits.md 1, use/autopilot.md 1, plan-work.md 3, autopilot-story.md 1 (adj.), examples/README 0, README.md 0; attended hits — plan-work.md 2, quick-fix-story.md 1; autopilot-signposts — words.md 1, use/autopilot.md 1, plan-work.md 1). **State after**: zero banned mode uses in docs (except none — no compat line exists in docs), all unrelated adjectives byte-identical, diff confined to the owned set.
- **Product failure caught**: the public docs teaching words the door no longer speaks (operator confusion — the brief's core problem), or collateral edits smuggling behavior/formatting changes.
- **Observation (proof commands)**: (1) `akrogon run-check --name taxonomy-scope -- git diff --name-only $AKROGON_BASE...HEAD` — output must list only the owned skills+docs paths; the report pastes it. (2) `akrogon run-check --name taxonomy-docs-scan -- sh -c '<scan of edited docs files for banned patterns + unchanged-adjective spot checks: grep -c unattended before/after equality>'`. (3) `akrogon verify` in the leaf worktree on the committed head — runs `format`, `test` (whole suite incl. docs-links/chart-shapes/watch-timer), `typecheck` on a fresh checkout; the green receipt is the `checks` evidence. Model-choice part: whether each docs edit is truly mode-word-only is slot B's reading of the diff — inputs: the diff; unproven: nothing beyond that judgment.
- **Size**: verify = minutes (sibling leaf sized `akrogon verify` minutes; `check_end` rows for `test` in `issues/timings.jsonl` govern). **Rerun trigger**: any edit in the worktree; verify reruns on the final committed head after the refresh onto current main.
- **Condition checks**: (a) *mode-word edits only* — enforced by the diff review table (every changed docs line pairs to a mode word); a non-mode docs edit is visible in the pasted diff. (b) *unrelated words untouched* — the before/after `grep -c` equality for `unattended`, `manual` non-mode adjectives (`manual step`, `manual akrogon next`) in the scan output; a drop fails the comparison. (c) *checks pass* — the verify receipt is mechanical. No new machinery.

## Open limitations preserved

- **SVG pixel text keeps old words** until `charting-pictures`/`guide-pictures` replace the files (D8); alt text around them uses new words immediately.
- **Existing chart records keep old words** — by design; the compat line is the read bridge. `issues/chart/builder-docs/CHART.md` (`on autopilot …`) is the live case.
- **Full-autopilot `continue autopilot` resume ambiguity** (D2) accepted: post-signposts the two modes behave identically at forks; recorded for review.
- **Release reach**: a skill edit reaches running doors only at the next release deploy (design line); a door already open keeps old words until then.
- **Parallel-leaf overlap**: `charting-guide` edits `docs/README.md` concurrently; merge order is the command's business, both diffs are narrow (different sections), and `guide-chapters` (blocked-by taxonomy-rename) rewrites these pages wholesale later — so this leaf optimizes for correctness now, not for minimizing future conflicts.

## Implementation notes

- **2026-11-27 (check.fix, F1)**: D2's flat mapping of `continue autopilot` → `continue semi-autopilot` is corrected within the plan's own scope: a legacy `continue autopilot` entry resumes the session's autopilot mode recorded in that chart's earlier `on` entry, falling back to `semi-autopilot` when none exists. Evidence: `issues/chart/test-temp-leftovers/CHART.md:35–37` and `issues/chart/direct-visible/CHART.md:30,35` record `on full autopilot` continued by `continue autopilot`; the flat reading loses the recorded signposts-conflict delegation (questions.md:41). The compat line still contains every old record word the brief lists; design Q4's one-sentence requirement is kept. Executable check: the two cited CHART.md sequences replayed through the corrected text select Full autopilot — verified in the check.fix report by tracing the lines against the final SKILL.md wording.
- **2026-11-27 (check.fix, F2)**: the switch-on `on` entry's detail is specified to carry the lower-case mode value (`on semi-autopilot` / `on full autopilot`), refining D3 rule 5's template line; no decision weakened. Executable check: the shapes.md `## Mode record` template block contains a switch-on template or example carrying `on semi-autopilot` in lower case.
- **2026-11-27 (check.fix round 2, F5)**: the F1 correction is refined once more within the same scope: an earlier `on` entry with no mode word — the legacy shape before Full autopilot existed (`issues/chart/config-walls/CHART.md:30`, `orphan-pane/CHART.md:27`, `killed-run-fixture/CHART.md:33`, `pull-gh-path/CHART.md:32`, all October 2026, predating Full autopilot's introduction in `d6bb6429` on 2026-11-04) — resolves the continuation to Semi-autopilot, the only autopilot mode of that era. Final rule: legacy `continue autopilot` reads as `continue full autopilot` only when the chart's mode record holds an earlier `on` entry explicitly recording full autopilot, and as `continue semi-autopilot` otherwise, including a bare or missing `on` entry. Executable check: the four cited October sequences plus the two November Full autopilot sequences trace correctly against the final SKILL.md:128 text — verified in the check.fix report.
