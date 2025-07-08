import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './TelaPrincipal.css';
import { IoCloseSharp } from "react-icons/io5";
import { Edit3 } from 'lucide-react'; // ícone de lápis
import { useNavigate } from 'react-router-dom';
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

function OverlayCaixa({ caixa, onClose }) {
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
    <div className={`caixa-overlay${alerta ? ' caixa-overlay-alerta' : ''}`} onClick={onClose}>
      <div className="caixa-overlay-content" onClick={e => e.stopPropagation()}>
        <button
          className="caixa-overlay-close"
          onClick={onClose}
          aria-label="Fechar"
          type="button"
          tabIndex={0}
        >×</button>
        <h2 className="caixa-overlay-titulo">{caixa.descricao}</h2>
        <div className="caixa-overlay-info" >
          <div className="caixa-overlay-info-row">
            <span><b>Capacidade:</b> {caixa.capacidade}</span><br />
            <span><b>Ocupadas:</b> {caixa.ocupadas}</span> <br />
            <span><b>Livres:</b> {caixa.livres}</span> <br />
            <span>
              <b>% Ocupação:</b>{" "}
              <span className={alerta ? 'caixa-overlay-alerta-text' : ''}>{ocupacao}%</span>
            </span> <br />
          </div>
          <div className="caixa-overlay-info-row">
            <span><b>Cidade:</b> {caixa.cidade}</span> <br />
            <span><b>Bairro:</b> {caixa.bairro}</span> <br />
          </div>
          <div className="caixa-overlay-info-row">
            <span><b>Status:</b> {caixa.status || '-'}</span> <br />
            <span><b>Projeto:</b> {caixa.projeto || '-'}</span> <br />
            <span><b>OLT:</b> {caixa.transmissor || '-'}</span> <br />
          </div>
          <div className="caixa-overlay-info-row">
            <span>
              <b>IDs conectados:</b>{" "}
              {Array.isArray(caixa.ports) && caixa.ports.length
                ? caixa.ports.join(', ')
                : 'Nenhum'}
            </span>
          </div>
        </div>
        <div className="caixa-overlay-graficos">
          <div className="caixa-overlay-grafico">
            <div className="grafico-titulo">Ocupação (%)</div>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  isAnimationActive
                >
                  {donutData.map((entry, idx) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value}`, name]}
                  contentStyle={{
                    background: '#fff',
                    color: PALETA.color5,
                    borderRadius: 8,
                    border: `1.5px solid ${PALETA.color2}`,
                  }}
                />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="caixa-overlay-grafico">
            <div className="grafico-titulo">Ocupadas vs Livres</div>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <XAxis dataKey="name" stroke={PALETA.color2} />
                <YAxis stroke={PALETA.color2} allowDecimals={false} />
                <Tooltip
                  formatter={(value, name) => [`${value}`, name]}
                  contentStyle={{
                    background: '#fff',
                    color: PALETA.color5,
                    borderRadius: 8,
                    border: `1.5px solid ${PALETA.color2}`,
                  }}
                />
                <Legend verticalAlign="bottom" iconType="rect" />
                <Bar dataKey="Ocupadas" fill={PALETA.color4} radius={[8, 8, 0, 0]} barSize={30} />
                <Bar dataKey="Livres" fill={PALETA.color3} radius={[8, 8, 0, 0]} barSize={30} />
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
    const ocupadas = Array.isArray(cx.ports) ? cx.ports.length : 0;
    const livres = Math.max(0, capacidade - ocupadas);
    const perc = capacidade > 0 ? Math.round((ocupadas / capacidade) * 100) : 0;
    return {
      id: cx.ID || cx.Descrição || cx._id,
      descricao: cx.Descrição || cx.ID || cx._id,
      capacidade,
      ocupadas,
      livres,
      perc,
      ports: cx.ports || [], // <-- Aqui são puxadas as portas de cada CTO
      cidade: cx.Cidade || '',
      bairro: cx.Bairro || '',
      status: cx.Status || '',
      projeto: cx.Projeto || '',
      transmissor: cx['Transmissor(OLT)'] || '',
    };
  });
}

export default function TelaPrincipal({ setCtoId }) {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  // Novo estado para filtro único
  const [filtroCampo, setFiltroCampo] = useState('descricao');
  const [filtroValor, setFiltroValor] = useState('');
  const [caixaSelecionada, setCaixaSelecionada] = useState(null);
  const navigate = useNavigate();

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
  const handleCaixaClick = (cx) => {
    setCaixaSelecionada(cx);
    if (setCtoId) setCtoId(cx.id);
  };

  // Corrija o botão de editar para não impedir navegação
  const handleEditarClick = (cx, e) => {
    e.stopPropagation();
    console.log('Editar CTO clicado:', cx.id); // <-- Adicionado log para depuração
    if (setCtoId) setCtoId(cx.id);
    navigate(`/ctos/${cx.id}/editar`, { replace: false });
  };

  return (
    <div className="tela-principal-container">
      <header className="painel-header">
        <span className="painel-title">Painel de Caixas Ópticas</span>
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
                  <div className="painel-caixa-titulo" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <span>{cx.descricao}</span>
                    <button
                      type="button"
                      className="painel-caixa-editar-btn"
                      title="Editar CTO"
                      onClick={e => handleEditarClick(cx, e)}
                      tabIndex={0}
                    >
                      <Edit3 size={20} />
                    </button>
                  </div>
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
      />
    </div>
  );
}

