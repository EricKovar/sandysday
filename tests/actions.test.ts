import {test} from 'node:test';import assert from 'node:assert/strict';
import {allowed,actions,type Stage} from '../lib/cindy.ts';
const stages:Stage[]=['idle','opening','preview','recording','uploading','retry','saved'];
test('a recording cannot start before camera preview',()=>{for(const s of stages)assert.equal(allowed('start_recording',s),s==='preview')});
test('finish is only valid for an active recording',()=>{for(const s of stages)assert.equal(allowed('finish_checkin',s),s==='recording')});
test('retry only acts on a retained failed upload',()=>{for(const s of stages)assert.equal(allowed('retry_upload',s),s==='retry')});
test('cancel is available only before recording begins',()=>{for(const s of stages)assert.equal(allowed('cancel_checkin',s),s==='opening'||s==='preview')});
test('unknown commands are rejected in every state',()=>{for(const s of stages)assert.equal(allowed('invented' as any,s),false)});
test('there is no AI action that can declare success or notify a caregiver',()=>{assert.ok(!actions.some(a=>/saved|notify|complete/.test(a)))});
