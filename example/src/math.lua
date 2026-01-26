--#pragma once

local function lerp(a, b, t)
	return a + (b - a) * t
end

--#if FEATURE_ENABLE
local FEATURE_ENABLE = true
--#else
local FEATURE_ENABLE = false
--#endif
