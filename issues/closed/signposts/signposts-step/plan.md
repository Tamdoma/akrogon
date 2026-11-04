# Plan: signposts-step

Synthesis by A, slot A, from the leaf's `brief.md` and `design.md`. The product is skill and doc prose: eight files under `skills/chart-issues/` and `docs/`; `src/`, `tests/` and `issues/` stay untouched (criterion 9), so no test is committed and every proof runs through `akrogon run-check` — the precedent is `issues/closed/autopilot/any-consultants/plan.md` (D9/D10 there).

## Decisions

- D1 — Placement in `skills/chart-issues/SKILL.md`. The signposts round is written as one new paragraph in `## Open`, after the consultant-restart and `akrogon pull` paragraphs and before the map: it runs once per door session at Open after intake import and the consultant restart, one consultant exchange adds missed angles first, it runs before any map, and every map brief carries the answers. The first-reply sentence in Open's first paragraph is extended so it names the mode and who answers the signposts in every mode. `## Drain`'s chart-selection sentence gains the signposts' chart order as the operator-named order and the drop rule (a dropped chart or seed is not charted this session). `## Take`'s "Research precedes every question" sentence gains the signposts round as the named exception (questions.md defines its light shape). `## Autopilot` gains: the door-session definition and the three modes read from the operator's words with their scope (manual, autopilot, full autopilot a.k.a. "autopilot signposts"; words delegating only the signposts while the operator keeps the forks match none of the three, so the door asks which mode is meant); under autopilot the signposts round is a presented round, not a wait, and no chart work starts before it is answered; under full autopilot A's signposts are echoed in the first reply, recorded as A's, may order the handed charts but never drop one (a drop A would make is recorded only, for the operator); A's fork picks follow "the evidence, the session's signposts, and where they are silent" the existing value list, and a recommendation names the signpost that decided it; a mid-chart autopilot switch-on with no signposts yet asks the round first; a session resumed in a later door run gets that run's signposts; a session with no signposts at switch-on asks first. `## Handover` gains: the handover entry carries the path of the session's signposts and a next-chart folder old A creates also carries the verbatim signposts copy — the one added file, an exception to "creates only its CHART.md" and to the autopilot folder contents; INTAKE.md and seats.yaml stay deferred. The signposts apply to door sessions opened after the rule lands.
- D2 — `assets/questions.md`. One paragraph names the signposts round the light exception to "Every round uses this shape": question, 2–3 options, recommendation, what it steers; reply key and challenge check kept; no research line. A second paragraph covers the unanswered-question rule per mode: manual — a material signposts question left unanswered stays open until answered or removed as immaterial and is asked again before the first fork round; autopilot — recorded as unanswered, the built-in values fill that gap, not asked again; under full autopilot A answers it. A third covers the short account of what the session will prioritize and give up that follows the answers, plus the conflict rules: the latest earlier signposts on the same repo are offered as proposed answers ("same" or change); an explicit operator correction is recorded without re-asking; an unresolved conflict between operator statements about the signposts is asked in one line in manual and autopilot (A resolves it only under full autopilot); an unresolved conflict about a fork becomes a fork answered per mode.
- D3 — `assets/shapes.md`. The Chart records tree lists `forks/signposts.md` beside `forks/<fork-slug>.md`. A signposts record paragraph states: the original lives in the chart where the round ran; every other chart of the session gets a verbatim copy at folder creation naming the original (including folders old A creates at a handover); the reply sits under `## Taken` (the operator's reply verbatim, or A's picks labelled as A's) so `akrogon status --charts` counts it taken; corrections are appended to the original and re-copied to the session's open charts; the session's dropped charts or seeds are listed in the original; the `## Autopilot` record names who answered the signposts. The "CHART.md created for a next chart with no folder" sentence gains the signposts copy as the one added file. If the added record includes an example block, that block must match `/^## Taken\s*\n\s*\S/m` — the checker asserts this.
- D4 — Docs. `docs/use/plan-work.md` gains a "Set the signposts" step between "Open a chart" and "Read the territory map": one round at the door's start sets the session's direction (priorities, hard limits, chart order or drops) before the map. `docs/use/autopilot.md` describes the three modes under "Switch it on" and names signposts where the page says A answers. `docs/start/what-it-is.md` step 2 names the signposts before the map. `docs/use/a-working-day.md` step 2 names the signposts where it walks through the door. `docs/reference/words.md` gains a Signposts entry (the session's direction round, answered per the mode) and the Autopilot entry gains the three modes.
- D5 — Pictures stay untouched (answers the design's `Open for the plan:` question). `docs/pictures/chart-door.svg` depicts the per-chart exchange (blind notes, merge, rebuttal, rounds, handoff) with no session-level step list, so it does not contradict the procedure; `ways-to-run.svg` contrasts attended with autopilot and names no mode. Criterion 8's "one procedure" is carried by page text. Recorded as a limitation for review, not a silent skip.
- D6 — `skills/AREA.md` is not edited: it lists key files, not the door's order (design's conditional "only if it describes the door's order" resolves no). `scripts/chart-usage.ts` is unchanged — the first chart's first span already covers any Open work including the signposts round.
- D7 — Modes and session defined once in `SKILL.md` `## Autopilot` (extending its opening paragraph), not split across Open and Autopilot: the session scope exists to bound the modes, so the reader finds both where the mode is defined. "Applies to door sessions opened after it lands" is stated once in the Open paragraph.
- D8 — Proof by structure plus one live probe, per the standing-design lock and the any-consultants precedent: a `/tmp/signposts-check.ts` checker asserts section-scoped anchors (placement, named concepts, negated shapes like "no research line" and the `## Taken` regex), a live `status --charts` probe proves the counting claim of criterion 6, the configured `test` check proves criterion 9's `bun test`, and a diff-scope script proves the owned-files boundary. Reading the changed sections against the criteria (whether the text says one coherent procedure) is review judgment — check-issue's slot — not a string test; the design rejected prose-string tests.
- D9 — One unit, serial-solo. The same signposts sentences must read identically across `SKILL.md`, `questions.md`, `shapes.md` and the five docs (the docs paraphrase the skill's rules); splitting them across parallel workers risks divergent wording of the same rule, and a unit split needs disjoint owned paths — the consistency risk outweighs the parallelism gain. Serial-solo means A implements the plan itself with no workers per implement-issue's rule.

## Read-first

Paths relative to the leaf worktree unless absolute.

- P1. `/home/ivan/Work/infra/akrogon/issues/open/signposts/signposts-step/brief.md` and `design.md` — authoritative leaf; the design's `signposts-rules` answers 1–15 are the binding decisions.
- P2. `skills/chart-issues/SKILL.md` — sections Open (first-reply sentence, consultant restart, `akrogon pull`, intake import), Drain (map and chart selection), Take ("Research precedes every question"), Autopilot (mode definition, pick rule, "never … extends the handed list", handover folder contents), Handover (next-chart folder creation).
- P3. `skills/chart-issues/assets/questions.md` — round-shape paragraph ("Every round uses this shape"), the omitted-answer rule ("An omitted material answer stays open").
- P4. `skills/chart-issues/assets/shapes.md` — Chart records tree, fork-file template (`## Taken`), `## Autopilot` record fields, the "created for a next chart" paragraph, the preflight fork-answer refusal (relies on the signposts file being a fork file with `## Taken`).
- P5. `docs/use/plan-work.md`, `docs/use/autopilot.md`, `docs/use/a-working-day.md`, `docs/start/what-it-is.md`, `docs/reference/words.md` — the human procedure and glossary.
- P6. `src/status.ts` `chartRow` — counts a fork file taken only when `## Taken` has text under it; read to keep the shapes.md claim true, not to change.
- P7. `docs/pictures/chart-door.svg`, `docs/pictures/ways-to-run.svg` — read to confirm no contradiction (D5).
- P8. `issues/closed/autopilot/any-consultants/plan.md` — the proof-class precedent (ephemeral checker + `run-check`, no committed test).
- P9. `learnings/LESSONS.md` — consulted; relevant: stale-rule-in-docs (grep `docs/` for a changed rule — drove D4's file list), ambiguous-prose-after-rename, review-by-reading (why the probe runs the real command). No lesson retires; no `learnings/` edit.

## Interfaces

- I1. `src/status.ts` `chartRow` counts `taken` as fork files matching `/^## Taken\s*\n\s*\S/m` — the signposts record keeps that shape; proven live by V2.
- I2. `tests/docs-links.test.ts` (inside `bun test`) checks relative links, heading anchors and image references in docs and skills — D4's links must resolve (prefer whole-page links or real heading anchors).
- I3. `akrogon status --charts` prints `TAKEN` as `taken/files` per chart — the criterion-6 consumer, exercised by V2.
- I4. `scripts/chart-usage.ts` reads `seats.yaml` spans — unchanged; the first chart's first span covers the round (D6).
- I5. Preflight's fork-answer refusal counts `forks/signposts.md` as a fork file automatically once it carries `## Taken` — no wording change needed there; the shapes.md record states the copy rule so a resumed door treats copies as answered.

## Units (serial-solo: every wave holds one unit)

- Wave 1 / S1 — owns all eight paths: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, `skills/chart-issues/assets/shapes.md`, `docs/use/plan-work.md`, `docs/use/autopilot.md`, `docs/start/what-it-is.md`, `docs/use/a-working-day.md`, `docs/reference/words.md`. No shared test resource, no prerequisite. Serial-solo per D9: identical rules across agent and human docs keep consistent wording only in one drafting hand. Criteria 1–9.

## Criterion proofs

All commands run in the leaf worktree through `akrogon run-check`. Sizes: V1, V2, V4 seconds; V3 minutes. Rerun triggers: V1 on any edit to the eight owned files; V2 on any change to `src/status.ts` chart counting or the shapes.md `## Taken` guidance; V3 on any commit; V4 on any new commit. No stage involves a model or outside call — the checkers are deterministic scripts and the probe is a local command — so the recorded-output rule does not apply; nothing is replayed.

| Criterion | Observation | Command |
|---|---|---|
| 1 (Open placement, consultant exchange, map briefs, first reply) | Boundary: `SKILL.md` section `## Open` and the `## Take` research sentence. Before: no signposts text. After: the round is placed at Open after intake import and consultant restart, before any map; one consultant exchange adds missed angles first; map briefs carry the answers; the first reply names the mode and who answers the signposts; Take names the light exception. Product failure caught: a door that runs the round after the map, or without the angle exchange, or that leaves the first reply silent about who answers — the exact failure mode the brief fixes (the door going straight to single forks). | `bun /tmp/signposts-check.ts "$PWD"` (assertions tagged `SKILL Open`, `SKILL Take`) |
| 2 (session + three modes + ambiguous-words ask) | Boundary: `SKILL.md` `## Autopilot`. Before: autopilot is one mode, no session definition, no manual/full-autopilot naming. After: the door session is defined (first operator message until a new door run; survives pass end, compaction, handovers); three modes named from operator words with their scope; words delegating only signposts while the operator keeps forks are asked about. Failure caught: a door inventing a fourth mode, re-asking signposts after a handover, or silently guessing a partial-delegation mode. | same checker (`SKILL Autopilot` assertions) |
| 3 (autopilot presented round, echo, never-drop, pick rule) | Boundary: `SKILL.md` `## Autopilot`. Before: A answers every operator-facing question; no signposts distinction. After: signposts is a presented round not a wait; A's signposts echoed in the first reply and recorded as A's; A may order but never drop handed charts; pick rule names signposts first, then the value list, and a recommendation names the deciding signpost. Failure caught: chart work starting on unanswered signposts, or A dropping a handed chart as if it were operator-authorized. | same checker (`SKILL Autopilot` assertions) |
| 4 (handover path + verbatim copy) | Boundary: `SKILL.md` `## Handover` and `shapes.md` next-chart paragraph. Before: handover creates only CHART.md (attended) or INTAKE.md + CHART.md (autopilot). After: the entry carries the signposts path; a next-chart folder gains the verbatim copy as the one added file; INTAKE.md and seats.yaml stay deferred. Failure caught: a fresh A resuming a chart without the session's direction. | same checker (`SKILL Handover`, `shapes.md Chart records` assertions) |
| 5 (questions.md light exception, per-mode unanswered, short account) | Boundary: `assets/questions.md`. Before: every round carries the full shape including a research line; one generic omitted-answer rule. After: the signposts round is the named light exception; manual/autopilot unanswered behavior differs as specified; one short account follows the answers. Failure caught: the door demanding research for an intent question, or re-asking an autopilot signpost forever. | same checker (`questions.md` assertions) |
| 6 (shapes.md record + counted taken) | Boundary: `assets/shapes.md` text, then the live `chartRow` counter via `akrogon status --charts` on a throwaway chart. Before: no `forks/signposts.md` in the tree or rules. After: fork shape with the reply under `## Taken`; original vs verbatim copies; corrections re-copied; dropped charts/seeds listed; `## Autopilot` names who answered. Failure caught: a record shape the status command cannot count (e.g., reply placed outside `## Taken`), and copy rules that let signposts drift between charts of one session. | `bun /tmp/signposts-check.ts "$PWD"` (`shapes.md` assertions incl. the Taken-regex on the example block) AND `bash /tmp/signposts-probe.sh` (live count 1/2 with Taken body, 0/2 without) |
| 7 (reuse offer, corrections, conflicts, drain order, applies-after) | Boundary: `SKILL.md` + `questions.md` text and `## Drain`. Before: no reuse, conflict or drain-order rules. After: earlier signposts offered as "same" or change; corrections recorded without re-asking; one-line conflict ask (manual/autopilot; A resolves under full autopilot); fork conflicts become forks per mode; Drain takes the signposts order as the operator-named order and skips dropped charts/seeds; the rule applies to sessions opened after it lands. Failure caught: a door re-litigating settled direction, or Drain ignoring a session's agreed order. | same checker (`SKILL+questions`, `SKILL Drain` assertions) |
| 8 (docs carry the procedure) | Boundary: the five docs. Before: no signposts anywhere; "autopilot" is one mode. After: plan-work orders signposts before the map; autopilot.md names the three modes; what-it-is and a-working-day name the step; words.md has Signposts and updated Autopilot entries. Reading Open → Drain → Autopilot with these pages gives signposts → map → fork rounds → handoff. Failure caught: a reader learning a procedure where direction is set mid-chart or not at all. | same checker (`docs/*` assertions); the "one procedure" reading itself is review judgment (D8) |
| 9 (`bun test` green; `src/`, `tests/`, `issues/` unchanged) | Boundary: the configured `test` check and the committed diff vs `AKROGON_BASE`. Before: suite green on base; empty diff. After: suite still green; diff names exactly the eight owned files. Failure caught: a doc-link break, a stray test or `issues/` write on the branch. | `akrogon run-check --name 'test' -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile --backend=copyfile'"'"' && akrogon guard own-modules && sh -c '"'"'bun test --timeout=30000 --parallel=4 --no-isolate'"'"''` (the configured `checks.test` verbatim) AND `bash /tmp/signposts-owned.sh "$PWD"` |

## Condition checks

Each plan decision traced against its criterion's conditions. "Fresh / retried / refused / between" does not apply to prose; the reachable violation is text missing or in the wrong place, so the cases are section- and paragraph-scoped assertions plus one shape regex.

- D1 conditions (C1–C4): the round must sit at Open before any map, the consultant angle exchange must come first, map briefs must carry the answers, the first reply must name mode and answerer, the session must survive handovers, A must never drop handed charts. Cases: section-scoped `need`/`someParaHas` assertions on `## Open`, `## Autopilot`, `## Drain`, `## Take`, `## Handover`. Red demo: the deliberate break placed signposts text after every section's end — all section-scoped assertions stayed red while presence assertions elsewhere passed (R-struct-break). The `never drop` claim is covered by the `drop + handed` paragraph assertion, not by the weaker `simplicity + signposts` pair, which the break showed can pass accidentally — recorded under Notes.
- D2 conditions (C5, C7): unanswered behavior differs by mode; the account follows answers; conflicts resolve per mode; reuse offers "same" or change. Cases: `questions.md` and combined `SKILL+questions` assertions.
- D3 conditions (C6): the `## Taken` regex is the mechanical part — a signposts example block with an empty `## Taken` fails `chartRow`'s regex; the deliberate break demonstrated exactly that red while `forks/signposts.md` presence passed. The live probe (V2) independently proved the counter's reading: 1/2 with a reply, 0/2 without.
- D4 conditions (C8): each doc names the step in its own terms — paragraph-scoped `signposts + map`/`signposts + session` assertions, not a bare file-level grep, so a stray mention in the wrong paragraph cannot pass unnoticed.
- D5/D6 conditions: no assertion needed; pictures and AREA.md are covered by the owned-files check (a diff touching them fails V4).

## Recorded red runs

- R-struct-red: `check signposts-struct-red: 1 /home/ivan/Work/infra/akrogon/issues/open/signposts/signposts-step/implementation/check-signposts-struct-red-1793751103407-3912479.log` — 45 failures on the unedited files (no signposts text anywhere); intended red for V1.
- R-struct-break (deliberate violation): `check signposts-struct-break: 1 /home/ivan/Work/infra/akrogon/issues/open/signposts/signposts-step/implementation/check-signposts-struct-break-1793751112330-3913558.log` — signposts sentences appended after the last SKILL.md section and a `forks/signposts.md` example with an empty `## Taken` appended to shapes.md; all section-scoped assertions and the Taken-regex stayed red while `forks/signposts.md` presence went green; reverted with `git checkout` before any commit.
- R-owned-red: `check signposts-owned-red: 1 /home/ivan/Work/infra/akrogon/issues/open/signposts/signposts-step/implementation/check-signposts-owned-red-1793751114677-3913861.log` — empty diff vs `AKROGON_BASE`, intended red for V4.
- R-probe (green, both phases shown): `check signposts-probe: 0 /home/ivan/Work/infra/akrogon/issues/open/signposts/signposts-step/implementation/check-signposts-probe-1793751103654-3912481.log` — `signposts-count-probe 1/2` with a `## Taken` reply, `0/2` after emptying it; the counter detects the reply's presence.

## Docs

One line each, all in scope:

- `skills/chart-issues/SKILL.md` — Open, Drain, Take, Autopilot, Handover gain signposts text (agent doc).
- `skills/chart-issues/assets/questions.md` — light-exception shape, per-mode unanswered, short account, reuse/correction/conflict rules (agent doc).
- `skills/chart-issues/assets/shapes.md` — `forks/signposts.md` in the records tree and the copy/Taken/Autopilot rules (agent doc).
- `docs/use/plan-work.md` — "Set the signposts" step before the map (human doc).
- `docs/use/autopilot.md` — three modes (human doc).
- `docs/start/what-it-is.md` — signposts named before the map in step 2 (human doc).
- `docs/use/a-working-day.md` — signposts named in step 2 (human doc).
- `docs/reference/words.md` — Signposts entry; Autopilot entry gains the three modes (human doc).
- Unchanged: `skills/AREA.md` (describes key files, not the door's order), `skills/chart-issues/assets/standing-design.md` (no signposts content), `skills/chart-issues/scripts/*` (usage script's first span already covers the round), `docs/pictures/*.svg` (D5), README.md (no chart-issues row), `src/`, `tests/`, `issues/` (criterion 9).

## Notes for review

- No brief/design conflict found.
- Preserved open limitation (D5): the SVG pictures do not depict the signposts step; they show per-chart exchange, not session order, so they do not contradict the pages, but a reader of only the diagram would not see the step. Accepted: pictures are not owned unless contradictory.
- The break run showed the `simplicity + signposts` paragraph assertion can pass accidentally when an implementer writes the two words in one stray paragraph; the `drop + handed` and `signposts + first` assertions carry the C3 weight. The checker's anchors are placement and naming proof; whether the text reads as one procedure is review judgment, per D8 and the design's no-prose-string-test decision.
- Checker corrections made at implement (appendix holds the final script): the `## Taken` regex now requires a block headed by a signposts title — the CHART.md block's `signposts:` line made the first form vacuous; and the next-chart-folder assertion is file-scoped because fenced `## ` headings truncate naive section splitting. Drain wording uses "a dropped chart or seed" so the `dropped` anchor matches.
- The probe creates and removes `issues/chart/signposts-count-probe` at the authoritative root inside one command with a cleanup trap; if interrupted it leaves an untracked chart folder — deleted manually, never committed (`issues/` edits are main-side work, not branch work).
- `/tmp/signposts-check.ts`, `/tmp/signposts-probe.sh`, `/tmp/signposts-owned.sh` live outside the repo during the run and are removed after the green run; the checker is preserved in the appendix below. No new proof machinery is delivered to the repo — the scripts exist for this leaf's proofs only, and the criterion commands use runners present at `AKROGON_BASE` plus three direct invocations.

## Appendix: signposts-check.ts

```typescript
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root: string = process.argv[2] ?? '.';
let fails = 0;
const fail = (m: string): void => {
  fails += 1;
  console.log(`FAIL ${m}`);
};
const pass = (m: string): void => console.log(`ok ${m}`);

const read = (p: string): string => readFileSync(resolve(root, p), 'utf8');
const need = (where: string, hay: string, words: string[]): void => {
  const l: string = hay.toLowerCase();
  for (const w of words) (l.includes(w.toLowerCase()) ? pass : fail)(`${where}: "${w}"`);
};
const section = (md: string, title: string): string => {
  const hit: string | undefined = md.split(/^## /m).find((p) => p.startsWith(title));
  return hit === undefined ? '' : hit;
};
const paras = (md: string): string[] => md.split(/\n\s*\n/).map((p) => p.toLowerCase());
const someParaHas = (where: string, md: string, words: string[]): void => {
  const ws: string[] = words.map((w) => w.toLowerCase());
  if (paras(md).some((p) => ws.every((w) => p.includes(w))))
    pass(`${where}: paragraph holds ${words.join(' + ')}`);
  else fail(`${where}: no paragraph holds ${words.join(' + ')}`);
};
const blocks = (md: string): string[] => [...md.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((m) => m[1]);

const skill: string = read('skills/chart-issues/SKILL.md');
const questions: string = read('skills/chart-issues/assets/questions.md');
const shapes: string = read('skills/chart-issues/assets/shapes.md');
const planWork: string = read('docs/use/plan-work.md');
const autopilotDoc: string = read('docs/use/autopilot.md');
const workingDay: string = read('docs/use/a-working-day.md');
const whatItIs: string = read('docs/start/what-it-is.md');
const words: string = read('docs/reference/words.md');

const open: string = section(skill, 'Open');
const drain: string = section(skill, 'Drain');
const take: string = section(skill, 'Take');
const autopilot: string = section(skill, 'Autopilot');
const handover: string = section(skill, 'Handover');

// C1 — Open: signposts round position, consultant exchange, map briefs, first reply.
need('SKILL Open', open, ['signposts', 'before any map', 'missed angles', 'map brief']);
someParaHas('SKILL Open', open, ['first reply', 'mode', 'signposts']);
// C2 — session + three modes + ambiguous-words ask (Autopilot section).
need('SKILL Autopilot', autopilot, [
  'signposts',
  'door session',
  'manual',
  'full autopilot',
  'autopilot signposts',
  'none of the three modes',
]);
someParaHas('SKILL Autopilot', autopilot, ['new door run', 'signposts']);
// C3 — presented round, echo, never drop, pick rule, named signpost.
need('SKILL Autopilot', autopilot, ['presented', 'not a wait', 'recorded', 'echoed']);
someParaHas('SKILL Autopilot', autopilot, ['drop', 'handed']);
someParaHas('SKILL Autopilot', autopilot, ['simplicity', 'signposts']);
someParaHas('SKILL Autopilot', autopilot, ['signposts', 'first']);
// C4 — handover entry carries path; next-chart folder gains verbatim copy.
someParaHas('SKILL Handover', handover, ['signposts', 'copy']);
someParaHas('SKILL Handover', handover, ['signposts', 'path']);
// C5 — questions.md light exception + per-mode unanswered + short account.
need('questions.md', questions, [
  'signposts',
  'exception',
  'options',
  'steers',
  'challenge',
  'manual',
  'autopilot',
  'unanswered',
  'account',
  'asked again',
  'not asked again',
]);
someParaHas('questions.md', questions, ['signposts', 'research']);
// C6 — shapes.md signposts record, Taken shape, copy rules, autopilot line.
need('shapes.md', shapes, ['forks/signposts.md', 'verbatim', 'original', 'dropped', 'signposts:']);
if (blocks(shapes).some((b) => /^#.*signposts/im.test(b) && /^## Taken\s*\n\s*\S/m.test(b)))
  pass('shapes.md: signposts example keeps Taken-with-body shape');
else fail('shapes.md: no signposts example block matches the Taken-counted regex');
someParaHas('shapes.md next-chart', shapes, ['created for a next chart', 'signposts']);
// C7 — reuse offer, corrections, conflicts, drain order, applies-after.
someParaHas('SKILL Open or questions', skill + '\n\n' + questions, ['earlier signposts', 'same']);
need('SKILL+questions', skill + questions, ['correction', 'conflict', 'one line', 'opened after it lands']);
someParaHas('SKILL Drain', drain, ['signposts', 'order']);
someParaHas('SKILL Drain', drain, ['dropped']);
// C7b — Take research exception.
someParaHas('SKILL Take', take, ['research', 'signposts']);
// C8 — docs.
someParaHas('docs/plan-work.md', planWork, ['signposts', 'map']);
need('docs/autopilot.md', autopilotDoc, ['signposts', 'manual', 'full autopilot']);
need('docs/a-working-day.md', workingDay, ['signposts']);
need('docs/what-it-is.md', whatItIs, ['signposts', 'map']);
someParaHas('docs/words.md', words, ['signposts', 'session']);

console.log(fails === 0 ? 'PASS all' : `${fails} failure(s)`);
process.exit(fails === 0 ? 0 : 1);
```
