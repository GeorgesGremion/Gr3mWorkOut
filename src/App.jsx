// src/App.jsx
import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
                <div className="app-container">
                    <header className="app-header glass">
                        <h1>Physio Trainer</h1>
                        <button onClick={toggleTheme} className="theme-toggle">
                            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                        </button>
                    </header>
                    <main className="app-main">
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            {/* Protected routes */}
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
                    </main>
                </div>
            </Router>
        </ThemeContext.Provider>
    );
};

export default App;
