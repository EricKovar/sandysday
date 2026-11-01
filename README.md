# Sandy’s Day

Private experiment in a conversation-led Senior Member experience. This is a separate app, D1 database, R2 bucket, and OpenAI credential from Our Daily Ally. No ODA data or accounts are copied.

Cindy supports natural text conversation through the Responses API, continuous WebRTC voice through Realtime, and a guarded medication video check-in journey. The Senior Member’s Cindy conversation is the shared Care Circle conversation. Caregiver private conversations are stored separately and scoped to the individual Caregiver and Senior Member. Check-in metadata is authorized against ownership and active connections. Videos are stored in private R2 and served only through an ownership-checked route.

The first voice tap grants microphone access and connects the session. Semantic turn detection allows pauses and interruption. While a medication video is recording, Cindy's audio output is muted and automatic spoken responses are disabled; transcribed speech is interpreted by the text action service. The microphone stream is cloned for video recording so stopping one activity does not stop the other. The same action validator controls text, voice, and fallback buttons.

Only the confirmed upload response can set the UI's saved state. Retry uses a stable recording ID to avoid duplicate records after a lost response. Failed recordings remain in memory while the page is open; reloading loses an unsaved recording. The app warns before leaving an active or failed check-in. Video recordings are capped at 90 seconds and uploads at 40 MB. Voice sessions end after 15 minutes and can be reconnected.

Required server secret: `OPENAI_API_KEY` (never committed). Models: `gpt-4.1-mini` for text; `gpt-realtime-2.1` and `gpt-4o-mini-transcribe` for voice.

Not implemented: caregiver pairing/sharing, notifications, medication schedules, Spark, Move, background reminders, and shared cross-device unfinished recordings. A video check-in does not prove medication adherence. Use synthetic/test recordings during preview testing.

## Validation

Run `node node_modules/typescript/bin/tsc --noEmit`, `node --experimental-strip-types --test tests/*.test.*`, and the Sites build helper. Live AI evaluations are in `tests/eval-cindy.mjs`; they require the local ignored credential and send synthetic scenarios only.

The hosting manifest retains this experiment's Site identity and isolated D1/R2 bindings. Deploy through the Sites source workflow.

## Care Circle and Caregiver dashboard

`/care-circle` creates email-bound invitation links, shows incoming invitations and active connections, and lets either participant disconnect. A creator can be a Senior Member or a Caregiver. Both creation and acceptance explicitly disclose that sharing covers past and future saved videos. No invitation email is sent automatically. Links use a 256-bit random token in the URL fragment; only its SHA-256 hash is stored. Links expire in 7 days and are single-use. The authenticated invited email is checked before inspection or acceptance. Atomic D1 batches create the connection and consume the invitation.

`/caregiver` lists recordings from accepted, active Senior Member connections. Every video and range request checks the viewer's ownership or current connection. Disconnect stops future requests; it cannot retract media that was already downloaded or buffered. The Senior Member’s existing and new Cindy conversation is included in the shared Care Circle chat. Caregiver private chat is stored separately and is never included in shared results or shared model context.

A confirmed upload receipt includes the currently connected Caregiver names. Cindy uses that receipt for availability acknowledgments. Notification delivery is still disabled. If the sharing lookup fails after a successful upload, the recording is saved but sharing is reported as unknown.

This deployment remains owner-private at the Sites access layer. The owner must also share the private Site with each tester's ChatGPT account before that tester can open an invitation. App invitations do not alter the Site's audience or hosting allowlist.

## Shared and private conversations

The Senior Member has one Cindy conversation, shared with accepted connected Caregivers. `/caregiver` provides a shared conversation tab and a separate private Caregiver tab for each connected Senior Member. Existing Senior Member history is visible in the shared conversation. Speaker IDs and names label new messages. Shared messages synchronize every four seconds, including into the Senior Member UI and voice-session context. Caregiver text messages cannot operate the Senior Member camera or recording.

Private Caregiver messages use `caregiver_private_messages`, keyed by both Caregiver and Senior Member. Shared reads and shared model requests do not query that table. Private Cindy requests may read shared conversation context and check-in metadata for advice, but shared requests never read private context. Disconnecting blocks new access to both chat views for that relationship.
