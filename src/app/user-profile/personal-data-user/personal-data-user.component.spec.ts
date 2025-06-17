import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { ActivatedRoute, Router } from '@angular/router'
import { map, of, throwError } from 'rxjs'
import { TranslateTestingModule } from 'ngx-translate-testing'

import { PortalMessageService } from '@onecx/angular-integration-interface'

import { PhoneType, UserPerson, UserProfile, UserProfileAPIService } from 'src/app/shared/generated'
import { PersonalDataUserComponent } from './personal-data-user.component'

const myPerson: UserPerson = {
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
const myProfile: UserProfile = {
  id: 'id',
  userId: 'userId',
  tenantId: 'tenantId',
  person: myPerson
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

describe('PersonalDataUserComponent', () => {
  let component: PersonalDataUserComponent
  let fixture: ComponentFixture<PersonalDataUserComponent>
  const activatedRouteMock = {}
  const routerMock = { navigate: jasmine.createSpy('navigate') }

  const userProfileServiceSpy = {
    updateUserPerson: jasmine.createSpy('updateUserPerson').and.returnValue(of({})),
    getMyUserProfile: jasmine.createSpy('getMyUserProfile').and.returnValue(of({}))
  }
  const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error', 'info'])

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalDataUserComponent],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PortalMessageService, useValue: msgServiceSpy },
        { provide: UserProfileAPIService, useValue: userProfileServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalDataUserComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('get my profile data', () => {
    afterAll(() => {
      userProfileServiceSpy.updateUserPerson.calls.reset()
      userProfileServiceSpy.getMyUserProfile.calls.reset()
      userProfileServiceSpy.getMyUserProfile.and.returnValue(of({}))
    })

    it('should handle empty object returned', () => {
      userProfileServiceSpy.getMyUserProfile.and.returnValue(of({}))

      component.userProfile$?.subscribe((data) => {
        expect(data).toEqual({})
      })
    })

    it('should handle empty profile', () => {
      userProfileServiceSpy.getMyUserProfile.and.returnValue(of({}))
      expect().nothing()

      component.userProfile$.pipe(map((data) => expect(data).not.toBeUndefined()))
    })

    it('should handle profile data', () => {
      userProfileServiceSpy.getMyUserProfile.and.returnValue(of(myProfile))
      fixture = TestBed.createComponent(PersonalDataUserComponent)
      component = fixture.componentInstance
      fixture.detectChanges()

      component.userProfile$.subscribe((data) => {
        expect(data).toEqual(myProfile)
      })
    })

    it('should handle error case', (done) => {
      const errorResponse = { status: 404, statusText: 'Not Found' }
      userProfileServiceSpy.getMyUserProfile.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')
      fixture = TestBed.createComponent(PersonalDataUserComponent)
      component = fixture.componentInstance
      fixture.detectChanges()

      component.userProfile$?.subscribe({
        next: (data) => {
          expect(data).toEqual({})
          expect(component.exceptionKey).toEqual('EXCEPTIONS.HTTP_STATUS_' + errorResponse.status + '.PROFILE')
          expect(console.error).toHaveBeenCalledWith('getMyUserProfile', errorResponse)
          done()
        },
        error: done.fail
      })
    })
  })

  describe('onPersonUpdate', () => {
    it('should call messageService success when updateUserPerson() was successful', () => {
      spyOn(component, 'showMessage').and.callThrough()
      userProfileServiceSpy.updateUserPerson.and.returnValue(of(updatedPerson))

      component.onPersonUpdate(updatedPerson, myProfile)

      expect(component.showMessage).toHaveBeenCalledOnceWith('success')
      component.userProfile$.subscribe((data) => {
        expect(data).toEqual({ ...myProfile, person: updatedPerson })
      })
    })

    it('should call messageService success when updateUserPerson() was successful with empty response', () => {
      spyOn(component, 'showMessage').and.callThrough()
      userProfileServiceSpy.updateUserPerson.and.returnValue(of(updatedPerson as UserPerson))

      component.onPersonUpdate(updatedPerson, myProfile)

      expect(component.showMessage).toHaveBeenCalledOnceWith('success')
    })

    it('should call messageService error when updateUserPerson() not was successful', () => {
      const errorResponse = { status: 400, statusText: 'Update person failed' }
      userProfileServiceSpy.updateUserPerson.and.returnValue(throwError(() => errorResponse))
      spyOn(component, 'showMessage').and.callThrough()
      spyOn(console, 'error')

      component.onPersonUpdate(updatedPerson, myProfile)

      expect(component.showMessage).toHaveBeenCalledOnceWith('error')
      expect(console.error).toHaveBeenCalledWith('updateUserPerson', errorResponse)
    })
  })

  describe('navigate', () => {
    it('should navigate to account settings', () => {
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
})
