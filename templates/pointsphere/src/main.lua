--#include "math.lua"
--#include "palette.lua"
--#include "particles.lua"

--#macro POINT_COUNT() => 1500

local gFrame = 0

local points = initPoints(POINT_COUNT())

function TIC()
	cls(0)
	gFrame = gFrame + 1
	for i, point in ipairs(points) do
		renderPoint(point, gFrame)
	end
end
