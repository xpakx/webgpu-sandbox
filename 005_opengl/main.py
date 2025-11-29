from pathlib import Path
import moderngl
import numpy as np


def load_shader(name: str):
    filename = f"shaders/{name}.glsl"
    path = Path(filename)
    return path.read_text()


def verify(data_a, data_b, results):
    reference = data_a * data_b
    if np.allclose(results, reference):
        print("\nGPU calculation matches CPU reference.")
    else:
        print("\nSomething went wrong.")


def main():
    ctx = moderngl.create_context(standalone=True)

    N = 1024*1024
    data_a = np.random.uniform(0.0, 10.0, N).astype('f4')
    data_b = np.random.uniform(0.0, 10.0, N).astype('f4')

    buffer_a = ctx.buffer(data_a)
    buffer_b = ctx.buffer(data_b)
    buffer_out = ctx.buffer(reserve=N * 4)

    buffer_a.bind_to_storage_buffer(binding=0)
    buffer_b.bind_to_storage_buffer(binding=1)
    buffer_out.bind_to_storage_buffer(binding=2)

    shader_source = load_shader("mult")
    program = ctx.compute_shader(shader_source)

    group_count = N // 256
    program.run(group_x=group_count)

    results = np.frombuffer(buffer_out.read(), dtype='f4')

    print(f"Input A first 5: {data_a[:5]}")
    print(f"Input B first 5: {data_b[:5]}")
    print(f"GPU Result first 5: {results[:5]}")

    verify(data_a, data_b, results)


if __name__ == "__main__":
    main()
