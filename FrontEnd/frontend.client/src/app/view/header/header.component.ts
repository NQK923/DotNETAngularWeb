import {ChangeDetectorRef, Component, ElementRef, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ModelAccount} from "../../Model/ModelAccount";
import {AccountService} from "../../service/Account/account.service";
import {ModelInfoAccount} from "../../Model/ModelInfoAccoutn";
import {ModelNotification} from "../../Model/ModelNotification";
import {ModelManga} from "../../Model/ModelManga";
import {ModelNotificationMangaAccount} from "../../Model/ModelNotificationMangaAccount";
import {NotificationService} from "../../service/notification/notification.service";
import {InfoAccountService} from "../../service/InfoAccount/info-account.service";
import {
  NotificationMangaAccountService
} from "../../service/notificationMangaAccount/notification-manga-account.service";
import {CombinedData} from "../../Model/CombinedData";
import {MangaFavoriteService} from "../../service/MangaFavorite/manga-favorite.service";
import {ModelMangaFavorite} from "../../Model/MangaFavorite";
import {forkJoin, Observable} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  searchQuery: string = '';
  accounts: ModelAccount[] = [];
  infoAccounts: ModelInfoAccount[] = [];
  url: string | null = null;
  name: string | null = null;
  idAccount: number | null = null;
  notifications: ModelNotification[] = [];
  notificationMangaAccounts: ModelNotificationMangaAccount[] = [];
  infoAccount: ModelInfoAccount[] = [];
  mangas: ModelManga[] = [];
  ListCombinedData: CombinedData[] = [];
  CombinedData: CombinedData[] = [];
  isHidden: boolean = true;
  listMangaFavorite: ModelMangaFavorite [] = [];
  numberNotification: number | null = null;

  constructor(private accountService: AccountService,
              private router: Router,
              private el: ElementRef,
              private notificationService: NotificationService,
              private infoAccountService: InfoAccountService,
              private notificationMangaAccountService: NotificationMangaAccountService,
              private mangaFavoriteService: MangaFavoriteService,
              private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.allFunction()
  }

  allFunction() {
    this.TakeData();
    this.loadNotificationMangaAccount()
      .then(() => this.loadMangaFavorite())
      .then(() => this.loadInfoManga())
      .then(() => this.loadInfoAccount())
      .then(() => this.loadNotifications())
      .then(() => this.takeDataNotification())
      .catch(error => console.error('Error loading data:', error));

  }

  //Search manga
  onSearch(): void {
    if (this.searchQuery.trim()) {
      if (this.router.url.includes('/list-view')) {
        this.router.navigate([], {queryParams: {search: this.searchQuery}});
      } else {
        this.router.navigate(['/list-view'], {queryParams: {search: this.searchQuery}});
      }
    }
  }

  //get account info
  TakeData() {
    this.accounts = []
    this.infoAccounts = []
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.idAccount = parseInt(userId, 10);
      if (this.idAccount == -1) {
        const History = this.el.nativeElement.querySelector('#History');
        const Favorite = this.el.nativeElement.querySelector('#Favorite');
        const clientManager = this.el.nativeElement.querySelector('#clientManager');
        const iconNotification = this.el.nativeElement.querySelector('#iconNotification');
        History.classList.add('hidden');
        Favorite.classList.add('hidden');
        clientManager.classList.add('hidden');
        iconNotification.classList.add('hidden');
      } else {
        const Login = this.el.nativeElement.querySelector('#Login');
        Login.classList.add('hidden');
        const Logout = this.el.nativeElement.querySelector('#Logout');
        Logout.classList.remove('hidden');
      }
    }
    if (userId) {
      this.idAccount = parseInt(userId, 10);
      this.accountService.getAccount().subscribe(
        (data: ModelAccount[]) => {
          this.accounts = data;
          if (this.idAccount !== null) {
            this.findUser(this.idAccount);
          }
        },
        (error) => {
          console.error('Error fetching accounts:', error);
        }
      );
      this.accountService.getinfoAccount().subscribe(
        (data: ModelInfoAccount[]) => {
          this.infoAccounts = data;
          if (this.idAccount !== null) {
            this.findUrl(this.idAccount);
          }
        },
        (error) => {
          console.error('Error fetching account info:', error);
        }
      );

    } else {
      console.error('No userId found in localStorage');
    }
  }

  //Get all notification by user id
  takeDataNotification(): void {
    for (let i = 0; i < this.notificationMangaAccounts.length; i++) {
      const matchedNotifications: ModelNotification[] = [];
      const matchedInfoAccounts: ModelInfoAccount[] = [];
      const matchedManga: ModelManga[] = [];
      for (let j = 0; j < this.notifications.length; j++) {
        if (this.notificationMangaAccounts[i]?.id_Notification === this.notifications[j]?.id_Notification) {
          matchedNotifications.push(this.notifications[j]);
          break;
        }
      }
      for (let j = 0; j < this.mangas.length; j++) {
        if (this.notificationMangaAccounts[i]?.id_manga === this.mangas[j]?.id_manga) {
          matchedManga.push(this.mangas[j]);
          break;
        }
      }
      for (let j = 0; j < this.infoAccount.length; j++) {
        if (this.notificationMangaAccounts[i]?.id_account === this.infoAccount[j]?.id_account) {
          matchedInfoAccounts.push(this.infoAccount[j]);
          break;
        }
      }
      if (matchedInfoAccounts.length > 0 && matchedManga.length > 0) {
        for (let j = 0; j < this.listMangaFavorite.length; j++) {
          if (this.listMangaFavorite[j]?.id_account === this.idAccount && this.notificationMangaAccounts[i].is_read === false) {
            if (matchedManga[0]?.id_manga === this.listMangaFavorite[j]?.id_manga) {
              if (this.listMangaFavorite[j]?.is_notification) {
                this.ListCombinedData.push({
                  Notification: matchedNotifications[0] || null,
                  NotificationMangaAccounts: this.notificationMangaAccounts[i],
                  InfoAccount: matchedInfoAccounts[0] || null,
                  Mangainfo: matchedManga[0] || null
                } as CombinedData);
              }
            }
          }
        }
      }
    }
    this.CombinedData = []
    for (let i = 0; i < this.ListCombinedData.length; i++) {
      if (!this.CombinedData.some(cd => cd.Notification?.id_Notification === this.ListCombinedData[i].Notification?.id_Notification)) {
        this.CombinedData.push(this.ListCombinedData[i]);
        console.log(this.CombinedData)
      }
    }
    this.numberNotification = this.CombinedData.length;
  }

  //delete all notification
  deleteAllNotification() {
    const updateObservables: Observable<ModelNotificationMangaAccount>[] = [];
    for (let i = 0; i < this.CombinedData.length; i++) {
      const notificationData = {
          id_manga: this.CombinedData[i].Mangainfo?.id_manga,
          id_account: this.idAccount,
          id_Notification: this.CombinedData[i].Notification?.id_Notification,
          isGotNotification: true,
          is_read: true,
        } as ModelNotificationMangaAccount
      ;
      this.CombinedData = [];
      const observable = this.notificationMangaAccountService.updateNotificationAccount(notificationData);
      updateObservables.push(observable);
    }
    forkJoin(updateObservables).subscribe({
      next: (responses) => {
        responses.forEach((response, index) => {
        });
        alert("Đã xóa hết thông báo");
      },
      error: (error) => {
        console.error("Đã xảy ra lỗi trong quá trình xóa thông báo:", error);
      }
    });
  }

  //get manga favorite
  loadMangaFavorite(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.mangaFavoriteService.getMangaFavorite().subscribe(
        (data: ModelMangaFavorite[]) => {
          this.listMangaFavorite = data;
          this.cdr.detectChanges();
          resolve();
        },
        (error: any) => {
          console.error('Error fetching notifications', error);
          reject(error);
        }
      )
    })
  }

  //display notification
  loadNotifications(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.notificationService.getNotification().subscribe(
        (data: ModelNotification[]) => {
          this.notifications = data;
          this.cdr.detectChanges();
          resolve();
        },
        (error: any) => {
          console.error('Error fetching notifications', error);
          reject(error);
        }
      );
    });
  }

  loadNotificationMangaAccount(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.notificationMangaAccountService.getNotificationMangaAccount().subscribe(
        (data: ModelNotificationMangaAccount[]) => {
          this.notificationMangaAccounts = data;
          this.cdr.detectChanges();
          resolve();
        },
        (error: any) => {
          console.error('Error fetching notification manga accounts', error);
          reject(error);
        }
      );
    });
  }

  loadInfoAccount(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.infoAccountService.getinfoaccount().subscribe(
        (data: ModelInfoAccount[]) => {
          this.infoAccount = data;
          this.cdr.detectChanges();
          resolve();
        },
        (error: any) => {
          console.error('Error fetching info accounts', error);
          reject(error);
        }
      );
    });
  }

  loadInfoManga(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.notificationService.getManga().subscribe(
        (data: ModelManga[]) => {
          this.mangas = data;
          this.cdr.detectChanges();
          resolve();
        },
        (error: any) => {
          console.error('Error fetching info accounts', error);
          reject(error);
        }
      );
    });
  }

  findUser(userId: number) {
    for (let i = 0; i < this.accounts.length; i++) {

      if (this.accounts[i].id_account === userId) {
        this.name = this.accounts[i].username || null;
        break;
      }
    }
  }

  findUrl(userId: number) {
    for (let i = 0; i < this.infoAccounts.length; i++) {
      if (this.infoAccounts[i].id_account === userId) {
        this.url = this.infoAccounts[i].cover_img || null;
        break;
      }
    }
  }

  goToIndex(): void {
    this.searchQuery = ''
    this.router.navigate(['/']);
  }

  goToListView() {
    this.searchQuery = '';
    this.router.navigate(['/list-view']);
  }

  goToRank() {
    this.searchQuery = '';
    this.router.navigate(['/rank']);
  }

  goToHistory() {
    this.searchQuery = '';
    this.router.navigate(['/history']);
  }

  goToFavorite() {
    this.searchQuery = '';
    this.router.navigate(['/favorite']);
  }

  goToLogin() {
    this.searchQuery = '';
    this.router.navigate(['/login']);
  }

  goToNotification() {
    this.searchQuery = '';
    this.isHidden = !this.isHidden;
  }

  goToClientManager() {
    this.searchQuery = '';
    this.router.navigate(['/client-manager']);
  }
}
