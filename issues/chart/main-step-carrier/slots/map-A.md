# Map A: #87 (written before reading map-B)

## Root
A taken chart decision that needs an edit on main (config) has no carrier after handoff. Leaves cannot touch issues/ (shapes.md:284), the human-prerequisite rule covers only steps BEFORE a leaf (SKILL.md Take), so a step that must follow a leaf's merge lands in Off route and is dropped. framework origin/main issues/config.yaml still has the stub; framework #115 is CLOSED.

## Fork 1: carrier for a step on main a decision needs
- Pick 1a: text rule in chart-issues. Off route never holds a step a taken decision needs. The door does it in the pass when it can; when it waits on a leaf merge, the door files it with seed-issue (exact edit, the leaf it waits on), so it stays an open GitHub issue, mirrored by pull, until done. Cost: someone must act on the open issue; no automatic trigger at merge.
- Reject 1b (config checks call a repo script so leaves change behavior in code): removes the class for check commands only; other keys (merge_covers, pass_env, new check names) still need a carrier. Could be a complement.
- Reject 1c (new command state "after-merge steps" shown by status): new code and state.
- Reject 1d (let leaves edit issues/config.yaml): breaks the code-only lock (src/config.ts:175 reads config from the registered root; src/sync.ts:8 treats issues/ as records), and a leaf could change its own gate.
- Evidence: shapes.md:284; SKILL.md Take human-only prerequisite paragraph; seed #87 history steps 2-4; framework origin/main issues/config.yaml:12 (better-than-training, 2026-10-12).
- Pitfall: a seed filed into the door's own intake gets re-charted as a new problem. Removed by the seed naming the exact edit and trigger, so the door does it as an operator step.

## Fork 2: framework instance now
- Pick: switch framework test_changed to `bun run test:changed` on main after a probe on base 6fe2049d7^ showing it selects the two backlink verifiers, with time measured. Cost: a commit on framework main needs operator approval; the probe may be slow.

## Off route candidates
- Format guard on test_changed (must use AKROGON_BASE beyond the guard): form check, not function; init-akrogon.md:82 already requires running test_changed against a real leaf base.
- merge_covers listing a stub: operator assertion, gone once the stub is.
- #86 late flake detection: changed-test-proof chart.
