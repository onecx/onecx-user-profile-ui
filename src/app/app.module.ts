import { NgModule } from '@angular/core'
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { provideAnimations } from '@angular/platform-browser/animations'
import { RouterModule, Routes } from '@angular/router'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'

import { AngularAcceleratorModule } from '@onecx/angular-accelerator'
import { StandaloneShellModule, provideStandaloneProviders } from '@onecx/angular-standalone-shell'
import { AngularAuthModule } from '@onecx/angular-auth'
import {
  createTranslateLoader,
  providePermissionService,
  provideThemeConfig,
  provideTranslationPathFromMeta
} from '@onecx/angular-utils'
import { APP_CONFIG } from '@onecx/angular-integration-interface'

import { environment } from 'src/environments/environment'
import { AppComponent } from './app.component'

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./user-profile/user-profile.module').then((m) => m.UserProfileModule)
  }
]
@NgModule({
  imports: [
    AppComponent,
    AngularAcceleratorModule,
    AngularAuthModule,
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabledBlocking',
      enableTracing: false
    }),
    StandaloneShellModule,
    TranslateModule.forRoot({
      isolate: true,
      loader: { provide: TranslateLoader, useFactory: createTranslateLoader, deps: [HttpClient] }
    })
  ],
  providers: [
    { provide: APP_CONFIG, useValue: environment },
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    providePermissionService(),
    provideStandaloneProviders(),
    provideThemeConfig(),
    provideTranslationPathFromMeta(import.meta.url, 'assets/i18n/')
  ]
})
export class AppModule {}
