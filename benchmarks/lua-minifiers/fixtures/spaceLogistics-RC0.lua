-- Somatic v1.0.20 (298dc36)
-- Generated on 2026-08-18T00:58:24.533Z

-- (begin Somatic playroutine)
do
	local a, b, c, d, e, f, g, h, i, j, k, l =
		peek, math.max, "twinkle1", "accent1", "-", "accent2", "endaccent", true, 128, 255, nil, false
	SOMATIC_MUSIC_DATA = {
		tempo = 120,
		speed = 5,
		rowsPerBeat = 4,
		sideChannel = {
			[1] = { [0] = c, [20] = c, [32] = c },
			[7] = { [8] = c, [14] = c, [20] = c, [26] = c, [32] = c },
			[17] = { [0] = c, [12] = c, [18] = c, [24] = c, [30] = c, [36] = c },
			[18] = { [8] = c, [14] = c, [20] = c, [26] = c, [32] = c },
			[33] = { [32] = d, [38] = d, [44] = d, [50] = d, [56] = d },
			[34] = { [0] = e, [14] = e, [28] = e, [42] = e, [56] = e },
			[23] = { [0] = e, [14] = e, [28] = e, [42] = e, [56] = e },
			[35] = { [0] = e, [14] = e, [28] = e, [42] = e, [56] = e },
			[36] = { [0] = e, [14] = e, [28] = e, [32] = f, [34] = f, [38] = f, [42] = f, [56] = e },
			[0] = { [40] = g, [46] = g, [52] = g, [58] = g },
		},
		rowsPerPattern = 64,
		so = [[#!.OtL!WrE*"U4r3"UGDA$OdIS%hK<c',2/s(DI]()B0Y:*Y]\="X,'7,UFcb-n-Vr/1E/'-n-f'0et(31c6a@2`NBL3]/QP4=MU)4[)(q5sdq,77Kd<8P2?C9MJ8X8Pi8^;cHUo<``C+>$G6;?=,$e@:C]E@q$cmA:Ogh!#."FAS,RgBjtgmCi+'.E,fo>FEIQ`]],
		orows = "#!!,?8,lmuG",
		patternOrder = {
			2,
			10,
			11,
			8,
			15,
			1,
			7,
			17,
			18,
			6,
			9,
			5,
			12,
			13,
			14,
			16,
			19,
			20,
			21,
			22,
			33,
			29,
			30,
			31,
			32,
			34,
			23,
			35,
			36,
			24,
			25,
			28,
			25,
			26,
			27,
			4,
			0,
			3,
		},
		w = [[!!"0bJ69Hj(f(73&!.Y7S!!r`o4=qZcnF%HL#7pk>"@>4&!8)f/+92EGJ-6D`!m(:i#nR(N#/UpO!!ihQ'`\7#!WW3##=91qJ.)th#RCG2*WV#=m!o@<!#Q"W!,URT1[6%^!!33%+92c"6Yt[BA*JLL+92WS!!"&_#5!EOJ,oWc!f2&Err;E2RV4Pk!<<]eAKCi=b3a]i&c_tE!It;e!!6QjJ-\OC#8$t:('$o$J-j-p!!a,;!##@"rI>1c!#H=]!($Ykn:/gfJ/!qC+93,W!#P_2T7@55!!X2>!!$s=J-pr2!!O/>!!$DW$^:\m#8mOB`rL@OJ-dn0!?-Ik&-)g2CZBpN&-)qS!<?p9BKgqQ&-)_NJ.E1k!?H[o&-)c<k^WpM!!+-k%hJ^G*ru?_TW:V6$'YJk#9X$I$ip&uJ-cbe#9a*J*g"tEJ-:r7!!WLf!>ke\J-@V,!B>T9?iU3PJ.E3A&-2b6nGiOgJ.`h%!D7kFY60:Y!<<0h;1JcR!!+?q"P*X)#nR(<6rAI=(4Zeo!!r,ps8N'!:fW#_+Fj]6!!*=T(a&e^<!>Mf'S%-1!!WE;78[#aJ.bc\"]Rof'LdNX3.M0]J.ahl&iTdlnGe"MBE/)5J-5n'$0D8=#WmP>&HE"9&-)\2!.Y4[!!`K8!!)cs<Ib5U!!*7R"G$c-"=AX%+FjS7J-R3I#m#P[3.M0n"b6doJ/9Va#=ngt!<<6'J-5uT#ljr*<<*"A<=FBa(k;oH!!*4Q"U'>g0E;8U!:V'3J-6/Y!C;5B<<*.e!#/F`"TeZ)5_'?+!ItANJ-F^/!!ZF;eJ(GLJ.!KM%KV(`O90q9e,t4[!<<-GJ0#PX#[i/ehuS?8"Fpf]!ItgtJ.stn#6=f2#RiH(`"3SU%"JMg!<</9J-E.Z!!<7!7">CZ!!.V#":G25!":["`..su!!<3#J.&jgJ->3?!!<B)J:Ie+J.'g/!!3-/J-:N-J-OX-J-R3I$bufD!s&E)J.pN8J-G?C!!D`j5C`s6!<<-2J-jj1J-V/<!!-)M"IK2i"+O;CJ-XF&!!3=#J-LN-J.L95!!*+N"oSORK*_R/$@iZf!C_MBU^7#%-%H<f$@i6j!!5SdJ-Hd>'EN_j+92K(++P@k!!-)M&NG:Y^^Yf:L]N#/!<<0e&:b5;%tImcJ1tYe#;?,Y:k/eS$ig@%Wdk8W!J!7_!ItI7"+UR]J.VDaJ-F:0J-?.-#QfMf3e.J[J-c7,"g\>^&3,1Lb63>-J,t05G(:2>J0Z*7!_#M-%Y,)j!C_MBmgfC$!!#m7J/C%l(]f-kfE)$U!!!#'J.$[R)LrBL'#k$(#8."<n:,rmNWfC`#Cm!h!!C"Ir.#!%"b74VJ;+A\&:hIu!ItI<%tGK&JGfcT!%\Be(a(4\3'^#2=C>f]G^tR1Q_11Z\%fu0fAGc[p]"hn1Er6!Ag/F!6o0>s#_36c!$M=Ap?^hmd)Nc*WhGc>KR7]P?<'Zc3A2^!'+"Y_6puP.3WK;=Lh:7L$3^D?s6\R^[\T(:D-KRj,SC*-%it]W]2_6T,.g7T7">gc!!,K<#Qau01G^gC,(KtIJ-?")$7C?6/H?>M1EmD2'.#V1?#P=ZVn($%%o`NYbf@T6\?i<9URmm<O,AXAH?F1BAmnqG;GBYJ4ZG5M.3ouR'FtNS!+p`b!<<=[LksmCh1,WR!!*[^"9j;YN<0(]+q]>.RfWQn,)BieAq1%*!!.n+"=*sPbfkm!bh_**";LnDh,Ql!B&-HC+sMO@-ia<\7">FU!!M-6Ll$We*WQ5bJ-AOF&'VGRLiHWe/Jgh!GB\k2J.r"a",MchJ.)qg!I0,##lmn(s8;]eo^VA9l/q$ahV6]5e'Q@^a2Pp1]XkSZZ*(1-VPBiVS!]J)OH#-RKn=f%H?XINDes-"@pr\J=B8?sR:_k!s7#$s`3uS2M0j&E:I'Fc%Y+]V!<<4X^kdM+7fWY,^f>mg8q7EQJ06oR",HrmJ-Q)T!s$-PJ.+F<&cf`In))I,Yb7).E*uL.0d.-Z"ci`c"#D,FJ-NC`!""13Aq2Z],(P2o":p"cLB@M_Z^H>U9f![f7">F\!!e=9b[tI!GCTes!$uSu@Tuf+7R&je.O,oJ%L3!%ObnX7EG8ia;+Nr30IS%\&-r8d"bm/1"S;hI-eJQP"Y>04T*52sLd[&L$hjgT.@p]n"G[-\%5\#?s3/\T7*NjTrr@QS$@kGI!"&\c`i>&=<B2%L$5EOA!.Y@q!!h8eP&3c9!.YbGJ-5n'#20=_!WRZR!<<jHAg#J#!$FNld/Uns!7:cGbXBYTJ-QX9":G2I0JIH"E,\fW<E77nE8<q+7*J%T1V:92]7:%m!!CHhb^]mf!!:BgJ-:u:J->t(#@Dum!ItA&J-[cX$crDL$ig8,!WiE)!!"f2]],
		rp = [["!!<3$$@i9]!71f^!%@n2!!`Kl!%Itd!%@o7!&O]!!#GXp!#bk8!"f2?!>,;Q!AFLK!BgF@!>PU-!?;*P!CQnf!]^6@!YGE)!Y596![[ns!\=>P!Yk^N!Yk^c!_r_?!tbMi!tPB!""sXp"#L"T!tt[F"!dm&"#Bog":>,I";1\c"<%80":tQ6"G[!5">0Z^"XsF."ZcX$"Z-4R"]YQs"Yp',#!N$"#!)aX#$h6."uuZB#<Mp+#;Q:T#?h-,#?(V"#XABP#[@As#^QJ`#seQi#r;S9$$cMM$9nNS$>fbC$]+k?$X3Vl$X`s&$s*Fu$o@t1$o7kb%6"8I%;#U4%7pQ`%13++%2&XD%N,6e%Mf%#%Mo+;%Nb[b%N,7u%Mo,5%Mo,L%N,8g%P%PO%NPN]%kI]D%lXK1%s\0B%i,-I&.\aR&17H<&/G7A&17I$&17IK&8;+K&JG-^&N0Vb&O$2S&ShCA&NTnI&mbR"&o.LE&mbQ@'5.B^'/T^^'35*+'Q*o]'R0U4'g2P7'f,i`'fc9J'i"`W(*ETJ(+0*#(-hl'(,l6U((pWB(5i0F(H2?*(H)9_(D$QH(jl=2(_6V)(a]4_]],
		cp = {},
	}
	local m, n, o, p, q, r, s, t, u, v, w, x, y, z, aa =
		65508, 65436, 18, 2, 81920, 65764, 69988, 81508, 79972, 80740, 15, 18, 2048, 16384, 64
	local function ab(ac, ad)
		local ae, af = ad or 0, 0
		local function ag()
			if af ~= 0 then
				af = 0
				ae = ae + 1
			end
		end
		local function ah(ai)
			local aj, ak = 0, 0
			while ai > 0 do
				local al, am = ac[ae + 1] or 0, 8 - af
				local an = ai < am and ai or am
				local ao = (1 << an) - 1
				local ap = al >> af & ao
				aj = aj | ap << ak
				af = af + an
				if af >= 8 then
					af = 0
					ae = ae + 1
				end
				ak = ak + an
				ai = ai - an
			end
			return aj
		end
		local function aq(ar)
			local as, at = ah(ar), 1 << ar - 1
			if as & at ~= 0 then
				as = as - (1 << ar)
			end
			return as
		end
		return { align = ag, u = ah, i = aq }
	end
	local function au(av, aw)
		local ax, ay = ab(av, aw), {}
		ay.a = ax.u(8)
		ay.b = ax.u(2)
		ay.c = ax.u(4)
		ay.d = ax.u(5)
		ay.e = ax.u(5)
		ay.f = ax.u(12)
		ay.g = ax.u(8)
		ay.h = ax.u(8)
		ay.i = ax.u(8)
		ay.j = ax.u(1)
		ay.k = ax.u(8)
		ay.l = ax.u(12)
		ay.m = ax.i(6)
		ay.n = ax.u(2)
		ay.o = ax.u(2)
		ay.p = ax.u(8)
		ay.q = ax.u(12)
		ay.r = ax.i(6)
		ay.s = ax.u(2)
		return ay
	end
	local function az(ba, bb)
		local bc, bd = ab(ba, bb), {}
		do
			local be = {}
			for bf = 1, 16 do
				be[bf] = bc.u(8)
			end
			bd.t = be
		end
		bd.u = bc.u(10)
		bd.v = bc.i(6)
		return bd
	end
	local bg, bh, bi, bj, bk, bl, bm, bn, bo, bp, bq, br, bs = 0, 1, 2, 0, 1, 2, 1, 2, 51, 192, 3, 16, 32
	local function bt(bu, bv)
		if bu == 0 then
			return 0, 0
		end
		local bw = bu - 1
		local bx = s + bw * bp + bv * bq
		local by, bz, ca = a(bx), a(bx + 1), a(bx + 2)
		local cb, cc = by & 15, ca & 31 | (bz >> 7 & 1) << 5
		return cb, cc
	end
	local function cd(ce, cf)
		local cg = t + ce * bo + cf * 3
		local ch, ci, cj = a(cg), a(cg + 1), a(cg + 2)
		return ch & 63, (ch >> 6 | ci << 2) & 63, (ci >> 4 | cj << 4) & 63, cj >> 2 & 63
	end
	local function ck(cl, cm, cn)
		return math.min(b(cl, cm), cn)
	end
	local function co(cp)
		return ck(cp, 0, 1)
	end
	local function cq(cr)
		return (ck(cr, 0, 15) + 0.5) // 1
	end
	local cs, ct = {}, {}
	local function cu(cv, cw, cx)
		for cy = 1, cw do
			cx[cy] = a(cv + cy - 1)
		end
		return cx, cw
	end
	local function cz(da, db, dc)
		for dd = 1, db do
			poke(dc + dd - 1, da[dd])
		end
		return db
	end
	local function de(df, dg, dh)
		local function di(dj)
			local dk, dl = 0, 1
			while h do
				local dm = df[dj + 1]
				dj = dj + 1
				dk = dk + dm % i * dl
				if dm < i then
					return dk, dj
				end
				dl = dl * i
			end
		end
		local dn, dp = 0, 0
		while dn < dg do
			local dq = df[dn + 1]
			dn = dn + 1
			if dq == 0 then
				local dr
				dr, dn = di(dn)
				for ds = 1, dr do
					dh[dp + 1] = df[dn + 1]
					dn = dn + 1
					dp = dp + 1
				end
			else
				local dt, du
				dt, dn = di(dn)
				du, dn = di(dn)
				for dv = 1, dt do
					dh[dp + 1] = dh[dp - du + 1]
					dp = dp + 1
				end
			end
		end
		return dh, dp
	end
	local function dw(dx, dy)
		cu(dx, dy, cs)
		return de(cs, dy, ct)
	end
	local function dz(ea, eb, ec)
		local ed, ee = dw(ea, eb)
		return cz(ed, ee, ec)
	end
	local function ef(eg, eh)
		if eg <= 0 then
			return 0
		end
		if eg >= 1 then
			return 1
		end
		local ei = eh / 31
		ei = ck(ei, -1, 1)
		if ei == 0 then
			return eg
		end
		local ej = 2 ^ (4 * math.abs(ei))
		return ei > 0 and eg ^ ej or 1 - (1 - eg) ^ ej
	end
	local ek, el, em, en, eo, ep, eq, er, es, et, eu, ev, ew, ex =
		4,
		{ -1, -1, -1, -1 },
		{ 0, 0, 0, 0 },
		{ j, j, j, j },
		{ j, j, j, j },
		{ k, k, k, k },
		{ k, k, k, k },
		{},
		{},
		{},
		{},
		-2,
		-1,
		-1
	local function ey(ez, fa)
		local fb = m + ez * br
		for fc = 0, br - 1 do
			local fd = a(fb + fc)
			fa[fc * 2] = fd & 15
			fa[fc * 2 + 1] = fd >> 4 & 15
		end
	end
	local function fe(ff, fg)
		local fh, fi = n + ff * o + p, 0
		for fj = 0, br - 1 do
			local fk, fl = cq(fg[fi]), cq(fg[fi + 1])
			poke(fh + fj, fl << 4 | fk)
			fi = fi + 2
		end
	end
	local function fm(fn, fo, fp)
		fo[fp] = fn & 15
		fo[fp + 1] = fn >> 4 & 15
		return fp + 2
	end
	local function fq(fr, fs, ft)
		local fu = fr[fs + ft // 8]
		return fu & 1 << ft % 8 ~= 0
	end
	local function fv(fw, fx)
		local fy = 0
		for fz = 0, y - 1 do
			local ga = fw[fx + fz]
			while ga ~= 0 do
				ga = ga & ga - 1
				fy = fy + 1
			end
		end
		return fy
	end
	local function gb(gc)
		local gd = 1
		local ge = gc[gd]
		gd = gd + 1
		local gf, gg = {}, {}
		for gh = 1, ge do
			local gi = au(gc, gd - 1)
			gd = gd + w
			local gj = gc[gd]
			gd = gd + 1
			local gk = {}
			for gl = 1, gj do
				local gm, gn, go = az(gc, gd - 1), {}, 0
				for gp = 1, 16 do
					go = fm(gm.t[gp], gn, go)
				end
				gm.t = k
				gm.x = gn
				gk[#gk + 1] = gm
				gd = gd + x
			end
			gi.j = gi.j ~= 0
			gi.y = gk
			gf[gi.a] = gi
			gg[#gg + 1] = gi.a
		end
		local gq = gd
		local gr = gq + y
		local gs = gr + y
		gd = gs + y
		local gt = gd
		local gu = gt + fv(gc, gq)
		local gv = gu + fv(gc, gr)
		local gw, gx = gv + fv(gc, gs), {}
		for gy = 0, z - 1 do
			local gz = k
			if fq(gc, gq, gy) then
				gz = gz or {}
				gz.i = gc[gt]
				gt = gt + 1
			end
			if fq(gc, gr, gy) then
				gz = gz or {}
				gz.g = gc[gu]
				gu = gu + 1
			end
			if fq(gc, gs, gy) then
				gz = gz or {}
				gz.aa = gc[gv]
				gz.ab = gc[gw]
				gv = gv + 1
				gw = gw + 1
			end
			if gz ~= k then
				local ha = gy // aa
				local hb = gx[ha]
				if hb == k then
					hb = {}
					gx[ha] = hb
				end
				hb[gy % aa + 1] = gz
			end
		end
		return gf, gx, gg
	end
	local function hc(hd, he, hf, hg, hh, hi)
		if hd == bh then
			local hj = hh
			if hj <= 0 then
				return 0
			end
			local hk = hg % hj / hj
			return (1 - math.cos(hk * 6.283)) * 0.5
		end
		if he <= 0 then
			return hi
		end
		return co(hf / he)
	end
	local function hl(hm)
		local hn = ck(hm, 0, j) - i
		if hn < 0 then
			return hn / i
		end
		return hn / 127
	end
	local function ho(hp, hq, hr, hs, ht, hu)
		local hv, hw = eq[hp + 1] or j, co(hq / j)
		local hx = co(hv / j)
		local hy, hz = hw * hx, ep[hp + 1]
		if hz == k then
			hz = hr
		end
		local ia, ib = hl(hz), co(hs / j)
		if ib > 0 and hu > 0 then
			local ic = hc(bh, 0, 0, ht, hu, 0) * 2 - 1
			ia = ck(ia + ib * ic, -1, 1)
		end
		local id, ie = 1, 1
		if ia < 0 then
			ie = 1 + ia
		else
			id = 1 - ia
		end
		local ig = q + hp
		local ih = a(ig)
		local ii, ij = ih & 15, ih >> 4 & 15
		ii = (ii * id * hy + 0.5) // 1
		ij = (ij * ie * hy + 0.5) // 1
		poke(ig, ii | ij << 4)
	end
	local function ik(il)
		if not il then
			return l
		end
		local im = il.b
		if im == bj then
			return h
		end
		if im == bl then
			return h
		end
		if il.j then
			return h
		end
		local io = il.o
		if io == bm and il.p > 0 then
			return h
		end
		if io == bn and il.p > 0 then
			return h
		end
		return l
	end
	local function ip(iq, ir)
		local is, it = ir * ir, bs
		local iu, iv = 0.95 * is, 0
		for iw = 0, it - 1 do
			iv = iv + iq[iw]
		end
		local ix = iv / it
		local function iy(iz, ja, jb)
			for jc = iz, ja, jb do
				local jd = iq[jc]
				ix = ix + iu * (jd - ix)
				iq[jc] = ix
			end
		end
		iy(0, it - 1, 1)
		iy(it - 1, 0, -1)
	end
	local function je(jf, jg)
		local jh = 1 + 20 * co(jg)
		if jh <= 1 then
			return
		end
		for ji = 0, bs - 1 do
			local jj = (jf[ji] / 7.5 - 1) * jh
			local jk = 0.6366 * math.asin(math.sin(jj))
			local jl = (jk + 1) * 7.5
			jf[ji] = cq(jl, 0, 15)
		end
	end
	local jm = {}
	local function jn(jo, jp)
		if jp <= 1.001 then
			return
		end
		local jq = bs
		for jr = 0, jq - 1 do
			jm[jr] = jo[jr]
		end
		for js = 0, jq - 1 do
			local jt = js / jq * jp
			local ju = jt // 1
			local jv = jt - ju
			local jw = jv * jq
			local jx = jw // 1
			local jy, jz, ka = jw - jx, (jx + 1) % jq, jm[jx]
			local kb = jm[jz]
			local kc = ka + (kb - ka) * jy
			jo[js] = kc
		end
	end
	local kd, ke, kf, kg, kh, ki, kj, kk, kl, km, kn, ko, kp, kq, kr, ks, kt, ku =
		l, 0, 0, -1, l, l, l, l, k, k, k, 192 * 4, 79972, 80740, 1e-6, 1e3 / 60, {}, {}
	local function kv(kw, kx)
		local ky = kw:byte(1) - 33
		local kz, la = (#kw - 1) // 5 * 4 - ky, 2
		for lb = 0, kz - 1, 4 do
			local lc = 0
			for ld = la, la + 4 do
				lc = lc * 85 + kw:byte(ld) - 33
			end
			la = la + 5
			for le = 3, 0, -1 do
				if lb + le < kz then
					kx[lb + le + 1] = lc % 256
				end
				lc = lc // 256
			end
		end
		return kx, kz
	end
	local function lf(lg)
		local lh, li = kv(lg, cs)
		return de(cs, li, ct)
	end
	local function lj(lk, ll)
		local lm, ln = lf(lk)
		return cz(lm, ln, ll)
	end
	local lo = {}
	local function lp(lq, lr, ls)
		local lt = lq.y
		local lu = #lt
		if lu == 1 then
			local lv = lt[1].x
			for lw = 0, bs - 1 do
				ls[lw] = lv[lw]
			end
			return h
		end
		local lx, ly, lz = lr, lu - 1, 1
		for ma = 1, lu - 1 do
			local mb = lt[ma].u
			if mb > 0 then
				if lx < mb then
					ly = ma
					lz = lx / mb
					break
				end
				lx = lx - mb
			end
		end
		local mc, md, me = ef(lz, lt[ly].v), lt[ly].x, lt[ly + 1].x
		for mf = 0, bs - 1 do
			ls[mf] = md[mf] + (me[mf] - md[mf]) * mc
		end
		return h
	end
	local function mg(mh, mi, mj, mk)
		local ml, mm = mh.f, 0
		if ml > 0 then
			mm = mk % ml / ml
		end
		local mn
		if mm < 0.5 then
			mn = mm * 4 - 1
		else
			mn = 3 - mm * 4
		end
		local mo = mh.d + mh.e * mn
		mo = ck(mo, 1, 30)
		local mp = mo / 31 * bs
		for mq = 0, bs - 1 do
			mj[mq] = mq < mp and 15 or 0
		end
		return h
	end
	local function mr(ms, mt)
		ey(ms.c, mt)
		return h
	end
	local function mu(mv, mw, mx, my)
		local mz = mv.b
		if mz == bj then
			return lp(mv, mw, mx)
		end
		if mz == bl then
			return mg(mv, mw, mx, my)
		end
		if mz == bk then
			return mr(mv, mx)
		end
		return l
	end
	local function na(nb, nc, nd, ne, nf, ng, nh)
		if not ik(nb) then
			return
		end
		if not mu(nb, ne, et, nf) then
			return
		end
		local ni, nj, nk = co(ng / j), co(nh / j), co(nb.k / j)
		local nl, nm = nk * nj, nb.o
		if nm == bn and nb.p > 0 and ni > 0 then
			local nn = 0
			if nb.s ~= bi then
				nn = hc(nb.s, nb.q, ne, nf, nb.f, 0)
			end
			local no = 1 - ef(nn, nb.r)
			local np = 1 + nb.p / j * ni * 7 * no
			jn(et, np)
		end
		local nq = nb.s
		local nr = nq == bi or nq == bh and nb.f > 0 or nb.q > 0
		if nm == bm and nb.p > 0 and nr and ni > 0 then
			local ns, nt = co(nb.p / j) * ni, 0
			if nq ~= bi then
				nt = hc(nq, nb.q, ne, nf, nb.f, 0)
			end
			local nu = 1 - ef(nt, nb.r)
			local nv = ns * nu
			je(et, nv)
		end
		if nb.j then
			local nw
			if nb.n == bi then
				nw = 1
			else
				nw = hc(nb.n, nb.l, ne, nf, nb.f, 1)
			end
			local nx = nl * co(nw)
			nx = ef(nx, nb.m)
			local ny = 1 - nx
			ip(et, ny)
		end
		fe(nd, et)
	end
	local function nz(oa, ob)
		return SOMATIC_MUSIC_DATA.z[oa * 4 + ob + 1]
	end
	local function oc(od, oe, of)
		if od == ev and oe == ew and of == ex then
			return
		end
		ev = od
		ew = oe
		ex = of
		local og = kf
		local oh, oi, oj, ok = cd(od, oe)
		local ol = { oh, oi, oj, ok }
		for om = 0, ek - 1 do
			local on = nz(og, om)
			local oo = ku[on]
			local op = oo and oo[of + 1] or k
			if op and op.aa == 1 then
				en[om + 1] = op.ab
			elseif op and op.aa == 3 then
				eo[om + 1] = op.ab
			elseif op and op.aa == 2 then
				local oq = el[om + 1]
				if oq and oq >= 0 then
					local os = kt[oq]
					local ot = os and os.f or 0
					if ot > 0 then
						eu[oq] = op.ab / j * ot // 1
					end
				end
			end
			local ou = ol[om + 1]
			local ov, ow = bt(ou, of)
			if ov == 0 then
			elseif ov < 4 then
				el[om + 1] = -1
				em[om + 1] = 0
				ep[om + 1] = k
				eq[om + 1] = k
			else
				el[om + 1] = ow
				em[om + 1] = 0
				ep[om + 1] = k
				eq[om + 1] = k
			end
			if op and op.aa == 5 then
				ep[om + 1] = op.ab
			end
			if op and op.g ~= k then
				ep[om + 1] = op.g
			end
			if op and op.i ~= k then
				eq[om + 1] = op.i
			end
		end
	end
	local function ox(oy)
		local oz = el[oy + 1]
		if oz == -1 then
			return
		end
		local pa, pb, pc = em[oy + 1], kt[oz], eu[oz] or 0
		if ik(pb) then
			local pd, pe = en[oy + 1] or j, eo[oy + 1] or j
			na(pb, oz, oy, pa, pc, pd, pe)
		end
		ho(oy, pb and pb.i or j, pb and pb.g or i, pb and pb.h or 0, pc, pb and pb.f or 0)
		em[oy + 1] = pa + 1
	end
	local function pf(pg, ph, pi)
		oc(pg, ph, pi)
		for pj = 1, #lo do
			local pk = lo[pj]
			eu[pk] = (eu[pk] or 0) + 1
		end
		for pl = 0, ek - 1 do
			ox(pl)
		end
	end
	local function pm()
		local pn = SOMATIC_MUSIC_DATA.w
		kt = {}
		ku = {}
		lo = {}
		local po = lf(pn)
		kt, ku, lo = gb(po)
	end
	pm()
	local function pp()
		return #SOMATIC_MUSIC_DATA.z / 4
	end
	local function pq(pr)
		return SOMATIC_MUSIC_DATA.orderRows[pr + 1]
	end
	local function ps()
		local pt = 0
		for pu = 0, pp() - 1 do
			pt = pt + pq(pu)
		end
		return pt
	end
	local function pv(pw, px)
		local py, pz = ck(pw or 0, 0, b(0, pp() - 1)), 0
		for qa = 0, py - 1 do
			pz = pz + pq(qa)
		end
		return pz + ck(px or 0, 0, b(0, pq(py) - 1))
	end
	local function qb(qc, qd)
		local qe, qf = lf(qc)
		local qg, qh, qi = ab(qe), {}, qf * 8 // qd
		for qj = 1, qi do
			qh[qj] = qg.u(qd)
		end
		return qh
	end
	SOMATIC_MUSIC_DATA.rpd = qb(SOMATIC_MUSIC_DATA.rp, 16)
	SOMATIC_MUSIC_DATA.z = qb(SOMATIC_MUSIC_DATA.so, 8)
	SOMATIC_MUSIC_DATA.orderRows = qb(SOMATIC_MUSIC_DATA.orows, 8)
	local function qk(ql, qm)
		local qn = SOMATIC_MUSIC_DATA.rpd
		local qo = #qn / 2
		if ql < qo then
			dz(s + qn[ql * 2 + 1], qn[ql * 2 + 2], qm)
			return
		end
		local qp = SOMATIC_MUSIC_DATA.cp[ql + 1 - qo]
		lj(qp, qm)
	end
	local function qq(qr, qs)
		for qt = 0, 3 do
			local qu, qv = nz(qr, qt), qs + qt * bp
			qk(qu, qv)
		end
	end
	local function qw(qx, qy, qz)
		local ra = pq(qx)
		if ra >= SOMATIC_MUSIC_DATA.rowsPerPattern then
			return
		end
		local rb, rc = ra - 1, 0
		for rd = 0, 3 do
			local re = qy + rd * bp + rb * bq
			local rf = a(re + 1) >> 4 & 7
			if rf == 0 then
				rc = rd
				break
			end
		end
		local rg, rh = (qz + 1) % 16, qy + rc * bp + rb * bq
		poke(rh, (rg & 15) << 4 | a(rh) & 15)
		poke(rh + 1, a(rh + 1) & i | 3 << 4)
	end
	local function ri(rj)
		memset(rj, 0, ko)
	end
	local function rk(rl)
		ri(rl)
		for rm = 0, ko - 1, 3 do
			poke(rl + rm, 1)
		end
	end
	local function rn()
		rk(kp)
		memcpy(kq, kp, ko)
	end
	local function ro()
		for rp = 0, ek - 1 do
			sfx(-1, 0, 0, rp)
			el[rp + 1] = -1
			em[rp + 1] = 0
			ep[rp + 1] = k
			eq[rp + 1] = k
		end
	end
	local function rq(rr, rs, rt)
		if kk then
			rk(rs)
		else
			qq(rr, rs)
			qw(rr, rs, rt)
		end
	end
	local function ru()
		local rv, rw, rx = pp(), kh and kq or kp, kh and kp or kq
		if rv == 0 then
			rn()
			return
		end
		if kf >= 0 and kf < rv then
			rq(kf, rw, b(0, kg))
		else
			ri(rw)
		end
		local ry = ke
		if ry >= rv then
			if kj then
				ry = 0
			else
				ry = k
			end
		end
		if ry == k then
			ri(rx)
		else
			rq(ry, rx, (b(0, kg) + 1) % 16)
		end
	end
	local function rz(sa)
		local sb = sa == h
		if kk == sb then
			return
		end
		kk = sb
		ev = -2
		ew = -1
		ex = -1
		if kk then
			rn()
			ro()
		else
			ru()
		end
	end
	local function sc(sd, se)
		return sd * 6 / se
	end
	local sf, sg, sh, si, sj, sk =
		SOMATIC_MUSIC_DATA.tempo,
		SOMATIC_MUSIC_DATA.speed,
		SOMATIC_MUSIC_DATA.rowsPerBeat,
		SOMATIC_MUSIC_DATA.rowsPerPattern,
		pp(),
		ps()
	local sl = sk / sh
	local sm, sn = sl * 6e4 / sc(sf, sg), 0
	local so = {
		baseTempo = sf,
		baseSpeed = sg,
		tempo = sf,
		speed = sg,
		rowsPerBeat = sh,
		rowsPerPattern = si,
		songPatternCount = sj,
		songRowCount = sk,
		songBeatCount = sl,
		songMillis = sm,
		isPlaying = h,
		playbackRate = 1,
		syncOffsetMS = 0,
		pendingAudioAbsRow = k,
		prevWallMillis = time(),
		projectedTime = {},
		time = {
			tempo = sf,
			speed = sg,
			rowsPerBeat = sh,
			rowsPerPattern = si,
			songPatternCount = sj,
			songRowCount = sk,
			songBeatCount = sl,
			songMillis = sm,
			isPlaying = h,
			isMuted = l,
			loopSongForever = l,
			didSeek = l,
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
	local function sp(sq)
		local sr = sc(so.baseTempo, so.baseSpeed)
		return sq * 6e4 / sr
	end
	local ss
	local function st()
		local su = sc(so.baseTempo, so.baseSpeed)
		return sc(so.tempo, so.speed) / su
	end
	local function sv(sw)
		sw = sw or so.time
		local sx = sw.demoBeats * so.rowsPerBeat
		if sx < 0 then
			sx = 0
		end
		local sy = sx // 1
		if kj and so.songRowCount > 0 then
			sy = sy % so.songRowCount
		end
		local sz, ta = ss(sy)
		sw.demoPatternIndex = sz
		sw.demoPatternRow = ta
		local tb = SOMATIC_MUSIC_DATA.patternOrder[sz + 1]
		local tc = SOMATIC_MUSIC_DATA.sideChannel[tb] or k
		sw.sideChannel = tc and tc[ta] or k
	end
	local function td(te)
		local tf = pv(te.demoPatternIndex, te.demoPatternRow)
		if tf == kn then
			return
		end
		kn = tf
		if km ~= k then
			km(te)
		end
	end
	local function tg()
		local th = so.time
		th.tempo = so.tempo
		th.speed = so.speed
		th.rowsPerBeat = so.rowsPerBeat
		th.rowsPerPattern = so.rowsPerPattern
		th.songPatternCount = so.songPatternCount
		th.songRowCount = so.songRowCount
		th.songBeatCount = so.songBeatCount
		th.songMillis = so.songMillis
		th.isPlaying = so.isPlaying
		th.isMuted = kk
		th.loopSongForever = kj
		th.playbackRate = so.playbackRate
		th.syncOffsetMS = 0
	end
	local function ti(tj)
		if tj ~= k then
			so.syncOffsetMS = tonumber(tj) or 0
		end
		return so.syncOffsetMS or 0
	end
	local function tk(tl)
		local tm = ti(tl)
		if tm == 0 then
			return 0
		end
		local tn = sc(so.baseTempo, so.baseSpeed)
		return tm * so.playbackRate * tn / 6e4
	end
	function somatic_project_time(to, tp)
		local tq = ti(tp)
		if tq == 0 then
			to.syncOffsetMS = 0
			return to
		end
		local tr = so.projectedTime
		for ts in pairs(tr) do
			tr[ts] = k
		end
		for tt, tu in pairs(to) do
			tr[tt] = tu
		end
		local tv = tq * so.playbackRate
		tr.rawDemoMillis = to.demoMillis
		tr.rawDemoBeats = to.demoBeats
		tr.syncOffsetMS = tq
		tr.demoMillis = b(0, to.demoMillis + tv)
		tr.demoBeats = b(0, to.demoBeats + tk())
		sv(tr)
		return tr
	end
	local function tw(tx)
		tx = tx or {}
		if tx.tempo ~= k then
			if tx.tempo <= 0 then
				error("somatic_set_options: tempo must be > 0")
			end
			so.tempo = tx.tempo
		end
		if tx.speed ~= k then
			if tx.speed <= 0 then
				error("somatic_set_options: speed must be > 0")
			end
			so.speed = tx.speed
		end
		if tx.rowsPerBeat ~= k then
			error("somatic_set_options: rowsPerBeat is song metadata")
		end
		if tx.isPlaying ~= k then
			so.isPlaying = tx.isPlaying == h
		end
		if tx.isMuted ~= k then
			rz(tx.isMuted == h)
		end
		if tx.loopSongForever ~= k then
			kj = tx.loopSongForever == h
		end
		so.playbackRate = st()
		so.time.demoMillis = sp(so.time.demoBeats)
		tg()
		sv()
	end
	function somatic_position_to_beat(ty, tz)
		local ua = pv(ty, tz)
		return ua / so.rowsPerBeat
	end
	local function ub(uc, ud)
		local ue, uf = somatic_position_to_beat(uc, ud), so.time
		uf.demoBeats = ue
		uf.demoMillis = sp(ue)
		uf.demoDeltaMillis = 0
		uf.demoDeltaBeats = 0
		sv()
	end
	local function ug(uh)
		local ui, uj = so.time, uh + sn
		local uk = uj - ui.demoBeats
		ui.demoDeltaBeats = ui.demoDeltaBeats + uk
		ui.demoBeats = uj
	end
	local function ul(um)
		local un = pp()
		if un <= 0 then
			return 0, 0
		end
		local uo = ps() - 1
		if um < 0 then
			um = 0
		end
		if um > uo then
			um = uo
		end
		return um, uo
	end
	function ss(up)
		local uq, ur = up // 1, pp()
		for us = 0, ur - 1 do
			local ut = pq(us)
			if uq < ut then
				return us, uq
			end
			uq = uq - ut
		end
		local uu = b(0, ur - 1)
		return uu, b(0, pq(uu) - 1)
	end
	local function uv(uw)
		local ux = uw * so.rowsPerBeat
		ux = ul(ux)
		return ux / so.rowsPerBeat, ux
	end
	local function uy(uz)
		local va = uz // 1
		if uz - va <= kr then
			return h, va
		end
		if va + 1 - uz <= kr then
			return h, va + 1
		end
		return l, va
	end
	local function vb(vc)
		local vd, ve = uv(vc)
		local vf, vg = uy(ve)
		local vh, vi = vg, k
		if not vf then
			vh = vg + 1
			vh = ul(vh)
			vi = vh
		end
		local vj, vk = ss(vh)
		return vj, vk, vd, ve, vi
	end
	local function vl(vm, vn, vo)
		local vp, vq = so.time, vm
		if vq == k then
			local vr = time()
			vq = vr - so.prevWallMillis
			so.prevWallMillis = vr
		end
		if vq < 0 then
			vq = 0
		end
		vp.wallFrame = vp.wallFrame + 1
		vp.wallDeltaMillis = vq
		vp.wallMillis = vp.wallMillis + vq
		vp.didSeek = vp.didSeek == h
		if so.isPlaying and vo ~= h or vn == h then
			local vs = sc(so.baseTempo, so.baseSpeed)
			local vt = ks * so.playbackRate * vs / 6e4
			vp.demoDeltaBeats = vt
			vp.demoBeats = vp.demoBeats + vt
		else
			vp.demoDeltaBeats = 0
		end
		tg()
		return vp
	end
	local function vu(vv)
		vv.demoMillis = sp(vv.demoBeats)
		vv.demoDeltaMillis = sp(vv.demoDeltaBeats)
		sv(vv)
		td(vv)
		return somatic_project_time(vv)
	end
	function somatic_get_raw_time()
		return so.time
	end
	function somatic_get_time(vw)
		return somatic_project_time(so.time, vw)
	end
	function somatic_set_completion_callback(vx)
		kl = vx
	end
	function somatic_set_row_callback(vy)
		km = vy
		kn = k
	end
	function somatic_end_frame()
		so.time.didSeek = l
	end
	local function vz()
		ke = 0
		kf = 0
		kg = -1
		kh = l
		ki = l
		en = { j, j, j, j }
		eo = { j, j, j, j }
		ep = { k, k, k, k }
		eq = { k, k, k, k }
		eu = {}
		if kk then
			rn()
		end
	end
	vz()
	local function wa(wb, wc, wd)
		so.isPlaying = h
		so.pendingAudioAbsRow = k
		tg()
		ke = wb + 1
		kf = wb
		kh = l
		kg = 0
		ki = l
		if kk then
			rn()
		else
			rq(wb, kp, 0)
		end
		local we, wf = pp(), ke
		if we == 0 then
			ri(kq)
			ki = h
		elseif wf >= we then
			if kj then
				wf = 0
				ke = 0
				rq(wf, kq, 1)
			else
				ri(kq)
				ki = h
			end
		else
			rq(wf, kq, 1)
		end
		ro()
		for wg = 1, #lo do
			eu[lo[wg]] = 0
		end
		kd = h
		if wd ~= h then
			ub(wb, wc)
		end
		sn = so.time.demoBeats - somatic_position_to_beat(wb, wc)
		so.prevWallMillis = time()
		if so.isPlaying then
			music(0, 0, wc, h, h, so.tempo, so.speed)
		end
	end
	local function wh(wi, wj)
		music()
		if wi ~= l then
			so.isPlaying = l
		end
		if wj ~= h then
			so.pendingAudioAbsRow = k
		end
		tg()
		vz()
	end
	local function wk(wl)
		wh(l, h)
		ro()
		so.pendingAudioAbsRow = wl
		kd = h
		so.prevWallMillis = time()
	end
	local function wm()
		local wn, wo, wp, wq, wr = vb(so.time.demoBeats)
		if wr == k then
			wa(wn, wo, h)
		else
			wk(wr)
		end
	end
	local function ws(wt)
		local wu = so.pendingAudioAbsRow
		if wu == k then
			return l
		end
		local wv = wt.demoBeats * so.rowsPerBeat
		if wv + kr < wu then
			return h
		end
		local ww, wx = ss(wu)
		wa(ww, wx, h)
		return l
	end
	function somatic_seek(wy, wz)
		local xa, xb, xc = vb((wy or 0) - tk(wz))
		local xd = so.time
		xd.demoBeats = xc
		xd.demoMillis = sp(xc)
		xd.demoDeltaMillis = 0
		xd.demoDeltaBeats = 0
		xd.didSeek = h
		sv()
		if so.isPlaying then
			wm()
		else
			wh(l)
		end
		return somatic_project_time(xd)
	end
	function somatic_seek_position(xe, xf, xg)
		return somatic_seek(somatic_position_to_beat(xe, xf), xg)
	end
	function somatic_set_options(xh)
		xh = xh or {}
		ti(xh.syncOffsetMS)
		local xi = so.isPlaying
		local xj = xi and (xh.tempo ~= k or xh.speed ~= k)
		tw(xh)
		if xi and not so.isPlaying then
			wh(l)
		elseif not xi and so.isPlaying or xj then
			wm()
		end
		return somatic_project_time(so.time)
	end
	function somatic_advance_frame()
		if so.isPlaying then
			return somatic_project_time(so.time)
		end
		return vu(vl(ks, h))
	end
	local function xk()
		local xl, xm, xn = a(81916), a(81917), a(81918)
		if xl == j then
			xl = -1
		end
		return xl, kf, xm, xn
	end
	function somatic_tick(xo, xp)
		ti(xp)
		local xq = not kd
		if xq and so.isPlaying then
			wm()
		end
		local xr = vl(xo, l, xq)
		if not so.isPlaying then
			return vu(xr)
		end
		if ws(xr) then
			return vu(xr)
		end
		local xs, xt, xu, xv = xk()
		if xs == -1 then
			return vu(xr)
		end
		if xu ~= kg then
			if ki then
				ug(so.songBeatCount)
				wh(h)
				local xw = vu(xr)
				if kl ~= k then
					kl()
				end
				return xw
			end
			kh = not kh
			kg = xu
			if ke <= kf then
				sn = sn + sl
			end
			kf = ke
			ke = ke + 1
			local xx, xy = kh and kp or kq, pp()
			local function xz()
				ri(xx)
				ki = h
			end
			if xy == 0 then
				xz()
			elseif ke >= xy then
				if kj then
					ke = 0
					rq(ke, xx, (xu + 1) % 16)
				else
					xz()
				end
			else
				rq(ke, xx, (xu + 1) % 16)
			end
			ug(somatic_position_to_beat(kf, xv))
		end
		pf(xs, xu, xv)
		return vu(xr)
	end
end
-- (end Somatic playroutine)

-- Frame01

--Arrow = "0c000080D3E2A2D2E2A3D2EA5DDA47EA6DEA5D2A6DDA7DA10"

F1_Door_01 =
	"0c0001c0ADDA5D4A2D4A2D5AAD3ADAAD3ADDAD3ADDAD3ADDA47EEA5DDE2A324D2ADDA2DDADDA3DADDA3DADDA3DADDA3DADDA3DADDA3DAD6E2D6ED38ED5EDEA6E3A3D2EMEEADDEDMEEMDEDEMEEMEDEEMEEMDE2MEEME3MEEMA23MEEA4ME2MA2ME2M2AME2M4E2M3A47MMA5M5A38I2A4D2A3D2A3D2MA40IIA24DDADDA2DDADDA2DDADDA2DDADDA3DADDA3DADDA3DADDAADADAD6EDED3EDEED2EDEDEDDEDE3D2EDEDEEDEDEDEED2EDEDEEDEDEDEEDEDEMEEMEDEEMEEMDEDEMEEME3MEEMDEDEMEEMEDEEMEEMDEDEMEEME3MEEMME2M4E2M4E2M4E2M4E2M4E2M4E2M4E2M68AD2MMAM6AM6AM6AM6AM6AM15A55MA8DADAEDAADADADDAADADADDAADADAEDAADADADDAADADADDAADADAEDAADADAD4EDEDEED2EDEED2EDEDEEDEDE3D2EDEDEEDE2DEED2EDEDEEDEDE3DEDEMEEME3MEEMDEDEMEEME3MEEMDE2MEEDE3MDDE2D2M2EDDE4ME2M4E3M3EEDM4DM2E2DMME12M2E7M2EEM32EM5E5MMEEMEMEME8M55E3M5A5MMA5MMA5MMA5MMA5MMA5MA6MA8DADADDAADADAEDADDADAD4ADAD4ADAED3AD6A2D4A4D2EDEDDEDE2DDED4EDED3E2D3EDEDED3EDED7ED8E7DE5DEDEDEDE3DE3DEDEDEDEEDEDEDEEDEDEDEDEDDEDEDEDE5MME23DEDE5DE5DEDEDEDEEDE4DME2MEMEEM2E7M2E7ME31MEMEMEMME9ME2MEMME7M2E7M2E15MA6EA6EA6EEA5EEA5EEA5MMA5EEA6D3A7DDA7DA41D5A4D3A5DAD2A7DDA7DDA15D2ED2ED5ED8AD6A3D3A5D4A7DDA2D2EDEDEEDEDEDEEDEDEDEDED3EDED7ED7AD6A2D5EDEDE3DE5DEDEDEDEEDEDE3D2EDEDEEDEDEDED3EDEDED3EDEDE15DE14DEDEDEDE8DEDEDEDEEDEDE4A6EA6EAADA3EAADA3EAADA3EAADA3DAADA3EAADA136DDA7DA52D3A7D2A7DDA7DDA23D6ED7AAD5A3D3A5D4A7DDA7DDADEDEDEDEDDEDEDED5EDED5ED16A2D4A4D3AADA3EAADA3DAADA3EAADA3DAADA3DAADA3DAADA3DAADA266DA55DDA4DAADDA7DDA7DDA31DAADA6DA6DDA2DAADDA3D3A5DDA5DDA6DA2"

F1_Door_02 =
	"0c0001c0ADA6D2A4DADDA3DDADA3D2ADA3D2ADA3DDADA4DADDA55DDA329DADDA3DADDA3DADDA3DADDA3DADDA2DDADDA2DDADDA2DDAD6A2D38ED5ED5EDEA7DA6DDEDA3DEDE3AEDEDMEEMDEDEMEEMEDE4MDEDEMEEMA31MEEA4ME2MA2ME2M2AME2M3A55M2A49I2A4D2A3D2A48IIA16DDADDA3DADDA3DADDA3DADDAADADADDAADADAEDAADADADDAADADAD5EDED3EDEDEEDEDEDEED2EDEDEEDEDEDEED2EDEDEED2EDEED2EDEDE4MEEMDEDEMEEMEDEEMEEMDEDEMEEME3MEEMDEDEMEEME3MEEMDEDEMEEMME2M4E2M4E2M4E2M4E2M4E2M4E3M3EEDM9AAM55A2D2MA2D2MMAM6AM39A31MA6MMA5MMA5MMA7DADAEDAADADADDAADADADDAADADAEDAADADADDAADADADDAADADAEDADDADADDEDEDE3D2EDEDEEDE2DEED2EDEDEEDEDE3D2EDEDDEDE2DDED4EDE4MEEMDE2MEEDE3MDDE2D2M2EDDE4DE7DE5DEDEDEDEMDM2E2DMME12M2E7M2E7MME15M8EM5E5MMEEMEMEME8ME2MEMEEM2E7M2EM31E3M4EMEMEMME9ME2MEMMA5MMA5MMA5MA6MA6MA6EA6EA6D2ADAD4ADAED3AD6A2D4A5D3A7DDA7D4E2D3EDEDED3EDED7ED7AAD5A4D3A5DE2DE3DEDEDEDEEDEDEDEEDEDEDEDEDDEDEDED3ED2ED5ED8E7DEDE5DE5DEDEDEDEEDE4D3EDEDEEDEDEDEEDEDEDEDE7ME31DEDEDE3DE5DEDEDEDEMME7M2E7M2E31DE8A5EEA5EEA5MMA5EEA5EA6EA6EAADA68D2A7DDA7DDA40D6A3D3A5D4A7DDA7DDA7DA7D3EDED7ED7AD6A2D4A4D3A7D2A3EDEDE3D2EDEDEEDEDEDED3EDEDED3EDED7ED7AAD5E7DEDEDEDE8DEDEDEDEEDEDE3DEDEDEDEDDEDEDED5EDEEAADA3EAADA3EAADA3DAADA3EAADA3DAADA3EAADA3DAADA199DDA7DDA51D3A5D4A7DDA7DDA7DA15D5ED16A2D4A4D4A4DAADDA7DDAAEAADA3DAADA3DAADA3DAADA3DAADA3DAADA6DA6DDA328DDA55DAADDA3D3A5DDA5DDA6DA26"

F1_Door_03 =
	"0c0001c0AD2A5D3A4D3A4DADA4DADDA3DADDA3DADDA3DADDA39DDA5D4A2D7A323DADDA2DDADDA2DDADDA2DDADDA2DDADDA3DADDA3DADDA3DAD32ED3EDED3EDEDEDDEDEDEED2EDEDEDDEA4DEDEDEAAEDEDE3DEDE5DEEMEEMDEDE3MEDEEMEEMDEDEMEEMA15MA6MEEA4ME2MA2ME2M2AME2M4E2M3A47M2A4M5A38I2A4D2A3D2A3D2MMA39IIA23DADADDAADADAEDAADADADDAADADADDAADADAEDAADADADDAADADADDAADADAEDEDEDEDEED2EDEDEED2EDEED2EDEDEEDEDE3D2EDEDEEDE2DEED2EDEDE4MEEMDEDEMEEME3MEEMDEDEMEEME3MEEMDE2MEEDE3MDDE2D2M3E2M4E2M4E3M3EEDM4DM2E2DMME12M2E4M40EM5E5MMEEMEMEMEAAD2M59A6MMA5MMA5MMA5MMA5MMA5MMA5MA8DADADDAADADADDAADADAEDADDADAD4ADAD4ADAED3AD6A2DDEDEDE3D2EDEDDEDE2DDED4EDED3E2D3EDEDED3EDED7EEDDE4DE7DE5DEDEDEDE3DE3DEDEDEDEEDEDEDEEDEDEDEDE3M2E7MME23DEDE5DE5DEDEDEDE8ME2MEMEEM2E7M2E7ME27M4EMEMEMME9ME2MEMME7M2E7M2E7MA6MA6EA6EA6EEA5EEA5EEA5MMA5D2A5D3A7DDA7DA31D7AAD5A4D3A5DAD2A7DDA7DDA7DDEDEDED3ED2ED5ED8AD6A3D3A5D4A4EDE4D3EDEDEEDEDEDEEDEDEDEDED3EDED7ED7AD6E7DEDEDE3DE5DEDEDEDEEDEDE3D2EDEDEEDEDEDED3EDEDE24DE14DEDEDEDE8DEDEDEDE2A5EA6EA6EAADA3EAADA3EAADA3EAADA3DAADA134DDA7DDA7DA42D4A4D3A7D2A7DDA7DDA15D3EDED7ED7AAD5A3D3A5D4A7DDA2EDEDE3DEDEDEDEDDEDEDED5EDED5ED16A2D4EAADA3DAADA3EAADA3DAADA3EAADA3DAADA3DAADA3DAADA264DDA7DA52D4A4DAADDA7DDA7DDA23DAADA3DAADA6DA6DDA2DAADDA3D3A5DDA5DDA390DA58"

F1_Door_04 =
	"0c0001c0ADDA7D3A4DADA4DADA4DADA4DADDA2DDADDA2DDADDA47DDA5D4A325DDADDA2DDADDA3DADDA3DADDA3DADDAADADADDAADADAEDAADADAD20ED2EDDED2ED5EDDED2EDED3EDEDEED2EDEDA7EDDA4D2EDEAADDEDEDEEDEDEDEEMEDEDME2DEDE3MEDEEMEEMA23MA6E2A4ME2MA2ME2M4E3M2A55M3A48I2A4D2A3D2MA47I2A4MMA7DADADDAADADAEDAADADADDAADADADDAADADAEDAADADADDAADADADDAADADAED3EDEDEEDEDEDED3EDEDEEDEDEDEED2EDEDEEDEDE3D2EDEDDEDE2DDEDEDEMEEME3MEEMDE2MEEDE3MDDE2D2M2EDDE4DE7DE5MEEDM4DM2E2DMME12M2E7M2E7MME7M5AAM8EM5E5MMEEMEMEME8ME2MEMEEM2E3A2D2MMAAD2M26E3M4EMEMEMME7MMA5MMA5MMA5MMA5MA6MA6MA6EA7DDADAD4ADAD4ADAED3AD6A2D4A5D3A7DDAD4EDED3E2D3EDEDED3EDED7ED7AAD5A4D3EDEDEDE3DE3DEDEDEDEEDEDEDEEDEDEDEDEDDEDEDED3ED2ED5EDE15DEDE5DE5DEDEDEDEEDE4D3EDEDEEDEDEDE5M2E7ME31DEDEDE3DE7ME2MEMME7M2E7M2E32A6EEA5EEA5EEA5MMA5EEA5EA6EA13DA55DA5DAD2A7DDA7DDA31D7AD6A3D3A5D4A7DDA7DDA7DDEDEDEDED3EDED7ED7AD6A2D4A4D3A6DEDEDEDEEDEDE3D2EDEDEEDEDEDED3EDEDED3EDED7ED8E14DEDEDEDE8DEDEDEDEEDEDE3DEDEDEDEDDEDEDEDEAADA3EAADA3EAADA3EAADA3DAADA3EAADA3DAADA3EAADA196D2A7DDA7DDA41D5A3D3A5D4A7DDA7DDA7DA7D4EDED5ED16A2D4A4D4A4DAADDA3DAADA3EAADA3DAADA3DAADA3DAADA3DAADA3DAADA6DA327DDA7DDA50DDA2DAADDA3D3A5DDA5DDA6DA18"

F1_Door_05 =
	"0c0001c0ADDA7D2A4DDADA3DDADA3DDADA3DDADA4DADDA3DADDA55DDA329DADDAADADADDAADADAEDAADADADDAADADADDAADADAEDAADADADDAADADAD6A2ED2EDED3EDEDEED2EDED3EDEDEEDEDEDED3EDEDEEDEDEDEEA15DEDA4EDEEMEAADEDEMEEME3MEEMDE2MEEDE3MDDEA31MA6MDMA4DMMEEA2E7A116I2A4D2A55I2A6DADAEDAADADADDAADADADDAADADAEDADDADAD4ADAD4ADAED3AD6EDEDEEDEDE3D2EDEDDEDE2DDED4EDED3E2D3EDEDED3EDEDEED2M2EDDE4DE7DE5DEDEDEDE3DE3DEDEDEDEEDEDEDEEM2E7M2E7MME23DEDE5DE7MEA3E5AAME2MEMEEM2E7M2E7ME15A3D2MA2D2MMAAD2EMME9ME2MEMME7M2E7M3A6MA6MA6EA6EA6EEA5EEA5EEA5D2A2D4A5D3A7DDA7DA23D6ED7AAD5A4D3A5DAD2A7DDA7D2EDEDEDEDDEDEDED3ED2ED5ED8AD6A3D3A5D2EDEDEDEEDE4D3EDEDEEDEDEDEEDEDEDEDED3EDED7ED7E15DEDEDE3DE5DEDEDEDEEDEDE3D2EDEDEEDEDEDEDE31DE14DEDEDEDE8MMA5EEA5EA6EA6EAADA3EAADA3EAADA3EAADA131D2A7DDA7DDA7DA32D6A2D4A4D3A7D2A7DDA7DDA7D2EDEDED3EDED7ED7AAD5A3D3A5D4A4DEDEDEDEEDEDE3DEDEDEDEDDEDEDED5EDED5ED17AADA3EAADA3DAADA3EAADA3DAADA3EAADA3DAADA3DAADA262DDA7DDA7DA42D4A4D4A4DAADDA7DDA7DDA15DAADA3DAADA3DAADA6DA6DDA2DAADDA3D3A5DDA389DDA6DA50"

F1_Door_06 =
	"0c0001c0ADDA7D2A5DADA4DADA4DADA2DADADA2DADAEA2DADADDA385DADADDAADADAEDAADADADDAADADADDAADADADDAADADADDAADADADDAADADAED2A5D4A2D9ED9EDEED2EDED3EDEDDEDE2DDEA23EDEA4DED2EAAEDDE4DE7DE5A39EA6E2A4E4A127I2A64DDADAD4ADAD4ADAED3AD6A2D4A5D3A7DDAD4EDED3E2D3EDEDED3EDED7ED7AAD5A4D3EDEDEDE3DE3DEDEDEDEEDEDEDEEDEDEDEDEDDEDEDED3ED2ED5EDE15DEDE5DE5DEDEDEDEEDE4D3EDEDEEDEDEDEEA7E3A3E5AAE23DEDEDE3DE5A4D2A3D2MA2D2MMAAD2M2E31I2A4MMA5MMA5EEA5MMA5EEA5EA6EA13DA55DA5DAD2A7DDA7DDA31D7AD6A3D3A5D4A7DDA7DDA7DDEDEDEDED3EDED7ED7AD6A2D4A4D3A6DEDEDEDEEDEDE3D2EDEDEEDEDEDED3EDEDED3EDED7ED8E14DEDEDEDE8DEDEDEDEEDEDE3DEDEDEDEDDEDEDEDEAADA3EAADA3EAADA3EAADA3DAADA3EAADA3DAADA3EAADA196D2A7DDA7DDA41D5A3D3A5D4A7DDA7DDA7DA7D4EDED5ED16A2D4A4D4A4DAADDA3DAADA3EAADA3DAADA3DAADA3DAADA3DAADA3DAADA6DA327DDA7DDA50DDA2DAADDA3D3A5DDA5DDA6DA18"

F1_Door_07 =
	"0c0001c0ADDA6D3A3DADADA2DADADA2DADADA2DADADA2DADADDAADADADDA55DA328DADADDAADADADDAADADADDAADADADDAADADAD2ADADAD2ADADAD4AD5A5D4A2D28EED3EDEDED3EDEDA23DDEA4DEDE2AAE6ADEDE5DEDEDEEA47EA6E2A196D2A2D4A5D3A7DDA7DA23D6ED7AAD5A4D3A5DAD2A7DDA7D2EDEDEDEDDEDEDED3ED2ED5ED8AD6A3D3A5DDE4A2EDE5DEDEDE3DEDEDEEDEDEDEDED3EDED7ED7A15E3A3E5AADEDE5DEDE3DEDEDE3DEDEDEDA4I2A4D2A3D2EA2D2EEAAD2E16DE8A7I2A4EA6EA6EA6EAADA3EA6EAADA131D2A7DDA7DDA7DA32D6A2D4A4D3A7D2A7DDA7DDA7D2EDEDED3EDED7ED7AAD5A3D3A5D4A4DEDEDEDEEDEDE3DEDEDEDEDDEDEDED5EDED5ED17A6EAADA3DAADA3EAADA3DAADA3EAADA3DAADA3DAADA262DDA7DDA7DA42D4A4D4A4DAADDA7DDA7DDA15DAADA3DAADA3DAADA6DA6DDA2DAADDA3D3A5DDA389DDA6DA50"

F1_Door_08 =
	"0c0001c0ADA7D3A3DADADA2DADADA2DADADA4DADA2DADADDAADADADDA55DA328DADAD2A2DAD2ADADAD2ADAD3A5D2ADA6D2A7DDADDA5D4A2D2EDEDED3EDED7ED7AAD5A4D2A23EDEA4DEDEDEAADDEDEDEAD2ED2ED5EDA47DA6EDEA203DA55DA5DAD2A7DDA7DDA31D7AD6A3D3A5D4A7DDA7DDA7DDEDEDA2D3EDED7ED7AD6A2D4A4D3A22DEDEA3EDEDEDAAD2EDEDED3EDED7ED7A4I2A4D2A3D2EA2D2EEAAD2E3DE5DEDEDEDEDDEDEDEDA7I2A4EA6EA6DA6EAADA3DA6EAADA196D2A7DDA7DDA41D5A3D3A5D4A7DDA7DDA7DA7D4EDED5ED16A2D4A4D4A4DAADDA3DAADA3EA6DAADA3DAADA3DA6DAADA3DAADA6DA327DDA7DDA50DDA2DAADDA3D3A5DDA5DDA6DA18"

F1_Door_09 =
	"0c0001c0ADA7D3A3DADADA2DADADA2DADADA4DADDAADADAD2A2D3A55DA332D2ADA7DDA7DDA7DA23D2A4D5A3D5A4D3A5DAD2A7DDA7DDA23DDA5D4A3D4A5D3A5DDA47DA6D2A324D2A7DDA7DDA7DA32D3A5D4A4D3A7D2A7DDA7DDA23D2A4D3A5D3A5D3A5D4A17I2A3D3A2D3EAAD3EEAD3EED2E2D10A15I2A4EA6DA6EA6DAADA3DAADA262DDA7DDA7DA42D4A4D4A4DAADDA7DDA7DDA15DA6DAADA3DA9DA6DDA2DAADDA3D3A5DDA389DDA6DA50"

F1_Door_10 =
	"0c0001c0DA7DA6DA6DA6DA7DA7DA7IIA391IDA63IIDA7DDA7DDA7DA55DDA7DDA7IDA7DDA447DIDA7IDA7DDA7DA55IDA7DDA7DIA7DDA35I2A4O2IA2I4DAO3DDAD4A27DA4IIA7DA343DDA7DDA50DA12DADA14DA28"

F1_Door_11 =
	"0c0001c0IA7IA6IA6IA6IA7IA7IA7IIA391IIA63I2A7IIA7IIA7IA55IIA7IIA7IIA7IIA447I2A7IIA7IIA7IA55IIA7IIA7IIA7IIA35I2A4I3A2I3AIAI3A2I3A34IIA7IA14IA327IIA7I2A49IA6IA4I2A6IA6IA28"

F1_DoorLight_01 =
	"0c000180A270HA5HDA4HDDA3H2DA2HDHDHAAHDHDHDAHD2HDDHDA5D2A4HDADA3DAD2A2HDADA3D4A2D5AAD5A208HA5HHA4HDHA3H2DA2HDHDHAAH2DHHAH2DHDH3DHDHDDHDHD3HDHDHDHDDHD2HDDHDHDHDHD7HHDHDHDHDDHD2HDHD5AAD5AAD5AAD4A2HDADA3D2A4HDA5HHA148HA5HHA4H2A3H3A2H4AAHAAH2AHAHHAHAH11DHDH3AH2AH4AH2AHHA2H3AHAHAAHAH2AHHAHAHAHAH7DH5AH2AHA2H6AHAHHA3H2AHAHAAHAHA3HAHAHAHA8HA14HA14HA14HA85HA5HA5HA5HAHA3HHAHA2HA5HA3HAHA2HAAHAHHA2HAHA6HAHAHAHA8HAHAHAHA8HAHAHAHA3HA2HHAHAHAHAAHA5HAHAHAHA8HAHAHAHAAHA5HAHAHAHAAHA5HAHAHAHA8HAHAHAHA8HAHAHAHAAHA2HAAHAHAHAHA8HA14HA14HA37HA5HA5HA5HA5HHA4HA5HA3HAHA8HAHAHA10HA2HA8HA2HAHA10HA2HA8HAHAHAHAAHA5HAHAHAHA10HAHAHA24HAHAHAHA8HAHAHAHA8HA2HAHA14HA8HAHAHAHA5HAAHAHAHAHA8HAHAHAHA10HA68HA10HA12HA2HA12HA26HA310"

F1_DoorLight_02 =
	"0c000140A182HA5HDA4HDA4HD2A2HDHDA2HD2ADAH2DHDAHDHDHD3HDHD5HD4A15DA6DDA5DA6DDA5D2A4D2A123HA5HHA4H2A3HDHDA2H2DHAAHDHDHDAH2DHDHHDHDH9DH8DHDHD3HD3HD2HDHDDHDHDHDHD3HDHDHDAHDHDHD3HDHDHDAH6AD2A4D2A4D2A4DDA5DA85HA5HA5H2A3H3A2H2AHAAH5AH3AH3AHAHAHAAHAHAHAHHAHAHAH16AH2AH4AH5AHAHAHAAHAHAHAH3AHAHAAHAHAHAH5A2H3AHA2HA5H3AHAAHA7HAHAHAAHA7HAHAHA70HA5HAHHA2HAHA3HAAHAHAHAHA3HAAHAHAHA10HAHAHAHAAHA5HAHAHA5HAAHAHAHAHA8HAHAHAHA5HAAHAHAHAHHA2HAHAAHAHAHAHA8HAHAHAHA8HAHAHAHA5HAAHAHAHAHA8HAHAHA10HAHAHA10HAHAHA3HA76"

F1_DoorLight_03 =
	"0c000100A126HA5HDA4HDDA3HDHDA2HD2A2H2DHDAHDHDHDDHDHDHD5HD3A7DA7DA5D2A5DA5D2A4D3A3D3A66HA5HHA4HDHA3H2DA2H4AAH5AH5DH7AH7DHDHD3HD3HDHDHDHDDHDHDHDHDDHDHDHDHDH5DDHHDHHDHDH5AHD3A3D3A3D3A3D2A5DA5DA28HA5HAHA3HAAHA2HAAHA2HAAHAHAHAAHA2HAAHA2HA5HAHHAH5AH2AHAAH2AHAHHAHAHA3HAHA2HHAHA2HAAHA13H5AAH4AHAAHAHA3HAHAHA3HA7HA86HA252"

F1_DoorLight_04 =
	"0c0000c0A70HA5HDA4HDHA3HDHDA2H2DHAAHDHDHDAHDHDHDHHDHDHDHDDA6DDA5DADA5D2A3DADA4HD2A3D4A2HD3A9HA5HA5HAHA3HAHA3HAHAHAAHAHAHAAHAHAHAHHAHAHA2HHDHDHDH5DHDH5DHHAH4DAH3AH3AHAHHDAAHAHADHAHAHAAHADHD2A2HD3A2D4A2HD2A3DADA4DDA5DA6HA7HA12HA47HA3HA5HA114"

F1_DoorLight_05 =
	"0c000080A22HA5HDA4H2A3HAHA3HAHAHAAHAHAHAAHDA4HD2A3DHDHDA2HDHD2A2HDHDA2HDHD2A2HDHD2AHAHD3AAHAHAHAHHAHAHAHA49HAHD2AHAHDA51"

F1_Logo =
	"0c000300AAC2A3C2PA2H2PPA2H2PPA2H2PPA2H2PPA2H2PPA2H2PPA9CA4PCCA3PPHHA2H4A2H4A2H4A2H2CCA2H2C5A3C2PCA2HHPCPAAPH2PPAH4PPAH4PPAHHAHHPPCHHAHHPCPHHA2C4PPC4PPH4PCH6PH6PH6PHHPAH2PHPPAH2PA3C2ACAAC2PAPAH2PPAPAH2PPAPAH2PPAPAH2PPCPAH2PHHPAH2PHHA2C4AAC4PAH4PCH26PPAH4PPAHHA2C13H23PH6PPAH4PPAH3C4AC5PACCH2PH2PH2PH2PH2PH2PH2AH2P2AAH2P2AAH2PCA4CCPA2C3PAACH3PAH5PAH5PH6PH3PHHPH3PHHCCA5CPCA4PCPA3HHPPCCAH2PCCPCH4PH6PH2PH2AH2PAC4AAC4PCAH3PCPAH4PPCH4PCCH6PPAH4PPCH4PA23CA6PA6PA6PA14H2PPA2H2PPA2H2PPA2H2PPA2H2PPA2H2PPA2H2PPA2H2PPA5H2CCA2H2CCA2H2CCA2H2CCA2H2CCA2H2CCA2H2CCA2H2CCAH3PHHAH3PHHAH3PHHAH3PHHAH3PHHAH3PHHAH3PHHAH3PH2PPA2HPHPPAC3HPPC4HPPH3PHPPH5PPH5PPH5PPAH3AAH2PHHCAH2PPAPCH2PPACPH2PPAHPH2PPAHPH2PPAHPH2PPAHPH2PPAH2PPAH4PPC2H2PC3H6PAH6AH6A3H3C4AH2PAAH3CA2H3PCCAH3CCPAH4PPAH4PPAH4PPAH4PPAH3PPAAH2P2AAH2P2AAH2P2AAH2P2AAH2P2AAH2P2AAH2P2AAH2PPH2PPAAPH2PPAAPH2PPAAPH2PPAAPH2PPAAPH2PPAAPH2PPAAPH2PPAAHA2H2PA3H3A3H3A5HHA6HA6HA7C4AC3PAHA2HPPC2AAHPC2PCAH3PCPAH4PPCH4PCCAAH4PCAH4PA31CA6PA6PA6PA6H2PPA2H2PPA2H2PC3H2C4H23A10H2CCA2H2C4H2C3PH2CCHPPH5PAAH4A2H3A8H3PHHAH3PHHCHHP2HHCHHPPAH4PAAH3PA4HHA13HPPAH4PPAH4P2H2PHHPPH2PH6PH5PAH5A9HPH2PPCHPH2PHHPPH2PHHPAH2PHHAAH2PPA2H2PA3H2A10C3PAH4PPAH4PPCH4PCCH9AH5PAH5A8HPPAH4PPAH4PPAH4PAAH4A2H3A3H3A3H3A7PPAAH2P2AAH2P2AAH2P2AAH2P2AAH2PPA2H2PA3H2A8PH2PPACPH2PPHHPH3PHHPH3PHHPH6AAH5AAH5A7C3PC2H2PH2PH2PH6PH4PPAH4PA3H2A4HHA7PCH4PCCH4PHPH4PHCH4AH4PPAH4PAAH4A10PA6PA54"

F1_Logo02 =
	"0c000200A3C3A2C4AAH5AH18PAAH3PPAAH3PPCAHC2A2C3PCAC2HPCPH5PPH5PPH5PPH6PH6AH3C5AAC4PPAH3P2CH4PCPH5P3AH2P3AH2PCPPAH3PA3C3A2C3PAAH3PPAAH3PPAAH3PPCAH3PCPH5PPH5PA6CA5CCA4H2A3H3CAAH4PAAH3PPAAH3PPAAH3PC5AAC4PAAH3PPCAH3PCPAH4PPAPH3PPAPAH2PAAPAH2A4C5AC6H26PPA2H2PPA2H2PPA2C2A4CCPA4HPPA4HPA5HA30H2PCPCCH3PCCPH5PCAH6AAH5A3H3A5HHAAC2AAHA3H3CCAAH3CPPAH3P2CH4PCPH5PPH5PPH6PH3PPAH3P2AH3P2CH2P2H4PAH5AAH4A2H2A4PPA4HAH5PAH5PAH10PH5PPH5PPH5PPH10PCAH3PCPAH3P2AH3P2AH3P2AH3P2CH3PPCPH3PHPPH3PPA6PA6PA6PA6PA6PA6PA6PA2C2AH2PPA2H2PC3H2C4H26PPA2H2PPA10C2A4CCPA4HPA5HA31C2PAAH3PPCAH3PCPPH4PPH9AH6AAH5A7H2PH6PH5PPH5PAH5AAH4A2H3A3H3A7PPA4HPPA4HPPA4HPPA4HPPA3HHPA4HHA5HHA7H25PPAAH3PA2H3A4HHA5HA7HPPH3PHPPH3PHPCH3PHHPH3CHHPPH5PAH5A2H2A7PAAC2PAPAH2PPACCH2PPACH3PAAH4A2H3A3H2A12H2PPA2H2PPA2H2PC3H2C4H23A23C2A4CCPA4HPPA4HPA5HA14"

F1_Ship01 =
	"0c000140F93HHF4H2F2H4FFH13F5HHFO3KH3O3KKH3O3H5OOHHKH3OH2KKH7KKPKF6HKKF4H2KKF2KKH2KKFOOKH3KO2KKH2O4KKH3O3KF3A3F3A3F3A3F3A3KF2A3HKKFA3HHPKA3KPPIA3F6HF4H2F2H4FFH5FIH5I3H3IADI2HHIADEAI2H31I2H4IAI2HHPIA2IIPPA5IIH4P2H3PPIIH2PPI2HHPPI2HP2I2HHPI2H3I2H4IIH4PIH3O2IH4PPH4P2H3PIPPH2PIIPPHPPI2P2I4P2I4PFPPIIA3PI2A3PI2A3PI2A3PIIFA3PIFFA3PF2A3F3A3IADE2AIIADE2PAPAADDEPAFPA2DPAFFPPAAPAF3PPAAF5PAF6PIIA3IIAI2AAIHPDAI2HHPDEEI3PDE2AAIPDE3AIAADE2AAPAADDEAAH5PPH4PIIH2PPI2HHPPI2HIIPIIH2IPIIH3IAAH4IA2IHHI6FFIHKKIF2H3KKFFH3IIFFH2I2FFHI4FFI5FFI4F6A3F3A3F3A3F3A3F3A3F3A3F3A3F3A3F47A15FPA2DAAFFPPA3F3PPAPF5PF16A15IA3I2PA3I2A4I2PA3IIFFPPAAIF4PPF2A15I2F4IIF5IF30A15F3A3F3A3F3A3F3A3F3A3F3A19"

F1_Ship02 =
	"0c000140F93CCF4C2F2C4FFC13F5CCFNNM2C3M5C3NM2C5MMCCMC3MC2MMC7MMPMF6CMMF4C2MMF2MMC2MMFM2C3MNM3C3NM4C3NM3F3A3F3A3F3A3F3A3MF2A3CMMFA3CCPMA3MNPIA3F6CF4C2F2C4FFC5FIC5I3C3IPDI2CCIPDEPI2C31I2C4IPI2CCPIP2IIP7IIC4P2C3PPIIC2PPI2CCPPI2CP2I2CCPI2C3I2C4IIC3PPIC3NMMIC4NOC4POOC3PIOOCCPPIIOOCPPI2OOPI4OOPI4OFNPIIA3OI2A3OI2A3OI2A3OIIFA3OIFFA3OF2A3F3A3IPDE2PIIPDE2P4DDEPPFP3DPPFFP5F3P3F5PPF6PIIP3IIPI2PPICPDPI2CCPDEEI3PDE2PPIPDE3PIPPDE2P4DDEPPC4P2C3PPIIC2PPI2CP2I2CIIPIIC2IPIIC3IPPC4IP2ICCI6FFICMMIF2C3MMFFC3IIFFC2I2FFCI4FFI5FFI4F6A3F3A3F3A3F3A3F3A3F3A3F3A3F3A3F47A15FP3DPPFFP5F3P3F5PF16A15IP3I2P4I2P4I2P4IIFFP3IF4PPF2A15I2F4IIF5IF30A15F3A3F3A3F3A3F3A3F3A3F3A19"

F1_BgDitherExtended =
	"IAIAIAIAIA2IAIAIAIA2IAIAIAIAIAIAIA15IAIAIAIAIAIAIAI4AIAIAIAIIAIAIAIAIAIAAIAIAIAI2AI2AIAIAIAIAIAIAIAIAIAIAIAIAIAIAI2AI2AI2AIA4IAI2AIA2I2AIAIA2IIAI2AI11A6IA2IA18IAAIA33I3A5IAIAIAIAIIAAIIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA5IIAIAIA3IIAIAIAIAAIAIAIAIAIAI2AI2AIA3IAIAIAIAIAIAIA2IAIAIA2IAIAIAIA21IAIAIAIAIAIAIAIAI2AIAAIAIAIAIAIAAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAI2AI2AI2A4I2AI2A2IAIAIAIA2IIAIAIAIAI9A4IA2IA23IA40IAIAAIAIAIAIIAAIIAIAIAIAIAIAIAIAIA2IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA5IIAIAIA3IIAIAIAIAAIAIAIAIAIAIAIAIAIAIA5IAIAIAIAIAIAIAIAIAIAIAIAIAIAIA5IA2IAIA16IAIAIAIAIAIAIAAIAIAIAIAIAAIAI2AIAIAI2AIAIAIAIAIAIAIAIAIAIAIAIAIAIAI2AI2AI2AIA4I4AIA2IAIAI2A2IIAI2AI10A7IA2IA21IA47IAIAIIAAIAAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA5IIAIAIA3IIAIAIAIAAIAIAIAIAIAIAIAIAIAIA7IAIAIA2IA2IA2IA2IA2IAIA11IA2IAIAIA14IA2IAIAIAIIAIAIAIAAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAI2AIAIAI2A4I2AIAIA2IAIAIAIA2IIAIAIAI4AI5A33IA47IAIAIIAAIIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIAIAIAIAIAIAIAIAIA5IIAIAIA3IIAIAIAIAAIAIAIAIAIAIAIAIAIAIA5IAIAIAIAIAIAIAIAIAIAIAIAIAIAIA5IA2IA2IAIAIAIAIAIAIA14IAIAIAIAAIAIAAIAI2AI2AI2AI2AIAIAIAIAIAIAIAIAIAIAIAIAI2AI2AI2AIA4I4AIA2I2AI2A2IIAI2AI10A34IA49IAIIAAIIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA5IIAIAIA3IIAIAIAIAAIAIAIAIAIAIAIAIAIAIA7IA2IA2IA2IAIAIA2IA2IAIA7IA6IA2IAIAIAIAIAIAIA14IA3IAAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAI2AI2A4I2AIAIA2IAIAIAIA2IIAIAI2AI6AIA34IA55IIAIAIAIAIAIAIAIAIA2IAIAIAIAIAIAIAIAIAIAIA2IAIAIAIAIA5IIAIAIA3IIAIAIAIAAIAIAIAIAIAIAIAIAIAIA9IA2IAIAIAIAIAIAIAIAIAIAIA5IA2IA2IAIAIAIAIAIAIAIAIAIAIAIAIA16IAIAIAIAIAI2AIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAI2AIA4I2AIAIA2I2AI2A2IIAIAIAI10A34IA55IAAIAIAIAIAIAIAIA2IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA5IIAIAIA3IIAIAIAIAAIAIAIAIAIAIAIAIAIAIA7IA2IA2IA2IA2IA2IA2IAIA15IA2IA2IAIAIA2IAIAIA2IAIAIA10IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA4I2AIAIA2IAIAIAIA2IIAIAIAIAI2AI2AIA34IA55IIA2IA2IAIAIA6IA2IAIAIA2IAIAIA2IAIAIA2IAIAIA5I3AIA3IIAIAIAIAAIAIAIAIAIAIAIAIAIAIA9IA2IAIAIA2IAIAIAIAIAIAIA5IA2IA2IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IA2IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA4I6A2I2AI2A2IIAIAIAI2AI6A34IA50IA3IA9IA2IA2IA2IAIAIA2IAIAIAIAIAIAIAIAIAIAIAIA5IIAIAIIA2IIAIAIAIAAIAIAIAIAIAIAIAIAIAIA11IA2IA2IA2IA2IA2IAIA7IA6IA2IA2IA2IA2IA2IAIAIA2IAIAIAAIIA14IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA4I2AIAIA2IAIAIAIA2IIAIAIAIAI2AI2AIA34IA50IA28IA2IA2IA2IAIAIA2IA2IA2IA6IAIAIA3I3AIAIAAIAIAIAIAIAIAIAIAIAIA17IA2IA2IAIAIAIAIA5IA2IA2IA2IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAI2AIA18IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA8IAIA2I2AI2A2IIAIAIAIAIAI2AI2A34IA50IA30IA2IA2IA2IA2IAIAIA2IAIA15IIAI2AIAAIAIAIAIAIAIAIAIAIAIA19IA2IA2IA2IAIA15IA2IA2IA2IA2IA2IA2IAIAIA2IAI2A24IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA4I2A8IAI3AAIIAIAIAIAIAIAIAIAIA34IA50IA40IA6IA2IA2IA5I7A6I2AAIAIAIAIAIAIA2IAIAIA25IAIAIAIAIA5IA2IA2IAIAIA2IAIAIAIAIAIAIAIAIAIAIAIAIAIAI2AIA30IAIAIAIAIAIAIAIAIAIAIAIAIA4I4AI5A10IAIAIAIAIAIAIAIA34IA50IA34IA6IA2IA2IA2IA7IIAIAIAIAI5A12IAIAIAIAIAIA27IA2IAIA7IA6IA2IA2IA2IA2IA2IA2IA2IAIAIAAIIA36IAIAIAIAIAIAIAIAIAIAIA4I2AIAIAI2AI6A11IAIAIAIA34IA50IA52IA2IA5IIAIAIAIAIAIAIAIAI5AIA10IAIA29IA2IA5IA2IA2IA2IAIAIA2IAIAIA2IAIAIA2IAIAIA2I2AIA42IAIAIAIAIAIAIA4I2AIAI6AI3AI8A45IA49IA54IA7IIAIAIAIAIAIAIAI3AIAIAIAI4AIA41IA17IA2IA2IA2IA2IA2IA2IA2IAAIIA48IAIAIAIAIA4I2AIAIAI2AIAIAI3AI14A39IA47IA63I5AIAIAIAIAIAIIAIAIAIAIAIAIAIAI4A37IAAIA2IA2IA2IA2IAIAIA2IAIAIAIAIAIAIAIAIAIAI2AIA54IA6IIAIIAI4AIAIIAI18A41IIA42IA67I3AIAIAIAIAIIAIAIAIAIAIAI2AIAIAIA42I2A12IA2IA2IA2IA2IA2IA2IAAIIA70I2AIAIAIIAIAIAIAI10AIIA45IIA37IA74I4AIIAIAIAIAIAIAIAIAIAIAIA40IA2IAAIIA2IA2IA2IA2IA2IAIAIA2IAIAIA2I2A64I2A9I2AIAIAIAIAI2AI6A50I2A32IA62IA4IIA11IIAIAIAIAIAIAIAIAIAIA52IIA3IA2IA2IA2IA2IA2IA2IAAIIA60IIAAIAIAI4A9I3AAIAIAIAIAIAIA55IIA28IA62IA4IAIAI5A9I3AIAIAIAIAIA40IA2IA2IA2IA2I2AIA2IAIAIA2IAIAIA2IAIAIIA61IIAAIAIAIAI8A11I4AIAIIA59IIA23IA62IA2IAIAIAIAIAI4AI2A10I5A42IA6IA6IAAIIA6IA2IA2IA2IAAIA61IIAAIAIAIAI2AIAI3AI5A11IIA63I2A18IA62IA4IA2IA2IAIAIAI9A50IA2IA2IA2IA2IA2IA2IAI2A6IA2IA3IA61IIAAIAIAIAI2AIAIAIIAI2AI8A75IIA14IA62IA2IA2IAIAIA2IAIAIIAIAIAI8A50IA6IA6IA6I2A11IA61IIAAIAIAIAI2AIAIAIIAI4AI2AI9A73IIA9IA62IA4IA2IA2IA2IA2IIAIAIAIAIAI6A40IA2IA2IA2IA2IA2IA2IA2IA2IAAIIA7IA61IIAAIAIAIAI2AIAIAIIA2I4AI2AI7A77I2A4IA62IA2IAIAIAIAIAIAIAIA2IIAIAIAIAIAIAIAIAIA42IA6IA6IA6IA2IA2IA4IIA2IA61IIAAIAIAIAI2AIAIAIIA2I2AIAIAIAIAI2AIIA82IIAIA62IA4IA2IA2IA2IA2IIA2IA2IAIAIAIAIA44IA2IA2IA2IA2IA2IA2IA2IA2IA6IIA61IIAAIAIAIAI2AIAIAIIA2I2AIAIAIAIAIAI2A150IA6IAIAIA2IAIA2IIA4IA2IA2IA56IA6IA6IA6IA68IIAAIAIAIAI2AIAIAIIA2I2AIAIAIAIAIAIAIA150IA4IA2IA2IA2IA2IIA2IA64IA2IA2IA2IA2IA2IA2IA2IA67IAAIAIAIAI2AIAIAIIA2I2AIAIAIAIAIAIAIA150IA2IAIAIAIAIAIAIAIA2IAAIA2IA2IA2IA60IA6IA2IA2IA2IA2IA65IAAIAIAIAI2AIAIAIIA2IAIAIAIAIAIAIAIAIA150IA4IA2IA2IA2IA2IA3IA6IA64IA2IA2IA2IA2IA2IA67IAAIAIAIAI2AIAIAIIA2IAIAIAIAIAIAIAIAIA150IA2IA2IAIAIA2IAIA5IA2IA6IA64IA6IA6IA69IAAIAIAIAI2AIAIAIIA2IAIAIAIAIAIAIAIAIA150IA8IA6IA2IA85IA2IA2IA2IA67IAAIAIAIAI2AIAIAIIA2IAIAIAIAIAIAIAIAIA150IA2IA2IAIAIA2IAIA9IA2IA2IA76IA73IAAIAIAIAI2AIAIAIIA2IAIAIAIAIAIAIAIAIA150IA4IA2IA2IA2IA2IA166IAAIAIAIAI2AIAIAIIA2IAIAIAIAIAIAIAIAIA150IA2IA2IAIAIA2IAIA17IA151IAAIAIAIAI2AIAIAIIA2IA2IA2IA2IAIAIA150IA8IA6IA170IAAIAIAIAI2AIAIAIIA2IAIA2IAIAIAIAIAIA150IA2IA2IAIAIA2IAIA17IA151IAAIAIAIAI2AIAIAIIA2IA2IA2IA2IAIAIA150IA4IA2IA2IA2IA170IAAIAIAIAI2AIAIAIIA2IAIA2IAIAIAIAIAIA150IA2IA2IAIAIA2IAIA17IA151IA3IAIAI2AIAIAIIA2IA2IA2IA2IAIAIA150IA8IA6IA170IA3IAIAI2AIAIAIIA2IAIAIAIAIAIAIAIAIA150IAAIA3IAIAIA2IAIA170IA5IAI2AIAIAIIA2IA2IA2IA2IAIAIA150IA6IAIA2IA2IA170IA8IIAIAIAIIA2IAIA2IAIAIAIAIAIA150IA10IA2IAIA170IA13IAIIA2IA2IA2IA2IAIAIA150IA15IA171IAAIA2IA2IA5IA2IAIAIAIAIAIAIAIAIA345IA6IA7IA2IA2IAIAIA2IA343IA2IA2IA2IA7IA2IAIAIAIAIAIA341IA6IA6IA3IA6IA2IA2IA339IA2IA2IA2IA2IA7IA2IA2IA2IA347IA6IA3IA6IA2IA2IA2IA343IA2IA2IA2IA7IA2IAIAIA2IA351IA6IA3IA6IA2IA2IA347IA2IA2IA7IA2IA2IAIAIA355IA3IA2IA2IA2IA2IA355IA2IA7IA2IA2IA2IA364IA6IA2IA368IA2IA2IA2IA360IA2IA2IA2IA2IA368IA2IA2IA2IA372IA2IA2IA376IA2"

F1_LogoBackdropExtended =
	"AAPAAIA231PAAIA231PAAIA231PAAIA231PA2IA230PA3IA229PA4IA228PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA226P2A4IA225P4A3IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA227PA5IA226P2A4IA225P4A3IA227PA5IA227PA4IA228PA3IA229PA2IA230PAAIA231PAIA232PIA233IA233IPA232IAPA232IAPA232IAPA232IAPA232IAPA232IAPA232IAPA232IAPA232IAPA232IAPA232IAPA232IAPA232IAPA232IAPA232IAPA232IAPA232IAPA232IAPA104PA8PA116IAPA103PPA7PPA7I109APA102P2A6P2A6IA108IAP3A92P25IP63A19PA10PA12IA9PA85PA6P2A6P2A4IA64PA17PPA9PPA12IA9PA84PA8PPA7PPA3IA66PA15P2A8P2A12IA9PA83PA10PA8PA2IA68P43IA9PA82PA24IA85P2A8P2A12I120A87PPA9PPA23PA80PA115PA10PA23P81A142"

F1_GateMask =
	"E89A99E89A99E89A99E89A99E89A99E89A99E89A99E89A99E89A99E89A99E89A99E89A99E89A99E89A99E89A99E89A99E89A99E89A99E89A99E90A98E91A97E92A96E94A94E97A91E97A91E98A90E98A90E99A89E101A87E104A84E108A80E111A77E114A74E118A70E120A68E122A66E125A63E129A7EA50E132A3EEA50E138A50E138A50E138A50E138A50E138A50E139A49E140A48E141A47E141A47E141A47E141A47E141A47E141A47E140A48E140A48E140A48E140A48E140A48E141A47E141A47E141A47E141A47E141A47E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48E140A48"

function loadFrame01Sprites()
	--tomem(unpac(F1_Arrow))
	--loadSprite("F1_Arrow",13,7,0)
	--tomem(unpac(BgDither))
	--loadSprite("BgDither",128,109,0)
	--tomem(unpac(Door))
	--loadSprite("Door",82,71,0)
	tomem(unpac(F1_Door_01))
	loadSprite("F1_Door_01", 53, 64, 0)
	tomem(unpac(F1_Door_02))
	loadSprite("F1_Door_02", 53, 61, 0)
	tomem(unpac(F1_Door_03))
	loadSprite("F1_Door_03", 53, 57, 0)
	tomem(unpac(F1_Door_04))
	loadSprite("F1_Door_04", 53, 54, 0)
	tomem(unpac(F1_Door_05))
	loadSprite("F1_Door_05", 53, 50, 0)
	tomem(unpac(F1_Door_06))
	loadSprite("F1_Door_06", 53, 46, 0)
	tomem(unpac(F1_Door_07))
	loadSprite("F1_Door_07", 53, 42, 0)
	tomem(unpac(F1_Door_08))
	loadSprite("F1_Door_08", 53, 38, 0)
	tomem(unpac(F1_Door_09))
	loadSprite("F1_Door_09", 53, 34, 0)
	tomem(unpac(F1_Door_10))
	loadSprite("F1_Door_10", 51, 29, 0)
	tomem(unpac(F1_Door_11))
	loadSprite("F1_Door_11", 51, 29, 0)
	--tomem(unpac(DoorLight))
	--loadSprite("DoorLight",46,46,0)
	tomem(unpac(F1_DoorLight_01))
	loadSprite("F1_DoorLight_01", 46, 46, 0)
	tomem(unpac(F1_DoorLight_02))
	loadSprite("F1_DoorLight_02", 35, 32, 0)
	tomem(unpac(F1_DoorLight_03))
	loadSprite("F1_DoorLight_03", 28, 25, 0)
	tomem(unpac(F1_DoorLight_04))
	loadSprite("F1_DoorLight_04", 21, 18, 0)
	tomem(unpac(F1_DoorLight_05))
	loadSprite("F1_DoorLight_05", 15, 10, 0)
	tomem(unpac(F1_Logo))
	loadSprite("F1_Logo", 89, 23, 0)
	tomem(unpac(F1_Logo02))
	loadSprite("F1_Logo02", 59, 23, 0)
	--tomem(unpac(LogoBackdrop))
	--loadSprite("LogoBackdrop",127,125,0)
	tomem(unpac(F1_Ship01))
	loadSprite("F1_Ship01", 36, 30, 5)
	tomem(unpac(F1_Ship02))
	loadSprite("F1_Ship02", 36, 30, 5)

	loadExtendedSprite(unpac_noheader(F1_BgDitherExtended), "F1_BgDither", 190, 121, 0)
	loadExtendedSprite(unpac_noheader(F1_LogoBackdropExtended), "F1_LogoBackdrop", 236, 132, 0)
	loadExtendedSprite(unpac_noheader(F1_GateMask), "F1_GateMask", 190, 121, 4)
end

-- Frame02

Planet_01 =
	"0c000240A118PA4OPNA21PPA2OPOPOAAP3OOPOPO4NPO5PNO2N2A5PPAP6O2P4O3POPO5POPO15NO6P8OPOP3OP2OP3OPOPOPPOPOP2OPO3POPO5POPO5POA7P4A2P8OP16OP3OP7OPOPOPPA23PPA5P3A3P5AAP6AP7A55PA117OA6NA5NOA3P2NA2OPN2AAPPNNONAON4OPN3O2NONONO3N2O3NONON4O3NNO11N2O3NNONNOONNO2NNONO4NONNO6N2O3NNO6NNO6NO6NO6NO2PNOONO3NOONO3NONNO8POPO5PO7PO39PPOP2OPPOPOPOPOOP2OP3OPOPOPOOPOP2OPOOPOPOPO5POPO5POP8OP5OP7OP7OP5OPOP3OPOPOP3OPOP5A5PPOA4P2OA3P3OA2P4OAAP5NAP5ONP6NA68ONNA4ONNA3OONPA2OONPNA2ONNOPA2N4AAOON3AAON21ON21ONON34OONON2O2NO6NNO5NOONO3NON3O3N4ONO22NO23PO7PO5PO2PO3PO2PO3POPOPOOPOPOPO3POPOPO5PO3POPOPO3POPO5POPO5POOPO4PPO7PO4POOPOPOPOOPOPOPOPPO4POPPOP5OPOPOPOOPOPOP3OPOPOP3OP5OPOPOPOOPOPOPOPPOPOPOP58OP5OA6ONA5PNA5PONA4PPOA4PPONA3P2NA3P2ONA4ON4AOON4AON5AN6AON5AN6OON5ON27POPN5ON3O3PNNON2ONNOON2OPNOON4ON5OON5ON6ON6OON4O2N3O4N5O3NNO2PO14PO5PO7PO13NO7NNO7POPO3POPO3P2O3POPOPO2PPOPPO4POPO5PO7PO9PO46PO5POPPOP2OPPOPOPOPOOPOPOPOPOOPOPOP3OP2OPPOPOPOPOOP2OP3OPOPOP12OP12OP16OP12OP8OOA2P2OOA2P3ONAAP3ONAAP3ONAAP3ONAAP4OAAP4ONAOON5ON6OON5ON6OON5ON6OONNONNOONONOON2ON4PNON6ON4PNNON2ON3POPNPNNONONONNPNONPNNONONON2O2NO6NO3NPONO4NOONO3POONO3NOONNOONO3N3ONNO5NNO6NO6NO6NO6NO5NNO3N2O3PPO4PO5PO7POOPO4PO8PO4PPO7PO4PPOPO2PO4PPOPO3POPO3POPOPPOPOPOPOPPOP2OPPOPOPOPOOPOPOPOPPOPOPOPOPPOP2OPPOPOPOPOOP2OP3OPOPOP3OP2OPPOPOPOPOOP2OP3OPOPOP12OP12OP30OP10ONAP4ONAP4ONAP4ONAP4ONAP4ONAP4ONAP4ONAAOONON2ANONON2AOONON2AOONON2AOOPNONNAAON3OAAOON3AAONON2OPNOON2ON2ON7ONNON4O2N4O2N4O2N3O4N2O2NONO4NONNO2NO2N4O3PO5PO5PO7POPOONNOOPOPOOPOP2OPOOPOPOPOOPOPOPPO2POPOPO3P2OPOOPOPOPOOPO5PO9P2OPO3POPO5POPO5POPO2PPOPPOPOPOPO3POPOPO3POPOPPOP2OPPOPOPOPOOPOPOP3OPOPOPOPPOP2OPPOPOPOPOOPOPOP3OPOPOPOPPOP5OPOPOPOOP2OP3OPOPOP3OP5OPOP2OOP7OP73ONAAP3ONAAP3ONAAP3ONAAP3ONAAP2ONA2P2ONA2PPOONA5OON2A2NON2A3OONNA3PNONA4POOA4NOOA5POA6ONONNO2NNO4N3O4N2O5N2OONOON3O3N3O2NON4OON2POPOPN2O2PONNO2POPNO13PONO3PO10NNO27PO42PPOPO3POPO5POPO3POPO3P2OPOOPOPOPOOP2OP3OPOPOPOPPOP2OPPOPOPOPOOP2OP3OPOPOPOPPOP5OPOPOPOOP2OP3OPOPOPOP8OPOP2OP8OP2OP10OPOP12OP52OP6OP5ONPPONA3PPONA3POOA4PONA4ONA5ONA5NA21PA55O4NOOPNONO3APO3NOAAPO2NOA2PO2NA3PO2A4POPA5PPO4PO7PO3POPOPO3PO3NOOPPOPNO2POPOOP2OP3OPOPOPO17PO4PPOPOPOPOOP4OPPOPOPOPOOP2OP3OPOPOPOPPOP2OPPOPOPOPOOP2OP3OPOPOPOPPOP5OPOPOPOOP2OP3OPOPOPOP8OPOPOPOOP2OP3OPOPOP10OPOPOPPOP23OP59ONP4ONAP3ONAAP3NA2P2OA3PPOA4POA5OA198P7AP6A2P4A4P2A6PA23P10OPOPOP23AAP5A6PA7P55A7P44A18P5NAP5AAP2NA3PPA165"
Planet_02 =
	"0c000240A125HHA22HA4HHGA2H2GHAH3GHGH3GHGGH2GHGHGA5PPAAP3H10G5HG4H3G2HGHG3HGH3GHGHGHHP7H3PHPPHHPH8PHPH13PH8PHGH5A7P4A2P7HP14HP6HP6HHP5A23PPA5P3A3P5AAP6AP7A55PA125GA6GA4H2A3H3A2H2GGAAG5AGGHGFGFG5FGGHGFGGFFG4FGFHHGH2GHHGHGHGHG4F2HFGF11GFGF3GFGF5GF3GFG2HHGH2GHHGHGHGHGGHGHGH2FGHGHGHGGFGH4G3HGHGGHG2HGHG7H8GH14GH21GHGHGHGHGPHGHPGGHHP5H2P2HPHHPHPHPH3PHPHPH3PHPH3P2HPH3PHPHHGHPHP19HP5HP7HPHP5HP5HPHP3HP8A5P2A4P3A3P4A2P5AAP6AP6HP7A69GHA4G2A4GHGA3G3A3GH2A2H4A2GH3AAGH3G2FGGFGFG3FGFFGFG2FGFHG4HFHHGH2GHHGHGHGHGGH2GGH2G4HGFFGFG2HF3GFGGFFG5HFFGGFGGHHGHG2HHGHGHG3H4GHHGH4GGHGHGHGHG6PGHG2HG10HGHGHGHG8HG2HGHHG7HGHGHGHGPGPGPHPGHGHGHGHGPGGHPHPGHGHGHGHG2PGPHPGHGHGHGHG3HPGPGHGH2PHGPHPGPHPGHGHGHPHHPGPHP2GHGHGHGHGPHPGPHPGHGHGHGHHPHPHPHPPHPHP12HP14HP14HP9HP67A6PHA5PPA5PPHA4PPHA4P2HA3P2HA3PHPPHA4GH4AAH4GAGH5AGH2GHGAGH5AH5GGH4G3HHG3HHG4HHG4HGGHGHGH3G2HGHGHHGHGHGHG8F4GF7GH10GH3GH30GH16GH2GH19PHPHPHHPH2PHHPHPHPHPPHPHPHPHHPHPHPHPGHGH2GH5PHPH5GHHPHPHPHGPHPH2PHHPHP2HPPHPHPHPHHPHPHP2GHGHGHGHGPHPHPHPGHGHGHPHHPHPHPHPPHPHGHPHHPHPHPHPPHPHPHPHHPHPHP3HP4HP8HP2HPPHP7HPHP12HPHP27HPHPHP10HPHPHPHP3GPGHGHPHPHPHHP4GHGP3HA2P3HA2PPHPPHAAP4HAAP2HPHAAPPHPHHAAGHPHPHAAHGHPH2AGHG3FG3HGFGFGHG3FG3HFGGFGHG3FFG4FGFGGHGFGFFG4F8GF5GFGF5GF5GFGF3GFGGF2GFG2F6GF4G3HGH4G3H3G2HGH2G5HHG2HGHGHG10HGHGHG7HHPHPHPHHPHPHPHPHHPHPHPH3PHPHPH3PHPH5PHPGHGHGHPHHG2HGGPPHPHPHPHP8HPHPHPPHP7HPHPHPHP8HP2HPPHP7HPHPHPHPPHP5HPHPHP5HP5HPHPHP8HP2HPHP8HPHP12HPHP12HPHP12HPHP13HPHPGHP4GHGP3H3P5HGP5HP7HP15HHGHPHHAHGHGHPHAGHGHGHHAHGHG2HAGHGHGGHAPGHG3APHGHG2APPHG3AAGHGFGFFAG6AGH5AH3GHGAH4GGAAGHHGHGAAGHHGHGAAH5FFGHGGFG2HGHG2H5GHG3HG4H3GHGGHGHGHGGHGH5GH2GHHGHGHGHGHG2PG4HGHGHGHG3HPG2HGHGHGHGGHPGPHPGHGHGHGHHGHGHPG2HGHGHGHGPHPGPHPGHGHGHGHHPGPHPGPGHGHGHGHGPHPGPHPGHGHGHGHHPHPHPHPPHPHP2HPPHP4GHPHPHPPHPHPHP2GHGHP2HHPHP4GHPHPHPPHPHPHP5HP2HP12HP12HP2HP8HP2HP10HPHP12HPHP12HPHP12HP76HHPPG2AAP3GGAAPHPHHGAAP3GGAAHPPHHGAAPPH2A2PHPHHA2PPH2A5GH2GA2H3GA3H3A3H3A4H2A4H2A5HHA6HGHGH5GHGHGHGH8GH7GH7GH6GH13GHGHGH3G2HPH5PH5PHPH5PH3PHPHPH3PHPHHPHPHP2GHGHPHPHGPHPHPHPPHPHPHPHHPHPHPHPPHPHPHPHP8HP2HPPHP7HPHPHPHHPHP2HPPHPHPHPHHP2HP3HPHPHPHPPHP2HPPHPHPHPHPPHPHP5HP2HP8HPHPHPPHP2HP3HPHPHPHPPHP5HPHPHPPHGPGHP3HP83HP13HPHP6HP2HPPHP5HPHPHPHA3HPHHA3PHHA4H2A4PHA5HHA5HA21HA55H7PH5PAPH3PHAAPH3PA2PHHPHA3PHHPA4PPHA5P2HPHPHPHPPHP2HPPHPHPHPHHPHPHPHPPHPHPHPHPPHP2HPPHPHPHPHHPHPHPHPPHPHP2HP8HP2HP10HPHP3HP7HP2HPPHPHP5HPHPH2P5HGPHP2HPHP5HP3HPHPHP24H2PPHPPGHGPGPGPHHPGPHPHGPGPGPGPPHP2GP3GPGPGP3HPGHP5HGP15GP5HPGPGP3GHGHP3HGHGHGHGGHGHGHGGHGHGHG2PHPPHPHHP2HPHHAPPHPHHAAPHPHHA2HPHHA3GHGA4GGA5GA198PHPHPHPHAP4HPA2P3HA4P2A6PA23PHPHP3HPHP4H3PHP2HP13AAP5A6PA7P38HP10HPHPHA7P2HP2HP12HPHPPHP9H2P2HHA18G2HG2AHPHG2AAPH2A3HHA165"
Planet_03 =
	"0c000240E125POE22AE4APPE2APPOOEAPPOPOPAPPO5NO3POE5AAEEAP7AAPPOPPOPA2PPO2POAAOPOPOPOPOPO7POPOPOP4AAP6AAP2OP3OPOP5OP5AAOPOP3ANOPOP2APOPOPPE7AOP2E2AAP6A3PAPPAPA2P3APA2P3APA2PAPAPA2E23APE5PAPPE3APAP2EEP2AP2EPAPAP2AE55AE13AE6AE6AE6AE6AE6AE6AE6AE54PE6OE4POOE3POONE2POONNEEPNONONEPOON2OPNON2ONNON4OON4ONNO7NONO5NOONO2NO2NNONO4NNONONO2NO8N2ONO8PPOPOPOPO7POOPOPOPO3POPOPNOPOPOPONOOPOPOPNO2POPOOAANOP3OAAPOPPOPOAOPOPPOPAANPPO2PANOPPOPOANPPOPOPAAOPPOPOPAP5A3PAPAPAPAPOPPAPAAPAPAPAPAPPOPA2PPAOAPAPAP2OPPAAP2OPAPA2PPAP2AAPAPAPPAOA4PAAPA12PA2PA16PA2E5OAAE4PPAPE3PPOAPE2APPAAPEEPAPOAPPEAPPOAAPOAAPPOAPOE6AE6AE6AE6AE6AE6AE6AE6AE5OPE4ONPE4NNOE3OONNE3ON2E2PN2OE2ONNOOEEPONNOON6OPN4ONP5NO2NNOP2ON5OON13ON12O3N2ONONNONO4P7NNOONO2N8ONON2OONON3ONOOPO2PNO2POPO5POP8O2PO2PN2OPOPO3POPOPOOPOPOPO3POANPPOPOPANPOP7A6O2P2NOPOPOPOPPOPOP2OPPOPOP6OAPAP3AOAPAPPAOAPAPA7O3AOAOPAPAPA2PPAPA3PAPAPA10PAPAPAPA17OA4PPAPA2PA8PAPAPAOA2PPOAPAPAPAOA3PA4OA3OOPPAAOOAPAPPAPAPAAPA4PAPPAPAPAPAAE5A2E4AOOE4APOAE3APPOE3APPOAE2AP2OE2AP2OAEEAEEPN2ONEEON2ONEPONNOONEPONNONNEP2NONNEPNPPONNPN3PPNPONNONNPN6ON14ONNONONON3ONO2N3ONON5ONONNON2OONONON2OONON3ONO2NNO2NONONOONO2NOOPONONNO6NO3NOONOPO3PO2POOPOPOPOOPO2POPPOPOPOPO3POPOPPOPOPOPOOPO2POPPOPOPOPOOP3NOOPOPOPNO2POPPO2POPOPO3P3O2POPOPOOAPPOPPO2POPOPOOAOPAPA3OAPAPA2OPAPAPAAOAPAPAPA3PA3OAPAPAPAAPAPAPAAOAPAPAPAAPA4PPAPAPAOA8PAPA12PA14PA9PAPPAPAPAPAPA5PAOAAPAPAPA3PAPAPAAPAPAPA5PAPA3PAPAPPO2EEAP2OOEEAP2OOAEAP2O2EAP3OOEAAP2OOEAOAPPOAEA2PPAOAAPN2ON2PPONOONNPNONON2PO4NNPOPOONONPPO4NPOPNONNOAPOONOONP4O2N5PN3OON4OONO6NO6NO6NOON4OOPO4NOOP8N3OPO3POPOPO3PO2PPOPOPOPOONO2POPPOPOPOPO3POP10OPO2POPPOPOPOPO3POP3OPOPOPOOPOPOP3OPOPOPOOP13APNO3AAPOPPAAPAOP3AAPPOP2APAP4A2P4APA3PA3PAPAPAPAAOA2OAOPAPAPAPA3PA3PAPAPAPA8PAPAPAPA8PA61PA3PAPA5PAPAAPAPAPA7PAAPAPAPA3PAPAPAAPAPAPAOA2PPOA2P2OOAOAP2OOA2P2OOAPAP2OOA2P2OOAPAP2OOA2P2OOAEPPOPOPOEPO5EPPOPOPOEPO5EAPOPOPOEEPO4EEPOPOPOEEOAAO4P2OOPPOP2OPO2P2ONOPOP2OPO2P2O2POPOPOPO8POPOPOPO7PPOPOPOPONO5PPOPOPOPO3PO2PPOPOPOPO5POPPOP2OP3OP3OPOPOPOPOOP2OPPOPOPOP2OP6OPO5AONP10APAP3A2P2OAPAPAPPOOA3PAOAPAPAAPOOA2PPAPAPAPAPPA5PAPA2PA3PA3PAPAPAPA8PAPAPAPA7PPA14PA50PA16OA10PAPAPA3PAPAPA5PA7PPA4PA3PAPAOAAPAPAPOOAPPOOEA2PPOOEAOAPPOAEAOAPPOAEAOAPOAOEA4PEEAAP2OEEAAP2OEEAE2OOAAOE2APPNOE3POPAE3APOOE4P2E4APOE5AOE6PO6PPOPOP3A3O3N3A3O2PON2POP5OPOOPOPOPOP5O3POONP6NO4POPA7NO6P2APAPAPOAOAPAPPAPAPAPAP6OP2APAPAP6A8O2PAP2OANANAPAAPAOAPAPOAOAOAPAAPAPA2PPAPA2PA19PA2PPAPA2PAAPA5PAPA2PA8PAPA5PA16PA39PA16OA10PA2PA10PA2PA8PA2PAOA5PAAPA2PAAPA2PA2PPAPAPAPPA5P2APAAP2AP2E2AAPPOE2AP2E3APPOE3APPE4APOE4APE5AE6AE6PE55POOPPOP2OP5EPOPPOPOEEPOP3E2POOPPE3P3E4POOE5POPOPPAOP2APAPAPAPPAOAOAOPAPAPAPAPOPPAO2P2APAPAPOPO2P4OPAPPAPAOA2POAOAOAPAAPAPAPAPPAPAPAPA3PA2PPAPAPAPAAPAPAPAPPAPAPAPA3PA3PAPA2PAAPA5PAPA12PA9PAPA3PAPAPA8PAPAPAPA44PA10PA2PAPA7PAAPAPAPA5PAPOAPAPAPA3PAPAAPAPAPA7PPOPA2PPOEAPAPPOEEPAAPPE2A2PE3AAPE4APE5PE13AE6AE6AE6AE6AE6AE6AE6AE55A7E55A7P7EP4APE2A4E4P2E6PE15A7PAPA5PA2PAPA3PAPAP3APAP4AAPAEEP5E6OA9PA5PAPAPAAPAPAPAPAAPAP2A3PPA8OOPO4PPA14PA5PAPA3PAPPAPAPAPAPAAPA2PAP3AE10A8P4AEAP3AEEP2AE3PAE29A7E55A7E6AE6AE6AE6AE6AE6AE6A8"
Planet_04 =
	"0c000240A125HHA22HA4PHFA2H2GHAH3GHFH3GHGGH7A5PPAP4HPPH7G5HFGFGFHGHF3GFG3F2HGGHF2G3P7HPHP4HHPHPHPH4PHPHGHGH4G4HGHGHG2HG9A7P4A2P7HPPH2P3HPH2P2HPHPHPHP4HHGPHPHPHPA23PPA5P3A3H3PPAAHPH2PPAHPH4PA55PA125GA6GA4H2A3H3A2H2GGAAG5AGGHGFGFG5FGGHGFGGFFG4FGFH15G3FFGHFGF2G2F7GF22HHGHFHGH3G4H3GHGGH3G4H4GHG2H2GGFHGGH2GGFG2H2GH2GHGH2GHG2PHHPGHHG2HPPGHG2HPPHHGHGHPH2GGH2GHHGGHPHHG4HHPHP2GPGPHPHPGHGGPHPHGPGPGPHPGHPHGHPHGPGPGPGPGHGGPHPHG2PGPGPHP2HPHP5H2PHP3HPHP5HPHPHP5HP5HPHP3HP8A5HHPA4HPHPA3PHPHPA2PPHP2AAP2HHPPAP3HPPHP2HPHPPA69GHA4G2A4GHGA3G2PA3GHPHA2HP3A2GPHPHAAGP4GGFGGFGFG3FGFFGFG2FGFHP2GPHPPHPHPHPHP5HPPHPHPGH2PG3HGF4GFHF9GGFGFGHPFGGFGGPHPHPGGHHPHP2GPGHPHPHGHHGHPHPHPFHGHGHPPG5HHGHG2HG10HGHGHGHG7PHG2HGHHPG5PH2GHGH2G6HGHGHGHG3HG3HGHGHGHG2PGPHGGHGHGHGHG3HPGPGHGHGHPHG2PGPHPGHGHPHPHHGGPHPGPGHPHGHPHGGHPGPHPGHPHPHPHHPHPHPHPPHPHP3GP7HP14HP14HP9HP6HPHP3HPHP7HP5HP7HP5HPHP12HPHPA6PHA5PPA5PPHA4PPHA4P2HA3P2HA3PHPPHA4GHPHPHAAP5AGP2HPHAGHPHPHGAGH5AH5FGH4G3HHGFGFPHG4HHG4HGGHGHGH3G2HGHGHHGHGHGHFFGF2GGF2GF2GGF2GFGFH3PHPH3GPPHPGH2PHPH3PHPPHPHPHPHPHPPHP2HHGHPH4GH8GH2GHHPHPH14PHPHPHHPH2PHHPHPHPHPPHPHPHPPHPHPHP2GHGH2PH3PHPHPHHPHPHPHHP13HP8HP4HP8HPHPHPHPPHP2HPPHPHPHPHHP2HP3HPHP2HP8HP5HP7HP4HP8HP2HP12HP12HP19HP7HP3HPHP5HPHP5HP5HP5HPHPPH2PHP5HA2P3HA2PPHPPHAAP4HAAP2HPHAAP3HHAAPHPHPHAAP3H2AGHG3FG3FGFGFGHGGFGFGGFGFGFGFGHFG3FGFGFGFG3FG2HHG2FH3FGF7GF11GF5GFGGF4G5FGFH4FGGH5GGFHGH4FFGGH2PFGFHGH2GFG2PHPGGFHGHPHGFG2PGPFGGHGHPHGFG2P2HHPHP2HHPHP5HPHPHPPHP7HPHPHPHPPHP5HP2HPHHP7HPHP2HP8HPHPHP10HPHPHP10HPHPHPPHPHPHP69HP26HP2HPPHP6HHP2HPPHHP5H2PHPHPPH3P4HPHP5HP2HHPHP4HPHHP2H3PHP2HPH3PH2PHPHPHHAP5HAPHPHPHHAP3GGHAPHPHPGHAHP3GGAHHPHPGFAP3G2AAGHGH2FAGGH4AGH4GAH4GGAH4GGAAGHHG2AAGHHG2AAH3GGHFH4GH6GGH6GH2PH2GGH8P2HFH2PPH2GHHPPHHFGHGHGHPHGFGP2GPGHGHPHPHGFGGHP2GHGHPHPHGFGP2HPFHGHPHPHHFGGHP3HPHPHPHP8HPHPHPHHP7HPHPHPHP5HPPHP2HPHHP2HP3HPHP2HPPHP5HPHPHPHHP7HPHP2HPPHP5HPHPHPHHPHPHP9HP6HP4HPPH3PHPH4P2H2PHPHPHPHPPHHPPHHPHPHP2HPHPPHP6HHPHPHPPHHP5HHPHPHP2HP6HPHP13HPHPHPHPH8PHPHPHPH6PH2PH2PH5PPH4P3H2P2HHPPGPGFAP4FFAPHPHHGFAP3GFFAP2HFGAAPPH2FAAPHPHHA2PPH2A5GHHGGA2H2GGA3HHGHA3H2GA4H2A4H2A5HHA6H6FHGGH2FHFGH2FHFHGGF5GHFHFHFHHGF4GHHG2HGH2GGHFGGFHGHPHPHFG3PHPFHGHPHPHHGGPHPHPGHGH2PHG2PHPHPGHGHPHPHHGGPHP3HPHPHPHPPHP2HPPHPHPHPHHPHPHPHPPHPHPHPHP8HP2HPPHP7HPHP2HHPHPHP3HPHPHHPHPHPHPHPHHPH5PHPHPHHPH2PH3PHPHPHHPPHHP2HP12HP9HHPHPHPH4PHPH6PPH7PHP26HPHP5HPPH7PHPHPHPPH2PH2P21HPPHP10HPHPHPHPGPGHPPHGPHPPHG4FPHPHA3HPHHA3PHHA4H2A4PHA5HHA5FA21HA55H3GHGHPHHG2HGAPH3PHAAPHHGHHA2PHHPHA3PHHGA4PPHA5PPGHGHPHPHG2PGPHPGHGGPHPHHGGPGPGPPHGHPGPHPG3PGPPHPHGHPGHGHPHGGPPHPHP2HP8HP2HP10HPHP3HP7HP2HPPGPGP4HHPH5PHPGPHHPHPHPH2PPHPHPGHP2H4P3HPHHP4H2P7H4PHPH10GHPHPH6GGHGPHPGPH2GHGHGHPHHGPGHPH2PH3PHPHPGPH3GGHGHPGPGPG10HGHGPGFG8HG2HGFHGHGHF2GHGPGFGFG3FGFAG2FGFAAGGF2A2GF2A3F2A4FFA5FA198PHPH2GHAP2H2GA2PPH2A4P2A6PA23GHPHP3GPGPGP2HHPHPHPPH4P6H3AAP5A6PA7P14HP3GP5GPGPPHP5HP10HPHPHA7P2HP2HP2HP8HPHPPHP9H2P2HHA18G2HF2AHPHGFFAAPH2A3HHA165"
Ship_01 =
	"0c0002c0F490P4FFEEDPDPFEEDPD2F47PF6DF77CF19CF10CF7CF412EF5EDF4EDDF3EDDPF2EDDPDFFEDDPDPFEDDPDPPEEDPDP2EEPENP2EPEN2P2EN4ADPPN2AEP3AAEDPPA2EDDPA2ED2PDFED3PPED3PAE4NPE4N2E3N3D2PPN2DDPBP2NDPB3PNPPF2CFFP2F2CFP3F3P4F2NP3F2NNPAAF2NNOAAPFFNOOAP2F399EF5EEF5EAF5EAF5EAF5EAF5EAED2PDPPD3PDPPD3PDPAD3PDA2D2PDA2D2PAAEAD2AAEDADDAAEDDPAAED3AAED3PAED3PBEP4BBEP5BD3PB2D2PPB2DDPB4PBPBPBPPB5PAPB2PBPPB4APAPBPBPPAAB2APAAPPBAPAAPPBAPAAP2O2PAP2O2NPAPPOON2P2ON4P3N4AP2N2OAP3NOOAP3OOANF7PF380EAF5EAF6AF6AF6OF5OAF3E2AF2EED2ADAEED2AAEED3AEED3PEED3PBED3PPBA3PB2A3PBBPDDA2P2DPPBPBPBPB5APB2PBBPB5PAPBPBBPAAB3PA2PBBPA3BPPA4PPA2P3A2DP2A4DPPA5DPA6PA6PA6PA6NP2AOANFPPA2NFFPA2NF2A2NF3AANF4ANF5NF365EF5EEF4EEDF3EEDDF2EED2FFEED3FEED4EEP5ED4PAD4P2D3PPBBD2PPBBPDDPPBBPBDPA3P4A3PDP3A2PDP3A2PDP3ABAPDP3BBAPDP3BBAPDP3A4NPA4NFPA3NFFA4F2A3F3A2F4PANF4PNF5NA4NFFNA2NF3NANF5NF386EF5EEF4EEDF3EEDDF2EED2FFEED3FEED4EED4PED4PPD4PPBD3PBPBD2P2BBDDPBPBPBDPPB4PPBBPBPBPBBPB2PBBPBPBPB5PBPPBPBPBPB3PBPBPPBPBPBPBBPBBAPDPPBPBBAPAB2PBBAPPBPPBAAP3BA2P2BAAPAPPBAAPPAPBAAPPAAPNF6APF5APF5APF5APF5PF373EF5EPF4E2F3E3F2E4FFEED3FEED4EED4PED4P9E3NNBBE2N2PBEEN4PDP2B3P2BPBPBPPB2NNPPBPBPBNNBPBNBPBNPBN2BPBBNNPNNBPBBNNPNNPBPBPBPPBPBPBPPBABPBPPBAAPBPBBAAPNP2AAPPNPBAAPPAPPAAPPAABAAPPA4PPA2NAPPA3FPPA4NPA4NFA4NFFA3NF2A2NF3AANF355EF5EEF4EEDF4EDAF4EAAFFEOD3FEOP4EED4PEDO2ADBDAO2AADAAO2A4O2A4OED2PDPBN4PB2N3BBPBPN2B5NNBBPBPBPNDBBPBPBPADPBP2BAADBBPBPPBBN2PBNPBPNPBANNPBPBAAN2PPA2N3A3N3A3PNNA4BNAOA5PA18NNA3NNFFA2NF3AANF4ANF5NF6ANF5NF379EAAF4EAAF4EAAF4EAEF5EEF5EDF4EDDF3ED2AAED3PAED3PBE4NBBE3N2BE2N4DDPBN3DPB2N2PB4NNBAADP3BPAADPPABBPAADPAB2PA3BP3A2NPPA4NNPA4NANA6OOA2NAO2AANFAO2ANFFAO2NF2AOONF3AOOF4ANF5NF429EF5EDF4EDDF3EODDF2ED2PFFED2PBFED2PBBED2PB2D2PBBPBDDPB3PDPBBPBP2B4PPBBPBP2NB2P3APBP3AABBP2A2P4A2P3A3P2A3NPPA3NFA2PA2NA5OFA4F2AANNF3ANF5NF473EA3FFEAAI2FEA2I2FEAIAI2FEAIAI2FEAIAI2FEAAIAIIFFEAAIAIAAPBP3IIAP4I2AP2AI3APAAI4A2I3A3I2A3NIIACAANFPA3NFFA3NF2A2NF3AANF4ANF5NF537EAAIAF3EAAIF4EAAF5EAF31IACAAF2A3F3CAAF4AAF629CF6A39F23A39F23A39F23A39F23A39F23A39F23A39F23A39F23A39F23A39F23A39"
Ship_02 =
	"0c0002c0F3E3F2BA3FFBA2HHFBA2HAABA2HAAHBAAHAAHHBAHAAH2BAHAH2NE2F4A2EF3HHAAEEFFAAHAAEEFHHAHAE2H2AAE2H3AE2NH2AE2F39EF6EEF5E2F516BAHAHHNNBAHAHHNNBAHAH2NNBAHAH2FNBA4FFNBD3F2NBPBPF3NBPBNNHHAE2NNHADDEENHADPDDEHADPDPDDADAPPDPDDPPAPPDP2APAPPDPPAAPAPPE3F3E3MF2E3MMFFE3M2FDE2M2EDDEEM2EPDDEM2EDPDDM2EF39EF6EEF5E2F457NBPF5NBF6NF39BPPAAPAPPBPPAAPABPBPPAAPNBPBPPAAFNBO4FFNBO3F2NBO2F3NBOOPDPDNMMEPPDN2MEAPN4EPN5DN5PDON3PDPOONNP2DO2PPAPPE3F3E4F2E4PFFE4PDFDE3PDEDDE2PDEPDDEEPDEDPDDEPDEF39EF6EEF5E2F457NBPF5NBF6NF39BPPAAPAPPBPPAAPABPBPPAAPNBPBPPAAFNBPBPPAFFNBPBPPF2NBA2F3NBPBPDPDDPDEPPDPDPDDAPPDPPDEPAP2D2APAPDDPDAAPDPPDPAADPAPPDPPAAPAPPE3F3E4F2DE4FEEDE4ADEDE4DDEDE3PDDEDE2DPDDEDEEF15E4F2A3E2FE3AAEEDA2EAAEDEA2EAEDEDAAEAEF21EEF3E3F2E5FAAE5AAE6AAE2F3E3FE41P3EEPPB3PEEF5E3BBFFE4BFFE3PDBFE2PDEEFEEPDE2BEPDE3APDE4AF47BF6BF203NBPF5NBF6NF39BPPAAPAPPBPPAAPABPBPPAAPNBPBPPAAFNBPBPPAFFNBPBPPF2NBPBPF3NBPBPDPDDEDEPPDPDDEDAPPDPDDEPAAPDPDDAPAAPDPDAAPAAPDPPAAPAAPDPPAAPAAPDEDAAEAEDEDAAEAEDEDAAEAD3ABAAEDDAABAAD2ABAAEBPAABAD2AABAAPBBE3A2EEDE2A2EEDE2BADEEDE2BBDEEDE2DBDEEDEEBDBDEEDEBBDBDEEDPPBA3BPBA29EA6EBA5EBBA3EPE5ABE5AAE5AAE5AAE4PAE5PAE4PABE4PABBF6BE6BE6B8F6BF38BFCFCFFCBFCFCF229NPNBPF2PNPNBF2PPNPNF2NPANPF2NPPANF3NPPAF4NPPF5NBBPPAAPAAPBPPAAPABPBA3BP5BA14P9BBP2APAABAAPPB2AAPPB2AAPPAABBAPPA3BPPA5PPA7PA4PAAPA3B2DBDEEB3DBDEB4DBDB5DBBAABABBDABAABABBAABAABABA2BABAADB2A2EEB3AE2B4EEDB3AEEB3AE2DBBAAE2A3EEDEBAAE9PABE3PABFE3PABFE2PABFFE2PABFFEEPABABBEEPABAABEEPABAABF47BF6BEF268NF13NBF5NBF4NBBF4NBBF4NBBF3NB5P2APNB2P2AANB2P2BANB2PPBBANB2PBBPANB4PPANB3APAANBAPAAPA2PAPAAPA2PAPAAPAPAPAPAAP2APAPAAP2APAPABP2AP2BBP2APA4BABA5BA17PA7PA4PA4PAPA4PAPA2EDE2AAE4DAADE4AD2EDED3EDEEPDPDDEDPAPDDE2PADPDDEPAPEPABA2BEPABA2BPABA2BBPABA2BBABA2B3A4BDBA5BPA6BEEF4BE2F3BE3F2BE4FFEDE4FDEDE4D3E3BDDEDE2F56DE2F198NB2F3NB2F3NBBAF3NBAPF3AAPBF3NPBBF3NBOOF3NBOBBA5NAPPA4PBPPA3BOBPPA2BBOBPPAABOOB2PPOOB9OOB4PPA2NB2A16BA4BA3BBA2BAB2ABA2B2ABA8PAPA4PAPA4PAPA4PAPA3PAPDA3PADPA4DPPA3DPPAPDDEPAAPDPDPA3PDPA2PADPA4PPA6PAAPA4BPAPA2BPBPAPAAPPA5P2A5P2A5P2A2PAAP2A2PAAP2A2PAAP2A2PAAPPABDDEDEEAABDDEDEA2BD3A3BD2A4BDDA5DFA4PFFPA2PF2DDE5ADE5ADE5ADE5DDE5FFD3EEP3AADDF3P3F196NBOF4NBBF5NBF6NF31B2OBOBBOBOBBOB2OB2OB3O3BBNB6FNNB4F3A2PF3NBBPBBABA3BBABABAABBABABAPBBABAP2BBP4FP3F19AADP2A2DPPA3P4A2PPBP2AAFFNBP2AF2BA3F2NBBPPF3NBBPNBPBPAPAANBPBPAPAANBPBPAAPANBPBPAPAANBPBAPA2NBPPA4NBPPA3PNA3PPAPA4PPAPA4PPAPA5PAPA4BPAPA3PBPAPA2BPBPAPAAPPAPF3P2F4PF6PF6PF6PF6PF6PF330NBBPF3NBBPF3NBBPF3NBBPF3NBBF12CCF78NBBF5NBF6NF39P2A2PFBP2AAPFBBPPAABFNB5F32NBPBP3FNB5F207A31F31A31F31A31F31A31F3CCF21CF2A31F31A31F31A31F31A31F31A31F31A31F31A31"
Ship_03 =
	"0c000240F30PF5PAF4PAAF3PAAHF2PPAHAF2P3AFPPAH2APAAHA5HAH2AAHAH2AMHAHGGAEMAHGGAEMMHGGAEM2EF6NEF5NNEF4N2EF3MN2EF2MMN2EFFM2N2EFM3N2EF320A6FA6FA6FA6FA6FA6FA6FA6FFPPAHAHFPPAHAHGPPAHA3PA4DNNPA4DNBBPDP2NBPBPDAAFNBPBPDAGGAEM3GAEM4AEM3EENNM2E2N2ME3D3E3AD3E2AAD3EEM4NNDM5NDE3M2E4M2E12MEME4MEME4MEMEEF6DEF5DDEF4EDDEF3EEDDEF2E2DDEFFE3DDEFE4DDEF256A6FA6FA6FA6FA6FA6FA6FA6FFNBPBPAF2NBPBAF3NBAAF4NPAF5PPF5NPF6NF7A2D3EADEAD3ADEEAD2ADE2ADDPPDE2ADPPADE2AP2ADE2NP2ADE5MEME4MEMEDE2MEMEDDEEMEMED2EMEMED3MEMEAD2NEMEEADDNDE7DDE6DE48F6DEF5DDEF4EDDEF3EEDDEF2E2DDEFFE3DDEFE4DDEF192A6FA6FA6FA6FA6FA6FA6FA6F64NP3DEFFNPPA2F3NB2F4NBPF5NBF6NF15EEADNDNEA3NDNDPDA2DNDBPDA2NDPBPDA2DBPBPDA2NBPBPDAAFNBPBPDAE15DE6DDE5D2E4D3E3AD3E2AAD3E7DDE6DE48F6DEF5DDEF4EDDEF3EEDDEF2E2DDEFFE3DDEFE4DDEF128A6FA6FA6FA6FA6FA6FA6FA6F129NBPBPDF2NBPBPF3NBPBF4NBPF5NBF4PAAF3PA2F2PA6D3EDA2D3PDA2D2BPDA2DDBBP4DA4PPA6PPA4OOPE15DE6DDE5D2E4D3E3AD3E2PAD3E7DDE6DE13ME5M2E3M2E3M2E3M2EMEEF6DEF5DDEF4EDDMF3EENNMF2EMMNDEFFM2EDDEFEME2DDEF64A6FA6FA6FA6FA6FA6FA6FA6F94PF5PAF5PAF5NAF4NAAFFPA3PFPA3PDPA3PDDA3PD2A2PD2EAAPD2EEAPD2E2PD2E3D2EO3DDEMEO2DEM2EOOEM4EOE10M4E2M4E6APPAD3EOPPAD3OOPPAD2O2PPADDOPOOPPADAPPOOPPA2PPOOPPA3O2PEM2E2MEEM2EMMDEEM3EDDEEMMEED2E4D3E2DAD3EDEPADE8DEDDE2DE2DEEDE5DE5DE5DE5DE5DE5DE3F6DEF5DEF5DEF5EEF5E2F4E3F3E4F3A6FA6FA6FA6FA6FA6FA6FA6F67NAAPF3NAPPF4NBPF5NBF6NF23D2E4D2E4BD2E3PBD2E2BPBD2EENBPBD2EFNBPBD2FFNNBPDAE5AAEEDDEAADEDEEAAD2EEAAD2EEAAD2EEAAD2EEAAD2E2AD2E3D2EO3DDEMEO2DEM2EOOEM4EOE10M4E2M4E6APPAD3EOPPAD3OOPPAD2O2PPADEOPOOPPADAPPOOPPA2PPOOPPA3O2PE2DE5DE4DDE13D2E4D3E3AD3E2PAD3E7FFE5AFE5AAE5AAE5AAE5AAE5AAE5AAFA6FA6FA46F131A3F4APPF4NBPF5NBF6NF23D2E4D2E4BD2E3PBD2E2BPBD2EENBPBD2EFNBPBD2FFNNPPDAE5AAEEDDEAADEDEEAADADEEAADADEEAADADEEAADADEEAADADE2ADADE3D2EO3ADEMEO2DEM2EOOEM4EOE10M4E2M4E6APPAD3EOP2D3OOPPAD2O2PPADDOPOOPPADAPPOOPPA2PPOOPPA3O2PE5AAE5AADE4AADDE3AOD2E2AOD3EEAOAD3EAOPAD2AAOA31OA6OA6OA6OA6F195A3F4APPF4NBPF5NBF6NF23DADE4D2E4BD2E3PBD2E2BPBD2EENBPBD2EFNBPBD2FFNNPPDAE5AAEEDDEAADEDEEAAD2EEAAD2EEAAD2EEAAD2EEAAD2E2AD2E3D2EO3DDEMEO2DEM2EOOEM4EOE10M4E2M4E6APA5OOPA3PO2PAAOPO3POOPO4POPOAAO2PPOA2O2POA3O4A6OA6OA6OA6OA6OA6OA6OA6F259A3F4APPF4NBPF5NBF6NF23D2E4D2E4BD2E3PBD2E2BPBD2EENBPBD2EFNBPBD2FFNNPPDAE5AAEEDDEAADEDEEAAD2EEAAD2EEAAD2EEAAD2EEAAD2E2AD2E3D2EO3DDEMEO2DEM2EOOEM4EOE10M4E2M4E6FOA6OA6OA6OA6FA6FA6FA6FA6F323A3F4APPF4NBPF5NBF6NF23D2E4D2E4BD2E3PBD2E2BPBD2EENBPBD2EFNBPBD2FFNNPPDFE5FFEEDDEF2EDEEF3DEEF4EEF5EF23A6FA6FA6FA6FA6FA6FA6FA6"
Ship_04 =
	"0c000300F134DF6DF6DF6DF6DF6DF6DF6DEF6DEF5IDEF4IADEF3IAADEF2IAADDF2IAADDF2IAADDF452A5FFA5FFA5FFA5FFA5FFA5FFA5FFA5F94EF5DAF4DAAF4DAAF4DAAF6DF6DF5DPE4DPA4DPAIA2DPAIIAADPAIIJADPAIIJJIAADDEFFIAADDOEFA2DDODEAIIADODDIJBDAD2JJDPBADDJDBBPBADDBPPBPBAF23EF6DEF5DDEF4D2EF3D3EF388A5FFA5FFA5FFA5FFA5FFA5FFA5FFA5F68DAAF4DPDF4PDPF4DPAF3DPAIF2DPAIIFFDPAIIJFFDPAIJJDPAIIJJDPAIIJJDBAIIJJDBAIIJJDPAAIJJDBA2JJDBA3JDPA4DPAD4PDP2BPBAEP3BPAEDP3BAEDDP3AED2P2AED3BPDBED3B3ED3AD3EFFBAD3EFPBAD3EBPBAD3PBPBAD2PPBPBADDP2BPBADP3BPBAF23EF6DEF5DDEF4D2EF3D3EF324A5FFA5FFA5FFA5FFA5FFA5FFA5FFA5F11CFFCCF2CFFCF41DPAIJDFFDPAIDPFFDPADAAFFNPPDAPF2NPDPPF3NDPPF4NPPF5NPPAP3BPA2P3BPIA5IPIAAPPIPIPIAAP3IPIAAP2IIPIAAP2IIPIAB3ED2PB3EDDAAB3EDJJAB3EIJJAB3PIJJAB2A5BBAPPI2ABDBP2BPBDDBP2BPD2BP2BD3BP2ED3BPPBED3PPBBED3PB2ED3AD3EFFBAD3EFPBAD3EBPBAD3PBPBAD2PPBPBADDP2BPBADP3BPBAF23EF6DEF5DDEF4D2EF3D3EF260A5FFA5FFA5FFA5FFA5FFA5FFA5FFA5F70NF55P2IPIPINP2IPIPFNPPIPPIFFNPPIIPF2NPPIPF3NPPIF4NPPF5NPAP5AIA4JJPIAAPPIJIPIAAPPI2PIA3I2PIAAPIPPIPIAPPIPIIPIAB3ED2AB3EDDJAB3EDJJAB3EA3B3PI2AB2P4ABBA3JJABDBP2BPBDDP4BD2P2BPD3P2BED3P2BED3PPBBED3PB2ED3AD3EFFBAD3EFBBAD3EPBBAD3BPBBAD2PBPBBADDPPBPBBADP2BPBBAF23EF6DMF5DMMF4DM2F3DM3F196A5FFA5FFA5FFA5FFA5FFA5FFA5FFA5F134NF55PPIPPIPINPPIPPIPFNPPIIPIFFNP2IPF2NP2IF3NP2F4NPPF5NPAAPPIJJAIAAPPIJJPIA5IPIAAPPI2PIAP2IPIPIA2PIPIPIAAPPIPIPIAB3ED2AB3EDDAAB3EDIIAB3EPPAAB3AAJJAB2PPIJJABBAPPI2ABDP2BPBBDDP2BPBD2P2BOD3PPOOED3O2BED2MOOBBEDDMMOB2EDM2AM4FFOAM3EFOOAM2DEO2AMMDDO3AMDDO4ADDO3BBADO2BPBBAF23E4F2DEEPEEFFDDEEPEEFDEDEEPEED3EAPEF55EF72A5FFA5FFA5FFA5FFA5FFA5FFA5FFA5F198NF55P2IPIPINP2IPIPFNPO4FFNPOPPOF2NPOOPF3NP2F4NPOF5NOAAP3BAIA6OIAP4IPOAAO2PO2AAO6AAO6AAO6AB3EM2AB2NM2BPBN2MMO2N3MO3N3O4N2O5NNAO5BMOPPBPBBMDP2BPBMDDP2BPMD2P2BMD3P2NED3PPBBED3PPBBED3AD3MAPBAD2NMABBADDNNAPBBAPNNABPBBANNAPBPAANNAPPAAOONAPAAO3AEEF5E2F4E3F3EDDEEF2EPDDEEFFP2DDEEFEEPPDDE2DEPPDDEF33CF6CF12EF3CF3A5FFA5FFA5FFA5FFA5FFA5FFA5FFA5F262NF55O5PINO3PIPFNOOP2IFFNP4F2NP3F3NP2F4NPPF5NPAAP5IAAP3BPIAAP3IPIA3PPIPIA3PPIPIIPAP2IPINAP3INPAB3ED2PNB2EDDBPNB2EDPBPNB2EPPBPNB2APPBPNBBAAP3NBA2P3NDAO3AADDO2A2D2OA2BD3AAPPED3PPBBED2P2BBEDDP2B2EDP2EDDEPPDDED2EPPDAD3EPPBAD3EPPBAD3EPPBAD3PBPBAD2P3BADDEEF2CFFDEEF4DDEEF3PDDEEF2PPDDEEFFEPPDDEEFDEPPDDEEDDEPPDDEFFA5FFA5CFA5CFA5FFA5FFA5FFA5EFA5F326NF55P3NPAANPPNFFPPFNNF3PF39A3P6AAPBP4A3NP6FNP5FFN4AF5NPF6NNB2AAPPBNBAAPAPA5PABPBBA2PPBPBBA10P4BPBP5BP3BPBADP5BAP4BPBAPA5PAP5AP6AAP5BAP5D2EPPD5EPPDAD3EPPBAD3EPPBAD3EPPBAD3PBPBADDFP3NNFFEEA5DEA5DDA5PDA5PPA5FFA5FFA5FFA5F39A23F39A23F39A23F39A23F39A23F39A23F39A23F39A23FNP4BFFP5F2NP3F2N4F7A23PBAP4BPBAPPNPPBNANNFFN2PNF5NF3A23PBPBF3N2F28A23FFA5FFA5FFA5FFA5FFA29"

function loadFrame02Sprites()
	tomem(unpac(Planet_01))
	loadSprite("Planet_01", 71, 71, 0)
	tomem(unpac(Planet_02))
	loadSprite("Planet_02", 71, 71, 0)
	tomem(unpac(Planet_03))
	loadSprite("Planet_03", 71, 71, 4)
	tomem(unpac(Planet_04))
	loadSprite("Planet_04", 71, 71, 0)
	tomem(unpac(Ship_01))
	loadSprite("Ship_01", 88, 99, 5)
	tomem(unpac(Ship_02))
	loadSprite("Ship_02", 88, 84, 5)
	tomem(unpac(Ship_03))
	loadSprite("Ship_03", 65, 88, 5)
	tomem(unpac(Ship_04))
	loadSprite("Ship_04", 90, 77, 5)
end

-- Frame03
Beam =
	"0c000340P8C6PC6PC6PC6PC6PC6PDC5A7P2A4C2PPA2C4PPAC6PC21DDA31PA6CPA5DDPPA3C3PPA641PCDDC3PC2DDCCPCDC2DDPCCDDCCDPC2D2CPC4DDP2C3DP4C5D2C2DDC4DC6DC5DCDDCCDDC3DDC2DDCCDDC2D2CCDDC4DPAC2DDCCPCDDC4DC13EC4EEDC3ED2CCEED3A7PA6CPPA4CEPPA3EDEEPA2D4PAAD4PAADDPDDPA577P5CCP2OP6OP6OPOOP3OPO2P2OPO2P2OPO2P2OPO2CCD2C6DDCEPC2DDCEPC2DDCEPC2DDCEPC2DDCEPC2DDCEPC2DDCE2D11PPD3P3D2P4DDP5DDP3NODDP2NMMDDP2ONOP2DDPAAP2DDPAAP2DDPAAPOPPDPAAPPOOPA2P2OOPPAOOP2OOPMOOP3OA55PPA517P2OPO2P32C2DC2PC3DCCPC4DCPC3DCEPC5EPC5EPC5EPC5EC6EC6EC6EDDP2NONDDP2ONODDP2NONDDP2ONODDP2NONDDP2ONODDP2N2DDP4NOMMOOP2NONMNOOPON2MMNONONONOMMNNON5ONON3ON7ON5OOPPA3PPOOPA2P2OOPPAOOP2OOPMNOP3ONMMOOP2NONMNO3N2MMOOA31PPA5OOPA4O2PPA2O4PA449PC5DPC6PC6PC6PC6PC6PD6PC13EDC5ECD6C6EC6EC6ED6EC6EDDP2OPPDDP2OPODDP2OPODDP4ODDP3APDDPPA3EDPA4P2A4PN5OPPN3ONPOPPNONNPO2PN2PO3PPNPPO4PAAPO4A2PPO2N5MMN5PN5PGPN3PG2N2PG3NNPG4PGFG4OOG5O5PPMO6NMMO4PPNMNO2GGPNMMOOG2PPNMMG4PPNG5FPA7PA6OPPA4O2PPA2O4PAAO5PPMO6NMMO4A47PA6OPPA324P7A55P7A123PPOOA5PPA47O2PGFGGO4GGFPO5GAPPO4A2PPO2A3P2OA5PPA6PG4FG5FG2FGGFG5FG4OOGFG2FO2GGFFGO4GFFPPO3GGPPNMO3GGPNMMOOGFGPPNMMFG2FPNNG2FGGPPGGFGGF2GFGGF4GGF4O2PA3O3PPAAO5PAMO5PNMMO4PNNMO3FPPNMMOOF2PPNMMA23PA6OPPA4O2PA3O3PPAAO5PA577P2O2PAAP2O2A3P3A39GGFFMF2OOGFFM2P2GGFMMA4GFFA5GGA23F4PNNM2F2PPM4FFPF2M2F6M2GF4MMAGGF4A2GF3MO5PNMMO4PNNMO3FPPNMMOOF2PNNM3FFPPNNM2F2PNFFM2FFPPA6OPA5OOPPA3O3PPAAO5PAMO5PNMMO4PNNMO3A39PA6OPA5OOPPA583GGFFA5GFA6GA39F2M2F6M2GF4MMAGF5AAGGF3A3GF2A4GGFA6GFPPNMMOOF2PNNM2F2PPNNM2F2PNFM2F2PF2M2F5M3F5MMO3PA2O4PPAMO5PNMMO4PNNMO3FPPNMMOOFFPPNNM2F2PPNNA23PPA5OOPPA3O3PA2O4PPAMO5PA639GGF5AAGF4A2GGF2A4GGFA6GA23M2FFPPNFM2F2PF2MMF6MFFMF3MFFMGGFFMFFMAAGF3MA2GGFFMNMMO2NNPNNMON2FPPN3PFFPPNNPGMF2PPGGMF2MG2MF2MG2MF2MG2PA6PA6FA6FA6FA6FA6FA6FA651GFFA5GGA47MF2MG2F3MG3F2MG2AGGFMG2A2GGF2A4GGA16FA6FA6FA6FA6GA30"

BgDitterBottom =
	"0c000300A629PA28PAPA12PA10PAPA2PA8PA30PA14PA562PA12PA2PA12PA10PAPAPAPA8PA2PA10PAPA2PA8PA2PA10PAPAPAPA8PA2PA10PAPA2PA8PA30PA14PA452PA28PAPA8PA2PA10PAPA2PA8PA2PA10PAPAPAPA8PA2PA10PAPA2PA8PA2PA10PAPAPAPA8PA2PA10PAPA2PA8PA2PA10PAPAPAPA8PA2PA10PAPAPAPA8PA14PA14PA14PA370PA12PA2PA12PA10PAPAPAPA8PA2PA10PAPA2PA8PA2PA10PAPAPAPA8PA2PA10PAPA2PA8PA2PA10PAPAPAPA8PA2PA10PAPAPAPA8PA2PA10PAPAPAPA8PAPAPA8PAPAPAPAPA4PAAPPA2PA10PAPAPAPA3PA3PAPAPAPA2PA4PAPAPAPAPA2PAAPPA14PA6PA6PA14PA6PA252PA18PA6PAPAPA8PA2PA10PAPA2PA8PA2PA4PA4PAPAPAPA8PA2PA10PAPA2PA8PA2PA10PAPAPAPA8PA2PA10PAPAPAPA8PA2PAPA8PAPAPAPA8PAPAPA10PAPAPAPA4PAAPPA2PAPA8PAPAPAPA3PA3PAPAPAPA2PA2PAPAPAPAPA4PAAPPAPAPAPA2PA2PAPAPAPAPAPAAPA3PAPAPAPA2PA2PAPAPAPAPA4PAAPPAPAPAPA2PAPAPAPAPAPAPAPAAPPA2PAPAPAPA2PA2PAPAPAPAPAPAAP2APPA14PA6PA6PA6PPA5PA6PPA155PA12PA10PAPA2PA12PA4PA4PAPAPAPA8PA2PA10PAPA2PA8PA2PA4PA4PAPAPAPA8PA2PA10PAPAPAPA8PA2PA4PA4PAPAPAPA8PAPAPA10PAPAPAPA8PA2PAPA2PA4PAPAPAPA8PAPAPAPA6PAPAPAPAPA4PAAPPAPAPAPA2PA2PAPAPAPAPA3PA3PAPAPAPA2PA2PAPAPAPAPA4PAAPPAPAPAPA2PA2PAPAPAPAPA3PA3PAPAPAPA2PA2PAPAPAPAPA4PPAPPAPAPAPA2PA2PAPAPAPAPAPAAPAPAPPAPAPAPAAP2AP3APAPAPPAPAP2APPAPAPAPAAP7AP2AP3AP2APPAPAPAPAAP2AP3APAPAP3AP2APPA6PPA5PA6PPA5PA6PPA5PA6PPA55PA2PA18PA6PAPAPA8PA2PA8PAPAPA2PA8PA2PA4PA4PAPAPAPA8PA2PA8PAPAPA2PA8PA2PA4PA4PAPAPAPA8PA2PA8PAPAPAPAPA8PA2PA4PA4PAPAPAPA8PAPAPAPA6PAPAPAPAPA4PA2PA2PAPA2PA2PAPAPAPAPA8PAPAPAPA2PA2PAPAPAPAPA4PA2PAPAPAPA2PA2PAPAPAPAPA3PA3PAPAPAPA2PA2PAPAPAPAPA4PAAPPAPAPAPA2PA2PAPAPAPAPA3PAPAPPAPAPAPAAP2AP3APAPAPPAPAP2APPAPAPAPAAPPAAP3AP2AP3APAPAPPAPAPAPAAP2AP3APAPAPPAPAP2APPAPAPAPAAP2AP3AP2AP3AP2APPAPAPAPAP3AP3APAPAP3AP2APPAPAPAPAAP7AP2AP3AP2APPAPAPAP10AP14A6PPA5PA6PPA5PPA5PPA5PPA5PPA5PA2PA4PA52PA2PA4PA52PA2PA4PA52PA2PAPA2PA2PA48PA2PAPA2PA2PA48PAPAPAPA2PA2PA48PAPAPAPA2PAAP2A47PAPAPAPAAP2AP2A47PAPAPAPAAP6A47PAPAP11A47P15A47PPA5PPA53"

BgDitterTop =
	"0c000340P2AP2AP8APAPAPAP10AP2AP8APAPAPAP10AP2AP8APAPAPAP10AP2AP8APAPAPAP10AP2AP8APAPAPAP10AP2AP8APAPAPAP10APAPAAPAPAPAPPAPAPAPAAP2AP5AP2APPAPAPAPPAPAPAPAAP2AP5APAPAAPAPAPAPPAPAPAPAAPAPAPAPPAPAPAPAPPAPAPAPPAPAPAPAAPAPAPAPPAPAPAPAAPAPAPAAPAPAPAPAAPAPA2PPAPAPAPAAPAPAPAAPAPAPAPA3PA2PPAPAPAPAAPA2PAAPAPAPAPA3PA3PAPAPAPAAPA2PAAPAPAPAPA8PAPAPAPAAPA5PAPAPAPA8PAPAPAPA8PAPAPAPA8PAPAPAPAAPA5PAPAPAPA8PAPAPAPA8PAPAPAPA8PAPAPAPAAPA5PAPAPAPA8PAPAPAPA8PAPAPAPA8PAPAPAPA8PAPAPAPA8PAPAPAPA10PAPAPA8PAPAPAPA8PAPA2PA8PAPAPAPA10PA2PA8PAPAPA12PA12PA30P2AP2AAP7APAPAPAP10AP2AAP2AP3APAPAPAP10AP2AAP7APAPAPAP10AP2AAP2AP3APAPAPAP10AP2AP5APPAPAPAPAP3AP5AP2AP5APPAPAPAPAP3AP5AP2APPAP2APPAPAPAPAAP2APAP3AP2APPAPAPAPPAPAPAPAAPAPAPAP3APAPAAPAPAPAPPAPAPAPAAPAPAPAPPAPAPAPAAPAPAPAPPAPAPAPAAPAPA3PAPAPAPAAPAPAPAAPAPAPAPA3PA3PAPAPAPAAPA2PAAPAPAPAPA8PAPAPAPAAPA2PAAPAPAPAPA8PAPAPAPAAPA2PAAPAPAPAPA8PAPAPAPAAPA5PAPAPAPA8PAPAPAPA8PAPAPAPA8PAPAPAPAAPA5PAPAPAPA8PAPAPAPA8PAPAPAPA8PAPAPAPA8PAPAPAPA8PAPAPAPA8PAPAPAPA8PAPAPAPA8PAPAPAPA8PAPAPA26PAPA12PA110P2AP2AAP2AP3APAPAPAPPAP7AP2AAPAPAPAPPAPAPAPAAP2AP5AP2AAP2AP3APAPAPAP3AP5AP2AAPAPAPAPPAPAPAPAAP2AP5AP2AAP4APPAPAPAPAAP2APAP3AP2AAPAPAPAPPAPAPAPAAPAPAPAP3APAPAAPAPAPAPPAPAPAPAAPAPAPAAPAPAPAPAAPA2PAAPAPAPAPA8PAPAPAPAAPA2PAAPAPAPAPA3PA3PAPAPAPAAPA2PAAPAPAPAPA8PAPAPAPAAPA2PAAPAPAPAPA8PAPAPAPAAPA2PAAPAPAPAPA8PAPAPAPAAPA5PAPAPAPA8PAPAPAPA8PAPAPAPA8PAPAPAPAAPA5PAPAPAPA8PAPAPAPA10PAPAPA8PAPAPAPA8PAPAPAPA8PAPAPA10PAPA12PAPAPA10PA238P2AP2AAP2APAPPAPAPAPAAPAPAP3APAP2AAPAPAPAPPAPAPAPAAPAPAPAP3AP2AAP2APAPPAPAPAPAAPAPAPAPPAPAP2AAPAPAPAAPAPAPAPAAPA4P3AP2AAPAPAPAAPAPAPAPA3PA3PAPAPAPAAPA2PAAPAPAPAPA7PPAPAPAPAAPA2PAAPAPAPAPA3PA3PAPAPAPAAPA2PAAPAPAPAPA8PAPAPAPAAPA2PAAPAPAPAPA3PA3PAPAPAPAAPA2PAAPAPAPAPA8PAPAPAPAAPA2PAAPAPAPAPA8PAPAPAPA10PAPAPA8PAPAPAPA8PAPAPAPA8PAPAPAPA10PAPA10PAPAPAPA8PAPA364P2APAPAAPAPAPAAPAPAPAPAAPAPA3PAPAPAPAAPA2PAAPAPAPAPA7PPAPAPAPAAPA2PAAPAPAPAPA3PA3PAPAPAPAAPA2PAAPAPAPAPA7PPAPAPAPAAPA2PAAPAPAPAPA3PA3PAPAPAPAAPA2PAAPAPAPAPA7PPAPAPAPAAPA2PAAPAPAPAPA3PA3PAPAPAPAAPA5PAPA2PA8PAPAPAPAAPA5PAPA2PA8PAPAPAPA10PA2PA8PAPAPAPA8PAPA12PAPA28PA446PAPAPAPAAPA2PAAPAPAPAPA8PAPAPAPAAPA2PAAPAPAPAPA8PAPAPAPAAPA2PAAPAPAPAPA3PA3PAPAPAPAAPA2PAAPAPAPAPA8PAPAPAPAAPA2PAAPAPA2PA8PAPAPAPA10PA2PA8PAPAPAPA10PA2PA8PAPAPAPA10PA12PAPAPA570PAPAPAPAAPA5PAPAPAPA8PAPAPAPA10PA2PA8PAPAPAPA10PA2PA8PA2PAPA10PA12PAPAPAPA10PA12PA30PA638PAPAPAPA10PA2PA8PA2PA26PAPA764"

ContainerGrey =
	"0c000200A253PPA14PA5PHA3PPHHA2PH3APPH2OOPH3O2H2O4AP5APHHNNHHPH4NNH7NOPPH4OOPPH3OP4HHP7A15PPA5NHPPA3HNNHPPAAH2NNHPPH4NNH7NA47PPA5NHPPA170PA4PPHA3PH2AAPPH3A4PHHA2PPH2AAPH3OPPH3OOH3O3H2O3PHO3P2O2IP3HHOOIOPPHO2IP2O2POOPPOOP3OOP63OOP7OOP7OOP7OOPPH5P3H3P5HHP5HHP2OPPHHPPOPPH2OOIH2NNIIHHN2HHNNHPA2H2NHPAAH3NHPAH2NNHHPHN2H2PNNH2OHPNHHO2HPH2O2HPA61PPA14PA5PHA3PPHHA2PH2NAPPH2NOPH2NNOOHHNNOOIOAPH3OOPH2NO2H2O3PHNO3PPNO2P3IOIP4O2P7OOP2O2IP3OP2OOP7OOP63OOP7OOP2OP3O2IP3OIIHPPOOIH2P4OOIP3OIIHPPOOIH2OOIH2NNIIH2N2H2N2H3N2HHON2H2OOH2N2H2N2H2ON2HHO2NH2O2H2O4HHO4HHO5H2O4H4O2HPOIHO2HPOIHHOOHPOIHOHOHPOIHO2HPOIHOHOHPOIHHOOHPOIHOHOHPA3PPHHA2PH3AAPOH3APOIIH2PHI2OOHPHIIPIIOPHIIPOPIPHIIPOPOHNIOIOPPNI2OP2HNNIP3H2NNIPPH4NNIOH5NIOH5OIPOH3P4OOP7OP23IIP5NNIIP2OHHNNIPOIP7OP5OPOOP2OIP2O2IHPPOOIH2POIIH2NOIH2N2IH2N2HPOIIHHNNOIH2N2IHHN2H3N2H2N2H2OONNH2O2H2O4HHO5NNHHO3H2O4HO8HO6HO6HO2HO2HO6HOHOHOHO4H2O4H2OOHO2HHOHOHOH2O3HOHHOHOHOH2OOHOHOHHOHOHOHHOIHHOOHPOIH2OHPOIHHOHHPOIH2OHPOIH4PHIH4POIH4PHIH4PPHIIPOPOPHIIPOPOPHIIPOPOPHIIPOPOPHIIPOPOPHIIPOPOPHIIPOPOPHIIPOPO2IIOOHHOOPOIIPHONPO2IOONPO2PIOOPO2PO2PO2PO2PO2NNOOPO2POH3NNIH8OH5NIOOHHN2OIIOHHNHO2IOH2O2IOHO4IOHOOHHN2H2N3H2ONNH2O2NH2O3HHIHO5IHO5IHO5IHO20HO6HOOHO3HO6HHOHOHHOHO4H2OOHOHO2HO3HHOHOHOHHOOHOOHOHHOHOHOHOOH2OHOHHOHOHOHHOHOHOHOHHOHOHOH3OHOHOHHOH2OHHOHOHOH3OHOH5OH11PH5PAH3PPAAOIH3PPHIH2PAAH3PA2HHPPA3HPA5PA22PHIIPOPOPHIIPOPOPHIIPOPOPHIIPOPOPHIIPOPOPHIIPOPOPHIIPOPOAPOIIPO3PO2PO2PO2PO2PO2POONPO2POONPO2PO2PO2PO2PO2PO2PO2PO3IOHO4IOHHO3IOHOHO2IOHHO3IOHO4IOH2O2IOHOHO2IOHHO2IHO3HOIHOOHO2IHO3HOIHHO4IHO3HOIHHOHHOHIHO2HHOIHHOHOOHO2HOH3OHOHHOHOHOHOH3OH2OOHOHOHOH5OHHOHOH7OH3OHOHOH3OH5OH12PPH4PAAH2PPA2HHPA4PPA5H2PA3HPPA4PA111PPOIIPOAAPHI2PA2PHI2A3PHHIA4PPHA6PA15OOPO2NNPOPO2POIPPO2POIIPPOOPOI3POPOHHI3POPPHHI2PAAPPHI2O2IOHOHO2IOHHO3IOHOHO2IOHHO3IOHO4IOH2POOIOHOHIPOIOHHOOHIHOHOHHOIH4OOIHOHOH2IH5OIHOH4IH3PHOH3PAHOHHPPAAOHOH3PHOH2PPAOH2PA2HHPPA3HPA5PA282PHHIA4PPHA6PA39IIPIOHOHI3OH4IIOH2PPHOHHPPAAPHHPA4PPA18OHHPA3HPPA4PA302"

ContainerRed =
	"0c000200A253PPA14PA5PCA3PPCCA2PC3APPC2OOPC3O2C2O4AP5APCCDDCCPC4DDC7DOBBC4OOBBC3OB4C5B3A15PPA5DCPPA3CDDCPPAAC2DDCPPC4DDC7DA47PPA5DCPPA170PA4PPCA3PC2AAPPC3A4PCCA2PPC2AAPC3OPPC3OOC3O3C2O3CCO3C2O2BC5OOBOC2O2BC2O2COOCCOOC3OOC37BBC23OOC7OOC7OOC7OOBBC5B3C4B4C4B2C4OBBC3OBBC2OOBC2NNBBCCN2CCDDCPA2C2DCPAAC3NCPAC2NNCCPCN2C2PNNC2DCPNCCD2CPC2D2CPA61PPA14PA5PCA3PPCCA2PC2DAPPC2DOPC2DDOOCCDDOOBOAPC3OOPC2DO2C2O3CCDO3CCDO2C3BOBC4O2C7OOC2O2BC3OC2OOC7OOC63OOC7OOC2OC3O2BC3OBBC2OOBC7OOBC3OBBC2OOBC2OOBC2NNBBC2N2C2N2C3N2CCDN2C2DDC2N2C2N2C2DN2CCD2NC2D3CCD4CCD4CD7CCD4CDC2D2CPDBCD2CPDBCD2CPDBCD2CPDBCD2CPDBCD2CPDBCD2CPDBCD2CPA3PPCCA2PC3AAPOC3APOIIC2PCI2OOCPCIIPIIOPCIIPOPIPCIIPOPOCDBOBOCCDB2OC3DDBC6DDBC6DDBOC5DIOC5OIPOC8OOC7OC23BBC5DDBBC2OCCDDBCOBC7OC5OCOOC2OBC2O2BC2OOBC3OBBC2NOBC2N2BC2N2CCOBBCCNNOBC2N2BCCN2C3N2C2N2C2DDNNC2D2C2D4CCDDCD2NNCCD3C2D4CD8CD6CD6CD6CD12CD5CCD4CDCD5CCD4CCD6CCD4CCD6CCD4CCDBCD2CPDBCD2CPDBCCDDCPDBCDCDCPDBCCDCCPDBCDCDCPDBCCDCCPDBC4PPCIIPOPOPCIIPOPOPCIIPOPOPCIIPOPOPCIIPOPOPCIIPOPOPCIIPOPOPCIIPOPO2IIOOCCOOPOIIPCONPO2IOONPO2PIOOPO2PO2PO2PO2PO2NNOOPO2POC3DDBC8OC5NIOOCCN2OIIOCCNCO2IOC2O2IOCDDO2IOCDDCCN2C2N3C2DNNC2D2NC2D3CCBCD5BCD5BCD5BCDDCD4CD6CD6CD22CD14CD12CD14CD14CD14CD3CD6CCD4CCD5C2D3C2D3C4DCDC2PDCDC2PAC3PPAADBC3PADBC2PAAC3PA2CCPPA3CPA5PA22PCIIPOPOPCIIPOPOPCIIPOPOPCIIPOPOPCIIPOPOPCIIPOPOPCIIPOPOAPOIIPO3PO2PO2PO2PO2PO2POONPO2POONPO2PO2PO2PO2PO2PO2PO2PO3IOCDDO2IOCDDO2IOCDDO2IOCDDO2IOCDDO2IOCDDO2IOCDDO2IOCD3BCD5BCD5BCD5BCDDCD2BCDCD3BCDCCD2BCDCDCDDBCDDCD12CD14CD9CD3CDCD4C3DDCDC3D4CDCD2CCDCCDDCCDC2DCDC2PPDDC2PAAC2PPA2CCPA4PPA5C2PA3CPPA4PA111PPOIIPOAAPCI2PA2PCI2A3PCCIA4PACA5PPA15OOPO2NNPOPO2POIPPO2POIIPPOOPOI3POPOCCI3POPPCCI2PAAPPCI2O2IOCDDO2IOCDDO2IOCDCO2IOCDDO2IOCDCO2IOCCDPOOIOCDCIPOIODCDDCBCDCDCCDBCDCCDDCBCDCDCCDBCDC2DCBCDC4BC3PDC4PACDCCPPAADCDC3PCDC2PPADC2PA2CCPPA3CPA5PA282PCCIA4PPCA6PA39IIPIOCDCI3OC4IIOC2PPCOCCPPAAPPCPA4PPA18DCCPA3CPPA4PA302"

ContainerSmall_01 =
	"0c000180A166HA5HHA3H2PA2H2PPA4H2A3H3AAH5AH2PPH3PPOP2HPPO3PPO8PO4HPA5H2PA3H3PA2H5PAH7PH6OPPH4OOP2H2A31PA6HPA5H2PA3H3PA65HA22HA4H2A3H2PAAH2PPOAH2PPOOHHPPO3AAHHP2OH2PPO2HHPPO3PPO5PO2PO7PPO7PO10PPO7PO7PPO29NNPPO2NHHO3PPHHO4NNHO3NH2POONH3ONNH3ONH3O2H3OOPH2O2HHPH3PA2H3PA2HHOOPA2O2PPA2OPHHPA2H3PA2H3PA2PH2PA8HHA3H2PA2H2PPAOOH3PPOOH4POOH4PPOH4P3H4PPOOPOOPO4PPO15PO6HPPO4H2PO3H3PPO17PO7PPO3NO2POONHO3NNHHO2NH3ONNH2O3PNNH2OONH3OONH3OONH2O2PH2OOPH2O2PH2OOPH4OPHHPH3OOPH2IOOPH3IPH2PHHIH3PHHIPH2PHHIPH2PHHIPH2PHHIPH2PHHIPH2PA2PH2PA2PH2PA2PH2PA2PH2PA2PH2PA2PH2PA2PHHPA3P4H2PAP4HPA2P4A3P3AAPA2PPAAPA3PAAPAAPAPAAPAAPAH4PNNH15PPH5P2H3OP7AAP5A2PPAAPNH3OOPH2O2PH2OOPPHHO2PH3OPPH4PHHIPH5IPH5IPH6PH6PH2PH2PH2PH2PH2PH2PH2PH6PH2PH2PH5PPH2PHHIPH5PPH2PHPPH4PAAPHHPPA2HHPA4PPA13P2A4PA54PAAPAAPAPAAPAAPAPAAPAAPAPA2PAPAAPA2PPA2PPA2PA3PA7PPAPA2P4A2PAAPPA2P4A2PAAPPA2P4A2PAAPPA2P3APPAPAAPH2IPH5IPH5IPH5IPH5IPH5IPHPPH2IPPAAH2PPA2PH2PHPAH3PPAAPHHPA3HPPA4PA165PA58P6AAP3AAP5A39HHPA4PPA245"

ContainerSmall_02 =
	"0c000180A166HA5HHA3H2PA2H2PPA4H2A3H3AAH5AH2PPH3PPOP2HPPO3PPO8PO4HPA5H2PA3H3PA2H5PAH7PH6OPPH4OOP2H2A31PA6HPA5H2PA3H3PA65HA22HA4H2A3H2PAAH2PPOAH2PPOOHHPPO3AAHHP2OH2PPO2HHPPO3PPO5PO2PO7PPO7PO10PPO7PO7PPO29NNPPO2NHHO3PPHHO4NNHO3NH2POONH3ONNH3ONH3O2H3OOPH2O2H6PA2H3PA2HHOOPA2O2PPA2OPHHPA2H3A3H2A4HA12HHA3H2PA2H2PPAOOH3PPOOH4POOH4PPOH4P3H4PPOOPOOPO4PPO15PO6HPPO4H2PO3H3PPO17PO7PPO3NO2POONHO3NNHHO2NH3ONNH2O3PNNH2OONH3OONH3OONH2O2PH2OOPH2O2PH2OOPH3AOPH2A2HOOPH3OOPH2AAPH3A2H2A4HHA94P3H2AAP4HA3P3A4P2A6PA23H4PNNH15PPH5P2H3OP7AAP4HA2PPAAHNH3OOPH2O2PH2OOPPHHO2PH3OPPH2AAPH3A2H2A4HHA5H3A3H2A4HA242P2HA311"

Jet_Sprite_01 = "0c0000c0A94LA5LLA4L2A3L4A2L3AALA5L2A3LLMMA3L2MA3L2MA3MMLLA3L3A3LLA12LA21LA10LA23L4A2L2A2LA109"

Jet_Sprite_02 =
	"0c0000c0A94LA4L2A2LLALLA3L2MA4L2A2LA5L2A3L2MA2LLMLMA2L3MA2L4A2L4A2L2A43LA11LA11LAL4A3L2A3LLA4LA4LA30LA63LA189"

Jet_Sprite_03 = "0c0000c0A94LA5LLA3LALLA2L4A4L2A2LA5L2A3L2MA2L3MA2L2MMA2LLMMLA2L4A2L2A34LA5LA17LA7LAAL3A2L3A2LALA42LA62"

Frame03_Ship =
	"0c000240A358OA3O3AACCO3AC4OOA5CCA3C3AADDC7DDCCOC4DDO3C3O5CCO7CD2A3C3D3C15DC7DDC7DDCCDOC3DDEA15DDA5CCDPA3CCDPA3CDEPA3DEEPA3E2PA274DA5DDA5DDA5CDA5CCA5CCA5C17DC6D2C4D4C3D6C3D3C5DDCO6C2O4C5OOC6DC5DECCD4ED3EEDED3EEDEO2CDE2O2NE3ONNME2JNM2EEJJM3EJ2M2J4MJ12PPEEPA4PCPA4PCPA4PCPA4PCPA4PCDPA3PCDPA3CDEPA265CCA6CA6DA6DA5DDA2D2CCAD2C2D2C2D2C7D2C4P2DDC2POP2DDCPOPOP2D2POPOPPD3POPOD3EEPOCD2EC3DC2DC2DCDCDC2DC2DCCDDC2DCCPDC2DCDPD3EDEPPDDEEDEJ4PPDJ3PDDEJJPPDE2PPDDE3DDMME3M3E3M3E3M3E3DEEPA3E2PA3E2PA3E2PA3E2PA3E2PA3E2PA3E2PA34CA5CCA4C2A3C3AAC3DDA3C2A2C5AC5DC4D2C2D4CCD3CCD4C2D2C2PPA15DA6DDA5CCA3DDCCAAD2CP2D2CCPPDDC2PA4D2A2D2CCAAD2CCD3C2PODC3P2C2PN3CPN13C2D4CD6OOD4EO3DDEEO3POPEP2OPOPPN2P4NNO2P2DDE18PE7PDEEPE2DCE2PDDEEPEDDE3PDCE4P2DDEDEEPPDEEDEEDPDDEDEDCPDDEDE2PDDEDE2PD3E2PDDEDE2PDDEDEM3E3M3E3M3E3M3EDEEM3EDDEM3EDEDM3EDEDM3EDE4PA3E2PA3E2PA3E2PA3E2PA3E2PA3E2PA3DEPA5OPPCD2JO2PCDDPJO2PCCJLJOONCCJLLONNCCJLMPNNCCJLMPNNCCJLMPNNCCDDC2P2C2P2DDCCPPEDC2PPDEC3PPC2PNCP4NNCPDP2ONCPD2PPODDC3NNC3PN2CCPN4PN29OON3O2N14ON5OON3O3NNO5NO5CO4CEEO2CCEEDNO5CO4CCEO3CEEDOOCCED2CCEED3EED10CD4PPCDDCE14DDE4D2E3DPDDEEDDPOD3P3DDPPA3DPA5EEPDDEDEDDPDDEDEDPPDDEDEPOPDDEDEOOPDDEDEP2D3EAAPD3EAAPD3EM3ED2M3EDDEM3EDEPM3EEPAM3EPAAM2PPA2MMPA4PPA5EEPA4EPA5PA46JJLPNNCCAJJP3CAAJD2PCA2P4A31CPD3PPCPD4P2D5PPD5AAPD4A2PD3A3PPDDA5PPO2NO3P2O3CDDP2OCEDDEEMMEEDDEEMMED2EEMMED2EEMMED2EEMMEDOCCEED2CEED3PED3P2D3PPOOD2PO3D2PPO2D2P2OOD3P3DP3CDPPONNP3O3NPCCO2PPC2OPPC4PC5DPC4DDC3D3P2A4C2PA3C3PA2C2DDPAACD4PAD3MEPAD2MMEPADEEMMEPA2PD2PPA2P2A305PD6AP6A47D2PAPCCP2AAOPPA3JO2A3PJOOA3JLJOA3JLLOA3JLMPA3JLMPCCD4ECD4EEPCDDE3OPCE4ONCE4NNCE4NNCE4NNCE2DDE2MMEPAE2MMEPAE2MMEPAE2MMDPAE2DDPAAEEDPPA2DDPA4PPA393JLMPA3JJLPA4JJPA5JDA6PA23NNCEEDPPNNCDDPAAPPDPPA2DDPA4PPA285"

Frame03_Ship_Shadow =
	"0c000240A301IIA4I2A2I4A12I2A2I4AI38A2I3AI55A7IA6I2A4I4A2I6AI23A55IA121IIA3I4A55IIA4I2A21IIA3I3A2I28AI189AI22AI4A2I3A3IIA92IA5IIA3I3AAI5AI22AI5AI6AI6AI39AI6A2I4AAI180AI34A4IIA5IA14I5AAI3A3I2A4IIA168I2A58I6AI6AI6AAI5A3I3A5IIA6IA7I133AAI3A3I2A4IA14IA6IIA5I2AI3A450I4A3I3A4I2A5IIA4I2A2I4AAI5A2I51AI4A2I2A4IIA5I3A3I3A3IA6IA418I3A4I2A47IA318"

function loadFrame03Sprites()
	tomem(unpac(Beam))
	loadSprite("Beam", 97, 78, 0)
	--tomem(unpac(BgDittering))
	--loadSprite("BgDittering",128,128,0)
	tomem(unpac(BgDitterTop))
	loadSprite("BgDitterTop", 101, 61, 0)
	tomem(unpac(BgDitterBottom))
	loadSprite("BgDitterBottom", 90, 58, 0)
	tomem(unpac(ContainerGrey))
	loadSprite("ContainerGrey", 64, 62, 0)
	tomem(unpac(ContainerRed))
	loadSprite("ContainerRed", 64, 62, 0)
	tomem(unpac(ContainerSmall_01))
	loadSprite("ContainerSmall_01", 45, 43, 0)
	tomem(unpac(ContainerSmall_02))
	loadSprite("ContainerSmall_02", 45, 33, 0)
	tomem(unpac(Jet_Sprite_01))
	loadSprite("Jet_Sprite_01", 21, 16, 0)
	tomem(unpac(Jet_Sprite_02))
	loadSprite("Jet_Sprite_02", 21, 17, 0)
	tomem(unpac(Jet_Sprite_03))
	loadSprite("Jet_Sprite_03", 21, 16, 0)
	tomem(unpac(Frame03_Ship))
	loadSprite("Frame03_Ship", 68, 61, 0)
	tomem(unpac(Frame03_Ship_Shadow))
	loadSprite("Frame03_Ship_Shadow", 65, 42, 0)
end

-- Frame04
local F4_Ship01 =
	"0c000140A133PPA4PPDA3PIDDA3PI2A2PIIJPA2PIJJPA2PIJPPAAPPIJP2J2PIPPD6ID5IEI6EP3JIJEP3JJEJP2JJIJLP2JJKLLP3A3EJJPPA2EJLJ2AAJLLKJJAAJL2JJAAL2KJA2LLKJJA2LKLJJA121PA6PAAPIIJ2AAPIJ3APPIJ3APIN4PPN5PIN5PIJ5IJN5J4KLLJ3IL2J3KL2N2OMMLKN2OM2LNNOM4JJKLM3JIKLLM2LLKJA3LKJJA3KLJJA3LJJA4KJJA4KJA5MJA5JA77PA5PPA5PIA4PPIA4PIJA4PIJA3PPIJA3PIJIIJJNNJ2IJ29IIJ5KJ5IKJJIJ2IKJKJLLKMMIKL3KMKKL2KKJKJLLKLKJKLLKLKKAKLKLKKJAL2K2JALLKLKKAAJA6JA90P3A2PJ3AAPJ3KAPJ4KA3PIIJA2PPIJIA2PIJIJAAPPIPJIP3IPIPKPPIJIJIOPIPIPIPIIJIJIJIIJ4KJJIJJIIKLIJIJJKKLJIJPPKILIPIPPKIIJIJPKKJIIPIPKJJPPIPPKJPPLKLKKJAALLK2JAALKLKKA2KLKKJA2LK2P3IIP2J2PIIPJ3P2J4A31PPA5JLPA4JLLJA3L3JA3PJ3KOAPJ2KOIPN3KOIPN2KOIP4JOIPPELLPJOPE2LLPPOAAEELMPPIPIPIPIPPIPIPIPIPPIPIPIP17O6P7OP2O3IPIKKJP2IPKJJPPIPKKJJP3KJJP5JJP2OOP13O4P5J4P2J4PPN4LPPN4MP4JMMPPEELPJMPPEELMJMAPEELMPJLLKLJA2LKLKLJAAKLKLKJAALKLKJA2KLKKJA2MKKJA3MKKJA3MMKJA6EELMPA3EELPA3EELLA4P2A31JJP5JPPA4PPA5PA38P6A57PAEELMPA3ELLPA3EELLA4P2A31MMJA4JMJA4PJA5PA38"
local F4_Ship02 =
	"0c0000c0A68I2A3ID2A2IP3AAIOOPPLAAIOOPPLAIOOPPLLAIOOPLLKIOOPPLKIIA6DIA5LLIA4LKIA4KIA5KIA5IA21IA6IA5IOA2OOIOOAAOOIIOPAOOIIOOPOOIIOOPPOOI5OOPPLLKIOPPLLKIAOPPLLKIAPPLLKIAAPLLKIA2PLLKIA2LLKIA3IKKA69EI2AAEAE2A2EA47I2A4EEA117"
local F4_Ship03 =
	"0c000100A94PA6PA5PJA4POOA4O2AAP5APDDPPDDPJPIIPPKJI4PKJI3PKLI4LKLO4KLLO3MMLLP3A3KD2PA2K4A2L3KA2L2KA3LLKA4LLKA4LKA73PO2A3PJIIA2PJI2A2PJI2AAPJI3AAPJI3APJI3PAPJI2PKO2M3LIIPKM3IPKLLM2IPKL2MMPKL3KAKL3KAAKLLKLKAAL3KA2LKA5KA6MA61PA6PA5PJA5PJA4PJIA4PJIA2J2PIPJI3PKJI3PKLJI3KLLI3PKLKI2PKLKLIIPPK3IIPO2MMIPPJJL3KLLA3L2KA3KLKA4LKLA4KLA5KKA5KA6MA72JJP3AJJP4AJP14EEP4APEEP3AAPPEEPA4PPAAPPJJL3PPJJL3PJJL4PJJL4PEEKKLLKPPEEKKLKAAPPEEKKA3PPKALMA5LLMA4LKA5KA6KA94"

function loadFrame04Sprites()
	tomem(unpac(F4_Ship01))
	loadSprite("F4_Ship01", 38, 44, 0)
	tomem(unpac(F4_Ship02))
	loadSprite("F4_Ship02", 19, 18, 0)
	tomem(unpac(F4_Ship03))
	loadSprite("F4_Ship03", 29, 32, 0)
end

-- Frame04
local F5_PlanetBG =
	"0c000200E245GGE3GGHHE29GGE2G3HG4H2GH7GGHGHGHE12G2EG10HHGH13P2HPHP2HP2GP4E3G5HHGHGH7PHHGHGHGH3PHPHPHPGPHPGPPHHPHPHPHPHP2APG2A4HHGA4HPHA4PHGA4HPHA4HPPA4P2A4PPA5E157GGE4GHHE2GGH2EEGGH3EGH5E2G4EGGHG5HG2HPHG2H4GH2PHPH10P2HPHPHP4GHHPHPHPHHGHP3HPHP2HP5H3PH3PPH3PPAP10AP2APHPHPHPH2P2HPHP2HPPHPH3P2AP7HAPA5PPAPAPA9HHPHP3APAPAPAPPHPHPHAHHPAPHA3HAHA2HA8HA2PA9P2A5PA6HA30HA13E78GE5GHE4GHHE3GH2E2GGH2E2GH3EEGH4GH11PHPH7PHHPHPHPHPH3PH5P2H3PHPPH3P3H3PH3PHP2APPH2PHPHHP7HPHPHPHP5APPHPHPHPAP3HPAP3HPHAP2APAP3HPHPPAPAPA2PAPAHAHAPAPAPAPAPA2HA3PPA7P5AP5A7PAAP2A4PPAAPAAPA2PA3P2A15PAPAPA8PA2PA12PA2PA12PA26PA30PA13E30GE5GHE5GHE4GHHE3GH2EGH5GGH5GH2PH5P2H4PH5PPHPH2PHHPHP3HPHP2H5PHHP2HP7HP6HP5HHPPH4PAPPHHP3AP3APAPPHPHAHAP2APAPAAP2AAPA2PAPA4PAPA2PAPAPA3PPA4PAPAPA2PA2PA2PA47PA9PA2PA30PA26PA2PA30PA40PA45E2GH3E2GH3EEGH4EEGH4EGHHP3EHHP4EGP5GHP4HHPPHHP2HP2HP10HP6HHPHP2HHP6HHPHPHPAHP10APAP4APAP3APPAAPPAPAPAPPAPHA2HPPAPAPAPPHA2HA2PAPAPAPA2PAAPPAPAP4AHAP2A2PA14PAPA12PA261HHP4HA55HHPHPHPHA55PAAHAHAPA375"
local F5_PlanetBG_02 =
	"0c000340E182PE5PPE30PE2P4EP22E12P2EP28A2PAPAPA2P2A3E2P34APA3P3A4P2A4P7E2P23APAPAPAP8APAPAPIPAP6E7P2E4P6EP9AP10APAPAPPAPAP2AAPAPE23PPE5P4AEEAPAPAPAAPAP2APPAPAPAPAPE47PAE5APAE133A6EA6EA6EA6EA6EA6EA6EA6E102PE5PPE4P2E3PPIPE3P3E2P4EEP4AP6AP10APAP4APAP4AP6APPAPPAP35AAP5AP4A4PA6PAPA4PAPA4PA6PAPAPAPA8PAPAPAPA12PAPA3PA7PAPA8PAPAPA5PPA2PAPAAPPA3P2AAPA4PAPA12PA22PA4P2A2PPA2PPAPPAPAPPA2PAAPPAPPAPAPA5P2A16PPA10PAPAPIPAAPA2PAPPAPAPAPAAPAPAPAPPAPAPIPA5PAAPA2PAPA7PPAPAAE2APAPAAEEPAP2AAEAPAPAPAPPIPAPAPAAPAPAPAPPAPAPAPPA2PAPAPE23AE6PAE5APAE4PAPAE3APAPAE67A6EA6EA6EA6EA6EA6EA6EA6E54PE5PPE2P4E2PIP2EEP4AEPIP3AP2AP2AP4APAPAP2APAIP5AP2AP4APAPAP2APAPAP4APA2PAPAPAIAPAPAP4AP6AP7AAPPAAPA6PAPAPPAPA6PPAIAP3A3P3IAAP5A4PPAPA2PA9P3A2P3A4P3A3P3A3P2A4PA7PA2PAPA8PAPA2PA30PA7P2AAPA12PA2PA8PA16PA2PA4PAPA18PPA11PAAPAPAAPAPAPAPPAP2APAAPAP2APA15PA2PA3PAPAPAPPAPAPAPAAP2APAPPAPAPAPAPPAP2APPAPAPIPA5PAPPA2PAPA8PAPAPA3PAPAPAPPAPAPAPAPPAP2APPAPAPAEEAPAPAAEEPAP2A5PAPA5PAPAAPAPAPAPPAPA2P3A4PE23AE6AAE5AAE5PAAE4APAAE4A6EA6EA6EA6EA6EA6EA6EA6E5PPE5PPE4PIPE4PPAE3P3E3P3E3IP2E2P9APAP4APAP6AP6AP6AP4A2PAPA4PAPA4PAP6AP5AAP4APAP2A3IA5PAIA12PAPA22P3AAP15APA37PPA5PPA5PPA5PA37PA5PA5PAPA3PAPPA2POOA3POOA3PPOA5PAP3APAP5APAP2APPAP4A3P3A3P3A3P2A4P4APAPAPAP8APAPAPAP12APAP10AP2AP8APAPAPAAPAPAP3APAPAPAPPOP2OPPAPAPAPAOP2OP3APAPAOAPO6PAPAPAPAAP2AP3APAPAPAP8APAPAPAOP6OAOAOAPAO7PAPA4P3A3PO3PPAPO5APO5P2O4PPAP6OPOP5AAE3APAAE3AAPAAE2A4E2AAP2AEEP4AEEP3OAEEOP4AEEA6EA6EA6EA6EA6EA6EA6EA6E2P4EEP5EEP5EEPIP3EEP5EP6EP3APPEPPIPAP2APAAPAAP4APAPAPA4PA4PAPPA5PA6PPA5PPA4PA7PAIA12PAPA12PA2PA10PAPA2PA26PA30PA19PA5PA4P3A3PAPPA2P4A4PPA6P4OOA2P2A4PPA5PPA5P2A3P11AP2APPO2PPOA3P3A2P4AAPAPPOAAP3OPOP3OP3OPOPOPOPPOAPPOAPOPOPOPOP4AP2OPOPO2P2AOPOAPOPO2POOPOPOAOOPOPOPOPOOPOAOAOAPO7AOOP3OP6OPOP4OP6OAP5OOP5O2P4O2P3O16PO6PO6PPO5PO6PO15AOPOP2O6POAOPOPOPO5PPOPO2P2O5PPO2POP2O5P7AEP6AOP2OPPAP6AO3P2AO3P3O3P3O4P2EA6EA6EA6EA6EA30EP2A3EPPA4EPPA4P2A4P2A4P2A4P3A3P3A3P2A4PAPPAAPAPA6PAPAPAPAPPA5PAPAPAPA8PAPAPAPA8PA2PA10PAPA2PA8PA34PA24PA4PA6PA7PAPA5PPA5PPA4PPA5P2A3PAPPAP7APAP2AP6OPO3P3O4POPO5APPO3POP3OP3OPOPOPOP2APPOAPOPOPOPOOP2OPOPPOPOPOPOP2APPOOPOPOPO3PPOOPPOPOPO2POPO6PO12PO6PO6PPO4PO6POOPOOPO3PO108PO14PO5PPO5PO2PO2P2O5PPO2POPOPO14PO25P8OPPOP4OP2O4PPOOPOPOPOPO3PO3POPOPOPOOPO2POA23PA6OA6PA6OA6OA6P3A3P6APPIPPA2P2APAPAP2AAPA2PPAPAPAAPIPA2PAPPAPAPA5PAAPAPAPA10PAPA5PA5PAPAPA10PAPA30PA40PAPPA2PAP2A3PAPA3P4A3PAPPA4P2A5PA6P2AP2AP10OPAPAPAP4OPOPAP2AP6OPOP2APAPAP4OPOPAPPOAPOPOPOPOPOPAPAPO2POPOPO3AP2O2POPOPO2P2APO2POPOPO65PO40P3O6P2O6PO65POPPO71P2O4P2O5PPO6PO24POPOPOPPO2PO2PPOPOPOPPOPO2POPOOPOPOPO3PO5POPOPOOPO2POOA6PA6OA6OA6OA6EA6EA6EA7PPAPAPAIP2APAAEPPAPAPAEPIPA2PEEPAPAPAEEPAAPAPEEPAPAPAEEIPA2PPAPA5PA5PAPAPA10PAPAPA3PA5PAPAPA5PA66PA6PA22PA6PA5PPA5PAAPAP5AP8OPOPOPAPAP6OPOPOPAP8OPOPOP2APPOP3OPOP3OPOPOOPOPOAO2PPOPOPOPPOPO5POPO3POPO5POPOPOPPOPO5PO14PO14PO11PO6PPO12PPO5PPO5PPO4P2O3P2O3P3OOP4O2PPO181PO7PO8POPOPO12POPO5PO5POEO3POOEO2POPOEOOPO2PEEA6EA6EA6EA6EA6EA6EA6EA6E2PPAPAE2PAPAAE3PAPAE3PAAPE3P2AE4P2E4P2E5P2APAPA3PAPA3PAPAPA5PA3PAPAPAPAAPA5PAPAPA5PA18PPA2PA9PA14PPA2PA9PPAPAPAPPAPAP5APAP2OPPAP2OOPAPAPO2APAPAO2PAP5APAP12APPOP11OPPOP3OP9OP9OP3OPOPOPPOPO3P2OPO2PPOPOPOOP2O4PPOPOPOOPOPOPO3POPOPOOPOPOPO48POPOPOPO177PO25PO6PO6PO5PO5PO21PO8POPOPEEOOPOPOEEOPOPOE2OOPOPE2OPOPOE2POPE4OPOE4OOE6A6EA6EA6EA6EA6EA6EA6EA6E5PPE6PE47P2APAPAPPAPAPAAP2APAPAPPAPAPAAEPPAP2AEEPPAPAPE2PPAPPE2P2APAAPA2PA7PPAPAPA9PAPPAAP2A7PAP2APPA7P2AP3APAPAP3AP7AP12APAPAPOP8APAP8OPOP3OPOPOPPOP2OP2OOPOPOP3OPOP3OPOPOP5OP5OPOOPOPOPOOPOPOPO2PPOPOPOOPOPOPO3POPO3POPOPOOP2OP2OOPOPOPO7PO15PPO4PO6POOPO2PPO2PPO118POOPO4PPO49PO14PO5PO7PO5POOPOPOPOPOOPO2POOPOPOPOEPO2POEEOPOPOE2OOPOOE2OPE5PE55A6EA6EA6EA6EA6EA6EA6EA6E67P3E4P2E5PPE6PE31P3A2PAPA5P11A3P6AEEP2APAEEP5E2P3AP7APAPAPOP8A2P4A2P4AAPAAP6AAP2APAPAP5OPOP2OPPOPOOP4OPOPOPOOPOP5OP2OP2OOP14OOP2OPOPPO2PO2PPOP2OPPO4POOPOPOPOPPO2POP3OP4OOPOPOPPO7PO7PO13P3O3P4O2P5OP5O17PO5PPO5PPO5P2O7POPOP2O5PPO7PPO5PPO5PPO5PO5PO3PO3POPOPOPOOPO2PO5POPO12POPO5PO5POPPO2POEEOPOPOPEEOOPOPE2OPOPE3POPE4OPE5OE103A6EA6EA6EA6EA6EA6EA6EA6E131P3E5PPE6PE39P8APAPAP9EEPAPAPAE2P4E23P13OP32EP6E4P6OP4OOPOOP10OPOP8OP6OP20OPOOP4O3P2OPO2POPOP12OOPOPOP15O4P3OPO2PO5P2OOPOPO3POPOP3OP16E4OPOPOPOPPOPOPOPPO2P4OOP4EP4E2PPE21OPOPE3POE5PE175A6EA6EA6EA6EA6EA6EA6EA6E7A55E7A55E7A55E7A55E7A55E2P4A55P4E2A55E7A55E7A55E7A55E7A55E7A55EA62"
local F5_Ship01 =
	"0c000340F211C3FFI5FFIP3AFFIPPI2F4IAAF4IAAFFD13C7I7A7I7A6IA6ID6CD3C2DC7I7A9I5AAIA6IA4CD14C7I7A7I4AAIA3IAAIA3IAAID2CCD2C2D4C7I7A7I6OA5IOA5IOD14EC3E3IOOCE3IOOCE3IOOCE3IOI6OOA4DE46I7A6OEDEEMF2EEDEEMFFEEDEEMFFEEDEEMIIEEDEEMOOEDE2OI5AO10F23I7O7I7O7IOIOIO2F3A3F3A3F3A3IF2A3O2FA3I3A3O3A3O3A3F30DF5DCF4DCAF4DCAF4DCIF5DDF2N4D7C7A7B7I7B6ID7N7D7C7A7B7I7B7D6CN3C2ND2CD3C7A7B7I7B4IBBCCD5N7D7C7A7B7I7B7D4C2NNC2N2DCD5C7A7B7I7B7D7N7D7C7A7B7I7B7D7N7D6EC5EEA5CEB2I2ACIIO3ICBO4ICD4E2DDE5MMDE3DEMMDE2DEEMMDEEDE2MMDE4MMDE4MMDE17DE3MEEDDE3MEDI5E40DDE3MED2E3MDDI5E24DE3MOEEDE3MEEDE3MEEDE3MEEDE3MEEDE3MEEDE3MEEDE3MO3A3O3A3O3A3O3A3O3A3O3A3O2FA3O2FA3F4DIIF4DIIF4AIIF5AAF6DF5DIF4DIAF2D4I15A2P2A9D7I7PAAPAAPAD7I15AP2A2PA7D7I7APAAPAAPD7I15PPA2P2A7D7I7AAPAAPAAD7I15A2P2A9D7I7PAAPAAPAD7I15AP2A2PA7D7I7APAAPAAPD7I14OPPAAIIOOA5IID6EI6DAAPAAPAID3E3O5ICO5ICO5IIA7EM3E4M3EEOOPN3PE3M3E2MMDE4MMDEEI7A7E15OPOPOPOPE17IDE2I8A2I4E15OPOPOPOPE15DE6I2E4I7E15OPOPOPPE5MPPEEDE3MEDE4ODE4OOI4O2EEAIIO2EEAI4E2IIF2E2F4OOFFA3OOFFA3OOFFA3OOFFA3OOFFA3IF2A3F3A3F3A3FDDC4DDCCPPAADCPPAAPPDCPPIPIIDCPPIPAADCPPIPAIDCPPIP2DCPPBPJJC7A7P7I7A7I7P7JKJKJKKJC7A7P7I7A7I7P7K7C7A7P7I7A7I7P7KKLK4C7A7P7I7A7I5OOP5OOKL3POOC7A7P7I7A8I6AB6OAI5C3DE2A3CDEEP2AACDEI4CDEA3ICDEI2AICDEB2AICDEI3ACDE4M3E3M3E3M3E3M3EEDDM3EEDEM3EEDEM3EEDEM3E31D7E9M2EEMEEME3ME31D7E7MMEM2EMEMEEMEEME5MPE6ME6ME6MD5EME5M3E4ME6ME2F4E2F4E2F4E2F40A3F3A3F3A3F3A3F3A3F3A3F3A3F3A3DCPPIPIJDCPPAIBIDCPPAIAIDCPPAIAAFA3IAAF4AIIF5AAF6AJJKJKJKKJ2KJKJKIJ2KJKJBIJ2KJKAAIJ2KJI3J2KIA2IJ2I5JJLKLKL3KLKLKL2KKLKLKLLJKKLKLKLKJKKLKLKJKJKKLKLKJKJK3JKJKJK2LKKM4LLKLMLML2KLLMLMLLKL2ML2KL3MKLKL5KKL4K6LKKM3IOMKL4IMKLM5KLM5KLM5KLM5KLM5KLM4OIAB4OIIAI7AB2MI3AIIMMI3AAM2I4M3IA2M4IIAB3ICDEI4CDEB4CDEI4CDEA6I8A7I7EEDEM3EEDEM3EEDEM3EEDEM3IIAEM3IIAI4A2IIO2I3O3EEME3MEEMEMMEMEEMEEMEMEEM2EEME7I7O15EMEEMEEM2EEMEEMEMEEMEEMEMEEMEEME7I5FFO4F2O3F3E6MME5FE6FMME3FFE5F93A3F3A3F3A3F3A3F3A3F3A3F3A3F3A3F6AF47A7DA4IJDCA4IDCCA3IFDCA4FFDC3AF2D3CF6DA7JJKJKJKKJ7I7A15C7D7A7K7J7I7A15C7D7A7MLLM4J7I7A15C7D7A7M5IAJ5AAI7A14C7D8A7IA6IA2CDEEIAACDE2A2CD3C2DE3D15A15E4DE5DE2D3ED2EEDE4DDED6ED4A15E15D7E6FD3F11A10F4EEF5EF38A7F55A7F55A7F3A3F3A3F3A3F3A3F3A3F3A3F3A11"
local F5_Ship02 =
	"0c0001c0F4P2F5DDF4I2F4OIAF4OIAI9AIJJKJIIAIJJKJP2O4EEP5I2O4A2ION2A2ION2I7KJKLML2KLKL4O7P7O7N15I7M4IPPM4IPIO5PFP7O7N15I3O3P3IONNI2PIONMF15O7N15O7N7MMNM2NMF15OON2OOFN2M2N5M2NO7N6M2NM2NMF4A2F4A2F4A2F4A2NF3A2O2FFA2MMN2A2MMN2A2IIAIJJLJFIIAIJJKFIIAIJJKFIIAIJJKFFIIAIJJFFIIAIJJF2I4F6AKLKLML2JKJKLMLLJKJKLMLLJKJKLMLLKJKJK3J7I7A7M4IPDLM2I3LM2IP2LM2IPDDK2I4J2IPIPPI7A3P2ADEEPIONMI3OONMP2IOONMEEPION2I2O4IPIO4I7PAPAPAPAN2MNMN2MNM2NNMMNMNMN9O9NONONOI7APPAAPPAMNNMN2MMNNMMNNMMNNM2NMN6MO8N4MMI7AAPPF3MMN2A2MMNNFA2MMNNFA2MMNNFA2OOF2A2MNF2A2IF3A2F4A2F63IAAIO3FI3O2FFI3OOF2IAAIOF2IAAIOF2IAAIOF2IDDIOF2IDEIO5P2O4PFFNONONPFPONONOP2NONONPPFONONNPFFN4PFFN4PFP10F2PFFPF2PF5PF5PF5PF5PF14P7F55P2F65A2F4A2F4A2F4A2F4A2F4A2F4A2F4A2F47A15F2IDEIOF2IDEIOF2IDEIOF2IDEIOF2I3OF3IIOOA15N4PPFN4PFFON3F2NON2F2O3F3O2F4A15F47A15F47A15F47A15F4A2F4A2F4A2F4A2F4A2F4A18"

function loadFrame05Sprites()
	tomem(unpac(F5_PlanetBG))
	loadSprite("F5_PlanetBG", 59, 41, 4)
	tomem(unpac(F5_PlanetBG_02))
	loadSprite("F5_PlanetBG_02", 97, 97, 4)
	tomem(unpac(F5_Ship01))
	loadSprite("F5_Ship01", 100, 47, 5)
	tomem(unpac(F5_Ship02))
	loadSprite("F5_Ship02", 53, 30, 5)
end

-- Frame04
local F6_Ship =
	"A128K6OKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOJOKOKOKOKOKOKOKO2KKLJOPOOCB8A122O3K41JJK13LOK2LJOPOOCB8A121OONNK8OKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOK2OK2OK2LOKKOKJOPOOCB8A120OONNK42JJK15LK3JOPOOCB9A97OA13O7NNK12OKOKOKOKOKOKOKOKOKOKOK9JK16LOK2LJOPOOCB8A97ONOOA9OON7K43JJK16LOK2LJOPOOCB8A96OON3OOA5OON7K16OKOK2OK2OK6OK2OK2OJJK17LOK2LJOPOOCB8A96ON7OA2OON7K44JK18LOK2LJOPOOCB8A95OON9OOPONOONNOOMOK42JJK18LOK2LJOPO2CB7A96ONON10OPPONO2M3K40JK19LOK2LJOOPOOCB7A97JONNON10OPPOOKM5K17OK2OK13JJK19LOK2LJOOPOOCB8A97OJJONNON10OPKM8K32JJKKJJK17OK3LJOPOOCB8A91O3A2OPOJJONNON10OOM8K30JK5JJK14LK3LJOPO2CB7A91ON3OOAOP2OJOONON10OOM9K26JJK8JJK11LOK2LJOPO2CB7A91ON6OOP4JJONOON7PNNOKM9K22JJK12JJK8LOK2LJOOPOOCB8A91OON3O3P5OJOONOON4P3NOOKM8K20JK16JJK5LOK2LJOOPOOCB8A92O2NOON4P5OJJONNON2P6NOKM9K16JJK19JJK2LOK2LJOOPOOCB8A94O4N2O2P6OJJONOONNP6NOKKM9K13JK23JJKOK3LJOPO2CB7A94NNPO3NON3P2LP2OOJONNOONNP5O2KKM9K9JJK26LK3LJOPO2CB8A92NNOOPPO4N3OK2LLPPOOJJONNONNP4N2OKKM9K6JJK27LOK2LJOOPOOCB8A91NNO2PPNOPPO2NNOKKJKOL2PO2JONNOONNPPN4OK2M9K3JK28LOK2LJOOPOOCB8A84O3AANNO2PPNNP4O2KKJJKKOLKKLPPOOJJONNOOPN4O3K2M9JJK28LOK2LJOOPOOCB8A84ON2O4PPONNOOPNNOPOKKJJK3OLK2LLPO2JJNOPON3OPN3OKKM6JJMK28LOK2LJOOPO2CB8A83ON5OPPONNOOPNNOPPKKJJK5OLK4LLPO2JPNNOONOPN5OOKKM3JM4K25LOK3LJOPO2CB8A84OON2O4NO2NNOOPPKJJK5OKOLK6LPPOOPJONNOPN5OPPK3JJM7K23LK3LJOOPOOCB8A85O2NON3OOPPNOOPPKKJK7OKOLK7LLPOPPJOOPON4OP3KJJKM10K20LOK2LJOOPOOCB8A85NNO3N2OOPPO2PKKJJK10OLK9LPPOPJJPNOONNOP3KJK4M9K18LOK2LJOOPOOCB9A83NNOOPO3NON3OPKKJJK12OLK10LLPOOPPONNOOPOPPJJK7M9K15LOK2LJOOPO2CB8A82NNOOPPOPO4N2OKKJJK14OLK12LLPOPJJONPOOPJ4K7M9K12LOK3JOOPO2CB8A82NOOP2ONNPPO4KKJJK16OLK14LPPOOJJPOPJJKKJ3K6M9K11OK3LJOOPOOCB8A83NP3NNOOPOPPOMKKJK18OLK15LLPO2PPJJKKJJKKJ2K6M9K8LK3LJOOPOOCB9A83NOONNOOPNNOPPM3K19OLK17LLOOPLJKKJJK4JJK7M9K5LOK2LJOOPOOCB9A84N2OOPPNOPPM6K18OLK19LPKKLLJJK5JK9M10K2LOK2LJOOPO2CB8A85NOOPPNNOPM10K16OLK25LLK4JK12M9KLOK2LJOOPO2CB8A86NOONNOOPM12K15OLK27LLKJJK15M7LOK3JO2POOCB9A85OONNOOPM16K13OLK29LK18M6KMMKKLJOOPOOCB9A84OONNOOPKM18K12OLK51M3LKM2LJOOPOOCB9A74N3OOA2OON2OPKMKM20K10OLK53MLKM2LJJOPO2CB8A73N4O5NNOOPM4KKM19K9OLK53LKM2LONOPO2CB9A71N2OOP5N2OPM8KKM19K7OLK52LOKMMLOONOPOOCB9A70N2OOPPONOOPNNOOPM11KM19K6OLK51LOK2MLOONPOOCB9A69N3OPPON3OOPOPM14KKM19K4OLK51OK3LONNPOOCB9A68N3OPPON6OM19KM19K3OLK25LOOK21LK3LJNOONOOCB9A67N2OPPON8M21KKM15KKMMKKOLK23LLOPPOK19LOK2LJON3OCB9A66N2OPPON8M25KKM11KKM4KOLK22LOONNOOK18LOK2LJOONONNCB9A65N2OPPON8M29KM8KKM7OLK21LOONONNOK17LOK3JO2N3B9A64N2OOPOON7M32KKM4KKM9OLK19LLOONONONOK16LOK3LJOOPN2B10A62N2OOPPON7M36KMMKKM9KKJLK18LO2NONONNOK16OK3LJOOPPNNB10A61N2OOPPON8M38KKM9KKJJOLK18LOON2ONONOK15LK3LJOOP2NNB9A50KKJA6N3OPPON8M42KKM5KKJJKKOLK19LLOONNONNOK14LOK2LJOOP2ONB9A49K4JJA2N3OPPON8M46KKMMKKJJK3OLK11LKL4K2LLOONONOK13LOK2LJOOP2OOB10A47K8JJN2OPPON2O5M49K2JJK5OLK9LLK6LLK2LLONNOK12LOK3JO2P2OCB9A46K3MK7JJOPON3O4M49K2JJK7OLK7LLK10LLK2LO2K11LOK3LJOOP2OCB9A45K3M4K7JON2O5M48K2JJK9OLK5LLK14LK2LLK12OK3LJOOP2OCB9A45K2M8K6JJO5M48K2JJK11OLK3LLK17LLK2LLK9LK3LJOOP2OOCB9A43K4M10K6JJOOM48K2JJK13OLKKOK22LK3LK7LOK2LJOOP2OOCB9A42K7M10K7JJM46K2JJK13OKOLKKOK23LLK2LLK5OK2LJOOP2OOCB9A42K10M10K7JM43K2JJK15OKOLKKOK25LLK2LLK3OK2JOOP2OOCB9A43K12M10K6JJM38K3JJK17OKOLKKOK27LK3LLKKOKKLJOP2OOCB10A43K14M9K7JJM34K3JJK21OLKKO2K26LLK3LKOOLJOOP2OCB10A44K16M9K7JJM30K3JJK23OK2O4K26LK4OOJOOP2OOCB9A45K17M10K7JM27K3JJK23LLOK3O4K26LLK2O3P2OOCB9A46K19M10K6JJM23K3JJK22L2OOPOOK3O4K26LLKKOOP2OOCB10A46K21M9K7JJK23JJKJJK19LLO3NNPPOOK3O3K26LLO2PPOOCB10A47K23M9K7JJK19JJK4JJK15LLO3NNONONPOOK3O4K22LLO4POOCB10A48K24M10K6JJK16JJK8JK14O2N3ONONONPPOOK3O3K19LLO2PPOOPOCB10A49K26M9K5JJK14JJK11JJK11OPN2ONONONONONNPOOK3O4K15LLO2P4OPOCB10A49K28M7K6JK12JJK15JJK9OPON12OPPOOK3O4K12LKOOP2G2POOCB10A50K28M7K6JJK9JJK19JK10O15KPO2K2O4K9LLOOP2EFG2POCB10A51K28M7K6JJK6J2K22JJK26PPOOK3O4K5LLO2PPEEFFGFGPOB10A52K28M7K6JJK4JJK27JJK25OPPOOK3OOPOK2LLO2P2E2FFGFGPOB10A52K28M7K7JJKKJJK31JK26OPOOK3OOPOKLO2P2MME3FGFGPOB9A53LK27M7K7J3K34JJK20L2KKOPPOOK3OPO2P2M3E2FFGFGPB9A54K28M7K7JJK38JJK12L5O5KOPO2KKOPOOPPM4EMMEEFGFGPB8A55LK2LK39JJK40JK5L5O5K5O2PPO3POPM4EMMEEF3PGHB8A55K45JJK40L5O5K11L2OOPPOOPOM3EMMEEF4GHHGPB6A56KKLK6LK34JJK34L5O5K12L4J2O2POOPOMMEMMEEF4GHHPGGPPB4A57K45JJK28L5O5K12L5J4O5POOPOEMMEEFFEFFGHHPPG3PPB2A58LK2LK2LK2LK2LK2LKLK23JK22L5O5K13L4J5O6POPOPOOPOMEEFFEFFGHHPPG2FHGGPPBBA58K41L4JJK15L5O5K14L4J4O6POPOPOPOPOPOOPOEFFEFFGHHPPG2FHHG3PBA59K5LKLKLKLKLKLKLKLK10L15JK8L6O5K14L5J3O6POPOPOPOPOPOPOPOPOPOPF3GHHPPG2FHHG3HGPPBA58K22L34O6K15L4J5O4POPOPOPOPOPOPOPOPOPOPOPOPOPFFGHHPPG2FHHG3HHG2PPA58LKLKLKLKLKLKLKL35O7K17L4J4O5PPOPOPOPOPOPOPOPOPOPOP4OPO2PGHHPPG2FHHG3HHG3HA60K3L38O6K19L5J4O7P4OPOPOPOPOPOP7O5C2PPHPG3FHHG3HHG3HHA61L35O6K21L4J5O6P5O2PPOPOP7O7C5B3PPG2FHHG3HHG3HHA63L27O7K20L7J4O6P5O8P4O9C5B10PPGHHG3HHG3HHA65L20O6K20L7KJ6O5P5O23C5B17PG4HHG3HHA67L13O6K19L7J7O7P5O23C5B23PPGGHHG3HHA69L5O7K18L7J7O10P4O23C5B30PPG4HHA71O5K18L7J7O10P7O22C5B36PPG2HHA73K16L7J7O10P7O24C5B41AAPPHHA75K8L7J7O9P8O26C5B44A84KL7J7O9P7O29C5B44A90LJ7O8P8O30C6B44A96JO8P7O31C7B46A101OOP7O31C7B48A107PPO32C6B51A112O26C7B52A118O19C6B54A124O11C7B57A128O3C7B58A135C3B60A141B56A149B49A156B42A163B35A170B28A177B21A184B14A191B7A198BA205"
local F6_BG_Ditter =
	"CACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACA60CACACACACACACACACACACACACACACACACACACACACACA2CA3CA2CA2CACACA2CA2CA2CA2CA2CA4CACACACACACACACACACACACACACACACA2CACACA2CA2CA2CA10CACACACACACACACACACACACACACA72CA6CA6CA6CA13CACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACA62CACACACACACACACACACACACACACACACACACACA2CA2CA2CA3CA2CA2CA2CA2CA2CA14CACACACACACACACA2CACACACACACA2CA2CA6CA16CACACACACACACACACACACACACA113CACACACACACACACACACACACACACACACACACACACACACACACACACACACAC2AC2ACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACA58CACACACACACACACACACACACACACACACA4CA2CA2CA2CA2CA3CA2CA2CA2CA26CACACACACACACA2CACACACACA2CA2CA2CA2CA2CA14CACACACACACACACACACACA117CACACACACACACACA2CA2CA2CACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACA60CA2CACACA2CACACACACACACACACA10CA6CA11CA46CA2CACACACACA6CA6CA22CACACACACACACACA121CACACACACACACACACACACACACACACACACACACACACACACACACACACACAC2ACACACACACACACACACACACACACACACACACACACACACACACACACACACACACA62CACACACACACACACACACACACACACACA6CA2CA2CA2CA2CA55CACACACACACACA2CA2CA2CA2CA28CACACA127CACA2CA2CA2CA2CA2CA6CACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACACA76CA2CA2CA2CACACACACACACACA20CA61CACACACACACA6CA171CACACACACACACACA16CACACACACACACA2CACACACACACACACACACACACACACACACACACACACACACACACACA78CA2CACACACACACACACACACACACA16CA2CA2CA57CACACACACACA178EA3CA34CA2CACACACACACACACACACACACACACACACACACACACACACACACACACA84CA2CA2CA2CA2CACACA85CACA2CACACA211CA2CA2CA2CACACACACACACACACACACACACACACACACACACACACA94CACACACACACACACACACACA26CA55CA2CACACACACA2CA174EA2EA27CA6CA2CACACACACACACACACACACACACACACACACACACACA100CA2CA2CA2CA2CA91CA190EA19CA2CA2CA2CA2CACACACACACACACACACACACACACACACACACA104CA2CA2CA2CACACA43EA46CA186EA2EAEA29CA2CA2CACACACACACACA2CA122CA2CA2CA2CA40EA241EAEAEA15CA2CA2CACACACACACACACACACACACACA2CA126CA2CA2CA43EA2EA236EA2EA21CA2CA2CA2CA2CACACA429EAEAEAEA19CACACACACACACA2CACACA2CA191EA236EA2EA17CA2CA2CA2CA2CA437EAEAEAEA11CA2CA2CACACA2CA2CA2CA195EAAE2A233EAEAEAEA9CA6CA14CA198EAEAEA233EAEAEAEA7CA2CA2CA2CA6CA202EAEAE2A229EA2EAEAEAEA227EAEAEAE5A230EAE2AE2A7CA218EAEAE7A224EAEAEAE2AE2AEA223EAEAEAE9A226EAEAEAE2AE2A221EAEAEAE11A220EA2EA2EAE2AE2AEA219EAEAEAEAE11A226EAEAEAEAEAE2A219EAEAEAE13A214EAEAEAEA2EAEAEAE2AEAEAEA215EAEAEAEAEAE12A209EAEA2EA2EA2EA4EAEAEAEAEAEA213EAEAEAEAEAEAEAE8AEA207EA2EAEAEAEA2EA2EA2EAEAEAEAEAEA209EAEAEAEAEAEAEAEAEAEAEAEAEAEAEA207EA2EAEAEA2EA2EA6EA2EA2EA207EAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEA205EAEAEAEAEAEAEAEA4EA2EA2EA2EAEA203EAEAEAEAEAEAEAEA2EA2EAEAEAEAEAEAEA207EAEAEA2EA18EA205EAEAEAEAEAEAEAEAEA10EAEAEAEAEA205EA2EAEA20EA2EA199EA2EAEAEAEAEA20EA2EAEA436EAEAEAEAEA2EA259EA2EA2EA199EA2EA32EA442EA4111EA476EA6EA468EA245EAEA227EA2EA2EA2EA19CACACA210EAEA233EA2EA9CACACACACACACACA2CA188EA14EA4EA231EA6ECACACACACACACACACACACACACACACA206EAEAACA6CA202EA10EA2EA2EA2EAACACACACACACACACACACACACACACA2CA180EA20EAEAEA227EA2EA2EA2ECACACACACACACACACACACACACACACA204EAEAEA5CA6CA198EA6EA2EA10EAACACACACACACACACACACACACA2CA2CA184EA18EAEA239ECACACACACACACACACACACACACACACA172EA32EAEAACA6CA6CA190EA2EA6EA14EAACACACACACACACACACACACACACACA166EAEAEAEA2EA6EA20EAEAEA203EA34ECACACACACACACACACACACACACA164EAEAEAEAEAEA8EA22EAEAEA5CA6CA184EAEA2EA6EA18EAEAEAECACACACACACACACA2CA166EAEAEAEAEAEAEAEA6EA24EAEAEA195EA2EA2EA2EA22EA2EA2ECACACACACACA20EA2EA2EA140EAEAEAEAEAEAEAEAEAEAEA26EAEAEAEAEAACA186EA2EAEAEA2EAEAEA18EAEAEAEAEAEAEAECACACA20EA6EA140EAEA2EAEAEAEAEAEAEAEAEA26EAEAEAEAE2AEA187EA2EA2EA2EA2EA18EAEAEA2EAEAEAEAEA19EA2EA2EA2EA2EA2EA128EAEAEAEAEAEAEAEAEAEAEAEAEAEA22EAEAEAEAEAEAE2AE2A181EA2EA2EAEAEA2EAEAEA20EAEAEAEAEAEAEAEAEA13EA2EA2EA2EA2EA130EA2EA2EA2EAEAEAEAEAEAEAEAEAEAEAEA16EAEAEAEAEAEAEAEAEAEAEAEAEA179EAEAEAEAEAEAEA2EA2EA18EAEAEAEAEAEAEAEAEAEAEA3EA2EAEAEA2EAEAEA2EAEAEA2EA2EA116EAEAEAEAEAEAEAEAEAEAEAEAEAE2AE2AEAEAEAEAEA8EAEAEAEAEAE2AE2AE2AE2AE2AE2A169EA2EA2EAEAEAEAEAEAEAEAEAEA4EA10EAEAEAEAEAEAEAEAEAEAEAEAEAEAAEA2EA2EA2EA2EA2EA2EA2EA114EA2EA2EA2EAEAEA2EAEAEAEAE2AE2AE2AE2AEAEAEAEA4EAEAEAEAE2AE2AE2AE2AEAEAEAEAE2AEA167EA2EAEAEAEAEAEAEAEAEAEAEA12EAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEEA2EAEAEA2EAEAEA2EAEAEA2EA104EAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAE6AE2AE2AE2AEAEAEAEAEAEAE2AE2AE14AE2AE7A158EAEA2EAEAEAEAEAEAEAEAEAEAEAEAEAEA10EAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAAEA2EA2EA2EA2EA2EA2EA94EA2EA2EA2EA2EA2EA2EA2EA2EAEAEAEAEAEAEAEAE2AE2AE2AE2AE2AE2AEAEAEAEAE2AE2AE29A150EA2EA2EA2EAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEA4EAEAEAEAEAEAEAEAEAEAEAEAEAEAE6AEAEAEEAEAEA2EAEAEAEAEAEAEAEA86EAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAE22AE2AEAEAE2AE35A144EA2EA2EAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAE18AEAAEA2EAEAEAEAEAEAEA2EA58EA2EA2EA2EA2EA2EA2EA2EA2EA2EA2EA2EA2EA2EA2EA2EAEAEAEAEAEAEAEAEAEAEAEAE2AE2AE6AE2AE2AE2AE2AE2AE37A146EA2EA2EA2EAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAE23A2EAEAEAEAEAEAEAEA2EA54EAEA2EAEAEA2EAEAEAEAEAEAEAEAEAEAEAEAEAEAEA2EAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAE2AE18AE2AE2AE2AE39A144EA2EAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAE22AAEAEAEA2EAEAEA2EAEA56EA2EA2EA2EA2EA2EA2EA2EA2EA2EA2EA2EA2EA2EA2EA2EAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAE6AE2AE2AE2AE2AEAEAE2AE37A136EAEAEAEA2EA2EA2EAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAE24"

function loadFrame06Sprites()
	loadExtendedSprite(unpac_noheader(F6_Ship), "F6_Ship", 207, 111, 0)
	loadExtendedSprite(unpac_noheader(F6_BG_Ditter), "F6_BG_Ditter", 240, 136, 0)
end

-- Frame09

F9_Scannerframe =
	"0c0003c0C142PC5POC5POC4POPC4POPC3POPHC3POPHPM6O7P8H8FFHHFFHFH2FH3FFHFH4FHFHHM7O7P7H9FFHHFHHFHHFHFFHF3HFHHFHHFHFHM7O7P7H8FHFHHFHHFHFFHFHFFHFHFFHHFHFHHFHM7O7P7H7FHFHHFHFHHFFHFHFFHFHFFHFFHFHHFHFM7O7P7H7F2H13FH7FH4M7O7P7H39M7O7P7H39M7O7P7H39M7O7P7H39M7O7P7H39MPPC4O2PC3P2OPC2HPPOPC2HHPOPMMPHHPOPB2HHPOPB2HHPOP2BC2A4C2A4C2A4C2A4C2A4PCCA4BPCA4BBPA4C9EM4CE6PDE5PDE5PDE5PDE5PDE5C7M7E5DE6DE4DEDDE2DDEDDEEDED3EED2C5POPHHMMPPOPHHEEPOP3EP6D23C7HFFH2FFH7P15D23C7HFHHFHFH8P15D23C7HFHFHHFH8P15D23C7FHFHHFHFH7P15D23C7F2H12P15D23C7H15P15D23C7H15P15D23C7H15P15D23C7H15P15D23C7H15P15D3E3D4E2D5EEC3D2EHHPOPCCPHHPOP6OPMMEP3E2DE3DEEDE4DEDE3DEEDE4DEDBBPA4BBPA4PBPA5BPA4PBPA4PBPA4PBPA4PBPA4PDE5PDE5PDE5PDE5PDE5PDE5PDE5PDE7DEDCOOE2DDOOPEEDEDP2EED2PPCEEDEDPPCE2DDPHCEEDEDPCCEED2PCCO7P15C39O7P15C39O7P15C39O7P15C39O7P15C39O7P15C39O7P15C39O7P15C39O7P15C39O7P15C39O2CD2EPPOODDEEP2AD2ECCPADDEECCPADDEECCPADDEECCPAD2EC2PDDE5DEEDE4DEDE3DEEDE4DEDE3DEEDE4DEDE6DE4DEDPPCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PDE5PDE5PDE5PDE5PDE5PDE5PDE5PDE7DEDPCCE2DDPCCEEDEDPCCEED2PCCEEDEDPCCE2DDPCCEEDEDPCCEED2PC644PDDEEC2PDDEEC2PD2EC2PDDEEC2PDDEEC2PDDEEC2PD2EC2PDDE5DEEDE4DEDE6DE4DEDE6DE4DEDE4DEDE4DEDPCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PDE5PDE5PDE5PDE5PDE5PDE5PDE5PDE7DEDPCCE2DDPCCEEDEDPCCEED2PCCEEDEDPCCE2DDPCCEEDEDPCCEEDDGPC644PDDEEC2PDDEEC2PD2EC2PDDEEC2PDE2C2PDDEEC2PDEDEC2PDDE6DEDE4DEDE4DEDE4DEDE4DEDE4DEDE4DEDE4DEDPCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PDE5PDE5PDE5PDE5PDE5PDE5PDE5PDE7DEDPCCEDEDDPCCEEDEDPCCED3PCCEEDEDPCCEDEDDPCCEEDEDPCCED3PC644PDE2C2PDDEEC2PD2EC2PDDEEC2PDDEEC2PDDEEC2PD2EC2PDDE5DDEDE4DEDE4DEDE4DEDE3DDEDE4DEDE4DEDE4DEDPCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PDE5PDE5PDE5PDE5PD6PE6PDE5PDE7DEDPCCEDEDDPCCEEDEDPCCED3PCCD4PCCE3DPCCEEDEDPCCED3PC644PDDEEC2PDDEEC2PD3C2PE3C2PDDEEC2PDDEEC2PD2EC2PDDE5DEEDE4DED8E6DE3DDEDE4DEDE3DDEDE4DEDPCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PDE5PDE5PDE5PDE5PDE5PDE5PDE5PDE7DEDPCCEDEDDPCCEEDEDPCCED3PCCEEDEDPCCEDEDDPCCEEDEDPCCED3PC644PDDEEC2PDDEEC2PD2EC2PDDEEC2PDEDEC2PDDEEC2PDEDEC2PDDE5DEEDE4DEDE3DEEDE4DEDE3DDEDE4DEDE6DE4DEDPCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PDE5PDE5PDDE4PD2EDEDPDDEDEDEPDEDEDEDPDDEDEDEPD2EDEDEEDEDPCCEDEDDPCCDED2PCCED3PCCDEEDDPCCEDEDDPCCDED2PCCEDEDDPC644PDE2C2PDDEEC2PDEDEC2PDDEEC2PDE2C2PDDEDC2PDEDEC2PDDEDE3DEEDE4DEDE3DEEDE2DEDEDE3DEEDEDEDEDEDEEDEEDEDEDEDEDEDPCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PDDEDE2PDEDEDEDPDDEDEDEPD2EDEDPDDEDEDEPDEDEDEDPDDEDEDEPD2EDEDDEEDDPCCEDEDDPCCDED2PCCEDEDDPCCDEEDDPCCEDEDDPCCDED2PCCEDEDDPC644PDE2C2PDDEDC2PDEDEC2PD3C2PDEDEC2PDDEDC2PDEDEC2PD3E4DEDEDEDEDEDEEDEDDEDED2EDEDDEDEDDEDEDED2EDDEDEDEEDED2EDEDPCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PDDEDE2PDEDEDEDPDDEDEDEPD2EDEDPDDEDEDEPDEDEDEDPDDEDEDEPD2ED3ED2PCCEDEDDPCCDEDEDPCCED3PCCDEDEDPCCEDEDDPCCDEDEDPCCED3PC644PDEDEC2PDDEDC2PDEDEC2PD3C2PDEDEC2PDDEDC2PDEDEC2PD4EDEDEED2ED2EDDEDEDDEDED4EDDEDEDEED2ED2EDDEDEDDED6EDPCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PDDEDEDEPDED2EDPDDEDEDEPD2ED2PDDEDEDEPDEDEDEDPDDEDEDEPD2ED3EDEDPCCED3PCCD2EDPCCED3PCCDEDEDPCCD4PCCD2EDPCCED3PC644PDEDEC2PD3C2PD2EC2PD3C2PDEDEC2PD3C2PD2EC2PD4EDEDDED6EDDEDEDDED6EDDEDEDDED6ED3EDDED6EDPCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PDDEDEDEPD4EDPDDEDEDEPD6PDDEDEDEPD6PDDED2EPD7EDEDPCCD4PCCD2EDPCCD4PCCDEDEDPCCD4PCCD2EDPCCD4PC644PDEDEC2PD3C2PD2EC2PD3C2PDEDDC2PD3C2PD3C2PD4EDEDDED6ED3EDDED6EDDED2EED6ED6ED6EDPCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PD3EDEPD6PDDED2EPD6PD3EDDPD6PDDED2EPD7ED2PCCD4PCCD2EDPCCD4PCCDED2PCCD4PCCD4PCCD4PC644PD3C2PD3C2PD3C2PD3C2PD3C2PD3C2PD3C2PD4ED2EED6ED6ED6ED6ED6ED6ED6EDPCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PD3EDDPD6PD5EPD6PD6PD6PD6PD7ED2PCCD4PCCD4PCCD4PCCD4PCCD4PCCD4PCCD4PC644PD3C2PD3C2PD3C2PD3C2PD3C2PD3C2PD3C2PD9ED6ED6ED6ED6ED6ED6ED6EDPCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4PCCA4"

F9_Suitcase_01 =
	"0c000400A3B3A2B4AABBC3ABBC4BBC4DBC4DDBC3D2BP6B3GC2B3GC2B4P2BC6D23P7C15P7C7D23P7C15P7C7D23P7C3GBBAC3GBBAP3B3C7D23P7A5CCA7B4PC5BPOCD4POCD4POCD4POCP7C7AD6BC6BD6BD6BC7B6P7C7D7C7D15C7B7P7C7D7C7D15C7B7P7C5AADDCA4C2BC2PD2BCBBPD2BCOOPC2BCOOPB2CCOOP8A4BBGA4BBGB7C7D23P7C15P7C7D23P7C15P7C7D23P7C15P7C7D23P7GB4AAGBBC2BAB2C3BC7D5CCD6CD7P7A15BA6BBA5CBBA4CCBA4CCBA4PPBA4BCPCD3BCPC4BCPC4BCPC4BCPC4BCPC4BCPC4BCPC4DPC2PDDCPC2PC2PC2PC2PC2PC2NB2NC2N4C2N4C3N2C2D7C55D7C55D7C55DC3DPBCCBCCDPBCCBCCDPBCCBCCDPBCCBC2DBCCBC3DCCBC6BC4PD6PC6PC6BP6B7P7D7C7D7C15P7B7P7D7C7D7C15P7B7P7D7C7D3PBPDC3PBPDC3PBPDP3BBPDB5DCP4DCCD4C10D7CCBC6BC6BC6BC6BC6BC6BC4D7C55D7C55D3CPC6PC6PC6PC6NBBC4N2C4N2C5NNCPD4CCPC6PC6PC5BNC5NNC5NNC5NC6PBBA4PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4BCPC4BCPC4BCPC4BCPC4BCPC4BCPC4BCPC4BCPC262BC6BC6BC6BC6BC7BC7BC7BC248BC5BC2BC6BC6BC6BC5BC5BC278PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4BCPC4BCPC4BCPC4BCPC4BCPC4BCPC4BCPC4BCPC227NC6NC6NC6NC6NC2BCCBBC2BC6BC3N2BN6BN6BN6BN6BN3B7C15NNC5NNC5NNC5NNC5NNC5B7C55B7C55B5C57BC6BC6BC6BC6BC6BC6BC6BC262PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4BCPC4BCPC4BCPC4BCPC4BCPC4BCPC4BCPC4BCPC203NC55N2BN3C2BC6BC6BC6BC6BC6BC6BC3NNC253BC6BC6BC6BC6BC6BC6BC6BC91N2C3N3C2N2C3N2CCNCCN2CNC2N2CNNC7N2C4N5C4N3CN2CCN7CCNCNNCCNCNNCCN2CNC39NC6NC6NC6PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4BCPC4BCPC4BCPC4BCPC4BCPC4BCPC4BCPC4BCPC263BC6BC6BC6BC6BC6BC6BC6BC259BC6BC6BC6BC6BC6BC6BC6BC71N3CNNCN3CNNCN3CNNCCN2CNNCCN2C4N5C2N4C3N5CN2CN2CN2CN2CN2CN2CN2CN2CNNCCNCCNCCN17CNNC5NNC5NNC5NC6NC6NC22PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4BCPC4BCPC4BCPC4BCPC4BCPC4BCPC4BCPC4BCPC263BC6BC6BC6BC6BC6BC6BC6BC259BC6BC6BC6BC6BC6BC6BC6BC75N2C55N5CCN2C116PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4BCPC4BCPCCMCMBCPCCMCMBCPCCMCMBCPCCMCMBCPCCMCMBCPCCMCMBCPC16MCMMCMMCMCMMCMMCMCMMCMMCMCMMCMMCMCMMCMMCMCMMC16MCMC4MCMC4MCMC4MCMC6MC6MC142BC6BC6BC6BC6BP3C2BC6BP3C39P7C7P7C39P7C7P7C39P7C7P7C39P7C7P7C7BC6BC6BC6BC6BC6BC6BC220NC5NNC4N2C3N3C2N4C16PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4PCBA4BCPPO3BBCPPC2B2CBP2B3C3AAP5A23O7C7P7C7P7A23O7C7P7C7P7A23O7C7P7C7P7A23O7C7P7C7P7A23O7C7P7C7P7A23O7C7P7C7P7A23O7C7P7C7P7A23O7C7P7C7P7A23O7C7P7C7P7A23O7C7P7C7P7A23O7C7P7C7P7A23O7C7P7C7P7A23O7C7P7C7P7A23O6PC6BP5BC7BP7A23PCBA4CBBA4B2A4B2A4BA30"

F9_Suitcase_Scan_01 =
	"0c000400A3H3A2H4AAH5AH31G6H3GH6GH7G2H31G7H15G7H31G7H15G7H31G7H3GHHAH3GHHAG3H35G7A5HHA7H4GH6GH6GH6GH6GHHG7H7AH46G7H55G7H55G7H5AAH2A4H6GH6GH6GH6GH6G8A4HHGA4HHGH39G7H15G7H31G7H15G7H31G7H15G7H31G8H4AAGH5AH39G7A15HA6HHA5H2A4H2A4H2A4GGHA4HHGH6GH6GH6GH6GH6GH6GH6GH5GH2GH2GH2GH2GH2GH2GH2GH3G2H224GH2GH2GH2GH2GH2GH2GH2GH3GHHGH6GH6GH4GH6GH6GH7G6H7G7H39G7H7G7H39G7H7G7H19GHGH4GHGH4GHGHG3HHGH5GHHG4H28GH6GH6GH6GH6GH6GH6GH137GH6GH6GH6GH7GGH24GH6GH6GH6GH5GH30GHHA4GHHA4GHHA4GHHA4GHHA4GHHA4GHHA4GHHA4HHGH6GH6GH6GH6GH6GH6GH6GH192OH58OHOHOH4GH6GH6GH6GH6GH7GH7GH6OGOH56OH2OH58OH2OH62OH57GH3OHGH2GH6GH6GH6GH5GH5GH14OHOHOH58OH2OH48OH12OHOH42OH12OHOHOH58OH2OH2GHHA4GHHA4GHHA4GHHA4GHHA4GHHA4GHHA4GHHA4HHGH6GH6GH6GH6GH6GH2OH2GH6GHOHOH28OH12OH2OH8OHOHOHOH24OH2OH12OH12OH2OH16OH10OHOHOH10OH2OH8OHOHOHOH10OH2OH8OHOHOHOH8OHOH2OH8OHOHOHOH6GGHHOHOHOH8OHOHOHOHHOH2OHHOHOHOHOH8OHOHOHOHG7OHOHOHOH8OHOHOHOHHOH2OHHOHOHOHOH3OH2OOHOHOHOHG7OHOHOHOH8OHOHOHOHHOH2OHHOHOHOHOH3OH2OOHOHOHOHG7HHOHOHOH8OHOHOHOHHOH2OHHOHOHOHOH3OH2OOHOHOHOHG5H3OHOHOH7OOHOHOHOHHOH2OHHOHOHOHOH3OH2OOHOHOHOHHOH5OHOHOHOH8OHOHOHOHHOH2OHHOHOHOHOH3OH3OHOHOHOH10OH2OH8OHOHOHOH8OHOHOHOH8OHOHOHOH5OH3OHOHOH7OOHOHOHOHHOH2OHHOHOHOHOH3OH2OOHOHOHOHHOH5OHOHOHOH8OHOHOHOHHOH2OHHOHOHOHOH3OH3OHOHOHOH10OH12OHOHOH12OH2OH8OHOHOHOHGHHA4GHHA4GHHA4GHHA4GHHA4GHHA4GHHA4GHHA4HHGH6GHOHOH2GH6GHOHOH2GH6GHOHOH2GH6GHOHOH8OHOHOHOH8OHOHOHOHHOH5OHOHOHOH8OHOHOHOH8OHOHOHOH8OHOHOHOH8OHOH2OH8OHOHOHOH8OHOHOHOH8OHOHOHOH8OHOH2OH8OHOHOHOH5OHHOHOHOHOH7OOHOHOHOH5OHHOHOH2OH8OHOHOHOHHOH2OHHOHOHOHOH7OOHOHOHOHHOH2OHHOHOHOHOH8OHOHOHOHHOHOHOHOOHOHOHOH3OHOHOOHOHOHOHHOHOHOHOOHOHOHOH3OH2OOHOHOHOHHOHOHOHOOHOHOHOH3OHOHOOHOHOHOHHOHOHOHOOHOHOHOH3OH2OOHOHOHOHHOHOHOHOOHOHOHOH3OHOHOOHOHOHOHHOHOHOHOOHOHOHOH3OH2OOHOHOHOHHOH2OHOOHOHOHOH3OH2OOHOHOHOHHOHOHOHHOHOHOHOH3OH2OOHOHOHOHHOH2OHOOHOHOHOH3OH2OOHOHOHOHHOH2OHHOHOHOHOH3OH2OOHOHOHOHHOH2OHHOHOHOHOH7OOHOHOHOHHOH2OHHOHOHOHOH3OH2OOHOHOHOHHOH2OHOOHOHOHOH3OH2OOHOHOHOHHOHOHOHOOHOHOHOH3OH2OOHOHOHOHHOH2OHHOHOHOHOH3OH2OOHOHOHOHHOHOHOHHOHOHOHOH3OH2OOHOHOHOH8OHOHOHOH8OHOHOH3OH5OHOHOH10OHOHOH2GHHA4GHHA4GHHA4GHHA4GHHA4GHHA4GHHA4GHHA4HHGHHOH3GHOHOH2GH3OHHGHOHOH2GHHOH3GHOHOH2GOH5GHOHOHHOH2OHHOHOHOHOH7OOHOHOHOHHOH2OHHOHOHOHOH3OH3OHOHOHOH8OHOHOHOH8OHOHOHOHHOH5OHOHOHOH8OHOHOHOH5OHHOHOHOHOH8OHOHOHOHHOH5OHOHOHOH3OH3OHOHOHOH5OHHOHOHOHOH7OOHOHOHOHHOH5OHOHOHOH7O3HO3HOH2OHOOHOHOHOH7OOHOHOHOHHOH2OHOOHOHOHOHHOHOHOHO8HOHOHOHOOHOHOHOH3OHOHOOHOHOHOHHOHOHOHOOHOHOHOHHOHOH2O8HOHOHOHOOHOHOHOH3OHOHOOHOHOHOHHOHOHOHOOHOHOHOH3OH2O8HOHOHOHOOHOHOHOH3OHOHOOHOHOHOHHOHOHOHOOHOHOHOH3OH2O5HOHHOHOHOHOOHOHOHOH3OH2OOHOHOHOHHOHOHOHHOHOHOHOH3OH2OOHOHOHOHHOH2OHOOHOHOHOH3OH2OOHOHOHOHHOH2OHHOHOHOHOH3OH3OHOHOHOHHOH2OHOOHOHOHOH3OH2OOHOHOHOHHOH2OHOOHOHOHOH3OH2O3HOHOHHOHOHOHOOHOHOHOH3OH2OOHOHOHOHHOHOHOHOOHOHOHOH3OH2O3HO2HHOHOHOHOOHOHOHOH3OH2OOHOHOHOHHOHOHOHOOHOHOHOH3OH2OOHOHOHOHHOH2OHHOHOHOHOH8OHOHOHOHHOH2OHHOHOHOHOH8OHOHOHOHGHHA4GHHA4GHHA4GHHA4GHHA4GHHA4GHHA4GHHA4HHGHHOH3GHOHOH2GH3OHHGHOHOH2GHHOH3GHOHOH2GH3OHHGHOHOHHOH2OHOOHOHOHOH3OHOHOOHOHOHOHHOHOHOHOOHOHOHOH3OHOHOOHOHO2HHOHOHOHHOHOHOHOOHOHOHOHO3HO2HHOHOHOHOOHO2HOOHOHOHOHO3HO3HOHOHOHOOHO2HOOHOHOHOHO7HHOHOHOHOOHO2HOOHOHOHOHO3HO3HOHOHOHOOHO2HOOHOHOHOHO8HOHOHOHOOHO2HOOHOHOHOHO3HO3HOHOHOHOOHO5HOHOHOHO8HOHOHOHOOHO2HOOHOHOHOHO8HOHOHOHOOHO5HOHOHOHO8HOHOHOHO5HOOHOHOHOHO8HOHOHOHOOHO5HOHOHOHO8HOHOHOHO5HOOHOHOHOHO8HOHOHOHOOHO2HOOHOHOHOHO8HOHOHOHO5HOOHOHOHOHO8HOHOHOHOOHO2HOOHOHOHOHO7HHOHOHOHOOHO2HOOHOHOHOHO8HOHOHOHOOHO2HOOHOHOHOHO3HO2HHOHOHOHOOHO2HOOHOHOHOHO3HO3HOHOHOHOOHO2HOOHOHOHOHO3HO2HHOHOHOHOOHO2HOHHOHOHOHO3HO2HHOHOHOHOOHO2HOOHOHOHOHO3HO2HHOHOHOHOOHO2HOHHOHOHOHO3HO2HHOHOHOHOOHO2HOHHOHOHOHO3HO2HHOHOHOHOOHO2HOHHOHOHOHO3HO2HHOH2OHHOHOHOHOHHOHOHOHHO2HOHOHHOHOHOHOOHOHOHOHHOHOHOHO3HO2HGHHA4GHHA4GHHA4GHHA4GHHA4GHHA4GHHA4GHHA4HHGHHOHOHHGHOGOGHHGHHGHGHHGHOGOGHHGHHGHGHHGHOGOGHHGHHGHGHHGHOHOHHOHOHOHOOHOHGHGGHGGOGOGGOGGHGOGGHGGOGOGGOGGHGHGGHGGOGOGGO2HO2HHOHOHOHOOGOGOHOOHGHGHOHOOGOGO2HHGHGHOHOOHOGOHOOHOHGHOHO3HO3HOHOHOHOOHO2HOOHOHOHOHO7HHOHOHOHOOHO2HOOHOHOHOHO3HO3HOHOHOHOOHO2HOOHOHOHOHO7HHOHOHOHOOHO2HOOHOHOHOHO3HO3HOHOHOHOOHO5HOHOHOHO8HOHOHOHOOHO2HOOHOHOHOHO3HO3HOHOHOHOOHO5HOHOHOHO8HOHOHOHOOHO2HOOHOHOHOHO8HOHOHOHOOHO5HOHOHOHO8HOHOHOHO5HOOHOHOHOHO8HOHOHOHOOHO5HOHOHOHO8HOHOHOHOOHO2HOOHOHOHOHO8HOHOHOHOOHO2HOOHOHOHOHO7HHOHOHOHOOHO2HOOHOHOHOHO3HO3HOHOHOHOOHO2HOOHOHOHOHO3HO2HHOHOHOHOOHO2HOOHOHOHOHO3HO3HOHOHOHOOHO2HOOHOHOHOHO3HO2HHOHOHOHOOHO2HOHHOHOHOHO3HO2HHOHOHOHOOHO2HOOHOHOHOHO3HO2HHOHOHOHOOHO2HOHHOHOHOHO3HO2HHOHOHOHOOHO2HOOHOHOHOHO3HO2HHOHOHOHOOHO2HOHHOHOHOHO3HO2HHOHOHOHOOHOHOHOHHOHOHOHO3HOHOHHOHOHOHOOHOHOHOHHOHOHOHHO2HOHOHGHHA4GHHA4GHHA4GHHA4GHHA4GHHA4GHHA4GHHA4HHGGHOHOH2GGHOH5G2H7AAH5A5HHA15HOHOHOHOOH2OHOHG7H23A15HOHOHOHOOHOHOHOOG7H23A15HOHOHOHOOHO2HOHG7H23A15HOHOHOHOOHOHOHOHG7H23A15HOH2OHOOH6G7H23A15HOH2OH9G7H23A15HOH13G7H23A15HOHOHOHOH5OOG7H23A15HOHOHOHOOHO2HOHG7HHOHOHOH16A15HOHOHOHOOHOHOHOHG7OH22A15HOHOHOHOOHOHOHOHG7H23A15HOHOHOHOOHOHOHOHG7H23A15HOHOHOHOOHOHOHOHG7H23A15HOHOHOHGOHOHOHGHG5H24A16GHHA4H2A4H2A4H2A4HA30"

F9_ScannerBG =
	"0c000340A3D3A3P3A3P3A3P3A3PPGPA4GHGA3GHGHA2GAGHGD7P13GP8GPGPGPGPHGHGHGHGGHGHGHGHHGHGHGHGD7P4GPPGPGPGPGP7GGPGPGPGPHGHGHGHGGHGHGHGHHGHGHGHGD7PGP2GPPGPGPGPGP7GGPGPGPGPHGHGHGHGGHGHGHGHHGHGHGHGD7PGP5GPGPGPGP8GPGPGPGPHGH2GHGGHGHGHGHHGHGHGHGD7P7GPGPGP10GPGPGPGPHGHGHGHHGHGHGHGHHGHGH2GD7P7GPGPGPGP8GPGPGPGPHGH2GHHGHGHGHGH3GH2GD7PGP2GPPGPGPGPGP8GPGPGPGPHGH2GHHGHGHGHGHHGHGHGHGD7P7GPGPGPGP7GGPGPGPGPHGH2GHHGHGHGHGHHGHGHGHGD7P7GPGPGPGP3GP2GGPGPGPGPHGH2GHHGHGHGHGHHGHGH2GD7PGP2GPPGPGPGPGP3GP2GGPGPGPGPHGH2GHHGHGHGHGH3GH2GD2EEA2PGPEEA2GPGPGA2PPAGEA2GPGEGAGAHGAEEGAAGHGEGAGAHHAGEA50GA16GAG3AGAGAGHGAAG2HGGA2GAGHGAAG5AGAGAGHGAAG5A2G12HGHGHGHGGHG5HGHGHGHG8HGHGHGHG19HG3HGHGHGHG8HGHGHG12HG2HG19HG3HGHGHGHG5HGGHGHGHG42HGHGHGHGGHG5HG2HGHG10HG2HG24HGHGHGHG8HGHGHGHG10HG2HG24HGHGHGHGGHG2HGGHGHGHGHG8HGHGHGHG5HG12HG3HGHGHGHGGHG2HGGHGHGHGHG7HHGHGHGHGGHG2HG12HG2HHGHGHGHGGHG2HGGHGHGHGHG7HHGHGHGHGGHG2HGHG10HG2HHGHGHGHGGHG2HGGHGHGHGHG3HG2HHGHGHGHGGHG2HG12HG2HHGHGHGHHGHG2HGHHGHGHGHG8HGHGHGHG17HGEGAGAHGAEEGAAGHGEGAGAHGAGEA2G2EGAGAGGAGEA2G4A2HGAGEGAAGA14GA48G5A2G4AAG5A2GAG2AAG5A2GAG2AAG5A2G544HG12HG2HG8HG20HG8HG2HGHG10HG2HG8HG2HGHG6AAGGAGEGAAG5AAHGAGEGAAG5AAGGAGEGAAG4A2HGAGEGA67G5A2G4A2G4A2GAG2AAG5A2G2HGAAG5A2GAG58HG94HG30HG350HG2HG44HG2HG8HG2HG16HG8HG2HG8AAGGAG2AAG4A2HGAGEGAAG4A2GGAGEA2G4A2HGAGEA68G5A2G4AAG5A2GAG2AAG5A2G2HGAAG5A2GAG12HG12HG2HG16HG8HG2HG30HGHG10HGHGHGGHG2HGGHGHGHGHG24HG14HG7HG5HGHGHG46HGHG8HG110HG132HG14HG42HG2HG8HGHGHG12HG12HG2HG16HG8HG2HG5EEA2GGAEEA2GGAEEA2HGGEEA2G2EEA2GGAEEA2G2EEA2HGGEEA68GAG3A2GAGHGAAGAGHGGA2GAGHGAAGAGHGHA2GHGHGAAGAGHGGA2GHGHG10HG2HG5HGGHGHGHGHG7OHGHGHGHGGHG2OGGHGHGHGOG8HGHGHGHGGHG2HGGHGHGHGHG8OGHGOG3OGOGOGGHGOGHG10HGHGHGHGGHG5HGHGHGHG10HGHGHG5HG3HGHGHG8HG4HG8HG2HGOG8HG2HGOG5OGGHG2HGHG8OGOGOGOG12OGOG12OGOG5OGGOGOGOGOG10OG12OG2OG16HG8OGOGHG12HG2HG8HG2HG16HG8HG2HGHG8HGHGHGHG8HGHGHGHG8HGHGHGHG8HGHGHGHG8HGHG2HG8HGHGHGHG8HGHGHGHG7OHGHGO2G10HG2HG8HG2HG12HOGGHG3OG2OHOHOHOHOG3EA2GGAGEA2G3EA2HGAGEA2G3EA2HGAGEA2G3EA2HGAGEA68GAGOGOA2GHGHGAAGAGHGOA2GHOHGAAGAGOGHA3HGHOAAGAGHGOA2GHOHG3OG3HGHGOGHGGOGOGOGOHOHGHGOGGOGOGOGOHGHGOGOGGOGOGOGOHOHGHOOG3OG2OOGOGOGOGGOGOGOGGOGOGOGOGGOGOG2OOGOGOGOGGOGOGOGO3GHGOG8OGHGHGOGGHG2OGOHGHGHGOG3OGOGOOGOGOGOGGOG4OOGOG2OG5OGGOGGOOGHGGOGOGOGGHOOGHOHGGOGOGOGOOGO2GOOGOGOGOGOHOOGHOOGGOG5HGO2GOG8HOHGHOHGGOG2OGGHGHGHGHOG2OG2OHOOGO2G8OGOG2OG14OG7OG5OG5OGGO2GOGOG10OGOGOG5OGGOGOGOGOG7OOGOGOGOGGOG2OGOOGOGOGOG7OOGHGHGHGGOGOG3HGOGHGHGGOGOG3OGOGHGHOGOGOGOGO3GHOHG3OGOGOOGOGOGOOG2OG2OOGOGO2GGOG2OGOOGOG2OOG6O3G2OOGOG4OOGHG3OGOG4O3G5OGOG3OGOOGGHOGOGOG2O2HOGGHOGOGEEA2HOAGEA2GHGGEA2HOAGEA2GOGDDA2HGHODA2GOGOGA2HOHODA68GAGOGOA3HGHGAAGAGHGOA3HOHGAAGAGOOHA3HOHOAAGAGHGOA3H2OGOGOGOGOHGHOOGOGGOGOGOGOHOHGO2GGOGOGOGOHOHOOGO2HGO2GOHOHOHOHOGOGOGOGOOGOGOGOGGOGOGOGO3GOGOGGO2GOGO10GO2GO4HOHOGOG4OOGOGOGOGGOGOGOGO3GHOOGGOGOGOGOOGHGOGOOGOGO2GOHO2HO2GOGOGOGOOGO2GOGGOGOGOGOHO5GGOGOGOGO5GOOGOGOGOGOHO6GOGOGOGOOGO2GOGGOGOGOGO3GO2GGOGOGOGOOGO2GOOGOGOGOGO8GOGOG2OOGO2GOGGOGOGOGGO2GO2GGOGOGOGOOGO2GOOGOGOGOGO3GO2G3OG2OOGOGOGOGGOGOGOGOOGOGO2GGOGOGOGOOGOGOGOOGOGOGOGO3GO2GGOGOGOGOOGO2GHOGOGOGOGO2HOHOHGGOGOGOGOOGHOOGHOGOGOGOGO2HOHOHOGOGOGOGOHGO2GOOG2OGOGOHOHGHOHGGOGOGOGOHGHOHGHOGOGOGOGOHOHGHOHOGOGOGOGOOGHOHGHOGOGOGOGOHOHOHOHOGOGOGOGOHOHOHOHOGOGOGHGOHOHOHOHOGOGOGA2HOHOHA2GHGOGA2HOHOHA2GOGOGA2HOHODA2GOGHDA2HOHHDA68GAGHGHA3HOHHAAGAGHGHA3H2OAAGAGHOHA3HOHHAAGAHHGHA3H2OGOGHGOGOHOHOHOHOOHGOOHGOH2OHOHOGHGHGOOHHOH2OHHOHGHOHGH3OH2OGO2GOGOHOHO2HOOHGHOHGOHOHOHOHOGOGHGHGHHOHOHOHOOHGHOHGH3OHOHOGOGOGOGO2HO2HOGOGOGOGOHOHOHOHOGOGHGHGHHOHOHOHOOHGHOHGHHOHOH2OGOGOGOGO2HO4GOGOGOGOHOHOHO2GOGOGOGOHOHOHOHOGHGO2GOH2OHOHOGOGOGOGO8GOGOGOGO8GOGOGOGO10GO2GOHOHO4GOGOGOGO8GOGOGOGO8GOGOGOGO8GOGO2GO8GOGOGOGOOGO2GOOGOGOGOGO8GOGOGOGO10GOGOGO8GOGOGOGOOGOOHGHOGOGOGOGO4HOHOGOGOGOGOOGHOHOHOGOGO2GOHOHOHOHOGOGOGOGOHGHOHGHOGOGOGOGOHOHOHOHOGOGOGOGOHOHOHOHO2GO2GOHOHOHOHOGOGOGOGOHOHOHOHO2GO2GOHOHOHOHOGOGOGOOHHOHOHOHHOOGOOHGHHOHOHOHHGOGHDA2H3DA2HHGHDA2H3DA2GH2GA2H2DDA2HHGDDA2H2DDA66GA2GHGHA3HOHHAAGAHHGHA3H2OA3GHOHA3HOHHAAGAHHGHA3H3GHGHGHGHHOH2OHOOHGHOHGH3OH2OGHGHGHOHHOH2OHHOHGHOHGH3OH3GHGHGHGHHOHOHOHOOHGHOHGH3OH2OGHGHGHGHHOHOHOHOOHGHOHGH3OH3GHGHGHGHHOHOHOHOOHGHGHGH3OHOHOGHGHGHGHHOHOHOHOOHGHOHGH3OH2OGHGHGOGOHOHOHOHOGHGHOOGOH2OHHOOGHGHGO2HOHOHOHHOHGHOHGH3OH2OGOGOGOGOHOHOHOHO2GO2GOOHOHOHOHGOOHGHOH8OHGHOHOH8GOGOGOGOHOHOHOHO2GO2GOH6OGHOHGHOOH7OHGHOHGH8GO2GOGOHOHOHOHO2GO2GOHOHOHOHOGO2GO8HO2GO5HO2HOOGOGOGOGOHOHOHOHO2GO2GOHOHOHOHOGO2GO2HOHOHOHO9HHOHOHOGOGOGOGOHOHOHOHO2GOGOGOHOHOHOHOGOGO4HOHOHOHO5HOOHOHOHOHOGOGOGOGHHOHOHOHHOOGOOHGHHOHOH3GOGOGHOHHOH5OHGHOHGH8GHHDGA2H2DDA2HHGDDA2HHEDDA2GHEDDA2HHEDDA2HHEDDA2HHEDDA70GHGHA3H3A2H2GHA2H4A2H4A3H3A4G2A7GHOHGHGHHOH2OH3GHOHOH12OHOH8G7A7GHGHGHGHHOH5OH30G7A7GHGHGHOH5OHOH5OH24G7A7OHOHOHOHHOHOHOHHOHOHOH26G7A7OHOHGHOH14OH24G7A7GHOHGHOH10OH28G7A7GOHOGO3HOHOOHOH5OH24G7A7GO2GOOHHOH2OHHOHOHOH26G7A7GH2GH26GH14G7A7H3GH42G7A7HHEDDA2HHEDDA2HHEDDA2HHEDDA2HHEDDA2H2EDDAAGGA77"

F9_ScannerFrame =
	"0c0003c0A142PA5POA5POA4POPA4POPA3POPHA3POPHPM6O7P8H8FFHHFFHFH2FH3FFHFH4FHFHHM7O7P7H9FFHHFHHFHHFHFFHF3HFHHFHHFHFHM7O7P7H8FHFHHFHHFHFFHFHFFHFHFFHHFHFHHFHM7O7P7H7FHFHHFHFHHFFHFHFFHFHFFHFFHFHHFHFM7O7P7H7F2H13FH7FH4M7O7P7H39M7O7P7H39M7O7P7H39M7O7P7H39M7O7P7H39MPPA4O2PA3P2OPA2HPPOPA2HHPOPMMPHHPOPB2HHPOPB2HHPOP2BA39PA6BPA5BBPA14EM4AE6PDE5PDE5PDE5PDE5PDE5A7M7E5DE6DE4DEDDE2DDEDDEEDED3EED2C2A2POPHHMMPPOPHHEEPOP3EP6D23C7HFFH2FFH7P15D23C7HFHHFHFH8P15D23C7HFHFHHFH8P15D23C7FHFHHFHFH7P15D23C7F2H12P15D23C7H15P15D23C7H15P15D23C7H15P15D23C7H15P15D23C7H15P15D3E3D4E2D5EEC3D2EHHPOPAAPHHPOP6OPMMEP3E2DE3DEEDE4DEDE3DEEDE4DEDBBPA4BBPA4PBPA5BPA4PBPA4PBPA4PBPA4PBPA4PDE5PDE5PDE5PDE5PDE5PDE5PDE5PDE7DEDCOOE2DDOOPEEDEDP2EED2PPAEEDEDPPAE2DDPHAEEDEDPAAEED2PAAO7P15A39O7P15A39O7P15A39O7P15A39O7P15A39O7P15A39O7P15A39O7P15A39O7P15A39O7P15A39O2CD2EPPOODDEEP2AD2EAAPADDEEAAPADDEEAAPADDEEAAPAD2EA2PDDE5DEEDE4DEDE3DEEDE4DEDE3DEEDE4DEDE6DE4DEDPPA5PA6PA6PA6PA6PA6PA6PA6PDE5PDE5PDE5PDE5PDE5PDE5PDE5PDE7DEDPAAE2DDPAAEEDEDPAAEED2PAAEEDEDPAAE2DDPAAEEDEDPAAEED2PA644PDDEEA2PDDEEA2PD2EA2PDDEEA2PDDEEA2PDDEEA2PD2EA2PDDE5DEEDE4DEDE6DE4DEDE6DE4DEDE4DEDE4DEDPA6PA6PA6PA6PA6PA6PA6PA6PDE5PDE5PDE5PDE5PDE5PDE5PDE5PDE7DEDPAAE2DDPAAEEDEDPAAEED2PAAEEDEDPAAE2DDPAAEEDEDPAAEEDDGPA644PDDEEA2PDDEEA2PD2EA2PDDEEA2PDE2A2PDDEEA2PDEDEA2PDDE6DEDE4DEDE4DEDE4DEDE4DEDE4DEDE4DEDE4DEDPA6PA6PA6PA6PA6PA6PA6PA6PDE5PDE5PDE5PDE5PDE5PDE5PDE5PDE7DEDPAAEDEDDPAAEEDEDPAAED3PAAEEDEDPAAEDEDDPAAEEDEDPAAED3PA644PDE2A2PDDEEA2PD2EA2PDDEEA2PDDEEA2PDDEEA2PD2EA2PDDE5DDEDE4DEDE4DEDE4DEDE3DDEDE4DEDE4DEDE4DEDPA6PA6PA6PA6PA6PA6PA6PA6PDE5PDE5PDE5PDE5PD6PE6PDE5PDE7DEDPAAEDEDDPAAEEDEDPAAED3PAAD4PAAE3DPAAEEDEDPAAED3PA644PDDEEA2PDDEEA2PD3A2PE3A2PDDEEA2PDDEEA2PD2EA2PDDE5DEEDE4DED8E6DE3DDEDE4DEDE3DDEDE4DEDPA6PA6PA6PA6PA6PA6PA6PA6PDE5PDE5PDE5PDE5PDE5PDE5PDE5PDE7DEDPAAEDEDDPAAEEDEDPAAED3PAAEEDEDPAAEDEDDPAAEEDEDPAAED3PA644PDDEEA2PDDEEA2PD2EA2PDDEEA2PDEDEA2PDDEEA2PDEDEA2PDDE5DEEDE4DEDE3DEEDE4DEDE3DDEDE4DEDE6DE4DEDPA6PA6PA6PA6PA6PA6PA6PA6PDE5PDE5PDDE4PD2EDEDPDDEDEDEPDEDEDEDPDDEDEDEPD2EDEDEEDEDPAAEDEDDPAADED2PAAED3PAADEEDDPAAEDEDDPAADED2PAAEDEDDPA644PDE2A2PDDEEA2PDEDEA2PDDEEA2PDE2A2PDDEDA2PDEDEA2PDDEDE3DEEDE4DEDE3DEEDE2DEDEDE3DEEDEDEDEDEDEEDEEDEDEDEDEDEDPA6PA6PA6PA6PA6PA6PA6PA6PDDEDE2PDEDEDEDPDDEDEDEPD2EDEDPDDEDEDEPDEDEDEDPDDEDEDEPD2EDEDDEEDDPAAEDEDDPAADED2PAAEDEDDPAADEEDDPAAEDEDDPAADED2PAAEDEDDPA644PDE2A2PDDEDA2PDEDEA2PD3A2PDEDEA2PDDEDA2PDEDEA2PD3E4DEDEDEDEDEDEEDEDDEDED2EDEDDEDEDDEDEDED2EDDEDEDEEDED2EDEDPA6PA6PA6PA6PA6PA6PA6PA6PDDEDE2PDEDEDEDPDDEDEDEPD2EDEDPDDEDEDEPDEDEDEDPDDEDEDEPD2ED3ED2PAAEDEDDPAADEDEDPAAED3PAADEDEDPAAEDEDDPAADEDEDPAAED3PA644PDEDEA2PDDEDA2PDEDEA2PD3A2PDEDEA2PDDEDA2PDEDEA2PD4EDEDEED2ED2EDDEDEDDEDED4EDDEDEDEED2ED2EDDEDEDDED6EDPA6PA6PA6PA6PA6PA6PA6PA6PDDEDEDEPDED2EDPDDEDEDEPD2ED2PDDEDEDEPDEDEDEDPDDEDEDEPD2ED3EDEDPAAED3PAAD2EDPAAED3PAADEDEDPAAD4PAAD2EDPAAED3PA644PDEDEA2PD3A2PD2EA2PD3A2PDEDEA2PD3A2PD2EA2PD4EDEDDED6EDDEDEDDED6EDDEDEDDED6ED3EDDED6EDPA6PA6PA6PA6PA6PA6PA6PA6PDDEDEDEPD4EDPDDEDEDEPD6PDDEDEDEPD6PDDED2EPD7EDEDPAAD4PAAD2EDPAAD4PAADEDEDPAAD4PAAD2EDPAAD4PA644PDEDEA2PD3A2PD2EA2PD3A2PDEDDA2PD3A2PD3A2PD4EDEDDED6ED3EDDED6EDDED2EED6ED6ED6EDPA6PA6PA6PA6PA6PA6PA6PA6PD3EDEPD6PDDED2EPD6PD3EDDPD6PDDED2EPD7ED2PAAD4PAAD2EDPAAD4PAADED2PAAD4PAAD4PAAD4PA644PD3A2PD3A2PD3A2PD3A2PD3A2PD3A2PD3A2PD4ED2EED6ED6ED6ED6ED6ED6ED6EDPA6PA6PA6PA6PA6PA6PA6PA6PD3EDDPD6PD5EPD6PD6PD6PD6PD7ED2PAAD4PAAD4PAAD4PAAD4PAAD4PAAD4PAAD4PA644PD3A2PD3A2PD3A2PD3A2PD3A2PD3A2PD3A2PD9ED6ED6ED6ED6ED6ED6ED6EDPA6PA6PA6PA6PA6PA6PA6PA6"

F9_BG =
	"H8NH14NH14NH14NH14NH14NH14NH14NH14NH25NH2NH10NH2NH14NH14NH10NH2NH15NH14NH14NH14NH14NH14NH14NH14NH14NH93NH15NH14NH14NH14NH14NH14NH14NH14NH14NH29NH6NH6NH14NH14NHNH6NH4NHNH2NHHNH6NH14NH14NH14NH14NH14NH14NH14NH14NH93NH15NH14NH14NH14NH14NH14NH14NH14NH14NH13NH10NH2NH10NH2NH14NH14NH10NH2NH4NH9NH14NH14NH14NH14NH14NH14NH14NH14NH77NH14NH15NH14NH14NH14NH14NH14NH14NH14NH14NH29NH6NH6NH4NH6NHNHNH2NH2NH2NHNHNH2NH2NH2NHNHNH2NH9NH14NH14NH14NH14NH14NH14NH14NH14NH77NH14NH15NH14NH14NH5NH7NH5NH7NH5NH7NH5NH7NHHNH2NH7NHHNH2NH2NH2NNHHNH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NHNHNH2NHNHNH2NHNHNHNHNHNHNHNHNHNHNH2NHNHNHNH9NH14NH14NH14NH14NH14NH14NH14NH14NH57NH2NH10NH2NH6NH6NH15NH14NH14NH14NH14NH14NH14NH14NH13NNH7NH4NHNH2NH2NH2NHNHNH2NHNHNH2NHNHNH2NH6NHNHNH2NH2NH2NHNHNH2NH6NHNHNH2NH9NH14NH14NH14NH14NH14NH14NH14NH14NH61NH14NH14NH6NH7NHHNH6NH3NHHNH2NH7NHHNH2NH7NHHNH2NH2NH3NHHNH6NH3NHHNH2NH7NHHNH2NH2NH2NNHHNH2NH2NH2NNHHNH2NH2NH2NH2NH2NH2NH2NH2NHNHNH2NHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNH2NHNHNHNH9NH14NH14NH14NH14NH14NH14NH14NH14NH41NH2NH10NH2NH14NH6NH6NH15NH14NH14NH14NH14NH14NH14NH11NHHNH3NH2NH2NHN2H2NH2NH2NHNHNH2NH2NH2NHNHNH2NHNHNH2NHNHNH2NH2NHNHNHNHNHNHNH2NHNHNHNHNHNHNH2NHNHNHNHNHNHNH9NH14NH14NH14NH14NH14NH14NH14NH14NH53NH6NH14NH14NH10NH3NHHNH6NH3NHHNH2NH7NHHNH2NH7NHHNH2NH7NHHNH6NH3NHHNH2NH6NNHHNH2NH2NH2N2HNH2NHNHNHNHN2HNHNHNHNHNHNHNHNHNHNHNHNHNH2NHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNH2NHNHNHNH9NH14NH14NH14NH14NH14NH14NH14NH14NH29NH10NH2NH10NH2NH14NH14NH6NH7NH5NH7NH5NH7NHHNH2NH2NH3NHHNH2NHNH5NNHNH2NHNHNHNHHNNHNHNHNHNHNHNHHNNHNHNHNHNHNHNHN2HNHNH2NHNHNHN2HNHNH2NHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNH2NHNHNHNHNHNHNH2NHNHNHNHNHNHNHNHNHNHNHNHNHNHNHHNH6NH14NH14NH14NH14NH14NH14NH14NH14NH29NH14NH6NH6NH14NH14NH6NH2NH3NHHNH2NH2NH3NHHNH2NH7NHHNH2NH7NHHNH2NH2NH3NHHNH6NH2NNHHNHNHNH2NH2N2HNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHHNH6NH2NH2NH2NH2NH2NH2NH2NH2NH2NH10NH2NH10NH2NH6NH2NH2NH10NH14NH14NH9NH2NH6NH6NH10NH2NH10NH2NH14NH14NH6NH7NHHNH2NH7NHHNH2NH2NHNHHNHHNHNHNH2NHNHHNNHNHNHNHNH2NHHNNHNHNHNHNHNHNHHNNHNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNH9NH14NH14NH14NH14NH14NH14NH14NH14NH29NH14NH6NH6NH14NH14NH6NH2NH3NHHNH2NH2NH3NHHNH2NH7NNHNH2NHNH5NNHNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHHNH6NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH6NH2NH2NH6NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH6NH2NH2NHHNH2NNH2NH2NH2NHHNH3NHHNNH2NHHNH3NH2NHHNH2NH3NH2NHHNH2NH3NH2NHHNH2NH3NHHNNH2NHHNH6NHNH2NHHNNHNHNHNHNH2NHHNNHNHNHNHNHNHNHHNNHNHNH2NHNHNHHNNHNHNHNHNH2NHHNNHNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNH2NHNHNHNHNHNHNHHNH2NH2NH2NH10NH6NH6NH6NH6NH14NH14NH14NH14NH14NH13NH14NH14NH6NH6NH14NH14NH6NH7NHHNHNH4NHNHHNHHNHNHNHNH2NHHNNHNHNHNHNH2NHHNNHNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHHNH6NH2NH2NH6NH2NH2NH2NH2NH2NH2NH6NH2NH2NH6NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NHHNH2NNH2NH2NHHNH2NNH2NH2NH2NHHNH3NHHNNH2NHHNH3NH2NHHNH2NH3NH2NHHNH2NH3NH2NH2NHHNH3NHHNNH2NHHNH3NHHNHNH2NHHNNHNHNHNHNH2NHHNNHNHNHNHNH2NHHNNHNHNH2NHNHNHHNNHNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHHNH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NHHNNH2NHHNNH2NH6NHHNH3NH6NHHNH3NH6NHHNH3NHHNH3NHHNH14NH14NH7NNHN2HHNNHN2HHNNHN2HHNNHN2HN2H2NHN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HNHNHN2HNHNHN2HNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHHNH6NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH6NH2NH2NH6NH2NH2NH6NH2NH2NH2NHHNNH2NH2NHHNH2NNH2NH2NHHNH2NNH2NHHNH3NHHNH3NH2NH2NHHNH3NH2NHHNH2NH3NH5NH2NH3NHHNH3NHHNH3NH2NH2NHHNH3NHHNHNH2NHHNNHNHNHN2H2NHHNNHNHNHHNNHNHNHHNNHNHNHN2HNHNHN2HNHNHN2HNHNHN2HNHNHNHNHNHNHN2HNHNHN2HNHNHN2HNHNHN2HNHNHN2HNHNHN2HNHNHN2HNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHHNH2NH2NH2NH2NH2NH2NH2NH6NH2NH2NH6NH2NH2NH2NH2NH2NH2NH6NH2NH2NH6NH2NH2NH6NHHNNH2NHHNNH2NHHNNH2NH6NHHNH3NH6NHHNH3NH6NHHNH3NHHNH3NHHNH3NH6NHHNH3NH6NHHNH3NHHN2HN2HHNNHN2HN2HN2HHNNHN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HNHNHN2HN2HNHNHNHNHN2HN2HNHNHNHNHN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HNHNHNHNHN2HHNH6NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH6NH2NH2NH6NH2NH2NH2NH2NH2NHHNNH2NHHNNH2NH2NHHNH2NNH2NH2NHHNH2NNH2NH2NHHNH2NH3NHHNNH2NHHNH3NH2NHHNH2NH3NH2NHHNH2NH3NH2NH2NHHNH3NH2NH2NHHNH3NHHN2H2NHHNNHN2HN2H2NHHNNHN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHNHNHN2HN2HNHNHN2HN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHHNH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH6NH2NH2NH2NH2NHHNNH2NHNHNH2NHN2H2NHN2H2NHN2H2NHNH4NHNNH3NHNHNH2NHNNH3NHNH4NHNNH3NHN2H2NHNNH3NHNH4NHNNH3NHNHNH2NHNNH3NHN3HN2HHNNHN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HNHNHNHNHN2HN2HNHNHNHNHN2HN2HNHNHNHNHN2HN2HN2HNHNHN2HN2HNHNHNHNHN2HHNH6NH2NH2NH2NH2NH2NH2NH2NH2NH2NH2NH6NH2NH2NH5NNH2NH2NH2NHHNNH2NHHNNH2NHHNNH2NH2NHHNH2NNH2NHHNNHHNH2NNH2NHHNNH2NHHNH3NHHNNH2NHHNH3NHHNNHHNH2NH2NNHHNNHHNH2NH2NNHHNNHHNH2NH2NNHHNNHHNNHHNH2NNHHN2H2NHHNNHN2HN2H2NHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNHNHNHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HNHNHN2HNHNHN2HNHNHN2HN2HN2HNHNHNHNHNHNHNHNHNHNHNHNHHNHNHNHNHNHNHNHNH2NHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNH2NHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHN2HNHNHN2HNHNHNH2NHNHNNHHNHNHNHNHNHNHNNHHNHNHNHNHNHNHNNHHNHNHN2HNHNHNNHHNHNHNH2NHNHNNHHNHNHNHN2HNHNNHNNHNHN3HNHNHN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HNHNHNHNHN2HN2HNHNHNHNHN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HNHNHNHNHN2HHNH6NHHNNH2NH6NHHNNH2NHHNNH2NHHNNHHNNH6NHHNNHHNNHHNH2NNHHNNHHNNHHNNHHNNHHNNHHNNHHNNHHNNHHNNHHNNHHNH2NNHHNNHHNNHHNH2NNHHNNHHNNHHNNHHNH2NNHHNNHHNNHHNH2NNHHNNHHNH2NH2NNHHNNHHNH2NH2NNHHNNHHNNHHNH2NNHN2HHNNHNNH2NNHN3H2NHN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HNHNHN2HHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHNHN2HNHNHNH2NHNHN2HNHNHNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHN2HNHNHN2HNHNHNH2NHNHNNHHNHNHNHNHNHNHNNHHNHNHNHNHNHNHNNHHNHNHN2HNHN3HHNHN2H2NHN3HNNHN2HN2HN3HNNHN5HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HNHNHNHNHN2HNHNHNHNHNHNHN2HNHNHN2HNHNHN2HN2HN2HNHNHN2HN2HNHNHNHNHN2HNNHNH2NHNHN2HNHNHN2HNHNHN2HNHNHN2HNHNHN2HN2HNNHHN2HN2HN2HNNHHN2HN2HN2HNNHHN2HN2HN2HN2HN2HN2HN2HNNHHN2HN2HN2HNNHHN2HN2HNNHHN2HNNHHN2HN2HN2HNNHHN2HN2HN2HNNHHN2HNNHHN2HNNHN3HNNHHN2HNNHN6HHN5HN8HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HNHNHN2HNHNHN2HNHNHN2HNHNHN2HNHNHN2HNHNHN2HNHNHN2HNHNHN2HNHNHN2HNHNHN2HNHNHN2HHNHNHNHNHNHNHNHNH2NHNHNHNHNHNHNHNHNHNHNHNHNHNHNH2NHNHN2HNHNHN2HNHNHN2HNHNHNH2NHNHN2HNHNHN2HNHNHN2HNHNHNH2NHNHN2HNHNHN2HN2HN2HN2HNH2N2HNNHN3HNNHHN5HN6HHN5HN6HHN5HN5H2N5HN5H2N5HN8HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HNHNHN2HN2HNHNHNHNHN2HN2HNHNHNHNHN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HNHNHNHNHN2HNNHNH2NHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HNNHHN2HN2HN2HNNHHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNNHHN2HN2HN2HNNHHN6HN2HNNAAN13HN14HN14HN8HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HNA3NNHN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HNHNHN2HHNHN2HNHNHN2HNH2N2HNHNHN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNH2N2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN6HN12H2N5HN5HN7HN5H2N5A6N8HN5H2N5HN5HN7HN8HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HNHNHNHNHN2HN2HNHNHNA8NHNHNHNHNHN2HN2HN2HNHNHN2HN2HNHNHNHNHN2HNNHNH2NHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN6HN2HN13HHN13HHN10HNNA10N4HHN13HHN13HHN7HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNHNHNHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HNA10N2HNHNHN2HN2HN2HNHNHN2HNHNHN2HNHNHN2HHNHN2HNHNHN2HNH2N2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNH2N2HN8H2N6HN22HN6HN4H2N5HN5H2N5HHN13A10N4HHN4H2N5HHN4H2N5HHN7HNHNHN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HNHNHNHNHN2HN2HNHNHNA10N2HNHNHN2HN2HN2HNHNHN2HN2HNHNHNHNHN2HNNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN6HN10HN33HN14HN11HNNA10N4HN14HN14HN8HNHNHN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HNA10N2HNHNHN2HN2HN2HNHNHN2HN2HN2HNHNHN2HHNHN2HNHNHN2HN2HN2HN2HN2HNHNHN2HN2HN4H2N6HN20H2N12HN46H2N5HN5HN7HN14A10N4HN5H2N5HN5HN7HN8HNHNHN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HNHNHN2HN2HNHNHNHNHN2HNHNHNHNHNA10NHNHNHNHN2HN2HN2HNHNHN2HN2HNHNHNHNHN2HNNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN6HN2HN6HN14HN6HN6HN10HN10HN6HN5HHN5HHN13HN6HHN2HNNA10N4HHN5HHN5HHN5HHN5HHN7HNHNHN2HN2HN2HNHNHN2HN2HN4HNHN6HN6HN6HN4HNHN6HN6HN6HN6HN6HN6HN6HN6HN6HNHN4HNHN4HNHN4HNHN4HNHN4HNA10N2HNHN4HNHN4HNHN4HNHN4HNHN4HNNHN2HN6HN2HN14HN14HN6HN6HN14HN14HN14HN14HN13HHN5HHN5HHN5HN6HHN5A10N4HN6HHN5HN6HHN5HN8HNHNHN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HNHNHN2HN2HNHNHNHNHN2HN2HNHNHNA10N2HNHNHN2HN2HN2HNHNHN2HN2HNHNHNHNHN2HNNHN2HN2HN2HN2HN6HN6HN18HN62HN33HN14HN11HNNA10N4HN14HN14HN8HNHN4HN6HNHN4HN6HN6HN6HN6HN6HNHN4HN6HN6HN6HN6HN6HN6HN6HN6HN6HN4HNHN6HN4HNHN12A10N4HN14HN14HN7HN12H2N12HN32HN12H2N12HN46H2N5HN5HN7HN5HN7A10N4HN5H2N5HN5HN7HN8HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HN2HNHNHN2HN2HN2HNHNHN2HN2HN2HN2HN2HN2HN6HNHN4HN4HNHNHN4HNHN2HNHNA10NHNHNHN4HNHN4HNHN4HN4HNHNHN4HNNHN6HN6HN6HN26HN2HN6HN6HN6HN6HN6HN6HN10HN2HN6HN6HN6HN5HHN5HHN5HHN10HNNA10N4HHN4HNHN5HHN5HHN5HHN5HN2HN10HN2HN42HN2HN10HN46HN14HN6HN6HN6HN6HN6A10N4HN6HN6HN6HN6HN7HN6HN4H2N6HN4H2N6HN14A8N6HN4HNHN6HN4HNHN6HN14HN6HN6HN4HNHN5HHN4HNHN5HHN13A10N4HN5HN7HN5HN7HN8HNHN4HN6HN6HN6HNHN4HN6HNHN2A17HN6HN6HN6HNHN4HN6HNHN4HN6HN6HN6HN4HNHN6HNHN2HNHN6HNHN2A10N4HNHN6HN4HNHN6HN4HNHN57HNA18N42HN33HN14HN11HNNA10N4HN14HN14HN10HN14HN14HN16A19N77HN14HN14A10N4HN14HN14HN21H2N12HN14H2N3A19N4H2N12HN46HNHN5HN5HN7HN14A10N4HN5HN7HN5HN7HN42HN14A21N25HN14HN34HN10HN2HN6HN2HN2A10N4HN14HN14HN7HN6HN6HN6HN6HN6HN9A21N14HN6HN6HN6HN2HN10HN6HN5HHN5HHN5HN6HN6HN3HNNA10N4HN6HN6HN6HN6HN10HN14HN30A21N69HN6HN6HN6HN6HN6A10N4HN6HN6HN6HN6HN7HN49A21N69HN6HN6HN6HN6HN6A10N4HN6HN6HN6HN6HN42HN14A21N77HN14HN14A10N4HN14HN14HN11HN45A21N77HN14HN14A10N4HN14HN14HN10HN14HN30A21N53HN22HN6HN6HN14A10N4HN14HN14HN7HN49A21N4HN14HN46HN7HN5HN7HN5HN7A10N4HN5HN7HN5HN7HN42HN14A21N69HN6HN14HN6HN5A11N4HN6HN6HN14HN58A21N77HN6HN6HN13A12N3HN14HN6HN6HN6HN2HN10HN2HN10HN18A21N5HN14HN30HN14HN6HN6HN6HN6HN5A12N3HN6HN6HN6HN6HN58A21N77HN14HN13A12N3HN5HN7HN5HN7HN58A21N77HN2HN10HN13A12N3HN14HN2HN10HN58A21N77HN14HN13A12N3HN14HN14HN10HN14HN14HN14A21N77HN14HN13A12N3HN14HN14HN58A21N77HN14HN13A12N3HN5HN7HN5HN7HN58A21N77HN14HN6HN5A12N3HN14HN14HN58A21N69HN6HN6HN6HN6HN5A12N3HN6HN6HN6HN6HN10HN14HN30A21N69HN6HN6HN6HN6HN5A12N3HN6HN6HN6HN6HN58A20N70HN6HN6HN6HN6HN5A12N3HN6HN6HN6HN6HN58A20N66HN10HN14HN2HN9A12N3HN14HN14HN58A20N78HN14HN13A12N3HN14HN14HN10HN14HN30A20N54HN22HN6HN6HN13A12N3HN14HN14HN58A20N78HN14HN13A12N3HN14HN14HN58A20N70HN6HN14HN6HN5A12N3HN6HN6HN14HN58A20N70HN6HN6HN6HN6HN5A12N3HN6HN6HN6HN6HN10HN14HN30A20N70HN6HN6HN6HN6HN5A12N3HN14HN6HN6HN58A20N78HN14HN13A12N3HN14HN14HN58A20N66HN10HN2HN10HN2HN9A12N3HN2HN10HN2HN10HN2HN54A20N66HN10HN2HN10HN2HN9A12N3HN2HN10HN2HN10HN2HN6HN14HN14HN14A20N54HN10HN10HN14HN2HN9A12N3HN14HN14HN58A20N78HN14HN13A12N3HN14HN14HN58A20N78HN14HN6HN5A12N3HN14HN14HN58A20N70HN6HN6HN6HN6HN5A12N3HN6HN6HN6HN6HN10HN14HN30A20N70HN6HN6HN6HN6HN5A12N3HN6HN6HN6HN6HN58A20N70HN6HN6HN6HN6HN5A12N3HN6HN6HN6HN6HN58A20N66HN10HN2HN10HN2HN9A12N3HN2HN10HN2HN10HN58A20N66HN10HN14HN13A12N3HN14HN6HN6HN6HN50A20N78HN14HN13A12N3HN14HN14HN58A20N78HN14HN13A12N3HN14HN14HN58A20N78HN14HN6HN5A12N3HN6HN6HN14HN5"

F9_Frame =
	"A183OAP6A230O8PA229OOP5OOPA228OOP6OOPA227O6P2OOPA226O7P2OOPA225O2P3OOP2OPA225O2PO2POOPPOPA225O2PO3POPPOPA225O2PO4PAPOPA225O2PO4PAPOPA225O2PO4PAPOPA225O2PO4PAPOPA225O2PO4PAPOPA225O2POOP3APOPA225O2POOPA3POPA225O2POOP3APOPA225O2PO4PAPOPA225O2PO4PAPOPA114OA109O2POOP3APOPA114OA109O2POOPA3POPA114OA109O2POOP3APOPA114OA109O2PO4PAPOPA99P14OA109O2PO4PAPOPA98PO15A109O2PO4PAPOPA97PO2P12OA109O2PO4PAPOPA96PO2PA12OA109O2PO4PAPOPA95PO2PAO13A109O2PO4PAPOPA94PO2PAO14A109O2PO4PAPOPA93PO2PAO9P4OA109O2PO4PAPOPA93POOPAO9P5OA109O2PO4PAPOPA93POPPO9PPO5A109O2PO5AOOPA93POPAO8PPO6A109O2PO5AOOPA93POPAO7PPO7A109O2PO5AOOPA93POPAO6PPO8A109O2PO5AOOPA93POPAO5PPO9A109O2PO5AOOPA93POPAO5APO9A109O2PO5AOOPA93POPAO2POOAPO9A109O2PO4PAPOPA93POPAO2POOAPO9A109O2PO4PAPOPA93POPAO2POOAPO9A109O2PO4PAPOPA93POPAO2POOAPO9A109O2PO4PAPOPA93POPAO2POOAPO9A109O2PO5AOOPA93POPAO2POOAPO9A109O2PO5AOOPA93POPAO2POOAPO9A109O2PO5AOOPA93POPAP3OOAPO9A109O2PO5AOOPA93POPAO5APO9A109O2PO5AOOPA93POPAP5APO9A109O2PO5AOOPA93POPAO5APO9A109O2PO4PAPOPA93POPAP5AP9OA109O2PO4PAPOPA93POP3A13POA109O2P6APOPA93POPPAO16A109O2PO4PAPOPA93POPPO17A109O2PO4PAPOPA93POPAO17A109O2PO4PAPOPA93POPAO17A109O2PO4PAPOPA93POPAO17A109O2PO4PAPOPA93POPAOOP13OOA109O2PO4PAPOPA93POPAOOPO11POOA109O2POPOPOPAPOPA93POPAOOPO11POOA109O2PO2POPAPOPA93POPAOOPOAOAOAOAOAOOPOOA109O2POPOPOPAPOPA93POPAOOPOAOAOAOAOAOOPOOA109O2PO4PAPOPA93POPAOOPOAOAOAOAOAOOPOOA109O2PO4PAPOPA93POPAOOPOAOAOAOAOAOOPOOA109O2PO4PAPOPA93POPAOOPOAOAOAOAOAOOPOOA109O2PO4PAPOPA93POPAOOPO11POOA109O2PO4PAPOPA93POPAOOP13OOA109O2PO4PAPOPA93POPAO4A6O5A109O2P6APOPA93POPAO17A109O8AAPOPA88PPA9PPA20PPA87PPA9PPA50PPAH46PPH9PPH20PPH87PPH9PPH50PPHO46PPO9PPO20PPO87PPO9PPO50PPOA479P479A78P6A153E51PPE14D2E6P6E90PPE60M46E4PPE6M11E13M84E4PPE6M50E2D51PPD122PPD112PPD122PPD60E51PPE15DDE104PPE60D51PPD122PPD35P15D8P8D42PPD34P44D42PPD34PDE14PD7E8PD41PPD32PPE44PD41PPD32P2DEPPED5PDPD2PD15P7D34PPD32BPD44P7D34PPD31PEEPDEPPED5PDPD2PD8PD2PDDPO6PD33PPD3E6D21BPDDPD2PD2PD2PD22PD2PDDPO6PD33PPD3E2D24PEDPDEPPED5PDPD2PD6"

F9_Suitcase_02 =
	"A4P162A7PJJPC21PK109PC19PJ4PA5PJLLPCD19CPL109PD19PLLJ3PA3PJJP160J3PAAPJJPMMPC2PB13PC2PK11P5K73P5K11PC2PB11PC2PM2PJ3PPJJPM2PC2PB13PC2P3K8P5K73P5K8P3C2PB11PC2PM3PJ2PPJKPM2PC3PB11PC3P3K8P5K73P5K8P3C3PB9PC3PM3PPKJPPJKPM2PC4P11C4PM2P8K5P73K5P8M2PC4P9C4PM2PLPKJPPJKPPM2PC19PM5JK11J73K5J6M5PC17PM2PLKPKJPPJKPLPM2PC17PM5JK99JM5PC15PM2PLKKPKJPPJKPKLPM2P17M5JK101JM5P15M2PLK2PKJPPJKPKKLPM24JK103JM22PLK3PKJPPJKPK2LPM22JK105JM20PLK4PKJPPJKPK3LPM20JK107JM18PLK5PKJPPJKPK4LPM18JK109JM16PLK6PKJPPJKPK5LPM16JK111JM14PLK7PKJPPJKPK6LPM14JK113J13MPK8PKJPPJKPK7LPM12JK129PK8PJPAPJKPK8PMJ11K130PK8PPAAPJKPK8PK143PK8PPAAPJKPK8PK2M6K133PK8PPAAPJKPK8PKKMK6MK132PK8PPAAPJKPK8PKKMKM4KMK132PK8PPAAPJKPK8PKKMKMK2MKMK132PK8PPAAPJKPK8PKKMKKMKMKKMK132PK8PPAAPJKPK8PKKMK2MK2MK132PK8PPAAPJKPK8PKKMK2MK2MK132PK8PPAAPJKPK8PKKMKKM2KKMK132PK8PPAAPJKPK8PKKMK6MK132PK8PPAAPJKPK8PK2M6K133PK8PPAAPJKPK8PK143PK8PJPAPJKPK8PK143PK8PKJPPJKPK8PK143PK8PKJPPJKPK8PK143PK8PKJPPJKPK8PK143PK8PKJPPJKPK8PK143PK8PKJPPJKPK8PK143PK8PKJPPJKPK8PK143PK8PKJPPJKPK8PK143PK8PKJPPJKPK8PK143PK8PKJPPJKPK8PK143PK8PKJPPJKPK8PK143PK8PKJPPJKPK8PK143PK8PKJPPJKPK8PK143PK8PKJPPJKPK8PK143PKKM4KKPKJPPJKPK8PK143PK8PKJPPJKPK8PK143PK2M3KKPKJPPJKPK8PK143PK8PKJPPJKPK8PK143PKKM4KKPKJPPJKPK8PK143PKKM4KKPKJPPJKPK8PK143PK8PKJPPJKPK8PK143PKKM4KKPKJPPJKPK8PK143PK8PKJPPJKPK8PK143PKKM3K2PKJPPJKPK8PK125M3KMK3M4K2PK8PKJPPJKPK8PK125MKKMKMKMMKMK2MK2PKKM2KMKKPKJPPJKPK8PK125MKKMKMK3MK2MK2PK8PKJPPJKPK8PK125M3KMK3M4K2PKKM4KKPKJPPJKPK8PK143PKKM4KKPKJPPJKPK8PK143PK8PJJPPJKP165JJPPJKPK8P12K117P10K11JPJJPPJKPJ8KP10KJ117KP7KKJ12PJJPPJJPK7JJK10JJK115JJK8JJK10JPJJPPJJPJ163PJJPPJ2PJ161PJ2PPJ3PJ159PJ3PAP169A3P165A2"

F9_Suitcase_Scan_02 =
	"A4H162A7H2GH21GH109GH19GH5A5H3GH21GH109GH19GH6A3H4G158H4AAH2GHHGH2GH13GH2GH11GH3GH73GH3GH11GH2GH11GH2GH2GH7GH2GH2GH13GH2G3H8GH3GH73GH3GH8G3H2GH11GH2GH3GH6GH2GH3GH11GH3G3H8G5H73G5H8G3H3GH9GH3GH3GGH5GH2GH4G11H4GH2G8H5G73H5G8H2GH4G9H4GH2GHGH5GGH2GH19GH111GH17GH2GHHGH5GHGH2GH17GH113GH15GH2GH2GH5GHHGH2G17H115G15H2GH3GH5GH2GH153GH4GH5GH3GH151GH5GH5GH4GH149GH6GH5GH5GH147GH7GH5GH6GH145GH8GH5GH7GH144GH8GH5GH8GH143GH8GHHAH2GH8GH143GH8GHAAH2GH8GH143GHHOH5GHAAH2GH8GH143GH8GHAAH2GH8GH143GH3OH3GHAAH2GH8GH143GH8GHAAH2GH4OH2GH6OH2OH2OH126OGOHOHOHOHOGOAAH2GH8GH143GH8GHAAH2GH2OH2OHGHOH6OH133GOH2OHOHOGHAAH2GH8GH143GH8GHAAH2GHOH2OHOHGH2OH2OH2OH2OH126OGOHOHOHOHOGOAAH2GH8GH143GH2OH2OHGHAAH2GH2OHOHOHGHOH2OH2OH2OH129GOHOHOHOHOGOAAH2GH8GH143GH4OH2GHHAH2GHOHOHOHOHGHOH4OHOHOHOHOH127GOHOHOHOHOGOH4GHHOH5GOH142GHOHOHOHOHGHOH3GHOHOHOHOHGHOH2OHOHOH2OH2OH124OGOHOHOHOHOGOH4GH8GH143GHOH2OH2GH5GHOHOHOHOHGHOH2OHOHOHOHOHOH126OGOHOHOHOHOGOH4GH5OHHGH141OHGHOHOHOHOHGHOH3GHOHOHOHOHGHOH2OH2OHOHOH128OGOHOHOHOHOGOH4GH8GH141OHGHOHOHOH2GH5GHOHOHOHOHGHOHOHOHOHOHOHOHOH126OGOHOHOHOHOGH5GHHOH2OHHGOH140OHGHOHOHOHOHGH5GHOHOHOHOHGHOHOHOHOHOHOHOHOH52OH2OH2OH2OH2OHOHOHOHOHOHOHOHOHOHOHOHOHOHOH2OHOHOH2OH2OH2OH2OHOHOHOGOHOHOHOHOGH5GH8GH141OHGHOHOHOHOHGH5GHOHOHOHOHGHOHOHOHOHOHOHOHOH26OH2OH2OH2OH2OHOHOH2OHOHOH2OHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOH2OH2OHOHOHOHOGOHOHOHOHOGH5GHHOH2OHHGOH138OHOHGHOG4OHGH5GHOHOHOHOHGHOHOHOH2OHOHOH30OH2OH2OH2OH2OH2OH2OH2OH2OH2OHOHOH2OHOHOHOHOHOHOHOHOHOHOHOHOHOHOH2OH2OH2OH2OHOHOHOHOHOGOHOHOHOHOGH5GOH6OGH141OHGHOHG3HHGH5GHOHOHOHOHGHOHOHOHOHOHOHOHOH22OH2OH2OH2OH2OHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOGOHO6GH5GOHOHOHOHOGOH2OH2OH30OH62OH22OH6OH2OHOHGHOG4OHGH5GHOHOHOHOHGHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOH2OHOHOH2OHOHOH2OHOHOH2OHOHOH2OHOHOHOHOHOHOHOHOHOHO2HO2HO2HO2HO2HOHOHOHOHOHOHOHOHOHOGOOG4HOGOH4GOHOHOHOHOGH71OHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHGHOHOHOHOHGHOHHOHGHO2HO2HGHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HOHOHO2HOGOOG4OOGOOH2OGOHOHOHOHOGOH2OH2OH2OHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHGHOHOHOHOHGHOHHOHGOOHOHOHOOGHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHO2HO2HO2HO2HO2HOHOHO2HOHOHOHOHOHOHO2HO2HO2HO2HO2HO2HO2HOHOHOHOHOHOHOHOHOHOHOHOGOOG3OHOGOHOHHOGOHOHOHOHOGOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHGHOHOHOHOHGHOHHOOGHO2HO2HGOOHO2HO2HO2HO2HO2HO2HO2HO2HOHOHO2HOHOHO2HO2HO6HO6HO2HO2HO2HO2HO2HO2HO2HO2HO6HO6HO2HO2HO2HO2HO2HOHOHOGOOG2OGOOGO2HHOGOHOHOHOHOGOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHGHOHOHOHOHGHOHHOHGHOHO2HOHGHOHOHOHOHOHOHOHOHO2HOHOHOHOHOHOHOHOHOHOHOHOHOHOHO2HO2HO2HO2HO2HO2HO2HOHOHO2HOHOHO2HO2HO2HO2HO2HO2HO2HO2HO2HOHOHOHOHOHOHOHOHOHOGOOG4HOGOHOHHOGOHOHOHOHOGOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHGHOG4OHGHOHHOOGHO2HO2HGOOHO2HO2HO2HO2HO2HO2HO2HOHOHOHOHOHOHO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HOHOHO2HOGOHO6GO2HHOG165HOHHOHGOOHOHOHOOG13OHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHO2HO2HO2HO2HO2HOHOHO2HOHOHO2HOHOHO2HO2HO2HO2HO2HO2HO2HOHOHOHOHOG10OHOHO2HO2HOGOHOH2GOHOHOHOHOHG10HOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOG7HOHOHOHOHOHOHOHGHOH3GHO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HOHOHOHOHOHOHO2HO2HO2HO2HO2HO2HO2HOHOHO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HO2HOHOHO2HOHOHO2HOHOHO10GOOH3GHHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHGH6GOHOHOHOHOHOHOHOHOHOHOHOHOH6OHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHO2HOHOHO2HOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHO2HO2HGOH7GH77OH2OHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHOHGH4AH3OH2OHOHOHOHOHOH150A3H165A2"

function loadFrame09Sprites()
	tomem(unpac(F9_Scannerframe))
	loadSprite("F9_Scannerframe", 115, 120, 2)
	tomem(unpac(F9_Suitcase_01))
	loadSprite("F9_Suitcase_01", 123, 69, 0)
	tomem(unpac(F9_Suitcase_Scan_01))
	loadSprite("F9_Suitcase_Scan_01", 123, 70, 0)
	tomem(unpac(F9_ScannerBG))
	loadSprite("F9_ScannerBG", 97, 87, 0)

	loadExtendedSprite(unpac_noheader(F9_BG), "F9_BG", 240, 121, 0)
	loadExtendedSprite(unpac_noheader(F9_Frame), "F9_Frame", 240, 85, 0)
	loadExtendedSprite(unpac_noheader(F9_Suitcase_02), "F9_Suitcase_02", 172, 69, 0)
	loadExtendedSprite(unpac_noheader(F9_Suitcase_Scan_02), "F9_Suitcase_Scan_02", 172, 69, 0)
end

-- Frame07
F7_Ship_01 =
	"F77C12B2C49BBC79F73C12B3C49B2C55B25F25C18F24C12B3C50B2C54B29F23C11A8F20C13B2C51B2C53B5A27F22B13AAP6F17C14BC52BBC54B3A31F22C11BBP4A3PF15BC2B10CB111A6O11AP9A4F21B14AP4AIIAPF13BC125BBA5O11APA7P6F21B14AP5AIIAPF12B14CB111A5O11APAAP6A6F20B15AP6AIIAPF11B14CB97A11BBA4O11APAAPO4PA7F20B15AP7AIIAPF9B15CB111A3O11APAAPO4PA8F20B15AP2APPAPPAIIAPF8B15CA80BBAP25A4O11APAAPO4PA9F20A16P2APPAP2AIIAPF6B16AB80AAP25A4O11APAAPO4PA10F4B5N3B33AIIAB3A2B15AAI51P24A35O11APAAPO4PA11F3BC4M3C33BBAB7AB15AIIAP73A48PAAPO4PA4P4O2F3BC4M3C16B15A2C8ABC11BBAIIA80O45PO4PA4P4OJ2F2BC4M3C16BA17C8AC13BAAIA2B67A9OP48OOPA4P4OJKJJF2BC4M3C16BAAI12AAC8AC14BAIIAC68BBA7OPA41PO5PPA4P4OJJKJJFFBC4M3C9BCCBC2BAABC22AC14BAIIACCB69A6OPAAP37A3PA10P4OJKJKJJFFBC4M3C9BCCBC2BABC22BAC13BAIIAC70BBA5OPAAPA36PPA2P6A3P4OLJKJKJJFC5M3C17AAC22BACCB12AIIAC69B2AAPAPAAPPAPA38PPAAP7AAP4OLLJKJKJJFB5N3B17AB23AC14BAIAC68B2A3OPAPAPPAPA39PPAP2A6P4OLLKKJKJJFBABCCM3C16BBABC15B5AAC13BAIIAC66B2A3OOAPAPAPPAPA39PPAPPAP4AAP4OMLKKJKJJFBABA22I2AB15CB3AAC13BAIIAC46BCCBC15BBA3O4PAPAPPAPA39PPAPPAP4AAPAP2OMLKLJKJJC24BAI2AB16CBBAAC13BAIIAC47BCCBC3B11A3O2J2OPAPAPPAPAPA35PAPPAPPAPPAAPAAPAP2OMLKKJKJJB25AI2AB17CAAC14BIIAC55BA14OOJKKJJOPAPAPPAPAPA13P5A15PAPPAPPAP4AAPAP2OMLKKJKJJB25AI2AB17AAC14BAIIABAB53AB7A4OOJJKJ3OPAPAPPAPA14PPA3PPA16PPAPPAPPAAPAAPAP2OMLKLJKJJA9B15AI2AB17AC14BAIIABA55C5BA4OOJJKKJJKJJOPAPAPPAP42APPAP4AAPAP2OMLKKJKJJAPIJ5ABPIJ3AAPIJB3AI2AB17AAB2AB2AAB3AAIIABAAB53C5BA3OOJJK2JKJ3OPAPAPPA44PPAPPAAPAAPAP2OMLKLJKJJAPIJ5ABPIJ4APIJB3AI2ABABAB5AB6A19BA34C25BA3OJJK2LKJ2KJJOPAPAPPAP42APPAP4AAPAP2OMLKLJKJJAPIJ5ABPIJ4APIJB3AI2ABABAB5AB6AOPAPAP3AP3A3BA2I27A5B24A2OOJK2LKLKJKJ3OPAPAPPAPA39PPAPPAP4AAPAP2OMLKLJKJJAPIJ5ABPIJ4APIJB3AI2AB17AOPAPAP3AP3A2OA2I29A32OKKLLKLKLKJKJKJJOPAPAPPAPAPA2P4A2P4AAPPA15PAPPAPPAP4AAPAP2OMLKLJKJJAPIJ5ABPIJ4APIJB3AI2A13B4AOPAPAP3AP3A2OPAI22AP7AAI28AOL3KLKLKJ2KJJOPAPAPPAPAPA2PA2PA2PA5PPA15PAPPAPPAP4AAPAP2OMLKLJLJJAPIJ5ABPA9B3AI2A3P8AAB3AOPAPAP3AP3A2OPAI21AP9AAI27AOMMLLKLKLKJKJKJJOPAPAPPAPA4PA2PA2PA5PPA17PPAPPAP4AAPAP2OMLKLJKJJAPIJ5AB14AAI2A2PA8PAAB2AOPAPAP3AP3A2OPAP20APPAPAP2AP2AAP26AOMML3KLKJKJKJJOPAPAPPAPA8PA2PA5P3A15PPAPPAP2APAAPAP2OMLKLJKJJAP7AB13AAI2A3PAAIIAI2AAPAABBAOPAPAPAPPAPAPPA2OPAP2A17PPAPAP2AP4AAPAPAPA19PAOMMLLKLKLKJKJKJJOPAPAPPAPA7PA3P4AAP4A14PPAPPAP2APAAPAP2OMLKLJLJJB22AAI2A3PAAI2AI3AAPAABAOPAPAP3AP3A2OPAP2AAJ2AJ2A7PPAPAP2AP6AP25AOK6LKJKJKJJOPAPAPPAPA7PA3PA2PA3P3A13PPAPPAP4AAPAP2OMLKLJKJJFB20AAI2A3PAAPIPIAPIPIPAAPA2OPAPA3PA3PA2OPAP16AAPPAPAP2AP7A27O5K3JKJKJJOPAPAPPAPA6PA4PA2PAAPAAP3A12PPAP2A6PAP2OMLKLJKJJF2A26PAAP4AP5AAPPAOPAAP12OP69O5KKJKJJOPAPAPPAPA5PA5PA2PAAPPAAP3A11PPAP4IPPAAPAP2OMLKLJLJJF3OPAP18A3PAP5AP6AAPAOPA15OPPA70O5JJOPAPAPPAAPA3P4A2P4AAP2AAP9A3PPAAP4IPPAAPAP2OMLKLJKJJF3OPPA11PI5A3PAP5AP7APAOPA18OP68A4O3APAPAPPA2PA35PPA2P3IPIPAAPAP2OMLKLJKJJF4OP11AAP6A2PAPPA2PAPAP5APAOPAAJ3AJ3AJJAPAPA5OP30A41POPAAP2A2P36A2P3IPIPA2PAP2OMLKLJKJJF4OP11AAP6A2PAP5AP7APAOPAAJ3AJ3AJJAAPAIAIA6OPPA72P2A40P3I3A3PAP2OMLKLJKJJF4OP11AAPI5A2PA16PAOPA14PAPAIAIA10J6AJ10AJ2A48P18AP25I3A4PAP2OMLKKJKJJF5OPPAPPAP5AAP6AAP18AOPA14IPAI2A36I34A66PAP2OMLKLJKJJF5OPPAPPAP5AAP6A21OPA13OPI2AIIAOI7P2I19AAI36A65PAP2OMLJKJKJJF6OP39A2OPAP5AP4OIPI4AOI31AAI36A2I34PA4I3AIAI11AAP4OMLKLJKJJF6OPA42OPA5PA4OPIPIPIIAOI30A77PA4IPIPAPAPIPIPIPIAAPPAAP4OLLJKJKJJF7OP13A8P11A8OPAP5A3OPPIPIIPIAOPIPIPIPIPIPIPIPIPIPIP10AI37A3I33PA4PIPIAIAIPIPIPIPIPIPAAP4OLLKKJKJJF8OP13A8PA9PA8OPA5PA2OPIPIIPIPIAOPIPIPIPIPIPIPIPIPIPIP10AIPIPIPIPIPIPIPI23A3I23PIAIAPPIPPA4IPIPAPAP10A3P4OLJKJKJJF9OP18A3PAAP8AAPA5OPA5PA2OPIIPIPIPIAOP30AIPIPIPIPIPIPIPIPIPIPI17A3I2PIPIPIPIPIPIIPIPIPIP11A3P3APAP9APA3PA2POJ2KJJF10OPPA14PPA3PAAP8AAPA5OPA5PA2OPPIPIPI2A29P2AIPIPIPIPIPIPIPI23A3IPIP2IPIPIPIPPIPIPIPIP11A3PA16PA3P4OJJKJJF11OP18A3PAAP8AAPA5OPAP8OIPIPIPI2AAIAIA3P5AAP10AAP2AIPIPIPIPI5AI3P8AP9A2P33A3PPAPAP13A3PA2POJKJJF12OP18A3PAAP8AAPA5OPAPAAPA3POP8AAIAIA3PAAP2AAPAAPI5PAAP10A28P2A35PA3PPAPAP13A3PA2POJ2F13OP18A3PAAP8AAP5AOPAPAAP3APOPI7AAIAIA3PAAP2AAPAAPI5PAAP9AP27AP39A3PPAPAP13A3PA2POJJF14OP18A3PAAP8AAP5AOPAPAAP3APOP8AAIAIA3PA3PAAPAAPI5PAAP9AP8A5P12AP39A3PPAPAP13A3PA2POJF15OP2IPPIPPIPPIPPIP2A3PAAP8AAP5AOPAPAAP3APOPI6PAAIAIA3P5AAPAAPI5PAAP9A30PAAPA29P4A3PPAPAP13A3P4OF16OP18A3PA5P4AAPA2PPAOPAPA6POP8AAIAIA11PAAPI5PAAP9A30PAAPAAP25AP5A3PPAPAP13A8F17OPPIPIPIPIPIPIPIPIAPA3P6IPIPIPIPIPIPIAOI9AOP8AAIAIA11PAAP7AAP9AAJ2AAJ2AAJ2AAJ2AAJ2AAJ2APAAPAAPA23PAP5A3PPAPAP13A7F18OPAIAIAIAIAIAIAIAIAPA8IPIPIPIPIPIPIPIAOI9AOP8A16PA8PAAP41AAPAAPA23PAP5A3PPAPAP13A6F19OOPI14P8AAIPIPIPIPIPIPIIAAOI7A2OP8A16P10AAP8A34PAAPA23PAP3IPA3PPAPAP13A5F23A41OA3IIA4OP14A32P35A32IPA3PA16PA4F24PI38A3OI7POP7I107AIPA3PPAPAP13A3F24P2IPIPIPIPIPIPIPIPIPIPIPIPIPIPIPIPIPIPIPIPAAOPIPIPI3OP5A104IIAAPAIPA3PPAPAPIPIPIPIPIPIIPA2F24PIPPIPIPIPIPIPIPIPIPIPIPIPIPIPIPIPIP8AAOP2IPIP2OP4I47PIP38AP6AAP2APPAIIAAPAIPA3PIAPAPIPIPIPIPIPIIPAAF24P2IP9A8P21AAOP8OP3IIA43I43AI6AAI2AIIAI2APAIPA3PIAIAI12PAF24OOP43AAOP8OP3I44A61I3PAIPA3PIAPAIPIIPIIPIIPIIPF26O44AAOOP7OP6JIJ30I13P56I3PAIPA3PIAIAI12F74PO9P3IA8JJK10JK10JA9I64PAIPA3PIAIAI11F85OP3IAOI6JJKJJKJ5KL10KI6AIIA41I23PAIPA3PPAIAI10F86OP3IAOI6JJKJKJ5KLK10JI6AI41AAIIPIPIPIPIPIPIPIIPI5PAIPA3PA13F87OP3IAOI6JJKKJ5KLJKL9JI4PIAIPIPIPIPI33AAI23PAIPA3PPAPAP8F88OP3IAOI6JJKJ5KLJKLK8LJIIP4AP33IPIPIIAIAAIIPIPIPIPIIPIIPIIPI5PAIPA3PIAIAI7F89OP3IAOI6JKJ5KLJKLJK8LJIPIPIPIAIPIPIPIPIPIPIPIPIPIPIPIPIPIPIPIPIPIPIPI3AAI23PAIPA3PIAIAI6F90OP3IAOI5JJKJ4KLJKLJK2L7IP6AP31IPIPI5AAI23PAIPA3PIAIAI5F91OP3IAOI5JJKJ2KKLJKLJKKL8KIIPIPIPIAIPIPIPI6PIPIPIPIPIPIPIPIPIPI2PI5AAI23PAIPA3PIAIAI4F92OP3IAOP5JJKJKJKLJKLJKKLKL7KP7AP2IPI20PIPIPIPIPI6AAI23PAIPA3PPAPAO3F93OP3IAOP5JJKJJKLJKLJKKLKL8KP7APIPIPIPIPIPIPIPIPIPIPIPIPIPIPIPIPI8AAI23PAIPA3PA6F94OP3IAOP5JJKJKLJKLJKKL11JP7API22PIPIPIPIPI8AAI23PAIPA3IIAIAAIF95OP3IAO30PPAPPAP2APIPIPIPIPIPIPIPIPIPIPIPIPIPIPIPI10AAI20AIIPAIPA3IIA2IF96OP3IAP39API20PIPIPIPIPI10AAI20AIIPAIPA3O4F97OP4A41P8IPIPIPIPIPIPIPIPIPIPIIP4I5AAI23PAIIA7F98OP51IPIPIPIPIPIP25A5P20AAP7F99O125"
F7_Ship_02 =
	"0c000140F3C3F2C3BFFC3BCFC3BC5BC2B7AAJJAAJJA7C7BC30B7A15C38B8A15C10B4CBBA4BA16P5AAJ5AAK5C2F4B3F3A3BBFFA5BFA6BP4AABJ4PAAKKJKJPA2P6AP6AAP5FAAI4A31P23I7A31P3APPAP3APPAP4APPI5AIA34I4A15I7A31I5AIA6IA4IIFI4F2A31"

function loadFrame07Sprites()
	loadExtendedSprite(unpac_noheader(F7_Ship_01), "F7_Ship_01", 226, 83, 5)
	tomem(unpac(F7_Ship_02))
	loadSprite("F7_Ship_02", 40, 12, 5)
end

-- Frame08
F8_Module_01 =
	"0c000300F124C2F38CF2C20F20C2FFC35NNF2CBBFFC5BBC21NNC2N4CN12CCF7BF6CB2F3CN2BBFFN5BBN3C3NC5DC3D2BF31BF6CB2F3DB5FBC5BF55BBF276CF4C2F2C4FFCDMMCCFFCD2MMFCD5FCD5FFC42N2M2N4D2M2NNC20N2C2N18CCN2C9D2C2N18CCN2C10DDC2D2BBD2B2CCB2C4N3C3NC4DDC2D2BBCDDB2CCDBBC4BC11D2C3D3CD2B2CDB2C3BC13DC3D2CCD2C3DC6MMC18BBC2DDCCBBDDC39B2F2C4B3C6B3C5B3C6B2C9B2C2F15BBF5CCB2F2C4B3C6B3C5B3CCF39B2F4C2B2FFC5BBF55BF70C2D4C4D2C17BC6BC6BC12DDM5DDM3D2M4DDCNM2D2CN3D2CN3CCDCN3C3N3C5DDB2MMDBBC2D2BDMMCDDBD3MDDBD5BD6BD6BCCD3C23MC6DM2C3D3M3D6MD7CCD5CD6C3D3C5DDC7MC6M2C4DM4CCDDM2C2D4M2D15CD6C2D4C5DDC14BC4B2MMC4BDDM2C2D4M2D23B9O4BBO6CB2O3C3BBOOMMC3BPD3CBBPD3B3C4B5C3BOB3CCBO2PB3OOPPB3P4B2P4BBCP4C2BC6B2C4B4C2B5CCB3C3BBC12BC3B3CBBF4C2B2FFC5BBC5BBC3B3CB12AAB2A4F15BF6B2F4B3F3B5FFAAB5PPA2B2FFC5FFPOC3FFPO2CCFFPO3PFFPO3PFFPO3PFFPO3PFFP2O2CN3C3N3C3N3C2PN3C2P2NNC2P5CCP6AOOP4ADBC4DDBCBC3DBCBBC2DBCBBC2DBCBCBCCDBCBCBCCDC4BCAPC5D7CD6C3D3C5DDC31D3M3D6MD15CD6C2D3BC5BBC5BPC7MMBBC3DBBPC3BBPDMMCCBPD3MMBPD5PD14CCD5C4D2C6DC7MC6DM2C3D3MMCCD5MMD2B4D2B4DDB2C3BBC18BBC2B4CCB5PPC18B2C2B11AB4A2B2A10PPCCB12AB3A3BBA4PA4P2AAP21BA4PPA3P2A2P3AAP5AAPPAPPA2PPAPPA2P3AAOAP3AOOA2PPAABBAAPAPABBAAPAPPBBAAPAPPBBAAPAPPFFAAPAPPFFAAPAPPFFAAPAPPF4PAPPOF3PAAPF3PPAAF5PPF31O3P2APPO4PAAPPO3A3PPOOPPA3PPFFP2A2F4PPAF6PAP3C2P6COP6O3P4O4PPAPPO4A2P2OOPA4PPC15PPC5P3CBCCP3C3P4C2O2P3CO4P2C5BPC5BPC5BPC5BPC5BPC5BPC3BCBPPC4BPC2D4C4D2C47D23CCD5C4DDBC6BC5BBC2BBCBBDCB3AADB2A3DBBA2PPB2AAPPABBA2PAABBAAPA2BA2PA5PA6P4AP10AP6AP2AP6A2P4A4P2OOA4P67AOAOAP2AOAOAPPAOAAOAPPAOAAOAPPAAO2APPA5P3A3P5A3PAPPFFAAPAPPFFAAPAPPFFAAPAPPFFAAPAPPFFAAPAPPFFAAPAPPFFAAP3F130PPA4F2P2AAF5PPF39PPO5AAP2O2A4PPOPPA4PFFP2A2F4PPAF6PF7P3CCBPOOP3BPO4P4O4PAAPPO3A3PPOOPA4PPFPPA4C7PPC4BP3AC2P3AAPCOOPPAAPPO3P4O4PPAPPO4CBBCBCB2C2BCB3CCBCBBCCB2CBBPPC3BBP3CCBBP5BBOP4OOPAAPA3PAAPA3PAAPA3PAAPA3PAAPA3PAAPA3PAAPA3PPAPA3OAOOA2POA2OAAPOA2OAAPOAAOAAPPOAOA2PPOOA2P2OA2P3A2P87AP6AP9AAP3AAP3AAPPFFAAPPF3AAP2F2P4F2PAPPF3APPF4PPF288P2AAF5PPF47A2P2OOA5P3A5FFP2A2F4PPAF6PF15O2P2O6POOPPO5AAP2O2A4PPOPA5PFPPA4F2P2AAPPAPA3PPAPA3PPAPA3PPAPA3PPAPA2OPPAPAAOP2AAPAOPAPA2P2A2P4AAP2APPAP3APPAP12AAP3AAP3AAPPFFAAPPF3P5AAP3AAP3AAPPFFAAPPF3PPF29PPF149A39F23A39F23A39F23A39F23A39F23A39F5PPF15A41PA4PPAPAAPPFFP3FFA39PPF21A39F23A39F23A39F23A39"

F8_Module_02 =
	"0c0002c0F124C2F44C2FC14F28C2FFC29F5CCF2C34NNC2N4CN6CBBF4C2B3FC4NNBC2N4CN12CCN3C3NC5DF15BBF5NNB3FFNC3B2C2D3BCDDB3CDBBC4F31BF6B4F2C5BBC7F55CCBBF71A3F3A3F3A3F3A3F3A3F3A3F3A3F3A3F6CF5CMF4CDDF3CD2F2CD3FFCD4FFCD4FCDDCCDDC7MDC5DM2C3D3M2CD6MD22MC28N2M2N4DM4NNM12D2C5NNC2N18CCN2C10DDMCCD2BBDMMB2CCN5CCN3C3NC4DDC2D2BBCDDB2CCDBBC4BC18D2BCD2B2CDB2C3BC13BC4BBC3BBC4BC4BC12BBC3BBC3BBC3BBC11PPC2P2BBCPPB4C7B7C3PPBBCCPPB3PPB11AAB3AAPPBA2P3B2IBBFFBI4BFBI5B5I2A2B2IIP2AB2IPAPPAC2PAPBC3F23BF6IBF5IIBF4B2F4CCB2F6A3F3A3F3A3F3A3F3A3F3A3F3A3F3A3FCDDCDC3PDCD2CCPOCBBDCCPOCPJBCCPOCPJKCCPOCPJKCCPOCPJKCCPOCPJKD5MMCCD2M2DDCCM3BDDM4KBBM4K2B2MDK4JBBK4JKKM3D3M2D4MMD5MD5C2D3CD2CCDCD5C2DB2CD2CDDCMMC2DCD2M2CD29CD5CDCD3CDDC15MMC5DCMMC4D2MMBBD4CCPD3CCPJD2CCPJJCCBC3PCCBCCPPBCCBPPB10DDB3AAPDBBAAP2CBBAPPAPCBBAPPAPB5AB4AAPBBA2P2AAP12APPAPPAACPPA2C2PAC5AP4AP6AP3A2CCPA2C3AC12BBC3B3CCB5PABC18BBC2B4CB5AB4A2B2A10PPC3B2FB17A3BBA3PPA3PPAAP4A2PAPPA3PAF3A3F3A3BBFFA3B3A4B2A5BBA3PABBA3PPBBA3C2PCPJJFFC2P2FFPPC3FFP2ACCFFPOOAOPFFPOOAOPFFPO2AOFFPO3AJK3JKKJ2KKJKKPPJ3KKCCPPJ3PCNNP2JP2N2CPOP3NCCAOOP3CK2BBD2K3JBBDK3JKKBK3JK2JJKKJK2PJ3K2CPPJ3KC2PPJ2DC3D5C2DDBBCD2CCKKBBD2CK3BBPCK5PCK5PCJK4PCDDCCPJ2DCCPJ3CCPJ4CPJ4PBIIJ2PDBJJIJPDBBJ2PDB2J2PCBAPCBBAPPCJPB2C2PCBBC3DBBPC3BBADMCB2AD3BBAD3B2D4BBAC6BC4B2CCB12AB3A3BBA4PA4P2AAP5B5AAB2A4BA4PPA3P3AAP21AP6A2P4AP4AP6AP23AP6AP5AOPPA3PAPA4PAPA4PA2OA2PAAOOA2PAOAOA2PAOAOA2PA2OA2PAPPBBA3PPFFA3PPFFA3PPFFA3PPFFA3PPFFA3PPFFA3PPFFA3FFP2OOAF2PAPPAF3PAAPF3PPAAF5PPF23A2OOP5AAOOPAP3AAOAAP5A3P5A3PPFFP2A2F4PPAPC3P5C4OP3C2AO2P5AAOOP6AOOAP5A3P4J2K2PCPPJ2KPC2PPJJPC4P2CPPC5P3C3OOP2C2PAOOPC2BJ2PCBPBJ2PCBPBJ2PCBPBJ2PCBPBJ2PCBPBPJJPCBPBCP2CBPB2CPCBPD3B2ACCDB2AAC2B2AACCB2PAACCBBPPAPCCBBPPAPCCBBPPAPCCBBPPAPAPPAP3APA2P3A5PPA10OOA5OAOOA3OA6OA3P22AP6A2P4A2P4OAAP4OAAP10AOP5AAP5AAP38A2OA2PAO2A2PA6PA6PAPPA3P5AAP14AP3FFA3PPFFA3PPFFA3PPFFA3PPFFA3PF2A3PF2A3F3A3F70PF55PA4PPFPPA4F2P2AAF5PPF31P2APPCCP3APCCAAPPAPPCA6P2A5FFP2A2F4PPAF6PB4CBPB6PC2B3P2C2BPA2PPCCPA4P2A6PAPA6CCBBPPAPCCBBPAAP2BBPAAP2BBPAAPO3PPAPO3PPAPO3PPAPO3PPAPA3OAAOA3OAOA4OOA5OA9PA6PA5PPA4P2AAP5AAP5AP31AP6AP3AAP6AP21AAP3AAP3AAPPFFAAPPF3PPF5P3APPFPPAAPPFFAAPPF3PPF41A3F3A3F3A3F3A3F3A3F3A3F3A3F3A3F256PPA3PF2P2AAF5PPF39PO2PPAPAPPOPPAPA2P2AP2AAPPAAFFPPAPAAF3P2AF5PPF7A4P2A2OP3AAOP5AOP2A2P2AAPPA3PPFFAAPPF3PPF5P3AAP3AAPPFFAAPPF3PPF169A3F3A3F3A3F3A3F3A3F3A3F3A3F3A3"

F8_Module_03 =
	"0c000340F174CF2C12F28C2FFC29F5CCF2C34NNC2N4CN6CBBF4C2B3FC5NBC2N4CN12CCN3C3NC5DF15BBF5NNB3FFNNC3BBC3D2BCD2B3DB6F39BF6BBF5B2F261A6FA6FA6FA6FA6FA6FA6FA6F22CF4C2F2C4FFCDMMCCFFCD2MMFCD5F4C2FFC42N2M2N4C28N2C2N18CCN2C10NNC2N18CCN2C10DDC2D2BBD2B4N5CCN3C3NC4DDC2D2BBCDDB4DB3C2B2C9D2C3D2BCD2B3DB4CCB2C11DC3D2CCD2C3DC6B2C3BBC11BBC2DDCCBBDDC27B3F5CCB2F2C4B3C6B3C5B3CCB7C7F23BBF5CCB2F2C4B3CB11PPF39BF6B2F4PCCB2F130A6FA6FA6FA6FA6FA6FA6FA6FCD5C2D4C4D2C17BC6BC6BC4D2M2NNDDM5DDM3D2M4DDCNM2D2CN3D2CN3CCDCN3C7D2C2DDB2MMDB3CD2BBMMCDDB2DDMDDBBD4B2D4BBD4B4C2BBC21MC6DM2C3D3M3D6MC3D3C2D4C4D2C23MC6M2C4MMC5DDM2C2D4M2D7CCD5C4D2C6DC11BBC4BC6BC3MMCBC3DDMBMC2DDCDDM2DCD5BD6C47MMC5D4C4BP2C6B2C6BCN2C4N5CCN3C3NNC2BBC3B3C5B2C6B2C8BC5B3CB21CCBF6CBBF4C2B2FFC5BBC6BBC3B3CCB4CB4AAF23BF6B2F4B3F3B5FFAAB5FA6FA6FA6FA6FA6FA6FA6FA6C27PPC5P3C3PAOPC3PAOOC3PAOOCN3C3N3C3N3C3N3C3N3C3N3C3N3C3N3C2DBBCD4BBC3DDBBC4DBBC4DBBC4DBBC4DBBC4DBBC4D15CD6C3D3C5DDC23DM4CCD3M3D6MD15CD6C2D3BC5BBC5BBC3B2PMMB2PPCDBBPPC2BBPDMMCCBPD3MMBPD5PD6BD14CCD5C3D3C6DMC6DM2C3D3MMCCD6CD14BD6BD5BBCCD3BBC3DBC4BCCBBCCB20CB4CCB3CCB2C2B3AB4A2B2A4B3CCB3CCB3CCB4AB3A3BBA4PA4P2AAP13B2A4BA4PPA3P2A2P3AAP5AAPPAPPA2PPAPPA2P3AAOAPPA2B2AAPPAABBAAPAPABBAAPAPPBBAAPAPPBBAAPAPPBBAAPAPPBBAAPAPPB2A6BA6BA6BA6BA6BA6BA6BA6BC2PPOOFBBCCPPOFFB2CCPF2B3CF3B3F6BF15CN3C3N3C3N3C3N3C2BPN2C2BBPPNC2FBBP2CCF2BP2BDBBC4DB3C2DB4PCDB4PPDB4PPDB4PPDB4OOBCB3OOC23PPC5P3CBCCP3C3P3C3O2PC9BPC5BPC5BPC5BPC5BPC5BPC5BPC3BCBPD7C2D4C4D2C39D5MMD23CCD5C4DDBC6BC5BBC3B3DCB3AADB2A3DBBA2PPB2AAPPABBA2PAABBAAPA2BA2PA8PPA2P4AP10AP6AP2AP6A2P4A4P70AOOAP2AOAOAP2AOAOAPPAOAAOAPPAOAAOAPPAAO2APPA5P3A5PAPPBBAAPAPPBBAAPAPPBBAAPAPPBBAAPAPPBBAAPAPPBBAAPAPPBFAAPAPPFFBA6BA6BA6BA6FA6FA6FA6FA6F68P2F6PF47BBCB2P2BBCBBAAFB2CPAAF5PPF31O4C2PPO2C2AAP2OCCA4PCCPPA4CFFP2A2F4PPAF6PC5BPC5BPC5BPC5PPC5OPAC4OOA2C2OOPA3CPPC69BBCCNNCCBBCCNNCCBBCCNNCCBBCCNNCCBBCCNNCCBBCCNNCCBBCCNNCCB2AAPA3BAAPA3BAAPA3BAAPA3BAAPA3BAAPA3BAAPA3BAAPA3OOA4POAOOA2POA2OAAPOA2OAAPOAAOAAPPOAOA2PPOOA2P2OA2P73AAP18AP6AP9AAP3AAP3AAPPFFAAP3FFAAP2F2P4F2PAPPF3APPF4PPF22A6FA6FA6FA6FA6FA6FA6FA6F256PPA4F2P2AAF5PPF39BBC5AB2C3A2B2CCPPA2B2FFP2AABF4PPAF6PF7CCNNCCBBCCNNCCBBC2NCCB2C4B4C2BBAB3CBBPAAB4FPPAAB3PAPA3BPAPA3BPAPA3BPAPA3BPAPA3BPAPA2OBPAPAAOPBPAAPAOPA2P4A2P4AAP2APPAP3APPAP12AAP3AAP3AAPPFFP13AAP3AAP3AAPPFFAAPPF3PPF21AAPPF3PPF118A6FA6FA6FA6FA6FA6FA6FA6F31A31F31A31F31A31F31A31F31A31F31A31F2P2ABF5PPF15A31BPA2P2AAPA4PPAPAAPPFFP3FFA33PPF3PPF21A31F31A31F31A31F31A31FA6FA6FA6FA38"

F8_Module_04 =
	"0c000280F310CF3C3F36C2FFC21F13CCF2C33D2CCD2B2FC5FC22DC2D3BD2B3CB2C2DDC2D2BBF7C2F4CCDDCCFFDDBBC2FBBCCDDBBCD2B3DB14FFA5FFA5FFA5FFA5FFA5BFA5BBA5IFA5F124C2F37MMF2CM3C15F14CF3C2BFC6M2C4M6CM7C3DDMOFC14B2C7B4C6BCCDDB2CMO2C2DOM2NDDBC5DDC2D2BBCDDB2CCB2C3DB3CDDBCCD2B2DDB13DDB2C2BBC2D2CCD2B2DDB27AAB2A4D2B26AAB2A2IIBA2IIPIAIIAPIIPIPBAIPPIB5IIB2AAIB2AAIAB2AI2AB2I2PAB2P3ABP2IPAAP5AP2FIFA5BFA5BFA5BFA5FFA5FFA5FFA5FFA5F14CF3M3F2D4FFD5FBO2D2FBP2O2BAAOOP2FFC13DC6M6CD6MD7OD6PO3D2C12D2CCD2B2DDCBBC2M2CCD7B2DDBCB3DBBCB3D3BBCCB2C2DDC2D2BBD2B31NB3M2NNBPBDN3BPBBN3BPBBN3BPBBN3BPBBN2OBPBBNNOOBPBBNO2BPB14AAB2A2IA4IAPAAIIAIA3IIA3PAPPAP2AAP2A6IIA4IIPAAIAAIPA2PAP2AAPPAP2AAP3A2P2A2P3BP4BBAPIPAPIPPIPBAP6AP5BAP4BBAP3B2AP2FBBAAPPFFAAP3FFPPFPPF2PPF5PFFPPF3PPF38A5FFA5FFA5FFA5FFA5FFA5FFA5FFA5BAO5BOP2O2BOPA4BOPAO2PBOPAO3BOPAOONPAOPAONOPAOPAONOPOP3O7PPOAO2POPAPA3OPAO2PPOPAO3POPANNOOPOPAOONOPOPAB2PB3ABBPBBNBOPBPBBNBOPBPBBNBOPBPBBNBOPBPBBNBOPBPBBNBOPBPB4N2B3N3B3N2B4N2B4NNB5NB5PB3P2B2PPB4NO2BPBBOONNBPBBN3BPBBN2PPB2NPPNB2PPN2BAABNNA3PBA3P2A5PPA2P3BAP3BBAAPPBBAAPABBAAP2AAP4FP3F3PPF5PPB2AAPBBA2P2AAP4FP3F3PF30P3F3PF120A5FFA5FFA5FFA5FFA5FFA5FFA5FFA5BOPAONOPBOPAOONPFBOPO2PFBOPO2PFFOPA2OFFOP3AF2O2PPF2O6NOPOPAOONOPOPANNOOPOPAO3POPAO3POPA4OPPAP3OPABOP2OPABOPBPB2POPBBP2BOPB5OPB3AAOBPA3PBA3P2AAP4FP3F3PPB3AAB2A3PA4P2AAP4FP3F3PPF21AAP4FP3F3PPF303A5FFA5FFA5FFA5FFA5FFA5FFA5FFA5F5OOF7A47O3PABFFO2BBFFA47PPF13A47F15A47F15A47F15A47F15A47F15A47F15A47FFA5FFA53"

F8_Module_05 =
	"0c0001c0F185OOFFOOF30NF5NOF3O3FO14F13OOFFN3OON2O2NO3NO2NO3NO7NO3PPNNOOFO4FFO6FO14PO4PPONOP2O2NPO3PPO2P4F2A4F2A4F2A4PFFA4OFFA4OPPA4P2A4P2A4F29OOF2N4FFNO4FND3BBFC3DDBF11OP2FO22NO7NO2P2BONPPO6NO2PO3NO2PO3NO2PO2NPOOPPO2NPPOPO6POOPPOP2OPPAO6PO2P3NP3N2ON3O2PNO2P3OP24N2O2NNO2P2OOP3AP6AP6AP7AP3A3PA3P2OP6OPAP4OPAP4OP3A2OPA3PPA2P2FFP2F12P2A4PPFA4F2A4PFFA4F2A4F2A4F2A4F2A4C6BC2MMCCBC2MMC2B3MC2FCCMB3FCCMMC2FBCMMC2FBBC4BBONOOPPBBONP3BBONP3BBONP3BBONP3BBONP2ABBONA3BOA3P5OPPAPPAPOPPAPPAPOP6OA2PPA4PA3P2FAP2F3PF6P5AAP2A3PA4PPFAAP2F2PPF29AAP2F2PPF120A4F2A4F2A4F2A4F2A4F2A4F2A4F2A4FFBBC2BF3B3A47BOAP2FFAPPF4A47F15A47F15A47F15A47F15A47F2A4F2A52"

F8_Module_06 =
	"0c0002c0F181CCF3C3F29CCF2C18BBC2B2PJF5CCF2C19BC3B2PB2P6J2P2JPJ3PPF7C2BF3CB2F3B4F2PB3F2PPB3FFPPBCCB2PC4ABF55BF202A3F3A3F3A3F3A3F3A3F3A3F3A3F3A3F38CF4C2F2DC3FFDMMDCCF11C3FFPM2DCFCD3MMPD14CCD5CDDBBD2C13BBC2B2PJMBBPPJPJDPJ3PJDPJ3PJDPJ2P2DPJPPC2B2PPJ2PPJJPJ6PJ6P3JJP2CCDPPCD3C2D2A2D2AAB2JPJ2PPCJP3C2PPC2DDACCDDA2BDDAAB3AAB2O2B2O3PO3P3C2A4DAAB2OOAB2O3BBO3PNO3P2NOP5NP6NP5OOBF6BF6O2F4NNO3FFN4O2N15OON5F31OF6O3F3N2O2FFN5OOF55OF74A3F3A3F3A3F3A3F3A3F3A3F3A3F3A3FD4MMFD14C2D4C5DBC23DBBC4DBDMMC2BD3MMCBD5MD15CCD5C4DDBDPPC3DC5AAC3AABBMA2B2ODABBNNMOABBNNMNNBBN4MBN6DAAB2OOB3O2PBO3P2O2P4O3P3MO5PN2MO3NNMNNMO3P20OP3O3PPO4P3O3POOP3O6P6O2PPO5PO15PPO5PPO21PO4NNPO54N7ON6O3N3P2O4P2O10PPO3PPO3PPO3NO2F3N3O2FN5OON6OONNO4PO20PPF15OOF5O4F2O5PPOOP3AAP3AOOP2AOOPAAF3A3F3A3F3A3F3A3F3A3P2FA6PA3PPA5C3D3C2DC5DCCPOC2BCPO2CCBCPO2CCBCPO2CCBCPO2CCBCCPOODC5ADDC4BCDDC3BCCDDC2BOCBBC2BOCDDC2BOCBBC2BOCBBC2ABN6BO2N3BO4NNBO6BO6BO4POBO4POBO4PON23ON6O2N4O5NNO23N2O4NNONNO2N3MN9ON15OON5P2O3POOP2OOPO3P3O5PPNNO5N4O2N3ONNON7PO5PPO3PPOPOP2O2PPO20PO4P2NOOP2AAPPO19PPO3P3OOP3AOP2AAOOPPAO2P2OOP5O2P3AOP3AOOPPAAOOPPAAOOP3OOP29AOOPPA2OP2A3P3A4PPA5PPA4PPAAOA2PPAOOA2PAOAOA2PAPA4PAPPA3PAPPA3PAPPA3PAPPA3PAPPA3PAPPA3PAPPA3C2BCCPOFFCCBC2FFPPCB2FFAAP2CFFPA3PF2PPA2F4PPAF6PCCBBC2ACBBC3B2C4BC5BBPOC2BBOAP2O3A3PPOOPA4PPBO4POBO4POBO4PO6PO2PO2PO2P2O5P3O6PPO4POPO4PO6PO6PO6PO6PO6POOPPO10N2O6NO47N15OON5O3N2PO5NPO5PPOPO3PPO2POOPPNOPPAAOOP2AOOP3APPAP3APA2PPAPA4PAPA5PA3OOAPA3OAP9AP6AP12AP6A2P4A4P2OOA2P67AOAOA3OAAOA3OAAOA4O2A10PPA5P3A3P5AAPAPPA3PAPPA3PAPPA3PAPPA3PAPPA3PAPPA3P3A3P2FA3F64P2A3F3PPAAF5PPF39P2O4A2PPO2A4P5A4F2PPA2F4PPAF6PF7P3OP2O2P4O4P4O5AAPPO3A3P2OPA5PFP2A3O7PPAO4PPA2O2PPA5OOPPA3O3P2APO5PAP2O6POOPPO2POOPPO2POOPPO2POOPPAAOPOOPPAAPPOOP5OOPPOP2OOPPAPA3OAAPA3OAAPA3OAAPA3OAAPA3OOAPA3OAAPA6PA7OAAP2AAOAAP2AOAAP3OA2P3A2P4AAP5AP6AP60AAP3AAP10AP4APAP3AP4AAP3AAPPFFAAPPF3PPF13P2FA3PPFFA3PF2A3F3A3F3A3F3A3F3A3F3A3F195PPAAF5PPF47A3PPOOA5P4A4F2PPA2F4PPAF6PF15O2POOPPO5P4O2PPA2PPOPPA4P3A4PPFP2A2PF3PPA2PA6PA4PAPA4PAPA2OPPAPAAOP2AAPAOP2A2P2AAPA4P4AP6AP9AAP3AAP3AAPPFFAAPPF3PPF13PPAAPPFFAAPPF3PPF113A3F3A3F3A3F3A3F3A3F3A3F3A3F3A3F15A47F15A47F15A47F15A47F15A47F5PPF7A48PAAPPFFP3F3A47F15A47F15A47F15A47F3A3F3A51"

F8_Module_07 =
	"0c000240F118OF3O3F29OOF2O4FO20PPF4OOF3O26PPO2P4OP14F7OOF5O4F2PN2O3PN5OPN6PN6O3N3F31O2F4NNO2PFFN4O2N7F47PF6O2F74AAF5AAF5AAF5AAF5AAF5AAF5AAF5AAF14OF4O2F2NNMOOFFN5FFN13ON6FFO20PO4P2MO4PPNNMO4N4MOON5OMO3P3OP20OOP3O4P3O6P3O6P6OOP2O4PO38P2O11NO55N7OOPN4O5NNO29PPO3PPOON2O2FFN5OON7ON6O2NNO2P2O20F7OF6O3F3NO5FO11P3OOP3AOP3AOOPF5AAF5AAF5AAF5AAPPF3A3P2FAAOPA2PA3PPA3O2N4O4N2OOPO6P2O4POOPPO2PO3POOPO6PO4N4ON5ON5ON3O2N4O4N2PO7P2O4POOPPOONNO5N3MO2N6MN23OON5O3N3OOP2O6P2O6PPNNO5N3O3N3ONNON2ON5ON4O14PPO2P2OP3O19NO5PN2MOP2OP2O3PO20PPO3P3OP3AAOP2AO2PAAOOP3O4P2O2P3AP3AAOOPPAAOOPPAO2P3OP23AAOOPPAO2P2AAP5AAPPAPPA2PPAPPA2P3AAOAP3AOOAP2AOAOA2PAPA4PAPPA3PAPPA3PAPPA3PAPPA3PAPPA3PAPPA3PAPPAAOOPO6PO6PO6PO6PO7NNO7NNOP2O3NOPO3PPOPO6PO6PO5PPO6PO6PO5NPO12NP2O7PPO7P2O6PO6PO6PO6PNON5ON6O3N3O5NNPPO7PPO7PPO6POON3PPAAN2PPAOONNPPAPPANP2APAANPPAPA2P2APA2PPAPA3PPAPA3OOP9AP6AP2AP6A2P4A4P2OOA4POAOOA2P67AOAOAPPAOAAOAPPAOAAOAPPAAO2APPA5P3A3P5AAP7AAPAPPA3PAPPA3PAPPA3PAPPA3PAPPA3PAPPA3P3A3P2FAAFPAPPO2FFPAAPPOF2PA2PF3PA2F4PPAF6PF15ONNO7N2OOPPO3NNAAPPO3A3PPOOPA4PPFPPA4F2P2AAO6PO6PO6PNNO4POON2OOPPO3NNPAPPO3NA2P2O6PO6PO6POOPO3PO6PO6POONO3PO2NNOOPOOPPAPA3PPAPA3PPAPA3PPAPA3PPAPA3PPAPA3PPAPA3PPAPA3OA2OAAPOA2OAAPOAAOAAPPOAOA2PPOOA2P2OA2P3A2P4A2P66AAP10AP6AP9AAP3AAP3AAPPFFAAPPF3PPF5P4FAAPAPPFFA2PPF2AAPPF3AAF5AAF5AAF5AAF5AAF69PPF55A5P3A5FFP2A2F4PPAF6PF23O2NNPOOPPO5AAP2O2A4PPOPA5PFPPA4F2P2AAF5P3APA3PPAPA3PPAPA3PPAPA2OPPAPAAOP2AAPAOPAPA2P2AAPA6P2APPAP3APPAP12AAP3AAP3AAPPFFAAPPF3PPF5P3AAP3AAPPFFAAPPF3PPF107AAF5AAF5AAF5AAF5AAF5AAF5AAF5AAF15A47F15A47F15A47F15A47PPAPAAPPFFP3FFA47F15A47F15A47F15A47F5AAF5A49"

F8_Module_08 =
	"0c000240F118OF3O3F29OOF2O4FO12NNO3NNOOF4OOF3O18NNO3NNO2N2O3NO14F7OOF4PO4P4O7P2O7P2O15F7PPF5P4F2P6FO2P3FO4PPFP2O7P2OOF47PF6O2F74AAF5AAF5AAF5AAF5AAF5AAF5AAF5AAF14OF4O2F2NNMOOFFN5FFN13ON6FFO12NO5NNO4N2MO3PPN2MO3PN4MOON5OMON2O3NO14N2O4N4O2PPN5OOP2N2O4P2O47N2O4N5O47PPO3PPO3PPO9PPO6PO4PPO3PPO3PPO3PPO3P2O2P10AAPO4FFP3O7PPO3P4OP4O2PPAAO3A4O2A2O4F7OF6O3F3O6FO11P3OOP3AOP3AOOPF5AAF5AAF5AAF5AAPPF3A3P2FAAOPA2PA3PPA3O2N4O4N2OOPO6P2O4POOPPO2PO3POOPO6PO4N4ON5ON5ON3O2N4O4NNOPO7P2O4POOPPOONNO5NNONMO2NON4MON22OON5O3N3PPN5OOP2N2O4P2NNO5N3O3N3ONNON2ON5ON4PPO3PPN2P4N2P3APPNPO19NO5PN2MOP5A4PA5OA3O3AAO3PPO3P3OP3AAOP2AO2PAAOOP3AO3P2O2P3AP3AAOOPPAAOOPPAO2P3OP23AAOOPPAO2P2AAP5AAPPAPPA2PPAPPA2P3AAOAP3AOOAP2AOAOA2PAPA4PAPPA3PAPPA3PAPPA3PAPPA3PAPPA3PAPPA3PAPPAAOOPO6PO6PO6PO6PO7NNO7NNOP2O3NOPO2PO2PO2PO2PO2PO2PO2POOPPO2PONOPO2POPOPO2POPNPO2POPO6NO10N3OON7P3N2PA3PPNAP3APNAP3AAPNON5ON6O3N4O4N3O5N2PO3N3PO2N4POON3PPAAN2PPAOONNPPAPPANP2APAANPPAPA2P2APA2PPAPA3PPAPA3OOP9AP6AP2AP6A2P4A4P2OOA3OPOAOOAAOP67AOAOAPPAOAAOAPPAOAAOAPPAAO2APPA5P3A3P5AAP7AAPAPPA3PAPPA3PAPPA3PAPPA3PAPPA3PAPPA3P3A3P2FAAFPAPPO2FFPAAPPOF2PA2PF3PA2F4PPAF6PF15ONNOOPOPO2N2OP2O3NPAAPPO2PA3PPOPPA4PPFPPA3PF2P2APAPOOPAPAAPOOPAPPAPOOPAPOAPOOPAPOAPOOPAPOAPPOPAPOAP3APOAP3APOPN3POOAPNP2O2AOP2O2AOP2O2AOP2O2AOP2O2AOP2OOPAOP2OOPPAPA3PPAPA3PPAPA3PPAPA3PPAPA3PPAPA3PPAPA3PPAPA3OA2OAOPOA2OAOPOAAOAAOPOAOAAOPPOOAAOP2OA2OP2A2OP3AAOP66AAP10AP6AP9AAP3AAP3AAPPFFAAPPF3PPF5P4FAAPAPPFFA2PPF2AAPPF3AAF5AAF5AAF5AAF5AAF69PPF55AP3AP6AP2AP2APPFPAP4FFPPA3F3P2AF6PF7PAOP2OOPAOP2OOPAOP2OOPAOP3OAAOPA2P3A4PFFP2AAF5P3APA3PPAPA3PPAPA3PPAPA2OPPAPAAOP2AAPAOPAPA2P2AAPA5OP2APPAOP2APPOP12AAP3AAP3AAPPFFAAPPF3PPF5P3AAP3AAPPFFAAPPF3PPF107AAF5AAF5AAF5AAF5AAF5AAF5AAF5AAF15A47F15A47F15A47F15A47PPAPAAPPFFP3FFA47F15A47F15A47F15A47F5AAF5A49"

F8_Module_09 =
	"0c000280F118CF3C3F29CCF3C3FC4PPC3P3CP5BF5CCF3C3FC3P2C2P4CP5BP3B2OPPBBO3BBO5CCP2F2P5FFP6FPB4PFBOOB2PFO5BFO2NNO2P3N3F47OF2C3OOC3PPF47P2F4P3F133A5FFA5FFA5FFA5FFA5FFA5FFA5FFA5F14CF4C2F3C3F2DDCPPFFD2P2FD3PPBFD2PPBBFC5PC4P2CCP11BBP2B2OOPBBO4BO5PNMO5P4BBOP2BBO2B2O10PPO2P4OP13COP3C2O5PPO2P4OP13CP4C2PPC4PC4P2C2P9NNCP3C3PPC4PC3P3CCP29C2P4CP29NP4BBNP2BBO2B2O2PCP4F2PB2PF2PO2PF2N3O2FN6CN3C3OC4PPC3P3F24C3P2C2P16B3PPBBNO2F31PF6PPF5BPF5O2F6A5FFA5FFA5FFA5FFA5FFA5FFA5FFA5D2PPBNND2PPBNNCDPPBN2CCPPBN2CCPPBOONCCPPBO2CCPPBO2CCPPBOON4MO2N5MON22DN6DO3NNDDPPO3DDOOPC4OOC3PPNDDCP3D2P3BD2PPBBODDPPBBNNDPPBN3DPPBN3P23BOOP2BBO5PPMO6N2MO2CN5DDP4B2P2BBO2B2O3CO3C3POC10P2C2P4CP4BBO3C3OOC4PC3P3CCP11BBP2B2OOPBBO4BO6CP5BP4BBOPPB2O2BBO18NOPO2NP3ONP3AABBO12NO4NPPO2NP3NP3AAOP2AO2PAAOOP3OOP3APO3PPFFP3AAP3AOOPA2OOPAAPPOPPA2PAPPA3PAPPA3PAPA4PAFFA5PFA6PA13PA6PPA5PPA5PPA5CCPPBOONCCPPBOONCCPPBOONCCPPBOONCCPPBOONCCPPBOONCCPPBOONCCPPBOONP3OOCDP2OPPCCP2O2CCP2O2CCP2O2CCP2O2CCP2O2CCP2O2CCPPBN4PPBON3PPBO2NNPPBO4PPBP2OOPPBPOOP3BPO3PPBPO3N4D2N3D3N3D2PN2D2PPO2D2PPO2CDPPBPPOCCPPBOOPCCPPBP3BBOOPPBBO3PBBNNO2BN5MBN13PN5PPOON2P2O4N2O2NNP2ONNP3ANP2AAOOPPAAOOP2AOOP3APPAP3APA2P6AO2PAAOOP2O2P20AP6AP20AP23AP6AP5AOP5AOP5AAPA4PA2OA2PAAOOA2PAOAOA2PAOAOA2PA2OA2PA2OA2PAO2A2PAPPA5PPA5PPA5PPA5PPA5PPA5PPA5PPA5CCPPBOONCCPPBO2CCPPBO2CCPPBO2CCPPBA2CCPPBPAABCAPPBPAFBAP2BAP4OCCP5CCOP4CCO3PPCCO5CCAPPO2CCA2P2CCA5CCPPBPO3PPBPO3PPBPO3PPBO4PPBP2OOPPBP6BP6BO2PPO2CCPPBO2CCPPBO2CCPPBO2CCPPBO2CCPPBPOOCCPPBP2CCPPBP2CCPPBO3NPPAPO2P2AOPOOPPAPOPOOPPAPOPOOPPAPOPOOPPAPOPOOPPAPOPOOPPAPPA5PPA10OOA5OAOOA3OA6OA6OAAOA3OAOAP7AP6A2P4A2P4OAAP4OAAP4AAP5AAP11AAP38AP6AP7A5PA6PAPPA3P5AAP14AP5APPFPPAAPPFFPPA5PPA5PPA5PFA5PFA5FFA5FFA5FFA5FFBBP2BF3BP2F4BPPF5BPF31APPA2CCB2PPACCPB3PCCPPF3CCF5BCF6BF15PPBO4PPBPPO2PPBAAPPOPPBPA2PAPPBPA3P2BPAABBP2BPPFFBP2BBP2CCPPBOOPCCPPBO2CCPPBPPOCCPPBAAPCCPPBA2CCPPBPAACCPPBBPPCCPPBOPOOPPAP2OOPPAP2OOPPAP2OOPPAPOPOOPPAPO3PPAPPO2PPAPAPPOPPAPA3OOA5OA9PA6PA5PPA4P2A4P2A2OP3AP31AP6AP3AAP3AAP3AAPPFFP13AAP3AAP3AAPPFFAAPPF3PPF21AAPPF3PPF55A5FFA5FFA5FFA5FFA5FFA5FFA5FFA5F55A7F55A7F2BP2BF3BP2F39A7B2CCPPB4CP2F3BAPPF4BBPF6BF15A7PAAP2APBPAAPPAAPBA2PAAPPBPAAPAP2BPPAPBP2BBPPFBP2BBFA9OP5AOP2A2P2AAPPA3PPFFAAPPF3PPF13A9PPF3PPF45A7F55A7F55A7FFA5FFA5FFA5FFA5FFA5FFA5FFA13"

F8_Ship_01 =
	"0c000280F252E2F38MF2EEM2E15F14EF2E4FEMME3M6EM7EM6E2M4FFE2AANE31MME5M5EEM7NF6N3F3EEN3FFE4OFFE23ME6F6EF3E3FE6FNNE3DFNPPND2ENPHND2ENIAND2ENIAND2E2FFA2E3FA2EED2A2D4A2D4A2D4A2D4A2D4A2F62EF37EEF2OE3FDDE8DE2F14EF3E3FE38FFE31DE19DE65DE10MME55M7EM6E2M4E6ME31M2E4M5EEM15EEM5E4M2E6OE4DDOENIAND2ENIAND2MNIAND2MNIOND2MNIOND2MNIAND2ONIAND2ONIAND7A2D4A2D4A2D4A2D4A2D4A2D4A2D4A2F3PMMEFFPE3MFFE5FDE5DEKLE3DEKL2EEDEKKL3PD2KKLLE5DDME7MME7MME7MME7ME7LLE14DDE8DE8DDE7ME7M2E7MME34DE9DE8DDE11DDE8DE40DE13DE7DDE8DDE7DE13D2E2D4E22DE3D3EED13OD6OD4AAE2D3OED5OD6OD6AD4AAOD2AAIIOA2IP2OIIP4OONIAND2ONIAND2ONIOND2ANIOND2ONIOND2ONIAND2ONIAND2FNIAND7A2D4A2D4A2D4A2D4A2D4A2D4A2D4A2P2D2KKPOOPPD2FPAOOPPDFFPPAOOPF3PPAOF5PPF15L3E3KKL3EEDDKKL3PD2KKLLOPPD2KKAOOP2DDP2O2PPF2PPAOOE5MME15LLE5L3E3KKL3EEDDKKL3PPDDKKLLE7MMDE6MMDME5MMDE11D4EEDKJD2EDKKJD2E2DE10DE3D3EED2OD6OD6ODAD4AAID2AAIPPED21AD3A2IDDAAIIPPAAIP4IP5FP3F3ODDA2IIDAAIIP2AIIP10FFP2F4PF22P4F2P2F53NIAND2FNIAND2FNIONDDOFNIONOOEFNIONEEDFNIAND2FNIAND2FNIAND5ODA2DOOEEA2OEEDDA2ED3A2D4A2D4A2D4A2D4A2F47A15F4P2F39A15OOPPDDKKPAOOPPDDFPPAOOPPF2PPAOOF4PPAF6PA15EDKJJD2EDJD2AAD3AAIP8OAP5OP4FFA18IP3IIP4FP4F2PPF21A15PPF45A15F47A15F47A15FNIAND2FNIAND2FNIOND2FNPOND2FFNPND2F2NNDDFA15D4A2D4A2D4A2D3FA2D2FFA2F4A18"

F8_Ship_02 =
	"0c000280F197EEF4MMEF4EEMF4E2F4E2F4E2F4DEDF4EDE4F3E6FM2E2NNE2MMNPIE4NOIE4NAIE4NAIDEDEDNAIF15NF6NF6NF6NF6NF6NF203A2F4A2F4A2F4A2F4A2F4A2F4A2F4A2F52N2F2N3EF30NF6OF4E2NFE13F11NNF2N3E2N2E35MF4D2E2FFO2E5AOE21MME2M12EDEDENAID4NAIO3DNOIEEO2NOIEMMEONAIM5AIM11E3NF6NF6NF6NF6NF6NF6EEF5E4F199A2F4A2F4A2F4A2F4A2F4A2F4A2F4A2ON2E3OOE5PE6PEMME3PE2MMEEPE4MMPE6FDDE27ME3M3EM14NM6N2M2E5M3EEM27EEM2E20M14EM3E3MME37MME122DEEF7E2F4E5FFE17DE20F23EF6E3F3E6FE15F47EOF5EEDDF8A2F4A2F4A2F4A2F4A2F4A2F4A2F4A2FFODDE2FFO2D2FFI2O2F2OOI2F4O2F6OF15N3EEMMN3E3N3E3ON2DE2NOONODDEN2OIIODFN2OOIIF2NNO2E7M2E7MME7M2E7DDE5IODDE3OIIOD2E32MME4DEEM2DDE4DMME7ME14DE3DDE3DDE3DE22ME8DE4DE51DDE37DDE3DE3DE27DDE2DDE3DE21DE4D2E2D5E4FFE13DDE3D3ED21KD4K2F4A2PF3A2DDPFFA2D2FFA2D3FA2DKJDDA2KKJDDA2KJJDDA2F68O2F55O2IIOODO4I2FFO5F4O2F6OF23DE2DE2OD2E3IIOODDEEOOI2ODDO4IIOFFO4IF3O3F5OOEM2E7MME7MME7D2E4IIODDE2OOIIOD2O3I2OE2DE4DE5ME6DMME3ME2M2DEDE4ME8DDE20DEEDEED3EED4ED14ED5KKLD2K2ED21KD4K2D2K3JDK3JJDK2JJDDPKJJDDPPAD2K3JDK3JJDK2JJD2KJJD2PPJD2PPAADDPPA2P2A2PPFAAP2F2JD2PA2DDP2A2PPAAPA5PFA3PPFFA2PF3A2F4A2F4A2F55A7F55A7F55A7F55A7FO5IF2O4F5OOF31A7IOD2E2OIIOODDEO2I2ODO5IPF2O4F4O2F6OA7KLLEDKKJKKLEDJJDDEKED2PPD3PPAP4A2OOPA2PPO2P2FFA7JDDPPA2DPPAAP3A2PF2AAPPF3PPF21A7PPF53A7F4A2F4A2F4A2F4A2F4A2F4A2F4A10"

F8_Ship_03 =
	"0c000280B29EEB2E4BP2E2MBP3MMDBPPHPD2B23E3B3E2MMB2M2DDB2D4B2D4B127E2B37MMB2EEM2E15B14EB3E3BM2E3M6EM7EM6E2M4BBE2B2E31MME5M5EEM7B15EEB5E4B2E23ME6B39E2B4E6BE7B3A3B3A3B3A3B3A3B3A3B3A3B3A3EB2A3BPHFPD2BPHFPD2BPHFPD2BPHFPD2BPHFPD2BPHFPDOOBBHFPO2BBHPPOEED4B2D4B2D4B2D4B2DDO2BEEO3E4DDE8DE2B14EB3E3BE38BBE31DE19DE65DE10MME55M7EM6E2M4E6ME31M2E4M5EEM15EEM5E4M2E6ME3D3E15ME6M3E2DM4D2MMO2D2O4D2O4D2E2BA3E3A3EDDEA3DKKJA3DKKJA3DJ2A3D3A3DDPBA3BBHPPE2BBPPD2EBBP3DDBP2NAPPBPHN3APHFHHN2PHFFMHHNPHFFM2HE5DDE7DE6PD2E3AAPPDDEENA2PPDDN3AAPPHNNOAIAAE8DDE8DE8DDE15D2E4PAPD2E34DE9DE8DDE11DDE8DE40DE13DE7DDE8DDE7DDE5DDE2D4ED6E14DE4D2EED35PPEED35PID2PI2PDPIIP3IIP5O4D2O4P2O4I2O4P2O4PBBO3B3OOB13P2BA3I2BA3PPBBA3B3A3B3A3B3A3B3A3B3A3PHFFM3PHF3MMPAHHF3BP2HHFFBBAP2HHBBA2PPABBHA3PBBHFPIIAMHOOIAIAMHOOAIAIMHOOA3FHOOAIIAHHOA9PPAP2A6P2A2I2APPDDAIANAAPPAHN3AAIFHHN3HFFMHHNNHFFM2H2FFM4HF3M2E7D2E4P2DDMEEA2PDEEDN2PD3NNOAD3HOOAID2HOOAID2E2DEEDDE3D3ED35PIID2PIIPPD22PD4PIIDDPI2P2IIP4IP5BP3B3D3PI2DPPIIP2I2P10BBP2B4PB22P4B2P2B120A3B3A3B3A3B3A3B3A3B3A3B3A3B3A3BBHFPI2BBHFPIOOBPHFPIDOBPHFIDODBPHFIDDOBPHFPODDBPHFPODDBPHFPD2OA2P3DODAB2PODODB3DODOB3D3B3D3B3D3B3D3B3AHHF3MPAAHHF2BPPAAH2B2APA2B4APAB6AB15HOOAID2HOOAPDPIHOAAPPIPAAP5AAP11B17PPIIP3IIP4BP4B2PPB37PPB257A3B3A3B3A3B3A3B3A3B3A3B3A3B3A3BPHFPD2BPPHID2BP2ID2BBP2D2B2PPD2A23D3B3D3B3D3B3D2B4DDB5A23B39A23B39A23B39A23B39A23B39A23B39A23B39A23B3A3B3A3B3A3B3A3B3A27"

F8_Ship_04 =
	"0c000280B52E2B2E4B30EB3E3BE22B6EB3E3BBE35MME2M4EEB5E4B2E20M2EEM21B23M2B4M5BBM6EM2E4ME6B39EB6E3B3E6B196A3B3A3B3A3B3A3B3A3B3A3B3A3B3A3BE15MME4K2MME2K2EEM2E6NDDE4NBODDE2NE13MME2M27ENNM2E2N2EEMMEEM27E2MME29M5EEM2E4ME162DE3DE7B5E4B2E16DE29B23E2B4E5BBE22DB47EDB5E4B6A3B3A3B3A3B3A3B3A3B3A3B3A3B3A3BO2D2NBI2O2NBBOOI2OB3O2NB5ONB23N2E3MN2E4N2DE3OONODDEENNOIIODDN2OOI2BBNNO3B3O3MME7MME7M2E7MDE6ODDE4IIOD2EEOOIIOODDE23ME4DDEM2DDE4DMME7MME2DE9DDE2DDE3DDE10DDE2M2EDE2ME5M2E2M2EEM2E31D2E7D2EDE3DDE4P2E24DE3DDE3DE26DDE3DDE2DDE26DDE3DDPPED2PPAADPAPAAIAE6BE4D2E2D2PPD2P2ANPPA2N2A2N3HN4HHMONNHHM2B3A3PPBBA3PPBBA3P2BA3NHPBA3HFHPA3FFHPA3FFHPA3B70OB55O3I2OBO5IB3O3B5OOB31D2E4IOODDE2OI2ODDEO3IIODBO4IIB2O4B4O2B7EEME6ME6ME4DDME4IOME4OIME4OOME4OOME4MMP3E3PHPPE3PFHPMDEEPFHPEDEEPFHPEDEEPFHPEDEEPFHPDIEEPFHPPIE3DDPPED2PPAADP2AANNPA2N3PN4HHAONNHHMMAOOHM3AOOHM2FAI2AIAINAIAIAIANNHA4HHFIAIIAMFFHA3MFFHAPPAMFFHA3F2HA2POOHM4OOHM2FFOOHMF3OOHF2HHAOH3PPA4PPBAP3B2PPB5FFHPA3FFHPA3HHAPA3P2BA3PB2A3B3A3B3A3B3A3B257ME4BBME4BBME4BBME4BBME4BBME4BBME4BBME6PFHPPIEEPFHP2EEPFHP2EEPFHPOPEEPFHPOOEEPHHPOOEEPHHPBBEEPIHPBBAOOHMF2AOOHF2HAAOH3APPA4POPA2PBBOOPPB19FHHAP3HAAPPB2APPB112A3B3A3B3A3B3A3B3A3B3A3B3A3B3A3B257ME4BBME4BBME4BBME4BBME4BBME4BBME4BBEDE5PIHPBBEEPIHPBBEEPHHPBBEEPHHPBBEEPFHPBBEEPFHPBBEEPFHPBBEEPFHPB197A3B3A3B3A3B3A3B3A3B3A3B3A3B3A3B257ME2DEBBEDEDEEBBEEDEDEBBEDEDEDBBED3EBBEEDEDDBBED4B2D4EEPFHPBBEEIFHPBBDEPFHPBBEEPFHPBBDEPFHPBBDDPFHPBBEDIFHPBBDDIHPPB197A3B3A3B3A3B3A3B3A3B3A3B3A3B3A3B15A47B15A47B15A47B15A47B3D3B4D2A47DDP2B2DDPPB3A47B15A47B15A47B15A47B3A3B3A51"

function loadFrame08Sprites()
	tomem(unpac(F8_Module_01))
	loadSprite("F8_Module_01", 96, 59, 5)
	tomem(unpac(F8_Module_02))
	loadSprite("F8_Module_02", 84, 56, 5)
	tomem(unpac(F8_Module_03))
	loadSprite("F8_Module_03", 97, 60, 5)
	tomem(unpac(F8_Module_04))
	loadSprite("F8_Module_04", 74, 42, 5)
	tomem(unpac(F8_Module_05))
	loadSprite("F8_Module_05", 51, 26, 5)
	tomem(unpac(F8_Module_06))
	loadSprite("F8_Module_06", 84, 58, 5)
	tomem(unpac(F8_Module_07))
	loadSprite("F8_Module_07", 70, 50, 5)
	tomem(unpac(F8_Module_08))
	loadSprite("F8_Module_08", 70, 50, 5)
	tomem(unpac(F8_Module_09))
	loadSprite("F8_Module_09", 74, 55, 5)

	tomem(unpac(F8_Ship_01))
	loadSprite("F8_Ship_01", 77, 38, 5)
	tomem(unpac(F8_Ship_02))
	loadSprite("F8_Ship_02", 77, 47, 5)
	tomem(unpac(F8_Ship_03))
	loadSprite("F8_Ship_03", 76, 45, 1)
	tomem(unpac(F8_Ship_04))
	loadSprite("F8_Ship_04", 76, 58, 1)
end

-- Frame11

F11_Rock_01 = "AAP3AAPPOOP4O2P3O2PAP2OOPA2P3"

F11_Rock_02 =
	"A3P4A12PPO3PA11PBBO4PA9PPBO5P6A3PBBO6PPO3PPAAPBBO7PO5PAPBPBPO12PAPBP4O11PPBP5O10PPBP9O6PPBBP6O2PO4PPBBPPO13P3BBO13APB5O9PPAPB6O8PPAPPB7O5PPA3PB9OOP2A3PB11PPA4PPB10PA6PPB8PPA9B6PPA11PPB2PPA13P3A16PPA8"

F11_Rock_03 =
	"A2P11A9PPO9P2A6PPO12PPA5PPO13PPA4P2O13PPA3P2O14PA3P3O3PO8PA2PBP2O3P2O6P2APBPPO4P3O6P3BP2O4P3O5BBPPBBP2O3PO8BBPB3P2O2P2O6BBPB4P2OP4O4PPBPPB5P3BPPO4PBBP2B11P4BBPPAPPB16PPA2PB5P2B7PA4P5APPB5PPA13PPB3PPA15P5A4"

F11_Rock_04 = "AAP6A6PB2O3PPA4PBBO7PPAABBO8PPAPBBO10PPB2O9PPB2O9P2B2O6P2APB2O2BP3A2PPB5PA5PPBPBBPA8P4A11PPA8"

F11_Ship =
	"C23I4OIOONON6OC40I4OIOONON6OC40I4OIOONON6OC40I4OIOONON6OC40I6OONON6OC35I11OONON6OC34JIJJI8OONON6OC33JIJIJ2I7ONON6OC33J5IJJI5ONON6OI2C29IJIJIJIJIJ2I2NONOK6ONNIIC28IJ7IJJIOINONOL6KNNOOIC27IJIJIJIJIJIJIOINONON6ONNOOIC27IJ5IJ3IOINONON6ONNOOIC27IJIJIJIJIJIJIOINONONO4NONNOOIC27JIJ2IJ2IJJIOINNONOI3OON2OOC28IJIJIJIJIJIJIOIN2O2IO2N3OOC27IJ2IJ2IJ3IOIN4OION5OOC27IIJIJIJIJIJIJIOIN4OION5OOC27IJIJIJIJIJIJJIOIN4OION5OOC27IIJIJIJIJIJIJIOIN4OION5OOC27IJ2IJ2IJIIJIOIN4OION5OOC27IIJIJIJIJI2JIOIN4OION5OOC27IJIJIJIJIJIIJIO7IO8C27JIJIJIJIJI5O16C27IJIJIJ2I7O15C27IIJIJIJI8O15C27IJIJI12O15C26I16O16C25IJIJI9OION15OC25I12OION17OC24I2JI7OION18OC24I11OIONNO13N3OC23IJIJIJI4OIONNO15N2OC23I3N2I2OION2I15N3OC22I2NINOIIOION2I3O13N2OC20I3NINOI2OIONNI18N3OC18I3NINOI2OIONNI8NO8I2NNOC17I3NINOI2OION2I7NI2N16C12JIJIN2OI3OIONNPPI5NI2NNI15NC10IIJJIN2OI3OIONNPPI4NIIN4O11I3NC8J4ON2OI3OIONNPPI4NIN4ON8I3NI2NC6JIJIO2N2OI3OIONNPPI4NIN3ON8I5NIINC5J2O5NNOI3OIONNPPI4NIN2ONNLK10I2NINC4IIJJO4N2OI3OIONNPPI4NIN2ONL9K3IININC3J4O5NNOI3OIONNPPI4NIN2ONL10KKPKININC3J4O4N2OI3OIONNPPI4NIN2ONL11KPKININC2J5O5NNOI3OIONNPPI4NIN2ONM3L7KPKININCCJ6O4N2OI3OIOMMPPI4NINMMONM3LMLML3KPKININCJ7O4N2OI3OIOMMPPI4NIM2ONM3LMLML3KPKINIMIJ6I5N2OI3OIOMMPPI4MIM2ONM3LMLML3KPKINIMIJ5I6N2OI3OIOMMPPI3JMIM2ONM3LMLML3KPKINIMIJ4I7N2OI3OIOMMPPIIJ2MIM2ONM3LMLML3KPKINIMIJ3I6JIN2OI3OIOMMPPJ4MIMNNONM3LMLML3KPKINIMIJ2I7JIN2OI3OIOMMPPJ4MIN2ONM3LMLML3KPKININIJJI6JIJIN2OI3OIOMMPPJ4NIN2ONM3LMLML3KPKININIJI9JIM2OI3OIOMMPPJ3ININ2ONM3LMLML3KPKININI7JIJIJIM2OI3OIOMMPPJJI2NIN2ONM3LMLML3KPKININI8JIIJIM2OI3OIOMMPPI4NIN2ONM3LMLML3KPKININCI4JIJIJIJIM2OI3OIOMMPPI4NIN2ONM3LMLML3KPKININC2I8JIM2OI3OIOMMPPI4NIN2ONM3LMLML3KPKININC3JIJIJIJIJIM2OI3OIOMMPPI4NIN2ONM3LMLML3KPKININC3JI6JIM2OI3OIOMMPPI4NIN2ONM3LMLML3KPKININC3JIJIJIJIJIM2OI3OIOMMPPI4NIN2ONM3LMLML3KPKININC3JI6JIM2OI3OIOMMPPI4NIN2ONM3LMLML3KPKININC3JIJIJIJIJIM2OI3OIOMMPPI4NIN2ONM3LMLML3KPKININC3JI6JIM2OI3OIOMMPPI4NIN2ONM3LMLML3KPKININC3JIJIJIJIJIM2OI3OIONNPPI4NIN2ONM3LMLML3KPKININC3JI6JIM2OI3OIONNPPI4NIN2ONM3LMLML3KPKININC3JIJIJIJIJIN2OI3OIONNPPI4NIN2ONM3LMLML3KPKININC3JI6JIN2OI3OIONNPPI4NIN2ONM3LMLML3KPKININC3JIJI2JIJIN2OI3OIONNPPI4NIN2ONM3LMLML3KPKININC3JI6JIN2OI3OIONNPPI4NIN2ONM3LMLML3KPKININC3JIJI4JIN2OI3OIONNPPI4NIN2ONM3LMLML3KPKININC3JI6JIN2OI3OIONNPPI4NIN2ONM3LMLML3KPKININC3JI6JIN2OI3OIONNPPI4NIN2ONM3LMLML3KPKININC3JI6JIN2OI3OIONNPPI4NIN2ONM3LMLML3KPKININC3JI6JIN2OI3OIONNPPI4NIN2ONM3LMLML3KPKININC3JI6JIN2OI3OIONNPPI4NIN2ONM3LMLML3KPKININC3JI8N3OOIIOIONNPPI4NIN2ONM3LMLML3KPKININC3JI8ON4IIOIONNPPI4NIN2ONM3LMLML3KPKININC3JI7O2N3IIOIONNPPI4NIN2ONL10KKIKININC3JI6O4INI2OIONNPPI4NIN2ONL9K2OKININC3JI5O4IOI3OIONNPPI4NIN2ONK12OKONINC3JI4O4IOI4OIONNPPI4NIN3ONI11KONNINC3JI3O4IOIINNIIOIONNPPI4NIN4OK11ON2INC4I2O4IOI2NNIIOIONNPPI4NIN5O11N3INC4IIO4IOI3NNIIOIONNPPI4NIIN19INC6O4IOI4NNIJOIONNI7NI2N16INC8O2IOI5NNJIOION2I7NI2N14INC10OIOI6NNIIOION3I7NI16NC12I8NNIIOION3I8N16C17I3JNNIIOION4I23OC17I2JINNIIOION4I23OC17I4NNIIOION5IIO2I16NOC17I4NNIIOION5I3O2I7O4IINOC17I4NNIIOION6O2IIP7IIO3INNOC17I4NNIIOION9OOPF5PONON5OC17I4NNIIOION9OOP7ONON2INNOC14IN3I2NNIIOION9OON7ONON2INNOC13IIN3I2NNI2OION8OON7ONON2INNOC12I2N3I2NNI2OION8O9NNON2INNOC11I3N3I2NNI3OION7ON10ON5OC10I4N3I2NNI3OION8O10N5OC10I12NNI4OION24OC9I3AAI7NNI4OION23OC9I3AAIC2I4NNI5OION4INNM3NM2N6OC8I3AAIC3I4N2I4OION4IN2MMNNMNMN6OC7I3AAIC4I4N2I5OION11MNMN5OC8I2AAIC5I5N2I4OION8MNNMNMN5OC8I4C6I4ON2I5OION2IN6M2N4OC21I3O2N2I4OION2IN3MNNM2N4OC21I2O3N2I5OION16OC22IIO5N2I4OIO18C22IO6N2I5O18C24O7N2OI19C28O6N2O2I2O13IC28O6INO3IIO13IIC29O4IOIO3IIO13IIC30O2IOI2O2IP14IC31OOIOI3O2IIP3L7KPIC32IOI4O2IIO13IC33I5O2IIO13IC34I4O2IIO13C36I8P10OOIC36IIJKIJKPPL2KPPL2KPOOIC36I7O13C37I7O13C37I7O13C37I7O13C37I7O13C38I6O13C38I19C39I19C39I6O10IIC39I6O10IIC39I6O9IIC18"

function loadFrame11Sprites()
	loadExtendedSprite(unpac_noheader(F11_Rock_01), "F11_Rock_01", 7, 6, 0)
	loadExtendedSprite(unpac_noheader(F11_Rock_02), "F11_Rock_02", 20, 24, 0)
	loadExtendedSprite(unpac_noheader(F11_Rock_03), "F11_Rock_03", 23, 20, 0)
	loadExtendedSprite(unpac_noheader(F11_Rock_04), "F11_Rock_04", 15, 13, 0)
	loadExtendedSprite(unpac_noheader(F11_Ship), "F11_Ship", 60, 136, 2)
end

-- Tunnel Scene

--Tunnel_Shiplarge = "A114P4N11A114P4NO12A112P4NOOP11A85PPO27PNOOPGGF6GGPA84PPOP27NOOPGGF7GGPA19E59PN34O14PPA17EEDE23D2C31PO33P8O6PPA15EED28C2PPOOPPOOPPOOPPOOP14O14PPCD23PPO5PPA14ED28C2PPD23M2DDPCO14PPCE9D14PPO4PPA12ED29C2PD25M2D2POP15C10ED14PPO3PPA10EED28C2PPD14E11M2E5M4E8PCD9CED14PPO2PPA9ED28C2PPD15EC11N2C5N4C8PCD10CED14PPOOPPA7ED29CCBPE17CD11M2D5M4D8PCD11CED14PPOPPA5E30C2PC19D12M2D5M4D8PCD12CED14P3A4E29C2PPD33M2D5M4D8PCE13CE14DP2A4C30P2D34M2D5M4D8PCD14CD15PPA4C29PPD29E6M2E5M4E8PCE14CDE14PPA4E26CP2E30C6N2C5N4C8PC16DC14PPA4C26PPC39N2C5N4C6EDPC16DC14PPA4C26PE40M2E4DM4DE7PC16DC14PPA4C26PC40N2C5N4C8PPC15DC14PPA4C26PC40N2C5N4C8P2C14DC14PPA4P27C40N2C5N4C8P3C13DC14P3N14PNNP2OOPO5PC40N2C5N4C8POP2C5B6CB12CCPPO15POP4O2P6C40N2C5N4C8POOPPC4P25O6N7OPHGGHPPO8PC40N2C5N4C8PO2PC2P27O15PFFGHPPO8PC40N2C5N4C8PO2PCCPPD8BD6CP6AAO15PHGGHPPO8PC40N2C5N4C8PO2P3DC8BC7P5A2O15PFFGHPPO8PC40N2C5N4C8PO2P2DC9BC7P4A3O15PHGGHP7O2PC40N2C5N4C8PO2PPCDC9BC7P3A4O15PFFGHPPO4PPOOPC15B4C2B4CCB31CPO2PPBDC9BC7P2A5O15PHGGHP12C14BO2BC2BO2BCCBP32O2PPBDC9BC7PPA6O15PFFGHP12B15P2B4P2B3P32O2PPBDC9BC7PA7O15PHGGHP14BP34O18P7OOPPBDC9BC7A8P4O10PFFGHP11A3B4P3O17P26OPO2P2OOPPBDC9BC7A8P5O9PPGGHPA15B4P20O32P2OPPBDC9BC7A8P18GHPA16B4P20O32PPOPPBDC9BC6A10P19A18B5P44O6P4BDC10BC5A11P17A34O9PPA21P2O6P3BDC11BC4A64P10A23P12BDC12BBC2A99P2O6P2BC14BC2A99P2OOP8CDC12BC2A100PPO7P2CDC12BC2A100P2OOP8CDC11BC2A100P2O7P2CDC11BC2A101PPO2P8CDC10BC2A101P2O7P2CDC10BCCA103PPO9P13A106P17O4PPD4A107P12OOPPOPDC4A107OOP10O2POPBC4A106P3OPO5PPOOPOOPBC4A105PHGFPN7PPOOPPOPBC4A105PHGFPN7PPOOPOOPBC4A105PHGFPOPO5PPO2POPBC4A105PHGFPN4ONOPPOOPPOPBC4A105PHGPO2PO4PPO4PBC4A105PHPOP16BC4A106POP10CD6C4A107P11CDC10A113PPAP2CDC10A113PPAP2CDC10A113PPAP2CDC10A113PPAP2CDC10A109O7PPCDC10A109PPO5PPCDC10A109P2O4PPCDC10A110PPO4PPCDC10A111PPO3PPCDC10A111PPO3PPBDC10A112PPO2PPCDC10A112PPO2PPBDC10A113PPOOPPBDC10A113PPOOPPBDC10A114P4BDC10A115P3BDC10A116B2DC10A10"

Tunnel_Shiplarge_01 =
	"A114P4N11A114P4NO12A112P4NOOP11A85PPO19N6OPNOOPGGF6GGPA84PPOP27NOOPGGF7GGPA19E35MMEEM8E10PN26M7O14PPA17EEDE23D2C31PO26N6P8O6PPA15EED28C2PPOOPPOOPPOOPPOOP14O14PPCD8E8D5PPO5PPA14ED28C2PPD4EEDDE9D4M2DDPCO14PPCE18D5PPO4PPA12ED29C2PD5EEDDE9D5M2D2POP15C10ME8D5PPO3PPA10EED28C2PPD6EEDDE3M5E5M2E5M4E8PCD9CME8D5PPO2PPA9ED28C2PPD7EEDDE3MC11N2C5N4C8PCD10CME9D4PPOOPPA7ED29CCBPE9MMEEM3CE5D5M2D5M4D8PCD11CME9D4PPOPPA5E30C2PC19E5D6M2D5M4D8PCD12CME9D4P3A4E29C2PPD11EEDDE10D6M2D5M4D8PCE13CM10E3DP2A4C30P2D11EEDDE11D6M2D5M4D8PCD15E10D4PPA4C29PPD13EEDDE18M2E5M4E8PCE14CDM10E3PPA4E26CP2E13MMEEM11EC6N2C5N4C8PC16D12C2PPA4C26PPC15DDCCD11C7N2C5N4C6EDPC16D12C2PPA4C26PE15MME2M11E7M2E4DM4DE7PC16D12C2PPA4C26PC15DDC2D11C7N2C5N4C8PPC15D12C2PPA4C26PC15DDC2D11C7N2C5N4C8P2C14D12C2PPA4P27C15DDC2D11C7N2C5N4C8P3C13D12C2P3N14PNNP2OOPO5PC15DDC2D11C7N2C5N4C8POP2C5B6CB12CCPPO15POP4O2P6C15DDC2D11C7N2C5N4C8POOPPC4P25O6N7OPHGGHPPO8PC15DDC2D11C7N2C5N4C8PO2PC2P27O15PFFGHPPO8PC15DDC2D11C7N2C5N4C8PO2PCCPPD8BE6DP6AAO15PHGGHPPO8PC15DDC2D11C7N2C5N4C8PO2P3DC8BD7P5A2O15PFFGHPPO8PC15DDC2D11C7N2C5N4C8PO2P2DC9BD7P4A3O15PHGGHP7O2PC15DDC2D11C7N2C5N4C8PO2PPCDC9BD7P3A4O15PFFGHPPO4PPOOPC15B4D2B4DDB31CPO2PPBDC9BD7P2A5O15PHGGHP12C14BO2BD2BO2BDDBP32O2PPBDC9BD7PPA6O15PFFGHP12B15P2B4P2B3P32O2PPBDC9BD7PA7O15PHGGHP14BP34O18P7OOPPBDC9BD7A8P4O10PFFGHP11A3B4P3O17P26OPO2P2OOPPBDC9BD7A8P5O9PPGGHPA15B4P20O32P2OPPBDC9BD7A8P18GHPA16B4P20JO31PPOPPBDC9BD6A10P19A18B5P2JJP2J10P25O6P4BDC10BD5A11P17A34O9PPA21P2O6P3BDC10DBD4A64P10A23P12BDC10DDBBD2A99P2O6P2BC11D2BD2A99P2OOP8CDC9D2BD2A100PPO7P2CDC9D2BD2A100P2OOP8CDC8D2BD2A100P2O7P2CDC8D2BD2A101PPO2P8CDC7D2BD2A101P2O7P2CDC7D2BDDA103PPO9P13A106P17O4PPE4A107P12OOPPOPD5A107OOP10O2POPBD4A106P3OPO5PPOOPOOPBD4A105PHGFPN7PPOOPPOPBD4A105PHGFPN7PPOOPOOPBD4A105PHGFPOPO5PPO2POPBD4A105PHGFPN4ONOPPOOPPOPBD4A105PHGPO2PO4PPO4PBD4A105PHPOP16BD4A106POP10CD5ED4A107P11CDC4D5A113PPAP2CDC4D5A113PPAP2CDC4D5A113PPAP2CDC4D5A113PPAP2CDC4D5A109O7PPCDC4D5A109PPO5PPCDC4D5A109P2O4PPCDC4D5A110PPO4PPCDC4D5A111PPO3PPCDC4D5A111PPO3PPBDC4D5A112PPO2PPCDC4D5A112PPO2PPBDC4D5A113PPOOPPBDC4D5A113PPOOPPBDC4D5A114P4BDC4D5A115P3BDC4D5A116B2DC5D4A10"

Tunnel_Shiplarge_02 =
	"A114P4N11A114P4NO12A112P4NOOP11A85PPO8N7O10PNOOPGGF6GGPA84PPOP27NOOPGGF7GGPA19E30M10E17PN15M7N10O14PPA17EEDE23D2C31PO16N7O8P8O6PPA15EED28C2PPOOPPOOPPOOPPOOP14O14PPCE7D15PPO5PPA14ED28C2PPE10D12M2DDPCO14PPCM7EED14PPO4PPA12ED29C2PDE10D13M2D2POP15C10ED14PPO3PPA10EED28C2PPDE11DDE11M2E5M4E8PCDE8CED14PPO2PPA9ED28C2PPDDE11DDEC11N2C5N4C8PCDE9CED14PPOOPPA7ED29CCBPE2M12EECD11M2D5M4D8PCDDE9CED14PPOPPA5E30C2PC19D12M2D5M4D8PCDDE10CED14P3A4E29C2PPD2E2DDE9D15M2D5M4D8PCE2M10CE14DP2A4C30P2D2EED2E9D16M2D5M4D8PCD3E10D16PPA4C29PPD3EED2E10D9E6M2E5M4E8PCE4M9DDE14PPA4E26CP2E3MME2M10E10C6N2C5N4C8PC6D11C13PPA4C26PPC4DDC2D11C17N2C5N4C6EDPC6D11C13PPA4C26PE5ME2M11E18M2E4DM4DE7PC6D11C13PPA4C26PC4DDC2D11C18N2C5N4C8PPC5D11C13PPA4C26PC4DDC2D11C18N2C5N4C8P2C4D11C13PPA4P27C4DDC2D11C18N2C5N4C8P3C3D11C13P3N14PNNP2OOPO5PC4DDC2D11C18N2C5N4C8POP2C2D2B6CB12CCPPO15POP4O2P6C4DDC2D11C18N2C5N4C8POOPPC2DDP25O6N7OPHGGHPPO8PC4DDC2D11C18N2C5N4C8PO2PC2P27O15PFFGHPPO8PC4DDC2D11C18N2C5N4C8PO2PCCPPE8BED5CP6AAO15PHGGHPPO8PC4DDC2D11C18N2C5N4C8PO2P3ED8BDC6P5A2O15PFFGHPPO8PC4DDC2D11C18N2C5N4C8PO2P2D10BDC6P4A3O15PHGGHP7O2PC4DDC2D11C18N2C5N4C8PO2PPCD10BDC6P3A4O15PFFGHPPO4PPOOPC4DDC2D5B4DCCB4CCB31CPO2PPBD10BDC6P2A5O15PHGGHP12C3DDC2D5BO2BDCCBO2BCCBP32O2PPBD10BDC6PPA6O15PFFGHP12B15P2B4P2B3P32O2PPBD10BDC6PA7O15PHGGHP14BP34O18P7OOPPBD10BDC6A8P4O10PFFGHP11A3B4P3O17P26OPO2P2OOPPBD10BDC6A8P5O9PPGGHPA15B4P20O32P2OPPBD10BDC6A8P18GHPA16B4P20O32PPOPPBD10BDC5A10P19A18B5PJ7P35O6P4BD11BC5A11P17A34O9PPA21P2O6P3BD12BC4A64P10A23P12BD12CBBC2A99P2O6P2BCD11CCBC2A99P2OOP8CED10CCBC2A100PPO7P2CED10CCBC2A100P2OOP8CED9CCBC2A100P2O7P2CED9CCBC2A101PPO2P8CED8CCBC2A101P2O7P2CED8CCBCCA103PPO9P13A106P17O4PPD4A107P12OOPPOPDC4A107OOP10N2POPBC4A106P3OPO2N2PPNNPOOPBC4A105PHGFPN4M2PPNNPPOPBC4A105PHGFPN4M2PPNNPOOPBC4A105PHGFPOPO2N2PPN2POPBC4A105PHGFPN5MNPPNNPPOPBC4A105PHGPO2POON2PPN2OOPBC4A105PHPOP16BC4A106POP10CE5DC4A107P11CED4C5A113PPAP2CED4C5A113PPAP2CED4C5A113PPAP2CED4C5A113PPAP2CED4C5A109O7PPCED4C5A109PPO5PPCED4C5A109P2O4PPCED4C5A110PPO4PPCED4C5A111PPO3PPCED4C5A111PPO3PPBED4C5A112PPO2PPCED4C5A112PPO2PPBED4C5A113PPOOPPBED4C5A113PPOOPPBED4C5A114P4BED4C5A115P3BED4C5A116B2D6C4A10"

Tunnel_Shiplarge_03 =
	"A114P4N11A114P4NO12A112P4NOOP11A85PPOON8O16PNOOPGGF6GGPA84PPOP27NOOPGGF7GGPA19E28M9E20PN9M8N15O14PPA17EEDE25DC31PO9N9O13P8O6PPA15EED24E2DC2PPOOPPOOPPOOPPOOP14O9N2OOPPCEED21PPO5PPA14ED24E2DC2PPE8D14M2DDPCO9NO3PPCM2E6D14PPO4PPA12ED25E2DC2PE9D15M2D2POP15C10ED14PPO3PPA10EED24E2DC2PPE8D5E11M2E5M4E2M5PCE3D5CED14PPO2PPA9ED25E2C2PPE9D5EC11N2C5N4C8PCE3D6CED14PPOOPPA7ED25E2DCCBPM9E7CD11M2D5M4D3E4PCE4D6CED14PPOPPA5E26M2EC2PC19D12M2D5M4D3E4PCE4D7CED14P3A4E26M2C2PPE9D23M2D5M4D4E3PCM5E7CE14DP2A4C24E2C2P2E9D24M2D5M4D4E3PCE5D8CD15PPA4C22E3C2PPE9D19E6M2E5M4E4M3PCM6E7CDE14PPA4E21M2EECP2M9E20C6N2C5N4C4D3PCD6C8DC14PPA4C21DDC2PPD9C29N2C5N4C5DMDPCD6C8DC14PPA4C21DDC2PM10E29M2E4DM4DE4M2PCD6C8DC14PPA4C21DDC2PD10C29N2C5N4C5D2PPD6C8DC14PPA4C21DDC2PD10C29N2C5N4C5D2P2D5C8DC14PPA4P27D10C29N2C5N4C5D2P3D4C8DC14P3N14PNNP2OOPO5PD10C29N2C5N4C5D2PNP2D3CCB6CB12CCPPO15POP4O2P6D10C29N2C5N4C5D2PNNPPD3CP25O6N7OPHGGHPPO8PD10C29N2C5N4C5D2PN2PD2P27O15PFFGHPPO3NNO2PD10C29N2C5N4C5D2PN2PDDPPD8BD6CP6AAO15PHGGHPPO3NNO2PD10C29N2C5N4C5D2PN2P3EC8BC7P5A2O15PFFGHPPO3NNO2PD10C29N2C5N4C5D2PN2P2EDC8BC7P4A3O15PHGGHP7O2PD10C29N2C5N4C5D2PN2PPCEDC8BC7P3A4O15PFFGHPPO3NPPOOPD10C4B4C2B4CCB31DPN2PPBEDC8BC7P2A5O15PHGGHP12D9C4BO2BC2BO2BCCBP32N2PPBEDC8BC7PPA6O15PFFGHP12B15P2B4P2B3P32N2PPBEDC8BC7PA7O15PHGGHP14BP34O18P7NNPPBEDC8BC7A8P4O10PFFGHP11A3B4P3O17P26OPO2P2NNPPBEDC8BC7A8P5O9PPGGHPA15B4P20O32P2NPPBEDC8BC7A8P18GHPA16B4P20O32PPNPPBEDC8BC6A10P19A18B5P44O6P4BEDC9BC5A11P17A34O9PPA21P2OONO3P3BEDC10BC4A64P10A23P12BEDC11BBC2A99P2ONNO3P2BDDC12BC2A99P2ONP8DEC12BC2A100PPON2O3P2DEC12BC2A100P2NNP8CDC11BC2A100P2N3O3P2CDC11BC2A101PPN2P8CDC10BC2A101P2N3O3P2CDC10BCCA103PPN3O5P13A106P17O4PPD4A107P12OOPPOPDC4A107OOP10O2POPBC4A106P3NPN2O2PPOOPOOPBC4A105PHGFPM4N2PPOOPPOPBC4A105PHGFPM4N2PPOOPOOPBC4A105PHGFPNPN2O2PPO2POPBC4A105PHGFPM4ONOPPOOPPOPBC4A105PHGPN2PNNO2PPO4PBC4A105PHPOP16BC4A106POP10CD6C4A107P11CDC10A113PPAP2CDC10A113PPAP2CDC10A113PPAP2CDC10A113PPAP2CDC10A109N4O2PPCDC10A109PPN2O2PPCDC10A109P2NNO2PPCDC10A110PPNNO2PPCDC10A111PPNO2PPCDC10A111PPNO2PPBDC10A112PPO2PPCDC10A112PPO2PPBDC10A113PPOOPPBDC10A113PPOOPPBDC10A114P4BDC10A115P3BDC10A116B2DC10A10"

Tunnel_Shiplarge_04 =
	"A114P4N11A114P4NO12A112P4NOOP11A85PPN4O22PNOOPGGF6GGPA84PPOP27NOOPGGF7GGPA19E59PMNM9N22O14PPA17EEDE11MEMEEM6E2C31PNON9O21P8O6PPA15EED12E3DDE9C2PPOOPPOOPPOOPPOOP14NON9O2PPCD23PPO5PPA14ED13E2D2E8C2PPD23M2DDPCNON8O3PPCE9D14PPO4PPA12ED13E2D2E9C2PD25M2D2PNP15C10ED14PPO3PPA10EED13E2D2E8C2PPD14E11M2E3MEM9E3PCD9CED14PPO2PPA9ED13E2D2E8C2PPD15EC11N2C5N4C8PCD10CED14PPOOPPA7ED13E3D2E8CCBPE17CD11M2D3EDM4E5D2PCD11CED14PPOPPA5E15M2E2M8C2PC19D12M2D3EDM4E5D2PCD12CED14P3A4E14M2E3M7C2PPD33M2D3EDM4E5D2PCE13CE14DP2A4C13E2C2E9CP2D34M2D3EDM4E6DDPCD14CD15PPA4C11E2C3E10PPD29E6M2E3MEM11EEPCE14CDE14PPA4E10MME3M9EP2E30C6N2C2DDCM4D6CCPC16DC14PPA4C10DDC2D10PPC39N2C2DDCM4D6EDPC16DC14PPA4C10DDC2D10PE40M2E2MMDM4DM5EEPC16DC14PPA4C10DDC2D10PC40N2C2DDCM4D6CCPPC15DC14PPA4C10DDC2D10PC40N2C2DDCM4D6CCP2C14DC14PPA4P27C40N2C2DDCM4D6CCP3C13DC14P3N13MPNNP2OOPO5PC40N2C2DDCM4D6CCPOP2C5B6CB12CCPPO14NPOP4O2P6C40N2C2DDCM4D6CCPOOPPC4P25O6N8PHGGHPPO8PC40N2C2DDCM4D6CCPO2PC2P27O14NPFFGHPPN6OOPC40N2C2DDCM4D6CCPO2PCCPPD8BD6CP6AAO14NPHGGHPPN6OOPC40N2C2DDCM4D6CCPO2P3DC8BC7P5A2O14NPFFGHPPN6OOPC40N2C2DDCM4D6CCPO2P2DC9BC7P4A3O14NPHGGHP7NOOPC40N2C2DDCM4D6CCPO2PPCDC9BC7P3A4O14NPFFGHPPN4PPOOPC15B4C2B4CCB31CPO2PPBDC9BC7P2A5O14NPHGGHP12C14BO2BC2BO2BCCBP32O2PPBDC9BC7PPA6O14NPFFGHP12B15P2B4P2B3P32O2PPBDC9BC7PA7O14NPHGGHP14BP34O18P7OOPPBDC9BC7A8P4O9NPFFGHP11A3B4P3O17P26OPO2P2OOPPBDC9BC7A8P5O8NPPGGHPA15B4P20O32P2OPPBDC9BC7A8P18GHPA16B4P20O17J6O7PPOPPBDC9BC6A10P14JP3A18B5P44N2O3P4BDC10BC5A11P17A34O9PPA21P2N2O3P3BDC11BC4A64P10A23P12BDC12BBC2A99P2NNO4P2BC14BC2A99P2NNP8CDC12BC2A100PPNNO5P2CDC12BC2A100P2NOP8CDC11BC2A100P2NO6P2CDC11BC2A101PPNOOP8CDC10BC2A101P2O7P2CDC10BCCA103PPO9P13A106P17O4PPD4A107P12OOPPOPDC4A107OOP10O2POPBC4A106P3OPO5PPOOPOOPBC4A105PHGFPN7PPOOPPOPBC4A105PHGFPN7PPOOPOOPBC4A105PHGFPOPO5PPO2POPBC4A105PHGFPN4ONOPPOOPPOPBC4A105PHGPO2PO4PPO4PBC4A105PHPOP16BC4A106POP10CD6C4A107P11CDC10A113PPAP2CDC10A113PPAP2CDC10A113PPAP2CDC10A113PPAP2CDC10A109O7PPCDC10A109PPO5PPCDC10A109P2O4PPCDC10A110PPO4PPCDC10A111PPO3PPCDC10A111PPO3PPBDC10A112PPO2PPCDC10A112PPO2PPBDC10A113PPOOPPBDC10A113PPOOPPBDC10A114P4BDC10A115P3BDC10A116B2DC10A10"

Tunnel_Shiplarge_05 =
	"A114P4N11A114P4NO8N3A112P4NOOP11A85PPO27PNOOPGGF6GGPA84PPOP27NOOPGGF6MFFPA19EEME3M11E28MMEEM7PM5N28O12NNPPA17E2MEEMEEM11E5D2C31PN5O27P8O4NNPPA15E21D8C2PPOOPPOOPPOOPPOOP14N5O8PPCD23PPO3NNPPA14EDE19D7C2PPD17EEDDEEM2EEPCN5O8PPCE9D14PPO2NNPPA12EDE19D8C2PD19EEDDEEM2E2PNP15C10ED14PPOONNPPA10E22D7C2PPD14E5MMEEM15E8PCD9CED14PPONNPPA9E22D6C2PPD15EC11N2C5N4C8PCD10CED14PPNNPPA7EDE20D7CCBPE17CD4E2DE2M2E5M4D8PCD11CED14PPNPPA5EEM21E6C2PC19D5EEDDE2M2E5M4D8PCD12CED14P3A4EM22E5C2PPD26EEDDE2M2E5M4D8PCE13CE14DP2A4E21C8P2D26E2DDE2M2E5M4D8PCD14CD15PPA4E20C8PPD28EMMEEM16E8PCE14CDE14PPA4M2EEM14E6CP2E29MDDCCD2M2D5MNMMNC8PC16DC14PPA4D2CCD12C8PPC31D2CCD2M2D5MNMMNC6EDPC16DC14PPA4D2CCD11C9PE32M2EEM10DM4DE7PC16DC14PPA4DDC2D11C9PC32D2C2DDM2D5MN3C8PPC15DC14PPA4DDC2D11C9PC32D2C2DDM2D5MN3C8P2C14DC14PPA4P27C32D2C2DDM2D5MN3C8P3C13DC14P3N2MMN2M6PNNP2OOPO5PC32D2C2DDM2D5MN3C8POP2C5B6CB12CCPPO3NNO3N5POP4O2P6C32D2C2DDM2D5MN3C8POOPPC4P25O3NNON2M4NPHGGHPPO8PC32D2C2DDM2D5MN3C8PO2PC2P27O3NNO3N5PFFGHPPO8PC33DDC2DDM2D5MN3C8PO2PCCPPD8BD6CP6AAO3NNO3N5PHGGHPPO8PC33DDC2DDM2D5MN3C8PO2P3DC8BC7P5A2O3NNO3N5PFFGHPPO8PC33DDC2DDM2D5MN3C8PO2P2DC9BC7P4A3O3NNO2N6PHGGHP7O2PC33DDC2DDM2D5MN3C8PO2PPCDC9BC7P3A4O3NNO2N6PFFGHPPO4PPOOPC15B4C2B4CCB31CPO2PPBDC9BC7P2A5O3NNO2N6PHGGHP12C14BO2BC2BO2BCCBP32O2PPBDC9BC7PPA6O3NNO2N6PFFGHP12B15P2B4P2B3P32O2PPBDC9BC7PA7O3NNO2N6PHGGHP14BP34O18P7OOPPBDC9BC7A8P4NO2N6PFFGHP11A3B4P3O17P26OPO2P2OOPPBDC9BC7A8P5O2N6PPGGHPA15B4P20O32P2OPPBDC9BC7A8P18GHPA16B4P20O2J2OJ11O13PPOPPBDC9BC6A10P3JJP2J6P3A18B5P44O6P4BDC10BC5A11P17A34O9PPA21P2O6P3BDC11BC4A64P10A23P12BDC12BBC2A99P2O6P2BC14BC2A99P2OOP8CDC12BC2A100PPO7P2CDC12BC2A100P2OOP8CDC11BC2A100P2O7P2CDC11BC2A101PPO2P8CDC10BC2A101P2O7P2CDC10BCCA103PPO9P13A106P17O4PPD4A107P12OOPPOPDC4A107OOP10O2POPBC4A106P3OPO5PPOOPOOPBC4A105PHGFPN7PPOOPPOPBC4A105PHGFPN7PPOOPOOPBC4A105PHGFPOPO5PPO2POPBC4A105PHGFPN4ONOPPOOPPOPBC4A105PHGPO2PO4PPO4PBC4A105PHPOP16BC4A106POP10CD6C4A107P11CDC10A113PPAP2CDC10A113PPAP2CDC10A113PPAP2CDC10A113PPAP2CDC10A109O7PPCDC10A109PPO5PPCDC10A109P2O4PPCDC10A110PPO4PPCDC10A111PPO3PPCDC10A111PPO3PPBDC10A112PPO2PPCDC10A112PPO2PPBDC10A113PPOOPPBDC10A113PPOOPPBDC10A114P4BDC10A115P3BDC10A116B2DC10A10"

Tunnel_Shiplarge_06 =
	"A114P4MNM8NA114P4MN10OOA112P4N2P11A85PPO27PNONPGGF6GGPA84PPOP27NOOPFFM7FGPA19ME6ME23ME4ME4M7E6PN34O2N11PPA17MMEM6E16D2C31PO33P8N6PPA15EME7D20C2PPOOPPOOPPOOPPOOP14O14PPCD19E3PPN5PPA14ME8D19C2PPD14E7DM2DDPCO14PPCE9D10E3PPN4PPA12ME8D20C2PD15E8DM2D2POP15C10ED10E3PPN3PPA10MME8D19C2PPD14EEM8EM2E5M4E8PCD9CED10E3PPN2PPA9ME8D19C2PPD15EC11N2C5N4C8PCD10CED10E3PPNNPPA7ME9D19CCBPE17CDE9DM2D5M4D8PCD11CED10E3PPNPPA5M10E19C2PC19DDE9DM2D5M4D8PCD12CED11E2P3A4M10E18C2PPD21E10DM2D5M4D8PCE13CE12MMEP2A4E8C21P2D22E10DM2D5M4D8PCD14CD12E2PPA4E7C21PPD21E7M5EM2E5M4E8PCE14CDE12MMPPA4M6E19CP2E24M5D5CN2C5N4C8PC16DC12DDPPA4D5C20PPC25D12CN2C5N4C6EDPC16DC12DDPPA4D5C20PE27M11EM2E4DM4DE7PC16DC12DDPPA4D5C20PC27D11CN2C5N4C8PPC15DC12DDPPA4D5C20PC27D11CN2C5N4C8P2C14DC12DDPPA4P27C27D11CN2C5N4C8P3C13DC12DDP3M7N6PNNP2OOPO5PC27D11CN2C5N4C8POP2C5B6CB12DDPPN9O5POP4O2P6C27D11CN2C5N4C8POOPPC4P25N6M2N4OPHGGHPPO8PC27D11CN2C5N4C8PO2PC2P27N9O5PFFGHPPO8PC27D11CN2C5N4C8PO2PCCPPD8BD6CP6AAN9O5PHGGHPPO8PC27D11CN2C5N4C8PO2P3DC8BC7P5A2N9O5PFFGHPPO8PC27D11CN2C5N4C8PO2P2DC9BC7P4A3N9O5PHGGHP7O2PC27D11CN2C5N4C8PO2PPCDC9BC7P3A4N9O5PFFGHPPO4PPOOPC15B4C2B4DDB31CPO2PPBDC9BC7P2A5N9O5PHGGHP12C14BO2BC2BO2BDDBP32O2PPBDC9BC7PPA6N9O5PFFGHP12B15P2B4P2B3P32O2PPBDC9BC7PA7N9O5PHGGHP14BP34O18P7OOPPBDC9BC7A8P4N4O5PFFGHP11A3B4P3O17P26OPO2P2OOPPBDC9BC7A8P5N3O5PPGGHPA15B4P20O32P2OPPBDC9BC7A8P18GHPA16B4P20J7O24PPOPPBDC9BC6A10PPJ7P9A18B5P14J3P25O6P4BDC10BC5A11P17A34O9PPA21P2O6P3BDC11BC4A64P10A23P12BDC12BBC2A99P2O6P2BC14BC2A99P2OOP8CDC12BC2A100PPO7P2CDC12BC2A100P2OOP8CDC11BC2A100P2O7P2CDC11BC2A101PPO2P8CDC10BC2A101P2O7P2CDC10BCCA103PPO9P13A106P17O4PPD4A107P12OOPPOPDC4A107OOP10O2POPBC4A106P3OPO5PPOOPOOPBC4A105PHGFPN7PPOOPPOPBC4A105PHGFPN7PPOOPOOPBC4A105PHGFPOPO5PPO2POPBC4A105PHGFPN4ONOPPOOPPOPBC4A105PHGPO2PO4PPO4PBC4A105PHPOP16BC4A106POP10CD6C4A107P11CDC10A113PPAP2CDC10A113PPAP2CDC10A113PPAP2CDC10A113PPAP2CDC10A109O7PPCDC10A109PPO5PPCDC10A109P2O4PPCDC10A110PPO4PPCDC10A111PPO3PPCDC10A111PPO3PPBDC10A112PPO2PPCDC10A112PPO2PPBDC10A113PPOOPPBDC10A113PPOOPPBDC10A114P4BDC10A115P3BDC10A116B2DC10A10"

Tunnel_Shipsmall_01_00 =
	"AAD4A9BOOE3A8BOOC4DA6BPOCN4A6BPOCN5A5BOOCN5A5BOOCBE4A5BPOCBDC4A4BPOCBDC4A4BPOCBDC4A4BPOCBDC5A3BPOCBDC5A3BPOCBDC5A3DPOCBDC6AAPGOOCBDC6AAPGFODBD8APGFOGBD8CPGFOGFPD7CPGFOGFPC8ACOOGFPC8ACBOGFPC6PA3BBGPC2B2PA5PPB3O3A4PPOPOPO3A5PPOPOPO3A5PPO6A6PPO6A6PPO4PA8P5A5"

Tunnel_Shipsmall_01_01 =
	"AAD4A9BOOE3A8BOOC4DA6BPOCN4A6BPOCN5A5BOOCN5A5BOOCBE4A5BPOCBDC4A4BPOCBDC4A4BPOCBDC4A4BPOCBDC5A3BPOCBDC5A3BPOCBDC5A3DPOCBDC6AAPGOOCBDC6AAPGFODBD8APGFOGBD8CPGFOGFPD7CPGFOGFPC8ACOOGFPC8ACBOGFPC6PA3BBGPC2B2PA5PPB3O3A4PPOPOPO3A5PPOPOPO3A5PPO6A6PPO6A6PPO4PA8P5A5"

Tunnel_Shipsmall_01_02 =
	"AAD4A9BOOE3A8BOOC4DA6BPOCN4A6BPOCN5A5BOOCN5A5BOOCBE4A5BPOCBDC4A4BPOCBDC4A4BPOCBDC4A4BPOCBDC4DA3BPOCBDC4DA3BPOCBDC4DA3DPOCBDC4DDAAPGOOCBDC4DDAAPGFODBD5E2APGFOGBD6EEDPGFOGFPD5EEDPGFOGFPC5D2ACOOGFPC5D2ACBOGFPC5DPA3BBGPC2B2PA5PPB3O3A4PPOPOPO2NA5PPOPOPO2NA5PPO6A6PPO6A6PPO4PA8P5A5"

Tunnel_Shipsmall_01_03 =
	"AAD2EEA9BOOEEMMA8BOOC2DDEA6BPOCNNM2A6BPOCN2M2A5BOOCN2M2A5BOOCBEEM2A5BPOCBDCCD2A4BPOCBDCCD2A4BPOCBDCCD2A4BPOCBDCCD2CA3BPOCBDCCD2CA3BPOCBDCCD2CA3DPOCBDCCD2CCAAPGOOCBDCCD2CCAAPGFODBD2E2D2APGFOGBD3E2DDCPGFOGFPD2E2DDCPGFOGFPC2D2C2ACOOGFPC2D2C2ACBOGFPC2D2CPA3BBGPC2B2PA5PPB3O3A4PPOPOPOONOA5PPOPOPN2OA5PPO3N2A6PPO3N2A6PPO3NPA8P5A5"

Tunnel_Shipsmall_01_04 =
	"AAE2DDA9BOOMMEEA8BOOCDDCCDA6BPOCMMN2A6BPOCM2N2A5BOOCM2N2A5BOOCBMME2A5BPOCBD2C2A4BPOCBD2C2A4BPOCBD2C2A4BPOCBD2C3A3BPOCBD2C3A3BPOCBD2C3A3DPOCBD2C4AAPGOOCBD2C4AAPGFODBDEED5APGFOGBDE2D4CPGFOGFPDEED4CPGFOGFPD2C5ACOOGFPD2C5ACBOGFPD2C3PA3BBGPD2B2PA5PPB3O3A4PPOPOPO3A5PPOPOPO3A5PPON2O2A6PPON2O2A6PPON2OPA8P5A5"

--Tunnel_Shipsmall_02 = "A5D6A19B3C3A21CE10MMEECA5HHNNC12NNC2A3HGGHOC12NNC2A2HGGFHOOP8C2NNC2AAHGGFFHO10PCNNC3AHGGFFP13B3CCAHGGFFP13B5AAHGFFP12B6A2HGGP11B6A5HP10B6A6"

Tunnel_Shipsmall_02_01 =
	"A5E3D2A19B3DC2A21DM3E6MMEECA5HHNND3C8NNC2A3HGGHOD3C8NNC2A2HGGFHNOP8C2NNC2AAHGGFFHN3O6PCNNC3AHGGFFP13B3CCAHGGFFPJ3P8B5AAHGFFP12B6A2HGGPJ3P6B6A5HPJ3P5B6A6"

Tunnel_Shipsmall_02_02 =
	"A5D6A19B3C3A21CE9M4EA5HHNNC12MMD2A3HGGHOC12MMD2A2HGGFHOOP8C2MMD2AAHGGFFHO10PCMMD3AHGGFFP13B3DDAHGGFFP13BJ4AAHGFFP12B6A2HGGP11B2J3A5HP10B2J3A6"

Tunnel_Shipsmall_02_03 =
	"A5D6A19B3C3A21CE5M3EMMEECA5HHNNC7D4NNC2A3HGGHOC7D4NNC2A2HGGFHOOP8D2NNC2AAHGGFFHO7NNOPDNNC3AHGGFFP13B3CCAHGGFFP9J4B4AAHGFFP12B6A2HGGP9J4B3A5HP8J4B3A6"

Tunnel_Shipsmall_02_04 =
	"A5D3E2A19B3CD2A21CE2M3E3MMEECA5HHNNC3D3C4NNC2A3HGGHOC3D3C4NNC2A2HGGFHOOP8C2NNC2AAHGGFFHO3N3O2PCNNC3AHGGFFP13B3CCAHGGFFP4J4P3B5AAHGFFP12B6A2HGGP4J4PPB6A5HP4J3PPB6A6"

--Tunnel_Shipsmall_03 = "A24N5A28N5PA27O5PA27O4PPA11D13MMO4PPE2A5D15M2OP2OPFO2A2D17M2D2EGGFPO2AAD17M2D2EOPOPFO2AD17M2D2ECOGGFPOOADE16M2E3COOPOPPA3C17NNC4OB2PBA3C17NNC4OBBCBBA3C17NNC4OBBCBA5C2P12CCNNC3OBBCBA6CPO12PCNNC3BBCBBA7P20BBCCBBA24P2B2CCBA25P2C4BA26PPC4BA28C4BA28C3BA29C3BA29C3BA5"

Tunnel_Shipsmall_03_01 =
	"A24N3MMA28N2M2PA27O2N2PA27O2NNPPA11D13MMO2NNPPM2A5D15M2OP2NPFO2A2D17M2DEEMGGFPO2AAD17M2DEEMOPOPFO2AD17M2DEEMCOGGFPOOADE16M2EM2COOPOPPA3C17NNCCDDCOB2PBA3C17NNCCDDCOBBCBBA3C17NNCCDDCOBBCBA5C2P12CCNNCDDCOBBCBA6CPO12PCNNCDDCBBCBBA7P20BBCCBBA24P2B2CCBA25P2C3DBA26PPC3DBA28CCD2BA28CCDDBA29CCDDBA29CCDDBA5"

Tunnel_Shipsmall_03_02 =
	"A24N5A28N5PA27O5PA27O4PPA11D13MMO4PPE2A5D15M2OP2OPFO2A2D17M2EDDEGGFPO2AAD17M2EDDEOPOPFO2AD17M2EDDECOGGFPOOADE16M4EECOOPOPPA3C17MD2C2OB2PBA3C17MD2C2OBBCBBA3C17MD2C2OBBCBA5C2P12CDMMDC2OBBCBA6CPO12PDMMDC2BBCBBA7P20BBCCBBA24P2B2CCBA25P2C4BA26JJC4BA28DDC2BA28DDCCBA29DDCCBA29DDCCBA5"

Tunnel_Shipsmall_03_03 =
	"A24N5A28N5PA27O5PA27O4PPA11D9E3MMO4PPE2A5D10E4M2OP2OPFO2A2D12E4M2D2EGGFPO2AAD12E4M2D2EOPOPFO2AD12E4M2D2ECOGGFPOOADE12M6E3COOPOPPA3C12D4NNC4OB2PBA3C12D4NNC4OBBCBBA3C12D4NNC4OBBCBA5C2P12DCNNC3OBBCBA6CPO12PCNNC3BBCBBA7P20BBCCBBA24P2B2CCBA25P2C4BA26PPC4BA28C4BA28C3BA29C3BA29C3BA5"

Tunnel_Shipsmall_03_04 =
	"A24N5A28N5PA27O5PA27O4PPA11D4E4D3MMO4PPE2A5D6E3D4M2OP2OPFO2A2D7E4D4M2D2EGGFPO2AAD7E4D4M2D2EOPOPFO2AD7E4D4M2D2ECOGGFPOOADE7M4E3M2E3COOPOPPA3C7D4C4NNC4OB2PBA3C7D4C4NNC4OBBCBBA3C7D4C4NNC4OBBCBA5C2P12CCNNC3OBBCBA6CPO5N4OOPCNNC3BBCBBA7P20BBCCBBA24P2B2CCBA25P2C4BA26PPC4BA28C4BA28C3BA29C3BA29C3BA5"

Tunnel_Shipsmall_03_05 =
	"A24N5A28N5PA27O5PA27O4PPA11DDE3D7MMO4PPE2A5DDE4D8M2OP2OPFO2A2DDE5D9M2D2EGGFPO2AADDE5D9M2D2EOPOPFO2ADDE5D9M2D2ECOGGFPOOADEEM5E8M2E3COOPOPPA3CCD5C9NNC4OB2PBA3CCD5C9NNC4OBBCBBA3CCD5C9NNC4OBBCBA5C2P12CCNNC3OBBCBA6CPON4O6PCNNC3BBCBBA7P20BBCCBBA24P2B2CCBA25P2C4BA26PPC4BA28C4BA28C3BA29C3BA29C3BA5"

Tunnel_Shipsmall_03_06 =
	"A24N5A28N5PA27O5PA27O4PPA11EED11MMO4PPE2A5EED13M2OP2OPFO2A2EED15M2D2EGGFPO2AAEED15M2D2EOPOPFO2AEED15M2D2ECOGGFPOOAEMME14M2E3COOPOPPA3DDC15NNC4OB2PBA3DDC15NNC4OBBCBBA3D2C14NNC4OBBCBA5C2P12CCNNC3OBBCBA6CPNO11PCNNC3BBCBBA7P20BBCCBBA24P2B2CCBA25P2C4BA26PPC4BA28C4BA28C3BA29C3BA29C3BA5"

function loadTunnelSprites()
	--loadExtendedSprite(unpac_noheader(Tunnel_Shiplarge),"Tunnel_Shiplarge",133,77,0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shiplarge_01), "Tunnel_Shiplarge_01", 133, 77, 0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shiplarge_02), "Tunnel_Shiplarge_02", 133, 77, 0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shiplarge_03), "Tunnel_Shiplarge_03", 133, 77, 0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shiplarge_04), "Tunnel_Shiplarge_04", 133, 77, 0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shiplarge_05), "Tunnel_Shiplarge_05", 133, 77, 0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shiplarge_06), "Tunnel_Shiplarge_06", 133, 77, 0)

	loadExtendedSprite(unpac_noheader(Tunnel_Shipsmall_01_00), "Tunnel_Shipsmall_01_00", 16, 29, 0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shipsmall_01_01), "Tunnel_Shipsmall_01_01", 16, 29, 0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shipsmall_01_02), "Tunnel_Shipsmall_01_02", 16, 29, 0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shipsmall_01_03), "Tunnel_Shipsmall_01_03", 16, 29, 0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shipsmall_01_04), "Tunnel_Shipsmall_01_04", 16, 29, 0)

	--loadExtendedSprite(unpac_noheader(Tunnel_Shipsmall_02),"Tunnel_Shipsmall_02",27,12,0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shipsmall_02_01), "Tunnel_Shipsmall_02_01", 27, 12, 0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shipsmall_02_02), "Tunnel_Shipsmall_02_02", 27, 12, 0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shipsmall_02_03), "Tunnel_Shipsmall_02_03", 27, 12, 0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shipsmall_02_04), "Tunnel_Shipsmall_02_04", 27, 12, 0)

	--loadExtendedSprite(unpac_noheader(Tunnel_Shipsmall_03),"Tunnel_Shipsmall_03",35,23,0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shipsmall_03_01), "Tunnel_Shipsmall_03_01", 35, 23, 0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shipsmall_03_02), "Tunnel_Shipsmall_03_02", 35, 23, 0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shipsmall_03_03), "Tunnel_Shipsmall_03_03", 35, 23, 0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shipsmall_03_04), "Tunnel_Shipsmall_03_04", 35, 23, 0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shipsmall_03_05), "Tunnel_Shipsmall_03_05", 35, 23, 0)
	loadExtendedSprite(unpac_noheader(Tunnel_Shipsmall_03_06), "Tunnel_Shipsmall_03_06", 35, 23, 0)
end

-- Construction01

C1_Bg =
	"P9OPOPAAOB6CBCBCBABBABC32B6A10B4AAN18ONONO19POPOPOP2OP9OPOPOPO7POPOPOPOP3OPOPOPOPOPOPAPOP41AP11OPAAPB6CBCBCBABBABC28B3A6C10A8N17ONONONO2PO2PO2PO2POPOPOPOPOPO11P4OOPOPO2POPOPOPOP15APOP41AP9OPOPAAOB6CBCBCBABBABC24B3A3C24A3N14ONON21OPOP4OP8O2P3O7POP2OP5OPOPOP2OPOPAPOP41AP11OPAAPB6CBCBCBABBABC22BBA3C32A3N11ON2ONONO2PO2PO2POPONOPOPOPOPOPOPOPOPOPOPOOP2OOPOPOPOPOPOPOPOPOP13APOP41AP9OPOPAAOB6CBCBCBABBAB3C16B2AAC40AAN8ONONO19NOPOPOP2OP8OPOOP2O7POPOPOPOP3OPOPOPOPOPOPAPOP41AP11OPAAPB6CBCBCBABBABCCBC14BBA2C44A2N6ON2ONONOPO2PO2PO2PONOPOPOPOPOPOPOPOPOPOPOOPPOPOPOPOPOPOPOPOPOP15APOP41AP9OPOPAAPB6CBCBCBABBABCCBC12BBAAC50AAN3ONONO13POPOPONPPOP4OP8OPPOP2OPOPO2PPOP2OP5OP2OPOPOP2APOP41AP11OPAAPB6CBCBCBABBABCCBC10BBAAC21A8C23AAN2ON2ONONONOPO2POPOPOPONOPOPOPOPOPOPOPOP2OPPOP3OPOPOPOPOPOPOPOP9OP4APO41PAP9OPOPAAOB6CBCBCBABBABCCBC8BBAC18A14C25AAONONO11POPOPOPONOPOPOP2OP8OPPOP2O2PO3POPOP2OP3OPOPOPOPOPOPAP43AP11OPAAPB6CBCBCBABBABCCBC7BAAC15A18C27AAN2ONONONO2PO2PO2PONOPOPOPOPOPOPOPOPOPOPOOP2OOPOPOPOPOPOPOPOPOP7OP4A45P9OPOPAAOB6CBCBCBABBABCCBC5BBCCBCBC10A23C27ANO11POPOPOPONOPOP4OP8OPPOP2O2POPOPOOP11OPOPOPO15POP30AP11OPAAPB6CBCBCBABBABCCBC4BAAC12A15B10A5C22AAONONO2PO2POPOPOPONOPOPOPOPOPOPOPOPOPOPPOP2OOPOPOPOPOPOPOPOPOP7OPOP13OAPOP29AP7OPOPOPAAOB6CBCBCBABBABCCBC3BABCBCBCBC5A11B5EP9B5A3C20AO11POPOPONOPOPOP2OP8OPPOP2O6POPOOP9OPOPOPOPOP11OPAPOP28AP12OPAPB6CBCBCBABBABCCBCCBBAC11A9B3E9P9E2B3A2C18AONOPO2POPOPO2PONOPOPOPOPOPOPOPOPOPOPOOP2O3POPOP2OPOPOPOP7OPOP13OPAAPOP27AP9OPOPOPPB6CBCBCBABBABCCBCBCABCBCBCBC3A8B2P3E10P9E5B2AAC4AAC10AAO8POPOPONPPOP4OP8OPPOP2O2PO2POP14OPOPOP13OPAPAPOP26AP3O10PPB6CBCBCBABBAB4AC10A8BBP8E4F8P5E4P2BBA2CA4C10APOPOPOPOPOPOPONOPOPOPOPOPOPOPOP2OPOOP2O3POPOPOP2OPOPOP7OPOP13OPAPPAPOP25AP3OP2OPOPO2POB6CBCBCBABBABCCBBCBCBCBCBCBA7B2EEP7F20PE4P3B2A7C9AO8POPONOPOPOP2OP8OPPOP2O10P3OP5OPOPOPOPOP11OPAP2APOP24AP3OP7OOPPB6CBCBCBABABCCBAC9A6B2E4P2F28EEP5B2A6C7BCAOOPO2PO2PONOPOPOPOPOPOPOPOPOPOPOOP2O3POPOPOPOP2OPOPOP5OPOP13OPAP3APOP23AP3OP2OPOPO2POB6CBCBCBAABCCBCCBCBCBCBCBA5B2E6F34P6B2A5C7BCAO10NOPOP4OP8OPPOPOPO10P8OPOPOPOPOP13OPAP4APOP22AP3OP7OOPPB6CBCBCBAC2BC9A6BBE6F38P4EEBBA4C6BCBCAPOPOPOPOPONOPOPOPOPOPOPOPOPOPOPPOP2O3POPOPOPOPOP2OP7OPOP13OPAP5APOP21AP3OP2OPOPO2POB6CBCBCBACCBCCBCBCBCBCA5BBE5F44PPE3BBA2C7BCBCAO8NOPOPOP2OP8OPPOPOPO8PO2P4OPOPOPOPOPOP13OPAP6APOP20AP3OP7OOPPB6CBCBCBACBCCBCBC4A5BBP3EEF46PE4BBAAC6BCBCBCAPOPOPOPONOPOPOPOPOPOPOPOPOPOPOOP3OPOPOPOPOPOPOPOPOPOP5OPOP13OPAP7APOP19AP3OP4OPO2POB6CBCBCBABCCBCBCBCBCA5BBP4F50E4BBAAC6BCBCBCAO6NPOOP4OP8OPPOP4OPO2PO2POP4OPOP2OPOPOP13OOAP8APOP18AP3OP7OOPPB6CBCBCBAACBCBCBC2A4BBP4F54E3PBBAC4BCBCBCBCAPOPOPONOPOPOPOPOPOPOPOP2OPPOP5OPOPOPOPOPOPOPOP7OPOP13OPAP9APOP17AP3OP2OPOPO2POB6CBCBCBAC2BCBCBCA4BBP4F56E2PPBBAC4BCBCBCBCN6O21POIP3OPO2PO2PPOPPOPOPOPOPOPOP13OOAOP9APOP16AP3OP7OOPPB6CBCBCBABCBCBCBCA4BBP4F58EEP2BBAC2BCBCBCBCBAOP28IP4OPOPOPOPOPOPOPOP5OPOP13OPAAP10APOP15AP3OP2OPOPO2POB6CBCBBABC2BCBCA4BBPE2F62EP2BBAC2BCBCBCBCBAO26PPIPIP3OPOPOPOP4OPOPOPOPOPOP13OOAPAOP9APOP14AP3OP7OOPPB6CBCBABCBCBCBCA4BBE3F64P3BBACBCBCBCBCBCBAOPOPOPOPOPO10POPPOPPIAIP6OPOPOPOPOP7OPOP13OPAPPAP10APOP13AP3OP2OPOPO2POB6CBCABC4BCA4BBE3F66P3BBACBCBCBCBCBCBAO7POP8OP3OPPIAIPIP3OPO2P4OPOPOPOPOPOP13OOAPAPAOP9APOP12AP3OP7OOPPB6CBBACBCBCBCA4BBE3F68P3BBACBCBCBCBCBCAPN11OPOPOPOPOPOOPPIAIPIP6OPOPOPOPOP5OPOP13OPAPAAPAP10APOP11AP3OP4OPO2POB6CBABC5BA3BBE3F70P3BBACBCBCBCB3AOOPO2PO2PNP5OP3OPPIAIAIP3APOPOP4OPOP2OPOPOP13OOAPAPAPAOP9APOP10AP3OP7OOPPB6CACBCBCBCBA4BE3F72P2EBABCBCBCBCBCBCAPOPOPOPOPPNOPOP2OP3OPPIAIAIP2A2POPOPOPOP7OPOP13OPAPAPPAPAP10APOP9AP3OP2OPOPO2POB7ACBCBC2A4BP3F74PPEEBABCBCBCB4AO8PNP5OP3OPPIAIAIP2A2O2PPOPPOPOPOPOPOPOP13OPAPAP2APAPPOPOP5APOP8AP3OP7OOPPB6ABCBCBCBA4BBP2F76PEEBBABCBCBCBCBCBAOPOPOPOPONOP4OP3OPPIAIAIP2A2POPOPOPOPOP5OPOP13OPAPAP3APAP10APOP7AP3O10PB7ABCBCBCCA3BBP3F76E3BBABCB7AOOPOPO2PNP5OP3OPPIAIAIP2A2OPOP4OPOPOPOPOPOP13OPAPAP4APAP10APOP6AP12OOPB6ACBCBCBCA4BP3F78E3BACBCBCBCBCBCAPOPOPOPONOP4OP3OPPIAIAIP2A2POPOPOPOPOP5OPOP13OPAPAP5APAP10APOP5AP5O8PB6ACBCBCBCA3BP3F80E2PBACB8AOPO4PNP5OP3OPPIAIAIP2A2O2PPOPPOPOPOPOPOPOP13OPAPAP6APAP10APOP4AP6OP4OOPB5ABCBCBCBA3BBP2F82EPPBBACBCBCBCBCBAOPOPOPONOPOP2OP3OPPIAIAIP2A2POPOPOPOPOP5OPOP13OPAPAP7APAP10APOP3AP5OOPPOPO2POB4ABCBCBCBA3BP3F82EP2BAB9APOPO2PNP5OP3OPPIAIAIP2A2OPOP4OPOP2OPOPOP13OOAPAP8APAP10APOP2AP6OP4OOPPB3ACBCBCBCA3BBE2F84P2BBABCBCBCBCBCAPOPOPPNOPOPOPOP2OOPPIAIAIP2A2POPOPOPOPOP5OPOP13OPAPAP9APAP10APOPPAP5O2POPO2POB3ABBCBCBCA3BE3F84P3BAB9AO4PNP5OP3OPPIAIAIP2A2O2PPOPPO2P2OPOPOP13OOAP12APAP10APOPAP6O7PPB3ACBCBCBA3BBE2F86P2BBACBCBCBCBCAPOPOPONOPOPOPOPOPOOPPIAIAIP2A2POPOPOPOPOP5OPOP13OPAPPAP10APAP10APOAP5OPOPOPO2POB2AB2CBCBA3BE2F88P2BAB9AN5P5OP3OPPIAIAIP2A2OPOP3OOP2OPOPOPOP13OOAPPAP11APAP10APAP12OOPPB2ABCBCBCA4BE2F88P2BACBCBCBCBCBAOPO15PPIAIAIP2A2POPOPOPOP2OOP2OPOP13OPAPPAPAP10APAP10AAP5OPOPOPO2POBBAB3CBCA3BE3F88P2EBAB9AOPOPOP3OP5OPPIAIAIP2A2O2PPOP3OPOPOPOPO16APPAAPAP10APAP10AP12OOPPBBACBCBCBCA3BE2F90PEEBABCBCBCBCBCAPOPOPOPOPOPOPOPOOPPIAIAIP2A2POPOPOP2OPPOP2OP17APPAPAAP13AP9AP5OP2OPO2POBBAB3CBA3BE3F90PE2BAB8AOPOPOP3OP5OPPIAIAIP2A2OPOP4OPOPOPOPOPOP14OAPA2OPAP10APAP9AP12OOPPBBACBCBCBA3BP2F92E2BACBCBCBCBCAPOPOPOPOPOP2OPPOPPIAIAIP3AOPOPOP2OP3OP2OP17APAAPOPAAP9APAP9AP5OPOPOPO2POBAB4CBA3BP2F92E2BAB9APO2P3OP5OPPIAIAIP3OPOOP3OP4OPOPO18APAAPOPA2P8APAP9AP12OOPPBABCBCBCA3BP3F92E3BABCBCBCBCBAOPOPOPOPOPOPOPOOPPIAIAIP4O2P2OPOP3OP2OOP14OPAPAAPOPA3P7APAP9AP5OPOPOPO2POBAB4CA3BP2F94E2BAB8APOPOP3OP5OPPIAIPIPPOPO2P2OP6OPOPO2POP11OOAPAAPOPA4P6APAP9AP12OOPPBABCBCBCA3BP2F94E2BABCBCBCBCBAOPOPOP2OPOPOPPOPPIAIP2OPO2P2OPOPOP3OP2OOP14OPAPAAPOPAAPPAAP5APAP9AP5O8POAB6A3BP2F94E2BAB9AOPOP3OP5OPOIPIPPOPO2P2OPPOP5OPOPO2POP11OOAPAAPOPA4PAP4APAP9AP6OP4OOPPACBCBCBA3BP3F94E3BACBCBCBCBCAPOPOPOPOPOP2OOPPIP2OPO2P2OPOPOPOP3OP2OOP14OPAPAAPOPAAPPA3P3APAP9AP5OOPPOPO2POAB5A3BP2F96PPEBAB8AOPOP3OP5OPPIPPOPO2P2OP10OPOPO2P13OOAPPAPOPAAPPAPA2P2APAP9AP6OP4OOPPACBCBCBA3BE2F96P2BACBCBCBCBCAPOPOP2OP2OPPOP3OPO2P2OPOPOPOPOP3OP2OOP14OPAPPAPOPAAPOOPA4PAPAP9AP5O2POPO2POAB5A3BE2F96P2BAB8AO2P3OP5OPOPOPO2P2OP5OP5OPOPO2POP11OOAPPAPOPAAPOOPA6PAP9AP6OP4OOPPACBCBCBA3BE2F96P2BACBCBCBCBCAPOPOPOPOPOPOPOOPPOPO2P2OPOPOPOPOPOP3OP2OOP14OPAPPAPOPAAPOOPA6PAP9AP5O2POPO2POAB5A3BE2F96P2BAB8AOPOP3OP5OPOPO2P2OPPOP11OPOPO2P13OOAPPAPOPAAPOOPA2PPAAPAP9AP6OP4OOPABCBCBCA3BE3F96P3BA3CBCBCBAOPOP2OPOPOPPOPPO2P2OPOPOPOPOPOPOP3OP2OOP14OPAPPAPOPAAPOOPAAP3APAP9AP5O2POPO2PAB5A3BE2F98P2BABBAB5APOP3OP5OPOPOP2OPPOP13OP2O2POP2OP7OOAPPAPOPAAPOOPAAP3APAP9AP6OP4OOPABCBCBCA3BEEPF98P2BABCACBCBCBAOPOPOPOPOPOPOOP5OPOPOPOPOPOPOPOP3OP2OOP14OPAPPAPOPAAPOOPA2PPAAPAP9AP5OOPPOPO2PAB5A3BP2F98EPPBA3B5APOP3OP5OPOPOPOPOOP15OPOPO18APPAPOPAAPOOPA6PAP9AP6OP4OOPABCBCBCA3BP2F98E2BA3CBCBCBAOPOPOPOP2OPPOP3OPOPOPOPOP2OP2OP3OP2OP17APPAPOPAAPOOPA6PAP9AP5O2POPO2PAB5A3BP2F98E2BA3B5AOOP3O7POPOPO2PPOP13OPOPOPOPOPOPOPOPOPOPOPOAPPAPOPAAPOOPA2PPAAPAP9AP6OP4OOPABCBCBCA3BP2F98E2BA3CBCBCBAOPOPOP11OOPOPOPOPOPOP2OPOPOPPOP2OP16AP2APOPAAPOOPAAP3APAP9AP5O2POPO2PAB5A3BP2F98E2BA3B5APOP10OPOPO2POOP15OPOPOPOP2OP2OP2OPPAOPPAAPOPAAPOOPAAP3APAP9AP6OP4OOPABCBCBCA3BP2F98E2BA3CBCBCBAOPOPOPOPOPOPPOP2OOPOPOPOPOP2OP2OP3OP2OP14AP2A2POPAAPOOPA2PPAAPAP9AP5O2POPO2PAB5A3BP2F98E2BA3B5APOP10OPOPOPO2PPOP13OP2OP6OPOPOPPAOPOA3POPAAPOOPA6PAP9AP6OP4OOPABCBCBCA3BPPEEF96E3BA3CBCBCBAOPOPOPOPOPOPOOP2OOPOPOPOPOPOPOPOP2OPPOP2OPOP10AP2A4POPAAPOOPA6PAP9AP5OOPPOPO2POAB5A3BE2F96E2BA3B5AOPOP10OP2O2POOP15OPOPOOPOP5OPPAOPPA4POPPAAPOOPA6PAP9AP6OP4OOPPACBCBCBA3BE2F96PPEBA3BCBCBCAPOPOPOPOP2OPOOP2OOPOPOPOPOPOPOP2OP3OP2O2POP6APPA5POPPA2POOPA6PAP9AP5O2POPO2PBAB5CBCABE2F96P2BA3B5AO2P10OPOPO4PPOP13OPOPOOPOPOP4AOPA5POPPA2PPOOPA6PAP9AP6OP4OOPBACBCBCBCBCABE2F96P2BA3BCBCBCAPOPOPOPOPOPOPOOP2OOPOPOPOPOPOPOPOPOPOPPOP2O2POPOP2APPA5POPPA2PPOOPPA6PAP9AP5O2POPO2PBAB5CBCABE2F96P2BA3B5AOPOP10OPOPO2POOP2OP11OPOPO3PO2PAOPPA4POPPA2PPOOPPA6PPAP9AP6OP4OOPBACBCBCBCBCABE3F94P3BA3BCBCBCAPOPOP2OPOPOPPOP2OOPOPOPOPOPOPOPOPOP3OP2O6PAP2A4POPPA2PPOOPPA8PAPOP7AP5O8PBAB5CBCBABEEPF94P2BA3B6AOPOP10OPOPOPO3POP2OP9OP2O5PAOPA5POPPA2PPOOPPA9PAPOP7AP12OOPBBABCBCBCBCBABEPPF94P2BA3CBCBCBAOPOPOPOPOPOPOPOOP2OOPOPOPOPOPOPOPOPOP3OP2O4PAPPA5POPPA2PPOOPPA10PAPOP7AP5OP2OPO2PBBAB4CBCBABP2F94EPPBA3B5APOPOP10OP2O2POOP2OP2OP7OPOPO3PAOPA5POPPA2PPOOPPA11PAPOP7AP12OOPBBABCBCBCBCBABP3F92E3BA3CBCBCBAOP2OPOPOP2OPPOP2OOPOPOPOPOPOPOPOPOP3OP2O2PAP2A4POPPA2PPOOPPA12PAPOP7AP5OPOPOPO2PBBAB4CBCBBABP2F92E2BA3B6APOPOP8OPOPOPO7P2OP2OP5OPOPOOPAOPOA4POPPA2PPOOPPA13PAPOP7AP12OOPB2ACBCBCBCBCABP2F92E2BA3BCBCBCAPOPOPOPOPOPOP2OOP2O22P2OP4A4POPPA2PPOOPPA13PPAPOP7AP5OP2OPO2PB2AB3CBCBCABP3F90E3BA3B5AO16POPO22POPOPOPPA4POPPA2PPOOPPA14PPAPO6PPAP12OOPB2ACBCBCBCBCBABP2F90E2BA3CBCBCBCAP49A4POPPA2PPOOPPA16PAP9AP5OPOPOPOPOPB2AB3CBCBCBABP2EF88E3BA3B6AOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPA23POPPAAP6A17P12A15B3ABCBCBCBCBCABPPEF88E2BA4CBCBCBAPA52POPPAAP6A31P14AB3AB2CBCBC2ABPEEF88E2BA3B6AP53OPPAAP6A17P14O14PB4ACBCBCBCBCABBE2F86PEEBBA3BCBCBCAO54PPAAP6A17PPO13P14AB4ABBCBCBC3ABE3F84P2EBA3B6AP55A26PPOP13A15B4ACBCBCBCBCBABBE2F84P2BBA3CBCBCBCAPOPOPOPOPOP2OP2OP34A28PPOPAAP10AAP4OPOPOPOPOPB5ABCBCBC3BABE3F82P3BA3B6AOOPOPOPOP4OPOPOPOPOPOPOPOPOPOPOPOPOPOP2OP2OP2OPA28PPOPAAP26OPB5ABCBCBCBCBCABBE2F82P2BBA3BCBCBCBAP19OP10OP2OP14A28PPOPA2PAP16OPOPOPOPOPOB5ACBCBCBCCBCABE2PF80P3BA3B6AN18PNPOPO26POAAP3A21PPOPA3PAPO9P13OPPB5ACBCBCBCBCBCABEP2F78EEPPBA4CBCBCBCAPOPOPOPOPOPOP2OPPOP4OPPOPO18PPOPPAP5A19PPOPA4PAPOP10O10POPOPB5ABCBCBCCBCBABBP3F76E3BBA3CB5APO2POOP9OPOPOPOPOP3OP16OOPOPOAP5A18PPOPA4PPAPOP10OP8OP5B4ABCBCBCBCBCBABBP2F76E2BBA4BCBCBCBAOPOPOPOPOPOPOPOP2OOPPOPPOOP2OP2OP2OP2OP4OPPOPPAP5A9P4A3POPA5PPAPOP10OP4OPOPOPOOPAOB4CACBCBCCBCBCBABP3F74E3BA4BCB4AO3POP2OP7OPOPOPOPOP3OP16OPPOPPAP5A6P10AAPA6PPAPOP10OP8OPPOPAPB4CACBCBCBCBCBCBABP3F72E3BA4BCBCBCBCAOOPOPOPOPOPOPOPOPOPPOP4OOPOPOPOPOPOPOPOPOPOP2OPPOPPAAP3A5P4O4P4A7PPAPOP10OP2OPOPOPOPOOPAOB4CBABCBCCBCBCBCABBP2EF70E3BBA3BCBCB3AO4P2OP2OP5OPOPOPOPOP3OP16OPPOPOA10P2O2P4O2P2A6PPAPOP10OP8OPPOPAPB4CBBACBCBCBCBCBCABBPPEEF68E3BBA4CBCBCBCAPOPOPOPOPOPOPOPOPOP2OOPPOPPOOP2OP2OP2OP2OP2OPOPPOPPA8P3OP10OP3A4PPAPOP10OP2OPOPOPOPOOPAOB4CBCABC2BCBCBCBCABBPE2F66PE2BBA4CBCBCB2AO3P2OPOPOP7OPOPOPOPOP3OP16OPPOPOA8PPOOP12OOPPA4PPAPOP10OP8OPPOPAPB4CBCBABCBCBCBCBCBCABBE3F64P3BBA4CBCBCBCBAOPOPOPOPOPOP17OOPOPOPOPOPOPOPOPOP4OPPOPPA7PPOP16OPPA3PPAPOP10OP2OP2OPOPOOPAOB4CBCBCABCBCBCBCBCBCABBE3F62P3BBA4CBCBCBCBANO4POP2OPO11POPOPOP3OP16OPPOPOA6P2OP16OP2A2PPAPOP10OP8OPPOPAPB4CBCBCBABCBCBCBCBCBCABBE2PPF58P4BBA4CBCBCBCBAONOPOPOPOPOPOPOPOPOPOP2OOPPOPPOOP2OPOPOPOPOPOP6OPPOPPA6PPOP18OPPA2PPAPOP10OP2OPOPOPOPOOPAOB4CBCBCBACBCBCBCBCBCBCABBEEP2F56EP3BBA4CBCBCBCBCAONO4POPOP2OPOP6OOPOPOPOP3OPOP6OP6OPPOPPA5PPOP20OPPAAPPAPOP10OP8OPPOPAPB4CBCBCBCACBCBCBCBCBC2ABBEP3F54E2PPBBA4C2BCBCBCAPONOPO2POPOPOPOPOPOPOPOPOOP4OOPOPOPOPOPOPOPOP6OPPOPA6PPOP20OPPAAPPAPOP10OP2OPOPOPOPOOPAPB4CBCBCBCBAABCBCBCBCBCBCAABBP4F50E4BBA5C2BCBCBCAO2NO4POP2OPOPOP6OOPOPOPOP3OP16OPPOPA6PPOP20OPPAAPPAPOP10OP8OPPOPAPB4CBCBCBCBAACBCBCBC7ABBP4EF46E5BBA5C4BCBCAPOPONOPOPOPOPOPOPOPOPOPOP2OOP4OOPOPOPOPOPOPOP8OPPOPA5PPOP22OPPAPPAPOP10OP2OPOPOPOPOOPAPB4CBCBCBCBABACBCBCBCBCBCBCBABBP3EEF44E5BBA5C4BCBCAO4NO4POPOPOPOP8OOPOPOPOPPOPOP4OP6OP2OPPOPA5PPOP22OPPAAPAPOP10OP8OPPOPAB5CBCBCBCBABBCCBCBC9AABBPPE4F38PPE4BBA6C8APOPOPONOPOPOPOPOPOPOPOPOPOPOPOOP4OOPOPO18PPOPA5PPOP22OPPAPPAPOP10O10POOPAB5CBCBCBCBABCBCCBCBCBCBCBC4AB2E5PF34P4EEB2A5C7BCAO6NO4POP2OPOPOP6OOPOPOPOPOPOPA27PPOP14A2P4OPPAPPAPOP23OPAB5CBCBCBCBABCCBC15AAB2E4P2F28P7B2A6C9ANO2POPONOPOPOPOPOPOPOPOPOPOP2OOPPOPPOOPOPOAP21A4PPOP13A4P3OPPAAPAPOP14OPOPOPOPOOPAB5CBCBCBCBABC2BCCBCBCBCBC7AAB2E2P6F20E4P4B2A7C7BCAO8NO4POPOP2OP8OOPOPOPOPOOPPAPO16POPA6PPOP11A6PPOPPA2PAPOP23OPAB5CBCBCBCBABC3BAC10AAC3A2BBEP7E4F8P2E8PPBBA8C10ANONOPO2PONOPOPOPOPOPOPOPOPOP2OPOOP4OOPOPOAPOOPOPOP9OP3A5PPOP11A6PPOPPA2PAPOP14OPOPOPOPOOPAB5CBCBCBCBABC4BBABCBCBC5AAC4AAB2P5E8P7E7B2A8C10AAO10NO3PPOP2OPOP8OOPOPOPOPOP2APOP14OP2OPA4PPOP11A6PPOPPA2PAPOP23OPAB5CBCBCBCBAABC5BAC11AAC4A2B3PPE9P7E2B3A9C11AONONONOPOPOPONOPOPOPOPOPOPOPOP2OP2OOP4OOPOPOAPOOPOPOP9OP4A5PPOP11A4PPOPPA2PAP17OPOPOPOPOPPAB5CBCBCBCBABABC5BABCBC9AAC5A3B5E5P4B5A11C12ANO12NO4P2OP2OP8OOPOPOPOPOOPPAPOPPOP6OP3OPOPOPA5P2OP11A2PPOP2AAPPAP24OPPAAB5CBCBCBCBABBABC5BAAC12A2C2B3A5B10A15C12AAONONONONOPOPOPONOPOPOPOPOPOPOPOPOP2OPOOP4OOPOPOAPOOPOPOPOP7OP4A6PPOP16OPPA3PAP17OP2OPOPPAAPB5CBCBCBCBABBABC6BBC15A2C3B5A23C14AAOONO12NPO2PPOP4OP8OOPOPOPOPOP2APOP14OP2OPA7PPOOP12OOPPA4PAP23OPAAPB6CBCBCBCBABBABC8BAAC15A2C6B9A10C15A2ONONONONONO2POPONOPOPOPOPOPOPOPOP2OP2OOP4OOPOPOAPOOP13OP5A6P3OP10OP3A4P21OPOPOPAAOB6CBCBCBCBABBABC9BBAAC33A6C17A2NONOONO12NOOP9OP8OOPOPOPOPOOPPAPOPPOP2OP2OP3OP4OPA7P2O2P4O2P2A5P26OPAAPB6CBCBCBCBABBABC11BBAAC31AAC20AABANONONONONONONOPOPOPONOPOPOPOPOPOPOP2OP2OPOOP4OOPOPOAPOOP13OP6A8P4O4P4A5P23OPOPOPAAOB6CBCBCBCBABBABC13BBAAC50AABAANONONONNO9POONPOOP8OP8OOPOPOPOPOP2APOP14OP6A10P10A5OP2OP24OPAAPB6CBCBCBCBABBAB12C3BBA2C44AACBBANNONONONON14O10PO11P4OOPOPOAPOOP13OP4OPAPA11P4A7P26OPOPOPAAOB6CBCBCBCBABBABC10BC5B2AAC40AABCBBANNONONONONO12POOP23OPOPOPO2PAPOPPOP6OP3OP4OPAPOA22OP2OP26OPAAPB6CBCBCBCBABBABC10BC8BBA3C32A3BCCBAAN3ONONONONONONO2POPOPOPOPOPOPOPOP2OP2OP2OPOOP4OOPOPOAPOOP13OP4OPAP2A20P30OPOPAAOB6CBCBCBCBABBABC10BC10B3A3C24A3B3CBBAN19O3POOP22OOPOPOPOPOPOPAPOP14OP4OPAPOPOA17POP2OP28OPAAPB6CBCBCBCBABBABC10BC14B3A6C10A6B3C3BBAN6ONONONONONO2NO2POPOPOPOP2OP2OP10OOP4OOPOPOAPOOP13OP4OPAPOP3A13P32OPOPOPAAOB6CBCBCBCBABBABC10BC18B6A10B5C7BAAN6ONONONONO5NO6POP20OOPOPOPOPOP2APOPPOP2OP7OP4OPAPOP2OPA9OP38OPAAPB6CBCBCBCBABBABC10BC25B10C11BBAN9ONONONONONO2NO2POPOPOPOPOPOPOP2OP2OP2OPOOP4OOPOPOAPOOP13OP4OPAPOP50OPOPOPAAOB6CBCBCBCBABBABC10BC10BBC3BBC28BBAN9ONONONO7NO3POOP22OOPOPOPOP4APOP14OP4OPAPOPOP2OP2OP44OPAAPB6CBCBCBCBABBAB12C10BBC3BBC27BAAN11ONONONONO4NO2POPOPOPOP2OP6OP6OOP4OOPOPOAPOOPOP11OP4OPAPOP50OPOPOPAAOB6CBCBCBCBABBABC22BBC31BBAN12ONONO9NO5P23OOPOPOPOP4APOPPOP11OP4OPAPOP54OPAAPB6CBCBCBCBABBABC28BBC24BBAN14ONONONONO4NO2POPOPOPOPOP2OP2OP2OP2OPOOP4OOPOPOAPOOPOP11OP4OPAPOP52OPOPAAPB6CBCBCBCBABBABC22BBC3BBC23BAAN29O3POP23OOPOPOPOPOP2APOP14OP4OPAPOP54OPAAPB6CBCBCBCBABBABC52BBAN17ONONONONO8POPOP2OP2OP2OP10OOP4OOPOPOAPO16P4OPAPOP42"

C1_Door_01 =
	"A6IA48I8A56IA56IIAAN3A41E2A5N6A38OE5A3NIN5A37OE5OPIIN9A35OE5OPIN5ON5A33OE5OPIN4OON7A31OE5OPIN3OPON8ON2A26OE5OIIN3OPON13AO2A21OE5OIIN3OPON6ONONONO5A20OE5OIIN3OPON13O5A19OE5OPIN3OPON8ONONONO5A18OE5OPIN3OPON15O5A17OE5OPIN3OPON6ONONONONONO5A16OE5OPIN3OPON14ONNO5A15OE5OIIN3OPON8ON2ONONONO5A14OE5OIIN3OPON16ONNO5A13OE5OIIN3OPON6ONONONONONONONO5A12OE5OPIN3OPON14ON2O8A11OE5OPIN3OPON8ONONONONONONONO5A10OE5OPIN3OPON16ON2ONNO5A9OE5OPIN3OPON6ONONONONONONONONONO4A9OE5OIIN3OPON14ON2ON2ONO5A8OE5OIIN3OPON8ON2ONONONONONONO5A8OE5OIIN3OPON16ON2ON2ONO4A7OE5OPIN3OPON6ONONONONONONONONONONO4A7OE5OPIN3OPON14ON2ONONON2O5A6OE5OPIN3OPON8ONONONONONONONONONONO3A6OE5OPIN3OPON16ON2ON2ON2ONO2A5OE5OIIN3OPON6ONONONONONONONONONONONONO3A4OE5OIIN3OPON14ONONON2ONONON2O3A4OE5OIIN3OPON8ONONONONONONONONONONONO4A3OE5OPIN3OPON16ON2ON2ON2ONO4A3OE5OPIN3OPON6ONONONONONONONONONONONONONO2A3OE5OPIN3OPON14ON2ONONON2ONONONO2A3OE5OPIN3OPON8ONONONONONONONONONONONONO2A3OE5OIIN3OPON16ON2ON2ON2ON2O2A3OE5OIIN3OPON8ONONONONONONONONONONONO5A2OE5OIIN4PON14ON2ON2ONONON2ONONOOA2OE5OPIN5ON8ONONONONONONONONONONONONONOOA2OE5OPIN5ON16ON2ON2ON2ON2ONOOA2OE5OPIN5ON6ONONONONONONONONONONONONONONOOA2OE5OPIN6ON13ON2ON2ON2ONONONONOOA2OE5OOIN7ON6ONONONONONONONONONONONONONOOA2OE6OIIN7ON13ON2ON2ON2ON2O4A2OE6OIIN7ON4ONONONONONONONONONONONONOONOOA3OE6OIIN6ON10ON2ON2ON2ON2ONNONOOA4OE6OIIN5ON4ONONONONONONONONONONONONOONOOA5OE6OIIN4ON16ON2ON2ON2OONOOA6OE5OPIN4ON4ONONONONONONONONONONONONOONOOA7OE4OPIN4ON10ON2ON2ON2ON2ONNONO2A7OE3OPIN4ON4ONONONONONONONONONONONONOONO2A7OE3OPIN4OPN11ON6ON6ONO3A7OE3OIIN4OPON2ONONONONONONONONONONONONONO3A7OE3OIIN4OPON8ON2ON2ON2ON2ON2O3A7OE3OIIN4OPON2ONONONONONONONONONONONONONO3A7OE3OPIN4OPON14ON6ON4O3A7OE3OPIN4OPONON2ONONONONONONONONONONONONO3A7OE3OPIN4OPON8ON2ON2ON2ON2ON2O3A7OE3OPIN4OPON2ON2ONONONONONONONONONONO5A7OE3OIIN4OPON10ON6ON6ONO2A8OE3OIIN4OPONONONONONONONONONONONONONONONO2A8OE3OIIN4OPON8ON2ON2ON2ON2ON2O2A8OE3OPIN4OPON2ON2ONONONONONONONONONONONO2A8OE3OPIN4OPON6ON6ON6ON2O4A8OE3OPIN4OPONON2ONONONONONONONONONONONO4A8OE3OPIN4OPON8ON2ON2ON2ON2ONO3A9OE3OIIN4OPON2ON2ONONONONONONONONONONO3A9OE3OIIN4OPON10ON6ON6O2A10OE3OIIN4OPONON2ONONONONONONONONONONONO2A10OE3OPIN4OPON8ON2ON2ON2ON2ONO2A10OE3OPIN4OPON2ON2ONONONONONONONONONO3A11OE3OPIN4OPON6ON6ON6ONO2A12OE3OPIN4OPONON2ONONONONONONONONONONO2A12OE3OIIN4OPON8ON2ON2ON2ONONOOA13OE3OIIN4OPON2ONONONONONONONONONONO3A13OE3OIIN4OPON10ON6ONONO2A14OE3OPIN4OPONON2ONONONONONONONONONOOA15OE3OPIN4OPON4ON2ON2ON2ON2O3A15OE3OPIN4OPON2ONONONONONONONONONO2A16OE3OPIN4OPON14ONNO4A17OE3OIIN4OPONON2ONONONONONONO5A17OE3OIIN4OPON8ON2ON2O4A18OE3OIIN4OPON2ONONONONONONO5A19OE3OPIN4OPON14O4A20OE3OPIN4OPON4ONONONONONO3A21OE3OPIN4OPON4ON2ON2O5A21OE3OPIN4OPON4ONONONONO4A22OE3OIIN4OPON11O4A23OE3OIIN4OPNNON2ONONO6A24OE3OIIN4ON6ONNO7A24OE3OPIN4ON6ONO7A25OE3OPIN4ON7O7A26OE3OPIN4ON6O7A27OE3OPIN11O7A28OE3OIIN8O9A29OE3OI2N4AO10A30OE3OI3N2O11A31OE3OIINAAO12A32OE3OIA2O11A34OENINIA3O9A47O3A33"

C1_Door_02 =
	"A33O3A47O9A3ININEOA34O11A2IOE3OA32O12AAI2OE3OA31O11N2I3OE3OA30O10AN4I2OE3OA29O9N8IIOE3OA28O7N11IPOE3OA27O7N6ON4IPOE3OA26O7N7ON4IPOE3OA25O7NON6ON4IPOE3OA24O7NNON6ON4IIOE3OA24O6NONON2ONNPON4IIOE3OA23O4N11OPON4IIOE3OA22O4NONONONON4OPON4IPOE3OA21O5N2ON2ON4OPON4IPOE3OA21O3NONONONONON4OPON4IPOE3OA20O4N14OPON4IPOE3OA19O5NONONONONONON2OPON4IIOE3OA18O4N2ON2ON8OPON4IIOE3OA17O5NONONONONONON2ONOPON4IIOE3OA17O4NNON14OPON4IPOE3OA16O2NONONONONONONONONON2OPON4IPOE3OA15O3N2ON2ON2ON2ON4OPON4IPOE3OA15OONONONONONONONONONON2ONOPON4IPOE3OA14O2NONON6ON10OPON4IIOE3OA13O3NONONONONONONONONONON2OPON4IIOE3OA13OONONON2ON2ON2ON8OPON4IIOE3OA12O2NONONONONONONONONONON2ONOPON4IPOE3OA12O2NON6ON6ON6OPON4IPOE3OA11O3NONONONONONONONONON2ON2OPON4IPOE3OA10O2NON2ON2ON2ON2ON8OPON4IPOE3OA10O2NONONONONONONONONONONON2ONOPON4IIOE3OA10O2N6ON6ON10OPON4IIOE3OA9O3NONONONONONONONONONON2ON2OPON4IIOE3OA9O3NON2ON2ON2ON2ON8OPON4IPOE3OA8O4NONONONONONONONONONONON2ONOPON4IPOE3OA8O4N2ON6ON6ON6OPON4IPOE3OA8O2NONONONONONONONONONONON2ON2OPON4IPOE3OA8O2N2ON2ON2ON2ON2ON8OPON4IIOE3OA8O2NONONONONONONONONONONONONONONOPON4IIOE3OA8O2NON6ON6ON10OPON4IIOE3OA7O5NONONONONONONONONONON2ON2OPON4IPOE3OA7O3N2ON2ON2ON2ON2ON8OPON4IPOE3OA7O3NONONONONONONONONONONONON2ONOPON4IPOE4OA6O3N4ON6ON14OPON4IPOE5OA5O3NONONONONONONONONONONONONON2OPON4IIOE6OA4O3N2ON2ON2ON2ON2ON8OPON4IIOE7OA3O3NONONONONONONONONONONONONON2OPON4IIOE8OA2O3NON6ON6ON11PON4IPOE9OAAO2NOONONONONONONONONONONONONON4ON4IPOE10OAO2NONNON2ON2ON2ON2ON10ON4IPOE10OAAOONOONONONONONONONONONONONONON4ON4IPOE10OAAOONOON2ON2ON2ON16ON4IIOE10OAAOONOONONONONONONONONONONONONON4ON5IIOE9OAAOONONNON2ON2ON2ON2ON10ON6IIOE8OAAOONOONONONONONONONONONONONONON4ON7IIOE7OAAO4N2ON2ON2ON2ON13ON7IIOE6OA2OONONONONONONONONONONONONONON6ON7IOOE5OA2OONONONONON2ON2ON2ON13ON6IPOE5OA2OONONONONONONONONONONONONONONON6ON5IPOE5OA2OONON2ON2ON2ON2ON16ON5IPOE5OA2OONONONONONONONONONONONONONON8ON5IPOE5OA2OONONON2ONONON2ON2ON14OPN4IIOE5OA2O5NONONONONONONONONONONON8OPON3IIOE5OA3O2N2ON2ON2ON2ON16OPON3IIOE5OA3O2NONONONONONONONONONONONON8OPON3IPOE5OA3O2NONONON2ONONON2ON14OPON3IPOE5OA3O2NONONONONONONONONONONONONON6OPON3IPOE5OA3O4NON2ON2ON2ON16OPON3IPOE5OA3O4NONONONONONONONONONONON8OPON3IIOE5OA4O3N2ONONON2ONONON14OPON3IIOE5OA4O3NONONONONONONONONONONONON6OPON3IIOE5OA5O2NON2ON2ON2ON16OPON3IPOE5OA6O3NONONONONONONONONONON8OPON3IPOE5OA6O5N2ONONON2ON14OPON3IPOE5OA7O4NONONONONONONONONONON6OPON3IPOE5OA7O4NON2ON2ON16OPON3IIOE5OA8O5NONONONONONON2ON8OPON3IIOE5OA8O5NON2ON2ON14OPON3IIOE5OA9O4NONONONONONONONONON6OPON3IPOE5OA9O5NNON2ON16OPON3IPOE5OA10O5NONONONONONONON8OPON3IPOE5OA11O8N2ON14OPON3IPOE5OA12O5NONONONONONONON6OPON3IIOE5OA13O5NNON16OPON3IIOE5OA14O5NONONON2ON8OPON3IIOE5OA15O5NNON14OPON3IPOE5OA16O5NONONONONON6OPON3IPOE5OA17O5N15OPON3IPOE5OA18O5NONONON8OPON3IPOE5OA19O5N13OPON3IIOE5OA20O5NONONON6OPON3IIOE5OA21O2AN13OPON3IIOE5OA26N2ON8OPON3IPOE5OA31N7OON4IPOE5OA33N5ON5IPOE5OA35N9IIPOE5OA37N5INA3E5OA38N6A5E2A41N3AAIIA56IA56I8A48IA6"

C1_Sparks_01 = "DA51DA3EA2E0"

C1_Sparks_02 = "A8DA40EA2EA3EA8"

C1_Sparks_03 = "A2EA14EA2EA7DA6"

C1_Sparks_04 = "DA7EA16EA14EA2EA7DA6"

C1_Triangle =
	"F37P8F69P5O8P5F60P2O20P2F54P2AAPO20PAAP2F49PPA3PO4P12O4PA3PPF45PPA5PO3P14O3PA5PPF41PPA6PO4PA12PO4PA6PPF38PA8PO3PAPOP8OPAPO3PA8PF36PAPA6PO4PAO12APO4PA8PF33PPA9PO3PAPO12PAPO3PA9PPF30PPAPAPAPA3PO4PAO14APO4PA7PAPPF28PA11PO3PAPO14PAPO3PA11PF26PAAPAPAPAPA2PO4PAO16APO4PA4PAPAPAPPF24PA12PO3PAPO16PAPO3PA12PF22PAAPAPAPAPAPAAPO4PAO4PO2PO2PO4APO4PA3PAPAPAPAAPF20PA13PO3PAPO4PO2PO2PO4PAPO3PA13PF18PAAPAPAPAPAPAPAPO4PAO5PO2PO2PO5APO4PA2PAPAPAPAPAAPF17PA13PO3PAPO20PAPO3PA13PF16PAPAPAPAPAPAPAAPO4P26O4PAAPAPAPAPAPAPAPF14PA14PO3PAPO22PAPO3PA14PF12PAPAPAPAPAPAPAPAPO4PAPO22PAPO4PA2PAPAPAPAPAPAPF11PA14O4PAPPO22PPAPO4A14PF10PPAPAPAPAPAPAPAAPO3PPAOPO22POAPPO3PA3PAPAPAPAPAPPF9PA14O4PAPOPO22POPAPO4A14PF8PAPAPAPAPAPAPAPAPO3PPAOOPO22POOAPPO3PA2PAPAPAPAPAPAPF7PA14O4PAPOOPO22POOPAPO4A14PF6PPAPAPAPAPAPAPAAPO3PPAO2PO22PO2APPO3PA3PAPAPAPAPAAPF5PA14O4PAPO2PO22PO2PAPO4A14PF5PPAPAPAPAPAPAPAPO3PPAO3PO22PO3APPO3PA2PAPAPAPAPAPPF4PA13PO4PAPO3PO22PO3PAPO4PA13PF3PAPAPAPAPAPAPAAPO3PPAO4PO22PO4APPO3PAAPAPAPAPAPAPAPF3PA12PO4PAPO4PO22PO4PAPO4PA12PF2PPAPAPAPAPAPAPAPO3PPAO5PO22PO5APPO3PA2PAPAPAPAPAPPFFPA12PO4PAPO5PO22PO5PAPO4PA12PFFPPAPAPAPAPAPAAPO3PPAO6PO22PO6APPO3PAAPAPAPAPAPAPPFFPA11PO4PAPO6PO22PO6PAPO4PA11PFFPPAPAPAPAPAPAPO3PPAO7PO22PO7APPO3PA2PAPAPAPAPPFFPA10PO4PAP42APO4PA10PFPAPAPAPAPA3PO3PPAPO9POP16OPO9PAPPO3PAAPAPAPAPAPAPPA10PO4PAPPO6PAOPOPO14POPOAPO6PPAPO4PA10PPAPAPAPAPA2O4PPAOPO9POPO14POPO9POAPPO4A2PAPAPAPAPPA9PO3PPAPOPO9POPO14POPO9POPAPPO3PA9PPAPAPAPA3O4PPAOOPO6PAOPOPO14POPOAPO6POOAPPO4AAPAPAPAPAPPA8PO3PPAPOOPO9POPO14POPO9POOPAPPO3PA8PPA8O4PPAO2PO9POPO14POPO9PO2APPO4A2PAPAPAPPA7PO3PPAPO2PO9POPO14POPO9PO2PAPPO3PA7PPA7O4PPAO3PO9POPO14POPO9PO3APPO4A7PFPA5PO3PPAPO3PO9POPO14POPO9PO3PAPPO3PA5PFFPA5O4PPAO4PO9POPO14POPO9PO4APPO4A5PFFPA4PO3PPAPO4PO9POPO14POPO9PO4PAPPO3PA4PFFPA4O4PPAO5PO9POP16OPO9PO5APPO4A4PFFPA3PO3PPAP7O9PO18PO9P7APPO3PA3PFFPA3O4PPAO6PO9PO18PO9PO6APPO4A3PF2PAAPO3PPAPO6PO9PO18PO9PO6PAPPO3PAAPF3PAAO4PPAO7PO9PO18PO9PO7APPO4AAPF3PAPO3PPAPO7PO9PO18PO9PO7PAPPO3PAPF4PO4PPAO8PO9PO18PO9PO8APPO4PF5PO4AAPO8PO9PO18PO9PO8PAAO4PF5PO4PAPPO7PO9PO18PO9PO7PPAPO4PF6PO4AP2O6PO6PAOPO18POAPO6PO6P2AO4PF7PO5APPO6PO9PO18PO9PO6PPAO5PF8PO4PAPPO5PO9PO18PO9PO5PPAPO4PF9PO5PAPPO4PO6PAOPO18POAPO6PO4PPAPO5PF10PO4PAP2O3PO9PO18PO9PO3P2APO4PF11PO5PAP54APO5PF12PO5PA54PO5PF14PO4P56O4PF16PO15PO30PO15PF17PO15PO30PO15PF18PO14PO30PO14PF20PO13PO30PO13PF22PO12PO30PO12PF24P58F26PA54PF28PA9PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA9PF30PPA48PPF33PA6PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA4PF36PA44PF38PPA3PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAAPPF41PPA36PPF45PPAAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAP2F49P2A26P2F54P2AAPAPAPAPAPAPAPAPAPAP3F60P5A8P5F69P8F37"

C1_Welding_01 = "MA32DMA32DEA32EEA31DEA32DEA32DEA31DDECA31DDCDDCCDC2DC3DC2DCACCAAC0"

C1_Welding_02 =
	"A11MA13EA14MA13EA14EA13EA14EA13EA14EA13EA14EA13EA14DA13DA14DA13DA14DA13DA14DA13DA14DA13DA14CA13CA15DA15CA14CA15DA15CA14CCA14CCA14CCACCA3C0"

C1_Welding_03 =
	"A20MA20MA19EA20EA19EA20EA19EA20EA19DA20EA19DA20DA19DA20DA19DA20DA19DA20DA19CA20DA19CA20CA19DA20CA19CA20CA19CA20CA19CA20CA19CA20CA19CA20CA62CA63CA84CA66CA18"

C1_Welding_04 = "A13EDE2M2A12DA20DA19DA20DA19DA20DA19DA20DA19DA20CA19DA20DA19CA20CA19DA20CA19CA20CA19CA41CA84CA63CA20"

C1_Welding_05 =
	"A2C6DDCCDCA27CA12CA12CA11CA14DA26CA27DA8CA16DA27DA26DA27DA26DA27DA26DA27EA26DA27EA26EA27EA26DA27EA26MA27EA26MA27M0"

C1_Welding_06 =
	"CCA28CA108CA53CA25CA26CA25CA26CA25CA26CA25CA26DA25CA26CA25CA26DA25CA26DA25DA26CA25CA26DA25CA26DA25DA26DA25DA26DA25DA26DA25DA26EA25EA26DA25DA26EA25EA26EA25EA26EA25MA26EA25M0"

C1_Welding_07 =
	"A3CA15CA16CA15CA16CA15CA16CA15CA16CA15CA16CA15CA16CA15DA16CA15CA16CA15DA16CA15CA16DA15CA16DA15CA16DA15DA14DA14DA14DDA14EA14DA14DA4EMMEEMDEDDEDA4"

C1_Welding_08 = "A49CA149CAAM3E4DDED2ED4C2DC4DC2DC7AACA4"

C1_Machine_01 = "AP62A3N60P6O2P2O2P2O2P2O2P2O2P2O2P2O2P2O2P2O2PPO2NNPA2N60P64A0"

C1_Machine_02 =
	"A26I28A4I26C27BIA4C22BCBC27BIIA3C22BCBC27BCIA3B54CIA2I55CIA57IBIA50I7CI3A47IB4IIBIIBIA47IB4IIBIIBIA47PBC3IIBIIBPA47PBC4I2CBPA47PBC8BPA47PBC8BPA47PB10PA47IBC8BIA47IB10IA47I12"

C1_Machine_03 =
	"B4AB3AB3AB7AB4AB3AB3AB3ABAABC3ABC2ABC2ABC3BBAB4AB3AB3AB6ABC3ABC2ABC2ABC4BABC20BABC20BABC20BABC20BABC20BABC20BABC20BABC20BABC20BABC20BABC20BABC20BABC20BABC20BABC19BBABC18BCBABC17BCCBABC16BC2BABC16BC2BABC16BC2BABC16BC2BABC16BC2B3C15BC2BAB2C14BC2BAAB19CA3B2C15BA4B19"

function loadC01Sprites()
	loadExtendedSprite(unpac_noheader(C1_Bg), "C1_Bg", 240, 136, 5)
	loadExtendedSprite(unpac_noheader(C1_Door_01), "C1_Door_01", 57, 104, 0)
	loadExtendedSprite(unpac_noheader(C1_Door_02), "C1_Door_02", 57, 104, 0)
	loadExtendedSprite(unpac_noheader(C1_Sparks_01), "C1_Sparks_01", 9, 7, 0)
	loadExtendedSprite(unpac_noheader(C1_Sparks_02), "C1_Sparks_02", 10, 7, 0)
	loadExtendedSprite(unpac_noheader(C1_Sparks_03), "C1_Sparks_03", 8, 5, 0)
	loadExtendedSprite(unpac_noheader(C1_Sparks_04), "C1_Sparks_04", 8, 8, 0)
	loadExtendedSprite(unpac_noheader(C1_Triangle), "C1_Triangle", 85, 85, 5)
	loadExtendedSprite(unpac_noheader(C1_Welding_01), "C1_Welding_01", 34, 9, 0) -- 10,57
	loadExtendedSprite(unpac_noheader(C1_Welding_02), "C1_Welding_02", 16, 32, 0) -- 10,34
	loadExtendedSprite(unpac_noheader(C1_Welding_03), "C1_Welding_03", 22, 47, 0) -- 14,7
	loadExtendedSprite(unpac_noheader(C1_Welding_04), "C1_Welding_04", 22, 29, 0) -- 22,6
	loadExtendedSprite(unpac_noheader(C1_Welding_05), "C1_Welding_05", 28, 24, 0) -- 33,6
	loadExtendedSprite(unpac_noheader(C1_Welding_06), "C1_Welding_06", 27, 47, 0) -- 45,6
	loadExtendedSprite(unpac_noheader(C1_Welding_07), "C1_Welding_07", 17, 33, 0) -- 58,33
	loadExtendedSprite(unpac_noheader(C1_Welding_08), "C1_Welding_08", 51, 5, 0) -- 21,61
	loadExtendedSprite(unpac_noheader(C1_Machine_01), "C1_Machine_01", 65, 5, 0)
	loadExtendedSprite(unpac_noheader(C1_Machine_02), "C1_Machine_02", 61, 18, 0)
	loadExtendedSprite(unpac_noheader(C1_Machine_03), "C1_Machine_03", 24, 32, 0)
end

-- Construction02

C2_Lights = "A32HA72FGHA69FFG2HA66H8A3461FA48FA24FA48FA484FFA67FF0"

C2_Door_01 =
	"A2P56A5P58A3P60AAP62AP6O49P12O51P10OP47O4P6OPOP49O3P6OP52NOOP6OP52O2P6OP2O48PNNOP5O2P2OPOPOPPOP3OOP2OPPOP27ONOP4O3PPO48PNNO9PPO2P5O30P5O2PNNONO7PPOOPPE3PPO28PPE3PPOOPNNONO3P9E3P31IE3P16E3PPE3PEEP4E3P4E3P4E4PPE3PE3P4E3P3E2PPE3PE2P4E3P4E3P4E3PPE3PPE3P4EEP9E3P32E3P12O2POPOOPPE3PPO28PPE3PPOOPNNONO6POPOOP6O29P6O2PNNONO6POPO48PNNONO6POPO48PNNONO6POPO48PNNONO6POPO48PNNONO6POPO48PNNONO6POPO2PPO38PPOOPN2ONO6POOPOOPPO38PPOPN3ONO7POON49ONO9PN49ONO4AAO4P49NO4A3O58A5O56A7O54A9O52A5"

C2_Door_02 =
	"A2P56A5P58A3P60AAP5O50P5AP4OP47O3P9OP49O3P6OP52O2P60O2P6OP2OP46OPNOOP7OP2OPOPOPPOP3OOP2OPPOP27O2P6OOPPO48PNNO5PPOOPPO2P5O30P5O2PONONP3O3PPOOPPE3PPO28PPE3PPOOPNNONO3P9E3P31IE3P16E3PPE3PEEP4E3P4E3P4E4PPE3PE3P4E3P3E2PPE3PE2P4E3P4E3P4E3PPE3PPE3P4EEP9E3P32E3P22E3P32E3P12EP3E2PPI3PE2P4E3P4E3P4E3PI4PE4P4EEP3E3PI4PEEP4E3P4E3P4E4PI4PE3P4E2P8I4P31I4P12O2POPOOPI4PPO28PPI3PPOOPNNONO6POPO2P5O30P5O2PNNONO6POPO48PNNONO6POPO48PNNONO6POPO48PNNONO6POPO48PNNONO6POPO48PNNONO6POPO2PPO38PPOOPN2ONO6POOPOOPPO38PPOPN3ONO2AAO2POON49ONO2A3O2PN49ONO2A5O2P49NO2A7O54A9O52A5"

C2_Door_03 =
	"A52P8A56P2A2PA21PA135P56A11P58A9P60A7P62A6P63A5P63A5P63A5P2OP50OOP6A3JAP2OPPOP47OOP4OOA3JAP2OPPOPOP45OOP6A2JAAP9O3PPO28PPO3PPO3P2O3AAJ2AP9O3P31IO3P12A2JAAP3E3PPE3PEEP4E3P4E3P4E4PPE3PE3P4E2AJAJJAEP3E2PPE3PE2P4E3P4E3P4E3PPE3PPE3P4EEAJ12PPE3J30PPE3J17M8PPE3MMLM6LMMLLML7MKML3JPE3LLKLKJJKKML2JJAJJM8J5MMLM6LMMLLML7MKML3J5LLKLKJ2KML2JJAJJM16LM6LMMLLML7MKML11KLKJJKKML2J4M16LM6LMMLLML7MKML11KLKJKJKML2J14M4J31L4J14AJJAEP3E2PJ4PE2P4E3P4E3P4E3PJ4PE4P4EEAJAJJAP3E3PI4PEEP4E3P4E3P4E4PI4PE3P4E2AJ3AP8I4P31I4P12AAJ2AO2POPOOPI4PPO28PPI3PPOOPNNONO3A2JAAO2POPO2P5O30P5O2PNNONO3A3JAO2POPO48PNNONO3A5O2POPO48PNNONO3A5O2POPO48PNNONO3A5O2POPO48PNNONO3A5O2POPO48PNNONO2A7OOPOPO2PPO38PPOOPN2ONOOA9OPOOPOOPPO38PPOPN3ONOA11OPOON49ONOA13OPN49ONOA15OP49NOA9"

C2_Door_04 =
	"A53P5A108P2AAP4A8PA95P56A11P58A9P60A7P62A6P63A3JAP63A2JAAP9O3P32O3P12AAJ2AP7JPO3P30JIO3P12A2JAAP3O3PPO3POOP4O3P4O3P4O4PPO3PO3P4O2AJAJJAOP3O2JPO3PO2P4O3P4O3P4O3JPO3PPO3P4OOAJ13PO3J31PO3J17M8JPE3MMLM6LMMLLML7MKMLMLLJPE3MLKLKJKJKML2KJAJJM8K4JMMLM6LMMLLML7MKML3K4JLLKLKKJJKML2JJAJJM16LM6LMMLLML7MKML11KLKKJJKML2KJ3M16LM6LMMLLML7MKML11KLKJKJKML2KJ3M16LM6LMMLLML7MKML11KLKJJKKML2KJAJKM16LM6LMMLLML7MKML11KLKJ2KML2KJAJKM16LM6LMMLLML7MKML11KLKJJKKML2KJ2KM16LM6LMMLLML7MKML11KLKJKJKML2J4M16LM6LMMLLML7MKML11KLKKJJKML2KJAJJM16LM6LMMLLML7MKML11KLKJ2KML2JJAJJM16LM6LMMLLML7MKML11KLKKJJKML2J11KJKM4KKJ27KJL4JKJJKJ12AEP3E2PJK2JPE2P4E3P4E3P4E3PJK2JPE4P4EEJJAJJAP3E3PI4PEEP4E3P4E3P4E4PI4PE3P4E2AJAJJAP8I4P31I4P12AJ3AO2POPOOPI4PPO28PPI3PPOOPNNONO3A2JJAO2POPO2P5O30P5O2PNNONO3A2JAAO2POPO48PNNONO3A2JAAO2POPO48PNNONO2A7OOPOPO48PNNONOOA9OPOPO48PNNONOA11POPO48PNNONA13OPO2PPO38PPOOPN2OA15OPOOPPO38PPOPN3A9"

C2_Door_05 =
	"A354P56A11P58A3JA2JAP8O3P32O3P10A2JJA2P7JPO3P30JIO3P11AJ2AJAP3O3PPO3POOP4O3P4O3P4O4PPO3PO3P4O2A2JPAOP3O2JPO3PO2P4O3P4O3P4O3JPO3PPO3P4OOAJ7K3JJPO3JK9JJKJ3K7JJKJ2PO3JK5JJKJ7M8JPE3MMLM6LMMLLML7MK5JPE3K2LKKJJK5JAJJM8K5M24KM4K5MLKLKJKJKM3JJAJKM16L21MKML11KLKJJKKML2KJ2KM16LM6LMMLLML7MKMLML7MLKLKJJKKML2KJ3M16LM6LMMLLML7MKMLML7MLKLKJKJKML2KJAKKM16LM6LMMLLML7MKML11KLKKJJKML2KJAKKM16LM6LMMLLML7MKML11KLKKJJKML2KJJKKM16LM6LMMLLML7MKML11KLKJKJKML2KJK2M16LM6LMMLLML7MKML11KLKJJKKML2KJAKKM16LM6LMMLLML7MKML11KLKJ2KML2KJAKJM16LM6LMMLLML7MKML11KLKJJKKML2KJK2M16LM6LMMLLML7MKML11KLKJKJKML2KJJKKM16LM6LMMLLML7MKML11KLKKJJKML2KJAKKM16LM6LMMLLML7MKML11KLKJ2KML2KJAKKM16LM6LMMLLML7MKML11KLKKJJKML2KJJKKM16LM6LMMLLML7MKML11KLKJKJKML2KJAJKM16LM6LMMLLML7MKML11KLKJJKKML2KJAJJM16LM6LMMLLML7MKML11KLKJ2KML2KJAJJM16LM6LMMLLML7MKML11KLKJJKKML2KJAJ5KKJKJKM4K6JJKJJKJK4J2KJKJK5L4K5JKJKKJ3AJJAEP3E2PK4PE2P4E3P4E3P4E3PK2JKPE4P4EEAJAJPAP3E3PI4PEEP4E3P4E3P4E4PI4PE3P4E2AJAJJAP8I4P31I4P11AJ3AJAOOPOPOOPI4PPO28PPI3PPOOPNNONOOA3JA4OPOPO2P5O30P5O2PNNONOA3JA6POPO48PNNONA13OPO48PNNOA15PO48PNNA79"

C2_Door_06 =
	"A146KA68JA56KJ2A7KAPPO2JPO3PO2P4O3P4O3P4O3JPO3PPO3P2AKAAJA5K7JPO3K30JPO3K9LKJ2A3KM7JPE3MLM5LLMLLML8MKML4JPE3LKLKJ2KML2KAAKAAKM8K5MMLM5LLMLLML8MKML3K5LLKLK4ML2K3AKM16LM6LMMLLML7MKMLML7MLKLKJJKKML2KJAKAKM16LM6LMMLLML7MKMLML7MLKLKJKJKML2KJJKAKM16LM6LMMLLML7MKML11KLKKJJKML2KJAKAKM16LM6LMMLLML7MK14LKKJJK5JKKAKM39KM11LKLKJKJKM3KJJKAKM16L21MKML11KLKJJKKML2KJKKAKM16LM6LMMLLML7MKMLML7MLKLKJJKKML2KJAKAKM16LM6LMMLLML7MKMLML7MLKLKJKJKML2KJAKAKM16LM6LMMLLML7MKML11KLKKJJKML2KJKKAKM16LM6LMMLLML7MKML11KLKKJJKML2KJJKAKM16LM6LMMLLML7MKML11KLKJKJKML2KJAKAKM16LM6LMMLLML7MKML11KLKJJKKML2KJAKAKM16LM6LMMLLML7MKML11KLKJ2KML2KJKKAKM16LM6LMMLLML7MKML11KLKJJKKML2KJAKNKM16LM6LMMLLML7MKML11KLKJKJKML2KJAKNKM16LM6LMMLLML7MKML11KLKKJJKML2KJAKNKM16LM6LMMLLML7MKML11KLKJ2KML2KJAKAKM16LM6LMMLLML7MKML11KLKKJJKML2KJKKAKM16LM6LMMLLML7MKML11KLKJKJKML2KJJKAKM16LM6LMMLLML7MKML11KLKJJKKML2KJAKAKM16LM6LMMLLML7MKML11KLKJ2KML2KJAKAKM16LM6LMMLLML7MKML11KLKJJKKML2KJKKAKM16LM6LMMLLML7MKML11KLKJKJKML2KJJKAKM16LM6LMMLLML7MKML11KLKKJJKML2KJAKAKM16LM6LMMLLML7MKML11KLK4ML2KJAKAKM16LM5LLMLLML8MKML11KLK4ML2K3AKJM14LM5LLMLLML8MKML11KLKJ2KML2KAAKAAONJK7M3K32L3K12JJKA4NJAPPE2PK3PE3P4E3P4E3P4E3PK3PPE4P2AKAAKA6NJAE3PI3PE2P4E3P4E3P4E4PI3PE4P2AKJ2A8NJAP3I3P44A15NJA53JAJA12NK3A59"

C2_Door_07 =
	"A7J53A84K56J2A9KM8LM5LLMLLML8MKML11KLK4ML2KJ2A7KM10LM5LLMLLML8MKML11KLKJ2KML2KAAJA5KM12LM5LLMLLML8MKML11KLK4ML2KJ2A3KM14LM5LLMLLML8MKML11KLKJ2KML2KAAKAAKM16LM5LLMLLML8MKML11KLK4ML2K3AKM16LM6LMMLLML7MKMLML7MLKLKJJKKML2KJAKAKM16LM6LMMLLML7MKMLML7MLKLKJKJKML2KJJKAKM16LM6LMMLLML7MKML11KLKKJJKML2KJAKAKM16LM6LMMLLML7MK14LKKJJK5JKKAKM39KM11LKLKJKJKM3KJJKAKM16L21MKML11KLKJJKKML2KJKKAKM16LM6LMMLLML7MKMLML7MLKLKJJKKML2KJAKAKM16LM6LMMLLML7MKMLML7MLKLKJKJKML2KJAKAKM16LM6LMMLLML7MKML11KLKKJJKML2KJKKAKM16LM6LMMLLML7MKML11KLKKJJKML2KJJKAKM16LM6LMMLLML7MKML11KLKJKJKML2KJAKAKM16LM6LMMLLML7MKML11KLKJJKKML2KJAKAKM16LM6LMMLLML7MKML11KLKJ2KML2KJKKAKM16LM6LMMLLML7MKML11KLKJJKKML2KJAKNKM16LM6LMMLLML7MKML11KLKJKJKML2KJAKNKM16LM6LMMLLML7MKML11KLKKJJKML2KJAKNKM16LM6LMMLLML7MKML11KLKJ2KML2KJAKAKM16LM6LMMLLML7MKML11KLKKJJKML2KJKKAKM16LM6LMMLLML7MKML11KLKJKJKML2KJJKAKM16LM6LMMLLML7MKML11KLKJJKKML2KJAKAKM16LM6LMMLLML7MKML11KLKJ2KML2KJAKAKM16LM6LMMLLML7MKML11KLKJJKKML2KJKKAKM16LM6LMMLLML7MKML11KLKJKJKML2KJJKAKM16LM6LMMLLML7MKML11KLKKJJKML2KJAKAKM16LM6LMMLLML7MKML11KLK4ML2KJAKAKM16LM5LLMLLML8MKML11KLK4ML2K3AKKM14LM5LLMLLML8MKML11KLKJ2KML2KAAKAAOKKM12LM5LLMLLML8MKML11KLK4ML2KJJKA4KKM10LM5LLMLLML8MKML11KLKJ2KML2KAAKA6JKM8LM5LLMLLML8MKML11KLK4ML2KJ2A8JKM6LM5LLMLLML8MKML11KLKJ2KML2KLA12JK57A12JN54A8"

C2_ShipbgSprite =
	"A20C15B2C3B2C42D2C2D4C37A20C15B2C3B2C42D2C2D4C37A20C15B2C3B3C40D3C2D4C37A20C15B2C3B3D44C2D4C37A20C15B2C4BBD44C3D4C37A20C15B2C5D44C4D4C37A20C15B2C55D4C37A20C14DB2C55D4C37A20C13DB3C55D5C36A20C12DB4C56D5C35A20C11DB4DC56D6C34A20C10DB4DC58D6C33A20C9DB4DC22DC18DCDC14D6C32A20C8DB4DC62D6C31A20C7DB4DC2DC10DCDCDCDCDCDCDCDC2DCDCDCDCDCDCDCDC2DCDCDC4DC2D6C30A20C6DB4DC66D6C29A20C5DB4DC8DC4DCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDC8DCDCDCD6C28A20C4DB4DC70D6C27A20C3DB4DC4DC4DC2DCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDC4DC2DC2DC4D6C26A20C2DB4DC74D6C25A20D2B4DCDC2DCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDC8DCDC2DC2DCD31A20B6DC49DC27D5B24A20B5DCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDB2DCDCDCDCDCDCDCDB2DCDCDCDCDCDCDCDCDCDCDCDCDCDCDCD4B24A20B4DC30B2DC13B2DC29D2B25A20B3DCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDOPBDCDCDCDCDCDCDCDOPBDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDBDDB25A20B3DC30DOPBDC12DOPBDC29BDB26A20D2BDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCD2OPBD2CDCDCDCDCD2OPBDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDBD27A20D2BDC27D3OPBD14OPBD2C26DBD27A20D2BDCDCDCDCDCDCDCDCDCDCDCDCDCDCDB3OPB15OPB3DDCDCDCDCDCDCDCDCDCDCDCDCDCDBD11B5D9A20D2BDCDCDC21DBBA26BD3C16D2CDDBD10BDP2DCBD8A20D2BD4CDCDCDCDCDCDC2DCDCDCDBBA28BD3CDCDCDCDCDCDCDCD2CD2BD9BCDP2DCCBD7A20D2BD25BBA30BD24BD8BDCDP2DCCDBD6A20B30A2B26A2B35DCDO2DCCDB6A20P9A3PA18BA26BA14BAAPA11CCD5CDO2DCCD7A19PA7PA3POOAABBC56BAAPOOA5PAPAACCD5CDO2DCCD7A18PA7PA3P2OOA2B56AAPOOA5PAPAABCCD5CDO2DCCD7A17PA7PA3P4OOPA58POOA5PAPA2BCCD5CDO2DCCD7A16PA7PA3P6O62A5PAPAABABCCD5CD4CCD7A15PA7PA3PAP5APA56PAPA5PAPA2BABCCD7C3D9A14PA7PA3PAP5APA56PAPA5PAPA3BABCCD21A13PA7PA3PAP5APAAP51A2PAPA5PAPA4BABCCD21A12PA7PA3PAP5APAAPA48PA3PAPA5PAPA5BABCCD21A11PA7PA3PAP5APAAPA48PA3PAPA5PAPAPA4BABCCD20CA10PA7PA3PAP5APAAPA48PA3PAPA5PAPAAPA4BABCBCD3CD8CD3CA10PA7PA3PAP5APAAPA48PA3PAPA5PAPAAPPA4BAB3CD2OD8OD2CA10PA7PA3PAP5APAAPA48PA3PAPA5PAPAAPAPA4BAB4CD14CA10PAAP6A3PAP5APAAP50A3PAPA5PAPAAPAAPA4BAB5C14A10PAAPA4PA3PAP5APA56PAP4AAPAPAAPA2PA4BAB4A13BA10PAAPA4PA3PAP5APA16P24A14PAPA2PAAPAPAAPA3PA3B2AB2A2B11A10PAAPA4PA3PAP5APA16PA22PA14PAPA2PAAPAPAAPA4PA2B4ABA2B11A10PAAPA4PA3PAP5APA16PA22PA14PAPA2PAAPAPAAPA4PA2B6A2B11A10PAAPA4PA3PAP5APA16PA22PA14PAPA2PAAPAPAAPA4PA2B6A12BBA10PAAPA4PA3PAP5APA16PA12PA8PA14PAPA2PAAPAPAAPA4PA2B6AAP7A2BBA10P13AP6APA16PA11IIPA7PA14PAP5APAPAAP6A2B6AAP7A2BBA11PAAPAP9AP4APA16PA9I4PA6PA14PAP5AAPPA11B6AAP7A2BBA12PAAPAP10AP2APA16PA7P8A5PA14PAP6AAPPA10B6AAPAPA3PA2BBA13PAAPAP11APAPA16PA22PA14PAP7AAPPABA7B6AAPAPAPPAPA2BBA14PAAPAP12AP68AAPPABA6B6AAPAPAPPAPA2BBA15PAAPAP13A60P7AAPPABA5B6AAPAPAPPAPA2BBA16PAAPAP70IP10AAPPABA4B6AAPAPAPPAPA2BBA17PAAPAP12A56PAIP9AAPPABA3B6AAPAPAPPAPA2BBA18PAAPAP11A58PAAP8AAPPABA2B6AAPAPAPPAPA2BBA19PAAPAP6OP2A60PIIP7AOPPABAAB6AAPAPAPPAPA2BBA20PAAPAP9A62PAAP6AOPPABAB6AAPAPAPPAPA2BBA21PAAPAPOP6A64PIIP3OPAOPPAAB6AAPAPAPPAPA2BBA22PAPPAP6OPA65PAPOP3AOPPA2B4AAPAPAPPAPA2BBA23PAAPAP8A65PIP3OPOOPPAPAAB2A12BBA24PPAPAPOP4OPA65PIPOP3OOPPAAPAAB15A25PAAPAP8A65PAP3OPOOPPA2PA42PAPPAP6OPA65PAPOPPOPOOPPA2PAP14A26PAAPAPOP4OPA65PIPOP3OOPPA2PAP14A26PPAPAPOP6A65PIPOPPOPOOPPA2PAP14A26PAPPAPOP4OPA65PAPOPPOPOOPPA2PAP14A26PPAPAPOP4OPA65PAPOPPOPOOPPA2PAP5AAP6A26POOPAPO6PA65PIPNO2PNOPPA2PAP4A3P5A26POOPAPO6PA65PIPNO2PNOPPA2PAP3A5P4A26POOPAPO6PA65PAPNO2PNOPPA2PAP3A5P4A26POOPAPNO5PA65PAPNO2PNOPPA2PANO2AAOOAAPNO2A26POOPAPNO5PA65PIPNO2PNOPPA2PANO2APOOPAPNO2A26POOPAPNO5PA65PIPNO2PNOPPA2PPNO2APONPAPNO2A26POOPAPNO5PA65PAPNO2PNOPPA2PPNO2APOOPAPNO2A26POOPAPNO5PA65PAPNO2PNOPPA2OPNO2APONPAPNO2A26POOPAPNO5PA65PIPNO2PNOPPA2OPNO2APOOPAPNO2A26POOPAPNO5PA65PIPNO2PNOPPA2OPNO2APONPAPNO2A26POOPAPNO5PA65PAPNO2PNOPPA2OPNO2APONPAPNO2A26POOPAPNO5PA65PAPNO2PNOPPA2OPNO2APONPAPNO2A26POOPAPNO5PA65PIPNO2PNOPPA2OPNO2APONPAPNO2A26POOPAPNO5PA65PIPNO2PNOPPA2OPNO2APONPAPNO2A26POOPAPNO5PA65PAPNO2PNOPPA2OPNO2APONPAPNO2A26POOPAPNO5PA65PAPNO2PNOPPA2OPNO2APONPAPNO2A26POOPAPNO5PA64PIIPNO2PNOPPA2OPNO2APONPAPNO2A26POOPAPNO5PPA62PAAPPNO2PNOPPA2OPNO2APONPAPNO2A26POOPAPNO5PNPA60PIIPNPNO2PNOPPA2OPNO2APONPAPNO2A26POOPAPNO5PONPA58PAAPNOPNO2PNOPPA2OPNO2APONPAPNO2A26POOPAPPNO7NPA56PIIPNOOPNO2PNOPPA2OPNO2APONPAPNO2A26POOPAAPPNO3PO2NPA54PAAPNO2PNO2PNOPPA2OPNO2APONPAPNO2A26POOPA2PPNO2PO3NP57NO3PNOOPNOOPPA2OPNO2APONPAPNO2A26POOPAPAPPNO2PO4N57O4PNOPNO2PPA2OPNO2APONPAPA30POOPAPAPPNO3PO65PNOOPNO2PPA2P16A26POOPAPAPPNO4PO3P55O3PNO2PNO2PPAAOON18A23POOPAPAPPNO5PO5PPO47PPO3PNO3PNO2PPA3O2N19A19POOPAPAP3O5PO4IPO47IPO2PNO4PNO2PPAP3AAOON20A16POOPAPAPPAAP2O3PO3IPO47IPOOPNO5PNO2PPAP5AAO2N20A13P9A3PPO2P71A4P5AAO2N21A9PPN7PPAN2P2ON66OON2A5P5A2OON21A9P2N6P2A3P2N66O3N2A4P5AAOON20A11P2N6P2A3P2N67O3NNA4P4A3P19A13PPN7P2A3PPN69OON2OA2P5APPA16PA15P2O10A2P2O74A3P2AN19A18P2N9PIIAPN64AIIAN4OA4PANO18A20P91A3PANO18A21PON14PO58PN10PAPA2PANO18A21PO15NPOOP53OPNO10PAPA2PANO5A5PNO4A21PO16NP2A48PAAPPNO11PAPA2PANO5A5PNO4A21PO17N56O12PAPA2PANO5N6O5A21PO87PAPA2PANO18A21PO14APNO57APNO8PAPA2PANO18A21PO14APNO57APNO8PAPA2PANO18A21PO14APNO57APNO8PAPA2PANO18A21PO14APNO57APNO8PAPA2PANO18A21PO87PAPA2PANO18A21PO6P74O5PAPA2PANO18A21PO5PA71PAAPOPOPOPAPA2PAANO16A22PO4PA73PAAPO3PAPA2POANO16A22PO4P79OPOPAPA2POANO16A22PO4PO76PO3PAPA2POANO16A22POOPOP2OPOPOPOPOPO2POPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPO2POPOPOPOPO2PO2POP2OPOPAPA2POANO16A22PO4PO74POPOPOOPAPA2POANO16A22PPOPOP2OPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOP2OPOPAPA2POANO16A22P6OPO6PO2PO2PO14PO2PO2PO2PO2PO14PO2PO2POPOP5APA2POANO16A22PPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPAPA2POANO16A22POPO2PO2PO2PO2PO2PO2PO2PO2PO2POPOPOPOPOPOPOPOPOPO8PO2PO6PO2PO2POOPAPA2POANO16A22PPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPAPA2POANO16A22POPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPPAPA2POANO16A22PPOPOP6OPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPAPA2POANO16A22POPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOPO2PO2PO2POPOPOPOPOOPAPA2POANO16A6"

C2_ShipCon_01 =
	"A10C12N2CCD6A19C15N2CCDP6DA16C16N2CCDI8DA15CB10C4N2CCDI10A10C5D4B5C3N2CCDIIC3DGFFDIA8C5DI2CDC4BC3N2CCDIIC3DGFFDIA8C5DINNCDI3CBC3N2CCDIIC3DGFFDIA8C5DINNCDI3CBC3N2CCDIIC3DGFFDIA8C5DPNNCDI2CCBC3N2CCDIIC3D4IA8C5DDNNDDC4BC3N2CCDIIC3D4IA11P3INNI19C3D4IA11P4NNA9I9C3D4IA28I17A33I9A23P4AP33A7PN4PN20M8N3PA6PO4PO33PA6POP2OPO19P9O3PA7P39A0"

C2_ShipCon_02 =
	"A10J12K2JJK6A19J15K2JJKI6KA16J16K2JJKI8KA15J16K2JJKI10A10J5K4J9K2JJKIIJ3KJLLKIA8J5KI2JKJ9K2JJKIIJ3KJLLKIA8J5KILLJKI3J5K2JJKIIJ3KJLLKIA8J5KILLJKI3J5K2JJKIIJ3KJLLKIA8J5KPLLJKI2J6K2JJKIIJ3K4IA8J5KKLLKKJ9K2JJKIIJ3K4IA11I4LLI19J3K4IA11I4LLA9I9J3K4IA28I17A33I9A23I4AI33A7PI5K17L15PA6PI5K14J15K2PA6PI5J19I9J3PA7I39A0"

function loadC02Sprites()
	loadExtendedSprite(unpac_noheader(C2_Lights), "C2_Lights", 76, 58, 0)
	loadExtendedSprite(unpac_noheader(C2_Door_01), "C2_Door_01", 64, 35, 0)
	loadExtendedSprite(unpac_noheader(C2_Door_02), "C2_Door_02", 64, 35, 0)
	loadExtendedSprite(unpac_noheader(C2_Door_03), "C2_Door_03", 70, 39, 0)
	loadExtendedSprite(unpac_noheader(C2_Door_04), "C2_Door_04", 70, 39, 0)
	loadExtendedSprite(unpac_noheader(C2_Door_05), "C2_Door_05", 70, 41, 0)
	loadExtendedSprite(unpac_noheader(C2_Door_06), "C2_Door_06", 71, 41, 0)
	loadExtendedSprite(unpac_noheader(C2_Door_07), "C2_Door_07", 71, 41, 0)
	loadExtendedSprite(unpac_noheader(C2_ShipbgSprite), "C2_ShipbgSprite", 139, 136, 0)
	loadExtendedSprite(unpac_noheader(C2_ShipCon_01), "C2_ShipCon_01", 49, 19, 0)
	loadExtendedSprite(unpac_noheader(C2_ShipCon_02), "C2_ShipCon_02", 49, 19, 0)
end

-- Construction03

C3_Bg_ditter =
	"AIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA6IA71IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIAAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA41I2AI2AIAIAI2AIAIAI2AIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA83IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA45I2AIAIAI2AIAIAI2AIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA6IA103IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IAAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA73IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA115IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IAAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA77IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA5IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA143IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IAAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA105IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA3IAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA147IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IAAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA109IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA5IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA175IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA9IA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA137IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA5IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA179IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA13IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA141IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA5IA2IA2IA2IA6IA6IA207IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA41IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA169IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA5IA2IA2IA6IA6IA211IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA45IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA6IA173IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA6IA246IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA73IA2IA2IA2IA2IA2IA6IA6IA201IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA274IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA77IA2IA2IA6IA6IA6IA205IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA6IA278IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA109IA233IAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA6IA306IAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA342PA2PAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA306PA2PAPAPA4IAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA358PA2PA2PA2PA2PAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA6IA310PAPAPA2PAPAPA2PAPAPA2PAPAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA346PA2PA2PA2PA2PA2PA2PA2PA2PAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA308PAPAPAPAPAPAPAPAPAPAPAPA2PAPAPA2PAPAPA4IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA362PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PAIA2IAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA322PA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA6IA350PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PAIAIAIA2IAIAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA314PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA4IA2IA2IA2IA2IA2IA6IA6IA366PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA330PA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPAPAPAPA2IA2IA2IA6IA6IA6IA358PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PAIA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA2IA6IA6IA320PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA6IA374PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PAPAPA2PAPAPA2PAIA2IA2IA2IA2IA2IA6IA6IA336PAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPA370PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PAIA2IA2IA2IA2IA6IA6IA328PAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA358PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PAPAPA2PAPAPA2PAPAPA2PAPAPAPAPA4IA346PA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA346PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PAPAPA2PAPAPA2PAPAPAPAPAPAPAIA334PAPAPA2PAPAPA2PAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA225PA10PAPA89PA2PA2PA2PA2PA2PA2PA2PA2PA2PAPAPA2PAPAPA2PAPAPA2PA2PA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA231PA2PA2PA83PA2PA2PA2PA2PAPAPA2PAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA223PAPA2PAPAPAPAPAPA77PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA215PA2PA2PA2PA2PA2PAPAPA71PA2PA2PAPAPA2PAPAPA2PAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA185PA2PA2PA2PA2PA6PAPAPA2PAPAPAPAPAPAPAPAPAPAPAPA65PA2PA2PA2PA2PA2PA2PA2PA2PA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA179PA6PA6PA6PA2PA2PA2PA2PA2PA2PA2PAPAPAPAPA55PA2PA2PA2PA2PA2PA2PA2PA2PA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA173PA2PA2PA2PA2PA2PA2PAPAPA2PAPAPA2PAPAPA2PAPAPAPAPAPAPAPAPAPA53PA6PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPA2PAPAPA2PAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA175PA6PA6PA2PA2PA2PA2PA2PA2PA2PAPAPAPAPAPAPAPAPAPAPA43PA2PA2PA2PA2PA2PA2PA2PAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAP2APAPAP2APAPAP2AP2A165PA2PA2PA2PA2PA2PAPAPAPAPAPAPAPAPAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA41PA6PA2PA2PA2PA2PA2PA2PA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAP2APPA158PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPA31PA2PA2PA2PA2PA2PA2PA2PA2PA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAP2AP2AP2A153PA2PA2PA2PA2PA2PA2PA2PAPAPA2PAPAPA2PAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA29PA6PA6PA6PA2PA2PA2PAPAPA2PAPAPA2PAPAPA2PA2PA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAP2APAPAPPA150PA6PA6PA2PA2PA2PA2PA2PA2PA2PA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA19PA2PAPAPA2PA2PA2PA2PA2PA2PA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAP2AP2AP2AP2AP2AP2AP2AP2AP2AP2A137PA2PA2PA2PA2PA2PA2PAPAPA2PAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA9PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAP2APAPAP2APAPAP2APAPAP2APAPAP2APAPAP2APPA130PA6PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA3PAPAPAPAPAPAPAPAPAPAPA2PAPAPA2PA2PA2PA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAP2AP2AP2AP2AP2AP2AP2AP2AP2AP2AP2AP2AP2A125PA2PA2PA2PA2PA2PA2PAPAPA2PAPAPA2PA2PA2PAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAAPA2PA2PA2PA2PA2PA2PA2PA2PA2PA6PA2PAPAPA2PAPAPA2PAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAP2AP2AP2AP2AP2APAPAPAPAPAPAPAPAPAPAP2APAPAP2APAPAPPA118PA2PA2PA2PA2PA6PA2PA2PA2PA2PA2PA2PA2PA2PA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAP2AP2AP2AP2AP2AP2AP2AP2AP2AP2AP2AP2AP2AP2AP2AP2A105PA6PA2PA2PA2PA2PA2PA2PAPAPAPAPAPAPAPAPAPAPA2PAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPPAPA2PAPAPA2PA2PA2PA2PA2PA2PA2PAPAPA2PAPAPA2PAPAPA2PAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAP2AP2AP2AP2AP2AP2AP2AP2AP2APAPAP2APAPAP2APAPAP2APAPAP2APPA106PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAP2AP2AP2AP2AP2AP2AP2AP2AP2AP2AP2AP2AP2AP2AP2AP2AP2AP2AP2A101PA2PA2PA2PA2PA2PA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAAPA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PAPAPA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAP2AP2AP2AP2AP2AP2AP2AP2AP2AP2AP2APAPAPAPAPAPAPAPAPAPAP2APAPAPPA102PA6PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PA2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAP0"

C3_Element_01 =
	"A44P3A156P7A152P11A148P11A2P3A141P11A2P8A136P11A2P14A130P11A2P19A125P11A2P24A120P11A2P30A114P12AAP35A109P12A2P37OOA104P12A2P38O6A97P13A2P39O10A92P13A2P40O14A89P11A2P41O19A88P6A2P42O19P3A84PPAAPPA2P42O20P8A81P3AAP43O20P12A78P4APAAP39O20P16A76P4AP2AAP35O19P22A72P4AP5AAP31O19P26A70P4AP7AAP27O19P30A67P4AP10AAP23O19P35A6PPA54P5AP12AAP18O19P40A2P5A52P4AP15AAP14O19P36AAP2AAP3AAP3A50PAAPPAP17AAP10O19P36A6P5AAP6A47PA3P20AAP6O18P37A5P8AAP8A45PA3PAP20AAP2O18P36A6P24A42PA3PA2P20AAO17P36A6P28A40PA3PA4P16O3AAO13P36A5P33A38PA3PA6P14O5AAO8P36A6P38A35PA3PA8P11O8AAO4P36A6P42A33PA3PA10P9O10AAOP36A5P48A35PA12P6O12PAAP32A6P38AP12A33PA14P4O9P5AAP28AAPA2P40A4P11A49P2O8P8AAP23A6P39A2P4A2P11A48O9P10AAP19A6P39A2P5AAP15A48O6P13AAP15A5P40A2P5AAP19A48O4P15AAP10A6P40A4P3AAP24A46O2P18AAP6A6P40A10P28A46OP20AAP2A5P41A3P3A2P18A4P9A45P21A6P40A4P3AAP19A8P9A45P21A2P3A2P33A4P3AAP18A13P9A45P21AAP37A4P3AAP18A5O2A8P10A44P19APAAP33A3P4AAP18A5O6A8P8A46P16AP3AAP28A4P3A2P17A6O10A8P7A47P14AP5AAP24A4P3AAP18A6O14A7P6A49P11AP8AAP20A4P3AAP18A5O19A5P7A50P9AP10AAP15A5P3AAP17A6O20PPA5P6A52P6AP13AAP11A4P4AAP17A6O20P3A5P7A53P4AP15AAP7A4P3A2P17A5O21P5A6P6A55PPAP18AAP3A4P3AAP18A5O21P8A5P7A55P22A6P3AAP17A6O21P10A6P7A54PAP22A2P3AAP17A6O21P13A5P6A55PAPAAP19A3PAAP17A5O22PPAAP12A5P3A57PAPA2P17AAPPAAP16A6O22PPA3P12A5P2A58PAPA4P15AAPPAP15A6O22PPA6P12A4PA60PAPA6P12A4P14A5O23PPAAPPA4P12A66PAPA8P10A4P11A6O23PPAAPPAAPA4P12A65PAPA10P7A5P10A5O23PPAAPPAAPAAPA3P11A66PAPA12P5A4P11A3O23PPAAPPAAPAAPA6P9A67PAPA14P2A5P10A2O23PPAAPPAAPAAPAAP2A3P7A69PA17PPA4P11AAPAO20PPAAPPAAPAAPAAP4A4P4A90PA5P10A2PAPAO8AAO5PPAAPPAAPAAPAAP7A3P2A92PA5P10A2PAPA2O6AAO3PPAAPPAAPAAPAAP9A99PA5P10A2PAPA4O4AAOOPPAAPPAAPAAPAAP12A98PA5PAP7A3PAPA6O4PPAAPPAAPAAPAAP14A98PA5PA2P5A3PAPA8OPPAAPPAAPAAPAAP15A99PA5PA4P2A4PAPA9PAPPAAPAAPAAP15A101PA5PA6PA4PAPA9PPAAPAAPAAP15A103PA5PA6PA4PAPA9PAPAAPAAP16A111PA6PA4PAPA9PAAPAAP16A113PA6PA6PA9PA2P16A115PA6PA17PAP16A117PA6PA17PAAP13A127PA17PAAP11A129PA17PAAP10A130PA17PA2P7A132PA21P5A158P2A160PA49"

C3_Element_02 =
	"A32P2A92P9A86P15A80P21A73P28A31P3A31P34A25P9A24P38OOA20O3P11A18P38O2A19O10P10A12P38O2A19P2O14P10A4P39O2A5PPA11P8O14P9AP38O2A5P4A7P15O15P3OOP36O2A5P7A4P21O16P34O3A5P6A5P27O11P33O2A6P6A5P34O7P5A2P21O2A6P6A6PPA2P30O8P5A4P16O2A5P8A4P8A2P24O2PPO6P7A5P10O2A5P11A2P13AAP20OOP4O6P5AAPPA6P4O2A5P14A4P13A2P14O2P6O6P5A3P2A5POOA5P17A7P13A2P8O2P9O6P5AIA4P2A8P16A2PA10P12A2P3O2P12O6P5AIIA6PPA3P16A2PPAPA12P12AAO2P15O6P5AIIAJA6PPAAP13A3PPAPAPA15P9OOP18O6P5AIIAJ2A5PAAP10A2PAPAPPAPAPA17P4O2AP19O6P5AIIAJ4A3PAAPA2P3A2PAPPAPAPPAPAPA19POOP2AP19O6P5AIIAJ7APAAP7APAPAPPAPAPPAPAPA16IJAAP4APAP17O6P5AIIAJ7APAAP7APAPAPPAPAPPA2PA16IJAAP2APAPAP17O6P5AIIAJ7APAAP7APAPAPPAPA5PA16IJAAP2APAPAP17O6P2AAPAIIAAJ6APAAPA2P3APAPAPPA7PA16IJAAP2APAP19O6PA3PAI3AAJ4APAAP7APAPA10PA16IJAAP4AP19O4A6PA2I3AAJ2APAAP7A14PA16IJAAP4AP19O2A6PAAPA3I3AAJAPAAP7A14PA16IIAAP4AP19A7P2A2PA4I3AAPAAP7A14PA20P4AP16A7P5A3PA5I2APAAP7A5P3A4PPA19P4AP14A7P7A4PA6IAPAAP7A4P3O3A3PPA17P4AP11A7P10A5PA7PAAP7A3P3O3P2A3P2A14P4AP9A7PAP10A6PA6PA2P6A3P2O3P6A3PPA12P4AP6A7P3AP10A7PA6PA2P6A2P2O2P5AP2A3PPA10P4AP4A7P5AP10A8PA6PA2P6A2PPO2P4AP6A2P2A7P4APPA8P7AP10A9PA6PA2P2AP2A2PPOOP3AP9A3PPA5P4A8P10AP9A11PA6PA2P6A3POOP2AP11A3PA4P2A8P11AAP8A11PA8PA2PAPAPAPA5P2AP12A17P12AAPAPAP6A11PA9PA2P6A7PAP12A14P11A2P2APAP5A12PA10PA2PAPAPAPA9P11A11P11A2P3APAP3AP2A25PA2P2APPA12P9AAP2A3P11AAP6APAP6A13PA12PA2PAPAPA13P8AAPAAP12A2P9A2PAPAPA29PA2PAPA15P7AAPA3P8AAP13AP2APA33PAPAPA14P7AAPA3P5A2P8AP2APPAAPAPAPA29PAAPPAPA16P6AAPA3P2A2P16APAPAP2A15PA16PAPA17PPAP3AAPA3PAAP8AP2AP2APAPA2PAPAPA29PA2PAPA16P6AAPA4P17APAPAPAPAPAPA33PAPAPA15P3APPAAPA3P9AP2APAPAPAPAPA2PA33PA2PAPA16P6AAPA3P14AP2APAPAPAPAPAPA35PA18PAPAPA2PA3P3AP2APAPAPAPAPAPAPAPA37PA2PAPA16P2AP2AAPA3P10APAPAPAPAPAPAPAPAPAPA33PAPAPA16PAPAPA2PA3PPAP2APAPAPAPAPAPA2PA39PA2PAPA16PAP4AAPA3P6APAPAPAPAPAPAPAPAPAPA39PA18PAPAPA2PA4P2APAPAPAPAPA47PA2PA18OOPAPOOAAPA3PAPAPAPAPAPAPAPAPAPAPAPA63OAOAOA2PA4PAPAPAPAPA2PA2PA67PAO2APAAPA3P2APAPAPAPAPAPAPAPA67PAOAPA2PA4PAPA2PA77PAPAP2AAPA3PAPAPAPAPAPAPAPA71PAPAPA2PA4PA2PA2PA77P2A8PAPAPAPAPA93PA95PAPAPA95PA97PA36"

C3_Element_03 =
	"A53P4A59PPO4PPA56PO8PA54PO10PA53PPO8PPA53P3O4P3A53P12A53P12A54P11A54P10A54PAP8APA53PPAAP4AAPPA53P3A4PAPPA53P9APA54P7APAPPA53P9APOA53OP8AOOA53O3P4OAOOA53O9AOOA53O9AOOA53PO8AOPA53P3O4PAPPA53P9APPA53P9APPA53P9APPA53P9APPA53P7APAPPA54P8APPA53PAAP5AAPPA53P2A5P3A53P12A49PO4P10A46PO2A4O2P7A44POOA10OOP5A43POA14OP4A42POA2I9A3OAP2A42POAAI12AAOAP2A41PPOAI4J5I3AOAP2A41PPOOI2J9IIOOAP2A41P2O2J10O2PAP2A41P4O3J4O3P2AP2A41P7O6P5AP2A41P11AP2AP3AP2A41P20AP2A41P9APAPAPAP3AP2A25P6A8P10AP8AP2A21P3O6P3A4P9APAPAPAP3AP2A19PPO14PPA2P20AP2A17PPO5A6O5PPAP9APAPAPAP3AP2A16PO3A14O3P21AP2A15PO2A5I7A4O2PAP7APAPAPAP3AP2A15POOA3I13A2OOPAAP17AP2A14POOA2I17AAOOPA2P4APAPAPAP3AP2A14POOAI5J8I5AOOPA3P4AP8AP2A14POOI4J13I3OOPPA3P2APAPAPAP3AP2A14PPOOI2J15IIOOP2A3P13AP2A14PPO2IJ17O2P2A3P2APAPAPAP3AP2A14P2O3J15O2P3A3P7AP8A14P4O5J7O4P5A3P4APAPAP7A15P5O14P6A4P17A15P10O5P10A4P4APAPAP7A14PAP25APA3P3AP2AP8A14PAP25APA3P4APAPAP7A14PPAP12AP9APPA3P5AP10A14P2AAP5APAPAPAPAP4AAP2A3P4APAPAP6OA14P4AAP10AP3AAP4A3P3AP2AP5O3A13P4APA4PAPAPAPA3P6A3P4APAPAP3O5A12P4AP4A7P10A2P13O7A11P4AP4APAPAPAPAP9A3PAOAPAPAPPO9PPA10P4AP7AP2AP9OA3P2O12AOPPAPA10P4AP4APAPAPAPAP8OA3PAPAPAO8APAPAPA11OP3AP9AP10OOA3P6O6AP2AP2A10O2PPAP4APAPAPAPAP6O2A3PAPAPAPPO2APAPAPAPAPA11O3PAP7AP2AP6O3A4P2AP4AP4AP2APA10O4AP4APAPAPAPAP4O4A3PAPAPAP3AAPAPAPAPAPA11O4AOP15O6A3P9AP6AP2A10O4AO4APAPAPAPAO9A3PAPAPAPAPPAAPAPA2PAPA11PO3AO7AO13PA4P2AP2APAPAPAPAPAPAPA10PAO2AO4AOAOAOAOAO7PPA3PAPAPAPAPA2PA2PA2PA11P2OOAO20P2A3P5AP2APAPAPAPAPAPA10PAPPOAO4AOAOAOAO7P3A3PAPAPAPAPA4PA2PA13PPAPPAPO15P6A4P2AP2APAPAPAPAPAPAPA10PAPAPAP4AOAOAOAOAP2APAPAPA4PAPAPAPAPA2PAPAPA2PA12PAPPAP19APAPA3PPAP2AP2APAPAPAPAPAPA10PA2PAPAPAPAPAPAPAPAPAPAPAPAPA4PAPAPAPAPA4PA2PA14PAPA2P2AP2AP2AP2APAPAPAPA4PAPAPAPAPAPAPAPAPAPAPA12PA2PA2PAPAPAPAPAPAPAPAPAPA4PAPAPAPAPA2PA2PA16PAPA2PAPAPAPAPAPAPAPAPAPAPAPA3PPAPAPAP2APAPAPA4PA10PA6PA6PA2PAPAPA2PA6PAPAPAPA4PA18PAPAPAPAPAPAPAPAPAPAPAPAPAPAPA6PAPAPAPAPA8PA12PA2PA2PA2PA2PA2PAPAPAPA8PAPAPA26PAPAPAPAPAPAPAPAPAPAPAPAPAPA8PAPAPA42PA2PA14PAPA30PAPAPAPAPAPAPAPAPA18PA32PA2PA2PAPA54PAPAPAPAPA37"

C3_Element_04 =
	"A9P6A15P14A9P18A6POP16OPA4POP18OPA2POP15AAP2OPAPOOP14A3PPOOPPO2P14AAPPO2PPO3P16O3P2O3P14O3P4O6P6O6P6O18P9O14P32AP24APAP22AP2AP20AP2APA2P14A2PAP4APA3P6A3P6APA2P3A7PAPAPAPAPAPAPAPAP10AP2AP2A2PA2PAPAPAPAPAPAPAPAPAPA3PPAPAPAPAPAPAPAP2AP2A8PAPA2PAPAPAPAPAPA10PAPAPAPAPAPAPA16PAPAPAPA9"

C3_Element_05 =
	"A37P4A103P10A98P16A91P23A85P28OA79P31OOPPA72P30O3P3APPA67P29O4P2A3P4A61P30O3P3A3P8A57P30O3P3A3P12A52P31O3P2A4P16A48P30O4P2A4P20A47P27OPPOOP2A4P24A46PAAP21O4P2A3P29A45PA3P16O4P2A3P27AP4A44PA5P10O4P3A3P30AP5A43PA7P5O4P2A4P33AP3AAPA42PA9P2O2P2A4P38A2P3A41PA11P3A4P38A2P7A40PA2IIA8PPAAP37A3P11A39PA2I3A8P36A2P16A38PA2I5A6P33A2P20A37PA2I4AIIA4P30A2P24A36PA2I4AJJIIA2P27A2P28A35PA2I4AJ3IIAP8AP13A3P20A3P7A34PA2I4AJ4IAP5APPAP10A2P21A2P3AAP6A33PA2I4AJ4IAP5APPAP7A2P21A2P8A2P4A32PA2I4AJ4IAP5AP7A2P20A3P14A2P2A31PA2I4AJ4IAP11A2P20A2P3AAP15AAPPA30PA2I4AJ4IAP7A3P20A2P8A2P14A32PA2I4AJ4IAP4A2P21A2P14AAP15A29PA2I4AJ4IAPPA2P21A2P19A2P10O2PA27PA2I4AJ4IA2PPAP18A2P25A2P4O3P4A25PA2I4AJ4IAP3AP15A2P31AAOOP4A2P2A24PA2I4AJ4IAPPA2P11A3P32O3AAPPA2P3AAPA23PA2I4AJ4IA2PPAP8A2P33O4P2A2P3A2P3A22PA2I4AJ4IAP3AP5A2P33O4P2A2P3A2P7A21PA2I4AJ4IAPPA2P3AAP33O4P2A2PAPPA2P11A20PA2I4AJ4IA2PPAP4AAP29O4P2A2P2A3P15A19PA2I4AJ4IAP3AP4A3P24O3P2A3P2A2P2AP16A18PA2I4AJ4IAPPA2P5A4P19O3P2A3P2A2P6AP16A17PA2I4AJ4IA2PPAP3A2PPA3P13O4P2A3P2A2P8OOAP16A16PA2I4AJ4IAP3APPAAP6A3P8OOPOOP2A3P2A2P8O5AP16A15PA2I4AJ4IAPPA2P2AP8A3P3O4P2A3P2A2P8O9AP16A14PA2I4AJ4IA2PPAP2A3P7A3PO2P2A3P2A2P8O13AP16A13PA2I4AJ4IAPPA2P2APA3P7A3PPA3PPA3P8O17AP16A12PA2I4AJ4IA2PPAP2APA5P7AAPAAPPA2P9O21AP16A11PA2I4AJ4IAPPA2P2APA7P5AAPPA2P9O25AP16A11PPAI4AJ4IA2PPAP2APA9P3A3P8O30AP16A12PPI3AJ4IAPPA2P2APA9P3AAP8O30P2AP16A13PPIIAJ4IA2PPAP2APA9P3AAP5OOPO27P6AP16A15IAJ4IAPPA2P2APA9P3AAP2OOPOOPO24P8OOAP13APPA15PJ4IA2PPAP2APA9P3AAOOPOOPOOPO21P8O5AP16A15PAPJJIAPPA2P2APA9P3AAOOPOOPOOPO18P8O9APPAP2AP2AP2APPA17PAIA2PPAP2APA9P3AAOOPOOPOOPO14P8O14AP16A13PA2IAAPPA2P2APA9P3AAOOPOOPOOPO11P8O13AP3APPAP6AP2APPA12PA2IIA3PAP2APA9P3AAOOPOOPOOPO8P10O11P8AP16A11PA2IAIA2PAP2APA9P3AAOOPOOPOOPO5P14O7AP2AP2AP2AAPPAPAPAP2APAPAPPA15I2A4PPAPA9P3AAOOPOOPOOPO2P18O3P16AP16A9PA2IAIAIA3PPAPA9P3AAOOPOOPOOP23AP2AP2AP2AP2AP2AAPPAP2APAPAP2APA9PA3IAIIAAJAAPAPA9P3AAOOPOOP48AP14A9PA4IAIAJA2PAPA9P3AAOOP23AP2AP2AP2AP2AP2AP2AP2AAPPAPAPAPAPAPAPA14IAIAAJJAAPAPA9P3AAP55APPAP6APPA9PA2IAIAIAJA2PAPA9P3AAP19AP6AP6AP2AP2AP2AP2APAPA2PAPAPAPAPAPA14IAIA2JAAPAPA9P3AAPA2P53AP10A15IA2JA2PAPA9P3AAP9AP2AP2AP2AP2AP2APAPAP2APAPAP2APAPAPAPAPAPA2PAPAPAPAPA14IAIA2JAAPAPA9P3AAP42AP2AP2AP2APPAAP2AP2APPA9PA2IAIAIAJA2PAPA9P3AAPA3P2AP2AP2AP2AP2AP2AP2AP2AP2APAPAPAPAPAPAPAPA4PAPAPAPAPA14IAIAIAJAAPAPA9P3AAP40AP6AP5APPAPAPAPAPAPA10PA4IAIAIA2PAPA9P3AAPPAP2AP2AP2AP2AP2AP2AP2APAPAPAPAPAPAPAPAPAPAPAPA2PA2PA2PA2PA14IAIAIAIAAPAPA9P3AAP30AP2AP2AP2AP2AP2APPAAPAPAPAPAPAPAPA14IAIAIAIA2PPA10PPAPAAP3AP6AP6AP2APAPAPAPAPAPAPAPAPAPAPAPAPAPA2PA6PA2PA18IAIAIAAP2A9P3AAP28AP6AP6AP2APAPA2PAPAPAPAPAPAPA20IA2PPAPPA8P2AAPPAP2AP2AP2APAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA2PA2PA6PA6PA20IAAPAAPAPPA5P3AAP18AP2AP2AP2AP2AP2APAPAPAPAPAPAPA2PAPAPAPAPAPAPA24PAAPA2PPA3PPAPA2P2AP2AP2APAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA2PA2PA6PA2PA25PAAPA4PPAAP3AAP16AP6AP6APAPAPAPAPAPAPAPAPAPA2PAPAPAPAPAPA29PA6PPAP2A2PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA2PA2PA2PA2PA2PA2PA38PA8P3AAP10AP2AP2AP2AP2APAPAPAPAPAPAPAPAPAPAPAPAPA2PAPAPA35PA11PA2P2APAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA2PAPAPA2PA2PA2PA40PA8P3AAP12AP6AP2APAPAPAPAPAPAPAPAPAPAPAPAPAPA2PA39PA15PAPAPAPAPAPAPAPAPAPAPAPAPAPAPA2PA2PA2PA2PA2PA2PA42PA30PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA45PA23PAPAPAPAPAPAPAPAPAPA2PA2PA2PA2PAPAPA48PA16PAPAPAPAAPPAAPPAP2APAPAPAPAPAPAPAPAPAPAPAPA51PA23PAPAPAPAPA2PA2PA2PA2PA2PA2PA72PAPAPAPPAAPA2PAPAPAPAPAPAPAPAPAPAPAPA82PAPA2PA2PA2PA2PA2PA2PA78PAPAPAPA2PA2PAPAPAPAPAPAPAPAPA92PA6PA6PA84PAPAPAPA2PA2PAPAPAPAPAPA96PA2PA2PA2PA90PAPAPAPA2PA2PAPAPA100PA2PA2PA96PAPAPAPA218PA66"

C3_Element_06 =
	"A148PPA198P6A192P12A187P17A182P22A177P27A171P33A166P38A162P42A160P44A158P43A159P40A2P4A9PPA142P37A2P9A4P5A141P34A2P13AP10A139P31A2P30A137P28A2P18AAP14A135P25A2P21AAP17A132P21A3P24AAP19A130P18A2P28AAP21A124PPAAP15A2P57A119P4AAP12A2P63A113P7AAP9A2P65A111P10AAP6A2P64A2PA108P12A2P3A2P64A5PA105P10AP2APAAPA2P64A8PA102P10APAPAPAPA3P64A11PA99P10AP2APAPAPA3P63A13PA96P8APAPAPA2PA2PAPA2P40A3P15A16PA93P8APAPAPAPAPAPAPAPA5P37A8P10A18PPA90O2P7APAPA2PA2PAPA8P34A13P5A18P2A89PPO4P3APAPAPAPAPAPAPA11P31A8I3A5PA18P2A89P5O4APAPA2PA2PA16P28A8I8A20P2A89P9O3PAPAPAPAPAPA15P28A7I10A19PPA89P12AO2APA2PAPA15OP27A7I10A19P2A90P12APO2PAPAPA15P2AOOP22A8I9A19P2A92P8APA2PAOAPA17P7AOOP17A8I10A18P2A94P8APAPAPAPAPA15P12AOP13A8I10A18P2A97P5APAPAPAPAPA16P15AOOP9A7I10A18P2A99P7APAPAPA16P20AOOP8A3I10A12PPA3P2A101P5APAPAPA16P24AAOOP8AAI7A12P5APPA104P4APAPAPA14O2P26AAOP9AAI2A12P10A105P3APAPAPA12O7P26AOOP9A12P15A102P5AP2A10PO10P24A3OOP4A12P21A99P2APAPAPA8P4O11P19A2P3APOPA12P24OOA97P3APAPA6P9O11P14A2P6APA11P27O3A96P3APA4P13O11P10A2P8AAPA8P30O5A102P18O11P5A2P8A4PA4P34O6A98P23O10PPA2P8A7PAAP37O6P2A93P26O8A2P8A10P40O6P4A88P31O3A2O3P4A10P43O6P3APA84P35A2O7PA10P4AP40O6PPA2PA81P35A2PO7A10P7AP40O5A5PA78P36AAP5O2A10P10AP40O2A8PA75P36A2P8A9P13AP41A10PA72P36A2P8A10P15AP38A11PPA70P36A2P8A13P15AP35A11P2A69P36A2P8A18P13AP32A12PPA69P36A2P8A19P2AP11AP29A12P2A69P35A2P8A19P2A5P9A6P21A11P2A69P35A2P8A19P2A10P7A6P18A12PPA69P35A2P8A20PPA15P5AP21A12P2A68P35A2P8A20P2A19P3AP18A12P2A68P35A2P8A20P2A24PPAP15A12P2A68P35A2P9A19P2A29P13A13PPA68P35A2P9A19P2A34P9A12P2A67P35A2P9A19P2A39P4A12P2A67P35A2P9A19P2A42PPA12P2A67P35A2P9A19P2A45PA11PPA67P35A2P9A20PPA48PA8P2A67P34A2P9A20P2A50PA5P2A67P34A2P9A20P2A53PA3PPA67P34A2P9A20P2A56PAP2A66P34A2P10A19P2A59PPA66P35AAP10A19P2A128P35A2P9A19P2A132P31A2P9A20PPA137P26A2P9A20P2A140P22A2P9A20P2A144P18A2P9A20P2A149P13A2P9A20P2A153P9A2P9A20P2A157P5A2P10A19P2A162PA2P10A20PPA166P10A20P2A169P6A20P2A174PPA20P2A178PA17P2A181PA14P2A184PA11P2A187PA9PPA190PA6P2A192PA3P2A195PAP2A198PPA185"

C3_Element_07 =
	"A25O11A99O23A89O9A11O9A82O6A23O6A77O4A9I11A9O4A73O4A5I5A11I5A5O4A70O3A4I2A23I2A4O3A67O3A3I2A29I2A3O3A64O2A3IIA35IIA3O2A62O2A2IIA39IIA2O2A60O2A2IA43IA2O2A59O2AAIA45IAAO2A58O2AIIA18J9A18IIAO2A57O2AIA13J5A9J5A13IAO2A56O2AIA11J2A5I9A5J2A11IAO2A55O2IA9J2A2I21A2J2A8IAO2A55O2IA7JJA2I27A2JJA6IAO2A55O2IA6JAAI33AAJA5IAO2A55O3IA3JJAI37AJJA3IO3A55O3IA2JAAI39AAJAAIIO3A54PPO3IAJAI43AJAIO3PPA53PPO3IJAI45AJIO3PPA53P2O2JAI47AJO2P2A53P2O4I19A8I18O4P2A53P3O5I11A5J8A5I10O5P3A53P4O6I5A3J20A3I4O6P4A54P4O7IIAAJ28AAIO7P5A54P6O7J32O6PPAPAP2A54P7O8J27O8P2APAP2A54P7APO8J21O10P4AP4A54P5APAP2O37P4APAP4A54P5APAP2AO33P7APAP4A54P7APAP7O23PPAP10AP4A54P7APAP13O11P19AP4A54P7AP21APAPAPAPAPAPAPAPAP8AP4A54P7AP34AP11AP4A54P7AP19APAPAPAPAPAPAPAPAP2AP6AP4A54P7AP47AP4A54P7AP19APAPAPAPAPAPAPAPAPAP8AP4A54P7AP22AP2AP2AP15AP4A54P7AP19APAPAPAPAPAPAPAPAPAP8AP4A54P7AP24APAPAPAP15AP4A55P6AP17APAPAPAPA2PAPAPAPAPAP8AP3A56P6AP22APAPAPAPAPAP13AP3A56P6AP17APAPAPAPAPAPAPAPAPAPAP8AP3A56P6AP20APAPAPAPAPAPAPAP11APAPPA55P7AP17APAPAPAPAPAPA2PAPAPAP8APAPAPA54OAP5AP20APAPAPAPAPAPAPAP11AP2AOA54OAP5AP19APAPAPAPAPAPAPAPAPAP6APAP2AOA54OOAP2APAP20APAPAPAPAPAPAPAP9APAPPAOOA54OOPAPPAPAP15APAPAPA2PAPAPAPAPAPAPAP8APAO2A54OOPPAP2APAP16APAPAPAPAPAPAPAPAP12AO3A54O2PPAPPAPAP13APAPAPAPAPAPAPAPAPAPAP10APO3A54O2P2A2P18APAPAPAPAPAPAPAPAPAP7AAP3OOA54O3P3AAP12APAPA2PA2PA2PAPAPAPAPAP4AAP7OA53O4P4AAP15APAPAPAPAPAPAPAPAPAP3AAP9OA53O5P5A2P7APAPAPAPAPA2PAPAPAPAPAPPA2P12OA52O6P7A3P10APAPAPAPAPAPAPA3P18A50O8P9A6PAPAPA2PAPA6P24A48O11P13A10PAP28A49PO13P13APAPAP31A4PPA44PO17P9AAP2AP27A5P5A42PAO23P2APAPAPAP23A6P9A41PPO24A2PAPA2P20A5P14A39PPAO23PAPAPA2PAP16A5P19A37PPAPO22A2PAPA5P11A6P23A35PPAP2O20PAPAPA2PA4P7A5P28A33PPAP4O18A2PAPA9P2A5P33A31PPAP6O16PAPAPA2PA6PA5P37A29PPAPAP8O12A2PAPA9PA2OP41A27PPAPAP12O8PAPA4PA6PA4P40A27PPAP20AOOA2PAPA9PA6P36AAP3A23PPAP20APAPAPAPA2PA6PA8P31A2P7A21PPAP18APAPA5PA9PA9P27A2P8AAPPA19PPAP18APAPAPAPAPA2PA6PA12P22AAP9AAP5A17PPAP20APA5PA9PA14P17A2P8A2P9A16PAPAP18APAPAPAPA2PA6PA15P14AAP8A2P14A13PAAPPAP17APPA4PA9PA17P9A2P8AAP16APPA12PAPAPAP16APAPAPA4PA6PA19P4A2P8A2P21A11PA2P2AP15APA5PA9PA21PAAP8A2P25A11PAPAPAPAPAP12APA2PAPA2PA6PA21PAP7AAP30A8PAAPPAP2AP13APAPAAPAPAAPA6PA21PA2P2A2P33A8PAPAPAPAPAPAPAPAP6APAAPPAPAPAPA6PA21PA4P38A6PPAAPAPAP2AP2AP2AP3APA3P5A6PA20PA5PAP37A6PAPAPAPAPAPAPAPAPAPAPAPAPPA4P5A4PA20PA5PA3P35A4PAAPAAP2AP2AP6APPAP3A4P4A3PA20PA5PA5P33A5PAPAPAPAPAPAPAPAPAPAPAPAPAPAPA6P3AAPA20PA5PA6P33A3PA2PAPAPAPAP2AP2AP2AAPPAP2APA4P5A20PA5PA7P32A4PAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPAPA4P5A19PA4PA10P30A6PPAPAPAP6AP5AAP6APAPA3P4A18PA4PA10P31A3PAPAPA2PA2PAPAPAPAPAPAPAPAPAPAPA8P4A15PA5PA11P29A7PAPAPAPAPAPAP2AP2AAPPAP2AP2APAPA5P4A13PA5PA12P29A5PA2PAPAPA2PAPAPAPAPAPAPAPAPAPA12PAP2A11PA5PA13P27A7PAPAPAPAPAPAPAPAPA4PAPAPAPAPAPAPA9P4A9PA5PA13P28A7PA2PA2PA2PA2PA2PA2PA2PA16PAPPA8PA5PA14P22APAPA7PAPAPAPAPAPAPAPAPAPA2PAPAPAPAPAPAPA12P4A6PA5PA14P23AP2A9PA2PA2PA2PAPAPA2PAPAPA22P3A3PA6PA14P20APAPAPA11PAPAPAPAPAPAPAPA2PAPAPAPAPAPAPA15P5AAPA6PA15P27A10PA2PA2PA2PA2PA2PA2PA18PA3P3APA5PA16P17APAPAPAPAPA11PAPAPAPAPAPAPA2PAPAPAPAPAPAPA12PA5P4A5PA16P14AP2AP2AP2A13PA2PAPAPAPAPAPAPAPAPAPAPA12PAPA8P4A3PA17P8APAPAPAPAPAPAPAPAPA15PAPAPAPAPA2PAPAPAPAPAPAPA7PPA13P4AAPA17P26A18PA2PA2PA2PA2PA10PA18P5A17PAPAPAPAPAPAPAPAPAPAPAPAPAPA21PAPAPAPAPAPAPAPAPAPAPAPA23P3A17PPAP2AP2AP2AP2AP2AP2A29PAPAPA2PA32PPA17PAPAPAPAPAPAPAPAPAPAPAPAPAPA70P2A17P6AP6AP9A70PAPA18PAPAPAPAPAPAPAPAPAPAPAPAPA71OPA17PAP2AP2AP2AP2AP2APAPA73PA18PAPAPAPAPAPAPAPAPAPAPAPAPA71OPPA16P20APAPA71OAPA18PAPAPAPAPAPAPAPAPAPAPAPAOA70OOAPA16PAP2AP2AP2AP2APAPAPAOA71OAOA18PAPAPAPAPAPAPAPAPAPAPAOAOA73PA17P5AP4APAPAPAPAPAPA73OAPA16PAPAPAPAPAPAPAPAPAPAPAOAPA71OAOA18PAPAPAPAPAPAPAPAPAPAOAOA73OAOA16PAPAPAPAPAPAPAPAPAPAOAOAPA71POOAOAOA14PAPAPAPAPAPAPAPAOAOAOAPA73PAOAOAOA12PAPA2PAPAPA2PAOAOA2PAPA71PAPAOAOAOAOA10PAPAPAPAPAPAOAOAOAOAPAPA73PA2OAOAOAOAOAOAOA2PAPAPAOAOAOAOAOAOAOAPAPA79OAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAPAPAPA75PA2OAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAPAPAPA83OAOAOAOAOAOAOAOAOAOAOAOAOAPAPAPAPA87OAOAOAOAOAOAOAOAOAOAPAPAPAPAPA93OAOAOAOAOAPAPAPAPAPAPAPA97PAPA2PAPAPA2PAPA101PAPAPAPAPAPAPAPA101PAPAPAPAPAPAPA105PAPAPA18"

C3_BigShip =
	"A125BDDBA7BBA159BD2CCB4AAB3GA155BD2CCB2CDDCCB2CDDG4A149D2C2BBCD2C3BCDDC5G3A143BDDC2B2D2C3BCD2C11G3A136BD2CCB2CDDC3BCD2C17G3A130BD2CCB2CD2C3BCDDC24G3A123BD2C2BBCD2C4BCD2C27G2BBA118D2N3BBD2C7BBC2D2C25B3A115D2N5D2NNC10B2C2D3C21B3A112D2CCN3D2N7C10B2C3D2C15B2C2B3A106BDDC3B2DDN13C10B3C2D2C9B2C9B2A100BD2C2B2D2C3N13C12B2C2DDC5BBC15B3A94D2C2B2D2C9N13C12B2C4B2C15DDBBCCBBA89D2C3BBD2C15N13C12B4C16DDBBC3BBA86D2C3BBD2C21N13C9BBC17DDBBC3BCBBA83D2C3BBD2C27N13C24DDBBC3B2CCBA80D2C3B2DDC33N13C18D2BBC3B2CCBCBBA76BDDC4BBD2C37N13C14DDB2C3B2CCB3CBA74D2C3BBD2C43N13C9DDBBC4B2CCB5CBA71D2C4BBDDC49N13C4DDBBC3B3CCB7CBA68D2C8BCDC52N12CDDBBC3B3CCB10CBA64D2C12BDC55N7D2BBC3B2C2B12CBA61D2C15BBDC57N2DDBBN4B2CCB16CA58D2C15B2CDDC58DDBBN4OBBCCB18CA56DDBC15BBCD2C58DDBBN4O2NNB21CA52D2C15B2CDDC58D2BBC3BO2NNOB22CA49D2C15B2CD2C58DDB2C3B3NNO2B20CCBA46D2C16BBCD2C59DDBBC4B2C2O5B11K3IBCCBA45D2C16B2CDDC60DDBBC4B2CCB2O5B9KKI3KKBIA43D2C16B2CD2C60DDBBC4B2CCB5O4B7KKI9A40D2B3C12B2CD2C60D2BBC4B2CCB7O5B4KKI10A39DDBC5B4C5BBCD2C61DDBBC4B3CCB9O5B2KKI12A36D2C13B5CDDC51DDC8DDBBC4B3CCB12O5KKI14A33D2C16B2CD2C52DDBD3C2DDBBC4B2C2B14O3K2I12A33D2CB2C13BBCD2C53DDBC2B2D2BBC4B2CCB17IIKKLLKI10A32D2BC5B3C6B2CDDC54DDBC7B2C4B2CCB19KKL3KI8A31D2BC12B2CB2CD2C54DDBC15B2CCB18K2IIL2KKI6A30D2BC16B2CD2C54D2BC14B3CCB16IIKKLLKIILLK2I4A30DBBC17BBCCDDC55DDBC15B3CCB18KKL3KIIK2I4A29D2C2B3C10B2CD2C55DDBC15B2C2B18KKIIL2KKIIKI4A28D2BC8B2C4B2CD2C55D2BC15B2CCB19KKLKIILLK2I5A27D2BC14B4CD2C56DDBBC15B2CCB17IIKKL2KIIK3I4A27DDBC17BBCCDDC4BBC50DDBBC15BBPCCB19KKL3KKIIKKI3A29DB2C14B2CD2C4DDCBBC47DDBC16B2CPB19KKIILLK3I5A29DDB5C9B2CD2C3D3C4BBC42D2BC15B3CCBBPB15K2LKIIK5I3A30DB9C5BBCCDDC3D2C10B2C37DDBBC15B2C2B3PB12IKKL3KIIK2I4A31DB12CB2CD2CCD3NNC14B2C32DDBBC15B2CCB7PB10KKIL3KKIIKI4A33PB5PB7CDDC2DDN7C15BBC28DDBBC15B2CCB9PB8K2IILLK3I5A35PPB2PPOPPB7C3B3N7C15B2C22D2BC2BC12B2CCB12PB5KKLLKIIK4I4A37POP2O3P2B15N7C16B2C17DDBBC5BBC8B2CCB14PB2IKKL3KIIK2I4A39PIIO3PPO2PPB8PPB4N8C16BBC13DDBBC9BC4B3CCB17PBKKIL3KKIIKI4A41PI3PPO4P3B5P4B5N7C15B2C8D2BC13BCCB2C2B19K2IILLK3I4A44PI5O2PPO3PPB2P8B4N7C10B5C6DDBBC16PBBCCBBCB17KKLLKIIK3I4A46PPI6PO7P13B4N7C5B6C6DDBBCBC14BBPCCB3CB15KKL3KIIKKI4A48PPGFI6O8P13B4N7CB7C6DDBBC3BBC10B2CCPB5CB14L4KKI6A50PPGF2I6O8P14B3N3B8C5D2BC8BC7B2CCBBPB5CB13CL2K3I4A52PPGFFMMFI5O9P14B12C5DDBBC11BBC2B3CCB4PB5CB10CCBK4I4A54PPGF3MMFI5O9P14B8C5DDBBC15PB2C2B6PB5CB8CCBBIK2I4A57PGGF4MMFI5O9P12B6C4D2BBCBBC13BPBCCB10PB5CB5CCBBIIBI5A60PG2F4MMFI5O9P10B4C4DDB2C4BC10B2CPB12PB5CB3CCBBIIBBCI2A64PPG2F4MMFI5O9P8B2C4DDBBC8BC7B2CCBPB12CPC2B2CBCCBBIIBBCCBIA67P2G2F4MMFI5O9P7BBC2DDBBC11BBC3B2CCB3PB10CCBBPPC4BI2BBCCB2A69P3G2F4MMFI4O10P5B2DDBBC15PB3CCB5PB8CCBBP6BI2BBCCB4A70P4G2F4MMFI4O10P3B5C15BPBC2B8PB5CCBBP7I2BBCCB6A71P4G2F5MMFI4O10PPB7C11B2CPB11PB3CCBBP8BCCBCCB8A72P5G2F5MMI5O10PPB7C7B2CCBPB12PBCCBBP3BP5B2CB10A73P6G2F5MMI5O10PPB7C3B2CCB3PB11PCBBP3B2P3IIB14A75P6G2F5MMI5O8POPPB5CCB2CCB5PB9CCBBP3B4PPI3B14A77P6G2F5MMI4O5PPO3PPB4CBCCB7PB7CCBBP3B5PI6B13A79P5G2F6MMI4O2PO4PPOPPB2CCB10PB4CCBBP3B5PI9B12A80P6G2F6MMI4PO3PPO3PBBIBCB10PB2CCBBP3B5PI11B12A82P6G2F6MMI4OOPO5PB3CB11PCCBBP3B5PI7G2I2B11OA84P6G2F6MMI4O5IIPOBBCB10CPBBP3B5PI8G4OIB9O2A86P6G2F6MMI4OOIIOOPB3CB7CCBBP3B5PI9G5OIB8O3A87P6G3F6MMI4OOIIPBBIBCB5CCBBP3B5PI10G3FGGOIPB5O5A89P6G2F7MGIIOI4PB3CB2CCBBP3B5PI11G3F2OOIPB4O6A91P6G2F6GPIOI4PB2PCBCCBBP3B6I12G3F2OOIIPB2O7A94P6G2F4GPIOI4PB3CCBBP3B6I8AAI2G3F2OOI2PBBO6A97P7G2F2GPIOI3OIPB4P3B6I7A6G3F2OOI3PO7A100P7G2FGPIOIIOOIIPB3P2B6I7A7G3F2OOI4PO6A103P6G3PIO2I5P3B6I7A8G3F2OOPI3PPO4A106P7GGPIOI6OIPPB5I7A10G2F2OOI2AAPPO4A109P7IIOI4OOIIPPB3I7A12G3FOOI2AAPPO3A113P5IIOI2OOI4B2I7A15G2OOIIA2PPO3A116P4IIO2I6BI7A16O4IIA2PPO2A119P4IIOI14A18O3IA3PPO2A122P4IOI10A29PPO2A125P3IOI7A30PPOOA128P2IIOI4A167PPIIOIIA171PIIOA121"

C3_Ship01 =
	"A38DDA52DDC3A48DDC3IIA46DDC3IIH2A43MDC3IIGGF2HHA39MMN2DDIG6FFHHAADDCA30DMN2MMNNCCG7FFDDC5A25DDC2MMN5CCG5DDC7BA22DDC2DDCCN7CCBGDDC7B2A20DDC3DC5N5BBCDC7B4A18DDC5BBC6NNBBN3C5B6A16DDC9BBC4BBN7CCB7A15DDC13BBCBBC3N5OB6A15DDC17BC7NNO2B3KA15DDCCBBC24BO3BBKKA14DDC5BBC20B2O3KKIA13DDC9BBC16B4OOKKIA13DDC13BBC12B6KKIIA13BBC16BBC8B6KKI2A13BPPBBC16BBC4B6KKI3A13BPOOPPBBC16BBCB6KLKI3A13BO2POOPPBBC15B6KL2KI3A12IIOOPO4PPBBC11B7L2K2I3A13GIIO7PPBBC7B9LLK2I3A14GFMIIO7PPBBC3B11K2I3A16GFM2IIO4POOPPB15KI3A18GF2M2IIOOPO3P2B13I2A21GF3M2IIO3P2IB13IA24GGF3M2IIOP2I2B11A28GGF3MMGIPI4B9A32GGF3GI7B6A36GGFFGPI6B4A40G2PI7BBA44GPPI5A49PI2A53PA39"

C3_Ship02 =
	"E10D7E28CD6C8E27BBC15E23O3IBBC6B7E22GGO3IB7C6E22GGFMO2IC6B6E22GGFMI3B14E21GGFMP3B6O7E21GGFMI3O14E21GGFMI3O14E21GGFMI3O15E20GGFMI3O15E11D5E2GGFMI3O5B9E4D6C6GEGGFMI3B15CD3C14G2FMI2CB16C16BBHGGFMIICB17C12B2CCBHGGFMIIB15P2BC7B2C3B2HGGFMIIB11P3C3BC3B2C2B7GGFMIIB8PPBBC7B2C3B10GGFMIIB5I4ABBC2B3PCCB14GGFMIIB5IIO2IIB4C2PB13IIEGGFMIIB5IIGFO2IIBCCB2PB11I3EGGFMIIB5IIGFMMOOIB5PB8I4E2GGFMI2B4IIGFFMMGIB5PB5AI4E4GGFMI3B3IIGGF2GIB5PB3I4E7GGFMI2PB5IGGFFGIB5PBI5E9GGFMI2PB7IG2IB5I4E12GGFMI2PB5IIBBIGIB2I4E15GGFMI2PB5I4BABI4E17GGFMI2PI7EEI5E20GGFMI2PI7E3IIE22GGFMI2PI3P3E28GGFMI2P4I3E28GGFMI11E28G2FI10E30GGI7E36I3E37"

function loadC03Sprites()
	loadExtendedSprite(unpac_noheader(C3_Bg_ditter), "C3_Bg_ditter", 240, 136, 0)
	loadExtendedSprite(unpac_noheader(C3_Element_01), "C3_Element_01", 164, 81, 0)
	loadExtendedSprite(unpac_noheader(C3_Element_02), "C3_Element_02", 100, 68, 0)
	loadExtendedSprite(unpac_noheader(C3_Element_03), "C3_Element_03", 67, 96, 0)
	loadExtendedSprite(unpac_noheader(C3_Element_04), "C3_Element_04", 27, 26, 0)
	loadExtendedSprite(unpac_noheader(C3_Element_05), "C3_Element_05", 113, 97, 0)
	loadExtendedSprite(unpac_noheader(C3_Element_06), "C3_Element_06", 204, 94, 0)
	loadExtendedSprite(unpac_noheader(C3_Element_07), "C3_Element_07", 118, 130, 0)
	loadExtendedSprite(unpac_noheader(C3_BigShip), "C3_BigShip", 177, 92, 0)
	loadExtendedSprite(unpac_noheader(C3_Ship01), "C3_Ship01", 57, 36, 0)
	loadExtendedSprite(unpac_noheader(C3_Ship02), "C3_Ship02", 45, 37, 4)
end

-- SphereScenes

SS_Ship_up =
	"A14B4C2A18D5BC2A17DC5BCCBA17DC5BCCFA16MN5OB3A16MN5OB3A15MN5OOB2A16DC5OOB2A11N3DC5BOOBN7A4NO3DC5BOOBO5POPA3NO2DC5BBO9PPA3NOCCDC5BBCBCCPPO2P2A4D2C5BBCBC3DOOP3A3D3B7CBC2DBOP3A4D2C5BBCBC3DBP3A4D3C5BBCBC2DBBP2A5D8BBCBC3DBBPPA5D2B8CBC2DB2PA6D2B7CBC3DB2A6D3BO3PBBCBD3B2A7DC2BP4BBC4B3A6BGFMMBP4B2FM2B2A7BGFMMBP4BBGFM2B2A7BGF2BP4BBGF3BBA8BG3HP5BG4BBA9B4ANO3PB4A18O2P3A21NOP3A22NP3A24P2A26PA17"

SS_Stage1_Frame01 =
	"N183A52O184A51O185A50OOP121OOP36O2P19A51OOP2A26P3A3P5A39P3A6PPA23OOPPA13P3A17O2P3A11P3A50OOP2A26P3A3PAPAPPA39P3A6PPA22OOP2A8O29P5A9P3A51OOP2O4A21PAPA3PAPAPPA37O33A3OOPPA7N30OOPAP3A9P2A51PON5P39ON12P19N38OP2A6NO32PPAP4A7P3A51O6P39O13P19O39PPA7NO33P3O12PPA51O7PA6PA12PPAPA3PAPAPPA2O13A6PA5PA3O39P2A6NO2P30OP2O13P2A51O7PA6PA11PPAPA3PAPAPPA2O13A6PA5PA3O39PPA7NOOPO32P19A50O8PA6PA10PPAPA3PAPAPPA2O13A6PA5PA3O38PPO5PPNO2PO2P25O3P18A52O4P104O6P9NOOPOOP28O3P18A51O4P103NO5P9NO2POOP8A9P2A3P2O3PPA5P10A52O4P2A19PAPA2PPAPAPPA65NO6P4A4NOOPOOP3AP5A8P2A4P2O3PA6P10A51O4P2A19P2A3P2APPA65NO5P5A3NO2POOP3AAP5A6P2A5P2O3PPA5P10A52O4P2A18P2A3P2APPA64NO6PPAAP2A2NOOPOOP3A3P5AO14P2O3PA6P10A51O4P3A18P2A3P5A63NP8AAP3ANO2POOP3A5P4O14P2O3PPA5P10A52O4P97NO4POPPAAPAAP2NOOPOOP34O3P2O9P5A51O4P36A5PPA5PPA6PPA6PPA26NO3POP2O5PNO2POOP34O3P18A52O4P95NO4POP9NOOPOOP36O3P18A51O4PAP2A90NO3POP9NO2POOP3AAP3A3P2A19O3PPA15PA52O4PAP2A88NO4POPPAAPA4NOOPOOP3A3P3AAP2A21O3PA15PA52O4PAP2A88NO3POP2AAPA3NO2POOP3A5P6A21O3P2A14PA52O4PAP2A86NO4POPPAAPA4NOOPOOP4A6P4A23O3PA15PA52O4PAP2A86NO3POP2AAPA3NO2POOP3A8P3A23O3PPA15PA52O4PAP2A86P7AAPA4NP8A8P3A25O3PA16PA51O4PAP2A85PA5PPAAPA3NO5P3A8P3A25O3PPA15PA52O4PAP2A84PA4PPAAPA4NO4P3A8PAAPA27O3PA16PA51O4PAP2A83PA5PPAAPA3NO5P3A8PAAPA27O3PPA15PA52O4PAP2A82PA4PPAAPA4NO4P3A8PAAPA29O3PA16PA51O4PAP2A81PA5PPAAPA3NO5P3A8PAAPA29O3PPA15PA52O4PAP2A80PA4PPAAPA4NO4P3A8PAAPA31O3PA16PA51O4PAP2A79PA5PPAAPA3NO5P3A8PAAPA31O3PPA15PA52O4PAP2A78PA4PPAAPA4NO4P3A8PAAPA33O3PA16PA51O4PAP2A77PA5PPAAPA3NO5P3A8PAAPA33O3PPA15PA52O4P4A76PA4PPAAPA4NO4P3A8PAAPA35O3PA16PA51O4P4A75PA5PPAAPA3NO5P3A8PAAPA35O3P18A52O4PAP2A74PA4PPAAPA4NO4P3A8PAAPA37O3P18A51O4PAP2A73PA5PPAAPA3NO5P3A8PAAPA37O3PPA9PA2P2A52O4PAP2A72PA4PPAAPA4NO4P3A8PAAPA39O3PPA9PA2P2A51O4PAP2A71PA5PPAAPA3NO5P3A8PAAPA39O3P18A52O4P4A70PA4PPAAPA4NO4P3A8PAAPA41O3P18A51O4P4A69PA5PPAAPA3NO5P3A8PAAPA41O3P18A52O4P4A68PA4PPAAPA4NO4P3A8PAAPA43O3PPA9PA2P2A51O4PAP2A67PA5PPAAPA3NO5P3A8PAAPA43O3PPA9PA2P2A52O4PAP2A66PA4PPAAPA4NO4P3A8PAAPA45O3PPA9PA2P2A51O4PAP2A65PA5PPAAPA3NO5P3A8PAAPA45O3PPA9PA2P2A52O4PAP2A64PA4PPAAPA4NO4P3A8PAAPA47O3PPA9PA2P2A51O4PAP2A63PA5PPAAPA3NO5P3A8PAAPA47O3PPA9PA2P2A52O3PPAP2A62PA4PPAAPA4NO4P3A8PAAPA49O3PPA9PA2P2A51O4PAP2A61PA5PPAAPA3NO5P3A8PAAPA49O3PPA9PA2P2A52O3PAAP2A60PA4PPAAPA4NO4P3A8PAAPA51O3PPA9PA2P2A51O4PAP2A59PA5PPAAPA3NO5P3A8PAAPA51O4PA9PA2P2A52O3PAAP2A56NOPOOPOP2AAPA4NO4P3A8PAAPA53O3PPA9PA2P2A51O4PAP2A56NO3POP2AAPA3NO5P3A8PAAPA53O4PO13P3A51O3PAAP2A54NO3POP5A4NO4P3A8PAAPA55O3P18A51O4PAP2A54NO3POP5A3NO5P3A8PAAPA55O4P18A51O3PAAP2A52NO3POP5A4NO4P3A8PAAPA57O3PPA13P2A51O4PAP2A52NO3POP2AP2A2NO5P2A9PAAPA57O4PA14P2A51O3PAAP2A50NO3POP2AAP2A2NO4P3A8POPPA59O3PPA13P2A51O4P4A50NO3POP2APAP2ANO5P2A9POPPA59O4PA14P2A51O3P5A48NO3POP2AAPAAP2NO4P2A9POPPA61O3PA14P2A51O4P4A48NO3POP2APA3PNO5P2A9POPPA61O4PA13P3A51O3PAAP2A46NO3POP2AAPA4NO4P13OPPA63O3PPA12P3A51O4PAP2A46NO3POP2APA4NO5P2A9POPPA63OPO2PA14P2A51O3PAAP2A44NO3POP2AAPA4NO4P16A64P6A13P2A51O4PAP2A44NO3POP2APA4NO5P2A9P3A65P5A14P2A51O3PAAP2A42NO3POP2AAPA4NO4P2A9P3A66PA4PA13P2A51O4PAP2A42NO3POP2APA4NO5P2A9P3A67PA3PA14P2A51O3PAAP2A40NO3POP2AAPA4NO4P3A8P3A68PA4PA13P2A51O4PAP2A40NO3POP2APA4NO5P2A9P3A69PA3PA14P2A51O3PAAP2A38NO3POP2AAPA3PNO4P3A8P3A71PA3PA13P2A51O4PAP2A38NO3POP2APA2PPNO5P2A9P3A71PA3PA14P2A51O3PAAP2A36NO3POP2AAPAAP2NO4P3A8P3A73PA3PA13P2A51O4PAP2A36NO3POP2APAAP2NO5P3A8P3A73P5A14P2A51O3PAAP2A34NO3POP2AAPAP3NO4P3A8P3A75PO2PPA13P2A51O4P4A34NO3POPPO6PNO5P3A8P3A75O4PPO12P3A51O2P7A31NO3POP10NO4P4A7P3A77O3P18A51O3P5A32NO3POP9NO5P3A8P3A77O4P14AP2A51O3PAAP2A30NO3POP2AAPA4NO4P4A7P3A79O3PPA13P2A51O4PAP2A30NO3POP2APA4NO5P3A8P3A79O4PPA13P2A51O3PAAP2A28NO3POP2AAPA4NO4P16A81O3PPA13P2A51O4PAP2A28NOP7APA4NO5P16A81O4PPA13P2A51O3PAAP2A26NO5P2AAPA4NO4P16A83O3PPA13P2A51O4PAP2A26NO5P2APA4NO5P16A83O4PPA13P2A51O3PAAP2A24NO5P2AAPA4NO4P16A85O3PPA13P2A51O4PAP2A24NO5P2APA4NO5P16A85O4PPA13P2A51O3PAAP2A22NO5P2AAPA4NO4P16A87O3PPA13P2A51O4PAP2A22NO5P2APA4NO5N15PN14A11ON5A17N8A6N19O4PPA13P2A51O3P5A20NO5P2AAPA4NO25PO10P11O6P17O8P6OPO22PO15PPA51O5N24O6P2APA4NO26PO10A5PA4O6A13PA2O8AAPAPAAOPO23PO15PPA51O10PO15PO6P2AAPA4NO26PO10A5PA4O6A13PA2O8AAPAPAAOP24OPO15PA51O10PO15PO6PPO5PPNO5P22O10A5PA4O6A13PA2O8AAPAPAAOPO24P18A51O9PO15PO5P10NO27PO10A5PA4O6A13PA13PAPAAOPO25P7AP4AP2A51PO8PO15PO5P10O5P46O6P59O2PA5P4A2P2A50O3P24O4PPA8O3P5A8P2A11P2A67P2A5P2AAPPOOPA5P3A3P2A51O8PO21P2A7O3P2AAP2A7P2A11P2A67P2A6P2AP2OOP17A51OOP2AAP2A17O2PPA8O3P2A2P2A6P2A11P2A67P2A6P2AAPPOOP17A51POOPPA2P2A15O2P2A8O2P3A3P3A3P2A12P2A67P2A7P2AP2OOP17A51OOP2AAP2A15O2P2A7O3P3A4P3A2P2A12P2A67P2A7P2AAPPOOPA13P2A51POOP7A14O2P10O3P121OOPA13P2A51OOP2AAP17OOP4A5O3P5A6P5A13P2A28PA37P2A8P2AAPPOOP17A52OOPPA2PPA13O2P4A5O3PPAP2A7P3A15PA29PA37P2A9P2AAPAOOP17A51P8A12OP162"

SS_Stage1_Frame02 =
	"N145A17N19A52O145P18O19A51O145A2PA4PA4PA2O20A50OOP121OOP59A51OOP2A26P3A3P5A39P3A6PPA23OOPPA13P3A18OOP3A11P3A50OOP2A26P3A3P5A39P3A6PPA22OOP2A8O7P19OOP5A9P3A51OOP2O111A3OOPPA7N9A10O7ANOOPAP3A9P2A51PON118OP2A6NO9A10O7AO2PPAP4A7P3A51O120PPA7NO9A10O7AO3P3O12PPA51O119P2A6NO2P18O7P3OP2O13P2A51O118PPA7NOOPO7A19O4P19A50O117PPO5PPNO2PO2P25O3P18A52O4P104O6P9NOOPOOP8A17PPO3P18A51O4P32A4P65NO5P9NO2POOP9A16PPO3PPA5P10A52O4P2A73P2A3P4A12NO6P4A4NOOPOOP3AP6A15P2O3PA6P10A51O4P2A74P2A3P3A12NO5P5A3NO2POOP3AAP6A14P2O3PPA5P10A52O4P2A73P2A3P3A11NO6PPAAP2A2NOOPOOP3A3P6A13OP2O3PA6P10A51O4P3A73P2A3P2A11NP8AAP3ANO2POOP3A4P19OP2O3PPA5P10A52O4P97NO4POPPAAPAAP2NOOPOOP9A19P4O3P2O9P5A51O4P18A18P59NO3POP2O5PNO2POOP34O3P18A52O4P95NO4POP9NOOPOOP8A21P5O3P18A51O4PAP2A90NO3POP9NO2POP4AAP30O3PPA7PAPA2P2A52O4PAP2A88NO4POPPAAPA4NOOAAP4A3PA29O3PA8PAPAAP3A51O4PAP2A88NO3POP2AAPA3NPOA2PA38O3P18A52O4PAP2A86NO4POPPAAPA5PA2PA40O3PA8PA3P3A51OOA2PAP2A86NO3POP2AAPA4PA3PA40O3PPA7PA3P3A52PA2PAAPPA85NO4POPPAAPA5PA2PA42O3PA8PA2P4A51PA3PAPPA85NO3POP2AAPA4PA3PA42O3PPA7PA2P4A52PA2PAAPPA83NO4POPPAAPA5PA2PA44O3PA8PAAP5A51PA3PAPPA83NO3POP2AAPA4PA3PA44O3PPA7PAAPPAP2A52PA2PAAPPA81NO4POPPAAPA5PA2PA46O3PA8PAPPAP3A51PA3PAPPA81NO3POP2AAPA4PA3PA46O3PPA7PAPPAAP2A52PA2PAAPPA79NO4POPPAAPA5PA2PA48O3PA8P2AAP3A51PA3PAPPA79NO3POPPO6P2A3PA48O3PPA7P2A2P2OA51PA2PAAPPA77NO4POP11A2PA50PA2PA8PPA2P3A51PA3PAPPA77NO3POP12A2PA51PA2PA7PA4P2OA51PA2PAAPPA75NO4POP12AAPA52PA2PA8PA3P3A51PA3PAPPA75NO3POP5A4PA3PA53PA2PA7PA4P2A52PA2PAAPPA73NO4POPPAPPA5PA2PA54PA2PA8PA3P3A51PA3PAPPA73NO3POP2AP2A3PA3PA55PA2PA7PA4P2A52PA2PAAPPA71NO4POPPAAP3A2P4A56PA2PA8PA3P3A51PA3PAPPA71NO3POP2APPAP2AP5A57PA2PA7PA4P2A52PA2PAAPPA69NO4POPPAAPA2PPAP4A58PA2PA8PA3P3A51PA3PAPPA69NO3POP2APPA4P5A59PA2PA7PA4P2A52PA2PAAPPA67NO4POPPAAPA5P4A60PA2PA8PA3P3A51PA3PAPPA67NO3POP2APPA4P5A61PA2PA7PA4P2A52PA2PAAPPA65NO4POPPAAPA5P4A62PA2PA8PA3P3A51PA3PAPPA65NO3POP2APPA4P5A63PA2PA7PA4P2A52PA2PAAPPA63NO4POPPAAPA5P4A64PA2PA8PA3P3A51PA3PAPPA63NO3POP2APPA4P5A65PA2PA8PA3P2A52PA2PAAPPA61NO3POOPPAAPA5P4A66O4A8PA3P3A51PA3PAPPA61NO3POP2APPA4P5A67O3PA8PA3P2A52PA2PAAPPA59NO3POOPPAAPA5PA2PA68O4A8PA4P2A51PA3PAPPA59NO3POP2APA5PA3PA69O4A8PA3P2A52PA2PAAPPA57NO3POP2OAPA5PA2PA70PA2PA8PA4P2A51PA3PAPPA57NO3POP2APA5PA3PA71PA2PA8PA3P3A51PA2PAAPPA55NO3POP3APA5PA2PA72PA2PA8PA4P2A51PA3PAPPA55NO3POP4A5PA3PA73PA2PA8PA3P3A51PA2PAAPPA53NO3POP3APA5PA2PA74PA2PA8PA4P2A51PA3PAPPA53NO3POP2APA5PA3PA75PA2PA8PA3P3A51PA2PAAPPA51NO3POP2AAPA5PA2PA76OA2PA8PA4P2A51O4P4A50NO3POP2APA5PA3PA76O4PPA7PA3P3A51O3P5A48NO3POP2AAPA5PA2PA78O3PPA7PA4P2A51O4P4A48NP8APA5PA3PA78O4PA8PA3P3A51O3PAAP2A48PA2P3AAPA5PA2PA80O3PPA7PA3P3A51O4PAP2A47PAP6APA5PA3PA80O4PA8PA3P3A51O3PAAP2A46PA5PAAPA5PA2PA82O3PPA7PA4P2A51O4PAP2A45PA6PAPA5PA3PA82O4PA8PA3P3A51O3PAAP2A44PA5PAAPA5PA2PA84O3PPA7PA4P2A51O4PAP2A43PA6PAPA5PA3PA84O4PA8PA3P3A51O3PAAP2A42PA5PAAPA5PA2PA86O3P18A51O4PAP2A42PA5PAPA5PA3PA86O4PPA7PA3P3A51O3PAAP2A40PA5PAAPA5PA2PA88O3PPA7PA4P2A51O4PAP2A40PA5PAPA5PA3PA88O4PPA7PA3P3A51O3PAAP2A38PA5PAAPA5PA2PA90O3PPA7PA4P2A51O4PAP2A38PA5PAPA5PA3PA90O4PPA7PA3P3A51O3PAAP2A36PA5PAAPA5PA2PA92O3PPA8PA3P2A51O4P4A36PA5PAPA5PA3PA92O4PPO7PO3P3A51O2P7A33PO6AAPA5PA2PA94O3P18A51O3P5A34PO5PAPA5PA3PA94O4P18A51O3PAAP2A33O5PAAPA5PA2PA96O3PPA8PA3P2A51O4PAP2A32O6PAPA5PA3PA96O4PPA7PA3P3A51O3PAAP2A31O6AAPA5PA2PA98O3PPA8PA3P2A51O4PAP2A30PA5PAPA5PA3PA98O4PPA7PA3P3A51O3PAAP2A29PA4PAAPA5PA2PA100O3PPA8PA3P2A51O4PAP2A28PA5PAPA5PA3PA100O4PPA7PA3P3A51O3PAAP2A27PA4PAAPA5PA2PA102O3PPA8PA3P2A51O4PAP2A25O5P2APA5PA3PA3P2A95O4PPA7PA3P3A51O3PAAP2A22NO5P2AAPA4NPO2PA2P7A93O3PPA8PA3P2A51O4PAP2A22NO5P2APPA3NO5N104O4PPA7PA4P2A51O3P5A20NO5P2AAPA4NO25PO64PO22PO15PPA51O5N24O6P2APA4NO26PO64PO23PO15PPA51O10PO15PO6P2AAPA4NO26PO64P24OPO15PA51O10PO15PO6PPO5PPNO5P22O64PO24P18A51O9PO15PO5P10NO27PO64PO25P7AP4AP2A51PO8PO15PO5P10O5P113O2PA5P4A2P2A50O3P24O4PPA8O3P5A8P2A11P2A53PA12P2A5P2AAPPOOPA5P3A3P2A51O8PO21P2A7O3P2AAP2A7P2A11P2A53PA12P2A6P2AP2OOP17A51OOP2AAP2A17O2PPA8O3P2A2P2A6P2A11P2A53PA12P2A6P2AAPPOOP17A51POOPPA2P2A15O2P2A8O2P3A3P3A3P2A12P2A53PA12P2A7P2AP2OOP17A51OOP2AAP2A15O2P2A7O3P3A4P3A2P2A12P2A53PA12P2A7P2AAPPOOPA8PA3P2A51POOP21O3P10O3P41A46PA13P17OOPA7PA4P2A51OOP2AAP2A13O2P4A5O3P5A6P5A13P2A6PA45PA13PPA8P2AAPPOOP17A52OOPPA2P2A11O3P4A5O3PPAP2A7P3A15PA7PA45PA13PPA9P2AAPAOOP17A51P21OP162"

SS_Stage1_Frame03 =
	"N183A52O184A51O185A50OOP121OOP36O2P19A51OOP2A26P3A3P5A39P3A6PPA23OOPPA13P3A17O2P3A11P3A50OOP2A26P3A3P5A39P3A6PPA22OOP2A8O29P5A9P3A51OOP2O111A3OOPPA7N30OOPAP3A9P2A51PON118OP2A6NO32PPAP4A7P3A51O120PPA7NO33P3O12PPA51O119P2A6NO2P30OP2O13P2A51O118PPA7NOOPO32P19A50O117PPO5PPNO2PO2P25O3P18A52O4P104O6P9NOOPOOP28O3P18A51O4P103NO5P9NO2POOP8A9P2A3P2O3PPA5P10A52O4P2A18P2A3P2AAPPA40P2A3P4A12NO6P4A4NOOPOOP3AP5A8P2A4P2O3PA6P10A51O4P2A19P2A3P2APPA41P2A3P3A12NO5P5A3NO2POOP3AAP5A6P2A5P2O3PPA5P10A52O4P2A18P2A3P2APPA41P2A3P3A11NO6PPAAP2A2NOOPOOP3A3P5AO14P2O3PA6P10A51O4P3A18P2A3P5A41P2A3P2A11NP8AAP3ANO2POOP3A5P4O14P2O3PPA5P10A52O4P97NO4POPPAAPAAP2NOOPOOP34O3P2O9P5A51O4P97NO3POP2O5PNO2POOP34O3P18A52O4P95NO4POP9NOOPOOP36O3P18A51O4PAP2A90NO3POP9NO2POOP3AAP3A3P2A19O3PPA9PA2P2A52O4PAP2A88NO4POPPAAPA4NOOPOOP3A3P3AAP2A21O3PA10PA2P2A51O4PAP2A88NO3POP2AAPA3NO2POOP3A5P2AP2A21O3P18A52O4PAP2A86NO4POPPAAPA4NOOPOOP4A6P4A23O3PA10PA2P2A51O4PAP2A86NO3POP2AAPA3NO2POOP5A6P3A23O3PPA9PA2P2A52O4PAP2A84NO4POPPAAPA4NP8AP3A4P2A25O3PA10PA2P2A51O4PAP2A84NO3POP2AAPA3NO5P3OOP3A3P2A25O3PPA9PA2P2A52O4PAP2A82NO4POPPAAPA4NO4P3AOOP4AAP2A27O3PA10PA2P2A51O4PAP2A82NO3POP2AAPA3NO5P3AOOP5AP2A27O3PPA9PA2P2A52O4PAP2A80NO4POPPAAPA4NO4P3AAOOP2AP4A29O3PA10PA2P2A51O4PAP2A80NO3POP2AAPA3NO5P3AAOOP2AAP3A29O3PPA9PA2P2A52O4PAP2A78NO4POPPAAPA4NO4P3A2OOP2AAP2A31O3PA10PA2P2A51O4PAP2A78NO3POPPO6PNO5P3A2OOP2AAP2A31O3PPA9PA2P2OA51O4PAP2A76NO4POP9NO4P3A3OOP2AP2A33O3PA10PA2P2A51O4PAP2A76NO3POP9NO5P3A3OOP2AP2A33O3PPA9PA2P2OA51O4P4A74NO4POP9NO4P3A4OOP5A35O3PA10PA2P2A51O4P4A74NO3POP5A3NO5P3A4OOP5A35O3P18A52O4PAP2A72NO4POPPAPPA4NO4P3A5OOP4A37O3P18A51O4PAP2A72NO3POP2AP2A2NO5P3A5OOP4A37O3PPA9PA2P2A52O4PAP2A70NO4POPPAAP3AANO4P3A6OOP3A39O3PPA9PA2P2A51O4PAP2A70NO3POP2AAPAP2NO5P3A6OOP3A39O3P18A52O4P4A68NO4POPPAAPA2PPNO4P3A7OOP2A41O3P18A51O4P4A68NO3POP2AAPA3NO5P3A7OOP2A41O3P18A52O4P4A66NO4POPPAAPA4NO4P3A7O2PPA43O3PPA9PA2P2A51O4PAP2A66NO3POP2AAPA3NO5P11OOP2A43O3PPA9PA2P2A52O4PAP2A64NO4POPPAAPA4NO4P11O2PPA45O3PPA9PA2P2A51O4PAP2A64NO3POP2AAPA3NO5P3A7OOP2A45O3PPA9PA2P2A52O4PAP2A62NO4POPPAAPA4NO4P3APA5O2PPA47O3PPA9PA2P2A51O4PAP2A62NO3POP2AAPA3NO5P3AAPA4OOP2A47O3PPA9PA2P2A52O3PPAP2A60NO3POOPPAAPA4NO4P3A3PA2O2PPA49O3PPA9PA2P2A51O4PAP2A60NO3POP2AAPA3NO5P3A4PAAOOP2A49O3PPA9PA2P2A52O3PAAP2A58NO3POOPPAAPA4NO4P3APA4PO2PPA51O3PPA9PA2P2A51O4PAP2A58NO3POP2APA4NO5P3AAPA4OOP2A51O4PA9PA2P2A52O3PAAP2A56NO3POP2O5PPNO4P3A3PA3OOPPA53O3PPA9PA2P2A51O4PAP2A56NO3POP9NO5P3A4PAAO2PPA53O4PO13P3A51O3PAAP2A54NO3POP10NO4P3A6PAOOPPA55O3P18A51O4PAP2A54NO3POP9NO5P3A7O2PPA55O4P18A51O3PAAP2A52NO3POP5A4NO4P3A8OOPPA57O3PPA9PA2P2A51O4PAP2A52NO3POP2AP2A2NO5P3A7O2PPA57O4PA9PA3P2A51O3PAAP2A50NO3POP2AAP2A2NO4P3A8OOPPA59O3P18A51O4P4A50NO3POP2APAP2ANO5P3A7O2PPA59O4P18A51O3P5A48NO3POP2AAPAAP2NO4P3A8OOPPA61O3PPA9PA2P2A51O4P4A48NO3POP2APA3PNO5P3A7O2PPA61O4P18A51O3PAAP2A46NO3POP2AAPA4NO4P12OOPPA63O3P18A51O4PAP2A46NO3POP2APA4NO5P12OOPPA63O4PA14P2A51O3PAAP2A44NO3POP2AAPA4NO4P16A65O3PPA13P2A51O4PAP2A44NO3POP2APA4NO5P16A65O4PA14P2A51O3PAAP2A42NO3POP2AAPA4NO4P16A67O3PPA13P2A51O4PAP2A42NO3POP2APA4NO5P16A67O4PA14P2A51O3PAAP2A40NO3POP2AAPA4NO4P16A69O3PPA13P2A51O4PAP2A40NO3POP2APA4NO5P16A69O4PPA13P2A51O3PAAP2A38NO3POP2AAPA3PNO4P16A71O3PPA13P2A51O4PAP2A38NO3POP2APA2PPNO5P16A71O4PPA13P2A51O3PAAP2A36NO3POP2AAPAAP2NO4P16A73O3PPA13P2A51O4PAP2A36NO3POP2APAAP2NO5P16A73O4PPA13P2A51O3PAAP2A34NO3POP2AAPAP3NO4P16A75O3PPA13P2A51O4P4A34NO3POPPO6PNO5P16A75O4PPO12P3A51O2P7A31NO3POP10NO4P16A77O3P18A51O3P5A32NO3POP9NO5P16A77O4P14AP2A51O3PAAP2A30NO3POP2AAPA4NO4P9A2P3A79O3PPA13P2A51O4PAP2A30NO3POP2APA4NO5P5A6P3A79O4PPA13P2A51O3PAAP2A28NO3POP2AAPA4NO4P8A3P3A81O3PPA13P2A51O4PAP2A28NOP7APA4NO5P9A2P3A81O4PPA13P2A51O3PAAP2A26NO5P2AAPA4NO4P11AP3A83O3PPA13P2A51O4PAP2A26NO5P2APA4NO5P16A83O4PPA13P2A51O3PAAP2A24NO5P2AAPA4NO4P16A85O3PPA13P2A51O4PAP2A24NO5P2APA4NO5P16A85O4PPA13P2A51O3PAAP2A22NO5P2AAPA4NO4P16A87O3PPA13P2A51O4PAP2A22NO5P2APA4NO5N104O4PPA13P2A51O3P5A20NO5P2AAPA4NO25PO64PO22PO15PPA51O5N24O6P2APA4NO26PO64PO23PO15PPA51O10PO15PO6P2AAPA4NO26PO64P24OPO15PA51O10PO15PO6PPO5PPNO5P22O64PO24P18A51O9PO15PO5P10NO27PO64PO25P7AP4AP2A51PO8PO15PO5P10O5P113O2PA5P4A2P2A50O3P24O4PPA8O3P5A8P2A11P2A67P2A5P2AAPPOOPA5P3A3P2A51O8PO21P2A7O3P2AAP2A7P2A11P2A67P2A6P2AP2OOP17A51OOP2AAP2A17O2PPA8O3P2A2P2A6P2A11P2A67P2A6P2AAPPOOP17A51POOPPA2P2A15O2P2A8O2P3A3P3A3P2A12P2A67P2A7P2AP2OOP17A51OOP2AAP2A15O2P2A7O3P3A4P3A2P2A12P2A67P2A7P2AAPPOOPA13P2A51POOP21O3P10O3P121OOPA13P2A51OOP2AAP2A13O2P4A5O3P5A6P5A13P2A67P2A8P2AAPPOOP17A52OOPPA2P2A11O3P4A5O3PPAP2A7P3A15PA68P2A9P2AAPAOOP17A51P21OP162"

SS_Stage2_Frame01 =
	"N183PPA52NO182PA52NO182PPA52NOP121OOP36O2P3OOP12A52NOOPO121PPO6NO30PO15PPA52NOPO120P2O6NO30PO16PA52NOOP2O5PPO30P76OOPPO6N31OOPO15PPA52NON118OP2O6NO32PPO15PA52NO120PPO7NO33PO15PPA52NO118P2O6NNOOP30OPPO15PA52NO118PPO7NOOPO32PO15PPA52NO116PPO7NNOOPO2P25O3PPO15PA52NO4P104O6P8ONOOPOOP27NO3PO15PPA52NO3P103NO5PPO7NO2POOP2J24PNO2PPO15PA52NO4PPJ100O6PPO7NOOPOOP3JJP10JP11NO3PO15PPA52NO3P2JP20JP53JP20NO5PPO7NO2POOP3J2P10JP11NO2PPO15PA52NO4PPJP21JP53JP18NO6PPO7NOOPOOP3JPJ2P10JP10NO3P15OPPA52NO3P2JP21JP53JP17NP7O7NO2POOP2J2PJ2P10JP10NO2PPO15PA52NO4PPJP22JP53JP15NO4POPPO7NOOPOOP3J3PJ2P21NO3PN15PPA52NO3P2JP93NO3POPPO7NO2POOP2J5PJ2PJP19NO2PPO15PA52NO4PPJ93NO4POPPO7NOOPOOP3J6PJPPJ19PNO3PO15PPA52NO3P2JJA90NO3POPPO7NO2POOP2J8PPJ2A19NO2PPO15PA52NO4PPJ2A88NO4POPPO7NOOPOOP3J8PPJJA20NO3PO15PPA52NO3P2JJA88NO3POPPO7NO2POOP2J9PJ2A21NO2PPO15PA52NO4PPJ2A86NO4POPPO7NOOPOOP3J8PPJJA22NO3PO15PPA52NO3P2JJA86NO3POPPO7NO2POOP2J9PJ2A23NO2PPO15PA52NO4PPJ2A84NO4POPPO7NP8J8PPJJA24NO3PO15PPA52NO3P2JJA84NO3POPPO7NO5P2J9PJ2A25NO2PPO15PA52NO4PPJ2A82NO4POPPO7NO4P3J8PPJJA26NO3PO15PPA52NO3P2JJA82NO3POPPO7NO5P2J9PJ2A27NO2PPO15PA52NO4PPJ2A80NO4POPPO7NO4P3J8PPJJA28NO3PO15PPA52NO3P2JJA80NO3POPPO7NO5P2J9PJ2A29NO2PPO15PA52NO4PPJ2A78NO4POPPO7NO4P3J8PPJJA30NO3PO15PPA52NO3P2JJA78NO3POPPO7NO5P3J8PJ2A31NO2PPO15PA52NO4PPJ2A76NO4POP9NO4P3JPJ6PPJJA32NO3PO15PPA52NO3P2JJA76NO3POPPO7NO5P2J2PJ5PJ2A33NO2PPO15PA52NO4PPJ2A74NO4POPPO7NO4P3J3PJ3PPJJA34NO3PO15PPA52NO3P2JJA74NO3POPPO7NO5P2J5PJ2PJ2A35NO2PPO15PA52NO4PPJ2A72NO4POPPO7NO4P3J6PJPPJJA36NO3PPO14PPA52NO3P2JJA72NO3POP9NO5P2JPJ6PPJ2A37NO2PPO15PA52NO4PPJ2A70NO4POPPO7NO4P3JJPJ5PPJJA38NO3PPO14PPA52NO3P2JJA70NO3POPPO7NO5P2J3PJ4PJ2A39NO2PPO15PA52NO4PPJ2A68NO4POPPO7NO4P3J4PJ2PPJJA40NO3PPO14PPA52NO3P2JJA68NO3POPPO7NO5P2J6PJJPJ2A41NO2PPO15PA52NO4PPJ2A66NO4POPPO7NO4P3J7P2JJA42NO3PPO14PPA52NO3P2JJA66NO3POPPO7NO5P2J9PJ2A43NO2PPO15PA52NO4PPJ2A64NO4POPPO7NO4P3J8PPJJA44NO3PPO14PPA52NO3P2JJA64NO3POPPO7NO5P2J9PJ2A45NO2PPO15PA52NO4PPJ2A62NO4POPPO7NO4P3J8PPJJA46NO3P18A52NO3P2JJA62NO3POPPO7NO5P2J9PJ2A47NO2P10O6PA52NO4PPJ2A60NO3POOPPO7NO4P3J8PPJJA48NO3P9O6PPA52NO3P2JJA60NO3POPPO7NO5P2J9PJ2A49NO2P10O6PA52NO4PPJ2A58NO3POOPPO7NO4P3J8PPJJA50NO3P10O5PPA52NO3P2JJA58NO3POPPO7NO5P2J9PJ2A51NO3PO15PA52NO4PPJ2A56NO3POP2O7NO4P3J8PPJJA52NO3PPO14PPA52NO3P2JJA56NO3POPPO7NO5P2J9PJ2A53NO3PO15PA53NO3PPJ2A54NO3POP2O7NO4P3J8PPJJA54NO3PPO14PPA52NO3P2JJA54NO3POPPO7NO5P2J9PJ2A55NO3PO15PA53NO3PPJ2A52NO3POP2O7NO4P3J8PPJJA56NO3PPO14PPA52NO3P2JJA52NO3POPPO7NO5P2J9PJ2A57NO3PO15PA53NO3PPJ2A50NO3POP2O7NO4P3J8PPJJA58NO3PPO14PPA52NO3P2JJA50NO3POPPO7NO5P2J9PJ2A59NO3PO15PA53NO3PPJ2A48NO3POP2O7NO4P3J8PPJJA60NO3PPO14PPA52NO3P2JJA48NO3POPPO7NO5P2J9PJ2A61NO3PO15PA53NO3PPJ2A46NO3POP2O7NO4P3J8PPJJA62NO3PPO14PPA52NO3P2JJA46NO3POPPO7NO5P2J9PJ2A63NO3PO15PA53NO3PPJ2A44NO3POP2O7NO4P4J7PPJJA64NO3PPO14PPA52NO4PPJJA44NO3POPPO7NO5P2JJPJ6PJ2A65NO3PO15PA53NO3PPJ2A42NO3POP2O7NO4P3J2PJ4PPJJA66NO3PPO14PPA52NO4PPJJA42NO3POPPO7NO5P2J4PJ3PJ2A67NO3PO15PA53NO3PPJ2A40NO3POP2O7NO4P3J5PJJPPJJA68NO3PPO14PPA52NO4PPJJA40NO3POPPO7NO5P2J7PJPJ2A69NO3PPO14PA53NO3PPJ2A38NO3POP2O6PNO4P4J7PPJJA70NO3PPO14PPA52NO4PPJJA38NO3POPPO7NO5P2JJPJ6PJ2A71NO3PPO14PA53NO3PPJ2A36NO3POP2O6PNO4P3J2PJ4PPJJA72NO3PPO14PPA52NO4PPJJA36NO3POPPO7NO5P2J4PJ3PJ2A73NO3PPO14PA53NO3PPJ2A34NO3POP2O6PNO4P3J5PJJPPJJA74NO3PPO14PPA52NO4PPJJA34NO3P3O7NO5P2J7PJPJ2A75NO3PPO14PA53NO3PPJ2A32NO3POP2O6PNO4P3J8PPJJA76NO3PPO14PPA52NO4PPJJA32NO3P3O7NO5P2J9PJ2A77NO3PPO14PA53NO3PPJ2A30NO3POP2O7NO4P3J8PPJJA78NO3PPO14PPA52NO4PPJJA30NO3P3O7NO5P2J9PJ2A79NO3PPO14PA53NO3PPJ2A28NO3POP2O7NO4P3J8PPJJA80NO3PPO14PPA52NO4PPJJA28NOP13ONO5P2J9PJ2A81NO3PPO14PA53NO4PJ2A26NO5P2O7NO4P3J8PPJJA82NO3P18A52NO4PPJJA26NO4P2O7NO5P2J9PJ2A83NO3PPN13OPA53NO4PJ2A24NO5P2O7NO4P3J8PPJJA84NO3PPO14PPA52NO4PPJJA24NO5PPO7NO5P2J9PJ2A85NO3PPO14PA53NO4PJ2A22NO5P2O7NO4P3J8PPJJA86NO3P2O13PPA52NO4PPJJA22NO5PPO7NO5N105O3PPO14PA53NO4PJ2A20NO5P2O7NO25PNO63PNO16NO3P2O13PPA52NO4PN24O5PPO7NO26PNO63PNO17NO3PPO14PA53NO4PO3PO15PNO5P2O7NO26PNO63P19NO4PPO13PPA52NO4PO3PO15PNO5PPO7NNO4P22NO63PNO18NO3PPO14PA53NO4PO2PO15NO5P2O7NO27PNO63PNO18NO4PPO13PPA52NO4PO2PO15NO5PPO8NO4P110NO3PPO14PA53NO4P18NO6PPO7NO4P111NO4PPO13PPA52NO4P18NO5P2O7NO4PPO13PONO7P16O52PONO12NO3PPO14PA53NO4PO15NO6PPO7NO4P2O13PONO7P16O52PONO12NO4PPO13PPA52NO5PO14NO5P2O7NO4PPO13PONO8P16O53PONO12NO3PPO14PA53NO4PO13NO6PPO7NO4P2O13PONO8P16O53PONO12NO4PPO13PPA52NO5PO12NO5P2O7NO4PPO14PONO80PONO12NO3PPO14PA53NO4PO11NO6PPO7NO4P2O13PONO81PONO12NO4PPO13PPA52NO5PO10NO6PPO7NO4PPO14PONO82PONO12NO3P2O13PA53NP20OP4O6NP7O100PONO12NO4PPO13PP0"

SS_Stage2_Frame02 =
	"N183PPA52NO182PA52NO182PPA52NOP121OOP36O2P3OOP12A52NOOP19O102PPO6NO30PO10P6A52NOP19O101P2O6NO30PO10P6A52NOOP118OOPPO6N31OOPO10P6A52NON118OP2O6NO32PPO9P6A52NO56PO62PPO7NO33PO10P6A52NO55PO61P2O6NNOOP30OPPO9P6A52NO55PO61PPO7NOOPO32PO10P6A52NO54PO60PPO7NNOOPO2P25O3PPO9P6A52NO4P104O6P8ONOOPOOP27NO3PO10P6A52NO3P103NO5PPO7NO2POOP2J24PNO2PPO9P6A52NO4PPJ100O6PPO7NOOPOOP3JJP10JP11NO3PO10P3OPPA52NO3P2JP20JP37J16P20NO5PPO7NO2POOP3J2P10JP11NO2PPO9PO4PA52NO4PPJP21JP37J14P20NO6PPO7NOOPOOP3JPJ2P10JP10NO3P15OPPA52NO3P2JP21JP37J12P21NP7O7NO2POOP2J2PJ2P10JP10NO2PPO15PA52NO4PPJP22JP70NO4POPPO7NOOPOOP3J3PJ2P21NO3PN15PPA52NO3P2JP93NO3POPPO7NO2POOP2J5PJ2PJP19NO2PPO15PA52NO4PPJ93NO4POPPO7NOOPOOP3J6PJPPJ19PNO3PO15PPA52NO3P2JJA90NO3POPPO7NO2POOP2J8PPJ2A19NO2PPO15PA52NO4PPJ2A88NO4POPPO7NOOPOOP3J8PPJJA20NO3PO15PPA52NO3P2JJA88NO3POPPO7NO2POOP2J9PJ2A21NO2PPO15PA52NO4PPJ2A86NO4POPPO7NOOPOOP3J8PPJJA22NO3PO15PPA52NO3P2JJA86NO3POPPO7NO2POOP2J9PJ2A23NO2PPO15PA52NO4PPJ2A84NO4POPPO7NP8J8PPJJA24NO3PO15PPA52NO3P2JJA84NO3POPPO7NO5P2J9PJ2A25NO2PPO15PA52NO4PPJ2A82NO4POPPO7NO4P3J8PPJJA26NO3PO15PPA52NO3P2JJA82NO3POPPO7NO5P2J9PJ2A27NO2PPO15PA52NO4PPJ2A80NO4POPPO7NO4P3J8PPJJA28NO3PO15PPA52NO3P2JJA80NO3POPPO7NO5P2J9PJ2A29NO2PPO15PA52NO4PPJ2A78NO4POPPO7NO4P3J8PPJJA30NO3PO15PPA52NO3P2JJA78NO3POPPO7NO5P3J8PJ2A31NO2PPO15PA52NO4PPJ2A76NO4POP9NO4P3JPJ6PPJJA32NO3PO15PPA52NO3P2JJA76NO3POPPO7NO5P2J2PJ5PJ2A33NO2PPO15PA52NO4PPJ2A74NO4POPPO7NO4P3J3PJ3PPJJA34NO3PO15PPA52NO3P2JJA74NO3POPPO7NO5P2J5PJ2PJ2A35NO2PPO15PA52NO4PPJ2A72NO4POPPO7NO4P3J6PJPPJJA36NO3PPO14PPA52NO3P2JJA72NO3POP9NO5P2JPJ6PPJ2A37NO2PPO15PA52NO4PPJ2A70NO4POPPO4P2NO4P3JJPJ5PPJJA38NO3PPO14PPA52NO3P2JJA70NO3POPPO5PPNO5P2J3PJ4PJ2A39NO2PPO15PA52NO4PPJ2A68NO4POPPO4P2NO4P3J4PJ2PPJJA40NO3PPO14PPA52NO3P2JJA68NO3POPPO5PPNO5P2J6PJJPJ2A41NO2PPO15PA52NO4PPJ2A66NO4POPPO4P2NO4P3J7P2JJA42NO3PPO14PPA52NO3P2JJA66NO3POPPO5PPNO5P2J9PJ2A43NO2PPO15PA52NO4PPJ2A64NO4POPPO4P2NO4P3J8PPJJA44NO3PPO14PPA52NO3P2JJA64NO3POPPO5PPNO5P2J9PJ2A45NO2PPO15PA52NO4PPJ2A62NO4POPPO4P2NO4P3J8PPJJA46NO3P18A52NO3P2JJA62NO3POPPO5PPNO5P2J9PJ2A47NO2PPON8O5PA52NO4PPJ2A60NO3POOPPO4P2NO4P3J8PPJJA48NO3PPO14PPA52NO3P2JJA60NO3POPPO5PPNO5P2J9PJ2A49NO2PPO15PA52NO4PPJ2A58NO3POOPPO7NO4P3J8PPJJA50NO3P18A52NO3P2JJA58NO3POPPO7NO5P2J9PJ2A51NO3PN14OPA52NO4PPJ2A56NO3POP2O7NO4P3J8PPJJA52NO3PPO14PPA52NO3P2JJA56NO3POPPO7NO5P2J9PJ2A53NO3PO15PA53NO3PPJ2A54NO3POP2O7NO4P3J8PPJJA54NO3PPO14PPA52NO3P2JJA54NO3POPPO7NO5P2J5P4J2A55NO3PO15PA53NO3PPJ2A52NO3POP2O7NO4P3J4P5JJA56NO3PPO14PPA52NO3P2JJA52NO3POPPO7NO5P2J5P4J2A57NO3PO15PA53NO3PPJ2A50NO3POP2O7NO4P3J4P5JJA58NO3PPO14PPA52NO3P2JJA50NO3POPPO7NO5P2J5P4J2A59NO3PO15PA53NO3PPJ2A48NO3POP2O7NO4P3J4P5JJA60NO3PPO14PPA52NO3P2JJA48NO3POPPO7NO5P2J5P4J2A61NO3PO15PA53NO3PPJ2A46NO3POP2O7NO4P3J4P5JJA62NO3PPO14PPA52NO3P2JJA46NO3POPPO7NO5P2J5P4J2A63NO3PO15PA53NO3PPJ2A44NO3POP2O7NO4P4J3P5JJA64NO3PPO14PPA52NO4PPJJA44NO3POPPO7NO5P2JJPJ2P4J2A65NO3PO15PA53NO3PPJ2A42NO3POP2O7NO4P3J2PJP5JJA66NO3PPO14PPA52NO4PPJJA42NO3POPPO7NO5P2J4P5J2A67NO3PO15PA53NO3PPJ2A40NO3POP2O7NO4P3J5P4JJA68NO3PPO14PPA52NO4PPJJA40NO3POPPO7NO5P2J7P2J2A69NO3PPO14PA53NO3PPJ2A38NO3POP2O6PNO4P4J7PPJJA70NO3PPO14PPA52NO4PPJJA38NO3POPPO7NO5P2JJPJ6PJ2A71NO3PPO14PA53NO3PPJ2A36NO3POP2O6PNO4P3J2PJ4PPJJA72NO3PPO14PPA52NO4PPJJA36NO3POPPO7NO5P2J4PJ3PJ2A73NO3PPO14PA53NO3PPJ2A34NO3POP2O6PNO4P3J5PJJPPJJA74NO3PPO14PPA52NO4PPJJA34NO3P3O7NO5P2J7PJPJ2A75NO3PPO14PA53NO3PPJ2A32NO3POP2O6PNO4P3J8PPJJA76NO3PPO14PPA52NO4PPJJA32NO3P3O7NO5P2J9PJ2A77NO3PPO14PA53NO3PPJ2A30NO3POP2O7NO4P3J8PPJJA78NO3PPO14PPA52NO4PPJJA30NO3P3O7NO5P2J9PJ2A79NO3PPO14PA53NO3PPJ2A28NO3POP2O7NO4P3J8PPJJA80NO3PPO14PPA52NO4PPJJA28NOP13ONO5P2J9PJ2A81NO3PPO14PA53NOP4J2A26NON3OP2O7NO4P3J8PPJJA82NO3P18A52N5PPJJA26NO4P2O7NO5P2J9PJ2A83NO3PPN13OPA53NO4PJ2A24NO5P2O7NO4P3J8PPJJA84NO3PPO14PPA52NO4PPJJA24NO5PPO7NO5P2J9PJ2A85NO3PPO14PA53NO4PJ2A22NO5P2O7NO4P3J8PPJJA86NO3P2O13PPA52NO4PPJJA22NO5PPO7NO5N105O3PPO14PA53NO4PJ2A20NO5P2O7NO25PNO63PNO16NO3P2O13PPA52NO4PN24O5PPO7NO26PNO63PNO17NO3PPO14PA53NO4PO3PO15PNO5P2O7NO26PNO63P19NO4PPO13PPA52NO4PO3PO15PNO5PPO7NNO4P22NO63PNO18NO3PPO14PA53NO4PO2PO15NO5P2O7NO27PNO63PNO18NO4PPO13PPA52NO4PO2PO15NO5PPOP6ONO4P110NO3PPO14PA53NO4P18NO6PPOP6NO4P111NO4PPO13PPA52NO4P18NO5P2OP6NO4PPO13PONO77PONO12NO3PPO14PA53NO4PO15NO6PPOP6NO4P2O13PONO77PONO12NO4PPO13PPA52NO5PO14NO5P2OP6NO4PPO13PONO79PONO12NO3PPO14PA53NO4PO13NO6PPOP6NO4P2O13PONO79PONO12NO4PPO13PPA52NO5PO12NO5P2O7NO4PPO14PONO80PONO12NO3PPO14PA53NO4PO11NO6PPO7NO4P2O13PONO81PONO12NO4PPO13PPA52NO5PO10NO6PPO7NO4PPO14PONO82PONO12NO3P2O13PA53NP20OP4O6NP7O100PONO12NO4PPO13PP0"

SS_Stage3_01 =
	"A6N12PN12A5NPNO9PNPNO9PA5NPNO9PNPNO9PA4NOOPNO7PNOOPNO7PA5NOOPNO7PNOOPNO7PA4NO3PNO5PNO3PNO5PA5NO3PNO5PNO3PNO5PA4NO5PNO3PNO5PNO3PA5NO5PNO3PNO5PNO3PA4NO7PNOOPNO7PNOOPA5NO7PNOOPNO7PNOOPA4NO9PNPNO9PNPA5NO9PNPNO9PNPA5P26A5N12PN12A7NO9PNPNO9PA7NO9PNPNO9PA8NO7PNOOPNO7PA9NO7PNOOPNO7PA10NO5PNO3PNO5PA11NO5PNO3PNO5PA12NO3PNO5PNO3PA13NO3PNO5PNO3PA14NOOPNO7PNOOPA15NOOPNO7PNOOPA16NPNO9PNPA17NPNO9PNPA18P13A19N12A21NO9PA21NO9PA22NO7PA23NO7PA24NO5PA25NO5PA26NO3PA27NO3PA28NOOPA29NOOPA30NPA31NPA18"

SS_Stage3_02 = "N12ANO9PANO9PAANO7PA2NO7PA3NO5PA4NO5PA5NO3PA6NO3PA7NOOPA8NOOPA9NPA10NPA4"

SS_Stage3_03 =
	"A5N12PN12A4NPNO9PNPNO9PA4NPNO9PNPNO9PA3NOOPNO7PNOOPNO7PA4NOOPNO7PNOOPNO7PA3NO3PNO5PNO3PNO5PA4NO3PNO5PNO3PNO5PA3NO5PNO3PNO5PNO3PA4NO5PNO3PNO5PNO3PA3NO7PNOOPNO7PNOOPA4NO7PNOOPNO7PNOOPA3NO9PNPNO9PNPA4NO9PNPNO9PNPA4P26A5"

SS_Stage3_04 =
	"A6N12PN12A5NPNO9PNPNO9PA5NPNO9PNPNO9PA4NOOPNO7PNOOPNO7PA5NOOPNO7PNOOPNO7PA4NO3PNO5PNO3PNO5PA5NO3PNO5PNO3PNO5PA4NO5PNO3PNO5PNO3PA5NO5PNO3PNO5PNO3PA4NO7PNOOPNO7PNOOPA5NO7PNOOPNO7PNOOPA4NO9PNPNO9PNPA5NO9PNPNO9PNPA5P26A5N12PN12A7NO9PNPNO9PA7NO9PNPNO9PA8NO7PNOOPNO7PA9NO7PNOOPNO7PA10NO5PNO3PNO5PA11NO5PNO3PNO5PA12NO3PNO5PNO3PA13NO3PNO5PNO3PA14NOOPNO7PNOOPA15NOOPNO7PNOOPA16NPNO9PNPA17NPNO9PNPA18P13A19N12A21NO9PA21NO9PA22NO7PA23NO7PA24NO5PA25NO5PA26NO3PA27NO3PA28NOOPA29NOOPA30NPA31NPA18"

SS_Stage3_05 =
	"A19PA40NPA39NOOPA38NOOPA37NO3PA36NO3PA35NO5PA34NO5PA33NO7PA32NO7PA31NO9PA30NO9PA29P13A15N12PN12PA15NO9PNPNO9PNPA14NO9PNPNO9PNPA15NO7PNOOPNO7PNOOPA14NO7PNOOPNO7PNOOPA15NO5PNO3PNO5PNO3PA14NO5PNO3PNO5PNO3PA15NO3PNO5PNO3PNO5PA14NO3PNO5PNO3PNO5PA15NOOPNO7PNOOPNO7PA14NOOPNO7PNOOPNO7PA15NPNO9PNPNO9PA14NPNO9PNPNO9PA15P27A15N12PN12PA15NO9PNPNO9PNPA14NO9PNPNO9PNPA15NO7PNOOPNO7PNOOPA14NO7PNOOPNO7PNOOPA15NO5PNO3PNO5PNO3PA14NO5PNO3PNO5PNO3PA15NO3PNO5PNO3PNO5PA14NO3PNO5PNO3PNO5PA15NOOPNO7PNOOPNO7PA14NOOPNO7PNOOPNO7PA15NPNO9PNPNO9PA14NPNO9PNPNO9PA14P28"

SS_Stage3_06 =
	"A17N12PA41NO9PNPA40NO9PNPA41NO7PNOOPA40NO7PNOOPA41NO5PNO3PA40NO5PNO3PA41NO3PNO5PA40NO3PNO5PA41NOOPNO7PA40NOOPNO7PA41NPNO9PA40NPNO9PA41P13A27N12PN12PA27NO9PNPNO9PNPA26NO9PNPNO9PNPA27NO7PNOOPNO7PNOOPA26NO7PNOOPNO7PNOOPA27NO5PNO3PNO5PNO3PA26NO5PNO3PNO5PNO3PA27NO3PNO5PNO3PNO5PA26NO3PNO5PNO3PNO5PA27NOOPNO7PNOOPNO7PA26NOOPNO7PNOOPNO7PA27NPNO9PNPNO9PA26NPNO9PNPNO9PA27P27A13N12PN12PN12PA11NPNO9PNPNO9PNPNO9PNPA10NPNO9PNPNO9PNPNO9PNPA9NOOPNO7PNOOPNO7PNOOPNO7PNOOPA8NOOPNO7PNOOPNO7PNOOPNO7PNOOPA7NO3PNO5PNO3PNO5PNO3PNO5PNO3PA6NO3PNO5PNO3PNO5PNO3PNO5PNO3PA5NO5PNO3PNO5PNO3PNO5PNO3PNO5PA4NO5PNO3PNO5PNO3PNO5PNO3PNO5PA3NO7PNOOPNO7PNOOPNO7PNOOPNO7PA2NO7PNOOPNO7PNOOPNO7PNOOPNO7PAANO9PNPNO9PNPNO9PNPNO9PANO9PNPNO9PNPNO9PNPNO9PAP54"

SS_Welder_01 = "AD4BBA5D4BO3GAADC4BI2FIA2C4BI4A2C4BI3AIA8PAIAAEA4I2A2IA13EA9DA4"

SS_Welder_02 = "AD4BBA5ED4BO3GA2EC4BI2FIAADAC4BI4A3C4BI3AIADA7PAIAADA5I2A2IA14DA10DADA9EA7"

SS_Welder_03 = "AD4BBA5D4BO3GA2C4BI2FIAAEC4BI4A2C4BI3AIAEA6PAIAADDA3I2A2IA13EDA8EAEDAA0"

SS_Welder_04 = "AD4BBA5D4BO3GA2C4BI2FIA2C4BI4A2C4BI3AIAEA6PAIAAEEA3I2A2IDEA11EDA10EEAA0"

SS_Welder_05 = "AD4BBA5D4BO3GA2C4BI2FIA2C4BI4A2C4BI3AIA8PAIAAEEA3I2A2IAEA11EEA11EAA0"

SS_Welder_06 = "AD4BBA4D4BO3GAAC4BI2FIAAC4BI4AAC4BI3AIA7PAIAAEA3I2A2IA12EA0"

function loadSSSprites()
	loadExtendedSprite(unpac_noheader(SS_Ship_up), "SS_Ship_up", 29, 31, 0)

	loadExtendedSprite(unpac_noheader(SS_Stage1_Frame01), "SS_Stage1_Frame01", 237, 105, 0)
	loadExtendedSprite(unpac_noheader(SS_Stage1_Frame02), "SS_Stage1_Frame02", 237, 105, 0)
	loadExtendedSprite(unpac_noheader(SS_Stage1_Frame03), "SS_Stage1_Frame03", 237, 105, 0)

	loadExtendedSprite(unpac_noheader(SS_Stage2_Frame01), "SS_Stage2_Frame01", 238, 105, 0)
	loadExtendedSprite(unpac_noheader(SS_Stage2_Frame02), "SS_Stage2_Frame02", 238, 105, 0)

	loadExtendedSprite(unpac_noheader(SS_Stage3_01), "SS_Stage3_01", 34, 41, 0)
	loadExtendedSprite(unpac_noheader(SS_Stage3_02), "SS_Stage3_02", 13, 13, 0)
	loadExtendedSprite(unpac_noheader(SS_Stage3_03), "SS_Stage3_03", 33, 14, 0)
	loadExtendedSprite(unpac_noheader(SS_Stage3_04), "SS_Stage3_04", 34, 41, 0)
	loadExtendedSprite(unpac_noheader(SS_Stage3_05), "SS_Stage3_05", 43, 41, 0)
	loadExtendedSprite(unpac_noheader(SS_Stage3_06), "SS_Stage3_06", 55, 42, 0)

	loadExtendedSprite(unpac_noheader(SS_Welder_01), "SS_Welder_01", 14, 9, 0)
	loadExtendedSprite(unpac_noheader(SS_Welder_02), "SS_Welder_02", 15, 10, 0)
	loadExtendedSprite(unpac_noheader(SS_Welder_03), "SS_Welder_03", 14, 9, 0)
	loadExtendedSprite(unpac_noheader(SS_Welder_04), "SS_Welder_04", 14, 9, 0)
	loadExtendedSprite(unpac_noheader(SS_Welder_05), "SS_Welder_05", 14, 9, 0)
	loadExtendedSprite(unpac_noheader(SS_Welder_06), "SS_Welder_06", 13, 8, 0)
end

-- Tunnel2 Scene

Tunnel2_Engine =
	"A8C24A11C4B20CA7PPB5P20BCA5POC4BPPOON15OOPBCA3PPB5PPOOP17OOPBCAAPOOC4BPOOPPO3N8O2PPOOPBAAP2B5POPPOP15OPPOPBAAP3B4POPOP17OPOPBAAP4B3POPOP17OPOPBA2P4B2POPOP17OPOPBO4BP2BBPOPOP17OPOPBP4BIP2BPOPOP17OPOPBP4BIP2BPOPOP17OPOPBP4BIP2BPOPOP17OPOPBP4BIP2BPOPOP17OPOPBP4BIP2BPOPOP17OPOPBA2I3P2BPOPOP17OPOPBAAPI3P2BPOPOP17OPOPBAAP7BPOPOP17OPOPBA2P6BPOPOP17OPOPBO4BP3BPOPOP17OPOPBP4BIP2BPOPOP17OPOPBP4BIP2BPOPOP17OPOPBP4BIP2BPOPOP17OPOPBP4BIP2BPOPOP17OPOPBA2I3P2BPOPOP17OPOPBAAPI3P2BPOPOP17OPOPBAAPI3P2BPOPOP17OPOPBAAP7BPOPOP17OPOPBAAP7BPOPOP17OPOPBAAP7BPOPOP17OPOPBAAP7BPOPOP17OPOPBAAP7BPOPPOP15OPPOPBAAP7BPOOPPO15PPOOPBA2P9OOP17OOPA5P9O19PA7P28A3"

Tunnel2_Shine_01 =
	"A44D3A15D5M62A88D3A15D2ADDA63MA86D3A15D2ADDA65MA108DDA67MA82D3A16D4A69MA80D3A16D4A135M5A170D4A171D4A50M67A53D3A51DDM3A61M3A49D3A51D3M2A62M3A103D5M2A62M3A101D7M2A62M3A37D3A7M13A35D9M2A88M6A3D3A9D4A45D8A9MAAM48AAMMA102D8A11MAAM48AAMMA24D3A6D2A10D4A47D6A172D4A92D2A7D2A10D4A51D2A96DA78DA798M3A107DDM2AAM54A5M3A105D3M2AAM52A7M3A103D5MA3M50A9M3A101D4ADA99KA69D4A172D4A172D6A172D4A174D2A176DA470K3A1144CAM57A117C2AM57A115C2A58MMA113C2A60MMA111C2A62MA110C2A63MMA48KAKKA57CA65MA49K3A174K3A175K3A174K3A1834K2A355K3A92"

Tunnel2_Shine_02 =
	"A44D3A15D5M62A88D3CA14D3ADCA63MA86D3CA14D3ADCA65MA109DCA67MA82D3CA15D4CA69MA80D3CA15D4CA135M5DA170D4CA49M66A54D4CA49DM69A51D3CA50D2M3A61M3A49D3CA50D4M2A62M3A103D6M2A62M3A101D8M2A62DCDEA38D2CA6M11C2A34D8CCD2A88M4C2A3D2CA8D4CA44D8CA9MAAM48AAMMA103D7CA92D2CA7DDCA9D4CA47D5CA173D3CA92DDCA8DDCA9D4CA51DDCA96DA79CA556MMA62M3A109M3A62M3A107D2M2AAM54A5M3A105D4MMDAAM52A7M3A103D7A64D3A101D6CA170D6CA170D6CA171D5CA173D3CA175DDCA177CA470K4AKA971M57A119CCAM57A117C3AM57A115C3A58MMA113C3A60MMA111C3A62MA111C2A63MMA48KAKKA58CA65MA49K3A175K3A176K3A175K3A1842K2A357K3A96"

Tunnel2_Shine_03 =
	"A43D3A15D5M3AM58A87D3CA14D3AACA64MA85D3CA14D3A69MA109CA68MA81D3CA15D4CA70MA79D3CA15D4CA135M5DA45M67A56D4CA48M68A53D4CA49DDM69A50D3CA50D3M3A61M3A48D3CA50D5M2A62M3A102D7M2A62M3A100D8CD2A62DCDEA37D2CA6M11C2A34D8C2D2A88M2C4A3DDCA8D4CA44D8CCA169D6CCA92DDCCA7DCA9D4CA48D4CCA173D2CCA92DCCA8DCA9D4CA52DCCA95CDA79CA440M3A110M2A62M3A108DDM2A62M3A106D3M2AAM54A5M3A104D8A62DCDEA102D6CDA64D2EA100D6CCA169D6CCA169D6CCA171D4CCA173D2CCA175DCCA177CA467K4A794M60A118CM60A116C2AM59A114C4AM59A112C4A58M3A110C4A60M2A109C4A62MMA110C2A63MMA46KAKKA60CA65MA47K3A175K3A176K3A175K3A1841K2A357K3A99"

Tunnel2_Shine_04 =
	"A38D3A15D5AAM63A82D3CA14D3AACA66MA80D3CA14D3A71MA104CA70MA76D3CA15D4CA72MA74D3CA15D4CA79M29A23M5DA5M38AAM67A52D4CA6DDA40M68A49D4CA7DCCA39DDM4D60M3A46D3CA8DCA40D3M3A61M3A44D3CA8DCA40D5M2A62M3A99D10A62DCDEA97D7CCD2A62DCDEA34DDCA6M11DDACA34D7C3D2A88MMCCAC2ADCA8D4CA45D7C2A166D5C2A92DCCA6CA8D4CA49D3C2A170DDC2A92CCA17D4CA53C2A94CDA77CA256M3A107M2A62M3A106DM2A62M3A104D2M2A62M3A102D4M2AAM54A5DCDEA100D9A62DCDEA98D7CDA64D2EA96D7CCA165D7CCA166D6CCA168D4CCA170D2CCA172DCCA174CA456K3A607MMA56M2A114CM61A112C2M61A110C4AM60A108C5BAD51A4M3A106C5BA59M2A105C5BA61MMA106C3BA62DMA107CCBA63DMA40KAKKA63BA65DA41K3A172K3A173K3A172K3A1812K2A351K3A101"

Tunnel2_Shine_05 =
	"A37D3A15D5A2M63A81D3CA14D3AACA67MA79D3CA14D3A72MA103BBA70MA76D2CA15D4CA73MA74D2CA15D4CA80M29A22M5DA6M38AAM67A51D4CA6D2A40M68A48D4CA7DDCCA39DDM4D60M3A45D3CA8DDCA40D3M3A61M3A43D3CA8DDCA40D8A62DCDEA99D5CD3A62DCDEA97D5C3D2A62DCDEA34DCA6M9AMMDDACA34D5C5D2A88MACCAC2A10D4CA46D5C4A166D3C4A94CA6CA7D4CA50DDC4A170C4A92CCA16D4CA54C2A94CDA77CA78M3A107M2A3M55A2M3A107M2A62M3A105DDM2A62M3A103D3M2A62DCDEA101D5M2A62DCDEA99D10A62DCDEA97D7CCDA64D2EA95D7C2A164D7C2A166D5C2A168D3C2A170DDC2A172C2A174CA453K4A492MMA113CMMA56M3A111C2M62A109C4M62A107C6BD53A2M4A105C6BBD52A4EM2A104C6BBA58EEMMA105C4BBA60EDMA106C2BBA62DMA107CBBA63DDA36KAKKA67BA65DA37K3A172K3A173K3A172K3A1813K2A351K3A104"

Tunnel2_Shine_06 =
	"A36D3A15D4ADA2M63A80CD2CA14D3AACA68MA80DDCA14D3A73MA102BBA71MA76DDCA15D4CA74MA75DCA15D4CA81M29A22M5DA6M38AAM67A50D4CCA5D3A40M68A47D4CCA6D2CCA39DDM4D60M3A44D3CCA7D2CA40D7A61DCDEA42D3CCA7D2CA40D3CD3A62DCDEA99D3C2D3A62DCDEA97D3C5D2A62DCDEA34DCA6M11D2ACA34D3C7D2A93M2A9D4CCA46D3C6A166DDC6A94CAADA3CA6D4CCA50C6A170C4A92CCA2DA11D4CCA54C2A174CA12MAMA3M55A2M3A107M2A3M55A2M3A105DDM2A62M3A105DDM2A62DCDEA103D3M2A62DCDEA101D8A62DCDEA99D5CCA65DCDEA95DAD5CCACDA64D2EA93D7CCACCA164D5CCAACA166D3CCACCA168DDCCACCA170CCACCA173CCA174CA12M48A388K7A492M2A111CCMMA56M4A109C3M63A107C5D57AAEM2A105C5BBD54A4EMMA104C5B3D52A4EAMMA104C4B3A60DMA105C2B3A62MA106CB3A63DA107B2A64DA34KAKKA69BA65DA35K3A172K3A173K3A172K3A1812K2A351K3A107"

Tunnel2_Shine_07 =
	"A38D3A15D4ADA2M26A6M4AM4AM5A3M2AM3A80D4CCA12D4CAACA148D4CCA12D4CA151D2A24BBA147D2ADCCA13D5CCA148D2ADCCA13D5CCA81M29A22M5DA5M41DDM67A50D4CCA5D3A40CDM4A59M3A47D4CCA6D2CCA41D5A110D3CCA7D2CA42D6A62DCDEA42D3CCA7D2CA42D2CCD3A62DCDEA101D2C3D3A62DCDEA99D2C6D2A62DCDEA43M11D4A36D2C8D2A91CAM2A9D4CCA8DA38D2C7A168DC7A96DDA3CA6D4CCA8DA42C6A172C4A92CCAADDA11D4CCA8DA46C2A10M2A3MA52MMA2M3A95CA10DDMAMA3M55A2M3A105D2AM2A3M55A2M3A103D2ADDM2A62DCDEA101D2A2DDM2A62DCDEA99D2A2D2CD2A62DCDEA97D2A2D3CCD2A62DCDEA95D2A2D3C3A65DCDEA95DADAD3C3ACDA64D2EA95D5C3ACCA166D3C3AACA21M19A126DDC3ACCA170C3ACCA172CCACCA175CCA176CA12M48A394K4A258MMA60M2A112CMMA58M4A110C2MMA56M5A109C4D58A2M2A107C5BD56A3M2A106C5B2D55A4MMA105C5B4D53A3EEMMA106C3B4A58EEDMA107CCB4A61DMA108B4A62DDA109B2A64DA33KAKKA72BA65DA34K3A175K2A175K3A175K2A1832K2A355K3A110"

Tunnel2_Shine_08 =
	"A33D3A15D4ADA2M3AAMMA6MMAMMA4MMA6MMA3MMA7MMA3MAMAMAMMA74D4ACCA11D4A3CA142D4AACA11D4A147D3A24BBA141D3A2CA12D4A2CA142D3A2CA12D4A2CA81M29A16M5DA5M15AM11AM4DMMDM3DDMMDM3D2M5DM14DM4D3M5DM3D4M2DMDM3A44D4CCA4D4A41CD67CDA41D4CCA5D3CCA42D5C61DCDDA38D3CCA6D3CA43DDCD4A61DCDEA36D3CCA6D3CA43DDC2D3A62DCDEA96DDC4D3A62DCDEA94DDC7D2A62DCDEA37M11D2M2A36DDC9D2A91CM3A3D4CCA8DDA38DDC8A163C8A95D2A5D4CCA8DDA42C6A16M48A101C4A8M2A3MA52MMA2M3A13CCAD2A5D4CCA8DDA46C2A8DDM2A3MA52MMA2M3A90CA8D3MAMA3M55A2M3A98D4AM2A3E55A2DCDEA96D4ADDM2A62DCDEA94D4A2D4A62DCDEA92D4A2DDCCD2A62DCDEA90D4A2DDC3D2A62DCDEA90D2A2DDC5A65DCDEA90DADADDC5ACDA64D2EA90D3C5ACCA5M13A20M13A106DDC5AACA21M19A121C5ACCA165C3ACCA167CCACCA170CCA171CA440K2A18KKA60MMA62M2A105CMMA60M3A104C2MMA58M5A102C4DDA56DDE2MMA101C5BD58A2EMMA100C5B2D56AAEA2MA99C5B4D54A6MA100C3B6D53A6MA101CCB6A58EA105B6A167B4A169B2A95KA20KA52BA96KKA18K2A150KA19K2A149KKA18K2A150KA19K2A1759K2A346K2A112"

Tunnel2_Shine_09 =
	"A33D3A9M3DMDDA2DADA2M3A29MA15MA3MA4MMA74D4ACCA9D4A6CA142D4AACA9D4A150D3A22BBA144D3A2CA10D4A2CA145D3A2CA10D4A2CA84MMA4MMA6MAMMA3MAM3A16M5DA5M15AM11AM4ADMADA3DDAMA3MDA7DMMA6MMAMAMDMA2MD3MA3MDMAMAD4MA6MA45D4CCA4D4A42CDDAADA62CDA41D4CCA5D3CCA43D4A62DCDDA38D3CCA6D3CA44DACD4A61DCDEA36D3CCA6D3CA44DAACCD3A62DCDEA97DAAC3D3A62DCDEA95DAAC6D2A62DCDEA37M11D2M3A36DA2C7D2A91CM3A3D4CCA8D2A38DAAC7A165C7A4M2A6M48A30D3A5D4CCA8D2A42C6A5DM2A3MAAM48AAMMA2M3A91C4A5D2M2A3MA52MMA2M3A13CCD3A5D4CCA8D2A46C2A5D4M2A3MA52MMA2M3A91CA5D6MAMA163D7AM2A6E16A2E32A2DCDEA94D7AADA65DCDEA92D7A70DCDEA91D6A5CD2A62DCDEA91D4A5C2D2A62DCDEA91D2A5C4A65DCDEA91DA5C4ACDA4M49A9M3A96C4ACCA5M13A20M13A110C4AACA21M19A123C4ACCA166C3ACCA168CCACCA171CCA172CA352MMA107KKAAKA60MMA62M3A105CMMA60M4A104C2DDA61M2A103C3ADDA56DDE2MMA102C3AABD58A2EAMA101C3A2BBD56AAEA2MA100C3A2B3D54A109CCA2B5D53A113B5A58EA107B5A168B4A170B2A114KAAKA53BA116KAKKA170KKAKA171KAKKA170K3A1595KA174KA171KA174K2A115"

Tunnel2_Shine_10 =
	"A33D3A9M3DMDDA2DA2DA2MAMMA135D3ACCA9D4A6CA8DDA134D3AACA9D4A16DDA134D2A22BBA10DDA134D2A2CA10D4A2CA11DDA134D2A2CA10D4A2CA11DDA115DA2M5DA5M15AM11AAMA53D3A68D6CCA4D4A113CDA40D5CCA5D3CCA113DCDDA38D3CCA6D3CA48CD4A61DCDEA37D2CCA6D3CA49CCD3A62DCDEA102C3D3A62DCDEA100C6D2A62DCDEA37M11D2M5A40C5DDM2A62M2A25CM3A3D4CCA8D4A41C6D3M2A6M48GA5M2A95C6D5M2A3MAAM48AAMMA2M2A20D2A6D4CCA8D4A42C5D7M2A3MAAM48AAMMA2M3A93C3D8AAMMA3MA52MMA20CCD2A6D4CCA8D4A46CCD8A9MA52MMA100D8A168D6A16E16A2E32A2DCDEA93D4A74DCDEA93D2A76DCDEA93DA11CD2A62DCDEA104C2D2A62M3A102C2DDA4M52A7M3A100C2DDACDA4M49A9M2A99C2DDACCA5M13A20M13A112C2DDAACA21M19A125C2DDACCA168CCDDACCA170DDACCA173CCA174CA356MMA107K4A62MMA62M3A107CA62M4A106CCADDA61M2A105C2AADDA56DDE2MMA104C2A2BD58A2EAMA103C2A3BBD56AAEA2MA102C2A3B3D54A111CA3B5D53A115B5A58EA109B5A170B4A172B2A114KAKKA55BA116K2A173K3A173K2A173K3A1790KA24KA150KA175KA24KKA91"

Tunnel2_Ship =
	"A35D98EA95C33BC63DDEA93C33BC6B56CCDDEA91C5B28C6BP56BCCDDEA89C5BC34BPO56PBCCDDEA87C5BC105BC29A32CD61CCD67EBCD27EA30C65D5C61DEBC28EA28C25B38C2D66CDEB28CEA27C23BP33OOB3C3D3P61DCDEBP26BCEA26C22BP2ON28O2B3C5D2C62DCDEO25PPBCEA24B21CBP2O2P26O2B3C7D2CB61DCDEOPO3PO3PO3PO3PPO2PPBCEA24B6PB13P2O2P27OOCB2C9D2BP60BDCDEO25PPBCEA23BC22B5P25OPPCBC11D2BPH58PBDCDEO17P3C7B5A14C23B2N5B2P22OPBPC13D2BPGGFHGF48GHFFGPBDCDEP19B4CB2O5B2A10B24O2PD2E2NNBON15OP3OPBBPC13D2BPGGFHGF48GHFFGPBDCDEON13P2C4OBO2PD3EEOOBA8C23BOOPDCCD2E2DNNO11POPOOP3OPB2PC13D2BPGGFHGF48GHFFGPBDCDEO12P2B4CBOOPDCCD2E2DOBA6B24OOPCCDC5EDENBO10POPOOP3OPB3PC13D2BPGGFHG50HFFGPBDCDEO10P2C5BOOPCCDC5EDEOBA4C23BOOPC11EDNBO9POPOOP3OPB4PC13D2BPGGFH52FFGPBDCDEO8P2B6OOPC11EDOBA2B24OOPCCBC10DDNBO8POPOOP3OPB5PC13DBDBPGGF55GPBDCDEOOP8B5OOPCCBC10DDOBAAB24OPCCBC12DDBP7OPOPOP4OPB6PC12BD2BPGGE55GPBDCDEOPO4P2B5OPCCBC12DDBAAB24OPCBC14DBO6POPOP6OPB7PC10BCCD2BPG58PBDCDEP7B6OPCBC14DBAPPC13P3B4OPBCBC14DDBP6OPOP6OPB8PC8B2CCD2BP59BBDCDEO2P3B5OPBCBC14DDBP12B3P3B3OPBBC16DBO4PPOP10B9PC6B2C3D2BG57PPBBDCDEP5B5OPBBC16DBP12BP7B2OPBBC16DBP6OP8OPB10PC4B2C5D2BGF54GGB3DCDEP4B5OPBBC16DBP12BP7B2OPBBC16DBO3P14B11PC2B2C7D2BGF52G2PB3DCDEP3B5OPBBC16DBP12BP7B2OPBBC16DBP16OPB12CCBCBC9DBBHGF15E19F14G3BPB3D2P3B5OPBBC16DBP12BP7B2OPBBC6BBC7DBP18B12CBC11DBBGHHGF14G19F13G2HGPBPB3CCP4B4OPBBC6BBC7DBJ16P3B4OPBBC5BBC7BP17OPB12CBPC9DB2GH2G14F19G15HHGPPBPB2CCOOP2B5OPBBC5BBC7BAAP18B5OPB2C4BBC4BCDBP19B12CBBPC7DB2PGH16G21H16GP2BPBBCCOOP2B5OPB2C4BBC4BCDBAAB24OOPB2C3BBC3BCCOBO14POP2B12CB2PC5DB2PPGH2G13H21G13H2GP4BBCCOOP3B4OOPB2C3BBC3BCCOBA2B24OOPB3C6BCCOBO3P16B12CB3PC3DB2P2GHHG51HHGP4BBCCP6B4OOPB3C6BCCOBA4BBJBJBJBJBJBJBJBJBJBJBJBBOOPB9CCOBO3P17B12CB4PCCDB2P3GHGGP49GGHGP4BBCCO2P4J4OOPBBJBJ4BCCOBA6JBJBJBJBJBJBJBJBJBJBJBJBBOOPB9OBP22BP13B4PCB2P4HGGPON48PGGHP5BP10B2JBOOPJBJ4B2OBA8J22BBO2PB5OOBP24B22PCBP2GGPO51PGGPPB3P4J10BBO2B6OOBA10JJBJBJBJBJBJBJBJBJBJBJJB3O5B2P26B21C2BPPGPO4P46OOPGPB3P5J12B3O4B2A12J24B6P18OP10B19CBBCCBPBO4P48OOB3E3P2J22A24P2I16POPO19P11B17CB3CCPBBO2POP46OPB3E4P2A47P2I16POP19OP26BBCB5CCPBBOPO50PBBDE4PPA48P2I16POP13OOPOPPOP27CB7CCPB55DDE3DPPA49PPI16PPOP18OP26B10C56DDE4DPA50P17BPPOP18OP27B10CD56E3DDPA49B19PBBCP17OP24JJPPB10CD54E4DDA49JJBJBJBJBJBJBJBJBJBJB3CP17OP24JJP2B10CD53E3D2A50BJBJBJBJBJBJBJBJBJBJB3CP16OP24J2P2B9C57ED2A50J19BJ2CP16OP24J3P2B7POP53ONCCD2A51BJBJBJBJBJBJBJBJBJBJBJ2CP16O23PJ4P2B5P2OON54CCDDA51J19BJ2CP41J5P2B3P3O54NNOCDDA52J19BJ2C40PJ6P2BBPOP2OOPO48POON2OCDA52J19BJ2B40PJ7P5OPPOOPO48POONNOPACA53J19BJ2B38P16OPOOP27OP11OP8OONOPA56J19BJ2B37PJ11P5O55PPA58J58BP76A96JPJP21I7PI3P35A122JIPJI28PI3P34A124JPJIIJI24PI3P35A124JIPJI26PI3PPOP31A126JPJI25PI3P2OOPOPO21POP3A126JIPJI24PI3PPO2POPO21POP2A128JPJI12P11I3P2OOPOPO21POPOPPA128JIPJIJI8PI10PI3PPO2POPO21POPOPA130JPJI9PI10PI3P2OOPO25POPPA130JIPJ23I2PPO2P26OOPA132JP9I11PI3P2O30PPA132J27P34A71"

function loadTunnel2Sprites()
	loadExtendedSprite(unpac_noheader(Tunnel2_Engine), "Tunnel2_Engine", 38, 37, 0)
	loadExtendedSprite(unpac_noheader(Tunnel2_Shine_01), "Tunnel2_Shine_01", 179, 65, 0) --1
	loadExtendedSprite(unpac_noheader(Tunnel2_Shine_02), "Tunnel2_Shine_02", 180, 65, 0) --2
	loadExtendedSprite(unpac_noheader(Tunnel2_Shine_03), "Tunnel2_Shine_03", 180, 65, 0) --2
	loadExtendedSprite(unpac_noheader(Tunnel2_Shine_04), "Tunnel2_Shine_04", 177, 65, 0) --5
	loadExtendedSprite(unpac_noheader(Tunnel2_Shine_05), "Tunnel2_Shine_05", 177, 65, 0) --5
	loadExtendedSprite(unpac_noheader(Tunnel2_Shine_06), "Tunnel2_Shine_06", 177, 65, 0) --5
	loadExtendedSprite(unpac_noheader(Tunnel2_Shine_07), "Tunnel2_Shine_07", 179, 65, 0) --3
	loadExtendedSprite(unpac_noheader(Tunnel2_Shine_08), "Tunnel2_Shine_08", 174, 65, 0) --8
	loadExtendedSprite(unpac_noheader(Tunnel2_Shine_09), "Tunnel2_Shine_09", 175, 65, 0) --7
	loadExtendedSprite(unpac_noheader(Tunnel2_Shine_10), "Tunnel2_Shine_10", 177, 65, 0) --5
	loadExtendedSprite(unpac_noheader(Tunnel2_Ship), "Tunnel2_Ship", 197, 65, 0)
end

-- End Scene

End_Moon =
	"F13P5F23P13F17PPAPAPAP10F14PPAPAPAP4OPOPOP2F12PPA2P6OPOPOPOPOPF10PPAPAPAPAAOPOPOPOPOPOPOPF8PA3P2A3PPO2POPOPOPOPF6PPAPAPAPPA3P2OPO4POP2F4PPAAPAPAP2AAO2PO7POPOPF3PA2PAAP2O7POPOPOPO2PPF2PA3PAAP2O8PO2PO2POPPFFPPAPA4P2O3POONNPOPOPOPOP2FFPAAPA5OPPOOPNO3NO7PPFFPPA7P4NO5NOOPOPO2PFPPA2PA3OOPPO9NNO5P4A5POPOOPOPO2POON3OPO2P3AAPAP3OOPOPO7N3O4P4AAPAPOPOPOPPNO7NNPOPOPOP2A2P2AAOPOPOPO7NO6P5A6O2PO7NOPOPO2POPPFPAAPPA3P2O6NNO8PPFFPPA5POPOPO3NOONPOPO2POPOPFFPA3PA2P2OPO2N2O9PPFFPPAPA5POPO4NNOPOPOPOPOP2F2PA8P2OPO13PF3PPA7OPOPOOPO2POPOPOPOPPF4PPA6POPOPO12PF6PPA4PPAOPPOPOPOPOPOPOPPF8PPA5PPAPPOPOPOPOPOPPF10PPA6PPOPOPOPOPOPPF12PPA5POPOPOPOPOPPF14P2A4P2OP5F17P13F23P5F13"

End_Moon_Lights = "AAEA14EA47EA23EA22EA46EA46EA21EEDEA19EMDDA18EEMMDA19EEDEA18EAEEAEA17EA30EA12EA30EA24EA20"

End_Planet =
	"E106IIJ4K8E148I5J13K13E133I3EIAIAIAJAJAJAJ12H5JJK7E122I11AIJ5AJ9K6HJ2G3J2K6E114I3AI2AIAIAIAIAJAJAJAJAJAJAJ9H3GH2G3JJK8E107I19J22H2GHGHGHG3JJH5K5E100I8AIAIAIAIAIAIAIAJAJAJAJAJAJAJAJ6H14GHG4KGK3F2E94I20AIAIAJAJAJ2AJ2AJ8HJHJH2GH6GHGHGHG8F4E89I9AIA2IA2IAIAIA2IA2JA2JAJAJAJ2AJ2H12G6HGHGHHG7F3E84I11AIAIAIAIAIAIAIAIAIAIAJAJAJAJAJAJ4AJAJAJHJHGH12GHGHGHGHG6F5E79I5A23IA6JA6JAJAJAHAHAHAHAHAH8G19F4E75I5AIAIAIA4IA8IAIAIAIAIAJAJAJAJAJAJAJAJAJAJAHAHAHAH13GHGHGHGHGHG5F6E71I5AAIA22IA2IA2HA2JA2JA2JAJAJAHAHAHAHAHAHAH9GH6GH2G6F4E67I7AIA22IAIAIAIAHAHAHAHAHAHAHAHAH2AH2AH2AH2AH7GHGHGHGHGHGHGHG7F4E63I6A54HAHAHAHAHAHAHAH17G2H2G6F4E59I8A29IA2IAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAH2AH7GHGHGH2G15F4E56I6A43HA6HA2HA2HAHAHAHAHAHAHAHAH23G6F3E53I5A33IA2IAIAHA2HAHAHAHAHAHAHAHAHAHAHAHAH2AH2AH2AGHGHGHGHGHGHGHGHGHG11FFE51I6A61HA2HA2HAHAHAHAHAHAHAH15GGH3GHG5FE50I5AAIA35IA2IA2IA2HAIAHAHAHAHAHAHAHAHAHAHAHAHAH2AHAGAGHGHGHGHGHGHGHGHGHGHGHGHG4FE48I5AIAIA51IA2HA2HA2HA2HA2HA2HAHAHAHAHAHAH18G7E47I5A39IAIAIA2IAIAIAIAIAIAHAHAHAHAHAHAHAHAHAHAHAHAH2AGHGAGHGAGHGHGHGHGHGHGHGHGHGHG3E46I3AIAIA69HA6HA4HAHAHAHAHAHAH20GGE44I4AIA39PA2IA2IA2IA2IA2IAIAIAHAHAHAHAHAHAHAHAHAHAHAGHHAGAGAGHHAGHGHGH2GHGHGH2GHGHGHE43I4AIA63IA6HA2HA2HA2HA2HAHAHAHAHAHAHAH20E42I4AIA2IA35PAPAPA2IAIAIA2IAIAIAIAIAIAIAHAHAHAHAHAHAHAHAHAHAGAGHGAGHGAGHGAGHGHGHGHGHGHGHGHGHGHE40I5AIAAI2A82HA4HAHAHAHAHAHAHAH16E39I5A2I3A34PA2PA2PA2IA2IA2IAIAIAIAIAIAHAHAHAHAHAHAHAHAHAHAHAHAGHGAGAGAGAGAGAGAGHGHGHGHGHGHGHE38I5A2I2A63IA2IA2HA2HA6HA2HA2HAHAHAHAHAHAHAHAHAH12E37I3A4I2A43PAPAPA2IAIAIA2IAIAIAIAIAHAHAHAHAHAHAHAHAHAHAHAHAHAHHGAGHGAGHGAGHGAGHGHGHGHGHGHE36I3AIA2I2A99HAHAHAHAHAHAHAHAH8E35I3AIA2I2A47PA2PA2IA2IA2HA2HAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAGAHHGHGHGHE34I3AIA2I2A67HA26HA2HA2HAHAHAHAHAHAHAHAH6E33I3AIAAI3A51PAPAIA2HAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAH2AHAHAHAHAGAGHGHGHE32I3AIAAI3A107HAHAHAHAHAHAHAHAH4E31I3AIA2IIA56PA2HA2HAHAHA2HAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAGAGAHHGHE30I3A4IIA108HA2HAHAHAHAHAHAHAHAH2E29I3AIA2IIA60HAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAH2AHAHAGHGAGAGHE28I3A4IIA116HAHAHAHAHAHAHAHAHE27I3AIA2IIA64HA2HA2HA2HA2HA2HA2HAHAHA2HAHAHA2HAHAHA2HAHAHAHAHAHAHAHAGAHAGAE26I3AIA2IIA116HA2HAHAHAHAHAHAHAHE25I3AIA2IIA68HAHAHA2HAHAHA2HAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAGAGAGAE24I3AIA2IIA124HAHAHAHAHAHAHE24I2AIA2IIA68HA2HA2HA2HA2HA2HA2HA2HAHAHAHAHAHAHA2HAHAHAHAHAHAHAHAHAHAGAHAGAE23I2AIA3IA124HA2HAHAHAHAHAHE22I2AIA3IA72HA2HAHAHA2HAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAH2AGAGAE21I2AIA3IA132HAHAHAHAHE21IIAIA3IIA75HA2HA2HA2HA2HA2HA2HA2HA2HA2HAHAHA2HAHAHA2HAHAHAHAHAHAGAE20IIAIA137HA2HAHAHAHE19IIAIA85HA2HAHAHA2HA2HA2HA2HA2HAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAE18IIAIA141HA2HAHAHE18IAIAIA87HA2HA2HA2HA2HA2HA2HA2HAHAHA2HAHAHA2HAHAHAHAHAHAHAHAHAE17I2AIA139HA2HAHAHAHE16I2AIA87HA2IA2IAHAHA2HA2HA2HA2HA2HAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAE16IIAIA143HA2HAHAHE15IIAIA95IA2HA2HA2HA2HA2HA2IA2HA2HA2HA2HA2HA2HAHAHAHAHAE15IAIA147HA2HAHE14IAIAIA93IA2IA2HA2HA2IA2HA2IA2IA2IAHAHAIAHAHAHAHAHAHAHAHAHAHAE13I2AAIA148HA2HE13IIAIA105IA2IA2IA2IA2IA2IA2IAIAIA2IAIAIA2IAIAHAHAHAE12I2A152IAIAAE12I2A97IA2IA2IA2IA2IA2IA2IA2IA2IA2IAIAIAIAIAIAIAIAIAIAIAHAE11I3A156HE11I2A116IA6IA6IA2IA2IA2IA2IA2IA2IAE10I2A159E10I2AIA105IA6IA2IA2IA2IA2IA2IAIAIAIAIAIAIAIAIAIAIAIAE9I2A160E9IIAIA117IA2IA2IA2IA2IA2IA2IAIAIA2IAIAIA2IAE8I2A161E8I2A109IA2IA2IA2IA2IA2IA2IA2IA2IAIAIAIAIAIAIAIAIAIAE7I2A162E7I2A128IA6IA2IA2IA2IA2IA2IA2IAE7IIA163E6IIAAIA117IA2IA2IA2IA2IA2IA2IAIAIAIAIAIAIAIAIAIAE6IIAAIA161E5IIAIA125IA2IA2IA2IA2IA2IAIAIA2IAIAIA2IAE5IIA165E5IIAIA115IA2IA2IA2IA2IA2IA2IA2IA2IAIAIAIAIAIAIAIAE4IIA166E4IIAAIA129IA6IA2IA2IA2IA2IA2IA2IAE4IIA166E3IIAIAIA119IA2IA2IA2IA2IA2IA2IA2IAIAIAIAIAIAIAIAE3IIA167E3IIA129IA2IA2IA2IA2IA2IA2IA2IAIAIA2IAE3IA168E2I2AIA117IA2IA2IA2IA2IA2IA2IAIAIA2IAIAIAIAIAIAIAIAE2IIAAIA165E2IAIA133IA2IA2IA2IA2IA2IAIAIA2IAIAIAEEIIA169EEIIAIAIA121IA2IA2IA2IA2IA2IA2IA2IAIAIAIAIAIAIAIAEEIIA169EEIAAIA121IA6IA2IA2IA2IA2IA2IA2IAIAIAIAIAIAIAEEIIA162IA2IAAEI2AIA123IA2IAIAIA2IAIAIA2IAIAIA2IAIAIAIAIAIAIAIAEIAIA168IEI2AIA133IA2IA2IA2IA2IA2IAIAIAIAIAIAIAEIA160IA2IA2IAAEIIA126IA2IA2IA2IA2IA2IA2IAIAIAIAIAIAIAIAIAIAEIA166IA2I4A139IA2IA2IA2IA2IAIAIAIAIAIAIAIIA160IA2IA2IAAI2A126IA2IA2IA2IA2IA2IAIAIAIAIAIAIAIAIAIAIAIA0"

End_Planet_Lights =
	"A106DADADADA160DADADA136DA24DADADA162DA2DA164DADA146DA168DA20DA146DA170DA18DADA148DA18DA148DA16DADA150DA170DAADDA10EEAAEEA2EA3EA42EAEAEAEAEAEA88DDA12E2A3EA5EA37EAEA100DDA9EEA8EA41EA100DA2DA8E2A10EA142DAADDA7E2DADA50EA98DA3DDA6E3DA52EA98DA3DDA4EAE3DA52EA98DA3DDA6E4A30EA2EA2EA2EA108DA3DA5EAEEDADA14EA6EAEAEAEA22EA98DA3DDA5EEA19EEAEA2EA26EA100DA3DDADDA3EADA52EAEA103DDADDEA8EA15EA31EAEA98DA3DDADDEA9EA49EA98DA3D3AEA60EA98DA3D3AEA10DA14EA32EA104DDA13DEA47EA98DA4DDAAEA8DADA14EAEA30EA102D3A13DA48EA62EAEAEA30DAAD3A2EA6DA5EA11EAEA30EA64EAEA33DDEA65EA66EAEA28DADDAEA3EA2DA22EAEAEA28E2A66EA30DDAEA3EADA60EA68EA26D3AEA3EADA24EAEAEA28EAEA98DAAEA5DA65EA92DDAAEA5DA24EAEAEAEA26EA3EAAEAEA62EA25DDA2EA4DA15EA11EA3EA25EEA95DDA3EA4DA16EA8EAEA6EA20DE2A71EA23DA3EA4DA17EA9EA7EA17DDEEMA98DA2EA4DADA15EEA6EAEA9EEA13D2EMMA14EA58EA22DA2EA5EDA16EA6EAEA11EEA10E4A100DA2EEA3EEDA17EA5EAEA12EA8EA26EA56EA20DA2EEAEAAEEDA18EA4EAEA13E4A3EA84EA20DDAAEEA2EEMMA24EAEA15EDDAEEA34EA51EA19DDAAEEA3EEMAEA24EA12E3DEDA12EA24EA50EA18D2AAEEA3EEMAAEAEA14EA2EAEAEA6EEA5DADA40EA48EA19DDAAEA13EA2EA14EAEA4E3A5DA94EA18DA2EA4EA14EAEAEAEA4EAEA2E2A8DDA49EA2EAEAEAEAEAEAEA26EA20DAEA28EA2EAEAAE2A30EA31EA40EA18DADAEEA28EEAEAEAE2A12DA52EA28EA4EAEAEAEA18DAAEA31E4A70EA36EAEA18DAAEA5EA16EA6EME2A14DA56EA34EAEAEA16DA2EA30EEMEEA74EA34DAEAEA14DADAEA4EA25EMEEA16DA96EAEA16EA32EMEA39EEA74DA14DAE2A20EA8E2AEA14DA22EEDA34EA36D2A15EMA30E3A41EA74DADA10DAAEEA20EA8EAEAEAEAEA10DA25EDA34EAEA36DA11DDAEMAAIA28EEA43EADA74DA8DAADEEA2IEA14EA10E2A2EAEAEAEAEA2DA27EDA36EA48DADEEAIA28EEA45EADA84DAAEEA30E2A14EA29EDA38EA48EMA29E2A47EDA84DAEEMIAAEA12EA10EAEA14EAEAEA2EA2EA2EA2EA2EA8EADA36EA47EEA30EA49EDA82DAAEEA30EAEA20EA18EA6EDDA84EEA3EA25EA50EDA34DA46DA2EA2EA24EAEAEA20EA20EA2EAEEDA32DA50EA30EA52EA30DADA46DA2EA4EA20DADAEA24EAEA20E4MMEEA26DA76DA2DADADEEA41PA7EM2EEA81EA12EA2DADADADADADAEAEEA25EAEA20EAEAEA2EA20DADA86EEA58EAE3A14DA58EA2EA24EEA5DA14EA6EA26EA7EEA3EEA2EA60EA29EEA64EA68DA2EA10EA16E2A4DA26EA22EA7EEA102EEA17EA46EA72EA8EA18E2DA12EA19EA30EA101EEDA65EA70DAEA2EA23EEDA8EA5EA20EA14EA82DDEA28EDE2A2EA60EA68DDEA4EA2EA18E2ME3A11EA22EA95DAAEA3EA22EMMEEA133DDAAEA3EEAEA20EEDEEA14EA32E2A81DDA6EA23EDA50EA16EA66DA2EA2E2A22DA18EA32EAEEA79DA2EA3E2DEA19EADA54EA80DAE2A2EEMEDA19EDA18EA24EA2EA7EA77DA2EA3EEMDA19EDA58EA78DAAEEAAE3DDA18EADA18EA26EA10EA10EA64DA2EAEAEAEADADA17EA44EA13EAEA76DAE5AEAADDA16EDA20EA22EAEA12EAEA74DA2EAE2A2EADA16EA20EA22EA16EAEA74DAE2A6EAEA15EA43EA18EAEA72DA2EAEA8EA58EA20EAEA71"

End_Sat_01 = "CCA8PCCA8PCCA8PCCA8PNNA8PNNA5EAAPA6IOI2A6IOI2A6IOI2AEA4IOI2A0"

End_Sat_02 =
	"A4C2PA10C2PA10C2PA10C2PA10C2PA10N2PA11PPA6EA4OPA5EAIOIIOI2OIIOIAAIOIIOI2OIIOIAAIOIIOI2OIIOIAAIOIIOI2OIIOIA6OPA12OPA11EOA7"

End_Sat_03 = "PC2NPA4C2NNPA4P6EAAEAP4A4"

End_LogoLines =
	"A113JA62KA173JA62KA173JA62KA173JA62KA173JA62KA173JA62KA173JA62KA173JA62KA173JA62KA173JA62KA173JA62KA173JA62KA173JA62KA173JA62KA173JA62KA173JA62KA173JA62KA141MA30JA62KA173JA62KA173JA62KA144MA27JAK62A80KA91JAKA144KA89JAKA146KA61MA24JAKA148KA60MA23JAKA150KA59MA22JAKA152KA58MA21JAKA154KA57MA20JAKA156KA56MA19JAKA150KA6KA55MA18JAKA152KA6KA54MA17JAKA154KA6KA53MA16JAKA156KA6KA52MA15JAJA158KA6KA51MA14JAKA160KA6KA50MA13JAJA162KA6KA49MA12JAJA164KA6KA48MA11JAJA166KA6KA47MA10JAJA168KA6KA46MA9JAJA170KA6KA45MA8JAJA172KA6KA44MA7JAMA174KA6KA43MA8MA176KA6KA42MA187KA6KA41MA188KA6KA23JA15MA189KA6KA231KA6KA231KA6KKJKJ18A209KA6KJKJ6A222KA239KA239KA239KJKJJKJ13A687J32A205JA237JA237JA237JA237JA237JA237JA237JA237JA237JA237JA324J7KJKJK9A218J6KJK12A217J6KJKJK12A214J7KJK143A85J7KJKJK141A85J3A78KA18K50A86J95A239JA139JJA96JJA239JA239JA117KA120JA116KA121JA115MA122JA114MA123JA113MA124JA105KAAJA2MA125JA104KAAJA2MA126JA103KAAJA2MA127JA102KAAJA2MA128JA101KAAJA2MA129JA100KAAJA2MA130JA99KAAJA2MA131JA98KAAJA2MA132JA97KAAJA2MA133JA96KAAJA2MA134JA95KAAJA2MA135JA69K24A2JA2MA136JA67KA27JA2KA137JA65KA28JA2KA138JA63KA29JA2KA139JA61KA7J23A144JA59KA7JA169JA57KA7JA27KA142JA55KA7JA173JA53KA7JA175JA51KA7JA177JA49KA7JA31KA146JA47KA7JA181JA45KA7JA183JA43KA7JA185JA41KA7JA187JA39KA7JA189JA37KA7JA191JA35KA7JA193JA33KA7JA195JA31KA7JA197JA29KA7JA199JA27KA7JA201JA25KA7JA203JA23KA7JA205JA21KA7JA207JA19KA7JA209JA17KA7JA211JA16KA6JA213JA15KA5JA215JA14KA4JA217JA13KA2JJA219JA12KA2JA221JA11KA2JA222JA10KA2JA4JA217JA9KA2JA4JJA217JA8KA2JA4JAJA217JA7KA2JA4JAAJA217JA6KA2JA4JA2JA224KA2JA4JA3JA223KA2JA4JA4JA222KA2JA4JA4JA222KA2JA4JA4JA215"

End_ORing2 =
	"A20J6A37J6AJ6A30J9AJ9A25J11AJ11A22J12AJ12A20J10A6J10A17J9A12J9A14J7A18J7A12J7A20J7A11J5A24J5A10J5A26J5A8J5A28J5A6J5A14JA14J5A5J5A14JA14J5A4J5A15JA15J5A3J4A16JA16J4A3J4A16JA16J4A2J5A16JA16J5AAJ4A17JA17J4AAJ4A17JA17J4AAJ4A17JA17J4AJ4A38J9A38J9A38J9A38J9A38J9A38J9A38J4AJ4A36J4AAJ4A36J4AAJ4A36J4AAJ5A34J5A2J4A34J4A3J4A34J4A3J5A32J5A4J5A30J5A5J5A30J5A6J5A28J5A8J5A26J5A10J5A24J5A11J7A20J7A12J7A8JA8J7A14J9A5JA5J9A17J10A2JA2J10A20J26A22J11AJ11A25J9AJ9A30J6AJ6A37J6A20"

End_Title =
	"A4M6A28KM3A7KM3AAKM15A4KM2A10JM4A3JM3A7JM3A3JM14AAJM9A10M8KA27KM4A6KM3AAKM15A4KM3A9KM4A3JM4A6JM3A3JM14AAJM12A6M11KA25KM4A6KM3AAKM15A3KM4A9JM4A3JM4A6JM3A3JM14AAJM13A4M12KA25KM4A6KM3AAKM15A3KM4A9JM4A3JM4A6JM3A3JM14AAJM14A3M13KA24KM5A5KM3AAKM15A3KM4A9KM4A3JM5A5JM3A3JM14AAJM14A2M14KA24KM5A5KM3A6KKM3A9KM5A8JM4A3JM5A5JM3A3JM4A11JM4AAJJM6AAM4KA3M4KA24KM5IA4KM3A7KM3A8KM6A8JM4A3JM6A4JM3A3JM4A11JM4A4JM4AAM4KA4M4KA23KM6A4KM3A7KM3A8KM6A8KM4A3JM6A4JM3A3JM4A11JM4A5JM3AAM4KA4M4KA23KM6A4KM3A7KM3A8KM6A8JM4A3JM6A4JM3A3JM4A11JM4A5JM4AM3KA5M4KA23KM7A3KM3A7KM3A8KM7A7JM4A3JM7A3JM3A3JM4A11JM4A5JM4AM3KA5M4KA23KM7A3KM3A7KM3A8KM7A7KM4A3JM7A3JM3A3JM4A11JM4A5JM4AM3KA35KM7A3KM3A7KM3A7KM8A7JM4A3KM7A3JM3A3JM4A11JM4A5JM4AM3KA35KM8A2KM3A7KM3A7KM8A7JM4A3JM8A2JM3A3JM4A11JM4A5JM4AM3KA35KM8A2KM3A7KM3A7KM8A7KM4A3JM8A2JM3A3JM4A11JM4A5JM4AM3KA35KM8A2KM3A7KM3A7M10A6JM4A3JM8A2KM3A3JM4A11JM4A5JM3AAM3KA35KM9AAKM3A7KM3A6KM4AKM3A6KM4A3JM9AAJM3A3JM12A3JM4A4JM4AAM3KA35KM9AAKM3A7KM3A6KM4AKM3A6KM4A3JM9AAJM3A3JM13A2JM15AAM3KA35KM9AAKM3A7KM3A6KM4AKM3A6KM4A3JM9AAJM3A3JM13A2JM14A2M3KA35KM4AKM3AKM3A7KM3A6KM4AKM4A5KM4A3JM4AJM3AJM3A3JM13A2JM13A3M3KA35KM4AKM3AKM3A7KM3A6KM3A2KM3A5JM4A3JM4AJM3AJM3A3JM13A2JM12A4M3KA35KM4AKM4KM3A7KM3A5KM4A2KM3A5JM4A3KM4AJM9A3JM12A3JM12A4M3KA35KM4AAKM3KM3A7KM3A5KM4A2KM3A5KM4A3JM4AAJM8A3JM4A11JM4A2JM3A4M3KA35KM4AAKM8A7KM3A5KM4A2KM3A5JM4A3JM4AAJM8A3JM4A11JM4A2JM3A4M3KA35KM4AAKM8A7KM3A5M14A4JM4A3JM4AAKM8A3JM4A11JM4A2JM4A3M3KA35KM4A2KM7A7KM3A4KM14A4KM4A3JM4A2JM7A3JM4A11JM4A2JM4A3M3KA35KM4A2KM7A7KM3A4KM14A4KM4A3JM4A2JM7A3JM4A11JM4A3JM3A3M3KA5M4KA23KM4A2KM7A7KM3A4KM14A4JM4A3JM4A2JM7A3JM4A11JM4A3JM4A2M3KA5M4KA23KM4A3KM6A7KM3A4KM15A3JM4A3JM4A3JM6A3JM4A11JM4A3JM4A2M4KA4M4KA23KM4A3KM6A7KM3A4M16A3JM4A3JM4A3JM6A3JM4A11JM4A4JM3A2M4KA4M4KA23KM4A4KM5A7KM3A3KM16A3JM4A3JM4A4JM5A3JM4A11JM4A4JM4AAM5KA2M4KA24KM4A4KM5A7KM3A3KM4A6KM3A3JM4A3JM4A4KM5A3JM4A11JM4A4JM4AAM14KA24KM4A4KM5A7KM3A3KM3A7KM3A3JM4A3JM4A4JM5A3JM14AAJM4A5JM3AAM13KA25KM4A5KM4A7KM3A3M4A7KM4A2KM4A3JM4A5JM4A3JM14AAJM4A5JM4A2M11KA25KM4A5KM4A7KM3A2KM4A7KM4A2JM4A3JM4A5JM4A3JM14AAJM4A5JM4A3M9KA26KM4A5KM4A7KM3A2KM4A8KM3A2JM4A3JM4A5JM4A3JM14AAJM4A6JM3A4M6KA28KI4A5KI4A7KI3A2KI4A8JI3A2JI4A3JI4A5JI4A3JI14AAJI4A6JI4A4I3KA156"

function loadEndSceneSprites()
	loadExtendedSprite(unpac_noheader(End_Moon), "End_Moon", 34, 34, 5)
	loadExtendedSprite(unpac_noheader(End_Moon_Lights), "End_Moon_Lights", 24, 20, 0)
	loadExtendedSprite(unpac_noheader(End_Planet), "End_Planet", 174, 102, 4)
	loadExtendedSprite(unpac_noheader(End_Planet_Lights), "End_Planet_Lights", 173, 96, 0)
	loadExtendedSprite(unpac_noheader(End_Sat_01), "End_Sat_01", 11, 11, 0)
	loadExtendedSprite(unpac_noheader(End_Sat_02), "End_Sat_02", 15, 15, 0)
	loadExtendedSprite(unpac_noheader(End_Sat_03), "End_Sat_03", 11, 4, 0)
	loadExtendedSprite(unpac_noheader(End_LogoLines), "End_LogoLines", 240, 136, 0)
	loadExtendedSprite(unpac_noheader(End_ORing2), "End_ORing2", 49, 49, 0)
	loadExtendedSprite(unpac_noheader(End_Title), "End_Title", 167, 37, 0)
end

-- HUD Scene

HUD_01 =
	"A11534G29A209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209G29A449G29A209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209GA27GA209G29A5171G46A192GA44GA192GA44GA192GA44GA192GA44GA192GA44GA192GA44GA192GA44GA192GA44GA192GA44GA192GA44GA192G46A1695"

HUD_02 =
	"A81GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA238GA78GA158GA78GA158GA78GA158GA78GA76G76AG8AG151A81GA78GA158GA78GA158GA78GA158GA78GA158GA238GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA238GA78GA158GA78GA158GA78GA158GA78GA76G76AG8AG151A81GA78GA158GA78GA158GA78GA158GA78GA158GA238GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA158GA78GA76"

HUD_Frame =
	"P2OPCBBP6BBCP7CBBP6BBCP17ONOPOOPO5PO7NPOONOP118BCB20PB11OPOPPCB10CPPOPOPOPCB10CPOPOPOPOPOPOPOPOPOONOPOOPO4PO7NPOONOPPO8PPO25PPO76PPBC20BPC6BC2BPOPOPCBBCBCBCBCBBCP2OP3CBBCBCBCBCBBCPPOP2OP6OPO2NOPOOPO3PO7NPOONOPPN9PPN25PPN20OON4O44P5BCB20PB2CNC2BCCBOPOPPCB2CBCBCB2CPPOPOPOPCB2CBCBCB2CPOPOPOPO11NOPOOPO2PO4P130BCB20PB3CNC2BCBPOPOPCBBCBCBCBCBBCPOP2OPPCBBCBCBCBCBBCPPOPO14NOPOOPOOPO4P129AP26B2CNC2BBOPOPPCBBC6BBCPPOPOPOPCBBC6BBCPO17NOPOOPOPO4P2O4PO83PO8P27AP27B2CNC2BPOPOPCBC8BCPOPOPOPPCBC8BCPOOP3O11NOPOOPPO4P2OOI3PI83PI5POOP27AP28B2CNCCBO3PCBCCD4CCBCPO5PCBCCD4CCBCPOOP3O11NOPOOPO3P4OOIP91OPOPOOP27AP29B2CNCBPOPOPC2D6C2POPOPOPPC2D6C2PO17NOPO6PI2POOIP91OPOPOOPA51P6BBCNCBOPOOPC12PO5PC12PO17NOPO6PJ2POOIP91OPOPOOPA52P6BCNCBPOPOPCCB8CCPO2POOPCCB8CCPO17NOPO6PI2POOIP91OPOPOOPA53P5BCB2O3PCCB8CCPO5PCCB8CCPO17NOPO6PJ2POOIP91OPPO2PA53P5BBP3O2PCB10CPO5PCB10CPOOP3O11NOPO5NPI2POOIP91OPO2PPA54P4BPCCBO3PCB10CPO5PCB10CPOOP3O11NOPO4NPPJ2POOIP92O2P2A55P4C2BO3PCB10CPO5PCB10CPO17NOPO3NPOPI2PO5PO84PNO3P3A56P2BCNCBN3P14N5P14N18OPN3POOP4ON3OPON38ONOON7O4NO2NO22PNO2P4A56P2BC2BP58OP4OONP4O5PO84PO2P4A57P2BCNCBO59PO4NOP11OP84OP5A59PPBC2BONNOOPGF7GGPON5OPGF8GPN19OPN4OP12OP84OP4A59P2BCNCBO4PG10PO7PG10PO20PO4P104A60P2BCNCBP58OP9A161P2BCNCBO11NPOONOON2P3O12P13OPOPOPOPPOPOP3A162P2BCNCBO10NPO4NONNOP35OP7A163P2BCNCBO9NPO3NOON2OP35OP6A164P2BCNCBO8NPO6NONNOPOP40A165P2BCNCBP9O5NOON2OPOPA205P2BCNCBO17NONNOPOPA205P2BCNCBN21OPOPA205P2BCNCBO17NONNOPOPA205P2BCNCBP21OPOPA205P2BCNCBOOP2O3P2O7P3OPA205P2BCNCBO20P2OPA205P2BCNCBP19OP4A205P2BCNCB7CPCBBCBP6OP2A206P2BCNCBBP6CBBCBP7OPPA207P2BCNCB5CPCBBCBP8OPA208P2BCNCB4CPC3BP10A209P2BCNCB3CPC3BP3A217P2BCNCB2CPC3BP3A218P2BCNCBBCPC2NCP3A219P2BCNCBBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BCNCBBCPC4P2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC4P2A220P2BCNCBBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC4P2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BCNCBBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BCNCBBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BC2BBCPC2NCP2A220P2BCNCBBCPC2NCP2A220P2BCNCBBCPC2NCP2A220P2BC2BBCPC4P2A220P2BC2BBCPC2NCP2A220P2BCNCBBCPC2NCP2A220P2BCCB2CPC2NCP2A220P2BCBCBBCPC4P2A220P2BBCCBBCPC2NCP2A220P2BCNCB2PC2NCP2A220P2BCNCB2PC2NCP2A220P2BCNCBBCPC2NCP2A220P2BCNCB2PC2NCP2A221PPBCNCB2PC4P2A220P2BCNCBBCPC2NCP2A220P2BCNCB2PC2NCP2A220P2BCNCB2PC2NBP2A220P2BCNCBBCPC4P2A220P2BCNCB2PC2NBP2A220P2BCNCB2PC2NCP2A220P2BC2BBCPCCB2P2A220P2BC2B2PCBCNCP2A220P2BCNCB2PCCB2P2A220P2BC2B2PCBCNCP2A220P2BC2B2PCCB2P3A219P2BC2B2PCB3P4A218P2BC2BP19A211P2BC2BO6P3O4NONNPA210P2BC2BO13NOON2OPA209P2BC2BO6P3O4NONNOPA209P2BC2BO13NOON2OPA209P2BCCBBO15NONNOPA209P2BCB2O8P40A181P2B4O7PO40PA180P2B4P7OON39OPA179P2B2PPO49NOPA178P2BBPNO6P42OONOPA178P2BPNO5PPI40PPOONOPA177P4NO4PPIO40IPPOONOPA176P2CPNO3PPIOP40OIPPOONOPA175P2CPNO3PIOP42OIPO2NOPA174P2CPNO3IOP44OIO3NOPA173P2CPNO3IOP44OIO4NOPA172P2CPNO3IOP44OIO5NOPA171P2CPNO3IOP44OIOP3OONOPA170P2CPNO3IOP44OIOPN2POONOPA169PPBCPNO3IOP44OIOPO2NPOONOPA167PPBCBPNO3IOP44OIOPO3NPOONOPA165PPBCBPONO3IOP44OIOPO4NPOONOPA163PPBCBPONO4IOP44OIOPO5NPOONOPA161PPBCBPONO6POP42OPOOPO6NPOONOP4AAP14AP25AP109AP5ONO8POP40OPO2PO7NPOON5PPN14APON22OPPON106PPN6O10POP38OPO3PO8NPO6PPOP2O10PPO24PPO2PPO102PPO64PO9NPO5PPO14PPO24PPO107PPO64PO10NPO4PPO14PPO24PPO107PPO11"

HUD2_Background =
	"A177PAP8APA58PA52PA58PA52PAP8APA205PA19PAP8APA58PA58PA106PAP8APA226PAP8APA58PA102PA62PAP8APA205PA19PAP8APA118PA106PAP8APA226PAP8APA118PA106PAP8APA89PA135PAP8AP49A123PA52PAP8A200PA26PAP7AAP31A87PA92PA12PAP6APAP31AAP15A177PAP5APPAP49A9PA6PA44PA84PA26PAP4AP2AP11OPOPOPOPOPOPOPOPOP20A149PA26PAP3AP3AP49A9PA6PA50PA78PA26PAP2AP4APOOPOPOPOPOP38A148HPA26PAPPAP5APOPOPOPOPOPOPOP2OPOPOPOP18OPOPOPPA9PA6PA44PA4PA52PA24PA12PA12PAPAP6AP49A38PA109PA26PAAP5OPAPOPOPOPOPOPOPOPOPOPOPOPOP18OPOPOPOA9PA52PA4PA52PA24PA26PAP6OPAP49A17PA96HA32PA26PAP6OPAPOPOPOPOPOPOPOPOPOPOPOPOPOP14OPOPOPOPOA9PA52PA4PA44HA31HPA28P7AAP49A38PA58PAAPA12HA31HPA28P6APAPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOP4OPOPOPOPOPOPOPOA17PA44PA4PA27PAAPA10PAHA31HPA28HP4AOPAPOOPOPOPOPOPOPOPOPOPOPOPOPOPOPOP2OPOPOPOPOPOPOPOPA9PA6PA13PA4PAPA39PA15PAAPA12HA31HPA28HP3APOPAPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOP4OPOPOPOPOPOPOPOA63PA4PA10PA15PAAPA10PAHA6PA23HPA12PA5PA7HP2APPOPAPOOPOPOPOPOPOPOPOPOPOPOPOPOPOPOP2OPOPOPOPOPOPOPOPA38PA41PA15PAAPA12HA31HPA19PA7HPPAP2OPAPOPOPOPOPOPOPOPOPOPOPOPOPOPOPOP4OPOPOPOPOPOPOPOA9PA52PA4PA10PA15PAAPA10PAHA6PA24PA12PA5PA7HPAP3OPAPO3POPOPOPOPOPOPOPO10P2O2POPOPOPOPOPOPA32PA4PAPA21PA4PA7PAAPA15PAAPA12HPA5PA11PA11PA5PA12PA7HAP4OOAPO29P2O9POPOPOA9PA6PA36PA6PA4PA7PAAPA15PAAPA12HA2PA2PA11PA10HPA12PA5PA8P5OAAP49A9PA6PA19PA15PA6PA4PA7PAAPA15PAAPA12HA6PA11PA10HPA19PA7HP4OA20HA48PA36PA6PAHA2PA7PAAPA15PAAPA12HA32PA12PA5PA7HP3OAAH18AH31A17PHA12PA4PAPA13PA6PA4PA7HAAPA15PAAPA12HPAPA16PA11PA5PA12PA5PAHP2OAAH19AH31A17PHA35PPA5PA4PA7HAAPA15PAAPA10PAHPPAPA2PA11PA10HPA12PA5PA5PAHPPOAAHHA69PHA12PAPA2PA15PPA5PA4PA7HAAPA15PAAPA12HA19PA10HPA19PA7HPOAAHHAP51A17PHA35PPA5PAHA2PA7HAAPA15PAAPA12HA6PA11PA10HPAHHA9PA5PA5PAHOAAHHAPA69PHA12PAPA2PA15PPA5PAHA2PA7HAAPA15PAAPA12HPAPA16PA10HPA5PA12PA5PAOAAHHAPAC8DBADC38A9PA6PHA35PPA5PAHA2PA7HAAPA15PAAHA2PA2PA2PAHAPAPA2PA11PA10HPA12PA5PA5PA2HHAPAC9DBADC38A9PA6PHA14PA2PA15PPA5PAHA2PA7HAAPA15PAAHA12HPAPA16PA10HPA5PA12PA8HHAPAC10DBADC38A9PA6PA36P2APAPAPAHAPAPAPAPAPAPHAAPA15PAAHAPA2PA2PAPAHAPAPA2PA11PA10HPAAHA9PA5PA5PAHHAPAC11DBADC38A9PA6PHA12PAPAPA17PA6PAHA2PA7HAAPA15PAAHA12HPAPA16PA11PAAHA2PA12PA5PAHHPAC12DBADC38A9PA6PA34PAPAPA2PAPAHA2PA2PA2PHAAPA15PAAHA6PA2PAHPPAPA2PAPA2PA5PA10HPAAHA2PA5P2A3PA5PAHHPAC7D5BAD12C2D15CCD5A9PA6PHA12PAPAPA17PA6PAHA2PA7HAAPA15PAAHA10PAHPAPA3PA11PA10HPAAHA2PA6PA4PA5PAHHPAC6DB6AB39A9PA3HAAPHA27PA2PAPAP2APAPAPAHAPAPAPAPAPAPHAAPA15PAAHAPA2PA2PAPAHP3A2PA2PA2PA2PPAAPA8PA12PAPAPAAPA5PAHHPAC5DBA57PA6PHA12PAPAPA17PPA5PAHA11HAAP17AAHA10PAHP5APA11PA10HPAAHA2PA6PAPA2PA7HHPAC4DBA2H45A9PA6PHA11P2AP2AAPA13PPA5PAHA2PA2PA2PHA21HA2PA2PA2PAHP3APAPAPA2PA2PAAPPA2PA2PAAHPAAHA2PA5PAPA3PA7HHPAC3DBA2HA55PA3HAAPHA12PAPAPA17PA6PAHA11HAP19AHA10PAHP3A2PA11PA10HPAAHA2PA6PAPA2PA7HHPAC2DBA2HA2G43A9PA6PHA7PAPAP6AP2APAPA4PAPAPAPAPAPAPAHAPAPAPAPAPAPHAH19AHAPAPAPAPAPAPAHP3A2PA2PA2PA2PPAAPA2PA2PHPA12PAPA3PA7HHPAC2DBAAHA2GA49PA2PA6PHA12PAP3AAPA13PA6PAHA7PAPAHAH19AHA10PAHP3A2PA11PA10HPAAHA2PA6PAPA2PA7HHPAC2DBAHA2GAG43A5PA2PA6PHAAPA2PAPAPAAP5AAPPA2PA2PA2PAPAPA2PAPAHAPAPAPAPAPAPHAHP18APAPAPAPAPAPAPAHP3APAPAPA2PA2PAAPPA2PA2PAAHPAAHPAAPPA4P2A3PA7HHPAC2DBAHAAGAGA49PA2PA3HAAPHA12PAP3AAPA13PAAPAPAP2HP11HA21P12AP4AAP2APA8PA10HPAAHA2PA6PAPA2PA7HHPAC2DBAHAGAGA49PPA2PA3HAAPHPAPAPAPAPAPAP6AP2APAPAPAPAP2AP2AP2AP2AP2AP2AP2A22HHPAPAPAPAPAPAP4APAPAPAP2APA2PPAAPA2PA2PHPAAHAAPPAAPA2P3A9PAHHPAC2DBAHAGAGA49PA3PA3HAAPHA12PAP3AAPA4PAPAPAPAP2APAPAPAPAPAPAPAH6AAH18AH8AAPAHHPAPAPAP14A10HPAAHA2PA5P3A11HHPAC2DBAHAGAGA49PA3PA2PHAAPHPAPAPAPA2PAP6AP2APAP2AP2AP2AP2AP2AH13AAH18AH14APAPAPAPAPAPAP2APAPAPPAAPA2PAAHPAAHPAAPPA2PAP3A11HHPAC2DBAHAGAGA49PA3PA3HAAPHA12P5AAPAPAPAPAPAPAPAPAPH21AAH18AH22PAPAPAPAPAPAPAPAPAPA4HPAAHA2PA6P2A11HHPAC2DBAHAGAGA49PA3PAPAPHAAPHPAPAPAPAPAPAP2APAP12APH26AAP18AH27PAP2AP2AP2APPAAPHPAAHAAPPAAPA2P4A10HHPAC2DBAHAGAGA49PA3PA3HAAPHA12P8APAPAPAPH18P10A19PAP8H22APAPAPAPAPAPAPAHPAAHA2PA6P2A11HHPAC2DBAHAGAGA49PA3PAPAPHAAPHPAPA2PAPAPAP10H18P6A41P6H17PAP2AP2AP2HPAAHPAAPPA2PAP3A5PA4HHPAC2DBAHAGAGA49PA3PA3HAAPHA8PAPAPAPAPAPH16P4A18H17A18P4H15PAPAPAPAPAHPAAHA2PA5P3A11HHPAC2DBAHAGAGA48P2APAPAPAPHAAPHPAPAP12H15P3A11H6APH2A17H3PAH5A11P3H15AP4HPAAHPAPPAAPAAP5A6PA2HHPAC2DBAHAGAGA49PA3PA3HAAPHA2P2AP2AP2AH13P3A9H5A3PAHAPA24PAHA4H5PA8P3H14APAHPAAHAPAPA4P4A11HHPAC2DBAHAGAGA46PAAPPAPAPAPAPHAAPHP13H10P3A7H5A11HAPA24PAHA10H5A7P3H12PHPAAHP5A3P4A4PA2PAHHPAC2DBAHAGAGA48PPA3PA3HAAPHAPAPAPAPAPAH10P2A7H3A13PPAAHAP2A20P2AHAAPPA12H3A7P2H11PAAHAPAPAPAPAAP4A10HHPAC2DBAHAGAGA44PAP4APAPAPAPHAAPHP8H9P2A6H3A2PA2PA13HAPA24PAHA20HPHHA6P2H8PAAHPAP2APAPAP4A2PA2PA2HHPAC2DBAHAGAGA45P4A3PA3HAAPHAPAP2AH8P2A6H2A25HAPA24PAHA24H2A6P2H5PAAH2APAPAPAP5A10HHPAC2DBAHAGAGA45P5A2PAP2HAAPHP4H8PPA6H2A28HAPA24PAHA27H2A6PPH3PAAH3AP2APAP4APA2PA4HHPAC2DBAHAGAGA44P5A3PPAPAHAAPHAPAH7P2A5H2A31HAPA24PAHA30H2A4P3HPAAH5PAPAPAP3A10HHPAC2DBAHAGAGA44P6AP6HAAPHPH7PPA5H2A3PA29HAPA24PAHA33H2A4P2AAH6PAPAP2APA2PA2PA2HHPAC2DBAHAGAGA44P3A3P3APAHAAPH7PPA4H2A37HAPA24PAHA36H2A3PAAH8APAPAPPA10HHPAC2DBAHAGAGA44P2AAP9HAAPH5PPA4HHPAPA37HAPA24PAHA39HHA4PPH8PAPAPAPA2PA2PAHHPAC2DBAHAGAGA44PPA2PAPAPAPAPAHAAPH3PPA4HHA42HAPA24PAHA41HHA4PPH7PAPAPA9HHPAC2DBAHAGAGA44PA2P10HAAPHHPPA4HHPAPAPAPAPAPA29PPAAHAP2A20P2AHAAPPA39HHA4PPH7APAPAPAPAPA2HHPAC2DBAHAGAGA47PAPAPAPAPH3AAP2A4HHAPA2PA40HAPA24PAHA45HHA4PPH6APAPAPA5HHPAC2DBAHAGAGA46P7H5AAPA4HHPAPAPAPA4PA35HAPA2H17A3PAHA43PA2HHA4PH7PAPAPA4HHPAC2DBAHAGAGA45PAPAPAPAH6A5HHA46HHG2APG2A17H3PAG2HA46HHA4PH7A2PA3HHPAC2DBAHAGAGA44P6H7PA3HHPAPAPAPA35HHGHGGA9H17A9GGH3A30PAPAPAPAPAPAHHA3PH7APAPA2HHPAC2DBAHAGAGA45PAPAPH6PPA3HA4PA2PA29H3GA4H39A4G2HHA39HA3PPH6A2PAPHHPAC2DBAHAGAGA44PAP2H6PA3HHA2PAPAPA2PA24HHGGA3H51A3G2HA21PA2PA2PAPAPAPHHA3PH6APAPAHHPAC2DBAHAGAGA45PAPH5PPA3HA34H3A2H61A2GGHHA34HA3PPH5A2PHHPAC2DBAHAGAGA44P2AH4PA3HHPAPAPAPA25H2A2H69A2H2A18PAPAPAPAPAPAPAHHA3PH5APAHHPAC2DBAHAGAGA45PH5PA3HA2PA2PA23H2AAH77AAH2A30PHA3PH6PHHPAC2DBAHAGAGA44PH5PA3HAPAPAPAPAPAPA17H2AAGHGHGHGH76AAH2A16PAPAPAPAPAPAPHA3PH4PAHHPAC2DBAHAGAGA44H5PA3HA28HHAAGHGH86AAHHA23PAPAPHA3PH4PHHPAC2DBAHAGAGA44H4PA2HHAPAPAPAPAPA4PA11HHAGHGHGHGHGHGHGH82AHHAPAPA4PA2PAPAPAPAPAP2APHHA2PH3AHHPAC2DBAHAGAGA44H3PA2HA3PA2PA18HHAHGHGHGHGHGHGH87AHHA9PA2PA2PAPAPAPAPAHA2PH2AHHPAC2DBAHAGAGA44H2PA2HAAPAPAPAPAPA2PA11HHAGHGHGHGHGHGHGHGHGH23G18H35GH2GH2AHHAPAPA4PAPAPAPAPAPAPAPAPAHA2PHHAHHPAC2DBAHAGAGA44HHPA2HA7PA16HHAHGHGHGHGHGHGH2GH21G4A18G4H40AHHA11PAPAPAPAPAPAPAHA2PHPHHPAC2DBAHAGAGA44HPA2HPAPAPAPAPAPAPAPA9HHAGHGHGHGHGHGHGHGHGH21A5H18A5H27GHGHGHGHGHGHGHAHHAPAPAPAPAPAP2AP2AP2APPHA2HAHHPAC2DBAHAGAGA44HPAAHA7PAPAPA11HAHGHGHGHGHGHGHGHGHGH22AH28AH36GH2GHHAHA2PA2PAPAPAPAPAPAPAPAPAHAAHAHHPAC2DBAHAGAGA44PAAHAAPAPAPAPAPAPAPAPA6HHGHGHGHGHGHGHGHGHGH25AH5G16H5AH31GHGHGHGHGHGH4AAPAPAPAPAPAPAPAPAP2APPHAHAHHPAC2DBAHAGAGA44PAAHA6PA2PA10HAGHGHGHGHGHGHGHGH26GGAG5A16G5AGGH44AHA5PAPAPAPAPAPAPAPAPHAHAHHPAC2DBAHAGAGA46HAPAPAPAPAPAPAPAPAPA3H2G2HG2HG2HGHGH21G5A34G5H25GHGHGHGHGHGHGH3APAPAP2APAPAP8A2HHPAC2DBAHAGAGA46HA5PAPAPAPAPA5HAHG2HGHGHGHGHGHGH17G4A46G4H23GH2GH2GH3AHAPA2PAPAPAPAPAPAPAPAPHAHHPAC2DBAHAGAGA45HPAPAPAPAPAPAPAPA5HGHG6HGHGHGHGH8GH4G3A18G17A19G3H18GHGHGHGHGHGHGHGHHAPA2PAPAPAPAP2AP2APAHHPAC2DBAHAGAGA45HA8PA2PA4GHGHG2HG2HGHGHGHGH12G2A12G37A13G2H26GH5A4PAPAPAPAPAPAPAPAPHHPAC2DBAHAGAGA44HAPAPAPAPAPAPAPA6GHG10HG2H10G2A10G14F17G14A11G2H16GHGHGHGHGHGHGGA3PAPAPAP10AHHPAC2DBAHAGAGA44HPA2PA2PA2PA8G2HG2HG2HGHGH8G2A8G9F9G16F10G9A9G2H14GH2GH2GHGGA3PA2PAPAPAPAPAPAPAPHHPAC2DBAHAGAGA44PAPA4PAPAPA5HGA2G10HGHGH5GGA7G7F7G9F16G8F5G7A8GGH13GHGHGHGHGGA2GHAPAPAPAPAP2AP2APAHHPAC2DBAHAGAG45A17HG2A2G2HG2HGHGH6GGA6G5F5G4F39G3F4G5A7GGH16GHHGA2GGHHA4PAPAPAPAPAPAPHHPAC2DBAHAGA46PA8PA5HG4A2G8HGH3GGA5G5F3G4F47G4F3G5A6GGH11GHGHGGA2GGHGHHAPAPAPAPAP2AP2AHHPAC2DBAHAHAH45A12PAAHG4HGA2G2HGHGH4GGA5G3F3G4F56G3F3G3A6GGH10GHGGA2GGHGHGHHAPAPAPAPAPAPAPAPHHPAC2DBAHA64HG7A2G2HGHGH2GA4G3F2G3F65G2F3G3A5GH10GGA2GGHGHGHGHAAPAPAP2AP2APAHHPAC2DBAHAAO46A14HGGHGHGHGHGA2GHGH3GGA3G3FFG3F71G2F2G3A4GGH8GA2GGHGHGHGHGHAAPA2PAPAPAPAPHHPAC2DBAHA2GO3GGOGGOGGO4G27A13HG11A2GH3GA3G3FFG2F77G2FFG3A4GH6GA2GGHGHGHGHGHGHAAPAPAPAPAPAPAHHPAC2DBAHA2OAAO42A13HGHGHG2HG2HGA2HHGGA3G2FFG2F81G2FFG2A4GGH3GA2GGHGHGHG2HGHGA2PA2PA2PAPHHPAC2DBAHA2OAAO42A12HG12HGA2GA3G2FFG2F85G2FFG2A4GHHGA2GGHGHGHG7HAPAPAPAPAPAPAHHPAC2DBAHA2OPPO42A12HG7HGHGHGHGA5GGFFG2F89G2FFGGA4GGA2GGHGHGHGHGHGHGHGHA3PA7HHPAC2DBAHA2O45A11HHG10HGHGHGA3GGFG4F90G3FG2A6GGHGHGHG10HAAPAPAPAPAPAHHPAC2DBAHA2O45A11HG12HGHGAAPGGFFG3F93G3FFGGA4GGHGHGHG11HA4PA5HHPAC2DBAHAAP46A11HG13HGA2GGFG4F95G4FGGA3GHGHGHG12HAAPAPAPAPAPAHHPAC2DBAHA59HHG14A3GFG5F96G4FGGA3G2HG14HA10HHPAC2DBAHAAP15AP15AP12A10HG15A2GFG5F97G5FGGA2G18HA2PAPAPAPAHHPAC2DBAHAAPA13PAPA13PAPA22HG14A2GFG6F98G5FGGA2G17HA3PA5HHPAC2DBAHAAPAP11APAPAP11APAPAP10A10HG13A2GGFG5F99G5FG2A2G16HA2PAPAPAPAHHPAC2DBAHAAPAP11APAPAP11APAPAP10A9HHG13A2GFG6F99G6FG2AAG17HA9HHPAC2DBAHAAPAP2A5P2APAPAP2A5P2APAPAP2A5PPA9HG13A2GFG7F100G6FGGA2G16HAAPAPAPAPAHHPAC2DBAHAAPAP2AP3AP2APAPAP2AP3AP2APAPAP2AP3APPA9HG13AAGGFG7F100G6FG2AAG16HA9HHPAC2DBAHAAPAPOOAF3AOOPAPAPAPOOACEECAOOPAPAPAPOOAF3AOOA9HG13AAGGFG7F100G6FG2AAG16HAAPAPAPAPAHHPAC2DBAHAAPAPOOAO3AOOPAPAPAPOOAO3AOOPAPAPAPOOAO3AOOA9HG13AGGFG8F100G7FG2AG16HA9HHPAC3BAHAAPAPOOP5OOPAPAPAPOOP5OOPAPAPAPOOP5OOA9HG12AAGGFG9F99G7FG2AAG15HAAPAPAPAPAHHPAC3BAHAAPAPO9PAPAPAPO9PAPAPAPO9A9HHG11AAGGFG9F98G8FG2AAG15HA9HHPAC3BAHAAPAPO9PAPAPAPO9PAPAPAPO9A10HG11AG2FG10F97G8FG3AG14HA4PA2PAHHPAC2DBAHAAPAPO9PAPAPAPO9PAPAPAPO9A10HG11AHGGFG11F95G9FG3AG14HA10HHPAC3BAHAAPAPO9PAPAPAPO9PAPAPAPO9A10HG11AG2FG11F94G10FG3AG14HA2PAPAPA2HHPAC3BAHAAPAPO9PAPAPAPO9PAPAPAPO9A10HHG10AAG2FG11F92G10FG3AAG14HA10HHPAC2DBAHAAPAPO9PAPAPAPO9PAPAPAPO9A11HG10AAG2FG13F89G11FG3AAG13HA5PA4HHPAACCDBAHAAPAPO9PAPAPAPO9PAPAPAPO9A11HG11AG2FG14F87G12FG3AG14HA11HHPABACDBAHAAPAPO9PAPAPAPO9PAPAPAPO9A11HG11AG3FG14F85G12FG4AG14HA3PA6HHPADBADBAHAAPAPO9PAPAPAPO9PAPAPAPO9A12HG10AAG3FG15F82G12FG4AAG13HA12HHPACDBA2HAAPAPO9PAPAPAPO9PAPAPAPO9A12HG11AG3FG16F79G14FG4AG14HA12HHPACCDBBAHAAPAPO9PA2PAPO9PA2PAPO9A13HG10AAG3FG17F76G14FG4AAG13HA13HHPAC2DBAHA3PO9A5PO9A5PO9A13HHG10AAG3FG19F71G15FG4AAG14HA13HHPAC3BAHA4O9A6O9A6O9A14HHG9AAHG3FG22F64G17FG5AAG13HA14HHPAC3BAHAAPA12P3A12P3A27HHG9AAG4FFG25F57G17FFG5AAG13HA15HHPAC3BAHAAP46"

HUD2_Infobar =
	"E37B12E138B13P97E39B14A21P76E37B4CB7CBAP19AP77E35B5CB7CBA19PAP78EB32PPB4CB7CBA21P23AP54B32PAB4CB7CBAP45AP53B32PAB4D9BAO96P3B32PAB3DC9BAO2NNONON67O4NOON11OOP2B32PAB2DC9BAO99PPB32PABBDC9BA99O2PD10CCD17ODPPBDC9BA100O2PC30BCPBDC9BA101O2PC29BCPBDC9BA102O2PC28BCPBDC9BA103O2PC27BCPBDC9BA104O2PC26BCPBDC9BA105O2PC25BCPBDC9BA106O2PB25CPBDC9BA107O2PC25PBDC9BA108O2PA18P6BDC9BA109O2PB25DC9BA110O2PD25C9BA111O2PC34BA110HAO2PC33BA110HHAO2PC32BA110H2AO2PC31BAH112AO3PC30BAH112AO4PC29BA114O4PEC28BAO118PEEB29P119E2"

HUD2_Consoleoverlay = "AGGAGGAG38A1333G2AGGAG38"

function loadHUDSprites()
	loadExtendedSprite(unpac_noheader(HUD_01), "HUD_01", 240, 136, 0)
	loadExtendedSprite(unpac_noheader(HUD_02), "HUD_02", 240, 136, 0)
	loadExtendedSprite(unpac_noheader(HUD_Frame), "HUD_Frame", 240, 136, 0)

	loadExtendedSprite(unpac_noheader(HUD2_Background), "HUD2_Background", 240, 136, 0)
	loadExtendedSprite(unpac_noheader(HUD2_Infobar), "HUD2_Infobar", 153, 31, 4)
	loadExtendedSprite(unpac_noheader(HUD2_Consoleoverlay), "HUD2_Consoleoverlay", 46, 31, 0)
end

-- space logistics --

function assert(condition, message)
	if not condition then
		error(message or "assertion failed")
	end
end

-- t is an array
-- x = 0..1; 0 = left, 1 = right, evenly distributed over array.
-- returns the INDEX (not value)
-- yes this is not totally necessary but helps my tiny brain read code.
function SelectNorm(table, x)
	return ((x * #table) // 1) + 1
end

local min, max, random, ceil = math.min, math.max, math.random, math.ceil
local sin, cos, sqrt = math.sin, math.cos, math.sqrt

function clamp01(x)
	if x < 0 then
		return 0
	end
	if x > 1 then
		return 1
	end
	return x
end

local pal = "07F80060KBMBMCNFHCNFBLODDFPONHHFPPNMFHHKAPAHIDHLEGFCBHJHJCGDPGLDNFJMBEGKGPDHPOHPEPEPEPEJALCMGFMGGIDDMDHF0"

-- the rle-decoder
function unpac(str)
	local r = str:sub(1, 5) -- get (o)ffset into (r)aw data
	local r = r .. str:sub(6, 8) -- get (w)idth into (r)aw data
	local e = str:sub(9, str:len()) -- remove header to get (e)ncoded data
	local d = "" -- (d)ecoded data
	for m, c in e:gmatch("(%u+)([^%u]+)") do -- decode rle, (m)atch & (c)ounter
		d = d .. m .. (m:sub(-1):rep(c)) -- (d)ecoded data
	end
	for x = 1, #d, 1 do -- get (d)ecoded data into (r)aw data
		r = r .. string.format("%x", (string.byte(d:sub(x, x)) - 65))
	end
	return r
end

function unpac_noheader(str)
	local r = ""
	local d = "" -- (d)ecoded data
	for m, c in str:gmatch("(%u+)([^%u]+)") do -- decode rle, (m)atch & (c)ounter
		d = d .. m .. (m:sub(-1):rep(c)) -- (d)ecoded data
	end
	for x = 1, #d, 1 do -- get (d)ecoded data into (r)aw data
		r = r .. string.format("%x", (string.byte(d:sub(x, x)) - 65))
	end
	return r
end

-- the raw-decoder
function tomem(str, adr)
	local o = adr or tonumber(str:sub(1, 5), 16) -- get (o)ffset, from param or string
	local w = tonumber(str:sub(6, 8), 16) - 1 -- get (w)idth
	local d = str:sub(9, str:len()) -- remove header to get (d)ata
	local y = 0
	for x = 1, #d, 1 do -- write to mem
		local c = tonumber(d:sub(x, x), 16) -- get (c)olor value
		poke4(o + y, c)
		y = y + 1
		if y > w then
			y = 0
			o = o + 1024
		end
	end
end

local sprites = {}

function loadSprite(name, w, h, bg)
	sprites[name] = { w = w, h = h, bg = bg, data = {} }
	cls(sprites[name].bg)
	spr(256, 0, 0, sprites[name].bg, 1, 0, 0, 16, 16)
	for x = 0, sprites[name].w - 1 do
		for y = 0, sprites[name].h - 1 do
			sprites[name].data[x + y * sprites[name].w] = pix(x, y)
		end
	end
end

function loadExtendedSprite(ref, name, w, h, bg)
	sprites[name] = { w = w, h = h, bg = bg, data = {} }
	--cls(sprites[name].bg)
	--spr(256,0,0,sprites[name].bg,1,0,0,16,16)
	local i = 0
	for m in string.gmatch(ref, "%x") do
		sprites[name].data[i] = tonumber(m, 16)
		i = i + 1
	end
end

function sweetie16_init()
	tomem(unpac(pal))
	poke(0x3FF8, 0) -- border
	poke(0x3FF9, 0) -- screen offset
	poke(0x3FFA, 0)
end

function no_fn() end

--------------------------------------------------------------------------------------------------------
-- http://lua-users.org/wiki/CopyTable
function deepcopy(orig)
	local orig_type = type(orig)
	local copy
	if orig_type == "table" then
		copy = {}
		for orig_key, orig_value in next, orig, nil do
			copy[deepcopy(orig_key)] = deepcopy(orig_value)
		end
		setmetatable(copy, deepcopy(getmetatable(orig)))
	else -- number, string, boolean, etc
		copy = orig
	end
	return copy
end

-- a and b are {x,y}; returns {x,y}
function lerp(a, b, t)
	return {
		(1 - t) * a[1] + t * b[1],
		(1 - t) * a[2] + t * b[2],
	}
end

function lerpScalar(a, b, t)
	return a + (b - a) * t
end

-- careful: when this gets inlined, `a` gets evaluated twice. don't put expressions in there if the intent is performance.

function lerpAngular(a, b, t)
	local diff = (b - a + math.pi) % (2 * math.pi) - math.pi
	return a + diff * t
end

function bilerpScalar(a, b, c, d, tx, ty)
	local ab = lerpScalar(a, b, tx)
	local cd = lerpScalar(c, d, tx)
	return lerpScalar(ab, cd, ty)
end

-- speed or radius...
function polarToCartesian(angle, length)
	local dx = math.cos(angle) * length
	local dy = math.sin(angle) * length
	return dx, dy
end

function DxDyToAngle(dx, dy)
	return math.atan2(dy, dx)
end

function normalize2D(x, y)
	local len = math.sqrt(x * x + y * y)
	if len == 0 then
		return 0, 0
	end
	return x / len, y / len
end

function normalizeVec2(v)
	local xn, yn = normalize2D(v[1], v[2])
	return { xn, yn }
end

--------------------------------------------------------------------------------------------------------
-- generic particle system
function UpdateParticle(p, dt)
	p.x = p.x + p.dx * dt
	p.y = p.y + p.dy * dt
	p.age = p.age + dt
end

function CreateParticlePool(maxParticles)
	local pool = {}
	pool.maxParticles = maxParticles or 1000
	pool.particles = {}
	return pool
end

-- p should be { x=,y=,dx=,dy=,life=, onDeath, should86= }
-- onDeath called when it outives lifetime.
-- should86 is a function that returns true if the particle should be removed (e.g. OOB)
-- p can contain other fields.
function AddParticleToPool(pool, p)
	-- if max capacity, remove oldest particle (ok fifo regardless of particle lifetime)
	p.age = 0
	if #pool.particles >= pool.maxParticles then
		table.remove(pool.particles, 1)
	end
	table.insert(pool.particles, p)
end

function UpdateParticlePool(pool, dt)
	dt = dt or 1
	for i = #pool.particles, 1, -1 do
		local p = pool.particles[i]
		UpdateParticle(p, dt)
		if p.age >= p.life then
			table.remove(pool.particles, i)
			if p.onDeath then
				p.onDeath(p)
			end
		elseif p.should86 and p.should86(p) then
			table.remove(pool.particles, i)
			if p.onDeath then
				p.onDeath(p)
			end
		end
	end
end
--------------------------------------------------------------------------------------------------------
-- star system... reuse particle system.

StarGradient = { 15, 14, 13, 12, 4 }

function CreateStar(starField, params, parallaxLayer01, init)
	local star = {
		x = init and math.random(0, 240) or 241,
		y = math.random(0, 136),
		dx = lerpScalar(params.dxMin, params.dxMax, math.random()) * parallaxLayer01,
		dy = lerpScalar(params.dyMin, params.dyMax, math.random()) * parallaxLayer01,
		life = 99999, -- effectively infinite
		onDeath = function(p)
			local newStar = CreateStar(starField, params, parallaxLayer01, false)
			AddParticleToPool(starField, newStar)
		end,
		should86 = function(p)
			return p.x < -20 or p.x > 260 or p.y < -20 or p.y > 156
		end,
		-- custom props
		seed = math.random(),
		colorIndex = math.random(1, #StarGradient) * parallaxLayer01,
		radius = lerpScalar(params.radiusMin, params.radiusMax, parallaxLayer01),
	}
	return star
end

function CreateStarField(params)
	local stars = {}
	if not params then
		params = {}
	end
	params.numParallaxLayers = params.numParallaxLayers or 3
	params.density = params.density or 10
	params.dxMin = params.dxMin or -0.015
	params.dxMax = params.dxMax or 0.015
	params.dyMin = params.dyMin or 0
	params.dyMax = params.dyMax or 0
	params.radiusMin = params.radiusMin or 0.1
	params.radiusMax = params.radiusMax or 0.5

	-- calc # of stars first
	local starCount = 0
	for parallaxLayer = 1, params.numParallaxLayers do
		starCount = starCount + params.density * parallaxLayer
	end

	local starField = CreateParticlePool(starCount)
	--starField.params = params

	for parallaxLayer = 1, params.numParallaxLayers do
		-- norm should actually hit  0 and 1
		local layer01 = (parallaxLayer - 1) / (params.numParallaxLayers - 1)
		local numStars = params.density * parallaxLayer
		for i = 1, numStars do
			table.insert(stars, CreateStar(starField, params, layer01, true))
		end
	end

	-- assert
	if #stars ~= starCount then
		error("star count mismatch")
	end

	for _, star in ipairs(stars) do
		AddParticleToPool(starField, star)
	end
	return starField
end

-- dt = step units; optional - nominal = 1
function UpdateStarField(starField, dt)
	UpdateParticlePool(starField, dt)
end

function RenderStarField(starField, t)
	for i, p in ipairs(starField.particles) do
		-- twinkle effect nudges gradient index.
		local twinkleRate = 0.005
		local twinkle = math.sin(t * twinkleRate * p.seed + (6.28 * p.seed)) + 0.5 -- bias so it's mostly positive(on)
		local twinkleIndexNudge = twinkle > 0 and 2 or 0
		local colIndex = math.min(p.colorIndex + twinkleIndexNudge, #StarGradient)
		circ(p.x, p.y, p.radius, StarGradient[colIndex])
	end
end

--------------------------------------------------------------------------------------------------------

-- bayer 4x4 matrix normalized to 0..1
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
-- precompute bayer offsets for each pixel in the screen.
for sy = 0, 136 - 1 do
	local y4 = (sy % 4) * 4
	local row = sy * 240
	for sx = 0, 240 - 1 do
		BAYER_MINUS_5[row + sx] = (B4N[y4 + (sx % 4) + 1] - 0.5)
	end
end

function pixBayer(x, y, gradient, brightness)
	local gradientCount = #gradient
	local row = y * 240
	local bayer = BAYER_MINUS_5[row + x]
	local col = gradient[max(1, min(gradientCount, (brightness + bayer) * gradientCount)) // 1]
	pix(x, y, col)
end

function hlineBayer(x1, x2, y, gradient, brightness)
	local gradientCount = #gradient
	-- screen clip.
	if y < 0 or y >= 136 then
		return
	end
	x1 = max(0, x1) // 1
	x2 = min(240 - 1, x2) // 1
	local row = (y * 240) // 1
	for x = x1, x2 do
		local bayer = BAYER_MINUS_5[row + x]
		local col = gradient[max(1, min(gradientCount, (brightness + bayer) * gradientCount)) // 1]
		pix(x, y, col)
	end
end

-- NB: gradient index 1 considered a background/transparent color and is not drawn.
function hlineBayerGradient(x1, x2, y, gradient, brightness1, brightness2)
	local gradientCount = #gradient
	-- screen clip.
	if y < 0 or y >= 136 then
		return
	end
	x1 = max(0, x1) // 1
	x2 = min(240 - 1, x2) // 1
	if x2 <= x1 then
		return
	end
	local row = (y * 240) // 1
	local brightness = brightness1
	-- amount to advance brightness per pixel such that brightness1 at x1 and brightness2 at x2
	local brightnessAdvance = (brightness2 - brightness1) / (x2 - x1)
	for x = x1, x2 do
		local bayer = BAYER_MINUS_5[row + x]
		local gradIndex = max(1, min(gradientCount, (brightness + bayer) * gradientCount)) // 1
		if gradIndex ~= 1 then
			pix(x, y, gradient[gradIndex])
		end
		brightness = brightness + brightnessAdvance
	end
end

-- specialization of hline that draws only the shadow pixels (others = transparent). darkenAmt01 is amount of shade.
function hlineBayerShadow(x1, x2, y, colorShadow, darkenAmt01)
	-- screen clip.
	if y < 0 or y >= 136 then
		return
	end
	x1 = max(0, x1) // 1
	x2 = min(240 - 1, x2) // 1
	local row = (y * 240) // 1
	-- offset to account for 0.5 bayer centering instead of calculating per pixel
	-- and a bit of bias so first row is not 100% shade
	darkenAmt01 = darkenAmt01 - 0.6
	for x = x1, x2 do
		local bayer = BAYER_MINUS_5[row + x]
		if darkenAmt01 > bayer then
			local col = colorShadow
			pix(x, y, col)
		end
	end
end

function vlineBayer(x, y1, y2, gradient, brightness)
	local gradientCount = #gradient
	x = x // 1
	y1 = y1 // 1
	y2 = y2 // 1
	-- screen clip.
	if x < 0 or x >= 240 then
		return
	end
	y1 = max(0, y1) // 1
	y2 = min(136 - 1, y2) // 1
	for y = y1, y2 do
		local row = (y * 240) // 1
		local bayer = BAYER_MINUS_5[row + x]
		local col = gradient[max(1, min(gradientCount, (brightness + bayer) * gradientCount)) // 1]
		pix(x, y, col)
	end
end

function lineBayer(x1, y1, x2, y2, gradient, brightness)
	VisitPixelsAlongLine(x1, y1, x2, y2, function(x, y)
		local row = (y * 240)
		local bayer = BAYER_MINUS_5[(row + x) // 1]
		local col = gradient[max(1, min(#gradient, (brightness + bayer) * #gradient)) // 1]
		pix(x, y, col)
	end)
end

-- renders a circle with a shade function returning the 0..1 gradient position for the pixel.
function ShadeCircleBayer(cx, cy, r, gradient, shadeFunc)
	local r2 = r * r
	local gradientCount = #gradient
	local bayer = BAYER_MINUS_5

	-- screen space clipping
	local yFrom = max(-r, -cy) -- yfrom/to/y are relative to center.
	local yTo = min(r, 136 - 1 - cy)
	for y = yFrom, yTo do
		local screenY = cy + y
		-- y is offset from center, screenY is actual pixel coordinate
		local y2 = y * y
		local span = sqrt(r2 - y2) // 1
		local xFrom = max(-span, -cx) -- clipping
		local xTo = min(span, 240 - 1 - cx)
		local screenY240 = screenY * 240
		for x = xFrom, xTo do
			local screenX = cx + x
			-- x is offset from center, screenX is actual pixel coordinate
			if x * x + y2 <= r2 then -- inside circle
				-- x and y are offsets from center;
				local tone01 = shadeFunc(cx + x, screenY)
				if tone01 ~= nil then
					--pix(screenX, screenY, col)
					--pixBayer(screenX, screenY, gradient, gradientCount, tone01)
					local b = bayer[screenY240 + screenX]
					pix(screenX, screenY, gradient[max(1, min(gradientCount, (tone01 + b) * gradientCount)) // 1])
				end
			end
		end
	end
end

-- hack to skip some cycles per frame
function ShadeCircleBayerHack(cx, cy, r, gradient, shadeFunc, t)
	local r2 = r * r
	local gradientCount = #gradient
	local bayer = BAYER_MINUS_5

	local sp = t // 1 % 2
	local sp2 = (t // 1) % 3

	-- screen space clipping
	local yFrom = max(-r, -cy) + sp -- yfrom/to/y are relative to center.
	local yTo = min(r, 136 - 1 - cy)
	for y = yFrom, yTo, 2 do
		local screenY = cy + y
		-- y is offset from center, screenY is actual pixel coordinate
		local y2 = y * y
		local span = sqrt(r2 - y2) // 1
		local xFrom = max(-span, -cx) + sp2 -- clipping
		local xTo = min(span, 240 - 1 - cx)
		local screenY240 = screenY * 240
		for x = xFrom, xTo, 2 do
			local screenX = cx + x
			-- x is offset from center, screenX is actual pixel coordinate
			if x * x + y2 <= r2 then -- inside circle
				-- x and y are offsets from center;
				local tone01 = shadeFunc(cx + x, screenY)
				if tone01 ~= nil then
					--pix(screenX, screenY, col)
					--pixBayer(screenX, screenY, gradient, gradientCount, tone01)
					local b = bayer[screenY240 + screenX]
					pix(screenX, screenY, gradient[max(1, min(gradientCount, (tone01 + b) * gradientCount)) // 1])
				end
			end
		end
	end
end

--------------------------------------------------------------------------------------------------------
-- 1 input value, 1 output value, 0..1

-- https://stackoverflow.com/questions/12964279/whats-the-origin-of-this-glsl-rand-one-liner
function hash11(t)
	local x = math.sin(t * 12.9898) * 43758.5453
	return x - math.floor(x)
end

-- self-contained stateful rng; semantics like math.random.
-- usage:
-- local rng = CreateRng(12345)
-- RngNext(rng) -- returns a number between 0 and 1
-- RngNext(rng, min, max) -- returns a number between min and max
function CreateRng(seed)
	return { seed = seed or time() }
end

-- https://github.com/dylang/shortid/blob/master/lib/random/random-from-seed.js
-- RngNext(r) => 0..1
-- RngNext(r,min,max) => random integer in [min..max]
function RngNext(rng, min, max)
	rng.seed = (rng.seed * 9301 + 49297) % 233280
	local value = rng.seed / 233280
	if min and max then
		return (min + value * (max - min)) // 1
	else
		return value
	end
end

function RngNextFloat(rng, fmin, fmax)
	local t = RngNext(rng)
	return (fmin + (fmax - fmin) * t)
end

function fract(x)
	return x - (x // 1)
end

-- callback receives x,y,t01 normalized along the line 0..1
function VisitPixelsAlongLine(x0, y0, x1, y1, callback)
	-- bresenham
	local dx = x1 - x0
	local dy = y1 - y0
	local steps = math.max(math.abs(dx), math.abs(dy))
	if steps == 0 then
		callback(x0, y0, 0)
		return
	end
	local xInc = dx / steps
	local yInc = dy / steps
	local x = x0
	local y = y0
	for i = 0, steps do
		local sx = x // 1
		local sy = y // 1
		if sx >= 0 and sx < 240 and sy >= 0 and sy < 136 then
			local t01 = i / steps
			callback(sx, sy, t01)
		end
		x = x + xInc
		y = y + yInc
	end
end

-- accepts an edge { x0,y0,width,height } and a t01 in [0,1] and returns a {x,y} point along the edge.
function PointAlongLine(edge, t01)
	local x = edge.x0 + t01 * edge.width
	local y = edge.y0 + t01 * edge.height
	return { x, y }
end

-- https://stackoverflow.com/a/68486276
function ShuffleInPlace(t, rng)
	for i = #t, 2, -1 do
		local j = RngNext(rng, 1, i)
		t[i], t[j] = t[j], t[i]
	end
end

-- raster line glitching.
function screen_glitch(seed, maxShiftPx, amt01)
	for y = 0, 136 - 1 do
		-- shift  this scanline left/right by some amount,
		local maxDblShift = maxShiftPx / 2
		local shiftDblPx = (hash11(y + seed) - 0.5) * maxDblShift * amt01 -- double pixels to shift, bipolar.
		-- because it will necessarily spill off screen, calculate safe x0 and x1.
		-- x0 and x1 are double-pixel BYTE amounts, not pixel. so the max width is TIC_WIDTH/2, not TIC_WIDTH.
		local x0 = 0
		local x1 = 240 / 2 - 1
		if shiftDblPx > 0 then
			x1 = x1 - shiftDblPx
		else
			x0 = x0 - shiftDblPx
		end

		local pRow = y * 240 / 2
		memcpy(x0 + pRow, x0 + pRow + shiftDblPx, x1 - x0 + 1)
	end
end

function DisplaceScreenRect(x, y, w, h, dx, dy)
	-- in here, x coords will be in bytes (2 pixels)
	local srcXStartByte = x // 2
	local srcXEndByte = srcXStartByte + (w // 2)
	local dxBytes = dx // 2
	y = y // 1
	h = h // 1
	dy = dy // 1

	-- screen clip
	srcXStartByte = math.max(srcXStartByte, -dxBytes, 0)
	srcXEndByte = math.min(srcXEndByte, (240 / 2) - dxBytes, (240 / 2))

	local sy0 = math.max(y, -dy, 0)
	local sy1 = math.min(y + h, 136 - dy, 136)

	-- recalc
	local srcWidthBytes = srcXEndByte - srcXStartByte
	h = sy1 - sy0

	if srcWidthBytes <= 0 or h <= 0 then
		return
	end

	local firstRow, lastRow, step

	-- copy bottom-up when moving downward, bc overlap
	if dy > 0 then
		firstRow = sy1 - 1
		lastRow = sy0
		step = -1
	else
		firstRow = sy0
		lastRow = sy1 - 1
		step = 1
	end

	for sy = firstRow, lastRow, step do
		local src = sy * (240 / 2) + srcXStartByte
		local dst = (sy + dy) * (240 / 2) + (srcXStartByte + dxBytes)
		memcpy(dst, src, srcWidthBytes)
	end
end

-- similar screen_glitch, a post-effect made possible with memcpy. copies rects
-- to another place on screen.shattered mirror kinda sorta effect
function screen_glitch_blocks(seed, options)
	options = options or {}
	local widthMin = options.widthMin or 4
	local widthMax = options.widthMax or 60
	local heightMin = options.heightMin or 4
	local heightMax = options.heightMax or 60
	local count = (options.count or 75) // 1
	local dxMin = options.dxMin or 2
	local dxMax = options.dxMax or 16
	local dyMin = options.dyMin or 2
	local dyMax = options.dyMax or 16

	local rng = CreateRng(seed)

	for i = 1, count do
		local w = RngNextFloat(rng, widthMin, widthMax)
		local h = RngNextFloat(rng, heightMin, heightMax)
		local x = RngNextFloat(rng, 0, 240 - 1 - w)
		local y = RngNextFloat(rng, 0, 136 - 1 - h)
		local dx = RngNextFloat(rng, dxMin, dxMax)
		local dy = RngNextFloat(rng, dyMin, dyMax)
		DisplaceScreenRect(x, y, w, h, dx, dy)
		-- rect(x, y, w, h, 2)
		-- rect(x + dx, y + dy, w, h, 3)
	end
end

function UpdateSlewedScalar(scalar, target, slewRate)
	if scalar < target then
		scalar = scalar + slewRate
		if scalar > target then
			scalar = target
		end
	elseif scalar > target then
		scalar = scalar - slewRate
		if scalar < target then
			scalar = target
		end
	end
	return scalar
end

-- starz vs. lazerz
twinkle_current_type = "starz"
twinkle_lazer_dir_vector = normalizeVec2({ 275, -192 })

-- defines the emitter along left edge of screen.
twinkle_lazer_left_edge = {
	x0 = 0,
	y0 = 50, -- don't emit too high or it's just a little corner.
	width = 0,
	height = 136 - 1 - 100,
}
-- and bottom edge.
twinkle_lazer_bottom_edge = {
	x0 = 0,
	y0 = 136 - 1,
	width = 240 - 1 - 100, -- don't emit too far right; avoid the corner,
	height = 0,
}

do
	local gTwinkleParticles = nil
	local gTwinkleRng = nil
	local gScheduledTwinkles = {}

	TWINKLE_explicitStarPositions = nil
	TWINKLE_starSequence = 0

	function TwinkleNewScene(sceneNumber)
		gTwinkleParticles = CreateParticlePool(50)
		gTwinkleRng = CreateRng(1 + sceneNumber)
		TWINKLE_explicitStarPositions = nil
		gScheduledTwinkles = {}
		TWINKLE_starSequence = 0
	end

	TwinkleNewScene(0)

	-- set explicit positions for twinkles.
	-- array of vec2 positions.
	function TwinkleSetStarPositions(positions)
		TWINKLE_explicitStarPositions = positions
	end

	local gTwinkleGradient1 = { 15, 14, 13, 12 } -- white
	local gTwinkleGradient2 = { 1, 2, 3, 4 } -- red-yellow

	-- sub-twinkles get different, darker color.
	local gSubTwinkleGradient1 = { 15, 15, 14, 13 } -- white
	local gSubTwinkleGradient2 = { 1, 1, 2, 3 } -- red-yellow

	-- generates x,y screen coords whose distribution is biased away from the center of the screen
	function GetRandomCoordInSpanBiasedAwayFromCenter(min, max)
		local span = max - min
		--local centerBias = 0.5 -- 0.5 = no bias; 1.0 = full bias away from center.
		local r = RngNext(gTwinkleRng) - 0.5 -- -0.5 to 0.5 such that 0 is center.
		local sign = r < 0 and -1 or 1
		local rAbs = math.abs(r)
		local rAbsBiased = math.sqrt(rAbs) -- inflates the curve; higher values favored = towards edge.
		local center = (min + max) / 2
		return center + sign * rAbsBiased * (span / 2)
	end
	function GetRandomScreenPosition()
		if TWINKLE_explicitStarPositions then
			local pos = TWINKLE_explicitStarPositions[TWINKLE_starSequence + 1]
			if pos then
				TWINKLE_starSequence = TWINKLE_starSequence + 1
				return pos[1], pos[2]
			end
		end
		local x = GetRandomCoordInSpanBiasedAwayFromCenter(0, 240)
		local y = GetRandomCoordInSpanBiasedAwayFromCenter(0, 136)
		return x, y
	end

	-- get random position within a donut-shaped region around x,y
	function GetSubTwinklePosition(x, y)
		local rInside = 0
		local rOutside = 10
		local r = lerpScalar(rInside, rOutside, RngNext(gTwinkleRng) ^ 2) -- bias towards inside of donut.
		local angle = RngNext(gTwinkleRng, 0, 6.28)
		return x + math.cos(angle) * r, y + math.sin(angle) * r
	end

	function GetLazerScreenPosition()
		-- sample lanes perpendicular to the lazer direction,
		-- then map that lane to its entry point on the left or bottom edge of screen
		local leftSpan = twinkle_lazer_dir_vector[1] * twinkle_lazer_left_edge.height
		local bottomSpan = -twinkle_lazer_dir_vector[2] * twinkle_lazer_bottom_edge.width
		local lane = RngNext(gTwinkleRng) * (leftSpan + bottomSpan)
		local position
		if lane < leftSpan then
			position = PointAlongLine(twinkle_lazer_left_edge, lane / leftSpan)
		else
			position = PointAlongLine(twinkle_lazer_bottom_edge, (lane - leftSpan) / bottomSpan)
		end
		return position[1], position[2]
	end

	-- Get a random nearby start position for the rest of the lazer burst.
	function GetSubLazerScreenPosition(x, y)
		return x + RngNext(gTwinkleRng, -10, 10), y + RngNext(gTwinkleRng, -10, 10)
	end

	function AddTwinkle()
		local isStar = twinkle_current_type == "starz"
		for i = 1, 1 do
			local x, y = GetLazerScreenPosition()
			if isStar then
				x, y = GetRandomScreenPosition()
			end
			local gradientRand = RngNext(gTwinkleRng)
			local lazerSpeedRand = RngNext(gTwinkleRng)
			local particle = {
				x = x,
				y = y,
				dx = 0, -- required for particle system.
				dy = 0,
				life = isStar and 85 or 9999,
				-- custom
				twinkleType = twinkle_current_type,
				gradient = gradientRand > 0.5 and gTwinkleGradient1 or gTwinkleGradient2,
				strength = 1,

				lazerSpeed = lerpScalar(0.2, 0.3, lazerSpeedRand),
				lazerLength = lerpScalar(20, 40, RngNext(gTwinkleRng)),
			}
			AddParticleToPool(gTwinkleParticles, particle)

			-- schedule a couple more twinkles in future ticks.
			local subtwinkleCount = isStar and 20 or 5
			for j = 1, subtwinkleCount do
				local normj = 1 - (j / subtwinkleCount)
				local subX, subY = GetSubLazerScreenPosition(x, y)
				if isStar then
					subX, subY = GetSubTwinklePosition(x, y)
				end
				local subParticle = {
					x = subX,
					y = subY,
					dx = 0,
					dy = 0,
					life = isStar and 33 or 9999, -- lerpScalar(25, 50, normj),
					-- custom
					twinkleType = twinkle_current_type,
					gradient = gradientRand > 0.5 and gSubTwinkleGradient1 or gSubTwinkleGradient2,
					strength = 0.2, --0.25 * normj, -- fade out the sub-twinkles a bit more.

					lazerSpeed = particle.lazerSpeed * lerpScalar(0.75, 0.99, RngNext(gTwinkleRng)),
					lazerLength = lerpScalar(10, 30, RngNext(gTwinkleRng)),
				}

				local delayMillis = 40 * j

				if twinkle_current_type == "lazerz" then
					delayMillis = 16 * j -- faster for lazerz, since they move across the screen quickly.
				end

				gScheduledTwinkles[#gScheduledTwinkles + 1] = {
					millisRemaining = delayMillis,
					particle = subParticle,
				}
			end
		end
	end

	function TwinkleRowHandler(state)
		if state.sideChannel == "twinkle1" then
			AddTwinkle()
		end
		if state.sideChannel == "twinkle2" then
			AddTwinkle()
		end
		if state.sideChannel == "endaccent" then
			AddTwinkle()
		end
	end

	function TwinkleTick(state, twinkleType, additionalRandomSeed)
		twinkle_current_type = twinkleType

		if additionalRandomSeed then
			gTwinkleRng = CreateRng(1 + state.wallMillis + additionalRandomSeed)
		end

		-- hit t to manually add twinkle.

		-- realize any scheduled twinkles.
		for i = #gScheduledTwinkles, 1, -1 do
			local scheduled = gScheduledTwinkles[i]
			scheduled.millisRemaining = scheduled.millisRemaining - state.wallDeltaMillis
			if scheduled.millisRemaining <= 0 then
				AddParticleToPool(gTwinkleParticles, scheduled.particle)
				table.remove(gScheduledTwinkles, i)
			end
		end

		UpdateParticlePool(gTwinkleParticles)

		-- update lazerz twinkles manually.
		for i = 1, #gTwinkleParticles.particles do
			local p = gTwinkleParticles.particles[i]
			if p.twinkleType == "lazerz" then
				-- update position.
				p.x = p.x + twinkle_lazer_dir_vector[1] * state.wallDeltaMillis * p.lazerSpeed
				p.y = p.y + twinkle_lazer_dir_vector[2] * state.wallDeltaMillis * p.lazerSpeed
			end
		end

		for i = 1, #gTwinkleParticles.particles do
			local p = gTwinkleParticles.particles[i]
			local life01 = 1 - (p.age / p.life)
			life01 = clamp01(life01 * life01) -- better fadeout curve.
			local selectedGradIndex = SelectNorm(p.gradient, life01) // 1
			local color = p.gradient[selectedGradIndex]
			local darkerColor = math.max(color - 1, 0)

			if p.twinkleType == "lazerz" then
				local length = p.lazerLength
				local startX = p.x - twinkle_lazer_dir_vector[1] * length
				local startY = p.y - twinkle_lazer_dir_vector[2] * length
				--lineBayer(startX, startY, p.x, p.y, p.gradient, sqrt(life01))
				line(startX, startY, p.x, p.y, p.gradient[selectedGradIndex])
			else
				-- starz type.
				local size = 7 * life01 * p.strength
				hlineBayer(p.x - size, p.x + 1 + size, p.y, p.gradient, life01)
				vlineBayer(p.x, p.y - size, p.y + 1 + size, p.gradient, life01)
			end
		end
	end
end

-- particles orbiting a sprite sphere.
-- render the back pass, then the sprite, then the front pass so the sprite
-- occludes particles passing behind it.
-- not going to reuse the existing particle emitter because it's pretty 2D-focused.

do
	-- options:
	-- {
	--   particleCount = 100, -- number of particles in the orbit effect
	--   orbitRadiusMin = 10,
	--   orbitRadiusMax = 20,
	--   speedMin = 0.01,
	--   speedMax = 0.02,
	--   gradients = {{ }}, -- gradients to select from; each from dark to light. darkest probably won't be used because it's occluded.
	--   biasInclination = 0.0, -- bias the inclination of the orbits towards this value (radians)
	--   biasAscendingNode = 0.0, -- bias the ascending node of the orbits towards this value (radians)
	--   biasMix = 0.99, -- how much to bias the inclination and ascending node towards the bias values (0.0 = no bias, 1.0 = full bias)
	--   renderRadiusMin = 0,
	--   renderRadiusMax = 1.1,
	-- }
	function CreateParticleOrbitEffect(options)
		local biasAmt = options.biasMix or 0.98
		local biasInclination = options.biasInclination or 3.14159 / 2 -- edge-on
		local biasAscendingNode = options.biasAscendingNode or -0.33 -- tilt

		local fx = {
			particleCount = options.particleCount or 100,
			orbitRadiusMin = options.orbitRadiusMin or 10,
			orbitRadiusMax = options.orbitRadiusMax or 20,
			speedMin = options.speedMin or 0.02,
			speedMax = options.speedMax or 0.02,
			gradients = options.gradients or { { 8, 9, 10, 11 } }, -- blue
			renderRadiusMin = options.renderRadiusMin or 0,
			renderRadiusMax = options.renderRadiusMax or 1.1,
			-- calculated params
			biasAmt = biasAmt,
			biasInclination = biasInclination,
			biasAscendingNode = biasAscendingNode,
			-- internal state
			particles = {}, -- running particle list.
			backParticles = {}, -- per-frame cache of back/front particles.
			frontParticles = {},
		}

		for i = 1, fx.particleCount do
			local radiusRnd = math.random()
			local radius = lerpScalar(fx.orbitRadiusMin, fx.orbitRadiusMax, radiusRnd)
			local speed = lerpScalar(fx.speedMin, fx.speedMax, radiusRnd) -- also base on radius; outer particles = faster.
			local phase = math.random() * 6.28

			-- orbit is defined by 2 angles; make it easy to make uniform distributions.
			-- another way to do this would be to
			local inclination = math.random() * 6.28 -- rotation around X (tilt away from screen)
			local ascendingNode = math.random() * 6.28 -- rotation around Z (effectively screen 2D rotation)
			--ascendingNode = lerpAngular(ascendingNode, biasAscendingNode, biasAmt)

			inclination = lerpAngular(inclination, biasInclination, biasAmt)
			ascendingNode = lerpAngular(ascendingNode, biasAscendingNode, biasAmt)

			local particle = {
				radius = radius,
				phase = phase,
				speed = speed,
				gradient = fx.gradients[SelectNorm(fx.gradients, radiusRnd)], -- select a gradient based on the radius
				renderRadiusMin = fx.renderRadiusMin,
				renderRadiusMax = fx.renderRadiusMax,
			}
			table.insert(fx.particles, particle)
		end

		SetParticleOrbitEffectBias(fx, biasInclination, biasAscendingNode, biasAmt)

		return fx
	end

	-- updates the particle positions based on new orbit bias param.
	-- for high particle counts maybe don't do this.
	function SetParticleOrbitEffectBias(fx, biasInclination, biasAscendingNode, biasMix)
		fx.biasInclination = biasInclination
		fx.biasAscendingNode = biasAscendingNode
		fx.biasMix = biasMix
		for _, particle in ipairs(fx.particles) do
			local inclination = random() * 6.28 -- rotation around X (tilt away from screen)
			local ascendingNode = random() * 6.28 -- rotation around Z (effectively screen 2D rotation)

			inclination = lerpAngular(inclination, biasInclination, biasMix)
			ascendingNode = lerpAngular(ascendingNode, biasAscendingNode, biasMix)

			local cosInclination = cos(inclination)
			local sinInclination = sin(inclination)
			local cosNode = cos(ascendingNode)
			local sinNode = sin(ascendingNode)

			-- the full transform (orthographic):
			-- x = r * cos(phase) * cos(node) - r * sin(phase) * sin(node) * cos(incl)
			-- y = r * cos(phase) * sin(node) + r * sin(phase) * cos(node) * cos(incl)
			-- z = r * sin(phase) * sin(incl)
			-- https://en.wikipedia.org/wiki/Perifocal_coordinate_system

			-- precompute what we can
			particle.xCos = particle.radius * cosNode
			particle.xSin = -particle.radius * sinNode * cosInclination
			particle.yCos = particle.radius * sinNode
			particle.ySin = particle.radius * cosNode * cosInclination
			particle.zSin = particle.radius * sinInclination
		end
	end

	function UpdateParticleOrbitEffect(fx)
		fx.backParticles = {}
		fx.frontParticles = {}
		for _, particle in ipairs(fx.particles) do
			-- advance
			particle.phase = (particle.phase + particle.speed) % 6.28

			local cosPhase = math.cos(particle.phase)
			local sinPhase = math.sin(particle.phase)

			-- calc depth:
			local z = particle.zSin * sinPhase -- z = radius * sin(inclination) * sin(phase); in [-radius, radius]
			local depthNormalized = (z / particle.radius) * 0.5 + 0.5
			local colorIndex = SelectNorm(particle.gradient, depthNormalized)

			particle.renderX = (particle.xCos * cosPhase + particle.xSin * sinPhase) // 1
			particle.renderY = (particle.yCos * cosPhase + particle.ySin * sinPhase) // 1
			particle.renderRadius = lerpScalar(particle.renderRadiusMin, particle.renderRadiusMax, depthNormalized)
			particle.depthNormalized = depthNormalized

			if z < 0 then
				table.insert(fx.backParticles, particle)
			else
				table.insert(fx.frontParticles, particle)
			end
		end
	end

	function RenderParticleOrbitEffect(fx, cx, cy, renderFront)
		-- renderFront=false renders the back pass, renderFront=true renders the front
		cx = cx // 1
		cy = cy // 1
		local particles = renderFront and fx.frontParticles or fx.backParticles
		for i = 1, #particles do
			local particle = particles[i]

			-- bayer would be cool for smoother color transitions but it feels too  flickery / distracting.
			--pixBayer(cx + particle.renderX, cy + particle.renderY, fx.gradient, #fx.gradient, particle.depthNormalized)

			local palIndex = SelectNorm(particle.gradient, particle.depthNormalized)
			--pix(cx + particle.renderX, cy + particle.renderY, particle.gradient[palIndex])
			circ(cx + particle.renderX, cy + particle.renderY, particle.renderRadius, particle.gradient[palIndex])
			--circ(cx + particle.renderX, cy + particle.renderY, 1.2, particle.gradient[palIndex])
		end
	end
end -- do

-- convert a sprite into a map from color to list of pixel locations.
-- useful for largely transparent, fixed-on-screen sprites like HUDs or backgrounds.
function createCachedSprite(spr_id, posx, posy)
	local cache = {}
	-- seed the 16-color empty entries.
	for i = 0, 15 do
		cache[i] = {}
	end
	local w = sprites[spr_id].w
	local h = sprites[spr_id].h
	local c = sprites[spr_id].data
	local bkg = sprites[spr_id].bg
	for y = 0, h - 1 do
		local screenY = posy + y
		if screenY >= 0 and screenY < 136 then -- clip to screen
			local srcRow = y * w
			local rowBase = screenY * 240 + posx
			local x0 = max(0, ceil(-posx))
			local x1 = min(w, ceil(240 - posx))
			for x = x0, x1 - 1 do
				local col = c[x + srcRow]
				if col ~= bkg then
					--pix(posx+x,screenY,col)
					--table.insert(cache[col], {posx+x, screenY})
					-- even faster: use POKE
					table.insert(cache[col], rowBase + x)
				end
			end
		end
	end
	return cache
end

function drawCachedSprite(cache)
	for col = 0, 15 do
		local pixels = cache[col]
		for _, pixel in ipairs(pixels) do
			poke4(pixel, col)
		end
	end
end

function drawSprite(spr_id, posx, posy)
	local w = sprites[spr_id].w
	local h = sprites[spr_id].h
	local c = sprites[spr_id].data
	local bkg = sprites[spr_id].bg
	for y = 0, h - 1 do
		local srcRow = y * w
		local screenY = posy + y
		if screenY >= 0 and screenY < 136 then -- clip to screen
			local x0 = max(0, ceil(-posx))
			local x1 = min(w, ceil(240 - posx))
			for x = x0, x1 - 1 do
				local col = c[x + srcRow]
				if col ~= bkg then
					pix(posx + x, screenY, col)
				end
			end
		end
	end
end

function drawSpriteRotated90(spr_id, posx, posy)
	local w = sprites[spr_id].w
	local h = sprites[spr_id].h
	local c = sprites[spr_id].data
	local bkg = sprites[spr_id].bg
	-- todo: screen clip
	for y = 0, h - 1 do
		local srcRow = y * w
		local screenX = posx + (h - y - 1)
		for x = 0, w - 1 do
			local col = c[x + srcRow]
			if col ~= bkg then
				pix(screenX, posy + x, col)
			end
		end
	end
end

function drawSpriteRotated180(spr_id, posx, posy)
	local w = sprites[spr_id].w
	local h = sprites[spr_id].h
	local c = sprites[spr_id].data
	local bkg = sprites[spr_id].bg
	-- todo: screen clip
	for y = 0, h - 1 do
		local srcRow = y * w
		local screenY = posy + (h - y - 1)
		for x = 0, w - 1 do
			local col = c[x + srcRow]
			if col ~= bkg then
				pix(posx + x, screenY, col)
			end
		end
	end
end

function drawSpriteRotated270(spr_id, posx, posy)
	local w = sprites[spr_id].w
	local h = sprites[spr_id].h
	local c = sprites[spr_id].data
	local bkg = sprites[spr_id].bg
	-- todo: screen clip
	for y = 0, h - 1 do
		local srcRow = y * w
		local screenX = posx + y
		for x = 0, w - 1 do
			local col = c[x + srcRow]
			if col ~= bkg then
				pix(screenX, posy + (w - x - 1), col)
			end
		end
	end
end

-- axis-aligned rotation index.
function drawSpriteWithAARotation(spr_id, posx, posy, rotIndex)
	if rotIndex == 0 then
		drawSprite(spr_id, posx, posy)
	elseif rotIndex == 1 then
		drawSpriteRotated90(spr_id, posx, posy)
	elseif rotIndex == 2 then
		drawSpriteRotated180(spr_id, posx, posy)
	elseif rotIndex == 3 then
		drawSpriteRotated270(spr_id, posx, posy)
	end
end

function drawSpriteWithShadeFn(spr_id, posx, posy, shadeFn)
	local w = sprites[spr_id].w
	local h = sprites[spr_id].h
	local c = sprites[spr_id].data
	local bkg = sprites[spr_id].bg
	for y = 0, h - 1 do
		local srcRow = y * w
		local screenY = posy + y
		if screenY >= 0 and screenY < 136 then -- clip to screen
			local x0 = max(0, ceil(-posx))
			local x1 = min(w, ceil(240 - posx))
			for x = x0, x1 - 1 do
				local col = c[x + srcRow]
				if col ~= bkg then
					local c = shadeFn(x, y, col)
					if c ~= nil then
						pix(posx + x, screenY, c)
					end
				end
			end
		end
	end
end

-- modulates colors with a provided map. the map is assumed to hold 16 entries one for each palette entry.
-- when t = 0, uses original color.
-- at t = 1, uses mapped color.
-- in between, dithers.
function drawSpriteWithMappedColors(spr_id, posx, posy, colorMap, t)
	t = clamp01(t)
	drawSpriteWithShadeFn(spr_id, posx, posy, function(x, y, col)
		local bayer = BAYER_MINUS_5[(posy + y) * 240 + (posx + x)]
		if t + bayer >= 0.5 then
			return colorMap[col + 1]
		end
		return col
	end)
end

-- draws a sprite, faded. each palett index maps to its own darkening gradient.
-- for each palette entry, a gradient where 0 = black, 1 = original color.
G_DarkeningGradients = {
	{ 0, 0 }, -- 0 = black,
	{ 0, 1 }, -- 1 = dark red.
	{ 0, 1, 2 }, -- 2 = red
	{ 0, 1, 2, 3 }, -- 3 = orange
	{ 0, 1, 2, 3, 4 }, -- 4 = yellow
	{ 0, 15, 7, 6, 5 }, -- 5 = bright green
	{ 0, 15, 7, 6 }, -- 6 = green
	{ 0, 15, 7 }, -- 7 = dark/hunter green
	{ 0, 8 }, -- 8 = dark blue
	{ 0, 8, 9 }, -- 9 = blue
	{ 0, 8, 9, 10 }, -- 10 = light blue
	{ 0, 8, 9, 10, 11 }, -- 11 = cyan
	{ 0, 15, 14, 13, 12 }, -- 12 = white
	{ 0, 15, 14, 13 }, -- 13 = light gray
	{ 0, 15, 14 }, -- 14 = gray
	{ 0, 15 }, -- 15 = dark gray
}

-- function drawSpriteWithFadeIn(spr_id, posx, posy, t)
-- 	t = clamp01(t)
-- 	drawSpriteWithShadeFn(spr_id, posx, posy, function(x, y, col)
-- 		return col
-- 	end)
-- end

function drawSpriteWithFadeIn(spr_id, posx, posy, t)
	t = clamp01(t)
	drawSpriteWithShadeFn(spr_id, posx, posy, function(x, y, col)
		local gradient = G_DarkeningGradients[col + 1]
		local gradientCount = #gradient
		local gradientPos = t * (gradientCount - 1)
		local gradientIndex = (gradientPos // 1) + 1
		local color = gradient[gradientIndex]
		if gradientIndex == gradientCount then
			return color
		end

		local bayer = BAYER_MINUS_5[(posy + y) * 240 + (posx + x)]
		if gradientPos - (gradientIndex - 1) + bayer >= 0.5 then
			return gradient[gradientIndex + 1]
		end
		return color
	end)
end

function drawDoorOpenAnim(t, st, et, x, y)
	local idx = 11
	if t <= st then
		t = st
	end
	if t >= et then
		t = et
	end
	local door_id = 11 - 10 * ((t - st) / (et - st)) // 1
	--print(door_id,0,0,12)
	local spr_id = "F1_Door_" .. string.format("%02d", door_id)
	local w = sprites[spr_id].w
	local h = sprites[spr_id].h
	local tw = 53
	local th = 64
	local ox = x + (tw - w) / 2
	local oy = y + (th - h)
	drawSprite(spr_id, ox, oy)
	-- door light
	local doorlight_id = door_id // 2 + 1
	--print(doorlight_id,0,0,12)
	if doorlight_id <= 5 then
		local sprl_id = "F1_DoorLight_" .. string.format("%02d", doorlight_id)
		local dw = sprites[sprl_id].w
		local dh = sprites[sprl_id].h
		local tdw = 46
		local tdh = 46
		local dx = x - 40 + (tdw - dw)
		local dy = oy
		drawSprite(sprl_id, dx, dy)
	end
end

function drawSpriteD(spr_id, spr_id2, x, y)
	local posx = x
	local posy = y
	local w = sprites[spr_id].w
	local h = sprites[spr_id].h
	local c = sprites[spr_id].data
	local c2 = sprites[spr_id2].data
	local bkg = sprites[spr_id].bg
	for x = 0, w - 1 do
		for y = 0, h - 1 do
			local idx = x + y * w
			local col = c[idx]
			local col2 = c2[idx]
			if col ~= bkg then
				local dx = (posx + x) // 1
				local dy = (posy + y) // 1
				local dc = col
				if (dx / 2 + 20 + math.sin(dy * dx / 12 + (20000 - time()) / 800) * 30) / 70 > 1 then
					dc = col2
				end
				pix(dx, dy, dc)
			end
		end
	end
end

function stars_side(t, x, y)
	for i = 0, 50 do
		circ(
			(math.random(240) + x) % 240,
			(math.random(136) + y) % 136,
			math.random() * 1.5,
			(4 + math.random(2) // 1 * 8) * math.abs(math.sin(t / math.random(10000)) // 1)
		)
	end
end

local F01_flickerSlewRate = 0.16

local F01_flickers = {
	1,
	1,
	1,
}

function Frame01(tt, demoBeats, somaticState, sceneTiming)
	local dooropen = 20000
	local t = sceneTiming.demoMillis
	local sceneX = t / 105
	local sceneY = -t / 75
	if sceneX > 220 then
		sceneX = 220
	end
	if sceneY < -310 then
		sceneY = -310
	end

	vbank(0)
	cls()
	math.randomseed(7)
	stars_side(1000 + t, -sceneX, -sceneY)

	math.randomseed(t)

	local posGateX = 310 - sceneX
	local posGateY = -310 - sceneY
	local posShipX = 65 - sceneX + t / 76
	local posShipY = 50 + math.sin(t / 8000) * 2 - sceneY - t / 75
	tri(posGateX - 40, posGateY, 240, 0, 240, 136, 0)
	drawSprite("F1_BgDither", posGateX - 40, posGateY)
	drawDoorOpenAnim(t, dooropen, dooropen + 1600, posGateX + 53, posGateY + 22)

	-- draw under to get black over stars
	if t < (dooropen + 200) then
		drawSprite("F1_Ship01", posShipX, posShipY)
	end

	vbank(1)
	cls()
	if t < (dooropen + 200) then
		drawSprite("F1_Ship01", posShipX, posShipY)
	else
		drawSprite("F1_Ship02", posShipX, posShipY)
	end
	--else
	-- drawSprite("Ship02",posShipX,posShipY)
	--end
	-- left throttle
	circ(posShipX + 2, 18 + posShipY, math.random(2), math.random(3) + 1)
	circ(posShipX, 20 + posShipY, math.random(2), math.random(2) + 1)
	-- right throttle
	circ(posShipX + 9, 23 + posShipY, math.random(3), math.random(3) + 1)
	circ(posShipX + 7, 25 + posShipY, math.random(2), math.random(2) + 1)

	-- mask the sprite entereing the hangar
	drawSprite("F1_GateMask", posGateX - 39, posGateY)

	local rowmatch = {
		{ 0, 4 },
		{ 0, 5 },
		{ 0, 7 },
		{ 0, 10 },
		{ 0, 11 },
		{ 0, 12 },
		{ 0, 17 },
		{ 0, 22 },
		{ 0, 23 },
		{ 0, 24 },
		{ 0, 28 },
		{ 0, 29 },
		{ 0, 31 },
		{ 0, 34 },
		{ 0, 35 },
		{ 0, 36 },
		{ 0, 37 },
		{ 0, 39 },
		{ 0, 42 },
		{ 0, 43 },
		{ 0, 44 },
		{ 0, 48 },
		{ 0, 49 },
		{ 0, 51 },
		{ 0, 54 },
		{ 0, 55 },
		{ 0, 56 },
		{ 0, 60 },
		{ 0, 61 },
		{ 0, 63 },
		{ 1, 0 },
		{ 1, 1 },
		{ 1, 3 },
		{ 1, 6 },
		{ 1, 7 },
		{ 1, 8 },
		{ 1, 13 },
		{ 1, 18 },
		{ 1, 19 },
		{ 1, 20 },
		{ 1, 24 },
		{ 1, 25 },
		{ 1, 27 },
		{ 1, 30 },
		{ 1, 31 },
		{ 1, 32 },
		{ 1, 37 },
		{ 1, 39 },
		{ 1, 42 },
		{ 1, 43 },
		{ 1, 44 },
		{ 1, 48 },
		{ 1, 49 },
		{ 1, 51 },
		{ 1, 54 },
		{ 1, 55 },
		{ 1, 56 },
		{ 1, 60 },
		{ 1, 61 },
		{ 1, 63 },
		{ 2, 0 },
		{ 2, 1 },
		{ 2, 3 },
		{ 2, 6 },
		{ 2, 7 },
		{ 2, 8 },
		{ 2, 13 },
		{ 2, 18 },
		{ 2, 19 },
		{ 2, 20 },
		{ 2, 24 },
		{ 2, 25 },
		{ 2, 27 },
		{ 2, 30 },
		{ 2, 31 },
		{ 2, 32 },
		{ 2, 37 },
		{ 2, 39 },
		{ 2, 42 },
		{ 2, 43 },
		{ 2, 44 },
		{ 2, 48 },
		{ 2, 49 },
		{ 2, 51 },
		{ 2, 54 },
		{ 2, 55 },
		{ 2, 56 },
		{ 2, 60 },
		{ 2, 61 },
		{ 2, 63 },
		{ 3, 32 },
		{ 3, 37 },
		{ 3, 39 },
		{ 3, 42 },
		{ 3, 43 },
		{ 3, 44 },
		{ 3, 48 },
		{ 3, 49 },
	}

	local pat = somaticState.demoPatternIndex
	local row = somaticState.demoPatternRow

	if t < 1200 then
		-- fade in the logos.
		local transitionStart = 500
		local transitionEnd = 1200
		local t01 = (t - transitionStart) / (transitionEnd - transitionStart) -- rev lerp
		t01 = clamp01(t01)
		t01 = t01 * t01 * t01
		drawSpriteWithFadeIn("F1_Logo02", 12, 74, t01)
		drawSpriteWithFadeIn("F1_Logo", 12, 104, t01)
		drawSpriteWithFadeIn("F1_LogoBackdrop", 0, 4, t01)
	else
		local drawlogo2 = true
		local drawlogo = true
		local drawback = true
		for i = 1, #rowmatch do
			dp = rowmatch[i]
			if (dp[1] == pat) and (dp[2] == row) then
				local witch = i % 3
				if witch == 0 then
					drawlogo2 = false
				end
				if witch == 1 then
					drawlogo = false
				end
				drawback = false
				break
			end
		end

		F01_flickers[1] = UpdateSlewedScalar(F01_flickers[1], drawlogo2 and 1 or 0.8, F01_flickerSlewRate)
		F01_flickers[2] = UpdateSlewedScalar(F01_flickers[2], drawlogo and 1 or 0.6, F01_flickerSlewRate)
		F01_flickers[3] = UpdateSlewedScalar(F01_flickers[3], drawback and 1 or 0.7, F01_flickerSlewRate)

		if F01_flickers[1] > 0.9 then
			C03_DrawSpriteStripped("F1_Logo02", 12, 74, t)
		else
			drawSpriteWithFadeIn("F1_Logo02", 12, 74, F01_flickers[1])
		end

		if F01_flickers[2] > 0.9 then
			C03_DrawSpriteStripped("F1_Logo", 12, 104, t + 2000)
		else
			drawSpriteWithFadeIn("F1_Logo", 12, 104, F01_flickers[2])
		end

		drawSpriteWithFadeIn("F1_LogoBackdrop", 0, 4, F01_flickers[3])
	end

	TwinkleTick(somaticState, "starz")

	vbank(0)
end

function rotate(points, pitch, roll, yaw)
	local cosa = math.cos(yaw)
	local sina = math.sin(yaw)

	local cosb = math.cos(pitch)
	local sinb = math.sin(pitch)

	local cosc = math.cos(roll)
	local sinc = math.sin(roll)

	local Axx = cosa * cosb
	local Axy = cosa * sinb * sinc - sina * cosc
	local Axz = cosa * sinb * cosc + sina * sinc

	local Ayx = sina * cosb
	local Ayy = sina * sinb * sinc + cosa * cosc
	local Ayz = sina * sinb * cosc - cosa * sinc

	local Azx = -sinb
	local Azy = cosb * sinc
	local Azz = cosb * cosc

	local px = points[1]
	local py = points[2]
	local pz = points[3]

	local ox = Axx * px + Axy * py + Axz * pz
	local oy = Ayx * px + Ayy * py + Ayz * pz
	local oz = Azx * px + Azy * py + Azz * pz

	return { ox, oy, oz }
end

F02_orbits = nil
F02_previousI = -1
F02_idOverride = nil
F02_showShip = true

function Frame02_init()
	cls()
	vbank(1)
	cls()
	vbank(0)

	F02_previousI = -1
end

F02_planetSprites = {
	"Planet_01",
	"Planet_02",
	"Planet_03",
	"Planet_04",
}
F02_shipSprites = {
	"Ship_01",
	"Ship_02",
	"Ship_03",
	"Ship_04",
}

local F02_darkBlue = { 8 }
local F02_grayscaleDarker = { 15, 14 }
local F02_grayscale = { 15, 15, 15, 14, 14, 13 } -- grayscale (+12 bright white)
local F02_greenDarker = { 7 } -- exclude the bright green. for inner orbits it creates better contrast with the planet.
local F02_green = { 15, 15, 15, 7, 7, 7, 6, 6, 5 }

F02_orbitEffectParams = {
	{
		particleCount = 500,
		orbitRadiusMin = 50,
		orbitRadiusMax = 65,
		speedMin = -0.003,
		speedMax = 0.003,
		gradients = { F02_grayscaleDarker, F02_grayscale },
		biasMix = 0.99,
		biasInclination = 1.65,
		biasAscendingNode = 0.25,
	},
	{ -- green planet. dense and slow
		particleCount = 1500,
		orbitRadiusMin = 44,
		orbitRadiusMax = 68,
		speedMin = 0.000,
		speedMax = 0.004,
		gradients = { F02_greenDarker, F02_green },
		biasMix = 0.98,
		biasInclination = 1.65,
		biasAscendingNode = -0.13,
	},
	{
		-- charcoal planet that looks like a volleyball. maybe a thin sparse ring.
		-- but the planet doesn't rotate so too much rotation feels off.
		particleCount = 150,
		orbitRadiusMin = 55,
		orbitRadiusMax = 72,
		speedMin = -0.001,
		speedMax = 0.02,
		gradients = { F02_grayscale },
		biasMix = 0.99,
		biasInclination = 1.4,
		biasAscendingNode = 0,
	},
	{ -- green again. some middle ground.
		particleCount = 500,
		orbitRadiusMin = 50,
		orbitRadiusMax = 60,
		speedMin = 0.001,
		speedMax = 0.002,
		gradients = { F02_greenDarker, F02_green },
		biasMix = 0.99,
		biasInclination = 1.65,
		biasAscendingNode = 0.1,
	},
}

function Frame02(t, beats, somaticState)
	cls()

	local id = F02_idOverride or (beats // 8 % 4)

	-- when id switches, create new orbit effect.
	if F02_previousI ~= id then
		F02_previousI = id
		local param = F02_orbitEffectParams[id + 1]
		F02_orbits = CreateParticleOrbitEffect(param)
	end

	-- idea is to animate the orbit plane but it's maybe just too many slow things moving around, and messes with
	-- the fact that the planet itself is stationary.
	SetParticleOrbitEffectBias(
		F02_orbits,
		F02_orbits.biasInclination + somaticState.wallDeltaMillis / 1000 * 0.02,
		F02_orbits.biasAscendingNode,
		F02_orbits.biasMix
	)

	UpdateParticleOrbitEffect(F02_orbits)

	math.randomseed(id)
	local r = 500
	for i = 0, 700 do
		-- random generate points on a sphere
		local u = math.random() * 2 - 1
		local theta = math.random() * 2 * math.pi
		local x = r * math.sqrt(1 - u * u) * math.cos(theta)
		local y = r * math.sqrt(1 - u * u) * math.sin(theta)
		local z = r * u
		-- rotate them
		local drag = (math.sin(t / 2000) * 0.5 + 1) * 0.02
		local rp = rotate({ x, y, z }, t / 2000, t / 3200, t / 1800)
		local rpb = rotate({ x, y, z }, t / 2000 + drag, t / 3200 + drag, t / 1800 + drag)
		-- project them to viewport
		if rp[3] < 0 and rpb[3] < 0 then
			local screenX = 120 + (rp[1] / -rp[3]) * 240
			local screenY = 68 + (rp[2] * 1.7647 / -rp[3]) * 136
			local screenX2 = 120 + (rpb[1] / -rpb[3]) * 240
			local screenY2 = 68 + (rpb[2] * 1.7647 / -rpb[3]) * 136
			--pix(screenX,screenY,12)
			--pix(screenX2,screenY2,4)
			line(screenX, screenY, screenX2, screenY2, 12)
		end
	end

	local sx = math.sin(t / 2000) * 3
	local sy = math.sin(t / 1800 + 1234 + sx) * 4
	-- draw planet and spaceship

	RenderParticleOrbitEffect(F02_orbits, 35 + 86, 35 + 30, false)

	drawSprite(F02_planetSprites[id + 1], 86, 30)

	RenderParticleOrbitEffect(F02_orbits, 35 + 86, 35 + 30, true)

	if F02_showShip then
		drawSprite(F02_shipSprites[id + 1], 80 + sx, 20 + sy)
	end

	TwinkleTick(somaticState, "starz")
end

-- for each palette entry, provide a darker color.
F03_shadowMap = {
	0, -- black = black.
	0,
	1,
	2,
	3, -- red-yellow gradient.
	6,
	7,
	15, -- green. dark green doesn't really exist; use gray.
	--entry index 8.
	0,
	8,
	9,
	10, -- blue.
	13,
	14,
	15,
	0,
}

function drawShadowSprite(spr_id, x, y)
	local posx = x
	local posy = y
	local w = sprites[spr_id].w
	local h = sprites[spr_id].h
	local c = sprites[spr_id].data
	local bkg = sprites[spr_id].bg
	for y = 0, h - 1 do
		local screenY = posy + y
		if screenY >= 0 and screenY < 136 then
			local srcRow = y * w
			local screenRow = screenY * 240
			local x0 = max(0, ceil(-posx))
			local x1 = min(w, ceil(240 - posx))
			for x = x0, x1 - 1 do
				local col = c[srcRow + x]
				if col ~= bkg then
					-- pix(posx+x,posy+y,col)
					local sx = posx + x
					local sy = posy + y
					local p = sx + sy * 240
					local col = peek4(p)
					local bayer = BAYER_MINUS_5[p]
					if bayer > 0 then
						poke4(p, F03_shadowMap[col + 1])
					end
				end
			end
		end
	end
end

function drawFrame03_Ship(t, x, y)
	local mode = 1 --t//30%3
	--if mode > 0 then
	drawShadowSprite("Frame03_Ship_Shadow", x, y + 80, mode)
	--end
	drawSprite("ContainerGrey", x, y + 22)
	drawSprite("Frame03_Ship", x, y)
	--left
	local jet_id1 = t // 60 % 3 + 1 -- math.random(2)+1
	local spr_id1 = "Jet_Sprite_" .. string.format("%02d", jet_id1)
	drawSprite(spr_id1, x - 18, y + 35)
	--right
	local jet_id2 = (t // 60 + 1) % 3 + 1 -- math.random(2)+1
	local spr_id2 = "Jet_Sprite_" .. string.format("%02d", jet_id2)
	drawSprite(spr_id2, x + 10, y + 52)
end

function drawIsoSlab(posx, posy, uy, ux, c)
	local wx = 10
	local wy = 7
	local t1x = posx
	local t1y = posy
	local t2x = posx - wx * ux
	local t2y = posy + wy * ux
	local t3x = posx + wx * uy
	local t3y = posy + wy * uy
	local t4x = posx + wx * (uy - ux)
	local t4y = posy + wy * (uy + ux)

	tri(t1x, t1y, t2x, t2y, t3x, t3y, c)
	tri(t2x, t2y, t3x, t3y, t4x, t4y, c)

	if math.random() < 0.4 then
		line(t1x, t1y + 2, t2x + 4, t2y, 0)
	end
	if math.random() < 0.4 then
		line(t1x, t1y + 3, t3x - 1, t3y + 3, 0)
	end
	if math.random() < 0.2 then
		line((t1x + t2x) / 2 + 2, (t1y + t2y) / 2, (t3x + t4x) / 2, (t3y + t4y) / 2 - 2, 0)
	end
	if math.random() < 0.2 then
		line((t4x + t2x) / 2, (t4y + t2y) / 2 + 2, (t3x + t1x) / 2, (t3y + t1y) / 2, 0)
	end
end

local slabs = {
	{ 50, 50, 4, 6, 7 },
	{ 140, 50, 7, 6, 8 },
	{ 10, 0, 5, 4, 8 },
	{ 55, -35, 5, 4, 9 },
	{ 160, -30, 12, 6, 9 },
	{ 110, -90, 6, 6, 2 },
	{ 300, -180, 5, 10, 7 },
	{ 410, -180, 10, 8, 8 },
	{ 230, -80, 5, 6, 6 },
	{ 290, -40, 10, 6, 7 },
	{ 360, -90, 2, 4, 2 },
	{ 300, -300, 10, 8, 6 },
	--{496,-290,3,17,7},
	--{570,-290,8,7,2},
	{ 450, -230, 4, 5, 6 },
	{ 600, -200, 5, 8, 2 },
	{ 570, -240, 3, 10, 9 },
	--{420,-450,6,2,9},
}

local Frame03_sprites = {
	{ "ContainerRed", 280, -130, 1 },
	{ "ContainerGrey", 350, -80, 1 },
	{ "ContainerRed", 640, -230, 1 },
	{ "ContainerSmall_01", 140, -120, 1 },
	{ "ContainerSmall_01", 170, -100, 1 },
	{ "Beam", 250, -200, 2 },
}

function Frame03(t, demoBeats, somaticState)
	cls()
	math.randomseed(1)

	local tt = 1
	-- draw slabs
	for i = 1, #slabs do
		-- update
		slabs[i][1] = slabs[i][1] - tt
		if slabs[i][1] < -100 then
			slabs[i][1] = slabs[i][1] + 500
		end
		slabs[i][2] = slabs[i][2] + tt * 0.7
		if slabs[i][2] > 140 then
			slabs[i][2] = slabs[i][2] - 500 * 0.7
		end

		-- draw
		local posx = slabs[i][1]
		local posy = slabs[i][2]
		local ux = slabs[i][3]
		local uy = slabs[i][4]
		local c = slabs[i][5]
		drawIsoSlab(posx, posy, ux, uy, c)
	end

	drawSprite("BgDitterTop", 0, 0)
	drawSprite("BgDitterBottom", 240 - 90, 136 - 58)

	-- draw sprites
	for i = 1, #Frame03_sprites do
		-- update
		Frame03_sprites[i][2] = Frame03_sprites[i][2] - tt * Frame03_sprites[i][4]
		if Frame03_sprites[i][2] < -100 then
			Frame03_sprites[i][2] = Frame03_sprites[i][2] + 500
		end
		Frame03_sprites[i][3] = Frame03_sprites[i][3] + tt * Frame03_sprites[i][4] * 0.7
		if Frame03_sprites[i][3] > 140 then
			Frame03_sprites[i][3] = Frame03_sprites[i][3] - 500 * 0.7
		end

		-- draw
		if Frame03_sprites[i][1] ~= "Beam" then
			drawSprite(Frame03_sprites[i][1], Frame03_sprites[i][2], Frame03_sprites[i][3])
		end
	end

	local shipPosX = 70
	local shipPosY = 30

	drawFrame03_Ship(t, shipPosX, shipPosY)
	TwinkleTick(somaticState, "lazerz")

	drawSprite("Beam", Frame03_sprites[#Frame03_sprites][2], Frame03_sprites[#Frame03_sprites][3])
end

-- falling stars
-- function stars(t)
-- 	for p = 1, 3 do
-- 		local speed = ((p + 1) / 400)
-- 		for i=0,50 do
-- 			circ((math.random(240) - t * 0.4 * speed) % 240, -- a bit of side mvmt feels more cinematic; nice contrary mvmt to the ships & clouds
-- 				(math.random(136) + t * speed)%136,
-- 				math.random()*1.5,
-- 				(4+math.random(2)//1*8)*math.abs(math.sin(t/math.random(10000))//1) -- twinkle
-- 				)
-- 		end
-- 	end
-- end

F4ships = nil
F4starfield = nil

F4shipsDefaults = {
	{ "F4_Ship02", 10, 130, 0.14, -0.3, { 1, 18, -18, 38, 7, 18, -20, 40 } },
	{ "F4_Ship03", 80, 160, 0.16, -0.3, { 1, 30, -18, 38, 11, 30, -20, 40 } },
	{ "F4_Ship01", 70, 160, 0.1, -0.4, { 2, 40, -12, 50, 27, 42, -12, 50 } },
}

clouds = {}
maxclouds = 3000
cloudAngleBiasAmt01 = 0.4 -- how much bias to mix

-- similar to clouds
trailClouds = {}
trailCloudAngleBiasAmt01 = 0.9 -- how much bias to mix
trialGradient = { 8, 1, 2, 3, 4 }

function Frame04_init()
	math.randomseed(1000)
	clouds = {}
	trailClouds = {}
	F4ships = deepcopy(F4shipsDefaults)
	F4starfield = CreateStarField({
		numParallaxLayers = 4,
		density = 10,
		dxMin = -0.01,
		dxMax = -0.02,
		radiusMin = 0.5,
		radiusMax = 1,
	})

	-- calc ship trajectory angles so clouds can follow
	for i = 1, #F4ships do
		F4ships[i][7] = math.atan2(F4ships[i][5], F4ships[i][4])
	end
end

function Frame04(t)
	cls()

	local tt = 1

	--math.randomseed(1000)
	--stars(t)
	UpdateStarField(F4starfield)
	RenderStarField(F4starfield, t)

	math.randomseed(t)

	for i = 1, #clouds do
		-- render clouds
		circ(clouds[i][1], clouds[i][2], clouds[i][3], clouds[i][4])
	end

	-- render trail clouds
	for i = 1, #trailClouds do
		local cloud = trailClouds[i]
		local age = cloud.age
		-- gradient
		local gradientIndex = math.floor((1 - (age / cloud.lifetime)) * #trialGradient)
		local normAge = age / cloud.lifetime
		circ(
			cloud.x, -- x
			cloud.y, -- y
			(1 - normAge) * 2, -- radius
			trialGradient[math.max(1, math.min(#trialGradient, gradientIndex))] -- color
		)
	end

	-- update clouds
	for i = #clouds, 1, -1 do
		local angleRad = clouds[i][5]
		local speed = clouds[i][6]
		clouds[i][1] = clouds[i][1] + math.cos(angleRad) * speed * tt
		clouds[i][2] = clouds[i][2] + math.sin(angleRad) * speed * tt

		if clouds[i][1] < -10 or clouds[i][1] > 250 or clouds[i][2] < -10 or clouds[i][2] > 150 then
			table.remove(clouds, i) -- oob
		end
	end

	-- update trail clouds
	for i = #trailClouds, 1, -1 do
		local angleRad = trailClouds[i].angle
		local speed = trailClouds[i].speed
		trailClouds[i].x = trailClouds[i].x + math.cos(angleRad) * speed * tt
		trailClouds[i].y = trailClouds[i].y + math.sin(angleRad) * speed * tt

		trailClouds[i].age = trailClouds[i].age + tt -- age
		if
			trailClouds[i].x < -10
			or trailClouds[i].x > 250
			or trailClouds[i].y < -10
			or trailClouds[i].y > 150
			or trailClouds[i].age >= trailClouds[i].lifetime
		then
			table.remove(trailClouds, i) -- oob or ded
		end
	end

	-- update ships
	for i = 1, #F4ships do
		F4ships[i][2] = F4ships[i][2] + F4ships[i][4] * tt
		F4ships[i][3] = F4ships[i][3] + F4ships[i][5] * tt

		drawSprite(F4ships[i][1], F4ships[i][2], F4ships[i][3])

		for j = 1, #F4ships[i][6], 4 do
			-- generate new trail clouds
			if math.random() > 0.5 and #clouds < maxclouds then
				local angleBiasRadians = F4ships[i][7]
				local ownAngle = (math.random() * 2 * 3.14159)
				local cloudAngle = lerpAngular(ownAngle, angleBiasRadians, trailCloudAngleBiasAmt01)
				trailClouds[#trailClouds + 1] = {
					x = F4ships[i][2] + F4ships[i][6][j],
					y = F4ships[i][3] + F4ships[i][6][j + 1],
					lifetime = 100 + math.random(100),
					age = 0,
					angle = cloudAngle,
					speed = 0.05 + math.random() * 0.15,
				}
			end

			-- generate new gray clouds
			if math.random() > 0.5 and #clouds < maxclouds then
				local angleBiasRadians = F4ships[i][7]
				local cloudOwnAngle = (math.random() * 2 * 3.14159)
				local cloudAngle = lerpAngular(cloudOwnAngle, angleBiasRadians, cloudAngleBiasAmt01)
				clouds[#clouds + 1] = {
					F4ships[i][2] + F4ships[i][6][j],
					F4ships[i][3] + F4ships[i][6][j + 1],
					math.random(4), -- radius
					math.random(12, 14), -- color gradient
					cloudAngle,
					0.02 + math.random() * 0.05, -- speed
				}
			end
		end
	end
end

function stars_noscroll(t)
	for i = 0, 50 do
		circ(
			math.random(240),
			math.random(136),
			math.random() * 1.5,
			(4 + math.random(2) // 1 * 8) * math.abs(math.sin(t / math.random(10000)) // 1)
		)
	end
end

function pBezier(a, t)
	while #a > 1 do
		local b = {}
		for i = 1, #a - 1 do
			b[#b + 1] = lerp(a[i], a[i + 1], t)
		end
		a = b
	end
	return a[1]
end

--[[ drawing controllable pivots, borrowed code from elias
local pivots={{136,77},{68,99},{230,104},{224,2}}
local selection=-1 -- pivot selected (-1 = none, otherwise Lua 1-based index)
local mbt=0        -- mouse button time
local imx,imy=-1,-1 -- store initial mouse position
--]]

local quality = 100 -- curve quality
--[[
function drawBezierCurves(t)

	local mx,my,mb=mouse()

	if mb then
		mbt=mbt+1
	else
		mbt=0
		selection=-1 -- reset selection
	end

	-- first click
	if mbt==1 then
		imx=mx
		imy=my

		-- find the selected pivot (first case)
		selection=-1
		for i,p in ipairs(pivots) do
			if math.sqrt((p[1]-mx)^2+(p[2]-my)^2)<=7 then
				selection=i
				break
			end
		end
	else
		local distToInitial=math.sqrt((imx-mx)^2+(imy-my)^2)
		if distToInitial<2 and mbt==30 then
			-- if there is a pivot selected, destroy it; otherwise, create a new one.
			if selection==-1 then
				if mx>=0 and my>=0 and mx<=239 and my<=135 then
					table.insert(pivots,{mx,my})
					selection=#pivots
				end
			elseif #pivots>1 then
				table.remove(pivots,selection)
				selection=-1
			end
		end
	end

	-- move the selected pivot
	if selection>-1 then
		local omx=math.min(math.max(mx,0),239)
		local omy=math.min(math.max(my,0),135)
		pivots[selection][1]=omx
		pivots[selection][2]=omy
	end

	--cls(0)

	-- draw the connections between each pivot
	for i=2,#pivots do
		line(pivots[i][1],pivots[i][2],pivots[i-1][1],pivots[i-1][2],14)
	end

	local ttt=time()/20%quality//1
	--print(ttt)

	-- draw the curve (terrible)
	local pre = pBezier(pivots,0)
	for i=1,quality do
		local t=i/quality
		local p=pre
		local q=pBezier(pivots,t)
		--linew(p[1],p[2],q[1],q[2],1,.5)
		if i<ttt then line(p[1],p[2],q[1],q[2],9) end
		if i==ttt then line(p[1],p[2],q[1],q[2],11) end
		pre=q
	end

	local dump="pivots={"

	-- draw the pivots
	for i,b in ipairs(pivots) do
		circb(b[1],b[2],7,15)
		dump=dump.."{"..b[1]..","..b[2].."},"
	end
	dump=dump.."}"
	
	-- press space to get a dump of the current changes in pivots
	if keyp(48) then
		trace(dump)
	end

end
--]]

F05_st = 0
F05_traces = true
F05_orbits = nil

F05_darkGrayGradient = { 15, 15, 15, 15, 14 } -- grayscale (+12 bright white)
F05_grayGradient = { 0, 15, 15, 15, 14, 13 } -- grayscale (+12 bright white)
F05_redYellowGradient = { 0, 1, 2, 3, 4 } -- red-yellow
F05_blueGradient = { 8, 8, 8, 8, 9, 9, 10 } -- blue (+11 bright cyan)
F05_greenGradient = { 7, 7, 7, 7, 6, 5 } -- green
F05_greenGradientDarker = { 7, 7, 7, 7, 6 } -- green

F05_justDarkBlue = { 8 }

function Frame05_initShared(traces, gradients)
	poke(0x3FF8, 0) -- border black

	F05_st = time()
	F05_traces = traces or false

	local speed = 0.002
	local orbitRadius = 58

	F05_orbits = CreateParticleOrbitEffect({
		particleCount = 3800,
		orbitRadiusMin = orbitRadius,
		orbitRadiusMax = orbitRadius + 68,
		speedMin = speed * 0.1,
		speedMax = speed,
		gradients = gradients,
		renderRadiusMax = 1,
		biasInclination = 1.45, -- half pi (1.57) = edge-on.
		biasAscendingNode = 0.5,
		biasMix = 1, -- 0.995
	})
end

function Frame05_init()
	-- with trails, use more subtle gradient set.
	Frame05_initShared(true, { F05_justDarkBlue, F05_justDarkBlue, F05_greenGradientDarker })
end

function Frame05_notraces() -- init
	Frame05_initShared(false, { F05_grayGradient, F05_blueGradient, F05_greenGradient })
end

function Frame05b_initShared(traces)
	poke(0x3FF8, 0) -- border black

	F05_st = time()
	F05_traces = traces

	local speed = 0.001 -- 0.015
	local orbitRadius = 71

	F05_orbits = CreateParticleOrbitEffect({
		particleCount = 60,
		orbitRadiusMin = orbitRadius,
		orbitRadiusMax = orbitRadius,
		speedMin = speed,
		speedMax = speed * 1.05,
		gradients = { F05_blueGradient, F05_greenGradient },
		biasMix = 0,
	})
end

function Frame05b_init()
	Frame05b_initShared(true)
end

function Frame05b_notraces() -- init.
	Frame05b_initShared(false)
end

function Frame05(tt, demoBeats, somaticState)
	--Frame05_init()
	local t = tt - F05_st

	UpdateParticleOrbitEffect(F05_orbits)

	cls()

	math.randomseed(1)
	stars_noscroll(t + 10000)

	local planetX = 20 - t / 9000
	local planetY = 20
	local planetOffsetX, planetOffsetY = 49, 49

	RenderParticleOrbitEffect(F05_orbits, planetX + planetOffsetX, planetY + planetOffsetY, false)

	drawSprite("F5_PlanetBG_02", planetX, planetY)

	RenderParticleOrbitEffect(F05_orbits, planetX + planetOffsetX, planetY + planetOffsetY, true)

	drawSprite("F5_Ship01", 100 + t / 3000, 40 - t / 8000)

	if F05_traces then
		local curves = {
			{ st = 0, pivots = { { 136, 77 }, { 68, 99 }, { 230, 104 }, { 224, 2 } } },
			{ st = 1900, pivots = { { 136, 77 }, { 74, 74 }, { 19, 26 }, { 8, 0 } } },
			{ st = 2100, pivots = { { 137, 78 }, { 68, 99 }, { 0, 100 }, { 79, 240 } } },
			{ st = 2300, pivots = { { 136, 77 }, { 77, 119 }, { 191, 103 }, { 239, 135 } } },
			{ st = 2500, pivots = { { 134, 76 }, { 54, 97 }, { 131, 126 }, { 239, 59 } } },
			{ st = 3500, pivots = { { 136, 77 }, { 26, 95 }, { 20, 26 }, { 165, 0 } } },
			{ st = 4900, pivots = { { 136, 77 }, { 84, 74 }, { 119, 26 }, { 108, 0 } } },
			{ st = 5100, pivots = { { 137, 78 }, { 98, 99 }, { 0, 100 }, { 179, 140 } } },
			{ st = 5300, pivots = { { 136, 77 }, { 97, 119 }, { 121, 103 }, { 9, 0 } } },
			{ st = 5500, pivots = { { 134, 76 }, { 34, 97 }, { 31, 26 }, { 23, 159 } } },
		}

		for c = 1, #curves do
			local st = curves[c].st
			local piv = curves[c].pivots
			local tt = (t - st) / 30 // 1
			if t > st and t < (st + 8000) then
				local pre = pBezier(piv, 0)
				for i = 1, quality do
					local t = i / quality
					local p = pre
					local q = pBezier(piv, t)
					if i < tt then
						line(p[1], p[2], q[1], q[2], 9)
					end
					if i == tt then
						line(p[1], p[2], q[1], q[2], 11)
						--circ(p[1],p[2],2,12)
					end
					pre = q
				end
			end
		end
	end

	TwinkleTick(somaticState, "starz")
end

function Frame05b(tt)
	--Frame05_init()
	local t = tt - F05_st

	UpdateParticleOrbitEffect(F05_orbits)

	cls()

	math.randomseed(18)
	stars_noscroll(t + 10000)

	local planetX, planetY = 240 - 59, 136 - 41
	local planetOffsetX, planetOffsetY = 65 - 4, 69 - 4

	RenderParticleOrbitEffect(F05_orbits, planetX + planetOffsetX, planetY + planetOffsetY, false)

	drawSprite("F5_PlanetBG", planetX, planetY)
	RenderParticleOrbitEffect(F05_orbits, planetX + planetOffsetX, planetY + planetOffsetY, true)

	drawSprite("F5_Ship02", 62 - t / 8000, 100)

	if F05_traces then
		local curves_b = {
			{ st = 0, pivots = { { 77, 109 }, { 9, 119 }, { 36, 77 }, { 68, 99 }, { 230, 104 }, { 224, -30 } } },
			{ st = 600, pivots = { { 77, 109 }, { 9, 89 }, { 36, 77 }, { 74, 74 }, { 19, 26 }, { 8, -30 } } },
			{ st = 1200, pivots = { { 77, 109 }, { 7, 120 }, { 68, 99 }, { 191, -30 } } },
			{ st = 1800, pivots = { { 77, 109 }, { 2, 100 }, { 77, 19 }, { 191, 103 }, { 259, 135 } } },
			{ st = 3400, pivots = { { 77, 109 }, { 9, 119 }, { 34, 76 }, { 54, 97 }, { 131, 126 }, { 249, 59 } } },
			{ st = 4000, pivots = { { 77, 109 }, { 9, 119 }, { 36, 77 }, { 26, 95 }, { 20, 26 }, { 165, -40 } } },
			{ st = 4600, pivots = { { 77, 110 }, { 9, 119 }, { 6, 97 }, { 68, 99 }, { 230, 102 }, { 224, 140 } } },
			{ st = 5200, pivots = { { 77, 110 }, { 2, 69 }, { 36, 17 }, { 74, 174 }, { 219, 126 } } },
		}

		for c = 1, #curves_b do
			local st = curves_b[c].st
			local piv = curves_b[c].pivots
			local tt = (t - st) / 30 // 1
			if t > st and t < (st + 8000) then
				local pre = pBezier(piv, 0)
				for i = 1, quality do
					local t = i / quality
					local p = pre
					local q = pBezier(piv, t)
					if i < tt then
						line(p[1], p[2], q[1], q[2], 9)
					end
					if i == tt then
						line(p[1], p[2], q[1], q[2], 11)
						--circ(p[1],p[2],2,12)
					end
					pre = q
				end
			end
		end
	end
end

function dust(x, y, seed, c)
	dx = x + math.sin(time() / 1000 + seed) * 25 + math.sin(time() / 500 + 11 + seed) * 20
	dy = y + math.sin(time() / 1000 + seed) * 10 + math.sin(time() / 800 + 1 + seed) * 20
	pix(dx, dy, c)
end

F06_st = 0

function Frame06_init()
	F06_st = time()
	cls(3)
	--drawSprite("F6_BG_Ditter",0,0)
end

function Frame06(tt)
	--cls(3)
	drawSprite("F6_Ship", 0, 0)
	drawSprite("F6_BG_Ditter", 0, 0)

	local paths = {
		{ st = 0, endt = 2000, pivots = { { 130, 73, 30 }, { 140, 86, 20 }, { 149, 93, 10 }, { 240, 38, 0 } } },
		{ st = 0, endt = 2000, pivots = { { 129, 73, 30 }, { 139, 86, 20 }, { 148, 93, 10 }, { 204, 136, 0 } } },
		{ st = 0, endt = 2000, pivots = { { 128, 73, 30 }, { 138, 86, 20 }, { 147, 93, 10 }, { 38, 136, 0 } } },

		{ st = 0, endt = 2200, pivots = { { 130, 73, 30 }, { 140, 86, 20 }, { 159, 103, 10 }, { 240, 54, 0 } } },
		{ st = 0, endt = 2200, pivots = { { 129, 73, 30 }, { 139, 86, 20 }, { 158, 103, 10 }, { 201, 136, 0 } } },
		{ st = 0, endt = 2200, pivots = { { 128, 73, 30 }, { 138, 86, 20 }, { 157, 103, 10 }, { 78, 136, 0 } } },

		{ st = 1200, endt = 3600, pivots = { { 131, 73, 30 }, { 141, 86, 20 }, { 160, 103, 5 }, { 160, 123, 5 }, {
			160,
			136,
			0,
		} } },
		{ st = 1200, endt = 3600, pivots = { { 129, 73, 30 }, { 139, 86, 20 }, { 158, 103, 5 }, { 158, 123, 5 }, {
			128,
			136,
			0,
		} } },
		{ st = 1200, endt = 3600, pivots = { { 127, 73, 30 }, { 137, 86, 20 }, { 156, 103, 5 }, { 156, 123, 5 }, {
			156,
			136,
			0,
		} } },

		{ st = 2200, endt = 3600, pivots = { { 131, 73, 30 }, { 141, 86, 20 }, { 160, 103, 5 }, { 180, 103, 5 }, {
			240,
			103,
			0,
		} } },
		{ st = 2200, endt = 3600, pivots = { { 129, 73, 30 }, { 139, 86, 20 }, { 158, 105, 5 }, { 178, 105, 5 }, {
			240,
			105,
			0,
		} } },
		{ st = 2200, endt = 3600, pivots = { { 127, 73, 30 }, { 137, 86, 20 }, { 156, 103, 5 }, { 176, 103, 5 }, {
			240,
			136,
			0,
		} } },

		{ st = 3600, endt = 5200, pivots = { { 130, 73, 30 }, { 140, 86, 20 }, { 159, 103, 10 }, { 240, 54, 0 } } },
		{ st = 3600, endt = 5200, pivots = { { 129, 73, 30 }, { 139, 86, 20 }, { 158, 103, 10 }, { 213, 136, 0 } } },
		{ st = 3600, endt = 5200, pivots = { { 128, 73, 30 }, { 138, 86, 20 }, { 157, 103, 10 }, { 78, 136, 0 } } },
	}

	local linegrad = { 1, 4, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2 }

	local t = tt - F06_st
	for p = 1, #paths do
		local linestart = paths[p].st
		local lineend = paths[p].endt
		local linepath = paths[p].pivots
		if t > linestart and t < lineend + 1000 then
			local st = lineend - linestart
			local pt = t - linestart
			local steps = 0
			for i = 1, #linepath - 1 do
				steps = steps + linepath[i][3]
			end

			local cstep = (pt / st) * steps // 1

			local count = 1
			local lastx = linepath[1][1]
			local lasty = linepath[1][2]

			for i = 1, #linepath - 1 do
				local refx = (linepath[i + 1][1] - linepath[i][1]) / linepath[i][3]
				local refy = (linepath[i + 1][2] - linepath[i][2]) / linepath[i][3]
				for s = 1, linepath[i][3] do
					local px = linepath[i][1] + refx * s
					local py = linepath[i][2] + refy * s
					local c = (cstep - count) // 1
					if c > 1 and c < #linegrad then
						line(lastx, lasty, px, py, linegrad[c])
					end
					count = count + 1
					lastx = px
					lasty = py
				end
			end
		end
	end

	math.randomseed(1)
	for i = 0, 250 do
		dust((200 + math.random() * 100 - t / 20) % 255, 0 + math.random() * 150, math.random() * 50, 3)
	end
end

F7_TrailGradient = {
	12,
	11,
	10,
	11,
}

function F7_AddTrailParticle(x, y)
	local r1, r2, r3 = math.random(), math.random(), math.random()
	if r1 < 0.3 then
		return
	end
	local particle = {
		x = x,
		y = 0,
		dx = lerpScalar(0.2, 0.6, r2),
		dy = (r3 - 0.5) * 0.05,
		life = 50,
		-- custom props
		lineLength = r2 * 1.4, -- should relate directly to dx. fastest particles = wider
	}
	AddParticleToPool(F7_SmallShipParticles, particle)
end

function F7_RenderParticles(xOffset, yOffset)
	local particles = F7_SmallShipParticles.particles
	for i, p in ipairs(particles) do
		local age01 = 1 - (p.age / p.life)
		age01 = age01 * age01 --* age01  -- adjust curve so more energetic particles are sharper curve
		local colIndex = SelectNorm(F7_TrailGradient, age01)

		line(p.x, p.y + yOffset, p.x + p.lineLength, p.y + yOffset, F7_TrailGradient[colIndex])
		p.prevX = p.x
		p.prevY = p.y
	end
end

function Frame07_init()
	F07_st = time()
	math.randomseed(123)
	F7_SmallShipParticles = CreateParticlePool(500)
end

F7_SmallShipParticles = {}

function Frame07(tt)
	local t = tt - F07_st

	cls()

	math.randomseed(123)
	stars_side(10000 + t, t / 50, 0)
	math.randomseed(t)

	drawSprite("F7_Ship_01", 240 - 226, 10 + math.sin(t / 1200) * 2)

	local paths = {
		{ st = 0, endt = 1000, pivots = { { 137, 86, 30 }, { 127, 90, 20 }, { 240, 90, 5 } } },
		{ st = 0, endt = 1000, pivots = { { 139, 86, 30 }, { 129, 90, 20 }, { 0, 90, 5 } } },
		{ st = 0, endt = 1000, pivots = { { 141, 86, 30 }, { 131, 92, 20 }, { 240, 92, 5 } } },

		{ st = 400, endt = 1400, pivots = { { 137, 86, 30 }, { 127, 90, 20 }, { 165, 90, 5 }, { 187, 53, 5 }, {
			187,
			20,
			5,
		}, {
			165,
			0,
			5,
		} } },
		{ st = 400, endt = 1400, pivots = { { 139, 86, 30 }, { 129, 90, 20 }, { 90, 90, 5 }, { 70, 53, 5 }, { 70, 33, 5 }, {
			70,
			0,
			5,
		} } },
		{ st = 400, endt = 1400, pivots = { { 141, 86, 30 }, { 131, 92, 20 }, { 240, 92, 5 } } },

		{ st = 800, endt = 2000, pivots = { { 137, 86, 30 }, { 127, 90, 20 }, { 240, 90, 5 } } },
		{ st = 800, endt = 2000, pivots = { { 139, 86, 30 }, { 129, 90, 20 }, { 0, 90, 5 } } },
		{ st = 800, endt = 2000, pivots = { { 141, 86, 30 }, { 131, 92, 20 }, { 240, 92, 5 } } },

		{ st = 1200, endt = 2400, pivots = { { 137, 86, 30 }, { 127, 90, 20 }, { 127, 100, 5 }, { 240, 100, 5 } } },
		{ st = 1200, endt = 2400, pivots = { { 139, 86, 30 }, { 129, 90, 20 }, { 129, 100, 5 }, { 116, 136, 5 } } },
		{ st = 1200, endt = 2400, pivots = { { 141, 86, 30 }, { 131, 92, 20 }, { 131, 100, 5 }, { 0, 100, 5 } } },

		--[[{ st = 0, endt = 2200, pivots={{130,73,30},{140,86,20},{159,103,10},{240,54,0}}},
		{ st = 0, endt = 2200, pivots={{129,73,30},{139,86,20},{158,103,10},{201,136,0}}},
		{ st = 0, endt = 2200, pivots={{128,73,30},{138,86,20},{157,103,10},{78,136,0}}},

		{ st = 1200, endt = 3600, pivots={{131,73,30},{141,86,20},{160,103,5},{160,123,5},{160,136,0}}},
		{ st = 1200, endt = 3600, pivots={{129,73,30},{139,86,20},{158,103,5},{158,123,5},{128,136,0}}},
		{ st = 1200, endt = 3600, pivots={{127,73,30},{137,86,20},{156,103,5},{156,123,5},{156,136,0}}},

		{ st = 2200, endt = 3600, pivots={{131,73,30},{141,86,20},{160,103,5},{180,103,5},{240,103,0}}},
		{ st = 2200, endt = 3600, pivots={{129,73,30},{139,86,20},{158,105,5},{178,105,5},{240,105,0}}},
		{ st = 2200, endt = 3600, pivots={{127,73,30},{137,86,20},{156,103,5},{176,103,5},{240,136,0}}},

		{ st = 3600, endt = 5200, pivots={{130,73,30},{140,86,20},{159,103,10},{240,54,0}}},
		{ st = 3600, endt = 5200, pivots={{129,73,30},{139,86,20},{158,103,10},{213,136,0}}},
		{ st = 3600, endt = 5200, pivots={{128,73,30},{138,86,20},{157,103,10},{78,136,0}}},
--]]
	}

	local linegrad = { 12, 11, 12, 10, 10, 10, 10, 10, 10, 10 }

	for p = 1, #paths do
		local linestart = paths[p].st
		local lineend = paths[p].endt
		local linepath = paths[p].pivots
		if t > linestart and t < lineend + 1000 then
			local st = lineend - linestart
			local pt = t - linestart
			local steps = 0
			for i = 1, #linepath - 1 do
				steps = steps + linepath[i][3]
			end

			local cstep = (pt / st) * steps // 1

			local count = 1
			local lastx = linepath[1][1]
			local lasty = linepath[1][2]

			for i = 1, #linepath - 1 do
				local refx = (linepath[i + 1][1] - linepath[i][1]) / linepath[i][3]
				local refy = (linepath[i + 1][2] - linepath[i][2]) / linepath[i][3]
				for s = 1, linepath[i][3] do
					local px = linepath[i][1] + refx * s
					local py = linepath[i][2] + refy * s
					local c = (cstep - count) // 1
					if c > 1 and c < #linegrad then
						line(lastx, lasty, px, py, linegrad[c])
					end
					count = count + 1
					lastx = px
					lasty = py
				end
			end
		end
	end

	--drawBezierCurves(t)

	--line(40,107,78,107,math.random(10,11))
	--line(84,107,88,107,math.random(10,11))
	--line(92,107,95,107,math.random(10,11))

	--line(150,42,172,42,math.random(10,11))
	--line(178,42,182,42,math.random(10,11))
	--[[
	local curves = {
		--{ st = 0, pivots={{133,83},{68,99},{26,72},{-20,47}}},
		{ st = 0, pivots={{133,83},{22,81},{79,109},{29,11},{13,-20}}},

		{ st = 200, pivots={{141,86},{68,99},{116,132},{269,135}}},
		{ st = 400, pivots={{137,85},{68,99},{174,135},{179,-20}}},
		{ st = 1200, pivots={{141,85},{45,89},{16,22},{16,-20}}},
		{ st = 1400, pivots={{133,83},{68,99},{229,105},{-20,120}}},
		{ st = 2000, pivots={{142,84},{68,99},{239,120},{210,160}}}
	}

	for c=1,#curves do
		local st=curves[c].st
		local piv=curves[c].pivots
		local tt=(t-st)/30//1
		if t > st and t < (st + 10000) then
			local pre = pBezier(piv,0)
			for i=1,quality do
				local t=i/quality
				local p=pre
				local q=pBezier(piv,t)
				if i<tt then line(p[1],p[2],q[1],q[2],9) end
				if i==tt then
					line(p[1],p[2],q[1],q[2],11)
					--circ(p[1],p[2],2,12)
				end
				pre=q
			end
		end
	end
--]]

	local shipY = 110 + math.sin(t / 2300) * 1.5
	drawSprite("F7_Ship_02", 200 - t / 50, shipY)
	UpdateParticlePool(F7_SmallShipParticles)
	F7_AddTrailParticle(230 - t / 50, shipY + 7)
	F7_RenderParticles(230 - t / 50, shipY + 7)
end

F08modX = 10

Frame08_sprites = {
	{ "F8_Module_08", F08modX + 30, 70 },
	{ "F8_Module_09", F08modX + 66, 82 },
	{ "F8_Module_02", F08modX + 100, 102 },
	{ "F8_Module_03", F08modX + 144, 120 },
	{ "F8_Module_01", F08modX + 200, 144 },
	{ "F8_Module_06", F08modX + 258, 164 },
	{ "F8_Module_05", F08modX + 220, 188 }, -- pipe
	{ "F8_Module_02", F08modX + 302, 186 },
	{ "F8_Module_07", F08modX + 348, 204 },
	{ "F8_Module_08", F08modX + 382, 218 },
	{ "F8_Module_04", F08modX + 338, 242 }, -- pipe
	{ "F8_Module_03", F08modX + 414, 232 },
	{ "F8_Module_09", F08modX + 468, 252 },
}

F08_st = 0

function Frame08_init()
	F08_st = time()
	snapx = 0
	snapy = 0
end

function Frame08(tt)
	cls()

	local t = (tt - F08_st) * 0.4
	--local tt=.4

	math.randomseed(234)
	stars_noscroll(t + 10000)

	local s2x = 0
	local s2y = 0

	-- draw sprites
	for i = 1, #Frame08_sprites do
		-- update
		local px = (Frame08_sprites[i][2] - t / 50) % 500 - 100
		local py = (Frame08_sprites[i][3] - t / 120) % 500 - 100

		-- draw
		drawSprite(Frame08_sprites[i][1], px, py)

		if i == 6 then
			local s1y = py + 50 - t / 50
			local cap = py + 14
			if s1y < cap then
				s1y = cap
			end
			drawSprite("F8_Ship_03", px - 80, s1y)
		end

		if i == 11 then
			s2x = px - 40
			s2y = py + 50 - t / 30
			local capt = 3600
			if t > capt then
				if snapx == 0 then
					snapx = s2x
				end
				if snapy == 0 then
					snapy = s2y
				end
				s2x = snapx + (t - capt) / 15
				s2y = snapy + (t - capt) / 40
			end
		end
	end

	math.randomseed(t)
	if snapx ~= 0 then
		circ(s2x, s2y + 16, math.random(2), math.random(3) + 3)
		circ(s2x + 16, s2y + 10, math.random(2), math.random(3) + 3)
	end
	drawSprite("F8_Ship_02", s2x, s2y)
end

F09_st = 0

function Frame09_init()
	F09_st = time()
end

function Frame09(tt)
	local t = (tt - F09_st)

	vbank(0)

	cls()
	drawSprite("F9_BG", 0, 0)

	local sx = t / 30

	drawSprite("F9_Suitcase_01", sx, 52)
	print("TPOLM", sx + 10, 76, 1, false, 1, true)

	drawSprite("F9_Suitcase_02", sx - 200, 52)
	print("POO-BRAIN", sx - 200 + 66, 74, 8, false, 1, true)

	drawSprite("F9_Suitcase_01", sx - 400, 52)
	print("RBBS", sx - 400 + 56, 96, 1, false, 1, true)

	drawSprite("F9_Suitcase_01", sx - 600, 52)
	print("Xenium\n 2026", sx - 600 + 50, 90, 1, false, 1, true)

	drawSprite("F9_Suitcase_02", sx - 800, 52)

	vbank(1)
	--cls()
	drawSprite("F9_ScannerBG", 83, 34)

	drawSprite("F9_Suitcase_Scan_01", sx, 52)
	print("Spectrox", sx + 8, 76, 6, false, 1, true)
	print("Agenda", sx + 88, 76, 6, false, 1, true)
	print("Otomata Labs", sx + 28, 82, 6, false, 1, true)
	print("The Black Lotus", sx + 48, 88, 6, false, 1, true)
	print("Spectrals", sx + 68, 94, 6, false, 1, true)
	print("Accession", sx + 8, 94, 6, false, 1, true)
	print("Konsumer", sx + 28, 100, 6, false, 1, true)

	drawSprite("F9_Suitcase_Scan_02", sx - 200, 52)
	print("The Twitch Elite", sx - 200 + 48, 70, 6, false, 1, true)
	print("Slipstream", sx - 200 + 28, 76, 6, false, 1, true)
	print("SIMurai", sx - 200 + 108, 76, 6, false, 1, true)
	print("Damage", sx - 200 + 48, 82, 6, false, 1, true)
	print("Forsaken", sx - 200 + 68, 88, 6, false, 1, true)
	print("Marquee Design", sx - 200 + 88, 94, 6, false, 1, true)
	print("Joker", sx - 200 + 28, 100, 6, false, 1, true)

	drawSprite("F9_Suitcase_Scan_01", sx - 400, 52)
	print("Altair", sx - 400 + 8, 76, 6, false, 1, true)
	print("Abberation Creations", sx - 400 + 28, 82, 6, false, 1, true)
	print("Oftenhide", sx - 400 + 48, 88, 6, false, 1, true)
	print("Dreamweb", sx - 400 + 68, 94, 6, false, 1, true)
	print("Rift", sx - 400 + 8, 94, 6, false, 1, true)
	print("BionFX", sx - 400 + 88, 100, 6, false, 1, true)
	print("Elude", sx - 400 + 28, 100, 6, false, 1, true)

	drawSprite("F9_Suitcase_Scan_01", sx - 600, 52)
	print("Rabenauge", sx - 600 + 8, 76, 6, false, 1, true)
	print("Abyss Connection", sx - 600 + 28, 82, 6, false, 1, true)
	print("Haujobb", sx - 600 + 48, 88, 6, false, 1, true)
	print("K2", sx - 600 + 88, 100, 6, false, 1, true)
	print("Akronyme Analogiker", sx - 600 + 8, 94, 6, false, 1, true)
	print("Stargaze", sx - 600 + 28, 100, 6, false, 1, true)

	drawSprite("F9_Suitcase_Scan_02", sx - 800, 52)
	print("... and you!", sx - 800 + 48, 88, 6, false, 1, true)

	-- clip around
	rect(0, 0, 240, 19, 0)
	rect(0, 19, 74, 117, 0)
	rect(184, 19, 56, 117, 0)

	drawSprite("F9_Frame", 0, 51)
	drawSprite("F9_Scannerframe", 73, 19)
end

function RenderRock(x, y, seed, rid, aaRotationIndex)
	drawSpriteWithAARotation(rid, x, y, aaRotationIndex)
	--RotoSprite(rid, x, y, angle)
end

F11_st = 0

F11_shipX = 0

-- rock sprites:
-- 1 = small
-- 2, 3 = large
-- 4 = medium
F11_bgRockPool = { 1 }
F11_bgParticles = nil

F11_fgRockPool = { 2, 3, 4 }
F11_fgParticles = nil

F11_Starfield = nil
F11_particleStreaks = nil -- particle system for high-energy particles.
F11_particleStreakIntensity = 0 -- for a transition to next scene, ramp this up.
F11_particleStreakIntensityOverride = nil -- for a transition to next scene, ramp this up.

-- precalc the shuffled Y positions to emit particles.
-- so very dense fields are evenly-distributed to cover the screen better, not overlap.
F11_particleStreakYPositions = {}
F11_particleStreakCounter = 0
for i = 0, 136 - 1 do
	F11_particleStreakYPositions[i + 1] = i
end
ShuffleInPlace(F11_particleStreakYPositions, CreateRng(1234))

function AddRock(first, particleSystem, rockPool, speedMod)
	local biasAngleRight = DxDyToAngle(1, 0)
	local biasAngleLeft = DxDyToAngle(-1, 0)
	local biasAngle = math.random() > 0.7 and biasAngleRight or biasAngleLeft
	local biasAmt = 0.95 -- favor left/right mvmt
	local ownAngle = math.random() * 6.28
	local angle = lerpAngular(ownAngle, biasAngle, biasAmt)
	local speed = math.random(5, 20) / 1000
	speed = speed * speedMod -- * 10
	local dx, dy = polarToCartesian(angle, speed)
	-- if moving left, spawn on right. if moving right, spawn on left.
	local x = dx < 0 and 260 or -20
	if first then
		x = math.random(0, 240) -- except on init; then scatter them.
	end
	local p = {
		x = x,
		y = math.random(0, 136),
		dx = dx,
		dy = dy,
		life = 99999, -- effectively infinite
		onDeath = function(p)
			AddRock(false, particleSystem, rockPool, speedMod)
		end,
		should86 = function(p)
			return p.x < -20 or p.x > 260 or p.y < -20 or p.y > 156
		end,
		-- custom props
		rockId = "F11_Rock_" .. string.format("%02d", rockPool[math.random(1, #rockPool)]),
		aaRotationIndex = math.random(0, 3), -- axis-aligned rot
		rotationRad = math.random() * 6.28, -- rocks are too small for rotosprite to look good.
	}
	AddParticleToPool(particleSystem, p)
end

-- each gradient's left color = transparent.
--F11_chaosGradient = ShuffleInPlace({ 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15 }, CreateRng(1234))
F11_gradients = {
	-- { 0, 15, 14, 13 }, -- dim grayscale
	{ 0, 15, 14, 13, 12 }, -- grayscale
	{ 0, 8, 9, 10, 11 }, -- blue
	{ 0, 1, 2, 3, 4 }, -- red-yellow
	{ 0, 7, 6, 5 }, -- green
	{ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 }, -- chaos.
}
for g = 1, 5 do
	local grad = ShuffleInPlace({ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 }, CreateRng(1234 + g))
	F11_gradients[#F11_gradients + 1] = grad
end

function F11_GetParticleStreakIntensity()
	return F11_particleStreakIntensityOverride or F11_particleStreakIntensity
end

function F11_GetParticleStreakLength(len01)
	return bilerpScalar(1, 5, 80, 250, len01, F11_GetParticleStreakIntensity())
end

function F11_AddParticleStreak()
	F11_particleStreakCounter = F11_particleStreakCounter + 1
	-- more intensity = more gradients to choose from
	local gradientCount = (lerpScalar(1, #F11_gradients, F11_GetParticleStreakIntensity()) + 0.5) // 1

	local p = {
		x = 240,
		y = F11_particleStreakYPositions[F11_particleStreakCounter % #F11_particleStreakYPositions + 1],
		dx = lerpScalar(-2, -5, math.random()),
		dy = 0,
		life = 99999, -- effectively infinite
		--onDeath = F11_AddParticleStreak, -- don't accumulate; let tick() create as needed.
		should86 = function(p)
			if p.x < -F11_GetParticleStreakLength(p.length) then
				return true
			end
			return false
		end,
		-- custom props
		length = math.random(),
		gradient = F11_gradients[math.random(1, gradientCount)],
	}
	AddParticleToPool(F11_particleStreaks, p)
end

function F11_RenderParticleStreak(p)
	--pix(p.x, p.y, 12)
	--line(p.x, p.y, p.x + p.length, p.y, 12)
	--local length = lerpScalar(p.length)
	local length = F11_GetParticleStreakLength(p.length)
	hlineBayerGradient(p.x, p.x + length, p.y, p.gradient, 1.0, 0)
end

function Frame11_init()
	poke(0x3FF8, 0) -- border black

	F11_st = time()
	math.randomseed(12)

	F11_shipX = 30 -- initial ship X

	F11_Starfield = CreateStarField({
		numParallaxLayers = 3,
		density = 10,
		dxMin = -0.02,
		dxMax = -0.01,
		dyMin = 0.00,
		dyMax = 0.01,
	})

	F11_bgParticles = CreateParticlePool(25)
	for i = 1, 20 do
		AddRock(true, F11_bgParticles, F11_bgRockPool, 0.18)
	end

	F11_fgParticles = CreateParticlePool(3)
	for i = 1, 20 do
		AddRock(true, F11_fgParticles, F11_fgRockPool, 15.5)
	end

	F11_particleStreaks = CreateParticlePool(136 * 3) -- 3 per row max.
	F11_particleStreakCounter = 0
	F11_particleStreakIntensityOverride = nil
end

F11_planetGradient = { 0, 1, 2, 3, 4, 12 }

function RenderPlanet(t)
	--local cx, cy, r = 120, 68, 60
	local cx, cy, r = 330, -450, 525

	local invR = 1 / r
	local phase = t * -0.0017
	--local rotation = t * 0.0001
	local scale = 6

	-- don't put these in the shader for performance.
	local phasev2 = phase * 1.6
	local phasev3 = phase * 0.61
	local scalev1 = scale * 9
	local scalev2 = scale * 12
	local scalev3 = scale * 7
	--local cr, sr = cos(rotation), sin(rotation)

	circ(cx, cy, r + 3, 8)
	circ(cx, cy, r + 1, 9)

	ShadeCircleBayer(cx, cy, r, F11_planetGradient, function(screenX, screenY)
		local x = (screenX - cx) * invR -- normalize
		local y = (cy - screenY) * invR
		local z = sqrt(1 - x * x - y * y) -- unit sphere

		local waves = sin(scalev1 * x + 5 * y + phase)
			+ sin(scalev2 * z - 7 * y - phasev2)
			+ sin(scalev3 * (x + z + y) + phasev3)
		--return z * (waves + 2) * 0.5 * (3 * (F11_particleStreakIntensity + 1))
		return z * (waves + 2) * (0.5 + (3 - 0.5) * F11_GetParticleStreakIntensity())

		-- interaction with rotated coords looks cool but is subtle and costs a lot of CPU
		-- local px = cr*x - sr*z
		-- local pz = sr*x + cr*z
	end)
end

function Frame11(tt, demoBeat, somaticState, sceneTiming)
	local t = (tt - F11_st)
	local dt = 16

	-- up/down controls intensity.

	-- ramp up intensity over time
	-- scene starts @ 368
	local targetBeat = 400 --380 --400
	local transitionDurationBeats = 8
	local transitionStartBeat = targetBeat - transitionDurationBeats
	local transition01 = clamp01((demoBeat - transitionStartBeat) / transitionDurationBeats)
	F11_particleStreakIntensity = (0.003 + (1.0 - 0.003) * transition01 * transition01 * transition01)

	cls()

	-- adjust params to scene intensity.

	UpdateStarField(F11_Starfield)
	UpdateParticlePool(F11_bgParticles)
	UpdateParticlePool(F11_fgParticles)
	UpdateParticlePool(F11_particleStreaks)

	-- create new particle streaks; we can create multiple per frame.
	local effectiveIntensity = F11_GetParticleStreakIntensity()
	for y = 0, 140 do
		-- adding more than is supported will remove existing; let them fade out naturally.
		if #F11_particleStreaks.particles < F11_particleStreaks.maxParticles then
			if math.random() < effectiveIntensity * 0.1 then
				F11_AddParticleStreak()
			end
		end
	end

	RenderStarField(F11_Starfield, t)

	-- planet
	--circ(100,1000,900,1)-- horiz
	--circ(1000,80, 900,1)-- vert
	---circ(400,-400,525,1)-- diag template.
	RenderPlanet(t)

	-- rocks behind
	for i, p in ipairs(F11_bgParticles.particles) do
		RenderRock(p.x, p.y, i, p.rockId, p.aaRotationIndex)
	end

	-- ship
	local shipDx = (0.001 + (0.08 - 0.001) * effectiveIntensity)
	F11_shipX = F11_shipX + shipDx * dt
	drawSprite("F11_Ship", F11_shipX, math.sin(t / 2000) * 2)

	-- rocks in front
	for i, p in ipairs(F11_fgParticles.particles) do
		RenderRock(p.x, p.y, i, p.rockId, p.aaRotationIndex)
	end

	local glitchAmt = effectiveIntensity -- ^1.4
	if glitchAmt > 0.01 then
		screen_glitch(t, 20, glitchAmt)
	end

	-- grid-o-squares for visualizing the block glitch effect
	-- local rectSize = 25
	-- local ir = 0
	-- for x = 0, 240, rectSize do
	-- 	for y = 0, 136, rectSize do
	-- 		rect(x, y, rectSize, rectSize, ir % 16)
	-- 		ir = ir + 1
	-- 	end
	-- end

	-- screen_glitch_blocks(9, {
	-- 	widthMin = 2,
	-- 	widthMax = 12,
	-- 	count = lerpScalar(0, 100, effectiveIntensity),
	-- 	dxMin = lerpScalar(0, -12, effectiveIntensity),
	-- 	dxMax = lerpScalar(0, 12, effectiveIntensity),
	-- 	dyMin = lerpScalar(0, -4, effectiveIntensity),
	-- 	dyMax = lerpScalar(0, 4, effectiveIntensity),
	-- })

	-- particle streaks
	for i, p in ipairs(F11_particleStreaks.particles) do
		F11_RenderParticleStreak(p)
	end
end

TUNNEL_Gradient = { 9, 10, 11, 12 }
TUNNEL_Gradient_Darker = { 8, 9, 10, 11 } -- same gradient but 1 shade darker

TUNNEL_TrailParticles = {} -- particle system created in init

TUNNEL_TrailGradient = {
	--3, -- orange
	4, -- yellow
	11, -- cyan
	6,
	5, -- greens
}
TUNNEL_StructRng = nil

-- when nil, no pulsing. when set, y falls.
TUNNEL_pulseY = nil

function tunnel_init()
	poke(0x3FF8, 0) -- border black

	tunnel_st = time()
	math.randomseed(766)

	TUNNEL_pulseY = nil

	-- each ship gets particle emitter
	TUNNEL_TrailParticles = {
		CreateParticlePool(500),
		CreateParticlePool(500),
		CreateParticlePool(500),
		CreateParticlePool(500),
	}
end

function tunnel_music_row(state)
	if state.sideChannel and state.sideChannel ~= "" then
		-- pulse.
		TUNNEL_pulseY = 1
	end
end

function renderStructure(t, sparseBand)
	local y1 = 36 --46+math.sin(t/700+10)*20
	local y2 = 100 --110+math.sin(t/1000)*20
	local bandWidth = 18
	local maxX = (math.ceil(240 / bandWidth) + 2) * bandWidth

	local prevx = (-bandWidth - t / 20) % maxX
	for x = -bandWidth, maxX, bandWidth do
		local bandFillPx = bandWidth * lerpScalar(0.1, 0.9, RngNext(TUNNEL_StructRng))
		if not sparseBand then
			bandFillPx = bandWidth
		end
		local normColor = (RngNext(TUNNEL_StructRng) * 0.9)
		if TUNNEL_pulseY then
			normColor = normColor * TUNNEL_pulseY
		end
		local colIndex = SelectNorm(TUNNEL_Gradient, normColor)
		local col = TUNNEL_Gradient[colIndex]
		local shadowCol = TUNNEL_Gradient_Darker[colIndex]
		local posx = (x - t / 20) % maxX - bandWidth
		local seamSizeOnWall = RngNext(TUNNEL_StructRng, 2, 4) // 1 -- keep out of below loop otherwise it messes with rand sequence
		if prevx < posx then
			local x0 = prevx
			local x1 = prevx + bandFillPx
			-- ceiling
			tri(x1, y1, x1 * 2 - 120, 0, x0 * 2 - 120, 0, col)
			tri(x0, y1, x1, y1, x0 * 2 - 120, 0, col)

			-- wall
			tri(x1, y1, x1, y2, x0, y1, col)
			tri(x0, y1, x1, y2, x0, y2, col)

			-- floor
			tri(x0, y2, x0 * 2 - 120, 136, x1 * 2 - 120, 136, col)
			tri(x1, y2, x0, y2, x1 * 2 - 120, 136, col)

			-- draw kind of ambent occlusion effect on wall.
			-- dynamic height of this effect actually makes no sense but it looks more dynamic than fixed,
			-- probably due to bayer noise.
			for seamRY = 0, seamSizeOnWall do
				local seam01 = 1 - (seamRY / seamSizeOnWall)
				local seamY1 = y1 + seamRY
				hlineBayerShadow(prevx, posx, seamY1, shadowCol, seam01)
				local seamY2 = y2 - seamRY
				hlineBayerShadow(prevx, posx, seamY2, shadowCol, seam01)
			end
		end
		prevx = posx
	end
end

function TUNNEL_AddTrailParticle(shipIndex, x, y)
	local r1, r2, r3 = math.random(), math.random(), math.random()
	if r1 < 0.3 then
		return
	end
	local particle = {
		x = x,
		y = 0,
		dx = lerpScalar(-0.2, -0.6, r2),
		dy = (r3 - 0.5) * 0.05,
		life = 50,
		-- custom props
		lineLength = r2 * 1.4, -- should relate directly to dx. fastest particles = wider
	}
	AddParticleToPool(TUNNEL_TrailParticles[shipIndex], particle)
end

function TUNNEL_RenderParticles(shipIndex, xOffset, yOffset)
	local particles = TUNNEL_TrailParticles[shipIndex].particles
	for i, p in ipairs(particles) do
		local age01 = 1 - (p.age / p.life)
		age01 = age01 * age01 --* age01  -- adjust curve so more energetic particles are sharper curve
		local colIndex = SelectNorm(TUNNEL_TrailGradient, age01)
		--pix(p.x, p.y + yOffset, TUNNEL_TrailGradient[colIndex])

		line(p.x, p.y + yOffset, p.x + p.lineLength, p.y + yOffset, TUNNEL_TrailGradient[colIndex])
		p.prevX = p.x
		p.prevY = p.y
	end
end

function posOrNeg1(x)
	if x < 0 then
		return -1
	end
	return 1
end

TUNNEL_hyperLineIndex = 0

function RenderHyperLine(t, x, y)
	TUNNEL_hyperLineIndex = TUNNEL_hyperLineIndex + 1
	local throw = 20
	local nominalLen = 2
	local randSpeed = lerpScalar(0.5, 1.0, hash11(TUNNEL_hyperLineIndex))
	local xoffset = fract(t * 0.006 * randSpeed) * throw // 1
	local startX = x - xoffset - nominalLen
	line(startX, y, x, y, 13)
	pix(startX - 3, y, 15)
	pix(startX - 6, y, 14)
end

function tunnel(tt)
	local t = tt - tunnel_st

	local thl = t
	--t = 9000

	if TUNNEL_pulseY then
		TUNNEL_pulseY = TUNNEL_pulseY * 0.9
	end

	-- hit t to manually accent.

	cls()
	TUNNEL_hyperLineIndex = 0

	for i = 1, #TUNNEL_TrailParticles do
		local p = TUNNEL_TrailParticles[i]
		if p then
			UpdateParticlePool(p)
		end
	end

	--draw tunnel
	TUNNEL_StructRng = CreateRng(1)
	renderStructure(t * 0.8)
	renderStructure(t * 1.6, true)

	--draw ships
	local slx = math.sin(t / 1000) * 10 + t / 60 - 100
	local sly = 30 + math.sin(t / 800) * 6
	RenderHyperLine(thl, slx + 116, sly + 0)
	RenderHyperLine(thl, slx + 20, sly + 5)
	--RenderHyperLine(thl, slx+0, sly+22)
	RenderHyperLine(thl, slx + 1, sly + 38)
	RenderHyperLine(thl, slx + 110, sly + 76)
	drawSprite("Tunnel_Shiplarge_" .. string.format("%02d", t // 60 % 6 + 1), slx, sly)
	circ(slx + 97, sly + 54, math.random(2), math.random(3) + 3)
	TUNNEL_AddTrailParticle(1, slx + 97, sly + 54)
	TUNNEL_RenderParticles(1, slx + 97, sly + 54)

	slx = math.sin(t / 2100) * 6 + t / 46 - 20
	sly = 98 + math.sin(t / 1800) * 4
	--RenderHyperLine(thl, slx+0, sly+1)
	RenderHyperLine(thl, slx + 3, sly + 28)
	drawSprite("Tunnel_Shipsmall_01_" .. string.format("%02d", t // 60 % 5), slx, sly)
	circ(slx + 1, sly + 16, math.random(2), math.random(3) + 3)
	circ(slx + 3, sly + 19, math.random(1), math.random(3) + 3)
	TUNNEL_AddTrailParticle(2, slx + 3, sly + 19)
	TUNNEL_RenderParticles(2, slx + 3, sly + 19)

	slx = math.sin(t / 2000 + 10) * 6 + t / 30 - 80
	sly = 5 + math.sin(t / 1700 + 2) * 4
	drawSprite("Tunnel_Shipsmall_02_" .. string.format("%02d", t // 60 % 4 + 1), slx, sly)
	line(slx + 2, sly + 9, slx + 6, sly + 5, math.random(3) + 3)
	TUNNEL_AddTrailParticle(3, slx + 6, sly + 5)
	TUNNEL_RenderParticles(3, slx + 6, sly + 5)

	slx = math.sin(t / 2100 + 20) * 6 + t / 58 - 140
	sly = 94 + math.sin(t / 1900 + 4) * 5
	TUNNEL_AddTrailParticle(4, slx, sly + 12)
	TUNNEL_RenderParticles(4, slx, sly + 12)
	drawSprite("Tunnel_Shipsmall_03_" .. string.format("%02d", t // 60 % 6 + 1), slx, sly)
end

function RotoSprite(spr_id, posx, posy, a)
	local w = sprites[spr_id].w
	local h = sprites[spr_id].h
	local c = sprites[spr_id].data
	local bkg = sprites[spr_id].bg

	local cx = w / 2
	local cy = h / 2
	local s = 1
	local cas = math.cos(a) * s
	local sis = math.sin(a) * s

	for x = 0, w - 1 do
		local dx = x - cx
		local cdx = cx + cas * dx
		local sdy = cy - sis * dx
		for y = 0, h - 1 do
			local dy = y - cy
			local u = (cdx + sis * dy) // 1
			local v = (sdy + cas * dy) // 1
			local col = c[u + v * w]
			if (col ~= bkg) and (u < w) and (u >= 0) then
				pix(posx + x, posy + y, col)
			end
		end
	end
end

C1_Weld = { -- id, padx, pady
	{ "C1_Welding_01", 10, 57 },
	{ "C1_Welding_02", 10, 34 },
	{ "C1_Welding_03", 14, 7 },
	{ "C1_Welding_04", 22, 6 },
	{ "C1_Welding_05", 33, 6 },
	{ "C1_Welding_06", 45, 6 },
	{ "C1_Welding_07", 58, 33 },
	{ "C1_Welding_08", 22, 61 },
}

function RotoSpriteWeld(spr_id, posx, posy, t)
	local w = sprites[spr_id].w
	local h = sprites[spr_id].h
	local d = sprites[spr_id].data
	local c = {}
	for i = 1, #d do -- do a copy, before drawing welding marks
		c[i] = d[i]
	end
	local bkg = sprites[spr_id].bg

	-- draw welding trails
	local id = t // 1 % 7 + 1
	local padx = C1_Weld[id][2]
	local pady = C1_Weld[id][3]
	local spr = sprites[C1_Weld[id][1]]
	local sprw = spr.w
	local sprh = spr.h
	local sprd = spr.data
	local sprbg = spr.bg
	local padye = pady + sprh
	local padxe = padx + sprw
	for sy = pady, padye do
		local syw = sy * w
		local spyw = (sy - pady) * sprw
		for sx = padx, padxe do
			local pc = sprd[(sx - padx) + spyw]
			if pc ~= sprbg then
				c[sx + syw] = pc
			end
		end
	end

	-- rotate
	local cx = w / 2
	local cy = h / 2
	local s = 1
	local a = t
	local cas = math.cos(a) * s
	local sis = math.sin(a) * s
	for x = 0, w - 1 do
		local dx = x - cx
		local cdx = cx + cas * dx
		local sdy = cy - sis * dx
		for y = 0, h - 1 do
			local dy = y - cy
			local u = (cdx + sis * dy) // 1
			local v = (sdy + cas * dy) // 1
			local col = c[u + v * w]
			if (col ~= bkg) and (u < w) and (u >= 0) then
				pix(posx + x, posy + y, col)
			end
		end
	end
end

--function C01_Weld(x,y,t)
--	local id = t//30%7+1
--	drawSprite(C1_Weld[id][1], x+C1_Weld[id][2], y+C1_Weld[id][3])
--end

C01_st = 0

C01_accentY = nil
C01_accentIndex = 0
C01_flicker = false -- 1 frame of flicker per accent.
C01_kAccentPartitions = 4

function C01_accent()
	C01_accentIndex = C01_accentIndex + 1
	C01_accentY = 1
	C01_flicker = true
end

function C01_music_row(state)
	if state.sideChannel == "accent2" then
		C01_accent()
	end
end

function Construction01_init()
	C01_st = time()
	vbank(0)
	cls()
	vbank(1)
	cls()
	vbank(0)

	C01_accentY = nil
	C01_accentIndex = 0
	C01_flicker = false
end

function Construction01(tt, _, somaticState, sceneTime)
	local t = (tt - C01_st)
	math.randomseed(t)

	cls()

	if C01_accentY then
		C01_accentY = C01_accentY * 0.9 -- decay
	end

	local wstart = 2000

	local wx = math.sin(wstart / 50 + math.sin(wstart / 40) * 10) * 10

	if t < wstart then
		local sx = t / 30
		if sx > 57 then
			sx = 57
		end

		local rot = (57 - sx) / 15

		RotoSprite("C1_Triangle", 37, 22 - 57 + sx, rot)

		if sx < 57 then
			drawSprite("C1_Door_02", 31 - sx, 14) -- left
			drawSprite("C1_Door_01", 79 + sx, 11) -- right
		end
	else
		RotoSpriteWeld("C1_Triangle", 37, 22, t / 80)
		wx = math.sin(t / 50 + math.sin(t / 40) * 10) * 10
		local spark_id = "C1_Sparks_" .. string.format("%02d", math.random(3) + 1)
		drawSprite(spark_id, wx + 50 + math.random(8), 72)
		drawSprite(spark_id, wx + 50 + math.random(8), 75)
	end

	if C01_flicker then
		C01_flicker = false
		cls(12)
	else
		drawSprite("C1_Bg", 0, 0)

		drawSprite("C1_Machine_01", wx, 75)
		drawSprite("C1_Machine_02", 0, 65)
		drawSprite("C1_Machine_03", -2, 60)
	end

	if C01_accentY and C01_accentY > 0.01 then
		screen_glitch(C01_accentIndex, 40, C01_accentY)
	end

	-- and glitch the screen as a transition
	local transitionStartBeat = 460 - 448
	local transitionEndBeat = 464 - 448
	if sceneTime.demoBeats >= transitionStartBeat and sceneTime.demoBeats <= transitionEndBeat then
		local transition01 = (sceneTime.demoBeats - transitionStartBeat) / (transitionEndBeat - transitionStartBeat)
		screen_glitch(9, 150, transition01)
	end
end

function drawSpriteClipLeft(spr_id, posx, posy, clipx)
	local w = sprites[spr_id].w
	local h = sprites[spr_id].h
	local c = sprites[spr_id].data
	local bkg = sprites[spr_id].bg
	for y = 0, h - 1 do
		local srcRow = y * w
		local screenY = posy + y
		for x = clipx, w - 1 do
			local col = c[x + srcRow]
			if col ~= bkg then
				pix(posx + x, screenY, col)
			end
		end
	end
end

function C2_DoorOpenAnim(t, st, et, x, y)
	local idx = 11
	if t <= st then
		t = st
	end
	if t >= et then
		t = et
	end
	local door_id = 1 + 6 * ((t - st) / (et - st)) // 1
	--print(door_id,0,0,12)
	local spr_id = "C2_Door_" .. string.format("%02d", door_id)
	local w = sprites[spr_id].w
	local h = sprites[spr_id].h
	local tw = 71
	local th = 50
	local ox = x + (tw - w) / 2
	local oy = y + (th - h) / 2
	drawSprite(spr_id, ox, oy)
end

C02_st = 0

function Construction02_init()
	C02_st = time()
	vbank(0)
	cls()
	vbank(1)
	cls()
	vbank(0)
end

C02_doors = {
	{ 50000, 50000, "C2_ShipCon_01", 0 },
	{ 50000, 50000, "C2_ShipCon_01", 0 },
	{ 1400, 2000, "C2_ShipCon_01", 5000 },
	{ 50000, 50000, "C2_ShipCon_01", 0 },
	{ 10400, 11000, "C2_ShipCon_01", 14000 },
	{ 50000, 50000, "C2_ShipCon_01", 0 },
	{ 50000, 50000, "C2_ShipCon_01", 0 },
}

function Construction02(tt)
	local t = (tt - C02_st)
	math.randomseed(t)

	cls()

	for i = #C02_doors, 1, -1 do
		local doorx = ((i - 1) * 118 - 100 - t / 50) // 1

		-- draw door
		if t > C02_doors[i][1] then
			C2_DoorOpenAnim(t, C02_doors[i][1], C02_doors[i][2], (doorx + 12) // 1, 54)
		else
			drawSprite("C2_Door_02", doorx + 15, 61)
		end

		-- draw rest of the bay
		drawSprite("C2_ShipbgSprite", doorx, 0)

		-- draw blinking lights
		if (t > C02_doors[i][1] - 2000) and (t < C02_doors[i][2] + 2000) then
			if t // 120 % 3 ~= 0 then
				drawSprite("C2_Lights", doorx + 23, 52)
			end
		elseif t < C02_doors[i][1] - 2000 then
			drawSprite("C2_Lights", doorx + 23, 52)
		end
		-- lights will be off after ship has launched, this is normal

		-- draw ship coming out
		if t > C02_doors[i][2] then
			local stpos = doorx + (t - C02_doors[i][2]) / 30 - 49
			local ypos = 68 + math.sin(t / 2000 + i * 10) * 2
			local clip = (64 - (t - C02_doors[i][2]) / 30) // 1
			if clip < 0 then
				clip = 0
			end
			if t > C02_doors[i][4] then
				-- turn on thrusters
				stpos = stpos + (t - C02_doors[i][4]) / 20
				circ(stpos, ypos + 7, math.random(2), math.random(3) + 1)
			end
			if t > C02_doors[i][1] + 3600 then
				drawSpriteClipLeft("C2_ShipCon_01", stpos, ypos, clip)
			else
				drawSpriteClipLeft("C2_ShipCon_02", stpos, ypos, clip)
			end
			--print(doorx//1,doorx,0,12)
		end
	end
end

-- animated booster streak effect. acts like yet another particle system.
-- emitter is defined as a line. along the line, booster streaks spawn in fixed direction.
function MaybeSpawnBoosterStreak(b, x, y, t01)
	if random() > b.options.density then
		return nil
	end
	local o = b.options
	local virility01 = random()
	local s = {
		x0 = x,
		y0 = y,
		dx = lerpScalar(o.direction0X, o.direction1X, t01),
		dy = lerpScalar(o.direction0Y, o.direction1Y, t01),
		t01 = t01, -- position along emitter.
		--phase = random() * 6.28,
		lifespanMS = lerpScalar(o.lifespanMSMin, o.lifespanMSMax, virility01),
		ageMS = 0,
		length = 0,
		targetLength = lerpScalar(o.minLength, o.maxLength, virility01),
		energy = bilerpScalar(o.minEnergy0, o.maxEnergy0, o.minEnergy1, o.maxEnergy1, virility01, t01),
		--energy = 0,
		speed = lerpScalar(o.minSpeed, o.maxSpeed, virility01),
	}
	-- normalize the direction vector
	s.dx, s.dy = normalize2D(s.dx, s.dy)
	return s
end

function CreateBoosterStreaks(options)
	options.emitterX0 = options.emitterX0 or 60
	options.emitterY0 = options.emitterY0 or 60
	options.emitterX1 = options.emitterX1 or 80
	options.emitterY1 = options.emitterY1 or 90
	options.direction0X = options.direction0X or -1.5 -- direction vector at emitter start. (not normalized yet)
	options.direction0Y = options.direction0Y or 0.5
	options.direction1X = options.direction1X or -1.5 -- direction vector at emitter end. (not normalized yet)
	options.direction1Y = options.direction1Y or 0.5
	options.density = options.density or 0.07 -- chance of spawn.
	options.minLength = options.minLength or 4
	options.maxLength = options.maxLength or 240
	options.minSpeed = options.minSpeed or 0.05
	options.maxSpeed = options.maxSpeed or 0.2
	options.lifespanMSMin = options.lifespanMSMin or 80 -- min lifespan of streaks in milliseconds.
	options.lifespanMSMax = options.lifespanMSMax or 700 -- max lifespan of streaks in milliseconds.
	--max/min energy interpolation along the emitter line.
	options.minEnergy0 = options.minEnergy0 or 0.4
	options.maxEnergy0 = options.maxEnergy0 or 0.4
	options.minEnergy1 = options.minEnergy1 or 0.8
	options.maxEnergy1 = options.maxEnergy1 or 1.0
	options.gradient = options.gradient or { 15, 7, 7, 6, 6, 5, 5, 12, 12 } -- color gradient for streaks.

	-- normalize direction vectors
	options.direction0X, options.direction0Y = normalize2D(options.direction0X, options.direction0Y)
	options.direction1X, options.direction1Y = normalize2D(options.direction1X, options.direction1Y)

	-- store a normalized emitter line vector as well
	local emitterDx = options.emitterX1 - options.emitterX0
	local emitterDy = options.emitterY1 - options.emitterY0
	options.emitterDx, options.emitterDy = normalize2D(emitterDx, emitterDy)

	local b = {
		options = options,
		streaks = {},
	}
	return b
end

function UpdateBoosterStreaks(b, dtMS)
	local options = b.options

	-- kinda expensive
	VisitPixelsAlongLine(options.emitterX0, options.emitterY0, options.emitterX1, options.emitterY1, function(x, y, t01)
		local s = MaybeSpawnBoosterStreak(b, x, y, t01)
		if s then
			table.insert(b.streaks, s)
		end
	end)

	for i = #b.streaks, 1, -1 do
		local s = b.streaks[i]
		s.ageMS = s.ageMS + dtMS
		if s.ageMS > s.lifespanMS then
			table.remove(b.streaks, i)
		else
			local speed = s.speed * dtMS
			-- streaks move in 2 phases: first, their length increases until target length, then they move.
			if s.length < s.targetLength then
				s.length = s.length + speed
				if s.length > s.targetLength then
					s.length = s.targetLength
				end
			else
				s.x0 = s.x0 + s.dx * speed
				s.y0 = s.y0 + s.dy * speed
			end
		end
	end
end

function RenderBoosterStreaks(b, xOffset, yOffset)
	for i = 1, #b.streaks do
		local s = b.streaks[i]
		local life01 = 1 - (s.ageMS / s.lifespanMS)
		local x1 = s.x0 + s.dx * s.length
		local y1 = s.y0 + s.dy * s.length
		local energy = s.energy
		-- curve... age is like dist from teh ship and should fall off sharply.
		life01 = life01 * life01
		local gradPos = sqrt(life01 * energy)
		local gradIndex = SelectNorm(b.options.gradient, gradPos)
		local palIndex = b.options.gradient[gradIndex]
		line(s.x0 + xOffset, s.y0 + yOffset, x1 + xOffset, y1 + yOffset, palIndex)
		if life01 > 0.40 then
			-- draw a second line to make it look thicker.
			line(s.x0 + xOffset + 1, s.y0 + yOffset, x1 + xOffset + 1, y1 + yOffset, palIndex)
		end
		if life01 > 0.80 then
			-- draw a third line to make it look thicker.
			line(s.x0 + xOffset - 1, s.y0 + yOffset, x1 + xOffset - 1, y1 + yOffset, palIndex)
		end
	end
end

C03_bg = nil
C03_streaksBigShip = nil
C03_streaksShip01 = nil
C03_streaksShip02 = nil
C03_last_wall_millis = 0
C03_sprites = nil

-- todo: parallax speeds; but they seem to get reused in ways that are hard to predict so i leave it.
C03_spriteTemplate = {
	{ "C3_Element_01", 200, 0, 1 },
	{ "C3_Element_02", 200, -80, 1 },
	{ "C3_Element_03", 240, -120, 1 },
	{ "C3_Element_03", 40, -30, 1 },
	{ "C3_Element_04", 150, 0, 1 },
	{ "C3_Element_04", 170, -150, 1 },
	{ "C3_Element_05", 360, -100, 1 },
	{ "C3_Element_06", 400, -130, 1 },
	{ "C3_Element_07", 620, -340, 1 },
	{ "C3_Element_02", 500, -300, 1 },
	{ "C3_Element_05", 280, -220, 1 },
	{ "C3_Element_04", 370, -400, 1 },
}

-- ship stripe thresholds, indexed by x coordinate. nil means no color mapping at that x.
C03_shipStripeThresholds = {}

C03_stripes = {
	{ speed = -0.07, width = 80, period = 160 },
	{ speed = -0.14, width = 50, period = 100 },
}

function C03_UpdateShipStripeThresholds(t)
	for _, stripe in ipairs(C03_stripes) do
		local offset = (t * stripe.speed) // 1
		for x = 0, 240 - 1 do
			local isStripe = (x - offset) % stripe.period < stripe.width
			if isStripe then
				if C03_shipStripeThresholds[x] == nil then
					-- combine.
					C03_shipStripeThresholds[x] = -0.2
				else
					C03_shipStripeThresholds[x] = C03_shipStripeThresholds[x] + 0.2
				end
			else
				C03_shipStripeThresholds[x] = nil
			end
		end
	end
end

-- specialization of drawsprite with some palette swapping / dithering.
function C03_DrawSpriteStripped(spr, posx, posy, t)
	C03_UpdateShipStripeThresholds(t)

	local sprite = sprites[spr]
	local w = sprite.w
	local h = sprite.h
	local c = sprite.data
	local bkg = sprite.bg
	local stripeThresholds = C03_shipStripeThresholds
	local bayer = BAYER_MINUS_5
	posx = posx // 1
	posy = posy // 1

	for y = 0, h - 1 do
		local screenY = posy + y
		if screenY >= 0 and screenY < 136 then
			local srcRow = y * w
			local screenRow = screenY * 240
			local x0 = max(0, ceil(-posx))
			local x1 = min(w, ceil(240 - posx))
			local stripeSkew = (y * -2.5) // 1
			for x = x0, x1 - 1 do
				local col = c[x + srcRow]
				if col ~= bkg then
					local screenX = posx + x
					if col == 3 then
						local threshold = stripeThresholds[(x + stripeSkew) % 240]
						if threshold and bayer[screenRow + screenX] > threshold then
							col = 4
						end
					elseif col == 2 then
						local threshold = stripeThresholds[(x + stripeSkew) % 240]
						if threshold and bayer[screenRow + screenX] > threshold then
							col = 3
						end
						-- elseif col == 1 then
						-- 	local threshold = stripeThresholds[(x + stripeSkew) % TIC_WIDTH()]
						-- 	if threshold and bayer[screenRow + screenX] > threshold then
						-- 		col = 2
						-- 	end
					end
					pix(screenX, screenY, col)
				end
			end
		end
	end
end

C03_emitter1TopEdge = {
	x0 = 2,
	y0 = 55,
	width = 41, -- 164/4 =
	height = 21,

	d0 = { -336, 118 }, -- direction vector at start of emitter line. (not normalized yet)
	d1 = { -314, 146 }, -- direction vector at end of emitter line. (not normalized yet)
}
C03_emitter1RightEdge = {
	x0 = 43,
	y0 = 76,
	width = 0,
	height = 6,

	d0 = { -314, 146 },
	d1 = { -314, 146 },
}
C03_emitter2 = { -- side thing on main ship
	x0 = 43 + 51,
	y0 = 74,
	width = -10,
	height = 11,

	d0 = { -314, 146 },
	d1 = { -314, 146 },
}
C03_emitter3Ship01 = { -- small bottom ship.
	x0 = 2,
	y0 = 25,
	width = 10,
	height = 5,

	d0 = { -50, 26 },
	d1 = { -38, 19 },
}
C03_emitter5Ship02 = { -- small top ship: big vertical booster
	x0 = 2,
	y0 = 6,
	width = 3,
	height = 74,

	d0 = { -46, 10 },
	d1 = { -50, 18 },
}
-- small top ship: tiny booster. to make the direction consistent with the big vertical booster, just copy it and shift right.
C03_emitter4Ship02 = deepcopy(C03_emitter5Ship02)
C03_emitter4Ship02.x0 = C03_emitter4Ship02.x0 + 13
C03_emitter4Ship02.width = 7

function C03_CreateBoosterStreakSystem(edge, t0, t1)
	-- define the emitter segment of the provided edge.
	local emitterP0 = PointAlongLine(edge, t0)
	local emitterP1 = PointAlongLine(edge, t1)
	local d0 = lerp(edge.d0, edge.d1, t0)
	local d1 = lerp(edge.d0, edge.d1, t1)

	return CreateBoosterStreaks({
		emitterX0 = emitterP0[1],
		emitterY0 = emitterP0[2],
		emitterX1 = emitterP1[1], -- orig + width
		emitterY1 = emitterP1[2], -- orig + height
		direction0X = d0[1],
		direction0Y = d0[2],
		direction1X = d1[1],
		direction1Y = d1[2],
	})
end

function Construction03_init()
	vbank(0)
	cls()
	vbank(1)
	cls()
	vbank(0)

	C03_bg = createCachedSprite("C3_Bg_ditter", 0, 0)

	C03_sprites = deepcopy(C03_spriteTemplate)

	C03_streaksBigShip = {
		C03_CreateBoosterStreakSystem(C03_emitter1TopEdge, 0.0, 0.33),
		C03_CreateBoosterStreakSystem(C03_emitter1TopEdge, 1.0, 0.66),
		C03_CreateBoosterStreakSystem(C03_emitter1RightEdge, 0.0, 1.0),
		C03_CreateBoosterStreakSystem(C03_emitter2, 0.0, 1.0),
	}

	C03_streaksShip01 = {
		C03_CreateBoosterStreakSystem(C03_emitter3Ship01, 0.0, 1.0),
	}

	C03_streaksShip02 = {
		C03_CreateBoosterStreakSystem(C03_emitter4Ship02, 0.22, 0.3),
		C03_CreateBoosterStreakSystem(C03_emitter5Ship02, 0.0, 0.33),
	}
end

function Construction03(tt, beats, somaticState, sceneTime)
	local t = sceneTime.wallMillis
	math.randomseed(t)

	for _, s in ipairs(C03_streaksBigShip) do
		UpdateBoosterStreaks(s, somaticState.wallDeltaMillis)
	end

	for _, s in ipairs(C03_streaksShip01) do
		UpdateBoosterStreaks(s, somaticState.wallDeltaMillis)
	end

	for _, s in ipairs(C03_streaksShip02) do
		UpdateBoosterStreaks(s, somaticState.wallDeltaMillis)
	end

	cls()

	drawCachedSprite(C03_bg)

	local it = 1

	-- draw sprites
	for i = 1, #C03_sprites do
		-- update
		C03_sprites[i][2] = C03_sprites[i][2] - it * C03_sprites[i][4]
		if C03_sprites[i][2] < -200 then
			C03_sprites[i][2] = C03_sprites[i][2] + 500
		end
		C03_sprites[i][3] = C03_sprites[i][3] + it * C03_sprites[i][4] * 0.3
		if C03_sprites[i][3] > 140 then
			C03_sprites[i][3] = C03_sprites[i][3] - 500
		end

		-- draw
		drawSprite(C03_sprites[i][1], C03_sprites[i][2], C03_sprites[i][3])
	end

	local shipPosX = 30 + sin(t / 2000) * 2
	local shipPosY = 20 + sin(t / 1000) * 2
	C03_DrawSpriteStripped("C3_BigShip", shipPosX, shipPosY, t)
	for _, s in ipairs(C03_streaksBigShip) do
		RenderBoosterStreaks(s, shipPosX, shipPosY)
	end

	-- bottom right ship
	--drawSprite("C3_Ship01", 170 + sin(t/1800+123)*2, 90 + sin(t/900+13)*2)
	shipPosX = 170 + sin(t / 1800 + 123) * 2
	shipPosY = 90 + sin(t / 900 + 13) * 2
	C03_DrawSpriteStripped("C3_Ship01", shipPosX, shipPosY, t + 1260)
	for _, s in ipairs(C03_streaksShip01) do
		RenderBoosterStreaks(s, shipPosX, shipPosY)
	end

	-- top left ship
	--drawSprite("C3_Ship02",30 + sin(t/1700+23)*1.5,16 + sin(t/800+3)*2)
	shipPosX = 30 + sin(t / 1700 + 23) * 1.5
	shipPosY = 16 + sin(t / 800 + 3) * 2
	C03_DrawSpriteStripped("C3_Ship02", shipPosX, shipPosY, t / 2 + 2260)
	for _, s in ipairs(C03_streaksShip02) do
		RenderBoosterStreaks(s, shipPosX, shipPosY)
	end

	-- transition into scene: screen glitch.
	local transitionLenBeats = 3
	local transition01 = 1 - clamp01(sceneTime.demoBeats / transitionLenBeats)
	local glitchAmt = transition01 ^ 2
	if glitchAmt > 0.05 then
		screen_glitch(t, 13, glitchAmt)
	end
end

SS_st = 0

function SphereScenes_init()
	SS_st = time()
	vbank(0)
	cls()
	vbank(1)
	cls()
	vbank(0)
end

local SS_sprites = {
	{ "SS_Stage1_Frame01", 0, -0, 1 },
	{ "SS_Stage1_Frame02", 350, -80, 1 },
	{ "ContainerRed", 640, -230, 1 },
	{ "ContainerSmall_01", 140, -120, 1 },
	{ "ContainerSmall_01", 170, -100, 1 },
	{ "Beam", 250, -200, 2 },
}

function welder(x, y, t)
	local id = t // 60 % 6 + 1
	local spr_id1 = "SS_Welder_" .. string.format("%02d", id)
	drawSprite(spr_id1, x, y)
end

function drawWelders(welders, frameRefX, frameRefY, t)
	for i = 1, #welders do
		local w = welders[i]
		if t < w[1] then
			welder(frameRefX + w[4], frameRefY + w[5], t)
		elseif t > w[2] then
			local dx = 0
			if w[6] ~= 0 then
				dx = (w[2] - w[1]) // w[6]
			end
			local dy = 0
			if w[7] ~= 0 then
				dy = (w[2] - w[1]) // w[7]
			end
			welder(frameRefX + w[4] + dx, frameRefY + w[5] + dy, t)
		else
			local dx = 0
			if w[6] ~= 0 then
				dx = (t - w[1]) // w[6]
			end
			local dy = 0
			if w[7] ~= 0 then
				dy = (t - w[1]) // w[7]
			end
			drawSprite("SS_Welder_06", frameRefX + w[4] + dx, frameRefY + w[5] + dy)
		end
	end
end

SS_sunGradient = { 12, 4, 3, 2, 1, 3, 4 }

function RenderSun(cx, cy, r, grad, t)
	--local cx, cy, r = 120, 68, 60
	--local cx, cy, r = 120, 68, 120

	local invR = 1 / r
	local phase = t * -0.00017
	--local rotation = t * 0.0001
	local scale = 3 + math.sin(t / 20000) * 2

	-- don't put these in the shader for performance.
	local phasev2 = phase * 1.6
	local phasev3 = phase * 0.61
	local scalev1 = scale * 9
	local scalev2 = scale * 12
	local scalev3 = scale * 7
	--local cr, sr = cos(rotation), sin(rotation)

	--circ(cx, cy, r + 3, 8)
	--circ(cx, cy, r + 1, 9)

	ShadeCircleBayerHack(cx, cy, r, grad, function(screenX, screenY)
		local x = (screenX - cx) * invR -- normalize
		local y = (cy - screenY) * invR
		local z = sqrt(1 - x * x - y * y) -- unit sphere

		local waves = sin(scalev1 * x + 5 * y + phase)
			+ sin(scalev2 * z - 7 * y - phasev2)
			+ sin(scalev3 * (x + z + y) + phasev3)
		--return z * (waves + 2) * 0.5 * (3 * (F11_particleStreakIntensity + 1))
		return z * (waves + 2) * (0.5 + (3 - 0.5) * F11_GetParticleStreakIntensity())

		-- interaction with rotated coords looks cool but is subtle and costs a lot of CPU
		-- local px = cr*x - sr*z
		-- local pz = sr*x + cr*z
	end, t)
end

function SphereScenes_1(tt)
	local t = (tt - SS_st)
	math.randomseed(t)

	--cls()
	vbank(0)
	RenderSun(120, 68, 120, SS_sunGradient, t)

	vbank(1)
	cls()
	local frameRefX = -120 + t // 120
	local frameRefY = -t // 120
	drawSprite("SS_Stage1_Frame03", frameRefX - 185, frameRefY)
	drawSprite("SS_Stage1_Frame01", frameRefX, frameRefY)
	drawSprite("SS_Stage1_Frame02", frameRefX + 185, frameRefY)
	drawSprite("SS_Stage1_Frame01", frameRefX + 52, frameRefY + 105)
	drawSprite("SS_Stage1_Frame01", frameRefX + 52 - 185, frameRefY + 105)
	drawSprite("SS_Stage1_Frame03", frameRefX + 52 + 185, frameRefY + 105)
	drawSprite("SS_Stage1_Frame03", frameRefX + 104 - 185, frameRefY + 210)
	drawSprite("SS_Stage1_Frame01", frameRefX + 104, frameRefY + 210)
	drawSprite("SS_Stage1_Frame02", frameRefX + 104 + 185, frameRefY + 210)

	-- start, end, id, posx, posy, dx, dy
	local welders = {
		{ 0, 2000, nil, 100, 100, 60, 0 },
		{ 3000, 6000, nil, 180, 104, 60, 0 },
		{ 2000, 10000, nil, 100, 50, 60, -33 },
		{ 0, 0, nil, 70, 148, 0, 0 },
		{ 1000, 20000, nil, 170, 194, 60, 0 },
	}

	drawWelders(welders, frameRefX, frameRefY, t)
	vbank(0)
end

function SphereScenes_2(tt)
	local t = (tt - SS_st)
	math.randomseed(t)

	--cls()
	vbank(0)
	RenderSun(120, 68, 120, SS_sunGradient, t)

	vbank(1)
	cls()
	local frameRefX = -120 + t // 120 -- -65+120-t//120
	local frameRefY = -t // 120 -- -56+t//120
	drawSprite("SS_Stage2_Frame01", frameRefX - 185, frameRefY)
	drawSprite("SS_Stage2_Frame01", frameRefX, frameRefY)
	drawSprite("SS_Stage2_Frame02", frameRefX + 185, frameRefY)
	drawSprite("SS_Stage2_Frame01", frameRefX + 52, frameRefY + 105)
	drawSprite("SS_Stage2_Frame01", frameRefX + 52 - 185, frameRefY + 105)
	drawSprite("SS_Stage2_Frame02", frameRefX + 52 + 185, frameRefY + 105)
	drawSprite("SS_Stage2_Frame02", frameRefX + 104 - 185, frameRefY + 210)
	drawSprite("SS_Stage2_Frame01", frameRefX + 104, frameRefY + 210)
	drawSprite("SS_Stage2_Frame02", frameRefX + 104 + 185, frameRefY + 210)

	-- start, end, id, posx, posy, dx, dy
	local welders = {
		{ 0, 6000, nil, 100, 100, 60, 0 },
		--{6000,10000, nil, 110, 46, 60,-33},
		{ 0, 1000, nil, 70, 148, 0, 0 },
		{ 0, 1000, nil, 190, 192, 60, 0 },
		{ 6000, 10000, nil, 170, 202, 60, 0 },
	}

	drawWelders(welders, frameRefX, frameRefY, t)

	drawSprite("SS_Ship_up", frameRefX + 20 + t // 45, frameRefY + 300 - t // 30)
	vbank(0)
end

function SphereScenes_3(tt)
	local t = (tt - SS_st)
	math.randomseed(t)

	--cls()
	vbank(0)

	RenderSun(120, 68, 120, SS_sunGradient, t)

	vbank(1)
	cls()

	local frameRefX = -120 + t // 120
	local frameRefY = -t // 120
	drawSprite("SS_Stage2_Frame01", frameRefX - 185, frameRefY)
	drawSprite("SS_Stage2_Frame01", frameRefX, frameRefY)
	drawSprite("SS_Stage2_Frame02", frameRefX + 185, frameRefY)
	drawSprite("SS_Stage2_Frame01", frameRefX + 52, frameRefY + 105)
	drawSprite("SS_Stage2_Frame01", frameRefX + 52 - 185, frameRefY + 105)
	drawSprite("SS_Stage2_Frame02", frameRefX + 52 + 185, frameRefY + 105)
	drawSprite("SS_Stage2_Frame02", frameRefX + 104 - 185, frameRefY + 210)
	drawSprite("SS_Stage2_Frame01", frameRefX + 104, frameRefY + 210)
	drawSprite("SS_Stage2_Frame02", frameRefX + 104 + 185, frameRefY + 210)
	-- todo: match these one by one
	drawSprite("SS_Stage3_03", frameRefX + 76, frameRefY + 25)
	drawSprite("SS_Stage3_03", frameRefX + 82, frameRefY + 13)
	drawSprite("SS_Stage3_01", frameRefX + 53, frameRefY + 13)
	drawSprite("SS_Stage3_04", frameRefX + 135, frameRefY + 12)
	drawSprite("SS_Stage3_03", frameRefX + 134, frameRefY + 118)
	drawSprite("SS_Stage3_04", frameRefX + 171, frameRefY + 153)
	drawSprite("SS_Stage3_03", frameRefX + 186, frameRefY + 181)
	drawSprite("SS_Stage3_04", frameRefX + 266, frameRefY + 13)
	drawSprite("SS_Stage3_02", frameRefX + 250, frameRefY + 118)
	drawSprite("SS_Stage3_03", frameRefX + 258, frameRefY + 118)
	drawSprite("SS_Stage3_02", frameRefX + 257, frameRefY + 132)
	drawSprite("SS_Stage3_03", frameRefX - 51, frameRefY + 118)
	drawSprite("SS_Stage3_01", frameRefX - 80, frameRefY + 118)
	drawSprite("SS_Stage3_01", frameRefX + 1, frameRefY + 117)

	-- start, end, id, posx, posy, dx, dy
	local welders = {
		{ 0, 6000, nil, 100, 100, 60, 0 },
		--{6000,10000, nil, 110, 46, 60,-33},
		{ 0, 1000, nil, 70, 148, 0, 0 },
		{ 0, 1000, nil, 190, 192, 60, 0 },
		{ 6000, 10000, nil, 170, 202, 60, 0 },
	}

	drawWelders(welders, frameRefX, frameRefY, t)

	drawSprite("SS_Ship_up", 20 + t // 45, 136 - t // 30)
	drawSprite("SS_Ship_up", -60 + t // 45, 236 - t // 30)
	vbank(0)
end

Tunnel2_st = 0

function Tunnel2_init()
	Tunnel2_st = time()
	vbank(0)
	cls()
	vbank(1)
	cls()
	vbank(0)

	math.randomseed(Tunnel2_st)

	local num_stars = 250
	for i = 1, num_stars do
		table.insert(Tunnel2_stars, {
			x = math.random(-120, 120),
			y = math.random(-68, 68),
			z = math.random(-100, 0),
		})
	end
end

Tunnel2_stars = {}

function Tunnel2(tt)
	local t = (tt - Tunnel2_st)
	math.randomseed(t)

	cls()

	--math.randomseed(404)
	local cx = 60 -- off center a bit
	local cy = 68
	for _, s in ipairs(Tunnel2_stars) do
		-- update
		s.z = s.z - 1.5
		if s.z <= -100 then
			s.z = 0
			s.x = math.random(-120, 120)
			s.y = math.random(-68, 68)
		end

		-- Project 3D to 2D
		local k = 64 / s.z
		local px = cx + s.x * k
		local py = cy + s.y * k

		-- Previous position, for streak line length
		local k_old = 64 / (s.z + 3)
		local ox = cx + s.x * k_old
		local oy = cy + s.y * k_old

		if ox >= 0 and ox < 240 and oy >= 0 and oy < 136 then
			line(ox, oy, px, py, 12)
		end
	end

	local shipPosX = 10 + math.sin(t / 250) * 2 * math.sin(t / 530)
	local shipPosY = 20 + math.sin(t / 6000 + math.sin(t / 100) * 2 * math.sin(t / 1000)) * 2

	drawSprite("Tunnel2_Engine", shipPosX + 20 + math.sin(t / 20) * 0.2, shipPosY + 12 + math.sin(t / 200) * 0.5)
	drawSprite("Tunnel2_Engine", shipPosX + 74 + math.sin(t / 18) * 0.2, shipPosY + 12 + math.sin(t / 201) * 0.5)

	drawSprite("Tunnel2_Ship", shipPosX, shipPosY + 20)

	local paddings = { 1, 2, 2, 5, 5, 5, 3, 8, 7, 5 }
	local shine_id = t // 30 % 10 + 1
	local spr_id = "Tunnel2_Shine_" .. string.format("%02d", shine_id)
	local w = sprites[spr_id].w
	local h = sprites[spr_id].h
	local tw = 197
	local th = 65
	local ox = shipPosX + paddings[shine_id]
	local oy = shipPosY + 20
	drawSprite(spr_id, ox, oy)
end

EndScene_st = 0

function EndScene_init()
	EndScene_st = time()
	vbank(0)
	cls()
	vbank(1)
	cls()
	vbank(0)

	TwinkleSetStarPositions({
		{ 167, 32 },
		{ 18, 100 },
		{ 62, 20 },
		{ 152, 60 },
		{ 200, 30 },
	})
end

function EndScene(tt, _, somaticState, sceneTime)
	local t = (tt - EndScene_st)

	vbank(0)
	-- cant use cls() on vbank0 because of optimization
	-- gradually hide the sun
	if t < 1000 then
		RenderSun(65, 61, 8, { 12, 4, 3, 2, 1, 3, 4 }, t)
	elseif t < 2000 then
		RenderSun(65, 61, 8, { 12, 4, 3, 0, 0, 0, 4 }, t)
	elseif t < 3000 then
		RenderSun(65, 61, 8, { 12, 4, 0, 0, 3 }, t)
	elseif t < 4000 then
		RenderSun(65, 61, 8, { 3, 4, 0, 0, 1 }, t)
	elseif t < 5000 then
		RenderSun(65, 61, 8, { 3, 2, 0, 0, 1 }, t)
	elseif t < 6000 then
		RenderSun(65, 61, 8, { 1, 2, 0, 0, 1 }, t)
	elseif t < 7000 then
		RenderSun(65, 61, 8, { 0, 1, 0, 1 }, t)
	else
		cls()
	end

	vbank(1)
	cls()
	math.randomseed(123)
	stars_side(10000 + t, 0, 0)
	math.randomseed(t)

	local moonX = 10
	local moonY = 10
	drawSprite("End_Moon", moonX, moonY)
	if t > 7000 then
		drawSprite("End_Moon_Lights", moonX + 7, moonY + 8)
	end

	local planetX = 68
	local planetY = 34
	drawSprite("End_Planet", planetX, planetY)
	if t > 7000 then
		drawSprite("End_Planet_Lights", planetX + 1, planetY + 6)
	end

	local sat1X = 44
	local sat1Y = 80
	drawSprite("End_Sat_03", sat1X, sat1Y)

	local sat2X = 90
	local sat2Y = 40
	drawSprite("End_Sat_01", sat2X, sat2Y)

	local sat3X = 174 - t / 5000
	local sat3Y = 10
	drawSprite("End_Sat_02", sat3X, sat3Y)

	if t > 10000 then
		drawSprite("End_LogoLines", 0, 0)
		drawSprite("End_ORing2", 41, 38)
		drawSprite("End_Title", 37, 44)
		circb(65, 61, 10, 12)
		pix(65, 61, 12)
	end

	TwinkleTick(somaticState, "starz")
	vbank(0)
end

HUD_01_st = 0

function rim(x, y, w, q, c)
	for i = 0, q do
		local r = w * math.sqrt(1 - math.random() * math.random())
		local theta = math.random() * 2 * math.pi
		local px = x + r * math.cos(theta)
		local py = y + r * math.sin(theta)
		pix(px, py, c)
	end
end

function HUD_01_init()
	HUD_01_st = time()

	vbank(0)
	cls()
	vbank(1)
	cls()
	vbank(0)
end

function HUD_01_Scene(tt)
	local t = (tt - HUD_01_st)

	cls()

	for i = 1, 240 do
		for j = 1, 220, 10 do
			--rim(j,66,1,1,10-i/4)
			pix(math.random(i), math.random(j), math.random(i))
		end
		--pix(math.random(i),math.random(i),math.random(i))
		rim(100 + t / 200, 65, 60 - i, 40, 10 - i / 4)
		--pix(230-i/4,150-i/4,i/16)
	end

	for y = 0, 136, 2 do
		for x = 0, 240 do
			pix(x, y, pix(x, y) / 2)
		end
	end

	-- box header left
	local bx = 16
	local by = 48
	local wid = 40
	local hei = 8
	if t // 120 % 2 >= 1 then
		rect(bx, by, wid, hei, 2)
	end
	rectb(bx, by, wid, hei, 6)

	rect(bx, by + hei + 2, wid, hei * 4, 0)
	rectb(bx, by + hei + 2, wid, hei * 4, 6)
	local prsd = string.sub("crit lvl 4\ninit dyson\ncontainer\nprotocol", 0, t // 140)
	print(prsd, bx + 3, by + hei + 5, 6, false, 1, true)

	-- box bottom right
	if t // 120 % 2 >= 1 then
		local px = 178
		local py = 118
		rect(px, py, 46, 11, 0)
		rectb(px, py, 46, 11, 6)
		print(string.format("%.0f", (20000 + t) // 15), px + 20, py + 3, 2)
	end

	--drawSprite("HUD_01",0,0)
	drawSprite("HUD_02", 0, 0)
	drawSprite("HUD_Frame", 0, 0)

	if t // 120 % 2 >= 1 then
		print("Flare Alert!", 80, 8, 2)
		poke(0x3FF8, 2)
	else
		poke(0x3FF8, 0)
	end
end

function HUD_02_init()
	HUD_02_st = time()

	vbank(0)
	cls()
	vbank(1)
	cls()
	vbank(0)
end

function HUD_02_Scene(tt)
	local t = (tt - HUD_02_st)

	cls()
	drawSprite("HUD2_Background", 0, 0)

	local greets = {
		{ "Spectrox", "Agenda", "Otomata Labs", "TBL", "Spectrals", "Accession", "konsumer" },
		{ "TTE", "Slipstream", "SIMurai", "Damage", "Forsaken", "Marquee Design", "Joker" },
		{ "Altair", "AbCr", "Oftenhide", "Dreamweb", "Rift", "BionFX", "Elude" },
		{ "Rabenauge", "Abyss C", "Haujobb", "K2", "Akronyme A", "Stargaze" },
		{ "Desire", "Nah Kolor", "TPOLM", "RBBS", "Poo-brain", "Hornet" },
	}

	local idx = t // 2000 % #greets + 1

	local grt = greets[idx]

	for i = 1, #grt do
		local width = print(grt[i], 240, 0, 1)
		local posX = 87 + math.sin(t / 2000 + (i * 6.28) / #grt + idx * 10) * 40
		local posY = 70 + math.cos(t / 2000 + (i * 6.28) / #grt + idx) * 18
		circb(posX - 6, posY + 4, 2, 6)
		line(posX - 6, posY + 6, 87, 120, 6)
		print(grt[i], posX - width * 0.5, posY - 4, 6 * ((t + i * 100) // 200 % 2 + 1))
	end

	-- screen on side
	drawSprite("HUD2_Consoleoverlay", 195, 60)
	-- todo some techy animation of the dyson

	-- bar on bottom
	barY = 2
	drawSprite("HUD2_Infobar", 0, barY)
	--[[if t//200%4 > 1 then
		print("sectors",50,114,6,false,2)
	else
		print("called",50,114,6,false,2) 
	end--]]
	if t // 100 % 4 > 1 then
		print("coordinating with\nneighbour sectors", 50, barY + 12, 6, false)
	end
end

scene_frame = 0
-- the scene orchestrator tracks scene-based timing, so scenes have a stable timing
-- reference.
scene_timing_start = nil
scene_timing = {
	demoMillis = 0,
	demoBeats = 0,
	wallMillis = 0,
}
current_scene_id = 1
show_hud = false
show_palette = false
last_somatic_state = nil
hmr_request = nil -- for HMR, tells TIC() to init.
mouse_origin = nil -- set explicit origin with 'o' for measuring distances
hud_messages = {}
is_booting = true
boot_start_time = time()

scenes = {
	{ -- missing "Space" on logo
		init = no_fn,
		frame = Frame01, -- ship docking
		name = "Frame01",
		bdr = no_fn,
		start = 0,
		row = 0,
		rowHandler = TwinkleRowHandler, -- row handlers are called once every music row.
	},
	{
		init = Frame02_init,
		frame = Frame02, -- planets with ships in orbit
		name = "Frame02",
		bdr = no_fn,
		start = 4,
		row = 0,
		rowHandler = TwinkleRowHandler,
	},
	{ -- missing credits on left maybe?
		init = no_fn,
		frame = Frame03, -- cargo ship flying over slabs
		name = "Frame03",
		bdr = no_fn,
		start = 6,
		row = 0,
		rowHandler = TwinkleRowHandler,
	},
	{
		init = Frame05_notraces,
		frame = Frame05, -- stationary orbit 5a
		name = "Frame05",
		bdr = no_fn,
		start = 8,
		row = 0,
		rowHandler = TwinkleRowHandler,
	},
	{
		init = Frame05b_notraces,
		frame = Frame05b, -- stationary orbit 5b
		name = "Frame05b",
		bdr = no_fn,
		start = 9,
		row = 0,
	},
	{ -- maybe needs a hud surrounding of some sort?
		init = HUD_01_init,
		frame = HUD_01_Scene,
		name = "HUD_01_Scene",
		bdr = no_fn,
		start = 10,
		row = 0,
	},
	{
		init = Frame05_init,
		frame = Frame05, -- 5a ships leaving
		name = "Frame05",
		bdr = no_fn,
		start = 11,
		row = 0,
	},
	{
		init = Frame05b_init,
		frame = Frame05b, -- 5b ships leaving
		name = "Frame05b",
		bdr = no_fn,
		start = 12,
		row = 0,
	},
	{ -- not synced to music, does it matter?
		init = Frame06_init,
		frame = Frame06, -- dune ships leaving
		name = "Frame06",
		bdr = no_fn,
		start = 13,
		row = 0,
	},
	{ -- needs sharper turns on bezier, better thruster anim and syncs
		init = Frame07_init,
		frame = Frame07, -- big ship, ships leaving
		name = "Frame07",
		bdr = no_fn,
		start = 14,
		row = 0,
	},
	{
		init = Frame04_init,
		frame = Frame04, -- take off
		name = "Frame04",
		bdr = no_fn,
		start = 15,
		row = 0,
	},
	{
		init = Frame08_init,
		frame = Frame08, -- modules undocking
		name = "Frame08",
		bdr = no_fn,
		start = 16,
		row = 32,
	},
	{
		init = tunnel_init,
		frame = tunnel,
		name = "tunnel",
		bdr = no_fn,
		start = 19,
		row = 0,
		rowHandler = tunnel_music_row,
	},
	{ -- hud greets
		init = HUD_02_init,
		frame = HUD_02_Scene,
		name = "HUD_02_Scene",
		bdr = no_fn,
		start = 21,
		row = 0,
	},
	{
		init = Frame11_init,
		frame = Frame11, -- plasma orbit
		name = "Frame11",
		bdr = no_fn,
		start = 23,
		row = 0,
	},
	{
		init = Construction03_init,
		frame = Construction03, -- industrial planet elements
		name = "Construction03",
		bdr = no_fn,
		start = 25,
		row = 0,
	},
	{ -- sync to music, right order of sequence?
		init = Construction01_init,
		frame = Construction01, -- welding
		name = "Construction01",
		bdr = no_fn,
		start = 28,
		row = 0,
		rowHandler = C01_music_row,
	},
	{
		init = Tunnel2_init,
		frame = Tunnel2,
		name = "Tunnel2",
		bdr = no_fn,
		start = 29,
		row = 0,
	},
	{
		init = Construction02_init,
		frame = Construction02, -- ships departing big dock with parts
		name = "Construction02",
		bdr = no_fn,
		start = 31,
		row = 0,
	},
	{
		init = SphereScenes_init,
		frame = SphereScenes_1,
		name = "SphereScenes_1",
		bdr = no_fn,
		start = 33,
		row = 0,
	},
	{
		init = SphereScenes_init,
		frame = SphereScenes_2,
		name = "SphereScenes_2",
		bdr = no_fn,
		start = 34,
		row = 0,
	},
	{
		init = SphereScenes_init,
		frame = SphereScenes_3,
		name = "SphereScenes_3",
		bdr = no_fn,
		start = 35,
		row = 0,
	},
	{
		init = EndScene_init,
		frame = EndScene,
		name = "EndScene",
		bdr = no_fn,
		start = 36,
		row = 0,
		rowHandler = TwinkleRowHandler,
	},
	{
		init = Frame09_init,
		frame = Frame09, -- xray luggage
		name = "Frame09",
		bdr = no_fn,
		start = 39,
		row = 0,
	},
}

function ResetSceneTiming()
	scene_timing_start = nil
	scene_timing.demoMillis = 0
	scene_timing.demoBeats = 0
	scene_timing.wallMillis = 0
end

function UpdateSceneTiming(somaticState)
	if scene_timing_start == nil then
		scene_timing_start = {
			demoMillis = somaticState.demoMillis,
			demoBeats = somaticState.demoBeats,
			wallMillis = somaticState.wallMillis,
		}
	end

	scene_timing.demoMillis = somaticState.demoMillis - scene_timing_start.demoMillis
	scene_timing.demoBeats = somaticState.demoBeats - scene_timing_start.demoBeats
	scene_timing.wallMillis = somaticState.wallMillis - scene_timing_start.wallMillis
end

function SetScene(scene_id, do_seek)
	if scene_id >= 1 and scene_id <= #scenes then
		current_scene_id = scene_id
		scene_frame = 0
		ResetSceneTiming()
		TwinkleNewScene(current_scene_id)
		scenes[current_scene_id].init()
		if do_seek then
			somatic_seek(scenes[current_scene_id].start * 16)
		end
	end
end

function handleSomaticRow(state)
	local sceneRowHandler = scenes[current_scene_id].rowHandler
	if sceneRowHandler then
		sceneRowHandler(state)
	end
end

function BOOT()
	-- load same palette on both banks
	vbank(0)
	tomem(unpac(pal))
	vbank(1)
	tomem(unpac(pal))
	vbank(0)

	somatic_set_completion_callback(function()
		trace(" - SPACE LOGISTICS - ")
		exit()
	end)

	somatic_set_row_callback(handleSomaticRow)
end

function DemoTIC()
	hud_messages = {}
	local state = somatic_tick()

	--local track, playingSongOrder, currentFrame, currentRow = somatic_get_state()
	local track = state.demoPatternIndex
	local playingSongOrder = state.demoPatternIndex
	local currentRow = state.demoPatternRow

	if state.isPlaying then
		-- music is playing, update last known position
		lastKnownOrder = playingSongOrder
		lastKnownRow = currentRow
	end

	--hide cursor
	poke(16379, 2) -- hide cursor always in release

	-- get global music sync refs
	local _pO = state.demoPatternIndex --playingSongOrder
	local _row = state.demoPatternRow --peek(0x13FFE)

	if
		current_scene_id < #scenes
		and _pO >= scenes[current_scene_id + 1].start
		and _row >= scenes[current_scene_id + 1].row
	then
		current_scene_id = current_scene_id + 1
		scene_frame = 0
		ResetSceneTiming()
		scenes[current_scene_id].init()
	end
	UpdateSceneTiming(state)
	scenes[current_scene_id].frame(time(), state.demoBeats, state, scene_timing)

	scene_frame = scene_frame + 1

	last_somatic_state = state
	somatic_end_frame()

	--print(current_scene_id .. " " .. _pO .. " " .. _row, 0, 130,12)
end

current_boot_task_index = 1
BootTasks = {
	-- load sprites
	loadFrame01Sprites,
	loadFrame02Sprites,
	loadFrame03Sprites,
	loadFrame04Sprites,
	loadFrame05Sprites,
	loadFrame06Sprites,
	loadFrame07Sprites,
	loadFrame08Sprites,
	loadFrame09Sprites,
	loadFrame11Sprites,
	loadC01Sprites,
	loadC02Sprites,
	loadC03Sprites,
	loadTunnelSprites,
	loadSSSprites,
	loadTunnel2Sprites,
	loadEndSceneSprites,
	loadHUDSprites,
}

function CIT()
	if is_booting then
		-- do 1 boot task per frame (it will stall still but at least we can show stepped progress)
		if current_boot_task_index <= #BootTasks then
			BootTasks[current_boot_task_index]()
			current_boot_task_index = current_boot_task_index + 1

			-- draw a progress bar.
			cls(0)
			local progress01 = current_boot_task_index / #BootTasks
			local barWidth = 199
			local barHeight = 13
			local barX = (240 - barWidth) // 2
			local barY = (136 - barHeight) // 2
			rect(barX, barY, barWidth, barHeight, 8)
			rect(barX, barY, barWidth * progress01, barHeight, 9)
		else
			is_booting = false
			-- init scene
			--trace(string.format("BOOT %.2f seconds", (time() - boot_start_time) / 1000))
			SetScene(current_scene_id, true)
		end
	else
		DemoTIC()
	end
end

function RDB(l)
	if not is_booting then
		scenes[current_scene_id].bdr(l)
	end
end
