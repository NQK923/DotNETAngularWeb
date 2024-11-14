import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AccountService } from './service/Account/account.service';

interface Account {
  id_account?: number;
  role: boolean;
}

export const authGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const http = inject(HttpClient);
  const router = inject(Router);
  const accountService = inject(AccountService);
  // console.log('Current URL:', state.url); // Log the current URL

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
