import { Project, SkillCategory, Certification } from './types';

export const projects: Project[] = [
  {
    id: 'aether-ai-chat',
    title: 'Aether AI Chat',
    description: 'Advanced AI chatbot platform featuring real-time stream processing and multiple LLM model support.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtR4NH1Sqt94vnFCdeW9pxuWQRNg8mq_TwzNZ0RmNO1Vvm_s09TDnGvBjY1NxrDTlZs8zSu-fQeGw47gSBnCN0CeK8rp4-EsAAWMYaEDpR1K8M9nPxiuLSwDKtNGtUmU9HWCEngHI-jPX3TQ9BkK8gQd3yfWf3vSDHxsyJKJvXOc4V2nUDw3li-43oqC6vF6tBsBrlfWqpiGZ_jVRlPKX1YNycZv5yB7Mtu8BoknQd0Y6IaRPIAsBnz2sWyk7c-cNatrIBDJ5UmLiP',
    tags: ['React.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'WebSockets', 'LLM Integration'],
    githubUrl: 'https://github.com/shubhamshelar/aether-ai-chat',
  },
  {
    id: 'campaigncraft-ai',
    title: 'CampaignCraft AI',
    description: 'Automated marketing platform using Gemini API to generate copy, visuals, and strategic insights.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1xRyVkgsFk_3z0r-knncUJ4kY66tKRI9_MDUYtAchukyUHg3w7dZ68wEFMJmYtgleNkDrrISwqJA7poaSn_kV0LwiEA592BqsKB7uVOjc0RYwOcjZmgIxJDyCScHiUjHZSw5GeIxeqehhciGtPcySz50OA8jVq03f_JqLC-r0JaDM3Ab-KGHfqvFoe8YmOn4zRK0Y4u6NrKxpii3rmgC2w2Owzqau8gDyl1yk-x1vu-IT8xuGZX0MnPljej67jYJ2aFOtFfDDe4vB',
    tags: ['React.js', 'Gemini API', 'Django REST Framework', 'Tailwind CSS', 'AWS S3', 'AI Content Generation'],
    githubUrl: 'https://github.com/shubhamshelar/campaigncraft-ai',
  }
];

export const skillCategories: SkillCategory[] = [
  {
    title: 'Programming',
    icon: 'Monitor',
    skills: ['Python', 'SQL']
  },
  {
    title: 'Web Dev',
    icon: 'Code',
    skills: ['React.js', 'Django', 'DRF', 'Tailwind CSS']
  },
  {
    title: 'Cloud (AWS)',
    icon: 'Cloud',
    skills: ['EC2', 'S3', 'Lambda', 'VPC']
  },
  {
    title: 'Databases',
    icon: 'Database',
    skills: ['MySQL', 'SQLite']
  },
  {
    title: 'Tools',
    icon: 'Wrench',
    skills: ['Git & GitHub', 'Postman', 'VS Code']
  },
  {
    title: 'AI Mastery',
    icon: 'Zap',
    skills: ['ChatGPT', 'Gemini API', 'Claude', 'Copilot']
  }
];

export const certifications: Certification[] = [
  {
    title: 'Full Stack Python',
    subtitle: 'Comprehensive Developer Track',
    icon: 'CheckCircle2',
    issuer: 'Developer Career Track',
    date: '2025',
    isMajor: true
  },
  {
    title: 'AWS Cloud',
    subtitle: 'Infrastructure & Deployment',
    icon: 'CloudDownload',
    issuer: 'AWS Academy Partner',
    date: '2025',
    isMajor: true
  },
  {
    title: 'Building Generative AI powered apps with Python',
    subtitle: 'Applied AI & Python LLM Pipelines',
    icon: 'Sparkles',
    issuer: 'Great Learning',
    date: 'July 15, 2025',
    verifyUrl: 'https://www.mygreatlearning.com/certificate/TXRVDKAJ',
    code: 'TXRVDKAJ',
    isMajor: true
  },
  {
    title: 'Build Python app using ChatGPT',
    subtitle: 'AI-assisted Rapid Prototyping & App Dev',
    icon: 'Code',
    issuer: 'Great Learning',
    date: 'July 15, 2025',
    verifyUrl: 'https://www.mygreatlearning.com/certificate/ZIWLJYEJ',
    code: 'ZIWLJYEJ',
    isMajor: true
  },
  {
    title: 'Google Gemini for Coders',
    subtitle: 'Advanced Gemini API & Code Orchestration',
    icon: 'Brain',
    issuer: 'Great Learning',
    date: 'July 15, 2025',
    verifyUrl: 'https://www.mygreatlearning.com/certificate/HYLZEAYI',
    code: 'HYLZEAYI',
    isMajor: true
  },
  {
    title: 'Generative AI for Beginners',
    subtitle: 'Core Foundation & LLM Architecture',
    icon: 'Award',
    issuer: 'Simplilearn',
    date: 'May 21, 2025',
    code: '8371950',
    isMajor: true
  },
  {
    title: 'DeepSeek Foundations for Beginners',
    subtitle: 'DeepSeek R1/V3 APIs & MoE Foundations',
    icon: 'Cpu',
    issuer: 'Great Learning',
    date: 'July 14, 2025',
    verifyUrl: 'https://www.mygreatlearning.com/certificate/IXGFWQSE',
    code: 'IXGFWQSE',
    isMajor: true
  },
  {
    title: 'Getting Started with Gemini',
    subtitle: 'Prompting & Multi-modal Integration',
    icon: 'Zap',
    issuer: 'Great Learning',
    date: 'July 14, 2025',
    verifyUrl: 'https://www.mygreatlearning.com/certificate/LAGCIURK',
    code: 'LAGCIURK',
    isMajor: true
  },
  {
    title: 'Prompt Engineering for ChatGPT',
    subtitle: 'Structured Context & Chain-of-Thought prompting',
    icon: 'Wrench',
    issuer: 'Great Learning',
    date: 'July 13, 2025',
    verifyUrl: 'https://www.mygreatlearning.com/certificate/KUUMXSZQ',
    code: 'KUUMXSZQ',
    isMajor: false
  },
  {
    title: 'Generative AI for Beginners',
    subtitle: 'GenAI Tools & Cloud Models',
    icon: 'Sparkles',
    issuer: 'Great Learning',
    date: 'July 14, 2025',
    verifyUrl: 'https://www.mygreatlearning.com/certificate/ADTAZLCL',
    code: 'ADTAZLCL',
    isMajor: false
  },
  {
    title: 'Manus AI: Automate Tasks with Ease',
    subtitle: 'Smart Agents & Workflow Automation',
    icon: 'Monitor',
    issuer: 'Great Learning',
    date: 'July 14, 2025',
    verifyUrl: 'https://www.mygreatlearning.com/certificate/WONYXRNT',
    code: 'WONYXRNT',
    isMajor: false
  },
  {
    title: 'ChatGPT for Coders',
    subtitle: 'Automated Refactoring & Syntax Auditing',
    icon: 'Terminal',
    issuer: 'Great Learning',
    date: 'July 14, 2025',
    verifyUrl: 'https://www.mygreatlearning.com/certificate/VDEZDHSW',
    code: 'VDEZDHSW',
    isMajor: false
  },
  {
    title: 'ChatGPT for Beginners',
    subtitle: 'Conversational Interfaces & Basic Prompting',
    icon: 'Sparkles',
    issuer: 'Great Learning',
    date: 'July 13, 2025',
    verifyUrl: 'https://www.mygreatlearning.com/certificate/BDYBPZUC',
    code: 'BDYBPZUC',
    isMajor: false
  },
  {
    title: 'ChatGPT for Excel',
    subtitle: 'Data Modeling & Automated Formula Pipelines',
    icon: 'Database',
    issuer: 'Great Learning',
    date: 'July 14, 2025',
    verifyUrl: 'https://www.mygreatlearning.com/certificate/PLLSVQVB',
    code: 'PLLSVQVB',
    isMajor: false
  },
  {
    title: 'ChatGPT for SEO and Content',
    subtitle: 'Keyword Targeting & Organic Output Pipelines',
    icon: 'Search',
    issuer: 'Great Learning',
    date: 'July 15, 2025',
    verifyUrl: 'https://www.mygreatlearning.com/certificate/CIRGMORU',
    code: 'CIRGMORU',
    isMajor: false
  },
  {
    title: 'ChatGPT for Digital Marketing',
    subtitle: 'Social Strategy & Targeted Placement Coples',
    icon: 'Megaphone',
    issuer: 'Great Learning',
    date: 'July 15, 2025',
    verifyUrl: 'https://www.mygreatlearning.com/certificate/YELZPMYV',
    code: 'YELZPMYV',
    isMajor: false
  },
  {
    title: 'ChatGPT for Marketing',
    subtitle: 'Campaign Design & Auditory Analytics',
    icon: 'Activity',
    issuer: 'Great Learning',
    date: 'July 14, 2025',
    verifyUrl: 'https://www.mygreatlearning.com/certificate/VEXVMMSS',
    code: 'VEXVMMSS',
    isMajor: false
  },
  {
    title: 'ChatGPT for HR',
    subtitle: 'ATS optimizations & Interview pipelines formulation',
    icon: 'Users',
    issuer: 'Great Learning',
    date: 'July 13, 2025',
    verifyUrl: 'https://www.mygreatlearning.com/certificate/PRYJPIDB',
    code: 'PRYJPIDB',
    isMajor: false
  }
];
