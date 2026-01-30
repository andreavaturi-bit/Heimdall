
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import CalendarRow from './components/CalendarRow';
import VerticalView from './components/VerticalView';
import CyclicView from './components/CyclicView';
import EventModal from './components/EventModal';
import CategoryModal from './components/CategoryModal';
import { CalendarEvent, CalendarSettings, CategoryConfig, Language, CalendarSystem } from './types';
import { TRANSLATIONS, DEFAULT_CATEGORIES_LOCALIZED, getLocalizedMonths } from './constants';
import { detectChains } from './utils/dateHelpers';
import { googleCalendarService } from './utils/googleCalendarService';
import { dbService } from './utils/dbService';
import { Database, RefreshCw, WifiOff } from 'lucide-react';

const STORAGE_KEYS = {
  SETTINGS: 'heimdall-settings-v1',
  CATEGORIES: 'heimdall-categories-v1',
  EVENTS: 'heimdall-events-v1'
};

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: '🚀 Lancio Progetto X',
    startDate: new Date(2025, 0, 15).toISOString(),
    endDate: new Date(2025, 1, 5).toISOString(),
    categoryId: 'work',
  },
  {
    id: '2',
    title: '🏔️ Weekend sulle Alpi',
    startDate: new Date(2025, 1, 14).toISOString(),
    endDate: new Date(2025, 1, 17).toISOString(),
    categoryId: 'travel',
  }
];

const App: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDbSyncing, setIsDbSyncing] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  
  const [settings, setSettings] = useState<CalendarSettings>(() => {
    const base: CalendarSettings = {
      fadePast: true,
      showBurnoutWarnings: true,
      activeCategoryIds: new Set(),
      viewMode: 'weekday',
      layout: 'horizontal',
      isBirdEyeView: false,
      language: 'it',
      calendarSystem: 'gregorian'
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

  // Caricamento iniziale da Neon DB
  useEffect(() => {
    const loadFromDb = async () => {
      setIsDbSyncing(true);
      try {
        const dbEvents = await dbService.fetchEvents();
        if (dbEvents.length > 0) {
          setEvents(dbEvents);
          setDbConnected(true);
        } else {
          // Se il DB è vuoto ma connesso, consideriamolo comunque connesso
          setDbConnected(true);
        }
      } catch (e) {
        console.error("Errore caricamento DB:", e);
        setDbConnected(false);
      } finally {
        setIsDbSyncing(false);
      }
    };
    loadFromDb();
  }, []);
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    initialData?: Partial<CalendarEvent>;
  }>({
    isOpen: false,
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const t = TRANSLATIONS[settings.language];

  // Persistenza locale e DB
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    const settingsToSave = {
      ...settings,
      activeCategoryIds: Array.from(settings.activeCategoryIds)
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsToSave));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    if (settings.activeCategoryIds.size === 0 && categories.length > 0) {
      setSettings(prev => ({ ...prev, activeCategoryIds: new Set(categories.map(c => c.id)) }));
    }
  }, [categories, settings.activeCategoryIds]);

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

  const handleSaveEvent = useCallback(async (event: CalendarEvent) => {
    setEvents(prev => {
      const index = prev.findIndex(e => e.id === event.id);
      if (index > -1) {
        const next = [...prev];
        next[index] = event;
        return next;
      }
      return [...prev, event];
    });

    // Sincronizzazione Neon DB
    setIsDbSyncing(true);
    try {
      await dbService.saveEvent(event);
      setDbConnected(true);
    } catch (e) {
      console.error("Errore salvataggio DB:", e);
      setDbConnected(false);
    } finally {
      setIsDbSyncing(false);
    }
  }, []);

  const handleDeleteEvent = useCallback(async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    
    // Sincronizzazione Neon DB
    setIsDbSyncing(true);
    try {
      await dbService.deleteEvent(id);
      setDbConnected(true);
    } catch (e) {
      console.error("Errore cancellazione DB:", e);
      setDbConnected(false);
    } finally {
      setIsDbSyncing(false);
    }
  }, []);

  const handleSyncGoogle = useCallback(async () => {
    setIsSyncing(true);
    try {
      const googleEvents = await googleCalendarService.fetchEvents(year);
      
      const existingIds = new Set(events.map(e => e.id));
      const newEvents = googleEvents.filter(ge => !existingIds.has(ge.id));
      
      if (newEvents.length > 0) {
        setEvents(prev => [...prev, ...newEvents]);
        // Salva gli eventi importati anche nel DB
        for (const ne of newEvents) {
          await dbService.saveEvent(ne);
        }
      }

      alert(t.syncSuccess);
    } catch (e) {
      console.error("Google Sync failed", e);
      alert(t.syncError);
    } finally {
      setIsSyncing(false);
    }
  }, [year, events, t]);

  const chains = useMemo(() => detectChains(events), [events]);
  const months = useMemo(() => getLocalizedMonths(settings.language), [settings.language]);

  const renderCalendarContent = () => {
    if (settings.calendarSystem === 'cyclic') {
      return (
        <CyclicView 
          year={year}
          events={events}
          categories={categories}
          settings={settings}
          onSelectDay={handleSelectDay}
          onEditEvent={handleEditEvent}
        />
      );
    }

    if (settings.layout === 'horizontal') {
      return (
        <div className={`
          flex flex-col bg-white shadow-2xl shadow-slate-200/50 border border-slate-200 
          ${settings.isBirdEyeView ? 'mx-4 my-2 rounded-xl' : 'm-6 rounded-2xl'}
          min-w-[calc(100%-3rem)] inline-block
        `}>
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
      );
    }

    return (
      <VerticalView 
        year={year}
        events={events}
        categories={categories}
        settings={settings}
        onSelectDay={handleSelectDay}
        onEditEvent={handleEditEvent}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-100">
      <Header 
        year={year} 
        setYear={setYear} 
        settings={settings} 
        setSettings={setSettings}
        categories={categories}
        onAddEvent={handleAddEvent}
        onManageCategories={() => setIsCategoryModalOpen(true)}
        onSyncGoogle={handleSyncGoogle}
        isSyncing={isSyncing}
      />

      <main className="flex-grow flex flex-col overflow-auto no-scrollbar pb-24">
        <div className="flex flex-col items-start min-w-full">
          {renderCalendarContent()}

          {!settings.isBirdEyeView && (
            <div className="m-6 flex flex-col md:flex-row gap-6 self-stretch">
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

      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 py-3 px-6 flex justify-between items-center z-40">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
            {t.footerText}
          </span>
          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-slate-50 border border-slate-100">
            {isDbSyncing ? (
              <RefreshCw className="w-3 h-3 text-indigo-500 animate-spin" />
            ) : dbConnected ? (
              <Database className="w-3 h-3 text-emerald-500" />
            ) : (
              <WifiOff className="w-3 h-3 text-slate-300" />
            )}
            <span className="text-[9px] font-black uppercase text-slate-500">
              {isDbSyncing ? t.dbSyncing : dbConnected ? t.dbStatus : t.dbOffline}
            </span>
          </div>
        </div>
        
        <button 
          onClick={handleAddEvent}
          className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform lg:hidden"
        >
          <span className="text-2xl">+</span>
        </button>
      </footer>
    </div>
  );
};

export default App;
