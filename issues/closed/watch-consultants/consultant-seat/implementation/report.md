# Report: consultant-seat

Slot A implement pass, 2026-11-21. Serial-solo: plan wave 1's U2 unit (docs + contract) had
already landed in the plan-stage tests commit `8fa6fb9d`, leaving one unit per remaining wave —
A implemented directly per the implement-issue serial-solo rule. Base `1502fbdf`, head
`5a91890a`. No refresh needed (branch up to date with origin/main). No grants, no env values.

## Changed files and reasons

- `src/config.ts` — `globalSchema.slots` gains optional `consultant: slotConfigSchema.optional()`;
  `superRefine` harness check now iterates named slots (`a`, `b`, `consultant`) and adds
  `path: ['slots', key]`; `effectiveConfig` re-adds `consultant` to the printed `slots` inside a
  repo (D1, D2). `repoSchema.slots` and `indexSchema` unchanged (criterion 2).
- `src/usage.ts` — `VERB_OPTIONS.seat` gains `watch-consultant: { type: 'boolean' }` (D3).
- `src/hc.ts` — `watchConsultName(prefix)` beside `consultantName` (D4).
- `src/seat.ts` — consultant launch extracted to private `launch(..., spec: {name, labels}, ...)`;
  `startConsultant` unchanged signature, delegates; new `startWatchConsult` delegates with the
  watch name and `akrogon.watch-consult` labels, never `akrogon.leaf`/`akrogon.seat` (D5). No
  copied launch or start-proof logic.
- `src/akrogon.ts` — `--watch-consultant` branch ahead of the positional/`--slot` paths:
  positional and `--slot/--harness/--model/--effort` conflicts, `HC_TERMINAL_ID` guard, missing
  `slots.consultant` naming the key and the resolved machine config path, then
  `requireRepo`/`repoSpace`/`startWatchConsult` (D6). Every refusal precedes any hc call.
- Docs and contract (`docs/reference/commands.md`, `docs/reference/config.md`,
  `tests/command-reference.test.ts`) committed at plan stage in `8fa6fb9d`.
- Test corrections during implement: `tests/config.test.ts` parse narrowed to
  `z.object({slots: record}).passthrough()` (typecheck error: `unknown` spread); prettier
  reformat of `tests/watch-consult.test.ts`/`config.test.ts` — both folded into commit
  `5a91890a` with `Test-Change:` trailers.

## Criterion → proof

All run via `akrogon run-check`; logs under `implementation/`.

1. `akrogon config` loads/prints `slots.consultant` (inside repo and outside); absent harness and
   missing/blank model/effort refused naming the key — config.test.ts 36 pass,
   `check impl-criteria: 0 check-impl-criteria-1795285476342-308603.log` (head 5a91890a).
2. `slots.consultant` in `issues/config.yaml` refused; in `ISSUE.md` front matter `seats()` throws
   `SeatIndexError` naming file+key — same run, same log.
3. Real `hcCore`: `seat --watch-consultant --task` starts one live `<prefix>-watch-consult`,
   parent = caller, labels `akrogon=1`, `akrogon.repo`, `akrogon.watch-consult`, no leaf/seat
   label, `--parent` without `--outlive-parent` in the shim run line, task delivered in argv
   (fake) and by send after the trust dialog (`agy` recipe: `['ENTER', task]`), address printed —
   `check impl-criteria-hc: 0 check-impl-criteria-hc-1795285464989-284390.log`.
4. Missing recipe: non-zero naming `slots.consultant` + `config.yaml`, zero `akrogon=1`
   terminals; positional, `--slot`, `--harness`, `--model`, `--effort` and unset
   `HC_TERMINAL_ID` each refused naming the conflict, zero terminals — same log.
5. Unchanged-behavior set green: door-exchange + hc-start 13 pass
   (`check impl-regress-a: 0 check-impl-regress-a-1795285488370-358820.log`), cli-help +
   command-reference + seat 30 pass
   (`check impl-regress-b: 0 check-impl-regress-b-1795285491001-412118.log`).

## Checks

- `akrogon verify` on committed head `5a91890a`: `verify test: 0
  check-test-1795285664406-414758.log`, 1261 pass / 0 fail / 85 files; format and typecheck
  checks green inside the same run; `verify leaf 5a91890a: green`.

## Commits

- `8fa6fb9d` test: criteria tests + docs/contract (plan stage).
- `de177ce1` feat: `slots.consultant` schema + print (U1).
- `5a91890a` feat: `seat --watch-consultant` verb + shared launch (U3) + test corrections.

## check.fix, 2026-11-21

B's check.repair committed F1 (`27f26ea9`, docs example harness) and handed F2/F3 to A as
missing criterion-3/4 acceptance cases — the one test addition the check.fix rule permits.
Base unchanged (`1502fbdf`); repair head `0357e787`.

- `tests/watch-consult.test.ts` in `0357e787`: the criterion-3 case now asserts the recipe's
  `model`/`effort` on the recorded `hc run` argv; a new case proves a harness that exits gives
  exit non-zero, `start failed` + address on output (F2). The four flag-conflict cases now
  refuse `unknown flag`/ZodError text so a parse rejection cannot satisfy them, the missing
  recipe case also exercises the bare `seat --watch-consultant`, and the outside-hc case
  refuses `unknown flag` (F3).
- Deliberate break shown red: removing the flag-conflict loop sends the combined forms into the
  `--slot` path — `check fix-break-hc: 1 check-fix-break-hc-1795286046676-1690465.log`
  (4 conflict cases fail, 6 pass). Break reverted before the commit.
- Proof: `check fix-criteria-hc: 0 check-fix-criteria-hc-1795286041931-1687790.log`
  (10 pass) on the repair commit; `akrogon verify` on `0357e787`: `verify test: 0
  check-test-1795286207557-1694792.log`, 1262 pass / 0 fail (format, typecheck green).
- Criterion-5 inputs unchanged since their green runs (only tests/watch-consult.test.ts
  touched); config.test.ts untouched since `check impl-criteria` green.

## check.fix round 2, 2026-11-21

B's re-check closed F3 and F2's argv/failed-start parts; it handed back the remaining F2 piece:
the two success cases accepted `started, not confirmed <address>` with exit 0.

- `tests/watch-consult.test.ts` in `eb4d64e9`: both success cases now assert
  `stdout === child.address` — the confirmed print — so an unconfirmed report fails them.
- Deliberate breaks shown red: confirmed reported as unconfirmed
  (`announce` prints the unconfirmed line) → both success cases fail,
  `check fix-break2-hc: 1 check-fix-break2-hc-1795286388803-2432396.log`; the watch verb's
  failed-start `process.exitCode = 1` removed → the exiting-harness case fails on exit 0,
  `check fix-break3-hc: 1 check-fix-break3-hc-1795286395056-2454252.log`. Both reverted.
- Proof: `check fix2-criteria-hc: 0 check-fix2-criteria-hc-1795286404308-2495709.log` (10 pass);
  `akrogon verify` on `eb4d64e9`: `verify test: 0 check-test-1795286634777-2512118.log`,
  1262 pass / 0 fail.

## Known limitations

- Task-less `--watch-consultant` (prints address, no start proof) is shared launch behavior,
  not separately cased.
- hc `name_taken` for a second live `<prefix>-watch-consult` is hc behavior (chart proof),
  not re-tested.
- Live paid recipes belong to the watch-consults leaf's grant; proofs used the stand-in
  harness only.
- `akrogon.watch-consult` label and name verified in one core; multi-repo same-prefix sessions
  are covered by hc's per-session name uniqueness.
