import { HttpClient, HttpClientModule } from '@angular/common/http'
import { APP_INITIALIZER, DoBootstrap, Injector, NgModule } from '@angular/core'
import { createCustomElement } from '@angular/elements'
import { Router, RouterModule, Routes } from '@angular/router'
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { SLOT_SERVICE, SlotService } from '@onecx/angular-remote-components'
import { addInitializeModuleGuard } from '@onecx/angular-integration-interface'

import {
  AppStateService,
  ConfigurationService,
  createTranslateLoader,
  MFE_ID,
  PortalApiConfiguration,
  PortalCoreModule,
  PortalMissingTranslationHandler
} from '@onecx/portal-integration-angular'
import { startsWith, initializeRouter } from '@onecx/angular-webcomponents'
import { AngularAuthModule } from '@onecx/angular-auth'
import { AppEntrypointComponent } from './app-entrypoint.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { BrowserModule } from '@angular/platform-browser'
import { Configuration } from './shared/generated'
import { environment } from 'src/environments/environment'

export function apiConfigProvider(configService: ConfigurationService, appStateService: AppStateService) {
  return new PortalApiConfiguration(Configuration, environment.apiPrefix, configService, appStateService)
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
    BrowserModule,
    BrowserAnimationsModule,
    AngularAuthModule,
    HttpClientModule,
    PortalCoreModule.forMicroFrontend(),
    RouterModule.forRoot(addInitializeModuleGuard(routes)),
    TranslateModule.forRoot({
      isolate: true,
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient, AppStateService, MFE_ID]
      },
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: PortalMissingTranslationHandler }
    })
  ],
  exports: [],
  providers: [
    ConfigurationService,
    {
      provide: SLOT_SERVICE,
      useExisting: SlotService
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeRouter,
      multi: true,
      deps: [Router, AppStateService]
    },
    { provide: Configuration, useFactory: apiConfigProvider, deps: [ConfigurationService, AppStateService] },
    {
      provide: MFE_ID,
      useValue: 'onecx-user-profile'
    }
  ],
  schemas: []
})
export class OneCXUserProfileModule implements DoBootstrap {
  constructor(private injector: Injector) {
    console.info('OneCX User Profile Module constructor')
  }

  ngDoBootstrap(): void {
    const appEntrypoint = createCustomElement(AppEntrypointComponent, {
      injector: this.injector
    })
    customElements.define('ocx-user-profile-component', appEntrypoint)
  }
}
