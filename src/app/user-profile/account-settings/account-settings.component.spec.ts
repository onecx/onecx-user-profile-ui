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

describe('AccountSettingsComponent', () => {
  let component: AccountSettingsComponent
  let fixture: ComponentFixture<AccountSettingsComponent>

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
        { provide: PortalMessageService, useValue: msgServiceSpy }
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
})

// import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

// import { HttpClient } from '@angular/common/http'
// import { AccountSettingsComponent } from './account-settings.component'
// import {
//   AUTH_SERVICE,
//   PortalMessageService,
//   UserProfileAccountSettings,
//   UserProfileAccountSettingsLayoutAndThemeSettings
// } from '@onecx/portal-integration-angular'
// import { HttpClientTestingModule } from '@angular/common/http/testing'
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
// import { HttpLoaderFactory } from '../../shared/shared.module'
// import { ConfigurationService } from '@onecx/portal-integration-angular'
// import { NO_ERRORS_SCHEMA } from '@angular/core'
// import { UserProfileService } from '../user-profile.service'
// import { of, throwError } from 'rxjs'
// import { EditPreference } from '../model/editPreference'

// class MockAuthService {
//   public getCurrentUser() {
//     return {
//       accountSettings: {
//         privacySettings: {
//           hideMyProfile: 'false'
//         },
//         notificationSettings: {
//           todo: 'todo'
//         },
//         localeAndTimeSettings: {
//           locale: 'en',
//           timezone: 'Europe/Paris'
//         },
//         layoutAndThemeSettings: {
//           menuMode: 'STATIC',
//           colorScheme: 'LIGHT'
//         }
//       }
//     }
//   }
// }

// describe('AccountSettingsComponent', () => {
//   let component: AccountSettingsComponent
//   let fixture: ComponentFixture<AccountSettingsComponent>

//   const configServiceSpy = {
//     getProperty: jasmine.createSpy('getProperty').and.returnValue('123'),
//     getPortal: jasmine.createSpy('getPortal').and.returnValue({
//       themeId: '1234',
//       portalName: 'test',
//       baseUrl: '/',
//       microfrontendRegistrations: []
//     })
//   }

//   const userProfileServiceSpy = {
//     updateUserSettings: jasmine.createSpy('updateUserSettings').and.returnValue(of({})),
//     getUserPreferences: jasmine.createSpy('getUserPreferences').and.returnValue(of({})),
//     updateUserPreference: jasmine.createSpy('updateUserPreference').and.returnValue(of({})),
//     deleteUserPreference: jasmine.createSpy('deleteUserPreference').and.returnValue(of({}))
//   }

//   const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error', 'info'])

//   beforeEach(waitForAsync(() => {
//     TestBed.configureTestingModule({
//       declarations: [AccountSettingsComponent],
//       imports: [
//         HttpClientTestingModule,
//         TranslateModule.forRoot({
//           loader: {
//             provide: TranslateLoader,
//             useFactory: HttpLoaderFactory,
//             deps: [HttpClient]
//           }
//         })
//       ],
//       schemas: [NO_ERRORS_SCHEMA],
//       providers: [
//         { provide: AUTH_SERVICE, useClass: MockAuthService },
//         { provide: ConfigurationService, useValue: configServiceSpy },
//         { provide: UserProfileService, useValue: userProfileServiceSpy },
//         { provide: PortalMessageService, useValue: msgServiceSpy }
//       ]
//     }).compileComponents()
//     msgServiceSpy.success.calls.reset()
//     msgServiceSpy.error.calls.reset()
//     msgServiceSpy.info.calls.reset()
//   }))

//   beforeEach(() => {
//     fixture = TestBed.createComponent(AccountSettingsComponent)
//     component = fixture.componentInstance
//     fixture.detectChanges()
//   })

//   it('should create', () => {
//     expect(component).toBeTruthy()
//     expect(component.settingsInitial).toEqual(
//       new MockAuthService().getCurrentUser().accountSettings as UserProfileAccountSettings
//     )
//   })

//   it('should set localeAndTimeSettings on localeTimezoneChange', () => {
//     userProfileServiceSpy.updateUserSettings.and.returnValue(of({}))

//     const newLocaleTimezone = {
//       locale: 'de',
//       timezone: 'Europe/Berlin'
//     }

//     component.localeTimezoneChange(newLocaleTimezone)

//     expect(component.settings.localeAndTimeSettings).toEqual(newLocaleTimezone)
//     expect(msgServiceSpy.success).toHaveBeenCalledOnceWith({ summaryKey: 'USER_SETTINGS.SUCCESS' })
//   })

//   it('should set layoutAndThemeSettings on layoutAndThemeChange', () => {
//     userProfileServiceSpy.updateUserSettings.and.returnValue(of({}))

//     const newLayoutAndTheme = {
//       menuMode: 'OVERLAY',
//       colorScheme: 'AUTO'
//     }

//     component.layoutAndThemeChange(newLayoutAndTheme)

//     expect(component.settings.layoutAndThemeSettings).toEqual(
//       newLayoutAndTheme as UserProfileAccountSettingsLayoutAndThemeSettings
//     )
//     expect(msgServiceSpy.success).toHaveBeenCalledOnceWith({ summaryKey: 'USER_SETTINGS.SUCCESS' })
//   })

//   it('should set privacySettings on privacySettingsChange', () => {
//     userProfileServiceSpy.updateUserSettings.and.returnValue(of({}))

//     const newPrivacy = {
//       hideMyProfile: 'true'
//     }

//     component.privacySettingsChange(newPrivacy)

//     expect(component.settings.privacySettings).toEqual(newPrivacy)
//     expect(msgServiceSpy.success).toHaveBeenCalledOnceWith({ summaryKey: 'USER_SETTINGS.SUCCESS' })
//   })

//   it('should display error on saveUserSettingsInfo failure', () => {
//     userProfileServiceSpy.updateUserSettings.and.returnValue(throwError(() => new Error()))

//     component.saveUserSettingsInfo()

//     expect(msgServiceSpy.error).toHaveBeenCalledOnceWith({ summaryKey: 'USER_SETTINGS.ERROR' })
//   })

//   it('should clear data and inform user on reloadPage', () => {
//     const removeStorageItemSpy = spyOn(localStorage, 'removeItem')
//     const windowReloadSpy = spyOn(component, 'reloadWindow').and.callFake(() => {})

//     component.reloadPage()

//     expect(removeStorageItemSpy.calls.count()).toBe(1)
//     expect(windowReloadSpy.calls.count()).toBe(1)
//     expect(msgServiceSpy.info).toHaveBeenCalledOnceWith({ summaryKey: 'USER_SETTINGS.CLEAR_CACHE_INFO' })
//   })

//   it('should have empty preferences if user preferences return error', () => {
//     userProfileServiceSpy.getUserPreferences.and.returnValue(throwError(() => new Error()))
//     component.ngOnInit()

//     expect(component.preferences).toEqual([])
//   })

//   it('should display error on preference update error', () => {
//     userProfileServiceSpy.updateUserPreference.and.returnValue(throwError(() => new Error()))
//     const preference: EditPreference = {
//       id: '1',
//       value: 'yes'
//     }
//     component.editPreference(preference)

//     expect(msgServiceSpy.error).toHaveBeenCalledOnceWith({ summaryKey: 'USER_SETTINGS.ERROR' })
//   })

//   it('should replace preference and display success on preference update success', () => {
//     const editPreference: EditPreference = {
//       id: '1',
//       value: 'yes'
//     }

//     const preference1 = {
//       id: '1',
//       applicationId: '1',
//       description: 'desc1',
//       name: 'name1',
//       value: 'no'
//     }

//     component.preferences = [
//       preference1,
//       {
//         id: '2',
//         applicationId: '2',
//         description: 'desc2',
//         name: 'name2',
//         value: 'maybe'
//       }
//     ]

//     userProfileServiceSpy.updateUserPreference.and.returnValue(
//       of({
//         id: preference1.id,
//         applicationId: preference1.applicationId,
//         description: preference1.description,
//         name: preference1.name,
//         value: editPreference.value
//       })
//     )
//     component.editPreference(editPreference)

//     expect(component.preferences[0].value).toBe('yes')
//     expect(component.preferences.length).toBe(2)
//     expect(msgServiceSpy.success).toHaveBeenCalledOnceWith({ summaryKey: 'USER_SETTINGS.SUCCESS' })
//   })

//   it('should display error on preference delete error', () => {
//     userProfileServiceSpy.deleteUserPreference.and.returnValue(throwError(() => new Error()))
//     const preferenceId = '1'
//     component.deletePreference(preferenceId)

//     expect(msgServiceSpy.error).toHaveBeenCalledOnceWith({ summaryKey: 'USER_SETTINGS.ERROR' })
//   })

//   it('should remove preference and display success on preference delete success', () => {
//     component.preferences = [
//       {
//         id: '1',
//         applicationId: '1',
//         description: 'desc1',
//         name: 'name1',
//         value: 'no'
//       },
//       {
//         id: '2',
//         applicationId: '2',
//         description: 'desc2',
//         name: 'name2',
//         value: 'maybe'
//       }
//     ]

//     userProfileServiceSpy.deleteUserPreference.and.returnValue(of({}))

//     component.deletePreference('2')
//     expect(msgServiceSpy.success).toHaveBeenCalledOnceWith({ summaryKey: 'USER_SETTINGS.SUCCESS' })
//     expect(component.preferences.length).toBe(1)
//     expect(component.preferences.find((p) => p.id == '2')).toBeUndefined()
//   })
// })

// describe('AccountSettingsComponent', () => {
//   let component: AccountSettingsComponent
//   let fixture: ComponentFixture<AccountSettingsComponent>

//   const userProfileServiceSpy = {
//     getMyUserProfile: jasmine.createSpy('getMyUserProfile').and.returnValue(of({})),
//     getUserSettings: jasmine.createSpy('getUserSettings').and.returnValue(of({})),
//     updateUserSettings: jasmine.createSpy('updateUserSettings').and.returnValue(of({}))
//   }

//   const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error', 'info'])

//   const initErrorResponse: HttpErrorResponse = {
//     status: 401,
//     statusText: 'Not Found',
//     name: 'HttpErrorResponse',
//     message: '',
//     error: undefined,
//     ok: false,
//     headers: new HttpHeaders(),
//     url: null,
//     type: HttpEventType.ResponseHeader
//   }

//   beforeEach(waitForAsync(() => {
//     TestBed.configureTestingModule({
//       declarations: [AccountSettingsComponent],
//       imports: [
//         HttpClientTestingModule,
//         TranslateTestingModule.withTranslations({
//           de: require('src/assets/i18n/de.json'),
//           en: require('src/assets/i18n/en.json')
//         }).withDefaultLanguage('en')
//       ],
//       schemas: [NO_ERRORS_SCHEMA],
//       providers: [
//         { provide: UserProfileAPIService, useValue: userProfileServiceSpy },
//         { provide: PortalMessageService, useValue: msgServiceSpy }
//       ]
//     }).compileComponents()
//     msgServiceSpy.success.calls.reset()
//     msgServiceSpy.error.calls.reset()
//     userProfileServiceSpy.getMyUserProfile.calls.reset()
//     userProfileServiceSpy.getUserSettings.calls.reset()
//     userProfileServiceSpy.updateUserSettings.calls.reset()
//   }))

//   beforeEach(() => {
//     userProfileServiceSpy.getUserSettings.and.returnValue(throwError(() => initErrorResponse))
//     fixture = TestBed.createComponent(AccountSettingsComponent)
//     component = fixture.componentInstance
//     fixture.detectChanges()
//   })

//   it('should create', fakeAsync(() => {
//     expect(component).toBeTruthy()
//     expect(msgServiceSpy.error).toHaveBeenCalled()
//   }))
// })
