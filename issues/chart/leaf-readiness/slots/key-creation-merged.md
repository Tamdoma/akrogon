# Key creation: merged A + B

Operator correction, 2026-10-02, verbatim: "This should be general, not for Cloudflare or GitHub only. Every time a leaf needs something I need to know up front."

## Shared ground (A,B)
- Holding a key that can create keys exposes everything that key can reach, not just the narrow child key. Narrowing the child does not narrow the parent sitting in a readable env.
- Some providers cannot create keys by API at all (GitHub personal tokens). So "agents mint keys" can never be the general rule.
- Every key, whoever makes it, is listed in the readiness contract before handoff, with name, what it is, needed permissions, where it comes from and which repo's env holds it.
- Responses that contain a new key never land in logs, reports or chat.

## Reshaped question (provider-neutral)
Q1. When a leaf needs a key from an outside account that does not exist yet, who creates it?
- 1a (A) The operator, in one batch before handoff, from the exact list the door writes. Agents never hold a key whose job is making other keys.
- 1b (B) The operator by default, but an agent may create one when the door records an already-held creating key, its full reach, the allowed child permissions and lifetime, the env destination and cleanup. B's reason: separates granting from using already-granted authority; covers short-lived app tokens.
- 1c (A,B reject) Any agent creates keys whenever some held key can.

Q2. When a leaf creates a thing that comes with its own key (for example a site's admin token made during setup), who stores that key?
- 2a (A, B P4 compatible) The leaf creates it and saves it with one akrogon command that writes only that named value into the declared repo's env and never prints it. The contract lists it up front as "produced by leaf X", so dependents wait on that leaf instead of failing dispatch.
- 2b The operator copies it in by hand. Cost: the chain stalls on the operator mid-epic.

## A's view on 1a vs 1b
1b's exception still needs a key-creating key in a readable env, which is the exposure both slots name as the critical boundary. The operator's correction asks to know every need up front; 1a gives that with the smallest exposure. 1b's short-lived-token case has no current incident.

## Research
- better-than-training · developers.cloudflare.com/fundamentals/api/how-to/create-via-api (read 2026-10-02) · a key-creating token "can create tokens with access to any of a user's resources"; Cloudflare says grant it nothing else and limit it by IP or TTL.
- better-than-training · GitHub fine-grained PAT feedback discussion github.com/orgs/community/discussions/36441 and B S9 (read 2026-10-02) · no supported API creates personal access tokens.
- practitioner · B S3/S7 (Galow, Cloudflare 2019; Singhal, GitHub 2022) · one narrow key per service, rotated independently.
