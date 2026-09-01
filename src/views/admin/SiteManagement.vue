<template>
  <section class="site-management">
    <header class="page-header">
      <div>
        <h1 class="page-title">网站管理</h1>
        <p class="page-desc">管理前台的展示入口与站点资料</p>
      </div>
      <span class="preview-badge">已连接</span>
    </header>

    <form class="settings-form" @submit.prevent>
      <section class="settings-section">
        <div class="section-heading">
          <div>
            <h2>功能开关</h2>
            <p>关闭后，前台将按对应状态展示。</p>
          </div>
        </div>

        <div class="setting-list">
          <label class="toggle-row">
            <span><strong>开放注册</strong><small>关闭时，注册入口显示“功能升级中”。</small></span>
            <input v-model="siteSettings.registerEnabled" type="checkbox" />
            <i aria-hidden="true"></i>
          </label>
          <label class="toggle-row">
            <span><strong>分类页面</strong><small>关闭时，前台导航不展示分类入口。</small></span>
            <input v-model="siteSettings.categoriesEnabled" type="checkbox" />
            <i aria-hidden="true"></i>
          </label>
          <label class="toggle-row">
            <span><strong>我的页面</strong><small>关闭时，前台导航不展示“我的”。</small></span>
            <input v-model="siteSettings.profileEnabled" type="checkbox" />
            <i aria-hidden="true"></i>
          </label>
          <label class="toggle-row">
            <span><strong>评论功能</strong><small>关闭时，文章仍展示评论内容，但不可发布评论。</small></span>
            <input v-model="siteSettings.commentsEnabled" type="checkbox" />
            <i aria-hidden="true"></i>
          </label>
        </div>
      </section>

      <section class="settings-section">
        <div class="section-heading">
          <div>
            <h2>站点资料</h2>
            <p>这些内容会展示在前台导航和“我的”页面。</p>
          </div>
        </div>

        <div class="field-grid">
          <label class="field field-wide">
            <span>网站名称</span>
            <input v-model.trim="site.title" maxlength="40" placeholder="例如：懂你" />
          </label>
          <label class="field field-wide">
            <span>头像地址</span>
            <div class="avatar-setting">
              <img v-if="site.author.avatar" :src="site.author.avatar" class="site-avatar" alt="前台头像预览" />
              <span v-else class="site-avatar avatar-placeholder" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="3.2" /><path d="M5 20c.8-3.2 3.1-5 7-5s6.2 1.8 7 5" /></svg>
              </span>
              <button class="avatar-button" type="button" @click="avatarCropVisible = true">设置头像</button>
            </div>
          </label>
          <label class="field">
            <span>GitHub</span>
            <input v-model.trim="site.author.github" type="url" placeholder="https://github.com/username" />
          </label>
          <label class="field">
            <span>Email</span>
            <input v-model.trim="site.author.email" type="email" placeholder="name@example.com" />
          </label>
          <label class="field field-wide about-field">
            <span class="field-label">
              <span>关于我</span>
              <small>{{ site.author.about.length }}/2000</small>
            </span>
            <textarea
              v-model="site.author.about"
              maxlength="2000"
              rows="8"
              placeholder="输入展示在前台“我的”页面中的个人介绍，支持使用换行划分段落。"
            ></textarea>
          </label>
        </div>
      </section>

      <div class="form-footer">
        <p v-if="feedback" class="feedback">{{ feedback }}</p>
        <p>配置保存后会立即应用到 PC 前台。</p>
        <button class="save-button" type="button" :disabled="loading || saving" @click="saveSettings">保存配置</button>
      </div>
    </form>
    <AvatarCropModal :visible="avatarCropVisible" @close="avatarCropVisible = false" @uploaded="handleAvatarUploaded" />
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { site, siteSettings, applySiteSettingsData, buildSiteSettingsPayload } from '../../data/site.js'
import { getAdminSiteSettings, updateAdminSiteSettings } from '../../api/site.js'
import AvatarCropModal from '../../components/AvatarCropModal.vue'

const loading = ref(true)
const saving = ref(false)
const feedback = ref('')
const avatarCropVisible = ref(false)

function editableSettings() {
  return buildSiteSettingsPayload({
    registerEnabled: siteSettings.registerEnabled,
    categoriesEnabled: siteSettings.categoriesEnabled,
    profileEnabled: siteSettings.profileEnabled,
    commentsEnabled: siteSettings.commentsEnabled,
    siteTitle: site.title,
    profileGithub: site.author.github,
    profileEmail: site.author.email,
    profileAvatar: site.author.avatar,
    profileAbout: site.author.about,
  })
}

async function loadSettings() {
  loading.value = true
  try {
    applySiteSettingsData(await getAdminSiteSettings())
  } catch (error) {
    feedback.value = error.message || '配置加载失败'
  } finally {
    loading.value = false
  }
}

async function saveSettings() {
  feedback.value = ''
  saving.value = true
  try {
    await updateAdminSiteSettings(editableSettings())
    feedback.value = '配置保存成功'
    return true
  } catch (error) {
    feedback.value = error.message || '配置保存失败'
    return false
  } finally {
    saving.value = false
  }
}

// handleAvatarUploaded 保存裁剪上传后的头像配置；参数为新头像 URL；返回保存 Promise，失败时恢复原预览。
async function handleAvatarUploaded(url) {
  const previousAvatar = site.author.avatar
  site.author.avatar = url
  if (!await saveSettings()) site.author.avatar = previousAvatar
}

onMounted(loadSettings)
</script>

<style scoped>
.site-management { max-width: 920px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--border-light); }
.page-title { margin: 0; color: var(--heading); font-family: var(--font-serif); font-size: 28px; font-weight: 700; }
.page-desc { margin: 6px 0 0; color: var(--text-muted); font-size: 14px; }
.preview-badge { padding: 5px 9px; border: 1px solid var(--accent-border); border-radius: var(--radius-sm); background: var(--accent-light); color: var(--accent); font-size: 12px; white-space: nowrap; }
.settings-form { padding-top: 10px; }
.settings-section { padding: 30px 0; border-bottom: 1px solid var(--border-light); }
.section-heading { margin-bottom: 16px; }
.section-heading h2 { margin: 0; color: var(--heading); font-size: 17px; font-weight: 650; }
.section-heading p { margin: 5px 0 0; color: var(--text-muted); font-size: 13px; }
.setting-list { border-top: 1px solid var(--border-light); }
.toggle-row { display: grid; grid-template-columns: minmax(0, 1fr) 42px; align-items: center; gap: 20px; min-height: 76px; border-bottom: 1px solid var(--border-light); cursor: pointer; }
.toggle-row span { display: grid; gap: 4px; }
.toggle-row strong { color: var(--text); font-size: 14px; font-weight: 600; }
.toggle-row small { color: var(--text-muted); font-size: 13px; line-height: 1.45; }
.toggle-row input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.toggle-row i { position: relative; width: 42px; height: 24px; border-radius: 12px; background: var(--border); transition: background .2s ease; }
.toggle-row i::after { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0, 0, 0, .18); content: ''; transition: transform .2s ease; }
.toggle-row input:checked + i { background: var(--accent); }
.toggle-row input:checked + i::after { transform: translateX(18px); }
.toggle-row input:focus-visible + i { outline: 2px solid var(--accent); outline-offset: 3px; }
.field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.field { display: grid; gap: 7px; }
.field-wide { grid-column: span 2; }
.field span { color: var(--text-secondary); font-size: 13px; font-weight: 500; }
.field input { box-sizing: border-box; width: 100%; height: 40px; padding: 0 11px; border: 1px solid var(--border); border-radius: var(--radius-sm); outline: none; background: var(--bg); color: var(--text); font: inherit; font-size: 14px; transition: border-color var(--transition), box-shadow var(--transition); }
.field input:focus { border-color: var(--accent-border); box-shadow: 0 0 0 3px var(--accent-light); }
.field-label { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.field-label small { color: var(--text-muted); font-size: 12px; font-weight: 400; }
.about-field textarea { box-sizing: border-box; width: 100%; min-height: 176px; resize: vertical; padding: 12px 13px; border: 1px solid var(--border); border-radius: var(--radius-sm); outline: none; background: var(--bg); color: var(--text); font: inherit; font-size: 14px; line-height: 1.75; transition: border-color var(--transition), box-shadow var(--transition); }
.about-field textarea:focus { border-color: var(--accent-border); box-shadow: 0 0 0 3px var(--accent-light); }
.about-field textarea::placeholder { color: var(--text-muted); }
.avatar-setting { display: flex; align-items: center; gap: 14px; min-height: 56px; }
.site-avatar { display: grid; width: 56px; height: 56px; flex: 0 0 56px; place-items: center; border: 1px solid var(--border); border-radius: 50%; background: var(--bg); color: var(--text-muted); object-fit: cover; }
.avatar-button { height: 36px; padding: 0 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-card); color: var(--text-secondary); cursor: pointer; font: inherit; font-size: 13px; }
.avatar-button:hover { border-color: var(--accent-border); color: var(--accent); }
.form-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 24px 0 0; }
.form-footer p { margin: 0; color: var(--text-muted); font-size: 13px; }
.feedback { color: var(--accent); }
.save-button { min-width: 92px; height: 38px; border: 1px solid var(--accent); border-radius: var(--radius-sm); background: var(--accent); color: #fff; cursor: pointer; font: inherit; font-size: 13px; }
.save-button:disabled { opacity: .55; cursor: not-allowed; }
@media (max-width: 720px) { .page-header, .form-footer { align-items: flex-start; flex-direction: column; } .field-grid { grid-template-columns: 1fr; } .field-wide { grid-column: auto; } }
</style>
