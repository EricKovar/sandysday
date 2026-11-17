import type { Metadata } from 'next';
import Home from '../components/senior-home';
import { getChatGPTUser } from './chatgpt-auth';
import styles from './landing.module.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Sandy’s Day | Stay part of Mom’s day',
  description: 'Meet Sandy, a daily companion for older adults at home. Try the interactive demo as Mom or as a family caregiver.',
};

export default async function Page() {
  if (await getChatGPTUser()) return <Home key="signed-in" />;

  return (
    <div className={styles.landing}>
      <header className={styles.header}>
        <a className={styles.brand} href="/">
          <img src="/sandys-day-logo-copper.png" alt="" width="44" height="44" />
          Sandy’s Day
        </a>
        <a className={styles.headerLink} href="/demo">Try the demo <span aria-hidden="true">↗</span></a>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="landing-title">
          <div className={styles.intro}>
            <h1 id="landing-title">Stay part of <em>Mom’s day.</em></h1>
            <p>Sandy is a daily companion for older adults at home. Mom can chat with Sandy, get gentle reminders, and play a word game. You can catch up on how her day is going when you have a moment.</p>
            <a className={styles.button} href="/demo">Try the interactive demo <span aria-hidden="true">↗</span></a>
            <small>No account needed. Try it as Mom or as her caregiver.</small>
          </div>

          <figure className={styles.example}>
            <figcaption>A moment from the demo</figcaption>
            <div className={styles.conversation}>
              <div className={styles.sandy}>
                <strong>Sandy</strong>
                <p>Good morning, Donna. Ready for your medication check-in?</p>
              </div>
              <div className={styles.donna}>
                <strong>Donna</strong>
                <p>Yes, I’m ready.</p>
              </div>
            </div>
            <div className={styles.update}>
              <span className={styles.check} aria-hidden="true">✓</span>
              <div><strong>Donna’s Day</strong><p>Medication check-in completed</p></div>
            </div>
          </figure>
        </section>

        <section className={styles.roles} aria-label="How families use Sandy’s Day">
          <div>
            <h2>For Mom</h2>
            <p>Talk or type with Sandy, check in after taking medication, or take a break with a Daily Spark word game.</p>
          </div>
          <div>
            <h2>For family caregivers</h2>
            <p>See shared check-ins and activities in one place, so you can catch up between the other things on your calendar.</p>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>Sandy’s Day</span>
        <a href="https://ourdailyally.com">From Our Daily Ally</a>
      </footer>
    </div>
  );
}
