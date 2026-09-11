# A failing self-test was pushed because the verification pipeline masked the exit code

What failed: commit 481efc6e was pushed while its own new assertion failed. The verification
command was `bun ... --self-test 2>&1 | tail -1 && next`: without pipefail, `&&` checked tail's
exit status, not bun's, so a red suite looked green.

Root cause: verification discipline, not code. The check trusted a pipeline's tail status and a
one-line grep of output instead of the suite's exit code.

Fix: 5b4db1b1 fixed the test (plus the fixture divergence it exposed: the fake paneClose never
removed the pane from the pane list). Verification now runs with `set -o pipefail` or checks the
suite's exit code directly.

Lesson: the exit code of the test process is the only pass signal — never a piped transform of its
output. Peer verification helped: helper-codex ran the suite independently and confirmed the same
failure, which is exactly why both agents run the full suite on every shared commit.
