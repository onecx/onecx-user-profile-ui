import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core'
import { Location } from '@angular/common'
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { firstValueFrom, from, ReplaySubject, Subscription } from 'rxjs'
import { map, switchMap, take } from 'rxjs/operators'

import { ButtonModule } from 'primeng/button'
import { SelectButtonModule } from 'primeng/selectbutton'
import { TooltipModule } from 'primeng/tooltip'

import { REMOTE_COMPONENT_CONFIG, RemoteComponentConfig } from '@onecx/angular-utils'
import { AngularAcceleratorModule } from '@onecx/angular-accelerator'
import {
  AngularRemoteComponentsModule,
  ocxRemoteComponent,
  ocxRemoteWebcomponent
} from '@onecx/angular-remote-components'
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
    AngularAcceleratorModule,
    AngularRemoteComponentsModule,
    ButtonModule,
    ReactiveFormsModule,
    SelectButtonModule,
    TranslateModule,
    TooltipModule
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

  ngOnInit() {
    this.setLanguageForm()
    const defaultLangs = 'en,de'
    this.subscriptions.add(
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
          )
        )
        .subscribe((langs) => {
          this.availableLanguages = langs
          this.makeSubscriptions()
        })
    )
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
}
