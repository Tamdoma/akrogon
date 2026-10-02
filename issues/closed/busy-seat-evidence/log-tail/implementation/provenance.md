# Fixture provenance (returned verbatim by wave-1 workers)

## claude-session.jsonl

Harness: claude 2.1.287 (Claude Code). Captured 2026-10-02, verbatim (cmp-verified, never hand-edited).

Capture command, run in a fresh `mktemp -d` scratch cwd containing `note.txt` with content `hello`:

    claude -p "Run the shell command \`false\` three times, one at a time, then run \`echo done\`. Then read the file note.txt and edit it to say bye. Reply with one word." --model claude-haiku-4-5-20251001 --allowedTools Bash,Read,Edit

Exit 0. Copied from `~/.claude/projects/<scratch cwd with every non-alphanumeric replaced by ->/<session-uuid>.jsonl`; source session and scratch cwd deleted and confirmed absent.

## pi-session.jsonl

Harness: pi 1.0.0. Captured 2026-10-02, verbatim (cmp-verified, never hand-edited).

Capture command, run in a fresh `mktemp -d` scratch cwd (`/tmp/log-tail-u2-4A5xZc`) containing `note.txt` with content `hello`, with inherited pi session env scrubbed (first attempt inherited the parent's `exec`-only toolset):

    env -u PI_CODING_AGENT -u PI_SESSION_FILE -u PI_SESSION_ID -u PI_PROVIDER -u PI_MODEL -u PI_REASONING_LEVEL -u TAMDOMA_WORKER_COMMAND pi -p --no-extensions --no-skills --no-context-files "Run the shell command \`false\` three times, one at a time, then run \`echo done\`. Then read the file note.txt and edit it to say bye. Reply with one word."

Exit 0. Copied from `~/.pi/agent/sessions/--<scratch>--/<ts>_<id>.jsonl`; source session and scratch cwd deleted and confirmed absent.

Shape note: this run records non-zero exits as `isError:true` + `content[].text` "Command exited with code 1" with NO `details.capture.termination`; the incident log uses `details.capture.termination {kind, exitCode}` with `isError:false`. Both shapes exist and both are tested.

## codex-session.jsonl

Harness: codex-cli 0.160.0. Captured 2026-10-02 ~16:50 CEST, verbatim (cmp-verified, never hand-edited).

Capture command, run in a `mktemp` scratch cwd containing `note.txt` with content `hello` (single-quoted prompt; the first double-quoted attempt had the shell eat the backticks and produced no tool calls):

    codex exec -s workspace-write --skip-git-repo-check 'Run the shell command `false` three times, one at a time, then run `echo done`. Then read the file note.txt and edit it to say bye. Reply with one word.'

Exit 0. Copied from `~/.codex/sessions/2026/10/02/rollout-2026-10-02T16-50-19-01a0fd18-3d42-79f1-92c1-97e855302a08.jsonl`; both run-created rollout files and the scratch cwd deleted and confirmed absent. Codex performed the read via `cat note.txt` inside `exec` and the edit via `apply_patch` (no file tool exists in this harness shape).

## pi-incident-excerpt.jsonl

Verbatim excerpt of `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-emdash-launch--/2026-10-01T10-40-07-084Z_01a0f70c-cfac-7437-a9a0-f4ec47260613.jsonl` (pi 1.0.0, recorded 2026-10-01, emdash-launch incident), source lines 1, 8, 422, 461, 462, 485, 486, 487, 488, 684, 685, 686 — each cmp-verified byte-identical. Checked free of framework `.env` values (`env -i` scrubbed check printed `clean`) before commit.

## codex-exec-excerpt.jsonl

Verbatim excerpt of `/home/ivan/.codex/sessions/2026/10/02/rollout-2026-10-02T12-45-55-01a0fc38-7cb2-7f31-8388-738b9b09bf4b.jsonl` (codex-cli 0.160.0, recorded 2026-10-02), source lines 1, 18, 460, 466 — each cmp-verified byte-identical. Checked free of framework `.env` values (`env -i` scrubbed check printed `clean`) before commit.
