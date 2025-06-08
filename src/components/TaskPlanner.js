import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronUp } from "lucide-react";

const TaskPlanner = ({ scenarioTasks = [] }) => {
  const [tasks, setTasks] = useState([]);
  const [inputTask, setInputTask] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(true);

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

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-8 border">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-2xl font-semibold  text-green-500 dark:text-green-500">Task Planner</h3>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-blue-600 dark:text-white" />
        ) : (
          <ChevronRight className="w-5 h-5 text-blue-600 dark:text-white" />
        )}
      </div>

      {!isCollapsed && (
        <div className="mt-4">
          <ol className="space-y-2 list-decimal list-inside">
            {tasks.map((task, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(index)}
                    className="cursor-pointer"
                  />
                  <span className={task.completed ? "line-through text-gray-500" : ""}>
                    {task.text}
                  </span>
                </div>
                <button
                  onClick={() => removeTask(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiTrash2 />
                </button>
              </li>
            ))}
          </ol>

          <div className="flex space-x-2 mt-4">
            <input
              type="text"
              value={inputTask}
              onChange={(e) => setInputTask(e.target.value)}
              className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white"
              placeholder="Enter a task..."
            />
            <button
              onClick={addTask}
              className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <FiPlus />
            </button>
          </div>

          {tasks.length > 0 && (
            <button
              onClick={clearTasks}
              className="mt-4 p-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskPlanner;
