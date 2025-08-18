/*
  # Add soft delete columns to tasks table

  1. Changes
    - Add `deleted_at` column to track when tasks are soft deleted
    - Add `deleted_by` column to track who deleted the task
    - Both columns are nullable and default to NULL for active tasks

  2. Security
    - No RLS changes needed as existing policies will handle the new columns
    - Foreign key constraint ensures deleted_by references valid users
*/

-- Add soft delete columns to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id) DEFAULT NULL;