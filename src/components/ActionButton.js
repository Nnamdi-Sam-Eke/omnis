import React, { useState } from 'react';
import { Plus, FileText, Database, BarChart3, Upload, Download, Settings, Zap } from 'lucide-react';

const ActionButtons = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const actions = [
    {
      id: 'create-report',
      label: 'Create Report',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'from-blue-600 to-blue-700',
      description: 'Generate a comprehensive report with your data',
      shortcut: 'Ctrl+R'
    },
    {
      id: 'add-data',
      label: 'Add Data',
      icon: Database,
      color: 'from-green-500 to-green-600',
      hoverColor: 'from-green-600 to-green-700',
      description: 'Import or add new data for analysis',
      shortcut: 'Ctrl+D'
    },
    {
      id: 'analyze',
      label: 'Analyze',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'from-purple-600 to-purple-700',
      description: 'Run advanced analytics on your data',
      shortcut: 'Ctrl+A'
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      color: 'from-amber-500 to-amber-600',
      hoverColor: 'from-amber-600 to-amber-700',
      description: 'Export your data in various formats',
      shortcut: 'Ctrl+E'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Quick Actions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isExpanded ? 'All available actions' : 'Most used actions'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleExpand}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6">
        <div className={`grid gap-4 transition-all duration-300 ${
          isExpanded ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'
        }`}>
          {(isExpanded ? actions : actions.slice(0, 2)).map((action) => {
            const IconComponent = action.icon;
            return (
              <div
                key={action.id}
                className="group relative bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              >
                <button className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-lg bg-gradient-to-r ${action.color} hover:${action.hoverColor} text-white font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg`}>
                  <IconComponent className="w-5 h-5" />
                  <span>{action.label}</span>
                </button>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-gray-900 dark:bg-gray-700 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                    {action.description}
                    {action.shortcut && (
                      <div className="text-xs text-gray-300 mt-1">{action.shortcut}</div>
                    )}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats or Additional Info */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">All systems ready</span>
            </div>
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {actions.length} actions available
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;