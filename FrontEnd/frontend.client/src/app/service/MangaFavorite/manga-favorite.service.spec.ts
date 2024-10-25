import {TestBed} from '@angular/core/testing';

import {MangaFavoriteService} from './manga-favorite.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {InfoAccountService} from "../InfoAccount/info-account.service";

describe('MangaFavoriteService', () => {
  let service: MangaFavoriteService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Thêm vào đây
      providers: [InfoAccountService]
    });
    service = TestBed.inject(MangaFavoriteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
