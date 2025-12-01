
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../store';

const Notepad: React.FC = () => {
    const { state, dispatch } = useApp();
    const { activeTabId, tabs } = state;
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    // Local state for the textarea value to ensure responsiveness
    const [localContent, setLocalContent] = useState('');

    const activeTab = tabs.find(t => t.id === activeTabId);

    // Sync local state when active tab changes
    useEffect(() => {
        if (activeTab) {
            setLocalContent(activeTab.content || '');
            // Restore scroll position
            if (textareaRef.current && activeTab.scrollPosition) {
                requestAnimationFrame(() => {
                    if (textareaRef.current) textareaRef.current.scrollTop = activeTab.scrollPosition || 0;
                });
            }
        } else {
            setLocalContent('');
        }
    }, [activeTabId, activeTab]); // Dependencies ensure update on switch

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setLocalContent(newValue);
        
        if (activeTabId) {
            dispatch({
                type: 'UPDATE_TAB',
                payload: {
                    id: activeTabId,
                    updates: { 
                        content: newValue,
                        scrollPosition: e.target.scrollTop
                    }
                }
            });
        }
    };

    // Calculate stats
    const words = localContent.trim() ? localContent.trim().split(/\s+/).length : 0;
    const chars = localContent.length;
    const lines = localContent.split('\n').length;

    if (!activeTabId && tabs.length > 0) {
        return <div className="flex-1 flex items-center justify-center text-text-sec">Select a tab to start editing</div>;
    }

    if (tabs.length === 0) {
        return <div className="flex-1 flex items-center justify-center text-text-sec">Create a tab to get started</div>;
    }

    return (
        <div className="flex-1 relative p-4 overflow-hidden flex flex-col bg-transparent">
            <textarea
                ref={textareaRef}
                value={localContent}
                onChange={handleChange}
                onScroll={(e) => {
                    // Optional: Debounced scroll save could go here
                }}
                className="w-full h-full resize-none bg-transparent border-none outline-none text-base leading-relaxed text-text transition-all custom-scrollbar"
                placeholder="Start typing..."
                spellCheck={false}
            />
            
            <div className="absolute bottom-6 right-8 bg-tab/90 backdrop-blur-sm border border-border px-3 py-1.5 rounded-lg text-xs text-text-sec shadow-sm pointer-events-none select-none">
                Words: {words}, Chars: {chars}, Lines: {lines}
            </div>
        </div>
    );
};

export default Notepad;
