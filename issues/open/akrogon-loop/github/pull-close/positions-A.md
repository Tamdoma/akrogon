# Position A: pull-close

Written from brief.md, design.md and the live checkout at ab36dd0. Peer position not read.

## Recommendation

One new module `src/pull.ts`, one `gh` wrapper in `src/shell.ts` shaped like the existing `herdr` wrapper, one close loop appended to `completeOwner` in `src/phase.ts` right after the rename, one `pull` verb in `src/akrogon.ts`, one `[[startup]]` entry in `plugin/herdr-plugin.toml`. Tests substitute `gh` the way `tests/next.test.ts` substitutes `herdr`: a `tests/fake-gh.ts` symlinked as `gh` on a prepended `PATH`, driven by a JSON file named in `FAKE_GH`. No new config key, no new state field (`sources` already exists in `stateSchema`), no gitignore change (`issues/seeds/` is already written by `init` and present in the tool repo's .gitignore).

## Concrete changes

### C1 `src/shell.ts`: gh boundary

- `export async function gh<T>(args: string[], schema: z.ZodType<T>): Promise<T>` runs `command(['gh', ...args])` and parses stdout with the schema. Same shape as `herdr`, no `{result}` envelope because `gh --json` prints the value directly.
- Close and view calls go through `retryCommand(['gh', ...], cwd)` for the required single retry. `retryCommand` already exists and already prints the warning line.

### C2 `src/pull.ts`: mirror one repo

- `githubRepo(repo)`: `git remote get-url <repo.config.remote>` in `repo.root`, parsed by one regex over the three GitHub URL forms (`https://github.com/o/r[.git]`, `git@github.com:o/r[.git]`, `ssh://git@github.com/o/r[.git]`) to `owner/repo`. A missing remote makes `git` exit non-zero, which `command` raises as `CommandError` with the git stderr. A non-matching URL throws `Error` naming the repo and the URL. Both are the visible failure of criterion 2. The brief says "origin". The configured `remote` key defaults to `origin` and is the checkout's merge target everywhere else, so the same key is read here. Any peer wording preference on this is not a fork.
- `listOpen(target)`: `gh issue list -R <target> --state open --limit 1000 --json number,title,body,url` parsed by a zod array schema. The listing is one process; a non-zero exit throws before any file is touched, which gives criterion 1's "fails part-way deletes nothing" for free. The limit is fixed high because `gh` defaults to 30 and pagination does not exist on `issue list`.
- `seedSlug(title)`: lowercase, every run of non `[a-z0-9]` to `-`, trim leading and trailing `-`. An empty result becomes `issue`, so every file keeps the one shape `<number>-<slug>.md`. Number is the identity, the slug is decoration.
- `pullRepo(repo)`: after a successful listing, compute the wanted map `number -> filename`. Then `mkdirSync(issues/seeds)`, write every wanted file (title as `# ` heading, url line, blank line, body verbatim), then delete every entry in the folder whose name is not in the wanted set. Renaming a retitled issue is write-new then delete-old, which is the same observable as a rename and needs no second code path. Files in the folder that do not match `^\d+-.*\.md$` are deleted too, since the folder is a derived mirror by design. Print one line per repo: `pulled <repo> <count>`.
- `pullCommand(all: boolean)`: without `--all`, `requireRepo(readGlobal(), process.cwd())` then `pullRepo`. With `--all`, `readRepo(name, path)` for every entry of `global.repos`, `pullRepo` each inside one targeted catch that records `{repo, error}` and continues, then after the loop throw `Error('pull failed: a, b')` when the list is non-empty. This is the one catch the brief asks for, and it re-raises with names, so it is not swallowed. No lock around `pull`: nothing else in the command reads or writes `issues/seeds/`, files are written whole, and the design says the folder can be rebuilt at any time.

### C3 `src/phase.ts`: close in the merged transition

- `completeOwner` becomes async and, after `renameSync(owner, destination)`, runs `closeSources(repo, leaf, destination)`. Both callers already sit in the leaf and issue locks (`withLeafLocks` in `phaseCommand`), so "inside the issue lock" holds without new locking. `commitMove` and `phaseCommand` await it.
- `closeSources`: `head = command(['git','rev-parse','HEAD'], leaf.state.worktree ?? repo.root)`, the same expression `logMove` uses, so the comment commit equals the logged `head`. Worktrees are never removed by the command (`src/next.ts` only adds them), so the head is readable at `merged` and on the retry path. Then for every leaf from `leavesUnder(destination)`, for every entry of `state.sources ?? []`: parse `owner/repo#n` with one regex (a malformed entry throws naming the leaf; a follow-up outside this leaf could tighten `sources` in `stateSchema` to that regex). Then `gh issue view -R owner/repo n --json state` through `retryCommand`; skip when `CLOSED`; else `gh issue close -R owner/repo n --comment "merged <head>"` through `retryCommand`.
- Failure policy: each source is attempted, each failure is printed to stderr as one JSON line (`{closing: 'owner/repo#n', ...result}`), and after the loop a single `Error` naming the failed sources is thrown. The rename is done, the state is `merged`, and `commitMove`'s `finally` still appends the log line, so the exit code is non-zero exactly like the existing "log append failed after state committed" path. A repeated `phase merged` returns early from `completeOwner` because the leaf is under `issues/closed`, so nothing double-comments, which is the repeat-safety line from the design. The operator closes the survivor by hand, or the next `pull` shows it still open.
- Leaves without `sources` contribute nothing (`?? []`). Leaves already `merged` under an epic whose earlier issue moved first are not re-walked because the earlier move already left `issues/open`.

### C4 `src/akrogon.ts`

- `verb === 'pull'` gets `{ all: { type: 'boolean' } }`, positionals must be empty, dispatch to `pullCommand(values.all === true)`. Usage line lists `pull`.

### C5 `plugin/herdr-plugin.toml` and `plugin/pull.sh`

- A second `[[startup]]` table placed above the existing one, `command = ["sh", "pull.sh", "--all"]`, with `plugin/pull.sh` mirroring `next.sh` (`exec akrogon pull "$@"`). Two files rather than generalizing `next.sh` into a verb dispatcher, so `next.sh` is untouched.

### C6 Tests

- `tests/fake-gh.ts`: reads `FAKE_GH` JSON `{issues: [{number,title,body,url}], failList: boolean, closed: number[], failClose: number}`, appends every argv to `FAKE_GH.calls`, answers `issue list` (or exits 1 when `failList`), `issue view --json state` (`OPEN` or `CLOSED` from `closed`), `issue close` (records, or exits 1 while `failClose > 0` and decrements so a retry can succeed or keep failing). Any other argv throws, like `fake-herdr`.
- `tests/pull.test.ts`, criterion 1 and 2: fixture repo gets `git remote add origin https://github.com/o/r.git`. First pull writes `1-first.md` and `2-second.md`. Second pull with issue 1 gone and issue 2 retitled leaves exactly `2-new-title.md`. Third pull with `failList` leaves the folder byte-identical and exits non-zero. A second registered repo with `origin https://example.com/x.git`: plain `pull` from it exits non-zero, `pull --all` writes the GitHub repo's seeds, exits non-zero, and names `second` in stderr.
- `tests/phase.test.ts`, criterion 3, one new test: epic with `first/one` (`sources: ['o/r#1']`), `second/two` (`sources: ['o/r#2', 'o/r#3']`), `second/three` (no `sources`), issue 3 pre-closed in the fake, issue 2 set to fail twice. Merge all. Assert the `.calls` file shows a `close` for 1 with `--comment "merged <sha>"` where sha equals `git rev-parse HEAD` of the fixture, a `view` and no `close` for 3, two `close` attempts for 2, non-zero exit for that transition, and the epic folder under `issues/closed`. Also assert repeating `phase merged` adds no gh call.
- Criterion 4 file-shape test goes in a new `tests/plugin.test.ts`: parse `plugin/herdr-plugin.toml` with `Bun.TOML.parse`, assert the `startup` array's command values contain `pull` at a lower index than `next`. This is a fixed reference, not wording.

## Risks

- R1 herdr startup ordering: the manifest order is the only contract we control. If herdr runs startup entries concurrently, `next --all` may start before seeds land. Nothing in `next` reads seeds, so the race costs nothing today. Not verifiable without the herdr socket, which tests never touch.
- R2 `gh issue list --limit 1000` silently truncates a repo with more than 1000 open issues, and the mirror would then delete real seeds. Accepted for these repos; a `--limit` above the count is the only `gh` lever. Noted as the open limitation.
- R3 The close error after a committed move exits non-zero from `phase merged`. The merge skill running `akrogon phase <slug> merged` sees a failure it cannot fix. That is the brief's "failure printed, never reversing the move", and the skill footer should say merged-with-close-failure rather than retry.
- R4 `completeOwner` becoming async touches the retry path in `phaseCommand` and the existing race test for epic completion; the tests are real processes so any ordering slip surfaces there.
- R5 `pull --all` on machine startup fails non-zero every time one registered repo lacks a GitHub origin. That is the requested behavior; herdr's handling of a failing startup hook is outside this leaf.

## Simpler alternative

Skip the `view` state check and rely on `gh issue close` on an already closed issue. Rejected: `gh` exits 0 with a message for a closed issue in some versions and posts the comment in others, so the state check is what makes a repeated transition never double-comment, which the design locks.

Second alternative: put the close in the merge skill after push. Foreclosed by the design (closure is the command's).

## Acceptance evidence

- `bun test` passes with the three new test files and the extended `phase.test.ts`, run in the worktree.
- `bun run typecheck` and `bun run format` clean.
- `akrogon pull` in the tool checkout against the real origin `Tamdoma/akrogon` writes `issues/seeds/` files, one per open issue, and `git status` shows nothing tracked from it. Read-only against GitHub, so allowed as a live proof once; the close path is proven only by the fake.
- Manual check of `plugin/herdr-plugin.toml` shows the pull entry above the next entry.
