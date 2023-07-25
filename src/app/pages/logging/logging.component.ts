import { Component, OnInit } from '@angular/core';
import { LoggService } from '../../services/logg.service';
import { AbstractControl, FormControl, FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-logging',
  templateUrl: './logging.component.html',
  styleUrls: ['./logging.component.css']
})
export class LoggingComponent implements OnInit {

  loggs: any[] = [];
  allLoggs: any[] = [];
  selectedTimeframe: FormControl = new FormControl('Last 5 mins');
  customStartTime: FormControl = new FormControl();
  customEndTime: FormControl = new FormControl();

  showId = true;
  showIP = true;
  showUsername = true;
  showRequestBody = true;
  showTimestamp = true;


  constructor(private loggService : LoggService, private formBuilder : FormBuilder) {}

  ngOnInit(): void {
    this.getLogDetails();
    this.selectedTimeframe.valueChanges.subscribe((selectedValue) => {
      this.onTimeframeSelection(selectedValue);
    });
  }

  onTimeframeSelection(selectedValue: string) {

    if (selectedValue === 'Custom') {
      this.customStartTime.reset();
      this.customEndTime.reset();
    } else {
      let minutes = 5;
      if (selectedValue === 'Last 10 mins') {
        minutes = 10;
      } else if (selectedValue === 'Last 30 mins') {
        minutes = 30;
      }
      this.filterLogsByTimeframe(minutes);
    }
  }

  getLogDetails() {
    this.loggService.getLogs().subscribe((res) => {
      this.allLoggs  = res;
      const selectedValue = this.selectedTimeframe.value;
      this.onTimeframeSelection(selectedValue);
    });
  }

  filterLogsByTimeframe(minutes: number) {
    const currentTime = new Date();
    const timeThreshold = currentTime.getTime() - minutes * 60000;

    this.loggs = this.allLoggs.filter((log) => {
      const logTimestamp = new Date(log.timeStamp).getTime();
      if (!isNaN(logTimestamp)) {
        return logTimestamp >= timeThreshold;
      }

      return false;
    });

  }

  onCustomTimeframeSelected() {
    const startTime = new Date(this.customStartTime.value).getTime();
    const endTime = new Date(this.customEndTime.value).getTime();

    if (!isNaN(startTime) && !isNaN(endTime) && startTime <= endTime) {
      this.loggs = this.allLoggs.filter((log) => {
        const logTimestamp = new Date(log.timeStamp).getTime();
        return !isNaN(logTimestamp) && logTimestamp >= startTime && logTimestamp <= endTime;
      });
    } else {
      console.log('Invalid custom time range');
    }
  }
}
