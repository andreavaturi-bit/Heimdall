
export interface CategoryConfig {
  id: string;
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  categoryId: string;
  notes?: string;
  color?: string;
}

export type ViewMode = 'weekday' | 'numeric';
export type LayoutMode = 'horizontal' | 'vertical';
export type Language = 'en' | 'it';

export interface CalendarSettings {
  fadePast: boolean;
  showBurnoutWarnings: boolean;
  activeCategoryIds: Set<string>;
  viewMode: ViewMode;
  layout: LayoutMode;
  isBirdEyeView: boolean;
  language: Language;
}
