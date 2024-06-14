import { AbstractControl, FormArray, FormGroup } from '@angular/forms'
import { SelectItem } from 'primeng/api'
import { RefType } from './generated'

export function limitText(text: string, limit: number): string {
  if (text) {
    return text.length < limit ? text : text.substring(0, limit) + '...'
  } else {
    return ''
  }
}

export function copyToClipboard(text?: string): void {
  if (text) navigator.clipboard.writeText(text)
}

/**
 *  FORM
 */
export function forceFormValidation(form: AbstractControl): void {
  if (form instanceof FormGroup || form instanceof FormArray) {
    for (const inner in form.controls) {
      const control = form.get(inner)
      control && forceFormValidation(control)
    }
  } else {
    form.markAsDirty()
    form.markAsTouched()
    form.updateValueAndValidity()
  }
}

/**
 *  DROPDOWN
 */
export type DropDownChangeEvent = MouseEvent & { value: any }

export function dropDownSortItemsByLabel(a: SelectItem, b: SelectItem): number {
  return (a.label ? (a.label as string).toUpperCase() : '').localeCompare(
    b.label ? (b.label as string).toUpperCase() : ''
  )
}
export function dropDownGetLabelByValue(ddArray: SelectItem[], val: string): string | undefined {
  const a: any = ddArray.find((item: SelectItem) => {
    return item?.value == val
  })
  return a.label
}
export function sortByLocale(a: any, b: any): number {
  return a.toUpperCase().localeCompare(b.toUpperCase())
}

/***************** Time functions for calendar */
export function getLocale(): string {
  const locale: string = navigator.language
  return locale && locale.toLocaleLowerCase().match(/^(en|en-.+|de|de-.+)$/) ? locale : 'en-US'
}

export function getDateFormat(type: string): string {
  const formatObject = new Intl.DateTimeFormat(getLocale()).formatToParts(new Date())

  return formatObject
    .map((object) => {
      switch (object.type) {
        case 'day':
          return 'dd'
        case 'month':
          return 'mm'
        case 'year':
          return type && type === 'dateformat' ? 'yy' : 'yyyy'
        default:
          return object.value
      }
    })
    .join('')
}

export function getTooltipContent(value: string, maxlength?: number) {
  if (value) {
    const tooltipContent = value.toString()
    const truncatedLength = maxlength ?? 30
    return tooltipContent.length > truncatedLength ? tooltipContent : null
  }
  return null
}

export function bffImageUrl(basePath: string | undefined, name: string | undefined, refType: RefType): string {
  return !name ? '' : basePath + '/userProfile/me/' + name + '?refType=' + refType
}
