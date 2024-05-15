export interface SearchConfig {
  id?: string
  page: string
  name?: string
  modificationCount?: number
  /**
   * Version increment of the fields in the UI which you should use when you are making incompatible changes to those fields.
   */
  fieldListVersion?: number
  /**
   * Defines whether this config can be changed in the UI
   */
  isReadonly?: boolean
  /**
   * Indicates whether the advanced mode should be displayed
   */
  isAdvanced: boolean
  columns?: Array<string>
  values: { [key: string]: string }
}
