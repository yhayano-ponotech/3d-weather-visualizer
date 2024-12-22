# エラーレポート

## 概要

- 生成日時: 2024-12-21T12:50:51.709Z
- 検出された問題の総数: 12

### 重要度別の内訳

| 重要度 | 件数 |
|--------|------|
| エラー | 12 |

## ファイル別の詳細

### src/services/api/weatherService.ts

| 行 | 重要度 | メッセージ | 該当コード |
|-----|----------|-------------|-------------|
| 75 | エラー | Unexpected any. Specify a different type. |   ): Promise<any> { |

### src/components/Earth/Earth.tsx

| 行 | 重要度 | メッセージ | 該当コード |
|-----|----------|-------------|-------------|
| 4 | エラー | モジュール 'three/examples/jsm/controls/OrbitControls' またはそれに対応する型宣言が見つかりません。 | import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; |
| 34 | エラー | プロパティ 'backgroundColor' は型 'ThreeGlobe' に存在しません。 |       .backgroundColor('rgba(0,0,0,0)') |
| 85 | エラー | 名前 'updateTemperatureVisualization' が見つかりません。 |         updateTemperatureVisualization(weatherData); |
| 88 | エラー | 名前 'updatePrecipitationVisualization' が見つかりません。 |         updatePrecipitationVisualization(weatherData); |
| 91 | エラー | 名前 'updateWindVisualization' が見つかりません。 |         updateWindVisualization(weatherData); |
| 94 | エラー | 名前 'updateCompositeVisualization' が見つかりません。 |         updateCompositeVisualization(weatherData); |
| 6 | エラー | 'createParticleSystem' is defined but never used. | import { createParticleSystem } from '@/utils/visualization/particles'; |
| 7 | エラー | 'mapTemperatureToColor' is defined but never used. | import { mapTemperatureToColor } from '@/utils/colors/colorMapping'; |
| 17 | エラー | Unexpected any. Specify a different type. |   const globeRef = useRef<any>(null); |

### src/app/layout.tsx

| 行 | 重要度 | メッセージ | 該当コード |
|-----|----------|-------------|-------------|
| 20 | エラー | Synchronous scripts should not be used. See: https://nextjs.org/docs/messages/no-sync-scripts |         <script src="https://unpkg.com/three@0.158.0/build/three.min.js" /> |
| 21 | エラー | Synchronous scripts should not be used. See: https://nextjs.org/docs/messages/no-sync-scripts |         <script src="https://unpkg.com/three-globe@2.28.0/dist/three-globe.min.js" /> |

