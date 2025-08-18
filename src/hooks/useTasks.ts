import { useState, useEffect } from 'react'
import { Task, TaskInsert, TaskUpdate, supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { subDays } from 'date-fns'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchTasks()
      fetchDeletedTasks()
      
      // Set up real-time subscription for immediate updates
      const subscription = supabase
        .channel('tasks')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('Real-time update received:', payload)
            handleRealTimeUpdate(payload)
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const handleRealTimeUpdate = (payload: any) => {
    console.log('Handling real-time update:', payload.eventType, payload.new, payload.old)
    
    switch (payload.eventType) {
      case 'INSERT':
        setTasks(prevTasks => {
          const newTask = payload.new as Task
          // Check if task already exists to avoid duplicates
          if (prevTasks.some(task => task.id === newTask.id)) {
            return prevTasks
          }
          return [newTask, ...prevTasks]
        })
        break
        
      case 'UPDATE':
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === payload.new.id ? payload.new as Task : task
          )
        )
        break
        
      case 'DELETE':
        setTasks(prevTasks => 
          prevTasks.filter(task => task.id !== payload.old.id)
        )
        break
        
      default:
        // Fallback to refetch for unknown events
        fetchTasks()
    }
  }

  const fetchTasks = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      console.log('Fetched tasks:', data) // Debug log
      setTasks(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching tasks:', err) // Debug log
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchDeletedTasks = async () => {
    if (!user) return

    try {
      // Only fetch tasks deleted within the last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString()
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .not('deleted_at', 'is', null)
        .gte('deleted_at', thirtyDaysAgo)
        .order('deleted_at', { ascending: false })

      if (error) throw error
      console.log('Fetched deleted tasks:', data)
      setDeletedTasks(data || [])
    } catch (err) {
      console.error('Error fetching deleted tasks:', err)
    }
  }

  const createTask = async (task: TaskInsert) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      console.log('Creating task:', task)
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...task, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      console.log('Task created successfully:', data)
      
      // Optimistically add the task to the UI immediately
      if (data) {
        setTasks(prevTasks => [data, ...prevTasks])
      }
      
      return { data, error: null }
    } catch (err) {
      console.error('Error creating task:', err)
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const updateTask = async (id: string, updates: TaskUpdate) => {
    try {
      console.log('Updating task:', id, updates)
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      console.log('Task updated successfully:', data)
      
      // Optimistically update the task in the UI
      if (data) {
        setTasks(prevTasks => 
          prevTasks.map(task => task.id === id ? data : task)
        )
      }
      
      return { data, error: null }
    } catch (err) {
      console.error('Error updating task:', err)
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const deleteTask = async (id: string) => {
    try {
      console.log('Deleting task:', id)
      
      // Optimistically move task to deleted tasks
      const taskToDelete = tasks.find(task => task.id === id)
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id))
      if (taskToDelete) {
        const deletedTask = { ...taskToDelete, deleted_at: new Date().toISOString(), deleted_by: user?.id || null }
        setDeletedTasks(prevDeleted => [deletedTask, ...prevDeleted])
      }
      
      // Soft delete: update deleted_at timestamp
      const { error } = await supabase
        .from('tasks')
        .update({ 
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id 
        })
        .eq('id', id)

      if (error) throw error
      console.log('Task soft deleted successfully')
      return { error: null }
    } catch (err) {
      console.error('Error deleting task:', err)
      // Revert the optimistic update on error
      fetchTasks()
      fetchDeletedTasks()
      return { error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const restoreTask = async (id: string) => {
    try {
      console.log('Restoring task:', id)
      
      // Optimistically move task back to active tasks
      const taskToRestore = deletedTasks.find(task => task.id === id)
      setDeletedTasks(prevDeleted => prevDeleted.filter(task => task.id !== id))
      if (taskToRestore) {
        const restoredTask = { ...taskToRestore, deleted_at: null, deleted_by: null }
        setTasks(prevTasks => [restoredTask, ...prevTasks])
      }
      
      // Restore: clear deleted_at timestamp
      const { error } = await supabase
        .from('tasks')
        .update({ 
          deleted_at: null,
          deleted_by: null 
        })
        .eq('id', id)

      if (error) throw error
      console.log('Task restored successfully')
      return { error: null }
    } catch (err) {
      console.error('Error restoring task:', err)
      // Revert the optimistic update on error
      fetchTasks()
      fetchDeletedTasks()
      return { error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const permanentlyDeleteTask = async (id: string) => {
    try {
      console.log('Permanently deleting task:', id)
      
      // Optimistically remove from deleted tasks
      setDeletedTasks(prevDeleted => prevDeleted.filter(task => task.id !== id))
      
      // Permanently delete from database
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
      console.log('Task permanently deleted successfully')
      return { error: null }
    } catch (err) {
      console.error('Error permanently deleting task:', err)
      // Revert the optimistic update on error
      fetchDeletedTasks()
      return { error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const toggleTaskCompletion = async (id: string, completed: boolean) => {
    console.log('Toggling task completion:', id, completed)
    return updateTask(id, { completed })
  }

  return {
    tasks,
    deletedTasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    restoreTask,
    permanentlyDeleteTask,
    toggleTaskCompletion,
    refetch: fetchTasks,
  }
}