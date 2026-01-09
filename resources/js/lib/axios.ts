import axios from 'axios';
import { getCsrfToken, getXsrfCookie } from './csrf';

axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

axios.interceptors.request.use((config) => {
    const xsrfCookie = getXsrfCookie();
    const csrfToken = xsrfCookie ? undefined : getCsrfToken();

    if (!config.headers) {
        config.headers = {};
    }

    if (xsrfCookie) {
        config.headers['X-XSRF-TOKEN'] = xsrfCookie;
    } else if (csrfToken) {
        config.headers['X-CSRF-TOKEN'] = csrfToken;
    }

    return config;
});
