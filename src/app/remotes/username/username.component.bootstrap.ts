import { importProvidersFrom } from '@angular/core'
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MissingTranslationHandler, TranslateLoader } from '@ngx-translate/core'

import { AngularAcceleratorModule, AngularAcceleratorMissingTranslationHandler } from '@onecx/angular-accelerator'
import { AngularAuthModule } from '@onecx/angular-auth'
import { provideTranslateServiceForRoot } from '@onecx/angular-remote-components'
import { createTranslateLoader, provideThemeConfig, provideTranslationPathFromMeta } from '@onecx/angular-utils'
import { bootstrapRemoteComponent } from '@onecx/angular-webcomponents'

import { environment } from 'src/environments/environment'

import { OneCXUsernameComponent } from './username.component'

bootstrapRemoteComponent(OneCXUsernameComponent, 'ocx-username-component', environment.production, [
  provideHttpClient(withInterceptorsFromDi()),
  importProvidersFrom(AngularAcceleratorModule, AngularAuthModule, BrowserAnimationsModule),
  provideTranslateServiceForRoot({
    isolate: true,
    loader: {
      provide: TranslateLoader,
      useFactory: createTranslateLoader,
      deps: [HttpClient]
    },
    missingTranslationHandler: {
      provide: MissingTranslationHandler,
      useClass: AngularAcceleratorMissingTranslationHandler
    }
  }),
  provideTranslationPathFromMeta(import.meta.url, 'assets/i18n/'),
  provideThemeConfig()
])
