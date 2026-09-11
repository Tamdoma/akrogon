# Brief: repo-cap

## What
`issues/config.yaml` accepts an optional `max_active` positive integer. Dispatch opens a new tab for a leaf only when the machine-wide count is under the global `max_active` and, when the leaf's repo sets the key, that repo's own count of non-merged leaves with live tabs is under its value. A repo without the key has no repo limit. `akrogon config` prints the key when set. The guide pages that describe the cap state the two-level rule.

## Why
`sweepAll` serves repos in registration order and `allocate` checks only the machine total, so the first registered repo with eligible leaves can take every seat and a second repo never starts. The operator runs two repos on one machine and wants a share per repo without giving up the machine ceiling.

## Done-criteria
1. `repoSchema` in `src/config.ts` accepts `max_active` as an optional positive integer and rejects zero, negatives and non-integers; `bun test tests/config.test.ts` covers both.
2. With global `max_active: 3`, repo A `max_active: 1` and three eligible leaves in A, `akrogon next --all` opens one tab for A; a second registered repo B without the key then gets the remaining seats. Covered in `tests/next.test.ts` with the existing two-repo fixture pattern.
3. With global `max_active: 1` and repo A `max_active: 2`, only one tab opens. Covered by test.
4. A leaf whose tab already exists is not refused by the repo cap, matching the existing global behavior. Covered by test.
5. Unreadable inventory in a repo counts against that repo's own cap by the resolved rule in the design. Covered by test.
6. `akrogon config` output includes the repo `max_active` line when the repo sets it and omits it otherwise.
7. `docs/guide/install.html`, `limits.html`, `next.html`, `in-practice.html`, `cheat.html` and `setup.html` describe the cap as machine ceiling plus optional repo share, with `setup.html` showing the key in the repo config example.
8. `bun run format`, `bun run typecheck`, `bun test` pass.
