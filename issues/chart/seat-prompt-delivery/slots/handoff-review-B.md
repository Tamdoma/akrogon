# Implementer review B

Draft paths below are relative to this handoff directory. Akrogon code references are to `origin/main`, inspected with `git show origin/main:<path>`, not the older working checkout. Taken choices of one counter, failed/unreachable handling and whole-phase recovery are preserved.

## seat-prompt-delivery / one-attempt-per-pass

### F1 — Session value is not necessarily an ID

**Draft:** `brief.md:4`, criterion 3; `design.md:32`.

**Evidence:** Pi's live Herdr integration prefers the absolute session path returned by getSessionFile and reports `agent_session_path`, falling back to an ID only when no path exists (`/home/ivan/.pi/agent/extensions/herdr-agent-state.ts:73-105`). Herdr returns both `kind` and `value` (`/home/ivan/Work/infra/herdrdev/herdr-patched/src/api/schema/agents.rs:225-230`). Akrogon's `src/shell.ts:74-80` currently retains only value. Matching `*_<value>.jsonl` fails when value is an absolute path. Timestamp-plus-ID filenames do exist, but that does not make every reported value an ID.

**Write instead:** Preserve and use the session-reference kind. Read a reported path directly; perform the scoped ID lookup only for an ID reference. Add `src/shell.ts` to ownership if extending the schema. Test path, ID, missing reference, multiple matches and session replacement between observation and prompt completion. Keep target session identity distinct from the invoking pane.

### F2 — The “unique prompt line” is not unique to an attempt

**Draft:** `brief.md:4`, criterion 3; `design.md:32`.

**Evidence:** The literal prompt is constructed from skill, slug, slot, phase and leaf only (`src/next.ts:399`). Recovery to the same phase and repeated check.review rounds can produce the identical text in the same pi session. A whole-file substring search can therefore treat a new failed delivery as success based on an old user message or a quoted assistant/tool message. Pi sessions store structured message records, not a flat transcript of prompt lines (`/home/ivan/.pi/agent/extensions/tamdoma-subagents/node_modules/@earendil-works/pi-coding-agent/dist/core/agent-session.js:388-398`).

**Write instead:** Parse complete JSONL message records and match exact user text within the current submission window, using a pre-send file position or equivalent attempt boundary. Recheck unresolved timeout delivery before the next resend so a message appended after the timeout read is recognized. Specify incomplete trailing-record handling without discarding other valid records. Add old-identical-prompt, assistant-quoted-prompt, partial-tail and late-arrival tests. The taken session-file check remains the mechanism; it needs attempt correlation to work.

### F3 — The proposed order fails on pass four, not failed pass three

**Draft:** `design.md:23` versus `brief.md:4` and criterion 2.

**Evidence:** The design retains the cap check before increment/send, then records a retryable error and returns. Starting at zero yields attempts 1, 2 and 3 on the first three failed passes without a transition; only the fourth entry sees `attempts >= 3`. This is the original placement at `src/next.ts:362-372`, whose loop previously re-entered it immediately. The design also charges successful sends and a successful start followed by a non-idle observation (`:396-398`), while the failure promise says three failed passes. A cap reached after successes may have no delivery_error from which to build the required reason.

**Write instead:** After resolving the current outcome, record its error and commit failure on the third failed delivery in that pass. Define how the single counter treats successful delivery and start-without-prompt so it cannot report three failures from successful attempts or read a nonexistent last error. Test exactly three failures, success interleaved with failures, and start-success/non-idle. One counter remains sufficient if its meaning is explicit.

### F4 — The fixture home does not redirect pi's home or select pi

**Draft:** `design.md:32`; criterion 3.

**Evidence:** `tests/helpers.ts:40-42` overrides AKROGON_HOME but inherits HOME. Its slot harness is `fake`, not pi (`:23-29`). The proposed non-pi skip therefore bypasses the session lookup in an unchanged dispatchFixture, and files under fixture.home are not under the actual `~/.pi/agent/sessions` lookup.

**Write instead:** Have these tests explicitly supply a temporary HOME for the CLI process and configure a pi harness represented by fake-herdr, or inject the session lookup root through a testable function. Build realistic JSONL records there. Do not inspect the developer's real sessions during tests. The draft already owns per-call fake-herdr scripting; use it to exercise start errors and timeout outcomes as separate operations.

### F5 — Unstructured command failure has no specified code/message mapping

**Draft:** `brief.md:4,14`; `design.md:24,31,33`.

**Evidence:** The required state and failure reason assume a structured Herdr `{error:{code,message}}` response. `src/shell.ts:104-113` returns non-retryable for invalid JSON or invalid error shape, so the new “all non-retryable errors fail unreachable” path also receives plain stderr and malformed responses with no such fields. The parsed schema is private in shell.ts (`:93`), while shell.ts is omitted from ownership.

**Write instead:** Own shared error decoding and specify structured versus transport/unstructured outcomes, preserving exit status and useful stderr for the latter. Test non-JSON stderr and malformed JSON error objects alongside a valid non-retryable Herdr code. Reusing failure.cause `attempts` is compatible with the existing enum; inventing a new enum value is unnecessary, but the reason must remain buildable for every promised error path.

### F6 — “Manual passes only” is not established by this leaf

**Draft:** `brief.md:4,7`; `design.md:9,23,35`.

**Evidence:** `origin/main:plugin/herdr-plugin.toml:10-27` invokes next at startup and on four events. `src/next.ts:583-595` accepts those hook invocations. Removing the inner retry loop still permits a retry on an automatic event pass, contrary to “the next manual next” as the only retry trigger.

**Write instead:** Either explicitly scope the rule to one attempt per invocation, including existing hooks, with no new automatic trigger, or give the manual-only policy an owner and corresponding changes/tests. Do not leave the implementer to choose between the written lock and existing event-driven dispatch. A transport fix alone does not disable automatic passes.

### F7 — Mixed busy/idle status criterion is unresolved

**Draft:** `brief.md:16` says show the error for a leaf that is not busy; `design.md:26` says whenever an error is recorded.

**Evidence:** Status computes busy independently per seat (`src/status.ts:87-96`). The reported problem includes one seat delivering while the other cannot receive a prompt, so the peer may remain busy when the failing seat is idle. Suppressing all delivery errors for any busy leaf hides that case.

**Write instead:** Specify per-seat visibility: show B's recorded error when B is not busy even if A is busy, and define whether stale B errors remain visible when B becomes busy. Add mixed-seat and legacy-state-with-no-delivery_error tests. Keep the existing NOTE column and append the token there (`src/status.ts:85,97-107`); no table redesign is needed.

## env-file-rule / skills-env-file-rule

### F8 — The whole-tree grep criterion is impossible within ownership

**Draft:** `brief.md:12` criterion 3; `design.md:16,21,27`.

**Evidence:** `git grep -n '\.env' origin/main -- skills` returns `skills/chart-issues/SKILL.md:47` and `skills/chart-issues/assets/standing-design.md:11`, neither an allowed match in criterion 3. Both are outside the five owned files, and chart-issues is explicitly excluded. The standing design's existing statement that agents may read the file is also broader than the criterion's ban on every skill sentence saying read. A loose regex additionally matches `process.env` in the broadcast test.

**Write instead:** Review the four phase skills and skills/AREA.md for instructions that directly read or modify operator env files, while allowing the loader and existing missing-value stops. Treat whole-tree literal `.env` matches as an inventory with documented out-of-scope matches, not a closed whitelist that requires unrelated edits. Keep the plan-issue line-57 rewrite and adjacent placement as specified; they are concrete enough to implement.
