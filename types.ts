
export interface Tab {
    id: string;
    name: string;
    content: string;
    color: string;
    groupId?: string;
    scrollPosition?: number;
    createdAt: number;
}

export interface Group {
    id: string;
    name: string;
    color: string;
    icon: string;
    order: number;
    tabIds: string[];
}

export interface AppSettings {
    aiEnabled: boolean;
    aiAutoAccept: boolean;
    aiName: string;
    theme: string;
    primaryColor: string;
    gridPatternEnabled: boolean;
    gridPatternStyle: 'dots' | 'lines' | 'squares';
}

export interface ActionLog {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    details?: any;
}

export const THEMES: Record<string, { name: string; icon: string; [key: string]: string }> = {
    dark: {
        name: 'Dark',
        icon: '🌙',
        '--bg-color': '#212121',
        '--surface-color': '#2D2D2D',
        '--text-color': '#E8ECEF',
        '--text-secondary': '#B0B0B0',
        '--border-color': '#424242',
        '--tab-color': '#333333',
        '--hover-color': '#454545',
        '--saving-color': '#ffffff',
        '--disabled-color': '#616161',
    },
    darker: {
        name: 'Darker',
        icon: '🌑',
        '--bg-color': '#1A1A1A',
        '--surface-color': '#252525',
        '--text-color': '#F5F5F5',
        '--text-secondary': '#BBBBBB',
        '--border-color': '#3A3A3A',
        '--tab-color': '#2A2A2A',
        '--hover-color': '#404040',
        '--saving-color': '#ffffff',
        '--disabled-color': '#4A4A4A',
    },
    black: {
        name: 'Black',
        icon: '⚫',
        '--bg-color': '#0F0F0F',
        '--surface-color': '#1C1C1C',
        '--text-color': '#FFFFFF',
        '--text-secondary': '#CCCCCC',
        '--border-color': '#333333',
        '--tab-color': '#222222',
        '--hover-color': '#383838',
        '--saving-color': '#ffffff',
        '--disabled-color': '#424242',
    },
    blue: {
        name: 'Blue',
        icon: '💙',
        '--bg-color': '#1A1F2E',
        '--surface-color': '#252B3D',
        '--text-color': '#E8ECEF',
        '--text-secondary': '#B0B8C8',
        '--border-color': '#3A4A5F',
        '--tab-color': '#2A3447',
        '--hover-color': '#3A4A5F',
        '--saving-color': '#89B4FA',
        '--disabled-color': '#4A5A6F',
    },
    purple: {
        name: 'Purple',
        icon: '💜',
        '--bg-color': '#1E1A2E',
        '--surface-color': '#2A2539',
        '--text-color': '#E8E0F5',
        '--text-secondary': '#B8A8D0',
        '--border-color': '#4A3F5F',
        '--tab-color': '#332A47',
        '--hover-color': '#4A3F5F',
        '--saving-color': '#CBA6F7',
        '--disabled-color': '#5A4F6F',
    },
    green: {
        name: 'Green',
        icon: '💚',
        '--bg-color': '#1A2E1F',
        '--surface-color': '#253D2A',
        '--text-color': '#E8F5EC',
        '--text-secondary': '#B0D0B8',
        '--border-color': '#3A5F4A',
        '--tab-color': '#2A4734',
        '--hover-color': '#3A5F4A',
        '--saving-color': '#A6E3A1',
        '--disabled-color': '#4A6F5A',
    },
    red: {
        name: 'Red',
        icon: '❤️',
        '--bg-color': '#2E1A1A',
        '--surface-color': '#3D2525',
        '--text-color': '#F5E8E8',
        '--text-secondary': '#D0B0B0',
        '--border-color': '#5F3A3A',
        '--tab-color': '#472A2A',
        '--hover-color': '#5F3A3A',
        '--saving-color': '#F38BA8',
        '--disabled-color': '#6F4A4A',
    },
    orange: {
        name: 'Orange',
        icon: '🧡',
        '--bg-color': '#2E241A',
        '--surface-color': '#3D2F25',
        '--text-color': '#F5EDE8',
        '--text-secondary': '#D0B8B0',
        '--border-color': '#5F4A3A',
        '--tab-color': '#473A2A',
        '--hover-color': '#5F4A3A',
        '--saving-color': '#FAB387',
        '--disabled-color': '#6F5A4A',
    },
    cyan: {
        name: 'Cyan',
        icon: '💎',
        '--bg-color': '#1A2E2E',
        '--surface-color': '#253D3D',
        '--text-color': '#E8F5F5',
        '--text-secondary': '#B0D0D0',
        '--border-color': '#3A5F5F',
        '--tab-color': '#2A4747',
        '--hover-color': '#3A5F5F',
        '--saving-color': '#89DCEB',
        '--disabled-color': '#4A6F6F',
    },
    gray: {
        name: 'Gray',
        icon: '⚪',
        '--bg-color': '#1E1E1E',
        '--surface-color': '#2A2A2A',
        '--text-color': '#E8E8E8',
        '--text-secondary': '#B8B8B8',
        '--border-color': '#4A4A4A',
        '--tab-color': '#333333',
        '--hover-color': '#4A4A4A',
        '--saving-color': '#C0C0C0',
        '--disabled-color': '#5A5A5A',
    }
};
