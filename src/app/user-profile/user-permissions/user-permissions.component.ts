import { Component, inject } from '@angular/core'
import { AsyncPipe } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { Observable, map } from 'rxjs'

import { MessageModule } from 'primeng/message'

import { SlotService } from '@onecx/angular-remote-components'
import { Action, AngularAcceleratorModule } from '@onecx/angular-accelerator'
import { PortalPageComponent } from '@onecx/angular-utils'

import { UserProfileAPIService, UserPerson } from 'src/app/shared/generated'

@Component({
  selector: 'app-user-permissions',
  standalone: true,
  imports: [AsyncPipe, AngularAcceleratorModule, MessageModule, PortalPageComponent, TranslateModule],
  templateUrl: './user-permissions.component.html',
  styleUrls: ['./user-permissions.component.scss']
})
export class UserPermissionsComponent {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly translate = inject(TranslateService)
  private readonly userProfileService = inject(UserProfileAPIService)
  private readonly slotService = inject(SlotService)
  // data
  public userRolesAndPermissionsSlotName = 'onecx-user-profile-permissions'
  public actions$: Observable<Action[]> | undefined
  public isUserRolesAndPermissionsComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(
    this.userRolesAndPermissionsSlotName
  )
  public personalInfo$ = this.userProfileService.getMyUserProfile().pipe(
    map((profile) => {
      this.prepareActionButtons()
      return profile.person ?? {}
    })
  )

  private prepareActionButtons(): void {
    this.actions$ = this.translate
      .get([
        'SETTINGS.NAVIGATION.LABEL',
        'SETTINGS.NAVIGATION.TOOLTIP',
        'USER_PROFILE.NAVIGATION.LABEL',
        'USER_PROFILE.NAVIGATION.TOOLTIP'
      ])
      .pipe(
        map((data) => {
          return [
            {
              label: data['USER_PROFILE.NAVIGATION.LABEL'],
              title: data['USER_PROFILE.NAVIGATION.TOOLTIP'],
              actionCallback: () => this.router.navigate(['../'], { relativeTo: this.route }),
              permission: 'USERPROFILE#VIEW',
              icon: 'pi pi-user',
              show: 'always'
            },
            {
              label: data['SETTINGS.NAVIGATION.LABEL'],
              title: data['SETTINGS.NAVIGATION.TOOLTIP'],
              actionCallback: () => this.router.navigate(['../account'], { relativeTo: this.route }),
              permission: 'ACCOUNT_SETTINGS#VIEW',
              icon: 'pi pi-cog',
              show: 'always'
            }
          ]
        })
      )
  }
}
