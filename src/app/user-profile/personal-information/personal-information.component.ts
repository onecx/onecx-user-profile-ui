import { Component, EventEmitter, OnChanges, OnInit, Output } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import { SelectItem } from 'primeng/api'
import { TranslateService } from '@ngx-translate/core'
import * as countriesInfo from 'i18n-iso-countries'
import { PhoneType, UserPerson, UserService } from '@onecx/portal-integration-angular'
import { UserProfileService } from '../user-profile.service'
import { from, map, mergeMap, Observable, of } from 'rxjs'

@Component({
  selector: 'app-personal-info-form',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss']
})
export class PersonalInformationComponent implements OnInit, OnChanges {
  public personalInfo$: Observable<UserPerson>
  public userId$: Observable<string>
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
  public formUpdates$: Observable<unknown> | undefined

  constructor(
    public http: HttpClient,
    public translate: TranslateService,
    public userProfileService: UserProfileService,
    private userService: UserService
  ) {
    // get data and init form only
    this.personalInfo$ = this.userService.profile$.pipe(map((profile) => profile.person || {}))
    this.userId$ = this.userService.profile$.pipe(map((profile) => profile.id || ''))
    this.formGroup = this.initFormGroup()
  }

  public ngOnInit(): void {
    this.formUpdates$ = this.personalInfo$.pipe(
      mergeMap((personalInfo) => {
        if (personalInfo) {
          return from(this.createCountryList(personalInfo)) // get countries and fill the form if ready
        }
        return of()
      })
    )
  }

  public ngOnChanges(): void {
    this.formUpdates$ = this.personalInfo$.pipe(
      map((personalInfo) => {
        if (this.formGroup && personalInfo) {
          return personalInfo
        }
        return undefined
      })
    )
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
    this.formUpdates$ = this.personalInfo$.pipe(
      map((personalInfo) => {
        if (personalInfo.address) {
          this.formGroup.patchValue({ address: personalInfo.address })
        }
        this.addressEdit = false
      })
    )
  }

  public updateAddress(): void {
    this.formUpdates$ = this.personalInfo$.pipe(
      map((personalInfo) => {
        personalInfo.address = this.formGroup.value.address
        this.personalInfoUpdate.emit(personalInfo)
        this.addressEdit = false

        localStorage.removeItem('tkit_user_profile')
      })
    )
  }

  public togglePhoneEdit(): void {
    this.phoneEdit = !this.phoneEdit
  }

  public cancelPhoneEdit(): void {
    this.formUpdates$ = this.personalInfo$.pipe(
      map((personalInfo) => {
        if (personalInfo.phone) {
          this.formGroup.patchValue({
            phone: personalInfo.phone
          })
        }
        this.phoneEdit = false
      })
    )
  }

  public updatePhone(): void {
    this.formUpdates$ = this.personalInfo$.pipe(
      map((personalInfo) => {
        personalInfo.phone = this.formGroup.value.phone
        this.personalInfoUpdate.emit(personalInfo)
        this.phoneEdit = false

        localStorage.removeItem('tkit_user_profile')
      })
    )
  }

  private async createCountryList(personalInfo: UserPerson): Promise<UserPerson> {
    countriesInfo.registerLocale(await import('i18n-iso-countries/langs/' + this.translate.currentLang + '.json'))
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
