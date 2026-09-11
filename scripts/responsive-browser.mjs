import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

const baseURL = process.env.RESPONSIVE_BASE_URL || 'http://127.0.0.1:5178'
const chromePath = process.env.RESPONSIVE_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const outputDirectory = path.resolve('../.tmp/responsive-qa')
const profileDirectory = await mkdtemp(path.join(tmpdir(), 'blog-responsive-'))
await mkdir(outputDirectory, { recursive: true })
const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profileDirectory}`, 'about:blank'], { windowsHide: true })
const endpoint = await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error('Chrome did not start')), 20000)
  chrome.on('error', reject)
  chrome.stderr.on('data', (chunk) => {
    const match = String(chunk).match(/DevTools listening on (ws:\/\/\S+)/)
    if (match) { clearTimeout(timeout); resolve(match[1]) }
  })
})
let socket
try {
  const address = new URL(endpoint)
  const pages = await fetch(`http://${address.host}/json/list`).then((response) => response.json())
  socket = new WebSocket(pages.find((page) => page.type === 'page').webSocketDebuggerUrl)
  await new Promise((resolve) => { socket.onopen = resolve })
  let sequence = 0
  const pending = new Map()
  socket.onerror = (event) => console.error('DevTools socket error:', event.message)
  socket.onclose = (event) => {
    for (const callback of pending.values()) callback.reject(new Error(`DevTools closed: ${event.code} ${event.reason}`))
    pending.clear()
  }
  const exceptions = []
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data)
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text)
    if (!message.id) return
    const callback = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) callback.reject(new Error(message.error.message))
    else callback.resolve(message.result)
  }
  function command(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++sequence
      const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`DevTools timed out: ${method}`)) }, 20000)
      pending.set(id, { resolve: (value) => { clearTimeout(timeout); resolve(value) }, reject: (error) => { clearTimeout(timeout); reject(error) } })
      socket.send(JSON.stringify({ id, method, params }))
    })
  }
  async function evaluate(expression) {
    const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
    return result.result.value
  }
  async function until(expression) {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await evaluate(expression)) return
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    throw new Error(`Timed out: ${expression}`)
  }
  function fixtures() {
    const nativeFetch = window.fetch.bind(window)
    const image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="800" height="450" fill="#e8d7be"/><text x="50" y="220" font-size="48">Responsive Blog</text></svg>')
    const user = { id: 1, nickname: '移动端测试读者', email: 'reader@example.test', avatar: image, created_at: '2026-09-10T10:00:00Z', status: 1 }
    localStorage.setItem('blog-admin-user', JSON.stringify(user))
    localStorage.setItem('blog-admin-token', 'local-test')
    localStorage.setItem('blog-user', JSON.stringify(user))
    localStorage.setItem('blog-token', 'local-test')
    const articles = [1, 2, 3].map((id) => ({ id, title: `响应式设计与 Go 博客实践 ${id}：手机、平板与桌面的阅读体验`, summary: '通过流式布局和清晰的交互，让文章在不同屏幕上自然呈现。'.repeat(3), content_type: 2, content: '# 响应式阅读\n\n' + '这是一段正文内容。'.repeat(80) + '\n\n## 代码示例\n\n```go\n' + 'fmt.Println("long-code")'.repeat(30) + '\n```\n\n## 图片\n\n![cover](' + image + ')', cover: image, category_id: 1, category_name: 'Go 开发', Category: { name: 'Go 开发' }, tags: 'Go,Vue', status: 2, created_at: '2026-09-10T10:00:00Z', publish_time: '2026-09-10T10:00:00Z', view_count: 1234, like_count: 56, comment_count: 3 }))
    const categories = [1, 2, 3].map((id) => ({ id, name: `Go 开发 ${id}`, description: '分类描述'.repeat(20), sort: id, cover: image, article_count: 3, created_at: user.created_at, updated_at: user.created_at }))
    const links = [{ id: 1, name: '开发者的手记', description: '分享开发心得和阅读记录', url: 'https://example.test/' + 'long-path-'.repeat(20), logo: image, status: 1, sort: 1, created_at: user.created_at }]
    const comments = [{ id: 1, nickname: user.nickname, article_title: articles[0].title, content: '很有帮助的内容。'.repeat(30), article_id: 1, status: 1, created_at: user.created_at }]
    window.responsiveRequests = []
    window.responsiveFixtureMode = 'normal'
    window.fetch = async (input, options = {}) => {
      const url = new URL(typeof input === 'string' ? input : input.url, location.origin)
      if (!url.pathname.startsWith('/api/')) return nativeFetch(input, options)
      window.responsiveRequests.push({ path: url.pathname, method: options.method || 'GET', body: options.body })
      if (window.responsiveFixtureMode === 'error') return Response.json({ code: 500, message: '模拟加载失败' })
      let data = {}
      const route = url.pathname
      if (/settings\/site$/.test(route)) data = { site_title: '懂你 · 开发手记', profile_avatar: image, profile_about: '记录学习与生活。'.repeat(15) }
      else if (route.includes('dashboard')) data = { total_articles: 30, total_views: 5000, published_articles: 24, top_articles: articles, categories, recent_articles: articles, recent_comments: comments, recent_users: [user], trend: Array.from({ length: 14 }, (_, index) => ({ date: `2026-09-${String(index + 1).padStart(2, '0')}`, articles: index, comments: index * 2, users: index })) }
      else if (route.endsWith('/archive')) data = { total: 3, years: [{ year: 2026, count: 3, articles }] }
      else if (route.endsWith('/categories')) data = categories
      else if (route.endsWith('/article-count')) data = { count: 0 }
      else if (route.endsWith('/tags/cloud')) data = [{ name: 'Go', count: 3 }, { name: 'Vue', count: 2 }]
      else if (route.endsWith('/tags')) data = ['Go', 'Vue']
      else if (route.endsWith('/links') || route.endsWith('/friend-links')) data = links
      else if (route.endsWith('/users')) data = { list: [user], total: 30 }
      else if (route.includes('/comments')) data = { list: comments, total: 1 }
      else if (route.endsWith('/ranking') || route.endsWith('/related') || route.includes('/search/')) data = articles
      else if (route.includes('/articles/detail') || /\/admin\/articles\/\d+$/.test(route)) data = { ...articles[0], content_type: url.searchParams.get('id') === '2' ? 1 : 2, ...(url.searchParams.get('id') === '2' ? { content: '<h1>富文本</h1><p>' + 'long-url-'.repeat(40) + '</p><table><tbody><tr>' + '<td>超宽单元格'.repeat(10) + '</td></tr></tbody></table><pre>' + 'long-code'.repeat(100) + '</pre>' } : {}) }
      else if (route.includes('/articles') || route.includes('/drafts')) data = { list: articles, total: 3, has_more: false }
      else if (route.includes('captcha')) data = { captcha_id: 'test', image: image, captcha_image: image }
      else if (route.includes('upload')) data = { url: image }
      else data = user
      if (window.responsiveFixtureMode === 'empty') data = Array.isArray(data) ? [] : { ...data, list: [], total: 0, years: [] }
      return Response.json({ code: 0, data })
    }
  }
  await command('Page.enable')
  await command('Runtime.enable')
  await command('Page.addScriptToEvaluateOnNewDocument', { source: `(${fixtures.toString()})()` })
  await command('Page.navigate', { url: baseURL })
  await until('Boolean(document.querySelector(".post-card"))')
  const routes = ['/', '/categories', '/tags?tag=Go', '/archive', '/links', '/about', '/profile', '/search?keyword=Go', '/posts/1', '/posts/2', '/admin', '/admin/articles', '/admin/drafts', '/admin/comments', '/admin/users', '/admin/categories', '/admin/links', '/admin/site', '/admin/articles/new', '/admin/articles/1/edit', '/admin/articles/1/preview', '/admin/login']
  const results = []
  for (const width of (process.env.RESPONSIVE_INTERACTIONS_ONLY ? [] : [320, 375, 768, 1024, 1440])) {
    await command('Emulation.setDeviceMetricsOverride', { width, height: 850, deviceScaleFactor: 1, mobile: false })
    for (const route of routes) {
      await evaluate(`(async () => { const { default: router } = await import('/src/router/index.js'); await router.push(${JSON.stringify(route)}); await new Promise(resolve => setTimeout(resolve, 350)); })()`)
      const result = await evaluate(`(() => {
        const root = document.documentElement;
        const row = document.querySelector('.admin-main .data-table tbody tr');
        const overflow = [...document.querySelectorAll('body *')].filter(element => {
          const bounds = element.getBoundingClientRect();
          return bounds.width && (bounds.right > innerWidth + 1 || bounds.left < -1) && !element.closest('.table-scroll, pre, .md-editor-code, .md-editor-preview, .w-e-bar, .category-strip__items');
        }).slice(0, 8).map(element => element.className || element.tagName);
        return { route: location.pathname, width: innerWidth, scrollWidth: root.scrollWidth, rowDisplay: row && getComputedStyle(row).display, overflow };
      })()`)
      results.push(result)
      if (result.scrollWidth > result.width + 1) console.log(JSON.stringify(result))
      if (width === 375 && ['/', '/admin/articles', '/posts/1', '/admin/articles/new'].includes(route)) {
        await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
        const shot = await command('Page.captureScreenshot', { format: 'png', fromSurface: false })
        await writeFile(path.join(outputDirectory, `${route.replaceAll('/', '_') || 'home'}-375.png`), Buffer.from(shot.data, 'base64'))
      }
    }
  }
  await command('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 1, mobile: false })
  await evaluate(`(async () => { const { default: router } = await import('/src/router/index.js'); await router.push('/'); })()`)
  await until('Boolean(document.querySelector(".mobile-header"))')
  await evaluate('document.querySelector("button[aria-label=打开导航菜单]").click()')
  await until('Boolean(document.querySelector("dialog[open]"))')
  assert.equal(await evaluate('document.body.style.overflow'), 'hidden')
  await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
  await until('!document.querySelector("dialog[open]")')
  assert.notEqual(await evaluate('document.body.style.overflow'), 'hidden')
  async function navigate(route) {
    await evaluate(`(async () => { const { default: router } = await import('/src/router/index.js'); await router.push(${JSON.stringify(route)}); await new Promise(resolve => setTimeout(resolve, 250)); })()`)
  }
  async function click(selector) { await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`) }
  async function assertFits(selector) {
    const bounds = await evaluate(`(() => { const bounds = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom, width: innerWidth, height: innerHeight }; })()`)
    assert.ok(bounds.left >= -1 && bounds.right <= bounds.width + 1 && bounds.top >= -1 && bounds.bottom <= bounds.height + 1, `${selector} must fit viewport: ${JSON.stringify(bounds)}`)
  }
  await command('Emulation.setDeviceMetricsOverride', { width: 320, height: 568, deviceScaleFactor: 1, mobile: false })
  await navigate('/posts/1')
  await click('.toc-toggle')
  await until('getComputedStyle(document.querySelector(".toc-content")).display !== "none"')
  await click('.toc-toggle')
  await until('getComputedStyle(document.querySelector(".toc-content")).display === "none"')
  await navigate('/admin/articles')
  await click('.admin-menu-button')
  await until('Boolean(document.querySelector("dialog[open]"))')
  await command('Input.dispatchMouseEvent', { type: 'mousePressed', x: 5, y: 200, button: 'left', clickCount: 1 })
  await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 5, y: 200, button: 'left', clickCount: 1 })
  await until('!document.querySelector("dialog[open]")')
  await click('.data-table .btn-danger')
  await until('Boolean(document.querySelector(".confirm-card"))')
  await assertFits('.confirm-card')
  await click('.btn-cancel')
  await until('!document.querySelector(".confirm-card")')
  await navigate('/admin/articles/new')
  await click('.editor-type-switch button:last-child')
  await until('Boolean(document.querySelector(".markdown-editor"))')
  assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'))
  for (const theme of ['dark', 'light']) {
    await evaluate(`document.documentElement.dataset.theme = '${theme}'`)
    for (const route of ['/', '/admin/articles', '/posts/1']) {
      await navigate(route)
      assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'))
    }
  }
  for (const mode of ['empty', 'error']) {
    await evaluate(`window.responsiveFixtureMode = '${mode}'`)
    await navigate('/links')
    await until(mode === 'empty' ? 'document.body.textContent.includes("暂无友情链接")' : 'Boolean(document.querySelector(".state--error"))')
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'))
    await navigate('/')
  }
  await evaluate("window.responsiveFixtureMode = 'normal'")
  await evaluate('document.querySelector("button[aria-label=打开导航菜单]").click()')
  await until('Boolean(document.querySelector("dialog[open]"))')
  await evaluate(`document.querySelector('dialog a[href="/categories"]').click()`)
  await until('location.pathname === "/categories" && !document.querySelector("dialog[open]")')
  await evaluate('document.querySelector("button[aria-label=打开导航菜单]").click()')
  await until('Boolean(document.querySelector("dialog[open]"))')
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 850, deviceScaleFactor: 1, mobile: false })
  await until('!document.querySelector("dialog[open]")')
  assert.notEqual(await evaluate('document.body.style.overflow'), 'hidden')
  const failures = results.filter((result) => result.scrollWidth > result.width + 1 || (result.rowDisplay && result.rowDisplay !== (result.width < 768 ? 'grid' : 'table-row')))
  await writeFile(path.join(outputDirectory, 'results.json'), JSON.stringify({ results, failures, exceptions }, null, 2))
  assert.deepEqual(exceptions, [], 'Browser runtime exceptions')
  assert.deepEqual(failures, [], 'Unexpected overflow or incorrect table/card display')
  console.log(`PASS: ${results.length} viewport/page checks and drawer interactions. Artifacts: ${outputDirectory}`)
} finally {
  socket?.close()
  chrome.kill()
}
