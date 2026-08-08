import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

const MAX_KEYWORDS = 20;
const STORAGE_KEY = 'augmented-search:state:v1';

const EXAMPLE_KEYWORDS = [
  'battery electric vehicle',
  'BEV',
  'electric cars',
  'EV battery',
  'lithium ion battery',
  'battery technology',
  'range anxiety',
];

type PersistedState = {
  keywordText: string;
  resultsPerKeyword: string;
  startYear: string;
  endYear: string;
  openAccessOnly: boolean;
};

const DEFAULT_STATE: PersistedState = {
  keywordText: EXAMPLE_KEYWORDS.join('\n'),
  resultsPerKeyword: '50',
  startYear: '2010',
  endYear: '2024',
  openAccessOnly: false,
};

function loadPersistedState(): PersistedState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      keywordText: typeof parsed.keywordText === 'string' ? parsed.keywordText : DEFAULT_STATE.keywordText,
      resultsPerKeyword:
        typeof parsed.resultsPerKeyword === 'string' ? parsed.resultsPerKeyword : DEFAULT_STATE.resultsPerKeyword,
      startYear: typeof parsed.startYear === 'string' ? parsed.startYear : DEFAULT_STATE.startYear,
      endYear: typeof parsed.endYear === 'string' ? parsed.endYear : DEFAULT_STATE.endYear,
      openAccessOnly:
        typeof parsed.openAccessOnly === 'boolean' ? parsed.openAccessOnly : DEFAULT_STATE.openAccessOnly,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

type SearchContextValue = {
  keywordText: string;
  setKeywordText: (value: string) => void;
  keywords: string[];
  keywordCount: number;
  resultsPerKeyword: string;
  setResultsPerKeyword: (value: string) => void;
  startYear: string;
  setStartYear: (value: string) => void;
  endYear: string;
  setEndYear: (value: string) => void;
  openAccessOnly: boolean;
  setOpenAccessOnly: (value: boolean | ((prev: boolean) => boolean)) => void;
  maxKeywords: number;
};

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(loadPersistedState, []);
  const [keywordText, setKeywordTextRaw] = useState(initial.keywordText);
  const [resultsPerKeyword, setResultsPerKeyword] = useState(initial.resultsPerKeyword);
  const [startYear, setStartYear] = useState(initial.startYear);
  const [endYear, setEndYear] = useState(initial.endYear);
  const [openAccessOnly, setOpenAccessOnly] = useState(initial.openAccessOnly);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const payload: PersistedState = {
        keywordText,
        resultsPerKeyword,
        startYear,
        endYear,
        openAccessOnly,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore quota / access errors
    }
  }, [keywordText, resultsPerKeyword, startYear, endYear, openAccessOnly]);

  const setKeywordText = (value: string) => {
    const lines = value.split(/\r?\n/);
    setKeywordTextRaw(lines.slice(0, MAX_KEYWORDS).join('\n'));
  };

  const { keywords, keywordCount } = useMemo(() => {
    const parsed = keywordText
      .split(/\r?\n/)
      .map(keyword => keyword.trim())
      .filter(Boolean);
    return {
      keywords: parsed,
      keywordCount: Math.min(parsed.length, MAX_KEYWORDS),
    };
  }, [keywordText]);

  const value: SearchContextValue = {
    keywordText,
    setKeywordText,
    keywords,
    keywordCount,
    resultsPerKeyword,
    setResultsPerKeyword,
    startYear,
    setStartYear,
    endYear,
    setEndYear,
    openAccessOnly,
    setOpenAccessOnly,
    maxKeywords: MAX_KEYWORDS,
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return ctx;
}
