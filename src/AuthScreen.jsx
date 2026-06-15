import React, { useState } from 'react';
import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { Check } from 'lucide-react';

const EM = '#059669'; const EM_DARK = '#065F46';

export default function AuthScreen() {
  const [mode, setMode]       = useState('login'); // login | register
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (e) {
      const msgs = {
        'auth/invalid-email':          'Email invalide.',
        'auth/user-not-found':         'Aucun compte avec cet email.',
        'auth/wrong-password':         'Mot de passe incorrect.',
        'auth/email-already-in-use':   'Cet email est déjà utilisé.',
        'auth/weak-password':          'Mot de passe trop court (6 min).',
        'auth/invalid-credential':     'Email ou mot de passe incorrect.',
      };
      setError(msgs[e.code] || 'Une erreur est survenue.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAF9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');`}</style>
      <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: EM, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 600, color: EM_DARK }}>Step by Step</span>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 6 }}>
          {mode === 'login' ? 'Connexion' : 'Créer un compte'}
        </h2>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 24 }}>
          {mode === 'login' ? 'Content de te revoir !' : 'Commence à avancer pas à pas.'}
        </p>

        <div style={{ marginBottom: 13 }}>
          <label style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="ton@email.com"
            style={{ width: '100%', padding: '9px 12px', border: '0.5px solid #D1D5DB', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            onKeyDown={e => e.key === 'Enter' && handle()} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Mot de passe</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: '100%', padding: '9px 12px', border: '0.5px solid #D1D5DB', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            onKeyDown={e => e.key === 'Enter' && handle()} />
        </div>

        {error && <div style={{ background: '#FEF2F2', color: '#991B1B', border: '0.5px solid #FECACA', borderRadius: 8, padding: '9px 12px', fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <button onClick={handle} disabled={loading || !email || !password}
          style={{ width: '100%', background: EM, color: '#fff', border: 'none', borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading || !email || !password ? 0.5 : 1, fontFamily: 'inherit' }}>
          {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', marginTop: 20 }}>
          {mode === 'login' ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <span style={{ color: EM, cursor: 'pointer', fontWeight: 500 }} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
          </span>
        </p>
      </div>
    </div>
  );
}
