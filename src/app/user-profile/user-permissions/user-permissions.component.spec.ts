import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { ActivatedRoute, Router } from '@angular/router'
import { of } from 'rxjs'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { TableModule } from 'primeng/table'

import { PortalMessageService } from '@onecx/angular-integration-interface'

import { PhoneType, UserProfile, UserProfileAPIService } from 'src/app/shared/generated'
import { UserPermissionsComponent } from './user-permissions.component'

const defaultCurrentUser: UserProfile = {
  userId: '15',
  person: {
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John Doe Display Name',
    email: 'john.doe@example.com',
    address: {
      street: 'Candy Lane',
      streetNo: '12',
      city: 'Candy Town',
      postalCode: '80-243',
      country: 'EN'
    },
    phone: {
      type: PhoneType.Mobile,
      number: '123456789'
    }
  }
}

describe('UserPermissionsComponent', () => {
  let component: UserPermissionsComponent
  let fixture: ComponentFixture<UserPermissionsComponent>

  const activatedRouteMock = {}
  const routerMock = jasmine.createSpyObj<Router>('Router', ['navigate'])
  const userProfileServiceSpy = {
    getMyUserProfile: jasmine.createSpy('getMyUserProfile').and.returnValue(of({}))
  }
  const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error'])

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UserPermissionsComponent],
      imports: [
        TableModule,
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
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPermissionsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => {
    userProfileServiceSpy.getMyUserProfile.calls.reset()
    msgServiceSpy.success.calls.reset()
    msgServiceSpy.error.calls.reset()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should handle empty object returned by getUserProfile', () => {
    userProfileServiceSpy.getMyUserProfile.and.returnValue(of({}))

    component.personalInfo$?.subscribe((info) => {
      expect(info).toEqual({})
    })
  })

  it('should navigate to user profile', () => {
    userProfileServiceSpy.getMyUserProfile.and.returnValue(of(defaultCurrentUser))

    component.actions$?.subscribe((action) => {
      action[0].actionCallback()
    })

    expect(routerMock.navigate).toHaveBeenCalled()
  })

  it('should navigate to account settings', () => {
    userProfileServiceSpy.getMyUserProfile.and.returnValue(of(defaultCurrentUser))

    component.actions$?.subscribe((action) => {
      action[1].actionCallback()
    })

    expect(routerMock.navigate).toHaveBeenCalled()
  })
})
