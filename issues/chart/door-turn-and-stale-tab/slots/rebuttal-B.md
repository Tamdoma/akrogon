1. F5 · The notification timing is misattributed to B. I verified the background wait and footer, followed by the operator's return, at transcript lines 592, 595 and 599. I did not establish that a notification was queued only after the operator returned. Attribute that finding to A alone unless A supplies the supporting row.

2. F6 · Restore the harness timeout bound in 1a. T must be below the timeout granted to the tool call, as well as at most 30000 after prompting. The 30000 cap alone can let the harness kill a wait before Herdr returns its structured timeout.

3. F7 · “Idle with no file” is incomplete. Idle without a non-empty return file is peer failure, including an existing empty file. Neither idle nor file existence alone supplies the peer's answer.
