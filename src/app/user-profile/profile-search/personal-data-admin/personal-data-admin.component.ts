import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { catchError, finalize, map, Observable, of, tap } from 'rxjs'

import { PortalMessageService } from '@onecx/portal-integration-angular'

import { UpdateUserPerson, UserPerson, UserProfileAdminAPIService } from 'src/app/shared/generated'

@Component({
  selector: 'app-personal-data-admin',
  templateUrl: './personal-data-admin.component.html'
})
export class PersonalDataAdminComponent implements OnChanges {
  @Input() public displayPersonalDataDialog = false
  @Input() public userProfileId: string | undefined
  @Output() public hideDialog = new EventEmitter<boolean>()

  public exceptionKey: string | undefined = undefined
  public userPerson$!: Observable<UserPerson>

  public userId: string | undefined = undefined // needed to get avatar
  public tenantId: string = ''
  public messages: { [key: string]: string } = {}
  public componentInUse = false

  constructor(
    public readonly translate: TranslateService,
    public readonly userProfileAdminService: UserProfileAdminAPIService,
    private readonly msgService: PortalMessageService
  ) {}

  public ngOnChanges(): void {
    this.componentInUse = false
    this.getProfile()
  }

  private getProfile() {
    if (this.userProfileId)
      this.userPerson$ = this.userProfileAdminService.getUserProfile({ id: this.userProfileId }).pipe(
        tap((profile) => {
          this.tenantId = profile.tenantId ?? ''
          this.userId = profile.userId
        }),
        map((profile) => {
          return profile.person ?? {}
        }),
        catchError((err) => {
          this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.PROFILE'
          console.error('getUserProfile', err)
          return of({} as UserPerson)
        }),
        finalize(() => (this.componentInUse = true))
      )
  }

  public onUpdatePerson(person: UserPerson): void {
    if (this.userProfileId)
      this.userProfileAdminService
        .updateUserProfile({ id: this.userProfileId, updateUserPersonRequest: person as UpdateUserPerson })
        .subscribe({
          next: (profile) => {
            this.showMessage('success')
            this.userPerson$ = new Observable((person) => person.next(profile.person))
          },
          error: (err) => {
            this.showMessage('error')
            console.error('updateUserProfile', err)
          }
        })
  }

  public showMessage(severity: 'success' | 'error'): void {
    severity === 'success'
      ? this.msgService.success({ summaryKey: 'USER_PROFILE.MSG.SAVE_SUCCESS' })
      : this.msgService.error({ summaryKey: 'USER_PROFILE.MSG.SAVE_ERROR' })
  }

  public onCloseDialog(): void {
    this.hideDialog.emit(true)
    this.displayPersonalDataDialog = false
  }
}
