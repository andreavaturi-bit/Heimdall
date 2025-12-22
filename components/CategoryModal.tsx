
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2 } from 'lucide-react';
import { CategoryConfig, Language } from '../types';
import { AVAILABLE_COLORS, TRANSLATIONS } from '../constants';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryConfig[];
  onSave: (categories: CategoryConfig[]) => void;
  language: Language;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, categories, onSave, language }) => {
  const t = TRANSLATIONS[language];
  const [localCategories, setLocalCategories] = useState<CategoryConfig[]>(categories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Sync local state with props when modal opens or categories change
  useEffect(() => {
    if (isOpen) {
      setLocalCategories(categories);
      setEditingId(null);
      setNewLabel('');
    }
  }, [isOpen, categories]);

  if (!isOpen) return null;

  const handleAdd = () => {
    const trimmedLabel = newLabel.trim();
    if (!trimmedLabel) return;
    
    const color = AVAILABLE_COLORS[selectedColorIndex];
    const newCat: CategoryConfig = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      label: trimmedLabel,
      color: color.hex,
      bgClass: color.bg,
      textClass: color.text,
    };
    
    const updated = [...localCategories, newCat];
    setLocalCategories(updated);
    setNewLabel('');
    onSave(updated);
  };

  const handleDelete = (id: string) => {
    const updated = localCategories.filter(c => c.id !== id);
    setLocalCategories(updated);
    onSave(updated);
  };

  const handleUpdateLabel = (id: string, label: string) => {
    const trimmed = label.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    const updated = localCategories.map(c => c.id === id ? { ...c, label: trimmed } : c);
    setLocalCategories(updated);
    onSave(updated);
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">{t.catModalTitle}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
          {/* Create Section */}
          <div className="space-y-3 p-4 bg-indigo-50/40 rounded-xl border border-indigo-100">
            <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{t.catModalCreate}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                placeholder={t.catModalPlaceholder}
                className="flex-grow px-3 py-2 text-sm bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
              />
              <button
                type="button"
                onClick={handleAdd}
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-95 flex items-center justify-center"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {AVAILABLE_COLORS.map((color, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedColorIndex(idx)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedColorIndex === idx ? 'border-indigo-600 scale-125' : 'border-transparent'
                  } ${color.bg}`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* List Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.catModalExisting}</label>
            <div className="space-y-2">
              {localCategories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-all shadow-sm group">
                  <div className="flex items-center gap-3 flex-grow min-w-0">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${cat.bgClass}`} />
                    {editingId === cat.id ? (
                      <input
                        autoFocus
                        type="text"
                        defaultValue={cat.label}
                        onBlur={(e) => handleUpdateLabel(cat.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdateLabel(cat.id, e.currentTarget.value);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="text-sm font-medium text-slate-800 bg-white border border-indigo-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 flex-grow"
                      />
                    ) : (
                      <span className="text-sm font-medium text-slate-800 truncate">{cat.label}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setEditingId(cat.id)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {localCategories.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs italic border border-dashed border-slate-200 rounded-xl">
                  {t.catModalNone}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
          >
            {t.catModalDone}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
