# Review B: core-skills

## Finding

### F1 — Fix, medium: response-body failures bypass the broadcast retry

Surface: `skills/broadcast-issue/scripts/discord-send.ts:68` (`deliver`), together with the DeliveryError-only catches in `sendWithRetry` and `main`.

Basis: implementation brief acceptance criterion 4 requires one retry for a failed delivery. Plan D8 also requires failures to be exposed after that retry and delivery to the configured targets.

When fetch returns a non-success response but its body fails while being consumed, `await response.text()` throws outside the fetch rejection handler. That error is not converted to `DeliveryError`, so neither the retry nor the per-target failure collection handles it. The sender aborts immediately and skips remaining targets. This is a delivery failure after response headers, not invalid input.

Reproduced against the unchanged worktree in a temporary process, using two synthetic webhook entries and replacing only fetch. The first call returned status 500 with this body:

```typescript
new ReadableStream({
  start(controller) {
    controller.error(new TypeError('response body connection reset'));
  },
})
```

Every subsequent fetch was configured to return 204. Calling the real exported `main` with the temporary env path and `--target PRIMARY --target SECONDARY` produced:

```json
{"attempts":1,"result":"failure","error":"response body connection reset"}
```

Expected: retry PRIMARY once, then attempt SECONDARY, for three calls and successful completion in this scenario. The probe caught the exception only to report it. It used no real secrets or network and its temporary files were removed.

Smallest repair: include response-body consumption in the specific transport-error boundary, preserving the target, known HTTP status, safe diagnostic context and request information in `DeliveryError`. Add a behavioral scenario for a failed error-response body, covering the retry and continuation to the next target. Preserve the one-retry limit and secret redaction.

## Scope and judgment

Reviewed the entire 26-file worktree diff against local `main` at `6e505a9ffeea195beb05826bb8f71e9e67281540`, which is also the merge base. Reviewed head: `36108aa868b6d0da5e5eef0d7546e43de94b0e43`. The worktree was clean.

Fresh-read authoritative state was `check.review`. Read the leaf's plan, implementation brief/report and original done-criteria, then inspected all five skill families, the local template/protocol, sender and tests, dependency/config files and scoped deletions. This judgment did not use the peer review or the earlier walkthrough's verdict as evidence.

No other blocking defect found. The phase/artifact conventions, no-debate synthesis, semantic worker reports, inline/standalone paths, repair ownership, concrete-defect review, configured merge recovery and issue-complete broadcast condition follow the plan. Local references resolve, both ponytail copies match the supplied file byte for byte, and the retired folders are absent. Changes remain inside the owned skill folders. Grounding is configured as none, and the diff introduces no lesson claim or indexed-doc change requiring separate verification.

## Verification and limits

- Targeted sender suite rerun for the delivery-error concern: 6 pass, 0 fail, 35 assertions. The existing tests do not cover F1.
- `bun run --cwd skills/broadcast-issue typecheck`: exit 0.
- `git diff --check main`: exit 0.
- Read the saved full-suite evidence, also 6 pass and 0 fail. No additional unchanged full-suite rerun was needed.
- Operator-only size/rule counting and fresh-agent readability acceptance remain as reported. Combined live command/skill integration belongs to the later `status` leaf and was not performed here.

Only this review file was written. Code and state were not edited.

fix
