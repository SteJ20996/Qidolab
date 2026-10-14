# Qidolab 部署与检查

源仓库：`SteJ20996/Qidolab`。当前部署使用 Cloudflare Workers 静态资源，配置见 `wrangler.jsonc`；不依赖 GitHub Pages。

1. 在有仓库权限的环境获取当前 main，使用 Node.js 24，执行 `npm ci --ignore-scripts`。
2. 执行 `npm test`。修改 importmap 或内联脚本后，先执行 `npm run build:headers`，再运行检查。
3. Cloudflare 的 Git 集成应连接此仓库的 main。现有部署配置中的静态资源目录为仓库根目录；`.assetsignore` 排除源码文档、测试与工具。
4. 通过现有 Cloudflare Git 部署流程发布；本地使用 Wrangler 时先确认账号及项目为 `qidolab`。不要另建一个同名项目覆盖现有域名设置。
5. 发布后检查 `/`、`/2/`、`/2/experiments/`、`/next/`、`/privacy/` 的响应及四种语言，确认 CSP 不拦截 importmap、游戏和语言模块。`/playtest/` 保持 noindex；Qidoball 为备用入口，不自动推广收录。

资源目前使用 `max-age=0, must-revalidate`，允许复用缓存并向服务器验证。没有完整的内容哈希构建前，不要给全部 JS/CSS 添加一年 immutable。部署后的 HSTS、访问日志及保存期限应在实际 Cloudflare 环境核对，不能仅根据仓库推定。
