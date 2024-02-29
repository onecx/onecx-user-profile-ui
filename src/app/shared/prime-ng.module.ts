import { NgModule } from '@angular/core'
import { DropdownModule } from 'primeng/dropdown'
import { InputTextModule } from 'primeng/inputtext'
import { InputSwitchModule } from 'primeng/inputswitch'
import { PanelModule } from 'primeng/panel'
import { TableModule } from 'primeng/table'
import { TabViewModule } from 'primeng/tabview'
import { RippleModule } from 'primeng/ripple'
import { SelectButtonModule } from 'primeng/selectbutton'

@NgModule({
  declarations: [],
  imports: [],
  exports: [
    DropdownModule,
    InputTextModule,
    InputSwitchModule,
    PanelModule,
    TableModule,
    TabViewModule,
    RippleModule,
    SelectButtonModule
  ]
})
export class PrimeNgModule {}
