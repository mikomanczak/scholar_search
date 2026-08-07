const OPERATORS = [
  ['+', 'for AND operation'],
  ['|', 'for OR operation'],
  ['-', 'negates a term'],
  ['" "', 'collects terms into a phrase'],
  ['*', 'can be used to match a prefix'],
  ['( )', 'for precedence'],
  ['~N', 'after a word matches within the edit distance of N (Defaults to 2 if N is omitted)'],
  ['"..."~N', 'after a phrase matches with the phrase terms separated up to N terms apart'],
];

const EXAMPLES = [
  ['fish ladder', 'matches papers that contain “fish” and “ladder”'],
  ['fish -ladder', 'matches papers that contain “fish” but not “ladder”'],
  ['fish | ladder', 'matches papers that contain “fish” or “ladder”'],
  ['"fish ladder"', 'matches papers that contain the phrase “fish ladder”'],
  ['(fish ladder) | outflow', 'matches papers that contain “fish” and “ladder” OR “outflow”'],
  ['fish~', 'matches papers that contain “fish”, “fist”, “fihs”, etc.'],
  ['"fish ladder"~3', 'matches papers that contain the phrase “fish ladder” or “fish is on a ladder”'],
];

function SyntaxList({ items }: { items: string[][] }) {
  return (
    <ul className="syntax-list">
      {items.map(([syntax, description]) => (
        <li key={syntax}>
          <code>{syntax}</code>
          <span>{description}</span>
        </li>
      ))}
    </ul>
  );
}

export default function QuerySyntaxHelp() {
  return (
    <aside className="syntax-help" aria-label="Query syntax help">
      <p className="syntax-heading">Query supports the following syntax:</p>
      <SyntaxList items={OPERATORS} />
      <p className="syntax-examples-heading">Examples:</p>
      <SyntaxList items={EXAMPLES} />
    </aside>
  );
}
