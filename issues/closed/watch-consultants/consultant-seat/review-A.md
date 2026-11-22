# Review A: consultant-seat

Base `1502fbdf`, reviewed head `5a91890a`. Diff: `git diff 1502fbdf..HEAD` — 10 files,
3 commits (`8fa6fb9d` tests+docs, `de177ce1` config, `5a91890a` verb+launch+test corrections).

## Judgment

Criteria 1-5 checked against the diff, plan D1-D10 and design items 6-7:

- C1: `globalSchema.slots.consultant` optional with `slotConfigSchema` shape; superRefine checks
  a/b/consultant against `harnesses:` with `path: ['slots', key]` naming the key; print preserves
  `consultant` inside and outside a repo. Proven in config.test.ts (36 pass,
  `check impl-criteria: 0 ...-308603.log`). The added `path` on a/b issues widens their error
  record slightly but consistently — acceptable.
- C2: `repoSchema.slots`/`indexSchema` untouched; refusal tests green. Deliberate-break reds
  recorded in plan.md.
- C3: `--watch-consultant` shares `launch` with `startConsultant` (no copied proof logic);
  `watchConsultName` = `<prefix>-watch-consult`; labels `akrogon=1`, `akrogon.repo`,
  `akrogon.watch-consult`, no `akrogon.leaf`; `parent: {caller, outlive:false}` → `--parent`
  without `--outlive-parent` asserted at the shim boundary; task via argv (fake) and via send
  after trust (`agy`), address printed. Proven in watch-consult.test.ts (9 pass,
  `check impl-criteria-hc: 0 ...-284390.log`).
- C4: refusal order — positional, flag conflicts, `HC_TERMINAL_ID`, missing recipe — each thrown
  before any hc call, so "starts nothing" holds; test asserts zero `akrogon=1` terminals.
- C5: door-exchange + hc-start + cli-help + command-reference + seat suites green
  (`check impl-regress-a/b: 0`); `startConsultant` signature and labels unchanged.
- `akrogon verify` on head: `verify test: 0 check-test-1795285664406-414758.log`, 1261 pass.
- No `global.slots` reader iterates keys (`seats()`, `effectiveConfig`, `init.ts`, `next.ts`,
  `status.ts`) — `consultant` cannot become a leaf seat. Verified by grep during review.
- Docs: commands.md row and config.md `slots` row/example/front-matter line all match shipped
  behavior; no other doc is stale. No `AREA.md` in the diff.
- Report completeness: commits, commands, criterion links present; `Test-Change:` trailers cover
  the two test-file edits in `5a91890a` and all test files in `8fa6fb9d`.

## Findings

- N1 (Nit): `implementation/report.md` records no wall time for `akrogon verify` (162 s, a
  minutes-size command) though the report rule asks for it on minutes/hours/unknown commands.
  Deferred: the verify receipt and `check-test-*.log` carry the run and its log; not material to
  correctness or verification. Promoted to a Fix if a report rule check starts requiring the
  field mechanically.

## Verdict

`nits` — request merge.
