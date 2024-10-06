import { NgModule } from '@angular/core';
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
import { LoginComponent } from './view/Account/login/login.component';
import { RegisterComponent } from './view/Account/register/register.component';
import { ForgotPasswordComponent } from './view/Account/forgot-password/forgot-password.component';
import { UpdatePasswordComponent } from './view/Account/update-password/update-password.component';
import { HistoryComponent } from './view/ViewClient/history/history.component';
import { ListViewComponent } from './view/ViewClient/list-view/list-view.component';
import { NotificationComponent } from './view/ViewClient/notification/notification.component';
import { ViewerComponent } from './view/ViewClient/viewer/viewer.component';
import { RankComponent } from './view/ViewClient/rank/rank.component';
import { ManagerCommentComponent } from './view/Manager/manager-comment/manager-comment.component';
import { ManagerBannerComponent } from './view/Manager/manager-banner/manager-banner.component';
import { ClientManagerComponent } from './view/ViewClient/client-manager/client-manager.component';

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
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    UpdatePasswordComponent,
    HistoryComponent,
    ListViewComponent,
    NotificationComponent,
    ViewerComponent,
    RankComponent,
    ManagerCommentComponent,
    ManagerBannerComponent,
    ClientManagerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
