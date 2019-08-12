import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { Record, GroupItem } from 'src/app/models/task.models';
import { taskModeStr, tableDev } from 'src/app/models/jack';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Elongation } from 'src/app/models/live';
import { TensionMm } from 'src/app/Function/device.date.processing';
import { getStageString } from 'src/app/Function/stageString';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.less']
})
export class RecordComponent implements OnInit, OnChanges {
  @Input() GroupData: GroupItem;

  /** 曲线数据 */
  svgData = {
    mpa: null,
    mm: null,
    names: []
  };
  elongation: Elongation;
  holeForm: FormGroup;
  tensionStageArr = null;
  theoryIf = null;
  devModeStr = null;
  holeNames = null;
  stageStr = ['初张拉', '阶段一', '阶段二', '阶段三', '终张拉'];

  constructor(
    private fb: FormBuilder,
    public appS: AppService,
  ) { }

  ngOnInit() {
    // const data = this.GroupData;
    // this.svgData = {
    //   names: taskModeStr[data.mode],
    //   mpa: [],
    //   mm: []
    // };
    // this.svgData.mpa.push(data.record.time);
    // this.svgData.mm.push(data.record.time);
    // const ten = null;
    // this.svgData.names.map(key => {
    //   this.svgData.mpa.push(data.record[key].mapData);
    //   this.svgData.mm.push(data.record[key].mmData);
    // });
    // this.tensionStageArrF();
    // console.log('记录数据处理', this.svgData, this.elongation);
    this.init();
  }
  init() {
    const data = this.GroupData;
    this.svgData = {
      names: taskModeStr[data.mode],
      mpa: [],
      mm: []
    };
    this.svgData.mpa.push(data.record.time);
    this.svgData.mm.push(data.record.time);
    const ten = null;
    this.svgData.names.map(key => {
      this.svgData.mpa.push(data.record[key].mapData);
      this.svgData.mm.push(data.record[key].mmData);
    });
    this.tensionStageArrF();
    console.log('记录数据处理', this.svgData, this.elongation);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('数据变更');
    this.tensionStageArrF();
  }
  // 获取阶段数据
  tensionStageArrF() {
    this.tensionStageArr = [...Array(this.GroupData.tensionStage + 1)];
    this.stageStr = getStageString(this.GroupData);
    const mode = this.GroupData.mode;
    this.theoryIf = tableDev(mode, 4);
    this.devModeStr = taskModeStr[mode];
    this.holeNames = this.GroupData.name.split('/');
    this.elongation = TensionMm(this.GroupData, true);
    console.log('011445445456456456456', this.devModeStr, mode, this.theoryIf);
  }
}
