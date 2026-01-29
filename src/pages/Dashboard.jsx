import React from 'react';

const Dashboard = ({ activeTask, nextSubtask, stats, onStartDetail }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-2xl font-bold text-gray-800">{activeTask ? 'Continue ton élan !' : 'Prêt à commencer ?'}</h2>
        </div>
        <p className="text-gray-600 text-lg">
          {activeTask ? 'Tu avances super bien.' : 'Crée ta première tâche et commence.'}
        </p>
      </div>

      {activeTask && nextSubtask && (
        <div className="bg-white rounded-3xl p-6 shadow-md">
          <h3 className="text-lg font-bold">{activeTask.title}</h3>
          <p className="mt-2">{nextSubtask.title}</p>
          <div className="mt-4 flex justify-end">
            <button onClick={() => onStartDetail(activeTask)} className="text-rose-500 font-semibold">Voir détails</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
