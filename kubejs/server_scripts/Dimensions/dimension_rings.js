// server_scripts/dimension_rings.js

const BORDER_END = 10000        // радиус, после которого перекидывает
const RETURN_OFFSET = 200    // на сколько отодвинуть от края после телепорта

// куда ведёт каждое измерение при выходе за границу
const NEXT_DIM = {
  'minecraft:overworld': 'minecraft:the_end',
  'minecraft:the_end':   'minecraft:overworld',
  'minecraft:nether': 'minecraft:the_end'
  // кольцо замыкается (или вести дальше)
}

const _cooldown = {}   // uuid -> тик, чтобы не телепортить каждый тик

PlayerEvents.tick(event => {
  const p = event.player
  if (!p) return
  if (p.dead || p.health <= 0) return

  const uuid = p.uuid.toString()
  const now = p.age
  if (_cooldown[uuid] && now - _cooldown[uuid] < 40) return  // 2 сек защита

  const dim = p.level.dimension.toString()
  const next = NEXT_DIM[dim]
  if (!next) return

  const dist = Math.max(Math.abs(p.x), Math.abs(p.z))  // квадратная граница
  if (dist < BORDER_END) return

  // определяем, с какой стороны вышел, чтобы поставить у противоположного края
  let nx = p.x, nz = p.z
  if (Math.abs(p.x) >= Math.abs(p.z)) {
    nx = (p.x > 0 ? -(BORDER_END - RETURN_OFFSET) : (BORDER_END - RETURN_OFFSET))
  } else {
    nz = (p.z > 0 ? -(BORDER_END - RETURN_OFFSET) : (BORDER_END - RETURN_OFFSET))
  }

  _cooldown[uuid] = now
  p.setStatusMessage(Text.of('§5Реальность искажается...'))

  // телепорт в другое измерение
  p.runCommandSilent(`execute in ${next} run tp ${p.username} ${nx} 120 ${nz}`)
  // сдвинуть на безопасную высоту после загрузки чанка можно отдельной проверкой
})