import { Component, Input, OnChanges } from '@angular/core'
import { Location } from '@angular/common'
import { HttpErrorResponse } from '@angular/common/http'
import { catchError, map, Observable, of } from 'rxjs'
import { NgxImageCompressService } from 'ngx-image-compress'

import { AppStateService } from '@onecx/angular-integration-interface'
import { PortalMessageService } from '@onecx/portal-integration-angular'

import { RefType, UserAvatarAdminAPIService, UserAvatarAPIService } from 'src/app/shared/generated'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnChanges {
  @Input() userId: string | undefined = undefined
  @Input() componentInUse = false // prevent displaying and reloading things

  public imageUrl$: Observable<any> | undefined
  public defaultImageUrl: string | undefined
  public displayAvatarDeleteDialog = false
  public showPlaceholder = true

  constructor(
    private readonly avatarAdminService: UserAvatarAdminAPIService,
    private readonly avatarMeService: UserAvatarAPIService,
    private readonly location: Location,
    private readonly msgService: PortalMessageService,
    private readonly imageCompress: NgxImageCompressService,
    private readonly appState: AppStateService
  ) {
    // get the placeholder image
    appState.currentMfe$
      .pipe(
        map((mfe) => {
          this.defaultImageUrl = Location.joinWithSlash(mfe.remoteBaseUrl, environment.DEFAULT_LOGO_PATH)
        })
      )
      .subscribe()
  }

  public ngOnChanges(): void {
    this.showPlaceholder = true
    if (!this.componentInUse) return
    if (this.userId) {
      this.getUserAvatarImage() // admin view
    } else {
      this.getMeAvatarImage() // me view
    }
  }

  /**
   * Getting avatar image (blob) for me (the user logged in) ... if exists
   * If not exists (204) or any error occur (4xx) then use placeholder
   */
  public getMeAvatarImage() {
    this.imageUrl$ = this.avatarMeService.getUserAvatar({ refType: RefType.Large }).pipe(
      map((data) => {
        // data exists => 200 else 204
        this.showPlaceholder = !data
        return data ? URL.createObjectURL(data) : this.defaultImageUrl
      }),
      catchError((error) => {
        this.showPlaceholder = true
        console.error('getUserAvatar', error)
        return of(this.defaultImageUrl)
      })
    )
  }

  /**
   * Getting the avatar image (blob) for a certain user ... if exists
   * If not exists (204) or any error occur (4xx) then use placeholder
   */
  public getUserAvatarImage() {
    this.imageUrl$ = this.avatarAdminService.getUserAvatarById({ id: this.userId!, refType: RefType.Large }).pipe(
      map((data) => {
        // data exists => 200 else 204
        this.showPlaceholder = !data
        return data ? URL.createObjectURL(data) : this.defaultImageUrl
      }),
      catchError((error) => {
        this.showPlaceholder = true
        console.error('getUserAvatarById', error)
        return of(this.defaultImageUrl)
      })
    )
  }

  public onDeleteAvatarImage(): void {
    this.displayAvatarDeleteDialog = false
    if (this.userId) {
      this.avatarAdminService.deleteUserAvatarById({ id: this.userId }).subscribe({
        next: () => {
          this.showPlaceholder = true
          this.imageUrl$ = of(this.defaultImageUrl)
          this.msgService.success({ summaryKey: 'AVATAR.MSG.REMOVE_SUCCESS' })
        },
        error: (error) => {
          console.error('deleteUserAvatarById', error)
          this.msgService.error({ summaryKey: 'AVATAR.MSG.REMOVE_ERROR' })
        }
      })
    } else {
      this.avatarMeService.deleteUserAvatar().subscribe({
        next: () => {
          this.msgService.success({ summaryKey: 'AVATAR.MSG.REMOVE_SUCCESS' })
          if (!this.userId) this.reloadPage()
        },
        error: (error) => {
          console.error('deleteUserAvatar', error)
          this.msgService.error({ summaryKey: 'AVATAR.MSG.REMOVE_ERROR' })
        }
      })
    }
  }

  public onFileUpload(): void {
    const debug = false
    const log = function (text: string): void {
      if (debug) console.log(text)
    }
    this.imageCompress.uploadFile().then(({ image }) => {
      const bytes = this.imageCompress.byteCount(image)
      const ratio = 50
      log('initialBytes: ' + bytes)
      if (bytes <= environment.AVATAR_SIZE_SMALL) {
        log('small')
        this.sendImage(image, RefType.Large)
        this.sendImage(image, RefType.Medium)
        this.sendImage(image, RefType.Small)
      } else if (bytes <= environment.AVATAR_SIZE_MEDIUM) {
        log('medium')
        this.sendImage(image, RefType.Large)
        this.sendImage(image, RefType.Medium)
        this.compressImage(image, ratio, environment.AVATAR_SIZE_SMALL, RefType.Small, log, true)
      } else if (bytes <= environment.AVATAR_SIZE_LARGE) {
        log('large')
        this.sendImage(image, RefType.Large)
        this.compressImage(image, ratio, environment.AVATAR_SIZE_MEDIUM, RefType.Medium, log)
        this.compressImage(image, ratio, environment.AVATAR_SIZE_SMALL, RefType.Small, log, true)
      } else {
        log('> large')
        this.compressImage(image, ratio, environment.AVATAR_SIZE_LARGE, RefType.Large, log)
        this.compressImage(image, ratio, environment.AVATAR_SIZE_MEDIUM, RefType.Medium, log)
        this.compressImage(image, ratio, environment.AVATAR_SIZE_SMALL, RefType.Small, log, true)
      }
    })
  }
  /* Rescale the image by suitable scale factor in a few steps */
  private compressImage(
    image: string,
    ratio: number,
    limit: number,
    refType: RefType,
    log: (s: string) => void,
    reload: boolean = false
  ): void {
    this.imageCompress.compressFile(image, 0, ratio).then(async (image) => {
      const img = await this.compressByRatio(image, ratio, limit)
      const bytes = this.imageCompress.byteCount(img)
      log('compressed => limit: ' + limit + '  bytes: ' + bytes)
      this.sendImage(img, refType, reload)
    })
  }

  private async compressByRatio(image: string, ratio: number, limit: number): Promise<string> {
    const img = await this.imageCompress.compressFile(image, 0, ratio, 100)
    if (this.imageCompress.byteCount(img) > limit) {
      return this.compressByRatio(img, ratio, limit)
    } else return img
  }

  /* Send compressed images to avatar service */
  public sendImage(image: string, refType: RefType, reload: boolean = false): void {
    const base64Png = image.split(',').at(1) ?? ''
    const decodedData = atob(base64Png)
    const uint8Array = new Uint8Array(decodedData.length)
    for (let i = 0; i < decodedData.length; ++i) {
      uint8Array[i] = decodedData.charCodeAt(i)
    }
    const blob = new Blob([uint8Array], { type: 'image/*' })

    if (this.userId) {
      // admin perspective: upload only, refresh large image
      this.avatarAdminService.uploadAvatarById({ id: this.userId, refType, body: blob }).subscribe({
        next: () => {
          if (refType === RefType.Large) {
            localStorage.removeItem('tkit_user_profile')
            this.msgService.success({ summaryKey: 'AVATAR.MSG.UPLOAD_SUCCESS' })
            this.getUserAvatarImage()
          }
        },
        error: (error: HttpErrorResponse) => {
          if (error.error?.errorCode === 'WRONG_CONTENT_TYPE') {
            this.msgService.error({
              summaryKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.SUMMARY',
              detailKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.DETAIL'
            })
          } else {
            this.msgService.error({
              summaryKey: 'AVATAR.MSG.UPLOAD_ERROR.SUMMARY',
              detailKey: 'AVATAR.MSG.UPLOAD_ERROR.DETAIL'
            })
          }
        }
      })
    } else {
      // user perspective: upload and reload
      this.avatarMeService.uploadAvatar({ refType: refType, body: blob }).subscribe({
        next: () => {
          if (refType === RefType.Large) {
            localStorage.removeItem('tkit_user_profile')
            this.msgService.success({ summaryKey: 'AVATAR.MSG.UPLOAD_SUCCESS' })
            this.imageUrl$ = of(URL.createObjectURL(blob))
          }
          if (reload) this.reloadPage()
        },
        error: (error: HttpErrorResponse) => {
          if (error.error?.errorCode === 'WRONG_CONTENT_TYPE') {
            this.msgService.error({
              summaryKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.SUMMARY',
              detailKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.DETAIL'
            })
          } else {
            this.msgService.error({
              summaryKey: 'AVATAR.MSG.UPLOAD_ERROR.SUMMARY',
              detailKey: 'AVATAR.MSG.UPLOAD_ERROR.DETAIL'
            })
          }
        }
      })
    }
  }

  public reloadPage() {
    this.location.historyGo(0) // load current page = reload (trick for code coverage)
  }
}
