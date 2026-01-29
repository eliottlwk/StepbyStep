import React from 'react';

const TaskDetail = ({ task, onToggleSubtask, onBack }) => {
  if (!task) return null;
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-gray-600">Retour</button>
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold mb-2">{task.title}</h2>
        <p className="text-gray-600">{task.subtasks.filter(s => s.completed).length} / {task.subtasks.length} étapes</p>
        <div className="mt-6 space-y-3">
          {task.subtasks.map(sub => (
            <div key={sub.id} className="p-4 rounded-2xl bg-gray-50">
              <div className="flex items-center gap-4">
                <button onClick={() => onToggleSubtask(task.id, sub.id)}>
                  {sub.completed ? '✔' : '○'}
                </button>
                <div>{sub.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
