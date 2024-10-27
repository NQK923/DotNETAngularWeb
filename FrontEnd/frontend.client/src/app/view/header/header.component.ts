import {Component, ElementRef, OnInit} from '@angular/core';
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
import {concatMap, forkJoin, map, Observable} from "rxjs";
import {MangaService} from "../../service/Manga/manga.service";
import {ConfirmationService, MessageService} from "primeng/api";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  searchQuery: string = '';
  accounts: ModelAccount |undefined;
  infoAccounts: ModelInfoAccount |undefined;
  url: string | null = null;
  name: string | null = null;
  idAccount: number | null = null;
  infoAccount: ModelInfoAccount[] = [];
  mangas: ModelManga [] = [];
  mangaFavorite: ModelMangaFavorite[] = [];
  ListCombinedData: CombinedData[] = [];
  ListCombinedDataIsRead: CombinedData[] = [];
  isHidden: boolean = true;
  numberNotification: number | null = null;
  notification: ModelNotification | undefined;
  info: ModelInfoAccount | undefined;
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

  ngOnInit() {
    this.ListCombinedData= [];
    this.ListCombinedDataIsRead= [];
    this.allFunction()
  }
  allFunction(){
    this.TakeData();
    this.takeNewData()
  }
  takeNewDataMangaFavorite(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.mangaFavoriteService.getMangaFavByAccount(Number(this.idAccount)).subscribe(
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

  takeNewDataNotification(id: number): Observable<ModelNotification> {
    return this.notificationService.getNotificationById(id);
  }
  takeNewDataInfoAccount(id: number): Observable<ModelInfoAccount> {
    return this.infoAccountService.getInfoAccountById(id);
  }
  takeNewDataManga(id: number): Observable<ModelManga> {
    return this.mangaService.getMangaById(id);
  }
  takeNewData() {
    this.takeNewDataMangaFavorite().then(() => {
      const observables = [];
      for (let i = 0; i < this.mangaFavorite.length; i++) {
        if ( !this.mangaFavorite[i].is_notification){
          continue;
        }
        observables.push(
          this.notificationMangaAccountService.getNotificationMangaAcById(this.mangaFavorite[i].id_manga).pipe(
            concatMap((notificationAcList: ModelNotificationMangaAccount[]) => {
              return forkJoin(
                notificationAcList.map((notificationAc) =>
                  forkJoin({
                    manga: this.takeNewDataManga(Number(notificationAc.id_manga)),
                    notification: this.takeNewDataNotification(Number(notificationAc.id_Notification)).pipe(
                      map((notification: ModelNotification | ModelNotification[]) => {
                        return Array.isArray(notification) ? notification[0] : notification;
                      })
                    ),
                    account: this.takeNewDataInfoAccount(Number(notificationAc.id_account))
                  }).pipe(
                    map((result) => ({
                      ...result,
                      notificationAc: notificationAc
                    }))
                  )
                )
              );
            })
          )
        );
      }
      forkJoin(observables).subscribe((results) => {
        results.forEach((resultArray) => {
          resultArray.forEach((result) => {
            const combo: CombinedData = {
              Notification: result.notification,
              NotificationMangaAccounts: result.notificationAc,
              InfoAccount: result.account,
              Mangainfo: result.manga
            };
            if(combo.NotificationMangaAccounts?.is_read==false) {
              this.ListCombinedData.push(combo);
            }
            else{
              this.ListCombinedDataIsRead.push(combo);
            }
          });
        });
        console.log("Combined Data:", this.ListCombinedData);
        this.numberNotification = this.ListCombinedData.length;
      }, (error) => {
        console.error('Error fetching data', error);
      });
    }).catch((error) => {
      console.error('Error in takeNewData:', error);
    });
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
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.idAccount = parseInt(userId, 10);
      if(this.idAccount==-1) {
        const History = this.el.nativeElement.querySelector('#History');
        const Favorite = this.el.nativeElement.querySelector('#Favorite');
        const clientManager = this.el.nativeElement.querySelector('#clientManager');
        const iconNotification = this.el.nativeElement.querySelector('#iconNotification');
        History.classList.add('hidden');
        Favorite.classList.add('hidden');
        clientManager.classList.add('hidden');
        iconNotification.classList.add('hidden');
      }
      else{
        const Login = this.el.nativeElement.querySelector('#Login');
        Login.classList.add('hidden');
      }
    }
    if (userId) {
      this.idAccount = parseInt(userId, 10);
      this.accountService.getAccountById( this.idAccount).subscribe(
        (data: ModelAccount) => {
          this.accounts = data;
          this.name = this.accounts.username || null;
        },
        (error) => {
          console.error('Error fetching accounts:', error);
        }
      );
      this.infoAccountService.getInfoAccountById(this.idAccount).subscribe(
        (data: ModelInfoAccount) => {
          this.infoAccounts = data;
          if (this.idAccount !== null) {
            this.url = this.infoAccounts.cover_img || null;
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
            id_manga: allData[i].Mangainfo?.id_manga,
            id_account: allData[i].InfoAccount?.id_account,
            id_Notification: allData[i].Notification?.id_Notification,
            isGotNotification: false,
            is_read: true,
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
    this.searchQuery=''
    this.router.navigate(['/']);
  }

  goToListView() {
    this.searchQuery='';
    this.router.navigate(['/list-view']);
  }

  goToRank() {
    this.searchQuery='';
    this.router.navigate(['/rank']);
  }

  goToHistory() {
    this.searchQuery='';
    this.router.navigate(['/history']);
  }

  goToFavorite() {
    this.searchQuery='';
    this.router.navigate(['/favorite']);
  }

  goToLogin() {
    this.searchQuery='';
    this.router.navigate(['/login']);
  }

  goToNotification() {
    this.searchQuery='';
    this.isHidden = !this.isHidden;
  }
  toggleNotification() {
    this.searchQuery='';
    this.isHidden = !this.isHidden;
  }
  goToClientManager() {
    this.searchQuery='';
    this.router.navigate(['/client-manager']);
  }
  goToContent(id: number | undefined, id_Notification: number | undefined) {
    this.notificationMangaAccountService.toggleNotiStatus(id_Notification).subscribe({
      next: () => {
        this.toggleNotification();
        this.ngOnInit();
        this.router.navigate(['/titles', id]);
      },
      error: (err) => {
        console.error('Có lỗi xảy ra khi thay đổi trạng thái thông báo:', err);
      }
    });
  }
  confirmAction = (message: string, onConfirm: () => void, onCancel: () => void) => {
    this.confirmationService.confirm({
      message: message,
      header: 'Xác nhận',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: onConfirm,
      reject: onCancel
    });
  }
}
