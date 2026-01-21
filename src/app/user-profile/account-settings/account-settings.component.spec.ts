import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, fakeAsync, waitForAsync } from '@angular/core/testing'
import { Location } from '@angular/common'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { ActivatedRoute, Router } from '@angular/router'
import { of, throwError } from 'rxjs'
import { TranslateTestingModule } from 'ngx-translate-testing'

import { PortalMessageService } from '@onecx/angular-integration-interface'

import { ColorScheme, MenuMode, UserProfile, UserProfileAPIService } from 'src/app/shared/generated'
import { AccountSettingsComponent } from './account-settings.component'

const accountSettings: object = {
  hideMyProfile: false,
  locale: 'DE',
  timezone: 'UTC',
  menuMode: MenuMode.Horizontal,
  colorScheme: ColorScheme.Auto
}

const profile: UserProfile = {
  modificationCount: 0,
  settings: accountSettings
}

describe('AccountSettingsComponent', () => {
  let component: AccountSettingsComponent
  let fixture: ComponentFixture<AccountSettingsComponent>
  const activatedRouteMock = {}
  const routerMock = {
    navigate: jasmine.createSpy('navigate')
  }
  const userProfileServiceSpy = {
    getMyUserProfile: jasmine.createSpy('getMyUserProfile').and.returnValue(of({})),
    updateMyUserProfile: jasmine.createSpy('updateUserSettings').and.returnValue(of({}))
  }
  const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error', 'info'])
  const locationSpy = jasmine.createSpyObj<Location>('Location', ['historyGo'])

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
  }))

  beforeEach(() => {
    userProfileServiceSpy.getMyUserProfile.and.returnValue(of(profile))
    fixture = TestBed.createComponent(AccountSettingsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => {
    msgServiceSpy.success.calls.reset()
    msgServiceSpy.error.calls.reset()
    userProfileServiceSpy.getMyUserProfile.calls.reset()
    userProfileServiceSpy.updateMyUserProfile.calls.reset()
    locationSpy.historyGo.calls.reset()
    userProfileServiceSpy.getMyUserProfile.and.returnValue(of({}))
    userProfileServiceSpy.updateMyUserProfile.and.returnValue(of({}))
  })

  it('should display error if loading fails', fakeAsync(() => {
    const errorResponse = { status: 400, statusText: 'Error on loading user settings' }
    userProfileServiceSpy.getMyUserProfile.and.returnValue(throwError(() => errorResponse))
    spyOn(console, 'error')

    component.ngOnInit()

    expect(component).toBeTruthy()
    expect(component.settings).toBe(accountSettings)
    expect(component.settingsInitial).toEqual(accountSettings)
    expect(msgServiceSpy.error).toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith('getUserSettings', errorResponse)
  }))

  it('should handle loading of empty settings', () => {
    userProfileServiceSpy.getMyUserProfile.and.returnValue(of({ settings: {} }))

    component.ngOnInit()

    expect(component.settings).toEqual({})
  })

  it('should saveUserSettingsInfo', () => {
    component.settings = accountSettings
    const response: UserProfile = { ...accountSettings, modificationCount: 1 }
    userProfileServiceSpy.updateMyUserProfile.and.returnValue(of(response))

    component.saveUserSettingsInfo()

    expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'USER_SETTINGS.SUCCESS' })
    expect(component.settings).toEqual(response.settings!)
  })

  it('should handle error on update in saveUserSettingsInfo', () => {
    const errorResponse = { status: 400, statusText: 'Error on updating user settings' }
    userProfileServiceSpy.updateMyUserProfile.and.returnValue(throwError(() => errorResponse))
    spyOn(console, 'error')

    component.saveUserSettingsInfo()
    expect(msgServiceSpy.error).toHaveBeenCalledWith({ summaryKey: 'USER_SETTINGS.ERROR' })
    expect(console.error).toHaveBeenCalledWith('updateUserSettings', errorResponse)
  })

  it('should reloadPage', () => {
    component.reloadPage()
  })

  describe('on change settings', () => {
    it('should call localeChange', () => {
      component.settings = { ...accountSettings }
      const response: UserProfile = { ...profile, modificationCount: 1, settings: { ...accountSettings, locale: 'EN' } }
      userProfileServiceSpy.updateMyUserProfile.and.returnValue(of(response))

      component.localeChange('EN')

      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'USER_SETTINGS.SUCCESS' })
      expect(component.settings).toEqual(response.settings!)
    })

    it('should call timezoneChange', () => {
      component.settings = accountSettings
      const val = 'HST'
      const response: UserProfile = {
        ...profile,
        modificationCount: 1,
        settings: { ...accountSettings, timezone: val }
      }
      userProfileServiceSpy.updateMyUserProfile.and.returnValue(of(response))

      component.timezoneChange(val)

      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'USER_SETTINGS.SUCCESS' })
      expect(component.settings).toEqual(response.settings!)
    })

    it('should call colorSchemeChange', () => {
      component.settings = accountSettings
      const val = ColorScheme.Dark
      const response: UserProfile = {
        ...profile,
        modificationCount: 1,
        settings: { ...accountSettings, colorScheme: val }
      }
      userProfileServiceSpy.updateMyUserProfile.and.returnValue(of(response))

      component.colorSchemeChange(val)

      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'USER_SETTINGS.SUCCESS' })
      expect(component.settings).toEqual(response.settings!)
    })

    it('should call menuModeChange', () => {
      component.settings = accountSettings
      const val = MenuMode.Horizontal
      const response: UserProfile = {
        ...profile,
        modificationCount: 1,
        settings: { ...accountSettings, menuMode: val }
      }
      userProfileServiceSpy.updateMyUserProfile.and.returnValue(of(response))

      component.menuModeChange(MenuMode.Slim)

      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'USER_SETTINGS.SUCCESS' })
      expect(component.settings).toEqual(response.settings!)
    })

    it('should call privacySettingsChange', () => {
      component.settings = accountSettings
      const val = false
      const response: UserProfile = {
        ...profile,
        modificationCount: 1,
        settings: { ...accountSettings, hideMyProfile: val }
      }
      userProfileServiceSpy.updateMyUserProfile.and.returnValue(of(response))

      component.privacySettingsChange({ hideMyProfile: true })

      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'USER_SETTINGS.SUCCESS' })
      expect(component.settings).toEqual(response.settings!)
    })
  })

  it('should navigate to user accountSettings', () => {
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
    expect().nothing()
    component.reloadPage()
  })
})
