import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Megaphone, Palette, FileText, CheckCircle, Smartphone, ArrowRight, User, Terminal } from 'lucide-react';

interface ProjectDemoModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectDemoModal({ projectId, isOpen, onClose }: ProjectDemoModalProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'logs'>('preview');

  // Aether AI Chat simulation state
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    { sender: 'ai', text: 'Hi! I am Aether AI, a high-performance assistant. You can ask me anything about Shubham Shelar\'s skills or test my real-time streaming capabilities!', time: '12:00 PM' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // CampaignCraft AI state
  const [campaignTopic, setCampaignTopic] = useState('Sustainable Bamboo Water Bottles');
  const [campaignPlatform, setCampaignPlatform] = useState('Instagram');
  const [campaignTone, setCampaignTone] = useState('Inspiring');
  const [campaignResult, setCampaignResult] = useState<{
    headline: string;
    body: string;
    hashtags: string[];
    strategy: string;
    designPrompt: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-scroll messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (!isOpen) return null;

  // Handle Chat Simulation submit
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText;
    setInputText('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setIsTyping(true);

    // Mock response trigger
    setTimeout(() => {
      let response = "I'm processing your query using Aether's advanced stream engine. Shubham specializes in building high-performance full-stack applications with React, custom Python services, and AWS deployment!";
      
      const lower = userMsg.toLowerCase();
      if (lower.includes('skill') || lower.includes('languages') || lower.includes('stack')) {
        response = "Shubham possesses strong skills in Python, TypeScript, React, Django REST Framework, AWS (EC2, S3, Lambda, VPC), and relational databases like MySQL and SQLite.";
      } else if (lower.includes('project') || lower.includes('work') || lower.includes('portfolio')) {
        response = "His key featured projects are 'Aether AI Chat' (this live demo platform showcasing sub-second prompt responses) and 'CampaignCraft AI' (which optimizes marketing via the Gemini LLM pipeline).";
      } else if (lower.includes('contact') || lower.includes('email') || lower.includes('phone')) {
        response = "You can contact Shubham at shelarshubham3236@gmail.com, call +91 8600703236, or submit the contact form on this page!";
      } else if (lower.includes('aws') || lower.includes('cloud') || lower.includes('certif')) {
        response = "Shubham is certified in AWS Cloud Infrastructure and Full Stack Python development, demonstrating expertise in secure distributed systems and pipeline automation.";
      }

      setMessages(prev => [...prev, { sender: 'ai', text: response, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setIsTyping(false);
    }, 1200);
  };

  // Handle Campaign Generation submit
  const handleGenerateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setCampaignResult(null);

    setTimeout(() => {
      const hashtags = {
        Instagram: ['#EcoFriendly', '#GoGreen', '#BambooBottle', '#SustainableLiving'],
        LinkedIn: ['#Sustainability', '#GreenInnovation', '#EcoDesign', '#CorporateEco'],
        X: ['#CircularEconomy', '#ZeroWaste', '#BambooPower', '#EcoGear']
      }[campaignPlatform as 'Instagram' | 'LinkedIn' | 'X'] || ['#EcoFriendly', '#Lifestyle'];

      const contentByTopic = {
        'Sustainable Bamboo Water Bottles': {
          headline: 'Ditch the Plastic: Drink from Nature itself',
          body: `Keep your drinks crisp and state-of-the-art cold inside your handcrafted, double-walled organic bamboo hydration flask. 100% biodegradable body, leak-proof steel core, endless style points for your desk.`,
          strategy: 'Focus on natural materials, carbon offset metrics, and premium visual layout.',
          designPrompt: 'Minimalist product design capture of a modern bamboo flask standing upright on wet river stone, misty forest morning backdrop, high-end commercial aesthetic.'
        },
        'AI-Powered Task Manager App': {
          headline: 'A Productive Day. Engineered by AI.',
          body: `Meet the workspace that schedules itself, optimizes your schedule block, and auto-routes emails, allowing you to focus on genuine creative work and deep state flow.`,
          strategy: 'Emphasize mental focus restoration, automated routing speed, and clean workspace visuals.',
          designPrompt: 'High-contrast mobile device interface floating in front of clean glowing slate-blue studio lights with subtle glassmorphic notifications coming out.'
        },
        'Next-Gen Electric Courier Scooter': {
          headline: 'The Fast Lane to Zero-Emission Delivery',
          body: `Engineered with responsive dual hubs, integrated storage modules, and 90km hyper-charged swap batteries. Delivery fleets are turning completely green, one smart kilometer at a time.`,
          strategy: 'Highlight speed, swap-battery convenience, and corporate CSR alignment.',
          designPrompt: 'Aerodynamic obsidian black delivery scooter parked near a futuristic charging vault, neon emerald reflections on sleek wet asphalt.'
        }
      }[campaignTopic as 'Sustainable Bamboo Water Bottles' | 'AI-Powered Task Manager App' | 'Next-Gen Electric Courier Scooter'] || {
        headline: `Interactive Evolution for ${campaignTopic}`,
        body: `Unlock premium scalability with content tailored specifically to match your target auditory vibes and professional metrics.`,
        strategy: 'Analyze trends, establish core value metrics, and design a modern interactive user flow.',
        designPrompt: 'Minimalist technology abstract vector model representing digital flow, Electric Mint colors.'
      };

      setCampaignResult({
        headline: contentByTopic.headline,
        body: contentByTopic.body,
        hashtags: hashtags,
        strategy: contentByTopic.strategy,
        designPrompt: contentByTopic.designPrompt
      });
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#111c2d]/60 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl h-[85vh] flex flex-col glass-card specular-edge rounded-lg bg-white/70 shadow-2xl overflow-hidden text-[#111c2d] self-center">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#111c2d]/10 bg-white/45">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-primary-container text-on-primary-container rounded-md">
              {projectId === 'aether-ai-chat' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </span>
            <div>
              <h3 className="font-bold text-lg font-display text-primary">
                {projectId === 'aether-ai-chat' ? 'Aether AI Chat — Live Simulator' : 'CampaignCraft AI — Creative Sandbox'}
              </h3>
              <p className="text-xs text-on-surface-variant font-sans">
                Experience actual user-facing application flow right from the portfolio
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#111c2d]/5 rounded-full transition-colors text-on-surface-variant hover:text-primary">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-6 border-b border-[#111c2d]/10 bg-white/20">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'preview' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Live App Preview
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Terminal className="w-4 h-4" /> System Telemetry
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-transparent to-[#dee8ff]/30">
          {activeTab === 'preview' && (
            <div className="h-full">
              {projectId === 'aether-ai-chat' ? (
                /* AETHER AI CHAT PREVIEW */
                <div className="flex flex-col h-full bg-white/40 border border-black/5 rounded-xl shadow-inner overflow-hidden">
                  {/* Mock Chat Window Header */}
                  <div className="px-4 py-3 bg-[#006b5b]/10 border-b border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-bold text-on-primary-container uppercase tracking-wider font-display">
                        Aether Streaming Node v2.1
                      </span>
                    </div>
                    <span className="text-[10px] bg-white/60 text-[#006b5b] font-mono px-2 py-0.5 rounded border border-black/5">
                      Sub-second Latency
                    </span>
                  </div>

                  {/* Message Stream */}
                  <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 font-sans">
                    {messages.map((m, index) => (
                      <div key={index} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-xl px-4 py-2.5 shadow-sm ${
                          m.sender === 'user' 
                            ? 'bg-primary text-white rounded-br-none' 
                            : 'bg-white/90 border border-black/5 text-[#111c2d] rounded-bl-none'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                          <span className={`block text-[9px] mt-1 text-right ${
                            m.sender === 'user' ? 'text-white/70' : 'text-on-surface-variant/60'
                          }`}>
                            {m.time}
                          </span>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white/95 border border-black/5 text-on-surface-variant rounded-xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSendMessage} className="p-3 bg-white/60 border-t border-black/5 flex gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      placeholder="Ask the AI about Shubham, or type 'skills'..."
                      className="flex-1 bg-white/90 border border-black/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors scroll-m-1"
                    />
                    <button type="submit" className="bg-primary text-white p-2.5 rounded-lg hover:scale-105 active:scale-95 transition-all shadow p-2 font-display">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ) : (
                /* CAMPAIGN CRAFT AI PREVIEW */
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-full items-stretch">
                  {/* Control Panel */}
                  <div className="md:col-span-2 glass-card bg-white/50 border border-black/5 p-4 rounded-xl flex flex-col justify-between">
                    <form onSubmit={handleGenerateCampaign} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant font-display uppercase tracking-wider mb-1.5">
                          Campaign Concept / Product
                        </label>
                        <select
                          value={campaignTopic}
                          onChange={e => setCampaignTopic(e.target.value)}
                          className="w-full bg-white/90 border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        >
                          <option value="Sustainable Bamboo Water Bottles">Sustainable Bamboo Bottles</option>
                          <option value="AI-Powered Task Manager App">AI Task Manager App</option>
                          <option value="Next-Gen Electric Courier Scooter">Electric Courier Scooter</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant font-display uppercase tracking-wider mb-1.5">
                          Target Platform
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Instagram', 'LinkedIn', 'X'].map(platform => (
                            <button
                              key={platform}
                              type="button"
                              onClick={() => setCampaignPlatform(platform)}
                              className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                campaignPlatform === platform
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-white/80 border-black/10 hover:bg-white text-on-surface-variant'
                              }`}
                            >
                              {platform}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant font-display uppercase tracking-wider mb-1.5">
                          Emotional Tone
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Inspiring', 'Professional', 'Direct', 'Futuristic'].map(tone => (
                            <button
                              key={tone}
                              type="button"
                              onClick={() => setCampaignTone(tone)}
                              className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                campaignTone === tone
                                  ? 'bg-[#4457b3] text-white border-[#4457b3]'
                                  : 'bg-white/80 border-black/10 hover:bg-white text-on-surface-variant'
                              }`}
                            >
                              {tone}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isGenerating}
                        className="w-full bg-primary-container hover:bg-primary-container/90 text-on-primary-container font-semibold font-display py-2.5 rounded-lg primary-glow flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4 animate-spin-slow" />
                        {isGenerating ? 'Gemini AI reasoning...' : 'Generate Copy & Strategy'}
                      </button>
                    </form>

                    <div className="hidden md:block mt-4 pt-4 border-t border-black/5 text-[11px] text-on-surface-variant/70 leading-relaxed">
                      This sandbox replicates CampaignCraft\'s automated layout analyzer and localized prompt formatting structures.
                    </div>
                  </div>

                  {/* Sandbox Outputs */}
                  <div className="md:col-span-3 flex flex-col bg-white/40 border border-black/5 rounded-xl shadow-inner overflow-hidden p-4 space-y-4">
                    {isGenerating ? (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="text-sm font-semibold text-on-surface animate-pulse">
                          Connecting to simulated Gemini API Pipeline...
                        </span>
                      </div>
                    ) : campaignResult ? (
                      <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                        <div className="border-l-4 border-primary pl-3 py-1 space-y-1 bg-white/60 p-2.5 rounded-r-lg">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wide flex items-center gap-1">
                            <Megaphone className="w-3.5 h-3.5" /> Generated Campaign Headline
                          </span>
                          <h4 className="font-bold text-base text-on-surface font-display leading-tight">
                            {campaignResult.headline}
                          </h4>
                        </div>

                        <div className="border-l-4 border-[#4457b3] pl-3 py-1 space-y-1 bg-white/60 p-2.5 rounded-r-lg">
                          <span className="text-[10px] font-bold text-[#4457b3] uppercase tracking-wide flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" /> Ad Copy Context ({campaignPlatform})
                          </span>
                          <p className="text-sm text-on-surface-variant leading-relaxed">
                            {campaignResult.body}
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1.5">
                            {campaignResult.hashtags.map((h, i) => (
                              <span key={i} className="text-xs text-[#4457b3] font-medium font-mono">
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="border-l-4 border-[#01dfc0] pl-3 py-1 space-y-1 bg-white/60 p-2.5 rounded-r-lg">
                          <span className="text-[10px] font-bold text-[#006b5b] uppercase tracking-wide flex items-center gap-1">
                            <Palette className="w-3.5 h-3.5" /> Generative Imagen Prompt Suggestion
                          </span>
                          <p className="text-xs text-on-surface-variant font-mono leading-normal bg-black/5 p-2 rounded-md">
                            {campaignResult.designPrompt}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-center p-6">
                        <Smartphone className="w-12 h-12 text-[#4457b3] animate-bounce-slow" />
                        <h4 className="font-bold text-on-surface font-display mt-2">Ready to Launch Campaign</h4>
                        <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                          Select your campaign concepts on the control board and hit 'Generate' to see simulated LLM copy output!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-black/90 p-4 rounded-xl font-mono text-[12px] text-green-400 h-full overflow-y-auto space-y-2.5 shadow-inner border border-white/5 select-all">
              <div>
                <span className="text-blue-400">[info]</span> Initializing sandbox environment for ID: {projectId}
              </div>
              <div>
                <span className="text-blue-400">[info]</span> Loading subroutines, pipeline structures, and canvas tracers...
              </div>
              <div>
                <span className="text-green-400">[ok]</span> Stream connection ready on port 3000
              </div>
              <div>
                <span className="text-yellow-400">[warn]</span> HMR is bypassed by workspace constraints (safe)
              </div>
              <div className="pt-2 border-t border-white/10 text-white/70">
                <span className="text-purple-400">--- API Specs used in this module ---</span>
                <br />
                - React 19 Frontend with modern layout flow
                <br />
                - Tailwind CSS custom specular light-refraction tokens
                <br />
                - Client-side mock AI pipeline running sub-1.2s response streaming model simulation
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-white/50 border-t border-black/5 flex justify-between items-center text-xs text-on-surface-variant">
          <span>Sandbox Mode — No credentials are logged or recorded.</span>
          <button onClick={onClose} className="bg-primary text-white font-semibold font-display px-4 py-2 rounded-lg hover:bg-primary/95 transition-colors">
            Got it, close Demo
          </button>
        </div>
      </div>
    </div>
  );
}
