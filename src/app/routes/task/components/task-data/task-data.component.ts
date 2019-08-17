import { Component, OnInit, OnChanges, Input, ChangeDetectionStrategy, EventEmitter, Output, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { taskModeStr, Jack, tableDev, modeName } from 'src/app/models/jack';
import { PLCService } from 'src/app/services/PLC.service';
import { AppService } from 'src/app/services/app.service';
import { GroupItem } from 'src/app/models/task.models';
import { getStageString } from 'src/app/Function/stageString';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-data',
  templateUrl: './task-data.component.html',
  styleUrls: ['./task-data.component.less']
})
export class TaskDataComponent implements OnInit, OnDestroy {
  @Input() jackData: Jack;
  @Input() show = null;
  @Input() tensionState =  {
    cls: 0
  };

  tensionStageArr = [];
  devModeStr = [];
  holeNames = [];
  theoryIf: any = {
    zA: 1,
    zB: 1,
    zC: 1,
    zD: 1,
    cA: 0,
    cB: 0,
    cC: 0,
    cD: 0,
  };
  holeForm: FormGroup = this.fb.group([]);
  modeName = modeName;
  stageStr = ['初张拉', '阶段一', '阶段二', '阶段三', '终张拉'];
  stageStrs = [
    [],
    [],
    ['初张拉', '阶段一', '终张拉'],
    ['初张拉', '阶段一', '阶段二', '终张拉'],
    ['初张拉', '阶段一', '阶段二', '阶段三', '终张拉']
  ];
  revamp = false;
  chsub: Subscription = null;

  @Output() updateHole = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    public appS: AppService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.createHoleform();
  }
  ngOnDestroy() {
    if (this.chsub) {
      this.chsub.unsubscribe();
    }
  }
  /** 手动更新 */
  markForCheck() {
    this.cdr.markForCheck();
  }

  /** 创建form */
  createHoleform(data: GroupItem = null, jack: Jack = null) {
    if (!data) {
      return;
    }
    this.jackData = jack;
    console.log(data);
    const group = {
      name: [data.name],
      mode: [data.mode],
      length: [20],
      tensionKn: [0, [Validators.required]],
      steelStrandNumber: [6],
      tensionStage: [3],
      stage: this.fb.array([
        10, 20, 100, 0, 0, 0, 0
      ]),
      time: this.fb.array([
        30, 30, 30, 300, 0, 0, 0
      ]),
      returnMm: [6],
      twice: [false],
      super: [false],
    };
    const names = data ?  taskModeStr[data.mode] : taskModeStr.AB8;
    this.devModeStr = names;
    console.log(data, names, group, this.devModeStr);
    names.map(name =>  {
      group[name] = this.createDevFrom();
    });
    this.holeForm = this.fb.group(group);
    console.log(this.holeForm.value);
    if (data) {
      this.holeForm.reset(data);
      this.stageStr = getStageString(data);
      this.holeForm.reset(data);
    }
    this.tensionStageArrF(true);
    // if (this.tensionState.cls !== 0) {
    //   console.log('jksljfklsd');
    //   this.holeForm.controls.tensionKn.disable();
    // }
    this.cdr.markForCheck();
    this.chsub = this.holeForm.valueChanges.subscribe((e) => {
      // console.log(e, this.holeForm.value);
      this.updateHole.emit(this.holeForm.value);
    });
  }
  /** 创建设备from */
  createDevFrom() {
    return this.fb.group({
      kn: this.fb.array([0, 1, 2, 3, 4, 5, 6]),
      wordMm: [],
      theoryMm: [],
    });
  }
  /** 压力换算计算 */
  inputKn() {
    const mode = this.holeForm.value.mode;
    if (!mode) {
      return;
    }
    const kn = this.holeForm.value.tensionKn;
    const stage = this.holeForm.value.stage;
    // console.log('4564564654', this.jackData);

    taskModeStr[this.holeForm.value.mode].map(d => {
      const a = this.jackData[d].a;
      const b = this.jackData[d].b;
      const value = this.holeForm.value[d];
      console.log(d, value);
      stage.map((s, i) => {
        const sp = s / 100;
        // console.log('a=', a, 'ap=', sp, 'kn=', kn, 'b=', b);
        if (this.jackData.equation) {
          // Mpa = a * Kn + b;
          value.kn[i] = (a * sp * kn + b).toFixed(2);
        } else {
          // Kn = a * Mpa + b;
          value.kn[i] = ((kn * sp - b) / a).toFixed(2);
        }
      });
      this.holeForm.controls[d].setValue(value);
    });
  }
  /** 阶段修改 */
  inputStage(i) {
    const stage = this.holeForm.controls.stage.value;
    console.log(stage);
    if (i === 0) {
      stage[1] = stage[0] * 2;
      this.holeForm.controls.stage.setValue(stage);
    }
    this.inputKn();
    console.log(this.holeForm.value);
  }
  // 切换张拉段数
  onStage() {
    if (this.revamp) {
      this.revamp = false;
      this.tensionStageArrF();
      return;
    }
    console.log(this.holeForm.controls.mode.value);
    const stage = this.holeForm.value.tensionStage;
    this.tensionStageArrF();
    this.stageStr = this.stageStrs[stage];
    console.log('阶段', this.stageStr, stage);
    if (this.holeForm.value.twice) {
      this.onTwice();
    }
    if (this.holeForm.value.super) {
      this.onSuper();
    }
    this.inputKn();
    console.log(this.holeForm.value);
  }
  // 切换二次张拉
  onTwice() {
    const value = this.holeForm.value.twice;
    if (value) {
      this.stageStr.splice(3, 0, '阶段二·2');
    } else {
      this.stageStr.splice(3, 1);
    }
    this.revamp = true;
    this.holeForm.controls.tensionStage.setValue(this.stageStr.length - 1);
    console.log(this.stageStr.length);
    // this.inputKn();
  }

  /**
   * * 超张拉
   * @param value  值
   */
  onSuper() {
    const value = this.holeForm.value.super;
    if (value) {
      this.stageStr.push('超张拉');
    } else {
      this.stageStr.pop();
    }
    console.log(this.stageStr.length);
    this.revamp = true;
    this.holeForm.controls.tensionStage.setValue(this.stageStr.length - 1);
    // this.inputKn();
  }
  // 获取阶段数据
  tensionStageArrF(state = false) {
    const value = this.holeForm.controls.tensionStage.value;
    this.tensionStageArr =  [...Array(value + 1)];
    const stage = this.holeForm.value.stage;
    const time = this.holeForm.value.time;
    if (!state) {
      this.stageStr.map((s, i) => {
        console.log(s);
        switch (s) {
          case '初张拉':
            stage[i] = 10;
            time[i] = 30;
            break;
          case '阶段一':
            stage[i] = 20;
            time[i] = 30;
            break;
          case '阶段二':
            stage[i] = 50;
            if (this.stageStr.indexOf('阶段二·2') > -1) {
              time[i] = 300;
            } else {
              time[i] = 30;
            }
            break;
          case '阶段二·2':
            stage[i] = 50;
            time[i] = 30;
            break;
          case '阶段三':
            stage[i] = 80;
            time[i] = 300;
            break;
          case '终张拉':
            stage[i] = 100;
            time[i] = 300;
            break;
          case '超张拉':
            stage[i] = 103;
            time[i] = 300;
            break;
          default:
            break;
        }
      });
    }
    this.holeForm.controls.stage.setValue(stage);
    this.holeForm.controls.time.setValue(time);
    console.log(this.holeForm.value.stage);
    // console.log(this.tensionStageArr);
    const mode = this.holeForm.controls.mode.value;
    this.theoryIf = tableDev(mode);
    // this.devModeStr = taskModeStr[mode];
    this.holeNames = this.holeForm.value.name.split('/');
    console.log('011445445456456456456', this.theoryIf, mode);
    // this.show = true;
    this.inputKn();
  }
}
