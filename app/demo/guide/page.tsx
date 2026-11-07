import {StartNewDemo} from '../../../components/start-new-demo';
const senior = [
 ['Talk or type with Sandy', 'Sandy’s two welcome messages explain how to chat and what you can do together. Type in the box below the chat, or turn on the mic and allow microphone access. Sandy reads the welcome aloud on the first connection without adding new chat bubbles. Use Sandy’s voice to turn spoken replies on or off.'],
 ['Medication check-in', 'Open the camera and allow access. Tap Start recording when ready. You can cancel before recording starts. Once it starts, tap Finished to save the video. Sandy acknowledges the save in chat, and Pat can open the video under Saved check-ins.'],
 ['Daily Spark', 'Try five puzzles inside Sandy’s chat. Speak or type your answer. Sandy gives feedback and offers a hint if you miss. After a correct answer, Sandy moves to the next puzzle automatically or records your completion after puzzle five. After a skip, tap Next question or Finish Spark, or say “next” when you’re ready.'],
 ['Daily Move', 'Coming soon. The shortcut is currently disabled.'],
 ['Activities near me', 'Give Sandy a city and state or a ZIP code to explore local activities.'],
 ['Learn a Language', 'Tell Sandy which language you want to practice and how much you know. Practice a little at a time by voice or text.'],
];

const caregiver = [
 ['For your attention', 'See today’s counts for medication check-ins, Daily Spark, and Daily Move. Green means activity was recorded, amber means none has been recorded yet, and red signals an update issue. The progress bar shows how many of the three activity types have been recorded today.'],
 ['Daily engagement', 'Compare medication check-ins and Spark and Move completions across the week. The chart includes labeled sample activity on earlier days.'],
 ['Donna’s Day', 'Review timestamped activity and use Refresh overview to fetch the latest information. Open Medication check-in or Saved check-ins to watch a saved video, or Daily activities to see Spark and Move completions.'],
 ['Chat with Sandy', 'Use Care Circle Chat to join the conversation with Donna and Sandy. Switch to Private Chat to talk with Sandy separately from Donna’s shared conversation.'],
 ['Reports', 'Open a sample weekly report with the engagement chart, activity totals, and daily patterns. Today’s counts reflect the activity you record in this demo.'],
];

export default async function DemoGuide({searchParams}: {searchParams: Promise<{from?: string}>}) {
 const from = (await searchParams).from;
 const back = from === 'caregiver' ? '/demo/caregiver' : '/demo/home';
 const roles = [
  {title: 'Donna · Senior Member', subtitle: 'Try an activity with Sandy', items: senior},
  {title: 'Pat · Caregiver', subtitle: 'See what Donna has recorded', items: caregiver},
 ];

 return (
  <main className="demoGuidePage">
   <header>
    <div className="headerBrandGroup">
     <a className="brand" href={back}>
      <img className="brandLogo" src="/sandys-day-logo-copper.png" alt="" width={47} height={47}/>
      <span>Sandy’s Day</span>
     </a>
     <span className="previewBadge">DEMO GUIDE</span>
    </div>
    <div className="headerRight">
     <a className="demoGuideLink" href={back}>Back to demo</a>
     <StartNewDemo/>
    </div>
   </header>
   <div className="demoGuideContent">
    <h1>Demo Guide</h1>
    <section className="demoGuideIntro" aria-labelledby="demo-how">
     <h2 id="demo-how">Try both sides of Sandy’s Day</h2>
     <p>Use the header to switch between <strong>Donna, the Senior Member</strong>, and <strong>Pat, the Caregiver</strong>. Start as Donna, save a short demo check-in, then switch to Pat to see the count and open the video. Both views share the same demo session. Choose <strong>Start New Demo</strong> to begin a fresh session.</p>
    </section>
    <div className="demoGuideColumns">
     {roles.map(({title, subtitle, items}) => (
      <section className="demoGuideFeatures" key={title}>
       <h2>{title}</h2>
       <p className="demoGuideSubtitle">{subtitle}</p>
       <ul>{items.map(([label, description]) => <li key={label}><strong>{label}</strong><p>{description}</p></li>)}</ul>
      </section>
     ))}
    </div>
    <section className="demoGuideFuture">
     <h2>About the demo data</h2>
     <p>New activity uses your device’s local date and time. Earlier sample check-ins are labeled and have no playable video. Dashboard counts reflect saved activity. Scheduled reminders and email, text, and push notifications are future features.</p>
    </section>
    <a className="demoGuideLink demoGuideBack" href={back}>Back to demo</a>
   </div>
  </main>
 );
}
