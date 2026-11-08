# Brief: notices-on-hc

## What

akrogon's notices reach the herdr-app window through herdr-setup's `session-status` bar:

- each notice is one JSON file `{"title": <text>, "body": <text>, "attention": <bool>}` written atomically (temporary name, then rename to `<id>.json`) into `<app home>/akrogon-notices/` of the resolved session, the app home from the engine's function;
- callers: busy (60-minute deadline), merged, failed, main red, merge slow, and the watcher's needs-you through one akrogon notice verb, `akrogon notice --title <text> --body <text> [--attention]`, with its row in `docs/reference/commands.md` (E); titles, bodies and attention as today (attention for failed, merged and needs-you; busy, main red and merge slow silent; no click action; the merge step stays body text);
- akrogon's next event-driven pass reads a deleted file as `shown` and a remaining one as `pending`, folded into today's records (`busy_notified`, merge `batch.notified`, `failure.delivery`, verify `notice`); a notice whose condition cleared is removed before it shows; verify's `noticeCovers` reads: pending covers while its file exists, shown covers, a failed write never covers, and the pid and boot clauses go (C);
- today's `herdr notification show` calls and the old session lookup only they used are deleted.

Consumes from engine-on-hc (blocked-by): the session resolution and the app home function in the hc module, the hc-based dispatch these callers sit in, and the real-core fixture.

## Why

Notices go through old herdr's notification command today, which goes away; the operator still needs the same toasts and sounds in herdr-app, with the window closed handled by waiting (forks/notices.md).

## Done-criteria

1. Each caller writes one notice file atomically into the resolved session's `akrogon-notices/` folder with today's title, body and attention flag, and the next pass records a deleted file as shown and a present one as pending in today's records. Proof: own tests in the `test` check.
2. A notice whose condition cleared (busy seat finished, failed leaf recovered) is removed before it shows. Proof: own test in the `test` check.
3. `noticeCovers` treats a pending notice as covering while its file exists, also after the sending pid ended, a shown one as covering, and a failed write as not covering. Proof: own test in the `test` check (C).
4. In a throwaway herdr-app session with herdr-setup's `session-status` handler installed: a notice written with the window open shows as a toast, plays the attention sound when `attention` is true, and its file is deleted; a notice written with the window closed waits and shows after the window opens; the check fails clearly, naming herdr-setup, when the handler is not installed (a posting failure keeping the file is status-notices' own routine test) (C). Proof: attended window tier (free), artifact in the report.
5. No `herdr notification` call remains in `src/` or the watch skill's needs-you line, and no notice caller uses the old herdr session lookup; the old lookup functions themselves are deleted only if nothing else imports them (B,C,E). Proof: a scoped grep recorded in the report.
6. The leaf's verify `test` duration and today's baseline (median 75 s) are both recorded in the implementation report; a rise of more than about 10 s is explained there, and every old test this leaf replaces is named.
