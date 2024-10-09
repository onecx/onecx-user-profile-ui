/* eslint-disable @typescript-eslint/no-unused-vars */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { Router } from '@angular/router'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { of } from 'rxjs'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { TableModule } from 'primeng/table'

import { RolesPermissionsComponent } from './roles-permissions.component'
import { PortalMessageService } from '@onecx/portal-integration-angular'
import { PhoneType, UserProfile, UserProfileAPIService } from 'src/app/shared/generated'

describe('RolesPermissionsComponent', () => {
  let component: RolesPermissionsComponent
  let fixture: ComponentFixture<RolesPermissionsComponent>

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
