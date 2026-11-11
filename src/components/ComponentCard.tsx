import type { FC, MouseEvent } from "react";
import { Card, Badge } from "react-bootstrap";
import type { SystemComponent } from "../modules/componentsApi";

const defaultImage = "/DefaultImage.png";

export interface ICardProps extends SystemComponent {
  onClick: () => void;
  onDelete?: () => void;
}

export const ComponentCard: FC<ICardProps> = ({
  name,
  grouping,
  priority,
  imageUrl,
  likesCount,
  onClick,
  onDelete,
}) => {
  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Удалить компонент из каталога?")) {
      onDelete?.();
    }
  };


  const resolvedImage = imageUrl && imageUrl.trim() ? imageUrl : defaultImage;

  return (
    <div className="grid-card-wrapper">
      <Card
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClick();
          }
        }}
        className="grid-card"
      >
        <div className="card-img-wrapper">
          <Card.Img
            src={resolvedImage}
            alt={name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = defaultImage;
            }}
            className="card-img"
          />
          <Badge className="card-likes-badge">♥ {likesCount}</Badge>
        </div>
        <Card.Body className="card-body">
          <Badge className="card-badge">{grouping || "—"}</Badge>
          <Card.Title as="h2" className="card-heading">{name}</Card.Title>
          <div className="card-priority">Приор. {priority || "—"}</div>
        </Card.Body>
      </Card>

      {onDelete && (
        <div className="delete-card-form">
          <button
            type="button"
            className="delete-card-btn"
            title="Удалить карточку"
            onClick={handleDelete}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default ComponentCard;
