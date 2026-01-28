'use client';

import { useEffect, useState } from "react";
import NeuralNetworkHero from "@/components/ui/neural-network-hero";
import Carousel from "@/components/home/Carousel";
import { useSession } from "next-auth/react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Track } from "@/types";
import { motion } from "framer-motion";
import GenreGrid from "@/components/home/GenreGrid";

const MOCK_TRACKS: Track[] = [
  { id: 'mock-1', artistId: 'mock-artist', title: 'Midnight City', artist: 'M83', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', genre: 'Electronic', duration: 240, plays: 120500 },
  { id: 'mock-2', artistId: 'mock-artist', title: 'Starboy', artist: 'The Weeknd', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', genre: 'R&B', duration: 230, plays: 980400 },
  { id: 'mock-3', artistId: 'mock-artist', title: 'Nightcall', artist: 'Kavinsky', coverUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400&h=400&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', genre: 'Synthwave', duration: 258, plays: 450200 },
];

export default function Home() {
  const { data: session } = useSession();
  const { history: recentlyPlayed } = usePlayerStore();
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);

  useEffect(() => {
    fetch('/api/tracks?mode=trending')
      .then(res => res.json())
      .then(data => {
        const tracks = data.tracks || [];
        // If we have few tracks, mix in professional mock data to keep the elite look
        if (tracks.length < 5) {
          setTrendingTracks([...tracks, ...MOCK_TRACKS].slice(0, 10));
        } else {
          setTrendingTracks(tracks);
        }
      })
      .catch(err => {
        console.error("Failed to fetch trending tracks", err);
        setTrendingTracks(MOCK_TRACKS);
      });
  }, []);

  return (
    <div className="relative min-h-screen">
      <NeuralNetworkHero
        title={"The Future of\nSound is Here."}
        description="Join the elite circle of artists pushing the boundaries of sonic innovation. Distribute, grow, and dominate with COREWAVE."
        badgeText="Next Generation Distribution"
        badgeLabel="New"
        ctaButtons={
          session ? [
            { text: "Start Listening", href: "/explore", primary: true },
            { text: "View Showcase", href: "#trending" }
          ] : [
            { text: "Join the Evolution", href: "/signup?role=artist", primary: true },
            { text: "Start Listening", href: "/explore" }
          ]
        }
        microDetails={["High-Fidelity Audio", "Global Reach", "Artist Analytics"]}
      />

      <motion.section
        className="container"
        style={{ padding: '4rem 2rem 0' }}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        {recentlyPlayed.length > 0 && (
          <div style={{ marginBottom: '5rem' }}>
            <Carousel title="Based on Activity" tracks={recentlyPlayed} />
          </div>
        )}

        {trendingTracks.length > 0 && (
          <Carousel title="Trending Evolution" tracks={trendingTracks} />
        )}

        <GenreGrid />
      </motion.section>

      <motion.section
        className="container"
        style={{ padding: '8rem 2rem' }}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div className="badge" style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)',
            borderRadius: '0',
            fontSize: '0.8rem',
            color: 'var(--corewave-blue)',
            marginBottom: '1.5rem'
          }}>Core Features</div>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            Crafted for the <span className="text-gradient">Next Generation</span>
          </h2>
          <p className="bebas-body" style={{ color: 'var(--muted-foreground)', maxWidth: '600px', margin: '0 auto' }}>
            Everything you need to distribute, manage, and scale your music career globally.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2.5rem'
        }}>
          <div className="premium-card" style={{ padding: '4rem 3rem', border: '1px solid var(--border)' }}>
            <div style={{ width: '60px', height: '60px', background: 'var(--grad-primary)', borderRadius: '0', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
            </div>
            <h3 className="bebas-text" style={{ fontSize: '2rem', marginBottom: '1.25rem' }}>Artist First</h3>
            <p className="bebas-body" style={{ color: 'var(--muted-foreground)', fontSize: '1rem' }}>
              Take full control of your music. Upload, manage, and track your performance with advanced analytics designed for real growth.
            </p>
          </div>

          <div className="premium-card" style={{ padding: '4rem 3rem', border: '1px solid var(--border)' }}>
            <div style={{ width: '60px', height: '60px', background: 'var(--grad-primary)', borderRadius: '0', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
            </div>
            <h3 className="bebas-text" style={{ fontSize: '2rem', marginBottom: '1.25rem' }}>Pure Sound</h3>
            <p className="bebas-body" style={{ color: 'var(--muted-foreground)', fontSize: '1rem' }}>
              Experience high-fidelity streaming without the clutter. Our platform is built on audio purity and seamless playback.
            </p>
          </div>

          <div className="premium-card" style={{ padding: '4rem 3rem', border: '1px solid var(--border)' }}>
            <div style={{ width: '60px', height: '60px', background: 'var(--grad-primary)', borderRadius: '0', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
            </div>
            <h3 className="bebas-text" style={{ fontSize: '2rem', marginBottom: '1.25rem' }}>Global Reach</h3>
            <p className="bebas-body" style={{ color: 'var(--muted-foreground)', fontSize: '1rem' }}>
              Connect with listeners worldwide. A platform designed for global discovery, distribution, and social connectivity.
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
