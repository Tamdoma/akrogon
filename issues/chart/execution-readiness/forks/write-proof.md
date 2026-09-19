# Proof of external writes at chart time

## Question

### Q1 · What counts as proof that a leaf's external writes will work: a reversible probe per required operation and identity, recorded in the chart, with a held handoff when no safe probe exists?
### Q2 · Who runs it: A during the chart pass, or a probe leaf?

### Carries
- Operator-placed: /home/ivan/Work/personal/MDConsultingNY/boulevard-automation/scripts/probe-ghl-scopes.ts.
- Related: `git-base.md`.

## Findings
- (both) skills/chart-issues/SKILL.md Take lists credentials by name and human prerequisites, no write proof. The boulevard chart used GET calls and accepted "I added the permission" unverified.
- (B) The probe proves custom-field and calendar writes (probe-ghl-scopes.ts:18-30), only reads events (:32-33), logs non-2xx without throwing and deletes a hardcoded field (:34-35). Operation-level proof, not a universal POST-then-DELETE recipe. Cleanup failure is a failed preflight with recorded residue. No fallback to GET-only evidence.
- (A) Recording: scope, call, status, date under the fork Findings, and a brief may not name a scope not proven.
- Operator 2026-09-19 (mid-charting): "These things need quick prototypes to make sure nothing's missing with the API." Widen Q1: proof covers every external command or API a leaf contract names, not only writes; the chart records the real command and response before handoff. Done today by hand for herdr notification/tab rename and pi --exclude-tools in `../noninteractive-leaf-execution/forks/`. No separate chart: this is the same fork.
