import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'

@Component({
  selector: 'app-root',
  templateUrl: './app-entrypoint.component.html',
  standalone: true,
  imports: [RouterOutlet]
})
export class AppEntrypointComponent {}
