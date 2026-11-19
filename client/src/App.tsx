import type { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { PublicMenu } from "./pages/PublicMenu";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { MenuEditor } from "./pages/admin/MenuEditor";
import { Settings } from "./pages/admin/Settings";
import { QrCodes } from "./pages/admin/QrCodes";

function RequireAuth({ children }: { children: ReactNode }) {
  const { me, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="center muted">Yükleniyor…</div>;
  if (!me) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/menu/:slug" element={<PublicMenu />} />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<MenuEditor />} />
        <Route path="settings" element={<Settings />} />
        <Route path="qr" element={<QrCodes />} />
      </Route>
      <Route path="*" element={<div className="center muted">Sayfa bulunamadı</div>} />
    </Routes>
  );
}
