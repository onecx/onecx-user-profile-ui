import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core'
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import {
  AUTH_SERVICE,
  IAuthService,
  UserProfileAccountSettingsPrivacySettings
} from '@onecx/portal-integration-angular'

@Component({
  selector: 'app-privacy-settings',
  templateUrl: './privacy-settings.component.html'
})
export class PrivacySettingsComponent implements OnInit {
  @Input() privacySettings: UserProfileAccountSettingsPrivacySettings | undefined
  @Output() privacySettingsChange = new EventEmitter<UserProfileAccountSettingsPrivacySettings>()
  @Output() public applyChanges = new EventEmitter<boolean>()

  public changedPrivacySettings = false
  public formGroup: UntypedFormGroup

  constructor(@Inject(AUTH_SERVICE) public authService: IAuthService) {
    this.formGroup = new UntypedFormGroup({
      hideMyProfile: new UntypedFormControl()
    })
  }

  public ngOnInit(): void {
    if (!this.authService.hasPermission('ACCOUNT_SETTINGS_PRIVACY#EDIT')) this.formGroup.get('hideMyProfile')?.disable()
  }

  public savePrivacySettings(): void {
    this.changedPrivacySettings = true
    this.privacySettingsChange.emit(this.formGroup.value)
  }

  public applyChange() {
    this.applyChanges.emit(true)
  }
}
