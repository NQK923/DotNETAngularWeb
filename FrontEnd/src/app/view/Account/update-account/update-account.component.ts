import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {AccountService} from "../../../service/Account/account.service";
import {InfoAccountService} from "../../../service/InfoAccount/info-account.service";
import {MessageService} from "primeng/api";
import {AccountModel} from '../../../Model/Account/AccountModel';

@Component({
  selector: 'app-update-account',
  templateUrl: './update-account.component.html',
  styleUrl: './update-account.component.css'
})

export class UpdateAccountComponent implements AfterViewInit {
  @ViewChild('container') container!: ElementRef;
  @ViewChild('register') registerBtn!: ElementRef;
  @ViewChild('login') loginBtn!: ElementRef;
  code: string | null = null;
  isCodeVisible: boolean = false;
  iduser:number=0;
  pass:string="";

  constructor(private router: Router,
              private InfoAccountService: InfoAccountService,
              private accountService: AccountService,
              private messageService: MessageService,) {
  }

  ngAfterViewInit() {
    this.registerBtn.nativeElement.addEventListener('click', () => {
      this.container.nativeElement.classList.add('active');
    });
    this.loginBtn.nativeElement.addEventListener('click', () => {
      this.container.nativeElement.classList.remove('active');
    });
  }

  TakeData() {
    const username = (document.getElementById('userName') as HTMLInputElement).value;
    const password = (document.getElementById('currentPassword') as HTMLInputElement).value;
    const newPassword = (document.getElementById('newPassword') as HTMLInputElement).value;
    const otherPass = (document.getElementById('confirmPassword') as HTMLInputElement).value;
    if(newPassword.length<6){
      this.messageService.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Mật khẩu dài hơn 6 ký tự'
      });
      return;
    }

    if (newPassword !== otherPass) {
      this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Mật khẩu xác nhận không khớp'});
      return;
    }

    if (!newPassword || !otherPass) {
      this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đủ thông tin'});
      return;
    }

    this.accountService.getAccountByUsername(username).subscribe(account => {

      if (account.password !== password) {
        this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đúng mật khẩu hiện tại'});
        return;
      }
      this.accountService.updatePassword(Number(account.id_account), account.password, newPassword).subscribe(

        response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Cập nhật mật khẩu thành công'
          });
        },
        error => {
          console.error('Error updating password:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Cập nhật mật khẩu thất bại'
          });
        }
      );
    }, error => {
      console.error('Error fetching account:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Tài khoản không tồn tại hoặc không thể truy xuất'
      });
    });
  }


  generateRandomNumbers() {
    return Math.floor(100000 + Math.random() * 900000);
  }


  update(){
    const newPassword = (document.getElementById('Pass') as HTMLInputElement).value;
    const CodePass = (document.getElementById('Code') as HTMLInputElement).value;
    this.code = localStorage.getItem('code');
    if(newPassword.length<6){
      this.messageService.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Mật khẩu dài hơn 6 ký tự'
      });
      return;
    }

    if(this.code!=CodePass){
      this.messageService.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Sai mã'
      });
      return;
    }
    this.accountService.updatePassword(this.iduser,this.pass, newPassword).subscribe(

      response => {
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Cập nhật mật khẩu thành công'
        });
      },
      error => {
        console.error('Error updating password:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Cập nhật mật khẩu thất bại'
        });
      }
    );
  }
  //Forgot password
  takePassWord() {
    const username = (document.getElementById('usernameInput') as HTMLInputElement).value;
    const email = (document.getElementById('mailInput') as HTMLInputElement).value;

    // Fetch account by username
    this.accountService.getAccountByUsername(username).subscribe(account => {
      if (account && account.id_account !== undefined) {
        // Fetch account info by id
        this.InfoAccountService.getInfoAccountByIdTN(account.id_account).subscribe(infoAccount => {
          // Check if email matches
          if (email !== infoAccount.email) {
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: 'Mail không tồn tại'
            });
          } else {
            // Generate random number for password reset code
            const randomNumbers = this.generateRandomNumbers();
            localStorage.setItem('code', randomNumbers.toString());
            this.iduser = Number(account.id_account);
            this.pass=account.password;
            // Send email with the reset code
            this.accountService.postMail(infoAccount.email, "Mã đổi mật khẩu", randomNumbers.toString())
              .subscribe(

                response => {
                  this.isCodeVisible = true;
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Kiểm tra mail để lấy mã'
                  });
                },

                error => {
                  console.error('Error sending email:', error); // Improved error logging
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Lỗi gửi mail'
                  });
                }
              );
          }
          // Optional: Log the account info for debugging
          console.log('Account Info:', infoAccount);
        }, error => {
          console.error('Error fetching account info:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Lỗi khi lấy thông tin tài khoản'
          });
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Tài khoản không tồn tại'
        });
        console.error('Account not found or Id_account is undefined');
      }
    }, error => {
      console.error('Error fetching account:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Lỗi khi lấy thông tin tài khoản'
      });
    });
  }
}

