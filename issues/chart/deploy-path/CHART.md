# Chart: deploy-path

## Destination
Landed akrogon work takes effect for every seat without a manual pull: after each akrogon landing the root checkout fast-forwards itself, and a refused pull is reported. Repo: akrogon.

## Forks taken
- [deploy-path](forks/deploy-path.md): 1c akrogon updates its own checkout (ff-only pull, bun install, skill links) after each akrogon merge and at herdr startup; refusal printed with remedy, never fails the merge

## Open forks

## Fog
None.

## Off route
- Separate runtime copy, release folders, settings move (1a, 1b): operator declined a new mental model.
- Herdr plugin manifest snapshot drift (plugins.json startup `next.sh --all` vs herdr-plugin.toml `--resume`): pre-existing, not caused by the pull path; operator relink step.
- Mixed-version read when a pull lands during a lazily importing call: accepted, seconds-wide window, same as a manual pull today.
- Direct route pushes: akrogon has `direct: false`; if enabled later, its landing deploys at the next trigger. (C)
- By-ancestry completion and landings from another machine: deploy at the next trigger (startup, next akrogon merge, manual next). Accepted.
