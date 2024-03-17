import { Injectable, inject } from '@angular/core';
import { UiService } from './ui.service';
import { Functions, httpsCallableData } from '@angular/fire/functions';
import { Observable, catchError, map, take, throwError } from 'rxjs';
import { PublicFunctionNames } from '../../../../shared-models/routes-and-paths/fb-function-names.model';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  private functions = inject(Functions);
  private uiService = inject(UiService);

  constructor() { }

  // testAccessToAdmin(): Observable<void> {
  //   console.log('testAccessToAdmin call registered');
  //   const testAccessToAdminHttpCall: () => 
  //     Observable<void> = httpsCallableData(this.functions, PublicFunctionNames.ON_CALL_TEST_ACCESS_TO_ADMIN);

  //   return testAccessToAdminHttpCall()
  //     .pipe(
  //       take(1),
  //       map(empty => {
  //         console.log(`testAccessToAdmin succeeded`, );
  //         return ;
  //       }),
  //       catchError(error => {
  //         console.log('Error with testAccessToAdmin', error);
  //         this.uiService.showSnackBar('Hmm, something went wrong. Refresh the page and try again.', 10000);
  //         return throwError(() => new Error(error));
  //       })
  //     );
  // }

}
