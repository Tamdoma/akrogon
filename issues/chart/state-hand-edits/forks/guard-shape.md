# Guard shape

## Question

### 1 · How should akrogon stop a seat from writing a leaf's state file by hand?

Seat A on the framework leaf halt-record edited `state.yaml` with its edit tool, writing a phase that does not exist. Had it written a real phase, every move guard in `akrogon phase` would have been skipped with no error anywhere. `saveState` in src/state.ts is the only command writer, and it replaces the file by writing a temp file and renaming it over the old one.

Research: better-than-training · src/state.ts `saveState`, src/shell.ts `writeYaml`, docs/use/when-work-fails.md, read 2026-11-24 · one writer, temp-then-rename, docs already forbid hand edits · made a file-mode block cheap. better-than-training · free probe 2026-11-24 (below) · a 0444 file refuses a direct write and a shell redirect with EACCES, and a temp-then-rename write still replaces it · confirmed 1a works with the existing writer unchanged. model-knowledge · POSIX: rename needs write permission on the directory, not the target file; no outside practitioner source applies to this repo's own mechanism (none searched).

- **1a (recommended)** `saveState` leaves `state.yaml` read-only (mode 0444) after every write. A seat's edit or write tool then fails on the spot with "permission denied", inside the seat's own turn, which points it back to the command its skill names. One line in the one writer, no new records. Cost: a deliberate bypass (`chmod`, `sed -i`, `mv` over the file) still works, and an operator editing on purpose needs `chmod u+w` or `:w!`.
- **1b** akrogon stores a digest of each state it writes and `next` refuses a leaf whose file no longer matches, until an operator accepts it with a new command. Catches every bypass. Cost: a new store, a new command, and a stuck leaf in someone else's terminal hours later instead of an error in the seat's turn.
- **1c** add "never edit state.yaml" to the seat skills. Cost: the seat already ignored a skill instruction, so this adds text without a mechanism.

```text
1a                          1b
seat edit -> EACCES now     seat edit -> ok
seat runs akrogon phase     next (later) -> refuse leaf
                            operator -> accept command
```

How to choose: 1a is the safe pick for agents that misuse tools. Pick 1b only if deliberate bypasses by seats are observed.

Pitfalls avoided: the file block must not break akrogon's own writes, which the probe shows rename keeps working (done-criterion 1 re-proves it in the leaf). Tests that overwrite a command-written state with a plain write would now fail with EACCES; the leaf's plan finds and adapts them, and the repo `checks` catch any it misses. The docs gain one line naming the block so an operator is not surprised (done-criterion 3).

Reply `1a`, `1b` or `1c`.

Challenge check: a practitioner could say a mode bit is advisory against a determined actor. True, and stated as 1a's cost. The observed failure was a careless tool edit, which 1a stops.

### Carries

- signposts 1a 2a 3a (forks/signposts.md)

## Findings

Free probe, 2026-11-24, A (uid 1000, Linux 7.2.15, bun 1.4.5), scratchpad folder since removed:

- command: `bun -e` writing `state.yaml`, `chmodSync(0o444)`, then `writeFileSync` on it; then write `state.yaml.1.tmp` and `renameSync` over it; then `echo 'phase: d' > state.yaml` in bash.
- result: direct write `EACCES`; rename write replaced content (`phase: c`) and the mode stayed 444 after a re-chmod; shell redirect `Permission denied`, content unchanged.
- cleanup: scratch folder removed.
- limits: does not observe pi's, Claude Code's or codex's edit tools on a 0444 file, and does not cover root, which ignores mode bits.

## Taken

A's pick (full autopilot, 2026-11-24): 1a. Reason: signpost 1a, it stops the observed failure in the seat's own turn with one line in the only writer. Rejected: 1b adds a store, a command and a delayed stuck leaf for bypasses not observed; 1c is text the seat already ignored. No consultant dissent (no consultants).

Binding decisions from 1a: the read-only mode is set by `saveState` after every command write; `writeYaml` and other YAML files keep their current mode; the docs name the block.
