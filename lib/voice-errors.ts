export function microphoneError(error:unknown){
 const e=error as {name?:string;message?:string};
 if(e?.name==='NotAllowedError'||e?.name==='PermissionDeniedError')return 'Microphone access is blocked. Open your browser’s site settings, allow Microphone, then try again.';
 if(e?.name==='NotFoundError'||e?.name==='DevicesNotFoundError')return 'No microphone was found. Connect or select a microphone, then try again.';
 if(e?.name==='NotReadableError'||e?.name==='TrackStartError')return 'Your microphone could not open. Close other apps using it, then try again.';
 if(e?.name==='TimeoutError')return 'Voice took too long to connect. Please try again, or type your message.';
 return e?.message||'Voice could not start. Please try again, or type your message.';
}
