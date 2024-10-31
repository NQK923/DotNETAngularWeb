import {CanActivateFn, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {inject} from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

interface Account {
  id_account?: number;
  role: boolean;
}

export const authGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const http = inject(HttpClient);
  const router = inject(Router);

  const userId = localStorage.getItem('userId');

  if (!userId) {
    router.navigate(['/']);
    return of(false);
  }

  // return http.get<Account>(`https://localhost:44385/api/Account/data?idAccount=${userId}`).pipe(
  //   map((account) => {
  //     if (account && account.role) {
  //       return true;
  //     } else {
  //       router.navigate(['/']);
  //       return false;
  //     }
  //   }),
  //   catchError(() => {
  //     router.navigate(['/']);
  //     return of(false);
  //   })
  // );

  return http.get<Account>(`http://localhost:5004/api/Account/data?idAccount=${userId}`).pipe(
    map((account) => {
      if (account && account.role) {
        return true;
      } else {
        router.navigate(['/']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/']);
      return of(false);
    })
  );
};
