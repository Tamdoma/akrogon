# Brief: pull-all-repos

## What
`akrogon pull --all` pulls every repo in the global `repos` config regardless of the directory it runs from: the early return in `pullCommand` (src/pull.ts:81-87) that narrows `--all` to the current registered repo is removed, and the existing all-repos loop with its per-repo failure collection runs every time. Plain `akrogon pull` keeps pulling only the current registered repo through `requireRepo`. README states that `--all` pulls every registered repo from any directory.

## Why
Tamdoma/akrogon#38: herdr runs plugin commands with the plugin directory as cwd (https://herdr.dev/docs/plugins/), and the akrogon plugin at `plugin/` is inside the registered akrogon repo, so the startup `pull --all` has pulled only akrogon. A live run on 2026-09-28 from `plugin/` pulled 1 repo; from `/tmp` it pulled all 7. The intake reports that Tamdoma/pi-extensions#5 was first mirrored after its fix merged. The measured selection defect explains how startup can miss that repo, but does not establish the historical pull sequence. The narrowing contradicts the recorded contract (issues/closed/akrogon-loop/github/pull-close/plan.md:18, D1: "All mode processes every global registration") and arrived in hand commit 373538a without a leaf.

## Credentials
- `gh` logged in to github.com (the operator's existing `ivanjuras` login, checked with `gh auth status`), used only by done-criterion 5. Tests use tests/fake-gh.ts and never contact GitHub.
- No `.env` keys.

## Done-criteria
1. tests/pull.test.ts drives the real CLI on real temporary git repos with at least two registered repos and fake gh, and shows `akrogon pull --all` pulls every registered repo when run from a registered root, from a linked worktree of a registered repo, and from an unregistered directory.
2. Plain `akrogon pull` still pulls only the current registered repo from its root and from a linked worktree, and still fails outside a registered repo; the existing tests for this keep passing.
3. `akrogon pull --all` run from inside a registered repo, with another registered repo failing, still pulls the healthy repos and exits non-zero naming the failed one (negative test).
4. README.md's command table row and the sentence "Pull has the same all-repositories option" (README.md:153) say that `--all` pulls every registered repo from any directory, unlike `next --all`, which stays current-repo inside one.
5. The implementation report records one real run of the leaf's command, `bun <leaf worktree>/src/akrogon.ts pull --all` with cwd `/home/ivan/Work/infra/akrogon/plugin`, printing one line per registered repo, with the output saved outside tracked `issues/` paths and its path in the report. The configured `checks` pass.
