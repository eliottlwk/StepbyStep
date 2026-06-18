import React, { useState, useEffect } from 'react';
import { Plus, Lightbulb, Quote, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

const PR      = '#0091ff';
const PR_BG   = '#f0f7ff';
const PR_LIGHT= '#b1d5ff';
const AC      = '#4e3fd5';

const CONTENT = [
  { type: 'quote', icon: <Quote size={18} />, label: 'Citation du jour', color: AC, bg: '#f5f3ff',
    text: '"La façon de commencer est de cesser de parler et de commencer à agir."', author: 'Walt Disney', cta: 'Créer ma première tâche' },
  { type: 'quote', icon: <Quote size={18} />, label: 'Citation du jour', color: AC, bg: '#f5f3ff',
    text: '"Un objectif sans plan n\'est qu\'un souhait."', author: 'Antoine de Saint-Exupéry', cta: 'Planifier maintenant' },
  { type: 'quote', icon: <Quote size={18} />, label: 'Citation du jour', color: AC, bg: '#f5f3ff',
    text: '"Le secret pour avancer, c\'est de commencer."', author: 'Mark Twain', cta: 'Commencer maintenant' },
  { type: 'quote', icon: <Quote size={18} />, label: 'Citation du jour', color: AC, bg: '#f5f3ff',
    text: '"Vous n\'avez pas à être parfait pour commencer, mais vous devez commencer pour être parfait."', author: 'Zig Ziglar', cta: 'Se lancer' },
  { type: 'tip', icon: <Lightbulb size={18} />, label: 'Astuce', color: '#F59E0B', bg: '#FFFBEB',
    title: 'Divise pour mieux avancer',
    text: 'Une grande tâche qui fait peur ? Découpe-la en 3 à 5 sous-étapes concrètes. Le cerveau aime les petites victoires — chaque coche libère de la dopamine et t\'encourage à continuer.',
    cta: 'Créer une tâche avec étapes' },
  { type: 'tip', icon: <Lightbulb size={18} />, label: 'Astuce', color: '#F59E0B', bg: '#FFFBEB',
    title: 'Une tâche urgente = une priorité',
    text: 'Ne mets pas tout en "Urgent". Si tout est urgent, rien ne l\'est vraiment. Garde ce tag pour les vraies échéances du jour — et laisse "Moyen" faire le reste.',
    cta: 'Créer ma tâche urgente' },
  { type: 'tip', icon: <Lightbulb size={18} />, label: 'Astuce', color: '#F59E0B', bg: '#FFFBEB',
    title: 'Utilise les projets comme des dossiers',
    text: 'Regroupe tes tâches par contexte : École, Perso, Boulot. Tu pourras filtrer d\'un coup d\'œil et t\'y retrouver même quand ta liste devient longue.',
    cta: 'Créer mon premier projet' },
  { type: 'tip', icon: <Lightbulb size={18} />, label: 'Astuce', color: '#F59E0B', bg: '#FFFBEB',
    title: 'Active les rappels sur ce qui compte',
    text: 'Un rappel 30 min avant une échéance, ça change tout. Active-le sur tes tâches importantes pour ne jamais oublier ce qui compte vraiment.',
    cta: 'Créer une tâche avec rappel' },
  { type: 'method', icon: <BookOpen size={18} />, label: 'Méthode', color: PR, bg: PR_BG,
    title: 'La règle des 2 minutes', subtitle: 'David Allen — Getting Things Done',
    text: 'Si une tâche prend moins de 2 minutes, fais-la immédiatement. Sinon, planifie-la. Cette règle simple évite l\'accumulation de petites choses qui encombrent l\'esprit.',
    steps: ['Identifie la tâche', 'Est-ce que ça prend < 2 min ?', 'Oui → fais-le maintenant', 'Non → ajoute-la ici avec une date'],
    cta: 'Appliquer la règle' },
  { type: 'method', icon: <BookOpen size={18} />, label: 'Méthode', color: PR, bg: PR_BG,
    title: 'La technique Pomodoro', subtitle: 'Francesco Cirillo — 1980s',
    text: 'Travaille 25 minutes sans interruption, puis fais une pause de 5 minutes. Après 4 cycles, prends une vraie pause de 15-30 min. Idéal pour les tâches complexes.',
    steps: ['Choisis une tâche', 'Travaille 25 min (un Pomodoro)', 'Pause 5 min', 'Répète × 4 puis grande pause'],
    cta: 'Planifier ma session' },
  { type: 'method', icon: <BookOpen size={18} />, label: 'Méthode', color: PR, bg: PR_BG,
    title: 'La matrice d\'Eisenhower', subtitle: 'Dwight D. Eisenhower',
    text: 'Classe chaque tâche selon deux axes : urgent/pas urgent et important/pas important. Fais l\'urgent+important, planifie l\'important, délègue l\'urgent, élimine le reste.',
    steps: ['Urgent + Important → Fais maintenant', 'Important − Urgent → Planifie', 'Urgent − Important → Délègue', '− Urgent − Important → Supprime'],
    cta: 'Trier mes tâches' },
  { type: 'method', icon: <BookOpen size={18} />, label: 'Méthode', color: PR, bg: PR_BG,
    title: 'Eat the frog', subtitle: 'Brian Tracy',
    text: '"Mange la grenouille le matin" : commence toujours par ta tâche la plus difficile ou la plus repoussée. Une fois faite, le reste de la journée semble simple.',
    steps: ['La veille au soir, identifie ta grenouille', 'Le matin, commence par elle', 'Ne regarde pas tes emails avant', 'Savoure le reste de ta journée'],
    cta: 'Identifier ma grenouille' },
];

export default function EmptyState({ onCreateTask }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * CONTENT.length));
  const [anim, setAnim]   = useState(true);

  const go = (dir) => {
    setAnim(false);
    setTimeout(() => { setIndex(i => (i + dir + CONTENT.length) % CONTENT.length); setAnim(true); }, 150);
  };

  useEffect(() => {
    const t = setInterval(() => go(1), 8000);
    return () => clearInterval(t);
  }, []);

  const item = CONTENT[index];

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '8px 0' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}.es-card{animation:fadeIn 0.3s ease}`}</style>

      {/* Welcome */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${AC}, ${PR})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 6 }}>Prêt à avancer ?</h2>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>Ta liste est vide pour l'instant. Crée ta première tâche et commence à avancer pas à pas.</p>
      </div>

      {/* CTA principal — bleu */}
      <button onClick={onCreateTask} style={{ width: '100%', background: PR, color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 15, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', marginBottom: 24, transition: 'background 0.15s' }}
        onMouseEnter={e => e.target.style.background = '#0066cc'}
        onMouseLeave={e => e.target.style.background = PR}>
        <Plus size={18} /> Créer ma première tâche
      </button>

      {/* Carte contenu rotatif */}
      <div className="es-card" key={index} style={{ background: item.bg, border: `0.5px solid ${item.color}33`, borderRadius: 14, padding: '20px 20px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
            {item.icon}
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: item.color, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{item.label}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button onClick={() => go(-1)} style={{ width: 26, height: 26, borderRadius: 6, border: `0.5px solid ${item.color}44`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: item.color }}><ChevronLeft size={14} /></button>
            <button onClick={() => go(1)}  style={{ width: 26, height: 26, borderRadius: 6, border: `0.5px solid ${item.color}44`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: item.color }}><ChevronRight size={14} /></button>
          </div>
        </div>

        {item.type === 'quote' && <>
          <p style={{ fontSize: 16, color: '#111827', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 8 }}>{item.text}</p>
          <p style={{ fontSize: 12, color: item.color, fontWeight: 500 }}>— {item.author}</p>
        </>}

        {item.type === 'tip' && <>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 8 }}>{item.title}</h3>
          <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.65 }}>{item.text}</p>
        </>}

        {item.type === 'method' && <>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 3 }}>{item.title}</h3>
          <p style={{ fontSize: 11, color: item.color, fontWeight: 500, marginBottom: 10 }}>{item.subtitle}</p>
          <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.65, marginBottom: 12 }}>{item.text}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {item.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: item.color, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <span style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>
        </>}

        <button onClick={onCreateTask} style={{ marginTop: 16, background: item.color, color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
          {item.cta} →
        </button>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: 14 }}>
        {CONTENT.map((_, i) => (
          <div key={i} onClick={() => { setAnim(false); setTimeout(() => { setIndex(i); setAnim(true); }, 150); }}
            style={{ width: i === index ? 18 : 6, height: 6, borderRadius: 3, background: i === index ? PR : '#E5E7EB', cursor: 'pointer', transition: 'all 0.2s' }} />
        ))}
      </div>
    </div>
  );
}
