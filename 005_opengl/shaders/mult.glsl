#version 430

layout(local_size_x=256, local_size_y=1, local_size_z=1) in;

layout(std430, binding=0) buffer BufferA { float in_a[]; };
layout(std430, binding=1) buffer BufferB { float in_b[]; };
layout(std430, binding=2) buffer BufferOut { float out_product[]; };

void main() {
    uint index = gl_GlobalInvocationID.x;
    out_product[index] = in_a[index] * in_b[index];
}

