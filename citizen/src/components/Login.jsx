import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../CitizenDashboard.css'; // Reuse existing styles
import logo from '../assets/logo.png';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dashboard-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '450px', backdropFilter: 'blur(20px)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img src={logo} alt="CrisisLink Logo" style={{ width: '180px', height: '180px', objectFit: 'contain', marginBottom: '0.5rem' }} />
                    <h1 style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.25rem' }}>
                        Welcome to CrisisLink
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Secure AI-Driven Incident Routing</p>
                </div>

                {error && (
                    <div className="error-state" style={{ padding: '1rem', marginBottom: '1.5rem', border: '1px solid var(--status-critical)', borderRadius: '8px', background: 'rgba(220, 38, 38, 0.05)' }}>
                        <p style={{ color: 'var(--status-critical)', fontSize: '0.9rem', textAlign: 'center' }}>⚠️ {error}</p>
                    </div>
                )}

                <form onSubmit={onSubmit}>
                    <div className="form-group full-width" style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            id="email"
                            name="email"
                            value={email}
                            placeholder="Enter your email"
                            onChange={onChange}
                            required
                        />
                    </div>

                    <div className="form-group full-width" style={{ marginBottom: '2rem' }}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            id="password"
                            name="password"
                            value={password}
                            placeholder="Enter password"
                            onChange={onChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-location" // Reuse button style
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1rem',
                            borderRadius: '8px',
                            background: 'var(--primary-gradient)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'center',
                            opacity: isLoading ? 0.7 : 1
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging In...' : 'Login'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--primary-blue)', fontWeight: 600, textDecoration: 'none' }}>
                        Register Here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
