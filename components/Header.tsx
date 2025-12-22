
import React from 'react';
import { ChevronLeft, ChevronRight, Hourglass, Tags, Maximize2, Minimize2, CalendarRange, LayoutList, Columns, Rows, Globe, Eye } from 'lucide-react';
import { CalendarSettings, CategoryConfig, Language } from '../types';
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

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* App Branding */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-100">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight hidden sm:block whitespace-nowrap uppercase italic">{t.appTitle}</h1>
          </div>

          {/* Year Selector */}
          <div className="flex items-center bg-slate-100 rounded-full p-0.5 border border-slate-200/50 flex-shrink-0">
            <button 
              onClick={() => setYear(year - 1)}
              className="p-1 hover:bg-white rounded-full transition-all text-slate-600 hover:text-indigo-600 shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 font-bold text-slate-800 text-sm tabular-nums">{year}</span>
            <button 
              onClick={() => setYear(year + 1)}
              className="p-1 hover:bg-white rounded-full transition-all text-slate-600 hover:text-indigo-600 shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Categories - Scrollable - Now on top row */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 border-l border-slate-200 ml-2">
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
            <button
              onClick={onManageCategories}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all border border-dashed border-slate-200 flex-shrink-0"
              title={t.manageCategories}
            >
              <Tags size={16} />
            </button>
          </div>
        </div>

        {/* Global Controls & Add Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:text-indigo-600 transition-all flex items-center gap-1.5 border border-slate-200"
            title="Switch Language / Cambia Lingua"
          >
            <Globe size={18} />
            <span className="text-[10px] font-black uppercase">{settings.language}</span>
          </button>

          <button
            onClick={toggleBirdEye}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${settings.isBirdEyeView ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            title={t.birdEye}
          >
            {settings.isBirdEyeView ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          
          <button
            onClick={toggleLayout}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${settings.layout === 'vertical' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
            title={t.layout}
          >
            {settings.layout === 'horizontal' ? <Rows size={18} /> : <Columns size={18} />}
          </button>

          <button
            onClick={toggleViewMode}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${settings.viewMode === 'numeric' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
            title={t.viewMode}
          >
            {settings.viewMode === 'weekday' ? <CalendarRange size={18} /> : <LayoutList size={18} />}
          </button>
          
          <button
            onClick={toggleFadePast}
            className={`p-2 rounded-lg transition-colors ${settings.fadePast ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
            title={t.fadePast}
          >
            <Hourglass size={18} />
          </button>

          <button
            onClick={onAddEvent}
            className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-indigo-200 active:scale-95 whitespace-nowrap"
          >
            {t.addJourney}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
