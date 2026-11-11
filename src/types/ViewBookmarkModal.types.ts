export type BookmarkType = 0 | 1 | 2 | 3 | 'Document' | 'Notes' | 'Link' | 'URL' | 'Other';

export interface Bookmark {
  id?: string | number;
  sitename?: string;
  title?: string;
  type: BookmarkType;
  urllink?: string;
  note?: string;
  documentid?: string | number | string[];
  username?: string;
  password?: string;
}

export interface ViewBookmarkModalProps {
  visible: boolean;
  onClose: () => void;
  bookmark: Bookmark | null;
}
