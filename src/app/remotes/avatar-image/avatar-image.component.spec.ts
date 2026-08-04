import { TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { ReplaySubject } from 'rxjs'

import { REMOTE_COMPONENT_CONFIG, RemoteComponentConfig } from '@onecx/angular-utils'

import { UserAvatarAPIService } from '../../shared/generated'
import { OneCXAvatarImageComponent } from './avatar-image.component'

describe('OneCXAvatarImageComponent', () => {
  let baseUrlSubject: ReplaySubject<RemoteComponentConfig>
  const userAvatarAPIServiceSpy = jasmine.createSpyObj<UserAvatarAPIService>('UserAvatarAPIService', ['configuration'])

  function setUp() {
    const fixture = TestBed.createComponent(OneCXAvatarImageComponent)
    const component = fixture.componentInstance
    fixture.detectChanges()
    return { fixture, component }
  }

  beforeEach(() => {
    baseUrlSubject = new ReplaySubject<RemoteComponentConfig>(1)
    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        OneCXAvatarImageComponent,
        TranslateTestingModule.withTranslations({
          de: require('/src/assets/i18n/de.json'),
          en: require('/src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: REMOTE_COMPONENT_CONFIG, useValue: baseUrlSubject },
        { provide: UserAvatarAPIService, useValue: userAvatarAPIServiceSpy }
      ]
    }).compileComponents()

    baseUrlSubject.next({ baseUrl: 'base_url' } as RemoteComponentConfig)
  })

  describe('initialize', () => {
    it('should create', () => {
      const { component } = setUp()

      expect(component).toBeTruthy()
    })

    it('should initialize remote component', (done: DoneFn) => {
      const { component } = setUp()
      const config = { baseUrl: 'base_url' } as RemoteComponentConfig

      component.ocxInitRemoteComponent(config)

      baseUrlSubject.asObservable().subscribe((item) => {
        expect(item).toEqual(config)
        done()
      })
    })

    it('should call ocxInitRemoteComponent with the correct config', () => {
      const { component } = setUp()
      const mockConfig: RemoteComponentConfig = {
        appId: 'appId',
        productName: 'prodName',
        permissions: ['permission'],
        baseUrl: 'base'
      }
      spyOn(component, 'ocxInitRemoteComponent')

      component.ocxRemoteComponentConfig = mockConfig

      expect(component.ocxInitRemoteComponent).toHaveBeenCalledWith(mockConfig)
    })

    it('should set imagePath to placeholder onImageError', (done) => {
      const { component } = setUp()
      const config = { baseUrl: 'base_url' } as RemoteComponentConfig

      component.ocxInitRemoteComponent(config)

      component.onImageError()
      expect(component.imagePath$).toBeDefined()

      component.imagePath$?.subscribe((res) => {
        expect(res).toEqual(component.placeHolderPath)
        done()
      })
    })

    it('should emit image loaded', () => {
      const { component } = setUp()
      component.onImageLoad()
    })
  })

  describe('avatar', () => {
    it('should use correct image path', (done) => {
      const fixture = TestBed.createComponent(OneCXAvatarImageComponent)
      const component = fixture.componentInstance
      component.ocxInitRemoteComponent({ baseUrl: 'base_url' } as RemoteComponentConfig)
      fixture.detectChanges()

      component.imagePath$?.subscribe((url) => {
        expect(url).toEqual('base_url/bff/userProfile/me/avatar?refType=small')
        done()
      })
    })
  })
})
