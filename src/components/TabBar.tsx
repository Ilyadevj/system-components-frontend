import type { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { ROUTES, ROUTE_LABELS } from "../Routes";
import "./TabBar.css";

export const TabBar: FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const { items } = useSelector((state: RootState) => state.components);

  const isFeed = location.pathname.startsWith(ROUTES.FEED);
  const isGrid = location.pathname === ROUTES.GRID || location.pathname === "/system-components";
  const isEditor = location.pathname === ROUTES.ADD || location.pathname === "/editor";
  const isLogin = location.pathname === ROUTES.LOGIN;

  const goToFeed = () => {
    const firstId = items[0]?.id;
    if (firstId) {
      navigate(`${ROUTES.FEED}/${firstId}`);
    } else {
      navigate(ROUTES.FEED);
    }
  };

  const goToGrid = () => {
    navigate(ROUTES.GRID);
  };

  const goToAdd = () => {
    if (isAuthenticated) {
      navigate(ROUTES.ADD);
    }
  };

  const handleAuthAction = () => {
    if (isAuthenticated) onLogout();
    else navigate(ROUTES.LOGIN);
  };

  return (
    <nav className="bottom-tab-bar" aria-label="Нижняя панель навигации">
      {/* 1. Лента — доступна всегда */}
      <button
        type="button"
        className={`tab-item ${isFeed ? "active" : ""}`}
        onClick={goToFeed}
        title={ROUTE_LABELS.FEED}
      >
        <svg className="tab-icon" viewBox="0 0 24 24">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span>{ROUTE_LABELS.FEED}</span>
      </button>

      {/* 2. Добавление — доступно только авторизованному пользователю */}
      <button
        type="button"
        disabled={!isAuthenticated}
        className={`tab-item ${!isAuthenticated ? "tab-item-disabled" : ""} ${isEditor ? "active" : ""}`}
        onClick={goToAdd}
        title={
          isAuthenticated
            ? ROUTE_LABELS.ADD
            : "Добавление доступно только авторизованным пользователям"
        }
        aria-disabled={!isAuthenticated}
      >
        <svg className="tab-icon" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span>{ROUTE_LABELS.ADD}</span>
      </button>

      {/* 3. Плитка — доступна всегда */}
      <button
        type="button"
        className={`tab-item ${isGrid ? "active" : ""}`}
        onClick={goToGrid}
        title={ROUTE_LABELS.GRID}
      >
        <svg className="tab-icon" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        <span>{ROUTE_LABELS.GRID}</span>
      </button>

      {/* 4. Вход / Выход — переключение интерфейса гость/пользователь */}
      <button
        type="button"
        className={`tab-item ${isLogin ? "active" : ""}`}
        onClick={handleAuthAction}
        title={isAuthenticated ? "Выйти из системы" : ROUTE_LABELS.LOGIN}
      >
        {isAuthenticated ? (
          <>
            <svg className="tab-icon" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Выход</span>
          </>
        ) : (
          <>
            <svg className="tab-icon" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{ROUTE_LABELS.LOGIN}</span>
          </>
        )}
      </button>
    </nav>
  );
};

export default TabBar;
