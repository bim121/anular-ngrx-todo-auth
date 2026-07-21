import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  DEFAULT_ROUTER_FEATURENAME,
  RouterReducerState as NgrxRouterReducerState,
} from '@ngrx/router-store';
import { AppRouterState } from './custom-router.serializer';

const selectRouterFeature = createFeatureSelector<NgrxRouterReducerState<AppRouterState>>(
  DEFAULT_ROUTER_FEATURENAME,
);

export const selectRouterUrl = createSelector(
  selectRouterFeature,
  (router) => router?.state?.url ?? '',
);

export const selectRouterParams = createSelector(
  selectRouterFeature,
  (router) => router?.state?.params ?? {},
);

export const selectRouterQueryParams = createSelector(
  selectRouterFeature,
  (router) => router?.state?.queryParams ?? {},
);
