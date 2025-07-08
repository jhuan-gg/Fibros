import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './Login.css';

export default function Login({ onLogin, setUsuario }) {
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Tenta encontrar usuário admin no Firestore
    try {
      const q = query(
        collection(db, 'usuarios'),
        where('nome', '==', emailOrUser),
        where('tipo', '==', 'admin')
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Usuário admin encontrado, verifica senha
        const userDoc = querySnapshot.docs[0].data();
        if (userDoc.senha === password) {
          if (setUsuario) setUsuario(userDoc); // Salva usuário admin
          onLogin();
          navigate('/principal');
          return;
        } else {
          setError('Senha de administrador incorreta.');
          return;
        }
      }
    } catch (err) {
      setError('Erro ao verificar usuário administrador.');
      return;
    }

    // 2. Se não for admin, tenta login normal pelo Auth
    try {
      const cred = await signInWithEmailAndPassword(auth, emailOrUser, password);
      if (setUsuario) setUsuario(cred.user); // Salva usuário comum
      onLogin();
      navigate('/principal');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('Usuário não encontrado.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Senha incorreta.');
      } else if (err.code === 'auth/invalid-email') {
        setError('E-mail inválido.');
      } else {
        setError('E-mail ou senha inválidos.');
      }
    }
  };

  return (
    <div className='login-container'>
    <form className="login-form" onSubmit={handleSubmit} autoComplete="on">
      <h2>
        Bem vindo a
        <span className="fibros-highlight"> Fibros!</span>
      </h2>
      <div className="login-subtitle">Faça seu login</div>
      <div className="login-fields">
        <input
          type="text"
          placeholder="E-mail ou usuário admin"
          value={emailOrUser}
          onChange={e => setEmailOrUser(e.target.value)}
          required
          autoComplete="username"
        />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <div className="show-password-row">
          <input
            type="checkbox"
            id="show-password"
            checked={showPassword}
            onChange={e => setShowPassword(e.target.checked)}
          />
          <label htmlFor="show-password">
            Exibir senha
          </label>
        </div>
        {error && <div className="login-error">{error}</div>}
        <button type="submit">Entrar</button>
      </div>
      <div className="login-footer">
        © 2025 <span className="fibros-highlight" style={{fontSize: '1em'}}>Fibros!</span> Todos os direitos reservados.
      </div>
    </form>
    </div>
  );
}
