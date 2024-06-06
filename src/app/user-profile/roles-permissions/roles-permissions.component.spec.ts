// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

// import { RolesPermissionsComponent } from './roles-permissions.component'
// import { HttpClientTestingModule } from '@angular/common/http/testing'
// import { HttpClient } from '@angular/common/http'
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
// import { HttpLoaderFactory } from '../../shared/shared.module'

// import { AUTH_SERVICE, PhoneType, PortalMessageService, UserProfile } from '@onecx/portal-integration-angular'
// import { NO_ERRORS_SCHEMA } from '@angular/core'
// // import { UserProfileService } from '../user-profile.service'
// import { TableModule } from 'primeng/table'
// import { Router } from '@angular/router'
// import { of, throwError } from 'rxjs'
// import { environment } from 'src/environments/environment'

// describe('RolesPermissionsComponent', () => {
//   let component: RolesPermissionsComponent
//   let fixture: ComponentFixture<RolesPermissionsComponent>

//   const authServiceSpy = jasmine.createSpyObj('AUTH_SERVICE', ['getCurrentUser', 'getUserRoles'])

//   const defaultCurrentUser: UserProfile = {
//     userId: '15',
//     person: {
//       firstName: 'John',
//       lastName: 'Doe',
//       displayName: 'John Doe Display Name',
//       email: 'john.doe@example.com',
//       address: {
//         street: 'Candy Lane',
//         streetNo: '12',
//         city: 'Candy Town',
//         postalCode: '80-243',
//         country: 'EN'
//       },
//       phone: {
//         type: PhoneType.MOBILE,
//         number: '123456789'
//       }
//     },
//     memberships: [
//       {
//         application: 'app',
//         roleMemberships: [
//           {
//             role: 'firstRole',
//             permissions: [
//               {
//                 resource: 'resource1',
//                 action: 'action1',
//                 key: 'resource1#action1',
//                 name: 'testPermission'
//               },
//               {
//                 resource: 'resource2',
//                 action: 'action2',
//                 key: 'resource2#action2',
//                 name: 'secondTestPermission'
//               }
//             ]
//           },
//           {
//             role: 'secondRole',
//             permissions: [
//               {
//                 resource: 'resource3',
//                 action: 'action3',
//                 key: 'resource3#action3',
//                 name: 'thirdTestPermission'
//               }
//             ]
//           }
//         ]
//       },
//       {
//         application: 'app2',
//         roleMemberships: [
//           {
//             role: 'thirdRole',
//             permissions: [
//               {
//                 resource: 'resource4',
//                 action: 'action4',
//                 key: 'resource4#action4',
//                 name: 'fourthTestPermission'
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   }

//   const defaultUserRoles: string[] = ['secondRole', 'firstRole']

//   const userProfileServiceSpy = jasmine.createSpyObj<UserProfileService>('UserProfileService', ['getCurrentUserFromBE'])

//   const messageServiceMock: jasmine.SpyObj<PortalMessageService> = jasmine.createSpyObj<PortalMessageService>(
//     'PortalMessageService',
//     ['info', 'error']
//   )

//   const routerMock = jasmine.createSpyObj<Router>('Router', ['navigateByUrl'])

//   beforeEach(waitForAsync(() => {
//     TestBed.configureTestingModule({
//       declarations: [RolesPermissionsComponent],
//       imports: [
//         HttpClientTestingModule,
//         TableModule,
//         TranslateModule.forRoot({
//           loader: {
//             provide: TranslateLoader,
//             useFactory: HttpLoaderFactory,
//             deps: [HttpClient]
//           }
//         })
//       ],
//       schemas: [NO_ERRORS_SCHEMA],
//       providers: [
//         { provide: AUTH_SERVICE, useValue: authServiceSpy },
//         { provide: UserProfileService, useValue: userProfileServiceSpy },
//         { provide: PortalMessageService, useValue: messageServiceMock },
//         { provide: Router, useValue: routerMock }
//       ]
//     }).compileComponents()
//     authServiceSpy.getCurrentUser.and.returnValue(defaultCurrentUser)
//     authServiceSpy.getUserRoles.and.returnValue(defaultUserRoles)
//     messageServiceMock.info.calls.reset()
//     messageServiceMock.error.calls.reset()
//     routerMock.navigateByUrl.calls.reset()
//   }))

//   beforeEach(() => {
//     fixture = TestBed.createComponent(RolesPermissionsComponent)
//     component = fixture.componentInstance
//     fixture.detectChanges()
//     component.environment = environment
//   })

//   it('should create with correct data', () => {
//     expect(component).toBeTruthy()
//     // variables correctly assigned
//     expect(component.personalInfo).toEqual(defaultCurrentUser.person)
//     expect(component.memberships).toEqual(defaultCurrentUser.memberships!)
//     // roles sorted
//     expect(component.roles[0]).toEqual('firstRole')
//     expect(component.roles[1]).toEqual('secondRole')
//     // permissions created and sorted
//     expect(component.permissionItems.length).toBe(4)
//     expect(component.permissionItems[0]).toEqual({
//       name: 'fourthTestPermission',
//       key: 'resource4#action4',
//       resource: 'resource4',
//       action: 'action4',
//       role: 'thirdRole',
//       application: 'app2'
//     })
//     expect(component.permissionItems[1]).toEqual({
//       name: 'secondTestPermission',
//       key: 'resource2#action2',
//       resource: 'resource2',
//       action: 'action2',
//       role: 'firstRole',
//       application: 'app'
//     })
//     expect(component.permissionItems[2]).toEqual({
//       name: 'testPermission',
//       key: 'resource1#action1',
//       resource: 'resource1',
//       action: 'action1',
//       role: 'firstRole',
//       application: 'app'
//     })
//     expect(component.permissionItems[3]).toEqual({
//       name: 'thirdTestPermission',
//       key: 'resource3#action3',
//       resource: 'resource3',
//       action: 'action3',
//       role: 'secondRole',
//       application: 'app'
//     })
//   })

//   it('should filter table on applyGlobalFilter', () => {
//     expect(component.permissionTableFilter).toBeDefined()
//     component.permissionTableFilter!.nativeElement.value = 't'
//     const event: Event = new Event('')
//     spyOnProperty(event, 'target').and.returnValue(component.permissionTableFilter?.nativeElement)
//     expect(component.permissionTable).toBeDefined()
//     spyOn(component.permissionTable!, 'filterGlobal').and.callThrough()
//     expect(component.permissionTable?.hasFilter()).toBe(false)

//     component.applyGlobalFilter(event, component.permissionTable!)
//     fixture.detectChanges()

//     expect(component.permissionTable?.hasFilter()).toEqual(true)
//     expect(component.permissionTable?.filterGlobal).toHaveBeenCalledOnceWith('t', 'contains')
//   })

//   it('should navigate to root on close', () => {
//     component.close()

//     expect(routerMock.navigateByUrl).toHaveBeenCalledOnceWith('/')
//   })

//   it('should display error in console on refresh if not in production enviornment', () => {
//     spyOn(console, 'error')
//     component.refresh()

//     expect(console.error).toHaveBeenCalledOnceWith('Cannot refresh in non production mode')
//   })

//   it('should load profile on refresh if in production environment if user was fetched', () => {
//     component.environment = {
//       production: true,
//       BASE_PATH: '/portal-api'
//     }
//     fixture.detectChanges()
//     userProfileServiceSpy.getCurrentUserFromBE.and.returnValue(
//       of({
//         userId: '',
//         person: {}
//       })
//     )
//     spyOn(component, 'loadProfileData')

//     authServiceSpy.getCurrentUser.and.returnValue(defaultCurrentUser)
//     authServiceSpy.getUserRoles.and.returnValue(defaultUserRoles)

//     component.refresh()

//     expect(component.loadProfileData).toHaveBeenCalledTimes(1)
//     expect(messageServiceMock.info).toHaveBeenCalledOnceWith({
//       summaryKey: 'ROLE_PERMISSIONS.MSG.PERMISSIONS_REFRESH_INFO'
//     })
//   })

//   it('should display error on refresh if in production environment if user was not fetched', () => {
//     component.environment = {
//       production: true,
//       BASE_PATH: '/portal-api'
//     }
//     const error = new Error()
//     userProfileServiceSpy.getCurrentUserFromBE.and.returnValue(throwError(() => error))
//     spyOn(console, 'error')

//     component.refresh()

//     expect(messageServiceMock.error).toHaveBeenCalledOnceWith({
//       summaryKey: 'ROLE_PERMISSIONS.MSG.PERMISSIONS_REFRESH_ERROR'
//     })
//     expect(console.error).toHaveBeenCalledOnceWith(error)
//   })

//   it('should reset filter and table data on onClearFilterPermissionTable', () => {
//     expect(component.permissionTableFilter).toBeDefined()
//     component.permissionTableFilter!.nativeElement.value = 'value'
//     expect(component.permissionTable).toBeDefined()
//     spyOn(component.permissionTable!, 'clear').and.callThrough()
//     spyOn(component, 'loadProfileData')

//     component.onClearFilterPermissionTable()

//     expect(component.permissionTableFilter?.nativeElement.value).toBe('')
//     expect(component.permissionTable?.clear).toHaveBeenCalledTimes(1)
//     expect(component.loadProfileData).toHaveBeenCalledTimes(1)
//   })
// })
