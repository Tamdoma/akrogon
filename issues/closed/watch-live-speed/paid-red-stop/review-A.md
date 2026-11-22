# Review A: paid-red-stop

- Base: `842db38b6f54b733d6a3d6cf97119c37f69e7cb4` · Reviewed head: `445621864f30424d7ac4a46ebc70a2b7852bf8e4`
- Diff: `skills/lifecycle-rules.md` +2/−0 — one paragraph appended inside `## Grant reuse and count lines`. Working tree clean; single commit `44562186`.
- Verify receipt: `akrogon verify` green on the reviewed head (report.md cites `verify leaf 44562186…: green`, test log `check-test-1795199683408-452233.log`). No rerun needed: the diff is doc-only and the receipt is current.

## Criteria read against the case

Applied the watch-timer case (8 cells launched back to back, one cell repeated 7 times on one error) to the added text:

- **Criterion 1 — holds.** The paragraph sits inside `## Grant reuse and count lines` (line 8, before `## Environment files and producer keys`); the file still has exactly four `##` sections so the "four rules" intro and `skills/AREA.md`'s description stay true. `git diff` shows 2 insertions and 0 removed lines: every count-line and repeat-bound sentence is untouched, and the paragraph's own last sentence states it changes none. Consistent with grant-run-count Taken 1c/2b (written rules only, warn and continue past a repeat count): the rule adds a seat-local stop, not a command refusal or counter.
- **Criterion 2 — holds.** The third sentence reads on the case: the 7th launch repeating the same error names no new observation, so it "ends further paid launches of that operation under the seat's operator-blocker stop" — the per-skill `failed` stop each intro names. The first repeat (new cell state or a genuinely new observation) stays permitted via the diagnostic clause, which matches the design's refinement.
- **Criterion 3 — holds.** The rule is unqualified over seats; merge's `akrogon verify --attempt <id>` rerun is a launch of the same operation under the same bound, so a merge-stage paid relaunch follows the same stop. The red-check section's one-retry judgment is the seat's permitted retry of that launch, and the known-red head/base runs are diagnostic reads of the cause, not relaunches of the operation's work — no contradiction found, and merge-issue's red-retry paragraph needed no change.

## Scope and doc checks

- Plan D1–D6 followed exactly; design exclusions respected (no command, counter, or refusal; no change to count-line or repeat-bound wording).
- Docs: the changed behavior is new rule text in `skills/lifecycle-rules.md`; the page describing it is the file itself plus `skills/AREA.md`'s one-line description, which remains accurate. No documented behavior changed; no AREA.md in the diff.
- Proof adequacy: matches plan.md — no criterion test exists by design (leaf-review-b F9); docs-links suite green covers links/anchors; the choice parts are read here as designed.
- No `Test-Change:` trailer required: no path matched by `src/test-files.ts` changed. No grants, count lines or paid activity to audit. No LESSONS.md lines touched.

## Findings

None.

## Verdict

ready
