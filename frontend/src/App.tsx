import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/components/common/Toast';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import OAuthSuccess from '@/pages/OAuthSuccess';
import Dashboard from '@/pages/Dashboard';
import MyFiles from '@/pages/MyFiles';
import SharedWithMe from '@/pages/SharedWithMe';
import Activity from '@/pages/Activity';
import Settings from '@/pages/Settings';
import PublicFileAccess from '@/pages/PublicFileAccess';
import NotFound from '@/pages/NotFound';
import Invitation from '@/pages/Invitation';

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/files" element={<MyFiles />} />
          <Route path="/files/:folderId" element={<MyFiles />} />
          <Route path="/shared" element={<SharedWithMe />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/oauth-success" element={<OAuthSuccess />} />
              <Route path="/shared/:token" element={<PublicFileAccess />} />
              <Route path="/invite/:token" element={<Invitation />}/>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/*" element={<ProtectedLayout />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
