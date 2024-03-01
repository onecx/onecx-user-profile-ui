import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { UserProfileComponent } from './user-profile.component'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { HttpClient } from '@angular/common/http'
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
import { HttpLoaderFactory } from '../../shared/shared.module'
import { AUTH_SERVICE, PhoneType, PortalMessageService, UserProfile } from '@onecx/portal-integration-angular'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { of, throwError } from 'rxjs'
import { UserProfileService } from '../user-profile.service'

describe('UserProfileComponent', () => {
  let component: UserProfileComponent
  let fixture: ComponentFixture<UserProfileComponent>

  const authServiceSpy = jasmine.createSpyObj('AUTH_SERVICE', ['getCurrentUser'])

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
        type: PhoneType.MOBILE,
        number: '123456789'
      }
    }
  }

  const newPerson = {
    firstName: 'newName',
    lastName: 'newLastName',
    displayName: 'newDisplayName',
    email: 'newmail@example.com',
    address: {
      street: 'newStreet',
      streetNo: 'newStreetNo',
      city: 'newCity',
      postalCode: 'newCode',
      country: 'newCountry'
    },
    phone: {
      type: PhoneType.LANDLINE,
      number: 'newPhoneNumber'
    }
  }

  const messageServiceMock: jasmine.SpyObj<PortalMessageService> = jasmine.createSpyObj<PortalMessageService>(
    'PortalMessageService',
    ['success', 'error']
  )

  const userProfileServiceSpy = jasmine.createSpyObj<UserProfileService>('UserProfileService', ['updatePersonalInfo'])

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UserProfileComponent],
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: AUTH_SERVICE, useValue: authServiceSpy },
        { provide: PortalMessageService, useValue: messageServiceMock },
        { provide: UserProfileService, useValue: userProfileServiceSpy }
      ]
    }).compileComponents()
    authServiceSpy.getCurrentUser.and.returnValue(defaultCurrentUser)
    userProfileServiceSpy.updatePersonalInfo.and.returnValue(of({}))
    userProfileServiceSpy.updatePersonalInfo.calls.reset()
    messageServiceMock.success.calls.reset()
    messageServiceMock.error.calls.reset()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(component.personalInfo).toEqual(defaultCurrentUser.person)
    expect(component.userId).toBe(defaultCurrentUser.userId)
  })

  it('should create with empty user', () => {
    authServiceSpy.getCurrentUser.and.returnValue({})

    fixture = TestBed.createComponent(UserProfileComponent)
    component = fixture.componentInstance
    fixture.detectChanges()

    expect(component.personalInfo).toEqual({})
    expect(component.userId).toEqual('')
  })

  it('should show success on successful personalInfo update', () => {
    component.onPersonalInfoUpdate(newPerson)

    expect(userProfileServiceSpy.updatePersonalInfo).toHaveBeenCalledOnceWith(newPerson)
    expect(messageServiceMock.success).toHaveBeenCalledOnceWith({ summaryKey: 'PERSONAL_INFO_FORM.MSG.SAVE_SUCCESS' })
  })

  it('should show error on unsuccessful personalInfo update', () => {
    userProfileServiceSpy.updatePersonalInfo.and.returnValue(throwError(() => new Error()))
    component.onPersonalInfoUpdate(newPerson)

    expect(userProfileServiceSpy.updatePersonalInfo).toHaveBeenCalledOnceWith(newPerson)
    expect(messageServiceMock.error).toHaveBeenCalledOnceWith({ summaryKey: 'PERSONAL_INFO_FORM.MSG.SAVE_ERROR' })
  })
})
