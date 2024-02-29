import { Inject, NgModule } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core'

import { MfeInfo, MFE_INFO, MyMissingTranslationHandler, PortalCoreModule } from '@onecx/portal-integration-angular'

import { HttpLoaderFactory, SharedModule } from '../shared/shared.module'

import { UserProfileComponent } from './user-profile/user-profile.component'
import { UserProfileRoutingModule } from './user-profile-routing.module'
import { AvatarComponent } from './avatar/avatar.component'
import { PersonalInformationComponent } from './personal-information/personal-information.component'
import { RolePermissionsComponent } from './roles-permissions/roles-permissions.component'
import { LocaleTimezoneComponent } from './locale-timezone/locale-timezone.component'
import { AccountSettingsComponent } from './account-settings/account-settings.component'
import { LayoutThemeComponent } from './layout-theme/layout-theme.component'
import { PrivacySettingsComponent } from './privacy-settings/privacy-settings.component'
import { PreferencesSettingsComponent } from './preferences-settings/preferences-settings.component'

@NgModule({
  declarations: [
    UserProfileComponent,
    PersonalInformationComponent,
    RolePermissionsComponent,
    AvatarComponent,
    AccountSettingsComponent,
    LocaleTimezoneComponent,
    PrivacySettingsComponent,
    LayoutThemeComponent,
    PreferencesSettingsComponent
  ],
  imports: [
    UserProfileRoutingModule,
    TranslateModule.forRoot({
      isolate: true,
      loader: { provide: TranslateLoader, useFactory: HttpLoaderFactory, deps: [HttpClient, MFE_INFO] },
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: MyMissingTranslationHandler }
    }),
    PortalCoreModule.forMicroFrontend(),
    SharedModule
  ],

  providers: []
})
export class UserProfileModule {
  constructor(@Inject(MFE_INFO) mfeInfo: MfeInfo) {
    console.log(`User Profile Module constructor ${JSON.stringify(mfeInfo)}`)
  }
}
