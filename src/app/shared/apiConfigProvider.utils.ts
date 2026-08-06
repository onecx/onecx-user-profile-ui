import { Injector, runInInjectionContext } from '@angular/core'

import { PortalApiConfiguration } from '@onecx/angular-utils'

import { environment } from 'src/environments/environment'
import { Configuration } from './generated'

export function apiConfigProvider(injector: Injector) {
  return runInInjectionContext(injector, () => new PortalApiConfiguration(Configuration, environment.apiPrefix))
}
