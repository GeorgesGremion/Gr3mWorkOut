import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
        try {
            const res = await axios.post(endpoint, { email, password, role: 'THERAPIST' }); // Default role for demo
            if (isRegister) {
                // Auto login after register or just switch to login
                setIsRegister(false);
                alert('Registration successful! Please login.');
            } else {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('role', res.data.role);
                window.location.href = '/dashboard'; // Force reload to update auth state
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div className="glass card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>
                    {isRegister ? 'Register' : 'Login'}
                </h2>
                {error && <div style={{ color: '#ff6b6b', marginBottom: '1rem' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" style={{ width: '100%' }}>
                        {isRegister ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <span
                        style={{ cursor: 'pointer', opacity: 0.8 }}
                        onClick={() => setIsRegister(!isRegister)}
                    >
                        {isRegister ? 'Already have an account? Login' : 'No account? Register'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
