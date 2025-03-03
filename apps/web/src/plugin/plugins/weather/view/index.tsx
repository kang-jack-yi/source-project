import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useI18n } from '@milesight/shared/src/hooks';
import * as Icons from '@milesight/shared/src/components/icons';
import axios from 'axios';
import { Tooltip } from '../../../view-components';
import { ViewConfigProps } from './typings';
import './style.less';

interface Props {
    config: ViewConfigProps;
    configJson: CustomComponentProps;
}

interface WeatherProps extends Record<string, any> {
    country: string;
    getcity: string;
    province: string;
    data: Record<string, any>[];
    currentDay?: Record<string, any>;
}

const View = (props: Props) => {
    const { config, configJson } = props;
    const { entity, label, icon, bgColor } = config || {};
    const [weatherData, setWeatherData] = useState<WeatherProps | any>({});
    const { isPreview } = configJson;

    /**
     * Request physical state function
     */
    const requestEntityStatus = useCallback(async () => {
        if (!entity) {
            return;
        }
        const res = await getWeatherData();
        if (res) {
            const data: WeatherProps = {
                ...res,
                currentDay: res.data.length > 1 ? res.data[1] : {},
            };
            setWeatherData(data);
        }
    }, [entity]);

    const getWeatherData = useCallback((): Promise<WeatherProps | void> => {
        const url =
            'https://cn.apihz.cn/api/tianqi/tengxun.php?id=88888888&key=88888888&province=福建省&city=厦门市';
        return new Promise(resolve => {
            axios
                .get(url)
                .then(response => {
                    const { data } = response;
                    resolve(data);
                })
                .catch(error => {
                    console.error('请求发生错误：', error);
                    resolve();
                });
        });
    }, []);

    useEffect(() => {
        requestEntityStatus();
    }, [entity]);

    /**
     * Icon component
     */
    const IconComponent = useMemo(() => {
        const IconShow = Reflect.get(Icons, icon);
        if (!IconShow) return null;

        return <IconShow sx={{ fontSize: 24 }} />;
    }, [icon]);

    return (
        <div
            className={`weather-view ${isPreview ? 'weather-view_preview' : ''}`}
            style={{ backgroundColor: bgColor }}
        >
            <div className="weather-view-header">
                {IconComponent}
                <div className="weather-view-header_label">
                    <Tooltip className="weather-view-header_text" autoEllipsis title={label} />
                </div>
            </div>
            {!!weatherData.currentDay && (
                <div className="weather-view-content">
                    <div className="weather-view-content_location">{weatherData.getcity}</div>
                    <div className="weather-view-content_quality">
                        {`${weatherData.currentDay.min_degree}-${weatherData.currentDay.max_degree}`}
                        <sup>°</sup>C
                    </div>
                    <div className="weather-view-content_summary">
                        <span>
                            白天：{weatherData.currentDay.day_weather}&nbsp;&nbsp;
                            {weatherData.currentDay.day_wind_direction}
                            {weatherData.currentDay.day_wind_power}级
                        </span>
                        <span>
                            夜晚：{weatherData.currentDay.night_weather}&nbsp;&nbsp;
                            {weatherData.currentDay.night_wind_direction}
                            {weatherData.currentDay.night_wind_power}级
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default View;
