import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Thêm dòng này
import { ChapterService } from './get_chapter.service';

describe('ChapterService', () => {
  let service: ChapterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Thêm vào đây
      providers: [ChapterService]
    });
    service = TestBed.inject(ChapterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});