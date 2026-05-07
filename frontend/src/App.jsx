import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AuthPage from './pages/Auth';
import Dashboard from './pages/Dashboard';
import TaskDetail from './pages/TaskDetail';
import ToastContainer from './components/ToastContainer';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthContext();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthContext();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary text-text-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-6xl mx-auto w-full pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      
      <Route path="/" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/tasks/:id" element={<ProtectedRoute><DashboardLayout><TaskDetail /></DashboardLayout></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
          <ToastContainer />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
