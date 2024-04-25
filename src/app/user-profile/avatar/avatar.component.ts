import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { HttpErrorResponse } from '@angular/common/http'

import { AvatarInfo, UserService, AppStateService, PortalMessageService } from '@onecx/portal-integration-angular'

import { RefType, UserAvatarAPIService } from 'src/app/shared/generated'
import { environment } from '../../../environments/environment'
import { combineLatest, map, Observable } from 'rxjs'

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
  public imageUrl$: Observable<string> | undefined
  private apiPrefix = environment.apiPrefix
  protected placeHolderPath = 'onecx-portal-lib/assets/images/default_avatar.png'

  @ViewChild('avatarImage', { read: ElementRef, static: true })
  public avatarImage!: ElementRef

  constructor(
    private avatarService: UserAvatarAPIService,
    private msgService: PortalMessageService,
    private userService: UserService,
    private appStateService: AppStateService
  ) {}

  public ngOnInit(): void {
    this.userAvatar$ = this.userService.profile$.pipe(map((profile) => profile.avatar))
    this.prepareAvatarImageUrl()
  }

  public onDeleteAvatarImage(): void {
    this.userAvatar$ = this.userService.profile$.pipe(map(() => undefined))
    this.showAvatarDeleteDialog = false
    this.avatarService.deleteUserAvatar({ refType: RefType.Normal }).subscribe({
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

  // Extract image file(s)
  onFileUpload(ev: Event): void {
    if (ev.target && (ev.target as HTMLInputElement).files) {
      const files = (ev.target as HTMLInputElement).files
      if (files) {
        // this.selectedFile
        Array.from(files).forEach((file) => {
          this.selectedFile = file
          this.checkDimension(this.selectedFile)
          this.uploadImage()
        })
      }
    }
  }

  public showUploadSuccess(): void {
    this.msgService.success({ summaryKey: 'AVATAR.MSG.UPLOAD_SUCCESS' })
  }

  public uploadImage(): void {
    // if (this.authService.getAuthProviderName().toLowerCase().includes('mock')) {
    //   this.updateImage()
    //   this.showUploadSuccess()
    //   return
    // }
    // revert to userProfileService once BFF is fixed
    this.selectedFile &&
      this.avatarService.uploadAvatar({ body: this.selectedFile }).subscribe({
        next: (data: any) => {
          this.showUploadSuccess()
          localStorage.removeItem('tkit_user_profile')
          window.location.reload()

          this.userAvatar$ = this.userService.profile$.pipe(map((profile) => (profile.avatar = data)))
          this.prepareAvatarImageUrl()
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

  private prepareAvatarImageUrl(): void {
    // if image URL does not start with a http, then it stored in the backend. So we need to put prefix in front
    this.imageUrl$ = combineLatest([
      this.userService.profile$.asObservable(),
      this.appStateService.currentMfe$.asObservable()
    ]).pipe(
      map(([userProfile, currentMfe]) => {
        if (userProfile.avatar?.imageUrl && !userProfile.avatar.imageUrl.match(/^(http|https)/g)) {
          return this.apiPrefix + userProfile.avatar.imageUrl
        } else {
          return userProfile.avatar?.imageUrl
            ? userProfile.avatar.imageUrl
            : // this.mfeInfo is available only in non standalone mode
              (currentMfe.remoteBaseUrl ? currentMfe.remoteBaseUrl : './') + this.placeHolderPath
        }
      })
    )
  }

  /* Displays latest image in UI */
  private updateImage(): void {
    if (this.selectedFile) {
      const reader = new FileReader()
      reader.readAsDataURL(this.selectedFile)
      reader.onload = (): void => {
        if (reader.result) {
          this.userAvatar$ = this.userService.profile$.pipe(
            map(() => ({ smallImageUrl: reader.result?.toString(), imageUrl: reader.result?.toString() }))
          )
        }
      }
    }
  }

  private checkDimension(file: File): void {
    const reader = new FileReader()
    const img = new Image()

    reader.onload = (e: any) => {
      img.src = e.target.result.toString()

      img.onload = () => {
        const elem = document.createElement('canvas')
        elem.width = 400
        elem.height = 400
        const ctx = elem.getContext('2d')
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ctx!.drawImage(img, 0, 0, 400, 400)
        elem.toBlob((blob) => {
          if (blob) {
            this.selectedFile = new File([blob], 'untitled', { type: blob.type })
          }
        })
        this.previewSrc = elem.toDataURL()
      }
    }
    reader.readAsDataURL(file)
  }
}
