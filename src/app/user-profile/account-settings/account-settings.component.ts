import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core'
import { Location } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs'

import { SlotService } from '@onecx/angular-remote-components'
import { ConfigurationService, PortalMessageService } from '@onecx/angular-integration-interface'
import { Action } from '@onecx/angular-accelerator'

import { UserProfileAPIService, UserPerson, UserProfile, UpdateUserProfileRequest } from 'src/app/shared/generated'
import { PrivacyComponent } from '../privacy/privacy.component'

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  @Output() public editModeUpdate = new EventEmitter<boolean>()
  @ViewChild(PrivacyComponent, { static: false }) privacySettings!: PrivacyComponent

  public actions$: Observable<Action[]> | undefined
  public personalInfo$: Observable<UserPerson>
  public isChangePasswordComponentDefined$: Observable<boolean>
  public profile: UserProfile = {}
  public settings: Record<string, any> = {}
  public settingsInitial: Record<string, any> = {}
  public changePasswordSlotName = 'onecx-user-profile-change-password'

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly location: Location,
    private readonly translate: TranslateService,
    private readonly msgService: PortalMessageService,
    private readonly userProfileService: UserProfileAPIService,
    private readonly confService: ConfigurationService, // private readonly stateService: StateService
    private readonly slotService: SlotService
  ) {
    this.personalInfo$ = this.userProfileService.getMyUserProfile().pipe(
      map((profile) => {
        this.prepareActionButtons()
        return profile.person ?? {}
      })
    )
    this.isChangePasswordComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(this.changePasswordSlotName)
  }

  public ngOnInit(): void {
    this.userProfileService.getMyUserProfile().subscribe({
      next: (profile) => {
        this.profile = profile
        if (profile.settings) {
          this.settings = profile.settings!
          this.settingsInitial = { ...this.settings }
        }
      },
      error: (error) => {
        console.error('getUserSettings', error)
        this.msgService.error({ summaryKey: 'USER_SETTINGS.ERROR' })
      }
    })
  }
  public localeChange(ev: any) {
    this.settings = { ...this.settings, locale: ev }
    this.saveUserSettingsInfo()
  }
  public timezoneChange(ev: any) {
    this.settings = { ...this.settings, timezone: ev }
    this.saveUserSettingsInfo()
  }
  public colorSchemeChange(ev: any) {
    this.settings = { ...this.settings, colorScheme: ev }
    this.saveUserSettingsInfo()
  }
  public menuModeChange(ev: any) {
    this.settings = { ...this.settings, menuMode: ev }
    this.saveUserSettingsInfo()
  }
  public privacySettingsChange(ev: any) {
    this.settings = { ...this.settings, hideMyProfile: ev.hideMyProfile }
    this.saveUserSettingsInfo()
  }

  public saveUserSettingsInfo(): void {
    const updateRequest = this.getUpdateRequest()
    this.userProfileService.updateMyUserProfile({ updateUserProfileRequest: updateRequest }).subscribe({
      next: (res) => {
        this.settings = res.settings!
        this.msgService.success({ summaryKey: 'USER_SETTINGS.SUCCESS' })
      },
      error: (error) => {
        console.error('updateUserSettings', error)
        this.msgService.error({ summaryKey: 'USER_SETTINGS.ERROR' })
      }
    })
  }
  public reloadPage(): void {
    this.location.historyGo(0) // load current page = reload (trick for code coverage)
  }

  private getUpdateRequest(): UpdateUserProfileRequest {
    return {
      modificationCount: this.profile.modificationCount!,
      organization: this.profile.organization,
      person: this.profile.person,
      settings: { ...this.settings }
    }
  }

  private prepareActionButtons(): void {
    this.actions$ = this.translate
      .get([
        'USER_PERMISSIONS.NAVIGATION.LABEL',
        'USER_PERMISSIONS.NAVIGATION.TOOLTIP',
        'USER_PROFILE.NAVIGATION.LABEL',
        'USER_PROFILE.NAVIGATION.TOOLTIP'
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
              label: data['USER_PERMISSIONS.NAVIGATION.LABEL'],
              title: data['USER_PERMISSIONS.NAVIGATION.TOOLTIP'],
              actionCallback: () => this.router.navigate(['../permissions'], { relativeTo: this.route }),
              permission: 'ROLES_PERMISSIONS#VIEW',
              icon: 'pi pi-lock',
              show: 'always'
            }
          ]
        })
      )
  }
}
