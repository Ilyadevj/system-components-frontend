import { useState } from "react";
import type { FC } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { ROUTES } from "../Routes";
import type { AppOutletContext } from "../AppLayout";
import { COMPONENTS_MOCK } from "../modules/mock";

const defaultImage = "/DefaultImage.png";
const defaultVideo = "/DefaultVideo.mp4";

export const FeedDetailPage: FC = () => {
  const [failedVideoId, setFailedVideoId] = useState<number | null>(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const { cards, setCards } = useOutletContext<AppOutletContext>();

  const pageData =
    (id ? cards.find((item) => String(item.id) === id) : undefined) ??
    (id ? COMPONENTS_MOCK.results.find((item) => String(item.id) === id) : undefined) ??
    cards[0] ??
    COMPONENTS_MOCK.results[0];

  const handleNext = () => {
    if (!cards.length) return;
    const currentIndex = cards.findIndex(
      (item) => String(item.id) === String(pageData?.id)
    );
    const nextItem = cards[currentIndex + 1];
    if (nextItem) {
      navigate(`${ROUTES.FEED}/${nextItem.id}`);
    } else if (cards.length > 0) {
      // Зацикливание перехода для удобства просмотра
      navigate(`${ROUTES.FEED}/${cards[0].id}`);
    }
  };

  const handleLike = () => {
    if (!pageData) return;
    setCards((prev) =>
      prev.map((item) =>
        item.id === pageData.id ? { ...item, likesCount: item.likesCount + 1 } : item
      )
    );
  };

  if (!pageData) {
    return (
      <div className="empty-state">
        <Spinner animation="border" />
      </div>
    );
  }

  const isVideoFailed = failedVideoId === pageData.id;
  // Если поле videoUrl пустое — используем defaultVideo или обложку
  const hasVideo = Boolean(pageData.videoUrl && pageData.videoUrl.trim());
  const videoSrc = hasVideo ? pageData.videoUrl : defaultVideo;
  const imageSrc = pageData.imageUrl && pageData.imageUrl.trim() ? pageData.imageUrl : defaultImage;

  return (
    <div className="video-container">
      {hasVideo && !isVideoFailed ? (
        <video
          key={pageData.id}
          className="bg-video"
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setFailedVideoId(pageData.id)}
        />
      ) : (
        <img
          className="bg-video"
          src={imageSrc}
          alt={pageData.name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = defaultImage;
          }}
        />
      )}
      <div className="video-overlay"></div>

      {/* Сайдбар с полупрозрачными размытыми капсулами */}
      <div className="feed-sidebar">
        <div className="sidebar-item param-badge">
          <span className="param-label">ГРУППА</span>
          <span className="param-val">{pageData.grouping || "—"}</span>
        </div>

        <div className="sidebar-item param-badge">
          <span className="param-label">ПРИОРИТЕТ</span>
          <span className="param-val">{pageData.priority ?? "—"}</span>
        </div>

        <div className="sidebar-item like-container" onClick={handleLike}>
          <button type="button" className="action-circle" aria-label="Нравится">
            <svg className="heart-icon" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
          <span className="action-count">{pageData.likesCount}</span>
        </div>

        <Button
          type="button"
          onClick={handleNext}
          className="sidebar-item action-circle next-btn"
          aria-label="Следующий компонент"
        >
          <svg className="arrow-icon" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </Button>
      </div>

      {/* Полупрозрачная плашка внизу */}
      <div className="feed-bottom-info">
        <h2 className="feed-title">{pageData.name}</h2>
        <div className="feed-desc-clamp">
          <span>{pageData.description}</span>
        </div>
      </div>
    </div>
  );
};

export default FeedDetailPage;
