import * as THREE from 'three'

/**
 * RoboFit 3D 试衣模型构建器
 * 用基础几何体（Box / Cylinder / Sphere）拼接出一个简洁的人形机器人占位模型，
 * 不使用 CapsuleGeometry（避免旧版本 Three.js 兼容性问题）。
 *
 * 返回值：
 *  - group：可直接 add 进场景的 THREE.Group
 *  - materials：所有可被配置面板实时修改的材质引用
 *  - parts：需要单独控制可见性 / 材质替换的部件引用
 */
export function createRobotGroup() {
  const group = new THREE.Group()
  group.name = 'RoboWearRobot'

  // ---------------- 材质定义 ----------------
  // 服装材质：躯干、四肢的"布料"区域共用同一材质，方便统一改色 / 改质感
  const clothingMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2DE2FF'),
    roughness: 0.5,
    metalness: 0.15
  })

  // 裸露机身材质：手、前臂、小腿等未被服装覆盖的金属外壳
  const chassisMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#A7ADB6'),
    roughness: 0.35,
    metalness: 0.75
  })

  // 关节材质：肩 / 肘 / 髋 / 膝球形关节，深灰色哑光金属
  const jointMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#54585F'),
    roughness: 0.4,
    metalness: 0.7
  })

  // 头部基底材质（被面具遮盖的部分仍会显示边缘）
  const headMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#CDD2D9'),
    roughness: 0.4,
    metalness: 0.55
  })

  // 面具材质：随 mask 配置切换颜色与发光强度
  const maskMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#15171B'),
    roughness: 0.45,
    metalness: 0.25,
    emissive: new THREE.Color('#0B5C66'),
    emissiveIntensity: 0.5
  })

  // 假发材质
  const hairMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1B1D21'),
    roughness: 0.75,
    metalness: 0.05
  })

  // 背包材质
  const backpackMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2A2D32'),
    roughness: 0.6,
    metalness: 0.2
  })

  // 鞋履材质（启用配件后替换脚部材质）
  const shoesMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1E2024'),
    roughness: 0.45,
    metalness: 0.35
  })

  const addPair = (mesh, offsetX) => {
    const left = mesh
    left.position.x = -offsetX
    const right = mesh.clone()
    right.position.x = offsetX
    return [left, right]
  }

  // ---------------- 几何构建（自下而上） ----------------

  // 脚
  const footGeo = new THREE.BoxGeometry(0.34, 0.16, 0.6)
  const [footL, footR] = addPair(new THREE.Mesh(footGeo, chassisMaterial.clone()), 0.32)
  footL.position.y = 0.08
  footR.position.y = 0.08
  footL.position.z = 0.08
  footR.position.z = 0.08

  // 小腿
  const shinGeo = new THREE.CylinderGeometry(0.135, 0.155, 0.82, 18)
  const [shinL, shinR] = addPair(new THREE.Mesh(shinGeo, chassisMaterial), 0.32)
  shinL.position.y = shinR.position.y = 0.6

  // 膝关节
  const kneeGeo = new THREE.SphereGeometry(0.155, 18, 14)
  const [kneeL, kneeR] = addPair(new THREE.Mesh(kneeGeo, jointMaterial), 0.32)
  kneeL.position.y = kneeR.position.y = 1.04

  // 大腿（服装覆盖区域）
  const thighGeo = new THREE.CylinderGeometry(0.165, 0.155, 0.82, 18)
  const [thighL, thighR] = addPair(new THREE.Mesh(thighGeo, clothingMaterial), 0.32)
  thighL.position.y = thighR.position.y = 1.5

  // 髋关节
  const hipGeo = new THREE.SphereGeometry(0.18, 18, 14)
  const [hipL, hipR] = addPair(new THREE.Mesh(hipGeo, jointMaterial), 0.33)
  hipL.position.y = hipR.position.y = 1.96

  // 骨盆
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.4, 0.52), clothingMaterial)
  pelvis.position.y = 2.0

  // 躯干
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.06, 1.18, 0.58), clothingMaterial)
  torso.position.y = 2.84

  // 胸前装饰条（科技细节，常驻金属色，不随服装变化）
  const chestDetail = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.08, 0.04),
    jointMaterial
  )
  chestDetail.position.set(0, 3.08, 0.3)

  // 颈部
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.2, 16), chassisMaterial)
  neck.position.y = 3.54

  // 头部
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.58, 0.58), headMaterial)
  head.position.y = 3.97

  // 面具 / 面罩（前脸覆盖板）
  const mask = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.3, 0.07), maskMaterial)
  mask.position.set(0, 4.0, 0.31)

  // 假发组（动态切换内部几何体）
  const hairGroup = new THREE.Group()
  hairGroup.position.set(0, 3.97, 0)
  hairGroup.name = 'hairGroup'

  // 肩关节
  const shoulderGeo = new THREE.SphereGeometry(0.175, 18, 14)
  const [shoulderL, shoulderR] = addPair(new THREE.Mesh(shoulderGeo, jointMaterial), 0.665)
  shoulderL.position.y = shoulderR.position.y = 3.32

  // 上臂（服装覆盖区域）
  const upperArmGeo = new THREE.CylinderGeometry(0.135, 0.125, 0.7, 16)
  const [upperArmL, upperArmR] = addPair(new THREE.Mesh(upperArmGeo, clothingMaterial), 0.665)
  upperArmL.position.y = upperArmR.position.y = 2.86

  // 肘关节
  const elbowGeo = new THREE.SphereGeometry(0.13, 16, 12)
  const [elbowL, elbowR] = addPair(new THREE.Mesh(elbowGeo, jointMaterial), 0.665)
  elbowL.position.y = elbowR.position.y = 2.47

  // 前臂（裸露机身）
  const foreArmGeo = new THREE.CylinderGeometry(0.115, 0.12, 0.6, 16)
  const [foreArmL, foreArmR] = addPair(new THREE.Mesh(foreArmGeo, chassisMaterial), 0.665)
  foreArmL.position.y = foreArmR.position.y = 2.12

  // 手
  const handGeo = new THREE.BoxGeometry(0.2, 0.26, 0.16)
  const [handL, handR] = addPair(new THREE.Mesh(handGeo, chassisMaterial), 0.665)
  handL.position.y = handR.position.y = 1.74

  // 背包（默认隐藏，由配件开关控制）
  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.82, 0.26), backpackMaterial)
  backpack.position.set(0, 2.95, -0.42)
  backpack.visible = false

  group.add(
    footL, footR, shinL, shinR, kneeL, kneeR, thighL, thighR, hipL, hipR,
    pelvis, torso, chestDetail, neck, head, mask, hairGroup,
    shoulderL, shoulderR, upperArmL, upperArmR, elbowL, elbowR, foreArmL, foreArmR, handL, handR,
    backpack
  )

  // 整体下移，使模型重心位于场景原点附近，方便 OrbitControls 环绕
  group.position.y = -2.0

  return {
    group,
    materials: {
      clothingMaterial,
      chassisMaterial,
      jointMaterial,
      headMaterial,
      maskMaterial,
      hairMaterial,
      backpackMaterial,
      shoesMaterial
    },
    parts: { mask, hairGroup, backpack, footL, footR, head }
  }
}

/**
 * 根据假发样式生成对应的几何组合，挂载到 hairGroup 下
 * style: 'short' | 'long' | 'curly' | 'none'
 */
export function buildHairStyle(style, material) {
  const group = new THREE.Group()
  if (style === 'none') return group

  if (style === 'short') {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.345, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), material)
    dome.position.y = 0.13
    group.add(dome)
  }

  if (style === 'long') {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), material)
    dome.position.y = 0.13
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.92, 0.16), material)
    back.position.set(0, -0.32, -0.3)
    const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.7, 0.16), material)
    sideL.position.set(-0.34, -0.22, 0.02)
    const sideR = sideL.clone()
    sideR.position.x = 0.34
    group.add(dome, back, sideL, sideR)
  }

  if (style === 'curly') {
    const rand = (seed) => {
      const x = Math.sin(seed * 999) * 10000
      return x - Math.floor(x)
    }
    let i = 0
    for (let ring = 0; ring < 2; ring++) {
      const count = ring === 0 ? 10 : 6
      const radius = ring === 0 ? 0.36 : 0.24
      const yBase = ring === 0 ? 0.06 : 0.32
      for (let n = 0; n < count; n++) {
        i += 1
        const angle = (n / count) * Math.PI * 2
        const r = radius * (0.85 + rand(i) * 0.3)
        const curl = new THREE.Mesh(new THREE.SphereGeometry(0.1 + rand(i + 1) * 0.05, 12, 10), material)
        curl.position.set(Math.cos(angle) * r, yBase + rand(i + 2) * 0.12, Math.sin(angle) * r * 0.9)
        group.add(curl)
      }
    }
  }

  return group
}

/**
 * 材质风格预设：光滑 / 磨砂 / 金属 / 皮革
 * 通过 roughness / metalness 组合体现不同材质质感
 */
export const MATERIAL_STYLE_PRESETS = {
  smooth: { roughness: 0.22, metalness: 0.12 },
  matte: { roughness: 0.88, metalness: 0.04 },
  metal: { roughness: 0.2, metalness: 0.88 },
  leather: { roughness: 0.62, metalness: 0.06 }
}

/**
 * 面具样式预设：科技极简 / 超写实 / 动漫 / 无
 */
export const MASK_PRESETS = {
  'tech-minimal': { color: '#9FA6AE', emissive: '#2DE2FF', emissiveIntensity: 0.85, roughness: 0.25, metalness: 0.7, visible: true },
  realistic: { color: '#E8C9B0', emissive: '#000000', emissiveIntensity: 0, roughness: 0.55, metalness: 0.05, visible: true },
  anime: { color: '#FF5CA8', emissive: '#7C5CFF', emissiveIntensity: 0.35, roughness: 0.4, metalness: 0.1, visible: true },
  none: { visible: false }
}

/** 三大机型的模型缩放比例（直观体现体型差异） */
export const ROBOT_SCALE = {
  optimus: 1,
  figure: 0.945,
  iron: 1.05
}
