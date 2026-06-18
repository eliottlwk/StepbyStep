import React, { useState } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Mail, Lock, ArrowRight, CheckCircle2, Zap, Target, Bell } from 'lucide-react';

const PR      = '#0091ff';
const PR_DARK = '#0066cc';
const PR_BG   = '#f0f7ff';
const PR_LIGHT= '#b1d5ff';
const AC      = '#4e3fd5';

const FEATURES = [
  { icon: <CheckCircle2 size={18} color={PR} />, text: 'Organise tes tâches par projets' },
  { icon: <Zap size={18} color={PR} />,          text: 'Avance étape par étape, sans pression' },
  { icon: <Target size={18} color={PR} />,        text: 'Suis ta progression en temps réel' },
  { icon: <Bell size={18} color={PR} />,          text: 'Rappels intelligents avant tes échéances' },
];

export default function AuthScreen({ logo }) {
  const [mode, setMode]         = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handle = async () => {
    setError(''); setLoading(true);
    try {
      if (mode === 'login') await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) {
      const msgs = {
        'auth/invalid-email':        'Email invalide.',
        'auth/user-not-found':       'Aucun compte avec cet email.',
        'auth/wrong-password':       'Mot de passe incorrect.',
        'auth/email-already-in-use': 'Cet email est déjà utilisé.',
        'auth/weak-password':        'Mot de passe trop court (6 min).',
        'auth/invalid-credential':   'Email ou mot de passe incorrect.',
      };
      setError(msgs[e.code] || 'Une erreur est survenue.');
    }
    setLoading(false);
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; }
    .auth-wrap { min-height: 100vh; display: flex; font-family: 'Inter', -apple-system, sans-serif; }

    /* LEFT PANEL */
    .auth-left { flex: 1; background: linear-gradient(145deg, #0a0f2e 0%, #1a1060 50%, #0a2a6e 100%); display: flex; flex-direction: column; justify-content: center; padding: 60px 48px; position: relative; overflow: hidden; }
    .auth-left::before { content: ''; position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(0,145,255,0.15) 0%, transparent 70%); pointer-events: none; }
    .auth-left::after { content: ''; position: absolute; bottom: -80px; left: -60px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(78,63,213,0.2) 0%, transparent 70%); pointer-events: none; }
    .auth-logo { margin-bottom: 48px; }
    .auth-logo img { height: 36px; object-fit: contain; }
    .auth-logo-fallback { display: flex; align-items: center; gap: 12px; }
    .auth-logo-icon { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, ${AC}, ${PR}); display: flex; align-items: center; justify-content: center; }
    .auth-logo-text { font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.3px; }
    .auth-tagline { font-size: 32px; font-weight: 700; color: #fff; line-height: 1.25; margin-bottom: 14px; letter-spacing: -0.5px; }
    .auth-tagline span { color: ${PR_LIGHT}; }
    .auth-sub { font-size: 15px; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 40px; }
    .auth-features { display: flex; flex-direction: column; gap: 14px; }
    .auth-feat { display: flex; align-items: center; gap: 12px; }
    .auth-feat-icon { width: 34px; height: 34px; border-radius: 9px; background: rgba(0,145,255,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 0.5px solid rgba(177,213,255,0.2); }
    .auth-feat-text { font-size: 14px; color: rgba(255,255,255,0.75); }

    /* RIGHT PANEL */
    .auth-right { width: 460px; flex-shrink: 0; background: #fff; display: flex; flex-direction: column; justify-content: center; padding: 48px 44px; }
    @media (max-width: 768px) { .auth-left { display: none; } .auth-right { width: 100%; padding: 32px 24px; } }

    .auth-title { font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 6px; }
    .auth-subtitle { font-size: 14px; color: #9CA3AF; margin-bottom: 32px; }

    .auth-field { margin-bottom: 14px; }
    .auth-field label { font-size: 12px; font-weight: 500; color: #374151; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
    .auth-input-wrap { position: relative; }
    .auth-input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #9CA3AF; pointer-events: none; }
    .auth-input { width: 100%; padding: 11px 13px 11px 40px; border: 1.5px solid #E5E7EB; border-radius: 10px; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.15s, box-shadow 0.15s; background: #FAFAFA; }
    .auth-input:focus { border-color: ${PR}; box-shadow: 0 0 0 3px ${PR_BG}; background: #fff; }

    .auth-error { background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; border-radius: 9px; padding: 10px 14px; font-size: 13px; margin-bottom: 16px; }

    .auth-btn { width: 100%; background: ${PR}; color: #fff; border: none; border-radius: 10px; padding: 13px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.15s, transform 0.1s; margin-top: 4px; }
    .auth-btn:hover:not(:disabled) { background: ${PR_DARK}; transform: translateY(-1px); }
    .auth-btn:active { transform: translateY(0); }
    .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .auth-divider { display: flex; align-items: center; gap: 12px; margin: 22px 0; }
    .auth-divider-line { flex: 1; height: 1px; background: #E5E7EB; }
    .auth-divider-text { font-size: 12px; color: #9CA3AF; white-space: nowrap; }

    .auth-switch { text-align: center; font-size: 14px; color: #6B7280; margin-top: 20px; }
    .auth-switch a { color: ${PR}; cursor: pointer; font-weight: 500; }
    .auth-switch a:hover { color: ${PR_DARK}; }
  `;

  return (
    <div className="auth-wrap">
      <style>{css}</style>

      {/* LEFT */}
      <div className="auth-left">
        <div className="auth-logo">
          {logo
            ? <img src={logo} alt="Step by Step" />
            : <div className="auth-logo-fallback">
                <div className="auth-logo-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <span className="auth-logo-text">Step by Step</span>
              </div>
          }
        </div>

        <h1 className="auth-tagline">Avance <span>pas à pas</span><br />vers tes objectifs.</h1>
        <p className="auth-sub">L'application qui transforme tes grands projets en petites victoires quotidiennes.</p>

        <div className="auth-features">
          {FEATURES.map((f, i) => (
            <div key={i} className="auth-feat">
              <div className="auth-feat-icon">{f.icon}</div>
              <span className="auth-feat-text">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <h2 className="auth-title">{mode === 'login' ? 'Bon retour 👋' : 'Créer un compte'}</h2>
        <p className="auth-subtitle">{mode === 'login' ? 'Connecte-toi pour retrouver tes tâches.' : 'Commence à avancer dès aujourd\'hui.'}</p>

        <div className="auth-field">
          <label>Email</label>
          <div className="auth-input-wrap">
            <Mail size={16} className="auth-input-icon" />
            <input type="email" className="auth-input" placeholder="ton@email.com" value={email}
              onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} autoFocus />
          </div>
        </div>

        <div className="auth-field">
          <label>Mot de passe</label>
          <div className="auth-input-wrap">
            <Lock size={16} className="auth-input-icon" />
            <input type="password" className="auth-input" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} />
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button className="auth-btn" onClick={handle} disabled={loading || !email || !password}>
          {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          {!loading && <ArrowRight size={18} />}
        </button>

        <p className="auth-switch">
          {mode === 'login' ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <a onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
          </a>
        </p>
      </div>
    </div>
  );
}
