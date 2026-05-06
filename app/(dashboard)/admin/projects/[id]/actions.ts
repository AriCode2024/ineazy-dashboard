'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateTaskStatus(taskId: string, status: string) {
  if (!['pending', 'in_progress', 'completed'].includes(status)) {
    throw new Error('Invalid status')
  }

  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const patch: Record<string, string | null> = { status }
  if (status === 'in_progress') {
    patch.started_at = today
    patch.completed_at = null
  } else if (status === 'completed') {
    patch.completed_at = today
  } else {
    patch.started_at = null
    patch.completed_at = null
  }

  const { error } = await supabase
    .from('project_tasks')
    .update(patch)
    .eq('id', taskId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/admin/projects', 'layout')
}

export async function updateTaskNotes(taskId: string, notes: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('project_tasks')
    .update({ notes: notes.trim() || null })
    .eq('id', taskId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/admin/projects', 'layout')
}
