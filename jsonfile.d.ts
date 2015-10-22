declare module "jsonfile" {
	var spaces: number;
	function readFile(filename: string, options:any, callback:Function);
	function readFileSync(filename: string, options:any);
	function writeFile(filename: string, obj:any, options:any, callback:Function);
	function writeFileSync(filename: string, obj:any, options:any);
}