# Review B: tasks-mod

Date: 2026-11-03. Initial blind review, slot B.

Base: `ada0dab9faca8227e320626f6f2821f9b3ee7e39`.
Reviewed head: `419e216194377c204f86b111a3c9fad4dfa53783`.
Verdict: **fix**.

## Fixes

### F1. The saved live evidence does not show the claimed outcomes

`implementation/report.md` claims live success for C1, C3, C5 and C6, but the saved frames contradict it:

- `tasks-live-1.png` and `tasks-live-order2.png` show only “loading…”, not the repositories or current-repo ordering.
- Every sage-terra and miasma state, all three named gruvbox state shots, `tasks-err.png`, `tasks-expanded.png`, and both timer shots contain the identical decoded PNG scanline bytes, hash prefix `4ef9018f7ca52726`. Visual inspection confirms the loading screen. The timer pair cannot demonstrate advancing times.
- The flexoki-light shots show the dark gruvbox board, with background RGB `(40,40,40)`, not a light theme. `tasks-gruvbox-expanded.png` does show a rendered board, but it cannot prove the other themes.
- The report substitutes “impossible by construction” for the planned live event-during-scan observation and provides no kept session command log for that observation or the pin/request readback.

This is a material verification gap against the brief's live C1/C3/C4/C5/C6 outcomes and the plan's existing session/shot/readback proofs. Re-run those cases with the existing tools, confirm the rendered frame before keeping each shot, keep the command/readback evidence, and correct the report to match it. Complete the brief's throwaway-session cleanup after proof. No new proof machinery is needed.

Evidence: E1 and visual inspection of the named PNGs. E2 confirms that the existing session responds and its last frame renders a demo, but does not replace the missing live cases.

### F2. Matched and working seats lose their A/B letters

`herdr-app/tasks/main.js:24` returns only the image or spinner for a matched/working seat. `row()` places those two results side by side without adding the letters. The real recorded envelope's `tasks-mod` row has a working pi seat A and codex seat B, so the ordinary board renders a spinner and codex icon without A/B. The rendered demo in E2 shows the same omission.

Consequence: the seat labels required by C2 and design 2a (`<logo>A <logo>B`, letter alone for an unmatched Program) are absent. Preserve the letter beside each matched logo or working spinner. The model tests check logo selection but never the rendered label. Evidence: E2, E3.

### F3. Pills lack their required opaque background base

`herdr-app/tasks/main.js:198` sets the pill's background directly to the stage color with 12% alpha. It never lays that tint over a `t.background` base. Hovering or selecting a real row therefore blends the tint with `t.hover`/`t.selected`, changing the pill's background with the row.

This violates C3 and plan D8's explicit own-background recipe. Render the tint over the pill's own theme background, then verify the required row states. Evidence: E3 and the visible selected/hovered demo rows in E2.

### F4. Expanded rows omit the repository's kept paths

The real recorded envelope includes `repos[akrogon].kept`, including `/var/tmp/akr-1000/5d20/0b69a262` with a deletion-permission error. `board()` preserves it as `RepoModel.kept`, but neither `repoSection()` nor the expanded detail renders it. `alerts()` renders only the separate host `env.kept` list, which does not contain that path.

Opening a leaf's detail therefore hides the kept cleanup path and its reason. The brief explicitly requires kept paths in the expansion, and plan D9 names repo kept entries. Pass/render those entries in the expansion. Evidence: E3, E4, E5's recorded `repoKept` output.

### F5. Cross-repository slug collisions pin the wrong worktree

The supported input source is an operator creating the same leaf slug in two registered repositories. `docs/use/write-issues-by-hand.md` explicitly requires uniqueness only within one repository, and `src/state.ts` checks duplicates per repository. The all-repository envelope preserves both leaves.

However, `main.js:180` flattens every repository and finds the first leaf by slug alone. Row IDs and expansion keys also use only the slug. Clicking Files/Changes on the later repository's leaf writes the first repository's worktree, while expansion state is shared between the two rows.

A diagnostic using the recorded akrogon/framework leaves with a permitted shared slug prints expected framework worktree but actual `/home/ivan/.akrogon/worktrees/akrogon/tasks-mod`, with both expansion keys true. The source is the documented per-repository namespace, not an arbitrary invalid envelope. Use repository plus slug, or the worktree identity, throughout row actions and keys. Hits C4 and the locked pin contract. Evidence: E6, E7, E3.

### F6. Mod reload repeats the panel request sequence

`main.js:45` resets `seq` to zero on every `init`. The ordinary interaction “Files, reload/reopen the mod, Files” emits sequence `1` twice. E5 runs those actual methods over the recorded leaf and records both requests.

The design requires increasing `panel.request.seq` so repeated requests remain new requests, and plan D9 explicitly selects a reload-safe counter. Resetting it breaks that literal integration contract and permits the next consumer to treat the repeated request as already handled. Seed or retain the counter according to the plan. Evidence: E5, E3. This finding concerns the shared-write contract, not the excluded end-to-end panel opening proof.

### F7. Paused repositories retain active stage colors

The envelope represents pause as `repo.paused`, not a leaf phase. `leafRow()` considers only `leaf.stopped` when choosing grey; `repo.paused` reaches the repo heading but never the leaf pill. A paused repository therefore still shows its plan/implement/check/merge pills in active ANSI colors.

C3 explicitly requires paused grey. E8 passes the recorded envelope with its supported repository pause flag and obtains `tasks-mod: plan.synthesis, pill: ansi4` while `paused: true`. Make the paused state participate in pill selection while preserving the merged-no-pill rule. Evidence: E8, E4.

## Verification and scope

- The configured verify receipt `dcf65d3d-2fd5-48e8-be12-5b93a0bafe6a` is green for setup, format, typecheck and test. It records head `2298a50bee4e73ec6315b6987f77d935c7cbbc0e`, tree `7795d9f518da752b950be0d8f116d8fc0e4a2134`. Reviewed HEAD has that same tree. The test log reports **1289 pass, 0 fail**, including the model and install/deploy cases. I read the receipt and kept logs. No code changed, so the full suite was not repeated.
- The latest `tasks-model` log actually runs `tests/install.test.ts` and `tests/tasks-mod.test.ts`: 37 pass, 0 fail. This includes the planned ten model/scheduler cases and install/deploy cases. The earlier install log has 27 pass. The current tests/fixture changes precede the green final verify. No configured runner, planned case, or test filter was disabled by the diff.
- Planning logs show deliberate wrong model/scheduler implementations and missing install/deploy links red. The subsequent current runs are green. These proofs do not cover F2–F7's host rendering, identity and lifecycle failures.
- Fresh `herdr-app check herdr-app/tasks` passed on reviewed HEAD (E9). The host documentation says that check covers initial/eager elements, not deferred async states, so it does not cure F1.
- Opened the changed behavior's install/release docs, the reference index, host mod/API documentation, and the producer's envelope contract. `src/AREA.md` paths were listed from the worktree root (E10). All concrete paths exist. `herdr-app/<name>` and `skills/<name>` are descriptive placeholders, not dead pointers. Install/deploy documentation matches the shared link plan and call sites.
- No code edits or commits during review. No `.env` file was opened. `readiness.yaml` has empty inputs, grants and retained lists. Only read operations were performed against A's existing throwaway session, using local user ivan, `HERDR_APP_HOME=/home/ivan/.config/herdr-app-sessions/tasks-mod`, `HC_SESSION=tasks-mod`. Created artifact: `implementation/evidence/review-b-live.png`. No new live fixture, paid call, external write, or expanded grant.
- Two optional diagnostic commands failed: a Pillow-based screenshot manifest because Pillow is absent, and a compound receipt inspection's final read because it guessed a nonexistent `themes/omarchy.json`. Neither is a configured check or criterion proof. The manifest was completed with Python's standard library (E1), and the receipt was read successfully in E11. No dependency was installed.

## Test-Change trailers

Trailers in `ada0dab9..419e2161`, judged against `src/test-files.ts`:

1. `d1b3bdf`: `tests/install.test.ts extended to assert the tasks mod link in install and self-update deploy per leaf tasks-mod plan`. Accepted: adds C7 assertions and fixture inputs, preserving the prior expectations.
2. `2011245`: `tests/tasks-mod.test.ts corrected a wrong expectation: time is a plain string (no color member exists to check) and repo order compares with localeCompare, matching the envelope's sort`. Accepted: plan D5 specifies localeCompare; C2 requires uncolored time. The removed `in` expression operated on a primitive string and did not test that outcome. The replacement checks a string without ANSI escapes.
3. `2298a50`: `tests/tasks-mod.test.ts prettier formatting only, no expectation changed`. Accepted: formatting-only diff.
4. `419e2161`: `tests/fixtures/status-envelope.json prettier formatting only in 2298a50, no content changed`. Accepted: trailer-only correction for the fixture formatting commit; the JSON data and reviewed tree are unchanged.

No proof-command correction changing cases was recorded or needed. The latest model command adds the planned install suite without removing model cases. F1 is missing live proof, not an equivalent replacement proof.

## Evidence

Each line below is a kept run-check result, read back with `akrogon log`. Diagnostic host mocks exercised the actual product methods and did not count as live criterion proof.

- E1: `check review-b-shot-bytes: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-review-b-shot-bytes-1793724503657-3797451.log`
- E2: `check review-b-live-shot: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-review-b-live-shot-1793724321775-3791988.log`
- E3: `check review-b-main: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-review-b-main-1793724257071-3788518.log`
- E4: `check review-b-model: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-review-b-model-1793724257074-3788517.log`
- E5: `check review-b-main-pin-probe: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-review-b-main-pin-probe-1793724430228-3795456.log`
- E6: `check review-b-repo-slug-probe: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-review-b-repo-slug-probe-1793724488224-3796967.log`
- E7: `check review-b-doc-contract: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-review-b-doc-contract-1793724459582-3796434.log`
- E8: `check review-b-paused-pill: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-review-b-paused-pill-1793724554427-3798853.log`
- E9: `check review-b-mod-check: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-review-b-mod-check-1793724355588-3792994.log`
- E10: `check review-b-area-listing: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-review-b-area-listing-1793724401905-3794422.log`
- E11: `check review-b-verification-record: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-review-b-verification-record-1793724326945-3792296.log`
- `check tasks-model: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-tasks-model-1793723833901-3772135.log`
- `check tasks-install: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-tasks-install-1793723178836-3424215.log`
- Required verify logs: `implementation/check-format-1793723753156-3460110.log`, `implementation/check-typecheck-1793723755573-3460110.log`, `implementation/check-test-1793723824602-3460110.log`.

## Operator actions

None. All findings are repairable within the existing brief, design and local proof tools. No Nits are retained.

## 2026-11-03 check.repair

Starting head: `419e216194377c204f86b111a3c9fad4dfa53783`. Repaired head: `44482211` (no rebase). Read both initial reviews, the current brief/design/plan/report, host API documentation, and the standing design before repair. Seven distinct product defects are repaired. F1 remains an evidence handoff to A under the skill's missing-case/capture rule.

### Repairs and commits

| Finding | Reproduction commit | Fix commit | Result |
| --- | --- | --- | --- |
| F2 | `bf3baedf` | `2efd3d3c` | A/B letters accompany matched icons and working spinners. |
| F3 | `4353a740` | `8096b2ba` | The 12% tint is composited over the pill's own opaque theme background. |
| F4 | `ea54c533` | `086ee16a` | Expanded details render repository kept paths and reasons. The declaration carries the same field. |
| F5 | `c6850eb3` | `791cd6c3` | Row IDs, expansion and button actions use repository/slug. Proof commands still accept an unambiguous short slug, also accept repository/slug, and reject ambiguous names. |
| F6 and A Fix 2 | `a6d07b22` | `6805e64b` | Date-seeded requests also exceed the latest shared request, surviving remounts and other writers. |
| F7 | `f29144d5` | `142face5` | Paused repositories use grey pills, preserving no pill on merged rows. |
| A Fix 1 | `899551bc` | `b008f3ce` | An initial failure waits for the existing 30-second timer before retrying. Pending real events still coalesce normally. |

Each reproduction failed before its product fix and passed afterwards. Only reproduction tests were added. Existing expectations, fixtures, runner settings and plan commands were preserved. The subprocess boundary uses the existing Bun runner and `src/shell.ts` command helper, mocking host APIs while importing the actual mod. `44482211` formats the reproduction file only and carries its Test-Change trailer. Every commit changing an old test file has a source-citing trailer. No co-author trailers were added.

### Red/green evidence

The commands were `bun test tests/tasks-mod-host.test.ts` for F2–F6 and A Fix 1, and `bun test tests/tasks-mod.test.ts` for F7. These are intentional leaf-caused reproduction failures, not base reds. All cited logs were read back through `akrogon log`.

- F2 red: `check repair-b-f2-red-current: 1 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-f2-red-current-1793724804375-3804689.log`
- F2 green: `check repair-b-f2-green: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-f2-green-1793724814592-3805199.log`
- F3 red: `check repair-b-f3-red: 1 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-f3-red-1793724829515-3805747.log`
- F3 green: `check repair-b-f3-green: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-f3-green-1793724829867-3806029.log`
- F4 red: `check repair-b-f4-red: 1 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-f4-red-1793724844849-3806620.log`
- F4 green: `check repair-b-f4-green: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-f4-green-1793724845197-3806921.log`
- F5 red: `check repair-b-f5-red: 1 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-f5-red-1793724869174-3807680.log`
- F5 green: `check repair-b-f5-green: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-f5-green-1793724869530-3807976.log`
- F6 red: `check repair-b-f6-red: 1 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-f6-red-1793724885738-3808684.log`
- F6 green: `check repair-b-f6-green: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-f6-green-1793724886083-3808981.log`
- F7 red: `check repair-b-f7-red: 1 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-f7-red-1793724900392-3809584.log`
- F7 green: `check repair-b-f7-green: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-f7-green-1793724900724-3809849.log`
- A Fix 1 red: `check repair-b-a1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-a1-red-1793724916132-3810435.log`
- A Fix 1 green: `check repair-b-a1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-a1-green-1793724916481-3810746.log`

### Current proof and live replay

The final targeted command passes **17 tests** (the original ten planned model/scheduler cases plus seven reproductions). The exact planned model command was also replayed, now with the paused reproduction added. Typecheck and the native mod check pass. No full verify or merge checks were run because this pass hands work to `check.fix`; the previous receipt does not certify this repaired tree.

- `check repair-b-final-targeted: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-final-targeted-1793725464147-3832084.log`
- `check tasks-model: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-tasks-model-1793724980804-3812769.log`
- `check repair-b-typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-typecheck-1793725027155-3814865.log`
- `check repair-b-mod-check: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-mod-check-1793725024687-3814761.log`

Replayed the plan's existing native session, theme generator, screenshot, expansion and pin/readback procedures on the repaired code. The initial existing session retained old imported code: its emitted `seq: 1` and screenshots were rejected as repair proof. It was stopped/deleted and recreated with `herdrapp --session tasks-mod`. The command environment removes desktop variables, so the launch explicitly supplied `XDG_RUNTIME_DIR=/run/user/1000` and `WAYLAND_DISPLAY=wayland-1`. A named user service, `tasks-mod-proof-window.service` in `akrogon.slice`, kept that same planned session alive after the launch command. This changed launch lifetime only, not the session target, identity, mod or product operation.

The fresh session's settings and themes symlinks were replaced with private session copies before writing them. `apply-herdr-app-theme` used preserved inputs under `implementation/evidence/repair-b-theme-inputs/<theme>/omarchy/current/theme/`, with `HERDR_APP_HOME` pointing only at the throwaway session. The operator's themes/settings were not written. The supplied `movecursor` invocation failed under the installed Lua dispatcher, so screenshots use the plan D15 forced-fill alternative. The failed attempt is kept in `check-repair-b-hover-input-1793725279795-3825538.log`.

- C1: `implementation/evidence/repair-b-recorded-board.png` renders the original recorded envelope. `space.new --folder /home/ivan/Work/personal/Himne` puts Himne first, followed by the other eleven repos in order, with empty groups folded. This is the planned recording replay, not a hand-patched positive envelope.
- C2/C3/F7: `implementation/evidence/repair-b-{sage-terra,miasma,gruvbox,flexoki-light}-{plain,hover,selected}.png` show every stage, grey parked/stopped/paused states, a paused repository's grey plan pill, and no merged pill. Visual inspection confirms readable stage words and distinct implement/merge colors. The selected frames show the repaired pills retaining their own background on the row fill. A/B labels remain visible with the real Program icons and spinner. The preserved `repair-b-demo.json` is the plan D11 hand-built theme/negative demonstration input, not a replacement for the recorded positive fixture.
- All twelve frame backgrounds match their staged theme inputs and all twelve decoded frame hashes differ. Flexoki-light is `(255,252,240)`, not a stale dark frame. `check repair-b-theme-frame-check: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-theme-frame-check-1793725525171-3833074.log`
- C4/F4: `tasks.expand:tasks-mod` on the original recording produces `implementation/evidence/repair-b-recorded-expanded.png`, including the real kept deletion-error path and Files/Changes controls. The ordinary commands `tasks.pin:tasks-mod files` and `tasks.pin:tasks-mod changes` write the active space's local worktree pin and requests with increasing sequences `1793725372965`, `1793725372966`. After a probe remount, Files emits `1793725462254`.
- `check repair-b-files-readback: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-files-readback-1793725419070-3830636.log`
- `check repair-b-changes-readback: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-changes-readback-1793725419637-3830871.log`
- `check repair-b-remount-readback: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-remount-readback-1793725463935-3832011.log`

C5's planned model error-envelope proof and C6's planned pure scheduling/file-diff proofs pass in the current model run. The live error-envelope and production timer/watch recordings remain F1, listed below. No timer or watch proof is claimed from the static theme screenshots. C7's install/deploy tests retain their prior green evidence: their implementation, helpers, fixture and configuration were untouched. Its native-mod check was replayed on the repaired source.

### Live identity, cleanup and saved files

No grants are declared in readiness. The brief and plan authorize these local throwaway operations as user ivan against session `tasks-mod`, using `HERDR_APP_HOME=/home/ivan/.config/herdr-app-sessions/tasks-mod` and `HC_SESSION=tasks-mod`. There were no paid model calls, external account actions, new targets, or operator-only actions.

Stopped and deleted the session, then stopped the named helper service. The authenticated session-list readback contains no `tasks-mod`, its app-home directory, core socket and core state directory are absent, and the helper service is inactive. The prior foreground window was restored. The two stale B pre-restart screenshots were deleted. Only valid proof inputs, screenshots, request recordings and kept logs remain under the leaf.

- `check repair-b-session-cleanup: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-session-cleanup-1793725557920-3833796.log`
- `check repair-b-session-absence: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair-b-session-absence-1793725566588-3833956.log`

The code worktree is clean. No `.env` files were opened, no dependencies were added, and no brief/design decision was changed. No reusable Nit is held by B.

### Handed to A

- F1: missing-case/capture exception. C5 still needs the planned live error-envelope recording; C6 still needs the live advancing-time/no-rescan pair, folder-triggered new scan, and event-during-scan evidence using the existing `herdrapp`, `herdr-app shot`, status envelope and command/log tools. Update `implementation/report.md` to replace its rejected claims and cite the current C1/C3/C4 proof above. This is missing recording work with existing tools, not a missing runner or dependency on another leaf.

Next phase requested: `check.fix`, slot A. No operator actions remain.

## 2026-11-03 check.review after check.fix

Verdict: **fix**. F1 remains open for C6. C5 is now demonstrated. No new product defect is added.

Original reviewed base/head: `ada0dab9faca8227e320626f6f2821f9b3ee7e39` / `419e216194377c204f86b111a3c9fad4dfa53783`. Repaired and currently reviewed head: `44482211fff2190ac8fed39fa14a49fce40b9ab7`, tree `a45f2f077fc99d35cbb9b129493982feeb2a2db1`. A's check.fix changed no code from B's handoff. There was no check.fix branch refresh, so no range-diff is needed. The worktree is clean.

Re-read the skill/references, brief, design, plan, implementation report and previous B repair findings. Reviewed the repair scope and A's replacement recordings. F2–F7 and A Fix 1/2 retain their repair evidence from the preceding entry. No documented product behavior or AREA.md changed in A's pass.

### F1 still blocks: C6 replacement frames show a render error

The new report claims the following visible outcomes, but the saved files do not contain them:

- `implementation/evidence/tasks-a-mount.png` and `tasks-a-time-b.png` do not show `timer-one 0h 59m` and `1h 00m`. They show the welcome overlay and a render-error banner saying the view could not re-render, with `cannot read property 'length' of undefined`. Their decoded PNG hashes are identical: `42bcf75f1ebf5199793124ba49e4dca2a4709a500aa22fcdfed5f5457cec1c30`.
- `tasks-a-fifo-s1.png`, `tasks-a-fifo-s2.png`, `tasks-a-fifo-s3.png` and `tasks-a-time2.png` show the same render error and welcome overlay. None displays the claimed `scan-one`, `scan-two`, `scan-three` or advancing timer. All four have identical decoded hash `eb347faf17724abbeeb5a7d67c3fa16d50598574936d94cc5dbc295f2a2687fd`.

The cause is in the new hand-built proof inputs: `timer.json` and all three `scan*.json` files omit the required repository `parked` array. The live producer always emits it (`src/status.ts`, JsonRepo and jsonRepo). `board()` passes that field through, then `main.js:311` reads `repo.parked.length`. The input omission explains the recorded native error. This is a proof-input failure, not grounds for a production fallback or null guard against an impossible producer state.

There is also no kept run-check log of A's FIFO feed observations, the three touches, `NOREADER`, or the claimed scan-count/no-overlap result. The new implementation logs from A's pass are only verify logs. Its narrative cannot establish that scans reran, coalesced, or avoided overlap. The report explicitly says the exec wrapper did not intercept the real command, so that wrapper supplies no execution-count evidence either. The FIFO substitution has no demonstrated equivalence guard for the required live outcome.

This is the same unresolved F1 material verification gap, specifically brief C6's visible advancing times without a command rerun, folder-triggered rerun, and no overlapping scan. Correct the hand-built demo inputs to the existing producer contract, replay the existing native proof, inspect each saved frame for its claimed state, and retain the actual command/observation logs. Follow the planned live command path or document a valid proof-command correction with its equivalence evidence. Correct the implementation report's contrary claims. No new runner, product feature or schema relaxation is requested.

### Evidence accepted and verification

- **C5 accepted:** `implementation/evidence/tasks-a-err.png` visibly contains the deploy error, unreadable blepsis error, slow-merge alert and healthy akrogon/framework/herdr-setup rows. The welcome overlay obscures part of the board, but the required errors and healthy rows are visible and the view is not blank. This satisfies the plan's live demo error-envelope observation, together with its existing model test.
- **Configured checks accepted:** verify run `979374f0-9b10-4cb8-a7f5-20c0cb95c6c0` names current SHA/tree and records setup, format, typecheck and test green. The test log reports **1296 pass, 0 fail**, across 75 files, using `bun test --timeout=30000 --parallel=4 --no-isolate`. No cases or runner configuration changed after that run. The green suite does not replace the separately required C6 live outcome. No redundant rerun was made.
- **Repair trailers accepted:** `bf3baedf`, `4353a740`, `ea54c533`, `c6850eb3`, `a6d07b22` and `899551bc` cite the F2/F3/F4/F5/F6/A1 realistic sources for additions to `tests/tasks-mod-host.test.ts`; `f29144d5` cites C3/F7 for the added paused case in `tests/tasks-mod.test.ts`; `44482211` cites formatting only. Their exact trailer texts are kept in the scope log. These are reproduction additions or formatting, not unsupported expectation changes.
- **Cleanup partly confirmed:** the authenticated `herdrapp session list --json` has no `tasks-mod` session, and `tasks-mod-a-proof.service` is inactive/dead. However, the owned `/tmp/tasks-a-env` directory still contains its FIFO, watched directory, reader/feed helpers and input files. The owning proof pass must clean these and record absence. New temporary paths must use `$TMPDIR`, per the skill.
- **Operator theme rule honored:** this re-check made no writes under `~/.config/herdr-app/`, directly or through session links, and launched no theme test. Future theme proof must use a private copied session theme directory, or be recorded as operator-blocked if it cannot comply. No operator-only action is needed for this read-only review or the C6 proof-input correction.

Kept evidence, read back with `akrogon log`:

- `check recheck-b-scope: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-recheck-b-scope-1793726457666-4165452.log`
- `check recheck-b-evidence-inventory: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-recheck-b-evidence-inventory-1793726468901-4165833.log`
- `check recheck-b-c6-evidence: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-recheck-b-c6-evidence-1793726553909-4168102.log`
- `check recheck-b-producer-contract: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-recheck-b-producer-contract-1793726554010-4168172.log`
- `check recheck-b-verify-receipt: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-recheck-b-verify-receipt-1793726523953-4167278.log`
- `check recheck-b-fixture-cleanup-state: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-recheck-b-fixture-cleanup-state-1793726598610-4170042.log`
- Current configured logs: `implementation/check-format-1793726305120-3850278.log`, `implementation/check-typecheck-1793726307417-3850278.log`, `implementation/check-test-1793726373871-3850278.log`.

Recorded the reusable judgment lesson in the registered checkout's `learnings/LESSONS.md` and `learnings/history/tasks-mod-native-frame-proof.md`, left uncommitted for the operator. The active list was consulted only to match that lesson, after the verdict, not as review input. No Nit is retained, and no code or test was changed or committed during this re-check.

Next requested: `check.repair` for the remaining F1 proof work. The missing-capture/test-input correction remains the skill's handoff to A, not a request for B to add product guards.

## 2026-11-03 check.repair after C6 re-check

Head remains `44482211fff2190ac8fed39fa14a49fce40b9ab7`; the code worktree is clean and unchanged. Re-read the current skill/references, brief, design, plan, implementation report, readiness and latest re-check findings. The only remaining Fix is F1's C6 proof-input/capture gap. C5 and all seven product repairs remain accepted. No product repair, commit, new test or verify run is needed in this handoff pass.

### Completed here

Removed A's abandoned `/tmp/tasks-a-env` fixture after authenticated readback confirmed no `tasks-mod` session and an inactive/dead `tasks-mod-a-proof.service`. Checked the directory's ownership and exact expected entries, and confirmed that its five JSON inputs were already preserved in the leaf's evidence folder before deleting the FIFO, helpers, watched directory and temporary copies. Read back filesystem absence after deletion. This completes the cleanup portion of F1 without discarding the rejected recordings or their diagnostic inputs.

- Before: `check repair2-b-scope: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair2-b-scope-1793726926258-4182122.log`
- Cleanup and absence: `check repair2-b-cleanup: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair2-b-cleanup-1793726926405-4182212.log`

Both logs were read back through `akrogon log`. No files under the operator's `~/.config/herdr-app/` were created, renamed, moved, deleted or written, directly or through session links. No native session or theme test was launched. No operator-only blocker was encountered.

### Handed to A

- **F1 / C6 — missing capture and proof-command correction exceptions.** Correct the four hand-built timer/scan inputs to the producer contract, including their missing `parked` arrays. The earlier attempt failed because those inputs reached `repo.parked.length` without that required field, and the retained error frames were reported as successful timer/scan states. All four affected inputs were identified in the preceding re-check; the recorded positive fixture remains valid and must not be patched. Use the existing `herdrapp`, `herdr-app shot`, status envelope and native command/log tools to keep an actual advancing-time pair at least 61 seconds apart without a command rerun, a folder-triggered new scan, and an event-during-scan/no-overlap observation. Keep the command outputs with `akrogon run-check`, inspect each saved frame for the claimed result, and correct `implementation/report.md`. If replacing the planned command proof, record the old/new commands, reason and equivalence guard. Reuse the already accepted C1–C5/C7 evidence. Any session files used must be private copies before writes; the operator's real app home stays read-only. New temporary paths belong under `$TMPDIR`, with cleanup and absence readback afterwards.

This is proof work using existing tools, not missing machinery, a new product defect, or a reason to add production fallbacks. The current green verify receipt still covers the unchanged code tree; it does not clear C6. Request `check.fix` for A. No operator actions remain.

## 2026-11-03 check.review after F1 round 2

Verdict: **fix**. F1 is narrower: new scan observations are retained, but C6's claimed visible timer and row-state captures were not preserved.

Reviewed base/current head: `ada0dab9faca8227e320626f6f2821f9b3ee7e39` / `44482211fff2190ac8fed39fa14a49fce40b9ab7`. Current head and tree are unchanged from the preceding review and repair. A added evidence/report changes only, with no commits, test changes or branch refresh. No range-diff or new Test-Change trailers apply. All earlier product repair verdicts and trailer judgments remain in force. No documented product behavior or AREA.md changed.

### F1 remains: the new C6 images are absent

The current implementation report cites `implementation/evidence/live-1.png`, `live-2.png`, `live-3.png`, `live-4.png`, `prop-1.png` and `prop-2.png` for the visible advancing-time and folder-triggered board states. None exists. `prop-3.png` is also absent. There are no copies under the leaf and no archive containing them. The temporary directory `/tmp/tasks-a2.gysIlQ` has already been deleted.

The kept native command output records screenshots being saved into that temporary directory, not into the leaf. This leaves no frame to inspect for the report's claimed `0h 24m → 0h 25m`, probe-row appearance/disappearance, or prop-row timer changes. The specifically cited `check-c6-live2-1793727579267-2315.log` is zero bytes, so it supplies no alternative observation. This is the same F1 missing visual proof against C6, not a new code defect.

Preserve or re-create the minimum missing native frames under the leaf before cleanup, then verify that the saved files show the claimed state. For the quiet-window proof, keep the at-least-61-second pair with its scan count and actual image paths together. Correct the implementation report to cite the preserved evidence and the nonempty command log. No code change, production guard or broad test rerun is requested. The prior accepted C5 image `tasks-a-err.png` is also now absent; repair that dangling report reference if the frame can be recovered, without reopening B's already-recorded C5 observation.

### Evidence now accepted

- **Quiet scan window and folder event:** `check-c6-inotify-1793727862497-6865.log` records one envelope-file open at mount, still one after 62 seconds, then two after a watched-folder hit. The kept `evidence/opens.log` agrees. This directly observes scans on the plan's existing demo-envelope branch, with the same scanner and folder-watch logic. It replaces the unusable FIFO/ineffective PATH wrapper observations. The 30-hit burst produced 25 total opens; this count alone is not a measurement of simultaneous execs.
- **Actual exec overlap case:** `check-c6-overlap-1793727675994-4190.log` and `evidence/samples2.log` preserve two session-scoped exec windows: first observed `1793727661.039–1793727661.364`, next starting at `1793727661.417`. These are separate observed windows on the real command path. The existing pure scheduler tests additionally retain their fail-before/pass-after coverage of the running guard.
- **Live command recording:** `check-c6-live-1793727428271-4191022.log` records shot times 62 seconds apart and create/burst/delete operations. Its raw live window had ambient rescans, as the report acknowledges, so the controlled inotify window supplies the quiet-window count. The missing PNGs prevent judging the claimed visible changes in either run.
- **Configured checks:** receipt `979374f0-9b10-4cb8-a7f5-20c0cb95c6c0` still matches SHA `44482211fff2190ac8fed39fa14a49fce40b9ab7`, tree `a45f2f077fc99d35cbb9b129493982feeb2a2db1`, with format, typecheck and test green. Read back the test log: **1296 pass, 0 fail** across 75 files. No code/test input changed, so these checks were not repeated.
- **Cleanup and operator boundary:** authenticated session listing contains no `tasks-mod`; `tasks-mod-a2-proof.service` is inactive/dead and the temporary proof directory is absent. This review made no writes under the operator's app home or linked session paths and launched no native/theme session. There is no operator-only blocker.

Kept review evidence, read back with `akrogon log`:

- `check recheck2-b-scope: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-recheck2-b-scope-1793727975023-15987.log`
- `check recheck2-b-capture-inventory: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-recheck2-b-capture-inventory-1793728041597-17214.log`
- `check recheck2-b-artifact-presence: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-recheck2-b-artifact-presence-1793728123174-19097.log`
- `check recheck2-b-receipt: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-recheck2-b-receipt-1793728123293-19159.log`
- Current product test log: `implementation/check-test-1793726373871-3850278.log`.

No code or test was edited or committed. No Nit or new operator action is retained. Request `check.repair` for the remaining F1 capture-preservation correction; the skill's missing-capture exception continues to assign that portion to A.

## 2026-11-03 check.repair after missing-frame re-check

Read the current skill/references, brief, design, plan, implementation report, readiness and latest B re-check. Head remains `44482211fff2190ac8fed39fa14a49fce40b9ab7`; code and tests are clean and unchanged. F1 now consists only of missing visual captures and correction of their report references. No product Fix remains for B to implement, and no fixture cleanup remains from the last reviewed run.

Confirmed that both reported timer pairs (`live-1.png`/`live-2.png`, `prop-1.png`/`prop-2.png`) remain absent from the evidence folder. The accepted `opens.log` and `samples2.log` are preserved. This pass changes no code, expectations, fixtures, brief or design, starts no session, and runs no tests or verify. The matching green receipt and prior product repairs remain valid.

### Handed to A

- **F1 / C6 — missing-capture exception.** Use the existing native session, `herdr-app shot` and scan-observation tools to preserve the minimum timer pair at least 61 seconds apart, with its quiet-window scan count, directly under the leaf's evidence folder before cleanup. Inspect both preserved images for the visible time change, and cite their real paths and the same window's kept command log in `implementation/report.md`. Retain the already accepted folder-trigger and real-exec overlap observations; do not repeat those cases or C3's theme work unless an input affecting them changes. Remove or correct the report's absent screenshot references, including its dangling C5 reference, while preserving B's accepted C5 observation. This is recording/report work, not missing machinery or a new product defect.

The operator's real `~/.config/herdr-app/` stays read-only, including through session symlinks. Any session paths written during proof must be private copies first. Use `$TMPDIR` for new temporary work, preserve proof outputs under the leaf, then clean temporary resources and read back absence. If a necessary check cannot obey the operator's app-home rule, record it as operator-blocked rather than writing there.

- `check repair3-b-scope: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair3-b-scope-1793728348245-23033.log`
- `check repair3-b-captures: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-repair3-b-captures-1793728348379-23114.log`

No operator-only action is currently open. Request `check.fix` for A under the skill's explicit missing-capture handoff rule.

## 2026-11-03 check.review after F1 round 3

Verdict: **ready**. F1 is closed. F2–F7 and both A findings remain closed by the previously reviewed repairs.

Base: `ada0dab9faca8227e320626f6f2821f9b3ee7e39`. Reviewed head: `44482211fff2190ac8fed39fa14a49fce40b9ab7`, tree `a45f2f077fc99d35cbb9b129493982feeb2a2db1`. This repair changed evidence/report only. The worktree is clean, with no commits since the prior reviewed head, no branch refresh, no new Test-Change trailers and no changed documented product behavior or AREA.md. Earlier trailer judgments remain valid.

### F1 acceptance

Opened the preserved native frames `implementation/evidence/a3-prop-1.png` and `a3-prop-2.png` directly. They show status-json advancing **1h 40m → 1h 41m** and fixture-weave-recorder advancing **1h 42m → 1h 43m**. These are the actual observed rows and values, superseding the report's different row/value transcription. The paired kept log records timestamps 1793728403 and 1793728465, **62 seconds apart**, with **zero envelope-file opens** throughout the window. It then records **one open after a watched-folder hit**. Thus the saved board visibly advances without a scan during that interval. The existing D11 prop-file equivalence judgment and previously accepted real-exec overlap observation remain applicable.

Opened `implementation/evidence/a3-err.png`: deploy-failure and malformed-repo messages are visible together with healthy akrogon/framework rows. This restores the missing C5 artifact without reopening the accepted behavior. Previously accepted C1–C4/C7 evidence and product red/green reproductions remain unchanged.

- `check c6-pair: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-c6-pair-1793728468881-24709.log`
- `check recheck3-b-scope: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-recheck3-b-scope-1793728536319-28509.log`

Both logs were read back through `akrogon log`. The matching green verify receipt `979374f0-9b10-4cb8-a7f5-20c0cb95c6c0` still covers this unchanged head/tree: format and typecheck green, **1296 tests pass, 0 fail**. No code, test, helper or configured check input changed, so no check rerun was needed.

### Cleanup and operator boundary

Authenticated session listing contains no `tasks-mod`. Its session directory is absent, and `tasks-mod-a3-proof.service` is not loaded, inactive/dead, MainPID 0. No `/tmp/tasks-a3*` directory remains.

The first readback failed to connect to the user bus because this shell lacked XDG_RUNTIME_DIR. Repeating the read-only inspection with `XDG_RUNTIME_DIR=/run/user/<uid>` succeeded. This was an inspection invocation failure, not a product/check failure or an unresolved cleanup result.

- Initial invocation: `check recheck3-b-cleanup: 1 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-recheck3-b-cleanup-1793728636360-29901.log`
- Corrected readback: `check recheck3-b-cleanup-readback: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-recheck3-b-cleanup-readback-1793728649595-30137.log`
- Authenticated absence and unchanged head/tree: `check recheck3-b-final-state: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/tasks-mod/implementation/check-recheck3-b-final-state-1793728657688-30304.log`

These logs were read back through `akrogon log`. This review launched no native/theme session and made no writes under the operator's real app home or linked session folders. No code or test was edited or committed. No Fix, Nit, operator action or additional lesson remains. Request merge as slot B with verdict ready.
