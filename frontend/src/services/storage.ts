const STORAGE_KEYS = {
    TOKEN: 'makeusbetter_token',
    USER_ID: 'makeusbetter_user_id',
    PARTNER_ID: 'makeusbetter_partner_id',
    USER_NAME: 'makeusbetter_user_name',
    PARTNER_NAME: 'makeusbetter_partner_name',
    PAIR_CODE: 'makeusbetter_pair_code',
};

export const storage = {
    // Token
    getToken: () => localStorage.getItem(STORAGE_KEYS.TOKEN),
    setToken: (token: string) => localStorage.setItem(STORAGE_KEYS.TOKEN, token),
    removeToken: () => localStorage.removeItem(STORAGE_KEYS.TOKEN),

    // User ID
    getUserId: () => localStorage.getItem(STORAGE_KEYS.USER_ID),
    setUserId: (id: string) => localStorage.setItem(STORAGE_KEYS.USER_ID, id),

    // Partner ID
    getPartnerId: () => localStorage.getItem(STORAGE_KEYS.PARTNER_ID),
    setPartnerId: (id: string) => localStorage.setItem(STORAGE_KEYS.PARTNER_ID, id),

    // Names
    getUserName: () => localStorage.getItem(STORAGE_KEYS.USER_NAME),
    setUserName: (name: string) => localStorage.setItem(STORAGE_KEYS.USER_NAME, name),
    getPartnerName: () => localStorage.getItem(STORAGE_KEYS.PARTNER_NAME),
    setPartnerName: (name: string) => localStorage.setItem(STORAGE_KEYS.PARTNER_NAME, name),

    // Pair Code
    getPairCode: () => localStorage.getItem(STORAGE_KEYS.PAIR_CODE),
    setPairCode: (code: string) => localStorage.setItem(STORAGE_KEYS.PAIR_CODE, code),

    // Clear all
    clear: () => {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    },

    // Check if logged in
    isLoggedIn: () => !!localStorage.getItem(STORAGE_KEYS.TOKEN),
};

export default storage;
