const STORAGE_KEYS = {
    TOKEN: 'makeusbetter_token',
    USER_ID: 'makeusbetter_user_id',
    PARTNER_ID: 'makeusbetter_partner_id',
    USER_NAME: 'makeusbetter_user_name',
    PARTNER_NAME: 'makeusbetter_partner_name',
    PAIR_CODE: 'makeusbetter_pair_code',
    USERNAME: 'makeusbetter_username',
    AVATAR_URL: 'makeusbetter_avatar_url',
    PARTNER_AVATAR_URL: 'makeusbetter_partner_avatar_url',
};

export const storage = {
    // Token
    getToken: () => localStorage.getItem(STORAGE_KEYS.TOKEN),
    setToken: (token: string | null) => {
        if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        else localStorage.removeItem(STORAGE_KEYS.TOKEN);
    },
    removeToken: () => localStorage.removeItem(STORAGE_KEYS.TOKEN),

    // User ID
    getUserId: () => localStorage.getItem(STORAGE_KEYS.USER_ID),
    setUserId: (id: string | null) => {
        if (id) localStorage.setItem(STORAGE_KEYS.USER_ID, id);
        else localStorage.removeItem(STORAGE_KEYS.USER_ID);
    },

    // Partner ID
    getPartnerId: () => localStorage.getItem(STORAGE_KEYS.PARTNER_ID),
    setPartnerId: (id: string | null) => {
        if (id) localStorage.setItem(STORAGE_KEYS.PARTNER_ID, id);
        else localStorage.removeItem(STORAGE_KEYS.PARTNER_ID);
    },

    // Names
    getUserName: () => localStorage.getItem(STORAGE_KEYS.USER_NAME),
    setUserName: (name: string | null) => {
        if (name) localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
        else localStorage.removeItem(STORAGE_KEYS.USER_NAME);
    },
    getPartnerName: () => localStorage.getItem(STORAGE_KEYS.PARTNER_NAME),
    setPartnerName: (name: string | null) => {
        if (name) localStorage.setItem(STORAGE_KEYS.PARTNER_NAME, name);
        else localStorage.removeItem(STORAGE_KEYS.PARTNER_NAME);
    },

    // Username
    getUsername: () => localStorage.getItem(STORAGE_KEYS.USERNAME),
    setUsername: (username: string | null) => {
        if (username) localStorage.setItem(STORAGE_KEYS.USERNAME, username);
        else localStorage.removeItem(STORAGE_KEYS.USERNAME);
    },

    // Pair Code
    getPairCode: () => localStorage.getItem(STORAGE_KEYS.PAIR_CODE),
    setPairCode: (code: string | null) => {
        if (code) localStorage.setItem(STORAGE_KEYS.PAIR_CODE, code);
        else localStorage.removeItem(STORAGE_KEYS.PAIR_CODE);
    },

    // Avatar URLs
    getAvatarUrl: () => localStorage.getItem(STORAGE_KEYS.AVATAR_URL),
    setAvatarUrl: (url: string | null) => {
        if (url) localStorage.setItem(STORAGE_KEYS.AVATAR_URL, url);
        else localStorage.removeItem(STORAGE_KEYS.AVATAR_URL);
    },
    getPartnerAvatarUrl: () => localStorage.getItem(STORAGE_KEYS.PARTNER_AVATAR_URL),
    setPartnerAvatarUrl: (url: string | null) => {
        if (url) localStorage.setItem(STORAGE_KEYS.PARTNER_AVATAR_URL, url);
        else localStorage.removeItem(STORAGE_KEYS.PARTNER_AVATAR_URL);
    },

    // Clear all
    clear: () => {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    },

    // Check if logged in
    isLoggedIn: () => !!localStorage.getItem(STORAGE_KEYS.TOKEN),
};

export default storage;
