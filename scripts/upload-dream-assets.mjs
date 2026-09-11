import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const baseURL = process.env.BLOG_API_URL || 'http://127.0.0.1:8080'
const token = process.env.BLOG_ADMIN_TOKEN
if (!token) throw new Error('Set BLOG_ADMIN_TOKEN before uploading dream assets')
const directory = path.resolve('public/picture')
const files = (await readdir(directory)).filter((name) => /\.(png|jpe?g|webp|gif)$/i.test(name)).sort((a, b) => Number.parseInt(a) - Number.parseInt(b))
const uploaded = {}
for (const [index, name] of files.entries()) {
  const form = new FormData()
  form.append('start_index', String(index + 1))
  form.append('files', new Blob([await readFile(path.join(directory, name))]), name)
  const response = await fetch(`${baseURL}/api/admin/dream-assets`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form })
  if (!response.ok) throw new Error(`Upload failed for ${name}: ${response.status} ${await response.text()}`)
  const payload = await response.json()
  uploaded[`image${index + 1}`] = payload.data?.images?.[0]
  console.log(`Uploaded ${name} -> image${index + 1}`)
}
console.log(JSON.stringify(uploaded, null, 2))
