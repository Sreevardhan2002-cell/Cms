import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { ArrowRight, Lock, Moon, Sun, User } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Administrator');

    const { login, user } = useAuth();
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const isDark = theme === 'dark';

    const panelStyle = {
        width: '100%',
        padding: '3.5rem 3.75rem',
        background: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255,255,255,0.86)',
        border: `1px solid ${isDark ? 'rgba(51, 65, 85, 0.72)' : 'rgba(255,255,255,0.6)'}`,
        textAlign: 'center'
    };

    const controlStyle = {
        marginBottom: 0,
        background: isDark ? 'rgba(15, 23, 42, 0.98)' : '#fff',
        color: 'var(--text-main)',
        height: '60px',
        fontSize: '1.05rem',
        borderRadius: '16px'
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        if (!user) return;

        if (user.role === 'Administrator') navigate('/admin', { replace: true });
        else if (user.role === 'Receptionist') navigate('/reception', { replace: true });
        else if (user.role === 'Doctor') navigate('/doctor', { replace: true });
        else if (user.role === 'Pharmacist') navigate('/pharmacy', { replace: true });
        else if (user.role === 'Lab Technician') navigate('/lab', { replace: true });
    }, [user, navigate]);

    const toggleTheme = () => {
        setTheme(currentTheme => (currentTheme === 'dark' ? 'light' : 'dark'));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('auth/login/', {
                username,
                password,
                role
            });

            login(response.data);

            // Route based on role
            if (role === 'Administrator') navigate('/admin');
            else if (role === 'Receptionist') navigate('/reception');
            else if (role === 'Doctor') navigate('/doctor');
            else if (role === 'Pharmacist') navigate('/pharmacy');
            else if (role === 'Lab Technician') navigate('/lab');

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to login');
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                    'radial-gradient(circle at top left, rgba(5,150,105,0.12), transparent 28%), radial-gradient(circle at bottom right, rgba(6,182,212,0.08), transparent 26%), var(--background)',
                padding: '2rem'
            }}
        >
            <button
                type="button"
                onClick={toggleTheme}
                className="theme-toggle"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 20 }}
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

                <div
                    style={{
                        width: '100%',
                        maxWidth: '620px'
                    }}
                >
                        <div className="glass-panel" style={panelStyle}>
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ width: '96px', height: '96px', borderRadius: '28px', margin: '0 auto 1.1rem', background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 28px rgba(5,150,105,0.22)' }}>
                                <Lock size={42} />
                            </div>
                                <h1 style={{ margin: 0, fontSize: '2.9rem', color: 'var(--text-main)', letterSpacing: '-0.04em' }}>MacClinic</h1>
                        </div>

                        {error && (
                            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: 'var(--danger)', padding: '1rem 1.1rem', borderRadius: '14px', marginBottom: '1.4rem', fontSize: '1rem', textAlign: 'left' }}>
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={handleLogin}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.35rem',
                                textAlign: 'left'
                            }}
                        >
                            <div>
                                <label className="input-label" style={{ fontSize: '1rem' }}>Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="input-field"
                                    style={controlStyle}
                                >
                                    <option>Administrator</option>
                                    <option>Receptionist</option>
                                    <option>Doctor</option>
                                    <option>Pharmacist</option>
                                    <option>Lab Technician</option>
                                </select>
                            </div>

                            <div>
                                <label className="input-label" style={{ fontSize: '1rem' }}>Username</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="text"
                                        placeholder="Enter username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="input-field"
                                        style={{ ...controlStyle, paddingLeft: '3rem' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="input-label" style={{ fontSize: '1rem' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="password"
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="input-field"
                                        style={{ ...controlStyle, paddingLeft: '3rem' }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '1.1rem 1.35rem',
                                    marginTop: '0.6rem',
                                    fontSize: '1.08rem',
                                    boxShadow: '0 12px 28px rgba(5,150,105,0.22)'
                                }}
                            >
                                Login
                                <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
    );
};

export default Login;