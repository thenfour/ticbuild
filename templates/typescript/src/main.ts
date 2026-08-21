const projectName = __EXPAND("$(project.name)");

export function TIC(): void {
  cls(0);
  print(projectName, 84, 64, 12);
}
