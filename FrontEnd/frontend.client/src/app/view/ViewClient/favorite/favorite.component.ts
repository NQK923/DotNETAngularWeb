import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MangaFavoriteService} from "../../../service/MangaFavorite/manga-favorite.service";
import {MangaService} from "../../../service/Manga/manga.service";
import {forkJoin, Observable} from 'rxjs';
import {ConfirmationService, MessageService} from "primeng/api";

interface Manga {
  id_manga: number;
  name: string;
  author: string;
  num_of_chapter: number;
  rating: number;
  id_account: number;
  is_posted: boolean;
  cover_img: string;
  describe: string;
  updated_at: Date;
  totalViews: number;
  rated_num: number;
  is_deleted: boolean;
  is_notification: boolean;
}

interface MangaFavorite {
  id_manga: number;
  id_account: number;
  is_favorite: boolean;
  is_notification: boolean;
}

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.css']
})
export class FavoriteComponent implements OnInit {
  favoriteMangas: MangaFavorite[] = [];
  mangas: Manga[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 8;

  constructor(
    private router: Router,
    private mangaFavoriteService: MangaFavoriteService,
    private mangaService: MangaService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
  }

  ngOnInit() {
    const idNumber = Number(localStorage.getItem('userId'));
    this.mangaFavoriteService.getMangaFavByAccount(idNumber).subscribe(fm => {
      this.favoriteMangas = fm;
      const mangaObservables: Observable<Manga>[] = this.favoriteMangas.map(fav =>
        this.mangaService.getMangaById(fav.id_manga)
      );
      forkJoin(mangaObservables).subscribe(mangaList => {
        this.mangas = mangaList.filter(manga => !manga.is_deleted).map(manga => {
          const favorite = this.favoriteMangas.find(fav => (fav.id_manga === manga.id_manga));
          if (favorite) {
            manga.is_notification = favorite.is_notification;
          }
          return manga;
        });
      });
    });
  }

  removeFromFavorites(mangaId: number) {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn bỏ yêu thích không?',
      header: 'Xác nhận',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        const idNumber = Number(localStorage.getItem('userId'));
        this.mangaFavoriteService.toggleFavorite(idNumber, mangaId).subscribe(() => {
          this.favoriteMangas = this.favoriteMangas.filter(manga => manga.id_manga !== mangaId);
          this.mangas = this.mangas.filter(manga => manga.id_manga !== mangaId);
          this.messageService.add({
            severity: 'success',
            summary: 'Xoá thành công',
            detail: 'Manga đã được xoá khỏi danh sách.'
          });
        }, (error) => {
          this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Xoá manga không thành công.'});
          console.error('Error:', error);
        });
      },
      reject: () => {
      }
    });
  }

  toggleNotification(idManga: number) {
    const idNumber = Number(localStorage.getItem('userId'));
    const mangaFavorite = this.favoriteMangas.find(fav => fav.id_manga === idManga);
    if (mangaFavorite) {
      this.mangaFavoriteService.toggleNotification(idNumber, mangaFavorite.id_manga).subscribe(() => {
        mangaFavorite.is_notification = !mangaFavorite.is_notification;
        const manga = this.mangas.find(m => m.id_manga === idManga);
        if (manga) {
          manga.is_notification = mangaFavorite.is_notification;
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
  getPagedMangas(): Manga[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.mangas.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  totalPages(): number {
    return Math.ceil(this.mangas.length / this.itemsPerPage);
  }
}
