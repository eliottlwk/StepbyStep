import React, { useState, useEffect } from 'react';
import {
  Check, Plus, ChevronLeft, ChevronRight, Bell, BellOff,
  Trash2, LayoutDashboard, ListChecks, TrendingUp, X, Clock,
  Search, Settings, FolderOpen, Edit2, Folder, Circle, Save
} from 'lucide-react';
import Onboarding from './Onboarding';

const generateId = () => Math.random().toString(36).substr(2, 9);
const STORAGE_TASKS = 'sbs_tasks_v4';
const STORAGE_PROJECTS = 'sbs_projects_v1';

const loadData = (key, fallback) => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; } };
const saveData = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

const DEFAULT_PROJECTS = [
  { id: 'p1', name: 'Personnel',    color: '#059669' },
  { id: 'p2', name: 'École',        color: '#8B5CF6' },
  { id: 'p3', name: 'Elevia Agency',color: '#2563EB' },
];

const EM = '#059669'; const EM_LIGHT = '#D1FAE5'; const EM_DARK = '#065F46'; const EM_MID = '#6EE7B7';
const AMBER = '#F59E0B';
const PRIORITY = {
  high:   { label: 'Urgent', bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
  medium: { label: 'Moyen',  bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
  low:    { label: 'Faible', bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
};
const PROJECT_COLORS = ['#059669','#2563EB','#8B5CF6','#F59E0B','#EF4444','#EC4899','#0891B2','#64748B'];

const formatDue = (iso) => {
  if (!iso) return null;
  const d = new Date(iso), now = new Date();
  const diff = Math.floor((d - now) / 86400000);
  if (diff < 0) return { label: 'En retard', alert: true };
  if (diff === 0) return { label: 'Auj. ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), alert: true };
  if (diff === 1) return { label: 'Demain', alert: false };
  return { label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), alert: false };
};

const scheduleNotif = (task) => {
  if (!task.reminder || !task.dueDate) return;
  const delay = new Date(task.dueDate).getTime() - 30 * 60 * 1000 - Date.now();
  if (delay <= 0) return;
  setTimeout(() => { if (Notification.permission === 'granted') new Notification('Step by Step', { body: `Rappel : ${task.title}` }); }, delay);
};

export default function StepByStepApp() {
  const [tasks, setTasks]       = useState(() => loadData(STORAGE_TASKS, []));
  const [projects, setProjects] = useState(() => loadData(STORAGE_PROJECTS, DEFAULT_PROJECTS));
  const [view, setView]         = useState('dashboard');
  const [selectedId, setSelectedId]   = useState(null);
  const [filterProject, setFilterProject] = useState('tous');
  const [search, setSearch]     = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('sbs_onboarded')
  );

  // Modals
  const [showNew, setShowNew]               = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [editingTask, setEditingTask]       = useState(null);
  const [editProjectId, setEditProjectId]   = useState(null);

  // Forms
  const emptyForm = { title: '', priority: 'medium', dueDate: '', reminder: false, projectId: projects[0]?.id || '' };
  const [form, setForm]               = useState(emptyForm);
  const [projectForm, setProjectForm] = useState({ name: '', color: '#059669' });

  useEffect(() => { saveData(STORAGE_TASKS, tasks); }, [tasks]);
  useEffect(() => { saveData(STORAGE_PROJECTS, projects); }, [projects]);

  const upd = (fn) => setTasks(p => { const n = fn(p); saveData(STORAGE_TASKS, n); return n; });

  const openNew = () => { setForm({ ...emptyForm, projectId: projects[0]?.id || '' }); setShowNew(true); };

  const createTask = () => {
    if (!form.title.trim()) return;
    const t = { id: generateId(), title: form.title.trim(), priority: form.priority, dueDate: form.dueDate || null, reminder: form.reminder, projectId: form.projectId, subtasks: [], createdAt: new Date().toISOString() };
    if (t.reminder && t.dueDate) scheduleNotif(t);
    upd(p => [t, ...p]);
    setShowNew(false);
    setSelectedId(t.id); setView('detail');
  };

  const saveEdit = () => {
    if (!editingTask || !editingTask.title.trim()) return;
    upd(p => p.map(t => t.id === editingTask.id ? { ...t, title: editingTask.title, priority: editingTask.priority, dueDate: editingTask.dueDate, projectId: editingTask.projectId, reminder: editingTask.reminder } : t));
    setEditingTask(null);
  };

  const delTask = (id) => { upd(p => p.filter(t => t.id !== id)); setView('tasks'); };
  const getPct  = (t) => !t.subtasks.length ? 0 : Math.round(t.subtasks.filter(s => s.done).length / t.subtasks.length * 100);

  const addSub    = (tid) => { if (!newSubtask.trim()) return; upd(p => p.map(t => t.id === tid ? { ...t, subtasks: [...t.subtasks, { id: generateId(), title: newSubtask.trim(), done: false }] } : t)); setNewSubtask(''); };
  const toggleSub = (tid, sid) => upd(p => p.map(t => t.id === tid ? { ...t, subtasks: t.subtasks.map(s => s.id === sid ? { ...s, done: !s.done } : s) } : t));
  const delSub    = (tid, sid) => upd(p => p.map(t => t.id === tid ? { ...t, subtasks: t.subtasks.filter(s => s.id !== sid) } : t));

  const toggleReminder = async (tid) => {
    if (Notification.permission !== 'granted') await Notification.requestPermission();
    upd(p => p.map(t => { if (t.id !== tid) return t; const n = { ...t, reminder: !t.reminder }; if (n.reminder && n.dueDate) scheduleNotif(n); return n; }));
  };

  const createProject = () => {
    if (!projectForm.name.trim()) return;
    const p = { id: generateId(), name: projectForm.name.trim(), color: projectForm.color };
    setProjects(prev => [...prev, p]);
    setProjectForm({ name: '', color: '#059669' });
    setShowNewProject(false);
  };

  const deleteProject = (pid) => {
    setProjects(prev => prev.filter(p => p.id !== pid));
    upd(prev => prev.map(t => t.projectId === pid ? { ...t, projectId: '' } : t));
    if (filterProject === pid) setFilterProject('tous');
    setEditProjectId(null);
  };

  const getProject = (pid) => projects.find(p => p.id === pid);

  const filtered = tasks.filter(t => {
    const ms = t.title.toLowerCase().includes(search.toLowerCase());
    const mp = filterProject === 'tous' || t.projectId === filterProject;
    return ms && mp;
  });
  const pending   = tasks.filter(t => getPct(t) < 100);
  const done      = tasks.filter(t => getPct(t) === 100);
  const reminders = tasks.filter(t => t.reminder && t.dueDate && getPct(t) < 100);
  const selected  = tasks.find(t => t.id === selectedId);
  const today     = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .sbs { background: #F8FAF9; min-height: 100vh; color: #111827; font-family: 'Inter', -apple-system, sans-serif; font-size: 14px; }
    .sbs-header { background: #fff; border-bottom: 0.5px solid #E5E7EB; padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 40; }
    .sbs-logo { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 600; color: ${EM_DARK}; }
    .sbs-logo-icon { width: 28px; height: 28px; border-radius: 8px; background: ${EM}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .sbs-icon-btn { width: 34px; height: 34px; border-radius: 8px; border: 0.5px solid #E5E7EB; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6B7280; }
    .sbs-icon-btn:hover { background: ${EM_LIGHT}; color: ${EM_DARK}; border-color: ${EM_MID}; }
    .sbs-body { display: grid; grid-template-columns: 224px 1fr; min-height: calc(100vh - 56px); }
    .sbs-sidebar { background: #fff; border-right: 0.5px solid #E5E7EB; padding: 16px 10px; display: flex; flex-direction: column; gap: 2px; }
    .sbs-sl { font-size: 10px; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.08em; padding: 0 10px; margin: 14px 0 5px; }
    .sbs-nav { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 8px; cursor: pointer; font-size: 13.5px; color: #6B7280; border: none; background: none; width: 100%; text-align: left; font-family: inherit; }
    .sbs-nav:hover { background: #F9FAFB; color: #111827; }
    .sbs-nav.active { background: ${EM_LIGHT}; color: ${EM_DARK}; font-weight: 500; }
    .sbs-badge { margin-left: auto; border-radius: 20px; font-size: 10px; padding: 1px 6px; font-weight: 600; background: ${EM}; color: #fff; }
    .sbs-badge.amber { background: ${AMBER}; }
    .sbs-proj-row { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #6B7280; }
    .sbs-proj-row:hover { background: #F9FAFB; }
    .sbs-proj-row.active { background: ${EM_LIGHT}; color: ${EM_DARK}; }
    .sbs-proj-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .sbs-proj-edit { margin-left: auto; opacity: 0; background: none; border: none; cursor: pointer; color: #9CA3AF; padding: 2px; display: flex; }
    .sbs-proj-row:hover .sbs-proj-edit { opacity: 1; }
    .sbs-content { padding: 24px; }
    .sbs-ch { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
    .sbs-pt { font-size: 20px; font-weight: 600; color: #111827; }
    .sbs-ps { font-size: 13px; color: #9CA3AF; margin-top: 3px; }
    .btn-p { background: ${EM}; color: #fff; border: none; border-radius: 8px; padding: 9px 15px; font-size: 13.5px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: inherit; }
    .btn-p:hover { background: ${EM_DARK}; }
    .btn-p:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-s { background: #fff; color: #374151; border: 0.5px solid #D1D5DB; border-radius: 8px; padding: 7px 13px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: inherit; }
    .btn-s:hover { border-color: #9CA3AF; }
    .btn-danger { background: #fff; color: #EF4444; border: 0.5px solid #FECACA; border-radius: 7px; padding: 5px 9px; cursor: pointer; display: flex; align-items: center; font-family: inherit; }
    .sbs-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 20px; }
    .sbs-stat { background: #fff; border: 0.5px solid #E5E7EB; border-radius: 10px; padding: 14px 16px; }
    .sbs-sv { font-size: 24px; font-weight: 600; color: #111827; }
    .sbs-sv.g { color: ${EM}; }
    .sbs-sl2 { font-size: 12px; color: #6B7280; margin-top: 2px; }
    .sbs-ssub { font-size: 11px; color: #9CA3AF; margin-top: 1px; }
    .sbs-banner { background: ${EM_LIGHT}; border: 0.5px solid ${EM_MID}; border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; margin-bottom: 18px; font-size: 13px; color: ${EM_DARK}; }
    .sec-label { font-size: 10.5px; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 8px; }
    .task-list { display: flex; flex-direction: column; gap: 7px; margin-bottom: 18px; }
    .task-card { background: #fff; border: 0.5px solid #E5E7EB; border-radius: 11px; padding: 13px 16px; cursor: pointer; transition: border-color 0.15s; }
    .task-card:hover { border-color: ${EM_MID}; }
    .task-card.done { opacity: 0.55; }
    .task-top { display: flex; align-items: center; gap: 10px; }
    .task-ck { width: 19px; height: 19px; min-width: 19px; border-radius: 50%; border: 1.5px solid #D1D5DB; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .task-ck.done { background: ${EM}; border-color: ${EM}; }
    .task-title { flex: 1; font-size: 14px; font-weight: 500; color: #111827; }
    .task-card.done .task-title { text-decoration: line-through; color: #9CA3AF; }
    .task-meta { display: flex; gap: 7px; align-items: center; flex-wrap: wrap; margin-top: 8px; padding-left: 29px; }
    .sbs-tag { font-size: 10.5px; font-weight: 500; padding: 2px 8px; border-radius: 20px; }
    .sbs-date { font-size: 11.5px; color: #9CA3AF; display: flex; align-items: center; gap: 3px; }
    .sbs-date.alert { color: #B45309; }
    .notif-pill { font-size: 11px; background: ${EM_LIGHT}; color: ${EM_DARK}; padding: 2px 7px; border-radius: 20px; display: flex; align-items: center; gap: 3px; }
    .prog { height: 3px; background: #F3F4F6; border-radius: 2px; margin-top: 10px; margin-left: 29px; overflow: hidden; }
    .prog-fill { height: 100%; background: ${EM}; border-radius: 2px; transition: width 0.3s; }
    .add-btn { border: 1.5px dashed #E5E7EB; border-radius: 10px; padding: 11px 16px; display: flex; align-items: center; gap: 9px; cursor: pointer; color: #9CA3AF; font-size: 13.5px; font-family: inherit; background: none; width: 100%; margin-top: 4px; }
    .add-btn:hover { border-color: ${EM_MID}; color: ${EM}; background: ${EM_LIGHT}; }
    .sub-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 0.5px solid #F9FAFB; }
    .cb { width: 20px; height: 20px; min-width: 20px; border-radius: 6px; border: 1.5px solid #D1D5DB; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
    .cb.done { background: ${EM}; border-color: ${EM}; }
    .sub-t { flex: 1; font-size: 13.5px; color: #374151; }
    .sub-t.done { text-decoration: line-through; color: #9CA3AF; }
    .del-btn { background: none; border: none; cursor: pointer; color: #D1D5DB; padding: 2px; display: flex; }
    .del-btn:hover { color: #EF4444; }
    .sbs-search-w { position: relative; margin-bottom: 14px; }
    .sbs-search { width: 100%; padding: 8px 12px 8px 36px; border: 0.5px solid #E5E7EB; border-radius: 8px; font-size: 13.5px; outline: none; font-family: inherit; background: #fff; }
    .sbs-search:focus { border-color: ${EM_MID}; }
    .si { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #9CA3AF; pointer-events: none; }
    .filters { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
    .filter-btn { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-family: inherit; cursor: pointer; border: 0.5px solid #E5E7EB; background: #fff; color: #6B7280; }
    .filter-btn.active { background: ${EM_LIGHT}; color: ${EM_DARK}; border-color: ${EM_MID}; font-weight: 500; }
    .sbs-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.38); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
    .sbs-modal { background: #fff; border-radius: 14px; padding: 24px; width: 100%; max-width: 450px; }
    .modal-sm { max-width: 360px; }
    .field-label { font-size: 11px; font-weight: 500; color: #6B7280; text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: 5px; }
    .sbs-input { width: 100%; padding: 8px 11px; border: 0.5px solid #D1D5DB; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; }
    .sbs-input:focus { border-color: ${EM}; }
    .sbs-select { width: 100%; padding: 8px 11px; border: 0.5px solid #D1D5DB; border-radius: 8px; font-size: 13.5px; font-family: inherit; background: #fff; outline: none; }
    .toggle-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #F9FAFB; border-radius: 8px; cursor: pointer; }
    .toggle { width: 36px; height: 20px; border-radius: 10px; position: relative; flex-shrink: 0; }
    .toggle-th { width: 16px; height: 16px; border-radius: 50%; background: #fff; position: absolute; top: 2px; }
    .color-picker { display: flex; gap: 8px; flex-wrap: wrap; }
    .color-dot { width: 26px; height: 26px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; border: 2px solid transparent; }
    .color-dot.selected { border-color: #111827; }
    .reminder-btn { display: flex; align-items: center; gap: 6px; font-size: 12.5px; padding: 5px 10px; border-radius: 7px; border: 0.5px solid #E5E7EB; cursor: pointer; background: #fff; font-family: inherit; color: #6B7280; }
    .reminder-btn.on { background: ${EM_LIGHT}; color: ${EM_DARK}; border-color: ${EM_MID}; }
    .empty { background: #fff; border: 0.5px solid #E5E7EB; border-radius: 11px; padding: 40px 20px; text-align: center; color: #9CA3AF; }
    .empty a { color: ${EM}; cursor: pointer; font-weight: 500; }
  `;

  return (
    <div className="sbs">
      <style>{css}</style>

      {/* ONBOARDING */}
      {showOnboarding && (
        <Onboarding
          onComplete={() => {
            localStorage.setItem('sbs_onboarded', '1');
            setShowOnboarding(false);
          }}
          onCreateProject={(proj) => {
            const p = { id: generateId(), ...proj };
            setProjects(prev => [...prev, p]);
          }}
        />
      )}

      {/* HEADER */}
      <header className="sbs-header">
        <div className="sbs-logo">
          <div className="sbs-logo-icon"><Check size={16} color="#fff" strokeWidth={2.5} /></div>
          Step by Step
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button className="sbs-icon-btn"><Search size={16} /></button>
          <button className="sbs-icon-btn"><Bell size={16} /></button>
          <button className="sbs-icon-btn" title="Revoir l'intro" onClick={() => { localStorage.removeItem('sbs_onboarded'); setShowOnboarding(true); }}><Settings size={16} /></button>
        </div>
      </header>

      <div className="sbs-body">
        {/* SIDEBAR */}
        <nav className="sbs-sidebar">
          <div className="sbs-sl" style={{ marginTop: 0 }}>Navigation</div>
          <button className={`sbs-nav ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            <LayoutDashboard size={16} /> Aujourd'hui
            {pending.length > 0 && <span className="sbs-badge">{pending.length}</span>}
          </button>
          <button className={`sbs-nav ${view === 'tasks' || view === 'detail' ? 'active' : ''}`} onClick={() => setView('tasks')}>
            <ListChecks size={16} /> Toutes les tâches
          </button>
          <button className={`sbs-nav ${view === 'progress' ? 'active' : ''}`} onClick={() => setView('progress')}>
            <TrendingUp size={16} /> Progression
          </button>
          {reminders.length > 0 && (
            <button className="sbs-nav" onClick={() => setView('tasks')}>
              <Bell size={16} /> Rappels <span className="sbs-badge amber">{reminders.length}</span>
            </button>
          )}

          <div className="sbs-sl">Projets</div>
          <div className={`sbs-proj-row ${filterProject === 'tous' ? 'active' : ''}`} onClick={() => { setFilterProject('tous'); setView('tasks'); }}>
            <Folder size={14} /> Tous les projets
          </div>
          {projects.map(p => (
            <div key={p.id} className={`sbs-proj-row ${filterProject === p.id ? 'active' : ''}`}
              onClick={() => { setFilterProject(p.id); setView('tasks'); }}>
              <div className="sbs-proj-dot" style={{ background: p.color }} />
              <span style={{ flex: 1 }}>{p.name}</span>
              <button className="sbs-proj-edit" onClick={e => { e.stopPropagation(); setEditProjectId(p.id); }}><Edit2 size={12} /></button>
            </div>
          ))}
          <button className="sbs-nav" style={{ color: EM, marginTop: 2 }} onClick={() => setShowNewProject(true)}>
            <Plus size={15} /> Nouveau projet
          </button>

          <div style={{ marginTop: 'auto' }}>
            <button className="sbs-nav" onClick={openNew}><Plus size={16} /> Nouvelle tâche</button>
          </div>
        </nav>

        {/* CONTENT */}
        <main className="sbs-content">

          {/* DASHBOARD */}
          {view === 'dashboard' && <>
            <div className="sbs-ch">
              <div>
                <div className="sbs-pt">Aujourd'hui</div>
                <div className="sbs-ps" style={{ textTransform: 'capitalize' }}>{today} · {pending.length} tâche{pending.length !== 1 ? 's' : ''} restante{pending.length !== 1 ? 's' : ''}</div>
              </div>
              <button className="btn-p" onClick={openNew}><Plus size={15} /> Nouvelle tâche</button>
            </div>
            {reminders.length > 0 && (
              <div className="sbs-banner"><Bell size={16} color={EM} /><span><strong style={{ fontWeight: 600 }}>{reminders.length} rappel{reminders.length > 1 ? 's' : ''} actif{reminders.length > 1 ? 's' : ''}</strong> — {reminders[0].title}</span></div>
            )}
            <div className="sbs-stats">
              <div className="sbs-stat"><div className="sbs-sv g">{done.length}</div><div className="sbs-sl2">Terminées</div><div className="sbs-ssub">sur {tasks.length}</div></div>
              <div className="sbs-stat"><div className="sbs-sv">{pending.length}</div><div className="sbs-sl2">En cours</div><div className="sbs-ssub">{reminders.length} avec rappel</div></div>
              <div className="sbs-stat"><div className="sbs-sv g">{tasks.length ? Math.round(done.length / tasks.length * 100) : 0}%</div><div className="sbs-sl2">Complétion</div></div>
            </div>
            {tasks.length === 0 ? (
              <div className="empty"><p style={{ marginBottom: 8 }}>Aucune tâche pour le moment.</p><a onClick={openNew}>Créer une tâche →</a></div>
            ) : <>
              {pending.length > 0 && <>
                <div className="sec-label">En cours</div>
                <div className="task-list">{pending.map(t => <TaskCard key={t.id} task={t} pct={getPct(t)} proj={getProject(t.projectId)} onClick={() => { setSelectedId(t.id); setView('detail'); }} />)}</div>
              </>}
              {done.length > 0 && <>
                <div className="sec-label">Terminées</div>
                <div className="task-list">
                  {done.map(t => (
                    <div key={t.id} className="task-card done" onClick={() => { setSelectedId(t.id); setView('detail'); }}>
                      <div className="task-top"><div className="task-ck done"><Check size={11} color="#fff" /></div><div className="task-title">{t.title}</div></div>
                    </div>
                  ))}
                </div>
              </>}
            </>}
            <button className="add-btn" onClick={openNew}><Plus size={16} /> Ajouter une tâche...</button>
          </>}

          {/* TÂCHES */}
          {view === 'tasks' && <>
            <div className="sbs-ch">
              <div>
                <div className="sbs-pt">{filterProject === 'tous' ? 'Toutes les tâches' : getProject(filterProject)?.name || 'Tâches'}</div>
                <div className="sbs-ps">{filtered.length} tâche{filtered.length !== 1 ? 's' : ''}</div>
              </div>
              <button className="btn-p" onClick={openNew}><Plus size={15} /> Nouvelle tâche</button>
            </div>
            <div className="sbs-search-w"><Search size={15} className="si" /><input className="sbs-search" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} /></div>
            <div className="filters">
              <button className={`filter-btn ${filterProject === 'tous' ? 'active' : ''}`} onClick={() => setFilterProject('tous')}>Tous</button>
              {projects.map(p => (
                <button key={p.id} className={`filter-btn ${filterProject === p.id ? 'active' : ''}`} onClick={() => setFilterProject(p.id)} style={{ borderColor: filterProject === p.id ? p.color : undefined, background: filterProject === p.id ? p.color + '22' : undefined, color: filterProject === p.id ? p.color : undefined }}>
                  {p.name}
                </button>
              ))}
            </div>
            {filtered.length === 0
              ? <div className="empty"><p style={{ marginBottom: 8 }}>Aucune tâche.</p><a onClick={openNew}>En créer une →</a></div>
              : <div className="task-list">{filtered.map(t => <TaskCard key={t.id} task={t} pct={getPct(t)} proj={getProject(t.projectId)} onClick={() => { setSelectedId(t.id); setView('detail'); }} />)}</div>
            }
          </>}

          {/* DETAIL */}
          {view === 'detail' && selected && (() => {
            const pct = getPct(selected); const pri = PRIORITY[selected.priority]; const due = formatDue(selected.dueDate); const proj = getProject(selected.projectId);
            const isEditing = !!editingTask;
            return <>
              <button className="btn-s" style={{ marginBottom: 20 }} onClick={() => { setView('tasks'); setEditingTask(null); }}><ChevronLeft size={15} /> Retour</button>
              <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: 12, padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ flex: 1, marginRight: 12 }}>
                    {isEditing ? (
                      <input className="sbs-input" style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}
                        value={editingTask.title} onChange={e => setEditingTask(t => ({ ...t, title: e.target.value }))} autoFocus />
                    ) : (
                      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>{selected.title}</h2>
                    )}
                    {isEditing ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                        <select className="sbs-select" value={editingTask.priority} onChange={e => setEditingTask(t => ({ ...t, priority: e.target.value }))}>
                          <option value="high">Urgent</option><option value="medium">Moyen</option><option value="low">Faible</option>
                        </select>
                        <select className="sbs-select" value={editingTask.projectId} onChange={e => setEditingTask(t => ({ ...t, projectId: e.target.value }))}>
                          <option value="">Sans projet</option>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input type="datetime-local" className="sbs-input" value={editingTask.dueDate || ''} onChange={e => setEditingTask(t => ({ ...t, dueDate: e.target.value }))} style={{ gridColumn: '1/-1' }} />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="sbs-tag" style={{ background: pri.bg, color: pri.color, border: `0.5px solid ${pri.border}` }}>{pri.label}</span>
                        {proj && <span className="sbs-date"><div style={{ width: 7, height: 7, borderRadius: '50%', background: proj.color }} />{proj.name}</span>}
                        {due && <span className={`sbs-date${due.alert ? ' alert' : ''}`}><Clock size={11} />{due.label}</span>}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {isEditing ? (
                      <>
                        <button className="btn-p" style={{ padding: '5px 10px', fontSize: 13 }} onClick={saveEdit}><Save size={13} /> Enregistrer</button>
                        <button className="btn-s" style={{ padding: '5px 9px' }} onClick={() => setEditingTask(null)}><X size={14} /></button>
                      </>
                    ) : (
                      <>
                        <button className={`reminder-btn${selected.reminder ? ' on' : ''}`} onClick={() => toggleReminder(selected.id)}>
                          {selected.reminder ? <Bell size={13} /> : <BellOff size={13} />}
                          {selected.reminder ? 'Rappel actif' : 'Rappel'}
                        </button>
                        <button className="btn-s" style={{ padding: '5px 9px' }} onClick={() => setEditingTask({ ...selected })}><Edit2 size={14} /></button>
                        <button className="btn-danger" onClick={() => delTask(selected.id)}><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                </div>
                {selected.subtasks.length > 0 && <>
                  <div style={{ height: 5, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden', marginBottom: 5 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: EM, borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
                    <span>{selected.subtasks.filter(s => s.done).length}/{selected.subtasks.length} étapes</span>
                    <span style={{ color: pct === 100 ? EM : '#9CA3AF', fontWeight: pct === 100 ? 600 : 400 }}>{pct}%{pct === 100 ? ' — Terminé !' : ''}</span>
                  </div>
                </>}
                <div className="sec-label" style={{ marginBottom: 6 }}>Sous-tâches</div>
                {selected.subtasks.map(sub => (
                  <div key={sub.id} className="sub-row">
                    <div className={`cb${sub.done ? ' done' : ''}`} onClick={() => toggleSub(selected.id, sub.id)}>{sub.done && <Check size={12} color="#fff" />}</div>
                    <span className={`sub-t${sub.done ? ' done' : ''}`}>{sub.title}</span>
                    <button className="del-btn" onClick={() => delSub(selected.id, sub.id)}><X size={14} /></button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <input className="sbs-input" placeholder="Ajouter une étape..." value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSub(selected.id)} />
                  <button className="btn-p" onClick={() => addSub(selected.id)} style={{ padding: '8px 12px' }}><Plus size={15} /></button>
                </div>
              </div>
            </>;
          })()}

          {/* PROGRESSION */}
          {view === 'progress' && <>
            <div className="sbs-ch"><div><div className="sbs-pt">Progression</div><div className="sbs-ps">Vue globale</div></div></div>
            <div className="sbs-stats">
              <div className="sbs-stat"><div className="sbs-sv g">{done.length}</div><div className="sbs-sl2">Terminées</div></div>
              <div className="sbs-stat"><div className="sbs-sv">{tasks.filter(t => { const p = getPct(t); return p > 0 && p < 100; }).length}</div><div className="sbs-sl2">En cours</div></div>
              <div className="sbs-stat"><div className="sbs-sv">{tasks.reduce((a, t) => a + t.subtasks.filter(s => s.done).length, 0)}</div><div className="sbs-sl2">Étapes faites</div></div>
            </div>
            {projects.map(proj => {
              const ptasks = tasks.filter(t => t.projectId === proj.id);
              if (!ptasks.length) return null;
              const pdone = ptasks.filter(t => getPct(t) === 100).length;
              return (
                <div key={proj.id} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: proj.color }} />
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{proj.name}</span>
                    <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 'auto' }}>{pdone}/{ptasks.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {ptasks.map(t => {
                      const pct = getPct(t);
                      return (
                        <div key={t.id} style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: 9, padding: '10px 14px', cursor: 'pointer' }} onClick={() => { setSelectedId(t.id); setView('detail'); }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 13.5, fontWeight: 500 }}>{t.title}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: pct === 100 ? EM : '#9CA3AF' }}>{pct}%</span>
                          </div>
                          <div style={{ height: 3, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: proj.color, borderRadius: 2 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {tasks.filter(t => !t.projectId).length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>Sans projet</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {tasks.filter(t => !t.projectId).map(t => {
                    const pct = getPct(t);
                    return (
                      <div key={t.id} style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: 9, padding: '10px 14px', cursor: 'pointer' }} onClick={() => { setSelectedId(t.id); setView('detail'); }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 13.5, fontWeight: 500 }}>{t.title}</span><span style={{ fontSize: 12, fontWeight: 600, color: pct === 100 ? EM : '#9CA3AF' }}>{pct}%</span></div>
                        <div style={{ height: 3, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: EM, borderRadius: 2 }} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>}

        </main>
      </div>

      {/* MODAL NOUVELLE TÂCHE */}
      {showNew && (
        <div className="sbs-overlay" onClick={() => setShowNew(false)}>
          <div className="sbs-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 17, fontWeight: 600 }}>Nouvelle tâche</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }} onClick={() => setShowNew(false)}><X size={18} /></button>
            </div>
            <div style={{ marginBottom: 13 }}>
              <label className="field-label">Titre</label>
              <input className="sbs-input" placeholder="Titre..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} onKeyDown={e => e.key === 'Enter' && createTask()} autoFocus />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 13 }}>
              <div>
                <label className="field-label">Priorité</label>
                <select className="sbs-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  <option value="high">Urgent</option><option value="medium">Moyen</option><option value="low">Faible</option>
                </select>
              </div>
              <div>
                <label className="field-label">Projet</label>
                <select className="sbs-select" value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
                  <option value="">Sans projet</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 13 }}>
              <label className="field-label">Échéance</label>
              <input type="datetime-local" className="sbs-input" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div className="toggle-row" style={{ marginBottom: 20 }} onClick={() => setForm(f => ({ ...f, reminder: !f.reminder }))}>
              <div className="toggle" style={{ background: form.reminder ? EM : '#D1D5DB' }}>
                <div className="toggle-th" style={{ left: form.reminder ? 18 : 2 }} />
              </div>
              <span style={{ fontSize: 13, color: '#374151' }}>Rappel 30 min avant</span>
            </div>
            <button className="btn-p" style={{ width: '100%', justifyContent: 'center', padding: 11, fontSize: 14 }} onClick={createTask} disabled={!form.title.trim()}>Créer la tâche</button>
          </div>
        </div>
      )}

      {/* MODAL NOUVEAU PROJET */}
      {showNewProject && (
        <div className="sbs-overlay" onClick={() => setShowNewProject(false)}>
          <div className="sbs-modal modal-sm" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 17, fontWeight: 600 }}>Nouveau projet</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }} onClick={() => setShowNewProject(false)}><X size={18} /></button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="field-label">Nom du projet</label>
              <input className="sbs-input" placeholder="Ex : Freelance, Perso..." value={projectForm.name} onChange={e => setProjectForm(f => ({ ...f, name: e.target.value }))} onKeyDown={e => e.key === 'Enter' && createProject()} autoFocus />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="field-label">Couleur</label>
              <div className="color-picker">
                {PROJECT_COLORS.map(c => (
                  <div key={c} className={`color-dot ${projectForm.color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setProjectForm(f => ({ ...f, color: c }))}>
                    {projectForm.color === c && <Check size={13} color="#fff" />}
                  </div>
                ))}
              </div>
            </div>
            <button className="btn-p" style={{ width: '100%', justifyContent: 'center', padding: 11 }} onClick={createProject} disabled={!projectForm.name.trim()}>Créer le projet</button>
          </div>
        </div>
      )}

      {/* MODAL ÉDITION PROJET */}
      {editProjectId && (() => {
        const proj = projects.find(p => p.id === editProjectId);
        if (!proj) return null;
        return (
          <div className="sbs-overlay" onClick={() => setEditProjectId(null)}>
            <div className="sbs-modal modal-sm" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 17, fontWeight: 600 }}>Modifier le projet</span>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }} onClick={() => setEditProjectId(null)}><X size={18} /></button>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="field-label">Nom</label>
                <input className="sbs-input" value={proj.name}
                  onChange={e => setProjects(prev => prev.map(p => p.id === editProjectId ? { ...p, name: e.target.value } : p))} autoFocus />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="field-label">Couleur</label>
                <div className="color-picker">
                  {PROJECT_COLORS.map(c => (
                    <div key={c} className={`color-dot ${proj.color === c ? 'selected' : ''}`} style={{ background: c }}
                      onClick={() => setProjects(prev => prev.map(p => p.id === editProjectId ? { ...p, color: c } : p))}>
                      {proj.color === c && <Check size={13} color="#fff" />}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-p" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setEditProjectId(null)}>Enregistrer</button>
                <button className="btn-danger" onClick={() => deleteProject(editProjectId)}><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function TaskCard({ task, pct, proj, onClick }) {
  const pri = PRIORITY[task.priority]; const due = formatDue(task.dueDate);
  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-top">
        <div className="task-ck"><Circle size={9} color="#D1D5DB" /></div>
        <div className="task-title">{task.title}</div>
        <ChevronRight size={15} color="#D1D5DB" />
      </div>
      <div className="task-meta">
        <span className="sbs-tag" style={{ background: pri.bg, color: pri.color, border: `0.5px solid ${pri.border}` }}>{pri.label}</span>
        {proj && <span className="sbs-date"><div style={{ width: 6, height: 6, borderRadius: '50%', background: proj.color, display: 'inline-block' }} /> {proj.name}</span>}
        {due && <span className={`sbs-date${due.alert ? ' alert' : ''}`}><Clock size={11} />{due.label}</span>}
        {task.reminder && <span className="notif-pill"><Bell size={10} /> Rappel</span>}
        {task.subtasks.length > 0 && <span className="sbs-date">{task.subtasks.filter(s => s.done).length}/{task.subtasks.length} étapes</span>}
      </div>
      {task.subtasks.length > 0 && <div className="prog"><div className="prog-fill" style={{ width: `${pct}%` }} /></div>}
    </div>
  );
}
