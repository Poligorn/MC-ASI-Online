// ============================================================
//  ASI — СПАВН ИГРОКА НА ОБЩЕМ СТАРТОВОМ ОСТРОВЕ
//  Файл: kubejs/server_scripts/asi_island_spawn.js
//  Константы берутся из asi_island_config.js
//
//  ВАЖНО: гарантированно размещает остров ДО спавна игрока,
//  чтобы он не упал в пустоту.
// ============================================================

PlayerEvents.loggedIn(event => {
  const player = event.player;
  if (player.level.isClientSide()) return;

  const server = event.server;
  const pdata = player.persistentData;

  // Если этот игрок уже начинал игру — ничего не делаем
  if (pdata.getBoolean('asi_started')) return;
  pdata.putBoolean('asi_started', true);

  console.info('[ASI] Новый игрок вошёл: ' + player.name.string + '. Проверяю остров...');

  // ============================================================
  // КРИТИЧЕСКИЙ МОМЕНТ: убедиться, что остров УЖЕ на месте.
  // Если при входе игрока остров ещё не размещён — разместить немедленно.
  // ============================================================
  const flags = server.persistentData;
  if (!flags.getBoolean('asi_island_placed')) {
    console.warn('[ASI] Остров ещё не размещён! Размещаю немедленно перед спавном игрока...');
    
    const ox = ASI_ORIGIN[0], oy = ASI_ORIGIN[1], oz = ASI_ORIGIN[2];
    server.runCommandSilent(`forceload add ${ox} ${oz}`);
    server.runCommandSilent(`place template ${ASI_STRUCTURE} ${ox} ${oy} ${oz}`);
    
    // Удаляем блок-конструктор, если он в NBT
    if (typeof ASI_STRUCTURE_BLOCK !== 'undefined' && ASI_STRUCTURE_BLOCK) {
      const b = ASI_STRUCTURE_BLOCK;
      server.runCommandSilent(`setblock ${b[0]} ${b[1]} ${b[2]} minecraft:air`);
    }
    
    server.runCommandSilent(`setworldspawn ${Math.floor(ASI_SPAWN_X)} ${Math.floor(ASI_SPAWN_Y)} ${Math.floor(ASI_SPAWN_Z)}`);
    server.runCommandSilent('gamerule spawnRadius 0');
    flags.putBoolean('asi_island_placed', true);
    console.info('[ASI] Остров размещён перед спавном игрока.');
  }

  // Теперь ГАРАНТИРОВАННО спавним/телепортируем на остров с минимальной задержкой
  event.server.scheduleInTicks(5, () => {
    const p = event.server.getPlayer(player.uuid);
    if (!p) return;

    const dim = ASI_DIM.replace('minecraft:', '');
    p.runCommandSilent(
      `execute in minecraft:${dim} run tp ${p.username} ${ASI_SPAWN_X} ${ASI_SPAWN_Y} ${ASI_SPAWN_Z}`
    );

    // Выдаём книгу квестов в последний слот хотбара
    p.runCommandSilent(`item replace entity ${p.username} hotbar.8 with ftbquests:book`);

    p.tell(Text.gold('Добро пожаловать на Небесный Остров. Ваше приключение начинается здесь...'));
    p.tell(Text.aqua('Книга квестов в последнем слоте хотбара!'));
    
    console.info('[ASI] Игрок ' + p.name.string + ' заспавнен на острове.');
  });
});