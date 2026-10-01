# Slot B position: leaf-temp-dir

## Recommendation

Implement the locked design through the existing allocation placement and merged cleanup paths. Derive the directory instead of recording state. Preserve seat allocation topology and tab-close timing. Credentials, operator actions and execution dependencies: none.

## Read first

- `brief.md` and `design.md` in this leaf folder.
- `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md`, `learnings/LESSONS.md`.
- `src/config.ts`: `readRepo`, `worktreeStore` and existing environment boundaries.
- `src/next.ts`: `allocate`, `closeMergedTab`, `cleanupMerged`, `cleanupRepos`, and the `tab_closed` branch of `nextCommand`.
- `src/state.ts`: the ASCII slug schema.
- `tests/helpers.ts`, `tests/fake-herdr.ts`, `tests/next.test.ts`: fresh allocation, recorded-seat recovery at lines 1784–1814, merged open epic scenarios, and tab-close events.
- Shared context in `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`.
- `docs/guide/merge.md`, `docs/guide/problems.md`, `docs/guide/limits.md`.

No relevant resource is missing. `src/AREA.md` currently does not describe allocation environment variables, so it needs no change.

## Concrete changes

1. **D1: Derive one bounded path.** Export `leafTemp(repo: Repo, slug: string): string` beside `worktreeStore`. Use `/var/tmp/akrogon-${process.getuid()}` and `${slug.slice(0, 20)}-${createHash('sha256').update(repo.root + '\n' + slug).digest('hex').slice(0, 12)}`. `readRepo` already canonicalizes the registered root, and the slug schema guarantees ASCII. The production maximum is 61 bytes for a 10-digit uid. Do not add slug validation, stored state, a uid parameter, or configuration fields.
2. **D2: Isolate command tests through one internal environment seam.** Let `leafTemp` read an undocumented `AKROGON_TEST_TEMP_ROOT` override, parsed once per call as an optional nonblank absolute path. Its absence selects the locked production root. In `tests/helpers.ts`, centralize the fixture value `resolve(f.home, 'leaf-temp')` and supply it through both `cli` and `fakeHerdr(...).env`. The latter covers the two direct subprocess paths in `tests/next.test.ts`, which inherit `f.env` instead of calling `cli`. Other fixture commands also receive the override. Do not derive the root from `TMPDIR`, change the global test process environment, or expose a CLI/config option. A subprocess can clear only this override and replace `process.getuid` to test the production path without creating it.
3. **D3: Ensure privacy on every allocation.** Before constructing `placement`, create the parent and leaf directories with mode 0700. Inspect each with `lstatSync`, require a directory owned by the current uid, and reject symlinks before applying `chmodSync(..., 0o700)` to existing owned directories. Checking filesystem ownership here is required boundary validation. Do not chmod foreign entries. Add `--env`, `TMPDIR=<derived path>` to the existing `placement` array so fresh tab creation and every replacement pane split receive it. Keep bootstrap, recorded-seat selection and split targets unchanged. Run this even when both recorded panes already exist so missing scratch is recreated after expiry.
4. **D4: Share removal, preserve confirmation timing.** Use one removal operation that runs `rmSync(path, { recursive: true, force: true })` followed by `command(['git', 'worktree', 'prune'], repo.root)`. In the `tab_closed` branch, invoke it for a merged owner before dispatching completion/dependents. Catch and report errors with the same Error guard and structured `report` pattern as `cleanupRepos`, without suppressing the existing completion path. Failed owners retain scratch. In `cleanupMerged`, capture whether any pane belongs to the recorded tab before `closeMergedTab`; remove scratch only when none did and the folder exists. Place this before the `issues/open` early return. Absent scratch costs one existence check and no prune call on sweeps. If live panes existed, close the tab as today and retain scratch until its hook or a later sweep. A missing tab id means no pane belongs to that tab. Do not add deletion to the later pane-hook branch.
5. **D5: Update only the named workflow and guide surfaces.** Add one sentence in each of the three skills: temp files, logs and base copies use `$TMPDIR`, never fixed `/tmp/<name>` paths; durable evidence goes in the leaf folder. Update each of the three guide cleanup paragraphs to describe scratch deletion on confirmed merged-tab closure and sweep catch-up, while preserving the existing worktree/branch cleanup distinction. Review other guide cleanup hits for contradiction. No wording assertions or unrelated documentation edits.

## Acceptance evidence

| Criterion | Required proof |
| --- | --- |
| 1 | Extend fresh allocation assertions against fake Herdr's `.calls` file for the adjacent `--env`, `TMPDIR=...` arguments on tab creation and B split. Extend all existing recorded-seat scenarios to check every replacement split while retaining their split-count and split-target assertions. Check leaf and parent modes are 0700 after dispatch. |
| 2 | In an isolated subprocess call the actual `leafTemp` with a 200-character ASCII slug, a long repo root, override absent, and uid 1234567890. Assert byte length at most 62, basename starts with the first 20 slug characters, and two roots produce different paths. No filesystem write. |
| 3 | Create a real detached Git worktree under fixture scratch. Remove the owning merged tab/panes from fake Herdr and emit `tab_closed`. Assert scratch is absent and `git worktree list --porcelain` no longer lists the detached worktree. Repeat the owner scenario in phase `failed` and assert scratch and its sentinel survive. |
| 4 | Exercise bare repository `next` for both open and closed merged records with no live panes. Assert scratch disappears. Keep an unfinished hand-built epic sibling for the open case so the merged leaf stays under `issues/open`. With live panes at sweep start, assert tab close occurred and a scratch sentinel survives, then confirm a later hook or sweep deletes it. |
| 5 | Dispatch once, remove only scratch, retain tab/panes, dispatch again. Assert the same tab and recorded seats remain and scratch is recreated with mode 0700. |
| 6 | Assert actual exported TMPDIR is under the fixture root. Audit helper and direct CLI subprocess environments before the suite run. Test the production path only as a string. All scratch creation/deletion tests use fixture roots removed by `f.clean()`. |
| 7 | Review the three skill sentences and three guide paragraphs for correct behavior and contradictory cleanup prose. No test coupling to exact explanatory wording. |
| 8 | Run `bun test tests/next.test.ts`, then the required `bun run format`, `bun test`, and `bun run typecheck`. Review the diff after formatting for unrelated changes. |

Add consequence-driven refusal coverage for a symlink parent, a non-directory parent and an existing owned directory with permissive mode. Assert no tab creation or replacement split on refusal, and mode correction for the owned directory. These exercise the locked privacy requirement rather than a new policy. Use subprocess-isolated mocking if a foreign-owner case is included, never privileged chown.

## Risks and limitations

- **R1: Prune retry gap in the locked design.** The design promises retry on the next run, but also requires sweeps to skip git when scratch is absent. If removal succeeds and pruning fails, later sweeps see no folder and cannot retry pruning. Another closed-tab event can retry, but its arrival is not guaranteed. Report the failure with full command context. Preserve the explicit sweep guard and document this limitation in synthesis rather than adding state or unconditional sweep pruning without a settled design change. Deletion failures that leave the folder present remain retryable.
- **R2: Immediate close is not confirmation.** Fake Herdr removes panes synchronously on `tab close`, which could make an incorrect after-close check pass. The live-pane test must assert scratch survives that first sweep, proving the decision used the pre-close inventory.
- **R3: Partial fixture isolation.** Updating only `cli` misses `nextAt` and the non-Error discovery subprocess. Supplying the same override in fake Herdr's fixture environment covers both without changing their unrelated behavior. Production-length coverage must not create the production directory.

Existing panes retain their original environment until recreation. The operator's completed seven-day sweep may remove scratch for paused leaves. No rollout migration, age logic, worker cleanup change or tab-close race fix belongs here.

## Simpler alternative

Keep all ownership and deletion logic in `src/next.ts`, use the existing `placement`, and add only the derived-path export and internal fixture override in `src/config.ts`. A new temp module, stored directory field, injectable allocation interface or configurable root would add moving parts without meeting another criterion. In-process module mocking alone cannot isolate the existing spawned CLI scenarios, so the single environment seam is the smaller reliable choice.

## Evidence from this planning pass

- `bun test tests/next.test.ts -t 'recorded seats stay authoritative|startup retains a merged leaf.s worktree and branch while closing its tab'`: 6 passed, 0 failed, 55 assertions, 3.04 seconds. This verifies existing topology and open-epic cleanup behavior, not the unimplemented feature.
- A calculation using the locked formula produced 61 bytes for a 200-character slug, a long root and uid 1234567890, with different paths for two roots.
- A real Git fixture registered a detached worktree inside scratch, then scratch removal and `git worktree prune` changed its registration from present to absent. The fixture was removed afterward.
- Live inspection found both recovery splits already use `placement`, cleanup currently returns early for open merged records, and the closed-tab branch currently performs no scratch cleanup.
