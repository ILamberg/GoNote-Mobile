
export const hashPIN = async (pin: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const deriveKey = async (pinHash: string) => {
    const keyMaterial = pinHash + 'GoNoteV2_Encryption_Key_2024_CrossDevice';
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keyMaterial);
    const salt = encoder.encode('GoNoteV2_Salt_V1');

    const importedKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        importedKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
};

export const encryptData = async (data: string, pinHash: string): Promise<string> => {
    try {
        const key = await deriveKey(pinHash);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoder = new TextEncoder();
        const dataToEncrypt = encoder.encode(data);

        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            dataToEncrypt
        );

        const combined = new Uint8Array(iv.length + encryptedData.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encryptedData), iv.length);

        return btoa(String.fromCharCode.apply(null, Array.from(combined)));
    } catch (e) {
        console.error("Encryption failed", e);
        throw new Error("Encryption failed");
    }
};

export const decryptData = async (encryptedBase64: string, pinHash: string): Promise<string> => {
    try {
        const key = await deriveKey(pinHash);
        const binaryString = atob(encryptedBase64);
        const combined = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            combined[i] = binaryString.charCodeAt(i);
        }

        const iv = combined.slice(0, 12);
        const encryptedData = combined.slice(12);

        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encryptedData
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedData);
    } catch (e) {
        console.error("Decryption failed", e);
        throw new Error("Decryption failed");
    }
};
