import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core'
import { Location } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs'

import { SlotService } from '@onecx/angular-remote-components'
import { ConfigurationService, PortalMessageService, UserService } from '@onecx/angular-integration-interface'
import { Action } from '@onecx/portal-integration-angular'

import {
  UpdateUserSettings,
  UserProfileAPIService,
  UserPerson,
  UserProfileAccountSettings
} from 'src/app/shared/generated'
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
  public settings: UserProfileAccountSettings = {}
  public settingsInitial: UserProfileAccountSettings = {}
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
    this.userProfileService.getUserSettings().subscribe({
      next: (profile) => {
        this.settings = profile
        this.settingsInitial = { ...this.settings }
      },
      error: (error) => {
        console.error('getUserSettings', error)
        this.msgService.error({ summaryKey: 'USER_SETTINGS.ERROR' })
      }
    })
  }
  public localeChange(ev: any) {
    this.settings.locale = ev
    this.saveUserSettingsInfo()
  }
  public timezoneChange(ev: any) {
    this.settings.timezone = ev
    this.saveUserSettingsInfo()
  }
  public colorSchemeChange(ev: any) {
    this.settings.colorScheme = ev
    this.saveUserSettingsInfo()
  }
  public menuModeChange(ev: any) {
    this.settings.menuMode = ev
    this.saveUserSettingsInfo()
  }
  public privacySettingsChange(ev: any) {
    this.settings.hideMyProfile = ev.hideMyProfile
    this.saveUserSettingsInfo()
  }

  public saveUserSettingsInfo(): void {
    this.userProfileService.updateUserSettings({ updateUserSettings: this.settings as UpdateUserSettings }).subscribe({
      next: (res) => {
        this.settings = res
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
