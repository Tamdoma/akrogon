# Grant misses harness trust-dialog entries (2026-11-08)

## Case

watcher-on-hc's readiness grants[0] (approved 2026-11-07) allows codex stop checks and a Claude watcher in fresh throwaway git folders under the leaf temp. Its `effects` list only agy's `trustedWorkspaces` append, which cleanup removes, and say "no ... retention effects". Its `retained` lists only agy conversations.

## Evidence

- engine-on-hc's kinds tier stopped at Claude Code's folder-trust dialog (implementation/report.md count lines K-1, K-3) and then at codex's "Trust and continue" dialog (pass 3 blocker). Answering either writes a harness config entry (`~/.claude.json` projects, `~/.codex/config.toml`) that no script may remove while sessions of that harness run. The operator approved them as `retained` entries (engine-on-hc plan O3, O4; readiness.yaml retained).
- watcher-on-hc plan.md G1, written at plan.synthesis 2026-11-08: the same two entries are missing from its grant, which was approved before engine-on-hc found them.

## Learning

A paid live run that starts Claude Code or codex in a folder they have not trusted shows a trust dialog. Answering it leaves a harness config entry behind. A grant for such a run needs that entry declared as retained, or the run needs an already-trusted folder. Otherwise the seat reaches an operator-blocker stop at launch.
