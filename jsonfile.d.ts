declare module "jsonfile" {
	var spaces: number;
	function readFile(filename: string, callback:Function, options?:any);
	function readFileSync(filename: string, options?:any);
	function writeFile(filename: string, obj:any, callback:Function, options?:any);
	function writeFileSync(filename: string, obj:any, options?:any);
}