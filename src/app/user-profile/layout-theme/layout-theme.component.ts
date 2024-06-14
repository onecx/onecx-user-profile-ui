import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core'
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms'
import { SelectItem } from 'primeng/api'

import { UserService } from '@onecx/portal-integration-angular'
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
  public formGroup: UntypedFormGroup
  public menuModeSelectItems: SelectItem[]
  public colorSchemeSelectItems: SelectItem[]

  constructor(private userService: UserService) {
    this.menuModeSelectItems = [
      { label: 'LAYOUT_THEME.MENU_MODES.HORIZONTAL', value: MenuMode.Horizontal },
      { label: 'LAYOUT_THEME.MENU_MODES.STATIC', value: MenuMode.Static },
      { label: 'LAYOUT_THEME.MENU_MODES.OVERLAY', value: MenuMode.Overlay, disabled: true },
      { label: 'LAYOUT_THEME.MENU_MODES.SLIM', value: MenuMode.Slim, disabled: true }
      //{ label: 'LAYOUT_THEME.MENU_MODES.SLIMPLUS', value: MenuMode.SLIMPLUS },
    ]
    this.colorSchemeSelectItems = [
      { label: 'LAYOUT_THEME.COLOR_SCHEMES.AUTO', value: ColorScheme.Auto, disabled: true },
      { label: 'LAYOUT_THEME.COLOR_SCHEMES.LIGHT', value: ColorScheme.Light, disabled: true },
      { label: 'LAYOUT_THEME.COLOR_SCHEMES.DARK', value: ColorScheme.Dark, disabled: true }
    ]
    this.formGroup = new UntypedFormGroup({
      menuMode: new UntypedFormControl(),
      colorScheme: new UntypedFormControl(),
      breadcrumbs: new UntypedFormControl()
    })
  }

  public ngOnInit(): void {
    if (!this.userService.hasPermission('ACCOUNT_SETTINGS_LAYOUT_MENU#EDIT')) {
      this.formGroup.get('menuMode')?.disable()
    }
    if (!this.userService.hasPermission('ACCOUNT_SETTINGS_COLOR_SCHEME#EDIT')) {
      this.formGroup.get('colorScheme')?.disable() // UI is not ready to offer it
    }
    this.formGroup.get('breadcrumbs')?.disable()
  }

  public ngOnChanges(): void {
    if (this.colorScheme) {
      this.formGroup.patchValue({ colorScheme: this.colorScheme })
    }
    if (this.menuMode) {
      this.formGroup.patchValue({ menuMode: this.menuMode })
    }
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
}
