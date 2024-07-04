import { bootstrapRemoteComponent } from '@onecx/angular-webcomponents'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { importProvidersFrom } from '@angular/core'
import { AngularAuthModule } from '@onecx/angular-auth'
import { environment } from 'src/environments/environment'
import { OneCXAvatarImageComponent } from './avatar-image.component'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

bootstrapRemoteComponent(OneCXAvatarImageComponent, 'ocx-avatar-image-component', environment.production, [
  provideHttpClient(withInterceptorsFromDi()),
  importProvidersFrom(AngularAuthModule),
  importProvidersFrom(BrowserModule),
  importProvidersFrom(BrowserAnimationsModule)
])
