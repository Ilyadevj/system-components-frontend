import { useState, type FC } from "react";
import { Outlet, useLocation } from "react-router-dom";
import type { SystemComponent } from "./modules/componentsApi";
import { COMPONENTS_MOCK } from "./modules/mock";
import { TabBar } from "./components/TabBar";
import { ROUTES } from "./Routes";
import "./MobileApp.css";

export interface ComponentDraft {
  id?: number;
  name: string;
  imageUrl: string;
  videoUrl: string;
}

export interface AppOutletContext {
  cards: SystemComponent[];
  setCards: React.Dispatch<React.SetStateAction<SystemComponent[]>>;
  draft: ComponentDraft | null;
  setDraft: React.Dispatch<React.SetStateAction<ComponentDraft | null>>;
}

export const AppLayout: FC = () => {
  const [cards, setCards] = useState<SystemComponent[]>(COMPONENTS_MOCK.results);
  const [draft, setDraft] = useState<ComponentDraft | null>(null);
  const location = useLocation();

  const isFeed = location.pathname.startsWith(ROUTES.FEED);
  const isEditor = location.pathname === ROUTES.ADD || location.pathname === "/editor";

  const getHeaderTitle = () => {
    if (isEditor) {
      return draft ? "Публикация компонента" : "Новый компонент";
    }
    return "Компоненты системы";
  };

  return (
    <div className={`mobile-viewport ${isFeed ? "feed-viewport" : ""}`}>
      {!isFeed && (
        <header className="app-header">
          <div className="header-title-box">
            <span className="header-indicator"></span>
            <h1 className="header-title">{getHeaderTitle()}</h1>
          </div>
        </header>
      )}

      <main className={isFeed ? "" : "page-content scrollable"}>
        <Outlet context={{ cards, setCards, draft, setDraft }} />
      </main>

      <TabBar cards={cards} />
    </div>
  );
};
