import { DoBootstrap, Injector, NgModule, inject, provideAppInitializer } from '@angular/core'
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule, Routes, Router } from '@angular/router'
import { TranslateLoader, TranslateModule, MissingTranslationHandler } from '@ngx-translate/core'

import { AngularAcceleratorModule, providePortalDialogService } from '@onecx/angular-accelerator'
import { AngularAuthModule } from '@onecx/angular-auth'
import {
  createTranslateLoader,
  MultiLanguageMissingTranslationHandler,
  PortalApiConfiguration,
  providePermissionService,
  provideThemeConfig,
  provideTranslationConnectionService,
  provideTranslationPathFromMeta
} from '@onecx/angular-utils'
import { createAppEntrypoint, initializeRouter, startsWith } from '@onecx/angular-webcomponents'
import { AppStateService, ConfigurationService } from '@onecx/angular-integration-interface'
import { SLOT_SERVICE, SlotService } from '@onecx/angular-remote-components'

import { environment } from 'src/environments/environment'
import { Configuration } from './shared/generated'
import { AppEntrypointComponent } from './app-entrypoint.component'
import { LabelResolver } from './shared/label.resolver'

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
  imports: [
    AppEntrypointComponent,
    AngularAcceleratorModule,
    AngularAuthModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    TranslateModule.forRoot({
      isolate: true,
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MultiLanguageMissingTranslationHandler
      }
    })
  ],
  providers: [
    LabelResolver,
    ConfigurationService,
    { provide: Configuration, useFactory: apiConfigProvider },
    { provide: SLOT_SERVICE, useExisting: SlotService },
    provideAppInitializer(() => {
      const router = inject(Router)
      const appStateService = inject(AppStateService)
      return initializeRouter(router, appStateService)()
    }),
    provideHttpClient(withInterceptorsFromDi()),
    providePermissionService(),
    providePortalDialogService(),
    provideThemeConfig(),
    provideTranslationConnectionService(),
    provideTranslationPathFromMeta(import.meta.url, 'assets/i18n/')
  ]
})
export class OneCXUserProfileModule implements DoBootstrap {
  private readonly injector = inject(Injector)

  ngDoBootstrap(): void {
    createAppEntrypoint(AppEntrypointComponent, 'ocx-user-profile-component', this.injector)
  }
}
