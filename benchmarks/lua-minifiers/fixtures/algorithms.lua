-- Portable Lua 5.1-style algorithm fixture.
-- It deliberately contains descriptive locals, constant expressions, repeated
-- expressions, and a few removable declarations so optimizers have real work.

local function clamp(value, minimum, maximum)
  if value < minimum then
    return minimum
  elseif value > maximum then
    return maximum
  end
  return value
end

local function lerp(first, second, amount)
  return first + (second - first) * amount
end

local function makeTransform(angle, scale, translateX, translateY)
  local cosine = math.cos(angle)
  local sine = math.sin(angle)
  local unusedIdentity = 1 + 2 - 3
  return {
    xx = cosine * scale,
    xy = -sine * scale,
    yx = sine * scale,
    yy = cosine * scale,
    tx = translateX,
    ty = translateY,
  }
end

local function transformPoint(transform, point)
  return {
    x = point.x * transform.xx + point.y * transform.xy + transform.tx,
    y = point.x * transform.yx + point.y * transform.yy + transform.ty,
  }
end

local function createPoints(count)
  local result = {}
  local goldenAngle = math.pi * (3 - math.sqrt(5))
  for index = 1, count do
    local radius = math.sqrt(index / count)
    local angle = index * goldenAngle
    result[index] = {
      x = math.cos(angle) * radius,
      y = math.sin(angle) * radius,
      weight = clamp(1 - radius * 0.5, 0, 1),
    }
  end
  return result
end

local function sampleCurve(points, time)
  local transform = makeTransform(time * 0.015, 0.75 + math.sin(time * 0.01) * 0.25, 120, 68)
  local sumX = 0
  local sumY = 0
  local sumWeight = 0
  for index, point in ipairs(points) do
    local transformed = transformPoint(transform, point)
    local pulse = lerp(0.8, 1.2, math.sin(time * 0.02 + index * 0.1) * 0.5 + 0.5)
    sumX = sumX + transformed.x * point.weight * pulse
    sumY = sumY + transformed.y * point.weight * pulse
    sumWeight = sumWeight + point.weight * pulse
  end
  return sumX / sumWeight, sumY / sumWeight
end

local points = createPoints(96)
local checksum = 0
for frame = 1, 120 do
  local centerX, centerY = sampleCurve(points, frame)
  checksum = checksum + math.floor(centerX * 10 + centerY * 10)
end

return checksum
