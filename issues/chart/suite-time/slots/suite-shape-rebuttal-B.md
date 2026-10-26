# Suite shape rebuttal: slot B

D8. P3 is no longer my fixed recommendation after the new evidence. C's green 86.3 s `--parallel=4 --no-isolate` run makes bounded parallelism worth proving before adding an O1c seam. My failed, loaded isolate run does not refute that different mode. I would now consider P1 conditional on overlap proof and an explicit decision about which callers receive it. One quiet green run does not establish fleet reliability.

F19. P1 does not meet Q2's every-caller condition. The merged notes acknowledge that changing only checks.test leaves raw bun test serial. Judging proof by checks.test does not close that gap. The earlier suite-speed decision placed the speed change where every seat gets it. Either use a shared entry point and migrate callers, or explicitly narrow that requirement in the operator round.

R15. A cap and a done-criterion do not themselves remove load risk. The merged evidence includes timeouts at four workers under load. Four workers can allow 80 concurrent test bodies per suite, before overlapping leaves. Require green overlapping runs with preserved coverage and recorded wall/CPU cost. Present the remaining load limit as a limit, not a removed risk.

F20. “/tmp is tmpfs, so disk is not a cost” overstates the evidence. tmpfs avoids storage-device I/O. It still incurs filesystem operations, kernel CPU and memory use. src/shell.ts creates a directory and two capture files, reads both and deletes the directory per command. No measurement here isolates or rules out that cost. This is not evidence to remove capture, which protects against lost pipe output.

F21. The open-question attribution misstates B Q5. I asked to trial the prebuilt fake within this wall-time leaf, alongside the grouped trims, not to chart it separately as CPU work. My bytecode bundle and C's --compile binary are different experiments. The source-to-bytecode named-target pair saved 19.99% wall before build cost and 26.02% CPU, with all 48 expects preserved. It proves neither a 20% suite gain nor that compiled binaries are faster. Keep those claims separate when choosing scope.
