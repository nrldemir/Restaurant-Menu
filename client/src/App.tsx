import type { ReactNode } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { LogoMark } from "./components/Logo";
import { useUi } from "./lib/ui-lang";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { PublicMenu } from "./pages/PublicMenu";
import { Credits } from "./pages/Credits";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { MenuEditor } from "./pages/admin/MenuEditor";
import { Settings } from "./pages/admin/Settings";
import { QrCodes } from "./pages/admin/QrCodes";

function RequireAuth({ children }: { children: ReactNode }) {
  const { me, loading } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <div className="page-center">
        <LogoMark size={48} className="pulse" />
      </div>
    );
  if (!me) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

function NotFound() {
  const { t } = useUi();
  return (
    <div className="page-center not-found">
      <LogoMark size={56} />
      <h1 className="display">{t.app.notFoundTitle}</h1>
      <p>{t.app.notFoundText}</p>
      <Link className="btn btn-primary" to="/">
        {t.app.backHome}
      </Link>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/menu/:slug" element={<PublicMenu />} />
      <Route path="/kaynaklar" element={<Credits />} />
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
