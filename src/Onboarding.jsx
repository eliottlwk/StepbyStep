import React, { useState } from 'react';
import { Check, ChevronRight, X, Folder, ListChecks, Bell } from 'lucide-react';

const PR      = '#0091ff';
const PR_LIGHT= '#b1d5ff';
const PR_DARK = '#0066cc';
const PR_BG   = '#f0f7ff';
const AC      = '#4e3fd5';

const PROJECT_COLORS = [PR, AC, '#059669','#F59E0B','#EF4444','#EC4899','#0891B2','#64748B'];

const STEPS = [
  {
    iconBg: `linear-gradient(135deg, ${AC}, ${PR})`,
    icon: <Check size={28} color="#fff" strokeWidth={2.5} />,
    label: 'Bienvenue',
    title: 'Bienvenue sur Step by Step',
    description: 'Transforme tes grands objectifs en petites étapes actionnables. Avance à ton rythme, sans te noyer.',
    visual: 'intro',
  },
  {
    iconBg: PR,
    icon: <Folder size={26} color="#fff" strokeWidth={2} />,
    label: 'Projets',
    title: 'Organise par projets',
    description: 'Regroupe tes tâches dans des projets colorés. Crée-en un maintenant pour commencer.',
    visual: 'project',
  },
  {
    iconBg: AC,
    icon: <ListChecks size={26} color="#fff" strokeWidth={2} />,
    label: 'Tâches',
    title: 'Découpe, coche, avance',
    description: 'Chaque tâche se divise en sous-étapes. Coche-les une par une et vois ta progression grimper.',
    visual: 'task',
  },
  {
    iconBg: `linear-gradient(135deg, ${PR}, ${PR_LIGHT})`,
    icon: <Bell size={26} color="#fff" strokeWidth={2} />,
    label: 'Rappels',
    title: 'Ne rate rien',
    description: 'Active des rappels sur tes tâches importantes. L\'app te notifie 30 min avant l\'échéance.',
    visual: 'notif',
  },
];

export default function Onboarding({ onComplete, onCreateProject }) {
  const [step, setStep]               = useState(0);
  const [projectName, setProjectName] = useState('');
  const [projectColor, setProjectColor] = useState(PR);
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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .ob-wrap { position: fixed; inset: 0; background: rgba(10,15,46,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; font-family: 'Inter', -apple-system, sans-serif; }
    .ob-card { background: #fff; border-radius: 20px; width: 100%; max-width: 500px; overflow: hidden; box-shadow: 0 24px 64px rgba(0,145,255,0.15); }
    .ob-header { padding: 28px 28px 0; position: relative; }
    .ob-skip { position: absolute; top: 20px; right: 20px; background: none; border: none; cursor: pointer; color: #9CA3AF; display: flex; align-items: center; gap: 4px; font-size: 13px; font-family: inherit; }
    .ob-skip:hover { color: #6B7280; }
    .ob-steps { display: flex; gap: 6px; margin-bottom: 24px; }
    .ob-step-bar { height: 3px; border-radius: 2px; flex: 1; transition: background 0.3s; }
    .ob-icon-wrap { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
    .ob-label { font-size: 11px; font-weight: 600; color: ${PR}; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
    .ob-title { font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 10px; line-height: 1.3; letter-spacing: -0.3px; }
    .ob-desc { font-size: 14.5px; color: #6B7280; line-height: 1.65; }
    .ob-visual { padding: 20px 28px; }
    .ob-bottom { padding: 16px 28px 24px; border-top: 0.5px solid #F3F4F6; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .ob-btn-ghost { background: none; border: 0.5px solid #E5E7EB; cursor: pointer; color: #6B7280; font-size: 13.5px; font-family: inherit; padding: 9px 16px; border-radius: 8px; }
    .ob-btn-ghost:hover { border-color: #D1D5DB; color: #374151; }
    .ob-btn-primary { background: ${PR}; color: #fff; border: none; border-radius: 10px; padding: 11px 22px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 7px; font-family: inherit; transition: background 0.15s; }
    .ob-btn-primary:hover { background: ${PR_DARK}; }
    .ob-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

    .ob-input { width: 100%; padding: 10px 13px; border: 1.5px solid #E5E7EB; border-radius: 9px; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
    .ob-input:focus { border-color: ${PR}; box-shadow: 0 0 0 3px ${PR_BG}; }
    .ob-field-label { font-size: 11px; font-weight: 500; color: #6B7280; text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: 6px; }
    .ob-color-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
    .ob-color-dot { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; border: 2.5px solid transparent; transition: border-color 0.15s, transform 0.15s; }
    .ob-color-dot:hover { transform: scale(1.1); }
    .ob-color-dot.sel { border-color: #111827; }
    .ob-preview { background: ${PR_BG}; border: 0.5px solid ${PR_LIGHT}; border-radius: 9px; padding: 11px 14px; display: flex; align-items: center; gap: 10px; margin-top: 14px; }
    .ob-preview-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .ob-preview-name { font-size: 13.5px; font-weight: 500; color: #111827; }
    .ob-preview-badge { margin-left: auto; font-size: 11px; color: ${PR}; font-weight: 500; }
  `;

  return (
    <div className="ob-wrap">
      <style>{css}</style>
      <div className="ob-card">
        <div className="ob-header">
          <button className="ob-skip" onClick={onComplete}><X size={14} /> Passer</button>

          {/* Barre de progression */}
          <div className="ob-steps">
            {STEPS.map((_, i) => (
              <div key={i} className="ob-step-bar" style={{ background: i <= step ? PR : '#E5E7EB' }} />
            ))}
          </div>

          {/* Icône */}
          <div className="ob-icon-wrap" style={{ background: current.iconBg }}>
            {current.icon}
          </div>

          <div className="ob-label">{current.label}</div>
          <div className="ob-title">{current.title}</div>
          <div className="ob-desc">{current.desc || current.description}</div>
        </div>

        {/* VISUELS */}
        <div className="ob-visual">

          {/* INTRO — aperçu tâches */}
          {current.visual === 'intro' && (
            <div style={{ background: '#F8FAFF', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                { title: 'Préparer l\'oral CDA', pct: 60, color: PR },
                { title: 'Refonte Step by Step', pct: 85, color: AC },
                { title: 'Landing page Elevia', pct: 20, color: '#059669' },
              ].map((item, i) => (
                <div key={i} style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: 9, padding: '10px 13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{item.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: item.color }}>{item.pct}%</span>
                  </div>
                  <div style={{ height: 3, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${item.pct}%`, background: item.color, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PROJECT */}
          {current.visual === 'project' && (
            <div>
              <label className="ob-field-label">Nom du projet</label>
              <input className="ob-input" placeholder="Ex : Travail, Perso, École..." value={projectName}
                onChange={e => { setProjectName(e.target.value); setProjectCreated(false); }}
                onKeyDown={e => e.key === 'Enter' && canNext && handleNext()}
                autoFocus={step === 1} />
              <label className="ob-field-label" style={{ marginTop: 14 }}>Couleur</label>
              <div className="ob-color-row">
                {PROJECT_COLORS.map(c => (
                  <div key={c} className={`ob-color-dot ${projectColor === c ? 'sel' : ''}`} style={{ background: c }}
                    onClick={() => setProjectColor(c)}>
                    {projectColor === c && <Check size={13} color="#fff" />}
                  </div>
                ))}
              </div>
              {projectName.trim() && (
                <div className="ob-preview">
                  <div className="ob-preview-dot" style={{ background: projectColor }} />
                  <span className="ob-preview-name">{projectName}</span>
                  {projectCreated && <span className="ob-preview-badge">✓ Créé</span>}
                </div>
              )}
            </div>
          )}

          {/* TASK — aperçu sous-tâches */}
          {current.visual === 'task' && (
            <div style={{ background: '#F8FAFF', borderRadius: 12, padding: 14 }}>
              <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: 9, padding: '12px 14px' }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 10 }}>Préparer mon exposé</div>
                {[
                  { label: 'Choisir le sujet', done: true },
                  { label: 'Faire les recherches', done: true },
                  { label: 'Rédiger le plan', done: false },
                  { label: 'Créer les slides', done: false },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0', borderBottom: i < 3 ? '0.5px solid #F9FAFB' : 'none' }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, background: s.done ? PR : '#fff', border: `1.5px solid ${s.done ? PR : '#D1D5DB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {s.done && <Check size={11} color="#fff" />}
                    </div>
                    <span style={{ fontSize: 13, color: s.done ? '#9CA3AF' : '#374151', textDecoration: s.done ? 'line-through' : 'none' }}>{s.label}</span>
                  </div>
                ))}
                <div style={{ height: 3, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden', marginTop: 10 }}>
                  <div style={{ height: '100%', width: '50%', background: PR, borderRadius: 2 }} />
                </div>
              </div>
            </div>
          )}

          {/* NOTIF */}
          {current.visual === 'notif' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: PR_BG, border: `0.5px solid ${PR_LIGHT}`, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: PR, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bell size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: PR_DARK }}>Step by Step</div>
                  <div style={{ fontSize: 12, color: '#374151', marginTop: 2 }}>Rappel : Préparer mon exposé — dans 30 min</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>Active les rappels sur chaque tâche depuis son détail.</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="ob-bottom">
          <div style={{ display: 'flex', gap: 6 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ width: i === step ? 20 : 7, height: 7, borderRadius: 4, background: i === step ? PR : '#E5E7EB', transition: 'all 0.2s', cursor: 'pointer' }}
                onClick={() => i < step && setStep(i)} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {step > 0 && (
              <button className="ob-btn-ghost" onClick={() => setStep(s => s - 1)}>Retour</button>
            )}
            <button className="ob-btn-primary" onClick={handleNext} disabled={!canNext}>
              {isLast ? 'C\'est parti !' : step === 1 && !projectCreated && projectName.trim() ? 'Créer & continuer' : 'Suivant'}
              {!isLast && <ChevronRight size={16} />}
              {isLast && <Check size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
