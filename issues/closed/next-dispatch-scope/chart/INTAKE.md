# Intake: next-dispatch-scope

## Scope
One issue in the akrogon repo: limit what `akrogon next` starts after a completion (targeted run, `tab_closed` hook, pane hook) and at Herdr startup, then update the guide pages that state the old rule.

## Provenance
- GitHub: Tamdoma/akrogon#29

## Source: Tamdoma/akrogon#29
# Targeted akrogon next in one repo dispatches ready leaves in every registered repo

Source: Tamdoma/akrogon#29
URL: https://github.com/Tamdoma/akrogon/issues/29

Unverified intake.

## Observation
The operator ran `akrogon next` in the akrogon repo to start only that repo's leaf (`peer-c-role`). After that leaf merged, ready leaves in a different registered repo (`framework`, /home/ivan/Work/infra/tamdoma/framework) were dispatched automatically, without anyone running `akrogon next` in that repo. Implementation, check and merge slots then ran on those leaves, and merge-issue posted Discord announcements for the issues that completed. The operator expected framework leaves to start only when they run `akrogon next` there, and considers this a bug.

Timeline from the two repos' `issues/log.jsonl` (UTC, 2026-09-26):
- 07:09:57 akrogon `peer-c-role` plan.synthesis -> implement (slot B). The only `akrogon next` found in any herdr pane is in pane `w8:p18` (akrogon workspace, plain shell, cwd /home/ivan/Work/infra/akrogon).
- 07:28:31 akrogon `peer-c-role` merge -> merged.
- 07:31:48 framework `website-path-fixes` plan.synthesis -> implement (slot B).
- 07:32:36 framework `batch-lane-module` -> implement. 07:35:21 `hero-subheadline` -> implement. 07:38:58 `bash-scan-spans` -> implement.
- 07:53:40 and 08:01:53 framework `website-path-fixes` and `hero-subheadline` merged. Discord posts followed (issues website-path-contracts and template-family-hero completed).
- 07:56:06 framework `dispatch-scratch` -> implement, about a minute after its leaf folder was written to framework `issues/open/`.

Code observed at /home/ivan/Work/infra/akrogon (local HEAD 9aaadd3):
- `src/next.ts:649-710` `nextCommand`. A targeted run (`input` set) dispatches the selected leaf, and when the outcome is `'completed'` calls `sweepAll` (:672). The herdr hook paths (`HERDR_PLUGIN_EVENT_JSON`, `tab_closed` at :688-698 and hook pane at :700-707) also call `sweepAll` on `'completed'` (:697, :706).
- `src/next.ts:564-574` `sweepAll` iterates `registeredRepos(global, invocation).repos` and sweeps every repo's leaves.
- The herdr plugin is registered in `~/.config/herdr/plugins.json` (plugin_id `akrogon`, manifest /home/ivan/Work/infra/akrogon/plugin/herdr-plugin.toml), so `akrogon next` runs on herdr pane and tab events.

## Location
akrogon CLI `akrogon next` (src/next.ts), its herdr plugin hook, and cross-repo dispatch across registered repos (akrogon and framework registered on this machine).

## Reproduction
1. Register two repos with akrogon. Leave a ready leaf (state.yaml, nothing blocking) in repo Y.
2. In repo X, run `akrogon next` for a leaf in X.
3. Let that X leaf complete through merge with the herdr plugin active.
4. Repo Y's ready leaf is dispatched without running `akrogon next` in Y.
Observed once on 2026-09-26, and every later completion kept sweeping (dispatch-scratch was picked up about a minute after handoff).

## Expected behavior
`akrogon next` run for one repo or leaf starts and continues work only in that scope. Leaves in other registered repos start only when the operator runs `akrogon next` for them (or `--all`).

## Urgency
High. Leaves in unrelated repos are implemented, merged, pushed and announced on Discord before the operator chooses to start them, including leaves handed off minutes earlier. Workaround: Not provided (keeping ready leaves out of `issues/open/` in other repos until they should start).

## Agent findings
- `src/next.ts:672`, `:697`, `:706`: all three completion sites call `sweepAll`, which sweeps every registered repo (`src/next.ts:564-574`). Confirmed as reported.
- `dispatchLeaf` returns `'completed'` for any leaf already in phase `merged` (`src/next.ts:524-527`), so every later pass over a merged leaf still sitting in `issues/open/` (epic not yet complete) triggers another global sweep.
- `plugin/herdr-plugin.toml:7-11`: Herdr startup runs `next.sh --all`. From a cwd outside a registered repo, `--all` calls `sweepAll` (`src/next.ts:677-680`), so a Herdr restart starts every ready leaf in every repo. Same problem class, not in the report.
- The guide documents the current behavior: `docs/guide/limits.md:9` ("Folder targeting is temporary ... Later sweeps can consider other open leaves"), `docs/guide/next.md:36-38` ("Startup also runs a sweep"). It also says "Manual dispatch is the normal way to start work" (`docs/guide/next.md:59`).
- Dependency chaining relies on the completion sweep: 55 of 220 leaves across akrogon and framework have a non-empty `blocked-by`. `blocked-by` resolves within one repo only (`lookup`, `src/next.ts:160-164`).
