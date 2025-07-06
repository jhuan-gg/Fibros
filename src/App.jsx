

import { useState } from 'react';
import './App.css';
import Login from './pages/Login';

function App() {
  const [isLogged, setIsLogged] = useState(false);

  if (!isLogged) {
    return <Login onLogin={() => setIsLogged(true)} />;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1>Bem-vindo ao Fibros!</h1>
      <p>Você está logado.</p>
      {/* Aqui você pode renderizar o restante do app */}
    </div>
  );
}

export default App
