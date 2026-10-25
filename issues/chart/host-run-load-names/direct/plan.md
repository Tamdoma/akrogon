# Direct plan: host-run-load-names

1. A run-check whose command, after trailing space and quotes, ends with the configured command of a check listed in `full`, at a boundary (start, space, `;`, `&`, `|`, `(` or a quote before it), runs as full whatever its name. Proof: tests/run-permit.test.ts new case, red before the change.
2. A run whose command adds anything after that command (`bun test one.test.ts`) or only ends with it inside a longer word (`xbun test`) starts at once. Same case.
3. Named full runs keep working: existing full-suite cases stay green.
4. Docs: docs/reference/config.md and docs/reference/checks.md `full` lines say a command match counts too.
5. Green `akrogon verify` on the head, B review ready, then push to main, deploy.
