export interface ModelNotification {
    id_Notification: number; // Ensure camelCase
    content: string; // Ensure lowercase
    time: Date; 
    isRead: boolean;
    type_Noti: string;
}