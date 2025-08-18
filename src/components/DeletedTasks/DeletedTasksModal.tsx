import React, { useState } from 'react'
import { X, RotateCcw, Trash2, Calendar, Clock, AlertTriangle } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { Task } from '../../lib/supabase'

interface DeletedTasksModalProps {
  isOpen: boolean
  onClose: () => void
  deletedTasks: Task[]
  onRestore: (id: string) => Promise<{ error: string | null }>
  onPermanentDelete: (id: string) => Promise<{ error: string | null }>
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

export function DeletedTasksModal({ 
  isOpen, 
  onClose, 
  deletedTasks, 
  onRestore, 
  onPermanentDelete 
}: DeletedTasksModalProps) {
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleRestore = async (id: string) => {
    setRestoringId(id)
    try {
      const result = await onRestore(id)
      if (result.error) {
        console.error('Failed to restore task:', result.error)
      }
    } catch (error) {
      console.error('Error restoring task:', error)
    }
    setRestoringId(null)
  }

  const handlePermanentDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const result = await onPermanentDelete(id)
      if (result.error) {
        console.error('Failed to permanently delete task:', result.error)
      }
    } catch (error) {
      console.error('Error permanently deleting task:', error)
    }
    setDeletingId(null)
    setConfirmDeleteId(null)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Trash2 className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Recently Deleted Tasks</h2>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
              {deletedTasks.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {deletedTasks.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recently Deleted Tasks</h3>
              <p className="text-gray-600">
                Tasks you delete will appear here for 30 days before being permanently removed.
              </p>
            </div>
          ) : (
            <>
              {/* Warning Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 mb-1">Temporary Storage</h4>
                  <p className="text-sm text-amber-700">
                    Deleted tasks are kept for 30 days. After that, they'll be permanently removed and cannot be recovered.
                  </p>
                </div>
              </div>

              {/* Deleted Tasks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deletedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`border-2 rounded-xl p-4 opacity-75 ${priorityColors[task.priority]}`}
                  >
                    {/* Priority Badge */}
                    <div className="flex items-start justify-between mb-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${priorityBadgeColors[task.priority]}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRestore(task.id)}
                          disabled={restoringId === task.id}
                          className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Restore task"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        
                        {confirmDeleteId === task.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handlePermanentDelete(task.id)}
                              disabled={deletingId === task.id}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              {deletingId === task.id ? '...' : 'Yes'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(task.id)}
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete permanently"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Task Content */}
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold mb-1 text-gray-700 line-through">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-500">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Due Date */}
                    {task.due_date && (
                      <div className="flex items-center gap-2 mb-3 text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          Due {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}

                    {/* Deletion Info */}
                    <div className="text-xs text-gray-400 flex items-center gap-2 pt-2 border-t border-gray-200">
                      <Clock className="h-3 w-3" />
                      <span>
                        Deleted {task.deleted_at ? formatDistanceToNow(new Date(task.deleted_at), { addSuffix: true }) : 'recently'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Tasks are automatically deleted after 30 days
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}