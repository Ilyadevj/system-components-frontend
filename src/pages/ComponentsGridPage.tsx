import { useState, useMemo } from "react";
import type { FC, FormEvent } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ROUTES } from "../Routes";
import { ComponentCard } from "../components/ComponentCard";
import type { AppOutletContext } from "../AppLayout";

const ARCH_LAYERS = ["Шлюзы", "Бэкенд", "Базы данных", "Кэш", "Хранилище"];

export const ComponentsGridPage: FC = () => {
  const { cards, setCards } = useOutletContext<AppOutletContext>();
  const navigate = useNavigate();

  const [searchName, setSearchName] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Активные применённые значения фильтра
  const [activeSearch, setActiveSearch] = useState("");
  const [activeGroups, setActiveGroups] = useState<string[]>([]);
  const [activePriority, setActivePriority] = useState<string>("");

  const toggleGroup = (group: string) => {
    setSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const handleApplyFilter = (e?: FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setActiveSearch(searchName);
      setActiveGroups(selectedGroups);
      setActivePriority(selectedPriority);
      setLoading(false);
    }, 120);
  };

  const handleResetFilter = () => {
    setSearchName("");
    setSelectedGroups([]);
    setSelectedPriority("");
    setActiveSearch("");
    setActiveGroups([]);
    setActivePriority("");
  };

  const handleCardClick = (componentId: number) => {
    navigate(`${ROUTES.FEED}/${componentId}`);
  };

  const handleDeleteCard = (componentId: number) => {
    setCards((prev) => prev.filter((item) => item.id !== componentId));
  };

  const displayedComponents = useMemo(() => {
    return cards.filter((item) => {
      const matchSearch =
        !activeSearch ||
        item.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(activeSearch.toLowerCase());
      const matchGroup =
        !activeGroups.length || activeGroups.includes(item.grouping);
      const matchPriority =
        !activePriority || String(item.priority) === activePriority;
      return matchSearch && matchGroup && matchPriority;
    });
  }, [cards, activeSearch, activeGroups, activePriority]);

  return (
    <>
      {/* ФИЛЬТР СЛОЕВ И ПАРАМЕТРОВ */}
      <Form onSubmit={handleApplyFilter} className="filter-box">
        <div className="filter-header-label">Фильтры слоев архитектуры:</div>

        <div className="field-box" style={{ marginBottom: "10px" }}>
          <Form.Control
            type="text"
            className="text-input"
            placeholder="Поиск по названию компонента..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>

        <div className="filter-row" style={{ marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
          <div className="checkbox-group">
            {ARCH_LAYERS.map((groupName) => (
              <label key={groupName} className="checkbox-label">
                <input
                  type="checkbox"
                  name="groups"
                  value={groupName}
                  checked={selectedGroups.includes(groupName)}
                  onChange={() => toggleGroup(groupName)}
                />
                <span>{groupName}</span>
              </label>
            ))}
          </div>

          <Form.Select
            className="text-input"
            style={{ width: "auto", minWidth: "140px" }}
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="">Все приоритеты</option>
            <option value="1">Приоритет 1 (Выс)</option>
            <option value="2">Приоритет 2 (Сред)</option>
            <option value="3">Приоритет 3 (Низ)</option>
          </Form.Select>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Button type="submit" className="apply-btn" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Применить"}
          </Button>
          {(activeSearch || activeGroups.length > 0 || activePriority) && (
            <Button
              type="button"
              className="apply-btn"
              style={{ background: "rgba(255, 255, 255, 0.1)" }}
              onClick={handleResetFilter}
            >
              Сбросить
            </Button>
          )}
        </div>
      </Form>

      {loading ? (
        <div className="empty-state">
          <Spinner animation="border" />
        </div>
      ) : (
        <div className="cards-grid">
          {displayedComponents.length > 0 ? (
            displayedComponents.map((item) => (
              <ComponentCard
                key={item.id}
                onClick={() => handleCardClick(item.id)}
                onDelete={() => handleDeleteCard(item.id)}
                {...item}
              />
            ))
          ) : (
            <div className="empty-state">
              Нет опубликованных компонентов по выбранному фильтру
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ComponentsGridPage;
