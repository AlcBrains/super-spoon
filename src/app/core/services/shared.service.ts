import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private data = new BehaviorSubject('');
  private remaining = new BehaviorSubject([]);

  public data$ = this.data.asObservable();

  public rem$ = this.remaining.asObservable();

  public updateTotalRecords() {
    this.data.next('next!')
  }

  public updateRemaining(data: any[]) {
    this.remaining.next(data);
  }


}