import { Component, EventEmitter, Input, Output, OnChanges, inject } from '@angular/core'
import { AsyncPipe } from '@angular/common'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { catchError, finalize, Observable, of, tap } from 'rxjs'

import { ButtonModule } from 'primeng/button'
import { DialogModule } from 'primeng/dialog'
import { MessageModule } from 'primeng/message'
import { TooltipModule } from 'primeng/tooltip'

import { PortalMessageService } from '@onecx/angular-integration-interface'

import { UpdateUserProfileRequest, UserPerson, UserProfile, UserProfileAdminAPIService } from 'src/app/shared/generated'

import { PersonalDataComponent } from 'src/app/shared/personal-data/personal-data.component'

@Component({
  selector: 'app-personal-data-admin',
  standalone: true,
  imports: [
    AsyncPipe,
    ButtonModule,
    DialogModule,
    TranslateModule,
    MessageModule,
    TooltipModule,
    // components
    PersonalDataComponent
  ],
  templateUrl: './personal-data-admin.component.html'
})
export class PersonalDataAdminComponent implements OnChanges {
  public readonly translate = inject(TranslateService)
  public readonly userProfileAdminService = inject(UserProfileAdminAPIService)
  private readonly msgService = inject(PortalMessageService)
  // input
  @Input() public displayPersonalDataDialog = false
  @Input() public userProfileId: string | undefined
  @Output() public hideDialog = new EventEmitter<boolean>()

  public exceptionKey: string | undefined = undefined
  public userProfile$!: Observable<UserProfile | undefined>

  public userId: string | undefined = undefined // needed to get avatar
  public messages: { [key: string]: string } = {}
  public componentInUse = false
  public profile: UserProfile = {}

  public ngOnChanges(): void {
    this.componentInUse = false
    this.getProfile()
  }

  private getProfile() {
    if (this.userProfileId) {
      this.userProfile$ = this.userProfileAdminService.getUserProfile({ id: this.userProfileId }).pipe(
        tap((profile) => {
          this.userId = profile.userId
          this.profile = { ...profile }
        }),
        catchError((err) => {
          this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.PROFILE'
          console.error('getUserProfile', err)
          return of(undefined)
        }),
        finalize(() => (this.componentInUse = true))
      )
    }
  }

  public onUpdatePerson(person: UserPerson): void {
    if (this.userProfileId) {
      const payload = this.getUpdateRequest(person)
      this.userProfileAdminService
        .updateUserProfile({ id: this.userProfileId, updateUserProfileRequest: payload })
        .subscribe({
          next: (profile) => {
            this.showMessage('success')
            this.userProfile$ = new Observable((prof) => prof.next({ ...profile, person: person }))
          },
          error: (err) => {
            this.showMessage('error')
            console.error('updateUserProfile', err)
          }
        })
    }
  }

  public showMessage(severity: 'success' | 'error'): void {
    severity === 'success'
      ? this.msgService.success({ summaryKey: 'USER_PROFILE.MSG.SAVE_SUCCESS' })
      : this.msgService.error({ summaryKey: 'USER_PROFILE.MSG.SAVE_ERROR' })
  }

  public onCloseDialog(): void {
    this.componentInUse = false
    this.displayPersonalDataDialog = false
    this.userProfile$ = of({})
    this.hideDialog.emit(true)
  }

  private getUpdateRequest(person: UserPerson): UpdateUserProfileRequest {
    return {
      modificationCount: this.profile?.modificationCount || 0,
      organization: this.profile?.organization,
      person: person,
      settings: this.profile?.settings
    }
  }
}
