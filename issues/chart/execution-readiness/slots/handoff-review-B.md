# Handoff review B

Reviewed drafts against HEAD `1607ee7fbf4a2362340c2d6b8de4257d72684ec6`. Draft paths below are relative to `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/662e6ab6-5f0e-4273-9f82-37a648b93f50/scratchpad/handoff/execution-readiness/`.

## D1 · base-preflight: resolve the remote-check trigger before handoff

`base-preflight/brief.md:24` and `design.md:15` say new **branch**, but the verbatim decision says new **worktree** (`issues/chart/execution-readiness/forks/git-base.md:23`). Existing code can create a new worktree from an existing leaf branch (`src/next.ts:246-255`). The implementer must not silently choose between them. Also, “no network call on every dispatch” conflicts with the same decision's remote query after local failure.

Replacement for criterion 6, following the decision's literal trigger:
> Every allocation verifies the local tracking commit. Require remote-branch proof when the worktree must be created, including reuse of an existing leaf branch. With an existing worktree and a valid local ref, make no remote query. After local-ref failure, query the remote to classify remediation. Test each path.

Replacement for design ownership line's parenthetical:
> src/next.ts (gate before ensureWorktree, with remote proof when creating a worktree or classifying a local-ref failure).

If “only when cutting a new branch” was intended, obtain that focused clarification before changing the copied decision.

## D2 · base-preflight: criterion 5 excludes required failure cases

`base-preflight/brief.md:23` requires C2 or C3 whenever the local ref is missing. That also happens with no remote or a transport failure, covered by the same brief at `:7`, `:10` and the taken decision (`git-base.md:21`). It also tests only an existing branch, not a reused worktree, although `ensureWorktree` saves worktree state in both paths (`src/next.ts:236-260`).

Replacement:
> For a new leaf, an existing leaf branch without a worktree, and an existing worktree, a missing tracking commit refuses before worktree creation or saving state.worktree. Report C1, C2, C3 or an unproven transport/auth result as applicable, once per leaf per invocation.

## D3 · base-preflight: specify rejection of an unregistered caller

`base-preflight/design.md:16` says to resolve with `currentRepo`, which returns null for an unregistered checkout (`src/config.ts:106-116`). No criterion defines that outcome. `requireRepo` already supplies the registered-repository refusal (`src/config.ts:119-122`).

Replacement:
> The preflight CLI resolves the authoritative registered root through requireRepo and refuses an unregistered/non-repository caller without writes. Shared checks accept the resolved Repo, so dispatch does not re-resolve its cwd.

## D4 · base-preflight: verify and consume the same unambiguous base

Criterion 2 checks the full tracking ref, but `design.md:16` points at `target()`, which returns an abbreviated name (`src/config.ts:125-130`). Both worktree creation and later merge-base currently consume that abbreviation (`src/next.ts:255`, `:311`). Checking the correct ref alone leaves the actual start revision open to a same-named local branch/tag when both exist.

Replacement/addition to the interface line:
> Resolve and consume the configured tracking base unambiguously. Test both a missing tracking ref with a same-named local branch/tag and a valid tracking ref with a conflicting same-named branch/tag, verifying that worktree creation and AKROGON_BASE use the tracking base.

These changes fit the existing src/config.ts and src/next.ts ownership.

## D5 · base-preflight: distinguish test credentials from runtime authentication and retain verification evidence

`base-preflight/brief.md:16` and `design.md:12` say no auth is involved, but the new remote query can require the checkout's existing Git authentication, as the brief itself recognizes at `:10`. The standing-design interpretation also names real CLI tests without specifying their required artifact (`skills/chart-issues/assets/standing-design.md:9`).

Replacement for Credentials:
> No new credentials are required to implement or test this leaf. Temporary local remotes test behavior without secrets. Runtime remote probes use the consumer checkout's existing Git authentication and report authentication failures as unproven.

Replacement for the end of design line 12:
> Verify the CLI flows with real Git fixtures and retain the verification command's output outside tracked issues/ paths, recording its path in the implementation report.

## D6 · operation-proof: make canonical rule ownership compatible with the no-duplication criterion

`operation-proof/brief.md:13` requires the full proof rule in both Take and Handoff, `:15-16` repeat its hold behavior in assets, but `:17` says each rule appears once. That leaves the implementer choosing which criterion to violate. Current Handoff already directs the reader to shapes rather than duplicating its audit (`skills/chart-issues/SKILL.md:61`).

Replacement for criterion 1's opening:
> Define the operation-proof rule once in SKILL.md Take, including the evidence, safe-probe, dry-run and no-waiver requirements below. Handoff and the relevant assets reference that canonical rule at their enforcement points instead of restating it.

Replacement for criterion 5's opening:
> Keep one canonical definition of each rule. Cross-references in Handoff, the preflight audit and Optional measurement enforce it without duplicating its definition.

## D7 · operation-proof: docs-links does not validate the owned skill files

`operation-proof/design.md:11` presents the docs-links test as verification, but it scans only README.md and docs/guide/*.md (`tests/docs-links.test.ts:75-86`). It does not inspect any of this leaf's three owned files. Passing it cannot establish that new skill links resolve or that the rule is usable.

Replacement for the verification sentence:
> Verify the three edited skill files and their links directly, then audit a sufficient real probe, a limited provider dry-run, and an unproven or declined operation against the rule. Retain the audit result in the implementation report. Existing docs-links and configured checks remain regression checks, not proof of the skill's semantics.
