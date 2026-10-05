# Design: seed-cause-evidence

## Binding decisions, verbatim

### discovery-role (issues/chart/seed-root-cause/forks/discovery-role.md)
Operator 2026-10-05: "1a | 2a |"

- Q1 = 1a. Both, with different jobs. Filing records a suspected cause and related reports, labeled unverified. chart-issues verifies the cause against live code with its own file:line evidence and groups seeds under one completion owner only after operator confirmation. Reason: each step uses context only it has (session at filing, code and operator at the door).
- Q2 = 2a. Filing uses session evidence, then opens the files the failure names and follows them one hop to the caller or shared contract. File reads only, no project commands, no installs or edits. Stop at a supported hypothesis or when the next step needs unavailable evidence, a reproduction run or broader exploration. Post the hypothesis or the evidence gap. Reason: a real discovery attempt that stays fast and side-effect free.

Binding (carry into leaves):
- "Not provided" stays legal. Symptoms stay complete when a cause is present.
- The cause section names each file read and flags installed or vendored copies as not the destination source.
- Done-criteria: unsupported hypothesis case, symptoms that do not share one cause (door reassesses, never copies), skill still meets C1 with gh as only dependency, docs/guide/create.md:84-103 updated and closed D3 named as superseded in the design. Done-criteria check behavior, not wording.
- Standalone consumers get an actionable evidence gap; the report never assumes a chart pass follows.

Correction 2026-10-05 (from chart-grouping 1a): chart-issues is not changed, so the door-side done-criterion "symptoms that do not share one cause (door reassesses, never copies)" is dropped from leaf done-criteria; that behavior is existing chart-issues behavior (SKILL.md:47, shapes.md:246). Filing-side done-criteria stand.

### cause-section (issues/chart/seed-root-cause/forks/cause-section.md)
Operator 2026-10-05: "1a | 2a | 3a"

- Q1 = 1a. New last section `## Suspected cause` after Urgency, always present. Content is a supported hypothesis, or "no supported hypothesis" plus the evidence needed next. Bare "Not provided" never replaces the gap. Observation holds only what was seen. Reason: facts and guesses never mix, and the section proves the attempt happened.
- Q2 = 2a. Four short template placeholder lines: conditions (main and contributing, several allowed), whose view (reporter, agent or both), files read with installed or vendored copies flagged, what was not inspected or would disprove it. Reason: each line answers a question the fixer would otherwise ask.
- Q3 = 3a. No portability rule sentence. The conditions line reads "the condition or pattern that allowed it, no wider than the evidence shows". Reason: same job at no rule-sentence cost, keeps file evidence.

Binding (carry into leaves):
- Reword `skills/seed-issue/SKILL.md:26` in place: lift "diagnosis", keep "recommended fixes" banned, name six sections. Placeholder text counts against C1 by function; record the counting method before handoff.
- Copy flags come from inspected provenance, not path name alone, and say when the link to destination source is unverified.
- Done-criteria: filing with a cause still fills all five original sections; replay of #124 input puts the checkManifestRule reasoning in Suspected cause, not Observation; reporter suspicion contradicted by inspected evidence; unrelated symptoms from one session; consumer-repo filing flags installed copies.
- Title rule (observation vs cause) moved to root-report.

#### C1 counting method (2026-10-05)

Recorded method from the closed leaves: the operator counts once, judging rules by meaning, no counter program (`issues/closed/akrogon-loop/bootstrap/core-skills/plan.md:17`). The closed seed-issue review counted 12 directive sentences plus one dependency sentence (`issues/closed/akrogon-loop/github/seed-issue/verification/seed-issue.md:43`). Under this fork's binding, each new Suspected cause placeholder line that adds a requirement counts as one rule. Door projection: 12 today, plus about 3 prose rules (trace, search, root line; search failure folds into the related line) and 5 placeholder lines, about 20. The leaf must land under 20 by the operator's count, merging only where meaning stays whole. Lines (68) and tokens (about 1k by bytes/4) are far under cap.

Handoff review 2026-10-05, operator: "1a | 2 no | 3 - yes". Q1 = O1: keep the under-20 cap; the leaf merges rules only where meaning stays whole, and if it still exceeds the cap it stops and reports the count to the operator instead of exceeding it.

### related-search (issues/chart/seed-root-cause/forks/related-search.md)
Operator 2026-10-05: "1a | 2a | 3a | 4a"

- Q1 = 1a. Two read-only calls on the routed repo before posting: the filing account's reports from the last two days (`gh issue list -R <repo> --state all --author @me --search "created:>=<date>"`), and one 2-3 word keyword search on the file, command or component this failure names, open and closed, small limit. Read issue links the reporter supplies, including cross-repo, without searching other repos. Link only reports the agent can tie to this one, each with a short reason. Reason: each search catches what the other misses.
- Q2 = 2a. Retry a failed read once with a visible warning, then file anyway and state "search failed" with command and error in the report and the final outcome. Operator choice authorizes this continue-after-error path. Reason: the observation is never lost and failure is never read as "none found".
- Q3 = 3a. No memory rule. Rebuild session siblings from GitHub on every filing via the Q1 author call (two-day window); links still in context are used too. Reason: works on every harness with no stored state or extra rule.
- Q4 = 4a. Fifth placeholder line in `## Suspected cause`: related reports as `owner/repo#n` (open or closed, shared file or condition), or "none found", or "search failed" with the error, and always the repo, query, states and limit searched.

Binding (carry into leaves):
- Never mark duplicates, comment, label or change state on linked issues. Mentions create cross-referenced timeline events; that is the accepted cost.
- Done-criteria: unrelated keyword match not linked; closed precedent linked as evidence, not open work; failing search still posts and states the failure; fresh session still lists earlier same-day reports; links survive unchanged into issues/seeds/ after `akrogon pull`; empty, failed lookup and failed creation are distinguishable.
- Required proof before handoff: the two gh read calls with the leaf's identity (recorded in Findings as read-only probes; rerun at proof time).


Leaf-writing correction 2026-10-05 (B R1, C D2): the two lookups return `body`, so candidates are judged by content, not titles. `gh issue view` stays for reporter-supplied links.

### root-report (issues/chart/seed-root-cause/forks/root-report.md)
Operator 2026-10-05: "1a | 2a | 3a" (after asking how the trigger works and whether /seed-issue runs twice; answered: the second run is optional copy-paste of the printed line, auto-filing is 1c)

- Q1 = 1a. After the report is created, print one ready `/seed-issue` line before the final two lines. File nothing extra. Footer stays `Next: none`, with its reason slot saying a root report line is printed above. Reason: root report for one copy-paste, one report per run, operator decides.
- Q2 = 2a. Print only when all hold: this report's Suspected cause is a supported hypothesis; at least one other open linked report shares that condition; no found report, open or closed, already covers that shared condition and its cases (judged by content); the related lookup did not fail; this report is not itself a cause statement. Reason: two reports with one supported cause are a problem class; coverage check stops repeats.
- Q3 = 3a. Reword the title clause at `skills/seed-issue/SKILL.md:26`: the title describes what was seen, and names a cause only when the reporter's statement is itself a cause, marking it suspected. No new sentence.

Binding (carry into leaves):
- The line names the suspected condition, the report identities and the evidence limit, never a fix. Running it is a normal filing, no root mode.
- Accepted cost: an ignored line reprints on later qualifying filings with the newest report list.
- Done-criteria: exactly one issue per run; no line after failed creation; replay of #124-#127 prints the line by the second or third report and not after #124 or #126; filing after #128 exists links #128 and prints none; unsupported cause, failed lookup and a cause-statement report print none; replay of #126 input gives a title without the parser diagnosis.
- Trigger plus title cost one to two rule sentences; door recounts C1 before handoff.

Restatement 2026-10-05 (leaf-writing review C D1): "by the second or third report and not after #124 or #126" mixes ordinals and identities, since the third report is #126. Meaning, stated by identity: the line prints after #125 or, at the latest, after #127, and never after #124 or #126.

### chart-grouping (issues/chart/seed-root-cause/forks/chart-grouping.md)
Operator correction 2026-10-05 (verbatim): "The chart issues skill has the consolidation process, look it up, so we don't double the work."
Operator 2026-10-05: "1a"

- Q1 = 1a (reshaped round). No change to chart-issues. Existing consolidation carries grouping: drain import (SKILL.md:31), territory map (:37), split proposal (:41), file:line verification (:47), destination seed comparison with operator confirmation (:69), one owner with many identities, full match closes, partial stays open, conflicts shown (shapes.md:244-246). Suspected cause and Related lines reach the door inside the verbatim seed body (src/pull.ts:67). Reason: no duplicate rule, chart-issues stays under its cap.
- Q2 (linked seeds on a one-symptom note) is covered by the same answer: the :69 comparison surfaces them.

Accepted costs:
- Nothing explicitly marks Related lines as match evidence; relies on door judgment.
- With a note about one symptom, related seeds surface at the :69 checkpoints (destination selection and before handoff review), not at open, so forks may need reshaping. (C final check G1)

Final-shape check: B no objection; C no objection, with record edits R1 (discovery-role door done-criterion has no owner) and R2 (INTAKE scope wording), applied 2026-10-05.

### Superseded closed decision
Closed D3 (`issues/closed/akrogon-loop/github/seed-issue/plan.md:29-33`, "Preserve observations without diagnosing") is superseded where it removed diagnosis and overlap checks. Filing now records a labeled suspected cause (cause-section 1a) and looks up related reports (related-search 1a). Still binding from D3: no recommended fixes or planning metadata, unverified-intake label, "Not provided" for missing details, urgency as impact and workaround, no routing destination in urgency, no local report destinations.

Excluded: chart-issues, `src/pull.ts` and every off-route item in `issues/chart/seed-root-cause/CHART.md` belong to no leaf here.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

No auth, backend, secret, browser flow or chain stage is touched. The changed artifact is a model writer's instructions, so the property under test is an agent following the new skill. The cheapest sufficient proof is scenario replay: an agent follows the edited skill on recorded inputs and the result is read against each done-criterion. There is no wording-asserting test, since that would be a vanity test. Each new behavior shows one deliberate break: remove its rule, and its scenario fails.

Outside calls:
- The leaf runs one replay through the edited skill with real `gh issue list` and `gh issue view` calls against Tamdoma/tamdoma-framework, using the operator's gh login, and a substituted `gh issue create`. This real run also proves "a filing after #128 exists links #128 and prints no line", since #128 is open today. Proofs P1-P7 in readiness.yaml prove the commands only, not the skill. (C)
- Replays that need an earlier world state (#124-#127 without #128) or a failed lookup substitute the `gh` process at the boundary. A PATH shim serves outputs recorded from a real call, trimmed to the replay moment, or a recorded failure. Hand-written edge inputs are allowed.
- `gh issue create` is never called live. It is substituted the same way, as the closed seed-issue leaf did (`issues/closed/akrogon-loop/github/seed-issue/verification/seed-issue.md`). The shim records argv and stdin, so "one issue per run" is checked by its call count. The creation proof is Tamdoma/akrogon#56, a real call with the same command and identity on 2026-10-05 (readiness.yaml). (C)

Replay sources:
- The GitHub bodies of Tamdoma/tamdoma-framework#124-#128 serve as reporter statements.
- Copy-flag cases (C):
  - `/home/ivan/Work/infra/tamdoma/framework` is the destination source, since its origin is Tamdoma/tamdoma-framework. A replay there proves "source, not flagged".
  - A temp fixture repo holds a file copied from the framework, plus `akrogon.yaml` `issues_repo: Tamdoma/tamdoma-framework`. A replay there proves "installed copy, flagged, link to destination source unverified".

Rule count (C1, cause-section Q1 = O1):
- Count by meaning, per the C1 counting method above. Each new Suspected cause placeholder line that adds a requirement counts as one rule.
- Existing non-routing rules at `skills/seed-issue/SKILL.md:26`, `:28`, `:51`, `:59-63` may be reworded or merged where meaning stays whole. (C)
- The compaction header `:6` and the routing rules `:12-22` stay unchanged, since the header is the shared first lines every akrogon skill carries (`issues/closed/akrogon-loop/bootstrap/core-skills/plan.md:17`). (A)
- If the count cannot land under 20, the attempt ends with the count and the rule list in the implementation report. (C)

Live grant: none. Evidence lives in the implementation report and a temp directory, never under `issues/`. `akrogon pull` copies the body verbatim (`src/pull.ts:67`, readiness proof P6), so links in the body reach the seed mirror without a leaf change. (C)

## Leaf architecture
Owned:
- `skills/seed-issue/SKILL.md`:
  - Report rule `:26`, reworded in place: lift "diagnosis", keep "recommended fixes" banned, six sections, title clause per root-report 3a.
  - `:28` "Not provided" scope.
  - The template gains `## Suspected cause` after Urgency, with five placeholder lines: conditions, whose view, files read with copy flags, not inspected or would disprove, related.
  - One discovery rule, one lookup rule and one root-line rule.
  - `:59` keeps one report.
  - Footer `:63-67`: reason slot names the printed line.
- `docs/guide/create.md` seed-issue section (`:84-103`).

Literal interfaces (gh 2.102.0):
- `gh issue list -R <owner/repo> --state all --author @me --search "created:>=<YYYY-MM-DD two days back>" --limit <n> --json number,title,state,body` (body per B,C)
- `gh issue list -R <owner/repo> --state all --search "<2-3 words>" --limit <small n> --json number,title,state,body` (body per B,C)
- `gh issue view <n> -R <owner/repo> --json number,title,state,body`, only for reporter-supplied links.
- `gh issue create -R "$repo" --title "$title" --body-file -` (unchanged).
- Exit 0 with `[]` means none found. A non-zero exit, such as 1 with "Could not resolve to a Repository", means search failed.

Root-report line form: `/seed-issue Suspected root cause: <condition>. Seen in <owner/repo#n>, <owner/repo#n>. <evidence limit>.`, printed after creation and before the final two lines.

Excluded: chart-issues and its assets, `src/pull.ts`, learn-issues, routing rules `:12-22`, any path under `issues/`.

Dependencies: none. blocked-by: [].
