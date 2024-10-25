import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TitlesComponent} from './view/ViewClient/titles/titles.component';
import {IndexComponent} from './view/ViewClient/index/index.component';
import {ClientManagerComponent} from './view/ViewClient/client-manager/client-manager.component';
import {ListViewComponent} from './view/ViewClient/list-view/list-view.component';
import {HistoryComponent} from './view/ViewClient/history/history.component';
import {FavoriteComponent} from './view/ViewClient/favorite/favorite.component';
import {ViewerComponent} from './view/ViewClient/viewer/viewer.component';
import {RankComponent} from './view/ViewClient/rank/rank.component';

import {ManagerComponent} from './view/Manager/manager/manager.component';
import {ManagerAccountComponent} from './view/Manager/manager-account/manager-account.component';
import {ManagerStatiscalComponent} from './view/Manager/manager-statiscal/manager-statiscal.component';
import {ManagerCommentComponent} from './view/Manager/manager-comment/manager-comment.component';
import {LoginComponent} from "./view/Account/login/login.component";
import {UpdateAccountComponent} from "./view/Account/update-account/update-account.component";
import {authGuard} from "./auth.guard";

const routes: Routes = [
  //view
  {path: '', component: IndexComponent},
  {path: 'index/:idAccount', component: IndexComponent},
  {path: 'titles/:id_manga', component: TitlesComponent},
  {path: 'client-manager', component: ClientManagerComponent},
  {path: 'list-view', component: ListViewComponent},
  {path: 'history', component: HistoryComponent},
  {path: 'favorite', component: FavoriteComponent},
  {path: 'manga/:id_manga/chapter/:index', component: ViewerComponent},
  {path: 'rank', component: RankComponent},

  //account
  {path: 'login', component: LoginComponent},
  {path: 'update', component: UpdateAccountComponent},

  //manager
  {path: 'manager-account', component: ManagerAccountComponent, canActivate: [authGuard]},
  {path: 'manager-statiscal', component: ManagerStatiscalComponent, canActivate: [authGuard]},
  {path: 'manager', component: ManagerComponent, canActivate: [authGuard]},
  {path: 'manager-comment', component: ManagerCommentComponent, canActivate: [authGuard]},

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {useHash: true})
  ],
  exports: [RouterModule],

})
export class AppRoutingModule {
}

