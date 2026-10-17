# Plan: any-consultants

Direct synthesis by A for `debate: no`. No positions or rebuttals were produced or needed. The locked design governs scope.

## Decisions

- D1. Skill text changes only: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, `docs/guide/chart.md`. `peer-ask.ts` already accepts `(<pane> <return-file> "<text>")+` triples and `chart-usage.ts` accepts any non-empty seat letter; both are interfaces to reuse, not edit. No change under `src/`, `tests/`, `issues/` or other skills.
- D2. Roster rule, stated once per file section it applies to: the operator names zero or any number of peers; letters follow naming order, the first named peer is B, then C, D and so on. The no-peer path stays named `single slot`. Remove the cap wordings `C is named only with B`, `optionally C`, `the C pane` and the per-peer command `herdr pane split <B pane> --direction down ...`.
- D3. Pane creation in `SKILL.md` Open and `questions.md` Blind peer exchange: B uses `herdr pane split <A pane> --direction right --ratio 0.65 --cwd <root> --no-focus`; each later peer uses `herdr pane split <previous peer pane> --direction down --ratio 0.5 --cwd <root> --no-focus`, reading `.result.pane.pane_id` and starting one `herdr agent start` per peer as today.
- D4. Size sentence keeps the gate `only when A's pane fills its tab` / `otherwise only A's area is split`, and says all created peers share the right 35%. Answering the design's open question: add the observed consequence in the same sentence, that each later peer halves the previous peer's height (the charting proof showed B 19 rows, C and D 9 each). No mechanism changes; this is wording the proof already measured.
- D5. Direct route unchanged: eligibility keeps `B is not named`, the review step keeps `check-issue direct slot=B`, and B is defined once as the first named peer, so the reviewer exists whenever any peer is named.
- D6. `docs/guide/chart.md` peer section and diagram describe any number of named peers in the same role, each blind to A and to every other peer; `seats.yaml`/usage wording already reads `each named peer`.
- D7. Generalize examples so letters visibly continue past C: return-path names gain `fork-name-D.md` (rebuttal and final-check series included), the brief pointer's letter tuple reads `(A, B, C, D)`, and agreeing-slot tag examples gain `(A,B,C,D)` in both `SKILL.md` Take and `questions.md`. Where a rule lists per-peer duties, state it once as `each named peer` instead of enumerating letters.
- D8. Parallel sibling: leaf `autopilot-mode` also edits `SKILL.md` Open and `questions.md`. Neither edits `docs/guide/chart.md`'s peer section except this leaf. Whichever merges second rebases onto the other's text and keeps both outcomes (design `Shared lines`). No ordering is declared here; `blocked-by` stays empty since each is checkable alone.
- D9. Proof by function, not wording, per the standing-design lock: one structural checker asserts the changed mechanics (exact commands, paths, slot examples, absence of the removed cap phrases, direct-route anchors), while an agent judges whether each rule reads as stated-once for every named peer. No test is committed: the brief's criterion 6 limits the branch diff to the three owned files and the design excludes `tests/`, so all proofs run as `akrogon run-check` commands, matching this leaf's text-only change class.
- D10. A unit list with one member: the three files share one draft (the same roster sentences appear in `SKILL.md` and `questions.md` by design), so splitting them across workers risks divergent wording of the same rule. Every wave holds one unit; the run is serial-solo and A implements the plan itself per implement-issue's rule.

## Read first

Paths relative to the leaf worktree unless absolute.

- P1. `skills/chart-issues/SKILL.md` — Open (first-reply naming, pane creation, seat record), Drain (map exchange), Take (merge tags, rebuttal, final-shape check), Handoff (leaf review exchange), Direct route (B reviewer, `B is not named`).
- P2. `skills/chart-issues/assets/questions.md` — Blind peer exchange (roster sentence, pane creation, peer-ask triples, brief/return paths, map and fork rules, rebuttal, final check).
- P3. `docs/guide/chart.md` lines 166–207 — peer section, diagram, handoff paragraph.
- P4. `skills/chart-issues/scripts/peer-ask.ts` and `skills/chart-issues/scripts/chart-usage.ts` — confirmed variadic and letter-agnostic; read to keep text truthful, not to change.
- P5. `/home/ivan/Work/infra/akrogon/issues/open/autopilot/any-consultants/brief.md` and `design.md`; `issues/chart/autopilot/forks/picking.md` for the proof record (readiness.yaml `proofs`) behind D4.
- P6. `learnings/LESSONS.md` consulted; relevant observations: stale-rule-in-docs (`grep docs/ for a changed rule`), ambiguous-prose-after-rename (`sweep prose for the old term`) and 2026-10-01 explanatory-prose assertions (motivates D9's function-first checks). No lesson retires; no `learnings/` edit.

## Interfaces

- I1. `peer-ask.ts <budget> (<pane> <return-file> "<text>")+` — already N-ary; the text repeats the triple `for every peer prompted in the same step`.
- I2. `seats.yaml` — `seatSchema` accepts any non-empty `seat` string; the SKILL.md seat-record rule already covers `A and each named peer` and appends on session-id change. No wording change needed there beyond keeping it true for letters past C.
- I3. `herdr pane split` — proven at charting (`readiness.yaml` proofs: right split for B, down splits for C and D on w8, cleanup verified). Not rerun by this leaf.
- I4. Concrete scenario: operator names three peers and no panes. Door splits A right for B, splits B down for C, splits C down for D, starts three agents, addresses each by pane id. Drain/Take/Handoff rules apply to each named peer identically; returns land at `fork-name-B.md`, `fork-name-C.md`, `fork-name-D.md`; merge tags read `(A)`, `(B,C)`, `(A,B,C,D)`; B (first named) remains the direct-route reviewer if offered. Zero peers: `single slot`, no peer steps, no direct route.

## Acceptance criteria before implementation

- C1 (brief 1): `SKILL.md` and `questions.md` state peers may be none (`single slot`) or any number, letters follow naming order from B, and no rule caps peers at two or couples one peer's naming to another's.
- C2 (brief 2): first-reply naming, pane creation, blind exchange and return paths, rebuttal, final-shape check, leaf review, seat record and agreeing-slot tags are each stated once for every named peer; return-path and brief-pointer examples show letters past C.
- C3 (brief 3): the later-peer command is `herdr pane split <previous peer pane> --direction down --ratio 0.5 --cwd <root> --no-focus` and the size sentence covers the shared right 35% under the A-fills-tab gate.
- C4 (brief 4): direct route still requires B, B reviews, B is defined as the first named peer.
- C5 (brief 5): `docs/guide/chart.md` peer section covers any number of named peers, each blind to A and every other peer.
- C6 (brief 6): `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` lists exactly `docs/guide/chart.md`, `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`.

## Ordered checklist — one unit, serial-solo

Wave 1 (single unit, `S1`; owns all three files; no shared test resource; no prerequisite units; serial order because the same roster sentences must stay identical across `SKILL.md` and `questions.md`, so parallel edits risk drift — the run is serial-solo):

- [ ] S1. Rewrite the roster rule in `skills/chart-issues/SKILL.md` (Open naming + pane creation, Take tag examples), `skills/chart-issues/assets/questions.md` (Blind peer exchange roster, pane creation, `fork-name-*` example series, brief-pointer letters, map/fork/rebuttal/final-check peer text), and `docs/guide/chart.md` (peer section + diagram). Per D2–D7; run proofs below. Criteria C1–C6.

Affected docs: `docs/guide/chart.md` is the only human doc in the diff (in scope). Agent docs touched: `skills/chart-issues/SKILL.md` and `skills/chart-issues/assets/questions.md` (in scope). `skills/AREA.md`, `docs/reference-index.md` and all other docs: unaffected — they describe mechanisms this leaf does not change.

## Concrete verification

All commands run from the leaf worktree through `akrogon run-check`. `AKROGON_BASE` is injected by run-check (observed `f7baddc9`).

V1 — criteria 1–5 structural proof. `bun /tmp/any-consultants-roster-check.ts <worktree>` asserts: `single slot` and `each named peer` present in both files; cap phrases `C is named only with B`, `optionally C`, `the C pane`, `<B pane> --direction down` absent; each of the two split commands present exactly once per file; size gate (`only when`, `35%`, `A's pane fills its tab`, `only A's area is split`); `fork-name-D.md`, `(A, B, C, D)`, `(A,B,C,D)`; `B is not named`, `check-issue direct slot=B`, `first named peer`; guide peer section contains `each named peer` and `blind`, and does not claim peers are blind only to A. Boundary: the files the leaf owns; before state is the B/C-capped rule, after is the N-peer rule; catches the product failure of an agent reading a two-peer cap or a missing split recipe and under-staffing or mislaying panes.

- Red evidence (planned, recorded at plan.synthesis): `check roster-red2: 1 /home/ivan/Work/infra/akrogon/issues/open/autopilot/any-consultants/implementation/check-roster-red2-1792223100706-793783.log` — 14 failures on the unedited files including both `C is named only with B` hits, missing `fork-name-D.md`, missing later-peer command.
- Green: rerun `akrogon run-check --name roster-green -- bun /tmp/any-consultants-roster-check.ts <worktree>` after S1; exit 0. Size: seconds. Rerun trigger: any edit to the three owned files.
- The script lives under `/tmp` during the run and is removed after the green run; it is never committed (D9 keeps the diff to three files). A copy is preserved in this plan's appendix.

V2 — criterion 6 exact-diff proof. `akrogon run-check --name owned-files -- sh -c 'want=...; got=$(git --no-pager diff --name-only "$AKROGON_BASE"...HEAD | sort); test "$got" = "$want"'` with `want` the three sorted paths. Boundary: the committed leaf diff against its base; catches scope creep (a stray test file or `issues/` write) that text review misses. Red evidence: `check owned-files: 1 .../check-owned-files-1792223088803-793783.log` (empty diff on unedited tree). Green at handoff. Size: seconds. Rerun trigger: any new commit.

V3 — configured checks. `akrogon verify` in the worktree runs `format`, `test`, `typecheck` on a fresh checkout (the standing-design lock requires existing checks still pass; `docs-links.test.ts` covers any link the guide edit adds). Boundary: fresh-checkout run, catches broken links and format drift. Size: minutes. Rerun trigger: any commit.

An agent (reviewer) judges the remaining qualitative half of criteria 1, 2 and 5 — that each peer rule is stated once and reads correctly for arbitrary counts — as the checklist's review step; the structural assertions above are the mechanical half and intentionally do not pin wording (lesson 2026-10-01).

## Notes for review

- N1. Design/brief agreement: `blocked-by` stays empty; D8 records the known sibling collision with `autopilot-mode` for the second merger.
- N2. The `/tmp` proof script's negative phrases (`optionally C`, `the C pane`) are the exact old wordings removed by D2; if implementation rephrases differently, the script still passes because it checks function, but the equivalence is reviewed, not assumed.

## Appendix: roster-check script

The `/tmp/any-consultants-roster-check.ts` used by V1 (written at plan.synthesis, removed after green):

```ts
// Proof for leaf any-consultants criteria 1-5. Asserts the roster rule's
// function, not exact prose: commands/paths/slots/letter examples are literal;
// remaining checks assert the rule covers "each named peer" with no coupling or cap.
// Usage: bun /tmp/any-consultants-roster-check.ts <repo-root>

const root: string = process.argv[2];
const read = (p: string): string => require('node:fs').readFileSync(`${root}/${p}`, 'utf8');
const skill: string = read('skills/chart-issues/SKILL.md');
const questions: string = read('skills/chart-issues/assets/questions.md');
const guide: string = read('docs/guide/chart.md');

const fails: string[] = [];
const has = (text: string, needle: string, label: string): void => {
  if (!text.includes(needle)) fails.push(`${label}: missing ${JSON.stringify(needle)}`);
};
const no = (text: string, needle: string, label: string): void => {
  if (text.includes(needle)) fails.push(`${label}: still couples/caps via ${JSON.stringify(needle)}`);
};

has(skill, 'B', 'skill Open');
for (const f of [[skill, 'skill'], [questions, 'questions']] as const) {
  const [text, label] = f;
  has(text, 'single slot', label);
  no(text, 'C is named only with B', label);
  no(text, 'optionally C', label);
  no(text, 'the C pane', label);
}

for (const [text, label] of [[skill, 'skill'], [questions, 'questions']] as const) {
  has(text, 'each named peer', label);
}
has(questions, 'fork-name-D.md', 'questions return paths');
has(questions, '(A, B, C, D)', 'questions brief pointer letters');
has(skill, '(A,B,C,D)', 'skill agreeing-slot tags');
has(questions, '(A,B,C,D)', 'questions agreeing-slot tags');

const cmdB = 'herdr pane split <A pane> --direction right --ratio 0.65 --cwd <root> --no-focus';
const cmdLater = 'herdr pane split <previous peer pane> --direction down --ratio 0.5 --cwd <root> --no-focus';
const count = (text: string, needle: string): number => text.split(needle).length - 1;
if (count(skill, cmdB) !== 1) fails.push(`skill: B split command count ${count(skill, cmdB)} != 1`);
if (count(questions, cmdB) !== 1) fails.push(`questions: B split command count ${count(questions, cmdB)} != 1`);
if (count(skill, cmdLater) !== 1) fails.push(`skill: later-peer split command count ${count(skill, cmdLater)} != 1`);
if (count(questions, cmdLater) !== 1) fails.push(`questions: later-peer split command count ${count(questions, cmdLater)} != 1`);
no(skill, '<B pane> --direction down', 'skill per-peer split');
no(questions, '<B pane> --direction down', 'questions per-peer split');
for (const [text, label] of [[skill, 'skill'], [questions, 'questions']] as const) {
  has(text, 'only when', label + ' size gate');
  has(text, '35%', label + ' size');
  has(text, "A's pane fills its tab", label + ' size');
  has(text, "only A's area is split", label + ' size');
}

has(skill, 'B is not named', 'skill direct-route eligibility');
has(skill, 'check-issue direct slot=B', 'skill direct-route review');
has(skill, 'first named peer', 'skill B definition');

const section = guide.slice(guide.indexOf('## Independent views'));
has(section, 'each named peer', 'guide peer section');
has(section, 'blind', 'guide peer section');
if (/peer[s]? (?:is|are) blind to A(?:'s work)?[,.]/.test(section) && !/other peer/.test(section))
  fails.push('guide: peers blind only to A, not to each other');

if (fails.length) {
  console.log('FAIL');
  for (const f of fails) console.log(' - ' + f);
  process.exit(1);
}
console.log('PASS: roster rule covers any number of named peers, B-first ordering, previous-peer splits, direct-route B, guide blindness');
```
