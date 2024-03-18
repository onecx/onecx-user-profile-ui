import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core'
import { Router } from '@angular/router'

import { ConfigurationService, PortalMessageService } from '@onecx/portal-integration-angular'
import {
  UpdateUserSettings,
  UserProfileAPIService,
  UserPerson,
  UserProfileAccountSettings
} from 'src/app/shared/generated'
import { PrivacySettingsComponent } from '../privacy-settings/privacy-settings.component'
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs'

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html'
})
export class AccountSettingsComponent implements OnInit {
  @Output() public editModeUpdate = new EventEmitter<boolean>()
  @ViewChild(PrivacySettingsComponent, { static: false }) privacySettings!: PrivacySettingsComponent

  public personalInfo$: Observable<UserPerson>
  public settings: UserProfileAccountSettings = {}
  public settingsInitial: UserProfileAccountSettings = {}
  public selectedTab = 0

  private cacheItem = 'httpCache'
  // This is the local-cache-key for the user profile, containing the localization and timezone setting
  private profileCacheItem = 'tkit_user_profile'

  constructor(
    private msgService: PortalMessageService,
    private userProfileService: UserProfileAPIService,
    private readonly router: Router,
    private readonly confService: ConfigurationService // private readonly stateService: StateService
  ) {
    this.personalInfo$ = this.userProfileService.getMyUserProfile().pipe(map((profile) => profile.person || {}))
  }

  public ngOnInit(): void {
    this.userProfileService.getUserSettings().subscribe({
      next: (profile) => {
        console.log('PROFILE', profile)
        this.settings = profile || {}
        this.settingsInitial = { ...this.settings }
        console.log('INIT', this.settingsInitial.timezone)
      },
      error: (error) => {
        console.error('Failed to load user profile', error)
      }
    })
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public localeChange(ev: any) {
    this.settings.locale = ev
    this.saveUserSettingsInfo()
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public timezoneChange(ev: any) {
    this.settings.timezone = ev
    this.saveUserSettingsInfo()
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public colorSchemeChange(ev: any) {
    this.settings.colorScheme = ev
    this.saveUserSettingsInfo()
  }
  public menuModeChange(ev: any) {
    this.settings.menuMode = ev
    this.saveUserSettingsInfo()
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public privacySettingsChange(ev: any) {
    this.settings.hideMyProfile = ev
    this.saveUserSettingsInfo()
  }

  public saveUserSettingsInfo(): void {
    console.log('SAVE', this.settings)
    this.userProfileService.updateUserSettings({ updateUserSettings: this.settings as UpdateUserSettings }).subscribe({
      next: () => {
        this.msgService.success({ summaryKey: 'USER_SETTINGS.SUCCESS' })
        if (this.settings.locale) {
          //TODO what exactly should we reload now? SHould we notify shell/parent?
        }
      },
      error: () => {
        this.msgService.error({ summaryKey: 'USER_SETTINGS.ERROR' })
      }
    })
  }

  private clearProfileCache(): void {
    localStorage.removeItem(this.profileCacheItem)
    this.msgService.info({ summaryKey: 'USER_SETTINGS.CLEAR_CACHE_INFO' })
  }

  public reloadPage(): void {
    this.clearProfileCache()
    this.reloadWindow()
  }

  public reloadWindow(): void {
    window.location.reload()
  }
}
