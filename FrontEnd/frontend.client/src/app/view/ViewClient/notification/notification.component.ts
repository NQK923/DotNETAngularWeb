import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ModelNotification } from '../../../Model/ModelNotification';
import { ModelNotificationMangaAccount } from '../../../Model/ModelNotificationMangaAccount';
import { ModelInfoAccount } from '../../../Model/ModelInfoAccoutn';
import { NotificationService } from '../../../service/notification/notification.service';
import { NotificationMangaAccountService } from '../../../service/notificationMangaAccount/notification-manga-account.service';
import { InfoAccountService } from '../../../service/InfoAccount/info-account.service';

export class CombinedData {
    Notification: ModelNotification | null;  // Changed to allow null
    NotificationMangaAccounts: ModelNotificationMangaAccount | null;  // Changed to allow null
    InfoAccount: ModelInfoAccount | null;  // Changed to allow null

    constructor(
        notification: ModelNotification | null,
        mangaAccount: ModelNotificationMangaAccount | null,
        infoAccount: ModelInfoAccount | null
    ) {
        this.Notification = notification;
        this.NotificationMangaAccounts = mangaAccount;
        this.InfoAccount = infoAccount;
    }
}

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
    notifications: ModelNotification[] = [];
    notificationMangaAccounts: ModelNotificationMangaAccount[] = [];
    infoaccount: ModelInfoAccount[] = [];

    combinedData: CombinedData | null = null;
    ListcombinedData: CombinedData[] = [];  // Correctly initialized as an array

    constructor(
        private router: Router,
        private notificationService: NotificationService,
        private infoAccountservice: InfoAccountService,
        private notificationMangaAccountService: NotificationMangaAccountService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadNotificationMangaAccount()
            .then(() => this.loadInfoAccount())
            .then(() => this.loadNotifications())
            .then(() => this.takedata())
            .catch(error => console.error('Error loading data:', error));
    }

    takedata(): void {
        for (let i = 0; i < this.notificationMangaAccounts.length; i++) {
            const matchedNotifications: ModelNotification[] = [];
            const matchedInfoAccounts: ModelInfoAccount[] = [];

            for (let j = 0; j < this.notifications.length; j++) {
                if (this.notificationMangaAccounts[i].id_Notification === this.notifications[j].id_Notification) {
                    matchedNotifications.push(this.notifications[j]);
                }
            }
            for (let j = 0; j < this.infoaccount.length; j++) {
                if (this.notificationMangaAccounts[i].id_account === this.infoaccount[j].id_account) {
                    matchedInfoAccounts.push(this.infoaccount[j]);
                }
            }

            // Assuming you want the first matched notification and info account
            this.ListcombinedData.push(new CombinedData(
                matchedNotifications[0] || null,  // Use the first matched notification or null
                this.notificationMangaAccounts[i],  // Use the current manga account
                matchedInfoAccounts[0] || null  // Use the first matched info account or null
            ));
        }

        // Logging the ids of notifications in ListcombinedData
        for (let i = 0; i < this.ListcombinedData.length; i++) {
            if (this.ListcombinedData[i].Notification) {
                console.log(this.ListcombinedData[i].Notification?.content, this.ListcombinedData[i].Notification?.time,this.ListcombinedData[i].InfoAccount?.cover_img,this.ListcombinedData[i].InfoAccount?.name);
            }
        }
    }
    goToIndex(): void {
        this.router.navigate(['/']);
    }
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
                    console.log(this.notificationMangaAccounts);
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
            this.infoAccountservice.getinfoaccount().subscribe(
                (data: ModelInfoAccount[]) => {
                    this.infoaccount = data;
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
}
