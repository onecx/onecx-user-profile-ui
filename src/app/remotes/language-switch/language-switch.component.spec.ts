import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { Location } from '@angular/common'
import { Observable, of, ReplaySubject, Subject } from 'rxjs'
import { TranslateService } from '@ngx-translate/core'
import { ConfigurationService, PortalMessageService, UserService } from '@onecx/portal-integration-angular'
import { BASE_URL, REMOTE_COMPONENT_CONFIG } from '@onecx/angular-remote-components'
import { UserProfileAPIService, UserProfile } from 'src/app/shared/generated'
import { OneCXLanguageSwitchComponent } from './language-switch.component'
import { HttpEvent, provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'

const mockProfile: UserProfile = {
  id: '123',
  settings: { locale: 'en' } as any
}

describe('OneCXLanguageSwitchComponent - Business Logic', () => {
  let component: OneCXLanguageSwitchComponent
  let fixture: ComponentFixture<OneCXLanguageSwitchComponent>
  let userApiService: jasmine.SpyObj<UserProfileAPIService>
  let translateService: jasmine.SpyObj<TranslateService>
  let configService: jasmine.SpyObj<ConfigurationService>
  let rcConfigSubject: ReplaySubject<any>
  let baseUrlSubject: ReplaySubject<string>

  beforeEach(async () => {
    rcConfigSubject = new ReplaySubject(1)
    baseUrlSubject = new ReplaySubject(1)

    userApiService = jasmine.createSpyObj('UserProfileAPIService', ['getMyUserProfile', 'updateMyUserProfile'])
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['getBrowserLang', 'use'])
    const configServiceSpy = jasmine.createSpyObj('ConfigurationService', ['getProperty'])
    const messageServiceSpy = jasmine.createSpyObj('PortalMessageService', ['success', 'error'])
    const locationSpy = jasmine.createSpyObj('Location', ['historyGo'])

    await TestBed.configureTestingModule({
      imports: [OneCXLanguageSwitchComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        UserService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserProfileAPIService, useValue: userApiService },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: ConfigurationService, useValue: configServiceSpy },
        { provide: PortalMessageService, useValue: messageServiceSpy },
        { provide: Location, useValue: locationSpy },
        { provide: REMOTE_COMPONENT_CONFIG, useValue: rcConfigSubject },
        { provide: BASE_URL, useValue: baseUrlSubject }
      ]
    }).compileComponents()

    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>
    configService = TestBed.inject(ConfigurationService) as jasmine.SpyObj<ConfigurationService>

    fixture = TestBed.createComponent(OneCXLanguageSwitchComponent)
    component = fixture.componentInstance
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
      userApiService.getMyUserProfile.and.returnValue(of(mockProfile) as Observable<HttpEvent<UserProfile>>)
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

      component['initialLanguage'] = undefined

      expect(component.shouldShowForm()).toBe(false)
    })
  })
})
