import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'

import { addInitializeModuleGuard, InitializeModuleGuard, PortalCoreModule } from '@onecx/portal-integration-angular'

import { SharedModule } from 'src/app/shared/shared.module'

import { UserProfileComponent } from 'src/app/user-profile/user-profile/user-profile.component'
import { AvatarComponent } from 'src/app/user-profile/avatar/avatar.component'
import { PersonalInformationComponent } from 'src/app/user-profile/personal-information/personal-information.component'
import { LocaleTimezoneComponent } from 'src/app/user-profile/locale-timezone/locale-timezone.component'
import { AccountSettingsComponent } from 'src/app/user-profile/account-settings/account-settings.component'
import { LayoutThemeComponent } from 'src/app/user-profile/layout-theme/layout-theme.component'
import { PrivacySettingsComponent } from 'src/app/user-profile/privacy-settings/privacy-settings.component'

const routes: Routes = [
  {
    path: '',
    component: UserProfileComponent,
    pathMatch: 'full'
  },
  {
    path: 'account',
    component: AccountSettingsComponent,
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
    CommonModule,
    FormsModule,
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
