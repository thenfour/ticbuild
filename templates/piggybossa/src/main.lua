-- This includes the Somatic music player routines, extracted from the song asset
--#include "import:song:CODE"
--#include "utils.lua"

-- This emits a literal value.
--#macro __PARTICLE_COUNT() => 50

local particles = {}

function makeNewParticle()
	return {
		x = math.random(0, 240),
		y = math.random(0, 136),
		vx = math.random(-1, 1),
		vy = math.random(-1, 1),
		-- spriteId is either 114 or 119
		spriteId = 114 + math.random(0, 1) * 5,
	}
end

-- initialize particles with random position and velocity
for i = 1, __PARTICLE_COUNT() do
	particles[i] = makeNewParticle()
end

function TIC()
	somatic_tick() -- initialize the music player

	cls(0)

	for i = 1, __PARTICLE_COUNT() do
		local p = particles[i]

		-- apply gravity
		p.vy = p.vy + 0.05

		-- update position
		p.x = p.x + p.vx
		p.y = p.y + p.vy

		-- if leaves X bounds, re-init.
		if p.x < -24 or p.x > TIC_WIDTH() then
			particles[i] = makeNewParticle()
			p = particles[i]
			p.y = math.random(0, TIC_HEIGHT() - 24)
		end

		-- bounce off bottom
		if p.y > TIC_HEIGHT() - 24 then
			p.y = TIC_HEIGHT() - 24
			p.vy = -p.vy * 0.8 -- lose some energy on bounce
		end

		-- if the particle is stationary on the ground, reinit.
		if p.vy > -0.1 and p.vy < 0.1 and p.y >= TIC_HEIGHT() - 24 then
			particles[i] = makeNewParticle()
			p = particles[i]
		end
	end

	for i = 1, __PARTICLE_COUNT() do
		local p = particles[i]
		drawSprite3x3(p.spriteId, p.x, p.y)
	end
end
