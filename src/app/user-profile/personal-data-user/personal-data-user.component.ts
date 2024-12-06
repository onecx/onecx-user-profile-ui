import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Observable, map, of, tap } from 'rxjs'
import { TranslateService } from '@ngx-translate/core'

import { Action, PortalMessageService } from '@onecx/portal-integration-angular'
import { UpdateUserPerson, UserProfileAPIService, UserPerson } from 'src/app/shared/generated'

@Component({
  selector: 'app-personal-data-user',
  templateUrl: './personal-data-user.component.html'
})
export class PersonalDataUserComponent implements AfterViewInit {
  @Input() public displayPersonalDataDialog = false
  @Input() public userProfileId: any
  @Output() public hideDialog = new EventEmitter<boolean>()

  public exceptionKey: string | undefined = undefined
  public actions$: Observable<Action[]> | undefined
  public userPerson$!: Observable<UserPerson>
  public tenantId: string = ''
  public messages: { [key: string]: string } = {}
  public componentInUse = false

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    public readonly translate: TranslateService,
    private readonly userProfileService: UserProfileAPIService,
    private readonly msgService: PortalMessageService,
    private readonly cdRef: ChangeDetectorRef
  ) {
    this.userPerson$ = this.userProfileService.getMyUserProfile().pipe(
      tap((profile) => (this.tenantId = profile.tenantId!)),
      map((profile) => {
        this.prepareActionButtons()
        return profile.person ?? {}
      })
    )
  }

  public ngAfterViewInit() {
    this.componentInUse = true
    this.cdRef.detectChanges()
  }

  public onpersonUpdate(person: UserPerson): void {
    this.userProfileService.updateUserPerson({ updateUserPerson: person as UpdateUserPerson }).subscribe({
      next: (person) => {
        this.showMessage('success')
        this.userPerson$ = of(person)
      },
      error: (err) => {
        this.showMessage('error')
        this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.PROFILE'
        console.error('updateUserProfile', err)
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
        'USER_PERMISSIONS.NAVIGATION.LABEL',
        'USER_PERMISSIONS.NAVIGATION.TOOLTIP'
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
              label: data['USER_PERMISSIONS.NAVIGATION.LABEL'],
              title: data['USER_PERMISSIONS.NAVIGATION.TOOLTIP'],
              actionCallback: () => this.router.navigate(['./permissions'], { relativeTo: this.route }),
              permission: 'ROLES_PERMISSIONS#VIEW',
              icon: 'pi pi-lock',
              show: 'always'
            }
          ]
        })
      )
  }
}
