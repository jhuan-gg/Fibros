import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './TelaPrincipal.css';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// Paleta personalizada
const PALETA = {
  color1: '#fde6bd',
  color2: '#a1c5ab',
  color3: '#f4dd51',
  color4: '#d11e48',
  color5: '#632f53',
};

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('fibros-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fibros-theme', theme);
  }, [theme]);
  return [theme, setTheme];
}

function Filtros({ filtroCampo, setFiltroCampo, filtroValor, setFiltroValor }) {
  const campos = [
    { value: 'descricao', label: 'Descrição' },
    { value: 'capacidade', label: 'Capacidade' },
    { value: 'ocupadas', label: 'Ocupadas' },
    { value: 'livres', label: 'Livres' },
    { value: 'perc', label: '% Ocupação' },
    { value: 'ids', label: 'IDs conectados' },
    { value: 'cidade', label: 'Cidade' },
  ];
  return (
    <div className="painel-filtros painel-filtros-refinados painel-filtros-simples">
      <select
        value={filtroCampo}
        onChange={e => setFiltroCampo(e.target.value)}
        className="painel-filtros-select"
        tabIndex={0}
        aria-label="Campo de filtro"
      >
        {campos.map(campo => (
          <option key={campo.value} value={campo.value}>{campo.label}</option>
        ))}
      </select>
      <input
        type={['capacidade', 'ocupadas', 'livres', 'perc'].includes(filtroCampo) ? 'number' : 'text'}
        placeholder={`Filtrar por ${campos.find(c => c.value === filtroCampo)?.label || ''}`}
        value={filtroValor}
        onChange={e => setFiltroValor(e.target.value)}
        className="painel-filtros-input"
        min={['capacidade', 'ocupadas', 'livres', 'perc'].includes(filtroCampo) ? 0 : undefined}
        max={filtroCampo === 'perc' ? 100 : undefined}
        tabIndex={0}
        aria-label="Valor do filtro"
      />
    </div>
  );
}

function OverlayCaixa({ caixa, onClose, theme }) {
  if (!caixa) return null;
  const ocupacao = caixa.capacidade > 0 ? Math.round((caixa.ocupadas / caixa.capacidade) * 100) : 0;
  const alerta = ocupacao >= 80;
  const donutData = [
    { name: 'Ocupadas', value: caixa.ocupadas, color: PALETA.color4 },
    { name: 'Livres', value: caixa.livres, color: PALETA.color3 },
  ];
  const barData = [
    { name: 'Portas', Ocupadas: caixa.ocupadas, Livres: caixa.livres },
  ];
  return (
    <div className={`caixa-overlay ${alerta ? 'caixa-overlay-alerta' : ''}`}>
      <button className="caixa-overlay-close" onClick={onClose} aria-label="Fechar">×</button>
      <div className="caixa-overlay-content">
        <h2 className="caixa-overlay-titulo">{caixa.descricao}</h2>
        <div className="caixa-overlay-info">
          <div>
            <b>Capacidade:</b> {caixa.capacidade}
          </div>
          <div>
            <b>Ocupadas:</b> {caixa.ocupadas}
          </div>
          <div>
            <b>Livres:</b> {caixa.livres}
          </div>
          <div>
            <b>% Ocupação:</b> <span className={alerta ? 'caixa-overlay-alerta-text' : ''}>{ocupacao}%</span>
          </div>
          <div>
            <b>Cidade:</b> {caixa.cidade}
          </div>
          <div>
            <b>IDs conectados:</b> {Array.isArray(caixa.ports) && caixa.ports.length
              ? caixa.ports.join(', ')
              : 'Nenhum'}
          </div>
        </div>
        <div className="caixa-overlay-graficos">
          <div className="caixa-overlay-grafico">
            <div className="grafico-titulo">Ocupação (%)</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  isAnimationActive
                >
                  {donutData.map((entry, idx) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  contentStyle={{
                    background: theme === 'dark' ? PALETA.color5 : '#fff',
                    color: theme === 'dark' ? PALETA.color1 : PALETA.color5,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="caixa-overlay-grafico">
            <div className="grafico-titulo">Ocupadas vs Livres</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <XAxis dataKey="name" stroke={PALETA.color2} />
                <YAxis stroke={PALETA.color2} />
                <Tooltip
                  contentStyle={{
                    background: theme === 'dark' ? PALETA.color5 : '#fff',
                    color: theme === 'dark' ? PALETA.color1 : PALETA.color5,
                  }}
                />
                <Legend />
                <Bar dataKey="Ocupadas" fill={PALETA.color4} isAnimationActive />
                <Bar dataKey="Livres" fill={PALETA.color3} isAnimationActive />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCaixasFormatadas(dados) {
  return dados.map((cx) => {
    const capacidade = parseInt(cx.Capacidade) || 0;
    const ocupadas = Array.isArray(cx.Ports) ? cx.Ports.length : 0;
    const livres = Math.max(0, capacidade - ocupadas);
    const perc = capacidade > 0 ? Math.round((ocupadas / capacidade) * 100) : 0;
    return {
      id: cx.ID || cx.Descrição || cx._id,
      descricao: cx.Descrição || cx.ID || cx._id,
      capacidade,
      ocupadas,
      livres,
      perc,
      ports: cx.Ports || [],
      cidade: cx.Cidade || '',
      bairro: cx.Bairro || '',
      status: cx.Status || '',
      projeto: cx.Projeto || '',
      transmissor: cx['Transmissor(OLT)'] || '',
    };
  });
}

export default function TelaPrincipal() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  // Novo estado para filtro único
  const [filtroCampo, setFiltroCampo] = useState('descricao');
  const [filtroValor, setFiltroValor] = useState('');
  const [caixaSelecionada, setCaixaSelecionada] = useState(null);
  const [theme, setTheme] = useTheme();

  // Busca todos os dados ao montar
  useEffect(() => {
    setLoading(true);
    getDocs(collection(db, 'tabela_csv')).then((snap) => {
      const arr = [];
      snap.forEach(doc => arr.push({ ...doc.data(), _id: doc.id }));
      setDados(arr);
      setLoading(false);
    });
  }, []);

  // Filtragem baseada em campo único
  const caixasFiltradas = useMemo(() => {
    let arr = getCaixasFormatadas(dados);
    if (filtroValor) {
      arr = arr.filter(cx => {
        if (filtroCampo === 'ids') {
          return Array.isArray(cx.ports) && cx.ports.some(id =>
            String(id).toLowerCase().includes(filtroValor.toLowerCase())
          );
        }
        if (['capacidade', 'ocupadas', 'livres', 'perc'].includes(filtroCampo)) {
          return String(cx[filtroCampo]) === String(filtroValor);
        }
        return (cx[filtroCampo] || '').toLowerCase().includes(filtroValor.toLowerCase());
      });
    }
    return arr;
  }, [dados, filtroCampo, filtroValor]);

  // Seleciona a caixa automaticamente se só houver uma filtrada
  useEffect(() => {
    if (caixasFiltradas.length === 1) {
      setCaixaSelecionada(caixasFiltradas[0]);
    } else {
      setCaixaSelecionada(null);
    }
  }, [caixasFiltradas]);

  // Clique em uma caixa da lista filtrada (caso queira permitir seleção manual)
  const handleCaixaClick = (cx) => setCaixaSelecionada(cx);

  return (
    <div className="tela-principal-container">
      <header className="painel-header">
        <span className="fibros-highlight painel-logo">Fibros!</span>
        <span className="painel-title">Painel de Caixas Ópticas</span>
        <button
          className="painel-tabela-btn"
          style={{ marginLeft: 'auto', minWidth: 44 }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? '🌞' : '🌙'}
        </button>
      </header>

      <Filtros
        filtroCampo={filtroCampo}
        setFiltroCampo={setFiltroCampo}
        filtroValor={filtroValor}
        setFiltroValor={setFiltroValor}
      />

      <div className="painel-lista-caixas">
        {loading ? (
          <div className="painel-loading">Carregando...</div>
        ) : caixasFiltradas.length === 0 ? (
          <div className="painel-sem-dados">Nenhuma caixa encontrada.</div>
        ) : (
          <div className="painel-caixas-grid">
            {caixasFiltradas.slice(0, 10).map(cx => {
              const ocupacao = cx.capacidade > 0 ? Math.round((cx.ocupadas / cx.capacidade) * 100) : 0;
              const alerta = ocupacao >= 80;
              return (
                <div
                  key={cx.id}
                  className={`painel-caixa-card${alerta ? ' painel-caixa-alerta' : ''}${caixaSelecionada && caixaSelecionada.id === cx.id ? ' painel-caixa-selecionada' : ''}`}
                  onClick={() => handleCaixaClick(cx)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Ver detalhes da caixa ${cx.descricao}`}
                >
                  <div className="painel-caixa-titulo">{cx.descricao}</div>
                  <div className="painel-caixa-info">
                    <span>Capacidade: <b>{cx.capacidade}</b></span>
                    <span>Ocupadas: <b>{cx.ocupadas}</b></span>
                    <span>Livres: <b>{cx.livres}</b></span>
                    <span>% Ocupação: <b className={alerta ? 'painel-caixa-alerta-text' : ''}>{ocupacao}%</b></span>
                  </div>
                  {alerta && <span className="painel-caixa-alerta-icone" title="Alerta: ocupação alta">⚠️</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <OverlayCaixa
        caixa={caixaSelecionada}
        onClose={() => setCaixaSelecionada(null)}
        theme={theme}
      />
    </div>
  );
}
