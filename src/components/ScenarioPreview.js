
import React, { useState, useMemo, useEffect } from 'react';
import { CheckSquare, Trash2, FileEdit, PlayCircle, List, Grid, Filter, BarChart3, Loader2, ChevronDown, Expand, Minimize2, X, ChevronRight, ChevronUp, Sparkles } from 'lucide-react';
// Dark Theme Toggle Component
const ThemeToggle = ({ isDark, setIsDark }) => (
  <button
    onClick={() => setIsDark(!isDark)}
    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
    title="Toggle theme"
  >
    {isDark ? (
      <span className="text-yellow-500">☀️</span>
    ) : (
      <span className="text-gray-600">🌙</span>
    )}
  </button>
);

// Shimmer Loader Component
const ShimmerLoader = ({ height = "h-32", width = "w-full", rounded = "rounded-lg" }) => (
  <div className={`${height} ${width} ${rounded} bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse`} 
       style={{ 
         backgroundSize: '200% 100%',
         animation: 'shimmer 2s ease-in-out infinite'
       }}>
    <style>{`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `}</style>
  </div>
);

const mockScenarios = [
  { id: '1', name: 'Q3 Market Forecast', category: 'Finance', inputs: { revenue: 10000, cost: 8000 }, lastSimulated: '2025-06-08', result: { profit: 2000 } },
  { id: '2', name: 'Summer Ad Campaign', category: 'Marketing', inputs: { reach: 500000, conversion: 0.02 }, lastSimulated: '2025-06-07', result: { roi: 3.5 } },
  { id: '3', name: 'Hiring Plan', category: 'HR', inputs: { newHires: 10, avgSalary: 70000 }, lastSimulated: '2025-06-06', result: { totalCost: 700000 } },
];

// Modern Button Component
const Button = ({ children, variant = 'default', size = 'default', className = '', onClick, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95';
  
  const variants = {
    default: 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 shadow-lg hover:shadow-xl focus-visible:ring-blue-500',
    outline: 'border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 shadow-sm hover:shadow-md',
    ghost: 'hover:bg-gray-100/80 dark:hover:bg-gray-800/80 backdrop-blur-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg'
  };
  
  const sizes = {
    default: 'h-11 px-6 py-3',
    sm: 'h-9 px-4 text-sm',
    lg: 'h-12 px-8 text-lg'
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

// Modern Input Component
const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`flex h-12 w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-3 text-sm text-gray-900 dark:text-gray-100 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:shadow-md ${className}`}
      {...props}
    />
  );
};

// Modern Card Components
const Card = ({ children, className = '', onClick }) => {
  return (
    <div className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-card-foreground shadow-lg hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:border-gray-300 dark:hover:border-gray-600 ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className = '' }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

// Modern Dropdown Component
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
    <div className="absolute right-0 z-10 mt-2 w-56 rounded-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-xl ring-1 ring-black/5 dark:ring-white/10 border border-gray-200 dark:border-gray-700 focus:outline-none">
      <div className="py-2">
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
      className="block w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/50 dark:hover:to-blue-800/50 hover:text-blue-900 dark:hover:text-blue-100 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl mx-1 rounded-lg"
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
const ScenarioPreview = ({ isDark }) => {
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
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="🔍 Search scenarios..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-sm"
          />
          {isExpanded && (
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-full">
              {filteredScenarios.length} scenario{filteredScenarios.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" /> 
                Category
                <ChevronDown className="w-4 h-4 ml-2" />
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
                <BarChart3 className="w-4 h-4 mr-2" /> 
                Sort
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('name')}>Name</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('lastSimulated')}>Last Simulated</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <Button 
              variant={view === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('card')}
              className={`${view === 'card' ? 'shadow-md' : ''}`}
              title="Card View"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button 
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className={`${view === 'list' ? 'shadow-md' : ''}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Expand/Minimize Button */}
          <Button 
            variant="ghost" 
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Minimize View" : "Expand View"}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/50"
          >
            {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Expand className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="w-full">
        <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setActiveTab(cat);
                setFilterCategory(cat);
              }}
              className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === cat
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="mt-6">
          <div className={`grid gap-6 ${
            view === 'card' 
              ? isExpanded 
                ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' 
                : 'md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}>
            {filteredScenarios.map(scenario => (
              <div
                key={scenario.id}
                className="group"
              >
                <Card 
                  className={`transition-all duration-300 relative ${
                    selected.includes(scenario.id) 
                      ? 'ring-2 ring-blue-400 dark:ring-blue-500 shadow-blue-100 dark:shadow-blue-900/50' 
                      : ''
                  } ${isExpanded ? 'hover:shadow-2xl' : ''}`}
                  onClick={() => toggleSelection(scenario.id)}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <h4 className={`font-bold text-gray-900 dark:text-gray-100 ${isExpanded ? 'text-lg' : 'text-base'}`}>
                        {scenario.name}
                      </h4>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                        scenario.category === 'Finance' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
                        scenario.category === 'Marketing' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300' :
                        scenario.category === 'HR' ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {scenario.category}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                      <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">Inputs:</div>
                      <div className="font-mono text-xs text-gray-600 dark:text-gray-400">
                        {JSON.stringify(scenario.inputs)}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full"></div>
                      <span>Last simulated: {scenario.lastSimulated}</span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 pt-2">
                      <Button size="sm" variant="outline" title="Edit" className="hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:border-blue-300 dark:hover:border-blue-600">
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
                        className="hover:bg-green-50 dark:hover:bg-green-900/50 hover:border-green-300 dark:hover:border-green-600"
                      >
                        {simulating === scenario.id ? 
                          <Loader2 className="w-4 h-4 animate-spin" /> : 
                          <PlayCircle className="w-4 h-4" />
                        }
                      </Button>
                      <Button size="sm" variant="outline" title="View Results" className="hover:bg-purple-50 dark:hover:bg-purple-900/50 hover:border-purple-300 dark:hover:border-purple-600">
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" title="Delete" className="hover:bg-red-50 dark:hover:bg-red-900/50 hover:border-red-300 dark:hover:border-red-600">
                        <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                      </Button>
                    </div>
                    
                    {scenario.result && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-green-400 dark:border-green-500 text-xs p-3 rounded-lg">
                        <div className="font-medium text-green-900 dark:text-green-300 mb-1">Result:</div>
                        <div className="font-mono text-green-800 dark:text-green-400">
                          {JSON.stringify(scenario.result)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          
          {filteredScenarios.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No scenarios found</div>
              <div className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <ShimmerLoader height="h-12" width="w-64" rounded="rounded-xl" />
          <ShimmerLoader height="h-12" width="w-32" rounded="rounded-xl" />
          <ShimmerLoader height="h-12" width="w-32" rounded="rounded-xl" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ShimmerLoader height="h-64" width="w-full" rounded="rounded-2xl" />
          <ShimmerLoader height="h-64" width="w-full" rounded="rounded-2xl" />
          <ShimmerLoader height="h-64" width="w-full" rounded="rounded-2xl" />
        </div>
      </div>
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
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
          {/* Header with close button */}
          <div className="flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-8 py-6 flex items-center justify-between shadow-lg">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Scenario Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and compare your simulation scenarios</p>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Close Expanded View"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-8 pb-32">
              <ComponentContent />
            </div>
          </div>
        </div>
      )}

      {/* Comparison Mode (works in both views) */}
      {selected.length > 1 && (
        <div className={`fixed z-[60] ${
          isExpanded 
            ? 'bottom-0 left-0 right-0 max-h-96 overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-2xl' 
            : 'bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-6xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl border border-gray-200 dark:border-gray-700 rounded-2xl'
        } p-6`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">Comparison Mode</h3>
              <span className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-900 dark:text-blue-100 text-sm font-medium px-3 py-1 rounded-full">
                {selected.length} selected
              </span>
            </div>
            <div className="flex items-center gap-3">
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
              <div key={scenario.id} className="border-2 border-gray-200 dark:border-gray-700 p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{scenario.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full font-medium">
                      #{index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSelection(scenario.id)}
                      className="h-6 w-6 p-0 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
                      title="Remove from comparison"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      scenario.category === 'Finance' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
                      scenario.category === 'Marketing' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300' :
                      scenario.category === 'HR' ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {scenario.category}
                    </span>
                  </div>
                  
                  <div className="text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Inputs:</span>
                    <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-gray-700 dark:text-gray-300 font-mono text-xs">
                      {JSON.stringify(scenario.inputs, null, 2)}
                    </div>
                  </div>
                  
                  <div className="text-xs">
                    <span className="font-medium text-gray-700">Result:</span>
                    <div className="mt-1 bg-green-50 p-2 rounded-lg text-gray-700 font-mono text-xs">
                      {JSON.stringify(scenario.result, null, 2)}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Last Simulated: {scenario.lastSimulated}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {isExpanded && (
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-full inline-block">
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
return (
    <div className="relative group">
      {/* Animated background glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-all duration-500"></div>
      
      {/* Main container */}
      <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-2xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-400/10 transition-all duration-500 max-h-[700px] overflow-hidden">
        
        {/* Header section */}
        <div className="p-8 pb-6">
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-2 h-2 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 dark:from-emerald-400 dark:via-teal-400 dark:to-blue-400 bg-clip-text text-transparent leading-tight">
                    Scenario Management Dashboard
                  </h2>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative group/btn"
              title={isOpen ? "Collapse" : "Expand"}
              aria-expanded={isOpen}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-0 group-hover/btn:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 rounded-xl p-3 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-blue-600 dark:text-blue-400 group-hover/btn:text-blue-700 dark:group-hover/btn:text-blue-300 transition-colors duration-200">
                  {isOpen ? (
                    <ChevronUp className="w-6 h-6" />
                  ) : (
                    <ChevronRight className="w-6 h-6" />
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Collapsible content */}
        {isOpen && (
          <div className="px-8 pb-8 overflow-y-auto max-h-[500px] custom-scrollbar">
            <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
              
              {/* Info banner */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-sm"></div>
                <div className="relative bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                        Intelligent Scenario Analysis
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        Manage, compare, and analyze your simulation scenarios with advanced filtering and visualization tools.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content area */}
              <div className="bg-white/50 dark:bg-slate-700/30 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
                <ScenarioPreview />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};