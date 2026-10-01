# Map A: #48 check reruns

## Seed claims vs code (main 5375dbe, 0 behind origin)
- TRUE check-issue/SKILL.md:51 rerun rule exists; prose report is the only evidence, so "missing evidence" always applies.
- TRUE implement-issue/SKILL.md:52 "a full-suite rerun follows a repair"; also :48 "run the full suite once as A and every other blocking check". "Full suite" is undefined anywhere (skills/AREA.md:22, worker-protocol.md:25,27, docs/guide/phases.md:91). In framework it effectively meant framework:verify.
- PARTLY STALE merge-issue/SKILL.md:33: merge_checks landed today (5375dbe) as the slow merge-only tier; framework already moved framework:verify there (framework a5898e73b). That commit is the seed's own workaround made permanent.
- TRUE chart side: shapes.md "a leaf needing a larger repo-wide command gets it added to `checks` first" pushed framework:verify into checks; emdash-conversion C1 cites `bun run framework:verify`.
- merge-issue:45 already reuses "an unchanged successful check run ... only when neither code nor integration changed", again prose-judged.
- No check runner exists: src/akrogon.ts verbs = install|init|config|preflight|phase|next|pull|close|park|unpark|sync|status.
- Phase guards exist to extend: src/phase.ts:253 requireClean, :259 requireNoIssueFiles, :267 requireNonEmpty.

## Forks
1. Scope. With merge_checks shipped, build tool-written records or only fix prose?
   a (rec) `akrogon check <name>` runs a configured check in the leaf worktree, writes a record (name, command, tree, exit, wall, log path) under the leaf folder; reuse only on a matching record. Only a tool record removes the "prose can't be trusted" class.
   b prose only: define tiers (checks before merge, merge_checks at merge), drop "full suite". Cheap, but B still reruns because prose stays untrusted.
2. Reuse identity. a (rec) HEAD tree hash + clean worktree + exact command string; b commit SHA (seed). Tree is what checks read; amend/rebase-without-change keeps tree. Pitfall: deps outside tree (node_modules, .env) are not covered; lockfile is.
3. Enforcement. a (rec) `akrogon phase ... check.review --slot A` refuses without a passing record for every `checks` name at HEAD tree, and `merge` path needs records for checks+merge_checks before push; b records advisory only (seats cite them, nothing refuses). Open sub-question: `merged` runs after push, so a refusal there cannot stop landed code; gate should sit before push (B runs `akrogon check`, push only on pass) or accept post-hoc audit.
4. Repair scope (seed point 4). a (rec) remove "full suite"; A and B run every `checks` entry via records (fast tier by config placement), merge_checks only at merge. b seed's "changed-area tests + fast checks" adds a third tier with no config home.
5. Criteria (seed point 5). a (rec) chart audit refuses a done-criterion citing a `merge_checks` command and drops the "add repo-wide command to checks" rule; speed tier comes from config placement, not "repo-wide". b refuse any repo-wide suite (seed): needs a definition of repo-wide nobody can check mechanically.

## Practitioner notes
GitHub commit statuses / required checks bind to commit SHA; Bazel and Turborepo key on content hashes of inputs plus declared env; Zuul/bors test the speculative merge result, which is what merge-issue already does by rebasing first. Common pitfall: cache keys missing env or toolchain version.

## Split
- L1 check-records (src: new verb, record schema, phase guards, tests).
- L2 seat-rules (skills implement/check/merge/chart shapes, init-akrogon, docs/guide, AREA lines) blocked-by L1 because the prose names the command and record path.

## Fog
- Where records live so they survive and are committed: leaf folder in registered checkout (commitMove commits it?) vs worktree-local.
- Whether advisory commands get records.
