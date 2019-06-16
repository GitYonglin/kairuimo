import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, Validators, FormBuilder } from '@angular/forms';
import { AppService } from 'src/app/services/app.service';
import { OtherInfo } from 'src/app/models/common';

@Component({
  selector: 'app-add-other',
  templateUrl: './add-other.component.html',
  styleUrls: ['./add-other.component.less']
})
export class AddOtherComponent implements OnInit {
  @Input() validateForm: FormGroup;
  @Input() keys = [];
  @Input() iselect = null;

  get otherInforFormArr(): FormArray {
    return this.validateForm.get('otherInfo') as FormArray;
  }

  constructor(
    public appS: AppService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
  }

  /** 其他信息 */
  createForm(data: Array<OtherInfo> = []) {
    const rarr = data.map(item => {
      return this.otherInfoVisionsForm(item);
    });
    return rarr;
  }
  /** 其他form */
  otherInfoVisionsForm(item = {key: null, value: null}) {
    return this.fb.group({
      /** 名字 */
      key: [item.key, [Validators.required]],
      /** 内容 */
      value: [item.value, [Validators.required]],
    });
  }
  /** 添加其他数据 */
  otherInfoAdd() {
    // tslint:disable-next-line:no-angle-bracket-type-assertion
    const control = <FormArray> this.validateForm.controls.otherInfo;
    control.push(this.otherInfoVisionsForm());
  }
  /** 删除其他数据 */
  otherInfoSub(index) {
    // tslint:disable-next-line:no-angle-bracket-type-assertion
    const control = <FormArray> this.validateForm.controls.otherInfo;
    control.removeAt(index);
  }

  bridgeOtherKeySelect() {
    const arr = this.otherInforFormArr.value.map(v => v.key);
    return this.keys.filter(v =>  arr.indexOf(v) === -1 );
  }
}
