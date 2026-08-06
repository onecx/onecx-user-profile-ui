import { Injector } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'

import { provideAppStateServiceMock } from '@onecx/angular-integration-interface/mocks'
import { PortalApiConfiguration } from '@onecx/angular-utils'

import { apiConfigProvider } from './apiConfigProvider.utils'

describe('apiConfigProvider', () => {
  let injector: Injector

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideAppStateServiceMock()]
    }).compileComponents()

    injector = TestBed.inject(Injector)
  })

  it('should return a PortalApiConfiguration instance', () => {
    const result = apiConfigProvider(injector)
    expect(result).toBeInstanceOf(PortalApiConfiguration)
  })
})
