// ============================================================
//  ASI — РАЗМЕЩЕНИЕ СТАРТОВОГО ОСТРОВА (улучшенная версия)
//  Файл: kubejs/server_scripts/asi_island_place.js
//  С гарантиями загрузки и повторными попытками.
// ============================================================

ServerEvents.loaded(event => {
  const server = event.server;
  const flags  = server.persistentData;

  if (flags.getBoolean('asi_island_placed')) {
    console.info('[ASI] Остров уже размещён ранее (флаг стоит).');
    return;
  }

  console.info('[ASI] СТАРТ: Начинаем размещение острова при загрузке мира...');

  // Используем более длительную задержку для single-player и медленных машин.
  // 100 тиков = 5 секунд. Обычно хватает.
  server.scheduleInTicks(100, () => {
    attemptPlaceIsland(server, flags, 1);
  });
});

/**
 * Рекурсивная функция размещения острова с повторными попытками.
 * @param {Server} server
 * @param {NBTCompound} flags - server.persistentData
 * @param {number} attempt - номер попытки (макс 3)
 */
function attemptPlaceIsland(server, flags, attempt) {
  if (attempt > 3) {
    console.error('[ASI] КРИТИЧЕСКАЯ ОШИБКА: не удалось разместить остров за 3 попытки. Проверь логи выше.');
    return;
  }

  const level = server.getLevel(ASI_DIM);
  if (!level) {
    console.warn('[ASI] Попытка ' + attempt + ': измерение ' + ASI_DIM + ' ещё не загружено. Повтор через 80 тиков...');
    server.scheduleInTicks(80, () => {
      attemptPlaceIsland(server, flags, attempt + 1);
    });
    return;
  }

  console.info('[ASI] Попытка ' + attempt + ': измерение найдено, начинаю размещение...');

  const ox = ASI_ORIGIN[0];
  const oy = ASI_ORIGIN[1];
  const oz = ASI_ORIGIN[2];

  // Принудительно грузим чанк
  server.runCommandSilent(`forceload add ${ox} ${oz}`);
  console.info('[ASI] Чанк загружен/зафорсирован для размещения.');

  // Выполняем команду размещения
  const cmd = `place template ${ASI_STRUCTURE} ${ox} ${oy} ${oz}`;
  console.info('[ASI] Выполняю команду: ' + cmd);
  server.runCommandSilent(cmd);

  // На случай, если блок-конструктор попал в структуру (костыль)
  if (typeof ASI_STRUCTURE_BLOCK !== 'undefined' && ASI_STRUCTURE_BLOCK) {
    const b = ASI_STRUCTURE_BLOCK;
    server.runCommandSilent(`setblock ${b[0]} ${b[1]} ${b[2]} minecraft:air`);
    console.info('[ASI] Блок-конструктор удалён в ' + b[0] + ',' + b[1] + ',' + b[2]);
  }

  // Выставляем мировой спавн и режим точного спавна
  server.runCommandSilent(`setworldspawn ${Math.floor(ASI_SPAWN_X)} ${Math.floor(ASI_SPAWN_Y)} ${Math.floor(ASI_SPAWN_Z)}`);
  server.runCommandSilent('gamerule spawnRadius 0');

  // Ставим флаг, чтобы при следующей загрузке мира не пересоздавался
  flags.putBoolean('asi_island_placed', true);

  console.info('[ASI] ✓ УСПЕХ (попытка ' + attempt + '): остров размещён в ' + ox + ',' + oy + ',' + oz +
               ' (структура: ' + ASI_STRUCTURE + ')');
}
