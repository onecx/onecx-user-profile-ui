import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { InitializeModuleGuard, addInitializeModuleGuard } from '@onecx/angular-integration-interface'

import { PortalCoreModule } from '@onecx/portal-integration-angular'

import { SharedModule } from 'src/app/shared/shared.module'

import { AccountSettingsComponent } from 'src/app/user-profile/account-settings/account-settings.component'
import { AvatarComponent } from 'src/app/user-profile/avatar/avatar.component'
import { LayoutThemeComponent } from 'src/app/user-profile/layout-theme/layout-theme.component'
import { LocaleTimezoneComponent } from 'src/app/user-profile/locale-timezone/locale-timezone.component'
import { PrivacySettingsComponent } from 'src/app/user-profile/privacy-settings/privacy-settings.component'
import { UserProfileDetailComponent } from 'src/app/user-profile/user-profile-detail/user-profile-detail.component'
import { RolesPermissionsComponent } from './roles-permissions/roles-permissions.component'
import { UserProfileSearchComponent } from './user-profile-search/user-profile-search.component'
import { LabelResolver } from '../shared/label.resolver'

const routes: Routes = [
  {
    path: '',
    component: UserProfileDetailComponent,
    pathMatch: 'full'
  },
  {
    path: 'account',
    component: AccountSettingsComponent,
    pathMatch: 'full'
  },
  {
    path: 'search',
    component: UserProfileSearchComponent,
    pathMatch: 'full',
    data: {
      breadcrumb: 'BREADCRUMBS.SEARCH',
      breadcrumbFn: (data: any) => `${data.labeli18n}`
    },
    resolve: {
      labeli18n: LabelResolver
    }
  },
  {
    path: 'roles-and-perms',
    component: RolesPermissionsComponent,
    pathMatch: 'full'
  }
]
@NgModule({
  declarations: [
    UserProfileDetailComponent,
    AvatarComponent,
    AccountSettingsComponent,
    LayoutThemeComponent,
    LocaleTimezoneComponent,
    PrivacySettingsComponent,
    UserProfileSearchComponent,
    RolesPermissionsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PortalCoreModule.forMicroFrontend(),
    [RouterModule.forChild(addInitializeModuleGuard(routes))],
    SharedModule
  ],
  providers: [InitializeModuleGuard]
})
export class UserProfileModule {
  constructor() {
    console.info('User Profile Module constructor')
  }
}
