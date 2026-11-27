# Issue: test-temp-leftovers

- [nested-temp-root](nested-temp-root/brief.md): a nested akrogon call inside a checked command shares the caller's leaf temp root, so akrogon's own test runs stop leaving empty `<hash4>/<hash8>` dirs under `/var/tmp/akr-<uid>`
