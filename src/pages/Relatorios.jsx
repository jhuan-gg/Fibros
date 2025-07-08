import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText } from 'lucide-react';
import './Relatorios.css'; // ajuste para usar o CSS dedicado

const PALETA = {
  color1: '#fde6bd',
  color2: '#a1c5ab',
  color3: '#f4dd51',
  color4: '#d11e48',
  color5: '#632f53',
};

function exportCSV(data, filename) {
  if (!data.length) return;
  const cols = Object.keys(data[0]);
  const csv = [
    cols.join(','),
    ...data.map(row => cols.map(c => `"${String(row[c] ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
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
      ports: cx.ports || [],
      cidade: cx.Cidade || '',
      bairro: cx.Bairro || '',
      status: cx.Status || '',
      projeto: cx.Projeto || '',
      transmissor: cx['Transmissor(OLT)'] || '',
    };
  });
}

export default function Relatorios() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [cidade, setCidade] = useState('');
  const [status, setStatus] = useState('');
  const [projeto, setProjeto] = useState('');

  useEffect(() => {
    setLoading(true);
    getDocs(collection(db, 'tabela_csv')).then((snap) => {
      const arr = [];
      snap.forEach(doc => arr.push({ ...doc.data(), _id: doc.id }));
      setDados(arr);
      setLoading(false);
    });
  }, []);

  // Dados filtrados
  const caixas = useMemo(() => {
    let arr = getCaixasFormatadas(dados);
    if (cidade) arr = arr.filter(cx => (cx.cidade || '').toLowerCase() === cidade.toLowerCase());
    if (status) arr = arr.filter(cx => (cx.status || '').toLowerCase() === status.toLowerCase());
    if (projeto) arr = arr.filter(cx => (cx.projeto || '').toLowerCase() === projeto.toLowerCase());
    return arr;
  }, [dados, cidade, status, projeto]);

  // Opções de filtros dinâmicos
  const cidades = useMemo(() => [...new Set(getCaixasFormatadas(dados).map(cx => cx.cidade).filter(Boolean))], [dados]);
  const statusList = useMemo(() => [...new Set(getCaixasFormatadas(dados).map(cx => cx.status).filter(Boolean))], [dados]);
  const projetos = useMemo(() => [...new Set(getCaixasFormatadas(dados).map(cx => cx.projeto).filter(Boolean))], [dados]);

  // Relatório de ocupação geral
  const ocupacaoGeral = useMemo(() => {
    const total = caixas.reduce((acc, cx) => acc + cx.capacidade, 0);
    const ocupadas = caixas.reduce((acc, cx) => acc + cx.ocupadas, 0);
    const livres = caixas.reduce((acc, cx) => acc + cx.livres, 0);
    return {
      total,
      ocupadas,
      livres,
      perc: total > 0 ? Math.round((ocupadas / total) * 100) : 0,
    };
  }, [caixas]);

  // Caixas com maior e menor uso
  const caixasMaiorUso = [...caixas].sort((a, b) => b.perc - a.perc).slice(0, 5);
  const caixasMenorUso = [...caixas].sort((a, b) => a.perc - b.perc).slice(0, 5);

  // Relatório de portas por cidade/projeto
  const portasPorCidade = useMemo(() => {
    const map = {};
    caixas.forEach(cx => {
      if (!map[cx.cidade]) map[cx.cidade] = { cidade: cx.cidade, ocupadas: 0, livres: 0 };
      map[cx.cidade].ocupadas += cx.ocupadas;
      map[cx.cidade].livres += cx.livres;
    });
    return Object.values(map);
  }, [caixas]);

  const portasPorProjeto = useMemo(() => {
    const map = {};
    caixas.forEach(cx => {
      if (!map[cx.projeto]) map[cx.projeto] = { projeto: cx.projeto, ocupadas: 0, livres: 0 };
      map[cx.projeto].ocupadas += cx.ocupadas;
      map[cx.projeto].livres += cx.livres;
    });
    return Object.values(map);
  }, [caixas]);

  // IDS conectados por caixa
  const idsPorCaixa = caixas.map(cx => ({
    descricao: cx.descricao,
    ids: Array.isArray(cx.ports) ? cx.ports.length : 0,
  }));

  // Capacidade excedida (>80%)
  const caixasExcedidas = caixas.filter(cx => cx.perc > 80);

  // Localização por cidade/bairro
  const distPorCidade = useMemo(() => {
    const map = {};
    caixas.forEach(cx => {
      if (!map[cx.cidade]) map[cx.cidade] = 0;
      map[cx.cidade]++;
    });
    return Object.entries(map).map(([cidade, qtd]) => ({ cidade, qtd }));
  }, [caixas]);

  // Alternância de visualização
  const [modoVisual, setModoVisual] = useState(true);

  return (
    <div className="relatorios-container">
      <header className="relatorios-header">
        <span className="relatorios-title">Gerenciamento de Relatórios</span>
      </header>

      <div className="relatorios-filtros">
        <select value={cidade} onChange={e => setCidade(e.target.value)} className="painel-filtros-select">
          <option value="">Todas as cidades</option>
          {cidades.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="painel-filtros-select">
          <option value="">Todos os status</option>
          {statusList.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={projeto} onChange={e => setProjeto(e.target.value)} className="painel-filtros-select">
          <option value="">Todos os projetos</option>
          {projetos.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button
          className="relatorios-export-btn"
          onClick={() => { setCidade(''); setStatus(''); setProjeto(''); }}
          type="button"
        >
          Limpar filtros
        </button>
        <button
          className="relatorios-export-btn"
          onClick={() => setModoVisual(v => !v)}
          type="button"
        >
          {modoVisual ? 'Modo Lista' : 'Modo Visual'}
        </button>
      </div>

      {loading ? (
        <div className="painel-loading">Carregando relatórios...</div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
          {/* Ocupação Geral */}
          <div className="relatorios-card">
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <h2>Ocupação Geral</h2>
              <button className="relatorios-export-btn" onClick={() => exportCSV(caixas, 'ocupacao_geral.csv')} title="Exportar CSV">
                <Download size={18} style={{marginRight: 4}} /> CSV
              </button>
            </div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center'}}>
              <div style={{minWidth: 220, flex: 1}}>
                <div style={{fontWeight: 700, fontSize: 22, color: 'var(--color-primary)'}}>
                  {ocupacaoGeral.perc}% ocupação
                </div>
                <div style={{color: 'var(--color-secondary)', fontSize: 16}}>
                  {ocupacaoGeral.ocupadas} ocupadas / {ocupacaoGeral.total} portas
                </div>
              </div>
              <div className="relatorios-grafico-container">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Ocupadas', value: ocupacaoGeral.ocupadas, color: PALETA.color4 },
                        { name: 'Livres', value: ocupacaoGeral.livres, color: PALETA.color3 },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      <Cell fill={PALETA.color4} />
                      <Cell fill={PALETA.color3} />
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Caixas com maior e menor uso */}
          <div className="relatorios-card">
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <h2>Caixas com Maior e Menor Uso</h2>
              <button className="relatorios-export-btn" onClick={() => exportCSV([...caixasMaiorUso, ...caixasMenorUso], 'caixas_uso.csv')} title="Exportar CSV">
                <Download size={18} style={{marginRight: 4}} /> CSV
              </button>
            </div>
            <div className="relatorios-tabela-scroll">
              <table className="relatorios-tabela">
                <thead>
                  <tr>
                    <th>Caixa</th>
                    <th>Capacidade</th>
                    <th>Ocupadas</th>
                    <th>Livres</th>
                    <th>% Ocupação</th>
                  </tr>
                </thead>
                <tbody>
                  {caixasMaiorUso.map(cx => (
                    <tr key={cx.id} className={cx.perc > 80 ? 'relatorios-alerta' : ''}>
                      <td>{cx.descricao}</td>
                      <td>{cx.capacidade}</td>
                      <td>{cx.ocupadas}</td>
                      <td>{cx.livres}</td>
                      <td>{cx.perc}%</td>
                    </tr>
                  ))}
                  {caixasMenorUso.map(cx => (
                    <tr key={cx.id + '-menor'}>
                      <td>{cx.descricao}</td>
                      <td>{cx.capacidade}</td>
                      <td>{cx.ocupadas}</td>
                      <td>{cx.livres}</td>
                      <td>{cx.perc}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Portas disponíveis vs ocupadas por cidade */}
          <div className="relatorios-card" style={{marginBottom: 16}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <h2 style={{margin: 0, fontWeight: 800, color: 'var(--color-accent)'}}>Portas Ocupadas vs Livres por Cidade</h2>
              <button className="painel-tabela-btn" onClick={() => exportCSV(portasPorCidade, 'portas_por_cidade.csv')} title="Exportar CSV">
                <Download size={18} style={{marginRight: 4}} /> CSV
              </button>
            </div>
            <div style={{width: '100%', height: 260}}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={portasPorCidade}>
                  <XAxis dataKey="cidade" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ocupadas" fill={PALETA.color4} name="Ocupadas" />
                  <Bar dataKey="livres" fill={PALETA.color3} name="Livres" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* IDS conectados por caixa */}
          <div className="card" style={{marginBottom: 16}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <h2 style={{margin: 0, fontWeight: 800, color: 'var(--color-accent)'}}>IDs Conectados por Caixa</h2>
              <button className="painel-tabela-btn" onClick={() => exportCSV(idsPorCaixa, 'ids_por_caixa.csv')} title="Exportar CSV">
                <Download size={18} style={{marginRight: 4}} /> CSV
              </button>
            </div>
            <div className="painel-tabela-scroll" style={{overflowX: 'auto'}}>
              <table className="painel-tabela-table">
                <thead>
                  <tr>
                    <th>Caixa</th>
                    <th>Qtd. IDs conectados</th>
                  </tr>
                </thead>
                <tbody>
                  {idsPorCaixa.map(cx => (
                    <tr key={cx.descricao}>
                      <td>{cx.descricao}</td>
                      <td>{cx.ids}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Capacidade excedida */}
          <div className="card" style={{marginBottom: 16}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <h2 style={{margin: 0, fontWeight: 800, color: 'var(--color-accent)'}}>Caixas com Capacidade Excedida (&gt; 80%)</h2>
              <button className="painel-tabela-btn" onClick={() => exportCSV(caixasExcedidas, 'caixas_excedidas.csv')} title="Exportar CSV">
                <Download size={18} style={{marginRight: 4}} /> CSV
              </button>
            </div>
            <div className="painel-tabela-scroll" style={{overflowX: 'auto'}}>
              <table className="painel-tabela-table">
                <thead>
                  <tr>
                    <th>Caixa</th>
                    <th>Capacidade</th>
                    <th>Ocupadas</th>
                    <th>Livres</th>
                    <th>% Ocupação</th>
                  </tr>
                </thead>
                <tbody>
                  {caixasExcedidas.map(cx => (
                    <tr key={cx.id} className="tabela-alerta">
                      <td>{cx.descricao}</td>
                      <td>{cx.capacidade}</td>
                      <td>{cx.ocupadas}</td>
                      <td>{cx.livres}</td>
                      <td>{cx.perc}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Distribuição por cidade */}
          <div className="card" style={{marginBottom: 16}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <h2 style={{margin: 0, fontWeight: 800, color: 'var(--color-accent)'}}>Distribuição de Caixas por Cidade</h2>
              <button className="painel-tabela-btn" onClick={() => exportCSV(distPorCidade, 'caixas_por_cidade.csv')} title="Exportar CSV">
                <Download size={18} style={{marginRight: 4}} /> CSV
              </button>
            </div>
            <div style={{width: '100%', height: 260}}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={distPorCidade}>
                  <XAxis dataKey="cidade" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="qtd" fill={PALETA.color2} name="Qtd. Caixas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* IDs Conectados por Caixa - Seção Exemplo */}
          <div className="relatorios-section">
            <div className="relatorios-section-title">IDs Conectados por Caixa</div>
            <div className="relatorios-ids-por-caixa">
              {/* Renderize aqui sua lista de IDs por caixa */}
              {/* Exemplo: */}
              <ul>
                {idsPorCaixa.map(cx => (
                  <li key={cx.descricao}>{cx.descricao}: {cx.ids}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
