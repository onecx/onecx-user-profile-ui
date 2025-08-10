import { Component, EventEmitter, Inject, Input, OnInit, NO_ERRORS_SCHEMA } from '@angular/core'
import { CommonModule, Location } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { RouterModule } from '@angular/router'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { Observable, ReplaySubject, of } from 'rxjs'
import { SharedModule } from 'primeng/api'

import {
  AngularRemoteComponentsModule,
  BASE_URL,
  RemoteComponentConfig,
  ocxRemoteComponent,
  ocxRemoteWebcomponent,
  provideTranslateServiceForRoot
} from '@onecx/angular-remote-components'
import { createRemoteComponentTranslateLoader } from '@onecx/angular-accelerator'
import { PortalCoreModule } from '@onecx/portal-integration-angular'

import { SharedModule as SharedModuleUserProfile } from 'src/app/shared/shared.module'
import { Configuration, RefType, UserAvatarAPIService } from 'src/app/shared/generated'
import { bffImageUrl } from 'src/app/shared/utils'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-avatar-image',
  standalone: true,
  templateUrl: './avatar-image.component.html',
  styleUrls: ['./avatar-image.component.scss'],
  providers: [
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
  ],
  schemas: [NO_ERRORS_SCHEMA],
  imports: [
    AngularRemoteComponentsModule,
    CommonModule,
    PortalCoreModule,
    RouterModule,
    TranslateModule,
    SharedModule,
    SharedModuleUserProfile
  ]
})
export class OneCXAvatarImageComponent implements ocxRemoteComponent, ocxRemoteWebcomponent, OnInit {
  // input
  @Input() id: string | undefined = undefined
  @Input() styleClass: string | undefined = undefined // image container
  @Input() imageStyleClass: string | undefined = undefined // image
  @Input() imageStyle: string | undefined = undefined // image
  // output
  @Input() imageLoaded = new EventEmitter<boolean>()

  public imagePath$: Observable<string> | undefined
  public placeHolderPath = ''

  constructor(
    @Inject(BASE_URL) private readonly baseUrl: ReplaySubject<string>,
    private readonly avatarService: UserAvatarAPIService
  ) {}

  @Input() set ocxRemoteComponentConfig(config: RemoteComponentConfig) {
    this.ocxInitRemoteComponent(config)
  }

  ocxInitRemoteComponent(remoteComponentConfig: RemoteComponentConfig) {
    this.baseUrl.next(remoteComponentConfig.baseUrl)
    this.placeHolderPath = Location.joinWithSlash(remoteComponentConfig.baseUrl, environment.DEFAULT_LOGO_PATH)
    this.avatarService.configuration = new Configuration({
      basePath: Location.joinWithSlash(remoteComponentConfig.baseUrl, environment.apiPrefix)
    })
  }

  ngOnInit(): void {
    // imagePath$ is an observable on purpose, so this component can be easily extended to
    // also display avatars of other user where a call the bff is needed to get the url
    // To do this, call the bff here and set the observable as imagePath$ here
    this.imagePath$ = of(bffImageUrl(this.avatarService.configuration.basePath, 'avatar', RefType.Medium))
  }

  public onImageError(): void {
    this.imagePath$ = of(this.placeHolderPath)
    this.imageLoaded.emit(false)
  }
  public onImageLoad(): void {
    this.imageLoaded.emit(true)
  }
}
