import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MangaService } from '../../../service/Manga/manga.service';
import { ChapterService } from "../../../service/Chapter/chapter.service";
import { AccountService } from "../../../service/Account/account.service";
import { CategoriesService } from "../../../service/Categories/Categories.service";
import { FormControl, NgForm } from "@angular/forms";
import { ModelNotification } from "../../../Model/ModelNotification";
import { NotificationService } from "../../../service/notification/notification.service";
import {
  NotificationMangaAccountService
} from "../../../service/notificationMangaAccount/notification-manga-account.service";
import { ModelNotificationMangaAccount } from "../../../Model/ModelNotificationMangaAccount";
import { CategoryDetailsService } from "../../../service/Category_details/Category_details.service"
import { forkJoin, map } from "rxjs";
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConfirmationService, MessageService } from "primeng/api";
import { MangaViewHistoryService } from "../../../service/MangaViewHistory/MangaViewHistory.service";
import { MangaFavoriteService } from "../../../service/MangaFavorite/manga-favorite.service";
import { InfoAccountService } from '../../../service/InfoAccount/info-account.service';
import { InfoAccountRequest } from '../../../Model/InfoAccount/InfoAccountRequest';
import { AccountCookieResponse } from '../../../Model/Account/AccountCookieResponse';

interface Manga {
  idManga: number;
  name: string;
  author: string;
  numOfChapter: number;
  idAccount: number;
  isPosted: boolean;
  coverImg: string;
  describe: string;
  totalViews: number
  follower: number;
  latestChapter: number;
}

interface Chapter {
  idChapter: number;
  title: string;
  idManga: number;
  createdAt: Date;
  index: number;
}

interface Category {
  idCategory: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-client-manager',
  templateUrl: './client-manager.component.html',
  styleUrls: ['./client-manager.component.css']
})
export class ClientManagerComponent implements OnInit {
  selectedFile: File | null = null;
  searchControl = new FormControl();
  filteredMangas: Manga[] = [];
  selectedChapter: number = 1;
  option: number = 0;
  mangas: Manga[] = [];
  chapterImages: string[] = [];
  chapters: Chapter[] = [];
  selectedFiles: FileList | null = null;
  selectedIdManga: string = '';
  selectedMangaName: string = '';
  chapterName: string = '';
  chapterIndex: string = '';
  isAddingChapter: boolean = false;
  isAddingManga: boolean = false;
  categories: Category[] = [];
  selectedCategories: number[] = [];
  isHidden: boolean = true;
  selectedOption: string = 'option1';
  page: number = 1;
  itemsPerPage: number = 6;
  mangaDetails: Manga = {
    idManga: 0,
    idAccount: 0,
    numOfChapter: 0,
    coverImg: '',
    name: '',
    author: '',
    describe: '',
    isPosted: false,
    follower: 0,
    totalViews: 0,
    latestChapter: 0,
  };
  infoManga: Manga | null = null;
  returnNotification: ModelNotification | null = null;
  url: string | null = null;
  nameUpdate: string | null = null;
  emailUpdate: string | null = null;
  email: string | null = null;
  nameUser: string | null = null;
  idAccount: number | null = null;
  urlImg: string | null = null;
  urlAvatarUser: string | null = null;
  isExternal: boolean = false;
  panel: string = "";
  constructor(private accountService: AccountService, private el: ElementRef,
    private mangaService: MangaService,
    private notificationService: NotificationService,
    private notificationMangaAccountService: NotificationMangaAccountService,
    private categoriesService: CategoriesService,
    private chapterService: ChapterService,
    private categoryDetailsService: CategoryDetailsService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private mangaViewHistoryService: MangaViewHistoryService,
    private mangaFavoriteService: MangaFavoriteService,
    private infoAccountService: InfoAccountService,
  ) {
  }

  ChangeInfomation(panel: string): void {
    this.panel = panel;
  }

  private SetInfoUser() {
    this.accountService.getAccountCookieObservable().subscribe(response => {
      this.infoAccountService.getInfoAccountByIdTN(response.id_account).subscribe(response1 => {
        this.urlAvatarUser = response1.cover_img;
        if (response1.email == "" || response1.email == null) {
          this.isExternal = true;
        }
        else {
          this.email = response1.email;
          this.emailUpdate = response1.email;
        }
        this.nameUser = response1.name;
        this.nameUpdate = response1.name;
      }, error => {
        console.log(error)
      });
    })

  }

  async ngOnInit() {
    this.SetInfoUser()
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filterMangas(searchTerm);
    });
    const cookie = await this.accountService.getAccountCookie();
    const userId = cookie.id_account;
    if (userId) {
      forkJoin({
        mangas: this.mangaService.getMangasByUser(Number(userId)),
        categories: this.categoriesService.getAllCategories()
      }).subscribe({
        next: ({ mangas, categories }) => {
          this.mangas = mangas;
          this.filteredMangas = this.mangas;
          this.categories = categories;
          const observables = this.mangas.map(manga =>
            forkJoin({
              totalViews: this.mangaViewHistoryService.getAllView(manga.idManga),
              followers: this.mangaFavoriteService.countFollower(manga.idManga),
              latestChapter: this.chapterService.getLastedChapter(manga.idManga),
            }).pipe(
              map(({ totalViews, followers, latestChapter }) => {
                manga.totalViews = totalViews;
                manga.follower = followers;
                manga.latestChapter = latestChapter;
                return manga;
              })
            )
          );
          forkJoin(observables).subscribe(updatedMangas => {
            this.mangas = updatedMangas;
            this.filteredMangas = updatedMangas;
          });
          this.setupEventListeners();
        },
        error: (err) => {
          console.error('Error loading data', err);
        }
      });
    } else {
      console.error('User ID not found in localStorage');
    }
  }


  filterMangas(searchTerm: string): void {
    if (searchTerm) {
      this.filteredMangas = this.mangas.filter(manga =>
        manga.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.page = 1;
    } else {
      this.filteredMangas = this.mangas;
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = new File([file], 'Cover' + file.name.substring(file.name.lastIndexOf('.')), {
        type: file.type,
      });
    }
  }

  onImgSelected(event: any, uri: string) {
    const file: File = event.target.files[0];
    if (!file) return;
    const resetSelection = () => {
      this.selectedOption = 'option1';
      this.isHidden = true;
    };
    switch (this.selectedOption) {
      case 'option2':
        this.confirmAction(
          'Bạn có chắc chắn muốn thay thế ảnh hiện tại không?',

          () => this.replaceImg(file, uri),
          resetSelection
        );
        break;
      case 'option3':
        this.confirmAction(
          'Bạn có chắc chắn muốn thêm ảnh vừa chọn vào trước ảnh hiện tại không?',
          () => this.addPreImg(file, uri),
          resetSelection
        );
        break;
      case 'option4':
        this.confirmAction(
          'Bạn có chắc chắn muốn thêm ảnh vừa chọn vào sau ảnh hiện tại không?',
          () => this.addAfterImg(file, uri),
          resetSelection
        );
        break;
      default:
        resetSelection();
    }
  }

  replaceImg(file: File, uri: string) {
    const fileExtension = file.name.split('.').pop();
    const currentNumber = parseFloat(uri.match(/\/(\d+(\.\d+)?)\.\w+$/)?.[1] || '0');
    this.selectedFile = new File([file], `${currentNumber}.${fileExtension}`, {
      type: file.type,
    });
    const formData = new FormData();
    formData.append('files', this.selectedFile);
    formData.append('id_manga', this.selectedIdManga.toString());
    formData.append('index', this.selectedChapter.toString());
    this.chapterService.deleteSingleImg(uri).subscribe(() => {
      const index = this.chapterImages.indexOf(uri);
      if (index !== -1) {
        this.chapterImages.splice(index, 1);
      }
      this.chapterService.uploadSingleImg(formData).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Thêm hình ảnh thành công!' });
        setTimeout(() => {
          this.loadChapterImages(this.selectedChapter);
        }, 2000);
        this.selectedOption = 'option1';
        this.isHidden = true;
      }, error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Thêm hình ảnh thất bại, vui lòng thử lại!'
        });
        console.error(error);
        this.selectedOption = 'option1';
        this.isHidden = true;
      });
    }, error => {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Xóa hình ảnh thất bại, vui lòng thử lại!' });
      console.error(error);
      this.selectedOption = 'option1';
      this.isHidden = true;
    });
  }

  addPreImg(file: File, uri: string) {
    const fileExtension = file.name.split('.').pop();
    const currentIndex = this.chapterImages.indexOf(uri);
    if (currentIndex !== -1) {
      let newNumber: number;
      if (currentIndex == 0) {
        const currentNumber = parseFloat(uri.match(/\/(\d+(\.\d+)?)\.\w+$/)?.[1] || '0');
        newNumber = currentNumber / 2;
      } else {
        const preImage = this.chapterImages[currentIndex - 1];
        const currentNumber = parseFloat(uri.match(/\/(\d+(\.\d+)?)\.\w+$/)?.[1] || '0');
        const preNumber = parseFloat(preImage.match(/\/(\d+\.\d+)\.\w+$/)?.[1] || '0');
        newNumber = (currentNumber + preNumber) / 2;
      }
      const newFileName = `${newNumber}.${fileExtension}`;
      const newUri = uri.replace((/\/(\d+(\.\d+)?)\.\w+$/), `/${newFileName}`);
      this.selectedFile = new File([file], newFileName, {
        type: file.type,
      });
      const formData = new FormData();
      formData.append('files', this.selectedFile);
      formData.append('id_manga', this.selectedIdManga.toString());
      formData.append('index', this.selectedChapter.toString());
      this.chapterService.uploadSingleImg(formData).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Thêm hình ảnh thành công!' });
        this.chapterImages.splice(currentIndex, 0, newUri);
        this.selectedOption = 'option1';
        this.isHidden = true;
      }, error => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Thêm chương thất bại, vui lòng thử lại!' });
        console.log(error);
        this.selectedOption = 'option1';
        this.isHidden = true;
      });
    }
  }

  addAfterImg(file: File, uri: string) {
    const fileExtension = file.name.split('.').pop();
    const currentIndex = this.chapterImages.indexOf(uri);
    if (currentIndex !== -1) {
      let newNumber: number;
      if (currentIndex == this.chapterImages.length - 1) {
        const currentNumber = parseFloat(uri.match(/\/(\d+(\.\d+)?)\.\w+$/)?.[1] || '0');
        newNumber = +currentNumber + 1;
      } else {
        const nextImage = this.chapterImages[currentIndex + 1];
        const currentNumber = parseFloat(uri.match(/\/(\d+(\.\d+)?)\.\w+$/)?.[1] || '0');
        const nextNumber = parseFloat(nextImage.match(/\/(\d+\.\d+)\.\w+$/)?.[1] || '0');
        newNumber = (currentNumber + nextNumber) / 2;
      }
      const newFileName = `${newNumber}.${fileExtension}`;
      const newUri = uri.replace((/\/(\d+(\.\d+)?)\.\w+$/), `/${newFileName}`);
      this.selectedFile = new File([file], newFileName, {
        type: file.type,
      });
      const formData = new FormData();
      formData.append('files', this.selectedFile);
      formData.append('id_manga', this.selectedIdManga.toString());
      formData.append('index', this.selectedChapter.toString());
      this.chapterService.uploadSingleImg(formData).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Thêm hình ảnh thành công!' });
        this.chapterImages.splice(currentIndex + 1, 0, newUri);
        this.selectedOption = 'option1';
        this.isHidden = true;
      }, error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Thêm hình ảnh thất bại, vui lòng thử lại!'
        });
        console.log(error);
        this.selectedOption = 'option1';
        this.isHidden = true;
      });
    }
  }

  onFileChange(event: any) {
    this.selectedFiles = event.target.files;
  }

  addChapter() {
    if (!this.chapterIndex || !this.chapterName || !this.selectedFiles) {
      this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng nhập đủ thông tin' });
      return;
    }
    this.isAddingChapter = true;
    const formData = this.createFormData();
    this.chapterService.addChapter(formData).subscribe(
      () => {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Thêm chương thành công!' });
        this.finalizeAddChapter(formData);
      },
      error => this.handleAddChapterError(error, formData)
    );
  }

  createFormData(): FormData {
    const formData = new FormData();
    // @ts-ignore
    const filesArray = Array.from(this.selectedFiles);
    filesArray.forEach((file, idx) => {
      const renamedFile = new File([file], `${idx + 1}.${file.name.split('.').pop()}`, { type: file.type });
      formData.append('files', renamedFile);
    });
    formData.append('id_manga', this.selectedIdManga.toString());
    formData.append('index', this.chapterIndex.toString());
    formData.append('title', this.chapterName);
    return formData;
  }

  finalizeAddChapter(formData: FormData) {
    this.isAddingChapter = false;
    const idManga = formData.get('id_manga');
    const index = formData.get('index');
    this.addNotification(idManga, index);
    this.mangaService.updateTimeManga(Number(this.selectedIdManga)).subscribe();
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  handleAddChapterError(error: any, formData: FormData) {
    if (error.status === 409) {
      const existingChapter = error.error.existingChapter;
      this.confirmAction(
        `Chương ${this.chapterIndex} đã tồn tại. Bạn có muốn cập nhật không?`,
        () => this.updateChapter(existingChapter.idChapter),
        () => {
          this.isAddingChapter = false;
        }
      );
    } else {
      console.error(error);
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Xảy ra lỗi! Vui lòng thử lại!' });
      this.isAddingChapter = false;
    }
  }

  updateChapter(chapterId: number) {
    const formData = this.createFormData();
    this.chapterService.updateChapter(chapterId, formData).subscribe(
      () => {
        this.finalizeUpdateChapter();
      },
      error => this.handleUpdateChapterError(error)
    );
  }

  finalizeUpdateChapter() {
    this.isAddingChapter = false;
    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật thành công!' });
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  handleUpdateChapterError(error: any) {
    this.isAddingChapter = false;
    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Xảy ra lỗi! Vui lòng thử lại!' });
    console.error(error);
  }

  checkOption(event: any, imageUri: string) {
    this.selectedOption = event.target.value;
    this.isHidden = this.selectedOption === 'option1';
    switch (this.selectedOption) {
      case 'option2':
        this.messageService.add({ severity: 'info', summary: 'Thông báo', detail: 'Hãy chọn ảnh để thay thế' });
        break;
      case 'option3':
      case 'option4':
        this.showAddImageAlert();
        break;
      case 'option5':
        this.confirmAndDeleteImage(imageUri);
        break;
      default:
        this.resetSelection();
        break;
    }
  }

  showAddImageAlert() {
    this.messageService.add({ severity: 'info', summary: 'Thông báo', detail: 'Hãy chọn ảnh cần thêm' });
  }

  confirmAndDeleteImage(imageUri: string) {
    this.confirmAction(
      'Bạn có chắc chắn muốn xóa ảnh này không? Sau khi xóa không thể hoàn tác.',
      () => {
        this.chapterService.deleteSingleImg(imageUri).subscribe(
          () => this.handleDeleteSuccess(imageUri),
          (error) => this.handleDeleteError(error)
        );
      },
      () => {
        this.resetSelection();
      }
    );
  }

  handleDeleteSuccess(imageUri: string) {
    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Xoá hình ảnh thành công!' });
    const index = this.chapterImages.indexOf(imageUri);
    if (index !== -1) {
      this.chapterImages.splice(index, 1);
      this.resetSelection()
    }
  }

  handleDeleteError(error: any) {
    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Xoá hình ảnh thất bại, vui lòng thử lại!' });
    this.resetSelection();
    console.error(error);
  }

  resetSelection() {
    this.selectedOption = 'option1';
    this.isHidden = true;
  }

  loadChapters(): void {
    this.chapterService.getChaptersByMangaId(Number(this.selectedIdManga)).subscribe(chapters => {
      this.chapters = chapters;
      this.selectedChapter = this.chapters[0]?.index || 1;
      this.loadChapterImages(this.selectedChapter);
    });
  }

  loadChapterImages(index: number): void {
    this.chapterService.getImagesByMangaIdAndIndex(Number(this.selectedIdManga), index).subscribe(images => {
      this.chapterImages = images;
    });
  }

  onChapterChange(): void {
    this.loadChapterImages(this.selectedChapter);
  }

  onSubmit(addForm: any) {
    if (this.selectedFile && addForm.controls.name.value && addForm.controls.author.value) {
      this.isAddingManga = true;
      const formData = this.buildFormData(addForm.controls);
      this.uploadOrUpdateManga(formData, 'upload');
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng nhập đủ thông tin!' });
    }
  }

  onSubmitUpdate(form: NgForm): void {
    if (!form.valid) {
      return;
    }
    const formData = this.buildFormData(form.controls);
    this.uploadOrUpdateManga(formData, 'update', Number(this.selectedIdManga));
    this.categoryDetailsService.updateCategoriesDetails(this.selectedCategories).subscribe();
  }

  buildFormData(controls: any): FormData {
    const formData = new FormData();
    formData.append('name', controls.name.value);
    formData.append('author', controls.author.value);
    formData.append('describe', controls.describe.value);
    formData.append('categories', this.selectedCategories.join(','));
    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }
    return formData;
  }

  async uploadOrUpdateManga(formData: FormData, action: 'upload' | 'update', mangaId?: number) {
    const cookie = await this.accountService.getAccountCookie();
    const id_user = cookie.id_account;
    const userId = Number(id_user);

    const mangaServiceMethod = action === 'upload'
      ? this.mangaService.uploadManga(formData, userId)
      : this.mangaService.updateManga(formData, mangaId!);
    mangaServiceMethod.subscribe(
      (data) => this.handleSuccess(action, data),
      (error) => this.handleError(action, error)
    );
  }

  handleSuccess(action: 'upload' | 'update', data: number) {
    const message = action === 'upload' ? 'Thêm truyện thành công!' : 'Cập nhật thành công!';
    if (action === 'upload') {
      this.isAddingManga = false;
      this.selectedCategories.unshift(data);
      this.categoryDetailsService.addCategoriesDetails(this.selectedCategories).subscribe();
    }
    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: message });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }


  handleError(action: 'upload' | 'update', error: any) {
    const message = action === 'upload' ? 'Thêm truyện thất bại, vui lòng thử lại!' : 'Cập nhật thất bại, vui lòng thử lại!';
    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: message });
    this.isAddingManga = false;
    console.error(`${action === 'upload' ? 'Upload' : 'Update'} failed:`, error);
  }


  onCategoryChange(event: any, categoryId: number) {
    if (event.target.checked) {
      if (!this.selectedCategories.includes(categoryId)) {
        this.selectedCategories = [...this.selectedCategories, categoryId];
      }
    } else {
      this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
    }
  }

  deleteChapter(index: number): void {
    this.confirmAction(
      'Bạn có chắc chắn muốn xóa chương này không? Sau khi xóa không thể hoàn tác.',
      () => {
        this.chapterService.deleteSelectedChapter(Number(this.selectedIdManga), index).subscribe(
          () => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Xoá thành công!' });
            this.getAllChapters(Number(this.selectedIdManga));
          },
          (error) => {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Xoá thất bại, vui lòng thử lại!' });
            console.error('Chapter deletion failed:', error);
          }
        );
      },
      () => {
      }
    );
  }

  deleteManga(manga: Manga): void {
    this.confirmAction(
      `Bạn có chắc chắn muốn xoá manga: ${manga.name} không? Sau khi xoá không thể hoàn tác!`,
      () => {
        this.mangaService.deleteMangaById(manga.idManga).subscribe(
          () => {
            this.deleteRelatedData(manga.idManga);
          },
          (error) => {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Xoá thất bại, vui lòng thử lại!' });
            console.error("Manga deletion failed:", error);
          }
        );
      },
      () => {

      }
    );
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

  deleteRelatedData(mangaId: number): void {
    this.chapterService.deleteAllChapter(mangaId).subscribe(
      () => {
        this.handleDeleteMangaSuccess(mangaId);
      },
      (error) => {
        if (error.status === 404) {
          this.handleDeleteMangaSuccess(mangaId);
        } else {
          this.handleDeleteMangaError(error);
        }
      }
    );

    this.categoryDetailsService.getCategoriesByIdManga(mangaId).subscribe(categories => {
      const categoriesToDelete = [mangaId, ...categories.map(c => c.idCategory)];
      this.categoryDetailsService.deleteCategoriesDetails(categoriesToDelete).subscribe();
    });
  }

  handleDeleteMangaSuccess(id: number): void {
    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Xoá thành công!' });
    this.updateUIAfterDelete(id);
  }

  handleDeleteMangaError(error: any): void {
    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Xoá thất bại, vui lòng thử lại!' });
    console.error("Error during deletion:", error);
  }

  updateUIAfterDelete(id: number): void {
    this.filteredMangas = this.filteredMangas.filter(m => m.idManga !== id);
    if ((this.page - 1) * this.itemsPerPage >= this.filteredMangas.length) {
      this.page--;
    }
  }


  toggleAddChap(id: number, name: string): void {
    this.selectedIdManga = id.toString();
    this.selectedMangaName = name;
    const addChapElement = document.getElementById('AddChap');
    if (addChapElement) {
      addChapElement.classList.toggle('hidden');
    }
  }

  toggleDeleteChap(id: number, name: string): void {
    this.selectedIdManga = id.toString();
    this.selectedMangaName = name;
    const deleteChapElement = document.getElementById('deleteChapter');
    if (id != 0) {
      this.getAllChapters(id);
    } else {
      this.chapters = []
    }
    if (deleteChapElement) {
      deleteChapElement.classList.toggle('hidden');
    }
  }

  getAllChapters(id: number) {
    this.chapterService.getChaptersByMangaId(id).subscribe((data: Chapter[]) => {
      this.chapters = data;
    });
  }

  toggleUpdateChap(id: number, name: string): void {
    this.selectedIdManga = id.toString();
    this.selectedMangaName = name;
    const updateChapElement = document.getElementById('updateChapter');
    if (id != 0) {
      this.loadChapters();
    }
    if (updateChapElement) {
      updateChapElement.classList.toggle('hidden');
    }
  }

  toggleUpdateManga(id: number, name: string): void {
    this.selectedIdManga = id.toString();
    this.selectedMangaName = name;
    if (id != 0) {
      this.selectedCategories.push(id);
      this.mangaService.getMangaById(id).subscribe(data => {
        this.mangaDetails = data;
      });
      this.categoryDetailsService.getCategoriesByIdManga(id).subscribe(categories => {
        for (const category of categories) {
          console.log(category);
          this.selectedCategories.push(category.idCategory);
          console.log(this.selectedCategories);
        }
      })
    } else {
      this.selectedCategories = [];
    }
    const addChapElement = document.getElementById('updateManga');
    if (addChapElement) {
      addChapElement.classList.toggle('hidden');
    }
  }

  goToIndex() {
    this.router.navigate(['/']);
  }

  outForm(form: any) {
    form.resetForm();
    const overlay = this.el.nativeElement.querySelector('#overlay');
    overlay.classList.toggle('hidden');
    this.selectedCategories = [];
  }

  setupEventListeners() {
    const buttonAdd = this.el.nativeElement.querySelector('#buttonAdd');
    const overlay = this.el.nativeElement.querySelector('#overlay');
    if (buttonAdd) {
      buttonAdd.addEventListener('click', () => {
        overlay.classList.toggle('hidden');
      });
    }
    const userUpdate = this.el.nativeElement.querySelector('#userUpdate');
    userUpdate.addEventListener('click', () => {
      userOverlay.classList.remove('hidden');
      updateUserOverlay.classList.add('hidden');
    });
    const userButton = this.el.nativeElement.querySelector('#manageStories1');
    const userOverlay = this.el.nativeElement.querySelector('#user');
    const outUser = this.el.nativeElement.querySelector('#outUser');
    if (outUser) {
      outUser.addEventListener('click', () => {
        userOverlay.classList.toggle('hidden');
      });
    }
    if (userButton) {
      userButton.addEventListener('click', () => {
        userOverlay.classList.toggle('hidden');
      });
    }
    const updateUserButton = this.el.nativeElement.querySelector('#updates');
    const updateUserOverlay = this.el.nativeElement.querySelector('#updateUser');
    const outUpdateUser = this.el.nativeElement.querySelector('#outUpdateUser');
    if (outUpdateUser) {
      outUpdateUser.addEventListener('click', () => {
        updateUserOverlay.classList.toggle('hidden');
        userOverlay.classList.add('hidden');
      });
    }
    if (updateUserButton) {
      updateUserButton.addEventListener('click', () => {
        updateUserOverlay.classList.toggle('hidden');
        userOverlay.classList.add('hidden');
      });
    }
  }

  FileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 100;
          canvas.height = 100;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              this.selectedFile = new File([blob], 'Cover_' + file.name, { type: file.type });
            }
          }, file.type);
        };
      };
      reader.readAsDataURL(file);
    }
  }
  // TN update info
  async updateInfoByIdAccount() {
    let cookie: AccountCookieResponse = await this.accountService.getAccountCookie();
    let info: InfoAccountRequest = { id_account: cookie.id_account };

    if (this.nameUpdate == "" || this.emailUpdate == "") {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không bỏ trống dữ liệu.' });
      return;
    }

    if (this.nameUpdate) {
      info.name = this.nameUpdate;
    }

    if (this.emailUpdate) {
      info.email = this.emailUpdate;
    }
    if (this.selectedFile) {
      console.log(this.selectedFile.name);
    }
    this.infoAccountService.updateInfoAccountById(info, this.selectedFile).subscribe(response => {
      if (response == false) {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không có thông tin nào thay đổi.' });
        return;
      }
      else if (response == "Email không hợp lệ") {
        this.emailUpdate = this.email;
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Email không hợp lệ.' });
        return;
      }
      this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Thay đổi thông tin thành công' });
      setTimeout(() => { window.location.reload(); }, 1500);
    });
  }


  logOut() {
    this.accountService.logOut(() => {
      this.router.navigate([`/`]);
    });
  }

  addNotification(id_manga: any, text: any) {
    this.mangaService.getMangaById(id_manga).subscribe({
      next: (manga: Manga) => {
        this.infoManga = manga;
        const textNotification = "Truyện vừa được thêm chương " + text;
        const timestamp = Date.now();
        const typeNoti = "Đã thêm 1 chương mới";
        const time = new Date(timestamp);
        time.setHours(time.getHours() + 7);
        const notification: ModelNotification = {
          content: textNotification,
          time: time,
          typeNoti: typeNoti
        };
        this.mangaFavoriteService.isSendNoti(id_manga).subscribe({
          next: (listId: any[]) => {
            listId.forEach((id_account) => {
              this.notificationService.addNotification(notification).subscribe({
                next: (response) => {
                  this.returnNotification = response;
                  const infoNotification: ModelNotificationMangaAccount = {
                    idNotification: this.returnNotification?.idNotification,
                    idManga: Number(id_manga),
                    idAccount: id_account,
                    isDeleted: false,
                    isRead: false,
                  };
                  this.notificationMangaAccountService.addInfoNotification(infoNotification).subscribe({
                    next: () => {
                    },
                    error: (error) => {
                      console.error('Error adding detailed notification:', error);
                    }
                  });
                },
                error: (error) => {
                  console.error('Error adding notification:', error);
                }
              });
            });
          },
          error: (error) => {
            console.error('Error retrieving listId:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error fetching manga:', error);
      }
    });
  }

  //Pagination
  onPageChange(newPage: number): void {
    this.page = newPage;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
