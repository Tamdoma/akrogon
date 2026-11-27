# Brief 3 — taxonomy-rename unit U3: remaining docs

## 1. Goal

Apply the approved Charting-mode vocabulary to the remaining human-docs pages, mode-word edits only. Plan decisions D3, D5. Criterion 4 of the leaf.

Approved taxonomy: category **Charting mode** with values **No autopilot**, **Semi-autopilot**, **Full autopilot**; category **Build route** with values **Direct**, **Lifecycle**.

## 2. Numbered acceptance criteria

1. In your nine owned files, no line uses `manual` or `attended` as a charting-mode name or bare `autopilot` as the middle mode. `autopilot signposts` does not appear at all.
2. Non-mode words stay byte-identical: `a manual step` in docs/examples/autopilot-story.md line 18, `A manual akrogon next` in docs/reference/limits.md line 15, any `unattended` occurrence — never touched.
3. Edits are mode-word edits only: no reformatting, no link-target changes, no unrelated word touched.
4. Every relative link still resolves; file names never change.
5. `docs/README.md` line 22/55 list entries use the new words; nothing else in the file changes (a parallel leaf `charting-guide` will add sections to this file independently — your diff must stay minimal so merges stay trivial).

There are no planned tests to write — this leaf has no new tests. You write and edit no test file.

## 3. Read-first list

- `docs/examples/autopilot-story.md` fully (24 lines), `docs/examples/README.md` fully, `docs/examples/quick-fix-story.md` (line 5 alt text), `docs/reference/limits.md` lines 10–25, `docs/start/what-it-is.md` line 12 area, `docs/start/why-it-works.md` line 25 area, `docs/use/a-working-day.md` fully, `docs/use/quick-fix.md` fully, `docs/README.md` lines 15–60.
- `docs/use/autopilot.md` for context ONLY — another unit edits it; you must not.

## 4. Change list and needed interfaces

You own exactly these paths in your worktree:
- `docs/examples/autopilot-story.md`
- `docs/examples/quick-fix-story.md` (alt text only)
- `docs/examples/README.md`
- `docs/reference/limits.md`
- `docs/start/what-it-is.md`
- `docs/start/why-it-works.md`
- `docs/use/a-working-day.md`
- `docs/use/quick-fix.md`
- `docs/README.md`

You edit nothing else. No shared test resource. No preceding unit. Created at the leaf HEAD commit `562611bd309252ddcbe7a18a04a88629d0e82c0e`.

## 5. Do-not, reasons and exceptions

- Do not touch `docs/use/autopilot.md`, `docs/use/plan-work.md`, `docs/reference/words.md`, `docs/reference/skills.md` (unit U2), `skills/` (unit U1), `docs/pictures/*.svg` (deliberately excluded — the picture leaves replace them), `src/`, `tests/`, `README.md` at repo root. Exception: none; return a mismatch with evidence instead.
- Do not rename files or headings. Do not restructure pages.
- Do not "improve" prose. Mode-word edits only — the reviewing seat diff-checks unrelated changes.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.
- The worker never runs any `git stash` subcommand, because every worktree of a repo shares one stash and a pop can lift a sibling worker's edit; to check behaviour on the base use a second worktree of the base instead. To set work aside: commit it as a WIP commit and, before returning, `git reset --soft <creation commit>` and make the unit's returned commit once, so A's cherry-pick of that one commit carries all the work.
- Unattended commands: write no command that waits on a human; write no poll or sleep loop; run a slow command once in the foreground with the tool timeout set above its expected run time, waiting on its exit inside your turn; re-express a harness denial of a command inside the same grant and identity, never around a secret, `.env` or grant rule; when no permitted formulation answers, return a mismatch to A with the denial text verbatim; name no env file path on a command line — a value you need that is not declared is a mismatch, not a formulation to work around. Reason: no human answers a seat's command, and a worker reads only its brief, so the rule reaches it only here; there is no exception.

Reasons restated: disjoint paths keep the parallel wave safe; mode-word-only edits are a hard criterion; unattended-command rules exist because no human answers your commands.

## 6. Ordered steps

Substitution rules: mode-meaning `manual`/`attended` → `No autopilot`; bare `autopilot` as the middle mode (the mode where you answer signposts and the agent answers forks) → `Semi-autopilot`; `full autopilot` → `Full autopilot`; family-of-two uses may say "Semi-autopilot and Full autopilot" or, where the text is about the feature generally, pick the middle mode when that is what the sentence means. Never touch `unattended`, `a manual step`, `a manual akrogon next`.

### docs/examples/autopilot-story.md — the real case ran the MIDDLE mode

1. H1 `# Autopilot story: three speed fixes` → `# Semi-autopilot story: three speed fixes` (no inbound hash links exist to this heading — safe).
2. Line 3: "The operator handed them to a chart door in [Autopilot](../use/autopilot.md). Seat A charted them alone…" → "…to a chart door running [Semi-autopilot](../use/autopilot.md). Seat A charted…".
3. Line 5 H2 `## The operator switched autopilot on` → `## The operator switched Semi-autopilot on`.
4. Line 7: "It named autopilot, the batch of reports, and one chart consultant, B." → "It named Semi-autopilot, the batch of reports, and one chart consultant, B."
5. Line 11: "the `## Autopilot` section says so" — `## Autopilot` is a record section KEY: keep byte-identical.
6. Line 18: "A format ban would have added a manual step to every build." — `a manual step` is NOT a mode use: keep byte-identical.
7. Line 24: "Every handed chart takes the lifecycle route in autopilot." → "…under Semi-autopilot." (or "in Semi-autopilot" — match surrounding grammar).

### docs/examples/quick-fix-story.md

8. Line 5 alt text inside the image embed: "an attended chart ends in the direct route when small and eligible or in a lifecycle handoff, an autopilot chart ends only in a lifecycle handoff" → "a No autopilot chart ends in the direct route when small and eligible or in a lifecycle handoff, a Semi-autopilot or Full autopilot chart ends only in a lifecycle handoff". Nothing else in the file.

### docs/examples/README.md

9. Line 9 heading `## Autopilot story` → `## Semi-autopilot story`.
10. Line 11: "[Autopilot story](autopilot-story.md) shows autopilot." → "[Semi-autopilot story](autopilot-story.md) shows Semi-autopilot." And "The rules are in [Autopilot](../use/autopilot.md)." → "The rules are in [Charting mode](../use/autopilot.md)." File-name link targets unchanged.

### docs/reference/limits.md

11. Line 15: "A manual `akrogon next` still works there." — not a mode use: keep byte-identical.
12. Line 17: "outside a chart door running autopilot it does not decide product questions" → "outside a chart door running Semi-autopilot or Full autopilot it does not decide product questions". "Under autopilot the door's seat A answers its own forks — see [Autopilot](../use/autopilot.md)." → "Under Semi-autopilot and Full autopilot the door's seat A answers its own forks — see [Charting mode](../use/autopilot.md)." (Decide the exact phrasing by the sentence's meaning; if the first use really means both modes keep it that way.)

### docs/start/what-it-is.md

13. Line 12: "answered per the mode, see [Autopilot](../use/autopilot.md)" → "answered per the Charting mode, see [Charting mode](../use/autopilot.md)" — minimal.

### docs/start/why-it-works.md

14. Line 25: "after every open question is answered — by you or, under autopilot, by seat A; see [Autopilot](../use/autopilot.md)" → "…by you or, under Semi-autopilot or Full autopilot, by seat A; see [Charting mode](../use/autopilot.md)".

### docs/use/a-working-day.md

15. Line 5 alt text: "and autopilot charts and hands off but starts nothing" → "and Semi-autopilot or Full autopilot charts and hands off but starts nothing" (inside the alt text only).
16. Line 26: "Autopilot charts and hands off without asking you each question. It starts no execution. You still run `akrogon next` on the handed-off leaves. See [Autopilot](autopilot.md)." → "Semi-autopilot and Full autopilot chart and hand off without asking you each question. They start no execution. You still run `akrogon next` on the handed-off leaves. See [Charting mode](autopilot.md)." (Adjust grammar minimally — plural or keep singular with just the mode replaced; pick the smaller diff that reads correctly.)

### docs/use/quick-fix.md

17. Line 23: "- The door is running in [Autopilot](autopilot.md)." — this is the direct-route refusal list: the refusal applies to both autopilot modes → "- The door is running in [Semi-autopilot or Full autopilot](autopilot.md)." (or "[Charting mode](autopilot.md) under Semi-autopilot or Full autopilot" — pick the minimal exact phrasing).
18. Line 54: "Next: [Autopilot](autopilot.md)" → "Next: [Charting mode](autopilot.md)".

### docs/README.md

19. Line 22: "- [Autopilot](use/autopilot.md): let the chart door chart and hand off a fixed list of work without asking you each question." → "- [Charting mode](use/autopilot.md): let the chart door chart and hand off a fixed list of work without asking you each question." (Link target unchanged.)
20. Line 55: "- [Autopilot story](examples/autopilot-story.md): three speed reports charted by autopilot and landed as three leaves." → "- [Semi-autopilot story](examples/autopilot-story.md): three speed reports charted under Semi-autopilot and landed as three leaves."
21. Nothing else in docs/README.md — scan to confirm no other hits, but do not edit anything beyond mode words.

### Final pass

22. Run the scan in section 7; classify every hit. `## Autopilot` keys, file-name link targets, `unattended`, `a manual step`, `a manual akrogon next` are correct survivors — list them in your report with the reason.
23. Read your full diff end to end: only mode-word lines changed.
24. Commit exactly one commit, message e.g. `Rename charting taxonomy in remaining docs`. Return the commit id.

Advisory size: 9 files but small edits, under 30 turns.

## 7. Commands

```
akrogon run-check --name u3-scan -- sh -c 'grep -rEn "\bmanual\b|\battended\b|autopilot signposts" docs/examples/autopilot-story.md docs/examples/quick-fix-story.md docs/examples/README.md docs/reference/limits.md docs/start/what-it-is.md docs/start/why-it-works.md docs/use/a-working-day.md docs/use/quick-fix.md docs/README.md; echo "scan done"'
akrogon run-check --name u3-nonmode -- sh -c 'grep -c "a manual step" docs/examples/autopilot-story.md; grep -c "A manual .akrogon next" docs/reference/limits.md; echo nonmode-done'
akrogon run-check --name docs-links-u3 -- bun test tests/docs-links.test.ts
```

Expected: scan shows ONLY the two intentional survivors (`a manual step`, `A manual akrogon next`); u3-nonmode counts 1 and 1; docs-links exits 0. Run `bun install --frozen-lockfile --backend=copyfile` first if `node_modules` is missing in your worktree.

## 8. Done-when, evidence and report

Done when: criteria 1–5 hold, scans show only the justified survivors, docs-links green, exactly one commit.

Command output you keep goes through `akrogon run-check --name <label> -- <cmd>` citing the printed `check <label>: <exit> <path>` line; `akrogon log <path>` reads a cited log.

End your report with these four fill-in lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

Also list each surviving hit (`manual`/`attended`/`autopilot` non-mode or key uses) with its one-line justification — it feeds the leaf report's hit table.
