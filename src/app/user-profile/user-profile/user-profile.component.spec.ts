import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { UserProfileComponent } from './user-profile.component'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { PhoneType, PortalMessageService, UserProfile } from '@onecx/portal-integration-angular'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { map, of, throwError } from 'rxjs'
import { UserPerson, UserProfileAPIService } from 'src/app/shared/generated'
import { TranslateTestingModule } from 'ngx-translate-testing'

describe('UserProfileComponent', () => {
  let component: UserProfileComponent
  let fixture: ComponentFixture<UserProfileComponent>

  const userProfileServiceSpy = {
    updateUserPerson: jasmine.createSpy('updateUserPerson').and.returnValue(of({})),
    getMyUserProfile: jasmine.createSpy('getMyUserProfile').and.returnValue(of({}))
  }

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

  const updatedPerson: UserPerson = {
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
      number: 'newPhoneNumber'
    }
  }

  const messageServiceMock: jasmine.SpyObj<PortalMessageService> = jasmine.createSpyObj<PortalMessageService>(
    'PortalMessageService',
    ['success', 'error']
  )

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UserProfileComponent],
      imports: [
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PortalMessageService, useValue: messageServiceMock },
        { provide: UserProfileAPIService, useValue: userProfileServiceSpy }
      ]
    }).compileComponents()
    userProfileServiceSpy.getMyUserProfile.and.returnValue(of(defaultCurrentUser as UserProfile))
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    userProfileServiceSpy.updateUserPerson.calls.reset()
    userProfileServiceSpy.getMyUserProfile.calls.reset()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(userProfileServiceSpy.getMyUserProfile).toHaveBeenCalled
  })

  describe('getMyUserProfile', () => {
    it('should set personalInfo$ to defaultCurrentUser.person', () => {
      userProfileServiceSpy.getMyUserProfile.and.returnValue(of(defaultCurrentUser as UserProfile))

      component.personalInfo$.pipe(map((person) => expect(person).toEqual(defaultCurrentUser.person as UserPerson)))

      component.personalInfo$.subscribe((test) => {
        expect(test).toEqual(defaultCurrentUser.person as UserPerson)
      })
      //   expect(userProfileServiceSpy.getMyUserProfile).toHaveBeenCalled()
    })

    it('should set personalInfo$ empty when getMyUserProfile() returns empty UserProfile', () => {
      userProfileServiceSpy.getMyUserProfile.and.returnValue(of({ person: undefined }))

      component.personalInfo$.pipe(map((person) => expect(person).not.toBeUndefined()))
    })
  })

  describe('onPersonalInfoUpdate', () => {
    it('should call messageService success when updateUserPerson() was successful', () => {
      spyOn(component, 'showMessage').and.callThrough()
      userProfileServiceSpy.updateUserPerson.and.returnValue(of(updatedPerson as UserPerson))

      component.onPersonalInfoUpdate(updatedPerson)
      expect(component.showMessage).toHaveBeenCalledOnceWith('success')
    })

    it('should call messageService success when updateUserPerson() was successful with empty response', () => {
      spyOn(component, 'showMessage').and.callThrough()
      userProfileServiceSpy.updateUserPerson.and.returnValue(of(updatedPerson as UserPerson))

      component.onPersonalInfoUpdate(updatedPerson)
      expect(component.showMessage).toHaveBeenCalledOnceWith('success')
    })

    it('should call messageService error when updateUserPerson() not was successful', () => {
      spyOn(component, 'showMessage').and.callThrough()
      userProfileServiceSpy.updateUserPerson.and.returnValue(throwError(() => new Error('testErrorMessage')))

      component.onPersonalInfoUpdate(updatedPerson)
      expect(component.showMessage).toHaveBeenCalledOnceWith('error')
    })
  })
})
