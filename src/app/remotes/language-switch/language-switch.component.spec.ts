import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { CommonModule, Location } from '@angular/common'
import { of, ReplaySubject, Subject, throwError } from 'rxjs'
import { TranslateService } from '@ngx-translate/core'
import { PortalMessageService, UserService } from '@onecx/portal-integration-angular'
import { REMOTE_COMPONENT_CONFIG, RemoteComponentConfig } from '@onecx/angular-remote-components'
import {
  ConfigurationServiceMock,
  provideConfigurationServiceMock,
  UserServiceMock,
  provideUserServiceMock,
  MockUserService
} from '@onecx/angular-integration-interface/mocks'
import { UserProfileAPIService, UserProfile } from 'src/app/shared/generated'
import { OneCXLanguageSwitchComponent } from './language-switch.component'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TranslateTestingModule } from 'ngx-translate-testing'

const mockProfile: UserProfile = {
  id: '123',
  settings: { locale: 'en' } as any
}

const updatedProfile: UserProfile = {
  id: '123',
  settings: { locale: 'de' } as any
}

const rcConfig: RemoteComponentConfig = {
  appId: 'app',
  productName: 'product',
  permissions: ['VIEW'],
  baseUrl: '/url'
}

describe('OneCXLanguageSwitchComponent - Business Logic', () => {
  let component: OneCXLanguageSwitchComponent
  let fixture: ComponentFixture<OneCXLanguageSwitchComponent>
  let configService: ConfigurationServiceMock
  let userService: MockUserService
  let rcConfigSubject: ReplaySubject<any>

  const userApiService = {
    getMyUserProfile: jasmine.createSpy('getMyUserProfile').and.returnValue(of({})),
    updateMyUserProfile: jasmine.createSpy('updateMyUserProfile').and.returnValue(of({}))
  }
  const locationSpy = jasmine.createSpyObj('Location', ['historyGo'])
  const messageServiceSpy = jasmine.createSpyObj('PortalMessageService', ['success', 'error'])
  const initialProfileLanguage = (mockProfile.settings as Record<string, any>)['locale']

  beforeEach(async () => {
    rcConfigSubject = new ReplaySubject(1)
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['getBrowserLang', 'use'])

    await TestBed.configureTestingModule({
      imports: [
        OneCXLanguageSwitchComponent,
        ReactiveFormsModule,
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      providers: [
        FormBuilder,
        UserService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TranslateService, useValue: translateServiceSpy },
        provideConfigurationServiceMock(),
        provideUserServiceMock(),
        { provide: Location, useValue: locationSpy },
        { provide: REMOTE_COMPONENT_CONFIG, useValue: rcConfigSubject }
      ]
    })
      .overrideComponent(OneCXLanguageSwitchComponent, {
        set: {
          imports: [TranslateTestingModule, CommonModule],
          providers: [
            { provide: UserProfileAPIService, useValue: userApiService },
            { provide: PortalMessageService, useValue: messageServiceSpy }
          ]
        }
      })
      .compileComponents()

    configService = TestBed.inject(ConfigurationServiceMock)
    userService = TestBed.inject(UserServiceMock)

    fixture = TestBed.createComponent(OneCXLanguageSwitchComponent)
    component = fixture.componentInstance
  })

  describe('Component initial configuration', () => {
    beforeEach(() => {
      userService.profile$.publish(mockProfile as any)
      userApiService.getMyUserProfile.and.returnValue(of(mockProfile))
      spyOn(configService, 'getProperty').and.returnValue('en,de')
    })

    afterEach(() => {
      userApiService.getMyUserProfile.calls.reset()
      if (configService.getProperty && (configService.getProperty as jasmine.Spy).calls) {
        ;(configService.getProperty as jasmine.Spy).calls.reset()
      }
    })

    it('should init all component data properly', fakeAsync(() => {
      component.ngOnInit()
      tick()
      userService.lang$.next(initialProfileLanguage) // simulate delayed completion of getMyUserProfile request called from shell UI
      flush()

      expect(configService.getProperty).toHaveBeenCalled()
      expect(component.availableLanguages.length).toBeGreaterThan(0)
      expect(component.languageFormGroup).toBeTruthy()
      expect(component.languageFormGroup.get('language')?.value).toEqual(initialProfileLanguage)
    }))

    it('should init remote component config properly', (done) => {
      rcConfigSubject.subscribe((config) => {
        expect(config).toEqual(rcConfig)
        done()
      })

      component.ocxRemoteComponentConfig = rcConfig
    })
  })

  describe('Available languages display', () => {
    beforeEach(() => {
      userApiService.getMyUserProfile.and.returnValue(new Subject())
    })

    it('should limit available languages to shownLanguagesNumber', fakeAsync(() => {
      spyOn(configService, 'getProperty').and.returnValue('en,de,fr,it,es')
      component.shownLanguagesNumber = 2

      component.ngOnInit()
      flush()

      expect(component.availableLanguages.length).toBe(2)
    }))
  })

  describe('shouldShowForm', () => {
    beforeEach(() => {
      userApiService.getMyUserProfile.and.returnValue(of(mockProfile))
    })

    it('should return false when languageFormGroup is undefined', () => {
      component.languageFormGroup = undefined as any

      expect(component.shouldShowForm()).toBe(false)
    })

    it('should return false when availableLanguages is empty', fakeAsync(() => {
      spyOn(configService, 'getProperty').and.returnValue('en')
      component.shownLanguagesNumber = 3
      component.ngOnInit()
      flush()

      component.availableLanguages = []

      expect(component.shouldShowForm()).toBe(false)
    }))

    it('should return false when default language is not set', fakeAsync(() => {
      spyOn(configService, 'getProperty').and.returnValue('en,de')
      component.shownLanguagesNumber = 3
      component.ngOnInit()
      flush()

      component.defaultLangSet = false

      expect(component.shouldShowForm()).toBe(false)
    }))

    it('should show form when all conditions are met', fakeAsync(() => {
      spyOn(configService, 'getProperty').and.returnValue('en,de')
      component.shownLanguagesNumber = 3
      component.ngOnInit()
      tick()
      userService.lang$.next(initialProfileLanguage) // simulate delayed completion of getMyUserProfile request called from shell UI
      flush()
      expect(component.shouldShowForm()).toBeTrue()
    }))
  })

  describe('Language settings update', () => {
    beforeEach(() => {
      userService.profile$.publish(mockProfile as any)
      userApiService.getMyUserProfile.and.returnValue(of(mockProfile))
      userApiService.updateMyUserProfile.and.returnValue(of(updatedProfile))
    })

    afterEach(() => {
      userApiService.getMyUserProfile.calls.reset()
      userApiService.updateMyUserProfile.calls.reset()
      locationSpy.historyGo.calls.reset()
    })

    it('should handle update success', fakeAsync(() => {
      component.ngOnInit()
      tick()

      const newLanguage = (updatedProfile.settings as Record<string, any>)['locale']
      component.languageFormGroup.patchValue({ language: newLanguage })

      flush()

      expect(userApiService.updateMyUserProfile).toHaveBeenCalled()
      expect(locationSpy.historyGo).toHaveBeenCalled()
      expect(userApiService.updateMyUserProfile).toHaveBeenCalledWith(
        jasmine.objectContaining({
          updateUserProfileRequest: jasmine.objectContaining({
            settings: jasmine.objectContaining({
              locale: newLanguage
            })
          })
        })
      )
    }))

    it('should handle update error', fakeAsync(() => {
      userApiService.updateMyUserProfile.and.returnValue(throwError(() => new Error('Error')))

      component.ngOnInit()
      tick()

      const newLanguage = (updatedProfile.settings as Record<string, any>)['locale']
      const oldLanguage = (mockProfile.settings as Record<string, any>)['locale']
      component.languageFormGroup.patchValue({ language: newLanguage })

      flush()

      expect(messageServiceSpy.error).toHaveBeenCalled()
      expect(component.languageFormGroup.get('language')?.value).toEqual(oldLanguage)
      expect(userApiService.updateMyUserProfile).toHaveBeenCalledTimes(1)
      expect(locationSpy.historyGo).not.toHaveBeenCalled()
    }))
  })
})
