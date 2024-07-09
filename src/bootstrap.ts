import { bootstrapModule } from '@onecx/angular-webcomponents'
import { environment } from 'src/environments/environment'
import { OneCXUserProfileModule } from './app/onecx-user-profile-remote.module'

bootstrapModule(OneCXUserProfileModule, 'microfrontend', environment.production)
