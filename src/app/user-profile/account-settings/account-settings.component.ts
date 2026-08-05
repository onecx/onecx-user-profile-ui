import { Component, EventEmitter, inject, OnInit, Output, ViewChild } from '@angular/core'
import { AsyncPipe, Location } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs'

import { MessageModule } from 'primeng/message'
import { TooltipModule } from 'primeng/tooltip'
import { TabsModule } from 'primeng/tabs'

import { SlotService } from '@onecx/angular-remote-components'
import { ConfigurationService, PortalMessageService } from '@onecx/angular-integration-interface'
import { Action, AngularAcceleratorModule } from '@onecx/angular-accelerator'
import { PortalPageComponent } from '@onecx/angular-utils'

import { UserProfileAPIService, UserProfile, UpdateUserPersonSettingsRequest } from 'src/app/shared/generated'

import { PrivacyComponent } from '../privacy/privacy.component'
import { LayoutThemeComponent } from '../layout-theme/layout-theme.component'
import { LocaleTimezoneComponent } from '../locale-timezone/locale-timezone.component'

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [
    AsyncPipe,
    AngularAcceleratorModule,
    MessageModule,
    TabsModule,
    TooltipModule,
    TranslateModule,
    // components
    LayoutThemeComponent,
    LocaleTimezoneComponent,
    PortalPageComponent
  ],
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly location = inject(Location)
  private readonly translate = inject(TranslateService)
  private readonly msgService = inject(PortalMessageService)
  private readonly userProfileService = inject(UserProfileAPIService)
  private readonly confService = inject(ConfigurationService)
  private readonly slotService = inject(SlotService)

  @Output() public editModeUpdate = new EventEmitter<boolean>()
  @ViewChild(PrivacyComponent, { static: false }) privacySettings!: PrivacyComponent

  public actions$: Observable<Action[]> | undefined
  public profile: UserProfile = {}
  public settings: Record<string, any> = {}
  public settingsInitial: Record<string, any> = {}
  public changePasswordSlotName = 'onecx-user-profile-change-password'
  public personalInfo$ = this.userProfileService.getMyUserProfile().pipe(
    map((profile) => {
      this.prepareActionButtons()
      return profile.person ?? {}
    })
  )
  public isChangePasswordComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(this.changePasswordSlotName)

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
    const updateRequest: UpdateUserPersonSettingsRequest = {
      modificationCount: this.profile.modificationCount!,
      settings: { ...this.settings }
    }
    this.userProfileService.updateMyUserProfileSettings({ updateUserPersonSettingsRequest: updateRequest }).subscribe({
      next: (res) => {
        this.settings = res.settings!
        this.msgService.success({ summaryKey: 'USER_SETTINGS.SUCCESS' })
      },
      error: (error) => {
        console.error('updateMyUserProfileSettings', error)
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
