# Proof of external writes at chart time

## Question

### Q1 · What counts as proof that a leaf's external writes will work: a reversible probe per required operation and identity, recorded in the chart, with a held handoff when no safe probe exists?
### Q2 · Who runs it: A during the chart pass, or a probe leaf?
### Q3 · Can a provider-native dry-run or validate call stand in for a real mutation?

### Carries
- Operator-placed: /home/ivan/Work/personal/MDConsultingNY/boulevard-automation/scripts/probe-ghl-scopes.ts.
- Related: `git-base.md`. Lock 2026-09-28: `akrogon preflight` is the pre-write handoff check for the git base; akrogon learns no service APIs (Off route).

## Findings
- 2026-09-28 re-research (A,B): see `../slots/write-proof-merged.md` and `../slots/write-proof-rebuttal-B.md`. Earlier bullets are the 2026-09-19 pass.
- (both) skills/chart-issues/SKILL.md Take lists credentials by name and human prerequisites, no write proof. The boulevard chart used GET calls and accepted "I added the permission" unverified.
- (B) The probe proves custom-field and calendar writes (probe-ghl-scopes.ts:18-30), only reads events (:32-33), logs non-2xx without throwing and deletes a hardcoded field (:34-35). Operation-level proof, not a universal POST-then-DELETE recipe. Cleanup failure is a failed preflight with recorded residue. No fallback to GET-only evidence.
- (A) Recording: scope, call, status, date under the fork Findings, and a brief may not name a scope not proven.
- Operator 2026-09-19 (mid-charting): "These things need quick prototypes to make sure nothing's missing with the API." Widen Q1: proof covers every external command or API a leaf contract names, not only writes; the chart records the real command and response before handoff. Done today by hand for herdr notification/tab rename and pi --exclude-tools in `../noninteractive-leaf-execution/forks/`. No separate chart: this is the same fork.

## Taken
2026-09-28, operator: "1a | 2a | 3a |"
- Q1-A: every external operation a brief names (API method and path, CLI command, launch flag) gets one real call with the identity the leaf will use, recorded in the fork with command, inputs, identity reference without secret values, version, date, observed result, cleanup result and what it does not prove. Writes use the smallest reversible call on a throwaway target with checked cleanup. No safe sufficient probe holds the handoff or narrows its scope. Needed credentials are in the consumer `.env` before handoff, not only before dispatch. Reason: #20, where GET-only probing and an unverified "I added the permission" let a missing write scope reach implement. Foreclosed: scope lists, docs, introspection or operator assurance as proof (B); a recorded waiver for unprovable operations (C).
- Q2-A: the charting agent runs the probes during the chart pass with the operator present; consumer probe scripts may be run as they are, chart-created scratch code is discarded, findings stay in the fork. Declining a probe holds the handoff. Reason: a probe leaf puts an unproven operation in a seat. Foreclosed: a probe leaf (B).
- Q3-A: a provider-native dry-run or validate call counts only for the property the provider documents it proves, run with the real identity and target; other assumptions need their own evidence; a sufficient no-write check is preferred. Foreclosed: always a real write (B).
