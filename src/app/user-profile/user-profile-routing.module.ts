import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { RolePermissionsComponent } from './roles-permissions/roles-permissions.component'
import { AccountSettingsComponent } from './account-settings/account-settings.component'
import { UserProfileComponent } from './user-profile/user-profile.component'
import { CanActivateGuard } from '../shared/can-active-guard.service'
import { LabelResolver } from '../shared/label.resolver'

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'profile' },
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [CanActivateGuard],
    data: {
      breadcrumb: 'PROFILE.BREADCRUMBS.PROFILE',
      breadcrumbFn: (data: any) => `${data.labeli18n}`
    },
    resolve: {
      labeli18n: LabelResolver
    }
  },
  {
    path: 'settings',
    component: AccountSettingsComponent,
    canActivate: [CanActivateGuard],
    data: {
      breadcrumb: 'PROFILE.BREADCRUMBS.SETTINGS',
      breadcrumbFn: (data: any) => `${data.labeli18n}`
    },
    resolve: {
      labeli18n: LabelResolver
    }
  },
  {
    path: 'roles-and-perms',
    component: RolePermissionsComponent,
    canActivate: [CanActivateGuard],
    data: {
      breadcrumb: 'PROFILE.BREADCRUMBS.PERMISSIONS',
      breadcrumbFn: (data: any) => `${data.labeli18n}`
    },
    resolve: {
      labeli18n: LabelResolver
    }
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class UserProfileRoutingModule {}
