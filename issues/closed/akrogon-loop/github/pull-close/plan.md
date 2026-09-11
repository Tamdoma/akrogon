# Plan: pull-close

Implement a complete GitHub issue mirror from each registered checkout's origin, and close source issues when the existing completion transition moves their owner folder to closed. This plan integrates both positions and the single rebuttal round without changing the locked scope.

## Read first

- This leaf's `brief.md` and `design.md` in the authoritative registered checkout.
- `learnings/LESSONS.md`. Its relevant evidence concerns executable command verification and preserving external-error context.
- `src/akrogon.ts`, `src/config.ts`, `src/shell.ts`, and `src/state.ts` for CLI parsing, authoritative repo resolution, process errors, schemas, and locks.
- `src/phase.ts`, `src/next.ts`, and `src/log.ts` for owner completion, recovery, worktree removal, and committed-state logging.
- `tests/helpers.ts`, `tests/phase.test.ts`, `tests/next.test.ts`, and `tests/fake-herdr.ts` for real-process fixtures and substituted external commands.
- `plugin/herdr-plugin.toml` and `plugin/next.sh` for startup declarations.

Effective config has `grounding: none`, so there is no configured index. Existing command interfaces, optional sources, and seed gitignore support are present. No additional prerequisite or ordering dependency is needed beyond this leaf's existing state. Implement with the configured subagent workflow when the implementation phase is dispatched.

## Decisions and interfaces

D1. Add `pullCommand(all: boolean): Promise<void>` in `src/pull.ts` and wire `pull` into `src/akrogon.ts`. Accept only optional boolean `--all` and no positional arguments. Current-repo mode uses `requireRepo`, including invocation from a worktree. All mode processes every global registration, including loading it inside the per-repo failure boundary. Attempt later repos after failures and finish nonzero with failed repo names and original error context.

D2. Intake uses literal `git remote get-url origin` in the registered checkout. The configured remote is only the merge target. Parse HTTPS, SCP SSH, and SSH URL forms for github.com into owner/repo. Missing, malformed, and non-GitHub origins fail visibly. Explicitly address github.com and the resolved repository in gh calls so ambient gh target settings do not redirect requests. No new config key.

D3. Use `gh api --hostname github.com repos/<owner>/<repo>/issues?state=open&per_page=100 --paginate --slurp` through existing shell execution with one retry and warnings on external command failure. Installed gh help confirms these pagination flags. Parse the complete successful JSON response with a boundary schema, flatten pages, and exclude entries with `pull_request`. Validate positive issue numbers, title, nullable body, and issue URL. Treat null body as the API's permitted empty-body state. No filesystem mutation occurs until command completion and full validation. JSON/schema errors include raw response context. Do not use a fixed listing cap.

D4. `pullRepo(repo: Repo): Promise<void>` uses `withRepoLock` across listing and reconciliation. Fetching outside the lock permits an older delayed result to overwrite a newer mirror after both writes are serialized. Whole-operation serialization avoids that race with the existing lock and no generation store. Number is identity. Render heading/title, canonical `owner/repo#n`, URL, and the unmodified non-null body into each seed. Normalize slug to lowercase ASCII letters/digits separated by hyphens, trim separators, bound to 100 characters and trim again, and use `issue` when empty. Write desired files before removing obsolete numbered seed paths. Retitles, duplicate old paths, and absent numbers leave exactly one desired file per open issue. Empty successful listing removes all numbered seeds. Leave other files alone. No transaction directory or registry.

D5. Change `completeOwner` to `Promise<void>` and await it in `commitMove`, `phaseCommand`, and `next`'s recovery branch. Preserve owner selection and issue completion reporting: an unfinished epic remains open, and its final transition moves the entire epic. Rename first, then invoke `closeSources(repo: Repo, leaf: Leaf, destination: string): Promise<void>` while existing locks remain held. Read every leaf under destination, flatten optional sources, and deduplicate references. A source-free owner makes no gh call and needs no extra commit lookup. For sourced owners use the triggering leaf's worktree HEAD once for every comment in that move. Never substitute the registered checkout HEAD. Missing required worktree/commit context is a visible post-move failure. Completion must finish before next removes the worktree.

D6. Parse each `owner/repo#n` source at the closure boundary. Check `gh issue view -R owner/repo n --json state`, validate OPEN/CLOSED, skip CLOSED, and on the first OPEN attempt run `gh issue close -R owner/repo n --comment "merged <commit>"`. Target github.com consistently with D2. Retry once after an external command failure, with a fresh state check and structured warning. If the retry still sees OPEN, fetch all comments with `gh api --hostname github.com repos/<owner>/<repo>/issues/<n>/comments?per_page=100 --paginate --slurp` and validate their bodies. When an exact `merged <commit>` comment already exists, close without --comment. Otherwise repeat the commented close. This accounts for gh posting a comment successfully before its separate close mutation fails. Failed or invalid state/comment reads never authorize a close or imply comment absence. Keep two total attempts, no independent nested retry or durable local state. Isolate malformed sources and final command failures, print contextual errors, continue remaining valid sources, then raise an aggregate error for nonzero exit. Preserve argv, source, cwd, stdout, stderr, and exit status where available. Do not swallow unrelated programming errors. Keep the rename and merged state intact, and preserve `commitMove`'s finally logging.

D7. Add `plugin/pull.sh` matching the existing wrapper style and a startup entry invoking it with `--all` above next's entry. Keep pane-event hooks unchanged. Test the parsed declaration and wrapper command, not incidental text. Reuse the shell process boundary and existing test conventions, adding `tests/fake-gh.ts` rather than a new client framework. Keep the startup assertion in `tests/pull.test.ts`.

## Acceptance criteria

A1. A real CLI invocation against a temp registered repo with substituted paginated gh output adds and updates seeds, removes an absent issue, retitles without duplicate files, excludes pull requests, preserves original body text, and is stable when repeated. Include an empty successful listing, null body, punctuation/non-ASCII-only titles, and a long title. Assert files stay inside seeds and filenames remain valid.

A2. Partial output followed by nonzero gh exit on both attempts, malformed JSON, and invalid successful payloads leave the mirror byte-identical. Verify the warning/retry behavior through calls and exits. Concurrent pulls serialize across listing and reconciliation and leave the later serialized result, with no mixed-title duplicate or missing seed.

A3. Missing and non-GitHub origin fail, supported GitHub origin forms resolve correctly, and a configured merge remote different from origin does not change intake. Worktree invocation updates the registered checkout. An all-repo fixture puts a bad registration or origin before a healthy repo and proves later mirroring, nonzero exit, and named failures. Assert explicit gh targets.

A4. A sourced standalone issue and an epic fixture close only on actual owner movement. The epic includes an issue-owned source, repeated epic-owned sources, and a leaf without sources. Completing an earlier issue does not close sources while the epic remains open. Final movement closes each distinct open source once. Every comment contains the same triggering leaf commit, made distinct from the registered checkout and other leaf commits in the fixture.

A5. Prove comment-posted/close-failed retry leaves one comment, including a match on a later comment page, absent-comment retry still posts, and failed or malformed comment reads authorize no close. Prove already-closed skip, first-attempt failure then success, a remotely applied close whose response fails followed by CLOSED on recheck, exhausted failure continuing to later sources, and malformed source continuing to valid sources. Final failure exits nonzero after the move with merged state retained and logging attempted. Repeating merged makes no more gh calls. Source-free completion still passes existing fixtures.

A6. In fake gh, inspect the closed folder and probe the relocated issue `.lock` with nonblocking flock to prove close runs after rename with the lock held. Preserve existing failed-rename recovery. Add sourced recovery through next with fake herdr, proving the worktree remains available until closure finishes. Missing worktree context produces no comment with a fabricated commit.

A7. Parsed startup declarations place pull --all before next --all, with wrappers executing the corresponding commands. Routine tests use temporary global config, real files/processes, fake gh, and fake herdr. Never contact real GitHub issues, operator panes, or the herdr socket.

## Ordered implementation checklist

- [x] E1. Add the narrowly scoped fake-gh fixture support and `src/pull.ts` mirror functions, then wire CLI parsing in `src/akrogon.ts`. Implement `tests/pull.test.ts` scenarios for A1–A3. Use existing shell helpers and schema dependency. Verify with `bun test tests/pull.test.ts`.
- [x] E2. Add source closure and awaited completion integration in `src/pull.ts`, `src/phase.ts`, and the necessary `src/next.ts` caller. Extend `tests/phase.test.ts` and the existing next test file where its recovery scenario belongs for A4–A6. Reuse fake-gh support. Verify with `bun test tests/phase.test.ts tests/next.test.ts`.
- [x] E3. Add `plugin/pull.sh`, update the manifest, and add A7's shape assertion to `tests/pull.test.ts`. Run the focused pull suite again because the test file changed.
- [x] E4. Run configured `bun run format`, inspect `git --no-pager diff` for unrelated formatting changes, then `bun run typecheck` and `bun test`. Retain only requested implementation changes. Save invocation outputs and exit results under this leaf's `implementation/` as completion evidence, including the real temp-repo CLI scenarios exercised by the tests. Do not infer live GitHub closure from substituted tests.

The ordered checklist reflects shared fixture and integration needs inside this implementation, not a new leaf dependency. No changes to seed-issue, chart consolidation, broadcast, init, general dispatch locking, or adjacent documentation.

## Remaining limitations

R1. GitHub can change during pagination. Full pagination removes fixed-cap truncation but does not provide an external transactional snapshot. A later pull reconciles changes.

R2. A crash after rename but before close, or exhausted close retries, can leave a locally completed owner with open GitHub sources. Closed-local transitions are not replayed. Sources remain as evidence and failures are visible. Eliminating that gap would require durable retry state outside this scope. An external actor racing between state check and close is also outside local lock control.

R3. Fetching under the existing repo lock and closing under completion locks can delay dispatch during GitHub latency. This is the chosen cost of serialized operations without another lock or generation mechanism.
