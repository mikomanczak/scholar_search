import { FormEvent, useState } from 'react';
import InfoIcon from './InfoIcon';
import QuerySyntaxHelp from './QuerySyntaxHelp';

const EXAMPLE_KEYWORDS = [
  'battery electric vehicle',
  'BEV',
  'electric cars',
  'EV battery',
  'lithium ion battery',
  'battery technology',
  'range anxiety',
];

export default function InputForm({ onSearch }: { onSearch: () => void }) {
  const [keywordText, setKeywordText] = useState(EXAMPLE_KEYWORDS.join('\n'));
  const [resultsPerKeyword, setResultsPerKeyword] = useState('50');
  const [startYear, setStartYear] = useState('2010');
  const [endYear, setEndYear] = useState('2024');
  const [openAccessOnly, setOpenAccessOnly] = useState(false);

  const keywords = keywordText
    .split(/\r?\n/)
    .map(keyword => keyword.trim())
    .filter(Boolean);
  const keywordCount = Math.min(keywords.length, 20);

  const handleKeywordChange = (value: string) => {
    const lines = value.split(/\r?\n/);
    setKeywordText(lines.slice(0, 20).join('\n'));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <section className="card queries-card" aria-labelledby="queries-heading">
          <h2 className="card-heading">Queries</h2>
          <label className="field-label" htmlFor="keywords">
            Enter queries to search for (one per line) <InfoIcon />
          </label>
          <div className="queries-content">
            <textarea
              id="keywords"
              value={keywordText}
              onChange={event => handleKeywordChange(event.target.value)}
              placeholder="Enter up to 20 queries"
              spellCheck={false}
            />
            <QuerySyntaxHelp />
          </div>
          <p className="keyword-count" aria-live="polite">
            {keywordCount} / 20 queries
          </p>
        </section>

        <section className="card settings-card" aria-labelledby="settings-heading">
          <h2 className="card-heading" id="settings-heading">Search settings</h2>

          <label className="field-label" htmlFor="results-per-keyword">
            Results per query
          </label>
          <select
            id="results-per-keyword"
            value={resultsPerKeyword}
            onChange={event => setResultsPerKeyword(event.target.value)}
          >
            <option value="25">25</option>
            <option value="50">50 (recommended)</option>
            <option value="100">100</option>
          </select>

          <fieldset className="year-fieldset">
            <legend>Year range (optional)</legend>
            <div className="year-range">
              <input
                type="number"
                min="1900"
                max="2100"
                aria-label="Start year"
                value={startYear}
                onChange={event => setStartYear(event.target.value)}
                placeholder="From"
              />
              <span aria-hidden="true">–</span>
              <input
                type="number"
                min="1900"
                max="2100"
                aria-label="End year"
                value={endYear}
                onChange={event => setEndYear(event.target.value)}
                placeholder="To"
              />
            </div>
          </fieldset>

          <div className="toggle-row">
            <div>
              <span className="toggle-title">Open Access Only</span>
              <span className="toggle-description">
                Filter results to include only open access papers
              </span>
            </div>
            <button
              className={`toggle ${openAccessOnly ? 'toggle--on' : ''}`}
              type="button"
              role="switch"
              aria-checked={openAccessOnly}
              aria-label="Open access only"
              onClick={() => setOpenAccessOnly(value => !value)}
            >
              <span />
            </button>
          </div>
          <div className="submit-bar">
            <button className="primary-button" type="submit" disabled={keywordCount === 0}>
              <span className="search-icon" aria-hidden="true" />
              Start Search
            </button>
          </div>
        </section>
      </div>


    </form>
  );
}
