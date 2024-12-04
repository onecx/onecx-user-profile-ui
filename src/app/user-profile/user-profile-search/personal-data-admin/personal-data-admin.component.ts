import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'

import { PortalMessageService } from '@onecx/portal-integration-angular'
import { map, Observable, tap } from 'rxjs'
import { UpdateUserPerson, UserPerson, UserProfileAdminAPIService } from 'src/app/shared/generated'

@Component({
  selector: 'app-personal-data-admin',
  templateUrl: './personal-data-admin.component.html'
})
export class PersonalDataAdminComponent implements OnChanges {
  public personalInfo$!: Observable<UserPerson>
  public tenantId: string = ''
  public messages: { [key: string]: string } = {}
  @Input() public displayDetailDialog = false
  @Input() public userProfileId: any
  @Output() public hideDialog = new EventEmitter<boolean>()

  constructor(
    public readonly translate: TranslateService,
    private readonly userProfileAdminService: UserProfileAdminAPIService,
    private readonly msgService: PortalMessageService
  ) {}

  ngOnChanges(): void {
    if (this.userProfileId) {
      this.personalInfo$ = this.userProfileAdminService.getUserProfile({ id: this.userProfileId.toString() }).pipe(
        tap((profile) => (this.tenantId = profile.tenantId ?? '')),
        map((profile) => {
          return profile.person ?? {}
        })
      )
    }
  }

  public onPersonalInfoUpdate(person: UserPerson): void {
    this.userProfileAdminService
      .updateUserProfile({ id: this.userProfileId, updateUserPersonRequest: person as UpdateUserPerson })
      .subscribe({
        next: () => {
          this.showMessage('success')
          this.ngOnChanges()
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
}
