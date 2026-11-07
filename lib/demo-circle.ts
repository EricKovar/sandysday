import {env} from 'cloudflare:workers';
import {demoUser} from './demo-session';
export async function demoIdentity(cookie:string|null,role='senior',expectedAccount:string|null=null){
 const senior=await demoUser(cookie);if(!senior)return null;
 const caregiverId=senior.userId+':pat';
 if(expectedAccount!==null&&expectedAccount!==(role==='caregiver'?caregiverId:senior.userId))return null;
 const existing=await env.DB!.prepare('SELECT id FROM care_connections WHERE senior_id=? AND caregiver_id=?').bind(senior.userId,caregiverId).first();
 if(!existing)await env.DB!.batch([
  env.DB!.prepare("INSERT INTO care_profiles (user_id,name,role) VALUES (?,'Donna','senior') ON CONFLICT(user_id) DO NOTHING").bind(senior.userId),
  env.DB!.prepare("INSERT INTO care_profiles (user_id,name,role) VALUES (?,'Pat','caregiver') ON CONFLICT(user_id) DO NOTHING").bind(caregiverId),
  env.DB!.prepare("INSERT INTO care_connections (id,senior_id,caregiver_id,senior_name,caregiver_name,created_at) VALUES (?,?,?,'Donna','Pat',?) ON CONFLICT DO NOTHING").bind(senior.userId+':circle',senior.userId,caregiverId,Date.now())
 ]);
 await env.DB!.batch([
  env.DB!.prepare("UPDATE care_profiles SET name='Donna' WHERE user_id=? AND name='Susan'").bind(senior.userId),
  env.DB!.prepare("UPDATE care_connections SET senior_name='Donna' WHERE senior_id=? AND senior_name='Susan'").bind(senior.userId)
 ]);
 return role==='caregiver'?{...senior,userId:caregiverId,fullName:'Pat',displayName:'Pat',email:senior.email.replace('demo-','demo-pat-')}:senior;
}
