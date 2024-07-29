import { CommonModule } from '@angular/common'
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { APP_INITIALIZER, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule, Routes } from '@angular/router'
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'

import { KeycloakAuthModule } from '@onecx/keycloak-auth'
import {
  APP_CONFIG,
  AppStateService,
  PortalCoreModule,
  UserService,
  createTranslateLoader,
  translateServiceInitializer
} from '@onecx/portal-integration-angular'

import { environment } from 'src/environments/environment'
import { AppComponent } from './app.component'

import { SharedModule } from 'src/app/shared/shared.module'

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./user-profile/user-profile.module').then((m) => m.UserProfileModule)
  }
]
@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    KeycloakAuthModule,
    BrowserAnimationsModule,
    SharedModule,
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabledBlocking',
      enableTracing: true
    }),
    PortalCoreModule.forRoot('onecx-user-profile-ui'),
    TranslateModule.forRoot({
      isolate: true,
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient, AppStateService]
      }
    })
  ],
  providers: [
    { provide: APP_CONFIG, useValue: environment },
    {
      provide: APP_INITIALIZER,
      useFactory: translateServiceInitializer,
      multi: true,
      deps: [UserService, TranslateService]
    },
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class AppModule {
  constructor() {
    console.info('App Module constructor')
  }
}
