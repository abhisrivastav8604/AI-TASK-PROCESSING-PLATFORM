import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';

const POLL_INTERVAL = 3000;

const MOCK_TASK_DB = {
  "task_abc123": { _id: "task_abc123", title: "Process user feedback", operation: "uppercase", inputText: "this is some sample user feedback that needs to be processed.", status: "success", result: "THIS IS SOME SAMPLE USER FEEDBACK THAT NEEDS TO BE PROCESSED.", createdAt: "2024-01-15T10:30:00Z", updatedAt: "2024-01-15T10:30:02Z", logs: ["[10:30:01] Task received by worker-abc", "[10:30:01] Processing UPPERCASE operation...", "[10:30:02] Completed successfully"] },
  "task_def456": { _id: "task_def456", title: "Analyze review text", operation: "word_count", inputText: "Word count should return the exact number of words.", status: "running", result: null, createdAt: "2024-01-15T10:31:00Z", updatedAt: "2024-01-15T10:31:05Z", logs: ["[10:31:05] Task received by worker-xyz", "[10:31:05] Processing WORD_COUNT operation..."] }
};

export function useTaskDetail(id) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);
  const pollTimerRef = useRef(null);
  const toast = useToast();

  const fetchTask = useCallback(async (silent = false) => {
    try {
      const { data } = await api.get(`/tasks/${id}`);
      setTask(data.data);
      setUseMock(false);
    } catch (error) {
      console.error(error);
      if (!silent) toast.info('API not connected. Showing mock data.');
      setUseMock(true);
      const mockTask = MOCK_TASK_DB[id] || { 
        _id: id, title: "Mock Task", operation: "reverse", status: "pending", 
        inputText: "Mock input text for testing.", result: null, 
        createdAt: new Date().toISOString(), logs: [] 
      };
      setTask(mockTask);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id, toast]);

  const deleteTask = useCallback(async () => {
    if (useMock) return true;
    try {
      await api.delete(`/tasks/${id}`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete task');
      return false;
    }
  }, [id, useMock, toast]);

  const startPolling = useCallback(() => {
    if (pollTimerRef.current) return;
    pollTimerRef.current = setInterval(async () => {
      if (!task || (task.status !== 'pending' && task.status !== 'running') || useMock) return;
      await fetchTask(true);
    }, POLL_INTERVAL);
  }, [task, fetchTask, useMock]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTask();
  }, [fetchTask]);

  useEffect(() => {
    if (task && (task.status === 'pending' || task.status === 'running') && !useMock) {
      startPolling();
    } else {
      stopPolling();
    }
    return stopPolling;
  }, [task, startPolling, stopPolling, useMock]);

  return { task, loading, deleteTask };
}
