import { ComponentFixture, TestBed, fakeAsync, waitForAsync } from '@angular/core/testing'

import { AccountSettingsComponent } from './account-settings.component'
import { PortalMessageService } from '@onecx/angular-integration-interface'
import { TranslateTestingModule } from 'ngx-translate-testing'
import {
  ColorScheme,
  MenuMode,
  UpdateUserSettings,
  UserProfileAPIService,
  UserProfileAccountSettings
} from 'src/app/shared/generated'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { of, throwError } from 'rxjs'
import { HttpErrorResponse, HttpEventType, HttpHeaders, provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { ActivatedRoute, Router } from '@angular/router'

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

  /** DATA  PREP */
  const profile: UserProfileAccountSettings = {
    modificationCount: 1,
    hideMyProfile: false,
    locale: 'de-de',
    timezone: 'UTC',
    menuMode: MenuMode.Horizontal,
    colorScheme: ColorScheme.Auto
  }

  const updatedProfile: UserProfileAccountSettings = {
    modificationCount: 1,
    hideMyProfile: false,
    locale: 'de-de',
    timezone: 'UTC',
    menuMode: MenuMode.Horizontal,
    colorScheme: ColorScheme.Auto
  }

  const initErrorResponse: HttpErrorResponse = {
    status: 401,
    statusText: 'Not Found',
    name: 'HttpErrorResponse',
    message: '',
    error: undefined,
    ok: false,
    headers: new HttpHeaders(),
    url: null,
    type: HttpEventType.ResponseHeader
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
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents()
    msgServiceSpy.success.calls.reset()
    msgServiceSpy.error.calls.reset()
    userProfileServiceSpy.getMyUserProfile.calls.reset()
    userProfileServiceSpy.getUserSettings.calls.reset()
    userProfileServiceSpy.updateUserSettings.calls.reset()
  }))

  beforeEach(() => {
    userProfileServiceSpy.getUserSettings.and.returnValue(of(profile))
    fixture = TestBed.createComponent(AccountSettingsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    spyOn(component, 'reloadWindow').and.returnValue()
  })

  it('should create', fakeAsync(() => {
    userProfileServiceSpy.getUserSettings.and.returnValue(throwError(() => initErrorResponse))

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
    userProfileServiceSpy.updateUserSettings.and.returnValue(of(updatedProfile))

    component.saveUserSettingsInfo()
    expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'USER_SETTINGS.SUCCESS' })
    expect(component.settings).toEqual(updatedProfile)
  })

  it('should handle error on update in saveUserSettingsInfo', () => {
    const updateErrorResponse: HttpErrorResponse = {
      status: 404,
      statusText: 'Not Found',
      name: 'HttpErrorResponse',
      message: '',
      error: undefined,
      ok: false,
      headers: new HttpHeaders(),
      url: null,
      type: HttpEventType.ResponseHeader
    }

    userProfileServiceSpy.updateUserSettings.and.returnValue(throwError(() => updateErrorResponse))

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

  it('should call timezoneChange', () => {
    component.settings.timezone = 'US'
    component.timezoneChange('HST')
    expect(component.settings.timezone).toEqual('HST')
    expect(userProfileServiceSpy.updateUserSettings).toHaveBeenCalledWith({
      updateUserSettings: component.settings as UpdateUserSettings
    })
  })

  it('should call colorSchemeChange', () => {
    component.settings.colorScheme = ColorScheme.Light
    component.colorSchemeChange(ColorScheme.Dark)
    expect(component.settings.colorScheme).toEqual(ColorScheme.Dark)
    expect(userProfileServiceSpy.updateUserSettings).toHaveBeenCalledWith({
      updateUserSettings: component.settings as UpdateUserSettings
    })
  })

  it('should call menuModeChange', () => {
    component.settings.menuMode = MenuMode.Horizontal
    component.menuModeChange(MenuMode.Slim)
    expect(component.settings.menuMode).toEqual(MenuMode.Slim)
    expect(userProfileServiceSpy.updateUserSettings).toHaveBeenCalledWith({
      updateUserSettings: component.settings as UpdateUserSettings
    })
  })

  it('should call privacySettingsChange', () => {
    component.settings.hideMyProfile = false
    component.privacySettingsChange({ hideMyProfile: true })
    expect(component.settings.hideMyProfile).toEqual(true)
    expect(userProfileServiceSpy.updateUserSettings).toHaveBeenCalledWith({
      updateUserSettings: component.settings as UpdateUserSettings
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
})
