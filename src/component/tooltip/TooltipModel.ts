/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import ComponentModel from '../../model/Component';
import {
    ComponentOption,
    LabelOption,
    LineStyleOption,
    CommonTooltipOption,
    TooltipRenderMode,
    CallbackDataParams
} from '../../util/types';
import {AxisPointerOption} from '../axisPointer/AxisPointerModel';


type TopLevelFormatterParams = CallbackDataParams | CallbackDataParams[];

export interface TooltipOption extends CommonTooltipOption<TopLevelFormatterParams>, ComponentOption {

    axisPointer?: AxisPointerOption & {
        axis?: 'auto' | 'x' | 'y' | 'angle' | 'radius'
        crossStyle?: LineStyleOption & {
            // TODO
            textStyle?: LabelOption
        }
    }
    /**
     * If show popup content
     */
    showContent?: boolean
    /**
     * Trigger only works on coordinate system.
     */
    trigger?: 'item' | 'axis' | 'none'

    displayMode?: 'single' | 'multipleByCoordSys';

    /**
     * 'auto': use html by default, and use non-html if `document` is not defined
     * 'html': use html for tooltip
     * 'richText': use canvas, svg, and etc. for tooltip
     */
    renderMode?: 'auto' | TooltipRenderMode   // TODO richText renamed canvas?

    /**
     * If append popup dom to document.body
     * Only available when renderMode is html
     */
    appendToBody?: boolean
}

class TooltipModel extends ComponentModel<TooltipOption> {
    static type = 'tooltip' as const
    type = TooltipModel.type

    static dependencies = ['axisPointer']

    static defaultOption: TooltipOption = {
        zlevel: 0,

        z: 60,

        show: true,

        // tooltip主体内容
        showContent: true,

        // 'trigger' only works on coordinate system.
        // 'item' | 'axis' | 'none'
        trigger: 'item',

        // 'click' | 'mousemove' | 'none'
        triggerOn: 'mousemove|click',

        alwaysShowContent: false,

        displayMode: 'single', // 'single' | 'multipleByCoordSys'

        renderMode: 'auto', // 'auto' | 'html' | 'richText'

        // 是否约束 content 在 viewRect 中。默认 false 是为了兼容以前版本。
        confine: false,

        showDelay: 0,

        hideDelay: 100,

        // 动画变换时间，单位s
        transitionDuration: 0.4,

        enterable: false,

        backgroundColor: 'rgba(50,50,50,0.7)',

        // 提示边框颜色
        borderColor: '#333',

        // 提示边框圆角，单位px，默认为4
        borderRadius: 4,

        // 提示边框线宽，单位px，默认为0（无边框）
        borderWidth: 0,

        // 提示内边距，单位px，默认各方向内边距为5，
        // 接受数组分别设定上右下左边距，同css
        padding: 5,

        // Extra css text
        extraCssText: '',

        // 坐标轴指示器，坐标轴触发有效
        axisPointer: {
            // 默认为直线
            // 可选为：'line' | 'shadow' | 'cross'
            type: 'line',

            // type 为 line 的时候有效，指定 tooltip line 所在的轴，可选
            // 可选 'x' | 'y' | 'angle' | 'radius' | 'auto'
            // 默认 'auto'，会选择类型为 category 的轴，对于双数值轴，笛卡尔坐标系会默认选择 x 轴
            // 极坐标系会默认选择 angle 轴
            axis: 'auto',

            animation: 'auto',
            animationDurationUpdate: 200,
            animationEasingUpdate: 'exponentialOut',

            crossStyle: {
                color: '#999',
                width: 1,
                type: 'dashed',

                // TODO formatter
                textStyle: {}
            }

            // lineStyle and shadowStyle should not be specified here,
            // otherwise it will always override those styles on option.axisPointer.
        },
        textStyle: {
            color: '#fff',
            fontSize: 14
        }
    }
}

ComponentModel.registerClass(TooltipModel);

export default TooltipModel;