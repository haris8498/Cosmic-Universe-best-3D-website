import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text, Html } from '@react-three/drei';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Rocket, 
  Globe2, 
  Telescope, 
  Compass,
  Volume2,
  VolumeX,
  Menu,
  X,
  Sparkles,
  Orbit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StarField from '@/components/universe/StarField';
import Planet from '@/components/universe/Planet';
import AnimatedCursor from '@/components/ui/animated-cursor';
import { useSpaceSound } from '@/hooks/useSound';
import * as THREE from 'three';

// Orbit Ring Component
const OrbitRing = ({ radius, color = '#00d4ff', opacity = 0.2 }: { radius: number; color?: string; opacity?: number }) => {
  const points = [];
  for (let i = 0; i <= 128; i++) {
    const angle = (i / 128) * Math.PI * 2;
    points.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      -50
    ));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity }))} />
  );
};

// Subtle Camera Drift
const SubtleCameraDrift = () => {
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    camera.position.x = Math.sin(t * 0.1) * 2;
    camera.position.y = Math.cos(t * 0.15) * 1;
    camera.lookAt(0, 0, -20);
  });

  return null;
};

// Main Dashboard Scene
const DashboardScene = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00d4ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#ff00ff" />
      <pointLight position={[0, 20, 0]} intensity={0.6} color="#ffd700" />

      <StarField count={3000} radius={100} />
      <Stars radius={150} depth={80} count={1500} factor={4} fade speed={0.1} />

      {/* Orbit Rings - More Visible */}
      <OrbitRing radius={20} color="#3b82f6" opacity={0.3} />
      <OrbitRing radius={35} color="#8b5cf6" opacity={0.25} />
      <OrbitRing radius={50} color="#14b8a6" opacity={0.2} />

      {/* Central Sun - Static */}
      <mesh position={[0, 0, -50]}>
        <sphereGeometry args={[8, 64, 64]} />
        <meshBasicMaterial color="#ffd700" />
      </mesh>
      <mesh position={[0, 0, -50]}>
        <sphereGeometry args={[9.5, 32, 32]} />
        <meshBasicMaterial color="#ffd700" transparent opacity={0.2} />
      </mesh>

      {/* Static Planets - Minimal Movement */}
      <Planet
        position={[0, 0, -50]}
        size={2}
        color="#3b82f6"
        emissiveColor="#1d4ed8"
        orbitRadius={20}
        orbitSpeed={0.05}
        hasRing
        ringColor="#60a5fa"
        glowIntensity={0.3}
      />
      <Planet
        position={[0, 0, -50]}
        size={2.5}
        color="#8b5cf6"
        emissiveColor="#7c3aed"
        orbitRadius={35}
        orbitSpeed={0.03}
        glowIntensity={0.2}
      />
      <Planet
        position={[0, 0, -50]}
        size={3}
        color="#14b8a6"
        emissiveColor="#0d9488"
        orbitRadius={50}
        orbitSpeed={0.02}
        hasRing
        ringColor="#2dd4bf"
        glowIntensity={0.2}
      />

      <SubtleCameraDrift />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        minDistance={20}
        maxDistance={100}
      />
    </>
  );
};

const Dashboard = () => {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('soundMuted');
    return saved !== null ? saved === 'true' : true;
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { play, playAmbience, stopAmbience, setMuted } = useSpaceSound();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({ container: containerRef });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  useEffect(() => {
    if (!isMuted) {
      playAmbience();
    }
    return () => stopAmbience();
  }, [isMuted, playAmbience, stopAmbience]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const currentScrollY = containerRef.current.scrollTop;
      
      if (currentScrollY < 50) {
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setShowNavbar(false);
      } else {
        // Scrolling up
        setShowNavbar(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [lastScrollY]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setMuted(newMuted);
    localStorage.setItem('soundMuted', String(newMuted));
    if (!newMuted) play('click', 0.3);
  };

  const navItems = [
    { name: 'Explore', path: '/explore', icon: Telescope },
    { name: 'Planets', path: '/planets', icon: Globe2 },
    { name: 'Journey', path: '/journey', icon: Compass },
  ];

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto bg-background"
    >
      {/* Animated Cursor */}
      <AnimatedCursor />

      {/* 3D Background */}
      <motion.div 
        className="fixed inset-0 z-0"
        style={{ y: backgroundY }}
      >
        <Canvas camera={{ position: [0, 0, 40], fov: 60 }}>
          <DashboardScene />
        </Canvas>
      </motion.div>

      {/* Overlay */}
      <div className="fixed inset-0 z-[1] pointer-events-none bg-gradient-to-b from-background/20 via-transparent to-background/60" />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: showNavbar ? 0 : -100, 
          opacity: showNavbar ? 1 : 0 
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-background/30"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer glass-panel px-4 py-2"
            onClick={() => navigate('/dashboard')}
          >
            <Orbit className="w-8 h-8 text-nebula-cyan" />
            <span className="font-orbitron text-xl font-bold text-foreground">
              UNI<span className="nebula-gradient glow-text">VER</span>SE
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <motion.div
                key={item.name}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.path}
                  className="flex items-center gap-2 px-4 py-2 glass-panel font-exo text-foreground hover:text-nebula-cyan transition-colors"
                  onMouseEnter={() => !isMuted && play('hover', 0.15)}
                  onClick={() => play('click', 0.3)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMute}
              className="p-3 glass-panel hover:bg-muted/30 transition-all"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Volume2 className="w-5 h-5 text-nebula-cyan" />
              )}
            </motion.button>

            {/* Mobile menu toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 glass-panel"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-foreground" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden mt-4 glass-panel p-4"
            >
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 font-exo text-foreground hover:text-nebula-cyan hover:bg-muted/20 rounded-lg transition-colors"
                  onClick={() => {
                    setIsMenuOpen(false);
                    play('click', 0.3);
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.section 
            className="text-center mb-32"
            style={{ opacity }}
          >
            {/* Title - Animated */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-orbitron text-5xl md:text-7xl lg:text-8xl font-black mb-8">
                <span className="nebula-gradient glow-text block">
                  Welcome to the
                </span>
                <span className="text-foreground block mt-2">
                  Mysterious Universe
                </span>
              </h1>
            </motion.div>

            {/* Description - Delayed Animation */}
            <motion.p 
              className="font-exo text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed px-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Explore distant galaxies, discover new planets, and journey through the cosmos
              in this interactive 3D experience.
            </motion.p>

            {/* CTA Button - Final Animation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-nebula-cyan via-nebula-magenta to-nebula-gold text-primary-foreground font-orbitron text-lg px-10 py-7 rounded-xl shadow-2xl hover:shadow-nebula-cyan/50 transition-all duration-300"
                onClick={() => {
                  play('whoosh', 0.5);
                  navigate('/explore');
                }}
              >
                <Rocket className="mr-3 w-6 h-6" />
                Start Your Journey
              </Button>
            </motion.div>
          </motion.section>

          {/* Feature Cards */}
          <motion.section 
            className="grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              {
                icon: Telescope,
                title: 'Explore Galaxies',
                description: 'Discover distant nebulae and star systems with interactive 3D exploration.',
                color: 'from-nebula-cyan to-blue-500',
                glowColor: 'rgba(0, 212, 255, 0.4)',
                path: '/explore',
              },
              {
                icon: Globe2,
                title: 'Visit Planets',
                description: 'Journey to exotic worlds with unique atmospheres and landscapes.',
                color: 'from-nebula-magenta to-purple-500',
                glowColor: 'rgba(236, 72, 153, 0.4)',
                path: '/planets',
              },
              {
                icon: Sparkles,
                title: 'Cosmic Journey',
                description: 'Experience breathtaking travel through wormholes and space-time.',
                color: 'from-nebula-gold to-orange-500',
                glowColor: 'rgba(255, 215, 0, 0.4)',
                path: '/journey',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.8 }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="glass-panel p-8 md:p-10 cursor-pointer group relative overflow-hidden"
                style={{
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}
                onClick={() => {
                  play('click', 0.4);
                  navigate(feature.path);
                }}
                onMouseEnter={() => !isMuted && play('hover', 0.15)}
              >
                {/* Background Glow Effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${feature.glowColor}, transparent 70%)`
                  }}
                />

                {/* Icon */}
                <motion.div 
                  className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                  whileHover={{ 
                    scale: 1.15, 
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  <feature.icon className="w-10 h-10 text-primary-foreground" />
                </motion.div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="font-orbitron text-xl md:text-2xl font-bold text-foreground mb-4 group-hover:text-nebula-cyan transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="font-exo text-base text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Border Effect */}
                <motion.div
                  className="absolute inset-0 border-2 border-transparent group-hover:border-nebula-cyan/30 rounded-lg transition-all duration-300"
                />
              </motion.div>
            ))}
          </motion.section>

          {/* Developers Section */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-32 mb-20"
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-orbitron font-bold text-center mb-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="nebula-gradient glow-text">Meet the</span>{' '}
              <span className="text-foreground">Creators</span>
            </motion.h2>
            <motion.p
              className="text-center text-muted-foreground font-exo text-lg mb-16 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              The brilliant minds behind this cosmic journey
            </motion.p>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
              {[
                {
                  name: 'Mahnoor',
                  image: '/Noor.jpg',
                  role: 'Frontend Developer',
                  description: 'Crafting stunning cosmic interfaces with precision and creativity',
                  color: 'from-nebula-magenta to-purple-500',
                  glowColor: 'rgba(236, 72, 153, 0.4)',
                },
                {
                  name: 'Muhammad Haris Khan',
                  image: '/Haris.png',
                  role: 'Full Stack Developer',
                  description: 'Building the universe one line of code at a time',
                  color: 'from-nebula-cyan to-blue-500',
                  glowColor: 'rgba(0, 212, 255, 0.4)',
                },
              ].map((dev, index) => (
                <motion.div
                  key={dev.name}
                  initial={{ opacity: 0, x: index === 0 ? -100 : 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-20%' }}
                  transition={{ duration: 0.8 }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  className="glass-panel p-8 relative overflow-hidden group cursor-pointer"
                >
                  {/* Background Glow */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${dev.glowColor}, transparent 70%)`
                    }}
                  />

                  <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Developer Image */}
                    <motion.div
                      className={`w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-6 relative border-4 border-transparent group-hover:border-nebula-cyan/50 transition-all duration-300`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img 
                        src={dev.image} 
                        alt={dev.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>

                    {/* Developer Info */}
                    <h3 className="font-orbitron text-2xl md:text-3xl font-bold text-foreground mb-2 group-hover:text-nebula-cyan transition-colors duration-300">
                      {dev.name}
                    </h3>
                    <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${dev.color} text-primary-foreground font-exo font-semibold text-sm mb-4`}>
                      {dev.role}
                    </div>
                    <p className="font-exo text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                      {dev.description}
                    </p>
                  </div>

                  {/* Hover Border */}
                  <motion.div
                    className="absolute inset-0 border-2 border-transparent group-hover:border-nebula-cyan/30 rounded-lg transition-all duration-300"
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-32 border-t border-muted-foreground/20 pt-12 pb-8"
          >
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-8">
              {/* About */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Orbit className="w-6 h-6 text-nebula-cyan" />
                  <h3 className="font-orbitron text-xl font-bold text-foreground">UNIVERSE</h3>
                </div>
                <p className="font-exo text-muted-foreground text-sm leading-relaxed">
                  Explore distant galaxies, discover new planets, and journey through the cosmos in this interactive 3D experience.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="font-orbitron text-lg font-bold text-foreground mb-4">Quick Links</h3>
                <ul className="space-y-2 font-exo">
                  {navItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        className="text-muted-foreground hover:text-nebula-cyan transition-colors text-sm flex items-center gap-2"
                        onClick={() => !isMuted && play('click', 0.2)}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Developers */}
              <div>
                <h3 className="font-orbitron text-lg font-bold text-foreground mb-4">Developers</h3>
                <div className="space-y-2 font-exo text-sm">
                  <p className="text-muted-foreground">
                    <span className="text-nebula-magenta font-semibold">Mahnoor</span>
                    <br />
                    <span className="text-xs">Frontend Developer</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="text-nebula-cyan font-semibold">Muhammad Haris Khan</span>
                    <br />
                    <span className="text-xs">Full Stack Developer</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="max-w-6xl mx-auto pt-8 border-t border-muted-foreground/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="font-exo text-muted-foreground text-sm text-center md:text-left">
                  © {new Date().getFullYear()} Universe Explorer. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-muted-foreground hover:text-nebula-cyan transition-colors"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    <span className="font-exo text-sm">Back to Top ↑</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.footer>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-exo text-sm text-muted-foreground">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-muted-foreground/50 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-nebula-cyan rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
