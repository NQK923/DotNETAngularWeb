import {CanActivateFn, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {inject} from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import { AccountService } from './service/Account/account.service';


export const authGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const router = inject(Router);
  const accountService = inject(AccountService);

  return accountService.isLoggedInObservable().pipe(
    map((loggedIn) => {
      if (loggedIn == false && state.url.includes("login")) return true;
      else if (loggedIn != false && state.url.includes("login")) return false;
      if (loggedIn == false) { router.navigate(['/login']); return false; }
      return true;
    })
    , catchError((error) => { ; return of(false); })
  );
};

export const authGuardManager: CanActivateFn = async (route, state): Promise<boolean> => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  const cookie = await accountService.getAccountCookie();
  const role = cookie?.role;

  if (!role||cookie==null) {
    router.navigate(['/']);
    return false;
  }
  return true;
};

