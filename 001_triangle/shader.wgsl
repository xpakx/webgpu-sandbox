struct Fragment {
	@builtin(position) Position: vec4f,
	@location(0) Color: vec4f,
};

@vertex
fn vs_main(@builtin(vertex_index) v_id: u32) -> Fragment {
	let positions = array<vec2f, 3> (
			vec2f(0.0, 0.5),
			vec2f(-0.5, -0.5),
			vec2f(0.5, -0.5),
	);
	let colors = array<vec3f, 3> (
			vec3f(1.0, 0.0, 0.0),
			vec3f(0.0, 1.0, 0.0),
			vec3f(0.0, 0.0, 1.0),
	);
	var output: Fragment;
	output.Position = vec4f(positions[v_id], 0.0, 1.0);
	output.Color = vec4f(colors[v_id], 1.0);
	return output;
}

@fragment
fn fs_main(@location(0) Color: vec4f) -> @location(0) vec4f {
	return Color;
}
