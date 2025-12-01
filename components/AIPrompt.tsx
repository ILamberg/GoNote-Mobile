
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../store';
import { generateAIResponse } from '../services/geminiService';
import { Sparkles, ArrowUp, X } from 'lucide-react';

const AIPrompt: React.FC = () => {
    const { state, dispatch } = useApp();
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Toggle with Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                dispatch({ type: 'TOGGLE_AI_PROMPT' });
            }
            if (e.key === 'Escape' && state.isAIPromptOpen) {
                dispatch({ type: 'TOGGLE_AI_PROMPT', payload: false });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state.isAIPromptOpen, dispatch]);

    // Auto-focus when opened
    useEffect(() => {
        if (state.isAIPromptOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [state.isAIPromptOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setResponse(null);

        // Get context from active tab
        const activeTab = state.tabs.find(t => t.id === state.activeTabId);
        const context = activeTab ? activeTab.content : "";
        
        // Prepare mentioned tabs for search context (simplified version of script.js logic)
        // In a full port, we would parse query for @mentions
        const mentionedTabs = state.tabs.map(t => ({
            name: t.name,
            content: t.content
        }));

        const result = await generateAIResponse(query, context, state.settings.aiName, mentionedTabs);
        setResponse(result);
        setIsLoading(false);
    };

    if (!state.settings.aiEnabled) return null;

    if (!state.isAIPromptOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => dispatch({ type: 'TOGGLE_AI_PROMPT', payload: false })}
            />
            
            <div className="relative bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col w-[600px] max-w-[95vw] animate-in zoom-in-95 duration-200">
                <form onSubmit={handleSubmit} className="relative p-3 flex items-center gap-2">
                    <div className="p-2 text-primary">
                        <Sparkles size={20} />
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Ask ${state.settings.aiName} about your notes...`}
                        className="flex-1 bg-transparent border-none outline-none text-text text-base placeholder:text-text-sec h-10"
                        autoFocus
                    />
                    <div className="flex items-center gap-1">
                        <span className="hidden sm:inline-block text-[10px] bg-tab border border-border px-1.5 py-0.5 rounded text-text-sec font-mono">ESC</span>
                        <button 
                            type="submit"
                            disabled={isLoading || !query.trim()}
                            className="p-2 bg-tab hover:bg-hover text-text rounded-lg disabled:opacity-50 transition-colors"
                        >
                            <ArrowUp size={16} />
                        </button>
                    </div>
                </form>

                {isLoading && (
                    <div className="px-4 py-3 border-t border-border">
                        <div className="flex items-center gap-3 text-sm text-text-sec">
                            <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                            Thinking...
                        </div>
                    </div>
                )}

                {response && (
                    <div className="px-4 py-4 border-t border-border bg-tab/30 max-h-[40vh] overflow-y-auto">
                        <div className="prose prose-invert prose-sm max-w-none text-text">
                            <p className="whitespace-pre-wrap leading-relaxed">{response}</p>
                        </div>
                        <div className="mt-3 flex justify-end">
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(response);
                                    dispatch({ type: 'TOGGLE_AI_PROMPT', payload: false });
                                }}
                                className="text-xs text-primary hover:underline cursor-pointer"
                            >
                                Copy & Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIPrompt;
