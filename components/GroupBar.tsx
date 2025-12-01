
import React from 'react';
import { useApp } from '../store';
import { ClipboardList } from 'lucide-react';

const GroupBar: React.FC = () => {
    const { state, dispatch } = useApp();
    const { groups, activeGroupFilters, secretTabVisible } = state;

    const visibleGroups = groups.filter(g => {
        if (g.name === 'Recipe' && !secretTabVisible) return false;
        return true;
    });

    const allTabsCount = state.tabs.length;

    return (
        <div className="flex items-center gap-2 p-2 bg-surface border-b border-border overflow-x-auto no-scrollbar">
            <button 
                onClick={() => dispatch({ type: 'TOGGLE_GROUP_FILTER', payload: 'ALL_RESET' })} 
                className={`
                    px-3 py-1.5 rounded-full border flex items-center gap-2 text-xs font-medium transition-all flex-shrink-0 select-none
                    ${activeGroupFilters.length === 0 ? 'bg-primary text-white border-primary shadow-sm ring-2 ring-primary/20' : 'bg-tab text-text border-border hover:bg-hover'}
                `}
            >
                <ClipboardList size={14} />
                All Tabs
                <span className="bg-black/30 px-1.5 py-0.5 rounded-full text-[10px] min-w-[18px] text-center font-bold">{allTabsCount}</span>
            </button>

            {visibleGroups.map(group => {
                const isActive = activeGroupFilters.includes(group.id);
                const isRecipe = group.name === 'Recipe';
                const count = state.tabs.filter(t => t.groupId === group.id).length;
                
                return (
                    <button
                        key={group.id}
                        onClick={() => dispatch({ type: 'TOGGLE_GROUP_FILTER', payload: group.id })}
                        className={`
                            px-3 py-1.5 rounded-full border flex items-center gap-2 text-xs font-medium transition-all flex-shrink-0 select-none
                            ${isActive ? 'bg-primary text-white border-primary shadow-sm ring-2 ring-primary/20' : 'bg-tab text-text border-border hover:bg-hover'}
                            ${isRecipe ? 'secret-glow border-yellow-500/50 text-yellow-200' : ''}
                        `}
                    >
                        <span className="text-sm">{group.icon}</span> 
                        {group.name}
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] min-w-[18px] text-center font-bold ${isActive ? 'bg-black/30' : 'bg-surface/50'}`}>{count}</span>
                    </button>
                );
            })}
            
            {groups.length === 0 && (
                <span className="text-[10px] text-text-sec px-2 italic opacity-50">No groups created</span>
            )}
        </div>
    );
};

export default GroupBar;
