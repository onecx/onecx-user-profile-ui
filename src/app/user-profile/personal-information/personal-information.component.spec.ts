import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing'
import { PersonalInformationComponent } from './personal-information.component'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { PortalMessageService } from '@onecx/portal-integration-angular'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { PhoneType, UserProfile, UserPerson, UserProfileAPIService } from 'src/app/shared/generated'
import { of } from 'rxjs'
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'

describe('PersonalInformationComponent', () => {
  let component: PersonalInformationComponent
  let fixture: ComponentFixture<PersonalInformationComponent>

  const defaultCurrentUser: UserProfile = {
    id: 'testId',
    person: {
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'John Doe Display Name',
      email: 'john.doe@example.com',
      address: {
        street: 'Candy Lane',
        streetNo: '12',
        city: 'Candy Town',
        postalCode: '80243',
        country: 'EN'
      },
      phone: {
        type: PhoneType.Mobile,
        number: '123456789'
      }
    }
  }

  const testUserPerson: UserPerson = {
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
      type: PhoneType.Mobile,
      number: '+4916883930'
    }
  }

  const userProfileServiceSpy = {
    getMyUserProfile: jasmine.createSpy('getMyUserProfile').and.returnValue(of({})),
    updateUserPerson: jasmine.createSpy('updateUserPerson').and.returnValue(of({}))
  }

  const messageServiceMock: jasmine.SpyObj<PortalMessageService> = jasmine.createSpyObj<PortalMessageService>(
    'PortalMessageService',
    ['success', 'error']
  )

  const translateServiceSpy = {
    get: jasmine.createSpy('get').and.returnValue('en')
  }

  const countriesInfoMock = jasmine.createSpyObj('countriesInfo', ['registerLocale', 'getNames'])

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalInformationComponent],
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
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    }).compileComponents()

    userProfileServiceSpy.getMyUserProfile.calls.reset()
    userProfileServiceSpy.updateUserPerson.calls.reset()
    userProfileServiceSpy.getMyUserProfile.and.returnValue(of(defaultCurrentUser as UserProfile))

    countriesInfoMock.getNames.and.returnValue({
      US: 'United States',
      GB: 'United Kingdom',
      DE: 'Germany'
    })
  }))

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(PersonalInformationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', async () => {
    expect(component).toBeTruthy()
  })

  describe('initialization and changes', () => {
    it('should call createCountryList', fakeAsync(() => {
      component.formUpdates$ = of({})
      component.personalInfo = testUserPerson

      component.formGroup = new UntypedFormGroup({
        address: new UntypedFormGroup({
          street: new UntypedFormControl('newStreet'),
          streetNo: new UntypedFormControl('newStreetNo'),
          postalCode: new UntypedFormControl('80243'),
          city: new UntypedFormControl('newCity'),
          country: new UntypedFormControl('newCountry')
        }),
        phone: new UntypedFormGroup({
          type: new UntypedFormControl(PhoneType.Mobile),
          number: new UntypedFormControl('+4916883930')
        })
      })

      const spyCreateCountry = spyOn<any>(component, 'createCountryList').and.callFake(() => {
        return Promise.resolve({
          testUserPerson
        })
      })

      fixture.detectChanges()
      component.ngOnChanges()
      tick(2000)

      component.formUpdates$.subscribe((person) => {
        const p: any = person
        console.log(p)
        expect(p.firstName).toEqual('newName')
      })
      tick(2000)
      expect(spyCreateCountry).toHaveBeenCalled()
    }))

    it('should call createCountryList empty personalInfo', fakeAsync(() => {
      component.formUpdates$ = of({})
      component.personalInfo = {}

      component.formGroup = new UntypedFormGroup({
        address: new UntypedFormGroup({
          street: new UntypedFormControl('newStreet'),
          streetNo: new UntypedFormControl('newStreetNo'),
          postalCode: new UntypedFormControl('80243'),
          city: new UntypedFormControl('newCity'),
          country: new UntypedFormControl('newCountry')
        }),
        phone: new UntypedFormGroup({
          type: new UntypedFormControl(PhoneType.Mobile),
          number: new UntypedFormControl('+4916883930')
        })
      })

      const spyCreateCountry = spyOn<any>(component, 'createCountryList').and.callFake(() => {
        return Promise.resolve({
          testUserPerson
        })
      })

      fixture.detectChanges()
      component.ngOnChanges()
      tick(2000)

      component.formUpdates$.subscribe((person) => {
        const p: any = person
        expect(p.firstName).toEqual(undefined)
      })
      tick(2000)
      expect(spyCreateCountry).toHaveBeenCalled()
    }))

    it('should call onChanges as admin with empty personal info', fakeAsync(() => {
      component.formUpdates$ = of({})
      component.admin = true
      component.personalInfo = {}

      component.formGroup = new UntypedFormGroup({
        address: new UntypedFormGroup({
          street: new UntypedFormControl('newStreet'),
          streetNo: new UntypedFormControl('newStreetNo'),
          postalCode: new UntypedFormControl('80243'),
          city: new UntypedFormControl('newCity'),
          country: new UntypedFormControl('newCountry')
        }),
        phone: new UntypedFormGroup({
          type: new UntypedFormControl(PhoneType.Mobile),
          number: new UntypedFormControl('+4916883930')
        })
      })

      fixture.detectChanges()
      component.ngOnChanges()
      tick(2000)

      component.formUpdates$.subscribe((person) => {
        const p: any = person
        expect(p.firstName).toEqual(undefined)
        expect(p.lastName).toEqual(undefined)
      })
    }))
  })

  describe('Address', () => {
    it('should change the Address when Address is not empty', fakeAsync(() => {
      component.formGroup = new UntypedFormGroup({
        address: new UntypedFormGroup({
          street: new UntypedFormControl('newStreet'),
          streetNo: new UntypedFormControl('1'),
          postalCode: new UntypedFormControl('80000'),
          city: new UntypedFormControl('newCity'),
          country: new UntypedFormControl('DE')
        }),
        phone: new UntypedFormGroup({
          type: new UntypedFormControl(PhoneType.Mobile),
          number: new UntypedFormControl('+4916883930')
        })
      })
      component.personalInfo = testUserPerson

      component.formUpdates$ = of({})

      fixture.detectChanges()
      component.updateAddress()

      component.formUpdates$.subscribe((person) => {
        expect(person).toEqual(testUserPerson)
      })
    }))

    it('should cancel the Address Edit', fakeAsync(() => {
      component.formGroup = new UntypedFormGroup({
        address: new UntypedFormGroup({
          street: new UntypedFormControl('newStreet'),
          streetNo: new UntypedFormControl('1'),
          postalCode: new UntypedFormControl('80000'),
          city: new UntypedFormControl('newCity'),
          country: new UntypedFormControl('DE')
        }),
        phone: new UntypedFormGroup({
          type: new UntypedFormControl(PhoneType.Mobile),
          number: new UntypedFormControl('+4916883930')
        })
      })
      component.personalInfo = testUserPerson
      component.formUpdates$ = of({})

      fixture.detectChanges()
      component.cancelAddressEdit()

      component.formUpdates$.subscribe((person) => {
        expect(person).toEqual(testUserPerson)
      })
      expect(component.addressEdit).toBeFalse()
    }))

    it('should toggle address edit mode', () => {
      component.toggleAddressEdit()
      expect(component.addressEdit).toBe(true)
    })
  })

  describe('Phone Number', () => {
    it('should update phone details and emit personalInfo', fakeAsync(() => {
      tick(1000)
      fixture.detectChanges()
      component.formGroup = new UntypedFormGroup({
        address: new UntypedFormGroup({
          street: new UntypedFormControl(''),
          streetNo: new UntypedFormControl(''),
          postalCode: new UntypedFormControl(''),
          city: new UntypedFormControl(''),
          country: new UntypedFormControl('')
        }),
        phone: new UntypedFormGroup({
          type: new UntypedFormControl(PhoneType.Mobile),
          number: new UntypedFormControl('+49016792030')
        })
      })
      component.personalInfo = testUserPerson
      spyOn(component.personalInfoUpdate, 'emit')
      spyOn(localStorage, 'removeItem')

      component.formUpdates$ = of({})
      component.phoneEdit = true
      fixture.detectChanges()
      component.updatePhone()

      component.formUpdates$.subscribe((personalInfo) => {
        const p: any = personalInfo
        expect(p.phone).toEqual(component.formGroup.value.phone)
      })

      expect(component.phoneEdit).toBeFalse()
      expect(component.personalInfoUpdate.emit).toHaveBeenCalled()
      expect(localStorage.removeItem).toHaveBeenCalled()
    }))

    it('should set phone number to empty', fakeAsync(() => {
      tick(1000)
      fixture.detectChanges()
      component.formGroup = new UntypedFormGroup({
        address: new UntypedFormGroup({
          street: new UntypedFormControl(''),
          streetNo: new UntypedFormControl(''),
          postalCode: new UntypedFormControl(''),
          city: new UntypedFormControl(''),
          country: new UntypedFormControl('')
        }),
        phone: new UntypedFormGroup({
          type: new UntypedFormControl(PhoneType.Mobile),
          number: new UntypedFormControl()
        })
      })
      component.personalInfo = testUserPerson
      spyOn(component.personalInfoUpdate, 'emit')
      spyOn(localStorage, 'removeItem')

      component.formUpdates$ = of({})
      component.phoneEdit = true
      fixture.detectChanges()
      component.updatePhone()

      component.formUpdates$.subscribe((personalInfo) => {
        const p: any = personalInfo
        expect(p.phone).toEqual(component.formGroup.value.phone)
      })

      expect(component.phoneEdit).toBeFalse()
      expect(component.personalInfoUpdate.emit).toHaveBeenCalled()
      expect(localStorage.removeItem).toHaveBeenCalled()
    }))

    it('should choose a landline phone number', fakeAsync(() => {
      tick(1000)
      fixture.detectChanges()
      component.formGroup = new UntypedFormGroup({
        address: new UntypedFormGroup({
          street: new UntypedFormControl(''),
          streetNo: new UntypedFormControl(''),
          postalCode: new UntypedFormControl(''),
          city: new UntypedFormControl(''),
          country: new UntypedFormControl('')
        }),
        phone: new UntypedFormGroup({
          type: new UntypedFormControl(PhoneType.Landline),
          number: new UntypedFormControl('08967821')
        })
      })
      component.personalInfo = testUserPerson
      spyOn(component.personalInfoUpdate, 'emit')
      spyOn(localStorage, 'removeItem')

      component.formUpdates$ = of({})
      component.phoneEdit = true
      fixture.detectChanges()
      component.updatePhone()

      component.formUpdates$.subscribe((personalInfo) => {
        const p: any = personalInfo
        expect(p.phone).toEqual(component.formGroup.value.phone)
      })

      expect(component.phoneEdit).toBeFalse()
      expect(component.personalInfoUpdate.emit).toHaveBeenCalled()
      expect(localStorage.removeItem).toHaveBeenCalled()
    }))

    it('should cancelPhoneEdit', fakeAsync(() => {
      component.formGroup = new UntypedFormGroup({
        address: new UntypedFormGroup({
          street: new UntypedFormControl(''),
          streetNo: new UntypedFormControl(''),
          postalCode: new UntypedFormControl(''),
          city: new UntypedFormControl(''),
          country: new UntypedFormControl('')
        }),
        phone: new UntypedFormGroup({
          type: new UntypedFormControl(PhoneType.Landline),
          number: new UntypedFormControl('08967821')
        })
      })
      component.personalInfo = testUserPerson
      component.formUpdates$ = of({})
      component.phoneEdit = true
      fixture.detectChanges()
      component.cancelPhoneEdit()

      component.formUpdates$.subscribe((personalInfo) => {
        const p: any = personalInfo
        expect(p.phone).toEqual(component.formGroup.value.phone)
      })
      tick(1000)

      expect(component.phoneEdit).toBeFalse()
    }))

    it('should cancelPhoneEdit', fakeAsync(() => {
      component.phoneEdit = true
      component.togglePhoneEdit()
      expect(component.phoneEdit).toBeFalse()
    }))
  })

  // fdescribe('createCountryList', () => {
  // let countriesInfoMock: any;

  // beforeEach(() => {

  //     countriesInfoMock = jasmine.createSpyObj('countriesInfo', ['registerLocale', 'getNames']);
  //     countriesInfoMock.getNames.and.returnValue({
  //         "US": "United States",
  //         "GB": "United Kingdom",
  //         "DE": "Germany",
  //     });

  // });

  // it('should create country list', async () => {
  // const translateMock = { currentLang: 'en' };

  // // Mock the response of dynamic import
  // spyOn(window as any, 'import').and.returnValue(Promise.resolve({
  //   default: {
  //     "US": "United States",
  //     "CA": "Canada",
  //     "GB": "United Kingdom",
  //     // Other country names...
  //   }
  // }));

  // // Mock the registerLocale method
  // spyOn(countriesInfo, 'registerLocale').and.returnValue(undefined);

  // // Mock the getNames method
  // spyOn(countriesInfo, 'getNames').and.returnValue({
  //   "US": "United States",
  //   "DE": "Germany",
  // });

  // const personalInfo: UserPerson = {}; // Mock user data

  // await component.ngOnInit();

  // // Assert registerLocale is called with the correct path
  // expect(window.import).toHaveBeenCalledWith(`i18n-iso-countries/langs/${translateMock.currentLang}.json`);

  // });
  // })
})
