import { useState } from "react";
import type { FC } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { Alert, Spinner } from "react-bootstrap";
import type { RootState, AppDispatch } from "./store";
import { logoutSuccess } from "./slices/userSlice";
import { resetFilters, fetchComponentsList } from "./slices/componentsSlice";
import { isMockMode } from "./modules/dataMode";
import { TabBar } from "./components/TabBar";
import { ROUTES } from "./Routes";
import "./MobileApp.css";

export interface ComponentDraft {
  id: number;
  name: string;
  imageUrl: string;
  videoUrl: string;
}

export const AppLayout: FC = () => {
  const [logoutError, setLogoutError] = useState(false);
  const [draft, setDraft] = useState<ComponentDraft | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { isAuthenticated, username } = useSelector((state: RootState) => state.user);
  const { loading } = useSelector((state: RootState) => state.components);

  const isFeed = location.pathname.startsWith(ROUTES.FEED) || location.pathname === "/system-components/feed";
  const isEditor = location.pathname === ROUTES.ADD || ["/editor", "/system-components/editor"].includes(location.pathname);
  const isLogin = location.pathname === ROUTES.LOGIN;

  const getHeaderTitle = () => {
    if (isLogin) return "Авторизация";
    if (isEditor) {
      return draft ? "Публикация компонента" : "Новый компонент";
    }
    return "Компоненты системы";
  };

  const handleLogout = async () => {
    setLogoutError(false);
    try {
      if (!isMockMode) await axios.post("/api/users/logout");
    } catch (error) {
      if (!axios.isAxiosError(error) || ![401, 403].includes(error.response?.status ?? 0)) {
        setLogoutError(true);
        return;
      }
    }
    dispatch(logoutSuccess());
    setDraft(null);
    dispatch(resetFilters());
    if (location.pathname === ROUTES.GRID) void dispatch(fetchComponentsList());
    navigate(ROUTES.GRID);
  };

  return (
    <div className={`mobile-viewport ${isFeed ? "feed-viewport" : ""}`}>
      {/* Анимация, блокирующая действия пользователя во время выполнения запросов */}
      {loading && (
        <div className="blocking-loader-overlay" role="status" aria-live="polite">
          <div className="loader-box">
            <Spinner animation="border" variant="primary" />
            <span className="loader-text">Синхронизация с сервером...</span>
          </div>
        </div>
      )}

      {/* Верхняя шапка (скрывается только в полноэкранной видео-ленте) */}
      {!isFeed && (
        <header className="app-header">
          <div className="header-title-box">
            <span className="header-indicator"></span>
            <h1 className="header-title">{getHeaderTitle()}</h1>
          </div>

          {/* Переключение между интерфейсом гостя и пользователя (Вход/Выход) */}
          <div className="header-auth-box">
            {!isAuthenticated ? (
              !isLogin && (
                <button
                  type="button"
                  className="auth-header-btn login"
                  onClick={() => navigate(ROUTES.LOGIN)}
                >
                  Вход
                </button>
              )
            ) : (
              <div className="user-profile-badge">
                <span className="user-name" title={username}>
                  👤 {username}
                </span>
                <button
                  type="button"
                  className="auth-header-btn logout"
                  onClick={handleLogout}
                >
                  Выход
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      <main className={isFeed ? "page-content" : "page-content scrollable"}>
        {logoutError && <Alert variant="danger" className="mx-3">Не удалось выйти из системы.</Alert>}
        <Outlet context={{ draft, setDraft }} />
      </main>

      <TabBar onLogout={handleLogout} />
    </div>
  );
};

export default AppLayout;
