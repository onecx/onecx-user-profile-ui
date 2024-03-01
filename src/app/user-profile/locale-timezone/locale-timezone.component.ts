import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core'
import { FormControl, UntypedFormGroup } from '@angular/forms'
import { SelectItem } from 'primeng/api'

import {
  AUTH_SERVICE,
  ConfigurationService,
  IAuthService,
  UserProfileAccountSettingsLocaleAndTimeSettings
} from '@onecx/portal-integration-angular'
import { LocalAndTimezoneService } from './service/localAndTimezone.service'

type SelectTimeZone = { label: string; value: string; utc: string; factor: string }

@Component({
  selector: 'up-locale-timezone',
  templateUrl: './locale-timezone.component.html',
  styleUrls: ['./locale-timezone.component.scss']
})
export class LocaleTimezoneComponent implements OnInit {
  @Input() public localeTimezone: UserProfileAccountSettingsLocaleAndTimeSettings | undefined
  @Output() public localeTimezoneChange = new EventEmitter<UserProfileAccountSettingsLocaleAndTimeSettings>()
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
    @Inject(AUTH_SERVICE) public authService: IAuthService,
    private readonly localAndTimezoneService: LocalAndTimezoneService,
    private readonly configService: ConfigurationService
  ) {
    this.formGroup = new UntypedFormGroup({
      timezone: new FormControl(''),
      locale: new FormControl('')
    })
  }

  public ngOnInit(): void {
    this.editLanguage = this.authService.hasPermission('ACCOUNT_SETTINGS_LANGUAGE#EDIT')
    this.editTimezone = this.authService.hasPermission('ACCOUNT_SETTINGS_TIMEZONE#EDIT')
    if (this.localeTimezone) {
      this.formGroup.patchValue(this.localeTimezone)
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
    const availLangsProperty = this.configService.getProperty('SUPPORTED-LANGUAGES')
    const availLangs = availLangsProperty ? availLangsProperty.split(',').map((l) => l.trim()) : ['en', 'de']
    this.localeSelectItems = availLangs.map((l) => ({
      label: 'LANGUAGE.' + l.toUpperCase(),
      value: l
    }))
    this.locale = this.formGroup.get('locale')?.value ? this.formGroup.get('locale')?.value : this.locale
    this.timezone = this.formGroup.get('timezone')?.value ? this.formGroup.get('timezone')?.value : this.timezone
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
