# Brief 4: docs (U4)

## 1. Goal
Document `akrogon stop` and `akrogon start`. Plan decision D9 (plan: /home/ivan/Work/infra/akrogon/issues/open/host-test-load/leaf-stop/plan.md).

## 2. Acceptance criteria
Planned tests (committed, do not edit) in `tests/command-reference.test.ts`:
1. `the next guide describes stop and start` passes: docs/guide/next.md contains the literal strings `akrogon stop <slug>`, `akrogon stop --all`, `akrogon start <slug>`.
2. `README covers every dispatched command and its argument contract` and `escaped alternatives and reordered rows preserve argument semantics` pass once U1's verbs land. The contract strings are `stop: '<slug> | --all'` and `start: '<slug>'`. In your worktree the dispatcher has no stop/start yet, so `README covers...` will be red after your README edit; that is expected, A verifies after both land. Verify your rows parse by reading the test's `commandRows` regex.
3. `tests/docs-links.test.ts` still passes.

## 3. Read first
- README.md:129-149 (the `## Command` table inside a ```text block; `|` in arguments is escaped `\|`).
- docs/guide/next.md:104-117 pause section (style to copy).
- src/AREA.md, tests/AREA.md (each must stay at most 40 lines with exactly Commands, Key files, Non-obvious patterns, See also sections).
- tests/command-reference.test.ts.
- /home/ivan/.claude/skills/implement-issue/ponytail.md.

## 4. Changes
Owned paths: README.md, docs/guide/next.md, src/AREA.md, tests/AREA.md. Prerequisites: none. Shared test resource: none.
Behavior to document (decided in the plan):
- `akrogon stop <slug>` records the leaf as stopped in host-local `stopped.yaml` in the akrogon home, then stops the leaf's systemd slice: every process in its pane scopes ends (browsers and worker scripts included) and Herdr closes the leaf's panes. The worktree and saved harness sessions stay. If the slice stop fails, the leaf stays stopped, the error prints, the command exits non-zero, and running stop again retries.
- `akrogon stop --all` does this for every allocated leaf of the current repo, one result line per leaf; one failure does not stop the others; non-zero exit if any failed.
- While stopped: automatic passes skip the leaf quietly; a typed `akrogon next <slug>`, bare `akrogon next` or `akrogon next --all` reports the leaf with an error naming `akrogon start <slug>` and exits non-zero; the merge turn builds no stack and prompts no merge seat for it.
- `akrogon start <slug>` removes the stopped record and runs `akrogon next <slug>`; on a leaf that is not stopped it exits non-zero.
- `akrogon status` marks stopped leaves (NOTE column, and a `stopped:` line in `status <slug>`).
- Panes split by hand in a leaf tab are outside the slice and survive a stop. Pause is unchanged and does not kill anything.
Edits:
- README table: rows `| \`akrogon stop <slug> \| --all\` | ... |` and `| \`akrogon start <slug>\` | ... |`, placed after unpause.
- docs/guide/next.md: new `## Stopping a leaf` section right after the pause section, with ```sh blocks for the three commands, short plain sentences.
- src/AREA.md Key files: one line for `src/stop.ts` (stopped.yaml record, stop/start, read by dispatch, merge queue and status).
- tests/AREA.md Key files: one line for `tests/leaf-stop.test.ts` (stop, start, gates and status marks with a test-local fake systemctl).

## 5. Do-not
- Do not edit tests or src code. Reason: locked tests, other units own code. Exception: none.
- No marketing tone, no history ("previously..."): document current behavior.
- Do not change scope; return a mismatch with evidence. Exception: a revised brief.
Reasons restated: tests are locked; docs describe current state only.

## 6. Steps
1. `bun install --frozen-lockfile`.
2. Edit the four files.
3. Run section 7 and `bun test tests/command-reference.test.ts tests/docs-links.test.ts --timeout=30000`.
4. Commit with message `docs: describe leaf stop and start` ending with this trailer block (tests/AREA.md matches the test-file path rule):
   `Test-Change: tests/AREA.md adds the tests/leaf-stop.test.ts key-file line; no test expectation changed`
   No co-author line.
Advisory size: 4 files, under 16 turns.

## 7. Commands
`cd <worktree> && AKROGON_BASE=e5776ade920e619e923a7825140f823c2e89123e bun test --changed=e5776ade920e619e923a7825140f823c2e89123e --timeout=30000`

## 8. Report
Return the commit ID and:
Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
