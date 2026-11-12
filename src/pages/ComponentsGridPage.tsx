import { useEffect } from "react";
import type { FC, FormEvent } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import {
  fetchComponentsList,
  toggleGroup,
  applyFilters,
  resetFilters,
  deleteComponentAsync,
} from "../slices/componentsSlice";
import { ROUTES } from "../Routes";
import { ComponentCard } from "../components/ComponentCard";

const ARCH_LAYERS = ["Шлюзы", "Бэкенд", "Базы данных", "Кэш", "Хранилище"];

export const ComponentsGridPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { items, loading, filters } = useSelector(
    (state: RootState) => state.components
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  // Загрузка компонентов через Redux Thunk при монтировании
  useEffect(() => {
    dispatch(fetchComponentsList());
  }, [dispatch]);

  const handleApplyFilter = (e?: FormEvent) => {
    e?.preventDefault();
    dispatch(applyFilters());
    dispatch(fetchComponentsList());
  };

  const handleResetFilter = () => {
    dispatch(resetFilters());
    dispatch(fetchComponentsList());
  };

  const handleCardClick = (componentId: number) => {
    navigate(`${ROUTES.FEED}/${componentId}`);
  };

  const handleDeleteCard = (componentId: number) => {
    dispatch(deleteComponentAsync(componentId));
  };

  const isFilterActive = filters.selectedGroups.length > 0;

  return (
    <>
      {/* ФИЛЬТР СЛОЕВ АРХИТЕКТУРЫ (ТОЛЬКО ЧЕКБОКСЫ) */}
      <Form onSubmit={handleApplyFilter} className="filter-box">
        <div className="filter-header-label">Фильтры слоев архитектуры:</div>

        <div className="filter-row" style={{ marginBottom: "12px" }}>
          <div className="checkbox-group">
            {ARCH_LAYERS.map((groupName) => (
              <label key={groupName} className="checkbox-label">
                <input
                  type="checkbox"
                  name="groups"
                  value={groupName}
                  checked={filters.selectedGroups.includes(groupName)}
                  onChange={() => dispatch(toggleGroup(groupName))}
                  disabled={loading}
                />
                <span>{groupName}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Button type="submit" className="apply-btn" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Применить"}
          </Button>
          {isFilterActive && (
            <Button
              type="button"
              className="apply-btn"
              style={{ background: "rgba(255, 255, 255, 0.1)" }}
              onClick={handleResetFilter}
              disabled={loading}
            >
              Сбросить
            </Button>
          )}
        </div>
      </Form>

      {/* СЕТКА КАРТОЧЕК */}
      <div className="cards-grid">
        {items.length > 0 ? (
          items.map((item) => (
            <ComponentCard
              key={item.id}
              onClick={() => handleCardClick(item.id)}
              onDelete={
                isAuthenticated ? () => handleDeleteCard(item.id) : undefined
              }
              {...item}
            />
          ))
        ) : (
          <div className="empty-state">
            Нет опубликованных компонентов по выбранному фильтру
          </div>
        )}
      </div>
    </>
  );
};

export default ComponentsGridPage;
