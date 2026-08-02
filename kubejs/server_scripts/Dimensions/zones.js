// ============================================================
//  СИСТЕМА ЗОН + ГЛИТЧ-ТЕГ ДЛЯ НЕЗЕРА (null-sec)
//  Обновляет префикс в TAB только при СМЕНЕ зоны
// ============================================================

console.info('[ZONES] Скрипт зон загружен')

let zoneTick = 0
let lastZone = {}   // запоминаем прошлую зону каждого игрока

ServerEvents.tick(event => {
  // проверяем раз в секунду (20 тиков), а не каждый тик
  zoneTick++
  if (zoneTick < 20) return
  zoneTick = 0

  event.server.players.forEach(player => {
    let dim = String(player.level.dimension)
    let zone, prefix

    // ---------- ОПРЕДЕЛЕНИЕ ЗОНЫ ----------
    if (dim.includes('the_nether')) {
      // АД = null-sec, анимированный глитч-тег
      zone = 'nether'; prefix = '%animation:nether_glitch%'

    } else if (dim.includes('the_end')) {
      // ЭНД
      zone = 'end';    prefix = '&5&l[ЭНД]&r '

    } else {
      // ОБЫЧНЫЙ МИР — считаем по дистанции от 0,0
      let dist = Math.sqrt(player.x * player.x + player.z * player.z)

      if (dist < 100)        { zone = 'spawn'; prefix = '&a&l[СПАВН]&r '   }
      else if (dist < 1500)  { zone = 'build'; prefix = '&b&l[СТРОЙКА]&r ' }
      else                   { zone = 'wild';  prefix = '&c&l[ДИКИЕ]&r '   }
    }

    let name = player.username

    // ---------- ОБНОВЛЯЕМ ТОЛЬКО ПРИ СМЕНЕ ЗОНЫ ----------
    if (lastZone[name] !== zone) {
      lastZone[name] = zone

      // префикс в таб-листе и над головой
      event.server.runCommandSilent(`tab player ${name} tabprefix "${prefix}"`)
      event.server.runCommandSilent(`tab player ${name} tagprefix "${prefix}"`)

      // сбрасываем все зон-теги и ставим актуальный
      event.server.runCommandSilent(`tag ${name} remove zone_spawn`)
      event.server.runCommandSilent(`tag ${name} remove zone_build`)
      event.server.runCommandSilent(`tag ${name} remove zone_wild`)
      event.server.runCommandSilent(`tag ${name} remove zone_nether`)
      event.server.runCommandSilent(`tag ${name} remove zone_end`)
      event.server.runCommandSilent(`tag ${name} add zone_${zone}`)

      console.info(`[ZONES] ${name} -> зона: ${zone}`)
    }
  })
})

// ---------- СБРОС КЭША ПРИ ВЫХОДЕ ИГРОКА ----------
PlayerEvents.loggedOut(event => {
  delete lastZone[event.player.username]
})