import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { of, throwError } from 'rxjs'
import { TranslateTestingModule } from 'ngx-translate-testing'

import { PortalMessageService } from '@onecx/portal-integration-angular'

import { PersonalDataAdminComponent } from './personal-data-admin.component'
import { PhoneType, UserPerson, UserProfile, UserProfileAdminAPIService } from 'src/app/shared/generated'

describe('PersonalDataAdminComponent', () => {
  let component: PersonalDataAdminComponent
  let fixture: ComponentFixture<PersonalDataAdminComponent>

  const adminServiceSpy = {
    getUserProfile: jasmine.createSpy('getUserProfile').and.returnValue(of({})),
    updateUserProfile: jasmine.createSpy('updateUserProfile').and.returnValue(of({}))
  }

  const defaultPerson: UserPerson = {
    modificationCount: 0,
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
    phone: { number: '123456789', type: PhoneType.Mobile }
  }
  const defaultProfile: UserProfile = {
    id: 'pid',
    userId: '15',
    person: defaultPerson
  }
  const updatedPerson: UserPerson = {
    modificationCount: 1,
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
    phone: { number: '987654321', type: PhoneType.Mobile }
  }

  const messageServiceMock: jasmine.SpyObj<PortalMessageService> = jasmine.createSpyObj<PortalMessageService>(
    'PortalMessageService',
    ['success', 'error']
  )

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalDataAdminComponent],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('/src/assets/i18n/de.json'),
          en: require('/src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PortalMessageService, useValue: messageServiceMock },
        { provide: UserProfileAdminAPIService, useValue: adminServiceSpy }
      ]
    }).compileComponents()
    adminServiceSpy.getUserProfile.and.returnValue(of(defaultProfile as UserProfile))
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalDataAdminComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    adminServiceSpy.getUserProfile.calls.reset()
    adminServiceSpy.updateUserProfile.calls.reset()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(adminServiceSpy.getUserProfile).toHaveBeenCalled
  })

  describe('get user profile', () => {
    it('should set userPerson$ to defaultProfile.person', (done) => {
      adminServiceSpy.getUserProfile.and.returnValue(of(defaultProfile as UserProfile))
      component.userProfileId = defaultProfile.id

      component.ngOnChanges()
      component.userPerson$.subscribe({
        next: (data) => {
          expect(data).toEqual(defaultProfile.person as UserPerson)
          done()
        },
        error: done.fail
      })
    })

    it('should set userPerson$ empty when getUserProfile() returns empty UserProfile', () => {
      adminServiceSpy.getUserProfile.and.returnValue(of({}))
      component.userProfileId = defaultProfile.id

      component.ngOnChanges()

      component.userPerson$.subscribe((data) => {
        expect(data).toEqual({})
        return data
      })
    })

    it('should display error message if getting user profile failed', (done) => {
      const errorResponse = { status: 403, statusText: 'No permissions to see user profile' }
      adminServiceSpy.getUserProfile.and.returnValue(throwError(() => errorResponse))
      component.userProfileId = defaultProfile.id
      spyOn(console, 'error')
      spyOn(component, 'showMessage').and.callThrough()
      expect().nothing()

      component.ngOnChanges()

      component.userPerson$.subscribe({
        next: () => done(),
        error: () => {
          expect(component.showMessage).toHaveBeenCalledOnceWith('error')
          expect(console.error).toHaveBeenCalledOnceWith('getUserProfile', errorResponse)
          done.fail
        }
      })
    })
  })

  describe('on update profile', () => {
    it('should call messageService success when update user profile was successful', (done) => {
      component.componentInUse = true
      component.userProfileId = defaultProfile.id
      spyOn(component, 'showMessage').and.callThrough()
      const updatedProfile: UserProfile = { ...defaultProfile, person: updatedPerson }
      adminServiceSpy.updateUserProfile.and.returnValue(of(updatedProfile))
      component.onUpdatePerson(updatedPerson)

      component.userPerson$.subscribe({
        next: (data) => {
          expect(data).toEqual(updatedPerson as UserPerson)
          done()
        }
      })
    })

    it('should call messageService error when updateUserProfile() not was successful', () => {
      component.userProfileId = defaultProfile.id
      spyOn(component, 'showMessage').and.callThrough()
      const errorResponse = { status: 400, statusText: 'Profile update failed' }
      adminServiceSpy.updateUserProfile.and.returnValue(throwError(() => errorResponse))

      component.onUpdatePerson(updatedPerson)
      expect(component.showMessage).toHaveBeenCalledOnceWith('error')
    })
  })

  describe('on update profile', () => {
    it('should close dialog and inform caller', () => {
      component.onCloseDetail()

      expect(component.displayDetailDialog).toBeFalse()
    })
  })
})