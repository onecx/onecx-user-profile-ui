import { NO_ERRORS_SCHEMA } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'

import { MfeInfo } from '@onecx/portal-integration-angular'

import { environment } from 'src/environments/environment'

describe('SharedModule', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
  })

  // TODO: correct this and do the right thing
  it('should return the correct basePath with mfeInfo', () => {
    const mfeInfo: MfeInfo = {
      appId: 'onecx-user-profile-ui',
      productName: 'onecx-user-profile',
      mountPath: '',
      remoteBaseUrl: 'http://localhost:4200/',
      baseHref: '',
      shellName: ''
    }
    const result = mfeInfo.remoteBaseUrl + '' + environment.apiPrefix
    expect(result).toEqual('http://localhost:4200/bff')
  })
})
