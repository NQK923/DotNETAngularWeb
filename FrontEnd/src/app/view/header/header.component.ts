import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from "../../service/Account/account.service";
import { ModelNotification } from "../../Model/ModelNotification";
import { ModelManga } from "../../Model/ModelManga";
import { ModelNotificationMangaAccount } from "../../Model/ModelNotificationMangaAccount";
import { NotificationService } from "../../service/notification/notification.service";
import { InfoAccountService } from "../../service/InfoAccount/info-account.service";
import {
  NotificationMangaAccountService
} from "../../service/notificationMangaAccount/notification-manga-account.service";
import { CombinedData } from "../../Model/CombinedData";
import { MangaFavoriteService } from "../../service/MangaFavorite/manga-favorite.service";
import { ModelMangaFavorite } from "../../Model/MangaFavorite";
import { concatMap, forkJoin, map, Observable } from "rxjs";
import { MangaService } from "../../service/Manga/manga.service";
import { ConfirmationService, MessageService } from "primeng/api";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  searchQuery: string = '';
  url: string | null = null;
  name: string | null = null;
  mangas: ModelManga[] = [];
  mangaFavorite: ModelMangaFavorite[] = [];
  ListCombinedData: CombinedData[] = [];
  ListCombinedDataIsRead: CombinedData[] = [];
  isHidden: boolean = true;
  numberNotification: number | null = null;
  notification: ModelNotification | undefined;
  isAdmin: boolean = false;
  menuOpen = false;
  urlAvatarUser: string | null = null;


  // Two way data binding
  isLoggedIn: boolean = true;
  // Two way data binding
  constructor(private accountService: AccountService,
    private router: Router,
    private el: ElementRef,
    private notificationService: NotificationService,
    private infoAccountService: InfoAccountService,
    private notificationMangaAccountService: NotificationMangaAccountService,
    private mangaFavoriteService: MangaFavoriteService,
    private mangaService: MangaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
  }



  async ngOnInit() {
    await this.checkLogin();
    this.ListCombinedData = [];
    this.ListCombinedDataIsRead = [];
    this.allFunction();
  }

  private SetAvatarUser() {
    if (!this.isLoggedIn) { this.urlAvatarUser = "https://dotnetmangaimg.blob.core.windows.net/avatars/defaulImage.png" }
    else {
      this.accountService.getAccountCookieObservable().subscribe(response => {
        this.infoAccountService.getInfoAccountByIdTN(response.id_account).subscribe(response1 => {
          console.log(response1.cover_img)
          this.urlAvatarUser = response1.cover_img;
        }, error => {
          console.log(error)
        });
      })
    }
  }

  private async checkLogin() {
    (await this.accountService.isLoggedIn()).subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      this.SetAvatarUser();
    });
  }

  async allFunction() {
    this.takeUserData();
    const cookie = await this.accountService.getAccountCookie();
    if (cookie!=null) {
      const userId = cookie.id_account;
      this.takeOtherNotification(userId);
    }
  }

  takeMangaFavorite(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const cookie = await this.accountService.getAccountCookie();
      const userId = cookie.id_account;
      this.mangaFavoriteService.getMangaFavByAccount(Number(userId)).subscribe(
        (data: ModelMangaFavorite[]) => {
          this.mangaFavorite = data;
          resolve();
        },
        (error: any) => {
          console.error('Error fetching info accounts', error);
          reject(error);
        }
      );
    });
  }

  takeDataNotification(id: number | undefined): Observable<ModelNotification> {
    return this.notificationService.getNotificationById(id);
  }

  takeDataManga(id: number): Observable<ModelManga> {
    return this.mangaService.getMangaById(id);
  }

  //get other notification
  takeOtherNotification(idAccount: number) {
    this.takeMangaFavorite().then(r => {
      this.notificationMangaAccountService.getByAccountId(idAccount)
        .pipe(
          concatMap(notificationAcList =>
            forkJoin(
              notificationAcList.map(notificationAc =>
                this.getCombinedData(notificationAc)
              )
            )
          )
        )
        .subscribe(
          results => this.processCombinedData(results),
          error => console.error('Error fetching data', error)
        );
    });
  }

  getCombinedData(notificationAc: ModelNotificationMangaAccount) {
    return forkJoin({
      manga: this.takeDataManga(notificationAc.idManga),
      notification: this.takeDataNotification(notificationAc.idNotification).pipe(
        map(notification => Array.isArray(notification) ? notification[0] : notification)
      ),
    }).pipe(
      map(result => ({ ...result, notificationAc }))
    );
  }

  processCombinedData(results: any[]) {
    results.flat().forEach(result => {
      const combo: CombinedData = {
        Notification: result.notification,
        NotificationMangaAccounts: result.notificationAc,
        Mangainfo: result.manga
      };
      // @ts-ignore
      const isFavorite = this.mangaFavorite.some(fav => fav.idManga === combo.Mangainfo.idManga);
      const isNotNewChapter = combo.Notification?.typeNoti !== "Đã thêm 1 chương mới";

      if (isFavorite || isNotNewChapter) {
        if (combo.NotificationMangaAccounts) {
          if (!combo.NotificationMangaAccounts.isRead) {
            this.ListCombinedData.push(combo);
          } else {
            this.ListCombinedDataIsRead.push(combo);
          }
        }
      }
    });
    // @ts-ignore
    this.ListCombinedData.sort((a, b) => new Date(b.Notification.time).getTime() - new Date(a.Notification.time).getTime());
    // @ts-ignore
    this.ListCombinedDataIsRead.sort((a, b) => new Date(b.Notification.time).getTime() - new Date(a.Notification.time).getTime());
    this.numberNotification = this.ListCombinedData.length;
  }


  //Search manga
  onSearch(): void {
    if (this.searchQuery.trim()) {
      if (this.router.url.includes('/list-view')) {
        this.router.navigate([], { queryParams: { search: this.searchQuery } });
      } else {
        this.router.navigate(['/list-view'], { queryParams: { search: this.searchQuery } });
      }
    } else {
      this.router.navigate(['/list-view']);
    }
  }

  //get account info
  async takeUserData() {
    const cookie = await this.accountService.getAccountCookie();
    const id_user = cookie.id_account;
    this.isAdmin = cookie.role;
    const userId = Number(id_user);
      if (!userId) {
        const History = this.el.nativeElement.querySelector('#History');
        const Favorite = this.el.nativeElement.querySelector('#Favorite');
        const HistoryMobile = this.el.nativeElement.querySelector('#HistoryMobile');
        const FavoriteMobile = this.el.nativeElement.querySelector('#FavoriteMobile');
        const clientManager = this.el.nativeElement.querySelector('#clientManager');
        const iconNotification = this.el.nativeElement.querySelector('#iconNotification');
        History.classList.add('hidden');
        Favorite.classList.add('hidden');
        clientManager.classList.add('hidden');
        iconNotification.classList.add('hidden');
        HistoryMobile.classList.add('hidden');
        FavoriteMobile.classList.add('hidden');
      } else {
        const Login = this.el.nativeElement.querySelector('#Login');
        const LoginMobile = this.el.nativeElement.querySelector('#LoginMobile');
        Login.classList.add('hidden');
        LoginMobile.classList.add('hidden');
      }
  }

  // delete all notification
  deleteAllNotification() {
    const message = 'Bạn có chắc chắn muốn xóa hết thông báo?';
    this.confirmationService.confirm({
      message: message,
      header: 'Xác nhận',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        const updateObservables: Observable<ModelNotificationMangaAccount>[] = [];
        const allData = [...this.ListCombinedData, ...this.ListCombinedDataIsRead];
        for (let i = 0; i < allData.length; i++) {
          const notificationData = {
            idManga: allData[i].Mangainfo?.idManga,
            idNotification: allData[i].Notification?.idNotification,
            isDeleted: true,
            isRead: true,
          } as ModelNotificationMangaAccount;
          const observable = this.notificationMangaAccountService.updateNotificationAccount(notificationData);
          updateObservables.push(observable);
        }
        forkJoin(updateObservables).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Đã xóa hết thông báo'
            });
            this.goToNotification();
            this.ngOnInit();
          },
          error: (error) => {
            console.error("Đã xảy ra lỗi trong quá trình xóa thông báo:", error);
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: 'Có lỗi xảy ra trong quá trình xóa thông báo'
            });
          }
        });
      },
      reject: () => {
      }
    });
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

  toggleNotification() {
    this.searchQuery = '';
    this.isHidden = !this.isHidden;
  }

  goToClientManager() {
    this.searchQuery = '';
    this.router.navigate(['/client-manager']);
  }

  goToManager() {
    this.router.navigate(['/manager']);
  }

  goToContent(data: CombinedData) {
    if (data.NotificationMangaAccounts?.isRead == false) {
      this.notificationMangaAccountService.toggleNotiStatus(data.NotificationMangaAccounts?.idNotification).subscribe({
        next: () => {
        },
        error: (err) => {
          console.error('Có lỗi xảy ra khi thay đổi trạng thái thông báo:', err);
        }
      });
    }
    if (data.Notification?.typeNoti === "Đã thêm 1 chương mới") {
      this.toggleNotification();
      this.ngOnInit();
      this.router.navigate(['/titles', data.Mangainfo?.idManga]);
    } else {
      this.searchQuery = '';
      this.router.navigate(['/client-manager']);
    }
  }
}
