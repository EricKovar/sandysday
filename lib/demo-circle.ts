import {env} from 'cloudflare:workers';
import {demoUser} from './demo-session';
export async function demoIdentity(cookie:string|null,role='senior'){
 const senior=await demoUser(cookie);if(!senior)return null;
 const caregiverId=senior.userId+':pat';
 const existing=await env.DB!.prepare('SELECT id FROM care_connections WHERE senior_id=? AND caregiver_id=?').bind(senior.userId,caregiverId).first();
 if(!existing)await env.DB!.batch([
  env.DB!.prepare("INSERT INTO care_profiles (user_id,name,role) VALUES (?,'Susan','senior') ON CONFLICT(user_id) DO NOTHING").bind(senior.userId),
  env.DB!.prepare("INSERT INTO care_profiles (user_id,name,role) VALUES (?,'Pat','caregiver') ON CONFLICT(user_id) DO NOTHING").bind(caregiverId),
  env.DB!.prepare("INSERT INTO care_connections (id,senior_id,caregiver_id,senior_name,caregiver_name,created_at) VALUES (?,?,?,'Susan','Pat',?) ON CONFLICT DO NOTHING").bind(senior.userId+':circle',senior.userId,caregiverId,Date.now())
 ]);
 return role==='caregiver'?{...senior,userId:caregiverId,fullName:'Pat',displayName:'Pat',email:senior.email.replace('demo-','demo-pat-')}:senior;
}
