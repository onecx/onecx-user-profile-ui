/* eslint-disable @typescript-eslint/no-unused-vars */
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing'

import { RolesPermissionsComponent } from './roles-permissions.component'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { HttpClient } from '@angular/common/http'
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'

import { PortalMessageService } from '@onecx/portal-integration-angular'
import { NO_ERRORS_SCHEMA } from '@angular/core'
// import { UserProfileService } from '../user-profile.service'
import { TableModule } from 'primeng/table'
import { Router } from '@angular/router'
import { map, of } from 'rxjs'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { profile } from 'console'
import { PhoneType, UserProfile, UserProfileAPIService } from 'src/app/shared/generated'

describe('RolesPermissionsComponent', () => {
  let component: RolesPermissionsComponent
  let fixture: ComponentFixture<RolesPermissionsComponent>

  const authServiceSpy = jasmine.createSpyObj('AUTH_SERVICE', ['getCurrentUser', 'getUserRoles'])

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

  const defaultUserRoles: string[] = ['secondRole', 'firstRole']

  const userProfileServiceSpy = {
    getMyUserProfile: jasmine.createSpy('getMyUserProfile').and.returnValue(of({}))
  }

  const messageServiceMock: jasmine.SpyObj<PortalMessageService> = jasmine.createSpyObj<PortalMessageService>(
    'PortalMessageService',
    ['info', 'error']
  )

  const routerMock = jasmine.createSpyObj<Router>('Router', ['navigateByUrl'])

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RolesPermissionsComponent],
      imports: [
        HttpClientTestingModule,
        TableModule,
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: UserProfileAPIService, useValue: userProfileServiceSpy },
        { provide: PortalMessageService, useValue: messageServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents()
    userProfileServiceSpy.getMyUserProfile.calls.reset()
    messageServiceMock.info.calls.reset()
    messageServiceMock.error.calls.reset()
  }))

  beforeEach(() => {
    userProfileServiceSpy.getMyUserProfile.and.returnValue(of(defaultCurrentUser))
    fixture = TestBed.createComponent(RolesPermissionsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
