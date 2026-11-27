# Review A: guide-chapters

- **Slot**: A (blind initial review; `fix_rounds: 0`; `review-B.md` not read)
- **Base (`AKROGON_BASE`)**: `d44a586681f87b163a6613222de8be0b9a6679f6`
- **Reviewed HEAD**: `5c4841e8b966776579a4739ade8427ae04b6548f`
- **Verdict**: `ready`

## Scope and documentation-behavior checks

- **Changed behavior**: No documented `src/` or `skills/` behavior changed in this leaf; the diff updates human documentation (`README.md`, `docs/`) and doc-contract/moved-doc tests only.
- **`AREA.md` files in diff**: None (`src/AREA.md`, `tests/AREA.md`, and `skills/AREA.md` are untouched).
- **Paid / covered operations**: None (`readiness.yaml` grants are empty; no paid launches occurred).
- **Frozen tests & `Test-Change:` trailers**: All 4 modified test files (`tests/docs-em-dash.test.ts`, `tests/docs-links.test.ts`, `tests/rollback.test.ts`, `tests/watch-timer.test.ts`) sit in planning commit `c8e77c43` with matching `Test-Change:` trailers and were untouched during `implement`. All added assertions are function checks (file existence, link/anchor resolution, YAML schema + `harnessArgv`, literal folder paths, and the brief-mandated Criterion 7 retired-phrase guard) with no prose-wording or model-choice proxies.

## Review against brief, design, plan, and live code

- **Criterion 1 (`01`–`03`, `09`–`12` content & copyable config)**: Verified all 7 new guide pages exist and cover every item in `brief.md` `## What`. `01-install.md` opens with the prerequisite check table (commands + expected outputs), gives numbered steps from `git clone https://github.com/Tamdoma/akrogon.git` to `akrogon config`, provides a complete 1-CLI copyable `~/.akrogon/config.yaml` with zero `<...>` placeholders validated by `globalSchema` and `harnessArgv`, and adds an optional harnesses block (`codex`, `agy`, `pi`) matching `/home/ivan/.akrogon/config.yaml` verbatim. `02-set-up-a-repo.md` models one install serving made-up `acme-core`, `client-portal`, and `partner-hub` (zero private repo names), walks `/init-akrogon`, lists all `akrogon init` outputs (verified against `src/init.ts:64-95`), documents `prefixes`, grounding (`grounding.index` and `AREA.md`), and ends the setup steps with `akrogon status`. `03-your-three-tabs.md` clearly separates the code-enforced Herdr space name (`src/hc.ts` `resolveSpace`) from the `t-`/`c-`/`w-` convention and gives numbered `herdr-app do space.new` / `tab.new` commands verified against `herdr-app commands`.
- **Criterion 2 (running example in `09`–`12`)**: Verified `09-lifecycle.md`, `10-merging.md`, `11-while-you-are-away.md`, and `12-when-work-stops.md` carry `client-portal`'s `weekly-client-report` (`csv-export` and `scheduled-email`) continuously from `08-hand-off.md` through build, review, merge, overnight watch, and `POSTMARK_API_KEY` failure recovery.
- **Criterion 3 (`README.md`, `docs/README.md`, Previous/Next, links)**: Verified `README.md` is a concise front door (at most two sentences of soft selling, full 12-page guide index, zero picture embeds), `docs/README.md` provides the chapter index, `## Other tools` table, and all 11 shelf pages, `04-a-charting-session.md` shrinks its tab section to a link to `03` while keeping `## Where you chart` (passing `tests/docs-pictures.test.ts`), `04` and `08` footers link `03` and `09`, and every link/anchor in `README.md`, `docs/`, and tracked `skills/` resolves.
- **Criterion 4 (retired folders & 23-row move map)**: Verified `docs/start/`, `docs/use/`, and `docs/examples/` are deleted, zero stale references to retired filenames remain across `README.md`, `docs/`, `skills/`, `src/`, and `tests/`, and all 23 retired files are mapped to concrete live destinations in `implementation/report.md`.
- **Criterion 5 (`words.md` & `where-things-go.md`)**: Verified `docs/reference/words.md` defines approved terms and maps guide words to shelf words with valid links, and `git diff d44a586681f87b163a6613222de8be0b9a6679f6...HEAD -- docs/reference/where-things-go.md` modifies only lines 9–14 (`## Folders`), leaving `## Pictures` byte-for-byte untouched.
- **Criterion 6 (moved-doc tests & sweeps)**: Verified `tests/rollback.test.ts:140` reads `../docs/reference/roll-back-a-release.md` and `tests/watch-timer.test.ts:1370,1393,1402` read `docs/guide/11-while-you-are-away.md` with all content assertions unchanged; `rollback.test.ts`, `watch-timer.test.ts` doc cases, `run-permit.test.ts` sweep, `hold-retired.test.ts` sweep, and `command-reference.test.ts` all pass on HEAD `5c4841e8`.
- **Criterion 7 (retired-phrase guard & deliberate break)**: Verified `tests/docs-em-dash.test.ts` scans `README.md` and `docs/**/*.md` freshly from disk plus tracked `skills/**/*.md` via `git ls-files -s skills/` (excluding untracked vendored `node_modules`), splits on `/\r\n|[\n\r\u2028\u2029]/`, checks all four phrases case-insensitively, exempts only lines starting with `Old record words:`, failed on the deliberate `README.md:40: Quick fix deliberate break` test run (`check-docs-em-dash-break-1795789307071-1454514.log`), and passes clean on HEAD `5c4841e8`.
- **Criterion 8 (no em dashes, no partial consultant examples)**: Verified via `tests/docs-em-dash.test.ts` (4/4 pass) and inspection of all 106 matches in `check-consultant-audit-1795789310873-1457957.log` (zero partial consultant launch examples).
- **Criterion 9 (cold-reader check)**: Owned by slot B in `review-B.md`.
- **Criterion 10 (factual accuracy & tone)**: Spot-checked commands, paths, numbers, and rules against `src/install.ts`, `src/init.ts`, `src/config.ts`, `src/hc.ts`, `src/next.ts`, `src/phase.ts`, `src/land.ts`, `src/self-update.ts`, `src/rollback.ts`, `src/status.ts`, `src/sync.ts`, `systemd/*.slice`, `herdr-app commands`, `skills/*/SKILL.md`, and `/home/ivan/.akrogon/config.yaml` (all 4 harness launch lines match verbatim). No mismatches found; tone is plain technical English without marketing jargon or unexplained developer jargon.
- **Criterion 11 (configured `checks`)**: Verified `akrogon verify` green receipt on reviewed HEAD `5c4841e8b966776579a4739ade8427ae04b6548f` (`verify setup: 0`, `verify format: 0`, `verify typecheck: 0`, `verify test: 0` including 5x `--rerun-each=5` across the 4 changed test files: `265 pass, 0 fail`; wall time `272 s`).

## Verification evidence (on HEAD `5c4841e8b966776579a4739ade8427ae04b6548f`)

No code changed since `implementation/report.md` and no evidence is missing, so no reruns were needed:
- `verify setup: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-setup-1795789343891-1458825.log`
- `verify format: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-format-1795789347261-1458825.log`
- `verify typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-typecheck-1795789350363-1458825.log`
- `verify test: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-test-1795789615143-1458825.log`
- `check docs-em-dash-break: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-docs-em-dash-break-1795789307071-1454514.log`
- `check docs-em-dash: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-docs-em-dash-1795789307210-1454653.log`
- `check docs-links: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-docs-links-1795789307370-1454749.log`
- `check docs-pictures: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-docs-pictures-1795789307461-1454857.log`
- `check rollback-doc: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-rollback-doc-1795789310079-1454927.log`
- `check watch-timer-docs: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-watch-timer-docs-1795789310249-1457537.log`
- `check run-permit-sweep: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-run-permit-sweep-1795789310391-1457631.log`
- `check hold-retired-sweep: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-hold-retired-sweep-1795789310542-1457726.log`
- `check command-reference: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-command-reference-1795789310655-1457820.log`
- `check where-things-go-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-where-things-go-diff-1795789310766-1457891.log`
- `check consultant-audit: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-consultant-audit-1795789310873-1457957.log`
- `check retired-dirs-audit: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/guide-chapters/guide-chapters/implementation/check-retired-dirs-audit-1795789310985-1458053.log`

## Findings

### Fixes
None.

### Nits
None.
