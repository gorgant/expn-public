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
    ofType<uiFeatureActions.GeographicDataRequested>(
      uiFeatureActions.ActionTypes.GEOGRAPHIC_DATA_REQUESTED
    ),
    switchMap(action =>
      this.uiService.fetchGeographicData()
        .pipe(
          map(geographicData => {
            if (!geographicData) {
              throw new Error('Geographic data not found');
            }
            return new uiFeatureActions.GeographicDataLoaded({ geographicData });
          }),
          catchError(error => {
            return of(new uiFeatureActions.LoadErrorDetected({ error }));
          })
        )
    )
  );
}
