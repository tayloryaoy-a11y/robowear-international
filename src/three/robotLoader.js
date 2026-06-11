import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * 通用 GLB 机器人模型加载器（用于接入 Meshy / 扫描等导出的实体模型）。
 *
 * Meshy 导出的 GLB 常常只带 POSITION 顶点（无法线、无 UV、无材质），
 * 因此这里加载后自动：
 *   1) 缺失法线时 computeVertexNormals()，保证受光正常；
 *   2) 统一替换为我们可控的 MeshStandardMaterial，使配色 / 材质工艺能实时驱动整体外观。
 *
 * 用法：
 *   const handle = await loadRobotModel(url)
 *   scene.add(handle.model)
 *   handle.setColor('#2DE2FF')
 *   handle.setFinish({ roughness: 0.4, metalness: 0.6 })
 */

const loader = new GLTFLoader()

export function loadRobotModel(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('no robot model url'))
      return
    }
    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene
        const meshes = []

        model.traverse((obj) => {
          if (!obj.isMesh) return
          obj.castShadow = true
          obj.receiveShadow = true
          // 计算缺失的法线，否则单顶点网格在光照下会全黑 / 平涂异常
          const geo = obj.geometry
          if (geo && !geo.attributes.normal) {
            geo.computeVertexNormals()
          }
          // 统一替换为可控 PBR 材质：金属漆面质感，颜色 / 粗糙度 / 金属度可实时调
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#C8CCD4'),
            metalness: 0.55,
            roughness: 0.42,
            envMapIntensity: 1
          })
          obj.material = mat
          meshes.push(obj)
        })

        resolve({
          model,

          // 整体配色：tone 为目标 hex
          setColor(hex) {
            const c = new THREE.Color(hex)
            meshes.forEach((m) => {
              m.material.color.copy(c)
              m.material.needsUpdate = true
            })
          },

          // 表面工艺：roughness / metalness
          setFinish({ roughness, metalness } = {}) {
            meshes.forEach((m) => {
              if (typeof roughness === 'number') m.material.roughness = roughness
              if (typeof metalness === 'number') m.material.metalness = metalness
              m.material.needsUpdate = true
            })
          },

          dispose() {
            model.traverse((obj) => {
              if (obj.isMesh) {
                obj.geometry?.dispose()
                const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
                mats.forEach((m) => m?.dispose())
              }
            })
          }
        })
      },
      undefined,
      (err) => reject(err)
    )
  })
}
