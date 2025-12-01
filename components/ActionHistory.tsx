import React from 'react';
import { useApp } from '../store';
import { X, Clock, Trash2 } from 'lucide-react';

const ActionHistory: React.FC = () => {
    const { state, dispatch } = useApp();
    const { history, isHistoryOpen } = state;

    if (!isHistoryOpen) return null;

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="fixed bottom-20 right-4 z-40 w-80 max-w-[90vw] bg-surface border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200 max-h-[500px]">
            <div className="p-3 border-b border-border flex justify-between items-center bg-tab/50">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    <h3 className="text-sm font-semibold text-text">History</h3>
                </div>
                <div className="flex items-center gap-1">
                    {/* Clear history simulation - in real app would clear store */}
                    <button 
                        onClick={() => dispatch({ type: 'TOGGLE_HISTORY', payload: false })}
                        className="p-1 rounded hover:bg-hover text-text-sec hover:text-text"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {history.length === 0 ? (
                    <div className="p-4 text-center text-xs text-text-sec">
                        No actions recorded yet.
                    </div>
                ) : (
                    history.map((log) => (
                        <div key={log.id} className="p-2 rounded bg-tab/30 border border-transparent hover:border-border transition-colors">
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-xs text-text font-medium">{log.description}</span>
                                <span className="text-[10px] text-text-sec whitespace-nowrap">{formatTime(log.timestamp)}</span>
                            </div>
                            <div className="text-[10px] text-text-sec mt-1 capitalize opacity-70">
                                {log.type.replace('_', ' ')}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActionHistory;