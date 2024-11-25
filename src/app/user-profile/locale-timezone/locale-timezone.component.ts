import { Component, EventEmitter, Input, OnInit, OnChanges, Output } from '@angular/core'
import { FormControl, UntypedFormGroup } from '@angular/forms'

import { ConfigurationService, CONFIG_KEY, UserService } from '@onecx/portal-integration-angular'
import { SelectItem } from 'primeng/api'
import { LocalAndTimezoneService } from './service/localAndTimezone.service'

type SelectTimeZone = { label: string; value: string; utc: string; factor: string }

@Component({
  selector: 'app-locale-timezone',
  templateUrl: './locale-timezone.component.html',
  styleUrls: ['./locale-timezone.component.scss']
})
export class LocaleTimezoneComponent implements OnInit, OnChanges {
  @Input() public localeInput: string | undefined
  @Input() public timezoneInput: string | undefined
  @Output() public localeChange = new EventEmitter<string>()
  @Output() public timezoneChange = new EventEmitter<string>()
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
    private readonly userService: UserService
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
  }

  public ngOnChanges(): void {
    if (this.localeInput) {
      this.formGroup.patchValue({ locale: this.localeInput })
    }
    if (this.timezoneInput) {
      this.formGroup.patchValue({ timezone: this.timezoneInput })
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
      (error) => console.error(error)
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
    this.localeChange.emit(this.locale)
  }
  public saveTimezone(): void {
    this.changedTimezone = true
    this.timezone = this.formGroup.get('timezone')?.value
    this.refreshTimezoneExample()
    this.timezoneChange.emit(this.timezone)
  }

  public refreshTimezoneExample(): void {
    this.timezoneExampleDate = new Date()
    const tz = this.timezoneSelectItems.filter((tz) => tz.label === this.timezone)[0]
    if (tz) {
      this.timezoneUTC = tz.factor
    }
  }

  public applyChange() {
    this.applyChanges.emit(true)
  }
}
