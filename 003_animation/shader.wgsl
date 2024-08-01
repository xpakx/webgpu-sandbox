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

fn palette(t: f32) -> vec3f {
    let a = vec3f(0.5, 0.5, 0.5);
    let b = vec3f(0.5, 0.5, 0.5);
    let c = vec3f(1.0, 1.0, 1.0);
    let d = vec3f(0.1176, 0.1176, 0.1804);

    return a + b*cos(6.28318*(c*t+d) );
}

@fragment
fn fs_main(@builtin(position) FragCoord : vec4f) -> @location(0) vec4f {
	var uv = (FragCoord.xy * 2.0 - uniforms.resolution.xy) / uniforms.resolution.y;
	var uv0 = uv;
	var finalColor = vec3f(0.1176, 0.1176, 0.1804);

	for (var i: f32 = 0.0; i < 5.0; i = i + 1.0) {
		uv = fract(1.2 * uv) - 0.5;
		var d = length(uv) * exp(-length(uv0));
		var col = palette(length(uv0) + i*0.4 + uniforms.time*0.4);
		d = sin(d*8.0 + uniforms.time)/8.0;
		d = abs(d);
		d = pow(0.005 / d, 2.2);
		finalColor +=  col * d;
	}
	return vec4f(finalColor, 1.0);
}
