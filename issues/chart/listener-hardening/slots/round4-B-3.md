Re-check: ready

Reviewed amended HEAD `3cfaef1afc0350fab0ee39bdf2773e642b5414c7`. F1 is fixed by an owned process group and group SIGKILL at the pass deadline. F2 is fixed by the first-snapshot deadline, stream stop, subscription cleanup and delayed retry.

Ran the two targeted listener tests: 2 pass, 0 fail. They verify descendant termination and recovery with a silent subscription beside a healthy session. No further defects found in these changes.
