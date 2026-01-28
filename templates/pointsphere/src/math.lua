--#pragma once

-- These are C-like macros that get expanded at compile time; as such they
-- inline and are therefore faster than function equivs.

--#macro LERP(a, b, t) => ((a) + ((b) - (a)) * (t))
--#macro CLAMP(val, lo, hi) => ((val) < (lo) and (lo) or ((val) > (hi) and (hi) or (val)))

local function rand(a, b)
	return LERP(a, b, math.random())
end

local function normalize3D(x, y, z)
	local length = math.sqrt(x * x + y * y + z * z)
	return x / length, y / length, z / length
end

local function rotate3D(x, y, z, ax, ay, az)
	-- Rotate around X axis
	local cosa = math.cos(ax)
	local sina = math.sin(ax)
	local y1 = cosa * y - sina * z
	local z1 = sina * y + cosa * z

	-- Rotate around Y axis
	cosa = math.cos(ay)
	sina = math.sin(ay)
	local x2 = cosa * x + sina * z1
	local z2 = -sina * x + cosa * z1
	-- Rotate around Z axis
	cosa = math.cos(az)
	sina = math.sin(az)
	local x3 = cosa * x2 - sina * y1
	local y3 = sina * x2 + cosa * y1
	return x3, y3, z2
end

local function select2(t, edge, a, b)
	if t < edge then
		return a
	else
		return b
	end
end

local function select3(t, edge1, edge2, a, b, c)
	if t < edge1 then
		return a
	elseif t < edge2 then
		return b
	else
		return c
	end
end
