import { Component, EventEmitter, Input, Output } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Observable, map, of, tap } from 'rxjs'
import { TranslateService } from '@ngx-translate/core'

import { Action, PortalMessageService } from '@onecx/portal-integration-angular'
import { UpdateUserPerson, UserProfileAPIService, UserPerson } from 'src/app/shared/generated'

@Component({
  selector: 'app-personal-info-user',
  templateUrl: './personal-info-user.component.html'
})
export class PersonalInfoUserComponent {
  @Input() public displayDetailDialog = false
  @Input() public userProfileId: any
  @Output() public hideDialog = new EventEmitter<boolean>()

  public actions$: Observable<Action[]> | undefined
  public personalInfo$!: Observable<UserPerson>
  public tenantId: string = ''
  public messages: { [key: string]: string } = {}

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    public readonly translate: TranslateService,
    private readonly userProfileService: UserProfileAPIService,
    private readonly msgService: PortalMessageService
  ) {
    this.personalInfo$ = this.userProfileService.getMyUserProfile().pipe(
      tap((profile) => (this.tenantId = profile.tenantId!)),
      map((profile) => {
        this.prepareActionButtons()
        return profile.person ?? {}
      })
    )
  }

  public onPersonalInfoUpdate(person: UserPerson): void {
    this.userProfileService.updateUserPerson({ updateUserPerson: person as UpdateUserPerson }).subscribe({
      next: (person) => {
        this.showMessage('success')
        this.personalInfo$ = of(person)
      },
      error: () => {
        this.showMessage('error')
      }
    })
  }

  public showMessage(severity: 'success' | 'error'): void {
    severity === 'success'
      ? this.msgService.success({ summaryKey: 'USER_PROFILE.MSG.SAVE_SUCCESS' })
      : this.msgService.error({ summaryKey: 'USER_PROFILE.MSG.SAVE_ERROR' })
  }

  private prepareActionButtons(): void {
    this.actions$ = this.translate
      .get([
        'SETTINGS.NAVIGATION.LABEL',
        'SETTINGS.NAVIGATION.TOOLTIP',
        'ROLES_PERMISSIONS.NAVIGATION.LABEL',
        'ROLES_PERMISSIONS.NAVIGATION.TOOLTIP'
      ])
      .pipe(
        map((data) => {
          return [
            {
              label: data['SETTINGS.NAVIGATION.LABEL'],
              title: data['SETTINGS.NAVIGATION.TOOLTIP'],
              actionCallback: () => this.router.navigate(['./account'], { relativeTo: this.route }),
              permission: 'ACCOUNT_SETTINGS#VIEW',
              icon: 'pi pi-cog',
              show: 'always'
            },
            {
              label: data['ROLES_PERMISSIONS.NAVIGATION.LABEL'],
              title: data['ROLES_PERMISSIONS.NAVIGATION.TOOLTIP'],
              actionCallback: () => this.router.navigate(['./roles'], { relativeTo: this.route }),
              permission: 'ROLES_PERMISSIONS#VIEW',
              icon: 'pi pi-lock',
              show: 'always'
            }
          ]
        })
      )
  }
}
