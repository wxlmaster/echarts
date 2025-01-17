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

import SeriesModel from '../../model/Series';
import createSeriesData from '../helper/createSeriesData';
import {
    SeriesOption,
    SeriesOnCartesianOptionMixin,
    SeriesOnPolarOptionMixin,
    ScaleDataValue,
    DefaultStatesMixin,
    StatesMixinBase
} from '../../util/types';
import GlobalModel from '../../model/Global';
import Cartesian2D from '../../coord/cartesian/Cartesian2D';
import SeriesData from '../../data/SeriesData';
import {dimPermutations} from '../../component/marker/MarkAreaView';
import { each } from 'zrender/src/core/util';
import type Axis2D from '../../coord/cartesian/Axis2D';


export interface BaseBarSeriesOption<StateOption, ExtraStateOption extends StatesMixinBase = DefaultStatesMixin>
    extends SeriesOption<StateOption, ExtraStateOption>,
    SeriesOnCartesianOptionMixin,
    SeriesOnPolarOptionMixin {

    /**
     * Min height of bar
     */
    barMinHeight?: number
    /**
     * Min angle of bar. Avaiable on polar coordinate system
     */
    barMinAngle?: number

    /**
     * Max width of bar. Default to be 1 on cartesian coordinate system. Otherwise it's null
     */
    barMaxWidth?: number

    barMinWidth?: number

    /**
     * Bar width. Will be calculated automatically.
     * Can be pixel width or percent string.
     */
    barWidth?: number | string

    /**
     * Gap between each bar inside category. Default to be 30%. Can be an aboslute pixel value
     */
    barGap?: string | number

    /**
     * Gap between each category. Default to be 20%. can be an absolute pixel value.
     */
    barCategoryGap?: string | number

    large?: boolean
    largeThreshold?: number
}

class BaseBarSeriesModel<Opts extends BaseBarSeriesOption<unknown> = BaseBarSeriesOption<unknown>>
    extends SeriesModel<Opts> {

    static type = 'series.__base_bar__';
    type = BaseBarSeriesModel.type;

    getInitialData(option: Opts, ecModel: GlobalModel): SeriesData {
        return createSeriesData(null, this, {useEncodeDefaulter: true});
    }

    getMarkerPosition(
        value: ScaleDataValue[],
        dims?: typeof dimPermutations[number],
        startingAtTick?: boolean
    ) {
        const coordSys = this.coordinateSystem;
        if (coordSys && coordSys.clampData) {
            // PENDING if clamp ?
            const pt = coordSys.dataToPoint(coordSys.clampData(value));
            if (startingAtTick) {
                each(coordSys.getAxes(), function (axis: Axis2D, idx: number) {
                    // If axis type is category, use tick coords instead
                    if (axis.type === 'category') {
                        const tickCoords = axis.getTicksCoords();
                        let tickIdx = coordSys.clampData(value)[idx];
                        // The index of rightmost tick of markArea is 1 larger than x1/y1 index
                        if (dims && (dims[idx] === 'x1' || dims[idx] === 'y1')) {
                            tickIdx += 1;
                        }
                        (tickIdx > tickCoords.length - 1) && (tickIdx = tickCoords.length - 1);
                        (tickIdx < 0) && (tickIdx = 0);
                        tickCoords[tickIdx] && (pt[idx] = axis.toGlobalCoord(tickCoords[tickIdx].coord));
                    }
                });
            }
            else {
                const data = this.getData();
                const offset = data.getLayout('offset');
                const size = data.getLayout('size');
                const offsetIndex = (coordSys as Cartesian2D).getBaseAxis().isHorizontal() ? 0 : 1;
                pt[offsetIndex] += offset + size / 2;
            }
            return pt;
        }
        return [NaN, NaN];
    }

    static defaultOption: BaseBarSeriesOption<unknown, unknown> = {
        // zlevel: 0,
        z: 2,
        coordinateSystem: 'cartesian2d',
        legendHoverLink: true,
        // stack: null

        // Cartesian coordinate system
        // xAxisIndex: 0,
        // yAxisIndex: 0,

        barMinHeight: 0,
        barMinAngle: 0,
        // cursor: null,

        large: false,
        largeThreshold: 400,
        progressive: 3e3,
        progressiveChunkMode: 'mod'
    };
}

SeriesModel.registerClass(BaseBarSeriesModel);

export default BaseBarSeriesModel;
