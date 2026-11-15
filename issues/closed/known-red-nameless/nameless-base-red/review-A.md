# Review A: nameless-base-red

Base: a93fec755e9b4481d96feda0001841a5eb072ca9. Reviewed head: 6352653739fcd32727c809c42a0955811071d98d.

## Evidence

- Diff `a93fec75..HEAD` read whole: 8 files, +95/-11 (tests/verify.test.ts +85, src/verify.ts +3/-4, four SKILL.md +4/-4, checks.md +4/-4... 2 each, src/AREA.md 1 line).
- src/verify.ts: `noTestNames` deleted; head guard is `names.includes('(log gone)')`; `(no test name)` flows into `names.every(name => baseNames.includes(name))`. Marker semantics traced in src/flaky.ts: `failedTests` returns `['(log gone)']` or `['(no test name)']` alone, never mixed with real names. Only `requireGreenReceipt` and the `--known-red` CLI call `knownRedReceipt`; `transition`, `recordTested`, `batchCheck`, `landGates`, `batchPush`, direct-guards all inherit the one function. No other function changed.
- AREA.md path check: all 34 paths named by src/AREA.md exist on disk (single shell listing).
- Repo sweep for stale claims: `grep -rn "no test name|names no test|names no failed test|(log gone)" docs/ README.md skills/ src/` — only the new rule text remains; `docs/reference/commands.md`'s `--known-red` summary ("show the same tests already fail there") is not a claim that a nameless red is uncovered.
- Proofs on head 63526537: `check nameless-cover: 0`, `check linked-pair: 0`, `check changed-tests-1/2/3: 0` (65 pass each), `akrogon verify` green (`verify leaf 63526537: green`, 1151 tests + format + typecheck).
- Report at implementation/report.md records every command, commits and no paid/live use; consistent with the leaf's `check-*.log` files.
- Test-Change trailer on d534acd5 names tests/verify.test.ts; branch holds no issues/ files; worktree clean; three worker worktrees removed.

## Criteria check

1. Nameless leaf pair: real CLI `verify --known-red` prints `verify known-red <sha>: pass`, exit 0, linked base run at merge-base, `phase ... check.review` accepted — proven by the new leaf test. Merge scope: nameless member covered, `requireGreenReceipt` resolves — proven by the new member test.
2. Preserved refusals: linked-pair covers nameless-vs-named, gone head log, named-vs-nameless (new), gone base log (new), wrong command, unended, bad setup, green base entry, plus named cover; CLI refusal between different named failures kept.
3. All four skill paragraphs state the judgment rule and the blocked exception; none says only a real test name can make judgment agree or "fixed first" without exception.
4. checks.md `## Known red`, its fail row and src/AREA.md state the changed command rule; no "always uncovered" survives.

## Findings

None. No Fix, no Nit.

## Verdict

ready
