--#pragma once

--#define THING_THREE 3
--#define FIVE THING_THREE + 2

--#include "math.lua" with { FEATURE_ENABLE = false, OTHER_THING = 1 }

-- this is a comment
function clamp(value, min, max)
	if value < min then
		return min
	elseif value > max then
		return max
	else
		return value
	end
end

--#macro MUL(a, b) => ((a) * (b))

--#macro SQUARE(x)
MUL(x, x)
--#endmacro

function TIC()
	cls(2)
	print("Hello, TIC-80! " .. __EXPAND("$(project.name)"))

	-- test that lerp() is imported.
	local a = 10
	local b = 20
	local t = 0.25
	local result = lerp(a, b, t)
	print("lerp(" .. a .. ", " .. b .. ", " .. t .. ") = " .. result, 84, 60, 0)

	if FEATURE_ENABLE then
		print("Feature is enabled!", 84, 80, 0)
	else
		print("Feature is disabled.", 84, 80, 0)
	end

	--#if FIVE == 5
	print("FIVE is 5!", 84, 100, 0)
	--#else
	print("FIVE is not 5.", 84, 100, 0)
	--#endif

	print("MUL(3, 4) = " .. MUL(3, 4), 84, 20, 0)
	print("SQUARE(5) = " .. SQUARE(5), 84, 30, 0)
end
