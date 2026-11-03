export type ScanEvent = "folder-hit" | "files-changed" | "scan-failed" | "tick";
export declare function next(event: ScanEvent, scanning: boolean): { rescan: boolean };
