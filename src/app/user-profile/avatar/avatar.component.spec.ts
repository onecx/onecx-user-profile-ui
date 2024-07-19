import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { AppStateService, PortalMessageService, UserService } from '@onecx/portal-integration-angular'

import { AvatarComponent } from './avatar.component'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { RefType, UserAvatarAPIService } from 'src/app/shared/generated'
import { of, throwError } from 'rxjs'
import { NgxImageCompressService } from 'ngx-image-compress'
import { HttpErrorResponse, HttpEventType, HttpHeaders } from '@angular/common/http'

describe('AvatarComponent', () => {
  let component: AvatarComponent
  let fixture: ComponentFixture<AvatarComponent>

  const userServiceSpy = {
    removeAvatar: jasmine.createSpy('removeAvatar'),
    profile$: jasmine.createSpy('profile$')
  }

  const avatarServiceSpy = {
    deleteUserAvatar: jasmine.createSpy('deleteUserAvatar').and.returnValue(of({})),
    uploadAvatar: jasmine.createSpy('uploadAvatar').and.returnValue(of({})),
    updateAvatar: jasmine.createSpy('updateAvatar').and.returnValue(of({})),
    getUserAvatar: jasmine.createSpy('getUserAvatar').and.returnValue(of({})),
    configuration: jasmine.createSpy('configuration')
  }

  const imageCompressSpy = {
    uploadFile: jasmine.createSpy('uploadFile').and.returnValue(of({})),
    compressFile: jasmine.createSpy('compressFile').and.returnValue(of({})),
    byteCount: jasmine.createSpy('byteCount').and.returnValue('testString')
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
        { provide: AppStateService },
        { provide: NgxImageCompressService, useValue: imageCompressSpy }
      ]
    }).compileComponents()
    msgServiceSpy.success.calls.reset()
    msgServiceSpy.error.calls.reset()
    imageCompressSpy.uploadFile.calls.reset()
    imageCompressSpy.compressFile.calls.reset()
    avatarServiceSpy.deleteUserAvatar.calls.reset()
    avatarServiceSpy.uploadAvatar.calls.reset()
    avatarServiceSpy.updateAvatar.calls.reset()
    avatarServiceSpy.getUserAvatar.calls.reset()
    avatarServiceSpy.configuration.and.callFake(() => {
      return { basePath: '/mocked-base-path' }
    })
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AvatarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    spyOn(component, 'windowReload').and.returnValue()
  })

  describe('Save Avatar image', () => {
    it('should upload a new File', () => {
      component.ngOnInit()
    })
  })

  it('should delete an existing Avatar image', fakeAsync(() => {
    // Create an jpg base 64 image
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = 500
    canvas.height = 500
    context.fillStyle = 'red'
    context.fillRect(0, 0, canvas.width, canvas.height)
    // Convert the canvas to a base64-encoded JPG
    const base64Image = canvas.toDataURL('image/jpeg', 0.8) // Adjust quality (0.8 is just an example)

    // Mock the response from the ImageCompress service
    const mockImage = base64Image
    const mockOrientation = 0
    const mockCompressedImage =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGA'
    imageCompressSpy.uploadFile.and.resolveTo({ image: mockImage, orientation: mockOrientation })
    imageCompressSpy.compressFile.and.resolveTo(mockCompressedImage)
    imageCompressSpy.byteCount.and.returnValue('200')

    avatarServiceSpy.uploadAvatar.and.returnValue(of({ id: 'jpgTestImageId' }))
    avatarServiceSpy.deleteUserAvatar.and.returnValue(of({ refType: RefType.Medium }))

    component.imageLoadError = true
    // Call the onFileUpload method
    component.onFileUpload()
    tick(1000)
    component.onDeleteAvatarImage()

    // Expect the necessary methods to have been called
    expect(avatarServiceSpy.deleteUserAvatar).toHaveBeenCalled()
    expect(component.showAvatarDeleteDialog).toBeFalse()
    expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'AVATAR.MSG.REMOVE_SUCCESS' })
  }))

  it('should return error when delete failure', fakeAsync(() => {
    const deleteErrorResponse: HttpErrorResponse = {
      status: 401,
      statusText: 'Not Found',
      name: 'HttpErrorResponse',
      message: '',
      error: undefined,
      ok: false,
      headers: new HttpHeaders(),
      url: null,
      type: HttpEventType.ResponseHeader
    }

    avatarServiceSpy.deleteUserAvatar.and.returnValue(throwError(() => deleteErrorResponse))

    component.onDeleteAvatarImage()

    // Expect the necessary methods to have been called
    expect(avatarServiceSpy.deleteUserAvatar).toHaveBeenCalled()
    expect(component.showAvatarDeleteDialog).toBeFalse()
    expect(msgServiceSpy.error).toHaveBeenCalledWith({ summaryKey: 'AVATAR.MSG.REMOVE_ERROR' })
  }))

  it('should call the update methods when file exists in image', async () => {
    // Mock the response from the ImageCompress service
    const mockImage =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sJEw0tLz5pZ4AAAAIdEVYdENvbW1lbnQA9syWvwAAAuFJREFUaN7t2z1rFEEQBuDfQkKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqKQqK'
    const mockOrientation = 0
    const mockCompressedImage =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGA'
    imageCompressSpy.uploadFile.and.resolveTo({ image: mockImage, orientation: mockOrientation })
    imageCompressSpy.compressFile.and.resolveTo(mockCompressedImage)
    imageCompressSpy.byteCount.and.returnValue(of('2000'))

    avatarServiceSpy.uploadAvatar.and.returnValue(of({ id: 'jpgTestImageId' }))
    avatarServiceSpy.updateAvatar.and.returnValue(of({ id: 'jpgTestImageId' }))

    component.imageLoadError = false
    // Call the onFileUpload method
    await component.onFileUpload()

    // Expect the necessary methods to have been called
    expect(imageCompressSpy.uploadFile).toHaveBeenCalled()
  })

  it('should UPDATE failed', fakeAsync(() => {
    // Create an jpg base 64 image
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = 500
    canvas.height = 500
    context.fillStyle = 'red'
    context.fillRect(0, 0, canvas.width, canvas.height)
    // Convert the canvas to a base64-encoded JPG
    const base64Image = canvas.toDataURL('image/jpeg', 0.8) // Adjust quality (0.8 is just an example)

    // Mock the response from the ImageCompress service
    const mockImage = base64Image
    const mockOrientation = 0
    const mockCompressedImage =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGA'
    imageCompressSpy.uploadFile.and.resolveTo({ image: mockImage, orientation: mockOrientation })
    imageCompressSpy.compressFile.and.resolveTo(mockCompressedImage)
    imageCompressSpy.byteCount.and.returnValue('200')

    const updateErrorResponse: HttpErrorResponse = {
      status: 404,
      statusText: 'Not Found',
      name: 'HttpErrorResponse',
      message: '',
      error: { errorCode: 'WRONG_AVATAR_CONTENT_TYPE' },
      ok: false,
      headers: new HttpHeaders(),
      url: null,
      type: HttpEventType.ResponseHeader
    }

    avatarServiceSpy.updateAvatar.and.returnValue(throwError(() => updateErrorResponse))

    component.imageLoadError = false
    // Call the onFileUpload method
    component.onFileUpload()

    tick(1000)

    // Expect the necessary methods to have been called
    expect(msgServiceSpy.error).toHaveBeenCalledWith({
      summaryKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.SUMMARY',
      detailKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.DETAIL'
    })
  }))

  it('should UPDATE failed WRONG_AVATAR_CONTENT_TYPE', fakeAsync(() => {
    // Create an jpg base 64 image
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = 500
    canvas.height = 500
    context.fillStyle = 'red'
    context.fillRect(0, 0, canvas.width, canvas.height)
    // Convert the canvas to a base64-encoded JPG
    const base64Image = canvas.toDataURL('image/jpeg', 0.8) // Adjust quality (0.8 is just an example)

    // Mock the response from the ImageCompress service
    const mockImage = base64Image
    const mockOrientation = 0
    const mockCompressedImage =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGA'
    imageCompressSpy.uploadFile.and.resolveTo({ image: mockImage, orientation: mockOrientation })
    imageCompressSpy.compressFile.and.resolveTo(mockCompressedImage)
    imageCompressSpy.byteCount.and.returnValue('200')

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

    avatarServiceSpy.updateAvatar.and.returnValue(throwError(() => updateErrorResponse))

    component.imageLoadError = false
    // Call the onFileUpload method
    component.onFileUpload()

    tick(1000)

    // Expect the necessary methods to have been called
    expect(msgServiceSpy.error).toHaveBeenCalledWith({
      summaryKey: 'AVATAR.MSG.UPLOAD_ERROR.SUMMARY',
      detailKey: 'AVATAR.MSG.UPLOAD_ERROR.DETAIL'
    })
  }))

  it('should upload image to avatar service when compressed, image over 100 000 bytes', fakeAsync(() => {
    // Create an jpg base 64 image
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = 500
    canvas.height = 500
    context.fillStyle = 'red'
    context.fillRect(0, 0, canvas.width, canvas.height)
    // Convert the canvas to a base64-encoded JPG
    const base64Image = canvas.toDataURL('image/jpeg', 0.8) // Adjust quality (0.8 is just an example)

    // Mock the response from the ImageCompress service
    const mockImage = base64Image
    const mockOrientation = 0
    const mockCompressedImage =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGA'
    imageCompressSpy.uploadFile.and.resolveTo({ image: mockImage, orientation: mockOrientation })
    imageCompressSpy.compressFile.and.resolveTo(mockCompressedImage)
    imageCompressSpy.byteCount.and.returnValue('200')

    avatarServiceSpy.uploadAvatar.and.returnValue(of({ id: 'jpgTestImageId' }))

    component.imageLoadError = true
    // Call the onFileUpload method
    component.onFileUpload()
    tick(1000)

    // Expect the necessary methods to have been called
    expect(avatarServiceSpy.uploadAvatar).toHaveBeenCalled()
  }))

  it('should UPLOAD failed', fakeAsync(() => {
    // Create an jpg base 64 image
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = 500
    canvas.height = 500
    context.fillStyle = 'red'
    context.fillRect(0, 0, canvas.width, canvas.height)
    // Convert the canvas to a base64-encoded JPG
    const base64Image = canvas.toDataURL('image/jpeg', 0.8) // Adjust quality (0.8 is just an example)

    // Mock the response from the ImageCompress service
    const mockImage = base64Image
    const mockOrientation = 0
    const mockCompressedImage =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGA'
    imageCompressSpy.uploadFile.and.resolveTo({ image: mockImage, orientation: mockOrientation })
    imageCompressSpy.compressFile.and.resolveTo(mockCompressedImage)
    imageCompressSpy.byteCount.and.returnValue('200')

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

    avatarServiceSpy.uploadAvatar.and.returnValue(throwError(() => updateErrorResponse))

    component.imageLoadError = true
    // Call the onFileUpload method
    component.onFileUpload()

    tick(1000)

    // Expect the necessary methods to have been called
    expect(msgServiceSpy.error).toHaveBeenCalledWith({
      summaryKey: 'AVATAR.MSG.UPLOAD_ERROR.SUMMARY',
      detailKey: 'AVATAR.MSG.UPLOAD_ERROR.DETAIL'
    })
  }))

  it('should UPLOAD failed WRONG_AVATAR_CONTENT_TYPE', fakeAsync(() => {
    // Create an jpg base 64 image
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = 500
    canvas.height = 500
    context.fillStyle = 'red'
    context.fillRect(0, 0, canvas.width, canvas.height)
    // Convert the canvas to a base64-encoded JPG
    const base64Image = canvas.toDataURL('image/jpeg', 0.8) // Adjust quality (0.8 is just an example)

    // Mock the response from the ImageCompress service
    const mockImage = base64Image
    const mockOrientation = 0
    const mockCompressedImage =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGA'
    imageCompressSpy.uploadFile.and.resolveTo({ image: mockImage, orientation: mockOrientation })
    imageCompressSpy.compressFile.and.resolveTo(mockCompressedImage)
    imageCompressSpy.byteCount.and.returnValue('200')

    const updateErrorResponse: HttpErrorResponse = {
      status: 404,
      statusText: 'Not Found',
      name: 'HttpErrorResponse',
      message: '',
      error: { errorCode: 'WRONG_AVATAR_CONTENT_TYPE' },
      ok: false,
      headers: new HttpHeaders(),
      url: null,
      type: HttpEventType.ResponseHeader
    }

    avatarServiceSpy.uploadAvatar.and.returnValue(throwError(() => updateErrorResponse))

    component.imageLoadError = true
    // Call the onFileUpload method
    component.onFileUpload()

    tick(1000)

    // Expect the necessary methods to have been called
    expect(msgServiceSpy.error).toHaveBeenCalledWith({
      summaryKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.SUMMARY',
      detailKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.DETAIL'
    })
  }))

  it('should test recursive compressBelowThreshold', fakeAsync(() => {
    // Create an jpg base 64 image
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = 500
    canvas.height = 500
    context.fillStyle = 'red'
    context.fillRect(0, 0, canvas.width, canvas.height)
    // Convert the canvas to a base64-encoded JPG
    const base64Image = canvas.toDataURL('image/jpeg', 0.8) // Adjust quality (0.8 is just an example)

    // Mock the response from the ImageCompress service
    const mockImage = base64Image
    const mockOrientation = 0
    const mockCompressedImage =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGA'
    imageCompressSpy.uploadFile.and.resolveTo({ image: mockImage, orientation: mockOrientation })
    imageCompressSpy.compressFile.and.resolveTo(mockCompressedImage)
    imageCompressSpy.byteCount.and.returnValues(2000, 20000, 200000, 500, 5000, 50000)

    const updateErrorResponse: HttpErrorResponse = {
      status: 404,
      statusText: 'Not Found',
      name: 'HttpErrorResponse',
      message: '',
      error: { errorCode: 'WRONG_AVATAR_CONTENT_TYPE' },
      ok: false,
      headers: new HttpHeaders(),
      url: null,
      type: HttpEventType.ResponseHeader
    }

    avatarServiceSpy.uploadAvatar.and.returnValue(throwError(() => updateErrorResponse))

    component.imageLoadError = true
    // Call the onFileUpload method
    component.onFileUpload()

    tick(1000)

    // Expect the necessary methods to have been called
    expect(msgServiceSpy.error).toHaveBeenCalledWith({
      summaryKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.SUMMARY',
      detailKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.DETAIL'
    })
  }))

  it('should test multiple recursive compressBelowThreshold', fakeAsync(() => {
    // Create an jpg base 64 image
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = 500
    canvas.height = 500
    context.fillStyle = 'red'
    context.fillRect(0, 0, canvas.width, canvas.height)
    // Convert the canvas to a base64-encoded JPG
    const base64Image = canvas.toDataURL('image/jpeg', 0.8) // Adjust quality (0.8 is just an example)

    // Mock the response from the ImageCompress service
    const mockImage = base64Image
    const mockOrientation = 0
    const mockCompressedImage =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGA'
    imageCompressSpy.uploadFile.and.resolveTo({ image: mockImage, orientation: mockOrientation })
    imageCompressSpy.compressFile.and.resolveTo(mockCompressedImage)
    imageCompressSpy.byteCount.and.returnValues(2000, 20000, 200000, 1200, 5000, 50000)

    const updateErrorResponse: HttpErrorResponse = {
      status: 404,
      statusText: 'Not Found',
      name: 'HttpErrorResponse',
      message: '',
      error: { errorCode: 'WRONG_AVATAR_CONTENT_TYPE' },
      ok: false,
      headers: new HttpHeaders(),
      url: null,
      type: HttpEventType.ResponseHeader
    }

    avatarServiceSpy.uploadAvatar.and.returnValue(throwError(() => updateErrorResponse))

    component.imageLoadError = true
    // Call the onFileUpload method
    component.onFileUpload()

    tick(1000)

    // Expect the necessary methods to have been called
    expect(msgServiceSpy.error).toHaveBeenCalledWith({
      summaryKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.SUMMARY',
      detailKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.DETAIL'
    })
  }))

  it('should test onImageError', () => {
    component.imageLoadError = false
    component.onImageError(true)
    expect(component.imageLoadError).toBeTrue()
  })
})
