import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { PortalPageComponent } from '@onecx/angular-utils'

import { ProfileSearchComponent } from './profile-search.component'
import { PersonalDataAdminComponent } from './personal-data-admin/personal-data-admin.component'
import { UserPermissionsAdminComponent } from './user-permissions-admin/user-permissions-admin.component'

const routes: Routes = [
  {
    path: '',
    component: ProfileSearchComponent,
    pathMatch: 'full'
  }
]
@NgModule({
  imports: [
    PersonalDataAdminComponent,
    PortalPageComponent,
    ProfileSearchComponent,
    RouterModule.forChild(routes),
    UserPermissionsAdminComponent
  ],
  providers: []
})
export class ProfileSearchModule {}
