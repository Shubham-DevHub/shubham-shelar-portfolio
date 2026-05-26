import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Printer, Download, Copy, Check } from 'lucide-react';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyText = () => {
    const resumeText = `
SHUBHAM SHELAR
Full Stack Developer & AI Developer
Email: shelarshubham3236@gmail.com
Phone: +91 8600703236
Location: India

SUMMARY
Computer Science graduate with a strong technical foundation in scalable software development, full-stack pipelines, and modern AI integration tools. Passionate about building elegant digital solutions with flawless code design and delightful interfaces.

TECHNICAL ARSENAL
- Programming: Python, SQL
- Web Development: React.js, Django, Django REST Framework (DRF), Tailwind CSS
- Cloud (AWS): EC2, S3, Lambda, VPC
- Databases: MySQL, SQLite
- Tools & Pipelines: Git & GitHub, Postman, VS Code
- AI Integration: ChatGPT, Gemini API, Claude API, Github Copilot

FEATURED PROJECTS
1. Aether AI Chat
- Built an advanced AI chatbot hub featuring sub-second streaming replies and dynamic prompt analysis.
- Technologies: React.js, WebSockets, Python backend, custom stream processors.

2. CampaignCraft AI
- Implemented an automated marketing asset builder.
- Designed system structures around Google Gemini with automated graphic prompts generation.

EDUCATION
Bachelor of Engineering / Science in Computer Science
- Comprehensive training in Data Structures, Algorithms, Databases, and Software Architecture.

CERTIFICATIONS
- Full Stack Python — Comprehensive Developer Track
- AWS Cloud — Infrastructure & Deployment Certification
    `;
    navigator.clipboard.writeText(resumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#111c2d]/60 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl h-[90vh] flex flex-col glass-card specular-edge rounded-lg bg-white/80 shadow-2xl overflow-hidden text-[#111c2d] self-center">
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#111c2d]/10 bg-white/45">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg font-display text-primary">Shubham Shelar — Professional Resume</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="p-1.5 hover:bg-[#111c2d]/5 rounded text-on-surface-variant hover:text-primary transition-all flex items-center gap-1 text-xs font-semibold"
              title="Copy Resume Plain Text"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 hover:bg-[#111c2d]/5 rounded text-on-surface-variant hover:text-primary transition-all flex items-center gap-1 text-xs font-semibold"
              title="Print Resume"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#111c2d]/5 rounded-full transition-all text-on-surface-variant hover:text-primary ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resume Content Page */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-white space-y-8 font-sans scroll-smooth">
          {/* Main Title & Contacts */}
          <div className="border-b border-black/5 pb-6 text-center md:text-left flex flex-col md:flex-row md:justify-between items-center md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-[#111c2d] font-display tracking-tight uppercase">Shubham Shelar</h1>
              <p className="text-primary font-semibold text-sm tracking-widest font-display uppercase mt-1">
                Full Stack Developer | AI Developer
              </p>
            </div>
            <div className="text-xs text-on-surface-variant space-y-1 md:text-right">
              <p className="flex items-center justify-center md:justify-end gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-primary" /> shelarshubham3236@gmail.com
              </p>
              <p className="flex items-center justify-center md:justify-end gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-primary" /> +91 8600703236
              </p>
              <p className="flex items-center justify-center md:justify-end gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-primary" /> Pune, India
              </p>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#4457b3] font-display">SUMMARY</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Highly motivated Computer Science Graduate specializing in scalable, robust application engineering. Possesses refined skills bridging backend workflow components with gorgeous, responsive frontend interfaces. Eager to bring deep full-stack design expertise, machine learning APIs integration knowledge, and modern cloud deployment standards into dynamic products.
            </p>
          </div>

          {/* Grid: Skills list */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#4457b3] font-display">TECHNICAL EXPERTISE</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-[#111c2d]">Languages & Core</p>
                <p className="text-on-surface-variant">Python, SQL, TypeScript, Bash</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#111c2d]">Web Frameworks</p>
                <p className="text-on-surface-variant">React.js, Django, Django REST Framework, Tailwind CSS</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#111c2d]">Cloud / DevOps</p>
                <p className="text-on-surface-variant">AWS (EC2, S3, Lambda, VPC, CloudWatch), Git & GitHub</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#111c2d]">Databases</p>
                <p className="text-on-surface-variant">MySQL, SQLite, PostgreSQL</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#111c2d]">AI Integration</p>
                <p className="text-on-surface-variant">Gemini API SDK, ChatGPT, Claude API, LangChain</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#111c2d]">Tools & Testing</p>
                <p className="text-on-surface-variant">Postman, VS Code, Vitest, PyTest</p>
              </div>
            </div>
          </div>

          {/* Academic Projects */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#4457b3] font-display flex items-center gap-1">
              <Briefcase className="w-4 h-4" /> FEATURED WORK
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-[#111c2d]">Aether AI Chat Platform</h4>
                  <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-bold">Featured Solo Project</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Engineered a real-time, lightweight AI chat terminal leveraging sub-second streaming answers. Integrated WebSocket nodes to handle massive asynchronous request pools and custom context indexing templates.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-[#111c2d]">CampaignCraft AI Campaign Generator</h4>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">Featured AI Project</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Programmed a smart marketing automation hub utilizing Google Gemini API integration. Structured contextual campaign descriptors matching modern social layouts (Instagram, LinkedIn, X) with precise design instruction generators.
                </p>
              </div>
            </div>
          </div>

          {/* Education & Certificates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#4457b3] font-display flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" /> EDUCATION
              </h3>
              <div>
                <h4 className="text-sm font-bold text-[#111c2d]">Bachelor in Computer Science</h4>
                <p className="text-xs text-on-surface-variant"> Pune University, India</p>
                <p className="text-[11px] text-[#4457b3] font-semibold mt-1">Core training in Data Structures, Database Architecture, and Distributed Networks.</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#4457b3] font-display flex items-center gap-1.5">
                <Award className="w-4 h-4" /> CERTIFICATIONS
              </h3>
              <ul className="text-xs text-on-surface-variant space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                  <div>
                    <p className="font-bold text-[#111c2d]">Full Stack Python Developer</p>
                    <p className="text-[10px]">Comprehensive Developer Career Track Cert</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                  <div>
                    <p className="font-bold text-[#111c2d]">AWS Cloud Specialist</p>
                    <p className="text-[10px]">Infrastructure Design, Lambda, EC2 and VPC Networking Setup</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                  <div>
                    <p className="font-bold text-[#111c2d]">Generative AI Solutions Architect</p>
                    <p className="text-[10px]">16+ Verified Credentials including Google Gemini for Coders, DeepSeek Foundations, and Building Generative AI powered apps with Python</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-white/50 border-t border-black/5 flex justify-between items-center text-xs text-on-surface-variant">
          <span>Printed standard PDF compatible with ATS machines.</span>
          <button
            onClick={onClose}
            className="bg-primary text-white font-semibold font-display px-4 py-2 rounded-lg hover:bg-primary/95 transition-colors"
          >
            Close Resume
          </button>
        </div>
      </div>
    </div>
  );
}
