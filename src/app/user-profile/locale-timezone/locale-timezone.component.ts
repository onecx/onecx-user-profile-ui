import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { FormControl, UntypedFormGroup } from '@angular/forms'

import {
  ConfigurationService,
  CONFIG_KEY,
  // UserProfileAccountSettingsLocaleAndTimeSettings,
  UserService
} from '@onecx/portal-integration-angular'
import { SelectItem } from 'primeng/api'
import { LocalAndTimezoneService } from 'src/app/user-profile/locale-timezone/service/localAndTimezone.service'

type SelectTimeZone = { label: string; value: string; utc: string; factor: string }

@Component({
  selector: 'app-locale-timezone',
  templateUrl: './locale-timezone.component.html',
  styleUrls: ['./locale-timezone.component.scss']
})
export class LocaleTimezoneComponent implements OnInit {
  @Input() public localeInput: string | undefined
  @Input() public timezoneInput: string | undefined
  @Output() public localeTimezoneChange = new EventEmitter<string>()
  @Output() public applyChanges = new EventEmitter<boolean>()

  public editLanguage = false
  public editTimezone = false
  public changedLanguage = false
  public changedTimezone = false
  public formGroup: UntypedFormGroup
  public timezoneSelectItems: SelectTimeZone[] = []
  public localeSelectItems: SelectItem[] = []
  public locale = 'en'
  public timezone = 'Europe/Berlin'
  public timezoneUTC = '(GMT+01:00) Berlin'
  public timezoneExample = ''
  public timezoneExampleDate = new Date()

  constructor(
    private readonly localAndTimezoneService: LocalAndTimezoneService,
    private readonly configService: ConfigurationService,
    private userService: UserService
  ) {
    this.formGroup = new UntypedFormGroup({
      timezone: new FormControl(''),
      locale: new FormControl('')
    })
  }

  public ngOnInit(): void {
    this.editLanguage = this.userService.hasPermission('ACCOUNT_SETTINGS_LANGUAGE#EDIT')
    this.editTimezone = this.userService.hasPermission('ACCOUNT_SETTINGS_TIMEZONE#EDIT')
    if (this.locale) {
      this.formGroup.patchValue({ locale: this.locale })
    }
    if (this.timezone) {
      this.formGroup.patchValue({ timezone: this.timezone })
    }
    this.initLocalesAndTimezones()
  }

  public initLocalesAndTimezones(): void {
    this.localAndTimezoneService.getTimezoneData().subscribe(
      (response) => {
        this.timezoneSelectItems = response.map((tz) => ({
          label: tz.name,
          value: tz.name,
          utc: tz.utc,
          factor: tz.factor
        }))
      },
      // eslint-disable-next-line no-console
      (error) => console.log(error)
    )
    const supportedLanguagesProperty = this.configService.getProperty(CONFIG_KEY.TKIT_SUPPORTED_LANGUAGES)
    const supportedLanguages = supportedLanguagesProperty
      ? supportedLanguagesProperty.split(',').map((l) => l.trim())
      : ['en', 'de']
    this.localeSelectItems = supportedLanguages.map((l) => ({
      label: 'LANGUAGE.' + l.toUpperCase(),
      value: l
    }))
    this.locale = this.formGroup.get('locale')?.value
    this.timezone = this.formGroup.get('timezone')?.value
    this.refreshTimezoneExample()
  }

  public saveLocale(): void {
    this.changedLanguage = true
    this.locale = this.formGroup.get('locale')?.value
    this.refreshTimezoneExample()
    this.localeTimezoneChange.emit(this.formGroup.value)
  }
  public saveTimezone(): void {
    this.changedTimezone = true
    this.timezone = this.formGroup.get('timezone')?.value
    this.refreshTimezoneExample()
    this.localeTimezoneChange.emit(this.formGroup.value)
  }

  public refreshTimezoneExample(): void {
    this.timezoneExampleDate = new Date()
    const tz = this.timezoneSelectItems.filter((tz) => tz.label === this.timezone)[0]
    this.timezoneUTC = tz.factor
  }

  public applyChange() {
    this.applyChanges.emit(true)
  }
}
