/**
 * 天气卡片组件
 *
 * 显示城市天气信息，包括当前天气和未来几天预报
 */
import { Card, Divider } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import type { CardProps, WeatherPayload } from '../../types';

/**
 * 获取天气图标
 */
function getWeatherIcon(weather: string): string {
  const icons: Record<string, string> = {
    '晴': '☀️',
    '多云': '⛅',
    '阴': '☁️',
    '小雨': '🌧️',
    '大雨': '⛈️',
    '雪': '❄️',
    '雾': '🌫️',
  };
  return icons[weather] || '🌤️';
}

/**
 * 天气卡片组件
 */
export default function WeatherCard({ payload }: CardProps<WeatherPayload>) {
  const { city, temperature, weather, humidity, wind, forecast } = payload;

  return (
    <Card
      className="shadow-sm"
      styles={{
        body: { padding: '16px' }
      }}
    >
      {/* 当前天气 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <EnvironmentOutlined />
            <span>{city}</span>
          </div>
          <div className="text-4xl font-light mb-2">
            {temperature}°C
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>湿度 {humidity}%</span>
            <span>{wind}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-4xl mb-2">
            {getWeatherIcon(weather)}
          </div>
          <div className="text-gray-600">
            {weather}
          </div>
        </div>
      </div>

      {/* 未来天气预报 */}
      {forecast && forecast.length > 0 && (
        <>
          <Divider className="my-3" />
          <div className="grid grid-cols-2 gap-3">
            {forecast.map((item) => (
              <div
                key={item.date}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <div>
                  <div className="text-xs text-gray-500">{item.date}</div>
                  <div className="text-sm">{item.weather}</div>
                </div>
                <div className="text-right">
                  <span className="text-sm">{getWeatherIcon(item.weather)}</span>
                  <div className="text-xs text-gray-500">
                    {item.low}° / {item.high}°
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
