import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { SelectItem } from 'primeng/api'
import { TranslateService } from '@ngx-translate/core'
import * as countriesInfo from 'i18n-iso-countries'

import { PhoneType, UserService } from '@onecx/portal-integration-angular'

import { UserPerson } from 'src/app/shared/generated'

@Component({
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.scss']
})
export class PersonalDataComponent implements OnChanges {
  @Input() person!: UserPerson
  @Input() userProfileId: string | undefined = undefined
  @Input() tenantId: string | undefined = undefined
  @Output() public personalInfoUpdate = new EventEmitter<UserPerson>()

  public addressEdit = false
  public phoneEdit = false
  public countries: SelectItem[] = [] // important default for init dropdown
  public selectedCountry: SelectItem | undefined
  public phoneTypes: SelectItem[] = [
    { value: PhoneType.MOBILE, label: 'Mobile' },
    { value: PhoneType.LANDLINE, label: 'Landline' }
  ]
  public formGroup: UntypedFormGroup
  public editPermission: string = ''

  constructor(
    public readonly http: HttpClient,
    public readonly user: UserService,
    public readonly translate: TranslateService
  ) {
    this.formGroup = this.initFormGroup()
  }

  public ngOnChanges(): void {
    if (Object.keys(this.person).length > 0) {
      this.formGroup?.patchValue(this.person)
      this.createCountryList()
    }
    if (this.userProfileId && this.user.hasPermission('USERPROFILE#ADMIN_EDIT'))
      this.editPermission = 'USERPROFILE#ADMIN_EDIT'
    if (!this.userProfileId && this.user.hasPermission('USERPROFILE#EDIT')) this.editPermission = 'USERPROFILE#EDIT'
  }

  private initFormGroup(): UntypedFormGroup {
    return new UntypedFormGroup({
      address: new UntypedFormGroup({
        street: new UntypedFormControl('', [Validators.maxLength(255)]),
        streetNo: new UntypedFormControl('', [Validators.maxLength(255)]),
        postalCode: new UntypedFormControl('', [Validators.maxLength(255)]),
        city: new UntypedFormControl('', [Validators.maxLength(255)]),
        country: new UntypedFormControl('DE')
      }),
      phone: new UntypedFormGroup({
        type: new UntypedFormControl(PhoneType.MOBILE),
        number: new UntypedFormControl('', [Validators.maxLength(255)])
      })
    })
  }

  public toggleAddressEdit(): void {
    this.addressEdit = !this.addressEdit
  }

  public cancelAddressEdit(): void {
    if (this.person?.address) {
      this.formGroup?.patchValue({ address: this.person.address })
    }
    this.addressEdit = false
  }

  public updateAddress(): void {
    if (this.person) {
      this.person.address = this.formGroup?.value.address
      this.personalInfoUpdate.emit(this.person)
      this.addressEdit = false
      localStorage.removeItem('tkit_user_profile')
    }
  }

  public togglePhoneEdit(): void {
    this.phoneEdit = !this.phoneEdit
  }

  public cancelPhoneEdit(): void {
    if (this.person?.phone) {
      this.formGroup?.patchValue({ phone: this.person?.phone })
    }
    this.phoneEdit = false
  }

  public updatePhone(): void {
    if (this.person) {
      this.person.phone = this.formGroup?.value.phone
      this.personalInfoUpdate.emit(this.person)
      this.phoneEdit = false
    }
    localStorage.removeItem('tkit_user_profile')
  }

  private async createCountryList() {
    if (!this.translate.currentLang) this.translate.currentLang = 'en'
    countriesInfo.registerLocale(require('i18n-iso-countries/langs/' + this.translate.currentLang + '.json'))
    const countryList = countriesInfo.getNames(this.translate.currentLang)
    const countryCodes = Object.keys(countryList)
    const countryNames = Object.values(countryList)
    this.countries = [] // important: trigger UI update
    for (let i = 0; i < countryCodes.length - 1; i++) {
      this.countries.push({
        label: countryNames[i].toString(),
        value: countryCodes[i].toString()
      } as SelectItem)
    }
  }
}
