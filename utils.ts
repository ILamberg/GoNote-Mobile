

export const generateId = (prefix: string = 'id'): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
        new Promise(resolve => {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => resolve(func(...args)), waitFor);
        });
};

export const hexToRgba = (hex: string, alpha: number = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getGridPatternStyle = (enabled: boolean, style: string) => {
    if (!enabled) {
        return {
            backgroundImage: 'none',
            backgroundSize: 'auto',
            backgroundAttachment: 'fixed'
        };
    }

    let pattern = 'none';
    let size = 'auto';

    // Updated to use specific opacities that are visible against dark backgrounds
    if (style === 'dots') {
        pattern = 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 1.5px, transparent 1.5px)';
        size = '24px 24px';
    } else if (style === 'lines') {
        pattern = 'linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)';
        size = '24px 24px';
    } else if (style === 'squares') {
        pattern = 'linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px)';
        size = '16px 16px';
    }

    return {
        backgroundImage: pattern,
        backgroundSize: size,
        backgroundAttachment: 'fixed'
    };
};
