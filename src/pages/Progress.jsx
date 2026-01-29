import React from 'react';

const Progress = ({ stats, completedTasks }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Ta progression</h2>
    <div className="bg-white rounded-3xl p-6 shadow-md">
      <div className="text-center">
        <h3 className="text-3xl font-bold">{stats.completedSubtasks}</h3>
        <p className="text-gray-600">Étapes accomplies</p>
      </div>
    </div>
    <div className="space-y-3">
      {completedTasks.length === 0 ? (
        <p className="text-gray-500">Aucune tâche complétée pour le moment.</p>
      ) : (
        completedTasks.map(t => (
          <div key={t.id} className="p-4 bg-emerald-50 rounded-xl">{t.title}</div>
        ))
      )}
    </div>
  </div>
);

export default Progress;
