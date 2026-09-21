# Seat A skill failure: provider context mismatch

The systemic cause is the Devin provider adapter reading an older pi context format. Pi recorded the skill list and 12 tools, but the adapter drops both when encoding the current transcript. The custom-model warning and bare skill-name prompt are not the primary cause. Fix the provider boundary before changing akrogon's prompt.

## Findings

**F1. The session contains the missing instructions and tools.** In `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-close-verb--/2026-09-21T21-24-27-988Z_01a0c5db-22d4-72da-aa26-8b924f94de0b.jsonl:4`, the system message has empty `content`, but populated `sections.preamble`, `sections.skills`, and `sections.cwd`. The skills section includes `check-issue`. `toolsAdded` contains 12 tools, including read, bash, edit and write. Empty content does not mean an empty system prompt in this format. Lines 5 and 7 record the user prompts; lines 6 and 8 contain assistant replies with no tool calls and stop reason `stop` on `devin-cloud` / `swe-2-max`.

**F2. The running installation is pi 0.87.0, not the older SDK copy inside tamdoma-subagents.** `/home/ivan/.local/bin/pi:2-4` invokes mise and then the selected pi executable. `mise where pi` resolved `/home/ivan/.local/share/mise/installs/pi/0.87.0`, whose executable is `pi/pi` and whose package declares 0.87.0. The local source under `tamdoma-subagents/node_modules/@earendil-works/pi-coding-agent` declares 0.85.1, so it must not be treated as the running implementation. I inspected matching tagged 0.87.0 source as well as the installed documentation.

Pi 0.87.0's provider documentation explicitly says to use `getCurrentSystemPrompt(context.messages)` and `getCurrentTools(context.messages)`, rather than `context.systemPrompt` and `context.tools` (`/home/ivan/.local/share/mise/installs/pi/0.87.0/pi/docs/custom-provider.md:409-433`). Its normalized `TranscriptContext` contains messages, with instructions and tools carried by system messages ([types.ts, lines 491-505 and 625-634](https://github.com/earendil-works/pi/blob/v0.87.0/packages/ai/src/types.ts#L625)).

**F3. The Devin encoder still consumes the obsolete fields.** `/home/ivan/.pi/agent/npm/node_modules/pi-devin-provider/extensions/devin/stream.ts:27,47` passes the received context into `buildChatRequest`. In that directory's `protocol.ts:41-42,62,66`, it serializes `context.messages`, reads tools from `context.tools ?? []`, and emits system instructions only from `context.systemPrompt`. `messageForWire` handles user and tool-result messages explicitly, then assumes the remaining content is assistant blocks (`protocol.ts:150-166`). For this session's system message, empty content produces no wire message. It never reads `sections` or `toolsAdded`.

**F4. Offline encoding reproduces the loss.** I imported the installed `buildChatRequest` with Bun, supplied the session's first system and user messages as `{messages}`, and used synthetic credential placeholders. No API request was sent and no files were created. Counting the resulting top-level protobuf fields gave:

```text
Input                                System fields  Tool fields  Prompt fields
Recorded normalized transcript       0              0            1
Legacy-field control                 1              12           1
```

The control supplied the same recorded sections as `systemPrompt`, the same `toolsAdded` as `tools`, and the user message as `messages`. Fields 2, 10 and 3 respectively are defined by `protocol.ts:62-66`. This verifies the adapter defect with the actual saved context. It is not a capture of the historical HTTP request, so server-side behavior remains unobserved.

**F5. Custom model resolution does not remove skills or tools.** The tagged resolver copies an existing provider model and overrides only id/name, with requested thinking able to enable reasoning ([model-resolver.ts:175-188,588-595](https://github.com/earendil-works/pi/blob/v0.87.0/packages/coding-agent/src/core/model-resolver.ts#L175)). The Devin static models provide `api: devin-cloud`, text input, reasoning enabled, a 200,000-token context and 64,000 output tokens (`/home/ivan/.pi/agent/npm/node_modules/pi-devin-provider/extensions/devin/index.ts:8-36`). These are inherited rather than replaced with a tool-less generic model. Registration starts with that list and discovers additional models at session_start (`index.ts:70-80`). The warning is consistent with that timing, but it does not explain lost context.

Skill formatting depends on an available read/bash tool and loaded skills, not the model ID ([system-prompt.ts:165-184](https://github.com/earendil-works/pi/blob/v0.87.0/packages/coding-agent/src/core/system-prompt.ts#L165)). F1 confirms injection occurred in this session. The reported Muse success is consistent with a different provider handling the transcript correctly, but I did not independently inspect that comparison session.

## Ranked recommendation

1. **R1: migrate the Devin provider to the current transcript interface.** Use `TranscriptContext` at the streaming boundary. Follow the installed provider example: collapse system messages if the wire protocol only supports a leading system prompt, obtain prompt and tools through the current helpers, and exclude system messages from the user/assistant encoder. Handle later section replacements and tool additions/removals through those helpers rather than manually flattening only the first message. This fixes the missing-instructions-and-tools failure across Devin model IDs and skills, without changing akrogon's dispatch. Evidence and implementation pattern: installed `docs/custom-provider.md:409-433`; faulty sites: provider `protocol.ts:41-66,150-166`.

   Verify with an offline encoder test using normalized system sections and tools, including a later section/tool update. Then run a small live request requiring a read tool after the provider fix. The offline reproduction here establishes the defect, not a completed fix.

2. **R2: optionally make the dispatch prompt explicit after R1.** `src/next.ts:422` sends a bare skill name and parameters. Naming the installed SKILL.md and explicitly requesting that it be read would reduce skill-discovery ambiguity across models. It cannot fix this incident on its own: a path in user text does not restore the missing read tool or system instructions demonstrated in F4. A pi-specific path also needs care because next dispatches other harnesses. This is secondary hardening, not the systemic repair.

3. **R3: treat model-list cleanup as separate.** Registering swe-2-max before initial selection would remove the fallback warning, but selecting swe-1-7 or changing the static list would still use the same broken encoder (`index.ts:39-66`; `protocol.ts:41-66`). A harness-template change likewise cannot make the adapter serialize transcript fields it ignores.

Only this report was written. No credential values were needed, no live model requests were made, and no implementation or configuration was changed.
