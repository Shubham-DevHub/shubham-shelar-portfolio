export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  demoUrl?: string; // or simulated demo
  githubUrl?: string;
  tags: string[];
}

export interface SkillCategory {
  title: string;
  icon: string; // we will map these to Lucide icons
  skills: string[];
}

export interface Certification {
  title: string;
  subtitle: string;
  icon: string;
  issuer?: string;
  date?: string;
  verifyUrl?: string;
  code?: string;
  isMajor?: boolean;
}

export interface ContactFormData {
  fullName: string;
  email: string;
  message: string;
}
