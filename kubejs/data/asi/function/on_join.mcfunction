# Размещаем остров один раз (флаг защищает от повторов)
execute unless score #island_placed asi.data matches 1 run place template asi:starter_island -8 200 -8

# Устанавливаем флаг
execute unless score #island_placed asi.data matches 1 run scoreboard players set #island_placed asi.data 1

# Спавним/телепортируем игрока на остров
setworldspawn 0 205 0