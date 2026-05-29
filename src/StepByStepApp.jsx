import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, Circle, Plus, ChevronRight, ChevronLeft, Settings, X, LayoutDashboard, ListTodo, BarChart2, Check, Flag, Tag, Clock, Calendar, Bell, Trash2 } from 'lucide-react';
import TaskCreationWizard from './components/TaskCreationWizard';

const generateId = () => Math.random().toString(36).substr(2, 9);

const PRIORITY_CONFIG = {
  high:   { label: 'Haute',   color: '#D94040', dot: '#D94040' },
  medium: { label: 'Moyenne', color: '#D97B2A', dot: '#D97B2A' },
  low:    { label: 'Basse',   color: '#5A9E6F', dot: '#5A9E6F' },
};

const formatDate = (d) => {
  if (!d) return null;
  const dt = new Date(d); dt.setHours(0,0,0,0);
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
  if (dt.getTime() === today.getTime()) return "Aujourd'hui";
  if (dt.getTime() === tomorrow.getTime()) return "Demain";
  const diff = Math.ceil((dt - today) / (1000*60*60*24));
  if (diff < 0) return `En retard (${dt.toLocaleDateString('fr-FR',{day:'numeric',month:'short'})})`;
  return dt.toLocaleDateString('fr-FR', { day:'numeric', month:'short' });
};

const isOverdue = (d) => {
  if (!d) return false;
  const dt = new Date(d); dt.setHours(0,0,0,0);
  const today = new Date(); today.setHours(0,0,0,0);
  return dt < today;
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; background: #FAF8F5; }
  .app-header { background: #FAF8F5; border-bottom: 1px solid #EDE8E0; position: sticky; top: 0; z-index: 40; }
  .app-header-inner { max-width: 720px; margin: 0 auto; padding: 0 20px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
  .app-logo { font-size: 16px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.3px; }
  .app-logo em { color: #C7552A; font-style: normal; }
  .btn-icon { width: 34px; height: 34px; border: none; background: transparent; border-radius: 7px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #999; transition: background .15s, color .15s; }
  .btn-icon:hover { background: #F0EBE3; color: #555; }
  .app-nav-bar { background: #FAF8F5; padding: 0 20px; }
  .app-nav-inner { max-width: 720px; margin: 0 auto; display: flex; border-bottom: 1px solid #EDE8E0; }
  .nav-tab { padding: 10px 16px 11px; font-size: 13.5px; font-weight: 500; color: #999; border: none; background: transparent; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color .15s, border-color .15s; display: flex; align-items: center; gap: 6px; font-family: inherit; white-space: nowrap; }
  .nav-tab:hover { color: #555; }
  .nav-tab.active { color: #C7552A; border-bottom-color: #C7552A; }
  .main-wrap { max-width: 720px; margin: 0 auto; padding: 24px 20px 80px; }
  .card { background: #fff; border: 1px solid #EDE8E0; border-radius: 10px; padding: 18px 20px; margin-bottom: 10px; }
  .card-hover { cursor: pointer; transition: border-color .15s, box-shadow .15s; }
  .card-hover:hover { border-color: #CFC9BF; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
  .section-lbl { font-size: 11px; font-weight: 600; color: #BBB; text-transform: uppercase; letter-spacing: .08em; margin: 22px 0 8px; }
  .btn { padding: 9px 15px; border-radius: 8px; font-size: 14px; font-weight: 500; border: none; cursor: pointer; transition: all .15s; font-family: inherit; display: inline-flex; align-items: center; gap: 6px; }
  .btn-terra { background: #C7552A; color: #fff; }
  .btn-terra:hover { background: #B34D26; }
  .btn-outline { background: transparent; color: #555; border: 1.5px solid #DDD8D0; }
  .btn-outline:hover { border-color: #C5BDB4; }
  .progress-track { height: 4px; background: #EDE8E0; border-radius: 4px; overflow: hidden; margin: 10px 0 0; }
  .progress-fill { height: 100%; background: #C7552A; border-radius: 4px; transition: width .4s cubic-bezier(.4,0,.2,1); }
  .progress-fill.green { background: #5A9E6F; }
  .badge { display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px; border-radius: 20px; font-size: 12px; font-weight: 500; white-space: nowrap; }
  .badge-warm { background: #FDF0EB; color: #C7552A; }
  .badge-green { background: #EAF4EE; color: #3D7A52; }
  .badge-gray { background: #F2EDE8; color: #999; }
  .badge-red { background: #FFF0F0; color: #D94040; }
  .cta-btn { width: 100%; padding: 14px; background: #C7552A; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background .15s; font-family: inherit; margin-bottom: 10px; }
  .cta-btn:hover { background: #B34D26; }
  .focus-panel { background: #fff; border: 1px solid #EDE8E0; border-radius: 10px; padding: 18px 20px; margin-bottom: 10px; }
  .focus-eyebrow { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: #C7552A; margin-bottom: 3px; }
  .focus-title { font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px; }
  .focus-next { background: #FAF8F5; border-radius: 7px; padding: 12px 13px; display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
  .focus-link { display: inline-flex; align-items: center; gap: 3px; font-size: 13px; font-weight: 500; color: #C7552A; background: none; border: none; cursor: pointer; font-family: inherit; }
  .focus-link:hover { opacity: .8; }
  .back-btn { display: inline-flex; align-items: center; gap: 4px; font-size: 13.5px; color: #999; background: none; border: none; cursor: pointer; padding: 0; margin-bottom: 18px; font-family: inherit; transition: color .15s; }
  .back-btn:hover { color: #333; }
  .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #1a1a1a; color: #fff; padding: 10px 18px; border-radius: 8px; font-size: 13.5px; font-weight: 500; z-index: 200; box-shadow: 0 4px 16px rgba(0,0,0,.2); display: flex; align-items: center; gap: 8px; animation: toastUp .2s ease; white-space: nowrap; }
  @keyframes toastUp { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
  .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.32); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .modal { background: #fff; border-radius: 14px; padding: 26px; max-width: 440px; width: 100%; box-shadow: 0 8px 32px rgba(0,0,0,.1); }
  .modal-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
  .modal-title { font-size: 16px; font-weight: 600; color: #1a1a1a; }
  .settings-row { padding: 13px 0; border-bottom: 1px solid #F2EDE8; }
  .settings-row:last-of-type { border-bottom: none; }
  .settings-row h4 { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 2px; }
  .settings-row p { font-size: 13px; color: #AAA; }
  .history-item { display: flex; align-items: center; gap: 9px; padding: 11px 0; border-bottom: 1px solid #F2EDE8; }
  .history-item:last-child { border-bottom: none; }
  .history-dot { width: 20px; height: 20px; border-radius: 50%; background: #EAF4EE; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .meta-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .meta-pill { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: #999; }
  .priority-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
  .empty-state { text-align: center; padding: 44px 20px; }
  .empty-icon { font-size: 28px; margin-bottom: 12px; opacity: .45; }
  .empty-title { font-size: 15px; font-weight: 600; color: #555; margin-bottom: 6px; }
  .empty-desc { font-size: 13px; color: #AAA; margin-bottom: 18px; }
  .detail-meta-card { background: #FAF8F5; border-radius: 8px; padding: 12px 14px; margin-bottom: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .detail-meta-item { display: flex; flex-direction: column; gap: 2px; }
  .detail-meta-key { font-size: 11px; color: #BBB; font-weight: 500; text-transform: uppercase; letter-spacing: .06em; }
  .detail-meta-val { font-size: 13.5px; color: #333; font-weight: 500; display: flex; align-items: center; gap: 5px; }
  .stats-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
  .stat-box { background: #fff; border: 1px solid #EDE8E0; border-radius: 10px; padding: 14px 12px; text-align: center; }
  .stat-num { font-size: 26px; font-weight: 600; color: #1a1a1a; letter-spacing: -.5px; line-height: 1; margin-bottom: 3px; }
  .stat-lbl { font-size: 11.5px; color: #AAA; }
  .overdue-alert { background: #FFF8F8; border: 1px solid #F5CECE; border-radius: 10px; padding: 12px 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: #C04040; font-weight: 500; }
  .ob-wrap { min-height: 100vh; background: #FAF8F5; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .ob-card { background: #fff; border-radius: 14px; padding: 36px 32px; max-width: 400px; width: 100%; border: 1px solid #EDE8E0; }
  .ob-icon { font-size: 32px; margin-bottom: 18px; display: block; }
  .ob-title { font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; letter-spacing: -.3px; }
  .ob-desc { font-size: 14px; color: #777; line-height: 1.65; margin-bottom: 26px; }
  .ob-dots { display: flex; gap: 6px; margin-bottom: 24px; }
  .ob-dot { height: 3px; border-radius: 2px; transition: all .25s; }
  .ob-dot.on { background: #C7552A; width: 22px; }
  .ob-dot.off { background: #E5E0D8; width: 8px; }
  .ob-row { display: flex; gap: 8px; }

  /* ── Subtask rows ── */
  .subtask-row { display: flex; align-items: center; gap: 11px; padding: 9px 10px; border-radius: 7px; transition: background .12s; }
  .subtask-row:hover { background: #FAF8F5; }
  .subtask-row:hover .sub-delete { opacity: 1; }
  .subtask-row.done { opacity: .5; }
  .check-btn { flex-shrink: 0; background: none; border: none; cursor: pointer; padding: 0; display: flex; color: #CCC; transition: color .15s; }
  .check-btn:hover { color: #C7552A; }
  .check-btn.done { color: #5A9E6F; }
  .subtask-text { font-size: 14px; color: #333; flex: 1; line-height: 1.45; }
  .subtask-text.done { text-decoration: line-through; color: #BBB; }
  .sub-delete { opacity: 0; background: none; border: none; cursor: pointer; padding: 4px; color: #CCC; display: flex; border-radius: 5px; transition: opacity .15s, color .15s, background .15s; flex-shrink: 0; }
  .sub-delete:hover { color: #D94040; background: #FFF0F0; }

  /* ── Add subtask input ── */
  .add-subtask-wrap { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 7px; border: 1.5px dashed #E0DBD3; margin-top: 6px; transition: border-color .15s; }
  .add-subtask-wrap:focus-within { border-color: #C7552A; border-style: solid; background: #FFFDFB; }
  .add-subtask-icon { color: #CCC; display: flex; flex-shrink: 0; }
  .add-subtask-wrap:focus-within .add-subtask-icon { color: #C7552A; }
  .add-subtask-input { flex: 1; border: none; outline: none; font-size: 14px; color: #333; background: transparent; font-family: inherit; }
  .add-subtask-input::placeholder { color: #CCC; }
  .add-subtask-hint { font-size: 11.5px; color: #CCC; flex-shrink: 0; transition: color .15s; }
  .add-subtask-wrap:focus-within .add-subtask-hint { color: #C7552A; }
`;

const StepByStepApp = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskCreation, setShowTaskCreation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const onboardingSteps = [
    { title: "Bienvenue sur Step by Step", description: "Transforme tes grands projets en petites victoires quotidiennes. Sans pression.", icon: "🌱" },
    { title: "Avance à ton rythme", description: "Chaque tâche est découpée en micro-étapes concrètes et actionnables. Un pas à la fois.", icon: "🎯" },
    { title: "Célèbre chaque progrès", description: "Chaque étape complétée compte. On avance ensemble, sans jugement.", icon: "✦" },
  ];

  const createTask = (formData) => {
    const newTask = {
      id: generateId(),
      title: formData.title,
      notes: formData.notes || '',
      priority: formData.priority || '',
      tags: formData.tags || [],
      duration: formData.duration || '',
      dueDate: formData.dueDate || '',
      reminder: formData.reminder || '',
      createdAt: new Date(),
      subtasks: [],
      progress: 0,
    };
    setTasks(prev => [newTask, ...prev]);
    setSelectedTask(newTask);
    setActiveView('task-detail');
    showToast('Tâche créée — ajoute tes étapes !');
  };

  const recalcProgress = (subtasks) => {
    if (!subtasks.length) return 0;
    return Math.round((subtasks.filter(s => s.completed).length / subtasks.length) * 100);
  };

  const updateTask = (taskId, updater) => {
    setTasks(prev => prev.map(t => t.id === taskId ? updater(t) : t));
    setSelectedTask(prev => prev?.id === taskId ? updater(prev) : prev);
  };

  const toggleSubtask = (taskId, subtaskId) => {
    let wasCompleted = false;
    updateTask(taskId, task => {
      wasCompleted = !!task.subtasks.find(s => s.id === subtaskId)?.completed;
      const subs = task.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
      return { ...task, subtasks: subs, progress: recalcProgress(subs) };
    });
    if (!wasCompleted) showToast('Étape validée — bien joué !');
  };

  const addSubtask = (taskId, title) => {
    if (!title.trim()) return;
    updateTask(taskId, task => {
      const subs = [...task.subtasks, { id: generateId(), title: title.trim(), completed: false, order: task.subtasks.length }];
      return { ...task, subtasks: subs, progress: recalcProgress(subs) };
    });
  };

  const deleteSubtask = (taskId, subtaskId) => {
    updateTask(taskId, task => {
      const subs = task.subtasks.filter(s => s.id !== subtaskId);
      return { ...task, subtasks: subs, progress: recalcProgress(subs) };
    });
  };

  const activeTask = tasks.find(t => t.progress < 100);
  const nextSubtask = activeTask?.subtasks.find(s => !s.completed);
  const stats = {
    completedSubtasks: tasks.reduce((a, t) => a + t.subtasks.filter(s => s.completed).length, 0),
    completedTasks: tasks.filter(t => t.progress === 100).length,
    total: tasks.length,
    overdue: tasks.filter(t => t.progress < 100 && isOverdue(t.dueDate)).length,
  };

  if (showOnboarding) {
    const step = onboardingSteps[onboardingStep];
    return (
      <div className="ob-wrap">
        <style>{CSS}</style>
        <div className="ob-card">
          <span className="ob-icon">{step.icon}</span>
          <h1 className="ob-title">{step.title}</h1>
          <p className="ob-desc">{step.description}</p>
          <div className="ob-dots">
            {onboardingSteps.map((_, i) => <div key={i} className={`ob-dot ${i === onboardingStep ? 'on' : 'off'}`} />)}
          </div>
          <div className="ob-row">
            {onboardingStep > 0 && <button className="btn btn-outline" style={{flex:1,justifyContent:'center',padding:'11px'}} onClick={()=>setOnboardingStep(s=>s-1)}>Retour</button>}
            <button className="btn btn-terra" style={{flex:1,justifyContent:'center',padding:'11px'}} onClick={()=>{ if(onboardingStep<2) setOnboardingStep(s=>s+1); else setShowOnboarding(false); }}>
              {onboardingStep < 2 ? 'Suivant' : 'Commencer'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh',background:'#FAF8F5',fontFamily:'Inter,system-ui,sans-serif',color:'#1a1a1a'}}>
      <style>{CSS}</style>

      {toast && <div className="toast"><Check size={14} color="#5A9E6F"/>{toast}</div>}

      <header className="app-header">
        <div className="app-header-inner">
          <span className="app-logo">Step <em>by</em> Step</span>
          <button className="btn-icon" onClick={()=>setShowSettings(true)}><Settings size={17}/></button>
        </div>
      </header>

      <div className="app-nav-bar">
        <div className="app-nav-inner">
          {[
            {id:'dashboard',label:'Tableau de bord',icon:<LayoutDashboard size={14}/>},
            {id:'tasks',label:'Mes tâches',icon:<ListTodo size={14}/>},
            {id:'progress',label:'Progression',icon:<BarChart2 size={14}/>},
          ].map(t=>(
            <button key={t.id} className={`nav-tab${activeView===t.id||(activeView==='task-detail'&&t.id==='tasks')?' active':''}`} onClick={()=>setActiveView(t.id)}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="main-wrap">

        {activeView === 'dashboard' && (
          <>
            {stats.overdue > 0 && (
              <div className="overdue-alert">
                <Calendar size={15}/>
                {stats.overdue} tâche{stats.overdue>1?'s':''} en retard — pense à les traiter en priorité.
              </div>
            )}
            {activeTask && nextSubtask ? (
              <>
                <div className="section-lbl">Prochaine étape</div>
                <div className="focus-panel">
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'3px'}}>
                    <span className="focus-eyebrow">En cours</span>
                    {activeTask.priority && (
                      <span style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'12px',color:PRIORITY_CONFIG[activeTask.priority]?.color}}>
                        <span className="priority-dot" style={{background:PRIORITY_CONFIG[activeTask.priority]?.dot}}/>
                        {PRIORITY_CONFIG[activeTask.priority]?.label}
                      </span>
                    )}
                  </div>
                  <div className="focus-title">{activeTask.title}</div>
                  <div className="focus-next">
                    <button className="check-btn" onClick={()=>toggleSubtask(activeTask.id,nextSubtask.id)}><Circle size={17}/></button>
                    <span style={{fontSize:'14px',color:'#333',lineHeight:1.5}}>{nextSubtask.title}</span>
                  </div>
                  <div className="progress-track"><div className={`progress-fill${activeTask.progress===100?' green':''}`} style={{width:`${activeTask.progress}%`}}/></div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'10px'}}>
                    <span style={{fontSize:'12.5px',color:'#AAA'}}>{activeTask.subtasks.filter(s=>s.completed).length}/{activeTask.subtasks.length} étapes · {activeTask.progress}%</span>
                    <button className="focus-link" onClick={()=>{setSelectedTask(activeTask);setActiveView('task-detail');}}>Voir tout <ChevronRight size={13}/></button>
                  </div>
                </div>
              </>
            ) : (
              <button className="cta-btn" onClick={()=>setShowTaskCreation(true)}><Plus size={17}/>Créer ma première tâche</button>
            )}

            <div className="section-lbl">Vue d'ensemble</div>
            <div className="stats-3">
              {[{n:stats.completedSubtasks,l:'Étapes faites'},{n:stats.completedTasks,l:'Terminées'},{n:stats.total,l:'Au total'}].map((s,i)=>(
                <div key={i} className="stat-box"><div className="stat-num">{s.n}</div><div className="stat-lbl">{s.l}</div></div>
              ))}
            </div>

            {tasks.length > 0 && (
              <>
                <div className="section-lbl">Toutes les tâches</div>
                {tasks.map(task=>(
                  <TaskCard key={task.id} task={task} onClick={()=>{setSelectedTask(task);setActiveView('task-detail');}}/>
                ))}
              </>
            )}
          </>
        )}

        {activeView === 'tasks' && (
          <>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'18px'}}>
              <h2 style={{fontSize:'17px',fontWeight:'600'}}>Mes tâches</h2>
              <button className="btn btn-terra" onClick={()=>setShowTaskCreation(true)}><Plus size={14}/>Nouvelle tâche</button>
            </div>
            {tasks.length === 0 ? (
              <div className="card"><div className="empty-state">
                <div className="empty-icon">🌱</div>
                <div className="empty-title">Aucune tâche pour le moment</div>
                <div className="empty-desc">Crée ta première tâche et commence à avancer.</div>
                <button className="btn btn-terra" onClick={()=>setShowTaskCreation(true)}><Plus size={14}/>Créer une tâche</button>
              </div></div>
            ) : tasks.map(task=>(
              <TaskCard key={task.id} task={task} onClick={()=>{setSelectedTask(task);setActiveView('task-detail');}}/>
            ))}
          </>
        )}

        {activeView === 'task-detail' && selectedTask && (
          <>
            <button className="back-btn" onClick={()=>setActiveView('tasks')}><ChevronLeft size={15}/>Mes tâches</button>

            <div className="card" style={{marginBottom:'10px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'10px',marginBottom:'5px'}}>
                <h2 style={{fontSize:'17px',fontWeight:'600',lineHeight:1.3}}>{selectedTask.title}</h2>
                {selectedTask.progress===100&&<span className="badge badge-green"><Check size={10}/>Terminé</span>}
              </div>
              <div style={{fontSize:'13px',color:'#AAA',marginBottom:'14px'}}>
                {selectedTask.subtasks.length === 0
                  ? 'Aucune étape — ajoutes-en ci-dessous'
                  : `${selectedTask.subtasks.filter(s=>s.completed).length}/${selectedTask.subtasks.length} étapes · ${selectedTask.progress}%`
                }
              </div>
              {selectedTask.subtasks.length > 0 && (
                <div className="progress-track" style={{height:'5px'}}>
                  <div className={`progress-fill${selectedTask.progress===100?' green':''}`} style={{width:`${selectedTask.progress}%`}}/>
                </div>
              )}
            </div>

            {(selectedTask.priority || selectedTask.dueDate || selectedTask.duration || selectedTask.tags?.length > 0) && (
              <div className="detail-meta-card">
                {selectedTask.priority && (
                  <div className="detail-meta-item">
                    <span className="detail-meta-key">Priorité</span>
                    <span className="detail-meta-val"><span className="priority-dot" style={{background:PRIORITY_CONFIG[selectedTask.priority]?.dot}}/>{PRIORITY_CONFIG[selectedTask.priority]?.label}</span>
                  </div>
                )}
                {selectedTask.dueDate && (
                  <div className="detail-meta-item">
                    <span className="detail-meta-key">Échéance</span>
                    <span className="detail-meta-val" style={{color:isOverdue(selectedTask.dueDate)?'#D94040':'#333'}}>{formatDate(selectedTask.dueDate)}</span>
                  </div>
                )}
                {selectedTask.duration && (
                  <div className="detail-meta-item">
                    <span className="detail-meta-key">Durée</span>
                    <span className="detail-meta-val">{selectedTask.duration}</span>
                  </div>
                )}
                {selectedTask.reminder && (
                  <div className="detail-meta-item">
                    <span className="detail-meta-key">Rappel</span>
                    <span className="detail-meta-val">{selectedTask.reminder}</span>
                  </div>
                )}
                {selectedTask.tags?.length > 0 && (
                  <div className="detail-meta-item" style={{gridColumn:'1/-1'}}>
                    <span className="detail-meta-key">Tags</span>
                    <div style={{display:'flex',flexWrap:'wrap',gap:'5px',marginTop:'3px'}}>
                      {selectedTask.tags.map(t=><span key={t} className="badge badge-gray">{t}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedTask.notes && (
              <div className="card" style={{marginBottom:'10px',fontSize:'14px',color:'#555',lineHeight:1.6}}>
                <div style={{fontSize:'11px',fontWeight:600,color:'#BBB',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'7px'}}>Notes</div>
                {selectedTask.notes}
              </div>
            )}

            {/* Étapes */}
            <div className="card">
              <div style={{fontSize:'11px',fontWeight:'600',color:'#BBB',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'8px'}}>
                Étapes {selectedTask.subtasks.length > 0 && <span style={{color:'#DDD',fontWeight:400}}>· {selectedTask.subtasks.length}</span>}
              </div>

              {selectedTask.subtasks.length === 0 && (
                <p style={{fontSize:'13.5px',color:'#CCC',padding:'8px 10px 12px',textAlign:'center'}}>
                  Aucune étape pour l'instant — ajoutes-en une ci-dessous.
                </p>
              )}

              {selectedTask.subtasks.map(sub => (
                <div key={sub.id} className={`subtask-row${sub.completed?' done':''}`}>
                  <button className={`check-btn${sub.completed?' done':''}`} onClick={()=>toggleSubtask(selectedTask.id,sub.id)}>
                    {sub.completed?<CheckCircle size={17}/>:<Circle size={17}/>}
                  </button>
                  <span className={`subtask-text${sub.completed?' done':''}`}>{sub.title}</span>
                  <button className="sub-delete" onClick={()=>deleteSubtask(selectedTask.id,sub.id)} title="Supprimer">
                    <Trash2 size={14}/>
                  </button>
                </div>
              ))}

              {/* Input ajout étape */}
              <AddSubtaskInput onAdd={(title) => addSubtask(selectedTask.id, title)} />
            </div>
          </>
        )}

        {activeView === 'progress' && (
          <>
            <h2 style={{fontSize:'17px',fontWeight:'600',marginBottom:'18px'}}>Progression</h2>
            <div className="card" style={{textAlign:'center',padding:'28px 20px',marginBottom:'10px'}}>
              <div style={{fontSize:'44px',fontWeight:'600',color:'#1a1a1a',letterSpacing:'-1px',lineHeight:1}}>{stats.completedSubtasks}</div>
              <div style={{fontSize:'13px',color:'#AAA',marginTop:'5px'}}>étapes accomplies au total</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'10px'}}>
              {[{l:'Terminées',n:stats.completedTasks},{l:'En cours',n:stats.total-stats.completedTasks}].map((s,i)=>(
                <div key={i} className="stat-box" style={{textAlign:'left',padding:'16px'}}>
                  <div style={{fontSize:'11px',color:'#CCC',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'7px',fontWeight:600}}>{s.l}</div>
                  <div className="stat-num">{s.n}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <div style={{fontSize:'13.5px',fontWeight:'600',color:'#333',marginBottom:'10px'}}>Historique</div>
              {tasks.filter(t=>t.progress===100).length===0
                ? <p style={{fontSize:'13px',color:'#CCC',padding:'14px 0',textAlign:'center'}}>Aucune tâche complétée pour le moment.</p>
                : tasks.filter(t=>t.progress===100).map(task=>(
                  <div key={task.id} className="history-item">
                    <div className="history-dot"><Check size={11} color="#3D7A52"/></div>
                    <span style={{fontSize:'13.5px',color:'#333'}}>{task.title}</span>
                  </div>
                ))
              }
            </div>
          </>
        )}
      </main>

      {showTaskCreation && (
        <TaskCreationWizard onClose={()=>setShowTaskCreation(false)} onCreate={createTask}/>
      )}

      {showSettings && (
        <div className="modal-bg" onClick={()=>setShowSettings(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-hdr">
              <span className="modal-title">Paramètres</span>
              <button className="btn-icon" onClick={()=>setShowSettings(false)}><X size={17}/></button>
            </div>
            <div className="settings-row"><h4>Notifications</h4><p>Rappels doux pour t'encourager (bientôt disponible)</p></div>
            <div className="settings-row"><h4>Rythme</h4><p>Personnalise ton rythme d'avancement (bientôt disponible)</p></div>
            <div className="settings-row"><h4>À propos</h4><p>Step by Step v1.0</p></div>
            <button className="btn btn-outline" style={{width:'100%',justifyContent:'center',marginTop:'16px',padding:'11px'}}
              onClick={()=>{if(confirm("Revoir l'introduction ?")){setShowOnboarding(true);setOnboardingStep(0);setShowSettings(false);}}}>
              Revoir l'introduction
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant input ajout étape
const AddSubtaskInput = ({ onAdd }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  const handleAdd = () => {
    if (!value.trim()) return;
    onAdd(value);
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <div className="add-subtask-wrap">
      <span className="add-subtask-icon"><Plus size={15}/></span>
      <input
        ref={inputRef}
        className="add-subtask-input"
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
        placeholder="Ajouter une étape…"
      />
      {value.trim() && <span className="add-subtask-hint">↵ Entrée</span>}
    </div>
  );
};

// Carte tâche réutilisable
const TaskCard = ({ task, onClick }) => (
  <div className="card card-hover" onClick={onClick}>
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'10px'}}>
      <span style={{fontSize:'14.5px',fontWeight:'600',color:'#1a1a1a',lineHeight:1.3}}>{task.title}</span>
      <div style={{display:'flex',alignItems:'center',gap:'5px',flexShrink:0}}>
        {task.priority && <span className="priority-dot" style={{background:PRIORITY_CONFIG[task.priority]?.dot,marginTop:'2px'}}/>}
        {task.progress===100?<span className="badge badge-green"><Check size={10}/>Terminé</span>:<span className="badge badge-warm">{task.progress}%</span>}
      </div>
    </div>
    {task.subtasks.length > 0 && (
      <div className="progress-track"><div className={`progress-fill${task.progress===100?' green':''}`} style={{width:`${task.progress}%`}}/></div>
    )}
    <div className="meta-row">
      {task.dueDate && <span className="meta-pill" style={{color:isOverdue(task.dueDate)?'#D94040':'#AAA'}}><Calendar size={11}/>{formatDate(task.dueDate)}</span>}
      {task.duration && <span className="meta-pill"><Clock size={11}/>{task.duration}</span>}
      {task.tags?.slice(0,2).map(t=><span key={t} className="meta-pill"><Tag size={11}/>{t}</span>)}
      {task.subtasks.length > 0 && <span className="meta-pill">{task.subtasks.filter(s=>s.completed).length}/{task.subtasks.length} étapes</span>}
    </div>
  </div>
);

export default StepByStepApp;
