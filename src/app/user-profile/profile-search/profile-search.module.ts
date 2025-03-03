import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { addInitializeModuleGuard, InitializeModuleGuard } from '@onecx/angular-integration-interface'
import { PortalCoreModule } from '@onecx/portal-integration-angular'

import { SharedModule } from 'src/app/shared/shared.module'

import { ProfileSearchComponent } from './profile-search.component'
import { PersonalDataAdminComponent } from './personal-data-admin/personal-data-admin.component'
import { UserPermissionsAdminComponent } from './user-permissions-admin/user-permissions-admin.component'

const routes: Routes = [
  {
    path: '',
    component: ProfileSearchComponent
  }
]
@NgModule({
  declarations: [ProfileSearchComponent, PersonalDataAdminComponent, UserPermissionsAdminComponent],
  imports: [
    PortalCoreModule.forMicroFrontend(),
    [RouterModule.forChild(addInitializeModuleGuard(routes))],
    SharedModule
  ],
  providers: [InitializeModuleGuard]
})
export class ProfileSearchModule {
  constructor() {
    console.info('Profile Search Module constructor')
  }
}
