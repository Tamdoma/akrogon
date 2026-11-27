#!/bin/sh
# One paid agy launch: does --dangerously-skip-permissions with --mode auto run a command that
# auto mode would pause on (network + write outside the workspace) without blocking?
set -u
bus=$1; target=/tmp/akr-agy-probe-$$.txt
rm -f "$target"
a=$(hc run --json --bg --no-parent --name ak-agy-probe --cwd /home/ivan/Work/infra/akrogon -- env DBUS_SESSION_BUS_ADDRESS="$bus" agy --model neon --effort low --mode auto --dangerously-skip-permissions | jq -r .address)
echo "terminal $a target $target"
hc wait "$a" --timeout 90 --json
hc send --json "$a" "Run these two shell commands with your shell tool, then reply with the word finished: curl -sI https://example.com | head -1 ; printf ok > $target"
echo
hc wait "$a" --timeout 300 --json
echo "status: $(hc get "$a" | jq -c '{state:.status.state,msg:.status.msg}')"
echo "screen tail:"; hc read "$a" | tail -25
echo "file: $(cat "$target" 2>&1)"
hc kill "$a" >/dev/null 2>&1; hc rm "$a" >/dev/null 2>&1
rm -f "$target"
echo "cleanup: $(hc get "$a" >/dev/null 2>&1 && echo present || echo absent)"
test -n "$a"
