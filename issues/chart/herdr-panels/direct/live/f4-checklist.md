# F4 click checklist (operator, window `right-panel-1`, space `check`)

Reply with the step numbers that failed and what you saw. "all ok" if none.

Panel bar
1. PT 1: Click **Files**. It fills the terminal area. Click **Files** again. It closes and you can type in the shell right away.
2. PT 3: Press `ctrl-b f`: Files opens. Press `ctrl-b t`: it switches to Tasks at the same size. Press `ctrl-b t` again: it closes.
3. PT 3: Open **Needs you**, click into a reply box, then press `ctrl-b y`. The panel closes and you can type in the shell.
4. PT 9: Make the window narrow (tile it next to another window). The panel buttons show only icons. Hovering one shows its name.

Files (shell is in `check-repo/src/sub`)
5. FP 3 (F1 repair): Open **Files**, type `readme` in the filter. `../../README.md` is listed.
6. FP 4 (F2 repair): With `readme` still typed, click **Recent**. The filter empties and the Recent list shows.
7. FP 2: Open `README.md`. It shows formatted (bold, list). Click **Raw**: the source shows. Click **Raw** again: formatted again.
8. FP 7: Keep `README.md` open. In the shell run `echo "- three" >> ../../README.md`. Within a few seconds the file shows "three".

Changes (branch `feature`, base `main`)
9. CP 4: Run `git -C ../.. checkout -- README.md` in the shell, then open **Changes**. Working is empty and offers "view Branch diff (N files)". Click it: Branch opens.
10. CP 2: Branch names base `main` and lists the branch's files with their diff.
11. CP 3: Click **Commits**. Click "merge side": it shows `docs/c.txt`. Click "root commit": it shows all three first files.

Needs you (two fake agents: `fake-full`, `fake-scrolled`)
12. NY 3: In **Needs you**, on `fake-full`, click `1b` then `2a`. The reply box shows `1b | 2a`. Edit it to `1b | 2b`, press Send. Open tab `fake-full`: it says `RECEIVED: "1b | 2b"`.
13. NY 3: Back in **Needs you**, use the "elid" action on `fake-full`. Tab `fake-full` says `RECEIVED: "elid"`.
14. NY 6: On `fake-scrolled`, type `draft` in its reply box without sending. Open Files, then Needs you again: the draft is still there. Click **Load the rest**: question 1 (Color) buttons appear next to question 2.
