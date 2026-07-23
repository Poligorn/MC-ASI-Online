// ===== Правила Ада =====

const NETHER = 'minecraft:the_nether'
const TEAM = 'nether_silent'

// --- Команда скорборда при старте ---
ServerEvents.loaded(event => {
  event.server.runCommandSilent(`team add ${TEAM}`)
  event.server.runCommandSilent(`team modify ${TEAM} nametagVisibility never`)
  event.server.runCommandSilent(`team modify ${TEAM} deathMessageVisibility never`)
})

// --- Блокировка чата ---
PlayerEvents.chat(event => {
  if (event.player.level.dimension == NETHER) {
    event.cancel()
    event.player.tell(Text.darkRed('В аду ваш голос никто не услышит...').italic(true))
  }
})

// --- Релог внутри ада: повторно глушим карту ---
PlayerEvents.loggedIn(event => {
  if (event.player.level.dimension == NETHER) {
    disableXaero(event.player)
  }
})

// --- Вход/выход из ада ---
ServerEvents.tick(event => {
  if (event.server.tickCount % 20 !== 0) return

  event.server.players.forEach(p => {
    const inNether = p.level.dimension == NETHER
    const flagged = p.persistentData.getBoolean('kjs_in_nether')

    if (inNether && !flagged) {
      p.persistentData.putBoolean('kjs_in_nether', true)
      event.server.runCommandSilent(`team join ${TEAM} ${p.username}`)
      p.tell(XAERO_DISABLE)
      announceRules(p, event.server)
    } else if (!inNether && flagged) {
      p.persistentData.putBoolean('kjs_in_nether', false)
      event.server.runCommandSilent(`team leave ${p.username}`)
    }
  })
})

// --- Объявление правил ---
function announceRules(p, server) {
  server.runCommandSilent(
    `title ${p.username} title {"text":"АД","color":"dark_red","bold":true}`
  )
  server.runCommandSilent(
    `title ${p.username} subtitle {"text":"Здесь действуют другие законы","color":"gray","italic":true}`
  )
  p.tell(Text.darkRed('════════ Законы Ада ════════'))
  p.tell(Text.gray('☠ Чат не работает — вас никто не услышит'))
  p.tell(Text.gray('☠ О вашей смерти никто не узнает'))
  p.tell(Text.gray('☠ Ники игроков скрыты'))
  p.tell(Text.gray('☠ Координаты совпадают с верхним миром (1:1)'))
  p.tell(Text.darkRed('════════════════════════════'))
  p.playNotifySound('minecraft:ambient.nether_wastes.mood', 'master', 1.0, 0.5)
}
PlayerEvents.tick(event => {
  const p = event.player
  if (!p) return

  const dist = Math.max(Math.abs(p.x), Math.abs(p.z))

  // зона предупреждения: за 30 блоков до границы
  if (dist > BORDER_OVERWORLD - 30 && dist < BORDER_OVERWORLD) {
    // спавним "стену" частиц перед игроком
    p.level.spawnParticles(
      'minecraft:portal',
      true,
      p.x, p.y + 1, p.z,
      1.5, 2, 1.5,   // разброс
      30,            // количество
      0.1            // скорость
    )
    // затемнение/тошнота как намёк на искажение реальности
    // p.potionEffects.add('minecraft:darkness', 40, 0, false, false)
  }
})