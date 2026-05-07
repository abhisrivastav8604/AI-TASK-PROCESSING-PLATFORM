import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';

const POLL_INTERVAL = 3000;

const MOCK_TASKS = [
  { _id: "task_abc123", title: "Process user feedback", operation: "uppercase", status: "success", result: "PROCESS USER FEEDBACK", createdAt: "2024-01-15T10:30:00Z", logs: ["[10:30:01] Task received", "[10:30:01] Processing...", "[10:30:02] Completed successfully"] },
  { _id: "task_def456", title: "Analyze review text", operation: "word_count", status: "running", createdAt: "2024-01-15T10:31:00Z", logs: ["[10:31:05] Task received", "[10:31:05] Processing..."] },
  { _id: "task_ghi789", title: "Format API response", operation: "reverse", status: "pending", createdAt: "2024-01-15T10:32:00Z", logs: [] },
  { _id: "task_jkl012", title: "Normalize input data", operation: "lowercase", status: "failed", createdAt: "2024-01-15T10:29:00Z", logs: ["[10:29:10] Task received", "[10:29:11] ERROR: Input too large"] }
];

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, running: 0, completed: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const pollTimerRef = useRef(null);
  const [useMock, setUseMock] = useState(false);

  const calculateStats = (data) => {
    return {
      total: data.length,
      running: data.filter(t => t.status === 'running').length,
      completed: data.filter(t => t.status === 'success').length,
      failed: data.filter(t => t.status === 'failed').length,
    };
  };

  const fetchTasks = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get('/tasks?limit=100'); 
      setTasks(data.data);
      setStats(calculateStats(data.data));
      setUseMock(false);
    } catch (error) {
      console.error(error);
      if (!silent) {
        toast.info('API not connected. Using mock data for preview.');
      }
      setTasks(MOCK_TASKS);
      setStats(calculateStats(MOCK_TASKS));
      setUseMock(true);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [toast]);

  const createTask = useCallback(async (payload) => {
    try {
      if (useMock) {
        const newTask = {
          _id: `task_${Math.random().toString(36).substr(2, 9)}`,
          ...payload,
          status: 'pending',
          createdAt: new Date().toISOString(),
          logs: []
        };
        setTasks(prev => [newTask, ...prev]);
        setStats(prev => ({ ...prev, total: prev.total + 1 }));
        return { success: true, task: newTask };
      }

      const { data } = await api.post('/tasks', payload);
      setTasks(prev => [data.data, ...prev]);
      setStats(prev => ({ ...prev, total: prev.total + 1 }));
      return { success: true, task: data.data };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
      return { success: false };
    }
  }, [useMock, toast]);

  const startPolling = useCallback(() => {
    if (pollTimerRef.current) return;
    pollTimerRef.current = setInterval(async () => {
      const hasActive = tasks.some(t => t.status === 'pending' || t.status === 'running');
      if (!hasActive || useMock) return;
      await fetchTasks(true);
    }, POLL_INTERVAL);
  }, [tasks, fetchTasks, useMock]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const hasActive = tasks.some(t => t.status === 'pending' || t.status === 'running');
    if (hasActive && !useMock) {
      startPolling();
    } else {
      stopPolling();
    }
    return stopPolling;
  }, [tasks, startPolling, stopPolling, useMock]);

  return { tasks, stats, loading, fetchTasks, createTask };
}
