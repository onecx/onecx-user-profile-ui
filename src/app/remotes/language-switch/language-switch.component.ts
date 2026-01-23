import { CommonModule, Location } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Component, Inject, Input, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { AngularAcceleratorModule, createRemoteComponentTranslateLoader } from '@onecx/angular-accelerator'
import {
  AngularRemoteComponentsModule,
  BASE_URL,
  ocxRemoteComponent,
  ocxRemoteWebcomponent,
  provideTranslateServiceForRoot,
  REMOTE_COMPONENT_CONFIG,
  RemoteComponentConfig
} from '@onecx/angular-remote-components'
import {
  CONFIG_KEY,
  ConfigurationService,
  PortalMessageService,
  PrimeNgModule,
  UserService
} from '@onecx/portal-integration-angular'
import { ReplaySubject } from 'rxjs'
import { ControlErrorsDirective } from '@ngneat/error-tailor'
import { SelectButtonModule } from 'primeng/selectbutton'
import { SharedModule as SharedModuleUserProfile } from 'src/app/shared/shared.module'
import { UserProfileAPIService, UserProfile, UpdateUserProfileRequest, Configuration } from 'src/app/shared/generated'
import { environment } from 'src/environments/environment'
import { ButtonModule } from 'primeng/button'

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
    PrimeNgModule
  ],
  providers: [
    PortalMessageService,
    {
      provide: REMOTE_COMPONENT_CONFIG,
      useValue: new ReplaySubject<string>(1)
    },
    {
      provide: BASE_URL,
      useValue: new ReplaySubject<string>(1)
    },
    provideTranslateServiceForRoot({
      isolate: true,
      loader: {
        provide: TranslateLoader,
        useFactory: createRemoteComponentTranslateLoader,
        deps: [HttpClient, BASE_URL]
      }
    })
  ]
})
@UntilDestroy()
export class OneCXLanguageSwitchComponent implements ocxRemoteComponent, ocxRemoteWebcomponent, OnInit {
  @Input() set ocxRemoteComponentConfig(conf: RemoteComponentConfig) {
    this.ocxInitRemoteComponent(conf)
  }
  @Input() shownLanguagesNumber = 3

  public availableLanguages: string[] = []
  public languageFormGroup!: FormGroup
  public initialLanguage?: string
  public profile: UserProfile = {}

  constructor(
    @Inject(REMOTE_COMPONENT_CONFIG) private readonly rcConfig: ReplaySubject<RemoteComponentConfig>,
    private readonly userApiService: UserProfileAPIService,
    private readonly userService: UserService,
    @Inject(BASE_URL) private readonly baseUrl: ReplaySubject<string>,
    private readonly translateService: TranslateService,
    private readonly formBuilder: FormBuilder,
    private readonly configService: ConfigurationService,
    private readonly messageService: PortalMessageService,
    private readonly location: Location
  ) {
    this.userService.lang$.subscribe((lang) => this.translateService.use(lang))
  }

  ngOnInit(): void {
    this.setAvailableLanguages()
    this.setLanguageForm()
    this.setDefaultLangAndMakeSubs()
  }

  ocxInitRemoteComponent(config: RemoteComponentConfig): void {
    this.baseUrl.next(config.baseUrl)
    this.userApiService.configuration = new Configuration({
      basePath: Location.joinWithSlash(config.baseUrl, environment.apiPrefix)
    })
    this.rcConfig.next(config)
  }

  shouldShowForm(): boolean {
    return !!this.languageFormGroup && this.availableLanguages.length > 0 && !!this.initialLanguage
  }

  private setAvailableLanguages() {
    const translateLanguages = (this.configService.getProperty(CONFIG_KEY.TKIT_SUPPORTED_LANGUAGES) || 'en,de').split(
      ','
    )

    this.availableLanguages = translateLanguages.slice(0, this.shownLanguagesNumber)
  }

  private setLanguageForm() {
    this.languageFormGroup = this.formBuilder.group({
      language: [null]
    })
  }

  private setDefaultLangAndMakeSubs() {
    this.userApiService.getMyUserProfile().subscribe((profile) => {
      this.profile = { ...profile }
      const usedLanguage = (profile.settings as Record<string, any>)['locale']
      this.languageFormGroup.patchValue({ language: usedLanguage })
      this.initialLanguage = usedLanguage
      this.makeSubscriptions()
    })
  }

  private makeSubscriptions() {
    this.languageFormGroup.get('language')?.valueChanges.subscribe(this.handleLanguageUpdate.bind(this))
  }

  private handleLanguageUpdate(language: string) {
    const payload = this.getUpdateProfileRequest(language)
    this.userApiService.updateMyUserProfile({ updateUserProfileRequest: payload }).subscribe({
      next: this.handleUpdateSuccess.bind(this),
      error: this.handleUpdateFail.bind(this)
    })
  }

  private handleUpdateSuccess(profile: UserProfile) {
    this.profile = { ...profile }
    this.location.historyGo(0)
  }

  private handleUpdateFail() {
    this.languageFormGroup.patchValue({ language: this.initialLanguage }, { emitEvent: false })
    this.messageService.error({ summaryKey: 'USER_SETTINGS.ERROR' })
  }

  private getUpdateProfileRequest(language: string): UpdateUserProfileRequest {
    return {
      modificationCount: this.profile.modificationCount || 0,
      organization: this.profile.organization,
      person: this.profile.person,
      settings: {
        ...this.profile.settings,
        locale: language
      }
    }
  }
}
