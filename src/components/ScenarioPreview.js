import React, { useState, useMemo, useEffect } from 'react';
import { CheckSquare, Trash2, FileEdit, PlayCircle, List, Grid, Filter, BarChart3, Loader2, ChevronDown, Expand, Minimize2, X, ChevronRight, ChevronUp } from 'lucide-react';
import ShimmerLoader from './ShimmerLoader';

const mockScenarios = [
  { id: '1', name: 'Q3 Market Forecast', category: 'Finance', inputs: { revenue: 10000, cost: 8000 }, lastSimulated: '2025-06-08', result: { profit: 2000 } },
  { id: '2', name: 'Summer Ad Campaign', category: 'Marketing', inputs: { reach: 500000, conversion: 0.02 }, lastSimulated: '2025-06-07', result: { roi: 3.5 } },
  { id: '3', name: 'Hiring Plan', category: 'HR', inputs: { newHires: 10, avgSalary: 70000 }, lastSimulated: '2025-06-06', result: { totalCost: 700000 } },
];

// Custom Button Component
const Button = ({ children, variant = 'default', size = 'default', className = '', onClick, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground border-gray-300 hover:bg-gray-50',
    ghost: 'hover:bg-accent hover:text-accent-foreground hover:bg-gray-100'
  };
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3 text-sm',
    lg: 'h-11 rounded-md px-8'
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Input Component
const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      {...props}
    />
  );
};

// Custom Card Components
const Card = ({ children, className = '', onClick }) => {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm border-border cursor-pointer hover:shadow-md transition-shadow ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className = '' }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

// Custom Dropdown Component
const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative inline-block text-left">
      {React.Children.map(children, child => 
        React.cloneElement(child, { isOpen, setIsOpen })
      )}
    </div>
  );
};

const DropdownMenuTrigger = ({ children, isOpen, setIsOpen }) => {
  return React.cloneElement(children, {
    onClick: () => setIsOpen(!isOpen)
  });
};

const DropdownMenuContent = ({ children, isOpen, setIsOpen }) => {
  if (!isOpen) return null;
  
  return (
    <div className="absolute right-0 z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
      <div className="py-1">
        {React.Children.map(children, child => 
          React.cloneElement(child, { setIsOpen })
        )}
      </div>
    </div>
  );
};

const DropdownMenuItem = ({ children, onClick, setIsOpen }) => {
  return (
    <button
      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
      onClick={() => {
        onClick();
        setIsOpen(false);
      }}
    >
      {children}
    </button>
  );
};

// Scenario Preview Component
const ScenarioPreview = () => {
  const [view, setView] = useState('card');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [simulating, setSimulating] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('All');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Timer to switch off loading after 3 seconds (on mount)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Handle escape key to close expanded view
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded]);

  // Prevent body scroll when expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isExpanded]);

  const filteredScenarios = useMemo(() => {
    return mockScenarios.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterCategory === 'All' || s.category === filterCategory)
    ).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'lastSimulated') return new Date(b.lastSimulated) - new Date(a.lastSimulated);
      return 0;
    });
  }, [search, filterCategory, sortBy]);

  const simulateScenario = async (id) => {
    setSimulating(id);
    setTimeout(() => {
      setSimulating(null);
      alert('Simulation complete for scenario: ' + id);
    }, 1500);
  };

  const toggleSelection = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const categories = ['All', ...new Set(mockScenarios.map(s => s.category))];

  const ComponentContent = () => (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search scenarios..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-sm"
          />
          {isExpanded && (
            <div className="text-sm text-gray-600">
              {filteredScenarios.length} scenario{filteredScenarios.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-1" /> 
                Category
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {categories.map(cat => (
                <DropdownMenuItem key={cat} onClick={() => setFilterCategory(cat)}>
                  {cat}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-1" /> 
                Sort
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('name')}>Name</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('lastSimulated')}>Last Simulated</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="ghost" 
            onClick={() => setView('card')}
            className={view === 'card' ? 'text-blue-600' : ''}
            title="Card View"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setView('list')}
            className={view === 'list' ? 'text-blue-600' : ''}
            title="List View"
          >
            <List className="w-4 h-4" />
          </Button>
          
          {/* Expand/Minimize Button */}
          <Button 
            variant="ghost" 
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Minimize View" : "Expand View"}
            className="text-blue-600 hover:text-blue-700"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Custom Tabs */}
      <div className="w-full">
        <div className="flex space-x-1 border-b border-gray-200">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setActiveTab(cat);
                setFilterCategory(cat);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === cat
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="mt-4">
          <div className={`grid gap-4 ${
            view === 'card' 
              ? isExpanded 
                ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' 
                : 'md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}>
            {filteredScenarios.map(scenario => (
              <div
                key={scenario.id}
                className="transition-all duration-200 hover:scale-105"
              >
                <Card 
                  className={`transition-all relative ${selected.includes(scenario.id) ? 'ring-2 ring-blue-400' : ''} ${isExpanded ? 'hover:shadow-lg' : ''}`}
                  onClick={() => toggleSelection(scenario.id)}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold ${isExpanded ? 'text-lg' : 'text-base'}`}>{scenario.name}</h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{scenario.category}</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <strong>Inputs:</strong> {JSON.stringify(scenario.inputs)}
                    </div>
                    <div className="text-sm text-gray-500">
                      <strong>Last Simulated:</strong> {scenario.lastSimulated}
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2">
                      <Button size="sm" variant="outline" title="Edit">
                        <FileEdit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          simulateScenario(scenario.id); 
                        }}
                        title="Run Simulation"
                        disabled={simulating === scenario.id}
                      >
                        {simulating === scenario.id ? 
                          <Loader2 className="w-4 h-4 animate-spin" /> : 
                          <PlayCircle className="w-4 h-4" />
                        }
                      </Button>
                      <Button size="sm" variant="outline" title="View Results">
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" title="Delete" className="hover:bg-red-50">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    {scenario.result && (
                      <div className="bg-green-50 border-l-4 border-green-400 text-xs p-2 rounded mt-2">
                        <strong>Result:</strong> {JSON.stringify(scenario.result)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          
          {filteredScenarios.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-lg mb-2">No scenarios found</div>
              <div className="text-sm">Try adjusting your search or filter criteria</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
    <ShimmerLoader height="h-32" width="w-full" rounded="rounded-lg" /> 
    );
  }

  return (
    <>
      {/* Normal View */}
      {!isExpanded && (
        <div className="p-6">
          <ComponentContent />
        </div>
      )}

      {/* Expanded/Fullscreen View */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Header with close button */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Scenario Management</h1>
              <p className="text-gray-600">Manage and compare your simulation scenarios</p>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700"
              title="Close Expanded View"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-6 pb-32">
              <ComponentContent />
            </div>
          </div>
        </div>
      )}

      {/* Comparison Mode (works in both views) */}
      {selected.length > 1 && (
        <div className={`fixed z-[60] ${
          isExpanded 
            ? 'bottom-0 left-0 right-0 max-h-80 overflow-y-auto bg-white border-t-2 border-gray-200 shadow-2xl' 
            : 'bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-4xl bg-white shadow-lg border rounded-xl'
        } p-4`}>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">Comparison Mode</h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {selected.length} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isExpanded && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const comparisonPanel = document.querySelector('[data-comparison-panel]');
                    if (comparisonPanel) {
                      comparisonPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  title="Scroll to top of comparison"
                >
                  ↑ Top
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div 
            data-comparison-panel
            className={`grid gap-4 ${
              isExpanded 
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {mockScenarios.filter(s => selected.includes(s.id)).map((scenario, index) => (
              <div key={scenario.id} className="border border-gray-200 p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-gray-900">{scenario.name}</h4>
                  <div className="flex items-center gap-1">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      #{index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSelection(scenario.id)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      title="Remove from comparison"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className="ml-1 bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs">
                      {scenario.category}
                    </span>
                  </div>
                  
                  <div className="text-xs">
                    <span className="font-medium text-gray-700">Inputs:</span>
                    <div className="mt-1 bg-blue-50 p-2 rounded text-gray-600 font-mono text-xs">
                      {JSON.stringify(scenario.inputs, null, 2)}
                    </div>
                  </div>
                  
                  <div className="text-xs">
                    <span className="font-medium text-gray-700">Result:</span>
                    <div className="mt-1 bg-green-50 p-2 rounded text-gray-600 font-mono text-xs">
                      {JSON.stringify(scenario.result, null, 2)}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Last Simulated:</span> {scenario.lastSimulated}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {isExpanded && (
            <div className="mt-4 pt-3 border-t border-gray-200 text-center">
              <div className="text-xs text-gray-500">
                💡 Tip: Click any scenario card above to add/remove from comparison • Use Escape to close expanded view
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

// Main Collapsible Container Component
export default function CollapsibleScenarioPreview() {
  const [isOpen, setIsOpen] = useState(false);

  // Save/load state from memory (not localStorage as per restrictions)
  useEffect(() => {
    // Could save state in a parent component or context if needed
    // For now, starts collapsed by default
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-blue-500/50 rounded-lg p-6 border text-gray-900 dark:text-white max-h-[600px] overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-green-500 dark:text-green-400">
          Scenario Management Dashboard
        </h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-blue-500 dark:text-blue-300 font-medium hover:text-blue-700 dark:hover:text-blue-100 transition-colors"
          title={isOpen ? "Collapse" : "Expand"}
        >
          {isOpen ? (
            <ChevronUp className="text-blue-300" />
          ) : (
            <ChevronRight className="text-blue-300" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Manage, compare, and analyze your simulation scenarios with advanced filtering and visualization tools.
          </p>
          <ScenarioPreview />
        </div>
      )}
    </div>
  );
}