# Architecture rules

- WCE arrival events are sent immediately while interaction events remain batched; anonymous in-memory session IDs isolate visits when browser storage is blocked, reducing avoidable measurement loss without bypassing Do Not Track.
- Keep WCE event analytics explicitly separate from platform traffic analytics; neither historical gaps nor different session definitions justify fabricating replacement event records.