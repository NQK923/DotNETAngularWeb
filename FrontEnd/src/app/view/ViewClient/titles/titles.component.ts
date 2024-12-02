import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ChapterService} from '../../../service/Chapter/chapter.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MangaService} from '../../../service/Manga/manga.service';
import {MangaFavoriteService} from "../../../service/MangaFavorite/manga-favorite.service";
import {MangaHistoryService} from "../../../service/MangaHistory/manga_history.service";
import {MangaViewHistoryService} from "../../../service/MangaViewHistory/MangaViewHistory.service";
import {CategoryDetailsService} from "../../../service/Category_details/Category_details.service";
import {CategoriesService} from "../../../service/Categories/Categories.service";
import {forkJoin} from "rxjs";
import {ConfirmationService, MessageService} from "primeng/api";
import { AccountService } from '../../../service/Account/account.service';

interface Chapter {
  idChapter: number;
  title: string;
  idManga: number;
  createdAt: Date;
  index: number;
  isRead: boolean;
}

interface Category {
  idCategory: number;
  name: string;
  description: string;
}

interface CategoryDetails {
  idCategory: number;
  idManga: number;
}

interface History {
  idAccount: number;
  idManga: number;
  indexChapter: number;
  time: Date;
}

@Component({
  selector: 'app-titles',
  templateUrl: './titles.component.html',
  styleUrls: ['./titles.component.css']
})
export class TitlesComponent implements OnInit {
  id_manga!: number;
  chapters: Chapter[] = [];
  mangaDetails: any = {};
  selectedRatingValue: number = 0;
  isFavorite: boolean = false;
  categories: Category[] = [];
  categoryDetails: CategoryDetails[] = [];
  filteredCategories: Category[] = [];
  showRatingSection: boolean = false;
  histories: History[] = [];
  @ViewChild('ratingSection') ratingSection!: ElementRef;
  ascending = false;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private chapterService: ChapterService,
    private mangaFavoriteService: MangaFavoriteService,
    private mangaService: MangaService, private router: Router,
    private mangaHistoryService: MangaHistoryService,
    private mangaViewHistoryService: MangaViewHistoryService,
    private categoryDetailsService: CategoryDetailsService,
    private categoriesService: CategoriesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private accountService: AccountService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id_manga = +params['id_manga'];
      this.checkIfFavorited();
      this.getMangaDetails(this.id_manga);
      this.getCategories(this.id_manga);
      this.chapterService.getChaptersByMangaId(this.id_manga).subscribe(
        (data: any) => {
          this.chapters = data;
          this.getReadingHistory(this.id_manga);
        },
        (error) => {
          console.error('Error fetching chapters', error);
        }
      );
    });
  }

  getCategories(id: number) {
    forkJoin({
      categoryDetails: this.categoryDetailsService.getCategoriesByIdManga(id),
      allCategories: this.categoriesService.getAllCategories()
    }).subscribe(({categoryDetails, allCategories}) => {
      this.categoryDetails = categoryDetails;
      this.categories = allCategories;
      this.filteredCategories = this.categories.filter(category =>
        this.categoryDetails.some(detail => detail.idCategory === category.idCategory)
      );
    });

  }

  getMangaDetails(id: number): void {
    this.mangaService.getMangaById(id).subscribe(
      (data) => {
        this.mangaDetails = data;
        console.log(this.mangaDetails);
      },
      (error) => {
        console.error('Error fetching manga details', error);
      }
    );
  }

  async getReadingHistory(id_manga: number) {
    const cookie = await this.accountService.getAccountCookie();
    const id_user = cookie.id_account;
    const numberId = Number(id_user);

    this.mangaHistoryService.getHistory(numberId, id_manga).subscribe(
      (data: History[]) => {
        if (data && data.length > 0) {
          this.histories = data;
          this.updateChaptersWithHistory();
        } else {
          this.histories = [];
        }
      },
      (error) => {
        if (error.status === 404) {
          return;
        }
        console.error('An unexpected error occurred:', error);
      }
    );
  }


  updateChaptersWithHistory() {
    this.chapters.forEach(chapter => {
      chapter.isRead = this.histories.some(history => history.indexChapter === chapter.index);
    });
  }

  async goToChapter(index: number): Promise<void> {
    this.mangaViewHistoryService.createHistory(this.id_manga).subscribe(
      () => {
      },
      (error) => {
        console.error('Error: ', error);
      }
    )
    if (await this.isLoggedIn()) {
      const cookie = await this.accountService.getAccountCookie();
      const id_user = cookie.id_account;
      const numberId = Number(id_user);
      this.mangaHistoryService.addMangaHistory(numberId, this.id_manga, index).subscribe(
        () => {
        },
        (error) => {
          console.error('Error:', error);
        }
      );
    }
    this.router.navigate([`/manga/${this.id_manga}/chapter/${index}`]);
  }

  async isLoggedIn(): Promise<boolean> {
    const cookie = await this.accountService.getAccountCookie();
    const id_user = cookie.id_account;
    return !!(id_user && Number(id_user) != -1);
  }

  toggleRatingSection() {
    this.showRatingSection = !this.showRatingSection;
  }

  selectRating(star: number) {
    this.selectedRatingValue = star;
  }

  confirmRating() {
    if (this.selectedRatingValue > 0) {
      this.confirmationService.confirm({
        message: `Bạn có chắc chắn muốn đánh giá manga này với ${this.selectedRatingValue} sao?`,
        header: 'Xác nhận',
        acceptLabel: 'Đồng ý',
        rejectLabel: 'Hủy',
        acceptButtonStyleClass: 'p-button-success',
        rejectButtonStyleClass: 'p-button-secondary',
        accept: () => {
          this.mangaService.ratingChange(this.id_manga, this.selectedRatingValue)
            .subscribe({
              next: (response) => {
                this.mangaDetails.rating = response.rating;
                this.messageService.add({
                  severity: 'success',
                  summary: 'Thành công',
                  detail: 'Đánh giá đã được cập nhật!'
                });
              },
              error: (error) => {
                console.error('Error updating rating:', error);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Lỗi',
                  detail: 'Cập nhật đánh giá thất bại. Vui lòng thử lại sau.'
                });
              }
            });
          this.toggleRatingSection();
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Chưa chọn đánh giá',
        detail: 'Vui lòng chọn một đánh giá trước khi xác nhận.'
      });
    }
  }

  async checkIfFavorited(): Promise<void> {
    const cookie = await this.accountService.getAccountCookie();
    const id_user = cookie.id_account;
    const userId = Number(id_user);
    if (userId) {
      this.mangaFavoriteService.isFavorited(userId, this.id_manga).subscribe(
        (isFavorited: boolean) => {
          this.isFavorite = isFavorited;
        },
        (error) => {
          console.error('Lỗi khi kiểm tra manga yêu thích:', error);
        }
      );
    }
  }

  async toggleFavorite(): Promise<void> {
    const cookie = await this.accountService.getAccountCookie();
    const id_user = cookie.id_account;
    const userId = Number(id_user);
    if (userId) {
      this.mangaFavoriteService.toggleFavorite(userId, this.id_manga).subscribe(
        () => {
          this.isFavorite = !this.isFavorite;
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: this.isFavorite
              ? 'Đã thêm vào danh sách yêu thích!'
              : 'Đã xóa khỏi danh sách yêu thích!'
          });
        },
        (error) => {
          console.error('Lỗi khi thêm/xóa yêu thích:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Có lỗi xảy ra, vui lòng thử lại sau.'
          });
        }
      );
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Yêu cầu đăng nhập',
        detail: 'Vui lòng đăng nhập để thêm manga vào danh sách yêu thích.'
      });
    }
  }

  sortChapter(ascending: boolean): void {
    this.ascending = !this.ascending;
    this.chapters.sort((a: Chapter, b: Chapter) => {
      return ascending ? a.index - b.index : b.index - a.index;
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

