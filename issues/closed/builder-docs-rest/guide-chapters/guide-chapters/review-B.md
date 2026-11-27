# Review B: guide-chapters

- Base: `d44a586681f87b163a6613222de8be0b9a6679f6` (merge-base with `origin/main`)
- Reviewed head: `5c4841e8b966776579a4739ade8427ae04b6548f`
- Phase: `check.review`, initial blind review (fix_rounds 0)
- Verdict: **fix**

## Verification evidence

- Leaf verify receipt: `verify leaf 5c4841e8...: green` (report C11; `check-test-1795789615143-1458825.log`, `check-format-...`, `check-typecheck-...`). HEAD unchanged since, so no rerun.
- Planned proofs ran through the commands `plan.md` names, all on HEAD `5c4841e8` after the last test change (`c8e77c43`, planning): `docs-links` 18 pass, `docs-em-dash` 4 pass, `rollback-doc` 9 pass, `watch-timer-docs` 5 pass, `run-permit-sweep` 1 pass, `hold-retired-sweep` 1 pass, `command-reference` 4 pass, `where-things-go-diff` (only `## Folders` lines changed), `consultant-audit`. No test is skipped, filtered or disabled. No runner config changed.
- C7 deliberate break: `check docs-em-dash-break: 1 .../check-docs-em-dash-break-1795789307071-1454514.log` (`README.md:40: Quick fix deliberate break`), then green. Accepted.
- Em dash: `grep -c '—'` over README.md, docs/guide, docs/reference finds 0. Consultant examples: every added consultant mention is prose or `slots.consultant` config. No partial launch example (C8 holds).
- AREA.md: none in the diff.
- `git grep` for retired paths outside `issues/`: only `learnings/history/2026-09-11-stale-rule-in-docs.md:17` (history text, not a link). Acceptable.

## Test-Change trailers (`d44a5866..HEAD`)

All four sit on `c8e77c43` (plan.synthesis):
- `tests/docs-em-dash.test.ts`, criterion 7, added cases only. Matches the diff. Accepted.
- `tests/docs-links.test.ts`, criteria 1, 3, 4, 5, added cases only. Matches the diff. Accepted.
- `tests/rollback.test.ts`, criterion 6, path change only. The diff changes one path. Assertions are unchanged. Accepted.
- `tests/watch-timer.test.ts`, criterion 6, path change at three sites. The diff changes exactly three sites. Assertions are unchanged. Accepted.

## Criterion 9: cold reader

A fresh subagent was given only README.md and docs/guide/01 to 12. All 8 answers match the design's answers.

| Q | Answer given | Line quoted | Match |
| --- | --- | --- | --- |
| 1 | No, once per machine | 01:3 "You install Akrogon once per machine, not once per project." | yes |
| 2 | clone, mkdir + write config, `bun install --frozen-lockfile --backend=copyfile`, `bun src/akrogon.ts install`, PATH, `akrogon config`, `claude` + `/init-akrogon`, add prefix, `akrogon config`, `akrogon status` | 01:33-117, 02:36-97 | yes |
| 3 | t-: status/next, c-: charting agent, w-: watcher | 03:70 "`t-` runs `akrogon status` and `akrogon next`, `c-` runs the charting agent, and `w-` runs the watcher." | yes |
| 4 | Reviews blind with A, repairs most Fixes, hands exceptions to A | 09:122, 09:134 "repairs most Fixes itself", 09:136 | yes |
| 5 | After B passes, one merge turn per repo runs checks on the candidate. Red goes to `check.repair` | 10:11 "one merge turn", 10:60 "moves the leaf out of `merge` into `check.repair`" | yes |
| 6 | Watcher in w- every 20 min. Keys, grants and decisions wait (stop list) | 03:80, 11:20, 11:56-62 | yes (reader confidence medium, see N1) |
| 7 | `Failed:` in `akrogon status`, full block in `akrogon status <slug>`, then slot-less `akrogon phase` + `akrogon next` | 12:32, 12:44, 12:55 | yes |
| 8 | Semi-autopilot (signposts once), Full autopilot (needs-sheet rows only) | 06:16-17, 05:62 | yes |

## Criterion 4: move map rows

All 23 rows were checked against the old pages (`git show d44a5866:<path>`). All named anchors exist. 14 rows carry every fact. Rows 2, 9, 11, 12, 15, 17, 18 and 23 drop minor details only (listed under N2). No row points at a page that lacks the retired page's core procedure.

## Criterion 10: facts

About 40 claims on 01 to 03 and 09 to 12 were checked against `src/`, `skills/`, `systemd/`, `herdr-app commands` and `/home/ivan/.akrogon/config.yaml`. Harness lines in 01 match the live config verbatim. Mismatches are in F1 and F2. Everything else holds, for example `src/install.ts:158`, `src/init.ts:64-94`, `src/hc.ts:261-281`, `src/listen.ts:36,89,95`, `src/turn.ts:107-122`, `src/phase.ts:253-262,563-568`, `src/park.ts:94`, `src/pause.ts:65`, `src/stop.ts:82`, `src/status.ts:776`.

Tone reading: 01 to 03, 11, 12, README.md and docs/README.md match 04 to 08. They use plain steps, gloss terms on first use and have no marketing jargon. README's "lightweight software factory" plus one sentence of fit stays within the two-sentence soft-selling limit. 09 and 10 do not match: see F3.

## Fixes

### F1. Page 12's failure walkthrough cannot happen and teaches the wrong recovery for a missing key

- Where: `docs/guide/12-when-work-stops.md:102-149` (also 12:126-130 and the restart steps).
- Realistic source: the running example's own needs-sheet row. `docs/guide/05-signposts.md:101` makes `POSTMARK_API_KEY in client-portal/.env` a needs row, so it lands in `scheduled-email/readiness.yaml`. 09:40 says so too. In the code, `blockDetail` (`src/turn.ts:51-55`) runs on every dispatch, for every phase except merged and failed (`src/next.ts:1077-1100`). A missing input returns `waiting`, or a typed `next` throws `Leaf inputs are missing`. The leaf never gets a prompt, never reaches `implement` and is never moved to `failed` by that gap.
- Consequence today: a reader who hits the missing-key case follows 12's four steps and runs `akrogon phase scheduled-email implement` on a leaf that is not failed. Adding the key and running `akrogon next scheduled-email` would have been enough. Page 12 also contradicts page 09:40 inside the same running example.
- Criterion: 2 (09 to 12 carry the example coherently) and 10 (a rule on a new page must match `src/next.ts`).
- Fix: give the `failed` walkthrough a cause that really reaches `failed`. For example, a seat's operator-blocker stop on the undeclared staging send grant for `staging-reports@agency.example`, or 3 silent turns. Keep the recovery steps. Add one line that a missing declared key leaves the leaf waiting with a `Missing:` line, and that the recovery is to add the key and rerun `akrogon next` (link 09).

### F2. Three rules on new pages overstate the code

- `docs/guide/02-set-up-a-repo.md:82` says the error names `~/.akrogon/config.yaml` when the prefix "is missing or collides". `src/config.ts:282` names no file on collision (`prefixes: repos X and Y both hold prefix cp`). Only the missing case names it (`:277`).
- `docs/guide/12-when-work-stops.md:149` and `09-lifecycle.md:44` say a typed `akrogon next` on a failed leaf refuses with `Leaf is failed and needs phase recovery`. `src/next.ts:1070-1075` throws only when the leaf has no tab and no worktree, its tab terminal is live, or the cause is `attempts`. Otherwise it returns silently with exit 0. A reader who skips step 3 after a seat loss sees nothing happen and no message.
- `docs/guide/01-install.md:68` says "every `akrogon` command refuses a file missing one". `akrogon guard`, `--help` and `tool-kill-helper` never read the config (`src/akrogon.ts:36-39,67-73,383-384`). Change it to "every command that reads it".
- Realistic source: a reader with a duplicated prefix (02 tells them to add prefixes by hand), and a reader recovering a failed leaf whose seat terminal died (12's own example).
- Consequence today: the stated message does not appear, and the reader looks for text that is not there.
- Criterion: 10 (every always/never/only rule matches `src/`).

### F3. Pages 09 and 10 use unexplained internal terms, against the tone the brief requires

- Realistic source: the target reader the design names (a tech-adjacent operator who "hates hype" and is "too busy to write production code"), reading the page content this leaf wrote. Unexplained on first use:
  - 09:59 "Sparse checkout"
  - 09:62 "`TMPDIR`", "`AKROGON_BASE` set to the branch merge-base"
  - 10:187 "`batch` record"
  - 10:206 "marks `batch.applied: true`"
  - 10:220 "(non-`full` in config order, then `full`)"
  - 10:221 "Passing stamps `batch.tested_top` and `batch.tested_main`"
- Consequence today: these lines show internal state fields with no meaning given. 04 to 08 gloss every such term, and the operator's correction asks for "not overcomplicating with technical jargon".
- Criterion: 10's tone clause, which is slot B's reading. This is that reading, with the reason above.
- Fix: gloss each term in one short clause, or cut lines that only name internal fields (10:206 and 10:221 add nothing a reader acts on). Leave the shelf pages alone.

## Nits

- **N1.** `11-while-you-are-away.md:3`, "Leaves keep moving through `akrogon-listener.service` ... without any extra setup", is true only for leaves already started and for dependents woken by a merge (`src/next.ts:1194-1209`). A handed-off leaf that never started waits for `akrogon next` or the watcher (08:63). The cold reader flagged this but still answered Q6 correctly. Deferred because no answer was wrong. A cold-reader run that answers Q6 as "nothing needed" would make this a Fix.
- **N2.** Move-map rows drop minor details. Row 2: "two passes do not promise every mistake is caught". Row 9: "do not hand the same work to two doors". Row 11: "only dependents of a merged leaf start, every other leaf waits for your `akrogon next`". Row 15: the gacp note. Row 17: seed-issue is read-only, dedupes and never proposes a fix. Row 18: the history file path. Row 23: retiring a failed leaf through a new chart. Deferred because the design says minor tools are "just mention them" and the skills still hold the facts. A reader task that needs one of these and finds no path to it would make this a Fix.
- **N3.** `09-lifecycle.md:80` "Slot A and Slot B (Slot B only when `fix_rounds > 0`)" reads as if B runs only after repair. 09:122 and 09:144 state it correctly. Wording only.
- **N4.** `12-when-work-stops.md:139` gives no rule for picking the recovery phase. The watcher uses `failure.phase` (11:33). Deferred because the listed phases are correct.
- **N5.** "slot B" means both the charting consultant (02:27 `cp-slot-b`, 04:16) and the Lifecycle reviewer. This comes from 04 to 08, which this leaf does not own.
- **N6.** The bare `herdr-app do ...` commands in 03 use the default herdr-app home. Akrogon sets `HERDR_APP_HOME` per session for sessions other than default (`src/hc.ts:734-741`). This only matters to readers with named hc sessions. No reader report exists.

## Operator actions

None.

## check.repair, 2026-11-27

- Fixes read: review-A.md (none) and review-B.md F1, F2, F3 for head `5c4841e8`. All three are docs Fixes. None changes a locked decision, a live action or a model choice, so B repaired them all. No product code or test changed. Nothing is handed to A. No operator action is open.
- Prior head `5c4841e8`, repaired head `f6fb1864`.

### F1 repaired: `b29ce3d9`

- Before (12:11): "`scheduled-email` reaches `implement` and cannot verify email delivery because `POSTMARK_API_KEY` is still missing from `client-portal/.env`". Step 1 showed a `Missing:` line, and step 2 said to add the key, then recover with `akrogon phase scheduled-email implement`.
- After: the failed cause is Postmark rejecting the approved test send to `staging-reports@agency.example` because the From address is not a confirmed sender. That is an operator-only blocker, and a seat stops on it with `failed`. Steps 1 and 2 follow that cause. A new paragraph after 12:19 says a missing declared key never fails a leaf. It waits with a `Missing:` line, a typed `next` refuses with `Leaf inputs are missing`, and the fix is to add the key and rerun `akrogon next` (links 09#why-a-ready-task-may-wait). This matches `src/next.ts:1093-1100` and 09:40.
- 11:56 stop-list example changed from "absent from `client-portal/.env`" to "a `POSTMARK_API_KEY` that Postmark rejects as revoked", because an absent key never reaches the watcher's failed-leaf path.

### F2 repaired: `5b479ae9`

- 02:82 before: "stops with an error naming `~/.akrogon/config.yaml` if the prefix is missing or collides". After: the missing error names the config file (`src/config.ts:277`), and the collision error names both repositories and the shared prefix (`:282`).
- 12:57 before: "refuses with `Leaf is failed and needs phase recovery`". After: `next` never restarts a failed leaf. It either refuses with that text or, when the seat terminals are gone, does nothing and exits without an error (`src/next.ts:1070-1075`).
- 09:44 before: "on a failed leaf it exits 1 with ...". After: "starts nothing, and usually exits 1 with ...".
- 01:68 before: "every `akrogon` command refuses a file missing one". After: "every `akrogon` command that reads this file refuses it when one is missing" (`src/akrogon.ts:36-39,67-73`).

### F3 repaired: `f6fb1864`

- 09:59 "Sparse checkout excludes `issues/`" is now glossed: "The worktree leaves out the `issues/` folder (a sparse checkout, meaning Git fills in only part of the files)".
- 09:62 dropped `TMPDIR`. `AKROGON_BASE` is now "the commit on the default branch where `csv-export` branched off, which the seats compare their changes against".
- 10:15 now glosses `batch` as Akrogon's record of one landing attempt in `state.yaml`.
- 10:34 dropped "marks `batch.applied: true`" and glossed `top` as the rebased commit.
- 10:48 changed "(non-`full` in config order, then `full`)" to "(in config order, with the slow checks listed under `full` last)".
- 10:49 dropped "Passing stamps `batch.tested_top` and `batch.tested_main`".
- 10:72 changed "existing green row on the merge-base tree" to "earlier green result for that same base commit".

### Evidence on `f6fb1864`

- `check repair-docs-links: 0` (18 pass) `.../implementation/check-repair-docs-links-1795790325130-1872661.log`
- `check repair-docs-em-dash: 0` (4 pass) `.../check-repair-docs-em-dash-1795790325249-1872812.log`
- `check repair-docs-pictures: 0` (3 pass) `.../check-repair-docs-pictures-1795790325377-1872914.log`
- `check repair-rollback-doc: 0` (9 pass) `.../check-repair-rollback-doc-1795790327925-1872987.log`
- `check repair-watch-timer-docs: 0` (5 pass) `.../check-repair-watch-timer-docs-1795790332514-1875631.log`
- `check repair-run-permit-sweep: 0` (1 pass) `.../check-repair-run-permit-sweep-1795790332680-1875729.log`
- `check repair-hold-retired-sweep: 0` (1 pass) `.../check-repair-hold-retired-sweep-1795790332850-1875836.log`
- Em dash count over docs/guide: 0.
- `verify leaf f6fb18643f6dfc31f8e7e801660f80d1887947c8: green` (format `check-format-1795790339832-1876098.log`, typecheck `check-typecheck-1795790342707-1876098.log`, test `check-test-1795790607435-1876098.log`).
- Cold-reader rerun (criterion 9): a fresh subagent given only README.md and docs/guide/01 to 12 answered all 8 questions in line with the design. Q7 now reads 12:34 (failure block), 12:47 (slot-less phase) and 12:57 (`next` never restarts a failed leaf). Q6 is still medium confidence on listener versus watcher, which is the existing N1. No answer is wrong, so N1 stays a Nit.
- Command reference and where-things-go proofs: none of their inputs changed in this repair, so the earlier green runs stand.

### Nits and lessons

N1 to N6 stand as written. Each is specific to these pages, so none is a reusable lesson. No lesson line was written.

### Handed to A

None.
