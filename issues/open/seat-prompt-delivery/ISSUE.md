# Issue: seat-prompt-delivery

- [one-attempt-per-pass](one-attempt-per-pass/brief.md): one `akrogon next` pass makes at most one delivery attempt per seat, records a retryable herdr failure with its identity, checks an ambiguous timeout against the seat's session file, and fails a leaf with a reason that names the seat and the last error.
