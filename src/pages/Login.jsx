import { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    // Simulação de autenticação básica
    if (email === 'admin@fibros.com' && password === '123456') {
      onLogin();
    } else {
      setError('E-mail ou senha inválidos.');
    }
  };

  return (
      <form className="login-form" onSubmit={handleSubmit} autoComplete="on">
        <h2>Login</h2>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && <div className="login-error">{error}</div>}
        <button type="submit">Entrar</button>
      </form>
  );
}
