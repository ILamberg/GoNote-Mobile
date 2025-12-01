
import React, { useState, useEffect } from 'react';
import { useApp, AppProvider } from './store';
import TabList from './components/TabList';
import GroupBar from './components/GroupBar';
import Notepad from './components/Notepad';
import SettingsModal from './components/SettingsModal';
import AIPrompt from './components/AIPrompt';
import ActionHistory from './components/ActionHistory';
import { Settings, User, Sparkles, History, Cloud, LogOut, Upload, Download } from 'lucide-react';
import { getAuthToken, getUserProfile, uploadToCloud, downloadFromCloud, signOut, BackupData } from './services/cloudService';
import { getGridPatternStyle } from './utils';

const AppContent: React.FC = () => {
    const { state, dispatch } = useApp();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [user, setUser] = useState<{ name: string, picture: string } | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');

    useEffect(() => {
        // Check for existing login
        const token = localStorage.getItem('googleAccessToken');
        if (token) {
            getUserProfile(token).then(profile => {
                setUser({ name: profile.name, picture: profile.picture });
            }).catch(() => {
                // Token invalid or error
                localStorage.removeItem('googleAccessToken');
            });
        }
    }, []);

    const handleLogin = async () => {
        try {
            setSyncMessage('Logging in...');
            setIsSyncing(true);
            const token = await getAuthToken();
            const profile = await getUserProfile(token);
            setUser({ name: profile.name, picture: profile.picture });
        } catch (e: any) {
            console.error(e);
            alert("Login failed: " + e.message);
        } finally {
            setIsSyncing(false);
            setSyncMessage('');
        }
    };

    const handleLogout = async () => {
        const token = localStorage.getItem('googleAccessToken');
        if (token) {
            await signOut(token);
        }
        setUser(null);
        setIsProfileMenuOpen(false);
    };

    const handleSave = async () => {
        const token = localStorage.getItem('googleAccessToken');
        if (!token) return handleLogin();

        try {
            setIsSyncing(true);
            setSyncMessage('Uploading...');
            
            // 1. Filter out Secret/Recipe tabs - NEVER save them to standard cloud file
            const recipeGroup = state.groups.find(g => g.name === 'Recipe');
            const recipeGroupId = recipeGroup?.id;

            // Filter tabs
            const tabsToSave = state.tabs
                .filter(t => t.groupId !== recipeGroupId)
                .map(t => ({
                    ...t,
                    // Ensure we grab the absolute latest content from localStorage if available
                    // This mirrors script.js "Source of Truth" logic
                    content: localStorage.getItem(`tabContent-${t.id}`) || t.content || ''
                }));

            // Filter groups (remove secret tab IDs from group lists)
            const groupsToSave = state.groups.map(g => ({
                ...g,
                tabIds: g.tabIds.filter(tid => tabsToSave.some(t => t.id === tid))
            }));

            // 2. Prepare backup data
            const backup: BackupData = {
                tabs: tabsToSave,
                groups: groupsToSave,
                settings: state.settings,
                timestamp: new Date().toISOString(),
                activeTab: state.activeTabId,
                activeGroupFilters: state.activeGroupFilters,
                // Redundant top-level keys for script.js/legacy compatibility
                theme: state.settings.theme,
                primaryColor: state.settings.primaryColor,
                gridPatternEnabled: state.settings.gridPatternEnabled,
                gridPatternStyle: state.settings.gridPatternStyle
            };

            await uploadToCloud(backup, token);
            dispatch({ type: 'LOG_ACTION', payload: { type: 'save_cloud', description: 'Saved to cloud' } });
            alert("Saved to cloud successfully!");
        } catch (e: any) {
            console.error(e);
            alert("Save failed: " + e.message);
        } finally {
            setIsSyncing(false);
            setSyncMessage('');
            setIsProfileMenuOpen(false);
        }
    };

    const handleLoad = async () => {
        const token = localStorage.getItem('googleAccessToken');
        if (!token) return handleLogin();

        if (!confirm("This will overwrite your current local data. Continue?")) return;

        try {
            setIsSyncing(true);
            setSyncMessage('Downloading...');
            const data = await downloadFromCloud(token);
            
            if (data) {
                // 1. Sync content to localStorage immediately (Source of Truth)
                // Crucial step: ensure localStorage is populated before state update
                if (data.tabs) {
                    data.tabs.forEach((t: any) => {
                        localStorage.setItem(`tabContent-${t.id}`, t.content || '');
                    });
                }
                
                // 2. Handle Settings merging (Cloud settings + Legacy root props)
                // script.js supports root-level properties for older versions
                const mergedSettings = {
                    ...state.settings,
                    ...(data.settings || {}),
                    theme: data.theme || data.settings?.theme || state.settings.theme,
                    primaryColor: data.primaryColor || data.settings?.primaryColor || state.settings.primaryColor,
                    gridPatternEnabled: (data.gridPatternEnabled !== undefined) ? data.gridPatternEnabled : (data.settings?.gridPatternEnabled ?? state.settings.gridPatternEnabled),
                    gridPatternStyle: (data.gridPatternStyle as any) || data.settings?.gridPatternStyle || state.settings.gridPatternStyle
                };

                // 3. Dispatch full state replacement
                dispatch({ type: 'LOAD_STATE', payload: {
                    tabs: data.tabs || [],
                    groups: data.groups || [],
                    activeTabId: data.activeTab || null,
                    activeGroupFilters: data.activeGroupFilters || [],
                    settings: mergedSettings
                }});

                // 4. Update LocalStorage for metadata immediately to persist state
                localStorage.setItem('tabs', JSON.stringify(data.tabs || []));
                localStorage.setItem('groups', JSON.stringify(data.groups || []));
                localStorage.setItem('settings', JSON.stringify(mergedSettings));
                
                dispatch({ type: 'LOG_ACTION', payload: { type: 'load_cloud', description: 'Loaded from cloud' } });
                alert("Loaded from cloud successfully!");
            } else {
                alert("No backup found.");
            }
        } catch (e: any) {
            console.error(e);
            alert("Load failed: " + e.message);
        } finally {
            setIsSyncing(false);
            setSyncMessage('');
            setIsProfileMenuOpen(false);
        }
    };

    const backgroundStyle = getGridPatternStyle(state.settings.gridPatternEnabled, state.settings.gridPatternStyle);

    return (
        <div className="flex flex-col h-screen bg-bg text-text font-sans relative transition-colors duration-200 overflow-hidden">
            {/* Background pattern overlay - placed absolutely behind everything */}
            <div 
                className="absolute inset-0 pointer-events-none z-0 opacity-40"
                style={backgroundStyle}
            />

            {/* Header / Group Bar - z-20 to sit above grid */}
            <div className="flex-shrink-0 flex flex-col border-b border-border bg-surface/95 backdrop-blur-sm z-20 shadow-sm relative">
                <div className="flex items-center justify-between pr-2">
                    <GroupBar />
                    <div className="flex items-center gap-1 pl-2 border-l border-border h-full py-1">
                        {/* Mobile AI Toggle */}
                        <button 
                            className="p-1.5 rounded-lg hover:bg-hover text-primary hover:text-primary transition-colors md:hidden"
                            onClick={() => dispatch({ type: 'TOGGLE_AI_PROMPT' })}
                            title="Open AI Assistant"
                        >
                            <Sparkles size={18} />
                        </button>

                        {/* History Toggle */}
                        <button 
                            className={`p-1.5 rounded-lg transition-colors ${state.isHistoryOpen ? 'bg-primary text-white' : 'hover:bg-hover text-text-sec hover:text-text'}`}
                            onClick={() => dispatch({ type: 'TOGGLE_HISTORY' })}
                            title="Action History"
                        >
                            <History size={18} />
                        </button>

                        <button 
                            className="p-1.5 rounded-lg hover:bg-hover text-text-sec hover:text-text transition-colors"
                            onClick={() => setIsSettingsOpen(true)}
                            title="Settings"
                        >
                            <Settings size={18} />
                        </button>
                        
                        {/* Profile Menu */}
                        <div className="relative">
                            <div 
                                className="w-8 h-8 ml-1 rounded-full bg-tab border border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            >
                                {user ? (
                                    <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={16} className="text-text-sec" />
                                )}
                            </div>

                            {/* Profile Menu Popover */}
                            {isProfileMenuOpen && (
                                <>
                                    {/* Transparent backdrop to capture clicks outside */}
                                    <div 
                                        className="fixed inset-0 z-30 cursor-default" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsProfileMenuOpen(false);
                                        }} 
                                    />
                                    <div className="absolute right-0 top-10 w-56 bg-surface border border-border rounded-xl shadow-xl z-40 animate-in fade-in slide-in-from-top-2 duration-100 overflow-hidden">
                                        {user ? (
                                            <>
                                                <div className="p-3 border-b border-border bg-tab/30">
                                                    <div className="font-medium text-text truncate">{user.name}</div>
                                                    <div className="text-xs text-text-sec">Google Account</div>
                                                </div>
                                                <div className="p-1">
                                                    <button onClick={handleSave} className="w-full text-left px-3 py-2 text-sm hover:bg-hover rounded-lg flex items-center gap-2 text-text transition-colors">
                                                        <Upload size={16} className="text-primary" /> Save to Cloud
                                                    </button>
                                                    <button onClick={handleLoad} className="w-full text-left px-3 py-2 text-sm hover:bg-hover rounded-lg flex items-center gap-2 text-text transition-colors">
                                                        <Download size={16} className="text-success-color" /> Load from Cloud
                                                    </button>
                                                    <div className="my-1 border-t border-border" />
                                                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm hover:bg-red-500/10 text-red-400 rounded-lg flex items-center gap-2 transition-colors">
                                                        <LogOut size={16} /> Sign Out
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="p-1">
                                                <button onClick={handleLogin} className="w-full text-left px-3 py-2 text-sm hover:bg-hover rounded-lg flex items-center gap-2 text-text transition-colors">
                                                    <Cloud size={16} className="text-primary" /> Login with Google
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <TabList />
            </div>

            {/* Main Content - z-10 to sit above grid but below overlays */}
            <div className="flex-1 relative overflow-hidden flex flex-col z-10">
                <Notepad />
            </div>

            {/* Overlays */}
            {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
            <AIPrompt />
            <ActionHistory />
            
            {/* Loading Overlay */}
            {isSyncing && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-medium text-lg">{syncMessage}</p>
                </div>
            )}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;
