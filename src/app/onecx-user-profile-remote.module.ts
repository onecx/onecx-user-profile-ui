import { DoBootstrap, Injector, NgModule, inject, provideAppInitializer } from '@angular/core'
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule, Routes, Router } from '@angular/router'
import { TranslateLoader, TranslateModule, MissingTranslationHandler } from '@ngx-translate/core'

import {
  AngularAcceleratorMissingTranslationHandler,
  AngularAcceleratorModule,
  providePortalDialogService
} from '@onecx/angular-accelerator'
import { AngularAuthModule } from '@onecx/angular-auth'
import {
  PortalApiConfiguration,
  createTranslateLoader,
  providePermissionService,
  provideThemeConfig,
  provideTranslationConnectionService,
  provideTranslationPathFromMeta
} from '@onecx/angular-utils'
import { createAppEntrypoint, initializeRouter, startsWith } from '@onecx/angular-webcomponents'
import { AppStateService, ConfigurationService } from '@onecx/angular-integration-interface'
import { SLOT_SERVICE, SlotService } from '@onecx/angular-remote-components'

import { Configuration } from './shared/generated'
import { environment } from 'src/environments/environment'
import { AppEntrypointComponent } from './app-entrypoint.component'

function apiConfigProvider() {
  return new PortalApiConfiguration(Configuration, environment.apiPrefix)
}

const routes: Routes = [
  {
    matcher: startsWith(''),
    loadChildren: () => import('./user-profile/user-profile.module').then((m) => m.UserProfileModule)
  }
]
@NgModule({
  declarations: [AppEntrypointComponent],
  imports: [
    AngularAuthModule,
    BrowserModule,
    BrowserAnimationsModule,
    AngularAcceleratorModule,
    RouterModule.forRoot(routes),
    TranslateModule.forRoot({
      isolate: true,
      loader: { provide: TranslateLoader, useFactory: createTranslateLoader, deps: [HttpClient] },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: AngularAcceleratorMissingTranslationHandler
      }
    })
  ],
  providers: [
    ConfigurationService,
    { provide: Configuration, useFactory: apiConfigProvider },
    { provide: SLOT_SERVICE, useExisting: SlotService },
    provideAppInitializer(() => {
      const router = inject(Router)
      const appStateService = inject(AppStateService)
      return initializeRouter(router, appStateService)()
    }),
    providePermissionService(),
    provideThemeConfig(),
    provideTranslationConnectionService(),
    provideTranslationPathFromMeta(import.meta.url, 'assets/i18n/'),
    provideHttpClient(withInterceptorsFromDi()),
    providePortalDialogService()
  ]
})
export class OneCXUserProfileModule implements DoBootstrap {
  constructor(private readonly injector: Injector) {
    console.info('OneCX User Profile Module constructor')
  }

  ngDoBootstrap(): void {
    createAppEntrypoint(AppEntrypointComponent, 'ocx-user-profile-component', this.injector)
  }
}
