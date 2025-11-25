import React, { useState } from 'react';
import api from '../api';

const LoginPage = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
        try {
            const res = await api.post(endpoint, { email, password });
            if (isRegister) {
                setIsRegister(false);
                alert('Registrierung erfolgreich. Bitte einloggen.');
            } else {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('role', res.data.role);
                window.location.href = '/dashboard';
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Etwas ist schiefgelaufen');
        }
    };

    return (
        <div style={{ minHeight: '100vh', padding: '2.2rem' }}>
            <div className="auth-page">
                <div className="auth-grid">
                    <div className="auth-hero">
                        <p className="pill">Physio Trainer</p>
                        <h2 style={{ margin: '0.5rem 0 0.35rem' }}>Dein moderner Physio-Coach</h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '520px' }}>
                            Teile Übungen mit Videos, plane Workouts und halte den Fortschritt deiner Patient:innen im Blick – alles in einem klaren Interface.
                        </p>
                        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                            <span className="badge">Glass UI</span>
                            <span className="badge">JWT Login</span>
                            <span className="badge">Upload ready</span>
                        </div>
                    </div>

                    <div className="panel-strong" style={{ width: '100%', maxWidth: '460px', marginLeft: 'auto' }}>
                        <div className="page-header" style={{ marginBottom: '0.5rem' }}>
                            <div>
                                <p className="pill" style={{ display: 'inline-flex' }}>{isRegister ? 'Neuer Account' : 'Willkommen zurück'}</p>
                                <h2 style={{ marginTop: '0.35rem' }}>{isRegister ? 'Registrieren' : 'Einloggen'}</h2>
                            </div>
                        </div>

                        {error && <div className="card" style={{ color: '#ff7a42', borderColor: 'rgba(255,122,66,0.35)' }}>{error}</div>}

                        <form className="grid" style={{ gap: '1rem' }} onSubmit={handleSubmit}>
                            <div className="field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="field">
                                <label>Passwort</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn" style={{ width: '100%' }}>
                                {isRegister ? 'Account anlegen' : 'Einloggen'}
                            </button>
                        </form>

                        <div className="divider" />
                        <div style={{ textAlign: 'center' }}>
                            <button onClick={() => setIsRegister(!isRegister)} className="btn secondary" style={{ width: '100%' }}>
                                {isRegister ? 'Ich habe schon einen Account' : 'Neu hier? Registrieren'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
