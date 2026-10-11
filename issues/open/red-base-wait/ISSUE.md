# Issue: red-base-wait

- [known-red-leaf](known-red-leaf/brief.md): a leaf before merge never stops or fails on a red main; failures that also fail without the change are recorded per test as known-red, the operator gets one notice per new red, and only new or unverified failures block
- [known-red-merge](known-red-merge/brief.md): the merge turn applies the same per-test rule against the stack's own target, red entries clear only from a green run on landed main, and the repo hold with `hold-fix` and `unhold` is retired
