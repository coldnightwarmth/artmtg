"""Blender-side helper that renders Clear Card GLBs into transparent 3D sprites."""

from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def parse_args() -> argparse.Namespace:
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--models-dir", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--only", default="", help="Optional model filename to render.")
    return parser.parse_args(argv)


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for datablock in list(datablocks):
            if datablock.users == 0:
                datablocks.remove(datablock)


def look_at(obj: bpy.types.Object, target: Vector) -> None:
    obj.rotation_euler = (target - obj.location).to_track_quat("-Z", "Y").to_euler()


def setup_scene() -> tuple[bpy.types.Object, bpy.types.Object]:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 512
    scene.render.resolution_y = 704
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = True
    scene.render.image_settings.color_depth = "8"
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.view_settings.exposure = 0.7
    scene.render.resolution_percentage = 100

    world = bpy.data.worlds.new("Clear Card World") if not scene.world else scene.world
    scene.world = world
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = (0.06, 0.075, 0.1, 1)
    background.inputs["Strength"].default_value = 0.45

    camera_data = bpy.data.cameras.new("Camera")
    camera = bpy.data.objects.new("Camera", camera_data)
    scene.collection.objects.link(camera)
    scene.camera = camera
    camera.location = (0.15, -0.18, 6.7)
    camera_data.type = "ORTHO"
    camera_data.ortho_scale = 4.05
    camera_data.lens = 52
    look_at(camera, Vector((0, 0, 0)))

    key_data = bpy.data.lights.new("Key", type="AREA")
    key_data.energy = 1150
    key_data.shape = "DISK"
    key_data.size = 4.2
    key = bpy.data.objects.new("Key", key_data)
    scene.collection.objects.link(key)
    key.location = (-3.6, 4.5, 5.8)
    look_at(key, Vector((0, 0, 0)))

    fill_data = bpy.data.lights.new("Fill", type="AREA")
    fill_data.energy = 780
    fill_data.color = (0.45, 0.68, 1.0)
    fill_data.size = 3.2
    fill = bpy.data.objects.new("Fill", fill_data)
    scene.collection.objects.link(fill)
    fill.location = (4.3, -2.6, 3.6)
    look_at(fill, Vector((0, 0, 0)))

    rim_data = bpy.data.lights.new("Rim", type="AREA")
    rim_data.energy = 900
    rim_data.color = (1.0, 0.36, 0.22)
    rim_data.size = 2.4
    rim = bpy.data.objects.new("Rim", rim_data)
    scene.collection.objects.link(rim)
    rim.location = (2.8, 3.8, -2.6)
    look_at(rim, Vector((0, 0, 0)))
    return scene, camera


def mesh_bounds(objects: list[bpy.types.Object]) -> tuple[Vector, Vector]:
    corners = [obj.matrix_world @ Vector(corner) for obj in objects if obj.type == "MESH" for corner in obj.bound_box]
    minimum = Vector((min(point.x for point in corners), min(point.y for point in corners), min(point.z for point in corners)))
    maximum = Vector((max(point.x for point in corners), max(point.y for point in corners), max(point.z for point in corners)))
    return minimum, maximum


def render_model(scene: bpy.types.Scene, model_path: Path, output_path: Path, index: int) -> None:
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=str(model_path))
    imported = [obj for obj in bpy.context.scene.objects if obj not in before]
    meshes = [obj for obj in imported if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError(f"No meshes found in {model_path}")

    root = bpy.data.objects.new(f"Clear Card {model_path.stem}", None)
    offset = bpy.data.objects.new(f"Clear Card Offset {model_path.stem}", None)
    scene.collection.objects.link(root)
    scene.collection.objects.link(offset)
    offset.parent = root
    top_level = [obj for obj in imported if obj.parent not in imported]
    for obj in top_level:
        obj.parent = offset

    minimum, maximum = mesh_bounds(meshes)
    center = (minimum + maximum) * 0.5
    size = maximum - minimum
    scale = min(1.95 / max(size.x, 0.0001), 2.82 / max(size.z, 0.0001))
    root.scale = (scale, scale, scale)
    offset.location = -center
    root.rotation_euler = (
        math.radians(-83 - (index % 3) * 2),
        math.radians(-15 + (index % 4) * 10),
        math.radians(-2.5 + (index % 2) * 5),
    )

    for mesh in meshes:
        mesh.visible_shadow = True
        for material in mesh.data.materials:
            if material is None:
                continue
            material.diffuse_color[3] = max(0.92, material.diffuse_color[3])
            material.use_nodes = True

    scene.render.filepath = str(output_path)
    bpy.context.view_layer.update()
    bpy.ops.render.render(write_still=True)

    bpy.data.objects.remove(root, do_unlink=True)
    if offset.name in bpy.data.objects:
        bpy.data.objects.remove(offset, do_unlink=True)
    for obj in imported:
        if obj.name in bpy.data.objects:
            bpy.data.objects.remove(obj, do_unlink=True)


def main() -> None:
    args = parse_args()
    models_dir = Path(args.models_dir)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    clear_scene()
    scene, _camera = setup_scene()
    model_paths = sorted(models_dir.glob("*.glb"))
    if args.only:
        model_paths = [path for path in model_paths if path.name == args.only]
    for index, model_path in enumerate(model_paths):
        output_path = output_dir / f"{model_path.stem}.png"
        if output_path.exists():
            continue
        print(f"Rendering {model_path.name} -> {output_path.name}", flush=True)
        angle_index = int(model_path.stem.rsplit("-", 1)[-1]) if model_path.stem.rsplit("-", 1)[-1].isdigit() else index
        render_model(scene, model_path, output_path, angle_index)


if __name__ == "__main__":
    main()
