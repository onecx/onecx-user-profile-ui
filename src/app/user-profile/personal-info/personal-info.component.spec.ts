import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, fakeAsync, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { of } from 'rxjs'
import { TranslateService } from '@ngx-translate/core'
import { TranslateTestingModule } from 'ngx-translate-testing'

import { PortalMessageService, UserService } from '@onecx/portal-integration-angular'

import { PhoneType, UserProfile, UserPerson, UserProfileAPIService } from 'src/app/shared/generated'
import { PersonalInfoComponent } from './personal-info.component'

describe('PersonalInfoComponent', () => {
  let component: PersonalInfoComponent
  let fixture: ComponentFixture<PersonalInfoComponent>

  const defaultPerson: UserPerson = {
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John Doe Display Name',
    email: 'john.doe@example.com',
    address: {
      street: 'Candy Lane',
      streetNo: '12',
      city: 'Candy Town',
      postalCode: '80243',
      country: 'GB'
    },
    phone: { type: PhoneType.Mobile, number: '123456789' }
  }
  const testPerson: UserPerson = {
    firstName: 'newName',
    lastName: 'newLastName',
    displayName: 'newDisplayName',
    email: 'newmail@example.com',
    address: {
      street: 'newStreet',
      streetNo: 'newStreetNo',
      city: 'newCity',
      postalCode: 'newCode',
      country: 'DE'
    },
    phone: { type: PhoneType.Mobile, number: '+4916883930' }
  }
  const defaultProfile: UserProfile = {
    id: 'userId',
    person: defaultPerson
  }
  const userProfileServiceSpy = {
    getMyUserProfile: jasmine.createSpy('getMyUserProfile').and.returnValue(of({})),
    updateUserPerson: jasmine.createSpy('updateUserPerson').and.returnValue(of({}))
  }
  const messageServiceMock: jasmine.SpyObj<PortalMessageService> = jasmine.createSpyObj<PortalMessageService>(
    'PortalMessageService',
    ['success', 'error']
  )
  const translateServiceSpy = { get: jasmine.createSpy('get').and.returnValue('en') }
  const countriesInfoMock = jasmine.createSpyObj('countriesInfo', ['registerLocale', 'getNames'])
  const userServiceSpy = { hasPermission: jasmine.createSpy('hasPermission').and.returnValue(of()) }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalInfoComponent],
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
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents()

    userProfileServiceSpy.getMyUserProfile.calls.reset()
    userProfileServiceSpy.updateUserPerson.calls.reset()
    userProfileServiceSpy.getMyUserProfile.and.returnValue(of(defaultProfile as UserProfile))
    userServiceSpy.hasPermission.and.returnValue(true)

    countriesInfoMock.getNames.and.returnValue({
      DE: 'Germany',
      GB: 'United Kingdom',
      US: 'United States'
    })
  }))

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(PersonalInfoComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', async () => {
    expect(component).toBeTruthy()
  })

  describe('initialize component: user mode', () => {
    it('should if person was provided then fill form and call createCountryList', fakeAsync(() => {
      component.person = defaultPerson!
      const spyCreateCountry = spyOn<any>(component, 'createCountryList')

      fixture.detectChanges()
      component.ngOnChanges()

      expect(component.person.phone).toEqual(component.formGroup?.value.phone)
      expect(spyCreateCountry).toHaveBeenCalled()
      expect(component.editPermission).toEqual('USERPROFILE#EDIT')
    }))
  })

  describe('initialize component: admin mode', () => {
    it('should if person was provided then fill form and call createCountryList', fakeAsync(() => {
      component.userProfileId = defaultProfile.id
      component.person = defaultPerson!
      const spyCreateCountry = spyOn<any>(component, 'createCountryList')

      fixture.detectChanges()
      component.ngOnChanges()

      expect(component.person.phone).toEqual(component.formGroup?.value.phone)
      expect(spyCreateCountry).toHaveBeenCalled()
      expect(component.editPermission).toEqual('USERPROFILE#ADMIN_EDIT')
    }))

    it('should if person was not provided then no form is filled and countries not filled', () => {
      component.person = {}

      fixture.detectChanges()
      component.ngOnChanges()

      expect(component.person.firstName).toEqual(undefined)
      expect(component.formGroup?.value.phone).toEqual({ type: 'MOBILE', number: '' })
      expect(component.countries).toEqual([])
    })
  })

  describe('Manage address', () => {
    it('should change the Address when Address is not empty', () => {
      spyOn(localStorage, 'removeItem')
      // initially the defaultPerson was filled into form
      component.person = defaultPerson!
      fixture.detectChanges()
      component.ngOnChanges()
      // now change address
      component.addressEdit = true
      component.formGroup?.patchValue({ address: testPerson.address })

      fixture.detectChanges()
      component.updateAddress()

      // new address
      expect(component.person.address).toEqual(testPerson.address)
      expect(component.addressEdit).toBeFalse()
      expect(localStorage.removeItem).toHaveBeenCalled()
    })

    it('should cancel the Address editing', () => {
      // initially the defaultPerson was filled into form
      component.person = defaultPerson!
      fixture.detectChanges()
      component.ngOnChanges()
      // now change address
      component.addressEdit = true
      component.formGroup?.patchValue({ address: testPerson.address })

      fixture.detectChanges()
      component.cancelAddressEdit()

      // old address
      expect(component.person.address).toEqual(defaultPerson.address)
      expect(component.addressEdit).toBeFalse()
    })

    it('should toggle address editing', () => {
      component.toggleAddressEdit()
      expect(component.addressEdit).toBe(true)
    })
  })

  describe('Manage Phone Number', () => {
    it('should change the phone number if not empty', () => {
      spyOn(localStorage, 'removeItem')
      // initially the defaultPerson was filled into form
      component.person = defaultPerson!
      fixture.detectChanges()
      component.ngOnChanges()
      // now change phone number
      component.phoneEdit = true
      component.formGroup?.patchValue({ phone: testPerson.phone })

      fixture.detectChanges()
      component.updatePhone()

      expect(component.person.phone).toEqual(testPerson.phone)
      expect(component.phoneEdit).toBeFalse()
      expect(localStorage.removeItem).toHaveBeenCalled()
    })

    it('should cancel the Phone editing', () => {
      // initially the defaultPerson was filled into form
      component.person = defaultPerson!
      fixture.detectChanges()
      component.ngOnChanges()
      // now change phone
      component.phoneEdit = true
      component.formGroup?.patchValue({ phone: testPerson.phone })

      fixture.detectChanges()
      component.cancelPhoneEdit()

      // old address
      expect(component.person.phone).toEqual(defaultPerson.phone)
      expect(component.phoneEdit).toBeFalse()
    })

    it('should set phone number to empty', () => {
      // initially the defaultPerson was filled into form
      component.person = defaultPerson!
      fixture.detectChanges()
      component.ngOnChanges()
      // now change phone number
      component.phoneEdit = true
      const phone = { type: PhoneType.Mobile, number: '' }
      component.formGroup?.patchValue({ phone: phone })

      fixture.detectChanges()
      component.updatePhone()

      // New phone number
      expect(component.person.phone).toEqual(phone)
      expect(component.phoneEdit).toBeFalse()
    })

    it('should choose a landline phone number', fakeAsync(() => {
      // initially the defaultPerson was filled into form
      component.person = defaultPerson!
      fixture.detectChanges()
      component.ngOnChanges()
      // now change phone number
      component.phoneEdit = true
      const phone = { type: PhoneType.Landline, number: '' }
      component.formGroup?.patchValue({ phone: phone })

      fixture.detectChanges()
      component.updatePhone()

      // New phone number
      expect(component.person.phone).toEqual(phone)
      expect(component.phoneEdit).toBeFalse()
    }))

    it('should toggle Phone editing', () => {
      component.phoneEdit = true
      component.togglePhoneEdit()
      expect(component.phoneEdit).toBeFalse()
    })
  })

  xdescribe('createCountryList', () => {
    let countriesInfo: any

    beforeEach(() => {
      countriesInfo = jasmine.createSpyObj('countriesInfo', ['registerLocale', 'getNames'])
      countriesInfo.getNames.and.returnValue({
        US: 'United States',
        GB: 'United Kingdom',
        DE: 'Germany'
      })
    })

    it('should create country list', async () => {
      //const translateMock = { currentLang: 'en' }

      // Mock the response of dynamic import
      spyOn(window as any, 'import').and.returnValue(
        Promise.resolve({
          default: {
            US: 'United States',
            CA: 'Canada',
            GB: 'United Kingdom'
            // Other country names...
          }
        })
      )

      // Mock the registerLocale method
      spyOn(countriesInfo, 'registerLocale').and.returnValue(undefined)

      // Mock the getNames method
      spyOn(countriesInfo, 'getNames').and.returnValue({
        US: 'United States',
        DE: 'Germany'
      })

      //const person: UserPerson = {} // Mock user data

      //await component.ngOnInit()

      // Assert registerLocale is called with the correct path
      //expect(window.import).toHaveBeenCalledWith(`i18n-iso-countries/langs/${translateMock.currentLang}.json`)
    })
  })
})
