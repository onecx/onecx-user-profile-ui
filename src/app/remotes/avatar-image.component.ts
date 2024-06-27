import { CommonModule, Location } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Component, Inject, OnInit } from '@angular/core'
import { RouterModule } from '@angular/router'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import {
  AngularRemoteComponentsModule,
  BASE_URL,
  RemoteComponentConfig,
  provideTranslateServiceForRoot
} from '@onecx/angular-remote-components'
import {
  PortalCoreModule,
  UserProfile,
  UserService,
  createRemoteComponentTranslateLoader
} from '@onecx/portal-integration-angular'
import { SharedModule } from 'primeng/api'
import { Observable, ReplaySubject, map } from 'rxjs'
import { SharedModule as SharedModuleUserProfile } from '../shared/shared.module'
import { Configuration, RefType, UserAvatarAPIService } from '../shared/generated'
import { bffImageUrl } from '../shared/utils'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-avatar-image',
  standalone: true,
  templateUrl: './avatar-image.component.html',
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
@UntilDestroy()
export class OneCXAvatarImageComponent implements OnInit {
  currentUser$: Observable<UserProfile>

  constructor(
    @Inject(BASE_URL) private baseUrl: ReplaySubject<string>,
    private avatarService: UserAvatarAPIService,
    private userService: UserService
  ) {
    this.currentUser$ = this.userService.profile$.pipe(
      map((profile) => {
        return profile
      })
    )
  }

  ngOnInit(): void {
    this.currentUser$ = this.currentUser$.pipe(
      map((profile) => {
        profile.avatar = {
          smallImageUrl:
            bffImageUrl(this.avatarService.configuration.basePath, 'avatar', RefType.Small) ??
            profile.avatar?.smallImageUrl
        }
        return profile
      })
    )
  }

  ocxInitRemoteComponent(remoteComponentConfig: RemoteComponentConfig) {
    this.baseUrl.next(remoteComponentConfig.baseUrl)
    this.avatarService.configuration = new Configuration({
      basePath: Location.joinWithSlash(remoteComponentConfig.baseUrl, environment.apiPrefix)
    })
  }
}
