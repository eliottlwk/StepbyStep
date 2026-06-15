import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    const unsubProjects = onSnapshot(
      query(userCol(uid, 'projects'), orderBy('createdAt', 'asc')),
      snap => setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const unsubTasks = onSnapshot(
      query(userCol(uid, 'tasks'), orderBy('position', 'asc')),
      async snap => {
        const taskList = await Promise.all(snap.docs.map(async d => {
          const task = { id: d.id, ...d.data() };
          const subSnap = await new Promise(resolve => {
            const unsub = onSnapshot(
              query(collection(db, 'users', uid, 'tasks', d.id, 'subtasks'), orderBy('position', 'asc')),
              s => { resolve(s); unsub(); }
            );
          });
          task.subtasks = subSnap.docs.map(s => ({ id: s.id, ...s.data() }));
          return task;
        }));
        setTasks(taskList);
        setLoading(false);
      }
    );

    // Realtime subtasks
    const subUnsubs = [];
    const unsubTasksForSubs = onSnapshot(
      query(userCol(uid, 'tasks'), orderBy('position', 'asc')),
      snap => {
        subUnsubs.forEach(u => u());
        subUnsubs.length = 0;
        snap.docs.forEach(d => {
          const unsub = onSnapshot(
            query(collection(db, 'users', uid, 'tasks', d.id, 'subtasks'), orderBy('position', 'asc')),
            subSnap => {
              setTasks(prev => prev.map(t =>
                t.id === d.id ? { ...t, subtasks: subSnap.docs.map(s => ({ id: s.id, ...s.data() })) } : t
              ));
            }
          );
          subUnsubs.push(unsub);
        });
      }
    );

    return () => { unsubProjects(); unsubTasks(); unsubTasksForSubs(); subUnsubs.forEach(u => u()); };
  }, [user]);

  const uid = user?.uid;

  // ── PROJETS ──
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

  // ── TÂCHES ──
  const createTask = (data) =>
    addDoc(userCol(uid, 'tasks'), { ...data, position: tasks.length, createdAt: serverTimestamp() });

  const updateTask = (id, data) =>
    updateDoc(userDoc(uid, 'tasks', id), data);

  const deleteTask = async (id) => {
    const batch = writeBatch(db);
    const task = tasks.find(t => t.id === id);
    if (task?.subtasks) {
      task.subtasks.forEach(s =>
        batch.delete(doc(db, 'users', uid, 'tasks', id, 'subtasks', s.id))
      );
    }
    batch.delete(userDoc(uid, 'tasks', id));
    await batch.commit();
  };

  const reorderTasks = async (newOrder) => {
    const batch = writeBatch(db);
    newOrder.forEach((t, i) => batch.update(userDoc(uid, 'tasks', t.id), { position: i }));
    await batch.commit();
  };

  // ── SOUS-TÂCHES ──
  const addSubtask = (taskId, title) => {
    const task = tasks.find(t => t.id === taskId);
    return addDoc(collection(db, 'users', uid, 'tasks', taskId, 'subtasks'), {
      title, done: false, position: task?.subtasks?.length || 0, createdAt: serverTimestamp()
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
    tasks, projects, loading,
    createProject, updateProject, deleteProject,
    createTask, updateTask, deleteTask, reorderTasks,
    addSubtask, updateSubtask, deleteSubtask, reorderSubtasks,
  };
}
