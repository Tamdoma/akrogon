Reviewed tab-order commit `39427a74fa713713f6979904c503be0e3967a827` in the named herdr-setup worktree. Paths below are relative to that worktree.

## F1 — P2: An empty loading render erases the persisted placement history

`mods/session-status/main.js:38-39` replaces the persisted known IDs from `spaces()` without checking layout readiness. `mods/session-status/tabs.js:5,13-14` consequently treats a temporarily absent layout as closed tabs. Machine layouts have explicit loading/unavailable states (`/home/ivan/.config/herdr-app/herdr.d.ts:130-132`). A startup or reconnect render must not discard history before that machine's layout is ready.

Reproduced with the actual helper: saved IDs `[a,w]`, followed by a loading render with no spaces, produces `{seen: [], changed: true}`. When `[a,leaf,w]` then loads, every tab is considered new and the helper emits no moves because the entire list matches its new-tab tail. `leaf` stays between the existing tabs. This defeats the promised handling of tabs created while the window was closed. Preserve the known IDs across incomplete layout reads and cover this loading-to-ready transition.

The existing targeted suite passes: 8 pass, 0 fail. It does not cover that transition.

Verdict: changes needed
