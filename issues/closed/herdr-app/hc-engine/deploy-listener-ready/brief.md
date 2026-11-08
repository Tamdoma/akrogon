# Brief: deploy-listener-ready

## What

akrogon's deploy (`deployStage` in `src/self-update.ts`) and `akrogon install` (`install` in `src/install.ts`) handle both release shapes, and the machine config accepts the repo prefixes early:

- a release with `plugin/` (today's shape) runs exactly today's steps, including `herdr plugin link <current>/plugin`;
- a release without `plugin/` makes no `herdr plugin link` and no `herdr integration install` call (B), and, as the deploy's last step after the record and the listener restart, runs `herdr plugin unlink akrogon` when the `herdr` binary exists (idempotent: `removed: false` when already unlinked, P13), so old herdr stops running akrogon's plugin and a deploy killed by that step is already complete (C,D,E; operator 1a);
- a release that ships `systemd/akrogon-listener.service` gets that unit linked to `~/.config/systemd/user/akrogon-listener.service` by the existing link plan, then `systemctl --user daemon-reload`, `enable` and a restart of the unit that runs only after the deploy record is written;
- `~/.akrogon/config.yaml` accepts an optional top-level `prefixes:` map (repo name → two lowercase letters), parsed and otherwise unused by this release, so the operator fills it before the switch (C,E).

The `herdr integration install` loop runs only for a release with `plugin/` (the final sweep removes it), so every release without `plugin/` installs with old herdr absent (B).

## Why

Today a deploy throws when `herdr plugin link` fails (`src/self-update.ts`, reload step), so a release without `plugin/` (the engine release, which replaces the plugin with a listener service) could never deploy, nothing would install or start its listener, and the registered old plugin would keep running `akrogon pull` and `akrogon next` on old herdr events beside the listener. The strict config schema would also reject `prefixes:` before the engine release. This leaf lands before the engine leaf so the engine release deploys cleanly under this release's deployer (forks/cutover.md Q1 and its 1a correction).

## Done-criteria

1. Deploying and installing a release that has `plugin/` and no listener unit run today's steps in today's order, including `herdr plugin link <current>/plugin`, and the deploy records success. Proof: own tests in the `test` check on the existing deploy fixture.
2. Deploying a release with no `plugin/` and a `systemd/akrogon-listener.service` makes no `herdr plugin link` or `herdr integration install` call, links and enables the unit, writes the deploy record, restarts the unit, and only then runs `herdr plugin unlink akrogon`, skipping it when no `herdr` binary is found; a deliberate break (the plugin link left unconditional) turns the test red (B,C,E). Proof: own test in the `test` check, with `systemctl` and `herdr` faked at the process boundary as the existing deploy tests do.
3. `akrogon install` from either release shape makes the same plugin, integration and unit calls as the deploy, and from a release without `plugin/` succeeds with no `herdr` binary on PATH (B). Proof: own test in the `test` check.
4. A machine config with a `prefixes:` map parses and every command behaves as without it; a prefix that is not two lowercase letters is refused naming the key. Proof: own test in the `test` check.
5. The leaf's verify `test` duration and today's baseline (median 75 s) are both recorded in the implementation report; a rise of more than about 10 s is explained there (C).
