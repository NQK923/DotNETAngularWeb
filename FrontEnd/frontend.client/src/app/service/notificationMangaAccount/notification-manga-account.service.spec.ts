import { TestBed } from '@angular/core/testing';
import { NotificationMangaAccountService } from './notification-manga-account.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('NotificationMangaAccountService', () => {
  let service: NotificationMangaAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Thêm vào đây
      providers: [NotificationMangaAccountService]
    });
    service = TestBed.inject(NotificationMangaAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
