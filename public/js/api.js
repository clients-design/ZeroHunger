// API Configuration
const API_BASE_URL = '/api';

// Get auth token from localStorage
const getToken = () => localStorage.getItem('token');

// Check if user is logged in
const isLoggedIn = () => !!getToken();

// API Helper Functions
const api = {
    // Generic fetch wrapper
    async request(endpoint, options = {}) {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // GET request
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    // POST request
    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    // PUT request
    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    // DELETE request
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

// Auth API
const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me')
};

// Organization API
const organizationAPI = {
    getAll: () => api.get('/organizations'),
    getById: (id) => api.get(`/organizations/${id}`),
    create: (data) => api.post('/organizations', data),
    update: (id, data) => api.put(`/organizations/${id}`, data),
    delete: (id) => api.delete(`/organizations/${id}`)
};

// Centre API
const centreAPI = {
    getAll: (organizationId = null) => {
        const params = organizationId ? `?organizationId=${organizationId}` : '';
        return api.get(`/centres${params}`);
    },
    getById: (id) => api.get(`/centres/${id}`),
    create: (data) => api.post('/centres', data),
    update: (id, data) => api.put(`/centres/${id}`, data),
    delete: (id) => api.delete(`/centres/${id}`)
};

// Inventory API
const inventoryAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/inventory${params ? `?${params}` : ''}`);
    },
    getExpiry: () => api.get('/inventory/expiry'),
    getById: (id) => api.get(`/inventory/${id}`),
    create: (data) => api.post('/inventory', data),
    update: (id, data) => api.put(`/inventory/${id}`, data),
    delete: (id) => api.delete(`/inventory/${id}`)
};

// Demand API
const demandAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/demand${params ? `?${params}` : ''}`);
    },
    getForecast: () => api.get('/demand/forecast'),
    getTrends: (days = 7) => api.get(`/demand/trends?days=${days}`),
    create: (data) => api.post('/demand', data),
    delete: (id) => api.delete(`/demand/${id}`)
};

// Distribution API
const distributionAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/distribution${params ? `?${params}` : ''}`);
    },
    getById: (id) => api.get(`/distribution/${id}`),
    create: (data) => api.post('/distribution', data),
    update: (id, data) => api.put(`/distribution/${id}`, data),
    optimize: (id) => api.post(`/distribution/${id}/optimize`),
    delete: (id) => api.delete(`/distribution/${id}`)
};

// Dashboard API
const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats')
};

// Toast notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
    <span>${type === 'success' ? '✓' : '✕'}</span>
    <span>${message}</span>
  `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Loading state helpers
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="spinner"></div>';
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '';
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Get status pill class
function getStatusPillClass(status) {
    switch (status?.toLowerCase()) {
        case 'safe': return 'pill-safe';
        case 'warning': return 'pill-warning';
        case 'urgent': return 'pill-urgent';
        case 'planned': return 'pill-planned';
        case 'inprogress': return 'pill-inprogress';
        case 'completed': return 'pill-completed';
        default: return 'pill-safe';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/login.html';
}

// Check auth on page load
function checkAuth() {
    if (!isLoggedIn() && !window.location.pathname.includes('login')) {
        window.location.href = '/pages/login.html';
    }
}
