import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import { SelectItem } from 'primeng/api'
import { TranslateService } from '@ngx-translate/core'
import * as countriesInfo from 'i18n-iso-countries'
import { AUTH_SERVICE, IAuthService, PhoneType, UserPerson } from '@onecx/portal-integration-angular'

@Component({
  selector: 'up-personal-info-form',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss']
})
export class PersonalInformationComponent implements OnInit, OnChanges {
  @Input() public personalInfo!: UserPerson
  @Input() public userId!: string
  @Output() public personalInfoUpdate = new EventEmitter<UserPerson>()

  public addressEdit = false
  public phoneEdit = false
  public countries: SelectItem[] = new Array<SelectItem>()
  public selectedCountry: SelectItem | undefined
  public phoneTypes: SelectItem[] = [
    { value: PhoneType.MOBILE, label: 'Mobile' },
    { value: PhoneType.LANDLINE, label: 'Landline' }
  ]
  public formGroup: UntypedFormGroup
  public booleanOptions!: SelectItem[]

  constructor(
    public http: HttpClient,
    public translate: TranslateService,
    @Inject(AUTH_SERVICE) public authService: IAuthService
  ) {
    // get data and init form only
    this.personalInfo = this.authService.getCurrentUser()?.person || {}
    this.userId = this.authService.getCurrentUser()?.userId || ''
    this.formGroup = this.initFormGroup()
  }

  public ngOnInit(): void {
    if (this.personalInfo) {
      this.createCountryList() // get countries and fill the form if ready
    }
  }

  public ngOnChanges(): void {
    if (this.formGroup && this.personalInfo) {
      this.formGroup.patchValue(this.personalInfo)
    }
  }

  private initFormGroup(): UntypedFormGroup {
    return new UntypedFormGroup({
      address: new UntypedFormGroup({
        street: new UntypedFormControl(''),
        streetNo: new UntypedFormControl(''),
        postalCode: new UntypedFormControl(''),
        city: new UntypedFormControl(''),
        country: new UntypedFormControl('DE')
      }),
      phone: new UntypedFormGroup({
        type: new UntypedFormControl(PhoneType.MOBILE),
        number: new UntypedFormControl('')
      })
    })
  }

  public toggleAddressEdit(): void {
    this.addressEdit = !this.addressEdit
  }
  public cancelAddressEdit(): void {
    if (this.personalInfo.address) {
      this.formGroup.patchValue({ address: this.personalInfo.address })
    }
    this.addressEdit = false
  }
  public updateAddress(): void {
    this.personalInfo.address = this.formGroup.value.address
    this.personalInfoUpdate.emit(this.personalInfo)
    this.addressEdit = false

    localStorage.removeItem('tkit_user_profile')
  }

  public togglePhoneEdit(): void {
    this.phoneEdit = !this.phoneEdit
  }
  public cancelPhoneEdit(): void {
    if (this.personalInfo.phone) {
      this.formGroup.patchValue({
        phone: this.personalInfo.phone
      })
    }
    this.phoneEdit = false
  }
  public updatePhone(): void {
    this.personalInfo.phone = this.formGroup.value.phone
    this.personalInfoUpdate.emit(this.personalInfo)
    this.phoneEdit = false

    localStorage.removeItem('tkit_user_profile')
  }

  public async createCountryList(): Promise<void> {
    const countryList = await this.getCountryNames()
    const countryCodes = Object.keys(countryList)
    const countryNames = Object.values(countryList)
    const len = countryCodes.length

    this.countries.push({
      label: '',
      value: null
    } as SelectItem)
    for (let i = 0; i < len; i++) {
      this.countries.push({
        label: countryNames[i].toString(),
        value: countryCodes[i]
      } as SelectItem)
    }
    this.formGroup.patchValue(this.personalInfo) // fill the form
  }

  public async getCountryNames(): Promise<countriesInfo.LocalizedCountryNames<{ select: 'official' }>> {
    countriesInfo.registerLocale(await import('i18n-iso-countries/langs/' + this.translate.currentLang + '.json'))
    return countriesInfo.getNames(this.translate.currentLang)
  }
}
