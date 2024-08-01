document.addEventListener("DOMContentLoaded", async () => {
	console.log("DOM fully loaded and parsed");

	if (!navigator.gpu) {
		console.error("WebGPU not supported.");
		return;
	}

	console.log("Requesting adapter");
	const adapter = await navigator.gpu.requestAdapter();
	if (!adapter) {
		console.error("No adapter");
		return;
	}

	console.log("Requesting driver");
	const device = await adapter.requestDevice();
	if (!device) {
		console.error("No device");
		return;
	}

	const canvas = document.getElementById("canvas") as (HTMLCanvasElement | undefined);
	if(!canvas) {
		console.error("No canvas");
		return;
	}
	canvas.width = 800;
	canvas.height = 640;
});
