# Intake: deploy-path

## Scope
Landed akrogon work takes effect for every seat without a manual pull. Destination repo: akrogon. Found by the systems map of this door pass; no GitHub report.

## Provenance
- Operator: chart door 2026-10-10, /chart-issues note below.

## Source: operator 2026-10-10 /chart-issues
Look at the 4 latest issues pulled. We need to consolidate and chart them out. See if those issues still stand And whether we can make the system faster, more efficient, cheaper and move faster. Look at it from the system thinking perspective. Look at all the reinforcing and balancing loops and figure out the stalk and flow and whether something can be changed systematically without making the system work worse. Use slot B and C to consult. They're already active in this tab.

## Agent findings
- The installed command, skills and herdr plugin link into the root checkout (src/install.ts:12-52; docs/guide/install.md:37-41 "Update it with: git pull"). (A,B,C)
- 2026-10-10 the root was 52 commits behind origin/main: today's merge-throughput and lesson-guards leaves were merged but not running. Same lag recorded 2026-09-27 (learnings/LESSONS.md:18), no guard followed. (A,C)
- Framework log (A, measured): merge-attempt bounce rate 0-15%/day before 2026-10-02, 31-67%/day from 2026-10-02 (framework ab700d4cc put framework:verify in merge_checks); merge residence median 16-276 min/day since. Merge is 58% of framework leaf wall time since 10-07 (C). The landed throughput fixes target this.
- Operator pulled 2026-10-10 (root == origin/main f3199df); the pull also pushed the root's uncommitted edits to main without a leaf gate.
- Full maps: slots/map-B.md, slots/map-C.md; A's measurements in this file and the fork.
