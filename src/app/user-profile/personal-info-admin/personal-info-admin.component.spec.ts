import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { map, of, throwError } from 'rxjs'
import { TranslateTestingModule } from 'ngx-translate-testing'

import { PhoneType, PortalMessageService, UserProfile } from '@onecx/portal-integration-angular'
import { PersonalInfoAdminComponent } from './personal-info-admin.component'
import { UserPerson, UserProfileAdminAPIService } from 'src/app/shared/generated'

describe('PersonalInfoAdminComponent', () => {
  let component: PersonalInfoAdminComponent
  let fixture: ComponentFixture<PersonalInfoAdminComponent>

  const adminServiceSpy = {
    updateUserProfile: jasmine.createSpy('updateUserProfile').and.returnValue(of({})),
    getUserProfile: jasmine.createSpy('getUserProfile').and.returnValue(of({}))
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
      declarations: [PersonalInfoAdminComponent],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('/src/assets/i18n/de.json'),
          en: require('/src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideHttpClientTesting(),
        provideHttpClient(),
        { provide: PortalMessageService, useValue: messageServiceMock },
        { provide: UserProfileAdminAPIService, useValue: adminServiceSpy }
      ]
    }).compileComponents()
    adminServiceSpy.getUserProfile.and.returnValue(of(defaultCurrentUser as UserProfile))
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalInfoAdminComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    adminServiceSpy.updateUserProfile.calls.reset()
    adminServiceSpy.getUserProfile.calls.reset()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(adminServiceSpy.getUserProfile).toHaveBeenCalled
  })

  describe('getUserProfile', () => {
    it('should set personalInfo$ to defaultCurrentUser.person', () => {
      adminServiceSpy.getUserProfile.and.returnValue(of(defaultCurrentUser as UserProfile))
      component.userProfileId = 'id'
      component.userProfileId = 'id'

      component.ngOnChanges()

      component.personalInfo$.pipe(map((person) => expect(person).toEqual(defaultCurrentUser.person as UserPerson)))
      component.personalInfo$.subscribe((test) => {
        expect(test).toEqual(defaultCurrentUser.person as UserPerson)
      })
    })

    it('should set personalInfo$ empty when getUserProfile() returns empty UserProfile', () => {
      adminServiceSpy.getUserProfile.and.returnValue(of({ person: undefined }))
      component.userProfileId = 'id'

      component.ngOnChanges()

      component.personalInfo$.pipe(map((person) => expect(person).not.toBeUndefined()))
    })
  })

  describe('onPersonalInfoUpdate', () => {
    it('should call messageService success when updateUserProfile() was successful', () => {
      spyOn(component, 'showMessage').and.callThrough()
      adminServiceSpy.updateUserProfile.and.returnValue(of(updatedPerson as UserPerson))

      component.onPersonalInfoUpdate(updatedPerson)
      expect(component.showMessage).toHaveBeenCalledOnceWith('success')
    })

    it('should call messageService success when updateUserProfile() was successful with empty response', () => {
      spyOn(component, 'showMessage').and.callThrough()
      adminServiceSpy.updateUserProfile.and.returnValue(of(updatedPerson as UserPerson))

      component.onPersonalInfoUpdate(updatedPerson)
      expect(component.showMessage).toHaveBeenCalledOnceWith('success')
    })

    it('should call messageService error when updateUserProfile() not was successful', () => {
      spyOn(component, 'showMessage').and.callThrough()
      adminServiceSpy.updateUserProfile.and.returnValue(throwError(() => new Error('testErrorMessage')))

      component.onPersonalInfoUpdate(updatedPerson)
      expect(component.showMessage).toHaveBeenCalledOnceWith('error')
    })
  })
})
