import { TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { ReplaySubject, firstValueFrom } from 'rxjs'

import { REMOTE_COMPONENT_CONFIG, RemoteComponentConfig, TranslationConnectionService } from '@onecx/angular-utils'
import { UserService } from '@onecx/angular-integration-interface'
import { UserServiceMock, provideUserServiceMock } from '@onecx/angular-integration-interface/mocks'

import { OneCXUsernameComponent } from './username.component'
import { Config, UserProfile } from '@onecx/integration-interface'

const profile: UserProfile = {
  userId: '123',
  person: {
    displayName: 'OneCX Admin'
  }
}

fdescribe('OneCXUsernameComponent', () => {
  let mockUserService: UserServiceMock
  const rcConfigSubject = new ReplaySubject<RemoteComponentConfig>(1)
  const defaultRCConfig = {
    productName: 'prodName',
    appId: 'appId',
    baseUrl: 'base',
    permissions: ['permission']
  }
  rcConfigSubject.next(defaultRCConfig)

  function setUp() {
    const fixture = TestBed.createComponent(OneCXUsernameComponent)
    const component = fixture.componentInstance
    fixture.detectChanges()
    return { fixture, component }
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        OneCXUsernameComponent,
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideUserServiceMock(),
        { provide: TranslationConnectionService, useValue: {} },
        { provide: REMOTE_COMPONENT_CONFIG, useValue: rcConfigSubject }
      ]
    }).compileComponents()

    mockUserService = TestBed.inject(UserService) as unknown as UserServiceMock
    mockUserService.profile$.publish(profile)
  }))

  describe('initialize', () => {
    it('should create', async () => {
      const { component } = await setUp()
      expect(component).toBeTruthy()
    })

    it('should call ocxInitRemoteComponent with the correct config', async () => {
      const { component } = await setUp()
      const mockConfig: RemoteComponentConfig = defaultRCConfig

      component.ocxRemoteComponentConfig = mockConfig

      const rcConfigValue = await firstValueFrom(rcConfigSubject)
      expect(rcConfigValue).toEqual(mockConfig)
    })
  })

  describe('username', () => {
    it('should show username', async () => {
      mockUserService.profile$.publish(profile as UserProfile)

      const { component } = await setUp()

      const username = await firstValueFrom(component.username$)
      expect(username).toEqual('OneCX Admin')
    })

    it('should have empty username', async () => {
      const profile = { person: { displayName: '' } } as UserProfile
      mockUserService.profile$.publish(profile)

      const { component } = await setUp()

      const username = await firstValueFrom(component.username$)

      expect(username).toEqual('')
    })
  })
})
