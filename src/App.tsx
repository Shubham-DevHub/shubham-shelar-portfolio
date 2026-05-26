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
  Users
} from 'lucide-react';

import BackgroundPhysics from './components/BackgroundPhysics';
import HeroInteractiveMesh from './components/HeroInteractiveMesh';
import ProjectDemoModal from './components/ProjectDemoModal';
import ResumeModal from './components/ResumeModal';

import { Project, SkillCategory, Certification, ContactFormData } from './types';
import { projects, skillCategories, certifications } from './data';
import { db, handleFirestoreError, OperationType } from './firebase';
import { doc, getDocFromServer, collection, setDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';

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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('hero');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  // Modals States
  const [selectedDemoProjectId, setSelectedDemoProjectId] = useState<string | null>(null);
  const [isResumeOpen, setIsResumeOpen] = useState(false);

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
    setIsDarkMode(prev => !prev);
  };

  // Map icons from dynamic categories string mapping safely to Lucide icons
  const getIconComponent = (iconName: string, sizeClass: string = "w-6 h-6") => {
    switch (iconName) {
      case 'Monitor': return <Monitor className={`${sizeClass} text-primary`} />;
      case 'Code': return <Code className={`${sizeClass} text-secondary`} />;
      case 'Cloud': return <Cloud className={`${sizeClass} text-[#01dfc0]`} />;
      case 'Database': return <Database className={`${sizeClass} text-indigo-500`} />;
      case 'Wrench': return <Wrench className={`${sizeClass} text-amber-500`} />;
      case 'Zap': return <Zap className={`${sizeClass} text-[#01dfc0]`} />;
      case 'CheckCircle2': return <CheckCircle2 className="w-12 h-12 text-primary" />;
      case 'CloudDownload': return <Cloud className="w-12 h-12 text-[#4457b3]" />;
      case 'Sparkles': return <Sparkles className={`${sizeClass} text-[#00dfc0]`} />;
      case 'Brain': return <Brain className={`${sizeClass} text-emerald-500`} />;
      case 'Award': return <Award className={`${sizeClass} text-yellow-500`} />;
      case 'Cpu': return <Cpu className={`${sizeClass} text-cyan-500`} />;
      case 'Terminal': return <Terminal className={`${sizeClass} text-rose-500`} />;
      case 'Search': return <Search className={`${sizeClass} text-sky-500`} />;
      case 'Megaphone': return <Megaphone className={`${sizeClass} text-orange-500`} />;
      case 'Activity': return <Activity className={`${sizeClass} text-violet-500`} />;
      case 'Users': return <Users className={`${sizeClass} text-teal-500`} />;
      default: return <Sparkles className={`${sizeClass} text-primary`} />;
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

  const glassOpacityValue = isDarkMode ? 0.25 : 0.4;
  const glassBlurValue = isDarkMode ? 'blur(20px)' : 'blur(12px)';

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
    <div className="bg-background min-h-screen text-on-surface font-sans selection:bg-primary-container selection:text-on-primary-container relative">
      
      {/* Background system & particles canvas */}
      <BackgroundPhysics opacity={glassOpacityValue} scrollY={scrollY} />

      {/* Scroll indicator bar */}
      <div 
        className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-[#00dfc0] via-[#006b5b] to-[#4457b3] z-[101] transition-all duration-100" 
        style={{ width: `${scrollProgress}%` }} 
      />

      {/* TopAppBar Navigation Header */}
      <header 
        style={{ backdropFilter: glassBlurValue }}
        className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-4 border-b border-black/5 bg-[#ffffff]/10 transition-all duration-300"
      >
        <div 
          onClick={() => handleScrollToSection('hero')}
          className="font-display text-2xl font-bold text-primary tracking-tighter cursor-pointer hover:opacity-85 transition-opacity"
        >
          Shubham Shelar
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex gap-8 items-center font-display">
          {['projects', 'skills', 'certifications', 'contact'].map((item) => (
            <button
              key={item}
              onClick={() => handleScrollToSection(item)}
              className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 hover:text-primary ${
                currentSection === item ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              {item}
            </button>
          ))}

          {/* Dark / Light mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="glass-card flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/10 hover:border-primary transition-all active:scale-95 text-xs text-on-surface cursor-pointer select-none"
            title="Toggle color theme"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                <span className="font-bold tracking-widest text-[10px]">THEME: LIGHT</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-primary" />
                <span className="font-bold tracking-widest text-[10px]">THEME: DARK</span>
              </>
            )}
          </button>

          {/* Interactive Resume Drawer Trigger */}
          <button 
            onClick={() => setIsResumeOpen(true)}
            className="bg-primary text-white text-xs font-semibold tracking-wider font-display px-5 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow hover:shadow-lg hover:bg-primary/95"
          >
            Resume
          </button>
        </nav>

        {/* Mobile menu panel trigger icon */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-primary p-1 hover:bg-black/5 rounded-full transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Navigation Backdrop and Panel */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex flex-col pt-20 bg-background/95 backdrop-blur-xl">
          <nav className="flex flex-col gap-6 p-8 items-center text-center font-display">
            {['projects', 'skills', 'certifications', 'contact'].map((item) => (
              <button
                key={item}
                onClick={() => handleScrollToSection(item)}
                className={`text-lg font-bold uppercase tracking-widest ${
                  currentSection === item ? 'text-primary' : 'text-on-surface'
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/40 dark:bg-white/10 border border-black/10 mt-4"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-on-surface">Switch to Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-on-surface">Switch to Dark Mode</span>
                </>
              )}
            </button>

            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsResumeOpen(true);
              }}
              className="bg-primary text-white text-sm font-semibold tracking-wider px-8 py-3 rounded-full mt-4 w-full"
            >
              Open Resume
            </button>
          </nav>
        </div>
      )}

      {/* Main Container Hero */}
      <main className="pt-20">
        
        {/* HERO SECTION */}
        <section 
          id="hero" 
          className="relative min-h-[92vh] flex flex-col justify-center items-center px-6 md:px-12 text-center overflow-hidden"
        >
          {/* Beautiful modern interactive ambient mesh particles & soft float glows */}
          <HeroInteractiveMesh isDarkMode={isDarkMode} />

          {/* Clean ambient radial gradient overlay to soften edges further */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background -z-10 pointer-events-none" />

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl z-10 space-y-6"
          >
            <div 
              style={{ backgroundColor: `rgba(255, 255, 255, ${glassOpacityValue})` }}
              className="inline-block px-4 py-1.5 glass-card rounded-full font-display text-xs font-semibold text-primary mb-4 border border-primary/20 cursor-default"
            >
              Available for New Opportunities
            </div>
            
            <h1 className="font-display text-4xl md:text-[54px] lg:text-[64px] font-extrabold text-on-surface leading-tight tracking-tight">
              Crafting the Future with <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#00dfc0] to-secondary">
                Liquid Intelligence
              </span>
            </h1>
 
            <p className="font-display text-lg md:text-2xl font-semibold text-on-surface-variant max-w-2xl mx-auto">
              Computer Science Graduate | Full Stack Developer | AI Developer
            </p>
 
            <p className="text-sm md:text-base text-on-surface-variant/80 max-w-xl mx-auto leading-relaxed">
              Building scalable web applications, AI-powered products, and modern digital experiences with a focus on high-performance code and elegant UI.
            </p>
 
            {/* Micro button layout triggers */}
            <div className="flex flex-wrap justify-center items-center gap-4 mt-8">
              <button 
                onClick={() => handleScrollToSection('projects')}
                className="bg-primary hover:bg-primary-container hover:text-on-primary-container text-white text-sm font-semibold font-display px-7 py-3.5 rounded-lg primary-glow hover:scale-105 active:scale-95 transition-all"
              >
                View Projects
              </button>
 
              <button 
                onClick={() => setIsResumeOpen(true)}
                style={{ backgroundColor: `rgba(255, 255, 255, ${glassOpacityValue})` }}
                className="glass-card text-on-surface text-sm font-semibold font-display px-7 py-3.5 rounded-lg hover:bg-black/5 active:scale-95 transition-all border border-black/5"
              >
                Download Resume
              </button>
 
              <button 
                onClick={() => handleScrollToSection('contact')}
                className="text-on-surface-variant hover:text-primary transition-colors text-xs font-bold tracking-widest font-display flex items-center gap-2 ml-2"
              >
                Contact Me <ArrowRight className="w-4 h-4 text-primary animate-pulse" />
              </button>
            </div>

          </motion.div>
 
          <div 
            onClick={() => handleScrollToSection('about')}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
            title="Read About Me"
          >
            <ChevronDown className="w-8 h-8 text-primary" />
          </div>
        </section>

        {/* ABOUT ME SECTION */}
        <motion.section 
          id="about" 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="py-20 px-6 md:px-12 max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            
            {/* Bio Card */}
            <div 
              style={{ backgroundColor: `rgba(255, 255, 255, ${glassOpacityValue})` }}
              className="glass-card specular-edge rounded-xl p-8 md:p-10 flex flex-col justify-between relative group shadow-sm hover:shadow-md border border-black/5"
            >
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary-container/10 blur-[64px] rounded-full group-hover:bg-primary-container/15 transition-all duration-700 pointer-events-none" />
              
              <div>
                <h2 className="font-display text-4xl font-extrabold text-on-surface mb-6">About Me</h2>
                <p className="text-sm md:text-base text-on-surface-variant leading-relaxed mb-6">
                  I am a Computer Science graduate with a strong technical foundation in scalable software development and AI tools. My passion lies in creating systems that are not only efficient but also intuitive. I specialize in bridging the gap between complex backend logic and sleek, modern user interfaces.
                </p>
              </div>

              {/* Tag system pills */}
              <div className="flex flex-wrap gap-2.5 pt-4">
                {['Python', 'React.js', 'Django', 'AWS', 'UI/UX'].map((tag) => (
                  <span 
                    key={tag}
                    style={{ backgroundColor: `rgba(255, 255, 255, ${glassOpacityValue - 0.1})` }}
                    className="glass-card px-3.5 py-1.5 rounded-full font-display text-[10px] uppercase tracking-wider font-semibold text-primary border border-primary/10 select-none"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Qualities Grid */}
            <div className="grid grid-cols-2 gap-6 font-display">
              
              <div 
                style={{ backgroundColor: `rgba(255, 255, 255, ${glassOpacityValue})` }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="glass-card specular-edge p-6 rounded-xl text-center hover:scale-[1.02] shadow-sm flex flex-col justify-center items-center"
              >
                <div className="text-primary mb-3 bg-[#006b5b]/10 p-3 rounded-full">
                  <Code className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base md:text-lg text-on-surface">Full Stack</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">End-to-end development expertise</p>
              </div>

              <div 
                style={{ backgroundColor: `rgba(255, 255, 255, ${glassOpacityValue})` }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="glass-card specular-edge p-6 rounded-xl text-center hover:scale-[1.02] shadow-sm flex flex-col justify-center items-center"
              >
                <div className="text-secondary mb-3 bg-[#4457b3]/10 p-3 rounded-full">
                  <Brain className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base md:text-lg text-on-surface">AI Driven</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Leveraging latest LLMs and tools</p>
              </div>

              <div 
                style={{ backgroundColor: `rgba(255, 255, 255, ${glassOpacityValue})` }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="glass-card specular-edge p-6 rounded-xl text-center hover:scale-[1.02] shadow-sm flex flex-col justify-center items-center"
              >
                <div className="text-[#01dfc0] mb-3 bg-[#01dfc0]/10 p-3 rounded-full">
                  <Cloud className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base md:text-lg text-on-surface">Cloud Ready</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Certified AWS infrastructure built</p>
              </div>

              <div 
                style={{ backgroundColor: `rgba(255, 255, 255, ${glassOpacityValue})` }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="glass-card specular-edge p-6 rounded-xl text-center hover:scale-[1.02] shadow-sm flex flex-col justify-center items-center"
              >
                <div className="text-rose-500 mb-3 bg-rose-500/10 p-3 rounded-full">
                  <Terminal className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base md:text-lg text-on-surface">Efficient</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Clean code and robust structures</p>
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
          className="py-20 px-6 md:px-12 bg-[#ffffff]/35 backdrop-blur-sm border-y border-black/5"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-4xl font-extrabold text-center text-on-surface mb-4">Technical Arsenal</h2>
            <p className="text-center text-on-surface-variant/80 max-w-md mx-auto text-xs md:text-sm mb-12">
              Structured modular layout of specialized tools, server languages, database architecture, and deployment modules Shubham utilizes daily.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skillCategories.map((cat, i) => (
                <div 
                  key={i}
                  style={{ backgroundColor: `rgba(255, 255, 255, ${glassOpacityValue})` }}
                  className="glass-card specular-edge p-6 rounded-xl space-y-4 shadow-sm border border-black/5"
                >
                  <div className="flex items-center gap-3 border-b border-black/5 pb-3">
                    {getIconComponent(cat.icon)}
                    <h3 className="font-display font-extrabold text-base text-on-surface">{cat.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill) => (
                      <div 
                        key={skill}
                        className="px-3 py-1.5 bg-black/5 rounded-md border border-black/5 font-display text-xs font-semibold text-on-surface"
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
          className="py-20 px-6 md:px-12 max-w-6xl mx-auto"
        >
          <h2 className="font-display text-4xl font-extrabold text-on-surface mb-4 text-center">Featured Projects</h2>
          <p className="text-center text-on-surface-variant/80 max-w-md mx-auto text-xs md:text-sm mb-12">
            Click 'Demo' to trigger actual interactive sandbox modules with live context reasoning outputs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <div 
                key={project.id}
                style={{ backgroundColor: `rgba(255, 255, 255, ${glassOpacityValue})` }}
                className="glass-card specular-edge rounded-xl overflow-hidden group shadow-sm hover:shadow-lg border border-black/5 flex flex-col justify-between"
              >
                <div>
                  {/* Image panel with linear projection */}
                  <div className="h-56 md:h-64 overflow-hidden relative">
                    <img 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      src={project.image}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" />
                  </div>

                  <div className="p-6 md:p-8 space-y-4">
                    <div className="text-left">
                      <h3 className="font-display text-xl font-bold text-on-surface leading-tight">
                        {project.title}
                      </h3>
                      <p className="text-xs md:text-sm text-on-surface-variant mt-2 leading-relaxed min-h-[60px] max-h-[80px] overflow-y-auto">
                        {project.description}
                      </p>
                    </div>

                    {/* Displays custom badge tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[9px] font-bold font-mono">
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
                      className="flex items-center gap-2 bg-black/5 hover:bg-black/10 px-4 py-2 rounded-lg font-display text-xs font-bold transition-all text-on-surface hover:scale-[1.03] active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-primary animate-spin-slow" /> Interactive Demo
                    </button>
                    {project.githubUrl && (
                      <a 
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-black/5 hover:bg-black/10 px-4 py-2 rounded-lg font-display text-xs font-bold transition-all text-on-surface"
                      >
                        <Github className="w-4 h-4 text-secondary" /> Source Code
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
          className="py-20 px-6 md:px-12 max-w-6xl mx-auto space-y-10"
        >
          <div className="space-y-4">
            <h2 className="font-display text-4xl font-extrabold text-on-surface mb-2 text-center">Verified Certifications</h2>
            <p className="text-center text-on-surface-variant/80 max-w-2xl mx-auto text-xs md:text-sm">
              Shubham's officially verified technical competencies, professional qualifications, and generative AI specializations. 
            </p>
          </div>

          {/* Interactive control bar (Search & Filtration Pills) */}
          <div 
            style={{ backgroundColor: `rgba(255, 255, 255, ${glassOpacityValue})` }}
            className="glass-card specular-edge p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between border border-black/5"
          >
            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All Certificates' },
                { id: 'major', label: 'Core Specializations' },
                { id: 'gemini', label: 'Google Gemini' },
                { id: 'chatgpt', label: 'ChatGPT / OpenAI' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCertFilter(tab.id as any)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold font-display transition-all ${
                    certFilter === tab.id
                      ? 'bg-primary text-white shadow-sm scale-102'
                      : 'bg-black/5 text-on-surface-variant hover:bg-black/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Keyword Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={certSearchQuery}
                onChange={(e) => setCertSearchQuery(e.target.value)}
                placeholder="Search credentials (e.g. LLM, SEO)..."
                className="w-full bg-black/5 border border-black/5 rounded-lg pl-9 pr-4 py-2 text-xs font-sans focus:outline-none focus:border-primary text-on-surface transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-on-surface-variant/75 absolute left-3 top-1/2 -translate-y-1/2" />
              {certSearchQuery && (
                <button 
                  onClick={() => setCertSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary font-bold text-[10px]"
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
                <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-[#4457b3]">
                  Core Specializations & Milestones
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {majorCerts.map((badge, index) => (
                    <div 
                      key={index}
                      style={{ backgroundColor: `rgba(255, 255, 255, ${glassOpacityValue})` }}
                      onMouseMove={handleCardMouseMove}
                      onMouseLeave={handleCardMouseLeave}
                      className="glass-card specular-edge p-6 rounded-xl flex flex-col justify-between hover:scale-[1.02] shadow-sm border border-black/5 transition-all group"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="bg-white/50 p-3 rounded-xl shadow-inner border border-black/5 group-hover:scale-105 transition-transform duration-300">
                            {getIconComponent(badge.icon, "w-6 h-6")}
                          </div>
                          <span className="text-[9px] font-mono font-bold bg-[#006b5b]/10 text-primary px-2.5 py-0.5 rounded border border-primary/5 uppercase tracking-wider">
                            {badge.issuer || 'Verified'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-display font-black text-sm text-on-surface leading-tight tracking-tight">
                            {badge.title}
                          </h4>
                          <p className="font-sans text-xs text-on-surface-variant/90 leading-relaxed">
                            {badge.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Footer Info & Verification link */}
                      <div className="border-t border-black/5 mt-4 pt-3 flex items-center justify-between">
                        <span className="text-[10px] text-on-surface-variant/75 font-mono">
                          {badge.date || '2025'}
                        </span>
                        {badge.code && (
                          <span className="text-[9px] font-mono text-on-surface-variant/60 font-semibold">
                            ID: {badge.code}
                          </span>
                        )}
                        {badge.verifyUrl ? (
                          <a 
                            href={badge.verifyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-primary hover:text-[#00dfc0] font-bold font-display flex items-center gap-1 transition-colors"
                          >
                            Verify <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          badge.code && badge.issuer === 'Simplilearn' && (
                            <span className="text-[10px] text-[#4457b3] font-bold font-display">
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
            <div className="pt-4 border-t border-black/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#00dfc0] rounded-full animate-pulse" />
                  <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-on-surface-variant">
                    Specialized Work & Applied AI Credentials ({minorCerts.length})
                  </h3>
                </div>
                
                {/* Expand / Close Toggle */}
                <button
                  onClick={() => setShowAllCerts(!showAllCerts)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 hover:bg-black/10 rounded-lg text-xs font-bold font-display text-primary transition-all active:scale-95 border border-black/5"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                  {minorCerts.map((badge, index) => (
                    <div 
                      key={index}
                      style={{ backgroundColor: `rgba(255, 255, 255, ${glassOpacityValue})` }}
                      className="glass-card specular-edge p-4 rounded-xl flex flex-col justify-between hover:border-primary/20 shadow-sm border border-black/5 transition-all h-full"
                    >
                      <div className="flex gap-3 items-start">
                        <div className="bg-white/45 p-2 rounded-lg border border-black/5 shrink-0 mt-0.5">
                          {getIconComponent(badge.icon, "w-4 h-4")}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="font-display text-xs font-bold text-on-surface truncate leading-tight" title={badge.title}>
                            {badge.title}
                          </h4>
                          <p className="text-[11px] text-on-surface-variant/90 leading-snug line-clamp-1">
                            {badge.subtitle}
                          </p>
                          <p className="text-[10px] font-semibold text-[#4457b3] font-display flex items-center gap-1 pt-0.5">
                            {badge.issuer} &bull; <span className="text-on-surface-variant/60 font-medium">{badge.date}</span>
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-black/5 mt-3 pt-2 flex items-center justify-between text-[10px] font-mono text-on-surface-variant/65">
                        <span>ID: {badge.code || 'GL-Verify'}</span>
                        {badge.verifyUrl ? (
                          <a 
                            href={badge.verifyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:text-[#00dfc0] font-extrabold font-display flex items-center gap-0.5 transition-colors"
                          >
                            Verify <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-green-600 font-semibold font-sans">Active</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Sleek compact mini preview when closed to fulfill 'short down it' */
                <div className="bg-white/20 border border-black/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-full text-primary shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-on-surface font-display uppercase tracking-wider">
                        {minorCerts.length} Additional AI Credentials Filtered
                      </p>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        Features prompt engineering, task-agent orchestration with Manus AI, SEO copywriting models, and specific Excel & marketing LLM implementations.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAllCerts(true)}
                    className="bg-primary text-white text-[11px] font-bold font-display px-4 py-2 rounded-lg hover:bg-primary/95 transition-all text-center"
                  >
                    Expand All Credentials List
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Zero states */}
          {filteredCertifications.length === 0 && (
            <div className="text-center py-12 glass-card rounded-xl bg-white/40 border border-black/5 space-y-2">
              <AlertCircle className="w-8 h-8 text-[#4457b3] mx-auto animate-pulse" />
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
          className="py-20 px-6 md:px-12 max-w-6xl mx-auto"
        >
          
          <div 
            style={{ backgroundColor: `rgba(255, 255, 255, ${glassOpacityValue})` }}
            className="glass-card specular-edge rounded-xl p-6 md:p-12 shadow-sm border border-black/5"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 font-display">
              
              {/* Context Block */}
              <div className="flex flex-col justify-between space-y-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface leading-tight">
                    Let's Create <br />
                    Something Iconic
                  </h2>
                  <p className="text-xs md:text-sm text-on-surface-variant mt-4 leading-relaxed max-w-sm">
                    Have a full-stack project, an innovative system requirement, or a job offer? Put your details inside and let's craft modern high-tech systems together.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#006b5b]/10 flex items-center justify-center text-primary">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#4457b3] uppercase tracking-wider">Email</p>
                      <p className="text-sm font-bold text-on-surface">shelarshubham3236@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#4457b3]/10 flex items-center justify-center text-[#4457b3]">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#4457b3] uppercase tracking-wider">Phone</p>
                      <p className="text-sm font-bold text-on-surface">+91 8600703236</p>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-[#4457b3] font-semibold leading-relaxed">
                  Active Region: Pune, Maharashtra, India. Supports hybrid and remote pipelines.
                </div>
              </div>

              {/* Input Fields Form container */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {formSubmitted && (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-start gap-1.5 text-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold font-display">Message Received Success!</h4>
                      <p className="text-emerald-700/90 mt-0.5 font-sans">
                        Thanks for connecting with Shubham Shelar! He will respond to your requested topic under 24 hours.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe" 
                    className={`w-full bg-black/5 border ${formErrors.fullName ? 'border-rose-400' : 'border-black/5'} rounded-lg p-3.5 focus:outline-none focus:border-primary transition-colors text-on-surface text-sm`}
                  />
                  {formErrors.fullName && (
                    <p className="text-rose-500 text-[10px] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com" 
                    className={`w-full bg-black/5 border ${formErrors.email ? 'border-rose-400' : 'border-black/5'} rounded-lg p-3.5 focus:outline-none focus:border-primary transition-colors text-on-surface text-sm`}
                  />
                  {formErrors.email && (
                    <p className="text-rose-500 text-[10px] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Message</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell me about your project..." 
                    rows={4}
                    className={`w-full bg-black/5 border ${formErrors.message ? 'border-rose-400' : 'border-black/5'} rounded-lg p-3.5 focus:outline-none focus:border-primary transition-colors text-on-surface text-sm`}
                  />
                  {formErrors.message && (
                    <p className="text-rose-500 text-[10px] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.message}
                    </p>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-primary-container text-on-primary-container font-headline-md text-sm font-bold py-3.5 rounded-lg primary-glow hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
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
        style={{ backdropFilter: glassBlurValue }}
        className="fixed right-6 bottom-6 z-40 flex flex-col gap-3 p-1.5 items-center bg-white/30 border border-black/10 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.06)]"
      >
        <button 
          onClick={() => handleScrollToSection('hero')}
          className={`p-2.5 rounded-full transition-all ${
            currentSection === 'hero' ? 'bg-primary text-white scale-110 shadow-md' : 'text-on-surface hover:bg-black/5'
          }`}
          title="Home"
        >
          <Home className="w-4 h-4" />
        </button>

        <button 
          onClick={() => handleScrollToSection('about')}
          className={`p-2.5 rounded-full transition-all ${
            currentSection === 'about' ? 'bg-primary text-white scale-110 shadow-md' : 'text-on-surface hover:bg-black/5'
          }`}
          title="About Me"
        >
          <Briefcase className="w-4 h-4" />
        </button>

        <button 
          onClick={() => handleScrollToSection('skills')}
          className={`p-2.5 rounded-full transition-all ${
            currentSection === 'skills' ? 'bg-primary text-white scale-110 shadow-md' : 'text-on-surface hover:bg-black/5'
          }`}
          title="Technical Arsenal"
        >
          <Zap className="w-4 h-4" />
        </button>

        <button 
          onClick={() => handleScrollToSection('certifications')}
          className={`p-2.5 rounded-full transition-all ${
            currentSection === 'certifications' ? 'bg-primary text-white scale-110 shadow-md' : 'text-on-surface hover:bg-black/5'
          }`}
          title="Certifications"
        >
          <Award className="w-4 h-4" />
        </button>

        <button 
          onClick={() => handleScrollToSection('contact')}
          className={`p-2.5 rounded-full transition-all ${
            currentSection === 'contact' ? 'bg-primary text-white scale-110 shadow-md' : 'text-on-surface hover:bg-black/5'
          }`}
          title="Message"
        >
          <Mail className="w-4 h-4" />
        </button>
      </nav>

      {/* FOOTER SECTION */}
      <footer className="w-full py-12 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center border-t border-black/5 backdrop-blur-md bg-[#ffffff]/35">
        <div className="font-display font-bold text-lg text-primary mb-3 md:mb-0">
          Shubham Shelar
        </div>
        
        <div className="text-xs text-on-surface-variant/70 text-center font-display">
          © 2026 Shubham Shelar. Built with Liquid Glass Flow. Autogenous Design.
        </div>

        <div className="flex gap-4 mt-3 md:mt-0">
          <a 
            href="https://linkedin.com/in/shubhamshelar" 
            target="_blank" 
            rel="noreferrer"
            className="text-on-surface-variant hover:text-primary transition-colors hover:scale-110 p-1"
            title="LinkedIn profile"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <a 
            href="https://github.com/shubhamshelar" 
            target="_blank" 
            rel="noreferrer"
            className="text-on-surface-variant hover:text-primary transition-colors hover:scale-110 p-1"
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
        />
      )}

    </div>
  );
}
