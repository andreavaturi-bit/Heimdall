
import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, Type, Tag, AlignLeft } from 'lucide-react';
import { CalendarEvent, CategoryConfig, Language } from '../types';
import { format, parseISO } from 'date-fns';
import { TRANSLATIONS } from '../constants';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (id: string) => void;
  initialEvent?: Partial<CalendarEvent>;
  categories: CategoryConfig[];
  language: Language;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, onDelete, initialEvent, categories, language }) => {
  const t = TRANSLATIONS[language];
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    categoryId: '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: initialEvent?.id,
        title: initialEvent?.title || '',
        categoryId: initialEvent?.categoryId || categories[0]?.id || '',
        startDate: initialEvent?.startDate ? format(parseISO(initialEvent.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        endDate: initialEvent?.endDate ? format(parseISO(initialEvent.endDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        notes: initialEvent?.notes || '',
      });
    }
  }, [initialEvent, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate || !formData.endDate || !formData.categoryId) return;
    
    onSave({
      id: formData.id || Math.random().toString(36).substr(2, 9),
      title: formData.title!,
      categoryId: formData.categoryId!,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      notes: formData.notes,
    });
    onClose();
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    const updates: Partial<CalendarEvent> = { startDate: newStart };
    if (formData.endDate && newStart > formData.endDate) {
      updates.endDate = newStart;
    }
    setFormData({ ...formData, ...updates });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            {formData.id ? t.modalEdit : t.modalAdd}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Type size={14} /> {t.modalTitle}
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder={t.placeholderTitle}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Calendar size={14} /> {t.modalStart}
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={handleStartDateChange}
                className="w-full px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Calendar size={14} /> {t.modalEnd}
              </label>
              <input
                type="date"
                required
                min={formData.startDate}
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Tag size={14} /> {t.modalCategory}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, categoryId: cat.id })}
                  className={`px-2 py-2 rounded-lg text-[10px] font-bold border transition-all truncate text-left flex items-center gap-2 ${
                    formData.categoryId === cat.id
                      ? `${cat.bgClass} text-white border-transparent shadow-md`
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                   <div className={`w-2 h-2 rounded-full ${formData.categoryId === cat.id ? 'bg-white' : cat.bgClass}`} />
                   {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <AlignLeft size={14} /> {t.modalNotes}
            </label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[80px] text-sm"
              placeholder={t.placeholderNotes}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {formData.id && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(formData.id!);
                  onClose();
                }}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} /> {t.modalDelete}
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-slate-500 font-semibold text-sm hover:text-slate-800"
              >
                {t.modalCancel}
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg shadow-lg shadow-indigo-200 transition-all active:scale-95"
              >
                {t.modalSave}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
