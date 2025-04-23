import { useEffect, useState } from 'react';
import { FiTrendingUp, FiBarChart2, FiAward, FiLogOut, FiPlus } from 'react-icons/fi';
import Fuse from 'fuse.js';

const baseCommands = [
  { name: 'Go to Quick Stats', icon: <FiTrendingUp />, action: (setTab) => setTab('quickStats') },
  { name: 'Go to Analytics', icon: <FiBarChart2 />, action: (setTab) => setTab('analytics') },
  { name: 'Go to Achievements', icon: <FiAward />, action: (setTab) => setTab('achievements') },
  { name: 'Create New Scenario', icon: <FiPlus />, action: () => console.log('Creating...') },
  { name: 'Logout', icon: <FiLogOut />, action: () => console.log('Logging out...') },
];

const fuse = new Fuse(baseCommands, { keys: ['name'], threshold: 0.3 });

export default function CommandPalette({ setActiveTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentCommands');
    if (stored) setRecent(JSON.parse(stored));
  }, []);

  useEffect(() => {
    setResults(query ? fuse.search(query).map(res => res.item) : [...recent, ...baseCommands]);
  }, [query, recent]);

  const handleSelect = (command) => {
    command.action(setActiveTab);
    const updatedRecent = [command, ...recent.filter(c => c.name !== command.name)].slice(0, 5);
    setRecent(updatedRecent);
    localStorage.setItem('recentCommands', JSON.stringify(updatedRecent));
    setIsOpen(false);
    setQuery('');
    setHighlightedIndex(0);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        setHighlightedIndex(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return isOpen ? (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24">
      <div className="w-full max-w-xl bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4">
        <input
          autoFocus
          type="text"
          placeholder="Type a command or action..."
          className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#2c2c2c] text-gray-900 dark:text-white focus:outline-none"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') {
              setHighlightedIndex(prev => (prev + 1) % results.length);
              e.preventDefault();
            } else if (e.key === 'ArrowUp') {
              setHighlightedIndex(prev => (prev - 1 + results.length) % results.length);
              e.preventDefault();
            } else if (e.key === 'Enter') {
              handleSelect(results[highlightedIndex]);
            }
          }}
        />
        <ul className="mt-3 space-y-1 max-h-64 overflow-y-auto">
          {results.map((cmd, i) => (
            <li
              key={cmd.name}
              className={`flex items-center gap-3 px-4 py-2 text-sm cursor-pointer rounded-md transition-colors ${
                i === highlightedIndex
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onMouseEnter={() => setHighlightedIndex(i)}
              onClick={() => handleSelect(cmd)}
            >
              <span className="text-lg">{cmd.icon}</span>
              <span>{cmd.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  ) : null;
}
