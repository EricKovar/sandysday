import {test} from 'node:test';import assert from 'node:assert/strict';
import {microphoneError} from '../lib/voice-errors.ts';
test('permission and hardware failures give specific microphone recovery guidance',()=>{
 assert.match(microphoneError({name:'NotAllowedError'}),/allow Microphone/);
 assert.match(microphoneError({name:'NotFoundError'}),/No microphone/);
 assert.match(microphoneError({name:'NotReadableError'}),/Close other apps/);
 assert.match(microphoneError({name:'TimeoutError'}),/too long/);
 assert.match(microphoneError(new Error('This demo has reached today’s voice limit.')),/voice limit/);
});
