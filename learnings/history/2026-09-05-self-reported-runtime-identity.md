# A worker acknowledgment does not establish runtime identity

What failed: a live native Codex probe launched with model `gpt-5.6-luna` and reasoning setting
`high` accepted one prompt and wrote a valid structured acknowledgment. It reported model `gpt-5`,
effort `unknown`, and harness `unknown`. The configured identity gate would reject that response.
Independent production-prompt probes also found unknown effort in Claude and unknown model,
effort, and harness in Pi. All three wrote valid acknowledgment files and failed strict identity
equality. Pi wrote its file even though the transport reported a stalled prompt.

Root cause: the handshake asked the worker to establish facts it does not necessarily receive.
Launch arguments configure the runtime, but do not guarantee that the model can inspect them.
Fixture responses supplied the expected values and therefore could not expose this assumption.

Fix: remove the separate identity exchange and its gate. The existing dispatch record stores
configured launch settings. The existing task receipt confirms acknowledgment, then heartbeat and
committed proof track progress and completion. The operator approved trusting configured settings
where independent runtime evidence is unavailable. Expected values are not backend attestation.

Lesson: define the authority for each protocol field before implementation. Separate worker
acknowledgment, configured launch parameters, and independently observed runtime identity. During
planning and review, require live evidence for capabilities delegated to an external runtime.
This prevention is proposed, not yet enforced by the issue workflow.
Prefer an existing evidence channel over a second handshake serving the same purpose. Receipt
timestamp scoping assumes the runner and workers share the host clock.
