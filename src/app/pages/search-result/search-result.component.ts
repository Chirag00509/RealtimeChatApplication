import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit {

  constructor(private userService : UserService, private route : ActivatedRoute) {}

  ngOnInit(): void {
    this.getHistory();
  }

  getHistory() {
    const history = this.route.snapshot.params['search'];
    console.log(history);

    this.userService.searchHistory(history).subscribe((res) => {
      console.log(res);
    })
  }

  getUserName(id : string) {
    this.userService.getName(id).subscribe((res) => {
      console.log(res);
    })
  }


}
