# Sandy’s Day

Private experiment in a conversation-led Senior Member experience. This is a separate app, D1 database, R2 bucket, and OpenAI credential from Our Daily Ally. No ODA data or accounts are copied.

Cindy supports natural text conversation through the Responses API, continuous WebRTC voice through Realtime, and a guarded medication video check-in journey. Conversation history and check-in metadata are scoped to the signed-in visitor. Videos are stored in private R2 and served only through an ownership-checked route.

The first voice tap grants microphone access and connects the session. Semantic turn detection allows pauses and interruption. While a medication video is recording, Cindy's audio output is muted and automatic spoken responses are disabled; transcribed speech is interpreted by the text action service. The microphone stream is cloned for video recording so stopping one activity does not stop the other. The same action validator controls text, voice, and fallback buttons.

Only the confirmed upload response can set the UI's saved state. Retry uses a stable recording ID to avoid duplicate records after a lost response. Failed recordings remain in memory while the page is open; reloading loses an unsaved recording. The app warns before leaving an active or failed check-in. Video recordings are capped at 90 seconds and uploads at 40 MB. Voice sessions end after 15 minutes and can be reconnected.

Required server secret: `OPENAI_API_KEY` (never committed). Models: `gpt-4.1-mini` for text; `gpt-realtime-2.1` and `gpt-4o-mini-transcribe` for voice.

Not implemented: caregiver pairing/sharing, notifications, medication schedules, Spark, Move, background reminders, and shared cross-device unfinished recordings. A video check-in does not prove medication adherence. Use synthetic/test recordings during preview testing.

## Validation

Run `node node_modules/typescript/bin/tsc --noEmit`, `node --experimental-strip-types --test tests/*.test.*`, and the Sites build helper. Live AI evaluations are in `tests/eval-cindy.mjs`; they require the local ignored credential and send synthetic scenarios only.

The hosting manifest retains this experiment's Site identity and isolated D1/R2 bindings. Deploy through the Sites source workflow.
