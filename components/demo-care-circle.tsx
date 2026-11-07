import {Heart, Sparkles, UserRound, Users} from 'lucide-react';

export function DemoCareCircle(){
 return <section className="demoCareCircle" aria-label="Donna’s Care Circle">
  <h2>Donna’s Care Circle</h2>
  <div className="careVenn">
   <span className="careDisc careDiscSandy"/><span className="careDisc careDiscPat"/><span className="careDisc careDiscDonna"/>
   <div className="carePerson carePersonDonna"><UserRound aria-hidden="true"/><strong>Donna</strong><small>Senior Member</small></div>
   <div className="carePerson carePersonSandy"><Sparkles aria-hidden="true"/><strong>Sandy</strong><small>AI<br/>companion</small></div>
   <div className="carePerson carePersonPat"><Users aria-hidden="true"/><strong>Pat</strong><small>Caregiver</small></div>
   <Heart className="careVennHeart" aria-label="Shared care and connection"/>
  </div>
 </section>
}
