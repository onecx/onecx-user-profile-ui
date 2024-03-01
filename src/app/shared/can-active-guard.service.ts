import { Injectable } from '@angular/core'
import { CanActivate, ActivatedRouteSnapshot, UrlTree } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { ConfigurationService } from '@onecx/portal-integration-angular'
import { filter, map, Observable, OperatorFunction, switchMap } from 'rxjs'

const SUPPORTED_LANGUAGES = ['de', 'en']
const DEFAULT_LANG = 'en'

@Injectable()
export class CanActivateGuard implements CanActivate {
  constructor(private txService: TranslateService, private config: ConfigurationService) {}

  canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log(`user profile GUARD ${route.routeConfig?.path}`)
    return this.loadTranslations()
  }

  loadTranslations() {
    // console.log(`Load translations in guard service`)
    // this language will be used as a fallback when a translation isn't found in the current language
    this.txService.setDefaultLang(DEFAULT_LANG)

    return this.config.lang$.pipe(
      filter((x) => x !== undefined) as OperatorFunction<string | undefined, string>,
      map((lang) => lang.toLowerCase()),
      switchMap((lang) => this.txService.use(this.getBestMatchLanguage(lang))),
      map(() => true)
      //tap(() => console.log(`Guard done`))
    )
  }

  getBestMatchLanguage(lang: string) {
    //console.log(`Set language: ${lang}`)
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      return lang
    } else {
      console.warn(
        `⚠ requested language: ${lang} is not among supported languages: ${SUPPORTED_LANGUAGES}, using ${DEFAULT_LANG} as fallback`
      )
      return DEFAULT_LANG
    }
  }
}
