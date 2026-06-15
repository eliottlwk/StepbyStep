import React, { useState } from 'react';
import { Check, ChevronRight, X, Folder, ListChecks, Bell } from 'lucide-react';

const EM = '#059669';
const EM_LIGHT = '#D1FAE5';
const EM_DARK = '#065F46';
const EM_MID = '#6EE7B7';

const PROJECT_COLORS = ['#059669','#2563EB','#8B5CF6','#F59E0B','#EF4444','#EC4899','#0891B2','#64748B'];

const STEPS = [
  {
    icon: <Check size={28} color="#fff" strokeWidth={2.5} />,
    iconBg: EM,
    title: 'Bienvenue sur Step by Step',
    description: 'Transforme tes grands objectifs en petites étapes actionnables. Avance à ton rythme, sans te noyer.',
    visual: 'intro',
  },
  {
    icon: <Folder size={28} color="#fff" strokeWidth={2} />,
    iconBg: '#2563EB',
    title: 'Organise par projets',
    description: 'Regroupe tes tâches dans des projets colorés. Crée-en un maintenant pour commencer.',
    visual: 'project',
  },
  {
    icon: <ListChecks size={28} color="#fff" strokeWidth={2} />,
    iconBg: '#8B5CF6',
    title: 'Découpe, coche, avance',
    description: 'Chaque tâche se divise en sous-étapes. Coche-les une par une et vois ta progression grimper.',
    visual: 'task',
  },
  {
    icon: <Bell size={28} color="#fff" strokeWidth={2} />,
    iconBg: '#F59E0B',
    title: 'Ne rate rien',
    description: 'Active des rappels sur tes tâches importantes. L\'app te notifie 30 min avant l\'échéance.',
    visual: 'notif',
  },
];

export default function Onboarding({ onComplete, onCreateProject }) {
  const [step, setStep] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [projectColor, setProjectColor] = useState(EM);
  const [projectCreated, setProjectCreated] = useState(false);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const handleNext = () => {
    if (step === 1 && projectName.trim() && !projectCreated) {
      onCreateProject({ name: projectName.trim(), color: projectColor });
      setProjectCreated(true);
    }
    if (isLast) { onComplete(); return; }
    setStep(s => s + 1);
  };

  const canNext = step === 1 ? (projectName.trim().length > 0 || projectCreated) : true;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .ob-wrap { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; font-family: 'Inter', -apple-system, sans-serif; }
    .ob-card { background: #fff; border-radius: 20px; width: 100%; max-width: 480px; overflow: hidden; }
    .ob-top { padding: 32px 32px 24px; }
    .ob-skip { position: absolute; top: 20px; right: 20px; background: none; border: none; cursor: pointer; color: #9CA3AF; display: flex; align-items: center; gap: 4px; font-size: 13px; font-family: inherit; }
    .ob-skip:hover { color: #6B7280; }
    .ob-icon-wrap { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
    .ob-title { font-size: 22px; font-weight: 600; color: #111827; margin-bottom: 10px; line-height: 1.3; }
    .ob-desc { font-size: 15px; color: #6B7280; line-height: 1.6; }
    .ob-visual { padding: 0 32px 24px; }
    .ob-bottom { padding: 20px 32px 28px; border-top: 0.5px solid #F3F4F6; display: flex; align-items: center; justify-content: space-between; }
    .ob-dots { display: flex; gap: 6px; }
    .ob-dot { height: 6px; border-radius: 3px; background: #E5E7EB; transition: all 0.2s; }
    .ob-dot.active { background: ${EM}; width: 20px; }
    .ob-dot:not(.active) { width: 6px; }
    .btn-p { background: ${EM}; color: #fff; border: none; border-radius: 10px; padding: 11px 22px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: inherit; }
    .btn-p:hover { background: ${EM_DARK}; }
    .btn-p:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-ghost { background: none; border: none; cursor: pointer; color: #9CA3AF; font-size: 14px; font-family: inherit; padding: 11px 0; }
    .btn-ghost:hover { color: #6B7280; }
    .field-label { font-size: 11px; font-weight: 500; color: #6B7280; text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: 6px; }
    .ob-input { width: 100%; padding: 10px 13px; border: 0.5px solid #D1D5DB; border-radius: 9px; font-size: 14px; font-family: inherit; outline: none; }
    .ob-input:focus { border-color: ${EM}; }
    .color-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
    .color-dot { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; border: 2.5px solid transparent; transition: border-color 0.15s; }
    .color-dot.sel { border-color: #111827; }
    .ob-preview { background: #F8FAF9; border-radius: 10px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; margin-top: 14px; }
    .ob-preview-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .ob-preview-name { font-size: 13.5px; font-weight: 500; color: #111827; }
  `;

  return (
    <div className="ob-wrap">
      <style>{css}</style>
      <div className="ob-card" style={{ position: 'relative' }}>
        <button className="ob-skip" onClick={onComplete}><X size={14} /> Passer</button>

        <div className="ob-top">
          <div className="ob-icon-wrap" style={{ background: current.iconBg }}>
            {current.icon}
          </div>
          <div className="ob-title">{current.title}</div>
          <div className="ob-desc">{current.description}</div>
        </div>

        {/* VISUELS PAR ÉTAPE */}
        <div className="ob-visual">

          {/* INTRO — mini aperçu de l'UI */}
          {current.visual === 'intro' && (
            <div style={{ background: '#F8FAF9', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { title: 'Préparer l\'oral CDA', pct: 60, color: '#8B5CF6' },
                { title: 'Refonte Step by Step', pct: 30, color: EM },
                { title: 'Landing page Elevia', pct: 0, color: '#2563EB' },
              ].map((item, i) => (
                <div key={i} style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: 9, padding: '10px 13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{item.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: item.pct > 0 ? item.color : '#9CA3AF' }}>{item.pct}%</span>
                  </div>
                  <div style={{ height: 3, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${item.pct}%`, background: item.color, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PROJECT — créer un projet */}
          {current.visual === 'project' && (
            <div>
              <label className="field-label">Nom du projet</label>
              <input className="ob-input" placeholder="Ex : Travail, Perso, École..." value={projectName}
                onChange={e => { setProjectName(e.target.value); setProjectCreated(false); }}
                onKeyDown={e => e.key === 'Enter' && canNext && handleNext()}
                autoFocus={step === 1} />
              <label className="field-label" style={{ marginTop: 14 }}>Couleur</label>
              <div className="color-row">
                {PROJECT_COLORS.map(c => (
                  <div key={c} className={`color-dot ${projectColor === c ? 'sel' : ''}`} style={{ background: c }}
                    onClick={() => setProjectColor(c)}>
                    {projectColor === c && <Check size={13} color="#fff" />}
                  </div>
                ))}
              </div>
              {projectName.trim() && (
                <div className="ob-preview">
                  <div className="ob-preview-dot" style={{ background: projectColor }} />
                  <span className="ob-preview-name">{projectName}</span>
                  {projectCreated && <span style={{ marginLeft: 'auto', fontSize: 12, color: EM, fontWeight: 500 }}>✓ Créé</span>}
                </div>
              )}
            </div>
          )}

          {/* TASK — aperçu sous-tâches */}
          {current.visual === 'task' && (
            <div style={{ background: '#F8FAF9', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Exemple</div>
              <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: 9, padding: '12px 14px' }}>
                <div style={{ fontWeight: 500, fontSize: 14, color: '#111827', marginBottom: 10 }}>Préparer mon exposé</div>
                {[
                  { label: 'Choisir le sujet', done: true },
                  { label: 'Faire les recherches', done: true },
                  { label: 'Rédiger le plan', done: false },
                  { label: 'Créer les slides', done: false },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 0', borderBottom: i < 3 ? '0.5px solid #F9FAFB' : 'none' }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, background: s.done ? EM : '#fff', border: `1.5px solid ${s.done ? EM : '#D1D5DB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {s.done && <Check size={11} color="#fff" />}
                    </div>
                    <span style={{ fontSize: 13, color: s.done ? '#9CA3AF' : '#374151', textDecoration: s.done ? 'line-through' : 'none' }}>{s.label}</span>
                  </div>
                ))}
                <div style={{ height: 3, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden', marginTop: 10 }}>
                  <div style={{ height: '100%', width: '50%', background: EM, borderRadius: 2 }} />
                </div>
              </div>
            </div>
          )}

          {/* NOTIF */}
          {current.visual === 'notif' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: EM_LIGHT, border: `0.5px solid ${EM_MID}`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: EM, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bell size={18} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: EM_DARK }}>Step by Step</div>
                  <div style={{ fontSize: 12, color: EM_DARK, opacity: 0.8, marginTop: 1 }}>Rappel : Préparer mon exposé — dans 30 min</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>Active les rappels sur chaque tâche depuis son détail.</div>
            </div>
          )}
        </div>

        <div className="ob-bottom">
          <div className="ob-dots">
            {STEPS.map((_, i) => <div key={i} className={`ob-dot ${i === step ? 'active' : ''}`} />)}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {step > 0 && (
              <button className="btn-ghost" onClick={() => setStep(s => s - 1)}>Retour</button>
            )}
            <button className="btn-p" onClick={handleNext} disabled={!canNext}>
              {isLast ? 'C\'est parti' : step === 1 && !projectCreated && projectName.trim() ? 'Créer et continuer' : 'Suivant'}
              {!isLast && <ChevronRight size={16} />}
              {isLast && <Check size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
