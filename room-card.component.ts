import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/store';
import { SearchState } from 'src/app/store/start-page/start-page.reducer';
import { SwiperOptions } from 'swiper';
import { RoomCardInfo, SearchParams } from '../../interfaces/interface';
import { GalleryModalComponent } from '../gallery-modal/gallery-modal.component';
import * as moment from 'moment';
import { extendMoment } from 'moment-range';
import { ActivatedRoute } from '@angular/router';
const { range } = extendMoment(moment);

import SwiperCore, {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
} from 'swiper/core';

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

@Component({
  selector: 'app-room-card',
  templateUrl: './room-card.component.html',
  styleUrls: ['./room-card.component.scss']
})
export class RoomCardComponent implements OnInit {
  searchParams$: Observable<SearchState>;
  @Input() roomCardInfo: RoomCardInfo;
  @Input() selected: boolean = false;
  @Input() dropdownIsOpened: boolean = false;
  @Input() choosing: boolean = false;
  @Input() horizontal: boolean = false;
  @Output() toggleDropdown: EventEmitter<any> = new EventEmitter<any>();
  @Output() roomChoose = new EventEmitter<any>();
  currency: string = 'rub';
  nights: number = 0;
  guests: number = 0;
  searchQueryParams: any;
  
  constructor(
    public dialog: MatDialog,
    public translateService: TranslateService,
    private store: Store<AppState>,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.searchParams$ = this.store.select(s => s.search);
    this.searchParams$.subscribe(i => {
      this.currency = i.currency;
      const dateRange = range(moment(i.fromDate), moment(i.toDate)).diff('days');
      this.nights = dateRange;
      this.guests = i.adult + i.children.length;
    });

    this.route.queryParams
    .subscribe(params => {
      this.searchQueryParams = params;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    
  }

  openImageViewer() {
    const dialogRef = this.dialog.open(GalleryModalComponent, {
      data: this.roomCardInfo.gallery,
      panelClass: 'galley-modal'
    });
  }

  get _language(): 'en' | 'ru' {
    return (!!this.translateService.currentLang ? this.translateService.currentLang : this.translateService.defaultLang) as 'en' | 'ru';
  }

  get _searchAvailibleQueryParams() {
    return {
      ...this.searchQueryParams,
      fromDate: this.roomCardInfo.availibleDate?.dateFrom || this.searchQueryParams.fromDate,
      toDate: this.roomCardInfo.availibleDate?.dateTo! || this.searchQueryParams.toDate
    }
  }

  onChooseRoom() {
    this.roomChoose.emit(this.roomCardInfo.id);
  }
}
