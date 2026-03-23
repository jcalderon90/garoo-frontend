import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import garooLogo from "../assets/img/garoo-logo.png";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <style>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #f8fafc;
                    background-image: 
                        radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.05) 0px, transparent 50%),
                        radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.05) 0px, transparent 50%);
                    padding: 24px;
                    position: relative;
                }

                .login-card-v3 {
                    width: 100%;
                    max-width: 320px;
                    background: white;
                    border-radius: 20px;
                    padding: 1.75rem 1.5rem;
                    box-shadow: 
                        0 10px 25px -5px rgba(0, 0, 0, 0.05),
                        0 8px 10px -6px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f1f5f9;
                    animation: cardEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes cardEntrance {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .logo-container {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 1.25rem;
                }

                .logo-ring {
                    width: 72px;
                    height: 72px;
                    background: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    box-shadow: 0 8px 20px -5px rgba(0, 0, 0, 0.1);
                    border: 2px solid white;
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    overflow: hidden;
                }

                .logo-ring:hover {
                    transform: scale(1.08) rotate(5deg);
                }

                .logo-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                }

                .header-section {
                    text-align: center;
                    margin-bottom: 1.5rem;
                }

                .header-section h1 {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: -0.03em;
                    margin-bottom: 0.25rem;
                }

                .header-section p {
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 500;
                }

                .input-group-v3 {
                    margin-bottom: 1rem;
                }

                .label-v3 {
                    display: block;
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 0.5rem;
                    margin-left: 0.2rem;
                }

                .input-v3 {
                    width: 100%;
                    background: #f8fafc;
                    border: 1.5px solid #edf2f7;
                    border-radius: 12px;
                    padding: 10px 14px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #1e293b;
                    transition: all 0.2s ease;
                }

                .input-v3:focus {
                    background: white;
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.05);
                    outline: none;
                }

                .login-button-v3 {
                    width: 100%;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    padding: 8px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    margin-top: 0.5rem;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    box-shadow: 0 6px 12px -3px rgba(37, 99, 235, 0.2);
                }

                .login-button-v3:hover:not(:disabled) {
                    background: #1d4ed8;
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.3);
                }

                .login-button-v3:active {
                    transform: translateY(0);
                }

                .login-button-v3:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .footer-v3 {
                    margin-top: 1.5rem;
                    text-align: center;
                }

                .footer-v3 p {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    font-weight: 600;
                }

                .error-pill {
                    background: #fef2f2;
                    color: #dc2626;
                    padding: 10px 16px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    border: 1px solid #fee2e2;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
            `}</style>

            <div className="login-card-v3">
                <div className="logo-container">
                    <div className="logo-ring">
                        <img src={garooLogo} alt="Garoo" className="logo-image" />
                    </div>
                </div>

                <div className="header-section">
                    <h1>Bienvenido</h1>
                    <p>Ingresa tus credenciales para continuar</p>
                </div>

                {error && (
                    <div className="error-pill">
                        <i className="bi bi-exclamation-circle-fill"></i>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group-v3">
                        <label className="label-v3">Usuario o Email</label>
                        <input 
                            type="email" 
                            className="input-v3"
                            placeholder="user@garoo.ai"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group-v3">
                        <label className="label-v3">Contraseña</label>
                        <input 
                            type="password" 
                            className="input-v3"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="login-button-v3"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Autenticando...
                            </>
                        ) : (
                            <>
                                Entrar al Portal
                                <i className="bi bi-arrow-right-short fs-4"></i>
                            </>
                        )}
                    </button>

                    <div className="footer-v3">
                        <p>© 2026 Ecosistema de Inteligencia Garoo</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
