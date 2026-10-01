# Brief 2: leaf-temp-dir tests and seam (D2, D8)

## 1. Goal

Wire the internal fixture seam and prove done-criteria C1-C6 with the smallest real-CLI test set. Plan decisions D2, D8. Lands after brief 1.

## 2. Numbered acceptance criteria

1. Fresh allocation carries adjacent `--env TMPDIR=<leaf temp>` on tab create and the B-pane split; every replacement split in the extended missing-seat scenarios carries it with split-count and split-target asserts unchanged; the folder exists with mode 0700 after dispatch. Test names contain `allocation carries TMPDIR`.
2. An isolated subprocess with the override cleared and `getuid` mocked to `1234567890` calls the real `leafTemp` with a 200-character slug and long root: byte length at most 62, basename starts with the slug's first 20 chars, two roots differ. Creates nothing. Test name contains `leaf temp path bounds`.
3. A `tab_closed` event for a merged tab deletes scratch and a detached worktree registered inside it vanishes from `git worktree list --porcelain`; the same event for a failed leaf keeps folder and sentinel. Test names contain `closed tab scratch`.
4. A bare `next` sweep with no live panes deletes a merged folder while still under `issues/open` (kept open by an unfinished hand-built epic sibling) and when closed; with live panes it closes the tab and keeps a sentinel, removed by a later hook or sweep. Test names contain `sweep scratch catch-up`.
5. Dispatch, manual scratch removal with tab and panes kept, then dispatch again keeps the same tab and seats and recreates scratch 0700. Test name contains `recreates missing scratch`.
6. Every created TMPDIR is asserted under the fixture root; `cli`, `fakeHerdr`, and `nextAt` envs carry the override; production path tested as string only. Test name contains `fixture temp root`.
7. Refusal: symlink or non-directory override parent aborts dispatch with no tab create or split (security boundary: writing scratch through an attacker-planted link); existing owned permissive dir is corrected to 0700. Rides with criterion 1.

## 3. Read-first list

- `tests/helpers.ts` (`cli` env merge ~:39-45, `fakeHerdr` ~:75-83)
- `tests/fake-herdr.ts` (`.calls` log is the placement assertion pattern to copy; the fixture ignores `--env`, so assert via `calls()`)
- `tests/next.test.ts` (missing-seat cases ~:1784-1814 to extend; `nextAt` ~:357; merged open-epic and `tab_closed` cases ~:530-680, ~:1880-2060)
- `src/config.ts` (`leafTemp` from brief 1), `src/next.ts` (`placement`, `removeLeafTemp`, branches from brief 1)
- This skill folder's `ponytail.md`
- Open the plan's index only for a gap in this list.

## 4. Change list and needed interfaces

Must land first: brief 1 (src behavior under test). Owns: `tests/helpers.ts`, `tests/next.test.ts`. Shared test resource: none beyond the standard fixture. Consumed output: brief 1's `leafTemp(repo, slug)`, `removeLeafTemp`, placement pair, branch behavior; override contract `AKROGON_LEAF_TEMP_ROOT` (nonblank absolute when set, unset selects production).

Changes:

- `tests/helpers.ts`: centralize `leafTempRoot(f) = resolve(f.home, 'leaf-temp')`; `cli()` defaults `AKROGON_LEAF_TEMP_ROOT` to it when caller env lacks the key; `fakeHerdr().env` includes it. Nothing documented.
- `tests/next.test.ts`: extend the four missing-seat cases in place (add TMPDIR pair asserts on each replacement split; keep every existing assert); add focused cases for criteria 1-6 plus 7 using real fixtures, real git, and fake herdr. Criterion 2 spawns `bun -e` (or a temp script under the fixture) that deletes the override, stubs `process.getuid`, imports `leafTemp` from the worktree `src/config.ts`, and prints JSON asserts without mkdir. Criterion 3 registers a real detached worktree (`git worktree add --detach`) inside scratch. Assert modes with `statSync(p).mode & 0o777`.

## 5. Do-not, reasons and exceptions

- Do not touch `src/`, `skills/`, or `docs/` (briefs 1 and 3 own them); mixing owners causes conflicting picks.
- Do not mock `leafTemp`, `allocate`, or removal; tests need the real unit or they prove nothing.
- Do not assert skill or guide wording; criterion 7 is review-only and prose asserts couple tests to wording.
- Do not create anything under the real `/var/tmp/akrogon-<uid>`; every CLI and direct subprocess inherits the override.
- Do not invent new test files when extending `tests/next.test.ts` fits; one file keeps the fake-herdr patterns together.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

Reasons restated: owners prevent conflicting picks; mocked units prove nothing; wording asserts break on rephrase; real-root writes pollute the operator machine; new files split one pattern. Exception restated: only a revised brief from A authorizes a scope or interface change.

## 6. Ordered steps

1. `tests/helpers.ts` for criterion 6: add the centralized root plus both wirings; verify `nextAt` and the direct discovery subprocess inherit `f.env`.
2. `tests/next.test.ts` missing-seat extension for criterion 1: add TMPDIR asserts in place, keep topology asserts byte-identical.
3. `tests/next.test.ts` for criteria 1 (fresh), 5, 7: allocation, recreate, refusal cases.
4. `tests/next.test.ts` for criteria 2, 3, 4, 6: bounds subprocess, closed-tab pair, sweep cases, fixture-root assert.
5. Run section 7, paste results, commit only this chunk.

Advisory size: about 2 files and under 12 turns.

## 7. Commands

Run in the brief's worktree after `bun install`:

```sh
AKROGON_BASE=88f252f02eb36aacee6dadf6668c303374b692d5 bun test --changed="88f252f02eb36aacee6dadf6668c303374b692d5"
```

This resolved changed-test command only; criterion proof and every `checks` command belong to A.

## 8. Done-when, evidence and report

Done when criteria 1-7 hold with pasted passing output and each criterion links to its test name and line. Scenarios use temp repos, real git, and fake herdr only; no real panes, GitHub, or herdr socket. Name limitations and unverified criteria explicitly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
