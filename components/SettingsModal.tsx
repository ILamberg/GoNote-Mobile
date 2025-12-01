
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { X, Save, Cpu, Palette, Database, Check, Grid, Monitor } from 'lucide-react';
import { THEMES } from '../types';

interface Props {
    onClose: () => void;
}

type Category = 'themes' | 'ai' | 'data';

const SettingsModal: React.FC<Props> = ({ onClose }) => {
    const { state, dispatch } = useApp();
    const { settings } = state;
    
    const [activeCategory, setActiveCategory] = useState<Category>('themes');
    const [aiName, setAiName] = useState(settings.aiName);
    const [apiKey, setApiKey] = useState(localStorage.getItem('userGeminiApiKey') || '');
    
    // Sync local state with store on mount or change
    useEffect(() => {
        setAiName(settings.aiName);
    }, [settings.aiName]);

    const handleSave = () => {
        dispatch({
            type: 'SET_SETTINGS',
            payload: {
                aiName: aiName,
            }
        });
        if (apiKey) {
            localStorage.setItem('userGeminiApiKey', apiKey);
        } else {
            localStorage.removeItem('userGeminiApiKey');
        }
        onClose();
    };

    const handleThemeChange = (themeKey: string) => {
        dispatch({ type: 'SET_SETTINGS', payload: { theme: themeKey } });
    };

    const handleColorChange = (color: string) => {
        dispatch({ type: 'SET_SETTINGS', payload: { primaryColor: color } });
    };

    const renderCategoryButton = (id: Category, label: string, icon: React.ReactNode) => (
        <button 
            onClick={() => setActiveCategory(id)}
            className={`
                flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all 
                whitespace-nowrap flex-shrink-0
                ${activeCategory === id 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
                    : 'text-text-sec hover:bg-hover hover:text-text border border-transparent'}
                md:w-full md:text-left
            `}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4">
            {/* Main Modal Container */}
            <div className="bg-surface border border-border w-full md:max-w-4xl h-[90vh] md:h-[85vh] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Navigation Section */}
                <div className="w-full md:w-64 bg-tab/30 border-b md:border-b-0 md:border-r border-border flex flex-col flex-shrink-0">
                    <div className="p-4 flex items-center justify-between border-b border-border/50 bg-surface/50 md:bg-transparent">
                        <h2 className="text-lg font-bold text-text flex items-center gap-2">
                            <SettingsIcon className="w-5 h-5 text-primary" />
                            Settings
                        </h2>
                        <button onClick={onClose} className="md:hidden p-2 text-text-sec hover:text-text rounded-lg hover:bg-hover transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    {/* Mobile: Horizontal Scroll, Desktop: Vertical List */}
                    <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto p-2 md:p-3 gap-2 md:space-y-1 no-scrollbar bg-surface/20 md:bg-transparent">
                        <div className="hidden md:block text-xs font-semibold text-text-sec px-4 py-2 uppercase tracking-wider opacity-70">General</div>
                        {renderCategoryButton('themes', 'Appearance', <Palette size={18} />)}
                        
                        <div className="hidden md:block text-xs font-semibold text-text-sec px-4 py-2 uppercase tracking-wider opacity-70 mt-4">Features</div>
                        {renderCategoryButton('ai', 'AI Assistant', <Cpu size={18} />)}
                        
                        <div className="hidden md:block text-xs font-semibold text-text-sec px-4 py-2 uppercase tracking-wider opacity-70 mt-4">System</div>
                        {renderCategoryButton('data', 'Data', <Database size={18} />)}
                    </div>
                    
                    <div className="hidden md:block p-4 border-t border-border/50 mt-auto">
                        <div className="text-xs text-text-sec/50 text-center">
                            GoNote React v1.0.0
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-bg/40 h-full overflow-hidden">
                    {/* Desktop Header */}
                    <div className="hidden md:flex h-16 items-center justify-between px-8 border-b border-border/50 bg-surface/30 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                        <h3 className="text-lg font-semibold text-text">
                            {activeCategory === 'themes' && 'Look & Feel'}
                            {activeCategory === 'ai' && 'Intelligence'}
                            {activeCategory === 'data' && 'Data Management'}
                        </h3>
                        <button onClick={onClose} className="p-2 text-text-sec hover:text-text hover:bg-tab rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 custom-scrollbar">
                        
                        {/* THEMES CATEGORY */}
                        {activeCategory === 'themes' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 fade-in pb-20">
                                {/* Accent Color */}
                                <section>
                                    <h4 className="text-sm font-bold text-text-sec uppercase tracking-wider mb-4 flex items-center gap-2">
                                        Accent Color
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        {['#89B4FA', '#4CAF50', '#F38BA8', '#FAB387', '#F9E2AF', '#A6E3A1', '#94E2D5', '#CBA6F7', '#1976D2', '#FF8F00'].map(c => (
                                            <button
                                                key={c}
                                                onClick={() => handleColorChange(c)}
                                                className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 relative flex items-center justify-center ${settings.primaryColor === c ? 'border-white ring-2 ring-primary shadow-lg' : 'border-transparent hover:border-white/30'}`}
                                                style={{ backgroundColor: c }}
                                                title={c}
                                            >
                                                {settings.primaryColor === c && <Check size={16} className="text-white drop-shadow-md" />}
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                {/* Themes Grid */}
                                <section>
                                    <h4 className="text-sm font-bold text-text-sec uppercase tracking-wider mb-4">Color Theme</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {Object.entries(THEMES).map(([key, theme]) => (
                                            <button
                                                key={key}
                                                onClick={() => handleThemeChange(key)}
                                                className={`
                                                    relative group p-4 rounded-xl border text-left transition-all duration-200 overflow-hidden
                                                    ${settings.theme === key 
                                                        ? 'border-primary ring-1 ring-primary/50 bg-primary/5 shadow-lg shadow-primary/5' 
                                                        : 'border-border bg-surface hover:border-primary/30 hover:bg-surface/80'}
                                                `}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-2xl">{theme.icon}</span>
                                                    {settings.theme === key && (
                                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white">
                                                            <Check size={10} strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-semibold text-text">{theme.name}</span>
                                                <div 
                                                    className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                                                    style={{ background: `linear-gradient(to right, ${theme['--bg-color']}, ${settings.primaryColor})` }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                {/* Background Patterns */}
                                <section className="bg-surface/50 border border-border rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h4 className="text-base font-semibold text-text flex items-center gap-2">
                                                <Grid size={18} className="text-primary" />
                                                Grid Pattern
                                            </h4>
                                            <p className="text-xs text-text-sec mt-1">Add a subtle texture to the background</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer p-2 -mr-2">
                                            <input 
                                                type="checkbox" 
                                                checked={settings.gridPatternEnabled}
                                                onChange={(e) => dispatch({ type: 'SET_SETTINGS', payload: { gridPatternEnabled: e.target.checked } })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-tab border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:border-primary relative"></div>
                                        </label>
                                    </div>
                                    
                                    <div className={`grid grid-cols-3 gap-4 transition-all duration-300 ${settings.gridPatternEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none grayscale'}`}>
                                        {(['dots', 'lines', 'squares'] as const).map((style) => (
                                            <button
                                                key={style}
                                                onClick={() => dispatch({ type: 'SET_SETTINGS', payload: { gridPatternStyle: style } })}
                                                className={`
                                                    relative h-20 rounded-lg border transition-all overflow-hidden flex flex-col items-center justify-center gap-2
                                                    ${settings.gridPatternStyle === style 
                                                        ? 'border-primary bg-primary/10 ring-1 ring-primary/30' 
                                                        : 'border-border bg-bg hover:border-text-sec'}
                                                `}
                                            >
                                                {/* CSS Pattern Preview */}
                                                <div className="absolute inset-0 opacity-50" style={{
                                                    backgroundImage: 
                                                        style === 'dots' ? 'radial-gradient(circle, currentColor 1.5px, transparent 1.5px)' :
                                                        style === 'lines' ? 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)' :
                                                        'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
                                                    backgroundSize: style === 'squares' ? '16px 16px' : '20px 20px',
                                                    color: 'var(--text-secondary)'
                                                }}></div>
                                                <span className="relative z-10 text-xs font-medium capitalize text-text-sec group-hover:text-text bg-surface/80 px-2 py-0.5 rounded backdrop-blur-sm">
                                                    {style}
                                                </span>
                                                {settings.gridPatternStyle === style && (
                                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-glow"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* AI CATEGORY */}
                        {activeCategory === 'ai' && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 fade-in max-w-3xl pb-20">
                                <div className="bg-surface border border-border rounded-xl p-6 space-y-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-xl text-primary ring-1 ring-primary/20">
                                                <Cpu size={28} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-text text-lg">Enable AI Assistant</h4>
                                                <p className="text-xs text-text-sec mt-0.5">Powered by Google Gemini</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer p-2 -mr-2">
                                            <input 
                                                type="checkbox" 
                                                checked={settings.aiEnabled}
                                                onChange={(e) => dispatch({ type: 'SET_SETTINGS', payload: { aiEnabled: e.target.checked } })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-tab border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:border-primary relative"></div>
                                        </label>
                                    </div>

                                    <div className={`space-y-5 pt-6 border-t border-border/50 transition-all duration-300 ${settings.aiEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none grayscale-[0.5]'}`}>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-text">Assistant Name</label>
                                                <input 
                                                    type="text" 
                                                    value={aiName}
                                                    onChange={(e) => setAiName(e.target.value)}
                                                    className="w-full bg-bg/50 border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-text-sec/50"
                                                    placeholder="Name your assistant..."
                                                    maxLength={20}
                                                />
                                                <p className="text-[10px] text-text-sec">What should we call your AI companion?</p>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-sm font-medium text-text">Gemini API Key</label>
                                                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-md">
                                                        Get Key <span className="text-[10px]">↗</span>
                                                    </a>
                                                </div>
                                                <div className="relative">
                                                    <input 
                                                        type="password" 
                                                        value={apiKey}
                                                        onChange={(e) => setApiKey(e.target.value)}
                                                        className="w-full bg-bg/50 border border-border rounded-lg pl-4 pr-10 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all font-mono text-sm placeholder:text-text-sec/50"
                                                        placeholder="AIzaSy..."
                                                    />
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success-color" title="Stored locally">
                                                        <Check size={14} />
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-text-sec flex items-center gap-1">
                                                    Key is stored locally in your browser. Never sent to our servers.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-surface border border-border rounded-xl p-6">
                                    <h4 className="font-semibold text-text mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                                        <Monitor size={16} className="text-primary" /> 
                                        What can it do?
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 bg-tab/30 border border-border/50 rounded-xl hover:bg-tab/50 transition-colors">
                                            <div className="text-xs font-bold text-primary mb-1.5">Q&A & KNOWLEDGE</div>
                                            <p className="text-xs text-text-sec leading-relaxed">Ask questions about any topic, get summaries, or explanations directly in your notepad.</p>
                                        </div>
                                        <div className="p-4 bg-tab/30 border border-border/50 rounded-xl hover:bg-tab/50 transition-colors">
                                            <div className="text-xs font-bold text-primary mb-1.5">CONTEXT AWARENESS</div>
                                            <p className="text-xs text-text-sec leading-relaxed">The AI sees your active tab's content. Ask "summarize this" or "fix the grammar in this note".</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-500/90 flex gap-2">
                                        <span>⚠️</span>
                                        <span>Note: For security, the AI cannot perform actions like deleting tabs or modifying groups. It is purely informational.</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* DATA CATEGORY */}
                        {activeCategory === 'data' && (
                            <div className="h-full flex flex-col items-center justify-center py-12 animate-in slide-in-from-right-4 duration-300 fade-in text-center px-4 pb-20">
                                <div className="w-24 h-24 bg-tab/50 rounded-full flex items-center justify-center mb-6 border border-border shadow-inner relative">
                                    <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse"></div>
                                    <Database size={40} className="text-primary opacity-80" />
                                </div>
                                <h3 className="text-2xl font-bold text-text mb-3">Data Management</h3>
                                <p className="text-text-sec text-sm max-w-md mb-8 leading-relaxed">
                                    To import, export, or factory reset your data, please use the options available in the browser extension popup menu.
                                </p>
                                
                                <div className="grid gap-4 w-full max-w-sm">
                                    <div className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl text-left opacity-70">
                                        <div className="p-2 bg-bg rounded-lg text-text-sec"><Save size={18} /></div>
                                        <div>
                                            <div className="text-sm font-medium text-text">Cloud Sync</div>
                                            <div className="text-xs text-text-sec">Available via Profile Menu</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer - Fixed at bottom */}
                    <div className="p-4 border-t border-border bg-surface/95 backdrop-blur-md flex justify-end gap-3 shrink-0 rounded-b-2xl">
                        <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-text hover:bg-tab rounded-xl transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="px-6 py-2.5 text-sm font-medium bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 transform active:scale-95">
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Helper Icon for Settings */}
            <div className="hidden">
                <SettingsIcon />
            </div>
        </div>
    );
};

// Simple icon component to avoid import issues if lucide-react versions mismatch
const SettingsIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export default SettingsModal;
