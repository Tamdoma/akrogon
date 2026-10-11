# Review A: watch-steady

Base `c53f6196533289555518577f08907ec9c713721c`, reviewed head `f0b4e7994e57672739b3fe4732e42271306c7c2e` (one commit, `skills/watch-issues/SKILL.md`, +6/-8). Worktree clean; read the full landed file, not only the diff.

## Criteria

- C1 pass. `grep -n -E 'stop rule|CronDelete|delete|stops|expir|self-delet'` on the file yields three lines: the never-self-deletes statement (`:14`, "ends only on `/watch-issues stop`, session loss or the job's own expiry"), the `/watch-issues` creation report keeping the 7-day-expiry fact (`:16`), the `/watch-issues stop` bullet (`:18`). No rule, check or notice deletes or declines the job: refusal clause, tick delete clause, `## Stop` section, the defect-notice self-stop clause and the "count as shown for the stop rule" sentence all gone. Remaining `delivery`/`shown` judgments intact. "Never self-deletes" wording used; no expiry warning; no requirement claim.
- C2 pass. `## Observe` opens with the gate: a check runs `akrogon status` at `<root>`; a repo it reports paused is observed and acted on never, explicitly covering the observe script, `next`, `phase` and herdr. This gates typed `next <slug>`, which ignores pause (`src/next.ts` `dispatchLeaf`, `isAutomatic === false`). Verified the status marks live: `akrogon status` prints `akrogon (paused)` in the list and `paused: <name>` for a slug (report's scratch-`AKROGON_HOME` probe; I re-read `src/status.ts:350,360,410` to confirm both forms).
- C3 pass. `grep -rln -i 'watch' skills/ docs/ README.md` → `skills/AREA.md`, `skills/watch-issues/SKILL.md`, `docs/guide/cheat.md`, `docs/guide/in-practice.md`, `docs/guide/install.md`, `README.md`; all read. In-scope: no line states self-deletion or requirement; every mention calls the watch optional. Out-of-scope hits per brief criterion 3: `docs/guide/in-practice.md:81` (conditional creation, stale), `:89` (self-stop claim). Listed in `implementation/report.md`; the design's leaf architecture ("Edits only in skills/watch-issues/SKILL.md") keeps them unedited — consistent, not a defect.

## Plan conformance

D1–D4 all landed as written. D3's extra `/watch-issues` clause ("A paused check still runs the CronList and creation step") is present and prevents an internal contradiction. `/watch-issues stop`, "Create a job from a tick", the `## Never` list and `## Reply` unchanged in effect.

## Docs and tests

Changed behavior is documented in the owned file itself. `skills/AREA.md:17` stays accurate; named path exists. No `src/test-files.ts`-matched file changed; no `Test-Change` trailer required. Standing design: skill-text leaf, proof is the report's sweep with quoted lines — supplied; no planned tests exist to skip. Report commands match plan.md's named proofs and results are pasted.

## Checks evidence

Report records green format/typecheck/test(792 pass)/test_changed on this head; markdown-only diff touches nothing they execute, no rerun needed.

## Findings

None.

## Verdict: ready
