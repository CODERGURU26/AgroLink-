'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import WaveDivider from '@/components/WaveDivider/WaveDivider';
import styles from './page.module.css';

function AnimatedCounter({ end, suffix = '', prefix = '' }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (end === 0 || hasAnimated.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1800;
          const start = Date.now();
          const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(end * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  const displayVal = end >= 100000
    ? `${prefix}${(value / 100000).toFixed(value >= 100000 ? 1 : 0)}L${suffix}`
    : `${prefix}${value.toLocaleString('en-IN')}${suffix}`;

  return <h3 ref={ref}>{end === 0 ? '—' : displayVal}</h3>;
}

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) router.push(`/${user.role}/dashboard`);
  }, [user, router]);

  useEffect(() => {
    fetch('/api/seed').catch(() => {});
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroParticles}></div>
        <div className={styles.wheat}>🌾AgroLink</div>
        <h1 className={styles.title}>
          <span>Fair deals, straight from the field</span>
        </h1>
        <p className={styles.subtitle}>
          AgroLink connects farmers directly with buyers. No middlemen eating your profit.
          Real prices, real pay, and you can track every step from harvest to doorstep.
        </p>

        <div className={styles.roleButtons}>
          <Link href="/farmer/register" className={`${styles.roleBtn} ${styles.farmerBtn}`}>
            <span className={styles.emoji}>🧑‍🌾</span>
            <span className={styles.label}>I am a Farmer</span>
            <span className={styles.desc}>List your produce, get fair prices</span>
          </Link>
          <Link href="/buyer/register" className={`${styles.roleBtn} ${styles.buyerBtn}`}>
            <span className={styles.emoji}>🏪</span>
            <span className={styles.label}>I am a Buyer</span>
            <span className={styles.desc}>Buy fresh, direct from farms</span>
          </Link>
        </div>

        <p className={styles.loginLink}>
          Already have an account? <Link href="/login">Log in here</Link>
        </p>
      </section>

      {/* Stats Strip — Real Data */}
      <section className={styles.statsStrip}>
        <div className={styles.statItem}>
          <AnimatedCounter end={stats?.farmers || 0} suffix="+" />
          <p>Farmers Onboarded</p>
        </div>
        <div className={styles.statItem}>
          <AnimatedCounter end={stats?.tradeValue || 0} prefix="₹" />
          <p>Direct Trade Value</p>
        </div>
        <div className={styles.statItem}>
          <AnimatedCounter end={stats?.buyers || 0} suffix="+" />
          <p>Verified Buyers</p>
        </div>
        <div className={styles.statItem}>
          <AnimatedCounter end={stats?.states || 0} />
          <p>States Covered</p>
        </div>
      </section>

      {/* Wave Divider */}
      <WaveDivider color="var(--mist)" bg="var(--soil)" />

      {/* How It Works */}
      <section className={styles.howSection}>
        <h2>How it works — simple as sowing seeds</h2>
        <div className={styles.howCards}>
          <div className={styles.howCard}>
            <div className={styles.step}>1</div>
            <h3>List Your Produce</h3>
            <p>Farmer uploads crop details, photos, and sets a fair asking price based on live mandi rates.</p>
          </div>
          <div className={styles.howCard}>
            <div className={styles.step}>2</div>
            <h3>Buyers Make Offers</h3>
            <p>Verified buyers browse listings, check quality grades, and place offers or buy at asking price.</p>
          </div>
          <div className={styles.howCard}>
            <div className={styles.step}>3</div>
            <h3>Track & Get Paid</h3>
            <p>Track the supply chain from harvest to delivery. Payment lands the moment goods reach the buyer.</p>
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <WaveDivider color="var(--cream)" bg="var(--mist)" />

      {/* Innovative Features Showcase */}
      <section className={styles.featuresSection}>
        <h2>What makes AgroLink different</h2>
        <p className={styles.featuresSubtitle}>Real tools, real data — built for Indian farmers</p>
        <div className={styles.featGrid}>
          <div className={`${styles.featCard} ${styles.feat1}`}>
            <div className={styles.featIcon}>🌦️</div>
            <h3>Weather-Smart Pricing</h3>
            <p>Live weather from your location combined with mandi prices — tells you exactly when to sell each crop for maximum profit.</p>
          </div>
          <div className={`${styles.featCard} ${styles.feat2}`}>
            <div className={styles.featIcon}>⭐</div>
            <h3>Farmer Trust Score</h3>
            <p>Build your reputation from real transactions. Higher scores unlock microfinance pre-approval, crop insurance discounts, and priority placement.</p>
          </div>
          <div className={`${styles.featCard} ${styles.feat3}`}>
            <div className={styles.featIcon}>🎙️</div>
            <h3>Voice-First Community</h3>
            <p>Post farming tips using voice — no typing needed. Auto-transcription and category tagging for a truly inclusive forum.</p>
          </div>
          <div className={`${styles.featCard} ${styles.feat4}`}>
            <div className={styles.featIcon}>🗺️</div>
            <h3>Live Journey Tracking</h3>
            <p>Animated map tracks produce from farm to buyer with carbon footprint calculation and real-time freshness scoring.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerCol}>
            <h4>🌾 AgroLink</h4>
            <p>Built for the people who feed the nation. Fair prices, no middlemen, real transparency.</p>
          </div>
          <div className={styles.footerCol}>
            <h4>Quick Links</h4>
            <Link href="/farmer/register">Register as Farmer</Link>
            <Link href="/buyer/register">Register as Buyer</Link>
            <Link href="/login">Login</Link>
            <Link href="/community">Community Hub</Link>
          </div>
          <div className={styles.footerCol}>
            <h4>Contact</h4>
            <p>📞 1800-AGRO-LINK</p>
            <p>📧 namaste@agrolink.in</p>
            <p>📍 Pune, Maharashtra</p>
          </div>
        </div>
        <p className={styles.footerBottom}>© 2024 AgroLink — Made with ❤️ for Indian farms</p>
      </footer>
    </>
  );
}
