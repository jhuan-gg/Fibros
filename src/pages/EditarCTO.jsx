import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './EditarCTO.css';

export default function EditarCTO({ usuario }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cto, setCto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [confirmar, setConfirmar] = useState(false);

  // Novo: lista de CTOs para busca
  const [listaCtos, setListaCtos] = useState([]);
  const [busca, setBusca] = useState('');
  const [ctoSelecionada, setCtoSelecionada] = useState(id || '');

  // Permissão: só admin pode acessar
  useEffect(() => {
    if (!usuario || usuario.tipo !== 'admin') {
      navigate('/principal');
    }
  }, [usuario, navigate]);

  // Busca lista de CTOs para seleção
  useEffect(() => {
    if (!id) {
      setLoading(true);
      getDocs(collection(db, 'tabela_csv')).then((snap) => {
        const arr = [];
        snap.forEach(doc => arr.push({ id: doc.id, descricao: doc.data().Descrição || doc.id }));
        setListaCtos(arr);
        setLoading(false);
      });
    }
  }, [id]);

  // Busca CTO selecionada
  useEffect(() => {
    if (!ctoSelecionada) {
      setCto(null);
      return;
    }
    setLoading(true);
    getDoc(doc(db, 'tabela_csv', ctoSelecionada)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setCto({
          ...data,
          ports: Array.isArray(data.Ports) ? [...data.Ports] : [],
          Descrição: data.Descrição || '',
          Numero: data.Numero || '',
          Projeto: data.Projeto || '',
          Capacidade: data.Capacidade || 0,
          Status: data.Status || '',
        });
        setErro('');
      } else {
        setErro('CTO não encontrada.');
        setCto(null);
      }
      setLoading(false);
    });
  }, [ctoSelecionada]);

  // Handlers de edição
  const handleChange = (campo, valor) => setCto(cto => ({ ...cto, [campo]: valor }));
  const handlePortaChange = (idx, valor) => {
    setCto(cto => {
      const ports = [...cto.ports];
      ports[idx] = valor;
      return { ...cto, ports };
    });
  };
  const handleAddPorta = () => setCto(cto => ({ ...cto, ports: [...cto.ports, ''] }));
  const handleRemovePorta = (idx) => setCto(cto => ({ ...cto, ports: cto.ports.filter((_, i) => i !== idx) }));

  // Salvar alterações
  const handleSalvar = async () => {
    setErro('');
    setSucesso('');
    setSalvando(true);
    try {
      await updateDoc(doc(db, 'tabela_csv', ctoSelecionada), {
        Descrição: cto.Descrição,
        Numero: cto.Numero,
        Projeto: cto.Projeto,
        Capacidade: Number(cto.Capacidade),
        Status: cto.Status,
        Ports: cto.ports,
      });
      setSucesso('Alterações salvas com sucesso!');
      setConfirmar(false);
    } catch (e) {
      setErro('Erro ao salvar alterações.');
    }
    setSalvando(false);
  };

  // Busca filtrada para seleção
  const ctosFiltrados = listaCtos.filter(c =>
    c.descricao.toLowerCase().includes(busca.toLowerCase()) || c.id.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) return <div className="painel-loading">Carregando CTO...</div>;
  if (!ctoSelecionada) {
    return (
      <div className="editar-cto-container">
        <header className="editar-cto-header">
          <span className="fibros-highlight painel-logo">Fibros!</span>
          <span className="editar-cto-title">Editar CTO</span>
        </header>
        <div className="card" style={{marginTop: 32, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto'}}>
          <h2>Selecione uma CTO para editar</h2>
          <input
            type="text"
            placeholder="Buscar por descrição ou ID"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{marginBottom: 16, width: '100%'}}
          />
          <div style={{maxHeight: 300, overflowY: 'auto', marginBottom: 16}}>
            {ctosFiltrados.length === 0 && <div style={{color: 'var(--color-muted)'}}>Nenhuma CTO encontrada.</div>}
            {ctosFiltrados.map(cto => (
              <div
                key={cto.id}
                style={{
                  padding: '10px 8px',
                  borderBottom: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  color: 'var(--color-accent)'
                }}
                onClick={() => setCtoSelecionada(cto.id)}
                tabIndex={0}
                role="button"
                aria-label={`Editar CTO ${cto.descricao}`}
              >
                <b>{cto.descricao}</b>
                <span style={{color: 'var(--color-muted)', fontSize: 13, marginLeft: 8}}>{cto.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (erro) return <div className="painel-alerta">{erro}</div>;
  if (!cto) return null;

  return (
    <div className="editar-cto-container">
      <header className="editar-cto-header">
        <span className="editar-cto-title">Editar CTO</span>
      </header>
      <div className="card">
        <form className="editar-cto-form" onSubmit={e => {e.preventDefault(); setConfirmar(true);}}>
          <section className="editar-cto-section">
            <h2>Identificação</h2>
            <div>
              <label>
                Descrição:
                <input type="text" value={cto.Descrição} onChange={e => handleChange('Descrição', e.target.value)} required />
              </label>
              <label>
                Número:
                <input type="text" value={cto.Numero} onChange={e => handleChange('Numero', e.target.value)} />
              </label>
              <label>
                Projeto:
                <input type="text" value={cto.Projeto} onChange={e => handleChange('Projeto', e.target.value)} />
              </label>
              <label>
                Capacidade:
                <input type="number" min={0} value={cto.Capacidade} onChange={e => handleChange('Capacidade', e.target.value)} required />
              </label>
              <label>
                Status:
                <input type="text" value={cto.Status} onChange={e => handleChange('Status', e.target.value)} />
              </label>
            </div>
          </section>
          <section className="editar-cto-section">
            <h2>Portas e IDs conectados</h2>
            <div className="editar-cto-portas-list">
              {cto.ports.map((idPorta, idx) => (
                <div key={idx} className={`editar-cto-porta-row${!idPorta ? ' livre' : ''}`}>
                  <span className={`editar-cto-porta-label${!idPorta ? ' livre' : ''}`}>
                    Porta {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={idPorta}
                    onChange={e => handlePortaChange(idx, e.target.value)}
                    placeholder="ID conectado"
                    className={`editar-cto-porta-input${!idPorta ? ' livre' : ''}`}
                  />
                  <button type="button" className="editar-cto-porta-remover" onClick={() => handleRemovePorta(idx)}>
                    Remover
                  </button>
                </div>
              ))}
              <button type="button" className="editar-cto-porta-adicionar" onClick={handleAddPorta}>
                Adicionar Porta
              </button>
            </div>
          </section>
          {erro && <div className="painel-alerta">{erro}</div>}
          {sucesso && <div className="painel-alerta" style={{background: 'var(--color-success)', color: '#fff'}}>{sucesso}</div>}
          <div className="editar-cto-actions">
            <button type="submit" className="painel-tabela-btn" disabled={salvando}>Salvar alterações</button>
            <button type="button" className="painel-tabela-btn" style={{background: '#eee', color: '#333'}} onClick={() => navigate(-1)}>Cancelar</button>
          </div>
        </form>
      </div>
      {/* Confirmação antes de salvar */}
      {confirmar && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.25)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{maxWidth: 340, textAlign: 'center'}}>
            <h3 style={{color: 'var(--color-danger)'}}>Confirmar alterações?</h3>
            <p>Tem certeza que deseja salvar as mudanças nesta CTO?</p>
            <div style={{display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16}}>
              <button className="painel-tabela-btn" style={{background: 'var(--color-danger)', color: '#fff'}} onClick={handleSalvar} disabled={salvando}>Sim, salvar</button>
              <button className="painel-tabela-btn" onClick={() => setConfirmar(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
