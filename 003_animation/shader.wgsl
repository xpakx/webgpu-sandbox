struct Uniforms {
  resolution: vec2f,
  time: f32,
};

@group(0) @binding(0)
var<uniform> uniforms: Uniforms;

@vertex
fn vs_main(@builtin(vertex_index) v_id: u32) -> @builtin(position) vec4f {
	let positions = array<vec2f, 6> (
			vec2f(-1.0, -1.0),
			vec2f(1.0, -1.0),
			vec2f(-1.0, 1.0),

			vec2f(-1.0, 1.0),
			vec2f(1.0, -1.0),
			vec2f(1.0, 1.0)
	);
	return vec4f(positions[v_id], 0.0, 1.0);
}

@fragment
fn fs_main(@builtin(position) FragCoord : vec4f) -> @location(0) vec4f {
	var uv = FragCoord.xy  / uniforms.resolution.xy;
	uv.x = sin(uv.x + uniforms.time);
	uv.y = sin(uv.y + uniforms.time);
	return vec4f(uv, 0.5019, 1.0);
}
