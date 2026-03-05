export const getAuthData = () => {
    const token = localStorage.getItem('token');
    if (!token) return { role: null, userId: null };
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);

        const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload.role;
        const userId = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"] || payload.nameid;

        return {
            role,
            userId,
            isAdmin: role === 'Admin' || (Array.isArray(role) && role.includes('Admin')),
            isAccountant: role === 'Accountant' || (Array.isArray(role) && role.includes('Accountant')),
            isSalesRep: role === 'SalesRep' || (Array.isArray(role) && role.includes('SalesRep'))
        };
    } catch (e) {
        return { role: null, userId: null };
    }
};
