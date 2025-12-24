
import { CategoryConfig, Language } from './types';

export const TRANSLATIONS = {
  en: {
    appTitle: "HEIMDALL",
    addJourney: "+ New Event",
    manageCategories: "Manage Categories",
    birdEye: "Bird-Eye",
    viewMode: "View Mode",
    layout: "Layout",
    fadePast: "Fade Past",
    burnout: "Burnout Detection",
    firstHalf: "FIRST HALF",
    secondHalf: "SECOND HALF",
    calendarSystem: "Calendar System",
    systemGregorian: "Gregorian",
    systemCyclic: "Cyclic",
    quarter: "Quarter",
    cycle: "Cycle",
    resetWeek: "Reset Week",
    prepWeek: "Prep Week (Week 0)",
    checkIn: "Check-in Point",
    planningPhilosophyTitle: "Vision Philosophy",
    planningPhilosophyText: '"Heimdall sees across the nine realms of your year. This is not just a calendar, but a panoramic view of your existence. Observe the patterns, the stillness, and the storms."',
    burnoutAlertTitle: "Omniscience Alert",
    burnoutAlertText: (count: number) => `I have detected ${count} overlapping destiny-lines lasting over 14 days. Even the guardian of the Bifrost needs rest. Consider recovery periods.`,
    footerText: "Heimdall v1.2",
    modalEdit: "Edit Event",
    modalAdd: "Map New Event",
    modalTitle: "Title",
    modalStart: "Start Date",
    modalEnd: "End Date",
    modalCategory: "Category",
    modalNotes: "Notes",
    modalCancel: "Cancel",
    modalSave: "Save",
    modalDelete: "Delete",
    catModalTitle: "Manage Categories",
    catModalCreate: "Create New Category",
    catModalPlaceholder: "Category name...",
    catModalExisting: "Existing Categories",
    catModalNone: "No categories defined. Add one above.",
    catModalDone: "Done",
    cont: "Cont.",
    placeholderTitle: "Summer Vacation, Project X Launch...",
    placeholderNotes: "Optional description or coordinates...",
  },
  it: {
    appTitle: "HEIMDALL",
    addJourney: "+ Nuovo Evento",
    manageCategories: "Gestisci Categorie",
    birdEye: "Panoramica",
    viewMode: "Modalità Vista",
    layout: "Layout",
    fadePast: "Sfumato Passato",
    burnout: "Rilevamento Stress",
    firstHalf: "PRIMO SEMESTRE",
    secondHalf: "SECONDO SEMESTRE",
    calendarSystem: "Sistema Calendario",
    systemGregorian: "Gregoriano",
    systemCyclic: "Ciclico",
    quarter: "Trimestre",
    cycle: "Ciclo",
    resetWeek: "Reset Week",
    prepWeek: "Prep Week (Settimana 0)",
    checkIn: "Punto di Controllo",
    planningPhilosophyTitle: "Filosofia della Visione",
    planningPhilosophyText: '"Heimdall vede attraverso i nove regni del tuo anno. Questa non è solo un\'agenda, ma una vista panoramica della tua esistenza. Osserva gli schemi, la quiete e le tempeste."',
    burnoutAlertTitle: "Allerta Onniscienza",
    burnoutAlertText: (count: number) => `Ho rilevato ${count} linee del destino sovrapposte per oltre 14 giorni. Anche il guardiano del Bifrost ha bisogno di riposo. Considera periodi di recupero.`,
    footerText: "Heimdall v1.2",
    modalEdit: "Modifica Evento",
    modalAdd: "Mappa Nuovo Evento",
    modalTitle: "Titolo",
    modalStart: "Data Inizio",
    modalEnd: "Data Fine",
    modalCategory: "Categoria",
    modalNotes: "Note",
    modalCancel: "Annulla",
    modalSave: "Salva",
    modalDelete: "Elimina",
    catModalTitle: "Gestisci Categorie",
    catModalCreate: "Crea Nuova Categoria",
    catModalPlaceholder: "Nome categoria...",
    catModalExisting: "Categorie Esistenti",
    catModalNone: "Nessuna categoria definita. Aggiungine una sopra.",
    catModalDone: "Fatto",
    cont: "Cont.",
    placeholderTitle: "Vacanze estive, Lancio Progetto X...",
    placeholderNotes: "Descrizione opzionale o coordinate...",
  }
};

export const DEFAULT_CATEGORIES_LOCALIZED: Record<Language, CategoryConfig[]> = {
  en: [
    { id: 'work', label: 'Work & Projects', color: '#ef4444', bgClass: 'bg-red-500', textClass: 'text-red-500' },
    { id: 'travel', label: 'Travel', color: '#3b82f6', bgClass: 'bg-blue-500', textClass: 'text-blue-500' },
    { id: 'personal', label: 'Personal', color: '#eab308', bgClass: 'bg-yellow-500', textClass: 'text-yellow-500' },
    { id: 'rest', label: 'Rest & Recovery', color: '#64748b', bgClass: 'bg-slate-500', textClass: 'text-slate-500' },
    { id: 'milestone', label: 'Milestones', color: '#a855f7', bgClass: 'bg-purple-500', textClass: 'text-purple-500' },
    { id: 'other', label: 'Other', color: '#10b981', bgClass: 'bg-emerald-500', textClass: 'text-emerald-500' },
  ],
  it: [
    { id: 'work', label: 'Lavoro & Progetti', color: '#ef4444', bgClass: 'bg-red-500', textClass: 'text-red-500' },
    { id: 'travel', label: 'Viaggi', color: '#3b82f6', bgClass: 'bg-blue-500', textClass: 'text-blue-500' },
    { id: 'personal', label: 'Personale', color: '#eab308', bgClass: 'bg-yellow-500', textClass: 'text-yellow-500' },
    { id: 'rest', label: 'Riposo & Recupero', color: '#64748b', bgClass: 'bg-slate-500', textClass: 'text-slate-500' },
    { id: 'milestone', label: 'Traguardi', color: '#a855f7', bgClass: 'bg-purple-500', textClass: 'text-purple-500' },
    { id: 'other', label: 'Altro', color: '#10b981', bgClass: 'bg-emerald-500', textClass: 'text-emerald-500' },
  ]
};

export const AVAILABLE_COLORS = [
  { name: 'Red', bg: 'bg-red-500', text: 'text-red-500', hex: '#ef4444' },
  { name: 'Blue', bg: 'bg-blue-500', text: 'text-blue-500', hex: '#3b82f6' },
  { name: 'Yellow', bg: 'bg-yellow-500', text: 'text-yellow-500', hex: '#eab308' },
  { name: 'Slate', bg: 'bg-slate-500', text: 'text-slate-500', hex: '#64748b' },
  { name: 'Purple', bg: 'bg-purple-500', text: 'text-purple-500', hex: '#a855f7' },
  { name: 'Emerald', bg: 'bg-emerald-500', text: 'text-emerald-500', hex: '#10b981' },
  { name: 'Orange', bg: 'bg-orange-500', text: 'text-orange-500', hex: '#f97316' },
  { name: 'Pink', bg: 'bg-pink-500', text: 'text-pink-500', hex: '#ec4899' },
  { name: 'Indigo', bg: 'bg-indigo-500', text: 'text-indigo-500', hex: '#6366f1' },
  { name: 'Cyan', bg: 'bg-cyan-500', text: 'text-cyan-500', hex: '#06b6d4' },
];

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

export const getLocalizedMonths = (lang: Language) => lang === 'it' ? MONTHS_IT : MONTHS_EN;
