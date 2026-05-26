import { Component, EventEmitter, Input, OnInit, OnChanges, Output } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { SelectItem } from 'primeng/api'

import { CONFIG_KEY, ConfigurationService, UserService } from '@onecx/angular-integration-interface'
import { AngularAcceleratorModule } from '@onecx/angular-accelerator'

import { LocalAndTimezoneService } from './service/localAndTimezone.service'
import { sortByLabel } from 'src/app/shared/utils'
import { SharedModule } from 'src/app/shared/shared.module'

type SelectTimeZone = { label: string; value: string; utc: string; factor: string }

@Component({
  selector: 'app-locale-timezone',
  templateUrl: './locale-timezone.component.html',
  styleUrls: ['./locale-timezone.component.scss'],
  standalone: true,
  imports: [AngularAcceleratorModule, SharedModule]
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
  public formGroup: FormGroup
  public timeZones: SelectTimeZone[] = []
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
    this.loadTimezones()
    this.formGroup = new FormGroup({
      timezone: new FormControl(null),
      locale: new FormControl(null)
    })
  }

  public ngOnInit(): void {
    void this.initializePermissions()
  }

  private async initializePermissions(): Promise<void> {
    this.editLanguage = await this.userService.hasPermission('ACCOUNT_SETTINGS_LANGUAGE#EDIT')
    this.editTimezone = await this.userService.hasPermission('ACCOUNT_SETTINGS_TIMEZONE#EDIT')
    if (this.locale) this.formGroup.patchValue({ locale: this.locale })
    if (this.timezone) this.formGroup.patchValue({ timezone: this.timezone })
  }

  public ngOnChanges(): void {
    if (this.localeInput) this.formGroup.patchValue({ locale: this.localeInput })
    if (this.timezoneInput) this.formGroup.patchValue({ timezone: this.timezoneInput })
    this.formGroup.get('timezone')?.disable()
    void this.initLocalesAndTimezones()
  }

  private loadTimezones(): void {
    this.localAndTimezoneService.getTimezoneData().subscribe({
      next: (response) => {
        this.timeZones = response.map((tz) => ({
          label: tz.name,
          value: tz.name,
          utc: tz.utc,
          factor: tz.factor
        }))
        this.timeZones.sort(sortByLabel)
      },
      error: (err) => {
        console.error('getTimezoneData', err)
      }
    })
  }

  private async initLocalesAndTimezones(): Promise<void> {
    let supportedLanguagesProperty: unknown
    try {
      supportedLanguagesProperty = await this.configService.getProperty(CONFIG_KEY.TKIT_SUPPORTED_LANGUAGES)
    } catch (error) {
      console.error('getProperty TKIT_SUPPORTED_LANGUAGES', error)
    }
    const supportedLanguages =
      typeof supportedLanguagesProperty === 'string'
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
    const tz = this.timeZones.find((tz) => tz.label === this.timezone)
    if (tz) this.timezoneUTC = tz.factor
  }

  public applyChange() {
    this.applyChanges.emit(true)
  }
}
