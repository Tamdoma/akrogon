# Names, merged notes (A, B)

## Agreed
- Open owners only. Bare names search open epics, open top-level issues and open issues nested under an epic. Leaf slugs keep today's open and closed search. Closed owners stay reachable by path. (A,B)
- An input that exists as a folder from cwd keeps today's path meaning (src/next.ts:1191-1195). (A,B)
- Two or more matches refuse before any allocation and list every match by kind and repo-relative path. No Herdr call happens on refusal. (A,B)
- Two nested issues with the same name under different epics count as two matches. Nothing enforces unique issue names today (src/state.ts:114-118, :132-141). (A,B)
- Zero matches keeps missingLeafMessage, including the parked diagnostic (src/state.ts:146). (A,B)
- Worktrees resolve against the registered root through the Git common directory (src/next.ts:1179, src/config.ts:179-198). (A,B)
- Discovery errors stay errors and never become "missing" (src/next.ts:120-166). (A,B)
- Rejected: owner or leaf priority, first match, union of matching owners, open and closed owners. (A,B)

## Added by one slot
- Owners are derived from the folders above valid leaves, not from ISSUE.md or EPIC.md presence. (B)
- An issue and its only leaf may share a name (docs/guide/parts.md:28-35). Under the refuse rule that documented pattern becomes an error that needs a folder path. (B)
- An epic and an issue inside it may share a name. Refuse that too. (A)
- Path precedence means a local folder can shadow a name, so "from anywhere" depends on cwd. The alternative is names always win and paths need `./` or an absolute path. (B)
- Evidence: cargo pkgid accepts a partial spec only when it matches one package (A). Git separates explicit path intent from shorthand (Jeff King commit 1418567, git-scm gitcli, gitrevisions) (B).

## Open for the operator
- Same-name issue and leaf that select the identical leaf set: refuse (report wording) or treat as one match (keeps the documented pattern working). A leans treat-as-one. B recommends refuse.
- Path precedence or names-win.
