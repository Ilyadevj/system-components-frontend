import { useState } from "react";
import type { FC, FormEvent, ChangeEvent } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { createComponentAsync } from "../slices/componentsSlice";
import { ROUTES } from "../Routes";
import type { ComponentDraft } from "../AppLayout";

import { getAssetUrl, DEFAULT_IMAGE, DEFAULT_VIDEO } from "../utils/assets";

const defaultImage = DEFAULT_IMAGE;
const defaultVideo = DEFAULT_VIDEO;

const PRESET_IMAGES = [
  { label: "Шлюз", url: getAssetUrl("/gateway.png") },
  { label: "Бэкенд", url: getAssetUrl("/auth.png") },
  { label: "База данных", url: getAssetUrl("/postgres.png") },
  { label: "Кэш", url: getAssetUrl("/redis.png") },
];

interface EditorOutletContext {
  draft: ComponentDraft | null;
  setDraft: React.Dispatch<React.SetStateAction<ComponentDraft | null>>;
}

export const EditorPage: FC = () => {
  const { draft, setDraft } = useOutletContext<EditorOutletContext>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading } = useSelector((state: RootState) => state.components);

  // Состояние формы этапа 1 (без ручного ввода громоздких URL)
  const [imageUrl, setImageUrl] = useState(() => getAssetUrl("/gateway.png"));
  const [videoUrl, setVideoUrl] = useState(() => getAssetUrl("/DefaultVideo.mp4"));
  const [imageFileName, setImageFileName] = useState("");
  const [videoFileName, setVideoFileName] = useState("");
  const [name, setName] = useState("");

  // Состояние формы этапа 2
  const [description, setDescription] = useState("");
  const [grouping, setGrouping] = useState("Бэкенд");
  const [priority, setPriority] = useState(1);

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFileName(file.name);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleVideoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFileName(file.name);
      setVideoUrl(URL.createObjectURL(file));
    }
  };

  const handleCreateDraft = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setDraft({
      id: Date.now(),
      name: name.trim(),
      imageUrl: imageUrl.trim() || defaultImage,
      videoUrl: videoUrl.trim() || defaultVideo,
    });
  };

  const handlePublish = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;

    const newComponent = {
      name: draft.name,
      imageUrl: draft.imageUrl || defaultImage,
      videoUrl: draft.videoUrl || defaultVideo,
      description: description.trim(),
      grouping: grouping.trim() || "Бэкенд",
      priority: Number(priority) || 1,
      responseTimeMs: Math.floor(Math.random() * 50) + 10,
      likesCount: 0,
    };

    // Вызываем Redux Thunk через сгенерированный API-клиент (axios)
    await dispatch(createComponentAsync(newComponent));
    setDraft(null);
    navigate(ROUTES.GRID);
  };

  return (
    <>
      {!draft ? (
        /* ЭТАП 1: Создание черновика (без ручных URL — выбор файла или пресета) */
        <Form onSubmit={handleCreateDraft} className="editor-form-stack">
          <div className="form-section-media">
            <div className="field-box">
              <Form.Label className="field-label">
                Изображение компонента
              </Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                className="text-input"
                onChange={handleImageFileChange}
                disabled={loading}
              />
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  marginTop: "8px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                  Или выберите типовую иконку:
                </span>
                {PRESET_IMAGES.map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    variant="outline-secondary"
                    size="sm"
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderColor:
                        imageUrl === preset.url
                          ? "#3274D9"
                          : "rgba(255, 255, 255, 0.15)",
                      backgroundColor:
                        imageUrl === preset.url
                          ? "rgba(50, 116, 217, 0.2)"
                          : "transparent",
                      color: "#F4F5F6",
                    }}
                    onClick={() => {
                      setImageUrl(preset.url);
                      setImageFileName("");
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              {imageFileName && (
                <div style={{ fontSize: "11px", color: "#5794F2", marginTop: "4px" }}>
                  Выбран файл: {imageFileName}
                </div>
              )}
            </div>

            <div className="field-box">
              <Form.Label className="field-label">
                Демонстрационное видео
              </Form.Label>
              <Form.Control
                type="file"
                accept="video/*"
                className="text-input"
                onChange={handleVideoFileChange}
                disabled={loading}
              />
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                {videoFileName ? `Выбран файл: ${videoFileName}` : "По умолчанию: стандартный демо-ролик архитектуры"}
              </div>
            </div>
          </div>

          <div className="form-section-fields">
            <div className="field-box">
              <Form.Label className="field-label">Название компонента *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                className="text-input"
                placeholder="Например: Кэш-память Memcached"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="action-footer">
            <Button type="submit" className="submit-btn" disabled={loading}>
              Далее →
            </Button>
          </div>
        </Form>
      ) : (
        /* ЭТАП 2: Черновик уже есть, публикация */
        <Form onSubmit={handlePublish} className="editor-form-stack">
          <input type="hidden" name="id" value={draft.id} />

          <div className="draft-component-header">
            Черновик: <b>{draft.name}</b>
          </div>

          {/* Превью фото и видео друг под другом */}
          <div className="form-section-media">
            <div className="media-preview-card">
              <div className="media-preview-label">Изображение компонента</div>
              <img
                src={draft.imageUrl || defaultImage}
                alt={draft.name}
                className="media-preview-img"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = defaultImage;
                }}
              />
            </div>

            <div className="media-preview-card">
              <div className="media-preview-label">Демонстрационное видео</div>
              <video
                className="media-preview-video"
                autoPlay
                loop
                muted
                playsInline
                src={draft.videoUrl || defaultVideo}
                onError={(e) => {
                  (e.currentTarget as HTMLVideoElement).src = defaultVideo;
                }}
              />
            </div>
          </div>

          {/* Поля для публикации */}
          <div className="form-section-fields">
            <div className="field-box">
              <Form.Label className="field-label">
                Краткое описание компонента *
              </Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                className="textarea-input"
                rows={3}
                required
                placeholder="Опишите назначение и роль компонента в системе..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="field-box">
              <Form.Label className="field-label">
                Слой архитектуры (группировка) *
              </Form.Label>
              <Form.Select
                name="grouping"
                className="text-input"
                required
                value={grouping}
                onChange={(e) => setGrouping(e.target.value)}
                disabled={loading}
              >
                <option value="Шлюзы">Шлюзы</option>
                <option value="Бэкенд">Бэкенд</option>
                <option value="Базы данных">Базы данных</option>
                <option value="Кэш">Кэш</option>
                <option value="Хранилище">Хранилище</option>
              </Form.Select>
            </div>

            <div className="field-box">
              <Form.Label className="field-label">
                Приоритет обработки запроса *
              </Form.Label>
              <Form.Select
                name="priority"
                className="text-input"
                required
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                disabled={loading}
              >
                <option value={1}>1 — Высокий приоритет</option>
                <option value={2}>2 — Средний приоритет</option>
                <option value={3}>3 — Низкий приоритет</option>
              </Form.Select>
            </div>
          </div>

          <div className="action-footer">
            <Button
              type="submit"
              className="submit-btn publish-color"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Публикация...
                </>
              ) : (
                "Опубликовать"
              )}
            </Button>
          </div>
        </Form>
      )}
    </>
  );
};

export default EditorPage;
