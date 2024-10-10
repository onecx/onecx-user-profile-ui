import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { HttpErrorResponse, HttpEventType, HttpHeaders, provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { provideRouter } from '@angular/router'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { of, throwError } from 'rxjs'

import { UserProfileAdminAPIService, UserProfilePageResult } from 'src/app/shared/generated'
import { PortalMessageService } from '@onecx/angular-integration-interface'
import { UserProfileSearchComponent } from './user-profile-search.component'

describe('UserProfileSearchComponent', () => {
  let component: UserProfileSearchComponent
  let fixture: ComponentFixture<UserProfileSearchComponent>

  const apiServiceSpy = {
    searchUserProfile: jasmine.createSpy('searchUserProfile').and.returnValue(of({}))
  }

  const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error', 'info'])

  const userProfilepageResult: UserProfilePageResult = {
    totalElements: 5,
    number: 0,
    size: 10,
    totalPages: 1,
    stream: [
      {
        id: '19d3f099-b403-4a41-bf0a-5656c6c674de',
        modificationCount: 27,
        creationDate: '2024-04-24T09:36:40.439905Z',
        creationUser: '359298f8-716e-459b-8962-7669bcb1faa7',
        modificationDate: '2024-04-25T16:14:08.961755Z',
        modificationUser: '359298f8-716e-459b-8962-7669bcb1faa7',
        userId: '359298f8-716e-459b-8962-7669bcb1faa7',
        identityProvider: 'keycloak',
        identityProviderId: '',
        organization: '',
        person: {
          modificationCount: 27,
          firstName: 'Admin',
          lastName: 'Keycloak',
          displayName: 'Admin Keycloak',
          email: 'onecx@gm.com'
        },
        accountSettings: {
          modificationCount: 27,
          hideMyProfile: false,
          locale: '',
          timezone: ''
        }
      },
      {
        id: '5b9ea1c5-0add-44b6-bdc1-0a76421a4b47',
        modificationCount: 0,
        creationDate: '2024-04-03T13:25:48.378482Z',
        creationUser: '8472e391-4c11-49c2-8df0-100ec571c7fa',
        modificationDate: '2024-04-03T13:25:48.378482Z',
        modificationUser: '8472e391-4c11-49c2-8df0-100ec571c7fa',
        userId: '8472e391-4c11-49c2-8df0-100ec571c7fa',
        identityProvider: 'keycloak',
        identityProviderId: '',
        organization: '',
        person: {
          modificationCount: 0,
          firstName: 'Max',
          lastName: 'Admin',
          displayName: 'Max Admin',
          email: 'onecx@gm.com'
        },
        accountSettings: {
          modificationCount: 27,
          hideMyProfile: false,
          locale: '',
          timezone: ''
        }
      }
    ]
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserProfileSearchComponent],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      providers: [
        provideHttpClientTesting(),
        provideHttpClient(),
        provideRouter([{ path: '', component: UserProfileSearchComponent }]),
        { provide: UserProfileAdminAPIService, useValue: apiServiceSpy },
        { provide: PortalMessageService, useValue: msgServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()
    msgServiceSpy.success.calls.reset()
    msgServiceSpy.error.calls.reset()
  })

  beforeEach(async () => {
    fixture = TestBed.createComponent(UserProfileSearchComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should search user profiles - successful found', () => {
    apiServiceSpy.searchUserProfile.and.returnValue(
      of({ stream: userProfilepageResult.stream } as UserProfilePageResult)
    )

    component.search()
    if (userProfilepageResult.stream) {
      expect(component.resultData$.getValue()?.length).toEqual(userProfilepageResult.stream.length)
      expect(component.resultData$.getValue()?.at(0)?.['firstName']).toEqual(
        userProfilepageResult.stream.at(0)?.person?.firstName
      )
      expect(component.resultData$.getValue()?.at(1)?.['firstName']).toEqual(
        userProfilepageResult.stream.at(1)?.person?.firstName
      )
    }

    expect(apiServiceSpy.searchUserProfile).toHaveBeenCalled()
  })

  it('should search user profiles - successful empty stream ', () => {
    apiServiceSpy.searchUserProfile.and.returnValue(of({ stream: [] } as UserProfilePageResult))

    component.search()
    expect(component.resultData$.getValue()?.length).toEqual(0)

    expect(apiServiceSpy.searchUserProfile).toHaveBeenCalled()
    expect(msgServiceSpy.success).toHaveBeenCalledWith({
      summaryKey: 'USERPROFILE_SEARCH.MESSAGE.SUCCESS',
      detailKey: 'USERPROFILE_SEARCH.MESSAGE.NO_RESULTS'
    })
  })

  it('should filter user profiles correctly by input (case insensitive)', () => {
    apiServiceSpy.searchUserProfile.and.returnValue(
      of({ stream: userProfilepageResult.stream } as UserProfilePageResult)
    )

    component.search()
    expect(component.filteredData$.getValue()?.length).toEqual(2)

    component.onFilterChange('Admin')
    expect(component.filteredData$.getValue()?.length).toEqual(2)

    component.onFilterChange('admin')
    expect(component.filteredData$.getValue()?.length).toEqual(2)

    component.onFilterChange('Max')
    expect(component.filteredData$.getValue()?.length).toEqual(1)

    component.onFilterChange('Does_not_exist')
    expect(component.filteredData$.getValue()?.length).toEqual(0)
  })

  it('should search user profiles - errorResponse 404', () => {
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

    apiServiceSpy.searchUserProfile.and.returnValue(throwError(() => updateErrorResponse))

    component.searchError = false
    component.search()

    expect(apiServiceSpy.searchUserProfile).toHaveBeenCalled()
    expect(component.searchError).toBeTruthy()
  })
})
