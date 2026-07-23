// server_scripts/dimension_wall.js

const BORDER_OVERWORLD = 10000        // радиус границы (квадрат)
const SHOW_DIST = 40       // на каком расстоянии стена становится видна
const WALL_HEIGHT = 30     // высота стены вверх и вниз от игрока
const WALL_STEP = 2        // шаг частиц по высоте (меньше = плотнее)
const WALL_SPREAD = 60     // ширина стены вдоль границы (в блоки в обе стороны)

PlayerEvents.tick(event => {
  const p = event.player
  if (!p) return
  if (p.age % 3 != 0) return   // рисуем не каждый тик — экономим производительность

  const level = p.level
  const dx = Math.abs(p.x)
  const dz = Math.abs(p.z)
  const dist = Math.max(dx, dz)

  if (dist < BORDER_OVERWORLD - SHOW_DIST) return   // далеко — не рисуем

  // определяем, к какой стене ближе (X или Z) и её знак
  const onX = dx >= dz
  const sign = onX ? Math.sign(p.x) : Math.sign(p.z)

  // рисуем вертикальную "простыню" частиц вдоль границы
  for (let off = -WALL_SPREAD; off <= WALL_SPREAD; off += 2) {
    for (let h = -WALL_HEIGHT; h <= WALL_HEIGHT; h += WALL_STEP) {
      let wx, wz
      if (onX) {
        wx = sign * BORDER_OVERWORLD          // стена стоит ровно на границе по X
        wz = p.z + off
      } else {
        wx = p.x + off
        wz = sign * BORDER_OVERWORLD         // стена на границе по Z
      }
      level.spawnParticles(
        'minecraft:reverse_portal',  // яркие тянущиеся частицы
        true,
        wx, p.y + h, wz,
        0, 0, 0,   // без разброса — чёткая плоскость
        1,
        0
      )
    }
  }

  // добавим "гул" по мере приближения
  if (p.age % 40 == 0) {
    p.playNotifySound('minecraft:block.beacon.ambient', 'master', 0.6, 0.5)
  }
})