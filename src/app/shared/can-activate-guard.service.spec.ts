import { BehaviorSubject, Observable, of } from 'rxjs'
import { CanActivateGuard } from './can-active-guard.service'

let canActivateGuard: CanActivateGuard

describe('CanActivateGuard', () => {
  const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['setDefaultLang', 'use'])

  const configSpy = jasmine.createSpyObj('ConfigurationService', [], { lang$: new BehaviorSubject(undefined) })

  const activatedRouteSpy = jasmine.createSpyObj('ActivatedRouteSnapshot', [], {
    routeConfig: {
      path: 'path'
    }
  })

  beforeEach(async () => {
    canActivateGuard = new CanActivateGuard(translateServiceSpy, configSpy)
    translateServiceSpy.setDefaultLang.calls.reset()
    translateServiceSpy.use.calls.reset()
  })

  it('should return default lang if provided is not supported', () => {
    const result = canActivateGuard.getBestMatchLanguage('pl')
    expect(result).toBe('en')
  })

  it('should use default language if current not supported and return true', (doneFn: DoneFn) => {
    const langSpy = Object.getOwnPropertyDescriptor(configSpy, 'lang$')?.get as jasmine.Spy<
      () => BehaviorSubject<string>
    >
    langSpy.and.returnValue(new BehaviorSubject('pl'))
    spyOn(console, 'log')
    translateServiceSpy.use.and.returnValue(of({}))

    const resultObs = canActivateGuard.canActivate(activatedRouteSpy) as Observable<boolean>
    resultObs.subscribe({
      next: (result) => {
        expect(result).toBe(true)
        doneFn()
      },
      error: () => {
        doneFn.fail
      }
    })

    expect(translateServiceSpy.setDefaultLang).toHaveBeenCalledOnceWith('en')
    expect(console.log).toHaveBeenCalledOnceWith('user profile GUARD path')
    expect(translateServiceSpy.use).toHaveBeenCalledOnceWith('en')
  })

  it('should use provided language if current supported and return true', (doneFn: DoneFn) => {
    const langSpy = Object.getOwnPropertyDescriptor(configSpy, 'lang$')?.get as jasmine.Spy<
      () => BehaviorSubject<string>
    >
    langSpy.and.returnValue(new BehaviorSubject('de'))
    spyOn(console, 'log')
    translateServiceSpy.use.and.returnValue(of({}))

    const resultObs = canActivateGuard.canActivate(activatedRouteSpy) as Observable<boolean>
    resultObs.subscribe({
      next: (result) => {
        expect(result).toBe(true)
        doneFn()
      },
      error: () => {
        doneFn.fail
      }
    })

    expect(translateServiceSpy.setDefaultLang).toHaveBeenCalledOnceWith('en')
    expect(console.log).toHaveBeenCalledOnceWith('user profile GUARD path')
    expect(translateServiceSpy.use).toHaveBeenCalledOnceWith('de')
  })
})
