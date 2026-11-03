// Scan scheduling: an event asks for a rescan only when no scan is in flight,
// so a watchFolder hit or watch.files diff never overlaps a running scan. A
// hit while scanning sets the caller's `wanted` flag instead (main.js reruns
// once the in-flight scan returns, so a change during the scan isn't lost).
export function next(event, scanning) {
  const wants = event === "folder-hit" || event === "files-changed" || event === "scan-failed";
  return { rescan: wants && !scanning };
}
