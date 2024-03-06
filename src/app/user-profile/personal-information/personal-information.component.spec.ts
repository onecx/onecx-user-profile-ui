// import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
// import { PersonalInformationComponent } from './personal-information.component'
// import { HttpClientTestingModule } from '@angular/common/http/testing'
// import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
// import { HttpLoaderFactory } from '../../shared/shared.module'
// import { HttpClient } from '@angular/common/http'
// import { NO_ERRORS_SCHEMA } from '@angular/core'
// import { AUTH_SERVICE, PhoneType, UserPerson, UserProfile } from '@onecx/portal-integration-angular'

// describe('PersonalInformationComponent', () => {
//   let component: PersonalInformationComponent
//   let fixture: ComponentFixture<PersonalInformationComponent>

//   const authServiceSpy = jasmine.createSpyObj('AUTH_SERVICE', ['getCurrentUser'])

//   const defaultCurrentUser: UserProfile = {
//     userId: '15',
//     person: {
//       firstName: 'John',
//       lastName: 'Doe',
//       displayName: 'John Doe Display Name',
//       email: 'john.doe@example.com',
//       address: {
//         street: 'Candy Lane',
//         streetNo: '12',
//         city: 'Candy Town',
//         postalCode: '80-243',
//         country: 'EN'
//       },
//       phone: {
//         type: PhoneType.MOBILE,
//         number: '123456789'
//       }
//     }
//   }

//   beforeEach(waitForAsync(() => {
//     TestBed.configureTestingModule({
//       declarations: [PersonalInformationComponent],
//       imports: [
//         HttpClientTestingModule,
//         TranslateModule.forRoot({
//           loader: {
//             provide: TranslateLoader,
//             useFactory: HttpLoaderFactory,
//             deps: [HttpClient]
//           }
//         })
//       ],
//       schemas: [NO_ERRORS_SCHEMA],
//       providers: [{ provide: AUTH_SERVICE, useValue: authServiceSpy }]
//     }).compileComponents()
//     authServiceSpy.getCurrentUser.and.returnValue(defaultCurrentUser)
//   }))

//   beforeEach(() => {
//     fixture = TestBed.createComponent(PersonalInformationComponent)
//     component = fixture.componentInstance
//     fixture.detectChanges()
//     spyOn(component, 'getCountryNames').and.returnValue(
//       Promise.resolve({
//         PL: 'Poland',
//         DE: 'Germany'
//       })
//     )
//     component.countries = []
//   })

//   it('should create', async () => {
//     await component.ngOnInit()

//     expect(component).toBeTruthy()
//     expect(component.personalInfo).toEqual(defaultCurrentUser.person)
//     expect(component.userId).toBe(defaultCurrentUser.userId)
//     expect(component.countries).toEqual([
//       {
//         label: '',
//         value: null
//       },
//       {
//         label: 'Poland',
//         value: 'PL'
//       },
//       {
//         label: 'Germany',
//         value: 'DE'
//       }
//     ])
//   })

//   it('should create with empty user', async () => {
//     authServiceSpy.getCurrentUser.and.returnValue({})

//     fixture = TestBed.createComponent(PersonalInformationComponent)
//     component = fixture.componentInstance
//     fixture.detectChanges()

//     spyOn(component, 'getCountryNames').and.returnValue(
//       Promise.resolve({
//         PL: 'Poland',
//         DE: 'Germany'
//       })
//     )
//     component.countries = []

//     await component.ngOnInit()

//     expect(component.personalInfo).toEqual({})
//     expect(component.userId).toBe('')
//     expect(component.countries).toEqual([
//       {
//         label: '',
//         value: null
//       },
//       {
//         label: 'Poland',
//         value: 'PL'
//       },
//       {
//         label: 'Germany',
//         value: 'DE'
//       }
//     ])
//     expect(component.formGroup.value).toEqual({
//       address: {
//         street: '',
//         streetNo: '',
//         city: '',
//         postalCode: '',
//         country: 'DE'
//       },
//       phone: {
//         type: PhoneType.MOBILE,
//         number: ''
//       }
//     })
//   })

//   it('should reset form on address edit cancel', async () => {
//     await component.ngOnInit()

//     component.toggleAddressEdit()

//     fixture.detectChanges()

//     const newAddress = {
//       street: 'newInputStreet',
//       streetNo: '12345',
//       postalCode: '12-345',
//       city: 'newCity',
//       country: 'newCountry'
//     }

//     component.formGroup.value['address'] = newAddress

//     component.cancelAddressEdit()

//     fixture.detectChanges()

//     expect(component.formGroup.value['address']).toEqual(defaultCurrentUser.person.address)
//     expect(component.addressEdit).toBeFalse()
//   })

//   it('should update information and emit on address edit save', async () => {
//     spyOn(localStorage, 'removeItem')
//     spyOn(component.personalInfoUpdate, 'emit')

//     await component.ngOnInit()

//     component.toggleAddressEdit()

//     fixture.detectChanges()

//     const newAddress = {
//       street: 'newInputStreet',
//       streetNo: '12345',
//       postalCode: '12-345',
//       city: 'newCity',
//       country: 'newCountry'
//     }

//     component.formGroup.value['address'] = newAddress

//     component.updateAddress()

//     fixture.detectChanges()

//     expect(component.personalInfo.address).toEqual(newAddress)
//     expect(component.addressEdit).toBeFalse()
//     expect(localStorage.removeItem).toHaveBeenCalledOnceWith('tkit_user_profile')
//     expect(component.personalInfoUpdate.emit).toHaveBeenCalledOnceWith(component.personalInfo)
//   })

//   it('should reset form on phone edit cancel', async () => {
//     await component.ngOnInit()

//     component.togglePhoneEdit()

//     fixture.detectChanges()

//     const newPhone = {
//       type: PhoneType.LANDLINE,
//       number: '111222333'
//     }

//     component.formGroup.value['phone'] = newPhone

//     component.cancelPhoneEdit()

//     fixture.detectChanges()

//     expect(component.formGroup.value['phone']).toEqual(defaultCurrentUser.person.phone)
//     expect(component.phoneEdit).toBeFalse()
//   })

//   it('should update information and emit on phone edit save', async () => {
//     spyOn(localStorage, 'removeItem')
//     spyOn(component.personalInfoUpdate, 'emit')

//     await component.ngOnInit()

//     component.togglePhoneEdit()

//     fixture.detectChanges()

//     const newPhone = {
//       type: PhoneType.LANDLINE,
//       number: '111222333'
//     }

//     component.formGroup.value['phone'] = newPhone

//     component.updatePhone()

//     fixture.detectChanges()

//     expect(component.personalInfo.phone).toEqual(newPhone)
//     expect(component.phoneEdit).toBeFalse()
//     expect(localStorage.removeItem).toHaveBeenCalledOnceWith('tkit_user_profile')
//     expect(component.personalInfoUpdate.emit).toHaveBeenCalledOnceWith(component.personalInfo)
//   })

//   it('should update form based on inputs', async () => {
//     await component.ngOnInit()

//     expect(component.formGroup.value).toEqual({
//       address: defaultCurrentUser.person.address,
//       phone: defaultCurrentUser.person.phone
//     })

//     const newProfile: UserPerson = {
//       firstName: 'John',
//       lastName: 'Doe',
//       displayName: 'John Doe Display Name',
//       email: 'john.doe@example.com',
//       address: {
//         street: 'Candy Lane',
//         streetNo: '12',
//         city: 'Candy Town',
//         postalCode: '80-243',
//         country: 'EN'
//       },
//       phone: {
//         type: PhoneType.MOBILE,
//         number: '123456789'
//       }
//     }

//     component.personalInfo = newProfile

//     component.ngOnChanges()

//     expect(component.formGroup.value).toEqual({
//       address: newProfile.address,
//       phone: newProfile.phone
//     })
//   })
// })
