// 计算图片覆盖方形取景框所需的最小缩放比例；参数为原图宽高和取景框尺寸；返回缩放比例。
export function coverScale(imageWidth, imageHeight, viewportSize) {
  return Math.max(viewportSize / imageWidth, viewportSize / imageHeight)
}

// 限制拖动后的图片偏移，确保取景框始终被图片覆盖；参数为偏移、渲染尺寸和取景框尺寸；返回合法偏移。
export function clampCropOffset(offset, renderedWidth, renderedHeight, viewportSize) {
  return {
    x: Math.min(0, Math.max(viewportSize - renderedWidth, offset.x)),
    y: Math.min(0, Math.max(viewportSize - renderedHeight, offset.y)),
  }
}

// 将页面取景框的偏移换算为原图裁剪区域；参数为偏移、缩放比例和取景框尺寸；返回原图坐标与边长。
export function cropSourceRect(offset, scale, viewportSize) {
  return {
    sx: -offset.x / scale,
    sy: -offset.y / scale,
    size: viewportSize / scale,
  }
}

// 判断裁剪弹窗是否可以关闭；参数为上传状态和是否由上传成功触发；返回是否允许关闭。
export function canCloseCropModal(uploading, afterUpload = false) {
  return !uploading || afterUpload
}
