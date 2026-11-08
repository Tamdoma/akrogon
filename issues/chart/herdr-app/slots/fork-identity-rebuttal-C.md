# Rebuttal C: identity

Q1. I withdraw the config-key pick. The `doc.get` probe removes my reason (window needed). Discovery by space name across running sessions is closest to old herdr and works. Two conditions, or the pick is weaker than it looks:
- `doc.get` is opaque JSON with no schema promise (the merged notes say so) and the session list would come from a socket folder convention. Old herdr gave both through supported commands (`session list --json`, `workspace list`). Removed by parsing both at the boundary with a strict schema and turning any mismatch into today's refusal (`space unknown`, named in `akrogon status`), never into a guess; plus one test pinned to the `hc schema` output so a herdr-core update that changes `doc.get` fails the suite, not a leaf start.
- The socket folder holds holder sockets too: `/run/user/1000/herdr-core/` lists `default.sock`, `infra.sock`, `mdconsultingny.sock` and `infra.holder.4c420e69.sock`, `default.holder.059902f8.sock` (2026-11-06). The session pattern must be `<name>.sock` with no dot in `<name>`. `personal` has no socket now though old herdr lists it running, so the two systems' session sets already differ; the engine must list hc sessions, not old herdr's.

Q2. No disagreement. "both (C)" is right; my `started_ms` is hc's `created_ms` field.

Q3. One correction to the readable-name majority: "hash only when the slug passes 32" is two naming rules, and the slice name (`src/scope.ts:13-14`) would still be derived by a third. If readable wins, make it one rule for every leaf: `<prefix>-<slug head>-<4 hex of repo/slug>-<a|b>`, head cut to fit 32, so every name has the same shape and the hash is present whether or not the slug was cut. Otherwise two leaves differing only past the cut point get names that look like one scheme and one of them silently carries a hash the operator does not expect.

No other disagreement.
