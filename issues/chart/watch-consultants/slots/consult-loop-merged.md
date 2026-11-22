# consult-loop merged notes (A, B, C)

Q1 Trigger and grouping
- Trigger on S1 notify-only failures (A,B,C). Also base-red `merge -> check.fix` bounces before `failed` (B,C); A: S1 names only today's notify cases, a base red reaches `failed` through the existing path; C asks the threshold that would make a bounce count.
- Grouping: consultant decides per leaf from one consult holding all notify-class leaves (A); peers confirm a group from one anchor leaf against failing command, revision, cause (B); watch pre-groups by judgment, skipping leaves whose `blocked=` prerequisite failed (C). All: no string matching; re-observe after the fix and open a new case for any leaf still red (A,B,C).
- Evidence: observe.ts `formatLeaf`; merge-issue Shared endings (B,C).

Q2 Exchange
- Case folder outside git under `<globalHome>/watch/<repo>/consults/<case>/` (A,B,C). Brief: literal watcher address, case ID, leaves with observe lines and paths (state, brief, design, review-B, worktree, verify log), S3 stops, locks (A,B,C). Every ask and reply over `hc send` naming the file, case ID, turn (B,C); first ask too, not argv (B; C notes agyTask already sends). Return: per-leaf cause, actions with commits and pushed SHA, recommended watch move or S3 stop (A,B,C).
- Late or stale reply matched by sender, case ID and turn (B,C); late `done` after case close reported and ignored (A).
- Pitfall: literal `$HC_TERMINAL_ID` (C); never `.env` values in files (C).

Q3 Wait and liveness
- In-turn `hc wait --children any --timeout 180 --json` loop, no give-up (A,B,C); child state from wait JSON only, never `hc get` between waits (A,B,C); timer wake ignored, but a timer exit means stop: exit quietly (C, B Q3 ask).
- Consultant writes its turn file before `hc send` (C, A).
- Silent stop: one nudge (A,B,C). Second silent stop, error, exit: close and replace on the same case (A unlimited; B replace; C replace once, a failing replacement notifies — avoids burning launches when auth or network is down).
- Blocked: never answer its dialog or `--force` (B,C); close and notify (C); inspect cause, honor S3 (B).

Q4 Loop end and disagreement
- Re-consult gate: no new case for a leaf whose failure is unchanged since a closed case (A: failure reason+phase; C: signature of failure cause@phase, failing check, base SHA, leaf HEAD; new base SHA or leaf HEAD re-enables).
- Disagreement: smallest permitted check that distinguishes the peers' predictions (B); concrete defect answered in the same case (A); 2 challenge turns then notify (C). Ends: verified fix, S3 stop, operator stop (B); no permitted check left: park visibly with blocker and wake condition (B) vs notify (A,C).
- A fix stands on evidence: checks green on the pushed tree, no S3 stop crossed (A).

Q5 Queued ticks
- Coalesce unsent dues to one pending latest due behind any sent due; `tick.ts` unchanged since it accepts a higher due (B,C). Drain as today, no timer change (A).

Q6 Record
- Case folder is the record, path in the watch reply (A,B,C); record opened before work is authorized, reconciled on restart (B); machine-readable signature for the Q4 gate (C `index.jsonl`); non-attention `akrogon notice` on a push to main or a leaf move, attention only for stops (C). Never `issues/log.jsonl` (A,B,C: `src/log.ts` `readLog`).
- Retention of old case folders (C asks).
