# Slot B position

Recommend a fully fetched mirror reconciliation per registered repo, plus an awaited source-close operation immediately after the existing owner rename. Reuse the command's locks and shell boundary. No new configuration, registry, or dependency.

## Grounding

Read-first: this leaf's `brief.md` and `design.md`, `learnings/LESSONS.md`, `src/akrogon.ts`, `src/config.ts`, `src/shell.ts`, `src/state.ts`, `src/phase.ts`, `src/next.ts`, `tests/helpers.ts`, `tests/phase.test.ts`, and `plugin/herdr-plugin.toml`.

F1. Effective config specifies `grounding: none` and `rebuttal: true`. There is no configured index to read. The brief and design were read from the registered checkout, and live code from the worktree. No slot A position or synthesis artifact was read.

F2. Pull is absent. `stateSchema` already accepts optional sources, and init already ignores seeds. The CLI needs pull dispatch and `--all` support. Existing shell helpers preserve process context and support one retry.

F3. `completeOwner` currently renames synchronously. Its callers in `commitMove`, `phaseCommand`, and `next` already hold the issue lock. Making completion async requires awaiting all three callers, including recovery before worktree cleanup. That small `src/next.ts` edit is necessary integration beyond the ownership shorthand.

F4. Installed `gh api --help`, inspected in the earlier B pass, confirms `--paginate --slurp` fetches pages into an outer array. GitHub's [issues endpoint documentation](https://docs.github.com/en/rest/issues/issues#list-repository-issues) identifies pull requests by `pull_request`. Exclude those entries. The lessons point toward executable command scenarios and preserving raw external-error evidence.

## Concrete changes

D1. Add `pull` with zero positional arguments and boolean `--all` to `src/akrogon.ts`. Resolve a current invocation through `requireRepo`, including worktree invocations. For all repos, load each registration inside its own failure boundary so a bad registration does not prevent later repos from running. Finish nonzero naming failed repos and preserving their error context.

D2. Implement pull in `src/pull.ts`. Read the registered checkout's actual origin, independent of its merge remote. Parse GitHub HTTPS, SCP SSH, and SSH URL forms into owner/repo. Reject missing origins, other hosts, and malformed paths visibly. Explicitly target github.com and that owner/repo so ambient gh repository settings do not redirect intake.

D3. Fetch `gh api --hostname github.com repos/<owner>/<repo>/issues?state=open&per_page=100 --paginate --slurp` through the existing shell boundary with one retry. Wait for full successful process completion, parse and validate the complete payload once, then flatten pages and exclude pull requests. Do not mutate the mirror on command, JSON, or schema failure. Include raw output in parse-failure context.

D4. Hold the existing repo lock across fetch and reconciliation to serialize concurrent pulls. Number is identity. Render title, canonical `owner/repo#n`, URL, and original body into `<number>-<slug>.md`. Use a bounded filename-safe title slug with a deterministic definition for titles having no usable characters. Write current contents and remove obsolete numbered seed paths only after successful listing and validation. Retitles and duplicate old paths leave exactly one file per number. An empty successful listing removes numbered seeds. Leave unrelated files alone.

D5. Make `completeOwner` async and await every caller. Preserve existing completion checks, issue reporting, and rename recovery. Gather sources from all leaves of the folder actually being moved, deduplicate references, and let missing sources contribute nothing. After successful rename, close sources while locks remain held. Use the triggering leaf's worktree HEAD for every comment, not the registered checkout HEAD or individual source-bearing leaves. Only sourced owners require this commit lookup. Perform it before subsequent worktree removal.

D6. Parse each source reference at the boundary into owner/repo and positive number. Check `gh issue view -R owner/repo n --json state`, skip CLOSED, otherwise run `gh issue close -R owner/repo n --comment "merged <commit>"`. Retry the check-and-close operation once on external failure, warning with structured process context. Recheck state before retrying close so an operation that succeeded remotely but lost its response does not add another comment. Report final failure and continue remaining sources. Source parsing, commit lookup, or GitHub failures must not reverse or prevent the completed folder move. Keep these explicit failure boundaries narrow and preserve filesystem move errors.

D7. Add the pull startup declaration before the existing next startup entry in `plugin/herdr-plugin.toml`. Preserve event behavior. Put the declaration-shape assertion in `tests/pull.test.ts`. Keep seed-issue, chart consolidation, broadcast, and init outside this implementation.

## Acceptance evidence

A1. Command-level pull tests use temp repos, AKROGON_HOME, and a fake gh executable at the shell process boundary. A multi-page fixture adds seeds, updates bodies, removes an absent issue, retitles without duplicates, excludes pull requests, and is stable on repetition. Include an empty successful list and title edge cases. Partial stdout followed by failure on both attempts, malformed JSON, and invalid response shape leave seed bytes unchanged.

A2. Exercise missing and non-GitHub origins, supported origin forms, and worktree invocation. An all-repo fixture puts a failing repo before a healthy one and proves the latter mirrors while overall exit is nonzero and names the failure. Assert explicit gh targets.

A3. Extend phase tests with an epic containing issue-owned sources, duplicated epic-owned sources, and a leaf without sources. Completing the first issue makes no close call while the epic remains open. The final leaf moves the epic and closes each unique open source with its distinct worktree commit. Cover already closed, retry success, remote success reported as failure, exhausted retry continuing to another source, and repeated merged refusal without more comments.

A4. During fake gh execution, inspect the closed folder and attempt nonblocking flock on the relocated issue lock. Assert the move happened and the lock is held. Preserve existing rename-failure recovery and add sourced recovery through next with substituted herdr, verifying completion is awaited before cleanup.

A5. Assert startup declaration ordering, then run `bun test tests/pull.test.ts tests/phase.test.ts`, `bun run format`, `bun run typecheck`, and `bun test`. Inspect formatter changes for scope. Record exit results and command-fixture output under the leaf as implementation evidence. Assert state, files, arguments, and exits rather than incidental prose.

## Risks and simpler alternative

R1. A fixed-limit issue listing cannot justify deletion. Complete pagination removes that limit without another store. GitHub pagination still is not a transactional snapshot when issues change mid-fetch. A later pull reconciles that external race.

R2. A crash between rename and close, or exhausted close retries, leaves a closed local owner with an open GitHub source. The locked design has no durable close queue or replay after local closure. Preserve sources and report failures without adding a journal or reopening the owner.

R3. GitHub latency extends existing enclosing lock duration. That follows the explicit under-lock contract. Do not redesign dispatch locking in this leaf.

The simpler acceptable implementation keeps the pull and source-close helpers in `src/pull.ts`, using existing config/state/shell utilities. A separate client framework, staging transaction, ownership field, or import registry is unnecessary. Existing command interfaces are present, so no additional execution-order dependency is needed.
