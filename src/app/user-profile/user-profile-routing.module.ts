import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { AccountSettingsComponent } from './account-settings/account-settings.component'
import { UserProfileComponent } from './user-profile/user-profile.component'
import { LabelResolver } from '../shared/label.resolver'

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'profile' },
  {
    path: 'profile',
    component: UserProfileComponent,
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
    data: {
      breadcrumb: 'PROFILE.BREADCRUMBS.SETTINGS',
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
