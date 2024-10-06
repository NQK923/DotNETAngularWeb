import { TestBed } from '@angular/core/testing';
import { InfoAccountService } from './info-account.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';


describe('InfoAccountService', () => {
  let service: InfoAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Thêm vào đây
      providers: [ InfoAccountService]
    });
    service = TestBed.inject(InfoAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
