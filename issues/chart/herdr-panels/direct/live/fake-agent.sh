# Fake waiting agent for the operator's Needs-you checks: shows a decision round, reports `done`
# (OSC 7501), then prints what the panel typed. mode full: the whole round on screen.
# mode scrolled: question 1 scrolls off, so the panel offers "Load the rest".
mode=$1
osc() { printf '\033]7501;state=%s\033\\' "$1"; }
round() {
  printf 'Decision round\n\n  D1. Color\n  - 1a. Red (recommended)\n  - 1b. Blue\n\n'
  [ "$mode" = scrolled ] && for i in $(seq 1 120); do echo "  log line $i"; done
  printf '  D2. Size\n  - 2a. Small\n  - 2b. Large (recommended)\n\n  Reply 1a 2b, or change either.\n'
}
while :; do
  clear; round; osc done
  IFS= read -r line
  osc working; printf '\n>>> RECEIVED: "%s"\n' "$line"; sleep 4
done
