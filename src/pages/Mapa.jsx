import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import './Mapa.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Filtro de campo único
function FiltrosMapa({ filtroCampo, setFiltroCampo, filtroValor, setFiltroValor }) {
  const campos = [
    { value: 'descricao', label: 'Descrição' },
    { value: 'cidade', label: 'Cidade' },
    { value: 'bairro', label: 'Bairro' },
    { value: 'coordenada', label: 'Coordenada (lat long)' },
  ];
  return (
    <div className="mapa-filtros">
      <select
        value={filtroCampo}
        onChange={e => setFiltroCampo(e.target.value)}
        className="mapa-filtros-select"
        aria-label="Campo de filtro"
      >
        {campos.map(campo => (
          <option key={campo.value} value={campo.value}>{campo.label}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder={
          filtroCampo === 'coordenada'
            ? 'Ex: -23.5 -46.6'
            : `Filtrar por ${campos.find(c => c.value === filtroCampo)?.label || ''}`
        }
        value={filtroValor}
        onChange={e => setFiltroValor(e.target.value)}
        className="mapa-filtros-input"
        aria-label="Valor do filtro"
      />
    </div>
  );
}

// Filtro de OLTs (checkboxes)
function FiltroOLTs({ olts, oltsSelecionadas, setOltsSelecionadas }) {
  if (!olts.length) return null;
  return (
    <div className="mapa-olts-checkboxes">
      <span className="mapa-olts-label">OLT:</span>
      {olts.map(olt => (
        <label key={olt} className="mapa-olts-checkbox-label">
          <input
            type="checkbox"
            checked={oltsSelecionadas.includes(olt)}
            onChange={e => {
              if (e.target.checked) {
                setOltsSelecionadas([...oltsSelecionadas, olt]);
              } else {
                setOltsSelecionadas(oltsSelecionadas.filter(o => o !== olt));
              }
            }}
          />
          {olt}
        </label>
      ))}
    </div>
  );
}

export default function Mapa() {
  const [olts, setOlts] = useState([]);
  const [oltsSelecionadas, setOltsSelecionadas] = useState([]);
  const [ctos, setCtos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroCampo, setFiltroCampo] = useState('descricao');
  const [filtroValor, setFiltroValor] = useState('');

  // Busca apenas as OLTs (nomes) no início
  useEffect(() => {
    setLoading(true);
    getDocs(collection(db, 'tabela_csv')).then((snap) => {
      const oltsSet = new Set();
      snap.forEach(doc => {
        const data = doc.data();
        const olt = data['Transmissor(OLT)'] || data.OLT || '';
        if (olt) oltsSet.add(olt);
      });
      setOlts(Array.from(oltsSet).sort());
      setLoading(false);
    });
  }, []);

  // Busca CTOs apenas das OLTs selecionadas
  useEffect(() => {
    if (oltsSelecionadas.length === 0) {
      setCtos([]);
      return;
    }
    setLoading(true);
    // Busca por OLTs selecionadas (até 10 por vez, limite do Firestore)
    const fetchAll = async () => {
      let arr = [];
      // Firestore limita 10 itens por 'in', então faz em lotes se necessário
      const lotes = [];
      for (let i = 0; i < oltsSelecionadas.length; i += 10) {
        lotes.push(oltsSelecionadas.slice(i, i + 10));
      }
      for (const lote of lotes) {
        const q = query(
          collection(db, 'tabela_csv'),
          where('Transmissor(OLT)', 'in', lote)
        );
        const snap = await getDocs(q);
        snap.forEach(doc => {
          const data = doc.data();
          if (data.Latitude && data.Longitude) {
            arr.push({
              id: data.ID || doc.id,
              descricao: data.Descrição || data.ID || doc.id,
              latitude: parseFloat(data.Latitude),
              longitude: parseFloat(data.Longitude),
              cidade: data.Cidade || '',
              bairro: data.Bairro || '',
              olt: data['Transmissor(OLT)'] || data.OLT || '',
            });
          }
        });
      }
      setCtos(arr);
      setLoading(false);
    };
    fetchAll();
  }, [oltsSelecionadas]);

  // Filtragem dos CTOs (apenas dos já buscados)
  const ctosFiltrados = useMemo(() => {
    let arr = ctos;
    if (filtroValor) {
      if (filtroCampo === 'coordenada') {
        const [lat, lng] = filtroValor.trim().split(/\s+/);
        if (lat && lng) {
          arr = arr.filter(cto =>
            Math.abs(cto.latitude - parseFloat(lat)) < 0.0001 &&
            Math.abs(cto.longitude - parseFloat(lng)) < 0.0001
          );
        } else {
          arr = [];
        }
      } else {
        arr = arr.filter(cto =>
          (cto[filtroCampo] || '').toLowerCase().includes(filtroValor.toLowerCase())
        );
      }
    }
    return arr;
  }, [ctos, filtroCampo, filtroValor]);

  // Centro do mapa: primeiro ponto filtrado ou Brasil
  const center = ctosFiltrados.length
    ? [ctosFiltrados[0].latitude, ctosFiltrados[0].longitude]
    : [-14.235, -51.925];

  return (
    <div className="mapa-container">
      <h2 className="mapa-title">Mapa de CTOs</h2>
      <div className="mapa-filtros-row">
        <FiltrosMapa
          filtroCampo={filtroCampo}
          setFiltroCampo={setFiltroCampo}
          filtroValor={filtroValor}
          setFiltroValor={setFiltroValor}
        />
        <FiltroOLTs
          olts={olts}
          oltsSelecionadas={oltsSelecionadas}
          setOltsSelecionadas={setOltsSelecionadas}
        />
      </div>
      <div className="mapa-mapa-wrapper">
        <MapContainer center={center} zoom={6} scrollWheelZoom style={{ height: '70vh', width: '100%', borderRadius: 16 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Só renderiza pontos se houver OLT selecionada */}
          {ctosFiltrados.map(cto => (
            <Marker key={cto.id} position={[cto.latitude, cto.longitude]}>
              <Popup>
                <b>{cto.descricao}</b>
                <br />
                {cto.cidade && <span>Cidade: {cto.cidade}<br /></span>}
                {cto.bairro && <span>Bairro: {cto.bairro}<br /></span>}
                {cto.olt && <span>OLT: {cto.olt}<br /></span>}
                <span>Lat: {cto.latitude.toFixed(5)}<br />Lng: {cto.longitude.toFixed(5)}</span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        {loading && (
          <div className="mapa-loading">Carregando pontos...</div>
        )}
        {!loading && oltsSelecionadas.length > 0 && ctosFiltrados.length === 0 && (
          <div className="mapa-sem-pontos">Nenhum ponto encontrado com os filtros selecionados.</div>
        )}
        {!loading && oltsSelecionadas.length === 0 && (
          <div className="mapa-sem-pontos">Selecione pelo menos uma OLT para exibir pontos no mapa.</div>
        )}
      </div>
    </div>
  );
}
