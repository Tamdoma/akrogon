# Chart: akrogon

## Destination
A review Fix blocks only when the reviewer names a realistic source of the failing input, and leaves write only the tests that prove their criteria and real consequences, so leaves stop looping on handcrafted cases and low-value tests, while failed checks, named criteria and reachable security defects still block.

## Forks taken
- [Deferred findings](forks/deferred-findings.md): 1a, Nits stay in the review file with deferral reason and promotion evidence; repair does Fixes only
- [Success measure](forks/success-measure.md): 1a+2a, Fixes carry source, consequence and criterion; reports link criteria to tests; measure the next 20 leaves per repo against the log baseline at a later chart door, no new code
- [Test bar](forks/test-bar.md): 1a+2a+3a, tests prove criteria and real bugs only; review blocks on missing criterion proof, untested real Fix or mocked unit; end-to-end only when smaller proof cannot show it
- [Fix bar](forks/fix-bar.md): 1a+2a, a Fix names a realistic input source; failed checks and named criteria always block; maintainability needs a consequence today

## Open forks

## Fog

## Off route
- The follow-up measurement itself (success-measure 2a) runs at a later attended chart door, not in a leaf.
- Model or effort choice for slot B, `fix_rounds` cap, routing and state schema.
- The framework parser and the running `offer-join-deploy` leaf. Changing that leaf is an operator action there.
- Any probability percentage or severity scoring system. No source justifies one.

Handed off 2026-09-30
