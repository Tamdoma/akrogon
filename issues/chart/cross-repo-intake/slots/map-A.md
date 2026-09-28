# Map A: Tamdoma/akrogon#38

## Findings
- F1 Startup pull covers only akrogon. herdr runs plugin commands with the plugin directory as cwd (https://herdr.dev/docs/plugins/, read 2026-09-28). The akrogon plugin is `/home/ivan/Work/infra/akrogon/plugin`, inside a registered repo, so `pullCommand` (`src/pull.ts:81-87`) takes `currentRepo` and returns after one repo. Live run 2026-09-28: `cd plugin && akrogon pull --all` pulled akrogon only; from `/tmp` it pulled all 7 registered repos. Explains pi-extensions#5 reaching pi-extensions seeds only after the fix merged.
- F2 The narrowing was never decided. `issues/closed/akrogon-loop/github/pull-close/plan.md:18` D1: "All mode processes every global registration". The early return came in hand commit 373538a ("add issues", 2026-09-13). README:137 documents `akrogon pull [--all]` without the narrowing.
- F3 The door pulls and imports only its own repo's seeds at open (`skills/chart-issues/SKILL.md` Open), while handoff can target any registered repo (stuck-seat-recovery handed off to pi-extensions).
- F4 Cross-repo closure already works. `closeSource` runs `gh issue close -R <owner/repo> <n>` (`src/pull.ts:123`) for every leaf `sources` identity, whatever repo it names. Had the leaves carried `Tamdoma/pi-extensions#5`, it would have closed on merge.

## Proposed split
One chart `cross-repo-intake`, destination akrogon, two parallel leaves:
1. pull-all-everywhere: `pull --all` pulls every registered repo from any cwd.
2. destination-intake: before handoff to a registered repo, the door reads that repo's freshly pulled open seeds, proposes duplicates, and on operator confirmation records them in intake provenance and every leaf `sources` under the completion owner.

## Forks
- Q1 pull --all scope. A (rec): remove the narrowing, `--all` always pulls every registered repo. B: keep narrowing, make `plugin/pull.sh` cd out of the repo. Pitfall: plain `akrogon pull` stays current-repo; the existing test runs `--all` only from outside (`tests/pull.test.ts:226`).
- Q2 destination intake. A (rec): at handoff, pull the destination repo and propose duplicates for operator confirmation. B: at open, import seeds from every registered repo (noisy, contradicts note-scoped import). C: no door change, rely on Q1 plus `akrogon close` by hand (the door still never looks).

Debate: no (small issue).
