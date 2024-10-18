import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { from, map, Observable, of, switchMap } from 'rxjs'
import { SelectItem } from 'primeng/api'
import { TranslateService } from '@ngx-translate/core'
import * as countriesInfo from 'i18n-iso-countries'

import { PhoneType } from '@onecx/portal-integration-angular'
import { UserPerson } from 'src/app/shared/generated'

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss']
})
export class PersonalInformationComponent implements OnChanges {
  @Input() personalInfo!: UserPerson | null
  @Input() tenantId: string = ''
  @Input() adminView: boolean = false
  public userId$!: Observable<string>
  @Output() public personalInfoUpdate = new EventEmitter<UserPerson>()

  public addressEdit = false
  public phoneEdit = false
  public countries: SelectItem[] = new Array<SelectItem>()
  public selectedCountry: SelectItem | undefined
  public phoneTypes: SelectItem[] = [
    { value: PhoneType.MOBILE, label: 'Mobile' },
    { value: PhoneType.LANDLINE, label: 'Landline' }
  ]
  public formGroup!: UntypedFormGroup
  public booleanOptions!: SelectItem[]
  public formUpdates$: Observable<unknown> | undefined
  public editPermission: string = ''

  constructor(
    public readonly http: HttpClient,
    public readonly translate: TranslateService
  ) {}

  public ngOnChanges(): void {
    this.formGroup = this.initFormGroup()
    this.formUpdates$ = of(this.personalInfo).pipe(
      switchMap((personalInfo) => {
        if (this.formGroup && personalInfo) {
          return from(this.createCountryList(personalInfo)).pipe(map(() => personalInfo))
        }
        return of(undefined)
      })
    )
    this.editPermission = this.adminView ? 'USERPROFILE#ADMIN_EDIT' : 'USERPROFILE#EDIT'
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
    this.formUpdates$ = of(this.personalInfo).pipe(
      map((personalInfo) => {
        if (personalInfo?.address) {
          this.formGroup.patchValue({ address: personalInfo.address })
        }
        this.addressEdit = false
        return personalInfo
      })
    )
  }

  public updateAddress(): void {
    this.formUpdates$ = of(this.personalInfo).pipe(
      map((personalInfo) => {
        if (personalInfo) {
          personalInfo.address = this.formGroup.value.address
          this.personalInfoUpdate.emit(personalInfo)
          this.addressEdit = false
          localStorage.removeItem('tkit_user_profile')
        }
        return personalInfo
      })
    )
  }

  public togglePhoneEdit(): void {
    this.phoneEdit = !this.phoneEdit
  }

  public cancelPhoneEdit(): void {
    this.formUpdates$ = of(this.personalInfo).pipe(
      map((personalInfo) => {
        if (personalInfo?.phone) {
          this.formGroup.patchValue({
            phone: personalInfo?.phone
          })
        }
        this.phoneEdit = false
        return personalInfo
      })
    )
  }

  public updatePhone(): void {
    this.formUpdates$ = of(this.personalInfo).pipe(
      map((personalInfo) => {
        if (personalInfo) {
          personalInfo.phone = this.formGroup.value.phone
          this.personalInfoUpdate.emit(personalInfo!)
          this.phoneEdit = false
        }
        localStorage.removeItem('tkit_user_profile')
        return personalInfo
      })
    )
  }

  private async createCountryList(personalInfo: UserPerson): Promise<UserPerson> {
    if (this.translate.currentLang == undefined) {
      this.translate.currentLang = 'en'
    }
    countriesInfo.registerLocale(require('i18n-iso-countries/langs/' + this.translate.currentLang + '.json'))
    const countryList = countriesInfo.getNames(this.translate.currentLang)
    const countryCodes = Object.keys(countryList)
    const countryNames = Object.values(countryList)
    const len = countryCodes.length

    this.countries.push({
      label: '',
      value: null
    } as SelectItem)
    for (let i = 1; i < len - 1; i++) {
      this.countries.push({
        label: countryNames[i].toString(),
        value: countryCodes[i]
      } as SelectItem)
    }
    return personalInfo // fill the form
  }
}
