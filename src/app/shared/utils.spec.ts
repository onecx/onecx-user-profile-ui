import { FormGroup, FormControl } from '@angular/forms'
import { SelectItem } from 'primeng/api'

import {
  limitText,
  copyToClipboard,
  forceFormValidation,
  dropDownSortItemsByLabel,
  dropDownGetLabelByValue,
  sortByLocale,
  getTooltipContent,
  getLocale,
  getDateFormat
} from './utils'

describe('util functions', () => {
  describe('limitText', () => {
    it('should truncate text that exceeds the specified limit', () => {
      const result = limitText('hello', 4)

      expect(result).toEqual('hell...')
    })

    it('should return the original text if it does not exceed the limit', () => {
      const result = limitText('hello', 6)

      expect(result).toEqual('hello')
    })

    it('should return an empty string for undefined input', () => {
      const str: any = undefined
      const result = limitText(str, 5)

      expect(result).toEqual('')
    })
  })

  describe('copyToClipboard', () => {
    let writeTextSpy: jasmine.Spy

    beforeEach(() => {
      writeTextSpy = spyOn(navigator.clipboard, 'writeText')
    })

    it('should copy text to clipboard', () => {
      copyToClipboard('text')

      expect(writeTextSpy).toHaveBeenCalledWith('text')
    })
  })

  describe('forceFormValidation', () => {
    it('should mark controls as dirty and touched', () => {
      const group = new FormGroup({
        control1: new FormControl(''),
        control2: new FormControl('')
      })

      forceFormValidation(group)

      expect(group.dirty).toBeTrue()
      expect(group.touched).toBeTrue()
    })
  })

  describe('dropDownSortItemsByLabel', () => {
    it('should correctly sort items by label', () => {
      const items: SelectItem[] = [
        { label: 'label2', value: 2 },
        { label: 'label1', value: 1 }
      ]

      const sortedItems = items.sort(dropDownSortItemsByLabel)

      expect(sortedItems[0].label).toEqual('label1')
    })
    it("should treat falsy values for SelectItem.label as ''", () => {
      const items: SelectItem[] = [
        { label: undefined, value: 1 },
        { label: undefined, value: 2 },
        { label: 'label1', value: 2 }
      ]

      const sortedItems = items.sort(dropDownSortItemsByLabel)

      expect(sortedItems[0].label).toEqual(undefined)
    })
  })

  describe('dropDownGetLabelByValue', () => {
    it('should return the label corresponding to the value', () => {
      const items: SelectItem[] = [
        { label: 'label2', value: 2 },
        { label: 'label1', value: 1 }
      ]

      const result = dropDownGetLabelByValue(items, '1')

      expect(result).toEqual('label1')
    })
  })

  describe('sortByLocale', () => {
    it('should sort strings based on locale', () => {
      const strings: string[] = ['str2', 'str1']

      const sortedStrings = strings.sort(sortByLocale)

      expect(sortedStrings[0]).toEqual('str1')
    })
  })

  describe('getTooltipContent', () => {
    it('should return null if value is empty', () => {
      const result = getTooltipContent('')
      expect(result).toBeNull()
    })

    it('should truncate long tooltip content', () => {
      const longContent = 'This is a very long tooltip content that needs truncation. Please return this tooltip'
      const result = getTooltipContent(longContent, 20)
      expect(result).toEqual(null)
    })

    it('should not truncate short tooltip content', () => {
      const shortContent = 'Short content'
      const result = getTooltipContent(shortContent, 20)
      expect(result).toEqual(shortContent)
    })
  })

  describe('getLocale', () => {
    it('should return the default locale if navigator language is empty', () => {
      spyOnProperty(window.navigator, 'language').and.returnValue('en-US')
      const result = getLocale()
      expect(result).toEqual('en-US')
    })

    it('should return the lowercase navigator language if valid', () => {
      spyOnProperty(window.navigator, 'language').and.returnValue('de-de')
      const result = getLocale()
      expect(result).toEqual('de-de')
    })

    it('should return the default locale if navigator language is invalid', () => {
      spyOnProperty(window.navigator, 'language').and.returnValue('en-US')
      const result = getLocale()
      expect(result).toEqual('en-US')
    })
  })

  describe('getDateFormat', () => {
    it('should return "mm/dd/yy" for dateformat type', () => {
      const result = getDateFormat('dateformat')
      expect(result).toBe('mm/dd/yy')
    })

    it('should return "mm/dd/yyyy" for other types', () => {
      const result = getDateFormat('other')
      expect(result).toBe('mm/dd/yyyy')
    })
  })
})
