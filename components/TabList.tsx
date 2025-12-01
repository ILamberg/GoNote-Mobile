
import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../store';
import { Tab } from '../types';
import { Plus, X, Edit2 } from 'lucide-react';

const TabList: React.FC = () => {
    const { state, dispatch } = useApp();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const activeTabRef = useRef<HTMLDivElement>(null);

    const { tabs, activeTabId, activeGroupFilters } = state;

    const visibleTabs = tabs.filter(tab => {
        if (activeGroupFilters.length > 0 && (!tab.groupId || !activeGroupFilters.includes(tab.groupId))) {
            return false;
        }
        return true;
    });

    // Enhanced Auto-Scroll Logic
    useEffect(() => {
        // Use a timeout to ensure the DOM has updated
        const timeoutId = setTimeout(() => {
            if (activeTabRef.current && scrollContainerRef.current) {
                const container = scrollContainerRef.current;
                const element = activeTabRef.current;
                
                // Calculate centered position
                const elementLeft = element.offsetLeft;
                const elementWidth = element.clientWidth;
                const containerWidth = container.clientWidth;
                
                // Target scroll position to center the element
                const targetScrollLeft = elementLeft - (containerWidth / 2) + (elementWidth / 2);
                
                container.scrollTo({
                    left: targetScrollLeft,
                    behavior: 'smooth'
                });
            }
        }, 100); // Small delay to account for layout shifts

        return () => clearTimeout(timeoutId);
    }, [activeTabId, visibleTabs.length]); // Trigger on active tab change or tab list size change

    const handleWheel = (e: React.WheelEvent) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft += e.deltaY;
        }
    };

    const handleAddTab = () => {
        const newTab: Tab = {
            id: 'tab-' + Date.now(),
            name: 'Untitled',
            content: '',
            color: '#333333',
            groupId: activeGroupFilters.length === 1 ? activeGroupFilters[0] : undefined,
            createdAt: Date.now()
        };
        dispatch({ type: 'ADD_TAB', payload: newTab });
        // Auto-scrolling logic in useEffect handles centering the new tab
    };

    return (
        <div className="flex items-center w-full h-12 bg-bg/50 px-2 gap-2 flex-shrink-0 border-b border-border backdrop-blur-sm">
            <div 
                ref={scrollContainerRef}
                className="flex-1 flex items-end gap-1 overflow-x-auto no-scrollbar scroll-smooth h-full"
                onWheel={handleWheel}
            >
                {visibleTabs.map(tab => (
                    <TabItem 
                        key={tab.id} 
                        tab={tab} 
                        isActive={tab.id === activeTabId}
                        ref={tab.id === activeTabId ? activeTabRef : null} 
                    />
                ))}
                {/* Spacer to ensure last tab isn't hidden by add button overflow if tight */}
                <div className="w-1 flex-shrink-0"></div>
            </div>
            <button 
                onClick={handleAddTab}
                className="p-2 rounded-lg bg-surface hover:bg-tab text-text border border-border hover:border-primary/50 transition-all flex-shrink-0 mb-1 shadow-sm"
                title="New Tab"
            >
                <Plus size={18} />
            </button>
        </div>
    );
};

const TabItem = React.forwardRef<HTMLDivElement, { tab: Tab, isActive: boolean }>(({ tab, isActive }, ref) => {
    const { dispatch, state } = useApp();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const group = tab.groupId ? state.groups.find(g => g.id === tab.groupId) : null;
    const isRecipe = group?.name === 'Recipe';

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleRename = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setIsEditing(false);
            if (inputRef.current) {
                dispatch({ 
                    type: 'UPDATE_TAB', 
                    payload: { id: tab.id, updates: { name: inputRef.current.value || 'Untitled' } } 
                });
            }
        }
    };

    const handleTouchStart = () => {
        longPressTimer.current = setTimeout(() => {
            setIsEditing(true);
        }, 800);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    return (
        <div 
            ref={ref}
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.id })}
            onDoubleClick={() => setIsEditing(true)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={`
                group relative flex items-center gap-2 px-4 py-2.5 rounded-t-lg border-t border-x min-w-[120px] max-w-[200px] cursor-pointer transition-all select-none h-[90%] mt-auto
                ${isActive 
                    ? 'z-10 border-border border-b-0' 
                    : 'z-0 opacity-70 hover:opacity-100 border-transparent hover:bg-surface/50'}
                ${isRecipe ? 'border-yellow-500/50 shadow-[0_0_10px_rgba(255,215,0,0.1)]' : ''}
            `}
            style={{ 
                backgroundColor: isActive ? (tab.color !== '#333333' ? tab.color : 'var(--tab-color)') : 'transparent',
                borderBottom: isActive ? `3px solid var(--primary-color)` : '1px solid transparent',
                color: isActive ? '#fff' : 'var(--text-color)'
            }}
        >
            {group && (
                <div 
                    className="w-2 h-2 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: group.color }}
                    title={group.name}
                />
            )}

            {isEditing ? (
                <input 
                    ref={inputRef}
                    defaultValue={tab.name}
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={handleRename}
                    className="bg-bg/50 border border-primary/50 rounded px-1 py-0.5 text-xs w-full text-white focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <span className="truncate text-sm font-medium flex-1">
                    {tab.name}
                </span>
            )}

            {isActive && !isEditing && (
                <div className="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                        }}
                        className="md:hidden text-text hover:text-primary transition-colors"
                    >
                        <Edit2 size={10} />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: 'DELETE_TAB', payload: tab.id });
                        }}
                        className="hover:text-red-400 transition-colors p-0.5 rounded hover:bg-black/20"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}
        </div>
    );
});

export default TabList;
