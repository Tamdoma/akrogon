#!/usr/bin/bash
# Usage: probe.sh <claude|codex|pi|agy>. Runs one print-mode turn with the seat's entry wiring at this
# run scope's root, then reports where the tool shell landed, kills tools/ and removes it.
set -u
H=$1
D=$(cd "$(dirname "$0")" && pwd)
root=/sys/fs/cgroup$(sed -n 's/^0:://p' /proc/self/cgroup)
export AKROGON_SEAT_CGROUP=$root AKROGON_PROBE_LOG=$D/out-$H.log
: > "$AKROGON_PROBE_LOG"
mkdir "$root/tools"
echo "scope_root $root" >> "$AKROGON_PROBE_LOG"
P='Use your shell tool to run exactly this one command, then reply with its output and stop: (sleep 150 >/dev/null 2>&1 &); sleep 3; cat /proc/$$/cgroup'
case $H in
  claude) env CLAUDE_CODE_SHELL=$D/shim/bash CLAUDE_CODE_TOOL_MEMORY_LIMIT=none timeout 200 claude -p --model haiku --effort low --dangerously-skip-permissions "$P" ;;
  codex) env BASH_ENV=$D/place.sh timeout 200 codex exec --skip-git-repo-check -m gpt-6.2-sol -c model_reasoning_effort=low -s danger-full-access "$P" ;;
  pi) env BASH_ENV=$D/place.sh timeout 200 pi -p --model devin/swe-2-1-max --thinking low "$P" ;;
  agy) env PATH=$D/shim:$PATH DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$(id -u)/bus XDG_RUNTIME_DIR=/run/user/$(id -u) timeout 200 agy --model "Gemini 3.8 Flash (Low)" --dangerously-skip-permissions -p "$P" ;;
esac
echo "harness_exit $?" >> "$AKROGON_PROBE_LOG"
for t in "$root"/tools/t-*; do
  [ -d "$t" ] || continue
  echo "tdir ${t#$root/} procs=[$(tr '\n' ' ' < "$t/cgroup.procs")] comms=[$(for p in $(cat "$t/cgroup.procs"); do cat /proc/$p/comm 2>/dev/null; done | tr '\n' ' ')] $(grep populated "$t/cgroup.events")" >> "$AKROGON_PROBE_LOG"
done
echo "root_procs=[$(for p in $(cat "$root/cgroup.procs"); do echo -n "$p:$(cat /proc/$p/comm 2>/dev/null) "; done)]" >> "$AKROGON_PROBE_LOG"
echo 1 > "$root/tools/cgroup.kill"
sleep 1
echo "after_kill $(grep populated "$root/tools/cgroup.events")" >> "$AKROGON_PROBE_LOG"
for t in "$root"/tools/t-*; do rmdir "$t"; done
rmdir "$root/tools" && echo "cleanup tools removed" >> "$AKROGON_PROBE_LOG"
cat "$AKROGON_PROBE_LOG"
