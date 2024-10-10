import { HttpClient } from '@angular/common/http'
import { Component, Input, OnInit, OnChanges } from '@angular/core'
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'
import { SelectItem } from 'primeng/api'
import { Observable, from, map, mergeMap, of } from 'rxjs'
import * as countriesInfo from 'i18n-iso-countries'

import { PhoneType, PortalMessageService } from '@onecx/portal-integration-angular'
import {
  UpdateUserPerson,
  UserProfileAPIService,
  UserPerson,
  UserProfileAdminAPIService
} from 'src/app/shared/generated'

@Component({
  selector: 'app-user-profile-detail',
  templateUrl: './user-profile-detail.component.html'
})
export class UserProfileDetailComponent implements OnInit, OnChanges {
  @Input() public userProfileId: any
  public personalInfo$!: Observable<UserPerson>
  public messages: { [key: string]: string } = {}
  public userId$!: Observable<string>
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
    public readonly http: HttpClient,
    public readonly translate: TranslateService,
    private readonly userProfileService: UserProfileAPIService,
    private readonly userProfileAdminService: UserProfileAdminAPIService,
    private readonly msgService: PortalMessageService
  ) {
    this.personalInfo$ = this.userProfileService.getMyUserProfile().pipe(map((profile) => profile.person || {}))
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
    if (this.userProfileId) {
      console.log('UP ID', this.userProfileId)
      console.log('Type of userProfileId:', typeof this.userProfileId)
      this.personalInfo$ = this.userProfileAdminService
        .getUserProfile({ id: this.userProfileId })
        .pipe(map((profile) => profile.person || {}))
    }
    this.formUpdates$ = this.personalInfo$.pipe(
      map((personalInfo) => {
        if (this.formGroup && personalInfo) {
          return personalInfo
        }
        return undefined
      })
    )
  }
  public onPersonalInfoUpdate(person: UserPerson): void {
    this.userProfileService.updateUserPerson({ updateUserPerson: person as UpdateUserPerson }).subscribe({
      next: () => {
        this.showMessage('success')
      },
      error: () => {
        this.showMessage('error')
      }
    })
  }

  public showMessage(severity: 'success' | 'error'): void {
    severity === 'success'
      ? this.msgService.success({ summaryKey: 'PERSONAL_INFO_FORM.MSG.SAVE_SUCCESS' })
      : this.msgService.error({ summaryKey: 'PERSONAL_INFO_FORM.MSG.SAVE_ERROR' })
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
        return personalInfo
      })
    )
  }

  public updateAddress(): void {
    this.formUpdates$ = this.personalInfo$.pipe(
      map((personalInfo) => {
        personalInfo.address = this.formGroup.value.address
        this.onPersonalInfoUpdate(personalInfo)
        this.addressEdit = false
        localStorage.removeItem('tkit_user_profile')
        return personalInfo
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
        return personalInfo
      })
    )
  }

  public updatePhone(): void {
    this.formUpdates$ = this.personalInfo$.pipe(
      map((personalInfo) => {
        personalInfo.phone = this.formGroup.value.phone
        this.onPersonalInfoUpdate(personalInfo)
        this.phoneEdit = false

        localStorage.removeItem('tkit_user_profile')
        return personalInfo
      })
    )
  }

  private async createCountryList(personalInfo: UserPerson): Promise<UserPerson> {
    if (this.translate.currentLang == undefined) {
      this.translate.currentLang = 'en'
    }
    // countriesInfo.registerLocale(await import('i18n-iso-countries/langs/' + this.translate.currentLang + '.json'))
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
