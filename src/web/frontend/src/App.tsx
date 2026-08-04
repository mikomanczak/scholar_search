import React, { useState, DragEvent, ChangeEvent } from 'react';

type Mode = 'file' | 'text';

function parseKeywords(content: string, filename: string): string[] {
  if (filename.toLowerCase().endsWith('.json')) {
    const data = JSON.parse(content);
    if (Array.isArray(data)) return data.map(String);
    if (Array.isArray(data.keywords)) return data.keywords.map(String);
    throw new Error('JSON must be an array or { "keywords": [...] }');
  }
  return content
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && l.toLowerCase() !== 'keyword');
}

export default function App() {
  const [mode, setMode] = useState<Mode>('text');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    setFileName(file.name);
    try {
      const text = await file.text();
      setKeywords(parseKeywords(text, file.name));
    } catch (e) {
      setError((e as Error).message);
      setKeywords([]);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onSubmitText = () => {
    setError(null);
    const list = text.split(',').map(k => k.trim()).filter(Boolean);
    setKeywords(list);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Semantic Scholar Search</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '1rem' }}>
          <input type="radio" checked={mode === 'text'} onChange={() => setMode('text')} /> Text input
        </label>
        <label>
          <input type="radio" checked={mode === 'file'} onChange={() => setMode('file')} /> File upload
        </label>
      </div>

      {mode === 'text' ? (
        <div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Enter keywords, comma-separated"
            rows={4}
            style={{ width: '100%', padding: '0.5rem' }}
          />
          <button onClick={onSubmitText} style={{ marginTop: '0.5rem' }}>Use keywords</button>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{
            border: `2px dashed ${dragging ? '#333' : '#aaa'}`,
            background: dragging ? '#f0f0f0' : 'transparent',
            padding: '2rem',
            textAlign: 'center',
            borderRadius: 8,
          }}
        >
          <p>Drag & drop a .csv or .json file here</p>
          <p>or</p>
          <input type="file" accept=".csv,.json" onChange={onFileInput} />
          {fileName && <p style={{ marginTop: '0.5rem' }}>Loaded: {fileName}</p>}
        </div>
      )}

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {keywords.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Keywords ({keywords.length})</h3>
          <ul>{keywords.map((k, i) => <li key={i}>{k}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
