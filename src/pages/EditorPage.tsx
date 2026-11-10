import { useState } from "react";
import type { FC, FormEvent } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ROUTES } from "../Routes";
import type { AppOutletContext } from "../AppLayout";

const defaultImage = "/DefaultImage.png";
const defaultVideo = "/DefaultVideo.mp4";

export const EditorPage: FC = () => {
  const { setCards, draft, setDraft } = useOutletContext<AppOutletContext>();
  const navigate = useNavigate();

  // Состояние формы этапа 1
  const [imageUrl, setImageUrl] = useState("/gateway.png");
  const [videoUrl, setVideoUrl] = useState("/DefaultVideo.mp4");
  const [name, setName] = useState("");

  // Состояние формы этапа 2
  const [description, setDescription] = useState("");
  const [grouping, setGrouping] = useState("");
  const [priority, setPriority] = useState(1);

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

  const handlePublish = (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;

    const newComponent = {
      id: draft.id || Date.now(),
      name: draft.name,
      imageUrl: draft.imageUrl || defaultImage,
      videoUrl: draft.videoUrl || defaultVideo,
      description: description.trim(),
      grouping: grouping.trim() || "Бэкенд",
      priority: Number(priority) || 1,
      responseTimeMs: Math.floor(Math.random() * 50) + 10,
      likesCount: 0,
    };

    setCards((prev) => [newComponent, ...prev]);
    setDraft(null);
    navigate(ROUTES.GRID);
  };

  return (
    <>
      {!draft ? (
        /* ЭТАП 1: Создание черновика */
        <Form onSubmit={handleCreateDraft} className="editor-form-stack">
          <div className="form-section-media">
            <div className="field-box">
              <Form.Label className="field-label">
                Ссылка на изображение компонента *
              </Form.Label>
              <Form.Control
                type="text"
                name="image_url"
                className="text-input"
                placeholder="http://localhost:9000/system-components/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
              />
            </div>

            <div className="field-box">
              <Form.Label className="field-label">
                Ссылка на демонстрационное видео *
              </Form.Label>
              <Form.Control
                type="text"
                name="video_url"
                className="text-input"
                placeholder="http://localhost:9000/system-components/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                required
              />
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
              />
            </div>
          </div>

          <div className="action-footer">
            <Button type="submit" className="submit-btn">
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
              />
            </div>

            <div className="field-box">
              <Form.Label className="field-label">
                Группировка (по предметной области: Кэш или БД) *
              </Form.Label>
              <Form.Control
                type="text"
                name="grouping"
                className="text-input"
                required
                placeholder="Кэш, БД, Бэкенд"
                value={grouping}
                onChange={(e) => setGrouping(e.target.value)}
              />
            </div>

            <div className="field-box">
              <Form.Label className="field-label">
                Приоритет обработки запроса (число) *
              </Form.Label>
              <Form.Control
                type="number"
                name="priority"
                className="text-input"
                required
                min={1}
                max={10}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="action-footer">
            <Button type="submit" className="submit-btn publish-color">
              Опубликовать
            </Button>
          </div>
        </Form>
      )}
    </>
  );
};

export default EditorPage;
