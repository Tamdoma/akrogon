# Plan: seed-cause-evidence

Direct slot A synthesis. `state.yaml` elects `debate: no`, so the brief and locked design control scope. One tracked file changes behavior: `skills/seed-issue/SKILL.md`. One doc follows it: `docs/guide/create.md`.

## Read first

- `brief.md`, `design.md` (this leaf): binding fork answers, the C1 counting method, replay strategy and literal gh commands.
- `skills/seed-issue/SKILL.md`: the only behavior file. Anchors: intro `:6-10`, routing `:12-22` (unchanged), report rule `:26`, "Not provided" `:28`, template `:30-47`, submit `:49-57`, one-report `:59`, failure rule `:61`, footer `:63-67`.
- `docs/guide/create.md:84-103`: the seed-issue section to update.
- `issues/closed/akrogon-loop/github/seed-issue/verification/seed-issue.md` + `boundary-source.txt`: the gh-substitution replay pattern and the prior rule count (12 directive + 1 dependency).
- `issues/closed/akrogon-loop/github/seed-issue/plan.md:29-33`: superseded D3; diagnosis and overlap checks return, banned items stay.
- `issues/seeds/56-*.md`: the filed report that motivated this leaf.
- `src/pull.ts:66-67`: seed bodies mirror verbatim into `issues/seeds/`; links need no code change.
- Reporter statements for replays: live bodies of Tamdoma/tamdoma-framework#124-#128, mirrored under `/home/ivan/Work/infra/tamdoma/framework/issues/seeds/124-*…128-*`.
- `learnings/LESSONS.md`: review-by-running (2026-09-10) and grep-docs-for-changed-rule (2026-09-11) lessons shaped wave assignment; no other lesson applies.

## Decisions

- D1. One discovery rule in the skill: after routing, open the files the failure names and follow them one hop to the caller or shared contract. File reads only, no project commands, installs or edits. Stop at a supported hypothesis or a named evidence gap; post whichever was reached.
- D2. `## Suspected cause` is a sixth, last template section after Urgency, always present, with five placeholder lines: conditions (main and contributing, no wider than the evidence), whose view, files read with installed/vendored copies flagged and unverified destination links named, what was not inspected or would disprove it, related reports. Bare "Not provided" is never the whole section; unsupported input yields "no supported hypothesis" plus the evidence needed next. A reporter suspicion contradicted by inspected evidence is stated as contradicted, with the evidence.
- D3. Reword `:26` in place per design: lift "diagnosis", keep "recommended fixes" and planning metadata banned, name six sections, and the title names a cause only when the reporter's statement is itself a cause, marked suspected. `:28` keeps "Not provided" scoped to the five original sections.
- D4. One lookup rule: two read-only calls on the routed repo before posting (author `@me` two-day window; 2-3 word keyword search, both `--state all`, `--json …,body`), retry a failed call once with a visible warning, judge candidates by body, `gh issue view` only for reporter-supplied links. Never comment, label or change state on a linked issue. A failed lookup still posts and states "search failed" with command and error in the section and the final outcome.
- D5. One root-line rule: after successful creation, print `/seed-issue Suspected root cause: <condition>. Seen in <owner/repo#n>, … <evidence limit>.` only when all five trigger conditions hold (supported hypothesis; another open linked report shares it; no found report covers it; lookup did not fail; this report is not itself a cause statement). Footer stays `Next: none` with its reason naming the printed line.
- D6. Rule budget: implementer counts by the design's method (by meaning; each new placeholder line that adds a requirement counts as one), lists every counted rule in the implementation report and lands under 20. If it cannot fit without losing meaning, the attempt ends with the count and rule list reported, never over the cap. Keep the skill under 300 lines and 4k tokens.
- D7. No change to chart-issues, `src/pull.ts`, routing rules `:12-22` or the compaction header `:6`. `gh` remains the only added dependency; no harness-specific syntax apart from the printed `/seed-issue` prefix.

## Interfaces (gh 2.102.0)

```text
gh issue list -R <repo> --state all --author @me --search "created:>=<YYYY-MM-DD two days back>" --limit <n> --json number,title,state,body
gh issue list -R <repo> --state all --search "<2-3 words>" --limit <small n> --json number,title,state,body
gh issue view <n> -R <repo> --json number,title,state,body   # reporter-supplied links only
gh issue create -R "$repo" --title "$title" --body-file -    # unchanged
```

Exit 0 with `[]` = none found; non-zero (e.g. "Could not resolve to a Repository") = search failed. Empty, failed lookup and failed creation give three distinguishable outcomes.

## Waves

### Wave 1

- U1. Rewrite `skills/seed-issue/SKILL.md` (D1-D6). Owns that file only.

### Wave 2 (needs U1 text)

- U2. Update `docs/guide/create.md` seed-issue section (design binding): Suspected cause, related links, root-report line, bounded discovery and its evidence limits; retain that missing details and unsupported causes are not invented. Owns create.md. Scans confirm no other doc states these rules; README/cheat/learn one-liners stay generic.
- U3. Scenario replays + implementation report. Owns verification artifacts and the report; evidence lives in the report and a temp directory, never under `issues/`. Produces the C1 rule list and flags unproven harnesses. Both U2 and U3 depend on U1's final text; disjoint owned paths, no shared mutable resource.

## Verification

Method per design: an agent follows the edited skill on recorded inputs; `gh` is substituted at the PATH boundary (records argv/stdin; returns recorded list/view output or a controlled error). One replay uses real `gh issue list`/`view` against Tamdoma/tamdoma-framework with create substituted. `gh issue create` is never called live; its call count proves one issue per run.

| Criterion | Proof | Catches | Size | Rerun when |
|---|---|---|---|---|
| 1 six sections, replay #124 reasoning placed in Suspected cause | Replay #124's body in the framework repo; inspect captured body | diagnosis leaks into Observation; section missing | minutes | SKILL.md changes |
| 2 unsupported cause still posts, names needed evidence | Replay a thin input; inspect body for "no supported hypothesis" + gap | bare "Not provided", invented cause | minutes | SKILL.md changes |
| 3 contradicted suspicion stated with evidence | Replay input whose suspicion the files refute | suspicion repeated as fact | minutes | SKILL.md changes |
| 4 file reads only, one hop, stops at gap | Inspect replay transcript for tool use | project command/edit during discovery | minutes | SKILL.md changes |
| 5 related line shape; closed precedent linked; keyword noise not linked; siblings listed with account/date/limit | Replays: keyword search returning #84/#38 noise and #123-#128; fresh-session author call | title-only judgment; missing search metadata | minutes | SKILL.md changes |
| 6 failed lookup still posts, states failure | Replay with shimmed failing list call (after one retry) | failure read as "none found"; lost report | minutes | SKILL.md changes |
| 7 no comment/label/state change | Shim argv: only issue list/view/create appear | mutation call slipped in | seconds | SKILL.md changes |
| 8 one issue per run; root line only on all five conditions; after #125 or #127, never #124/#126; post-#128 prints none | Fresh-session replay of #124→#125→#127 (+#126); real-call replay where #128 is open | line on failed/unsupported/cause-statement runs; extra creates | minutes | SKILL.md changes |
| 9 #126 replay title drops parser diagnosis | Inspect captured `--title` | diagnosis in title | minutes | SKILL.md changes |
| 10 links as plain `owner/repo#n` in body | Inspect captured stdin body | markdown link formatting | seconds | SKILL.md changes |
| 11 caps and rule count | `wc -l`, bytes/4 token ceiling, implementer's listed count under 20 | silent cap breach | seconds | SKILL.md changes |
| 12 create.md describes all three additions + bounded discovery | Diff read; grep docs for stale "five" section claims | stale/incorrect guide | seconds | create.md changes |
| Leaf checks | `bun run format`, `bun test --changed=$AKROGON_BASE --timeout=30000`, `bun run typecheck` | repo-level regressions | minutes | any diff changes |

Copy-flag proofs: replay inside `/home/ivan/Work/infra/tamdoma/framework` (origin = destination source, unflagged) and inside a temp fixture repo holding a copied framework file plus `akrogon.yaml issues_repo: Tamdoma/tamdoma-framework` (flagged, destination link unverified).

## Known limitations

- Same-org `gh issue view` proven only; other-org reporter links unproven.
- Lexical keyword search recall depends on chosen words; no rate-limit or large-repo proof.
- Harnesses not exercised in replays are named as unproven in the report.
- Related lines carry no explicit match marker for chart-issues; the door judges by content.
