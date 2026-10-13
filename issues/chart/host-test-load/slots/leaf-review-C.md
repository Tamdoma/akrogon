# Leaf review, slot C

## run-permit

One disagreement; otherwise accepted as is.

- File: `run-permit/design.md:83,86` (architecture Owned list). Problem: the lock file `run.lock` and holder sidecar `run-holder.yaml` are created in `globalHome()`, which defaults to the akrogon repo root (`src/config.ts:197-199`), and neither is gitignored. The repo `.gitignore:5-6` covers the existing `.lock` and `paused.yaml` for exactly this reason. Without entries, the first live run-check leaves untracked state files in the operator's akrogon checkout, free to be swept into a commit. Replacement: in Owned, after the `src/permit.ts` block add "- `.gitignore`: add `run.lock` and `run-holder.yaml` beside the existing `.lock` and `paused.yaml` entries."

## seat-containment

One disagreement; otherwise accepted as is.

- File: `seat-containment/design.md:90` (Interpretation) read with `:102` (`inOwnScope`). Problem: the unit-test story cannot work as written. Interpretation says fakes on PATH suffice, but `inOwnScope` reads `/proc/<pid>/stat` and `/proc/<pid>/cgroup` directly, and no fake on PATH can change a real process's cgroup. The fake herdr is a JSON state script with no shell processes and no `pane process-info` or `pane close` handler (`tests/fake-herdr.ts:110-275` command list; fixture shape at `tests/helpers.ts:86-94`), so once `allocate` adopts and verifies on every dispatch, every existing `next` test either needs real systemd or fails closed forever. The design names no seam that resolves this, so an implementer must invent one mid-leaf. Replacement text, add to the `src/scope.ts` architecture block: "- All `/proc` reads go through a proc root: `AKROGON_PROC_ROOT` when set (validated as a non-blank absolute path, the `AKROGON_LEAF_TEMP_ROOT` pattern at `src/config.ts:266-268`), `/proc` otherwise. In tests, fake herdr returns a fixed shell pid, the fixture seeds `<root>/<pid>/stat`, and the fake busctl writes `<root>/<pid>/cgroup` for the adopted scope, so `inOwnScope` runs unmodified against fixture files. Live criteria use the default root."

## leaf-stop

Two disagreements; otherwise accepted as is.

- File: `leaf-stop/design.md:83` (stop bullet), against brief criterion 3. Problem: `systemctl stop` fails when the unit does not exist (systemctl man page, `stop` entry: "This command will fail if the unit does not exist"). A stopped leaf's transient slice is exactly the unit most likely to not exist: after a user-manager restart or reboot it was never loaded (seat-containment design itself says empty leaf slices remain only "until the user manager restarts", `seat-containment/design.md:109`), and leaves whose shells exited on their own are in the same state. As designed, `stop` then reports a retryable failure forever for a leaf with literally nothing running, and a second `stop` on an already-stopped leaf can land here too. Replacement: add to criterion 3's scope in `leaf-stop/brief.md` and to the design stop bullet: "When the leaf slice is not loaded, stop succeeds: the entry is recorded and the command exits zero. Only a failure to stop a loaded slice keeps the fence, prints the error and exits non-zero."
- File: `leaf-stop/design.md:82` (architecture Owned list). Problem: same omission as run-permit. `stopped.yaml` is created in `globalHome()`, defaulting to the repo root, and `.gitignore:5-6` has no entry for it, so the first `akrogon stop` leaves untracked state in the operator's akrogon checkout. Replacement: in Owned, after the `src/stop.ts` block add "- `.gitignore`: add `stopped.yaml` beside the existing `paused.yaml` entry."
