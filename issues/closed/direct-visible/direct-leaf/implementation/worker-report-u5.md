# Wave-3 worker U5 report (archive note)

Commit 9c9028f2 (picked as 0682f51b): broadcastPass direct branch (probe through seat.B's own
session, send only idle/done, prompted.B/delivery_error.B with settle rules, no allocation), closed
broadcast-pending leaves in the status JSON with text tables unchanged, D8 webhook_env sweep in
green-merge/batch-dispatch fixtures. Honest mismatch return: T3's lifecycle control could never
commit identical file content over the landed tip — corrected by A in 62aaa5b6. Limitation noted:
direct broadcast sends write no prompt timing row (effect-free for direct leaves).
