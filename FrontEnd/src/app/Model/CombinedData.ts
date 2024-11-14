import {ModelNotification} from "./ModelNotification";
import {ModelNotificationMangaAccount} from "./ModelNotificationMangaAccount";
import {ModelInfoAccount} from "./ModelInfoAccoutn";
import {ModelManga} from "./ModelManga";

export interface CombinedData {
  Notification?: ModelNotification | null;
  NotificationMangaAccounts?: ModelNotificationMangaAccount | null;
  InfoAccount?: ModelInfoAccount | null;
  Mangainfo?: ModelManga | null;

}
