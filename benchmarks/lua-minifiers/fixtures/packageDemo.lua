---#define DEBUG
---#define EDITOR_FEATURES

-- uncomment to enable string renderer (default uses per-glyph renderer)
---#define ENABLE_STRING_RENDERER
---#define ENABLE_FREE_VIEW
---#define ENABLE_INTERACTIVE_POSES
-- used for mesh flat shading
-- entry point (TIC / SCN) for demo runner.

function TFASSERT(condition, message)
	if not condition then
		error("TFASSERT failed: " .. tostring(message))
	end
end

-- this is cool but remember to make local aliases when you use it a lot in a function!
local sin, cos, sqrt, atan2, asin, acos, abs, min, max, pow, exp =
	math.sin,
	math.cos, --
	math.sqrt,
	math.atan2,
	math.asin,
	math.acos,
	math.abs,
	math.min,
	math.max,
	math.pow,
	math.exp

-- in general don't use floor; use //1 directly.

function CloneTable(t)
	local result = {}
	for k, v in pairs(t) do
		result[k] = v
	end
	return result
end

-- https://tic80.com/learn

-- key(0) returns true if ANY key is pressed, including if caps lock is on.
-- note that dead keys on the host machine don't act as dead keys in tic80.
-- on my layout, ' is a deadkey, but in tic80 they fire as normal.

-- while caps lock is on, key(62) returns true, even if it was enabled outside of the tic80.
-- unfortunately ALTGR is not detectable.
-- also not printscr, scrolllock, numlock, pause...

-- Numpad...

-- quick sketch to find key codes:

-- function TIC()
-- 	cls(0)
-- 	local found = 0 -- number of keys found to be down or pressed
-- 	for i = 0, 94 do
-- 		trace(i)
-- 		local isKeyDown = key(i)
-- 		local isKeyPressed = keyp(i)
-- 		if isKeyDown or isKeyPressed then
-- 			print(string.format("key %d: down=%s, pressed=%s", i, tostring(isKeyDown), tostring(isKeyPressed)), 10, 10 + found * 6)
-- 			found = found + 1
-- 		end
-- 	end
-- end

-- math and geom helpers

-- NOTE: x will be evaluated twice! don't pass in an expression with side effects or that is expensive to compute.

-- NOTE: a will be evaluated twice! don't pass in an expression with side effects or that is expensive to compute.

-- example: INVLERP(10, 20, 15) => 0.5
-- NOTE: a will be evaluated potentially 3 times! don't pass in an expression with side effects or that is expensive to compute.
-- and b will be evaluated potentially twice.

-- remaps a value from one range to another. e.g., REMAP(10, 20, 0, 100, 15) => 50

function Normalize3(x, y, z)
	local length = sqrt(x * x + y * y + z * z)
	if length <= 0.00001 then
		return 0, 0, 1
	end
	return x / length, y / length, z / length
end

function Rotate3WithTrig(x, y, z, cosX, sinX, cosY, sinY, cosZ, sinZ)
	local y1 = cosX * y - sinX * z
	local z1 = sinX * y + cosX * z
	local x1 = cosY * x + sinY * z1
	local z2 = -sinY * x + cosY * z1
	local x2 = cosZ * x1 - sinZ * y1
	local y2 = sinZ * x1 + cosZ * y1
	return x2, y2, z2
end

function InverseRotate3WithTrig(x, y, z, cosX, sinX, cosY, sinY, cosZ, sinZ)
	local x1 = cosZ * x + sinZ * y
	local y1 = -sinZ * x + cosZ * y
	local x2 = cosY * x1 - sinY * z
	local z1 = sinY * x1 + cosY * z
	local y2 = cosX * y1 + sinX * z1
	local z2 = -sinX * y1 + cosX * z1
	return x2, y2, z2
end

do
	local function ParseHexByte(hex, index)
		return tonumber(string.sub(hex, index, index + 1), 16)
	end

	-- color can be:
	-- - a string like "#f09" or "#ff0099"
	-- - a table like { 255, 0, 153 }
	function ParseColor(color)
		if type(color) == "table" then
			-- e.g., ParseColor({ 255, 0, 153 }) => 255, 0, 153
			return color[1], color[2], color[3]
		end

		-- now we expect a string
		if type(color) ~= "string" then
			return 0, 255, 255 -- cyan = error: not a string
		end

		if string.sub(color, 1, 1) == "#" then
			local hex = string.sub(color, 2)
			if #hex == 3 then
				local r = tonumber(string.sub(hex, 1, 1), 16) * 17
				local g = tonumber(string.sub(hex, 2, 2), 16) * 17
				local b = tonumber(string.sub(hex, 3, 3), 16) * 17
				return r, g, b
			end

			if #hex == 6 then
				return ParseHexByte(hex, 1), ParseHexByte(hex, 3), ParseHexByte(hex, 5)
			else
				return 255, 255, 0 -- yellow = error: bad format (RGB or RRGGBB expected)
			end
		end

		return 255, 0, 255 -- magenta = error: bad format (needs to start with "#")
	end

	function SrgbByteToLinear(v)
		local s = (v < 0 and 0 or (v > 255 and 255 or v)) / 255
		if s <= 0.04045 then
			return s / 12.92
		end
		return pow((s + 0.055) / 1.055, 2.4)
	end

	function LinearToSrgbByte(v)
		v = (v < 0 and 0 or (v > 1 and 1 or v))
		if v <= 0.0031308 then
			return v * 12.92 * 255
		end
		return (1.055 * pow(v, 1 / 2.4) - 0.055) * 255
	end

	function LinearRgbToOklab(r, g, b)
		local l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
		local m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
		local s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

		local lRoot = pow(l, 1 / 3)
		local mRoot = pow(m, 1 / 3)
		local sRoot = pow(s, 1 / 3)

		return 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot,
			1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot,
			0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot
	end

	function OklabToLinearRgb(l, a, b)
		local lRoot = l + 0.3963377774 * a + 0.2158037573 * b
		local mRoot = l - 0.1055613458 * a - 0.0638541728 * b
		local sRoot = l - 0.0894841775 * a - 1.291485548 * b

		local l3 = lRoot * lRoot * lRoot
		local m3 = mRoot * mRoot * mRoot
		local s3 = sRoot * sRoot * sRoot

		return 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
			-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
			-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3
	end
end

do
	function GradientStop(t01, color)
		local r, g, b = ParseColor(color)
		return {
			t = (t01 < 0 and 0 or (t01 > 1 and 1 or t01)),
			r = r,
			g = g,
			b = b,
		}
	end

	function NormalizeStops(stops)
		local out = {}
		for i = 1, #stops do
			local stop = stops[i]
			out[i] = {
				t = (
					(stop.t or stop[1] or 0) < 0 and 0
					or ((stop.t or stop[1] or 0) > 1 and 1 or (stop.t or stop[1] or 0))
				),
				r = stop.r or stop[2] or 255,
				g = stop.g or stop[3] or 255,
				b = stop.b or stop[4] or 255,
			}
		end
		return out
	end

	function ResolveMaterialConfig(config)
		local ditherAmount = config ~= nil and config.ditherAmount or 1
		--local interpolation = config ~= nil and config.interpolation or "oklab"

		local interpolation = "oklab"
		return (ditherAmount < 0 and 0 or (ditherAmount > 1 and 1 or ditherAmount)), interpolation
	end

	function PrepareInterpolationStops(stops, interpolation)
		if interpolation == "rgb" then
			return stops
		end

		local out = {}
		for i = 1, #stops do
			local stop = stops[i]
			local lr = SrgbByteToLinear(stop.r)
			local lg = SrgbByteToLinear(stop.g)
			local lb = SrgbByteToLinear(stop.b)
			--local c1, c2, c3 = lr, lg, lb
			--if interpolation == "oklab" then
			local c1, c2, c3 = LinearRgbToOklab(lr, lg, lb)
			--end

			out[i] = {
				t = stop.t,
				r = stop.r,
				g = stop.g,
				b = stop.b,
				c1 = c1,
				c2 = c2,
				c3 = c3,
			}
		end
		return out
	end

	function InterpolateStopColors(a, b, u, interpolation)
		if interpolation == "rgb" then
			return (a.r + (b.r - a.r) * u), (a.g + (b.g - a.g) * u), (a.b + (b.b - a.b) * u)
		end

		local c1 = (a.c1 + (b.c1 - a.c1) * u)
		local c2 = (a.c2 + (b.c2 - a.c2) * u)
		local c3 = (a.c3 + (b.c3 - a.c3) * u)
		if interpolation == "oklab" then
			c1, c2, c3 = OklabToLinearRgb(c1, c2, c3)
		end

		return LinearToSrgbByte(c1), LinearToSrgbByte(c2), LinearToSrgbByte(c3)
	end

	function Material_Gradient(stops, config)
		local normalizedStops = NormalizeStops(stops)
		local ditherAmount, interpolation = ResolveMaterialConfig(config)
		normalizedStops = PrepareInterpolationStops(normalizedStops, interpolation)
		local lastIndex = #normalizedStops

		local sample = function(t)
			local z0 = normalizedStops[1]
			local z0t = z0.t
			if t <= z0t then
				return z0.r, z0.g, z0.b
			end

			for i = 1, lastIndex - 1 do
				local b = normalizedStops[i + 1]
				local bt = b.t
				if t <= bt then
					local span = bt - z0t
					local u = 0
					if span > 0.001 then
						u = (t - z0t) / span
					end
					return InterpolateStopColors(z0, b, u, interpolation)
				end
				z0 = b
				z0t = bt
			end

			return z0.r, z0.g, z0.b
		end

		-- precompute a lookup table for performance.
		local lookup = {}
		for i = 0, (128 - 1) do
			local t = i / (128 - 1)
			local r, g, b = sample(t)
			-- possibly need to clamp r,g,b 0-255
			local rgb = ((r // 1) << 16) | ((g // 1) << 8) | (b // 1)
			lookup[i] = { r, g, b, rgb }
		end

		return {
			lut = lookup,
			ditherAmount = ditherAmount,
		}
	end

	function Material_Flat(color, config)
		return Material_Gradient({
			GradientStop(0, color),
			GradientStop(1, color),
		}, config)
	end

	function Material_BlackToWhiteBody(color, config)
		return Material_Gradient({
			GradientStop(0, "#000"),
			GradientStop(0.5, color),
			GradientStop(1, "#fff"),
		}, config)
	end

	function Material_Gradient2(c1, c2, config)
		return Material_Gradient({
			GradientStop(0, c1),
			GradientStop(1, c2),
		}, config)
	end

	function Material_Gradient3(c1, c2, c3, config)
		return Material_Gradient({
			GradientStop(0, c1),
			GradientStop(0.5, c2),
			GradientStop(1, c3),
		}, config)
	end
end

-- Note that error-diffusion would be impractical;
-- * temporal stability is already a problem
-- * multiple materials with tone param: where does error diffuse to? I am not sure
--   it would make sense to do diffuse into other materials like that. bayer keeps
--   error local over the material.
-- * complexity in tracking error vertically

B4N = {
	0.5 / 16,
	8.5 / 16,
	2.5 / 16,
	10.5 / 16,
	12.5 / 16,
	4.5 / 16,
	14.5 / 16,
	6.5 / 16,
	3.5 / 16,
	11.5 / 16,
	1.5 / 16,
	9.5 / 16,
	15.5 / 16,
	7.5 / 16,
	13.5 / 16,
	5.5 / 16,
}

local BAYER_MINUS_5 = {}
for sy = 0, 136 - 1 do
	local y4 = (sy % 4) * 4
	local row = sy * 240
	for sx = 0, 240 - 1 do
		BAYER_MINUS_5[row + sx] = (B4N[y4 + (sx % 4) + 1] - 0.5)
	end
end

function Transport_GetSyncOffsetMillis(options, fallback)
	local value = options ~= nil and options.syncOffsetMillis or fallback
	value = tonumber(value) or 0
	return value
end

function Transport_AssignProviderTime(transport, state)
	TFASSERT(state ~= nil, "Somatic transport returned nil state")
	transport.time = state
	state.syncOffsetMillis = transport.syncOffsetMillis or 0
	return state
end

function Transport_GetFrameDeltaBeats(transport)
	local state = transport.time
	TFASSERT(state ~= nil, "Transport_GetFrameDeltaBeats requires transport time")
	TFASSERT(state.tempo ~= nil and state.speed ~= nil, "Transport_GetFrameDeltaBeats requires tempo/speed to be set")
	return (1000 / 60) * (state.tempo * 6 / state.speed) / 60000
end

function Transport_GetSomaticOptions(transport, options)
	options = options or {}
	if options.syncOffsetMillis ~= nil then
		transport.syncOffsetMillis = Transport_GetSyncOffsetMillis(options, transport.syncOffsetMillis or 0)
	end
	return {
		isPlaying = options.isPlaying,
		isMuted = options.isMuted,
		loopSongForever = options.loopSongForever,
		syncOffsetMS = transport.syncOffsetMillis or 0,
	}
end

function Transport_SetOptions(transport, options)
	return Transport_AssignProviderTime(transport, somatic_set_options(Transport_GetSomaticOptions(transport, options)))
end

function Transport_CreateSomatic(options)
	TFASSERT(somatic_get_time ~= nil, "Transport_CreateSomatic requires Somatic song CODE to be included")
	TFASSERT(somatic_tick ~= nil, "Transport_CreateSomatic requires Somatic song CODE to be included")
	TFASSERT(somatic_seek ~= nil, "Transport_CreateSomatic requires Somatic song CODE to be included")
	TFASSERT(somatic_set_options ~= nil, "Transport_CreateSomatic requires Somatic song CODE to be included")

	local transport = {
		syncOffsetMillis = Transport_GetSyncOffsetMillis(options, 0),
		time = nil,
	}
	Transport_SetOptions(transport, options)
	if options ~= nil and options.startBeat ~= nil then
		Transport_AssignProviderTime(transport, somatic_seek(options.startBeat, transport.syncOffsetMillis))
		return transport
	end
	Transport_AssignProviderTime(transport, somatic_get_time(transport.syncOffsetMillis))
	return transport
end

function Transport_GetProjectTime(transport)
	return transport.time
end

function Transport_Seek(transport, beat)
	return Transport_AssignProviderTime(transport, somatic_seek(beat, transport.syncOffsetMillis))
end

function Transport_AdvanceFrame(transport)
	return Transport_AssignProviderTime(transport, somatic_advance_frame())
end

function Transport_PreviousFrame(transport)
	local state = transport.time
	return Transport_Seek(transport, (state.demoBeats or 0) - Transport_GetFrameDeltaBeats(transport))
end

function Transport_Update(transport, wallDeltaMillisOverride)
	return Transport_AssignProviderTime(transport, somatic_tick(wallDeltaMillisOverride, transport.syncOffsetMillis))
end

function Transport_EndFrame(transport)
	somatic_end_frame()
end

-- this is where dynamic palette generation happens.
-- scenes render as mat,tone (not RGB), and this renderer computes a custom palette per scan line
-- to represent the scene.

-- this is an extremely perf-sensitive module so a lot of stuff here is optimized for speed, sometimes at the cost of readability.
-- changes must be profiled to make sure no  perf regression.

do
	-- some of these are used by primitives or scene; todo: clearer separation.
	gFrameBuffer_Material = {}
	gFrameBuffer_Tone = {}
	gFrameBuffer_Depth = {} -- larger values are nearer; used by z-buffered 3D rendering
	gBorderBuffer_Material = {}
	-- active screen-space clip rect, half-open: [x0, x1) x [y0, y1)
	gClipRectX0 = 0
	gClipRectY0 = 0
	gClipRectX1 = 240
	gClipRectY1 = 136
	local gClipRectStackX0 = {}
	local gClipRectStackY0 = {}
	local gClipRectStackX1 = {}
	local gClipRectStackY1 = {}
	local gClipRectStackDepth = 0

	function R_setClipRectBounds(x0, y0, x1, y1)
		gClipRectX0 = (x0 < 0 and 0 or (x0 > 240 and 240 or x0))
		gClipRectY0 = (y0 < 0 and 0 or (y0 > 136 and 136 or y0))
		gClipRectX1 = (x1 < 0 and 0 or (x1 > 240 and 240 or x1))
		gClipRectY1 = (y1 < 0 and 0 or (y1 > 136 and 136 or y1))
	end

	function R_resolveClipRect(x, y, width, height)
		local x0 = x // 1
		local y0 = y // 1
		local x1 = (x + width) // 1
		local y1 = (y + height) // 1
		return x0, y0, x1, y1
	end

	function R_resetClipRect()
		gClipRectStackDepth = 0
		R_setClipRectBounds(0, 0, 240, 136)
	end

	function R_setClipRect(x, y, width, height)
		local x0, y0, x1, y1 = R_resolveClipRect(x, y, width, height)
		R_setClipRectBounds(x0, y0, x1, y1)
	end

	function R_pushClipRect(x, y, width, height)
		gClipRectStackDepth = gClipRectStackDepth + 1
		gClipRectStackX0[gClipRectStackDepth] = gClipRectX0
		gClipRectStackY0[gClipRectStackDepth] = gClipRectY0
		gClipRectStackX1[gClipRectStackDepth] = gClipRectX1
		gClipRectStackY1[gClipRectStackDepth] = gClipRectY1

		local x0, y0, x1, y1 = R_resolveClipRect(x, y, width, height)
		R_setClipRectBounds(max(gClipRectX0, x0), max(gClipRectY0, y0), min(gClipRectX1, x1), min(gClipRectY1, y1))
	end

	function R_popClipRect()
		if gClipRectStackDepth <= 0 then
			return
		end
		R_setClipRectBounds(
			gClipRectStackX0[gClipRectStackDepth],
			gClipRectStackY0[gClipRectStackDepth],
			gClipRectStackX1[gClipRectStackDepth],
			gClipRectStackY1[gClipRectStackDepth]
		)
		gClipRectStackDepth = gClipRectStackDepth - 1
	end
	gFrameBuffer_ObjectId = {}
	-- screen buffer; maps linear index to style.
	-- style refers to debug overlay palette.
	-- 0 = no overlay, 1 = bg, 2 = fg
	local gFrameBuffer_EditorOverlay = {}
	gCurrentObjectId = 0
	-- current object-local outline request; consumed by primitive/mesh renderers
	gCurrentOutlineMaterialIndex = nil
	gCurrentOutlineTone = 0
	local gEditorOverlayEnabled = true
	local gEditorOverlayPaletteStart = 16 - 2
	local gEditorOverlayPaletteBlack = { 0, 0, 0 }
	local gEditorOverlayPaletteWhite = { 255, 255, 255 }
	-- sparse overlay support...
	local gOutlineOverlayStamp = 0
	local gOutlineOverlaySeen = {}
	local gOutlineOverlayTouched = {}
	local gOutlineOverlayTouchedCount = 0
	local gOutlineOverlayMaterial = {}
	local gOutlineOverlayTone = {}
	local gOutlineOverlaySourceId = {}
	local gOutlineOverlayDepth = {}
	function R_setCurrentObjectId(id)
		gCurrentObjectId = id
	end
	function R_getObjectIdAt(x, y)
		return gFrameBuffer_ObjectId[y * 240 + x]
	end

	function R_getDepthAt(x, y)
		return gFrameBuffer_Depth[y * 240 + x]
	end

	function R_setEditorOverlayEnabled(enabled)
		gEditorOverlayEnabled = enabled == true
	end

	function R_setEditorOverlayLinearIndex(linearIndex, style)
		if linearIndex < 0 or linearIndex >= (240 * 136) then
			return
		end
		if gOutlineOverlaySeen[linearIndex] ~= gOutlineOverlayStamp then
			gOutlineOverlaySeen[linearIndex] = gOutlineOverlayStamp
			gOutlineOverlayTouchedCount = gOutlineOverlayTouchedCount + 1
			gOutlineOverlayTouched[gOutlineOverlayTouchedCount] = linearIndex
		end
		gFrameBuffer_EditorOverlay[linearIndex] = style
	end

	function R_setEditorOverlayPixel(sx, sy, style)
		local x = sx // 1
		local y = sy // 1
		if x < 0 or x >= 240 or y < 0 or y >= 136 then
			return
		end
		R_setEditorOverlayLinearIndex(y * 240 + x, style or 2)
	end

	function R_editorOverlayLine(x1, y1, x2, y2, style)
		style = style or 2
		local dx = x2 - x1
		local dy = y2 - y1
		local steps = max(abs(dx), abs(dy)) // 1
		if steps <= 0 then
			R_setEditorOverlayPixel(((x1 + 0.5) // 1), ((y1 + 0.5) // 1), style)
			return
		end

		local posAlong01 = 0
		local posIncrement = 1 / steps
		local prevSx = -9999
		local prevSy = -9999
		for step = 0, steps do
			local sx = (((x1 + (x2 - x1) * posAlong01) + 0.5) // 1)
			local sy = (((y1 + (y2 - y1) * posAlong01) + 0.5) // 1)
			if sx ~= prevSx or sy ~= prevSy then
				R_setEditorOverlayPixel(sx, sy, style)
				prevSx = sx
				prevSy = sy
			end
			posAlong01 = posAlong01 + posIncrement
		end
	end

	function R_editorOverlayCrosshair(x, y, radius, style)
		local r = radius or 4
		R_editorOverlayLine(x - r, y, x + r, y, style)
		R_editorOverlayLine(x, y - r, x, y + r, style)
	end

	-- Depth-tested line that writes to the editor overlay buffer (FG white) instead of the scene framebuffer.
	-- Use this for gizmo geometry that must be depth-tested against the scene but should always appear
	-- in the reserved editor palette color rather than consuming a scene material slot.
	function R_line_z_editorOverlay(x1, y1, depth1, x2, y2, depth2)
		local cx1, cy1, cx2, cy2, t0, t1 = ClipLineToScreen(x1, y1, x2, y2)
		if cx1 == nil then
			return
		end

		local cd1 = (depth1 + (depth2 - depth1) * t0)
		local cd2 = (depth1 + (depth2 - depth1) * t1)
		local dx = cx2 - cx1
		local dy = cy2 - cy1
		local steps = max(abs(dx), abs(dy)) // 1
		local prevSx = -9999
		local prevSy = -9999

		if steps <= 0 then
			local linearIndex = ((cy1 + 0.5) // 1) * 240 + ((cx1 + 0.5) // 1)
			if cd1 > gFrameBuffer_Depth[linearIndex] then
				gFrameBuffer_EditorOverlay[linearIndex] = 2
			end
			return
		end

		local posAlong01 = 0
		local posIncrement = 1 / steps
		for step = 0, steps do
			local sx = (((cx1 + (cx2 - cx1) * posAlong01) + 0.5) // 1)
			local sy = (((cy1 + (cy2 - cy1) * posAlong01) + 0.5) // 1)
			if sx ~= prevSx or sy ~= prevSy then
				local linearIndex = sy * 240 + sx
				local depth = (cd1 + (cd2 - cd1) * posAlong01)
				if depth > gFrameBuffer_Depth[linearIndex] then
					gFrameBuffer_EditorOverlay[linearIndex] = 2
				end
				prevSx = sx
				prevSy = sy
			end
			posAlong01 = posAlong01 + posIncrement
		end
	end

	function R_clearCurrentOutline()
		gCurrentOutlineMaterialIndex = nil
		gCurrentOutlineTone = 0
	end

	function R_setCurrentOutline(materialIndex, tone)
		gCurrentOutlineMaterialIndex = materialIndex
		gCurrentOutlineTone = tone or 0
	end

	function R_hasCurrentOutline()
		return gCurrentOutlineMaterialIndex ~= nil and gCurrentObjectId ~= nil
	end

	function R_beginOutlineOverlay()
		-- todo: table.move from a cached clear state.
		for i = 1, gOutlineOverlayTouchedCount do
			gFrameBuffer_EditorOverlay[gOutlineOverlayTouched[i]] = 0
		end
		gOutlineOverlayStamp = gOutlineOverlayStamp + 1
		gOutlineOverlayTouchedCount = 0
	end

	-- records touched outline pixels; depthValue is nil for 2D stamps
	function R_overlayOutlinePixel(linearIndex, sourceObjectId, materialIndex, tone, depthValue)
		-- ASSUME caller has already bounds-checked. skip bounds check for performance.

		if gOutlineOverlaySeen[linearIndex] ~= gOutlineOverlayStamp then
			gOutlineOverlaySeen[linearIndex] = gOutlineOverlayStamp
			gOutlineOverlayTouchedCount = gOutlineOverlayTouchedCount + 1
			gOutlineOverlayTouched[gOutlineOverlayTouchedCount] = linearIndex
			gOutlineOverlayMaterial[linearIndex] = materialIndex
			gOutlineOverlayTone[linearIndex] = tone
			gOutlineOverlaySourceId[linearIndex] = sourceObjectId
			gOutlineOverlayDepth[linearIndex] = depthValue
			return
		end

		local currentDepthValue = gOutlineOverlayDepth[linearIndex]
		if currentDepthValue == nil and depthValue ~= nil then
			gOutlineOverlayMaterial[linearIndex] = materialIndex
			gOutlineOverlayTone[linearIndex] = tone
			gOutlineOverlaySourceId[linearIndex] = sourceObjectId
			gOutlineOverlayDepth[linearIndex] = depthValue
			return
		end
		if currentDepthValue ~= nil and depthValue ~= nil and depthValue > currentDepthValue then
			gOutlineOverlayMaterial[linearIndex] = materialIndex
			gOutlineOverlayTone[linearIndex] = tone
			gOutlineOverlaySourceId[linearIndex] = sourceObjectId
			gOutlineOverlayDepth[linearIndex] = depthValue
			return
		end
		if currentDepthValue == depthValue and tone >= gOutlineOverlayTone[linearIndex] then
			gOutlineOverlayMaterial[linearIndex] = materialIndex
			gOutlineOverlayTone[linearIndex] = tone
			gOutlineOverlaySourceId[linearIndex] = sourceObjectId
			gOutlineOverlayDepth[linearIndex] = depthValue
		end
	end

	-- renders the overlay on top of the frame buffer
	function R_flushOutlineOverlay()
		for i = 1, gOutlineOverlayTouchedCount do
			local linearIndex = gOutlineOverlayTouched[i]
			local depthValue = gOutlineOverlayDepth[linearIndex]
			local apply = false
			if depthValue ~= nil then
				apply = depthValue > gFrameBuffer_Depth[linearIndex]
			else
				apply = gFrameBuffer_ObjectId[linearIndex] ~= gOutlineOverlaySourceId[linearIndex]
			end
			if apply then
				gFrameBuffer_EditorOverlay[linearIndex] = 2 -- gOutlineOverlayTone[linearIndex] >= 0.9 and 2 or 1
			end
		end
	end

	local gLineLmin = {} -- indexed by dynamic material index; updated each frame in ScanLineStats
	local gLineLmax = {}
	local gLineCount = {} -- dynamic-material pixel counts for the current scanline
	local gLineSlots = {} -- palette slots assigned to each dynamic material for the current scanline
	local gLineBaseIndex = {} -- starting palette slot for each dynamic material on the current scanline
	local gLineStamp = {} -- last scanline stamp where a dynamic material was seen
	local gLineMapScale = {} -- tone-to-slot multiplier for the current scanline
	local gLineMapBias = {} -- tone-to-slot additive bias for the current scanline
	local gLineMapDitherScale = {} -- Bayer-to-slot multiplier for the current scanline
	local gLineMapMax = {} -- upper clamp for the computed slot index on the current scanline

	local gActiveMaterials = {} -- list of dynamic materials touched on the current scanline
	local gActiveMaterialCount = 0
	local gImportanceTmp = {} -- temporary importance weights used during slot allocation
	local gExtraTmp = {} -- scratch table; holds the # of extra slots allocated beyond the default 1 per material.
	local gRemainderTmp = {} -- scratch table; holds fractional leftover shares for largest-remainder allocation.
	local gLineStampCounter = 0 -- serial # scanline stamp for sparse row tracking

	-- changes the importance curve for slot allocation to materials.
	-- the issue this tries to solve is that number of slots vs. perception is not linear at all.
	-- changing 1 slot to 2 slots is a huge perceptual difference, but 7 to 8 slots is not much.
	-- lower values = boosts importance of small slot count changes.
	-- linear = 1.
	local LINE_SLOT_RANGE_EXPONENT = 0.5

	local gMaterials = {} -- frame material table; static materials first, then dynamic materials
	local gMaterialLuts = {} -- material.lut of materials
	local gMaterialDitherAmount = {} -- material.ditherAmount of materials
	local gStaticCount = 0
	local gDynamicPaletteCount = 16
	local gEditorOverlayReservedPaletteCount = 2
	local gDynamicMaterialCount = 0
	local gPaletteLineBytes = 16 * 3
	gStaticPaletteStart = 0
	local gFrameMetrics = nil
	local gMetricsStaticMaterialsSeen = {}
	local gMetricsDynamicMaterialsSeen = {}

	function R_clearMetricsSeen()
		for materialIndex, _ in pairs(gMetricsStaticMaterialsSeen) do
			gMetricsStaticMaterialsSeen[materialIndex] = nil
		end
		for materialIndex, _ in pairs(gMetricsDynamicMaterialsSeen) do
			gMetricsDynamicMaterialsSeen[materialIndex] = nil
		end
	end

	function R_noteTrianglesRendered(count)
		if gFrameMetrics == nil or count == nil or count <= 0 then
			return
		end
		gFrameMetrics.trianglesRendered = (gFrameMetrics.trianglesRendered or 0) + count
	end

	-- for debugging, tracks unique RGB colors used
	gUniqueColorsInScene = {}
	gUniqueColorsInSceneCount = 0

	function RegisterColorInScene(rgb)
		if not gUniqueColorsInScene[rgb] then
			gUniqueColorsInScene[rgb] = true
			gUniqueColorsInSceneCount = gUniqueColorsInSceneCount + 1
		end
	end

	for pixelIndex = 0, 240 * 136 - 1 do
		gFrameBuffer_Material[pixelIndex] = 0
		gFrameBuffer_Tone[pixelIndex] = 0
		gFrameBuffer_Depth[pixelIndex] = -1e30
		gFrameBuffer_ObjectId[pixelIndex] = 0
		gFrameBuffer_EditorOverlay[pixelIndex] = 0
	end

	for row = 0, 136 - 1 do
		gBorderBuffer_Material[row] = 0
	end

	function SetPaletteRgb(index, rgb)
		local pk = poke
		local base = 0x3FC0 + index * 3
		pk(base, rgb[1])
		pk(base + 1, rgb[2])
		pk(base + 2, rgb[3])
	end

	function R_resolveMaterial(material)
		return material.lut, material.ditherAmount
	end

	function ScanLineStats(row)
		gLineStampCounter = gLineStampCounter + 1
		local rowStamp = gLineStampCounter
		local rowBase = row * 240
		local frameBufferMaterial = gFrameBuffer_Material
		local frameBufferTone = gFrameBuffer_Tone
		local lineLmin = gLineLmin
		local lineLmax = gLineLmax
		local lineCount = gLineCount
		local lineSlots = gLineSlots
		local lineBaseIndex = gLineBaseIndex
		local lineStamp = gLineStamp
		local activeMaterials = gActiveMaterials
		local staticCount = gStaticCount
		local minusStaticCountMinus1 = -gStaticCount - 1
		local activeCount = 0

		-- HOT PATH
		for sx = 0, 240 - 1 do
			local rowBase2 = rowBase + sx -- surprisingly does help performance to do this. 1650 -> 1638.
			local materialIndex = frameBufferMaterial[rowBase2]
			if materialIndex > staticCount then
				local tone = frameBufferTone[rowBase2]
				local dynamicIndex = materialIndex + minusStaticCountMinus1 --  RENDERER_DYNAMIC_INDEX(materialIndex)
				if lineStamp[dynamicIndex] ~= rowStamp then
					lineStamp[dynamicIndex] = rowStamp
					activeCount = activeCount + 1
					activeMaterials[activeCount] = dynamicIndex
					lineLmin[dynamicIndex] = tone
					lineLmax[dynamicIndex] = tone
					lineCount[dynamicIndex] = 1
					lineSlots[dynamicIndex] = 0
					lineBaseIndex[dynamicIndex] = 0
				else
					if tone < lineLmin[dynamicIndex] then
						lineLmin[dynamicIndex] = tone
					end
					if tone > lineLmax[dynamicIndex] then
						lineLmax[dynamicIndex] = tone
					end
					lineCount[dynamicIndex] = lineCount[dynamicIndex] + 1
				end
			end
		end

		gActiveMaterialCount = activeCount
	end

	function AllocateSlotsForLine()
		local activeCount = gActiveMaterialCount
		local totalSlots = 0
		local activeMaterials = gActiveMaterials

		for i = 1, activeCount do
			local dynamicIndex = activeMaterials[i]
			gImportanceTmp[dynamicIndex] = 0
			gExtraTmp[dynamicIndex] = 0
			gRemainderTmp[dynamicIndex] = 0

			if totalSlots < gDynamicPaletteCount then
				gLineSlots[dynamicIndex] = 1
				totalSlots = totalSlots + 1
			else
				gLineSlots[dynamicIndex] = 0
			end
		end

		if activeCount == 0 then
			return
		end

		local remaining = gDynamicPaletteCount - totalSlots
		if remaining > 0 then
			local sumImportance = 0
			for i = 1, activeCount do
				local dynamicIndex = activeMaterials[i]
				local range = gLineLmax[dynamicIndex] - gLineLmin[dynamicIndex]
				if range < 0 then
					range = 0
				end
				local importance = gLineCount[dynamicIndex] * ((range + 0.001) ^ LINE_SLOT_RANGE_EXPONENT)
				gImportanceTmp[dynamicIndex] = importance
				sumImportance = sumImportance + importance
			end

			if sumImportance <= 0 then
				sumImportance = activeCount
				for i = 1, activeCount do
					gImportanceTmp[activeMaterials[i]] = 1
				end
			end

			local usedExtra = 0
			for i = 1, activeCount do
				local dynamicIndex = activeMaterials[i]
				local share = remaining * (gImportanceTmp[dynamicIndex] / sumImportance)
				local extra = share // 1
				gExtraTmp[dynamicIndex] = extra
				gRemainderTmp[dynamicIndex] = share - extra
				usedExtra = usedExtra + extra
			end

			local leftover = remaining - usedExtra
			while leftover > 0 do
				local bestDynamicIndex = activeMaterials[1]
				local bestRemainder = gRemainderTmp[bestDynamicIndex]
				local bestImportance = gImportanceTmp[bestDynamicIndex]
				for i = 2, activeCount do
					local dynamicIndex = activeMaterials[i]
					local remainder = gRemainderTmp[dynamicIndex]
					local importance = gImportanceTmp[dynamicIndex]
					if remainder > bestRemainder or (remainder == bestRemainder and importance > bestImportance) then
						bestRemainder = remainder
						bestImportance = gImportanceTmp[dynamicIndex]
						bestDynamicIndex = dynamicIndex
					end
				end
				gExtraTmp[bestDynamicIndex] = gExtraTmp[bestDynamicIndex] + 1
				gRemainderTmp[bestDynamicIndex] = -1
				leftover = leftover - 1
			end

			for i = 1, activeCount do
				local dynamicIndex = activeMaterials[i]
				gLineSlots[dynamicIndex] = 1 + gExtraTmp[dynamicIndex]
			end
		end

		local paletteIndex = 0
		for i = 1, activeCount do
			local dynamicIndex = activeMaterials[i]
			if gLineSlots[dynamicIndex] > 0 then
				gLineBaseIndex[dynamicIndex] = paletteIndex
				paletteIndex = paletteIndex + gLineSlots[dynamicIndex]
			else
				gLineBaseIndex[dynamicIndex] = 0
			end
		end
	end

	function PrepareLineMappingConstants()
		local activeCount = gActiveMaterialCount
		local activeMaterials = gActiveMaterials

		for i = 1, activeCount do
			local dynamicIndex = activeMaterials[i]
			local slotCount = gLineSlots[dynamicIndex]
			if slotCount > 0 then
				local materialIndex = (gStaticCount + dynamicIndex + 1)
				local ditherAmount = gMaterialDitherAmount[materialIndex]
				local toneRange = gLineLmax[dynamicIndex] - gLineLmin[dynamicIndex]
				if slotCount <= 1 or toneRange < 0.001 then
					gLineMapScale[dynamicIndex] = 0
					gLineMapBias[dynamicIndex] = 0
					gLineMapDitherScale[dynamicIndex] = 0
					gLineMapMax[dynamicIndex] = 0
				else
					local scale = (slotCount - 1) / toneRange
					gLineMapScale[dynamicIndex] = scale
					gLineMapBias[dynamicIndex] = 0.5 - gLineLmin[dynamicIndex] * scale
					gLineMapDitherScale[dynamicIndex] = ditherAmount
					gLineMapMax[dynamicIndex] = slotCount - 0.0001
				end
			else
				gLineMapScale[dynamicIndex] = 0
				gLineMapBias[dynamicIndex] = 0
				gLineMapDitherScale[dynamicIndex] = 0
				gLineMapMax[dynamicIndex] = 0
			end
		end
	end

	function BuildPaletteForLine(row)
		--ClearLinePalette(row) -- not needed
		local rowBase = 0x4000 + row * gPaletteLineBytes
		local activeCount = gActiveMaterialCount
		local activeMaterials = gActiveMaterials
		local lineSlots = gLineSlots
		local lineBaseIndex = gLineBaseIndex
		local lineLmin = gLineLmin
		local lineLmax = gLineLmax
		local pk = poke

		for i = 1, activeCount do
			local dynamicIndex = activeMaterials[i]
			local slotCount = lineSlots[dynamicIndex]
			if slotCount > 0 then
				local materialLut = gMaterialLuts[(gStaticCount + dynamicIndex + 1)]
				local toneMin = lineLmin[dynamicIndex]
				local toneRange = lineLmax[dynamicIndex] - toneMin
				local writeBase = rowBase + lineBaseIndex[dynamicIndex] * 3
				if slotCount == 1 or toneRange < 0.001 then
					local avgTone = toneMin + toneRange / 2 -- single slot can't dither so use avg tone.
					local i = ((avgTone < 0 and 0 or (avgTone > 1 and 1 or avgTone)) * (128 - 1)) // 1
					local rgb = materialLut[i]
					RegisterColorInScene(rgb[4])
					pk(writeBase, rgb[1])
					pk(writeBase + 1, rgb[2])
					pk(writeBase + 2, rgb[3])
				else
					local toneStep = (slotCount > 1) and (toneRange / (slotCount - 1))
					for slotIndex = 0, slotCount - 1 do
						-- while you can avoid a multiply by just incrementing by a toneStep each loop,
						-- that will cause an error where the value can drift; and if it doesn't reach the exact
						-- toneMax, then the last slot will be off. Whites become like #fefefe when in the presence of other gradients.
						local tone = toneMin + toneStep * slotIndex

						local i = ((tone < 0 and 0 or (tone > 1 and 1 or tone)) * (128 - 1)) // 1
						local rgb = materialLut[i]
						RegisterColorInScene(rgb[4])
						pk(writeBase, rgb[1])
						pk(writeBase + 1, rgb[2])
						pk(writeBase + 2, rgb[3])

						writeBase = writeBase + 3
					end
				end
			end
		end
	end

	-- config is {
	--   materials = {
	--     staticCount = number of materials to treat as static (starting from index 1)
	--     materials = ...
	--   },
	-- }
	function R_beginFrame(config)
		R_resetClipRect()
		gFrameMetrics = config.metrics
		R_clearMetricsSeen()
		if gFrameMetrics ~= nil then
			gFrameMetrics.dynamicMaterialsUsed = 0
			gFrameMetrics.staticMaterialsUsed = 0
		end
		gUniqueColorsInScene = {}
		gUniqueColorsInSceneCount = 0
		R_beginOutlineOverlay()
		R_clearCurrentOutline()
		R_setCurrentObjectId(0)
		local materialConfig = config.materials or {}
		gMaterials = materialConfig.materials or {}
		gEditorOverlayReservedPaletteCount = gEditorOverlayEnabled and 2 or 0
		gStaticCount = materialConfig.staticCount or 0
		gStaticCount = (
			gStaticCount < 0 and 0
			or (
				gStaticCount > (min(#gMaterials, 16 - gEditorOverlayReservedPaletteCount))
					and (min(#gMaterials, 16 - gEditorOverlayReservedPaletteCount))
				or gStaticCount
			)
		)
		gDynamicPaletteCount = 16 - gStaticCount - gEditorOverlayReservedPaletteCount
		gStaticPaletteStart = gDynamicPaletteCount
		gEditorOverlayPaletteStart = gStaticPaletteStart + gStaticCount
		gDynamicMaterialCount = #gMaterials - gStaticCount
		gPaletteLineBytes = gDynamicPaletteCount * 3

		for materialIndex = 1, #gMaterials do
			gMaterialLuts[materialIndex], gMaterialDitherAmount[materialIndex] =
				R_resolveMaterial(gMaterials[materialIndex])
		end

		for staticIndex = 1, gStaticCount do
			local materialLut = gMaterialLuts[staticIndex]
			local rgb = materialLut[0] -- tone ignored for static materials
			SetPaletteRgb((gStaticPaletteStart + staticIndex - 1), rgb)
		end
	end

	local gFrameBuffer_Depth_Clear = {}
	for i = 1, (240 * 136) do
		gFrameBuffer_Depth_Clear[i] = -1e30
	end
	local gFrameBuffer_ObjectId_Clear = {}
	for i = 1, (240 * 136) do
		gFrameBuffer_ObjectId_Clear[i] = 0
	end

	local gMaterialTemplates = {} -- cache by materialIndex
	local gToneClearTemplates = {} -- cache by toneValue; each is a table of SCREEN_PIXEL_COUNT() entries
	local gClearSpanTemplates = {}

	function R_getClearSpanTemplate(cache, fillValue, span)
		local bySpan = cache[fillValue]
		if bySpan == nil then
			bySpan = {}
			TFASSERT(fillValue ~= nil, "fillValue cannot be nil")
			cache[fillValue] = bySpan
		end

		local tpl = bySpan[span]
		local lmin = math.min
		local tblMove = table.move
		if tpl == nil then
			tpl = {}
			tpl[1] = fillValue
			local filled = 1
			while filled < span do
				local copyCount = lmin(filled, span - filled)
				tblMove(tpl, 1, copyCount, filled + 1, tpl)
				filled = filled + copyCount
			end
			bySpan[span] = tpl
		end

		return tpl
	end

	function GetMaterialTemplate(materialIndex)
		local tpl = gMaterialTemplates[materialIndex]
		if not tpl then
			tpl = {}
			for i = 1, (240 * 136) do
				tpl[i] = materialIndex
			end
			gMaterialTemplates[materialIndex] = tpl
		end
		return tpl
	end

	function GetToneClearTemplate(toneValue)
		local tpl = gToneClearTemplates[toneValue]
		if not tpl then
			tpl = {}
			for i = 1, (240 * 136) do
				tpl[i] = toneValue
			end
			gToneClearTemplates[toneValue] = tpl
		end
		return tpl
	end

	function R_clearRect(x, y, width, height, materialIndex, tone)
		if materialIndex == nil then
			return
		end
		local x0 = ((x // 1) < 0 and 0 or ((x // 1) > 240 and 240 or (x // 1)))
		local y0 = ((y // 1) < 0 and 0 or ((y // 1) > 136 and 136 or (y // 1)))
		local x1 = (((x + width) // 1) < 0 and 0 or (((x + width) // 1) > 240 and 240 or ((x + width) // 1)))
		local y1 = (((y + height) // 1) < 0 and 0 or (((y + height) // 1) > 136 and 136 or ((y + height) // 1)))
		local screenWidth = 240
		local span = x1 - x0
		if span <= 0 or y1 <= y0 then
			return
		end

		local toneValue = tone or 0

		-- Full-width clears are contiguous in memory so bulk copy
		if x0 == 0 and x1 == screenWidth then
			local clearCount = (y1 - y0) * screenWidth
			local dstIndex = y0 * screenWidth
			table.move(GetMaterialTemplate(materialIndex), 1, clearCount, dstIndex, gFrameBuffer_Material)
			table.move(gFrameBuffer_Depth_Clear, 1, clearCount, dstIndex, gFrameBuffer_Depth)
			table.move(GetToneClearTemplate(toneValue), 1, clearCount, dstIndex, gFrameBuffer_Tone)
			table.move(gFrameBuffer_ObjectId_Clear, 1, clearCount, dstIndex, gFrameBuffer_ObjectId)
			return
		end

		local materialTemplate = R_getClearSpanTemplate(gClearSpanTemplates, materialIndex, span)
		local toneTemplate = R_getClearSpanTemplate(gClearSpanTemplates, toneValue, span)
		local depthTemplate = R_getClearSpanTemplate(gClearSpanTemplates, -1e30, span)
		local objectIdTemplate = R_getClearSpanTemplate(gClearSpanTemplates, 0, span)

		for sy = y0, y1 - 1 do
			local dstIndex = sy * screenWidth + x0
			table.move(materialTemplate, 1, span, dstIndex, gFrameBuffer_Material)
			table.move(depthTemplate, 1, span, dstIndex, gFrameBuffer_Depth)
			table.move(toneTemplate, 1, span, dstIndex, gFrameBuffer_Tone)
			table.move(objectIdTemplate, 1, span, dstIndex, gFrameBuffer_ObjectId)
		end
	end

	function R_clear(materialIndex, tone)
		R_clearRect(0, 0, 240, 136, materialIndex, tone)
	end

	function R_present()
		local frameBufferMaterial = gFrameBuffer_Material
		local frameBufferTone = gFrameBuffer_Tone
		local borderBufferMaterial = gBorderBuffer_Material
		local frameBufferEditorOverlay = gFrameBuffer_EditorOverlay
		local editorOverlayEnabled = gEditorOverlayEnabled
		local editorOverlayPaletteStart = gEditorOverlayPaletteStart
		local lineSlots = gLineSlots
		local lineBaseIndex = gLineBaseIndex
		local lineMapScale = gLineMapScale
		local lineMapBias = gLineMapBias
		local lineMapDitherScale = gLineMapDitherScale
		local lineMapMax = gLineMapMax
		local staticCount = gStaticCount
		local frameMetrics = gFrameMetrics
		local metricsStaticMaterialsSeen = gMetricsStaticMaterialsSeen
		local metricsDynamicMaterialsSeen = gMetricsDynamicMaterialsSeen
		gUniqueColorsInSceneCount = gStaticCount -- these don't get counted later in dynamic entries; start here.
		local negStaticCountMinus1 = -staticCount - 1
		local staticPaletteStartMinusOne = gStaticPaletteStart - 1
		local bayerMinusHalf = BAYER_MINUS_5

		local pk4 = poke4

		for row = 0, 136 - 1 do
			ScanLineStats(row)
			if frameMetrics ~= nil then
				for activeIndex = 1, gActiveMaterialCount do
					local materialIndex = (gStaticCount + gActiveMaterials[activeIndex] + 1)
					if metricsDynamicMaterialsSeen[materialIndex] ~= true then
						metricsDynamicMaterialsSeen[materialIndex] = true
						frameMetrics.dynamicMaterialsUsed = (frameMetrics.dynamicMaterialsUsed or 0) + 1
					end
				end
				local borderMaterialIndex = borderBufferMaterial[row]
				if borderMaterialIndex ~= nil and borderMaterialIndex > 0 then
					if borderMaterialIndex <= staticCount then
						if metricsStaticMaterialsSeen[borderMaterialIndex] ~= true then
							metricsStaticMaterialsSeen[borderMaterialIndex] = true
							frameMetrics.staticMaterialsUsed = (frameMetrics.staticMaterialsUsed or 0) + 1
						end
					elseif metricsDynamicMaterialsSeen[borderMaterialIndex] ~= true then
						metricsDynamicMaterialsSeen[borderMaterialIndex] = true
						frameMetrics.dynamicMaterialsUsed = (frameMetrics.dynamicMaterialsUsed or 0) + 1
					end
				end
			end
			AllocateSlotsForLine()
			PrepareLineMappingConstants()
			BuildPaletteForLine(row)

			-- HOT PATH
			local rowBase = row * 240
			local linIndex0 = rowBase
			local linIndex1 = rowBase + 240 - 1
			for linIndex = linIndex0, linIndex1 do
				local materialIndex = frameBufferMaterial[linIndex]
				if materialIndex <= staticCount then
					-- static material
					if
						frameMetrics ~= nil
						and materialIndex > 0
						and metricsStaticMaterialsSeen[materialIndex] ~= true
					then
						metricsStaticMaterialsSeen[materialIndex] = true
						frameMetrics.staticMaterialsUsed = (frameMetrics.staticMaterialsUsed or 0) + 1
					end
					pk4(linIndex, staticPaletteStartMinusOne + materialIndex)
				else
					local dynamicIndex = materialIndex + negStaticCountMinus1
					local slotCount = lineSlots[dynamicIndex]
					local slotIndex = frameBufferTone[linIndex] * lineMapScale[dynamicIndex]
						+ lineMapBias[dynamicIndex]
						+ bayerMinusHalf[linIndex] * lineMapDitherScale[dynamicIndex]
					pk4(linIndex, lineBaseIndex[dynamicIndex] + slotIndex)
				end
				if editorOverlayEnabled then
					local overlayStyle = frameBufferEditorOverlay[linIndex]
					if overlayStyle == 1 then
						pk4(linIndex, 14) -- black
					elseif overlayStyle == 2 then
						pk4(linIndex, 15) -- white
						-- 	pk4(linIndex, editorOverlayPaletteStart + (((linIndex // 2) + row) % 2)) -- alternate black and white every 2 pixels, offset by row to create a checker pattern with larger squares
					end
				end
			end
		end
	end

	-- A NOTE about performance and placing things in SCN.
	-- tldr: don't do all the palette gen logic in SCN. it is very slightly faster but like, 0.1% (1500 -> 1498 kcyc)
	-- advantages:
	-- * no PALETTE_BUF needed; can write directly to PALETTE_RAM
	-- * avoids a loop (lets the tic80 system do the scanline loop itself)
	-- disadvantages:
	-- * there are performance optimizations available by doing everything in 1 function; pulling in locals, precalculating some things.
	-- * less flexible; better in general to just keep code in the same path
	-- * biggest: it forces ALL rendering to use the dynamic system. TIC() no longer has a place to
	--   put post-render debug HUD etc.
	function R_scanline(row, debugPalette)
		if gPaletteLineBytes > 0 then
			memcpy(0x3FC0, 0x4000 + row * gPaletteLineBytes, gPaletteLineBytes)
		end
		if gEditorOverlayEnabled then
			SetPaletteRgb(gEditorOverlayPaletteStart, gEditorOverlayPaletteBlack)
			SetPaletteRgb(gEditorOverlayPaletteStart + 1, gEditorOverlayPaletteWhite)
		end

		local borderMaterialIndex = gBorderBuffer_Material[row]
		poke(0x3FF8, (gStaticPaletteStart + borderMaterialIndex - 1))

		if debugPalette then
			local rowBase = row * 240
			local pk4 = poke4
			for paletteIndex = 0, 16 - 1 do
				pk4(rowBase + paletteIndex, paletteIndex)
			end
		end
	end
end

--local gTriEdgeWalkerThreshold = 2

-- 2 was chosen based on testing; lower values prove that gains are not guaranteed this way;
-- higher values use old bbox method which wastes a lot of time on empty space.
-- seems odd for such a low threshold but the numbers don't lie; this was the winner on both
-- high-small-tri scenes and low-large-tri scenes.
-- it basically means that the overhead by edge calc is not that expensive.

local gFillMaterialTemplates = {}
local gFillToneTemplates = {}

local gFillObjectIdTemplates = {}

-- 4-neighbor fringe for custom2d scene objects
function R_outlineStampPixelForCurrentObject(sx, sy)
	if not R_hasCurrentOutline() then
		return
	end

	local outlineMat = gCurrentOutlineMaterialIndex
	local outlineTone = gCurrentOutlineTone
	local sourceObjectId = gCurrentObjectId
	local rowBase = sy * 240
	if sx > gClipRectX0 then
		R_overlayOutlinePixel(rowBase + sx - 1, sourceObjectId, outlineMat, outlineTone, nil)
	end
	if sx + 1 < gClipRectX1 then
		R_overlayOutlinePixel(rowBase + sx + 1, sourceObjectId, outlineMat, outlineTone, nil)
	end
	if sy > gClipRectY0 then
		R_overlayOutlinePixel(rowBase - 240 + sx, sourceObjectId, outlineMat, outlineTone, nil)
	end
	if sy + 1 < gClipRectY1 then
		R_overlayOutlinePixel(rowBase + 240 + sx, sourceObjectId, outlineMat, outlineTone, nil)
	end
end

-- span version for performance
function R_outlineStampSpanForCurrentObject(x0, x1, sy)
	if not R_hasCurrentOutline() or x1 <= x0 then
		return
	end

	local outlineMat = gCurrentOutlineMaterialIndex
	local outlineTone = gCurrentOutlineTone
	local sourceObjectId = gCurrentObjectId
	local rowBase = sy * 240
	if x0 > gClipRectX0 then
		R_overlayOutlinePixel(rowBase + x0 - 1, sourceObjectId, outlineMat, outlineTone, nil)
	end
	if x1 < gClipRectX1 then
		R_overlayOutlinePixel(rowBase + x1, sourceObjectId, outlineMat, outlineTone, nil)
	end
	if sy > gClipRectY0 then
		local rowAbove = rowBase - 240
		for sx = x0, x1 - 1 do
			R_overlayOutlinePixel(rowAbove + sx, sourceObjectId, outlineMat, outlineTone, nil)
		end
	end
	if sy + 1 < gClipRectY1 then
		local rowBelow = rowBase + 240
		for sx = x0, x1 - 1 do
			R_overlayOutlinePixel(rowBelow + sx, sourceObjectId, outlineMat, outlineTone, nil)
		end
	end
end

-- column version for performance (vline calls)
function R_outlineStampColumnForCurrentObject(sx, y0, y1)
	if not R_hasCurrentOutline() or y1 <= y0 then
		return
	end
	local outlineMat = gCurrentOutlineMaterialIndex
	local outlineTone = gCurrentOutlineTone
	local sourceObjectId = gCurrentObjectId
	local W = 240
	if y0 > gClipRectY0 then
		R_overlayOutlinePixel((y0 - 1) * W + sx, sourceObjectId, outlineMat, outlineTone, nil)
	end
	if y1 < gClipRectY1 then
		R_overlayOutlinePixel(y1 * W + sx, sourceObjectId, outlineMat, outlineTone, nil)
	end
	if sx > gClipRectX0 then
		for sy = y0, y1 - 1 do
			R_overlayOutlinePixel(sy * W + sx - 1, sourceObjectId, outlineMat, outlineTone, nil)
		end
	end
	if sx + 1 < gClipRectX1 then
		for sy = y0, y1 - 1 do
			R_overlayOutlinePixel(sy * W + sx + 1, sourceObjectId, outlineMat, outlineTone, nil)
		end
	end
end

-- do NOT call this in primitive drawing functions for performance reasons.
-- instead always track your own linear index and write directly to
-- gFrameBuffer_Material and gFrameBuffer_Tone.
function R_pix(x, y, materialIndex, tone)
	if x < gClipRectX0 or x >= gClipRectX1 or y < gClipRectY0 or y >= gClipRectY1 then
		return
	end

	local linearIndex = y * 240 + x
	gFrameBuffer_Material[linearIndex] = materialIndex
	gFrameBuffer_Tone[linearIndex] = tone or 0
	gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
	R_outlineStampPixelForCurrentObject(x, y)
end

function R_getFillTemplate(cache, fillValue, span)
	local bySpan = cache[fillValue]
	if bySpan == nil then
		bySpan = {}
		TFASSERT(fillValue ~= nil, "fillValue cannot be nil")
		cache[fillValue] = bySpan
	end
	local tblMove = table.move
	local lmin = min

	local tpl = bySpan[span]
	if tpl == nil then
		tpl = {}
		tpl[1] = fillValue
		local filled = 1
		while filled < span do
			local copyCount = lmin(filled, span - filled)
			tblMove(tpl, 1, copyCount, filled + 1, tpl)
			filled = filled + copyCount
		end
		bySpan[span] = tpl
	end

	return tpl
end

-- potentially-useful, but not used in the current demo engine so commenting out.
-- function R_hline(x, width, y, materialIndex, tone)
-- 	local sy = y // 1
-- 	if sy < gClipRectY0 or sy >= gClipRectY1 then
-- 		return
-- 	end
-- 	if materialIndex == nil then
-- 		return
-- 	end

-- 	local x0 = CLAMP(x // 1, gClipRectX0, gClipRectX1)
-- 	local x1 = CLAMP((x + width) // 1, gClipRectX0, gClipRectX1)
-- 	local span = x1 - x0
-- 	if span <= 0 then
-- 		return
-- 	end
-- 	local rowBase = sy * TIC_WIDTH()
-- 	local dstIndex = rowBase + x0
-- 	table.move(
-- 		R_getFillTemplate(gFillMaterialTemplates, materialIndex, span),
-- 		1,
-- 		span,
-- 		dstIndex,
-- 		gFrameBuffer_Material
-- 	)
-- 	table.move(R_getFillTemplate(gFillToneTemplates, tone or 0, span), 1, span, dstIndex, gFrameBuffer_Tone)
-- 	--#if defined(EDITOR_FEATURES)
-- 	table.move(
-- 		R_getFillTemplate(gFillObjectIdTemplates, gCurrentObjectId, span),
-- 		1,
-- 		span,
-- 		dstIndex,
-- 		gFrameBuffer_ObjectId
-- 	)
-- 	R_outlineStampSpanForCurrentObject(x0, x1, sy)
-- 	--#endif
-- end

-- potentially-useful, but not used in the current demo engine so commenting out.
-- function R_hline_fn(x, width, y, shadeFn)
-- 	local sy = y // 1
-- 	if sy < gClipRectY0 or sy >= gClipRectY1 then
-- 		return
-- 	end

-- 	local x0 = CLAMP(x // 1, gClipRectX0, gClipRectX1)
-- 	local x1 = CLAMP((x + width) // 1, gClipRectX0, gClipRectX1)
-- 	local span = x1 - x0
-- 	local rowBase = sy * TIC_WIDTH()
-- 	-- how much to increment posAlong01 per pixel.
-- 	local dx = 1 / (span - 1)

-- 	local posAlong01 = 0
-- 	for sx = x0, x1 - 1 do
-- 		posAlong01 = posAlong01 + dx

-- 		local materialIndex, tone = shadeFn(sx, sy, posAlong01)
-- 		if materialIndex ~= nil then
-- 			gFrameBuffer_Material[rowBase + sx] = materialIndex
-- 			gFrameBuffer_Tone[rowBase + sx] = tone
-- 			--#if defined(EDITOR_FEATURES)
-- 			gFrameBuffer_ObjectId[rowBase + sx] = gCurrentObjectId
-- 			R_outlineStampPixelForCurrentObject(sx, sy)
-- 			--#endif
-- 		end
-- 	end
-- end

-- potentially-useful, but not used in the current demo engine so commenting out.
-- -- gradient version.
-- function R_hline_g(x, width, y, mat, toneA, toneB)
-- 	local sy = y // 1
-- 	if sy < gClipRectY0 or sy >= gClipRectY1 then
-- 		return
-- 	end
-- 	if mat == nil then
-- 		return
-- 	end

-- 	local x0 = CLAMP(x // 1, gClipRectX0, gClipRectX1)
-- 	local x1 = CLAMP((x + width) // 1, gClipRectX0, gClipRectX1)
-- 	local span = x1 - x0
-- 	local rowBase = sy * TIC_WIDTH()
-- 	local dtone = (toneB - toneA) / (span - 1)

-- 	local tone = toneA
-- 	for sx = x0, x1 - 1 do
-- 		gFrameBuffer_Material[rowBase + sx] = mat
-- 		tone = tone + dtone
-- 		gFrameBuffer_Tone[rowBase + sx] = tone
-- 		--#if defined(EDITOR_FEATURES)
-- 		gFrameBuffer_ObjectId[rowBase + sx] = gCurrentObjectId
-- 		--#endif
-- 	end
-- 	--#if defined(EDITOR_FEATURES)
-- 	R_outlineStampSpanForCurrentObject(x0, x1, sy)
-- 	--#endif
-- end

-- function R_vline(x, y, height, materialIndex, tone)
-- 	local sx = x // 1
-- 	if sx < gClipRectX0 or sx >= gClipRectX1 then
-- 		return
-- 	end
-- 	if materialIndex == nil then
-- 		return
-- 	end
-- 	local y0 = CLAMP(y // 1, gClipRectY0, gClipRectY1)
-- 	local y1 = CLAMP((y + height) // 1, gClipRectY0, gClipRectY1)
-- 	if y1 <= y0 then
-- 		return
-- 	end
-- 	local W = TIC_WIDTH()
-- 	local toneValue = tone or 0
-- 	for sy = y0, y1 - 1 do
-- 		local linearIndex = sy * W + sx
-- 		gFrameBuffer_Material[linearIndex] = materialIndex
-- 		gFrameBuffer_Tone[linearIndex] = toneValue
-- 		--#if defined(EDITOR_FEATURES)
-- 		gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
-- 		--#endif
-- 	end
-- 	--#if defined(EDITOR_FEATURES)
-- 	R_outlineStampColumnForCurrentObject(sx, y0, y1)
-- 	--#endif
-- end

-- potentially-useful, but not used in the current demo engine so commenting out.
-- function R_vline_fn(x, y, height, shadeFn)
-- 	local sx = x // 1
-- 	if sx < gClipRectX0 or sx >= gClipRectX1 then
-- 		return
-- 	end
-- 	local y0 = CLAMP(y // 1, gClipRectY0, gClipRectY1)
-- 	local y1 = CLAMP((y + height) // 1, gClipRectY0, gClipRectY1)
-- 	local span = y1 - y0
-- 	if span <= 0 then
-- 		return
-- 	end
-- 	local W = TIC_WIDTH()
-- 	local dy = 1 / (span - 1)
-- 	local posAlong01 = 0
-- 	for sy = y0, y1 - 1 do
-- 		posAlong01 = posAlong01 + dy
-- 		local materialIndex, tone = shadeFn(sx, sy, posAlong01)
-- 		if materialIndex ~= nil then
-- 			local linearIndex = sy * W + sx
-- 			gFrameBuffer_Material[linearIndex] = materialIndex
-- 			gFrameBuffer_Tone[linearIndex] = tone
-- 			--#if defined(EDITOR_FEATURES)
-- 			gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
-- 			R_outlineStampPixelForCurrentObject(sx, sy)
-- 			--#endif
-- 		end
-- 	end
-- end

-- potentially-useful, but not used in the current demo engine so commenting out.
-- -- gradient version.
-- function R_vline_g(x, y, height, mat, toneA, toneB)
-- 	local sx = x // 1
-- 	if sx < gClipRectX0 or sx >= gClipRectX1 then
-- 		return
-- 	end
-- 	if mat == nil then
-- 		return
-- 	end
-- 	local y0 = CLAMP(y // 1, gClipRectY0, gClipRectY1)
-- 	local y1 = CLAMP((y + height) // 1, gClipRectY0, gClipRectY1)
-- 	local span = y1 - y0
-- 	if span <= 0 then
-- 		return
-- 	end
-- 	local W = TIC_WIDTH()
-- 	local dtone = (toneB - toneA) / (span - 1)
-- 	local tone = toneA
-- 	for sy = y0, y1 - 1 do
-- 		local linearIndex = sy * W + sx
-- 		gFrameBuffer_Material[linearIndex] = mat
-- 		tone = tone + dtone
-- 		gFrameBuffer_Tone[linearIndex] = tone
-- 		--#if defined(EDITOR_FEATURES)
-- 		gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
-- 		--#endif
-- 	end
-- 	--#if defined(EDITOR_FEATURES)
-- 	R_outlineStampColumnForCurrentObject(sx, y0, y1)
-- 	--#endif
-- end

-- materialIndex must be a static mat for the moment.
function R_border(y, length, materialIndex, tone)
	local _ = tone
	local y0 = ((y // 1) < 0 and 0 or ((y // 1) > 136 and 136 or (y // 1)))
	local y1 = (((y + length) // 1) < 0 and 0 or (((y + length) // 1) > 136 and 136 or ((y + length) // 1)))
	local span = y1 - y0
	if span <= 0 then
		return
	end

	table.move(R_getFillTemplate(gFillMaterialTemplates, materialIndex, span), 1, span, y0, gBorderBuffer_Material)
end

-- materialIndex must be a static mat for the moment.
function R_border_fn(y, length, shadeFn)
	local y0 = ((y // 1) < 0 and 0 or ((y // 1) > 136 and 136 or (y // 1)))
	local y1 = (((y + length) // 1) < 0 and 0 or (((y + length) // 1) > 136 and 136 or ((y + length) // 1)))
	local span = y1 - y0

	for row = y0, y1 - 1 do
		local posAlong01 = 0
		if span > 1 then
			posAlong01 = (row - y0) / (span - 1)
		end

		local materialIndex = shadeFn(row, posAlong01)
		gBorderBuffer_Material[row] = materialIndex
	end
end

-- Liang-Barsky line clipping to [0, W-1] x [0, H-1].
-- Returns cx1, cy1, cx2, cy2, t0, t1 (parametric entry/exit along the original line).
-- Returns nil if the segment is entirely outside the screen.
function ClipLineToScreen(x1, y1, x2, y2)
	if gClipRectX1 <= gClipRectX0 or gClipRectY1 <= gClipRectY0 then
		return nil
	end

	local dx = x2 - x1
	local dy = y2 - y1
	local t0 = 0.0
	local t1 = 1.0
	local p, q, t
	local clipMaxX = gClipRectX1 - 1
	local clipMaxY = gClipRectY1 - 1
	-- Left: x >= clip min x
	p = -dx
	q = x1 - gClipRectX0
	if p == 0 then
		if q < 0 then
			return nil
		end
	elseif p < 0 then
		t = q / p
		if t > t1 then
			return nil
		end
		if t > t0 then
			t0 = t
		end
	else
		t = q / p
		if t < t0 then
			return nil
		end
		if t < t1 then
			t1 = t
		end
	end
	-- Right: x <= clip max x
	p = dx
	q = clipMaxX - x1
	if p == 0 then
		if q < 0 then
			return nil
		end
	elseif p < 0 then
		t = q / p
		if t > t1 then
			return nil
		end
		if t > t0 then
			t0 = t
		end
	else
		t = q / p
		if t < t0 then
			return nil
		end
		if t < t1 then
			t1 = t
		end
	end
	-- Bottom: y >= clip min y
	p = -dy
	q = y1 - gClipRectY0
	if p == 0 then
		if q < 0 then
			return nil
		end
	elseif p < 0 then
		t = q / p
		if t > t1 then
			return nil
		end
		if t > t0 then
			t0 = t
		end
	else
		t = q / p
		if t < t0 then
			return nil
		end
		if t < t1 then
			t1 = t
		end
	end
	-- Top: y <= clip max y
	p = dy
	q = clipMaxY - y1
	if p == 0 then
		if q < 0 then
			return nil
		end
	elseif p < 0 then
		t = q / p
		if t > t1 then
			return nil
		end
		if t > t0 then
			t0 = t
		end
	else
		t = q / p
		if t < t0 then
			return nil
		end
		if t < t1 then
			t1 = t
		end
	end
	if t1 < t0 then
		return nil
	end
	return x1 + t0 * dx, y1 + t0 * dy, x1 + t1 * dx, y1 + t1 * dy, t0, t1
end

function R_line(x1, y1, x2, y2, materialIndex, tone)
	local x1, y1, x2, y2 = ClipLineToScreen(x1, y1, x2, y2)
	if x1 == nil then
		return
	end

	local dx = x2 - x1
	local dy = y2 - y1
	local steps = max(abs(dx), abs(dy)) // 1
	local prevSx = -9999
	local prevSy = -9999

	if steps <= 0 then
		local sx = ((x1 + 0.5) // 1)
		local sy = ((y1 + 0.5) // 1)
		local linearIndex = sy * 240 + sx
		gFrameBuffer_Material[linearIndex] = materialIndex
		gFrameBuffer_Tone[linearIndex] = tone or 0
		gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
		R_outlineStampPixelForCurrentObject(sx, sy)
		return
	end

	local posAlong01 = 0
	local posIncrement = 1 / steps

	for step = 0, steps do
		local sx = (((x1 + (x2 - x1) * posAlong01) + 0.5) // 1)
		local sy = (((y1 + (y2 - y1) * posAlong01) + 0.5) // 1)
		if sx ~= prevSx or sy ~= prevSy then
			local linearIndex = sy * 240 + sx
			gFrameBuffer_Material[linearIndex] = materialIndex
			gFrameBuffer_Tone[linearIndex] = tone or 0
			gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
			R_outlineStampPixelForCurrentObject(sx, sy)
			prevSx = sx
			prevSy = sy
		end
		posAlong01 = posAlong01 + posIncrement
	end
end

-- potentially-useful, but not used in the current demo engine so commenting out.
-- -- grid walking / grid traversal to walk a line.
-- -- https://www.redblobgames.com/grids/line-drawing.html
-- -- https://stackoverflow.com/questions/3233522/elegant-clean-special-case-straight-line-grid-traversal-algorithm
-- function R_line_grid(x1, y1, x2, y2, materialIndex, tone)
-- 	if materialIndex == nil then
-- 		return
-- 	end

-- 	local x1, y1, x2, y2 = ClipLineToScreen(x1, y1, x2, y2)
-- 	if x1 == nil then
-- 		return
-- 	end

-- 	local dx = x2 - x1
-- 	local dy = y2 - y1
-- 	local toneValue = tone or 0
-- 	local ix = x1 // 1
-- 	local iy = y1 // 1
-- 	local ixEnd = x2 // 1
-- 	local iyEnd = y2 // 1
-- 	if dx < 0 and x2 == ixEnd then
-- 		ixEnd = ixEnd - 1
-- 	end
-- 	if dy < 0 and y2 == iyEnd then
-- 		iyEnd = iyEnd - 1
-- 	end

-- 	if dx == 0 and dy == 0 then
-- 		local linearIndex = iy * TIC_WIDTH() + ix
-- 		gFrameBuffer_Material[linearIndex] = materialIndex
-- 		gFrameBuffer_Tone[linearIndex] = toneValue
-- 		--#if defined(EDITOR_FEATURES)
-- 		gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
-- 		R_outlineStampPixelForCurrentObject(ix, iy)
-- 		--#endif
-- 		return
-- 	end

-- 	local stepX = 0
-- 	local stepY = 0
-- 	local tMaxX = 1e30
-- 	local tMaxY = 1e30
-- 	local tDeltaX = 1e30
-- 	local tDeltaY = 1e30

-- 	if dx > 0 then
-- 		stepX = 1
-- 		tDeltaX = 1 / dx
-- 		tMaxX = ((ix + 1) - x1) * tDeltaX
-- 	elseif dx < 0 then
-- 		stepX = -1
-- 		tDeltaX = -1 / dx
-- 		tMaxX = (x1 - ix) * tDeltaX
-- 	end

-- 	if dy > 0 then
-- 		stepY = 1
-- 		tDeltaY = 1 / dy
-- 		tMaxY = ((iy + 1) - y1) * tDeltaY
-- 	elseif dy < 0 then
-- 		stepY = -1
-- 		tDeltaY = -1 / dy
-- 		tMaxY = (y1 - iy) * tDeltaY
-- 	end

-- 	while true do
-- 		if ix < gClipRectX0 or ix >= gClipRectX1 or iy < gClipRectY0 or iy >= gClipRectY1 then
-- 			return
-- 		end
-- 		local linearIndex = iy * TIC_WIDTH() + ix
-- 		gFrameBuffer_Material[linearIndex] = materialIndex
-- 		gFrameBuffer_Tone[linearIndex] = toneValue
-- 		--#if defined(EDITOR_FEATURES)
-- 		gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
-- 		R_outlineStampPixelForCurrentObject(ix, iy)
-- 		--#endif

-- 		if ix == ixEnd and iy == iyEnd then
-- 			return
-- 		end

-- 		if tMaxX < tMaxY then
-- 			ix = ix + stepX
-- 			tMaxX = tMaxX + tDeltaX
-- 		elseif tMaxY < tMaxX then
-- 			iy = iy + stepY
-- 			tMaxY = tMaxY + tDeltaY
-- 		else
-- 			ix = ix + stepX
-- 			iy = iy + stepY
-- 			tMaxX = tMaxX + tDeltaX
-- 			tMaxY = tMaxY + tDeltaY
-- 		end
-- 	end
-- end

-- potentially-useful, but not used in the current demo engine so commenting out.
-- function R_line_fn(x1, y1, x2, y2, shadeFn)
-- 	local cx1, cy1, cx2, cy2, t0, t1 = ClipLineToScreen(x1, y1, x2, y2)
-- 	if cx1 == nil then
-- 		return
-- 	end

-- 	local dx = cx2 - cx1
-- 	local dy = cy2 - cy1
-- 	local steps = max(abs(dx), abs(dy)) // 1
-- 	local prevSx = -9999
-- 	local prevSy = -9999
-- 	local tRange = t1 - t0

-- 	if steps <= 0 then
-- 		local rx, ry = ROUND(cx1), ROUND(cy1)
-- 		local linearIndex = ry * TIC_WIDTH() + rx
-- 		local materialIndex, tone = shadeFn(rx, ry, t0)
-- 		if materialIndex ~= nil then
-- 			gFrameBuffer_Material[linearIndex] = materialIndex
-- 			gFrameBuffer_Tone[linearIndex] = tone or 0
-- 			--#if defined(EDITOR_FEATURES)
-- 			gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
-- 			R_outlineStampPixelForCurrentObject(rx, ry)
-- 			--#endif
-- 		end
-- 		return
-- 	end

-- 	local posAlong01 = 0
-- 	local posIncrement = 1 / steps

-- 	for step = 0, steps do
-- 		local sx = ROUND(LERP(cx1, cx2, posAlong01))
-- 		local sy = ROUND(LERP(cy1, cy2, posAlong01))
-- 		if sx ~= prevSx or sy ~= prevSy then
-- 			local linearIndex = sy * TIC_WIDTH() + sx
-- 			local materialIndex, tone = shadeFn(sx, sy, t0 + posAlong01 * tRange)
-- 			if materialIndex ~= nil then
-- 				gFrameBuffer_Material[linearIndex] = materialIndex
-- 				gFrameBuffer_Tone[linearIndex] = tone or 0
-- 				--#if defined(EDITOR_FEATURES)
-- 				gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
-- 				R_outlineStampPixelForCurrentObject(sx, sy)
-- 				--#endif
-- 			end
-- 			prevSx = sx
-- 			prevSy = sy
-- 		end
-- 		posAlong01 = posAlong01 + posIncrement
-- 	end
-- end

-- Z-buffer aware line draw. depth1/depth2 use the same convention as the depth buffer
-- (larger values are nearer). Clips to screen bounds and only writes pixels that pass the depth test.
function R_line_z(x1, y1, depth1, x2, y2, depth2, materialIndex, tone)
	local cx1, cy1, cx2, cy2, t0, t1 = ClipLineToScreen(x1, y1, x2, y2)
	if cx1 == nil then
		return
	end

	local cd1 = (depth1 + (depth2 - depth1) * t0)
	local cd2 = (depth1 + (depth2 - depth1) * t1)

	local dx = cx2 - cx1
	local dy = cy2 - cy1
	local steps = max(abs(dx), abs(dy)) // 1
	local prevSx = -9999
	local prevSy = -9999
	local toneValue = tone or 0

	if steps <= 0 then
		local linearIndex = ((cy1 + 0.5) // 1) * 240 + ((cx1 + 0.5) // 1)
		if cd1 > gFrameBuffer_Depth[linearIndex] then
			gFrameBuffer_Depth[linearIndex] = cd1
			gFrameBuffer_Material[linearIndex] = materialIndex
			gFrameBuffer_Tone[linearIndex] = toneValue
			gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
		end
		return
	end

	local posAlong01 = 0
	local posIncrement = 1 / steps

	for step = 0, steps do
		local sx = (((cx1 + (cx2 - cx1) * posAlong01) + 0.5) // 1)
		local sy = (((cy1 + (cy2 - cy1) * posAlong01) + 0.5) // 1)
		if sx ~= prevSx or sy ~= prevSy then
			local linearIndex = sy * 240 + sx
			local depth = (cd1 + (cd2 - cd1) * posAlong01)
			if depth > gFrameBuffer_Depth[linearIndex] then
				gFrameBuffer_Depth[linearIndex] = depth
				gFrameBuffer_Material[linearIndex] = materialIndex
				gFrameBuffer_Tone[linearIndex] = toneValue
				gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
			end
			prevSx = sx
			prevSy = sy
		end
		posAlong01 = posAlong01 + posIncrement
	end
end

-- Z-buffer aware gradient line draw. Interpolates tone linearly from tone1 to tone2 along the segment.
function R_line_z_g(x1, y1, depth1, tone1, x2, y2, depth2, tone2, materialIndex)
	local cx1, cy1, cx2, cy2, t0, t1 = ClipLineToScreen(x1, y1, x2, y2)
	if cx1 == nil then
		return
	end

	local cd1 = (depth1 + (depth2 - depth1) * t0)
	local cd2 = (depth1 + (depth2 - depth1) * t1)
	local ct1 = (tone1 + (tone2 - tone1) * t0)
	local ct2 = (tone1 + (tone2 - tone1) * t1)

	local dx = cx2 - cx1
	local dy = cy2 - cy1
	local steps = max(abs(dx), abs(dy)) // 1
	local prevSx = -9999
	local prevSy = -9999

	if steps <= 0 then
		local linearIndex = ((cy1 + 0.5) // 1) * 240 + ((cx1 + 0.5) // 1)
		if cd1 > gFrameBuffer_Depth[linearIndex] then
			gFrameBuffer_Depth[linearIndex] = cd1
			gFrameBuffer_Material[linearIndex] = materialIndex
			gFrameBuffer_Tone[linearIndex] = ct1
			gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
		end
		return
	end

	local posAlong01 = 0
	local posIncrement = 1 / steps

	for step = 0, steps do
		local sx = (((cx1 + (cx2 - cx1) * posAlong01) + 0.5) // 1)
		local sy = (((cy1 + (cy2 - cy1) * posAlong01) + 0.5) // 1)
		if sx ~= prevSx or sy ~= prevSy then
			local linearIndex = sy * 240 + sx
			local depth = (cd1 + (cd2 - cd1) * posAlong01)
			if depth > gFrameBuffer_Depth[linearIndex] then
				gFrameBuffer_Depth[linearIndex] = depth
				gFrameBuffer_Material[linearIndex] = materialIndex
				gFrameBuffer_Tone[linearIndex] = (ct1 + (ct2 - ct1) * posAlong01)
				gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
			end
			prevSx = sx
			prevSy = sy
		end
		posAlong01 = posAlong01 + posIncrement
	end
end

-- depth-aware sparse line for mesh silhouette edges; overlays later instead of touching hot fill paths
function R_outlineLine_z(x1, y1, depth1, x2, y2, depth2, materialIndex, tone)
	local cx1, cy1, cx2, cy2, t0, t1 = ClipLineToScreen(x1, y1, x2, y2)
	if cx1 == nil then
		return
	end

	local cd1 = (depth1 + (depth2 - depth1) * t0)
	local cd2 = (depth1 + (depth2 - depth1) * t1)
	local dx = cx2 - cx1
	local dy = cy2 - cy1
	local steps = max(abs(dx), abs(dy)) // 1
	local prevSx = -9999
	local prevSy = -9999
	local sourceObjectId = gCurrentObjectId
	local toneValue = tone or 0

	if steps <= 0 then
		local sx = ((cx1 + 0.5) // 1)
		local sy = ((cy1 + 0.5) // 1)
		local depthValue = cd1
		if depthValue > gFrameBuffer_Depth[sy * 240 + sx] then
			R_overlayOutlinePixel(sy * 240 + sx, sourceObjectId, materialIndex, toneValue, depthValue)
		end
		return
	end

	local posAlong01 = 0
	local posIncrement = 1 / steps

	for step = 0, steps do
		local sx = (((cx1 + (cx2 - cx1) * posAlong01) + 0.5) // 1)
		local sy = (((cy1 + (cy2 - cy1) * posAlong01) + 0.5) // 1)
		if sx ~= prevSx or sy ~= prevSy then
			local linearIndex = sy * 240 + sx
			local depthValue = (cd1 + (cd2 - cd1) * posAlong01)
			if depthValue > gFrameBuffer_Depth[linearIndex] then
				R_overlayOutlinePixel(linearIndex, sourceObjectId, materialIndex, toneValue, depthValue)
			end
			prevSx = sx
			prevSy = sy
		end
		posAlong01 = posAlong01 + posIncrement
	end
end

function R_isDefaultAffine2D(angleDeg, skewX, skewY)
	return (angleDeg == nil or angleDeg == 0) and (skewX == nil or skewX == 0) and (skewY == nil or skewY == 0)
end

function R_buildAffine2D(x, y, width, height, anchorXNorm, anchorYNorm, angleDeg, skewX, skewY)
	local det = 1 - skewX * skewY
	if abs(det) < 0.000001 then
		return nil
	end

	local pivotLocalX = width * (anchorXNorm or 0)
	local pivotLocalY = height * (anchorYNorm or 0)
	local pivotX = x + pivotLocalX
	local pivotY = y + pivotLocalY
	local angle = ((angleDeg or 0) * (3.141592653589793 / 180))
	local cosA = cos(angle)
	local sinA = sin(angle)

	local function transformPoint(localX, localY)
		local lx = localX - pivotLocalX
		local ly = localY - pivotLocalY
		local shearedX = lx + skewX * ly
		local shearedY = ly + skewY * lx
		return pivotX + cosA * shearedX - sinA * shearedY, pivotY + sinA * shearedX + cosA * shearedY
	end

	local x0, y0 = transformPoint(0, 0)
	local x1, y1 = transformPoint(width, 0)
	local x2, y2 = transformPoint(width, height)
	local x3, y3 = transformPoint(0, height)

	return {
		x0 = (
			(min(x0, x1, x2, x3) // 1) < gClipRectX0 and gClipRectX0
			or ((min(x0, x1, x2, x3) // 1) > gClipRectX1 and gClipRectX1 or (min(x0, x1, x2, x3) // 1))
		),
		y0 = (
			(min(y0, y1, y2, y3) // 1) < gClipRectY0 and gClipRectY0
			or ((min(y0, y1, y2, y3) // 1) > gClipRectY1 and gClipRectY1 or (min(y0, y1, y2, y3) // 1))
		),
		x1 = (
			((max(x0, x1, x2, x3) + 1) // 1) < gClipRectX0 and gClipRectX0
			or (((max(x0, x1, x2, x3) + 1) // 1) > gClipRectX1 and gClipRectX1 or ((max(x0, x1, x2, x3) + 1) // 1))
		),
		y1 = (
			((max(y0, y1, y2, y3) + 1) // 1) < gClipRectY0 and gClipRectY0
			or (((max(y0, y1, y2, y3) + 1) // 1) > gClipRectY1 and gClipRectY1 or ((max(y0, y1, y2, y3) + 1) // 1))
		),
		pivotX = pivotX,
		pivotY = pivotY,
		pivotLocalX = pivotLocalX,
		pivotLocalY = pivotLocalY,
		cosA = cosA,
		sinA = sinA,
		skewX = skewX,
		skewY = skewY,
		invDet = 1 / det,
	}
end

function R_inverseAffine2D(affine, sx, sy)
	local dx = sx - affine.pivotX
	local dy = sy - affine.pivotY
	local rx = affine.cosA * dx + affine.sinA * dy
	local ry = -affine.sinA * dx + affine.cosA * dy
	local lx = (rx - affine.skewX * ry) * affine.invDet
	local ly = (-affine.skewY * rx + ry) * affine.invDet
	return lx + affine.pivotLocalX, ly + affine.pivotLocalY
end

function R_transformAffine2D(affine, localX, localY)
	local lx = localX - affine.pivotLocalX
	local ly = localY - affine.pivotLocalY
	local shearedX = lx + affine.skewX * ly
	local shearedY = ly + affine.skewY * lx
	return affine.pivotX + affine.cosA * shearedX - affine.sinA * shearedY,
		affine.pivotY + affine.sinA * shearedX + affine.cosA * shearedY
end

function R_editorOverlayAffineRect(affine, width, height, drawGrid, drawAnchor)
	if affine == nil then
		return
	end

	local x0, y0 = R_transformAffine2D(affine, 0, 0)
	local x1, y1 = R_transformAffine2D(affine, width, 0)
	local x2, y2 = R_transformAffine2D(affine, width, height)
	local x3, y3 = R_transformAffine2D(affine, 0, height)
	R_editorOverlayLine(x0, y0, x1, y1, 1)
	R_editorOverlayLine(x1, y1, x2, y2, 1)
	R_editorOverlayLine(x2, y2, x3, y3, 1)
	R_editorOverlayLine(x3, y3, x0, y0, 1)

	if drawGrid then
		R_editorOverlayLine(x0, y0, x2, y2, 1)
		R_editorOverlayLine(x1, y1, x3, y3, 1)
		for i = 1, 3 do
			local u = width * i / 4
			local gx0, gy0 = R_transformAffine2D(affine, u, 0)
			local gx1, gy1 = R_transformAffine2D(affine, u, height)
			R_editorOverlayLine(gx0, gy0, gx1, gy1, 1)
		end
		for i = 1, 3 do
			local v = height * i / 4
			local gx0, gy0 = R_transformAffine2D(affine, 0, v)
			local gx1, gy1 = R_transformAffine2D(affine, width, v)
			R_editorOverlayLine(gx0, gy0, gx1, gy1, 1)
		end
	end

	if drawAnchor then
		R_editorOverlayCrosshair(affine.pivotX, affine.pivotY, 4, 2)
	end
end

-- axis-aligned rectangle filled with single mat+tone.
function R_rect(x, y, width, height, materialIndex, tone)
	local x0 = ((x // 1) < gClipRectX0 and gClipRectX0 or ((x // 1) > gClipRectX1 and gClipRectX1 or (x // 1)))
	local y0 = ((y // 1) < gClipRectY0 and gClipRectY0 or ((y // 1) > gClipRectY1 and gClipRectY1 or (y // 1)))
	local x1 = (
		((x + width) // 1) < gClipRectX0 and gClipRectX0
		or (((x + width) // 1) > gClipRectX1 and gClipRectX1 or ((x + width) // 1))
	)
	local y1 = (
		((y + height) // 1) < gClipRectY0 and gClipRectY0
		or (((y + height) // 1) > gClipRectY1 and gClipRectY1 or ((y + height) // 1))
	)
	local span = x1 - x0
	if span <= 0 or y1 <= y0 then
		return
	end
	local toneValue = tone or 0
	local materialTemplate = R_getFillTemplate(gFillMaterialTemplates, materialIndex, span)
	local toneTemplate = R_getFillTemplate(gFillToneTemplates, toneValue, span)
	local objectIdTemplate = R_getFillTemplate(gFillObjectIdTemplates, gCurrentObjectId, span)

	local tblMove = table.move
	for sy = y0, y1 - 1 do
		local dstIndex = sy * 240 + x0
		tblMove(materialTemplate, 1, span, dstIndex, gFrameBuffer_Material)
		tblMove(toneTemplate, 1, span, dstIndex, gFrameBuffer_Tone)
		tblMove(objectIdTemplate, 1, span, dstIndex, gFrameBuffer_ObjectId)
		R_outlineStampSpanForCurrentObject(x0, x1, sy)
	end
end

-- axis-aligned rectangle filled from shadeFn(u,v,screenX,screenY,localX,localY).
function R_rect_uv_fn(x, y, width, height, shadeFn)
	local x0 = ((x // 1) < gClipRectX0 and gClipRectX0 or ((x // 1) > gClipRectX1 and gClipRectX1 or (x // 1)))
	local y0 = ((y // 1) < gClipRectY0 and gClipRectY0 or ((y // 1) > gClipRectY1 and gClipRectY1 or (y // 1)))
	local x1 = (
		((x + width) // 1) < gClipRectX0 and gClipRectX0
		or (((x + width) // 1) > gClipRectX1 and gClipRectX1 or ((x + width) // 1))
	)
	local y1 = (
		((y + height) // 1) < gClipRectY0 and gClipRectY0
		or (((y + height) // 1) > gClipRectY1 and gClipRectY1 or ((y + height) // 1))
	)
	local invWidth = width > 0 and 1 / width or 0
	local invHeight = height > 0 and 1 / height or 0

	for sy = y0, y1 - 1 do
		local localY = sy + 0.5 - y
		local v = localY * invHeight
		local rowBase = sy * 240
		for sx = x0, x1 - 1 do
			local localX = sx + 0.5 - x
			local u = localX * invWidth
			local materialIndex, tone = shadeFn(u, v, sx, sy, localX, localY)
			if materialIndex ~= nil then
				gFrameBuffer_Material[rowBase + sx] = materialIndex
				gFrameBuffer_Tone[rowBase + sx] = tone or 0
				gFrameBuffer_ObjectId[rowBase + sx] = gCurrentObjectId
				R_outlineStampPixelForCurrentObject(sx, sy)
			end
		end
	end
end

function R_rect_tex(x, y, width, height, texture)
	if texture == nil then
		return
	end

	local x0 = ((x // 1) < gClipRectX0 and gClipRectX0 or ((x // 1) > gClipRectX1 and gClipRectX1 or (x // 1)))
	local y0 = ((y // 1) < gClipRectY0 and gClipRectY0 or ((y // 1) > gClipRectY1 and gClipRectY1 or (y // 1)))
	local x1 = (
		((x + width) // 1) < gClipRectX0 and gClipRectX0
		or (((x + width) // 1) > gClipRectX1 and gClipRectX1 or ((x + width) // 1))
	)
	local y1 = (
		((y + height) // 1) < gClipRectY0 and gClipRectY0
		or (((y + height) // 1) > gClipRectY1 and gClipRectY1 or ((y + height) // 1))
	)
	local spanX = x1 - x0
	local spanY = y1 - y0
	if spanX <= 0 or spanY <= 0 then
		return
	end

	local textureMaterialSlots = texture.materialSlots
	local textureMaterialIndexBySlot = texture.materialIndexBySlot
	if textureMaterialSlots == nil or textureMaterialIndexBySlot == nil then
		return
	end
	local textureTones = texture.tones
	local textureWidth = texture.width
	local textureHeight = texture.height
	local textureMaxX = textureWidth - 1
	local textureMaxY = textureHeight - 1
	local invWidth = width > 0 and 1 / width or 0
	local invHeight = height > 0 and 1 / height or 0

	for sy = y0, y1 - 1 do
		local v = (sy + 0.5 - y) * invHeight
		local ty = (v * textureHeight) // 1
		ty = (ty < 0 and 0 or (ty > textureMaxY and textureMaxY or ty))
		local textureRow = ty * textureWidth
		local rowBase = sy * 240
		for sx = x0, x1 - 1 do
			local u = (sx + 0.5 - x) * invWidth
			local tx = (u * textureWidth) // 1
			tx = (tx < 0 and 0 or (tx > textureMaxX and textureMaxX or tx))
			local textureIndex = textureRow + tx
			local materialIndex = textureMaterialIndexBySlot[textureMaterialSlots[textureIndex]]
			if materialIndex ~= nil then
				local linearIndex = rowBase + sx
				gFrameBuffer_Material[linearIndex] = materialIndex
				gFrameBuffer_Tone[linearIndex] = textureTones[textureIndex] -- * toneMul
				gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
				R_outlineStampPixelForCurrentObject(sx, sy)
			end
		end
	end
end

function R_circ_fn(cx, cy, radius, shadeFn)
	local radiusSquared = radius * radius
	local left = (
		((cx - radius) // 1) < gClipRectX0 and gClipRectX0
		or (((cx - radius) // 1) > (gClipRectX1 - 1) and (gClipRectX1 - 1) or ((cx - radius) // 1))
	)
	local right = (
		((cx + radius) // 1) < gClipRectX0 and gClipRectX0
		or (((cx + radius) // 1) > (gClipRectX1 - 1) and (gClipRectX1 - 1) or ((cx + radius) // 1))
	)
	local top = (
		((cy - radius) // 1) < gClipRectY0 and gClipRectY0
		or (((cy - radius) // 1) > (gClipRectY1 - 1) and (gClipRectY1 - 1) or ((cy - radius) // 1))
	)
	local bottom = (
		((cy + radius) // 1) < gClipRectY0 and gClipRectY0
		or (((cy + radius) // 1) > (gClipRectY1 - 1) and (gClipRectY1 - 1) or ((cy + radius) // 1))
	)
	if right < left or bottom < top then
		return
	end

	for sy = top, bottom do
		local dy = sy - cy
		local dy2 = dy * dy
		local linearIndexBase = sy * 240
		for sx = left, right do
			local dx = sx - cx
			local distanceSquared = dx * dx + dy2
			if distanceSquared <= radiusSquared then
				local materialIndex, tone = shadeFn(sx, sy, distanceSquared)
				if materialIndex ~= nil then
					gFrameBuffer_Material[linearIndexBase + sx] = materialIndex
					gFrameBuffer_Tone[linearIndexBase + sx] = tone or 0
					gFrameBuffer_ObjectId[linearIndexBase + sx] = gCurrentObjectId
					R_outlineStampPixelForCurrentObject(sx, sy)
				end
			end
		end
	end
end

-- z-buffer-aware pixel renderer. specifically for use from R_point3D
function R_pixel_z(x, y, depth, materialIndex, tone)
	if x < gClipRectX0 or x >= gClipRectX1 or y < gClipRectY0 or y >= gClipRectY1 then
		return
	end

	local linearIndex = (y * 240 + x) // 1
	if depth > gFrameBuffer_Depth[linearIndex] then
		gFrameBuffer_Depth[linearIndex] = depth
		gFrameBuffer_Material[linearIndex] = materialIndex
		gFrameBuffer_Tone[linearIndex] = tone or 0
		gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
		R_outlineStampPixelForCurrentObject(x, y)
	end
end

function R_worldToCamera3D(camera, worldX, worldY, worldZ)
	camera = camera or {}
	local cameraCosX = cos(camera.rotX or 0)
	local cameraSinX = sin(camera.rotX or 0)
	local cameraCosY = cos(camera.rotY or 0)
	local cameraSinY = sin(camera.rotY or 0)
	local cameraCosZ = cos(camera.rotZ or 0)
	local cameraSinZ = sin(camera.rotZ or 0)
	return InverseRotate3WithTrig(
		worldX - (camera.x or 0),
		worldY - (camera.y or 0),
		worldZ - (camera.z or 0),
		cameraCosX,
		cameraSinX,
		cameraCosY,
		cameraSinY,
		cameraCosZ,
		cameraSinZ
	)
end

function R_resolve3DViewport(camera, viewport)
	camera = camera or {}
	viewport = viewport or {}
	local width = viewport.width or camera.viewportWidth or 240
	local height = viewport.height or camera.viewportHeight or 136
	local x = viewport.x or (camera.screenOriginX ~= nil and camera.screenOriginX - width * 0.5 or 0)
	local y = viewport.y or (camera.screenOriginY ~= nil and camera.screenOriginY - height * 0.5 or 0)
	return x, y, width, height, x + width * 0.5, y + height * 0.5
end

function R_projectCameraPoint3D(camera, viewport, camX, camY, camZ)
	local _, _, _, viewportHeight, originX, originY = R_resolve3DViewport(camera, viewport)
	local projectionOffset = SafeVec2(camera.projectionOffset)
	originX = originX + projectionOffset.x
	originY = originY + projectionOffset.y
	if camera.kind == "perspective" then
		-- note: Scene_renderMesh3D duplicates this code. todo: centralize!
		local fov = camera.fov
		if fov == nil or fov <= 0 then
			fov = 3.141592653589793 / 3
		end
		local halfFov = fov * 0.5
		local sinHalfFov = sin(halfFov)
		if abs(sinHalfFov) < 0.0001 then
			sinHalfFov = 0.0001
		end
		local focalLength = viewportHeight * 0.5 * cos(halfFov) / sinHalfFov
		local invZ = focalLength / camZ
		return originX + camX * invZ, originY - camY * invZ, 1 / camZ
	end

	return originX + camX, originY - camY, -camZ
end

function R_projectPoint3D(camera, viewport, worldX, worldY, worldZ)
	local camX, camY, camZ = R_worldToCamera3D(camera, worldX, worldY, worldZ)
	local nearZ = camera and camera.nearZ or 1
	if nearZ == nil or nearZ <= 0 then
		nearZ = 1
	end
	if camZ <= nearZ then
		return nil
	end

	local sx, sy, depth = R_projectCameraPoint3D(camera or {}, viewport, camX, camY, camZ)
	return sx, sy, depth, camX, camY, camZ
end

function R_point3D(camera, viewport, x1, y1, z1, materialIndex, tone, depthBias)
	if materialIndex == nil then
		return
	end

	local sx, sy, depth = R_projectPoint3D(camera, viewport, x1, y1, z1)
	if sx == nil then
		return
	end

	sx = ((sx + 0.5) // 1)
	sy = ((sy + 0.5) // 1)

	R_pixel_z(sx, sy, depth + (depthBias or 0), materialIndex, tone)
end

-- editor only; used when drawing gizmos
function R_line3D(camera, viewport, x1, y1, z1, x2, y2, z2, materialIndex, tone, depthBias)
	if materialIndex == nil then
		return
	end

	camera = camera or {}
	local nearZ = camera.nearZ or 1
	if nearZ <= 0 then
		nearZ = 1
	end

	local camX1, camY1, camZ1 = R_worldToCamera3D(camera, x1, y1, z1)
	local camX2, camY2, camZ2 = R_worldToCamera3D(camera, x2, y2, z2)
	if camZ1 <= nearZ and camZ2 <= nearZ then
		return
	end

	if camZ1 <= nearZ or camZ2 <= nearZ then
		local t = (nearZ - camZ1) / (camZ2 - camZ1)
		local clipZ = nearZ + 0.001
		if camZ1 <= nearZ then
			camX1 = (camX1 + (camX2 - camX1) * t)
			camY1 = (camY1 + (camY2 - camY1) * t)
			camZ1 = clipZ
		else
			camX2 = (camX1 + (camX2 - camX1) * t)
			camY2 = (camY1 + (camY2 - camY1) * t)
			camZ2 = clipZ
		end
	end

	local sx1, sy1, depth1 = R_projectCameraPoint3D(camera, viewport, camX1, camY1, camZ1)
	local sx2, sy2, depth2 = R_projectCameraPoint3D(camera, viewport, camX2, camY2, camZ2)
	depthBias = depthBias or 0
	depth1 = depth1 + depthBias
	depth2 = depth2 + depthBias
	R_line_z(sx1, sy1, depth1, sx2, sy2, depth2, materialIndex, tone)
end

-- 3D line that renders into the editor overlay buffer (depth-tested, always FG white).
-- Use for gizmo geometry instead of R_line3D to avoid consuming a scene material slot.
function R_line3D_editorOverlay(camera, viewport, x1, y1, z1, x2, y2, z2, depthBias)
	camera = camera or {}
	local nearZ = camera.nearZ or 1
	if nearZ <= 0 then
		nearZ = 1
	end

	local camX1, camY1, camZ1 = R_worldToCamera3D(camera, x1, y1, z1)
	local camX2, camY2, camZ2 = R_worldToCamera3D(camera, x2, y2, z2)
	if camZ1 <= nearZ and camZ2 <= nearZ then
		return
	end

	if camZ1 <= nearZ or camZ2 <= nearZ then
		local t = (nearZ - camZ1) / (camZ2 - camZ1)
		local clipZ = nearZ + 0.001
		if camZ1 <= nearZ then
			camX1 = (camX1 + (camX2 - camX1) * t)
			camY1 = (camY1 + (camY2 - camY1) * t)
			camZ1 = clipZ
		else
			camX2 = (camX1 + (camX2 - camX1) * t)
			camY2 = (camY1 + (camY2 - camY1) * t)
			camZ2 = clipZ
		end
	end

	local sx1, sy1, depth1 = R_projectCameraPoint3D(camera, viewport, camX1, camY1, camZ1)
	local sx2, sy2, depth2 = R_projectCameraPoint3D(camera, viewport, camX2, camY2, camZ2)
	depthBias = depthBias or 0
	depth1 = depth1 + depthBias
	depth2 = depth2 + depthBias
	R_line_z_editorOverlay(sx1, sy1, depth1, sx2, sy2, depth2)
end

-- depth-aware triangle rasterizer.
-- _g = gradient variation.
-- specify tone at each vertex; it gets interpolated across surface.
--
-- this is one of the hottest paths in the whole app so it needs to be
-- aggressively optimal.
function R_tri_g(x1, y1, x2, y2, x3, y3, materialIndex, toneA, toneB, toneC, depthA, depthB, depthC)
	local stepX12 = y2 - y1
	local stepY12 = x1 - x2
	local stepX23 = y3 - y2
	local stepY23 = x2 - x3
	local stepX31 = y1 - y3
	local stepY31 = x3 - x1
	local area = (x1 - x2) * stepX23 + (y1 - y2) * stepY23
	if area == 0 then
		return
	end
	local areaPositive = area > 0
	-- top left rule; see https://en.wikipedia.org/wiki/Rasterisation
	local bias = areaPositive and -0.0001 or 0.0001
	-- use opposite bias, otherwise there's a very tiny dead band. #150
	local bias23 = ((y2 > y3) or (y2 == y3 and x2 < x3)) and -bias or bias
	local bias31 = ((y3 > y1) or (y3 == y1 and x3 < x1)) and -bias or bias
	local bias12 = ((y1 > y2) or (y1 == y2 and x1 < x2)) and -bias or bias

	local minX = (
		((min(x1, x2, x3)) // 1) < gClipRectX0 and gClipRectX0
		or (((min(x1, x2, x3)) // 1) > (gClipRectX1 - 1) and (gClipRectX1 - 1) or ((min(x1, x2, x3)) // 1))
	)
	local maxX = (
		((max(x1, x2, x3)) // 1) < gClipRectX0 and gClipRectX0
		or (((max(x1, x2, x3)) // 1) > (gClipRectX1 - 1) and (gClipRectX1 - 1) or ((max(x1, x2, x3)) // 1))
	)
	local minY = (
		((min(y1, y2, y3)) // 1) < gClipRectY0 and gClipRectY0
		or (((min(y1, y2, y3)) // 1) > (gClipRectY1 - 1) and (gClipRectY1 - 1) or ((min(y1, y2, y3)) // 1))
	)
	local maxY = (
		((max(y1, y2, y3)) // 1) < gClipRectY0 and gClipRectY0
		or (((max(y1, y2, y3)) // 1) > (gClipRectY1 - 1) and (gClipRectY1 - 1) or ((max(y1, y2, y3)) // 1))
	)
	if maxX < minX or maxY < minY then
		return
	end

	local sampleMinX = minX + 0.5
	local sampleMinY = minY + 0.5
	local rowW0 = (sampleMinX - x2) * stepX23 + (sampleMinY - y2) * stepY23 + bias23
	local rowW1 = (sampleMinX - x3) * stepX31 + (sampleMinY - y3) * stepY31 + bias31
	local rowW2 = (sampleMinX - x1) * stepX12 + (sampleMinY - y1) * stepY12 + bias12

	--local isFlat = toneB == nil and toneC == nil
	local invArea = 1 / area

	-- doesn't affect performance that i can tell.
	local frameBuffer_Material = gFrameBuffer_Material
	local frameBuffer_Tone = gFrameBuffer_Tone
	local frameBuffer_Depth = gFrameBuffer_Depth

	local depthAscaled, depthBscaled, depthCscaled = depthA * invArea, depthB * invArea, depthC * invArea
	local toneAscaled, toneBscaled, toneCscaled = toneA * invArea, toneB * invArea, toneC * invArea
	local depthDx = depthAscaled * stepX23 + depthBscaled * stepX31 + depthCscaled * stepX12
	local depthDy = depthAscaled * stepY23 + depthBscaled * stepY31 + depthCscaled * stepY12
	local toneDx = toneAscaled * stepX23 + toneBscaled * stepX31 + toneCscaled * stepX12
	local toneDy = toneAscaled * stepY23 + toneBscaled * stepY31 + toneCscaled * stepY12
	local rowDepth = depthAscaled * rowW0 + depthBscaled * rowW1 + depthCscaled * rowW2
	local rowTone = toneAscaled * rowW0 + toneBscaled * rowW1 + toneCscaled * rowW2
	--local bboxPixelCount = (maxX - minX + 1) * (maxY - minY + 1)

	if (maxX - minX) >= 2 then
		-- each scanline, calculate triangle edges and walk the actual span.
		-- the overhead of calculating edges is more than just checking if a pixel is inside,
		-- so for very small triangles this is slower.
		local edgeSign = areaPositive and 1 or -1
		local edgeDx0 = stepX23 * edgeSign
		local edgeDx1 = stepX31 * edgeSign
		local edgeDx2 = stepX12 * edgeSign

		for sy = minY, maxY do
			local xStart = minX
			local xEnd = maxX
			local edge0 = rowW0 * edgeSign
			local edge1 = rowW1 * edgeSign
			local edge2 = rowW2 * edgeSign

			if edgeDx0 > 0 then
				local x = minX - ((edge0 / edgeDx0) // 1)
				if x > xStart then
					xStart = x
				end
			elseif edgeDx0 < 0 then
				local x = minX + ((edge0 / -edgeDx0) // 1)
				if x < xEnd then
					xEnd = x
				end
			elseif edge0 < 0 then
				xStart = maxX + 1
			end

			if edgeDx1 > 0 then
				local x = minX - ((edge1 / edgeDx1) // 1)
				if x > xStart then
					xStart = x
				end
			elseif edgeDx1 < 0 then
				local x = minX + ((edge1 / -edgeDx1) // 1)
				if x < xEnd then
					xEnd = x
				end
			elseif edge1 < 0 then
				xStart = maxX + 1
			end

			if edgeDx2 > 0 then
				local x = minX - ((edge2 / edgeDx2) // 1)
				if x > xStart then
					xStart = x
				end
			elseif edgeDx2 < 0 then
				local x = minX + ((edge2 / -edgeDx2) // 1)
				if x < xEnd then
					xEnd = x
				end
			elseif edge2 < 0 then
				xStart = maxX + 1
			end

			if xStart <= xEnd then
				local xOffset = xStart - minX
				local depth = rowDepth + depthDx * xOffset
				local tone = rowTone + toneDx * xOffset
				local rowBase = sy * 240

				for linearIndex = rowBase + xStart, rowBase + xEnd do
					if depth > frameBuffer_Depth[linearIndex] then
						frameBuffer_Depth[linearIndex] = depth
						frameBuffer_Material[linearIndex] = materialIndex
						frameBuffer_Tone[linearIndex] = tone
						gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
					end
					depth = depth + depthDx
					tone = tone + toneDx
				end
			end

			rowW0 = rowW0 + stepY23
			rowW1 = rowW1 + stepY31
			rowW2 = rowW2 + stepY12
			rowDepth = rowDepth + depthDy
			rowTone = rowTone + toneDy
		end
		return
	end

	if areaPositive then
		for sy = minY, maxY do
			local w0 = rowW0
			local w1 = rowW1
			local w2 = rowW2
			local depth = rowDepth
			local tone = rowTone
			local linearIndex0 = sy * 240 + minX
			local linearIndex1 = linearIndex0 + maxX - minX

			for linearIndex = linearIndex0, linearIndex1 do
				-- HOT
				if w0 >= 0 and w1 >= 0 and w2 >= 0 then
					if depth > frameBuffer_Depth[linearIndex] then
						frameBuffer_Depth[linearIndex] = depth
						frameBuffer_Material[linearIndex] = materialIndex
						frameBuffer_Tone[linearIndex] = tone
						gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
					end
				end

				w0 = w0 + stepX23
				w1 = w1 + stepX31
				w2 = w2 + stepX12
				depth = depth + depthDx
				tone = tone + toneDx
			end

			rowW0 = rowW0 + stepY23
			rowW1 = rowW1 + stepY31
			rowW2 = rowW2 + stepY12
			rowDepth = rowDepth + depthDy
			rowTone = rowTone + toneDy
		end
		return
	end

	for sy = minY, maxY do
		local w0 = rowW0
		local w1 = rowW1
		local w2 = rowW2
		local depth = rowDepth
		local tone = rowTone
		local linearIndex0 = sy * 240 + minX
		local linearIndex1 = linearIndex0 + maxX - minX

		for linearIndex = linearIndex0, linearIndex1 do
			-- HOT
			if w0 <= 0 and w1 <= 0 and w2 <= 0 then
				if depth > frameBuffer_Depth[linearIndex] then
					frameBuffer_Depth[linearIndex] = depth
					frameBuffer_Material[linearIndex] = materialIndex
					frameBuffer_Tone[linearIndex] = tone
					gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
				end
			end

			w0 = w0 + stepX23
			w1 = w1 + stepX31
			w2 = w2 + stepX12
			depth = depth + depthDx
			tone = tone + toneDx
		end

		rowW0 = rowW0 + stepY23
		rowW1 = rowW1 + stepY31
		rowW2 = rowW2 + stepY12
		rowDepth = rowDepth + depthDy
		rowTone = rowTone + toneDy
	end
end -- R_tri_g

-- depth-aware textured triangle rasterizer.
-- Samples table-backed textures directly in the hot path. Texture tone is multiplied
-- by interpolated mesh lighting tone.
function R_tri_tex(
	x1,
	y1,
	x2,
	y2,
	x3,
	y3,
	depthA,
	depthB,
	depthC,
	toneA,
	toneB,
	toneC,
	uA,
	vA,
	uB,
	vB,
	uC,
	vC,
	texture,
	perspectiveCorrect
)
	local stepX12 = y2 - y1
	local stepY12 = x1 - x2
	local stepX23 = y3 - y2
	local stepY23 = x2 - x3
	local stepX31 = y1 - y3
	local stepY31 = x3 - x1
	local area = (x1 - x2) * stepX23 + (y1 - y2) * stepY23
	if area == 0 then
		return
	end
	local areaPositive = area > 0
	local bias = areaPositive and -0.0001 or 0.0001
	-- use opposite bias, otherwise there's a very tiny dead band. #150
	local bias23 = ((y2 > y3) or (y2 == y3 and x2 < x3)) and -bias or bias
	local bias31 = ((y3 > y1) or (y3 == y1 and x3 < x1)) and -bias or bias
	local bias12 = ((y1 > y2) or (y1 == y2 and x1 < x2)) and -bias or bias

	local minX = (
		((min(x1, x2, x3)) // 1) < gClipRectX0 and gClipRectX0
		or (((min(x1, x2, x3)) // 1) > (gClipRectX1 - 1) and (gClipRectX1 - 1) or ((min(x1, x2, x3)) // 1))
	)
	local maxX = (
		((max(x1, x2, x3)) // 1) < gClipRectX0 and gClipRectX0
		or (((max(x1, x2, x3)) // 1) > (gClipRectX1 - 1) and (gClipRectX1 - 1) or ((max(x1, x2, x3)) // 1))
	)
	local minY = (
		((min(y1, y2, y3)) // 1) < gClipRectY0 and gClipRectY0
		or (((min(y1, y2, y3)) // 1) > (gClipRectY1 - 1) and (gClipRectY1 - 1) or ((min(y1, y2, y3)) // 1))
	)
	local maxY = (
		((max(y1, y2, y3)) // 1) < gClipRectY0 and gClipRectY0
		or (((max(y1, y2, y3)) // 1) > (gClipRectY1 - 1) and (gClipRectY1 - 1) or ((max(y1, y2, y3)) // 1))
	)
	if maxX < minX or maxY < minY then
		return
	end

	local sampleMinX = minX + 0.5
	local sampleMinY = minY + 0.5
	local rowW0 = (sampleMinX - x2) * stepX23 + (sampleMinY - y2) * stepY23 + bias23
	local rowW1 = (sampleMinX - x3) * stepX31 + (sampleMinY - y3) * stepY31 + bias31
	local rowW2 = (sampleMinX - x1) * stepX12 + (sampleMinY - y1) * stepY12 + bias12

	local invArea = 1 / area
	local frameBuffer_Material = gFrameBuffer_Material
	local frameBuffer_Tone = gFrameBuffer_Tone
	local frameBuffer_Depth = gFrameBuffer_Depth
	local textureMaterialSlots = texture.materialSlots
	local textureMaterialIndexBySlot = texture.materialIndexBySlot
	if textureMaterialSlots == nil or textureMaterialIndexBySlot == nil then
		return
	end
	local textureTones = texture.tones
	local textureWidth = texture.width
	local textureHeight = texture.height
	local textureMaxX = textureWidth - 1
	local textureMaxY = textureHeight - 1

	local iuA = uA
	local ivA = vA
	local iuB = uB
	local ivB = vB
	local iuC = uC
	local ivC = vC
	local itoneA = toneA
	local itoneB = toneB
	local itoneC = toneC
	if perspectiveCorrect then
		iuA = iuA * depthA
		ivA = ivA * depthA
		iuB = iuB * depthB
		ivB = ivB * depthB
		iuC = iuC * depthC
		ivC = ivC * depthC
		itoneA = itoneA * depthA
		itoneB = itoneB * depthB
		itoneC = itoneC * depthC
	end

	local depthAscaled, depthBscaled, depthCscaled = depthA * invArea, depthB * invArea, depthC * invArea
	local uAscaled, uBscaled, uCscaled = iuA * invArea, iuB * invArea, iuC * invArea
	local vAscaled, vBscaled, vCscaled = ivA * invArea, ivB * invArea, ivC * invArea
	local toneAscaled, toneBscaled, toneCscaled = itoneA * invArea, itoneB * invArea, itoneC * invArea

	local depthDx = depthAscaled * stepX23 + depthBscaled * stepX31 + depthCscaled * stepX12
	local depthDy = depthAscaled * stepY23 + depthBscaled * stepY31 + depthCscaled * stepY12
	local uDx = uAscaled * stepX23 + uBscaled * stepX31 + uCscaled * stepX12
	local uDy = uAscaled * stepY23 + uBscaled * stepY31 + uCscaled * stepY12
	local vDx = vAscaled * stepX23 + vBscaled * stepX31 + vCscaled * stepX12
	local vDy = vAscaled * stepY23 + vBscaled * stepY31 + vCscaled * stepY12
	local toneDx = toneAscaled * stepX23 + toneBscaled * stepX31 + toneCscaled * stepX12
	local toneDy = toneAscaled * stepY23 + toneBscaled * stepY31 + toneCscaled * stepY12

	local rowDepth = depthAscaled * rowW0 + depthBscaled * rowW1 + depthCscaled * rowW2
	local rowU = uAscaled * rowW0 + uBscaled * rowW1 + uCscaled * rowW2
	local rowV = vAscaled * rowW0 + vBscaled * rowW1 + vCscaled * rowW2
	local rowTone = toneAscaled * rowW0 + toneBscaled * rowW1 + toneCscaled * rowW2

	if (maxX - minX) >= 2 then
		local edgeSign = areaPositive and 1 or -1
		local edgeDx0 = stepX23 * edgeSign
		local edgeDx1 = stepX31 * edgeSign
		local edgeDx2 = stepX12 * edgeSign

		for sy = minY, maxY do
			local xStart = minX
			local xEnd = maxX
			local edge0 = rowW0 * edgeSign
			local edge1 = rowW1 * edgeSign
			local edge2 = rowW2 * edgeSign

			if edgeDx0 > 0 then
				local x = minX - ((edge0 / edgeDx0) // 1)
				if x > xStart then
					xStart = x
				end
			elseif edgeDx0 < 0 then
				local x = minX + ((edge0 / -edgeDx0) // 1)
				if x < xEnd then
					xEnd = x
				end
			elseif edge0 < 0 then
				xStart = maxX + 1
			end

			if edgeDx1 > 0 then
				local x = minX - ((edge1 / edgeDx1) // 1)
				if x > xStart then
					xStart = x
				end
			elseif edgeDx1 < 0 then
				local x = minX + ((edge1 / -edgeDx1) // 1)
				if x < xEnd then
					xEnd = x
				end
			elseif edge1 < 0 then
				xStart = maxX + 1
			end

			if edgeDx2 > 0 then
				local x = minX - ((edge2 / edgeDx2) // 1)
				if x > xStart then
					xStart = x
				end
			elseif edgeDx2 < 0 then
				local x = minX + ((edge2 / -edgeDx2) // 1)
				if x < xEnd then
					xEnd = x
				end
			elseif edge2 < 0 then
				xStart = maxX + 1
			end

			if xStart <= xEnd then
				local xOffset = xStart - minX
				local depth = rowDepth + depthDx * xOffset
				local u = rowU + uDx * xOffset
				local v = rowV + vDx * xOffset
				local tone = rowTone + toneDx * xOffset
				local rowBase = sy * 240

				for linearIndex = rowBase + xStart, rowBase + xEnd do
					if depth > frameBuffer_Depth[linearIndex] then
						local sampleU = u
						local sampleV = v
						local lightTone = tone
						if perspectiveCorrect then
							if depth > 0.001 then
								local invDepth = 1 / depth
								sampleU = sampleU * invDepth
								sampleV = sampleV * invDepth
								lightTone = lightTone * invDepth
							else
								sampleU = 0
								sampleV = 0
								lightTone = 0
							end
						end

						local tx = (sampleU * textureWidth) // 1
						tx = (tx < 0 and 0 or (tx > textureMaxX and textureMaxX or tx))
						local ty = (sampleV * textureHeight) // 1
						ty = (ty < 0 and 0 or (ty > textureMaxY and textureMaxY or ty))
						local textureIndex = ty * textureWidth + tx
						local materialIndex = textureMaterialIndexBySlot[textureMaterialSlots[textureIndex]]
						if materialIndex ~= nil then
							frameBuffer_Depth[linearIndex] = depth
							frameBuffer_Material[linearIndex] = materialIndex
							frameBuffer_Tone[linearIndex] = textureTones[textureIndex] * lightTone
							gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
						end
					end
					depth = depth + depthDx
					u = u + uDx
					v = v + vDx
					tone = tone + toneDx
				end
			end

			rowW0 = rowW0 + stepY23
			rowW1 = rowW1 + stepY31
			rowW2 = rowW2 + stepY12
			rowDepth = rowDepth + depthDy
			rowU = rowU + uDy
			rowV = rowV + vDy
			rowTone = rowTone + toneDy
		end
		return
	end

	if areaPositive then
		for sy = minY, maxY do
			local w0 = rowW0
			local w1 = rowW1
			local w2 = rowW2
			local depth = rowDepth
			local u = rowU
			local v = rowV
			local tone = rowTone
			local linearIndex0 = sy * 240 + minX
			local linearIndex1 = linearIndex0 + maxX - minX

			for linearIndex = linearIndex0, linearIndex1 do
				if w0 >= 0 and w1 >= 0 and w2 >= 0 then
					if depth > frameBuffer_Depth[linearIndex] then
						local sampleU = u
						local sampleV = v
						local lightTone = tone
						if perspectiveCorrect then
							if depth > 0.001 then
								local invDepth = 1 / depth
								sampleU = sampleU * invDepth
								sampleV = sampleV * invDepth
								lightTone = lightTone * invDepth
							else
								sampleU = 0
								sampleV = 0
								lightTone = 0
							end
						end

						local tx = (sampleU * textureWidth) // 1
						tx = (tx < 0 and 0 or (tx > textureMaxX and textureMaxX or tx))
						local ty = (sampleV * textureHeight) // 1
						ty = (ty < 0 and 0 or (ty > textureMaxY and textureMaxY or ty))
						local textureIndex = ty * textureWidth + tx
						local materialIndex = textureMaterialIndexBySlot[textureMaterialSlots[textureIndex]]
						if materialIndex ~= nil then
							frameBuffer_Depth[linearIndex] = depth
							frameBuffer_Material[linearIndex] = materialIndex
							frameBuffer_Tone[linearIndex] = textureTones[textureIndex] * lightTone
							gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
						end
					end
				end

				w0 = w0 + stepX23
				w1 = w1 + stepX31
				w2 = w2 + stepX12
				depth = depth + depthDx
				u = u + uDx
				v = v + vDx
				tone = tone + toneDx
			end

			rowW0 = rowW0 + stepY23
			rowW1 = rowW1 + stepY31
			rowW2 = rowW2 + stepY12
			rowDepth = rowDepth + depthDy
			rowU = rowU + uDy
			rowV = rowV + vDy
			rowTone = rowTone + toneDy
		end
		return
	end

	for sy = minY, maxY do
		local w0 = rowW0
		local w1 = rowW1
		local w2 = rowW2
		local depth = rowDepth
		local u = rowU
		local v = rowV
		local tone = rowTone
		local linearIndex0 = sy * 240 + minX
		local linearIndex1 = linearIndex0 + maxX - minX

		for linearIndex = linearIndex0, linearIndex1 do
			if w0 <= 0 and w1 <= 0 and w2 <= 0 then
				if depth > frameBuffer_Depth[linearIndex] then
					local sampleU = u
					local sampleV = v
					local lightTone = tone
					if perspectiveCorrect then
						if depth > 0.001 then
							local invDepth = 1 / depth
							sampleU = sampleU * invDepth
							sampleV = sampleV * invDepth
							lightTone = lightTone * invDepth
						else
							sampleU = 0
							sampleV = 0
							lightTone = 0
						end
					end

					local tx = (sampleU * textureWidth) // 1
					tx = (tx < 0 and 0 or (tx > textureMaxX and textureMaxX or tx))
					local ty = (sampleV * textureHeight) // 1
					ty = (ty < 0 and 0 or (ty > textureMaxY and textureMaxY or ty))
					local textureIndex = ty * textureWidth + tx
					local materialIndex = textureMaterialIndexBySlot[textureMaterialSlots[textureIndex]]
					if materialIndex ~= nil then
						frameBuffer_Depth[linearIndex] = depth
						frameBuffer_Material[linearIndex] = materialIndex
						frameBuffer_Tone[linearIndex] = textureTones[textureIndex] * lightTone
						gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
					end
				end
			end

			w0 = w0 + stepX23
			w1 = w1 + stepX31
			w2 = w2 + stepX12
			depth = depth + depthDx
			u = u + uDx
			v = v + vDx
			tone = tone + toneDx
		end

		rowW0 = rowW0 + stepY23
		rowW1 = rowW1 + stepY31
		rowW2 = rowW2 + stepY12
		rowDepth = rowDepth + depthDy
		rowU = rowU + uDy
		rowV = rowV + vDy
		rowTone = rowTone + toneDy
	end
end

-- Draw-order 2D triangle rasterizer. Uses the same top-left coverage rule as
-- the depth-aware triangle renderers, but deliberately does not read or write
-- the depth buffer.
function R_tri2D(x1, y1, x2, y2, x3, y3, materialIndex, tone)
	if materialIndex == nil then
		return
	end

	local stepX12 = y2 - y1
	local stepY12 = x1 - x2
	local stepX23 = y3 - y2
	local stepY23 = x2 - x3
	local stepX31 = y1 - y3
	local stepY31 = x3 - x1
	local area = (x1 - x2) * stepX23 + (y1 - y2) * stepY23
	if area == 0 then
		return
	end
	local areaPositive = area > 0
	local bias = areaPositive and -0.0001 or 0.0001
	-- use opposite bias, otherwise there's a very tiny dead band. #150
	local bias23 = ((y2 > y3) or (y2 == y3 and x2 < x3)) and -bias or bias
	local bias31 = ((y3 > y1) or (y3 == y1 and x3 < x1)) and -bias or bias
	local bias12 = ((y1 > y2) or (y1 == y2 and x1 < x2)) and -bias or bias

	local minX = (
		((min(x1, x2, x3)) // 1) < gClipRectX0 and gClipRectX0
		or (((min(x1, x2, x3)) // 1) > (gClipRectX1 - 1) and (gClipRectX1 - 1) or ((min(x1, x2, x3)) // 1))
	)
	local maxX = (
		((max(x1, x2, x3)) // 1) < gClipRectX0 and gClipRectX0
		or (((max(x1, x2, x3)) // 1) > (gClipRectX1 - 1) and (gClipRectX1 - 1) or ((max(x1, x2, x3)) // 1))
	)
	local minY = (
		((min(y1, y2, y3)) // 1) < gClipRectY0 and gClipRectY0
		or (((min(y1, y2, y3)) // 1) > (gClipRectY1 - 1) and (gClipRectY1 - 1) or ((min(y1, y2, y3)) // 1))
	)
	local maxY = (
		((max(y1, y2, y3)) // 1) < gClipRectY0 and gClipRectY0
		or (((max(y1, y2, y3)) // 1) > (gClipRectY1 - 1) and (gClipRectY1 - 1) or ((max(y1, y2, y3)) // 1))
	)
	if maxX < minX or maxY < minY then
		return
	end

	local sampleMinX = minX + 0.5
	local sampleMinY = minY + 0.5
	local rowW0 = (sampleMinX - x2) * stepX23 + (sampleMinY - y2) * stepY23 + bias23
	local rowW1 = (sampleMinX - x3) * stepX31 + (sampleMinY - y3) * stepY31 + bias31
	local rowW2 = (sampleMinX - x1) * stepX12 + (sampleMinY - y1) * stepY12 + bias12

	local frameBuffer_Material = gFrameBuffer_Material
	local frameBuffer_Tone = gFrameBuffer_Tone
	local toneValue = tone or 0

	if (maxX - minX) >= 2 then
		local edgeSign = areaPositive and 1 or -1
		local edgeDx0 = stepX23 * edgeSign
		local edgeDx1 = stepX31 * edgeSign
		local edgeDx2 = stepX12 * edgeSign

		for sy = minY, maxY do
			local xStart = minX
			local xEnd = maxX
			local edge0 = rowW0 * edgeSign
			local edge1 = rowW1 * edgeSign
			local edge2 = rowW2 * edgeSign

			if edgeDx0 > 0 then
				local x = minX - ((edge0 / edgeDx0) // 1)
				if x > xStart then
					xStart = x
				end
			elseif edgeDx0 < 0 then
				local x = minX + ((edge0 / -edgeDx0) // 1)
				if x < xEnd then
					xEnd = x
				end
			elseif edge0 < 0 then
				xStart = maxX + 1
			end

			if edgeDx1 > 0 then
				local x = minX - ((edge1 / edgeDx1) // 1)
				if x > xStart then
					xStart = x
				end
			elseif edgeDx1 < 0 then
				local x = minX + ((edge1 / -edgeDx1) // 1)
				if x < xEnd then
					xEnd = x
				end
			elseif edge1 < 0 then
				xStart = maxX + 1
			end

			if edgeDx2 > 0 then
				local x = minX - ((edge2 / edgeDx2) // 1)
				if x > xStart then
					xStart = x
				end
			elseif edgeDx2 < 0 then
				local x = minX + ((edge2 / -edgeDx2) // 1)
				if x < xEnd then
					xEnd = x
				end
			elseif edge2 < 0 then
				xStart = maxX + 1
			end

			if xStart <= xEnd then
				local rowBase = sy * 240
				for linearIndex = rowBase + xStart, rowBase + xEnd do
					frameBuffer_Material[linearIndex] = materialIndex
					frameBuffer_Tone[linearIndex] = toneValue
					local sx = linearIndex - rowBase
					gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
					R_outlineStampPixelForCurrentObject(sx, sy)
				end
			end

			rowW0 = rowW0 + stepY23
			rowW1 = rowW1 + stepY31
			rowW2 = rowW2 + stepY12
		end
		return
	end

	if areaPositive then
		for sy = minY, maxY do
			local w0 = rowW0
			local w1 = rowW1
			local w2 = rowW2
			local linearIndex0 = sy * 240 + minX
			local linearIndex1 = linearIndex0 + maxX - minX

			for linearIndex = linearIndex0, linearIndex1 do
				if w0 >= 0 and w1 >= 0 and w2 >= 0 then
					frameBuffer_Material[linearIndex] = materialIndex
					frameBuffer_Tone[linearIndex] = toneValue
					local sx = linearIndex - linearIndex0 + minX
					gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
					R_outlineStampPixelForCurrentObject(sx, sy)
				end

				w0 = w0 + stepX23
				w1 = w1 + stepX31
				w2 = w2 + stepX12
			end

			rowW0 = rowW0 + stepY23
			rowW1 = rowW1 + stepY31
			rowW2 = rowW2 + stepY12
		end
		return
	end

	for sy = minY, maxY do
		local w0 = rowW0
		local w1 = rowW1
		local w2 = rowW2
		local linearIndex0 = sy * 240 + minX
		local linearIndex1 = linearIndex0 + maxX - minX

		for linearIndex = linearIndex0, linearIndex1 do
			if w0 <= 0 and w1 <= 0 and w2 <= 0 then
				frameBuffer_Material[linearIndex] = materialIndex
				frameBuffer_Tone[linearIndex] = toneValue
				local sx = linearIndex - linearIndex0 + minX
				gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
				R_outlineStampPixelForCurrentObject(sx, sy)
			end

			w0 = w0 + stepX23
			w1 = w1 + stepX31
			w2 = w2 + stepX12
		end

		rowW0 = rowW0 + stepY23
		rowW1 = rowW1 + stepY31
		rowW2 = rowW2 + stepY12
	end
end

-- shadeFn parameters: sx, sy, bary0, bary1, bary2.
function R_tri2D_fn(x1, y1, x2, y2, x3, y3, shadeFn)
	local stepX12 = y2 - y1
	local stepY12 = x1 - x2
	local stepX23 = y3 - y2
	local stepY23 = x2 - x3
	local stepX31 = y1 - y3
	local stepY31 = x3 - x1
	local area = (x1 - x2) * stepX23 + (y1 - y2) * stepY23
	if area == 0 then
		return
	end

	local edgeSign = area > 0 and 1 or -1
	local bias = edgeSign > 0 and -0.0001 or 0.0001
	-- use opposite bias, otherwise there's a very tiny dead band. #150
	local bias23 = ((y2 > y3) or (y2 == y3 and x2 < x3)) and -bias or bias
	local bias31 = ((y3 > y1) or (y3 == y1 and x3 < x1)) and -bias or bias
	local bias12 = ((y1 > y2) or (y1 == y2 and x1 < x2)) and -bias or bias

	local minX = (
		((min(x1, x2, x3)) // 1) < gClipRectX0 and gClipRectX0
		or (((min(x1, x2, x3)) // 1) > (gClipRectX1 - 1) and (gClipRectX1 - 1) or ((min(x1, x2, x3)) // 1))
	)
	local maxX = (
		((max(x1, x2, x3)) // 1) < gClipRectX0 and gClipRectX0
		or (((max(x1, x2, x3)) // 1) > (gClipRectX1 - 1) and (gClipRectX1 - 1) or ((max(x1, x2, x3)) // 1))
	)
	local minY = (
		((min(y1, y2, y3)) // 1) < gClipRectY0 and gClipRectY0
		or (((min(y1, y2, y3)) // 1) > (gClipRectY1 - 1) and (gClipRectY1 - 1) or ((min(y1, y2, y3)) // 1))
	)
	local maxY = (
		((max(y1, y2, y3)) // 1) < gClipRectY0 and gClipRectY0
		or (((max(y1, y2, y3)) // 1) > (gClipRectY1 - 1) and (gClipRectY1 - 1) or ((max(y1, y2, y3)) // 1))
	)
	if maxX < minX or maxY < minY then
		return
	end

	local sampleMinX = minX + 0.5
	local sampleMinY = minY + 0.5
	local rowW0 = ((sampleMinX - x2) * stepX23 + (sampleMinY - y2) * stepY23 + bias23) * edgeSign
	local rowW1 = ((sampleMinX - x3) * stepX31 + (sampleMinY - y3) * stepY31 + bias31) * edgeSign
	local rowW2 = ((sampleMinX - x1) * stepX12 + (sampleMinY - y1) * stepY12 + bias12) * edgeSign
	stepX23 = stepX23 * edgeSign
	stepY23 = stepY23 * edgeSign
	stepX31 = stepX31 * edgeSign
	stepY31 = stepY31 * edgeSign
	stepX12 = stepX12 * edgeSign
	stepY12 = stepY12 * edgeSign
	local invArea = 1 / abs(area)
	local frameBuffer_Material = gFrameBuffer_Material
	local frameBuffer_Tone = gFrameBuffer_Tone

	for sy = minY, maxY do
		local w0 = rowW0
		local w1 = rowW1
		local w2 = rowW2
		local linearIndex0 = sy * 240 + minX
		local linearIndex1 = linearIndex0 + maxX - minX
		for linearIndex = linearIndex0, linearIndex1 do
			if w0 >= 0 and w1 >= 0 and w2 >= 0 then
				local sx = linearIndex - linearIndex0 + minX
				local materialIndex, tone = shadeFn(sx, sy, w0 * invArea, w1 * invArea, w2 * invArea)
				if materialIndex ~= nil then
					frameBuffer_Material[linearIndex] = materialIndex
					frameBuffer_Tone[linearIndex] = tone or 0
					gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
					R_outlineStampPixelForCurrentObject(sx, sy)
				end
			end
			w0 = w0 + stepX23
			w1 = w1 + stepX31
			w2 = w2 + stepX12
		end
		rowW0 = rowW0 + stepY23
		rowW1 = rowW1 + stepY31
		rowW2 = rowW2 + stepY12
	end
end

function R_quad2D(x0, y0, x1, y1, x2, y2, x3, y3, materialIndex, tone)
	R_tri2D(x0, y0, x1, y1, x2, y2, materialIndex, tone)
	R_tri2D(x0, y0, x2, y2, x3, y3, materialIndex, tone)
	R_noteTrianglesRendered(2)
end

function R_quad2D_uv_fn(x0, y0, x1, y1, x2, y2, x3, y3, width, height, shadeFn)
	local invWidth = width > 0 and 1 / width or 0
	local invHeight = height > 0 and 1 / height or 0
	R_tri2D_fn(x0, y0, x1, y1, x2, y2, function(sx, sy, b0, b1, b2)
		local localX = (b1 + b2) * width
		local localY = b2 * height
		return shadeFn(localX * invWidth, localY * invHeight, sx, sy, localX, localY)
	end)
	R_tri2D_fn(x0, y0, x2, y2, x3, y3, function(sx, sy, b0, b1, b2)
		local localX = b1 * width
		local localY = (b1 + b2) * height
		return shadeFn(localX * invWidth, localY * invHeight, sx, sy, localX, localY)
	end)
	R_noteTrianglesRendered(2)
end

function R_resolveArcSegmentCount(spanAngleRad, outerRadius, segments)
	if segments ~= nil and segments > 0 then
		return (((segments + 0.5) // 1) < 1 and 1 or (((segments + 0.5) // 1) > 256 and 256 or ((segments + 0.5) // 1)))
	end
	local span = abs(spanAngleRad)
	if span <= 0 or outerRadius <= 0 then
		return 0
	end
	return (
		((span * outerRadius / 4 + 0.5) // 1) < 1 and 1
		or (((span * outerRadius / 4 + 0.5) // 1) > 256 and 256 or ((span * outerRadius / 4 + 0.5) // 1))
	)
end

function R_arcPoint(cx, cy, radius, angle)
	return cx + cos(angle) * radius, cy + sin(angle) * radius
end

function R_arcSegment2D(cx, cy, innerRadius, outerRadius, startAngleRad, spanAngleRad, segments, materialIndex, tone)
	innerRadius = max(0, innerRadius or 0)
	outerRadius = max(0, outerRadius or 0)
	if outerRadius < innerRadius then
		local tmp = outerRadius
		outerRadius = innerRadius
		innerRadius = tmp
	end
	if outerRadius <= 0 or outerRadius <= innerRadius or spanAngleRad == 0 then
		return
	end

	local segmentCount = R_resolveArcSegmentCount(spanAngleRad, outerRadius, segments)
	if segmentCount <= 0 then
		return
	end

	local firstOuterX, firstOuterY = R_arcPoint(cx, cy, outerRadius, startAngleRad)
	local firstInnerX, firstInnerY = R_arcPoint(cx, cy, innerRadius, startAngleRad)
	local prevOuterX = firstOuterX
	local prevOuterY = firstOuterY
	local prevInnerX = firstInnerX
	local prevInnerY = firstInnerY
	local closesFullCircle = abs(abs(spanAngleRad) - 6.283185307179586) < 0.000001
	local trianglesRendered = 0

	for segmentIndex = 1, segmentCount do
		local nextOuterX
		local nextOuterY
		local nextInnerX
		local nextInnerY
		if closesFullCircle and segmentIndex == segmentCount then
			nextOuterX = firstOuterX
			nextOuterY = firstOuterY
			nextInnerX = firstInnerX
			nextInnerY = firstInnerY
		else
			local angle = startAngleRad + spanAngleRad * segmentIndex / segmentCount
			nextOuterX, nextOuterY = R_arcPoint(cx, cy, outerRadius, angle)
			nextInnerX, nextInnerY = R_arcPoint(cx, cy, innerRadius, angle)
		end

		R_tri2D(prevOuterX, prevOuterY, prevInnerX, prevInnerY, nextOuterX, nextOuterY, materialIndex, tone)
		R_tri2D(nextOuterX, nextOuterY, prevInnerX, prevInnerY, nextInnerX, nextInnerY, materialIndex, tone)
		trianglesRendered = trianglesRendered + 2

		prevOuterX = nextOuterX
		prevOuterY = nextOuterY
		prevInnerX = nextInnerX
		prevInnerY = nextInnerY
	end

	R_noteTrianglesRendered(trianglesRendered)
end

function R_unwrapArcAngle(rawAngle, startAngleRad, spanAngleRad)
	local angleOffset = rawAngle - startAngleRad
	if spanAngleRad >= 0 then
		while angleOffset < 0 do
			angleOffset = angleOffset + 6.283185307179586
		end
		while angleOffset > 6.283185307179586 do
			angleOffset = angleOffset - 6.283185307179586
		end
	else
		while angleOffset > 0 do
			angleOffset = angleOffset - 6.283185307179586
		end
		while angleOffset < -6.283185307179586 do
			angleOffset = angleOffset + 6.283185307179586
		end
	end
	return startAngleRad + angleOffset, angleOffset
end

-- shadeFn parameters: sx, sy, localX, localY, localAngle, localRadius, angle01, radius01.
function R_arcSegment2D_fn(cx, cy, innerRadius, outerRadius, startAngleRad, spanAngleRad, segments, shadeFn)
	innerRadius = max(0, innerRadius or 0)
	outerRadius = max(0, outerRadius or 0)
	if outerRadius < innerRadius then
		local tmp = outerRadius
		outerRadius = innerRadius
		innerRadius = tmp
	end
	if outerRadius <= 0 or outerRadius <= innerRadius or spanAngleRad == 0 then
		return
	end

	local segmentCount = R_resolveArcSegmentCount(spanAngleRad, outerRadius, segments)
	if segmentCount <= 0 then
		return
	end

	local invRadiusSpan = outerRadius > innerRadius and 1 / (outerRadius - innerRadius) or 0
	local invSpan = spanAngleRad ~= 0 and 1 / spanAngleRad or 0
	local function arcShadeFn(sx, sy)
		local localX = sx + 0.5 - cx
		local localY = sy + 0.5 - cy
		local localRadius = sqrt(localX * localX + localY * localY)
		local localAngle, angleOffset = R_unwrapArcAngle(atan2(localY, localX), startAngleRad, spanAngleRad)
		local angle01 = angleOffset * invSpan
		local radius01 = (localRadius - innerRadius) * invRadiusSpan
		return shadeFn(sx, sy, localX, localY, localAngle, localRadius, angle01, radius01)
	end

	local firstOuterX, firstOuterY = R_arcPoint(cx, cy, outerRadius, startAngleRad)
	local firstInnerX, firstInnerY = R_arcPoint(cx, cy, innerRadius, startAngleRad)
	local prevOuterX = firstOuterX
	local prevOuterY = firstOuterY
	local prevInnerX = firstInnerX
	local prevInnerY = firstInnerY
	local closesFullCircle = abs(abs(spanAngleRad) - 6.283185307179586) < 0.000001
	local trianglesRendered = 0

	for segmentIndex = 1, segmentCount do
		local nextOuterX
		local nextOuterY
		local nextInnerX
		local nextInnerY
		if closesFullCircle and segmentIndex == segmentCount then
			nextOuterX = firstOuterX
			nextOuterY = firstOuterY
			nextInnerX = firstInnerX
			nextInnerY = firstInnerY
		else
			local angle = startAngleRad + spanAngleRad * segmentIndex / segmentCount
			nextOuterX, nextOuterY = R_arcPoint(cx, cy, outerRadius, angle)
			nextInnerX, nextInnerY = R_arcPoint(cx, cy, innerRadius, angle)
		end

		R_tri2D_fn(prevOuterX, prevOuterY, prevInnerX, prevInnerY, nextOuterX, nextOuterY, arcShadeFn)
		R_tri2D_fn(nextOuterX, nextOuterY, prevInnerX, prevInnerY, nextInnerX, nextInnerY, arcShadeFn)
		trianglesRendered = trianglesRendered + 2

		prevOuterX = nextOuterX
		prevOuterY = nextOuterY
		prevInnerX = nextInnerX
		prevInnerY = nextInnerY
	end

	R_noteTrianglesRendered(trianglesRendered)
end

-- triangle rasterizer, with custom shade function called per pixel.
-- shadeFn parameters: sx, sy, bary0, bary1, bary2, depth
-- sx, sy: screen space coordinates of the pixel being shaded.
--
-- this is one of the hottest paths in the whole app so it needs to be
-- aggressively optimal.
function R_tri_fn(x1, y1, x2, y2, x3, y3, depthA, depthB, depthC, shadeFn)
	local stepX12 = y2 - y1
	local stepY12 = x1 - x2
	local stepX23 = y3 - y2
	local stepY23 = x2 - x3
	local stepX31 = y1 - y3
	local stepY31 = x3 - x1
	local area = (x1 - x2) * stepX23 + (y1 - y2) * stepY23
	if area == 0 then
		return
	end
	local areaPositive = area > 0
	-- top left rule; see https://en.wikipedia.org/wiki/Rasterisation
	local bias = areaPositive and -0.0001 or 0.0001
	-- use opposite bias, otherwise there's a very tiny dead band. #150
	local bias23 = ((y2 > y3) or (y2 == y3 and x2 < x3)) and -bias or bias
	local bias31 = ((y3 > y1) or (y3 == y1 and x3 < x1)) and -bias or bias
	local bias12 = ((y1 > y2) or (y1 == y2 and x1 < x2)) and -bias or bias

	local minX = (
		((min(x1, x2, x3)) // 1) < gClipRectX0 and gClipRectX0
		or (((min(x1, x2, x3)) // 1) > (gClipRectX1 - 1) and (gClipRectX1 - 1) or ((min(x1, x2, x3)) // 1))
	)
	local maxX = (
		((max(x1, x2, x3)) // 1) < gClipRectX0 and gClipRectX0
		or (((max(x1, x2, x3)) // 1) > (gClipRectX1 - 1) and (gClipRectX1 - 1) or ((max(x1, x2, x3)) // 1))
	)
	local minY = (
		((min(y1, y2, y3)) // 1) < gClipRectY0 and gClipRectY0
		or (((min(y1, y2, y3)) // 1) > (gClipRectY1 - 1) and (gClipRectY1 - 1) or ((min(y1, y2, y3)) // 1))
	)
	local maxY = (
		((max(y1, y2, y3)) // 1) < gClipRectY0 and gClipRectY0
		or (((max(y1, y2, y3)) // 1) > (gClipRectY1 - 1) and (gClipRectY1 - 1) or ((max(y1, y2, y3)) // 1))
	)
	if maxX < minX or maxY < minY then
		return
	end

	local sampleMinX = minX + 0.5
	local sampleMinY = minY + 0.5

	-- https://en.wikipedia.org/wiki/Barycentric_coordinate_system
	local rowW0 = (sampleMinX - x2) * stepX23 + (sampleMinY - y2) * stepY23 + bias23
	local rowW1 = (sampleMinX - x3) * stepX31 + (sampleMinY - y3) * stepY31 + bias31
	local rowW2 = (sampleMinX - x1) * stepX12 + (sampleMinY - y1) * stepY12 + bias12
	local invArea = 1 / area

	-- doesn't affect performance that i can tell.
	local frameBuffer_Material = gFrameBuffer_Material
	local frameBuffer_Tone = gFrameBuffer_Tone
	local frameBuffer_Depth = gFrameBuffer_Depth
	local depthAscaled, depthBscaled, depthCscaled = depthA * invArea, depthB * invArea, depthC * invArea
	local depthDx = depthAscaled * stepX23 + depthBscaled * stepX31 + depthCscaled * stepX12
	local depthDy = depthAscaled * stepY23 + depthBscaled * stepY31 + depthCscaled * stepY12
	local rowDepth = depthAscaled * rowW0 + depthBscaled * rowW1 + depthCscaled * rowW2
	local baryDx0 = stepX23 * invArea
	local baryDx1 = stepX31 * invArea
	local baryDx2 = stepX12 * invArea

	if (maxX - minX) >= 2 then
		local edgeSign = areaPositive and 1 or -1
		local edgeDx0 = stepX23 * edgeSign
		local edgeDx1 = stepX31 * edgeSign
		local edgeDx2 = stepX12 * edgeSign

		for sy = minY, maxY do
			local xStart = minX
			local xEnd = maxX
			local edge0 = rowW0 * edgeSign
			local edge1 = rowW1 * edgeSign
			local edge2 = rowW2 * edgeSign

			if edgeDx0 > 0 then
				local x = minX - ((edge0 / edgeDx0) // 1)
				if x > xStart then
					xStart = x
				end
			elseif edgeDx0 < 0 then
				local x = minX + ((edge0 / -edgeDx0) // 1)
				if x < xEnd then
					xEnd = x
				end
			elseif edge0 < 0 then
				xStart = maxX + 1
			end

			if edgeDx1 > 0 then
				local x = minX - ((edge1 / edgeDx1) // 1)
				if x > xStart then
					xStart = x
				end
			elseif edgeDx1 < 0 then
				local x = minX + ((edge1 / -edgeDx1) // 1)
				if x < xEnd then
					xEnd = x
				end
			elseif edge1 < 0 then
				xStart = maxX + 1
			end

			if edgeDx2 > 0 then
				local x = minX - ((edge2 / edgeDx2) // 1)
				if x > xStart then
					xStart = x
				end
			elseif edgeDx2 < 0 then
				local x = minX + ((edge2 / -edgeDx2) // 1)
				if x < xEnd then
					xEnd = x
				end
			elseif edge2 < 0 then
				xStart = maxX + 1
			end

			if xStart <= xEnd then
				local xOffset = xStart - minX
				local depth = rowDepth + depthDx * xOffset
				local bary0 = (rowW0 + stepX23 * xOffset) * invArea
				local bary1 = (rowW1 + stepX31 * xOffset) * invArea
				local bary2 = (rowW2 + stepX12 * xOffset) * invArea
				local rowBase = sy * 240

				for linearIndex = rowBase + xStart, rowBase + xEnd do
					if depth > frameBuffer_Depth[linearIndex] then
						local materialIndex, tone = shadeFn(linearIndex - rowBase, sy, bary0, bary1, bary2, depth)
						if materialIndex ~= nil then
							frameBuffer_Depth[linearIndex] = depth
							frameBuffer_Material[linearIndex] = materialIndex
							frameBuffer_Tone[linearIndex] = tone
							gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
						end
					end
					depth = depth + depthDx
					bary0 = bary0 + baryDx0
					bary1 = bary1 + baryDx1
					bary2 = bary2 + baryDx2
				end
			end

			rowW0 = rowW0 + stepY23
			rowW1 = rowW1 + stepY31
			rowW2 = rowW2 + stepY12
			rowDepth = rowDepth + depthDy
		end
		return
	end

	if areaPositive then
		for sy = minY, maxY do
			local w0 = rowW0
			local w1 = rowW1
			local w2 = rowW2
			local depth = rowDepth
			local linearIndex0 = sy * 240 + minX
			local linearIndex1 = linearIndex0 + maxX - minX

			for linearIndex = linearIndex0, linearIndex1 do
				if w0 >= 0 and w1 >= 0 and w2 >= 0 then
					local bary0 = w0 * invArea
					local bary1 = w1 * invArea
					local bary2 = w2 * invArea
					if depth > frameBuffer_Depth[linearIndex] then
						local sx = linearIndex - linearIndex0 + minX
						local materialIndex, tone = shadeFn(sx, sy, bary0, bary1, bary2, depth)
						if materialIndex ~= nil then
							frameBuffer_Depth[linearIndex] = depth
							frameBuffer_Material[linearIndex] = materialIndex
							frameBuffer_Tone[linearIndex] = tone
							gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
						end
					end
				end

				w0 = w0 + stepX23
				w1 = w1 + stepX31
				w2 = w2 + stepX12
				depth = depth + depthDx
			end

			rowW0 = rowW0 + stepY23
			rowW1 = rowW1 + stepY31
			rowW2 = rowW2 + stepY12
			rowDepth = rowDepth + depthDy
		end
		return
	end

	for sy = minY, maxY do
		local w0 = rowW0
		local w1 = rowW1
		local w2 = rowW2
		local depth = rowDepth
		local linearIndex0 = sy * 240 + minX
		local linearIndex1 = linearIndex0 + maxX - minX

		for linearIndex = linearIndex0, linearIndex1 do
			if w0 <= 0 and w1 <= 0 and w2 <= 0 then
				local bary0 = w0 * invArea
				local bary1 = w1 * invArea
				local bary2 = w2 * invArea
				if depth > frameBuffer_Depth[linearIndex] then
					local sx = linearIndex - linearIndex0 + minX
					local materialIndex, tone = shadeFn(sx, sy, bary0, bary1, bary2, depth)
					if materialIndex ~= nil then
						frameBuffer_Depth[linearIndex] = depth
						frameBuffer_Material[linearIndex] = materialIndex
						frameBuffer_Tone[linearIndex] = tone
						gFrameBuffer_ObjectId[linearIndex] = gCurrentObjectId
					end
				end
			end

			w0 = w0 + stepX23
			w1 = w1 + stepX31
			w2 = w2 + stepX12
			depth = depth + depthDx
		end

		rowW0 = rowW0 + stepY23
		rowW1 = rowW1 + stepY31
		rowW2 = rowW2 + stepY12
		rowDepth = rowDepth + depthDy
	end
end

do
	--[[

- scene owns camera state
- scene owns renderable objects and their transforms
- scene dispatches high-level objects to lower-level renderers

--]]

	local DEFAULT_LIGHT_X, DEFAULT_LIGHT_Y, DEFAULT_LIGHT_Z = Normalize3(-0.55, 0.45, -1.0)

	function Scene_createState()
		return {
			rendererMaterials = nil,
			clearMaterialIndex = nil,
			clearTone = 0,
			borderMaterialIndex = nil,
			borderTone = 0,
			viewport = {
				x = 0,
				y = 0,
				width = 240,
				height = 136,
			},
			environment = {
				ambient = 0,
				fog = nil,
				lightX = DEFAULT_LIGHT_X,
				lightY = DEFAULT_LIGHT_Y,
				lightZ = DEFAULT_LIGHT_Z,
			},
			outlines = {},
			camera = {
				kind = "ortho",
				x = 0,
				y = 0,
				z = 0,
				rotX = 0,
				rotY = 0,
				rotZ = 0,
				fov = 0,
				nearZ = 0,
				farZ = 0,
				projectionOffset = {
					x = 0,
					y = 0,
				},
			},
			renderCamera = {},
			renderEnvironment = {},
			renderContext = {},
			objects = {},
			objectsById = {},
		}
	end

	-- indexed by vertex index of the currently rendered mesh, populated by Scene_renderMesh3D and used for rendering each triangle of the mesh.
	local gMeshCamX = {}
	local gMeshCamY = {}
	local gMeshCamZ = {}
	local gMeshWorldX = {}
	local gMeshWorldY = {}
	local gMeshWorldZ = {}
	local gMeshScreenX = {}
	local gMeshScreenY = {}
	local gMeshInvZ = {}
	local gMeshTone = {} -- by vertex index

	-- for current mesh, list of accepted triangle values used during rasterization.
	local gMeshTriI1 = {}
	local gMeshTriI2 = {}
	local gMeshTriI3 = {}
	local gMeshTriMaterial = {}
	local gMeshTriTexture = {}
	local gMeshTriTextureSource = {}
	local gMeshTriTone = {}
	local gMeshTriHasSurface = {}
	local gMeshTriSourceIndex = {}
	local gMeshTriFragmentShader = {}
	local gMeshTriWorldNormalX = {}
	local gMeshTriWorldNormalY = {}
	local gMeshTriWorldNormalZ = {}
	local gMeshTriCamNormalX = {}
	local gMeshTriCamNormalY = {}
	local gMeshTriCamNormalZ = {}
	-- indexed by source triangle so silhouette extraction can compare front/back adjacency
	local gMeshSourceTriFrontFacing = {}

	function Scene_ensureMeshDerivedData(mesh)
		if
			mesh._derivedTriangleNormalCount == #mesh.triangles
			and mesh._derivedTriangleVertexCount == #mesh.vertices
			and mesh._derivedEdgeTriangleCount == #mesh.triangles
			and mesh._derivedEdgeVertexCount == #mesh.vertices
		then
			return
		end

		local vertices = mesh.vertices
		local triangles = mesh.triangles
		-- cached triangle adjacency; built once so editor silhouettes avoid per-frame topology work
		local edges = {}
		local edgeMap = {}
		for triangleIndex = 1, #triangles do
			local triangle = triangles[triangleIndex]
			local v1 = vertices[triangle[1]]
			local v2 = vertices[triangle[2]]
			local v3 = vertices[triangle[3]]
			local edge1x = v2.x - v1.x
			local edge1y = v2.y - v1.y
			local edge1z = v2.z - v1.z
			local edge2x = v3.x - v1.x
			local edge2y = v3.y - v1.y
			local edge2z = v3.z - v1.z
			triangle._localNormalX, triangle._localNormalY, triangle._localNormalZ = Normalize3(
				edge1y * edge2z - edge1z * edge2y,
				edge1z * edge2x - edge1x * edge2z,
				edge1x * edge2y - edge1y * edge2x
			)

			for edgeOffset = 0, 2 do
				local i1 = triangle[edgeOffset + 1]
				local i2 = triangle[(edgeOffset + 1) % 3 + 1]
				local low = min(i1, i2)
				local high = max(i1, i2)
				local key = low .. ":" .. high
				local edgeIndex = edgeMap[key]
				if edgeIndex == nil then
					edges[#edges + 1] = {
						i1 = i1,
						i2 = i2,
						triangleA = triangleIndex,
						triangleB = nil,
					}
					edgeMap[key] = #edges
				else
					local edge = edges[edgeIndex]
					edge.triangleB = triangleIndex
				end
			end
		end

		mesh._derivedEdges = edges
		mesh._derivedTriangleNormalCount = #triangles
		mesh._derivedTriangleVertexCount = #vertices
		mesh._derivedEdgeTriangleCount = #triangles
		mesh._derivedEdgeVertexCount = #vertices
	end

	function Scene_applyFog(fog, baseTone, camX, camY, camZ)
		local density = fog.density
		local startDistance = fog.startDistance or 80
		local distance = sqrt(camX * camX + camY * camY + camZ * camZ)
		if distance <= startDistance then
			return baseTone
		end
		local fogFactor = exp(-density * (distance - startDistance))
		return baseTone * fogFactor
	end

	function Scene_resetViewport(scene)
		local viewport = scene.viewport
		viewport.x = 0
		viewport.y = 0
		viewport.width = 240
		viewport.height = 136
	end

	function Scene_resetEnvironment(scene)
		local environment = scene.environment
		environment.ambient = 0
		environment.fog = nil
		environment.lightX = DEFAULT_LIGHT_X
		environment.lightY = DEFAULT_LIGHT_Y
		environment.lightZ = DEFAULT_LIGHT_Z
	end

	function Scene_setViewport(scene, viewport)
		if viewport == nil then
			return
		end

		local dst = scene.viewport
		if viewport.x ~= nil then
			dst.x = viewport.x
		end
		if viewport.y ~= nil then
			dst.y = viewport.y
		end
		if viewport.width ~= nil then
			dst.width = viewport.width
		end
		if viewport.height ~= nil then
			dst.height = viewport.height
		end
	end

	function Scene_setEnvironment(scene, environment)
		if environment == nil then
			return
		end

		local dst = scene.environment
		if environment.ambient ~= nil then
			dst.ambient = environment.ambient
		end
		if environment.fog ~= nil then
			dst.fog = environment.fog
		end
		if environment.lightDirection ~= nil then
			local lightDirection = environment.lightDirection
			local lightX = lightDirection.x or lightDirection[1] or DEFAULT_LIGHT_X
			local lightY = lightDirection.y or lightDirection[2] or DEFAULT_LIGHT_Y
			local lightZ = lightDirection.z or lightDirection[3] or DEFAULT_LIGHT_Z
			dst.lightX, dst.lightY, dst.lightZ = Normalize3(lightX, lightY, lightZ)
		end
	end

	function Scene_buildRenderCamera(scene, viewportOverride, cameraOverride)
		local src = cameraOverride or scene.camera
		local viewport = viewportOverride or scene.viewport
		local renderCamera = scene.renderCamera
		local viewportWidth = max(0, viewport.width or 0)
		local viewportHeight = max(0, viewport.height or 0)

		renderCamera.kind = src.kind
		renderCamera.x = src.x
		renderCamera.y = src.y
		renderCamera.z = src.z
		renderCamera.rotX = src.rotX
		renderCamera.rotY = src.rotY
		renderCamera.rotZ = src.rotZ
		renderCamera.fov = src.fov
		renderCamera.nearZ = src.nearZ
		renderCamera.farZ = src.farZ
		renderCamera.projectionOffset = src.projectionOffset
		renderCamera.viewportWidth = viewportWidth
		renderCamera.viewportHeight = viewportHeight
		renderCamera.screenOriginX = viewport.x + viewportWidth * 0.5
		renderCamera.screenOriginY = viewport.y + viewportHeight * 0.5

		return renderCamera
	end

	function Scene_buildRenderEnvironment(scene, environmentOverride)
		local src = scene.environment
		local renderEnvironment = scene.renderEnvironment

		renderEnvironment.ambient = src.ambient
		renderEnvironment.fog = src.fog
		renderEnvironment.lightX = src.lightX
		renderEnvironment.lightY = src.lightY
		renderEnvironment.lightZ = src.lightZ

		if environmentOverride ~= nil then
			if environmentOverride.ambient ~= nil then
				renderEnvironment.ambient = environmentOverride.ambient
			end
			if environmentOverride.fog ~= nil then
				renderEnvironment.fog = environmentOverride.fog
			end
			if environmentOverride.lightDirection ~= nil then
				local lightDirection = environmentOverride.lightDirection
				local lightX = lightDirection.x or lightDirection[1] or DEFAULT_LIGHT_X
				local lightY = lightDirection.y or lightDirection[2] or DEFAULT_LIGHT_Y
				local lightZ = lightDirection.z or lightDirection[3] or DEFAULT_LIGHT_Z
				renderEnvironment.lightX, renderEnvironment.lightY, renderEnvironment.lightZ =
					Normalize3(lightX, lightY, lightZ)
			end
		end

		return renderEnvironment
	end

	function Scene_buildRenderContext(scene, viewport, camera, environment)
		local renderContext = scene.renderContext
		local viewportX = viewport.x or 0
		local viewportY = viewport.y or 0
		local viewportWidth = max(0, viewport.width or 0)
		local viewportHeight = max(0, viewport.height or 0)

		renderContext.viewport = viewport
		renderContext.camera = camera
		renderContext.environment = environment
		renderContext.viewportX = viewportX
		renderContext.viewportY = viewportY
		renderContext.viewportWidth = viewportWidth
		renderContext.viewportHeight = viewportHeight
		return renderContext
	end

	-- uses front/back triangle transitions as a cheap approximation of the visible mesh contour
	function Scene_renderMeshOutline(camera, mesh, outlineMaterialIndex, outlineTone)
		if outlineMaterialIndex == nil then
			return
		end

		local edges = mesh._derivedEdges
		if edges == nil then
			return
		end

		local depthBias = camera.kind == "perspective" and 0.0001 or 0.01
		for edgeIndex = 1, #edges do
			local edge = edges[edgeIndex]
			local frontA = gMeshSourceTriFrontFacing[edge.triangleA] == true
			local frontB = edge.triangleB ~= nil and gMeshSourceTriFrontFacing[edge.triangleB] == true or false
			if frontA ~= frontB then
				local i1 = edge.i1
				local i2 = edge.i2
				local depth1
				local depth2
				if camera.kind == "perspective" then
					depth1 = gMeshInvZ[i1] + depthBias
					depth2 = gMeshInvZ[i2] + depthBias
				else
					depth1 = -gMeshCamZ[i1] + depthBias
					depth2 = -gMeshCamZ[i2] + depthBias
				end
				R_outlineLine_z(
					gMeshScreenX[i1],
					gMeshScreenY[i1],
					depth1,
					gMeshScreenX[i2],
					gMeshScreenY[i2],
					depth2,
					outlineMaterialIndex,
					outlineTone
				)
			end
		end
	end

	function Scene_renderMesh3D(camera, environment, object, outlineMaterialIndex, outlineTone)
		local render = object.render
		local mesh = render.mesh
		if mesh == nil or mesh.vertices == nil or mesh.triangles == nil then
			return
		end
		Scene_ensureMeshDerivedData(mesh)

		local transform = object.transform
		local invScaleX = abs(transform.scaleX) < 0.00001 and 0 or 1 / transform.scaleX
		local invScaleY = abs(transform.scaleY) < 0.00001 and 0 or 1 / transform.scaleY
		local invScaleZ = abs(transform.scaleZ) < 0.00001 and 0 or 1 / transform.scaleZ
		local objectCosX = cos(transform.rotX)
		local objectSinX = sin(transform.rotX)
		local objectCosY = cos(transform.rotY)
		local objectSinY = sin(transform.rotY)
		local objectCosZ = cos(transform.rotZ)
		local objectSinZ = sin(transform.rotZ)
		local cameraCosX = cos(camera.rotX)
		local cameraSinX = sin(camera.rotX)
		local cameraCosY = cos(camera.rotY)
		local cameraSinY = sin(camera.rotY)
		local cameraCosZ = cos(camera.rotZ)
		local cameraSinZ = sin(camera.rotZ)
		local lightX = environment.lightX or DEFAULT_LIGHT_X
		local lightY = environment.lightY or DEFAULT_LIGHT_Y
		local lightZ = environment.lightZ or DEFAULT_LIGHT_Z

		local ambient = environment.ambient or 0
		local shadingMode = render.shading or "gouraud"
		local receiveFog = render.receiveFog ~= false
		local fog = receiveFog and environment.fog or nil
		local fragmentShader = render.fragmentShader
		local faceStyleByKey = render.faceStyleByKey
		local unlit = shadingMode == "unlit"
		local needsVertexLighting = not unlit and (shadingMode ~= "flat" or render.wireframe)
		local nearZ = camera.nearZ
		if nearZ == nil or nearZ <= 0 then
			nearZ = 1
		end
		local projectionOffset = SafeVec2(camera.projectionOffset)
		local projectionOffsetX = projectionOffset.x
		local projectionOffsetY = projectionOffset.y

		local focalLength = 1
		local halfViewportHeight = camera.viewportHeight * 0.5
		if camera.kind == "perspective" then
			-- note: duplicated code with R_projectCameraPoint3D; todo: centralize!
			local fov = camera.fov
			if fov == nil or fov <= 0 then
				fov = 3.141592653589793 / 3
			end
			local halfFov = fov * 0.5
			local sinHalfFov = sin(halfFov)
			if abs(sinHalfFov) < 0.0001 then
				sinHalfFov = 0.0001
			end
			focalLength = halfViewportHeight * cos(halfFov) / sinHalfFov
		end

		-- calculate dynamic info about each vertex
		local vertices = mesh.vertices
		for vertexIndex = 1, #vertices do
			local vertex = vertices[vertexIndex]

			-- populate gMeshWorldXYZ
			local localX = vertex.x * transform.scaleX
			local localY = vertex.y * transform.scaleY
			local localZ = vertex.z * transform.scaleZ
			local worldX, worldY, worldZ = Rotate3WithTrig(
				localX,
				localY,
				localZ,
				objectCosX,
				objectSinX,
				objectCosY,
				objectSinY,
				objectCosZ,
				objectSinZ
			)
			worldX = worldX + transform.x
			worldY = worldY + transform.y
			worldZ = worldZ + transform.z

			gMeshWorldX[vertexIndex] = worldX
			gMeshWorldY[vertexIndex] = worldY
			gMeshWorldZ[vertexIndex] = worldZ

			-- populate gMeshCamXYZ
			local camX = worldX - camera.x
			local camY = worldY - camera.y
			local camZ = worldZ - camera.z
			camX, camY, camZ = InverseRotate3WithTrig(
				camX,
				camY,
				camZ,
				cameraCosX,
				cameraSinX,
				cameraCosY,
				cameraSinY,
				cameraCosZ,
				cameraSinZ
			)

			gMeshCamX[vertexIndex] = camX
			gMeshCamY[vertexIndex] = camY
			gMeshCamZ[vertexIndex] = camZ
			gMeshInvZ[vertexIndex] = camera.kind == "perspective" and (1 / camZ) or 1

			-- calculate screen coords and store in gMeshScreenXY
			if camera.kind == "perspective" then
				-- Perspective camera space projects around the center of the pass viewport.
				local invZ = focalLength / max(camZ, nearZ)
				gMeshScreenX[vertexIndex] = camera.screenOriginX + projectionOffsetX + camX * invZ
				gMeshScreenY[vertexIndex] = camera.screenOriginY + projectionOffsetY - camY * invZ
			else
				-- Orthographic camera space is also centered in the pass viewport; one camera-space
				-- unit maps to one screen pixel before clipping.
				gMeshScreenX[vertexIndex] = camera.screenOriginX + projectionOffsetX + camX
				gMeshScreenY[vertexIndex] = camera.screenOriginY + projectionOffsetY - camY
			end

			if needsVertexLighting then
				local normalX = vertex.nx or vertex.x
				local normalY = vertex.ny or vertex.y
				local normalZ = vertex.nz or vertex.z
				normalX, normalY, normalZ = Normalize3(normalX, normalY, normalZ)
				normalX, normalY, normalZ = Rotate3WithTrig(
					normalX,
					normalY,
					normalZ,
					objectCosX,
					objectSinX,
					objectCosY,
					objectSinY,
					objectCosZ,
					objectSinZ
				)
				local diffuse = (normalX * lightX + normalY * lightY + normalZ * lightZ)
				if diffuse < 0 then
					diffuse = 0
				end
				gMeshTone[vertexIndex] = ambient + diffuse * (1 - ambient)
			else
				gMeshTone[vertexIndex] = 1
			end
		end -- for each vertex

		if fog ~= nil and (shadingMode ~= "flat" or render.wireframe) then
			for vertexIndex = 1, #vertices do
				gMeshTone[vertexIndex] = Scene_applyFog(
					fog,
					gMeshTone[vertexIndex],
					gMeshCamX[vertexIndex],
					gMeshCamY[vertexIndex],
					gMeshCamZ[vertexIndex]
				)
			end
		end

		local triangleCount = 0
		local triangles = mesh.triangles
		for triangleIndex = 1, #triangles do
			gMeshSourceTriFrontFacing[triangleIndex] = false
			local triangle = triangles[triangleIndex]
			local i1 = triangle[1]
			local i2 = triangle[2]
			local i3 = triangle[3]
			local z1 = gMeshCamZ[i1]
			local z2 = gMeshCamZ[i2]
			local z3 = gMeshCamZ[i3]

			if z1 > nearZ and z2 > nearZ and z3 > nearZ then -- near plane culling
				local localNormalX = triangle._localNormalX * invScaleX
				local localNormalY = triangle._localNormalY * invScaleY
				local localNormalZ = triangle._localNormalZ * invScaleZ
				local ax = gMeshCamX[i1]
				local ay = gMeshCamY[i1]
				local az = z1
				local worldNormalX, worldNormalY, worldNormalZ = Rotate3WithTrig(
					localNormalX,
					localNormalY,
					localNormalZ,
					objectCosX,
					objectSinX,
					objectCosY,
					objectSinY,
					objectCosZ,
					objectSinZ
				)
				worldNormalX, worldNormalY, worldNormalZ = Normalize3(worldNormalX, worldNormalY, worldNormalZ)
				local normalX, normalY, normalZ = InverseRotate3WithTrig(
					worldNormalX,
					worldNormalY,
					worldNormalZ,
					cameraCosX,
					cameraSinX,
					cameraCosY,
					cameraSinY,
					cameraCosZ,
					cameraSinZ
				)
				local frontFacing = false
				if camera.kind == "perspective" then
					frontFacing = normalX * ax + normalY * ay + normalZ * az < 0
				else
					-- orthographic cameras use a constant view direction in camera space.
					frontFacing = normalZ < 0
				end

				if frontFacing then -- backface culling
					gMeshSourceTriFrontFacing[triangleIndex] = true
					triangleCount = triangleCount + 1
					gMeshTriI1[triangleCount] = i1
					gMeshTriI2[triangleCount] = i2
					gMeshTriI3[triangleCount] = i3
					gMeshTriSourceIndex[triangleCount] = triangleIndex

					-- determine mat/tone / texture for this tri.
					local materialIndex = nil
					local texture = nil
					local textureSource = false
					local sourceTone = 1
					local hasSurface = true
					local triFragmentShader = fragmentShader
					local faceStyle = nil
					if faceStyleByKey ~= nil then
						local faceKey = triangle.faceKey
						if faceKey == nil then
							local faceIndex = triangle.faceIndex
							if faceIndex == nil then
								faceIndex = triangleIndex - 1
							end
							faceKey = tostring(faceIndex)
						else
							faceKey = tostring(faceKey)
						end
						faceStyle = faceStyleByKey[faceKey]
					end
					-- todo: just use the normal texture/material/tone properties; no need to make separate "overrides".
					if faceStyle ~= nil and faceStyle.materialIndex ~= nil then
						materialIndex = faceStyle.materialIndex
						sourceTone = faceStyle.tone ~= nil and faceStyle.tone or 0
						triFragmentShader = nil
					elseif render.textureOverrideActive and render.textureOverride ~= nil then
						texture = render.textureOverride
						textureSource = true
					elseif triFragmentShader ~= nil then
						sourceTone = render.tone ~= nil and render.tone or 1
					elseif render.materialIndex ~= nil then
						materialIndex = render.materialIndex
						sourceTone = render.tone ~= nil and render.tone or 1
					elseif triangle.texture ~= nil then
						texture = triangle.texture
						textureSource = true
					elseif triangle.hasColor or triangle.materialIndex ~= nil or triangle[4] ~= nil then
						materialIndex = triangle.materialIndex or triangle[4]
						sourceTone = triangle.tone ~= nil and triangle.tone or 1
					elseif mesh.hasColor or mesh.materialIndex ~= nil then
						materialIndex = mesh.materialIndex
						sourceTone = mesh.tone ~= nil and mesh.tone or 1
					else
						hasSurface = false
					end

					gMeshTriMaterial[triangleCount] = materialIndex
					gMeshTriTexture[triangleCount] = texture
					gMeshTriTextureSource[triangleCount] = textureSource
					gMeshTriTone[triangleCount] = sourceTone
					gMeshTriHasSurface[triangleCount] = hasSurface
					gMeshTriFragmentShader[triangleCount] = triFragmentShader
					gMeshTriWorldNormalX[triangleCount] = worldNormalX
					gMeshTriWorldNormalY[triangleCount] = worldNormalY
					gMeshTriWorldNormalZ[triangleCount] = worldNormalZ
					gMeshTriCamNormalX[triangleCount] = normalX
					gMeshTriCamNormalY[triangleCount] = normalY
					gMeshTriCamNormalZ[triangleCount] = normalZ
				end
			end
		end
		R_noteTrianglesRendered(triangleCount)

		local shaderContext = {}
		if render.wireframe then
			local mat = render.materialIndex or 1
			for triangleIndex = 1, triangleCount do
				local i1 = gMeshTriI1[triangleIndex]
				local i2 = gMeshTriI2[triangleIndex]
				local i3 = gMeshTriI3[triangleIndex]
				local d1, d2, d3
				if camera.kind == "perspective" then
					d1 = gMeshInvZ[i1]
					d2 = gMeshInvZ[i2]
					d3 = gMeshInvZ[i3]
				else
					d1 = -gMeshCamZ[i1]
					d2 = -gMeshCamZ[i2]
					d3 = -gMeshCamZ[i3]
				end
				-- per-vertex tone with range compression to avoid pure black/white
				local wt1 = (0.1 + (0.9 - 0.1) * gMeshTone[i1])
				local wt2 = (0.1 + (0.9 - 0.1) * gMeshTone[i2])
				local wt3 = (0.1 + (0.9 - 0.1) * gMeshTone[i3])
				R_line_z_g(
					gMeshScreenX[i1],
					gMeshScreenY[i1],
					d1,
					wt1,
					gMeshScreenX[i2],
					gMeshScreenY[i2],
					d2,
					wt2,
					mat
				)
				R_line_z_g(
					gMeshScreenX[i2],
					gMeshScreenY[i2],
					d2,
					wt2,
					gMeshScreenX[i3],
					gMeshScreenY[i3],
					d3,
					wt3,
					mat
				)
				R_line_z_g(
					gMeshScreenX[i3],
					gMeshScreenY[i3],
					d3,
					wt3,
					gMeshScreenX[i1],
					gMeshScreenY[i1],
					d1,
					wt1,
					mat
				)
			end
			Scene_renderMeshOutline(camera, mesh, outlineMaterialIndex, outlineTone)
			return
		end

		for triangleIndex = 1, triangleCount do
			local i1 = gMeshTriI1[triangleIndex]
			local i2 = gMeshTriI2[triangleIndex]
			local i3 = gMeshTriI3[triangleIndex]
			local materialIndex = gMeshTriMaterial[triangleIndex]
			local texture = gMeshTriTexture[triangleIndex]
			local textureSource = gMeshTriTextureSource[triangleIndex]
			local triFragmentShader = gMeshTriFragmentShader[triangleIndex]
			if gMeshTriHasSurface[triangleIndex] then
				local tone1 = gMeshTone[i1]
				local tone2 = gMeshTone[i2]
				local tone3 = gMeshTone[i3]
				local triangle = triangles[gMeshTriSourceIndex[triangleIndex]]
				local depth1
				local depth2
				local depth3
				if camera.kind == "perspective" then
					depth1 = gMeshInvZ[i1]
					depth2 = gMeshInvZ[i2]
					depth3 = gMeshInvZ[i3]
				else
					depth1 = -gMeshCamZ[i1]
					depth2 = -gMeshCamZ[i2]
					depth3 = -gMeshCamZ[i3]
				end

				-- flat shading is calculated at the triangle level (because shared vertices can have different tones in flat shading).
				if shadingMode == "flat" then
					local localNormalX = triangle._localNormalX * invScaleX
					local localNormalY = triangle._localNormalY * invScaleY
					local localNormalZ = triangle._localNormalZ * invScaleZ
					local normalX, normalY, normalZ = Rotate3WithTrig(
						localNormalX,
						localNormalY,
						localNormalZ,
						objectCosX,
						objectSinX,
						objectCosY,
						objectSinY,
						objectCosZ,
						objectSinZ
					)
					normalX, normalY, normalZ = Normalize3(normalX, normalY, normalZ)
					local diffuse = (normalX * lightX + normalY * lightY + normalZ * lightZ)
					if diffuse < 0 then
						diffuse = 0
					end
					local tone = ambient + diffuse * (1 - ambient)
					tone1 = tone
					tone2 = tone
					tone3 = tone
				end

				if fog ~= nil and shadingMode == "flat" then
					tone1 = Scene_applyFog(fog, tone1, gMeshCamX[i1], gMeshCamY[i1], gMeshCamZ[i1])
					tone2 = Scene_applyFog(fog, tone2, gMeshCamX[i2], gMeshCamY[i2], gMeshCamZ[i2])
					tone3 = Scene_applyFog(fog, tone3, gMeshCamX[i3], gMeshCamY[i3], gMeshCamZ[i3])
				end

				local sourceTone = gMeshTriTone[triangleIndex] or 1
				tone1 = tone1 * sourceTone
				tone2 = tone2 * sourceTone
				tone3 = tone3 * sourceTone

				-- NB: frag shader assumes you have UVs.
				if textureSource then
					local uv1 = triangle.uv1 ~= nil and mesh.uvs[triangle.uv1] or nil
					local uv2 = triangle.uv2 ~= nil and mesh.uvs[triangle.uv2] or nil
					local uv3 = triangle.uv3 ~= nil and mesh.uvs[triangle.uv3] or nil
					if texture ~= nil and uv1 ~= nil and uv2 ~= nil and uv3 ~= nil then
						R_tri_tex(
							gMeshScreenX[i1],
							gMeshScreenY[i1],
							gMeshScreenX[i2],
							gMeshScreenY[i2],
							gMeshScreenX[i3],
							gMeshScreenY[i3],
							depth1,
							depth2,
							depth3,
							tone1,
							tone2,
							tone3,
							uv1.u,
							uv1.v,
							uv2.u,
							uv2.v,
							uv3.u,
							uv3.v,
							texture,
							camera.kind == "perspective"
						)
					end
				elseif triFragmentShader ~= nil then
					local uvIndex1 = triangle.uv1
					local uvIndex2 = triangle.uv2
					local uvIndex3 = triangle.uv3
					local meshUvs = mesh.uvs
					local uv1 = meshUvs ~= nil and uvIndex1 ~= nil and meshUvs[uvIndex1] or nil
					local uv2 = meshUvs ~= nil and uvIndex2 ~= nil and meshUvs[uvIndex2] or nil
					local uv3 = meshUvs ~= nil and uvIndex3 ~= nil and meshUvs[uvIndex3] or nil
					if uv1 ~= nil then
						TFASSERT(
							uv2 ~= nil and uv3 ~= nil,
							"Scene_renderMesh3D: fragment shader requires all three UVs to be defined for triangle."
						)
						local vertex1 = vertices[i1]
						local vertex2 = vertices[i2]
						local vertex3 = vertices[i3]
						local u1 = uv1.u
						local v1 = uv1.v
						local u2 = uv2.u
						local v2 = uv2.v
						local u3 = uv3.u
						local v3 = uv3.v

						local invZ1 = gMeshInvZ[i1]
						local invZ2 = gMeshInvZ[i2]
						local invZ3 = gMeshInvZ[i3]
						shaderContext.object = object
						shaderContext.render = render
						shaderContext.camera = camera
						shaderContext.mesh = mesh
						shaderContext.triangle = triangle
						--shaderContext.triangleIndex = gMeshTriSourceIndex[triangleIndex]
						shaderContext.materialIndex = materialIndex
						shaderContext.vertex1 = vertex1
						shaderContext.vertex2 = vertex2
						shaderContext.vertex3 = vertex3
						shaderContext.i1 = i1
						shaderContext.i2 = i2
						shaderContext.i3 = i3
						shaderContext.normalLocalX = triangle._localNormalX
						shaderContext.normalLocalY = triangle._localNormalY
						shaderContext.normalLocalZ = triangle._localNormalZ
						-- shaderContext.normalWorldX = gMeshTriWorldNormalX[triangleIndex]
						-- shaderContext.normalWorldY = gMeshTriWorldNormalY[triangleIndex]
						-- shaderContext.normalWorldZ = gMeshTriWorldNormalZ[triangleIndex]
						-- shaderContext.normalCamX = gMeshTriCamNormalX[triangleIndex]
						-- shaderContext.normalCamY = gMeshTriCamNormalY[triangleIndex]
						-- shaderContext.normalCamZ = gMeshTriCamNormalZ[triangleIndex]
						shaderContext.tone1 = tone1
						shaderContext.tone2 = tone2
						shaderContext.tone3 = tone3
						shaderContext.u1 = u1
						shaderContext.v1 = v1
						shaderContext.u2 = u2
						shaderContext.v2 = v2
						shaderContext.u3 = u3
						shaderContext.v3 = v3

						if camera.kind == "perspective" then
							R_tri_fn(
								gMeshScreenX[i1],
								gMeshScreenY[i1],
								gMeshScreenX[i2],
								gMeshScreenY[i2],
								gMeshScreenX[i3],
								gMeshScreenY[i3],
								depth1,
								depth2,
								depth3,
								function(sx, sy, bary1, bary2, bary3, depth)
									local oneOverZ = depth
									if oneOverZ <= 0.001 then
										return nil
									end
									local perspectiveScale = 1 / oneOverZ
									local baseTone = (
										bary1 * tone1 * invZ1
										+ bary2 * tone2 * invZ2
										+ bary3 * tone3 * invZ3
									) * perspectiveScale
									local u = (bary1 * u1 * invZ1 + bary2 * u2 * invZ2 + bary3 * u3 * invZ3)
										* perspectiveScale
									local v = (bary1 * v1 * invZ1 + bary2 * v2 * invZ2 + bary3 * v3 * invZ3)
										* perspectiveScale
									return triFragmentShader(shaderContext, u, v, baseTone, sx, sy, bary1, bary2, bary3)
								end
							)
						else
							R_tri_fn(
								gMeshScreenX[i1],
								gMeshScreenY[i1],
								gMeshScreenX[i2],
								gMeshScreenY[i2],
								gMeshScreenX[i3],
								gMeshScreenY[i3],
								depth1,
								depth2,
								depth3,
								function(sx, sy, bary1, bary2, bary3)
									local baseTone = bary1 * tone1 + bary2 * tone2 + bary3 * tone3
									local u = bary1 * u1 + bary2 * u2 + bary3 * u3
									local v = bary1 * v1 + bary2 * v2 + bary3 * v3
									return triFragmentShader(shaderContext, u, v, baseTone, sx, sy, bary1, bary2, bary3)
								end
							)
						end
					end
				elseif materialIndex ~= nil then
					R_tri_g(
						gMeshScreenX[i1],
						gMeshScreenY[i1],
						gMeshScreenX[i2],
						gMeshScreenY[i2],
						gMeshScreenX[i3],
						gMeshScreenY[i3],
						materialIndex,
						tone1,
						tone2,
						tone3,
						depth1,
						depth2,
						depth3
					)
				end
			end
		end
		Scene_renderMeshOutline(camera, mesh, outlineMaterialIndex, outlineTone)
	end

	function Scene_resetCamera(scene)
		local camera = scene.camera
		camera.kind = "ortho"
		camera.x = 0
		camera.y = 0
		camera.z = 0
		camera.rotX = 0
		camera.rotY = 0
		camera.rotZ = 0
		camera.fov = 0
		camera.nearZ = 0
		camera.farZ = 0
		camera.projectionOffset.x = 0
		camera.projectionOffset.y = 0
	end

	function Scene_ensureTransformDefaults(object)
		local transform = object.transform
		if transform == nil then
			transform = {}
			object.transform = transform
		end

		if transform.x == nil then
			transform.x = 0
		end
		if transform.y == nil then
			transform.y = 0
		end
		if transform.z == nil then
			transform.z = 0
		end
		if transform.rotX == nil then
			transform.rotX = 0
		end
		if transform.rotY == nil then
			transform.rotY = 0
		end
		if transform.rotZ == nil then
			transform.rotZ = 0
		end
		if transform.scaleX == nil then
			transform.scaleX = 1
		end
		if transform.scaleY == nil then
			transform.scaleY = 1
		end
		if transform.scaleZ == nil then
			transform.scaleZ = 1
		end
	end

	function Scene_dispatchObject(context, object, outlineMaterialIndex, outlineTone)
		local render = object.render
		if render == nil then
			return
		end

		if render.kind == "objectGroup" then
			local viewport = render.viewport
			local pushedClip = false
			if viewport ~= nil then
				R_pushClipRect(
					(context.viewportX or 0) + (viewport.x or 0),
					(context.viewportY or 0) + (viewport.y or 0),
					viewport.width or 0,
					viewport.height or 0
				)
				pushedClip = true
			end

			local children = render.children or {}
			Scene_sortObjectsForRender(children)
			for childIndex = 1, #children do
				local child = children[childIndex]
				if child.visible ~= false and child.render ~= nil then
					Scene_dispatchObject(context, child)
				end
			end
			if pushedClip then
				R_popClipRect()
			end
			return
		end

		if render.kind == "custom2d" and render.draw ~= nil then
			render.draw(context, object)
			return
		end

		if render.kind == "mesh3d" then
			Scene_renderMesh3D(context.camera, context.environment, object, outlineMaterialIndex, outlineTone)
		end
	end

	function Scene_sortObjectsForRender(objects)
		table.sort(objects, function(a, b)
			local za = a ~= nil and a.transform ~= nil and SafeFloat(a.transform.z) or 0
			local zb = b ~= nil and b.transform ~= nil and SafeFloat(b.transform.z) or 0
			if za ~= zb then
				return za > zb
			end
			return SafeFloat(a._sceneInsertionIndex) < SafeFloat(b._sceneInsertionIndex)
		end)
	end

	function Scene_setCamera(scene, camera)
		if camera == nil then
			return
		end

		local dst = scene.camera
		if camera.kind ~= nil then
			dst.kind = camera.kind
		end
		if camera.x ~= nil then
			dst.x = camera.x
		end
		if camera.y ~= nil then
			dst.y = camera.y
		end
		if camera.z ~= nil then
			dst.z = camera.z
		end
		if camera.rotX ~= nil then
			dst.rotX = camera.rotX
		end
		if camera.rotY ~= nil then
			dst.rotY = camera.rotY
		end
		if camera.rotZ ~= nil then
			dst.rotZ = camera.rotZ
		end
		if camera.fov ~= nil then
			dst.fov = camera.fov
		end
		if camera.nearZ ~= nil then
			dst.nearZ = camera.nearZ
		end
		if camera.farZ ~= nil then
			dst.farZ = camera.farZ
		end
		if camera.projectionOffset ~= nil then
			dst.projectionOffset = SafeVec2(camera.projectionOffset)
		end
	end

	function Scene_beginFrame(scene, frame)
		scene.rendererMaterials = frame.materials
		scene.clearMaterialIndex = frame.clearMaterialIndex
		scene.clearTone = frame.clearTone or 0
		scene.borderMaterialIndex = frame.borderMaterialIndex
		scene.borderTone = frame.borderTone or 0 -- borders are static colors so this is basically ignored (for now)

		local objects = scene.objects
		for objectIndex = #objects, 1, -1 do
			objects[objectIndex] = nil
		end
		-- local objectsById = scene.objectsById
		-- for objectId, _ in pairs(objectsById) do
		-- 	objectsById[objectId] = nil
		-- end
		scene.objectsById = {}
		local outlines = scene.outlines
		for i = #outlines, 1, -1 do
			outlines[i] = nil
		end

		Scene_resetCamera(scene)
		Scene_resetViewport(scene)
		Scene_resetEnvironment(scene)
		if frame.camera ~= nil then
			Scene_setCamera(scene, frame.camera)
		end
		if frame.viewport ~= nil then
			Scene_setViewport(scene, frame.viewport)
		end
		if frame.environment ~= nil then
			Scene_setEnvironment(scene, frame.environment)
		end

		return scene
	end

	function Scene_addObject(scene, object)
		if object == nil then
			return nil
		end

		Scene_ensureTransformDefaults(object)
		if object.visible == nil then
			object.visible = true
		end
		if object.id ~= nil then
			TFASSERT(type(object.id) == "string", "object id must be a string: " .. tostring(object.id))
			TFASSERT(scene.objectsById[object.id] == nil, "duplicate scene object id: " .. tostring(object.id))
			scene.objectsById[object.id] = object
		end

		object._sceneInsertionIndex = #scene.objects + 1
		scene.objects[#scene.objects + 1] = object
		return object
	end

	function Scene_getObjectById(scene, objectId)
		return scene.objectsById[objectId]
	end

	-- small linear search is fine here; outlined objects are few in editor use
	function Scene_getOutlineForObjectId(scene, objectId)
		local outlines = scene.outlines
		for i = 1, #outlines do
			local outline = outlines[i]
			if outline.id == objectId then
				return outline
			end
		end
		return nil
	end

	function Scene_addOutline(scene, objectId, materialIndex, tone)
		if objectId == nil then
			return
		end
		local outlines = scene.outlines
		outlines[#outlines + 1] = { id = objectId, mat = materialIndex, tone = tone }
	end

	function Scene_beginRenderFrame(config)
		-- config.materials is used.
		R_beginFrame(config)

		-- note: you can avoid clear by specifying nil
		if config.clearMaterialIndex ~= nil then
			R_clear(config.clearMaterialIndex, config.clearTone)
		end
		if config.borderMaterialIndex ~= nil then
			-- raster bars is still possible; just pass nil as borderMaterial and draw it manually.
			R_border(0, 136, config.borderMaterialIndex, config.borderTone or 0)
		end
	end

	-- after building the scene, call this to dispatch to our frame buffers.
	function Scene_renderPass(scene, pass)
		local viewport = scene.viewport
		local cameraOverride = nil
		local environmentOverride = nil
		local clearMaterialIndex = scene.clearMaterialIndex
		local clearTone = scene.clearTone

		if pass ~= nil then
			if pass.viewport ~= nil then
				viewport = pass.viewport
			end
			cameraOverride = pass.camera
			environmentOverride = pass.environment
			if pass.clear == false then
				clearMaterialIndex = nil
			end
			if pass.clearMaterialIndex ~= nil then
				clearMaterialIndex = pass.clearMaterialIndex
			end
			if pass.clearTone ~= nil then
				clearTone = pass.clearTone
			end
		end

		if clearMaterialIndex ~= nil then
			R_clearRect(viewport.x, viewport.y, viewport.width, viewport.height, clearMaterialIndex, clearTone)
		end

		local renderCamera = Scene_buildRenderCamera(scene, viewport, cameraOverride)
		local renderEnvironment = Scene_buildRenderEnvironment(scene, environmentOverride)
		local renderContext = Scene_buildRenderContext(scene, viewport, renderCamera, renderEnvironment)
		R_pushClipRect(viewport.x, viewport.y, viewport.width, viewport.height)
		Scene_sortObjectsForRender(scene.objects)

		for objectIndex = 1, #scene.objects do
			local object = scene.objects[objectIndex]
			if object.visible ~= false and object.render ~= nil then
				local objectId = object.id
				local editorObjectId = object.editorObjectId or objectId
				R_setCurrentObjectId(editorObjectId)
				local outline = editorObjectId ~= nil and Scene_getOutlineForObjectId(scene, editorObjectId) or nil
				if outline ~= nil and object.render.kind == "custom2d" then
					R_setCurrentOutline(outline.mat, outline.tone)
				else
					R_clearCurrentOutline()
				end
				Scene_dispatchObject(
					renderContext,
					object,
					outline ~= nil and outline.mat or nil,
					outline ~= nil and outline.tone or nil
				)
				R_clearCurrentOutline()
			end
		end
		R_setCurrentObjectId(0)
		R_clearCurrentOutline()
		R_popClipRect()
	end

	function Scene_endRenderFrame()
		R_flushOutlineOverlay()
		R_present()
	end

	function Scene_viewportToScreenPoint(context, x, y)
		context = context or {}
		return x + (context.viewportX or 0), y + (context.viewportY or 0)
	end

	Scene_new = Scene_createState
end

do
	-- TODO: as needed, other encoders, decoders for
	-- * base64
	-- * RLE

	-- base85 decode (ASCII85-style) for TIC-80 Lua
	-- aka b85+1 because it encodes the length of the final partial group in the first char, so no padding is needed.

	-- Decodes 's' into memory starting at 'dst', writing exactly expectedLen bytes.
	-- Returns the number of bytes written (should equal expectedLen or error).

	-- BTW, justification for using this instead of typical tonumber() method:
	-- ASCII85 is 1.25 chars per byte
	-- HEX is 2 chars per byte
	-- the ascii85 lua decoder is about 600 bytes.
	-- so in lua,
	-- ascii85's payload is 600 + (1.25 * N) bytes
	-- hex's payload is 2 * N bytes, and probably some tiny amount of decoder like 30 bytes.
	-- the break-even point is @
	--      let d85 = ascii85 decoder size 600 bytes
	--      let d16 = hex decoder size / 30 bytes
	--      d85 + 1.25 * N < d16 + 2 * N
	--      2 N - 1.25 N > d85 - d16
	--      0.75 N > d85 - d16
	-- 	    N > (d85 - d16) / 0.75
	-- -> Break-even point = (ascii85 decoder size - hex decoder size) / 0.75
	-- -> (600 - 30) / 0.75 = 760 bytes
	-- So for patterns larger than that, ascii85 is more size-efficient.
	---@param s source; string
	---@param d dest location, memory location to poke to
	function Base85Plus1DecodeToMem(s, d)
		local miss = s:byte(1) - 33
		s = s:sub(2)
		local n = (#s // 5) * 4 - miss
		local i = 1
		local pk = poke
		for o = 0, n - 1, 4 do
			local v = 0
			for j = i, i + 4 do
				v = v * 85 + s:byte(j) - 33
			end
			i = i + 5
			for k = 3, 0, -1 do
				if o + k < n then
					pk(d + o + k, v % 256)
				end
				v = v // 256
			end
		end
		return n
	end

	-- decodes into a 1-indexed table of byte values
	function Base85Plus1DecodeToTable(s, t)
		local miss = s:byte(1) - 33
		s = s:sub(2)
		local n = (#s // 5) * 4 - miss
		local i = 1
		local tIndex = 1
		for o = 0, n - 1, 4 do
			local v = 0
			for j = i, i + 4 do
				v = v * 85 + s:byte(j) - 33
			end
			i = i + 5
			local groupStart = tIndex
			local written = 0
			for k = 3, 0, -1 do
				if o + k < n then
					t[groupStart + k] = v % 256
					written = written + 1
				end
				v = v // 256
			end
			tIndex = tIndex + written
		end
	end

	-- Read unsigned LEB128 varint from memory.
	-- base:   start address of encoded stream
	-- si:     current offset (0-based) into the stream
	-- srcLen: total length of the encoded stream (in bytes)
	-- Returns: value, next_si
	local function varintMem(base, si, srcLen)
		local x, f = 0, 1
		while true do
			local b = peek(base + si)
			si = si + 1
			x = x + (b % 0x80) * f
			if b < 0x80 then
				return x, si
			end
			f = f * 0x80
		end
	end

	-- LZ-Decompress from [src .. src+srcLen-1] into [dst ..).
	-- Returns number of decompressed bytes written.
	function LZDecodeMemToMem(src, srcLen, dst)
		local si, di = 0, 0
		local pk = peek
		local pok = poke
		local varint = varintMem
		while si < srcLen do
			local t = pk(src + si)
			si = si + 1
			if t == 0 then
				local l
				l, si = varint(src, si, srcLen)
				for j = 1, l do
					pok(dst + di, pk(src + si))
					si = si + 1
					di = di + 1
				end
			else
				local l, d
				l, si = varint(src, si, srcLen)
				d, si = varint(src, si, srcLen)
				for j = 1, l do
					pok(dst + di, pk(dst + di - d))
					di = di + 1
				end
			end
		end
		return di
	end

	local function varintTable(t, ti)
		local x, f = 0, 1
		while true do
			local b = t[ti]
			ti = ti + 1
			x = x + (b % 0x80) * f
			if b < 0x80 then
				return x, ti
			end
			f = f * 0x80
		end
	end

	function LZDecodeTableToTable(src, dst)
		local si, di = 1, 1
		local varint = varintTable
		while si <= #src do
			local t = src[si]
			si = si + 1
			if t == 0 then
				local l
				l, si = varint(src, si)
				for j = 1, l do
					dst[di] = src[si]
					si = si + 1
					di = di + 1
				end
			else
				local l, d
				l, si = varint(src, si)
				d, si = varint(src, si)
				for j = 1, l do
					dst[di] = dst[di - d]
					di = di + 1
				end
			end
		end
	end
end

-- Shared binary mask runtime utilities.
-- Supports:
--   "table:mask"
--   "string:hexmask4"
--   "string:bitmask8;lz;b85+1"
--
-- Requires: Base85Plus1DecodeToTable, LZDecodeTableToTable (from encodings.lua)

do
	function Mask_DecodeBinaryMask(maskDef)
		local w = maskDef.width or 0
		local h = maskDef.height or 0
		local pixCount = w * h
		local fmt = maskDef.fragFormat or "table:mask"
		local fragsIn = maskDef.frags or {}
		local fragsOut = {}

		if fmt == "table:mask" then
			for i = 1, pixCount do
				fragsOut[i] = (fragsIn[i] ~= nil and fragsIn[i] ~= 0) and 1 or 0
			end
		elseif fmt == "string:hexmask4" then
			local out_i = 1
			for ci = 1, #fragsIn do
				local nib = tonumber(fragsIn:sub(ci, ci), 16)
				if nib then
					fragsOut[out_i] = nib // 8
					fragsOut[out_i + 1] = (nib // 4) % 2
					fragsOut[out_i + 2] = (nib // 2) % 2
					fragsOut[out_i + 3] = nib % 2
					out_i = out_i + 4
					if out_i > pixCount then
						break
					end
				end
			end
		elseif fmt == "string:bitmask8;lz;b85+1" then
			local compressed = {}
			Base85Plus1DecodeToTable(fragsIn, compressed)
			local packed = {}
			LZDecodeTableToTable(compressed, packed)
			local out_i = 1
			for _, byte in ipairs(packed) do
				local v = byte
				for _ = 1, 8 do
					fragsOut[out_i] = v // 128
					v = (v % 128) * 2
					out_i = out_i + 1
					if out_i > pixCount then
						break
					end
				end
				if out_i > pixCount then
					break
				end
			end
		end

		return { width = w, height = h, frags = fragsOut }
	end
end

do
	-- ── Internal helpers ───────────────────────────────────────────────────────

	-- Advance width for codepoint cp after prevCp, including any kerning.
	function Font_advance_(font, cp, prevCp)
		local g = font.glyphByCodepoint[cp]
		if not g then
			return font.defaultAdvanceX
		end
		local adv = g.advanceX
		if prevCp then
			local byFirst = font.kerningBySecond[cp]
			if byFirst then
				adv = adv + (byFirst[prevCp] or 0)
			end
		end
		return adv
	end

	-- Pixel width of a single text line (no newlines).
	function Font_measureLine_(font, str, scaleX)
		local cursor, prev = 0, nil
		for i = 1, #str do
			local cp = str:byte(i)
			cursor = cursor + Font_advance_(font, cp, prev) * scaleX
			prev = cp
		end
		return cursor
	end

	-- Build a shade function for a draw call.
	-- shadeFn(atlasLinear, screen_x, screen_y) → materialIndex, tone
	-- text{X,Y,W,H}: full text-block bounds on screen (for gradient scope).
	-- line{Y,H}:     current line bounds on screen (for "line"-scope vgrad).
	function Font_buildShadeFn_(font, opts, textX, textY, textW, textH, lineY, lineH)
		local da = font.displayAtlas
		local tt = opts.textureType or (da and "texture" or nil)

		if tt == "texture" then
			if not da then
				return nil
			end
			local tones = da.tones
			local materialSlots = da.materialSlots
			local materialIndexBySlot = da.materialIndexBySlot
			if materialSlots == nil or materialIndexBySlot == nil then
				return nil
			end
			return function(al, sx, sy)
				return materialIndexBySlot[materialSlots[al]], tones[al]
			end
		elseif tt == "flat" then
			local mi, t = opts.materialIndex, opts.toneA or 0
			return function(al, sx, sy)
				return mi, t
			end
		elseif tt == "hgrad" then
			local mi = opts.materialIndex
			local tA, tB = opts.toneA or 0, opts.toneB or 1
			local invW = textW > 0 and 1 / textW or 1
			return function(al, sx, sy)
				return mi, (tA + (tB - tA) * ((sx - textX) * invW))
			end
		elseif tt == "vgrad" then
			local mi = opts.materialIndex
			local tA, tB = opts.toneA or 0, opts.toneB or 1
			local scope = opts.gradientScope or "line"
			local refY = scope == "text" and textY or lineY
			local refH = scope == "text" and textH or lineH
			local invH = refH > 0 and 1 / refH or 1
			return function(al, sx, sy)
				return mi, (tA + (tB - tA) * ((sy - refY) * invH))
			end
		elseif tt == "fn" then
			local fn = opts.fn
			local invW = textW > 0 and 1 / textW or 1
			local invH = textH > 0 and 1 / textH or 1
			return function(al, sx, sy)
				local u = (sx - textX) * invW
				local v = (sy - textY) * invH
				-- todo: don't allocate a table each pixel; just pass as args.
				return fn({ u = u, v = v, x = sx, y = sy })
			end
		end
		return nil -- nothing to draw (e.g. "texture" with no display atlas)
	end

	-- Draw a single glyph. cx/cy = pen position (top-left of cell, before glyph offsets).
	-- Writes directly to gFrameBuffer_Material / gFrameBuffer_Tone for performance.
	function Font_drawGlyph_(font, cp, cx, cy, scaleX, scaleY, clipX0, clipX1, shadeFn)
		local g = font.glyphByCodepoint[cp]
		if not g then
			return
		end

		local ma = font.maskAtlas
		if not ma then
			return
		end

		local aw, ah = g.atlasWidth, g.atlasHeight
		local axOff, ayOff = g.atlasX, g.atlasY
		local atlasW = ma.width
		local frags = ma.frags

		local glyphX = cx + g.offsetX * scaleX
		local glyphY = cy + g.offsetY * scaleY

		local clipY0 = gClipRectY0
		local clipY1 = gClipRectY1
		local W = 240
		local fb_m = gFrameBuffer_Material
		local fb_t = gFrameBuffer_Tone
		local fb_oid = gFrameBuffer_ObjectId
		local sourceObjectId = gCurrentObjectId
		local outlineMat = gCurrentOutlineMaterialIndex
		local outlineTone = gCurrentOutlineTone
		local outlineEnabled = outlineMat ~= nil and sourceObjectId ~= nil

		-- For each atlas pixel, derive its covered screen-pixel range as
		-- [floor(glyphPos + idx*scale), floor(glyphPos + (idx+1)*scale)).
		-- This avoids gaps at non-integer scales (e.g. 1.5x: every third screen
		-- pixel was previously skipped) and avoids overdraw at integer scales.

		for gy = 0, ah - 1 do
			local screenYFrom = (glyphY + gy * scaleY) // 1
			local screenYTo = (glyphY + (gy + 1) * scaleY) // 1
			if screenYTo <= screenYFrom then
				screenYTo = screenYFrom + 1
			end
			for spy = screenYFrom, screenYTo - 1 do
				if spy >= clipY0 and spy < clipY1 then
					local rowBase = spy * W
					for gx = 0, aw - 1 do
						local fragIdx = (ayOff + gy) * atlasW + (axOff + gx) + 1
						if frags[fragIdx] == 1 then
							local al = (ayOff + gy) * atlasW + (axOff + gx)
							local screenXFrom = (glyphX + gx * scaleX) // 1
							local screenXTo = (glyphX + (gx + 1) * scaleX) // 1
							if screenXTo <= screenXFrom then
								screenXTo = screenXFrom + 1
							end
							for spx = screenXFrom, screenXTo - 1 do
								if spx >= clipX0 and spx < clipX1 then
									local mat, tone = shadeFn(al, spx, spy)
									if mat ~= nil then
										local linearIndex = rowBase + spx
										fb_m[linearIndex] = mat
										fb_t[linearIndex] = tone or 0
										fb_oid[linearIndex] = sourceObjectId
										if outlineEnabled then
											if spx > gClipRectX0 then
												R_overlayOutlinePixel(
													linearIndex - 1,
													sourceObjectId,
													outlineMat,
													outlineTone,
													nil
												)
											end
											if spx + 1 < gClipRectX1 then
												R_overlayOutlinePixel(
													linearIndex + 1,
													sourceObjectId,
													outlineMat,
													outlineTone,
													nil
												)
											end
											if spy > gClipRectY0 then
												R_overlayOutlinePixel(
													linearIndex - W,
													sourceObjectId,
													outlineMat,
													outlineTone,
													nil
												)
											end
											if spy + 1 < gClipRectY1 then
												R_overlayOutlinePixel(
													linearIndex + W,
													sourceObjectId,
													outlineMat,
													outlineTone,
													nil
												)
											end
										end
									end
								end
							end
						end
					end
				end
			end
		end
	end

	function Font_textImageCacheKey_(text, lineHeight, multiline)
		return tostring(lineHeight or "") .. "\31" .. tostring(multiline ~= false) .. "\31" .. tostring(text or "")
	end

	-- Line height in screen pixels, accounting for scaleY and any lineHeight override.
	function Font_GetLineHeight(font, options)
		return ((options and options.lineHeight) or font.lineHeight) * ((options and options.scaleY) or 1)
	end

	-- Returns { w, h } for a single text line (newlines not expected).
	function Font_MeasureText(font, str, options)
		local scaleX = (options and options.scaleX) or 1
		local scaleY = (options and options.scaleY) or 1
		local lh = ((options and options.lineHeight) or font.lineHeight) * scaleY
		return { w = Font_measureLine_(font, str, scaleX), h = lh }
	end

	-- Splits str on '\n'; returns array of { text, x, y, w, h }.
	-- x is always 0 (relative to draw origin). y increments by lineHeight per line.
	function Font_LayoutText(font, str, options)
		local scaleX = (options and options.scaleX) or 1
		local scaleY = (options and options.scaleY) or 1
		local lh = ((options and options.lineHeight) or font.lineHeight) * scaleY
		local layout, y = {}, 0
		if options and options.multiline == false then
			str = (str or ""):match("([^\n]*)") or ""
		end
		for line in (str .. "\n"):gmatch("([^\n]*)\n") do
			local w = Font_measureLine_(font, line, scaleX)
			layout[#layout + 1] = { text = line, x = 0, y = y, w = w, h = lh }
			y = y + lh
		end
		return layout
	end

	function Font_BuildTextImage(font, str, options)
		local opts = options or {}
		local text = str or ""
		if opts.multiline == false then
			text = text:match("([^\n]*)") or ""
		end

		local lineHeight = opts.lineHeight or font.lineHeight
		local layout = Font_LayoutText(font, text, { scaleX = 1, scaleY = 1, lineHeight = lineHeight })
		local width = 0
		for _, line in ipairs(layout) do
			if line.w > width then
				width = line.w
			end
		end
		width = max(1, (width + 0.9999) // 1)
		local height = max(1, (#layout > 0 and (layout[#layout].y + layout[#layout].h) or lineHeight) // 1)
		local atlasLinearByPixel = {}
		local lineIndexByPixel = {}
		local ma = font.maskAtlas
		if ma == nil then
			return {
				width = width,
				height = height,
				lines = layout,
				atlasLinearByPixel = atlasLinearByPixel,
				lineIndexByPixel = lineIndexByPixel,
			}
		end

		local atlasW = ma.width
		local frags = ma.frags
		for lineIndex, line in ipairs(layout) do
			local cursor = 0
			local prev = nil
			local lineText = line.text
			for ci = 1, #lineText do
				local cp = lineText:byte(ci)
				local g = font.glyphByCodepoint[cp]
				if g ~= nil then
					local glyphX = cursor + g.offsetX
					local glyphY = line.y + g.offsetY
					for gy = 0, g.atlasHeight - 1 do
						local localY = glyphY + gy
						if localY >= 0 and localY < height then
							local rowBase = localY * width
							local atlasRow = (g.atlasY + gy) * atlasW
							for gx = 0, g.atlasWidth - 1 do
								local fragIndex = atlasRow + g.atlasX + gx + 1
								if frags[fragIndex] == 1 then
									local localX = glyphX + gx
									if localX >= 0 and localX < width then
										local linearIndex = rowBase + localX
										atlasLinearByPixel[linearIndex] = atlasRow + g.atlasX + gx
										lineIndexByPixel[linearIndex] = lineIndex
									end
								end
							end
						end
					end
				end
				cursor = cursor + Font_advance_(font, cp, prev)
				prev = cp
			end
		end

		return {
			width = width,
			height = height,
			lines = layout,
			atlasLinearByPixel = atlasLinearByPixel,
			lineIndexByPixel = lineIndexByPixel,
		}
	end

	function Font_GetTextImage(font, str, options)
		local opts = options or {}
		local lineHeight = opts.lineHeight or font.lineHeight
		local key = Font_textImageCacheKey_(str, lineHeight, opts.multiline)
		local cache = font._textImageCache
		if cache == nil then
			cache = {}
			font._textImageCache = cache
		end
		local image = cache[key]
		if image == nil then
			image = Font_BuildTextImage(font, str, {
				lineHeight = lineHeight,
				multiline = opts.multiline,
			})
			cache[key] = image
		end
		return image
	end

	-- Draw a single glyph at (x, y). Gradient bounds are set to the glyph itself.
	-- options: same textureType / material / tone fields as Font_DrawText.
	function Font_DrawChar(font, codepoint, x, y, options)
		local opts = options or {}
		local scaleX = opts.scaleX or 1
		local scaleY = opts.scaleY or 1
		local g = font.glyphByCodepoint[codepoint]
		local gW = (g and g.atlasWidth or font.defaultAdvanceX) * scaleX
		local gH = (g and g.atlasHeight or font.lineHeight) * scaleY
		local shadeFn = Font_buildShadeFn_(font, opts, x, y, gW, gH, y, gH)
		if shadeFn then
			Font_drawGlyph_(font, codepoint, x, y, scaleX, scaleY, gClipRectX0, gClipRectX1, shadeFn)
		end
	end

	function Font_ForEachTextGlyph(font, str, options, fn)
		if font == nil or fn == nil then
			return
		end

		local opts = options or {}
		local ox = opts.x or 0
		local oy = opts.y or 0
		local scaleX = opts.scaleX or 1
		local scaleY = opts.scaleY or 1
		local scrollX = opts.scrollX or 0
		local maxW = opts.maxWidth
		local layout = Font_LayoutText(font, str, opts)
		local clipX0 = max(ox, opts.clipX0 or gClipRectX0)
		local clipX1 = maxW and min(ox + maxW, opts.clipX1 or gClipRectX1) or (opts.clipX1 or gClipRectX1)
		local textScreenX = ox - scrollX
		local textScreenY = oy
		local totalW = 0
		for _, line in ipairs(layout) do
			if line.w > totalW then
				totalW = line.w
			end
		end
		local totalH = #layout > 0 and (layout[#layout].y + layout[#layout].h) or 0
		local globalCharIndex = 0
		local glyphIndex = 0
		for lineIndex, line in ipairs(layout) do
			local lineScreenX = textScreenX + line.x
			local lineScreenY = textScreenY + line.y
			local cursor = 0
			local prev = nil
			local lineText = line.text
			for ci = 1, #lineText do
				local cp = lineText:byte(ci)
				local g = font.glyphByCodepoint[cp]
				local advance = Font_advance_(font, cp, prev) * scaleX
				local glyphX = lineScreenX + cursor + ((g and g.offsetX) or 0) * scaleX
				local glyphY = lineScreenY + ((g and g.offsetY) or 0) * scaleY
				local glyphW = (g and g.atlasWidth or font.defaultAdvanceX) * scaleX
				local glyphH = (g and g.atlasHeight or line.h) * scaleY
				local visible = glyphX + glyphW > clipX0 and glyphX < clipX1
				if visible or opts.includeInvisibleGlyphs == true then
					fn({
						codepoint = cp,
						char = string.char(cp),
						glyphIndex = glyphIndex,
						charIndex = globalCharIndex + ci - 1,
						lineIndex = lineIndex - 1,
						lineCharIndex = ci - 1,
						x = lineScreenX + cursor,
						y = lineScreenY,
						visualX = glyphX,
						visualY = glyphY,
						visualWidth = glyphW,
						visualHeight = glyphH,
						advance = advance,
						scaleX = scaleX,
						scaleY = scaleY,
						clipX0 = clipX0,
						clipX1 = clipX1,
						textX = textScreenX,
						textY = textScreenY,
						textW = totalW,
						textH = totalH,
						lineY = lineScreenY,
						lineH = line.h,
						hasGlyph = g ~= nil,
					})
				end
				cursor = cursor + advance
				prev = cp
				glyphIndex = glyphIndex + 1
			end
			if opts.multiline ~= false then
				globalCharIndex = globalCharIndex + #lineText + 1
			end
		end
	end

	function Font_DrawGlyphClipped(font, codepoint, x, y, options)
		local opts = options or {}
		local scaleX = opts.scaleX or 1
		local scaleY = opts.scaleY or 1
		local g = font.glyphByCodepoint[codepoint]
		local gW = (g and g.atlasWidth or font.defaultAdvanceX) * scaleX
		local gH = (g and g.atlasHeight or font.lineHeight) * scaleY
		local drawX = opts.originIsGlyph == true and x or x + ((g and g.offsetX) or 0) * scaleX
		local drawY = opts.originIsGlyph == true and y or y + ((g and g.offsetY) or 0) * scaleY
		local textX = opts.textX or x
		local textY = opts.textY or y
		local textW = opts.textW or gW
		local textH = opts.textH or gH
		local lineY = opts.lineY or y
		local lineH = opts.lineH or gH
		local shadeFn = Font_buildShadeFn_(font, opts, textX, textY, textW, textH, lineY, lineH)
		if shadeFn then
			Font_drawGlyph_(
				font,
				codepoint,
				opts.originIsGlyph == true and drawX - ((g and g.offsetX) or 0) * scaleX or x,
				opts.originIsGlyph == true and drawY - ((g and g.offsetY) or 0) * scaleY or y,
				scaleX,
				scaleY,
				opts.clipX0 or gClipRectX0,
				opts.clipX1 or gClipRectX1,
				shadeFn
			)
		end
	end

	function Font_DrawGlyphAffineClipped(font, codepoint, x, y, options)
		local opts = options or {}
		local scaleX = opts.scaleX or 1
		local scaleY = opts.scaleY or 1
		if scaleX == 0 or scaleY == 0 then
			return
		end
		local g = font.glyphByCodepoint[codepoint]
		if g == nil or font.maskAtlas == nil then
			return
		end

		local drawX = opts.originIsGlyph == true and x or x + (g.offsetX or 0) * scaleX
		local drawY = opts.originIsGlyph == true and y or y + (g.offsetY or 0) * scaleY
		local destW = g.atlasWidth * scaleX
		local destH = g.atlasHeight * scaleY
		if destW == 0 or destH == 0 then
			return
		end

		local textX = opts.textX or x
		local textY = opts.textY or y
		local textW = opts.textW or destW
		local textH = opts.textH or destH
		local lineY = opts.lineY or y
		local lineH = opts.lineH or destH
		local shadeFn = Font_buildShadeFn_(font, opts, textX, textY, textW, textH, lineY, lineH)
		if shadeFn == nil then
			return
		end

		local affine = R_buildAffine2D(
			drawX,
			drawY,
			destW,
			destH,
			opts.anchorXNorm or 0,
			opts.anchorYNorm or 0,
			opts.angleDeg or 0,
			opts.skewX or 0,
			opts.skewY or 0
		)
		if affine == nil or affine.x1 <= affine.x0 or affine.y1 <= affine.y0 then
			return
		end

		local ma = font.maskAtlas
		local atlasW = ma.width
		local frags = ma.frags
		local invScaleX = 1 / scaleX
		local invScaleY = 1 / scaleY
		local clipLocalX0 = opts.clipLocalX0
		local clipLocalX1 = opts.clipLocalX1
		local glyphTextX = opts.glyphTextX or 0
		local W = 240
		local fb_m = gFrameBuffer_Material
		local fb_t = gFrameBuffer_Tone
		local fb_oid = gFrameBuffer_ObjectId
		local sourceObjectId = gCurrentObjectId

		for sy = affine.y0, affine.y1 - 1 do
			if sy >= gClipRectY0 and sy < gClipRectY1 then
				local rowBase = sy * W
				for sx = affine.x0, affine.x1 - 1 do
					if sx >= gClipRectX0 and sx < gClipRectX1 then
						local localX, localY = R_inverseAffine2D(affine, sx, sy)
						if localX >= 0 and localX < destW and localY >= 0 and localY < destH then
							local textLocalX = glyphTextX + localX
							if
								(clipLocalX0 == nil or textLocalX >= clipLocalX0)
								and (clipLocalX1 == nil or textLocalX < clipLocalX1)
							then
								local gx = (localX * invScaleX) // 1
								local gy = (localY * invScaleY) // 1
								if gx >= 0 and gx < g.atlasWidth and gy >= 0 and gy < g.atlasHeight then
									local fragIdx = (g.atlasY + gy) * atlasW + (g.atlasX + gx) + 1
									if frags[fragIdx] == 1 then
										local mat, tone = shadeFn((g.atlasY + gy) * atlasW + (g.atlasX + gx), sx, sy)
										if mat ~= nil then
											local linearIndex = rowBase + sx
											fb_m[linearIndex] = mat
											fb_t[linearIndex] = tone or 0
											fb_oid[linearIndex] = sourceObjectId
											R_outlineStampPixelForCurrentObject(sx, sy)
										end
									end
								end
							end
						end
					end
				end
			end
		end
	end
end

-- static resources / generated resources
-- generated by Boulette; do not edit by hand.
local gDemoProjectDef = {
	animation = {
		groups = {
			["grp_i3A-_G"] = {
				color = "#008d82",
				label = "grp_i3A-_G",
			},
		},
	},
	behaviors = {},
	editor = {
		sceneObjects = {
			obj_7aPaGe = {
				debugDisplay = {
					outline = true,
				},
			},
		},
	},
	fonts = {},
	lengthBeats = 98.0,
	materials = {
		circleRed = {
			color = "#f46",
			ditherAmount = 0.0,
			enabled = true,
			isStatic = false,
			name = "circle red",
			sortOrder = 5.0,
			type = "blackToWhiteBody",
		},
		f46 = {
			color = "#f46",
			enabled = true,
			isStatic = false,
			name = "red",
			sortOrder = 6.0,
			type = "blackToWhiteBody",
		},
		mat1455 = {
			color = "#112",
			enabled = true,
			isStatic = true,
			name = "black",
			sortOrder = 0.0,
			stops = {
				{
					color = "#000",
					t = 0.0,
				},
				{
					color = "#0652da",
					t = 0.1899999976158142,
				},
				{
					color = "#f2f5f4",
					t = 0.3930000066757202,
				},
				{
					color = "#1e0f24",
					t = 0.55,
				},
				{
					color = "#a91548",
					t = 0.8,
				},
				{
					color = "#f7cd65",
					t = 0.9,
				},
			},
			type = "flat",
		},
		mat_DSLrNP = {
			color = "#ffc800",
			ditherAmount = 1.0,
			enabled = true,
			isStatic = false,
			name = "one ball",
			sortOrder = 11.0,
			stops = {
				{
					color = "#241c00",
					t = 0.0,
				},
				{
					color = "#ffc800",
					t = 0.6759999990463257,
				},
				{
					color = "#fff7db",
					t = 1.0,
				},
			},
			type = "gradient",
		},
		mat_J3sJMi = {
			enabled = true,
			isStatic = false,
			name = "brown",
			sortOrder = 8.0,
			stops = {
				{
					color = "#130600",
					t = 0.0,
				},
				{
					color = "#4f3103",
					t = 0.27900001406669617,
				},
				{
					color = "#bfa783",
					t = 0.7009999752044678,
				},
				{
					color = "#fff",
					t = 1.0,
				},
			},
			type = "gradient",
		},
		mat__UjRzM = {
			ditherAmount = 1.0,
			enabled = true,
			isStatic = false,
			name = "atomic green",
			sortOrder = 9.0,
			stops = {
				{
					color = "#010",
					t = 0.0,
				},
				{
					color = "#77ce56",
					t = 0.6890000104904175,
				},
				{
					color = "#d5ffbf",
					t = 1.0,
				},
			},
			type = "gradient",
		},
		mat_bEVbEB = {
			enabled = true,
			isStatic = false,
			name = "chrome",
			sortOrder = 4.0,
			stops = {
				{
					color = "#000",
					t = 0.0,
				},
				{
					color = "#0652da",
					t = 0.1899999976158142,
				},
				{
					color = "#f2f5f4",
					t = 0.3930000066757202,
				},
				{
					color = "#1e0f24",
					t = 0.55,
				},
				{
					color = "#a91548",
					t = 0.8,
				},
				{
					color = "#f7cd65",
					t = 0.9,
				},
			},
			type = "gradient",
		},
		mat_lRtoQ3 = {
			enabled = true,
			isStatic = false,
			name = "font chrome",
			sortOrder = 3.0,
			stops = {
				{
					color = "#384c7e",
					t = 0.0,
				},
				{
					color = "#f2f5f4",
					t = 0.3930000066757202,
				},
				{
					color = "#1e0f24",
					t = 0.55,
				},
				{
					color = "#a91548",
					t = 0.7260000109672546,
				},
				{
					color = "#f7cd65",
					t = 1.0,
				},
			},
			type = "gradient",
		},
		mat_n0jYhE = {
			color = "#d7abab",
			enabled = true,
			isStatic = false,
			name = "white",
			sortOrder = 2.0,
			stops = {
				{
					color = "#000",
					t = 0.0,
				},
				{
					color = "#0652da",
					t = 0.1899999976158142,
				},
				{
					color = "#f2f5f4",
					t = 0.3930000066757202,
				},
				{
					color = "#1e0f24",
					t = 0.55,
				},
				{
					color = "#a91548",
					t = 0.8,
				},
				{
					color = "#f7cd65",
					t = 0.9,
				},
			},
			type = "flat",
		},
		mat_zjXgHh = {
			color = "#ffc800",
			ditherAmount = 1.0,
			enabled = true,
			isStatic = false,
			name = "cyan",
			sortOrder = 12.0,
			stops = {
				{
					color = "#00c0c0",
					t = 0.0,
				},
				{
					color = "#f0f0f0",
					t = 1.0,
				},
			},
			type = "gradient",
		},
		mms134 = {
			color = "#336",
			enabled = true,
			isStatic = true,
			name = "purple",
			sortOrder = 1.0,
			type = "flat",
		},
		xybz58 = {
			color = "#0029ff",
			ditherAmount = 1.0,
			enabled = true,
			isStatic = false,
			name = "blue",
			sortOrder = 7.0,
			type = "blackToWhiteBody",
		},
		zb4ff = {
			enabled = true,
			isStatic = false,
			name = "cute",
			sortOrder = 10.0,
			stops = {
				{
					color = "#200088",
					t = 0.0,
				},
				{
					color = "#6000cc",
					t = 0.2840000092983246,
				},
				{
					color = "#a0f",
					t = 0.666,
				},
				{
					color = "#fac",
					t = 1.0,
				},
			},
			type = "gradient",
		},
	},
	meshes = {
		msh_BikH4u = {
			name = "msh_BikH4u",
			notes = "",
			sortOrder = 0.0,
		},
	},
	passes = {
		["pas_-lZF74"] = {
			cameraId = "cam_Z6yNJ2",
			clearMaterialId = "mat1455",
			clearTone = 0.0,
			enabled = false,
			name = "rhs",
			notes = "",
			sceneId = "scn_qhpem0",
			sortOrder = 1.0,
			viewport = {
				position = {
					x = 120,
					y = 0,
				},
				size = {
					height = 136,
					width = 120,
				},
			},
		},
		px2845 = {
			cameraId = "xz8592cc",
			clearMaterialId = "mms134",
			clearTone = 0.139999995008111,
			enabled = true,
			name = "mainPass",
			notes = "",
			sceneId = "vxs245",
			sortOrder = 0.0,
			viewport = {
				position = {
					x = 0,
					y = 0,
				},
				size = {
					height = 136,
					width = 240,
				},
			},
		},
	},
	scenes = {
		scn_qhpem0 = {
			activeCameraId = "cam_Z6yNJ2",
			cameras = {
				cam_Z6yNJ2 = {
					farZ = 1000.0,
					fovDegrees = 55.0,
					kind = "perspective",
					name = "cam_Z6yNJ2",
					nearZ = 1.0,
					notes = "",
					rotX = 0.0,
					rotY = 0.0,
					rotZ = 0.0,
					sortOrder = 0.0,
					x = 0.0,
					y = 0.0,
					z = 0.0,
				},
			},
			environment = {
				ambient = 0.0,
				fog = {
					density = 0.005,
					startDistance = 0.0,
				},
				lightDirection = {
					x = 0.0,
					y = 1.0,
					z = 0.0,
				},
			},
			name = "rhs-scene",
			notes = "",
			objects = {
				obj_bZKVnY = {
					enabled = true,
					name = "obj_bZKVnY",
					notes = "",
					sortOrder = 0.0,
					type = "unknown",
				},
			},
			sortOrder = 1.0,
		},
		vxs245 = {
			activeCameraId = "xz8592cc",
			cameras = {
				xz8592cc = {
					farZ = 1000.0,
					fovDegrees = 45.0,
					kind = "ortho",
					name = "mainCamera",
					nearZ = 0.0,
					notes = "",
					rotX = 0.705,
					rotY = -0.615,
					rotZ = 0.0,
					sortOrder = 0.0,
					x = 185.634822,
					y = 186.82572,
					z = -61.220693,
				},
			},
			environment = {
				ambient = 0.0,
				fog = {
					density = 0.004,
					startDistance = 159.57165596529376,
				},
				lightDirection = {
					x = -0.4,
					y = 0.7,
					z = -1.0,
				},
			},
			name = "intro",
			notes = "",
			objects = {
				obj_N5QczH = {
					anchorXNorm = 0.5,
					anchorYNorm = 0.5,
					angleDeg = 0.0,
					enabled = true,
					fontId = "font1",
					height = 6.0,
					majorRadius = 1.0,
					majorSegments = 9.0,
					materialId = "mat_J3sJMi",
					maxWidth = 140.0,
					meshId = "m134sh",
					multiline = false,
					name = "clone src",
					notes = "",
					radius = 1.5,
					rotX = 0.0,
					rotY = 0.0,
					rotZ = 0.0,
					scale = 1.0,
					scaleX = 9.0,
					scaleY = 9.0,
					scaleZ = 9.0,
					scrollX = 3.447764314711094,
					shading = "flat",
					skewX = 0.0,
					skewY = 0.0,
					sortOrder = 0.0,
					subdivisions = 0.0,
					text = "1234CARL IS OK",
					textureId = "texture2",
					textureType = "texture",
					tone = 1.0,
					toneA = 1.0,
					toneB = 0.0,
					tubeRadius = 0.5,
					tubeSegments = 7.0,
					type = "geoSphere",
					width = 6.0,
					wireframe = false,
					x = 47.524741,
					y = 40.703164,
					z = 56.741324,
				},
				obj_PKvIKS = {
					anchorXNorm = 0.5,
					anchorYNorm = 0.5,
					angleDeg = 0.0,
					enabled = true,
					fontId = "font1",
					height = 6.0,
					majorRadius = 6.0,
					majorSegments = 13.0,
					materialId = "mat_n0jYhE",
					maxWidth = 140.0,
					meshId = "m134sh",
					multiline = false,
					name = "point",
					notes = "",
					radius = 1.5,
					rotX = 0.0,
					rotY = 0.0,
					rotZ = 0.0,
					scale = 1.0,
					scaleX = 12.0,
					scaleY = 12.0,
					scaleZ = 12.0,
					scrollX = 3.447764314711094,
					shading = "flat",
					skewX = 0.0,
					skewY = 0.0,
					sortOrder = 1.0,
					subdivisions = 1.0,
					text = "1234CARL IS OK",
					textureId = "texture2",
					textureType = "texture",
					tone = 1.0,
					toneA = 1.0,
					toneB = 0.0,
					tubeRadius = 4.0,
					tubeSegments = 9.0,
					type = "point3D",
					width = 6.0,
					wireframe = false,
					x = 38.36645,
					y = 41.101052,
					z = 78.022525,
				},
				["obj_U-l0PT"] = {
					anchorXNorm = 0.0,
					anchorYNorm = 0.0,
					angleDeg = 0.0,
					enabled = true,
					fontId = "fnt_zo_BQy",
					materialId = "mat_lRtoQ3",
					multiline = false,
					name = "text",
					notes = "",
					scaleX = 1.0,
					scaleY = 1.0,
					scrollX = 76.32051531039178,
					skewX = 0.0,
					skewY = 0.0,
					sortOrder = 3.0,
					text = "HELLO EVOKE HOW Y",
					textureType = "vgrad",
					toneA = 0.0,
					toneB = 1.0,
					type = "text2D",
					x = 0.0,
					y = 78.0,
				},
				obj_Z3_xmb = {
					anchorXNorm = 0.5,
					anchorYNorm = 0.5,
					angleDeg = 0.0,
					enabled = false,
					fontId = "font1",
					height = 6.0,
					majorRadius = 5.0,
					majorSegments = 13.0,
					materialId = "mat_J3sJMi",
					maxWidth = 140.0,
					meshId = "m134sh",
					multiline = false,
					name = "torus",
					notes = "",
					radius = 1.5,
					rotX = 0.0,
					rotY = 0.0,
					rotZ = 0.0,
					scale = 1.0,
					scaleX = 9.0,
					scaleY = 9.0,
					scaleZ = 9.0,
					scrollX = 3.447764314711094,
					shading = "flat",
					skewX = 0.0,
					skewY = 0.0,
					sortOrder = 2.0,
					subdivisions = 1.0,
					text = "1234CARL IS OK",
					textureId = "texture2",
					textureType = "texture",
					tone = 0.9700000006705523,
					toneA = 1.0,
					toneB = 0.0,
					tubeRadius = 4.0,
					tubeSegments = 9.0,
					type = "torus",
					width = 6.0,
					wireframe = false,
					x = 155.20749,
					y = 29.337434,
					z = 144.364167,
				},
			},
			sortOrder = 0.0,
		},
	},
	textures = {},
	tint = {
		amount = 0.0,
		blendMode = "multiply",
		color = "#414",
	},
	transport = {
		isMuted = true,
		isPlaying = false,
		loopModeEnabled = true,
		rowsPerBeat = 4.0,
		rowsPerPattern = 64.0,
		songBeatCount = 90.0,
		speed = 6.0,
		syncOffsetMillis = 0.0,
		tempo = 120.0,
	},
}

-- Include the Somatic song player and API, making it available as global functions.
-- Somatic v1.0.14 (b8bbcc8)
-- Generated on 2026-06-30T20:47:14.299Z

-- (begin Somatic playroutine)
do
	SOMATIC_MUSIC_DATA = {
		tempo = 150,
		speed = 6,
		rowsPerBeat = 4,
		rowsPerPattern = 64,
		so = '"!"],2!WrQ/"pYD?!X];D%1[n0&:bf5J.rOp',
		orows = "#!!,?8(BFL9",
		z = '!!#l=H!W`<%!&+NT4TN:t,QIlJ63.\'OdfTLL!.Y4R!#YtA!<<*R"90GC_#GY[!XD!D!WW3#s$Hd:"T\\Tt$]P/e!3cS)!<AcD!!!\'/!<E0#0E_=s?q8lq!!3VS!<<,("9&<$TI^\'C!YU1f!!&YprW*!AE$52_\'*/+6!&+NS!<>CL,QIl\\_12\\"!"/`J!5SU[!!3r;J-?G`$2sr*^q(ck!Z6Fl%fe3])5+hG,QIlI#!r.ds5>>pn9Y`J!0.-B&/:JBh#@?BN=l3k!!!QB134K:',
		rp = "#!'C5])#tNSNW>sWOoRKC490L)*rqN+L]ACrT)cJ):]Lk*8H;]lIK7du:B2O@CB0:rOoQO,Q2n8qBE/#4",
		cp = {},
	}
	SOMATIC_CUE_SHEET = {
		{ pi = 8, beat = 0, rows = 64, icon = "circle3", note = "mono" },
		{ pi = 9, beat = 16, rows = 64, icon = "circle3", note = "" },
		{ pi = 15, beat = 32, rows = 64, icon = "circle3", note = "harm" },
		{ pi = 16, beat = 48, rows = 64, icon = "circle3", note = "F - G - Db" },
		{ pi = 0, beat = 64, rows = 64, icon = "circle3", note = "mono" },
		{ pi = 1, beat = 80, rows = 64, icon = "circle3", note = "" },
		{ pi = 2, beat = 96, rows = 64, icon = "circle3", note = "harm" },
		{ pi = 3, beat = 112, rows = 64, icon = "circle3", note = "F - G - Db" },
		{ pi = 4, beat = 128, rows = 64, icon = "circle3", note = "mono" },
		{ pi = 5, beat = 144, rows = 64, icon = "circle3", note = "" },
		{ pi = 6, beat = 160, rows = 64, icon = "circle3", note = "harm" },
		{ pi = 7, beat = 176, rows = 64, icon = "circle3", note = "F - G - Db" },
		{ pi = 10, beat = 192, rows = 64, icon = "circle3", note = "mono" },
		{ pi = 11, beat = 208, rows = 64, icon = "circle3", note = "" },
		{ pi = 12, beat = 224, rows = 64, icon = "circle3", note = "harm" },
		{ pi = 13, beat = 240, rows = 64, icon = "circle3", note = "F - G - Db" },
		{ pi = 14, beat = 256, rows = 64, icon = "circle3", note = "mono" },
		{ pi = 17, beat = 272, rows = 64, icon = "circle3", note = "" },
		{ pi = 18, beat = 288, rows = 64, icon = "circle3", note = "harm" },
		{ pi = 19, beat = 304, rows = 64, icon = "circle3", note = "F - G - Db" },
		{ pi = 20, beat = 320, rows = 64, icon = "circle3", note = "mono" },
		{ pi = 21, beat = 336, rows = 64, icon = "circle3", note = "" },
		{ pi = 22, beat = 352, rows = 64, icon = "circle3", note = "harm" },
		{ pi = 23, beat = 368, rows = 64, icon = "circle3", note = "F - G - Db" },
	}
	local WAVE_BASE = 65508
	local SFX_BASE = 65764
	local PATTERNS_BASE = 69988
	local TRACKS_BASE = 81508
	local TEMP_BUFFER_A = 79460
	local TEMP_BUFFER_B = 80484
	local PATTERN_BUFFER_A = 77668
	local PATTERN_BUFFER_B = 78436
	local SOMATIC_SFX_CONFIG = 64112
	local MORPH_HEADER_BYTES = 1
	local MORPH_ENTRY_BYTES = 15
	local SOMATIC_EXTRA_SONG_HEADER_BYTES = 2
	local SOMATIC_PATTERN_ENTRY_BYTES = 97
	local function _bp_make_reader(base)
		local bytePos = 0
		local bitPos = 0
		local function _bp_align_byte()
			if bitPos ~= 0 then
				bitPos = 0
				bytePos = bytePos + 1
			end
		end
		local function _bp_read_bits(n)
			local v = 0
			local shift = 0
			while n > 0 do
				local b = peek(base + bytePos)
				local avail = 8 - bitPos
				local k = n < avail and n or avail
				local mask = (1 << k) - 1
				local part = b >> bitPos & mask
				v = v | part << shift
				bitPos = bitPos + k
				if bitPos >= 8 then
					bitPos = 0
					bytePos = bytePos + 1
				end
				shift = shift + k
				n = n - k
			end
			return v
		end
		local function _bp_read_sbits(n)
			local v = _bp_read_bits(n)
			local sign = 1 << n - 1
			if v & sign ~= 0 then
				v = v - (1 << n)
			end
			return v
		end
		return { align = _bp_align_byte, u = _bp_read_bits, i = _bp_read_sbits }
	end
	local function decode_MorphEntry(base)
		local r = _bp_make_reader(base)
		local out = {}
		out.a = r.u(8)
		out.b = r.u(2)
		out.c = r.u(4)
		out.d = r.u(4)
		out.e = r.u(16)
		out.f = r.u(5)
		out.g = r.u(5)
		out.h = r.u(12)
		out.i = r.u(1)
		out.j = r.u(8)
		out.k = r.u(12)
		out.l = r.i(6)
		out.m = r.u(2)
		out.n = r.u(2)
		out.o = r.u(8)
		out.p = r.u(12)
		out.q = r.i(6)
		out.r = r.u(2)
		return out
	end
	local function decode_SomaticPatternEntry(base)
		local r = _bp_make_reader(base)
		local out = {}
		out.v = r.u(8)
		do
			local cells = {}
			for i = 1, 64 do
				do
					local _tmp = {}
					_tmp.x = r.u(4)
					_tmp.y = r.u(8)
					cells[i] = _tmp
				end
			end
			out.w = cells
		end
		return out
	end
	local function decode_WaveformMorphGradient(base)
		local r = _bp_make_reader(base)
		local out = {}
		local _len_out = r.u(5)
		r.align()
		for i = 1, _len_out do
			do
				local _tmp = {}
				do
					local waveBytes = {}
					for i = 1, 16 do
						waveBytes[i] = r.u(8)
					end
					_tmp.s = waveBytes
				end
				_tmp.t = r.u(10)
				_tmp.u = r.i(6)
				out[i] = _tmp
			end
		end
		return out
	end
	local MOD_SRC_ENVELOPE = 0
	local MOD_SRC_LFO = 1
	local MOD_SRC_NONE = 2
	local WAVE_ENGINE_MORPH = 0
	local WAVE_ENGINE_NATIVE = 1
	local WAVE_ENGINE_PWM = 2
	local EFFECT_KIND_NONE = 0
	local EFFECT_KIND_WAVEFOLD = 1
	local EFFECT_KIND_HARDSYNC = 2
	local TRACK_BYTES_PER_TRACK = 51
	local PATTERN_BYTES_PER_PATTERN = 192
	local ROW_BYTES = 3
	local WAVE_BYTES_PER_WAVE = 16
	local WAVE_SAMPLES_PER_WAVE = 32
	local function decode_pattern_row(patternId1b, rowIndex)
		if patternId1b == nil or patternId1b == 0 then
			return 0, 0
		end
		local pat0b = patternId1b - 1
		local addr = PATTERNS_BASE + pat0b * PATTERN_BYTES_PER_PATTERN + rowIndex * ROW_BYTES
		local b0 = peek(addr)
		local b1 = peek(addr + 1)
		local b2 = peek(addr + 2)
		local noteNibble = b0 & 15
		local inst = b2 & 31 | (b1 >> 7 & 1) << 5
		return noteNibble, inst
	end
	local function decode_track_frame_patterns(trackIndex, frameIndex)
		local r = _bp_make_reader(TRACKS_BASE + trackIndex * TRACK_BYTES_PER_TRACK + frameIndex * 3)
		return r.u(6), r.u(6), r.u(6), r.u(6)
	end
	local function clamp(x, minVal, maxVal)
		return math.min(math.max(x, minVal), maxVal)
	end
	local function clamp01(x)
		return clamp(x, 0, 1)
	end
	local function clamp_nibble_round(v)
		return math.floor(clamp(v, 0, 15) + 0.5)
	end
	local function base85Plus1Decode(s, d)
		local miss = s:byte(1) - 33
		s = s:sub(2)
		local n = #s // 5 * 4 - miss
		local i = 1
		for o = 0, n - 1, 4 do
			local v = 0
			for j = i, i + 4 do
				v = v * 85 + s:byte(j) - 33
			end
			i = i + 5
			for k = 3, 0, -1 do
				if o + k < n then
					poke(d + o + k, v % 256)
				end
				v = v // 256
			end
		end
		return n
	end
	local function varint(base, si, srcLen)
		local x, f = 0, 1
		while true do
			local b = peek(base + si)
			si = si + 1
			x = x + b % 128 * f
			if b < 128 then
				return x, si
			end
			f = f * 128
		end
	end
	local function lzdm(src, srcLen, dst)
		local si, di = 0, 0
		while si < srcLen do
			local t = peek(src + si)
			si = si + 1
			if t == 0 then
				local l
				l, si = varint(src, si, srcLen)
				for j = 1, l do
					poke(dst + di, peek(src + si))
					si = si + 1
					di = di + 1
				end
			else
				local l, d
				l, si = varint(src, si, srcLen)
				d, si = varint(src, si, srcLen)
				for j = 1, l do
					poke(dst + di, peek(dst + di - d))
					di = di + 1
				end
			end
		end
		return di
	end
	local function apply_curveN11(t, curveS6)
		if t <= 0 then
			return 0
		end
		if t >= 1 then
			return 1
		end
		local k = curveS6 / 31
		k = clamp(k, -1, 1)
		if k == 0 then
			return t
		end
		local e = 2 ^ (4 * math.abs(k))
		return k > 0 and t ^ e or 1 - (1 - t) ^ e
	end
	local SFX_CHANNELS = 4
	local ch_sfx_id = { -1, -1, -1, -1 }
	local ch_sfx_ticks = { 0, 0, 0, 0 }
	local ch_effect_strength_scale_u8 = { 255, 255, 255, 255 }
	local ch_lowpass_strength_scale_u8 = { 255, 255, 255, 255 }
	local render_src_a = {}
	local render_src_b = {}
	local render_out = {}
	local lfo_ticks_by_sfx = {}
	local last_music_track = -2
	local last_music_frame = -1
	local last_music_row = -1
	local function wave_read_samples(waveIndex, outSamples)
		local r = _bp_make_reader(WAVE_BASE + waveIndex * WAVE_BYTES_PER_WAVE)
		for i = 0, WAVE_SAMPLES_PER_WAVE - 1 do
			outSamples[i] = r.u(4)
		end
	end
	local function wave_write_samples(waveIndex, samples)
		local base = WAVE_BASE + waveIndex * WAVE_BYTES_PER_WAVE
		local si = 0
		for i = 0, WAVE_BYTES_PER_WAVE - 1 do
			local s0 = clamp_nibble_round(samples[si])
			local s1 = clamp_nibble_round(samples[si + 1])
			poke(base + i, s1 << 4 | s0)
			si = si + 2
		end
	end
	local function wave_unpack_byte_to_samples(b, outSamples, si)
		outSamples[si] = b & 15
		outSamples[si + 1] = b >> 4 & 15
		return si + 2
	end
	local function calculate_mod_t(modSource, durationTicks, ticksPlayed, lfoTicks, lfoCycleTicks, fallbackT)
		if modSource == MOD_SRC_LFO then
			local cycle = lfoCycleTicks
			if cycle <= 0 then
				return 0
			end
			local phase01 = lfoTicks % cycle / cycle
			return (1 - math.cos(phase01 * math.pi * 2)) * 0.5
		end
		if durationTicks == nil or durationTicks <= 0 then
			return fallbackT or 0
		end
		return clamp01(ticksPlayed / durationTicks)
	end
	local function cfg_is_k_rate_processing(cfg)
		if not cfg then
			return false
		end
		local we = cfg.b
		if we == WAVE_ENGINE_MORPH then
			return true
		end
		if we == WAVE_ENGINE_PWM then
			return true
		end
		if cfg.i then
			return true
		end
		local effectKind = cfg.n
		if effectKind == EFFECT_KIND_WAVEFOLD and cfg.o > 0 then
			return true
		end
		if effectKind == EFFECT_KIND_HARDSYNC and cfg.o > 0 then
			return true
		end
		return false
	end
	local function apply_lowpass_effect_to_samples(samples, strength)
		local strength = strength * strength
		local n = WAVE_SAMPLES_PER_WAVE
		local alpha = 0.95 * strength
		local acc = 0
		for i = 0, n - 1 do
			acc = acc + samples[i]
		end
		local y = acc / n
		local function doPass(from, to, step)
			for i = from, to, step do
				local x = samples[i]
				y = y + alpha * (x - y)
				samples[i] = y
			end
		end
		doPass(0, n - 1, 1)
		doPass(n - 1, 0, -1)
	end
	local function apply_wavefold_effect_to_samples(samples, strength01)
		local gain = 1 + 20 * clamp01(strength01 or 0)
		if gain <= 1 then
			return
		end
		for i = 0, WAVE_SAMPLES_PER_WAVE - 1 do
			local x = (samples[i] / 7.5 - 1) * gain
			local y = 2 / math.pi * math.asin(math.sin(x))
			local out = (y + 1) * 7.5
			samples[i] = clamp_nibble_round(out, 0, 15)
		end
	end
	local hs_scratch = {}
	local function apply_hardsync_effect_to_samples(samples, multiplier)
		local m = multiplier or 1
		if m <= 1.001 then
			return
		end
		local N = WAVE_SAMPLES_PER_WAVE
		for i = 0, N - 1 do
			hs_scratch[i] = samples[i]
		end
		for i = 0, N - 1 do
			local u = i / N * m
			local k = math.floor(u)
			local frac = u - k
			local p = frac * N
			local idx0 = math.floor(p)
			local f = p - idx0
			local idx1 = (idx0 + 1) % N
			local s0 = hs_scratch[idx0]
			local s1 = hs_scratch[idx1]
			local v = s0 + (s1 - s0) * f
			samples[i] = v
		end
	end
	local initialized = false
	local currentSongOrder = 0
	local playingSongOrder0b = 0
	local lastPlayingFrame = -1
	local backBufferIsA = false
	local stopPlayingOnNextFrame = false
	local loopSongForeverEnabled = false
	local playbackMuted = false
	local PATTERN_BUFFER_BYTES = 192 * 4
	local bufferALocation = 77668
	local bufferBLocation = 78436
	local ROW_EPSILON = 1e-6
	local morphMap = {}
	local patternExtra = {}
	local function b85Plus1LZDecodeToMem(s, dst)
		return lzdm(79460, base85Plus1Decode(s, 79460), dst)
	end
	local morphIds = {}
	local morph_nodes_cache = {}
	local MORPH_GRADIENT_BASE = 80484
	local function morph_get_nodes(offBytes)
		if offBytes == nil or offBytes <= 0 then
			return nil
		end
		local cached = morph_nodes_cache[offBytes]
		if cached ~= nil then
			return cached or nil
		end
		local nodes = decode_WaveformMorphGradient(MORPH_GRADIENT_BASE + offBytes)
		if nodes == nil or #nodes == 0 then
			morph_nodes_cache[offBytes] = false
			return nil
		end
		for ni = 1, #nodes do
			local wb = nodes[ni].s
			local s = {}
			local si = 0
			for bi = 1, 16 do
				si = wave_unpack_byte_to_samples(wb[bi] or 0, s, si)
			end
			nodes[ni].aa = s
		end
		morph_nodes_cache[offBytes] = nodes
		return nodes
	end
	local function render_waveform_morph(cfg, ticksPlayed, outSamples)
		local nodes = cfg.ab
		local n = #nodes
		if nodes == nil or n == 0 then
			return false
		end
		if n == 1 then
			local s = nodes[1].aa
			for i = 0, WAVE_SAMPLES_PER_WAVE - 1 do
				outSamples[i] = s[i]
			end
			return true
		end
		local tRemaining = ticksPlayed
		local seg = n - 1
		local localT = 1
		for i = 1, n - 1 do
			local dur = nodes[i].t
			if dur > 0 then
				if tRemaining < dur then
					seg = i
					localT = tRemaining / dur
					break
				end
				tRemaining = tRemaining - dur
			end
		end
		local shapedT = apply_curveN11(localT, nodes[seg].u)
		local a = nodes[seg].aa
		local b = nodes[seg + 1].aa
		for i = 0, WAVE_SAMPLES_PER_WAVE - 1 do
			outSamples[i] = a[i] + (b[i] - a[i]) * shapedT
		end
		return true
	end
	local function render_waveform_pwm(cfg, ticksPlayed, outSamples, lfoTicks)
		local cycle = cfg.h
		local phase = 0
		if cycle > 0 then
			phase = lfoTicks % cycle / cycle
		end
		local tri
		if phase < 0.5 then
			tri = phase * 4 - 1
		else
			tri = 3 - phase * 4
		end
		local duty = cfg.f + cfg.g * tri
		duty = clamp(duty, 1, 30)
		local threshold = duty / 31 * WAVE_SAMPLES_PER_WAVE
		for i = 0, WAVE_SAMPLES_PER_WAVE - 1 do
			outSamples[i] = i < threshold and 15 or 0
		end
		return true
	end
	local function render_waveform_native(cfg, outSamples)
		wave_read_samples(cfg.c, outSamples)
		return true
	end
	local function render_waveform_samples(cfg, ticksPlayed, outSamples, lfoTicks)
		local we = cfg.b
		if we == WAVE_ENGINE_MORPH then
			return render_waveform_morph(cfg, ticksPlayed, outSamples)
		end
		if we == WAVE_ENGINE_PWM then
			return render_waveform_pwm(cfg, ticksPlayed, outSamples, lfoTicks)
		end
		if we == WAVE_ENGINE_NATIVE then
			return render_waveform_native(cfg, outSamples)
		end
		return false
	end
	local function render_tick_cfg(cfg, instId, ticksPlayed, lfoTicks, effectStrengthScaleU8, lowpassStrengthScaleU8)
		if not cfg_is_k_rate_processing(cfg) then
			return
		end
		if not render_waveform_samples(cfg, ticksPlayed, render_out, lfoTicks) then
			return
		end
		local scale01 = clamp01(effectStrengthScaleU8 / 255)
		local lpScale01 = clamp01((lowpassStrengthScaleU8 or 255) / 255)
		local baseLpAmount01 = clamp01((cfg.j or 0) / 255)
		local lpAmount01 = baseLpAmount01 * lpScale01
		local effectKind = cfg.n or EFFECT_KIND_NONE
		if effectKind == EFFECT_KIND_HARDSYNC and cfg.o > 0 and scale01 > 0 then
			local hsT = 0
			if cfg.r ~= MOD_SRC_NONE then
				hsT = calculate_mod_t(cfg.r, cfg.p, ticksPlayed, lfoTicks, cfg.h, 0)
			end
			local env = 1 - apply_curveN11(hsT, cfg.q)
			local multiplier = 1 + cfg.o / 255 * scale01 * 7 * env
			apply_hardsync_effect_to_samples(render_out, multiplier)
		end
		local effectModSource = cfg.r
		local wavefoldHasTime = effectModSource == MOD_SRC_NONE
			or effectModSource == MOD_SRC_LFO and cfg.h > 0
			or cfg.p > 0
		if effectKind == EFFECT_KIND_WAVEFOLD and cfg.o > 0 and wavefoldHasTime and scale01 > 0 then
			local maxAmt = clamp01(cfg.o / 255) * scale01
			local wfT = 0
			if effectModSource ~= MOD_SRC_NONE then
				wfT = calculate_mod_t(effectModSource, cfg.p, ticksPlayed, lfoTicks, cfg.h, 0)
			end
			local envShaped = 1 - apply_curveN11(wfT, cfg.q)
			local strength = maxAmt * envShaped
			apply_wavefold_effect_to_samples(render_out, strength)
		end
		if cfg.i then
			local t
			if cfg.m == MOD_SRC_NONE then
				t = 1
			else
				t = calculate_mod_t(cfg.m, cfg.k, ticksPlayed, lfoTicks, cfg.h, 1)
			end
			local amountAtTime01 = lpAmount01 * clamp01(t)
			amountAtTime01 = apply_curveN11(amountAtTime01, cfg.l)
			local openness01 = 1 - amountAtTime01
			apply_lowpass_effect_to_samples(render_out, openness01)
		end
		wave_write_samples(cfg.d, render_out)
	end
	local function prime_render_slot_for_note_on(instId, ch)
		local cfg = morphMap and morphMap[instId]
		if cfg_is_k_rate_processing(cfg) then
			local lt = lfo_ticks_by_sfx[instId] or 0
			local scaleU8 = ch_effect_strength_scale_u8[ch + 1] or 255
			local lpScaleU8 = ch_lowpass_strength_scale_u8[ch + 1] or 255
			render_tick_cfg(cfg, instId, 0, lt, scaleU8, lpScaleU8)
		end
	end
	local function getColumnIndex(songPosition0b, ch)
		return SOMATIC_MUSIC_DATA.ac[songPosition0b * 4 + ch + 1]
	end
	local function apply_music_row_to_sfx_state(track, frame, row)
		if track == last_music_track and frame == last_music_frame and row == last_music_row then
			return
		end
		last_music_track = track
		last_music_frame = frame
		last_music_row = row
		local playingSongOrder = playingSongOrder0b
		local p0, p1, p2, p3 = decode_track_frame_patterns(track, frame)
		local patterns = { p0, p1, p2, p3 }
		for ch = 0, SFX_CHANNELS - 1 do
			local columnIndex0b = getColumnIndex(playingSongOrder, ch)
			local cells = columnIndex0b ~= nil and patternExtra[columnIndex0b] or nil
			local cell = cells and cells[row + 1] or nil
			if cell and cell.x == 1 then
				ch_effect_strength_scale_u8[ch + 1] = cell.y or 255
			elseif cell and cell.x == 3 then
				ch_lowpass_strength_scale_u8[ch + 1] = cell.y or 255
			elseif cell and cell.x == 2 then
				local instId = ch_sfx_id[ch + 1]
				if instId and instId >= 0 then
					local cfg = morphMap and morphMap[instId]
					local cycle = cfg and cfg.h or 0
					if cycle > 0 then
						lfo_ticks_by_sfx[instId] = math.floor((cell.y or 0) / 255 * cycle)
					end
				end
			end
			local patternId1b = patterns[ch + 1]
			local noteNibble, inst = decode_pattern_row(patternId1b, row)
			if noteNibble == 0 then
			elseif noteNibble < 4 then
				ch_sfx_id[ch + 1] = -1
				ch_sfx_ticks[ch + 1] = 0
			else
				ch_sfx_id[ch + 1] = inst
				ch_sfx_ticks[ch + 1] = 0
				prime_render_slot_for_note_on(inst, ch)
			end
		end
	end
	local function sfx_tick_channel(ch)
		local instId = ch_sfx_id[ch + 1]
		if instId == -1 then
			return
		end
		local ticksPlayed = ch_sfx_ticks[ch + 1]
		local cfg = morphMap and morphMap[instId]
		if cfg_is_k_rate_processing(cfg) then
			local lt = lfo_ticks_by_sfx[instId] or 0
			local scaleU8 = ch_effect_strength_scale_u8[ch + 1] or 255
			local lpScaleU8 = ch_lowpass_strength_scale_u8[ch + 1] or 255
			render_tick_cfg(cfg, instId, ticksPlayed, lt, scaleU8, lpScaleU8)
		end
		ch_sfx_ticks[ch + 1] = ticksPlayed + 1
	end
	local function somatic_sfx_tick(track, frame, row)
		apply_music_row_to_sfx_state(track, frame, row)
		for i = 1, #morphIds do
			local id = morphIds[i]
			lfo_ticks_by_sfx[id] = (lfo_ticks_by_sfx[id] or 0) + 1
		end
		for ch = 0, SFX_CHANNELS - 1 do
			sfx_tick_channel(ch)
		end
	end
	local function decode_extra_song_data()
		local m = SOMATIC_MUSIC_DATA.z
		if not m then
			return
		end
		morphMap = {}
		patternExtra = {}
		morphIds = {}
		morph_nodes_cache = {}
		b85Plus1LZDecodeToMem(m, 80484)
		local instrumentCount = peek(80484)
		local patternCount = peek(80484 + 1)
		local off = 80484 + SOMATIC_EXTRA_SONG_HEADER_BYTES
		for _ = 1, instrumentCount do
			local entry = decode_MorphEntry(off)
			local id = entry.a
			entry.i = entry.i ~= 0
			if entry.b == WAVE_ENGINE_MORPH then
				entry.ab = morph_get_nodes(entry.e or 0)
			end
			morphMap[id] = entry
			morphIds[#morphIds + 1] = id
			off = off + MORPH_ENTRY_BYTES
		end
		for _ = 1, patternCount do
			local entry = decode_SomaticPatternEntry(off)
			patternExtra[entry.v] = entry.w
			off = off + SOMATIC_PATTERN_ENTRY_BYTES
		end
	end
	decode_extra_song_data()
	local function song_order_count()
		return #SOMATIC_MUSIC_DATA.ac / 4
	end
	local function song_order_row_count(songPosition0b)
		local rows = SOMATIC_MUSIC_DATA.orderRows and SOMATIC_MUSIC_DATA.orderRows[songPosition0b + 1] or nil
		if rows == nil or rows <= 0 then
			return SOMATIC_MUSIC_DATA.rowsPerPattern
		end
		return clamp(rows, 1, SOMATIC_MUSIC_DATA.rowsPerPattern)
	end
	local function song_row_count()
		local total = 0
		for i = 0, song_order_count() - 1 do
			total = total + song_order_row_count(i)
		end
		return total
	end
	local function song_position_to_abs_row(songPosition, row)
		local safeSongPosition = clamp(songPosition or 0, 0, math.max(0, song_order_count() - 1))
		local absRow = 0
		for i = 0, safeSongPosition - 1 do
			absRow = absRow + song_order_row_count(i)
		end
		return absRow + clamp(row or 0, 0, math.max(0, song_order_row_count(safeSongPosition) - 1))
	end
	local function decodeBits(blob, bits)
		local n = b85Plus1LZDecodeToMem(blob, 80484)
		local r = _bp_make_reader(80484)
		local out = {}
		local count = n * 8 // bits
		for i = 1, count do
			out[i] = r.u(bits)
		end
		return out
	end
	SOMATIC_MUSIC_DATA.rpd = decodeBits(SOMATIC_MUSIC_DATA.rp, 16)
	SOMATIC_MUSIC_DATA.ac = decodeBits(SOMATIC_MUSIC_DATA.so, 8)
	SOMATIC_MUSIC_DATA.orderRows = decodeBits(SOMATIC_MUSIC_DATA.orows, 8)
	local function blit_pattern_column(columnIndex0b, destPointer)
		local rp = SOMATIC_MUSIC_DATA.rpd
		local ramPatternCount = #rp / 2
		if columnIndex0b < ramPatternCount then
			lzdm(PATTERNS_BASE + rp[columnIndex0b * 2 + 1], rp[columnIndex0b * 2 + 2], destPointer)
			return
		end
		local entry = SOMATIC_MUSIC_DATA.cp[columnIndex0b + 1 - ramPatternCount]
		b85Plus1LZDecodeToMem(entry, destPointer)
	end
	local function swapInPlayorder(songPosition0b, destPointer)
		for ch = 0, 3 do
			local columnIndex0b = getColumnIndex(songPosition0b, ch)
			local dst = destPointer + ch * PATTERN_BYTES_PER_PATTERN
			blit_pattern_column(columnIndex0b, dst)
		end
	end
	local function patch_pattern_end_jump(songPosition0b, destPointer, playingFrame)
		local rowCount = song_order_row_count(songPosition0b)
		if rowCount >= SOMATIC_MUSIC_DATA.rowsPerPattern then
			return
		end
		local row = rowCount - 1
		local chosenCh = 0
		for ch = 0, 3 do
			local addr = destPointer + ch * PATTERN_BYTES_PER_PATTERN + row * ROW_BYTES
			local command = peek(addr + 1) >> 4 & 7
			if command == 0 then
				chosenCh = ch
				break
			end
		end
		local targetFrame = ((playingFrame or 0) + 1) % 16
		local addr = destPointer + chosenCh * PATTERN_BYTES_PER_PATTERN + row * ROW_BYTES
		poke(addr, (targetFrame & 15) << 4 | peek(addr) & 15)
		poke(addr + 1, peek(addr + 1) & 128 | 3 << 4)
	end
	local function clearPatternBuffer(destPointer)
		for i = 0, PATTERN_BUFFER_BYTES - 1 do
			poke(destPointer + i, 0)
		end
	end
	local function writeMutedPatternBuffer(destPointer)
		for i = 0, PATTERN_BUFFER_BYTES - 1, 3 do
			poke(destPointer + i, 1)
			poke(destPointer + i + 1, 0)
			poke(destPointer + i + 2, 0)
		end
	end
	local function clearAllPlaybackBuffers()
		writeMutedPatternBuffer(bufferALocation)
		writeMutedPatternBuffer(bufferBLocation)
	end
	local function stopAllVoices()
		for ch = 0, SFX_CHANNELS - 1 do
			sfx(-1, 0, 0, ch)
			ch_sfx_id[ch + 1] = -1
			ch_sfx_ticks[ch + 1] = 0
		end
	end
	local function queuePlaybackBuffer(songPosition0b, destPointer, playingFrame)
		if playbackMuted then
			writeMutedPatternBuffer(destPointer)
		else
			swapInPlayorder(songPosition0b, destPointer)
			patch_pattern_end_jump(songPosition0b, destPointer, playingFrame)
		end
	end
	local function rebuildPlaybackBuffers()
		local orderCount = song_order_count()
		local frontPointer = backBufferIsA and bufferBLocation or bufferALocation
		local backPointer = backBufferIsA and bufferALocation or bufferBLocation
		if orderCount == 0 then
			clearAllPlaybackBuffers()
			return
		end
		if playingSongOrder0b >= 0 and playingSongOrder0b < orderCount then
			queuePlaybackBuffer(playingSongOrder0b, frontPointer, math.max(0, lastPlayingFrame))
		else
			clearPatternBuffer(frontPointer)
		end
		local nextSongOrder = currentSongOrder
		if nextSongOrder >= orderCount then
			if loopSongForeverEnabled then
				nextSongOrder = 0
			else
				nextSongOrder = nil
			end
		end
		if nextSongOrder == nil then
			clearPatternBuffer(backPointer)
		else
			queuePlaybackBuffer(nextSongOrder, backPointer, (math.max(0, lastPlayingFrame) + 1) % 16)
		end
	end
	local function set_muted(muted)
		local newMuted = muted == true
		if playbackMuted == newMuted then
			return
		end
		playbackMuted = newMuted
		last_music_track = -2
		last_music_frame = -1
		last_music_row = -1
		if playbackMuted then
			clearAllPlaybackBuffers()
			stopAllVoices()
		else
			rebuildPlaybackBuffers()
		end
	end
	local function somatic_get_bpm(tempo, speed)
		return tempo * 6 / speed
	end
	local function somatic_resolve_timing_options(options)
		options = options or {}
		local tempo = options.tempo or SOMATIC_MUSIC_DATA.tempo
		local speed = options.speed or SOMATIC_MUSIC_DATA.speed
		local rowsPerBeat = SOMATIC_MUSIC_DATA.rowsPerBeat
		local rowsPerPattern = SOMATIC_MUSIC_DATA.rowsPerPattern
		if tempo <= 0 then
			error("SOMATIC_MUSIC_DATA.tempo must be > 0")
		end
		if speed <= 0 then
			error("SOMATIC_MUSIC_DATA.speed must be > 0")
		end
		if rowsPerBeat <= 0 then
			error("SOMATIC_MUSIC_DATA.rowsPerBeat must be > 0")
		end
		if rowsPerPattern <= 0 then
			error("SOMATIC_MUSIC_DATA.rowsPerPattern must be > 0")
		end
		return tempo, speed, rowsPerBeat, rowsPerPattern
	end
	local baseTempo, baseSpeed, baseRowsPerBeat, baseRowsPerPattern = somatic_resolve_timing_options()
	local baseSongPatternCount = song_order_count()
	local baseSongRowCount = song_row_count()
	local baseSongBeatCount = baseSongRowCount / baseRowsPerBeat
	local baseSongMillis = baseSongBeatCount * 6e4 / somatic_get_bpm(baseTempo, baseSpeed)
	local somatic_transport = {
		baseTempo = baseTempo,
		baseSpeed = baseSpeed,
		tempo = baseTempo,
		speed = baseSpeed,
		rowsPerBeat = baseRowsPerBeat,
		rowsPerPattern = baseRowsPerPattern,
		songPatternCount = baseSongPatternCount,
		songRowCount = baseSongRowCount,
		songBeatCount = baseSongBeatCount,
		songMillis = baseSongMillis,
		isPlaying = true,
		playbackRate = 1,
		syncOffsetMS = 0,
		pendingAudioAbsRow = nil,
		prevWallMillis = time(),
		projectedTime = {},
		time = {
			tempo = baseTempo,
			speed = baseSpeed,
			rowsPerBeat = baseRowsPerBeat,
			rowsPerPattern = baseRowsPerPattern,
			songPatternCount = baseSongPatternCount,
			songRowCount = baseSongRowCount,
			songBeatCount = baseSongBeatCount,
			songMillis = baseSongMillis,
			isPlaying = true,
			isMuted = false,
			loopSongForever = false,
			didSeek = false,
			playbackRate = 1,
			syncOffsetMS = 0,
			wallFrame = 0,
			wallDeltaMillis = 0,
			wallMillis = 0,
			demoMillis = 0,
			demoDeltaMillis = 0,
			demoBeats = 0,
			demoDeltaBeats = 0,
			demoPatternIndex = 0,
			demoPatternRow = 0,
		},
	}
	local function somatic_get_millis_at_beat(beat)
		local bpm = somatic_get_bpm(somatic_transport.baseTempo, somatic_transport.baseSpeed)
		return beat * 6e4 / bpm
	end
	local somatic_abs_row_to_position
	local function somatic_derive_playback_rate()
		local baseBpm = somatic_get_bpm(somatic_transport.baseTempo, somatic_transport.baseSpeed)
		return somatic_get_bpm(somatic_transport.tempo, somatic_transport.speed) / baseBpm
	end
	local function somatic_write_position_fields(state)
		state = state or somatic_transport.time
		local row = state.demoBeats * somatic_transport.rowsPerBeat
		if row < 0 then
			row = 0
		end
		local songPosition, patternRow = somatic_abs_row_to_position(row // 1)
		state.demoPatternIndex = songPosition
		state.demoPatternRow = patternRow
	end
	local function somatic_write_settings_fields()
		local state = somatic_transport.time
		state.tempo = somatic_transport.tempo
		state.speed = somatic_transport.speed
		state.rowsPerBeat = somatic_transport.rowsPerBeat
		state.rowsPerPattern = somatic_transport.rowsPerPattern
		state.songPatternCount = somatic_transport.songPatternCount
		state.songRowCount = somatic_transport.songRowCount
		state.songBeatCount = somatic_transport.songBeatCount
		state.songMillis = somatic_transport.songMillis
		state.isPlaying = somatic_transport.isPlaying
		state.isMuted = playbackMuted
		state.loopSongForever = loopSongForeverEnabled
		state.playbackRate = somatic_transport.playbackRate
		state.syncOffsetMS = 0
	end
	local function somatic_sync_offset_ms(syncOffsetMS)
		if syncOffsetMS ~= nil then
			somatic_transport.syncOffsetMS = tonumber(syncOffsetMS) or 0
		end
		return somatic_transport.syncOffsetMS or 0
	end
	local function somatic_get_sync_offset_beats(syncOffsetMS)
		local offsetMS = somatic_sync_offset_ms(syncOffsetMS)
		if offsetMS == 0 then
			return 0
		end
		local bpm = somatic_get_bpm(somatic_transport.baseTempo, somatic_transport.baseSpeed)
		return offsetMS * somatic_transport.playbackRate * bpm / 6e4
	end
	function somatic_project_time(state, syncOffsetMS)
		local offsetMS = somatic_sync_offset_ms(syncOffsetMS)
		if offsetMS == 0 then
			state.syncOffsetMS = 0
			return state
		end
		local projected = somatic_transport.projectedTime
		for k in pairs(projected) do
			projected[k] = nil
		end
		for k, v in pairs(state) do
			projected[k] = v
		end
		local offsetDemoMillis = offsetMS * somatic_transport.playbackRate
		projected.rawDemoMillis = state.demoMillis
		projected.rawDemoBeats = state.demoBeats
		projected.syncOffsetMS = offsetMS
		projected.demoMillis = math.max(0, state.demoMillis + offsetDemoMillis)
		projected.demoBeats = math.max(0, state.demoBeats + somatic_get_sync_offset_beats())
		somatic_write_position_fields(projected)
		return projected
	end
	local function somatic_apply_options(options)
		options = options or {}
		if options.tempo ~= nil then
			if options.tempo <= 0 then
				error("somatic_set_options: tempo must be > 0")
			end
			somatic_transport.tempo = options.tempo
		end
		if options.speed ~= nil then
			if options.speed <= 0 then
				error("somatic_set_options: speed must be > 0")
			end
			somatic_transport.speed = options.speed
		end
		if options.rowsPerBeat ~= nil then
			error("somatic_set_options: rowsPerBeat is song metadata")
		end
		if options.isPlaying ~= nil then
			somatic_transport.isPlaying = options.isPlaying == true
		end
		if options.isMuted ~= nil then
			set_muted(options.isMuted == true)
		end
		if options.loopSongForever ~= nil then
			loopSongForeverEnabled = options.loopSongForever == true
		end
		somatic_transport.playbackRate = somatic_derive_playback_rate()
		somatic_transport.time.demoMillis = somatic_get_millis_at_beat(somatic_transport.time.demoBeats)
		somatic_write_settings_fields()
		somatic_write_position_fields()
	end
	local function somatic_set_time_from_position(songPosition, row)
		local absRow = song_position_to_abs_row(songPosition, row)
		local beat = absRow / somatic_transport.rowsPerBeat
		local state = somatic_transport.time
		state.demoBeats = beat
		state.demoMillis = somatic_get_millis_at_beat(beat)
		state.demoDeltaMillis = 0
		state.demoDeltaBeats = 0
		somatic_write_position_fields()
	end
	local function somatic_clamp_abs_row(absRow)
		local orderCount = song_order_count()
		if orderCount <= 0 then
			return 0, 0
		end
		local maxRow = song_row_count() - 1
		if absRow < 0 then
			absRow = 0
		end
		if absRow > maxRow then
			absRow = maxRow
		end
		return absRow, maxRow
	end
	function somatic_abs_row_to_position(absRow)
		local remaining = absRow // 1
		local orderCount = song_order_count()
		for songPosition = 0, orderCount - 1 do
			local rows = song_order_row_count(songPosition)
			if remaining < rows then
				return songPosition, remaining
			end
			remaining = remaining - rows
		end
		local lastPosition = math.max(0, orderCount - 1)
		return lastPosition, math.max(0, song_order_row_count(lastPosition) - 1)
	end
	local function somatic_normalize_beat(beat)
		local absRow = (beat or 0) * somatic_transport.rowsPerBeat
		absRow = somatic_clamp_abs_row(absRow)
		return absRow / somatic_transport.rowsPerBeat, absRow
	end
	local function somatic_is_integral_row(absRow)
		local floorRow = absRow // 1
		if absRow - floorRow <= ROW_EPSILON then
			return true, floorRow
		end
		if floorRow + 1 - absRow <= ROW_EPSILON then
			return true, floorRow + 1
		end
		return false, floorRow
	end
	local function somatic_beat_to_audio_position(beat)
		local normalizedBeat, absRow = somatic_normalize_beat(beat)
		local isIntegral, floorRow = somatic_is_integral_row(absRow)
		local audioAbsRow = floorRow
		local pendingAbsRow = nil
		if not isIntegral then
			audioAbsRow = floorRow + 1
			audioAbsRow = somatic_clamp_abs_row(audioAbsRow)
			pendingAbsRow = audioAbsRow
		end
		local songPosition, row = somatic_abs_row_to_position(audioAbsRow)
		return songPosition, row, normalizedBeat, absRow, pendingAbsRow
	end
	local function somatic_update_time(wallDeltaMillisOverride, forceDemoAdvance)
		local state = somatic_transport.time
		local wallDeltaMillis = wallDeltaMillisOverride
		if wallDeltaMillis == nil then
			local now = time()
			wallDeltaMillis = now - somatic_transport.prevWallMillis
			somatic_transport.prevWallMillis = now
		end
		if wallDeltaMillis < 0 then
			wallDeltaMillis = 0
		end
		state.wallFrame = state.wallFrame + 1
		state.wallDeltaMillis = wallDeltaMillis
		state.wallMillis = state.wallMillis + wallDeltaMillis
		state.didSeek = state.didSeek == true
		if somatic_transport.isPlaying or forceDemoAdvance == true then
			local demoDeltaMillis = wallDeltaMillis * somatic_transport.playbackRate
			local bpm = somatic_get_bpm(somatic_transport.baseTempo, somatic_transport.baseSpeed)
			local demoDeltaBeats = demoDeltaMillis * bpm / 6e4
			state.demoDeltaMillis = demoDeltaMillis
			state.demoMillis = state.demoMillis + demoDeltaMillis
			state.demoDeltaBeats = demoDeltaBeats
			state.demoBeats = state.demoBeats + demoDeltaBeats
		else
			state.demoDeltaMillis = 0
			state.demoDeltaBeats = 0
		end
		somatic_write_settings_fields()
		somatic_write_position_fields()
		return state
	end
	function somatic_get_raw_time()
		return somatic_transport.time
	end
	function somatic_get_time(syncOffsetMS)
		return somatic_project_time(somatic_transport.time, syncOffsetMS)
	end
	function somatic_end_frame()
		somatic_transport.time.didSeek = false
	end
	local function reset_music_state()
		currentSongOrder = 0
		playingSongOrder0b = 0
		lastPlayingFrame = -1
		backBufferIsA = false
		stopPlayingOnNextFrame = false
		ch_effect_strength_scale_u8 = { 255, 255, 255, 255 }
		ch_lowpass_strength_scale_u8 = { 255, 255, 255, 255 }
		lfo_ticks_by_sfx = {}
		if playbackMuted then
			clearAllPlaybackBuffers()
		end
	end
	reset_music_state()
	local function start_music_at_position(songPosition, startRow, preserveTime)
		somatic_transport.isPlaying = true
		somatic_transport.pendingAudioAbsRow = nil
		somatic_write_settings_fields()
		currentSongOrder = songPosition + 1
		playingSongOrder0b = songPosition
		backBufferIsA = false
		lastPlayingFrame = 0
		stopPlayingOnNextFrame = false
		if playbackMuted then
			clearAllPlaybackBuffers()
		else
			queuePlaybackBuffer(songPosition, bufferALocation, 0)
		end
		local orderCount = song_order_count()
		local nextSongOrder = currentSongOrder
		if orderCount == 0 then
			clearPatternBuffer(bufferBLocation)
			stopPlayingOnNextFrame = true
		elseif nextSongOrder >= orderCount then
			if loopSongForeverEnabled then
				nextSongOrder = 0
				currentSongOrder = 0
				queuePlaybackBuffer(nextSongOrder, bufferBLocation, 1)
			else
				clearPatternBuffer(bufferBLocation)
				stopPlayingOnNextFrame = true
			end
		else
			queuePlaybackBuffer(nextSongOrder, bufferBLocation, 1)
		end
		stopAllVoices()
		for i = 1, #morphIds do
			lfo_ticks_by_sfx[morphIds[i]] = 0
		end
		initialized = true
		if preserveTime ~= true then
			somatic_set_time_from_position(songPosition, startRow)
		end
		somatic_transport.prevWallMillis = time()
		if somatic_transport.isPlaying then
			music(0, 0, startRow, true, true, somatic_transport.tempo, somatic_transport.speed)
		end
	end
	local function stop_music(markPaused, preservePending)
		music()
		if markPaused ~= false then
			somatic_transport.isPlaying = false
		end
		if preservePending ~= true then
			somatic_transport.pendingAudioAbsRow = nil
		end
		somatic_write_settings_fields()
		reset_music_state()
	end
	local function pause_music_until_row(absRow)
		stop_music(false, true)
		stopAllVoices()
		somatic_transport.pendingAudioAbsRow = absRow
		initialized = true
		somatic_transport.prevWallMillis = time()
	end
	local function start_or_schedule_music_at_current_time()
		local songPosition, row, _, _, pendingAbsRow = somatic_beat_to_audio_position(somatic_transport.time.demoBeats)
		if pendingAbsRow == nil then
			start_music_at_position(songPosition, row, true)
		else
			pause_music_until_row(pendingAbsRow)
		end
	end
	local function maybe_start_pending_audio(state)
		local pendingAbsRow = somatic_transport.pendingAudioAbsRow
		if pendingAbsRow == nil then
			return false
		end
		local currentAbsRow = state.demoBeats * somatic_transport.rowsPerBeat
		if currentAbsRow + ROW_EPSILON < pendingAbsRow then
			return true
		end
		local songPosition, row = somatic_abs_row_to_position(pendingAbsRow)
		start_music_at_position(songPosition, row, true)
		return false
	end
	function somatic_seek(beat, syncOffsetMS)
		local _, _, normalizedBeat =
			somatic_beat_to_audio_position((beat or 0) - somatic_get_sync_offset_beats(syncOffsetMS))
		local state = somatic_transport.time
		state.demoBeats = normalizedBeat
		state.demoMillis = somatic_get_millis_at_beat(normalizedBeat)
		state.demoDeltaMillis = 0
		state.demoDeltaBeats = 0
		state.didSeek = true
		somatic_write_position_fields()
		if somatic_transport.isPlaying then
			start_or_schedule_music_at_current_time()
		else
			stop_music(false)
		end
		return somatic_project_time(state)
	end
	function somatic_set_options(options)
		options = options or {}
		somatic_sync_offset_ms(options.syncOffsetMS)
		local wasPlaying = somatic_transport.isPlaying
		local restartsMusic = wasPlaying and (options.tempo ~= nil or options.speed ~= nil)
		somatic_apply_options(options)
		if wasPlaying and not somatic_transport.isPlaying then
			stop_music(false)
		elseif not wasPlaying and somatic_transport.isPlaying or restartsMusic then
			start_or_schedule_music_at_current_time()
		end
		return somatic_project_time(somatic_transport.time)
	end
	function somatic_advance_frame()
		if somatic_transport.isPlaying then
			return somatic_project_time(somatic_transport.time)
		end
		return somatic_project_time(somatic_update_time(1e3 / 60, true))
	end
	local function read_tic_music_state()
		local track = peek(81916)
		local frame = peek(81917)
		local row = peek(81918)
		if track == 255 then
			track = -1
		end
		return track, playingSongOrder0b, frame, row
	end
	function somatic_tick(wallDeltaMillisOverride, syncOffsetMS)
		somatic_sync_offset_ms(syncOffsetMS)
		if not initialized and somatic_transport.isPlaying then
			start_or_schedule_music_at_current_time()
		end
		local state = somatic_update_time(wallDeltaMillisOverride, false)
		if not somatic_transport.isPlaying then
			return somatic_project_time(state)
		end
		if maybe_start_pending_audio(state) then
			return somatic_project_time(state)
		end
		local track, _, currentFrame, row = read_tic_music_state()
		if track == -1 then
			return somatic_project_time(state)
		end
		if currentFrame ~= lastPlayingFrame then
			if stopPlayingOnNextFrame then
				stop_music(true)
				return somatic_project_time(state)
			end
			backBufferIsA = not backBufferIsA
			lastPlayingFrame = currentFrame
			playingSongOrder0b = currentSongOrder
			currentSongOrder = currentSongOrder + 1
			local destPointer = backBufferIsA and bufferALocation or bufferBLocation
			local orderCount = song_order_count()
			local function clearNextBufferAndStop()
				clearPatternBuffer(destPointer)
				stopPlayingOnNextFrame = true
			end
			if orderCount == 0 then
				clearNextBufferAndStop()
			elseif currentSongOrder >= orderCount then
				if loopSongForeverEnabled then
					currentSongOrder = 0
					queuePlaybackBuffer(currentSongOrder, destPointer, (currentFrame + 1) % 16)
				else
					clearNextBufferAndStop()
				end
			else
				queuePlaybackBuffer(currentSongOrder, destPointer, (currentFrame + 1) % 16)
			end
		end
		somatic_sfx_tick(track, currentFrame, row)
		return somatic_project_time(state)
	end
end
-- (end Somatic playroutine)

-- When music is enabled, it serves as the transport source.
-- See https://github.com/thenfour/Somatic/ for its public API; currently:
--[[

somatic_tick(wallDeltaMillisOverride, syncOffsetMS) -- call once per TIC frame; returns external state
somatic_get_time(syncOffsetMS)                      -- read external state without advancing time
somatic_get_raw_time()                              -- read unprojected music transport state
somatic_project_time(state, syncOffsetMS)           -- project a raw state through an offset
somatic_seek(beat, syncOffsetMS)                    -- seek to external beat; audio seek is row-quantized
somatic_set_options(options)                        -- tempo/speed/isPlaying/isMuted/loopSongForever/syncOffsetMS
somatic_advance_frame()                             -- advance paused demo time by one 60Hz frame
somatic_end_frame()                                 -- for internal bookkeeping

And state includes:

state.tempo
state.speed
state.rowsPerBeat
state.rowsPerPattern
state.isPlaying
state.isMuted
state.loopSongForever
state.didSeek
state.playbackRate
state.syncOffsetMS

state.wallFrame
state.wallDeltaMillis
state.wallMillis

state.demoMillis
state.demoDeltaMillis
state.demoBeats
state.demoDeltaBeats
state.demoPatternIndex
state.demoPatternRow

state.songPatternCount
state.songRowCount
state.songBeatCount
state.songMillis

state.rawDemoMillis
state.rawDemoBeats

]]

-- Scene_* already understands meshes; this file is for demo mesh handling:
-- * loading from demo project
-- * eventually: hot loading/mutating functions that can be called remotely (global functions)

function Demo_AddMeshReferencedMaterialId(mesh, materialId)
	if (type(materialId) ~= "string" or materialId == "") or mesh.referencedMaterialIdSet[materialId] then
		return
	end
	mesh.referencedMaterialIdSet[materialId] = true
	mesh.referencedMaterialIds[#mesh.referencedMaterialIds + 1] = materialId
end

function Demo_AddMeshTextureMaterialRefs(mesh, texture)
	for _, materialId in ipairs(texture and texture.referencedMaterialIds or {}) do
		Demo_AddMeshReferencedMaterialId(mesh, materialId)
	end
end

function Demo_LoadMesh(meshDef, textureById)
	TFASSERT(type(meshDef) == "table", string.format("Expected meshDef to be a table, got %s", type(meshDef)))

	local mesh = {
		vertices = {},
		uvs = {},
		triangles = {},
		hasColor = meshDef.materialId ~= nil,
		materialId = meshDef.materialId,
		materialIndex = nil,
		tone = meshDef.tone ~= nil and meshDef.tone or 1,
		referencedMaterialIds = {},
		referencedMaterialIdSet = {},
	}
	Demo_AddMeshReferencedMaterialId(mesh, mesh.materialId)

	if meshDef.vertexFormat == "table:posXYZ,normalXYZ" or meshDef.vertexFormat == "table:posXYZ" then
		local hasNormals = meshDef.vertexFormat == "table:posXYZ,normalXYZ"
		local valuesPerVertex = hasNormals and 6 or 3
		local values = meshDef.vertices
		local vertexCount = #values // valuesPerVertex
		for vertexIndex = 1, vertexCount do
			local i = (vertexIndex - 1) * valuesPerVertex + 1
			mesh.vertices[vertexIndex] = {
				x = values[i],
				y = values[i + 1],
				z = values[i + 2],
				nx = hasNormals and values[i + 3] or nil,
				ny = hasNormals and values[i + 4] or nil,
				nz = hasNormals and values[i + 5] or nil,
			}
		end
	end

	if meshDef.uvFormat == "table:u,v" then
		local values = meshDef.uvs
		local uvCount = #values // 2
		for uvIndex = 1, uvCount do
			local i = (uvIndex - 1) * 2 + 1
			mesh.uvs[uvIndex] = {
				u = values[i],
				v = values[i + 1],
			}
		end
	end

	if
		meshDef.triangleFormat == "table:vertexIndex123,uvIndex123"
		or meshDef.triangleFormat == "table:vertexIndex123"
	then
		local hasUVs = meshDef.triangleFormat == "table:vertexIndex123,uvIndex123"
		local valuesPerTriangle = hasUVs and 6 or 3
		local values = meshDef.triangles
		local materialIds = meshDef.materialIds or {}
		local materialIdBySlot = {}
		for materialSlot = 1, #materialIds do
			materialIdBySlot[materialSlot] = materialIds[materialSlot]
		end
		local triangleColors = meshDef.triangleColors or {}
		local textureIds = meshDef.textureIds or {}
		local textureBySlot = {}
		for textureSlot = 1, #textureIds do
			textureBySlot[textureSlot] = textureById[textureIds[textureSlot]]
		end
		local triangleTextureSlots = meshDef.triangleTextureSlots or {}
		local triangleCount = #values // valuesPerTriangle
		for triangleIndex = 1, triangleCount do
			local i = (triangleIndex - 1) * valuesPerTriangle + 1
			local colorIndex = (triangleIndex - 1) * 2 + 1
			local materialSlot = triangleColors[colorIndex]
			local hasColor = materialSlot ~= nil
			local materialId = nil
			if materialSlot ~= nil then
				materialId = materialSlot > 0 and materialIdBySlot[materialSlot] or nil
				Demo_AddMeshReferencedMaterialId(mesh, materialId)
			end
			local textureSlot = triangleTextureSlots[triangleIndex]
			local texture = textureSlot ~= nil and textureSlot > 0 and textureBySlot[textureSlot] or nil
			Demo_AddMeshTextureMaterialRefs(mesh, texture)
			mesh.triangles[triangleIndex] = {
				values[i],
				values[i + 1],
				values[i + 2],
				nil,
				uv1 = hasUVs and values[i + 3] or nil,
				uv2 = hasUVs and values[i + 4] or nil,
				uv3 = hasUVs and values[i + 5] or nil,
				hasColor = hasColor,
				materialId = materialId,
				materialIndex = nil,
				tone = triangleColors[colorIndex + 1] ~= nil and triangleColors[colorIndex + 1] or 1,
				texture = texture,
			}
		end
	end

	local vertices = mesh.vertices
	if #vertices > 0 then
		local minX, minY, minZ = vertices[1].x, vertices[1].y, vertices[1].z
		local maxX, maxY, maxZ = minX, minY, minZ
		for vi = 2, #vertices do
			local v = vertices[vi]
			if v.x < minX then
				minX = v.x
			elseif v.x > maxX then
				maxX = v.x
			end
			if v.y < minY then
				minY = v.y
			elseif v.y > maxY then
				maxY = v.y
			end
			if v.z < minZ then
				minZ = v.z
			elseif v.z > maxZ then
				maxZ = v.z
			end
		end
		local cx = (minX + maxX) * 0.5
		local cy = (minY + maxY) * 0.5
		local cz = (minZ + maxZ) * 0.5
		local radiusSq = 0
		for vi = 1, #vertices do
			local v = vertices[vi]
			local dx, dy, dz = v.x - cx, v.y - cy, v.z - cz
			local dsq = dx * dx + dy * dy + dz * dz
			if dsq > radiusSq then
				radiusSq = dsq
			end
		end
		mesh.bounds = {
			min = { x = minX, y = minY, z = minZ },
			max = { x = maxX, y = maxY, z = maxZ },
			center = { x = cx, y = cy, z = cz },
			radius = sqrt(radiusSq),
		}
	end

	return mesh
end

function Demo_RemapMeshMaterials(mesh, materialIndexById, frameMaterialIndexStamp)
	if mesh == nil then
		return
	end
	if frameMaterialIndexStamp ~= nil and mesh._materialIndexStamp == frameMaterialIndexStamp then
		return
	end
	mesh._materialIndexStamp = frameMaterialIndexStamp
	mesh.materialIndex = mesh.materialId ~= nil and materialIndexById[mesh.materialId] or nil

	local triangles = mesh.triangles or {}
	for triangleIndex = 1, #triangles do
		local triangle = triangles[triangleIndex]
		local materialIndex = triangle.materialId ~= nil and materialIndexById[triangle.materialId] or nil
		triangle.materialIndex = materialIndex
		triangle[4] = materialIndex
		Demo_RemapTextureMaterials(triangle.texture, materialIndexById, frameMaterialIndexStamp)
	end
end

-- APIs / routines for the whole demo project payload.
-- * loading static payloads
-- * baking editor-friendly IDs into compact renderer data
-- * rendering the current project frame

gDemoHudLines = {}
gDemoHudPlots = {}

function DemoCustom_AddHudLine(line)
	-- don't trace per-frame; too spammy.
	--trace("DebugHud: " .. tostring(line))
	table.insert(gDemoHudLines, line)
end

-- an editor-friendly assert that doesn't crash but instead prints to the hud and trace
function DEMO_ASSERT(condition, message)
	if not condition then
		trace("DEMO_ASSERT!: " .. tostring(message))
		DemoCustom_AddHudLine("DA!:" .. tostring(message))
	end
end
-- note that SATISFIED **must** be used in an expression, otherwise it evaluates
-- as a naked (false). Then use DEMO_ASSERT or TFASSERT
function SATISFIED(condition, message)
	if not condition then
		trace("!: " .. tostring(message))
		DemoCustom_AddHudLine("!:" .. tostring(message))
	end
	return condition
end

--[[
local tbl = {
  x = 1,
  c = 2,
  a = 3,
}

local sortedIds = Demo_SortedIds(tbl)
-- sortedIds is now {"a", "c", "x"}

--]]
function Demo_SortedIds(tbl)
	local ids = {}
	TFASSERT(type(tbl) == "table", "expected table")
	for id, _ in pairs(tbl) do
		ids[#ids + 1] = id
	end
	table.sort(ids)
	return ids
end

-- appends id to ids if it's not already in seen
-- helper for building material set
function Demo_AppendUniqueId(ids, seen, id)
	TFASSERT(type(ids) == "table", "expected table")
	TFASSERT(type(seen) == "table", "expected table")
	if seen[id] then
		return
	end
	seen[id] = true
	ids[#ids + 1] = id
end

-- approaches current towards target by rateUp if target > current, or by
-- rateDown if target < current, using dt for time-based changes.
function ApproachValue(current, target, rateUp, rateDown, dt)
	target = target or 0
	if dt <= 0 then
		return target
	end
	current = current or 0
	local delta = target - current
	local rate = delta > 0 and rateUp or rateDown or 0
	if rate <= 0 then
		return target
	end
	local maxDelta = rate * dt
	if delta > maxDelta then
		return current + maxDelta
	end
	if delta < -maxDelta then
		return current - maxDelta
	end
	return target
end

function ApproachVector3(current, target, rateUp, rateDown, dt)
	return {
		x = ApproachValue(current.x, target.x, rateUp.x, rateDown.x, dt),
		y = ApproachValue(current.y, target.y, rateUp.y, rateDown.y, dt),
		z = ApproachValue(current.z, target.z, rateUp.z, rateDown.z, dt),
	}
end

function Demo_LoadMaterial(materialDef)
	local config = {
		ditherAmount = materialDef.ditherAmount ~= nil and materialDef.ditherAmount or 1,
	}

	if materialDef.type == "flat" then
		return Material_Flat(materialDef.color, config)
	end

	if materialDef.type == "blackToWhiteBody" then
		return Material_BlackToWhiteBody(materialDef.color, config)
	end

	if materialDef.type == "gradient" then
		local stops = {}
		local sourceStops = materialDef.stops
		for i = 1, #sourceStops do
			local stop = sourceStops[i]
			stops[i] = GradientStop(stop.t, stop.color)
		end
		return Material_Gradient(stops, config)
	end

	return Material_Flat("#f0f", config) -- magenta = error: unknown material type
end

function Demo_BlendMaterialTintColorMix(baseR, baseG, baseB, tint, amount)
	local br = SrgbByteToLinear(baseR)
	local bg = SrgbByteToLinear(baseG)
	local bb = SrgbByteToLinear(baseB)
	local bl, ba, bb2 = LinearRgbToOklab(br, bg, bb)
	local r, g, b =
		OklabToLinearRgb((bl + (tint.l - bl) * amount), (ba + (tint.a - ba) * amount), (bb2 + (tint.b - bb2) * amount))
	return LinearToSrgbByte(r), LinearToSrgbByte(g), LinearToSrgbByte(b)
end

function Demo_BlendMaterialTintColorLinear(baseR, baseG, baseB, tint, amount, blendMode)
	local br = SrgbByteToLinear(baseR)
	local bg = SrgbByteToLinear(baseG)
	local bb = SrgbByteToLinear(baseB)
	local r, g, b
	if blendMode == "multiply" then
		r = (br + ((br * tint.lr) - br) * amount)
		g = (bg + ((bg * tint.lg) - bg) * amount)
		b = (bb + ((bb * tint.lb) - bb) * amount)
	elseif blendMode == "screen" then
		r = (br + ((1 - (1 - br) * (1 - tint.lr)) - br) * amount)
		g = (bg + ((1 - (1 - bg) * (1 - tint.lg)) - bg) * amount)
		b = (bb + ((1 - (1 - bb) * (1 - tint.lb)) - bb) * amount)
	elseif blendMode == "add" or blendMode == "additive" then
		r = br + tint.lr * amount
		g = bg + tint.lg * amount
		b = bb + tint.lb * amount
	else
		--trace(string.format("tint color lin: %.3f, %.3f, %.3f", tint.lr, tint.lg, tint.lb))
		return Demo_BlendMaterialTintColorMix(baseR, baseG, baseB, tint, amount)
		-- r = LERP(br, tint.lr, amount)
		-- g = LERP(bg, tint.lg, amount)
		-- b = LERP(bb, tint.lb, amount)
	end
	return LinearToSrgbByte(r), LinearToSrgbByte(g), LinearToSrgbByte(b)
end

function Demo_PrepareMaterialTint(tint)
	local color = tint.color
	local lr = SrgbByteToLinear(color.r)
	local lg = SrgbByteToLinear(color.g)
	local lb = SrgbByteToLinear(color.b)
	--trace(string.format("tint color linear: %.3f, %.3f, %.3f", lr, lg, lb))
	local l, a, b = LinearRgbToOklab(lr, lg, lb)
	return {
		lr = lr,
		lg = lg,
		lb = lb,
		l = l,
		a = a,
		b = b,
	}
end

function Demo_LoadMaterialTintVariant(material, tint)
	if material == nil or material.lut == nil then
		return nil
	end

	local amount = ((tint.amount or 0) < 0 and 0 or ((tint.amount or 0) > 1 and 1 or (tint.amount or 0)))
	if amount <= 0 then
		return material
	end

	local blendMode = tint.blendMode or "mix"
	local preparedTint = Demo_PrepareMaterialTint(tint)
	local lookup = {}
	for i = 0, (128 - 1) do
		local rgb = material.lut[i]
		local r, g, b = Demo_BlendMaterialTintColorLinear(rgb[1], rgb[2], rgb[3], preparedTint, amount, blendMode)
		local ri = ((r + 0.5) // 1)
		local gi = ((g + 0.5) // 1)
		local bi = ((b + 0.5) // 1)
		lookup[i] = { ri, gi, bi, (ri << 16) | (gi << 8) | bi }
	end

	return {
		lut = lookup,
		ditherAmount = material.ditherAmount,
	}
end

function Demo_CalibrateProjectorByte(value, calibration)
	local blackLevel = (
		(calibration.blackLevel or 0) < 0 and 0
		or ((calibration.blackLevel or 0) > 255 and 255 or (calibration.blackLevel or 0))
	) / 255
	local whiteLevel = (
		(calibration.whiteLevel or 255) < 0 and 0
		or ((calibration.whiteLevel or 255) > 255 and 255 or (calibration.whiteLevel or 255))
	) / 255
	local gamma = max(0.01, calibration.gamma or 1)
	local v = (((value or 0) / 255) < 0 and 0 or (((value or 0) / 255) > 1 and 1 or ((value or 0) / 255)))
	-- The calibration card's gamma match is meant to be applied as the final
	-- display step, after creative tinting and material animation.
	v = v ^ (1 / gamma)
	-- If the projector hides low values or clips high values, remap authored
	-- brightness into the visible output range reported by the card.
	v = blackLevel + v * max(0, whiteLevel - blackLevel)
	return ((((v < 0 and 0 or (v > 1 and 1 or v)) * 255) + 0.5) // 1)
end

function Demo_LoadMaterialCalibrationVariant(material, calibration)
	if material == nil or material.lut == nil then
		return nil
	end

	local lookup = {}
	for i = 0, (128 - 1) do
		local rgb = material.lut[i]
		local r = Demo_CalibrateProjectorByte(rgb[1], calibration)
		local g = Demo_CalibrateProjectorByte(rgb[2], calibration)
		local b = Demo_CalibrateProjectorByte(rgb[3], calibration)
		lookup[i] = { r, g, b, (r << 16) | (g << 8) | b }
	end

	return {
		lut = lookup,
		ditherAmount = material.ditherAmount,
	}
end

-- creates a material set for the frame.
-- we don't care if the materials are actually used in the scene; just need to collect
-- which static materials are needed, and return a list of materials in the order expected,
-- plus static count.
-- Puts static materials first which is what runtime wants.
function Demo_BuildMaterialOrder(projectDef)
	local materialIds = {}
	local seen = {}
	local materials = projectDef.materials or {}

	-- Collect enabled static materials first.
	for _, materialId in ipairs(Demo_SortedIds(materials)) do
		local materialDef = materials[materialId]
		if materialDef.enabled ~= false and materialDef.isStatic then
			Demo_AppendUniqueId(materialIds, seen, materialId)
		end
	end

	local staticCount = #materialIds

	-- Then collect the remaining enabled materials.
	for _, materialId in ipairs(Demo_SortedIds(materials)) do
		local materialDef = materials[materialId]
		if materialDef.enabled ~= false and not materialDef.isStatic then
			Demo_AppendUniqueId(materialIds, seen, materialId)
		end
	end

	return materialIds, staticCount
end

function Demo_CopyMaterialIdRange(sourceIds, firstIndex, lastIndex)
	local ids = {}
	for i = firstIndex, lastIndex do
		ids[#ids + 1] = sourceIds[i]
	end
	return ids
end

-- load materials from static def to runtime def.
-- runtime def is more like,
--[[
{
	staticCount = 2,
	materials = {
		{
			Material_Flat("#112"),
		},
	    -- normally you use a helper function to generate mats manually
		{
			lut = { ... },
			ditherAmount = 0.5,
		}
	},
}
--]]
function Demo_LoadMaterials(projectDef)
	local materialIds, staticCount = Demo_BuildMaterialOrder(projectDef)
	local materials = {}
	local baseMaterials = {} -- animation wants base values.
	local materialIndexById = {}
	local baseMaterialById = {}
	local isStaticById = {}

	for materialIndex = 1, #materialIds do
		local materialId = materialIds[materialIndex]
		materialIndexById[materialId] = materialIndex
		materials[materialIndex] = Demo_LoadMaterial(projectDef.materials[materialId])
		baseMaterials[materialIndex] = materials[materialIndex]
		baseMaterialById[materialId] = materials[materialIndex]
		isStaticById[materialId] = materialIndex <= staticCount
	end

	return {
		materialIds = materialIds,
		staticMaterialIds = Demo_CopyMaterialIdRange(materialIds, 1, staticCount),
		dynamicMaterialIds = Demo_CopyMaterialIdRange(materialIds, staticCount + 1, #materialIds),
		staticCount = staticCount,
		materials = materials,
		baseMaterials = baseMaterials,
		baseMaterialById = baseMaterialById,
		isStaticById = isStaticById,
		materialIndexById = materialIndexById,
		defaultStaticMaterialId = materialIds[1],
	},
		materialIndexById
end

function Demo_AddFrameMaterialId(frameMaterialIds, frameMaterialIdSet, materialId)
	if (type(materialId) ~= "string" or materialId == "") or frameMaterialIdSet[materialId] then
		return
	end
	frameMaterialIdSet[materialId] = true
	frameMaterialIds[#frameMaterialIds + 1] = materialId
end

function Demo_BuildFrameMaterialConfig(materialCatalog, usedMaterialIdSet)
	local frameMaterialIds = {}
	local frameMaterialIdSet = {}

	for _, materialId in ipairs(materialCatalog.staticMaterialIds or {}) do
		if usedMaterialIdSet[materialId] then
			Demo_AddFrameMaterialId(frameMaterialIds, frameMaterialIdSet, materialId)
		end
	end
	local staticCount = #frameMaterialIds

	for _, materialId in ipairs(materialCatalog.dynamicMaterialIds or {}) do
		if usedMaterialIdSet[materialId] then
			Demo_AddFrameMaterialId(frameMaterialIds, frameMaterialIdSet, materialId)
		end
	end

	local materials = {}
	local baseMaterials = {}
	local materialIndexById = {}
	for materialIndex = 1, #frameMaterialIds do
		local materialId = frameMaterialIds[materialIndex]
		materialIndexById[materialId] = materialIndex
		local material = materialCatalog.baseMaterialById[materialId]
		materials[materialIndex] = material
		baseMaterials[materialIndex] = material
	end

	return {
		materialIds = frameMaterialIds,
		staticCount = staticCount,
		materials = materials,
		baseMaterials = baseMaterials,
		materialIndexById = materialIndexById,
	},
		materialIndexById
end

-- loading and working with demo texture.
-- concerned only with loading, preparing textures in the DEMO context.
-- for underlying texture rendering at the underlying "Scene_*" level, put that code
-- in tf/sceneTexture.lua.

local DEMO_TEXTURE_PACKED_IMAGE_FRAG_FORMAT = "string:materialSlot8b,mask1b,tone7b;lz;b85+1"

function Demo_AddTextureReferencedMaterialId(texture, materialId)
	if (type(materialId) ~= "string" or materialId == "") or texture.referencedMaterialIdSet[materialId] then
		return
	end
	texture.referencedMaterialIdSet[materialId] = true
	texture.referencedMaterialIds[#texture.referencedMaterialIds + 1] = materialId
end

function Demo_LoadTexture(textureDef)
	TFASSERT(type(textureDef) == "table", string.format("Expected textureDef to be a table, got %s", type(textureDef)))

	local hasImage = textureDef.fragFormat ~= nil or textureDef.frags ~= nil or textureDef.materialIds ~= nil
	local fragFormat = textureDef.fragFormat

	local texture = {
		width = textureDef.width,
		height = textureDef.height,
		hasImage = hasImage,
		mask = textureDef.mask ~= nil and Mask_DecodeBinaryMask(textureDef.mask) or nil,
		materialSlots = nil,
		materialIdBySlot = nil,
		materialIndexBySlot = nil,
		referencedMaterialIds = {},
		referencedMaterialIdSet = {},
		tones = hasImage and {} or nil,
	}

	if not hasImage then
		return texture
	end

	TFASSERT(
		fragFormat == DEMO_TEXTURE_PACKED_IMAGE_FRAG_FORMAT,
		string.format("Unsupported texture image fragFormat: %s", tostring(fragFormat))
	)

	texture.materialSlots = {}
	texture.materialIdBySlot = {}
	texture.materialIndexBySlot = {}

	local materialIds = textureDef.materialIds or {}
	for materialSlot = 1, #materialIds do
		texture.materialIdBySlot[materialSlot] = materialIds[materialSlot]
	end

	local compressed = {}
	Base85Plus1DecodeToTable(textureDef.frags or "!", compressed)
	local packed = {}
	LZDecodeTableToTable(compressed, packed)

	local pixelCount = texture.width * texture.height
	local packedIndex = 1
	for pixelIndex = 0, pixelCount - 1 do
		local materialSlot = packed[packedIndex] or 0
		local toneMask = packed[packedIndex + 1] or 0
		packedIndex = packedIndex + 2

		if toneMask >= 128 then
			if materialSlot > 0 then
				texture.materialSlots[pixelIndex] = materialSlot
				Demo_AddTextureReferencedMaterialId(texture, texture.materialIdBySlot[materialSlot])
			end
			texture.tones[pixelIndex] = (toneMask % 128) / 127
		else
			texture.tones[pixelIndex] = 0
		end
	end

	return texture
end

-- Create a per-pixel coverage sampler with texture-shape checks hoisted out of the hot path.
function Demo_CreateTextureCoverageProcedure(texture)
	TFASSERT(texture ~= nil, "texture is nil")

	local mask = texture.mask
	if mask ~= nil then
		local maskWidth = mask.width
		local maskHeight = mask.height
		local maskFrags = mask.frags
		TFASSERT(maskWidth ~= nil and maskWidth > 0, "texture mask width must be positive")
		TFASSERT(maskHeight ~= nil and maskHeight > 0, "texture mask height must be positive")
		TFASSERT(maskFrags ~= nil and #maskFrags >= maskWidth * maskHeight, "texture mask frags are incomplete")
		local maskMaxX = maskWidth - 1
		local maskMaxY = maskHeight - 1
		return function(u, v)
			local mx = (u * maskWidth) // 1
			if mx < 0 then
				mx = 0
			elseif mx > maskMaxX then
				mx = maskMaxX
			end
			local my = (v * maskHeight) // 1
			if my < 0 then
				my = 0
			elseif my > maskMaxY then
				my = maskMaxY
			end
			return maskFrags[my * maskWidth + mx + 1] == 1
		end
	end

	if texture.hasImage ~= true then
		return nil
	end

	local textureMaterialSlots = texture.materialSlots
	if textureMaterialSlots ~= nil then
		local textureWidth = texture.width
		local textureHeight = texture.height
		TFASSERT(textureWidth ~= nil and textureWidth > 0, "texture width must be positive")
		TFASSERT(textureHeight ~= nil and textureHeight > 0, "texture height must be positive")
		local textureMaxX = textureWidth - 1
		local textureMaxY = textureHeight - 1
		return function(u, v)
			local tx = (u * textureWidth) // 1
			if tx < 0 then
				tx = 0
			elseif tx > textureMaxX then
				tx = textureMaxX
			end
			local ty = (v * textureHeight) // 1
			if ty < 0 then
				ty = 0
			elseif ty > textureMaxY then
				ty = textureMaxY
			end
			return textureMaterialSlots[ty * textureWidth + tx] ~= nil
		end
	end

	return nil
end

function Demo_RemapTextureMaterials(texture, materialIndexById, frameMaterialIndexStamp)
	if texture == nil then
		return
	end
	if frameMaterialIndexStamp ~= nil and texture._materialIndexStamp == frameMaterialIndexStamp then
		return
	end
	texture._materialIndexStamp = frameMaterialIndexStamp

	if texture.materialIdBySlot ~= nil then
		local materialIdBySlot = texture.materialIdBySlot or {}
		local materialIndexBySlot = texture.materialIndexBySlot or {}
		texture.materialIndexBySlot = materialIndexBySlot
		for materialSlot = 1, #materialIdBySlot do
			local materialId = materialIdBySlot[materialSlot]
			materialIndexBySlot[materialSlot] = materialId ~= nil and materialIndexById[materialId] or nil
		end
		return
	end
end

function Demo_LoadTextures(projectDef)
	local textures = {}
	local textureDefs = projectDef.textures or {}
	for _, textureId in ipairs(Demo_SortedIds(textureDefs)) do
		textures[textureId] = Demo_LoadTexture(textureDefs[textureId])
	end
	return textures
end

-- Demo-level font loading.
-- Converts a project font def (from demoProjectDef.lua) into a runtime font table
-- ready for use by Font_* rendering APIs.
--
-- Runtime font table shape:
--   {
--     maskAtlas        = { width, height, frags },  -- decoded 0/1 per pixel; nil if not imported
--     displayAtlas     = textureObject or nil,       -- project texture resolved by displayTextureId
--     defaultAdvanceX  = number,
--     lineHeight       = number,
--     baseline         = number,
--     sortedCodepoints = { codepoint, ... },
--     glyphByCodepoint = { [codepoint] = { atlasX, atlasY, atlasWidth, atlasHeight,
--                                          advanceX, offsetX, offsetY } },
--     kerningBySecond  = { [second] = { [first] = amount } },
--   }

local DEMO_FONT_GLYPH_FORMAT =
	"string:codepoint32u,atlasX16u,atlasY16u,atlasWidth16u,atlasHeight16u,advanceQ12.4i16,offsetX16i,offsetY16i;lz;b85+1"
local DEMO_FONT_KERNING_FORMAT = "string:first32u,second32u,amount16i;lz;b85+1"
local DEMO_FONT_GLYPH_RECORD_BYTES = 18
local DEMO_FONT_KERNING_RECORD_BYTES = 10

local function Demo_FontDecodePayload(payload)
	local compressed = {}
	Base85Plus1DecodeToTable(payload or "!", compressed)
	local packed = {}
	LZDecodeTableToTable(compressed, packed)
	return packed
end

local function Demo_FontReadU16LE(bytes, index)
	return (bytes[index] or 0) + (bytes[index + 1] or 0) * 256
end

local function Demo_FontReadI16LE(bytes, index)
	local value = Demo_FontReadU16LE(bytes, index)
	if value >= 32768 then
		return value - 65536
	end
	return value
end

local function Demo_FontReadU32LE(bytes, index)
	return (bytes[index] or 0)
		+ (bytes[index + 1] or 0) * 256
		+ (bytes[index + 2] or 0) * 65536
		+ (bytes[index + 3] or 0) * 16777216
end

local function Demo_FontReadQ12_4I16LE(bytes, index)
	return Demo_FontReadI16LE(bytes, index) / 16
end

local function Demo_LoadFontGlyphs(fontDef)
	local glyphsPayload = fontDef.glyphs
	local glyphByCodepoint = {}
	local sortedCodepoints = {}
	if glyphsPayload == nil then
		return glyphByCodepoint, sortedCodepoints
	end

	TFASSERT(
		fontDef.glyphFormat == DEMO_FONT_GLYPH_FORMAT,
		string.format("Unsupported font glyphFormat: %s", tostring(fontDef.glyphFormat))
	)

	local packed = Demo_FontDecodePayload(glyphsPayload)
	TFASSERT(#packed % DEMO_FONT_GLYPH_RECORD_BYTES == 0, "Font glyph payload has incomplete records")

	for packedIndex = 1, #packed, DEMO_FONT_GLYPH_RECORD_BYTES do
		local codepoint = Demo_FontReadU32LE(packed, packedIndex)
		if glyphByCodepoint[codepoint] == nil then
			sortedCodepoints[#sortedCodepoints + 1] = codepoint
		end
		glyphByCodepoint[codepoint] = {
			atlasX = Demo_FontReadU16LE(packed, packedIndex + 4),
			atlasY = Demo_FontReadU16LE(packed, packedIndex + 6),
			atlasWidth = Demo_FontReadU16LE(packed, packedIndex + 8),
			atlasHeight = Demo_FontReadU16LE(packed, packedIndex + 10),
			advanceX = Demo_FontReadQ12_4I16LE(packed, packedIndex + 12),
			offsetX = Demo_FontReadI16LE(packed, packedIndex + 14),
			offsetY = Demo_FontReadI16LE(packed, packedIndex + 16),
		}
	end
	table.sort(sortedCodepoints)

	return glyphByCodepoint, sortedCodepoints
end

local function Demo_LoadFontKernings(fontDef)
	local kerningsPayload = fontDef.kernings
	local kerningBySecond = {}
	if kerningsPayload == nil then
		return kerningBySecond
	end

	TFASSERT(
		fontDef.kerningFormat == DEMO_FONT_KERNING_FORMAT,
		string.format("Unsupported font kerningFormat: %s", tostring(fontDef.kerningFormat))
	)

	local packed = Demo_FontDecodePayload(kerningsPayload)
	TFASSERT(#packed % DEMO_FONT_KERNING_RECORD_BYTES == 0, "Font kerning payload has incomplete records")

	for packedIndex = 1, #packed, DEMO_FONT_KERNING_RECORD_BYTES do
		local first = Demo_FontReadU32LE(packed, packedIndex)
		local second = Demo_FontReadU32LE(packed, packedIndex + 4)
		local amount = Demo_FontReadI16LE(packed, packedIndex + 8)
		local byFirst = kerningBySecond[second]
		if not byFirst then
			byFirst = {}
			kerningBySecond[second] = byFirst
		end
		byFirst[first] = amount
	end

	return kerningBySecond
end

local function Demo_LoadFont(fontDef, textureById)
	local metrics = fontDef.metrics or {}
	local defaultAdvX = metrics.defaultAdvanceX or 8
	local glyphByCodepoint, sortedCodepoints = Demo_LoadFontGlyphs(fontDef)

	return {
		maskAtlas = fontDef.maskAtlas and Mask_DecodeBinaryMask(fontDef.maskAtlas) or nil,
		displayAtlas = (textureById and fontDef.displayTextureId) and textureById[fontDef.displayTextureId] or nil,
		defaultAdvanceX = defaultAdvX,
		lineHeight = metrics.lineHeight or 8,
		baseline = metrics.baseline or 7,
		sortedCodepoints = sortedCodepoints,
		glyphByCodepoint = glyphByCodepoint,
		kerningBySecond = Demo_LoadFontKernings(fontDef),
	}
end

local function Demo_LoadFonts(projectDef, textureById)
	local fonts = {}
	local fontDefs = projectDef.fonts or {}
	for _, fontId in ipairs(Demo_SortedIds(fontDefs)) do
		fonts[fontId] = Demo_LoadFont(fontDefs[fontId], textureById)
	end
	return fonts
end

function Demo_LoadCamera(cameraDef)
	cameraDef = cameraDef or {}
	return {
		kind = cameraDef.kind or "perspective",
		x = cameraDef.x or 0,
		y = cameraDef.y or 0,
		z = cameraDef.z or 0,
		rotX = cameraDef.rotX or 0,
		rotY = cameraDef.rotY or 0,
		rotZ = cameraDef.rotZ or 0,
		fov = ((cameraDef.fovDegrees or 55) * (3.141592653589793 / 180)),
		nearZ = cameraDef.nearZ or 1,
		farZ = cameraDef.farZ or 1000,
		projectionOffset = SafeVec2(cameraDef.projectionOffset),
	}
end

function Demo_CloneCamera(camera)
	if camera == nil then
		return nil
	end
	return {
		id = camera.id,
		kind = camera.kind,
		x = camera.x,
		y = camera.y,
		z = camera.z,
		rotX = camera.rotX,
		rotY = camera.rotY,
		rotZ = camera.rotZ,
		fov = camera.fov,
		nearZ = camera.nearZ,
		farZ = camera.farZ,
		projectionOffset = SafeVec2(camera.projectionOffset),
	}
end

function Demo_ApplyPose3ToCamera(camera, pose)
	if pose == nil then
		return camera
	end

	camera.x = pose.posX or camera.x
	camera.y = pose.posY or camera.y
	camera.z = pose.posZ or camera.z
	camera.rotX = pose.rotXradians or camera.rotX
	camera.rotY = pose.rotYradians or camera.rotY
	camera.rotZ = pose.rotZradians or camera.rotZ
	return camera
end

function Demo_CameraLookAt(camera, target)
	if camera == nil or target == nil then
		return camera
	end

	local dx = (target.x or 0) - (camera.x or 0)
	local dy = (target.y or 0) - (camera.y or 0)
	local dz = (target.z or 0) - (camera.z or 0)
	local horizontal = sqrt(dx * dx + dz * dz)
	if horizontal <= 0.00001 and abs(dy) <= 0.00001 then
		return camera
	end

	camera.rotX = atan2(-dy, horizontal)
	camera.rotY = atan2(dx, dz)
	camera.rotZ = 0
	return camera
end

do
	-- normalize color lane values to sRGB byte tables: { r = 0..255, g = 0..255, b = 0..255 }.
	function Demo_NormalizeAnimationColor(value)
		if type(value) == "string" then
			local r, g, b = ParseColor(value)
			return { r = r, g = g, b = b }
		end

		if type(value) == "table" then
			local r = value.r or value[1] or 0
			local g = value.g or value[2] or 0
			local b = value.b or value[3] or 0
			if r <= 1 and g <= 1 and b <= 1 then
				r = r * 255
				g = g * 255
				b = b * 255
			end
			return {
				r = (r < 0 and 0 or (r > 255 and 255 or r)),
				g = (g < 0 and 0 or (g > 255 and 255 or g)),
				b = (b < 0 and 0 or (b > 255 and 255 or b)),
			}
		end

		return { r = 255, g = 0, b = 255 }
	end

	function Demo_NormalizeAnimationValue(dataType, value)
		if dataType == "color" then
			return Demo_NormalizeAnimationColor(value)
		end
		return value
	end

	function Demo_LoadAnimationKeyframes(laneDef, keyframeDefs)
		local keyframes = {}
		if keyframeDefs == nil then
			return keyframes
		end

		local dataType = laneDef.dataType or "float"
		for i = 1, #keyframeDefs do
			local keyframeDef = keyframeDefs[i]
			keyframes[#keyframes + 1] = {
				beat = keyframeDef.beat or 0,
				value = Demo_NormalizeAnimationValue(dataType, keyframeDef.value),
				interpToNext = keyframeDef.interpToNext,
				sourceOrder = i,
			}
		end

		table.sort(keyframes, function(a, b)
			if a.beat == b.beat then
				return (a.sourceOrder or 0) < (b.sourceOrder or 0)
			end
			return a.beat < b.beat
		end)
		return keyframes
	end

	function Demo_LoadAnimationTargets(lane, laneDef)
		local targets = {}
		local targetDefs = laneDef.targets or {}
		for _, targetId in ipairs(Demo_SortedIds(targetDefs)) do
			local targetDef = targetDefs[targetId]
			targets[#targets + 1] = {
				id = targetId,
				laneId = lane.id,
				lane = lane,
				nodeId = targetDef.nodeId,
				fieldId = targetDef.fieldId,
				discreteComponentValues = targetDef.discreteComponentValues,
				discreteAmountValues = targetDef.discreteAmountValues,
			}
		end
		return targets
	end

	function Demo_SortedAnimationIds(defs)
		local ids = Demo_SortedIds(defs)
		table.sort(ids, function(a, b)
			local defA = defs[a] or {}
			local defB = defs[b] or {}
			local sortA = defA.sortOrder or 0
			local sortB = defB.sortOrder or 0
			if sortA ~= sortB then
				return sortA < sortB
			end
			return a < b
		end)
		return ids
	end

	function Demo_AppendTargetToNodeFieldIndexEntry(animation, nodeId, fieldId, target)
		if (type(nodeId) ~= "string" or nodeId == "") or (type(fieldId) ~= "string" or fieldId == "") then
			return
		end

		local targetsByField = animation.targetsByNodeField[nodeId]
		if targetsByField == nil then
			targetsByField = {}
			animation.targetsByNodeField[nodeId] = targetsByField
		end
		if targetsByField[fieldId] == nil then
			targetsByField[fieldId] = {}
		end
		table.insert(targetsByField[fieldId], target)
	end

	-- adds the target to the node/field index.
	function Demo_IndexAnimationTarget(animation, target)
		Demo_AppendTargetToNodeFieldIndexEntry(animation, target.nodeId, target.fieldId, target)
	end

	-- load static anim def to runtime state.
	function Demo_LoadAnimation(animationDef)
		local animation = {
			def = animationDef or {},
			lanesById = {},
			laneIds = {},
			targetsByNodeField = {},
		}

		local groups = animation.def.groups or {}
		for _, groupId in ipairs(Demo_SortedAnimationIds(groups)) do
			local groupDef = groups[groupId]
			local lanes = groupDef.lanes or {}
			for _, laneId in ipairs(Demo_SortedAnimationIds(lanes)) do
				local laneDef = lanes[laneId]
				animation.laneIds[#animation.laneIds + 1] = laneId
				local lane = {
					id = laneId,
					groupId = groupId,
					def = laneDef,
					dataType = laneDef.dataType or "float",
					enabled = laneDef.enabled ~= false,
					interpolation = laneDef.interpolation or "linear",
				}
				lane.keyframes = Demo_LoadAnimationKeyframes(laneDef, laneDef.keyframes)
				lane.targets = Demo_LoadAnimationTargets(lane, laneDef)
				animation.lanesById[laneId] = lane

				for i = 1, #lane.targets do
					Demo_IndexAnimationTarget(animation, lane.targets[i])
				end
			end
		end

		return animation
	end

	-- the lane datatypes which are not continuous and must be stepped without interpolation.
	function Demo_IsAnimationStepType(dataType)
		return dataType == "bool"
			or dataType == "enum"
			or dataType == "int"
			or dataType == "objectId"
			or dataType == "objectPropertyRef"
			or dataType == "materialIdArray"
			or dataType == "trigger"
	end

	function Demo_CloneAnimationValue(value)
		if type(value) ~= "table" then
			-- string, number, bool, nil, ... immutable just return it.
			return value
		end

		-- table values require a copy.
		-- can't use table.move because it's not an array-like table.
		return CloneTable(value)
	end

	function Demo_NormalizeInterpolation(interpolation)
		if type(interpolation) == "table" then
			return {
				type = Demo_NormalizeInterpolation(interpolation.type).type,
				param = (
					(interpolation.param ~= nil and interpolation.param or 0.5) < 0 and 0
					or (
						(interpolation.param ~= nil and interpolation.param or 0.5) > 1 and 1
						or (interpolation.param ~= nil and interpolation.param or 0.5)
					)
				),
			}
		end

		local interpolationType = interpolation or "linear"
		if type(interpolationType) ~= "string" then
			interpolationType = "linear"
		end

		local normalized = string.lower(interpolationType)
		normalized = string.gsub(normalized, "%s+", "")
		normalized = string.gsub(normalized, "_", "")
		normalized = string.gsub(normalized, "-", "")
		if normalized == "easeout" then
			interpolationType = "easeOut"
		elseif normalized == "easeoutin" then
			interpolationType = "easeOutIn"
		elseif normalized == "easein" then
			interpolationType = "easeIn"
		elseif normalized == "easeinout" then
			interpolationType = "easeInOut"
		elseif normalized == "step" then
			interpolationType = "step"
		elseif normalized == "catmullrom" or normalized == "cubic" then
			interpolationType = "catmullRom"
		elseif normalized == "monotonecubic" or normalized == "monotone" then
			interpolationType = "monotoneCubic"
		else
			interpolationType = "linear"
		end

		return {
			type = interpolationType,
			param = 0.5,
		}
	end

	function Demo_GetAnimationInterpolationParam(interpolation)
		return (
			(interpolation.param ~= nil and interpolation.param or 0.5) < 0 and 0
			or (
				(interpolation.param ~= nil and interpolation.param or 0.5) > 1 and 1
				or (interpolation.param ~= nil and interpolation.param or 0.5)
			)
		)
	end

	function Demo_EvaluateEase(interpolation, amount)
		local u = (amount < 0 and 0 or (amount > 1 and 1 or amount))

		local param = Demo_GetAnimationInterpolationParam(interpolation)
		--local strength = LERP(1, 5, param)

		-- C++ ver:
		-- constexpr double maxStrength = 12.0;
		-- // 1.0 -> maxStrength, with more useful resolution near the gentle end.
		-- return std::pow(maxStrength, p);
		local strength = pow(12, param)

		local interpolationType = interpolation.type
		if interpolationType == "easeIn" then
			return pow(u, strength)
		end
		if interpolationType == "easeOut" then
			return 1 - pow(1 - u, strength)
		end
		if interpolationType == "easeInOut" then
			if u < 0.5 then
				return 0.5 * pow(u * 2, strength)
			end
			return 1 - 0.5 * pow((1 - u) * 2, strength)
		end
		if interpolationType == "easeOutIn" then
			if u < 0.5 then
				return 0.5 * (1 - pow(1 - u * 2, strength))
			end
			return 0.5 + 0.5 * pow((u - 0.5) * 2, strength)
		end
		return u
	end

	function Demo_NormalizeRadians(radians)
		local quotient = radians / 6.283185307179586
		local lower = quotient // 1
		local fraction = quotient - lower
		local nearest = lower
		if fraction > 0.5 or (fraction == 0.5 and lower % 2 ~= 0) then
			nearest = lower + 1
		elseif fraction < -0.5 or (fraction == -0.5 and lower % 2 ~= 0) then
			nearest = lower - 1
		end
		local normalized = radians - nearest * 6.283185307179586
		if abs(normalized) < 0.0000005 then
			return 0
		end
		return normalized
	end

	function Demo_UnwrapRadiansNear(reference, radians)
		return reference + Demo_NormalizeRadians(radians - reference)
	end

	function Demo_InterpolateRadians(a, b, amount)
		return Demo_NormalizeRadians((a + ((Demo_UnwrapRadiansNear(a, b)) - a) * amount))
	end

	function Demo_NormalizeAnimationPose3(value)
		value = value or {}
		return {
			rotXradians = value.rotXradians or value.rotX or 0,
			rotYradians = value.rotYradians or value.rotY or 0,
			rotZradians = value.rotZradians or value.rotZ or 0,
			posX = value.posX or value.x or 0,
			posY = value.posY or value.y or 0,
			posZ = value.posZ or value.z or 0,
		}
	end

	function Demo_InterpolateAnimationPose3(a, b, amount)
		a = Demo_NormalizeAnimationPose3(a)
		b = Demo_NormalizeAnimationPose3(b)
		return {
			rotXradians = Demo_InterpolateRadians(a.rotXradians, b.rotXradians, amount),
			rotYradians = Demo_InterpolateRadians(a.rotYradians, b.rotYradians, amount),
			rotZradians = Demo_InterpolateRadians(a.rotZradians, b.rotZradians, amount),
			posX = (a.posX + (b.posX - a.posX) * amount),
			posY = (a.posY + (b.posY - a.posY) * amount),
			posZ = (a.posZ + (b.posZ - a.posZ) * amount),
		}
	end

	function Demo_InterpolateAnimationColor(a, b, amount)
		local ar = SrgbByteToLinear(a.r)
		local ag = SrgbByteToLinear(a.g)
		local ab = SrgbByteToLinear(a.b)
		local br = SrgbByteToLinear(b.r)
		local bg = SrgbByteToLinear(b.g)
		local bb = SrgbByteToLinear(b.b)
		local al, aa, ab2 = LinearRgbToOklab(ar, ag, ab)
		local bl, ba, bb2 = LinearRgbToOklab(br, bg, bb)
		local r, g, b3 =
			OklabToLinearRgb((al + (bl - al) * amount), (aa + (ba - aa) * amount), (ab2 + (bb2 - ab2) * amount))
		return {
			r = LinearToSrgbByte(r),
			g = LinearToSrgbByte(g),
			b = LinearToSrgbByte(b3),
		}
	end

	-- performs LERP.
	function Demo_InterpolateAnimationValue(dataType, a, b, amount)
		if Demo_IsAnimationStepType(dataType) then
			return Demo_CloneAnimationValue(a)
		end

		if dataType == "pose3" then
			return Demo_InterpolateAnimationPose3(a, b, amount)
		end

		if dataType == "color" then
			return Demo_InterpolateAnimationColor(a, b, amount)
		end

		if type(a) == "number" and type(b) == "number" then
			return (a + (b - a) * amount)
		end

		if type(a) == "table" and type(b) == "table" then
			local value = {}
			for k, av in pairs(a) do
				local bv = b[k]
				if type(av) == "number" and type(bv) == "number" then
					value[k] = (av + (bv - av) * amount)
				else
					-- non-numeric values are not interpolated, just take the A value.
					value[k] = Demo_CloneAnimationValue(av)
				end
			end
			for k, bv in pairs(b) do
				if value[k] == nil then
					value[k] = Demo_CloneAnimationValue(bv)
				end
			end
			return value
		end

		return Demo_CloneAnimationValue(a)
	end

	function Demo_GetAnimationInterpolation(lane, keyframe)
		if Demo_IsAnimationStepType(lane.dataType) then
			return {
				type = "step",
				param = 0.5,
			}
		end
		return Demo_NormalizeInterpolation(keyframe.interpToNext or lane.interpolation or "linear")
	end

	function Demo_CatmullRomNumber(p0, p1, p2, p3, amount, tension)
		local u2 = amount * amount
		local u3 = u2 * amount
		local tangentScale = 0.5 * (1 - tension)
		local m1 = (p2 - p0) * tangentScale
		local m2 = (p3 - p1) * tangentScale
		return ((2 * u3 - 3 * u2 + 1) * p1 + (u3 - 2 * u2 + amount) * m1 + (-2 * u3 + 3 * u2) * p2 + (u3 - u2) * m2)
	end

	function Demo_CatmullRomRadians(p0, p1, p2, p3, amount, tension)
		local anchor1 = p1
		local anchor2 = Demo_UnwrapRadiansNear(anchor1, p2)
		local anchor0 = Demo_UnwrapRadiansNear(anchor1, p0)
		local anchor3 = Demo_UnwrapRadiansNear(anchor2, p3)
		return Demo_NormalizeRadians(Demo_CatmullRomNumber(anchor0, anchor1, anchor2, anchor3, amount, tension))
	end

	-- function Demo_CatmullRomAnimationColor(p0, p1, p2, p3, amount, tension)
	-- 	local p0r = SrgbByteToLinear(p0.r)
	-- 	local p0g = SrgbByteToLinear(p0.g)
	-- 	local p0b = SrgbByteToLinear(p0.b)
	-- 	local p1r = SrgbByteToLinear(p1.r)
	-- 	local p1g = SrgbByteToLinear(p1.g)
	-- 	local p1b = SrgbByteToLinear(p1.b)
	-- 	local p2r = SrgbByteToLinear(p2.r)
	-- 	local p2g = SrgbByteToLinear(p2.g)
	-- 	local p2b = SrgbByteToLinear(p2.b)
	-- 	local p3r = SrgbByteToLinear(p3.r)
	-- 	local p3g = SrgbByteToLinear(p3.g)
	-- 	local p3b = SrgbByteToLinear(p3.b)
	-- 	local p0l, p0a, p0b2 = LinearRgbToOklab(p0r, p0g, p0b)
	-- 	local p1l, p1a, p1b2 = LinearRgbToOklab(p1r, p1g, p1b)
	-- 	local p2l, p2a, p2b2 = LinearRgbToOklab(p2r, p2g, p2b)
	-- 	local p3l, p3a, p3b2 = LinearRgbToOklab(p3r, p3g, p3b)
	-- 	local r, g, b = OklabToLinearRgb(
	-- 		Demo_CatmullRomNumber(p0l, p1l, p2l, p3l, amount, tension),
	-- 		Demo_CatmullRomNumber(p0a, p1a, p2a, p3a, amount, tension),
	-- 		Demo_CatmullRomNumber(p0b2, p1b2, p2b2, p3b2, amount, tension)
	-- 	)
	-- 	return {
	-- 		r = LinearToSrgbByte(r),
	-- 		g = LinearToSrgbByte(g),
	-- 		b = LinearToSrgbByte(b),
	-- 	}
	-- end

	function Demo_CatmullRomAnimationValue(dataType, p0, p1, p2, p3, amount, tension)
		if dataType == "color" then
			-- no support; return the linear interpolation instead.
			return Demo_InterpolateAnimationValue(dataType, p1, p2, amount)
			--return Demo_CatmullRomAnimationColor(p0, p1, p2, p3, amount, tension)
		end

		if dataType == "pose3" then
			p0 = Demo_NormalizeAnimationPose3(p0)
			p1 = Demo_NormalizeAnimationPose3(p1)
			p2 = Demo_NormalizeAnimationPose3(p2)
			p3 = Demo_NormalizeAnimationPose3(p3)
			return {
				rotXradians = Demo_CatmullRomRadians(
					p0.rotXradians,
					p1.rotXradians,
					p2.rotXradians,
					p3.rotXradians,
					amount,
					tension
				),
				rotYradians = Demo_CatmullRomRadians(
					p0.rotYradians,
					p1.rotYradians,
					p2.rotYradians,
					p3.rotYradians,
					amount,
					tension
				),
				rotZradians = Demo_CatmullRomRadians(
					p0.rotZradians,
					p1.rotZradians,
					p2.rotZradians,
					p3.rotZradians,
					amount,
					tension
				),
				posX = Demo_CatmullRomNumber(p0.posX, p1.posX, p2.posX, p3.posX, amount, tension),
				posY = Demo_CatmullRomNumber(p0.posY, p1.posY, p2.posY, p3.posY, amount, tension),
				posZ = Demo_CatmullRomNumber(p0.posZ, p1.posZ, p2.posZ, p3.posZ, amount, tension),
			}
		end

		if type(p1) == "number" and type(p2) == "number" and type(p0) == "number" and type(p3) == "number" then
			return Demo_CatmullRomNumber(p0, p1, p2, p3, amount, tension)
		end

		if type(p1) == "table" and type(p2) == "table" and type(p0) == "table" and type(p3) == "table" then
			local value = {}
			for k, p1v in pairs(p1) do
				local p0v = p0[k]
				local p2v = p2[k]
				local p3v = p3[k]
				if
					type(p0v) == "number"
					and type(p1v) == "number"
					and type(p2v) == "number"
					and type(p3v) == "number"
				then
					value[k] = Demo_CatmullRomNumber(p0v, p1v, p2v, p3v, amount, tension)
				else
					value[k] = Demo_CloneAnimationValue(p1v)
				end
			end
			for k, p2v in pairs(p2) do
				if value[k] == nil then
					value[k] = Demo_CloneAnimationValue(p2v)
				end
			end
			return value
		end

		return Demo_InterpolateAnimationValue(dataType, p1, p2, amount)
	end

	function Demo_MonotoneCubicTangent(deltaPrev, deltaNext, hPrev, hNext)
		if deltaPrev == nil then
			return deltaNext or 0
		end
		if deltaNext == nil then
			return deltaPrev or 0
		end
		if deltaPrev * deltaNext <= 0 then
			return 0
		end

		local w1 = 2 * hNext + hPrev
		local w2 = hNext + 2 * hPrev
		return (w1 + w2) / (w1 / deltaPrev + w2 / deltaNext)
	end

	function Demo_MonotoneCubicNumber(p0, p1, p2, p3, t0, t1, t2, t3, amount, strength)
		local h = t2 - t1
		if h <= 0 then
			return p2
		end

		local delta = (p2 - p1) / h
		local hPrev = t1 - t0
		local hNext = t3 - t2
		local deltaPrev = hPrev > 0 and (p1 - p0) / hPrev or nil
		local deltaNext = hNext > 0 and (p3 - p2) / hNext or nil
		local m1 = Demo_MonotoneCubicTangent(deltaPrev, delta, hPrev > 0 and hPrev or h, h)
		local m2 = Demo_MonotoneCubicTangent(delta, deltaNext, h, hNext > 0 and hNext or h)

		local u = amount
		local u2 = u * u
		local u3 = u2 * u
		local cubic = (
			(2 * u3 - 3 * u2 + 1) * p1
			+ (u3 - 2 * u2 + u) * h * m1
			+ (-2 * u3 + 3 * u2) * p2
			+ (u3 - u2) * h * m2
		)
		return ((p1 + (p2 - p1) * u) + (cubic - (p1 + (p2 - p1) * u)) * strength)
	end

	function Demo_MonotoneCubicRadians(p0, p1, p2, p3, t0, t1, t2, t3, amount, strength)
		local anchor1 = p1
		local anchor2 = Demo_UnwrapRadiansNear(anchor1, p2)
		local anchor0 = Demo_UnwrapRadiansNear(anchor1, p0)
		local anchor3 = Demo_UnwrapRadiansNear(anchor2, p3)
		return Demo_NormalizeRadians(
			Demo_MonotoneCubicNumber(anchor0, anchor1, anchor2, anchor3, t0, t1, t2, t3, amount, strength)
		)
	end

	function Demo_MonotoneCubicAnimationColor(p0, p1, p2, p3, t0, t1, t2, t3, amount, strength)
		local p0r = SrgbByteToLinear(p0.r)
		local p0g = SrgbByteToLinear(p0.g)
		local p0b = SrgbByteToLinear(p0.b)
		local p1r = SrgbByteToLinear(p1.r)
		local p1g = SrgbByteToLinear(p1.g)
		local p1b = SrgbByteToLinear(p1.b)
		local p2r = SrgbByteToLinear(p2.r)
		local p2g = SrgbByteToLinear(p2.g)
		local p2b = SrgbByteToLinear(p2.b)
		local p3r = SrgbByteToLinear(p3.r)
		local p3g = SrgbByteToLinear(p3.g)
		local p3b = SrgbByteToLinear(p3.b)
		local p0l, p0a, p0b2 = LinearRgbToOklab(p0r, p0g, p0b)
		local p1l, p1a, p1b2 = LinearRgbToOklab(p1r, p1g, p1b)
		local p2l, p2a, p2b2 = LinearRgbToOklab(p2r, p2g, p2b)
		local p3l, p3a, p3b2 = LinearRgbToOklab(p3r, p3g, p3b)
		local r, g, b = OklabToLinearRgb(
			Demo_MonotoneCubicNumber(p0l, p1l, p2l, p3l, t0, t1, t2, t3, amount, strength),
			Demo_MonotoneCubicNumber(p0a, p1a, p2a, p3a, t0, t1, t2, t3, amount, strength),
			Demo_MonotoneCubicNumber(p0b2, p1b2, p2b2, p3b2, t0, t1, t2, t3, amount, strength)
		)
		return {
			r = LinearToSrgbByte(r),
			g = LinearToSrgbByte(g),
			b = LinearToSrgbByte(b),
		}
	end

	function Demo_MonotoneCubicAnimationValue(dataType, p0, p1, p2, p3, t0, t1, t2, t3, amount, strength)
		if dataType == "color" then
			return Demo_MonotoneCubicAnimationColor(p0, p1, p2, p3, t0, t1, t2, t3, amount, strength)
		end

		if dataType == "pose3" then
			p0 = Demo_NormalizeAnimationPose3(p0)
			p1 = Demo_NormalizeAnimationPose3(p1)
			p2 = Demo_NormalizeAnimationPose3(p2)
			p3 = Demo_NormalizeAnimationPose3(p3)
			return {
				rotXradians = Demo_MonotoneCubicRadians(
					p0.rotXradians,
					p1.rotXradians,
					p2.rotXradians,
					p3.rotXradians,
					t0,
					t1,
					t2,
					t3,
					amount,
					strength
				),
				rotYradians = Demo_MonotoneCubicRadians(
					p0.rotYradians,
					p1.rotYradians,
					p2.rotYradians,
					p3.rotYradians,
					t0,
					t1,
					t2,
					t3,
					amount,
					strength
				),
				rotZradians = Demo_MonotoneCubicRadians(
					p0.rotZradians,
					p1.rotZradians,
					p2.rotZradians,
					p3.rotZradians,
					t0,
					t1,
					t2,
					t3,
					amount,
					strength
				),
				posX = Demo_MonotoneCubicNumber(p0.posX, p1.posX, p2.posX, p3.posX, t0, t1, t2, t3, amount, strength),
				posY = Demo_MonotoneCubicNumber(p0.posY, p1.posY, p2.posY, p3.posY, t0, t1, t2, t3, amount, strength),
				posZ = Demo_MonotoneCubicNumber(p0.posZ, p1.posZ, p2.posZ, p3.posZ, t0, t1, t2, t3, amount, strength),
			}
		end

		if type(p1) == "number" and type(p2) == "number" and type(p0) == "number" and type(p3) == "number" then
			return Demo_MonotoneCubicNumber(p0, p1, p2, p3, t0, t1, t2, t3, amount, strength)
		end

		if type(p1) == "table" and type(p2) == "table" and type(p0) == "table" and type(p3) == "table" then
			local value = {}
			for k, p1v in pairs(p1) do
				local p0v = p0[k]
				local p2v = p2[k]
				local p3v = p3[k]
				if
					type(p0v) == "number"
					and type(p1v) == "number"
					and type(p2v) == "number"
					and type(p3v) == "number"
				then
					value[k] = Demo_MonotoneCubicNumber(p0v, p1v, p2v, p3v, t0, t1, t2, t3, amount, strength)
				else
					value[k] = Demo_CloneAnimationValue(p1v)
				end
			end
			for k, p2v in pairs(p2) do
				if value[k] == nil then
					value[k] = Demo_CloneAnimationValue(p2v)
				end
			end
			return value
		end

		return Demo_InterpolateAnimationValue(dataType, p1, p2, amount)
	end

	-- nil = no value.
	function Demo_SampleAnimationKeyframes(lane, beat, keyframes)
		local keyframeCount = #keyframes
		if keyframeCount == 0 then
			return nil
		end

		local firstKeyframe = keyframes[1]
		local firstBeat = firstKeyframe.beat or 0
		if beat <= firstBeat then
			return Demo_CloneAnimationValue(firstKeyframe.value)
		end

		for i = 1, keyframeCount - 1 do
			local a = keyframes[i]
			local b = keyframes[i + 1]
			local aBeat = a.beat or 0
			local bBeat = b.beat or aBeat
			if beat >= aBeat and beat < bBeat then
				local interpolation = Demo_GetAnimationInterpolation(lane, a)
				if interpolation.type == "step" then
					return Demo_CloneAnimationValue(a.value)
				end

				local span = bBeat - aBeat
				if span <= 0 then
					return Demo_CloneAnimationValue(b.value)
				end

				local amount = (beat - aBeat) / span
				if interpolation.type == "catmullRom" then
					local prev = keyframes[i - 1] or a
					local next = keyframes[i + 2] or b
					return Demo_CatmullRomAnimationValue(
						lane.dataType,
						prev.value,
						a.value,
						b.value,
						next.value,
						amount,
						Demo_GetAnimationInterpolationParam(interpolation)
					)
				end
				if interpolation.type == "monotoneCubic" then
					local prev = keyframes[i - 1] or a
					local next = keyframes[i + 2] or b
					return Demo_MonotoneCubicAnimationValue(
						lane.dataType,
						prev.value,
						a.value,
						b.value,
						next.value,
						prev.beat or aBeat,
						aBeat,
						bBeat,
						next.beat or bBeat,
						amount,
						Demo_GetAnimationInterpolationParam(interpolation)
					)
				end

				return Demo_InterpolateAnimationValue(
					lane.dataType,
					a.value,
					b.value,
					Demo_EvaluateEase(interpolation, amount)
				)
			end
		end

		return Demo_CloneAnimationValue(keyframes[keyframeCount].value)
	end

	-- takes a sample by lane Id.
	function Demo_SampleAnimationLane(animation, laneId, beat)
		local lane = animation.lanesById[laneId]
		if lane == nil or not lane.enabled then
			return nil
		end

		return Demo_SampleAnimationKeyframes(lane, beat, lane.keyframes or {})
	end

	function Demo_TriggerValueIsActive(value)
		return value == true
	end

	function Demo_SampleTriggerLane(animationContext, laneId)
		if animationContext == nil then
			return false
		end

		local hasCache = animationContext.triggerSampleHasCache
		if hasCache[laneId] then
			return animationContext.triggerSampleCache[laneId] == true
		end

		local triggered = false
		local animation = animationContext.animation
		local lane = animation ~= nil and animation.lanesById[laneId] or nil
		if lane ~= nil and lane.enabled and lane.dataType == "trigger" and not animationContext.didSeek then
			local startBeat = animationContext.previousBeat
			local endBeat = animationContext.beat
			if endBeat > startBeat then
				local keyframes = lane.keyframes or {}
				for i = 1, #keyframes do
					local keyframe = keyframes[i]
					local beat = keyframe.beat or 0
					if beat > startBeat and beat <= endBeat and Demo_TriggerValueIsActive(keyframe.value) then
						triggered = true
						break
					end
				end
			end
		end

		hasCache[laneId] = true
		animationContext.triggerSampleCache[laneId] = triggered
		return triggered
	end

	function Demo_BeginAnimationFrame(animation, t)
		local beat = t.demoBeats or 0
		local deltaBeats = t.demoDeltaBeats or 0
		return {
			animation = animation,
			beat = beat,
			previousBeat = beat - deltaBeats,
			didSeek = t.didSeek == true,
			laneSampleCache = {},
			laneSampleHasCache = {},
			triggerSampleCache = {},
			triggerSampleHasCache = {},
		}
	end

	function Demo_SampleAnimationLaneCached(animationContext, laneId)
		if animationContext == nil then
			return nil
		end

		local hasCache = animationContext.laneSampleHasCache
		if hasCache[laneId] then
			return animationContext.laneSampleCache[laneId]
		end

		local value = Demo_SampleAnimationLane(animationContext.animation, laneId, animationContext.beat)
		hasCache[laneId] = true
		animationContext.laneSampleCache[laneId] = value
		return value
	end

	function Demo_GetAnimationTargetOverride(animationContext, targets, baseValue)
		if targets == nil then
			return baseValue
		end

		for i = 1, #targets do
			local value = Demo_SampleAnimationLaneCached(animationContext, targets[i].laneId)
			if value ~= nil then
				return value
			end
		end

		return baseValue
	end

	function Demo_GetAnimationNodeFieldTargets(animationContext, nodeId, fieldId)
		if
			animationContext == nil
			or animationContext.animation == nil
			or (type(nodeId) ~= "string" or nodeId == "")
			or (type(fieldId) ~= "string" or fieldId == "")
		then
			return nil
		end

		local targetsByField = animationContext.animation.targetsByNodeField[nodeId]
		return targetsByField and targetsByField[fieldId] or nil
	end

	function Demo_GetAnimatedNodeValue(animationContext, nodeId, fieldId, baseValue)
		return Demo_GetAnimationTargetOverride(
			animationContext,
			Demo_GetAnimationNodeFieldTargets(animationContext, nodeId, fieldId),
			baseValue
		)
	end

	function Demo_GetAnimatedNodeTrigger(animationContext, nodeId, fieldId)
		local targets = Demo_GetAnimationNodeFieldTargets(animationContext, nodeId, fieldId) or {}
		for i = 1, #targets do
			if Demo_SampleTriggerLane(animationContext, targets[i].laneId) then
				return true
			end
		end
		return false
	end

	function Demo_GetAnimationColorCacheKey(color, discreteComponentValues)
		local steps = (discreteComponentValues or 32) - 1
		if steps < 1 then
			steps = 63
		end
		local r = SrgbByteToLinear(color.r)
		local g = SrgbByteToLinear(color.g)
		local b = SrgbByteToLinear(color.b)
		local l, a, b2 = LinearRgbToOklab(r, g, b)
		local ql = ((((l < 0 and 0 or (l > 1 and 1 or l)) * steps) + 0.5) // 1)
		local qa = (((((a + 0.5) < 0 and 0 or ((a + 0.5) > 1 and 1 or (a + 0.5))) * steps) + 0.5) // 1)
		local qb = (((((b2 + 0.5) < 0 and 0 or ((b2 + 0.5) > 1 and 1 or (b2 + 0.5))) * steps) + 0.5) // 1)
		return ql .. ":" .. qa .. ":" .. qb
	end

	function Demo_GetProjectTintCacheKey(tint)
		if tint == nil then
			return nil
		end

		local amountSteps = (tint.discreteAmountValues or 64) - 1
		if amountSteps < 1 then
			amountSteps = 64 - 1
		end

		local qAmount = (
			(
				(((tint.amount or 0) < 0 and 0 or ((tint.amount or 0) > 1 and 1 or (tint.amount or 0))) * amountSteps)
				+ 0.5
			) // 1
		)
		if qAmount <= 0 then
			return nil
		end

		local blendMode = tint.blendMode or "mix"
		local colorKey = Demo_GetAnimationColorCacheKey(tint.color, tint.discreteComponentValues)
		return blendMode .. ":" .. colorKey .. ":" .. qAmount, qAmount / amountSteps
	end

	function Demo_GetMaterialTintVariant(runtime, material, tint, tintCacheKey, quantizedAmount)
		if material == nil then
			return nil
		end

		local cache = runtime.materialTintVariantCache
		if cache == nil then
			cache = {}
			runtime.materialTintVariantCache = cache
		end

		local tintCache = cache[tintCacheKey]
		if tintCache == nil then
			tintCache = {}
			cache[tintCacheKey] = tintCache
		end

		local materialVariant = tintCache[material]
		if materialVariant == nil then
			materialVariant = Demo_LoadMaterialTintVariant(material, {
				color = tint.color,
				amount = quantizedAmount,
				blendMode = tint.blendMode,
			})
			tintCache[material] = materialVariant or false
		end
		if materialVariant == false then
			return nil
		end
		return materialVariant
	end

	function Demo_ApplyProjectTintToMaterials(runtime, materialConfig, tint)
		local tintCacheKey, quantizedAmount = Demo_GetProjectTintCacheKey(tint)
		if tintCacheKey == nil then
			return
		end

		for materialIndex = 1, #materialConfig.materials do
			local material = Demo_GetMaterialTintVariant(
				runtime,
				materialConfig.materials[materialIndex],
				tint,
				tintCacheKey,
				quantizedAmount
			)
			if material ~= nil then
				materialConfig.materials[materialIndex] = material
			end
		end
	end

	function Demo_GetProjectCalibrationCacheKey(calibration)
		if calibration == nil then
			return nil
		end

		local blackLevel = (
			(
				(
					(calibration.blackLevel or 0) < 0 and 0
					or ((calibration.blackLevel or 0) > 255 and 255 or (calibration.blackLevel or 0))
				) + 0.5
			) // 1
		)
		local whiteLevel = (
			(
				(
					(calibration.whiteLevel or 255) < 0 and 0
					or ((calibration.whiteLevel or 255) > 255 and 255 or (calibration.whiteLevel or 255))
				) + 0.5
			) // 1
		)
		local gamma = max(0.01, calibration.gamma or 1)
		local qGamma = (((gamma * 1000) + 0.5) // 1)
		if blackLevel <= 0 and whiteLevel >= 255 and qGamma == 1000 then -- pass-through, no calibration
			return nil
		end

		whiteLevel = max(blackLevel, whiteLevel)
		return string.format("%d:%d:%d", blackLevel, whiteLevel, qGamma),
			{
				blackLevel = blackLevel,
				whiteLevel = whiteLevel,
				gamma = qGamma / 1000,
			}
	end

	function Demo_GetMaterialCalibrationVariant(runtime, material, calibrationCacheKey, quantizedCalibration)
		if material == nil then
			return nil
		end

		local cache = runtime.materialCalibrationVariantCache
		if cache == nil then
			cache = {}
			runtime.materialCalibrationVariantCache = cache
		end

		local calibrationCache = cache[calibrationCacheKey]
		if calibrationCache == nil then
			calibrationCache = {}
			cache[calibrationCacheKey] = calibrationCache
		end

		local materialVariant = calibrationCache[material]
		if materialVariant == nil then
			materialVariant = Demo_LoadMaterialCalibrationVariant(material, quantizedCalibration)
			calibrationCache[material] = materialVariant or false
		end
		if materialVariant == false then
			return nil
		end
		return materialVariant
	end

	function Demo_ApplyProjectCalibrationToMaterials(runtime, materialConfig, calibration)
		local calibrationCacheKey, quantizedCalibration = Demo_GetProjectCalibrationCacheKey(calibration)
		if calibrationCacheKey == nil then
			return
		end

		for materialIndex = 1, #materialConfig.materials do
			-- Projector compensation is deliberately last: it remaps final display
			-- bytes into the visible range measured from the party calibration card.
			local material = Demo_GetMaterialCalibrationVariant(
				runtime,
				materialConfig.materials[materialIndex],
				calibrationCacheKey,
				quantizedCalibration
			)
			if material ~= nil then
				materialConfig.materials[materialIndex] = material
			end
		end
	end

	function Demo_ApplyAnimatedMaterials(runtime, materialConfig, projectTint, projectCalibration)
		for materialIndex = 1, #materialConfig.baseMaterials do
			materialConfig.materials[materialIndex] = materialConfig.baseMaterials[materialIndex]
		end

		Demo_ApplyProjectTintToMaterials(runtime, materialConfig, projectTint)
		Demo_ApplyProjectCalibrationToMaterials(runtime, materialConfig, projectCalibration)
	end
end

do
	function Demo_PathPointScreenPosition(path, pointIndex, renderContext)
		local point = path.points[pointIndex]
		local position = point and point.position
		if position == nil then
			return nil, nil
		end
		return Demo_ToPassScreenPoint(renderContext, position.x, position.y)
	end

	function Demo_ForEachPathPoint2D(path, renderContext, fn)
		for pointIndex = 1, #path.points do
			local x, y = Demo_PathPointScreenPosition(path, pointIndex, renderContext)
			if x ~= nil then
				fn(pointIndex, path.points[pointIndex], x, y)
			end
		end
	end

	function Demo_ForEachPathSegment2D(path, renderContext, fn)
		for segmentIndex = 1, #path.segments do
			local segment = path.segments[segmentIndex]
			local startIndex = (segment.startIndex or 0) + 1
			local endIndex = (segment.endIndex or 0) + 1
			local x0, y0 = Demo_PathPointScreenPosition(path, startIndex, renderContext)
			local x1, y1 = Demo_PathPointScreenPosition(path, endIndex, renderContext)
			if x0 ~= nil and x1 ~= nil then
				fn(segmentIndex, segment, x0, y0, x1, y1, path.points[startIndex], path.points[endIndex])
			end
		end
	end

	function Demo_DrawPathPolylineDebugGuide(path, renderContext, debugDisplay)
		if debugDisplay == nil or path == nil or path.points == nil or path.segments == nil then
			return
		end
		if debugDisplay.wireframe == true then
			Demo_ForEachPathSegment2D(path, renderContext, function(_, _, x0, y0, x1, y1)
				R_editorOverlayLine(x0, y0, x1, y1, 1)
			end)
		end
		if debugDisplay.anchor == true then
			Demo_ForEachPathPoint2D(path, renderContext, function(_, _, x, y)
				R_editorOverlayCrosshair(x, y, 4, 2)
			end)
		end
	end
end

-- specifies minimum segment length. shorter than this get collapsed to a point.
-- use fallback for extreme join angles.
-- higher = more likely to fallback.
-- 0.25 is pretty aggressive but allows animation and in pixel-based tic80 feels
-- reasonable.
local PATH_STROKE_EPSILON = 0.00249

function Demo_PathStrokeNormalizeFace(face)
	face = SafeString(face, "front")
	return face == "back" and "back" or "front"
end

function Demo_PathStrokeFlipFace(face)
	return Demo_PathStrokeNormalizeFace(face) == "front" and "back" or "front"
end

function Demo_PathStrokeResolveJoin(point)
	local join = SafeString(point.join, "corner")
	if join == "bevel" or join == "foldOver" or join == "foldUnder" then
		return join
	end
	return "corner"
end

-- returns the point and its position (or nil if not found)
function Demo_PathStrokePoint(path, index)
	TFASSERT(path ~= nil, "Demo_PathStrokePoint requires a path")
	TFASSERT(index ~= nil, "Demo_PathStrokePoint requires an index")
	TFASSERT(path.points ~= nil, "Demo_PathStrokePoint requires a path with points")
	local point = path.points[index + 1]
	TFASSERT(point ~= nil, "Demo_PathStrokePoint index out of bounds: " .. tostring(index))
	TFASSERT(point.position ~= nil, "Demo_PathStrokePoint point has no position: " .. tostring(index))
	return point, point.position
end

function Demo_PathStrokeIsFoldJoin(join)
	return join == "foldOver" or join == "foldUnder"
end

function Demo_PathStrokeIsFinite(value)
	return type(value) == "number"
		and value == value -- check for NaN
		and value > -1e30
		and value < 1e30
end

function Demo_PathStrokeIsFinitePoint(x, y)
	return Demo_PathStrokeIsFinite(x) and Demo_PathStrokeIsFinite(y)
end

function Demo_PathStrokeLocalSideForEdge(segmentInfo, edge)
	if segmentInfo.face == "back" then
		return edge == 0 and 1 or -1
	end
	return edge == 0 and -1 or 1
end

function Demo_PathStrokeEdgeForLocalSide(segmentInfo, side)
	if segmentInfo.face == "back" then
		return side > 0 and 0 or 1
	end
	return side < 0 and 0 or 1
end

-- returns a vertex payload for the given point.
function Demo_PathStrokeVertexAt(position, x, y, across, distance, totalLength, width)
	TFASSERT(totalLength > PATH_STROKE_EPSILON, "Demo_PathStrokeVertexAt requires totalLength > eps")
	TFASSERT(width > 0.0001, "Demo_PathStrokeVertexAt requires width > eps")
	local z = SafeFloat(position.z)
	local normalizedAcross = across / width + 0.5 -- for uvs
	return {
		x = x,
		y = y,
		z = z,
		u = distance / totalLength,
		v = (normalizedAcross < 0 and 0 or (normalizedAcross > 1 and 1 or normalizedAcross)),
		localX = distance,
		localY = across,
	}
end

-- returns a vertex payload for the given point.
function Demo_PathStrokeEdgeVertexAt(segmentInfo, position, x, y, edge, distance, totalLength, halfWidth)
	return Demo_PathStrokeVertexAt(
		position,
		x,
		y,
		edge == 0 and -halfWidth or halfWidth,
		distance,
		totalLength,
		halfWidth * 2
	)
end

-- calculates the vertex on an edge of a segment.
-- `position` is assumed to be a x,y point which lies on the segment.
-- edge is 0 or 1, representing the raw segment edges, without taking "face" (front/back) into account.
function Demo_PathStrokeEdgeVertex(segmentInfo, position, edge, distance, totalLength, halfWidth)
	-- side is -1 or 1, depending on edge requested and segment face (front/back)
	local side = Demo_PathStrokeLocalSideForEdge(segmentInfo, edge)
	return Demo_PathStrokeEdgeVertexAt(
		segmentInfo,
		position,
		--  produce the x,y coordinates of the edge vertex by offsetting the position along the segment normal by halfWidth.
		position.x + segmentInfo.nx * side * halfWidth,
		position.y + segmentInfo.ny * side * halfWidth,
		edge,
		distance,
		totalLength,
		halfWidth
	)
end

function Demo_PathStrokeCanAddTriangle(a, b, c)
	return a ~= nil
		and b ~= nil
		and c ~= nil
		and Demo_PathStrokeIsFinitePoint(a.x, a.y)
		and Demo_PathStrokeIsFinitePoint(b.x, b.y)
		and Demo_PathStrokeIsFinitePoint(c.x, c.y)
end

function Demo_PathStrokeAddTriangle(triangles, a, b, c, face, order)
	if not Demo_PathStrokeCanAddTriangle(a, b, c) then
		return
	end
	triangles[#triangles + 1] = {
		a = a,
		b = b,
		c = c,
		face = Demo_PathStrokeNormalizeFace(face),
		order = order or 0,
		drawZ = (a.z + b.z + c.z) / 3,
	}
end

-- returns a table with edge0 and edge1 vertices for the given segment,
-- for the given position. position is assumed to be on the segment.
function Demo_PathStrokeEndpointProfile(position, segmentInfo, distance, halfWidth, totalLength)
	return {
		edge0 = Demo_PathStrokeEdgeVertex(segmentInfo, position, 0, distance, totalLength, halfWidth),
		edge1 = Demo_PathStrokeEdgeVertex(segmentInfo, position, 1, distance, totalLength, halfWidth),
	}
end

function Demo_PathStrokeStartProfile(segmentInfo, halfWidth, totalLength)
	return Demo_PathStrokeEndpointProfile(
		segmentInfo.startPosition,
		segmentInfo,
		segmentInfo.distance0, -- expected to be 0 because this is the start of the segment
		halfWidth,
		totalLength
	)
end

function Demo_PathStrokeEndProfile(segmentInfo, halfWidth, totalLength)
	return Demo_PathStrokeEndpointProfile(
		segmentInfo.endPosition,
		segmentInfo,
		segmentInfo.distance1,
		halfWidth,
		totalLength
	)
end

function Demo_PathStrokeEnsureStartProfile(segmentInfo, halfWidth, totalLength)
	if segmentInfo.startProfile == nil then
		segmentInfo.startProfile = Demo_PathStrokeStartProfile(segmentInfo, halfWidth, totalLength)
	end
end

function Demo_PathStrokeEnsureEndProfile(segmentInfo, halfWidth, totalLength)
	if segmentInfo.endProfile == nil then
		segmentInfo.endProfile = Demo_PathStrokeEndProfile(segmentInfo, halfWidth, totalLength)
	end
end

function Demo_PathStrokeSetProfileVertex(profile, edge, vertex)
	if edge == 0 then
		profile.edge0 = vertex
	else
		profile.edge1 = vertex
	end
end

function Demo_PathStrokeProfileFromEdgeVertices(edgeA, vertexA, edgeB, vertexB)
	local profile = {}
	Demo_PathStrokeSetProfileVertex(profile, edgeA, vertexA)
	Demo_PathStrokeSetProfileVertex(profile, edgeB, vertexB)
	return profile
end

function Demo_PathStrokeTriangleArea2(ax, ay, bx, by, cx, cy)
	return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)
end

function Demo_PathStrokeSameTriangleWinding(a, b, c, newA, newB, newC)
	return Demo_PathStrokeTriangleArea2(a.x, a.y, b.x, b.y, c.x, c.y)
			* Demo_PathStrokeTriangleArea2(newA.x, newA.y, newB.x, newB.y, newC.x, newC.y)
		> 0
end

function Demo_PathStrokeProfilesKeepWinding(startProfile, endProfile, newStartProfile, newEndProfile)
	return Demo_PathStrokeSameTriangleWinding(
		startProfile.edge0,
		endProfile.edge0,
		endProfile.edge1,
		newStartProfile.edge0,
		newEndProfile.edge0,
		newEndProfile.edge1
	) and Demo_PathStrokeSameTriangleWinding(
		startProfile.edge0,
		endProfile.edge1,
		startProfile.edge1,
		newStartProfile.edge0,
		newEndProfile.edge1,
		newStartProfile.edge1
	)
end

function Demo_PathStrokeLineIntersection(ax, ay, atx, aty, bx, by, btx, bty)
	local denom = atx * bty - aty * btx
	if abs(denom) <= PATH_STROKE_EPSILON then
		return nil, nil
	end
	local dx = bx - ax
	local dy = by - ay
	local t = (dx * bty - dy * btx) / denom
	local x = ax + atx * t
	local y = ay + aty * t
	if not Demo_PathStrokeIsFinitePoint(x, y) then
		return nil, nil
	end
	return x, y
end

function Demo_PathStrokeLocalSidePoint(position, segmentInfo, side, halfWidth)
	local px = SafeFloat(position.x)
	local py = SafeFloat(position.y)
	return px + segmentInfo.nx * side * halfWidth, py + segmentInfo.ny * side * halfWidth
end

function Demo_PathStrokeEdgePoint(position, segmentInfo, edge, halfWidth)
	return Demo_PathStrokeLocalSidePoint(
		position,
		segmentInfo,
		Demo_PathStrokeLocalSideForEdge(segmentInfo, edge),
		halfWidth
	)
end

function Demo_PathStrokeEdgeIntersection(position, prevSegment, prevEdge, nextSegment, nextEdge, halfWidth)
	local ax, ay = Demo_PathStrokeEdgePoint(position, prevSegment, prevEdge, halfWidth)
	local bx, by = Demo_PathStrokeEdgePoint(position, nextSegment, nextEdge, halfWidth)
	return Demo_PathStrokeLineIntersection(
		ax,
		ay,
		prevSegment.tx,
		prevSegment.ty,
		bx,
		by,
		nextSegment.tx,
		nextSegment.ty
	)
end

function Demo_PathStrokeLocalSideIntersection(position, prevSegment, nextSegment, side, halfWidth)
	local ax, ay = Demo_PathStrokeLocalSidePoint(position, prevSegment, side, halfWidth)
	local bx, by = Demo_PathStrokeLocalSidePoint(position, nextSegment, side, halfWidth)
	return Demo_PathStrokeLineIntersection(
		ax,
		ay,
		prevSegment.tx,
		prevSegment.ty,
		bx,
		by,
		nextSegment.tx,
		nextSegment.ty
	)
end

function Demo_PathStrokeAddSegmentTriangles(triangles, segmentInfo)
	local start0 = segmentInfo.startProfile.edge0
	local start1 = segmentInfo.startProfile.edge1
	local end0 = segmentInfo.endProfile.edge0
	local end1 = segmentInfo.endProfile.edge1
	local order = segmentInfo.drawOrder

	Demo_PathStrokeAddTriangle(triangles, start0, end0, end1, segmentInfo.face, order)
	Demo_PathStrokeAddTriangle(triangles, start0, end1, start1, segmentInfo.face, order + 0.01)
end

function Demo_PathStrokeAddJointGeometry(triangles, surface, prevSegment, nextSegment, halfWidth, totalLength)
	local point, position = Demo_PathStrokePoint(surface.path, prevSegment.endIndex)
	if position == nil then
		return
	end

	local join = Demo_PathStrokeResolveJoin(point)
	if join ~= "bevel" and not Demo_PathStrokeIsFoldJoin(join) then
		return
	end

	-- calculate the cross product of the two segments to determine if they are parallel or not.
	local cross = prevSegment.tx * nextSegment.ty - prevSegment.ty * nextSegment.tx
	if abs(cross) <= PATH_STROKE_EPSILON then
		return
	end

	if Demo_PathStrokeIsFoldJoin(join) then
		Demo_PathStrokeAddFoldJoinGeometry(
			triangles,
			join,
			position,
			prevSegment,
			nextSegment,
			halfWidth,
			totalLength,
			cross
		)
	else
		Demo_PathStrokeAddBevelJoinGeometry(
			triangles,
			position,
			prevSegment,
			nextSegment,
			halfWidth,
			totalLength,
			cross
		)
	end
end

function Demo_PathStrokeBuildSegmentInfos(surface)
	local path = surface and surface.path or nil
	local segmentInfos = {}
	if path == nil or path.points == nil or path.segments == nil then
		return segmentInfos
	end

	local accumulated = 0 -- accumulated distance along the path
	local currentFace = Demo_PathStrokeNormalizeFace(path.startFace)
	local currentDrawOrder = 0
	for i = 1, #path.segments do
		local segment = path.segments[i]
		local segmentLength = max(0, SafeFloat(segment.length, 0))
		local distance0 = accumulated
		local distance1 = accumulated + segmentLength
		accumulated = distance1

		local startIndex = segment.startIndex or 0 -- index of the start point of the segment
		local endIndex = segment.endIndex or 0 -- index of the end point of the segment
		local _, startPosition = Demo_PathStrokePoint(path, startIndex) -- get start & end points of the segment.
		local _, endPosition = Demo_PathStrokePoint(path, endIndex)
		TFASSERT(
			startPosition ~= nil,
			"Demo_PathStrokeBuildSegmentInfos startPosition is nil for segment " .. tostring(i)
		)
		TFASSERT(endPosition ~= nil, "Demo_PathStrokeBuildSegmentInfos endPosition is nil for segment " .. tostring(i))
		local dx = endPosition.x - startPosition.x
		local dy = endPosition.y - startPosition.y
		local length = sqrt(dx * dx + dy * dy)
		if length > PATH_STROKE_EPSILON then
			local invLength = 1 / length
			local tx = dx * invLength -- normalized tangent vector
			local ty = dy * invLength
			segmentInfos[#segmentInfos + 1] = {
				index = i,
				pathSegmentIndex = segment.index or i - 1,
				startIndex = startIndex,
				endIndex = endIndex,
				startPosition = startPosition,
				endPosition = endPosition,
				distance0 = distance0,
				distance1 = distance1,
				tx = tx,
				ty = ty,
				nx = -ty, -- normalized normal vector
				ny = tx,
				face = currentFace,
				drawOrder = currentDrawOrder,
			}
		end
		local endPoint = path.points[(endIndex or 0) + 1] -- index of the end point of the segment
		local endJoin = Demo_PathStrokeResolveJoin(endPoint)
		if Demo_PathStrokeIsFoldJoin(endJoin) then
			currentFace = Demo_PathStrokeFlipFace(currentFace)
			currentDrawOrder = currentDrawOrder + (endJoin == "foldOver" and 1 or -1)
		else
			currentDrawOrder = currentDrawOrder + 0.001
		end
	end
	return segmentInfos
end

function Demo_PathStrokeAddOpenSegmentGeometry(triangles, surface, segmentInfos, halfWidth, totalLength)
	TFASSERT(#segmentInfos > 0, "Demo_PathStrokeAddOpenSegmentGeometry requires at least one segment")

	Demo_PathStrokeEnsureStartProfile(segmentInfos[1], halfWidth, totalLength)
	for i = 1, #segmentInfos - 1 do
		local prevSegment = segmentInfos[i]
		local nextSegment = segmentInfos[i + 1]
		Demo_PathStrokeEnsureEndProfile(prevSegment, halfWidth, totalLength)
		Demo_PathStrokeEnsureStartProfile(nextSegment, halfWidth, totalLength)
		Demo_PathStrokeAddJointGeometry(
			triangles, --
			surface,
			prevSegment,
			nextSegment,
			halfWidth,
			totalLength
		)
		Demo_PathStrokeAddSegmentTriangles(triangles, prevSegment)
	end

	local lastSegment = segmentInfos[#segmentInfos]
	Demo_PathStrokeEnsureEndProfile(lastSegment, halfWidth, totalLength)
	Demo_PathStrokeAddSegmentTriangles(triangles, lastSegment)
end

function Demo_PathStrokeAddClosedSegmentGeometry(triangles, surface, segmentInfos, halfWidth, totalLength)
	local segmentCount = #segmentInfos
	TFASSERT(segmentCount > 1, "Demo_PathStrokeAddClosedSegmentGeometry requires at least two segments")

	-- produce the joint between the last and first segments
	local firstSegment = segmentInfos[1]
	local lastSegment = segmentInfos[segmentCount]
	Demo_PathStrokeEnsureEndProfile(lastSegment, halfWidth, totalLength)
	Demo_PathStrokeEnsureStartProfile(firstSegment, halfWidth, totalLength)
	Demo_PathStrokeAddJointGeometry(
		triangles, --
		surface,
		lastSegment,
		firstSegment,
		halfWidth,
		totalLength
	)

	-- here do the same as open path.
	for i = 1, segmentCount - 1 do
		local prevSegment = segmentInfos[i]
		local nextSegment = segmentInfos[i + 1]
		Demo_PathStrokeEnsureEndProfile(prevSegment, halfWidth, totalLength)
		Demo_PathStrokeEnsureStartProfile(nextSegment, halfWidth, totalLength)
		Demo_PathStrokeAddJointGeometry(
			triangles, --
			surface,
			prevSegment,
			nextSegment,
			halfWidth,
			totalLength
		)
		Demo_PathStrokeAddSegmentTriangles(triangles, prevSegment)
	end

	Demo_PathStrokeAddSegmentTriangles(triangles, lastSegment)
end

-- almost verbatim from bevel code but we can't actually use bevel because we have to respect UV.
local function Demo_PathStrokeAddFoldBevelFallbackGeometry(
	triangles,
	join,
	position,
	prevSegment,
	nextSegment,
	halfWidth,
	totalLength,
	cross
)
	local insideSide = cross > 0 and 1 or -1
	local outsideSide = -insideSide
	local insidePrevEdge = Demo_PathStrokeEdgeForLocalSide(prevSegment, insideSide)
	local insideNextEdge = Demo_PathStrokeEdgeForLocalSide(nextSegment, insideSide)
	local outsidePrevEdge = Demo_PathStrokeEdgeForLocalSide(prevSegment, outsideSide)
	local outsideNextEdge = Demo_PathStrokeEdgeForLocalSide(nextSegment, outsideSide)
	local ix, iy = Demo_PathStrokeLocalSideIntersection(position, prevSegment, nextSegment, insideSide, halfWidth)

	if ix == nil then
		return
	end

	local insidePrev = Demo_PathStrokeEdgeVertexAt(
		prevSegment,
		position,
		ix,
		iy,
		insidePrevEdge,
		prevSegment.distance1,
		totalLength,
		halfWidth
	)
	local insideNext = Demo_PathStrokeEdgeVertexAt(
		nextSegment,
		position,
		ix,
		iy,
		insideNextEdge,
		nextSegment.distance0,
		totalLength,
		halfWidth
	)
	local outsidePrev =
		Demo_PathStrokeEdgeVertex(prevSegment, position, outsidePrevEdge, prevSegment.distance1, totalLength, halfWidth)
	local outsideNext =
		Demo_PathStrokeEdgeVertex(nextSegment, position, outsideNextEdge, nextSegment.distance0, totalLength, halfWidth)

	Demo_PathStrokeSetProfileVertex(prevSegment.endProfile, insidePrevEdge, insidePrev)
	Demo_PathStrokeSetProfileVertex(prevSegment.endProfile, outsidePrevEdge, outsidePrev)
	Demo_PathStrokeSetProfileVertex(nextSegment.startProfile, insideNextEdge, insideNext)
	Demo_PathStrokeSetProfileVertex(nextSegment.startProfile, outsideNextEdge, outsideNext)

	local joinSegment = join == "foldUnder" and prevSegment or nextSegment
	local joinDistance = join == "foldUnder" and prevSegment.distance1 or nextSegment.distance0
	local joinInsideEdge = Demo_PathStrokeEdgeForLocalSide(joinSegment, insideSide)
	local joinOutsideEdge = Demo_PathStrokeEdgeForLocalSide(joinSegment, outsideSide)
	local joinInside =
		Demo_PathStrokeEdgeVertexAt(joinSegment, position, ix, iy, joinInsideEdge, joinDistance, totalLength, halfWidth)
	local joinOutsidePrev = Demo_PathStrokeEdgeVertexAt(
		joinSegment,
		position,
		outsidePrev.x,
		outsidePrev.y,
		joinOutsideEdge,
		joinDistance,
		totalLength,
		halfWidth
	)
	local joinOutsideNext = Demo_PathStrokeEdgeVertexAt(
		joinSegment,
		position,
		outsideNext.x,
		outsideNext.y,
		joinOutsideEdge,
		joinDistance,
		totalLength,
		halfWidth
	)
	local order = joinSegment.drawOrder + 0.005
	Demo_PathStrokeAddTriangle(triangles, joinInside, joinOutsidePrev, joinOutsideNext, joinSegment.face, order)
end

function Demo_PathStrokeAddFoldJoinGeometry(
	triangles,
	join,
	position,
	prevSegment, -- segmentInfo
	nextSegment, -- segmentInfo
	halfWidth,
	totalLength,
	cross -- cross product
)
	local same0x, same0y = Demo_PathStrokeEdgeIntersection(position, prevSegment, 0, nextSegment, 0, halfWidth)
	local same1x, same1y = Demo_PathStrokeEdgeIntersection(position, prevSegment, 1, nextSegment, 1, halfWidth)
	-- these would only be nil if parallel; caller is expected to check that already based on cross product.
	TFASSERT(same0x ~= nil and same1x ~= nil, "expected non-parallel segments for fold join")

	-- local foldSide = cross > 0 and 1 or -1
	-- local prevElbowEdge = Demo_PathStrokeEdgeForLocalSide(prevSegment, foldSide)
	-- local nextElbowEdge = Demo_PathStrokeEdgeForLocalSide(nextSegment, foldSide)
	-- local elbowX, elbowY =
	-- 	Demo_PathStrokeEdgeIntersection(position, prevSegment, prevElbowEdge, nextSegment, nextElbowEdge, halfWidth)
	-- TFASSERT(elbowX ~= nil, "expected non-parallel segments for fold join")

	-- local order = (prevSegment.drawOrder + nextSegment.drawOrder) * 0.5
	-- local joinSegment = join == "foldUnder" and prevSegment or nextSegment
	-- local joinDistance = join == "foldUnder" and prevSegment.distance1 or nextSegment.distance0
	-- local joinFace = join == "foldUnder" and prevSegment.face or nextSegment.face

	local prevSame0 = Demo_PathStrokeEdgeVertexAt(
		prevSegment,
		position,
		same0x,
		same0y,
		0,
		prevSegment.distance1,
		totalLength,
		halfWidth
	)
	local prevSame1 = Demo_PathStrokeEdgeVertexAt(
		prevSegment,
		position,
		same1x,
		same1y,
		1,
		prevSegment.distance1,
		totalLength,
		halfWidth
	)
	local prevEndProfile = {
		edge0 = prevSame0,
		edge1 = prevSame1,
	}
	local prevStartProfile = prevSegment.startProfile
		or Demo_PathStrokeStartProfile(prevSegment, halfWidth, totalLength)
	if
		not Demo_PathStrokeProfilesKeepWinding(
			prevStartProfile,
			prevSegment.endProfile,
			prevStartProfile,
			prevEndProfile
		)
	then
		Demo_PathStrokeAddFoldBevelFallbackGeometry(
			triangles,
			join,
			position,
			prevSegment,
			nextSegment,
			halfWidth,
			totalLength,
			cross
		)
		return
	end

	local nextSame0 = Demo_PathStrokeEdgeVertexAt(
		nextSegment,
		position,
		same0x,
		same0y,
		0,
		nextSegment.distance0,
		totalLength,
		halfWidth
	)
	local nextSame1 = Demo_PathStrokeEdgeVertexAt(
		nextSegment,
		position,
		same1x,
		same1y,
		1,
		nextSegment.distance0,
		totalLength,
		halfWidth
	)
	local nextStartProfile = {
		edge0 = nextSame0,
		edge1 = nextSame1,
	}
	local nextEndProfile = nextSegment.endProfile or Demo_PathStrokeEndProfile(nextSegment, halfWidth, totalLength)
	if
		not Demo_PathStrokeProfilesKeepWinding(
			nextSegment.startProfile,
			nextEndProfile,
			nextStartProfile,
			nextEndProfile
		)
	then
		Demo_PathStrokeAddFoldBevelFallbackGeometry(
			triangles,
			join,
			position,
			prevSegment,
			nextSegment,
			halfWidth,
			totalLength,
			cross
		)
		return
	end

	-- adjust the existing segments so they terminate at the fold intersection.
	-- z-order handles any overlap.

	Demo_PathStrokeSetProfileVertex(prevSegment.endProfile, 0, prevSame0)
	Demo_PathStrokeSetProfileVertex(prevSegment.endProfile, 1, prevSame1)
	Demo_PathStrokeSetProfileVertex(nextSegment.startProfile, 0, nextSame0)
	Demo_PathStrokeSetProfileVertex(nextSegment.startProfile, 1, nextSame1)
end

function Demo_PathStrokeAddBevelSharpFallbackGeometry(
	position,
	prevSegment,
	nextSegment,
	halfWidth,
	totalLength,
	insidePrevEdge,
	insideNextEdge,
	outsidePrevEdge,
	outsideNextEdge,
	outsidePrev,
	outsideNext
)
	local prevInside = Demo_PathStrokeEdgeVertexAt(
		prevSegment,
		position,
		outsideNext.x,
		outsideNext.y,
		insidePrevEdge,
		prevSegment.distance1,
		totalLength,
		halfWidth
	)
	local nextInside = Demo_PathStrokeEdgeVertexAt(
		nextSegment,
		position,
		outsidePrev.x,
		outsidePrev.y,
		insideNextEdge,
		nextSegment.distance0,
		totalLength,
		halfWidth
	)

	Demo_PathStrokeSetProfileVertex(prevSegment.endProfile, insidePrevEdge, prevInside)
	Demo_PathStrokeSetProfileVertex(prevSegment.endProfile, outsidePrevEdge, outsidePrev)
	Demo_PathStrokeSetProfileVertex(nextSegment.startProfile, insideNextEdge, nextInside)
	Demo_PathStrokeSetProfileVertex(nextSegment.startProfile, outsideNextEdge, outsideNext)
end

function Demo_PathStrokeAddBevelJoinGeometry(
	triangles,
	position,
	prevSegment,
	nextSegment,
	halfWidth,
	totalLength,
	cross
)
	local insideSide = cross > 0 and 1 or -1
	local outsideSide = -insideSide
	local insidePrevEdge = Demo_PathStrokeEdgeForLocalSide(prevSegment, insideSide)
	local insideNextEdge = Demo_PathStrokeEdgeForLocalSide(nextSegment, insideSide)
	local outsidePrevEdge = Demo_PathStrokeEdgeForLocalSide(prevSegment, outsideSide)
	local outsideNextEdge = Demo_PathStrokeEdgeForLocalSide(nextSegment, outsideSide)
	local ix, iy = Demo_PathStrokeLocalSideIntersection(position, prevSegment, nextSegment, insideSide, halfWidth)

	if ix == nil then
		return
	end

	local insidePrev = Demo_PathStrokeEdgeVertexAt(
		prevSegment,
		position,
		ix,
		iy,
		insidePrevEdge,
		prevSegment.distance1,
		totalLength,
		halfWidth
	)
	local outsidePrev =
		Demo_PathStrokeEdgeVertex(prevSegment, position, outsidePrevEdge, prevSegment.distance1, totalLength, halfWidth)

	local insideNext = Demo_PathStrokeEdgeVertexAt(
		nextSegment,
		position,
		ix,
		iy,
		insideNextEdge,
		nextSegment.distance0,
		totalLength,
		halfWidth
	)
	local outsideNext =
		Demo_PathStrokeEdgeVertex(nextSegment, position, outsideNextEdge, nextSegment.distance0, totalLength, halfWidth)

	local prevEndProfile =
		Demo_PathStrokeProfileFromEdgeVertices(insidePrevEdge, insidePrev, outsidePrevEdge, outsidePrev)
	local nextStartProfile =
		Demo_PathStrokeProfileFromEdgeVertices(insideNextEdge, insideNext, outsideNextEdge, outsideNext)
	local prevStartProfile = prevSegment.startProfile
		or Demo_PathStrokeStartProfile(prevSegment, halfWidth, totalLength)
	local prevOriginalEndProfile = prevSegment.endProfile
		or Demo_PathStrokeEndProfile(prevSegment, halfWidth, totalLength)
	local nextOriginalStartProfile = nextSegment.startProfile
		or Demo_PathStrokeStartProfile(nextSegment, halfWidth, totalLength)
	local nextEndProfile = nextSegment.endProfile or Demo_PathStrokeEndProfile(nextSegment, halfWidth, totalLength)
	if
		not Demo_PathStrokeProfilesKeepWinding(
			prevStartProfile,
			prevOriginalEndProfile,
			prevStartProfile,
			prevEndProfile
		)
		or not Demo_PathStrokeProfilesKeepWinding(
			nextOriginalStartProfile,
			nextEndProfile,
			nextStartProfile,
			nextEndProfile
		)
	then
		Demo_PathStrokeAddBevelSharpFallbackGeometry(
			position,
			prevSegment,
			nextSegment,
			halfWidth,
			totalLength,
			insidePrevEdge,
			insideNextEdge,
			outsidePrevEdge,
			outsideNextEdge,
			outsidePrev,
			outsideNext
		)
		return
	end

	Demo_PathStrokeSetProfileVertex(prevSegment.endProfile, insidePrevEdge, insidePrev)
	Demo_PathStrokeSetProfileVertex(prevSegment.endProfile, outsidePrevEdge, outsidePrev)
	Demo_PathStrokeSetProfileVertex(nextSegment.startProfile, insideNextEdge, insideNext)
	Demo_PathStrokeSetProfileVertex(nextSegment.startProfile, outsideNextEdge, outsideNext)

	local insideJoin = Demo_PathStrokeEdgeVertexAt(
		nextSegment,
		position,
		ix,
		iy,
		insideNextEdge,
		nextSegment.distance0,
		totalLength,
		halfWidth
	)

	local order = max(prevSegment.drawOrder, nextSegment.drawOrder) + 0.005
	Demo_PathStrokeAddTriangle(triangles, insideJoin, outsidePrev, outsideNext, nextSegment.face, order)
end

-- takes a path
-- returns the computed geometry for it: mostly triangles
function Demo_BuildPathStrokeGeometry(surface)
	local path = surface and surface.path or nil
	local width = SafeFloat(surface and surface.width, 0)
	local totalLength = SafeFloat(path and path.length, 0)
	-- widths less than 1 pixel are not renderable.
	if path == nil or width <= 0.9 or totalLength <= 0 then
		-- weird / invalid / no path, return no geometry.
		return {
			triangles = {},
			width = width,
			length = totalLength,
		}
	end
	local triangles = {}

	local halfWidth = width * 0.5
	local segmentInfos = Demo_PathStrokeBuildSegmentInfos(surface)
	if path.closed == true and #segmentInfos > 1 then
		Demo_PathStrokeAddClosedSegmentGeometry(triangles, surface, segmentInfos, halfWidth, totalLength)
	else
		Demo_PathStrokeAddOpenSegmentGeometry(triangles, surface, segmentInfos, halfWidth, totalLength)
	end

	table.sort(triangles, function(a, b)
		if a.drawZ ~= b.drawZ then
			return a.drawZ > b.drawZ
		end
		return a.order < b.order
	end)

	return {
		triangles = triangles,
		width = width,
		length = totalLength,
	}
end

function Demo_DrawPathStrokeGeometryDebugGuide(surface, renderContext, debugDisplay)
	if debugDisplay == nil or debugDisplay.wireframe ~= true then
		return
	end

	-- draws all triangles
	local geometry = Demo_BuildPathStrokeGeometry(surface)
	for i = 1, #geometry.triangles do
		local tri = geometry.triangles[i]
		local ax, ay = Demo_ToPassScreenPoint(renderContext, tri.a.x, tri.a.y)
		local bx, by = Demo_ToPassScreenPoint(renderContext, tri.b.x, tri.b.y)
		local cx, cy = Demo_ToPassScreenPoint(renderContext, tri.c.x, tri.c.y)
		R_editorOverlayLine(ax, ay, bx, by, 1)
		R_editorOverlayLine(bx, by, cx, cy, 1)
		R_editorOverlayLine(cx, cy, ax, ay, 1)
	end
end

do
	function Demo_GetFlatFillMaterial(runtime, fill, fallbackMaterialIndex, fallbackTone)
		if fill ~= nil and fill.type == "flat" then
			local materialIndexById = runtime.frameMaterialIndexById or runtime.materialIndexById
			return (type(fill.materialId) == "string" and fill.materialId ~= "") and materialIndexById[fill.materialId]
				or nil,
				fill.tone or 0
		end
		if fill == nil then
			return fallbackMaterialIndex, fallbackTone
		end
		return nil, nil
	end

	function Demo_GetFillTexture(runtime, fill)
		TFASSERT(fill ~= nil, "Demo_GetFillTexture: fill is nil")
		TFASSERT(fill.type == "texture", "Demo_GetFillTexture: fill is not a texture")
		local texture = runtime.textures[fill.textureId]
		if texture == nil or texture.hasImage ~= true then
			return nil
		end
		Demo_RemapTextureMaterials(
			texture,
			runtime.frameMaterialIndexById or runtime.materialIndexById,
			runtime.frameMaterialIndexStamp
		)
		return texture
	end

	function Demo_CreateFillProcedure(runtime, fill)
		if fill == nil then
			return nil
		end
		local materialIndexById = runtime.frameMaterialIndexById or runtime.materialIndexById
		if fill.type == "flat" then
			local fillMaterialIndex = (type(fill.materialId) == "string" and fill.materialId ~= "")
					and materialIndexById[fill.materialId]
				or nil
			local fillTone = fill.tone or 0
			return function()
				return fillMaterialIndex, fillTone
			end
		end
		if fill.type == "linearGradient" then
			local fillMaterialIndex = (type(fill.materialId) == "string" and fill.materialId ~= "")
					and materialIndexById[fill.materialId]
				or nil
			local toneA = fill.toneA or 0
			local toneB = fill.toneB or 1
			local useY = fill.axis == "y"
			return function(u, v)
				return fillMaterialIndex,
					(
						toneA
						+ (toneB - toneA)
							* ((useY and v or u) < 0 and 0 or ((useY and v or u) > 1 and 1 or (useY and v or u)))
					)
			end
		end
		if fill.type == "radialGradient" then
			local fillMaterialIndex = (type(fill.materialId) == "string" and fill.materialId ~= "")
					and materialIndexById[fill.materialId]
				or nil
			local toneA = fill.toneA or 1
			local toneB = fill.toneB or 0
			return function(u, v)
				local dx = u - 0.5
				local dy = v - 0.5
				local d2 = sqrt(dx * dx + dy * dy) * 2
				return fillMaterialIndex, (toneA + (toneB - toneA) * (d2 < 0 and 0 or (d2 > 1 and 1 or d2)))
			end
		end
		if fill.type == "texture" then
			local texture = Demo_GetFillTexture(runtime, fill)
			if texture == nil then
				return nil
			end
			local textureMaterialSlots = texture.materialSlots
			local textureMaterialIndexBySlot = texture.materialIndexBySlot
			if textureMaterialSlots == nil or textureMaterialIndexBySlot == nil then
				return nil
			end
			local textureTones = texture.tones
			local textureWidth = texture.width
			local textureHeight = texture.height
			local textureMaxX = textureWidth - 1
			local textureMaxY = textureHeight - 1
			return function(u, v)
				local tx = (u * textureWidth) // 1
				if tx < 0 then
					tx = 0
				elseif tx > textureMaxX then
					tx = textureMaxX
				end
				local ty = (v * textureHeight) // 1
				if ty < 0 then
					ty = 0
				elseif ty > textureMaxY then
					ty = textureMaxY
				end
				local textureIndex = ty * textureWidth + tx
				local materialIndex = textureMaterialIndexBySlot[textureMaterialSlots[textureIndex]]
				return materialIndex, textureTones[textureIndex]
			end
		end
		if fill.type == "masked" then
			local maskTexture = runtime.textures[fill.maskTextureId]
			local sourceProcedure = Demo_CreateFillProcedure(runtime, fill.source)
			local coverageProcedure = maskTexture ~= nil and Demo_CreateTextureCoverageProcedure(maskTexture) or nil
			if coverageProcedure == nil or sourceProcedure == nil then
				return nil
			end
			return function(u, v, screenX, screenY, localX, localY)
				if not coverageProcedure(u, v) then
					return nil
				end
				return sourceProcedure(u, v, screenX, screenY, localX, localY)
			end
		end
		if fill.type == "checkered" then
			local materialAIndex = (type(fill.materialAId) == "string" and fill.materialAId ~= "")
					and materialIndexById[fill.materialAId]
				or nil
			local materialBIndex = (type(fill.materialBId) == "string" and fill.materialBId ~= "")
					and materialIndexById[fill.materialBId]
				or nil
			local scale = SafeVec2(fill.scale, { x = 7, y = 7 })
			local offset = SafeVec2(fill.offset, { x = 0, y = 0 })
			local scaleX = SafeFloat(scale.x, 7)
			local scaleY = SafeFloat(scale.y, 7)
			local pixelScaleXInv = scaleX ~= 0 and 1 / scaleX or 0
			local pixelScaleYInv = scaleY ~= 0 and 1 / scaleY or 0
			return function(u, v, screenX, screenY, localX, localY)
				local checkX
				local checkY
				if localX ~= nil and localY ~= nil then
					checkX = ((u + SafeFloat(offset.x)) * scaleX) // 1
					checkY = ((v + SafeFloat(offset.y)) * scaleY) // 1
				else
					checkX = ((u + SafeFloat(offset.x)) * pixelScaleXInv) // 1
					checkY = ((v + SafeFloat(offset.y)) * pixelScaleYInv) // 1
				end
				local isEven = (checkX + checkY) % 2 == 0
				return isEven and materialAIndex or materialBIndex, isEven and fill.toneA or fill.toneB
			end
		end
		if fill.type == "valueNoise" then
			local fillMaterialIndex = (type(fill.materialId) == "string" and fill.materialId ~= "")
					and materialIndexById[fill.materialId]
				or nil
			local scale = max(0.001, SafeFloat(fill.scale, 8))
			local phase = SafeFloat(fill.phase)
			local minTone = SafeFloat(fill.minTone)
			local maxTone = SafeFloat(fill.maxTone, 1)
			return function(u, v, screenX, screenY, localX, localY)
				local sampleX = localX ~= nil and u * scale or u / scale
				local sampleY = localY ~= nil and v * scale or v / scale
				local value = ValueNoise3D(sampleX, sampleY, phase, 0)
				return fillMaterialIndex, (minTone + (maxTone - minTone) * value)
			end
		end
		return nil
	end

	function Demo_CreateFrameObjectFillProcedure(runtime, frameObject)
		return Demo_CreateFillProcedure(runtime, frameObject.fill)
	end
end

do
	local RECT_EPSILON = 0.0001

	local function Rect_LocalPoint(affine, sx, sy, localX, localY)
		if affine ~= nil then
			return R_transformAffine2D(affine, localX, localY)
		end
		return sx + localX, sy + localY
	end

	local function Rect_BuildAffine(frameObject, sx, sy, width, height)
		local affine = R_buildAffine2D(
			sx,
			sy,
			width,
			height,
			frameObject.anchorXNorm,
			frameObject.anchorYNorm,
			frameObject.angleDeg,
			frameObject.skewX or 0,
			frameObject.skewY or 0
		)
		if affine == nil or affine.x1 <= affine.x0 or affine.y1 <= affine.y0 then
			return nil
		end
		return affine
	end

	local function Rect_NormalizeCornerRadii(width, height, cornerRadii)
		if cornerRadii == nil then
			return 0, 0, 0, 0, false
		end

		local topLeft = max(0, SafeFloat(cornerRadii.topLeft, 0))
		local topRight = max(0, SafeFloat(cornerRadii.topRight, 0))
		local bottomRight = max(0, SafeFloat(cornerRadii.bottomRight, 0))
		local bottomLeft = max(0, SafeFloat(cornerRadii.bottomLeft, 0))
		local scale = 1
		local topSum = topLeft + topRight
		local bottomSum = bottomLeft + bottomRight
		local leftSum = topLeft + bottomLeft
		local rightSum = topRight + bottomRight
		if topSum > width and topSum > 0 then
			scale = min(scale, width / topSum)
		end
		if bottomSum > width and bottomSum > 0 then
			scale = min(scale, width / bottomSum)
		end
		if leftSum > height and leftSum > 0 then
			scale = min(scale, height / leftSum)
		end
		if rightSum > height and rightSum > 0 then
			scale = min(scale, height / rightSum)
		end
		if scale < 1 then
			topLeft = topLeft * scale
			topRight = topRight * scale
			bottomRight = bottomRight * scale
			bottomLeft = bottomLeft * scale
		end
		return topLeft,
			topRight,
			bottomRight,
			bottomLeft,
			topLeft > RECT_EPSILON or topRight > RECT_EPSILON or bottomRight > RECT_EPSILON or bottomLeft > RECT_EPSILON
	end

	local function Rect_AddPoint(points, x, y)
		local previous = points[#points]
		if previous ~= nil and abs(previous.x - x) < RECT_EPSILON and abs(previous.y - y) < RECT_EPSILON then
			return
		end
		points[#points + 1] = { x = x, y = y }
	end

	local function Rect_AddCornerPoints(points, centerX, centerY, radius, startAngle, endAngle, fallbackX, fallbackY)
		if radius <= RECT_EPSILON then
			Rect_AddPoint(points, fallbackX, fallbackY)
			return
		end
		local segmentCount = R_resolveArcSegmentCount(endAngle - startAngle, radius, 0)
		for segmentIndex = 0, segmentCount do
			local t = segmentIndex / segmentCount
			local angle = (startAngle + (endAngle - startAngle) * t)
			Rect_AddPoint(points, centerX + cos(angle) * radius, centerY + sin(angle) * radius)
		end
	end

	local function Rect_BuildRoundedRectPoints(width, height, topLeft, topRight, bottomRight, bottomLeft)
		local points = {}
		Rect_AddCornerPoints(points, topLeft, topLeft, topLeft, 3.141592653589793, 3.141592653589793 * 1.5, 0, 0)
		Rect_AddCornerPoints(
			points,
			width - topRight,
			topRight,
			topRight,
			3.141592653589793 * 1.5,
			3.141592653589793 * 2,
			width,
			0
		)
		Rect_AddCornerPoints(
			points,
			width - bottomRight,
			height - bottomRight,
			bottomRight,
			0,
			3.141592653589793 * 0.5,
			width,
			height
		)
		Rect_AddCornerPoints(
			points,
			bottomLeft,
			height - bottomLeft,
			bottomLeft,
			3.141592653589793 * 0.5,
			3.141592653589793,
			0,
			height
		)
		local first = points[1]
		local last = points[#points]
		if
			first ~= nil
			and last ~= nil
			and abs(first.x - last.x) < RECT_EPSILON
			and abs(first.y - last.y) < RECT_EPSILON
		then
			points[#points] = nil
		end
		return points
	end

	local function Rect_DrawLocalTriFill(
		affine,
		sx,
		sy,
		invWidth,
		invHeight,
		ax,
		ay,
		bx,
		by,
		cx,
		cy,
		fillProcedure,
		flatMaterialIndex,
		flatTone
	)
		local sax, say = Rect_LocalPoint(affine, sx, sy, ax, ay)
		local sbx, sby = Rect_LocalPoint(affine, sx, sy, bx, by)
		local scx, scy = Rect_LocalPoint(affine, sx, sy, cx, cy)
		if flatMaterialIndex ~= nil then
			R_tri2D(sax, say, sbx, sby, scx, scy, flatMaterialIndex, flatTone)
			R_noteTrianglesRendered(1)
			return
		end
		if fillProcedure == nil then
			return
		end
		R_tri2D_fn(sax, say, sbx, sby, scx, scy, function(screenX, screenY, b0, b1, b2)
			local localX = ax * b0 + bx * b1 + cx * b2
			local localY = ay * b0 + by * b1 + cy * b2
			return fillProcedure(localX * invWidth, localY * invHeight, screenX, screenY, localX, localY)
		end)
		R_noteTrianglesRendered(1)
	end

	local function Rect_DrawLocalQuadFill(
		affine,
		sx,
		sy,
		invWidth,
		invHeight,
		ax,
		ay,
		bx,
		by,
		cx,
		cy,
		dx,
		dy,
		fillProcedure,
		flatMaterialIndex,
		flatTone
	)
		if flatMaterialIndex ~= nil then
			local sax, say = Rect_LocalPoint(affine, sx, sy, ax, ay)
			local sbx, sby = Rect_LocalPoint(affine, sx, sy, bx, by)
			local scx, scy = Rect_LocalPoint(affine, sx, sy, cx, cy)
			local sdx, sdy = Rect_LocalPoint(affine, sx, sy, dx, dy)
			R_quad2D(sax, say, sbx, sby, scx, scy, sdx, sdy, flatMaterialIndex, flatTone)
			return
		end

		Rect_DrawLocalTriFill(affine, sx, sy, invWidth, invHeight, ax, ay, bx, by, cx, cy, fillProcedure, nil, nil)
		Rect_DrawLocalTriFill(affine, sx, sy, invWidth, invHeight, ax, ay, cx, cy, dx, dy, fillProcedure, nil, nil)
	end

	local function Rect_DrawLocalRectFill(
		affine,
		sx,
		sy,
		width,
		height,
		x0,
		y0,
		x1,
		y1,
		fillProcedure,
		flatMaterialIndex,
		flatTone
	)
		if x1 <= x0 or y1 <= y0 then
			return
		end
		if affine == nil then
			local screenX = sx + x0
			local screenY = sy + y0
			if flatMaterialIndex ~= nil then
				R_rect(screenX, screenY, x1 - x0, y1 - y0, flatMaterialIndex, flatTone)
				return
			end
			if fillProcedure == nil then
				return
			end
			local invWidth = width > 0 and 1 / width or 0
			local invHeight = height > 0 and 1 / height or 0
			R_rect_uv_fn(screenX, screenY, x1 - x0, y1 - y0, function(_, _, pixelX, pixelY, localX, localY)
				local rectLocalX = x0 + localX
				local rectLocalY = y0 + localY
				return fillProcedure(
					rectLocalX * invWidth,
					rectLocalY * invHeight,
					pixelX,
					pixelY,
					rectLocalX,
					rectLocalY
				)
			end)
			return
		end

		local invWidth = width > 0 and 1 / width or 0
		local invHeight = height > 0 and 1 / height or 0
		Rect_DrawLocalQuadFill(
			affine,
			sx,
			sy,
			invWidth,
			invHeight,
			x0,
			y0,
			x1,
			y0,
			x1,
			y1,
			x0,
			y1,
			fillProcedure,
			flatMaterialIndex,
			flatTone
		)
	end

	local function Rect_DrawRoundedFill(
		affine,
		sx,
		sy,
		width,
		height,
		topLeft,
		topRight,
		bottomRight,
		bottomLeft,
		fillProcedure,
		flatMaterialIndex,
		flatTone
	)
		local points = Rect_BuildRoundedRectPoints(width, height, topLeft, topRight, bottomRight, bottomLeft)
		local pointCount = #points
		if pointCount < 3 then
			return
		end
		local invWidth = width > 0 and 1 / width or 0
		local invHeight = height > 0 and 1 / height or 0
		local centerX = width * 0.5
		local centerY = height * 0.5
		for pointIndex = 1, pointCount do
			local a = points[pointIndex]
			local b = points[pointIndex < pointCount and pointIndex + 1 or 1]
			Rect_DrawLocalTriFill(
				affine,
				sx,
				sy,
				invWidth,
				invHeight,
				centerX,
				centerY,
				a.x,
				a.y,
				b.x,
				b.y,
				fillProcedure,
				flatMaterialIndex,
				flatTone
			)
		end
	end

	local function Rect_DrawFill(
		runtime,
		frameObject,
		sx,
		sy,
		width,
		height,
		affine,
		rounded,
		topLeft,
		topRight,
		bottomRight,
		bottomLeft,
		materialIndex
	)
		local fill = frameObject.fill
		if fill == nil then
			return
		end

		local flatMaterialIndex, flatTone = Demo_GetFlatFillMaterial(runtime, fill, materialIndex, frameObject.tone)
		if not rounded then
			if flatMaterialIndex ~= nil then
				Rect_DrawLocalRectFill(
					affine,
					sx,
					sy,
					width,
					height,
					0,
					0,
					width,
					height,
					nil,
					flatMaterialIndex,
					flatTone
				)
				return
			end
			if affine == nil and fill.type == "texture" then
				local texture = Demo_GetFillTexture(runtime, fill)
				if texture ~= nil then
					R_rect_tex(sx, sy, width, height, texture)
					return
				end
			end
		end

		local fillProcedure = flatMaterialIndex == nil and Demo_CreateFillProcedure(runtime, fill) or nil
		if flatMaterialIndex == nil and fillProcedure == nil then
			return
		end
		if rounded then
			Rect_DrawRoundedFill(
				affine,
				sx,
				sy,
				width,
				height,
				topLeft,
				topRight,
				bottomRight,
				bottomLeft,
				fillProcedure,
				flatMaterialIndex,
				flatTone
			)
			return
		end

		Rect_DrawLocalRectFill(affine, sx, sy, width, height, 0, 0, width, height, fillProcedure, nil, nil)
	end

	local function Rect_StrokeAlignmentOffsets(alignment, strokeWidth)
		if alignment == "outside" then
			return strokeWidth, 0
		end
		if alignment == "center" then
			local halfWidth = strokeWidth * 0.5
			return halfWidth, halfWidth
		end
		return 0, strokeWidth
	end

	local function Rect_StrokeBounds(width, height, strokeWidth, alignment)
		local outerExpansion, innerInset = Rect_StrokeAlignmentOffsets(alignment, strokeWidth)
		local outerX0 = -outerExpansion
		local outerY0 = -outerExpansion
		local outerX1 = width + outerExpansion
		local outerY1 = height + outerExpansion
		local innerX0 = innerInset
		local innerY0 = innerInset
		local innerX1 = width - innerInset
		local innerY1 = height - innerInset
		if innerX1 < innerX0 then
			local centerX = width * 0.5
			innerX0 = centerX
			innerX1 = centerX
		end
		if innerY1 < innerY0 then
			local centerY = height * 0.5
			innerY0 = centerY
			innerY1 = centerY
		end
		return outerX0, outerY0, outerX1, outerY1, innerX0, innerY0, innerX1, innerY1, outerExpansion, innerInset
	end

	local function Rect_DrawStrokeArc(
		affine,
		sx,
		sy,
		width,
		height,
		centerX,
		centerY,
		innerRadius,
		outerRadius,
		startAngle,
		fillProcedure,
		flatMaterialIndex,
		flatTone
	)
		if outerRadius <= RECT_EPSILON then
			return
		end
		local invWidth = width > 0 and 1 / width or 0
		local invHeight = height > 0 and 1 / height or 0
		local segmentCount = R_resolveArcSegmentCount(3.141592653589793 * 0.5, outerRadius, 0)
		local prevOuterX = centerX + cos(startAngle) * outerRadius
		local prevOuterY = centerY + sin(startAngle) * outerRadius
		local prevInnerX = centerX + cos(startAngle) * innerRadius
		local prevInnerY = centerY + sin(startAngle) * innerRadius
		for segmentIndex = 1, segmentCount do
			local angle = startAngle + (3.141592653589793 * 0.5) * segmentIndex / segmentCount
			local nextOuterX = centerX + cos(angle) * outerRadius
			local nextOuterY = centerY + sin(angle) * outerRadius
			local nextInnerX = centerX + cos(angle) * innerRadius
			local nextInnerY = centerY + sin(angle) * innerRadius
			if innerRadius <= RECT_EPSILON then
				Rect_DrawLocalTriFill(
					affine,
					sx,
					sy,
					invWidth,
					invHeight,
					prevOuterX,
					prevOuterY,
					nextOuterX,
					nextOuterY,
					centerX,
					centerY,
					fillProcedure,
					flatMaterialIndex,
					flatTone
				)
			else
				Rect_DrawLocalQuadFill(
					affine,
					sx,
					sy,
					invWidth,
					invHeight,
					prevOuterX,
					prevOuterY,
					nextOuterX,
					nextOuterY,
					nextInnerX,
					nextInnerY,
					prevInnerX,
					prevInnerY,
					fillProcedure,
					flatMaterialIndex,
					flatTone
				)
			end
			prevOuterX = nextOuterX
			prevOuterY = nextOuterY
			prevInnerX = nextInnerX
			prevInnerY = nextInnerY
		end
	end

	local function Rect_DrawStroke(
		runtime,
		frameObject,
		sx,
		sy,
		width,
		height,
		affine,
		topLeft,
		topRight,
		bottomRight,
		bottomLeft,
		materialIndex
	)
		if frameObject.strokeEnabled ~= true then
			return
		end
		local strokeWidth = max(0, SafeFloat(frameObject.strokeWidth, 0))
		if strokeWidth <= 0 then
			return
		end
		local edgeTop = frameObject.edgeTop ~= false
		local edgeRight = frameObject.edgeRight ~= false
		local edgeBottom = frameObject.edgeBottom ~= false
		local edgeLeft = frameObject.edgeLeft ~= false
		if not (edgeTop or edgeRight or edgeBottom or edgeLeft) then
			return
		end

		local strokeFill = frameObject.strokeFill
		local flatMaterialIndex, flatTone =
			Demo_GetFlatFillMaterial(runtime, strokeFill, materialIndex, frameObject.tone)
		local fillProcedure = flatMaterialIndex == nil and Demo_CreateFillProcedure(runtime, strokeFill) or nil
		if flatMaterialIndex == nil and fillProcedure == nil then
			return
		end

		local alignment = frameObject.strokeAlignment or "inside"
		if alignment ~= "center" and alignment ~= "outside" then
			alignment = "inside"
		end
		local outerX0, outerY0, outerX1, outerY1, innerX0, innerY0, innerX1, innerY1, outerExpansion, innerInset =
			Rect_StrokeBounds(width, height, strokeWidth, alignment)

		local roundTopLeft = topLeft > RECT_EPSILON and edgeTop and edgeLeft
		local roundTopRight = topRight > RECT_EPSILON and edgeTop and edgeRight
		local roundBottomRight = bottomRight > RECT_EPSILON and edgeBottom and edgeRight
		local roundBottomLeft = bottomLeft > RECT_EPSILON and edgeBottom and edgeLeft

		local topX0 = roundTopLeft and topLeft or outerX0
		local topX1 = roundTopRight and (width - topRight) or outerX1
		local bottomX0 = roundBottomLeft and bottomLeft or outerX0
		local bottomX1 = roundBottomRight and (width - bottomRight) or outerX1
		local leftY0 = roundTopLeft and topLeft or (edgeTop and innerY0 or outerY0)
		local leftY1 = roundBottomLeft and (height - bottomLeft) or (edgeBottom and innerY1 or outerY1)
		local rightY0 = roundTopRight and topRight or (edgeTop and innerY0 or outerY0)
		local rightY1 = roundBottomRight and (height - bottomRight) or (edgeBottom and innerY1 or outerY1)

		if edgeTop then
			Rect_DrawLocalRectFill(
				affine,
				sx,
				sy,
				width,
				height,
				topX0,
				outerY0,
				topX1,
				innerY0,
				fillProcedure,
				flatMaterialIndex,
				flatTone
			)
		end
		if edgeBottom then
			Rect_DrawLocalRectFill(
				affine,
				sx,
				sy,
				width,
				height,
				bottomX0,
				innerY1,
				bottomX1,
				outerY1,
				fillProcedure,
				flatMaterialIndex,
				flatTone
			)
		end
		if edgeLeft then
			Rect_DrawLocalRectFill(
				affine,
				sx,
				sy,
				width,
				height,
				outerX0,
				leftY0,
				innerX0,
				leftY1,
				fillProcedure,
				flatMaterialIndex,
				flatTone
			)
		end
		if edgeRight then
			Rect_DrawLocalRectFill(
				affine,
				sx,
				sy,
				width,
				height,
				innerX1,
				rightY0,
				outerX1,
				rightY1,
				fillProcedure,
				flatMaterialIndex,
				flatTone
			)
		end

		if roundTopLeft then
			Rect_DrawStrokeArc(
				affine,
				sx,
				sy,
				width,
				height,
				topLeft,
				topLeft,
				max(0, topLeft - innerInset),
				topLeft + outerExpansion,
				3.141592653589793,
				fillProcedure,
				flatMaterialIndex,
				flatTone
			)
		end
		if roundTopRight then
			Rect_DrawStrokeArc(
				affine,
				sx,
				sy,
				width,
				height,
				width - topRight,
				topRight,
				max(0, topRight - innerInset),
				topRight + outerExpansion,
				3.141592653589793 * 1.5,
				fillProcedure,
				flatMaterialIndex,
				flatTone
			)
		end
		if roundBottomRight then
			Rect_DrawStrokeArc(
				affine,
				sx,
				sy,
				width,
				height,
				width - bottomRight,
				height - bottomRight,
				max(0, bottomRight - innerInset),
				bottomRight + outerExpansion,
				0,
				fillProcedure,
				flatMaterialIndex,
				flatTone
			)
		end
		if roundBottomLeft then
			Rect_DrawStrokeArc(
				affine,
				sx,
				sy,
				width,
				height,
				bottomLeft,
				height - bottomLeft,
				max(0, bottomLeft - innerInset),
				bottomLeft + outerExpansion,
				3.141592653589793 * 0.5,
				fillProcedure,
				flatMaterialIndex,
				flatTone
			)
		end
	end

	function Demo_DrawRect(runtime, frameObject, renderContext, materialIndex)
		local size = frameObject.size
		local width = max(0, SafeFloat(size and size.x, 0))
		local height = max(0, SafeFloat(size and size.y, 0))
		if width <= 0 or height <= 0 then
			return
		end

		local sx, sy = Demo_ToPassScreenPoint(renderContext, frameObject.position.x, frameObject.position.y)
		local affine = nil
		if not R_isDefaultAffine2D(frameObject.angleDeg, frameObject.skewX, frameObject.skewY) then
			affine = Rect_BuildAffine(frameObject, sx, sy, width, height)
			if affine == nil then
				return
			end
		end

		local topLeft, topRight, bottomRight, bottomLeft, rounded =
			Rect_NormalizeCornerRadii(width, height, frameObject.cornerRadii)
		Rect_DrawFill(
			runtime,
			frameObject,
			sx,
			sy,
			width,
			height,
			affine,
			rounded,
			topLeft,
			topRight,
			bottomRight,
			bottomLeft,
			materialIndex
		)
		Rect_DrawStroke(
			runtime,
			frameObject,
			sx,
			sy,
			width,
			height,
			affine,
			topLeft,
			topRight,
			bottomRight,
			bottomLeft,
			materialIndex
		)
	end
end

local BOX_MESH = {
	bounds = {
		min = { x = -1, y = -1, z = -1 },
		max = { x = 1, y = 1, z = 1 },
	},
	vertices = {
		-- each vertex has x,y,z and nx,ny,nz (normal)
		-- flat shading doesn't require these normals.
		-- gourad shading requires per-vertex normals.
		{ x = -1, y = -1, z = -1, nx = -0.577, ny = -0.577, nz = -0.577 },
		{ x = 1, y = -1, z = -1, nx = 0.577, ny = -0.577, nz = -0.577 },
		{ x = 1, y = 1, z = -1, nx = 0.577, ny = 0.577, nz = -0.577 },
		{ x = -1, y = 1, z = -1, nx = -0.577, ny = 0.577, nz = -0.577 },
		{ x = -1, y = -1, z = 1, nx = -0.577, ny = -0.577, nz = 0.577 },
		{ x = 1, y = -1, z = 1, nx = 0.577, ny = -0.577, nz = 0.577 },
		{ x = 1, y = 1, z = 1, nx = 0.577, ny = 0.577, nz = 0.577 },
		{ x = -1, y = 1, z = 1, nx = -0.577, ny = 0.577, nz = 0.577 },
	},
	uvs = {
		{ u = 0, v = 0 },
		{ u = 1, v = 0 },
		{ u = 1, v = 1 },
		{ u = 0, v = 1 },
	},
	triangles = {
		{ 1, 4, 3, nil, uv1 = 1, uv2 = 4, uv3 = 3 },
		{ 1, 3, 2, nil, uv1 = 1, uv2 = 3, uv3 = 2 },
		{ 5, 6, 7, nil, uv1 = 1, uv2 = 2, uv3 = 3 },
		{ 5, 7, 8, nil, uv1 = 1, uv2 = 3, uv3 = 4 },
		{ 1, 5, 8, nil, uv1 = 1, uv2 = 2, uv3 = 3 },
		{ 1, 8, 4, nil, uv1 = 1, uv2 = 3, uv3 = 4 },
		{ 2, 3, 7, nil, uv1 = 1, uv2 = 4, uv3 = 3 },
		{ 2, 7, 6, nil, uv1 = 1, uv2 = 3, uv3 = 2 },
		{ 1, 2, 6, nil, uv1 = 1, uv2 = 2, uv3 = 3 },
		{ 1, 6, 5, nil, uv1 = 1, uv2 = 3, uv3 = 4 },
		{ 4, 8, 7, nil, uv1 = 1, uv2 = 2, uv3 = 3 },
		{ 4, 7, 3, nil, uv1 = 1, uv2 = 3, uv3 = 4 },
	},
}

for triangleIndex = 1, #BOX_MESH.triangles do
	local triangle = BOX_MESH.triangles[triangleIndex]
	local faceIndex = triangleIndex - 1
	local rootFaceIndex = faceIndex // 2
	triangle.rootFaceIndex = rootFaceIndex
	triangle.faceKey = tostring(rootFaceIndex)
end

--

function CylinderMesh_EnsureOutwardWinding(vertices, triangles)
	for triangleIndex = 1, #triangles do
		local triangle = triangles[triangleIndex]
		local a = vertices[triangle[1]]
		local b = vertices[triangle[2]]
		local c = vertices[triangle[3]]
		local abx = b.x - a.x
		local aby = b.y - a.y
		local abz = b.z - a.z
		local acx = c.x - a.x
		local acy = c.y - a.y
		local acz = c.z - a.z
		local normalX = aby * acz - abz * acy
		local normalY = abz * acx - abx * acz
		local normalZ = abx * acy - aby * acx
		local vertexNormalX, vertexNormalY, vertexNormalZ =
			Normalize3(a.nx + b.nx + c.nx, a.ny + b.ny + c.ny, a.nz + b.nz + c.nz)
		if (normalX * vertexNormalX + normalY * vertexNormalY + normalZ * vertexNormalZ) < 0 then
			triangle[2], triangle[3] = triangle[3], triangle[2]
			triangle.uv2, triangle.uv3 = triangle.uv3, triangle.uv2
		end
	end
end

function CylinderMesh_SetTriangleFaceMetadata(triangle, rootFaceIndex)
	triangle.rootFaceIndex = rootFaceIndex
	triangle.faceKey = tostring(rootFaceIndex)
end

function MakeCylinderMesh(radius1, radius2, height, segments)
	radius1 = max(0, radius1 or 1)
	radius2 = max(0, radius2 or 1) -- top
	height = max(0, height or 2)
	segments = max(3, (segments or 18) // 1)

	local vertices = {}
	local uvs = {}
	local triangles = {}
	local halfHeight = height * 0.5
	local sideBottom = {}
	local sideTop = {}
	local capBottom = {}
	local capTop = {}

	for segmentIndex = 0, segments do
		local u = segmentIndex / segments
		local angle = 6.283185307179586 * u
		local cosAngle = cos(angle)
		local sinAngle = sin(angle)
		local x1 = cosAngle * radius1
		local z1 = sinAngle * radius1
		local x2 = cosAngle * radius2
		local z2 = sinAngle * radius2

		sideBottom[segmentIndex + 1] = #vertices + 1
		vertices[#vertices + 1] = { x = x1, y = -halfHeight, z = z1, nx = cosAngle, ny = 0, nz = sinAngle }
		uvs[#uvs + 1] = { u = u, v = 1 }

		sideTop[segmentIndex + 1] = #vertices + 1
		vertices[#vertices + 1] = { x = x2, y = halfHeight, z = z2, nx = cosAngle, ny = 0, nz = sinAngle }
		uvs[#uvs + 1] = { u = u, v = 0 }
	end

	for segmentIndex = 0, segments - 1 do
		local u = segmentIndex / segments
		local angle = 6.283185307179586 * u
		local cosAngle = cos(angle)
		local sinAngle = sin(angle)
		local x1 = cosAngle * radius1
		local z1 = sinAngle * radius1
		local x2 = cosAngle * radius2
		local z2 = sinAngle * radius2
		local capU = 0.5 + cosAngle * 0.5
		local capV = 0.5 + sinAngle * 0.5

		capBottom[segmentIndex + 1] = #vertices + 1
		vertices[#vertices + 1] = { x = x1, y = -halfHeight, z = z1, nx = 0, ny = -1, nz = 0 }
		uvs[#uvs + 1] = { u = capU, v = capV }

		capTop[segmentIndex + 1] = #vertices + 1
		vertices[#vertices + 1] = { x = x2, y = halfHeight, z = z2, nx = 0, ny = 1, nz = 0 }
		uvs[#uvs + 1] = { u = capU, v = capV }
	end

	local bottomCenterIndex = #vertices + 1
	vertices[#vertices + 1] = { x = 0, y = -halfHeight, z = 0, nx = 0, ny = -1, nz = 0 }
	uvs[#uvs + 1] = { u = 0.5, v = 0.5 }

	local topCenterIndex = #vertices + 1
	vertices[#vertices + 1] = { x = 0, y = halfHeight, z = 0, nx = 0, ny = 1, nz = 0 }
	uvs[#uvs + 1] = { u = 0.5, v = 0.5 }

	for segmentIndex = 1, segments do
		local nextSegmentIndex = segmentIndex + 1
		local capNextSegmentIndex = segmentIndex % segments + 1
		local sideRootFaceIndex = segmentIndex - 1
		local topRootFaceIndex = segments
		local bottomRootFaceIndex = segments + 1

		local sideA = sideBottom[segmentIndex]
		local sideB = sideTop[segmentIndex]
		local sideC = sideTop[nextSegmentIndex]
		local sideD = sideBottom[nextSegmentIndex]
		local sideTri1 = { sideA, sideB, sideC, nil, uv1 = sideA, uv2 = sideB, uv3 = sideC }
		local sideTri2 = { sideA, sideC, sideD, nil, uv1 = sideA, uv2 = sideC, uv3 = sideD }
		CylinderMesh_SetTriangleFaceMetadata(sideTri1, sideRootFaceIndex)
		CylinderMesh_SetTriangleFaceMetadata(sideTri2, sideRootFaceIndex)
		triangles[#triangles + 1] = sideTri1
		triangles[#triangles + 1] = sideTri2

		local topA = capTop[segmentIndex]
		local topB = capTop[capNextSegmentIndex]
		local topTri = { topCenterIndex, topA, topB, nil, uv1 = topCenterIndex, uv2 = topA, uv3 = topB }
		CylinderMesh_SetTriangleFaceMetadata(topTri, topRootFaceIndex)
		triangles[#triangles + 1] = topTri

		local bottomA = capBottom[segmentIndex]
		local bottomB = capBottom[capNextSegmentIndex]
		local bottomTri =
			{ bottomCenterIndex, bottomB, bottomA, nil, uv1 = bottomCenterIndex, uv2 = bottomB, uv3 = bottomA }
		CylinderMesh_SetTriangleFaceMetadata(bottomTri, bottomRootFaceIndex)
		triangles[#triangles + 1] = bottomTri
	end

	CylinderMesh_EnsureOutwardWinding(vertices, triangles)

	local maxRadius = max(radius1, radius2)

	return {
		bounds = {
			min = { x = -maxRadius, y = -halfHeight, z = -maxRadius },
			max = { x = maxRadius, y = halfHeight, z = maxRadius },
		},
		vertices = vertices,
		uvs = uvs,
		triangles = triangles,
	}
end

function MakeConeMesh(radius1, height, segments)
	radius1 = max(0, radius1 or 1) -- bottom.
	-- top is a point.
	height = max(0, height or 2)
	segments = max(3, (segments or 18) // 1)

	local vertices = {}
	local uvs = {}
	local triangles = {}
	local halfHeight = height * 0.5
	local sideBottom = {} -- vertex indices for the bottom edge of the cone
	local capBottom = {}
	local topVertexIndex = #vertices + 1
	vertices[#vertices + 1] = { x = 0, y = halfHeight, z = 0, nx = 0, ny = 1, nz = 0 }
	uvs[#uvs + 1] = { u = 0.5, v = 0.5 }

	for segmentIndex = 0, segments do
		local u = segmentIndex / segments
		local angle = 6.283185307179586 * u
		local cosAngle = cos(angle)
		local sinAngle = sin(angle)
		local x1 = cosAngle * radius1
		local z1 = sinAngle * radius1

		sideBottom[segmentIndex + 1] = #vertices + 1
		vertices[#vertices + 1] = { x = x1, y = -halfHeight, z = z1, nx = cosAngle, ny = 0, nz = sinAngle }
		uvs[#uvs + 1] = { u = u, v = 1 }
	end

	for segmentIndex = 0, segments - 1 do
		local u = segmentIndex / segments
		local angle = 6.283185307179586 * u
		local cosAngle = cos(angle)
		local sinAngle = sin(angle)
		local x1 = cosAngle * radius1
		local z1 = sinAngle * radius1
		local capU = 0.5 + cosAngle * 0.5
		local capV = 0.5 + sinAngle * 0.5

		capBottom[segmentIndex + 1] = #vertices + 1
		vertices[#vertices + 1] = { x = x1, y = -halfHeight, z = z1, nx = 0, ny = -1, nz = 0 }
		uvs[#uvs + 1] = { u = capU, v = capV }
	end

	local bottomCenterIndex = #vertices + 1
	vertices[#vertices + 1] = { x = 0, y = -halfHeight, z = 0, nx = 0, ny = -1, nz = 0 }
	uvs[#uvs + 1] = { u = 0.5, v = 0.5 }

	for segmentIndex = 1, segments do
		local nextSegmentIndex = segmentIndex + 1
		local capNextSegmentIndex = segmentIndex % segments + 1
		local sideRootFaceIndex = segmentIndex - 1
		local bottomRootFaceIndex = segments

		local sideA = sideBottom[segmentIndex]
		local sideB = topVertexIndex
		local sideC = sideBottom[nextSegmentIndex]
		local sideTri = { sideA, sideB, sideC, nil, uv1 = sideA, uv2 = sideB, uv3 = sideC }
		CylinderMesh_SetTriangleFaceMetadata(sideTri, sideRootFaceIndex)
		triangles[#triangles + 1] = sideTri

		local bottomA = capBottom[segmentIndex]
		local bottomB = capBottom[capNextSegmentIndex]
		local bottomTri =
			{ bottomCenterIndex, bottomB, bottomA, nil, uv1 = bottomCenterIndex, uv2 = bottomB, uv3 = bottomA }
		CylinderMesh_SetTriangleFaceMetadata(bottomTri, bottomRootFaceIndex)
		triangles[#triangles + 1] = bottomTri
	end

	CylinderMesh_EnsureOutwardWinding(vertices, triangles)

	return {
		bounds = {
			min = { x = -radius1, y = -halfHeight, z = -radius1 },
			max = { x = radius1, y = halfHeight, z = radius1 },
		},
		vertices = vertices,
		uvs = uvs,
		triangles = triangles,
	}
end

function MakeTorusMesh(majorRadius, tubeRadius, majorSegments, tubeSegments)
	majorRadius = max(0, majorRadius or 1.25)
	tubeRadius = max(0, tubeRadius or 0.38)
	majorSegments = max(3, (majorSegments or 18) // 1)
	tubeSegments = max(3, (tubeSegments or 10) // 1)

	local vertices = {}
	local uvs = {}
	local triangles = {}

	for majorIndex = 0, majorSegments - 1 do
		local u = majorIndex / majorSegments
		local angleU = u * 6.283185307179586
		local cosU = cos(angleU)
		local sinU = sin(angleU)

		for tubeIndex = 0, tubeSegments - 1 do
			local v = tubeIndex / tubeSegments
			local angleV = v * 6.283185307179586
			local cosV = cos(angleV)
			local sinV = sin(angleV)
			local ringRadius = majorRadius + tubeRadius * cosV
			local x = cosU * ringRadius
			local y = tubeRadius * sinV
			local z = sinU * ringRadius
			local nx, ny, nz = Normalize3(cosU * cosV, sinV, sinU * cosV)

			vertices[#vertices + 1] = {
				x = x,
				y = y,
				z = z,
				nx = nx,
				ny = ny,
				nz = nz,
			}
			uvs[#uvs + 1] = { u = u, v = v }
		end
	end

	for majorIndex = 0, majorSegments - 1 do
		local nextMajorIndex = (majorIndex + 1) % majorSegments
		for tubeIndex = 0, tubeSegments - 1 do
			local nextTubeIndex = (tubeIndex + 1) % tubeSegments
			local rootFaceIndex = majorIndex * tubeSegments + tubeIndex
			local a = majorIndex * tubeSegments + tubeIndex + 1
			local b = nextMajorIndex * tubeSegments + tubeIndex + 1
			local c = nextMajorIndex * tubeSegments + nextTubeIndex + 1
			local d = majorIndex * tubeSegments + nextTubeIndex + 1
			local tri1 = { a, d, c, nil, uv1 = a, uv2 = d, uv3 = c }
			local tri2 = { a, c, b, nil, uv1 = a, uv2 = c, uv3 = b }
			CylinderMesh_SetTriangleFaceMetadata(tri1, rootFaceIndex)
			CylinderMesh_SetTriangleFaceMetadata(tri2, rootFaceIndex)
			triangles[#triangles + 1] = tri1
			triangles[#triangles + 1] = tri2
		end
	end

	CylinderMesh_EnsureOutwardWinding(vertices, triangles)

	return {
		vertices = vertices,
		uvs = uvs,
		triangles = triangles,
	}
end

--local TORUS_MESH = MakeTorusMesh(1.25, 0.38, 18, 10)

--

function CylinderMesh_EnsureOutwardWinding(vertices, triangles)
	for triangleIndex = 1, #triangles do
		local triangle = triangles[triangleIndex]
		local a = vertices[triangle[1]]
		local b = vertices[triangle[2]]
		local c = vertices[triangle[3]]
		local abx = b.x - a.x
		local aby = b.y - a.y
		local abz = b.z - a.z
		local acx = c.x - a.x
		local acy = c.y - a.y
		local acz = c.z - a.z
		local normalX = aby * acz - abz * acy
		local normalY = abz * acx - abx * acz
		local normalZ = abx * acy - aby * acx
		local vertexNormalX, vertexNormalY, vertexNormalZ =
			Normalize3(a.nx + b.nx + c.nx, a.ny + b.ny + c.ny, a.nz + b.nz + c.nz)
		if (normalX * vertexNormalX + normalY * vertexNormalY + normalZ * vertexNormalZ) < 0 then
			triangle[2], triangle[3] = triangle[3], triangle[2]
			triangle.uv2, triangle.uv3 = triangle.uv3, triangle.uv2
		end
	end
end

function CylinderMesh_SetTriangleFaceMetadata(triangle, rootFaceIndex)
	triangle.rootFaceIndex = rootFaceIndex
	triangle.faceKey = tostring(rootFaceIndex)
end

function MakeCylinderMesh(radius1, radius2, height, segments)
	radius1 = max(0, radius1 or 1)
	radius2 = max(0, radius2 or 1) -- top
	height = max(0, height or 2)
	segments = max(3, (segments or 18) // 1)

	local vertices = {}
	local uvs = {}
	local triangles = {}
	local halfHeight = height * 0.5
	local sideBottom = {}
	local sideTop = {}
	local capBottom = {}
	local capTop = {}

	for segmentIndex = 0, segments do
		local u = segmentIndex / segments
		local angle = 6.283185307179586 * u
		local cosAngle = cos(angle)
		local sinAngle = sin(angle)
		local x1 = cosAngle * radius1
		local z1 = sinAngle * radius1
		local x2 = cosAngle * radius2
		local z2 = sinAngle * radius2

		sideBottom[segmentIndex + 1] = #vertices + 1
		vertices[#vertices + 1] = { x = x1, y = -halfHeight, z = z1, nx = cosAngle, ny = 0, nz = sinAngle }
		uvs[#uvs + 1] = { u = u, v = 1 }

		sideTop[segmentIndex + 1] = #vertices + 1
		vertices[#vertices + 1] = { x = x2, y = halfHeight, z = z2, nx = cosAngle, ny = 0, nz = sinAngle }
		uvs[#uvs + 1] = { u = u, v = 0 }
	end

	for segmentIndex = 0, segments - 1 do
		local u = segmentIndex / segments
		local angle = 6.283185307179586 * u
		local cosAngle = cos(angle)
		local sinAngle = sin(angle)
		local x1 = cosAngle * radius1
		local z1 = sinAngle * radius1
		local x2 = cosAngle * radius2
		local z2 = sinAngle * radius2
		local capU = 0.5 + cosAngle * 0.5
		local capV = 0.5 + sinAngle * 0.5

		capBottom[segmentIndex + 1] = #vertices + 1
		vertices[#vertices + 1] = { x = x1, y = -halfHeight, z = z1, nx = 0, ny = -1, nz = 0 }
		uvs[#uvs + 1] = { u = capU, v = capV }

		capTop[segmentIndex + 1] = #vertices + 1
		vertices[#vertices + 1] = { x = x2, y = halfHeight, z = z2, nx = 0, ny = 1, nz = 0 }
		uvs[#uvs + 1] = { u = capU, v = capV }
	end

	local bottomCenterIndex = #vertices + 1
	vertices[#vertices + 1] = { x = 0, y = -halfHeight, z = 0, nx = 0, ny = -1, nz = 0 }
	uvs[#uvs + 1] = { u = 0.5, v = 0.5 }

	local topCenterIndex = #vertices + 1
	vertices[#vertices + 1] = { x = 0, y = halfHeight, z = 0, nx = 0, ny = 1, nz = 0 }
	uvs[#uvs + 1] = { u = 0.5, v = 0.5 }

	for segmentIndex = 1, segments do
		local nextSegmentIndex = segmentIndex + 1
		local capNextSegmentIndex = segmentIndex % segments + 1
		local sideRootFaceIndex = segmentIndex - 1
		local topRootFaceIndex = segments
		local bottomRootFaceIndex = segments + 1

		local sideA = sideBottom[segmentIndex]
		local sideB = sideTop[segmentIndex]
		local sideC = sideTop[nextSegmentIndex]
		local sideD = sideBottom[nextSegmentIndex]
		local sideTri1 = { sideA, sideB, sideC, nil, uv1 = sideA, uv2 = sideB, uv3 = sideC }
		local sideTri2 = { sideA, sideC, sideD, nil, uv1 = sideA, uv2 = sideC, uv3 = sideD }
		CylinderMesh_SetTriangleFaceMetadata(sideTri1, sideRootFaceIndex)
		CylinderMesh_SetTriangleFaceMetadata(sideTri2, sideRootFaceIndex)
		triangles[#triangles + 1] = sideTri1
		triangles[#triangles + 1] = sideTri2

		local topA = capTop[segmentIndex]
		local topB = capTop[capNextSegmentIndex]
		local topTri = { topCenterIndex, topA, topB, nil, uv1 = topCenterIndex, uv2 = topA, uv3 = topB }
		CylinderMesh_SetTriangleFaceMetadata(topTri, topRootFaceIndex)
		triangles[#triangles + 1] = topTri

		local bottomA = capBottom[segmentIndex]
		local bottomB = capBottom[capNextSegmentIndex]
		local bottomTri =
			{ bottomCenterIndex, bottomB, bottomA, nil, uv1 = bottomCenterIndex, uv2 = bottomB, uv3 = bottomA }
		CylinderMesh_SetTriangleFaceMetadata(bottomTri, bottomRootFaceIndex)
		triangles[#triangles + 1] = bottomTri
	end

	CylinderMesh_EnsureOutwardWinding(vertices, triangles)

	local maxRadius = max(radius1, radius2)

	return {
		bounds = {
			min = { x = -maxRadius, y = -halfHeight, z = -maxRadius },
			max = { x = maxRadius, y = halfHeight, z = maxRadius },
		},
		vertices = vertices,
		uvs = uvs,
		triangles = triangles,
	}
end

function MakeConeMesh(radius1, height, segments)
	radius1 = max(0, radius1 or 1) -- bottom.
	-- top is a point.
	height = max(0, height or 2)
	segments = max(3, (segments or 18) // 1)

	local vertices = {}
	local uvs = {}
	local triangles = {}
	local halfHeight = height * 0.5
	local sideBottom = {} -- vertex indices for the bottom edge of the cone
	local capBottom = {}
	local topVertexIndex = #vertices + 1
	vertices[#vertices + 1] = { x = 0, y = halfHeight, z = 0, nx = 0, ny = 1, nz = 0 }
	uvs[#uvs + 1] = { u = 0.5, v = 0.5 }

	for segmentIndex = 0, segments do
		local u = segmentIndex / segments
		local angle = 6.283185307179586 * u
		local cosAngle = cos(angle)
		local sinAngle = sin(angle)
		local x1 = cosAngle * radius1
		local z1 = sinAngle * radius1

		sideBottom[segmentIndex + 1] = #vertices + 1
		vertices[#vertices + 1] = { x = x1, y = -halfHeight, z = z1, nx = cosAngle, ny = 0, nz = sinAngle }
		uvs[#uvs + 1] = { u = u, v = 1 }
	end

	for segmentIndex = 0, segments - 1 do
		local u = segmentIndex / segments
		local angle = 6.283185307179586 * u
		local cosAngle = cos(angle)
		local sinAngle = sin(angle)
		local x1 = cosAngle * radius1
		local z1 = sinAngle * radius1
		local capU = 0.5 + cosAngle * 0.5
		local capV = 0.5 + sinAngle * 0.5

		capBottom[segmentIndex + 1] = #vertices + 1
		vertices[#vertices + 1] = { x = x1, y = -halfHeight, z = z1, nx = 0, ny = -1, nz = 0 }
		uvs[#uvs + 1] = { u = capU, v = capV }
	end

	local bottomCenterIndex = #vertices + 1
	vertices[#vertices + 1] = { x = 0, y = -halfHeight, z = 0, nx = 0, ny = -1, nz = 0 }
	uvs[#uvs + 1] = { u = 0.5, v = 0.5 }

	for segmentIndex = 1, segments do
		local nextSegmentIndex = segmentIndex + 1
		local capNextSegmentIndex = segmentIndex % segments + 1
		local sideRootFaceIndex = segmentIndex - 1
		local bottomRootFaceIndex = segments

		local sideA = sideBottom[segmentIndex]
		local sideB = topVertexIndex
		local sideC = sideBottom[nextSegmentIndex]
		local sideTri = { sideA, sideB, sideC, nil, uv1 = sideA, uv2 = sideB, uv3 = sideC }
		CylinderMesh_SetTriangleFaceMetadata(sideTri, sideRootFaceIndex)
		triangles[#triangles + 1] = sideTri

		local bottomA = capBottom[segmentIndex]
		local bottomB = capBottom[capNextSegmentIndex]
		local bottomTri =
			{ bottomCenterIndex, bottomB, bottomA, nil, uv1 = bottomCenterIndex, uv2 = bottomB, uv3 = bottomA }
		CylinderMesh_SetTriangleFaceMetadata(bottomTri, bottomRootFaceIndex)
		triangles[#triangles + 1] = bottomTri
	end

	CylinderMesh_EnsureOutwardWinding(vertices, triangles)

	return {
		bounds = {
			min = { x = -radius1, y = -halfHeight, z = -radius1 },
			max = { x = radius1, y = halfHeight, z = radius1 },
		},
		vertices = vertices,
		uvs = uvs,
		triangles = triangles,
	}
end

--

function CylinderMesh_EnsureOutwardWinding(vertices, triangles)
	for triangleIndex = 1, #triangles do
		local triangle = triangles[triangleIndex]
		local a = vertices[triangle[1]]
		local b = vertices[triangle[2]]
		local c = vertices[triangle[3]]
		local abx = b.x - a.x
		local aby = b.y - a.y
		local abz = b.z - a.z
		local acx = c.x - a.x
		local acy = c.y - a.y
		local acz = c.z - a.z
		local normalX = aby * acz - abz * acy
		local normalY = abz * acx - abx * acz
		local normalZ = abx * acy - aby * acx
		local vertexNormalX, vertexNormalY, vertexNormalZ =
			Normalize3(a.nx + b.nx + c.nx, a.ny + b.ny + c.ny, a.nz + b.nz + c.nz)
		if (normalX * vertexNormalX + normalY * vertexNormalY + normalZ * vertexNormalZ) < 0 then
			triangle[2], triangle[3] = triangle[3], triangle[2]
			triangle.uv2, triangle.uv3 = triangle.uv3, triangle.uv2
		end
	end
end

function CylinderMesh_SetTriangleFaceMetadata(triangle, rootFaceIndex)
	triangle.rootFaceIndex = rootFaceIndex
	triangle.faceKey = tostring(rootFaceIndex)
end

function MakeCylinderMesh(radius1, radius2, height, segments)
	radius1 = max(0, radius1 or 1)
	radius2 = max(0, radius2 or 1) -- top
	height = max(0, height or 2)
	segments = max(3, (segments or 18) // 1)

	local vertices = {}
	local uvs = {}
	local triangles = {}
	local halfHeight = height * 0.5
	local sideBottom = {}
	local sideTop = {}
	local capBottom = {}
	local capTop = {}

	for segmentIndex = 0, segments do
		local u = segmentIndex / segments
		local angle = 6.283185307179586 * u
		local cosAngle = cos(angle)
		local sinAngle = sin(angle)
		local x1 = cosAngle * radius1
		local z1 = sinAngle * radius1
		local x2 = cosAngle * radius2
		local z2 = sinAngle * radius2

		sideBottom[segmentIndex + 1] = #vertices + 1
		vertices[#vertices + 1] = { x = x1, y = -halfHeight, z = z1, nx = cosAngle, ny = 0, nz = sinAngle }
		uvs[#uvs + 1] = { u = u, v = 1 }

		sideTop[segmentIndex + 1] = #vertices + 1
		vertices[#vertices + 1] = { x = x2, y = halfHeight, z = z2, nx = cosAngle, ny = 0, nz = sinAngle }
		uvs[#uvs + 1] = { u = u, v = 0 }
	end

	for segmentIndex = 0, segments - 1 do
		local u = segmentIndex / segments
		local angle = 6.283185307179586 * u
		local cosAngle = cos(angle)
		local sinAngle = sin(angle)
		local x1 = cosAngle * radius1
		local z1 = sinAngle * radius1
		local x2 = cosAngle * radius2
		local z2 = sinAngle * radius2
		local capU = 0.5 + cosAngle * 0.5
		local capV = 0.5 + sinAngle * 0.5

		capBottom[segmentIndex + 1] = #vertices + 1
		vertices[#vertices + 1] = { x = x1, y = -halfHeight, z = z1, nx = 0, ny = -1, nz = 0 }
		uvs[#uvs + 1] = { u = capU, v = capV }

		capTop[segmentIndex + 1] = #vertices + 1
		vertices[#vertices + 1] = { x = x2, y = halfHeight, z = z2, nx = 0, ny = 1, nz = 0 }
		uvs[#uvs + 1] = { u = capU, v = capV }
	end

	local bottomCenterIndex = #vertices + 1
	vertices[#vertices + 1] = { x = 0, y = -halfHeight, z = 0, nx = 0, ny = -1, nz = 0 }
	uvs[#uvs + 1] = { u = 0.5, v = 0.5 }

	local topCenterIndex = #vertices + 1
	vertices[#vertices + 1] = { x = 0, y = halfHeight, z = 0, nx = 0, ny = 1, nz = 0 }
	uvs[#uvs + 1] = { u = 0.5, v = 0.5 }

	for segmentIndex = 1, segments do
		local nextSegmentIndex = segmentIndex + 1
		local capNextSegmentIndex = segmentIndex % segments + 1
		local sideRootFaceIndex = segmentIndex - 1
		local topRootFaceIndex = segments
		local bottomRootFaceIndex = segments + 1

		local sideA = sideBottom[segmentIndex]
		local sideB = sideTop[segmentIndex]
		local sideC = sideTop[nextSegmentIndex]
		local sideD = sideBottom[nextSegmentIndex]
		local sideTri1 = { sideA, sideB, sideC, nil, uv1 = sideA, uv2 = sideB, uv3 = sideC }
		local sideTri2 = { sideA, sideC, sideD, nil, uv1 = sideA, uv2 = sideC, uv3 = sideD }
		CylinderMesh_SetTriangleFaceMetadata(sideTri1, sideRootFaceIndex)
		CylinderMesh_SetTriangleFaceMetadata(sideTri2, sideRootFaceIndex)
		triangles[#triangles + 1] = sideTri1
		triangles[#triangles + 1] = sideTri2

		local topA = capTop[segmentIndex]
		local topB = capTop[capNextSegmentIndex]
		local topTri = { topCenterIndex, topA, topB, nil, uv1 = topCenterIndex, uv2 = topA, uv3 = topB }
		CylinderMesh_SetTriangleFaceMetadata(topTri, topRootFaceIndex)
		triangles[#triangles + 1] = topTri

		local bottomA = capBottom[segmentIndex]
		local bottomB = capBottom[capNextSegmentIndex]
		local bottomTri =
			{ bottomCenterIndex, bottomB, bottomA, nil, uv1 = bottomCenterIndex, uv2 = bottomB, uv3 = bottomA }
		CylinderMesh_SetTriangleFaceMetadata(bottomTri, bottomRootFaceIndex)
		triangles[#triangles + 1] = bottomTri
	end

	CylinderMesh_EnsureOutwardWinding(vertices, triangles)

	local maxRadius = max(radius1, radius2)

	return {
		bounds = {
			min = { x = -maxRadius, y = -halfHeight, z = -maxRadius },
			max = { x = maxRadius, y = halfHeight, z = maxRadius },
		},
		vertices = vertices,
		uvs = uvs,
		triangles = triangles,
	}
end

function MakeConeMesh(radius1, height, segments)
	radius1 = max(0, radius1 or 1) -- bottom.
	-- top is a point.
	height = max(0, height or 2)
	segments = max(3, (segments or 18) // 1)

	local vertices = {}
	local uvs = {}
	local triangles = {}
	local halfHeight = height * 0.5
	local sideBottom = {} -- vertex indices for the bottom edge of the cone
	local capBottom = {}
	local topVertexIndex = #vertices + 1
	vertices[#vertices + 1] = { x = 0, y = halfHeight, z = 0, nx = 0, ny = 1, nz = 0 }
	uvs[#uvs + 1] = { u = 0.5, v = 0.5 }

	for segmentIndex = 0, segments do
		local u = segmentIndex / segments
		local angle = 6.283185307179586 * u
		local cosAngle = cos(angle)
		local sinAngle = sin(angle)
		local x1 = cosAngle * radius1
		local z1 = sinAngle * radius1

		sideBottom[segmentIndex + 1] = #vertices + 1
		vertices[#vertices + 1] = { x = x1, y = -halfHeight, z = z1, nx = cosAngle, ny = 0, nz = sinAngle }
		uvs[#uvs + 1] = { u = u, v = 1 }
	end

	for segmentIndex = 0, segments - 1 do
		local u = segmentIndex / segments
		local angle = 6.283185307179586 * u
		local cosAngle = cos(angle)
		local sinAngle = sin(angle)
		local x1 = cosAngle * radius1
		local z1 = sinAngle * radius1
		local capU = 0.5 + cosAngle * 0.5
		local capV = 0.5 + sinAngle * 0.5

		capBottom[segmentIndex + 1] = #vertices + 1
		vertices[#vertices + 1] = { x = x1, y = -halfHeight, z = z1, nx = 0, ny = -1, nz = 0 }
		uvs[#uvs + 1] = { u = capU, v = capV }
	end

	local bottomCenterIndex = #vertices + 1
	vertices[#vertices + 1] = { x = 0, y = -halfHeight, z = 0, nx = 0, ny = -1, nz = 0 }
	uvs[#uvs + 1] = { u = 0.5, v = 0.5 }

	for segmentIndex = 1, segments do
		local nextSegmentIndex = segmentIndex + 1
		local capNextSegmentIndex = segmentIndex % segments + 1
		local sideRootFaceIndex = segmentIndex - 1
		local bottomRootFaceIndex = segments

		local sideA = sideBottom[segmentIndex]
		local sideB = topVertexIndex
		local sideC = sideBottom[nextSegmentIndex]
		local sideTri = { sideA, sideB, sideC, nil, uv1 = sideA, uv2 = sideB, uv3 = sideC }
		CylinderMesh_SetTriangleFaceMetadata(sideTri, sideRootFaceIndex)
		triangles[#triangles + 1] = sideTri

		local bottomA = capBottom[segmentIndex]
		local bottomB = capBottom[capNextSegmentIndex]
		local bottomTri =
			{ bottomCenterIndex, bottomB, bottomA, nil, uv1 = bottomCenterIndex, uv2 = bottomB, uv3 = bottomA }
		CylinderMesh_SetTriangleFaceMetadata(bottomTri, bottomRootFaceIndex)
		triangles[#triangles + 1] = bottomTri
	end

	CylinderMesh_EnsureOutwardWinding(vertices, triangles)

	return {
		bounds = {
			min = { x = -radius1, y = -halfHeight, z = -radius1 },
			max = { x = radius1, y = halfHeight, z = radius1 },
		},
		vertices = vertices,
		uvs = uvs,
		triangles = triangles,
	}
end

-- note: no UV support.

function GeoSphereMesh_AddVertex(vertices, x, y, z, radius)
	local nx, ny, nz = Normalize3(x, y, z)
	vertices[#vertices + 1] = {
		x = nx * radius,
		y = ny * radius,
		z = nz * radius,
		nx = nx,
		ny = ny,
		nz = nz,
	}
	return #vertices
end

function GeoSphereMesh_CreateBase(radius)
	local phi = (1 + sqrt(5)) * 0.5
	local vertices = {}
	GeoSphereMesh_AddVertex(vertices, -1, phi, 0, radius)
	GeoSphereMesh_AddVertex(vertices, 1, phi, 0, radius)
	GeoSphereMesh_AddVertex(vertices, -1, -phi, 0, radius)
	GeoSphereMesh_AddVertex(vertices, 1, -phi, 0, radius)
	GeoSphereMesh_AddVertex(vertices, 0, -1, phi, radius)
	GeoSphereMesh_AddVertex(vertices, 0, 1, phi, radius)
	GeoSphereMesh_AddVertex(vertices, 0, -1, -phi, radius)
	GeoSphereMesh_AddVertex(vertices, 0, 1, -phi, radius)
	GeoSphereMesh_AddVertex(vertices, phi, 0, -1, radius)
	GeoSphereMesh_AddVertex(vertices, phi, 0, 1, radius)
	GeoSphereMesh_AddVertex(vertices, -phi, 0, -1, radius)
	GeoSphereMesh_AddVertex(vertices, -phi, 0, 1, radius)

	local triangles = {
		{ 1, 12, 6 },
		{ 1, 6, 2 },
		{ 1, 2, 8 },
		{ 1, 8, 11 },
		{ 1, 11, 12 },
		{ 2, 6, 10 },
		{ 6, 12, 5 },
		{ 12, 11, 3 },
		{ 11, 8, 7 },
		{ 8, 2, 9 },
		{ 4, 10, 5 },
		{ 4, 5, 3 },
		{ 4, 3, 7 },
		{ 4, 7, 9 },
		{ 4, 9, 10 },
		{ 5, 10, 6 },
		{ 3, 5, 12 },
		{ 7, 3, 11 },
		{ 9, 7, 8 },
		{ 10, 9, 2 },
	}
	for triangleIndex = 1, #triangles do
		local rootFaceIndex = triangleIndex - 1
		local triangle = triangles[triangleIndex]
		triangle.rootFaceIndex = rootFaceIndex
		triangle.faceKey = tostring(rootFaceIndex)
	end

	return vertices, triangles
end

function GeoSphereMesh_GetMidpoint(vertices, midpointCache, i1, i2, radius)
	local low = min(i1, i2)
	local high = max(i1, i2)
	local key = low .. ":" .. high
	local midpointIndex = midpointCache[key]
	if midpointIndex ~= nil then
		return midpointIndex
	end

	local a = vertices[low]
	local b = vertices[high]
	midpointIndex = GeoSphereMesh_AddVertex(vertices, a.x + b.x, a.y + b.y, a.z + b.z, radius)
	midpointCache[key] = midpointIndex
	return midpointIndex
end

function MakeGeoSphereMesh(radius, subdivisions)
	radius = max(0, radius or 1.5)
	subdivisions = (
		((subdivisions or 1) // 1) < 0 and 0 or (((subdivisions or 1) // 1) > 5 and 5 or ((subdivisions or 1) // 1))
	)

	local vertices, triangles = GeoSphereMesh_CreateBase(radius)

	for _ = 1, subdivisions do
		local midpointCache = {}
		local nextTriangles = {}
		for triangleIndex = 1, #triangles do
			local triangle = triangles[triangleIndex]
			local i1 = triangle[1]
			local i2 = triangle[2]
			local i3 = triangle[3]
			local rootFaceIndex = triangle.rootFaceIndex or (triangleIndex - 1)
			local faceKey = triangle.faceKey or tostring(rootFaceIndex)
			local a = GeoSphereMesh_GetMidpoint(vertices, midpointCache, i1, i2, radius)
			local b = GeoSphereMesh_GetMidpoint(vertices, midpointCache, i2, i3, radius)
			local c = GeoSphereMesh_GetMidpoint(vertices, midpointCache, i3, i1, radius)

			nextTriangles[#nextTriangles + 1] = { i1, a, c, rootFaceIndex = rootFaceIndex, faceKey = faceKey .. ".0" }
			nextTriangles[#nextTriangles + 1] = { i2, b, a, rootFaceIndex = rootFaceIndex, faceKey = faceKey .. ".1" }
			nextTriangles[#nextTriangles + 1] = { i3, c, b, rootFaceIndex = rootFaceIndex, faceKey = faceKey .. ".2" }
			nextTriangles[#nextTriangles + 1] = { a, b, c, rootFaceIndex = rootFaceIndex, faceKey = faceKey .. ".3" }
		end
		triangles = nextTriangles
	end

	CylinderMesh_EnsureOutwardWinding(vertices, triangles)

	return {
		vertices = vertices,
		triangles = triangles,
	}
end

-- A finite plane segment centered at the origin, lying in local XZ with +Y as its front normal.

function MakePlaneMesh(subdivisionsX, subdivisionsZ, doubleSided)
	subdivisionsX = (
		((subdivisionsX or 1) // 1) < 1 and 1
		or (((subdivisionsX or 1) // 1) > 32 and 32 or ((subdivisionsX or 1) // 1))
	)
	subdivisionsZ = (
		((subdivisionsZ or 1) // 1) < 1 and 1
		or (((subdivisionsZ or 1) // 1) > 32 and 32 or ((subdivisionsZ or 1) // 1))
	)

	local vertices = {}
	local uvs = {}
	local triangles = {}
	local rowWidth = subdivisionsX + 1
	local cellCount = subdivisionsX * subdivisionsZ

	local function AddTriangle(a, b, c, rootFaceIndex, uv1, uv2, uv3)
		local triangle = { a, b, c, nil, uv1 = uv1, uv2 = uv2, uv3 = uv3 }
		triangle.rootFaceIndex = rootFaceIndex
		triangle.faceKey = tostring(rootFaceIndex)
		triangles[#triangles + 1] = triangle
	end

	local function AddSurface(normalY, surfaceIndex)
		local firstVertex = #vertices + 1
		for zIndex = 0, subdivisionsZ do
			local v = zIndex / subdivisionsZ
			local z = v * 2 - 1
			for xIndex = 0, subdivisionsX do
				local u = xIndex / subdivisionsX
				local x = u * 2 - 1
				vertices[#vertices + 1] = { x = x, y = 0, z = z, nx = 0, ny = normalY, nz = 0 }
				uvs[#uvs + 1] = { u = u, v = v }
			end
		end

		for zIndex = 0, subdivisionsZ - 1 do
			for xIndex = 0, subdivisionsX - 1 do
				local rootFaceIndex = surfaceIndex * cellCount + zIndex * subdivisionsX + xIndex
				local a = firstVertex + zIndex * rowWidth + xIndex
				local b = a + 1
				local d = a + rowWidth
				local c = d + 1
				if normalY > 0 then
					AddTriangle(a, d, c, rootFaceIndex, a, d, c)
					AddTriangle(a, c, b, rootFaceIndex, a, c, b)
				else
					AddTriangle(a, c, d, rootFaceIndex, a, c, d)
					AddTriangle(a, b, c, rootFaceIndex, a, b, c)
				end
			end
		end
	end

	AddSurface(1, 0)
	if doubleSided then
		AddSurface(-1, 1)
	end

	return {
		bounds = {
			min = { x = -1, y = 0, z = -1 },
			max = { x = 1, y = 0, z = 1 },
		},
		vertices = vertices,
		uvs = uvs,
		triangles = triangles,
	}
end

do
	function Demo_NewFrameMetrics()
		return {
			nodesEvaluated = 0,
			dynamicMaterialsUsed = 0,
			staticMaterialsUsed = 0,
			trianglesRendered = 0,
		}
	end

	-- load a static project def "scene", returns the runtime representation.
	-- called when project loads (eventually hot reload)
	-- a scene is the stuff that the viewport sees.
	-- Camera and object membership are graph inputs; the scene runtime only owns
	-- the realized renderer state.
	function Demo_LoadScene(sceneDef)
		return {
			def = sceneDef,
			state = Scene_new(),
		}
	end

	function Demo_NewFrameScene(sceneRuntime, metrics)
		return {
			id = sceneRuntime.id,
			runtime = sceneRuntime,
			objects = {},
			objectsById = {},
			metrics = metrics or Demo_NewFrameMetrics(),
		}
	end

	function Demo_AddFrameSceneObject(frameScene, frameObject)
		if frameObject.visible == nil then
			frameObject.visible = true
		end
		frameScene.objects[#frameScene.objects + 1] = frameObject
		frameScene.objectsById[frameObject.id] = frameObject
	end

	function Demo_GetFrameSceneObject(frameScene, objectId)
		if frameScene == nil or (type(objectId) ~= "string" or objectId == "") then
			return nil
		end
		return frameScene.objectsById[objectId]
	end

	function Demo_HideFrameSceneObject(frameScene, objectId)
		local frameObject = Demo_GetFrameSceneObject(frameScene, objectId)
		if frameObject ~= nil then
			frameObject.visible = false
		end
	end

	function Demo_CloneFrameObjectTable(value)
		if type(value) ~= "table" then
			return value
		end
		return CloneTable(value)
	end

	function Demo_CloneFrameSceneObject(frameObject, newId)
		-- TODO: various scene objects should feel like plugins so they can handle this themselves.
		-- as-is, we need to support all types of objects here.
		local clone = Demo_CloneFrameObjectTable(frameObject)
		clone.id = newId or clone.id
		clone.transform = Demo_CloneFrameObjectTable(frameObject.transform)
		clone.position = Demo_CloneFrameObjectTable(frameObject.position)
		clone.rotation = Demo_CloneFrameObjectTable(frameObject.rotation)
		clone.scale = Demo_CloneFrameObjectTable(frameObject.scale)
		clone.geometry = Demo_CloneFrameObjectTable(frameObject.geometry)
		clone.localBounds = Demo_CloneFrameObjectTable(frameObject.localBounds)
		clone.size = Demo_CloneFrameObjectTable(frameObject.size)
		clone.measuredSize = Demo_CloneFrameObjectTable(frameObject.measuredSize)
		clone.fill = Demo_CloneFrameObjectTable(frameObject.fill)
		clone.meshFaceStyles = Demo_CloneFrameObjectTable(frameObject.meshFaceStyles)
		clone.lineStart = Demo_CloneFrameObjectTable(frameObject.lineStart)
		clone.lineEnd = Demo_CloneFrameObjectTable(frameObject.lineEnd)
		clone.fields = Demo_CloneFrameObjectTable(frameObject.fields)
		clone.instance = Demo_CloneFrameObjectTable(frameObject.instance)
		clone.viewport = Demo_CloneFrameObjectTable(frameObject.viewport)
		if frameObject.children ~= nil then
			clone.children = {}
			for i = 1, #frameObject.children do
				local child = frameObject.children[i]
				local childId = newId ~= nil and (newId .. ":" .. tostring(child.id or i)) or nil
				clone.children[i] = Demo_CloneFrameSceneObject(child, childId)
			end
		end
		if clone.instance ~= nil then
			clone.instance.fields = Demo_CloneFrameObjectTable(frameObject.instance and frameObject.instance.fields)
			if clone.fields == nil then
				clone.fields = clone.instance.fields
			elseif clone.instance.fields == nil then
				clone.instance.fields = clone.fields
			end
		end
		return clone
	end

	function Demo_FrameObjectOrigin(frameObject)
		-- TODO: various scene objects should feel like plugins so they can handle this themselves.
		-- as-is, we need to support all types of objects here.
		if frameObject.position ~= nil then
			return SafeVec3(frameObject.position)
		end
		if frameObject.transform ~= nil then
			return SafeVec3(frameObject.transform)
		end
		if frameObject.lineStart ~= nil and frameObject.lineEnd ~= nil then
			return {
				x = (frameObject.lineStart.x + frameObject.lineEnd.x) * 0.5,
				y = (frameObject.lineStart.y + frameObject.lineEnd.y) * 0.5,
				z = (SafeFloat(frameObject.lineStart.z) + SafeFloat(frameObject.lineEnd.z)) * 0.5,
			}
		end
		return nil
	end

	function Demo_FrameObjectHasAffine2D(frameObject)
		return frameObject.anchorXNorm ~= nil
			or frameObject.anchorYNorm ~= nil
			or frameObject.angleDeg ~= nil
			or frameObject.skewX ~= nil
			or frameObject.skewY ~= nil
	end

	function Demo_FrameObjectAffine2D(frameObject)
		return {
			anchorXNorm = frameObject.anchorXNorm or 0,
			anchorYNorm = frameObject.anchorYNorm or 0,
			angleDeg = frameObject.angleDeg or 0,
			skewX = frameObject.skewX or 0,
			skewY = frameObject.skewY or 0,
		}
	end

	function Demo_FrameObjectAffinePoint(frameObject, localX, localY)
		local pos = frameObject.position or {}
		local size = frameObject.size or {}
		local anchorXNorm = frameObject.anchorXNorm or 0
		local anchorYNorm = frameObject.anchorYNorm or 0
		local width = size.x or 0
		local height = size.y or 0
		local pivotLocalX = width * anchorXNorm
		local pivotLocalY = height * anchorYNorm
		local pivotX = (pos.x or 0) + pivotLocalX
		local pivotY = (pos.y or 0) + pivotLocalY
		local angle = ((frameObject.angleDeg or 0) * (3.141592653589793 / 180))
		local cosA = cos(angle)
		local sinA = sin(angle)
		local lx = localX - pivotLocalX
		local ly = localY - pivotLocalY
		local shearedX = lx + (frameObject.skewX or 0) * ly
		local shearedY = ly + (frameObject.skewY or 0) * lx
		return {
			x = pivotX + cosA * shearedX - sinA * shearedY,
			y = pivotY + sinA * shearedX + cosA * shearedY,
		}
	end

	function Demo_FrameTextSize(frameObject)
		if frameObject.measuredSize == nil then
			return nil
		end
		return {
			x = frameObject.measuredSize.x or 0,
			y = frameObject.measuredSize.y or 0,
		}
	end

	function Demo_FrameTextCenter(frameObject)
		local size = Demo_FrameTextSize(frameObject)
		if size == nil then
			return Demo_FrameObjectOrigin(frameObject)
		end
		local sizeFrameObject = {
			position = frameObject.position,
			size = size,
			anchorXNorm = frameObject.anchorXNorm,
			anchorYNorm = frameObject.anchorYNorm,
			angleDeg = frameObject.angleDeg,
			skewX = frameObject.skewX,
			skewY = frameObject.skewY,
		}
		return Demo_FrameObjectAffinePoint(sizeFrameObject, size.x * 0.5, size.y * 0.5)
	end

	function Demo_FrameObjectSize2D(frameObject)
		if frameObject.size ~= nil then
			return { x = frameObject.size.x or 0, y = frameObject.size.y or 0 }
		end
		if frameObject.type == "text2D" then
			return Demo_FrameTextSize(frameObject)
		end
		return nil
	end

	function Demo_MeshGeometryCacheKey(geometry)
		if geometry.type == "torus" then
			return table.concat({
				"torus",
				tostring(geometry.majorRadius),
				tostring(geometry.tubeRadius),
				tostring(geometry.majorSegments),
				tostring(geometry.tubeSegments),
			}, ":")
		end
		if geometry.type == "cylinder" then
			return table.concat({
				"cylinder",
				tostring(geometry.radius1),
				tostring(geometry.radius2),
				tostring(geometry.height),
				tostring(geometry.segments),
			}, ":")
		end
		if geometry.type == "cone" then
			return table.concat({
				"cone",
				tostring(geometry.radius),
				tostring(geometry.height),
				tostring(geometry.segments),
			}, ":")
		end
		if geometry.type == "geoSphere" then
			return table.concat({ "geoSphere", tostring(geometry.radius), tostring(geometry.subdivisions) }, ":")
		end
		if geometry.type == "plane" then
			return table.concat({
				"plane",
				tostring(geometry.subdivisionsX),
				tostring(geometry.subdivisionsZ),
				tostring(geometry.doubleSided == true),
			}, ":")
		end
		return nil
	end

	function Demo_ResolveMeshGeometry(runtime, geometry, geometryCache)
		if geometry == nil then
			return nil
		end
		if geometry.type == "asset" then
			return runtime.meshes[geometry.meshId]
		end
		if geometry.type == "cube" then
			return BOX_MESH
		end
		local cacheKey = Demo_MeshGeometryCacheKey(geometry)
		if cacheKey ~= nil and geometryCache[cacheKey] ~= nil then
			return geometryCache[cacheKey]
		end
		local mesh = nil
		if geometry.type == "torus" then
			mesh =
				MakeTorusMesh(geometry.majorRadius, geometry.tubeRadius, geometry.majorSegments, geometry.tubeSegments)
		elseif geometry.type == "cylinder" then
			mesh = MakeCylinderMesh(geometry.radius1, geometry.radius2, geometry.height, geometry.segments)
		elseif geometry.type == "cone" then
			mesh = MakeConeMesh(geometry.radius, geometry.height, geometry.segments)
		elseif geometry.type == "geoSphere" then
			mesh = MakeGeoSphereMesh(geometry.radius, geometry.subdivisions)
		elseif geometry.type == "plane" then
			mesh = MakePlaneMesh(geometry.subdivisionsX, geometry.subdivisionsZ, geometry.doubleSided)
		end
		if cacheKey ~= nil then
			geometryCache[cacheKey] = mesh
		end
		return mesh
	end

	function Demo_AddUsedMaterialId(usedMaterialIdSet, materialId)
		if type(materialId) == "string" and materialId ~= "" then
			usedMaterialIdSet[materialId] = true
		end
	end

	function Demo_AddUsedMaterialIds(usedMaterialIdSet, materialIds)
		for _, materialId in ipairs(materialIds or {}) do
			Demo_AddUsedMaterialId(usedMaterialIdSet, materialId)
		end
	end

	function Demo_AddUsedTextureMaterials(usedMaterialIdSet, texture)
		Demo_AddUsedMaterialIds(usedMaterialIdSet, texture and texture.referencedMaterialIds)
	end

	function Demo_AddUsedFillMaterials(usedMaterialIdSet, fill)
		Demo_AddUsedMaterialIds(usedMaterialIdSet, fill and fill.referencedMaterialIds)
	end

	function Demo_AddUsedMeshFaceStyleMaterials(usedMaterialIdSet, faceStyles)
		for _, style in pairs(faceStyles or {}) do
			if style ~= nil then
				Demo_AddUsedMaterialId(usedMaterialIdSet, style.materialId)
				Demo_AddUsedFillMaterials(usedMaterialIdSet, style.fill)
			end
		end
	end

	function Demo_AddUsedTextMaterials(runtime, usedMaterialIdSet, frameObject)
		if frameObject.fill ~= nil then
			Demo_AddUsedFillMaterials(usedMaterialIdSet, frameObject.fill)
			return
		end
		local font = runtime.fonts[frameObject.fontId]
		local textureType = frameObject.textureType or (font and font.displayAtlas and "texture" or nil)
		if textureType == "texture" then
			Demo_AddUsedTextureMaterials(usedMaterialIdSet, font and font.displayAtlas)
		elseif textureType == "flat" or textureType == "hgrad" or textureType == "vgrad" then
			Demo_AddUsedMaterialId(usedMaterialIdSet, frameObject.materialId)
		end
	end

	function Demo_AddUsedFrameObjectMaterials(runtime, usedMaterialIdSet, frameObject, geometryCache)
		if frameObject.visible == false then
			return
		end

		local kind = frameObject.type
		if kind == "objectGroup" then
			local children = frameObject.children or {}
			for i = 1, #children do
				Demo_AddUsedFrameObjectMaterials(runtime, usedMaterialIdSet, children[i], geometryCache)
			end
			return
		end
		if kind == "mesh3d" then
			if frameObject.wireframe then
				if type(frameObject.materialId) == "string" and frameObject.materialId ~= "" then
					Demo_AddUsedMaterialId(usedMaterialIdSet, frameObject.materialId)
				else
					Demo_AddUsedMaterialId(usedMaterialIdSet, runtime.materialConfig.defaultStaticMaterialId)
				end
				return
			end
			Demo_AddUsedMeshFaceStyleMaterials(usedMaterialIdSet, frameObject.meshFaceStyles)
			if frameObject.fill ~= nil then
				Demo_AddUsedFillMaterials(usedMaterialIdSet, frameObject.fill)
				return
			end
			local texture = frameObject.textureId ~= nil and runtime.textures[frameObject.textureId] or nil
			if texture ~= nil then
				Demo_AddUsedTextureMaterials(usedMaterialIdSet, texture)
				return
			end
			if type(frameObject.materialId) == "string" and frameObject.materialId ~= "" then
				Demo_AddUsedMaterialId(usedMaterialIdSet, frameObject.materialId)
				return
			end
			local mesh = Demo_ResolveMeshGeometry(runtime, frameObject.geometry, geometryCache)
			Demo_AddUsedMaterialIds(usedMaterialIdSet, mesh and mesh.referencedMaterialIds)
			return
		end

		if kind == "text2D" or kind == "textGlyph2D" then
			Demo_AddUsedTextMaterials(runtime, usedMaterialIdSet, frameObject)
			return
		end

		if kind == "pathStroke2D" then
			Demo_AddUsedFillMaterials(usedMaterialIdSet, frameObject.fill)
			Demo_AddUsedFillMaterials(usedMaterialIdSet, frameObject.backFill)
			Demo_AddUsedMaterialId(usedMaterialIdSet, frameObject.materialId)
			return
		end

		if kind == "rect" then
			Demo_AddUsedFillMaterials(usedMaterialIdSet, frameObject.fill)
			Demo_AddUsedFillMaterials(usedMaterialIdSet, frameObject.strokeFill)
			if frameObject.fill == nil and frameObject.strokeFill == nil then
				Demo_AddUsedMaterialId(usedMaterialIdSet, frameObject.materialId)
			end
			return
		end

		if frameObject.fill ~= nil then
			Demo_AddUsedFillMaterials(usedMaterialIdSet, frameObject.fill)
			return
		end

		Demo_AddUsedMaterialId(usedMaterialIdSet, frameObject.materialId)
	end

	function Demo_CollectFrameSceneMaterials(runtime, frameScene, usedMaterialIdSet)
		if frameScene == nil then
			return
		end
		local geometryCache = {}
		for i = 1, #frameScene.objects do
			Demo_AddUsedFrameObjectMaterials(runtime, usedMaterialIdSet, frameScene.objects[i], geometryCache)
		end
	end

	function Demo_GetFrameSceneObjectBounds(frameObject)
		if frameObject == nil then
			return nil
		end
		if frameObject.type == "mesh3d" and frameObject.localBounds ~= nil then
			return Demo_CloneFrameObjectTable(frameObject.localBounds)
		end
		if frameObject.type == "circle" then
			local radius = frameObject.radius or 0
			return { min = { x = -radius, y = -radius, z = 0 }, max = { x = radius, y = radius, z = 0 } }
		end
		if frameObject.type == "arcSegment2D" then
			local radius = frameObject.outerRadius or frameObject.radius or 0
			return { min = { x = -radius, y = -radius, z = 0 }, max = { x = radius, y = radius, z = 0 } }
		end
		if frameObject.type == "line" and frameObject.lineStart ~= nil and frameObject.lineEnd ~= nil then
			return {
				min = {
					x = min(frameObject.lineStart.x or 0, frameObject.lineEnd.x or 0),
					y = min(frameObject.lineStart.y or 0, frameObject.lineEnd.y or 0),
					z = min(frameObject.lineStart.z or 0, frameObject.lineEnd.z or 0),
				},
				max = {
					x = max(frameObject.lineStart.x or 0, frameObject.lineEnd.x or 0),
					y = max(frameObject.lineStart.y or 0, frameObject.lineEnd.y or 0),
					z = max(frameObject.lineStart.z or 0, frameObject.lineEnd.z or 0),
				},
			}
		end
		local size = Demo_FrameObjectSize2D(frameObject)
		if size ~= nil then
			return {
				min = { x = 0, y = 0, z = 0 }, --
				max = { x = size.x, y = size.y, z = 0 },
			}
		end
		return nil
	end

	function Demo_TransformFrameSceneObjectPoint(frameObject, point, effectiveRot)
		if frameObject == nil or point == nil then
			return nil
		end

		local transform = frameObject.type == "mesh3d" and Demo_GetFrameSceneObjectTransform(frameObject)
			or frameObject.transform
		if transform ~= nil then
			local rotX = effectiveRot ~= nil and (effectiveRot.x or 0) or (transform.rotX or 0)
			local rotY = effectiveRot ~= nil and (effectiveRot.y or 0) or (transform.rotY or 0)
			local rotZ = effectiveRot ~= nil and (effectiveRot.z or 0) or (transform.rotZ or 0)
			local x = (point.x or 0) * (transform.scaleX or 1)
			local y = (point.y or 0) * (transform.scaleY or 1)
			local z = (point.z or 0) * (transform.scaleZ or 1)
			x, y, z = Rotate3WithTrig(x, y, z, cos(rotX), sin(rotX), cos(rotY), sin(rotY), cos(rotZ), sin(rotZ))
			return {
				x = x + (transform.x or 0),
				y = y + (transform.y or 0),
				z = z + (transform.z or 0),
			}
		end

		if Demo_FrameObjectHasAffine2D(frameObject) and frameObject.position ~= nil then
			local size = Demo_FrameObjectSize2D(frameObject)
			if size ~= nil then
				local transformed = Demo_FrameObjectAffinePoint(frameObject, point.x or 0, point.y or 0)
				transformed.z = (frameObject.position.z or 0) + (point.z or 0)
				return transformed
			end
		end

		if frameObject.position ~= nil then
			return {
				x = (frameObject.position.x or 0) + (point.x or 0),
				y = (frameObject.position.y or 0) + (point.y or 0),
				z = (frameObject.position.z or 0) + (point.z or 0),
			}
		end

		return { x = point.x or 0, y = point.y or 0, z = point.z or 0 }
	end

	function Demo_GetFrameSceneObjectTransform(frameObject)
		if frameObject == nil then
			return nil
		end
		if frameObject.type == "mesh3d" then
			local position = SafeVec3(frameObject.position)
			local rotation = SafeVec3(frameObject.rotation)
			local scale = SafeVec3(frameObject.scale, { x = 1, y = 1, z = 1 })
			local scaleUniform = SafeFloat(frameObject.scaleUniform, 1)
			return {
				x = position.x,
				y = position.y,
				z = position.z,
				rotX = rotation.x,
				rotY = rotation.y,
				rotZ = rotation.z,
				scaleX = scale.x * scaleUniform,
				scaleY = scale.y * scaleUniform,
				scaleZ = scale.z * scaleUniform,
			}
		end
		if frameObject.transform ~= nil then
			local transform = frameObject.transform
			return {
				x = transform.x or 0,
				y = transform.y or 0,
				z = transform.z or 0,
				rotX = transform.rotX or 0,
				rotY = transform.rotY or 0,
				rotZ = transform.rotZ or 0,
				scaleX = transform.scaleX or 1,
				scaleY = transform.scaleY or 1,
				scaleZ = transform.scaleZ or 1,
			}
		end
		if frameObject.position ~= nil then
			local position = frameObject.position
			return {
				x = position.x or 0,
				y = position.y or 0,
				z = position.z or 0,
				rotX = 0,
				rotY = 0,
				rotZ = ((frameObject.angleDeg or 0) * (3.141592653589793 / 180)),
				scaleX = 1,
				scaleY = 1,
				scaleZ = 1,
			}
		end
		local origin = Demo_FrameObjectOrigin(frameObject) or {}
		return {
			x = origin.x or 0,
			y = origin.y or 0,
			z = origin.z or 0,
			rotX = 0,
			rotY = 0,
			rotZ = 0,
			scaleX = 1,
			scaleY = 1,
			scaleZ = 1,
		}
	end

	function Demo_SetFrameSceneObjectOrigin(frameObject, point)
		if frameObject == nil or point == nil then
			return
		end
		if frameObject.position ~= nil then
			frameObject.position.x = point.x
			frameObject.position.y = point.y
			frameObject.position.z = point.z
			return
		end
		if frameObject.transform ~= nil then
			frameObject.transform.x = point.x
			frameObject.transform.y = point.y
			frameObject.transform.z = point.z
		end
	end

	function Demo_ApplyFrameSceneObjectRotationFrom(frameObject, sourceFrameObject, effectiveRot)
		if frameObject == nil or sourceFrameObject == nil then
			return
		end
		local transform = sourceFrameObject.type == "mesh3d" and Demo_GetFrameSceneObjectTransform(sourceFrameObject)
			or sourceFrameObject.transform
		if transform ~= nil then
			local srcRotX = effectiveRot ~= nil and (effectiveRot.x or 0) or (transform.rotX or 0)
			local srcRotY = effectiveRot ~= nil and (effectiveRot.y or 0) or (transform.rotY or 0)
			local srcRotZ = effectiveRot ~= nil and (effectiveRot.z or 0) or (transform.rotZ or 0)
			if frameObject.rotation ~= nil then
				frameObject.rotation.x = SafeFloat(frameObject.rotation.x) + srcRotX
				frameObject.rotation.y = SafeFloat(frameObject.rotation.y) + srcRotY
				frameObject.rotation.z = SafeFloat(frameObject.rotation.z) + srcRotZ
			elseif frameObject.transform ~= nil then
				frameObject.transform.rotX = (frameObject.transform.rotX or 0) + srcRotX
				frameObject.transform.rotY = (frameObject.transform.rotY or 0) + srcRotY
				frameObject.transform.rotZ = (frameObject.transform.rotZ or 0) + srcRotZ
			elseif Demo_FrameObjectHasAffine2D(frameObject) then
				frameObject.angleDeg = (frameObject.angleDeg or 0) + (srcRotZ * (180 / 3.141592653589793))
			end
			return
		end
		if effectiveRot ~= nil then
			-- source has no transform but caller supplied an effective rotation directly
			local srcRotZ = effectiveRot.z or 0
			if frameObject.rotation ~= nil then
				frameObject.rotation.z = SafeFloat(frameObject.rotation.z) + srcRotZ
			elseif frameObject.transform ~= nil then
				frameObject.transform.rotZ = (frameObject.transform.rotZ or 0) + srcRotZ
			elseif Demo_FrameObjectHasAffine2D(frameObject) then
				frameObject.angleDeg = (frameObject.angleDeg or 0) + (srcRotZ * (180 / 3.141592653589793))
			end
			return
		end
		if Demo_FrameObjectHasAffine2D(sourceFrameObject) then
			local angleDeg = sourceFrameObject.angleDeg or 0
			if frameObject.rotation ~= nil then
				frameObject.rotation.z = SafeFloat(frameObject.rotation.z) + (angleDeg * (3.141592653589793 / 180))
			elseif frameObject.transform ~= nil then
				frameObject.transform.rotZ = (frameObject.transform.rotZ or 0) + (angleDeg * (3.141592653589793 / 180))
			elseif Demo_FrameObjectHasAffine2D(frameObject) then
				frameObject.angleDeg = (frameObject.angleDeg or 0) + angleDeg
			end
		end
	end

	function Demo_GetFrameSceneObjectCentroid(frameObject)
		if frameObject == nil then
			return nil
		end

		pointName = pointName or "center"
		if pointName == "origin" then
			return Demo_FrameObjectOrigin(frameObject)
		end
		if pointName ~= "center" and pointName ~= "centroid" then
			return nil
		end

		local kind = frameObject.type
		if
			kind == "circle" --
			or kind == "arcSegment2D"
			or kind == "line"
			or kind == "mesh3d"
			or kind == "text2D"
		then
			return Demo_FrameObjectOrigin(frameObject)
		end
		if frameObject.size ~= nil then
			return Demo_FrameObjectAffinePoint(
				frameObject,
				(frameObject.size.x or 0) * 0.5,
				(frameObject.size.y or 0) * 0.5
			)
		end

		return Demo_FrameObjectOrigin(frameObject)
	end

	function Demo_GetMeshFillSurfaceMaterialId(fill)
		if fill == nil or fill.type == "texture" then
			return nil
		end
		if fill.type == "masked" then
			return Demo_GetMeshFillSurfaceMaterialId(fill.source)
		end
		if fill.type == "checkered" then
			return (type(fill.materialAId) == "string" and fill.materialAId ~= "") and fill.materialAId
				or fill.materialBId
		end
		return fill.materialId
	end

	function Demo_CreateMeshFillFragmentShader(runtime, frameObject)
		local shadeProcedure = Demo_CreateFrameObjectFillProcedure(runtime, frameObject)
		if shadeProcedure == nil then
			return nil
		end
		return function(shaderContext, u, v, baseTone, sx, sy)
			local materialIndex, tone = shadeProcedure(u, v, sx, sy, u, v)
			if materialIndex == nil then
				return nil
			end
			return materialIndex, (tone or 0) * baseTone
		end
	end

	function Demo_RemapMeshFaceStyles(faceStyles, materialIndexById)
		local result = nil
		for faceKey, style in pairs(faceStyles or {}) do
			local materialIndex = style ~= nil
					and (type(style.materialId) == "string" and style.materialId ~= "")
					and materialIndexById[style.materialId]
				or nil
			if materialIndex ~= nil then
				result = result or {}
				result[tostring(faceKey)] = {
					materialIndex = materialIndex,
					tone = style.tone ~= nil and style.tone or 0,
				}
			end
		end
		return result
	end

	function Demo_RealizeMeshFrameObject(runtime, scene, frameObject, geometryCache)
		local mesh = Demo_ResolveMeshGeometry(runtime, frameObject.geometry, geometryCache)
		if mesh == nil then
			return
		end
		local materialIndexById = runtime.frameMaterialIndexById or runtime.materialIndexById
		local materialIndexStamp = runtime.frameMaterialIndexStamp
		local texture = frameObject.textureId ~= nil and runtime.textures[frameObject.textureId] or nil
		if texture ~= nil and texture.hasImage ~= true then
			texture = nil
		end
		local materialIndex = frameObject.materialId ~= nil and materialIndexById[frameObject.materialId] or nil
		local tone = frameObject.tone
		local fragmentShader = nil
		local fill = frameObject.fill
		if fill ~= nil and not frameObject.wireframe then
			texture = nil
			if fill.type == "texture" then
				texture = Demo_GetFillTexture(runtime, fill)
				materialIndex = nil
			elseif fill.type == "flat" then
				materialIndex, tone = Demo_GetFlatFillMaterial(runtime, fill, nil, nil)
			else
				fragmentShader = Demo_CreateMeshFillFragmentShader(runtime, frameObject)
				if fragmentShader ~= nil then
					local fillSurfaceMaterialId = Demo_GetMeshFillSurfaceMaterialId(fill)
					materialIndex = (type(fillSurfaceMaterialId) == "string" and fillSurfaceMaterialId ~= "")
							and materialIndexById[fillSurfaceMaterialId]
						or nil
				else
					materialIndex = nil
				end
				tone = 1
			end
		end
		Demo_RemapMeshMaterials(mesh, materialIndexById, materialIndexStamp)
		Demo_RemapTextureMaterials(texture, materialIndexById, materialIndexStamp)
		local faceStyleByKey = Demo_RemapMeshFaceStyles(frameObject.meshFaceStyles, materialIndexById)
		Scene_addObject(scene, {
			id = frameObject.id,
			transform = Demo_GetFrameSceneObjectTransform(frameObject),
			render = {
				kind = "mesh3d",
				mesh = mesh,
				shading = frameObject.shading,
				receiveFog = frameObject.receiveFog ~= false,
				textureOverrideActive = texture ~= nil,
				textureOverride = texture,
				materialIndex = materialIndex,
				tone = tone,
				fragmentShader = fragmentShader,
				faceStyleByKey = faceStyleByKey,
				wireframe = frameObject.wireframe,
			},
			visible = frameObject.visible,
		})
	end

	function Demo_ToPassScreenPoint(renderContext, x, y)
		return Scene_viewportToScreenPoint(renderContext, x, y)
	end

	function Demo_MergeSceneObjectDebugDisplay(a, b)
		if a == nil then
			return b
		end
		if b == nil then
			return a
		end
		return {
			outline = a.outline == true or b.outline == true,
			wireframe = a.wireframe == true or b.wireframe == true,
			anchor = a.anchor == true or b.anchor == true,
			hidden = a.hidden == true or b.hidden == true,
			enableDebugHud = a.enableDebugHud == true or b.enableDebugHud == true,
		}
	end

	function Demo_GetSceneObjectDebugDisplay(runtime, objectId, frameDebugDisplay)
		local editor = runtime.def and runtime.def.editor or nil
		local sceneObjects = editor and editor.sceneObjects or nil
		local objectEditor = sceneObjects and sceneObjects[objectId] or nil
		local debugDisplay =
			Demo_MergeSceneObjectDebugDisplay(frameDebugDisplay, objectEditor and objectEditor.debugDisplay or nil)
		local highlights = runtime.editorHighlights and runtime.editorHighlights.sceneObjects or nil
		local highlightDisplay = highlights and highlights[objectId] or nil
		return Demo_MergeSceneObjectDebugDisplay(debugDisplay, highlightDisplay)
	end

	function Demo_PathPolygonArea(vertices)
		local area = 0
		for i = 1, #vertices do
			local a = vertices[i]
			local b = vertices[i < #vertices and i + 1 or 1]
			area = area + a.x * b.y - b.x * a.y
		end
		return area * 0.5
	end

	function Demo_PathTriangleContainsPoint(a, b, c, p, ccw)
		local ab = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)
		local bc = (c.x - b.x) * (p.y - b.y) - (c.y - b.y) * (p.x - b.x)
		local ca = (a.x - c.x) * (p.y - c.y) - (a.y - c.y) * (p.x - c.x)
		if ccw then
			return ab >= -0.0001 and bc >= -0.0001 and ca >= -0.0001
		end
		return ab <= 0.0001 and bc <= 0.0001 and ca <= 0.0001
	end

	function Demo_PathIsEar(vertices, indices, prevIndex, earIndex, nextIndex, ccw)
		local a = vertices[prevIndex]
		local b = vertices[earIndex]
		local c = vertices[nextIndex]
		local cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
		if ccw and cross <= 0.0001 then
			return false
		end
		if not ccw and cross >= -0.0001 then
			return false
		end
		for i = 1, #indices do
			local testIndex = indices[i]
			if testIndex ~= prevIndex and testIndex ~= earIndex and testIndex ~= nextIndex then
				if Demo_PathTriangleContainsPoint(a, b, c, vertices[testIndex], ccw) then
					return false
				end
			end
		end
		return true
	end

	function Demo_TriangulatePathPolygon(vertices)
		local result = {}
		if #vertices < 3 then
			return result
		end
		local area = Demo_PathPolygonArea(vertices)
		if abs(area) <= 0.0001 then
			return result
		end
		local ccw = area > 0
		local indices = {}
		for i = 1, #vertices do
			indices[i] = i
		end
		local guard = #vertices * #vertices
		while #indices > 3 and guard > 0 do
			local clipped = false
			for i = 1, #indices do
				local prevIndex = indices[i > 1 and i - 1 or #indices]
				local earIndex = indices[i]
				local nextIndex = indices[i < #indices and i + 1 or 1]
				if Demo_PathIsEar(vertices, indices, prevIndex, earIndex, nextIndex, ccw) then
					result[#result + 1] = { prevIndex, earIndex, nextIndex }
					table.remove(indices, i)
					clipped = true
					break
				end
			end
			if not clipped then
				return {}
			end
			guard = guard - 1
		end
		if #indices == 3 then
			result[#result + 1] = { indices[1], indices[2], indices[3] }
		end
		return result
	end

	function Demo_DrawPathFill(runtime, frameObject, renderContext, materialIndex)
		local surface = frameObject.surface or {} -- see PathStroke2D for surface model
		local path = surface.path
		if path == nil or path.points == nil or #path.points < 3 then
			return
		end
		local bounds = path.bounds or {}
		local minX = SafeFloat(bounds.minX, bounds.x or 0)
		local minY = SafeFloat(bounds.minY, bounds.y or 0)
		local width = max(0, SafeFloat(bounds.width, 0))
		local height = max(0, SafeFloat(bounds.height, 0))
		local vertices = {}
		for i = 1, #path.points do
			local point = path.points[i]
			local position = point and point.position
			if position ~= nil then
				local sx, sy = Demo_ToPassScreenPoint(renderContext, position.x, position.y)
				vertices[#vertices + 1] = {
					x = sx,
					y = sy,
					localX = SafeFloat(position.x) - minX,
					localY = SafeFloat(position.y) - minY,
				}
			end
		end
		if #vertices > 3 then
			local first = vertices[1]
			local last = vertices[#vertices]
			if abs(first.x - last.x) <= 0.0001 and abs(first.y - last.y) <= 0.0001 then
				table.remove(vertices, #vertices)
			end
		end
		local triangles = Demo_TriangulatePathPolygon(vertices)
		if #triangles == 0 then
			return
		end

		local fill = frameObject.fill or surface.fill
		local flatMaterialIndex, flatTone = Demo_GetFlatFillMaterial(runtime, fill, materialIndex, frameObject.tone)
		if flatMaterialIndex ~= nil then
			for i = 1, #triangles do
				local tri = triangles[i]
				local a = vertices[tri[1]]
				local b = vertices[tri[2]]
				local c = vertices[tri[3]]
				R_tri2D(a.x, a.y, b.x, b.y, c.x, c.y, flatMaterialIndex, flatTone)
			end
			R_noteTrianglesRendered(#triangles)
			return
		end

		local shadeProcedure = Demo_CreateFillProcedure(runtime, fill)
		if shadeProcedure == nil then
			return
		end
		local invWidth = width > 0 and 1 / width or 0
		local invHeight = height > 0 and 1 / height or 0
		for i = 1, #triangles do
			local tri = triangles[i]
			local a = vertices[tri[1]]
			local b = vertices[tri[2]]
			local c = vertices[tri[3]]
			R_tri2D_fn(a.x, a.y, b.x, b.y, c.x, c.y, function(sx, sy, ba, bb, bc)
				local localX = a.localX * ba + b.localX * bb + c.localX * bc
				local localY = a.localY * ba + b.localY * bb + c.localY * bc
				return shadeProcedure(localX * invWidth, localY * invHeight, sx, sy, localX, localY)
			end)
		end
		R_noteTrianglesRendered(#triangles)
	end

	function Demo_CreatePathStrokeFillRenderer(runtime, fill, fallbackMaterialIndex, fallbackTone)
		local flatMaterialIndex, flatTone = Demo_GetFlatFillMaterial(runtime, fill, fallbackMaterialIndex, fallbackTone)
		if flatMaterialIndex ~= nil then
			return {
				materialIndex = flatMaterialIndex,
				tone = flatTone,
			}
		end

		local shadeProcedure = Demo_CreateFillProcedure(runtime, fill)
		if shadeProcedure == nil then
			return nil
		end

		return {
			shadeProcedure = shadeProcedure,
		}
	end

	function Demo_DrawPathStrokeTriangle(triangle, renderer, renderContext)
		local a = triangle.a
		local b = triangle.b
		local c = triangle.c
		local ax, ay = Demo_ToPassScreenPoint(renderContext, a.x, a.y)
		local bx, by = Demo_ToPassScreenPoint(renderContext, b.x, b.y)
		local cx, cy = Demo_ToPassScreenPoint(renderContext, c.x, c.y)

		if renderer.materialIndex ~= nil then
			R_tri2D(ax, ay, bx, by, cx, cy, renderer.materialIndex, renderer.tone)
			return
		end

		local shadeProcedure = renderer.shadeProcedure
		R_tri2D_fn(ax, ay, bx, by, cx, cy, function(sx, sy, ba, bb, bc)
			local u = a.u * ba + b.u * bb + c.u * bc
			local v = a.v * ba + b.v * bb + c.v * bc
			local localX = a.localX * ba + b.localX * bb + c.localX * bc
			local localY = a.localY * ba + b.localY * bb + c.localY * bc
			return shadeProcedure(u, v, sx, sy, localX, localY)
		end)
	end

	function Demo_DrawPathStroke(runtime, frameObject, renderContext, materialIndex)
		local surface = frameObject.surface -- see PathStroke2D for surface model
		local geometry = Demo_BuildPathStrokeGeometry(surface)
		if #geometry.triangles == 0 then
			return
		end

		local frontFill = frameObject.fill or (surface and surface.frontFill)
		local backFill = frameObject.backFill or (surface and surface.backFill) or frontFill
		local frontRenderer = Demo_CreatePathStrokeFillRenderer(runtime, frontFill, materialIndex, frameObject.tone)
		local backRenderer = Demo_CreatePathStrokeFillRenderer(runtime, backFill, materialIndex, frameObject.tone)
			or frontRenderer
		if frontRenderer == nil and backRenderer == nil then
			return
		end

		local trianglesRendered = 0
		for i = 1, #geometry.triangles do
			local triangle = geometry.triangles[i]
			local renderer = triangle.face == "back" and backRenderer or frontRenderer
			if renderer ~= nil then
				Demo_DrawPathStrokeTriangle(triangle, renderer, renderContext)
				trianglesRendered = trianglesRendered + 1
			end
		end
		R_noteTrianglesRendered(trianglesRendered)
	end

	function Demo_ApplyFillToTextOptions(runtime, frameObject, textOptions, shadeProcedure)
		local fill = frameObject.fill
		if fill == nil then
			return
		end
		local materialIndexById = runtime.frameMaterialIndexById or runtime.materialIndexById
		if fill.type == "flat" then
			textOptions.textureType = "flat"
			textOptions.materialIndex = (type(fill.materialId) == "string" and fill.materialId ~= "")
					and materialIndexById[fill.materialId]
				or nil
			textOptions.toneA = fill.tone or 0
			return
		end
		if fill.type == "linearGradient" and (fill.axis == nil or fill.axis == "x" or fill.axis == "y") then
			textOptions.textureType = fill.axis == "y" and "vgrad" or "hgrad"
			textOptions.materialIndex = (type(fill.materialId) == "string" and fill.materialId ~= "")
					and materialIndexById[fill.materialId]
				or nil
			textOptions.toneA = fill.toneA or 0
			textOptions.toneB = fill.toneB or 1
			return
		end
		if shadeProcedure ~= nil then
			textOptions.textureType = "fn"
			textOptions.fn = function(p)
				return shadeProcedure(p.u, p.v, p.x, p.y, p.x, p.y)
			end
		end
	end

	function Demo_DrawPrimitiveFrameObject(runtime, frameObject, renderContext, materialIndex)
		local kind = frameObject.type
		local shadeProcedure = Demo_CreateFrameObjectFillProcedure(runtime, frameObject)

		if kind == "text2D" then
			DEMO_ASSERT(false, "text2D not supported")
		end

		if kind == "textGlyph2D" then
			local font = runtime.fonts[frameObject.fontId]
			if font == nil then
				return
			end
			Demo_RemapTextureMaterials(
				font.displayAtlas,
				runtime.frameMaterialIndexById or runtime.materialIndexById,
				runtime.frameMaterialIndexStamp
			)
			local sx, sy = Demo_ToPassScreenPoint(renderContext, frameObject.position.x, frameObject.position.y)
			local viewportX = renderContext.viewportX or 0
			local viewportY = renderContext.viewportY or 0
			local clipX0 = max((frameObject.clipX0 or gClipRectX0) + viewportX, gClipRectX0)
			local clipX1 = min((frameObject.clipX1 or gClipRectX1) + viewportX, gClipRectX1)
			if clipX1 <= clipX0 then
				return
			end
			local gradientOffsetX = frameObject.position.x - (frameObject.layoutX or frameObject.position.x)
			local gradientOffsetY = frameObject.position.y - (frameObject.layoutY or frameObject.position.y)
			local glyphOptions = {
				textureType = frameObject.textureType,
				materialIndex = materialIndex,
				toneA = frameObject.toneA,
				toneB = frameObject.toneB,
				scaleX = frameObject.scaleX,
				scaleY = frameObject.scaleY,
				originIsGlyph = frameObject.originIsGlyph,
				clipX0 = clipX0,
				clipX1 = clipX1,
				clipLocalX0 = frameObject.clipLocalX0,
				clipLocalX1 = frameObject.clipLocalX1,
				glyphTextX = frameObject.glyphTextX,
				textX = (frameObject.textX or frameObject.position.x) + gradientOffsetX + viewportX,
				textY = (frameObject.textY or frameObject.position.y) + gradientOffsetY + viewportY,
				textW = frameObject.textW,
				textH = frameObject.textH,
				lineY = (frameObject.lineY or frameObject.position.y) + gradientOffsetY + viewportY,
				lineH = frameObject.lineH,
				gradientScope = frameObject.gradientScope,
			}
			Demo_ApplyFillToTextOptions(runtime, frameObject, glyphOptions, shadeProcedure)
			if R_isDefaultAffine2D(frameObject.angleDeg, frameObject.skewX, frameObject.skewY) then
				Font_DrawGlyphClipped(font, frameObject.codepoint, sx, sy, glyphOptions)
			else
				glyphOptions.anchorXNorm = frameObject.anchorXNorm
				glyphOptions.anchorYNorm = frameObject.anchorYNorm
				glyphOptions.angleDeg = frameObject.angleDeg
				glyphOptions.skewX = frameObject.skewX
				glyphOptions.skewY = frameObject.skewY
				Font_DrawGlyphAffineClipped(font, frameObject.codepoint, sx, sy, glyphOptions)
			end
			return
		end

		if kind == "rect" then
			Demo_DrawRect(runtime, frameObject, renderContext, materialIndex)
			return
		end

		if kind == "point2D" then
			local sx, sy = Demo_ToPassScreenPoint(renderContext, frameObject.position.x, frameObject.position.y)
			R_pix(((sx + 0.5) // 1), ((sy + 0.5) // 1), materialIndex, frameObject.tone)
			return
		end

		if kind == "point3D" then
			local position = frameObject.position or {}
			local x = SafeFloat(position.x)
			local y = SafeFloat(position.y)
			local z = SafeFloat(position.z)
			R_point3D(renderContext.camera, renderContext.viewport, x, y, z, materialIndex, frameObject.tone)
			return
		end

		if kind == "circle" then
			local sx, sy = Demo_ToPassScreenPoint(renderContext, frameObject.position.x, frameObject.position.y)
			if shadeProcedure == nil then
				if materialIndex == nil then
					return
				end
				shadeProcedure = function()
					return materialIndex, frameObject.tone
				end
			end
			local radius = SafeFloat(frameObject.radius, 0)
			local invDiameter = radius > 0 and 1 / (radius * 2) or 0
			R_circ_fn(sx, sy, radius, function(pixelX, pixelY, distanceSquared)
				local _ = distanceSquared
				local localX = pixelX + 0.5 - sx
				local localY = pixelY + 0.5 - sy
				return shadeProcedure(
					(localX + radius) * invDiameter,
					(localY + radius) * invDiameter,
					pixelX,
					pixelY,
					localX,
					localY
				)
			end)
			return
		end

		if kind == "arcSegment2D" then
			local sx, sy = Demo_ToPassScreenPoint(renderContext, frameObject.position.x, frameObject.position.y)
			local innerRadius = SafeFloat(frameObject.innerRadius, 0)
			local outerRadius = SafeFloat(frameObject.outerRadius, frameObject.radius or 1)
			local startAngleRad = ((SafeFloat(frameObject.startAngleDeg, 0)) * (3.141592653589793 / 180))
			local spanAngleRad = ((SafeFloat(frameObject.spanAngleDeg, 90)) * (3.141592653589793 / 180))
			local segments = SafeFloat(frameObject.segments, 0)
			if shadeProcedure ~= nil then
				R_arcSegment2D_fn(
					sx,
					sy,
					innerRadius,
					outerRadius,
					startAngleRad,
					spanAngleRad,
					segments,
					function(screenX, screenY, localX, localY, localAngle, localRadius, angle01, radius01)
						return shadeProcedure(
							angle01,
							radius01,
							screenX,
							screenY,
							localX,
							localY,
							localAngle,
							localRadius
						)
					end
				)
			else
				R_arcSegment2D(
					sx,
					sy,
					innerRadius,
					outerRadius,
					startAngleRad,
					spanAngleRad,
					segments,
					materialIndex,
					frameObject.tone
				)
			end
			return
		end

		if kind == "line" then
			local startX, startY =
				Demo_ToPassScreenPoint(renderContext, frameObject.lineStart.x, frameObject.lineStart.y)
			local endX, endY = Demo_ToPassScreenPoint(renderContext, frameObject.lineEnd.x, frameObject.lineEnd.y)
			R_line(startX, startY, endX, endY, materialIndex, frameObject.tone)
			return
		end

		if kind == "pathFill2D" then
			Demo_DrawPathFill(runtime, frameObject, renderContext, materialIndex)
			return
		end

		if kind == "pathStroke2D" then
			Demo_DrawPathStroke(runtime, frameObject, renderContext, materialIndex)
			return
		end
	end

	function Demo_DrawAffineRectDebugGuide(x, y, width, height, affine, debugDisplay)
		local guideAffine = R_buildAffine2D(
			x,
			y,
			width,
			height,
			affine.anchorXNorm,
			affine.anchorYNorm,
			affine.angleDeg,
			affine.skewX,
			affine.skewY
		)
		R_editorOverlayAffineRect(
			guideAffine,
			width,
			height,
			debugDisplay.wireframe == true,
			debugDisplay.anchor == true
		)
	end

	function Demo_DrawCircleDebugGuide(x, y, radius, debugDisplay)
		if debugDisplay.anchor == true then
			R_editorOverlayCrosshair(x, y, 4, 2)
		end
		if debugDisplay.wireframe ~= true then
			return
		end

		local segmentCount = 16
		local previousX = x + radius
		local previousY = y
		for i = 1, segmentCount do
			local angle = i * 6.283185307179586 / segmentCount
			local nextX = x + cos(angle) * radius
			local nextY = y + sin(angle) * radius
			R_editorOverlayLine(previousX, previousY, nextX, nextY, 1)
			previousX = nextX
			previousY = nextY
		end
	end

	function Demo_DrawArcSegmentDebugGuide(
		x,
		y,
		innerRadius,
		outerRadius,
		startAngleDeg,
		spanAngleDeg,
		segments,
		debugDisplay
	)
		if debugDisplay.anchor == true then
			R_editorOverlayCrosshair(x, y, 4, 2)
		end
		if debugDisplay.wireframe ~= true then
			return
		end

		innerRadius = max(0, innerRadius or 0)
		outerRadius = max(0, outerRadius or 0)
		if outerRadius < innerRadius then
			local tmp = outerRadius
			outerRadius = innerRadius
			innerRadius = tmp
		end
		local startAngleRad = ((startAngleDeg or 0) * (3.141592653589793 / 180))
		local spanAngleRad = ((spanAngleDeg or 0) * (3.141592653589793 / 180))
		local segmentCount = R_resolveArcSegmentCount(spanAngleRad, outerRadius, segments)
		if segmentCount <= 0 then
			return
		end

		local firstOuterX, firstOuterY = R_arcPoint(x, y, outerRadius, startAngleRad)
		local firstInnerX, firstInnerY = R_arcPoint(x, y, innerRadius, startAngleRad)
		local prevOuterX = firstOuterX
		local prevOuterY = firstOuterY
		local prevInnerX = firstInnerX
		local prevInnerY = firstInnerY
		local closesFullCircle = abs(abs(spanAngleRad) - 6.283185307179586) < 0.000001

		for segmentIndex = 1, segmentCount do
			local nextOuterX
			local nextOuterY
			local nextInnerX
			local nextInnerY
			if closesFullCircle and segmentIndex == segmentCount then
				nextOuterX = firstOuterX
				nextOuterY = firstOuterY
				nextInnerX = firstInnerX
				nextInnerY = firstInnerY
			else
				local angle = startAngleRad + spanAngleRad * segmentIndex / segmentCount
				nextOuterX, nextOuterY = R_arcPoint(x, y, outerRadius, angle)
				nextInnerX, nextInnerY = R_arcPoint(x, y, innerRadius, angle)
			end
			R_editorOverlayLine(prevOuterX, prevOuterY, nextOuterX, nextOuterY, 1)
			R_editorOverlayLine(prevInnerX, prevInnerY, nextInnerX, nextInnerY, 1)
			prevOuterX = nextOuterX
			prevOuterY = nextOuterY
			prevInnerX = nextInnerX
			prevInnerY = nextInnerY
		end

		if not closesFullCircle then
			R_editorOverlayLine(firstInnerX, firstInnerY, firstOuterX, firstOuterY, 1)
			R_editorOverlayLine(prevInnerX, prevInnerY, prevOuterX, prevOuterY, 1)
		end
	end

	function Demo_DrawPrimitiveDebugDisplay(runtime, frameObject, debugDisplay, renderContext)
		if debugDisplay == nil or (debugDisplay.anchor ~= true and debugDisplay.wireframe ~= true) then
			return
		end

		local kind = frameObject.type
		if kind == "rect" or kind == "textGlyph2D" then
			local affine = Demo_FrameObjectAffine2D(frameObject)
			local sx, sy = Demo_ToPassScreenPoint(renderContext, frameObject.position.x, frameObject.position.y)
			Demo_DrawAffineRectDebugGuide(sx, sy, frameObject.size.x, frameObject.size.y, affine, debugDisplay)
			return
		end

		if kind == "text2D" then
			if frameObject.scaleX == 0 or frameObject.scaleY == 0 then
				return
			end
			local font = runtime.fonts[frameObject.fontId]
			if font == nil then
				return
			end
			local image = Font_GetTextImage(font, frameObject.text, {
				multiline = frameObject.multiline,
			})
			local destWidth = frameObject.maxWidth or (max(0, image.width - frameObject.scrollX) * frameObject.scaleX)
			local destHeight = image.height * frameObject.scaleY
			local sx, sy = Demo_ToPassScreenPoint(renderContext, frameObject.position.x, frameObject.position.y)
			Demo_DrawAffineRectDebugGuide(
				sx,
				sy,
				destWidth,
				destHeight,
				Demo_FrameObjectAffine2D(frameObject),
				debugDisplay
			)
			return
		end

		if kind == "circle" then
			local sx, sy = Demo_ToPassScreenPoint(renderContext, frameObject.position.x, frameObject.position.y)
			Demo_DrawCircleDebugGuide(sx, sy, frameObject.radius, debugDisplay)
			return
		end

		if kind == "arcSegment2D" then
			local sx, sy = Demo_ToPassScreenPoint(renderContext, frameObject.position.x, frameObject.position.y)
			Demo_DrawArcSegmentDebugGuide(
				sx,
				sy,
				frameObject.innerRadius,
				frameObject.outerRadius,
				frameObject.startAngleDeg,
				frameObject.spanAngleDeg,
				frameObject.segments,
				debugDisplay
			)
			return
		end

		if kind == "line" and debugDisplay.wireframe == true then
			local startX, startY =
				Demo_ToPassScreenPoint(renderContext, frameObject.lineStart.x, frameObject.lineStart.y)
			local endX, endY = Demo_ToPassScreenPoint(renderContext, frameObject.lineEnd.x, frameObject.lineEnd.y)
			R_editorOverlayLine(startX, startY, endX, endY, 1)
			return
		end

		if kind == "pathStroke2D" then
			-- Demo_DrawPathPolylineDebugGuide((frameObject.surface or {}).path, renderContext, debugDisplay)
			Demo_DrawPathStrokeGeometryDebugGuide(frameObject.surface, renderContext, debugDisplay)
		end
	end

	function Demo_RealizePrimitiveFrameObject(runtime, scene, frameObject)
		local materialIndexById = runtime.frameMaterialIndexById or runtime.materialIndexById
		local materialIndex = frameObject.materialId ~= nil and materialIndexById[frameObject.materialId] or nil
		local kind = frameObject.type
		local hasFill = frameObject.fill ~= nil or (kind == "rect" and frameObject.strokeFill ~= nil)
		if
			kind ~= "text2D" --
			and kind ~= "textGlyph2D"
			and not hasFill
			and materialIndex == nil
		then
			return
		end
		Scene_addObject(scene, {
			id = frameObject.id,
			editorObjectId = frameObject.debugSourceObjectId or frameObject.id,
			transform = Demo_GetFrameSceneObjectTransform(frameObject),
			render = {
				kind = "custom2d",
				draw = function(renderContext)
					Demo_DrawPrimitiveFrameObject(runtime, frameObject, renderContext, materialIndex)
				end,
			},
		})
	end

	function Demo_RealizeObjectGroupFrameObject(runtime, scene, frameObject, geometryCache)
		local childSceneRuntime = {
			state = Scene_new(),
		}
		local children = frameObject.children or {}
		for i = 1, #children do
			Demo_RealizeSceneObject(runtime, childSceneRuntime, children[i], geometryCache)
		end
		Scene_addObject(scene, {
			id = frameObject.id,
			editorObjectId = frameObject.debugSourceObjectId or frameObject.id,
			transform = Demo_GetFrameSceneObjectTransform(frameObject),
			render = {
				kind = "objectGroup",
				children = childSceneRuntime.state.objects,
				viewport = frameObject.viewport,
			},
		})
	end

	function Demo_IsPrimitiveFrameObjectType(kind)
		return kind == "text2D" --
			or kind == "textGlyph2D"
			or kind == "rect"
			or kind == "point2D"
			or kind == "point3D"
			or kind == "circle"
			or kind == "arcSegment2D"
			or kind == "pathFill2D"
			or kind == "pathStroke2D"
			or kind == "line"
	end

	function Demo_EvaluateSceneFrame(runtime, sceneRuntime, t, animationContext)
		local frameScene = Demo_NewFrameScene(sceneRuntime, runtime.frameMetrics)
		sceneRuntime.frameScene = frameScene
		if runtime.frameScenes ~= nil then
			runtime.frameScenes[sceneRuntime.id] = frameScene
		end
		return frameScene
	end

	function Demo_RealizeSceneObject(runtime, sceneRuntime, frameObject, geometryCache)
		if frameObject.visible == false then
			return
		end

		local scene = sceneRuntime.state
		local debugDisplay = frameObject.debugDisplay
		local debugObjectId = frameObject.debugSourceObjectId or frameObject.id
		debugDisplay = Demo_GetSceneObjectDebugDisplay(runtime, debugObjectId, debugDisplay)
		if debugDisplay ~= nil and debugDisplay.hidden == true then
			return
		end
		if debugDisplay ~= nil and debugDisplay.enableDebugHud then
			DemoCustom_AddHudLine(
				string.format("object: %s; visible=%s", frameObject.id, tostring(frameObject.visible))
			)
		end
		if debugDisplay ~= nil and debugDisplay.outline == true then
			Scene_addOutline(scene, debugObjectId, 1, 0.85)
		end

		if frameObject.type == "mesh3d" then
			Demo_RealizeMeshFrameObject(runtime, scene, frameObject, geometryCache)
			return
		end
		if frameObject.type == "objectGroup" then
			Demo_RealizeObjectGroupFrameObject(runtime, scene, frameObject, geometryCache)
			return
		end

		if Demo_IsPrimitiveFrameObjectType(frameObject.type) then
			Demo_RealizePrimitiveFrameObject(runtime, scene, frameObject)
			if debugDisplay ~= nil and (debugDisplay.anchor == true or debugDisplay.wireframe == true) then
				Scene_addObject(scene, {
					id = frameObject.id .. ":debugDisplay",
					transform = Demo_GetFrameSceneObjectTransform(frameObject),
					render = {
						kind = "custom2d",
						draw = function(renderContext)
							Demo_DrawPrimitiveDebugDisplay(runtime, frameObject, debugDisplay, renderContext)
						end,
					},
				})
			end
			return
		end

		TFASSERT(false, "unknown frame object type: " .. tostring(frameObject.type))
	end

	function Demo_RealizeSceneFrame(runtime, sceneRuntime, frameScene)
		local geometryCache = {}
		for i = 1, #frameScene.objects do
			Demo_RealizeSceneObject(runtime, sceneRuntime, frameScene.objects[i], geometryCache)
		end
	end
end

do
	function Demo_LoadMeshes(projectDef, textureById)
		local meshes = {}
		local meshDefs = projectDef.meshes or {}
		for _, meshId in ipairs(Demo_SortedIds(meshDefs)) do
			meshes[meshId] = Demo_LoadMesh(meshDefs[meshId], textureById)
		end
		return meshes
	end

	function Demo_LoadBehaviors(projectDef)
		local behaviors = {}
		local behaviorDefs = projectDef.behaviors or {}
		for _, behaviorId in ipairs(Demo_SortedIds(behaviorDefs)) do
			local behaviorDef = behaviorDefs[behaviorId]
			behaviors[#behaviors + 1] = {
				id = behaviorId,
				def = behaviorDef,
				type = behaviorDef.type,
				graphSink = behaviorDef.graphSink == true,
				enabled = behaviorDef.enabled ~= false,
				sortOrder = behaviorDef.sortOrder or 0,
				params = behaviorDef.params or {},
				state = {},
			}
		end
		table.sort(behaviors, function(a, b)
			if a.sortOrder ~= b.sortOrder then
				return a.sortOrder < b.sortOrder
			end
			return a.id < b.id
		end)
		return behaviors
	end

	function Demo_CompileBehaviorGraph(projectDef, behaviors, connectionDefs)
		local behaviorById = {}
		local nodeById = {}
		local incomingByNodeId = {}
		local graphBehaviorIds = {}

		for i = 1, #behaviors do
			local behavior = behaviors[i]
			behaviorById[behavior.id] = behavior
			nodeById[behavior.id] = behavior
		end

		-- Boulette validates graph structure and cardinality. Runtime compilation
		-- only indexes every input as an ordered list of sources.
		for _, connectionId in ipairs(Demo_SortedIds(connectionDefs or {})) do
			local connection = connectionDefs[connectionId]
			local from = connection.from
			local to = connection.to
			local fromBehaviorId = from.nodeId or from.behaviorId
			local toBehaviorId = to.nodeId or to.behaviorId

			local incoming = incomingByNodeId[toBehaviorId]
			if incoming == nil then
				incoming = {}
				incomingByNodeId[toBehaviorId] = incoming
			end
			local source = {
				connectionId = connectionId,
				nodeId = fromBehaviorId,
				portId = from.portId,
				inputOrder = connection.inputOrder,
			}
			local sources = incoming[to.portId] or {}
			incoming[to.portId] = sources
			sources[#sources + 1] = source
			if behaviorById[fromBehaviorId] ~= nil then
				graphBehaviorIds[fromBehaviorId] = true
			end
			if behaviorById[toBehaviorId] ~= nil then
				graphBehaviorIds[toBehaviorId] = true
			end
		end

		for _, incomingByPort in pairs(incomingByNodeId) do
			for _, sources in pairs(incomingByPort) do
				table.sort(sources, function(a, b)
					if a.inputOrder ~= b.inputOrder then
						if a.inputOrder ~= nil and b.inputOrder ~= nil then
							return a.inputOrder < b.inputOrder
						end
						return a.inputOrder ~= nil
					end
					if a.nodeId ~= b.nodeId then
						return a.nodeId < b.nodeId
					end
					if a.portId ~= b.portId then
						return a.portId < b.portId
					end
					return a.connectionId < b.connectionId
				end)
			end
		end

		return {
			behaviorById = behaviorById,
			nodeById = nodeById,
			behaviorIds = graphBehaviorIds,
			incomingByNodeId = incomingByNodeId,
		}
	end

	function Demo_ReloadBehaviorGraph(runtime)
		runtime.behaviorConnections = runtime.def.behaviorConnections or {}
		runtime.behaviorGraph =
			Demo_CompileBehaviorGraph(runtime.def, runtime.behaviors or {}, runtime.behaviorConnections)
	end

	function Demo_ApplyGraphNodeParamsChangedPatch(runtime, projectDef, changedParamsByNodeId)
		if changedParamsByNodeId == nil then
			return
		end
		projectDef.behaviors = projectDef.behaviors or {}
		local graph = runtime.behaviorGraph
		local behaviorById = graph ~= nil and graph.behaviorById or nil
		for behaviorId, params in pairs(changedParamsByNodeId) do
			local behaviorDef = projectDef.behaviors[behaviorId]
			if behaviorDef ~= nil then
				behaviorDef.params = params or {}
			end
			local behavior = behaviorById ~= nil and behaviorById[behaviorId] or nil
			if behavior ~= nil then
				behavior.params = params or {}
				if behavior.def ~= nil then
					behavior.def.params = behavior.params
				end
			end
		end
	end

	function Demo_ApplySceneObjectDebugDisplayChangedPatch(projectDef, changes)
		if changes == nil then
			return
		end

		local editor = projectDef.editor
		local sceneObjects = editor and editor.sceneObjects or nil
		for objectId, change in pairs(changes) do
			local debugDisplay = change and change.debugDisplay or nil
			if debugDisplay ~= nil then
				if editor == nil then
					editor = {}
					projectDef.editor = editor
				end
				if sceneObjects == nil then
					sceneObjects = {}
					editor.sceneObjects = sceneObjects
				end
				local objectEditor = sceneObjects[objectId]
				if objectEditor == nil then
					objectEditor = {}
					sceneObjects[objectId] = objectEditor
				end
				objectEditor.debugDisplay = debugDisplay
			elseif sceneObjects ~= nil then
				local objectEditor = sceneObjects[objectId]
				if objectEditor ~= nil then
					objectEditor.debugDisplay = nil
					if next(objectEditor) == nil then
						sceneObjects[objectId] = nil
					end
				end
			end
		end
		if sceneObjects ~= nil and next(sceneObjects) == nil and editor ~= nil then
			editor.sceneObjects = nil
		end
	end

	function Demo_ApplyBehaviorConnectionsChangedPatch(runtime, projectDef, changes)
		if changes == nil then
			return false
		end

		projectDef.behaviorConnections = projectDef.behaviorConnections or {}
		local connectionDefs = projectDef.behaviorConnections
		local changed = false

		local deletedIds = changes.delete
		if deletedIds ~= nil then
			for i = 1, #deletedIds do
				local connectionId = deletedIds[i]
				if connectionDefs[connectionId] ~= nil then
					connectionDefs[connectionId] = nil
					changed = true
				end
			end
		end

		local upsertedConnections = changes.upsert
		if upsertedConnections ~= nil then
			for connectionId, connectionDef in pairs(upsertedConnections) do
				connectionDefs[connectionId] = connectionDef or {}
				changed = true
			end
		end

		if changed then
			runtime.behaviorConnections = connectionDefs
		end
		return changed
	end

	function Demo_LoadProject(projectDef)
		local materialConfig, materialIndexById = Demo_LoadMaterials(projectDef)
		local textureById = Demo_LoadTextures(projectDef)
		local runtime = {
			def = projectDef,
			materialConfig = materialConfig,
			materialIndexById = materialIndexById,
			textures = textureById,
			fonts = Demo_LoadFonts(projectDef, textureById),
			meshes = Demo_LoadMeshes(projectDef, textureById),
			behaviors = Demo_LoadBehaviors(projectDef),
			behaviorConnections = projectDef.behaviorConnections or {},
			animation = Demo_LoadAnimation(projectDef.animation),
		}
		Demo_ReloadBehaviorGraph(runtime)

		return runtime
	end

	function Demo_ApplyProjectPatch(runtime, projectDef, transport, patch)
		if patch.transport ~= nil then
			projectDef.transport = patch.transport
		end
		if patch.materials ~= nil then
			projectDef.materials = patch.materials
		end
		if patch.textures ~= nil then
			projectDef.textures = patch.textures
		end
		if patch.fonts ~= nil then
			projectDef.fonts = patch.fonts
		end
		if patch.meshes ~= nil then
			projectDef.meshes = patch.meshes
		end
		if patch.behaviors ~= nil then
			projectDef.behaviors = patch.behaviors
			runtime.behaviors = Demo_LoadBehaviors(projectDef)
		end
		if patch.behaviorConnections ~= nil then
			projectDef.behaviorConnections = patch.behaviorConnections
			runtime.behaviorConnections = patch.behaviorConnections
		end
		local behaviorConnectionsChanged =
			Demo_ApplyBehaviorConnectionsChangedPatch(runtime, projectDef, patch.behaviorConnectionsChanged)
		Demo_ApplyGraphNodeParamsChangedPatch(runtime, projectDef, patch.graphNodeParamsChanged)
		Demo_ApplySceneObjectDebugDisplayChangedPatch(projectDef, patch.sceneObjectDebugDisplayChanged)
		if
			patch.behaviors ~= nil
			or patch.behaviorConnections ~= nil
			or behaviorConnectionsChanged
			or patch.materials ~= nil
			or patch.textures ~= nil
			or patch.fonts ~= nil
			or patch.meshes ~= nil
		then
			Demo_ReloadBehaviorGraph(runtime)
		end
		if patch.animation ~= nil then
			projectDef.animation = patch.animation
			runtime.animation = Demo_LoadAnimation(projectDef.animation)
		end

		local materialsChanged = patch.materials ~= nil
		local texturesChanged = patch.textures ~= nil or materialsChanged
		local fontsChanged = patch.fonts ~= nil or texturesChanged
		local meshesChanged = patch.meshes ~= nil or texturesChanged or materialsChanged

		if patch.transport ~= nil then
			local previousTime = transport ~= nil and transport.time or nil
			local transportOptions = CloneTable(projectDef.transport)
			if previousTime ~= nil then
				transportOptions.isPlaying = previousTime.isPlaying == true
				transportOptions.isMuted = previousTime.isMuted == true
			end
			if transport ~= nil then
				Transport_SetOptions(transport, transportOptions)
			else
				transport = Transport_CreateSomatic(transportOptions)
			end
		end
		if materialsChanged then
			runtime.materialConfig, runtime.materialIndexById = Demo_LoadMaterials(projectDef)
		end
		if texturesChanged then
			runtime.textures = Demo_LoadTextures(projectDef)
		end
		if fontsChanged then
			runtime.fonts = Demo_LoadFonts(projectDef, runtime.textures)
		end
		if meshesChanged then
			runtime.meshes = Demo_LoadMeshes(projectDef, runtime.textures)
		end

		return transport
	end

	local gHudPass = Scene_new()

	function Demo_RunBehaviorGraph(
		runtime,
		customContext,
		frameScene,
		sceneRuntime,
		pass,
		frameCamera,
		frameCameraId,
		frameEnvironment,
		frameViewport,
		rootNodeId
	)
		local graph = runtime.behaviorGraph
		if graph == nil or rootNodeId == nil then
			return
		end

		customContext.graphValues = {}
		customContext.graphDisabledBehaviorIds = {}
		customContext.graphPropertyWriters = {}
		customContext.graphEvaluationState = {}
		customContext.graphScopeKey = tostring(rootNodeId)

		local evaluateBehavior
		evaluateBehavior = function(behaviorId)
			local state = customContext.graphEvaluationState[behaviorId]
			if state == "complete" then
				return
			end
			if
				not SATISFIED(
					state ~= "evaluating",
					string.format("behavior graph evaluation cycle at %s", tostring(behaviorId))
				)
			then
				return
			end

			local node = graph.nodeById[behaviorId]
			if not SATISFIED(node ~= nil, "behavior graph node does not exist: " .. tostring(behaviorId)) then
				return
			end
			customContext.graphEvaluationState[behaviorId] = "evaluating"

			local behavior = graph.behaviorById[behaviorId]
			if behavior == nil then
				TFASSERT(false, "behavior graph node has no evaluator: " .. tostring(behaviorId))
				customContext.graphEvaluationState[behaviorId] = "complete"
				return
			end

			local evaluateGraph = gBehaviorGraphEvaluators ~= nil and gBehaviorGraphEvaluators[behavior.type] or nil
			if
				not SATISFIED(
					evaluateGraph ~= nil,
					string.format(
						"connected behavior %s (%s) does not implement graph evaluation",
						behavior.id,
						behavior.type
					)
				)
			then
				return
			end

			local behaviorEnabled = behavior.enabled ~= false
			if behaviorEnabled then
				evaluateGraph(
					customContext,
					behavior,
					frameScene,
					sceneRuntime,
					pass,
					frameCamera,
					frameCameraId,
					frameEnvironment,
					frameViewport
				)
			else
				customContext.graphDisabledBehaviorIds[behavior.id] = true
			end
			customContext.graphEvaluationState[behaviorId] = "complete"
			frameScene.metrics.nodesEvaluated = frameScene.metrics.nodesEvaluated + 1
		end
		customContext.evaluateGraphNode = evaluateBehavior

		evaluateBehavior(rootNodeId)
		customContext.evaluateGraphNode = nil
		return customContext.graphValues[rootNodeId]
	end

	function Demo_GetTablePath(value, path)
		if path == nil or path == "" then
			return value
		end
		for segment in string.gmatch(path, "[^%.]+") do
			if type(value) ~= "table" then
				return nil
			end
			value = value[segment]
		end
		return value
	end

	function Demo_DrawPassHighlight(runtime, passId, viewport)
		local highlights = runtime.editorHighlights and runtime.editorHighlights.passes or nil
		local highlight = highlights and highlights[passId] or nil
		if highlight == nil or highlight.outline ~= true or viewport == nil then
			return
		end

		local x = viewport.x or 0
		local y = viewport.y or 0
		local width = viewport.width or 240
		local height = viewport.height or 136
		if width <= 0 or height <= 0 then
			return
		end

		local right = x + width - 1
		local bottom = y + height - 1
		R_editorOverlayLine(x, y, right, y, 1)
		R_editorOverlayLine(right, y, right, bottom, 1)
		R_editorOverlayLine(right, bottom, x, bottom, 1)
		R_editorOverlayLine(x, bottom, x, y, 1)
		if highlight.anchor == true then
			R_editorOverlayCrosshair(x + width * 0.5, y + height * 0.5, 4, 2)
		end
	end

	function Demo_CreateCustomContext(runtime, t, animationContext)
		local customContext = {} -- need to be able to reference it from within its own methods.
		local function getGraphInputSources(behavior, portId)
			local graph = runtime.behaviorGraph
			local incomingByPort = graph ~= nil and graph.incomingByNodeId[behavior.id] or nil
			return incomingByPort ~= nil and incomingByPort[portId] or nil
		end
		local function getGraphSourceValue(source)
			if customContext.evaluateGraphNode ~= nil then
				customContext.evaluateGraphNode(source.nodeId)
			end
			if customContext.graphDisabledBehaviorIds and customContext.graphDisabledBehaviorIds[source.nodeId] then
				return nil
			end
			local sourceValues = customContext.graphValues and customContext.graphValues[source.nodeId]
			return sourceValues and sourceValues[source.portId] or nil
		end
		local customContext2 = {
			runtime = runtime,
			t = t,
			bpm = (t.tempo * 6 / t.speed),
			animationContext = animationContext,
			materialIndexById = runtime.materialIndexById,
			textures = runtime.textures,
			fonts = runtime.fonts,
			meshes = runtime.meshes,
			getFrameScene = function(sceneId)
				return runtime.frameScenes ~= nil and runtime.frameScenes[sceneId] or nil
			end,
			getFrameSceneObject = function(sceneId, objectId)
				local frameScene = runtime.frameScenes ~= nil and runtime.frameScenes[sceneId] or nil
				return Demo_GetFrameSceneObject(frameScene, objectId)
			end,
			hideFrameSceneObject = function(frameScene, objectId)
				Demo_HideFrameSceneObject(frameScene, objectId)
			end,
			getFrameSceneObjectProperty = function(sceneId, objectId, property)
				local frameScene = runtime.frameScenes ~= nil and runtime.frameScenes[sceneId] or nil
				return Demo_GetTablePath(Demo_GetFrameSceneObject(frameScene, objectId), property)
			end,
			getFrameSceneObjectCentroid = function(sceneId, objectId)
				local frameScene = runtime.frameScenes ~= nil and runtime.frameScenes[sceneId] or nil
				return Demo_GetFrameSceneObjectCentroid(Demo_GetFrameSceneObject(frameScene, objectId))
			end,
			getFrameSceneObjectBounds = function(sceneId, objectId)
				local frameScene = runtime.frameScenes ~= nil and runtime.frameScenes[sceneId] or nil
				return Demo_GetFrameSceneObjectBounds(Demo_GetFrameSceneObject(frameScene, objectId))
			end,
			getFrameObjectBounds = function(frameObject)
				return Demo_GetFrameSceneObjectBounds(frameObject)
			end,
			getFrameSceneObjectTransform = function(sceneId, objectId)
				local frameScene = runtime.frameScenes ~= nil and runtime.frameScenes[sceneId] or nil
				return Demo_GetFrameSceneObjectTransform(Demo_GetFrameSceneObject(frameScene, objectId))
			end,
			transformFrameSceneObjectPoint = function(frameObject, point, effectiveRot)
				return Demo_TransformFrameSceneObjectPoint(frameObject, point, effectiveRot)
			end,
			setFrameSceneObjectOrigin = function(frameObject, point)
				Demo_SetFrameSceneObjectOrigin(frameObject, point)
			end,
			applyFrameSceneObjectRotationFrom = function(frameObject, sourceFrameObject, effectiveRot)
				Demo_ApplyFrameSceneObjectRotationFrom(frameObject, sourceFrameObject, effectiveRot)
			end,
			getFramePassCamera = function(passId)
				return runtime.framePassCameras ~= nil and runtime.framePassCameras[passId] or nil
			end,
			getFramePassCameraId = function(passId)
				return runtime.framePassCameraIds ~= nil and runtime.framePassCameraIds[passId] or nil
			end,
			getGraphSceneRuntime = function(sceneId)
				runtime.graphSceneRuntimes = runtime.graphSceneRuntimes or {}
				local sceneRuntime = runtime.graphSceneRuntimes[sceneId]
				if sceneRuntime == nil then
					sceneRuntime = Demo_LoadScene({})
					sceneRuntime.id = sceneId
					runtime.graphSceneRuntimes[sceneId] = sceneRuntime
				end
				return sceneRuntime
			end,
			evaluateSceneFrame = function(sceneRuntime)
				return Demo_EvaluateSceneFrame(runtime, sceneRuntime, t, animationContext)
			end,
			addFrameSceneObject = function(frameScene, frameObject)
				Demo_AddFrameSceneObject(frameScene, frameObject)
			end,
			cloneFrameSceneObject = function(frameObject, newId)
				return Demo_CloneFrameSceneObject(frameObject, newId)
			end,

			-- Why is this needed?
			-- it's just a helper which fetches base value if possible (params[paramName])
			-- and then applies animation on top of it. It's effectively like other params but with
			-- a bit more plumbing.
			getBehaviorParam = function(behavior, paramName, baseValue)
				local params = behavior ~= nil and behavior.params or nil
				local value = baseValue or nil
				if params ~= nil and params[paramName] ~= nil then
					value = params[paramName]
				end
				if behavior ~= nil and behavior.id ~= nil then
					return Demo_GetAnimatedNodeValue(animationContext, behavior.id, paramName, value)
				end
				return value
			end,
			getInput = function(behavior, portId, fallbackValue)
				local sources = getGraphInputSources(behavior, portId)
				local source = sources and sources[1] or nil
				if source == nil then
					return fallbackValue
				end
				local value = getGraphSourceValue(source)
				if value ~= nil then
					return value
				end
				return fallbackValue
			end,
			getMultiInputCount = function(behavior, portId)
				local sources = getGraphInputSources(behavior, portId)
				return #(sources or {})
			end,
			getMultiInput = function(behavior, portId, inputIndex, fallbackValue)
				local sources = getGraphInputSources(behavior, portId)
				local source = sources and sources[inputIndex] or nil
				if source == nil then
					return fallbackValue
				end
				local value = getGraphSourceValue(source)
				if value ~= nil then
					return value
				end
				return fallbackValue
			end,
			getMultiInputs = function(behavior, portId)
				local sources = getGraphInputSources(behavior, portId)
				local values = {}
				for i = 1, #(sources or {}) do
					local value = getGraphSourceValue(sources[i])
					if value ~= nil then
						values[#values + 1] = value
					end
				end
				return values
			end,
			setOutput = function(behavior, portId, value)
				customContext.graphValues = customContext.graphValues or {}
				local behaviorValues = customContext.graphValues[behavior.id]
				if behaviorValues == nil then
					behaviorValues = {}
					customContext.graphValues[behavior.id] = behaviorValues
				end
				behaviorValues[portId] = value
				Boulette_CaptureBehaviorGraphWatch(customContext.graphScopeKey, behavior.id, portId, value)
			end,
			getBehaviorTrigger = function(behavior, paramName)
				if behavior ~= nil and behavior.id ~= nil then
					return Demo_GetAnimatedNodeTrigger(animationContext, behavior.id, paramName)
				end
				return false
			end,
			getMaterialIndex = function(materialId)
				if type(materialId) ~= "string" or materialId == "" then
					return nil
				end
				return runtime.materialIndexById[materialId]
			end,
			getFrameObjectProperty = function(frameObject, propertyBinding)
				return DemoCustom_GetTablePath(frameObject, propertyBinding.fieldId)
			end,
			-- sets a field value on the given frame object. The binding's node id only describes the field schema.
			setFrameObjectProperty = function(frameObject, propertyBinding, value)
				DemoCustom_SetTablePath(frameObject, propertyBinding.fieldId, value)
			end,
			setGraphFrameObjectProperty = function(behavior, frameObject, propertyBinding, value)
				local property = propertyBinding.fieldId
				local writersByProperty = customContext.graphPropertyWriters[frameObject]
				if writersByProperty == nil then
					writersByProperty = {}
					customContext.graphPropertyWriters[frameObject] = writersByProperty
				end
				local existingWriterId = writersByProperty[property]
				if existingWriterId ~= nil and existingWriterId ~= behavior.id then
					if
						not SATISFIED(
							false,
							string.format(
								"multiple graph inputs for frame object %s property %s: %s and %s",
								tostring(frameObject.id),
								tostring(property),
								tostring(existingWriterId),
								tostring(behavior.id)
							)
						)
					then
					end
				end
				writersByProperty[property] = behavior.id
				DemoCustom_SetTablePath(frameObject, property, type(value) == "table" and CloneTable(value) or value)
				return true
			end,
		}

		--table.move(customContext2, 1, #customContext2, 1, customContext)
		for k, v in pairs(customContext2) do
			customContext[k] = v
		end

		return customContext
	end

	function Demo_AddFrameUsedMaterialId(usedMaterialIdSet, materialId)
		if type(materialId) == "string" and materialId ~= "" then
			usedMaterialIdSet[materialId] = true
		end
	end

	function Demo_ProjectOutputPassCanRender(passValue)
		return passValue ~= nil and passValue.enabled and passValue.camera ~= nil and passValue.scene ~= nil
	end

	function Demo_CollectFrameMaterials(runtime, projectOutputValue)
		local usedMaterialIdSet = {}
		Demo_AddFrameUsedMaterialId(usedMaterialIdSet, projectOutputValue and projectOutputValue.clearMaterialId or nil)
		local projectBorderSpans = projectOutputValue and projectOutputValue.borderSpans or {}
		for i = 1, #projectBorderSpans do
			Demo_AddFrameUsedMaterialId(usedMaterialIdSet, projectBorderSpans[i].materialId)
		end

		local projectOutputPasses = projectOutputValue and projectOutputValue.passes or nil
		for i = 1, #(projectOutputPasses or {}) do
			local passValue = projectOutputPasses[i]
			if Demo_ProjectOutputPassCanRender(passValue) then
				Demo_AddFrameUsedMaterialId(usedMaterialIdSet, passValue.clearMaterialId)
				Demo_CollectFrameSceneMaterials(runtime, passValue.scene.frameScene, usedMaterialIdSet)
			end
		end

		-- Selection outlines still use material index 1; keep the first static material available in editor frames.
		Demo_AddFrameUsedMaterialId(usedMaterialIdSet, runtime.materialConfig.defaultStaticMaterialId)

		return usedMaterialIdSet
	end

	function Demo_PrepareFrameMaterials(runtime, projectOutputValue, projectTint, projectCalibration)
		local usedMaterialIdSet = Demo_CollectFrameMaterials(runtime, projectOutputValue)
		runtime.frameMaterialConfig, runtime.frameMaterialIndexById =
			Demo_BuildFrameMaterialConfig(runtime.materialConfig, usedMaterialIdSet)
		runtime.frameMaterialIndexStamp = (runtime.frameMaterialIndexStamp or 0) + 1
		Demo_ApplyAnimatedMaterials(runtime, runtime.frameMaterialConfig, projectTint, projectCalibration)
	end

	function Demo_RenderProjectFrame(runtime, t)
		local animationContext = Demo_BeginAnimationFrame(runtime.animation, t)
		runtime.frameMetrics = Demo_NewFrameMetrics()
		runtime.frameScenes = {}
		runtime.framePassCameras = {}
		runtime.framePassCameraIds = {}
		local customContext = Demo_CreateCustomContext(runtime, t, animationContext)

		if DemoCustom_BeginFrame ~= nil then
			DemoCustom_BeginFrame(customContext)
		end

		local function getGraphBootstrapSceneRuntime()
			local bootstrapSceneRuntime = runtime.graphBootstrapSceneRuntime
			if bootstrapSceneRuntime == nil then
				bootstrapSceneRuntime = Demo_LoadScene({})
				bootstrapSceneRuntime.id = "$graphPassBootstrap"
				runtime.graphBootstrapSceneRuntime = bootstrapSceneRuntime
			end
			return bootstrapSceneRuntime
		end

		local function evaluateProjectOutput()
			if runtime.behaviorGraph == nil or runtime.behaviorGraph.behaviorById["$projectOutput"] == nil then
				return nil
			end
			local bootstrapSceneRuntime = getGraphBootstrapSceneRuntime()
			local bootstrapFrameScene = Demo_EvaluateSceneFrame(runtime, bootstrapSceneRuntime, t, animationContext)
			local bootstrapPass = {
				id = "$projectOutputBootstrapPass",
				def = {},
				enabled = true,
				clearTone = 0,
				viewport = {
					position = { x = 0, y = 0 },
					size = { width = 240, height = 136 },
				},
			}
			return Demo_RunBehaviorGraph(
				runtime,
				customContext,
				bootstrapFrameScene,
				bootstrapSceneRuntime,
				bootstrapPass,
				nil,
				nil,
				{
					ambient = 0,
					lightDirection = { x = 0, y = 1, z = 0 },
					fog = { density = 0.005, startDistance = 0 },
				},
				{ x = 0, y = 0, width = 240, height = 136 },
				"$projectOutput"
			)
		end

		local projectOutputValue = evaluateProjectOutput()
		local projectTint = projectOutputValue and projectOutputValue.tint or nil
		local projectCalibration = projectOutputValue and projectOutputValue.calibration or nil
		Demo_PrepareFrameMaterials(runtime, projectOutputValue, projectTint, projectCalibration)
		local frameClearMaterialId = projectOutputValue and projectOutputValue.clearMaterialId or nil
		local frameClearMaterialIndex = nil
		if frameClearMaterialId ~= nil then
			frameClearMaterialIndex = runtime.frameMaterialIndexById[frameClearMaterialId]
		end
		if
			frameClearMaterialId ~= nil
			and SATISFIED(
				frameClearMaterialIndex ~= nil,
				"project frame clear has no valid material: " .. tostring(frameClearMaterialId)
			)
			and not SATISFIED(
				frameClearMaterialIndex <= (runtime.frameMaterialConfig.staticCount or 0),
				"project frame clear material must be static: " .. tostring(frameClearMaterialId)
			)
		then
			frameClearMaterialIndex = nil
		end

		Scene_beginRenderFrame({
			materials = runtime.frameMaterialConfig,
			clearMaterialIndex = frameClearMaterialIndex,
			borderMaterialIndex = nil,
			metrics = runtime.frameMetrics,
		})
		local projectBorderSpans = projectOutputValue and projectOutputValue.borderSpans or {}
		-- sort border spans by zOrder.
		table.sort(projectBorderSpans, function(a, b)
			return a.zOrder < b.zOrder
		end)
		for i = 1, #projectBorderSpans do
			local borderSpan = projectBorderSpans[i]
			local materialIndex = borderSpan.materialId ~= nil and runtime.frameMaterialIndexById[borderSpan.materialId]
				or nil
			-- DEMO_ASSERT(
			-- 	RENDERER_IS_STATIC_MATERIAL(materialIndex or 0) == true,
			-- 	"border span material is not static: " .. tostring(borderSpan.materialId)
			-- )
			if
				SATISFIED(
					materialIndex ~= nil,
					"border span has no valid material: " .. tostring(borderSpan.materialId)
				)
			then
				--if materialIndex ~= nil then
				R_border(borderSpan.y or 0, borderSpan.length or 0, materialIndex)
			end
		end

		if Boulette_BeginPose3CameraRenderPasses ~= nil then
			Boulette_BeginPose3CameraRenderPasses()
		end
		if Boulette_BeginPosition3PoseRenderPasses ~= nil then
			Boulette_BeginPosition3PoseRenderPasses()
		end
		if Boulette_BeginScale3PoseRenderPasses ~= nil then
			Boulette_BeginScale3PoseRenderPasses()
		end
		if Boulette_BeginRotation3PoseRenderPasses ~= nil then
			Boulette_BeginRotation3PoseRenderPasses()
		end
		if Boulette_BeginFreeViewRenderPasses ~= nil then
			Boulette_BeginFreeViewRenderPasses()
		end

		local function renderEvaluatedPass(passValue)
			if not Demo_ProjectOutputPassCanRender(passValue) then
				return
			end
			local frameScene = passValue.scene.frameScene
			local frameEnvironment = passValue.scene.environment
			local sceneRuntime = passValue.scene.runtime
			local frameCamera = passValue.camera
			local frameCameraId = passValue.cameraId
			local frameViewport = passValue.viewport
			local clearMaterialIndex = passValue.clearMaterialId ~= nil
					and runtime.frameMaterialIndexById[passValue.clearMaterialId]
				or nil
			local clearTone = passValue.clearTone
			runtime.framePassCameras[passValue.id] = frameCamera
			runtime.framePassCameraIds[passValue.id] = frameCameraId
			frameCamera = Boulette_GetFreeViewCamera(passValue.id, frameCamera)
			Scene_beginFrame(sceneRuntime.state, {
				materials = runtime.frameMaterialConfig,
				camera = frameCamera,
				environment = frameEnvironment,
				clearMaterialIndex = clearMaterialIndex,
				clearTone = clearTone,
			})
			Demo_RealizeSceneFrame(runtime, sceneRuntime, frameScene)
			Boulette_AddSceneObjectSelectionOutlines(sceneRuntime.state)
			Scene_renderPass(sceneRuntime.state, {
				viewport = frameViewport,
			})
			Demo_DrawPassHighlight(runtime, passValue.id, frameViewport)
			Boulette_NotePose3CameraRenderPass(frameCameraId, frameCamera, frameViewport)
			Boulette_NotePosition3PoseRenderPass(sceneRuntime.state, frameCamera, frameViewport)
			Boulette_NoteScale3PoseRenderPass(sceneRuntime.state, frameCamera, frameViewport)
			Boulette_NoteRotation3PoseRenderPass(sceneRuntime.state, frameCamera, frameViewport)
			Boulette_NoteFreeViewRenderPass(passValue.id, frameCamera, frameViewport)
		end

		local projectOutputPasses = projectOutputValue and projectOutputValue.passes or nil
		local renderedProjectOutput = projectOutputPasses ~= nil and #projectOutputPasses > 0
		if renderedProjectOutput then
			for i = 1, #projectOutputPasses do
				renderEvaluatedPass(projectOutputPasses[i])
			end
		end

		-- render editor features / hud / ...
		Scene_beginFrame(gHudPass, {
			materials = runtime.frameMaterialConfig,
		})

		-- Scene_addObject(gHudPass, {
		-- 	id = "demoEditorHud",
		-- 	render = {
		-- 		kind = "custom2d",
		-- 		draw = function(ctx)
		-- 			--R_rect(0, 0, 24, 24, 2, 0.5)
		-- 		end,
		-- 	},
		-- })
		Scene_renderPass(gHudPass)

		if DemoCustom_DrawOverlay ~= nil then
			DemoCustom_DrawOverlay(customContext)
		end
		if Boulette_DrawPosition2PoseOverlay ~= nil then
			Boulette_DrawPosition2PoseOverlay()
		end
		if Boulette_DrawSize2PoseOverlay ~= nil then
			Boulette_DrawSize2PoseOverlay()
		end
		if Boulette_DrawPose3CameraOverlay ~= nil then
			Boulette_DrawPose3CameraOverlay()
		end

		Scene_endRenderFrame()

		if DemoCustom_DrawHud ~= nil then
			DemoCustom_DrawHud(customContext)
		end
		if Boulette_DrawFreeViewHud ~= nil then
			Boulette_DrawFreeViewHud()
		end
	end
end

function SafeFloat(value, fallback)
	if type(value) == "number" then
		return value
	end
	return fallback or 0
end

function SafeBool(value, fallback)
	if type(value) == "boolean" then
		return value
	end
	if type(value) == "number" then
		return value >= 0.5
	end
	return fallback or false
end

function SafeString(value, fallback)
	if type(value) == "string" then
		return value
	end
	return fallback or ""
end

function SafeVec2(value, fallback)
	fallback = fallback or {}
	local fb = {
		x = fallback.x or 0,
		y = fallback.y or 0,
	}
	if type(value) ~= "table" then
		return fb
	end
	return {
		x = SafeFloat(value.x, fb.x),
		y = SafeFloat(value.y, fb.y),
	}
end

function IsVec2(value)
	-- z is allowed to be present, but not required.
	return type(value) == "table" --
		and type(value.x) == "number"
		and type(value.y) == "number"
end

function CopyVec2(vec)
	return { x = vec.x, y = vec.y }
end

-- safely always returns a valid vec3 ({x,y,z}); fallback is optional.
-- fallback may contain any x,y,z components; missing components will be treated as 0.
-- the reason for the per-component fallback is so the fallback object is *copied*.
-- if fallback is not specified, it defaults to {0,0,0}.
function SafeVec3(value, fallback)
	fallback = fallback or {}
	local fb = {
		x = fallback.x or 0,
		y = fallback.y or 0,
		z = fallback.z or 0,
	}
	if type(value) ~= "table" then
		return fb
	end
	return {
		x = SafeFloat(value.x, fb.x),
		y = SafeFloat(value.y, fb.y),
		z = SafeFloat(value.z, fb.z),
	}
end

function IsVec3(value)
	return type(value) == "table"
		and type(value.x) == "number"
		and type(value.y) == "number"
		and type(value.z) == "number"
end

function SafeSize2(value, fallback)
	return SafeVec2(value, fallback)
end

function IsSize2(value)
	return IsVec2(value)
end

function ScalarToString(val)
	if type(val) == "number" then
		return string.format("%.3f", val)
	end
	if type(val) == "boolean" then
		return tostring(val)
	end
	if type(val) == "string" then
		return '"' .. val .. '"'
	end
	if val == nil then
		return "nil"
	end
	return "unk"
end

function Vec3ToString(vec)
	return string.format("{x=%s,y=%s,z=%s}", ScalarToString(vec.x), ScalarToString(vec.y), ScalarToString(vec.z))
end

function ValueToString(val)
	if IsVec3(val) then
		return Vec3ToString(val)
	end
	return ScalarToString(val)
end

function Hash1D(x)
	local value = sin(x * 12.9898) * 43758.5453
	return value - value // 1
end

function Hash2D(x, y)
	local value = sin(x * 12.9898 + y * 78.233) * 43758.5453
	return value - value // 1
end

-- returns a number in [0,1) based on x,y,z.
function Hash3D(x, y, z)
	local value = sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453
	return value - value // 1
end

function ValueNoise1D(x)
	local cell = x // 1
	local u = (x - (x // 1))
	u = u * u * (3 - 2 * u) -- smoothstep
	local thisCell = Hash1D(cell)
	local nextCell = Hash1D(cell + 1)
	return (thisCell + (nextCell - thisCell) * u)
end

function ValueNoise2D(x, y)
	local cellX = x // 1
	local cellY = y // 1
	local u = (x - (x // 1))
	local v = (y - (y // 1))
	u = u * u * (3 - 2 * u) -- smoothstep
	v = v * v * (3 - 2 * v) -- smoothstep

	local c00 = Hash2D(cellX, cellY)
	local c10 = Hash2D(cellX + 1, cellY)
	local c01 = Hash2D(cellX, cellY + 1)
	local c11 = Hash2D(cellX + 1, cellY + 1)

	local x0 = (c00 + (c10 - c00) * u)
	local x1 = (c01 + (c11 - c01) * u)
	return (x0 + (x1 - x0) * v)
end

function ValueNoise3D(x, y, z)
	local cellX = x // 1
	local cellY = y // 1
	local cellZ = z // 1
	local u = (x - (x // 1))
	local v = (y - (y // 1))
	local w = (z - (z // 1))
	u = u * u * (3 - 2 * u) -- smoothstep
	v = v * v * (3 - 2 * v) -- smoothstep
	w = w * w * (3 - 2 * w) -- smoothstep

	local c000 = Hash3D(cellX, cellY, cellZ)
	local c100 = Hash3D(cellX + 1, cellY, cellZ)
	local c010 = Hash3D(cellX, cellY + 1, cellZ)
	local c110 = Hash3D(cellX + 1, cellY + 1, cellZ)
	local c001 = Hash3D(cellX, cellY, cellZ + 1)
	local c101 = Hash3D(cellX + 1, cellY, cellZ + 1)
	local c011 = Hash3D(cellX, cellY + 1, cellZ + 1)
	local c111 = Hash3D(cellX + 1, cellY + 1, cellZ + 1)

	local x00 = (c000 + (c100 - c000) * u)
	local x10 = (c010 + (c110 - c010) * u)
	local x01 = (c001 + (c101 - c001) * u)
	local x11 = (c011 + (c111 - c011) * u)

	local y0 = (x00 + (x10 - x00) * v)
	local y1 = (x01 + (x11 - x01) * v)

	return (y0 + (y1 - y0) * w)
end

function Fbm1D(x, octaves)
	local value = 0
	local amplitude = 0.5
	local totalAmplitude = 0
	for octave = 1, octaves do
		value = value + ValueNoise1D(x + octave * 19.19) * amplitude
		totalAmplitude = totalAmplitude + amplitude
		x = x * 2
		amplitude = amplitude * 0.5
	end
	return totalAmplitude > 0 and value / totalAmplitude or 0
end

function Fbm2D(x, y, octaves)
	local value = 0
	local amplitude = 0.5
	local totalAmplitude = 0
	for octave = 1, octaves do
		value = value + ValueNoise2D(x, y + octave * 19.19) * amplitude
		totalAmplitude = totalAmplitude + amplitude
		x = x * 2
		y = y * 2
		amplitude = amplitude * 0.5
	end
	return totalAmplitude > 0 and value / totalAmplitude or 0
end

function Fbm3D(x, y, z, octaves)
	local value = 0
	local amplitude = 0.5
	local totalAmplitude = 0
	for octave = 1, octaves do
		value = value + ValueNoise3D(x, y, z + octave * 19.19) * amplitude
		totalAmplitude = totalAmplitude + amplitude
		x = x * 2
		y = y * 2
		z = z * 2
		amplitude = amplitude * 0.5
	end
	return totalAmplitude > 0 and value / totalAmplitude or 0
end

-- normalize a given array instance field name, falling back to "default".
-- obsolete; use StringOr and don't use "default".
-- function NormalizeInstanceFieldName(value, fallback)
-- 	if type(value) == "string" and value ~= "" then
-- 		return value
-- 	end
-- 	--return fallback or "default"
-- end

function GetNamedFields(frameObject)
	if frameObject == nil then
		return nil
	end
	local instance = frameObject.instance
	if frameObject.fields == nil then
		frameObject.fields = instance and instance.fields or {}
	end
	if instance ~= nil and instance.fields == nil then
		instance.fields = frameObject.fields
	end
	return frameObject.fields
end

function Demo_GetInstanceKey(frameObject)
	return frameObject.instance and frameObject.instance.instanceKey or frameObject.id
end

-- filters on instanceKey; if no filter present, match all.
function Demo_MatchesInstanceKey(frameObject, instanceKey)
	if instanceKey == nil then
		return true
	end
	return Demo_GetInstanceKey(frameObject) == instanceKey
end

function DemoCustom_TargetInfo(frameObject)
	if frameObject == nil then
		return nil
	end
	local instance = frameObject.instance
	local instanceId = instance and instance.instanceId or frameObject.id
	local instanceKey = instance and instance.instanceKey or frameObject.id
	return {
		id = frameObject.id,
		instanceId = instanceId,
		instanceKey = instanceKey,
		fields = GetNamedFields(frameObject),
		instance = instance,
		isInstance = instance ~= nil,
	}
end

function DemoCustom_StringHashNumber(value, seed)
	local text = tostring(value or "")
	local hash = SafeFloat(seed)
	for i = 1, #text do
		hash = (hash * 33 + string.byte(text, i)) % 100000
	end
	return hash
end

function DemoGraph_IsStream(value)
	return type(value) == "table" and value.kind == "stream" and type(value.items) == "table"
end

function DemoGraph_NewStream(behavior, portId, items)
	return {
		kind = "stream",
		domain = {
			behaviorId = behavior.id,
			portId = portId,
		},
		items = items or {},
	}
end

function DemoGraph_NewStreamWithDomain(domain, items)
	return {
		kind = "stream",
		domain = domain,
		items = items or {},
	}
end

function DemoGraph_SameDomain(a, b)
	return DemoGraph_IsStream(a)
		and DemoGraph_IsStream(b)
		and a.domain ~= nil
		and b.domain ~= nil
		and a.domain.behaviorId == b.domain.behaviorId
		and a.domain.portId == b.domain.portId
end

function DemoGraph_MapStream(behavior, portId, input, fn)
	if not SATISFIED(DemoGraph_IsStream(input), "Expected graph stream") then
		return
	end
	local items = {}
	for i = 1, #input.items do
		local inputItem = input.items[i]
		items[#items + 1] = {
			key = inputItem.key,
			value = fn(inputItem.value, inputItem.key, i),
		}
	end
	return {
		kind = "stream",
		domain = input.domain,
		items = items,
	}
end

function DemoGraph_MapBinary(behavior, portId, left, right, fn)
	local leftIsStream = DemoGraph_IsStream(left)
	local rightIsStream = DemoGraph_IsStream(right)
	if leftIsStream and rightIsStream then
		if not SATISFIED(DemoGraph_SameDomain(left, right), "Graph streams have different domains") then
			return nil
		end
		local rightByKey = DemoGraph_StreamItemsByKey(right)
		return DemoGraph_MapStream(behavior, portId, left, function(leftValue, key)
			local rightValue = rightByKey[key]
			if not SATISFIED(rightValue ~= nil, "Graph stream is missing a matching key") then
				return nil
			end
			return fn(leftValue, rightValue)
		end)
	end
	if leftIsStream then
		return DemoGraph_MapStream(behavior, portId, left, function(leftValue)
			return fn(leftValue, right)
		end)
	end
	if rightIsStream then
		return DemoGraph_MapStream(behavior, portId, right, function(rightValue)
			return fn(left, rightValue)
		end)
	end
	return fn(left, right)
end

function DemoGraph_MapInputs(behavior, portId, inputs, fn)
	local firstStream = nil
	local streamItemsByInput = {}
	for i = 1, #inputs do
		local input = inputs[i]
		if DemoGraph_IsStream(input) then
			if firstStream == nil then
				firstStream = input
			elseif not SATISFIED(DemoGraph_SameDomain(firstStream, input), "Graph streams have different domains") then
				return nil
			end
			streamItemsByInput[i] = DemoGraph_StreamItemsByKey(input)
		end
	end

	if firstStream ~= nil then
		return DemoGraph_MapStream(behavior, portId, firstStream, function(_, key, itemIndex)
			local itemInputs = {}
			for i = 1, #inputs do
				local streamItems = streamItemsByInput[i]
				if streamItems ~= nil then
					local value = streamItems[key]
					if not SATISFIED(value ~= nil, "Graph stream is missing a matching key") then
						return nil
					end
					itemInputs[i] = value
				else
					itemInputs[i] = inputs[i]
				end
			end
			return fn(itemInputs, key, itemIndex)
		end)
	end

	return fn(inputs, nil, nil)
end

function DemoGraph_SetStreamMetadataOutputs(ctx, behavior, streamPortId, stream, metadataPortIds)
	ctx.setOutput(behavior, streamPortId, stream)
	for i = 1, #metadataPortIds do
		local portId = metadataPortIds[i]
		ctx.setOutput(
			behavior,
			portId,
			DemoGraph_MapStream(behavior, portId, stream, function(frameObject)
				return frameObject ~= nil and frameObject.instance ~= nil and frameObject.instance[portId] or nil
			end)
		)
	end
end

function DemoGraph_SetInstanceMetadataOutputs(ctx, behavior, instances, metadataPortIds)
	DemoGraph_SetStreamMetadataOutputs(ctx, behavior, "instances", instances, metadataPortIds)
end

function DemoGraph_StreamItemsByKey(stream)
	if not SATISFIED(DemoGraph_IsStream(stream), "Expected graph stream") then
		return
	end
	local result = {}
	for i = 1, #stream.items do
		local item = stream.items[i]
		if not SATISFIED(item.key ~= nil, "Graph stream item has no key") then
			return
		end
		if not SATISFIED(result[item.key] == nil, "Graph stream has duplicate key") then
			return
		end
		result[item.key] = item.value
	end
	return result
end

function DemoGraph_IsFrameObject(v)
	-- not very strict
	return type(v) == "table" and type(v.id) == "string"
end

-- hashes a value; outputs a value of the same # of components as the input.
function HashTargetValue(v, seed)
	if IsVec3(v) then
		return {
			x = Hash1D(SafeFloat(v.x) + seed),
			y = Hash1D(SafeFloat(v.y) + seed),
			z = Hash1D(SafeFloat(v.z) + seed),
		}
	elseif type(v) == "number" then
		return Hash1D(v + seed)
	else
		-- not intended design of this but better than crashing or returning 0.
		return DemoCustom_StringHashNumber(v, seed)
	end
end

-- always returns a 3-component hash.
function DemoCustom_TargetHashUnit(target, seed)
	local instanceId = target and target.instanceId or 0
	if type(instanceId) == "number" then
		return Hash3D(instanceId, instanceId * 31, instanceId * 17 + seed)
	end
	local hashNumber = DemoCustom_StringHashNumber(instanceId, seed)
	return Hash3D(hashNumber, hashNumber * 31, hashNumber * 17 + seed)
end

-- value can be nil
function AddNamedField(frameObject, fieldName, value)
	if type(fieldName) ~= "string" or fieldName == "" then
		return
	end
	local fields = GetNamedFields(frameObject)
	if fields ~= nil then
		fields[fieldName] = value
	end
end

function DemoCustom_NamedField(target, fieldName)
	if type(fieldName) ~= "string" or fieldName == "" then
		return
	end
	local fields = target and target.fields or {}
	return fields[fieldName]
end

function DemoCustom_ValueToVec3(value, scalarFallback, componentFallback)
	componentFallback = componentFallback or {}
	if type(value) == "number" then
		return { x = value, y = value, z = value }
	end
	if type(value) ~= "table" then
		local fallback = SafeFloat(scalarFallback)
		return { x = fallback, y = fallback, z = fallback }
	end
	return {
		x = value.x ~= nil and SafeFloat(value.x) or SafeFloat(componentFallback.x),
		y = value.y ~= nil and SafeFloat(value.y) or SafeFloat(componentFallback.y),
		z = value.z ~= nil and SafeFloat(value.z) or SafeFloat(componentFallback.z),
	}
end

function DemoCustom_InstanceFieldScalar(value, component)
	if type(value) == "number" then
		return value
	end
	if type(value) ~= "table" then
		return 0
	end
	if component == "y" then
		return SafeFloat(value.y)
	end
	if component == "z" then
		return SafeFloat(value.z)
	end
	return SafeFloat(value.x)
end

-- calls fn for each referenced target. targetId is either a sceneObjectId or emitterBehaviorId
-- used by behaviors that can target either a specific object or all objects emitted by a behavior.
function ForEachTargetObject(frameScene, targetId, fn)
	if not SATISFIED(frameScene ~= nil and targetId ~= nil and targetId ~= "", "Invalid frameScene or targetId") then
		return
	end
	local objects = frameScene.objects
	local matched = 0
	for i = 1, #objects do
		local obj = objects[i]
		local instance = obj.instance
		if instance ~= nil and instance.emitterBehaviorId == targetId then
			matched = matched + 1
			fn(obj, DemoCustom_TargetInfo(obj))
		end
	end
	if matched > 0 then
		return
	end

	local obj = Demo_GetFrameSceneObject(frameScene, targetId)
	if obj ~= nil then
		fn(obj, DemoCustom_TargetInfo(obj))
	end
end

-- returns an array of all target objects matching the targetId, which can be either a sceneObjectId or emitterBehaviorId.
function GetTargetInstances(frameScene, targetId)
	local result = {}
	ForEachTargetObject(frameScene, targetId, function(obj)
		table.insert(result, obj)
	end)
	return result
end

function DemoCustom_GetTablePath(value, path)
	if type(path) ~= "string" or path == "" then
		return value
	end
	for segment in string.gmatch(path, "[^%.]+") do
		if type(value) ~= "table" then
			return nil
		end
		value = value[segment]
	end
	return value
end

function DemoCustom_SetTablePath(value, path, newValue)
	local target = value
	local previousSegment = nil
	for segment in string.gmatch(path, "[^%.]+") do
		if previousSegment ~= nil then
			target[previousSegment] = target[previousSegment] or {}
			target = target[previousSegment]
		end
		previousSegment = segment
	end
	if previousSegment ~= nil then
		target[previousSegment] = newValue
	end
end

function DemoCustom_MapValue(value, sourceMin, sourceMax, destMin, destMax, shouldClamp)
	local denom = sourceMax - sourceMin
	local u = denom ~= 0 and (value - sourceMin) / denom or 0
	if shouldClamp then
		u = (u < 0 and 0 or (u > 1 and 1 or u))
	end
	return (destMin + (destMax - destMin) * u)
end

function DemoCustom_ApplyScalar(baseValue, mappedValue, applyMode)
	baseValue = SafeFloat(baseValue)
	if applyMode == "multiply" then
		return baseValue * mappedValue
	end
	if applyMode == "override" then
		return mappedValue
	end
	-- "add"
	return baseValue + mappedValue
end

function DemoCustom_ApplyVec3Mode(baseValue, mappedValue, applyMode)
	baseValue = SafeVec3(baseValue)
	mappedValue = SafeVec3(mappedValue)
	if applyMode == "multiply" then
		return {
			x = baseValue.x * mappedValue.x,
			y = baseValue.y * mappedValue.y,
			z = baseValue.z * mappedValue.z,
		}
	end
	if applyMode == "override" then
		return mappedValue
	end
	return {
		x = baseValue.x + mappedValue.x,
		y = baseValue.y + mappedValue.y,
		z = baseValue.z + mappedValue.z,
	}
end

-- function DemoCustom_ShouldMapComponent(mapping, component)
-- 	if mapping == "none" then
-- 		return false
-- 	end
-- 	if component == "x" then
-- 		return mapping == "x" or mapping == "xy" or mapping == "xz" or mapping == "xyz"
-- 	end
-- 	if component == "y" then
-- 		return mapping == "y" or mapping == "xy" or mapping == "yz" or mapping == "xyz"
-- 	end
-- 	return mapping == "xz" or mapping == "yz" or mapping == "xyz"
-- end

-- function DemoCustom_ApplyMappedScalarToTable(baseValue, mappedValue, applyMode, mapping)
-- 	if type(baseValue) ~= "table" or mapping == "none" then
-- 		return baseValue
-- 	end

-- 	local result = CloneTable(baseValue)

-- 	if DemoCustom_ShouldMapComponent(mapping, "x") then
-- 		result.x = DemoCustom_ApplyScalar(result.x, mappedValue, applyMode)
-- 	end
-- 	if DemoCustom_ShouldMapComponent(mapping, "y") then
-- 		result.y = DemoCustom_ApplyScalar(result.y, mappedValue, applyMode)
-- 	end
-- 	if result.z ~= nil and DemoCustom_ShouldMapComponent(mapping, "z") then
-- 		result.z = DemoCustom_ApplyScalar(result.z, mappedValue, applyMode)
-- 	end
-- 	return result
-- end

-- function DemoCustom_SetFrameObjectPropertyPreservingLayout(frameObject, property, mappedValue, applyMode, mapping)
-- 	mapping = mapping or "xyz"
-- 	local current = DemoCustom_GetTablePath(frameObject, property)
-- 	if type(current) == "table" then
-- 		DemoCustom_SetTablePath(
-- 			frameObject,
-- 			property,
-- 			DemoCustom_ApplyMappedScalarToTable(current, mappedValue, applyMode, mapping)
-- 		)
-- 		return
-- 	end
-- 	DemoCustom_SetTablePath(frameObject, property, DemoCustom_ApplyScalar(current, mappedValue, applyMode))
-- end

-- function DemoCustom_ApplyFrameObjectVectorProperty(frameObject, property, mappedValue, applyMode)
-- 	local current = DemoCustom_GetTablePath(frameObject, property)
-- 	local v = DemoCustom_ApplyVec3Mode(current, mappedValue, applyMode)
-- 	if type(current) == "table" and current.z == nil then
-- 		v.z = nil
-- 	end
-- 	DemoCustom_SetTablePath(frameObject, property, v)
-- end

function DemoCustom_OffsetFrameObject(frameObject, offset)
	-- TODO: don't depend on specific properties
	if frameObject.position ~= nil then
		frameObject.position.x = SafeFloat(frameObject.position.x) + offset.x
		frameObject.position.y = SafeFloat(frameObject.position.y) + offset.y
		frameObject.position.z = SafeFloat(frameObject.position.z) + offset.z
	end
	if frameObject.lineStart ~= nil then
		frameObject.lineStart.x = SafeFloat(frameObject.lineStart.x) + offset.x
		frameObject.lineStart.y = SafeFloat(frameObject.lineStart.y) + offset.y
		frameObject.lineStart.z = SafeFloat(frameObject.lineStart.z) + offset.z
	end
	if frameObject.lineEnd ~= nil then
		frameObject.lineEnd.x = SafeFloat(frameObject.lineEnd.x) + offset.x
		frameObject.lineEnd.y = SafeFloat(frameObject.lineEnd.y) + offset.y
		frameObject.lineEnd.z = SafeFloat(frameObject.lineEnd.z) + offset.z
	end
end

function DemoCustom_AddLinearOffsetVector(value, offset)
	value = value or {}
	if value.z ~= nil then
		return {
			x = SafeFloat(value.x) + offset.x,
			y = SafeFloat(value.y) + offset.y,
			z = SafeFloat(value.z) + offset.z,
		}
	end
	return {
		x = SafeFloat(value.x) + offset.x,
		y = SafeFloat(value.y) + offset.y,
	}
end

function IsPropertyRef(p)
	-- a valid p is a table with fields:
	-- nodeId (string)
	-- fieldId (string)
	return type(p) == "table" and type(p.nodeId) == "string" and type(p.fieldId) == "string"
end

function DemoCustom_AddAccumulatorVector(value, offset)
	value = value or {}
	if value.z ~= nil then
		return {
			x = SafeFloat(value.x) + offset.x,
			y = SafeFloat(value.y) + offset.y,
			z = SafeFloat(value.z) + offset.z,
		}
	end
	return {
		x = SafeFloat(value.x) + offset.x,
		y = SafeFloat(value.y) + offset.y,
	}
end

function GetVariantInput(ctx, behavior, inputName, defaultValue)
	local value = ctx.getInput(behavior, inputName)
	if value ~= nil then
		return value
	end
	return ctx.getBehaviorParam(behavior, inputName, defaultValue)
end

function GetVec3Input(ctx, behavior, inputName, defaultValue)
	local value = ctx.getInput(behavior, inputName)
	if value == nil then
		value = ctx.getBehaviorParam(behavior, inputName, defaultValue)
	end
	return SafeVec3(value, defaultValue)
end

function GetVec2Input(ctx, behavior, inputName, defaultValue)
	local value = ctx.getInput(behavior, inputName)
	if value == nil then
		value = ctx.getBehaviorParam(behavior, inputName, defaultValue)
	end
	return SafeVec2(value, defaultValue)
end

function GetSize2Input(ctx, behavior, inputName, defaultValue)
	return GetVec2Input(ctx, behavior, inputName, defaultValue)
end

function GetFloatInput(ctx, behavior, inputName, defaultValue)
	local value = ctx.getInput(behavior, inputName)
	if value == nil then
		value = ctx.getBehaviorParam(behavior, inputName, defaultValue)
	end
	return SafeFloat(value, defaultValue)
end

function GetBoolInput(ctx, behavior, inputName, defaultValue)
	local value = ctx.getInput(behavior, inputName)
	if value == nil then
		value = ctx.getBehaviorParam(behavior, inputName, defaultValue)
	end
	return SafeBool(value, defaultValue)
end

function GetStringInput(ctx, behavior, inputName, defaultValue)
	local value = ctx.getInput(behavior, inputName)
	if value == nil then
		value = ctx.getBehaviorParam(behavior, inputName, defaultValue)
	end
	return SafeString(value, defaultValue)
end

function GraphTexture_SetDimensionOutputs(ctx, behavior, texture)
	if texture == nil then
		return
	end
	ctx.setOutput(behavior, "width", SafeFloat(texture.width))
	ctx.setOutput(behavior, "height", SafeFloat(texture.height))
end

function GraphMath_BinaryNumericAggregateTableScalar(value, scalar, opName, op)
	local result = CloneTable(value)
	local componentCount = 0
	for key, component in pairs(value) do
		if type(component) == "number" then
			result[key] = op(component, scalar)
			componentCount = componentCount + 1
		end
	end
	if not SATISFIED(componentCount > 0, opName .. " table has no numeric components") then
		return nil
	end
	return result
end

function GraphMath_BinaryNumericAggregate(a, b, opName, op)
	if type(a) == "number" and type(b) == "number" then
		return op(a, b)
	end
	if type(a) == "table" and type(b) == "number" then
		return GraphMath_BinaryNumericAggregateTableScalar(a, b, opName, op)
	end
	if type(a) == "number" and type(b) == "table" then
		return GraphMath_BinaryNumericAggregateTableScalar(b, a, opName, function(component, scalar)
			return op(scalar, component)
		end)
	end
	if type(a) == "table" and type(b) == "table" then
		local result = CloneTable(a)
		local componentCount = 0
		for key, component in pairs(a) do
			if type(component) == "number" then
				if not SATISFIED(type(b[key]) == "number", opName .. " tables have incompatible components") then
					return nil
				end
				result[key] = op(component, b[key])
				componentCount = componentCount + 1
			end
		end
		if not SATISFIED(componentCount > 0, opName .. " tables have no numeric components") then
			return nil
		end
		return result
	end
	if not SATISFIED(false, opName .. " requires numeric values") then
		return nil
	end
	return nil
end

function GraphMath_EvaluateBinaryNumericAggregate(ctx, behavior, defaultA, defaultB, opName, op)
	local a = ctx.getInput(behavior, "a", ctx.getBehaviorParam(behavior, "a", defaultA))
	local b = ctx.getInput(behavior, "b", ctx.getBehaviorParam(behavior, "b", defaultB))
	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapBinary(behavior, "value", a, b, function(inputA, inputB)
			return GraphMath_BinaryNumericAggregate(inputA, inputB, opName, op)
		end)
	)
end

function GraphMath_HasNumericComponents(value)
	if type(value) == "number" then
		return true
	end
	if type(value) ~= "table" then
		return false
	end
	for _, component in pairs(value) do
		if type(component) == "number" then
			return true
		end
	end
	return false
end

function GraphMath_NumericComponent(value, key)
	if type(value) == "number" then
		return value
	end
	if type(value) == "table" and type(value[key]) == "number" then
		return value[key]
	end
	return nil
end

function GraphMath_FindNumericAggregateTemplate(values, preferredIndex)
	if
		preferredIndex ~= nil
		and type(values[preferredIndex]) == "table"
		and GraphMath_HasNumericComponents(values[preferredIndex])
	then
		return values[preferredIndex]
	end
	for i = 1, #values do
		if type(values[i]) == "table" and GraphMath_HasNumericComponents(values[i]) then
			return values[i]
		end
	end
	return nil
end

function GraphMath_NumericAggregateFromValues(values, opName, preferredTemplateIndex, op)
	local template = GraphMath_FindNumericAggregateTemplate(values, preferredTemplateIndex)
	if template == nil then
		for i = 1, #values do
			if not SATISFIED(type(values[i]) == "number", opName .. " requires numeric values") then
				return nil
			end
		end
		return op(values, nil)
	end

	local result = CloneTable(template)
	local componentCount = 0
	for key, component in pairs(template) do
		if type(component) == "number" then
			local componentValues = {}
			for i = 1, #values do
				local componentValue = GraphMath_NumericComponent(values[i], key)
				if not SATISFIED(componentValue ~= nil, opName .. " inputs have incompatible components") then
					return nil
				end
				componentValues[i] = componentValue
			end
			result[key] = op(componentValues, key)
			componentCount = componentCount + 1
		end
	end
	if not SATISFIED(componentCount > 0, opName .. " table has no numeric components") then
		return nil
	end
	return result
end

function GraphMath_NumericAggregateBranchMask(values, opName, preferredTemplateIndex, op)
	local template = GraphMath_FindNumericAggregateTemplate(values, preferredTemplateIndex)
	if template == nil then
		for i = 1, #values do
			if not SATISFIED(type(values[i]) == "number", opName .. " requires numeric values") then
				return nil
			end
		end
		return op(values, nil) == true
	end

	local result = {}
	local componentCount = 0
	for key, component in pairs(template) do
		if type(component) == "number" then
			local componentValues = {}
			for i = 1, #values do
				local componentValue = GraphMath_NumericComponent(values[i], key)
				if not SATISFIED(componentValue ~= nil, opName .. " inputs have incompatible components") then
					return nil
				end
				componentValues[i] = componentValue
			end
			result[key] = op(componentValues, key) == true
			componentCount = componentCount + 1
		end
	end
	if not SATISFIED(componentCount > 0, opName .. " table has no numeric components") then
		return nil
	end
	return result
end

function GraphMath_MaskValueNeedsBranch(maskValue, branchValue)
	if type(maskValue) == "boolean" then
		return maskValue == branchValue
	end
	if type(maskValue) == "table" then
		for _, component in pairs(maskValue) do
			if type(component) == "boolean" and component == branchValue then
				return true
			end
		end
	end
	return false
end

function GraphMath_MaskNeedsBranch(mask, branchValue)
	if DemoGraph_IsStream(mask) then
		for i = 1, #mask.items do
			if GraphMath_MaskValueNeedsBranch(mask.items[i].value, branchValue) then
				return true
			end
		end
		return false
	end
	return GraphMath_MaskValueNeedsBranch(mask, branchValue)
end

function GraphMath_SelectNumericAggregateByMask(maskValue, lowValue, highValue, opName)
	if type(maskValue) == "boolean" then
		local selectedValue = maskValue and highValue or lowValue
		if not SATISFIED(GraphMath_HasNumericComponents(selectedValue), opName .. " requires numeric values") then
			return nil
		end
		return selectedValue
	end
	if type(maskValue) == "table" then
		local result = {}
		local componentCount = 0
		for key, useHigh in pairs(maskValue) do
			if type(useHigh) == "boolean" then
				result[key] =
					GraphMath_NumericAggregateComponentOrScalar(useHigh and highValue or lowValue, key, nil, opName)
				componentCount = componentCount + 1
			end
		end
		if not SATISFIED(componentCount > 0, opName .. " table has no numeric components") then
			return nil
		end
		return result
	end
	if not SATISFIED(false, opName .. " requires numeric values") then
		return nil
	end
	return nil
end

function GraphMath_SetLazyBranchOutput(ctx, behavior, outputPortId, mask, lowDefault, highDefault, opName)
	if mask == nil then
		return
	end
	local inputs = { mask }
	local lowInputIndex = nil
	local highInputIndex = nil
	if GraphMath_MaskNeedsBranch(mask, false) then
		lowInputIndex = #inputs + 1
		inputs[lowInputIndex] = GetVariantInput(ctx, behavior, "low", lowDefault)
	end
	if GraphMath_MaskNeedsBranch(mask, true) then
		highInputIndex = #inputs + 1
		inputs[highInputIndex] = GetVariantInput(ctx, behavior, "high", highDefault)
	end
	ctx.setOutput(
		behavior,
		outputPortId,
		DemoGraph_MapInputs(behavior, outputPortId, inputs, function(values)
			return GraphMath_SelectNumericAggregateByMask(
				values[1],
				lowInputIndex ~= nil and values[lowInputIndex] or nil,
				highInputIndex ~= nil and values[highInputIndex] or nil,
				opName
			)
		end)
	)
end

function GraphMath_EvaluateNumericAggregateInputs(
	ctx,
	behavior,
	inputSpecs,
	outputPortId,
	opName,
	preferredTemplateIndex,
	op
)
	local inputs = {}
	for i = 1, #inputSpecs do
		local spec = inputSpecs[i]
		inputs[i] = ctx.getInput(
			behavior,
			spec.portId,
			ctx.getBehaviorParam(behavior, spec.paramId or spec.portId, spec.defaultValue)
		)
	end
	ctx.setOutput(
		behavior,
		outputPortId,
		DemoGraph_MapInputs(behavior, outputPortId, inputs, function(values)
			return GraphMath_NumericAggregateFromValues(values, opName, preferredTemplateIndex, op)
		end)
	)
end

-- returns a shallow clone of a vector-like numeric aggregate, or the scalar value itself.
function GraphMath_CloneNumericAggregate(value)
	if type(value) == "table" then
		return CloneTable(value)
	end
	return value
end

function GraphMath_NumericAggregateShapeMatches(value, target)
	if type(target) == "number" then
		return type(value) == "number"
	end
	if type(target) ~= "table" or type(value) ~= "table" then
		return false
	end

	local componentCount = 0
	for key, component in pairs(target) do
		if type(component) == "number" then
			if type(value[key]) ~= "number" then
				return false
			end
			componentCount = componentCount + 1
		end
	end
	return componentCount > 0
end

function GraphMath_ZeroNumericAggregateLike(value)
	if type(value) == "number" then
		return 0
	end
	if type(value) == "table" then
		local result = CloneTable(value)
		local componentCount = 0
		for key, component in pairs(value) do
			if type(component) == "number" then
				result[key] = 0
				componentCount = componentCount + 1
			end
		end
		if not SATISFIED(componentCount > 0, "Numeric aggregate has no numeric components") then
			return nil
		end
		return result
	end
	if not SATISFIED(false, "Expected numeric aggregate") then
		return nil
	end
	return nil
end

function GraphMath_NumericAggregateComponentOrScalar(value, key, fallback, opName)
	if type(value) == "number" then
		return value
	end
	if key ~= nil and type(value) == "table" and type(value[key]) == "number" then
		return value[key]
	end
	if fallback ~= nil then
		return fallback
	end
	if not SATISFIED(false, opName .. " input has incompatible components") then
		return 0
	end
	return 0
end

function ObjectInputToStream(behavior, portId, value)
	if DemoGraph_IsStream(value) then
		return value
	end
	if value == nil then
		return nil
	end
	if not SATISFIED(DemoGraph_IsFrameObject(value), "SetProperty requires frame objects") then
		return nil
	end
	return DemoGraph_NewStream(behavior, portId, {
		{
			key = 0,
			value = value,
		},
	})
end

function FlattenInputsToStream(behavior, portId, inputs)
	local items = {}
	for i = 1, #inputs do
		local input = inputs[i]
		if DemoGraph_IsStream(input) then
			for j = 1, #input.items do
				items[#items + 1] = {
					key = #items,
					value = input.items[j].value,
				}
			end
		else
			items[#items + 1] = {
				key = #items,
				value = input,
			}
		end
	end
	return DemoGraph_NewStream(behavior, portId, items)
end

function GraphFill_MaterialRefs(matId1, matId2)
	local refs = {}
	if type(matId1) == "string" and matId1 ~= "" then
		refs[#refs + 1] = matId1
	end
	if type(matId2) == "string" and matId2 ~= "" then
		refs[#refs + 1] = matId2
	end
	return refs
end

function GraphFill_TextureRefs(textureId, sourceRefs)
	local refs = {}
	for _, sourceTextureId in ipairs(sourceRefs or {}) do
		refs[#refs + 1] = sourceTextureId
	end
	if type(textureId) == "string" and textureId ~= "" then
		refs[#refs + 1] = textureId
	end
	return refs
end

function GraphFill_Flat(materialId, tone)
	if type(materialId) ~= "string" or materialId == "" then
		return nil
	end
	return {
		type = "flat",
		materialId = materialId,
		tone = tone or 0,
		referencedMaterialIds = GraphFill_MaterialRefs(materialId),
	}
end

function GraphFill_LinearGradient(materialId, toneA, toneB, axis)
	if type(materialId) ~= "string" or materialId == "" then
		return nil
	end
	return {
		type = "linearGradient",
		materialId = materialId,
		toneA = toneA or 0,
		toneB = toneB or 1,
		axis = axis or "x",
		referencedMaterialIds = GraphFill_MaterialRefs(materialId),
	}
end

function GraphFill_RadialGradient(materialId, toneA, toneB)
	if type(materialId) ~= "string" or materialId == "" then
		return nil
	end
	return {
		type = "radialGradient",
		materialId = materialId,
		toneA = toneA or 1,
		toneB = toneB or 0,
		referencedMaterialIds = GraphFill_MaterialRefs(materialId),
	}
end

function GraphFill_Texture(textureId, texture)
	if type(textureId) ~= "string" or textureId == "" then
		return nil
	end
	return {
		type = "texture",
		textureId = textureId,
		referencedTextureIds = GraphFill_TextureRefs(textureId),
		referencedMaterialIds = texture and texture.referencedMaterialIds or {},
	}
end

function GraphFill_Masked(maskTextureId, sourceFill)
	if (type(maskTextureId) ~= "string" or maskTextureId == "") or sourceFill == nil then
		return nil
	end
	return {
		type = "masked",
		maskTextureId = maskTextureId,
		source = sourceFill,
		referencedTextureIds = GraphFill_TextureRefs(maskTextureId, sourceFill.referencedTextureIds),
		referencedMaterialIds = sourceFill.referencedMaterialIds or {},
	}
end

function G_FlatFill(ctx, behavior)
	local params = behavior.params or {}
	local fill = GraphFill_Flat(
		GetStringInput(ctx, behavior, "materialId", params.materialId),
		GetFloatInput(ctx, behavior, "tone", params.tone or 0)
	)
	if fill ~= nil then
		ctx.setOutput(behavior, "fill", fill)
	end
end

function G_MaskedFill(ctx, behavior)
	local params = behavior.params or {}
	local fill = GraphFill_Masked(
		GetStringInput(ctx, behavior, "maskTextureId", params.maskTextureId),
		ctx.getInput(behavior, "sourceFill", params.sourceFill)
	)
	if fill ~= nil then
		ctx.setOutput(behavior, "fill", fill)
	end
end

function G_LinearGradientFill(ctx, behavior)
	local params = behavior.params or {}
	local fill = GraphFill_LinearGradient(
		GetStringInput(ctx, behavior, "materialId", params.materialId),
		GetFloatInput(ctx, behavior, "toneA", params.toneA or 0),
		GetFloatInput(ctx, behavior, "toneB", params.toneB or 1),
		GetStringInput(ctx, behavior, "axis", params.axis or "x")
	)
	if fill ~= nil then
		ctx.setOutput(behavior, "fill", fill)
	end
end

function G_RadialGradientFill(ctx, behavior)
	local params = behavior.params or {}
	local fill = GraphFill_RadialGradient(
		GetStringInput(ctx, behavior, "materialId", params.materialId),
		GetFloatInput(ctx, behavior, "toneA", params.toneA or 1),
		GetFloatInput(ctx, behavior, "toneB", params.toneB or 0)
	)
	if fill ~= nil then
		ctx.setOutput(behavior, "fill", fill)
	end
end

function G_TextureFill(ctx, behavior)
	local params = behavior.params or {}
	local textureId = GetStringInput(ctx, behavior, "textureId", params.textureId)
	local texture = textureId ~= nil and ctx.textures[textureId] or nil
	GraphTexture_SetDimensionOutputs(ctx, behavior, texture)
	local fill = GraphFill_Texture(textureId, texture)
	if fill ~= nil then
		ctx.setOutput(behavior, "fill", fill)
	end
end

function G_ValueNoiseTexture(ctx, behavior)
	local params = behavior.params or {}
	local materialId = GetStringInput(ctx, behavior, "materialId", params.materialId)
	if type(materialId) ~= "string" or materialId == "" then
		return
	end

	ctx.setOutput(behavior, "fill", {
		type = "valueNoise",
		materialId = materialId,
		scale = max(1, GetFloatInput(ctx, behavior, "scale", params.scale or 8)),
		phase = GetFloatInput(ctx, behavior, "phase", params.phase or 0),
		minTone = GetFloatInput(ctx, behavior, "minTone", params.minTone or 0),
		maxTone = GetFloatInput(ctx, behavior, "maxTone", params.maxTone or 1),
		referencedMaterialIds = { materialId },
	})
end

function G_CheckeredPatternTexture(ctx, behavior)
	local params = behavior.params or {}
	local materialAId = GetStringInput(ctx, behavior, "materialAId", params.materialAId)
	local materialBId = GetStringInput(ctx, behavior, "materialBId", params.materialBId)
	if
		(type(materialAId) ~= "string" or materialAId == "") and (type(materialBId) ~= "string" or materialBId == "")
	then
		return
	end

	ctx.setOutput(behavior, "fill", {
		type = "checkered",
		materialAId = materialAId,
		materialBId = materialBId,
		toneA = GetFloatInput(ctx, behavior, "toneA", params.toneA or 1),
		toneB = GetFloatInput(ctx, behavior, "toneB", params.toneB or 1),
		scale = GetSize2Input(ctx, behavior, "scale", { x = 7, y = 7 }),
		offset = GetVec2Input(ctx, behavior, "offset", { x = 0, y = 0 }),
		referencedMaterialIds = GraphFill_MaterialRefs(materialAId, materialBId),
	})
end

function G_CameraLookAt(ctx, behavior, frameScene, sceneRuntime, pass, frameCamera, frameCameraId)
	local camera = ctx.getInput(behavior, "camera", frameCamera)
	if camera == nil then
		return
	end

	local fallback = ctx.getBehaviorParam(behavior, "targetPosition", nil)
	local targetPoint = ctx.getInput(behavior, "targetPosition", fallback)

	DEMO_ASSERT(targetPoint ~= nil, "camlookat: missing position")

	local result = Demo_CloneCamera(camera)
	Demo_CameraLookAt(result, SafeVec3(targetPoint))
	ctx.setOutput(behavior, "result", result)
end

local function GraphProperty_Ref(fieldId)
	return {
		nodeId = "",
		fieldId = fieldId,
	}
end

local GraphProperty_VisibleRef = GraphProperty_Ref("visible")
local GraphProperty_MaterialRef = GraphProperty_Ref("materialId")
local GraphProperty_ToneRef = GraphProperty_Ref("tone")
local GraphProperty_FillRef = GraphProperty_Ref("fill")
local GraphProperty_ScaleUniformRef = GraphProperty_Ref("scaleUniform")
local GraphProperty_RadiusRef = GraphProperty_Ref("radius")
local GraphProperty_AngleRef = GraphProperty_Ref("angleDeg")

local function GraphProperty_SetObjects(ctx, behavior, opName, valueInputs, applyFn)
	local objects = ObjectInputToStream(behavior, "objectsOut", ctx.getInput(behavior, "objects", nil))
	if not SATISFIED(objects ~= nil, opName .. " requires objects") then
		return
	end
	for i = 1, #valueInputs do
		if not SATISFIED(valueInputs[i] ~= nil, opName .. " requires a value") then
			return
		end
	end

	local streamValuesByInput = {}
	for i = 1, #valueInputs do
		local valueInput = valueInputs[i]
		if DemoGraph_IsStream(valueInput) then
			if
				not SATISFIED(DemoGraph_SameDomain(objects, valueInput), opName .. " streams have different domains")
			then
				return
			end
			local valuesByKey = DemoGraph_StreamItemsByKey(valueInput)
			if valuesByKey == nil then
				return
			end
			streamValuesByInput[i] = valuesByKey
		end
	end

	for i = 1, #objects.items do
		local item = objects.items[i]
		for _, valuesByKey in pairs(streamValuesByInput) do
			if not SATISFIED(valuesByKey[item.key] ~= nil, opName .. " value stream is missing an object key") then
				return
			end
		end
	end

	for i = 1, #objects.items do
		local item = objects.items[i]
		local values = { item.value }
		for inputIndex = 1, #valueInputs do
			local valuesByKey = streamValuesByInput[inputIndex]
			values[#values + 1] = valuesByKey ~= nil and valuesByKey[item.key] or valueInputs[inputIndex]
		end
		applyFn(item.value, values)
	end
	ctx.setOutput(behavior, "objectsOut", objects)
end

local function GraphProperty_SetField(ctx, behavior, opName, propertyBinding, values)
	if not SATISFIED(IsPropertyRef(propertyBinding), "SetProperty requires a target property") then
		return
	end
	GraphProperty_SetObjects(ctx, behavior, opName, { values }, function(frameObject, mappedValues)
		ctx.setGraphFrameObjectProperty(behavior, frameObject, propertyBinding, mappedValues[2])
	end)
end

local function GraphProperty_SetFloat(ctx, behavior, opName, inputName, propertyBinding, defaultValue)
	local params = behavior.params or {}
	local fallback = params[inputName] or defaultValue
	local value = GetVariantInput(ctx, behavior, inputName, fallback)
	GraphProperty_SetObjects(ctx, behavior, opName, { value }, function(frameObject, values)
		ctx.setGraphFrameObjectProperty(behavior, frameObject, propertyBinding, SafeFloat(values[2], fallback))
	end)
end

function G_SetProperty(ctx, behavior)
	local values = ctx.getInput(behavior, "value", ctx.getBehaviorParam(behavior, "value", nil))
	local propertyBinding =
		ctx.getInput(behavior, "targetProperty", ctx.getBehaviorParam(behavior, "targetProperty", nil))
	GraphProperty_SetField(ctx, behavior, "SetProperty", propertyBinding, values)
end

function G_SetVisible(ctx, behavior)
	local params = behavior.params or {}
	local defaultVisible = params.visible ~= false
	local visible = GetVariantInput(ctx, behavior, "visible", defaultVisible)
	GraphProperty_SetObjects(ctx, behavior, "SetVisible", { visible }, function(frameObject, values)
		ctx.setGraphFrameObjectProperty(
			behavior,
			frameObject,
			GraphProperty_VisibleRef,
			SafeBool(values[2], defaultVisible)
		)
	end)
end

function G_SetColor(ctx, behavior)
	local params = behavior.params or {}
	local defaultMaterialId = params.materialId or ""
	local materialId = GetVariantInput(ctx, behavior, "materialId", defaultMaterialId)
	local defaultTone = params.tone or 0
	local tone = GetVariantInput(ctx, behavior, "tone", defaultTone)
	GraphProperty_SetObjects(ctx, behavior, "SetColor", { materialId, tone }, function(frameObject, values)
		local nextMaterialId = SafeString(values[2], defaultMaterialId)
		local nextTone = SafeFloat(values[3], defaultTone)
		ctx.setGraphFrameObjectProperty(behavior, frameObject, GraphProperty_MaterialRef, nextMaterialId)
		ctx.setGraphFrameObjectProperty(behavior, frameObject, GraphProperty_ToneRef, nextTone)
		ctx.setGraphFrameObjectProperty(
			behavior,
			frameObject,
			GraphProperty_FillRef,
			GraphFill_Flat(nextMaterialId, nextTone)
		)
	end)
end

function G_SetFill(ctx, behavior)
	local fill = GetVariantInput(ctx, behavior, "fill", (behavior.params or {}).fill)
	GraphProperty_SetField(ctx, behavior, "SetFill", GraphProperty_FillRef, fill)
end

function G_SetUniformScale(ctx, behavior)
	GraphProperty_SetFloat(ctx, behavior, "SetUniformScale", "scaleUniform", GraphProperty_ScaleUniformRef, 1)
end

function G_SetRadius(ctx, behavior)
	GraphProperty_SetFloat(ctx, behavior, "SetRadius", "radius", GraphProperty_RadiusRef, 1)
end

function G_SetAngle(ctx, behavior)
	GraphProperty_SetFloat(ctx, behavior, "SetAngle", "angleDeg", GraphProperty_AngleRef, 0)
end

function GraphInput_Mouse()
	local x, y, leftDown, _, rightDown = mouse()
	return x, y, leftDown == true, rightDown == true
end

function GraphInput_ButtonClick(behavior, stateKey, down)
	local state = behavior.state
	state.graphInputButtons = state.graphInputButtons or {}
	local wasDown = state.graphInputButtons[stateKey] == true
	state.graphInputButtons[stateKey] = down
	return down and not wasDown
end

function G_MousePosition(ctx, behavior)
	local x, y = GraphInput_Mouse()
	ctx.setOutput(behavior, "position", { x = x, y = y })
	ctx.setOutput(behavior, "position3", { x = x, y = y, z = 0 })
	ctx.setOutput(behavior, "x", x)
	ctx.setOutput(behavior, "y", y)
end

function G_MouseLeftClick(ctx, behavior)
	local _, _, leftDown = GraphInput_Mouse()
	ctx.setOutput(behavior, "value", GraphInput_ButtonClick(behavior, "left", leftDown))
	ctx.setOutput(behavior, "down", leftDown)
end

function G_MouseRightClick(ctx, behavior)
	local _, _, _, rightDown = GraphInput_Mouse()
	ctx.setOutput(behavior, "value", GraphInput_ButtonClick(behavior, "right", rightDown))
	ctx.setOutput(behavior, "down", rightDown)
end

function G_IsDebug(ctx, behavior)
	ctx.setOutput(behavior, "value", true)
end

function G_IsRelease(ctx, behavior)
	ctx.setOutput(behavior, "value", false)
end

function G_HudStatus(ctx, behavior)
	local level = SafeFloat(gDebugHudLevel, 0)
	ctx.setOutput(behavior, "level", level)
	ctx.setOutput(behavior, "visible", level > 0)
end

-- lua impl of maj7's curve fn
-- https://github.com/thenfour/WaveSabre/blob/master/WaveSabreCore/Basic/LUTs.hpp
local function CurveK(x, k)
	return pow(1 - pow(x, k), 1 / k)
end

function Curve01(x, k)
	x = SafeFloat(x)
	x = (x < 0 and 0 or (x > 1 and 1 or x))
	k = SafeFloat(k)
	k = (k < -1 and -1 or (k > 1 and 1 or k))
	if abs(k) < 0.0001 then
		return x
	end
	k = k * 0.6 -- corner margin
	local n = x * 2 - 1
	local y
	if k >= 0 then
		y = n > 0 and 1 - CurveK(n, 1 - k) or CurveK(-n, 1 - k) - 1
	else
		y = n > 0 and CurveK(1 - n, 1 + k) or -CurveK(n + 1, 1 + k)
	end
	return ((y * 0.5 + 0.5) < 0 and 0 or ((y * 0.5 + 0.5) > 1 and 1 or (y * 0.5 + 0.5)))
end

function StageCurve(u, curve, dir)
	u = SafeFloat(u)
	u = (u < 0 and 0 or (u > 1 and 1 or u))
	return dir == "fall" and 1 - Curve01(1 - u, curve) or Curve01(u, curve)
end

function Env_New(v)
	v = SafeFloat(v)
	return {
		st = "idle", --
		p = 0,
		v = v,
		sv = v,
		gate = false,
	}
end

function Env_Trigger(e, c)
	e = e or Env_New(c and c.base)
	e.sv = SafeFloat(e.v, c and c.base or 0)
	e.p = 0
	e.st = "attack"
	e.gate = true
	return e
end

function Env_Release(e)
	e.sv = SafeFloat(e.v)
	e.p = 0
	e.st = "release"
end

function Env_IsOneShotMode(c)
	return c ~= nil and (c.mode == "oneShot" or c.mode == "trigger")
end

function Env_Gate(e, c, gate)
	e = e or Env_New(c and c.base)
	gate = gate == true
	if gate and not e.gate then
		Env_Trigger(e, c)
	elseif not gate and e.gate then
		e.gate = false
		if e.st ~= "idle" and e.st ~= "release" then
			Env_Release(e)
		end
	else
		e.gate = gate
	end
	return e
end

local function Env_Dur(c, st)
	if st == "attack" then
		return max(0, SafeFloat(c.a))
	end
	if st == "hold" then
		return max(0, SafeFloat(c.h))
	end
	if st == "decay" then
		return max(0, SafeFloat(c.d))
	end
	if st == "release" then
		return max(0, SafeFloat(c.r))
	end
	return 0
end

local function Env_Next(e, c)
	if e.st == "attack" then
		e.st = "hold"
	elseif e.st == "hold" then
		e.st = "decay"
	elseif e.st == "decay" then
		if Env_IsOneShotMode(c) then
			Env_Release(e)
			return
		end
		e.st = e.gate and "sustain" or "release"
	elseif e.st == "release" then
		e.st = "idle"
	else
		e.st = "idle"
	end
	e.p = 0
	e.sv = SafeFloat(e.v, c.base)
end

local function Env_Eval(e, c)
	if e.st == "idle" then
		return SafeFloat(c.base)
	end
	if e.st == "hold" then
		return SafeFloat(c.peak, 1)
	end
	if e.st == "sustain" then
		return SafeFloat(c.sus, 1)
	end
	local u = (e.p < 0 and 0 or (e.p > 1 and 1 or e.p))
	if e.st == "attack" then
		return (e.sv + ((SafeFloat(c.peak, 1)) - e.sv) * (StageCurve(u, c.ac, "rise")))
	end
	if e.st == "decay" then
		local speak = SafeFloat(c.peak, 1)
		return (speak + ((SafeFloat(c.sus, 1)) - speak) * (StageCurve(u, c.dc, "fall")))
	end
	if e.st == "release" then
		return (e.sv + ((SafeFloat(c.base)) - e.sv) * (StageCurve(u, c.rc, "fall")))
	end
	return SafeFloat(c.base)
end

function Env_Process(e, c, db)
	e = e or Env_New(c and c.base)
	c = c or {}
	db = max(0, SafeFloat(db))
	for _ = 1, 8 do
		local dur = Env_Dur(c, e.st)
		if dur > 0 or e.st == "idle" or e.st == "sustain" then
			break
		end
		e.v = Env_Eval(e, c)
		Env_Next(e, c)
	end
	if e.st == "idle" or e.st == "sustain" then
		e.v = Env_Eval(e, c)
		return e.v
	end
	local dur = Env_Dur(c, e.st)
	if dur <= 0 then
		e.v = Env_Eval(e, c)
		return e.v
	end
	e.p = e.p + db / dur
	if e.p >= 1 then
		e.p = 1
		e.v = Env_Eval(e, c)
		Env_Next(e, c)
	else
		e.v = Env_Eval(e, c)
	end
	return e.v
end

local function GraphSignal_GetScopeState(ctx, behavior, stateKey)
	local state = behavior.state
	state.graphSignalByScope = state.graphSignalByScope or {}
	local graphScopeKey = ctx.graphScopeKey or "default"
	state.graphSignalByScope[stateKey] = state.graphSignalByScope[stateKey] or {}
	local byScope = state.graphSignalByScope[stateKey]
	byScope[graphScopeKey] = byScope[graphScopeKey] or {}
	return byScope[graphScopeKey]
end

function G_Accumulate(ctx, behavior)
	local unitsPerSecond = GetVariantInput(ctx, behavior, "unitsPerSecond", 1)
	local reset = GetVariantInput(ctx, behavior, "reset", 0)
	local scopeState = GraphSignal_GetScopeState(ctx, behavior, "accumulate")
	scopeState.value = SafeFloat(scopeState.value, 0)

	if
		not SATISFIED(not DemoGraph_IsStream(unitsPerSecond), "Accumulate requires a scalar Units / Second value")
		or not SATISFIED(not DemoGraph_IsStream(reset), "Accumulate requires a scalar Reset value")
	then
		ctx.setOutput(behavior, "value", scopeState.value)
		return
	end

	local resetHigh = SafeFloat(reset) > 0
	local resetEdge = resetHigh and scopeState.previousResetHigh ~= true
	scopeState.previousResetHigh = resetHigh

	local dt = max(0, ctx.t.demoDeltaMillis) / 1000
	if resetEdge then
		scopeState.value = 0
		dt = 0
	elseif ctx.t ~= nil and ctx.t.didSeek == true then
		dt = 0
	end

	scopeState.value = scopeState.value + SafeFloat(unitsPerSecond) * dt
	ctx.setOutput(behavior, "value", scopeState.value)
end

local function GraphSignal_EnvelopeMode(ctx, behavior)
	local mode = ctx.getInput(behavior, "mode", ctx.getBehaviorParam(behavior, "mode", "gate"))
	return mode == "trigger" and "trigger" or "gate"
end

local function GraphSignal_EnvelopeConfig(mode, values)
	return {
		mode = mode,
		base = 0,
		peak = 1,
		sus = (
			(SafeFloat(values[2], 1)) < 0 and 0 or ((SafeFloat(values[2], 1)) > 1 and 1 or (SafeFloat(values[2], 1)))
		),
		a = max(0, SafeFloat(values[3], 0.1)),
		h = max(0, SafeFloat(values[4], 0)),
		d = max(0, SafeFloat(values[5], 0.2)),
		r = max(0, SafeFloat(values[6], 0.2)),
		ac = SafeFloat(values[7]),
		dc = SafeFloat(values[8]),
		rc = SafeFloat(values[9]),
	}
end

local function GraphSignal_EvaluateEnvelopeInput(instanceState, config, inputHigh, deltaSeconds)
	if config.mode == "trigger" then
		if inputHigh and instanceState.previousInputHigh ~= true then
			Env_Trigger(instanceState.envelope, config)
			instanceState.envelope.gate = false
		end
	else
		Env_Gate(instanceState.envelope, config, inputHigh)
	end
	instanceState.previousInputHigh = inputHigh
	return Env_Process(instanceState.envelope, config, deltaSeconds)
end

function G_Envelope(ctx, behavior)
	local input = GetVariantInput(ctx, behavior, "input", 0)
	local sustain = GetVariantInput(ctx, behavior, "sustain", 1)
	local attackSeconds = GetVariantInput(ctx, behavior, "attackSeconds", 0.1)
	local holdSeconds = GetVariantInput(ctx, behavior, "holdSeconds", 0)
	local decaySeconds = GetVariantInput(ctx, behavior, "decaySeconds", 0.2)
	local releaseSeconds = GetVariantInput(ctx, behavior, "releaseSeconds", 0.2)
	local attackCurve = GetVariantInput(ctx, behavior, "attackCurve", 0)
	local decayCurve = GetVariantInput(ctx, behavior, "decayCurve", 0)
	local releaseCurve = GetVariantInput(ctx, behavior, "releaseCurve", 0)
	local mode = GraphSignal_EnvelopeMode(ctx, behavior)
	local scopeState = GraphSignal_GetScopeState(ctx, behavior, "envelope")
	scopeState.instances = scopeState.instances or {}
	local deltaSeconds = ctx.t ~= nil and max(0, SafeFloat(ctx.t.demoDeltaMillis) / 1000) or 0
	local resetState = ctx.t ~= nil and ctx.t.didSeek == true
	if resetState then
		deltaSeconds = 0
	end

	local activeKeys = {}
	local output = DemoGraph_MapInputs(behavior, "value", {
		input,
		sustain,
		attackSeconds,
		holdSeconds,
		decaySeconds,
		releaseSeconds,
		attackCurve,
		decayCurve,
		releaseCurve,
	}, function(values, key, index)
		local instanceKey = key or index or "__single"
		activeKeys[instanceKey] = true
		if scopeState.instances[instanceKey] == nil or resetState then
			scopeState.instances[instanceKey] = {
				envelope = Env_New(0),
				previousInputHigh = false,
			}
		end
		return GraphSignal_EvaluateEnvelopeInput(
			scopeState.instances[instanceKey],
			GraphSignal_EnvelopeConfig(mode, values),
			SafeFloat(values[1]) > 0,
			deltaSeconds
		)
	end)

	if output == nil then
		return
	end
	for key, _ in pairs(scopeState.instances) do
		if activeKeys[key] ~= true then
			scopeState.instances[key] = nil
		end
	end
	ctx.setOutput(behavior, "value", output)
end

function G_Transport(ctx, behavior)
	local beats = ctx.t.demoBeats
	local seconds = ctx.t.demoMillis / 1000
	local deltaBeats = ctx.t.demoDeltaBeats
	local deltaSeconds = ctx.t.demoDeltaMillis / 1000
	local bpm = ctx.bpm
	ctx.setOutput(behavior, "beats", beats)
	ctx.setOutput(behavior, "seconds", seconds)
	ctx.setOutput(behavior, "beatFract", (beats - (beats // 1)))
	ctx.setOutput(behavior, "deltaBeats", deltaBeats)
	ctx.setOutput(behavior, "deltaSeconds", deltaSeconds)
	ctx.setOutput(behavior, "bpm", bpm)
	ctx.setOutput(behavior, "beatsPerSecond", bpm / 60)
end

function G_Beats(ctx, behavior)
	local offset = GetVariantInput(ctx, behavior, "offset", 0)
	local scale = GetVariantInput(ctx, behavior, "scale", 1)
	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapInputs(behavior, "value", { offset, scale }, function(values)
			return (ctx.t.demoBeats - SafeFloat(values[1])) * SafeFloat(values[2], 1)
		end)
	)
end

local function GraphSignal_TimeVec3(timeValue, offsetValue, scaleValue)
	local offset = SafeVec3(offsetValue)
	local scale = SafeVec3(scaleValue, { x = 1, y = 1, z = 1 })
	return {
		x = (timeValue - offset.x) * scale.x,
		y = (timeValue - offset.y) * scale.y,
		z = (timeValue - offset.z) * scale.z,
	}
end

function G_BeatVec3(ctx, behavior)
	local offset = GetVariantInput(ctx, behavior, "offset", { x = 0, y = 0, z = 0 })
	local scale = GetVariantInput(ctx, behavior, "scale", { x = 1, y = 1, z = 1 })
	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapInputs(behavior, "value", { offset, scale }, function(values)
			return GraphSignal_TimeVec3(ctx.t.demoBeats, values[1], values[2])
		end)
	)
end

function G_BeatFract(ctx, behavior)
	ctx.setOutput(behavior, "value", (ctx.t.demoBeats - (ctx.t.demoBeats // 1)))
end

local function GraphSignal_LerpVec3(minValue, maxValue, u)
	local outputMin = SafeVec3(minValue)
	local outputMax = SafeVec3(maxValue, { x = 1, y = 1, z = 1 })
	return {
		x = (outputMin.x + (outputMax.x - outputMin.x) * u),
		y = (outputMin.y + (outputMax.y - outputMin.y) * u),
		z = (outputMin.z + (outputMax.z - outputMin.z) * u),
	}
end

function G_BeatFractVec3(ctx, behavior)
	local outputMin = GetVariantInput(ctx, behavior, "outputMin", { x = 0, y = 0, z = 0 })
	local outputMax = GetVariantInput(ctx, behavior, "outputMax", { x = 1, y = 1, z = 1 })
	local u = (ctx.t.demoBeats - (ctx.t.demoBeats // 1))
	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapInputs(behavior, "value", { outputMin, outputMax }, function(values)
			return GraphSignal_LerpVec3(values[1], values[2], u)
		end)
	)
end

function G_Seconds(ctx, behavior)
	local offset = GetVariantInput(ctx, behavior, "offset", 0)
	local scale = GetVariantInput(ctx, behavior, "scale", 1)
	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapInputs(behavior, "value", { offset, scale }, function(values)
			return ((ctx.t.demoMillis / 1000) - SafeFloat(values[1])) * SafeFloat(values[2], 1)
		end)
	)
end

function G_SecondsVec3(ctx, behavior)
	local offset = GetVariantInput(ctx, behavior, "offset", { x = 0, y = 0, z = 0 })
	local scale = GetVariantInput(ctx, behavior, "scale", { x = 1, y = 1, z = 1 })
	local seconds = ctx.t.demoMillis / 1000
	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapInputs(behavior, "value", { offset, scale }, function(values)
			return GraphSignal_TimeVec3(seconds, values[1], values[2])
		end)
	)
end

local function GraphWave_Evaluate(ctx, behavior, opName, inputSpecs, op)
	local rangeMinIndex = #inputSpecs + 1
	local rangeInputSpecs = {}
	for i = 1, #inputSpecs do
		rangeInputSpecs[i] = inputSpecs[i]
	end
	rangeInputSpecs[rangeMinIndex] = { portId = "outputMin", defaultValue = -1 }
	rangeInputSpecs[rangeMinIndex + 1] = { portId = "outputMax", defaultValue = 1 }
	GraphMath_EvaluateNumericAggregateInputs(ctx, behavior, rangeInputSpecs, "value", opName, 1, function(values)
		return (values[rangeMinIndex] + (values[rangeMinIndex + 1] - values[rangeMinIndex]) * ((op(values) + 1) * 0.5))
	end)
end

function G_Sine(ctx, behavior)
	GraphWave_Evaluate(ctx, behavior, "Sine", {
		{ portId = "x", defaultValue = 0 },
	}, function(values)
		return sin(values[1] * 6.283185307179586)
	end)
end

function G_Sawtooth(ctx, behavior)
	GraphWave_Evaluate(ctx, behavior, "Sawtooth", {
		{ portId = "x", defaultValue = 0 },
	}, function(values)
		return (values[1] - (values[1] // 1)) * 2 - 1
	end)
end

function G_TriangleWave(ctx, behavior)
	GraphWave_Evaluate(ctx, behavior, "TriangleWave", {
		{ portId = "x", defaultValue = 0 },
	}, function(values)
		return (1 - abs((values[1] - (values[1] // 1)) * 2 - 1)) * 2 - 1
	end)
end

function G_PulseWave(ctx, behavior)
	GraphWave_Evaluate(ctx, behavior, "PulseWave", {
		{ portId = "x", defaultValue = 0 },
		{ portId = "pulseWidth", defaultValue = 0.5 },
	}, function(values)
		return (values[1] - (values[1] // 1)) < (values[2] < 0 and 0 or (values[2] > 1 and 1 or values[2])) and 1 or -1
	end)
end

function GraphNoise_Octaves(value)
	return (
		(SafeFloat(value, 4) // 1) < 1 and 1 or ((SafeFloat(value, 4) // 1) > 6 and 6 or (SafeFloat(value, 4) // 1))
	)
end

function GraphNoise_Component(value, key, fallback)
	return GraphMath_NumericAggregateComponentOrScalar(value, key, fallback, "FbmNoise")
end

function GraphNoise_TransformComponent(input, scale, offset, key)
	return GraphNoise_Component(input, key, 0) * GraphNoise_Component(scale, key, 1)
		+ GraphNoise_Component(offset, key, 0)
end

function GraphNoise_CommonComponentOffset(key)
	if key == "y" then
		return 117
	end
	if key == "z" then
		return 223
	end
	return 0
end

function GraphNoise_FbmValue(input, scale, offset, octaves)
	octaves = GraphNoise_Octaves(octaves)
	if type(input) == "number" then
		return Fbm1D(input * GraphNoise_Component(scale, nil, 1) + GraphNoise_Component(offset, nil, 0), octaves)
	end
	if type(input) ~= "table" or not GraphMath_HasNumericComponents(input) then
		if not SATISFIED(false, "FbmNoise requires numeric input") then
			return nil
		end
	end

	local result = CloneTable(input)
	if input.x ~= nil or input.y ~= nil or input.z ~= nil then
		local x = GraphNoise_TransformComponent(input, scale, offset, "x")
		local y = GraphNoise_TransformComponent(input, scale, offset, "y")
		local z = GraphNoise_TransformComponent(input, scale, offset, "z")
		for key, component in pairs(input) do
			if type(component) == "number" then
				result[key] = Fbm3D(x, y, z + GraphNoise_CommonComponentOffset(key), octaves)
			end
		end
		return result
	end

	for key, component in pairs(input) do
		if type(component) == "number" then
			result[key] = Fbm1D(GraphNoise_TransformComponent(input, scale, offset, key), octaves)
		end
	end
	return result
end

function G_FbmNoise(ctx, behavior)
	local input = GetVariantInput(ctx, behavior, "input", 0)
	local scale = GetVariantInput(ctx, behavior, "scale", 1)
	local offset = GetVariantInput(ctx, behavior, "offset", 0)
	local octaves = GetVariantInput(ctx, behavior, "octaves", 4)
	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapInputs(behavior, "value", { input, scale, offset, octaves }, function(values)
			return GraphNoise_FbmValue(values[1], values[2], values[3], values[4])
		end)
	)
end

function GraphMath_Smoothstep(edge0, edge1, x)
	if edge0 == edge1 then
		return x < edge0 and 0 or 1
	end
	local t = (
		((x - edge0) / (edge1 - edge0)) < 0 and 0
		or (((x - edge0) / (edge1 - edge0)) > 1 and 1 or ((x - edge0) / (edge1 - edge0)))
	)
	return t * t * (3 - 2 * t)
end

function GraphMath_Smootherstep(edge0, edge1, x)
	if edge0 == edge1 then
		return x < edge0 and 0 or 1
	end
	local t = (
		((x - edge0) / (edge1 - edge0)) < 0 and 0
		or (((x - edge0) / (edge1 - edge0)) > 1 and 1 or ((x - edge0) / (edge1 - edge0)))
	)
	return t * t * t * (t * (t * 6 - 15) + 10)
end

function GraphMath_SmoothMin(a, b, smoothness)
	if smoothness <= 0 then
		return min(a, b)
	end
	local h = max(smoothness - abs(a - b), 0) / smoothness
	return min(a, b) - h * h * smoothness * 0.25
end

function GraphMath_SmoothMax(a, b, smoothness)
	if smoothness <= 0 then
		return max(a, b)
	end
	local h = max(smoothness - abs(a - b), 0) / smoothness
	return max(a, b) + h * h * smoothness * 0.25
end

function GraphMath_Distance(a, b)
	if not SATISFIED(type(a) == "table" and type(b) == "table", "Distance requires position values") then
		return nil
	end
	local dx = SafeFloat(a.x) - SafeFloat(b.x)
	local dy = SafeFloat(a.y) - SafeFloat(b.y)
	local dz = SafeFloat(a.z) - SafeFloat(b.z)
	return sqrt(dx * dx + dy * dy + dz * dz)
end

function G_Distance(ctx, behavior)
	local a = ctx.getInput(behavior, "a")
	local b = ctx.getInput(behavior, "b")
	if not SATISFIED(a ~= nil and b ~= nil, "Distance requires A and B") then
		return
	end
	ctx.setOutput(behavior, "value", DemoGraph_MapBinary(behavior, "value", a, b, GraphMath_Distance))
end

function G_NormalizeAcrossStream(ctx, behavior)
	local input = ctx.getInput(behavior, "input")
	if not SATISFIED(DemoGraph_IsStream(input), "NormalizeAcrossStream requires a stream") then
		return
	end
	if #input.items == 0 then
		ctx.setOutput(behavior, "value", DemoGraph_NewStream(behavior, "value"))
		return
	end

	local minValue = SafeFloat(input.items[1].value)
	local maxValue = minValue
	for i = 2, #input.items do
		local value = SafeFloat(input.items[i].value)
		minValue = min(minValue, value)
		maxValue = max(maxValue, value)
	end
	local range = maxValue - minValue
	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapStream(behavior, "value", input, function(value)
			return range ~= 0 and (SafeFloat(value) - minValue) / range or 0
		end)
	)
end

function G_RemapAcrossStream(ctx, behavior)
	local input = ctx.getInput(behavior, "input")
	if not SATISFIED(DemoGraph_IsStream(input), "RemapAcrossStream requires a stream") then
		return
	end
	if #input.items == 0 then
		ctx.setOutput(behavior, "value", DemoGraph_NewStream(behavior, "value"))
		return
	end

	local minValue = SafeFloat(input.items[1].value)
	local maxValue = minValue
	for i = 2, #input.items do
		local value = SafeFloat(input.items[i].value)
		minValue = min(minValue, value)
		maxValue = max(maxValue, value)
	end
	local range = maxValue - minValue
	local outputMin = ctx.getInput(behavior, "outputMin", ctx.getBehaviorParam(behavior, "outputMin", 0))
	local outputMax = ctx.getInput(behavior, "outputMax", ctx.getBehaviorParam(behavior, "outputMax", 1))
	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapInputs(behavior, "value", { input, outputMin, outputMax }, function(values)
			local u = range ~= 0 and (SafeFloat(values[1]) - minValue) / range or 0
			return ((SafeFloat(values[2])) + ((SafeFloat(values[3])) - (SafeFloat(values[2]))) * u)
		end)
	)
end

function G_Add(ctx, behavior)
	GraphMath_EvaluateBinaryNumericAggregate(ctx, behavior, 0, 0, "Add", function(a, b)
		return a + b
	end)
end

function G_Multiply(ctx, behavior)
	GraphMath_EvaluateBinaryNumericAggregate(ctx, behavior, 1, 1, "Multiply", function(a, b)
		return a * b
	end)
end

function G_Sub(ctx, behavior)
	GraphMath_EvaluateBinaryNumericAggregate(ctx, behavior, 0, 0, "Sub", function(a, b)
		return a - b
	end)
end

function G_Neg(ctx, behavior)
	GraphMath_EvaluateNumericAggregateInputs(
		ctx,
		behavior,
		{ { portId = "input", defaultValue = 0 } },
		"value",
		"Neg",
		1,
		function(values)
			return -values[1]
		end
	)
end

function G_Div(ctx, behavior)
	GraphMath_EvaluateBinaryNumericAggregate(ctx, behavior, 1, 1, "Div", function(a, b)
		-- node ops have streaming values and will easily reach 0; don't throw errors. be graceful
		return b ~= 0 and a / b or 0
	end)
end

function G_Remap(ctx, behavior)
	GraphMath_EvaluateNumericAggregateInputs(
		ctx,
		behavior,
		{
			{ portId = "input", defaultValue = 0 },
			{ portId = "inputMin", defaultValue = 0 },
			{ portId = "inputMax", defaultValue = 1 },
			{ portId = "outputMin", defaultValue = 0 },
			{ portId = "outputMax", defaultValue = 1 },
		},
		"value",
		"Remap",
		1,
		function(values)
			local denom = values[3] - values[2]
			-- node ops have streaming values and will easily reach 0 range. don't throw errors. be graceful
			local u = denom ~= 0 and (values[1] - values[2]) / denom or 0
			return (values[4] + (values[5] - values[4]) * u)
		end
	)
end

function G_Lerp(ctx, behavior)
	GraphMath_EvaluateNumericAggregateInputs(
		ctx,
		behavior,
		{
			{ portId = "a", defaultValue = 0 },
			{ portId = "b", defaultValue = 1 },
			{ portId = "amount", defaultValue = 0.5 },
		},
		"value",
		"Lerp",
		1,
		function(values)
			return (values[1] + (values[2] - values[1]) * values[3])
		end
	)
end

function G_Fract(ctx, behavior)
	local input = ctx.getInput(behavior, "input", ctx.getBehaviorParam(behavior, "input", 0))
	local fract = DemoGraph_MapInputs(behavior, "fract", { input }, function(values)
		return GraphMath_NumericAggregateFromValues(values, "Fract", 1, function(componentValues)
			return (componentValues[1] - (componentValues[1] // 1))
		end)
	end)
	ctx.setOutput(behavior, "fract", fract)
end

function G_Floor(ctx, behavior)
	local input = ctx.getInput(behavior, "input", ctx.getBehaviorParam(behavior, "input", 0))
	local floorValue = DemoGraph_MapInputs(behavior, "floor", { input }, function(values)
		return GraphMath_NumericAggregateFromValues(values, "Floor", 1, function(componentValues)
			return componentValues[1] // 1
		end)
	end)
	ctx.setOutput(behavior, "floor", floorValue)
end

function G_Step(ctx, behavior)
	local input = ctx.getInput(behavior, "input", ctx.getBehaviorParam(behavior, "input", 0))
	local threshold = ctx.getInput(behavior, "threshold", ctx.getBehaviorParam(behavior, "threshold", 0.5))
	local mask = DemoGraph_MapInputs(behavior, "value", { input, threshold }, function(values)
		return GraphMath_NumericAggregateBranchMask(values, "Step", 1, function(componentValues)
			return componentValues[1] >= componentValues[2]
		end)
	end)
	GraphMath_SetLazyBranchOutput(ctx, behavior, "value", mask, 0, 1, "Step")
end

function G_Curve(ctx, behavior)
	GraphMath_EvaluateNumericAggregateInputs(
		ctx,
		behavior,
		{
			{ portId = "input", defaultValue = 0 },
			{ portId = "curve", defaultValue = 0 },
		},
		"value",
		"Curve",
		1,
		function(values)
			return Curve01(values[1], values[2])
		end
	)
end

function GraphMath_HashValue(value, seed)
	if DemoGraph_IsFrameObject(value) then
		return DemoCustom_TargetHashUnit(DemoCustom_TargetInfo(value), seed)
	end
	if type(value) == "table" then
		local result = CloneTable(value)
		local componentCount = 0
		for key, component in pairs(value) do
			if type(component) == "number" then
				result[key] = Hash1D(component + seed)
				componentCount = componentCount + 1
			end
		end
		if componentCount > 0 then
			return result
		end
	end
	return HashTargetValue(value, seed)
end

function G_Hash(ctx, behavior)
	local value = ctx.getInput(behavior, "input", nil)
	if not SATISFIED(value ~= nil, "Hash requires a value") then
		return
	end
	local seed = ctx.getInput(behavior, "seed", ctx.getBehaviorParam(behavior, "seed", 7.11))
	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapInputs(behavior, "value", { value, seed }, function(values)
			return GraphMath_HashValue(values[1], SafeFloat(values[2], 7.11))
		end)
	)
end

function G_Sqrt(ctx, behavior)
	GraphMath_EvaluateNumericAggregateInputs(
		ctx,
		behavior,
		{ { portId = "input", defaultValue = 0 } },
		"value",
		"Sqrt",
		1,
		function(values)
			return sqrt(max(0, values[1]))
		end
	)
end

function G_Pow(ctx, behavior)
	GraphMath_EvaluateNumericAggregateInputs(
		ctx,
		behavior,
		{
			{ portId = "base", defaultValue = 1 },
			{ portId = "exponent", defaultValue = 1 },
		},
		"value",
		"Pow",
		1,
		function(values)
			local base = values[1]
			local exponent = values[2]
			if base < 0 and exponent ~= (exponent // 1) then
				return 0
			end
			return pow(base, exponent)
		end
	)
end

function G_Mod(ctx, behavior)
	GraphMath_EvaluateBinaryNumericAggregate(ctx, behavior, 0, 1, "Mod", function(a, b)
		return b ~= 0 and a % b or 0
	end)
end

function GraphMath_ReduceFlattenedNumericInputs(ctx, behavior, opName, op)
	local stream = FlattenInputsToStream(behavior, "values", ctx.getMultiInputs(behavior, "values"))
	if not SATISFIED(#stream.items > 0, opName .. " requires at least one value") then
		return
	end

	local result = nil
	for i = 1, #stream.items do
		local value = stream.items[i].value
		if not SATISFIED(GraphMath_HasNumericComponents(value), opName .. " requires numeric values") then
			return
		end
		if result == nil then
			result = GraphMath_CloneNumericAggregate(value)
		else
			result = GraphMath_BinaryNumericAggregate(result, value, opName, op)
			if result == nil then
				return
			end
		end
	end
	ctx.setOutput(behavior, "value", result)
end

function G_Min(ctx, behavior)
	GraphMath_ReduceFlattenedNumericInputs(ctx, behavior, "Min", min)
end

function G_Max(ctx, behavior)
	GraphMath_ReduceFlattenedNumericInputs(ctx, behavior, "Max", max)
end

function G_Quantize(ctx, behavior)
	GraphMath_EvaluateNumericAggregateInputs(
		ctx,
		behavior,
		{
			{ portId = "x", defaultValue = 0 },
			{ portId = "offset", defaultValue = 0 },
			{ portId = "freq", defaultValue = 1 },
		},
		"value",
		"Quantize",
		1,
		function(values)
			local x = values[1]
			local offset = values[2]
			local freq = values[3]
			return freq > 0 and offset + ((((x - offset) * freq) + 0.5) // 1) / freq or x
		end
	)
end

function G_Abs(ctx, behavior)
	GraphMath_EvaluateNumericAggregateInputs(
		ctx,
		behavior,
		{ { portId = "input", defaultValue = 0 } },
		"value",
		"Abs",
		1,
		function(values)
			return abs(values[1])
		end
	)
end

function G_Sign(ctx, behavior)
	GraphMath_EvaluateNumericAggregateInputs(
		ctx,
		behavior,
		{ { portId = "input", defaultValue = 0 } },
		"value",
		"Sign",
		1,
		function(values)
			local value = values[1]
			return value > 0 and 1 or value < 0 and -1 or 0
		end
	)
end

function G_CopySign(ctx, behavior)
	GraphMath_EvaluateNumericAggregateInputs(
		ctx,
		behavior,
		{
			{ portId = "a", defaultValue = 0 },
			{ portId = "b", defaultValue = 1 },
		},
		"value",
		"CopySign",
		1,
		function(values)
			return values[2] < 0 and -abs(values[1]) or abs(values[1])
		end
	)
end

function G_Clamp(ctx, behavior)
	GraphMath_EvaluateNumericAggregateInputs(
		ctx,
		behavior,
		{
			{ portId = "x", defaultValue = 0 },
			{ portId = "min", defaultValue = 0 },
			{ portId = "max", defaultValue = 1 },
		},
		"value",
		"Clamp",
		1,
		function(values)
			local lo = min(values[2], values[3])
			local hi = max(values[2], values[3])
			return (values[1] < lo and lo or (values[1] > hi and hi or values[1]))
		end
	)
end

function G_Round(ctx, behavior)
	GraphMath_EvaluateNumericAggregateInputs(
		ctx,
		behavior,
		{ { portId = "input", defaultValue = 0 } },
		"value",
		"Round",
		1,
		function(values)
			return ((values[1] + 0.5) // 1)
		end
	)
end

function G_Ceil(ctx, behavior)
	GraphMath_EvaluateNumericAggregateInputs(
		ctx,
		behavior,
		{ { portId = "input", defaultValue = 0 } },
		"value",
		"Ceil",
		1,
		function(values)
			return -(-values[1] // 1)
		end
	)
end

function GraphMath_EvaluateStepCurve(ctx, behavior, opName, op)
	GraphMath_EvaluateNumericAggregateInputs(
		ctx,
		behavior,
		{
			{ portId = "edge0", defaultValue = 0 },
			{ portId = "edge1", defaultValue = 1 },
			{ portId = "x", defaultValue = 0 },
		},
		"value",
		opName,
		3,
		function(values)
			return op(values[1], values[2], values[3])
		end
	)
end

function G_Smoothstep(ctx, behavior)
	GraphMath_EvaluateStepCurve(ctx, behavior, "Smoothstep", GraphMath_Smoothstep)
end

function G_Smootherstep(ctx, behavior)
	GraphMath_EvaluateStepCurve(ctx, behavior, "Smootherstep", GraphMath_Smootherstep)
end

function GraphMath_EvaluateSmoothMinMax(ctx, behavior, opName, op)
	GraphMath_EvaluateNumericAggregateInputs(
		ctx,
		behavior,
		{
			{ portId = "a", defaultValue = 0 },
			{ portId = "b", defaultValue = 1 },
			{ portId = "smoothness", defaultValue = 0.1 },
		},
		"value",
		opName,
		1,
		function(values)
			return op(values[1], values[2], max(0, values[3]))
		end
	)
end

function G_SmoothMin(ctx, behavior)
	GraphMath_EvaluateSmoothMinMax(ctx, behavior, "SmoothMin", GraphMath_SmoothMin)
end

function G_SmoothMax(ctx, behavior)
	GraphMath_EvaluateSmoothMinMax(ctx, behavior, "SmoothMax", GraphMath_SmoothMax)
end

function G_SmoothClamp(ctx, behavior)
	GraphMath_EvaluateNumericAggregateInputs(
		ctx,
		behavior,
		{
			{ portId = "x", defaultValue = 0 },
			{ portId = "min", defaultValue = 0 },
			{ portId = "max", defaultValue = 1 },
			{ portId = "smoothness", defaultValue = 0.1 },
		},
		"value",
		"SmoothClamp",
		1,
		function(values)
			local lo = min(values[2], values[3])
			local hi = max(values[2], values[3])
			local smoothness = max(0, values[4])
			return GraphMath_SmoothMin(GraphMath_SmoothMax(values[1], lo, smoothness), hi, smoothness)
		end
	)
end

function G_PerBeatToPerSecond(ctx, behavior)
	local ratePerBeat = GetVariantInput(ctx, behavior, "ratePerBeat", 1)
	local beatsPerSecond = GetVariantInput(ctx, behavior, "beatsPerSecond", 0)
	local bpm = ctx.bpm
	local transportBeatsPerSecond = bpm / 60
	ctx.setOutput(
		behavior,
		"ratePerSecond",
		DemoGraph_MapInputs(behavior, "ratePerSecond", { ratePerBeat, beatsPerSecond }, function(values)
			local bps = SafeFloat(values[2])
			if bps <= 0 then
				bps = transportBeatsPerSecond
			end
			return GraphMath_NumericAggregateFromValues(
				{ values[1], bps },
				"PerBeatToPerSecond",
				1,
				function(componentValues)
					return componentValues[1] * componentValues[2]
				end
			)
		end)
	)
end

local function GraphMath_GetScopeState(ctx, behavior, stateKey)
	local state = behavior.state
	state.graphMathByScope = state.graphMathByScope or {}
	DEMO_ASSERT(
		(type(ctx.graphScopeKey) == "string" and ctx.graphScopeKey ~= ""),
		"GraphMath_GetScopeState needs graphScopeKey"
	)
	local graphScopeKey = ctx.graphScopeKey
	state.graphMathByScope[stateKey] = state.graphMathByScope[stateKey] or {}
	local byScope = state.graphMathByScope[stateKey]
	byScope[graphScopeKey] = byScope[graphScopeKey] or { instances = {} }
	return byScope[graphScopeKey]
end

function G_Trigger(ctx, behavior)
	local input = GetVariantInput(ctx, behavior, "input", 0)
	local scopeState = GraphMath_GetScopeState(ctx, behavior, "trigger")
	local mask = DemoGraph_MapInputs(behavior, "value", { input }, function(values, key, index)
		local instanceKey = key or index or "__single"
		local isHigh = SafeFloat(values[1]) > 0
		local wasHigh = scopeState.instances[instanceKey] == true
		scopeState.instances[instanceKey] = isHigh
		return isHigh and not wasHigh
	end)
	GraphMath_SetLazyBranchOutput(ctx, behavior, "value", mask, 0, 1, "Trigger")
end

-- G_ChangeTrigger
function G_ChangeTrigger(ctx, behavior)
	local input = GetVariantInput(ctx, behavior, "input", 0)
	local scopeState = GraphMath_GetScopeState(ctx, behavior, "changeTrigger")
	local mask = DemoGraph_MapInputs(behavior, "value", { input }, function(values, key, index)
		local instanceKey = key or index or "__single"
		local currentValue = values[1]
		local previousValue = scopeState.instances[instanceKey]
		scopeState.instances[instanceKey] = currentValue
		return previousValue ~= nil and currentValue ~= previousValue
	end)
	GraphMath_SetLazyBranchOutput(ctx, behavior, "value", mask, 0, 1, "ChangeTrigger")
end

function GraphMath_ApproachRate(value, key)
	return max(0, GraphMath_NumericAggregateComponentOrScalar(value, key, nil, "Approach"))
end

function GraphMath_ApproachScalar(current, velocity, target, accel, decel, dt)
	current = SafeFloat(current, target)
	velocity = SafeFloat(velocity)
	if dt <= 0 then
		return current, velocity
	end

	accel = max(0, SafeFloat(accel))
	decel = max(0, SafeFloat(decel))
	local delta = target - current
	local distance = abs(delta)
	local epsilon = 0.0001
	if distance <= epsilon then
		local braking = decel > 0 and decel or accel
		velocity = ApproachValue(velocity, 0, braking, braking, dt)
		if abs(velocity) <= epsilon then
			return target, 0
		end
		return current + velocity * dt, velocity
	end

	local direction = delta > 0 and 1 or -1
	local speedToward = velocity * direction
	local braking = decel > 0 and decel or accel
	local stoppingDistance = speedToward > 0 and braking > 0 and (speedToward * speedToward) / (2 * braking) or 0
	local shouldBrake = speedToward > 0 and stoppingDistance >= distance
	local acceleration = 0
	if shouldBrake then
		acceleration = -direction * braking
	elseif speedToward < 0 and braking > 0 then
		acceleration = direction * braking
	else
		acceleration = direction * accel
	end

	local nextVelocity = velocity + acceleration * dt
	if shouldBrake and nextVelocity * direction < 0 then
		nextVelocity = 0
	end

	local nextValue = current + nextVelocity * dt
	local crossedTarget = (target - current) * (target - nextValue) <= 0
	if crossedTarget then
		return target, 0
	end
	return nextValue, nextVelocity
end

function GraphMath_ApproachNumericAggregate(instanceState, target, accel, decel, dt)
	if type(target) == "number" then
		instanceState.value, instanceState.velocity = GraphMath_ApproachScalar(
			instanceState.value,
			instanceState.velocity,
			target,
			GraphMath_ApproachRate(accel),
			GraphMath_ApproachRate(decel),
			dt
		)
		return instanceState.value
	end

	if type(target) == "table" then
		local nextValue = CloneTable(target)
		local nextVelocity = CloneTable(instanceState.velocity)
		local componentCount = 0
		for key, component in pairs(target) do
			if type(component) == "number" then
				nextValue[key], nextVelocity[key] = GraphMath_ApproachScalar(
					instanceState.value[key],
					instanceState.velocity[key],
					component,
					GraphMath_ApproachRate(accel, key),
					GraphMath_ApproachRate(decel, key),
					dt
				)
				componentCount = componentCount + 1
			end
		end
		if not SATISFIED(componentCount > 0, "Approach target has no numeric components") then
			return nil
		end
		instanceState.value = nextValue
		instanceState.velocity = nextVelocity
		return instanceState.value
	end

	if not SATISFIED(false, "Approach requires numeric values") then
		return nil
	end
	return nil
end

function G_Approach(ctx, behavior)
	local input = GetVariantInput(ctx, behavior, "input", 0)
	local accel = GetVariantInput(ctx, behavior, "accel", 1)
	local decel = GetVariantInput(ctx, behavior, "decel", 1)
	local dt = max(0, SafeFloat(ctx.t.demoDeltaMillis) / 1000)
	local scopeState = GraphMath_GetScopeState(ctx, behavior, "approach")

	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapInputs(behavior, "value", { input, accel, decel }, function(values, key, index)
			local instanceKey = key or index or "__single"
			local instanceState = scopeState.instances[instanceKey]
			if
				instanceState == nil
				or not GraphMath_NumericAggregateShapeMatches(instanceState.value, values[1])
				or not GraphMath_NumericAggregateShapeMatches(instanceState.velocity, values[1])
			then
				instanceState = {
					value = GraphMath_CloneNumericAggregate(values[1]),
					velocity = GraphMath_ZeroNumericAggregateLike(values[1]),
				}
				scopeState.instances[instanceKey] = instanceState
			end
			return GraphMath_ApproachNumericAggregate(instanceState, values[1], values[2], values[3], dt)
		end)
	)
end

function GraphMath_SmoothFactor(value, key)
	return max(1, GraphMath_NumericAggregateComponentOrScalar(value, key, 5, "Smooth"))
end

function GraphMath_SmoothAlpha(factor, dt)
	if dt <= 0 then
		return 0
	end

	local perFrameAlpha = 1 / GraphMath_SmoothFactor(factor)
	return 1 - pow(1 - perFrameAlpha, dt * 60)
end

function GraphMath_SmoothScalar(current, target, riseFactor, fallFactor, dt)
	current = SafeFloat(current, target)
	target = SafeFloat(target, current)
	local diff = target - current
	if diff == 0 then
		return target
	end

	local factor = diff >= 0 and riseFactor or fallFactor
	return current + diff * GraphMath_SmoothAlpha(factor, dt)
end

function GraphMath_SmoothNumericAggregate(instanceState, target, riseFactor, fallFactor, dt)
	if type(target) == "number" then
		instanceState.value = GraphMath_SmoothScalar(
			instanceState.value,
			target,
			GraphMath_SmoothFactor(riseFactor),
			GraphMath_SmoothFactor(fallFactor),
			dt
		)
		return instanceState.value
	end

	if type(target) == "table" then
		local nextValue = CloneTable(target)
		local componentCount = 0
		for key, component in pairs(target) do
			if type(component) == "number" then
				nextValue[key] = GraphMath_SmoothScalar(
					instanceState.value[key],
					component,
					GraphMath_SmoothFactor(riseFactor, key),
					GraphMath_SmoothFactor(fallFactor, key),
					dt
				)
				componentCount = componentCount + 1
			end
		end
		if not SATISFIED(componentCount > 0, "Smooth target has no numeric components") then
			return nil
		end
		instanceState.value = nextValue
		return instanceState.value
	end

	if not SATISFIED(false, "Smooth requires numeric values") then
		return nil
	end
	return nil
end

function G_Smooth(ctx, behavior)
	local input = GetVariantInput(ctx, behavior, "input", 0)
	local riseFactor = GetVariantInput(ctx, behavior, "riseFactor", 5)
	local fallFactor = GetVariantInput(ctx, behavior, "fallFactor", 5)
	local reset = GetVariantInput(ctx, behavior, "reset", false)
	local dt = max(0, SafeFloat(ctx.t.demoDeltaMillis) / 1000)
	local scopeState = GraphMath_GetScopeState(ctx, behavior, "smooth")

	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapInputs(behavior, "value", { input, riseFactor, fallFactor, reset }, function(values, key, index)
			local instanceKey = key or index or "__single"
			local instanceState = scopeState.instances[instanceKey]
			if
				instanceState == nil
				or SafeBool(values[4])
				or not GraphMath_NumericAggregateShapeMatches(instanceState.value, values[1])
			then
				instanceState = {
					value = GraphMath_CloneNumericAggregate(values[1]),
				}
				scopeState.instances[instanceKey] = instanceState
				return instanceState.value
			end
			return GraphMath_SmoothNumericAggregate(instanceState, values[1], values[2], values[3], dt)
		end)
	)
end

local function GraphLogic_StreamNeedsBranch(stream, branchFn)
	for i = 1, #stream.items do
		if branchFn(SafeBool(stream.items[i].value)) then
			return true
		end
	end
	return false
end

local function GraphLogic_StreamItemsForBranch(condition, branchValue, opName)
	if not DemoGraph_IsStream(branchValue) then
		return nil
	end
	if
		not SATISFIED(DemoGraph_SameDomain(condition, branchValue), opName .. " branch stream has a different domain")
	then
		return nil
	end
	return DemoGraph_StreamItemsByKey(branchValue)
end

local function GraphLogic_BranchValue(branchValue, branchItems, key, opName)
	if branchItems ~= nil then
		local value = branchItems[key]
		if not SATISFIED(value ~= nil, opName .. " branch stream is missing a matching key") then
			return nil
		end
		return value
	end
	return branchValue
end

local function GraphLogic_EvaluateShortCircuitBinary(ctx, behavior, opName, shouldShortCircuit, shortCircuitValue, op)
	local a = GetVariantInput(ctx, behavior, "a", false)
	if DemoGraph_IsStream(a) then
		local needsB = GraphLogic_StreamNeedsBranch(a, function(aValue)
			return not shouldShortCircuit(aValue)
		end)
		local b = nil
		local bItems = nil
		if needsB then
			b = GetVariantInput(ctx, behavior, "b", false)
			bItems = GraphLogic_StreamItemsForBranch(a, b, opName)
			if DemoGraph_IsStream(b) and bItems == nil then
				return
			end
		end
		ctx.setOutput(
			behavior,
			"value",
			DemoGraph_MapStream(behavior, "value", a, function(aValue, key)
				local safeA = SafeBool(aValue)
				if shouldShortCircuit(safeA) then
					return shortCircuitValue
				end
				local bValue = GraphLogic_BranchValue(b, bItems, key, opName)
				if bValue == nil then
					return nil
				end
				return op(safeA, SafeBool(bValue))
			end)
		)
		return
	end

	local safeA = SafeBool(a)
	if shouldShortCircuit(safeA) then
		ctx.setOutput(behavior, "value", shortCircuitValue)
		return
	end
	local b = GetVariantInput(ctx, behavior, "b", false)
	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapInputs(behavior, "value", { b }, function(values)
			return op(safeA, SafeBool(values[1]))
		end)
	)
end

local function GraphLogic_EvaluateBinary(ctx, behavior, opName, op)
	local a = GetVariantInput(ctx, behavior, "a", false)
	local b = GetVariantInput(ctx, behavior, "b", false)
	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapInputs(behavior, "value", { a, b }, function(values)
			return op(SafeBool(values[1]), SafeBool(values[2]))
		end)
	)
end

function G_And(ctx, behavior)
	GraphLogic_EvaluateShortCircuitBinary(
		ctx,
		behavior,
		"And",
		function(a)
			return not a
		end,
		false,
		function(a, b)
			return a and b
		end
	)
end

function G_Or(ctx, behavior)
	GraphLogic_EvaluateShortCircuitBinary(
		ctx,
		behavior,
		"Or",
		function(a)
			return a
		end,
		true,
		function(a, b)
			return a or b
		end
	)
end

function G_Xor(ctx, behavior)
	GraphLogic_EvaluateBinary(ctx, behavior, "Xor", function(a, b)
		return a ~= b
	end)
end

function G_Not(ctx, behavior)
	local input = GetVariantInput(ctx, behavior, "input", false)
	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapInputs(behavior, "value", { input }, function(values)
			return not SafeBool(values[1])
		end)
	)
end

function G_If(ctx, behavior)
	local condition = GetVariantInput(ctx, behavior, "condition", false)
	if DemoGraph_IsStream(condition) then
		local needsTrue = GraphLogic_StreamNeedsBranch(condition, function(value)
			return value
		end)
		local needsFalse = GraphLogic_StreamNeedsBranch(condition, function(value)
			return not value
		end)
		local trueValue = nil
		local trueItems = nil
		if needsTrue then
			trueValue = GetVariantInput(ctx, behavior, "trueValue", 1)
			trueItems = GraphLogic_StreamItemsForBranch(condition, trueValue, "If")
			if DemoGraph_IsStream(trueValue) and trueItems == nil then
				return
			end
		end
		local falseValue = nil
		local falseItems = nil
		if needsFalse then
			falseValue = GetVariantInput(ctx, behavior, "falseValue", 0)
			falseItems = GraphLogic_StreamItemsForBranch(condition, falseValue, "If")
			if DemoGraph_IsStream(falseValue) and falseItems == nil then
				return
			end
		end
		ctx.setOutput(
			behavior,
			"value",
			DemoGraph_MapStream(behavior, "value", condition, function(conditionValue, key)
				if SafeBool(conditionValue) then
					return GraphLogic_BranchValue(trueValue, trueItems, key, "If")
				end
				return GraphLogic_BranchValue(falseValue, falseItems, key, "If")
			end)
		)
		return
	end

	if SafeBool(condition) then
		ctx.setOutput(behavior, "value", GetVariantInput(ctx, behavior, "trueValue", 1))
	else
		ctx.setOutput(behavior, "value", GetVariantInput(ctx, behavior, "falseValue", 0))
	end
end

function GraphTransform_Identity()
	return {
		x = 0,
		y = 0,
		z = 0,
		rotX = 0,
		rotY = 0,
		rotZ = 0,
		scaleX = 1,
		scaleY = 1,
		scaleZ = 1,
	}
end

function GraphTransform_Make(position, rotation, scale)
	position = SafeVec3(position, { x = 0, y = 0, z = 0 })
	rotation = SafeVec3(rotation, { x = 0, y = 0, z = 0 })
	scale = SafeVec3(scale, { x = 1, y = 1, z = 1 })
	return {
		x = position.x,
		y = position.y,
		z = position.z,
		rotX = rotation.x,
		rotY = rotation.y,
		rotZ = rotation.z,
		scaleX = scale.x,
		scaleY = scale.y,
		scaleZ = scale.z,
	}
end

function GraphTransform_Normalize(value, fallback)
	if value == nil then
		return fallback or GraphTransform_Identity()
	end
	if type(value) ~= "table" or DemoGraph_IsStream(value) then
		if not SATISFIED(false, "Transform value must be a table") then
			return nil
		end
	end
	local position = value.position or {
		x = value.x,
		y = value.y,
		z = value.z,
	}
	local rotation = value.rotation or {
		x = value.rotX,
		y = value.rotY,
		z = value.rotZ,
	}
	local scale = value.scale or {
		x = value.scaleX,
		y = value.scaleY,
		z = value.scaleZ,
	}
	return GraphTransform_Make(position, rotation, scale)
end

function GraphTransform_Position(transform)
	transform = GraphTransform_Normalize(transform)
	if transform == nil then
		return nil
	end
	return {
		x = transform.x,
		y = transform.y,
		z = transform.z,
	}
end

function GraphTransform_Rotation(transform)
	transform = GraphTransform_Normalize(transform)
	if transform == nil then
		return nil
	end
	return {
		x = transform.rotX,
		y = transform.rotY,
		z = transform.rotZ,
	}
end

function GraphTransform_Scale(transform)
	transform = GraphTransform_Normalize(transform)
	if transform == nil then
		return nil
	end
	return {
		x = transform.scaleX,
		y = transform.scaleY,
		z = transform.scaleZ,
	}
end

function GraphTransform_PivotNorm(value)
	return SafeVec3(value, { x = 0.5, y = 0.5, z = 0 })
end

function GraphTransform_Combine(base, transform)
	base = GraphTransform_Normalize(base, GraphTransform_Identity())
	transform = GraphTransform_Normalize(transform, GraphTransform_Identity())
	if base == nil or transform == nil then
		return nil
	end
	local position = Demo_TransformFrameSceneObjectPoint({ transform = base }, {
		x = transform.x,
		y = transform.y,
		z = transform.z,
	})
	return {
		x = position.x,
		y = position.y,
		z = position.z,
		rotX = base.rotX + transform.rotX,
		rotY = base.rotY + transform.rotY,
		rotZ = base.rotZ + transform.rotZ,
		scaleX = base.scaleX * transform.scaleX,
		scaleY = base.scaleY * transform.scaleY,
		scaleZ = base.scaleZ * transform.scaleZ,
	}
end

function GraphCameraPose_Make(position, rotation)
	position = SafeVec3(position, { x = 0, y = 0, z = 0 })
	rotation = SafeVec3(rotation, { x = 0, y = 0, z = 0 })
	return {
		posX = position.x,
		posY = position.y,
		posZ = position.z,
		rotXradians = rotation.x,
		rotYradians = rotation.y,
		rotZradians = rotation.z,
	}
end

function GraphCameraPose_Normalize(value, fallback)
	if value == nil then
		return fallback
	end
	if type(value) ~= "table" or DemoGraph_IsStream(value) then
		if not SATISFIED(false, "Camera pose value must be a table") then
			return nil
		end
	end
	local position = value.position
		or {
			x = value.posX or value.x,
			y = value.posY or value.y,
			z = value.posZ or value.z,
		}
	local rotation = value.rotation
		or {
			x = value.rotXradians or value.rotX,
			y = value.rotYradians or value.rotY,
			z = value.rotZradians or value.rotZ,
		}
	return GraphCameraPose_Make(position, rotation)
end

function GraphCameraPose_Position(pose)
	pose = GraphCameraPose_Normalize(pose)
	if pose == nil then
		return nil
	end
	return {
		x = pose.posX,
		y = pose.posY,
		z = pose.posZ,
	}
end

function GraphCameraPose_Rotation(pose)
	pose = GraphCameraPose_Normalize(pose)
	if pose == nil then
		return nil
	end
	return {
		x = pose.rotXradians,
		y = pose.rotYradians,
		z = pose.rotZradians,
	}
end

function GraphCameraPose_ApplyToCamera(camera, pose)
	if not SATISFIED(camera ~= nil, "ApplyCameraPose requires a camera") then
		return nil
	end
	local result = Demo_CloneCamera(camera)
	Demo_ApplyPose3ToCamera(result, GraphCameraPose_Normalize(pose))
	return result
end

function GraphTransform_NonZero(value)
	return abs(SafeFloat(value)) > 0.000001
end

function GraphTransform_NonIdentityScale(value)
	return abs(SafeFloat(value, 1) - 1) > 0.000001
end

function GraphTransform_ObjectLabel(frameObject)
	if frameObject == nil then
		return "nil"
	end
	return tostring(frameObject.type or "object") .. " `" .. tostring(frameObject.id or "?") .. "`"
end

function GraphTransform_HasTranslation(transform)
	return GraphTransform_NonZero(transform.x)
		or GraphTransform_NonZero(transform.y)
		or GraphTransform_NonZero(transform.z)
end

function GraphTransform_HasRotation(transform)
	return GraphTransform_NonZero(transform.rotX)
		or GraphTransform_NonZero(transform.rotY)
		or GraphTransform_NonZero(transform.rotZ)
end

function GraphTransform_HasScale(transform)
	return GraphTransform_NonIdentityScale(transform.scaleX)
		or GraphTransform_NonIdentityScale(transform.scaleY)
		or GraphTransform_NonIdentityScale(transform.scaleZ)
end

function GraphTransform_HasXYScale(transform)
	return GraphTransform_NonIdentityScale(transform.scaleX) or GraphTransform_NonIdentityScale(transform.scaleY)
end

function GraphTransform_HasAffine2D(frameObject)
	-- todo: don't work with various ways of expressing tranfsorms. find a unified
	-- way, to simplify and make this more robust.
	return frameObject.angleDeg ~= nil
		or frameObject.anchorXNorm ~= nil
		or frameObject.anchorYNorm ~= nil
		or frameObject.skewX ~= nil
		or frameObject.skewY ~= nil
end

function GraphTransform_FrameObjectSize2D(frameObject)
	-- todo: don't work with various ways of expressing tranfsorms. find a unified
	-- way, to simplify and make this more robust.
	if frameObject.size ~= nil then
		return SafeVec2(frameObject.size)
	end
	if frameObject.measuredSize ~= nil then
		return SafeVec2(frameObject.measuredSize)
	end
	if frameObject.textW ~= nil and frameObject.textH ~= nil then
		return {
			x = SafeFloat(frameObject.textW),
			y = SafeFloat(frameObject.textH),
		}
	end
	return nil
end

function GraphTransform_FrameObjectAffinePoint2D(frameObject, localX, localY)
	local position = frameObject.position or {}
	local size = GraphTransform_FrameObjectSize2D(frameObject) or { x = 0, y = 0 }
	local anchorXNorm = frameObject.anchorXNorm or 0
	local anchorYNorm = frameObject.anchorYNorm or 0
	local pivotLocalX = size.x * anchorXNorm
	local pivotLocalY = size.y * anchorYNorm
	local pivotX = SafeFloat(position.x) + pivotLocalX
	local pivotY = SafeFloat(position.y) + pivotLocalY
	local angle = ((frameObject.angleDeg or 0) * (3.141592653589793 / 180))
	local cosA = cos(angle)
	local sinA = sin(angle)
	local lx = localX - pivotLocalX
	local ly = localY - pivotLocalY
	local shearedX = lx + (frameObject.skewX or 0) * ly
	local shearedY = ly + (frameObject.skewY or 0) * lx
	return {
		x = pivotX + cosA * shearedX - sinA * shearedY,
		y = pivotY + sinA * shearedX + cosA * shearedY,
	}
end

function GraphTransform_FrameObjectPivotPoint2D(frameObject, pivotNorm)
	if frameObject.position == nil then
		return nil
	end
	local size = GraphTransform_FrameObjectSize2D(frameObject)
	if size == nil then
		return nil
	end
	return GraphTransform_FrameObjectAffinePoint2D(frameObject, size.x * pivotNorm.x, size.y * pivotNorm.y)
end

function GraphTransform_PreservePivot2D(frameObject, pivotNorm, fn)
	local before = GraphTransform_FrameObjectPivotPoint2D(frameObject, pivotNorm)
	fn()
	local after = GraphTransform_FrameObjectPivotPoint2D(frameObject, pivotNorm)
	if before ~= nil and after ~= nil then
		DemoCustom_OffsetFrameObject(frameObject, {
			x = before.x - after.x,
			y = before.y - after.y,
			z = 0,
		})
	end
end

function GraphTransform_LineCenter(frameObject)
	return {
		x = (SafeFloat(frameObject.lineStart.x) + SafeFloat(frameObject.lineEnd.x)) * 0.5,
		y = (SafeFloat(frameObject.lineStart.y) + SafeFloat(frameObject.lineEnd.y)) * 0.5,
		z = (SafeFloat(frameObject.lineStart.z) + SafeFloat(frameObject.lineEnd.z)) * 0.5,
	}
end

function GraphTransform_ApplyLineZRotation(frameObject, rotZ)
	local center = GraphTransform_LineCenter(frameObject)
	local cosZ = cos(rotZ)
	local sinZ = sin(rotZ)
	local function rotateEndpoint(point)
		local localX = SafeFloat(point.x) - center.x
		local localY = SafeFloat(point.y) - center.y
		point.x = center.x + localX * cosZ - localY * sinZ
		point.y = center.y + localX * sinZ + localY * cosZ
	end
	rotateEndpoint(frameObject.lineStart)
	rotateEndpoint(frameObject.lineEnd)
end

function GraphTransform_ApplyLineScale(frameObject, transform)
	local center = GraphTransform_LineCenter(frameObject)
	local function scaleEndpoint(point)
		point.x = center.x + (SafeFloat(point.x) - center.x) * transform.scaleX
		point.y = center.y + (SafeFloat(point.y) - center.y) * transform.scaleY
		point.z = center.z + (SafeFloat(point.z) - center.z) * transform.scaleZ
	end
	scaleEndpoint(frameObject.lineStart)
	scaleEndpoint(frameObject.lineEnd)
end

function GraphTransform_ApplyTranslation(frameObject, transform)
	if not GraphTransform_HasTranslation(transform) then
		return
	end
	if frameObject == nil then
		DEMO_ASSERT(false, "trfm: " .. GraphTransform_ObjectLabel(frameObject) .. " does not support " .. "trns1")
		return
	end
	local offset = {
		x = transform.x,
		y = transform.y,
		z = transform.z,
	}
	-- todo: don't work with various ways of expressing tranfsorms. find a unified
	-- way, to simplify and make this more robust.
	if frameObject.position ~= nil or frameObject.lineStart ~= nil or frameObject.lineEnd ~= nil then
		DemoCustom_OffsetFrameObject(frameObject, offset)
		return
	end
	if frameObject ~= nil and frameObject.transform ~= nil then
		frameObject.transform.x = (frameObject.transform.x or 0) + offset.x
		frameObject.transform.y = (frameObject.transform.y or 0) + offset.y
		frameObject.transform.z = (frameObject.transform.z or 0) + offset.z
		return
	end
	DEMO_ASSERT(false, "trfm: " .. GraphTransform_ObjectLabel(frameObject) .. " does not support " .. "trnsl1")
end

function GraphTransform_ApplyRotation(_ctx, frameObject, transform, pivotNorm)
	if not GraphTransform_HasRotation(transform) then
		return
	end
	if frameObject == nil then
		DEMO_ASSERT(false, "trfm: " .. GraphTransform_ObjectLabel(frameObject) .. " does not support " .. "rot")
		return
	end
	-- todo: don't work with various ways of expressing tranfsorms. find a unified
	-- way, to simplify and make this more robust.
	if frameObject.rotation ~= nil then
		frameObject.rotation.x = SafeFloat(frameObject.rotation.x) + transform.rotX
		frameObject.rotation.y = SafeFloat(frameObject.rotation.y) + transform.rotY
		frameObject.rotation.z = SafeFloat(frameObject.rotation.z) + transform.rotZ
		return
	end
	if frameObject.transform ~= nil then
		frameObject.transform.rotX = (frameObject.transform.rotX or 0) + transform.rotX
		frameObject.transform.rotY = (frameObject.transform.rotY or 0) + transform.rotY
		frameObject.transform.rotZ = (frameObject.transform.rotZ or 0) + transform.rotZ
		return
	end
	if GraphTransform_HasAffine2D(frameObject) then
		if GraphTransform_NonZero(transform.rotZ) then
			GraphTransform_PreservePivot2D(frameObject, pivotNorm, function()
				frameObject.anchorXNorm = pivotNorm.x
				frameObject.anchorYNorm = pivotNorm.y
				frameObject.angleDeg = (frameObject.angleDeg or 0) + (transform.rotZ * (180 / 3.141592653589793))
			end)
		end
		return
	end
	if frameObject.lineStart ~= nil and frameObject.lineEnd ~= nil then
		if GraphTransform_NonZero(transform.rotZ) then
			GraphTransform_ApplyLineZRotation(frameObject, transform.rotZ)
		end
		return
	end
	if GraphTransform_NonZero(transform.rotZ) then
		DEMO_ASSERT(false, "trfm: " .. GraphTransform_ObjectLabel(frameObject) .. " does not support " .. "rot")
	end
end

function GraphTransform_ApplyScale(frameObject, transform, pivotNorm)
	local scaleX = transform.scaleX
	local scaleY = transform.scaleY
	local scaleZ = transform.scaleZ
	if not GraphTransform_HasScale(transform) then
		return
	end
	if frameObject == nil then
		DEMO_ASSERT(false, "trfm: " .. GraphTransform_ObjectLabel(frameObject) .. " does not support " .. "scl")
		return
	end
	-- todo: don't work with all these various ways of expressing scale. find a unified
	-- way to express scale so this function can be simpler and more robust.
	if frameObject.scale ~= nil then
		frameObject.scale.x = SafeFloat(frameObject.scale.x, 1) * scaleX
		frameObject.scale.y = SafeFloat(frameObject.scale.y, 1) * scaleY
		frameObject.scale.z = SafeFloat(frameObject.scale.z, 1) * scaleZ
		return
	end
	if frameObject.transform ~= nil then
		frameObject.transform.scaleX = (frameObject.transform.scaleX or 1) * scaleX
		frameObject.transform.scaleY = (frameObject.transform.scaleY or 1) * scaleY
		frameObject.transform.scaleZ = (frameObject.transform.scaleZ or 1) * scaleZ
		return
	end
	local supportsXYScale = false
	if frameObject.lineStart ~= nil and frameObject.lineEnd ~= nil then
		GraphTransform_ApplyLineScale(frameObject, transform)
		return
	end
	if frameObject.size ~= nil or frameObject.scaleX ~= nil or frameObject.scaleY ~= nil then
		GraphTransform_PreservePivot2D(frameObject, pivotNorm, function()
			if frameObject.size ~= nil then
				frameObject.size.x = SafeFloat(frameObject.size.x) * scaleX
				frameObject.size.y = SafeFloat(frameObject.size.y) * scaleY
			end
			if frameObject.scaleX ~= nil then
				frameObject.scaleX = SafeFloat(frameObject.scaleX, 1) * scaleX
			end
			if frameObject.scaleY ~= nil then
				frameObject.scaleY = SafeFloat(frameObject.scaleY, 1) * scaleY
			end
			if GraphTransform_HasAffine2D(frameObject) then
				frameObject.anchorXNorm = pivotNorm.x
				frameObject.anchorYNorm = pivotNorm.y
			end
		end)
		supportsXYScale = true
	end
	if frameObject.radius ~= nil then
		if abs(scaleX - scaleY) > 0.000001 then
			DEMO_ASSERT(false, "trfm: " .. GraphTransform_ObjectLabel(frameObject) .. " does not support " .. "nucs")
		end
		frameObject.radius = SafeFloat(frameObject.radius) * ((abs(scaleX) + abs(scaleY)) * 0.5)
		supportsXYScale = true
	end
	if GraphTransform_HasXYScale(transform) and not supportsXYScale then
		DEMO_ASSERT(false, "trfm: " .. GraphTransform_ObjectLabel(frameObject) .. " does not support " .. "scl")
	end
end

function GraphTransform_ApplyToFrameObject(ctx, frameObject, transform, pivotNorm)
	if not SATISFIED(DemoGraph_IsFrameObject(frameObject), "TransformObjects requires frame objects") then
		return nil
	end
	transform = GraphTransform_Normalize(transform, GraphTransform_Identity())
	if transform == nil then
		return nil
	end
	pivotNorm = GraphTransform_PivotNorm(pivotNorm)
	GraphTransform_ApplyScale(frameObject, transform, pivotNorm)
	GraphTransform_ApplyRotation(ctx, frameObject, transform, pivotNorm)
	GraphTransform_ApplyTranslation(frameObject, transform)
	return frameObject
end

function G_MakeTransform(ctx, behavior)
	local position = GetVariantInput(ctx, behavior, "position", { x = 0, y = 0, z = 0 })
	local rotation = GetVariantInput(ctx, behavior, "rotation", { x = 0, y = 0, z = 0 })
	local scale = GetVariantInput(ctx, behavior, "scale", { x = 1, y = 1, z = 1 })
	ctx.setOutput(
		behavior,
		"transform",
		DemoGraph_MapInputs(behavior, "transform", { position, rotation, scale }, function(values)
			return GraphTransform_Make(values[1], values[2], values[3])
		end)
	)
end

function G_MakeCameraPose(ctx, behavior)
	local position = GetVariantInput(ctx, behavior, "position", { x = 0, y = 0, z = 0 })
	local rotation = GetVariantInput(ctx, behavior, "rotation", { x = 0, y = 0, z = 0 })
	ctx.setOutput(
		behavior,
		"pose",
		DemoGraph_MapInputs(behavior, "pose", { position, rotation }, function(values)
			return GraphCameraPose_Make(values[1], values[2])
		end)
	)
end

function G_UnpackCameraPose(ctx, behavior)
	local pose = ctx.getInput(behavior, "pose", nil)
	if not SATISFIED(pose ~= nil, "UnpackCameraPose requires a pose") then
		return
	end
	ctx.setOutput(
		behavior,
		"position",
		DemoGraph_MapInputs(behavior, "position", { pose }, function(values)
			return GraphCameraPose_Position(values[1])
		end)
	)
	ctx.setOutput(
		behavior,
		"rotation",
		DemoGraph_MapInputs(behavior, "rotation", { pose }, function(values)
			return GraphCameraPose_Rotation(values[1])
		end)
	)
end

function G_ApplyCameraPose(ctx, behavior)
	local camera = ctx.getInput(behavior, "camera", nil)
	local pose = ctx.getInput(behavior, "pose", nil)
	if camera == nil then
		return
	end
	ctx.setOutput(
		behavior,
		"result",
		DemoGraph_MapInputs(behavior, "result", { camera, pose }, function(values)
			return GraphCameraPose_ApplyToCamera(values[1], values[2])
		end)
	)
end

function G_SetCameraPose(ctx, behavior)
	local camera = ctx.getInput(behavior, "camera", nil)
	local position = GetVariantInput(ctx, behavior, "position", { x = 0, y = 0, z = 0 })
	local rotation = GetVariantInput(ctx, behavior, "rotation", { x = 0, y = 0, z = 0 })
	if camera == nil then
		return
	end
	ctx.setOutput(
		behavior,
		"result",
		DemoGraph_MapInputs(behavior, "result", { camera, position, rotation }, function(values)
			return GraphCameraPose_ApplyToCamera(values[1], GraphCameraPose_Make(values[2], values[3]))
		end)
	)
end

function G_SplitTransform(ctx, behavior)
	local transform = ctx.getInput(behavior, "transform", nil)
	if not SATISFIED(transform ~= nil, "SplitTransform requires a transform") then
		return
	end
	ctx.setOutput(
		behavior,
		"position",
		DemoGraph_MapInputs(behavior, "position", { transform }, function(values)
			return GraphTransform_Position(values[1])
		end)
	)
	ctx.setOutput(
		behavior,
		"rotation",
		DemoGraph_MapInputs(behavior, "rotation", { transform }, function(values)
			return GraphTransform_Rotation(values[1])
		end)
	)
	ctx.setOutput(
		behavior,
		"scale",
		DemoGraph_MapInputs(behavior, "scale", { transform }, function(values)
			return GraphTransform_Scale(values[1])
		end)
	)
end

function G_CombineTransform(ctx, behavior)
	local base = ctx.getInput(behavior, "base", nil)
	local transform = ctx.getInput(behavior, "transform", nil)
	ctx.setOutput(
		behavior,
		"result",
		DemoGraph_MapInputs(behavior, "result", { base, transform }, function(values)
			return GraphTransform_Combine(values[1], values[2])
		end)
	)
end

function G_ApplyTransform(ctx, behavior)
	local objects = ctx.getInput(behavior, "objects", nil)
	local transform = ctx.getInput(behavior, "transform", GraphTransform_Identity())
	local pivotNorm = GetVec3Input(ctx, behavior, "pivotNorm", { x = 0.5, y = 0.5, z = 0 })
	if not SATISFIED(objects ~= nil, "ApplyTransform requires objects") then
		return
	end
	ctx.setOutput(
		behavior,
		"objectsOut",
		DemoGraph_MapInputs(behavior, "objectsOut", { objects, transform, pivotNorm }, function(values)
			return GraphTransform_ApplyToFrameObject(ctx, values[1], values[2], values[3])
		end)
	)
end

function G_TransformObjects(ctx, behavior)
	local objects = ctx.getInput(behavior, "objects", nil)
	local position = GetVariantInput(ctx, behavior, "position", { x = 0, y = 0, z = 0 })
	local rotation = GetVariantInput(ctx, behavior, "rotation", { x = 0, y = 0, z = 0 })
	local scale = GetVariantInput(ctx, behavior, "scale", { x = 1, y = 1, z = 1 })
	local pivotNorm = GetVec3Input(ctx, behavior, "pivotNorm", { x = 0.5, y = 0.5, z = 0 })
	if not SATISFIED(objects ~= nil, "TransformObjects requires objects") then
		return
	end
	ctx.setOutput(
		behavior,
		"objectsOut",
		DemoGraph_MapInputs(behavior, "objectsOut", { objects, position, rotation, scale, pivotNorm }, function(values)
			local transform = GraphTransform_Make(values[2], values[3], values[4])
			return GraphTransform_ApplyToFrameObject(ctx, values[1], transform, values[5])
		end)
	)
end

local function DebugGraph_Label(behavior)
	return ((type(behavior.name) ~= "string" or behavior.name == "") and behavior.id or behavior.name)
end

local function DebugGraph_DumpValue(label, value)
	if DemoGraph_IsStream(value) then
		DemoCustom_AddHudLine(string.format("%s: stream[%d]", label, #value.items))
		for i = 1, #value.items do
			local item = value.items[i]
			-- item.key is useful but too long for the hud display.
			DemoCustom_AddHudLine(string.format("%s[%s]: %s", label, tostring(i), ValueToString(item.value)))
		end
		return
	end
	DemoCustom_AddHudLine(string.format("%s: %s", label, ValueToString(value)))
end

function G_DebugDump(ctx, behavior)
	local input = ctx.getInput(behavior, "input")
	if input ~= nil then
		DebugGraph_DumpValue(DebugGraph_Label(behavior), input)
	end
	ctx.setOutput(behavior, "value", input)
end

local function DebugGraph_CanPlot(value)
	return type(value) == "number" or IsVec3(value)
end

local function DebugGraph_PlotSample(state, value, speed, millis)
	if not DebugGraph_CanPlot(value) then
		return
	end

	local dt = 0
	if state.lastMillis ~= nil then
		dt = (
			((millis - state.lastMillis) / 1000) < 0 and 0
			or (((millis - state.lastMillis) / 1000) > 0.5 and 0.5 or ((millis - state.lastMillis) / 1000))
		)
	end
	state.lastMillis = millis

	state.capacity = state.capacity or (240 - 18)
	state.buf = state.buf or {}
	state.count = state.count or 0
	state.writePos = state.writePos or 1
	state.carry = state.carry or 0
	state.carry = state.carry + speed * dt
	state.isVec3 = IsVec3(value)

	local sampledValue = state.isVec3 and SafeVec3(value) or SafeFloat(value)
	local pushCount = state.carry // 1
	if pushCount > state.capacity then
		pushCount = state.capacity
	end
	state.carry = state.carry - pushCount
	for i = 1, pushCount do
		state.buf[state.writePos] = sampledValue
		state.writePos = (state.writePos % state.capacity) + 1
		if state.count < state.capacity then
			state.count = state.count + 1
		end
	end

	gDemoHudPlots[#gDemoHudPlots + 1] = {
		state = state,
	}
end

function G_DebugPlot(ctx, behavior)
	local input = ctx.getInput(behavior, "input")
	if input ~= nil then
		local speed = 60
		local millis = ctx.t.demoMillis or 0
		local state = behavior.state
		state.plotInstances = state.plotInstances or {}
		if DemoGraph_IsStream(input) then
			for i = 1, #input.items do
				local item = input.items[i]
				local instanceKey = item.key or i
				state.plotInstances[instanceKey] = state.plotInstances[instanceKey] or {}
				DebugGraph_PlotSample(state.plotInstances[instanceKey], item.value, speed, millis)
			end
		else
			state.plotInstances.__single = state.plotInstances.__single or {}
			DebugGraph_PlotSample(state.plotInstances.__single, input, speed, millis)
		end
	end
	ctx.setOutput(behavior, "value", input)
end

function G_WrappedStreamIndex(stream, index)
	if not DemoGraph_IsStream(stream) or #stream.items == 0 then
		return nil
	end
	return (SafeFloat(index) // 1) % #stream.items + 1
end

function G_NormalizedStreamIndex(stream, selector)
	if not DemoGraph_IsStream(stream) or #stream.items == 0 then
		return nil
	end
	return ((SafeFloat(selector) % 1) * #stream.items) // 1 + 1
end

function G_WrappedInputIndex(count, index)
	if count <= 0 then
		return nil
	end
	return (SafeFloat(index) // 1) % count + 1
end

function G_NormalizedInputIndex(count, selector)
	if count <= 0 then
		return nil
	end
	return ((SafeFloat(selector) % 1) * count) // 1 + 1
end

function GraphCollection_InputStream(ctx, behavior, portId)
	local stream = ctx.getInput(behavior, portId)
	if DemoGraph_IsStream(stream) then
		return stream
	end
	return DemoGraph_NewStream(behavior, portId)
end

function GraphCollection_CountInput(ctx, behavior, portId, defaultValue)
	local count = GetFloatInput(ctx, behavior, portId, defaultValue) // 1
	if count < 0 then
		return 0
	end
	if count > 4096 then
		return 4096
	end
	return count
end

function GraphCollection_NumberKey(value)
	return string.format("%.17g", SafeFloat(value))
end

function GraphCollection_ValueKey(value)
	local valueType = type(value)
	if value == nil then
		return "nil"
	end
	if valueType == "number" then
		return "n:" .. GraphCollection_NumberKey(value)
	end
	if valueType == "string" then
		return "s:" .. value
	end
	if valueType == "boolean" then
		return value and "b:1" or "b:0"
	end
	if valueType == "table" then
		if DemoGraph_IsFrameObject(value) then
			return "o:" .. tostring(Demo_GetInstanceKey(value))
		end
		if type(value.x) == "number" and type(value.y) == "number" then
			if type(value.z) == "number" then
				return "v3:"
					.. GraphCollection_NumberKey(value.x)
					.. ","
					.. GraphCollection_NumberKey(value.y)
					.. ","
					.. GraphCollection_NumberKey(value.z)
			end
			return "v2:" .. GraphCollection_NumberKey(value.x) .. "," .. GraphCollection_NumberKey(value.y)
		end
	end
	if not SATISFIED(false, "Collection set operation requires comparable scalar, vector, or object values") then
		return nil
	end
	return nil
end

function GraphCollection_Append(items, value)
	items[#items + 1] = {
		key = #items,
		value = value,
	}
end

function GraphCollection_AddDistinct(items, seen, value)
	local key = GraphCollection_ValueKey(value)
	if key == nil then
		return false
	end
	if seen[key] then
		return true
	end
	seen[key] = true
	GraphCollection_Append(items, value)
	return true
end

function GraphCollection_KeySet(stream)
	local result = {}
	for i = 1, #stream.items do
		local key = GraphCollection_ValueKey(stream.items[i].value)
		if key == nil then
			return nil
		end
		result[key] = true
	end
	return result
end

function GraphCollection_SetResult(ctx, behavior, portId, items)
	ctx.setOutput(behavior, portId, DemoGraph_NewStream(behavior, portId, items))
end

function GraphCollection_MinCount(a, b)
	return #a.items < #b.items and #a.items or #b.items
end

function G_Array(ctx, behavior)
	local stream = FlattenInputsToStream(behavior, "items", ctx.getMultiInputs(behavior, "values"))
	ctx.setOutput(behavior, "count", #stream.items)
	ctx.setOutput(behavior, "items", stream)
end

function G_Select(ctx, behavior)
	local index = ctx.getInput(behavior, "index", ctx.getBehaviorParam(behavior, "index"))
	local valueCount = ctx.getMultiInputCount(behavior, "values")
	if DemoGraph_IsStream(index) then
		ctx.setOutput(
			behavior,
			"value",
			DemoGraph_MapStream(behavior, "value", index, function(selector)
				local valueIndex = G_WrappedInputIndex(valueCount, selector)
				return valueIndex ~= nil and ctx.getMultiInput(behavior, "values", valueIndex) or nil
			end)
		)
		return
	end

	local valueIndex = G_WrappedInputIndex(valueCount, index)
	if valueIndex == nil then
		return
	end
	local value = ctx.getMultiInput(behavior, "values", valueIndex)
	if value ~= nil then
		ctx.setOutput(behavior, "value", value)
	end
end

function G_SelectNormalized(ctx, behavior)
	local selector = ctx.getInput(behavior, "selector", ctx.getBehaviorParam(behavior, "selector"))
	local valueCount = ctx.getMultiInputCount(behavior, "values")
	if DemoGraph_IsStream(selector) then
		ctx.setOutput(
			behavior,
			"value",
			DemoGraph_MapStream(behavior, "value", selector, function(selectorValue)
				local valueIndex = G_NormalizedInputIndex(valueCount, selectorValue)
				return valueIndex ~= nil and ctx.getMultiInput(behavior, "values", valueIndex) or nil
			end)
		)
		return
	end

	local valueIndex = G_NormalizedInputIndex(valueCount, selector)
	if valueIndex == nil then
		return
	end
	local value = ctx.getMultiInput(behavior, "values", valueIndex)
	if value ~= nil then
		ctx.setOutput(behavior, "value", value)
	end
end

function G_Count(ctx, behavior)
	local items = ctx.getInput(behavior, "items")
	ctx.setOutput(behavior, "count", DemoGraph_IsStream(items) and #items.items or 0)
end

function G_Index(ctx, behavior)
	local items = ctx.getInput(behavior, "items")
	if not DemoGraph_IsStream(items) then
		ctx.setOutput(behavior, "index", DemoGraph_NewStream(behavior, "index"))
		return
	end

	local outputItems = {}
	for i = 1, #items.items do
		outputItems[#outputItems + 1] = {
			key = items.items[i].key,
			value = i - 1,
		}
	end
	ctx.setOutput(behavior, "index", DemoGraph_NewStreamWithDomain(items.domain, outputItems))
end

function G_NormalizedIndex(ctx, behavior)
	local items = ctx.getInput(behavior, "items")
	if not DemoGraph_IsStream(items) then
		ctx.setOutput(behavior, "normIndex", DemoGraph_NewStream(behavior, "normIndex"))
		return
	end

	local outputItems = {}
	local count = #items.items
	for i = 1, count do
		outputItems[#outputItems + 1] = {
			key = items.items[i].key,
			value = count > 1 and (i - 1) / (count - 1) or 0,
		}
	end
	ctx.setOutput(behavior, "normIndex", DemoGraph_NewStreamWithDomain(items.domain, outputItems))
end

function G_ExtractItem(ctx, behavior)
	local items = ctx.getInput(behavior, "items")
	if not DemoGraph_IsStream(items) or #items.items == 0 then
		ctx.setOutput(behavior, "item", DemoGraph_NewStream(behavior, "item"))
		ctx.setOutput(behavior, "rest", DemoGraph_NewStream(behavior, "rest"))
		return
	end

	local itemIndex =
		G_WrappedStreamIndex(items, ctx.getInput(behavior, "index", ctx.getBehaviorParam(behavior, "index")))
	local item = {}
	local rest = {}
	for i = 1, #items.items do
		local streamItem = items.items[i]
		local outputItem = {
			key = streamItem.key,
			value = streamItem.value,
		}
		if i == itemIndex then
			item[#item + 1] = outputItem
		else
			rest[#rest + 1] = outputItem
		end
	end

	ctx.setOutput(behavior, "item", DemoGraph_NewStreamWithDomain(items.domain, item))
	ctx.setOutput(behavior, "rest", DemoGraph_NewStreamWithDomain(items.domain, rest))
end

function G_Partition(ctx, behavior)
	local items = ctx.getInput(behavior, "items")
	local mask = ctx.getInput(behavior, "mask")
	if not DemoGraph_IsStream(items) then
		ctx.setOutput(behavior, "matched", DemoGraph_NewStream(behavior, "matched"))
		ctx.setOutput(behavior, "rest", DemoGraph_NewStream(behavior, "rest"))
		return
	end
	if not SATISFIED(DemoGraph_IsStream(mask), "Partition requires a mask stream") then
		ctx.setOutput(behavior, "matched", DemoGraph_NewStreamWithDomain(items.domain))
		ctx.setOutput(behavior, "rest", DemoGraph_NewStreamWithDomain(items.domain, items.items))
		return
	end
	if not SATISFIED(DemoGraph_SameDomain(items, mask), "Partition mask stream must use the same domain as items") then
		return
	end

	local maskByKey = DemoGraph_StreamItemsByKey(mask)
	if maskByKey == nil then
		return
	end
	local matched = {}
	local rest = {}
	for i = 1, #items.items do
		local streamItem = items.items[i]
		local maskValue = maskByKey[streamItem.key]
		if not SATISFIED(maskValue ~= nil, "Partition mask stream is missing an item key") then
			return
		end
		local outputItem = {
			key = streamItem.key,
			value = streamItem.value,
		}
		if SafeBool(maskValue) then
			matched[#matched + 1] = outputItem
		else
			rest[#rest + 1] = outputItem
		end
	end

	ctx.setOutput(behavior, "matched", DemoGraph_NewStreamWithDomain(items.domain, matched))
	ctx.setOutput(behavior, "rest", DemoGraph_NewStreamWithDomain(items.domain, rest))
end

function G_Distinct(ctx, behavior)
	local input = GraphCollection_InputStream(ctx, behavior, "input")
	local seen = {}
	local items = {}
	for i = 1, #input.items do
		if not GraphCollection_AddDistinct(items, seen, input.items[i].value) then
			return
		end
	end
	GraphCollection_SetResult(ctx, behavior, "items", items)
end

function G_Intersection(ctx, behavior)
	local a = GraphCollection_InputStream(ctx, behavior, "a")
	local bSet = GraphCollection_KeySet(GraphCollection_InputStream(ctx, behavior, "b"))
	if bSet == nil then
		return
	end
	local seen = {}
	local items = {}
	for i = 1, #a.items do
		local value = a.items[i].value
		local key = GraphCollection_ValueKey(value)
		if key == nil then
			return
		end
		if bSet[key] and not seen[key] then
			seen[key] = true
			GraphCollection_Append(items, value)
		end
	end
	GraphCollection_SetResult(ctx, behavior, "items", items)
end

function G_UnionDistinct(ctx, behavior)
	local a = GraphCollection_InputStream(ctx, behavior, "a")
	local b = GraphCollection_InputStream(ctx, behavior, "b")
	local seen = {}
	local items = {}
	for i = 1, #a.items do
		if not GraphCollection_AddDistinct(items, seen, a.items[i].value) then
			return
		end
	end
	for i = 1, #b.items do
		if not GraphCollection_AddDistinct(items, seen, b.items[i].value) then
			return
		end
	end
	GraphCollection_SetResult(ctx, behavior, "items", items)
end

function G_SetXor(ctx, behavior)
	local a = GraphCollection_InputStream(ctx, behavior, "a")
	local b = GraphCollection_InputStream(ctx, behavior, "b")
	local aSet = GraphCollection_KeySet(a)
	local bSet = GraphCollection_KeySet(b)
	if aSet == nil or bSet == nil then
		return
	end
	local seen = {}
	local items = {}
	for i = 1, #a.items do
		local value = a.items[i].value
		local key = GraphCollection_ValueKey(value)
		if key == nil then
			return
		end
		if not bSet[key] and not seen[key] then
			seen[key] = true
			GraphCollection_Append(items, value)
		end
	end
	for i = 1, #b.items do
		local value = b.items[i].value
		local key = GraphCollection_ValueKey(value)
		if key == nil then
			return
		end
		if not aSet[key] and not seen[key] then
			seen[key] = true
			GraphCollection_Append(items, value)
		end
	end
	GraphCollection_SetResult(ctx, behavior, "items", items)
end

function G_SetDiff(ctx, behavior)
	local a = GraphCollection_InputStream(ctx, behavior, "a")
	local bSet = GraphCollection_KeySet(GraphCollection_InputStream(ctx, behavior, "b"))
	if bSet == nil then
		return
	end
	local seen = {}
	local items = {}
	for i = 1, #a.items do
		local value = a.items[i].value
		local key = GraphCollection_ValueKey(value)
		if key == nil then
			return
		end
		if not bSet[key] and not seen[key] then
			seen[key] = true
			GraphCollection_Append(items, value)
		end
	end
	GraphCollection_SetResult(ctx, behavior, "items", items)
end

function G_NumericRange(ctx, behavior)
	local start = GetFloatInput(ctx, behavior, "start", 0)
	local step = GetFloatInput(ctx, behavior, "step", 1)
	local count = GraphCollection_CountInput(ctx, behavior, "count", 1)
	local items = {}
	for i = 1, count do
		GraphCollection_Append(items, start + step * (i - 1))
	end
	GraphCollection_SetResult(ctx, behavior, "items", items)
end

function G_Zip(ctx, behavior)
	local a = GraphCollection_InputStream(ctx, behavior, "a")
	local b = GraphCollection_InputStream(ctx, behavior, "b")
	local dropTail = GetBoolInput(ctx, behavior, "dropTail", true)
	local pairedCount = GraphCollection_MinCount(a, b)
	local items = {}
	for i = 1, pairedCount do
		GraphCollection_Append(items, a.items[i].value)
		GraphCollection_Append(items, b.items[i].value)
	end
	if not dropTail then
		for i = pairedCount + 1, #a.items do
			GraphCollection_Append(items, a.items[i].value)
		end
		for i = pairedCount + 1, #b.items do
			GraphCollection_Append(items, b.items[i].value)
		end
	end
	ctx.setOutput(behavior, "count", #items)
	GraphCollection_SetResult(ctx, behavior, "items", items)
end

function G_Unzip(ctx, behavior)
	local input = GraphCollection_InputStream(ctx, behavior, "items")
	local even = {}
	local odd = {}
	for i = 1, #input.items do
		if (i - 1) % 2 == 0 then
			GraphCollection_Append(even, input.items[i].value)
		else
			GraphCollection_Append(odd, input.items[i].value)
		end
	end
	GraphCollection_SetResult(ctx, behavior, "even", even)
	GraphCollection_SetResult(ctx, behavior, "odd", odd)
end

function G_Shuffle(ctx, behavior)
	local input = GraphCollection_InputStream(ctx, behavior, "input")
	local seed = GetFloatInput(ctx, behavior, "seed", 0)
	local sorted = {}
	for i = 1, #input.items do
		local item = input.items[i]
		local keyHash = DemoCustom_StringHashNumber(tostring(item.key), seed)
		sorted[#sorted + 1] = {
			index = i,
			sortKey = Hash1D(seed + keyHash + i * 37.17),
			value = item.value,
		}
	end
	table.sort(sorted, function(a, b)
		if a.sortKey == b.sortKey then
			return a.index < b.index
		end
		return a.sortKey < b.sortKey
	end)
	local items = {}
	for i = 1, #sorted do
		GraphCollection_Append(items, sorted[i].value)
	end
	GraphCollection_SetResult(ctx, behavior, "items", items)
end

function G_FillArray(ctx, behavior)
	local count = GraphCollection_CountInput(ctx, behavior, "count", 1)
	local value = ctx.getInput(behavior, "value", ctx.getBehaviorParam(behavior, "value", 0))
	local items = {}
	for i = 1, count do
		GraphCollection_Append(items, value)
	end
	GraphCollection_SetResult(ctx, behavior, "items", items)
end

function G_ArraySubset(ctx, behavior)
	local input = GraphCollection_InputStream(ctx, behavior, "input")
	local start = GetFloatInput(ctx, behavior, "start", 0) // 1
	local count = GraphCollection_CountInput(ctx, behavior, "count", 1)
	if start < 0 then
		start = 0
	end
	local items = {}
	local lastIndex = start + count
	if lastIndex > #input.items then
		lastIndex = #input.items
	end
	for i = start + 1, lastIndex do
		GraphCollection_Append(items, input.items[i].value)
	end
	GraphCollection_SetResult(ctx, behavior, "items", items)
end

function GraphPath_NormalizeJoin(value)
	value = SafeString(value, "corner")
	if value == "bevel" or value == "foldOver" or value == "foldUnder" then
		return value
	end
	return "corner"
end

function GraphPath_NormalizeJoinMode(value)
	value = SafeString(value, "append")
	if value == "graft" then
		return value
	end
	return "append"
end

function GraphPath_IsFoldJoin(join)
	return join == "foldOver" or join == "foldUnder"
end

function GraphPath_NormalizeFace(value)
	value = SafeString(value, "front")
	if value == "back" then
		return value
	end
	return "front"
end

function GraphPath_FlipFace(face)
	return GraphPath_NormalizeFace(face) == "front" and "back" or "front"
end

function GraphPath_IsPoint(value)
	return type(value) == "table" and value.kind == "pathPoint2D"
end

function GraphPath_IsPath(value)
	return type(value) == "table" and value.kind == "path2D" and type(value.points) == "table"
end

function GraphPath_ClonePoint(point)
	local position = SafeVec3(point and point.position or point, { x = 0, y = 0, z = 0 })
	return {
		kind = "pathPoint2D",
		position = {
			x = position.x,
			y = position.y,
			z = position.z,
		},
		join = GraphPath_NormalizeJoin(point and point.join),
	}
end

function GraphPath_CloneTranslatedPoint(point, offset)
	local cloned = GraphPath_ClonePoint(point)
	offset = SafeVec3(offset, { x = 0, y = 0, z = 0 })
	cloned.position.x = cloned.position.x + offset.x
	cloned.position.y = cloned.position.y + offset.y
	cloned.position.z = cloned.position.z + offset.z
	return cloned
end

function GraphPath_Bounds(points)
	if #points == 0 then
		return {
			x = 0,
			y = 0,
			width = 0,
			height = 0,
			minX = 0,
			minY = 0,
			maxX = 0,
			maxY = 0,
		}
	end

	local minX = points[1].position.x
	local minY = points[1].position.y
	local maxX = minX
	local maxY = minY
	for i = 2, #points do
		local p = points[i].position
		minX = min(minX, p.x)
		minY = min(minY, p.y)
		maxX = max(maxX, p.x)
		maxY = max(maxY, p.y)
	end
	return {
		x = minX,
		y = minY,
		width = maxX - minX,
		height = maxY - minY,
		minX = minX,
		minY = minY,
		maxX = maxX,
		maxY = maxY,
	}
end

function GraphPath_SegmentLength(a, b)
	local dx = b.position.x - a.position.x
	local dy = b.position.y - a.position.y
	return sqrt(dx * dx + dy * dy)
end

function GraphPath_Build(points, closed, startFace)
	closed = SafeBool(closed, false)
	startFace = GraphPath_NormalizeFace(startFace)
	local normalizedPoints = {}
	for i = 1, #(points or {}) do
		normalizedPoints[i] = GraphPath_ClonePoint(points[i])
		normalizedPoints[i].index = i - 1
	end

	local pointCount = #normalizedPoints
	local segmentCount = 0
	if pointCount >= 2 then
		segmentCount = closed and pointCount or pointCount - 1
	end

	local segments = {}
	local totalLength = 0
	local warnings = {}
	for i = 1, segmentCount do
		local startIndex = i
		local endIndex = i < pointCount and i + 1 or 1
		local length = GraphPath_SegmentLength(normalizedPoints[startIndex], normalizedPoints[endIndex])
		if length <= 0 then
			warnings[#warnings + 1] = "degenerate segment " .. tostring(i - 1)
		end
		totalLength = totalLength + length
		segments[i] = {
			index = i - 1,
			startIndex = startIndex - 1,
			endIndex = endIndex - 1,
			length = length,
		}
	end

	return {
		kind = "path2D",
		closed = closed,
		startFace = startFace,
		points = normalizedPoints,
		segments = segments,
		pointCount = pointCount,
		segmentCount = segmentCount,
		length = totalLength,
		bounds = GraphPath_Bounds(normalizedPoints),
		warnings = warnings,
	}
end

function GraphPath_ClonePath(path)
	if not SATISFIED(GraphPath_IsPath(path), "Expected Path2D value") then
		return nil
	end
	local points = {}
	for i = 1, #path.points do
		points[i] = GraphPath_ClonePoint(path.points[i])
	end
	return GraphPath_Build(points, path.closed, path.startFace)
end

function GraphPath_PointEquals(a, b)
	if a == nil or b == nil then
		return false
	end
	local pa = SafeVec2(a.position or a, { x = 0, y = 0 })
	local pb = SafeVec2(b.position or b, { x = 0, y = 0 })
	return abs(pa.x - pb.x) <= 0.0001 and abs(pa.y - pb.y) <= 0.0001
end

function GraphPath_CountInput(ctx, behavior, portId, defaultValue)
	return (
		(GetFloatInput(ctx, behavior, portId, defaultValue) // 1) < 0 and 0
		or (
			(GetFloatInput(ctx, behavior, portId, defaultValue) // 1) > 4096 and 4096
			or (GetFloatInput(ctx, behavior, portId, defaultValue) // 1)
		)
	)
end

function GraphPath_Scale2Input(ctx, behavior, portId, defaultValue)
	return GetSize2Input(ctx, behavior, portId, defaultValue or { x = 1, y = 1 })
end

function GraphPath_SetStreamOutput(ctx, behavior, portId, values)
	local items = {}
	for i = 1, #values do
		items[i] = {
			key = i - 1,
			value = values[i],
		}
	end
	ctx.setOutput(behavior, portId, DemoGraph_NewStream(behavior, portId, items))
end

function GraphPath_ForEachPoint(path, index, fn)
	if index < 0 then
		for i = 1, #path.points do
			fn(path.points[i])
		end
	elseif #path.points > 0 then
		fn(path.points[index % #path.points + 1])
	end
end

function GraphPath_SampleAt(path, u)
	local point = path.points[1] or { position = { x = 0, y = 0, z = 0 } }
	local totalLength = max(0, SafeFloat(path.length, 0))
	if totalLength <= 0 or #(path.segments or {}) == 0 then
		return {
			u = 0,
			distance = 0,
			position = SafeVec3(point.position),
			tangent = { x = 1, y = 0 },
			normal = { x = 0, y = 1 },
			segmentIndex = -1,
			segmentT = 0,
			face = GraphPath_NormalizeFace(path.startFace),
		}
	end

	local normalizedU = SafeFloat(u)
	normalizedU = path.closed and normalizedU % 1 or (normalizedU < 0 and 0 or (normalizedU > 1 and 1 or normalizedU))
	local distance = normalizedU * totalLength
	local accumulated = 0
	local currentFace = GraphPath_NormalizeFace(path.startFace)
	for i = 1, #path.segments do
		local segment = path.segments[i]
		local segmentLength = max(0, SafeFloat(segment.length, 0))
		local nextAccumulated = accumulated + segmentLength
		if distance <= nextAccumulated or i == #path.segments then
			local nd = (distance - accumulated) / segmentLength -- normalized distance along this segment
			local segmentT = segmentLength > 0 and (nd < 0 and 0 or (nd > 1 and 1 or nd)) or 0
			local startPoint = path.points[(segment.startIndex or 0) + 1] or point
			local endPoint = path.points[(segment.endIndex or 0) + 1] or startPoint
			local sx = SafeFloat(startPoint.position.x)
			local sy = SafeFloat(startPoint.position.y)
			local sz = SafeFloat(startPoint.position.z)
			local ex = SafeFloat(endPoint.position.x)
			local ey = SafeFloat(endPoint.position.y)
			local ez = SafeFloat(endPoint.position.z)
			local dx = ex - sx
			local dy = ey - sy
			local invLength = segmentLength > 0 and 1 / segmentLength or 0
			local tx = segmentLength > 0 and dx * invLength or 1
			local ty = segmentLength > 0 and dy * invLength or 0
			return {
				u = totalLength > 0 and distance / totalLength or 0,
				distance = distance,
				position = {
					x = (sx + (ex - sx) * segmentT),
					y = (sy + (ey - sy) * segmentT),
					z = (sz + (ez - sz) * segmentT),
				},
				tangent = {
					x = tx,
					y = ty,
				},
				normal = {
					x = -ty,
					y = tx,
				},
				segmentIndex = segment.index or i - 1,
				segmentT = segmentT,
				face = currentFace,
			}
		end
		local nextPoint = path.points[(segment.endIndex or 0) + 1]
		if nextPoint ~= nil and GraphPath_IsFoldJoin(nextPoint.join) then
			currentFace = GraphPath_FlipFace(currentFace)
		end
		accumulated = nextAccumulated
	end
end

function GraphPath_SampleAtDistance(path, distance)
	local totalLength = max(0, SafeFloat(path.length, 0))
	if totalLength <= 0 then
		return GraphPath_SampleAt(path, 0)
	end
	local clampedDistance = path.closed and (SafeFloat(distance) % totalLength)
		or (
			(SafeFloat(distance)) < 0 and 0
			or ((SafeFloat(distance)) > totalLength and totalLength or (SafeFloat(distance)))
		)
	return GraphPath_SampleAt(path, clampedDistance / totalLength)
end

function GraphPath_PointFromSample(sample)
	return GraphPath_ClonePoint({
		position = sample and sample.position or { x = 0, y = 0, z = 0 },
		join = "corner",
	})
end

function GraphPath_AddSubPathInterval(path, points, fromDistance, toDistance, includeStart)
	local epsilon = 0.0001
	fromDistance = max(0, SafeFloat(fromDistance, 0))
	toDistance = max(fromDistance, SafeFloat(toDistance, fromDistance))

	if includeStart then
		points[#points + 1] = GraphPath_PointFromSample(GraphPath_SampleAtDistance(path, fromDistance))
	end

	if toDistance - fromDistance <= epsilon then
		return
	end

	local accumulated = 0
	for i = 1, #(path.segments or {}) do
		local segment = path.segments[i]
		local segmentLength = max(0, SafeFloat(segment.length, 0))
		local nextAccumulated = accumulated + segmentLength
		if nextAccumulated > fromDistance + epsilon and nextAccumulated < toDistance - epsilon then
			local endPoint = path.points[(segment.endIndex or 0) + 1]
			if endPoint ~= nil then
				points[#points + 1] = GraphPath_ClonePoint(endPoint)
			end
		end
		accumulated = nextAccumulated
	end

	points[#points + 1] = GraphPath_PointFromSample(GraphPath_SampleAtDistance(path, toDistance))
end

function GraphPath_InputPoints(ctx, behavior)
	local stream = FlattenInputsToStream(behavior, "points", ctx.getMultiInputs(behavior, "points"))
	local points = {}
	for i = 1, #stream.items do
		local value = stream.items[i].value
		if GraphPath_IsPoint(value) then
			points[#points + 1] = value
		elseif type(value) == "table" and value.x ~= nil and value.y ~= nil then
			points[#points + 1] = GraphPath_ClonePoint({
				position = value,
			})
		elseif not SATISFIED(false, "PathFromPoints requires PathPoint2D or Position2 values") then
			return nil
		end
	end
	return points
end

function GraphPath_InputVec3ListPoints(ctx, behavior)
	local stream = FlattenInputsToStream(behavior, "points", ctx.getMultiInputs(behavior, "points"))
	local join = GraphPath_NormalizeJoin(GetStringInput(ctx, behavior, "join", "corner"))
	local points = {}
	for i = 1, #stream.items do
		local value = stream.items[i].value
		if
			not SATISFIED(
				type(value) == "table" and value.x ~= nil and value.y ~= nil,
				"PathFromVec3List requires vec3 values"
			)
		then
			return nil
		end
		points[#points + 1] = GraphPath_ClonePoint({
			position = value,
			join = join,
		})
	end
	return points
end

function GraphPath_SetOutputs(ctx, behavior, path)
	if path == nil then
		return
	end
	ctx.setOutput(behavior, "path", path)
	ctx.setOutput(behavior, "pointCount", path.pointCount or 0)
	ctx.setOutput(behavior, "segmentCount", path.segmentCount or 0)
	ctx.setOutput(behavior, "length", path.length or 0)
end

function G_PathPoint2D(ctx, behavior)
	local params = behavior.params or {}
	local position = ctx.getInput(
		behavior,
		"position",
		ctx.getBehaviorParam(behavior, "position", params.position or { x = 0, y = 0 })
	)
	local join = ctx.getInput(behavior, "join", ctx.getBehaviorParam(behavior, "join", params.join or "corner"))
	ctx.setOutput(
		behavior,
		"point",
		DemoGraph_MapInputs(behavior, "point", { position, join }, function(values)
			return GraphPath_ClonePoint({
				position = values[1],
				join = values[2],
			})
		end)
	)
end

function G_PathFromPoints(ctx, behavior)
	local params = behavior.params or {}
	local points = GraphPath_InputPoints(ctx, behavior)
	if points == nil then
		return
	end
	GraphPath_SetOutputs(
		ctx,
		behavior,
		GraphPath_Build(
			points,
			GetBoolInput(ctx, behavior, "closed", params.closed == true),
			GetStringInput(ctx, behavior, "startFace", params.startFace or "front")
		)
	)
end

function G_PathFromVec3List(ctx, behavior)
	local params = behavior.params or {}
	local points = GraphPath_InputVec3ListPoints(ctx, behavior)
	if points == nil then
		return
	end
	GraphPath_SetOutputs(
		ctx,
		behavior,
		GraphPath_Build(
			points,
			GetBoolInput(ctx, behavior, "closed", params.closed == true),
			GetStringInput(ctx, behavior, "startFace", params.startFace or "front")
		)
	)
end

function G_JoinPaths(ctx, behavior)
	local params = behavior.params or {}
	local stream = FlattenInputsToStream(behavior, "paths", ctx.getMultiInputs(behavior, "paths"))
	local mode = GraphPath_NormalizeJoinMode(GetStringInput(ctx, behavior, "mode", params.mode or "append"))
	local join = GraphPath_NormalizeJoin(GetStringInput(ctx, behavior, "join", params.join or "corner"))
	local closed = GetBoolInput(ctx, behavior, "closed", params.closed == true)
	local dropDuplicateEndpoints =
		GetBoolInput(ctx, behavior, "dropDuplicateEndpoints", params.dropDuplicateEndpoints ~= false)
	local points = {}
	local startFace = "front"
	for i = 1, #stream.items do
		local path = stream.items[i].value
		if not SATISFIED(GraphPath_IsPath(path), "JoinPaths requires Path2D values") then
			return
		end
		if not SATISFIED(not path.closed, "JoinPaths expects open Path2D inputs") then
			return
		end
		if #points == 0 then
			startFace = path.startFace or "front"
		end
		local startPointIndex = 1
		if #points > 0 and #path.points > 0 then
			if mode == "graft" then
				local endpoint = points[#points]
				local startPosition = SafeVec3(path.points[1].position, { x = 0, y = 0, z = 0 })
				local endPosition = SafeVec3(endpoint.position, { x = 0, y = 0, z = 0 })
				endpoint.join = join
				startPointIndex = 2
				for pointIndex = startPointIndex, #path.points do
					points[#points + 1] = GraphPath_CloneTranslatedPoint(path.points[pointIndex], {
						x = endPosition.x - startPosition.x,
						y = endPosition.y - startPosition.y,
						z = endPosition.z - startPosition.z,
					})
				end
			elseif dropDuplicateEndpoints and GraphPath_PointEquals(points[#points], path.points[1]) then
				startPointIndex = 2
			end
		end
		if mode ~= "graft" or #points == 0 then
			for pointIndex = startPointIndex, #path.points do
				points[#points + 1] = GraphPath_ClonePoint(path.points[pointIndex])
			end
		end
	end
	GraphPath_SetOutputs(ctx, behavior, GraphPath_Build(points, closed, startFace))
end

function G_ReversePath(ctx, behavior)
	local path = GraphPath_ClonePath(ctx.getInput(behavior, "path", nil))
	if path == nil then
		return
	end
	local points = {}
	for i = #path.points, 1, -1 do
		points[#points + 1] = GraphPath_ClonePoint(path.points[i])
	end
	GraphPath_SetOutputs(ctx, behavior, GraphPath_Build(points, path.closed, path.startFace))
end

function G_SetPathJoint(ctx, behavior)
	local path = GraphPath_ClonePath(ctx.getInput(behavior, "path", nil))
	if path == nil then
		return
	end
	local index = GetFloatInput(ctx, behavior, "index", -1) // 1
	local join = GetStringInput(ctx, behavior, "join", "corner")
	GraphPath_ForEachPoint(path, index, function(point)
		point.join = GraphPath_NormalizeJoin(join)
	end)
	GraphPath_SetOutputs(ctx, behavior, path)
end

function G_TransformPath2D(ctx, behavior)
	local path = GraphPath_ClonePath(ctx.getInput(behavior, "path", nil))
	if path == nil then
		return
	end
	local offset = GetVec2Input(ctx, behavior, "position", { x = 0, y = 0 })
	local pivot = GetVec2Input(ctx, behavior, "pivot", { x = 0, y = 0 })
	local scale = GraphPath_Scale2Input(ctx, behavior, "scale", { x = 1, y = 1 })
	local angle = ((GetFloatInput(ctx, behavior, "angleDeg", 0)) * (3.141592653589793 / 180))
	local cosA = cos(angle)
	local sinA = sin(angle)
	for i = 1, #path.points do
		local point = path.points[i]
		local localX = (point.position.x - pivot.x) * scale.x
		local localY = (point.position.y - pivot.y) * scale.y
		point.position.x = pivot.x + offset.x + cosA * localX - sinA * localY
		point.position.y = pivot.y + offset.y + sinA * localX + cosA * localY
	end
	GraphPath_SetOutputs(ctx, behavior, GraphPath_Build(path.points, path.closed, path.startFace))
end

function G_ResamplePath(ctx, behavior)
	local path = GraphPath_ClonePath(ctx.getInput(behavior, "path", nil))
	if path == nil then
		return
	end
	local count = GraphPath_CountInput(ctx, behavior, "count", 16)
	local startU = GetFloatInput(ctx, behavior, "startU", 0)
	local endU = GetFloatInput(ctx, behavior, "endU", 1)
	local includeEnd = GetBoolInput(ctx, behavior, "includeEnd", true)
	local samples = {}
	local points = {}
	local positions = {}
	local tangents = {}
	local normals = {}
	local denom = includeEnd and max(count - 1, 1) or max(count, 1)
	for i = 1, count do
		local t = count <= 1 and 0 or (i - 1) / denom
		local sample = GraphPath_SampleAt(path, (startU + (endU - startU) * t))
		samples[i] = sample
		points[i] = GraphPath_ClonePoint({ position = sample.position })
		positions[i] = CopyVec2(sample.position)
		tangents[i] = CopyVec2(sample.tangent)
		normals[i] = CopyVec2(sample.normal)
	end
	ctx.setOutput(behavior, "sampleCount", #samples)
	GraphPath_SetStreamOutput(ctx, behavior, "samples", samples)
	GraphPath_SetStreamOutput(ctx, behavior, "points", points)
	GraphPath_SetStreamOutput(ctx, behavior, "positions", positions)
	GraphPath_SetStreamOutput(ctx, behavior, "tangents", tangents)
	GraphPath_SetStreamOutput(ctx, behavior, "normals", normals)
end

function G_PointAlongPath(ctx, behavior)
	local path = ctx.getInput(behavior, "path", nil)
	if not SATISFIED(GraphPath_IsPath(path), "PointAlongPath requires a Path2D") then
		return
	end
	local sample = GraphPath_SampleAt(path, GetFloatInput(ctx, behavior, "x", 0))
	ctx.setOutput(behavior, "point", SafeVec3(sample.position, { x = 0, y = 0, z = 0 }))
end

function G_PathInfo(ctx, behavior)
	local path = ctx.getInput(behavior, "path", nil)
	if not SATISFIED(GraphPath_IsPath(path), "PathInfo requires a Path2D") then
		return
	end
	ctx.setOutput(behavior, "pointCount", path.pointCount or 0)
	ctx.setOutput(behavior, "segmentCount", path.segmentCount or 0)
	ctx.setOutput(behavior, "length", path.length or 0)
end

function G_SubPath(ctx, behavior)
	local path = ctx.getInput(behavior, "path", nil)
	if not SATISFIED(GraphPath_IsPath(path), "SubPath requires a Path2D") then
		return
	end

	local totalLength = max(0, SafeFloat(path.length, 0))
	local firstPoint = path.points[1]
	if totalLength <= 0 or #(path.segments or {}) == 0 then
		GraphPath_SetOutputs(
			ctx,
			behavior,
			GraphPath_Build(
				{ GraphPath_ClonePoint(firstPoint or { position = { x = 0, y = 0, z = 0 } }) },
				false,
				path.startFace
			)
		)
		return
	end

	local startU = GetFloatInput(ctx, behavior, "start", 0)
	local requestedLength = max(0, GetFloatInput(ctx, behavior, "length", 0))
	local startDistance = path.closed and ((startU % 1) * totalLength)
		or ((startU < 0 and 0 or (startU > 1 and 1 or startU)) * totalLength)
	local segmentLength = requestedLength
	if path.closed then
		segmentLength = min(segmentLength, totalLength)
	else
		segmentLength = min(segmentLength, max(0, totalLength - startDistance))
	end

	local startSample = GraphPath_SampleAtDistance(path, startDistance)
	local points = {}
	if segmentLength <= 0 then
		points[1] = GraphPath_PointFromSample(startSample)
	else
		local endDistance = startDistance + segmentLength
		if path.closed and endDistance > totalLength then
			GraphPath_AddSubPathInterval(path, points, startDistance, totalLength, true)
			GraphPath_AddSubPathInterval(path, points, 0, endDistance - totalLength, false)
		else
			GraphPath_AddSubPathInterval(path, points, startDistance, endDistance, true)
		end
	end

	GraphPath_SetOutputs(ctx, behavior, GraphPath_Build(points, false, startSample.face))
end

function GraphPath_Position3(point)
	local position = SafeVec3(point and point.position, { x = 0, y = 0, z = 0 })
	return {
		x = position.x,
		y = position.y,
		z = position.z,
	}
end

function GraphPath_NewLinePrimitive(behavior, params, materialId, tone, key, startPoint, endPoint)
	return {
		id = behavior.id .. ":line:" .. tostring(key),
		source = params,
		type = "line",
		materialId = materialId,
		lineStart = GraphPath_Position3(startPoint),
		lineEnd = GraphPath_Position3(endPoint),
		tone = tone,
	}
end

function GraphPath_NewPointPrimitive(behavior, params, materialId, tone, fill, key, point, radius)
	return {
		id = behavior.id .. ":point:" .. tostring(key),
		source = params,
		type = "circle",
		materialId = materialId,
		position = GraphPath_Position3(point),
		radius = radius,
		tone = tone,
		fill = fill,
	}
end

function G_Path2DToPrimitives(ctx, behavior)
	local params = behavior.params or {}
	local path = ctx.getInput(behavior, "path", params.path)
	if not SATISFIED(GraphPath_IsPath(path), "Path2DToPrimitives requires a Path2D") then
		return
	end

	local materialId = GraphEntity_GetStringInput(ctx, behavior, "materialId", params.materialId)
	local tone = GetFloatInput(ctx, behavior, "tone", params.tone or 0)
	local emitLines = GetBoolInput(ctx, behavior, "emitLines", params.emitLines ~= false)
	local emitPoints = GetBoolInput(ctx, behavior, "emitPoints", params.emitPoints == true)
	local pointRadius = max(0, GetFloatInput(ctx, behavior, "pointRadius", params.pointRadius or 2))
	local closePath = GetBoolInput(ctx, behavior, "closed", params.closed == true)
	local lines = {}
	local points = {}

	if emitLines then
		for i = 1, #(path.segments or {}) do
			local segment = path.segments[i]
			local startPoint = path.points[(segment.startIndex or 0) + 1]
			local endPoint = path.points[(segment.endIndex or 0) + 1]
			if startPoint ~= nil and endPoint ~= nil then
				local key = segment.index or (i - 1)
				lines[#lines + 1] = {
					key = key,
					value = GraphPath_NewLinePrimitive(behavior, params, materialId, tone, key, startPoint, endPoint),
				}
			end
		end
		if
			closePath
			and not path.closed
			and #path.points >= 2
			and not GraphPath_PointEquals(path.points[1], path.points[#path.points])
		then
			local key = "close"
			lines[#lines + 1] = {
				key = key,
				value = GraphPath_NewLinePrimitive(
					behavior,
					params,
					materialId,
					tone,
					key,
					path.points[#path.points],
					path.points[1]
				),
			}
		end
	end

	if emitPoints and pointRadius > 0 then
		local fill = GraphFill_Flat(materialId, tone)
		for i = 1, #path.points do
			local key = (path.points[i].index ~= nil) and path.points[i].index or (i - 1)
			points[#points + 1] = {
				key = key,
				value = GraphPath_NewPointPrimitive(
					behavior,
					params,
					materialId,
					tone,
					fill,
					key,
					path.points[i],
					pointRadius
				),
			}
		end
	end

	ctx.setOutput(behavior, "lines", DemoGraph_NewStream(behavior, "lines", lines))
	ctx.setOutput(behavior, "points", DemoGraph_NewStream(behavior, "points", points))
end

function GraphPath_NormalizePlacementMode(value)
	value = SafeString(value, "index")
	if value == "layout" then
		return value
	end
	return "index"
end

function GraphPath_ObjectLayoutCoord(frameObject, component)
	if type(frameObject) ~= "table" then
		return 0
	end
	if component == "y" then
		if frameObject.layoutY ~= nil then
			return SafeFloat(frameObject.layoutY)
		end
		local origin = Demo_FrameObjectOrigin(frameObject)
		return origin ~= nil and SafeFloat(origin.y) or 0
	end
	if frameObject.layoutX ~= nil then
		return SafeFloat(frameObject.layoutX)
	end
	if frameObject.glyphTextX ~= nil then
		return SafeFloat(frameObject.glyphTextX)
	end
	local origin = Demo_FrameObjectOrigin(frameObject)
	return origin ~= nil and SafeFloat(origin.x) or 0
end

function GraphPath_AddPlacementMetadata(frameObject, sample, index, along, across)
	frameObject.pathU = sample.u
	frameObject.pathDistance = sample.distance
	frameObject.pathSegmentIndex = sample.segmentIndex
	frameObject.pathSegmentT = sample.segmentT
	frameObject.pathFace = sample.face
	frameObject.pathPlacementIndex = index
	local instance = frameObject.instance
	if instance ~= nil then
		instance.pathU = sample.u
		instance.pathDistance = sample.distance
		instance.pathSegmentIndex = sample.segmentIndex
		instance.pathSegmentT = sample.segmentT
		instance.pathFace = sample.face
		instance.pathPlacementIndex = index
	end
	AddNamedField(frameObject, "pathU", sample.u)
	AddNamedField(frameObject, "pathDistance", sample.distance)
	AddNamedField(frameObject, "pathSegmentIndex", sample.segmentIndex)
	AddNamedField(frameObject, "pathSegmentT", sample.segmentT)
	AddNamedField(frameObject, "pathFace", sample.face)
	AddNamedField(frameObject, "pathPlacementIndex", index)
	AddNamedField(frameObject, "pathAlong", along)
	AddNamedField(frameObject, "pathAcross", across)
end

function GraphPath_PlaceObjectOnSample(frameObject, sample, angleRad, across, index, along)
	local clone = Demo_CloneFrameSceneObject(frameObject, frameObject.id)
	local origin = Demo_FrameObjectOrigin(frameObject) or { x = 0, y = 0, z = 0 }
	Demo_SetFrameSceneObjectOrigin(clone, {
		x = sample.position.x + sample.normal.x * across,
		y = sample.position.y + sample.normal.y * across,
		z = SafeFloat(origin.z),
	})
	if angleRad ~= 0 then
		Demo_ApplyFrameSceneObjectRotationFrom(clone, clone, { x = 0, y = 0, z = angleRad })
	end
	GraphPath_AddPlacementMetadata(clone, sample, index, along, across)
	return clone
end

function G_PathPlaceObjects(ctx, behavior)
	local path = ctx.getInput(behavior, "path", nil)
	if not SATISFIED(GraphPath_IsPath(path), "PathPlaceObjects requires a Path2D") then
		return
	end
	local objects = ObjectInputToStream(behavior, "objectsOut", ctx.getInput(behavior, "objects", nil))
	if not SATISFIED(objects ~= nil, "PathPlaceObjects requires objects") then
		return
	end

	local mode = GraphPath_NormalizePlacementMode(GetStringInput(ctx, behavior, "mode", "index"))
	local startU = GetFloatInput(ctx, behavior, "startU", 0)
	local endU = GetFloatInput(ctx, behavior, "endU", 1)
	local offsetAlong = GetFloatInput(ctx, behavior, "offsetAlong", 0)
	local offsetAcross = GetFloatInput(ctx, behavior, "offsetAcross", 0)
	local alignTangent = GetBoolInput(ctx, behavior, "alignTangent", true)
	local angleOffsetRad = ((GetFloatInput(ctx, behavior, "angleOffsetDeg", 0)) * (3.141592653589793 / 180))
	local pathLength = max(0, SafeFloat(path.length, 0))
	local offsetU = pathLength > 0 and offsetAlong / pathLength or 0
	local itemCount = #objects.items
	local placedItems = {}

	for i = 1, itemCount do
		local item = objects.items[i]
		local frameObject = item.value
		if not SATISFIED(DemoGraph_IsFrameObject(frameObject), "PathPlaceObjects requires frame objects") then
			return
		end
		local sampleU = startU
		local along = 0
		local across = offsetAcross
		if mode == "layout" then
			along = GraphPath_ObjectLayoutCoord(frameObject, "x") + offsetAlong
			across = GraphPath_ObjectLayoutCoord(frameObject, "y") + offsetAcross
			sampleU = startU + (pathLength > 0 and along / pathLength or 0)
		else
			local t = itemCount > 1 and (i - 1) / (itemCount - 1) or 0
			sampleU = (startU + (endU - startU) * t) + offsetU
			along = pathLength * sampleU
		end
		local sample = GraphPath_SampleAt(path, sampleU)
		local angleRad = angleOffsetRad
		if alignTangent then
			angleRad = angleRad + atan2(sample.tangent.y, sample.tangent.x)
		end
		placedItems[#placedItems + 1] = {
			key = item.key,
			value = GraphPath_PlaceObjectOnSample(frameObject, sample, angleRad, across, i - 1, along),
		}
	end

	ctx.setOutput(behavior, "objectsOut", DemoGraph_NewStreamWithDomain(objects.domain, placedItems))
	ctx.setOutput(behavior, "count", #placedItems)
end

function G_SinePath(ctx, behavior)
	local params = behavior.params or {}
	local count = GraphPath_CountInput(ctx, behavior, "count", 32)
	local origin = GetVec2Input(ctx, behavior, "origin", { x = 0, y = 0 })
	local xStep = GetFloatInput(ctx, behavior, "xStep", 4)
	local amplitude = GetFloatInput(ctx, behavior, "amplitude", 20)
	local cycles = GetFloatInput(ctx, behavior, "cycles", 1)
	local phase = GetFloatInput(ctx, behavior, "phase", 0)
	local join = GetStringInput(ctx, behavior, "join", "corner")
	local closed = GetBoolInput(ctx, behavior, "closed", false)
	local startFace = GetStringInput(ctx, behavior, "startFace", params.startFace or "front")
	local points = {}
	for i = 1, count do
		local u = count > 1 and (i - 1) / (count - 1) or 0
		points[i] = {
			position = {
				x = origin.x + xStep * (i - 1),
				y = origin.y + sin((u * cycles + phase) * 6.283185307179586) * amplitude,
			},
			join = join,
		}
	end
	GraphPath_SetOutputs(ctx, behavior, GraphPath_Build(points, closed, startFace))
end

function G_ArcSegmentPath(ctx, behavior)
	local params = behavior.params or {}
	local count = GraphPath_CountInput(ctx, behavior, "count", 24)
	local origin = GetVec2Input(ctx, behavior, "origin", { x = 0, y = 0 })
	local radius = max(0, GetFloatInput(ctx, behavior, "radius", 16))
	local startAngleDeg = GetFloatInput(ctx, behavior, "startAngleDeg", 0)
	local spanAngleDeg = GetFloatInput(ctx, behavior, "spanAngleDeg", 90)
	local startAngle = (startAngleDeg * (3.141592653589793 / 180))
	local closed = abs(spanAngleDeg) >= 360
	if closed then
		count = max(count, 3)
	end
	local spanAngle = closed and (spanAngleDeg < 0 and -6.283185307179586 or 6.283185307179586)
		or (spanAngleDeg * (3.141592653589793 / 180))
	local join = GetStringInput(ctx, behavior, "join", "corner")
	local startFace = GetStringInput(ctx, behavior, "startFace", params.startFace or "front")
	local points = {}
	for i = 1, count do
		local u = closed and ((i - 1) / max(count, 1)) or (count > 1 and (i - 1) / (count - 1) or 0)
		local angle = startAngle + spanAngle * u
		points[i] = {
			position = {
				x = origin.x + cos(angle) * radius,
				y = origin.y + sin(angle) * radius,
			},
			join = join,
		}
	end
	GraphPath_SetOutputs(ctx, behavior, GraphPath_Build(points, closed, startFace))
end

function G_GetProperty(ctx, behavior)
	local objects = ctx.getInput(behavior, "objects", nil)
	local propertyBinding =
		ctx.getInput(behavior, "targetProperty", ctx.getBehaviorParam(behavior, "targetProperty", nil))
	if not SATISFIED(DemoGraph_IsStream(objects), "GetProperty requires an object stream") then
		return
	end
	if not SATISFIED(IsPropertyRef(propertyBinding), "GetProperty requires a target property") then
		return
	end

	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapStream(behavior, "value", objects, function(frameObject)
			return ctx.getFrameObjectProperty(frameObject, propertyBinding)
		end)
	)
end

local function ArrayEmitter3D_Emit(ctx, behavior, sceneRuntime)
	local sourceObject = ctx.getInput(behavior, "source", nil)
	if sourceObject == nil then
		return nil
	end
	local sourceObjectId = sourceObject.id

	local stride = GetVec3Input(ctx, behavior, "stride", { x = 0, y = 0, z = 0 })
	local countParam = GetVec3Input(ctx, behavior, "count", { x = 1, y = 1, z = 1 })
	local count = {
		x = max(1, countParam.x // 1),
		y = max(1, countParam.y // 1),
		z = max(1, countParam.z // 1),
	}
	local total = count.x * count.y * count.z
	local shell = GetBoolInput(ctx, behavior, "shell", false)
	local items = {}

	local index = 0
	for z = 0, count.z - 1 do
		local zOnSurface = (z == 0 or z == count.z - 1)
		for y = 0, count.y - 1 do
			local yOnSurface = (y == 0 or y == count.y - 1)
			for x = 0, count.x - 1 do
				local isOnSurface = (x == 0 or x == count.x - 1) or yOnSurface or zOnSurface
				if not shell or isOnSurface then
					local clone = ctx.cloneFrameSceneObject(
						sourceObject,
						behavior.id .. ":" .. sceneRuntime.id .. ":" .. tostring(index)
					)
					clone.visible = true
					local normIndex = total > 1 and index / (total - 1) or 0
					local normIndex3 = {
						x = count.x > 1 and x / (count.x - 1) or 0,
						y = count.y > 1 and y / (count.y - 1) or 0,
						z = count.z > 1 and z / (count.z - 1) or 0,
					}
					clone.instance = {
						sourceObjectId = sourceObjectId,
						emitterBehaviorId = behavior.id,
						instanceId = index,
						instanceKey = behavior.id .. ":" .. sceneRuntime.id .. ":" .. tostring(index),
						index = index,
						index3 = { x = x, y = y, z = z },
						normIndex = normIndex,
						normIndex3 = normIndex3,
						fields = {},
					}
					DemoCustom_OffsetFrameObject(clone, { x = x * stride.x, y = y * stride.y, z = z * stride.z })
					items[#items + 1] = {
						key = clone.instance.instanceKey,
						value = clone,
					}
				end
				index = index + 1
			end
		end
	end

	return items
end

function G_ArrayEmitter3D(ctx, behavior, frameScene, sceneRuntime, pass)
	local items = ArrayEmitter3D_Emit(ctx, behavior, sceneRuntime)
	if items ~= nil then
		DemoGraph_SetInstanceMetadataOutputs(
			ctx,
			behavior,
			DemoGraph_NewStream(behavior, "instances", items),
			{ "index", "index3", "normIndex", "normIndex3" }
		)
	end
end

local function CircularEmitter_Emit(ctx, behavior, sceneRuntime)
	local sourceObject = ctx.getInput(behavior, "source", nil)
	if sourceObject == nil then
		return {}
	end
	local sourceObjectId = sourceObject.id

	local radius = SafeFloat(ctx.getInput(behavior, "radius", ctx.getBehaviorParam(behavior, "radius")), 20)
	local phase = SafeFloat(ctx.getInput(behavior, "phase", ctx.getBehaviorParam(behavior, "phase")), 0)
	local count = max(1, SafeFloat(ctx.getInput(behavior, "count", ctx.getBehaviorParam(behavior, "count")), 5) // 1)

	local angle = phase
	local angleStep = (2 * 3.141592653589793 / count)
	local emittedItems = {}
	for i = 0, count - 1 do
		local clone =
			ctx.cloneFrameSceneObject(sourceObject, behavior.id .. ":" .. sceneRuntime.id .. ":" .. tostring(i))
		clone.visible = true
		local normIndex = count > 1 and i / (count - 1) or 0
		clone.instance = {
			sourceObjectId = sourceObjectId,
			emitterBehaviorId = behavior.id,
			instanceId = i,
			instanceKey = behavior.id .. ":" .. sceneRuntime.id .. ":" .. tostring(i),
			index = i,
			normIndex = normIndex,
			fields = {},
		}
		DemoCustom_OffsetFrameObject(
			clone, --
			{
				x = radius * cos(angle), --
				y = radius * sin(angle),
				z = 0,
			}
		)
		emittedItems[#emittedItems + 1] = {
			key = clone.instance.instanceKey,
			value = clone,
		}
		angle = angle + angleStep
	end

	return emittedItems
end

function G_CircularEmitter(ctx, behavior, frameScene, sceneRuntime, pass)
	DemoGraph_SetInstanceMetadataOutputs(
		ctx,
		behavior,
		DemoGraph_NewStream(behavior, "instances", CircularEmitter_Emit(ctx, behavior, sceneRuntime)),
		{ "index", "normIndex" }
	)
end

local function BoxEmitter3D_Emit(ctx, behavior, sceneRuntime, pass)
	local sourceObject = ctx.getInput(behavior, "source", nil)
	if sourceObject == nil then
		return {}
	end

	local boundsObject = ctx.getInput(behavior, "bounds", sourceObject) or sourceObject
	local bounds = ctx.getFrameObjectBounds(boundsObject)
	if bounds == nil then
		return {}
	end

	local countParam = GetVec3Input(ctx, behavior, "count", { x = 1, y = 1, z = 1 })
	local count = {
		x = max(1, countParam.x // 1),
		y = max(1, countParam.y // 1),
		z = max(1, countParam.z // 1),
	}
	local total = count.x * count.y * count.z
	local inheritBoundsRotation = GetBoolInput(ctx, behavior, "inheritBoundsRotation", false)
	local shell = GetBoolInput(ctx, behavior, "shell", false)
	local sourceObjectId = sourceObject.id
	local boundsObjectId = boundsObject.id
	local items = {}

	local index = 0
	for z = 0, count.z - 1 do
		local uz = count.z > 1 and z / (count.z - 1) or 0.5
		for y = 0, count.y - 1 do
			local uy = count.y > 1 and y / (count.y - 1) or 0.5
			for x = 0, count.x - 1 do
				local ux = count.x > 1 and x / (count.x - 1) or 0.5
				local isOnSurface = (x == 0 or x == count.x - 1)
					or (y == 0 or y == count.y - 1)
					or (z == 0 or z == count.z - 1)
				if not shell or isOnSurface then
					local key = behavior.id .. ":" .. sceneRuntime.id .. ":" .. tostring(index)
					local clone = ctx.cloneFrameSceneObject(sourceObject, key)
					local normIndex = total > 1 and index / (total - 1) or 0
					local normIndex3 = {
						x = count.x > 1 and x / (count.x - 1) or 0,
						y = count.y > 1 and y / (count.y - 1) or 0,
						z = count.z > 1 and z / (count.z - 1) or 0,
					}
					local worldPosition = ctx.transformFrameSceneObjectPoint(boundsObject, {
						x = (bounds.min.x + (bounds.max.x - bounds.min.x) * ux),
						y = (bounds.min.y + (bounds.max.y - bounds.min.y) * uy),
						z = (bounds.min.z + (bounds.max.z - bounds.min.z) * uz),
					})
					clone.visible = true
					clone.instance = {
						sourceObjectId = sourceObjectId,
						boundsObjectId = boundsObjectId,
						emitterBehaviorId = behavior.id,
						instanceId = index,
						instanceKey = key,
						index = index,
						index3 = { x = x, y = y, z = z },
						normIndex = normIndex,
						normIndex3 = normIndex3,
						fields = {},
					}
					ctx.setFrameSceneObjectOrigin(clone, worldPosition)
					if inheritBoundsRotation then
						ctx.applyFrameSceneObjectRotationFrom(clone, boundsObject)
					end
					items[#items + 1] = {
						key = clone.instance.instanceKey,
						value = clone,
					}
				end
				index = index + 1
			end
		end
	end

	return items
end

function G_BoxEmitter3D(ctx, behavior, frameScene, sceneRuntime, pass)
	DemoGraph_SetInstanceMetadataOutputs(
		ctx,
		behavior,
		DemoGraph_NewStream(behavior, "instances", BoxEmitter3D_Emit(ctx, behavior, sceneRuntime, pass)),
		{ "index", "index3", "normIndex", "normIndex3" }
	)
end

-- takes object(s) centroid(s) and writes them to a named field.
-- the named field can be a different object than source; the idea is to be able to access
-- the centroid from other targets.

-- in particular you may wish to use CameraLookAt on a specific instance centroid
-- so you can't just specify a target object. You instead use
-- * Centroid on the selected item, and write the centroid to a named field on some other object that's actually accessible
-- * MapFieldToProperty to apply the written value to the cameralookat target position field.
-- * CameraLookAt

function G_Centroid(ctx, behavior, frameScene, sceneRuntime)
	local fallbackObjectId = ctx.getInput(behavior, "targetId", ctx.getBehaviorParam(behavior, "targetId"))
	local object = ctx.getInput(behavior, "object", fallbackObjectId)
	if DemoGraph_IsStream(object) then
		ctx.setOutput(
			behavior,
			"position",
			DemoGraph_MapStream(behavior, "position", object, function(frameObject)
				local centroid = Demo_GetFrameSceneObjectCentroid(frameObject)
				SATISFIED(centroid ~= nil, "Centroid stream object has no centroid")
				return centroid
			end)
		)
		return
	else
		TFASSERT(DemoGraph_IsFrameObject(object), "Centroid expects a frame object or stream")
	end

	local centroid = Demo_GetFrameSceneObjectCentroid(object)
	if not SATISFIED(centroid ~= nil, "Centroid object has no centroid") then
		return
	end
	ctx.setOutput(behavior, "position", centroid)
	return
	-- end

	-- if not SATISFIED(IsNonEmptyString(object), "Centroid requires an object") then
	-- 	return
	-- end
	-- local centroid = ctx.getFrameSceneObjectCentroid(sceneRuntime.id, object)
	-- if not SATISFIED(centroid ~= nil, "Centroid object does not exist") then
	-- 	return
	-- end
	-- ctx.setOutput(behavior, "position", centroid)
end

-- function Behavior_Centroid(ctx, behavior, sceneRuntime, pass, frameScene)
-- 	local targetId = ctx.getBehaviorParam(behavior, "targetId")
-- 	if IsNullOrEmptyString(targetId) then
-- 		return
-- 	end
-- 	local targetInstanceKeyFieldName = ctx.getBehaviorParam(behavior, "targetInstanceKeyFieldName")
-- 	local destTargetId = ctx.getBehaviorParam(behavior, "destTargetId") or targetId
-- 	local destFieldName = ctx.getBehaviorParam(behavior, "destFieldName")
-- 	if IsNullOrEmptyString(destFieldName) then
-- 		return
-- 	end
-- 	--#if defined(EDITOR_FEATURES)
-- 	local showDebugInfo = SafeBool(ctx.getBehaviorParam(behavior, "showDebugInfo"))
-- 	--#endif -- EDITOR_FEATURES

-- 	-- collect centroids
-- 	local centroids = {}
-- 	ForEachTargetObject(frameScene, targetId, function(frameObject, target)
-- 		local centroid = Demo_GetFrameSceneObjectCentroid(frameObject)
-- 		if centroid ~= nil then
-- 			table.insert(centroids, centroid)
-- 		end
-- 	end)
-- 	local centroidCount = #centroids
-- 	if centroidCount == 0 then
-- 		return
-- 	end

-- 	-- apply them to a named field on dest target.
-- 	-- if the number of objects in dest is different than that of source, the index wraps.
-- 	local capture = {
-- 		destIndex = 1,
-- 	}
-- 	ForEachTargetObject(frameScene, destTargetId, function(frameObject, target)
-- 		-- get the instance key of dest object, based on targetInstanceKeyFieldName
-- 		local instanceKey = targetInstanceKeyFieldName -- TODO: this is wrong; need to get the instance key from the field on the dest object, not just use the field name as the key.
-- 		if not Demo_MatchesInstanceKey(frameObject, instanceKey) then
-- 			return
-- 		end
-- 		local destCentroidValue = centroids[capture.destIndex]
-- 		capture.destIndex = capture.destIndex + 1
-- 		if capture.destIndex > centroidCount then
-- 			capture.destIndex = 1
-- 		end
-- 		AddNamedField(frameObject, destFieldName, destCentroidValue)
-- 		--#if defined(EDITOR_FEATURES)
-- 		if showDebugInfo then
-- 			DemoCustom_AddHudLine(
-- 				string.format(
-- 					"%s: %s=%s",
-- 					tostring(Demo_GetInstanceKey(frameObject)),
-- 					destFieldName,
-- 					Vec3ToString(destCentroidValue)
-- 				)
-- 			)
-- 		end
-- 		--#endif -- EDITOR_FEATURES
-- 	end)
-- 	if capture.destIndex == 1 then
-- 		DemoCustom_AddHudLine("centroid: no dest target...")
-- 		DemoCustom_AddHudLine("target id = " .. tostring(destTargetId))
-- 	end
-- end

-- an euler spring model that can be applied to scalar vec3 or floats (positions mostly)
-- simple damped harmonic oscillator model.
-- params:
--   targetValue: undampened vec3 or float value which the spring will try to reach
--
--   mass: mass (m) in kg, higher values = more inertia, lower values = less inertia
--   springConstant: spring constant (k) in N/m, higher values = stiffer spring, lower values = softer spring
--   dampingConstant: damping constant (c) in Ns/m, higher values = more damping, lower values = less damping
-- references:
-- https://en.wikipedia.org/wiki/Harmonic_oscillator#Damped_harmonic_oscillator
-- there are step-based (integrated) forms, and analytic (stateless) forms.

-- mass, stiffness, damping are 3 coefficients but the model only has 2 degrees of freedom,
-- so technically they're not independent and multiple configurations result in the same
-- behavior.
-- that's not necessarily a problem, but having more params than are necessary is a smell,
-- especially considering they're not 100% intuitive to begin with. can we find a param
-- config that feels better for dialing in behavior?
--   response time (seconds, approximate time to reach target within some small %)
--   damping ratio (0..1 fraction of critical damping. 0 = no damping, 1 = critical damping, >1 = overdamping)

-- for critically-damped spring starting at rest, normalized remaining error is:
-- e(t) = (1 + wt)e^(-wt)
-- 95% settled, remaining error at that time should be 5%
-- (1 + wt)e^(-wt) = 0.05
-- let x = wt
-- (1 + x)e^(-x) = 0.05
-- positive solution is x = 4.7438645

-- input state is just 2 values:
-- value: current value of the spring
-- velocity: current velocity of the spring
-- returns output state: value, velocity
function updateSpring(value, velocity, target, responseTime, dampingRatio, dt)
	TFASSERT(type(value) == "number", "value must be a number")
	TFASSERT(type(velocity) == "number", "velocity must be a number")
	TFASSERT(type(target) == "number", "target must be a number")
	TFASSERT(type(responseTime) == "number", "responseTime must be a number")
	TFASSERT(type(dampingRatio) == "number", "dampingRatio must be a number")
	TFASSERT(type(dt) == "number", "dt must be a number")
	if dt <= 0 then
		return value, velocity
	end

	if responseTime <= 0 then
		return target, velocity * 0
	end

	local zeta = (dampingRatio < 0 and 0 or (dampingRatio > 1 and 1 or dampingRatio))
	local omega = 4.7438645 / responseTime

	local offset = value - target

	local offsetCoefficient
	local velocityCoefficient
	local offsetToVelocityCoefficient
	local velocityToVelocityCoefficient

	if 1 - zeta < 0.0001 then
		-- Critically damped.
		local decay = math.exp(-omega * dt)

		offsetCoefficient = decay * (1 + omega * dt)

		velocityCoefficient = decay * dt

		offsetToVelocityCoefficient = decay * (-omega * omega * dt)

		velocityToVelocityCoefficient = decay * (1 - omega * dt)
	else
		-- Underdamped.
		local decayRate = zeta * omega
		local dampedFrequency = omega * math.sqrt(1 - zeta * zeta)

		local phase = dampedFrequency * dt
		local decay = math.exp(-decayRate * dt)

		local cosPhase = math.cos(phase)
		local sinOverFrequency = math.sin(phase) / dampedFrequency

		offsetCoefficient = decay * (cosPhase + decayRate * sinOverFrequency)

		velocityCoefficient = decay * sinOverFrequency

		offsetToVelocityCoefficient = decay * (-omega * omega * sinOverFrequency)

		velocityToVelocityCoefficient = decay * (cosPhase - decayRate * sinOverFrequency)
	end

	local newOffset = offset * offsetCoefficient + velocity * velocityCoefficient

	local newVelocity = offset * offsetToVelocityCoefficient + velocity * velocityToVelocityCoefficient

	return target + newOffset, newVelocity
end

local function AngularSpring_UnwrapTarget(value, target)
	local angleDifference = (target - value + 3.141592653589793) % 6.283185307179586 - 3.141592653589793
	return value + angleDifference
end

local function Spring_HasNumericComponents(value)
	if type(value) == "number" then
		return true
	end
	if type(value) ~= "table" then
		return false
	end
	for _, component in pairs(value) do
		if type(component) == "number" then
			return true
		end
	end
	return false
end

local function Spring_NewState(target)
	if type(target) == "number" then
		return {
			value = target,
			velocity = 0,
		}
	end
	local velocity = {}
	for key, component in pairs(target) do
		if type(component) == "number" then
			velocity[key] = 0
		end
	end
	return {
		value = CloneTable(target),
		velocity = velocity,
	}
end

local function Spring_StateMatchesTarget(instanceState, target)
	if instanceState == nil then
		return false
	end
	if type(target) == "number" then
		return type(instanceState.value) == "number" and type(instanceState.velocity) == "number"
	end
	if type(target) ~= "table" or type(instanceState.value) ~= "table" or type(instanceState.velocity) ~= "table" then
		return false
	end
	for key, component in pairs(target) do
		if type(component) == "number" and type(instanceState.value[key]) ~= "number" then
			return false
		end
	end
	return true
end

local function Spring_UpdateValue(instanceState, target, responseTime, dampingRatio, dt, unwrapTarget)
	if type(target) == "number" then
		local targetValue = unwrapTarget and unwrapTarget(instanceState.value, target) or target
		instanceState.value, instanceState.velocity =
			updateSpring(instanceState.value, instanceState.velocity, targetValue, responseTime, dampingRatio, dt)
		return instanceState.value
	end

	local nextValue = CloneTable(target)
	local componentCount = 0
	for key, component in pairs(target) do
		if type(component) == "number" then
			local currentValue = SafeFloat(instanceState.value[key], component)
			local targetValue = unwrapTarget and unwrapTarget(currentValue, component) or component
			nextValue[key], instanceState.velocity[key] = updateSpring(
				currentValue,
				SafeFloat(instanceState.velocity[key]),
				targetValue,
				responseTime,
				dampingRatio,
				dt
			)
			componentCount = componentCount + 1
		end
	end
	if not SATISFIED(componentCount > 0, "Spring target has no numeric components") then
		return nil
	end
	instanceState.value = nextValue
	return instanceState.value
end

local function Spring_GetScopeState(ctx, behavior)
	local state = behavior.state
	state.graphByScope = state.graphByScope or {}
	local graphScopeKey = ctx.graphScopeKey or "default"
	state.graphByScope[graphScopeKey] = state.graphByScope[graphScopeKey] or { instances = {} }
	return state.graphByScope[graphScopeKey]
end

local function Spring_Evaluate(ctx, behavior, opName, acceptsTarget, unwrapTarget)
	local target = GetVariantInput(ctx, behavior, "target", nil)
	if not SATISFIED(target ~= nil, opName .. " requires a target") then
		return
	end

	local scopeState = Spring_GetScopeState(ctx, behavior)
	local responseTime = max(0.0001, SafeFloat(GetVariantInput(ctx, behavior, "responseTime", 0.5), 0.5))
	local dt = max(0, ctx.t.demoDeltaMillis / 1000)
	local dampingRatio = SafeFloat(GetVariantInput(ctx, behavior, "dampingRatio", 0.5))
	dampingRatio = (dampingRatio < 0 and 0 or (dampingRatio > 1 and 1 or dampingRatio))

	local function updateTarget(targetValue, key, index)
		if not SATISFIED(acceptsTarget(targetValue), opName .. " target has incompatible type") then
			return nil
		end
		local instanceKey = key or index or "__single"
		local instanceState = scopeState.instances[instanceKey]
		if not Spring_StateMatchesTarget(instanceState, targetValue) then
			instanceState = Spring_NewState(targetValue)
			scopeState.instances[instanceKey] = instanceState
		end
		return Spring_UpdateValue(instanceState, targetValue, responseTime, dampingRatio, dt, unwrapTarget)
	end

	if DemoGraph_IsStream(target) then
		ctx.setOutput(behavior, "value", DemoGraph_MapStream(behavior, "value", target, updateTarget))
		return
	end

	ctx.setOutput(behavior, "value", updateTarget(target, "__single"))
end

function G_Spring(ctx, behavior)
	Spring_Evaluate(ctx, behavior, "Spring", Spring_HasNumericComponents, nil)
end

function G_AngularSpring(ctx, behavior)
	Spring_Evaluate(ctx, behavior, "AngularSpring", IsVec3, AngularSpring_UnwrapTarget)
end

function GraphMeshFace_StringOrNil(value)
	value = SafeString(value, nil)
	if value == "" then
		return nil
	end
	return value
end

function GraphMeshFace_CloneStyle(style)
	if type(style) ~= "table" then
		return nil
	end
	local materialId = GraphMeshFace_StringOrNil(style.materialId)
	if materialId == nil then
		return nil
	end
	return {
		materialId = materialId,
		tone = SafeFloat(style.tone, 0),
	}
end

function GraphMeshFace_Clone(face)
	local result = CloneTable(face)
	result.center = Demo_CloneFrameObjectTable(face.center)
	result.normal = Demo_CloneFrameObjectTable(face.normal)
	result.style = GraphMeshFace_CloneStyle(face.style)
	return result
end

function GraphMeshFace_Key(triangle, triangleIndex)
	local faceKey = triangle.faceKey
	if faceKey == nil then
		local faceIndex = triangle.faceIndex
		if faceIndex == nil then
			faceIndex = triangleIndex - 1
		end
		faceKey = tostring(faceIndex)
	end
	return tostring(faceKey)
end

function GraphMeshFace_TriangleInfo(mesh, triangle, triangleIndex)
	local vertices = mesh.vertices or {}
	local v1 = vertices[triangle[1]]
	local v2 = vertices[triangle[2]]
	local v3 = vertices[triangle[3]]
	if v1 == nil or v2 == nil or v3 == nil then
		return nil
	end
	local abx = v2.x - v1.x
	local aby = v2.y - v1.y
	local abz = v2.z - v1.z
	local acx = v3.x - v1.x
	local acy = v3.y - v1.y
	local acz = v3.z - v1.z
	local normalX = aby * acz - abz * acy
	local normalY = abz * acx - abx * acz
	local normalZ = abx * acy - aby * acx
	local weight = sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ)
	if weight <= 0 then
		weight = 1
	end
	local faceKey = GraphMeshFace_Key(triangle, triangleIndex)
	local rootFaceIndex = triangle.rootFaceIndex
	local rootFaceKey = triangle.rootFaceKey ~= nil and tostring(triangle.rootFaceKey)
		or (rootFaceIndex ~= nil and tostring(rootFaceIndex) or nil)
	return {
		faceKey = faceKey,
		triangleIndex = triangleIndex - 1,
		rootFaceIndex = rootFaceIndex,
		rootFaceKey = rootFaceKey,
		centerX = (v1.x + v2.x + v3.x) / 3,
		centerY = (v1.y + v2.y + v3.y) / 3,
		centerZ = (v1.z + v2.z + v3.z) / 3,
		normalX = normalX,
		normalY = normalY,
		normalZ = normalZ,
		weight = weight,
	}
end

function GraphMeshFace_AddTriangle(face, triangleInfo)
	face.triangleCount = face.triangleCount + 1
	face.weight = face.weight + triangleInfo.weight
	face.centerX = face.centerX + triangleInfo.centerX * triangleInfo.weight
	face.centerY = face.centerY + triangleInfo.centerY * triangleInfo.weight
	face.centerZ = face.centerZ + triangleInfo.centerZ * triangleInfo.weight
	face.normalX = face.normalX + triangleInfo.normalX
	face.normalY = face.normalY + triangleInfo.normalY
	face.normalZ = face.normalZ + triangleInfo.normalZ
end

function GraphMeshFace_NewAccumulator(frameObject, sourceObjectKey, triangleInfo)
	return {
		kind = "meshFace",
		sourceObjectId = frameObject.id,
		sourceObjectKey = sourceObjectKey,
		faceKey = triangleInfo.faceKey,
		triangleIndex = triangleInfo.triangleIndex,
		rootFaceIndex = triangleInfo.rootFaceIndex,
		rootFaceKey = triangleInfo.rootFaceKey,
		triangleCount = 0,
		weight = 0,
		centerX = 0,
		centerY = 0,
		centerZ = 0,
		normalX = 0,
		normalY = 0,
		normalZ = 0,
	}
end

function GraphMeshFace_Finalize(face, faceIndex, faceCount)
	local weight = face.weight > 0 and face.weight or 1
	local nx, ny, nz = Normalize3(face.normalX, face.normalY, face.normalZ)
	face.faceIndex = faceIndex
	face.normIndex = faceCount > 1 and faceIndex / (faceCount - 1) or 0
	face.center = {
		x = face.centerX / weight,
		y = face.centerY / weight,
		z = face.centerZ / weight,
	}
	face.normal = {
		x = nx,
		y = ny,
		z = nz,
	}
	face.weight = nil
	face.centerX = nil
	face.centerY = nil
	face.centerZ = nil
	face.normalX = nil
	face.normalY = nil
	face.normalZ = nil
	return face
end

function G_GetMeshFaces(ctx, behavior)
	local objects = ObjectInputToStream(behavior, "object", ctx.getInput(behavior, "object", nil))
	if not SATISFIED(objects ~= nil, "GetMeshFaces requires a mesh object") then
		return
	end

	behavior.state = behavior.state or {}
	behavior.state.meshGeometryCache = behavior.state.meshGeometryCache or {}
	local geometryCache = behavior.state.meshGeometryCache
	local items = {}
	for objectIndex = 1, #objects.items do
		local objectItem = objects.items[objectIndex]
		local frameObject = objectItem.value
		if not SATISFIED(DemoGraph_IsFrameObject(frameObject), "GetMeshFaces requires frame objects") then
			return
		end
		if frameObject.type == "mesh3d" then
			local mesh = Demo_ResolveMeshGeometry(ctx.runtime, frameObject.geometry, geometryCache)
			local triangles = mesh and mesh.triangles or nil
			local triangleCount = #(triangles or {})
			local objectFaces = {}
			local objectFacesByKey = {}
			for triangleIndex = 1, triangleCount do
				local triangleInfo = GraphMeshFace_TriangleInfo(mesh, triangles[triangleIndex], triangleIndex)
				if triangleInfo ~= nil then
					local face = objectFacesByKey[triangleInfo.faceKey]
					if face == nil then
						face = GraphMeshFace_NewAccumulator(frameObject, objectItem.key, triangleInfo)
						objectFacesByKey[triangleInfo.faceKey] = face
						objectFaces[#objectFaces + 1] = face
					end
					GraphMeshFace_AddTriangle(face, triangleInfo)
				end
			end
			local faceCount = #objectFaces
			for faceIndex = 1, faceCount do
				local face = GraphMeshFace_Finalize(objectFaces[faceIndex], faceIndex - 1, faceCount)
				items[#items + 1] = {
					key = tostring(objectItem.key) .. ":face:" .. face.faceKey,
					value = face,
				}
			end
		end
	end

	local faces = DemoGraph_NewStream(behavior, "faces", items)
	ctx.setOutput(behavior, "faces", faces)
	ctx.setOutput(
		behavior,
		"faceIndex",
		DemoGraph_MapStream(behavior, "faceIndex", faces, function(face)
			return face.faceIndex
		end)
	)
	ctx.setOutput(
		behavior,
		"rootFaceIndex",
		DemoGraph_MapStream(behavior, "rootFaceIndex", faces, function(face)
			return face.rootFaceIndex ~= nil and face.rootFaceIndex or -1
		end)
	)
	ctx.setOutput(
		behavior,
		"normIndex",
		DemoGraph_MapStream(behavior, "normIndex", faces, function(face)
			return face.normIndex
		end)
	)
	ctx.setOutput(
		behavior,
		"center",
		DemoGraph_MapStream(behavior, "center", faces, function(face)
			return face.center
		end)
	)
	ctx.setOutput(
		behavior,
		"normal",
		DemoGraph_MapStream(behavior, "normal", faces, function(face)
			return face.normal
		end)
	)
end

function G_SetMeshFaceColor(ctx, behavior)
	local faces = ctx.getInput(behavior, "faces", nil)
	if not SATISFIED(DemoGraph_IsStream(faces), "SetMeshFaceColor requires faces") then
		return
	end
	local params = behavior.params or {}
	local defaultMaterialId = params.materialId or ""
	local materialId = GetVariantInput(ctx, behavior, "materialId", defaultMaterialId)
	local defaultTone = params.tone or 0
	local tone = GetVariantInput(ctx, behavior, "tone", defaultTone)
	ctx.setOutput(
		behavior,
		"facesOut",
		DemoGraph_MapInputs(behavior, "facesOut", { faces, materialId, tone }, function(values)
			local face = GraphMeshFace_Clone(values[1])
			local nextMaterialId = GraphMeshFace_StringOrNil(values[2])
			if nextMaterialId ~= nil then
				face.style = {
					materialId = nextMaterialId,
					tone = SafeFloat(values[3], defaultTone),
				}
			else
				face.style = nil
			end
			return face
		end)
	)
end

function GraphMeshFace_CollectStylesByObjectKey(faces)
	local result = {}
	for i = 1, #faces.items do
		local face = faces.items[i].value
		if type(face) == "table" and face.kind == "meshFace" and face.style ~= nil then
			local objectKey = tostring(face.sourceObjectKey)
			local faceKey = tostring(face.faceKey)
			local styles = result[objectKey]
			if styles == nil then
				styles = {}
				result[objectKey] = styles
			end
			styles[faceKey] = GraphMeshFace_CloneStyle(face.style)
		end
	end
	return result
end

function GraphMeshFace_CloneStyles(styles)
	local result = {}
	for faceKey, style in pairs(styles or {}) do
		result[tostring(faceKey)] = GraphMeshFace_CloneStyle(style)
	end
	return result
end

function G_SetMeshFaces(ctx, behavior)
	local objects = ObjectInputToStream(behavior, "objectsOut", ctx.getInput(behavior, "objects", nil))
	if not SATISFIED(objects ~= nil, "SetMeshFaces requires objects") then
		return
	end
	local faces = ctx.getInput(behavior, "faces", nil)
	if not SATISFIED(DemoGraph_IsStream(faces), "SetMeshFaces requires faces") then
		return
	end

	local stylesByObjectKey = GraphMeshFace_CollectStylesByObjectKey(faces)
	local items = {}
	for i = 1, #objects.items do
		local item = objects.items[i]
		local frameObject = item.value
		if not SATISFIED(DemoGraph_IsFrameObject(frameObject), "SetMeshFaces requires frame objects") then
			return
		end
		if frameObject.type == "mesh3d" then
			frameObject.meshFaceStyles = GraphMeshFace_CloneStyles(stylesByObjectKey[tostring(item.key)])
		end
		items[#items + 1] = {
			key = item.key,
			value = frameObject,
		}
	end
	ctx.setOutput(behavior, "objectsOut", DemoGraph_NewStreamWithDomain(objects.domain, items))
end

-- like SafeString, but doesn't allow empty strings ; returns nil.
function GraphEntity_StringOrNil(value)
	value = SafeString(value, nil)
	if value == "" then
		return nil
	end
	return value
end

function GraphEntity_GetStringInput(ctx, behavior, inputName, defaultValue)
	return GraphEntity_StringOrNil(GetStringInput(ctx, behavior, inputName, defaultValue))
end

function GraphEntity_SetStringParamOutput(ctx, behavior, paramName, outputName)
	local value = GraphEntity_StringOrNil(ctx.getBehaviorParam(behavior, paramName, nil))
	if value ~= nil then
		ctx.setOutput(behavior, outputName, value)
	end
end

function G_MaterialRef(ctx, behavior)
	GraphEntity_SetStringParamOutput(ctx, behavior, "materialId", "materialId")
end

function G_TextureRef(ctx, behavior)
	local textureId = GraphEntity_StringOrNil(ctx.getBehaviorParam(behavior, "textureId", nil))
	if textureId ~= nil then
		ctx.setOutput(behavior, "textureId", textureId)
	end
	GraphTexture_SetDimensionOutputs(ctx, behavior, textureId ~= nil and ctx.textures[textureId] or nil)
end

function G_FontRef(ctx, behavior)
	GraphEntity_SetStringParamOutput(ctx, behavior, "fontId", "fontId")
end

function G_MeshRef(ctx, behavior)
	GraphEntity_SetStringParamOutput(ctx, behavior, "meshId", "meshId")
end

function GraphEntity_PositionDefault(params)
	return SafeVec3(params)
end

function GraphEntity_RotationDefault(params)
	return {
		x = params.rotX or 0,
		y = params.rotY or 0,
		z = params.rotZ or 0,
	}
end

function GraphEntity_ScaleDefault(params)
	return {
		x = params.scaleX or 1,
		y = params.scaleY or 1,
		z = params.scaleZ or 1,
	}
end

function GraphEntity_MeshBounds(mesh)
	if mesh ~= nil and mesh.bounds ~= nil and mesh.bounds.min ~= nil and mesh.bounds.max ~= nil then
		return {
			min = SafeVec3(mesh.bounds.min),
			max = SafeVec3(mesh.bounds.max),
		}
	end
	return nil
end

function GraphEntity_MeshGeometryBounds(ctx, geometry)
	if geometry == nil then
		return nil
	end
	if geometry.type == "asset" then
		return GraphEntity_MeshBounds(ctx.meshes[geometry.meshId])
	end
	if geometry.type == "cube" or geometry.type == "plane" then
		return {
			min = { x = -1, y = geometry.type == "plane" and 0 or -1, z = -1 },
			max = { x = 1, y = geometry.type == "plane" and 0 or 1, z = 1 },
		}
	end
	if geometry.type == "torus" then
		local majorRadius = max(0, SafeFloat(geometry.majorRadius, 1.25))
		local tubeRadius = max(0, SafeFloat(geometry.tubeRadius, 0.38))
		local outerRadius = majorRadius + tubeRadius
		return {
			min = { x = -outerRadius, y = -tubeRadius, z = -outerRadius },
			max = { x = outerRadius, y = tubeRadius, z = outerRadius },
		}
	end
	if geometry.type == "cylinder" then
		local radius1 = max(0, SafeFloat(geometry.radius1, 1))
		local radius2 = max(0, SafeFloat(geometry.radius2, 1))
		local halfHeight = max(0, SafeFloat(geometry.height, 2)) * 0.5
		local radius = max(radius1, radius2)
		return {
			min = { x = -radius, y = -halfHeight, z = -radius },
			max = { x = radius, y = halfHeight, z = radius },
		}
	end
	if geometry.type == "cone" then
		local radius = max(0, SafeFloat(geometry.radius, 1))
		local height = max(0, SafeFloat(geometry.height, 2))
		local halfHeight = height * 0.5
		return {
			min = { x = -radius, y = -halfHeight, z = -radius },
			max = { x = radius, y = halfHeight, z = radius },
		}
	end
	if geometry.type == "geoSphere" then
		local radius = max(0, SafeFloat(geometry.radius, 1.5))
		return {
			min = { x = -radius, y = -radius, z = -radius },
			max = { x = radius, y = radius, z = radius },
		}
	end
	return nil
end

function GraphEntity_Affine2D(ctx, behavior, defaultAnchorX, defaultAnchorY)
	return {
		anchorXNorm = GetFloatInput(ctx, behavior, "anchorXNorm", defaultAnchorX),
		anchorYNorm = GetFloatInput(ctx, behavior, "anchorYNorm", defaultAnchorY),
		angleDeg = GetFloatInput(ctx, behavior, "angleDeg", 0),
		skewX = GetFloatInput(ctx, behavior, "skewX", 0),
		skewY = GetFloatInput(ctx, behavior, "skewY", 0),
	}
end

function GraphEntity_RectStrokeAlignment(value)
	value = SafeString(value, "inside")
	if value == "center" or value == "outside" then
		return value
	end
	return "inside"
end

function GraphEntity_RectCornerRadii(ctx, behavior, params)
	local radius = max(0, GetFloatInput(ctx, behavior, "cornerRadius", params.cornerRadius or 0))
	local topLeft =
		max(0, radius + GetFloatInput(ctx, behavior, "cornerRadiusTopLeft", params.cornerRadiusTopLeft or 0))
	local topRight =
		max(0, radius + GetFloatInput(ctx, behavior, "cornerRadiusTopRight", params.cornerRadiusTopRight or 0))
	local bottomRight =
		max(0, radius + GetFloatInput(ctx, behavior, "cornerRadiusBottomRight", params.cornerRadiusBottomRight or 0))
	local bottomLeft =
		max(0, radius + GetFloatInput(ctx, behavior, "cornerRadiusBottomLeft", params.cornerRadiusBottomLeft or 0))
	if topLeft <= 0 and topRight <= 0 and bottomRight <= 0 and bottomLeft <= 0 then
		return nil
	end
	return {
		topLeft = topLeft,
		topRight = topRight,
		bottomRight = bottomRight,
		bottomLeft = bottomLeft,
	}
end

function GraphEntity_MeasureTextSize(font, text, maxWidth, scrollX, multiline, scaleX, scaleY)
	if Font_GetTextImage == nil then
		return nil
	end
	local image = Font_GetTextImage(font, text, {
		maxWidth = maxWidth,
		scrollX = scrollX,
		multiline = multiline,
	})
	if image == nil then
		return nil
	end
	return {
		x = maxWidth or (max(0, image.width - scrollX) * scaleX),
		y = image.height * scaleY,
	}
end

function GraphEntity_AffineTextPoint(position, size, affine, localX, localY)
	local width = size and size.x or 0
	local height = size and size.y or 0
	local anchorXNorm = affine.anchorXNorm or 0
	local anchorYNorm = affine.anchorYNorm or 0
	local pivotLocalX = width * anchorXNorm
	local pivotLocalY = height * anchorYNorm
	local pivotX = (position.x or 0) + pivotLocalX
	local pivotY = (position.y or 0) + pivotLocalY
	local angle = ((affine.angleDeg or 0) * (3.141592653589793 / 180))
	local cosA = cos(angle)
	local sinA = sin(angle)
	local lx = localX - pivotLocalX
	local ly = localY - pivotLocalY
	local shearedX = lx + (affine.skewX or 0) * ly
	local shearedY = ly + (affine.skewY or 0) * lx
	return {
		x = pivotX + cosA * shearedX - sinA * shearedY,
		y = pivotY + sinA * shearedX + cosA * shearedY,
		z = position.z or 0,
	}
end

local function GraphEntity_BuildMeshObject(ctx, behavior, geometry)
	if geometry == nil or (geometry.type == "asset" and ctx.meshes[geometry.meshId] == nil) then
		return nil
	end

	local params = behavior.params or {}
	return {
		id = behavior.id,
		source = params,
		type = "mesh3d",
		position = GetVec3Input(ctx, behavior, "position", GraphEntity_PositionDefault(params)),
		rotation = GetVec3Input(ctx, behavior, "rotation", GraphEntity_RotationDefault(params)),
		scale = GetVec3Input(ctx, behavior, "scale", GraphEntity_ScaleDefault(params)),
		scaleUniform = GetFloatInput(
			ctx,
			behavior,
			"scaleUniform",
			params.scaleUniform ~= nil and params.scaleUniform or (params.scale ~= nil and params.scale or 1)
		),
		materialId = GraphEntity_GetStringInput(ctx, behavior, "materialId", params.materialId),
		geometry = geometry,
		localBounds = GraphEntity_MeshGeometryBounds(ctx, geometry),
		fill = GetVariantInput(ctx, behavior, "fill", params.fill),
		shading = GraphEntity_GetStringInput(ctx, behavior, "shading", params.shading or "gouraud"),
		receiveFog = GetBoolInput(ctx, behavior, "receiveFog", params.receiveFog ~= false),
		tone = GetFloatInput(ctx, behavior, "tone", params.tone ~= nil and params.tone or 1),
		wireframe = GetBoolInput(ctx, behavior, "wireframe", params.wireframe == true),
		visible = GetBoolInput(ctx, behavior, "visible", params.visible ~= false),
	}
end

function GraphEntity_SetObjectOutput(ctx, behavior, frameObject)
	if frameObject ~= nil then
		ctx.setOutput(behavior, "object", frameObject)
	end
end

function GraphEntity_AppendSceneObjectInput(objects, value)
	if DemoGraph_IsStream(value) then
		for i = 1, #value.items do
			if value.items[i].value ~= nil then
				objects[#objects + 1] = value.items[i].value
			end
		end
	elseif value ~= nil then
		objects[#objects + 1] = value
	end
end

function GraphEntity_GroupViewport(ctx, behavior)
	if not GetBoolInput(ctx, behavior, "clipToViewport", false) then
		return nil
	end
	local position = GetVec2Input(ctx, behavior, "viewportPosition", { x = 0, y = 0 })
	local size = GetSize2Input(ctx, behavior, "viewportSize", { x = 240, y = 136 })
	return {
		x = ((position.x + 0.5) // 1),
		y = ((position.y + 0.5) // 1),
		width = max(0, ((size.x + 0.5) // 1)),
		height = max(0, ((size.y + 0.5) // 1)),
	}
end

function GraphEntity_BorderSpan(ctx, behavior, y, length, materialId, zOrder)
	materialId = GraphEntity_StringOrNil(materialId)
	if materialId == nil or length <= 0 then
		return nil
	end
	return {
		id = behavior.id,
		type = "borderSpan",
		y = y,
		length = length,
		materialId = materialId,
		zOrder = zOrder or 0,
	}
end

function GraphEntity_AppendBorderSpanInput(spans, value)
	if DemoGraph_IsStream(value) then
		for i = 1, #value.items do
			GraphEntity_AppendBorderSpanInput(spans, value.items[i].value)
		end
	elseif value ~= nil then
		if not SATISFIED(value.type == "borderSpan", "ProjectOutput borderSpans requires border span commands") then
			return
		end
		spans[#spans + 1] = value
	end
end

function G_BorderSpan(ctx, behavior)
	local span = GraphEntity_BorderSpan(
		ctx,
		behavior,
		GetFloatInput(ctx, behavior, "y", 0),
		GetFloatInput(ctx, behavior, "length", 136),
		GetStringInput(ctx, behavior, "materialId"),
		GetFloatInput(ctx, behavior, "zOrder", 0)
	)
	if span ~= nil then
		ctx.setOutput(behavior, "span", span)
	end
end

function G_BorderSplit(ctx, behavior)
	local splitY = (
		(GetFloatInput(ctx, behavior, "splitY", 136 * 0.5)) < 0 and 0
		or (
			(GetFloatInput(ctx, behavior, "splitY", 136 * 0.5)) > 136 and 136
			or (GetFloatInput(ctx, behavior, "splitY", 136 * 0.5))
		)
	)
	local zOrder = GetFloatInput(ctx, behavior, "zOrder", 0)
	local top = GraphEntity_BorderSpan(
		ctx,
		behavior, --
		0, -- y
		splitY,
		GetStringInput(ctx, behavior, "topMaterialId"),
		zOrder
	)
	local bottom = GraphEntity_BorderSpan(
		ctx,
		behavior,
		splitY,
		136 - splitY,
		GetStringInput(ctx, behavior, "bottomMaterialId"),
		zOrder
	)
	local items = {}
	if top ~= nil then
		items[#items + 1] = { key = "top", value = top }
	end
	if bottom ~= nil then
		items[#items + 1] = { key = "bottom", value = bottom }
	end
	ctx.setOutput(behavior, "spans", DemoGraph_NewStream(behavior, "spans", items))
end

function G_Mesh3D(ctx, behavior)
	local params = behavior.params or {}
	local meshId = GraphEntity_GetStringInput(ctx, behavior, "meshId", params.meshId)
	if meshId == nil then
		return
	end
	GraphEntity_SetObjectOutput(
		ctx,
		behavior,
		GraphEntity_BuildMeshObject(ctx, behavior, { type = "asset", meshId = meshId })
	)
end

function G_Cube(ctx, behavior)
	GraphEntity_SetObjectOutput(ctx, behavior, GraphEntity_BuildMeshObject(ctx, behavior, { type = "cube" }))
end

function G_Torus(ctx, behavior)
	local geometry = {
		type = "torus",
		majorRadius = GetFloatInput(ctx, behavior, "majorRadius", 1.25),
		tubeRadius = GetFloatInput(ctx, behavior, "tubeRadius", 0.38),
		majorSegments = GetFloatInput(ctx, behavior, "majorSegments", 18),
		tubeSegments = GetFloatInput(ctx, behavior, "tubeSegments", 10),
	}
	GraphEntity_SetObjectOutput(ctx, behavior, GraphEntity_BuildMeshObject(ctx, behavior, geometry))
end

function G_Cylinder(ctx, behavior)
	local geometry = {
		type = "cylinder",
		radius1 = GetFloatInput(ctx, behavior, "radius1", 1),
		radius2 = GetFloatInput(ctx, behavior, "radius2", 1),
		height = GetFloatInput(ctx, behavior, "height", 2),
		segments = GetFloatInput(ctx, behavior, "segments", 18),
	}
	GraphEntity_SetObjectOutput(ctx, behavior, GraphEntity_BuildMeshObject(ctx, behavior, geometry))
end

function G_Cone(ctx, behavior)
	local geometry = {
		type = "cone",
		radius = GetFloatInput(ctx, behavior, "radius", 1),
		height = GetFloatInput(ctx, behavior, "height", 2),
		segments = GetFloatInput(ctx, behavior, "segments", 18),
	}
	GraphEntity_SetObjectOutput(ctx, behavior, GraphEntity_BuildMeshObject(ctx, behavior, geometry))
end

function G_GeoSphere(ctx, behavior)
	local geometry = {
		type = "geoSphere",
		radius = GetFloatInput(ctx, behavior, "radius", 1.5),
		subdivisions = GetFloatInput(ctx, behavior, "subdivisions", 2),
	}
	GraphEntity_SetObjectOutput(ctx, behavior, GraphEntity_BuildMeshObject(ctx, behavior, geometry))
end

function G_Plane(ctx, behavior)
	local geometry = {
		type = "plane",
		subdivisionsX = GetFloatInput(ctx, behavior, "subdivisionsX", 1),
		subdivisionsZ = GetFloatInput(ctx, behavior, "subdivisionsZ", 1),
		doubleSided = GetBoolInput(ctx, behavior, "doubleSided", true),
	}
	GraphEntity_SetObjectOutput(ctx, behavior, GraphEntity_BuildMeshObject(ctx, behavior, geometry))
end

function G_Point2D(ctx, behavior)
	local params = behavior.params or {}
	ctx.setOutput(behavior, "object", {
		id = behavior.id,
		source = params,
		type = "point2D",
		materialId = GraphEntity_GetStringInput(ctx, behavior, "materialId", params.materialId),
		position = GetVec3Input(ctx, behavior, "position", GraphEntity_PositionDefault(params)),
		tone = GetFloatInput(ctx, behavior, "tone", params.tone or 0),
	})
end

function G_Point3D(ctx, behavior)
	local params = behavior.params or {}
	ctx.setOutput(behavior, "object", {
		id = behavior.id,
		source = params,
		type = "point3D",
		materialId = GraphEntity_GetStringInput(ctx, behavior, "materialId", params.materialId),
		position = GetVec3Input(ctx, behavior, "position", GraphEntity_PositionDefault(params)),
		tone = GetFloatInput(ctx, behavior, "tone", params.tone or 0),
	})
end

function G_Rect(ctx, behavior)
	local params = behavior.params or {}
	local materialId = GraphEntity_GetStringInput(ctx, behavior, "materialId", params.materialId)
	local tone = GetFloatInput(ctx, behavior, "tone", params.tone or 0)
	local affine = GraphEntity_Affine2D(ctx, behavior, 0.5, 0.5)
	local fillEnabled = GetBoolInput(ctx, behavior, "fillEnabled", params.fillEnabled ~= false)
	local rect = {
		id = behavior.id,
		source = params,
		type = "rect",
		materialId = materialId,
		position = GetVec3Input(ctx, behavior, "position", GraphEntity_PositionDefault(params)),
		size = GetSize2Input(ctx, behavior, "size", {
			x = params.width or 0,
			y = params.height or 0,
		}),
		tone = tone,
		anchorXNorm = affine.anchorXNorm,
		anchorYNorm = affine.anchorYNorm,
		angleDeg = affine.angleDeg,
		skewX = affine.skewX,
		skewY = affine.skewY,
	}

	if fillEnabled then
		rect.fill = GetVariantInput(ctx, behavior, "fill", params.fill) or GraphFill_Flat(materialId, tone)
	end

	local strokeEnabled = GetBoolInput(ctx, behavior, "strokeEnabled", params.strokeEnabled == true)
	if strokeEnabled then
		local strokeWidth = max(0, GetFloatInput(ctx, behavior, "strokeWidth", params.strokeWidth or 1))
		if strokeWidth > 0 then
			rect.strokeEnabled = true
			rect.strokeWidth = strokeWidth
			rect.strokeAlignment = GraphEntity_RectStrokeAlignment(
				GetStringInput(ctx, behavior, "strokeAlignment", params.strokeAlignment or "inside")
			)
			rect.strokeFill = GetVariantInput(ctx, behavior, "strokeFill", params.strokeFill)
				or GraphFill_Flat(materialId, tone)
			rect.edgeTop = GetBoolInput(ctx, behavior, "edgeTop", params.edgeTop ~= false)
			rect.edgeRight = GetBoolInput(ctx, behavior, "edgeRight", params.edgeRight ~= false)
			rect.edgeBottom = GetBoolInput(ctx, behavior, "edgeBottom", params.edgeBottom ~= false)
			rect.edgeLeft = GetBoolInput(ctx, behavior, "edgeLeft", params.edgeLeft ~= false)
		end
	end

	if fillEnabled or rect.strokeEnabled == true then
		rect.cornerRadii = GraphEntity_RectCornerRadii(ctx, behavior, params)
	end

	ctx.setOutput(behavior, "object", rect)
end

function G_ObjectGroup(ctx, behavior)
	local objects = {}
	local objectInputs = ctx.getMultiInputs(behavior, "objects")
	for i = 1, #objectInputs do
		GraphEntity_AppendSceneObjectInput(objects, objectInputs[i])
	end

	ctx.setOutput(behavior, "object", {
		id = behavior.id,
		source = behavior.params or {},
		type = "objectGroup",
		children = objects,
		viewport = GraphEntity_GroupViewport(ctx, behavior),
	})
end

function G_Circle(ctx, behavior)
	local params = behavior.params or {}
	local materialId = GraphEntity_GetStringInput(ctx, behavior, "materialId", params.materialId)
	local tone = GetFloatInput(ctx, behavior, "tone", params.tone or 0)
	ctx.setOutput(behavior, "object", {
		id = behavior.id,
		source = params,
		type = "circle",
		materialId = materialId,
		position = GetVec3Input(ctx, behavior, "position", GraphEntity_PositionDefault(params)),
		radius = GetFloatInput(ctx, behavior, "radius", params.radius or 1),
		tone = tone,
		fill = GetVariantInput(ctx, behavior, "fill", params.fill) or GraphFill_Flat(materialId, tone),
	})
end

function G_ArcSegment2D(ctx, behavior)
	local params = behavior.params or {}
	local materialId = GraphEntity_GetStringInput(ctx, behavior, "materialId", params.materialId)
	local tone = GetFloatInput(ctx, behavior, "tone", params.tone or 0)
	ctx.setOutput(behavior, "object", {
		id = behavior.id,
		source = params,
		type = "arcSegment2D",
		materialId = materialId,
		position = GetVec3Input(ctx, behavior, "position", GraphEntity_PositionDefault(params)),
		innerRadius = GetFloatInput(ctx, behavior, "innerRadius", params.innerRadius or 12),
		outerRadius = GetFloatInput(ctx, behavior, "outerRadius", params.outerRadius or params.radius or 16),
		startAngleDeg = GetFloatInput(ctx, behavior, "startAngleDeg", params.startAngleDeg or 0),
		spanAngleDeg = GetFloatInput(ctx, behavior, "spanAngleDeg", params.spanAngleDeg or 90),
		segments = GetFloatInput(ctx, behavior, "segments", params.segments or 24),
		tone = tone,
		fill = GetVariantInput(ctx, behavior, "fill", params.fill) or GraphFill_Flat(materialId, tone),
	})
end

function G_Line(ctx, behavior)
	local params = behavior.params or {}
	ctx.setOutput(behavior, "object", {
		id = behavior.id,
		source = params,
		type = "line",
		materialId = GraphEntity_GetStringInput(ctx, behavior, "materialId", params.materialId),
		lineStart = GetVec3Input(ctx, behavior, "lineStart", {
			x = params.x1 or 0,
			y = params.y1 or 0,
			z = params.z1 or 0,
		}),
		lineEnd = GetVec3Input(ctx, behavior, "lineEnd", {
			x = params.x2 or 0,
			y = params.y2 or 0,
			z = params.z2 or 0,
		}),
		tone = GetFloatInput(ctx, behavior, "tone", params.tone or 0),
	})
end

function G_PathStroke2D(ctx, behavior)
	local params = behavior.params or {}
	local path = ctx.getInput(behavior, "path", params.path)
	if not (type(path) == "table" and path.kind == "path2D") then
		return
	end
	local materialId = GraphEntity_GetStringInput(ctx, behavior, "materialId", params.materialId)
	local tone = GetFloatInput(ctx, behavior, "tone", params.tone or 0)
	local frontFill = GetVariantInput(ctx, behavior, "frontFill", params.frontFill) or GraphFill_Flat(materialId, tone)
	local backFill = GetVariantInput(ctx, behavior, "backFill", params.backFill) or frontFill
	ctx.setOutput(behavior, "object", {
		id = behavior.id,
		source = params,
		type = "pathStroke2D",
		materialId = materialId,
		tone = tone,
		fill = frontFill,
		backFill = backFill,
		surface = {
			kind = "pathSurface2D",
			path = path,
			width = max(0, GetFloatInput(ctx, behavior, "width", params.width or 8)),
			frontFill = frontFill,
			backFill = backFill,
		},
	})
end

function G_PathFill2D(ctx, behavior)
	local params = behavior.params or {}
	local path = ctx.getInput(behavior, "path", params.path)
	if not (type(path) == "table" and path.kind == "path2D") then
		return
	end
	local materialId = GraphEntity_GetStringInput(ctx, behavior, "materialId", params.materialId)
	local tone = GetFloatInput(ctx, behavior, "tone", params.tone or 0)
	local fill = GetVariantInput(ctx, behavior, "fill", params.fill) or GraphFill_Flat(materialId, tone)
	ctx.setOutput(behavior, "object", {
		id = behavior.id,
		source = params,
		type = "pathFill2D",
		materialId = materialId,
		tone = tone,
		fill = fill,
		surface = {
			kind = "pathFill2D",
			path = path,
			fill = fill,
		},
	})
end

function G_Text2D(ctx, behavior)
	local params = behavior.params or {}
	local fontId = GraphEntity_GetStringInput(ctx, behavior, "fontId", params.fontId)
	local font = fontId ~= nil and ctx.fonts[fontId] or nil
	if font == nil then
		return
	end
	local text = GetStringInput(ctx, behavior, "text", params.text or "")
	local materialId = GraphEntity_GetStringInput(ctx, behavior, "materialId", params.materialId)
	local tone = GetFloatInput(ctx, behavior, "tone", params.tone or 0)
	local fill = GetVariantInput(ctx, behavior, "fill", params.fill) or GraphFill_Flat(materialId, tone)
	local affine = GraphEntity_Affine2D(ctx, behavior, 0, 0)
	local scaleX = GetFloatInput(ctx, behavior, "scaleX", params.scaleX or 1)
	local scaleY = GetFloatInput(ctx, behavior, "scaleY", params.scaleY or 1)
	local maxWidth = ctx.getInput(behavior, "maxWidth", nil)
	if maxWidth == nil and params.maxWidth ~= nil then
		maxWidth = ctx.getBehaviorParam(behavior, "maxWidth", params.maxWidth)
	end
	maxWidth = maxWidth ~= nil and SafeFloat(maxWidth, nil) or nil
	local scrollX = GetFloatInput(ctx, behavior, "scrollX", params.scrollX or 0)
	local multiline = GetBoolInput(ctx, behavior, "multiline", params.multiline ~= false)
	local position = GetVec3Input(ctx, behavior, "position", GraphEntity_PositionDefault(params))
	local measuredSize = GraphEntity_MeasureTextSize(font, text, maxWidth, scrollX, multiline, scaleX, scaleY)
		or { x = 0, y = 0 }
	local glyphs = {}
	Font_ForEachTextGlyph(font, text, {
		x = 0,
		y = 0,
		scaleX = scaleX,
		scaleY = scaleY,
		maxWidth = maxWidth,
		scrollX = scrollX,
		multiline = multiline,
		clipX0 = 0,
		clipX1 = maxWidth or 1000000000,
	}, function(glyph)
		if glyph.hasGlyph then
			glyphs[#glyphs + 1] = glyph
		end
	end)

	local items = {}
	local total = #glyphs
	for visibleIndex = 1, total do
		local glyph = glyphs[visibleIndex]
		local key = behavior.id .. ":" .. tostring(glyph.glyphIndex)
		local glyphPosition = GraphEntity_AffineTextPoint(position, measuredSize, affine, glyph.visualX, glyph.visualY)
		local glyphObject = {
			id = key,
			debugSourceObjectId = behavior.id,
			source = params,
			type = "textGlyph2D",
			fontId = fontId,
			codepoint = glyph.codepoint,
			text = glyph.char,
			materialId = materialId,
			tone = tone,
			fill = fill,
			position = glyphPosition,
			layoutX = glyph.visualX,
			layoutY = glyph.visualY,
			scaleX = glyph.scaleX,
			scaleY = glyph.scaleY,
			size = {
				x = glyph.visualWidth,
				y = glyph.visualHeight,
			},
			originIsGlyph = true,
			clipX0 = position.x + glyph.clipX0,
			clipX1 = position.x + glyph.clipX1,
			clipLocalX0 = glyph.clipX0,
			clipLocalX1 = glyph.clipX1,
			glyphTextX = glyph.visualX,
			textX = 0,
			textY = 0,
			textW = measuredSize.x,
			textH = measuredSize.y,
			lineY = glyph.lineY,
			lineH = glyph.lineH,
			anchorXNorm = 0,
			anchorYNorm = 0,
			angleDeg = affine.angleDeg,
			skewX = affine.skewX,
			skewY = affine.skewY,
			visible = true,
			instance = {
				sourceObjectId = behavior.id,
				emitterBehaviorId = behavior.id,
				instanceId = glyph.glyphIndex,
				instanceKey = key,
				glyphIndex = glyph.glyphIndex,
				charIndex = glyph.charIndex,
				lineIndex = glyph.lineIndex,
				codepoint = glyph.codepoint,
				normIndex = total > 1 and (visibleIndex - 1) / (total - 1) or 0,
				visibleIndex = visibleIndex - 1,
				fields = {},
			},
		}
		items[#items + 1] = {
			key = key,
			value = glyphObject,
		}
	end

	DemoGraph_SetStreamMetadataOutputs(
		ctx,
		behavior,
		"glyphs",
		DemoGraph_NewStream(behavior, "glyphs", items),
		{ "glyphIndex", "charIndex", "lineIndex", "codepoint", "normIndex", "visibleIndex" }
	)
end

function G_Camera(ctx, behavior)
	local kind = GetStringInput(ctx, behavior, "kind", "perspective")
	local fovDegrees = GetFloatInput(ctx, behavior, "fovDegrees", 55)
	local camera = Demo_LoadCamera({
		kind = kind,
		fovDegrees = fovDegrees,
		nearZ = GetFloatInput(ctx, behavior, "nearZ", 1),
		farZ = GetFloatInput(ctx, behavior, "farZ", 1000),
		projectionOffset = GetVec2Input(ctx, behavior, "projectionOffset", { x = 0, y = 0 }),
	})
	camera.id = behavior.id
	local pose = ctx.getInput(behavior, "pose", ctx.getBehaviorParam(behavior, "pose"))
	Demo_ApplyPose3ToCamera(camera, pose)
	ctx.setOutput(behavior, "camera", camera)
	ctx.setOutput(behavior, "poseOutput", pose)
end

function G_Scene(ctx, behavior)
	local sceneRuntime = ctx.getGraphSceneRuntime(behavior.id)
	local frameScene = ctx.evaluateSceneFrame(sceneRuntime)
	local objects = {}
	local objectInputs = ctx.getMultiInputs(behavior, "objects")
	for i = 1, #objectInputs do
		GraphEntity_AppendSceneObjectInput(objects, objectInputs[i])
	end
	for i = 1, #objects do
		ctx.addFrameSceneObject(frameScene, objects[i])
	end

	local environment = {
		ambient = GetFloatInput(ctx, behavior, "ambient", 0),
		lightDirection = GetVec3Input(ctx, behavior, "lightDirection", { x = 0, y = 1, z = 0 }),
		fog = {
			density = GetFloatInput(ctx, behavior, "fogDensity", 0.005),
			startDistance = GetFloatInput(ctx, behavior, "fogStartDistance", 0),
		},
	}
	ctx.setOutput(behavior, "scene", {
		frameScene = frameScene,
		environment = environment,
		runtime = sceneRuntime,
	})
end

function G_Pass(ctx, behavior)
	local enabled = GetBoolInput(ctx, behavior, "enabled", true)
	if not enabled then
		ctx.setOutput(behavior, "pass", {
			id = behavior.id,
			def = behavior.params or {},
			enabled = false,
		})
		return
	end

	local sceneValue = ctx.getInput(behavior, "scene")
	local camera = ctx.getInput(behavior, "camera")
	if sceneValue == nil or camera == nil then
		return
	end

	local viewportPosition = GetVec2Input(ctx, behavior, "viewportPosition", { x = 0, y = 0 })
	local viewportSize = GetSize2Input(ctx, behavior, "viewportSize", { x = 240, y = 136 })
	ctx.setOutput(behavior, "pass", {
		id = behavior.id,
		def = behavior.params or {},
		enabled = true,
		scene = sceneValue,
		camera = camera,
		cameraId = camera.id,
		clearMaterialId = GetStringInput(ctx, behavior, "clearMaterialId"),
		clearTone = GetFloatInput(ctx, behavior, "clearTone", 0),
		viewport = {
			x = ((viewportPosition.x + 0.5) // 1),
			y = ((viewportPosition.y + 0.5) // 1),
			width = math.max(0, ((viewportSize.x + 0.5) // 1)),
			height = math.max(0, ((viewportSize.y + 0.5) // 1)),
		},
	})
end

function G_ProjectOutput(ctx, behavior)
	ctx.getMultiInputs(behavior, "trash")
	ctx.setOutput(behavior, "passes", ctx.getMultiInputs(behavior, "passes"))
	local clearMaterialId = GetStringInput(ctx, behavior, "clearMaterialId")
	if type(clearMaterialId) == "string" and clearMaterialId ~= "" then
		ctx.setOutput(behavior, "clearMaterialId", clearMaterialId)
	end
	local borderSpanInputs = ctx.getMultiInputs(behavior, "borderSpans")
	local borderSpans = {}
	for i = 1, #borderSpanInputs do
		GraphEntity_AppendBorderSpanInput(borderSpans, borderSpanInputs[i])
	end
	if #borderSpans > 0 then
		ctx.setOutput(behavior, "borderSpans", borderSpans)
	end
	local tintAmount = GetFloatInput(ctx, behavior, "tintAmount", 0)
	tintAmount = (tintAmount < 0 and 0 or (tintAmount > 1 and 1 or tintAmount))
	if tintAmount > 0 then
		ctx.setOutput(behavior, "tint", {
			color = Demo_NormalizeAnimationColor(GetStringInput(ctx, behavior, "tintColor", "#000")),
			amount = tintAmount,
			blendMode = GetStringInput(ctx, behavior, "tintBlendMode", "mix"),
		})
	end
	-- Party calibration cards report byte levels; keep these graph inputs in
	-- that vocabulary and normalize only when remapping material LUT colors.
	local blackLevel = GetFloatInput(ctx, behavior, "calibrationBlackLevel", 0)
	blackLevel = (blackLevel < 0 and 0 or (blackLevel > 255 and 255 or blackLevel))
	local whiteLevel = GetFloatInput(ctx, behavior, "calibrationWhiteLevel", 255)
	whiteLevel = (whiteLevel < 0 and 0 or (whiteLevel > 255 and 255 or whiteLevel))
	local gamma = max(0.01, GetFloatInput(ctx, behavior, "calibrationGamma", 1))
	if blackLevel > 0 or whiteLevel < 255 or abs(gamma - 1) > 0.001 then
		ctx.setOutput(behavior, "calibration", {
			blackLevel = blackLevel,
			whiteLevel = max(blackLevel, whiteLevel),
			gamma = gamma,
		})
	end
end

function GraphAnimation_IsDef(value)
	return type(value) == "table" and value.kind == "animationDef"
end

function GraphAnimation_IsFrame(value)
	return type(value) == "table" and value.kind == "animationFrame"
end

function GraphAnimation_DurationOrDefault(value)
	if
		SATISFIED(
			type(value) == "number" and value == value and value > 0 and value < 1e30,
			"Animation frame duration must be finite and greater than zero"
		)
	then
		return value
	end
	return 0.1
end

function GraphAnimation_DurationInputs(ctx, behavior)
	local durations = ctx.getMultiInputs(behavior, "frameDurations")
	if #durations == 0 then
		durations[1] = ctx.getBehaviorParam(behavior, "frameDurations", 0.1)
	end
	return durations
end

function GraphAnimation_BuildDef(fontId, codepoints, sourceDurations, frameSize)
	local durations = {}
	for i = 1, #sourceDurations do
		durations[i] = GraphAnimation_DurationOrDefault(sourceDurations[i])
	end
	if #durations == 0 then
		durations[1] = 0.1
	end

	local safeSize = SafeVec2(frameSize, { x = 0, y = 0 })
	local sharedFrameSize = { x = safeSize.x, y = safeSize.y }
	local frames = {}
	local frameDurations = {}
	local totalDuration = 0
	for i = 1, #codepoints do
		local duration = durations[(i - 1) % #durations + 1]
		frames[i] = {
			kind = "animationFrame",
			fontId = fontId,
			codepoint = codepoints[i],
			frameSize = sharedFrameSize,
		}
		frameDurations[i] = duration
		totalDuration = totalDuration + duration
	end

	return {
		kind = "animationDef",
		fontId = fontId,
		frameSize = sharedFrameSize,
		frames = frames,
		frameDurations = frameDurations,
		duration = totalDuration,
	}
end

function GraphAnimation_RebuildDef(animationDef, sourceDurations)
	local codepoints = {}
	for i = 1, #animationDef.frames do
		codepoints[i] = animationDef.frames[i].codepoint
	end
	return GraphAnimation_BuildDef(animationDef.fontId, codepoints, sourceDurations, animationDef.frameSize)
end

function GraphAnimation_DefFromBehavior(ctx, behavior)
	local fontId = GraphEntity_GetStringInput(ctx, behavior, "fontId", (behavior.params or {}).fontId)
	local font = fontId ~= nil and ctx.fonts[fontId] or nil
	if not SATISFIED(font ~= nil, "AnimationDef requires a font") then
		return nil
	end
	return GraphAnimation_BuildDef(
		fontId,
		font.sortedCodepoints,
		GraphAnimation_DurationInputs(ctx, behavior),
		GetSize2Input(ctx, behavior, "frameSize", { x = 8, y = 8 })
	)
end

function GraphAnimation_Sample(animationDef, phase)
	local count = #animationDef.frames
	if count == 0 or animationDef.duration <= 0 then
		return nil
	end
	phase = ((SafeFloat(phase)) < 0 and 0 or ((SafeFloat(phase)) > 1 and 1 or (SafeFloat(phase))))
	if phase >= 1 then
		return animationDef.frames[count], count - 1, 1
	end

	local sampleTime = phase * animationDef.duration
	local frameStart = 0
	for i = 1, count do
		local duration = animationDef.frameDurations[i]
		if sampleTime < frameStart + duration then
			return animationDef.frames[i], i - 1, (sampleTime - frameStart) / duration
		end
		frameStart = frameStart + duration
	end
	return animationDef.frames[count], count - 1, 1
end

function GraphAnimation_LoopPhase(animationDef, time)
	if animationDef.duration <= 0 then
		return 0
	end
	return ((SafeFloat(time) / animationDef.duration) - ((SafeFloat(time) / animationDef.duration) // 1))
end

function GraphAnimation_OneShotPhase(animationDef, time, startTime)
	if animationDef.duration <= 0 then
		return 0
	end
	return (
		((SafeFloat(time) - SafeFloat(startTime)) / animationDef.duration) < 0 and 0
		or (
			((SafeFloat(time) - SafeFloat(startTime)) / animationDef.duration) > 1 and 1
			or ((SafeFloat(time) - SafeFloat(startTime)) / animationDef.duration)
		)
	)
end

function GraphAnimation_GetScopeState(ctx, behavior)
	local state = behavior.state
	state.graphAnimationByScope = state.graphAnimationByScope or {}
	DEMO_ASSERT((type(ctx.graphScopeKey) == "string" and ctx.graphScopeKey ~= ""), "GraphAnimation needs graphScopeKey")
	local graphScopeKey = ctx.graphScopeKey
	state.graphAnimationByScope[graphScopeKey] = state.graphAnimationByScope[graphScopeKey] or {}
	return state.graphAnimationByScope[graphScopeKey]
end

function GraphAnimation_GlyphObject(ctx, behavior, frame)
	if not SATISFIED(GraphAnimation_IsFrame(frame), "FontGlyph2D requires an AnimationFrame") then
		return nil
	end
	if not SATISFIED(ctx.fonts[frame.fontId] ~= nil, "FontGlyph2D frame references a missing font") then
		return nil
	end

	local params = behavior.params or {}
	local position = GetVec3Input(ctx, behavior, "position", GraphEntity_PositionDefault(params))
	local size = SafeVec2(frame.frameSize, { x = 0, y = 0 })
	local materialId = GraphEntity_GetStringInput(ctx, behavior, "materialId", params.materialId)
	local tone = GetFloatInput(ctx, behavior, "tone", params.tone or 0)
	local affine = GraphEntity_Affine2D(ctx, behavior, 0, 0)
	return {
		id = behavior.id,
		source = params,
		type = "textGlyph2D",
		fontId = frame.fontId,
		codepoint = frame.codepoint,
		materialId = materialId,
		tone = tone,
		fill = GetVariantInput(ctx, behavior, "fill", params.fill) or GraphFill_Flat(materialId, tone),
		position = position,
		layoutX = position.x,
		layoutY = position.y,
		scaleX = 1,
		scaleY = 1,
		size = size,
		originIsGlyph = false,
		textX = position.x,
		textY = position.y,
		textW = size.x,
		textH = size.y,
		lineY = position.y,
		lineH = size.y,
		anchorXNorm = affine.anchorXNorm,
		anchorYNorm = affine.anchorYNorm,
		angleDeg = affine.angleDeg,
		skewX = affine.skewX,
		skewY = affine.skewY,
		visible = true,
	}
end

function GraphAnimation_SetGlyphOutput(ctx, behavior, frame)
	local object = GraphAnimation_GlyphObject(ctx, behavior, frame)
	if object ~= nil then
		ctx.setOutput(behavior, "object", object)
	end
end

-- graph node
function G_AnimationDef(ctx, behavior)
	local animationDef = GraphAnimation_DefFromBehavior(ctx, behavior)
	if animationDef ~= nil then
		ctx.setOutput(behavior, "animationDef", animationDef)
	end
end

-- graph node
function G_AnimationDuration(ctx, behavior)
	local animationDef = ctx.getInput(behavior, "animationDef", nil)
	if SATISFIED(GraphAnimation_IsDef(animationDef), "AnimationDuration requires an AnimationDef") then
		ctx.setOutput(behavior, "duration", animationDef.duration)
	end
end

-- graph node
function G_SetAnimationFrameDuration(ctx, behavior)
	local animationDef = ctx.getInput(behavior, "animationDef", nil)
	if not SATISFIED(GraphAnimation_IsDef(animationDef), "SetAnimationFrameDuration requires an AnimationDef") then
		return
	end
	local count = #animationDef.frames
	if count == 0 then
		ctx.setOutput(behavior, "animationDef", animationDef)
		return
	end
	local durations = {}
	for i = 1, count do
		durations[i] = animationDef.frameDurations[i]
	end
	local index = floor(GetFloatInput(ctx, behavior, "frameIndex", 0)) % count + 1
	durations[index] = GetFloatInput(ctx, behavior, "duration", 0.1)
	ctx.setOutput(behavior, "animationDef", GraphAnimation_RebuildDef(animationDef, durations))
end

-- graph node
function G_SetAnimationFrameDurations(ctx, behavior)
	local animationDef = ctx.getInput(behavior, "animationDef", nil)
	if SATISFIED(GraphAnimation_IsDef(animationDef), "SetAnimationFrameDurations requires an AnimationDef") then
		ctx.setOutput(
			behavior,
			"animationDef",
			GraphAnimation_RebuildDef(animationDef, GraphAnimation_DurationInputs(ctx, behavior))
		)
	end
end

-- graph node
function G_AnimationSampler(ctx, behavior)
	local animationDef = ctx.getInput(behavior, "animationDef", nil)
	if not SATISFIED(GraphAnimation_IsDef(animationDef), "AnimationSampler requires an AnimationDef") then
		return
	end
	local frame, frameIndex, framePhase = GraphAnimation_Sample(animationDef, GetFloatInput(ctx, behavior, "phase", 0))
	if frame ~= nil then
		ctx.setOutput(behavior, "frame", frame)
		ctx.setOutput(behavior, "frameIndex", frameIndex)
		ctx.setOutput(behavior, "framePhase", framePhase)
	end
end

-- graph node
function G_LoopAnimationPhase(ctx, behavior)
	local animationDef = ctx.getInput(behavior, "animationDef", nil)
	if SATISFIED(GraphAnimation_IsDef(animationDef), "LoopAnimationPhase requires an AnimationDef") then
		ctx.setOutput(
			behavior,
			"phase",
			GraphAnimation_LoopPhase(animationDef, GetFloatInput(ctx, behavior, "time", 0))
		)
	end
end

-- graph node
function G_OneShotAnimationPhase(ctx, behavior)
	local animationDef = ctx.getInput(behavior, "animationDef", nil)
	if not SATISFIED(GraphAnimation_IsDef(animationDef), "OneShotAnimationPhase requires an AnimationDef") then
		return
	end
	local time = GetFloatInput(ctx, behavior, "time", 0)
	local triggerHigh = GetFloatInput(ctx, behavior, "trigger", 0) > 0
	local state = GraphAnimation_GetScopeState(ctx, behavior)
	if ctx.t ~= nil and ctx.t.didSeek == true then
		state.startTime = nil
		state.previousTriggerHigh = triggerHigh
		ctx.setOutput(behavior, "phase", 0)
		return
	end
	if triggerHigh and state.previousTriggerHigh ~= true then
		state.startTime = time
	end
	state.previousTriggerHigh = triggerHigh
	ctx.setOutput(
		behavior,
		"phase",
		state.startTime ~= nil and GraphAnimation_OneShotPhase(animationDef, time, state.startTime) or 0
	)
end

-- graph node
function G_FontGlyph2D(ctx, behavior)
	GraphAnimation_SetGlyphOutput(ctx, behavior, ctx.getInput(behavior, "frame", nil))
end

-- graph node
function G_AnimatedImage(ctx, behavior)
	local animationDef = GraphAnimation_DefFromBehavior(ctx, behavior)
	if animationDef == nil then
		return
	end
	local time = GetFloatInput(ctx, behavior, "time", 0)
	local loopMode = GetStringInput(ctx, behavior, "loopMode", "loop")
	local phase = loopMode == "once" and GraphAnimation_OneShotPhase(animationDef, time, 0)
		or GraphAnimation_LoopPhase(animationDef, time)
	local frame = GraphAnimation_Sample(animationDef, phase)
	if frame ~= nil then
		GraphAnimation_SetGlyphOutput(ctx, behavior, frame)
	end
end

function G_Float(ctx, behavior)
	ctx.setOutput(behavior, "value", SafeFloat(ctx.getBehaviorParam(behavior, "value", 0)))
end

function G_Bool(ctx, behavior)
	ctx.setOutput(behavior, "value", SafeBool(ctx.getBehaviorParam(behavior, "value", false)))
end

function G_Vec3(ctx, behavior)
	ctx.setOutput(behavior, "value", SafeVec3(ctx.getBehaviorParam(behavior, "value", { x = 0, y = 0, z = 0 })))
end

function G_String(ctx, behavior)
	ctx.setOutput(behavior, "value", SafeString(ctx.getBehaviorParam(behavior, "value", "")))
end

local kGraphStringDefaultDigits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
local kGraphStringDefaultRandomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

function GraphString_Int(value, fallback)
	return SafeFloat(value, fallback) // 1
end

function GraphString_ClampInt(value, fallback, minimum, maximum)
	return (
		(GraphString_Int(value, fallback)) < minimum and minimum
		or ((GraphString_Int(value, fallback)) > maximum and maximum or (GraphString_Int(value, fallback)))
	)
end

function GraphString_DigitAt(digits, index)
	return string.sub(digits, index + 1, index + 1)
end

function GraphString_NumberToDigits(value, base, digits)
	if value == 0 then
		return GraphString_DigitAt(digits, 0)
	end
	local result = ""
	while value > 0 do
		local digit = value % base
		result = GraphString_DigitAt(digits, digit) .. result
		value = value // base
	end
	return result
end

function GraphString_NumberToString(value, decimals, base, digits, decimalString)
	digits = SafeString(digits, kGraphStringDefaultDigits)
	if #digits < 2 then
		digits = kGraphStringDefaultDigits
	end
	base = GraphString_ClampInt(base, 10, 2, min(36, #digits))
	decimals = GraphString_ClampInt(decimals, 0, 0, 8)
	decimalString = SafeString(decimalString, ".")

	value = SafeFloat(value)
	local sign = ""
	if value < 0 then
		sign = "-"
		value = -value
	end

	local scale = pow(base, decimals)
	local scaled = (value * scale + 0.5) // 1
	local integerPart = decimals > 0 and scaled // scale or scaled
	local fractionalPart = decimals > 0 and scaled % scale or 0
	local result = sign .. GraphString_NumberToDigits(integerPart, base, digits)
	if decimals <= 0 then
		return result
	end

	local fractionalDigits = ""
	for _ = 1, decimals do
		local digit = fractionalPart % base
		fractionalDigits = GraphString_DigitAt(digits, digit) .. fractionalDigits
		fractionalPart = fractionalPart // base
	end
	return result .. decimalString .. fractionalDigits
end

function GraphString_AppendChars(items, value)
	value = SafeString(value, "")
	for i = 1, #value do
		items[#items + 1] = {
			key = #items,
			value = string.byte(value, i),
		}
	end
end

function GraphString_StringToChars(behavior, value)
	local items = {}
	if DemoGraph_IsStream(value) then
		for i = 1, #value.items do
			GraphString_AppendChars(items, value.items[i].value)
		end
	else
		GraphString_AppendChars(items, value)
	end
	return DemoGraph_NewStream(behavior, "chars", items)
end

function GraphString_AppendVec3(items, x, y, z)
	items[#items + 1] = {
		key = #items,
		value = {
			x = SafeFloat(x),
			y = SafeFloat(y),
			z = SafeFloat(z),
		},
	}
end

function GraphString_AppendVec3Row(items, row)
	row = string.gsub(SafeString(row, ""), "#.*", "")
	local coords = {}
	for token in string.gmatch(row .. ",", "([^,]*),") do
		local value = tonumber(token)
		if value == nil then
			return
		end
		coords[#coords + 1] = value
	end
	if #coords == 0 or #coords > 3 then
		return
	end
	GraphString_AppendVec3(items, coords[1], coords[2] or 0, coords[3] or 0)
end

function GraphString_AppendVec3List(items, value)
	local text = SafeString(value, "")
	text = string.gsub(text, "\r\n", "\n")
	text = string.gsub(text, "\r", "\n")
	for row in string.gmatch(text .. "\n", "([^\n]*)\n") do
		GraphString_AppendVec3Row(items, row)
	end
end

function GraphString_StringToVec3List(behavior, value)
	local items = {}
	if DemoGraph_IsStream(value) then
		for i = 1, #value.items do
			GraphString_AppendVec3List(items, value.items[i].value)
		end
	else
		GraphString_AppendVec3List(items, value)
	end
	return DemoGraph_NewStream(behavior, "vectors", items)
end

function GraphString_RandomString(behavior, valueLength, charSet, seedValue, key, itemIndex)
	charSet = SafeString(charSet, kGraphStringDefaultRandomChars)
	if #charSet == 0 then
		return ""
	end
	local length = GraphString_ClampInt(valueLength, 8, 0, 128)
	local seed = SafeFloat(seedValue) + DemoCustom_StringHashNumber(behavior.id, #charSet + length)
	if key ~= nil then
		seed = seed + DemoCustom_StringHashNumber(key, 17)
	end
	if itemIndex ~= nil then
		seed = seed + itemIndex * 31
	end

	local result = ""
	for i = 1, length do
		local charIndex = (Hash1D(seed + i * 23.17) * #charSet) // 1 + 1
		result = result .. string.sub(charSet, charIndex, charIndex)
	end
	return result
end

function GraphString_Substring(input, startIndex, valueLength)
	input = SafeString(input, "")
	startIndex = max(0, GraphString_Int(startIndex, 0))
	valueLength = max(0, GraphString_Int(valueLength, 9999))
	return string.sub(input, startIndex + 1, startIndex + valueLength)
end

function GraphString_AsciiCharToString(value)
	return string.char(GraphString_ClampInt(value, 0, 0, 255))
end

function GraphString_ValueToSegment(value)
	if type(value) == "number" then
		return GraphString_AsciiCharToString(value)
	end
	return SafeString(value, "")
end

function G_MakeVec3(ctx, behavior)
	local x = GetVariantInput(ctx, behavior, "x", 0)
	local y = GetVariantInput(ctx, behavior, "y", 0)
	local z = GetVariantInput(ctx, behavior, "z", 0)
	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapInputs(behavior, "value", { x, y, z }, function(values)
			return {
				x = SafeFloat(values[1]),
				y = SafeFloat(values[2]),
				z = SafeFloat(values[3]),
			}
		end)
	)
end

function G_NumberToString(ctx, behavior)
	local input = GetVariantInput(ctx, behavior, "input", 0)
	local decimals = GetVariantInput(ctx, behavior, "decimals", 0)
	local base = GetVariantInput(ctx, behavior, "base", 10)
	local digits = GetVariantInput(ctx, behavior, "digits", kGraphStringDefaultDigits)
	local decimal = GetVariantInput(ctx, behavior, "decimal", ".")
	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapInputs(behavior, "value", { input, decimals, base, digits, decimal }, function(values)
			return GraphString_NumberToString(values[1], values[2], values[3], values[4], values[5])
		end)
	)
end

function G_StringToChars(ctx, behavior)
	ctx.setOutput(behavior, "chars", GraphString_StringToChars(behavior, GetVariantInput(ctx, behavior, "input", "")))
end

function G_StringToVec3List(ctx, behavior)
	ctx.setOutput(
		behavior,
		"vectors",
		GraphString_StringToVec3List(behavior, GetVariantInput(ctx, behavior, "input", ""))
	)
end

function G_RandomString(ctx, behavior)
	local length = GetVariantInput(ctx, behavior, "len", 8)
	local charSet = GetVariantInput(ctx, behavior, "charSet", kGraphStringDefaultRandomChars)
	local seed = GetVariantInput(ctx, behavior, "seed", 0)
	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapInputs(behavior, "value", { length, charSet, seed }, function(values, key, itemIndex)
			return GraphString_RandomString(behavior, values[1], values[2], values[3], key, itemIndex)
		end)
	)
end

function G_Substring(ctx, behavior)
	local input = GetVariantInput(ctx, behavior, "input", "")
	local startIndex = GetVariantInput(ctx, behavior, "start", 0)
	local length = GetVariantInput(ctx, behavior, "len", 9999)
	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapInputs(behavior, "value", { input, startIndex, length }, function(values)
			return GraphString_Substring(values[1], values[2], values[3])
		end)
	)
end

function G_AsciiCharToString(ctx, behavior)
	local input = GetVariantInput(ctx, behavior, "input", 0)
	ctx.setOutput(
		behavior,
		"value",
		DemoGraph_MapInputs(behavior, "value", { input }, function(values)
			return GraphString_AsciiCharToString(values[1])
		end)
	)
end

function G_ConcatString(ctx, behavior)
	local stream = FlattenInputsToStream(behavior, "values", ctx.getMultiInputs(behavior, "values"))
	local result = ""
	for i = 1, #stream.items do
		result = result .. GraphString_ValueToSegment(stream.items[i].value)
	end
	ctx.setOutput(behavior, "value", result)
end

function G_SplitVec3(ctx, behavior)
	local value = GetVariantInput(ctx, behavior, "value", { x = 0, y = 0, z = 0 })
	ctx.setOutput(
		behavior,
		"x",
		DemoGraph_MapInputs(behavior, "x", { value }, function(values)
			return DemoCustom_ValueToVec3(values[1]).x
		end)
	)
	ctx.setOutput(
		behavior,
		"y",
		DemoGraph_MapInputs(behavior, "y", { value }, function(values)
			return DemoCustom_ValueToVec3(values[1]).y
		end)
	)
	ctx.setOutput(
		behavior,
		"z",
		DemoGraph_MapInputs(behavior, "z", { value }, function(values)
			return DemoCustom_ValueToVec3(values[1]).z
		end)
	)
end

function G_EmitSparks(ctx, behavior)
	local sourceObject = ctx.getInput(behavior, "source")
	local materialId = GetStringInput(ctx, behavior, "materialId")
	if sourceObject == nil or (type(materialId) ~= "string" or materialId == "") then
		return
	end

	local emitterPoint = Demo_GetFrameSceneObjectCentroid(sourceObject)
	if emitterPoint == nil then
		return
	end

	local spawnRate = max(0, GetFloatInput(ctx, behavior, "spawnRate", 12))
	local lifetime = max(0.05, GetFloatInput(ctx, behavior, "lifetime", 0.8))
	local speed = max(0, GetFloatInput(ctx, behavior, "speed", 28))
	local radius = max(1, GetFloatInput(ctx, behavior, "radius", 3))
	local emitterState = behavior.state or {}
	behavior.state = emitterState
	emitterState.particles = emitterState.particles or {}
	emitterState.nextParticleId = emitterState.nextParticleId or 1
	emitterState.spawnCarry = emitterState.spawnCarry or 0

	local millis = ctx.t.demoMillis or 0
	local dt = 1 / 60
	if emitterState.lastMillis ~= nil then
		dt = (
			((millis - emitterState.lastMillis) / 1000) < 0 and 0
			or (
				((millis - emitterState.lastMillis) / 1000) > 0.1 and 0.1 or ((millis - emitterState.lastMillis) / 1000)
			)
		)
	end
	emitterState.lastMillis = millis

	emitterState.spawnCarry = emitterState.spawnCarry + spawnRate * dt
	local spawnCount = emitterState.spawnCarry // 1
	emitterState.spawnCarry = emitterState.spawnCarry - spawnCount
	for i = 1, spawnCount do
		local particleId = emitterState.nextParticleId
		emitterState.nextParticleId = particleId + 1
		local angle = particleId * 2.34
		local burst = 0.55 + 0.45 * Hash3D(particleId, (millis // 100), 11)
		emitterState.particles[#emitterState.particles + 1] = {
			id = particleId,
			x = emitterPoint.x or 0,
			y = emitterPoint.y or 0,
			vx = cos(angle) * speed * burst,
			vy = sin(angle) * speed * burst - speed * 0.35,
			age = 0,
			lifetime = lifetime,
		}
	end

	local liveParticles = {}
	local sparkItems = {}
	for i = 1, #emitterState.particles do
		local particle = emitterState.particles[i]
		particle.age = particle.age + dt
		if particle.age < particle.lifetime then
			particle.vy = particle.vy + 32 * dt
			particle.x = particle.x + particle.vx * dt
			particle.y = particle.y + particle.vy * dt
			liveParticles[#liveParticles + 1] = particle

			local u = (
				(particle.age / particle.lifetime) < 0 and 0
				or ((particle.age / particle.lifetime) > 1 and 1 or (particle.age / particle.lifetime))
			)
			local objectId = behavior.id .. ":spark:" .. tostring(particle.id)
			sparkItems[#sparkItems + 1] = {
				key = objectId,
				value = {
					id = objectId,
					type = "circle",
					materialId = materialId,
					position = { x = particle.x, y = particle.y },
					radius = max(1, radius * (1 - u * 0.65)),
					fill = GraphFill_RadialGradient(materialId, 1 - u * 0.25, 0),
				},
			}
		end
	end
	emitterState.particles = liveParticles
	ctx.setOutput(behavior, "objects", DemoGraph_NewStream(behavior, "objects", sparkItems))
end

-- demo project-specific code (not part of the underlying anim / scene engine)
-- these are basically hooks into the rendering engine to add custom things / behaviors.
--
-- see Demo_CreateCustomContext for ctx
--
-- hooks (global functions called by demo engine):
-- - DemoCustom_BeginFrame(customContext)
-- - DemoCustom_DrawOverlay(customContext) -- called just before Scene_endRenderFrame. here you can render 2d primitives.
-- - DemoCustom_DrawHud(customContext) -- called at the end of the frame after Scene_endRenderFrame.

function DemoCustom_BeginFrame(ctx)
	cls(0) -- note this is a tic80 palette index, not a tf scene material index.
	gDemoHudLines = {}
	gDemoHudPlots = {}
	DemoCustom_AddHudLine(string.format(
		"beat: %.2f %s %s", --
		ctx.t.demoBeats,
		ctx.t.isPlaying and "(playing)" or "(paused)",
		ctx.t.isMuted and "(muted)" or ""
	))

	-- DemoCustom_AddHudLine(string.format("ctx tempo: %d spd: %d", ctx.t.tempo, ctx.t.speed))

	-- DemoCustom_AddHudLine(
	-- 	string.format("ctx rpb: %d rpp: %d sbc: %d", ctx.t.rowsPerBeat, ctx.t.rowsPerPattern, ctx.t.songBeatCount)
	-- )

	-- local state = somatic_get_raw_time()

	-- DemoCustom_AddHudLine(string.format("tempo: %d spd: %d", state.tempo, state.speed))

	-- DemoCustom_AddHudLine(
	-- 	string.format("rpb: %d rpp: %d sbc: %d", state.rowsPerBeat, state.rowsPerPattern, state.songBeatCount)
	-- )
	-- DemoCustom_AddHudLine(string.format("tempo: %d spd: %d", SOMATIC_MUSIC_DATA.tempo, SOMATIC_MUSIC_DATA.speed))

	-- DemoCustom_AddHudLine(
	-- 	string.format("rpb: %d rpp: %d", SOMATIC_MUSIC_DATA.rowsPerBeat, SOMATIC_MUSIC_DATA.rowsPerPattern)
	-- )

	-- DemoCustom_AddHudLine(string.format("rpb: %d rpp: %d", somatic_transport.baseTempo, somatic_transport.baseSpeed))

	-- dump gDemoProjectDef.transport.isMuted
	-- DemoCustom_AddHudLine("ismuted: " .. tostring(gDemoProjectDef.transport.isMuted))
end

-- let's make an effort to arrange these by category
gBehaviorGraphEvaluators = {

	-- array
	Array = G_Array,
	Count = G_Count,
	ExtractItem = G_ExtractItem,
	Index = G_Index,
	NormalizedIndex = G_NormalizedIndex,
	Partition = G_Partition,
	Select = G_Select,
	SelectNormalized = G_SelectNormalized,
	NormalizeAcrossStream = G_NormalizeAcrossStream,
	RemapAcrossStream = G_RemapAcrossStream,

	Distinct = G_Distinct,
	Intersection = G_Intersection,
	UnionDistinct = G_UnionDistinct,
	SetXor = G_SetXor,
	SetDiff = G_SetDiff,
	NumericRange = G_NumericRange,
	Zip = G_Zip,
	Unzip = G_Unzip,
	Shuffle = G_Shuffle,
	FillArray = G_FillArray,
	ArraySubset = G_ArraySubset,

	-- path
	PathPoint2D = G_PathPoint2D,
	PathFromPoints = G_PathFromPoints,
	PathFromVec3List = G_PathFromVec3List,
	JoinPaths = G_JoinPaths,
	ReversePath = G_ReversePath,
	ResamplePath = G_ResamplePath,
	PointAlongPath = G_PointAlongPath,
	PathInfo = G_PathInfo,
	SubPath = G_SubPath,
	SetPathJoint = G_SetPathJoint,
	TransformPath2D = G_TransformPath2D,
	Path2DToPrimitives = G_Path2DToPrimitives,
	PathPlaceObjects = G_PathPlaceObjects,
	SinePath = G_SinePath,
	ArcSegmentPath = G_ArcSegmentPath,

	-- emitters
	ArrayEmitter3D = G_ArrayEmitter3D,
	BoxEmitter3D = G_BoxEmitter3D,
	EmitSparks = G_EmitSparks,
	CircularEmitter = G_CircularEmitter,

	-- project essentials / foundations
	Pass = G_Pass,
	Scene = G_Scene,
	ProjectOutput = G_ProjectOutput,
	Camera = G_Camera,

	-- project resources
	TextureRef = G_TextureRef,
	FontRef = G_FontRef,
	MaterialRef = G_MaterialRef,
	MeshRef = G_MeshRef,
	BorderSpan = G_BorderSpan,
	BorderSplit = G_BorderSplit,

	-- signal generator / sources
	Transport = G_Transport,
	TriangleWave = G_TriangleWave,
	PulseWave = G_PulseWave,
	Sawtooth = G_Sawtooth,
	Sine = G_Sine,
	Seconds = G_Seconds,
	SecondsVec3 = G_SecondsVec3,
	FbmNoise = G_FbmNoise,
	Accumulate = G_Accumulate,
	BeatFract = G_BeatFract,
	BeatFractVec3 = G_BeatFractVec3,
	Beats = G_Beats,
	BeatVec3 = G_BeatVec3,
	AnimationDef = G_AnimationDef,
	AnimationDuration = G_AnimationDuration,
	SetAnimationFrameDuration = G_SetAnimationFrameDuration,
	SetAnimationFrameDurations = G_SetAnimationFrameDurations,
	AnimationSampler = G_AnimationSampler,
	OneShotAnimationPhase = G_OneShotAnimationPhase,
	LoopAnimationPhase = G_LoopAnimationPhase,

	-- input
	MousePosition = G_MousePosition,
	MouseLeftClick = G_MouseLeftClick,
	MouseRightClick = G_MouseRightClick,

	-- constants
	IsDebug = G_IsDebug,
	IsRelease = G_IsRelease,
	HudStatus = G_HudStatus,

	-- signal processing
	Mod = G_Mod,
	Min = G_Min,
	Max = G_Max,
	Quantize = G_Quantize,
	Abs = G_Abs,
	Sign = G_Sign,
	CopySign = G_CopySign,
	Clamp = G_Clamp,
	Round = G_Round,
	Ceil = G_Ceil,
	Smoothstep = G_Smoothstep,
	Smootherstep = G_Smootherstep,
	SmoothMin = G_SmoothMin,
	SmoothMax = G_SmoothMax,
	SmoothClamp = G_SmoothClamp,
	Multiply = G_Multiply,
	Neg = G_Neg,
	Sqrt = G_Sqrt,
	Step = G_Step,
	Sub = G_Sub,
	Add = G_Add,
	Approach = G_Approach,
	Smooth = G_Smooth,
	Remap = G_Remap,
	Pow = G_Pow,
	Spring = G_Spring,
	AngularSpring = G_AngularSpring,
	Curve = G_Curve,
	Div = G_Div,
	Envelope = G_Envelope,
	Fract = G_Fract,
	Floor = G_Floor,
	Hash = G_Hash,
	Lerp = G_Lerp,
	PerBeatToPerSecond = G_PerBeatToPerSecond,
	Trigger = G_Trigger,
	ChangeTrigger = G_ChangeTrigger,

	-- logic
	Bool = G_Bool,
	And = G_And,
	Or = G_Or,
	Xor = G_Xor,
	Not = G_Not,
	If = G_If,

	-- scene objects
	Text2D = G_Text2D,
	FontGlyph2D = G_FontGlyph2D,
	AnimatedImage = G_AnimatedImage,
	Torus = G_Torus,
	Cylinder = G_Cylinder,
	Cone = G_Cone,
	Plane = G_Plane,
	Point2D = G_Point2D,
	Point3D = G_Point3D,
	Rect = G_Rect,
	ObjectGroup = G_ObjectGroup,
	Circle = G_Circle,
	ArcSegment2D = G_ArcSegment2D,
	Cube = G_Cube,
	GeoSphere = G_GeoSphere,
	Line = G_Line,
	PathStroke2D = G_PathStroke2D,
	PathFill2D = G_PathFill2D,
	Mesh3D = G_Mesh3D,

	-- scene object utilities
	Distance = G_Distance,
	Centroid = G_Centroid,

	-- camera utils
	CameraLookAt = G_CameraLookAt,
	MakeCameraPose = G_MakeCameraPose,
	ApplyCameraPose = G_ApplyCameraPose,
	SetCameraPose = G_SetCameraPose,
	UnpackCameraPose = G_UnpackCameraPose,

	-- texture
	FlatFill = G_FlatFill,
	LinearGradientFill = G_LinearGradientFill,
	RadialGradientFill = G_RadialGradientFill,
	TextureFill = G_TextureFill,
	MaskedFill = G_MaskedFill,
	CheckeredPatternTexture = G_CheckeredPatternTexture,
	ValueNoiseTexture = G_ValueNoiseTexture,

	-- datatype utils
	Float = G_Float,
	MakeVec3 = G_MakeVec3,
	SplitVec3 = G_SplitVec3,
	String = G_String,
	NumberToString = G_NumberToString,
	StringToChars = G_StringToChars,
	StringToVec3List = G_StringToVec3List,
	RandomString = G_RandomString,
	Substring = G_Substring,
	AsciiCharToString = G_AsciiCharToString,
	ConcatString = G_ConcatString,
	Vec3 = G_Vec3,

	-- debug
	DebugDump = G_DebugDump,
	DebugPlot = G_DebugPlot,

	-- lower-level prop access
	GetProperty = G_GetProperty,
	GetMeshFaces = G_GetMeshFaces,
	SetProperty = G_SetProperty,
	SetVisible = G_SetVisible,
	SetColor = G_SetColor,
	SetFill = G_SetFill,
	SetMeshFaceColor = G_SetMeshFaceColor,
	SetMeshFaces = G_SetMeshFaces,
	SetUniformScale = G_SetUniformScale,
	SetRadius = G_SetRadius,
	SetAngle = G_SetAngle,

	-- transform
	CombineTransform = G_CombineTransform,
	MakeTransform = G_MakeTransform,
	SplitTransform = G_SplitTransform,
	ApplyTransform = G_ApplyTransform,
	TransformObjects = G_TransformObjects,
}

function RenderPlotSeries(x, y, width, height, state, valueSelectorFn)
	local buf = state.buf
	local count = state.count
	local capacity = state.capacity
	local writePos = state.writePos

	-- Compute min/max for auto-scale
	local hasVal = false
	local minVal, maxVal = 0, 0
	for i = 0, count - 1 do
		local slotIdx = (writePos - count - 1 + i) % capacity + 1
		local v = buf[slotIdx]
		local sv = valueSelectorFn(v)
		TFASSERT(type(sv) == "number", "expected number from valueSelectorFn")
		if not hasVal then
			minVal = sv
			maxVal = sv
			hasVal = true
		else
			if sv < minVal then
				minVal = sv
			end
			if sv > maxVal then
				maxVal = sv
			end
		end
	end
	if maxVal - minVal < 1e-6 then
		local center = (minVal + maxVal) * 0.5
		minVal = center - 0.5
		maxVal = center + 0.5
	end
	local range = maxVal - minVal

	local render = function(offset, color)
		for i = 0, count - 1 do
			local slotIdx = (writePos - count - 1 + i) % capacity + 1
			local v = buf[slotIdx]
			local sv = valueSelectorFn(v)

			local norm = (
				((sv - minVal) / range) < 0 and 0 or (((sv - minVal) / range) > 1 and 1 or ((sv - minVal) / range))
			)
			local px = x + i
			local py = y + height - 1 - (norm * (height - 1)) // 1
			pix(px + offset, py + offset, color)
		end
	end

	render(0, 14)
	render(1, 15)
end

function DemoCustom_DrawHud(ctx)
	if gDebugHudLevel == 2 or gDebugHudLevel == 3 then
		for i, line in ipairs(gDemoHudLines) do
			print(line, 16, 2 + (i - 1) * 10, 14)
			print(line, 17, 3 + (i - 1) * 10, 15)
		end
		local plotX = 16
		local plotY = 2 + #gDemoHudLines * 10

		--print("" .. #gDemoHudPlots, 18, 100, 15)

		for _, entry in ipairs(gDemoHudPlots) do
			local state = entry.state
			local isVec3 = state.isVec3
			local plotW = 240 - plotX
			local plotH = 13

			if isVec3 then
				RenderPlotSeries(plotX, plotY, plotW, plotH, state, function(v)
					return v.x
				end)
				plotY = plotY + plotH + 1
				RenderPlotSeries(plotX, plotY, plotW, plotH, state, function(v)
					return v.y
				end)
				plotY = plotY + plotH + 1
				RenderPlotSeries(plotX, plotY, plotW, plotH, state, function(v)
					return v.z
				end)
			else
				RenderPlotSeries(plotX, plotY, plotW, plotH, state, function(v)
					return v
				end)
			end
			plotY = plotY + plotH + 1
		end
	end
end

-- 0 = none; disable hud.
-- 1 = debug palette only (with debug black & white disabled)
-- 2 = minimal (log / plots)
-- 3 = full (debug palette etc)
gDebugHudLevel = 2

-- debug starts paused & muted.
gDemoProjectDef.transport.isMuted = true
gDemoProjectDef.transport.isPlaying = false

local gDemoRuntime = Demo_LoadProject(gDemoProjectDef)
local gTransport = Transport_CreateSomatic(gDemoProjectDef.transport)

-- will access gTransport so must be after that
-- API layer for boulette interop

do
	local gBouletteProcedureQueue = {}
	local gBouletteObjectSelect = {
		active = false,
		currentObjectId = nil,
		hoveredObjectId = nil,
		requestId = 0,
		prevMouseLeft = false,
	}
	local gBouletteTic80DebugHudVisible = true

	local gBouletteBehaviorGraphWatches = {}
	local gBouletteBehaviorGraphWatchValues = {}
	local BOULETTE_GRAPH_WATCH_ITEM_LIMIT = 32

	function Boulette_QueueProcedure(fn)
		table.insert(gBouletteProcedureQueue, fn)
	end

	function Boulette_ApplyProcedureQueue()
		local queue = gBouletteProcedureQueue
		gBouletteProcedureQueue = {}
		for i = 1, #queue do
			local ok, err = pcall(queue[i])
			if not ok then
				trace("$boulette:error " .. tostring(err))
			end
		end
	end

	function Boulette_JsonBool(value)
		if value then
			return "true"
		end
		return "false"
	end

	function Boulette_JsonString(value)
		if value == nil then
			return "null"
		end
		local text = tostring(value)
		text = string.gsub(text, "\\", "\\\\")
		text = string.gsub(text, '"', '\\"')
		text = string.gsub(text, "\n", "\\n")
		text = string.gsub(text, "\r", "\\r")
		text = string.gsub(text, "\t", "\\t")
		return '"' .. text .. '"'
	end

	function Boulette_NormalizeObjectId(objectId)
		if objectId == nil or objectId == 0 or objectId == "" then
			return nil
		end
		return tostring(objectId)
	end

	function Boulette_TraceObjectSelect(kind, requestId, objectId)
		trace(
			string.format(
				'{"type":"boulette.objectSelect.%s","requestId":%d,"objectId":%s}',
				kind,
				tonumber(requestId) or 0,
				Boulette_JsonString(Boulette_NormalizeObjectId(objectId))
			)
		)
	end

	-- we could also leverage our expression evaluator's ability to return
	-- correct data shapes for native Lua tables (just pass back SOMATIC_CUE_SHEET directly).
	function Boulette_JsonNumber(value, fallback)
		local number = tonumber(value)
		if number == nil then
			number = fallback or 0
		end
		return tostring(number)
	end

	function Boulette_GraphWatchKey(behaviorId, portId)
		return tostring(behaviorId) .. "\31" .. tostring(portId)
	end

	function Boulette_JsonGraphWatchValue(value)
		local valueType = type(value)
		if value == nil then
			return "null"
		end
		if valueType == "number" then
			return Boulette_JsonNumber(value, 0)
		end
		if valueType == "boolean" then
			return Boulette_JsonBool(value)
		end
		if valueType == "string" then
			return Boulette_JsonString(value)
		end
		if valueType ~= "table" then
			return Boulette_JsonString(tostring(value))
		end

		if DemoGraph_IsStream(value) then
			local parts = {
				'{"kind":"stream","count":',
				tostring(#value.items),
				',"items":[',
			}
			local itemCount = min(#value.items, BOULETTE_GRAPH_WATCH_ITEM_LIMIT)
			for i = 1, itemCount do
				local item = value.items[i]
				if i > 1 then
					parts[#parts + 1] = ","
				end
				parts[#parts + 1] = '{"key":'
				parts[#parts + 1] = Boulette_JsonString(item.key)
				parts[#parts + 1] = ',"value":'
				parts[#parts + 1] = Boulette_JsonGraphWatchValue(item.value)
				parts[#parts + 1] = "}"
			end
			parts[#parts + 1] = '],"truncated":'
			parts[#parts + 1] = Boulette_JsonBool(#value.items > itemCount)
			parts[#parts + 1] = "}"
			return table.concat(parts)
		end

		if value.id ~= nil then
			local parts = {
				'{"kind":"object","id":',
				Boulette_JsonString(value.id),
			}
			if value.type ~= nil then
				parts[#parts + 1] = ',"type":'
				parts[#parts + 1] = Boulette_JsonString(value.type)
			end
			if value.materialId ~= nil then
				parts[#parts + 1] = ',"materialId":'
				parts[#parts + 1] = Boulette_JsonString(value.materialId)
			end
			if value.materialIndex ~= nil then
				parts[#parts + 1] = ',"materialIndex":'
				parts[#parts + 1] = Boulette_JsonNumber(value.materialIndex, 0)
			end
			parts[#parts + 1] = "}"
			return table.concat(parts)
		end

		local componentNames = { "x", "y", "z", "w" }
		local parts = { "{" }
		local componentCount = 0
		for i = 1, #componentNames do
			local name = componentNames[i]
			local component = value[name]
			if type(component) == "number" then
				if componentCount > 0 then
					parts[#parts + 1] = ","
				end
				parts[#parts + 1] = Boulette_JsonString(name)
				parts[#parts + 1] = ":"
				parts[#parts + 1] = Boulette_JsonNumber(component, 0)
				componentCount = componentCount + 1
			end
		end
		if componentCount == 0 then
			return '{"kind":"table"}'
		end
		parts[#parts + 1] = "}"
		return table.concat(parts)
	end

	function Boulette_CaptureBehaviorGraphWatch(scope, behaviorId, portId, value)
		local key = Boulette_GraphWatchKey(behaviorId, portId)
		if not gBouletteBehaviorGraphWatches[key] then
			return
		end
		local valuesByScope = gBouletteBehaviorGraphWatchValues[key]
		if valuesByScope == nil then
			valuesByScope = {}
			gBouletteBehaviorGraphWatchValues[key] = valuesByScope
		end
		valuesByScope[tostring(scope or "")] = Boulette_JsonGraphWatchValue(value)
	end

	function Boulette_BeginBehaviorGraphWatchFrame()
		gBouletteBehaviorGraphWatchValues = {}
	end

	function Boulette_BehaviorGraphWatchesJson()
		local parts = { "[" }
		local resultCount = 0
		for _, watch in ipairs(gBouletteBehaviorGraphWatches) do
			local key = Boulette_GraphWatchKey(watch.behaviorId, watch.portId)
			local valuesByScope = gBouletteBehaviorGraphWatchValues[key]
			local foundValue = false
			if valuesByScope ~= nil then
				for scope, valueJson in pairs(valuesByScope) do
					if resultCount > 0 then
						parts[#parts + 1] = ","
					end
					parts[#parts + 1] = '{"behaviorId":'
					parts[#parts + 1] = Boulette_JsonString(watch.behaviorId)
					parts[#parts + 1] = ',"portId":'
					parts[#parts + 1] = Boulette_JsonString(watch.portId)
					parts[#parts + 1] = ',"scope":'
					parts[#parts + 1] = Boulette_JsonString(scope)
					parts[#parts + 1] = ',"value":'
					parts[#parts + 1] = valueJson
					parts[#parts + 1] = "}"
					resultCount = resultCount + 1
					foundValue = true
				end
			end
			if not foundValue then
				if resultCount > 0 then
					parts[#parts + 1] = ","
				end
				parts[#parts + 1] = '{"behaviorId":'
				parts[#parts + 1] = Boulette_JsonString(watch.behaviorId)
				parts[#parts + 1] = ',"portId":'
				parts[#parts + 1] = Boulette_JsonString(watch.portId)
				parts[#parts + 1] = ',"scope":"","value":null}'
				resultCount = resultCount + 1
			end
		end
		parts[#parts + 1] = "]"
		return table.concat(parts)
	end

	function Boulette_TraceSomaticCueSheet()
		local cueSheet = SOMATIC_CUE_SHEET
		local parts = { '{"type":"boulette.somaticCueSheet","entries":[' }
		if type(cueSheet) == "table" then
			for i = 1, #cueSheet do
				local entry = cueSheet[i] or {}
				if i > 1 then
					parts[#parts + 1] = ","
				end
				parts[#parts + 1] = string.format(
					'{"order":%d,"pi":%s,"beat":%s,"icon":%s,"note":%s}',
					i - 1,
					Boulette_JsonNumber(entry.pi, 0),
					Boulette_JsonNumber(entry.beat, 0),
					Boulette_JsonString(entry.icon or ""),
					Boulette_JsonString(entry.note or "")
				)
			end
		end
		parts[#parts + 1] = "]}"
		trace(table.concat(parts))
	end

	function Boulette_TraceSomaticTransportMetadata()
		local state = somatic_get_raw_time()
		trace(
			string.format(
				'{"type":"boulette.somaticTransportMetadata","tempo":%s,"speed":%s,"rowsPerBeat":%s,"rowsPerPattern":%s,"songBeatCount":%s}',
				Boulette_JsonNumber(state.tempo, 0),
				Boulette_JsonNumber(state.speed, 0),
				Boulette_JsonNumber(state.rowsPerBeat, 0),
				Boulette_JsonNumber(state.rowsPerPattern, 0),
				Boulette_JsonNumber(state.songBeatCount, 0)
			)
		)
	end

	local gBoulettePosition2Pose = {
		active = false,
		objectId = nil,
		propertyPath = nil,
		requestId = 0,
		originalX = 0,
		originalY = 0,
		dx = 0,
		dy = 0,
		dragging = false,
		dragStartX = 0,
		dragStartY = 0,
		dragStartDx = 0,
		dragStartDy = 0,
		dragFineMovement = false,
		prevMouseLeft = false,
		showOutlines = true,
		showCrosshair = true,
	}

	local function Boulette_TracePosition2Pose(kind)
		local x = gBoulettePosition2Pose.originalX + (gBoulettePosition2Pose.dx or 0)
		local y = gBoulettePosition2Pose.originalY + (gBoulettePosition2Pose.dy or 0)
		trace(
			string.format(
				'{"type":"boulette.position2Pose.%s","requestId":%d,"x":%.3f,"y":%.3f}',
				kind,
				tonumber(gBoulettePosition2Pose.requestId) or 0,
				x,
				y
			)
		)
	end

	local function Boulette_ConstrainPosition2DeltaToAxis(dx, dy)
		if not key(63) then
			return dx, dy
		end
		if math.abs(dx) >= math.abs(dy) then
			return dx, 0
		end
		return 0, dy
	end

	local function Boulette_ResetPosition2Pose()
		gBoulettePosition2Pose.active = false
		gBoulettePosition2Pose.objectId = nil
		gBoulettePosition2Pose.propertyPath = nil
		gBoulettePosition2Pose.requestId = 0
		gBoulettePosition2Pose.originalX = 0
		gBoulettePosition2Pose.originalY = 0
		gBoulettePosition2Pose.dx = 0
		gBoulettePosition2Pose.dy = 0
		gBoulettePosition2Pose.dragging = false
		gBoulettePosition2Pose.dragFineMovement = false
		gBoulettePosition2Pose.prevMouseLeft = false
		gBoulettePosition2Pose.showOutlines = true
		gBoulettePosition2Pose.showCrosshair = true
	end

	function Boulette_BeginPosition2Pose(objectId, requestId, originalX, originalY, propertyPath)
		Boulette_QueueProcedure(function()
			gBoulettePosition2Pose.active = true
			gBoulettePosition2Pose.objectId = Boulette_NormalizeObjectId(objectId)
			gBoulettePosition2Pose.propertyPath = propertyPath ~= nil and tostring(propertyPath) or nil
			gBoulettePosition2Pose.requestId = tonumber(requestId) or 0
			gBoulettePosition2Pose.originalX = tonumber(originalX) or 0
			gBoulettePosition2Pose.originalY = tonumber(originalY) or 0
			gBoulettePosition2Pose.dx = 0
			gBoulettePosition2Pose.dy = 0
			gBoulettePosition2Pose.dragging = false
			gBoulettePosition2Pose.dragFineMovement = false
			gBoulettePosition2Pose.prevMouseLeft = false
			gBoulettePosition2Pose.showOutlines = true
			gBoulettePosition2Pose.showCrosshair = true
			Boulette_TracePosition2Pose("begin")
		end)
	end

	function Boulette_GetInteractivePosition2Value(propertyPath)
		if not gBoulettePosition2Pose.active or gBoulettePosition2Pose.objectId == nil then
			return nil
		end
		local activePropertyPath = gBoulettePosition2Pose.propertyPath
			or (gBoulettePosition2Pose.objectId .. ".position")
		if propertyPath ~= activePropertyPath then
			return nil
		end
		return {
			x = gBoulettePosition2Pose.originalX + gBoulettePosition2Pose.dx,
			y = gBoulettePosition2Pose.originalY + gBoulettePosition2Pose.dy,
		}
	end

	function Boulette_EndPosition2Pose(requestId)
		Boulette_QueueProcedure(function()
			local numericRequestId = tonumber(requestId) or 0
			if not gBoulettePosition2Pose.active then
				return
			end
			if numericRequestId ~= 0 and numericRequestId ~= gBoulettePosition2Pose.requestId then
				return
			end
			Boulette_TracePosition2Pose("finish")
			Boulette_ResetPosition2Pose()
		end)
	end

	function Boulette_CancelPosition2Pose(requestId)
		Boulette_QueueProcedure(function()
			local numericRequestId = tonumber(requestId) or 0
			if not gBoulettePosition2Pose.active then
				return
			end
			if numericRequestId ~= 0 and numericRequestId ~= gBoulettePosition2Pose.requestId then
				return
			end
			Boulette_TracePosition2Pose("cancel")
			Boulette_ResetPosition2Pose()
		end)
	end

	function Boulette_UpdatePosition2PoseInput()
		if not gBoulettePosition2Pose.active then
			return
		end

		if keyp(15) then
			gBoulettePosition2Pose.showOutlines = not gBoulettePosition2Pose.showOutlines
		end
		if keyp(3) then
			gBoulettePosition2Pose.showCrosshair = not gBoulettePosition2Pose.showCrosshair
		end
		if keyp(50) then
			Boulette_TracePosition2Pose("finish")
			Boulette_ResetPosition2Pose()
			return
		end
		if keyp(51) then
			Boulette_TracePosition2Pose("cancel")
			Boulette_ResetPosition2Pose()
			return
		end

		local mouseX, mouseY, leftDown = mouse()
		if leftDown and not gBoulettePosition2Pose.prevMouseLeft then
			gBoulettePosition2Pose.dragging = true
			gBoulettePosition2Pose.dragStartX = mouseX
			gBoulettePosition2Pose.dragStartY = mouseY
			gBoulettePosition2Pose.dragStartDx = gBoulettePosition2Pose.dx
			gBoulettePosition2Pose.dragStartDy = gBoulettePosition2Pose.dy
			gBoulettePosition2Pose.dragFineMovement = key(64)
		end

		if leftDown and gBoulettePosition2Pose.dragging then
			local fineMovement = key(64)
			if fineMovement ~= gBoulettePosition2Pose.dragFineMovement then
				gBoulettePosition2Pose.dragStartX = mouseX
				gBoulettePosition2Pose.dragStartY = mouseY
				gBoulettePosition2Pose.dragStartDx = gBoulettePosition2Pose.dx
				gBoulettePosition2Pose.dragStartDy = gBoulettePosition2Pose.dy
				gBoulettePosition2Pose.dragFineMovement = fineMovement
			end
			local multiplier = fineMovement and 0.2 or 1
			local nextDx = gBoulettePosition2Pose.dragStartDx
				+ (mouseX - gBoulettePosition2Pose.dragStartX) * multiplier
			local nextDy = gBoulettePosition2Pose.dragStartDy
				+ (mouseY - gBoulettePosition2Pose.dragStartY) * multiplier
			nextDx, nextDy = Boulette_ConstrainPosition2DeltaToAxis(nextDx, nextDy)
			if nextDx ~= gBoulettePosition2Pose.dx or nextDy ~= gBoulettePosition2Pose.dy then
				gBoulettePosition2Pose.dx = nextDx
				gBoulettePosition2Pose.dy = nextDy
				Boulette_TracePosition2Pose("value")
			end
		end

		if not leftDown and gBoulettePosition2Pose.prevMouseLeft then
			gBoulettePosition2Pose.dragging = false
		end
		gBoulettePosition2Pose.prevMouseLeft = leftDown
	end

	function Boulette_AddPosition2PoseOutlines(scene)
		if
			gBoulettePosition2Pose.active
			and gBoulettePosition2Pose.showOutlines
			and gBoulettePosition2Pose.objectId ~= nil
		then
			Scene_addOutline(scene, gBoulettePosition2Pose.objectId, 1, 1.0)
		end
	end

	function Boulette_DrawPosition2PoseOverlay()
		if not gBoulettePosition2Pose.active or not gBoulettePosition2Pose.showCrosshair then
			return
		end

		local cx = 240 / 2
		local cy = 136 / 2
		local x = cx + gBoulettePosition2Pose.dx
		local y = cy + gBoulettePosition2Pose.dy
		R_editorOverlayLine(cx, cy, x, y, 2)
		R_editorOverlayCrosshair(x, y, 4, 2)
	end

	local gBouletteSize2Pose = {
		active = false,
		objectId = nil,
		propertyPath = nil,
		requestId = 0,
		originalWidth = 0,
		originalHeight = 0,
		dw = 0,
		dh = 0,
		dragging = false,
		dragStartX = 0,
		dragStartY = 0,
		dragStartDw = 0,
		dragStartDh = 0,
		dragFineMovement = false,
		prevMouseLeft = false,
		showOutlines = true,
		showOverlay = true,
	}

	function Boulette_TraceSize2Pose(kind)
		local width = gBouletteSize2Pose.originalWidth + (gBouletteSize2Pose.dw or 0)
		local height = gBouletteSize2Pose.originalHeight + (gBouletteSize2Pose.dh or 0)
		trace(
			string.format(
				'{"type":"boulette.size2Pose.%s","requestId":%d,"x":%.3f,"y":%.3f}',
				kind,
				tonumber(gBouletteSize2Pose.requestId) or 0,
				width,
				height
			)
		)
	end

	function Boulette_ConstrainSize2DeltaToAspect(dw, dh)
		if not key(63) then
			return dw, dh
		end

		local originalWidth = gBouletteSize2Pose.originalWidth
		local originalHeight = gBouletteSize2Pose.originalHeight
		if originalWidth == 0 and originalHeight == 0 then
			local uniformDelta = math.abs(dw) >= math.abs(dh) and dw or dh
			return uniformDelta, uniformDelta
		end
		if originalWidth == 0 then
			return 0, dh
		end
		if originalHeight == 0 then
			return dw, 0
		end

		local targetWidth = originalWidth + dw
		local targetHeight = originalHeight + dh
		local scaleFromWidth = targetWidth / originalWidth
		local scaleFromHeight = targetHeight / originalHeight
		local scale = math.abs(scaleFromWidth - 1) >= math.abs(scaleFromHeight - 1) and scaleFromWidth
			or scaleFromHeight
		return originalWidth * scale - originalWidth, originalHeight * scale - originalHeight
	end

	function Boulette_ResetSize2Pose()
		gBouletteSize2Pose.active = false
		gBouletteSize2Pose.objectId = nil
		gBouletteSize2Pose.propertyPath = nil
		gBouletteSize2Pose.requestId = 0
		gBouletteSize2Pose.originalWidth = 0
		gBouletteSize2Pose.originalHeight = 0
		gBouletteSize2Pose.dw = 0
		gBouletteSize2Pose.dh = 0
		gBouletteSize2Pose.dragging = false
		gBouletteSize2Pose.dragFineMovement = false
		gBouletteSize2Pose.prevMouseLeft = false
		gBouletteSize2Pose.showOutlines = true
		gBouletteSize2Pose.showOverlay = true
	end

	function Boulette_BeginSize2Pose(objectId, requestId, originalWidth, originalHeight, propertyPath)
		Boulette_QueueProcedure(function()
			gBouletteSize2Pose.active = true
			gBouletteSize2Pose.objectId = Boulette_NormalizeObjectId(objectId)
			gBouletteSize2Pose.propertyPath = propertyPath ~= nil and tostring(propertyPath) or nil
			gBouletteSize2Pose.requestId = tonumber(requestId) or 0
			gBouletteSize2Pose.originalWidth = tonumber(originalWidth) or 0
			gBouletteSize2Pose.originalHeight = tonumber(originalHeight) or 0
			gBouletteSize2Pose.dw = 0
			gBouletteSize2Pose.dh = 0
			gBouletteSize2Pose.dragging = false
			gBouletteSize2Pose.dragFineMovement = false
			gBouletteSize2Pose.prevMouseLeft = false
			gBouletteSize2Pose.showOutlines = true
			gBouletteSize2Pose.showOverlay = true
			Boulette_TraceSize2Pose("begin")
		end)
	end

	function Boulette_GetInteractiveSize2Value(propertyPath)
		if not gBouletteSize2Pose.active or gBouletteSize2Pose.objectId == nil then
			return nil
		end
		local activePropertyPath = gBouletteSize2Pose.propertyPath or (gBouletteSize2Pose.objectId .. ".size")
		if propertyPath ~= activePropertyPath then
			return nil
		end
		return {
			x = gBouletteSize2Pose.originalWidth + gBouletteSize2Pose.dw,
			y = gBouletteSize2Pose.originalHeight + gBouletteSize2Pose.dh,
		}
	end

	function Boulette_EndSize2Pose(requestId)
		Boulette_QueueProcedure(function()
			local numericRequestId = tonumber(requestId) or 0
			if not gBouletteSize2Pose.active then
				return
			end
			if numericRequestId ~= 0 and numericRequestId ~= gBouletteSize2Pose.requestId then
				return
			end
			Boulette_TraceSize2Pose("finish")
			Boulette_ResetSize2Pose()
		end)
	end

	function Boulette_CancelSize2Pose(requestId)
		Boulette_QueueProcedure(function()
			local numericRequestId = tonumber(requestId) or 0
			if not gBouletteSize2Pose.active then
				return
			end
			if numericRequestId ~= 0 and numericRequestId ~= gBouletteSize2Pose.requestId then
				return
			end
			Boulette_TraceSize2Pose("cancel")
			Boulette_ResetSize2Pose()
		end)
	end

	function Boulette_UpdateSize2PoseInput()
		if not gBouletteSize2Pose.active then
			return
		end

		if keyp(15) then
			gBouletteSize2Pose.showOutlines = not gBouletteSize2Pose.showOutlines
		end
		if keyp(3) then
			gBouletteSize2Pose.showOverlay = not gBouletteSize2Pose.showOverlay
		end
		if keyp(50) then
			Boulette_TraceSize2Pose("finish")
			Boulette_ResetSize2Pose()
			return
		end
		if keyp(51) then
			Boulette_TraceSize2Pose("cancel")
			Boulette_ResetSize2Pose()
			return
		end

		local mouseX, mouseY, leftDown = mouse()
		if leftDown and not gBouletteSize2Pose.prevMouseLeft then
			gBouletteSize2Pose.dragging = true
			gBouletteSize2Pose.dragStartX = mouseX
			gBouletteSize2Pose.dragStartY = mouseY
			gBouletteSize2Pose.dragStartDw = gBouletteSize2Pose.dw
			gBouletteSize2Pose.dragStartDh = gBouletteSize2Pose.dh
			gBouletteSize2Pose.dragFineMovement = key(64)
		end

		if leftDown and gBouletteSize2Pose.dragging then
			local fineMovement = key(64)
			if fineMovement ~= gBouletteSize2Pose.dragFineMovement then
				gBouletteSize2Pose.dragStartX = mouseX
				gBouletteSize2Pose.dragStartY = mouseY
				gBouletteSize2Pose.dragStartDw = gBouletteSize2Pose.dw
				gBouletteSize2Pose.dragStartDh = gBouletteSize2Pose.dh
				gBouletteSize2Pose.dragFineMovement = fineMovement
			end
			local multiplier = fineMovement and 0.2 or 1
			local nextDw = gBouletteSize2Pose.dragStartDw + (mouseX - gBouletteSize2Pose.dragStartX) * multiplier
			local nextDh = gBouletteSize2Pose.dragStartDh + (mouseY - gBouletteSize2Pose.dragStartY) * multiplier
			nextDw, nextDh = Boulette_ConstrainSize2DeltaToAspect(nextDw, nextDh)
			if nextDw ~= gBouletteSize2Pose.dw or nextDh ~= gBouletteSize2Pose.dh then
				gBouletteSize2Pose.dw = nextDw
				gBouletteSize2Pose.dh = nextDh
				Boulette_TraceSize2Pose("value")
			end
		end

		if not leftDown and gBouletteSize2Pose.prevMouseLeft then
			gBouletteSize2Pose.dragging = false
		end
		gBouletteSize2Pose.prevMouseLeft = leftDown
	end

	function Boulette_AddSize2PoseOutlines(scene)
		if gBouletteSize2Pose.active and gBouletteSize2Pose.showOutlines and gBouletteSize2Pose.objectId ~= nil then
			Scene_addOutline(scene, gBouletteSize2Pose.objectId, 1, 1.0)
		end
	end

	function Boulette_DrawSize2PoseOverlay()
		if not gBouletteSize2Pose.active or not gBouletteSize2Pose.showOverlay then
			return
		end

		local x = 240 / 2
		local y = 136 / 2
		local w = gBouletteSize2Pose.originalWidth + gBouletteSize2Pose.dw
		local h = gBouletteSize2Pose.originalHeight + gBouletteSize2Pose.dh
		R_editorOverlayLine(x, y, x + w, y, 2)
		R_editorOverlayLine(x + w, y, x + w, y + h, 2)
		R_editorOverlayLine(x + w, y + h, x, y + h, 2)
		R_editorOverlayLine(x, y + h, x, y, 2)
		R_editorOverlayCrosshair(x + w, y + h, 4, 2)
	end

	function Boulette_CreateVec3PoseSession(config)
		local defaultValue = config.defaultValue or 0
		local normalize = config.normalize
		local resetGizmo = config.resetGizmo
		local beginFrame = config.beginFrame
		local updateInput = config.updateInput
		local draw = config.draw
		local traceType = config.traceType
		local propertyName = config.propertyName
		local state = {
			active = false,
			objectId = nil,
			requestId = 0,
			value = nil,
			gizmo = config.createGizmo(),
			prevMouseLeft = false,
		}

		local function tracePose(kind)
			local value = normalize(state.value)
			trace(
				string.format(
					'{"type":"boulette.%s.%s","requestId":%d,"x":%.6f,"y":%.6f,"z":%.6f}',
					traceType,
					kind,
					tonumber(state.requestId) or 0,
					value.x,
					value.y,
					value.z
				)
			)
		end

		local function resetPose()
			state.active = false
			state.objectId = nil
			state.requestId = 0
			state.value = nil
			resetGizmo(state.gizmo)
			state.prevMouseLeft = false
		end

		local function beginPose(objectId, requestId, initialX, initialY, initialZ)
			Boulette_QueueProcedure(function()
				state.active = true
				state.objectId = Boulette_NormalizeObjectId(objectId)
				state.requestId = tonumber(requestId) or 0
				state.value = {
					x = tonumber(initialX) or defaultValue,
					y = tonumber(initialY) or defaultValue,
					z = tonumber(initialZ) or defaultValue,
				}
				resetGizmo(state.gizmo)
				state.prevMouseLeft = false
				tracePose("begin")
			end)
		end

		local function beginRenderPasses()
			beginFrame(state.gizmo)
		end

		local function getInteractiveValue(propertyPath)
			if not state.active or state.objectId == nil then
				return nil
			end
			if propertyPath ~= state.objectId .. "." .. propertyName then
				return nil
			end
			return normalize(state.value)
		end

		local function finishPose(requestId)
			Boulette_QueueProcedure(function()
				local numericRequestId = tonumber(requestId) or 0
				if not state.active then
					return
				end
				if numericRequestId ~= 0 and numericRequestId ~= state.requestId then
					return
				end
				tracePose("finish")
				resetPose()
			end)
		end

		local function cancelPose(requestId)
			Boulette_QueueProcedure(function()
				local numericRequestId = tonumber(requestId) or 0
				if not state.active then
					return
				end
				if numericRequestId ~= 0 and numericRequestId ~= state.requestId then
					return
				end
				tracePose("cancel")
				resetPose()
			end)
		end

		local function updatePoseInput()
			if not state.active then
				return
			end

			if keyp(50) then
				tracePose("finish")
				resetPose()
				return
			end
			if keyp(51) then
				tracePose("cancel")
				resetPose()
				return
			end

			local mouseX, mouseY, leftDown = mouse()
			local nextValue = updateInput(
				state.gizmo,
				state.value,
				mouseX,
				mouseY,
				leftDown,
				leftDown and not state.prevMouseLeft,
				not leftDown and state.prevMouseLeft
			)
			if nextValue ~= nil then
				local current = normalize(state.value)
				if nextValue.x ~= current.x or nextValue.y ~= current.y or nextValue.z ~= current.z then
					state.value = nextValue
					tracePose("value")
				end
			end

			state.prevMouseLeft = leftDown
		end

		local function addOutlines(scene)
			if state.active and state.objectId ~= nil then
				Scene_addOutline(scene, state.objectId, 1, 1.0)
			end
		end

		local function noteRenderPass(scene, camera, viewport)
			if not state.active then
				return
			end
			draw(state.gizmo, scene, camera, viewport, state.objectId)
		end

		return {
			trace = tracePose,
			reset = resetPose,
			begin = beginPose,
			beginRenderPasses = beginRenderPasses,
			getInteractiveValue = getInteractiveValue,
			finish = finishPose,
			cancel = cancelPose,
			updateInput = updatePoseInput,
			addOutlines = addOutlines,
			noteRenderPass = noteRenderPass,
		}
	end

	do
		function Boulette_Position3GizmoCreate()
			return {
				handles = {},
				nextHandles = {},
				hoverAxis = nil,
				dragAxis = nil,
				dragStartMouseX = 0,
				dragStartMouseY = 0,
				dragStartValue = nil,
				dragStartAxisScreenX = 0,
				dragStartAxisScreenY = 0,
				dragStartAxisLength = 1,
				dragFineMovement = false,
			}
		end

		function Boulette_Position3GizmoReset(gizmo)
			gizmo.handles = {}
			gizmo.nextHandles = {}
			gizmo.hoverAxis = nil
			gizmo.dragAxis = nil
			gizmo.dragStartValue = nil
			gizmo.dragFineMovement = false
		end

		function Boulette_Position3GizmoBeginFrame(gizmo)
			gizmo.handles = gizmo.nextHandles
			gizmo.nextHandles = {}
		end

		function Boulette_Position3GizmoDistanceToSegmentSquared(px, py, x1, y1, x2, y2)
			local dx = x2 - x1
			local dy = y2 - y1
			local lengthSquared = dx * dx + dy * dy
			if lengthSquared <= 0.0001 then
				local tx = px - x1
				local ty = py - y1
				return tx * tx + ty * ty
			end
			local t = (
				(((px - x1) * dx + (py - y1) * dy) / lengthSquared) < 0 and 0
				or (
					(((px - x1) * dx + (py - y1) * dy) / lengthSquared) > 1 and 1
					or (((px - x1) * dx + (py - y1) * dy) / lengthSquared)
				)
			)
			local qx = x1 + dx * t
			local qy = y1 + dy * t
			local tx = px - qx
			local ty = py - qy
			return tx * tx + ty * ty
		end

		function Boulette_Position3GizmoFindHandle(gizmo, mouseX, mouseY)
			local bestHandle = nil
			local bestDistance = 1000000
			for i = 1, #gizmo.handles do
				local handle = gizmo.handles[i]
				local distance = Boulette_Position3GizmoDistanceToSegmentSquared(
					mouseX,
					mouseY,
					handle.sx0,
					handle.sy0,
					handle.sx1,
					handle.sy1
				)
				if distance < bestDistance then
					bestDistance = distance
					bestHandle = handle
				end
			end

			if bestHandle ~= nil and bestDistance <= 36 then
				return bestHandle
			end
			return nil
		end

		function Boulette_Position3GizmoAxisVector(axis)
			if axis == "x" then
				return 1, 0, 0
			end
			if axis == "y" then
				return 0, 1, 0
			end
			return 0, 0, 1
		end

		function Boulette_Position3GizmoAxisTone(axis, hoverAxis, dragAxis)
			if dragAxis == axis then
				return 1.0
			end
			if hoverAxis == axis then
				return 0.75
			end
			if axis == "x" then
				return 0.25
			end
			if axis == "y" then
				return 0.5
			end
			return 0.9
		end

		function Boulette_Position3GizmoBeginDrag(gizmo, handle, mouseX, mouseY, value)
			gizmo.dragAxis = handle.axis
			gizmo.dragStartMouseX = mouseX
			gizmo.dragStartMouseY = mouseY
			gizmo.dragStartValue = Boulette_NormalizePosition3(value)
			gizmo.dragStartAxisScreenX = handle.sx1 - handle.sx0
			gizmo.dragStartAxisScreenY = handle.sy1 - handle.sy0
			gizmo.dragStartAxisLength = handle.axisLength
			gizmo.dragFineMovement = key(64)
		end

		function Boulette_Position3GizmoEndDrag(gizmo)
			gizmo.dragAxis = nil
			gizmo.dragStartValue = nil
			gizmo.dragFineMovement = false
		end

		function Boulette_Position3GizmoDragValue(gizmo, value, mouseX, mouseY)
			if gizmo.dragAxis == nil then
				return nil
			end

			local axisScreenX = gizmo.dragStartAxisScreenX
			local axisScreenY = gizmo.dragStartAxisScreenY
			local screenLengthSquared = axisScreenX * axisScreenX + axisScreenY * axisScreenY
			if screenLengthSquared <= 0.0001 then
				return nil
			end

			local fineMovement = key(64)
			if fineMovement ~= gizmo.dragFineMovement then
				gizmo.dragStartMouseX = mouseX
				gizmo.dragStartMouseY = mouseY
				gizmo.dragStartValue = Boulette_NormalizePosition3(value)
				gizmo.dragFineMovement = fineMovement
			end

			local mouseDx = mouseX - gizmo.dragStartMouseX
			local mouseDy = mouseY - gizmo.dragStartMouseY
			local screenLength = sqrt(screenLengthSquared)
			local projectedPixels = (mouseDx * axisScreenX + mouseDy * axisScreenY) / screenLength
			local worldDelta = projectedPixels / screenLength * gizmo.dragStartAxisLength
			if fineMovement then
				worldDelta = worldDelta * 0.2
			end

			local axisX, axisY, axisZ = Boulette_Position3GizmoAxisVector(gizmo.dragAxis)
			local startValue = gizmo.dragStartValue
			return {
				x = startValue.x + axisX * worldDelta,
				y = startValue.y + axisY * worldDelta,
				z = startValue.z + axisZ * worldDelta,
			}
		end

		function Boulette_Position3GizmoUpdateInput(
			gizmo,
			value,
			mouseX,
			mouseY,
			leftDown,
			leftJustPressed,
			leftJustReleased
		)
			local hoveredHandle = Boulette_Position3GizmoFindHandle(gizmo, mouseX, mouseY)
			gizmo.hoverAxis = hoveredHandle ~= nil and hoveredHandle.axis or nil

			if leftJustPressed and hoveredHandle ~= nil then
				Boulette_Position3GizmoBeginDrag(gizmo, hoveredHandle, mouseX, mouseY, value)
			end

			local nextValue = nil
			if leftDown then
				nextValue = Boulette_Position3GizmoDragValue(gizmo, value, mouseX, mouseY)
			end

			if leftJustReleased then
				Boulette_Position3GizmoEndDrag(gizmo)
			end

			return nextValue
		end

		function Boulette_Position3GizmoDraw(gizmo, scene, camera, viewport, objectId)
			if scene == nil or camera == nil or objectId == nil then
				return
			end

			local object = Scene_getObjectById(scene, objectId)
			if object == nil or object.transform == nil then
				return
			end

			local transform = object.transform
			local x = transform.x or 0
			local y = transform.y or 0
			local z = transform.z or 0
			local originSx, originSy, _, _, _, camZ = R_projectPoint3D(camera, viewport, x, y, z)
			if originSx == nil then
				return
			end

			local axisLength = 36
			if camera.kind == "perspective" and camZ ~= nil then
				axisLength = max(4, camZ * 0.25)
			end

			local viewportX = viewport and viewport.x or 0
			local viewportY = viewport and viewport.y or 0
			local viewportWidth = viewport and viewport.width or 240
			local viewportHeight = viewport and viewport.height or 136
			R_pushClipRect(viewportX, viewportY, viewportWidth, viewportHeight)
			R_editorOverlayCrosshair(originSx, originSy, 3, 2)

			local axes = { "x", "y", "z" }
			for i = 1, #axes do
				local axis = axes[i]
				local axisX, axisY, axisZ = Boulette_Position3GizmoAxisVector(axis)
				local endX = x + axisX * axisLength
				local endY = y + axisY * axisLength
				local endZ = z + axisZ * axisLength
				local endSx, endSy = R_projectPoint3D(camera, viewport, endX, endY, endZ)
				if endSx ~= nil then
					R_line3D_editorOverlay(camera, viewport, x, y, z, endX, endY, endZ, 0.01)
					R_editorOverlayLine(originSx, originSy, endSx, endSy, axis == gizmo.hoverAxis and 2 or 1)
					R_editorOverlayCrosshair(endSx, endSy, 2, axis == gizmo.hoverAxis and 2 or 1)
					local handles = gizmo.nextHandles
					handles[#handles + 1] = {
						axis = axis,
						sx0 = originSx,
						sy0 = originSy,
						sx1 = endSx,
						sy1 = endSy,
						axisLength = axisLength,
					}
				end
			end

			R_popClipRect()
		end
	end

	do
		local function normalize(value)
			value = value or {}
			return {
				x = value.x or value.posX or 0,
				y = value.y or value.posY or 0,
				z = value.z or value.posZ or 0,
			}
		end

		local pose = Boulette_CreateVec3PoseSession({
			traceType = "position3Pose",
			propertyName = "position",
			defaultValue = 0,
			normalize = normalize,
			createGizmo = Boulette_Position3GizmoCreate,
			resetGizmo = Boulette_Position3GizmoReset,
			beginFrame = Boulette_Position3GizmoBeginFrame,
			updateInput = Boulette_Position3GizmoUpdateInput,
			draw = Boulette_Position3GizmoDraw,
		})

		Boulette_NormalizePosition3 = normalize
		Boulette_TracePosition3Pose = pose.trace
		Boulette_ResetPosition3Pose = pose.reset
		Boulette_BeginPosition3Pose = pose.begin
		Boulette_BeginPosition3PoseRenderPasses = pose.beginRenderPasses
		Boulette_GetInteractivePosition3Value = pose.getInteractiveValue
		Boulette_EndPosition3Pose = pose.finish
		Boulette_CancelPosition3Pose = pose.cancel
		Boulette_UpdatePosition3PoseInput = pose.updateInput
		Boulette_AddPosition3PoseOutlines = pose.addOutlines
		Boulette_NotePosition3PoseRenderPass = pose.noteRenderPass
	end

	do
		function Boulette_Scale3GizmoCreate()
			return {
				handles = {},
				nextHandles = {},
				hoverAxis = nil,
				dragAxis = nil,
				dragStartMouseX = 0,
				dragStartMouseY = 0,
				dragStartValue = nil,
				dragStartAxisScreenX = 0,
				dragStartAxisScreenY = 0,
				dragFineMovement = false,
			}
		end

		function Boulette_Scale3GizmoReset(gizmo)
			gizmo.handles = {}
			gizmo.nextHandles = {}
			gizmo.hoverAxis = nil
			gizmo.dragAxis = nil
			gizmo.dragStartValue = nil
			gizmo.dragFineMovement = false
		end

		function Boulette_Scale3GizmoBeginFrame(gizmo)
			gizmo.handles = gizmo.nextHandles
			gizmo.nextHandles = {}
		end

		function Boulette_Scale3GizmoDistanceToSegmentSquared(px, py, x1, y1, x2, y2)
			return Boulette_Position3GizmoDistanceToSegmentSquared(px, py, x1, y1, x2, y2)
		end

		function Boulette_Scale3GizmoFindHandle(gizmo, mouseX, mouseY)
			local bestHandle = nil
			local bestDistance = 1000000
			for i = 1, #gizmo.handles do
				local handle = gizmo.handles[i]
				local distance = Boulette_Scale3GizmoDistanceToSegmentSquared(
					mouseX,
					mouseY,
					handle.sx0,
					handle.sy0,
					handle.sx1,
					handle.sy1
				)
				if distance < bestDistance then
					bestDistance = distance
					bestHandle = handle
				end
			end

			if bestHandle ~= nil and bestDistance <= 36 then
				return bestHandle
			end
			return nil
		end

		function Boulette_Scale3GizmoAxisVector(axis)
			return Boulette_Position3GizmoAxisVector(axis)
		end

		function Boulette_Scale3GizmoAxisTone(axis, hoverAxis, dragAxis)
			return Boulette_Position3GizmoAxisTone(axis, hoverAxis, dragAxis)
		end

		function Boulette_Scale3GizmoBeginDrag(gizmo, handle, mouseX, mouseY, value)
			gizmo.dragAxis = handle.axis
			gizmo.dragStartMouseX = mouseX
			gizmo.dragStartMouseY = mouseY
			gizmo.dragStartValue = Boulette_NormalizeScale3(value)
			gizmo.dragStartAxisScreenX = handle.sx1 - handle.sx0
			gizmo.dragStartAxisScreenY = handle.sy1 - handle.sy0
			gizmo.dragFineMovement = key(64)
		end

		function Boulette_Scale3GizmoEndDrag(gizmo)
			gizmo.dragAxis = nil
			gizmo.dragStartValue = nil
			gizmo.dragFineMovement = false
		end

		function Boulette_Scale3GizmoComponent(value, axis)
			if axis == "x" then
				return value.x
			end
			if axis == "y" then
				return value.y
			end
			return value.z
		end

		function Boulette_Scale3GizmoDragValue(gizmo, value, mouseX, mouseY)
			if gizmo.dragAxis == nil or gizmo.dragStartValue == nil then
				return nil
			end

			local axisScreenX = gizmo.dragStartAxisScreenX
			local axisScreenY = gizmo.dragStartAxisScreenY
			local screenLengthSquared = axisScreenX * axisScreenX + axisScreenY * axisScreenY
			if screenLengthSquared <= 0.0001 then
				return nil
			end

			local fineMovement = key(64)
			if fineMovement ~= gizmo.dragFineMovement then
				gizmo.dragStartMouseX = mouseX
				gizmo.dragStartMouseY = mouseY
				gizmo.dragStartValue = Boulette_NormalizeScale3(value)
				gizmo.dragFineMovement = fineMovement
			end

			local mouseDx = mouseX - gizmo.dragStartMouseX
			local mouseDy = mouseY - gizmo.dragStartMouseY
			local screenLength = sqrt(screenLengthSquared)
			local projectedPixels = (mouseDx * axisScreenX + mouseDy * axisScreenY) / screenLength
			local amount = projectedPixels / screenLength
			if fineMovement then
				amount = amount * 0.2
			end

			local startValue = gizmo.dragStartValue
			local component = Boulette_Scale3GizmoComponent(startValue, gizmo.dragAxis)
			local delta = amount * max(1, abs(component))
			local nextValue = { x = startValue.x, y = startValue.y, z = startValue.z }
			if gizmo.dragAxis == "x" then
				nextValue.x = max(0.001, startValue.x + delta)
			elseif gizmo.dragAxis == "y" then
				nextValue.y = max(0.001, startValue.y + delta)
			else
				nextValue.z = max(0.001, startValue.z + delta)
			end
			return nextValue
		end

		function Boulette_Scale3GizmoUpdateInput(
			gizmo,
			value,
			mouseX,
			mouseY,
			leftDown,
			leftJustPressed,
			leftJustReleased
		)
			local hoveredHandle = Boulette_Scale3GizmoFindHandle(gizmo, mouseX, mouseY)
			gizmo.hoverAxis = hoveredHandle ~= nil and hoveredHandle.axis or nil

			if leftJustPressed and hoveredHandle ~= nil then
				Boulette_Scale3GizmoBeginDrag(gizmo, hoveredHandle, mouseX, mouseY, value)
			end

			local nextValue = nil
			if leftDown then
				nextValue = Boulette_Scale3GizmoDragValue(gizmo, value, mouseX, mouseY)
			end

			if leftJustReleased then
				Boulette_Scale3GizmoEndDrag(gizmo)
			end

			return nextValue
		end

		function Boulette_Scale3GizmoDraw(gizmo, scene, camera, viewport, objectId)
			if scene == nil or camera == nil or objectId == nil then
				return
			end

			local object = Scene_getObjectById(scene, objectId)
			if object == nil or object.transform == nil then
				return
			end

			local transform = object.transform
			local x = transform.x or 0
			local y = transform.y or 0
			local z = transform.z or 0
			local originSx, originSy, _, _, _, camZ = R_projectPoint3D(camera, viewport, x, y, z)
			if originSx == nil then
				return
			end

			local axisLength = 36
			if camera.kind == "perspective" and camZ ~= nil then
				axisLength = max(4, camZ * 0.25)
			end

			local viewportX = viewport and viewport.x or 0
			local viewportY = viewport and viewport.y or 0
			local viewportWidth = viewport and viewport.width or 240
			local viewportHeight = viewport and viewport.height or 136
			R_pushClipRect(viewportX, viewportY, viewportWidth, viewportHeight)
			R_editorOverlayCrosshair(originSx, originSy, 3, 2)

			local axes = { "x", "y", "z" }
			for i = 1, #axes do
				local axis = axes[i]
				local axisX, axisY, axisZ = Boulette_Scale3GizmoAxisVector(axis)
				local endX = x + axisX * axisLength
				local endY = y + axisY * axisLength
				local endZ = z + axisZ * axisLength
				local endSx, endSy = R_projectPoint3D(camera, viewport, endX, endY, endZ)
				if endSx ~= nil then
					R_line3D_editorOverlay(camera, viewport, x, y, z, endX, endY, endZ, 0.01)
					R_editorOverlayLine(originSx, originSy, endSx, endSy, axis == gizmo.hoverAxis and 2 or 1)
					R_editorOverlayCrosshair(endSx, endSy, 3, axis == gizmo.hoverAxis and 2 or 1)
					local handles = gizmo.nextHandles
					handles[#handles + 1] = {
						axis = axis,
						sx0 = originSx,
						sy0 = originSy,
						sx1 = endSx,
						sy1 = endSy,
					}
				end
			end

			R_popClipRect()
		end
	end

	do
		local function normalize(value)
			value = value or {}
			return {
				x = value.x or value.scaleX or 1,
				y = value.y or value.scaleY or 1,
				z = value.z or value.scaleZ or 1,
			}
		end

		local pose = Boulette_CreateVec3PoseSession({
			traceType = "scale3Pose",
			propertyName = "scale",
			defaultValue = 1,
			normalize = normalize,
			createGizmo = Boulette_Scale3GizmoCreate,
			resetGizmo = Boulette_Scale3GizmoReset,
			beginFrame = Boulette_Scale3GizmoBeginFrame,
			updateInput = Boulette_Scale3GizmoUpdateInput,
			draw = Boulette_Scale3GizmoDraw,
		})

		Boulette_NormalizeScale3 = normalize
		Boulette_TraceScale3Pose = pose.trace
		Boulette_ResetScale3Pose = pose.reset
		Boulette_BeginScale3Pose = pose.begin
		Boulette_BeginScale3PoseRenderPasses = pose.beginRenderPasses
		Boulette_GetInteractiveScale3Value = pose.getInteractiveValue
		Boulette_EndScale3Pose = pose.finish
		Boulette_CancelScale3Pose = pose.cancel
		Boulette_UpdateScale3PoseInput = pose.updateInput
		Boulette_AddScale3PoseOutlines = pose.addOutlines
		Boulette_NoteScale3PoseRenderPass = pose.noteRenderPass
	end

	do
		function Boulette_Rotation3GizmoCreate()
			return {
				handles = {},
				nextHandles = {},
				hoverAxis = nil,
				dragAxis = nil,
				dragStartMouseAngle = 0,
				dragStartValue = nil,
				dragFineMovement = false,
			}
		end

		function Boulette_Rotation3GizmoReset(gizmo)
			gizmo.handles = {}
			gizmo.nextHandles = {}
			gizmo.hoverAxis = nil
			gizmo.dragAxis = nil
			gizmo.dragStartValue = nil
			gizmo.dragFineMovement = false
		end

		function Boulette_Rotation3GizmoBeginFrame(gizmo)
			gizmo.handles = gizmo.nextHandles
			gizmo.nextHandles = {}
		end

		function Boulette_Rotation3GizmoDistanceToSegmentSquared(px, py, x1, y1, x2, y2)
			local dx = x2 - x1
			local dy = y2 - y1
			local lengthSquared = dx * dx + dy * dy
			if lengthSquared <= 0.0001 then
				local tx = px - x1
				local ty = py - y1
				return tx * tx + ty * ty
			end
			local t = (
				(((px - x1) * dx + (py - y1) * dy) / lengthSquared) < 0 and 0
				or (
					(((px - x1) * dx + (py - y1) * dy) / lengthSquared) > 1 and 1
					or (((px - x1) * dx + (py - y1) * dy) / lengthSquared)
				)
			)
			local qx = x1 + dx * t
			local qy = y1 + dy * t
			local tx = px - qx
			local ty = py - qy
			return tx * tx + ty * ty
		end

		function Boulette_Rotation3GizmoFindHandle(gizmo, mouseX, mouseY)
			local bestHandle = nil
			local bestDistance = 1000000
			for i = 1, #gizmo.handles do
				local handle = gizmo.handles[i]
				local distance = Boulette_Rotation3GizmoDistanceToSegmentSquared(
					mouseX,
					mouseY,
					handle.sx0,
					handle.sy0,
					handle.sx1,
					handle.sy1
				)
				if distance < bestDistance then
					bestDistance = distance
					bestHandle = handle
				end
			end

			if bestHandle ~= nil and bestDistance <= 49 then
				return bestHandle
			end
			return nil
		end

		function Boulette_Rotation3GizmoAxisTone(axis, hoverAxis, dragAxis)
			if dragAxis == axis then
				return 1.0
			end
			if hoverAxis == axis then
				return 0.75
			end
			if axis == "x" then
				return 0.25
			end
			if axis == "y" then
				return 0.5
			end
			return 0.9
		end

		function Boulette_Rotation3GizmoMouseAngle(handle, mouseX, mouseY)
			return atan2(mouseY - handle.centerY, mouseX - handle.centerX)
		end

		function Boulette_Rotation3GizmoNormalizeDelta(delta)
			while delta > 3.141592653589793 do
				delta = delta - 6.283185307179586
			end
			while delta < -3.141592653589793 do
				delta = delta + 6.283185307179586
			end
			return delta
		end

		function Boulette_Rotation3GizmoBeginDrag(gizmo, handle, mouseX, mouseY, value)
			gizmo.dragAxis = handle.axis
			gizmo.dragStartMouseAngle = Boulette_Rotation3GizmoMouseAngle(handle, mouseX, mouseY)
			gizmo.dragStartValue = Boulette_NormalizeRotation3(value)
			gizmo.dragFineMovement = key(64)
		end

		function Boulette_Rotation3GizmoEndDrag(gizmo)
			gizmo.dragAxis = nil
			gizmo.dragStartValue = nil
			gizmo.dragFineMovement = false
		end

		function Boulette_Rotation3GizmoDragValue(gizmo, value, mouseX, mouseY)
			if gizmo.dragAxis == nil or gizmo.dragStartValue == nil then
				return nil
			end

			local handle = nil
			for i = 1, #gizmo.handles do
				if gizmo.handles[i].axis == gizmo.dragAxis then
					handle = gizmo.handles[i]
					break
				end
			end
			if handle == nil then
				return nil
			end

			local angle = Boulette_Rotation3GizmoMouseAngle(handle, mouseX, mouseY)
			local fineMovement = key(64)
			if fineMovement ~= gizmo.dragFineMovement then
				gizmo.dragStartMouseAngle = angle
				gizmo.dragStartValue = Boulette_NormalizeRotation3(value)
				gizmo.dragFineMovement = fineMovement
			end

			local delta = Boulette_Rotation3GizmoNormalizeDelta(angle - gizmo.dragStartMouseAngle)
			if fineMovement then
				delta = delta * 0.2
			end

			local startValue = gizmo.dragStartValue
			local nextValue = { x = startValue.x, y = startValue.y, z = startValue.z }
			if gizmo.dragAxis == "x" then
				nextValue.x = startValue.x + delta
			elseif gizmo.dragAxis == "y" then
				nextValue.y = startValue.y + delta
			else
				nextValue.z = startValue.z + delta
			end
			return nextValue
		end

		function Boulette_Rotation3GizmoUpdateInput(
			gizmo,
			value,
			mouseX,
			mouseY,
			leftDown,
			leftJustPressed,
			leftJustReleased
		)
			local hoveredHandle = Boulette_Rotation3GizmoFindHandle(gizmo, mouseX, mouseY)
			gizmo.hoverAxis = hoveredHandle ~= nil and hoveredHandle.axis or nil

			if leftJustPressed and hoveredHandle ~= nil then
				Boulette_Rotation3GizmoBeginDrag(gizmo, hoveredHandle, mouseX, mouseY, value)
			end

			local nextValue = nil
			if leftDown then
				nextValue = Boulette_Rotation3GizmoDragValue(gizmo, value, mouseX, mouseY)
			end

			if leftJustReleased then
				Boulette_Rotation3GizmoEndDrag(gizmo)
			end

			return nextValue
		end

		function Boulette_Rotation3GizmoRingPoint(axis, x, y, z, radius, angle)
			local c = cos(angle)
			local s = sin(angle)
			if axis == "x" then
				return x, y + c * radius, z + s * radius
			end
			if axis == "y" then
				return x + c * radius, y, z + s * radius
			end
			return x + c * radius, y + s * radius, z
		end

		function Boulette_Rotation3GizmoDrawRing(gizmo, camera, viewport, axis, x, y, z, radius, centerSx, centerSy)
			local segments = 28
			local previousX = nil
			local previousY = nil
			local previousZ = nil
			local previousSx = nil
			local previousSy = nil
			local tone = Boulette_Rotation3GizmoAxisTone(axis, gizmo.hoverAxis, gizmo.dragAxis)
			for i = 0, segments do
				local angle = 6.283185307179586 * i / segments
				local px, py, pz = Boulette_Rotation3GizmoRingPoint(axis, x, y, z, radius, angle)
				local sx, sy = R_projectPoint3D(camera, viewport, px, py, pz)
				if previousX ~= nil and sx ~= nil and previousSx ~= nil then
					R_line3D_editorOverlay(camera, viewport, previousX, previousY, previousZ, px, py, pz, 0.01)
					R_editorOverlayLine(previousSx, previousSy, sx, sy, axis == gizmo.hoverAxis and 2 or 1)
					gizmo.nextHandles[#gizmo.nextHandles + 1] = {
						axis = axis,
						sx0 = previousSx,
						sy0 = previousSy,
						sx1 = sx,
						sy1 = sy,
						centerX = centerSx,
						centerY = centerSy,
					}
				end
				previousX = px
				previousY = py
				previousZ = pz
				previousSx = sx
				previousSy = sy
			end
		end

		function Boulette_Rotation3GizmoDraw(gizmo, scene, camera, viewport, objectId)
			if scene == nil or camera == nil or objectId == nil then
				return
			end

			local object = Scene_getObjectById(scene, objectId)
			if object == nil or object.transform == nil then
				return
			end

			local transform = object.transform
			local x = transform.x or 0
			local y = transform.y or 0
			local z = transform.z or 0
			local originSx, originSy, _, _, _, camZ = R_projectPoint3D(camera, viewport, x, y, z)
			if originSx == nil then
				return
			end

			local radius = 28
			if camera.kind == "perspective" and camZ ~= nil then
				radius = max(4, camZ * 0.18)
			end

			local viewportX = viewport and viewport.x or 0
			local viewportY = viewport and viewport.y or 0
			local viewportWidth = viewport and viewport.width or 240
			local viewportHeight = viewport and viewport.height or 136
			R_pushClipRect(viewportX, viewportY, viewportWidth, viewportHeight)
			R_editorOverlayCrosshair(originSx, originSy, 3, 2)

			Boulette_Rotation3GizmoDrawRing(gizmo, camera, viewport, "x", x, y, z, radius, originSx, originSy)
			Boulette_Rotation3GizmoDrawRing(gizmo, camera, viewport, "y", x, y, z, radius, originSx, originSy)
			Boulette_Rotation3GizmoDrawRing(gizmo, camera, viewport, "z", x, y, z, radius, originSx, originSy)

			R_popClipRect()
		end
	end

	do
		local function normalize(value)
			value = value or {}
			return {
				x = value.x or value.rotX or value.rotXradians or 0,
				y = value.y or value.rotY or value.rotYradians or 0,
				z = value.z or value.rotZ or value.rotZradians or 0,
			}
		end

		local pose = Boulette_CreateVec3PoseSession({
			traceType = "rotation3Pose",
			propertyName = "rotation",
			defaultValue = 0,
			normalize = normalize,
			createGizmo = Boulette_Rotation3GizmoCreate,
			resetGizmo = Boulette_Rotation3GizmoReset,
			beginFrame = Boulette_Rotation3GizmoBeginFrame,
			updateInput = Boulette_Rotation3GizmoUpdateInput,
			draw = Boulette_Rotation3GizmoDraw,
		})

		Boulette_NormalizeRotation3 = normalize
		Boulette_TraceRotation3Pose = pose.trace
		Boulette_ResetRotation3Pose = pose.reset
		Boulette_BeginRotation3Pose = pose.begin
		Boulette_BeginRotation3PoseRenderPasses = pose.beginRenderPasses
		Boulette_GetInteractiveRotation3Value = pose.getInteractiveValue
		Boulette_EndRotation3Pose = pose.finish
		Boulette_CancelRotation3Pose = pose.cancel
		Boulette_UpdateRotation3PoseInput = pose.updateInput
		Boulette_AddRotation3PoseOutlines = pose.addOutlines
		Boulette_NoteRotation3PoseRenderPass = pose.noteRenderPass
	end

	do
		function Boulette_NormalizePose3(pose)
			pose = pose or {}
			return {
				rotXradians = pose.rotXradians or pose.rotX or 0,
				rotYradians = pose.rotYradians or pose.rotY or 0,
				rotZradians = pose.rotZradians or pose.rotZ or 0,
				posX = pose.posX or pose.x or 0,
				posY = pose.posY or pose.y or 0,
				posZ = pose.posZ or pose.z or 0,
			}
		end

		function Boulette_CameraToPose3(camera)
			camera = camera or {}
			return {
				rotXradians = camera.rotX or 0,
				rotYradians = camera.rotY or 0,
				rotZradians = camera.rotZ or 0,
				posX = camera.x or 0,
				posY = camera.y or 0,
				posZ = camera.z or 0,
			}
		end

		function Boulette_ApplyPose3ToCamera(camera, pose)
			camera.x = pose.posX
			camera.y = pose.posY
			camera.z = pose.posZ
			camera.rotX = pose.rotXradians
			camera.rotY = pose.rotYradians
			camera.rotZ = pose.rotZradians
		end

		function Boulette_CloneCamera(camera)
			camera = camera or {}
			return {
				kind = camera.kind or "perspective",
				x = camera.x or 0,
				y = camera.y or 0,
				z = camera.z or 0,
				rotX = camera.rotX or 0,
				rotY = camera.rotY or 0,
				rotZ = camera.rotZ or 0,
				fov = camera.fov or (55 * (3.141592653589793 / 180)),
				nearZ = camera.nearZ or 1,
				farZ = camera.farZ or 1000,
				projectionOffset = SafeVec2(camera.projectionOffset),
			}
		end

		function Boulette_CameraPoseMovementScale()
			local scale = 1
			if key(64) then
				scale = scale * 0.2
			end
			return scale
		end

		function Boulette_CameraPoseAxes(pose)
			local cosX = cos(pose.rotXradians)
			local sinX = sin(pose.rotXradians)
			local cosY = cos(pose.rotYradians)
			local sinY = sin(pose.rotYradians)
			local cosZ = cos(pose.rotZradians)
			local sinZ = sin(pose.rotZradians)
			local rightX, rightY, rightZ = Rotate3WithTrig(1, 0, 0, cosX, sinX, cosY, sinY, cosZ, sinZ)
			local upX, upY, upZ = Rotate3WithTrig(0, 1, 0, cosX, sinX, cosY, sinY, cosZ, sinZ)
			local forwardX, forwardY, forwardZ = Rotate3WithTrig(0, 0, 1, cosX, sinX, cosY, sinY, cosZ, sinZ)
			return rightX, rightY, rightZ, upX, upY, upZ, forwardX, forwardY, forwardZ
		end

		function Boulette_MakeCameraPoseRenderContext(camera, viewport)
			camera = camera or {}
			viewport = viewport or {}
			local context = {
				kind = camera.kind or "perspective",
				fov = camera.fov or (55 * (3.141592653589793 / 180)),
				nearZ = camera.nearZ or 1,
				farZ = camera.farZ or 1000,
				x = viewport.x or 0,
				y = viewport.y or 0,
				width = viewport.width or 240,
				height = viewport.height or 136,
				projectionOffsetX = camera.projectionOffset and camera.projectionOffset.x or 0,
				projectionOffsetY = camera.projectionOffset and camera.projectionOffset.y or 0,
			}
			context.area = context.width * context.height
			return context
		end

		function Boulette_CameraPoseViewportCenter(context)
			context = context or {}
			return (context.x or 0) + (context.width or 240) * 0.5 + (context.projectionOffsetX or 0),
				(context.y or 0) + (context.height or 136) * 0.5 + (context.projectionOffsetY or 0)
		end

		function Boulette_CameraPoseDepthIsFilled(depth)
			return depth ~= nil and depth ~= -1e30
		end

		function Boulette_CameraPoseDepthAt(x, y, context)
			local sx = x // 1
			local sy = y // 1
			local x0 = (context and context.x or 0) // 1
			local y0 = (context and context.y or 0) // 1
			local x1 = x0 + ((context and context.width or 240) // 1)
			local y1 = y0 + ((context and context.height or 136) // 1)
			if sx < x0 or sx >= x1 or sy < y0 or sy >= y1 then
				return nil
			end
			local depth = R_getDepthAt(sx, sy)
			return Boulette_CameraPoseDepthIsFilled(depth) and depth or nil
		end

		function Boulette_FindCameraPoseOrbitDepth(context)
			context = context or {}
			local cx, cy = Boulette_CameraPoseViewportCenter(context)
			local depth = Boulette_CameraPoseDepthAt(cx, cy, context)
			if depth ~= nil then
				return depth
			end

			local maxRadius = min((context.width or 240) * 0.5, (context.height or 136) * 0.5)
			local radius = 2
			while radius <= maxRadius do
				depth = Boulette_CameraPoseDepthAt(cx - radius, cy, context)
					or Boulette_CameraPoseDepthAt(cx + radius, cy, context)
					or Boulette_CameraPoseDepthAt(cx, cy - radius, context)
					or Boulette_CameraPoseDepthAt(cx, cy + radius, context)
					or Boulette_CameraPoseDepthAt(cx - radius, cy - radius, context)
					or Boulette_CameraPoseDepthAt(cx + radius, cy - radius, context)
					or Boulette_CameraPoseDepthAt(cx - radius, cy + radius, context)
					or Boulette_CameraPoseDepthAt(cx + radius, cy + radius, context)
				if depth ~= nil then
					return depth
				end
				radius = radius < 8 and radius + 2 or radius + 8
			end

			return nil
		end

		function Boulette_CameraPoseFallbackOrbitDistance(context)
			local nearZ = context and context.nearZ or 1
			return max(nearZ * 12, 72)
		end

		function Boulette_CameraPoseOrbitDistanceFromDepth(context, depth)
			if depth == nil then
				return Boulette_CameraPoseFallbackOrbitDistance(context)
			end
			if context ~= nil and context.kind ~= "perspective" then
				return max(-depth, 1)
			end
			if depth <= 0.0001 then
				return Boulette_CameraPoseFallbackOrbitDistance(context)
			end
			return max(1 / depth, 1)
		end

		function Boulette_BeginCameraPoseOrbit(controlState, pose, context)
			local depth = nil
			if R_getDepthAt ~= nil then
				depth = Boulette_FindCameraPoseOrbitDepth(context)
			end
			local distance = Boulette_CameraPoseOrbitDistanceFromDepth(context, depth)
			local _, _, _, _, _, _, forwardX, forwardY, forwardZ = Boulette_CameraPoseAxes(pose)
			controlState.orbitAnchor = {
				x = pose.posX + forwardX * distance,
				y = pose.posY + forwardY * distance,
				z = pose.posZ + forwardZ * distance,
			}
			controlState.orbitDistance = distance
		end

		function Boulette_ClearCameraPoseOrbit(controlState)
			controlState.orbitAnchor = nil
			controlState.orbitDistance = nil
		end

		function Boulette_ApplyCameraPoseControls(pose, controlState, context, input)
			local movementScale = Boulette_CameraPoseMovementScale()
			local changed = false
			local dx = input.dx or 0
			local dy = input.dy or 0
			local scrollY = input.scrollY or 0

			if input.resetRoll then
				pose.rotZradians = 0
				changed = true
			end

			if input.middleJustPressed then
				Boulette_BeginCameraPoseOrbit(controlState, pose, context)
			elseif not input.middleDown then
				Boulette_ClearCameraPoseOrbit(controlState)
			end

			if input.middleDrag and controlState.orbitAnchor ~= nil and controlState.orbitDistance ~= nil then
				pose.rotYradians = pose.rotYradians + dx * 0.015 * movementScale
				pose.rotXradians = pose.rotXradians + dy * 0.015 * movementScale
				local _, _, _, _, _, _, forwardX, forwardY, forwardZ = Boulette_CameraPoseAxes(pose)
				local anchor = controlState.orbitAnchor
				local distance = controlState.orbitDistance
				pose.posX = anchor.x - forwardX * distance
				pose.posY = anchor.y - forwardY * distance
				pose.posZ = anchor.z - forwardZ * distance
				changed = changed or dx ~= 0 or dy ~= 0
			elseif input.ctrlDown and (input.leftDrag or input.rightDrag) then
				pose.rotZradians = pose.rotZradians + dx * 0.015 * movementScale
				changed = changed or dx ~= 0
			elseif input.leftDrag then
				pose.rotYradians = pose.rotYradians + dx * 0.015 * movementScale
				pose.rotXradians = pose.rotXradians + dy * 0.015 * movementScale
				changed = changed or dx ~= 0 or dy ~= 0
			elseif input.rightDrag then
				local rightX, rightY, rightZ, upX, upY, upZ = Boulette_CameraPoseAxes(pose)
				local truck = -dx * movementScale
				local pedestal = dy * movementScale
				pose.posX = pose.posX + rightX * truck + upX * pedestal
				pose.posY = pose.posY + rightY * truck + upY * pedestal
				pose.posZ = pose.posZ + rightZ * truck + upZ * pedestal
				changed = changed or dx ~= 0 or dy ~= 0
			end

			if scrollY ~= 0 then
				local _, _, _, _, _, _, forwardX, forwardY, forwardZ = Boulette_CameraPoseAxes(pose)
				local dolly = scrollY * 12 * movementScale
				pose.posX = pose.posX + forwardX * dolly
				pose.posY = pose.posY + forwardY * dolly
				pose.posZ = pose.posZ + forwardZ * dolly
				changed = true
			end

			return changed
		end
	end

	do
		local gBouletteCameraPose = {
			active = false,
			cameraId = nil,
			requestId = 0,
			pose = nil,
			prevMouseX = 0,
			prevMouseY = 0,
			prevLeftDown = false,
			prevMiddleDown = false,
			prevRightDown = false,
			renderContext = nil,
			nextRenderContext = nil,
			orbitAnchor = nil,
			orbitDistance = nil,
		}

		function Boulette_TraceCameraPose(kind)
			local pose = Boulette_NormalizePose3(gBouletteCameraPose.pose)
			trace(
				string.format(
					'{"type":"boulette.pose3Camera.%s","requestId":%d,"posX":%.6f,"posY":%.6f,"posZ":%.6f,"rotXradians":%.6f,"rotYradians":%.6f,"rotZradians":%.6f}',
					kind,
					tonumber(gBouletteCameraPose.requestId) or 0,
					pose.posX,
					pose.posY,
					pose.posZ,
					pose.rotXradians,
					pose.rotYradians,
					pose.rotZradians
				)
			)
		end

		function Boulette_ResetCameraPose()
			gBouletteCameraPose.active = false
			gBouletteCameraPose.cameraId = nil
			gBouletteCameraPose.requestId = 0
			gBouletteCameraPose.pose = nil
			gBouletteCameraPose.prevLeftDown = false
			gBouletteCameraPose.prevMiddleDown = false
			gBouletteCameraPose.prevRightDown = false
			gBouletteCameraPose.renderContext = nil
			gBouletteCameraPose.nextRenderContext = nil
			gBouletteCameraPose.orbitAnchor = nil
			gBouletteCameraPose.orbitDistance = nil
		end

		function Boulette_BeginPose3Camera(cameraId, requestId, pose)
			Boulette_QueueProcedure(function()
				gBouletteCameraPose.active = true
				gBouletteCameraPose.cameraId = cameraId ~= nil and tostring(cameraId) or nil
				gBouletteCameraPose.requestId = tonumber(requestId) or 0
				gBouletteCameraPose.pose = Boulette_NormalizePose3(pose)
				gBouletteCameraPose.prevLeftDown = false
				gBouletteCameraPose.prevMiddleDown = false
				gBouletteCameraPose.prevRightDown = false
				gBouletteCameraPose.renderContext = nil
				gBouletteCameraPose.nextRenderContext = nil
				gBouletteCameraPose.orbitAnchor = nil
				gBouletteCameraPose.orbitDistance = nil
				Boulette_TraceCameraPose("begin")
			end)
		end

		function Boulette_BeginPose3CameraRenderPasses()
			gBouletteCameraPose.renderContext = gBouletteCameraPose.nextRenderContext
			gBouletteCameraPose.nextRenderContext = nil
		end

		function Boulette_NotePose3CameraRenderPass(cameraId, camera, viewport)
			if not gBouletteCameraPose.active or cameraId == nil or camera == nil then
				return
			end
			if tostring(cameraId) ~= gBouletteCameraPose.cameraId then
				return
			end

			local context = Boulette_MakeCameraPoseRenderContext(camera, viewport)
			local current = gBouletteCameraPose.nextRenderContext
			if current == nil or context.area >= current.area then
				gBouletteCameraPose.nextRenderContext = context
			end
		end

		function Boulette_GetInteractivePose3Value(propertyPath)
			if not gBouletteCameraPose.active or gBouletteCameraPose.cameraId == nil then
				return nil
			end
			if propertyPath ~= gBouletteCameraPose.cameraId .. ".pose" then
				return nil
			end
			return Boulette_NormalizePose3(gBouletteCameraPose.pose)
		end

		function Boulette_EndPose3Camera(requestId)
			Boulette_QueueProcedure(function()
				local numericRequestId = tonumber(requestId) or 0
				if not gBouletteCameraPose.active then
					return
				end
				if numericRequestId ~= 0 and numericRequestId ~= gBouletteCameraPose.requestId then
					return
				end
				Boulette_TraceCameraPose("finish")
				Boulette_ResetCameraPose()
			end)
		end

		function Boulette_CancelPose3Camera(requestId)
			Boulette_QueueProcedure(function()
				local numericRequestId = tonumber(requestId) or 0
				if not gBouletteCameraPose.active then
					return
				end
				if numericRequestId ~= 0 and numericRequestId ~= gBouletteCameraPose.requestId then
					return
				end
				Boulette_TraceCameraPose("cancel")
				Boulette_ResetCameraPose()
			end)
		end

		function Boulette_UpdatePose3CameraInput()
			if not gBouletteCameraPose.active then
				return
			end

			if keyp(50) then
				Boulette_TraceCameraPose("finish")
				Boulette_ResetCameraPose()
				return
			end
			if keyp(51) then
				Boulette_TraceCameraPose("cancel")
				Boulette_ResetCameraPose()
				return
			end

			local pose = Boulette_NormalizePose3(gBouletteCameraPose.pose)
			local mouseX, mouseY, leftDown, middleDown, rightDown, _, scrollY = mouse()
			local leftDrag = leftDown and gBouletteCameraPose.prevLeftDown
			local middleDrag = middleDown and gBouletteCameraPose.prevMiddleDown
			local rightDrag = rightDown and gBouletteCameraPose.prevRightDown
			local dx = (leftDrag or middleDrag or rightDrag) and mouseX - gBouletteCameraPose.prevMouseX or 0
			local dy = (leftDrag or middleDrag or rightDrag) and mouseY - gBouletteCameraPose.prevMouseY or 0
			local changed =
				Boulette_ApplyCameraPoseControls(pose, gBouletteCameraPose, gBouletteCameraPose.renderContext, {
					dx = dx,
					dy = dy,
					scrollY = scrollY,
					leftDrag = leftDrag,
					middleDown = middleDown,
					middleJustPressed = middleDown and not gBouletteCameraPose.prevMiddleDown,
					middleDrag = middleDrag,
					rightDrag = rightDrag,
					ctrlDown = key(63),
					resetRoll = keyp(18),
				})

			gBouletteCameraPose.pose = pose
			if changed then
				Boulette_TraceCameraPose("value")
			end

			gBouletteCameraPose.prevMouseX = mouseX
			gBouletteCameraPose.prevMouseY = mouseY
			gBouletteCameraPose.prevLeftDown = leftDown
			gBouletteCameraPose.prevMiddleDown = middleDown
			gBouletteCameraPose.prevRightDown = rightDown
		end

		function Boulette_DrawDottedFrame(x0, y0, x1, y1, style)
			for x = x0, x1 do
				if x % 2 == 0 then
					R_setEditorOverlayPixel(x, y0, style)
					R_setEditorOverlayPixel(x, y1, style)
				end
			end
			for y = y0, y1 do
				if y % 2 == 0 then
					R_setEditorOverlayPixel(x0, y, style)
					R_setEditorOverlayPixel(x1, y, style)
				end
			end
		end

		-- draws a dotted (dot = 1 pixel) horizontal line at given stride
		function Boulette_DrawDottedHLine(x0, y, x1, stride, style)
			for x = x0, x1, stride do
				R_setEditorOverlayPixel(x, y, style)
			end
		end

		function Boulette_DrawDottedVLine(x, y0, y1, stride, style)
			for y = y0, y1, stride do
				R_setEditorOverlayPixel(x, y, style)
			end
		end

		function Boulette_DrawPose3CameraOverlay()
			if not gBouletteCameraPose.active then
				return
			end

			local context = gBouletteCameraPose.nextRenderContext or gBouletteCameraPose.renderContext or {}
			local x0 = context.x or 0
			local y0 = context.y or 0
			local width = context.width or 240
			local height = context.height or 136
			local cx = x0 + width / 2
			local cy = y0 + height / 2
			R_editorOverlayCrosshair(cx, cy, 3, 2)

			-- some prefer instead of a crosshair in the center,
			-- a small frame that frames the center point.
			-- that "small frame" is a fraction of the total viewport size
			local frameSize = 0.15
			local frameWidth = width * frameSize
			local frameHeight = height * frameSize
			local frameLeft = cx - frameWidth / 2
			local frameTop = cy - frameHeight / 2
			local frameRight = cx + frameWidth / 2
			local frameBottom = cy + frameHeight / 2
			-- don't draw the whole frame, just the corners (3 pixels each corner)
			R_setEditorOverlayPixel(frameLeft, frameTop, 2)
			R_setEditorOverlayPixel(frameLeft + 1, frameTop, 2)
			R_setEditorOverlayPixel(frameLeft + 2, frameTop, 2)
			R_setEditorOverlayPixel(frameLeft, frameTop + 1, 2)
			R_setEditorOverlayPixel(frameLeft, frameTop + 2, 2)
			R_setEditorOverlayPixel(frameRight, frameTop, 2)
			R_setEditorOverlayPixel(frameRight - 1, frameTop, 2)
			R_setEditorOverlayPixel(frameRight - 2, frameTop, 2)
			R_setEditorOverlayPixel(frameRight, frameTop + 1, 2)
			R_setEditorOverlayPixel(frameRight, frameTop + 2, 2)
			R_setEditorOverlayPixel(frameLeft, frameBottom, 2)
			R_setEditorOverlayPixel(frameLeft + 1, frameBottom, 2)
			R_setEditorOverlayPixel(frameLeft + 2, frameBottom, 2)
			R_setEditorOverlayPixel(frameLeft, frameBottom - 1, 2)
			R_setEditorOverlayPixel(frameLeft, frameBottom - 2, 2)
			R_setEditorOverlayPixel(frameRight, frameBottom, 2)
			R_setEditorOverlayPixel(frameRight - 1, frameBottom, 2)
			R_setEditorOverlayPixel(frameRight - 2, frameBottom, 2)
			R_setEditorOverlayPixel(frameRight, frameBottom - 1, 2)
			R_setEditorOverlayPixel(frameRight, frameBottom - 2, 2)

			-- render framing guides:
			-- lines at thirds
			local style = 1
			local x1 = x0 + width
			local y1 = y0 + height
			local stride = 4
			Boulette_DrawDottedVLine(x0 + width / 3, y0, y1, stride, style)
			Boulette_DrawDottedVLine(x0 + width * 2 / 3, y0, y1, stride, style)
			Boulette_DrawDottedHLine(x0, y0 + height / 3, x1, stride, style)
			Boulette_DrawDottedHLine(x0, y0 + height * 2 / 3, x1, stride, style)

			-- render horizon guide at center:
			Boulette_DrawDottedHLine(x0, cy, x1, 16, style)
		end
	end

	do
		local gBouletteFreeView = {
			active = false,
			controlsActive = false,
			passes = {},
			visiblePassIds = {},
			prevMouseX = 0,
			prevMouseY = 0,
			prevLeftDown = false,
			prevMiddleDown = false,
			prevRightDown = false,
		}

		function Boulette_FreeViewResetInput()
			gBouletteFreeView.prevLeftDown = false
			gBouletteFreeView.prevMiddleDown = false
			gBouletteFreeView.prevRightDown = false
			for _, passState in pairs(gBouletteFreeView.passes) do
				passState.orbitAnchor = nil
				passState.orbitDistance = nil
			end
		end

		function Boulette_EndFreeView()
			gBouletteFreeView.active = false
			gBouletteFreeView.controlsActive = false
			gBouletteFreeView.passes = {}
			gBouletteFreeView.visiblePassIds = {}
			Boulette_FreeViewResetInput()
		end

		function Boulette_BeginFreeView(mouseX, mouseY)
			gBouletteFreeView.active = true
			gBouletteFreeView.controlsActive = false
			gBouletteFreeView.prevMouseX = mouseX or 0
			gBouletteFreeView.prevMouseY = mouseY or 0
			Boulette_FreeViewResetInput()
		end

		function Boulette_FreeViewApplyInputToCamera(passState, input)
			local camera = passState.camera
			if camera == nil then
				return false
			end

			local pose = Boulette_CameraToPose3(camera)
			local changed = Boulette_ApplyCameraPoseControls(pose, passState, passState.context, input)
			if changed then
				Boulette_ApplyPose3ToCamera(camera, pose)
			end
			return changed
		end

		function Boulette_UpdateFreeViewInput()
			local mouseX, mouseY, leftDown, middleDown, rightDown, _, scrollY = mouse()
			local altDown = key(65)

			if keyp(6) then
				if gBouletteFreeView.active then
					Boulette_EndFreeView()
				else
					Boulette_BeginFreeView(mouseX, mouseY)
				end
				return
			end

			if not gBouletteFreeView.active then
				if altDown then
					Boulette_BeginFreeView(mouseX, mouseY)
				else
					return
				end
			end

			if not altDown then
				if gBouletteFreeView.controlsActive then
					gBouletteFreeView.controlsActive = false
					gBouletteFreeView.prevMouseX = mouseX
					gBouletteFreeView.prevMouseY = mouseY
					Boulette_FreeViewResetInput()
				end
				return
			end

			if not gBouletteFreeView.controlsActive then
				gBouletteFreeView.controlsActive = true
				gBouletteFreeView.prevMouseX = mouseX
				gBouletteFreeView.prevMouseY = mouseY
				Boulette_FreeViewResetInput()
				return
			end

			local leftDrag = leftDown and gBouletteFreeView.prevLeftDown
			local middleDrag = middleDown and gBouletteFreeView.prevMiddleDown
			local rightDrag = rightDown and gBouletteFreeView.prevRightDown
			local dx = (leftDrag or middleDrag or rightDrag) and mouseX - gBouletteFreeView.prevMouseX or 0
			local dy = (leftDrag or middleDrag or rightDrag) and mouseY - gBouletteFreeView.prevMouseY or 0
			local input = {
				dx = dx,
				dy = dy,
				scrollY = scrollY,
				leftDrag = leftDrag,
				middleDown = middleDown,
				middleJustPressed = middleDown and not gBouletteFreeView.prevMiddleDown,
				middleDrag = middleDrag,
				rightDrag = rightDrag,
				ctrlDown = key(63),
				resetRoll = keyp(18),
			}

			for _, passState in pairs(gBouletteFreeView.passes) do
				Boulette_FreeViewApplyInputToCamera(passState, input)
			end

			gBouletteFreeView.prevMouseX = mouseX
			gBouletteFreeView.prevMouseY = mouseY
			gBouletteFreeView.prevLeftDown = leftDown
			gBouletteFreeView.prevMiddleDown = middleDown
			gBouletteFreeView.prevRightDown = rightDown
		end

		function Boulette_BeginFreeViewRenderPasses()
			gBouletteFreeView.visiblePassIds = {}
		end

		function Boulette_GetFreeViewCamera(passId, camera)
			if not gBouletteFreeView.active then
				return camera
			end

			local passKey = tostring(passId or "")
			local passState = gBouletteFreeView.passes[passKey]
			if passState == nil then
				passState = {
					camera = Boulette_CloneCamera(camera),
					context = nil,
					orbitAnchor = nil,
					orbitDistance = nil,
				}
				gBouletteFreeView.passes[passKey] = passState
			end
			return passState.camera
		end

		function Boulette_NoteFreeViewRenderPass(passId, camera, viewport)
			if not gBouletteFreeView.active then
				return
			end

			local passKey = tostring(passId or "")
			local passState = gBouletteFreeView.passes[passKey]
			if passState == nil then
				return
			end

			passState.context = Boulette_MakeCameraPoseRenderContext(camera, viewport)
			gBouletteFreeView.visiblePassIds[#gBouletteFreeView.visiblePassIds + 1] = passKey
		end

		function Boulette_DrawFreeViewHud()
			if not gBouletteFreeView.active then
				return
			end
			if ((time() // 250) % 2) ~= 0 then
				return
			end

			for i = 1, #gBouletteFreeView.visiblePassIds do
				local passState = gBouletteFreeView.passes[gBouletteFreeView.visiblePassIds[i]]
				local context = passState ~= nil and passState.context or nil
				if context ~= nil then
					print("F", context.x + context.width - 8, context.y + 3, 15)
				end
			end
		end
	end

	function MetricsJson(metrics)
		if metrics == nil then
			return '"metrics":null'
		end
		return string.format(
			'"metrics":{"nodesEvaluated":%d,"dynamicMaterialsUsed":%d,"staticMaterialsUsed":%d,"trianglesRendered":%d}',
			Boulette_JsonNumber(metrics.nodesEvaluated, 0),
			Boulette_JsonNumber(metrics.dynamicMaterialsUsed, 0),
			Boulette_JsonNumber(metrics.staticMaterialsUsed, 0),
			Boulette_JsonNumber(metrics.trianglesRendered, 0)
		)
	end

	-- high-frequency call
	function Boulette_PushRuntimeStatus(t, runtime)
		local tempo = t.tempo
		local speed = t.speed
		local bpm = tempo * 6 / speed
		local fps = 0
		if t.wallDeltaMillis ~= nil and t.wallDeltaMillis > 0 then
			fps = 1000 / t.wallDeltaMillis
		end

		local behaviorGraphWatchesJson = ""
		behaviorGraphWatchesJson = ',"behaviorGraphWatches":' .. Boulette_BehaviorGraphWatchesJson()
		trace(
			string.format(
				'{"type":"boulette.runtime","beat":%.6f,"millis":%.3f,"bpm":%.6f,"fps":%.3f,"isPlaying":%s,"isMuted":%s%s,%s}',
				t.demoBeats,
				t.demoMillis,
				bpm,
				fps,
				Boulette_JsonBool(t.isPlaying == true),
				Boulette_JsonBool(t.isMuted == true),
				behaviorGraphWatchesJson,
				MetricsJson(runtime.frameMetrics)
			)
		)
	end

	-- available to Boulette...

	function Boulette_RequestSomaticCueSheet()
		Boulette_TraceSomaticCueSheet()
	end

	function Boulette_RequestSomaticTransportMetadata()
		Boulette_TraceSomaticTransportMetadata()
	end

	function Boulette_ApplyTic80DebugHudState()
		R_setEditorOverlayEnabled(gBouletteTic80DebugHudVisible)
	end

	function Boulette_ToggleTic80DebugHud()
		Boulette_QueueProcedure(function()
			gBouletteTic80DebugHudVisible = not gBouletteTic80DebugHudVisible
			trace(string.format("toggleTic80DebugHud:%s", Boulette_JsonBool(gBouletteTic80DebugHudVisible))) -- for editor integration
			Boulette_ApplyTic80DebugHudState()
		end)
	end

	function Boulette_SetEditorHighlights(highlights)
		Boulette_QueueProcedure(function()
			if gDemoRuntime ~= nil then
				gDemoRuntime.editorHighlights = highlights or {}
			end
		end)
	end

	function Boulette_SetBehaviorGraphWatches(watches)
		Boulette_QueueProcedure(function()
			gBouletteBehaviorGraphWatches = {}
			gBouletteBehaviorGraphWatchValues = {}
			for _, watch in ipairs(watches or {}) do
				if type(watch) == "table" and watch.behaviorId ~= nil and watch.portId ~= nil then
					local normalized = {
						behaviorId = tostring(watch.behaviorId),
						portId = tostring(watch.portId),
					}
					gBouletteBehaviorGraphWatches[#gBouletteBehaviorGraphWatches + 1] = normalized
					gBouletteBehaviorGraphWatches[Boulette_GraphWatchKey(normalized.behaviorId, normalized.portId)] =
						true
				end
			end
		end)
	end

	function Boulette_BeginSceneObjectSelect(currentObjectId, requestId)
		Boulette_QueueProcedure(function()
			gBouletteObjectSelect.active = true
			gBouletteObjectSelect.currentObjectId = Boulette_NormalizeObjectId(currentObjectId)
			gBouletteObjectSelect.hoveredObjectId = nil
			gBouletteObjectSelect.requestId = tonumber(requestId) or 0
			gBouletteObjectSelect.prevMouseLeft = false
			Boulette_TraceObjectSelect("begin", gBouletteObjectSelect.requestId, gBouletteObjectSelect.currentObjectId)
		end)
	end

	function Boulette_CancelSceneObjectSelect(requestId)
		Boulette_QueueProcedure(function()
			local numericRequestId = tonumber(requestId) or 0
			if not gBouletteObjectSelect.active then
				return
			end
			if numericRequestId ~= 0 and numericRequestId ~= gBouletteObjectSelect.requestId then
				return
			end
			Boulette_TraceObjectSelect("cancel", gBouletteObjectSelect.requestId, nil)
			gBouletteObjectSelect.active = false
			gBouletteObjectSelect.currentObjectId = nil
			gBouletteObjectSelect.hoveredObjectId = nil
			gBouletteObjectSelect.requestId = 0
			gBouletteObjectSelect.prevMouseLeft = false
		end)
	end

	function Boulette_UpdateSceneObjectSelectionInput()
		if not gBouletteObjectSelect.active then
			return
		end

		local mouseX, mouseY, leftDown = mouse()
		local hoveredObjectId = nil
		if mouseX >= 0 and mouseX < 240 and mouseY >= 0 and mouseY < 136 then
			hoveredObjectId = Boulette_NormalizeObjectId(R_getObjectIdAt(mouseX, mouseY))
		end

		if hoveredObjectId ~= gBouletteObjectSelect.hoveredObjectId then
			gBouletteObjectSelect.hoveredObjectId = hoveredObjectId
			Boulette_TraceObjectSelect("hover", gBouletteObjectSelect.requestId, hoveredObjectId)
		end

		if leftDown and not gBouletteObjectSelect.prevMouseLeft then
			local selectedObjectId = hoveredObjectId
			if selectedObjectId ~= nil then
				Boulette_TraceObjectSelect("commit", gBouletteObjectSelect.requestId, selectedObjectId)
			else
				Boulette_TraceObjectSelect("cancel", gBouletteObjectSelect.requestId, nil)
			end
			gBouletteObjectSelect.active = false
			gBouletteObjectSelect.currentObjectId = nil
			gBouletteObjectSelect.hoveredObjectId = nil
			gBouletteObjectSelect.requestId = 0
		end
		gBouletteObjectSelect.prevMouseLeft = leftDown
	end

	function Boulette_AddSceneObjectSelectionOutlines(scene)
		if gBouletteObjectSelect.active then
			local hoveredObjectId = gBouletteObjectSelect.hoveredObjectId
			local currentObjectId = gBouletteObjectSelect.currentObjectId
			if hoveredObjectId ~= nil and hoveredObjectId ~= currentObjectId then
				Scene_addOutline(scene, hoveredObjectId, 1, 0.6)
			end
			if currentObjectId ~= nil then
				Scene_addOutline(scene, currentObjectId, 1, 1.0)
			end
		end

		Boulette_AddPosition2PoseOutlines(scene)
		Boulette_AddSize2PoseOutlines(scene)
		Boulette_AddPosition3PoseOutlines(scene)
		Boulette_AddScale3PoseOutlines(scene)
		Boulette_AddRotation3PoseOutlines(scene)
	end

	function Boulette_SetPlaying(enabled)
		Boulette_QueueProcedure(function()
			gDemoProjectDef.transport.isPlaying = enabled == true
			Transport_SetOptions(gTransport, { isPlaying = gDemoProjectDef.transport.isPlaying })
		end)
	end

	function Boulette_SetMuted(enabled)
		Boulette_QueueProcedure(function()
			gDemoProjectDef.transport.isMuted = enabled == true
			Transport_SetOptions(gTransport, { isMuted = gDemoProjectDef.transport.isMuted })
		end)
	end

	function Boulette_SeekBeat(beat)
		Boulette_QueueProcedure(function()
			Transport_Seek(gTransport, tonumber(beat) or 0)
		end)
	end

	function Boulette_Stop()
		Boulette_QueueProcedure(function()
			gDemoProjectDef.transport.isPlaying = false
			Transport_SetOptions(gTransport, { isPlaying = false })
			--Transport_Seek(gTransport, 0)
		end)
	end

	function Boulette_ReplaceProject(projectDef, revision, p)
		if p then
			Boulette_QueueProcedure(function()
				gTransport = Demo_ApplyProjectPatch(gDemoRuntime, gDemoProjectDef, gTransport, p)
				trace(string.format('{"type":"boulette.projectApplied","revision":%d}', tonumber(revision) or 0))
			end)
			return
		end
		Boulette_QueueProcedure(function()
			-- retain state that WE own.
			local previousTime = gTransport ~= nil and gTransport.time or nil
			if previousTime ~= nil then
				projectDef.transport.isPlaying = previousTime.isPlaying == true
				projectDef.transport.isMuted = previousTime.isMuted == true
			end

			local transportOptions = CloneTable(projectDef.transport)
			-- somatic song is the source of truth for most transport; don't override.

			local runtime = Demo_LoadProject(projectDef)
			local transport = Transport_CreateSomatic(transportOptions)

			gDemoProjectDef = projectDef
			gDemoRuntime = runtime
			gTransport = transport

			trace(string.format('{"type":"boulette.projectApplied","revision":%d}', tonumber(revision) or 0))
		end)
	end
end -- do

function TIC()
	--collectgarbage()

	Boulette_ApplyProcedureQueue()

	local t = Transport_Update(gTransport)
	Boulette_UpdateSceneObjectSelectionInput()
	Boulette_UpdatePosition2PoseInput()
	Boulette_UpdateSize2PoseInput()
	Boulette_UpdatePosition3PoseInput()
	Boulette_UpdateScale3PoseInput()
	Boulette_UpdateRotation3PoseInput()
	Boulette_UpdatePose3CameraInput()
	Boulette_UpdateFreeViewInput()

	if keyp(16) then
		gDebugHudLevel = (gDebugHudLevel + 1) % 4
		-- when debug hud is disabled, this also disables underlying editor overlay,
		-- which reserves 2 palette slots for black & white. so by disabling
		-- debug hud, you can see the full 16-color palette used.
		R_setEditorOverlayEnabled(gDebugHudLevel >= 2)
	end
	if keyp(13) then
		gDemoProjectDef.transport.isMuted = not gDemoProjectDef.transport.isMuted
		t = Transport_SetOptions(gTransport, { isMuted = gDemoProjectDef.transport.isMuted })
	end
	if keyp(56) then
		t = Transport_Seek(gTransport, 0)
	end
	if keyp(57) then
		t = Transport_Seek(gTransport, t.songBeatCount)
	end
	if keyp(48) then
		gDemoProjectDef.transport.isPlaying = not gDemoProjectDef.transport.isPlaying
		t = Transport_SetOptions(gTransport, { isPlaying = gDemoProjectDef.transport.isPlaying })
	end
	if key(64) then
		if keyp(61) then
			-- todo: stop playback
			-- right now this only works when paused; starting playback at fractional row positions
			-- can cause weirdness. see https://github.com/thenfour/Somatic/issues/190
			t = Transport_AdvanceFrame(gTransport)
		end
		if keyp(60) then
			-- todo: stop playback
			-- NB:not implemented in Somatic. https://github.com/thenfour/Somatic/issues/190
			t = Transport_PreviousFrame(gTransport)
		end
	else
		if keyp(61) then
			t = Transport_Seek(gTransport, t.demoBeats + 1)
		end
		if keyp(60) then
			t = Transport_Seek(gTransport, t.demoBeats - 1)
		end
	end
	if keyp(54) then
		t = Transport_Seek(gTransport, t.demoBeats + 8)
	end
	if keyp(55) then
		t = Transport_Seek(gTransport, t.demoBeats - 8)
	end

	Boulette_BeginBehaviorGraphWatchFrame()
	local projectTime = Transport_GetProjectTime(gTransport)
	Demo_RenderProjectFrame(gDemoRuntime, projectTime)
	Boulette_PushRuntimeStatus(t, gDemoRuntime)
	Transport_EndFrame(gTransport)
end

function SCN(y)
	R_scanline(y, (gDebugHudLevel == 1 or gDebugHudLevel == 3))
end
