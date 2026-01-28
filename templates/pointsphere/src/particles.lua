--#pragma once

local function projectToScreen(x, y, z)
	-- simple orthographic projection
	local sx = math.floor((x + 1) * 70) + 50
	local sy = math.floor((y + 1) * 70)
	return sx, sy
end

-- generate random 3D points, radii, and rotation speeds
local function initPoints(pointCount)
	local points = {}

	-- arrange points equally on a sphere using the Fibonacci sphere algorithm
	for i = 1, pointCount do
		local phi = math.acos(1 - 2 * i / pointCount)
		local theta = math.pi * (1 + math.sqrt(5)) * i

		local x = math.cos(theta) * math.sin(phi)
		local y = math.sin(theta) * math.sin(phi)
		local z = math.cos(phi)

		local point = {
			px = x,
			py = y,
			pz = z,
			radius = 1.1,
			rotX = 0.006,
			rotY = 0.005,
			rotZ = 0.0,
			ramp = RAMPS[math.random(1, #RAMPS)],
		}
		table.insert(points, point)
	end
	return points
end

-- the point cloud center will move through space
local pointCloudCenter = {
	x = 1,
	y = 0,
	z = 0,
}

local function renderPoint(point, t)
	-- calculate current coord based on center, radius, and rotation
	local x, y, z = rotate3D(point.px, point.py, point.pz, point.rotX * t, point.rotY * t, point.rotZ * t)
	--local x,y,z = point.px, point.py, point.pz
	-- scale by their radius
	x = x * point.radius
	y = y * point.radius
	z = z * point.radius

	-- move the whole point cloud by
	-- update point cloud center position
	pointCloudCenter.x = math.sin(t * 0.015) * 0.9 -- 0.9 allows a few points to still get projected to the far side, otherwise you soon get a hemisphere only
	pointCloudCenter.y = math.cos(t * 0.015) * 0.9
	pointCloudCenter.z = 0 --math.sin(t * 0.01) * 0.1

	-- translate to the point cloud center
	x = x + pointCloudCenter.x
	y = y + pointCloudCenter.y
	z = z + pointCloudCenter.z

	local ox, oy, oz = x, y, z

	-- -- project it onto a unit sphere
	local nx, ny, nz = normalize3D(x, y, z)

	-- -- lerp to unit sphere to create a bulging effect
	local bulgeFactor = 1 -- math.sin(t * 0.05) * 0.5 + 0.5 -- 0..1
	x = LERP(x, nx, bulgeFactor)
	y = LERP(y, ny, bulgeFactor)
	z = LERP(z, nz, bulgeFactor)

	-- map to screen coords
	local sx, sy = projectToScreen(x, y, z)
	local sox, soy = projectToScreen(ox, oy, oz)

	-- size based on depth
	-- map z from -1..1 to 1..0
	local zs = z * 0.5 + 0.5
	local size = math.floor(zs * 1.9)

	local ramp = point.ramp
	local colorIndex = CLAMP(math.floor(zs * (#ramp - 1)) + 1, 1, #ramp)

	pix(sox, soy, ramp[1])
	circ(sx, sy, size, ramp[colorIndex])
end
