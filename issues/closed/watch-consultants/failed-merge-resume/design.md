# Design: failed-merge-resume

## Binding decisions, verbatim

### Seed decision, Tamdoma/akrogon#146 (forks/seed-decision.md `## Taken`, copied whole)

## Operator decision (Ivan Juras, 2026-11-20)

- `/watch-issues` can start consultant agents when a leaf breaks or fails and the fix is not obvious, and acts on their answer instead of asking the operator.
- The watch asks the operator only for what truly needs the operator.
- Consultants are hc terminals. Questions and answers go both ways over `hc send` (Herdr Core), the way chart-issues talks to its consultants.
- The consultant's harness, model and effort (and the other launch settings) are set in the akrogon state folder (`~/.akrogon/config.yaml`), following the existing `slots:` + `harnesses:` convention, so the operator can change them without editing the skill.

seed decision from Tamdoma/akrogon#146, taken at import on 2026-11-21, not asked, decided by ivanjuras

### Signposts (forks/signposts.md `## Taken`)

Operator, 2026-11-21T17:29:41Z, door t126, verbatim: "1a | 2b | 3a - plus if the patch or fix completely changes what was decided before. | 4 - waits without the time limit. Everything goes through <hc> send mechanism. | 5 - at most one at a time, both the watcher and the helper are equal. No limit on how many total. The goal is to finish as many problems as possible without my babysitting | 6a | n1 yes, n2 yes - by default, set it to agy neon high effort"

Read as (A's reading, the operator may correct it):
- S1 1a: a consult starts for every case the watch now only notifies on (failed on a human prerequisite or unknown record, recovery cap hit, base red blocking several leaves), one consult per root cause.
- S2 2b: the consultant may fix (edit and commit in a worktree, push a fix to main when the base is red); the watch may move leaves out of failed.
- S3 3a plus: the operator stops are credentials or logins, money past a recorded grant, changing an operator decision or lock, host tooling installs or downgrades, force pushes or history rewrites, and a patch or fix that completely changes what was decided before (a leaf's decided brief or design, a chart decision).
- S4: the watch waits for the consultant with no give-up time; every question and answer between watch and consultant travels over `hc send`. A wait may still check in on the consultant's state; it never abandons the consult on time alone.
- S5: at most one consultant alive per watch; no total cap; watch and consultant are peers, neither outranks the other in judging the fix. Goal: finish as many problems as possible without the operator.
- S6 6a: a real paid run in a throwaway repo proves the round trip and the watch acting on the answer.

Account: the session prioritizes autonomy: the watch consults on every hard failure, one consultant at a time with no total cap, and the consultant may fix code and push a base fix to main; it gives up the operator's sight of each fix, keeping only credentials, spend, decision changes, host tooling and history rewrites as stops. Chart order: one chart, nothing dropped.

## Needs

- N1 (supplied 2026-11-21T17:29:41Z, operator: "n1 yes"): grant for paid model launches: real watch and consultant sessions in a throwaway hc session and repo, at charting (prove a consultant round trip from a watching conversation) and for the leaf's live done-criterion; bound proposed: at most 6 sessions at charting and 6 for the leaf, each ending within 15 minutes, existing logged-in accounts, no writes outside the throwaway repo.
- N2 (supplied 2026-11-21T17:29:41Z, operator: "n2 yes - by default, set it to agy neon high effort"): after the leaf lands, the door adds the consultant recipe entry to the real `~/.akrogon/config.yaml` (a live change to the machine config), recipe proposed: codex gpt-6.2-astra high; operator set it to agy neon high.

### Consult loop, A's pick under autopilot (forks/consult-loop.md `## Taken`)

A's pick under autopilot, 2026-11-21T17:41:05Z. Decided by signposts S1, S3, S4 and S5 and the seed decision; where they are silent, by removing over adding.

1. Trigger: a consult starts only for a leaf in `phase=failed` that the Judge today only notifies on (human prerequisite or defect class, `failed=unknown`, recovery cap). No trigger on `merge -> check.fix` bounces (S1; log evidence above). Rejected: check.fix bounce trigger (needs a threshold with no source). Standing dissent B, C: a base red may churn check.fix passes before `failed`.
2. Grouping: one case per root cause. The watch picks an anchor leaf (an unblocked leaf first, never one whose `blocked=` prerequisite is failed); the case attaches other failed leaves when the peers explain how the same defect caused each; grouping and reason are recorded in the case (model choice, no text match). After a fix the watch re-observes; a leaf still red stays in the same case unless the peers find a different cause, which opens a new case. Rejected: watch-side string matching; one case holding every failed leaf.
3. Case folder outside the watched repo: `<globalHome>/watch/<repo>/consults/<case-id>/`. `brief.md` holds the literal watcher address, case ID, anchor and attached leaves with observe lines and paths (state.yaml, brief, design, review-B.md, worktree, verify log), the S3 stop list and the locks; never `.env` values. Open for the plan: whether `globalHome` can resolve inside a git checkout (toolRoot fallback); the folder must sit outside the watched repo.
4. Exchange: the consultant is started through the existing start path with its first task pointing at `brief.md` (keeps the 60 s start proof and agy's trust-prompt handling in `agyTask`); every later message either way is `hc send`. A's reading of two locks: the seed decision says "the way chart-issues talks to its consultants", and chart-issues starts a consultant with its first ask as the start task; S4's "everything goes through hc send" covers the exchange after start. Standing dissent B (final check 1 F1): S4 wants the first ask over `hc send` too. Files are fixed in advance: the consultant writes `turn-<n>-consultant.md`, the watch writes `turn-<n>-watch.md`, n from 1, each written before its `hc send`; the sender comes from the wake JSON `from` field.
5. Wait: in-turn `hc wait --children any --timeout 180 --json` loop with no give-up time; child state read only from the wait JSON, never `hc get` on the consultant between waits. A wake from the consultant reads the next expected turn file. A wake carrying operator words (no consultant sender) is the operator's: it is handled first and wins, an explicit stop included. Any other wake is recorded and ignored. A standalone `<hc from=...>` turn arriving after the turn ended, for a turn already read or a closed case, is recorded and ignored with no check and no new case (`## Invocations`).
6. Liveness: a silent stop gets one nudge naming the missing file. A second silent stop, an error, an exit or `blocked` (its dialog is never answered, no `--force`) closes that consultant (`hc kill` + `hc rm`, screen saved to the case). Before a replacement, the watch reconciles the worktree, the remote tip and the leaf states and records what was already done; the replacement's brief carries it. One replacement per case per tick; a failing replacement leaves the case open, the next tick starts a fresh consultant on it, and one non-attention `akrogon notice` per case says so. `--attention` only when the evidence shows an S3 need.
7. Stop mid-case: the timer's exit in the wait JSON or the operator's stop words end the case work: the consultant is closed first, then the remote tip and leaf states are read and recorded; no successor starts. A replacement starts only while the timer child is live in the wait JSON; `stop.ts` ends the timer before the consultant (sweep owned by config-and-naming).
8. Loop end: a case ends on a verified fix, an S3 stop, or no permitted check left. A disagreement is settled by the smallest permitted check that tells the two predictions apart; with none left, both views are recorded, the leaf stays `failed`, and a non-attention notice names the case. A closed case stores its signature (anchor `failure.cause@phase` or `unknown`, failing command, base SHA, each leaf HEAD); no new case opens while the signature is unchanged (mechanical); after a change the watch judges whether it bears on the recorded blocker and records the reason. A leaf that leaves `failed` by the operator's action closes its case as resumed.
9. A fix stands when the failing command itself, the repo's `checks` and its `merge_checks` pass on the fix tree, the push is fast-forward, and no S3 stop is crossed.
10. Queued ticks: `timer.ts` `poll` keeps any sent due and at most one unsent due, updated to the latest number, while the watcher works; `tick.ts` unchanged since it accepts a higher due. Rejected (A's first note): drain every due (a long consult would release a burst of redundant paid check turns, B, C).
11. Record: the case folder is the record (`case.md` for people, signature and status machine-readable beside it), opened before any work is authorized and reconciled on restart; its path is in the watch reply; a non-attention `akrogon notice` on each push to main or leaf move, attention only for S3 stops; never rows in `issues/log.jsonl`; case folders are kept.

Pitfalls avoided, binding: name of the record outside `issues/` (item 3); late message text (items 4, 5); `hc get` swallowing news (item 5); outage burning launches (item 6: one replacement per tick); a repeated push after a replacement (item 6 reconcile); an infinite consult loop (item 8 signature gate); a fix proven only by `checks` (item 9); tick bursts (item 10).

### Fix authority, resume and recipe, A's pick under autopilot (forks/fix-and-config.md `## Taken`)

A's pick under autopilot, 2026-11-21T17:47:12Z. Decided by S2 2b and S3 (fix authority), S5 (one alive), consult-loop items 1, 6, 9 and 11, the seed lock's "following the existing `slots:` + `harnesses:` convention" (key placement, A's reading: inside `slots:`; other reading: top-level `consultant:`), and removing over adding (no prescribed batch code change, no pre-filter).

1. Base fix: the consultant makes a detached worktree under the case folder (`<case>/worktree`) from freshly fetched `<remote>/<default_branch>`, commits only the base repair, proves it by consult-loop item 9, and pushes `HEAD:refs/heads/<default_branch>` fast-forward, never `--force`, never repo.root. On a non-fast-forward refusal: fetch, check whether the new base already fixes the failure, else rebase, re-prove, push again; each attempt re-proven, no fixed retry count. The worktree path is in the case; the worktree is removed after the push is read back, and reconcile removes an orphan. Open for the plan: how `merge_checks` run outside an attempt (run-check refuses them), and how `repo.config.env` and `setup` reach the worktree without anyone opening `.env`. (C location; A,B,C rest)
2. Leaf-local fix: the consultant may commit in a failed leaf's worktree only while every seat of that leaf is idle or absent, inside the leaf's decided brief and design (S3), leaving it clean, touching no issues/, with the repo's `Test-Change:` and frozen trailers; uncommitted seat work found there is kept, never discarded, and committed only when both peers agree it belongs to the fix (A,C; S2 2b). Standing dissent B: advise and let the leaf's own seat edit.
3. Resume (watch only, no `--slot`, after re-observing seats idle or absent): `akrogon phase <slug> <target>` then `akrogon next <slug>`. Target: `failure.phase` after a base fix or when work remains; `check.review` when the consultant's commit completes the leaf's work, which needs a green `leaf` receipt for HEAD (`transition` `requireGreenReceipt`; Open for the plan: the receipt command the consultant runs); the consultant states which in its return (model choice recorded). `failed=unknown`: the `from` of the last `P -> failed` record in issues/log.jsonl; none keeps the case open.
4. Stale batch (C rebuttal Q3, B rebuttal Q3): no code change is prescribed. Leaf done-criterion with one right answer written now: a leaf failed at merge with `batch` `applied: true` and no candidate, moved `failed -> merge` by `akrogon phase` and then `akrogon next`, after the base moved, is rebased onto the new base and never dispatched on the stale attempt or top. Red-first; C's `commitMove` clear is the candidate fix.
5. Never: add "kill and remove the watch's own verified consultant (consult-loop items 6, 7)"; "Answer a seat" reads "Answer a leaf seat" and the peer exchange with the watch's own consultant is allowed; "Edit `state.yaml`, worktrees or `issues/`" stays for the watch, and the consultant's brief states its limits (items 1, 2, S3, never issues/, `.env` or state.yaml). Judge "Failed on a human prerequisite ... Never recover" becomes: consult; recover only after the case's verified fix or the consultant's evidence that the named prerequisite is met. No S3 pre-filter: every trigger-class failure gets a consult (consult-loop item 1); standing dissent C.
6. Config: optional `slots.consultant: {harness, model, effort}` in the machine `~/.akrogon/config.yaml` only (`globalSchema.slots`), checked against `harnesses:`, shown by `akrogon config`; repo `issues/config.yaml` slots and index `slots:` stay a/b only. A's reading of the seed lock "following the existing `slots:` + `harnesses:` convention": inside `slots:` (C); other reading, a top-level `consultant:` key with the slot shape (A,B first notes).
7. Verb: `akrogon seat --watch-consultant --task <text>` reads `slots.consultant`, takes no `--slot/--harness/--model/--effort`, starts through `startConsultant`'s existing start proof and `agyTask` path, names the terminal `<prefix>-watch-consult`, labels `akrogon: 1`, `akrogon.repo`, `akrogon.watch-consult=<repo>` (never `akrogon.leaf`), parent the calling watcher with `outlive: false`. hc's live-name uniqueness keeps one alive per repo. Absent recipe: exit non-zero naming `slots.consultant` in `~/.akrogon/config.yaml`; the watch keeps today's notify behavior for that failure and sends one non-attention notice per watch (B,C).
8. Cleanup: case end and replacement close the verified consultant (name, label, parent) with `hc kill` + `hc rm`, tolerating not_found. `stop.ts` kills and removes the verified timer first, then the verified consultant; its first line stays `stopped <timer>` and a second line `stopped consultant <address>` appears only when one was closed. Watcher exit ends the consultant through `outlive: false`; a watcher replaced inside a surviving terminal is observed in the live proof.


Corrections after the final check (B F1-F4, C items 2-3), adopted as A's pick:
2'. A direct leaf commit needs a clean worktree on entry; when the worktree holds uncommitted seat work, the consultant does not commit there: it advises, the seat's work stays intact, and the leaf resumes into its work phase for its own seat (B F2, C).
3'. After a consultant leaf commit, the target is `check.fix` when `failure.phase` is `merge` or `check.repair` (A's repair turn verifies the tree and re-enters review through its normal moves; a fresh `verify` is refused while the leaf is failed, `src/verify.ts`/`src/run-check.ts` `failedRefusal`), otherwise `failure.phase`; `check.review` is never a direct target (B F1). `failed=unknown` with no `P -> failed` record: the peers choose the target from the leaf's artifacts and record why; when they cannot, the case closes with signature `unknown` and one non-attention notice (C).
7'. A missing recipe's sole watch notice is the non-attention one; no attention notice for that failure (B F4).
8'. When the timer detects that its watcher process left a surviving terminal, its exit path also kills and removes that watch's verified consultant (B F3).
These four narrow or define items already checked; 8' adds one cleanup step, re-checked in the leaf-writing review.

Correction after the leaf review (B F2, F3), A's pick, 2026-11-21: 3''. After a consultant leaf commit the target is `check.fix` also when `failure.phase` is `check.review` (`src/routing.ts` allows `check.review -> failed`; `check.review` is never a direct target). Item 7 and 7' unchanged; a case that ends on an operator stop sends one attention notice naming it (consult-loop item 6), technical exhaustion or disagreement a non-attention one.

### Exclusions

Excluded here, owned by leaf consultant-seat: fix-and-config items 6 and 7 apart from the watch's notice. Excluded here, owned by leaf watch-consults: every consult-loop item and fix-and-config items 1, 2, 3, 5, 7' and 8. This leaf owns fix-and-config item 4 only.

/home/ivan/.akrogon/releases/1502fbdf362e2b6dc3c721722532d6fce8a9b622/skills/chart-issues/assets/standing-design.md

Applies: a bug fix shows its test failing before and passing after; when the test passes on the base, the finding is recorded and no product code changes.

## Held disagreements

Not a decision, the decision stands. Against fix-and-config item 2 (consultant commits in a leaf worktree): slot B holds the consultant should advise and the leaf's own seat edit; evidence slots/fix-and-config-b.md and -rebuttal-b.md; state: unanswered (A's pick under autopilot).
Not a decision, the decision stands. Against fix-and-config item 5 (no S3 pre-filter): slot C holds a failure whose reason names only an S3 need should notify without a paid consult; evidence slots/fix-and-config-rebuttal-c.md Q4; state: unanswered.
Not a decision, the decision stands. Against fix-and-config item 6 (key inside `slots:`): slots A and B first proposed a top-level `consultant:` key; state: A's reading under autopilot, unanswered by the operator.
Not a decision, the decision stands. Against consult-loop item 1 (failed-only trigger): slots B and C hold `merge -> check.fix` base-red bounces should trigger too; state: unanswered.

## Leaf architecture

Owned: `src/phase.ts` `commitMove` (the batch kept on leaving `failed`), `src/next.ts` `reconcileBatch` and `mergeTurn` (how a `merge` leaf with an applied batch and no candidate is restacked), and their own tests.

Candidate fix (fix-and-config item 4, slot C): clear `batch` in `commitMove` when leaving `failed` and the batch holds no candidate. Open for the plan: whether the clear belongs in `commitMove` or `reconcileBatch`, after reading every other reader of `batch` (for example `batchPush` in `src/phase.ts` and the batch owner logic in `src/next.ts`), each checked against a cleared batch.

Excluded: any watch skill change (watch-consults); the `failed -> merge` move guards in `moveGuards` (unchanged).
