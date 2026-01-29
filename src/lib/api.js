import { supabase } from './supabaseClient';

export const api = {
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('id,title,created_at,subtasks(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(t => {
      const total = (t.subtasks || []).length;
      const done = (t.subtasks || []).filter(s => s.done).length;
      return { ...t, subtasks: t.subtasks || [], progress: total ? Math.round((done/total)*100) : 0 };
    });
  },

  async createTask(task) {
    // Assurez-vous d'avoir un project_id ou adaptez le schéma
    const { data: taskData, error } = await supabase
      .from('tasks')
      .insert({ title: task.title, description: task.description || null })
      .select()
      .single();
    if (error) throw error;

    if (task.subtasks && task.subtasks.length) {
      const subs = task.subtasks.map(s => ({ title: s.title, task_id: taskData.id, done: false, "order": s.order }));
      const { data: subData, error: subErr } = await supabase.from('subtasks').insert(subs).select();
      if (subErr) throw subErr;
      taskData.subtasks = subData;
    } else {
      taskData.subtasks = [];
    }
    taskData.progress = 0;
    return taskData;
  },

  async updateSubtask(taskId, subtaskId, patch) {
    const { data, error } = await supabase
      .from('subtasks')
      .update(patch)
      .eq('id', subtaskId)
      .select()
      .single();
    if (error) throw error;

    // Recalculer la progression côté client via getTasks(), ou faire un RPC pour mettre à jour un champ progress sur task.
    return data;
  }
};