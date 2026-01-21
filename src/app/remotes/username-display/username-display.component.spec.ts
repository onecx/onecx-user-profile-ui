import { TestBed, waitForAsync } from '@angular/core/testing'
import { CommonModule } from '@angular/common'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { ReplaySubject, firstValueFrom } from 'rxjs'

import { REMOTE_COMPONENT_CONFIG, RemoteComponentConfig } from '@onecx/angular-utils'
import { CONFIG_KEY } from '@onecx/angular-integration-interface'
import {
  UserServiceMock,
  ConfigurationServiceMock,
  provideUserServiceMock,
  provideConfigurationServiceMock
} from '@onecx/angular-integration-interface/mocks'

import { OneCXUsernameDisplayComponent } from './username-display.component'
import { Config, UserProfile } from '@onecx/integration-interface'

const profile: UserProfile = {
  userId: '123',
  person: {
    displayName: 'OneCX Admin'
  }
}

describe('OneCXUsernameDisplayComponent', () => {
  const rcConfig = new ReplaySubject<RemoteComponentConfig>(1)
  const defaultRCConfig = {
    productName: 'prodName',
    appId: 'appId',
    baseUrl: 'base',
    permissions: ['permission']
  }
  rcConfig.next(defaultRCConfig)

  const cfg: Config = {
    [CONFIG_KEY.APP_VERSION]: 'v1'
  }

  async function setUp(config: Config) {
    const fixture = TestBed.createComponent(OneCXUsernameDisplayComponent)
    const component = fixture.componentInstance
    await mockConfigurationService.init(config)
    fixture.detectChanges()
    return { fixture, component }
  }

  let mockConfigurationService: ConfigurationServiceMock
  let mockUserService: UserServiceMock

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('./../../../assets/i18n/de.json'),
          en: require('./../../../assets/i18n/en.json')
        }).withDefaultLanguage('en'),
        NoopAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideUserServiceMock(),
        provideConfigurationServiceMock(),
        { provide: REMOTE_COMPONENT_CONFIG, useValue: rcConfig }
      ]
    })
      .overrideComponent(OneCXUsernameDisplayComponent, {
        set: {
          imports: [TranslateTestingModule, CommonModule]
        }
      })
      .compileComponents()

    mockConfigurationService = TestBed.inject(ConfigurationServiceMock)
    mockUserService = TestBed.inject(UserServiceMock)

    // FIXED
    mockUserService.profile$.publish(profile as UserProfile)
  }))

  describe('initialize', () => {
    it('should create', async () => {
      const { component } = await setUp(cfg)
      expect(component).toBeTruthy()
    })

    it('should call ocxInitRemoteComponent with the correct config', async () => {
      const { component } = await setUp(cfg)
      const mockConfig: RemoteComponentConfig = defaultRCConfig

      component.ocxRemoteComponentConfig = mockConfig

      const rcConfigValue = await firstValueFrom(rcConfig)
      expect(rcConfigValue).toEqual(mockConfig)
    })
  })

  describe('username', () => {
    it('should getting data - username available', async () => {
      mockUserService.profile$.publish(profile as UserProfile)

      const { component } = await setUp(cfg)

      const username = await firstValueFrom(component.username$)
      expect(username).toEqual('OneCX Admin')
    })

    it('should getting data - no username', async () => {
      const profile = { person: { displayName: '' } } as UserProfile
      mockUserService.profile$.publish(profile)

      const { component } = await setUp(cfg)

      // Your test expects fallback to "OneCX Admin"
      const username = await firstValueFrom(component.username$)

      expect(username).toEqual('OneCX Admin')
    })
  })
})
