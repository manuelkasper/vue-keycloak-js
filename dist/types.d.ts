import type { KeycloakConfig, KeycloakError, KeycloakInitOptions, KeycloakLoginOptions, KeycloakProfile, KeycloakResourceAccess, KeycloakRoles, KeycloakTokenParsed } from 'keycloak-js';
import Keycloak from 'keycloak-js';
export { KeycloakConfig, KeycloakError, KeycloakInitOptions, Keycloak, KeycloakLoginOptions, KeycloakProfile, KeycloakResourceAccess, KeycloakRoles, KeycloakTokenParsed, };
export interface Vue2Vue3App {
    prototype?: unknown;
    observable?: any;
    config?: any;
    provide?: any;
}
export type VueKeycloakConfig = KeycloakConfig | string;
export interface VueKeycloakOptions {
    config?: VueKeycloakConfig;
    init?: KeycloakInitOptions;
    logout?: any;
    updateInterval?: number;
    onReady?: (keycloak: Keycloak, VueKeycloak?: VueKeycloakInstance) => void;
    onInitError?: (error: Error, err: KeycloakError) => void;
    onAuthLogout?: (keycloak: Keycloak) => void;
    onAuthRefreshError?: (keycloak: Keycloak) => void;
    onAuthRefreshSuccess?: (keycloak: Keycloak) => void;
    onInitSuccess?(authenticated: boolean): void;
}
export interface VueKeycloakTokenParsed extends KeycloakTokenParsed {
    preferred_username?: string;
    name?: string;
}
export interface VueKeycloakInstance {
    ready: boolean;
    authenticated: boolean;
    userName?: string;
    fullName?: string;
    login?(options?: KeycloakLoginOptions): Promise<void>;
    loginFn?(options?: KeycloakLoginOptions): Promise<void>;
    logoutFn?(options?: any): Promise<void> | void;
    createLoginUrl?(options?: KeycloakLoginOptions): string;
    createLogoutUrl?(options?: any): string;
    createRegisterUrl?(options?: KeycloakLoginOptions): string;
    register?(options?: KeycloakLoginOptions): Promise<void>;
    accountManagement?(): Promise<void>;
    createAccountUrl?(): string;
    loadUserProfile?(): Promise<KeycloakProfile>;
    subject?: string;
    idToken?: string;
    idTokenParsed?: VueKeycloakTokenParsed;
    realmAccess?: KeycloakRoles;
    resourceAccess?: KeycloakResourceAccess;
    refreshToken?: string;
    refreshTokenParsed?: VueKeycloakTokenParsed;
    timeSkew?: number;
    responseMode?: string;
    responseType?: string;
    hasRealmRole?(role: string): boolean;
    hasResourceRole?(role: string, resource?: string): boolean;
    token?: string;
    tokenParsed?: VueKeycloakTokenParsed;
    keycloak?: Keycloak;
}
