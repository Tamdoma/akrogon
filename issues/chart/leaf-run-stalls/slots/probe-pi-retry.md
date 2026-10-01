# Probe: pi agent-level retry under provider 503

Date: 2026-10-01 (runs 05:31:21Z to 05:32:49Z).
pi: 0.99.1, binary `/home/ivan/.local/share/mise/installs/pi/0.99.1/pi/pi` (no mise wrapper).
Extension: copy of `tamdoma-subagents` source. Its `node_modules` was a symlink to the real one, so the extension's own `@earendil-works/pi-coding-agent` 0.85.1 copy was present on disk.

## Verdict

1. V1 seat: pass. The delay cap applies and the retry counter resets after a successful reply.
2. V1 child: pass. A child spawned by tamdoma-subagents uses the host 0.99.1 retry code with the cap, not the extension's 0.85.1 copy. Uncapped 0.85.1 would wait 4000 ms before the 4th attempt. Observed 2503 ms.
3. V2: pass. A child with `cwd` set to a git worktree of the parent repo ran there and the parent got `completed`.
4. V3: pass. After the child used all its retries, the parent's `subagent_wait` result had `status: failed`, the 503 error text, and a transcript path to a file that exists.

## Setup (shared by all cases)

- Isolation: `PI_CODING_AGENT_DIR=<scratch>/pi-probe/agent` and `PI_OFFLINE=1`. Nothing under `/home/ivan/.pi/agent` was edited.
- `agent/settings.json`: `{"retry":{"enabled":true,"maxRetries":4,"baseDelayMs":1000,"maxAgentDelayMs":2500,"provider":{"maxRetries":0}}}`. Uncapped gaps would be 1, 2, 4, 8 s. Capped gaps should be 1, 2, 2.5, 2.5 s.
- `agent/models.json`: provider `probe`, `api: openai-completions`, `baseUrl: http://127.0.0.1:18765/v1`, dummy apiKey, model `stub` (non-reasoning).
- `agent/extensions/`:
  - `tamdoma-subagents`: copied `.ts` files and package.json, with its own `config.json` set to `{"model":"probe/stub","thinkingLevel":"off","fast":false,"autoCompaction":true,"compactionTokens":200000}`. A copy was needed because the worker settings file sits next to the extension code.
  - `tamdoma-pi-tweaks` and `tamdoma-env-guard`: copied, because the subagent extension imports them through `../` paths. The env-guard `node_modules` was a symlink.
  - `agent/cache/pi-codex-conversion`: a symlink to the real code-mode host binary cache. Children fail tool activation without it (`missing=[exec, wait]`).
- Stub: a bun HTTP server on 127.0.0.1:18765. It logged a timestamp, role, attempt number, and gap for each request. Role came from the request's tool list: `subagent_spawn` present means parent, `tamdoma_parent_question` present means child. A failing attempt got HTTP 503 with body `{"error":{"message":"service_overloaded: The service is temporarily overloaded. Please try again later.","type":"service_overloaded"}}`. Other attempts got streamed chat completions. In the child cases the parent got scripted tool calls: `subagent_spawn`, then `subagent_wait` with the returned id, then a final text echoing the wait result.
- Throwaway repo `<scratch>/pi-probe/repo` (one commit) with `git worktree add <scratch>/pi-probe/wt -b wt-branch`. The parent always ran with cwd = repo.
- Each pi run made exactly one HTTP request per attempt. Provider-level (SDK) retries did not add any extra requests.

## V1 seat

Command (cwd = repo):
```
PI_CODING_AGENT_DIR=$P/agent PI_OFFLINE=1 pi -p --model probe/stub --thinking off "SEAT_PROBE: read README.md then answer"
```
Script: parent attempts 1-3 get 503 and attempt 4 returns a `read` tool call. The follow-up request in the same session and the same run then gets 503 on attempts 5-7, and attempt 8 returns `SEAT_DONE`.

| attempt | time (UTC) | gap ms | response |
|---|---|---|---|
| 1 | 05:31:21.672 | - | 503 |
| 2 | 05:31:22.677 | 1005 | 503 |
| 3 | 05:31:24.681 | 2004 | 503 |
| 4 | 05:31:27.184 | 2503 | tool:read |
| 5 | 05:31:27.195 | 11 (tool run, no retry) | 503 |
| 6 | 05:31:28.198 | 1003 | 503 |
| 7 | 05:31:30.203 | 2005 | 503 |
| 8 | 05:31:32.706 | 2503 | text SEAT_DONE |

Result: exit 0, stdout `SEAT_DONE`, the session transcript holds 6 `stopReason:error` entries.
- Cap: the 3rd gap is 2503 ms. Uncapped it would be 4000 ms.
- Counter reset: burst 2 starts again at a 1 s delay and makes 3 more retries. Without a reset the run would have hit 6 retries, which is over `maxRetries` 4, so it would have failed at the 2nd retry of burst 2.

## V1 child

Command: same as the seat run, with prompt `"PARENT_PROBE: spawn a subagent and wait for it"`. Script: child attempts 1-3 get 503 and attempt 4 returns `CHILD_DONE`.

| role | attempt | time (UTC) | gap ms | response |
|---|---|---|---|---|
| parent | 1 | 05:32:15.328 | - | tool:subagent_spawn |
| child | 1 | 05:32:15.426 | - | 503 |
| parent | 2 | 05:32:15.426 | 98 | tool:subagent_wait |
| child | 2 | 05:32:16.430 | 1004 | 503 |
| child | 3 | 05:32:18.433 | 2003 | 503 |
| child | 4 | 05:32:20.936 | 2503 | text CHILD_DONE |
| parent | 3 | 05:32:20.944 | - | final text |

Result: the parent received `## sa-1 (completed)`, a transcript path, and `CHILD_DONE`. The child transcript holds 3 `stopReason:error` entries. The child's 3rd gap is capped at 2503 ms. This confirms the concern about the 0.85.1 copy does not hold at runtime: the host supplies `@earendil-works/pi-coding-agent` to the extension.

## V2 worktree cwd

Command: same, with prompt `"PARENT_PROBE: spawn a subagent in the worktree and wait for it"`. The stub's spawn call was `{"task":"CHILD_TASK: ...","cwd":"<scratch>/pi-probe/wt"}` and the child succeeded on its first attempt.

Result: the parent's request at 05:32:29.125 got the spawn call. The child replied at 05:32:29.233 and the parent's final reply came at 05:32:29.240. The parent got `## sa-1 (completed)` and `CHILD_DONE`. The child transcript header has `"cwd":".../pi-probe/wt"` and the transcript was stored under the `...-pi-probe-wt--` sessions directory. `resolveApprovedCwd` accepted the worktree through `isSameRepoWorktree`.

## V3 retries exhausted in child

Command: same as V1 child. Script: every child attempt gets 503.

| role | attempt | time (UTC) | gap ms | response |
|---|---|---|---|---|
| parent | 1 | 05:32:41.178 | - | tool:subagent_spawn |
| child | 1 | 05:32:41.273 | - | 503 |
| parent | 2 | 05:32:41.274 | 96 | tool:subagent_wait |
| child | 2 | 05:32:42.278 | 1005 | 503 |
| child | 3 | 05:32:44.281 | 2003 | 503 |
| child | 4 | 05:32:46.783 | 2502 | 503 |
| child | 5 | 05:32:49.286 | 2503 | 503 |
| parent | 3 | 05:32:49.292 | - | final text |

The child made 5 attempts in total (1 plus `maxRetries` 4). Two consecutive gaps sat at 2.5 s, so the delay stopped growing. The parent's `subagent_wait` tool result had `isError: false` and this content:
```
## sa-1 (failed)
Transcript: <scratch>/pi-probe/agent/sessions/--...-pi-probe-repo--/2026-10-01T05-32-41-195Z_01a0f5f3-596b-7401-a321-ca79236e7498.jsonl
Child prompt failed: child=sa-1 model=probe/stub thinkingLevel=off stop=stopReason=error(503: {"message":"service_overloaded: The service is temporarily overloaded. Please try again later.","type":"service_overloaded"}) lastProtocolSignal=none
```
`details.items[0]` = `{id: "sa-1", status: "failed", transcriptPath: <same path>}`. The transcript file existed (12336 bytes, 5 `stopReason:error` entries). The parent ran pi exit 0 and its final text echoed the failure.

## Limits (what this does not prove)

1. The production values (13 retries, 2000 ms base, 60000 ms cap) were not run. By the same formula they sleep 2+4+8+16+32+8x60 = 542 s, which is about 9 min before the final failure, plus request time. A real Meta overload longer than that still fails the seat or child.
2. The stub returns 503 at once with a JSON body. Other failure shapes were not tested: hangs, timeouts, 529 or 429, overload errors that arrive mid-stream after partial output, and different error text. Retryability was shown only for this status and body through the `openai-completions` API.
3. The real worker model is `devin/swe-2-max`, served by the `tamdoma-devin-provider` extension, and parent seats may use other providers. Those providers' error mapping, and whether their messages match pi's retryable patterns, were not exercised.
4. The seat burst shows only one capped gap. Consecutive capped gaps were shown in the V3 child.
5. Counter reset was shown within one `pi -p` run across a tool turn. Interactive TUI seats, herdr-managed seats, and RPC mode were not run.
6. There was one child at a time. Concurrent children retrying together, and a child retrying for about 9 min while the parent waits, were not tested. The spawn tool passes no runtime budget, and the 10 min completion backstop applies only to forced compaction, but neither was exercised.
7. The extension ran from a copy with a scratch `config.json`. The code and `node_modules` were identical to the installed extension, but the real install path was not run.

## Cleanup

- Stub stopped. Port 18765 had no listener afterwards and no `bun run stub` process was left.
- `<scratch>/pi-probe` deleted: agent dir, sessions, stub, logs, repo, and worktree. A temporary strings dump of the pi binary was also deleted.
- Symlink targets were checked intact after deletion: the real `tamdoma-subagents/node_modules`, `tamdoma-env-guard/node_modules`, and `~/.pi/agent/cache/pi-codex-conversion`. The real `tamdoma-subagents/config.json` mtime (01:10) is older than the probe.
- No credentials were read or printed. The only key used was the dummy key in the scratch `models.json`.
