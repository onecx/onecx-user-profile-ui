import { HttpClient } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { SLOT_SERVICE, SlotService } from '@onecx/angular-remote-components'

import {
  addInitializeModuleGuard,
  AppStateService,
  ConfigurationService,
  createTranslateLoader,
  PortalCoreModule,
  PortalMissingTranslationHandler
} from '@onecx/portal-integration-angular'

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./user-profile/user-profile.module').then((m) => m.UserProfileModule)
  }
]
@NgModule({
  imports: [
    PortalCoreModule.forMicroFrontend(),
    RouterModule.forChild(addInitializeModuleGuard(routes)),
    TranslateModule.forRoot({
      isolate: true,
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient, AppStateService]
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
    }
  ],
  schemas: []
})
export class OneCXUserProfileModule {
  constructor() {
    console.info('OneCX User Profile Module constructor')
  }
}
