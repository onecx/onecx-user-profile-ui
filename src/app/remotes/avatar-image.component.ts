import { CommonModule, Location } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Component, Inject, OnInit } from '@angular/core'
import { RouterModule } from '@angular/router'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import {
  AngularRemoteComponentsModule,
  BASE_URL,
  RemoteComponentConfig,
  provideTranslateServiceForRoot
} from '@onecx/angular-remote-components'
import { PortalCoreModule, createRemoteComponentTranslateLoader } from '@onecx/portal-integration-angular'
import { SharedModule } from 'primeng/api'
import { BehaviorSubject, Observable, ReplaySubject, of } from 'rxjs'
import { SharedModule as SharedModuleUserProfile } from '../shared/shared.module'
import { Configuration, RefType, UserAvatarAPIService } from '../shared/generated'
import { bffImageUrl } from '../shared/utils'
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
export class OneCXAvatarImageComponent implements OnInit {
  imagePath$: Observable<string> | undefined
  displayDefaultLogo: boolean = false
  public placeHolderPath: string = ''

  constructor(@Inject(BASE_URL) private baseUrl: ReplaySubject<string>, private avatarService: UserAvatarAPIService) {
    this.imagePath$ = new BehaviorSubject<string>(this.placeHolderPath)
  }

  ocxInitRemoteComponent(remoteComponentConfig: RemoteComponentConfig) {
    this.baseUrl.next(remoteComponentConfig.baseUrl)
    this.placeHolderPath = Location.joinWithSlash(remoteComponentConfig.baseUrl, environment.DEFAULT_LOGO_PATH)
    this.avatarService.configuration = new Configuration({
      basePath: Location.joinWithSlash(remoteComponentConfig.baseUrl, environment.apiPrefix)
    })
  }

  ngOnInit(): void {
    // Set imagePath explicit, extend later when avatar of different user is set
    this.imagePath$ = of(
      bffImageUrl(this.avatarService.configuration.basePath, 'avatar', RefType.Small) ?? this.placeHolderPath
    )
  }

  public onImageError(): void {
    this.displayDefaultLogo = true
  }
}
