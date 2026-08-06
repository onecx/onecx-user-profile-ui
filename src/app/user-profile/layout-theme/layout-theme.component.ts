import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core'
import { AsyncPipe } from '@angular/common'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { map, Observable, of } from 'rxjs'

import { SelectItem } from 'primeng/api'

import { ButtonModule } from 'primeng/button'
import { MessageModule } from 'primeng/message'
import { RippleModule } from 'primeng/ripple'
import { SelectButtonModule } from 'primeng/selectbutton'
import { TooltipModule } from 'primeng/tooltip'

import { UserService } from '@onecx/angular-integration-interface'
import { AngularAcceleratorModule } from '@onecx/angular-accelerator'

import { ColorScheme, MenuMode } from 'src/app/shared/generated'

@Component({
  selector: 'app-layout-theme',
  templateUrl: './layout-theme.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    AngularAcceleratorModule,
    ButtonModule,
    SelectButtonModule,
    MessageModule,
    ReactiveFormsModule,
    RippleModule,
    TooltipModule,
    TranslateModule
  ]
})
export class LayoutThemeComponent implements OnInit, OnChanges {
  @Input() colorScheme: ColorScheme | undefined
  @Input() menuMode: MenuMode | undefined
  @Output() colorSchemeChange = new EventEmitter<ColorScheme>()
  @Output() menuModeChange = new EventEmitter<MenuMode>()
  @Output() breadcrumbsChange = new EventEmitter<boolean>()
  @Output() public applyChanges = new EventEmitter<boolean>()

  public changedMenuMode = false
  public changedColorScheme = false
  public changedBreadcrumbs = false
  public formGroup: FormGroup

  public menuModeOptions$: Observable<SelectItem[]> = of([])
  public colorSchemeOptions$: Observable<SelectItem[]> = of([])

  constructor(
    private readonly userService: UserService,
    private readonly translate: TranslateService
  ) {
    this.formGroup = new FormGroup({
      menuMode: new FormControl({ value: null, disabled: true }),
      colorScheme: new FormControl({ value: null, disabled: true }),
      breadcrumbs: new FormControl({ value: true, disabled: true })
    })
  }

  public ngOnInit(): void {
    void this.initializeFormPermissions()
  }

  private async initializeFormPermissions(): Promise<void> {
    this.prepareDropDownOptions()
    if (await this.userService.hasPermission('ACCOUNT_SETTINGS_LAYOUT_MENU#EDIT')) {
      this.formGroup.get('menuMode')?.enable()
    }
    if (await this.userService.hasPermission('ACCOUNT_SETTINGS_COLOR_SCHEME#EDIT')) {
      this.formGroup.get('colorScheme')?.enable()
    }
  }

  public ngOnChanges(): void {
    if (this.colorScheme) {
      this.formGroup.patchValue({ colorScheme: this.colorScheme })
    }
    if (this.menuMode) {
      this.formGroup.patchValue({ menuMode: this.menuMode })
    }
    this.formGroup.patchValue({ breadcrumbs: true })
    this.formGroup.get('breadcrumbs')?.disable() // UI is not ready to offer it
    this.formGroup.get('colorScheme')?.disable()
  }

  public saveMenuMode(): void {
    this.changedMenuMode = true
    this.menuModeChange.emit(this.formGroup.get('menuMode')?.value)
  }
  public saveColorScheme(): void {
    this.changedColorScheme = true
    this.colorSchemeChange.emit(this.formGroup.get('colorScheme')?.value)
  }
  public saveBreadcrumbs(): void {
    this.changedBreadcrumbs = true
    this.breadcrumbsChange.emit(this.formGroup.get('breadcrumbs')?.value)
  }

  public applyChange() {
    this.applyChanges.emit(true)
  }

  private prepareDropDownOptions() {
    this.menuModeOptions$ = this.translate
      .get([
        'LAYOUT_THEME.MENU_MODES.' + MenuMode.Horizontal,
        'LAYOUT_THEME.MENU_MODES.' + MenuMode.Static,
        //'LAYOUT_THEME.MENU_MODES.' + MenuMode.Overlay,
        'LAYOUT_THEME.MENU_MODES.' + MenuMode.Slim,
        'LAYOUT_THEME.MENU_MODES.' + MenuMode.Slimplus
      ])
      .pipe(
        map((data) => {
          return [
            { label: data['LAYOUT_THEME.MENU_MODES.' + MenuMode.Horizontal], value: MenuMode.Horizontal },
            { label: data['LAYOUT_THEME.MENU_MODES.' + MenuMode.Static], value: MenuMode.Static },
            //{ label: data['LAYOUT_THEME.MENU_MODES.' + MenuMode.Overlay], value: MenuMode.Overlay, disabled: true },
            { label: data['LAYOUT_THEME.MENU_MODES.' + MenuMode.Slim], value: MenuMode.Slim },
            { label: data['LAYOUT_THEME.MENU_MODES.' + MenuMode.Slimplus], value: MenuMode.Slimplus }
          ]
        })
      )
    this.colorSchemeOptions$ = this.translate
      .get([
        'LAYOUT_THEME.COLOR_SCHEMES.' + ColorScheme.Auto,
        'LAYOUT_THEME.COLOR_SCHEMES.' + ColorScheme.Light,
        'LAYOUT_THEME.COLOR_SCHEMES.' + ColorScheme.Dark
      ])
      .pipe(
        map((data) => {
          return [
            {
              label: data['LAYOUT_THEME.COLOR_SCHEMES.' + ColorScheme.Auto],
              value: ColorScheme.Auto
            },
            {
              label: data['LAYOUT_THEME.COLOR_SCHEMES.' + ColorScheme.Light],
              value: ColorScheme.Light
            },
            {
              label: data['LAYOUT_THEME.COLOR_SCHEMES.' + ColorScheme.Dark],
              value: ColorScheme.Dark
            }
          ]
        })
      )
  }
}
