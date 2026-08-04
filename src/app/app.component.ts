import { Component } from '@angular/core'
import { StandaloneShellModule } from '@onecx/angular-standalone-shell'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [StandaloneShellModule]
})
export class AppComponent {
  title = 'onecx-ui'
}
