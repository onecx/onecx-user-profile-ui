import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, fakeAsync, waitForAsync } from '@angular/core/testing'
import { Location } from '@angular/common'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { ActivatedRoute, Router } from '@angular/router'
import { of, throwError } from 'rxjs'
import { TranslateTestingModule } from 'ngx-translate-testing'

import { PortalMessageService } from '@onecx/angular-integration-interface'

import {
  ColorScheme,
  MenuMode,
  UpdateUserSettings,
  UserProfileAPIService,
  UserProfileAccountSettings
} from 'src/app/shared/generated'
import { AccountSettingsComponent } from './account-settings.component'

describe('AccountSettingsComponent', () => {
  let component: AccountSettingsComponent
  let fixture: ComponentFixture<AccountSettingsComponent>
  const activatedRouteMock = {}
  const routerMock = {
    navigate: jasmine.createSpy('navigate')
  }
  const userProfileServiceSpy = {
    getMyUserProfile: jasmine.createSpy('getMyUserProfile').and.returnValue(of({})),
    getUserSettings: jasmine.createSpy('getUserSettings').and.returnValue(of({})),
    updateUserSettings: jasmine.createSpy('updateUserSettings').and.returnValue(of({}))
  }
  const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error', 'info'])
  const locationSpy = jasmine.createSpyObj<Location>('Location', ['historyGo'])

  const profile: UserProfileAccountSettings = {
    modificationCount: 0,
    hideMyProfile: false,
    locale: 'de-de',
    timezone: 'UTC',
    menuMode: MenuMode.Horizontal,
    colorScheme: ColorScheme.Auto
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AccountSettingsComponent],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideHttpClientTesting(),
        provideHttpClient(),
        { provide: UserProfileAPIService, useValue: userProfileServiceSpy },
        { provide: PortalMessageService, useValue: msgServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Location, useValue: locationSpy },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents()
    msgServiceSpy.success.calls.reset()
    msgServiceSpy.error.calls.reset()
    userProfileServiceSpy.getMyUserProfile.calls.reset()
    userProfileServiceSpy.getUserSettings.calls.reset()
    userProfileServiceSpy.updateUserSettings.calls.reset()
    locationSpy.historyGo.calls.reset()
  }))

  beforeEach(() => {
    userProfileServiceSpy.getUserSettings.and.returnValue(of(profile))
    fixture = TestBed.createComponent(AccountSettingsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should display error if loading fails', fakeAsync(() => {
    const errorResponse = { error: 'Error on loading user settings', status: 400 }
    userProfileServiceSpy.getUserSettings.and.returnValue(throwError(() => errorResponse))

    component.ngOnInit()

    expect(component).toBeTruthy()
    expect(component.settings).toBe(profile)
    expect(component.settingsInitial).toEqual(profile)
    expect(msgServiceSpy.error).toHaveBeenCalled()
  }))

  it('should handle loading of empty settings', () => {
    userProfileServiceSpy.getUserSettings.and.returnValue(of({}))

    component.ngOnInit()

    expect(component.settings).toEqual({})
  })

  it('should saveUserSettingsInfo', () => {
    component.settings = profile
    const response: UpdateUserSettings = { ...profile, modificationCount: 1 }

    userProfileServiceSpy.updateUserSettings.and.returnValue(of(response))

    component.saveUserSettingsInfo()
    expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'USER_SETTINGS.SUCCESS' })
    expect(component.settings).toEqual(response)
  })

  it('should handle error on update in saveUserSettingsInfo', () => {
    const errorResponse = { error: 'Error on updating user settings', status: 400 }
    userProfileServiceSpy.updateUserSettings.and.returnValue(throwError(() => errorResponse))

    component.saveUserSettingsInfo()
    expect(msgServiceSpy.error).toHaveBeenCalledWith({ summaryKey: 'USER_SETTINGS.ERROR' })
  })

  it('should reloadPage', () => {
    localStorage.setItem('tkit_user_profile', 'testItem')
    component.reloadPage()
    expect(localStorage.getItem('tkit_user_profile')).toBeNull()
    expect(msgServiceSpy.info).toHaveBeenCalledWith({ summaryKey: 'USER_SETTINGS.CLEAR_CACHE_INFO' })
  })

  it('should call localeChange', () => {
    component.localeChange('DE')
    expect(component.settings.locale).toEqual('DE')
    expect(userProfileServiceSpy.updateUserSettings).toHaveBeenCalledWith({
      updateUserSettings: component.settings as UpdateUserSettings
    })
  })

  describe('on change settings', () => {
    it('should call timezoneChange', () => {
      component.settings = profile
      const val = 'HST'
      const response: UpdateUserSettings = { ...profile, modificationCount: 1, timezone: val }
      userProfileServiceSpy.updateUserSettings.and.returnValue(of(response))

      component.timezoneChange(val)

      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'USER_SETTINGS.SUCCESS' })
      expect(component.settings).toEqual(response)
    })

    it('should call colorSchemeChange', () => {
      component.settings = profile
      const val = ColorScheme.Dark
      const response: UpdateUserSettings = { ...profile, modificationCount: 1, colorScheme: val }
      userProfileServiceSpy.updateUserSettings.and.returnValue(of(response))

      component.colorSchemeChange(val)

      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'USER_SETTINGS.SUCCESS' })
      expect(component.settings).toEqual(response)
    })

    it('should call menuModeChange', () => {
      component.settings = profile
      const val = MenuMode.Horizontal
      const response: UpdateUserSettings = { ...profile, modificationCount: 1, menuMode: val }
      userProfileServiceSpy.updateUserSettings.and.returnValue(of(response))

      component.menuModeChange(MenuMode.Slim)

      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'USER_SETTINGS.SUCCESS' })
      expect(component.settings).toEqual(response)
    })

    it('should call privacySettingsChange', () => {
      component.settings = profile
      const val = false
      const response: UpdateUserSettings = { ...profile, modificationCount: 1, hideMyProfile: val }
      userProfileServiceSpy.updateUserSettings.and.returnValue(of(response))

      component.privacySettingsChange({ hideMyProfile: true })

      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'USER_SETTINGS.SUCCESS' })
      expect(component.settings).toEqual(response)
    })
  })

  it('should navigate to user profile', () => {
    component.actions$?.subscribe((action) => {
      action[0].actionCallback()
    })

    expect(routerMock.navigate).toHaveBeenCalled()
  })

  it('should navigate to user permissions', () => {
    component.actions$?.subscribe((action) => {
      action[1].actionCallback()
    })

    expect(routerMock.navigate).toHaveBeenCalled()
  })

  it('should reload page', () => {
    component.reloadPage()
  })
})
