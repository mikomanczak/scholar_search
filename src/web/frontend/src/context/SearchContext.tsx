import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

const MAX_KEYWORDS = 20;

const EXAMPLE_KEYWORDS = [
  'battery electric vehicle',
  'BEV',
  'electric cars',
  'EV battery',
  'lithium ion battery',
  'battery technology',
  'range anxiety',
];

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
  const [keywordText, setKeywordTextRaw] = useState(EXAMPLE_KEYWORDS.join('\n'));
  const [resultsPerKeyword, setResultsPerKeyword] = useState('50');
  const [startYear, setStartYear] = useState('2010');
  const [endYear, setEndYear] = useState('2024');
  const [openAccessOnly, setOpenAccessOnly] = useState(false);

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
