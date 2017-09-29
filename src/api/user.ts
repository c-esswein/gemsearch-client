import { serverFetch, serverPost } from 'api';


/**
 * Sync spotify music lib with server.
 */
export function syncUser(token: string) {
    return serverPost('/api/user/sync', undefined, {
        token
    });
}

