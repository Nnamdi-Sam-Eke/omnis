import React, { useState, useEffect } from "react";
import { Plus, Trash2, ChevronRight, ChevronUp, CheckCircle2, Circle } from "lucide-react";

const TaskPlanner = ({ scenarioTasks = [] }) => {
  const [tasks, setTasks] = useState([]);
  const [inputTask, setInputTask] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(true); // Always start collapsed

  useEffect(() => {
    if (scenarioTasks.length > 0 && tasks.length === 0) {
      setTasks(scenarioTasks.map(task => ({ text: task, completed: false })));
    }
  }, [scenarioTasks, tasks]);

  const addTask = () => {
    if (inputTask.trim() !== "") {
      setTasks([...tasks, { text: inputTask, completed: false }]);
      setInputTask("");
    }
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const toggleTaskCompletion = (index) => {
    setTasks(tasks.map((task, i) => 
      i === index ? { ...task, completed: !task.completed } : task
    ));
  };

  const clearTasks = () => {
    setTasks([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="bg-white dark:bg-gray-900 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div
        className="flex justify-between items-center cursor-pointer p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Task Planner</h3>
            {totalCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {completedCount} of {totalCount} completed
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {totalCount > 0 && (
            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300">
              {totalCount}
            </div>
          )}
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-6 pb-6 space-y-4">
          {/* Progress Bar */}
          {totalCount > 0 && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div
                key={index}
                className={`group flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                  task.completed 
                    ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <button
                    onClick={() => toggleTaskCompletion(index)}
                    className="flex-shrink-0 transition-colors duration-200"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                    )}
                  </button>
                  <span className={`flex-1 transition-all duration-200 ${
                    task.completed 
                      ? "line-through text-gray-500 dark:text-gray-400" 
                      : "text-gray-800 dark:text-white"
                  }`}>
                    {task.text}
                  </span>
                </div>
                <button
                  onClick={() => removeTask(index)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Task Input */}
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputTask}
              onChange={(e) => setInputTask(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Add a new task..."
            />
            <button
              onClick={addTask}
              disabled={!inputTask.trim()}
              className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Clear All Button */}
          {tasks.length > 0 && (
            <button
              onClick={clearTasks}
              className="w-full p-3 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-red-300 dark:hover:border-red-500 transition-all duration-200"
            >
              Clear All Tasks
            </button>
          )}

          {/* Empty State */}
          {tasks.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No tasks yet. Add one above to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskPlanner;