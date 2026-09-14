# Brief 3: guide line edits

## 1. Goal

Delete guide lines describing deleted machinery (plan D8). No code changes.

## 2. Acceptance criteria

1. `grep -rn "stand-in\|other agent's pane\|other pane" docs/guide/` returns nothing.
2. `grep -rn "issues/config.yaml" docs/guide/ | grep "max_active"` returns nothing (no per-repo `max_active` mention survives); global `max_active` mentions stay.
3. The `phase: failed` row in `problems.html` names `akrogon phase <slug> <phase>` as the exit.

## 3. Read-first list

`plan.md` D8, `docs/guide/phases.html:74`, `problems.html:60-61`, `next.html:65`, `setup.html:65`, `cheat.html:89`, `in-practice.html:106`, `install.html:80`, `limits.html:59`, `ponytail.md`.

## 4. Change list

- `phases.html:74` — delete the whole `<div class="why">…stand-in…</div>` box.
- `problems.html:60` — attempts row: delete the stand-in sentence; keep "The prompt did not take, twice." meaning (e.g. "Look at the pane. After three tries the leaf fails.").
- `problems.html:61` — `phase: failed` row: replace `akrogon phase <slug> implement` with `akrogon phase <slug> <phase>` as the exit.
- `next.html:65` — remove the per-repo clause: "and either the repo has no `max_active` or fewer than its `max_active` leaves are running" → the sentence keeps only the global `max_active` condition.
- `setup.html:65` — delete the commented `# max_active: 2 …` line.
- `cheat.html:89` — repo config comment: drop `, max_active` (keep `checks, fix_rounds, broadcast`).
- `in-practice.html:106` — delete "Set the optional `max_active` in that repo's `issues/config.yaml` to cap its share." (keep the rest of the answer).
- `install.html:80` — why box: delete "An optional `max_active` in a repo's `issues/config.yaml` caps that repo's share; without it, the repo has no separate limit."
- `limits.html:59` — delete "An optional `max_active` in a repo's `issues/config.yaml` caps that repo's share."

## 5. Do-not

Do not touch `debate` lines (`state.html:62,80`, `create.html:81`, `files.html:101-102`), `phases.html:66`, `in-practice.html:86,120`, global `max_active` text (`install.html:68`, `in-practice.html:60,126`, `cheat.html:83,88`, `next.html` svg label), or any `src/`/`tests/` file. Match surrounding HTML style; keep sentences grammatical after deletion.

## 6. Ordered steps

1. phases.html, problems.html.
2. next.html, setup.html, cheat.html.
3. in-practice.html, install.html, limits.html.
4. Run the §2 greps; paste output.

Advisory size: 8 files, under 30 turns.

## 7. Commands

The §2 greps (no test command applies to docs).

## 8. Done-when

Greps clean, sentences read correctly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
