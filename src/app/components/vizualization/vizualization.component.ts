import { Component, InjectionToken, OnInit } from '@angular/core';
import { ApiService, PlayerType, ShotType } from 'src/app/services/api.service';
import { combineLatest, map, switchMap } from 'rxjs';
import { NoopAnimationPlayer } from '@angular/animations';
import { DialogPosition, MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../core/modal/modal.component';
import { ScrollStrategy } from '@angular/cdk/overlay';

@Component({
  selector: 'app-vizualization',
  templateUrl: './vizualization.component.html',
  styleUrls: ['./vizualization.component.css'],
})
export class VizualizationComponent implements OnInit {
  competitionUUID: string = '';
  token: string = '';
  data: Array<ShotType> = [];
  players: Array<any> = [];
  goals: Array<any> = [];

  teamUUID: string = '';
  loading: boolean = false;
  modalId: any = null;

  constructor(private service: ApiService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service
      .getToken()
      .pipe(
        switchMap((token) => {
          this.token = token.access_token;
          return this.service.getCompetitions(token?.access_token).pipe(
            switchMap((competition) => {
              this.competitionUUID = competition[0]?.competitions[0]?.uuid;
              return this.service
                .getCompetitionDetail(
                  this.token,
                  competition[0]?.competitions[0]?.uuid
                )
                .pipe(
                  switchMap((detail) => {
                    this.teamUUID = detail.teams[0].uuid;
                    return this.service.postShotsOfTeam(
                      this.competitionUUID,
                      detail.teams[0].uuid,
                      this.token
                    );
                  })
                );
            })
          );
        })
      )
      .pipe(
        map((response) => {
          return response.filter((player) => player.x >= 23);
        })
      )
      .subscribe((response: Array<ShotType>) => {
        this.players = response;
        this.data = response;
        this.goals = response.filter((player) => player.type === 'G');
        this.loading = false;
      });
  }

  countX(value: number) {
    return ((value - 23) * 1164) / 77;
  }

  countY(value: number) {
    return ((value + 100) * 1520) / 200;
  }

  onFilter(filter?: string) {
    filter === 'goals' ? (this.data = this.goals) : (this.data = this.players);
  }

  openDialog(player: any, $event: any) {
    const dialogPosition: DialogPosition = {
      top: $event.y + 'px',
      left: $event.x + 'px',
    };
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '400px',
      data: player,
      position: dialogPosition,
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }
}
