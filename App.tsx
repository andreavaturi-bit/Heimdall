
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import CalendarRow from './components/CalendarRow';
import VerticalView from './components/VerticalView';
import EventModal from './components/EventModal';
import CategoryModal from './components/CategoryModal';
import { CalendarEvent, CalendarSettings, CategoryConfig, ViewMode, LayoutMode, Language } from './types';
import { TRANSLATIONS, DEFAULT_CATEGORIES_LOCALIZED, getLocalizedMonths } from './constants';
import { detectChains } from './utils/dateHelpers';

const STORAGE_KEYS = {
  SETTINGS: 'heimdall-settings-v1',
  CATEGORIES: 'heimdall-categories-v1',
  EVENTS: 'heimdall-events-v1'
};

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Q1 Vision Sprint',
    startDate: new Date(2025, 0, 15).toISOString(),
    endDate: new Date(2025, 0, 25).toISOString(),
    categoryId: 'work',
  },
  {
    id: '2',
    title: 'Alpine Recovery',
    startDate: new Date(2025, 1, 10).toISOString(),
    endDate: new Date(2025, 1, 17).toISOString(),
    categoryId: 'travel',
  }
];

const App: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  
  const [settings, setSettings] = useState<CalendarSettings>(() => {
    const base: CalendarSettings = {
      fadePast: true,
      showBurnoutWarnings: true,
      activeCategoryIds: new Set(),
      viewMode: 'weekday',
      layout: 'horizontal',
      isBirdEyeView: false,
      language: 'it',
    };
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...base,
          ...parsed,
          activeCategoryIds: new Set(parsed.activeCategoryIds || [])
        };
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    }
    return base;
  });

  const [categories, setCategories] = useState<CategoryConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
    return DEFAULT_CATEGORIES_LOCALIZED[settings.language];
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load events", e);
    }
    return INITIAL_EVENTS;
  });
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    initialData?: Partial<CalendarEvent>;
  }>({
    isOpen: false,
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const t = TRANSLATIONS[settings.language];

  // Save data with error handling
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (e) {
      console.error("Storage limit reached for events", e);
    }
  }, [events]);

  useEffect(() => {
    try {
      const settingsToSave = {
        ...settings,
        activeCategoryIds: Array.from(settings.activeCategoryIds)
      };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsToSave));
    } catch (e) {
      console.error("Failed to save settings", e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error("Failed to save categories", e);
    }
    
    setSettings(prev => {
      if (prev.activeCategoryIds.size === 0 && categories.length > 0) {
        return { ...prev, activeCategoryIds: new Set(categories.map(c => c.id)) };
      }
      return prev;
    });
  }, [categories]);

  const handleAddEvent = useCallback(() => {
    const today = new Date();
    const initialDate = year === today.getFullYear() ? today : new Date(year, 0, 1);
    setModalState({
      isOpen: true,
      initialData: {
        startDate: initialDate.toISOString(),
        endDate: initialDate.toISOString(),
      },
    });
  }, [year]);

  const handleSelectDay = useCallback((date: Date) => {
    setModalState({
      isOpen: true,
      initialData: {
        startDate: date.toISOString(),
        endDate: date.toISOString(),
      },
    });
  }, []);

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setModalState({
      isOpen: true,
      initialData: event,
    });
  }, []);

  const handleSaveEvent = useCallback((event: CalendarEvent) => {
    setEvents(prev => {
      const index = prev.findIndex(e => e.id === event.id);
      if (index > -1) {
        const next = [...prev];
        next[index] = event;
        return next;
      }
      return [...prev, event];
    });
  }, []);

  const handleDeleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const chains = useMemo(() => detectChains(events), [events]);
  const months = useMemo(() => getLocalizedMonths(settings.language), [settings.language]);

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-100 ${settings.isBirdEyeView ? 'h-screen' : ''}`}>
      <Header 
        year={year} 
        setYear={setYear} 
        settings={settings} 
        setSettings={setSettings}
        categories={categories}
        onAddEvent={handleAddEvent}
        onManageCategories={() => setIsCategoryModalOpen(true)}
      />

      <main className={`flex-grow no-scrollbar ${settings.isBirdEyeView ? 'overflow-y-auto flex flex-col' : 'overflow-x-auto overflow-y-auto pb-20'}`}>
        <div className={`${settings.isBirdEyeView ? 'min-h-fit flex flex-col p-2' : 'inline-block min-w-full'}`}>
          {settings.layout === 'horizontal' ? (
            <div className={`flex flex-col bg-white shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden border border-slate-200 ${settings.isBirdEyeView ? 'flex-1' : 'm-6'}`}>
              {months.map((_, i) => (
                <CalendarRow 
                  key={`${year}-${i}`}
                  year={year}
                  monthIndex={i}
                  events={events}
                  categories={categories}
                  settings={settings}
                  onSelectDay={handleSelectDay}
                  onEditEvent={handleEditEvent}
                />
              ))}
            </div>
          ) : (
            <VerticalView 
              year={year}
              events={events}
              categories={categories}
              settings={settings}
              onSelectDay={handleSelectDay}
              onEditEvent={handleEditEvent}
            />
          )}

          {!settings.isBirdEyeView && (
            <div className="m-6 flex flex-col md:flex-row gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 flex-grow shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-4 bg-indigo-500 rounded-full" />
                  {t.planningPhilosophyTitle}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  {t.planningPhilosophyText}
                </p>
              </div>

              {chains.length > 0 && settings.showBurnoutWarnings && (
                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex-grow shadow-sm">
                  <h4 className="text-sm font-bold text-orange-800 mb-4 flex items-center gap-2">
                    <span className="w-2 h-4 bg-orange-500 rounded-full" />
                    {t.burnoutAlertTitle}
                  </h4>
                  <p className="text-xs text-orange-600 leading-relaxed">
                    {t.burnoutAlertText(chains.length)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <EventModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false })}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialEvent={modalState.initialData}
        categories={categories}
        language={settings.language}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSave={setCategories}
        language={settings.language}
      />

      {!settings.isBirdEyeView && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 py-3 px-6 flex justify-between items-center z-40 lg:hidden">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.footerText}</span>
          <button 
            onClick={handleAddEvent}
            aria-label={t.addJourney}
            className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-90 transition-transform"
          >
            <span className="text-2xl" aria-hidden="true">+</span>
          </button>
        </footer>
      )}
    </div>
  );
};

export default App;
