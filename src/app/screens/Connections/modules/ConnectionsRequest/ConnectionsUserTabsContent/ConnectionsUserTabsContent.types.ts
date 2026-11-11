export interface ListItem {
  id: string | number;
  title?: string;
  titleKey?: string;
  subtitleKey?: string;
  screenRoute?: string;
  icon?: string;
  [key: string]: any;
}

export interface Permission {
  [key: string]: boolean | string;
}
export interface YoursConnectionTabPropTypes {
  loading: boolean;
  connectionUserId: number;
  data: any[]
}