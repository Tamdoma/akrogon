# Review A: herdr-sweep (check.review, initial, blind)

Base `47186f909bd5dd8fb7373dc9f9b82b28889dccc5`, reviewed head `f672fb781cfdc82cb17aead387c7336ded752383` (59 files, +494/-2969). Worktree clean. No grants, no paid or live activity to audit: the leaf's `check-*.log` files are all local suite, grep and inventory runs.

## Verification evidence

- `akrogon verify` on `f672fb78` (implement end): `verify leaf f672fb781cfdc82cb17aead387c7336ded752383: green`. Setup, format, typecheck and test all exit 0; test is 1135 pass. Receipt row in `issues/verify-runs.jsonl`, test log `implementation/check-test-1794129596400-3299032.log`. No code change since, so no rerun.
- C1: `check c1-install-deploy-2: 0 .../check-c1-install-deploy-2-1794129533648-3296479.log`, 33 pass on `f672fb78`. The planned tests in `tests/install.test.ts` and `tests/deploy-shapes.test.ts` are unchanged since the planning commit (`87523ea0` after rebase): no later commit touches either file apart from `f672fb78`'s removal of the dead fake herdr fixture lines in the install self-update helper, and that run is after it. plan.md records red-on-base, green-with-decision and red-per-violated-condition (prune removed, foreign links pruned).
- C2: `check c2-grep-2: 0 .../check-c2-grep-2-1794129603264-3562196.log`, 138 hits. I read the hits outside the known classes myself (`src/hc.ts:515`, `src/state.ts:22,56,146`, `src/verify.ts:230`, past-tense test comments, the stub, `FAKE_HERDR_APP`, fixture data). None describes old herdr as current.
- C3: `git diff 47186f90 -- learnings/` shows line 11 generalized with its history path and a dated note, line 21 removed with an `Applied 2026-11-08 by src/install.ts (linkServices): ...` line, and the `headless-output-freezes-window` line unchanged.
- C4: report section lists removal steps 2-5 and the checkout step, each with its check. It includes `herdr plugin list`, `herdr integration status`, `systemctl --user list-units 'herdr*'`, `pacman -Q herdr`, path absence, `~/.config/herdr-app-sessions/infra/mods/tasks` with a `test ! -e && test ! -L` check, and the save-before-delete listing for `infra/herdrdev/` and `infra/herdr-plugins/`. The entries are grounded in the three cited inventory logs.
- C5: green verify `test` took 57.9 s (`issues/timings.jsonl` `duration_ms` 57935) against the 75 s baseline. That is faster, so no explanation is due.

## Diff against plan

- D1: `src/install.ts` has no `herdr` argv. `shipsPlugin`, the plugin branch and `unlinkPlugin` are gone, and `linkServices()` takes no parameter. `src/self-update.ts` drops the `unlink` step. The only remaining `herdr` text in src is the D8 history class. No doc or status text names a deploy `unlink` step (grep `'unlink'|deploy failed: unlink` empty).
- D2: the mod listing and planned mod links are removed, and the mods `staleIn` call stays. The real link `~/.config/herdr-app/mods/tasks -> ~/.akrogon/current/herdr-app/tasks` matches the tested shape (target under `currentLink()`, absent from the new release, so stale), and herdr-setup's `board` and other foreign links stay (tested).
- D3: `herdr-app/` and both Tasks mod test files are deleted.
- D4/D5: `src/shell.ts` keeps only process helpers plus `DISCOVERY_DEADLINE_MS` (used by `src/hc.ts`). `tests/fake-herdr.ts` and its bundle build are gone. `procFixture` keeps the proc root, run dir and temp roots, and `tests/hc-fixture.ts` keeps `<home>/bin` first on PATH. `src/verify.ts` drops `FAKE_HERDR`.
- D8: the remedy text is now `restore hc terminal reads and retry cleanup`. No doc quotes the old text.
- D9: docs claims checked against code:
  - `state-and-phases.md` `seat` / `prompted` / `delivery_error` rows match `src/state.ts:33-57` (`seatDeliveryErrorSchema` codes `not_confirmed`/`not_started`, `address`, `turn`, `screen`, `status`; `promptedSchema` `turn`+`address`; old shapes still parse).
  - The `pane` row's `state predates hc` refusal matches `refusePredatesHc` at `src/next.ts:385` and `:590`.
  - The `herdr.tab` label claim matches `src/seat.ts:229`.
  - `install.md`'s "install stops when the file is missing or invalid" matches `readGlobal` (`src/config.ts:213`).
  - The listener and prune paragraph and `releases-and-updates.md` match `src/install.ts` and `deployStage`.
- AREA files: `src/AREA.md` 39 lines and `tests/AREA.md` 40, each with exactly the four sections. The path listing found bare names or runtime paths missing (`akrogon.slice`, `watch-tier.ts`, `watch-check.e2e.ts`, `issues/*.jsonl`, `issues/closed`, `issues/config.yaml`, `reconcile-host.json`). All of them are on lines this diff did not add, and each exists under its real folder or in the registered checkout, so this diff adds no dead pointer.
- Test-Change trailers: each changed or deleted old test file carries one in the commit that changes it. The phase move to `check.review` accepted the record. Each deletion cites the brief's `tests:` item or D8, and the reasons hold: the removed functions no longer exist, or the fake herdr call log is vacuous since `src/` makes no herdr call.
- `tests/rollback.test.ts` gains a recording `herdrStub` for the pinned pre-hc release `6121559e`. That release's own install still calls `herdr integration install` / `plugin link`, and without the stub the test would reach the real `~/.local/bin/herdr` on this machine. No expectation changed. Justified.

## Findings

No Fix.

Nits:
- N1: The deleted `tests/shell.test.ts` case `retryable is false on non-JSON stderr without throwing` guarded lesson 11's regression. Its function is gone, and the same class on hc (`src/hc.ts:72-80` `errorKind`, guarded parse, raw stderr kept on `HcError`) has no dedicated test. Deferred because no done-criterion names it and the guard holds today (read). It would become a Fix if the design's standing rule "its hc counterpart is named" is read as requiring a counterpart test rather than counterpart code, or if a change to `errorKind` drops the `SyntaxError` catch.
- N2: The `Applied` line in `learnings/history/2026-09-28-plugin-cwd-pull.md` names `src/install.ts (linkServices)` without a line number, where the lesson rule's form is `<file:line or commit>`. Deferred because it is a format detail and the stop is real (no plugin, no plugin link or integration call on any path). A `/learn-issues` audit that requires the exact form would promote it.
- N3: `src/reconcile.ts:572,1322` keep-reasons and `tests/store-sweep-safety.test.ts:223`'s title still say "pane inventory" (hc has terminals). Deferred because they do not name herdr and the C2 grep does not reach them. An operator misreading the reason as old-herdr state would promote it.
- N4: `tests/close-pack.test.ts` imports `procFixture` without using it, carried over from its unused `fakeHerdr` import. Deferred because typecheck and format pass with no consequence. A `noUnusedLocals` setting would promote it.

No documented behavior changed beyond the pages this diff rewrote, and each rewritten claim was checked above.

## Verdict

`nits`
