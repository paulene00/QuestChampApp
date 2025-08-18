import React, { useState } from 'react'
import { Plus, LogOut, CheckSquare, Filter, Search, Archive, Calendar, Clock, Trash2 } from 'lucide-react'
import { isToday, isTomorrow, isPast } from 'date-fns'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import { TaskCard } from '../TaskCard/TaskCard'
import { TaskForm } from '../TaskForm/TaskForm'
import { DeletedTasksModal } from '../DeletedTasks/DeletedTasksModal'
import { Task } from '../../lib/supabase'

type ViewMode = 'active' | 'completed' | 'deleted'
type FilterPriority = 'all' | 'high' | 'medium' | 'low'
type FilterDueDate = 'all' | 'overdue' | 'today' | 'tomorrow' | 'this-week' | 'no-due-date'

export function Dashboard() {
  const { user, signOut } = useAuth()
  const { tasks, deletedTasks, loading, createTask, updateTask, deleteTask, restoreTask, permanentlyDeleteTask, toggleTaskCompletion } = useTasks()
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [isDeletedTasksModalOpen, setIsDeletedTasksModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('active')
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all')
  const [filterDueDate, setFilterDueDate] = useState<FilterDueDate>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const handleCreateTask = async (taskData: any) => {
    setIsSubmitting(true)
    try {
      const result = await createTask(taskData)
      console.log('Create task result:', result) // Debug log
      
      if (result.error) {
        console.error('Failed to create task:', result.error)
        // You could show a toast notification here
      } else {
        console.log('Task created successfully, UI should update automatically')
      }
    } catch (error) {
      console.error('Error in handleCreateTask:', error)
    }
    setIsSubmitting(false)
  }

  const handleUpdateTask = async (taskData: any) => {
    if (!editingTask) return
    setIsSubmitting(true)
    try {
      const result = await updateTask(editingTask.id, taskData)
      if (result.error) {
        console.error('Failed to update task:', result.error)
      } else {
        console.log('Task updated successfully')
      }
    } catch (error) {
      console.error('Error in handleUpdateTask:', error)
    }
    setIsSubmitting(false)
    setEditingTask(null)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsTaskFormOpen(true)
  }

  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false)
    setEditingTask(null)
  }

  const isTaskDueToday = (task: Task) => {
    if (!task.due_date) return false
    return isToday(new Date(task.due_date))
  }

  const isTaskDueTomorrow = (task: Task) => {
    if (!task.due_date) return false
    return isTomorrow(new Date(task.due_date))
  }

  const isTaskOverdue = (task: Task) => {
    if (!task.due_date) return false
    const dueDate = new Date(task.due_date)
    return isPast(dueDate) && !isToday(dueDate)
  }

  const isTaskDueThisWeek = (task: Task) => {
    if (!task.due_date) return false
    const dueDate = new Date(task.due_date)
    const today = new Date()
    const endOfWeek = new Date(today)
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
    return dueDate >= today && dueDate <= endOfWeek
  }

  const filteredTasks = tasks.filter(task => {
    const matchesView = viewMode === 'active' ? !task.completed : task.completed
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    const matchesDueDate = (() => {
      switch (filterDueDate) {
        case 'all':
          return true
        case 'overdue':
          return isTaskOverdue(task)
        case 'today':
          return isTaskDueToday(task)
        case 'tomorrow':
          return isTaskDueTomorrow(task)
        case 'this-week':
          return isTaskDueThisWeek(task)
        case 'no-due-date':
          return !task.due_date
        default:
          return true
      }
    })()
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesView && matchesPriority && matchesDueDate && matchesSearch
  })

  console.log('All tasks:', tasks) // Debug log
  console.log('Filtered tasks:', filteredTasks) // Debug log
  console.log('View mode:', viewMode) // Debug log
  console.log('Due date filter:', filterDueDate) // Debug log

  const activeTasks = tasks.filter(task => !task.completed)
  const completedTasks = tasks.filter(task => task.completed)
  const overdueTasks = tasks.filter(task => !task.completed && isTaskOverdue(task))
  const todayTasks = tasks.filter(task => !task.completed && isTaskDueToday(task))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Quest Champ</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{activeTasks.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Archive className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due Today</p>
                <p className="text-2xl font-bold text-gray-900">{todayTasks.length}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Filter className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('active')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'active' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Active ({activeTasks.length})
                </button>
                <button
                  onClick={() => setViewMode('completed')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'completed' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Completed ({completedTasks.length})
                </button>
              </div>

              {/* Priority Filter */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

              {/* Due Date Filter */}
              <select
                value={filterDueDate}
                onChange={(e) => setFilterDueDate(e.target.value as FilterDueDate)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Due Dates</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due Today</option>
                <option value="tomorrow">Due Tomorrow</option>
                <option value="this-week">Due This Week</option>
                <option value="no-due-date">No Due Date</option>
              </select>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>

            <button
              onClick={() => setIsTaskFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              New Task
            </button>
          </div>
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {viewMode === 'active' ? 'No active tasks' : 'No completed tasks'}
            </h3>
            <p className="text-gray-600 mb-6">
              {viewMode === 'active' 
                ? 'Create your first task to get started!' 
                : 'Complete some tasks to see them here.'}
            </p>
            {viewMode === 'active' && (
              <>
                <button
                  onClick={() => setIsTaskFormOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Task
                </button>
                
                <button
                  onClick={() => setIsDeletedTasksModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <Trash2 className="h-4 w-4" />
                  Recently Deleted ({deletedTasks.length})
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={deleteTask}
                onToggleComplete={toggleTaskCompletion}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={handleCloseTaskForm}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        isLoading={isSubmitting}
      />
      
      {/* Recently Deleted Tasks Modal */}
      <DeletedTasksModal
        isOpen={isDeletedTasksModalOpen}
        onClose={() => setIsDeletedTasksModalOpen(false)}
        deletedTasks={deletedTasks}
        onRestore={restoreTask}
        onPermanentDelete={permanentlyDeleteTask}
      />
    </div>
  )
}