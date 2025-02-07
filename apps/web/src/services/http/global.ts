import { client, attachAPI, API_PREFIX } from './client';

import { type UserType, type UserMenuType } from './user';

export interface GlobalAPISchema extends APISchema {
    /** Log in */
    oauthLogin: {
        request: {
            /** username */
            username: string;
            /** cipher */
            password: string;
            /** Authorization type */
            grant_type: 'password';
            /** Client ID  */
            client_id: string;
            /** Client Secret  */
            client_secret: string;
        };
        // TODO: To be added
        response: {
            /** Authentication Token */
            access_token: string;
            /** Refresh Token */
            refresh_token: string;
            /** Expiration time, unit s */
            // expires_in: number;
        };
    };

    /** Refresh Token */
    // oauthRefresh: {
    //     request: {
    //         refresh_token: string;
    //         grant_type: 'refresh_token';
    //     };
    //     response: GlobalAPISchema['oauthLogin']['response'];
    // };

    /** User registration */
    oauthRegister: {
        request: {
            email: string;
            nickname: string;
            password: string;
        };
        // TODO: To be added
        response: GlobalAPISchema['oauthLogin']['response'];
    };

    /** Get user registration status */
    getUserStatus: {
        request: void;
        response: {
            init: boolean;
        };
    };

    /** Get user information */
    getUserInfo: {
        request: void;
        response: {
            user_id: ApiKey;
            email: string;
            nickname: string;
            is_super_admin: boolean;
            roles: UserType['roles'];
            created_at: number;
            menus: UserMenuType[];
        };
    };
}

/**
 * Global API services (including registration, login, users, etc.)
 */
export default attachAPI<GlobalAPISchema>(client, {
    apis: {
        oauthLogin: {
            method: 'POST',
            path: `${API_PREFIX}/oauth2/token`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        },
        oauthRegister: `POST ${API_PREFIX}/user/register`,
        getUserStatus: `GET ${API_PREFIX}/user/status`,
        getUserInfo: `GET ${API_PREFIX}/user`,
    },
});
