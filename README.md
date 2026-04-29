# zccr 命令行工具

这是一个用于控制机器人的命令行工具

## 系统要求

- Node.js 版本 20.20.0 或更高
- Python 解释器（用于运行插件）

## 安装步骤

### 1. 检查 Node.js 版本

打开终端，输入以下命令：

```bash
node --version
```

如果显示的版本号低于 20.20.0，请先 [下载并安装最新版本的 Node.js](https://nodejs.org/)。

### 2. 安装 zccr 命令行工具

```bash
git clone https://github.com/fungqy/zccr-cli.git
cd zccr-cli
npm install -g .
```

### 3. 配置 Python 解释器路径

安装完成后，必须设置 Python 解释器路径（请将 `/path/to/python_interpreter` 替换为你系统上 Python 解释器的实际路径）：

```bash
zccr config --set-python-interpreter /path/to/python_interpreter
```

### 4. 配置插件目录

```bash
zccr config --set-plugin-path /你的插件目录路径
```

## 常用命令

### 查看当前配置

```bash
zccr config
```

### 配置选项

`config` 命令支持以下选项：

| 选项 | 说明 |
|------|------|
| `--set-plugin-path <path>` | 设置插件目录路径 |
| `--set-python-interpreter <path>` | 设置 Python 解释器绝对路径 |

### 查看帮助信息

```bash
zccr --help
```

### 插件命令选项

每个插件命令提供以下选项：

| 选项 | 说明 |
|------|------|
| `-h, --help` | 显示帮助信息 |
| `--info` | 显示插件名称、版本、描述、标签 |
| `--param` | 显示参数信息 |
| `--return` | 显示返回值信息 |
| `--detail` | 显示完整的插件配置信息 |
| `--run [params]` | 执行插件，参数为 JSON 格式 |

### 查看插件帮助

```bash
zccr nav.move_to --help
```

### 查看插件信息

```bash
zccr nav.move_to --info
```

### 查看插件参数

```bash
zccr nav.move_to --param
```

### 查看插件返回值

```bash
zccr nav.move_to --return
```

### 查看完整插件配置

```bash
zccr nav.move_to --detail
```

### 运行插件

```bash
zccr nav.move_to --run '{"x": 1, "y": 2}'
```

### 列出所有插件

```bash
zccr list-plugins
```

该命令会显示插件目录中所有可用的插件及其描述。

### 列出所有机器人

```bash
zccr list-robots
```

该命令会通过执行 Python 脚本从 RCP 服务获取并显示所有机器人状态。

## 插件目录结构

插件必须放在你配置的插件目录下，每个插件是一个单独的文件夹，文件夹中必须包含 `plugin.yaml` 文件。

插件目录结构示例：

```
~/zccr_plugins/
├── nav.move_to/          # 插件文件夹
│   ├── plugin.yaml       # 插件配置文件
│   ├── main.py           # 插件入口脚本（可选）
│   └── scripts/          # 脚本目录（可选）
│       └── nav.move_to.py
└── another.plugin/
    ├── plugin.yaml
    └── main.py
```

## 常见问题

### Q: 运行插件时报错 "Python interpreter not configured"

A: 需要先配置 Python 解释器：
```bash
zccr config --set-python-interpreter /path/to/python_interpreter
```

### Q: 运行插件时报错 "No script found"

A: 确保插件目录中存在 `main.py` 或 `scripts/<插件id>.py` 文件。

### Q: 如何重新安装？

A: 修改源代码后，在项目目录下执行以下命令：
```bash
cd zccr-cli
npm run build && npm install -g .
```

### Q: 如何查看当前配置？

A: 运行 `zccr config` 即可查看。

## 技术支持

如有问题，请联系技术支持团队。
