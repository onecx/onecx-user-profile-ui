import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { InitializeModuleGuard, addInitializeModuleGuard } from '@onecx/angular-integration-interface'

import { PortalCoreModule } from '@onecx/portal-integration-angular'

import { SharedModule } from 'src/app/shared/shared.module'
import { LabelResolver } from 'src/app/shared/label.resolver'

import { PersonalDataUserComponent } from './personal-data-user/personal-data-user.component'
import { AccountSettingsComponent } from './account-settings/account-settings.component'
import { LayoutThemeComponent } from './layout-theme/layout-theme.component'
import { LocaleTimezoneComponent } from './locale-timezone/locale-timezone.component'
import { PrivacyComponent } from './privacy/privacy.component'
import { UserPermissionsComponent } from './user-permissions/user-permissions.component'

const routes: Routes = [
  {
    path: '',
    component: PersonalDataUserComponent,
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
    loadChildren: () => import('./profile-search/profile-search.module').then((m) => m.ProfileSearchModule),
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
    component: UserPermissionsComponent,
    pathMatch: 'full',
    data: {
      breadcrumb: 'BREADCRUMBS.USER_PERMISSIONS',
      breadcrumbFn: (data: any) => `${data.labeli18n}`
    },
    resolve: {
      labeli18n: LabelResolver
    }
  },
  {
    path: 'permissions',
    component: UserPermissionsComponent,
    pathMatch: 'full',
    data: {
      breadcrumb: 'BREADCRUMBS.USER_PERMISSIONS',
      breadcrumbFn: (data: any) => `${data.labeli18n}`
    },
    resolve: {
      labeli18n: LabelResolver
    }
  },
  {
    path: 'roles',
    component: UserPermissionsComponent,
    pathMatch: 'full',
    data: {
      breadcrumb: 'BREADCRUMBS.USER_PERMISSIONS',
      breadcrumbFn: (data: any) => `${data.labeli18n}`
    },
    resolve: {
      labeli18n: LabelResolver
    }
  }
]
@NgModule({
  declarations: [
    PersonalDataUserComponent,
    AccountSettingsComponent,
    LayoutThemeComponent,
    LocaleTimezoneComponent,
    PrivacyComponent,
    UserPermissionsComponent
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
