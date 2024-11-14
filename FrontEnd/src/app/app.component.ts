import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AccountService } from './service/Account/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  showHeaderFooter: boolean = true;
  title = "wweb";

  constructor(private router: Router, private accountService:AccountService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentUrl = this.router.url;
      this.showHeaderFooter = !currentUrl.includes('/manager')
        && !currentUrl.includes('/manager-account')
        && !currentUrl.includes('/manager-statiscal')
        && !currentUrl.includes('/client-manager')
        ;
    });
  }

  ngOnInit(): void {
    this.router.events.subscribe(async (event) => {
      if (event instanceof NavigationEnd) {
     

        window.scrollTo(0, 0);
      }
    });
  }

  private async checkLoggedIn():Promise<boolean>
  {
    let result = await this.accountService.isLoggedIn();
    if(!result) return false;
    return true;
  }

}
