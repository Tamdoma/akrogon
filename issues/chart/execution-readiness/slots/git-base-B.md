# Git base: independent operator round B

This round settles who repairs a missing configured base and when readiness is proved. Recommendation: refuse with specific remediation, before handoff writes and again before dispatch allocation. Automatic first-commit creation and pushing remain outside scope unless explicitly chosen.

Research date: 2026-09-28. Inspected current checkout at `d5b27353fd3ecd3fb59325fb94e6547c85e6893b`, not the old chart findings. Related write-proof question is carried without reading that fork. No clocks, polls or watchdogs are proposed.

## Findings

- **F1 · Operator evidence and destination.** The reported empty origin failed at `worktree add ... origin/main` and was repaired with a manual first commit and push. The scope explicitly requires usable Git base proof before leaf state and remediation at dispatch. This favors refusal at both boundaries. Sources: operator tier, `issues/chart/execution-readiness/INTAKE.md:4`, `:11`. The external-write report is a separate proof requirement, not evidence that Git read access proves push permission (`INTAKE.md:12`, `:15`).
- **F2 · Configuration names a local revision but does not validate it.** Defaults are origin/main (`src/config.ts:26-29`). Registered repository matching uses Git's common directory (`src/config.ts:97-116`). `target()` concatenates remote and branch, while `base()` runs `git merge-base HEAD <target>` (`src/config.ts:125-130`). Root-level `config` does not resolve the base. Only linked-worktree config adds `AKROGON_BASE` (`src/config.ts:133-144`). Therefore a successful root-level config read is not base proof. Tier: current source.
- **F3 · Dispatch still reaches Git without a dedicated base gate.** Existing worktrees get root/common-directory checks. An existing leaf branch is reused. Otherwise `git worktree add -b <slug> <path> <target>` creates the branch (`src/next.ts:230-257`). No fetch or base readiness check occurs in this path. Afterward it saves `state.worktree`, then allocation evaluates `base()` for the pane environment (`src/next.ts:259-260`, `:303-311`). Missing base can therefore fail before worktree creation for a new leaf, or after state is saved for a reused branch/worktree. Tier: current source. [Git worktree documentation](https://git-scm.com/docs/git-worktree) defines `-b` as creating a branch at the supplied commit-ish. It does not bootstrap that explicit missing commit-ish.
- **F4 · Current failure is a raw command failure, not repair guidance.** `command()` throws `CommandError` with command, cwd and result (`src/shell.ts:7-14`, `:48-51`). Dispatch catches and reports the error and skips that leaf (`src/next.ts:547-550`). Skipped work makes the invocation exit nonzero (`src/next.ts:763`). There is no automatic commit or push in allocation (`src/next.ts:230-261`, `:285-323`). Tier: current source. This updates the historical report without claiming that today's code already meets the destination.
- **F5 · Status checks records, not execution readiness.** Overview parses repository configuration, open leaf states, depth, registered repo identity, unique open-leaf slugs and log records (`src/status.ts:46-80`). It reports unreadable scans and exits nonzero for them (`src/status.ts:303-332`). Detail resolves a leaf and displays state/history (`src/status.ts:288-300`). Neither route resolves the configured base. Overview displays `blocked-by` values without resolving their existence (`src/status.ts:123-130`). It does not inspect briefs/designs for completeness in its scan (`src/status.ts:53-80`). Tier: current source. “Status passes” is not “ready to create a worktree.”
- **F6 · No doctor/preflight command currently covers the gap.** The CLI's supported command switch has no doctor or preflight verb (`src/akrogon.ts:32-87`). Init validates repository location, config, seats and grounding before writes, without checking the target (`src/init.ts:29-47`). Sync does fetch and verify `FETCH_HEAD^{commit}`, but is a separate command (`src/sync.ts:46-47`, `src/akrogon.ts:67-70`). These are not dispatch or handoff gates. Tier: current source.
- **F7 · Installed handoff preflight still lacks Git-base proof.** The skill requires preflight before writes (`/home/ivan/.claude/skills/chart-issues/SKILL.md:59`). Shapes preflight checks destination collisions, issue-path ownership, slugs, dependencies, settled forks, Fog and contract/human-prerequisite completeness (`/home/ivan/.claude/skills/chart-issues/assets/shapes.md:164-168`). It then writes briefs/designs/state and only afterward runs `akrogon status` (`assets/shapes.md:170`). No base probe is named. Tier: installed skill source. Merely enhancing that post-write validation cannot satisfy “no leaf state until usable.”

## Distinguish the four cases

These are recommended classifications, not functionality already implemented. Git sources: [ls-remote](https://git-scm.com/docs/git-ls-remote), [rev-parse](https://git-scm.com/docs/git-rev-parse), [fetch](https://git-scm.com/docs/git-fetch).

| Case | Evidence | Proposed outcome and remediation |
| --- | --- | --- |
| **C1 · No configured remote** | Configured remote name is absent from Git configuration. A remote query failure alone also permits transport/auth failures. | Refuse. Name the missing remote and ask the operator to configure its intended URL or correct `remote`. Do not invent a URL. |
| **C2 · Remote with zero commits** | Known empty repository has no advertised branch. `ls-remote --exit-code <remote> refs/heads/<branch>` returns 2. | Refuse. Operator chooses initial content, commits it and pushes the configured branch, then fetches/verifies the tracking ref. No automatic staging, empty commit or push. |
| **C3 · Branch exists remotely, never fetched locally** | Exact remote branch query succeeds, but `rev-parse --verify --end-of-options 'refs/remotes/<remote>/<branch>^{commit}'` fails. | Refuse with fetch guidance, not bootstrap guidance. A concrete repair is `git fetch <remote> 'refs/heads/<branch>:refs/remotes/<remote>/<branch>'`, then repeat validation. |
| **C4 · Branch exists and tracking ref resolves to a commit** | Exact advertised remote branch and local commit verification succeed. | Base existence passes. This alone does not prove write permission, worktree-path availability or later merge success. |

`ls-remote` lists advertised refs without fetching objects. Without `--exit-code`, successful communication with zero matches returns 0. With that option, no match returns 2. A missing configured branch does not establish that the entire remote has zero commits. Other branches, hidden refs or authorization limits may exist. Preserve transport/auth errors separately from “branch absent.” [Git ls-remote](https://git-scm.com/docs/git-ls-remote).

Use the full `refs/remotes/...` name plus `^{commit}` to verify the intended local commit, rather than accidentally accepting a same-named local branch or tag. Remote existence alone is insufficient for worktree creation. Local existence alone cannot show whether the server branch was deleted. Fetch obtains objects and updates tracking refs according to its refspec. [Git rev-parse](https://git-scm.com/docs/git-rev-parse), [Git fetch](https://git-scm.com/docs/git-fetch).

## Q1 · When the configured Git base is missing, should akrogon refuse with remediation or create the first commit and push?

The empty-origin incident is real, but “missing origin/main” can also mean an existing branch was never fetched. Current dispatch fails through the command error path without distinguishing those repairs (F3–F4).

Research: operator tier, `INTAKE.md:11`, read 2026-09-28, identifies manual first commit/push as the historical repair. Current source tier, `src/next.ts:246-260`, and [Git worktree](https://git-scm.com/docs/git-worktree), confirm the configured starting commit must already be usable. This makes classification before remediation essential.

- **A (recommended): Refuse with specific remediation.** Include repository, configured remote/branch, failed probe and Git error. Guide the operator through C1–C3, and require successful revalidation before proceeding. This respects the destination and avoids choosing commit contents or a publication target for the operator.
- **B: Create the first commit and push automatically.** This would reopen the excluded bootstrap work. It requires explicit policy for initial contents, branch selection, identity and push permission. It cannot repair a mistyped remote or substitute for fetching an existing branch.

Pitfalls: Do not recommend a first commit for every unresolved local ref. Do not treat successful `ls-remote` as fetch or push proof. Do not fall back to local HEAD or an orphan worktree, since either changes the selected base.

## Q2 · Should the check run before chart handoff and again at dispatch, or only at dispatch?

The installed handoff validates records after writing state (F7), and dispatch may save worktree state before the later merge-base call fails (F3). A dispatch-only gate cannot fulfill the intake's pre-state requirement.

Research: operator tier, `INTAKE.md:4`, requires both boundaries. Installed skill tier, `/home/ivan/.claude/skills/chart-issues/assets/shapes.md:166-170`, shows the missing pre-write check. Current source tier, `src/next.ts:303-311`, shows why dispatch must check before allocation writes. Read 2026-09-28.

- **A (recommended): Check before any handoff write and again immediately before dispatch allocation.** Use one defined readiness rule and shared diagnostics at both boundaries. Handoff must work with zero leaves. Dispatch must reject a missing base for both new and reused leaf worktrees before allocation changes state or creates panes. Recheck because repository configuration/refs can change after handoff.
- **B: Check only at dispatch.** This protects worktree allocation but knowingly permits leaf state for an unusable repository. It contradicts the supplied destination and would require changing that scope explicitly.

Pitfalls: Adding the check only to today's post-write `status` invocation is too late. Restrict it to the selected repository so another broken registration does not block unrelated handoff. Do not add polling. A fresh existence check is not an atomic promise that a remote will remain reachable forever.

Reply `1-A 2-A`, or give numbered free-text choices.

## Concrete scenario verified

Read-only commands ran in `/home/ivan/Work/infra/akrogon` with Git 2.55.0. No fetch, worktree creation, commit, push or scratch repository was performed.

- **V1 · Real configured base.** `issues/config.yaml:1-2` selects origin/main. `git rev-parse --verify --end-of-options 'refs/remotes/origin/main^{commit}'` returned 0 and `d5b27353fd3ecd3fb59325fb94e6547c85e6893b`. `git ls-remote --exit-code origin refs/heads/main` returned 0 with the same commit. This verifies C4 on the live checkout.
- **V2 · Remote exists, tracking ref absent.** Without writing configuration, `git -c remote.chart-b-readonly.url=. ls-remote --exit-code chart-b-readonly refs/heads/main` returned 0 with that commit. `git rev-parse --verify --end-of-options 'refs/remotes/chart-b-readonly/main^{commit}'` returned 128, `fatal: Needed a single revision`. This reproduces C3's relevant distinction with a command-scoped remote alias and no fetch.
- **V3 · Missing-match exit semantics.** `git ls-remote --exit-code . refs/heads/chart-b-nonexistent` returned 2 and empty stdout. The identical query without `--exit-code` returned 0 and empty stdout. This verifies why checking exit success without the flag is insufficient.
- **V4 · Missing remote diagnostic.** `git remote get-url chart-b-absent` returned 2 with `error: No such remote 'chart-b-absent'`.
- **V5 · Current status.** `bun src/akrogon.ts status` exited 0 and displayed the current open lifecycle rows. Its validation coverage is established by F5, not inferred from this healthy checkout.

The zero-commit worktree failure is operator-reported evidence (`INTAKE.md:11`), not a new reproduction. Running a destructive or temporary repository setup would violate this pass's write restriction. The live commands above verify the crucial remote/local distinction without it.

## Challenge check

An experienced reviewer can challenge whether every dispatch needs remote contact when a valid local base exists. Recommended interpretation: require the configured remote branch to exist and the local tracking ref to resolve, because otherwise a stale tracking ref can pass while the server branch is gone. Network/auth failure means readiness was not proved, not that bootstrap is needed. This adds an availability dependency but keeps the stated configured-remote contract honest. It does not require local and remote tip equality or automatic fetching, which would widen existence checking into freshness policy.

No peer positions were consulted. Recommendations are not operator decisions. The narrow outcome is refusal with remediation at both boundaries, with external write proof left to its related fork.
