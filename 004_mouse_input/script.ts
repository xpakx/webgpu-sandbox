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

	const context = canvas.getContext("webgpu");
	if(!context) {
		console.error("Cannot create WebGPU context");
		return;
	}

	const format: GPUTextureFormat = "bgra8unorm";
	context.configure({ device, format });


	const shader = await fetch('./shader.wgsl')
		.then((response) => response.text());


	const bindData = passCanvasSize(canvas, device);
	const pipelineLayout = device.createPipelineLayout({bindGroupLayouts: [bindData.layout]});
	const pipeline =  device.createRenderPipeline(
		{
			vertex: {
				module: device.createShaderModule({code: shader}),
				entryPoint: "vs_main",
			}, 
			fragment: {
				module: device.createShaderModule({code: shader}),
				entryPoint: "fs_main",
				targets: [{ format }],
			}, 
			primitive: { topology: "triangle-list" },
			layout: pipelineLayout,
		}
	);

	let mouse: Pos = { x: 0, y: 0 };
	canvas.addEventListener("mousemove", (event: MouseEvent) => {
		const rect = canvas.getBoundingClientRect();
		mouse.x = event.clientX - rect.left;
		mouse.y = event.clientY - rect.top;
	});

	var startTime = performance.now()
	function draw() {
		const time = (performance.now() - startTime)/1000.0;
		bindData.values[2] = mouse.x;
		bindData.values[3] = mouse.y;
		bindData.values[4] = time;
		device.queue.writeBuffer(bindData.buffer, 0, bindData.values.buffer, bindData.values.byteOffset, bindData.values.byteLength);

		const commandEncode = device.createCommandEncoder();
		const textureView = context!.getCurrentTexture().createView();
		const renderPass = commandEncode.beginRenderPass({
			colorAttachments: [{
				view: textureView,
				clearValue: {r: 0.1176, g: 0.1176, b: 0.1804, a: 1.0},
				loadOp: "clear",
				storeOp: "store",

			}],
		});
		renderPass.setPipeline(pipeline);
		renderPass.setBindGroup(0, bindData.group);
		renderPass.draw(6, 1, 0, 0);
		renderPass.end();
		device.queue.submit([commandEncode.finish()]);

		requestAnimationFrame(draw);
	}

	draw();
});

interface BindData {
	group: GPUBindGroup,
	layout: GPUBindGroupLayout,
	values: Float32Array,
	buffer: GPUBuffer,
}

interface Pos {
	x: number,
	y: number,
}

function passCanvasSize(canvas: HTMLCanvasElement, device: GPUDevice): BindData {
	const uniformBufferSize = 6 * 4;

	const uniformBuffer = device.createBuffer({
		size: uniformBufferSize,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	});

	const uniformValues = new Float32Array([canvas.width, canvas.height, 0, 0, 0]);

	device.queue.writeBuffer(uniformBuffer, 0, uniformValues.buffer, uniformValues.byteOffset, uniformValues.byteLength);

	const bindGroupLayout = device.createBindGroupLayout({
		entries: [{
			binding: 0,
			visibility: GPUShaderStage.FRAGMENT,
			buffer: {
				type: 'uniform',
			},
		}],
	});

	const bindGroup = device.createBindGroup({
		layout: bindGroupLayout,
		entries: [{
			binding: 0,
			resource: {
				buffer: uniformBuffer,
			},
		}],
	});

	return {group: bindGroup, layout: bindGroupLayout, values: uniformValues, buffer: uniformBuffer}
}
