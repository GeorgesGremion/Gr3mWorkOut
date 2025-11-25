import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Dashboard</h2>
                <button onClick={handleLogout} style={{ background: 'rgba(255, 50, 50, 0.2)' }}>Logout</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>

                <Link to="/workout" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="glass card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '150px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '1.4rem', marginBottom: '1rem', letterSpacing: '0.05em' }}>[WORKOUT]</span>
                        <h3>Start Workout</h3>
                        <p style={{ opacity: 0.7, textAlign: 'center' }}>Log your daily training</p>
                    </div>
                </Link>

                <Link to="/exercises" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="glass card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '150px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '1.4rem', marginBottom: '1rem', letterSpacing: '0.05em' }}>[VIDEOS]</span>
                        <h3>Exercise Library</h3>
                        <p style={{ opacity: 0.7, textAlign: 'center' }}>Manage videos & exercises</p>
                    </div>
                </Link>

                {role === 'ADMIN' || role === 'THERAPIST' ? (
                    <div className="glass card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '150px', opacity: 0.5 }}>
                        <span style={{ fontSize: '1.4rem', marginBottom: '1rem', letterSpacing: '0.05em' }}>[PATIENTS]</span>
                        <h3>Patients</h3>
                        <p style={{ opacity: 0.7, textAlign: 'center' }}>(Coming Soon)</p>
                    </div>
                ) : null}

            </div>
        </div>
    );
};

export default Dashboard;
