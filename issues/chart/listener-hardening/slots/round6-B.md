The proven fault is an inconsistent Moshi view-selection handoff. The captured phone UI combines one conversation with another terminal's workspace. The outer mosh connections remain alive while their per-terminal attachments switch. I cannot prove the exact handler that leaves Chat View on “Connecting…”.

## F1 — The displayed conversation and effective terminal disagree

I inspected `round6-phone.jpg`: title `c-akrogon`, subtitle `Himne • Connecting… • main`, and the akrogon conversation below it.

Read-only core queries establish that these are different terminals:

```sh
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"doc.get","params":{"name":"moshi-hook.selection"}}' | HC_SESSION=infra hc connect
HC_SESSION=infra hc get --json t6x
```

The selection returned `{"terminal":"t6x"}`, version 40 initially and 42 later. `t6x` is live, its foreground Claude works in `/home/ivan/Work/personal/Himne`, and its tab label identifies `c-himne`. Reading the `herdr-app` document confirms `t15` belongs to tab `c-akrogon`, while `t6x` belongs to tab `c-himne`.

`moshi-hook logs -n 300` additionally records:

```text
12:14:43.418 gateway prompt: injected image ... pane=t6x
12:14:44.321 gateway prompt: text submitted ... session=00fe88c3-c31c-4ea6-98ee-ec84195a2cf5 terminalKind=hc pane=t6x
12:15:22.085 gateway prompt: text submitted ... session=4a3df037-e5ba-4393-85f4-67eb6d4ba7e8 terminalKind=hc pane=t15
```

Thus the effective prompt destination changes too. A stale conversation title is material, not merely a terminal redraw. These logs do not independently establish which destination the operator intended for each message.

## F2 — The captured switches are attachment changes inside surviving mosh connections

Host process inspection must run outside Codex's PID namespace. I used:

```sh
hc exec -- ps -C mosh-server,moshi-hook,herdr-core -o pid,ppid,lstart,args
HC_SESSION=infra hc server status
```

The two mosh-server/wrapper pairs remain PID `2845920/2845921`, started `11:37:55`, and `2850395/2850396`, started `11:38:08`. Their child commands are `herdr-core attach --history 1000 <terminal>`. The core is PID `933463`, version `0.1.18`, with roughly three days' uptime.

The clean portion of `scratchpad/attach.log` shows:

```text
12:13:09 attach=[3555496:t6x 3555517:t6x ]
12:14:54 attach=[3608502:t15 3608566:t15 ]
12:16:53 attach=[3662393:t6x 3662418:t6x ]
```

The `12:12:34.921` `moshi-hook.selection` version-40 event coincides with the earlier switch to t6x. This establishes coordinated target switching, not repeated replacement of the mosh sessions or core. The pre-12:13 logger included its own matching processes and cannot support a claim of once-per-second attachment churn.

## F3 — Moshi owns this selection mechanism, and unchanged targets are already compared

Installed hook: `moshi-hook version 0.4.50`, SHA-256 `1855e2713fc9752aa9ea32df9d679854661ce957c648b66c849be1cbc913b3ae`.

I inspected the binary without executing its attach/focus paths, using `strings`, `readelf`, its Go `.gopclntab` function records, and `objdump`. Relevant installed-code addresses:

| Function | Address / evidence |
|---|---|
| `hc.watch` | `0x5ff9a0`; selected/current string length and byte comparisons at `0x5ffae0–0x5ffb18`, including `runtime.memequal` at `0x5ffaf7`; equality returns to the wait loop. |
| `hc.runAttach` | `0x600740`; calls `os/exec.CommandContext` and `(*Cmd).Run`. |
| `(*followSelection).selected` | `0x60d380`; reads both `windowLayout` and `readSelection`. |
| `writeSelection` callers | `focusHeadless` at `0x60cecb`, `reselect` at `0x60e544`, and `documentLayout` at `0x6105b2`. |

`FocusWorkspace` calls `focusHeadless`. Close/prune paths call `reselect`. Therefore Moshi's workspace-selection and layout-repair paths can write the document. The observed document event alone does not identify its exact writer. It also does **not** prove that every write restarts attachments: the installed follower already compares terminal IDs.

`rg -n 'moshi-hook\.selection|moshi-hook' src /home/ivan/Work/infra/herdr-setup/lib /home/ivan/Work/infra/herdr-setup/mods` found no matches. The consultant helper writes `herdr-app` and `herdr-setup.consultant-column`. The inspected desktop view selected Himne, consistent with t6x. I found no evidence of our mods or akrogon fighting the selection in this interval.

## What remains unproved

- U1: The precise mobile/gateway subscription or readiness failure behind persistent “Connecting…”. The screenshot is Chat View, while the observed subprocesses are terminal attachments. Those are separate lifecycles. No mobile trace or readable Moshi source was available. Fetching the identified repository files through GitHub returned 404.
- U2: A UDP/firewall/mobile-backgrounding failure. Surviving server processes alone cannot establish network continuity, but the evidence does not justify changing networking.
- U3: An exact old-versus-new implementation comparison. Old stability is the operator's observation. Its former local source path is now absent.

## Smallest correction and owner

The correction belongs in **Moshi's hc integration and mobile view-selection handling**, especially the selection/follow/workspace paths identified above. A selected terminal, workspace, agent session, displayed conversation, and prompt destination must change as one acknowledged view selection. An old conversation must not remain presented as the current destination after the effective terminal changes. Keep the surviving session transport and complete the view handoff within it. The exact code repair for the stalled readiness transition requires that source or a mobile/gateway trace.

The systemic migration difference is from one persistent multiplexer TUI session to a wrapper that follows a selected terminal and replaces its raw attachment when that terminal changes. That replacement is visible in the process evidence. The terminal core survives, but the phone now has additional selection and conversation state to reconcile. The captured inconsistency is in that reconciliation. Preserving the old stable experience requires a coherent view handoff, not an akrogon listener or tab-order patch.

Acceptance proof should switch between t15 and t6x repeatedly, verify the conversation/header/prompt destination agree after each switch, and show that readiness completes without requiring a fresh phone connection. Unrelated document writes with an unchanged terminal should leave the attachment untouched.
