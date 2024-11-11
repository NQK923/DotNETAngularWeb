import {Component, HostListener, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MangaFavoriteService} from "../../../service/MangaFavorite/manga-favorite.service";
import {MangaService} from "../../../service/Manga/manga.service";
import {forkJoin, Observable} from 'rxjs';
import {ConfirmationService, MessageService} from "primeng/api";

interface Manga {
  IdManga: number;
  Name: string;
  Author: string;
  NumOfChapter: number;
  Rating: number;
  IdAccount: number;
  IsPosted: boolean;
  CoverImg: string;
  Describe: string;
  UpdatedAt: Date;
  TotalViews: number;
  RatedNum: number;
  IsDeleted: boolean;
  IsNotification: boolean;
}

interface MangaFavorite {
  IdManga: number;
  IdAccount: number;
  IsFavorite: boolean;
  IsNotification: boolean;
}

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.css']
})
export class FavoriteComponent implements OnInit {
  favoriteMangas: MangaFavorite[] = [];
  mangas: Manga[] = [];
  page: number = 1;
  itemsPerPage: number = 10;
  private confirmationDialogOpen: boolean = false;

  constructor(
    private router: Router,
    private mangaFavoriteService: MangaFavoriteService,
    private mangaService: MangaService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    this.updateItemsPerPage(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateItemsPerPage(event.target.innerWidth);
  }

  ngOnInit() {
    const idNumber = Number(localStorage.getItem('userId'));
    this.mangaFavoriteService.getMangaFavByAccount(idNumber).subscribe(fm => {
      this.favoriteMangas = fm;
      const mangaObservables: Observable<Manga>[] = this.favoriteMangas.map(fav =>
        this.mangaService.getMangaById(fav.IdManga)
      );
      forkJoin(mangaObservables).subscribe(mangaList => {
        this.mangas = mangaList.filter(manga => !manga.IsDeleted).map(manga => {
          const favorite = this.favoriteMangas.find(fav => (fav.IdManga === manga.IdManga));
          if (favorite) {
            manga.IsNotification = favorite.IsNotification;
          }
          return manga;
        });
      });
    });
  }

  removeFromFavorites(mangaId: number) {
    if (this.confirmationDialogOpen) return;
    this.confirmationDialogOpen = true;
    this.confirmAction('Bạn có chắc chắn muốn bỏ yêu thích không?', () => {
      const idNumber = Number(localStorage.getItem('userId'));
      this.mangaFavoriteService.toggleFavorite(idNumber, mangaId).subscribe(() => {
        this.favoriteMangas = this.favoriteMangas.filter(manga => manga.IdManga !== mangaId);
        this.mangas = this.mangas.filter(manga => manga.IdManga !== mangaId);
        this.messageService.add({
          severity: 'success',
          summary: 'Xoá thành công',
          detail: 'Manga đã được xoá khỏi danh sách.'
        });
        this.confirmationDialogOpen = false;
      }, (error) => {
        this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Xoá manga không thành công.'});
        console.error('Error:', error);
        this.confirmationDialogOpen = false;
      });
    }, () => {
      this.confirmationDialogOpen = false;
    });
  }

  toggleNotification(idManga: number) {
    const idNumber = Number(localStorage.getItem('userId'));
    const mangaFavorite = this.favoriteMangas.find(fav => fav.IdManga === idManga);
    if (mangaFavorite) {
      this.mangaFavoriteService.toggleNotification(idNumber, mangaFavorite.IdManga).subscribe(() => {
        mangaFavorite.IsNotification = !mangaFavorite.IsNotification;
        const manga = this.mangas.find(m => m.IdManga === idManga);
        if (manga) {
          manga.IsNotification = mangaFavorite.IsNotification;
        }
      }, error => {
        console.error("Error toggling notification state.", error);
      });
    } else {
      console.error("MangaFavorite not found for the given idManga:", idManga);
    }
  }

  viewMangaDetails(id_manga: number) {
    this.router.navigate(['/titles', id_manga]);
  }

  //Pagination
  onPageChange(newPage: number): void {
    this.page = newPage;
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  confirmAction = (message: string, onConfirm: () => void, onCancel: () => void) => {
    this.confirmationService.confirm({
      message: message,
      header: 'Xác nhận',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: onConfirm,
      reject: onCancel
    });
  }

  private updateItemsPerPage(width: number) {
    if (width >= 1280) {
      this.itemsPerPage = 10;
    } else {
      this.itemsPerPage = 9;
    }
  }
}