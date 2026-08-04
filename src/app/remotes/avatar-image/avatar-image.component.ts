import { Component, EventEmitter, Inject, Input, OnInit, inject } from '@angular/core'
import { AsyncPipe, Location, NgStyle } from '@angular/common'
import { RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { Observable, ReplaySubject, of } from 'rxjs'

import { SkeletonModule } from 'primeng/skeleton'

import {
  AngularRemoteComponentsModule,
  ocxRemoteComponent,
  ocxRemoteWebcomponent
} from '@onecx/angular-remote-components'
import { AngularAcceleratorModule } from '@onecx/angular-accelerator'
import { REMOTE_COMPONENT_CONFIG, RemoteComponentConfig } from '@onecx/angular-utils'

import { Configuration, RefType, UserAvatarAPIService } from 'src/app/shared/generated'
import { bffImageUrl } from 'src/app/shared/utils'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-avatar-image',
  standalone: true,
  imports: [
    AsyncPipe,
    NgStyle,
    AngularAcceleratorModule,
    AngularRemoteComponentsModule,
    RouterModule,
    SkeletonModule,
    TranslateModule
  ],
  templateUrl: './avatar-image.component.html',
  styleUrls: ['./avatar-image.component.scss']
})
export class OneCXAvatarImageComponent implements ocxRemoteComponent, ocxRemoteWebcomponent, OnInit {
  private readonly remoteComponentConfig = inject<ReplaySubject<RemoteComponentConfig>>(REMOTE_COMPONENT_CONFIG)
  // input
  @Input() id: string | undefined = undefined
  @Input() styleClass: string | undefined = undefined // image container
  @Input() imageStyleClass: string | undefined = undefined // image
  @Input() imageStyle: string | undefined = undefined // image
  @Input() imageType: RefType = RefType.Small // image
  // output
  @Input() imageLoaded = new EventEmitter<boolean>()

  public imagePath$: Observable<string> | undefined
  public placeHolderPath = ''
  public displayImage = false

  constructor(
    @Inject(REMOTE_COMPONENT_CONFIG)
    private readonly remoteComponentConfig$: ReplaySubject<RemoteComponentConfig>,
    private readonly avatarService: UserAvatarAPIService
  ) {}

  @Input() set ocxRemoteComponentConfig(config: RemoteComponentConfig) {
    this.ocxInitRemoteComponent(config)
  }

  ocxInitRemoteComponent(config: RemoteComponentConfig) {
    this.remoteComponentConfig.next(config)
    this.placeHolderPath = Location.joinWithSlash(config.baseUrl, environment.DEFAULT_LOGO_PATH)
    this.avatarService.configuration = new Configuration({
      basePath: Location.joinWithSlash(config.baseUrl, environment.apiPrefix)
    })
  }

  ngOnInit(): void {
    // imagePath$ is an observable on purpose, so this component can be easily extended to
    // also display avatars of other user where a call the bff is needed to get the url
    // To do this, call the bff here and set the observable as imagePath$ here
    this.imagePath$ = of(bffImageUrl(this.avatarService.configuration.basePath, 'avatar', this.imageType))
  }

  public onImageError(): void {
    this.imagePath$ = of(this.placeHolderPath)
    this.imageLoaded.emit(false)
  }
  public onImageLoad(): void {
    this.imageLoaded.emit(true)
    this.displayImage = true
  }
}
