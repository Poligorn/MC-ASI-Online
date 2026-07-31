// ============================================================
//  ASI — DEBUG-КОМАНДЫ для управления стартовым островом
//  Файл: kubejs/server_scripts/asi_island_debug.js
//  Требуют прав оператора (уровень 2).
// ============================================================

ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event;

  event.register(
    Commands.literal('asi')
      .requires(src => src.hasPermission(2))

      // /asi resetisland  — сбросить флаг размещения острова
      .then(Commands.literal('resetisland')
        .executes(ctx => {
          const server = ctx.source.server;
          server.persistentData.putBoolean('asi_island_placed', false);
          ctx.source.sendSystemMessage(Text.yellow(
            '[ASI] Флаг размещения острова сброшен. Перезайдите на сервер (или /reload), чтобы остров переставился.'
          ));
          return 1;
        }))

      // /asi placenow  — принудительно разместить остров прямо сейчас
      .then(Commands.literal('placenow')
        .executes(ctx => {
          const server = ctx.source.server;
          const ox = ASI_ORIGIN[0], oy = ASI_ORIGIN[1], oz = ASI_ORIGIN[2];
          server.runCommandSilent(`forceload add ${ox} ${oz}`);
          // runCommandSilent возвращает undefined в этой сборке — результат не проверяем.
          server.runCommandSilent(`place template ${ASI_STRUCTURE} ${ox} ${oy} ${oz}`);
          server.persistentData.putBoolean('asi_island_placed', true);
          server.runCommandSilent(`setworldspawn ${Math.floor(ASI_SPAWN_X)} ${ASI_SPAWN_Y} ${Math.floor(ASI_SPAWN_Z)}`);
          server.runCommandSilent('gamerule spawnRadius 0');
          ctx.source.sendSystemMessage(Text.green('[ASI] Остров размещён (' + ASI_STRUCTURE + ').'));
          return 1;
        }))

      // /asi resetplayer  — сбросить свой личный флаг спавна (для теста ТП + книги)
      .then(Commands.literal('resetplayer')
        .executes(ctx => {
          const player = ctx.source.player;
          if (player) {
            player.persistentData.putBoolean('asi_started', false);
            ctx.source.sendSystemMessage(Text.yellow('[ASI] Твой флаг спавна сброшен. Перезайди — снова заспавнишься на острове с книгой.'));
          }
          return 1;
        }))

      // /asi status  — показать текущее состояние флагов
      .then(Commands.literal('status')
        .executes(ctx => {
          const server = ctx.source.server;
          const placed = server.persistentData.getBoolean('asi_island_placed');
          ctx.source.sendSystemMessage(Text.aqua('[ASI] Остров размещён (флаг): ' + placed));
          return 1;
        }))
  );
});