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

import {isDimensionStacked} from '../../data/helper/dataStackHelper';
import {map} from 'zrender/src/core/util';
import type Polar from '../../coord/polar/Polar';
import type Cartesian2D from '../../coord/cartesian/Cartesian2D';
import List from '../../data/List';
import Axis from '../../coord/Axis';
import type { LineSeriesOption } from './LineSeries';

interface CoordInfo {
    dataDimsForPoint: string[]
    valueStart: number
    valueAxisDim: string
    baseAxisDim: string
    stacked: boolean
    valueDim: string
    baseDim: string
    baseDataOffset: number
    stackedOverDimension: string
}

export function prepareDataCoordInfo(
    coordSys: Cartesian2D | Polar,
    data: List,
    valueOrigin?: LineSeriesOption['areaStyle']['origin']
): CoordInfo {
    var baseAxis = coordSys.getBaseAxis();
    var valueAxis = coordSys.getOtherAxis(baseAxis as any);
    var valueStart = getValueStart(valueAxis, valueOrigin);

    var baseAxisDim = baseAxis.dim;
    var valueAxisDim = valueAxis.dim;
    var valueDim = data.mapDimension(valueAxisDim);
    var baseDim = data.mapDimension(baseAxisDim);
    var baseDataOffset = valueAxisDim === 'x' || valueAxisDim === 'radius' ? 1 : 0;

    var dims = map(coordSys.dimensions, function (coordDim) {
        return data.mapDimension(coordDim);
    });

    var stacked = false;
    var stackResultDim = data.getCalculationInfo('stackResultDimension');
    if (isDimensionStacked(data, dims[0] /*, dims[1]*/)) { // jshint ignore:line
        stacked = true;
        dims[0] = stackResultDim;
    }
    if (isDimensionStacked(data, dims[1] /*, dims[0]*/)) { // jshint ignore:line
        stacked = true;
        dims[1] = stackResultDim;
    }

    return {
        dataDimsForPoint: dims,
        valueStart: valueStart,
        valueAxisDim: valueAxisDim,
        baseAxisDim: baseAxisDim,
        stacked: !!stacked,
        valueDim: valueDim,
        baseDim: baseDim,
        baseDataOffset: baseDataOffset,
        stackedOverDimension: data.getCalculationInfo('stackedOverDimension')
    };
}

function getValueStart(valueAxis: Axis, valueOrigin: LineSeriesOption['areaStyle']['origin']) {
    var valueStart = 0;
    var extent = valueAxis.scale.getExtent();

    if (valueOrigin === 'start') {
        valueStart = extent[0];
    }
    else if (valueOrigin === 'end') {
        valueStart = extent[1];
    }
    // auto
    else {
        // Both positive
        if (extent[0] > 0) {
            valueStart = extent[0];
        }
        // Both negative
        else if (extent[1] < 0) {
            valueStart = extent[1];
        }
        // If is one positive, and one negative, onZero shall be true
    }

    return valueStart;
}

export function getStackedOnPoint(
    dataCoordInfo: CoordInfo,
    coordSys: Cartesian2D | Polar,
    data: List,
    idx: number
    ) {
    var value = NaN;
    if (dataCoordInfo.stacked) {
        value = data.get(data.getCalculationInfo('stackedOverDimension'), idx) as number;
    }
    if (isNaN(value)) {
        value = dataCoordInfo.valueStart;
    }

    var baseDataOffset = dataCoordInfo.baseDataOffset;
    var stackedData = [];
    stackedData[baseDataOffset] = data.get(dataCoordInfo.baseDim, idx);
    stackedData[1 - baseDataOffset] = value;

    return coordSys.dataToPoint(stackedData);
}