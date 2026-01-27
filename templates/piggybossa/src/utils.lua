--#pragma once

--#macro TIC_WIDTH() => 240
--#macro TIC_HEIGHT() => 136

function drawSprite3x3(spriteId, x, y, colorKey)
	for dy = 0, 2 do
		for dx = 0, 2 do
			spr(spriteId + dy * 16 + dx, x + dx * 8, y + dy * 8, colorKey)
		end
	end
end
