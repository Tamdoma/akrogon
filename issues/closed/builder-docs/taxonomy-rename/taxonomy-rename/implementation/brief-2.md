# Brief 2 — taxonomy-rename unit U2: core mode docs

## 1. Goal

Apply the approved Charting-mode / Build-route vocabulary to the four core human-docs pages, mode-word edits only. Plan decisions D3, D5 (copied in section 6). Criterion 4 of the leaf.

Approved taxonomy: category **Charting mode** with values **No autopilot**, **Semi-autopilot**, **Full autopilot**; category **Build route** with values **Direct**, **Lifecycle**.

## 2. Numbered acceptance criteria

1. `docs/use/autopilot.md`, `docs/use/plan-work.md`, `docs/reference/words.md`, `docs/reference/skills.md` use only the new taxonomy words for charting modes and build routes. No line uses `manual` or `attended` as a mode name, bare `autopilot` as the middle mode, or `autopilot signposts` in any use (docs hold no compatibility line — it must disappear entirely).
2. `docs/use/autopilot.md`'s H1 becomes `# Charting mode` and the page is reframed to cover the category, with Semi-autopilot as the main use. No behavioral fact changes: the page must still teach exactly the same rules.
3. Edits are mode-word edits only: no reformatting, no restructuring beyond what the vocabulary needs, no unrelated word touched (in particular `unattended` never changes — note these files contain no `unattended` mode-relevant uses, but the rule stands).
4. Every relative link still resolves. File names never change (`docs/use/autopilot.md` keeps its name).
5. The file-name keys stay: links `[Autopilot](../use/autopilot.md)` may have their link TEXT changed but never their targets.

There are no planned tests to write — this leaf has no new tests. You write and edit no test file.

## 3. Read-first list

- `docs/use/autopilot.md` fully (57 lines), `docs/use/plan-work.md` fully, `docs/reference/words.md` fully, `docs/reference/skills.md` lines 1–40.
- `docs/use/quick-fix.md` for context on how the Direct route is described (you do NOT edit it — another unit does).
- `docs/reference/where-things-go.md` for docs conventions.

## 4. Change list and needed interfaces

You own exactly these paths in your worktree:
- `docs/use/autopilot.md`
- `docs/use/plan-work.md`
- `docs/reference/words.md`
- `docs/reference/skills.md`

You edit nothing else. No shared test resource. No preceding unit. Created at the leaf HEAD commit `562611bd309252ddcbe7a18a04a88629d0e82c0e`.

## 5. Do-not, reasons and exceptions

- Do not touch `docs/use/quick-fix.md`, `docs/README.md`, `docs/examples/`, `docs/start/`, `docs/reference/limits.md`, `docs/reference/where-things-go.md`, `skills/`, `src/`, `tests/`, `README.md` — other units own them or they are out of scope. Exception: none; return a mismatch with evidence instead.
- Do not rename any heading that is a link target. Verified safe: `docs/use/autopilot.md` has NO inbound hash links, so its headings are free; `docs/use/plan-work.md` anchors `#open-a-chart`, `#answer-one-fork-per-round`, `#set-the-signposts` are linked from words.md — those headings carry no mode words, do not touch them.
- Do not delete or alter the alt text of the SVG embeds except the mode words inside it (docs/use/plan-work.md line 9 embeds ways-to-run.svg with alt text containing "an attended chart" and "an autopilot chart" — update those phrases only inside the alt text).
- Do not editorialize, tighten, or improve prose beyond the vocabulary change. Mode-word edits only.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.
- The worker never runs any `git stash` subcommand, because every worktree of a repo shares one stash and a pop can lift a sibling worker's edit; to check behaviour on the base use a second worktree of the base instead. To set work aside: commit it as a WIP commit and, before returning, `git reset --soft <creation commit>` and make the unit's returned commit once, so A's cherry-pick of that one commit carries all the work.
- Unattended commands: write no command that waits on a human; write no poll or sleep loop; run a slow command once in the foreground with the tool timeout set above its expected run time, waiting on its exit inside your turn; re-express a harness denial of a command inside the same grant and identity, never around a secret, `.env` or grant rule; when no permitted formulation answers, return a mismatch to A with the denial text verbatim; name no env file path on a command line — a value you need that is not declared is a mismatch, not a formulation to work around. Reason: no human answers a seat's command, and a worker reads only its brief, so the rule reaches it only here; there is no exception.

Reasons restated: disjoint paths keep the parallel wave safe; mode-word-only edits are a hard criterion; unattended-command rules exist because no human answers your commands.

## 6. Ordered steps

Substitution rules (plan D3/D5, verbatim):

1. Mode-meaning `manual`/`attended` → `No autopilot` (capitalized in prose).
2. Bare `autopilot` meaning the middle mode (operator answers signposts, agent answers forks; switch-on phrasing like "run autopilot on", "switched autopilot on") → `Semi-autopilot`.
3. Bare `autopilot` meaning the whole family → may stay where genuinely both modes; prefer naming the exact mode when it is one. In these human docs prefer exact names everywhere — the reader is learning the taxonomy.
4. `full autopilot` → `Full autopilot` in prose. `"autopilot signposts"` alias glosses → deleted entirely.
5. The three-mode definition sentences name the category: "Charting mode" with its three values.
6. `unattended` and unrelated adjectives (`a manual step`, `a manual akrogon next`) never change.

### docs/use/autopilot.md (full page rewrite of mode vocabulary, structure preserved)

Current H1 `# Autopilot` → `# Charting mode`. The page covers the whole category; Semi-autopilot is the main use.

Concrete guide (edit by meaning, keep the page's structure and every behavioral fact):

- Line 3 opener: "Autopilot lets a chart door work through a fixed list of charts without asking you each question. Use it for incoming work you are happy to let seat A decide… Autopilot charts and hands off. It starts no execution." → reword subject to Semi-autopilot/Full autopilot: these modes let a chart door work through a fixed list… Use them… They chart and hand off. They start no execution. One or two sentences of framing: this page covers the Charting modes and how to switch them on.
- Line 5: "It is one of the ways to run work shown in [Plan work](plan-work.md). The full mode rules are in [chart-issues](…)" — adjust only if grammar forces.
- `## Switch it on` line 9: "Autopilot needs the door to run inside hc" → "The autopilot modes need the door to run inside hc" or "Semi-autopilot and Full autopilot need…".
- Line 11 modes paragraph: "Three modes exist. In the default manual mode you answer the signposts and every fork. Under autopilot you answer the signposts once, for the whole session, and A answers every fork after. Under full autopilot — "autopilot signposts" — A answers the signposts and every fork." → "Charting mode has three values. Under No autopilot, the default, you answer the signposts and every fork. Under Semi-autopilot you answer the signposts once, for the whole session, and A answers every fork after. Under Full autopilot A answers the signposts and every fork." Keep the rest of the line (seed-decision sentence and the "matches no mode" sentence) verbatim.
- Line 13–16: "Name autopilot, the work you are handing it…" → "Name the mode, the work…"; the example `/chart-issues run autopilot on these two bug reports, consultants B` → `/chart-issues run semi-autopilot on these two bug reports, consultants B`. Line 18 "You can also switch it on later…" fine as-is (pronoun). Line 20 "The door's first reply repeats the mode…" fine.
- `## What the door does` line 25: "Under autopilot the signposts round is presented and answered once — a presented round, not a chart wait, so no chart parks on it; under full autopilot A answers it, echoes its picks…" → "Under Semi-autopilot the signposts round is presented and answered once …; under Full autopilot A answers it…". Line 27: "Where it would ask you a fork, seat A writes the full question…" — "it" refers to the door in autopilot modes; no mode word present; verify and leave unless a mode word appears.
- Line 31: "Every handed chart takes the lifecycle route. The direct route is not offered." — no mode words; keep verbatim (behavioral rule, do not reword).
- `## When it ends` line 49: "The mode ends on its own…" fine. Line 53: handover paragraph — no mode words; keep.
- `## Read the record` line 57: "an `## Autopilot` section" — `## Autopilot` is a record section KEY: never renamed. Keep. "the `signposts:` line naming who answered" key, keep.

### docs/use/plan-work.md

- Line 9 alt text: "an attended chart ends in the direct route when small and eligible or in a lifecycle handoff, an autopilot chart ends only in a lifecycle handoff" → "a No autopilot chart ends in the direct route when small and eligible or in a lifecycle handoff, a Semi-autopilot or Full autopilot chart ends only in a lifecycle handoff" (or cleaner wording with the same facts).
- Line 11: "- Attended chart: you answer each question. This page covers it." → "- No autopilot chart: you answer each question. This page covers it."
- Line 13: "- Autopilot: the door answers its own questions for a fixed list of work. It charts and hands off, and starts no execution. See [Autopilot](autopilot.md)." → "- Semi-autopilot and Full autopilot: the door answers its own questions for a fixed list of work. It charts and hands off, and starts no execution. See [Charting mode](autopilot.md)."
- Line 34: "An unresolved conflict between your statements is shown in one line and asked in manual and autopilot modes. Under full autopilot A resolves it." → "…asked under No autopilot and Semi-autopilot. Under Full autopilot A resolves it."
- Line 36: "Who answers them depends on the mode. In the default manual mode you answer the signposts and every fork. Under autopilot you answer the signposts once and A answers every fork after. Under full autopilot — "autopilot signposts" — A answers both. … A material signposts question you leave unanswered in manual mode is asked again before the first fork; under autopilot it is recorded as unanswered and not asked again, and under full autopilot A answers it." → same rewrite pattern as autopilot.md: No autopilot default; Semi-autopilot; Full autopilot; delete the alias gloss.
- Scan the whole file for any other hit (`grep -nEi "\bmanual\b|\battended\b|autopilot"`) and classify each.

### docs/reference/words.md

- Line 5 `[Autopilot]` entry → term becomes `[Charting mode]` linking the same target: e.g. "- **[Charting mode](../use/autopilot.md)**: who answers the questions while work is charted. Under No autopilot you answer the signposts and every fork. Under Semi-autopilot you answer the signposts once and seat A answers its own forks for a fixed list of work, then hands off. Under Full autopilot A answers the signposts too. It starts no execution." Keep alphabetical order of the entries — check whether the file is alphabetical; if yes move the entry to the correct position only if trivially adjacent, otherwise keep position and note it. (Check the file: entries appear alphabetical — Charting mode sorts right after Chart door/Chart. Moving entries is acceptable as part of the rename since the term itself changed.)
- Line 29 `[Signposts]` entry: "Answered per the mode: by you in manual and autopilot, by A under full autopilot." → "Answered per the Charting mode: by you under No autopilot and Semi-autopilot, by A under Full autopilot."
- Line 7 and 14: "[Who answers depends on the mode](../use/autopilot.md)" — no mode word; keep as-is.
- `[Direct route]` entry (line 11): consider adding the Build route category name if natural, e.g. mention Direct is one of the two Build routes. Minimal edit; if it reads forced, leave unchanged and note in report.

### docs/reference/skills.md

- Line 16: "One signposts round opens the session and sets its direction, then three modes — manual, autopilot and full autopilot — set who answers the signposts and the forks." → "…then three Charting modes — No autopilot, Semi-autopilot and Full autopilot — set who answers the signposts and the forks."
- Line 18: "Autopilot runs only when you switch it on in words." → "Semi-autopilot and Full autopilot run only when you switch them on in words."

### Final pass

7. Run `grep -nEi "\bmanual\b|\battended\b|autopilot" docs/use/autopilot.md docs/use/plan-work.md docs/reference/words.md docs/reference/skills.md` and classify every hit: taxonomy value uses (`Semi-autopilot`, `Full autopilot`, `No autopilot`) are fine; `## Autopilot` section keys fine; file names in links fine; anything else is a bug — fix or justify in your report.
8. Read your full diff end to end: only mode-word lines changed, all facts intact.
9. Commit exactly one commit, message e.g. `Rename charting taxonomy in core mode docs`. Return the commit id.

Advisory size: 4 files, under 25 turns.

## 7. Commands

```
akrogon run-check --name u2-scan -- sh -c 'grep -rEn "\bmanual\b|\battended\b|autopilot signposts" docs/use/autopilot.md docs/use/plan-work.md docs/reference/words.md docs/reference/skills.md; echo "scan-exit=$? (1 means clean)"'
akrogon run-check --name docs-links-u2 -- bun test tests/docs-links.test.ts
```

Expected: scan shows no hits (exit 1 = clean; mode-key/file-name hits of bare `autopilot` like `autopilot.md` link targets ARE expected and fine — the scan pattern above does not match them since it anchors `\battended\b`/`\bmanual\b` and the signposts phrase only; verify by eye). docs-links must exit 0. Run `bun install --frozen-lockfile --backend=copyfile` first if `node_modules` is missing in your worktree.

## 8. Done-when, evidence and report

Done when: criteria 1–5 hold, scans clean, docs-links green, exactly one commit.

Command output you keep goes through `akrogon run-check --name <label> -- <cmd>` citing the printed `check <label>: <exit> <path>` line; `akrogon log <path>` reads a cited log.

End your report with these four fill-in lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

Also paste the final H1 of docs/use/autopilot.md and the rewritten three-modes sentence(s) — they feed the leaf report's before/after table.
