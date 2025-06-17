import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, fakeAsync, waitForAsync } from '@angular/core/testing'
import { HttpErrorResponse, HttpEventType, HttpHeaders, provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { NgxImageCompressService } from 'ngx-image-compress'
import { of, throwError } from 'rxjs'

import { AppStateService, PortalMessageService, UserService } from '@onecx/angular-integration-interface'

import { RefType, UserAvatarAdminAPIService, UserAvatarAPIService } from 'src/app/shared/generated'
import { environment } from 'src/environments/environment'
import { AvatarComponent } from './avatar.component'

class MockAppStateService {
  currentMfe$ = of({
    remoteBaseUrl: '/base/'
  })
}

describe('AvatarComponent', () => {
  let component: AvatarComponent
  let fixture: ComponentFixture<AvatarComponent>
  let mockAppStateService: MockAppStateService

  const userServiceSpy = {
    removeAvatar: jasmine.createSpy('removeAvatar'),
    profile$: jasmine.createSpy('profile$')
  }
  const avatarMeSpy = {
    configuration: jasmine.createSpy('configuration'),
    getUserAvatar: jasmine.createSpy('getUserAvatar').and.returnValue(of({})),
    uploadAvatar: jasmine.createSpy('uploadAvatar').and.returnValue(of({})),
    deleteUserAvatar: jasmine.createSpy('deleteUserAvatar').and.returnValue(of({}))
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
    mockAppStateService = new MockAppStateService()

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
        { provide: UserAvatarAPIService, useValue: avatarMeSpy },
        { provide: UserAvatarAdminAPIService, useValue: avatarAdminSpy },
        { provide: PortalMessageService, useValue: msgServiceSpy },
        { provide: AppStateService, useValue: mockAppStateService },
        { provide: NgxImageCompressService, useValue: imageCompressSpy }
      ]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AvatarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => {
    msgServiceSpy.success.calls.reset()
    msgServiceSpy.error.calls.reset()
    imageCompressSpy.uploadFile.calls.reset()
    imageCompressSpy.compressFile.calls.reset()
    avatarMeSpy.deleteUserAvatar.calls.reset()
    avatarMeSpy.uploadAvatar.calls.reset()
    avatarMeSpy.getUserAvatar.calls.reset()
    avatarMeSpy.configuration.and.callFake(() => {
      return { basePath: '/mocked-base-path' }
    })
    avatarAdminSpy.deleteUserAvatarById.calls.reset()
    avatarAdminSpy.uploadAvatarById.calls.reset()
    avatarAdminSpy.getUserAvatarById.calls.reset()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(component.defaultImageUrl).toEqual('/base/assets/images/default_avatar.png')
  })

  describe('onChanges - basics', () => {
    it('should do nothing if not in use', () => {
      component.componentInUse = false
      component.userId = undefined
      spyOn(component, 'getMeAvatarImage')
      spyOn(component, 'getUserAvatarImage')

      component.ngOnChanges()

      expect(component.showPlaceholder).toBeTrue()
      expect(component['getMeAvatarImage']).not.toHaveBeenCalled()
      expect(component['getUserAvatarImage']).not.toHaveBeenCalled()
    })

    it('should trigger me avatar if component is in use', () => {
      component.componentInUse = true
      component.userId = undefined
      spyOn(component, 'getMeAvatarImage')
      spyOn(component, 'getUserAvatarImage')

      component.ngOnChanges()

      expect(component.showPlaceholder).toBeTrue()
      expect(component['getMeAvatarImage']).toHaveBeenCalled()
      expect(component['getUserAvatarImage']).not.toHaveBeenCalled()
    })

    it('should trigger me avatar if component is in use', () => {
      component.componentInUse = true
      component.userId = 'id'
      spyOn(component, 'getMeAvatarImage')
      spyOn(component, 'getUserAvatarImage')

      component.ngOnChanges()

      expect(component.showPlaceholder).toBeTrue()
      expect(component['getMeAvatarImage']).not.toHaveBeenCalled()
      expect(component['getUserAvatarImage']).toHaveBeenCalled()
    })
  })

  describe('onChanges - me', () => {
    it('should get the avatar image url - on me mode - image exists', () => {
      const blob = new Blob(['a'.repeat(10)], { type: 'image/png' })
      avatarMeSpy.getUserAvatar.and.returnValue(of(blob as any))
      component.componentInUse = true
      component.userId = undefined

      component.ngOnChanges()

      expect(component.imageUrl$).toBeDefined()

      if (component.imageUrl$)
        component.imageUrl$.subscribe((url) => {
          expect(component.showPlaceholder).toBeFalse()
          expect(url).toContain('blob:http://localhost:')
        })
    })

    it('should get the avatar image url - on me mode - image not exist', () => {
      avatarMeSpy.getUserAvatar.and.returnValue(of(null)) // no content = 204
      component.componentInUse = true
      component.userId = undefined

      component.ngOnChanges()

      expect(component.imageUrl$).toBeDefined()

      if (component.imageUrl$)
        component.imageUrl$.subscribe((url) => {
          expect(component.showPlaceholder).toBeTrue()
          expect(url).toEqual(component.defaultImageUrl)
        })
    })

    it('should get the avatar image url - on me mode - failed', () => {
      const errorResponse = { status: 400, statusText: 'Avatar could not be retrieved' }
      avatarMeSpy.getUserAvatar.and.returnValue(throwError(() => errorResponse))
      component.componentInUse = true
      component.userId = undefined
      spyOn(console, 'error')

      component.ngOnChanges()

      expect(component.imageUrl$).toBeDefined()

      if (component.imageUrl$)
        component.imageUrl$.subscribe((url) => {
          expect(component.showPlaceholder).toBeTrue()
          expect(url).toEqual(component.defaultImageUrl)
          expect(console.error).toHaveBeenCalledWith('getUserAvatar', errorResponse)
        })
    })
  })

  describe('onChanges - admin', () => {
    it('should get the avatar image url - on admin mode - image exists', () => {
      const blob = new Blob(['a'.repeat(10)], { type: 'image/png' })
      avatarAdminSpy.getUserAvatarById.and.returnValue(of(blob as any))
      component.componentInUse = true
      component.userId = 'id'

      component.ngOnChanges()

      expect(component.imageUrl$).toBeDefined()

      if (component.imageUrl$)
        component.imageUrl$.subscribe((url) => {
          expect(component.showPlaceholder).toBeFalse()
          expect(url).toContain('blob:http://localhost:')
        })
    })

    it('should get the avatar image url - on admin mode - image not exist', () => {
      avatarAdminSpy.getUserAvatarById.and.returnValue(of(null)) // no content = 204
      component.componentInUse = true
      component.userId = 'id'

      component.ngOnChanges()

      expect(component.imageUrl$).toBeDefined()

      if (component.imageUrl$)
        component.imageUrl$.subscribe((url) => {
          expect(component.showPlaceholder).toBeTrue()
          expect(url).toEqual(component.defaultImageUrl)
        })
    })

    it('should get the avatar image url - on admin mode - failed', () => {
      const errorResponse = { status: 400, statusText: 'Avatar could not be retrieved' }
      avatarAdminSpy.getUserAvatarById.and.returnValue(throwError(() => errorResponse))
      component.componentInUse = true
      component.userId = 'id'
      spyOn(console, 'error')

      component.ngOnChanges()

      expect(component.imageUrl$).toBeDefined()

      if (component.imageUrl$)
        component.imageUrl$.subscribe((url) => {
          expect(component.showPlaceholder).toBeTrue()
          expect(url).toEqual(component.defaultImageUrl)
          expect(console.error).toHaveBeenCalledWith('getUserAvatarById', errorResponse)
        })
    })
  })

  describe('onDeleteAvatarImage', () => {
    it('should delete successfully my Avatar image: user view => reload', () => {
      component.componentInUse = true
      component.userId = undefined
      avatarMeSpy.deleteUserAvatar.and.returnValue(of({ refType: RefType.Medium }))

      component.onDeleteAvatarImage()

      expect(avatarMeSpy.deleteUserAvatar).toHaveBeenCalled()
      expect(component.displayAvatarDeleteDialog).toBeFalse()
      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'AVATAR.MSG.REMOVE_SUCCESS' })
    })

    it('should delete successfully my Avatar image: admin view => no page reload', () => {
      component.componentInUse = true
      component.userId = undefined
      avatarMeSpy.deleteUserAvatar.and.returnValue(of({ refType: RefType.Medium }))

      component.onDeleteAvatarImage()

      expect(avatarMeSpy.deleteUserAvatar).toHaveBeenCalled()
      expect(component.displayAvatarDeleteDialog).toBeFalse()
      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'AVATAR.MSG.REMOVE_SUCCESS' })
    })

    it('should get error if deletion of my Avatar image fails', fakeAsync(() => {
      const errorResponse = { status: 400, statusText: 'Error on removing my avatar' }
      component.componentInUse = true
      component.userId = undefined
      avatarMeSpy.deleteUserAvatar.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.onDeleteAvatarImage()

      expect(avatarMeSpy.deleteUserAvatar).toHaveBeenCalled()
      expect(component.displayAvatarDeleteDialog).toBeFalse()
      expect(msgServiceSpy.error).toHaveBeenCalledWith({ summaryKey: 'AVATAR.MSG.REMOVE_ERROR' })
      expect(console.error).toHaveBeenCalledWith('deleteUserAvatar', errorResponse)
    }))

    it('should delete existing Avatar image of another user', () => {
      avatarAdminSpy.deleteUserAvatarById.and.returnValue(of({}))
      component.componentInUse = true
      component.userId = 'id'

      component.onDeleteAvatarImage()

      expect(component.displayAvatarDeleteDialog).toBeFalse()
      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'AVATAR.MSG.REMOVE_SUCCESS' })
    })

    it('should handle delete existing Avatar image of another user', () => {
      const errorResponse = { error: 'Error on removing image of another user', status: 400 }
      avatarAdminSpy.deleteUserAvatarById.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')
      component.componentInUse = true
      component.userId = 'id'

      component.onDeleteAvatarImage()

      expect(msgServiceSpy.error).toHaveBeenCalledWith({ summaryKey: 'AVATAR.MSG.REMOVE_ERROR' })
      expect(console.error).toHaveBeenCalledWith('deleteUserAvatarById', errorResponse)
    })
  })

  describe('onFileUpload', () => {
    it('should compress image - > large', async () => {
      const mockImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sJEw0tLz5pZ4AAAAIdEVYdENvbW1lbnQA9syWvwAAAuFJREFUaN7t2z1rFEEQBuDfQkKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqK'
      const mockOrientation = 0
      const mockCompressedImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGA'
      imageCompressSpy.uploadFile.and.resolveTo({ image: mockImage, orientation: mockOrientation })
      imageCompressSpy.compressFile.and.resolveTo(mockCompressedImage)
      imageCompressSpy.byteCount.and.returnValues(environment.AVATAR_SIZE_LARGE * 2, 30001)
      avatarMeSpy.uploadAvatar.and.returnValue(of({ id: 'jpgTestImageId' }))

      await component.onFileUpload(true)

      expect(imageCompressSpy.compressFile).toHaveBeenCalledTimes(3)
    })

    it('should compress image - large', async () => {
      const mockImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sJEw0tLz5pZ4AAAAIdEVYdENvbW1lbnQA9syWvwAAAuFJREFUaN7t2z1rFEEQBuDfQkKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqK'
      const mockOrientation = 0
      const mockCompressedImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGA'
      imageCompressSpy.uploadFile.and.resolveTo({ image: mockImage, orientation: mockOrientation })
      imageCompressSpy.compressFile.and.resolveTo(mockCompressedImage)
      imageCompressSpy.byteCount.and.returnValues(environment.AVATAR_SIZE_LARGE, 30001)
      avatarMeSpy.uploadAvatar.and.returnValue(of({ id: 'jpgTestImageId' }))

      await component.onFileUpload()

      expect(imageCompressSpy.compressFile).toHaveBeenCalledTimes(2)
    })

    it('should compress image - medium', async () => {
      const mockImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sJEw0tLz5pZ4AAAAIdEVYdENvbW1lbnQA9syWvwAAAuFJREFUaN7t2z1rFEEQBuDfQkKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqK'
      const mockOrientation = 0
      const mockCompressedImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGA'
      imageCompressSpy.uploadFile.and.returnValue(Promise.resolve({ image: mockImage, orientation: mockOrientation }))
      imageCompressSpy.compressFile.and.returnValue(Promise.resolve(mockCompressedImage))
      imageCompressSpy.byteCount.and.returnValues(environment.AVATAR_SIZE_MEDIUM, 15001)
      avatarMeSpy.uploadAvatar.and.returnValue(of({ id: 'jpgTestImageId' }))

      await component.onFileUpload()

      expect(imageCompressSpy.compressFile).toHaveBeenCalledTimes(1)
    })

    it('should compress image - small', async () => {
      const mockImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sJEw0tLz5pZ4AAAAIdEVYdENvbW1lbnQA9syWvwAAAuFJREFUaN7t2z1rFEEQBuDfQkKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqK'
      const mockOrientation = 0
      const mockCompressedImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGA'
      imageCompressSpy.uploadFile.and.returnValue(Promise.resolve({ image: mockImage, orientation: mockOrientation }))
      imageCompressSpy.compressFile.and.returnValue(Promise.resolve(mockCompressedImage))
      imageCompressSpy.byteCount.and.returnValues(environment.AVATAR_SIZE_SMALL, 3000)
      avatarMeSpy.uploadAvatar.and.returnValue(of({ id: 'jpgTestImageId' }))

      await component.onFileUpload()

      expect(imageCompressSpy.compressFile).toHaveBeenCalledTimes(1)
    })

    it('should compress the image exceeding the limit in several steps', async () => {
      imageCompressSpy.byteCount.and.returnValues(environment.AVATAR_SIZE_LARGE, 800)
      imageCompressSpy.compressFile.and.returnValue(Promise.resolve('compressed-image'))

      const result = await component['compressByRatio']('image', 50, 500)
      expect(result).toBe('compressed-image')
      expect(imageCompressSpy.compressFile).toHaveBeenCalledTimes(3)
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
      avatarMeSpy.uploadAvatar.and.returnValue(throwError(() => updateErrorResponse))

      //component.imageLoadError = true
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
      avatarMeSpy.uploadAvatar.and.returnValue(throwError(() => updateErrorResponse))

      //component.imageLoadError = true
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
      avatarMeSpy.uploadAvatar.and.returnValue(throwError(() => updateErrorResponse))

      //component.imageLoadError = true
      component.sendImage(mockCompressedImage, RefType.Small)

      expect(msgServiceSpy.error).toHaveBeenCalledWith({
        summaryKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.SUMMARY',
        detailKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.DETAIL'
      })
    })

    it('should upload image of (me) user', () => {
      spyOn(component, 'reloadPage')
      avatarMeSpy.uploadAvatar.and.returnValue(of({}))
      component.userId = undefined

      component.sendImage('image', RefType.Large)

      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'AVATAR.MSG.UPLOAD_SUCCESS' })
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

  it('should reload page', () => {
    expect().nothing()
    component.reloadPage()
  })
})
