import { useEffect, useState } from "react";
import type { FC, FormEvent } from "react";
import { Alert, Form, Button, Spinner } from "react-bootstrap";
import { Navigate, useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import axios from "axios";
import { api } from "../api";
import { isMockMode } from "../modules/dataMode";
import { normalizeComponent, publishMockComponent } from "../slices/componentsSlice";
import { ROUTES } from "../Routes";
import type { ComponentDraft } from "../AppLayout";

import { getAssetUrl, DEFAULT_IMAGE, DEFAULT_VIDEO } from "../utils/assets";

const defaultImage = DEFAULT_IMAGE;
const defaultVideo = DEFAULT_VIDEO;

interface EditorOutletContext {
  draft: ComponentDraft | null;
  setDraft: React.Dispatch<React.SetStateAction<ComponentDraft | null>>;
}

function toDraft(data: unknown): ComponentDraft {
  const component = normalizeComponent(data);
  return {
    id: component.id,
    name: component.name,
    imageUrl: getAssetUrl(component.imageUrl) || defaultImage,
    videoUrl: getAssetUrl(component.videoUrl) || defaultVideo,
  };
}

function readPreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && typeof error.response?.data?.error === "string") {
    return error.response.data.error;
  }
  return fallback;
}

export const EditorPage: FC = () => {
  const { draft, setDraft } = useOutletContext<EditorOutletContext>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(!isMockMode);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File>();
  const [videoFile, setVideoFile] = useState<File>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [grouping, setGrouping] = useState("Бэкенд");
  const [priority, setPriority] = useState(1);

  useEffect(() => {
    if (!isAuthenticated || isMockMode) return;
    let active = true;
    api.systemComponents.systemComponentsDraft()
      .then(({ data }) => {
        if (active) setDraft(toDraft(data));
      })
      .catch((err: unknown) => {
        if (active && (!axios.isAxiosError(err) || err.response?.status !== 404)) {
          setError("Не удалось загрузить черновик");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [isAuthenticated, setDraft]);

  const handleCreateDraft = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      if (isMockMode) {
        setDraft({
          id: Date.now(),
          name: name.trim(),
          imageUrl: imageFile ? await readPreview(imageFile) : defaultImage,
          videoUrl: videoFile ? await readPreview(videoFile) : defaultVideo,
        });
      } else {
        const form = new FormData();
        form.set("name", name.trim());
        if (imageFile) form.set("image", imageFile);
        if (videoFile) form.set("video", videoFile);
        const { data } = await api.systemComponents.systemComponentsCreate(form);
        setDraft(toDraft(data));
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        try {
          const { data } = await api.systemComponents.systemComponentsDraft();
          setDraft(toDraft(data));
          return;
        } catch {
          setError("Не удалось загрузить существующий черновик");
          return;
        }
      }
      setError(getErrorMessage(err, "Не удалось создать черновик"));
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const fields = { description: description.trim(), grouping, priority };
    if (!fields.description) {
      setError("Заполните описание компонента");
      return;
    }

    setLoading(true);
    setError("");
    try {
      if (isMockMode) {
        dispatch(publishMockComponent({
          ...draft,
          ...fields,
          responseTimeMs: 0,
          likesCount: 0,
          isCreator: true,
        }));
      } else {
        await api.systemComponents.systemComponentsPublish(draft.id, fields);
      }
      setDraft(null);
      navigate(ROUTES.GRID);
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось опубликовать компонент"));
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  return (
    <>
      {error && <Alert variant="danger" className="mx-3 mt-3">{error}</Alert>}
      {!draft ? (
        <Form onSubmit={handleCreateDraft} className="editor-form-stack editor-new">
          <Form.Group controlId="component-name" className="field-box">
            <Form.Label className="field-label">Название компонента *</Form.Label>
            <Form.Control
              name="name"
              className="text-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
              disabled={loading}
            />
          </Form.Group>

          <div className="editor-uploads">
            <label className="editor-upload">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0])}
                disabled={loading}
              />
              <span className="field-label">Изображение</span>
              <span className="editor-upload-name">{imageFile?.name || "Добавить изображение"}</span>
            </label>
            <label className="editor-upload">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0])}
                disabled={loading}
              />
              <span className="field-label">Видео</span>
              <span className="editor-upload-name">{videoFile?.name || "Добавить видео"}</span>
            </label>
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
                placeholder="Назначение компонента"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="field-box">
              <Form.Label className="field-label">
                Слой архитектуры *
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
                Приоритет *
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
