import { Component, OnInit } from '@angular/core'
import { HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs'
import { NgxImageCompressService } from 'ngx-image-compress'

import { PortalMessageService } from '@onecx/portal-integration-angular'

import { RefType, UserAvatarAPIService } from 'src/app/shared/generated'
import { bffImageUrl } from 'src/app/shared/utils'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {
  public showAvatarDeleteDialog = false
  public previewSrc: string | undefined
  public imageUrl$: Observable<any> | undefined
  protected placeHolderPath = 'onecx-portal-lib/assets/images/default_avatar.png'

  imageLoadError: boolean | undefined
  imageUrl: string | undefined

  bffImagePath = this.avatarService.configuration.basePath

  constructor(
    private readonly avatarService: UserAvatarAPIService,
    private readonly msgService: PortalMessageService,
    private readonly imageCompress: NgxImageCompressService
  ) {}

  public ngOnInit(): void {
    this.imageLoadError = false
    this.imageUrl = bffImageUrl(this.bffImagePath, 'avatar', RefType.Large)
  }

  public onDeleteAvatarImage(): void {
    this.showAvatarDeleteDialog = false
    this.avatarService.deleteUserAvatar().subscribe({
      next: () => {
        this.msgService.success({ summaryKey: 'AVATAR.MSG.REMOVE_SUCCESS' })
        this.windowReload()
      },
      error: () => {
        this.msgService.error({ summaryKey: 'AVATAR.MSG.REMOVE_ERROR' })
      }
    })
  }

  onFileUpload() {
    this.imageCompress.uploadFile().then(({ image }) => {
      this.imageCompress.compressFile(image, 0, 100, 100).then(async (compressedImage) => {
        let bytes = this.imageCompress.byteCount(compressedImage)
        let img = compressedImage
        // Large
        if (bytes > environment.AVATAR_SIZE_LARGE) {
          img = await this.compressByRatio(img, environment.AVATAR_SIZE_LARGE) // limit by service: 110.000
          bytes = this.imageCompress.byteCount(img)
        }
        this.sendImage(img, RefType.Large)
        // Medium
        if (bytes > environment.AVATAR_SIZE_MEDIUM) {
          img = await this.compressByRatio(img, environment.AVATAR_SIZE_MEDIUM)
          bytes = this.imageCompress.byteCount(img)
        }
        this.sendImage(img, RefType.Medium)
        // Small (topbar icon)
        if (bytes > environment.AVATAR_SIZE_SMALL) {
          img = await this.compressByRatio(img, environment.AVATAR_SIZE_SMALL) // below 3000 the image has too low quality
        }
        this.sendImage(img, RefType.Small)
      })
    })
  }

  /* Rescale the image by suitable scale factor in a few steps */
  private async compressByRatio(image: string, limit: number): Promise<string> {
    const ratio = this.calculateRatio(this.imageCompress.byteCount(image), limit)
    const img = await this.imageCompress.compressFile(image, 0, ratio, 100)
    if (this.imageCompress.byteCount(img) > limit) {
      return this.compressByRatio(img, limit)
    } else return img
  }
  /* Calculate the scale factor to avoid to many compression steps */
  private calculateRatio(bytes: number, targetSize: number): number {
    const proportion = parseFloat(parseFloat('' + bytes / targetSize).toFixed(1))
    const ratio = Math.round(100 / proportion)
    return ratio >= 100 ? 97 : ratio // a change by compression is mandatory
  }

  /* Send compressed images to avatar service */
  public sendImage(image: string, refType: RefType): void {
    const base64Png = image.split(',').at(1) ?? ''
    const decodedData = atob(base64Png)
    const uint8Array = new Uint8Array(decodedData.length)
    for (let i = 0; i < decodedData.length; ++i) {
      uint8Array[i] = decodedData.charCodeAt(i)
    }
    const blob = new Blob([uint8Array], { type: 'image/*' })

    this.avatarService.uploadAvatar({ refType: refType, body: blob }).subscribe({
      next: () => {
        if (refType === RefType.Large) {
          localStorage.removeItem('tkit_user_profile')
          this.msgService.success({ summaryKey: 'AVATAR.MSG.UPLOAD_SUCCESS' })
        }
        if (refType === RefType.Small) this.windowReload()
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

  public onImageError(value: boolean): void {
    this.imageLoadError = value
  }

  public windowReload() {
    window.location.reload()
  }
}
