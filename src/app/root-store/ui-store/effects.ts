import { Injectable } from '@angular/core';
import { UiService } from 'src/app/core/services/ui.service';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import * as uiFeatureActions from './actions';
import { switchMap, map, catchError } from 'rxjs/operators';

@Injectable()
export class UiStoreEffects {
  constructor(
    private uiService: UiService,
    private actions$: Actions,
  ) { }

  @Effect()
  countryListRequestedEffect$: Observable<Action> = this.actions$.pipe(
    ofType<uiFeatureActions.CountryListRequested>(
      uiFeatureActions.ActionTypes.COUNTRY_LIST_REQUESTED
    ),
    switchMap(action =>
      this.uiService.fetchCountryList()
        .pipe(
          map(countryList => new uiFeatureActions.CountryListLoaded({ countryList })),
          catchError(error => {
            return of(new uiFeatureActions.LoadErrorDetected({ error }));
          })
        )
    )
  );
}
