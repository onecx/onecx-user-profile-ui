import { Component, DestroyRef, inject, Inject, Input, OnDestroy, OnInit } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { Location } from '@angular/common'
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { firstValueFrom, from, ReplaySubject } from 'rxjs'
import { map, switchMap, take } from 'rxjs/operators'

import { ButtonModule } from 'primeng/button'
import { SelectButtonModule } from 'primeng/selectbutton'
import { ToggleButtonModule } from 'primeng/togglebutton'
import { TooltipModule } from 'primeng/tooltip'

import {
  AngularRemoteComponentsModule,
  ocxRemoteComponent,
  ocxRemoteWebcomponent
} from '@onecx/angular-remote-components'
import { REMOTE_COMPONENT_CONFIG, RemoteComponentConfig } from '@onecx/angular-utils'
import {
  CONFIG_KEY,
  ConfigurationService,
  ParametersService,
  PortalMessageService,
  UserService
} from '@onecx/angular-integration-interface'

import { UserProfileAPIService, Configuration, UpdateUserPersonSettingsRequest } from 'src/app/shared/generated'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-ocx-language-switch',
  standalone: true,
  imports: [
    AngularRemoteComponentsModule,
    ButtonModule,
    ReactiveFormsModule,
    SelectButtonModule,
    TooltipModule,
    TranslateModule
  ],
  providers: [
    PortalMessageService,
    ParametersService,
    {
      provide: REMOTE_COMPONENT_CONFIG,
      useValue: new ReplaySubject<RemoteComponentConfig>(1)
    }
  ],
  templateUrl: './language-switch.component.html',
  styleUrl: './language-switch.component.scss'
})
export class OneCXLanguageSwitchComponent implements ocxRemoteComponent, ocxRemoteWebcomponent, OnInit {
  private readonly rcConfig = inject<ReplaySubject<RemoteComponentConfig>>(REMOTE_COMPONENT_CONFIG)
  private readonly destroyRef = inject(DestroyRef)
  private readonly location = inject(Location)
  private readonly userApiService = inject(UserProfileAPIService)
  private readonly userService = inject(UserService)
  private readonly configService = inject(ConfigurationService)
  private readonly messageService = inject(PortalMessageService)
  private readonly parameterService = inject(ParametersService)
  private readonly formBuilder = inject(FormBuilder)

  @Input() set ocxRemoteComponentConfig(conf: RemoteComponentConfig) {
    this.ocxInitRemoteComponent(conf)
  }
  @Input() shownLanguagesNumber = 3

  public availableLanguages: string[] = []
  public languageFormGroup!: FormGroup
  public defaultLangSet = false // needed for ommiting visible language switch on the component

  ocxInitRemoteComponent(config: RemoteComponentConfig): void {
    this.rcConfig.next(config)
    this.userApiService.configuration = new Configuration({
      basePath: Location.joinWithSlash(config.baseUrl, environment.apiPrefix)
    })
  }

  ngOnInit() {
    this.setLanguageForm()
    const defaultLangs = 'en,de'

    this.rcConfig
      .pipe(
        take(1),
        switchMap(({ productName, appId }) =>
          from(
            this.configService.getProperty(CONFIG_KEY.TKIT_SUPPORTED_LANGUAGES).catch((error) => {
              console.error('getProperty TKIT_SUPPORTED_LANGUAGES', error)
              return defaultLangs
            })
          ).pipe(
            switchMap((supportedLanguages) =>
              from(
                this.parameterService.get('primary-languages', supportedLanguages || defaultLangs, productName, appId)
              )
            ),
            map((langs) => (langs || defaultLangs).split(',').slice(0, this.shownLanguagesNumber))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((langs) => {
        console.log('available languages', langs, this.shownLanguagesNumber)
        this.availableLanguages = langs
        this.makeSubscriptions()
      })
  }

  private makeSubscriptions() {
    this.userService.lang$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lang) => this.handleProfileLanguageChange(lang))
    this.languageFormGroup
      .get('language')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.handleLanguageUpdate(value))
  }

  private handleProfileLanguageChange(usedLang: string) {
    if (this.availableLanguages.includes(usedLang)) {
      this.languageFormGroup.patchValue({ language: usedLang }, { emitEvent: false })
      this.languageFormGroup.get('language')!.enable({ emitEvent: false })
    } else {
      console.warn(`Profile language ${usedLang} is not set as available, disabling component`)
      this.languageFormGroup.get('language')!.disable({ emitEvent: false })
    }
    this.defaultLangSet = true
  }

  private async handleLanguageUpdate(language: string) {
    this.languageFormGroup.get('language')!.disable({ emitEvent: false })
    const profile = await firstValueFrom(this.userApiService.getMyUserProfile())
    const updateRequest: UpdateUserPersonSettingsRequest = {
      modificationCount: profile.modificationCount!,
      settings: {
        ...profile.settings,
        locale: language
      }
    }
    try {
      await firstValueFrom(
        this.userApiService.updateMyUserProfileSettings({ updateUserPersonSettingsRequest: updateRequest })
      )
      this.handleUpdateSuccess()
    } catch (error) {
      console.error('updateMyUserProfileSettings', error)
      await this.handleUpdateFail()
    }
    this.languageFormGroup.get('language')!.enable({ emitEvent: false })
  }

  private handleUpdateSuccess() {
    this.location.historyGo(0)
  }

  private async handleUpdateFail() {
    const usedLang = await firstValueFrom(this.userService.lang$)
    this.languageFormGroup.patchValue({ language: usedLang }, { emitEvent: false })
    this.messageService.error({ summaryKey: 'USER_SETTINGS.ERROR' })
  }

  public shouldShowForm(): boolean {
    return !!this.languageFormGroup && this.availableLanguages.length > 0 && this.defaultLangSet === true
  }

  private setLanguageForm() {
    this.languageFormGroup = this.formBuilder.group({
      language: [null]
    })
  }
}
