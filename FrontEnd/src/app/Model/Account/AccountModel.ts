export  interface AccountModel{
  id_account?: number;
  username: string;
  password: string;
  banDate?: Date
  role?: boolean;
  status?: boolean;
  banComment?: boolean;

}
export  interface  ChangePasswordRequest{
  idAccount:number;
  oldPassword:string;

  newPassword:string};
