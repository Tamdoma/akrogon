# Fork notes A: patch-mechanism

## Q1 what counts as a patch
- Pick: only files on public surfaces: mods, layouts, keys, settings, `bin/` helpers, the linked skill, calls to `hc` commands, the `hc connect` API (`doc.get`/`doc.set`) and `herdr-app do`. That is what herdr-setup already is (README, `install`, 12 mods), and every herdr-setup piece the taken forks name fits it (weights helper on `doc.set`, notices in `session-status`, the skill). Reason: no herdr-core or herdr-app source exists on the machine, and public surfaces are what upstream keeps working across releases; AGENTS.md says to clone shipped mods and layouts before editing, so a herdr-setup clone survives an app update that rewrites the shipped copy. Cost: a gap no public surface can reach cannot be patched; it is reported upstream and the chart cuts that behavior to what is proven (skill handoff rule).
- Rejected: PATH wrappers shadowing `hc`/`herdr-app` (every caller, including herdr-app itself, would run a second program in front of the real one; an update changing flags breaks it silently). Source patches like `herdrdev/herdr-patched` (no source; a patched build stops receiving upstream updates, the opposite of "survive upstream updates").
- Evidence: better-than-training · herdr-setup README and `install`, `ls ~/.local/bin` (prebuilt ELF), `herdrdev/herdr-patched` git log ("patched binary supersedes upstream"), AGENTS.md Layouts (clone before editing) · 2026-11-07.

## Q2 surviving updates
- Pick: herdr-setup's own tests cover each patch's contract and run when herdr-setup changes, as today; akrogon's e2e run (signpost 2a) covers the akrogon-facing parts. No version pin and no update hook: an update that breaks a patch shows as a failing test or a failing akrogon e2e, fixed then. When upstream ships the missing feature, the patch is removed in herdr-setup and the caller moves to the native command. Reason: closest to today (herdr-setup already has `tests/` for its mods), fewest parts.
- Pitfall: herdr-app auto-updates between test runs and a patch breaks unseen. Removed by: akrogon e2e and herdr-setup tests run against the installed binaries; the operator decides whether an update should trigger them (ask).

## Q3 upstream and contracts
- Pick: each patch that fills a gap gets one `herdr-app feedback` draft for the operator to review and send, recorded with the patch. Each patch's akrogon-facing contract (folder and file shape for notices, weights helper arguments) is pinned by a test on each side: herdr-setup tests the patch, akrogon tests its call against the same contract (notices Taken already says "pinned by an e2e test in both repos").
- Ask: should a herdr-setup patch carry a note naming the upstream gap, so a later upstream feature is noticed?
