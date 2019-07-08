import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DbService } from 'src/app/services/db.service';
import { NzFormatEmitEvent, NzTreeComponent } from 'ng-zorro-antd';
import { AppService } from 'src/app/services/app.service';
import { ElectronService } from 'ngx-electron';
import { PLCService } from 'src/app/services/PLC.service';
import { Elongation } from 'src/app/models/live';
import { TensionMm, mpaToKN, mpaToKNSingle } from 'src/app/Function/device.date.processing';
import { taskModeStr, deviceGroupMode } from 'src/app/models/jack';
import { NzMessageService } from 'ng-zorro-antd';
import { DateFormat } from 'src/app/Function/DateFormat';
import { PLC_D } from 'src/app/models/IPCChannel';
import { DebugData } from 'src/app/models/debug';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.less']
})
export class DebugComponent implements OnInit {
  modeName = '设备未连接';
  mode = [];
  debugData: {[propName: string]: DebugData} = {};
  debugItems = ['m5', 'm10', 'm15', 'm20', 'm25', 'm30', 'm35', 'm40', 'm45', 'm50', 'm55', 'mmSpeed'];
  debugNames = ['5Mpa保压', '10Mpa保压', '15Mpa保压', '20Mpa保压', '25Mpa保压', '30Mpa保压',
                '35Mpa保压', '40Mpa保压', '45Mpa保压', '50Mpa保压', '54.5 ~ 55Mpa安全阀测试', '顶速度'];
  t = [];

  showMpa = 0;

  constructor(
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
    private db: DbService,
    public apps: AppService,
    public e: ElectronService,
    public PLCS: PLCService,
  ) { }

  ngOnInit() {
    this.PLCS.ipcSend('zF03', PLC_D(408), 1).then((data: any) => {
      if (data) {
        /** 设备模式 */
        this.modeName = ['', '一泵四顶', '一泵两顶', '', '一泵一顶'][data.int16[0]];
        this.cdr.markForCheck();
      }
      console.log('获取PLC设备数据', data);
    }).finally(() => {
    });
    this.mode  = deviceGroupMode[4];
    this.mode.map(name => {
      const localStorageName = `debug${this.PLCS.jack.id}${name}`;
      const debugData =  JSON.parse(localStorage.getItem(localStorageName));
      if (!debugData) {
        this.debugData[name] = {
          m5: { date: null},
          m10: { date: null},
          m15: { date: null},
          m20: { date: null},
          m25: { date: null},
          m30: { date: null},
          m35: { date: null},
          m40: { date: null},
          m45: { date: null},
          m50: { date: null},
          m55: { date: null},
          mmSpeed: { date: null},
        };
      } else {
        this.debugData[name] = debugData;
        const i = 1;
        // tslint:disable-next-line: forin
        for (const key in this.debugData[name]) {
          this.debugData[name][key].state = 0;
          const v = this.debugData[name][key];
          if (v.time >= 90 && v.start && v.end) {
            if (v.start - v.end >= 0.5) {
              this.debugData[name][key].state = 1;
            } else {
              this.debugData[name][key].state = 2;
            }
          }
        }
      }
    });

    console.log(this.debugData);
  }

  close() {
    this.apps.debugShow = false;
  }

}
