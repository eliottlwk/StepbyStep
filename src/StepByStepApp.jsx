import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Plus, ChevronRight, Sparkles, TrendingUp, Settings, Menu, X } from 'lucide-react';

// Utilitaire pour générer des IDs uniques
const generateId = () => Math.random().toString(36).substr(2, 9);

// Messages d'encouragement variés
const encouragementMessages = [
  "Bravo ! Un pas après l'autre 🌟",
  "Super ! Tu avances bien 💪",
  "Magnifique progression ! ✨",
  "Continue comme ça ! 🎯",
  "Excellent travail ! 🌸",
  "Tu es sur la bonne voie ! 🚀",
  "Fier de toi ! 🎉",
  "Petit pas, grand impact ! 💫"
];

const StepByStepApp = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showTaskCreation, setShowTaskCreation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  // Messages d'onboarding
  const onboardingSteps = [
    {
      title: "Bienvenue sur Step by Step",
      description: "L'application qui transforme tes grands projets en petites victoires quotidiennes.",
      icon: "🌱"
    },
    {
      title: "Avance à ton rythme",
      description: "Chaque grande tâche est divisée en micro-étapes faciles à réaliser. Pas de pression, juste de la progression.",
      icon: "🎯"
    },
    {
      title: "Célèbre chaque pas",
      description: "Chaque micro-tâche complétée est une victoire. On avance ensemble, sans jugement.",
      icon: "✨"
    }
  ];

  // Fonction pour générer des sous-tâches automatiquement
  const generateSubtasks = (taskTitle) => {
    // Simulation simple - dans une vraie app, on utiliserait l'IA
    const templates = {
      default: [
        "Définir l'objectif précis",
        "Rassembler les ressources nécessaires",
        "Faire la première action concrète",
        "Faire une pause et évaluer",
        "Continuer avec la prochaine étape"
      ]
    };
    
    return templates.default.map((subtask, index) => ({
      id: generateId(),
      title: subtask,
      completed: false,
      order: index
    }));
  };

  // Créer une nouvelle tâche
  const createTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask = {
      id: generateId(),
      title: newTaskTitle,
      createdAt: new Date(),
      subtasks: generateSubtasks(newTaskTitle),
      progress: 0
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setShowTaskCreation(false);
    setSelectedTask(newTask);
    setActiveView('task-detail');
  };

  // Basculer l'état d'une sous-tâche
  const toggleSubtask = (taskId, subtaskId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map(subtask => 
          subtask.id === subtaskId 
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        );
        const completedCount = updatedSubtasks.filter(s => s.completed).length;
        const progress = Math.round((completedCount / updatedSubtasks.length) * 100);
        
        // Afficher célébration si nouvelle complétion
        if (!task.subtasks.find(s => s.id === subtaskId).completed) {
          showCelebrationEffect();
        }
        
        return {
          ...task,
          subtasks: updatedSubtasks,
          progress
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    if (selectedTask) {
      setSelectedTask(updatedTasks.find(t => t.id === selectedTask.id));
    }
  };

  // Effet de célébration
  const showCelebrationEffect = () => {
    const message = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
    setCelebrationMessage(message);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  // Obtenir la tâche active du jour (la première non complétée)
  const getActiveTask = () => {
    return tasks.find(task => task.progress < 100);
  };

  // Obtenir la prochaine sous-tâche à faire
  const getNextSubtask = (task) => {
    if (!task) return null;
    return task.subtasks.find(subtask => !subtask.completed);
  };

  // Stats globales
  const getTotalStats = () => {
    const totalSubtasks = tasks.reduce((acc, task) => acc + task.subtasks.length, 0);
    const completedSubtasks = tasks.reduce((acc, task) => 
      acc + task.subtasks.filter(s => s.completed).length, 0
    );
    const completedTasks = tasks.filter(t => t.progress === 100).length;
    
    return { totalSubtasks, completedSubtasks, completedTasks };
  };

  // Si onboarding pas terminé
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-emerald-50 flex items-center justify-center p-6">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&family=Caveat:wght@600&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Nunito', sans-serif;
            overflow-x: hidden;
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          @keyframes shimmer {
            0% {
              background-position: -200% center;
            }
            100% {
              background-position: 200% center;
            }
          }
          
          .fade-in-up {
            animation: fadeInUp 0.6s ease-out;
          }
          
          .float {
            animation: float 3s ease-in-out infinite;
          }
          
          .celebration-appear {
            animation: pulse 0.5s ease-out;
          }
          
          .progress-bar-fill {
            transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}</style>
        
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 fade-in-up">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 float">{onboardingSteps[onboardingStep].icon}</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3" style={{fontFamily: 'Nunito, sans-serif'}}>
              {onboardingSteps[onboardingStep].title}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {onboardingSteps[onboardingStep].description}
            </p>
          </div>
          
          <div className="flex gap-2 justify-center mb-8">
            {onboardingSteps.map((_, index) => (
              <div 
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === onboardingStep 
                    ? 'w-8 bg-gradient-to-r from-rose-400 to-amber-400' 
                    : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-3">
            {onboardingStep > 0 && (
              <button
                onClick={() => setOnboardingStep(onboardingStep - 1)}
                className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-gray-300 transition-colors"
              >
                Retour
              </button>
            )}
            <button
              onClick={() => {
                if (onboardingStep < onboardingSteps.length - 1) {
                  setOnboardingStep(onboardingStep + 1);
                } else {
                  setShowOnboarding(false);
                }
              }}
              className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 text-white font-bold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
            >
              {onboardingStep < onboardingSteps.length - 1 ? 'Suivant' : 'Commencer'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeTask = getActiveTask();
  const nextSubtask = getNextSubtask(activeTask);
  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-emerald-50">
      {/* Message de célébration */}
      {showCelebration && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 celebration-appear">
          <div className="bg-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-3">
            <Sparkles className="text-amber-400" size={24} />
            <span className="text-lg font-semibold text-gray-800">{celebrationMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 bg-clip-text text-transparent" style={{fontFamily: 'Caveat, cursive'}}>
            Step by Step
          </h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Settings size={24} className="text-gray-600" />
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex gap-2 bg-white rounded-2xl p-1 shadow-sm">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
              activeView === 'dashboard'
                ? 'bg-gradient-to-r from-rose-400 to-amber-400 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Tableau de bord
          </button>
          <button
            onClick={() => setActiveView('tasks')}
            className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
              activeView === 'tasks'
                ? 'bg-gradient-to-r from-rose-400 to-amber-400 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Mes tâches
          </button>
          <button
            onClick={() => setActiveView('progress')}
            className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
              activeView === 'progress'
                ? 'bg-gradient-to-r from-rose-400 to-amber-400 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Progression
          </button>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-4xl mx-auto px-6 pb-12">
        {/* Dashboard */}
        {activeView === 'dashboard' && (
          <div className="space-y-6 fade-in-up">
            {/* Message d'encouragement */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="text-amber-400" size={28} />
                <h2 className="text-2xl font-bold text-gray-800">
                  {activeTask ? "Continue ton élan !" : "Prêt à commencer ?"}
                </h2>
              </div>
              <p className="text-gray-600 text-lg">
                {activeTask 
                  ? "Tu avances super bien. Chaque petit pas compte !" 
                  : "Crée ta première tâche et commence à avancer pas à pas."}
              </p>
            </div>

            {/* Tâche active */}
            {activeTask && nextSubtask ? (
              <div className="bg-gradient-to-br from-white to-rose-50 rounded-3xl p-8 shadow-lg border-2 border-rose-200">
                <div className="mb-4">
                  <span className="text-sm font-semibold text-rose-500 uppercase tracking-wide">
                    Prochaine étape
                  </span>
                  <h3 className="text-xl font-bold text-gray-800 mt-1">
                    {activeTask.title}
                  </h3>
                </div>
                
                <div className="bg-white rounded-2xl p-6 mb-4">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleSubtask(activeTask.id, nextSubtask.id)}
                      className="mt-1 transform hover:scale-110 transition-transform"
                    >
                      <Circle className="text-rose-400" size={28} />
                    </button>
                    <div className="flex-1">
                      <p className="text-lg text-gray-800 font-medium">
                        {nextSubtask.title}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Progression : {activeTask.progress}%
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTask(activeTask);
                      setActiveView('task-detail');
                    }}
                    className="flex items-center gap-2 text-rose-500 font-semibold hover:gap-3 transition-all"
                  >
                    Voir détails
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowTaskCreation(true)}
                className="w-full bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 rounded-3xl p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
              >
                <Plus className="mx-auto mb-2 text-white" size={40} />
                <span className="text-white font-bold text-xl">
                  Créer ma première tâche
                </span>
              </button>
            )}

            {/* Stats rapides */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-6 text-center shadow-md">
                <div className="text-3xl font-bold text-rose-500 mb-1">
                  {stats.completedSubtasks}
                </div>
                <div className="text-sm text-gray-600">Étapes réalisées</div>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center shadow-md">
                <div className="text-3xl font-bold text-amber-500 mb-1">
                  {stats.completedTasks}
                </div>
                <div className="text-sm text-gray-600">Tâches complétées</div>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center shadow-md">
                <div className="text-3xl font-bold text-emerald-500 mb-1">
                  {tasks.length}
                </div>
                <div className="text-sm text-gray-600">Tâches totales</div>
              </div>
            </div>
          </div>
        )}

        {/* Liste des tâches */}
        {activeView === 'tasks' && (
          <div className="space-y-4 fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Mes tâches</h2>
              <button
                onClick={() => setShowTaskCreation(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-rose-400 to-amber-400 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                <Plus size={20} />
                Nouvelle tâche
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                <div className="text-6xl mb-4">🌱</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Aucune tâche pour le moment
                </h3>
                <p className="text-gray-600 mb-6">
                  Crée ta première tâche et commence ton voyage !
                </p>
                <button
                  onClick={() => setShowTaskCreation(true)}
                  className="bg-gradient-to-r from-rose-400 to-amber-400 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Créer une tâche
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedTask(task);
                      setActiveView('task-detail');
                    }}
                    className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-800 flex-1">
                        {task.title}
                      </h3>
                      {task.progress === 100 && (
                        <CheckCircle className="text-emerald-500" size={24} />
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-rose-400 to-amber-400 rounded-full progress-bar-fill"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        {task.subtasks.filter(s => s.completed).length} / {task.subtasks.length} étapes
                      </span>
                      <span className="text-rose-500 font-semibold">
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Détail d'une tâche */}
        {activeView === 'task-detail' && selectedTask && (
          <div className="space-y-6 fade-in-up">
            <button
              onClick={() => setActiveView('tasks')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold"
            >
              <ChevronRight size={20} className="transform rotate-180" />
              Retour aux tâches
            </button>

            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {selectedTask.title}
                  </h2>
                  <p className="text-gray-600">
                    {selectedTask.subtasks.filter(s => s.completed).length} / {selectedTask.subtasks.length} étapes complétées
                  </p>
                </div>
                {selectedTask.progress === 100 && (
                  <div className="text-4xl">🎉</div>
                )}
              </div>

              <div className="mb-8">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 rounded-full progress-bar-fill"
                    style={{ width: `${selectedTask.progress}%` }}
                  />
                </div>
                <div className="text-right mt-2 text-sm font-semibold text-gray-600">
                  {selectedTask.progress}%
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-gray-800 mb-4">Micro-étapes :</h3>
                {selectedTask.subtasks.map((subtask, index) => (
                  <div
                    key={subtask.id}
                    className={`p-4 rounded-2xl transition-all ${
                      subtask.completed 
                        ? 'bg-emerald-50 border-2 border-emerald-200' 
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleSubtask(selectedTask.id, subtask.id)}
                        className="transform hover:scale-110 transition-transform"
                      >
                        {subtask.completed ? (
                          <CheckCircle className="text-emerald-500" size={28} />
                        ) : (
                          <Circle className="text-gray-400" size={28} />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className={`text-lg font-medium ${
                          subtask.completed ? 'text-emerald-700 line-through' : 'text-gray-800'
                        }`}>
                          {subtask.title}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Progression globale */}
        {activeView === 'progress' && (
          <div className="space-y-6 fade-in-up">
            <h2 className="text-2xl font-bold text-gray-800">Ta progression</h2>

            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-3xl p-8 shadow-lg border-2 border-emerald-200">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🌟</div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  {stats.completedSubtasks}
                </h3>
                <p className="text-gray-600 text-lg">
                  étapes accomplies au total
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-md text-center">
                <TrendingUp className="mx-auto mb-3 text-rose-400" size={32} />
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {stats.completedTasks}
                </div>
                <div className="text-sm text-gray-600">Tâches terminées</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md text-center">
                <Sparkles className="mx-auto mb-3 text-amber-400" size={32} />
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {tasks.length - stats.completedTasks}
                </div>
                <div className="text-sm text-gray-600">Tâches en cours</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="font-bold text-gray-800 mb-4 text-xl">Historique</h3>
              {tasks.filter(t => t.progress === 100).length > 0 ? (
                <div className="space-y-3">
                  {tasks.filter(t => t.progress === 100).map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                      <CheckCircle className="text-emerald-500 flex-shrink-0" size={24} />
                      <span className="text-gray-800 font-medium">{task.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Aucune tâche complétée pour le moment. Continue, tu y es presque !
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal de création de tâche */}
      {showTaskCreation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Nouvelle tâche</h3>
              <button
                onClick={() => setShowTaskCreation(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quelle tâche veux-tu accomplir ?
              </label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createTask()}
                placeholder="Ex: Préparer mon exposé, Ranger ma chambre..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-rose-400 focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <div className="bg-amber-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700">
                💡 <strong>Astuce :</strong> On va découper cette tâche en petites étapes faciles à réaliser !
              </p>
            </div>

            <button
              onClick={createTask}
              disabled={!newTaskTitle.trim()}
              className={`w-full py-3 px-6 rounded-xl font-bold text-white transition-all ${
                newTaskTitle.trim()
                  ? 'bg-gradient-to-r from-rose-400 to-amber-400 hover:shadow-lg transform hover:-translate-y-0.5'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Créer et découper
            </button>
          </div>
        </div>
      )}

      {/* Panneau des paramètres */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Paramètres</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2">Notifications</h4>
                <p className="text-sm text-gray-600">
                  Rappels doux pour t'encourager (bientôt disponible)
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2">Rythme</h4>
                <p className="text-sm text-gray-600">
                  Personnalise ton rythme d'avancement (bientôt disponible)
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2">À propos</h4>
                <p className="text-sm text-gray-600">
                  Step by Step v1.0 - Avance à ton rythme 🌱
                </p>
              </div>

              <button
                onClick={() => {
                  if (confirm('Es-tu sûr de vouloir recommencer l\'onboarding ?')) {
                    setShowOnboarding(true);
                    setOnboardingStep(0);
                    setShowSettings(false);
                  }
                }}
                className="w-full py-3 px-6 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-gray-300 transition-colors"
              >
                Revoir l'introduction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepByStepApp;
