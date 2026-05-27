import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Menu,
  X,
  Droplet,
  Sun,
  Moon,
  ArrowRight,
  Code,
  Brain,
  Cloud,
  Terminal,
  Monitor,
  Database,
  Wrench,
  Zap,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Phone,
  Home,
  Briefcase,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Send,
  Download,
  AlertCircle,
  Cpu,
  Layers,
  Search,
  Megaphone,
  Activity,
  Users,
  Lock
} from 'lucide-react';

import BackgroundPhysics from './components/BackgroundPhysics';
import HeroInteractiveMesh from './components/HeroInteractiveMesh';
import ProjectDemoModal from './components/ProjectDemoModal';
import ResumeModal from './components/ResumeModal';
import AdminDashboard from './components/AdminDashboard';

import { Project, SkillCategory, Certification, ContactFormData } from './types';
import { projects, skillCategories, certifications } from './data';
import { db, handleFirestoreError, OperationType } from './firebase';
import { doc, getDoc, getDocFromServer, collection, setDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';

export default function App() {
  // Test connection to Firestore on initial boot as mandated by the Firebase Integration Skill
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();
  }, []);

  // Navigation & UI States
  const [neonStyle, setNeonStyle] = useState<'cyan' | 'purple'>(() => {
    const saved = localStorage.getItem('neon_style');
    return saved === 'purple' ? 'purple' : 'cyan';
  });

  const isDarkMode = true;

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('neon_style', neonStyle);
  }, [neonStyle]);

  // Cursor coordinate tracking for dynamic light aura
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('hero');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  // Modals States
  const [selectedDemoProjectId, setSelectedDemoProjectId] = useState<string | null>(null);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Dynamic Content States loaded from Firestore
  const [portfolioProjects, setPortfolioProjects] = useState<Project[]>(projects);
  const [dynamicResume, setDynamicResume] = useState<any>(null);

  // Certifications Expansion & Filtering States
  const [showAllCerts, setShowAllCerts] = useState(false);
  const [certSearchQuery, setCertSearchQuery] = useState('');
  const [certFilter, setCertFilter] = useState<'all' | 'major' | 'gemini' | 'chatgpt'>('all');

  // Contact Form State
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<ContactFormData>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load dyamic portfolio configurations from Firestore on initial boot
  useEffect(() => {
    const loadDynamicData = async () => {
      // 0. Instant restore from Local Storage for seamless UX
      try {
        const localProjectsStr = localStorage.getItem('portfolio_custom_projects');
        if (localProjectsStr) {
          const lProjects = JSON.parse(localProjectsStr);
          if (Array.isArray(lProjects) && lProjects.length > 0) {
            setPortfolioProjects([...projects, ...lProjects]);
          }
        }
        const localResumeStr = localStorage.getItem('portfolio_resume_config');
        if (localResumeStr) {
          setDynamicResume(JSON.parse(localResumeStr));
        }
      } catch (e) {
        console.error("Local storage recovery failed on boot:", e);
      }

      try {
        // 1. Fetch custom projects
        const qProjects = query(collection(db, 'projects'));
        const projectSnapshot = await getDocs(qProjects);
        const customProjects = projectSnapshot.docs.map(doc => doc.data() as Project);
        
        // Combine Firestore and local storage custom creations by unique ID
        const storedProjectsStr = localStorage.getItem('portfolio_custom_projects') || '[]';
        const storedProjects: Project[] = JSON.parse(storedProjectsStr);
        
        const mergedCustom = [...customProjects];
        storedProjects.forEach(lp => {
          if (!mergedCustom.some(cp => cp.id === lp.id)) {
            mergedCustom.push(lp);
          }
        });

        if (mergedCustom.length > 0) {
          setPortfolioProjects([...projects, ...mergedCustom]);
        }

        // 2. Fetch resume dynamic configurations
        const docRef = doc(db, 'resume_config', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDynamicResume(docSnap.data());
        }
      } catch (err) {
        console.error("Firestore loading error on mount (resorting to local storage fallback): ", err);
      }
    };
    loadDynamicData();
  }, []);

  // Scroll Progress and active section highlight tracking
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollProgress(scrolled);
      setScrollY(winScroll);

      // Section tracker
      const secs = ['hero', 'about', 'skills', 'projects', 'certifications', 'contact'];
      for (const s of secs) {
        const el = document.getElementById(s);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160 && rect.bottom >= 160) {
            setCurrentSection(s);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Form Submission Handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof ContactFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Partial<ContactFormData> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email Address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email syntax';
    }
    if (!formData.message.trim()) {
      errors.message = 'Message description is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSending(true);
    const path = 'contact_messages';
    try {
      // Generate a unique, secure ID for the document
      const docRef = doc(collection(db, path));
      await setDoc(docRef, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        createdAt: serverTimestamp()
      });

      setIsSending(false);
      setFormSubmitted(true);
      setFormData({ fullName: '', email: '', message: '' });
      setTimeout(() => setFormSubmitted(false), 5000);
    } catch (error) {
      setIsSending(false);
      console.error("Failed to submit message to the database: ", error);
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  // 3D Card Tilt Effect Logic inside React renders
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 25;
    const rotateY = (centerX - x) / 25;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  const toggleDarkMode = () => {
    setNeonStyle(prev => prev === 'cyan' ? 'purple' : 'cyan');
  };

  // Map icons from dynamic categories string mapping safely to Lucide icons
  const getIconComponent = (iconName: string, sizeClass: string = "w-6 h-6") => {
    const mainColor = neonStyle === 'cyan' ? 'text-cyan-400' : 'text-fuchsia-400';
    const subColor = neonStyle === 'cyan' ? 'text-blue-400' : 'text-purple-400';
    switch (iconName) {
      case 'Monitor': return <Monitor className={`${sizeClass} ${mainColor}`} />;
      case 'Code': return <Code className={`${sizeClass} ${subColor}`} />;
      case 'Cloud': return <Cloud className={`${sizeClass} text-cyan-400`} />;
      case 'Database': return <Database className={`${sizeClass} text-blue-400`} />;
      case 'Wrench': return <Wrench className={`${sizeClass} text-slate-400`} />;
      case 'Zap': return <Zap className={`${sizeClass} ${mainColor} animate-pulse`} />;
      case 'CheckCircle2': return <CheckCircle2 className={`w-12 h-12 ${mainColor}`} />;
      case 'CloudDownload': return <Cloud className={`w-12 h-12 ${subColor} animate-bounce-slow`} />;
      case 'Sparkles': return <Sparkles className={`${sizeClass} ${mainColor} animate-pulse`} />;
      case 'Brain': return <Brain className={`${sizeClass} text-purple-400`} />;
      case 'Award': return <Award className={`${sizeClass} text-yellow-400`} />;
      case 'Cpu': return <Cpu className={`${sizeClass} text-rose-400 animate-pulse`} />;
      case 'Terminal': return <Terminal className={`${sizeClass} text-slate-300 font-mono`} />;
      case 'Search': return <Search className={`${sizeClass} text-sky-400`} />;
      case 'Megaphone': return <Megaphone className={`${sizeClass} text-orange-400`} />;
      case 'Activity': return <Activity className={`${sizeClass} text-emerald-400`} />;
      case 'Users': return <Users className={`${sizeClass} text-teal-400`} />;
      default: return <Sparkles className={`${sizeClass} ${mainColor}`} />;
    }
  };

  // Helper smooth scroll click
  const handleScrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const glassOpacityValue = 0.15;
  const glassBlurValue = 'blur(24px)';
  const glassBgColor = 'rgba(10, 15, 30, 0.455)';
  const glassBgColorMuted = 'rgba(10, 15, 30, 0.25)';

  // Filtered certifications list with Search & Category
  const filteredCertifications = certifications.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(certSearchQuery.toLowerCase()) ||
                          cert.subtitle.toLowerCase().includes(certSearchQuery.toLowerCase()) ||
                          (cert.issuer && cert.issuer.toLowerCase().includes(certSearchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (certFilter === 'major') return cert.isMajor;
    if (certFilter === 'gemini') return cert.title.toLowerCase().includes('gemini');
    if (certFilter === 'chatgpt') return cert.title.toLowerCase().includes('chatgpt');

    return true;
  });

  // Split into major vs additional for visual hierarchy or collapsed layout
  const majorCerts = filteredCertifications.filter(c => c.isMajor);
  const minorCerts = filteredCertifications.filter(c => !c.isMajor);

  return (
    <div className="bg-background min-h-screen text-on-surface font-sans selection:bg-slate-800 selection:text-cyan-400 relative">
      
      {/* Background system & particles canvas */}
      <BackgroundPhysics opacity={glassOpacityValue} scrollY={scrollY} neonStyle={neonStyle} />

      {/* Global Cursor Glow Aura (Desktop only) */}
      <div className="cursor-highlight-container hidden md:block">
        <div 
          className="cursor-glow"
          style={{ 
            left: `${mousePos.x}px`, 
            top: `${mousePos.y}px`,
            background: neonStyle === 'cyan'
              ? 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(59, 130, 246, 0.03) 50%, rgba(0, 0, 0, 0) 75%)'
              : 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(236, 72, 153, 0.03) 50%, rgba(0, 0, 0, 0) 75%)'
          }}
        />
      </div>

      {/* Scroll indicator bar */}
      <div 
        className="fixed top-0 left-0 h-[3px] z-[101] transition-all duration-100" 
        style={{ 
          width: `${scrollProgress}%`,
          background: neonStyle === 'cyan'
            ? 'linear-gradient(90deg, #06b6d4, #3b82f6)'
            : 'linear-gradient(90deg, #a855f7, #ec4899)'
        }} 
      />

      {/* TopAppBar Navigation Header - Premium Capsule Bubble style */}
      <header 
        className="fixed top-5 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 flex justify-between items-center px-6 md:px-8 py-3 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500"
      >
        <div 
          onClick={() => handleScrollToSection('hero')}
          className="font-display text-xl font-bold text-white tracking-widest cursor-pointer hover:opacity-85 transition-opacity flex items-center gap-1.5"
        >
          <span className={`w-2.5 h-2.5 rounded-full ${neonStyle === 'cyan' ? 'bg-[#06b6d4]' : 'bg-[#a855f7]'} animate-pulse`} />
          SHUBHAM
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex gap-6 items-center font-display">
          {['projects', 'skills', 'certifications', 'contact'].map((item) => (
            <button
              key={item}
              onClick={() => handleScrollToSection(item)}
              className={`text-[11px] font-bold uppercase tracking-widest transition-colors duration-300 hover:text-white cursor-pointer ${
                currentSection === item 
                  ? (neonStyle === 'cyan' ? 'text-[#06b6d4]' : 'text-[#a855f7]') 
                  : 'text-slate-400'
              }`}
            >
              {item}
            </button>
          ))}

          {/* Cyber Dual Ambient mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 bg-white/5 transition-all active:scale-95 text-[10px] font-bold text-slate-300 cursor-pointer select-none"
            title="Toggle cyber ambient glow"
          >
            {neonStyle === 'cyan' ? (
              <>
                <Sparkles className="w-3 h-3 text-cyan-400 group-hover:rotate-12 transition-transform" />
                <span className="tracking-wider">AEON CYAN</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-fuchsia-400 group-hover:rotate-12 transition-transform" />
                <span className="tracking-wider">VOID PURPLE</span>
              </>
            )}
          </button>

          {/* Interactive Resume Drawer Trigger */}
          <button 
            onClick={() => setIsResumeOpen(true)}
            className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-all active:scale-95 text-white cursor-pointer ${
              neonStyle === 'cyan' 
                ? 'bg-[#06b6d4] hover:bg-[#0891b2] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
                : 'bg-[#a855f7] hover:bg-[#8b5cf6] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]'
            }`}
          >
            Resume
          </button>

          {/* Secure Admin Gate trigger button */}
          <button 
            onClick={() => setIsAdminDashboardOpen(true)}
            className="p-2 rounded-full border border-white/10 hover:border-white/25 bg-[#0a0f1d]/50 hover:scale-105 active:scale-95 transition-all text-slate-400 hover:text-white cursor-pointer"
            title="Open Admin Command Center"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </nav>

        {/* Mobile menu panel trigger icon */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`md:hidden p-1.5 rounded-full bg-white/5 border border-white/10 transition-all ${
            neonStyle === 'cyan' ? 'text-cyan-400' : 'text-fuchsia-400'
          }`}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Navigation Backdrop and Panel */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex flex-col pt-24 bg-slate-950/95 backdrop-blur-2xl">
          <nav className="flex flex-col gap-6 p-8 items-center text-center font-display">
            {['projects', 'skills', 'certifications', 'contact'].map((item) => (
              <button
                key={item}
                onClick={() => handleScrollToSection(item)}
                className={`text-lg font-bold uppercase tracking-widest ${
                  currentSection === item 
                    ? (neonStyle === 'cyan' ? 'text-cyan-400' : 'text-fuchsia-400') 
                    : 'text-slate-300'
                }`}
              >
                {item}
              </button>
            ))}

            <button
              onClick={() => {
                toggleDarkMode();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 mt-4 text-xs font-bold text-slate-300"
            >
              {neonStyle === 'cyan' ? (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Switch to Void Purple</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-fuchsia-400" />
                  <span>Switch to Aeon Cyan</span>
                </>
              )}
            </button>

            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsResumeOpen(true);
              }}
              className={`text-sm font-bold tracking-widest uppercase px-8 py-3 rounded-full mt-4 w-full cursor-pointer text-white ${
                neonStyle === 'cyan' ? 'bg-[#06b6d4]' : 'bg-[#a855f7]'
              }`}
            >
              Open Resume
            </button>

            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsAdminDashboardOpen(true);
              }}
              className="mt-2 bg-white/5 border border-white/10 text-slate-300 text-sm font-semibold tracking-wider px-8 py-2.5 rounded-full w-full flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-primary" /> Admin Hub
            </button>
          </nav>
        </div>
      )}

      {/* Main Container Hero */}
      <main className="pt-28">
        
        {/* HERO SECTION */}
        <section 
          id="hero" 
          className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 md:px-12 text-center overflow-hidden"
        >
          {/* Beautiful modern interactive ambient mesh particles & soft float glows */}
          <HeroInteractiveMesh isDarkMode={true} />

          {/* Clean ambient radial gradient overlay to soften edges further */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030712]/30 to-[#030712] -z-10 pointer-events-none" />

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl z-10 space-y-8"
          >
            <div 
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
              className={`inline-flex items-center gap-2 px-4 py-1.5 glass-card rounded-full font-display text-xs font-semibold tracking-wider mb-2 border ${
                neonStyle === 'cyan' ? 'border-cyan-400/20 text-cyan-400' : 'border-fuchsia-400/20 text-fuchsia-400'
              } cursor-default`}
            >
              <span className={`w-2 h-2 rounded-full ${neonStyle === 'cyan' ? 'bg-cyan-400' : 'bg-fuchsia-400'} animate-pulse`} />
              Available for New Opportunities
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.05] tracking-tight text-glow">
              Engineering <br />
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
                neonStyle === 'cyan' 
                  ? 'from-cyan-400 via-sky-400 to-blue-500' 
                  : 'from-fuchsia-400 via-purple-500 to-indigo-500'
              } animate-pulse-slow`}>
                Liquid Intelligence
              </span>
            </h1>
 
            <p className="font-display text-lg md:text-2xl font-bold tracking-wide text-slate-300 max-w-2xl mx-auto">
              Computer Science Graduate & Full Stack AI Developer
            </p>
 
            <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
              Designing interfaces inspired by Apple Vision Pro and Linear. Scaling fast Python backends, high-performance local AI endpoints, and interactive React applications.
            </p>
 
            {/* Micro button layout triggers */}
            <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
              <button 
                onClick={() => handleScrollToSection('projects')}
                className={`relative px-7 py-3.5 rounded-full font-bold font-display text-xs uppercase tracking-widest text-white shadow-2xl transition-all hover:scale-105 active:scale-95 duration-300 cursor-pointer ${
                  neonStyle === 'cyan' 
                    ? 'bg-cyan-500 hover:bg-cyan-600 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]' 
                    : 'bg-fuchsia-500 hover:bg-fuchsia-600 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]'
                }`}
              >
                View Projects
              </button>
 
              <button 
                onClick={() => setIsResumeOpen(true)}
                className="glass-card text-white text-xs font-bold font-display uppercase tracking-widest px-7 py-3.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all border border-white/10 cursor-pointer"
              >
                Download Resume
              </button>
 
              <button 
                onClick={() => handleScrollToSection('contact')}
                className={`transition-colors text-xs font-bold tracking-widest font-display flex items-center gap-2 ml-2 hover:text-white cursor-pointer ${
                  neonStyle === 'cyan' ? 'text-cyan-400' : 'text-fuchsia-400'
                }`}
              >
                Contact Me <ArrowRight className="w-4 h-4 animate-pulse" />
              </button>
            </div>

          </motion.div>
 
          <div 
            onClick={() => handleScrollToSection('about')}
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer opacity-50 hover:opacity-100 transition-opacity ${
              neonStyle === 'cyan' ? 'text-cyan-400' : 'text-fuchsia-400'
            }`}
            title="Read About Me"
          >
            <ChevronDown className="w-8 h-8" />
          </div>
        </section>

        {/* ABOUT ME SECTION */}
        <motion.section 
          id="about" 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="py-24 px-6 md:px-12 max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            
            {/* Bio Card */}
            <div 
              style={{ backgroundColor: 'rgba(10, 15, 30, 0.3)' }}
              className="glass-card specular-edge rounded-2xl p-8 md:p-10 flex flex-col justify-between relative group border border-white/10"
            >
              <div className={`absolute -top-10 -right-10 w-48 h-48 blur-[72px] rounded-full transition-all duration-700 pointer-events-none ${
                neonStyle === 'cyan' ? 'bg-cyan-500/10 group-hover:bg-cyan-500/20' : 'bg-fuchsia-500/15 group-hover:bg-fuchsia-500/25'
              }`} />
              
              <div>
                <h2 className="font-display text-4xl font-extrabold text-white tracking-tight mb-6">About Me</h2>
                <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-6">
                  I am a Computer Science graduate with a strong technical foundation in scalable software development and AI tools. My passion lies in creating systems that are not only efficient but also intuitive. I specialize in bridging the gap between complex backend logic and sleek, modern user interfaces.
                </p>
              </div>

              {/* Tag system pills */}
              <div className="flex flex-wrap gap-2.5 pt-4">
                {['Python', 'React.js', 'Django', 'AWS', 'UI/UX'].map((tag) => (
                  <span 
                    key={tag}
                    className={`px-3.5 py-1.5 rounded-full font-display text-[10px] uppercase tracking-wider font-bold border bg-white/5 select-none ${
                      neonStyle === 'cyan' ? 'border-cyan-500/20 text-cyan-400' : 'border-fuchsia-500/20 text-fuchsia-400'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Qualities Grid */}
            <div className="grid grid-cols-2 gap-6 font-display">
              
              <div 
                style={{ backgroundColor: 'rgba(10, 15, 30, 0.3)' }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className={`glass-card specular-edge p-6 rounded-2xl text-center hover:scale-[1.03] flex flex-col justify-center items-center border border-white/5 transition-all ${
                  neonStyle === 'cyan' ? 'hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'hover:border-fuchsia-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                }`}
              >
                <div className={`mb-3 p-3 rounded-full border bg-white/5 ${
                  neonStyle === 'cyan' ? 'border-cyan-500/20 text-cyan-400' : 'border-fuchsia-500/20 text-fuchsia-400'
                }`}>
                  <Code className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-base md:text-lg text-white">Full Stack</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">End-to-end development expertise</p>
              </div>

              <div 
                style={{ backgroundColor: 'rgba(10, 15, 30, 0.3)' }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className={`glass-card specular-edge p-6 rounded-2xl text-center hover:scale-[1.03] flex flex-col justify-center items-center border border-white/5 transition-all ${
                  neonStyle === 'cyan' ? 'hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'hover:border-fuchsia-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                }`}
              >
                <div className="mb-3 p-3 rounded-full border border-purple-500/20 text-purple-400 bg-white/5">
                  <Brain className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-base md:text-lg text-white">AI Driven</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Leveraging latest LLMs and tools</p>
              </div>

              <div 
                style={{ backgroundColor: 'rgba(10, 15, 30, 0.3)' }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className={`glass-card specular-edge p-6 rounded-2xl text-center hover:scale-[1.03] flex flex-col justify-center items-center border border-white/5 transition-all ${
                  neonStyle === 'cyan' ? 'hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'hover:border-fuchsia-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                }`}
              >
                <div className={`mb-3 p-3 rounded-full border bg-white/5 ${
                  neonStyle === 'cyan' ? 'border-cyan-500/20 text-cyan-400' : 'border-fuchsia-500/20 text-fuchsia-400'
                }`}>
                  <Cloud className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-base md:text-lg text-white">Cloud Ready</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Certified AWS infrastructure built</p>
              </div>

              <div 
                style={{ backgroundColor: 'rgba(10, 15, 30, 0.3)' }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className={`glass-card specular-edge p-6 rounded-2xl text-center hover:scale-[1.03] flex flex-col justify-center items-center border border-white/5 transition-all ${
                  neonStyle === 'cyan' ? 'hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'hover:border-fuchsia-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                }`}
              >
                <div className="mb-3 p-3 rounded-full border border-rose-500/20 text-rose-400 bg-white/5">
                  <Terminal className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-base md:text-lg text-white">Efficient</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Clean code and robust structures</p>
              </div>

            </div>
          </div>
        </motion.section>

        {/* TECHNICAL ARSENAL SECTION */}
        <motion.section 
          id="skills" 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="py-24 px-6 md:px-12 bg-black/45 backdrop-blur-xl border-y border-white/5"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-4xl font-extrabold text-center text-white tracking-tight mb-4">Technical Arsenal</h2>
            <p className="text-center text-slate-400 max-w-md mx-auto text-xs md:text-sm mb-12">
              Structured modular layout of specialized tools, server languages, database architecture, and deployment modules Shubham utilizes daily.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skillCategories.map((cat, i) => (
                <div 
                  key={i}
                  style={{ backgroundColor: 'rgba(10, 15, 30, 0.3)' }}
                  className={`glass-card specular-edge p-6 rounded-2xl space-y-4 border border-white/10 transition-all ${
                    neonStyle === 'cyan' ? 'hover:border-cyan-500/20' : 'hover:border-fuchsia-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    {getIconComponent(cat.icon)}
                    <h3 className="font-display font-extrabold text-base text-white">{cat.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill) => (
                      <div 
                        key={skill}
                        className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 font-display text-xs font-semibold text-slate-300 hover:text-white hover:border-white/20 transition-all duration-200"
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* FEATURED PROJECTS SECTION */}
        <motion.section 
          id="projects" 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="py-24 px-6 md:px-12 max-w-6xl mx-auto"
        >
          <h2 className="font-display text-4xl font-extrabold text-white tracking-tight mb-4 text-center">Featured Projects</h2>
          <p className="text-center text-slate-400 max-w-md mx-auto text-xs md:text-sm mb-12">
            Click 'Interactive Sandbox' to run full local logic modules with visual outputs and system reasoning telemetry logs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {portfolioProjects.map((project) => (
              <div 
                key={project.id}
                style={{ backgroundColor: 'rgba(10, 15, 30, 0.35)' }}
                className={`glass-card specular-edge rounded-2xl overflow-hidden group border border-white/10 flex flex-col justify-between transition-all duration-500 hover:scale-[1.015] hover:border-white/20 ${
                  neonStyle === 'cyan' ? 'hover:shadow-[0_0_30px_rgba(6,182,212,0.08)]' : 'hover:shadow-[0_0_30px_rgba(168,85,247,0.08)]'
                }`}
              >
                <div>
                  {/* Image panel with linear projection */}
                  <div className="h-56 md:h-64 overflow-hidden relative border-b border-white/5">
                    <img 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      src={project.image}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-transparent to-transparent pointer-events-none" />
                  </div>

                  <div className="p-6 md:p-8 space-y-4">
                    <div className="text-left">
                      <h3 className="font-display text-xl font-bold text-white tracking-tight leading-tight">
                        {project.title}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-400 mt-2 leading-relaxed min-h-[60px] max-h-[80px] overflow-y-auto">
                        {project.description}
                      </p>
                    </div>

                    {/* Displays custom badge tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.tags.map((tag, i) => (
                          <span 
                            key={i} 
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider border ${
                              neonStyle === 'cyan' ? 'bg-cyan-500/5 border-cyan-500/20 text-cyan-400' : 'bg-fuchsia-500/5 border-fuchsia-500/20 text-fuchsia-400'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 md:px-8 pb-6 md:pb-8">
                  {/* Buttons for actions */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button 
                      onClick={() => setSelectedDemoProjectId(project.id)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full font-display text-xs font-bold transition-all text-white border select-none cursor-pointer ${
                        neonStyle === 'cyan' 
                          ? 'bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                          : 'bg-fuchsia-500/10 border-fuchsia-500/20 hover:bg-fuchsia-500/20 hover:border-fuchsia-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Interactive Sandbox
                    </button>
                    {project.githubUrl && (
                      <a 
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 px-4 py-2.5 rounded-full font-display text-xs font-bold transition-all text-slate-300 hover:text-white"
                      >
                        <Github className="w-3.5 h-3.5" /> Source Code
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* CERTIFICATIONS SECTIONS */}
        <motion.section 
          id="certifications" 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="py-24 px-6 md:px-12 max-w-6xl mx-auto space-y-10"
        >
          <div className="space-y-4">
            <h2 className="font-display text-4xl font-extrabold text-white tracking-tight mb-2 text-center">Verified Certifications</h2>
            <p className="text-center text-slate-400 max-w-2xl mx-auto text-xs md:text-sm">
              Shubham's officially verified technical competencies, professional qualifications, and generative AI specializations. 
            </p>
          </div>

          {/* Interactive control bar (Search & Filtration Pills) */}
          <div 
            style={{ backgroundColor: 'rgba(10, 15, 30, 0.4)' }}
            className="glass-card specular-edge p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between border border-white/10"
          >
            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All Certificates' },
                { id: 'major', label: 'Core Specializations' },
                { id: 'gemini', label: 'Google Gemini' },
                { id: 'chatgpt', label: 'ChatGPT / OpenAI' }
              ].map(tab => {
                const isActive = certFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCertFilter(tab.id as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold font-display transition-all cursor-pointer ${
                      isActive
                        ? (neonStyle === 'cyan' ? 'bg-[#06b6d4] text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-[#a855f7] text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]')
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Keyword Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={certSearchQuery}
                onChange={(e) => setCertSearchQuery(e.target.value)}
                placeholder="Search credentials..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-sans focus:outline-none focus:border-white/20 text-white transition-colors placeholder-slate-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {certSearchQuery && (
                <button 
                  onClick={() => setCertSearchQuery('')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] ${
                    neonStyle === 'cyan' ? 'text-cyan-400' : 'text-fuchsia-400'
                  }`}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Specializations Grid - Show Major/Featured on Top */}
          <div className="space-y-6">
            {majorCerts.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display text-sm font-extrabold uppercase tracking-widest text-slate-400">
                  Core Specializations & Milestones
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {majorCerts.map((badge, index) => (
                    <div 
                      key={index}
                      style={{ backgroundColor: 'rgba(10, 15, 30, 0.3)' }}
                      onMouseMove={handleCardMouseMove}
                      onMouseLeave={handleCardMouseLeave}
                      className={`glass-card specular-edge p-6 rounded-2xl flex flex-col justify-between hover:scale-[1.02] border border-white/10 transition-all duration-300 group ${
                        neonStyle === 'cyan' ? 'hover:border-cyan-500/20' : 'hover:border-fuchsia-500/20'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="bg-white/5 p-3 rounded-xl border border-white/5 group-hover:scale-105 transition-transform duration-300">
                            {getIconComponent(badge.icon, "w-6 h-6")}
                          </div>
                          <span className={`text-[9px] font-mono font-bold bg-white/5 px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                            neonStyle === 'cyan' ? 'border-cyan-500/10 text-cyan-400' : 'border-fuchsia-500/10 text-fuchsia-400'
                          }`}>
                            {badge.issuer || 'Verified'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-display font-black text-sm text-white leading-tight tracking-tight">
                            {badge.title}
                          </h4>
                          <p className="font-sans text-xs text-slate-300 leading-relaxed">
                            {badge.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Footer Info & Verification link */}
                      <div className="border-t border-white/5 mt-4 pt-3 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {badge.date || '2025'}
                        </span>
                        {badge.code && (
                          <span className="text-[9px] font-mono text-slate-500">
                            ID: {badge.code}
                          </span>
                        )}
                        {badge.verifyUrl ? (
                          <a 
                            href={badge.verifyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`text-[10px] font-bold font-display flex items-center gap-1 transition-colors ${
                              neonStyle === 'cyan' ? 'text-cyan-400 hover:text-cyan-300' : 'text-fuchsia-400 hover:text-fuchsia-300'
                            }`}
                          >
                            Verify <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          badge.code && badge.issuer === 'Simplilearn' && (
                            <span className="text-[10px] text-purple-400 font-bold font-display">
                              Verified
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Accordion / Dropdown Collapsible list for Minor Certifications -> "short down it" */}
          {minorCerts.length > 0 && (
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${neonStyle === 'cyan' ? 'bg-cyan-400' : 'bg-fuchsia-400'}`} />
                  <h3 className="font-display text-sm font-extrabold uppercase tracking-widest text-slate-400">
                    Specialized Credentials ({minorCerts.length})
                  </h3>
                </div>
                
                {/* Expand / Close Toggle */}
                <button
                  onClick={() => setShowAllCerts(!showAllCerts)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold font-display text-slate-300 hover:text-white transition-all active:scale-95 border border-white/10 cursor-pointer"
                >
                  {showAllCerts ? (
                    <>Hide <ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>Show All <ChevronDown className="w-4 h-4" /></>
                  )}
                </button>
              </div>

              {/* Collapsed / Expanded Box */}
              {showAllCerts ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in animate-duration-300">
                  {minorCerts.map((badge, index) => (
                    <div 
                      key={index}
                      style={{ backgroundColor: 'rgba(10, 15, 30, 0.25)' }}
                      className={`glass-card specular-edge p-4 rounded-xl flex flex-col justify-between border border-white/5 transition-all h-full ${
                        neonStyle === 'cyan' ? 'hover:border-cyan-500/10' : 'hover:border-fuchsia-500/10'
                      }`}
                    >
                      <div className="flex gap-3 items-start">
                        <div className="bg-white/5 p-2 rounded-lg border border-white/5 shrink-0 mt-0.5">
                          {getIconComponent(badge.icon, "w-4 h-4")}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="font-display text-xs font-bold text-white truncate leading-tight" title={badge.title}>
                            {badge.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-snug line-clamp-1">
                            {badge.subtitle}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-300 font-display flex items-center gap-1 pt-0.5">
                            {badge.issuer} &bull; <span className="text-slate-400 font-medium">{badge.date}</span>
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-white/5 mt-3 pt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>ID: {badge.code || 'GL-Verify'}</span>
                        {badge.verifyUrl ? (
                          <a 
                            href={badge.verifyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`font-bold font-display flex items-center gap-0.5 transition-colors ${
                              neonStyle === 'cyan' ? 'text-cyan-400 hover:text-cyan-300' : 'text-fuchsia-400 hover:text-fuchsia-300'
                            }`}
                          >
                            Verify <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-[#06b6d4] font-bold">Active</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Sleek compact mini preview when closed to fulfill 'short down it' */
                <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/5 border border-white/10 p-2.5 rounded-full shrink-0">
                      <Award className={`w-5 h-5 ${neonStyle === 'cyan' ? 'text-cyan-400 animate-pulse' : 'text-fuchsia-400 animate-pulse'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-white font-display uppercase tracking-widest">
                        {minorCerts.length} Additional AI Credentials Filtered
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
                        Features prompt engineering, task-agent orchestration with Manus AI, SEO copywriting models, and specific Excel & marketing LLM implementations.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAllCerts(true)}
                    className={`text-[10px] font-bold font-display uppercase tracking-widest px-5 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all text-center text-white cursor-pointer ${
                      neonStyle === 'cyan' ? 'bg-[#06b6d4] hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-[#a855f7] hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    }`}
                  >
                    Expand All Credentials List
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Zero states */}
          {filteredCertifications.length === 0 && (
            <div className="text-center py-12 glass-card rounded-xl bg-white/40 dark:bg-zinc-900/40 border border-black/5 dark:border-white/5 space-y-2">
              <AlertCircle className="w-8 h-8 text-[#4457b3] dark:text-[#8b9dff] mx-auto animate-pulse" />
              <h4 className="font-display font-extrabold text-on-surface">No Credentials Match Query</h4>
              <p className="text-xs text-on-surface-variant/85 max-w-xs mx-auto">
                Try resetting filters or clear search characters to query over Shubham's comprehensive list.
              </p>
              <button
                onClick={() => {
                  setCertSearchQuery('');
                  setCertFilter('all');
                }}
                className="text-xs text-primary font-bold hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </motion.section>

        {/* CONTACT SECTION */}
        <motion.section 
          id="contact" 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="py-24 px-6 md:px-12 max-w-6xl mx-auto"
        >
          
          <div 
            style={{ backgroundColor: 'rgba(10, 15, 30, 0.35)' }}
            className="glass-card specular-edge rounded-2xl p-6 md:p-12 border border-white/10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 font-display">
              
              {/* Context Block */}
              <div className="flex flex-col justify-between space-y-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                    Let's Create <br />
                    Something Iconic
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 mt-4 leading-relaxed max-w-sm font-sans">
                    Have a full-stack project, an innovative system requirement, or a job offer? Put your details inside and let's craft modern high-tech systems together.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-white/5 border flex items-center justify-center shrink-0 ${
                      neonStyle === 'cyan' ? 'border-cyan-500/20 text-cyan-400' : 'border-fuchsia-500/20 text-fuchsia-400'
                    }`}>
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</p>
                      <p className="text-sm font-black text-white">shelarshubham3236@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-white/5 border flex items-center justify-center shrink-0 ${
                      neonStyle === 'cyan' ? 'border-cyan-500/20 text-cyan-400' : 'border-fuchsia-500/20 text-fuchsia-400'
                    }`}>
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mobile Contact</p>
                      <p className="text-sm font-black text-white">+91 8600703236</p>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-semibold leading-relaxed font-sans">
                  Active Region: Pune, Maharashtra, India. Supports hybrid and remote collaboration pipelines.
                </div>
              </div>

              {/* Input Fields Form container */}
              <form onSubmit={handleFormSubmit} className="space-y-5">
                
                {formSubmitted && (
                  <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-start gap-1.5 text-xs animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold font-display text-white">Message Dispatched Successfully!</h4>
                      <p className="text-slate-300 mt-1 font-sans leading-relaxed">
                        Thanks for connecting with Shubham Shelar! He will respond to your requested topic under 24 hours.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe" 
                    className={`w-full bg-slate-950/45 border ${formErrors.fullName ? 'border-rose-500' : 'border-white/10'} rounded-xl p-3.5 focus:outline-none focus:border-white/20 text-white text-sm placeholder-slate-600 transition-colors focus:shadow-[0_0_15px_rgba(255,255,255,0.02)]`}
                  />
                  {formErrors.fullName && (
                    <p className="text-rose-400 text-[10px] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com" 
                    className={`w-full bg-slate-950/45 border ${formErrors.email ? 'border-rose-500' : 'border-white/10'} rounded-xl p-3.5 focus:outline-none focus:border-white/20 text-white text-sm placeholder-slate-600 transition-colors focus:shadow-[0_0_15px_rgba(255,255,255,0.02)]`}
                  />
                  {formErrors.email && (
                    <p className="text-rose-400 text-[10px] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message Overview</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell me about your project..." 
                    rows={4}
                    className={`w-full bg-slate-950/45 border ${formErrors.message ? 'border-rose-500' : 'border-white/10'} rounded-xl p-3.5 focus:outline-none focus:border-white/20 text-white text-sm placeholder-slate-600 transition-colors focus:shadow-[0_0_15px_rgba(255,255,255,0.02)]`}
                  />
                  {formErrors.message && (
                    <p className="text-rose-400 text-[10px] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.message}
                    </p>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={isSending}
                  className={`w-full py-3.5 rounded-xl font-bold font-display text-xs uppercase tracking-widest text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] duration-300 cursor-pointer ${
                    neonStyle === 'cyan' 
                      ? 'bg-cyan-500 hover:bg-cyan-600 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                      : 'bg-fuchsia-500 hover:bg-fuchsia-600 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                  } flex items-center justify-center gap-2`}
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  {isSending ? 'Transmitting package...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </motion.section>

      </main>

      {/* Floating Interactive Right SideNavBar Quick Menu */}
      <nav 
        className="fixed right-6 bottom-6 z-40 flex flex-col gap-3 p-1.5 items-center bg-black/40 border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      >
        {[
          { id: 'hero', icon: <Home className="w-4 h-4" />, title: 'Home' },
          { id: 'about', icon: <Briefcase className="w-4 h-4" />, title: 'About' },
          { id: 'skills', icon: <Zap className="w-4 h-4" />, title: 'Skills' },
          { id: 'certifications', icon: <Award className="w-4 h-4" />, title: 'Certifications' },
          { id: 'contact', icon: <Mail className="w-4 h-4" />, title: 'Message' }
        ].map(btn => {
          const isActive = currentSection === btn.id;
          return (
            <button 
              key={btn.id}
              onClick={() => handleScrollToSection(btn.id)}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                isActive 
                  ? (neonStyle === 'cyan' ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-110' : 'bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-110') 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={btn.title}
            >
              {btn.icon}
            </button>
          );
        })}
      </nav>

      {/* FOOTER SECTION */}
      <footer className="w-full py-12 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center border-t border-white/5 bg-[#030712]/80 backdrop-blur-md">
        <div className="font-display font-black text-lg text-white tracking-widest mb-3 md:mb-0">
          SHUBHAM
        </div>
        
        <div className="text-xs text-slate-500 text-center font-display tracking-wide">
          © 2026 Shubham Shelar. Styled with Premium Glassmorphism + Dynamic Fluidity.
        </div>

        <div className="flex gap-4 mt-3 md:mt-0">
          <a 
            href="https://linkedin.com/in/shubhamshelar" 
            target="_blank" 
            rel="_noreferrer"
            className="text-slate-400 hover:text-white transition-colors hover:scale-110 p-1"
            title="LinkedIn profile"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <a 
            href="https://github.com/shubhamshelar" 
            target="_blank" 
            rel="_noreferrer"
            className="text-slate-400 hover:text-white transition-colors hover:scale-110 p-1"
            title="GitHub profile"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </footer>

      {/* Sandbox Simulated Demo Modal Overlays */}
      {selectedDemoProjectId && (
        <ProjectDemoModal
          projectId={selectedDemoProjectId}
          isOpen={selectedDemoProjectId !== null}
          onClose={() => setSelectedDemoProjectId(null)}
        />
      )}

      {/* Document ATS interactive resume model */}
      {isResumeOpen && (
        <ResumeModal
          isOpen={isResumeOpen}
          onClose={() => setIsResumeOpen(false)}
          dynamicResume={dynamicResume}
        />
      )}

      {/* Dynamic portfolio admin control deck overlay */}
      {isAdminDashboardOpen && (
        <AdminDashboard
          isOpen={isAdminDashboardOpen}
          onClose={() => setIsAdminDashboardOpen(false)}
          onProjectsUpdated={(updated) => setPortfolioProjects(updated)}
          onResumeUpdated={(updated) => setDynamicResume(updated)}
          currentProjects={portfolioProjects}
        />
      )}

    </div>
  );
}
