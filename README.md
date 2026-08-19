# 懂你 Blog 前端

基于 Vue 3 和 Vite 构建的个人博客 PC 前端，提供文章阅读、互动、用户中心及完整的后台管理体验。

## 页面能力

- 首页文章流、文章详情、分类浏览与全文阅读
- 邮箱验证码注册、账号登录、忘记密码
- 文章点赞、评论发布与评论展示
- 用户资料展示、头像与深浅色主题切换
- 站点名称、分类页、个人页、评论与注册功能的动态开关

## 后台管理

- 富文本与 Markdown 两种文章编辑模式，支持封面、标签、摘要与草稿
- 文章、草稿、评论、用户与分类管理
- 分类搜索、拖拽排序、删除前迁移文章
- 网站基础设置、社交链接配置与头像裁剪上传

## 技术栈

- Vue 3
- Vue Router
- Vite
- Pinia
- Axios
- WangEditor
- md-editor-v3

## 本地运行

请先启动同级目录的后端服务，前端开发环境会将 `/api` 和 `/uploads` 代理到 `http://127.0.0.1:8080`。

```bash
npm install
npm run dev
```

开发服务器启动后，按终端显示的地址访问即可。

## 构建部署

```bash
npm run build
```

构建产物位于 `dist` 目录。也可以使用项目内的 Dockerfile 构建静态站点镜像：

```bash
docker build -t blog-web .
docker run -p 80:80 blog-web
```

## 项目结构

```text
src/
├── api/            # 后端接口请求
├── components/     # 通用组件
├── data/           # 前台展示数据与配置
├── stores/         # Pinia 状态管理
├── views/          # 前台页面
└── views/admin/    # 后台管理页面
```

## 相关项目

后端项目位于同级目录：`../blog`。
