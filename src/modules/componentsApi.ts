export interface SystemComponent {
  id: number;
  name: string;
  priority: number;
  grouping: string;
  responseTimeMs: number;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  likesCount: number;
  isCreator?: boolean;
  isLiked?: boolean;
}

export interface ComponentsResult {
  resultCount: number;
  results: SystemComponent[];
}
