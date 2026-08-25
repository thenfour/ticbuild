-- Data-heavy fixture with strings, table fields, closures, and nested scopes.

local DEFAULT_CATEGORY = "uncategorized"
local DEFAULT_COLOR = "transparent"

local records = {
  { id = 101, category = "navigation", color = "blue", values = { 2, 3, 5, 8, 13 } },
  { id = 102, category = "navigation", color = "blue", values = { 1, 4, 9, 16, 25 } },
  { id = 103, category = "telemetry", color = "green", values = { 3, 6, 9, 12, 15 } },
  { id = 104, category = "telemetry", color = "green", values = { 5, 10, 15, 20, 25 } },
  { id = 105, category = "diagnostic", color = "amber", values = { 7, 11, 13, 17, 19 } },
  { id = 106, category = "diagnostic", color = "amber", values = { 4, 8, 15, 16, 23 } },
}

local function copyRecord(record)
  local values = {}
  for index, value in ipairs(record.values) do
    values[index] = value
  end
  return {
    id = record.id,
    category = record.category or DEFAULT_CATEGORY,
    color = record.color or DEFAULT_COLOR,
    values = values,
  }
end

local function normalizeRecord(record)
  local result = copyRecord(record)
  local minimum = math.huge
  local maximum = -math.huge
  for _, value in ipairs(result.values) do
    minimum = math.min(minimum, value)
    maximum = math.max(maximum, value)
  end
  local span = maximum - minimum
  if span == 0 then
    span = 1
  end
  for index, value in ipairs(result.values) do
    result.values[index] = (value - minimum) / span
  end
  return result
end

local function groupByCategory(source)
  local groups = {}
  for _, record in ipairs(source) do
    local category = record.category or DEFAULT_CATEGORY
    local group = groups[category]
    if group == nil then
      group = {
        category = category,
        color = record.color or DEFAULT_COLOR,
        records = {},
      }
      groups[category] = group
    end
    group.records[#group.records + 1] = normalizeRecord(record)
  end
  return groups
end

local function foldGroups(groups)
  local checksum = 0
  for category, group in pairs(groups) do
    checksum = checksum + #category * 17 + #group.color * 31
    for _, record in ipairs(group.records) do
      checksum = checksum + record.id
      for index, value in ipairs(record.values) do
        checksum = checksum + math.floor(value * 1000) * index
      end
    end
  end
  return checksum
end

return foldGroups(groupByCategory(records))
