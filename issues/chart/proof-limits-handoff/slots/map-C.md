# Map C: proof-limits-handoff (Tamdoma/akrogon#127)

Slot C, 2026-11-04. Blind map, written before seeing A's or B's.

## What the surface shows

Facts, each with where I read it.

- F1 The operation-proof rule is per operation, not per criterion. `skills/chart-issues/SKILL.md` "Take", the paragraph "Every external operation a brief names": one real call per named operation, recorded with `limits stating what the call does not prove`. Nothing in that paragraph, in "Handoff", or in `assets/shapes.md` "Preflight and validation" reads `limits` back against a done-criterion. The only readers of `limits` are the schema (`src/readiness.ts`, `proofSchema`: `limits: text`) and a human.
- F2 The handoff audit's refusal is existence-shaped. `assets/shapes.md` "Preflight and validation": "Refuse the handoff when a brief names an external operation with no recorded proof under the Take operation-proof rule." A proof that exits 1 before reaching the property a criterion needs still exists, so the refusal does not fire. This is the reporter's suspected cause and the surface confirms it.
- F3 The rule already has the right concept for a narrower case. Same "Take" paragraph: "A provider dry-run or validate call counts only for the property the provider documents it proves" and "its proof ... observes the property the decision relies on, and a proof of a different form ... does not count for it." So "a proof counts only for the property it observed" is already skill law for config-key decisions and provider dry-runs, but not for done-criteria in general. #127 is the general case of a rule the skill states twice for special cases.
- F4 The chart's own record shows the gap was known and handled as a grant problem, not a proof problem. Framework `issues/chart/about-titles/forks/title-source.md`, section "Proof 2026-11-03: recorder launch": limits say "Does not prove finalize/verify acceptance or the copy judgment session", and the consequence line moves the copy cycle into the leaf and asks grant-draft-3 for the sessions. `about-titles/CHART.md` "Autopilot": "recorder launch partially proven ... grant sessions used 1 of 9", then the grant wait, then the handoff review line, which lists grants, usage, preflight and status, and no proof-versus-criteria line. The door treated an unproven verify path as a cost to budget rather than an unknown to probe.
- F5 The same chart shows the opposite reflex one step earlier. `title-source.md` "Proof 2026-11-03 (charting ... session 1 of 3)": the research template proof failed and "the Taken pick fails its proof; Q1 reopens". A failed proof of a fork pick reopened the fork. A failed proof of a criterion's deciding property did not reopen the criterion. The skill has a rule for the first (research and answers reshape forks) and none for the second.
- F6 The criterion text was wide and the proof was narrow. Draft brief criterion 1 at handoff (`about-titles/slots/leaf-draft/fixture-weave-recorder/brief.md`): "the real finalize and verify accept it". The closed leaf's criterion 1 (`issues/closed/about-titles/fixture-weave-recorder/brief.md`) grew two operator amendments ("Baseline diff", "Only what we touched") during the three stops. Each amendment is exactly the narrowing lock 3a says should happen at charting.
- F7 Three stops, all on the unproven property. `review-B.md` F1 (baseline taken after the session), F2 (copy judgment skipped because baseline residue short-circuits verify) and the later "Renewed invocation 2: copy judgment exposes existing unnamed-unit debt". All three sit inside "verify accepts a partial re-record", the thing `limits` said was not proven. The fixture's stale recordings (2026-10-18) versus verify checks added 2026-10-21 to 2026-10-29 were discoverable at charting by reading dates in the repo, with no paid session.
- F8 The handoff review already carries a per-leaf live-run line the door writes as prose. `SKILL.md` "Handoff": "The door also writes its own review line for each leaf whose done-criteria need a live run ... the line is information only, it never times out a leaf and never waives a criterion." This is the natural place for a proof-coverage line, and its "information only" wording is the pattern lock 1c allows.
- F9 Engine has no reader of `proofs` beyond parse. `grep proofs src/` outside `readiness.ts` returns nothing. `akrogon status` validates shape only ("Preflight and validation": "It does not prove source ownership, dependency existence or prose quality, which require the preceding audit").
- F10 Installed and repo skill copies are identical today (diff of SKILL.md and all three assets: same; `~/.claude/skills/chart-issues` links to `~/.akrogon/current`, release 9ee76bf6). So a leaf changing the repo skill reaches doors only through the next release link. No drift risk this session, but the fix is not live at handoff.
- F11 The docs restate the handoff review loosely (`docs/use/plan-work.md` "Review the handoff" and the story pages) and do not restate the operation-proof rule. Lesson `learnings/LESSONS.md` 2026-09-11 says grep docs for a changed rule. A new review line probably needs one sentence in `plan-work.md`. Low confidence that any doc test pins the wording: `tests/docs-links.test.ts` checks links, not prose.
- F12 `questions.md` "Optional measurement" already defines the capped, operator-chosen small experiment lock 3a asks for, but says "never replaces required operation proof". Lock 3a's "one small paid test the operator approves" is a required proof, not an optional measurement. The two paragraphs need to agree on which bucket the criterion probe sits in.

## Forks

### Fork 1: What unit does a proof cover, an operation or a criterion?

Today proofs are indexed by operation (F1). The bug is that a criterion depends on a property no operation proof reached.

- O1 Add a criterion-coverage step to the handoff audit, in text: for each done-criterion, the door names the proof whose `result` observed its deciding property, and a criterion whose property appears only in a `limits` line, or in no proof, is either probed (lock 3a's one approved paid test) or narrowed to the proven property at the review. Recorded as a line per criterion in the handoff review (F8 pattern). Later: the door has to decide what a criterion's "deciding property" is. That is judgment, so it fits 1c, but a lazy door can name a weak proof and the rule does not catch it. Invites proof records growing a `criteria:` or `proves:` field to make the link checkable, which is Fork 3.
- O2 Change the operation-proof rule itself: a proof that stops before the operation's end state (non-zero exit, refused gate) does not count as the proof of that operation, so the existing "no recorded proof" refusal fires. Smallest text change and no new review step. Later: it over-refuses. The recorder proof did prove login, pin read and dispatch, and those were legitimately needed by criterion 2 and 3. Treating it as no proof forces a rerun that would fail at the same gate until the leaf's own code exists, which is the circular case lock 3a's "narrow to what is proven" is meant to resolve. Also conflicts with the current rule's own spirit, which asks for `limits` precisely so partial proofs are recorded, not discarded.
- O3 Leave the rule and add a reading duty for the operator at the review (the reporter's workaround made official). Zero mechanism. Later: under autopilot there is no operator at the review (F4 shows A answered it), so the duty lands on A and is the same as O1 without the recorded line. Rejected by the autopilot lock in practice.

Lean: O1. It generalizes the rule the skill already states for dry-runs and locked config keys (F3) and reuses the review-line pattern (F8). Low confidence on one point: whether "deciding property" needs a definition in text or whether "the observable result the criterion names" is enough. I would say the latter and let the audit example be this leaf.

### Fork 2: What happens when the property is unproven and the probe is refused or impossible?

Lock 3a says: narrow the promise to what is already proven. The "Take" paragraph says the opposite: "Declining a required probe holds the handoff; when no safe sufficient probe exists the handoff is held and scope is not narrowed. There is no waiver." That is a direct conflict (see Conflicts, C1).

- O1 Keep "Take" as is for operations (an operation named in a brief must be called once, no narrowing) and apply lock 3a only to criteria: a criterion whose property the operation proofs did not reach is narrowed to the observed property, and the unobserved part becomes a prerequisite leaf or a later leaf. The two rules then cover different objects. Later: a door may dodge an operation probe by rewording the brief so the operation sits in a criterion. The audit already refuses a brief naming an unproven operation, so the dodge needs the operation to vanish from the brief, which an implementer-reading audit catches.
- O2 Rewrite the "Take" sentence to match lock 3a wholesale: a declined probe narrows scope. Later: removes the "no waiver" guard that #79-era charts needed. A door under autopilot answering its own review would narrow freely. Not recommended.
- O3 Narrowing produces a prerequisite leaf for the unproven property with the one-pass, one-break criterion from standing design. Later: in this leaf the "machinery" (recorder) was already the prerequisite leaf, and the unproven property was inside it. A prerequisite-of-the-prerequisite is a real option only when the property can be proven alone. Here it could have been: "verify accepts the checked-in fixture as it is today" needs no recorder, only a verify run, and would have exposed the stale 2026-10-18 recordings (F7) before any session.

Lean: O1, with O3 as the named shape of "narrowed part" when the property can stand alone. This is where lock 3a's "narrow" wording and the operator values (removing over adding) meet.

### Fork 3: Does the readiness contract get a machine-readable link from criterion to proof?

- O1 No schema change. The handoff review line names the proof per criterion in prose, and `proofs[].record` keeps linking to the fork. Fits locks 1c and 6a (no new engine code needed). Later: nothing stops a release of a leaf whose coverage line was never written, because nothing reads it. Accepted under 1c by the operator's own choice.
- O2 Add `proves: [<criterion number>]` (or `criteria:`) to `proofSchema` in `src/readiness.ts`, required. Lock 6a says engine code the move keeps is fine, and `readiness.ts` is named there. Lock 1c says no new command refusals. A required field is a parse refusal in `akrogon status` for new leaves. Lock 5a says new handoffs only, so existing closed and open leaves' `readiness.yaml` would fail parse unless the field is optional. Later: optional fields rot, required fields break the 5a lock. Either way this is a check the operator declined under 1c.
- O3 Add the field optional and have nothing read it. Worst of both. Reject.

Lean: O1. Record the link in the review line and in the fork file's proof section. Revisit the field only if #126's answer adds machine-read grant fields anyway, since both would land in the same `readiness.ts` edit (lock 4a, "when it adds no parts"). Low confidence: A may see #126 and #127 as one readiness edit. I would keep them separate unless #126 also stays text-only.

### Fork 4: When is the coverage check run, and with whose money?

Lock 3a fixes who pays (the door, before handoff, one approved small test). The open question is the ordering inside the door's pass.

- O1 Coverage is read after the proof calls and before the handoff review: the door compares each criterion to `result` and `limits`, lists uncovered criteria, and for each either drafts one capped probe into the grant wait (the existing "mutating or paid proof call waits for the operator's grant approval" line in "Autopilot") or narrows. Fits the current pass shape. Later: a probe discovered here reopens a fork if it fails (F5 precedent), so the chart may loop once. That loop is the point.
- O2 Coverage is read at criterion writing time, before any proof: each criterion names its deciding property and the operation that will observe it, so the proof list is derived from criteria rather than from brief operations. Cleaner model. Later: it changes the "Take" paragraph's indexing from operations to criteria for every chart, a larger text change than the bug needs, and a criterion often names a property no single operation observes. Over-reach for 4a's "when it adds no parts".
- O3 Both: criteria name the property up front, and the review line confirms it. Later: two places to keep in step. Reject on the operator's simplicity value.

Lean: O1.

### Fork 5: Where does the dated-fixture class of unknown belong?

F7: the fixture recordings predated three verify checks. That is discoverable from git dates with zero paid sessions, and it caused the stale-baseline stop. It is a cousin of #127: an unknown that charting could have resolved by reading, not by paying.

- O1 In scope under lock 4a: the coverage step asks, for each live-run criterion, whether the criterion's inputs (fixtures, recordings) are current against the checks that will judge them, as a read-only check in the review line. Adds a sentence, no parts. Later: the sentence is specific to recorded fixtures and may read as framework-shaped in an akrogon skill. The standing-design line "an input whose effect on a model stage is unknown is investigated, never silently reused" already states the principle, so this would be a pointer, not a new rule.
- O2 Out of scope: file as a separate seed. Later: the next chart with recorded fixtures repeats the stop.

Lean: O1 as a pointer to the existing standing-design sentence. Low confidence on whether A counts this as "adds no parts".

## Questions a practitioner would ask

- Q1 Who decides the "deciding property" of a criterion when the criterion is a compound sentence? Criterion 1 here bundled meta fields, byte stability, finalize acceptance and verify acceptance. The sane answer: each clause that names an outside system's acceptance is a property, and the review line lists them separately.
- Q2 Is one capped paid test always enough? Here the right probe was free (verify the untouched fixture). The rule should say "the smallest check that observes the property, paid only when no free one exists", so lock 3a's "one small paid test" is the ceiling and not the default.
- Q3 Does narrowing the criterion at charting push the unknown into the dependent leaf (`about-identity-title`)? Yes unless the narrowed part gets an owner. The audit's "cross-leaf promises have a matching owner" line already demands it, so the narrowing has to name a prerequisite leaf or an explicit exclusion in the dependent's design.
- Q4 Under autopilot, A reads its own review. Does a coverage line written and answered by A change anything? Only if the line must name a proof record by path and property, so a missing proof is visible in the chart folder afterward. The value is the record, not the gate.
- Q5 What proves the skill change? There is no test for prose. The proof is the next chart's handoff review carrying the line. The leaf's done-criterion needs an observable: a dry run of the audit on this closed leaf's draft files (`about-titles/slots/leaf-draft/`) showing criterion 1 flagged against `proofs[0].limits`. That is a read-only command with no model session, and it should be the leaf's criterion rather than "text updated".
- Q6 Does the usage script need to know about probes? No. `chart-usage.ts` measures spend; a charting probe is already one of the grant's sessions (grant-draft-2 counted "1 charting proof session"). Lock 2b plus #126 decide whether the probe counts against a bound, and that is #126's chart.

## Pitfalls over the work's lifetime

- P1 The review line becomes boilerplate ("all criteria covered") because nothing reads it. Removed by requiring each line to cite the proof record path and the `result` phrase that observed the property, so a reader can falsify it. Low cost in text, and lock 1c leaves it as text.
- P2 The fix lands in the repo skill but doors keep loading the release copy (F10). Removed by noting in the leaf's What that the change reaches doors at the next release link, and by the usual self-update path. Not this chart's to solve, but the handoff review should state it so nobody expects #127 fixed before a release.
- P3 Lock 3a's wording "narrowed to what is already proven" contradicts the "Take" paragraph (C1). If the leaf edits one and not the other, the skill contradicts itself, and the next door picks whichever paragraph it read last. Removed by Fork 2 O1 or by an explicit scoping sentence in both places.
- P4 Lock 4a tempts a wide rewrite of the proof paragraph. The family is "a proof counts only for the property it observed", which the skill already states for two special cases (F3). Removed by folding the two special cases and the general case into one sentence, rather than adding a third.
- P5 Over-probing. A door that must cover every criterion could ask for a paid probe per criterion. Removed by Q2's "smallest check, free before paid" and by the existing autopilot wait list, which already parks a chart on a paid proof until a grant exists.
- P6 Narrowing silently drops the dependent leaf's need (Q3). Removed by the existing owner-matching audit line, provided the review line states where the narrowed part went.
- P7 Docs drift: `docs/use/plan-work.md` "Review the handoff" lists what the review shows. Removed by one added sentence in the same leaf (F11, lesson 2026-09-11).
- P8 The `questions.md` "Optional measurement" paragraph says a measurement "never replaces required operation proof" (F12). A door may read a criterion probe as optional and decline it without consequence. Removed by naming the criterion probe as required proof in "Take", not as a measurement.

## Conflicts between locks and existing skill text

- C1 Lock 3a ("without approval the promise is cut to what is already proven") versus `SKILL.md` "Take": "Declining a required probe holds the handoff; when no safe sufficient probe exists the handoff is held and scope is not narrowed. There is no waiver." Same sentence is echoed in `questions.md` "Optional measurement". Resolution needs a stated scope split (Fork 2 O1) or an operator word on which wins for criteria. This is the one conflict I would put to A first.
- C2 Lock 1c (no new command refusals) versus lock 6a (new checks go in engine code the move keeps, naming `readiness.ts` and "the handoff check"). For #127 they agree only if the "check" is the door's text audit and the existing presence check command stays unchanged. Any `readiness.ts` schema change is a parse refusal, which 1c forbids. Noted so A does not read 6a as licence for a schema field.
- C3 Lock 5a (new handoffs only) versus any required schema field (Fork 3 O2): closed leaves' `readiness.yaml` would stop parsing in `akrogon status`. Only matters if Fork 3 goes O2.

## Split

One leaf. The change is text in `skills/chart-issues/SKILL.md` ("Take" one sentence generalized, "Handoff" one review line added), `assets/shapes.md` ("Preflight and validation" one refusal clause widened from "no recorded proof" to "no proof whose result observed the criterion's property"), `assets/questions.md` ("Optional measurement" one scoping clause), and `docs/use/plan-work.md` one sentence. No engine code under Fork 3 O1. One leaf because every piece is the same rule stated in the place each reader looks, and splitting would leave the skill contradicting itself between merges (P3).

Done-criterion shape I would expect: a read-only audit of the closed leaf's draft files flags criterion 1 against `proofs[0].limits` and names the narrowed criterion or the probe, and a draft whose proof `result` observes the property passes. No session, no grant. Low confidence that A agrees this is an observable rather than a prose check. If not, the fallback observable is the next chart's handoff review record, which is weaker.

Not in this leaf: a counted grant field (#126), the release-link timing (P2, operator's self-update), and any migration of open leaves (lock 5a).

## Low-confidence items

- LC1 Whether "deciding property" needs a definition (Fork 1).
- LC2 Whether A merges #126 and #127 into one `readiness.ts` edit (Fork 3).
- LC3 Whether the stale-fixture pointer counts as "no parts" under 4a (Fork 5).
- LC4 Whether a dry-run audit on draft files is an acceptable done-criterion for a skill-text leaf (Q5, Split).
- LC5 Whether the operator saw the limits line at the about-titles review: the review was written in A's pane under autopilot and only the `CHART.md` mode-record line survives, which lists no proof line. Intake says this was not inspected. I read every file under the chart folder and found no review text.

## Inputs read

Intake; framework leaf `readiness.yaml`, `brief.md`, `review-B.md` (F1, F2, headers), `implementation/report.md` ("Initial paid run", "Known limitations"); framework chart `about-titles/CHART.md`, `forks/title-source.md` (all sections), `slots/leaf-draft/fixture-weave-recorder/brief.md` criterion 1, `slots/grant-draft-3.md` grep; akrogon `SKILL.md` "Take", "Handoff", "Autopilot"; `shapes.md` "readiness.yaml", "Leaf files", "Preflight and validation"; `standing-design.md` whole; `questions.md` "Research", "Blind peer exchange", "Optional measurement"; `src/readiness.ts` whole; `signposts.md` "Question", "Taken"; `issues/chart/herdr-app/INTAKE.md` "Where akrogon touches herdr today", "Carry from tasks-hierarchy"; `issues/chart/grant-run-count/INTAKE.md`; installed-versus-repo skill diff; docs grep. Skipped: `review-B.md` sections after F2, `report.md` other sections, the about-titles leaf-review slot files beyond grep.
