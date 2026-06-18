import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import {
  collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, writeBatch
} from 'firebase/firestore';

const userCol = (uid, col) => collection(db, 'users', uid, col);
const userDoc = (uid, col, id) => doc(db, 'users', uid, col, id);

export function useFirestore(user) {
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const subUnsubsRef = useRef([]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const uid = user.uid;

    // Timeout de sécurité — si rien après 6s, on arrête le loading
    const timeout = setTimeout(() => setLoading(false), 6000);

    let projectsDone = false;
    let tasksDone = false;
    const checkDone = () => { if (projectsDone && tasksDone) { clearTimeout(timeout); setLoading(false); } };

    const unsubProjects = onSnapshot(
      query(userCol(uid, 'projects'), orderBy('createdAt', 'asc')),
      snap => {
        setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        projectsDone = true;
        checkDone();
      },
      err => { console.error('Projects error:', err); setError(err.message); projectsDone = true; checkDone(); }
    );

    const unsubTasks = onSnapshot(
      query(userCol(uid, 'tasks'), orderBy('position', 'asc')),
      snap => {
        // Nettoyer les anciens listeners de sous-tâches
        subUnsubsRef.current.forEach(u => u());
        subUnsubsRef.current = [];

        const taskMap = {};
        snap.docs.forEach(d => { taskMap[d.id] = { id: d.id, ...d.data(), subtasks: [] }; });

        if (snap.docs.length === 0) {
          setTasks([]);
          tasksDone = true;
          checkDone();
          return;
        }

        let resolvedCount = 0;
        snap.docs.forEach(d => {
          const unsub = onSnapshot(
            query(collection(db, 'users', uid, 'tasks', d.id, 'subtasks'), orderBy('position', 'asc')),
            subSnap => {
              taskMap[d.id].subtasks = subSnap.docs.map(s => ({ id: s.id, ...s.data() }));
              setTasks(Object.values(taskMap));
              resolvedCount++;
              if (resolvedCount >= snap.docs.length) { tasksDone = true; checkDone(); }
            },
            err => { console.error('Subtasks error:', err); resolvedCount++; if (resolvedCount >= snap.docs.length) { tasksDone = true; checkDone(); } }
          );
          subUnsubsRef.current.push(unsub);
        });
      },
      err => { console.error('Tasks error:', err); setError(err.message); tasksDone = true; checkDone(); }
    );

    return () => {
      clearTimeout(timeout);
      unsubProjects();
      unsubTasks();
      subUnsubsRef.current.forEach(u => u());
    };
  }, [user]);

  const uid = user?.uid;

  const createProject = (data) =>
    addDoc(userCol(uid, 'projects'), { ...data, createdAt: serverTimestamp() });

  const updateProject = (id, data) =>
    updateDoc(userDoc(uid, 'projects', id), data);

  const deleteProject = async (id) => {
    await deleteDoc(userDoc(uid, 'projects', id));
    const batch = writeBatch(db);
    tasks.filter(t => t.projectId === id).forEach(t =>
      batch.update(userDoc(uid, 'tasks', t.id), { projectId: null })
    );
    await batch.commit();
  };

  const createTask = (data) =>
    addDoc(userCol(uid, 'tasks'), { ...data, position: tasks.length, createdAt: serverTimestamp() });

  const updateTask = (id, data) =>
    updateDoc(userDoc(uid, 'tasks', id), data);

  const deleteTask = async (id) => {
    const batch = writeBatch(db);
    const task = tasks.find(t => t.id === id);
    task?.subtasks?.forEach(s =>
      batch.delete(doc(db, 'users', uid, 'tasks', id, 'subtasks', s.id))
    );
    batch.delete(userDoc(uid, 'tasks', id));
    await batch.commit();
  };

  const reorderTasks = async (newOrder) => {
    const batch = writeBatch(db);
    newOrder.forEach((t, i) => batch.update(userDoc(uid, 'tasks', t.id), { position: i }));
    await batch.commit();
  };

  const addSubtask = (taskId, title) => {
    if (!title?.trim()) return;
    const task = tasks.find(t => t.id === taskId);
    return addDoc(collection(db, 'users', uid, 'tasks', taskId, 'subtasks'), {
      title: title.trim(), done: false,
      position: task?.subtasks?.length || 0,
      createdAt: serverTimestamp()
    });
  };

  const updateSubtask = (taskId, subId, data) =>
    updateDoc(doc(db, 'users', uid, 'tasks', taskId, 'subtasks', subId), data);

  const deleteSubtask = (taskId, subId) =>
    deleteDoc(doc(db, 'users', uid, 'tasks', taskId, 'subtasks', subId));

  const reorderSubtasks = async (taskId, newOrder) => {
    const batch = writeBatch(db);
    newOrder.forEach((s, i) =>
      batch.update(doc(db, 'users', uid, 'tasks', taskId, 'subtasks', s.id), { position: i })
    );
    await batch.commit();
  };

  return {
    tasks, projects, loading, error,
    createProject, updateProject, deleteProject,
    createTask, updateTask, deleteTask, reorderTasks,
    addSubtask, updateSubtask, deleteSubtask, reorderSubtasks,
  };
}
