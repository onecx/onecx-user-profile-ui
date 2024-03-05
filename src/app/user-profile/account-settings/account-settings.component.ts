import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core'
import { Router } from '@angular/router'

import {
  ConfigurationService,
  UserPerson,
  UserService,
  UserProfileAccountSettings,
  UserProfilePreference,
  PortalMessageService
} from '@onecx/portal-integration-angular'
import { UserProfileService } from '../user-profile.service'
// import { EditPreference } from '../model/editPreference'
import { PrivacySettingsComponent } from '../privacy-settings/privacy-settings.component'

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html'
})
export class AccountSettingsComponent implements OnInit {
  @Output() public editModeUpdate = new EventEmitter<boolean>()
  @ViewChild(PrivacySettingsComponent, { static: false }) privacySettings!: PrivacySettingsComponent

  public personalInfo: UserPerson = {}
  public settings: UserProfileAccountSettings = {}
  public settingsInitial: UserProfileAccountSettings = {}
  public preferences: UserProfilePreference[] = []
  public selectedTab = 0

  private cacheItem = 'httpCache'
  // This is the local-cache-key for the user profile, containing the localization and timezone setting
  private profileCacheItem = 'tkit_user_profile'

  constructor(
    private readonly userProfileService: UserProfileService,
    private msgService: PortalMessageService,
    private user: UserService,
    private readonly router: Router,
    private readonly confService: ConfigurationService // private readonly stateService: StateService
  ) {
    this.user.profile$.subscribe(
      (profile) => {
        this.personalInfo = profile.person || {}
      },
      (error) => {
        console.error('Failed to load user profile', error)
      }
    )
  }

  public ngOnInit(): void {
    this.user.profile$.subscribe(
      (profile) => {
        this.settings = profile.accountSettings || {}
      },
      (error) => {
        console.error('Failed to load user profile', error)
      }
    )
    this.settingsInitial = { ...this.settings }
    this.loadPreferences()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public localeTimezoneChange(ev: any) {
    this.settings.localeAndTimeSettings = ev
    this.saveUserSettingsInfo()
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public layoutAndThemeChange(ev: any) {
    this.settings.layoutAndThemeSettings = ev
    this.saveUserSettingsInfo()
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public privacySettingsChange(ev: any) {
    this.settings.privacySettings = ev
    this.saveUserSettingsInfo()
  }

  public saveUserSettingsInfo(): void {
    this.userProfileService.updateUserSettings(this.settings).subscribe({
      next: () => {
        this.msgService.success({ summaryKey: 'USER_SETTINGS.SUCCESS' })
        if (this.settings.localeAndTimeSettings?.locale) {
          // this.confService.changeLanguage(this.settings.localeAndTimeSettings.locale)
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

  // TODO: Unused?
  // clearStorageCache() {
  //   localStorage.removeItem(this.cacheItem)
  //   this.msgService.info({ summaryKey: 'USER_SETTINGS.CLEAR_CACHE_INFO' })
  // }

  private loadPreferences(): void {
    this.userProfileService.getUserPreferences().subscribe(
      (preferences: UserProfilePreference[]) => {
        this.preferences = preferences
      },
      () => {
        this.preferences = []
      }
    )
  }

  editPreference(editPreference: any): void {
    const preferenceId: string = editPreference.id
    const value: string = editPreference.value
    this.userProfileService.updateUserPreference(preferenceId, value).subscribe(
      (preference: UserProfilePreference) => {
        const preferenceIndex = this.preferences.findIndex((p) => p.id == preferenceId)
        this.preferences[preferenceIndex] = preference
        this.msgService.success({ summaryKey: 'USER_SETTINGS.SUCCESS' })
      },
      () => {
        this.msgService.error({ summaryKey: 'USER_SETTINGS.ERROR' })
      }
    )
  }

  deletePreference(preferenceId: any): void {
    this.userProfileService.deleteUserPreference(preferenceId).subscribe({
      next: () => {
        const preferenceIndex = this.preferences.findIndex((p) => p.id == preferenceId)
        this.preferences.splice(preferenceIndex, 1)
        this.msgService.success({ summaryKey: 'USER_SETTINGS.SUCCESS' })
      },
      error: () => {
        this.msgService.error({ summaryKey: 'USER_SETTINGS.ERROR' })
      }
    })
  }
}
