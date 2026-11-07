#!/bin/sh
# Stand-in agent for real-core tests. Invoked as a harness: `<kind> --model <mode> --effort <e> [<task>]`.
# It reports OSC 7501 status like a coding agent and logs every task it receives to
# $STANDIN_DIR/<HC_TERMINAL_ID>.tasks (one line each), so tests read what was delivered.
# Modes (the --model value):
#   work   idle, then for each task: working, run $STANDIN_DIR/hook <terminal> <task> when present, idle
#   idle   reports idle and never goes working (never confirms a start, send gives started:false);
#          a received line `WORK` makes one working-to-idle turn, so a test can move its turn
#   exit   exits 3 at once
#   trust  agy's trust dialog first (blocked, permission); one Enter answers it, then behaves as work
mode=work
while [ $# -gt 0 ]; do
	case "$1" in
	--model) mode="$2"; shift 2 ;;
	--effort | --session-id) shift 2 ;;
	--*) shift ;;
	*) break ;;
	esac
done
log="${STANDIN_DIR:?}/${HC_TERMINAL_ID:-unknown}.tasks"
status() { printf '\033]7501;state=%s\007' "$1"; }
turn() {
	printf '%s\n' "$1" >> "$log"
	status working
	if [ -x "$STANDIN_DIR/hook" ]; then "$STANDIN_DIR/hook" "${HC_TERMINAL_ID:-unknown}" "$1"; fi
	status idle
}
case "$mode" in
exit) exit 3 ;;
idle)
	status idle
	[ $# -gt 0 ] && printf '%s\n' "$1" >> "$log"
	while IFS= read -r line; do
		printf '%s\n' "$line" >> "$log"
		[ "$line" = WORK ] && status working && status idle
	done
	exit 0
	;;
trust)
	printf '\033]7501;state=blocked:kind=permission:msg=Trust this folder?\007'
	IFS= read -r line
	printf 'ENTER\n' >> "$log"
	;;
esac
status idle
[ $# -gt 0 ] && turn "$1"
while IFS= read -r line; do turn "$line"; done
