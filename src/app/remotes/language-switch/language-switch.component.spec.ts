import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { CommonModule, Location } from '@angular/common'
import { of, ReplaySubject, Subject, throwError } from 'rxjs'
import { TranslateService } from '@ngx-translate/core'
import { ConfigurationService, PortalMessageService, UserService } from '@onecx/portal-integration-angular'
import { BASE_URL, REMOTE_COMPONENT_CONFIG, RemoteComponentConfig } from '@onecx/angular-remote-components'
import { UserProfileAPIService, UserProfile } from 'src/app/shared/generated'
import { OneCXLanguageSwitchComponent } from './language-switch.component'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
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
  let translateService: jasmine.SpyObj<TranslateService>
  let configService: jasmine.SpyObj<ConfigurationService>
  let rcConfigSubject: ReplaySubject<any>
  let baseUrlSubject: ReplaySubject<string>

  const userApiService = {
    getMyUserProfile: jasmine.createSpy('getMyUserProfile').and.returnValue(of({})),
    updateMyUserProfile: jasmine.createSpy('updateUserSettings').and.returnValue(of({}))
  }
  const locationSpy = jasmine.createSpyObj('Location', ['historyGo'])
  const messageServiceSpy = jasmine.createSpyObj('PortalMessageService', ['success', 'error'])

  beforeEach(async () => {
    rcConfigSubject = new ReplaySubject(1)
    baseUrlSubject = new ReplaySubject(1)
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['getBrowserLang', 'use'])
    const configServiceSpy = jasmine.createSpyObj('ConfigurationService', ['getProperty'])

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
        { provide: ConfigurationService, useValue: configServiceSpy },
        { provide: Location, useValue: locationSpy },
        { provide: REMOTE_COMPONENT_CONFIG, useValue: rcConfigSubject },
        { provide: BASE_URL, useValue: baseUrlSubject }
      ],
      schemas: [NO_ERRORS_SCHEMA]
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

    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>
    configService = TestBed.inject(ConfigurationService) as jasmine.SpyObj<ConfigurationService>

    fixture = TestBed.createComponent(OneCXLanguageSwitchComponent)
    component = fixture.componentInstance
  })

  describe('Component initial configuration', () => {
    beforeEach(() => {
      userApiService.getMyUserProfile.and.returnValue(of(mockProfile))
      configService.getProperty.and.returnValue('en,de')
    })

    afterEach(() => {
      userApiService.getMyUserProfile.calls.reset()
      configService.getProperty.calls.reset()
    })

    it('should init all component data properly', () => {
      component.ngOnInit()
      const initialProfileLanguage = (mockProfile.settings as Record<string, any>)['locale']

      expect(userApiService.getMyUserProfile).toHaveBeenCalled()
      expect(configService.getProperty).toHaveBeenCalled()

      expect(component.availableLanguages.length).toBeGreaterThan(0)
      expect(component.languageFormGroup).toBeTruthy()
      expect(component.initialLanguage).toEqual(initialProfileLanguage)
      expect(component.profile).toEqual(mockProfile)
      expect(component.languageFormGroup.get('language')?.value).toEqual(initialProfileLanguage)
    })

    it('should init remote component config properly', (done) => {
      let baseUrlEmitted = false
      let rcConfigEmitted = false

      baseUrlSubject.subscribe((url) => {
        expect(url).toBe(rcConfig.baseUrl)
        baseUrlEmitted = true
        if (baseUrlEmitted && rcConfigEmitted) done()
      })

      rcConfigSubject.subscribe((config) => {
        expect(config).toEqual(rcConfig)
        rcConfigEmitted = true
        if (baseUrlEmitted && rcConfigEmitted) done()
      })

      component.ocxRemoteComponentConfig = rcConfig
    })
  })

  describe('Available Languages Sorting', () => {
    beforeEach(() => {
      userApiService.getMyUserProfile.and.returnValue(new Subject())
    })

    it('should limit available languages to shownLanguagesNumber', () => {
      configService.getProperty.and.returnValue('en,de,fr,it,es')
      translateService.getBrowserLang.and.returnValue('en')
      component.shownLanguagesNumber = 2

      component.ngOnInit()

      expect(component.availableLanguages.length).toBe(2)
    })
  })

  describe('shouldShowForm', () => {
    beforeEach(() => {
      userApiService.getMyUserProfile.and.returnValue(of(mockProfile))
    })

    it('should return false when languageFormGroup is undefined', () => {
      component.languageFormGroup = undefined as any

      expect(component.shouldShowForm()).toBe(false)
    })

    it('should return false when availableLanguages is empty', () => {
      configService.getProperty.and.returnValue('en')
      translateService.getBrowserLang.and.returnValue('en')
      component.shownLanguagesNumber = 3
      component.ngOnInit()

      component.availableLanguages = []

      expect(component.shouldShowForm()).toBe(false)
    })

    it('should return false when initialLanguage is undefined', () => {
      configService.getProperty.and.returnValue('en,de')
      translateService.getBrowserLang.and.returnValue('en')
      component.shownLanguagesNumber = 3
      component.ngOnInit()

      component.initialLanguage = undefined

      expect(component.shouldShowForm()).toBe(false)
    })

    it('should show form when all conditions are met', () => {
      configService.getProperty.and.returnValue('en,de')
      translateService.getBrowserLang.and.returnValue('en')
      component.shownLanguagesNumber = 3
      component.ngOnInit()

      expect(component.shouldShowForm()).toBeTrue()
    })
  })

  describe('Language settings update', () => {
    beforeEach(() => {
      userApiService.getMyUserProfile.and.returnValue(of(mockProfile))
      userApiService.updateMyUserProfile.and.returnValue(of(updatedProfile))
    })

    afterEach(() => {
      userApiService.getMyUserProfile.calls.reset()
      userApiService.updateMyUserProfile.calls.reset()
      locationSpy.historyGo.calls.reset()
    })

    it('should handle update success', () => {
      component.ngOnInit()
      const newLanguage = (updatedProfile.settings as Record<string, any>)['locale']

      component.languageFormGroup.patchValue({ language: newLanguage })

      expect(userApiService.updateMyUserProfile).toHaveBeenCalled()
      expect(locationSpy.historyGo).toHaveBeenCalled()
      expect(component.profile).toEqual(updatedProfile)
      expect(userApiService.updateMyUserProfile).toHaveBeenCalledWith(
        jasmine.objectContaining({
          updateUserProfileRequest: jasmine.objectContaining({
            settings: jasmine.objectContaining({
              locale: newLanguage
            })
          })
        })
      )
    })

    it('should handle update error', () => {
      userApiService.updateMyUserProfile.and.returnValue(throwError(() => new Error('Error')))

      component.ngOnInit()
      const newLanguage = (updatedProfile.settings as Record<string, any>)['locale']
      const oldLanguage = (mockProfile.settings as Record<string, any>)['locale']
      component.languageFormGroup.patchValue({ language: newLanguage })

      expect(messageServiceSpy.error).toHaveBeenCalled()
      expect(component.languageFormGroup.get('language')?.value).toEqual(oldLanguage)
      expect(userApiService.updateMyUserProfile).toHaveBeenCalledTimes(1)
      expect(locationSpy.historyGo).not.toHaveBeenCalled()
    })
  })
})
