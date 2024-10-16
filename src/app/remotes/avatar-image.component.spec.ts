import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { TestBed } from '@angular/core/testing'
import { BASE_URL, RemoteComponentConfig } from '@onecx/angular-remote-components'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { ReplaySubject } from 'rxjs'
import { CommonModule } from '@angular/common'
import { provideRouter, RouterModule } from '@angular/router'

import { UserAvatarAPIService } from '../shared/generated'
import { OneCXAvatarImageComponent } from './avatar-image.component'
import { OneCXAvatarImageComponentHarness } from './avatar-image.harness'

describe('OneCXAvatarImageComponent', () => {
  const userAvatarAPIServiceSpy = jasmine.createSpyObj<UserAvatarAPIService>('UserAvatarAPIService', ['configuration'])

  function setUp() {
    const fixture = TestBed.createComponent(OneCXAvatarImageComponent)
    const component = fixture.componentInstance
    fixture.detectChanges()

    return { fixture, component }
  }

  async function setUpWithHarness() {
    const { fixture, component } = setUp()
    const avatarImageHarness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      OneCXAvatarImageComponentHarness
    )
    return { fixture, component, avatarImageHarness }
  }

  let baseUrlSubject: ReplaySubject<any>
  beforeEach(() => {
    baseUrlSubject = new ReplaySubject<any>(1)
    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        TranslateTestingModule.withTranslations({
          en: require('/src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: BASE_URL,
          useValue: baseUrlSubject
        },
        provideRouter([{ path: '', component: OneCXAvatarImageComponent }])
      ]
    })
      .overrideComponent(OneCXAvatarImageComponent, {
        set: {
          imports: [TranslateTestingModule, CommonModule, RouterModule],
          providers: [{ provide: UserAvatarAPIService, useValue: userAvatarAPIServiceSpy }]
        }
      })
      .compileComponents()
    baseUrlSubject.next('base_url_mock')
  })

  it('should create', () => {
    const { component } = setUp()

    expect(component).toBeTruthy()
  })

  it('should init remote component', (done: DoneFn) => {
    const { component } = setUp()

    component.ocxInitRemoteComponent({
      baseUrl: 'base_url_avatar'
    } as RemoteComponentConfig)

    expect(userAvatarAPIServiceSpy.configuration.basePath).toEqual('base_url_avatar/bff')
    baseUrlSubject.asObservable().subscribe((item) => {
      expect(item).toEqual('base_url_avatar')
      done()
    })
  })

  it('should call ocxInitRemoteComponent with the correct config', () => {
    const mockConfig: RemoteComponentConfig = {
      appId: 'appId',
      productName: 'prodName',
      permissions: ['permission'],
      baseUrl: 'base'
    }
    const { component } = setUp()
    spyOn(component, 'ocxInitRemoteComponent')

    component.ocxRemoteComponentConfig = mockConfig

    expect(component.ocxInitRemoteComponent).toHaveBeenCalledWith(mockConfig)
  })

  it('should set imagePath to placeholder onImageError', (done) => {
    const { component } = setUp()

    component.ocxInitRemoteComponent({
      baseUrl: 'base_url_avatar'
    } as RemoteComponentConfig)

    component.onImageError()
    expect(component.imagePath$).toBeDefined()

    component.imagePath$?.subscribe((res) => {
      expect(res).toEqual(component.placeHolderPath)
      done()
    })
  })

  describe('user profile', () => {
    it('should use correct image class', async () => {
      const { avatarImageHarness } = await setUpWithHarness()

      const imageClass = await avatarImageHarness.getAvatarImageClass()
      expect(imageClass).toEqual('user-avatar-image')
    })

    it('should use correct image path', async () => {
      const { avatarImageHarness } = await setUpWithHarness()

      const imagePath = await avatarImageHarness.getAvatarImageURL()
      expect(imagePath).toEqual('base_url_avatar/bff/userProfile/me/avatar?refType=small')
    })
  })
})
