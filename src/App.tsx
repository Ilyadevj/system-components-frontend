import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { FeedDetailPage } from "./pages/FeedDetailPage";
import ComponentsGridPage from "./pages/ComponentsGridPage";
import EditorPage from "./pages/EditorPage";
import { ROUTES } from "./Routes";
import { AppLayout } from "./AppLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.GRID} element={<ComponentsGridPage />} />
          <Route path="/system-components" element={<ComponentsGridPage />} />
          <Route path={`${ROUTES.FEED}/:id`} element={<FeedDetailPage />} />
          <Route path={ROUTES.FEED} element={<FeedDetailPage />} />
          <Route path="/system-components/feed" element={<FeedDetailPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/system-components/editor" element={<EditorPage />} />
          <Route path={ROUTES.ADD} element={<EditorPage />} />
          <Route path="*" element={<Navigate to={ROUTES.GRID} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
