import type { FC } from "react";
import "./InputField.css";

export interface FilterProps {
  searchName: string;
  setSearchName: (value: string) => void;
  selectedGrouping: string;
  setSelectedGrouping: (value: string) => void;
  selectedPriority: string;
  setSelectedPriority: (value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  loading?: boolean;
}

export const InputField: FC<FilterProps> = ({
  searchName,
  setSearchName,
  selectedGrouping,
  setSelectedGrouping,
  selectedPriority,
  setSelectedPriority,
  onSubmit,
  onReset,
  loading,
}) => (
  <div className="filter-box">
    <div className="filter-header-label">Поиск и фильтрация</div>
    <div className="field-box" style={{ marginBottom: "8px" }}>
      <input
        type="text"
        placeholder="Поиск по названию узла..."
        value={searchName}
        onChange={(event) => setSearchName(event.target.value)}
        className="text-input"
      />
    </div>

    <div className="filter-row" style={{ marginBottom: "8px" }}>
      <select
        className="text-input"
        value={selectedGrouping}
        onChange={(event) => setSelectedGrouping(event.target.value)}
      >
        <option value="">Все группы</option>
        <option value="Шлюзы">Шлюзы</option>
        <option value="Бэкенд">Бэкенд</option>
        <option value="Базы данных">Базы данных</option>
        <option value="Кэш">Кэш</option>
        <option value="Хранилище">Хранилище</option>
      </select>

      <select
        className="text-input"
        value={selectedPriority}
        onChange={(event) => setSelectedPriority(event.target.value)}
      >
        <option value="">Все приоритеты</option>
        <option value="1">Приоритет 1 (Выс)</option>
        <option value="2">Приоритет 2 (Сред)</option>
        <option value="3">Приоритет 3 (Низ)</option>
      </select>
    </div>

    <div style={{ display: "flex", gap: "8px" }}>
      <button
        type="button"
        className="apply-btn"
        style={{ flex: 1 }}
        disabled={loading}
        onClick={onSubmit}
      >
        Фильтровать
      </button>
      <button
        type="button"
        className="apply-btn"
        style={{ background: "rgba(255, 255, 255, 0.1)" }}
        disabled={loading}
        onClick={onReset}
      >
        Сброс
      </button>
    </div>
  </div>
);

export default InputField;
