# Issue: reviewer-repair

- [operator-only-items](operator-only-items/brief.md): operator-only review items are recorded as operator actions and stop once, never routed to A as a repair
- [b-repair-phase](b-repair-phase/brief.md): a fix verdict routes to a new B-owned `check.repair` phase where B repairs most Fixes and goes to merge
- [recovery-keeps-rounds](recovery-keeps-rounds/brief.md): failed recovery keeps `fix_rounds` instead of resetting it
