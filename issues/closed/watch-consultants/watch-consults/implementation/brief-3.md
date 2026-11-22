# Brief U3: watch-issues consult skill text, consultant brief, guide

## 1. Goal

Implement plan decision D7 for leaf `watch-consults`: rewrite `skills/watch-issues/SKILL.md` so the Judge consults instead of only notifying, write `skills/watch-issues/consultant-brief.md` (the brief template the watch hands the consultant), and update `docs/use/watch-while-away.md`. Plan + all locked items: `/home/ivan/Work/infra/akrogon/issues/open/watch-consultants/watch-consults/plan.md` (read its Decisions; the locked consult-loop items 1–11 and fix-and-config items 1, 2, 2′, 3, 3′/3″, 5, 7′, 8′ it cites are in `design.md` beside it — read both).

## 2. Acceptance criteria

1. `SKILL.md` keeps its structure (Judge, Never, Invocations, Reply, plus a new `## Consult` section) and stays a Judge document: mechanical behavior lives in the scripts; the skill text names what the watcher decides and does, in the existing numbered-step Judge style.
2. The Judge's today notify-only branches (human prerequisite/defect class, `failed=unknown`, recovery cap) now route to the consult trigger: consult-loop item 1 — one consult per root cause, anchor leaf unblocked-first, no trigger on `merge → check.fix` bounces.
3. `## Consult` carries the locked loop verbatim in meaning: signature gate via `bun skills/watch-issues/scripts/consults.ts dir|new|match <root>` before opening a case (item 8 closed-signature suppression); case folder `<stateHome>/watch/<repo>/consults/<case-id>/` under the run's `AKROGON_HOME`/`~/.akrogon` outside the repo with `brief.md` (watcher address, case ID, anchor+attached leaves with observe lines and artifact paths, the stop list, locks — never `.env` values); `akrogon seat --watch-consultant --task <text>` start pointing at `brief.md`, every later message `hc send`; fixed turn files `turn-<n>-watch.md`/`turn-<n>-consultant.md` written before the send, sender from the wake JSON `from` field; in-turn `hc wait --children any --timeout 180 --json` loop with no give-up, child state only from the wait JSON; a wake carrying operator words wins and is handled first (an explicit stop included), any other wake recorded and ignored; liveness (one nudge naming the missing file, second silent stop/error/exit/blocked closes the consultant `hc kill`+`hc rm` with screen saved, reconcile before replacement, one replacement per case per tick, a failing replacement keeps the case open + one non-attention notice); stop mid-case (timer exit in the wait JSON or operator stop words: close consultant first, record remote tip and leaf states, no successor); loop end (verified fix / S3 stop / no permitted check left; disagreement settled by the smallest permitted check, else both views recorded, leaf stays `failed`, non-attention notice names the case); record (case folder kept, `case.md` for people + machine-readable signature and status, one non-attention `akrogon notice` per push to main or leaf move, attention only for S3 stops, never rows in `issues/log.jsonl`, case path in the watch reply).
4. The Judge's resume step: after re-observing seats idle/absent, `akrogon phase <slug> <target>` then `akrogon next <slug>`; target = `check.fix` when `failure.phase` is `merge`, `check.repair` or `check.review` (3′+3″: `check.review` is never a direct target), else `failure.phase`; `failed=unknown` reads the `from` of the last `P → failed` record in `issues/log.jsonl`, none → peers pick from the leaf's artifacts and record why, or close with signature `unknown` + one non-attention notice.
5. Fix authority the skill instructs: consultant fixes the base on a detached worktree under `<case>/worktree` from freshly fetched `<remote>/<default_branch>`, commits only the base repair, proves by the failing command + the repo's `checks` + `merge_checks` (via `akrogon verify --holder <case>` run with the case worktree as CWD — D2), pushes fast-forward only, never `--force`, never `repo.root`; non-fast-forward → fetch, accept the new base if it already fixes, else rebase, re-prove, push again. Leaf-local commit only while every seat of that leaf is idle or absent (2′: needs a clean worktree — uncommitted seat work is kept, never discarded, and the consultant does not commit there; it advises, the leaf resumes for its own seat).
6. `Never` gains `Kill and remove the watch's own verified consultant` and `Answer a seat` reads `Answer a leaf seat` (the peer exchange with the watch's own consultant is allowed) — fix-and-config item 5. The human-prerequisite Judge line becomes: consult; recover only after the case's verified fix or the consultant's evidence the named prerequisite is met.
7. `Invocations` records: wakes matching no case and late `<hc from>` turns for an already-read or closed case are recorded and ignored (item 5, second part).
8. `Reply` gains the case folder path line.
9. Absent `slots.consultant` (criterion 7): the skill says the watch keeps today's notify-only outcome for that failure and sends one non-attention notice naming `slots.consultant` in `~/.akrogon/config.yaml` — no attention notice for that failure (7′).
10. `skills/watch-issues/consultant-brief.md` (new): the template the watch fills for the consultant — case context (case ID, anchor+attached leaves, their state.yaml/brief/design/review-B paths, worktree and verify log paths), the consultant's limits (fix-and-config items 1, 2′, S3 stops: never `issues/`, `.env` values, `state.yaml`, `--force` pushes, `repo.root` commits; never answer a leaf seat), the file exchange protocol (turn files + `hc send` to the watcher address, write the file before sending), and its return fields (root cause, fix commits + where they landed, verification evidence — commands and results, resume recommendation, disagreements). Written as a template an `agy neon` session follows with no akrogon skill knowledge.
11. `docs/use/watch-while-away.md` `## What stays yours` rewritten: the watch now consults and recovers; what stays the operator's is the S3 stop list (credentials/grants, spend past a grant, a changed decision or lock, host tooling, a force push or history rewrite, a fix that changes what was decided — from design S3/the plan D7) plus stopping the watch itself. Read the file's current section first and rewrite only that section.
12. `skills/AREA.md` `## Key files` watch-issues line mentions `consults.ts` and `consultant-brief.md` (one line edit, file stays ≤40 lines).

## 3. Read-first list

- `skills/watch-issues/SKILL.md` (current text — keep its voice and structure), `docs/use/watch-while-away.md` (`## What stays yours` section), `skills/AREA.md` (watch-issues line).
- `/home/ivan/Work/infra/akrogon/issues/open/watch-consultants/watch-consults/design.md` `### Consult loop` items 1–11 and `### Fix authority` items 1, 2, 2′, 3, 3′/3″, 5, 7′, 8′ — the locked text this skill must carry.
- `skills/watch-issues/scripts/tick.ts`, `scripts/timer.ts` header comments for the vocabulary already used (`due`, `tick`, `conflict`, `stopped`).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

Owns: `skills/watch-issues/SKILL.md`, `skills/watch-issues/consultant-brief.md` (new), `docs/use/watch-while-away.md`, `skills/AREA.md`. No prerequisites; worktree created at leaf HEAD `7ca2387c75ed54dddb3df952c8fc1871ae483860`. The Judge reads `signature.json` via the `consults.ts` verbs — the interface is the script's printed lines (`open|closed|clear`, the `dir`/`new` paths), not file parsing; consult-loop item 11's machine-readable `status` file (`open`/`closed`/`resumed`) is part of the case folder contract the skill instructs the watcher to maintain.

## 5. Do-not

- No `git stash` — every worktree shares one stash. To set work aside: WIP commit, then `git reset --soft <creation commit>` and make the returned commit once.
- No cron wording anywhere in the skill or guide (criterion 10's check greps for it); the timer model stays boundary dues, never a schedule.
- Do not write script code into SKILL.md — it stays a Judge document; the scripts own mechanics.
- Do not weaken any locked item; standing dissents are not decisions.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A.

## 6. Ordered steps

1. Read SKILL.md and the design sections; draft the `## Consult` section and the Judge edits.
2. Write `consultant-brief.md`.
3. Rewrite `## What stays yours` in the guide; one line in `skills/AREA.md`.
4. Run the section-7 check; iterate.

Advisory size: 4 files, ~15 turns.

## 7. Commands

```
akrogon run-check --name u3-docs -- bun test ./tests/watch-timer.test.ts --test-name-pattern "docs describe"
```
(the last test in the file checks the docs — read it first and satisfy exactly what it greps.)

## 8. Done-when, evidence and report

The `docs describe` test passes and the written text carries every locked item. Commit on the leaf branch in the worker worktree; return the commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
