import { useState } from 'react';
import Papa from 'papaparse';
import { doc, writeBatch } from "firebase/firestore";
import { db, auth } from '../firebase';
import './UploadCSV.css';

export default function UploadCSV() {
  const [csvData, setCsvData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setCsvData(result.data);
        },
      });
    }
  };

  const handleUploadToFirebase = async () => {
    if (!csvData) {
      alert('Por favor, selecione um arquivo CSV primeiro.');
      return;
    }

    setLoading(true);
    try {
      const totalRows = csvData.length;
      let completedRows = 0;
      const batchSize = 500;
      let batch = writeBatch(db);
      let batchCount = 0;

      for (const row of csvData) {
        const docRef = doc(db, "tabela_csv", row.ID);
        batch.set(docRef, row, { merge: true });
        batchCount++;
        completedRows++;

        if (batchCount === batchSize || completedRows === totalRows) {
          try {
            await batch.commit();
            batch = writeBatch(db);
            batchCount = 0;
          } catch (batchError) {
            if (batchError.message?.includes('maximum backoff delay') ||
                batchError.code === 'resource-exhausted') {
              alert('Limite do Firebase atingido! Aguarde alguns minutos antes de tentar novamente.');
              throw batchError;
            }
            throw batchError;
          }
        }
        setProgress(Math.round((completedRows / totalRows) * 100));
      }
      alert('Dados enviados com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar dados para o Firebase:', error);
      if (!error.message?.includes('maximum backoff delay')) {
        alert('Erro ao enviar dados. Verifique o console para mais detalhes.');
      }
    } finally {
      setProgress(0);
      setLoading(false);
    }
  };

  return (
    <div className="uploadcsv-container">
      <header className="uploadcsv-header">
        <h1>Gerenciador de Upload CSV</h1>
      </header>
      <main className="uploadcsv-main">
        <div className="uploadcsv-section">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="uploadcsv-file-input"
            disabled={loading}
          />
          <button
            onClick={handleUploadToFirebase}
            disabled={!csvData || loading}
            className="uploadcsv-upload-button"
          >
            Enviar para Firebase
          </button>
        </div>
        {progress > 0 && (
          <div className="uploadcsv-progress-section">
            <progress value={progress} max="100" />
            <span>{progress}%</span>
          </div>
        )}
        {csvData && (
          <div className="uploadcsv-data-preview">
            <h3>Dados Carregados</h3>
            <p>Total de registros: {csvData.length}</p>
          </div>
        )}
        <button className="uploadcsv-logout-btn" onClick={() => auth.signOut()}>Sair</button>
      </main>
    </div>
  );
}
