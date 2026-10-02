# Key creation

## Question
Q1. When a leaf needs a key from an outside account that does not exist yet, who creates it: the operator in one batch before handoff from the door's list, or may an agent create it with an already-held key-creating key whose full reach the operator approved at chart time?

Q2. When a leaf creates something that comes with its own key (for example a site admin token made during setup), may that leaf store the key itself, declared up front as "produced by leaf X"?

### Carries
- [readiness-contract](readiness-contract.md): taken 1a.
- F5: standing design accepts agent reads of `.env`; phase skills forbid opening or writing it (skills/AREA.md:24). No rule covers persisting a newly created key.
- Intake expected behavior: "it includes creating and providing API keys".
- Operator correction 2026-10-02, verbatim: "This should be general, not for Cloudflare or GitHub only. Every time a leaf needs something I need to know up front."

## Findings
- Round files: slots/key-creation-B.md, slots/key-creation-merged.md, slots/key-creation-rebuttal-B.md.
- (A,B) A key-creating key exposes its whole reach; narrowing the child key does not narrow the parent in a readable env. Some providers have no key-creation API (GitHub personal tokens), so agent minting cannot be the general rule.
- (A,B) Every key, whoever makes it, is listed in the readiness contract before handoff with name, purpose, permissions, source and holding repo, and is proven usable with its real identity and target, cleanup included (B R3).
- A recommends Q1 operator batch: smallest exposure, no current incident needs agent issuance. B recommends allowing agent issuance only from an already-held parent whose whole reach the operator approved, because short-lived tokens (one hour) cannot be supplied in a batch days earlier (B R1).
- Q2 (A,B): the producing leaf creates and stores it. B R2: the write needs explicit authorization in the contract, touches only that named value in the declared repo's env, never prints it, and revokes the new key if saving fails. The storage mechanism is an implementation choice, not part of this decision.
- Research: Cloudflare create-via-API (developers.cloudflare.com/fundamentals/api/how-to/create-via-api, read 2026-10-02): a key-creating token can create tokens for any of the user's resources. GitHub: no supported API creates personal access tokens (B S9). Installation tokens last one hour, signed by a non-expiring app key (B S10).

## Taken
2026-10-02, operator, verbatim: "1a - but when will that happen? At what point? Do I just look at the list from the akrogon status and do it manually? How can I get the instructions from the agent to tell me how to get those keys exactly? | 2a"

Q1 taken 1a: the operator creates every missing outside-account key in one batch before handoff, from the door's list. No agent holds a key-creating key. Reason: smallest exposure, works for every provider, no current need for agent issuance. Foreclosed: 1b agent issuance from an approved held parent (B's pick), 1c agents mint whenever possible.

Q2 taken 2a: a leaf that creates something with its own key stores that key itself, declared up front as produced by that leaf; dependents wait on it; the write touches only that named value in the declared repo's env, is authorized in the contract, never prints it, and revokes the new key if saving fails. Foreclosed: 2b operator copies it by hand.

The operator's when/how question moved to [key-sheet](key-sheet.md).
