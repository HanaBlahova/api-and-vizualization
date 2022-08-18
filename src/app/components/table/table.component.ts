import { Component, OnInit } from '@angular/core';
import { map, switchMap } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit {
  form: FormGroup;
  metrics: Array<string> = ['gp', 'xg60', 'c60'];
  stats: Array<string> = [...this.metrics];
  displayedColumns: string[] = ['team', 'player', 'toi', ...this.metrics];

  competitionUUID: string = '';
  token: string = '';
  data: Array<any> = [];
  loading: boolean = false;

  sortedData: any[];

  constructor(private service: ApiService, private _formBuilder: FormBuilder) {
    this.form = _formBuilder.group({
      selectedStats: new FormArray([
        new FormControl('gp'),
        new FormControl('xg60'),
        new FormControl('c60'),
      ]),
    });
    this.sortedData = this.data.slice();
  }

  ngOnInit(): void {
    this.loadData(this.metrics);
    this.submit();
  }

  loadData(metrics?: Array<string>) {
    this.loading = true;
    let metricsArray: Array<string> = [];
    metrics
      ? (metricsArray = [...metrics])
      : (metricsArray = [...this.metrics]);
    this.service
      .getToken()
      .pipe(
        switchMap((token) => {
          this.token = token.access_token;
          return this.service.getCompetitions(token?.access_token).pipe(
            switchMap((competition) => {
              this.competitionUUID = competition[0]?.competitions[0]?.uuid;
              return this.service.postIndividualStatistic(
                this.competitionUUID,
                this.token,
                metricsArray
              );
            })
          );
        })
      )
      .pipe(
        map((response) => {
          const data = response[0].players.map((player) => {
            return (player = {
              player: player.player,
              team: response[0].team,
              ...player.stats,
            });
          });
          return data;
        })
      )
      .subscribe((response) => {
        this.data = response;
        this.sortedData = response;
        this.loading = false;
      });
  }

  onCheckboxChange(event: any) {
    const selectedStats = this.form.controls['selectedStats'] as FormArray;
    const index = selectedStats.controls.findIndex(
      (x) => x.value === event.source.value
    );
    if (!event.checked) {
      selectedStats.removeAt(index);
    } else {
      selectedStats.push(new FormControl(event.source.value));
    }
    this.submit();
  }

  submit() {
    this.metrics = this.form.value.selectedStats;
    this.displayedColumns = [
      'team',
      'player',
      'toi',
      ...this.form.value.selectedStats,
    ];
    this.loadData(this.form.value.selectedStats);
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  sortData(sort: Sort) {
    const data = this.data.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a: any, b: any) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'team':
          return this.compare(a.team, b.team, isAsc);
        case 'player':
          return this.compare(a.player, b.player, isAsc);
        case 'toi':
          return this.compare(a.toi, b.toi, isAsc);
        case 'gp':
          return this.compare(a.gp, b.gp, isAsc);
        case 'xg60':
          return this.compare(a.xg60, b.xg60, isAsc);
        case 'c60':
          return this.compare(a.c60, b.c60, isAsc);
        default:
          return 0;
      }
    });
  }
}
