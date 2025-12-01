
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Tab, Group, AppSettings, THEMES, ActionLog } from './types';

// State Definition
interface AppState {
    tabs: Tab[];
    groups: Group[];
    activeTabId: string | null;
    activeGroupFilters: string[];
    settings: AppSettings;
    secretTabVisible: boolean;
    secretTabId: string | null;
    history: ActionLog[];
    isAIPromptOpen: boolean;
    isHistoryOpen: boolean;
}

// Initial State
const initialState: AppState = {
    tabs: [],
    groups: [],
    activeTabId: null,
    activeGroupFilters: [],
    settings: {
        aiEnabled: true,
        aiAutoAccept: false,
        aiName: 'Memo',
        theme: 'dark',
        primaryColor: '#89B4FA',
        gridPatternEnabled: false,
        gridPatternStyle: 'dots'
    },
    secretTabVisible: false,
    secretTabId: null,
    history: [],
    isAIPromptOpen: false,
    isHistoryOpen: false
};

// Actions
type Action =
    | { type: 'LOAD_STATE'; payload: Partial<AppState> }
    | { type: 'ADD_TAB'; payload: Tab }
    | { type: 'UPDATE_TAB'; payload: { id: string; updates: Partial<Tab> } }
    | { type: 'DELETE_TAB'; payload: string }
    | { type: 'SET_ACTIVE_TAB'; payload: string | null }
    | { type: 'ADD_GROUP'; payload: Group }
    | { type: 'UPDATE_GROUP'; payload: { id: string; updates: Partial<Group> } }
    | { type: 'DELETE_GROUP'; payload: string }
    | { type: 'TOGGLE_GROUP_FILTER'; payload: string }
    | { type: 'SET_SETTINGS'; payload: Partial<AppSettings> }
    | { type: 'TOGGLE_SECRET_VISIBILITY'; payload: boolean }
    | { type: 'LOG_ACTION'; payload: Omit<ActionLog, 'id' | 'timestamp'> }
    | { type: 'TOGGLE_AI_PROMPT'; payload?: boolean }
    | { type: 'TOGGLE_HISTORY'; payload?: boolean }
    | { type: 'CLEAR_HISTORY' };

// Helper to create log entry
const createLog = (type: string, description: string): ActionLog => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    type,
    description,
    timestamp: new Date().toISOString()
});

// Reducer
const reducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'LOAD_STATE':
            return { ...state, ...action.payload };
        case 'ADD_TAB':
            return { 
                ...state, 
                tabs: [...state.tabs, action.payload], 
                activeTabId: action.payload.id,
                history: [createLog('create_tab', `Created tab "${action.payload.name}"`), ...state.history].slice(0, 100)
            };
        case 'UPDATE_TAB': {
            // Handle content update separately for localStorage sync
            if (action.payload.updates.content !== undefined) {
                localStorage.setItem(`tabContent-${action.payload.id}`, action.payload.updates.content);
            }

            // Only log significant updates (rename)
            const tab = state.tabs.find(t => t.id === action.payload.id);
            let newHistory = state.history;
            if (tab && action.payload.updates.name && action.payload.updates.name !== tab.name) {
                newHistory = [createLog('rename_tab', `Renamed tab from "${tab.name}" to "${action.payload.updates.name}"`), ...state.history].slice(0, 100);
            }
            
            return {
                ...state,
                tabs: state.tabs.map(t => t.id === action.payload.id ? { ...t, ...action.payload.updates } : t),
                history: newHistory
            };
        }
        case 'DELETE_TAB': {
            const tabToDeleteId = action.payload;
            const tabToDelete = state.tabs.find(t => t.id === tabToDeleteId);
            
            if (!tabToDelete) return state;

            // 1. Remove the tab from tabs array
            let newTabs = state.tabs.filter(t => t.id !== tabToDeleteId);
            
            // 2. Remove the tab ID from any groups
            let newGroups = state.groups.map(g => ({
                ...g,
                tabIds: g.tabIds.filter(id => id !== tabToDeleteId)
            }));

            // 3. Check if the deleted tab's group is now empty (Auto-fill Logic)
            // We check if the tab had a groupId, and if so, if that group in newGroups now has 0 tabs
            if (tabToDelete.groupId) {
                const groupIndex = newGroups.findIndex(g => g.id === tabToDelete.groupId);
                // Check tabs array for any remaining tabs with this groupId
                const remainingTabsInGroup = newTabs.filter(t => t.groupId === tabToDelete.groupId);
                
                if (groupIndex !== -1 && remainingTabsInGroup.length === 0) {
                    // Create a new tab for this empty group
                    const newTabId = `tab-${Date.now()}`;
                    const newTab: Tab = {
                        id: newTabId,
                        name: newGroups[groupIndex].name, // Use group name as default
                        content: '',
                        color: newGroups[groupIndex].color || '#333333',
                        groupId: tabToDelete.groupId,
                        createdAt: Date.now()
                    };
                    newTabs.push(newTab);
                    newGroups[groupIndex].tabIds.push(newTabId);
                }
            }

            // 4. Check if the entire app is empty (Auto-fill Default)
            if (newTabs.length === 0) {
                const newTabId = `tab-${Date.now()}`;
                const newTab: Tab = {
                    id: newTabId,
                    name: 'Untitled',
                    content: '',
                    color: '#333333',
                    createdAt: Date.now()
                };
                newTabs.push(newTab);
            }

            // 5. Determine New Active Tab
            let newActiveId = state.activeTabId;
            
            if (state.activeTabId === tabToDeleteId) {
                // If we auto-created a tab (it won't be in the old state), switch to it
                // We find the new tab by checking which ID exists in newTabs but not in state.tabs
                const newlyCreatedTab = newTabs.find(nt => !state.tabs.some(ot => ot.id === nt.id));
                
                if (newlyCreatedTab) {
                    newActiveId = newlyCreatedTab.id;
                } else {
                    // Otherwise switch to the last available tab
                    newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
                }
            }

            // Cleanup storage
            localStorage.removeItem(`tabContent-${tabToDeleteId}`);

            return { 
                ...state, 
                tabs: newTabs, 
                groups: newGroups,
                activeTabId: newActiveId,
                history: [createLog('delete_tab', `Deleted tab "${tabToDelete.name}"`), ...state.history].slice(0, 100)
            };
        }
        case 'SET_ACTIVE_TAB':
            return { ...state, activeTabId: action.payload };
        case 'ADD_GROUP':
            return { 
                ...state, 
                groups: [...state.groups, action.payload],
                history: [createLog('create_group', `Created group "${action.payload.name}"`), ...state.history].slice(0, 100)
            };
        case 'UPDATE_GROUP':
            return {
                ...state,
                groups: state.groups.map(g => g.id === action.payload.id ? { ...g, ...action.payload.updates } : g)
            };
        case 'DELETE_GROUP':
            // Ungroup tabs in this group
            const tabsUngrouped = state.tabs.map(t => t.groupId === action.payload ? { ...t, groupId: undefined } : t);
            return {
                ...state,
                groups: state.groups.filter(g => g.id !== action.payload),
                tabs: tabsUngrouped,
                activeGroupFilters: state.activeGroupFilters.filter(id => id !== action.payload),
                history: [createLog('delete_group', `Deleted group`), ...state.history].slice(0, 100)
            };
        case 'TOGGLE_GROUP_FILTER': {
            if (action.payload === 'ALL_RESET') {
                return { ...state, activeGroupFilters: [] };
            }
            const exists = state.activeGroupFilters.includes(action.payload);
            // Toggle logic
            const newFilters = exists
                ? state.activeGroupFilters.filter(id => id !== action.payload)
                : [...state.activeGroupFilters, action.payload];
            return { ...state, activeGroupFilters: newFilters };
        }
        case 'SET_SETTINGS':
            // Determine what changed for logging
            let settingDescription = "Updated settings";
            if (action.payload.theme) settingDescription = `Changed theme to ${action.payload.theme}`;
            if (action.payload.primaryColor) settingDescription = `Changed primary color`;
            if (action.payload.aiEnabled !== undefined) settingDescription = action.payload.aiEnabled ? "Enabled AI" : "Disabled AI";
            if (action.payload.gridPatternEnabled !== undefined) settingDescription = action.payload.gridPatternEnabled ? "Enabled grid pattern" : "Disabled grid pattern";

            return { 
                ...state, 
                settings: { ...state.settings, ...action.payload },
                history: [createLog('settings', settingDescription), ...state.history].slice(0, 100)
            };
        case 'TOGGLE_SECRET_VISIBILITY':
            return { ...state, secretTabVisible: action.payload };
        case 'LOG_ACTION':
            const newLog: ActionLog = {
                id: Date.now().toString() + Math.random(),
                timestamp: new Date().toISOString(),
                ...action.payload
            };
            return { ...state, history: [newLog, ...state.history].slice(0, 100) };
        case 'TOGGLE_AI_PROMPT':
            return { 
                ...state, 
                isAIPromptOpen: action.payload !== undefined ? action.payload : !state.isAIPromptOpen 
            };
        case 'TOGGLE_HISTORY':
            return { 
                ...state, 
                isHistoryOpen: action.payload !== undefined ? action.payload : !state.isHistoryOpen 
            };
        case 'CLEAR_HISTORY':
            return { ...state, history: [] };
        default:
            return state;
    }
};

// Context
const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export const AppProvider = ({ children }: { children?: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Initial Load from LocalStorage
    useEffect(() => {
        const loadedTabsRaw = localStorage.getItem('tabs');
        const loadedGroups = localStorage.getItem('groups');
        const loadedSettings = localStorage.getItem('settings');
        const loadedHistory = localStorage.getItem('actionHistory');
        
        // Parse tabs and then sync content from `tabContent-{id}` keys
        let initialTabs: Tab[] = loadedTabsRaw ? JSON.parse(loadedTabsRaw) : [];
        
        // Ensure content is synced from individual keys (Source of Truth logic from script.js)
        initialTabs = initialTabs.map(tab => {
            const content = localStorage.getItem(`tabContent-${tab.id}`);
            return {
                ...tab,
                content: content !== null ? content : tab.content || ''
            };
        });

        if (initialTabs.length > 0 || loadedGroups || loadedSettings || loadedHistory) {
            dispatch({
                type: 'LOAD_STATE',
                payload: {
                    tabs: initialTabs,
                    groups: loadedGroups ? JSON.parse(loadedGroups) : [],
                    settings: loadedSettings ? { ...initialState.settings, ...JSON.parse(loadedSettings) } : initialState.settings,
                    history: loadedHistory ? JSON.parse(loadedHistory) : []
                }
            });
        } else {
            // Create default tab
            const defaultTab: Tab = {
                id: 'tab-' + Date.now(),
                name: 'Untitled',
                content: '',
                color: '#333333',
                createdAt: Date.now()
            };
            dispatch({ type: 'ADD_TAB', payload: defaultTab });
        }
    }, []);

    // Persistence for Metadata
    useEffect(() => {
        localStorage.setItem('tabs', JSON.stringify(state.tabs));
        localStorage.setItem('groups', JSON.stringify(state.groups));
        localStorage.setItem('settings', JSON.stringify(state.settings));
        localStorage.setItem('actionHistory', JSON.stringify(state.history));
    }, [state.tabs, state.groups, state.settings, state.history]);

    // Theme Application
    useEffect(() => {
        const theme = THEMES[state.settings.theme] || THEMES['dark'];
        const root = document.documentElement;
        
        // Apply CSS variables
        Object.entries(theme).forEach(([key, value]) => {
            if (key.startsWith('--')) {
                root.style.setProperty(key, value);
            }
        });
        root.style.setProperty('--primary-color', state.settings.primaryColor);
        
        // Grid pattern logic moved to App.tsx overlay for cleaner separation
    }, [state.settings.theme, state.settings.primaryColor]);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used within AppProvider");
    return context;
};
