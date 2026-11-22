#!/bin/sh
# Test seam for run units: logs every call, runs the payload of scope calls and
# verify-pass submissions in the caller's place (no unit) and fakes other
# service submissions. Real runs are covered separately with the real
# systemd-run on a clean PATH.
[ -n "$FAKE_SYSTEMD_RUN_LOG" ] && printf '%s\n' "$*" >> "$FAKE_SYSTEMD_RUN_LOG"
[ -n "$FAKE_LAND_HOLDS_LOG" ] && printf '%s holds=%s\n' "$*" "$(grep -l 'land: true' "$AKROGON_HOME"/runs/*.yaml 2>/dev/null | wc -l)" >> "$FAKE_LAND_HOLDS_LOG"
case " $* " in
*' --scope '* | *' verify-pass '*)
	while [ $# -gt 0 ] && [ "$1" != '--' ]; do shift; done
	[ "$1" = '--' ] && shift
	exec "$@"
	;;
*)
	exit 0
	;;
esac
