# Plan: init-issues

Synthesis by slot B from the locked brief/design. `debate: no`, so there are no positions or rebuttals to integrate.

## Read first

- Authoritative `brief.md` and `design.md` beside this plan, especially Distribution, Config Shape corrections, Index Levels, and Leaf architecture.
- `skills/init-issues/SKILL.md` and the tracked file list under its `payload/` and `scripts/`: replacement and deletion scope.
- `src/akrogon.ts`, `src/init.ts`, `src/config.ts`: existing command arguments, write ownership, effective config and defaults.
- `tests/init.test.ts`, `tests/helpers.ts`: isolated command scenarios and `AKROGON_HOME` setup.
- `learnings/LESSONS.md`: planning resource read. Relevant observations are to exercise real processes and report dangling references outside ownership.

Grounding gap: effective config has `grounding: none`, so no configured top index or linked areas are available. This leaf does not create this tool repo's index, which belongs to retire-old.

## Decisions

- **D1. One skill file owns the workflow.** Replace `skills/init-issues/SKILL.md`, delete its entire `payload/` and `scripts/` trees, and add no replacement helper or permanent test harness. Keep the skill self-contained, under 300 lines, 4k tokens and 20 rule sentences. Review the prose cap semantically, without an exact-word acceptance test. Avoid unconditional must/never rules lacking the design-required exception.
- **D2. Inspect, then propose.** Name the installed `akrogon` command as the dependency. Run `akrogon config` once for the setup pass. Inspect repository manifests, lockfiles, existing command definitions, test files, lint/typecheck configuration and local git metadata. Prefer established commands, preserve existing effective repo choices on repeat setup, and batch only questions inspection cannot settle. Show one concrete proposal. Initialization already requested by the operator does not need a second blanket approval step.
- **D3. Propose the complete current repo shape.** Include `remote` (origin), `default_branch` (main), `worktree_root` (issues/worktrees), `rebuttal` (true), `fix_rounds` (3), `implement` (subagents), discovered `checks`, `advisory` ([]), `grounding.index`, and `broadcast.discord.webhook_env` (propose `[DISCORD_WEBHOOK_URL]` unless existing routing says otherwise). Parentheses give defaults when inspection supplies no better value. Broadcast contains variable names, not secret values. All checks block. Advisory holds only deliberately nonblocking commands. No global-only or retired keys enter the proposal.
- **D4. Test selection follows the installed runner.** Include `checks.test_changed` using literal `$AKROGON_BASE` as the leaf branch point. Use an existing, verified changed-test command when present. If the runner has no supported affected-test command, explicitly propose the full existing test command as conservative coverage while requiring the base variable, for example `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test`. Do not invent runner flags, use the previous worker commit, or silently switch commands. With no tests, propose a language/runner toolkit from effective global toolkits or ask for the unresolved choice, then pass `--toolkit <lang>=<runner>` separately. Do not install a test framework, edit the consumer manifest, migrate an existing suite, or invent a passing test command for an empty suite.
- **D5. Grounding creates at most one document.** Reuse an existing valid top index, including a discovered index when no key exists. If the configured index is absent or names a missing file and no suitable index can be reused, create a small top Markdown index at a suitable repo path and point `grounding.index` there. Each area occupies one line with a link to a real existing entry point or document. No area documents or exhaustive inventory. The top index is the only direct skill-authored repo write outside `issues/`. The temporary proposal is outside the repository and is removed after use.
- **D6. The command owns initialization writes.** Write the proposal to a temporary file, then run `akrogon init --from <file>` with the optional toolkit argument. The skill does not write either config file, gitignore, attributes, packages, scaffolding or scripts itself. Describe command-owned effects accurately, including current lessons scaffolding. Preserve literal shell variables in proposal YAML with a quoted heredoc. Read command results and generated files to verify, without parsing config YAML in the skill or calling `akrogon config` a second time in the same pass. Report failures as failures. The first body lines cover compaction rereading, with brief/plan and phase references only when applicable. This is outside a leaf, calls no phase command, and prints Last operation plus `Next: none` at completion.

## Interfaces and ordering

Existing interfaces are `akrogon config`, `akrogon init --from <file> [--toolkit <lang>=<runner>]`, and the repo schema in `src/config.ts`. No interface or command source change is required. The command leaf's init interface is already present and its focused test passes. No new leaf dependency is required. Leave scheduler state, including its existing dependency, to the command.

## Acceptance criteria

- **C1. Workflow completeness:** A reader can follow the single skill to inspect a repo, resolve only missing choices, produce every D3 key, supply D4 test coverage/toolkit behavior, invoke init, verify the result and stop. Dependency, compaction and outside-leaf behavior are clear. The size and rule budget meet D1.
- **C2. Real initialized repo:** In an isolated git repo with Bun tests and an ESLint script, under a temporary `AKROGON_HOME`, follow the skill and capture the proposal and actual init invocation. The resulting config contains the discovered test/lint commands and a literal-base-aware `test_changed`, repo registration is written by init, and the consumer package manifest is byte-identical. Run the proposed checks, including `test_changed` with the fixture base, and record exit codes.
- **C3. Grounding boundaries:** Exercise both no-index and existing-index scenarios. The first creates only the top index, with real links and the matching proposal path. The second preserves existing document bytes. Attribute gitignore and lessons writes to init, not the skill. Exercise a configured missing index path as an additional inspection case.
- **C4. Toolkit and failure behavior:** A repo without tests gets a separate toolkit proposal/argument and the command records the selection globally. An existing-suite repo gets no toolkit migration. Verify a deliberately failing test makes the proposed check fail, and an unset required base makes `test_changed` fail. Existing init negative coverage verifies invalid proposals fail before changing repo config.
- **C5. Removal and scope:** Both old directories are absent, and a search within `skills/init-issues/` finds no retired script names or references to `scripts_dir`, `sync-payload`, `payload/`, or `issues/.scripts`. No implementation diff outside this skill folder, aside from required leaf artifacts. Broader stale references are reported, not repaired.

## Ordered execution checklist

1. **A1. Rewrite `skills/init-issues/SKILL.md`** using D1–D6. Complete the acceptance-driven prose before deriving verification. Review C1 and ensure examples preserve `$AKROGON_BASE` literally.
2. **A2. Delete `skills/init-issues/payload/` and `skills/init-issues/scripts/`** entirely. Check the tracked file list and run scoped retired-reference searches for C5.
3. **A3. Exercise C2–C4 in disposable fixtures** with real git, Bun, ESLint and the worktree CLI entry `src/akrogon.ts`. If fixture dependencies are needed, declare/install them only in that fixture's package environment. Use an isolated global config with fake harness definitions, with no real panes, harness installs, GitHub or herdr socket. Save a concise transcript, proposal, invocation, output and file-diff evidence under the authoritative leaf, then delete fixture and temporary helpers. Evidence should distinguish skill following from command-owned writes. The checker independently repeats the concrete flow.
4. **A4. Run configured checks and inspect final scope:** `bun run format`, `bun test`, `bun run typecheck`. Record pre-existing failures without expanding this leaf. Inspect `git --no-pager diff --stat` and the skill diff, verify both removed trees, and record command exit codes and evidence paths in the implementation report. No new persistent tests that merely match skill wording.

## Known limitations

- **R1. Prose execution needs an agent review.** Existing init tests validate command behavior, not whether a reader follows the skill correctly. The real scenario and independent checker supply that evidence. A source-text assertion is insufficient.
- **R2. Full-suite changed coverage can cost more.** D4 deliberately permits an explicit full-suite proposal when the runner has no supported selection interface. It preserves coverage but provides no affected-test speedup.
- **R3. Legacy references remain elsewhere.** Live search finds retired paths in `skills/seed-issue/SKILL.md`, `README.md`, `reference/` and `new-beginning/`, plus the intentional rejected-key case in `tests/init.test.ts`. These are outside this leaf's ownership. C5 is scoped to the init skill. Removing those references repo-wide would reopen the locked scope.

## Planning evidence

`bun test tests/init.test.ts` passed in this worktree: 1 test, 12 assertions. Source inspection confirms `--from` and `--toolkit`, strict repo validation, registration, idempotent ignore additions and command-owned lessons creation. This baseline is not a claim that the rewritten skill has been implemented or verified.
