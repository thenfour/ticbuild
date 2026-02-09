-- TIC-80 builtins stubs for symbol indexing.
-- Signatures based on the TIC-80 API wiki.

--- Main callback called every frame (60 FPS).
function TIC() end

--- Called once on cartridge boot for initialization.
function BOOT() end

--- Called before each scanline (0..143).
-- @param scanline number scanline index
function BDR(scanline) end

--- Called before each scanline (deprecated, use BDR).
-- @param scanline number scanline index
function SCN(scanline) end

--- Called after scanlines on overlay layer (deprecated).
function OVR() end

--- Handles menu callbacks.
-- @param index number menu item index
function MENU(index) end

--- Clears screen with palette color.
-- @param color number palette index
function cls(color) end

--- Resets or sets clipping region.
-- @param x number left
-- @param y number top
-- @param width number width
-- @param height number height
function clip(x, y, width, height) end

--- Gets or sets a pixel color.
-- @param x number x position
-- @param y number y position
-- @param color number palette index (optional for get)
-- @return number color at pixel when color omitted
function pix(x, y, color) end

--- Draws a sprite.
-- @param id number sprite id
-- @param x number x position
-- @param y number y position
-- @param colorkey number transparent color
-- @param scale number scale factor
-- @param flip number flip flags
-- @param rotate number rotation
-- @param w number width in sprites
-- @param h number height in sprites
function spr(id, x, y, colorkey, scale, flip, rotate, w, h) end

--- Draws a map region.
-- @param x number map x
-- @param y number map y
-- @param w number width in tiles
-- @param h number height in tiles
-- @param sx number screen x
-- @param sy number screen y
-- @param colorkey number transparent color
-- @param scale number scale factor
-- @param remap function tile remap callback
function map(x, y, w, h, sx, sy, colorkey, scale, remap) end

--- Draws a line.
-- @param x0 number start x
-- @param y0 number start y
-- @param x1 number end x
-- @param y1 number end y
-- @param color number palette index
function line(x0, y0, x1, y1, color) end

--- Draws a filled rectangle.
-- @param x number left
-- @param y number top
-- @param width number width
-- @param height number height
-- @param color number palette index
function rect(x, y, width, height, color) end

--- Draws a rectangle border.
-- @param x number left
-- @param y number top
-- @param width number width
-- @param height number height
-- @param color number palette index
function rectb(x, y, width, height, color) end

--- Draws a filled circle.
-- @param x number center x
-- @param y number center y
-- @param radius number radius
-- @param color number palette index
function circ(x, y, radius, color) end

--- Draws a circle border.
-- @param x number center x
-- @param y number center y
-- @param radius number radius
-- @param color number palette index
function circb(x, y, radius, color) end

--- Draws a filled ellipse.
-- @param x number center x
-- @param y number center y
-- @param a number radius x
-- @param b number radius y
-- @param color number palette index
function elli(x, y, a, b, color) end

--- Draws an ellipse border.
-- @param x number center x
-- @param y number center y
-- @param a number radius x
-- @param b number radius y
-- @param color number palette index
function ellib(x, y, a, b, color) end

--- Draws a filled triangle.
-- @param x1 number x1
-- @param y1 number y1
-- @param x2 number x2
-- @param y2 number y2
-- @param x3 number x3
-- @param y3 number y3
-- @param color number palette index
function tri(x1, y1, x2, y2, x3, y3, color) end

--- Draws a triangle border.
-- @param x1 number x1
-- @param y1 number y1
-- @param x2 number x2
-- @param y2 number y2
-- @param x3 number x3
-- @param y3 number y3
-- @param color number palette index
function trib(x1, y1, x2, y2, x3, y3, color) end

--- Draws a textured triangle.
-- @param x1 number x1
-- @param y1 number y1
-- @param x2 number x2
-- @param y2 number y2
-- @param x3 number x3
-- @param y3 number y3
-- @param u1 number u1
-- @param v1 number v1
-- @param u2 number u2
-- @param v2 number v2
-- @param u3 number u3
-- @param v3 number v3
-- @param texsrc number texture source
-- @param chromakey number transparent color
-- @param z1 number z1
-- @param z2 number z2
-- @param z3 number z3
function ttri(x1, y1, x2, y2, x3, y3, u1, v1, u2, v2, u3, v3, texsrc, chromakey, z1, z2, z3) end

--- Draws text with system font.
-- @param text string text
-- @param x number x position
-- @param y number y position
-- @param color number palette index
-- @param fixed boolean fixed width
-- @param scale number scale
-- @param smallfont boolean use small font
-- @return number rendered width
function print(text, x, y, color, fixed, scale, smallfont) end

--- Draws text with sprite font.
-- @param text string text
-- @param x number x position
-- @param y number y position
-- @param transcolor number transparent color
-- @param width number character width
-- @param height number character height
-- @param fixed boolean fixed width
-- @param scale number scale
-- @param alt boolean use alternate font
-- @return number rendered width
function font(text, x, y, transcolor, width, height, fixed, scale, alt) end

--- Plays a sound effect.
-- @param id number sfx id
-- @param note number note
-- @param duration number duration
-- @param channel number channel
-- @param volume number volume
-- @param speed number speed
function sfx(id, note, duration, channel, volume, speed) end

--- Plays a music track.
-- @param track number track id
-- @param frame number frame index
-- @param row number row index
-- @param loop boolean loop playback
-- @param sustain boolean sustain notes
-- @param tempo number tempo override
-- @param speed number speed override
function music(track, frame, row, loop, sustain, tempo, speed) end

--- Reads gamepad button state.
-- @param id number button id
-- @return boolean is pressed when id provided
function btn(id) end

--- Reads gamepad button press.
-- @param id number button id
-- @param hold number hold frames
-- @param period number repeat period
-- @return boolean pressed
function btnp(id, hold, period) end

--- Reads keyboard state.
-- @param code number key code
-- @return boolean pressed
function key(code) end

--- Reads keyboard press.
-- @param code number key code
-- @param hold number hold frames
-- @param period number repeat period
-- @return boolean pressed
function keyp(code, hold, period) end

--- Gets mouse state.
-- @return number mouse x
function mouse() end

--- Copies a block of RAM.
-- @param to number destination address
-- @param from number source address
-- @param length number bytes
function memcpy(to, from, length) end

--- Fills a block of RAM.
-- @param addr number address
-- @param value number value
-- @param length number bytes
function memset(addr, value, length) end

--- Reads or writes persistent memory.
-- @param index number slot index
-- @param value number value to write
-- @return number stored or previous value
function pmem(index, value) end

--- Reads memory.
-- @param addr number address
-- @param bits number bit width
-- @return number value
function peek(addr, bits) end

--- Reads 4-bit memory.
-- @param addr number address (nibble)
-- @return number value
function peek4(addr) end

--- Reads 2-bit memory.
-- @param addr number address
-- @return number value
function peek2(addr) end

--- Reads a single bit.
-- @param addr number bit address
-- @return number value
function peek1(addr) end

--- Writes memory.
-- @param addr number address
-- @param value number value
-- @param bits number bit width
function poke(addr, value, bits) end

--- Writes 4-bit memory.
-- @param addr number address (nibble)
-- @param value number value
function poke4(addr, value) end

--- Writes 2-bit memory.
-- @param addr number address
-- @param value number value
function poke2(addr, value) end

--- Writes a single bit.
-- @param addr number bit address
-- @param value number bit value
function poke1(addr, value) end

--- Syncs runtime RAM with cartridge banks.
-- @param mask number chunk mask
-- @param bank number bank index
-- @param tocart boolean write to cart
function sync(mask, bank, tocart) end

--- Selects the VRAM bank.
-- @param id number bank id
function vbank(id) end

--- Returns milliseconds since start.
-- @return number time ms
function time() end

--- Returns Unix timestamp (seconds).
-- @return number timestamp
function tstamp() end

--- Prints a debug message.
-- @param message string message
-- @param color number palette index
function trace(message, color) end

--- Exits to menu.
function exit() end
