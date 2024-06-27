import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { BASE_URL, RemoteComponentConfig } from '@onecx/angular-remote-components'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { ReplaySubject, of } from 'rxjs'
import { UserAvatarAPIService } from '../shared/generated'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { UserService } from '@onecx/angular-integration-interface'
import { OneCXAvatarImageComponent } from './avatar-image.component'
import { OneCXAvatarImageComponentHarness } from './avatar-image.harness'
import { UserProfile } from '@onecx/integration-interface'

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
          en: require('../../assets/i18n/en.json')
        }).withDefaultLanguage('en'),
        RouterTestingModule.withRoutes([
          {
            path: 'admin/user',
            component: {} as any
          }
        ])
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: BASE_URL,
          useValue: baseUrlSubject
        }
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

  describe('user profile', () => {
    it('should use correct image path', async () => {
      const userService = TestBed.inject(UserService)
      spyOn(userService.profile$, 'asObservable').and.returnValue(
        of({
          userId: 'my-user-id',
          organization: 'org',
          person: {
            displayName: 'My user',
            firstName: 'Name',
            lastName: 'Lastname'
          }
        }) as any
      )

      let userProfile: UserProfile = {
        userId: 'my-user-id',
        person: {
          displayName: 'My user',
          firstName: 'Name',
          lastName: 'Lastname'
        },
        avatar: {
          smallImageUrl: 'base_url_avatar/bff/userProfile/me/avatar?refType=small'
        },
        organization: 'org'
      }

      let resultUserProfile: UserProfile = {
        userId: '',
        person: {}
      }

      const { avatarImageHarness } = await setUpWithHarness()

      let user$ = await avatarImageHarness.getUserAvatarImage()

      user$!.subscribe((value: any) => {
        resultUserProfile = value
      })
      expect(resultUserProfile).toEqual(userProfile)
    })
  })
})
