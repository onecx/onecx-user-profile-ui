import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { AppStateService, PortalMessageService, UserService } from '@onecx/portal-integration-angular'

import { AvatarComponent } from './avatar.component'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { UserAvatarAPIService } from 'src/app/shared/generated'
import { of } from 'rxjs'

describe('AvatarComponent', () => {
  let component: AvatarComponent
  let fixture: ComponentFixture<AvatarComponent>

  const userServiceSpy = {
    removeAvatar: jasmine.createSpy('removeAvatar'),
    profile$: jasmine.createSpy('profile$')
  }

  const avatarServiceSpy = {
    deleteUserAvatar: jasmine.createSpy('deleteUserAvatar'),
    uploadAvatar: jasmine.createSpy('uploadAvatar'),
    getUserAvatar: jasmine.createSpy('getUserAvatar').and.returnValue(of({})),
    configuration: jasmine.createSpy('configuration')
  }

  const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error'])

  //   const avatarOnBackend = {
  //     avatar: {
  //       userUploaded: true,
  //       lastUpdateTime: undefined,
  //       imageUrl: 'mockUrl',
  //       smallImageUrl: 'smallUrl'
  //     }
  //   }

  //   const avatarHttp = {
  //     avatar: {
  //       userUploaded: true,
  //       lastUpdateTime: undefined,
  //       imageUrl: 'http://mockUrl',
  //       smallImageUrl: 'http://mockUrl'
  //     }
  //   }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AvatarComponent],
      imports: [
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: UserAvatarAPIService, useValue: avatarServiceSpy },
        { provide: PortalMessageService, useValue: msgServiceSpy },
        { provide: UserService },
        { provide: AppStateService }
      ]
    }).compileComponents()
    msgServiceSpy.success.calls.reset()
    msgServiceSpy.error.calls.reset()
    avatarServiceSpy.deleteUserAvatar.calls.reset()
    avatarServiceSpy.uploadAvatar.calls.reset()
    avatarServiceSpy.getUserAvatar.calls.reset()
    avatarServiceSpy.configuration.and.callFake(() => {
      return { basePath: '/mocked-base-path' }
    })
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AvatarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  describe('Save Avatar image', () => {
    it('should upload a new File', () => {
      component.ngOnInit()
    })
  })

  describe('Delete Avatar image', () => {
    it('should delete an existing Avatar image', () => {})
  })
})

// import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

// import { HttpClient, HttpErrorResponse } from '@angular/common/http'
// import { AvatarComponent } from './avatar.component'
// import { AUTH_SERVICE, MFE_INFO, PortalMessageService, UserProfile } from '@onecx/portal-integration-angular'
// import { HttpClientTestingModule } from '@angular/common/http/testing'
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
// import { HttpLoaderFactory } from '../../shared/shared.module'
// import { of, throwError } from 'rxjs'
// import { UserProfileService } from '../user-profile.service'
// import { AvatarUploadService } from 'src/app/shared/avatar-upload.service'
// import { By } from '@angular/platform-browser'
// import { DialogModule } from 'primeng/dialog'
// import { ButtonModule } from 'primeng/button'
// import { MockIfPremissionDirective } from '../../test/mocks/if-permission-mock.directive'

// describe('AvatarComponent', () => {
//   let component: AvatarComponent
//   let fixture: ComponentFixture<AvatarComponent>

//   const userProfileServiceSpy = {
//     removeAvatar: jasmine.createSpy('removeAvatar')
//   }

//   const avatarServiceSpy = {
//     setUserAvatar: jasmine.createSpy('setUserAvatar')
//   }

//   const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error'])

//   const authServiceSpy = jasmine.createSpyObj('AUTH_SERVICE', ['getCurrentUser', 'getAuthProviderName'])

//   const avatarOnBackend = {
//     avatar: {
//       userUploaded: true,
//       lastUpdateTime: undefined,
//       imageUrl: 'mockUrl',
//       smallImageUrl: 'smallUrl'
//     }
//   }

//   const avatarHttp = {
//     avatar: {
//       userUploaded: true,
//       lastUpdateTime: undefined,
//       imageUrl: 'http://mockUrl',
//       smallImageUrl: 'http://mockUrl'
//     }
//   }

//   beforeEach(waitForAsync(() => {
//     TestBed.configureTestingModule({
//       declarations: [AvatarComponent, MockIfPremissionDirective],
//       imports: [
//         HttpClientTestingModule,
//         DialogModule,
//         ButtonModule,
//         TranslateModule.forRoot({
//           loader: {
//             provide: TranslateLoader,
//             useFactory: HttpLoaderFactory,
//             deps: [HttpClient]
//           }
//         })
//       ],
//       providers: [
//         { provide: AUTH_SERVICE, useValue: authServiceSpy },
//         { provide: UserProfileService, useValue: userProfileServiceSpy },
//         { provide: AvatarUploadService, useValue: avatarServiceSpy },
//         { provide: PortalMessageService, useValue: msgServiceSpy }
//       ]
//     })
//     msgServiceSpy.success.calls.reset()
//     msgServiceSpy.error.calls.reset()
//     authServiceSpy.getCurrentUser.and.returnValue(avatarOnBackend as UserProfile)
//     userProfileServiceSpy.removeAvatar.calls.reset()
//   }))

//   describe('when MFE_INFO is not provided', () => {
//     beforeEach(() => {
//       TestBed.compileComponents()
//       fixture = TestBed.createComponent(AvatarComponent)
//       component = fixture.componentInstance
//       fixture.detectChanges()
//     })

//     it('should create with backend avatar', () => {
//       expect(component).toBeTruthy()
//       expect(component.userAvatar).toEqual(avatarOnBackend.avatar)
//       expect(component.imageUrl).toBe(component.apiPrefix + avatarOnBackend.avatar.imageUrl)
//       const imgDebugEl = fixture.debugElement.query(By.css('img'))
//       expect(imgDebugEl.nativeElement.getAttribute('aria-describedby')).toBe('Avatar image')
//     })

//     it('should create with http avatar', () => {
//       authServiceSpy.getCurrentUser.and.returnValue(avatarHttp as UserProfile)

//       component.ngOnInit()
//       expect(component.userAvatar).toEqual(avatarHttp.avatar)
//       expect(component.imageUrl).toBe(avatarHttp.avatar.imageUrl)
//     })

//     it('should use placeholder if avatar not provided', () => {
//       authServiceSpy.getCurrentUser.and.returnValue({})

//       component.ngOnInit()
//       fixture.detectChanges()

//       expect(component.imageUrl).toBe('./' + component.placeHolderPath)
//       const imgDebugEl = fixture.debugElement.query(By.css('img'))
//       expect(imgDebugEl.nativeElement.getAttribute('aria-describedby')).toBe('Avatar placeholder image')
//       const deleteButton = fixture.debugElement.query(By.css('#up_avatar_button_remove'))
//       expect(deleteButton).toBeNull()
//     })

//     it('should close dialog and use placehoder after onDeleteAvatarImage success', () => {
//       const windowSpy = spyOn(component, 'reloadWindow')
//       userProfileServiceSpy.removeAvatar.and.returnValue(of({}))
//       component.showAvatarDeleteDialog = true

//       expect(component.showAvatarDeleteDialog).toBeTrue()

//       component.onDeleteAvatarImage()
//       expect(component.userAvatar).toBeUndefined()
//       expect(component.showAvatarDeleteDialog).toBeFalse()
//       expect(msgServiceSpy.success).toHaveBeenCalledOnceWith({ summaryKey: 'AVATAR.MSG.REMOVE_SUCCESS' })
//       expect(windowSpy.calls.count()).toBe(1)
//       expect(component.imageUrl).toBe('./' + component.placeHolderPath)
//     })

//     it('should close dialog and display error after onDeleteAvatarImage failure', () => {
//       const windowSpy = spyOn(component, 'reloadWindow')
//       userProfileServiceSpy.removeAvatar.and.returnValue(throwError(() => new Error()))
//       component.showAvatarDeleteDialog = true

//       expect(component.showAvatarDeleteDialog).toBeTrue()

//       component.onDeleteAvatarImage()
//       expect(component.userAvatar).toBeUndefined()
//       expect(component.showAvatarDeleteDialog).toBeFalse()
//       expect(msgServiceSpy.error).toHaveBeenCalledOnceWith({ summaryKey: 'AVATAR.MSG.REMOVE_ERROR' })
//       expect(windowSpy.calls.count()).toBe(0)
//       expect(component.imageUrl).toBe('./' + component.placeHolderPath)
//     })

//     it('should validate and uploadImage on onFileUpload', () => {
//       authServiceSpy.getAuthProviderName.and.returnValue('mockAuthProvider')

//       const dataTransfer = new DataTransfer()
//       let blob = ''
//       for (let i = 500 * 500; i > 0; i--) blob += 'b'
//       dataTransfer.items.add(new File([blob], 'my-file.png'))

//       const inputDebugEl = fixture.debugElement.query(By.css('input[type=file]'))
//       // Select file from input
//       inputDebugEl.nativeElement.files = dataTransfer.files

//       // Fire change event of input
//       inputDebugEl.nativeElement.dispatchEvent(new InputEvent('change'))

//       fixture.detectChanges()

//       // TODO: check if updateImage run correctly
//       // TODO: check if checkDimension run correctly
//       expect(msgServiceSpy.success).toHaveBeenCalledOnceWith({ summaryKey: 'AVATAR.MSG.UPLOAD_SUCCESS' })
//     })

//     it('should validate and uploadImage on onFileUpload with non-mock auth provider', () => {
//       authServiceSpy.getAuthProviderName.and.returnValue('myProviderName')

//       const newAvatarData = {
//         userUploaded: true,
//         lastUpdateTime: undefined,
//         imageUrl: 'myUrl',
//         smallImageUrl: 'mySmallUrl'
//       }

//       avatarServiceSpy.setUserAvatar.and.returnValue(of(newAvatarData))

//       const windowSpy = spyOn(component, 'reloadWindow')

//       const dataTransfer = new DataTransfer()
//       let blob = ''
//       for (let i = 500 * 500; i > 0; i--) blob += 'b'
//       dataTransfer.items.add(new File([blob], 'my-file.png'))

//       const inputDebugEl = fixture.debugElement.query(By.css('input[type=file]'))
//       // Select file from input
//       inputDebugEl.nativeElement.files = dataTransfer.files

//       // Fire change event of input
//       inputDebugEl.nativeElement.dispatchEvent(new InputEvent('change'))

//       fixture.detectChanges()

//       // Expected selectedFile prior to img.onload function fire
//       expect(component.selectedFile?.name).toBe('my-file.png')
//       expect(msgServiceSpy.success).toHaveBeenCalledOnceWith({ summaryKey: 'AVATAR.MSG.UPLOAD_SUCCESS' })
//       expect(localStorage.getItem('tkit_user_profile')).toBeNull()
//       expect(windowSpy.calls.count()).toBe(1)
//       expect(component.userAvatar).toEqual(newAvatarData)
//       expect(component.imageUrl).toBe(component.apiPrefix + newAvatarData.imageUrl)

//       // TODO: check if img loads correctly via img.onload
//       // expect(component.selectedFile?.size).toBe(400*400)
//       // expect(component.selectedFile?.name).toBe('untitled')
//     })

//     it('should display approperiate message on wrong avatar content error', () => {
//       authServiceSpy.getAuthProviderName.and.returnValue('myProviderName')

//       avatarServiceSpy.setUserAvatar.and.returnValue(
//         throwError(
//           () =>
//             new HttpErrorResponse({
//               error: {
//                 errorCode: 'WRONG_AVATAR_CONTENT_TYPE'
//               }
//             })
//         )
//       )

//       const dataTransfer = new DataTransfer()
//       let blob = ''
//       for (let i = 4; i > 0; i--) blob += 'b'
//       dataTransfer.items.add(new File([blob], 'my-file.png'))

//       const inputDebugEl = fixture.debugElement.query(By.css('input[type=file]'))
//       inputDebugEl.nativeElement.files = dataTransfer.files

//       inputDebugEl.nativeElement.dispatchEvent(new InputEvent('change'))

//       fixture.detectChanges()

//       expect(msgServiceSpy.error).toHaveBeenCalledOnceWith({
//         summaryKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.SUMMARY',
//         detailKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.DETAIL'
//       })
//     })

//     it('should display default upload error message on error with unknown status code', () => {
//       authServiceSpy.getAuthProviderName.and.returnValue('myProviderName')

//       avatarServiceSpy.setUserAvatar.and.returnValue(throwError(() => new HttpErrorResponse({})))

//       const dataTransfer = new DataTransfer()
//       let blob = ''
//       for (let i = 4; i > 0; i--) blob += 'b'
//       dataTransfer.items.add(new File([blob], 'my-file.png'))

//       const inputDebugEl = fixture.debugElement.query(By.css('input[type=file]'))
//       inputDebugEl.nativeElement.files = dataTransfer.files

//       inputDebugEl.nativeElement.dispatchEvent(new InputEvent('change'))

//       fixture.detectChanges()

//       expect(msgServiceSpy.error).toHaveBeenCalledOnceWith({
//         summaryKey: 'AVATAR.MSG.UPLOAD_ERROR.SUMMARY',
//         detailKey: 'AVATAR.MSG.UPLOAD_ERROR.DETAIL'
//       })
//     })
//   })

//   describe('when MFE_INFO is provided', () => {
//     beforeEach(() => {
//       TestBed.overrideProvider(MFE_INFO, {
//         useValue: {
//           baseHref: '/base/path',
//           mountPath: '/base/path',
//           remoteBaseUrl: 'http://localhost:4200',
//           shellName: 'shell'
//         }
//       })
//       TestBed.compileComponents()
//       fixture = TestBed.createComponent(AvatarComponent)
//       component = fixture.componentInstance
//       fixture.detectChanges()
//     })

//     it('should use placeholder if avatar not provided', () => {
//       authServiceSpy.getCurrentUser.and.returnValue({})

//       component.ngOnInit()
//       expect(component.imageUrl).toBe('http://localhost:4200' + component.placeHolderPath)
//     })

//     it('should close dialog, reload and use placehoder after onDeleteAvatarImage success', () => {
//       const windowSpy = spyOn(component, 'reloadWindow')
//       userProfileServiceSpy.removeAvatar.and.returnValue(of({}))
//       component.showAvatarDeleteDialog = true

//       expect(component.showAvatarDeleteDialog).toBeTrue()

//       component.onDeleteAvatarImage()
//       expect(component.userAvatar).toBeUndefined()
//       expect(component.showAvatarDeleteDialog).toBeFalse()
//       expect(msgServiceSpy.success).toHaveBeenCalledOnceWith({ summaryKey: 'AVATAR.MSG.REMOVE_SUCCESS' })
//       expect(windowSpy.calls.count()).toBe(1)
//       expect(component.imageUrl).toBe('http://localhost:4200' + component.placeHolderPath)
//     })

//     it('should close dialog and display error after onDeleteAvatarImage failure', () => {
//       const windowSpy = spyOn(component, 'reloadWindow')
//       userProfileServiceSpy.removeAvatar.and.returnValue(throwError(() => new Error()))
//       component.showAvatarDeleteDialog = true

//       expect(component.showAvatarDeleteDialog).toBeTrue()

//       component.onDeleteAvatarImage()
//       expect(component.userAvatar).toBeUndefined()
//       expect(component.showAvatarDeleteDialog).toBeFalse()
//       expect(msgServiceSpy.error).toHaveBeenCalledOnceWith({ summaryKey: 'AVATAR.MSG.REMOVE_ERROR' })
//       expect(windowSpy.calls.count()).toBe(0)
//       expect(component.imageUrl).toBe('http://localhost:4200' + component.placeHolderPath)
//     })
//   })
// })
