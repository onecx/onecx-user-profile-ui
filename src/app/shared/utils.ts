import { AbstractControl, FormArray, FormGroup } from '@angular/forms'
import { Location } from '@angular/common'
import { SelectItem } from 'primeng/api'
import { RefType } from './generated'

// This object encapsulates functions because ...
//  ...Jasmine has problems to spying direct imported functions
export const Utils = {
  mapping_error_status(status: number): number {
    return [400, 401, 403, 404, 500].includes(status) ? status : 0
  },

  limitText(text: string, limit: number): string {
    if (text) {
      return text.length < limit ? text : text.substring(0, limit) + '...'
    } else {
      return ''
    }
  },

  copyToClipboard(text?: string): void {
    if (text) navigator.clipboard.writeText(text)
  },

  /**
   *  FORM
   */
  forceFormValidation(form: AbstractControl): void {
    if (form instanceof FormGroup || form instanceof FormArray) {
      for (const inner in form.controls) {
        const control = form.get(inner)
        control && this.forceFormValidation(control)
      }
    } else {
      form.markAsDirty()
      form.markAsTouched()
      form.updateValueAndValidity()
    }
  },

  dropDownGetLabelByValue(ddArray: SelectItem[], val: string): string | undefined {
    const a: any = ddArray.find((item: SelectItem) => {
      return item?.value == val
    })
    return a.label
  },
  sortByLocale(a: any, b: any): number {
    return a.toUpperCase().localeCompare(b.toUpperCase())
  },
  sortByLabel(a: any, b: any): number {
    return (a.label ? a.label.toUpperCase() : '').localeCompare(b.label ? b.label.toUpperCase() : '')
  },

  /***************** Time functions for calendar */
  getLocale(): string {
    const locale: string = navigator.language
    const regex = /^(en|en-.+|de|de-.+)$/
    return regex.exec(locale?.toLowerCase()) ? locale : 'en-US'
  },

  getDateFormat(type: string): string {
    const formatObject = new Intl.DateTimeFormat(this.getLocale()).formatToParts(new Date())

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
  },

  // basePath => path to bff
  bffImageUrl(basePath: string | undefined, name: string, refType: RefType): string {
    return Location.joinWithSlash(basePath ?? '', 'userProfile/me/') + name + '?refType=' + refType
  }
}
