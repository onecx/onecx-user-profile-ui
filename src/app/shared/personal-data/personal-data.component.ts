import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'
import { SelectItem } from 'primeng/api'
import * as countriesInfo from 'i18n-iso-countries'

import { UserService } from '@onecx/angular-integration-interface'
import { PhoneType } from '@onecx/portal-integration-angular'

import { UserPerson, UserProfile } from 'src/app/shared/generated'

@Component({
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.scss']
})
export class PersonalDataComponent implements OnChanges {
  @Input() userProfile: UserProfile | undefined = undefined
  @Input() userId: string | undefined = undefined // if set then it is admin view else user view
  @Input() exceptionKey: string | undefined = undefined
  @Input() componentInUse = false
  @Output() public personUpdate = new EventEmitter<UserPerson>()

  public person: UserPerson | undefined = undefined
  public countries: SelectItem[] = [] // important default for init dropdown
  public selectedCountry: SelectItem | undefined
  public phoneTypes: SelectItem[] = [
    { value: PhoneType.MOBILE, label: 'Mobile' },
    { value: PhoneType.LANDLINE, label: 'Landline' }
  ]
  public formGroup: UntypedFormGroup

  constructor(
    public readonly http: HttpClient,
    public readonly user: UserService,
    public readonly translate: TranslateService
  ) {
    this.formGroup = this.initFormGroup()
  }

  /**
   * This is triggered by different views: user and admin (with userId)
   * Prevent displaying of something if component is not in use.
   */
  public ngOnChanges(): void {
    this.person = undefined
    if (!this.componentInUse || this.exceptionKey) return
    else this.person = this.userProfile?.person

    // update form: address and phone only!
    if (this.person && Object.keys(this.person).length > 0) {
      this.formGroup?.patchValue(this.person)
      this.formGroup.get('address')?.disable()
      this.formGroup.get('phone')?.disable()
      this.createCountryList()
    }
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

  public onToggleAddressEdit(): void {
    this.formGroup.get('address')?.disabled
      ? this.formGroup.get('address')?.enable()
      : this.formGroup.get('address')?.disable()
  }

  public onCancelAddressEdit(): void {
    if (this.person?.address) {
      this.formGroup?.patchValue({ address: this.person.address })
    }
    this.onToggleAddressEdit()
  }

  public updateAddress(): void {
    if (this.person) {
      this.person.address = this.formGroup?.value.address
      this.personUpdate.emit(this.person)
      this.onToggleAddressEdit()
    }
  }

  public onTogglePhoneEdit(): void {
    this.formGroup.get('phone')?.disabled
      ? this.formGroup.get('phone')?.enable()
      : this.formGroup.get('phone')?.disable()
  }

  public onCancelPhoneEdit(): void {
    if (this.person?.phone) {
      this.formGroup?.patchValue({ phone: this.person?.phone })
    }
    this.onTogglePhoneEdit()
  }

  public updatePhone(): void {
    if (this.person) {
      this.person.phone = this.formGroup?.value.phone
      this.personUpdate.emit(this.person)
      this.onTogglePhoneEdit()
    }
  }

  private async createCountryList() {
    const lang = this.user.lang$.getValue()
    countriesInfo.registerLocale(require('i18n-iso-countries/langs/' + lang + '.json'))
    const countryList = countriesInfo.getNames(lang)
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
