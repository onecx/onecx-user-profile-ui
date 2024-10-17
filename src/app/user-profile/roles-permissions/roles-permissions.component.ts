import { Component } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'

import { Action } from '@onecx/portal-integration-angular'

import { UserProfileAPIService, UserPerson } from 'src/app/shared/generated'
import { Observable, map } from 'rxjs'
import { SlotService } from '@onecx/angular-remote-components'

@Component({
  selector: 'app-roles-permissions',
  templateUrl: './roles-permissions.component.html',
  styleUrls: ['./roles-permissions.component.scss']
})
export class RolesPermissionsComponent {
  public personalInfo$: Observable<UserPerson> | undefined
  public isUserRolesAndPermissionsComponentDefined$: Observable<boolean> | undefined
  public userRolesAndPermissionsSlotName = 'onecx-user-profile-permissions'
  public actions$: Observable<Action[]> | undefined

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly translate: TranslateService,
    private readonly userProfileService: UserProfileAPIService,
    private readonly slotService: SlotService
  ) {
    this.personalInfo$ = this.userProfileService.getMyUserProfile().pipe(
      map((profile) => {
        this.prepareActionButtons()
        return profile.person || {}
      })
    )
    this.isUserRolesAndPermissionsComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(
      this.userRolesAndPermissionsSlotName
    )
  }
  private prepareActionButtons(): void {
    this.actions$ = this.translate
      .get([
        'SETTINGS.NAVIGATION.LABEL',
        'SETTINGS.NAVIGATION.TOOLTIP',
        'USER_PROFILE.NAVIGATION.LABEL',
        'USER_PROFILE.NAVIGATION.TOOTIP'
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
