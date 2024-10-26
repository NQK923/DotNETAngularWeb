import {Component, OnInit} from '@angular/core';
import {MangaHistoryService} from "../../../service/MangaHistory/manga_history.service";
import {MangaService} from "../../../service/Manga/manga.service";
import {Router} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";

interface History {
  id_account: number;
  id_manga: number;
  index_chapter: number;
  time: Date;
}

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
  totalViews: number
  rated_num: number;
  is_deleted: boolean;
}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  histories: History[] = [];
  mangas: Manga[] = [];
  combinedHistories: { history: History, manga: Manga }[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(private router: Router,
              private mangaHistoryService: MangaHistoryService,
              private mangaService: MangaService,
              private confirmationService: ConfirmationService,
              private messageService: MessageService,) {
  }

  ngOnInit(): void {
    const id_user = localStorage.getItem('userId');
    let numberId: number = Number(id_user);
    this.mangaHistoryService.getSimpleHistory(numberId).subscribe((data: History[]) => {
      this.histories = data;
      this.getMangaDetails();
    }, (error) => {
      console.log(error);
    });
  }

  getMangaDetails(): void {
    this.combinedHistories = [];
    for (let history of this.histories) {
      this.mangaService.getMangaById(history.id_manga).subscribe((manga: Manga) => {
        if (manga.is_posted && !manga.is_deleted) {
          this.combinedHistories.push({history, manga});
        }
      }, (error) => {
        console.error(`Failed to load manga with id: ${history.id_manga}`, error);
      });
    }
  }

  confirmDelete(id_account: number, id_manga: number) {
    this.confirmationService.confirm({
      message: `Bạn có chắc chắn muốn xóa không?
      Sau khi xoá không thể hoàn tác.`,
      header: 'Xác nhận',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.deleteMangaHistory(id_account, id_manga);
      }
    });
  }

  deleteMangaHistory(id_account: number, id_manga: number): void {
    this.mangaHistoryService.deleteMangaHistory(id_account, id_manga)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Xoá thành công',
            detail: 'Manga đã được xoá khỏi danh sách.'
          });
          this.combinedHistories = this.combinedHistories.filter(entry => entry.manga.id_manga !== id_manga);
        },
        error: (error) => {
          console.error("Failed to delete manga history:", error);
          this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Xoá manga không thành công.'});
        }
      });
  }


  viewMangaDetails(id_manga: number) {
    this.router.navigate(['/titles', id_manga]);
  }

  //Pagination
  getPagedMangas(): any {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.combinedHistories.slice(startIndex, endIndex);
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
    return Math.ceil(this.combinedHistories.length / this.itemsPerPage);
  }
}
