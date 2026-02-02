import { CommonModule, Location } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { AngularAcceleratorModule } from '@onecx/angular-accelerator'
import {
  AngularRemoteComponentsModule,
  ocxRemoteComponent,
  ocxRemoteWebcomponent,
  provideTranslateServiceForRoot,
  REMOTE_COMPONENT_CONFIG,
  RemoteComponentConfig
} from '@onecx/angular-remote-components'
import { firstValueFrom, lastValueFrom, ReplaySubject, Subscription } from 'rxjs'
import { ControlErrorsDirective } from '@ngneat/error-tailor'
import { SelectButtonModule } from 'primeng/selectbutton'
import { SharedModule as SharedModuleUserProfile } from 'src/app/shared/shared.module'
import { UserProfileAPIService, UpdateUserProfileRequest, Configuration, UserProfile } from 'src/app/shared/generated'
import { environment } from 'src/environments/environment'
import { ButtonModule } from 'primeng/button'
import {
  CONFIG_KEY,
  ConfigurationService,
  ParametersService,
  PortalMessageService,
  UserService
} from '@onecx/angular-integration-interface'
import { TooltipModule } from 'primeng/tooltip'
import { provideTranslationPathFromMeta, createTranslateLoader } from '@onecx/angular-utils'

@Component({
  selector: 'app-ocx-language-switch',
  standalone: true,
  templateUrl: './language-switch.component.html',
  styleUrl: './language-switch.component.scss',
  imports: [
    AngularRemoteComponentsModule,
    CommonModule,
    AngularAcceleratorModule,
    ControlErrorsDirective,
    ReactiveFormsModule,
    SelectButtonModule,
    SharedModuleUserProfile,
    ButtonModule,
    TranslateModule,
    TooltipModule
  ],
  providers: [
    PortalMessageService,
    ParametersService,
    {
      provide: REMOTE_COMPONENT_CONFIG,
      useValue: new ReplaySubject<string>(1)
    },
    provideTranslateServiceForRoot({
      isolate: true,
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    provideTranslationPathFromMeta(import.meta.url, 'assets/i18n/')
  ]
})
@UntilDestroy()
export class OneCXLanguageSwitchComponent implements ocxRemoteComponent, ocxRemoteWebcomponent, OnInit, OnDestroy {
  @Input() set ocxRemoteComponentConfig(conf: RemoteComponentConfig) {
    this.ocxInitRemoteComponent(conf)
  }
  @Input() shownLanguagesNumber = 3

  public availableLanguages: string[] = []
  public languageFormGroup!: FormGroup
  public defaultLangSet = false // needed for ommiting visible language switch on the component

  private readonly subscriptions: Subscription = new Subscription()

  constructor(
    @Inject(REMOTE_COMPONENT_CONFIG) private readonly rcConfig: ReplaySubject<RemoteComponentConfig>,
    private readonly userApiService: UserProfileAPIService,
    private readonly userService: UserService,
    private readonly translateService: TranslateService,
    private readonly formBuilder: FormBuilder,
    private readonly configService: ConfigurationService,
    private readonly messageService: PortalMessageService,
    private readonly location: Location,
    private readonly parameterService: ParametersService
  ) {
    this.subscriptions.add(this.userService.lang$.subscribe((lang) => this.translateService.use(lang)))
  }

  async ngOnInit() {
    this.setLanguageForm()
    await this.setAvailableLanguages()
    this.makeSubscriptions()
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  ocxInitRemoteComponent(config: RemoteComponentConfig): void {
    this.userApiService.configuration = new Configuration({
      basePath: Location.joinWithSlash(config.baseUrl, environment.apiPrefix)
    })
    this.rcConfig.next(config)
  }

  shouldShowForm(): boolean {
    return !!this.languageFormGroup && this.availableLanguages.length > 0 && this.defaultLangSet === true
  }

  private async setAvailableLanguages() {
    const defaultLangs = 'en,de'
    let translatedLanguages = await this.parameterService.get(
      'primary-languages',
      this.configService.getProperty(CONFIG_KEY.TKIT_SUPPORTED_LANGUAGES) || defaultLangs
    )
    if (!translatedLanguages) {
      translatedLanguages = defaultLangs
    }
    this.availableLanguages = translatedLanguages.split(',').slice(0, this.shownLanguagesNumber)
  }

  private setLanguageForm() {
    this.languageFormGroup = this.formBuilder.group({
      language: [null]
    })
  }

  private makeSubscriptions() {
    this.subscriptions.add(this.userService.lang$.subscribe(this.handleProfileLanguageChange.bind(this)))
    this.subscriptions.add(
      this.languageFormGroup.get('language')!.valueChanges.subscribe(this.handleLanguageUpdate.bind(this))
    )
  }

  private handleProfileLanguageChange(usedLang: string) {
    if (this.availableLanguages.includes(usedLang)) {
      this.languageFormGroup.patchValue({ language: usedLang }, { emitEvent: false })
      this.languageFormGroup.get('language')!.enable({ emitEvent: false })
    } else {
      console.warn(`Profile language ${usedLang} is not set as available, disabling c1omponent`)
      this.languageFormGroup.get('language')!.disable({ emitEvent: false })
    }
    this.defaultLangSet = true
  }

  private async handleLanguageUpdate(language: string) {
    this.languageFormGroup.get('language')!.disable({ emitEvent: false })
    const profile = await firstValueFrom(this.userApiService.getMyUserProfile())
    const payload = this.getUpdateProfileRequest(profile, language)
    try {
      await firstValueFrom(this.userApiService.updateMyUserProfile({ updateUserProfileRequest: payload }))
      this.handleUpdateSuccess()
    } catch (error) {
      console.error(error)
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

  private getUpdateProfileRequest(profile: UserProfile, language: string): UpdateUserProfileRequest {
    return {
      ...profile,
      modificationCount: profile.modificationCount!,
      settings: {
        ...profile.settings,
        locale: language
      }
    }
  }
}
