// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  KEYCLOAK_CLIENT_ID: 'tkit-angular-example',
  KEYCLOAK_URL: 'http://keycloak-app/',
  KEYCLOAK_REALM: 'OneCX',
  skipRemoteConfigLoad: true,
  apiPrefix: 'bff',
  DEFAULT_LOGO_PATH: '/assets/images/default_avatar.png',
  AVATAR_SIZE_LARGE: 100000,
  AVATAR_SIZE_MEDIUM: 50000,
  AVATAR_SIZE_SMALL: 10000
}
