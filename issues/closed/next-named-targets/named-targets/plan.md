# Plan: named-targets

Scope: bare epic/issue names for `akrogon next` with path-shadow precedence and ambiguity refusal. `debate: no`, so this synthesis derives directly from the brief and locked design. Design wins on any conflict; none found.

## Decisions

- D1 (path shadow first): the existing `existsSync(folder)` directory check stays the first branch in `selectLeaves` (`src/next.ts:1172-1176`). Only inputs that do not exist from cwd enter name resolution. A same-named local folder keeps today's path selection (criterion 3). No change to the `Invalid target` file check.
- D2 (open owners from leaf paths only): owner candidates derive from discovered open leaf paths, never from directory scan or ISSUE.md/EPIC.md. For each open leaf, `relative(issues/open, leaf.path)` split gives depth 2 `[issue, leaf]` → issue candidate `issues/open/<issue>`, or depth 3 `[epic, issue, leaf]` → epic candidate `issues/open/<epic>` (kind `epic`) and issue candidate `issues/open/<epic>/<issue>` (kind `issue`). Dedupe by folder path. Closed leaves excluded (criterion 5). Empty folders never candidates (criterion 6).
- D3 (bare names only): owner search runs only when input contains no path separator. Slash inputs that do not exist fall through to today's missing handling. Leaf-slug search stays exact match over `inventory.leaves` (open and closed, criterion 2).
- D4 (one selects, two refuse, zero falls through): one candidate selects its leaves (owner → all open leaves under that folder via `within`; leaf → that leaf). Two or more throw before any lock/herdr/state change, message listing every match with kind (`epic` | `issue` | `leaf`) and repo-relative path, sorted by path for determinism. Wording beyond kind and path is not contract. Zero falls through to today's `unreadable/unknown/foreign → return empty` and `missingLeafMessage` path (`src/next.ts:1197-1203`), preserving read-error and parked-hint behavior (criterion 6).
- D5 (same-name pairs always refuse): issue+leaf with the same name refuse even when they select the same leaves, as do epic+same-name issue, two same-name issues under different epics, and owner+unrelated leaf (criterion 4). No same-leaf-count shortcut.
- D6 (repo identity unchanged): keep the `commonDirectory` resolution on `selection` (cwd for names, `src/next.ts:1177-1189`), so root, subfolder and worktree resolve to the registered root (criterion 1).
- D7 (closed owners): by D2 a closed epic/issue name never matches, so an open same-name owner resolves without ambiguity; the closed folder stays selectable by path through the existing `within` branch over the open+closed inventory (criterion 5).
- D8 (test boundary): proof is CLI `akrogon next` against isolated registered repos (`tests/helpers.ts` fixture + `tests/fake-herdr.ts`), asserting dispatched leaf set via `database(f).prompts`, herdr calls via `calls(f)`, exit codes, and unchanged `state.yaml`/no `worktrees/|.lock|log.jsonl`. Assert refusal, kind+path content and side effects only, never prose wording (learnings 2026-10-01). Each new behavior shows one deliberate break turning its test red. No live herdr run.
- D9 (docs split): this leaf owns target forms and the same-name path example in `docs/guide/parts.md` and the target text in `docs/guide/next.md` only. Report and automatic-silence text in `next.md` belongs to sibling `blocked-report`. README command contract (`[<slug>|<path>|--all|--resume]`) unchanged: one positional still, guide carries the name forms.

## Read-first list

- `issues/open/next-named-targets/named-targets/brief.md`, `design.md` (verbatim locked wording; resolution order and binding tests)
- `src/next.ts:1165-1210` (`Selection`, `selectLeaves` — the only function reshaped)
- `src/next.ts:120-175` (`discover`: open+closed inventory, unreadable/unknown/foreign reporting)
- `src/next.ts:1231-1260` (`nextCommand`: select-before-lock, empty-selection skip, exit code)
- `src/state.ts:146-165` (`missingLeafMessage` with parked hint, `findLeaf`)
- `src/config.ts:157-187` (`expandPath`, `within`, `commonDirectory`)
- `tests/helpers.ts` (`fixture`, `cli`, `leaf`, `fakeHerdr`)
- `tests/fake-herdr.ts` (`prompts`, `starts`, `.calls` log)
- `tests/next.test.ts:1-120` (`dispatchFixture`, `database`, `calls`, `next` helpers; path/slug dispatch patterns) and `:2357-2380` (missing-leaf assertion shape)
- `docs/guide/next.md:1-40` (target forms section to extend), `docs/guide/parts.md` (folder diagram + same-name note site)
- `learnings/LESSONS.md` (2026-10-01 prose-assertion lesson; 2026-09-14 ambiguous-prose-after-rename)

## Needed interfaces

None new. `Selection` (`{ repo, leaves }`) unchanged; a name produces the same `Selection` as its folder path. The owner-candidate helper is internal to `src/next.ts` (input: open leaves + repo root; output: `{ name, kind, path }[]`); the ambiguity error contract is kind + repo-relative path per match, thrown from `selectLeaves` before `withLock`.

## Acceptance criteria (observable, before tests)

- A1: from repo root, a subfolder without a same-named folder, and a leaf worktree, `next <epic>`, `next <nested-issue>`, `next <top-level-issue>` dispatch the same leaf set as `next <repo-relative folder path>` from the root.
- A2: a bare leaf slug dispatches the same leaf as today across open and closed.
- A3: an input that exists as a folder from cwd selects by path even when an owner or leaf elsewhere shares the name.
- A4: each of the four collision shapes exits non-zero, stderr names every match with kind and repo-relative path, and no herdr call, worktree, lock, log or state change occurs.
- A5: a closed owner name does not block an open same-name owner; the closed folder still selects by path.
- A6: names from folders above discoverable leaves resolve without ISSUE.md/EPIC.md; unknown and empty-folder names give today's missing message with parked hint; a name whose only leaves fail to read surfaces the read errors.
- A7: `parts.md` and the target text in `next.md` describe epic, issue and leaf names, the ambiguity refusal, and the folder path for same-name pairs.

## Checklist

### Wave 1 (all three share one wave: disjoint owned paths, no shared test resource, no ordering need; interface locked by D4/D8)

- U1 `src/next.ts` (criteria 1-6)
  - Add the D2 owner-candidate helper and the D4 resolve/one/refuse/fall-through branch inside `selectLeaves`, keeping D1/D6 lines in place.
  - Ambiguity error lists every match as kind + `relative(repo.root, path)`, sorted by path.
  - Owned paths: `src/next.ts`. Shared test resource: none. Lands first: none.
- U2 `tests/next.test.ts` (criteria 1-6)
  - T1 epic + nested-issue + top-level-issue name-vs-path Selection equivalence from root, subfolder and worktree (compare dispatched `prompts` leaf sets; composition proof for leaf-split).
  - T2 bare leaf slug open and closed unchanged.
  - T3 local-folder shadow: same name as owner/leaf elsewhere selects by path.
  - T4 four refusal cases (two same-name issues; epic + same-name issue; issue + same-name leaf with identical leaves; owner + unrelated leaf): non-zero, stderr contains each kind and repo-relative path, `calls(f)` empty, `state.yaml` bytes unchanged, no `issues/worktrees`, `.lock`, `log.jsonl`.
  - T5 closed-owner name ignored for open same-name resolution; closed folder by path still selects.
  - T6 empty-folder and unknown names → `Missing leaf` + parked hint; unreadable leaf under a named issue → read error, not missing; owners resolve without ISSUE.md/EPIC.md.
  - Owned paths: `tests/next.test.ts`. Shared test resource: none (isolated temp repo + fake herdr per test). Lands first: none.
- U3 `docs/guide/parts.md`, `docs/guide/next.md` (criterion 7)
  - `next.md` target section: epic, issue and leaf names as targets, ambiguity refusal, folder path for same-name pairs. `parts.md`: same-name path example by the folder diagram. No report/silence text (sibling owns it).
  - Owned paths: `docs/guide/parts.md`, `docs/guide/next.md`. Shared test resource: none. Lands first: none.

Doc checklist: `docs/guide/next.md` — target forms + ambiguity refusal + same-name folder path. `docs/guide/parts.md` — same-name path example. No agent doc affected (grep: `akrogon next <slug>` skill hits stay valid; README contract and other guide examples unchanged).

## Verification

Per-criterion proof, failure caught, size, rerun trigger. File-scoped runs only; the brief names no whole-suite criterion. `checks` config has no `merge_checks`; none added.

- Criterion 1: `bun test tests/next.test.ts -t "named target equivalence" --timeout=30000` (T1: name-vs-path `prompts` leaf-set equality across root/subfolder/worktree). Catches: wrong repo resolution or owner→leaves mapping. Size: minutes. Rerun: any diff in `src/next.ts` or `tests/next.test.ts`.
- Criterion 2: same file `-t "leaf slug"` (T2 open+closed). Catches: slug regression from the new branch. Size: seconds. Rerun: same files.
- Criterion 3: same file `-t "shadow"` (T3). Catches: name branch stealing path inputs. Size: seconds. Rerun: same files.
- Criterion 4: same file `-t "ambigu"` (T4 ×4 shapes; assert kinds, repo-relative paths, `calls(f)` empty, state bytes + no worktree/lock/log). Catches: missed collision shape, missing match detail, or side effect before refusal. Size: minutes. Rerun: same files.
- Criterion 5: same file `-t "closed owner"` (T5). Catches: closed owners leaking into candidates or closed path broken. Size: seconds. Rerun: same files.
- Criterion 6: same file `-t "empty|unreadable|missing"` (T6). Catches: empty-folder false match, lost parked hint, or read errors masked as missing. Size: seconds. Rerun: same files.
- Criterion 7: `grep -n "epic\|issue.*name\|ambigu\|same-name" docs/guide/next.md docs/guide/parts.md` plus `bun test tests/docs-links.test.ts --timeout=30000`. Catches: missing target form or broken guide link/anchor. Size: seconds. Rerun: any diff in either guide file.
- Break proof (standing design): for each of T1/T3/T4/T6, stash the `src/next.ts` hunk, run its `-t` filter red, restore, run green; record the red hashes in the handoff. Catches: vanity tests.
- Handoff gates: `bun run format`, `bun run typecheck`, `AKROGON_BASE=<base> bun test --changed="$AKROGON_BASE" --timeout=30000`. No whole `bun test` requirement. Not a slow-run leaf: no restart boundaries.

## Credentials and exclusions

Credentials: design names no variable; `akrogon status named-targets` shows no `Missing:` lines — no human-only blocker.

Exclusions held: no change to dispatch, eligibility (`src/turn.ts`), wait reporting, exit codes for waits, `park`/`unpark`, blocked-report text, README contract, or anything under `issues/`. Second leaf to merge resolves overlap in `src/next.ts`, `tests/next.test.ts`, `docs/guide/next.md`.

Open limitation preserved: inputs containing a path separator never enter name search; only bare names resolve as owners, so a nested `epic/issue` form must exist from cwd to select by path.
