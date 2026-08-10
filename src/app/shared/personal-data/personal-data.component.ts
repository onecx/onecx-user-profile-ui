import { Component, EventEmitter, inject, Input, OnChanges, Output } from '@angular/core'
import { NgClass } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import * as countriesInfo from 'i18n-iso-countries'

import { SelectItem } from 'primeng/api'
import { ButtonModule } from 'primeng/button'
import { DropdownModule } from 'primeng/dropdown'
import { FloatLabelModule } from 'primeng/floatlabel'
import { InputTextModule } from 'primeng/inputtext'
import { MessageModule } from 'primeng/message'
import { PanelModule } from 'primeng/panel'
import { RippleModule } from 'primeng/ripple'
import { TooltipModule } from 'primeng/tooltip'

import { UserService } from '@onecx/angular-integration-interface'
import { AngularAcceleratorModule } from '@onecx/angular-accelerator'
import { PhoneType } from '@onecx/integration-interface'

import { UserPerson, UserProfile } from 'src/app/shared/generated'
import { AvatarComponent } from '../avatar/avatar.component'

@Component({
  selector: 'app-personal-data',
  standalone: true,
  imports: [
    NgClass,
    AngularAcceleratorModule,
    AvatarComponent,
    ButtonModule,
    DropdownModule,
    FloatLabelModule,
    InputTextModule,
    MessageModule,
    PanelModule,
    ReactiveFormsModule,
    RippleModule,
    TooltipModule,
    TranslateModule
  ],
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.scss']
})
export class PersonalDataComponent implements OnChanges {
  public readonly http = inject(HttpClient)
  public readonly user: UserService = inject(UserService)
  public readonly translate: TranslateService = inject(TranslateService)
  // input
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
  public formGroup = this.initFormGroup()

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

  private initFormGroup(): FormGroup {
    return new FormGroup({
      address: new FormGroup({
        street: new FormControl<string | null>(null, [Validators.maxLength(255)]),
        streetNo: new FormControl<string | null>(null, [Validators.maxLength(255)]),
        postalCode: new FormControl<string | null>(null, [Validators.maxLength(255)]),
        city: new FormControl<string | null>(null, [Validators.maxLength(255)]),
        country: new FormControl<string>('DE')
      }),
      phone: new FormGroup({
        type: new FormControl<string>(PhoneType.MOBILE),
        number: new FormControl<string | null>(null, [Validators.maxLength(255)])
      })
    })
  }

  public onToggleAddressEdit(): void {
    this.formGroup.get('address')?.disabled
      ? this.formGroup.get('address')?.enable()
      : this.formGroup.get('address')?.disable()
  }

  public onCancelAddressEdit(): void {
    this.formGroup?.get('address')?.reset()
    if (this.person?.address) {
      this.formGroup?.get('address')?.setValue(this.person.address)
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
    this.formGroup?.get('phone')?.reset()
    if (this.person?.phone) {
      this.formGroup?.get('phone')?.setValue(this.person?.phone)
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
