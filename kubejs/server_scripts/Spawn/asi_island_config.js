// ============================================================
//  ASI (Aeronautics: Sky Islands) — ОБЩИЙ КОНФИГ
//  Файл: kubejs/server_scripts/asi_island_config.js
//  Грузится первым (по алфавиту 'a...'), константы видны в других файлах.
// ============================================================

// ID структуры из kubejs/data/asi/structure/start_island.nbt
const ASI_STRUCTURE = 'asi:starter_island';

// Измерение, где стоит остров
const ASI_DIM = 'minecraft:overworld';

// УГОЛ структуры (nbt ставится от угла = минимальные X/Y/Z!)
const ASI_ORIGIN = [-8, 200, -8];

// Смещение от угла структуры до точки, где стоит игрок.
// !!! ВПИШИ реальные значения из своего NBT (размеры/центр площадки) !!!
const ASI_SPAWN_OFFSET = [12, 5, 12];

// Готовая точка спавна игрока (+0.5 = центр блока по X/Z)
const ASI_SPAWN_X = ASI_ORIGIN[0] + ASI_SPAWN_OFFSET[0] + 0.5;
const ASI_SPAWN_Y = ASI_ORIGIN[1] + ASI_SPAWN_OFFSET[1];
const ASI_SPAWN_Z = ASI_ORIGIN[2] + ASI_SPAWN_OFFSET[2] + 0.5;
