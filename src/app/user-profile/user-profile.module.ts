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
import { PersonalInformationComponent } from 'src/app/user-profile/personal-information/personal-information.component'
import { PrivacySettingsComponent } from 'src/app/user-profile/privacy-settings/privacy-settings.component'
import { UserProfileDetailComponent } from 'src/app/user-profile/user-profile-detail/user-profile-detail.component'
import { UserProfileAdminComponent } from 'src/app/user-profile/user-profile-admin/user-profile-admin.component'
import { RolesPermissionsComponent } from './roles-permissions/roles-permissions.component'
import { UserProfileSearchComponent } from './user-profile-search/user-profile-search.component'
import { LabelResolver } from '../shared/label.resolver'
import { PermissionsDialogComponent } from './user-profile-search/permissions-dialog/permissions-dialog.component'

const routes: Routes = [
  {
    path: '',
    component: UserProfileDetailComponent,
    pathMatch: 'full',
    data: {
      breadcrumb: 'BREADCRUMBS.PROFILE',
      breadcrumbFn: (data: any) => `${data.labeli18n}`
    },
    resolve: {
      labeli18n: LabelResolver
    }
  },
  {
    path: 'account',
    component: AccountSettingsComponent,
    pathMatch: 'full',
    data: {
      breadcrumb: 'BREADCRUMBS.SETTINGS',
      breadcrumbFn: (data: any) => `${data.labeli18n}`
    },
    resolve: {
      labeli18n: LabelResolver
    }
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
    pathMatch: 'full',
    data: {
      breadcrumb: 'BREADCRUMBS.ROLES_PERMISSIONS',
      breadcrumbFn: (data: any) => `${data.labeli18n}`
    },
    resolve: {
      labeli18n: LabelResolver
    }
  },
  {
    path: 'permissions',
    component: RolesPermissionsComponent,
    pathMatch: 'full',
    data: {
      breadcrumb: 'BREADCRUMBS.ROLES_PERMISSIONS',
      breadcrumbFn: (data: any) => `${data.labeli18n}`
    },
    resolve: {
      labeli18n: LabelResolver
    }
  },
  {
    path: 'roles',
    component: RolesPermissionsComponent,
    pathMatch: 'full',
    data: {
      breadcrumb: 'BREADCRUMBS.ROLES_PERMISSIONS',
      breadcrumbFn: (data: any) => `${data.labeli18n}`
    },
    resolve: {
      labeli18n: LabelResolver
    }
  }
]
@NgModule({
  declarations: [
    UserProfileSearchComponent,
    UserProfileDetailComponent,
    UserProfileAdminComponent,
    PersonalInformationComponent,
    AvatarComponent,
    AccountSettingsComponent,
    LayoutThemeComponent,
    LocaleTimezoneComponent,
    PrivacySettingsComponent,
    RolesPermissionsComponent,
    PermissionsDialogComponent
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
