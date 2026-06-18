import React, { useState, useEffect } from 'react';
import {
  Check, Plus, ChevronLeft, ChevronRight, Bell, BellOff,
  Trash2, LayoutDashboard, ListChecks, TrendingUp, X, Clock,
  Search, Settings, Edit2, Folder, Save, GripVertical,
  Calendar, Archive, RotateCcw, LogOut, Menu, AlertCircle
} from 'lucide-react';
import Onboarding from './Onboarding';
import EmptyState from './EmptyState';
import { auth } from './firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import AuthScreen from './AuthScreen';
import { useFirestore } from './useFirestore';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ── Palette ──────────────────────────────────────────────────────────────────
const PR       = '#0091ff';   // bleu principal
const PR_LIGHT = '#b1d5ff';   // bleu clair
const PR_DARK  = '#0066cc';   // bleu foncé
const PR_BG    = '#f0f7ff';   // fond bleu très léger
const PR_MID   = '#66b8ff';   // bleu intermédiaire
const AC       = '#4e3fd5';   // violet accent
const AC_LIGHT = '#ede9fe';   // violet très clair
// ─────────────────────────────────────────────────────────────────────────────

const PRIORITY = {
  high:   { label: 'Urgent', bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
  medium: { label: 'Moyen',  bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
  low:    { label: 'Faible', bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
};
const PROJECT_COLORS = [PR, AC, '#059669','#F59E0B','#EF4444','#EC4899','#0891B2','#64748B'];
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_FR   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const formatDue = (iso) => {
  if (!iso) return null;
  const d = new Date(iso?.toDate?.() || iso), now = new Date();
  const diff = Math.floor((d - now) / 86400000);
  if (diff < 0) return { label: 'En retard', alert: true };
  if (diff === 0) return { label: 'Auj. ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), alert: true };
  if (diff === 1) return { label: 'Demain', alert: false };
  return { label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), alert: false };
};

const scheduleNotif = (task) => {
  if (!task.reminder || !task.dueDate) return;
  const ts = task.dueDate?.toDate?.() || new Date(task.dueDate);
  const delay = ts.getTime() - 30 * 60 * 1000 - Date.now();
  if (delay <= 0) return;
  setTimeout(() => { if (Notification.permission === 'granted') new Notification('Step by Step', { body: `Rappel : ${task.title}` }); }, delay);
};

function SortableTaskCard({ task, pct, proj, onToggleDone, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 50 : 'auto' };
  const pri = PRIORITY[task.priority]; const due = formatDue(task.dueDate); const done = pct === 100;
  return (
    <div ref={setNodeRef} style={style} className={`task-card${done ? ' done' : ''}`}>
      <div className="task-top">
        <button className="drag-handle" {...attributes} {...listeners} tabIndex={-1} onClick={e => e.stopPropagation()}><GripVertical size={14} /></button>
        <div className={`task-ck${done ? ' done' : ''}`} onClick={e => { e.stopPropagation(); onToggleDone(task.id); }}>
          {done && <Check size={11} color="#fff" />}
        </div>
        <div className="task-title" onClick={() => onOpen(task.id)}>{task.title}</div>
        <ChevronRight size={15} color="#D1D5DB" onClick={() => onOpen(task.id)} style={{ cursor: 'pointer', flexShrink: 0 }} />
      </div>
      <div className="task-meta" onClick={() => onOpen(task.id)}>
        <span className="sbs-tag" style={{ background: pri.bg, color: pri.color, border: `0.5px solid ${pri.border}` }}>{pri.label}</span>
        {proj && <span className="sbs-date"><div style={{ width: 6, height: 6, borderRadius: '50%', background: proj.color, display: 'inline-block' }} /> {proj.name}</span>}
        {due && <span className={`sbs-date${due.alert ? ' alert' : ''}`}><Clock size={11} />{due.label}</span>}
        {task.reminder && <span className="notif-pill"><Bell size={10} /> Rappel</span>}
        {task.subtasks?.length > 0 && <span className="sbs-date">{task.subtasks.filter(s => s.done).length}/{task.subtasks.length} étapes</span>}
      </div>
      {task.subtasks?.length > 0 && <div className="prog" onClick={() => onOpen(task.id)}><div className="prog-fill" style={{ width: `${pct}%` }} /></div>}
    </div>
  );
}

function SortableSubtask({ sub, taskId, onToggle, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sub.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, background: isDragging ? PR_BG : 'transparent', borderRadius: 6 };
  return (
    <div ref={setNodeRef} style={style} className="sub-row">
      <button className="drag-handle" {...attributes} {...listeners} tabIndex={-1}><GripVertical size={14} /></button>
      <div className={`cb${sub.done ? ' done' : ''}`} onClick={() => onToggle(taskId, sub.id)}>{sub.done && <Check size={12} color="#fff" />}</div>
      <span className={`sub-t${sub.done ? ' done' : ''}`}>{sub.title}</span>
      <button className="del-btn" onClick={() => onDelete(taskId, sub.id)}><X size={14} /></button>
    </div>
  );
}

function AppShell({ user, logo }) {
  const {
    tasks, projects, loading, error,
    createProject, updateProject, deleteProject,
    createTask, updateTask, deleteTask, reorderTasks,
    addSubtask, updateSubtask, deleteSubtask, reorderSubtasks,
  } = useFirestore(user);

  const [view, setView]             = useState('dashboard');
  const [selectedId, setSelectedId] = useState(null);
  const [filterProject, setFilterProject] = useState('tous');
  const [search, setSearch]         = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('sbs_onboarded_' + user.uid));
  const [showNew, setShowNew]               = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [editingTask, setEditingTask]       = useState(null);
  const [editProjectId, setEditProjectId]   = useState(null);
  const [calDate, setCalDate]       = useState(new Date());
  const emptyForm = { title: '', priority: 'medium', dueDate: '', reminder: false, projectId: '' };
  const [form, setForm]             = useState(emptyForm);
  const [projectForm, setProjectForm] = useState({ name: '', color: PR });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getPct = (t) => {
    if (!t.subtasks?.length) return t.done ? 100 : 0;
    return Math.round(t.subtasks.filter(s => s.done).length / t.subtasks.length * 100);
  };

  const handleCreateTask = async () => {
    if (!form.title.trim()) return;
    const data = { title: form.title.trim(), priority: form.priority, dueDate: form.dueDate || null, reminder: form.reminder, projectId: form.projectId || null, done: false, archived: false };
    if (data.reminder && data.dueDate) scheduleNotif(data);
    const ref = await createTask(data);
    setShowNew(false); setForm(emptyForm);
    setSelectedId(ref.id); setView('detail');
  };

  const handleToggleDone = (id) => {
    const t = tasks.find(x => x.id === id); if (!t) return;
    if (t.subtasks?.length) { const allDone = t.subtasks.every(s => s.done); t.subtasks.forEach(s => updateSubtask(id, s.id, { done: !allDone })); }
    else updateTask(id, { done: !t.done });
  };

  const handleTaskDragEnd = (event) => {
    const { active, over } = event; if (!over || active.id === over.id) return;
    const oi = activeTasks.findIndex(t => t.id === active.id);
    const ni = activeTasks.findIndex(t => t.id === over.id);
    reorderTasks(arrayMove(activeTasks, oi, ni));
  };

  const handleSubDragEnd = (taskId, event) => {
    const { active, over } = event; if (!over || active.id === over.id) return;
    const task = tasks.find(t => t.id === taskId); if (!task) return;
    const oi = task.subtasks.findIndex(s => s.id === active.id);
    const ni = task.subtasks.findIndex(s => s.id === over.id);
    reorderSubtasks(taskId, arrayMove(task.subtasks, oi, ni));
  };

  const handleSaveEdit = () => {
    if (!editingTask?.title?.trim()) return;
    updateTask(editingTask.id, { title: editingTask.title, priority: editingTask.priority, dueDate: editingTask.dueDate || null, projectId: editingTask.projectId || null, reminder: editingTask.reminder });
    setEditingTask(null);
  };

  const getProject = (pid) => projects.find(p => p.id === pid);
  const activeTasks   = tasks.filter(t => !t.archived);
  const archivedTasks = tasks.filter(t => t.archived);
  const filtered      = activeTasks.filter(t => t.title?.toLowerCase().includes(search.toLowerCase()) && (filterProject === 'tous' || t.projectId === filterProject));
  const pending       = activeTasks.filter(t => getPct(t) < 100);
  const done          = activeTasks.filter(t => getPct(t) === 100);
  const reminders     = activeTasks.filter(t => t.reminder && t.dueDate && getPct(t) < 100);
  const selected      = tasks.find(t => t.id === selectedId);
  const today         = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  const calYear = calDate.getFullYear(); const calMonth = calDate.getMonth();
  const startDow = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
  const lastDay  = new Date(calYear, calMonth + 1, 0).getDate();
  const calCells = [...Array(startDow).fill(null), ...Array.from({ length: lastDay }, (_, i) => i + 1)];
  const tasksByDay = {};
  activeTasks.forEach(t => {
    if (!t.dueDate) return;
    const d = new Date(t.dueDate?.toDate?.() || t.dueDate);
    if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
      const day = d.getDate();
      if (!tasksByDay[day]) tasksByDay[day] = [];
      tasksByDay[day].push(t);
    }
  });

  const navigate = (v) => { setView(v); setSidebarOpen(false); };
  const openNew  = () => { setForm(emptyForm); setShowNew(true); setSidebarOpen(false); };

  const TaskListWithDnd = ({ taskList }) => (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTaskDragEnd}>
      <SortableContext items={taskList.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="task-list">
          {taskList.map(t => (
            <SortableTaskCard key={t.id} task={t} pct={getPct(t)} proj={getProject(t.projectId)}
              onToggleDone={handleToggleDone}
              onOpen={(id) => { setSelectedId(id); setView('detail'); setSidebarOpen(false); }} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );

  const todayD = new Date();

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .sbs { background: #F8FAFF; min-height: 100vh; color: #111827; font-family: 'Inter', -apple-system, sans-serif; font-size: 14px; }

    .sbs-header { background: #fff; border-bottom: 0.5px solid #E5E7EB; padding: 0 20px; height: 56px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
    .sbs-logo { display: flex; align-items: center; gap: 10px; }
    .sbs-logo-icon { width: 30px; height: 30px; border-radius: 9px; background: linear-gradient(135deg, ${AC}, ${PR}); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .sbs-logo-text { font-size: 16px; font-weight: 600; background: linear-gradient(135deg, ${AC}, ${PR}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .sbs-icon-btn { width: 34px; height: 34px; border-radius: 8px; border: 0.5px solid #E5E7EB; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6B7280; flex-shrink: 0; }
    .sbs-icon-btn:hover { background: ${PR_BG}; color: ${PR}; border-color: ${PR_LIGHT}; }

    .sbs-body { display: flex; min-height: calc(100vh - 56px); position: relative; }
    .sbs-overlay-bg { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 40; }
    @media (max-width: 768px) { .sbs-overlay-bg.open { display: block; } }

    .sbs-sidebar { background: #fff; border-right: 0.5px solid #E5E7EB; width: 224px; flex-shrink: 0; padding: 16px 10px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
    @media (max-width: 768px) { .sbs-sidebar { position: fixed; top: 56px; left: -224px; height: calc(100vh - 56px); z-index: 45; transition: left 0.25s ease; } .sbs-sidebar.open { left: 0; } }

    .sbs-sl { font-size: 10px; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.08em; padding: 0 10px; margin: 14px 0 5px; }
    .sbs-nav { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 8px; cursor: pointer; font-size: 13.5px; color: #6B7280; border: none; background: none; width: 100%; text-align: left; font-family: inherit; }
    .sbs-nav:hover { background: ${PR_BG}; color: ${PR_DARK}; }
    .sbs-nav.active { background: ${PR_BG}; color: ${PR}; font-weight: 500; border-left: 3px solid ${PR}; }
    .sbs-badge { margin-left: auto; border-radius: 20px; font-size: 10px; padding: 1px 6px; font-weight: 600; background: ${PR}; color: #fff; }
    .sbs-badge.amber { background: #F59E0B; }
    .sbs-badge.gray  { background: #9CA3AF; }
    .sbs-proj-row { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #6B7280; }
    .sbs-proj-row:hover { background: ${PR_BG}; }
    .sbs-proj-row.active { background: ${PR_BG}; color: ${PR_DARK}; font-weight: 500; }
    .sbs-proj-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .sbs-proj-edit { margin-left: auto; opacity: 0; background: none; border: none; cursor: pointer; color: #9CA3AF; padding: 2px; display: flex; }
    .sbs-proj-row:hover .sbs-proj-edit { opacity: 1; }

    .sbs-content { flex: 1; padding: 22px; overflow-y: auto; min-width: 0; }
    @media (max-width: 480px) { .sbs-content { padding: 16px 14px; } }

    .sbs-ch { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 12px; }
    .sbs-pt { font-size: 20px; font-weight: 600; color: #111827; }
    .sbs-ps { font-size: 13px; color: #9CA3AF; margin-top: 3px; text-transform: capitalize; }

    .btn-p { background: linear-gradient(135deg, ${AC}, ${PR}); color: #fff; border: none; border-radius: 8px; padding: 9px 16px; font-size: 13.5px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: inherit; white-space: nowrap; flex-shrink: 0; }
    .btn-p:hover { opacity: 0.9; }
    .btn-p:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-s { background: #fff; color: #374151; border: 0.5px solid #D1D5DB; border-radius: 8px; padding: 7px 13px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: inherit; white-space: nowrap; }
    .btn-s:hover { border-color: ${PR_LIGHT}; color: ${PR}; }
    .btn-danger { background: #fff; color: #EF4444; border: 0.5px solid #FECACA; border-radius: 7px; padding: 5px 9px; cursor: pointer; display: flex; align-items: center; font-family: inherit; }

    .sbs-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 20px; }
    .sbs-stat { background: #fff; border: 0.5px solid #E5E7EB; border-radius: 10px; padding: 14px 16px; }
    .sbs-sv { font-size: 22px; font-weight: 600; color: #111827; }
    .sbs-sv.g { color: ${PR}; }
    .sbs-sl2 { font-size: 12px; color: #6B7280; margin-top: 2px; }
    .sbs-ssub { font-size: 11px; color: #9CA3AF; margin-top: 1px; }

    .sbs-banner { background: #FFFBEB; border: 0.5px solid #FDE68A; border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; margin-bottom: 18px; font-size: 13px; color: #92400E; }

    .sec-label { font-size: 10.5px; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 8px; }
    .task-list { display: flex; flex-direction: column; gap: 7px; margin-bottom: 18px; }
    .task-card { background: #fff; border: 0.5px solid #E5E7EB; border-radius: 11px; padding: 13px 14px; transition: border-color 0.15s, box-shadow 0.15s; }
    .task-card:hover { border-color: ${PR_LIGHT}; box-shadow: 0 2px 8px rgba(0,145,255,0.08); }
    .task-card.done { opacity: 0.55; }
    .task-top { display: flex; align-items: center; gap: 8px; }
    .drag-handle { background: none; border: none; cursor: grab; color: #D1D5DB; padding: 2px; display: flex; align-items: center; flex-shrink: 0; touch-action: none; }
    .drag-handle:hover { color: #9CA3AF; }
    .drag-handle:active { cursor: grabbing; }
    .task-ck { width: 19px; height: 19px; min-width: 19px; border-radius: 50%; border: 1.5px solid #D1D5DB; display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; transition: all 0.15s; }
    .task-ck:hover { border-color: ${PR}; background: ${PR_BG}; }
    .task-ck.done { background: linear-gradient(135deg, ${AC}, ${PR}); border-color: ${PR}; }
    .task-title { flex: 1; font-size: 14px; font-weight: 500; color: #111827; cursor: pointer; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .task-card.done .task-title { text-decoration: line-through; color: #9CA3AF; }
    .task-meta { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-top: 8px; padding-left: 51px; cursor: pointer; }
    .sbs-tag { font-size: 10.5px; font-weight: 500; padding: 2px 8px; border-radius: 20px; white-space: nowrap; }
    .sbs-date { font-size: 11.5px; color: #9CA3AF; display: flex; align-items: center; gap: 3px; white-space: nowrap; }
    .sbs-date.alert { color: #B45309; }
    .notif-pill { font-size: 11px; background: ${PR_BG}; color: ${PR_DARK}; padding: 2px 7px; border-radius: 20px; display: flex; align-items: center; gap: 3px; }
    .prog { height: 3px; background: #F3F4F6; border-radius: 2px; margin-top: 10px; margin-left: 51px; overflow: hidden; cursor: pointer; }
    .prog-fill { height: 100%; background: linear-gradient(90deg, ${AC}, ${PR}); border-radius: 2px; transition: width 0.3s; }
    .add-btn { border: 1.5px dashed #E5E7EB; border-radius: 10px; padding: 11px 16px; display: flex; align-items: center; gap: 9px; cursor: pointer; color: #9CA3AF; font-size: 13.5px; font-family: inherit; background: none; width: 100%; margin-top: 4px; }
    .add-btn:hover { border-color: ${PR_LIGHT}; color: ${PR}; background: ${PR_BG}; }

    .sub-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 0.5px solid #F9FAFB; }
    .cb { width: 20px; height: 20px; min-width: 20px; border-radius: 6px; border: 1.5px solid #D1D5DB; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.15s; }
    .cb:hover { border-color: ${PR}; }
    .cb.done { background: linear-gradient(135deg, ${AC}, ${PR}); border-color: ${PR}; }
    .sub-t { flex: 1; font-size: 13.5px; color: #374151; }
    .sub-t.done { text-decoration: line-through; color: #9CA3AF; }
    .del-btn { background: none; border: none; cursor: pointer; color: #D1D5DB; padding: 2px; display: flex; }
    .del-btn:hover { color: #EF4444; }
    .dnd-hint { font-size: 11px; color: #9CA3AF; display: flex; align-items: center; gap: 4px; margin-bottom: 6px; }

    .sbs-search-w { position: relative; margin-bottom: 14px; }
    .sbs-search { width: 100%; padding: 8px 12px 8px 36px; border: 0.5px solid #E5E7EB; border-radius: 8px; font-size: 13.5px; outline: none; font-family: inherit; background: #fff; }
    .sbs-search:focus { border-color: ${PR_LIGHT}; box-shadow: 0 0 0 3px ${PR_BG}; }
    .si { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #9CA3AF; pointer-events: none; }
    .filters { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
    .filter-btn { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-family: inherit; cursor: pointer; border: 0.5px solid #E5E7EB; background: #fff; color: #6B7280; }
    .filter-btn.active { background: ${PR_BG}; color: ${PR}; border-color: ${PR_LIGHT}; font-weight: 500; }

    .sbs-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.38); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 16px; }
    .sbs-modal { background: #fff; border-radius: 14px; padding: 24px; width: 100%; max-width: 450px; max-height: 90vh; overflow-y: auto; }
    .modal-sm { max-width: 360px; }
    .field-label { font-size: 11px; font-weight: 500; color: #6B7280; text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: 5px; }
    .sbs-input { width: 100%; padding: 9px 12px; border: 0.5px solid #D1D5DB; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; }
    .sbs-input:focus { border-color: ${PR}; box-shadow: 0 0 0 3px ${PR_BG}; }
    .sbs-select { width: 100%; padding: 9px 12px; border: 0.5px solid #D1D5DB; border-radius: 8px; font-size: 13.5px; font-family: inherit; background: #fff; outline: none; }
    .toggle-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #F9FAFB; border-radius: 8px; cursor: pointer; }
    .toggle { width: 36px; height: 20px; border-radius: 10px; position: relative; flex-shrink: 0; transition: background 0.2s; }
    .toggle-th { width: 16px; height: 16px; border-radius: 50%; background: #fff; position: absolute; top: 2px; transition: left 0.2s; }
    .color-picker { display: flex; gap: 8px; flex-wrap: wrap; }
    .color-dot { width: 26px; height: 26px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; border: 2px solid transparent; }
    .color-dot.selected { border-color: #111827; }
    .reminder-btn { display: flex; align-items: center; gap: 6px; font-size: 12.5px; padding: 5px 10px; border-radius: 7px; border: 0.5px solid #E5E7EB; cursor: pointer; background: #fff; font-family: inherit; color: #6B7280; white-space: nowrap; }
    .reminder-btn.on { background: ${PR_BG}; color: ${PR}; border-color: ${PR_LIGHT}; }
    .empty { background: #fff; border: 0.5px solid #E5E7EB; border-radius: 11px; padding: 40px 20px; text-align: center; color: #9CA3AF; }
    .empty a { color: ${PR}; cursor: pointer; font-weight: 500; }

    .detail-actions { display: flex; gap: 6px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
    @media (max-width: 480px) { .detail-actions { width: 100%; margin-top: 10px; justify-content: flex-start; } .detail-head { flex-wrap: wrap; } }

    /* CALENDRIER */
    .cal-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .cal-title { font-size: 16px; font-weight: 600; color: #111827; }
    .cal-nav-btn { background: #fff; border: 0.5px solid #E5E7EB; border-radius: 7px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6B7280; }
    .cal-nav-btn:hover { background: ${PR_BG}; color: ${PR}; }
    .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
    .cal-dow { text-align: center; font-size: 11px; font-weight: 600; color: #9CA3AF; padding: 6px 0; }
    .cal-cell { min-height: 64px; background: #fff; border: 0.5px solid #E5E7EB; border-radius: 8px; padding: 5px; cursor: pointer; transition: border-color 0.15s; }
    .cal-cell:hover { border-color: ${PR_LIGHT}; }
    .cal-cell.empty { background: transparent; border-color: transparent; cursor: default; }
    .cal-cell.today { border-color: ${PR}; background: ${PR_BG}; }
    .cal-day { font-size: 11px; font-weight: 500; color: #374151; margin-bottom: 3px; }
    .cal-cell.today .cal-day { color: ${PR}; font-weight: 700; }
    .cal-task-pill { font-size: 9px; background: ${PR_BG}; color: ${PR}; border-radius: 3px; padding: 1px 3px; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cal-task-pill.urgent { background: #FEF2F2; color: #991B1B; }
    @media (max-width: 480px) { .cal-cell { min-height: 44px; padding: 3px; } .cal-task-pill { display: none; } .cal-day { font-size: 10px; } }

    /* ARCHIVES */
    .archive-row { background: #fff; border: 0.5px solid #E5E7EB; border-radius: 10px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; margin-bottom: 7px; }
    .archive-title { flex: 1; font-size: 14px; color: #6B7280; text-decoration: line-through; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* LOADING */
    .sbs-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: calc(100vh - 56px); gap: 16px; }
    .sbs-spinner { width: 36px; height: 36px; border: 3px solid ${PR_LIGHT}; border-top-color: ${PR}; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* BOTTOM NAV */
    .bottom-nav { display: none; }
    @media (max-width: 768px) {
      .bottom-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 0.5px solid #E5E7EB; z-index: 45; }
      .bottom-nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px 4px; font-size: 10px; color: #9CA3AF; border: none; background: none; cursor: pointer; gap: 3px; font-family: inherit; }
      .bottom-nav-btn.active { color: ${PR}; }
      .sbs-content { padding-bottom: 72px; }
    }
  `;

  if (loading) return (
    <div className="sbs">
      <style>{css}</style>
      <header className="sbs-header">
        <div className="sbs-logo">
          <div className="sbs-logo-icon"><Check size={16} color="#fff" strokeWidth={2.5} /></div>
          {logo ? <img src={logo} alt="Step by Step" style={{ height: 24 }} /> : <span className="sbs-logo-text">Step by Step</span>}
        </div>
      </header>
      <div className="sbs-loading">
        <div className="sbs-spinner" />
        <span style={{ fontSize: 14, color: '#9CA3AF' }}>Chargement de tes tâches...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="sbs">
      <style>{css}</style>
      <div className="sbs-loading">
        <AlertCircle size={32} color="#EF4444" />
        <span style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', maxWidth: 280 }}>
          Impossible de charger tes données. Vérifie ta connexion et réessaie.
        </span>
        <button className="btn-p" onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    </div>
  );

  return (
    <div className="sbs">
      <style>{css}</style>

      {showOnboarding && (
        <Onboarding
          onComplete={() => { localStorage.setItem('sbs_onboarded_' + user.uid, '1'); setShowOnboarding(false); }}
          onCreateProject={(proj) => createProject(proj)}
        />
      )}

      {/* HEADER */}
      <header className="sbs-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="sbs-icon-btn" id="menu-btn" onClick={() => setSidebarOpen(o => !o)} style={{ display: 'none' }} aria-label="Menu">
            <Menu size={18} />
          </button>
          <style>{`@media(max-width:768px){#menu-btn{display:flex!important}}`}</style>
          <div className="sbs-logo">
            <div className="sbs-logo-icon"><Check size={16} color="#fff" strokeWidth={2.5} /></div>
            {logo
              ? <img src={logo} alt="Step by Step" style={{ height: 24 }} id="logo-img" />
              : <span className="sbs-logo-text" id="logo-text">Step by Step</span>
            }
            <style>{`@media(max-width:400px){#logo-text,#logo-img{display:none!important}}`}</style>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button className="sbs-icon-btn" title="Se déconnecter" onClick={() => signOut(auth)}><LogOut size={16} /></button>
          <button className="sbs-icon-btn" title="Revoir l'intro" onClick={() => { localStorage.removeItem('sbs_onboarded_' + user.uid); setShowOnboarding(true); }}><Settings size={16} /></button>
        </div>
      </header>

      <div className={`sbs-overlay-bg${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <div className="sbs-body">
        {/* SIDEBAR */}
        <nav className={`sbs-sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="sbs-sl" style={{ marginTop: 0 }}>Navigation</div>
          <button className={`sbs-nav ${view === 'dashboard' ? 'active' : ''}`} onClick={() => navigate('dashboard')}>
            <LayoutDashboard size={16} /> Aujourd'hui {pending.length > 0 && <span className="sbs-badge">{pending.length}</span>}
          </button>
          <button className={`sbs-nav ${view === 'tasks' || view === 'detail' ? 'active' : ''}`} onClick={() => navigate('tasks')}>
            <ListChecks size={16} /> Toutes les tâches
          </button>
          <button className={`sbs-nav ${view === 'calendar' ? 'active' : ''}`} onClick={() => navigate('calendar')}>
            <Calendar size={16} /> Calendrier
          </button>
          <button className={`sbs-nav ${view === 'progress' ? 'active' : ''}`} onClick={() => navigate('progress')}>
            <TrendingUp size={16} /> Progression
          </button>
          <button className={`sbs-nav ${view === 'archive' ? 'active' : ''}`} onClick={() => navigate('archive')}>
            <Archive size={16} /> Archives {archivedTasks.length > 0 && <span className="sbs-badge gray">{archivedTasks.length}</span>}
          </button>
          {reminders.length > 0 && (
            <button className="sbs-nav" onClick={() => navigate('tasks')}>
              <Bell size={16} /> Rappels <span className="sbs-badge amber">{reminders.length}</span>
            </button>
          )}

          <div className="sbs-sl">Projets</div>
          <div className={`sbs-proj-row ${filterProject === 'tous' ? 'active' : ''}`} onClick={() => { setFilterProject('tous'); navigate('tasks'); }}>
            <Folder size={14} /> Tous les projets
          </div>
          {projects.map(p => (
            <div key={p.id} className={`sbs-proj-row ${filterProject === p.id ? 'active' : ''}`} onClick={() => { setFilterProject(p.id); navigate('tasks'); }}>
              <div className="sbs-proj-dot" style={{ background: p.color }} />
              <span style={{ flex: 1 }}>{p.name}</span>
              <button className="sbs-proj-edit" onClick={e => { e.stopPropagation(); setEditProjectId(p.id); setProjectForm({ name: p.name, color: p.color }); }}><Edit2 size={12} /></button>
            </div>
          ))}
          <button className="sbs-nav" style={{ color: PR }} onClick={() => { setProjectForm({ name: '', color: PR }); setShowNewProject(true); setSidebarOpen(false); }}>
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
              <div><div className="sbs-pt">Aujourd'hui</div><div className="sbs-ps">{today} · {pending.length} tâche{pending.length !== 1 ? 's' : ''} restante{pending.length !== 1 ? 's' : ''}</div></div>
              <button className="btn-p" onClick={openNew}><Plus size={15} /> Nouvelle</button>
            </div>
            {reminders.length > 0 && <div className="sbs-banner"><Bell size={16} color="#92400E" /><span><strong style={{ fontWeight: 600 }}>{reminders.length} rappel{reminders.length > 1 ? 's' : ''}</strong> — {reminders[0].title}</span></div>}
            {activeTasks.length > 0 && (
              <div className="sbs-stats">
                <div className="sbs-stat"><div className="sbs-sv g">{done.length}</div><div className="sbs-sl2">Terminées</div><div className="sbs-ssub">sur {activeTasks.length}</div></div>
                <div className="sbs-stat"><div className="sbs-sv">{pending.length}</div><div className="sbs-sl2">En cours</div></div>
                <div className="sbs-stat"><div className="sbs-sv g">{activeTasks.length ? Math.round(done.length / activeTasks.length * 100) : 0}%</div><div className="sbs-sl2">Complétion</div></div>
              </div>
            )}
            {activeTasks.length === 0
              ? <EmptyState onCreateTask={openNew} />
              : <>
                {pending.length > 0 && <><div className="sec-label">En cours</div><TaskListWithDnd taskList={pending} /></>}
                {done.length > 0 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div className="sec-label" style={{ marginBottom: 0 }}>Terminées</div>
                      <button className="btn-s" style={{ fontSize: 12, padding: '4px 10px', gap: 4 }} onClick={() => done.forEach(t => updateTask(t.id, { archived: true }))}><Archive size={12} /> Archiver</button>
                    </div>
                    <TaskListWithDnd taskList={done} />
                  </>
                )}
                <button className="add-btn" onClick={openNew}><Plus size={16} /> Ajouter une tâche...</button>
              </>
            }
          </>}

          {/* TÂCHES */}
          {view === 'tasks' && <>
            <div className="sbs-ch">
              <div><div className="sbs-pt">{filterProject === 'tous' ? 'Toutes les tâches' : getProject(filterProject)?.name || 'Tâches'}</div><div className="sbs-ps">{filtered.length} tâche{filtered.length !== 1 ? 's' : ''}</div></div>
              <button className="btn-p" onClick={openNew}><Plus size={15} /> Nouvelle</button>
            </div>
            <div className="sbs-search-w"><Search size={15} className="si" /><input className="sbs-search" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} /></div>
            <div className="filters">
              <button className={`filter-btn ${filterProject === 'tous' ? 'active' : ''}`} onClick={() => setFilterProject('tous')}>Tous</button>
              {projects.map(p => <button key={p.id} className={`filter-btn ${filterProject === p.id ? 'active' : ''}`} onClick={() => setFilterProject(p.id)} style={{ borderColor: filterProject === p.id ? p.color : undefined, background: filterProject === p.id ? p.color + '22' : undefined, color: filterProject === p.id ? p.color : undefined }}>{p.name}</button>)}
            </div>
            {activeTasks.length === 0
              ? <EmptyState onCreateTask={openNew} />
              : filtered.length === 0
                ? <div className="empty"><p>Aucune tâche dans ce projet.</p></div>
                : <TaskListWithDnd taskList={filtered} />
            }
          </>}

          {/* CALENDRIER */}
          {view === 'calendar' && <>
            <div className="sbs-ch"><div><div className="sbs-pt">Calendrier</div><div className="sbs-ps">Tâches par échéance</div></div><button className="btn-p" onClick={openNew}><Plus size={15} /></button></div>
            <div className="cal-nav">
              <button className="cal-nav-btn" onClick={() => setCalDate(new Date(calYear, calMonth - 1, 1))}><ChevronLeft size={16} /></button>
              <span className="cal-title">{MONTHS_FR[calMonth]} {calYear}</span>
              <button className="cal-nav-btn" onClick={() => setCalDate(new Date(calYear, calMonth + 1, 1))}><ChevronRight size={16} /></button>
            </div>
            <div className="cal-grid">
              {DAYS_FR.map(d => <div key={d} className="cal-dow">{d}</div>)}
              {calCells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} className="cal-cell empty" />;
                const isToday = day === todayD.getDate() && calMonth === todayD.getMonth() && calYear === todayD.getFullYear();
                const dayTasks = tasksByDay[day] || [];
                return (
                  <div key={day} className={`cal-cell${isToday ? ' today' : ''}`}>
                    <div className="cal-day">{day}</div>
                    {dayTasks.slice(0, 2).map(t => <div key={t.id} className={`cal-task-pill${t.priority === 'high' ? ' urgent' : ''}`} onClick={() => { setSelectedId(t.id); setView('detail'); }} title={t.title}>{t.title}</div>)}
                    {dayTasks.length > 2 && <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 1 }}>+{dayTasks.length - 2}</div>}
                  </div>
                );
              })}
            </div>
          </>}

          {/* DETAIL */}
          {view === 'detail' && selected && (() => {
            const pct = getPct(selected); const pri = PRIORITY[selected.priority]; const due = formatDue(selected.dueDate); const proj = getProject(selected.projectId);
            const isEditing = !!editingTask;
            return <>
              <button className="btn-s" style={{ marginBottom: 20 }} onClick={() => { setView('tasks'); setEditingTask(null); }}><ChevronLeft size={15} /> Retour</button>
              <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: 12, padding: '18px 18px' }}>
                <div className="detail-head" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ flex: 1, marginRight: 10, minWidth: 0 }}>
                    {isEditing
                      ? <input className="sbs-input" style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }} value={editingTask.title} onChange={e => setEditingTask(t => ({ ...t, title: e.target.value }))} autoFocus />
                      : <h2 style={{ fontSize: 17, fontWeight: 600, color: '#111827', margin: '0 0 8px', wordBreak: 'break-word' }}>{selected.title}</h2>
                    }
                    {isEditing ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                        <select className="sbs-select" value={editingTask.priority} onChange={e => setEditingTask(t => ({ ...t, priority: e.target.value }))}><option value="high">Urgent</option><option value="medium">Moyen</option><option value="low">Faible</option></select>
                        <select className="sbs-select" value={editingTask.projectId || ''} onChange={e => setEditingTask(t => ({ ...t, projectId: e.target.value }))}><option value="">Sans projet</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
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
                  <div className="detail-actions">
                    {isEditing ? (
                      <><button className="btn-p" style={{ padding: '5px 10px', fontSize: 13 }} onClick={handleSaveEdit}><Save size={13} /> Enregistrer</button><button className="btn-s" style={{ padding: '5px 9px' }} onClick={() => setEditingTask(null)}><X size={14} /></button></>
                    ) : (
                      <>
                        <button className={`reminder-btn${selected.reminder ? ' on' : ''}`} onClick={() => updateTask(selected.id, { reminder: !selected.reminder })}>{selected.reminder ? <Bell size={13} /> : <BellOff size={13} />}</button>
                        <button className="btn-s" style={{ padding: '5px 9px' }} onClick={() => setEditingTask({ ...selected, dueDate: selected.dueDate ? (selected.dueDate?.toDate?.() ? selected.dueDate.toDate().toISOString().slice(0,16) : selected.dueDate) : '' })}><Edit2 size={14} /></button>
                        {selected.archived
                          ? <button className="btn-s" style={{ padding: '5px 9px', color: PR }} onClick={() => updateTask(selected.id, { archived: false })}><RotateCcw size={14} /></button>
                          : <button className="btn-s" style={{ padding: '5px 9px' }} onClick={() => { updateTask(selected.id, { archived: true }); setView('tasks'); }}><Archive size={14} /></button>
                        }
                        <button className="btn-danger" onClick={() => { deleteTask(selected.id); setView('tasks'); }}><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                </div>

                {selected.subtasks?.length > 0 && <>
                  <div style={{ height: 5, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden', marginBottom: 5 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${AC}, ${PR})`, borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
                    <span>{selected.subtasks.filter(s => s.done).length}/{selected.subtasks.length} étapes</span>
                    <span style={{ color: pct === 100 ? PR : '#9CA3AF', fontWeight: pct === 100 ? 600 : 400 }}>{pct}%{pct === 100 ? ' — Terminé !' : ''}</span>
                  </div>
                </>}

                <div className="sec-label" style={{ marginBottom: 4 }}>Sous-tâches</div>
                {selected.subtasks?.length > 1 && <div className="dnd-hint"><GripVertical size={11} /> Glisse pour réorganiser</div>}

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleSubDragEnd(selected.id, e)}>
                  <SortableContext items={selected.subtasks?.map(s => s.id) || []} strategy={verticalListSortingStrategy}>
                    {selected.subtasks?.map(sub => (
                      <SortableSubtask key={sub.id} sub={sub} taskId={selected.id}
                        onToggle={(tid, sid) => updateSubtask(tid, sid, { done: !sub.done })}
                        onDelete={deleteSubtask} />
                    ))}
                  </SortableContext>
                </DndContext>

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <input className="sbs-input" placeholder="Ajouter une étape..." value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && newSubtask.trim()) { addSubtask(selected.id, newSubtask); setNewSubtask(''); } }} />
                  <button className="btn-p" onClick={() => { if (newSubtask.trim()) { addSubtask(selected.id, newSubtask); setNewSubtask(''); } }} style={{ padding: '8px 12px' }}><Plus size={15} /></button>
                </div>
              </div>
            </>;
          })()}

          {/* PROGRESSION */}
          {view === 'progress' && <>
            <div className="sbs-ch"><div><div className="sbs-pt">Progression</div><div className="sbs-ps">Vue globale</div></div></div>
            <div className="sbs-stats">
              <div className="sbs-stat"><div className="sbs-sv g">{done.length}</div><div className="sbs-sl2">Terminées</div></div>
              <div className="sbs-stat"><div className="sbs-sv">{activeTasks.filter(t => { const p = getPct(t); return p > 0 && p < 100; }).length}</div><div className="sbs-sl2">En cours</div></div>
              <div className="sbs-stat"><div className="sbs-sv">{tasks.reduce((a, t) => a + (t.subtasks?.filter(s => s.done).length || 0), 0)}</div><div className="sbs-sl2">Étapes</div></div>
            </div>
            {projects.map(proj => {
              const ptasks = activeTasks.filter(t => t.projectId === proj.id);
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
                            <span style={{ fontSize: 12, fontWeight: 600, color: pct === 100 ? PR : '#9CA3AF' }}>{pct}%</span>
                          </div>
                          <div style={{ height: 3, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${AC}, ${proj.color})`, borderRadius: 2 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {activeTasks.length === 0 && <div className="empty">Aucune tâche pour le moment.</div>}
          </>}

          {/* ARCHIVES */}
          {view === 'archive' && <>
            <div className="sbs-ch"><div><div className="sbs-pt">Archives</div><div className="sbs-ps">{archivedTasks.length} tâche{archivedTasks.length !== 1 ? 's' : ''}</div></div></div>
            {archivedTasks.length === 0
              ? <div className="empty">Aucune tâche archivée.</div>
              : archivedTasks.map(t => (
                <div key={t.id} className="archive-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="archive-title">{t.title}</div>
                    <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 3 }}>{getProject(t.projectId)?.name || 'Sans projet'}</div>
                  </div>
                  <button className="btn-s" style={{ padding: '5px 10px', fontSize: 12, gap: 4, color: PR, flexShrink: 0 }} onClick={() => updateTask(t.id, { archived: false })}><RotateCcw size={13} /> Restaurer</button>
                  <button className="btn-danger" style={{ padding: '5px 9px', flexShrink: 0 }} onClick={() => deleteTask(t.id)}><Trash2 size={14} /></button>
                </div>
              ))
            }
          </>}

        </main>
      </div>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        <button className={`bottom-nav-btn ${view === 'dashboard' ? 'active' : ''}`} onClick={() => navigate('dashboard')}><LayoutDashboard size={20} />Aujourd'hui</button>
        <button className={`bottom-nav-btn ${view === 'tasks' || view === 'detail' ? 'active' : ''}`} onClick={() => navigate('tasks')}><ListChecks size={20} />Tâches</button>
        <button className="bottom-nav-btn" onClick={openNew} style={{ color: PR }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${AC}, ${PR})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: -4 }}><Plus size={20} color="#fff" /></div>
        </button>
        <button className={`bottom-nav-btn ${view === 'calendar' ? 'active' : ''}`} onClick={() => navigate('calendar')}><Calendar size={20} />Calendrier</button>
        <button className={`bottom-nav-btn ${view === 'progress' ? 'active' : ''}`} onClick={() => navigate('progress')}><TrendingUp size={20} />Stats</button>
      </nav>

      {/* MODALS */}
      {showNew && (
        <div className="sbs-overlay" onClick={() => setShowNew(false)}>
          <div className="sbs-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 17, fontWeight: 600 }}>Nouvelle tâche</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }} onClick={() => setShowNew(false)}><X size={18} /></button>
            </div>
            <div style={{ marginBottom: 13 }}><label className="field-label">Titre</label><input className="sbs-input" placeholder="Titre..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleCreateTask()} autoFocus /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 13 }}>
              <div><label className="field-label">Priorité</label><select className="sbs-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}><option value="high">Urgent</option><option value="medium">Moyen</option><option value="low">Faible</option></select></div>
              <div><label className="field-label">Projet</label><select className="sbs-select" value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}><option value="">Sans projet</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            </div>
            <div style={{ marginBottom: 13 }}><label className="field-label">Échéance</label><input type="datetime-local" className="sbs-input" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
            <div className="toggle-row" style={{ marginBottom: 20 }} onClick={() => setForm(f => ({ ...f, reminder: !f.reminder }))}>
              <div className="toggle" style={{ background: form.reminder ? PR : '#D1D5DB' }}><div className="toggle-th" style={{ left: form.reminder ? 18 : 2 }} /></div>
              <span style={{ fontSize: 13, color: '#374151' }}>Rappel 30 min avant</span>
            </div>
            <button className="btn-p" style={{ width: '100%', justifyContent: 'center', padding: 11, fontSize: 14 }} onClick={handleCreateTask} disabled={!form.title.trim()}>Créer la tâche</button>
          </div>
        </div>
      )}

      {showNewProject && (
        <div className="sbs-overlay" onClick={() => setShowNewProject(false)}>
          <div className="sbs-modal modal-sm" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 17, fontWeight: 600 }}>Nouveau projet</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }} onClick={() => setShowNewProject(false)}><X size={18} /></button>
            </div>
            <div style={{ marginBottom: 14 }}><label className="field-label">Nom</label><input className="sbs-input" placeholder="Ex : Freelance, Perso..." value={projectForm.name} onChange={e => setProjectForm(f => ({ ...f, name: e.target.value }))} autoFocus /></div>
            <div style={{ marginBottom: 20 }}><label className="field-label">Couleur</label><div className="color-picker">{PROJECT_COLORS.map(c => <div key={c} className={`color-dot ${projectForm.color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setProjectForm(f => ({ ...f, color: c }))}>{projectForm.color === c && <Check size={13} color="#fff" />}</div>)}</div></div>
            <button className="btn-p" style={{ width: '100%', justifyContent: 'center', padding: 11 }} onClick={() => { if (!projectForm.name.trim()) return; createProject({ name: projectForm.name.trim(), color: projectForm.color }); setProjectForm({ name: '', color: PR }); setShowNewProject(false); }} disabled={!projectForm.name.trim()}>Créer le projet</button>
          </div>
        </div>
      )}

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
              <div style={{ marginBottom: 14 }}><label className="field-label">Nom</label><input className="sbs-input" value={projectForm.name} onChange={e => setProjectForm(f => ({ ...f, name: e.target.value }))} autoFocus /></div>
              <div style={{ marginBottom: 20 }}><label className="field-label">Couleur</label><div className="color-picker">{PROJECT_COLORS.map(c => <div key={c} className={`color-dot ${projectForm.color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setProjectForm(f => ({ ...f, color: c }))}>{projectForm.color === c && <Check size={13} color="#fff" />}</div>)}</div></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-p" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { updateProject(editProjectId, { name: projectForm.name, color: projectForm.color }); setEditProjectId(null); }}>Enregistrer</button>
                <button className="btn-danger" onClick={() => { deleteProject(editProjectId); setEditProjectId(null); }}><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function StepByStepApp() {
  const [user, setUser] = useState(undefined);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, u => setUser(u || null));
  }, []);

  // Charge le logo depuis /logo.svg ou /logo.png
  useEffect(() => {
    const tryLogo = async () => {
      for (const ext of ['svg', 'png', 'jpg', 'webp']) {
        try {
          const res = await fetch(`/logo.${ext}`);
          if (res.ok) { setLogo(`/logo.${ext}`); break; }
        } catch {}
      }
    };
    tryLogo();
  }, []);

  if (user === undefined) return (
    <div style={{ minHeight: '100vh', background: '#F8FAFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 36, height: 36, border: `3px solid #b1d5ff`, borderTopColor: '#0091ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <span style={{ fontSize: 14, color: '#9CA3AF' }}>Chargement...</span>
      </div>
    </div>
  );

  if (!user) return <AuthScreen logo={logo} />;
  return <AppShell user={user} logo={logo} />;
}
