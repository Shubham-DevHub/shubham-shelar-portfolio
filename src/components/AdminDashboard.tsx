import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Shield, LogOut, MessageSquare, Database, FileText, 
  Trash2, Plus, Edit3, Save, CheckCircle2, AlertCircle, ChevronRight, 
  RefreshCw, Award, Send, UserCheck, Briefcase, Sparkles, FolderKanban
} from 'lucide-react';
import { auth, db, OperationType, handleFirestoreError } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, getDocs, getDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Project, Certification } from '../types';
import { projects as initialProjectsList, certifications as initialCertificationsList } from '../data';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectsUpdated: (updatedProjects: Project[]) => void;
  onResumeUpdated: (updatedResume: any) => void;
  currentProjects: Project[];
}

export default function AdminDashboard({ 
  isOpen, 
  onClose, 
  onProjectsUpdated, 
  onResumeUpdated,
  currentProjects 
}: AdminDashboardProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'messages' | 'projects' | 'resume'>('messages');
  
  // States for messages list
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // States for projects
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState<Partial<Project>>({
    title: '',
    description: '',
    image: '',
    githubUrl: '',
    demoUrl: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [projectModifiedMsg, setProjectModifiedMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // States for resume editor
  const [resumeForm, setResumeForm] = useState({
    fullName: 'Shubham Shelar',
    tagline: 'Full Stack Developer | AI Developer',
    email: 'shelarshubham3236@gmail.com',
    phone: '+91 8600703236',
    location: 'Pune, India',
    summary: 'Highly motivated Computer Science Graduate specializing in scalable, robust application engineering.',
    skillsLine: 'Python, SQL, TypeScript, Bash',
    frameworksLine: 'React.js, Django, Django REST Framework, Tailwind CSS',
    cloudLine: 'AWS (EC2, S3, Lambda, VPC, CloudWatch), Git & GitHub',
    dbLine: 'MySQL, SQLite, PostgreSQL',
    aiLine: 'Gemini API SDK, ChatGPT, Claude API, LangChain',
    toolsLine: 'Postman, VS Code, Vitest, PyTest',
    featuredWorkText: 'Dynamic and responsive frontend interfaces built with full-stack capabilities, integrated with robust backend AI models.',
    educationText: 'Pune University, India - Academic training in Data Structures, Databases, and Software Architecture.'
  });
  const [resumeModifiedMsg, setResumeModifiedMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSavingResume, setIsSavingResume] = useState(false);

  const [isBypassMode, setIsBypassMode] = useState(() => localStorage.getItem('admin_bypass_active') === 'true');
  const [showBypassOption, setShowBypassOption] = useState(false);

  const adminEmail = 'shelarshubham3236@gmail.com';
  const isAdminUser = (currentUser?.email === adminEmail) || isBypassMode;

  // Track Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Sync / listen for contact messages if authenticated as admin
  useEffect(() => {
    if (!isAdminUser) return;

    setLoadingMessages(true);
    const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toLocaleString() || new Date().toLocaleString()
      }));
      setMessages(msgs);
      setLoadingMessages(false);
    }, (error) => {
      console.error("Firestore listening error: ", error);
      setLoadingMessages(false);
    });

    return unsubscribe;
  }, [isAdminUser]);

  // Load current resume configs on mount
  useEffect(() => {
    const fetchResumeConfig = async () => {
      try {
        const docRef = doc(db, 'resume_config', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setResumeForm(prev => ({
            ...prev,
            ...data
          }));
          onResumeUpdated(data);
        }
      } catch (err) {
        console.error("Failed to load resume config: ", err);
      }
    };
    if (isOpen) {
      fetchResumeConfig();
    }
  }, [isOpen]);

  // Username/Password login state
  const [usernameInput, setUsernameInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showUsernameField, setShowUsernameField] = useState(false);

  // Auth actions
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setShowBypassOption(false);
    setIsLoggingIn(true);

    const username = usernameInput.trim() || 'admin';
    const password = passwordInput.trim();

    if (!password) {
      setLoginError('Access denied. Please enter Security Token.');
      setIsLoggingIn(false);
      return;
    }

    if (password !== 'admin@107') {
      setLoginError('Access denied. Strict Security Policy limits entry to admin with token admin@107 only.');
      setIsLoggingIn(false);
      return;
    }

    try {
      // Synchronize credential documents in Firestore if available
      const credsDocRef = doc(db, 'admin_credentials', 'main');
      try {
        await setDoc(credsDocRef, {
          username: username,
          password: 'admin@107',
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (writeErr) {
        console.warn("Bootstrap/sync credentials skipped:", writeErr);
      }

      localStorage.setItem('admin_bypass_active', 'true');
      setIsBypassMode(true);
    } catch (err: any) {
      console.warn("Firestore matching fell back to offline local storage bypass mode:", err);
      localStorage.setItem('admin_bypass_active', 'true');
      setIsBypassMode(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('admin_bypass_active');
    setIsBypassMode(false);
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Signing out failed: ", err);
    }
  };

  // Delete message
  const handleDeleteMessage = async (id: string) => {
    const path = `contact_messages/${id}`;
    try {
      await deleteDoc(doc(db, 'contact_messages', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // Project form handlers
  const handleAddTag = () => {
    if (tagInput.trim() && !projectForm.tags?.includes(tagInput.trim())) {
      setProjectForm(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setProjectForm(prev => ({
      ...prev,
      tags: (prev.tags || []).filter((_, i) => i !== indexToRemove)
    }));
  };

  const startEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectForm({
      ...project
    });
    setProjectModifiedMsg(null);
  };

  const clearProjectForm = () => {
    setEditingProject(null);
    setProjectForm({
      title: '',
      description: '',
      image: '',
      githubUrl: '',
      demoUrl: '',
      tags: []
    });
    setTagInput('');
    setProjectModifiedMsg(null);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjectModifiedMsg(null);

    if (!projectForm.title || !projectForm.description || !projectForm.image) {
      setProjectModifiedMsg({ type: 'error', text: 'Required fields: Title, Description, Thumbnail URL' });
      return;
    }

    const projectId = editingProject?.id || 'project-' + Date.now().toString(36);
    const path = `projects/${projectId}`;

    const projectPayload = {
      id: projectId,
      title: projectForm.title.trim(),
      description: projectForm.description.trim(),
      image: projectForm.image.trim(),
      githubUrl: projectForm.githubUrl?.trim() || '',
      demoUrl: projectForm.demoUrl?.trim() || '',
      tags: projectForm.tags || []
    };

    if (isBypassMode) {
      try {
        const storedProjectsStr = localStorage.getItem('portfolio_custom_projects') || '[]';
        let storedProjects: Project[] = JSON.parse(storedProjectsStr);
        storedProjects = storedProjects.filter(p => p.id !== projectId);
        storedProjects.push(projectPayload);
        localStorage.setItem('portfolio_custom_projects', JSON.stringify(storedProjects));

        // Get live Firestore ones to merge if possible
        let customProjects: Project[] = [];
        try {
          const querySnapshot = await getDocs(collection(db, 'projects'));
          customProjects = querySnapshot.docs.map(doc => doc.data() as Project);
        } catch (dbErr) {
          console.log("Could not fetch remote projects in bypass mode:", dbErr);
        }

        const mergedCustom = [...customProjects];
        storedProjects.forEach(lp => {
          if (!mergedCustom.some(cp => cp.id === lp.id)) {
            mergedCustom.push(lp);
          } else {
            // Update item in merged list
            const idx = mergedCustom.findIndex(cp => cp.id === lp.id);
            if (idx !== -1) mergedCustom[idx] = lp;
          }
        });

        onProjectsUpdated([...initialProjectsList, ...mergedCustom]);
        setProjectModifiedMsg({ 
          type: 'success', 
          text: 'Project updated successfully in Local Session! (Changes saved locally)' 
        });

        setTimeout(() => {
          clearProjectForm();
        }, 1500);
      } catch (err) {
        console.error("Local storage project save failed:", err);
        setProjectModifiedMsg({ type: 'error', text: 'Failed to write project to local storage.' });
      }
      return;
    }

    try {
      await setDoc(doc(db, 'projects', projectId), projectPayload);

      // Reload live projects list
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const customProjects = querySnapshot.docs.map(doc => doc.data() as Project);
      onProjectsUpdated([...initialProjectsList, ...customProjects]);

      setProjectModifiedMsg({ 
        type: 'success', 
        text: editingProject ? 'Project updated successfully in Firestore!' : 'New project added successfully to live Firestore!' 
      });
      
      // Reset after brief delay
      setTimeout(() => {
        clearProjectForm();
      }, 1500);

    } catch (error) {
      console.error("Save project error: ", error);
      setProjectModifiedMsg({ 
        type: 'error', 
        text: 'Failed to write project to database. Ensure you are logged in as admin.' 
      });
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    // Check if it's one of the hardcoded initial ones
    if (initialProjectsList.some(p => p.id === projectId)) {
      alert("Initial blueprint portfolio projects cannot be deleted to maintain fallback layouts; however, you can manage any Custom Projects added via the live admin!");
      return;
    }

    if (isBypassMode) {
      try {
        const storedProjectsStr = localStorage.getItem('portfolio_custom_projects') || '[]';
        let storedProjects: Project[] = JSON.parse(storedProjectsStr);
        storedProjects = storedProjects.filter(p => p.id !== projectId);
        localStorage.setItem('portfolio_custom_projects', JSON.stringify(storedProjects));

        let customProjects: Project[] = [];
        try {
          const querySnapshot = await getDocs(collection(db, 'projects'));
          customProjects = querySnapshot.docs.map(doc => doc.data() as Project);
        } catch (dbErr) {
          console.log("Could not fetch remote projects for deletion merging:", dbErr);
        }

        const mergedCustom = [...customProjects];
        storedProjects.forEach(lp => {
          if (!mergedCustom.some(cp => cp.id === lp.id)) {
            mergedCustom.push(lp);
          }
        });

        onProjectsUpdated([...initialProjectsList, ...mergedCustom]);
        alert("Project deleted from Local Session successfully!");
      } catch (err) {
        console.error("Local project delete failed:", err);
      }
      return;
    }

    const path = `projects/${projectId}`;
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      
      // Reload lists
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const customProjects = querySnapshot.docs.map(doc => doc.data() as Project);
      onProjectsUpdated([...initialProjectsList, ...customProjects]);

      alert("Project removed from live Firestore successfully!");
    } catch (error) {
      console.error("Project delete failed: ", error);
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // Resume form handlers
  const handleSaveResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setResumeModifiedMsg(null);
    setIsSavingResume(true);

    const path = 'resume_config/main';
    const payload = {
      ...resumeForm,
      updatedAt: new Date().toISOString()
    };

    if (isBypassMode) {
      try {
        localStorage.setItem('portfolio_resume_config', JSON.stringify(payload));
        onResumeUpdated(payload);
        setResumeModifiedMsg({ type: 'success', text: 'Resume synchronized successfully to Local Session!' });
        setTimeout(() => setResumeModifiedMsg(null), 4000);
      } catch (err) {
        console.error("Local resume save failed:", err);
        setResumeModifiedMsg({ type: 'error', text: 'Failed to save resume locally.' });
      } finally {
        setIsSavingResume(false);
      }
      return;
    }

    try {
      await setDoc(doc(db, 'resume_config', 'main'), payload);
      onResumeUpdated(payload);
      setResumeModifiedMsg({ type: 'success', text: 'Resume config synchronized over Firestore successfully!' });
      setTimeout(() => setResumeModifiedMsg(null), 4000);
    } catch (error) {
      console.error("Save resume error: ", error);
      setResumeModifiedMsg({ type: 'error', text: 'Failed to synchronize resume config.' });
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsSavingResume(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#111c2d]/70 backdrop-blur-md" onClick={onClose} />

      {/* Main Container */}
      <div className="relative w-full max-w-4xl h-[85vh] flex flex-col glass-card border border-white/20 dark:border-white/10 rounded-2xl bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden self-center text-on-surface">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-black/20">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary animate-pulse" />
            <div>
              <h3 className="font-extrabold text-sm tracking-widest font-display text-primary uppercase">COMMAND HUB</h3>
              <p className="text-[10px] font-mono text-on-surface-variant font-medium">Dynamic Portfolio Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(currentUser || isBypassMode) && (
              <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full text-xs">
                <span className={`w-2 h-2 rounded-full ${isAdminUser ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                <span className="font-medium text-[11px] font-mono pr-1">{isBypassMode ? `${usernameInput || 'admin'} (Admin)` : currentUser?.email || 'admin'}</span>
                <button 
                  onClick={handleLogout} 
                  className="text-on-surface-variant hover:text-rose-500 font-bold transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 inline mr-0.5" />
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all text-on-surface-variant hover:text-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Body */}
        {authLoading ? (
          <div className="flex-1 flex flex-col justify-center items-center gap-3">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-mono text-on-surface-variant">Checking credentials...</p>
          </div>
        ) : (!currentUser && !isBypassMode) ? (
          /* Authentication Screen */
          <div className="flex-1 flex flex-col justify-center items-center px-4 md:px-8 text-center bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5">
            <div className="w-full max-w-sm p-6 md:p-8 glass-card border border-black/5 dark:border-white/5 rounded-2xl shadow-xl space-y-6">
              <div className="flex flex-col items-center space-y-2">
                <div className="inline-flex p-3 bg-primary/10 rounded-full">
                  <Lock className="w-6 h-6 text-primary animate-pulse" />
                </div>
                <h4 className="font-display font-black text-sm tracking-widest text-[#111c2d] dark:text-white uppercase">SECURE ADMIN GATEWAY</h4>
                <p className="text-[10px] font-medium text-on-surface-variant leading-relaxed max-w-xs">
                  Supply authorized administrator credentials to synchronize portfolio showcases and review inquiries.
                </p>
              </div>

              <form onSubmit={handlePasswordLogin} className="space-y-4 text-left">
                {loginError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/15 text-rose-500 text-[10px] font-semibold flex items-center gap-1.5 leading-snug rounded-xl animate-shake">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {showBypassOption && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
                    <p className="text-[9px] text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed">
                      💡 <strong>Developer Workaround:</strong> The "Email/Password" sign-in provider is not enabled in your Firebase console. To fix permanently, turn it on in Firebase Consoles. To continue testing immediately, enter bypass mode below:
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsBypassMode(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-display font-black tracking-widest uppercase py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                      Activate Local Bypass Mode
                    </button>
                  </div>
                )}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-extrabold text-slate-400 font-mono tracking-widest uppercase">Admin Username</label>
                    <button
                      type="button"
                      onClick={() => setShowUsernameField(!showUsernameField)}
                      className="text-[9px] text-cyan-400 hover:text-cyan-300 font-bold transition-all cursor-pointer"
                    >
                      {showUsernameField ? 'Hide Change Input' : 'Show Change Input'}
                    </button>
                  </div>

                  {!showUsernameField ? (
                    /* The box showing "admin" already is listed here */
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/[0.45] border border-white/5 rounded-xl text-xs text-slate-300 font-mono">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-cyan-400" />
                        <span>Authorized target:</span>
                        <span className="font-bold text-white px-1.5 py-0.5 bg-white/5 rounded select-none">
                          {usernameInput || 'admin'}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest select-none bg-white/5 px-1.5 py-0.5 rounded">Active</span>
                    </div>
                  ) : (
                    /* The actual text input field that allows anyone to type and change username */
                    <div className="space-y-1 animate-fade-in">
                      <input
                        type="text"
                        required
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="Enter alternate authorized username..."
                        className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-white/20 transition-all font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* Password / Security Token field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 font-mono tracking-widest uppercase">
                    🔒 Security Token (Strictly admin@107 only)
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter Security Token..."
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-white/20 transition-all font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-[#111c2d] hover:bg-black text-white text-xs font-display font-extrabold tracking-widest uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] border border-white/5 hover:border-cyan-500/20"
                  >
                    {isLoggingIn ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00dfc0]" />
                    ) : (
                      <Send className="w-3 h-3 text-[#00dfc0]" />
                    )}
                    {isLoggingIn ? 'AUTHENTICATING...' : 'AUTHORIZE COMMAND DECK'}
                  </button>
                </div>
              </form>

              {/* Secure authorization banner removed as per user preference */}
            </div>
          </div>
        ) : !isAdminUser ? (
          /* Locked Out State */
          <div className="flex-1 flex flex-col justify-center items-center px-8 text-center">
            <div className="max-w-md p-8 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-4">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-display font-black text-lg text-on-surface">Unauthorized Account</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  You successfully authenticated, but the email <span className="font-mono bg-black/5 dark:bg-white/10 px-1 rounded">{currentUser.email}</span> is not registered inside zero-trust schemas as the primary owner.
                </p>
              </div>
              <div className="pt-1.5 flex flex-col gap-2">
                <button
                  onClick={handleLogout}
                  className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Switch Account
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Authorized Admin Control Center */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Command Tabs */}
            <div className="w-full md:w-56 border-r border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.01] p-4 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left font-display text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'messages' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <MessageSquare className="w-4 h-4" />
                Inquiries Inbox
                {messages.length > 0 && (
                  <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold font-mono ${activeTab === 'messages' ? 'bg-white text-primary' : 'bg-primary/10 text-primary'}`}>
                    {messages.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('projects')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left font-display text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'projects' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <FolderKanban className="w-4 h-4" />
                Manage Projects
              </button>

              <button
                onClick={() => setActiveTab('resume')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left font-display text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'resume' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <FileText className="w-4 h-4" />
                Resume Variables
              </button>
            </div>

            {/* Admin Workspaces Container */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              
              {isBypassMode && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 rounded-xl text-[11px] leading-relaxed flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    <strong>Offline Local Session Mode is Active:</strong> You authorized with credentials correctly. Your showcases and resume updates will register instantly in your browser session using cached Storage.
                  </span>
                </div>
              )}
              
              {/* TAB 1: INBOX SUBMISSIONS */}
              {activeTab === 'messages' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-black text-lg text-on-surface">Inquiries Inbox</h4>
                      <p className="text-[11px] text-on-surface-variant">Real-time dynamic submissions from contact forms</p>
                    </div>
                    <span className="font-mono text-[10px] bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-full font-bold">
                      {messages.length} total messages
                    </span>
                  </div>

                  {loadingMessages ? (
                    <div className="flex justify-center py-12">
                      <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-black/10 dark:border-white/10 rounded-2xl">
                      <MessageSquare className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-2" />
                      <p className="text-xs font-bold text-on-surface-variant">Inbox empty</p>
                      <p className="text-[10px] text-on-surface-variant">New emails from the footer form will be securely routed here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {messages.map((msg) => (
                        <div key={msg.id} className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-xl flex flex-col gap-2 relative group hover:border-black/10 dark:hover:border-white/15 transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-bold text-xs text-[#111c2d] dark:text-white flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-primary" /> {msg.fullName}
                              </h5>
                              <p className="text-[10px] text-on-surface-variant font-medium font-mono pt-0.5">{msg.email}</p>
                            </div>
                            <span className="text-[9px] font-mono text-on-surface-variant bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded">
                              {msg.createdAt}
                            </span>
                          </div>
                          <div className="text-xs text-on-surface-variant leading-relaxed bg-white/50 dark:bg-zinc-900/40 p-2.5 rounded border border-black/[0.03] dark:border-white/[0.01]">
                            {msg.message}
                          </div>
                          <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-1 hover:bg-rose-50 rounded-md text-on-surface-variant hover:text-rose-500 transition-colors"
                              title="Delete Submission"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PROJECTS MANAGEMENT */}
              {activeTab === 'projects' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-black text-lg text-on-surface">Portfolio Project Showcases</h4>
                      <p className="text-[11px] text-on-surface-variant">Manage custom projects stored in dynamic Firestore collections</p>
                    </div>
                    {!editingProject && (
                      <button
                        onClick={() => startEditProject({ id: '', title: '', description: '', image: '', tags: [] })}
                        className="bg-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-lg hover:scale-101 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add New Project
                      </button>
                    )}
                  </div>

                  {/* Add / Edit Form Overlay Card */}
                  {projectForm.title !== undefined && (editingProject !== null || projectForm.title !== '') && (
                    <form onSubmit={handleSaveProject} className="p-5 bg-primary/[0.02] border border-primary/20 dark:border-primary/10 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
                        <h5 className="font-display font-black text-xs uppercase text-primary tracking-wider">
                          {editingProject?.id ? 'Edit Live Project' : 'Formulate New Project'}
                        </h5>
                        <button 
                          type="button" 
                          onClick={clearProjectForm}
                          className="text-on-surface-variant hover:text-rose-500 font-mono text-xs"
                        >
                          Cancel
                        </button>
                      </div>

                      {projectModifiedMsg && (
                        <div className={`p-2.5 rounded text-[11px] font-semibold flex items-center gap-1.5 ${projectModifiedMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'}`}>
                          {projectModifiedMsg.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          {projectModifiedMsg.text}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Project Title *</label>
                          <input 
                            type="text" 
                            value={projectForm.title} 
                            onChange={e => setProjectForm(p => ({ ...p, title: e.target.value }))}
                            placeholder="e.g. Hyper-intelligence Pipeline"
                            className="w-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Thumbnail Image URL *</label>
                          <input 
                            type="text" 
                            value={projectForm.image} 
                            onChange={e => setProjectForm(p => ({ ...p, image: e.target.value }))}
                            placeholder="e.g. https://images.unsplash.com/photo-..."
                            className="w-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">GitHub Link</label>
                          <input 
                            type="text" 
                            value={projectForm.githubUrl || ''} 
                            onChange={e => setProjectForm(p => ({ ...p, githubUrl: e.target.value }))}
                            placeholder="e.g. https://github.com/shubhamshelar/repo"
                            className="w-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Live Demo / Showcase URL</label>
                          <input 
                            type="text" 
                            value={projectForm.demoUrl || ''} 
                            onChange={e => setProjectForm(p => ({ ...p, demoUrl: e.target.value }))}
                            placeholder="e.g. https://shubhamshelar.com/demo"
                            className="w-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2"
                          />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Short Copy Description *</label>
                          <textarea 
                            value={projectForm.description} 
                            onChange={e => setProjectForm(p => ({ ...p, description: e.target.value }))}
                            placeholder="Describe what features were built, performance statistics, and technical accomplishments..."
                            rows={3}
                            className="w-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2"
                          />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Technology Tags</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={tagInput} 
                              onChange={e => setTagInput(e.target.value)}
                              placeholder="Add tag (e.g. AWS Lambda)"
                              className="flex-1 bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-1.5"
                              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                            />
                            <button 
                              type="button" 
                              onClick={handleAddTag}
                              className="bg-primary text-white px-4 rounded-lg font-bold"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1 pt-1.5">
                            {(projectForm.tags || []).map((tag, i) => (
                              <span key={i} className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                                {tag}
                                <button type="button" onClick={() => handleRemoveTag(i)}>
                                  <X className="w-2.5 h-2.5 hover:text-rose-500" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          type="button" 
                          onClick={clearProjectForm} 
                          className="bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 px-4 py-2 rounded-lg font-bold text-xs"
                        >
                          Clear Form
                        </button>
                        <button 
                          type="submit" 
                          className="bg-primary hover:bg-primary/95 text-white px-5 py-2 rounded-lg flex items-center gap-1 font-bold text-xs"
                        >
                          <Save className="w-3.5 h-3.5" /> Synchronize Project
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of current projects */}
                  <div className="space-y-3">
                    <h5 className="font-display font-black text-xs text-on-surface uppercase tracking-wider">Dynamic Project Grid</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {currentProjects.map((p) => {
                        const isHardcoded = initialProjectsList.some(item => item.id === p.id);
                        return (
                          <div key={p.id} className="p-3 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-xl flex items-start gap-3 hover:border-black/10 dark:hover:border-white/10 transition-colors">
                            <img src={p.image} className="w-16 h-16 rounded-lg object-cover bg-black/5 shrink-0" referrerPolicy="no-referrer" alt="" />
                            <div className="flex-1 min-w-0 flex flex-col justify-between h-16">
                              <div>
                                <h6 className="font-bold text-xs text-on-surface flex items-center gap-1.5 truncate">
                                  {p.title}
                                  {isHardcoded ? (
                                    <span className="text-[8px] tracking-wide font-mono px-1.5 rounded bg-zinc-400/10 text-zinc-500 font-bold">Fallback</span>
                                  ) : (
                                    <span className="text-[8px] tracking-wide font-mono px-1.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">Firestore</span>
                                  )}
                                </h6>
                                <p className="text-[10px] text-on-surface-variant truncate pr-2 pt-0.5">{p.description}</p>
                              </div>
                              <div className="flex items-center gap-1.5 pt-1">
                                <button
                                  onClick={() => startEditProject(p)}
                                  className="text-[10px] font-bold text-primary flex items-center gap-0.5"
                                >
                                  <Edit3 className="w-2.5 h-2.5" /> Edit
                                </button>
                                {!isHardcoded && (
                                  <button
                                    onClick={() => handleDeleteProject(p.id)}
                                    className="text-[10px] font-bold text-on-surface-variant hover:text-rose-500 flex items-center gap-0.5 ml-1.5"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" /> Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RESUME EDIT VARS */}
              {activeTab === 'resume' && (
                <form onSubmit={handleSaveResume} className="space-y-6">
                  <div>
                    <h4 className="font-display font-black text-lg text-on-surface">Dynamic Resume Variables</h4>
                    <p className="text-[11px] text-on-surface-variant">Update resume summaries, contacts, and textblocks rendered inside interactive PDFs and modals</p>
                  </div>

                  {resumeModifiedMsg && (
                    <div className="p-3 rounded text-[11px] font-semibold flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {resumeModifiedMsg.text}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        value={resumeForm.fullName} 
                        onChange={e => setResumeForm(r => ({ ...r, fullName: e.target.value }))}
                        className="w-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Tagline</label>
                      <input 
                        type="text" 
                        value={resumeForm.tagline} 
                        onChange={e => setResumeForm(r => ({ ...r, tagline: e.target.value }))}
                        className="w-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Email Contact</label>
                      <input 
                        type="text" 
                        value={resumeForm.email} 
                        onChange={e => setResumeForm(r => ({ ...r, email: e.target.value }))}
                        className="w-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Phone contact</label>
                      <input 
                        type="text" 
                        value={resumeForm.phone} 
                        onChange={e => setResumeForm(r => ({ ...r, phone: e.target.value }))}
                        className="w-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Location</label>
                      <input 
                        type="text" 
                        value={resumeForm.location} 
                        onChange={e => setResumeForm(r => ({ ...r, location: e.target.value }))}
                        className="w-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Executive Summary Text</label>
                      <textarea 
                        value={resumeForm.summary} 
                        onChange={e => setResumeForm(r => ({ ...r, summary: e.target.value }))}
                        rows={3}
                        className="w-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="border-t border-black/5 dark:border-white/5 md:col-span-2 pt-3 my-1">
                      <h5 className="font-display font-black text-xs text-primary uppercase tracking-wider">Skills Grid Lines (Comma Separated)</h5>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Languages & Core</label>
                      <input 
                        type="text" 
                        value={resumeForm.skillsLine} 
                        onChange={e => setResumeForm(r => ({ ...r, skillsLine: e.target.value }))}
                        className="w-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Web & Frameworks</label>
                      <input 
                        type="text" 
                        value={resumeForm.frameworksLine} 
                        onChange={e => setResumeForm(r => ({ ...r, frameworksLine: e.target.value }))}
                        className="w-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Cloud & Pipelines</label>
                      <input 
                        type="text" 
                        value={resumeForm.cloudLine} 
                        onChange={e => setResumeForm(r => ({ ...r, cloudLine: e.target.value }))}
                        className="w-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Databases</label>
                      <input 
                        type="text" 
                        value={resumeForm.dbLine} 
                        onChange={e => setResumeForm(r => ({ ...r, dbLine: e.target.value }))}
                        className="w-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">AI Integration</label>
                      <input 
                        type="text" 
                        value={resumeForm.aiLine} 
                        onChange={e => setResumeForm(r => ({ ...r, aiLine: e.target.value }))}
                        className="w-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Tools & Testing</label>
                      <input 
                        type="text" 
                        value={resumeForm.toolsLine} 
                        onChange={e => setResumeForm(r => ({ ...r, toolsLine: e.target.value }))}
                        className="w-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="border-t border-black/5 dark:border-white/5 md:col-span-2 pt-3 my-1">
                      <h5 className="font-display font-black text-xs text-primary uppercase tracking-wider">Featured Work & Academics Copy</h5>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Work Highlight Summary text</label>
                      <input 
                        type="text" 
                        value={resumeForm.featuredWorkText} 
                        onChange={e => setResumeForm(r => ({ ...r, featuredWorkText: e.target.value }))}
                        className="w-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="font-bold text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Education Details text</label>
                      <input 
                        type="text" 
                        value={resumeForm.educationText} 
                        onChange={e => setResumeForm(r => ({ ...r, educationText: e.target.value }))}
                        className="w-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit" 
                      disabled={isSavingResume}
                      className="bg-primary hover:bg-primary/95 text-white font-display font-bold text-xs py-2.5 px-6 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                      {isSavingResume ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Sync Resume Over Firestore
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
