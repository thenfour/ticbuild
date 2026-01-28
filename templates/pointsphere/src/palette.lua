--#pragma once

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
