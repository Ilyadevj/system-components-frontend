import type { FC } from "react";
import "./TabBar.css";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES, ROUTE_LABELS } from "../Routes";
import type { SystemComponent } from "../modules/componentsApi";

interface Props {
  cards: SystemComponent[];
}

export const TabBar: FC<Props> = ({ cards }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isFeed = location.pathname.startsWith(ROUTES.FEED);
  const isGrid = location.pathname === ROUTES.GRID || location.pathname === "/system-components";

  const goToFeed = () => {
    const firstId = cards[0]?.id;
    if (firstId) {
      navigate(`${ROUTES.FEED}/${firstId}`);
    } else {
      navigate(ROUTES.FEED);
    }
  };

  const goToGrid = () => {
    navigate(ROUTES.GRID);
  };

  return (
    <nav className="bottom-tab-bar" aria-label="Нижняя панель навигации">
      {/* 1. Лента — доступна */}
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

      {/* 2. Добавление — недоступна для гостя (по заданию лабораторной) */}
      <button
        type="button"
        disabled
        className="tab-item tab-item-disabled"
        title="Добавление недоступно для гостей"
        aria-disabled="true"
      >
        <svg className="tab-icon" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span>{ROUTE_LABELS.ADD}</span>
      </button>

      {/* 3. Плитка — доступна */}
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

      {/* 4. Вход — недоступна для гостя (по заданию лабораторной) */}
      <button
        type="button"
        disabled
        className="tab-item tab-item-disabled"
        title="Вход временно недоступен"
        aria-disabled="true"
      >
        <svg className="tab-icon" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>{ROUTE_LABELS.LOGIN}</span>
      </button>
    </nav>
  );
};

export default TabBar;
