export interface FavoriteItem {
  id: string;
  titleKey: string;
  icon: any; // Image icon source
  subtitleKey?: string;
  screenRoute?: string;
  [key: string]: any; // Generic item structure
}

export type DragSource = 'donor' | 'receiver';

export interface FavoritesSectionReceiverProps {
  data: FavoriteItem[];
  onRemove: (item: FavoriteItem) => void;
  onDragStart: (item: FavoriteItem, position: DragPosition, source: DragSource) => void;
  onDragMove: (position: DragPosition) => void;
  onDragEnd: (item: FavoriteItem, position: DragPosition, source: DragSource) => void;
  onDragActiveChange?: (active: boolean) => void;
  isDragActive: boolean;
  receiverRef: React.RefObject<any>;
}

export interface FavoritesSectionDonorProps {
  data: FavoriteItem[];
  onAdd: (item: FavoriteItem) => void;
  onDragStart: (item: FavoriteItem, position: DragPosition, source: DragSource) => void;
  onDragMove: (position: DragPosition) => void;
  onDragEnd: (item: FavoriteItem, position: DragPosition, source: DragSource) => void;
  onDragActiveChange?: (active: boolean) => void;
  donorRef: React.RefObject<any>;
}

export interface DraggableCardProps {
  item: FavoriteItem;
  source: DragSource;
  onDragStart: (item: FavoriteItem, position: DragPosition, source: DragSource) => void;
  onDragMove: (position: DragPosition) => void;
  onDragEnd: (item: FavoriteItem, position: DragPosition, source: DragSource) => void;
  containerWidth: number;
  onDragActiveChange?: (active: boolean) => void;
  showCloseBtn?: boolean;
  onClosePress?: () => void;
}

export interface DragPosition {
  x: number;
  y: number;
}

export interface LayoutMetrics {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FavoritesManagementState {
  favorites: FavoriteItem[];
  availableItems: FavoriteItem[];
  draggedItem: FavoriteItem | null;
  isDragActive: boolean;
  draggedPosition: DragPosition;
}

export const MAX_FAVORITES = 8;
