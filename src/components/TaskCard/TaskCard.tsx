import React, { useState } from 'react'
import { Calendar, Edit2, Trash2, Clock, Check, RotateCcw } from 'lucide-react'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { Task } from '../../lib/supabase'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string, completed: boolean) => void
}

const priorityColors = {
  high: 'border-red-200 bg-red-50',
  medium: 'border-yellow-200 bg-yellow-50',
  low: 'border-green-200 bg-green-50',
}

const priorityBadgeColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
}

export function TaskCard({ task, onEdit, onDelete, onToggleComplete }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete(task.id)
    setIsDeleting(false)
    setShowDeleteConfirm(false)
  }

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM d, yyyy')
  }

  const isDueToday = task.due_date && isToday(new Date(task.due_date))
  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date))

  return (
    <div className={`relative border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-md ${
      task.completed 
        ? 'border-gray-200 bg-gray-50 opacity-75' 
        : priorityColors[task.priority]
    }`}>
      {/* Priority Badge */}
      <div className="flex items-start justify-between mb-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          task.completed ? 'bg-gray-100 text-gray-600 border-gray-200' : priorityBadgeColors[task.priority]
        }`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
        </span>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit task"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? '...' : 'Yes'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Task Content */}
      <div className="mb-4">
        <h3 className={`text-lg font-semibold mb-2 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className={`text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
            {task.description}
          </p>
        )}
      </div>

      {/* Due Date */}
      {task.due_date && (
        <div className={`flex items-center gap-2 mb-4 ${
          task.completed 
            ? 'text-gray-400' 
            : isOverdue 
              ? 'text-red-600' 
              : isDueToday 
                ? 'text-orange-600' 
                : 'text-gray-500'
        }`}>
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">
            Due {formatDueDate(task.due_date)}
            {isOverdue && !task.completed && ' (Overdue)'}
          </span>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={() => onToggleComplete(task.id, !task.completed)}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
          task.completed
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {task.completed ? (
          <>
            <RotateCcw className="h-4 w-4" />
            Mark as Incomplete
          </>
        ) : (
          <>
            <Check className="h-4 w-4" />
            Mark as Complete
          </>
        )}
      </button>

      {/* Created/Updated timestamps */}
      <div className="mt-3 text-xs text-gray-400 flex items-center gap-2">
        <Clock className="h-3 w-3" />
        Created {format(new Date(task.created_at), 'MMM d, yyyy')}
        {task.updated_at !== task.created_at && (
          <span>• Updated {format(new Date(task.updated_at), 'MMM d, yyyy')}</span>
        )}
      </div>
    </div>
  )
}