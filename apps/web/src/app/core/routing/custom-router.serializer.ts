import { Injectable } from '@angular/core';
import { Params, RouterStateSnapshot } from '@angular/router';
import { RouterStateSerializer } from '@ngrx/router-store';

/** Slim serialized router state (plan 3.5.1) — url + leaf route params only. */
export interface AppRouterState {
  url: string;
  params: Params;
  queryParams: Params;
}

@Injectable()
export class CustomRouterSerializer extends RouterStateSerializer<AppRouterState> {
  override serialize(routerState: RouterStateSnapshot): AppRouterState {
    let route = routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }

    return {
      url: routerState.url,
      params: route.params,
      queryParams: route.queryParams,
    };
  }
}
