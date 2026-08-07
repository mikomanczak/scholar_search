import { useState } from 'react';
import Export from './components/Export';
import InputForm from './components/InputForm';
import Results from './components/Results';
import Stepper from './components/Stepper';
import { View } from './types';
import './App.css';

export default function App() {
  const [view, setView] = useState<View>('input');

  return (
    <main className="app-shell">
      <Stepper currentView={view} onChange={setView} />
      {view === 'input' && <InputForm onSearch={() => setView('results')} />}
      {view === 'results' && <Results />}
      {view === 'export' && <Export />}
    </main>
  );
}
