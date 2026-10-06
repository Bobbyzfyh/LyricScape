# LyricScape

LyricScape 是一个沉浸式歌词可视化 Web App。当前版本采用纯歌词时间轴，可以与 QQ 音乐手动同步，不加载或播放音频。它为后续接入自动歌词对齐与生成式场景预留了清晰边界。

## 运行项目

需要 Node.js 20.19+ 或 22.12+。

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

## 当前功能

- 纯歌词时间轴：播放、暂停、拖动/点击跳转与时间显示
- 导入歌词后，根据最后一句歌词自动计算总时长
- QQ 音乐 QRC、LRC 与 JSON 歌词导入，并统一转换为 `{ start, text }` 结构
- QRC 支持明文/XML、API 十六进制密文及 QQ 音乐 PC 本地缓存二进制；全部在浏览器本地解密
- 基于 `audio.currentTime` 的逐句歌词定位与平滑滚动
- 无音频时使用非常轻微的环境参数保持场景自然运动
- 三个 Canvas/CSS 动画场景：Starry Night、Sunset Ocean、Rainy Window
  - 星空：低频出现的流星与远行火箭，火焰和出现节奏轻微响应高频与能量
  - 日落：随海浪起伏的远景帆船，以及掠过天空的海鸥群
  - 雨夜：湿润街道、双向车流、车灯拖影与城市散景
- 0.9 秒场景交叉淡入淡出
- 内置示例歌词，无需上传文件即可体验
- 自动弱化闲置控制区域、响应式布局与减少动态效果支持

## 歌词格式

### QQ 音乐 QRC

可以直接选择 QQ 音乐的 `.qrc` 歌词文件。解析器兼容逐字时间格式，例如：

```text
[12150,4050]Produced(12150,578) by(12728,578)...
```

当前阶段会把逐字信息聚合为逐句歌词。逐字时间结构已在解析层保留，供 Phase 3 卡拉 OK 高亮使用。

仓库中的 [`public/demo.qrc`](public/demo.qrc) 可用于快速验证导入流程。

LRC：

```lrc
[00:12.42]夜空中最亮的星
[00:16.81]能否听清
```

JSON（也支持 `{ "lyrics": [...] }` 包装）：

```json
[
  { "start": 12.42, "text": "夜空中最亮的星" },
  { "start": 16.81, "text": "能否听清" }
]
```

## 项目结构

```text
src/
├─ components/
│  ├─ lyrics/       # 歌词显示与导入 UI
│  ├─ player/       # 歌词时间轴与进度条
│  └─ scene/        # 场景选择与交叉淡入淡出
├─ composables/
│  ├─ useTimelineClock.js  # 纯歌词计时与播放状态
│  ├─ useLyrics.js         # 歌词定位引擎
│  └─ useSceneCanvas.js    # Canvas 生命周期与 DPR 管理
├─ scenes/          # 独立的音乐响应式场景
├─ stores/          # Pinia 播放器与场景状态
├─ styles/          # 全局样式
└─ utils/           # LRC/JSON 解析与时间格式化
```

## 架构说明

- **Timeline Clock** 提供可播放、暂停、拖动的歌词时间基准。
- **Lyrics Engine** 只消费时间轴提供的当前时间，不接触场景。
- **Scene Engine** 只接收 `energy / bass / mid / treble / beat / progress / currentTime`，不直接控制播放器。

高频视觉动画由各场景内部的 `requestAnimationFrame` 与 Canvas 执行。Vue 只负责低频 UI 状态，避免为每个动画帧更新大量 DOM。

QRC 密文解码使用 MIT 许可的 [`qrc-decoder`](https://github.com/apoint123/qrc-decoder)；QQ 音乐 PC 缓存掩码兼容逻辑参考 MIT 许可的 [`LRC-GET`](https://github.com/valenbine/LRC-GET)。

## 未来计划

- **Phase 2 — AI Lyrics Alignment**：接入后端、Demucs、WhisperX 与自动歌词对齐
- **Phase 3 — Word-Level Karaoke Lyrics**：逐字时间戳与卡拉 OK 高亮
- **Phase 4 — Advanced Music Reactive Scenes**：更精确的节拍、段落与情绪驱动场景
- **Phase 5 — AI Generated Scenes**：根据歌曲内容生成并编排专属视觉世界
