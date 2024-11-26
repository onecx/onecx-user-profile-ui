import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { InitializeModuleGuard, addInitializeModuleGuard } from '@onecx/angular-integration-interface'

import { PortalCoreModule } from '@onecx/portal-integration-angular'

import { SharedModule } from 'src/app/shared/shared.module'
import { LabelResolver } from 'src/app/shared/label.resolver'

import { AccountSettingsComponent } from './account-settings/account-settings.component'
import { AvatarComponent } from './avatar/avatar.component'
import { LayoutThemeComponent } from './layout-theme/layout-theme.component'
import { LocaleTimezoneComponent } from './locale-timezone/locale-timezone.component'
import { PersonalInfoComponent } from './personal-info/personal-info.component'
import { PersonalInfoUserComponent } from './personal-info-user/personal-info-user.component'
import { PersonalInfoAdminComponent } from './personal-info-admin/personal-info-admin.component'
import { PrivacySettingsComponent } from './privacy-settings/privacy-settings.component'
import { RolesPermissionsComponent } from './roles-permissions/roles-permissions.component'
import { UserProfileSearchComponent } from './user-profile-search/user-profile-search.component'
import { PermissionsDialogComponent } from './user-profile-search/permissions-dialog/permissions-dialog.component'

const routes: Routes = [
  {
    path: '',
    component: PersonalInfoUserComponent,
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
    PersonalInfoUserComponent,
    PersonalInfoAdminComponent,
    PersonalInfoComponent,
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
