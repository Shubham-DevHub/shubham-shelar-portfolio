import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Printer, Download, Copy, Check } from 'lucide-react';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  dynamicResume?: {
    fullName: string;
    tagline: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    skillsLine: string;
    frameworksLine: string;
    cloudLine: string;
    dbLine: string;
    aiLine: string;
    toolsLine: string;
    featuredWorkText: string;
    educationText: string;
  };
}

export default function ResumeModal({ isOpen, onClose, dynamicResume }: ResumeModalProps) {
  const [copied, setCopied] = useState(false);

  const fallbackResume = {
    fullName: 'Shubham Shelar',
    tagline: 'Full Stack Developer | AI Developer',
    email: 'shelarshubham3236@gmail.com',
    phone: '+91 8600703236',
    location: 'Pune, India',
    summary: 'Highly motivated Computer Science Graduate specializing in scalable, robust application engineering. Possesses refined skills bridging backend workflow components with gorgeous, responsive frontend interfaces. Eager to bring deep full-stack design expertise, machine learning APIs integration knowledge, and modern cloud deployment standards into dynamic products.',
    skillsLine: 'Python, SQL, TypeScript, Bash',
    frameworksLine: 'React.js, Django, Django REST Framework, Tailwind CSS',
    cloudLine: 'AWS (EC2, S3, Lambda, VPC, CloudWatch), Git & GitHub',
    dbLine: 'MySQL, SQLite, PostgreSQL',
    aiLine: 'Gemini API SDK, ChatGPT, Claude API, LangChain',
    toolsLine: 'Postman, VS Code, Vitest, PyTest',
    featuredWorkText: 'Structured contextual campaign descriptors matching modern social layouts and engineered lightweight real-time AI context indexing templates.',
    educationText: 'Pune University, India. Core training in Data Structures, Database Architecture, and Distributed Networks.'
  };

  const current = dynamicResume ? { ...fallbackResume, ...dynamicResume } : fallbackResume;

  if (!isOpen) return null;

  const handleCopyText = () => {
    const resumeText = `
${current.fullName.toUpperCase()}
${current.tagline}
Email: ${current.email}
Phone: ${current.phone}
Location: ${current.location}

SUMMARY
${current.summary}

TECHNICAL ARSENAL
- Programming: ${current.skillsLine}
- Web Development: ${current.frameworksLine}
- Cloud (AWS): ${current.cloudLine}
- Databases: ${current.dbLine}
- Tools & Pipelines: ${current.toolsLine}
- AI Integration: ${current.aiLine}

FEATURED PROJECTS
- Aether AI Chat: ${current.featuredWorkText}

EDUCATION
- ${current.educationText}
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
      <div className="relative w-full max-w-3xl h-[90vh] flex flex-col glass-card specular-edge rounded-lg bg-white/95 dark:bg-[#0c1222] shadow-2xl overflow-hidden text-[#111c2d] dark:text-gray-100 self-center">
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#111c2d]/10 dark:border-white/10 bg-white/45 dark:bg-[#141b2e]">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg font-display text-primary">Shubham Shelar — Professional Resume</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="p-1.5 hover:bg-[#111c2d]/5 dark:hover:bg-white/5 rounded text-on-surface-variant hover:text-primary transition-all flex items-center gap-1 text-xs font-semibold"
              title="Copy Resume Plain Text"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 hover:bg-[#111c2d]/5 dark:hover:bg-white/5 rounded text-on-surface-variant hover:text-primary transition-all flex items-center gap-1 text-xs font-semibold"
              title="Print Resume"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#111c2d]/5 dark:hover:bg-white/5 rounded-full transition-all text-on-surface-variant hover:text-primary ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resume Content Page */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-white dark:bg-[#0c1222] space-y-8 font-sans scroll-smooth text-[#111c2d] dark:text-gray-100">
          {/* Main Title & Contacts */}
          <div className="border-b border-black/5 dark:border-white/5 pb-6 text-center md:text-left flex flex-col md:flex-row md:justify-between items-center md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-[#111c2d] dark:text-gray-100 font-display tracking-tight uppercase">{current.fullName}</h1>
              <p className="text-primary font-semibold text-sm tracking-widest font-display uppercase mt-1">
                {current.tagline}
              </p>
            </div>
            <div className="text-xs text-on-surface-variant space-y-1 md:text-right">
              <p className="flex items-center justify-center md:justify-end gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-primary" /> {current.email}
              </p>
              <p className="flex items-center justify-center md:justify-end gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-primary" /> {current.phone}
              </p>
              <p className="flex items-center justify-center md:justify-end gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-primary" /> {current.location}
              </p>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#4457b3] dark:text-[#8b9dff] font-display">SUMMARY</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {current.summary}
            </p>
          </div>

          {/* Grid: Skills list */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#4457b3] dark:text-[#8b9dff] font-display">TECHNICAL EXPERTISE</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-[#111c2d] dark:text-gray-150">Languages & Core</p>
                <p className="text-on-surface-variant">{current.skillsLine}</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#111c2d] dark:text-gray-150">Web Frameworks</p>
                <p className="text-on-surface-variant">{current.frameworksLine}</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#111c2d] dark:text-gray-150">Cloud / DevOps</p>
                <p className="text-on-surface-variant">{current.cloudLine}</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#111c2d] dark:text-gray-150">Databases</p>
                <p className="text-on-surface-variant">{current.dbLine}</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#111c2d] dark:text-gray-150">AI Integration</p>
                <p className="text-on-surface-variant">{current.aiLine}</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#111c2d] dark:text-gray-150">Tools & Testing</p>
                <p className="text-on-surface-variant">{current.toolsLine}</p>
              </div>
            </div>
          </div>

          {/* Academic Projects */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#4457b3] dark:text-[#8b9dff] font-display flex items-center gap-1">
              <Briefcase className="w-4 h-4" /> FEATURED WORK
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-[#111c2d] dark:text-gray-100">Featured Dynamic Engineering Highlights</h4>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {current.featuredWorkText}
                </p>
              </div>
            </div>
          </div>

          {/* Education & Certificates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#4457b3] dark:text-[#8b9dff] font-display flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" /> EDUCATION
              </h3>
              <div>
                <h4 className="text-sm font-bold text-[#111c2d] dark:text-gray-100">{current.educationText}</h4>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#4457b3] dark:text-[#8b9dff] font-display flex items-center gap-1.5">
                <Award className="w-4 h-4" /> CERTIFICATIONS
              </h3>
              <ul className="text-xs text-on-surface-variant space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                  <div>
                    <p className="font-bold text-[#111c2d] dark:text-gray-100">Full Stack Python Developer</p>
                    <p className="text-[10px]">Comprehensive Developer Career Track Cert</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                  <div>
                    <p className="font-bold text-[#111c2d] dark:text-gray-100">AWS Cloud Specialist</p>
                    <p className="text-[10px]">Infrastructure Design, Lambda, EC2 and VPC Networking Setup</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                  <div>
                    <p className="font-bold text-[#111c2d] dark:text-gray-100">Generative AI Solutions Architect</p>
                    <p className="text-[10px]">16+ Verified Credentials including Google Gemini for Coders, DeepSeek Foundations, and Building Generative AI powered apps with Python</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-white/50 dark:bg-[#141b2e] border-t border-black/5 dark:border-white/5 flex justify-between items-center text-xs text-on-surface-variant">
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
