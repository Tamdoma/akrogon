# Brief 1 — taxonomy-rename unit U1: skill files

## 1. Goal

Rename the Charting-mode and Build-route vocabulary in the chart-issues skill files to the operator-approved taxonomy, preserving every rule's behavior bit-for-bit in meaning. Plan decisions D1, D2, D3, D4 (copied in section 6) govern. Criteria 1, 2, 3 of the leaf.

Approved taxonomy: category **Charting mode** with values **No autopilot**, **Semi-autopilot**, **Full autopilot**; category **Build route** with values **Direct**, **Lifecycle**. Record values the door writes are lower case (`on semi-autopilot`, `continue semi-autopilot (handover <time>)`, `continue no autopilot (handover <time>)`).

## 2. Numbered acceptance criteria

1. In the files you own, the category `Charting mode` is named with exactly the values No autopilot, Semi-autopilot, Full autopilot, and the category `Build route` is named with values Direct and Lifecycle (both appear in SKILL.md; `skills/AREA.md` line 11 names both categories).
2. Outside exactly one line that starts with `Old record words:` in `skills/chart-issues/SKILL.md` (in section `## Autopilot`, directly after the mode definitions), no line uses `manual` or `attended` as a mode name, bare `autopilot` as the middle mode, or `autopilot signposts` as a mode name.
3. The record templates (shapes.md `## Mode record` lines 54–58, handover.md line 5, autopilot.md line 23) write the new values lower case; `continue attended` and `attended next` no longer appear anywhere; the `Old record words:` line maps all six old record words (`manual`, `attended`, `on autopilot`, `continue attended`, `continue autopilot`, `autopilot signposts`) to their new values.
4. Keys unchanged, byte-identical: the `Route:` line with lower-case `direct | lifecycle`, `## Mode record`, `## Autopilot`, `signposts: <operator | A>`, the `akrogon direct` verb, all file names. Pinned literals unchanged: at least 3 occurrences of `` `akrogon pack <chart>` `` in SKILL.md; the strings `Handed off`, `Closed`, `Held`; `## Operator decision (` in SKILL.md; the `### readiness.yaml` yaml fence in shapes.md.
5. In `skills/AREA.md`: no case-insensitive `cron` or `expir` anywhere (your edit must introduce neither), and the line containing `scripts/observe.ts` must not gain the string `akrogon status`.
6. `skills/chart-issues/assets/standing-design.md` is byte-unchanged (its one "under autopilot" is a family use, deliberately kept).

There are no planned tests to write — this leaf has no new tests (locked design line). You write and edit no test file.

## 3. Read-first list

- Your worktree root is the repo checkout. Read `skills/chart-issues/SKILL.md` fully first, then `skills/chart-issues/assets/shapes.md` (lines 50–100 and 410–425 closely), `assets/autopilot.md` fully, `assets/handover.md` fully, `assets/questions.md` lines 37–70, `skills/AREA.md` fully.
- `implementation/brief-1.md` (this file) is in the leaf folder, not the worktree.
- Copy the pattern of careful rewording from the existing prose itself — the register is terse rule text; keep it.

## 4. Change list and needed interfaces

You own exactly these paths in your worktree:
- `skills/chart-issues/SKILL.md`
- `skills/chart-issues/assets/autopilot.md`
- `skills/chart-issues/assets/handover.md`
- `skills/chart-issues/assets/questions.md`
- `skills/chart-issues/assets/shapes.md`
- `skills/AREA.md`

You edit nothing else. `skills/chart-issues/assets/standing-design.md` stays untouched (verify only). No shared test resource. No preceding unit. Created at the leaf HEAD commit `562611bd309252ddcbe7a18a04a88629d0e82c0e` (A fills the exact creation commit below when the worktree is made — it is the same commit).

## 5. Do-not, reasons and exceptions

- Do not touch `src/`, `tests/`, `docs/`, `README.md`, `issues/`, `assets/standing-design.md` — other units and exclusions own them; overlapping edits break the wave's disjoint-paths rule. Exception: none; if you believe a rule forces an out-of-scope edit, return a mismatch with evidence instead.
- Do not rephrase rules beyond what the substitution needs — criterion 3 requires behavior preservation and slot B compares meaning before/after line by line. Minimal, surgical edits. Exception: where a sentence's grammar genuinely cannot carry the new word without a small reshaping (e.g. "in manual mode the operator may…" → "under No autopilot the operator may…"), reshape the minimum clause, never the sentence's logic.
- Do not use `autopilot signposts` anywhere outside the one `Old record words:` line; do not add the alias `"autopilot signposts"` glosses back into mode definitions.
- Do not rename files or headings that carry no mode word. `## Autopilot` and `## Mode record` are keys: never renamed.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.
- The worker never runs any `git stash` subcommand, because every worktree of a repo shares one stash and a pop can lift a sibling worker's edit; to check behaviour on the base use a second worktree of the base instead. To set work aside: commit it as a WIP commit and, before returning, `git reset --soft <creation commit>` and make the unit's returned commit once, so A's cherry-pick of that one commit carries all the work.
- Unattended commands: write no command that waits on a human; write no poll or sleep loop; run a slow command once in the foreground with the tool timeout set above its expected run time, waiting on its exit inside your turn; re-express a harness denial of a command inside the same grant and identity (a simpler single command, the configured runner, your own read or edit tool), never around a secret, `.env` or grant rule; when no permitted formulation answers, return a mismatch to A with the denial text verbatim; name no env file path on a command line — a value you need that is not declared is a mismatch, not a formulation to work around. Reason: no human answers a seat's command, and a worker reads only its brief, so the rule reaches it only here; there is no exception.

Reasons restated: disjoint paths keep the parallel wave safe; behavior preservation is a hard brief criterion; unattended-command rules exist because no human answers your commands.

## 6. Ordered steps

The substitution table (plan D3, verbatim, precedence top-to-bottom — first match wins; "mode word" means used as a Charting-mode or Build-route name):

1. **`manual` / `attended` / `in manual mode` / `attended switch` / mode-meaning `attended`** → `No autopilot` in prose (capitalized taxonomy value), `no autopilot` inside backticked record-entry templates. Enumerations like "manual and autopilot" become `under No autopilot and Semi-autopilot`.
2. **Bare `autopilot` meaning the middle mode** (operator answers signposts, A answers forks) → `Semi-autopilot` / record-form `semi-autopilot`. Detection: the sentence ties it to signposts/forks, switch-on, or route semantics of an autopilot chart.
3. **Bare `autopilot` meaning the whole family** ("under autopilot", "while autopilot waits", "autopilot rounds") → keep, but SKILL.md `## Autopilot`'s opening gains the definition that "under autopilot" covers Semi-autopilot and Full autopilot together, making each surviving family use exact by reference. Where the referent is exactly one mode, name that mode instead.
4. **`full autopilot`** → keep, capitalized `Full autopilot` in prose. **`autopilot signposts` as a mode name** → banned everywhere except the `Old record words:` line; the parenthetical glosses `"autopilot signposts"` disappear.
5. **Record-entry templates**: `continue autopilot` → `continue <mode value>` in generic template positions and `continue semi-autopilot` where the middle mode is meant; `continue attended` → `continue no autopilot`; `attended next <chart>` → `no autopilot next <chart>`; `<on | off | changed list | continue autopilot>` → `<on | off | changed list | continue <mode value>>`. The `on` entry's detail starts `on <mode value>` (`on semi-autopilot` / `on full autopilot`).
6. **Never touched**: file names and links (`autopilot.md`, `handover.md`), keys and section names (`## Mode record`, `## Autopilot`, `signposts: <operator | A>`, `Route:` values `direct | lifecycle`), the `akrogon direct` verb, unrelated adjectives (`unattended`).

Step-by-step for SKILL.md (line numbers are of the base file; verify by content, lines shift as you edit):

1. Line 10: "This is an attended door by default, not a lifecycle phase; only the operator's words can switch it to autopilot for a session" → runs under No autopilot by default; the operator's words can switch it to Semi-autopilot or Full autopilot for a session. Keep the sentence structure otherwise.
2. Line 41: "in manual mode the operator may take it in words in the door" → "under No autopilot the operator may take it in words in the door". The two bare `autopilot` uses in this line are family/middle mixes — read: "under autopilot in the pass-end line" (the pass-end line rule applies to autopilot modes — family, keep), "under autopilot it is an ordinary fork per autopilot.md" (same). Keep family uses, changing nothing else.
3. Line 69: "in manual mode the door asks one question" → "under No autopilot the door asks one question". Keep "autopilot's handling of findings and readings follows autopilot.md" (family).
4. Line 113 (Direct-route refusal bullet): "the door is running under autopilot (`## Autopilot`)" → "the door is running under Semi-autopilot or Full autopilot (`## Autopilot`)" — the old refusal matched exactly the two non-default modes.
5. `## Autopilot` opening (line 127): rewrite the mode definitions to: "Three modes form the Charting mode category, read from the operator's words with their scope rather than a fixed phrase: No autopilot, the default, where the operator answers the signposts and every fork; Semi-autopilot, where the operator answers the signposts once and A answers every fork after; and Full autopilot, where A answers both." Drop the `"autopilot signposts"` alias gloss entirely. Keep "Words that delegate only the signposts while the operator keeps the forks match none of the three modes, so the door asks which mode is meant." verbatim. Add immediately after the definitions ONE line starting exactly `Old record words:` mapping each old record word to its new value — suggested content: ``Old record words: `manual` and `attended` read as `no autopilot`, `on autopilot` as `on semi-autopilot`, `continue attended` as `continue no autopilot`, `continue autopilot` as `continue semi-autopilot`, and `autopilot signposts` as `full autopilot`.`` Then one sentence stating that in this file and its assets, "under autopilot" covers Semi-autopilot and Full autopilot together (this can be woven into the same paragraph — minimum churn).
6. Line 129: "Autopilot starts only from the operator's words…" — this covers switching on either autopilot mode: rephrase minimally, e.g. "Semi-autopilot and Full autopilot start only from the operator's words in the door's own terminal…". "the words carry the mode, the handed work and the consultants or none" stays. "Outside hc the door says autopilot cannot start" — family sense; keep or make it "they cannot start"; choose the cleaner minimal edit.
7. Line 131: "Every mode change (on, off, changed list, "continue autopilot") is appended to the mode record" — the quoted example becomes the new record form: `"continue <mode>"`. "the same A transcript path continues after compaction, while a different or unknown path starts attended until the operator says "continue autopilot", which resumes the same handed list" → "…starts under No autopilot until the operator says `continue <mode>`…" — keep the mechanism, use the record form in backticks or plain words, whatever is cleanest.
8. Line 139: "Its resume entry follows the session's mode: an attended session appends `continue attended (handover <time>)`, and a session whose mode record shows autopilot appends the autopilot resume entry per autopilot.md" → "…a session under No autopilot appends `continue no autopilot (handover <time>)`, and a session whose mode record shows Semi-autopilot or Full autopilot appends the autopilot resume entry per autopilot.md". "Without that start prompt or when it does not match, a new session starts attended in no chart" → "…starts under No autopilot in no chart".
9. Other SKILL.md lines (27, 31, 47, 49, 59, 65, 83): verify each `autopilot` hit; nearly all are family uses — keep. Line 83: "Prepare the complete contracts using shapes and standing design, and present one attended handoff review" → drop the word `attended` ("present the handoff review" or "one handoff review"); the parenthetical about autopilot already carries the distinction.

Step-by-step for shapes.md:

10. Mode record template (lines 54–58): change `<on | off | changed list | continue autopilot> <detail>` → `<on | off | changed list | continue <mode value>> <detail>`; the handover example line `attended next <chart>` → `no autopilot next <chart>`; `continue autopilot (handover <time>)` → `continue semi-autopilot (handover <time>)`; `continue attended (handover <time>)` → `continue no autopilot (handover <time>)`.
11. Prose line 88: `mode change (on, off, changed list, "continue autopilot")` → quote the new form `"continue <mode value>"` (or the continue examples; pick what reads exact); "The `handover` and `continue <mode> (handover <time>)` entries are appended on a chart switch per `handover.md`, so a fresh session resumes where the switch left off — the same handed list under autopilot, the named chart under attended." → "…the same handed list under Semi-autopilot, the named chart under No autopilot." (verify exact surrounding text before editing).
12. Line 90, 157, 160, 418 family uses of "under autopilot"/"under full autopilot": keep; capitalize `Full autopilot` in prose where it appears as the mode value (line 90 "under full autopilot A's picks" — record-context or prose? read the sentence; prose mode value capitalizes, record keys stay lowercase).
13. Line 418: drop `attended` from "the complete contracts and attended handoff review" (minimal: "and the handoff review"). Family uses on the rest of the line keep.

Step-by-step for autopilot.md:

14. Line 3: "Read when the session's mode is autopilot or full autopilot." → "…is Semi-autopilot or Full autopilot."
15. Line 7: "a session switched on mid-chart with no signposts yet asks the signposts round before A answers anything. Under autopilot the signposts round is a presented round" — this is Semi-autopilot-specific (under Full autopilot A answers it): → "Under Semi-autopilot the signposts round is a presented round". "Under full autopilot A answers the signposts too" → capitalize: "Under Full autopilot A answers the signposts too" — verify: prose here; but if it mirrors a record value keep backticks/lowercase as-is. Read the exact text first.
16. Line 13: "A charts <X> in the same autopilot run" (family/this-run use — keep or "the same run"; minimal edit, prefer keeping family word) — read and decide by rule 3. "Under autopilot the handed list wins…" family, keep.
17. Line 23: "where an attended switch creates the CHART.md with a pending Destination" → "where a No autopilot switch creates the CHART.md with a pending Destination". "The resume entry is `continue autopilot (handover <time>)`" → backticked template: `continue semi-autopilot (handover <time>)` — verify whether the resume entry under Full autopilot differs; the text says fresh A continues the same handed list; the record form is `continue <mode value>`, so you may write the generic with the semi example, e.g. "`continue <mode value> (handover <time>)` such as `continue semi-autopilot (handover <time>)`". Choose the minimal exact form.
18. Lines 9, 11, 15, 21 family uses: keep. Line 9 "would change autopilot's own switch or limits" family — keep.

Step-by-step for handover.md:

19. Line 5 template: `handover <time> <log>: attended next <chart>` → `handover <time> <log>: no autopilot next <chart>`. Check the rest of the file for `attended`/`autopilot` (there is "the autopilot folder contents" — family/section use, keep).

Step-by-step for questions.md:

20. Line 41: "In manual mode a material signposts question left unanswered stays open until the operator answers it or removes it as immaterial, and it is asked again before the first fork round; in autopilot mode it is recorded as unanswered, the built-in values fill that gap, and it is not asked again; under full autopilot A answers it." → "Under No autopilot … ; under Semi-autopilot it is recorded as unanswered … ; under Full autopilot A answers it." Then "an unresolved conflict between operator statements about the signposts is shown in one line and asked, in manual and autopilot — A resolves it only under full autopilot" → "asked under No autopilot and Semi-autopilot — A resolves it only under Full autopilot". "which is asked of the operator in every mode and waits under autopilot" — READ the sentence: the wait applies to conflict-between-operator-answers under autopilot modes; make it "waits under Semi-autopilot or Full autopilot" if that is the exact meaning, else keep family use. Decide by the rule's logic: a conflict between operator answers is asked of the operator "in every mode" and the wait happens in the modes where A would otherwise answer — both autopilot modes.
21. Lines 37, 39, 62, 70 family uses ("autopilot rounds", "an autopilot session", "under autopilot those drop…", "(under autopilot, one pick)", "(under autopilot, A's recorded pick)") — verify each; keep family uses.

Step-by-step for skills/AREA.md:

22. Line 11: "skills/chart-issues/SKILL.md runs the chart door — signposts round, three modes, drain, take and handoff" → name both categories minimally, e.g. "— signposts round, Charting modes (No autopilot, Semi-autopilot, Full autopilot) and Build routes (Direct, Lifecycle), drain, take and handoff" — but keep the bullet at most the line length the file already uses; the file must stay at most 40 lines total (currently 36). Introduce no `cron`/`expir` substring and do not touch the `scripts/observe.ts` line (line 22-ish, the watch-issues bullet — different line, but do not edit it).

Final pass (required):

23. Run the verification commands in section 7 and read your full diff (`git diff` before committing) once end to end, checking: every changed line preserves meaning; no missed mode-use of `manual`/`attended`/`autopilot signposts`; no accidental edit to pinned literals; `standing-design.md` untouched.
24. Commit exactly one commit on your detached HEAD with message naming the unit, e.g. `Rename charting taxonomy in chart-issues skill files`. Include every owned file's edits. Return the commit id.

Advisory size: 7 files, about 45 editing turns maximum. If a line's classification is genuinely undecidable under the table (family vs middle), make the reading the sentence's own logic supports, note it in your report under Known limitations — do not stop for it. Only a contradiction between the table and a locked rule (behavior would change either way) is a mismatch.

## 7. Commands

Run these targeted checks inside your worktree, in the repo root, after your edits and before committing:

```
akrogon run-check --name u1-scan -- sh -c 'grep -rEn "\bmanual\b|\battended\b|autopilot signposts" skills/chart-issues/SKILL.md skills/chart-issues/assets/autopilot.md skills/chart-issues/assets/handover.md skills/chart-issues/assets/questions.md skills/chart-issues/assets/shapes.md skills/AREA.md | grep -v "^skills/chart-issues/SKILL.md:.*Old record words:" ; echo "remaining-mode-hits-exit=$?"'
```

Expected: the only grep hit lines shown are non-mode uses (there should be none in skill files — verify each) or nothing; if a hit IS a remaining mode use, fix it.

```
akrogon run-check --name u1-taxonomy -- sh -c 'grep -c "Charting mode" skills/chart-issues/SKILL.md skills/AREA.md; grep -c "Build route" skills/chart-issues/SKILL.md skills/AREA.md; grep -c "^Old record words:" skills/chart-issues/SKILL.md; grep -c "akrogon pack <chart>" skills/chart-issues/SKILL.md; grep -c "Operator decision (" skills/chart-issues/SKILL.md; grep -Eic "cron|expir" skills/AREA.md; echo done'
```

Expected: Charting mode ≥1 in both files; Build route ≥1 in both; Old record words count exactly 1; akrogon pack ≥3; Operator decision ≥1; cron/expir count 0.

```
akrogon run-check --name docs-links-u1 -- bun test tests/docs-links.test.ts
akrogon run-check --name chart-shapes-u1 -- bun test tests/chart-shapes.test.ts
```

Both must exit 0. Run `bun install --frozen-lockfile --backend=copyfile` first if `node_modules` is missing in your worktree. Note: your worktree shares the leaf branch's committed HEAD which includes dependencies already installed in the leaf worktree, not yours — install if needed.

## 8. Done-when, evidence and report

Done when: acceptance criteria 1–6 hold, the four verification commands pass/exit as expected, your diff touches only your owned files, and you made exactly one commit.

Command output you keep goes through `akrogon run-check --name <label> -- <cmd>` citing the printed `check <label>: <exit> <path>` line; `akrogon log <path>` reads a cited log.

End your report with these four fill-in lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

Also in the report: paste the `Old record words:` line exactly as written, and list each changed template line (shapes.md 54–58 region, handover.md 5, autopilot.md 23) as old → new pairs — these feed criterion 2's proof in the leaf report.
