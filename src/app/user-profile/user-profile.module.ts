import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { addInitializeModuleGuard, InitializeModuleGuard, PortalCoreModule } from '@onecx/portal-integration-angular'

import { SharedModule } from '../shared/shared.module'

import { UserProfileComponent } from './user-profile/user-profile.component'
import { AvatarComponent } from './avatar/avatar.component'
import { PersonalInformationComponent } from './personal-information/personal-information.component'
import { LocaleTimezoneComponent } from './locale-timezone/locale-timezone.component'
import { AccountSettingsComponent } from './account-settings/account-settings.component'
import { LayoutThemeComponent } from './layout-theme/layout-theme.component'
import { PrivacySettingsComponent } from './privacy-settings/privacy-settings.component'

const routes: Routes = [
  {
    path: '',
    component: UserProfileComponent,
    pathMatch: 'full'
  }
]
@NgModule({
  declarations: [
    UserProfileComponent,
    PersonalInformationComponent,
    AvatarComponent,
    AccountSettingsComponent,
    LayoutThemeComponent,
    LocaleTimezoneComponent,
    PrivacySettingsComponent
  ],
  imports: [
    PortalCoreModule.forMicroFrontend(),
    [RouterModule.forChild(addInitializeModuleGuard(routes))],
    SharedModule
  ],
  providers: [InitializeModuleGuard],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
})
export class UserProfileModule {
  constructor() {
    console.info('User Profile Module constructor')
  }
}
