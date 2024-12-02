import {ModelNotification} from "./ModelNotification";
import {ModelNotificationMangaAccount} from "./ModelNotificationMangaAccount";
import {ModelManga} from "./ModelManga";

export interface CombinedData {
  Notification?: ModelNotification | null;
  NotificationMangaAccounts?: ModelNotificationMangaAccount | null;
  Mangainfo?: ModelManga | null;
}
