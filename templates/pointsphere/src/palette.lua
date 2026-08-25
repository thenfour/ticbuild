--#pragma once

local PALETTE = "1a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57"

function SetPalette(str)
	local o = 0
	for c = 1, #str, 2 do -- walk colors
		local v = tonumber(str:sub(c, c + 1), 16) -- get color (v)alue
		poke(0x3fc0 + o, v)
		o = o + 1 -- set color
	end
end

SetPalette(PALETTE)

local RAMPS = {
	{ 15, 14, 13, 12 }, -- from darkest to lightest
	{ 1, 2, 3, 4, 12 },
	{ 8, 9, 10, 11, 12 },
	{ 7, 6, 5, 12 },
}
