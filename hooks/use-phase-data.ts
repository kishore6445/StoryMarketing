import useSWR from 'swr'

const fetcher = async (url: string) => {
  const token = localStorage.getItem('sessionToken')
  const response = await fetch(url, {
    headers: token ? {
      'Authorization': `Bearer ${token}`,
    } : {},
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch')
  }
  
  return response.json()
}

export function usePhaseData(clientId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    clientId ? `/api/phases/${clientId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    phases: data?.phases || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Optimistic update helper for tasks
export async function updateTaskOptimistic(
  taskId: string,
  updates: any,
  mutate: any,
  currentData: any
) {
  // Optimistically update the UI
  const optimisticData = {
    ...currentData,
    phases: currentData.phases.map((phase: any) => ({
      ...phase,
      phase_sections: phase.phase_sections.map((section: any) => ({
        ...section,
        tasks: section.tasks.map((task: any) =>
          task.id === taskId ? { ...task, ...updates } : task
        ),
      })),
    })),
  }

  mutate(optimisticData, false)

  try {
    const token = localStorage.getItem('sessionToken')
    const response = await fetch('/api/tasks', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ taskId, ...updates }),
    })

    if (!response.ok) {
      throw new Error('Failed to update task')
    }

    // Revalidate to ensure consistency
    mutate()
    return { success: true }
  } catch (error) {
    // Revert on error
    mutate(currentData)
    return { success: false, error }
  }
}

// Optimistic update helper for documents
export async function updateDocumentOptimistic(
  documentId: string,
  updates: any,
  mutate: any,
  currentData: any
) {
  const optimisticData = {
    ...currentData,
    phases: currentData.phases.map((phase: any) => ({
      ...phase,
      phase_sections: phase.phase_sections.map((section: any) => ({
        ...section,
        documents: section.documents.map((doc: any) =>
          doc.id === documentId ? { ...doc, ...updates } : doc
        ),
      })),
    })),
  }

  mutate(optimisticData, false)

  try {
    const token = localStorage.getItem('sessionToken')
    const response = await fetch('/api/documents', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ documentId, ...updates }),
    })

    if (!response.ok) {
      throw new Error('Failed to update document')
    }

    mutate()
    return { success: true }
  } catch (error) {
    mutate(currentData)
    return { success: false, error }
  }
}
