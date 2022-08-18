import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TokenType {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: any;
}

export interface PlayerType {
  player: string;
  stats: any;
  team: string;
}

export interface StatisticType {
  team: string;
  players: Array<PlayerType>;
}

export interface CompetitionType {
  name: string;
  competitions: [
    {
      uuid: string;
      name: string;
      part: string;
    }
  ];
}

export interface ShotType {
  player: string;
  match: string;
  homeTeam: string;
  awayTeam: string;
  time: number;
  gameState: string;
  x: number;
  y: number;
  type: string;
  forecheck: boolean;
  rush: boolean;
  oddManRush: boolean;
  rebounds: boolean;
  reboundsCreated: boolean;
  oneTimer: boolean;
  assisted: boolean;
  inSlot: boolean;
  gateZone: any;
  videoTime: number;
  shotAssist: any;
  videoId: string;
  matchDate: string;
  realTime: string;
  score: {
    home: number;
    away: number;
    state: string;
  };
}
export interface CompetitionDetailType {
  name: string;
  season: string;
  teams: [
    {
      uuid: string;
      name: string;
      shortName: string;
      shortcut: string;
      players: [
        {
          uuid: string;
          name: string;
          surname: string;
          position: string;
          yearOfBirth: number;
          birthday: string;
          age: number;
          jersey: string;
          stick: string;
          height: number;
          weight: number;
          hokejczId: number;
          email: string;
        }
      ];
    }
  ];
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  getToken(): Observable<TokenType> {
    const body = {
      grant_type: 'client_credentials',
      client_id: 'john',
      client_secret: 'doe',
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-VideoCoach': 'd58a6f09-c496-4076-829b-1954fd387f77',
    });
    return this.http.post<TokenType>('/api/token', body, { headers: headers });
  }

  getCompetitions(token: string): Observable<Array<CompetitionType>> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Array<CompetitionType>>('/api/competition', {
      headers: headers,
    });
  }

  getCompetitionDetail(
    token: string,
    competitionUUID: string
  ): Observable<CompetitionDetailType> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<CompetitionDetailType>(
      `/api/competition/${competitionUUID}`,
      {
        headers: headers,
      }
    );
  }

  postIndividualStatistic(
    competitions: string,
    token: string,
    metrics: Array<string>
  ): Observable<Array<StatisticType>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
    const params = {
      gameState: '5:5',
      timeOnIce: 600,
      metrics: metrics,
    };
    return this.http.post<Array<StatisticType>>(
      `/api/individual/${competitions}`,
      params,
      {
        headers: headers,
      }
    );
  }

  postShotsOfTeam(
    competitions: string,
    team: string,
    token: string
  ): Observable<Array<ShotType>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
    const params = {
      matches: ['929236e2-049a-49a4-818d-b28f04af7bdd'],
    };
    return this.http.post<Array<ShotType>>(
      `/api/shot/${competitions}/${team}`,
      params,
      {
        headers: headers,
      }
    );
  }
}
