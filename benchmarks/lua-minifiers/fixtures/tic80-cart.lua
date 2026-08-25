-- Representative TIC-80-style update/render source. It stays within the Lua
-- 5.1 language subset so every benchmarked minifier receives the same input.

local SCREEN_WIDTH = 240
local SCREEN_HEIGHT = 136
local PARTICLE_COUNT = 80
local particles = {}
local frame = 0

local function resetParticle(particle, index)
  local angle = index * 2.399963229728653
  local speed = 0.25 + (index % 7) * 0.08
  particle.x = SCREEN_WIDTH * 0.5
  particle.y = SCREEN_HEIGHT * 0.5
  particle.vx = math.cos(angle) * speed
  particle.vy = math.sin(angle) * speed
  particle.life = 30 + index % 50
  particle.color = 8 + index % 7
end

local function initializeParticles()
  for index = 1, PARTICLE_COUNT do
    local particle = {}
    resetParticle(particle, index)
    particles[index] = particle
  end
end

local function updateParticle(particle, index)
  particle.vx = particle.vx * 0.985
  particle.vy = particle.vy * 0.985 + 0.0125
  particle.x = particle.x + particle.vx
  particle.y = particle.y + particle.vy
  particle.life = particle.life - 1

  if particle.life <= 0
    or particle.x < -4
    or particle.x > SCREEN_WIDTH + 4
    or particle.y < -4
    or particle.y > SCREEN_HEIGHT + 4
  then
    resetParticle(particle, index + frame)
  end
end

local function drawParticle(particle)
  local radius = 1 + math.floor(particle.life / 24)
  local highlight = particle.color + 1
  circ(particle.x, particle.y, radius, particle.color)
  pix(particle.x - radius, particle.y - radius, highlight)
end

local function drawBackground(time)
  cls(0)
  local horizon = SCREEN_HEIGHT * 0.55 + math.sin(time * 0.013) * 6
  for stripe = 0, 7 do
    local y = horizon + stripe * 5
    local color = 1 + math.floor(stripe / 2)
    rect(0, y, SCREEN_WIDTH, 5, color)
  end

  local sunX = SCREEN_WIDTH * 0.5 + math.sin(time * 0.007) * 64
  local sunY = SCREEN_HEIGHT * 0.3 + math.cos(time * 0.009) * 12
  circ(sunX, sunY, 13, 12)
  circ(sunX, sunY, 9, 13)
  circ(sunX, sunY, 5, 14)
end

initializeParticles()

function TIC()
  frame = frame + 1
  drawBackground(frame)
  for index, particle in ipairs(particles) do
    updateParticle(particle, index)
    drawParticle(particle)
  end
  print("TICBUILD LUA MINIFIER", 5, 5, 15, false, 1, true)
end
