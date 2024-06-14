import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { HttpErrorResponse } from '@angular/common/http'

import { AvatarInfo, UserService, AppStateService, PortalMessageService } from '@onecx/portal-integration-angular'

import { RefType, UserAvatarAPIService } from 'src/app/shared/generated'
import { map, Observable, of } from 'rxjs'
import { DOC_ORIENTATION, NgxImageCompressService } from 'ngx-image-compress'
import { bffImageUrl } from 'src/app/shared/utils'
// import base64

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {
  @ViewChild('selectedFileInput') selectedFileInput: ElementRef | undefined
  public selectedFile: File | undefined
  public userAvatar$: Observable<AvatarInfo | undefined> | undefined
  public showAvatarDeleteDialog = false
  public previewSrc: string | undefined
  public imageUrl$: Observable<any> | undefined
  protected placeHolderPath = 'onecx-portal-lib/assets/images/default_avatar.png'

  @ViewChild('avatarImage', { read: ElementRef, static: true })
  public avatarImage!: ElementRef

  imageUrlIsEmpty: boolean | undefined
  imageUrl: string | undefined
  smallImgResultAfterCompression: string = ''
  mediumImgResultAfterCompression: string = ''
  largeImgResultAfterCompression: string = ''

  bffImagePath = this.avatarService.configuration.basePath!

  constructor(
    private avatarService: UserAvatarAPIService,
    private msgService: PortalMessageService,
    private userService: UserService,
    private appStateService: AppStateService,
    private imageCompress: NgxImageCompressService
  ) {}

  public ngOnInit(): void {
    this.imageUrlIsEmpty = false
    this.imageUrl = bffImageUrl(this.bffImagePath, 'avatar', RefType.Large)
  }

  public onDeleteAvatarImage(): void {
    this.userAvatar$ = this.userService.profile$.pipe(map(() => undefined))
    this.showAvatarDeleteDialog = false
    this.avatarService.deleteUserAvatar({ refType: RefType.Medium }).subscribe({
      next: () => {
        this.msgService.success({ summaryKey: 'AVATAR.MSG.REMOVE_SUCCESS' })
        window.location.reload()
      },
      error: () => {
        this.msgService.error({ summaryKey: 'AVATAR.MSG.REMOVE_ERROR' })
      }
    })
    this.imageUrl$ = this.appStateService.currentMfe$.pipe(
      map((currentMfe) => (currentMfe.remoteBaseUrl ? currentMfe.remoteBaseUrl : './') + this.placeHolderPath)
    )
  }

  uploadFile() {
    this.imageCompress.uploadFile().then(({ image, orientation }) => {
      this.imageCompress.compressFile(image, orientation, 100, 100).then(async (compressedImage) => {
        if (this.imageCompress.byteCount(compressedImage) > 1000) {
          this.smallImgResultAfterCompression = await this.compressBelowThreshold(
            compressedImage,
            1000,
            orientation,
            100
          )
        } else {
          this.smallImgResultAfterCompression = compressedImage
        }
        this.sendImage(this.smallImgResultAfterCompression, RefType.Small)
      })

      this.imageCompress.compressFile(image, orientation, 100, 100).then(async (compressedImage) => {
        if (this.imageCompress.byteCount(compressedImage) > 10000) {
          this.mediumImgResultAfterCompression = await this.compressBelowThreshold(
            compressedImage,
            10000,
            orientation,
            100
          )
        } else {
          this.mediumImgResultAfterCompression = compressedImage
        }
        this.sendImage(this.mediumImgResultAfterCompression, RefType.Medium)
      })

      this.imageCompress.compressFile(image, orientation, 100, 100).then(async (compressedImage) => {
        if (this.imageCompress.byteCount(compressedImage) > 100000) {
          this.largeImgResultAfterCompression = await this.compressBelowThreshold(
            compressedImage,
            100000,
            orientation,
            100
          )
        } else {
          this.largeImgResultAfterCompression = compressedImage
        }
        this.sendImage(this.largeImgResultAfterCompression, RefType.Large)
        this.selectedFile = new File([this.largeImgResultAfterCompression], 'untitled', { type: RefType.Large })
      })
    })
  }

  private async compressBelowThreshold(
    image: string,
    threshold: number,
    orientation: DOC_ORIENTATION,
    quality: number
  ): Promise<string> {
    const compressedImage = await this.imageCompress.compressFile(image, orientation, quality * 0.95, 100)

    if (this.imageCompress.byteCount(compressedImage) > threshold) {
      return this.compressBelowThreshold(compressedImage, threshold, orientation, quality * 0.95)
    }
    return compressedImage
  }

  /** Send compressed images to avatar ser */
  public sendImage(image: string, refType: RefType): void {
    let base64Png = image.split(',').at(1)!
    const decodedData = atob(base64Png)
    const uint8Array = new Uint8Array(decodedData.length)
    for (let i = 0; i < decodedData.length; ++i) {
      uint8Array[i] = decodedData.charCodeAt(i)
    }
    const blob = new Blob([uint8Array], { type: 'image/*' })

    if (this.imageUrlIsEmpty) {
      this.avatarService.uploadAvatar({ refType: refType, body: blob }).subscribe({
        next: (data: any) => {
          this.showUploadSuccess()
          localStorage.removeItem('tkit_user_profile')
          window.location.reload()

          if (refType === RefType.Large) {
            this.imageUrl$ = of(image)
          }
        },
        error: (error: HttpErrorResponse) => {
          if (error.error?.errorCode === 'WRONG_AVATAR_CONTENT_TYPE') {
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
      this.avatarService.updateAvatar({ refType: refType, body: blob }).subscribe({
        next: (data: any) => {
          this.showUploadSuccess()
          localStorage.removeItem('tkit_user_profile')
          window.location.reload()

          if (refType === RefType.Large) {
            this.imageUrl$ = of(image)
          }
        },
        error: (error: HttpErrorResponse) => {
          if (error.error?.errorCode === 'WRONG_AVATAR_CONTENT_TYPE') {
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

  public showUploadSuccess(): void {
    this.msgService.success({ summaryKey: 'AVATAR.MSG.UPLOAD_SUCCESS' })
  }

  public onImageError(value: boolean): void {
    this.imageUrlIsEmpty = value
  }
}
