import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * 真人 avatar 加载器（第二阶段：接入现成 avatar 方案，如 Ready Player Me）
 *
 * 用法：
 *   const handle = await loadAvatar(url)
 *   scene.add(handle.model)
 *   handle.setSkinTone('#E8C9B0')
 *   handle.setSkinFinish({ roughness: 0.55, metalness: 0.05 })
 *   handle.setMorph('mouthSmile', 0.6)   // 捏脸/表情形变（取决于模型自带的 morph target）
 *
 * 说明：自由「捏脸」逐项调节依赖模型自带的 morph target（blend shape）。
 * Ready Player Me 等 avatar 自带 ARKit 表情 morph，可驱动嘴/眼/下颌等；
 * 更精细的五官尺寸捏脸需要模型导出对应的形变通道。
 */

const loader = new GLTFLoader()

// 判断一个材质是否属于「皮肤」区域（RPM 命名约定：Skin / Body / Head / Face）
function isSkinMaterial(name = '') {
  return /skin|body|head|face/i.test(name)
}

export function loadAvatar(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('no avatar url'))
      return
    }
    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene
        const skinMeshes = []
        const morphMeshes = []
        const morphNames = new Set()

        model.traverse((obj) => {
          if (!obj.isMesh) return
          obj.castShadow = true
          obj.receiveShadow = true
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach((mat) => {
            if (mat && isSkinMaterial(mat.name)) skinMeshes.push({ mesh: obj, mat })
          })
          if (obj.morphTargetDictionary) {
            morphMeshes.push(obj)
            Object.keys(obj.morphTargetDictionary).forEach((n) => morphNames.add(n))
          }
        })

        // 记录皮肤材质原始色，调色时在原色基础上做明度偏移，避免破坏贴图色相
        skinMeshes.forEach(({ mat }) => {
          mat.userData.baseColor = mat.color ? mat.color.clone() : new THREE.Color('#ffffff')
        })

        resolve({
          model,
          morphNames: [...morphNames],

          // 皮肤色调：tone 为目标 hex，blend 控制覆盖强度（0~1）
          setSkinTone(hex, blend = 0.6) {
            const target = new THREE.Color(hex)
            skinMeshes.forEach(({ mat }) => {
              if (!mat.color) return
              const base = mat.userData.baseColor || new THREE.Color('#ffffff')
              mat.color.copy(base).lerp(target, blend)
              mat.needsUpdate = true
            })
          },

          // 皮肤质感：roughness / metalness
          setSkinFinish({ roughness, metalness } = {}) {
            skinMeshes.forEach(({ mat }) => {
              if (typeof roughness === 'number') mat.roughness = roughness
              if (typeof metalness === 'number') mat.metalness = metalness
              mat.needsUpdate = true
            })
          },

          // 捏脸/表情：按 morph 名称设置形变强度（0~1）
          setMorph(name, value) {
            morphMeshes.forEach((mesh) => {
              const idx = mesh.morphTargetDictionary?.[name]
              if (idx == null || !mesh.morphTargetInfluences) return
              mesh.morphTargetInfluences[idx] = value
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
