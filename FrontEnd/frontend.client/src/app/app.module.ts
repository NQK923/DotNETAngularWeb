import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './view/header/header.component';
import { FooterComponent } from './view/footer/footer.component';
import { TitlesComponent } from './view/ViewClient/titles/titles.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IndexComponent } from './view/ViewClient/index/index.component';
import { ManagerComponent } from './view/Manager/manager/manager.component';
import { ManagerAccountComponent } from './view/Manager/manager-account/manager-account.component';
import { ManagerStatiscalComponent } from './view/Manager/manager-statiscal/manager-statiscal.component';
import { HistoryComponent } from './view/ViewClient/history/history.component';
import { ListViewComponent } from './view/ViewClient/list-view/list-view.component';
import { ViewerComponent } from './view/ViewClient/viewer/viewer.component';
import { RankComponent } from './view/ViewClient/rank/rank.component';
import { ManagerCommentComponent } from './view/Manager/manager-comment/manager-comment.component';
import { ClientManagerComponent } from './view/ViewClient/client-manager/client-manager.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FavoriteComponent } from "./view/ViewClient/favorite/favorite.component";
import { ConfirmDialogComponent } from './view/Dialog/confirm-dialog/confirm-dialog.component';
import { MessageDialogComponent } from './view/Dialog/message-dialog/message-dialog.component';
import { MatDialogActions, MatDialogContent, MatDialogTitle } from "@angular/material/dialog";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { LoginComponent } from "./view/Account/login/login.component";
import { UpdateAccountComponent } from "./view/Account/update-account/update-account.component";
import { authGuard } from './auth.guard';
import { SocialLoginModule, SocialAuthServiceConfig, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import {
  GoogleLoginProvider,
  FacebookLoginProvider
} from '@abacritt/angularx-social-login';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    TitlesComponent,
    IndexComponent,
    ManagerComponent,
    ManagerAccountComponent,
    ManagerStatiscalComponent,
    HistoryComponent,
    ListViewComponent,
    ViewerComponent,
    RankComponent,
    ManagerCommentComponent,
    ClientManagerComponent,
    FavoriteComponent,
    ConfirmDialogComponent,
    MessageDialogComponent,
    LoginComponent,
    UpdateAccountComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatIcon,SocialLoginModule,GoogleSigninButtonModule,
  ],
  providers: [{
    provide: 'SocialAuthServiceConfig',
    useValue: {
      autoLogin: false,
      providers: [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider(
            '895175045051-j4tckothc869noieq89nq7ae2lmd9a6o.apps.googleusercontent.com'
          )
        },
        {
          id: FacebookLoginProvider.PROVIDER_ID,
          provider: new FacebookLoginProvider('589296940088729')
        }
      ],
      onError: (err) => {
        console.error(err);
      }
    } as SocialAuthServiceConfig,
  }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
}
