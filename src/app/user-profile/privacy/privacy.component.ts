import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'

import { ButtonModule } from 'primeng/button'
import { InputSwitchModule } from 'primeng/inputswitch'
import { TooltipModule } from 'primeng/tooltip'

import { UserService } from '@onecx/angular-integration-interface'

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [ButtonModule, InputSwitchModule, ReactiveFormsModule, TranslateModule, TooltipModule],
  templateUrl: './privacy.component.html'
})
export class PrivacyComponent implements OnInit, OnChanges {
  private readonly userService = inject(UserService)
  // input
  @Input() hideMyProfile: boolean | null = false
  @Output() hideMyProfileChange = new EventEmitter<boolean>()
  @Output() public applyChanges = new EventEmitter<boolean>()

  public changedPrivacySettings = false
  public readonly formGroup = new FormGroup({
    hideMyProfile: new FormControl<boolean>(false)
  })

  public ngOnInit(): void {
    void this.initializePermission()
  }

  private async initializePermission(): Promise<void> {
    if (!(await this.userService.hasPermission('ACCOUNT_SETTINGS_PRIVACY#EDIT'))) {
      this.formGroup.get('hideMyProfile')?.disable()
    }
  }

  public ngOnChanges(): void {
    this.formGroup.get('hideMyProfile')?.setValue(this.hideMyProfile)
  }

  public savePrivacySettings(): void {
    this.changedPrivacySettings = true
    if (this.formGroup.get('hideMyProfile')?.value !== this.hideMyProfile) {
      this.hideMyProfileChange.emit(this.formGroup.get('hideMyProfile')?.value === true)
    }
  }

  public applyChange() {
    this.applyChanges.emit(true)
  }
}
