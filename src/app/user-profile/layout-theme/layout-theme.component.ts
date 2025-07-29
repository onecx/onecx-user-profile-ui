import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'
import { SelectItem } from 'primeng/api'
import { finalize, Observable, map, of } from 'rxjs'

import { UserService } from '@onecx/angular-integration-interface'

import { ColorScheme, MenuMode } from 'src/app/shared/generated'

@Component({
  selector: 'app-layout-theme',
  templateUrl: './layout-theme.component.html'
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
    this.prepareDropDownOptions()
    if (this.userService.hasPermission('ACCOUNT_SETTINGS_LAYOUT_MENU#EDIT')) {
      this.formGroup.get('menuMode')?.enable()
    }
    if (this.userService.hasPermission('ACCOUNT_SETTINGS_COLOR_SCHEME#EDIT')) {
      this.formGroup.get('colorScheme')?.enable() // UI is not ready to offer it
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
        'LAYOUT_THEME.MENU_MODES.' + MenuMode.Overlay,
        'LAYOUT_THEME.MENU_MODES.' + MenuMode.Slim
        //'LAYOUT_THEME.MENU_MODES.' + MenuMode.Slimplus
      ])
      .pipe(
        map((data) => {
          return [
            { label: data['LAYOUT_THEME.MENU_MODES.' + MenuMode.Horizontal], value: MenuMode.Horizontal },
            { label: data['LAYOUT_THEME.MENU_MODES.' + MenuMode.Static], value: MenuMode.Static },
            { label: data['LAYOUT_THEME.MENU_MODES.' + MenuMode.Overlay], value: MenuMode.Overlay, disabled: true },
            { label: data['LAYOUT_THEME.MENU_MODES.' + MenuMode.Slim], value: MenuMode.Slim, disabled: true }
            //{ label: data['LAYOUT_THEME.MENU_MODES.' + MenuMode.Slimplus], value: MenuMode.Slimplus }
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
