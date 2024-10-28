/*!
  * vue-keycloak-js v2.4.0
  * @license ISC
  */
'use strict';

var Keycloak = require('keycloak-js');
var vue = require('vue');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var Keycloak__default = /*#__PURE__*/_interopDefaultLegacy(Keycloak);
var vue__namespace = /*#__PURE__*/_interopNamespace(vue);

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

let installed = false;
const KeycloakSymbol = Symbol('keycloak');
var index = {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    install: function (app, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (installed)
                return;
            installed = true;
            const defaultParams = {
                config: window.__BASEURL__ ? `${window.__BASEURL__}/config` : '/config',
                init: { onLoad: 'login-required' },
            };
            const options = Object.assign({}, defaultParams, params);
            if (assertOptions(options).hasError)
                throw new Error(`Invalid options given: ${assertOptions(options).error}`);
            const watch = yield vue2AndVue3Reactive(app, defaultEmptyVueKeycloakInstance());
            getConfig(options.config)
                .then((config) => {
                init(config, watch, options);
            })
                .catch((err) => {
                console.log(err);
            });
        });
    },
    KeycloakSymbol
};
function defaultEmptyVueKeycloakInstance() {
    return {
        ready: false,
        authenticated: false,
        userName: null,
        fullName: null,
        token: null,
        tokenParsed: null,
        logoutFn: null,
        loginFn: null,
        login: null,
        createLoginUrl: null,
        createLogoutUrl: null,
        createRegisterUrl: null,
        register: null,
        accountManagement: null,
        createAccountUrl: null,
        loadUserProfile: null,
        updateToken: null,
        subject: null,
        idToken: null,
        idTokenParsed: null,
        realmAccess: null,
        resourceAccess: null,
        refreshToken: null,
        refreshTokenParsed: null,
        timeSkew: null,
        responseMode: null,
        responseType: null,
        hasRealmRole: null,
        hasResourceRole: null,
        keycloak: null,
    };
}
function vue2AndVue3Reactive(app, object) {
    return new Promise((resolve, reject) => {
        if (app.prototype) {
            // Vue 2
            try {
                const reactiveObj = app.observable(object);
                Object.defineProperty(app.prototype, '$keycloak', {
                    get() {
                        return reactiveObj;
                    }
                });
                resolve(reactiveObj);
            }
            catch (e) {
                reject(e);
            }
        }
        else {
            // Vue 3
            // Assign an object immediately to allow usage of $keycloak in view
            //const vue = await import('vue')
            // Async load module to allow vue 2 to not have the dependency.
            const reactiveObj = vue__namespace.reactive(object);
            // Override the existing reactiveObj so references contains the new reactive values
            app.config.globalProperties.$keycloak = reactiveObj;
            // Use provide/inject in Vue3 apps
            app.provide(KeycloakSymbol, reactiveObj);
            resolve(reactiveObj);
        }
    });
}
function init(config, watch, options) {
    const keycloak = new Keycloak__default["default"](config);
    const { updateInterval } = options;
    keycloak.onReady = function (authenticated) {
        updateWatchVariables(authenticated);
        watch.ready = true;
        typeof options.onReady === 'function' && options.onReady(keycloak, watch);
    };
    keycloak.onAuthSuccess = function () {
        // Check token validity every 10 seconds (10 000 ms) and, if necessary, update the token.
        // Refresh token if it's valid for less than 60 seconds
        const updateTokenInterval = setInterval(() => {
            keycloak.updateToken(60)
                .then((updated) => {
                if (options.init.enableLogging) {
                    if (updated) {
                        console.log('[vue-keycloak-js] Token updated');
                    }
                    else {
                        console.log('[vue-keycloak-js] Token not updated');
                    }
                }
            })
                .catch(error => {
                if (options.init.enableLogging) {
                    console.log('[vue-keycloak-js] Error while updating token: ' + error);
                }
                keycloak.clearToken();
            });
        }, updateInterval !== null && updateInterval !== void 0 ? updateInterval : 10000);
        watch.logoutFn = () => {
            clearInterval(updateTokenInterval);
            keycloak.logout(options.logout);
        };
    };
    keycloak.onAuthRefreshSuccess = function () {
        updateWatchVariables(true);
        typeof options.onAuthRefreshSuccess === 'function' &&
            options.onAuthRefreshSuccess(keycloak);
    };
    keycloak.onAuthRefreshError = function () {
        updateWatchVariables(false);
        typeof options.onAuthRefreshError === 'function' &&
            options.onAuthRefreshError(keycloak);
    };
    keycloak.onAuthLogout = function () {
        updateWatchVariables(false);
        typeof options.onAuthLogout === 'function' &&
            options.onAuthLogout(keycloak);
    };
    keycloak
        .init(options.init)
        .then((authenticated) => {
        updateWatchVariables(authenticated);
        typeof options.onInitSuccess === 'function' &&
            options.onInitSuccess(authenticated);
    })
        .catch((err) => {
        updateWatchVariables(false);
        const error = Error('Failure during initialization of keycloak-js adapter');
        typeof options.onInitError === 'function'
            ? options.onInitError(error, err)
            : console.error(error, err);
    });
    function updateWatchVariables(isAuthenticated = false) {
        watch.authenticated = isAuthenticated;
        watch.loginFn = keycloak.login;
        watch.login = keycloak.login;
        watch.createLoginUrl = keycloak.createLoginUrl;
        watch.createLogoutUrl = keycloak.createLogoutUrl;
        watch.createRegisterUrl = keycloak.createRegisterUrl;
        watch.register = keycloak.register;
        watch.keycloak = keycloak;
        if (isAuthenticated) {
            watch.accountManagement = keycloak.accountManagement;
            watch.createAccountUrl = keycloak.createAccountUrl;
            watch.hasRealmRole = keycloak.hasRealmRole;
            watch.hasResourceRole = keycloak.hasResourceRole;
            watch.loadUserProfile = keycloak.loadUserProfile;
            watch.updateToken = keycloak.updateToken;
            watch.token = keycloak.token;
            watch.subject = keycloak.subject;
            watch.idToken = keycloak.idToken;
            watch.idTokenParsed = keycloak.idTokenParsed;
            watch.realmAccess = keycloak.realmAccess;
            watch.resourceAccess = keycloak.resourceAccess;
            watch.refreshToken = keycloak.refreshToken;
            watch.refreshTokenParsed = keycloak.refreshTokenParsed;
            watch.timeSkew = keycloak.timeSkew;
            watch.responseMode = keycloak.responseMode;
            watch.responseType = keycloak.responseType;
            watch.tokenParsed = keycloak.tokenParsed;
            watch.userName = keycloak.tokenParsed['preferred_username'];
            watch.fullName = keycloak.tokenParsed['name'];
        }
    }
}
function assertOptions(options) {
    const { config, init, onReady, onInitError, onAuthRefreshError, onAuthLogout } = options;
    if (typeof config !== 'string' && !_isObject(config)) {
        return {
            hasError: true,
            error: `'config' option must be a string or an object. Found: '${config}'`,
        };
    }
    if (!_isObject(init) || typeof init.onLoad !== 'string') {
        return {
            hasError: true,
            error: `'init' option must be an object with an 'onLoad' property. Found: '${init}'`,
        };
    }
    if (onReady && typeof onReady !== 'function') {
        return {
            hasError: true,
            error: `'onReady' option must be a function. Found: '${onReady}'`,
        };
    }
    if (onInitError && typeof onInitError !== 'function') {
        return {
            hasError: true,
            error: `'onInitError' option must be a function. Found: '${onInitError}'`,
        };
    }
    if (onAuthRefreshError && typeof onAuthRefreshError !== 'function') {
        return {
            hasError: true,
            error: `'onAuthRefreshError' option must be a function. Found: '${onAuthRefreshError}'`,
        };
    }
    if (onAuthLogout && typeof onAuthLogout !== 'function') {
        return {
            hasError: true,
            error: `'onAuthLogout' option must be a function. Found: '${onAuthLogout}'`,
        };
    }
    return {
        hasError: false,
        error: null,
    };
}
function _isObject(obj) {
    return (obj !== null &&
        typeof obj === 'object' &&
        Object.prototype.toString.call(obj) !== '[object Array]');
}
function getConfig(config) {
    if (_isObject(config))
        return Promise.resolve(config);
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', config);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                }
                else {
                    reject(Error(xhr.statusText));
                }
            }
        };
        xhr.send();
    });
}

module.exports = index;
