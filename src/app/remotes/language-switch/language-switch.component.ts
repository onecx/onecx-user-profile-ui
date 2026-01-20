import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Component, inject, Input, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateLoader, TranslateService } from '@ngx-translate/core'
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
import { CONFIG_KEY, ConfigurationService, UserProfileAPIService, UserService } from '@onecx/portal-integration-angular'
import { ReplaySubject, take } from 'rxjs'
import { ControlErrorsDirective } from '@ngneat/error-tailor'
import { SelectButtonModule } from 'primeng/selectbutton'
import { SharedModule as SharedModuleUserProfile } from 'src/app/shared/shared.module'

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
    SharedModuleUserProfile
  ],
  providers: [
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
  private readonly rcConfig = inject<ReplaySubject<RemoteComponentConfig>>(REMOTE_COMPONENT_CONFIG)
  private readonly userApiService = inject(UserProfileAPIService)
  private readonly userService = inject(UserService)
  private readonly baseUrl: ReplaySubject<string> = inject<ReplaySubject<string>>(BASE_URL)
  private readonly translateService: TranslateService = inject(TranslateService)
  private readonly formBuilder = inject(FormBuilder)
  private readonly configService = inject(ConfigurationService)

  @Input() set ocxRemoteComponentConfig(conf: RemoteComponentConfig) {
    this.ocxInitRemoteComponent(conf)
  }
  @Input() shownLanguagesNumber = 3

  public availableLanguages: string[] = []
  public languageFormGroup!: FormGroup
  public initialLanguage?: string

  ngOnInit(): void {
    this.setAvailableLanguages()
    this.setLanguageForm()
    this.setDefaultLangAndMakeSubs()
    this.makeSubscriptions()
  }

  ocxInitRemoteComponent(config: RemoteComponentConfig): void {
    this.baseUrl.next(config.baseUrl)
    this.rcConfig.next(config)
  }

  shouldShowForm(): boolean {
    return !!this.languageFormGroup && this.availableLanguages.length > 0 && !!this.initialLanguage
  }

  private setAvailableLanguages() {
    const browserLang = this.translateService.getBrowserLang()
    const translateLanguages = (this.configService.getProperty(CONFIG_KEY.TKIT_SUPPORTED_LANGUAGES) || 'en,de').split(
      ','
    )

    this.availableLanguages = [
      ...translateLanguages
        .sort((a, b) => {
          if (a === browserLang) return -1
          if (b !== browserLang) return 1
          return 0
        })
        .slice(0, this.shownLanguagesNumber)
    ]
  }

  private setLanguageForm() {
    this.languageFormGroup = this.formBuilder.group({
      language: [null]
    })
  }

  private setDefaultLangAndMakeSubs() {
    this.userService.lang$
      .asObservable()
      .pipe(take(1))
      .subscribe((usedLanguage) => {
        this.languageFormGroup.patchValue({ language: usedLanguage })
        this.initialLanguage = usedLanguage
        this.makeSubscriptions()
      })
  }

  private makeSubscriptions() {
    this.languageFormGroup.get('language')?.valueChanges.subscribe(this.handleLanguageUpdate.bind(this))
  }

  private handleLanguageUpdate(language: string) {}
}
