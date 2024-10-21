import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { map, of, throwError } from 'rxjs'
import { TranslateTestingModule } from 'ngx-translate-testing'

import { PhoneType, PortalMessageService, UserProfile } from '@onecx/portal-integration-angular'
import { UserProfileDetailComponent } from './user-profile-detail.component'
import { UserPerson, UserProfileAPIService } from 'src/app/shared/generated'
import { ActivatedRoute, Router } from '@angular/router'

describe('UserProfileDetailComponent', () => {
  let component: UserProfileDetailComponent
  let fixture: ComponentFixture<UserProfileDetailComponent>
  const activatedRouteMock = {}
  const routerMock = {
    navigate: jasmine.createSpy('navigate')
  }

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
      declarations: [UserProfileDetailComponent],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideHttpClientTesting(),
        provideHttpClient(),
        { provide: PortalMessageService, useValue: messageServiceMock },
        { provide: UserProfileAPIService, useValue: userProfileServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    userProfileServiceSpy.updateUserPerson.calls.reset()
    userProfileServiceSpy.getMyUserProfile.calls.reset()
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

  describe('getMyUserProfile', () => {
    it('should set personalInfo$ to defaultCurrentUser.person', () => {
      userProfileServiceSpy.getMyUserProfile.and.returnValue(of(defaultCurrentUser as UserProfile))
      fixture = TestBed.createComponent(UserProfileDetailComponent)
      component = fixture.componentInstance
      fixture.detectChanges()

      component.personalInfo$.pipe(map((person) => expect(person).toEqual(defaultCurrentUser.person as UserPerson)))

      component.personalInfo$.subscribe((test) => {
        expect(test).toEqual(defaultCurrentUser.person as UserPerson)
      })
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

  it('should navigate to accout settings', () => {
    component.actions$?.subscribe((action) => {
      action[0].actionCallback()
    })

    expect(routerMock.navigate).toHaveBeenCalled()
  })

  it('should navigate to user roles', () => {
    component.actions$?.subscribe((action) => {
      action[1].actionCallback()
    })

    expect(routerMock.navigate).toHaveBeenCalled()
  })
})
