import React from 'react';

const Tasks = ({ tasks, onSelect }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800">Mes tâches</h2>
    </div>
    {tasks.length === 0 ? (
      <div className="bg-white rounded-3xl p-12 text-center shadow-lg">Aucune tâche pour le moment</div>
    ) : (
      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task.id} onClick={() => onSelect(task)} className="bg-white rounded-2xl p-6 shadow-md cursor-pointer">
            <div className="flex justify-between">
              <h3 className="font-bold">{task.title}</h3>
              <span className="text-rose-500 font-semibold">{task.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default Tasks;
