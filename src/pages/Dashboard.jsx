import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
    };

    const quickLinks = [
        { to: '/workout', title: 'Workouts', desc: 'Plane oder logge deine Session', tag: 'Neu' },
        { to: '/exercises', title: 'Übungen', desc: 'Bibliothek & Videos managen', tag: 'Library' },
    ];

    return (
        <div className="grid" style={{ gap: '1.5rem' }}>
            <div className="page-header">
                <div>
                    <p className="pill">Daily Pulse</p>
                    <h1 style={{ marginTop: '0.3rem' }}>Willkommen zurück</h1>
                </div>
                <button onClick={handleLogout} className="btn secondary">Logout</button>
            </div>

            <div className="hero">
                <div className="panel-strong">
                    <div className="grid grid-cols-2">
                        <div>
                            <p className="pill">Progress</p>
                            <h2 style={{ margin: '0.4rem 0 0.6rem' }}>Level up deine Physio</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Tracke Workouts, teile Videos mit Patient:innen und halte deinen Plan immer aktuell.
                            </p>
                            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                <Link to="/workout" className="btn">Workout starten</Link>
                                <Link to="/exercises" className="btn secondary">Zur Bibliothek</Link>
                            </div>
                        </div>
                        <div className="hero-graphic" />
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Aktive Workouts</div>
                    <div className="stat-value">3</div>
                    <div className="badge" style={{ marginTop: '0.4rem' }}>Heute geplant</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Übungen</div>
                    <div className="stat-value">24</div>
                    <div className="badge" style={{ marginTop: '0.4rem' }}>Bibliothek</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Compliance</div>
                    <div className="stat-value">82%</div>
                    <div className="badge" style={{ marginTop: '0.4rem' }}>Letzte Woche</div>
                </div>
            </div>

            <div className="grid grid-cols-3">
                {quickLinks.map((item) => (
                    <Link to={item.to} key={item.to}>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
                            <div className="badge">
                                <span>{item.tag}</span>
                            </div>
                            <h3>{item.title}</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                            <span style={{ marginTop: 'auto', opacity: 0.8 }}>Los geht’s →</span>
                        </div>
                    </Link>
                ))}
                {(role === 'ADMIN' || role === 'THERAPIST') && (
                    <div className="card" style={{ opacity: 0.9 }}>
                        <div className="badge">Bald</div>
                        <h3>Patienten</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Verwalte Profile, Pläne und Fortschritt.</p>
                        <span style={{ marginTop: 'auto', opacity: 0.8 }}>In Planung</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
