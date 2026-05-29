import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Flag, Tag, Clock, Calendar, Bell, FileText, Zap } from 'lucide-react';

const WIZARD_CSS = `
  .wz-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.32); z-index:50; display:flex; align-items:flex-end; justify-content:center; padding:0; }
  @media(min-width:600px){ .wz-backdrop { align-items:center; padding:20px; } }
  .wz-panel { background:#fff; border-radius:16px 16px 0 0; padding:28px 24px 32px; width:100%; max-width:480px; max-height:92vh; overflow-y:auto; box-shadow:0 -4px 32px rgba(0,0,0,.1); }
  @media(min-width:600px){ .wz-panel { border-radius:14px; } }
  .wz-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
  .wz-title { font-size:16px; font-weight:600; color:#1a1a1a; }
  .wz-steps { display:flex; align-items:center; gap:6px; margin-bottom:24px; }
  .wz-step-dot { width:24px; height:24px; border-radius:50%; font-size:11px; font-weight:600; display:flex; align-items:center; justify-content:center; transition:all .2s; flex-shrink:0; }
  .wz-step-dot.done { background:#C7552A; color:#fff; }
  .wz-step-dot.active { background:#FDF0EB; color:#C7552A; border:1.5px solid #C7552A; }
  .wz-step-dot.pending { background:#F2EDE8; color:#BBB; }
  .wz-step-line { flex:1; height:2px; background:#F2EDE8; border-radius:2px; }
  .wz-step-line.done { background:#C7552A; }
  .wz-step-label { font-size:11px; color:#AAA; margin-top:6px; text-align:center; font-weight:500; }
  .wz-body { min-height:200px; }
  .wz-field { margin-bottom:16px; }
  .wz-label { font-size:12.5px; font-weight:500; color:#666; margin-bottom:7px; display:flex; align-items:center; gap:5px; }
  .wz-label svg { color:#AAA; }
  .wz-input { width:100%; padding:10px 12px; border:1.5px solid #DDD8D0; border-radius:8px; font-size:14px; color:#1a1a1a; background:#fff; outline:none; transition:border-color .15s; font-family:inherit; }
  .wz-input:focus { border-color:#C7552A; }
  .wz-textarea { width:100%; padding:10px 12px; border:1.5px solid #DDD8D0; border-radius:8px; font-size:14px; color:#1a1a1a; background:#fff; outline:none; resize:none; font-family:inherit; transition:border-color .15s; min-height:80px; }
  .wz-textarea:focus { border-color:#C7552A; }
  .priority-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
  .priority-btn { padding:10px 8px; border-radius:8px; border:1.5px solid #EDE8E0; background:#fff; cursor:pointer; font-size:13px; font-weight:500; transition:all .15s; font-family:inherit; display:flex; flex-direction:column; align-items:center; gap:4px; color:#666; }
  .priority-btn:hover { border-color:#CCC; }
  .priority-btn.sel-high { border-color:#D94040; background:#FFF0F0; color:#D94040; }
  .priority-btn.sel-medium { border-color:#D97B2A; background:#FFF5EC; color:#D97B2A; }
  .priority-btn.sel-low { border-color:#5A9E6F; background:#EAF4EE; color:#5A9E6F; }
  .priority-dot { width:8px; height:8px; border-radius:50%; }
  .dot-high { background:#D94040; }
  .dot-medium { background:#D97B2A; }
  .dot-low { background:#5A9E6F; }
  .tags-wrap { display:flex; flex-wrap:wrap; gap:6px; }
  .tag-btn { padding:5px 12px; border-radius:20px; border:1.5px solid #EDE8E0; background:#fff; font-size:13px; font-weight:500; color:#777; cursor:pointer; transition:all .15s; font-family:inherit; }
  .tag-btn:hover { border-color:#CCC; }
  .tag-btn.sel { background:#FDF0EB; border-color:#C7552A; color:#C7552A; }
  .duration-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; }
  .dur-btn { padding:8px 4px; border-radius:8px; border:1.5px solid #EDE8E0; background:#fff; font-size:12.5px; font-weight:500; color:#777; cursor:pointer; transition:all .15s; font-family:inherit; text-align:center; }
  .dur-btn:hover { border-color:#CCC; }
  .dur-btn.sel { background:#FDF0EB; border-color:#C7552A; color:#C7552A; }
  .reminder-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:6px; }
  .rem-btn { padding:9px 10px; border-radius:8px; border:1.5px solid #EDE8E0; background:#fff; font-size:13px; font-weight:500; color:#777; cursor:pointer; transition:all .15s; font-family:inherit; display:flex; align-items:center; gap:6px; }
  .rem-btn:hover { border-color:#CCC; }
  .rem-btn.sel { background:#FDF0EB; border-color:#C7552A; color:#C7552A; }
  .wz-footer { display:flex; gap:8px; margin-top:24px; padding-top:16px; border-top:1px solid #F2EDE8; }
  .wz-btn-back { padding:10px 18px; border-radius:8px; border:1.5px solid #DDD8D0; background:transparent; color:#666; font-size:14px; font-weight:500; cursor:pointer; font-family:inherit; display:flex; align-items:center; gap:5px; transition:border-color .15s; }
  .wz-btn-back:hover { border-color:#BBB; }
  .wz-btn-next { flex:1; padding:11px; border-radius:8px; background:#C7552A; color:#fff; border:none; font-size:14px; font-weight:500; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:6px; transition:background .15s; }
  .wz-btn-next:hover { background:#B34D26; }
  .wz-btn-next:disabled { background:#EAE5DE; color:#AAA; cursor:not-allowed; }
  .wz-summary { background:#FAF8F5; border-radius:10px; padding:14px 16px; }
  .wz-summary-row { display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid #F2EDE8; font-size:13.5px; color:#444; }
  .wz-summary-row:last-child { border-bottom:none; }
  .wz-summary-row svg { color:#C7552A; flex-shrink:0; }
  .wz-summary-key { color:#AAA; font-size:12px; min-width:90px; }
`;

const TAGS = ['Travail', 'Personnel', 'Études', 'Santé', 'Projet', 'Urgent'];
const DURATIONS = ['15 min', '30 min', '1 h', '2 h', 'Demi-journée', 'Journée', 'Plusieurs jours', 'Libre'];
const REMINDERS = ['La veille', '2h avant', '1h avant', '30 min avant'];

const priorityConfig = {
  high:   { label: 'Haute',   dot: 'dot-high',   sel: 'sel-high',   icon: '🔴' },
  medium: { label: 'Moyenne', dot: 'dot-medium',  sel: 'sel-medium', icon: '🟠' },
  low:    { label: 'Basse',   dot: 'dot-low',     sel: 'sel-low',    icon: '🟢' },
};

const STEP_LABELS = ['Essentiel', 'Organisation', 'Planification'];

export default function TaskCreationWizard({ onClose, onCreate }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '', notes: '',
    priority: '', tags: [],
    duration: '', reminder: '',
    dueDate: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleTag = (t) => set('tags', form.tags.includes(t) ? form.tags.filter(x => x !== t) : [...form.tags, t]);

  const canNext = step === 0 ? form.title.trim().length > 0 : true;

  const handleNext = () => { if (step < 2) setStep(s => s + 1); else handleCreate(); };
  const handleCreate = () => {
    if (!form.title.trim()) return;
    onCreate(form);
    onClose();
  };

  const formatDate = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <>
      <style>{WIZARD_CSS}</style>
      <div className="wz-backdrop" onClick={onClose}>
        <div className="wz-panel" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="wz-header">
            <span className="wz-title">Nouvelle tâche</span>
            <button style={{width:'32px',height:'32px',border:'none',background:'transparent',borderRadius:'7px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#AAA'}} onClick={onClose}>
              <X size={17}/>
            </button>
          </div>

          {/* Steps indicator */}
          <div>
            <div className="wz-steps">
              {STEP_LABELS.map((_, i) => (
                <React.Fragment key={i}>
                  <div className={`wz-step-dot ${i < step ? 'done' : i === step ? 'active' : 'pending'}`}>
                    {i < step ? <Check size={12}/> : i + 1}
                  </div>
                  {i < 2 && <div className={`wz-step-line${i < step ? ' done' : ''}`}/>}
                </React.Fragment>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px',marginBottom:'22px',marginTop:'-8px'}}>
              {STEP_LABELS.map((l, i) => (
                <div key={i} className="wz-step-label" style={{color: i === step ? '#C7552A' : '#CCC'}}>{l}</div>
              ))}
            </div>
          </div>

          {/* Step 1 — Essentiel */}
          {step === 0 && (
            <div className="wz-body">
              <div className="wz-field">
                <label className="wz-label"><Zap size={13}/>Titre de la tâche <span style={{color:'#C7552A'}}>*</span></label>
                <input className="wz-input" autoFocus type="text" value={form.title}
                  onChange={e => set('title', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && canNext && handleNext()}
                  placeholder="Ex : Préparer la présentation client…"/>
              </div>
              <div className="wz-field">
                <label className="wz-label"><FileText size={13}/>Notes & contexte</label>
                <textarea className="wz-textarea" value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="Ajoute du contexte, des ressources utiles, des contraintes…"/>
              </div>
            </div>
          )}

          {/* Step 2 — Organisation */}
          {step === 1 && (
            <div className="wz-body">
              <div className="wz-field">
                <label className="wz-label"><Flag size={13}/>Priorité</label>
                <div className="priority-grid">
                  {Object.entries(priorityConfig).map(([k, v]) => (
                    <button key={k} className={`priority-btn${form.priority === k ? ' ' + v.sel : ''}`}
                      onClick={() => set('priority', form.priority === k ? '' : k)}>
                      <div className={`priority-dot ${v.dot}`}/>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="wz-field">
                <label className="wz-label"><Tag size={13}/>Catégorie</label>
                <div className="tags-wrap">
                  {TAGS.map(t => (
                    <button key={t} className={`tag-btn${form.tags.includes(t) ? ' sel' : ''}`} onClick={() => toggleTag(t)}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="wz-field">
                <label className="wz-label"><Clock size={13}/>Durée estimée</label>
                <div className="duration-grid">
                  {DURATIONS.map(d => (
                    <button key={d} className={`dur-btn${form.duration === d ? ' sel' : ''}`} onClick={() => set('duration', form.duration === d ? '' : d)}>{d}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Planification */}
          {step === 2 && (
            <div className="wz-body">
              <div className="wz-field">
                <label className="wz-label"><Calendar size={13}/>Date d'échéance</label>
                <input className="wz-input" type="date" value={form.dueDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => set('dueDate', e.target.value)}/>
              </div>

              <div className="wz-field">
                <label className="wz-label"><Bell size={13}/>Rappel</label>
                <div className="reminder-grid">
                  {REMINDERS.map(r => (
                    <button key={r} className={`rem-btn${form.reminder === r ? ' sel' : ''}`} onClick={() => set('reminder', form.reminder === r ? '' : r)}>
                      <Bell size={13}/>{r}
                    </button>
                  ))}
                </div>
                {!form.dueDate && form.reminder && (
                  <p style={{fontSize:'12px',color:'#E08050',marginTop:'7px'}}>⚠ Ajoute une date d'échéance pour activer le rappel.</p>
                )}
              </div>

              {/* Récap */}
              <div style={{marginTop:'4px'}}>
                <div style={{fontSize:'12px',fontWeight:600,color:'#BBB',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'10px'}}>Récapitulatif</div>
                <div className="wz-summary">
                  <div className="wz-summary-row"><Zap size={13}/><span className="wz-summary-key">Tâche</span><span style={{fontWeight:500}}>{form.title}</span></div>
                  {form.priority && <div className="wz-summary-row"><Flag size={13}/><span className="wz-summary-key">Priorité</span>{priorityConfig[form.priority].label}</div>}
                  {form.tags.length > 0 && <div className="wz-summary-row"><Tag size={13}/><span className="wz-summary-key">Tags</span>{form.tags.join(', ')}</div>}
                  {form.duration && <div className="wz-summary-row"><Clock size={13}/><span className="wz-summary-key">Durée</span>{form.duration}</div>}
                  {form.dueDate && <div className="wz-summary-row"><Calendar size={13}/><span className="wz-summary-key">Échéance</span>{formatDate(form.dueDate)}</div>}
                  {form.reminder && <div className="wz-summary-row"><Bell size={13}/><span className="wz-summary-key">Rappel</span>{form.reminder}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="wz-footer">
            {step > 0
              ? <button className="wz-btn-back" onClick={() => setStep(s => s - 1)}><ChevronLeft size={15}/>Retour</button>
              : <button className="wz-btn-back" onClick={onClose}>Annuler</button>
            }
            <button className="wz-btn-next" onClick={handleNext} disabled={!canNext}>
              {step < 2 ? <><span>Suivant</span><ChevronRight size={15}/></> : <><Check size={15}/><span>Créer la tâche</span></>}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
