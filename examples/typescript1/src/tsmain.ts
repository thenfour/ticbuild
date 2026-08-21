

// const TIC = () => {
// 	cls(0);
// 	print(__EXPAND("$(project.name) (but typescript)"), 84, 64, 12);
// };

import { Lerp } from "./tsUtils";

// const typescriptTick = () => {
// 	cls(0);
// 	print(__EXPAND("$(project.name) (but typescript)"), 84, 64, 12);
// };


export function typescriptTick() {
	cls(0);
	const x = Lerp(0, 100, 0.5);
	print(__EXPAND("$(project.name)") + ` (${x})`, 84, 64, 12);
}

