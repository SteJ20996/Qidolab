# Qidolab 上线教程

更新日期：2026-10-12。适用于独立仓库 `SteJ20996/Qidolab`。

上线流程：GitHub 保存源码 → Cloudflare 发布静态网站 → 绑定 qidolab.com。

## 当前截图：Workers 发布界面

如果页面标题是 `Set up your application`，下面写着 `Configure your Worker project`，并出现 Deploy command、Preview command、API token，就是 Workers 发布界面。直接在这页继续即可。

仓库已加入 `wrangler.jsonc` 和 `.assetsignore`，分别指定网站文件目录、排除部署工具和说明文件。网页内容与答题逻辑保持原样。

### 逐项填写

| 截图中的字段 | 设置 |
| --- | --- |
| Repository | 保持 `SteJ20996/Qidolab` |
| Project name | 改为 `qidolab`，全部小写 |
| Build command | 留空 |
| Deploy command | 保持 `npx wrangler deploy` |
| Preview command | 保持当前默认值 `npx wrangler preview` |
| Enable Preview builds | 保持开启 |
| Protect with Cloudflare Access | 保持关闭 |
| Advanced settings → Path | 保持 `/`，表示仓库根目录 |
| API token | 保持 `Create new token` |
| API token name | 填 `qidolab-deploy` |
| Variable name | 留空 |
| Variable value | 留空 |

Project name 中的 `Qidolab` 要改成小写 `qidolab`，这是截图里红色提示的原因。GitHub 仓库名称仍可保持 `Qidolab`。

Build command 是可选项，这套网页无需编译。Deploy command 读取仓库里的 Wrangler 配置并发布静态网页。Preview command 用于非生产分支的预览，沿用当前界面的默认命令。

API token 由 Cloudflare 在这个流程中自动创建；这里填写的是名称 `qidolab-deploy`。变量部分无需添加内容。

向下滚动，点击页面的创建或部署按钮。如果出现分支选择，生产分支选 `main`。等待部署完成；部署失败时保存构建日志里的具体报错。

### 发布后检查与绑定域名

1. 打开后台实际提供的 `.workers.dev` 网址，检查 Qidolab 首页、题目和语言菜单。
2. 打开这个 Worker 的 `Settings → Domains & Routes → Add → Custom Domain`。
3. 输入 `qidolab.com`，点击 `Add Custom Domain`，按提示确认。
4. Cloudflare 会配置所需 DNS 记录和证书。等待域名生效后，打开 https://qidolab.com/ ，检查能否正常显示网页且没有证书警告。

正式站应能显示 18 道题。打开一两题，操作互动图、提交答案，再检查后续挑战和查看答案入口。语言菜单应包含 English、简体中文、繁體中文、Español；无痕窗口首次进入默认英文，普通窗口保留已保存的语言偏好。

个人主页仓库里的 `qidolab/` 和 `qidolab-preview/` 已移除，旧的 stephenjia.com 试玩地址已停用。以后以独立仓库和 Cloudflare 发布的网址为准。旧试玩地址的浏览器进度不会自动转移到 qidolab.com。

### 当前界面的常见问题

| 现象 | 检查方式 |
| --- | --- |
| Project name 下出现红字 | 使用全部小写的 `qidolab` |
| Missing entry-point 或找不到静态文件目录 | 确认使用更新后的 `main` 分支，根目录有 `wrangler.jsonc`，Path 为 `/` |
| 构建命令报错 | Build command 留空；Deploy command 为 `npx wrangler deploy` |
| 临时网址正常，正式域名打不开 | 检查 Worker 的 Domains & Routes 中是否已添加域名，以及域名、证书状态 |
| 首次打开不是英文 | 使用无痕窗口检查；普通窗口可能保留上次语言选择 |

## 另一种界面：Cloudflare Pages

下面的步骤仅适用于 Pages 创建界面：该界面有 Framework preset 和 Build output directory。这两套设置分别用于各自的界面。

## 1. 确认源码已经准备好

打开 https://github.com/SteJ20996/Qidolab ，选择 `main` 分支。仓库根目录应当能直接看到 `index.html`、`i18n.mjs`、`theme.css`、`_headers` 和 `assets` 文件夹。

这是一套静态网页，直接使用仓库里的文件发布，不需要安装 Node.js 或运行编译命令。正式版包含 18 道原题、后续挑战、极限挑战，以及英文、简体中文、台湾繁体中文和西班牙文界面。

## 2. 找到 Cloudflare 的应用部署入口

打开 Cloudflare 官方文档提供的 [Workers & Pages 入口](https://dash.cloudflare.com/?to=/:account/workers-and-pages)，登录购买 qidolab.com 时使用的账户。如果出现账户选择，选择管理 qidolab.com 的那个账户。

如果你仍然停留在标题为 `qidolab.com` 的 Overview 页面，左侧显示 DNS、SSL/TLS、Caching、Workers Routes，说明当前在域名设置层级。可以先点左上角 `Back to Domains` 返回，再使用上面的入口进入账户级别的 Workers & Pages。

进入后点击 `Create application`，选择 `Pages`，再选择 Git 仓库导入。官方文档中这个按钮有 `Connect to Git` 和 `Import an existing Git repository` 两种写法，按实际出现的入口操作即可。

如果打开的创建界面默认显示 Workers，先找到 Pages 的标签或入口，继续创建 Pages 项目。若界面仍不同，保存当前截图，按截图核对下一步。

## 3. 连接 GitHub，选择 Qidolab

选择 GitHub，登录 `SteJ20996`。按提示授权 Cloudflare 访问 `Qidolab` 仓库；如果使用 `Only select repositories`，选中 `Qidolab`。

回到 Cloudflare 的仓库列表，选择 `SteJ20996/Qidolab`，然后点击 `Begin setup`。如果列表没有这个仓库，检查 Cloudflare 的 GitHub 仓库访问权限是否包含新建的 Qidolab，再刷新列表。

## 4. 填写发布设置

在 `Set up builds and deployments` 页面按下表设置：

| 设置 | 内容 |
| --- | --- |
| Repository | `SteJ20996/Qidolab` |
| Project name | `qidolab`；如果不可用，使用 `qidolab-app` |
| Production branch | `main` |
| Framework preset | `None` |
| Root directory (advanced) → Path | 留空，使用仓库根目录 |
| Build command | `exit 0` |
| Build output directory | `.`，一个英文句点 |
| Environment variables | 留空 |

新仓库的 `index.html` 已经放在根目录，因此 Root directory 保持空白。之前在个人网站仓库中使用的 `qidolab` 子目录设置，已不适用于这个独立仓库。输出目录填写 `.`，表示发布根目录里的文件。

确认后点击 `Save and Deploy`，等待部署成功。

## 5. 先测试 Cloudflare 提供的网址

成功后点击后台实际提供的 `.pages.dev` 网址。项目名称会影响这个临时网址，最终网址以后台显示为准。

检查首页能显示 18 道题，打开一两题操作互动图、提交答案，并检查后续挑战和查看答案入口。语言菜单应包含 English、简体中文、繁體中文、Español；无痕窗口首次进入默认英文，普通窗口会保留已保存的语言偏好。

如果页面显示 404，检查根目录是否留空、输出目录是否为 `.`，以及 GitHub 的 `main` 分支根目录是否有 `index.html`。部署失败时打开该次部署的构建日志，保存具体报错。

## 6. 绑定 qidolab.com

测试正常后点击 `Continue to project`，进入这个 Pages 项目的 `Custom domains`，点击 `Set up a domain`。

输入 `qidolab.com`，点击 `Continue`，按提示确认 DNS 记录。域名字段只填写域名本身。

qidolab.com 已在 Cloudflare 管理；Pages 项目与域名在同一个账户时，Cloudflare 可以在确认后添加所需 DNS 记录。域名应先在 Pages 的 Custom domains 中关联，再按提示配置 DNS。

等待域名状态显示 `Active`，HTTPS 生效后打开 https://qidolab.com/ 。确认能正常显示 Qidolab，且没有证书警告。生效时间以后台状态为准。

## 7. 正式上线后

在手机和电脑分别打开正式网址，检查首页、题目、语言切换与保存进度。以后把代码更新合并到这个仓库的 `main` 分支，连接的 Cloudflare Pages 项目会自动部署。

个人主页仓库里的 `qidolab/` 和 `qidolab-preview/` 已移除，旧的 stephenjia.com 试玩地址已停用。以后以这个独立仓库和 Cloudflare Pages 发布的网址为准。旧试玩地址和 qidolab.com 使用不同的浏览器存储空间，旧试玩进度不会自动转移到新域名。

## 常见问题

| 现象 | 优先检查 |
| --- | --- |
| 找不到 Workers & Pages | 使用上面的官方入口，并确认已回到账户级别 |
| 找不到 Qidolab 仓库 | GitHub 账户与 Cloudflare 的仓库访问授权 |
| 部署失败 | 根目录留空、命令 `exit 0`、输出目录 `.`；查看具体构建日志 |
| `.pages.dev` 显示 404 | `main` 分支根目录中的 `index.html` 与构建目录设置 |
| 临时网址正常，正式域名打不开 | Pages 的 Custom domains 关联状态与 DNS 是否已生效 |
| 首次打开不是英文 | 使用无痕窗口检查；普通窗口可能保留了之前的语言选择 |

## 核对过的官方说明

- [Workers 静态网站](https://developers.cloudflare.com/workers/static-assets/)
- [Workers 静态目录与忽略文件](https://developers.cloudflare.com/workers/static-assets/binding/)
- [Workers 构建与发布配置](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Workers 自定义域名](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)

- [Git 仓库连接与发布](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [静态 HTML 网站发布](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
- [构建目录设置](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [自定义域名设置](https://developers.cloudflare.com/pages/configuration/custom-domains/)

Cloudflare 后台可能继续改版；按钮名称以当前界面为准。本教程的仓库、根目录、发布命令和输出目录是针对本项目的具体设置。
