import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import { UserService } from '@onecx/portal-integration-angular'

@Component({
  selector: 'app-privacy-settings',
  templateUrl: './privacy-settings.component.html'
})
export class PrivacySettingsComponent implements OnInit {
  @Input() privacySettings: boolean | undefined
  @Output() privacySettingsChange = new EventEmitter<boolean>()
  @Output() public applyChanges = new EventEmitter<boolean>()

  public changedPrivacySettings = false
  public formGroup: UntypedFormGroup

  constructor(private userService: UserService) {
    this.formGroup = new UntypedFormGroup({
      hideMyProfile: new UntypedFormControl()
    })
  }

  public ngOnInit(): void {
    if (!this.userService.hasPermission('ACCOUNT_SETTINGS_PRIVACY#EDIT')) this.formGroup.get('hideMyProfile')?.disable()
  }

  public savePrivacySettings(): void {
    this.changedPrivacySettings = true
    this.privacySettingsChange.emit(this.formGroup.value)
  }

  public applyChange() {
    this.applyChanges.emit(true)
  }
}
