# Direct report: next-same-work

Base 0cca2f6949675de132aa24528413a5f1b1016271, head b92ad6f1 (worktree /home/ivan/.akrogon/worktrees/akrogon/next-same-work, branch next-same-work).

## Changed files

- tests/next.test.ts (commit 0c117986, Test-Change trailer citing operator 1a): flipped "refuses an issue and its same-name leaf" to "same-work name starts an issue and its only same-name leaf once"; added epic/only-issue start, sibling refusal, unreadable-sibling refusal.
- src/next.ts `resolveName` (b92ad6f1): matches collapse when every match's sorted leaf-path set is equal and no unreadable/unknown inventory entry sits under a matched owner; otherwise today's refusal.
- docs/guide/parts.md (b92ad6f1): same-name single-leaf issue starts by bare name; path needed once a second or unreadable leaf exists.

## Proof

| Criterion | Evidence | Commit | Result |
|---|---|---|---|
| 1 issue + only same-name leaf starts once | same-work name starts an issue and its only same-name leaf once | red on 0c117986 (check-red-first-1792565665495-104235.log), green on b92ad6f1 | pass |
| 2 epic + only same-name issue starts once | same-work name starts an epic and its only same-name issue once | red on 0c117986, green on b92ad6f1 | pass |
| 3 differing sets refuse, no Herdr call | ambiguous name refuses: sibling, epic+same-name issue, owner+unrelated leaf, two same-name issues | b92ad6f1 | pass |
| 4 unreadable leaf under owner refuses | ambiguous name refuses a same-name pair when the issue holds an unreadable leaf | b92ad6f1 | pass |
| 5 cwd folder keeps path meaning | existing folder shadows a same-named owner or leaf (unchanged) | b92ad6f1 | pass |
| 6 guide | docs/guide/parts.md folder section | b92ad6f1 | written |

- `bun test tests/next.test.ts --timeout=30000`: 247 pass, 0 fail (check-next-tests-1792565777660-148516.log).
- `bun run typecheck`: exit 0 (check-typecheck-1792565779679-313135.log).

## Known limitations

- Pre-existing prettier drift in src/next.ts `sweep` (`const ordered` chain) on base 0cca2f69; `prettier --check src/next.ts` warns on the base before this change. Left untouched; the configured format check will be judged at landing under known-red.
- Full `akrogon verify` runs at landing.

## Landing round 1

- Rebase onto origin/main 0cca2f69: already up to date, head b92ad6f1.
- `akrogon verify --holder <chart>/direct` red twice on b92ad6f1: format exit 1 (`[warn] src/next.ts`), test 1105 pass, typecheck 0 (check-format-1792565987827-338293.log, check-format-1792566149447-793092.log).
- `--known-red`: base 0cca2f69 format also red on src/next.ts (check-format-1792566303139-1245564.log); verdict fail because a format failure carries no test names. Judgment: cause is base drift from 0cca2f69 `add issues` (sweep `const ordered` chain), not this diff. Blocking under the direct landing rule.
- Repair: `prettier --write src/next.ts`, formatter output only for that block, committed as style(next).
