import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { provideErrorTailorConfig } from '@ngneat/error-tailor'

import { AutoCompleteModule } from 'primeng/autocomplete'
import { ButtonModule } from 'primeng/button'
import { CalendarModule } from 'primeng/calendar'
import { DialogModule } from 'primeng/dialog'
import { DropdownModule } from 'primeng/dropdown'
import { FloatLabelModule } from 'primeng/floatlabel'
import { InputGroupModule } from 'primeng/inputgroup'
import { InputGroupAddonModule } from 'primeng/inputgroupaddon'
import { InputSwitchModule } from 'primeng/inputswitch'
import { InputTextModule } from 'primeng/inputtext'
import { TextareaModule } from 'primeng/textarea'
import { KeyFilterModule } from 'primeng/keyfilter'
import { ListboxModule } from 'primeng/listbox'
import { MessageModule } from 'primeng/message'
import { PanelModule } from 'primeng/panel'
import { RippleModule } from 'primeng/ripple'
import { SelectButtonModule } from 'primeng/selectbutton'
import { TableModule } from 'primeng/table'
import { TabViewModule } from 'primeng/tabview'
import { ToastModule } from 'primeng/toast'
import { TooltipModule } from 'primeng/tooltip'

import { AngularAcceleratorModule } from '@onecx/angular-accelerator'
import { PortalApiConfiguration, provideThemeConfig } from '@onecx/angular-utils'
import { AngularRemoteComponentsModule } from '@onecx/angular-remote-components'

import { Configuration } from 'src/app/shared/generated'
import { environment } from 'src/environments/environment'
import { LabelResolver } from './label.resolver'
import { AvatarComponent } from './avatar/avatar.component'
import { PersonalDataComponent } from './personal-data/personal-data.component'

export function apiConfigProvider() {
  return new PortalApiConfiguration(Configuration, environment.apiPrefix)
}

@NgModule({
  imports: [
    AngularAcceleratorModule,
    AvatarComponent,
    AutoCompleteModule,
    ButtonModule,
    CalendarModule,
    CommonModule,
    DialogModule,
    DropdownModule,
    FloatLabelModule,
    FormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputSwitchModule,
    InputTextModule,
    TextareaModule,
    KeyFilterModule,
    ListboxModule,
    MessageModule,
    PanelModule,
    ReactiveFormsModule,
    RippleModule,
    SelectButtonModule,
    TableModule,
    TabViewModule,
    ToastModule,
    TooltipModule,
    TranslateModule,
    AngularRemoteComponentsModule,
    PersonalDataComponent
  ],
  exports: [
    AutoCompleteModule,
    ButtonModule,
    CalendarModule,
    CommonModule,
    DialogModule,
    DropdownModule,
    FloatLabelModule,
    FormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputSwitchModule,
    InputTextModule,
    TextareaModule,
    KeyFilterModule,
    ListboxModule,
    MessageModule,
    PanelModule,
    ReactiveFormsModule,
    RippleModule,
    SelectButtonModule,
    TableModule,
    TabViewModule,
    ToastModule,
    TooltipModule,
    TranslateModule,
    AngularRemoteComponentsModule,
    AvatarComponent,
    PersonalDataComponent
  ],
  //this is not elegant, for some reason the injection token from primeng does not work across federated module
  providers: [
    provideThemeConfig(),
    LabelResolver,
    { provide: Configuration, useFactory: apiConfigProvider },
    provideErrorTailorConfig({
      controlErrorsOn: { async: true, blur: true, change: true },
      errors: {
        useFactory: (i18n: TranslateService) => {
          return {
            required: () => i18n.instant('VALIDATION.ERRORS.EMPTY_REQUIRED_FIELD'),
            maxlength: ({ requiredLength }) =>
              i18n.instant('VALIDATION.ERRORS.MAXIMUM_LENGTH').replace('{{chars}}', requiredLength),
            minlength: ({ requiredLength }) =>
              i18n.instant('VALIDATION.ERRORS.MINIMUM_LENGTH').replace('{{chars}}', requiredLength),
            pattern: () => i18n.instant('VALIDATION.ERRORS.PATTERN_ERROR')
          }
        },
        deps: [TranslateService]
      },
      //this is required because primeng calendar wraps things in an ugly way
      blurPredicate: (element: Element) => {
        return ['INPUT', 'TEXTAREA', 'SELECT', 'CUSTOM-DATE', 'P-CALENDAR', 'P-DROPDOWN'].includes(element.tagName)
      }
    })
  ]
})
export class SharedModule {}
