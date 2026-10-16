# Brief: state-home

## What
akrogon keeps its machine state in `~/.akrogon` (or `AKROGON_HOME` when set) instead of the akrogon checkout it runs from. The first akrogon command after this change deploys moves the existing state there by itself, once.

## Why
Machine state lives in whatever tree runs the code (`globalHome()` defaults to `toolRoot`, src/config.ts). `akrogon init` writes the tracked `config.yaml` in the workspace, so registering a repo dirties the checkout and can block self-update, and a records move of the workspace branch can swap config under live seats. release-deploy needs state outside any code tree before code can run from release folders.

## Done-criteria
1. With `AKROGON_HOME` unset, every file akrogon reads or writes through its state home (machine `config.yaml`, global `.lock`, pause and stop files, run records under `runs/`, reconcile reports, held and admission files) lives under `~/.akrogon`; with `AKROGON_HOME` set, under that directory. `bun src/akrogon.ts` run from any akrogon checkout uses the same state home as the installed command.
2. `akrogon init` registers a repo into the state home `config.yaml` and changes no tracked file of the akrogon checkout.
3. Cutover: on a host whose state is in the tool root and whose state home has no `config.yaml`, the first akrogon command copies the state into the state home and prints one line naming the source and destination; the command then completes normally. A relative `repos:` entry is rewritten to the absolute path it resolved to before the move.
4. During cutover no tracked file of the akrogon checkout is deleted or modified (`git status` shows no change to them). Until cutover completes every command, old code or new, uses the tool-root home; cutover runs only while no live run record exists in the tool-root `runs/`, holding the tool-root global lock and the admission locks, so a command already running when the new code deploys (including one that admits another checked run) ends with every record it wrote visible to commands after cutover, and no command writes state to the tool root after cutover completes. (B)
5. After cutover, a state home `config.yaml` that exists is the only config read; the tool-root copy is never read again, even when it differs.
6. README and docs/guide/install.md name `~/.akrogon/config.yaml` (or `AKROGON_HOME`) as the machine configuration.
