# Final shape check: slot B

F22. The equal test-count criterion conflicts with O1b. Replacing one test with nine adds eight tests: the measured 1167-test suite becomes 1175 if nothing else changes. The existing named-target test covers all nine cases with 48 expects. Keep those cases and assertions, and record the expected +8 test-count change. Require preserved coverage and explain count changes instead of requiring identical test counts. This also needs correction in the fork's Taken criterion before handoff.
