
import { CLOUD_FILE_NAME } from '../constants';
import { Tab, Group, AppSettings } from '../types';

declare var chrome: any;

// Exact structure matching script.js for cross-compatibility
export interface BackupData {
    tabs: Tab[];
    groups: Group[];
    settings: AppSettings;
    timestamp: string;
    activeTab: string | null;
    activeGroupFilters: string[];
    // Legacy/Root level properties for compatibility with script.js
    theme?: string;
    primaryColor?: string;
    gridPatternEnabled?: boolean;
    gridPatternStyle?: string;
    lastActiveTabPerGroup?: Record<string, string>;
}

// Helper to detect extension environment
const isExtension = () => {
    return typeof chrome !== 'undefined' && chrome.identity && chrome.runtime;
};

// --- Mock Cloud Service (Local Storage Fallback) ---
const MOCK_STORAGE_KEY = 'mock_cloud_drive_file';
const MOCK_TOKEN = 'mock_access_token_123';

const mockGetAuthToken = async (): Promise<string> => {
    console.log("[Mock Cloud] Authenticating...");
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    localStorage.setItem('googleAccessToken', MOCK_TOKEN);
    return MOCK_TOKEN;
};

const mockGetUserProfile = async () => {
    console.log("[Mock Cloud] Fetching profile...");
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        name: "Demo User (Web Mode)",
        picture: "https://ui-avatars.com/api/?name=Demo+User&background=random"
    };
};

const mockUploadToCloud = async (data: BackupData) => {
    console.log("[Mock Cloud] Uploading...", data);
    await new Promise(resolve => setTimeout(resolve, 1500));
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem('cloudFileId', 'mock_file_id_xyz');
};

const mockDownloadFromCloud = async (): Promise<BackupData | null> => {
    console.log("[Mock Cloud] Downloading...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    const data = localStorage.getItem(MOCK_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
};
// --------------------------------------------------

// Real Cloud Service
export const getAuthToken = async (): Promise<string> => {
    const cachedToken = localStorage.getItem('googleAccessToken');
    
    // Check cached token validity
    if (cachedToken) {
        const isValid = await verifyToken(cachedToken);
        if (isValid) return cachedToken;
    }

    if (!isExtension()) {
        console.warn("Extension API not found. Using Mock Cloud Service for web preview.");
        return mockGetAuthToken();
    }

    return new Promise((resolve, reject) => {
        const manifest = chrome.runtime.getManifest();
        if (!manifest.oauth2) {
             reject(new Error("OAuth2 not configured in manifest"));
             return;
        }

        const clientId = manifest.oauth2.client_id;
        const scopes = manifest.oauth2.scopes.join(' ');
        const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
        
        const authUrl = 
            'https://accounts.google.com/o/oauth2/auth?' +
            'client_id=' + encodeURIComponent(clientId) +
            '&response_type=token' +
            '&redirect_uri=' + encodeURIComponent(redirectUri) +
            '&scope=' + encodeURIComponent(scopes) +
            '&approval_prompt=auto';

        chrome.identity.launchWebAuthFlow({
            url: authUrl,
            interactive: true
        }, (responseUrl: any) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }
            if (!responseUrl) {
                reject(new Error('No response URL'));
                return;
            }

            const urlParams = new URLSearchParams(new URL(responseUrl).hash.substring(1)); 
            const token = urlParams.get('access_token');
            
            if (token) {
                localStorage.setItem('googleAccessToken', token);
                resolve(token);
            } else {
                reject(new Error('Failed to retrieve token'));
            }
        });
    });
};

export const verifyToken = async (token: string): Promise<boolean> => {
    if (token === MOCK_TOKEN) return true; // Validate mock token
    
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.ok;
    } catch {
        return false;
    }
};

export const getUserProfile = async (token: string) => {
    if (token === MOCK_TOKEN) return mockGetUserProfile();

    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return await response.json();
};

export const findCloudFile = async (token: string) => {
    if (token === MOCK_TOKEN) {
        return localStorage.getItem(MOCK_STORAGE_KEY) ? 'mock_file_id_xyz' : null;
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=name="${CLOUD_FILE_NAME}"&spaces=appDataFolder`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
};

export const uploadToCloud = async (data: BackupData, token: string) => {
    if (token === MOCK_TOKEN) return mockUploadToCloud(data);

    let fileId = localStorage.getItem('cloudFileId');
    if (!fileId) {
        fileId = await findCloudFile(token);
    }

    const fileContent = JSON.stringify(data, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });
    
    if (fileId) {
        // Update
        await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` },
            body: blob
        });
    } else {
        // Create
        const metadata = {
            name: CLOUD_FILE_NAME,
            parents: ['appDataFolder'],
            mimeType: 'application/json'
        };
        
        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', blob);

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        
        if (response.ok) {
            const resData = await response.json();
            localStorage.setItem('cloudFileId', resData.id);
        }
    }
};

export const downloadFromCloud = async (token: string): Promise<BackupData | null> => {
    if (token === MOCK_TOKEN) return mockDownloadFromCloud();

    let fileId = await findCloudFile(token);
    if (!fileId) return null;
    
    localStorage.setItem('cloudFileId', fileId);

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Download failed');
    return await response.json();
};

export const signOut = async (token: string) => {
    localStorage.removeItem('googleAccessToken');
    localStorage.removeItem('googleProfilePicture');
    localStorage.removeItem('googleUserName');
    localStorage.removeItem('cloudFileId');
    
    if (isExtension()) {
        try {
             await new Promise<void>((resolve) => {
                 chrome.identity.removeCachedAuthToken({ token }, () => resolve());
             });
        } catch (e) {
            console.warn("Failed to remove cached token", e);
        }
    }
};
