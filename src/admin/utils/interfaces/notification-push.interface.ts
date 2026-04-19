export interface IDataNotificationPush{
    id:               string;
    title:            string;
    description:      string;
    channel:          string;
    created_at:       Date;
}

export interface IFormNotificationPush extends Omit<IDataNotificationPush, 'id' | 'created_at'>{}