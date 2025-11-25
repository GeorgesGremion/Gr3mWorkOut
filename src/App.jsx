// src/App.jsx
import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ExerciseLibrary from './pages/ExerciseLibrary';
import WorkoutEditor from './pages/WorkoutEditor';

// Theme context to toggle dark / light mode
export const ThemeContext = createContext();

const App = () => {
    const [theme, setTheme] = useState('dark'); // default dark

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

    // Simple auth check (token stored in localStorage)
    const isAuthenticated = !!localStorage.getItem('token');

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <Router>
                <Shell isAuthenticated={isAuthenticated} toggleTheme={toggleTheme} theme={theme}>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route
                            path="/dashboard"
                            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/exercises"
                            element={isAuthenticated ? <ExerciseLibrary /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/workout"
                            element={isAuthenticated ? <WorkoutEditor /> : <Navigate to="/login" />}
                        />
                        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
                    </Routes>
                </Shell>
            </Router>
        </ThemeContext.Provider>
    );
};

const Shell = ({ children, isAuthenticated, toggleTheme, theme }) => {
    const location = useLocation();

    const links = [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/exercises', label: 'Übungen' },
        { to: '/workout', label: 'Workouts' },
    ];

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-badge">PT</div>
                    <div>
                        <div style={{ fontWeight: 800 }}>Physio Trainer</div>
                        <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Build stronger days</div>
                    </div>
                </div>

                {isAuthenticated && (
                    <nav className="nav">
                        {links.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={location.pathname === link.to ? 'active' : ''}
                            >
                                <span>{link.label}</span>
                                <span style={{ opacity: 0.6 }}>→</span>
                            </Link>
                        ))}
                    </nav>
                )}

                <button onClick={toggleTheme} className="btn secondary theme-toggle">
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
            </aside>
            <main className="content">{children}</main>
        </div>
    );
};

export default App;
