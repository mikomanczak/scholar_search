import { useState } from 'react';
import Export from './components/Export';
import InputForm from './components/InputForm';
import Results from './components/Results';
import { SearchProvider } from './context/SearchContext';
import { View } from './types';
import './App.css';

export default function App() {
  const [view, setView] = useState<View>('input');

  return (
    <SearchProvider>
      <main className="app-shell">
        {view === 'input' && <InputForm onSearch={() => setView('results')} />}
        {view === 'results' && <Results />}
        {view === 'export' && <Export />}
      </main>
    </SearchProvider>
  );
}
