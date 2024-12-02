import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core'
import { FormGroup, FormControl } from '@angular/forms'
import { UserService } from '@onecx/portal-integration-angular'

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html'
})
export class PrivacyComponent implements OnInit, OnChanges {
  @Input() hideMyProfile: boolean | undefined = false
  @Output() hideMyProfileChange = new EventEmitter<boolean>()
  @Output() public applyChanges = new EventEmitter<boolean>()

  public changedPrivacySettings = false
  public formGroup: FormGroup

  constructor(private readonly userService: UserService) {
    this.formGroup = new FormGroup({
      hideMyProfile: new FormControl<boolean>(false)
    })
  }

  public ngOnInit(): void {
    if (!this.userService.hasPermission('ACCOUNT_SETTINGS_PRIVACY#EDIT')) this.formGroup.get('hideMyProfile')?.disable()
  }

  public ngOnChanges(): void {
    this.formGroup.get('hideMyProfile')?.setValue(this.hideMyProfile)
  }

  public savePrivacySettings(): void {
    this.changedPrivacySettings = true
    this.hideMyProfileChange.emit(this.formGroup.value)
  }

  public applyChange() {
    this.applyChanges.emit(true)
  }
}
