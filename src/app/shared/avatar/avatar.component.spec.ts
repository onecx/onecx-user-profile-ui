import { ComponentFixture, TestBed, fakeAsync, waitForAsync } from '@angular/core/testing'
import { AppStateService, PortalMessageService, UserService } from '@onecx/portal-integration-angular'

import { AvatarComponent } from './avatar.component'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { RefType, UserAvatarAdminAPIService, UserAvatarAPIService } from 'src/app/shared/generated'
import { of, throwError } from 'rxjs'
import { NgxImageCompressService } from 'ngx-image-compress'
import { HttpErrorResponse, HttpEventType, HttpHeaders, provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'

describe('AvatarComponent', () => {
  let component: AvatarComponent
  let fixture: ComponentFixture<AvatarComponent>

  const userServiceSpy = {
    removeAvatar: jasmine.createSpy('removeAvatar'),
    profile$: jasmine.createSpy('profile$')
  }
  const avatarUserSpy = {
    deleteUserAvatar: jasmine.createSpy('deleteUserAvatar').and.returnValue(of({})),
    uploadAvatar: jasmine.createSpy('uploadAvatar').and.returnValue(of({})),
    getUserAvatar: jasmine.createSpy('getUserAvatar').and.returnValue(of({})),
    configuration: jasmine.createSpy('configuration')
  }
  const avatarAdminSpy = {
    getUserAvatarById: jasmine.createSpy('getUserAvatarById').and.returnValue(of({})),
    uploadAvatarById: jasmine.createSpy('uploadAvatarById').and.returnValue(of({})),
    deleteUserAvatarById: jasmine.createSpy('deleteUserAvatarById').and.returnValue(of({}))
  }
  const imageCompressSpy = {
    uploadFile: jasmine.createSpy('uploadFile').and.returnValue(of({})),
    compressFile: jasmine.createSpy('compressFile').and.returnValue(of({})),
    byteCount: jasmine.createSpy('byteCount').and.returnValue('testString')
  }

  const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error'])

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AvatarComponent],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('/src/assets/i18n/de.json'),
          en: require('/src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideHttpClientTesting(),
        provideHttpClient(),
        { provide: UserService, useValue: userServiceSpy },
        { provide: UserAvatarAPIService, useValue: avatarUserSpy },
        { provide: UserAvatarAdminAPIService, useValue: avatarAdminSpy },
        { provide: PortalMessageService, useValue: msgServiceSpy },
        { provide: AppStateService },
        { provide: NgxImageCompressService, useValue: imageCompressSpy }
      ]
    }).compileComponents()
    msgServiceSpy.success.calls.reset()
    msgServiceSpy.error.calls.reset()
    imageCompressSpy.uploadFile.calls.reset()
    imageCompressSpy.compressFile.calls.reset()
    avatarUserSpy.deleteUserAvatar.calls.reset()
    avatarUserSpy.uploadAvatar.calls.reset()
    avatarUserSpy.getUserAvatar.calls.reset()
    avatarUserSpy.configuration.and.callFake(() => {
      return { basePath: '/mocked-base-path' }
    })
    avatarAdminSpy.deleteUserAvatarById.calls.reset()
    avatarAdminSpy.uploadAvatarById.calls.reset()
    avatarAdminSpy.getUserAvatarById.calls.reset()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AvatarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('onChanges', () => {
    it('should get the avatar image url - on user mode', () => {
      component.componentInUse = true
      component.userId = undefined

      component.ngOnChanges()

      expect(component.imageUrl).toBeDefined()
    })

    it('should get the avatar image url failed - on admin mode', () => {
      const errorResponse = { status: 404, statusText: 'Not Found' }
      avatarAdminSpy.getUserAvatarById.and.returnValue(throwError(() => errorResponse))
      component.componentInUse = true
      component.userId = 'id'
      spyOn(console, 'error')

      component.ngOnChanges()

      expect(console.error).toHaveBeenCalledWith('getUserAvatarById', errorResponse)
    })

    it('should get the avatar image url, but no avatar exists - on admin mode', () => {
      const errorResponse = { status: 204, statusText: 'No Content' }
      avatarAdminSpy.getUserAvatarById.and.returnValue(throwError(() => errorResponse))
      component.componentInUse = true
      component.userId = 'id'
      spyOn(console, 'error')

      component.ngOnChanges()

      expect(console.error).toHaveBeenCalledWith('getUserAvatarById', errorResponse)
    })

    it('should get the avatar image url - on admin mode', () => {
      avatarAdminSpy.getUserAvatarById.and.returnValue(of(null))
      component.componentInUse = true
      component.userId = 'id'
      spyOn(console, 'error')

      component.ngOnChanges()

      expect(component.imageUrl).toBeUndefined()
      expect(component.imageLoadError).toBeTrue()
      expect(console.error).not.toHaveBeenCalled()
    })
  })

  it('should get the avatar image url for another user', () => {
    const dummyImageData = new Uint8Array([137, 80, 78, 71])
    const imageBlob = new Blob([dummyImageData], { type: 'image/png' })
    avatarAdminSpy.getUserAvatarById.and.returnValue(of(imageBlob))
    component.componentInUse = true
    component.userId = 'id'

    component.ngOnChanges()

    expect(component.imageUrl).toBeDefined()
  })

  describe('onDeleteAvatarImage', () => {
    it('should delete successfully my Avatar image: user view => reload', () => {
      component.componentInUse = true
      component.userId = undefined
      avatarUserSpy.deleteUserAvatar.and.returnValue(of({ refType: RefType.Medium }))

      component.onDeleteAvatarImage()

      expect(avatarUserSpy.deleteUserAvatar).toHaveBeenCalled()
      expect(component.showAvatarDeleteDialog).toBeFalse()
      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'AVATAR.MSG.REMOVE_SUCCESS' })
    })

    it('should delete successfully my Avatar image: admin view => no page reload', () => {
      component.componentInUse = true
      component.userId = undefined
      avatarUserSpy.deleteUserAvatar.and.returnValue(of({ refType: RefType.Medium }))

      component.onDeleteAvatarImage()

      expect(avatarUserSpy.deleteUserAvatar).toHaveBeenCalled()
      expect(component.showAvatarDeleteDialog).toBeFalse()
      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'AVATAR.MSG.REMOVE_SUCCESS' })
    })

    it('should get error if deletion of my Avatar image fails', fakeAsync(() => {
      const errorResponse = { error: 'Error on removing my image', status: 400 }
      component.componentInUse = true
      component.userId = undefined

      avatarUserSpy.deleteUserAvatar.and.returnValue(throwError(() => errorResponse))

      component.onDeleteAvatarImage()

      expect(avatarUserSpy.deleteUserAvatar).toHaveBeenCalled()
      expect(component.showAvatarDeleteDialog).toBeFalse()
      expect(msgServiceSpy.error).toHaveBeenCalledWith({ summaryKey: 'AVATAR.MSG.REMOVE_ERROR' })
    }))

    it('should delete existing Avatar image of another user', () => {
      avatarAdminSpy.deleteUserAvatarById.and.returnValue(of({}))
      component.componentInUse = true
      component.userId = 'id'

      component.onDeleteAvatarImage()

      expect(component.showAvatarDeleteDialog).toBeFalse()
      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'AVATAR.MSG.REMOVE_SUCCESS' })
    })

    it('should handle delete existing Avatar image of another user', () => {
      const errorResponse = { error: 'Error on removing image of another user', status: 400 }
      avatarAdminSpy.deleteUserAvatarById.and.returnValue(throwError(() => errorResponse))
      component.componentInUse = true
      component.userId = 'id'

      component.onDeleteAvatarImage()

      expect(msgServiceSpy.error).toHaveBeenCalledWith({ summaryKey: 'AVATAR.MSG.REMOVE_ERROR' })
    })
  })

  describe('onFileUpload', () => {
    it('should compress img for large type', async () => {
      const mockImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sJEw0tLz5pZ4AAAAIdEVYdENvbW1lbnQA9syWvwAAAuFJREFUaN7t2z1rFEEQBuDfQkKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqK'
      const mockOrientation = 0
      const mockCompressedImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGA'
      imageCompressSpy.uploadFile.and.resolveTo({ image: mockImage, orientation: mockOrientation })
      imageCompressSpy.compressFile.and.resolveTo(mockCompressedImage)
      imageCompressSpy.byteCount.and.returnValues(300001, 30001)
      avatarUserSpy.uploadAvatar.and.returnValue(of({ id: 'jpgTestImageId' }))
      component.imageLoadError = false

      await component.onFileUpload()

      expect(imageCompressSpy.compressFile).toHaveBeenCalledTimes(1)
    })

    it('should compress img for medium type', async () => {
      const mockImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sJEw0tLz5pZ4AAAAIdEVYdENvbW1lbnQA9syWvwAAAuFJREFUaN7t2z1rFEEQBuDfQkKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqK'
      const mockOrientation = 0
      const mockCompressedImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGA'
      imageCompressSpy.uploadFile.and.returnValue(Promise.resolve({ image: mockImage, orientation: mockOrientation }))
      imageCompressSpy.compressFile.and.returnValue(Promise.resolve(mockCompressedImage))
      imageCompressSpy.byteCount.and.returnValues(30001, 3001)
      avatarUserSpy.uploadAvatar.and.returnValue(of({ id: 'jpgTestImageId' }))

      await component.onFileUpload()

      expect(imageCompressSpy.compressFile).toHaveBeenCalledTimes(1)
    })

    it('should compress img for small type', async () => {
      const mockImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sJEw0tLz5pZ4AAAAIdEVYdENvbW1lbnQA9syWvwAAAuFJREFUaN7t2z1rFEEQBuDfQkKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqK'
      const mockOrientation = 0
      const mockCompressedImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGA'
      imageCompressSpy.uploadFile.and.returnValue(Promise.resolve({ image: mockImage, orientation: mockOrientation }))
      imageCompressSpy.compressFile.and.returnValue(Promise.resolve(mockCompressedImage))
      imageCompressSpy.byteCount.and.returnValues(3001, 3000)
      avatarUserSpy.uploadAvatar.and.returnValue(of({ id: 'jpgTestImageId' }))

      await component.onFileUpload()

      expect(imageCompressSpy.compressFile).toHaveBeenCalledTimes(1)
    })

    it('should compress the image within the limit in one step', async () => {
      imageCompressSpy.byteCount.and.returnValues(1500, 800)
      imageCompressSpy.compressFile.and.returnValue(Promise.resolve('compressed-image'))

      const result = await component['compressByRatio']('image', 1000)
      expect(result).toBe('compressed-image')
      expect(imageCompressSpy.compressFile).toHaveBeenCalledTimes(1)
    })

    it('should compress the image exceeding the limit in several steps', async () => {
      imageCompressSpy.byteCount.and.returnValues(300000, 800)
      imageCompressSpy.compressFile.and.returnValue(Promise.resolve('compressed-image'))

      const result = await component['compressByRatio']('image', 500)
      expect(result).toBe('compressed-image')
      expect(imageCompressSpy.compressFile).toHaveBeenCalledTimes(2)
    })
  })

  describe('sendImage', () => {
    it('should display msg if upload failed', () => {
      const mockCompressedImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGA'
      const updateErrorResponse: HttpErrorResponse = {
        status: 404,
        statusText: 'Not Found',
        name: 'HttpErrorResponse',
        message: '',
        error: undefined,
        ok: false,
        headers: new HttpHeaders(),
        url: null,
        type: HttpEventType.ResponseHeader
      }
      avatarUserSpy.uploadAvatar.and.returnValue(throwError(() => updateErrorResponse))

      component.imageLoadError = true
      component.sendImage(mockCompressedImage, RefType.Small)

      expect(msgServiceSpy.error).toHaveBeenCalledWith({
        summaryKey: 'AVATAR.MSG.UPLOAD_ERROR.SUMMARY',
        detailKey: 'AVATAR.MSG.UPLOAD_ERROR.DETAIL'
      })
    })

    it('should handle empty img string and display msg if upload failed', () => {
      const updateErrorResponse: HttpErrorResponse = {
        status: 404,
        statusText: 'Not Found',
        name: 'HttpErrorResponse',
        message: '',
        error: undefined,
        ok: false,
        headers: new HttpHeaders(),
        url: null,
        type: HttpEventType.ResponseHeader
      }
      avatarUserSpy.uploadAvatar.and.returnValue(throwError(() => updateErrorResponse))

      component.imageLoadError = true
      component.sendImage('', RefType.Small)

      expect(msgServiceSpy.error).toHaveBeenCalledWith({
        summaryKey: 'AVATAR.MSG.UPLOAD_ERROR.SUMMARY',
        detailKey: 'AVATAR.MSG.UPLOAD_ERROR.DETAIL'
      })
    })

    it('should display specific error msg if content type is wrong', () => {
      const mockCompressedImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGA'

      const updateErrorResponse: HttpErrorResponse = {
        status: 404,
        statusText: 'Not Found',
        name: 'HttpErrorResponse',
        message: '',
        error: {
          errorCode: 'WRONG_CONTENT_TYPE'
        },
        ok: false,
        headers: new HttpHeaders(),
        url: null,
        type: HttpEventType.ResponseHeader
      }
      avatarUserSpy.uploadAvatar.and.returnValue(throwError(() => updateErrorResponse))

      component.imageLoadError = true
      component.sendImage(mockCompressedImage, RefType.Small)

      expect(msgServiceSpy.error).toHaveBeenCalledWith({
        summaryKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.SUMMARY',
        detailKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.DETAIL'
      })
    })

    it('should upload image of (me) user', () => {
      spyOn(component, 'reloadPage')
      avatarUserSpy.uploadAvatar.and.returnValue(of({}))
      component.userId = undefined

      component.sendImage('image', RefType.Large)

      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'AVATAR.MSG.UPLOAD_SUCCESS' })
    })

    it('should upload SMALL image of (me) user', () => {
      spyOn(component, 'reloadPage')
      avatarUserSpy.uploadAvatar.and.returnValue(of({}))
      component.userId = undefined

      component.sendImage('image', RefType.Small)

      expect(component.reloadPage).toHaveBeenCalled()
    })

    it('should upload LARGE image of another user', () => {
      const dummyImageData = new Uint8Array([137, 80, 78, 71])
      const imageBlob = new Blob([dummyImageData], { type: 'image/png' })
      avatarAdminSpy.getUserAvatarById.and.returnValue(of(imageBlob))
      component.userId = 'id'

      component.ngOnChanges()

      component.sendImage('image', RefType.Large)

      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'AVATAR.MSG.UPLOAD_SUCCESS' })
    })

    it('handle error trying to upload image of another user', () => {
      avatarAdminSpy.uploadAvatarById.and.returnValue(throwError(() => new Error()))
      component.userId = 'id'

      component.sendImage('image', RefType.Large)

      expect(msgServiceSpy.error).toHaveBeenCalledWith({
        summaryKey: 'AVATAR.MSG.UPLOAD_ERROR.SUMMARY',
        detailKey: 'AVATAR.MSG.UPLOAD_ERROR.DETAIL'
      })
    })

    it('handle wrong content type error trying to upload image of another user', () => {
      const err = {
        error: { errorCode: 'WRONG_CONTENT_TYPE' }
      }
      avatarAdminSpy.uploadAvatarById.and.returnValue(throwError(() => err))
      component.userId = 'id'

      component.sendImage('image', RefType.Large)

      expect(msgServiceSpy.error).toHaveBeenCalledWith({
        summaryKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.SUMMARY',
        detailKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.DETAIL'
      })
    })
  })

  it('should test onImageError', () => {
    component.imageLoadError = false
    component.onImageError(true)
    expect(component.imageLoadError).toBeTrue()
  })

  it('should reload page', () => {
    component.reloadPage()
  })
})
