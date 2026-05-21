import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { AngularAcceleratorModule } from '@onecx/angular-accelerator'
import { PortalPageComponent, provideThemeConfig, provideTranslationConnectionService } from '@onecx/angular-utils'

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
  imports: [AngularAcceleratorModule, PortalPageComponent, RouterModule.forChild(routes), SharedModule],
  providers: [provideThemeConfig(), provideTranslationConnectionService()]
})
export class ProfileSearchModule {
  constructor() {
    console.info('Profile Search Module constructor')
  }
}
