import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing'
import { PersonalInformationComponent } from './personal-information.component'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { PortalMessageService } from '@onecx/portal-integration-angular'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { PhoneType, UserProfile, UserPerson, UserProfileAPIService } from 'src/app/shared/generated'
import { of } from 'rxjs'
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'

describe('PersonalInformationComponent', () => {
  let component: PersonalInformationComponent
  let fixture: ComponentFixture<PersonalInformationComponent>

  const defaultCurrentUser: UserProfile = {
    userId: '15',
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
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PortalMessageService, useValue: messageServiceMock },
        { provide: UserProfileAPIService, useValue: userProfileServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    }).compileComponents()

    userProfileServiceSpy.getMyUserProfile.calls.reset()
    userProfileServiceSpy.updateUserPerson.calls.reset()
    userProfileServiceSpy.getMyUserProfile.and.returnValue(of(defaultCurrentUser as UserProfile))

    // spyOnProperty(component.translate, 'currentLang', 'get').and.returnValue(mockCurrentLang);
    // // Mock the response of dynamic import
    // spyOn(globalThis, 'import')
    // spyOn(component, 'registerLocaleData').and.callFake(async () => {});
    // countriesInfoMock.registerLocale.and.returnValue(of(localeData))
    // countriesInfoMock.getNames.and.returnValue({
    //   US: 'United States',
    //   GB: 'United Kingdom',
    //   DE: 'Germany'
    // })

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
    let personalInfoValue: UserPerson = {}
    let userIdValue = ''

    expect(component).toBeTruthy()
    expect(userProfileServiceSpy.getMyUserProfile).toHaveBeenCalled()
    component.personalInfo$.subscribe((person) => (personalInfoValue = person))

    expect(personalInfoValue).toEqual(defaultCurrentUser.person as UserPerson)
  })

  describe('initialization and changes', () => {
    it('should call createCountryList', fakeAsync(() => {
      component.formUpdates$ = of({})

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
      component.ngOnInit()
      tick(2000)

      component.formUpdates$.subscribe((person) => {
        const p: any = person
        console.log(p)
        expect(p.firstName).toEqual(undefined)
      })
      tick(2000)
      expect(spyCreateCountry).toHaveBeenCalled()
    }))

    it('should call createCountryList empty personalInfo', fakeAsync(() => {
      component.formUpdates$ = of({})
      component.personalInfo$ = of()

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

      // spy = spyOn(component.createCountryList).and.returnValue(false);

      fixture.detectChanges()
      component.ngOnInit()
      tick(2000)

      component.formUpdates$.subscribe((person) => {
        const p: any = person
        expect(p.firstName).toEqual(null)
      })
      tick(2000)
      expect(spyCreateCountry).not.toHaveBeenCalled()
    }))

    it('should call onChanges personalInfo', fakeAsync(() => {
      component.formUpdates$ = of({})

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
        expect(p.firstName).toEqual(defaultCurrentUser.person?.firstName)
        expect(p.lastName).toEqual(defaultCurrentUser.person?.lastName)
      })
    }))

    xit('should call onChanges empty formGroup', fakeAsync(() => {
      component.formUpdates$ = of({})

      // the following needs a different solution
      //component.formGroup = undefined!

      fixture.detectChanges()
      component.ngOnChanges()
      tick(2000)

      component.formUpdates$.subscribe((person) => {
        const p: any = person
        expect(p).toBeUndefined()
      })
      tick(1000)
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

      component.formUpdates$ = of({})

      fixture.detectChanges()
      component.updateAddress()

      component.formUpdates$.subscribe((person) => {
        expect(person).toEqual(defaultCurrentUser.person)
      })
    }))

    it('should change the Adress when Adress is empty', fakeAsync(() => {
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
          number: new UntypedFormControl('')
        })
      })

      spyOn(component.personalInfoUpdate, 'emit')
      spyOn(localStorage, 'removeItem')

      component.formUpdates$ = of({})
      fixture.detectChanges()
      component.updateAddress()
      tick(1000)

      component.formUpdates$.subscribe((person) => {
        const p: any = person
        expect(p.address).toEqual(defaultCurrentUser.person?.address)
      })

      expect(component.personalInfoUpdate.emit).toHaveBeenCalled()
      expect(localStorage.removeItem).toHaveBeenCalled()
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

      component.formUpdates$ = of({})

      fixture.detectChanges()
      component.cancelAddressEdit()

      component.formUpdates$.subscribe((person) => {
        expect(person).toEqual(defaultCurrentUser.person)
      })

      expect(component.addressEdit).toBeFalse()
    }))

    it('should toggle address edit mode', () => {
      component.toggleAddressEdit()
      expect(component.addressEdit).toBe(true)
    })

    xit('should revert address form fields to original values on cancel', () => {
      // Mock personalInfo with sample address data
      const personalInfo = {
        address: {
          street: '123 Main St',
          streetNo: 'Apt 4B',
          postalCode: '12345',
          city: 'Sample City',
          country: 'DE'
        }
      }

      // Set initial form values (modify as needed)
      component.formGroup.patchValue({
        address: {
          street: 'Modified Street',
          streetNo: 'Modified Apt',
          postalCode: '54321',
          city: 'Modified City',
          country: 'US'
        }
      })

      // Call the cancelAddressEdit method
      component.cancelAddressEdit()

      // Check if form values are reverted to original personalInfo values
      expect(component.formGroup.value.address.street).toBe(personalInfo.address.street)
      expect(component.formGroup.value.address.streetNo).toBe(personalInfo.address.streetNo)
      expect(component.formGroup.value.address.postalCode).toBe(personalInfo.address.postalCode)
      expect(component.formGroup.value.address.city).toBe(personalInfo.address.city)
      expect(component.formGroup.value.address.country).toBe(personalInfo.address.country)
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

describe('PersonalInformationComponent', () => {
  let component: PersonalInformationComponent
  let fixture: ComponentFixture<PersonalInformationComponent>

  const userProfileServiceSpy = {
    updateUserPerson: jasmine.createSpy('updateUserPerson').and.returnValue(of({})),
    getMyUserProfile: jasmine.createSpy('getMyUserProfile').and.returnValue(of({}))
  }

  const messageServiceMock: jasmine.SpyObj<PortalMessageService> = jasmine.createSpyObj<PortalMessageService>(
    'PortalMessageService',
    ['success', 'error']
  )

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalInformationComponent],
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
    userProfileServiceSpy.getMyUserProfile.and.returnValue(of({}))
  }))

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(PersonalInformationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create with empty user', async () => {
    let personalInfoValue: UserPerson = {}
    let userIdValue = ''

    expect(component).toBeTruthy()
    expect(userProfileServiceSpy.getMyUserProfile).toHaveBeenCalled()
    component.personalInfo$.subscribe((person) => (personalInfoValue = person))

    expect(personalInfoValue).toEqual({})
  })
})
