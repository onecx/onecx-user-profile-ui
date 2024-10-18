import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs'

import { Action, ConfigurationService, PortalMessageService } from '@onecx/portal-integration-angular'
import {
  UpdateUserSettings,
  UserProfileAPIService,
  UserPerson,
  UserProfileAccountSettings
} from 'src/app/shared/generated'
import { PrivacySettingsComponent } from '../privacy-settings/privacy-settings.component'
import { SlotService } from '@onecx/angular-remote-components'

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html'
})
export class AccountSettingsComponent implements OnInit {
  @Output() public editModeUpdate = new EventEmitter<boolean>()
  @ViewChild(PrivacySettingsComponent, { static: false }) privacySettings!: PrivacySettingsComponent

  public actions$: Observable<Action[]> | undefined
  public personalInfo$: Observable<UserPerson>
  public isChangePasswordComponentDefined$: Observable<boolean>
  public settings: UserProfileAccountSettings = {}
  public settingsInitial: UserProfileAccountSettings = {}
  public selectedTab = 0
  public changePasswordSlotName = 'onecx-user-profile-change-password'

  private cacheItem = 'httpCache'
  // This is the local-cache-key for the user profile, containing the localization and timezone setting
  private profileCacheItem = 'tkit_user_profile'

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly translate: TranslateService,
    private readonly msgService: PortalMessageService,
    private readonly userProfileService: UserProfileAPIService,
    private readonly confService: ConfigurationService, // private readonly stateService: StateService
    private readonly slotService: SlotService
  ) {
    this.personalInfo$ = this.userProfileService.getMyUserProfile().pipe(
      map((profile) => {
        this.prepareActionButtons()
        return profile.person || {}
      })
    )
    this.isChangePasswordComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(this.changePasswordSlotName)
  }

  public ngOnInit(): void {
    this.userProfileService.getUserSettings().subscribe({
      next: (profile) => {
        this.settings = profile || {}
        this.settingsInitial = { ...this.settings }
      },
      error: (error) => {
        console.error('Failed to load user profile', error)
        this.msgService.error({ summaryKey: 'USER_SETTINGS.ERROR' })
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
    this.settings.hideMyProfile = ev.hideMyProfile
    this.saveUserSettingsInfo()
  }

  public saveUserSettingsInfo(): void {
    this.userProfileService.updateUserSettings({ updateUserSettings: this.settings as UpdateUserSettings }).subscribe({
      next: (res) => {
        this.msgService.success({ summaryKey: 'USER_SETTINGS.SUCCESS' })
        this.settings = res
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

  private prepareActionButtons(): void {
    this.actions$ = this.translate
      .get([
        'ROLE_PERMISSIONS.NAVIGATION.LABEL',
        'ROLE_PERMISSIONS.NAVIGATION.TOOLTIP',
        'USER_PROFILE.NAVIGATION.LABEL',
        'USER_PROFILE.NAVIGATION.TOOTIP'
      ])
      .pipe(
        map((data) => {
          return [
            {
              label: data['USER_PROFILE.NAVIGATION.LABEL'],
              title: data['USER_PROFILE.NAVIGATION.TOOLTIP'],
              actionCallback: () => this.router.navigate(['../'], { relativeTo: this.route }),
              permission: 'USERPROFILE#VIEW',
              icon: 'pi pi-user',
              show: 'always'
            },
            {
              label: data['ROLE_PERMISSIONS.NAVIGATION.LABEL'],
              title: data['ROLE_PERMISSIONS.NAVIGATION.TOOLTIP'],
              actionCallback: () => this.router.navigate(['../roles'], { relativeTo: this.route }),
              permission: 'ROLES_PERMISSIONS#VIEW',
              icon: 'pi pi-lock',
              show: 'always'
            }
          ]
        })
      )
  }
}
