
import React from 'react';
import { ChevronLeft, ChevronRight, Hourglass, Tags, Maximize2, Minimize2, CalendarRange, LayoutList, Columns, Rows, Globe, Eye, RefreshCcw, Plus } from 'lucide-react';
import { CalendarSettings, CategoryConfig, Language, CalendarSystem } from '../types';
import { TRANSLATIONS } from '../constants';

interface HeaderProps {
  year: number;
  setYear: (y: number) => void;
  settings: CalendarSettings;
  setSettings: (s: CalendarSettings) => void;
  categories: CategoryConfig[];
  onAddEvent: () => void;
  onManageCategories: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  year, setYear, settings, setSettings, categories, onAddEvent, onManageCategories 
}) => {
  const t = TRANSLATIONS[settings.language];

  const toggleCategory = (catId: string) => {
    const newActive = new Set(settings.activeCategoryIds);
    if (newActive.has(catId)) {
      newActive.delete(catId);
    } else {
      newActive.add(catId);
    }
    setSettings({ ...settings, activeCategoryIds: newActive });
  };

  const toggleViewMode = () => {
    setSettings({
      ...settings,
      viewMode: settings.viewMode === 'weekday' ? 'numeric' : 'weekday'
    });
  };

  const toggleLayout = () => {
    setSettings({
      ...settings,
      layout: settings.layout === 'horizontal' ? 'vertical' : 'horizontal'
    });
  };

  const toggleBirdEye = () => {
    setSettings({
      ...settings,
      isBirdEyeView: !settings.isBirdEyeView
    });
  };

  const toggleFadePast = () => {
    setSettings({
      ...settings,
      fadePast: !settings.fadePast
    });
  };

  const toggleLanguage = () => {
    const newLang: Language = settings.language === 'en' ? 'it' : 'en';
    setSettings({ ...settings, language: newLang });
  };

  const toggleCalendarSystem = () => {
    const newSystem: CalendarSystem = settings.calendarSystem === 'gregorian' ? 'cyclic' : 'gregorian';
    setSettings({ ...settings, calendarSystem: newSystem });
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm flex flex-col">
      {/* Top Row: Branding, Year, Primary Actions */}
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-100 flex-shrink-0">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight hidden xs:block uppercase italic leading-none">
            {t.appTitle}
          </h1>

          <div className="flex items-center bg-slate-100 rounded-full p-0.5 border border-slate-200 flex-shrink-0 ml-1">
            <button 
              onClick={() => setYear(year - 1)}
              className="p-1.5 hover:bg-white rounded-full transition-all text-slate-600 hover:text-indigo-600 shadow-sm sm:p-1"
              aria-label="Previous Year"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-bold text-slate-800 text-sm tabular-nums min-w-[2.5rem] text-center">{year}</span>
            <button 
              onClick={() => setYear(year + 1)}
              className="p-1.5 hover:bg-white rounded-full transition-all text-slate-600 hover:text-indigo-600 shadow-sm sm:p-1"
              aria-label="Next Year"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile-only Add Button (Icon) */}
          <button
            onClick={onAddEvent}
            className="sm:hidden bg-indigo-600 text-white p-2.5 rounded-full shadow-lg hover:bg-indigo-700 transition-all active:scale-90"
            aria-label={t.addJourney}
          >
            <Plus size={20} />
          </button>
          
          {/* Desktop-only Add Button (Text) */}
          <button
            onClick={onAddEvent}
            className="hidden sm:block bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-indigo-200 active:scale-95 whitespace-nowrap"
          >
            {t.addJourney}
          </button>
        </div>
      </div>

      {/* Middle Row: Categories Scrollable */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-4 md:px-6 border-t border-slate-50">
        <button
          onClick={onManageCategories}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all border border-dashed border-slate-200 flex-shrink-0"
          title={t.manageCategories}
        >
          <Tags size={16} />
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border whitespace-nowrap ${
              settings.activeCategoryIds.has(cat.id)
                ? `${cat.bgClass} text-white border-transparent shadow-md scale-105`
                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Bottom Row: Utility Toggles (Scrollable on Mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-4 md:px-6 bg-slate-50/50 border-t border-slate-100">
        <div className="flex items-center gap-2 pr-4">
          <button
            onClick={toggleCalendarSystem}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 border flex-shrink-0 ${settings.calendarSystem === 'cyclic' ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600'}`}
            title={t.calendarSystem}
          >
            <RefreshCcw size={18} className={settings.calendarSystem === 'cyclic' ? 'animate-[spin_10s_linear_infinite]' : ''} />
            <span className="text-[10px] font-black uppercase whitespace-nowrap">
              {settings.calendarSystem === 'gregorian' ? t.systemGregorian : t.systemCyclic}
            </span>
          </button>

          <div className="h-6 w-px bg-slate-200 flex-shrink-0" />

          <button
            onClick={toggleLanguage}
            className="p-2 rounded-lg bg-white text-slate-500 hover:text-indigo-600 transition-all flex items-center gap-1.5 border border-slate-200 flex-shrink-0"
            title="Switch Language"
          >
            <Globe size={18} />
            <span className="text-[10px] font-black uppercase">{settings.language}</span>
          </button>

          <button
            onClick={toggleBirdEye}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0 ${settings.isBirdEyeView ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
            title={t.birdEye}
          >
            {settings.isBirdEyeView ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          
          <button
            onClick={toggleLayout}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0 ${settings.layout === 'vertical' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
            title={t.layout}
          >
            {settings.layout === 'horizontal' ? <Rows size={18} /> : <Columns size={18} />}
          </button>

          <button
            onClick={toggleViewMode}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0 ${settings.viewMode === 'numeric' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
            title={t.viewMode}
          >
            {settings.viewMode === 'weekday' ? <CalendarRange size={18} /> : <LayoutList size={18} />}
          </button>
          
          <button
            onClick={toggleFadePast}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${settings.fadePast ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
            title={t.fadePast}
          >
            <Hourglass size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
