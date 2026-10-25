"""Erzeugt eine separate DUNGEON-WANTED-Cartridge für den B²-Handheld.

Blender 4.2+, Scripting: Datei öffnen und Alt+P.
CLI: blender --background --python scripts/blender/build_cartridge.py -- --render
Vorhandene Szenen bleiben bestehen. Jede Ausführung erzeugt eigene Ausgaben.
"""

import argparse
import json
import math
import sys
from datetime import datetime
from pathlib import Path

import bpy
from mathutils import Vector

MM = 0.001
WIDTH = 56.0
HEIGHT = 54.0
DEPTH = 6.2
LABEL_WIDTH = 46.0
COLLECTION = None
ROOT = None


def material(name, color, roughness=0.6, metallic=0.0):
    """Erzeugt ein exportierbares PBR-Material ohne externe Abhängigkeiten."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.diffuse_color = (*color, 1.0)
    nodes = mat.node_tree.nodes
    nodes.clear()
    shader = nodes.new('ShaderNodeBsdfPrincipled')
    output = nodes.new('ShaderNodeOutputMaterial')
    mat.node_tree.links.new(shader.outputs['BSDF'], output.inputs['Surface'])
    shader.inputs['Base Color'].default_value = (*color, 1.0)
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Metallic'].default_value = metallic
    return mat


def register(obj, mat=None):
    """Ordnet neue Objekte ausschließlich der Cartridge-Sammlung zu."""
    for collection in list(obj.users_collection):
        collection.objects.unlink(obj)
    COLLECTION.objects.link(obj)
    obj.parent = ROOT
    if mat:
        obj.data.materials.append(mat)
    return obj


def box(name, size, position, mat, bevel=0.15):
    """Erzeugt eine maßhaltige, leicht abgerundete Gehäusekomponente."""
    bpy.ops.mesh.primitive_cube_add(size=1)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = tuple(value * MM for value in size)
    obj.location = tuple(value * MM for value in position)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    register(obj, mat)
    if bevel:
        modifier = obj.modifiers.new('Kunststoffkante', 'BEVEL')
        modifier.width = bevel * MM
        modifier.segments = 3
        obj.modifiers.new('Flächennormalen', 'WEIGHTED_NORMAL')
    return obj


def configure_world(world):
    """Baut die Studio-Welt ohne vorausgesetzte oder namensabhängige Knoten auf."""
    world.use_nodes = True
    nodes = world.node_tree.nodes
    nodes.clear()
    background = nodes.new('ShaderNodeBackground')
    output = nodes.new('ShaderNodeOutputWorld')
    background.inputs['Color'].default_value = (0.09, 0.09, 0.085, 1)
    background.inputs['Strength'].default_value = 0.15
    world.node_tree.links.new(background.outputs['Background'], output.inputs['Surface'])

def load_cover(image_path):
    """Lädt das unveränderte Etikett. Parameter: image_path – Bildpfad."""
    image = bpy.data.images.load(str(image_path), check_existing=False)
    image.colorspace_settings.name = 'sRGB'
    height = LABEL_WIDTH * image.size[1] / image.size[0]
    if height > 40:
        raise ValueError('Cover ist zu hoch. Bitte Querformat bis 46 × 40 mm verwenden.')
    image.pack()
    return image, height


def label_boundary(width, height):
    """Erzeugt abgerundete Etikettecken. Parameter: width, height – Maße in mm."""
    radius = 0.8
    boundary = []
    corners = [(width/2-radius, height/2-radius, 0),
               (-width/2+radius, height/2-radius, 90),
               (-width/2+radius, -height/2+radius, 180),
               (width/2-radius, -height/2+radius, 270)]
    for cx, cz, angle in corners:
        for step in range(7):
            a = math.radians(angle + step * 15)
            boundary.append((cx+radius*math.cos(a), cz+radius*math.sin(a)))
    return boundary


def label_mesh(height):
    """Baut ein korrekt ausgerichtetes UV-Netz. Parameter: height – Etiketthöhe."""
    boundary = label_boundary(LABEL_WIDTH, height)
    vertices = [(0, (DEPTH/2+0.18)*MM, 26.5*MM)]
    vertices += [(x*MM, (DEPTH/2+0.18)*MM, (26.5+z)*MM) for x, z in boundary]
    faces = [(0, 1+(i+1) % len(boundary), 1+i) for i in range(len(boundary))]
    mesh = bpy.data.meshes.new('Cover_UV')
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    uv = mesh.uv_layers.new(name='Cover')
    for polygon in mesh.polygons:
        for index in polygon.loop_indices:
            co = mesh.vertices[mesh.loops[index].vertex_index].co
            uv.data[index].uv = (0.5-co.x/(LABEL_WIDTH*MM), 0.5+(co.z/MM-26.5)/height)
    return mesh


def create_label(cover):
    """Verbindet Cover und Modell. Parameter: cover – Bildpfad."""
    image, height = load_cover(cover)
    obj = bpy.data.objects.new('CARTRIDGE_LABEL', label_mesh(height))
    COLLECTION.objects.link(obj)
    obj.parent = ROOT
    mat = material('Cartridge_Cover', (1, 1, 1), 0.78)
    nodes = mat.node_tree.nodes
    texture = nodes.new('ShaderNodeTexImage')
    texture.image = image
    shader = next(node for node in nodes if node.type == 'BSDF_PRINCIPLED')
    mat.node_tree.links.new(texture.outputs['Color'], shader.inputs['Base Color'])
    obj.data.materials.append(mat)
    obj['role'] = 'replaceable_cover'


def create_root():
    """Erzeugt den gemeinsamen Animationsdrehpunkt und exportierbare Metadaten."""
    global ROOT
    ROOT = bpy.data.objects.new('CARTRIDGE_ROOT', None)
    COLLECTION.objects.link(ROOT)
    ROOT['title'] = 'DUNGEON WANTED'
    ROOT['units'] = 'meters'
    ROOT['dimensions_mm'] = [WIDTH, DEPTH, HEIGHT]
    ROOT['origin'] = 'bottom_center'
    ROOT['actions'] = 'inspect,push_in,remove,blow,return_to_slot'


def create_materials():
    """Erzeugt matte Gehäuse- und Kontaktmaterialien."""
    return {'shell': material('Cartridge_Plastic', (0.28, 0.29, 0.26), 0.72),
            'edge': material('Cartridge_Edge', (0.32, 0.33, 0.30), 0.73),
            'dark': material('Cartridge_Recess', (0.065, 0.07, 0.055), 0.8),
            'gold': material('Cartridge_Contacts', (0.63, 0.43, 0.16), 0.34, 0.65),
            'pcb': material('Cartridge_PCB', (0.10, 0.20, 0.10), 0.7)}


def create_body(mats):
    """Baut Gehäusehälften und Fassung. Parameter: mats – Materialverzeichnis."""
    for side, name in [(-1, 'SHELL_BACK'), (1, 'SHELL_LABEL_SIDE')]:
        box(name, (WIDTH, 3.02, HEIGHT), (0, side*1.59, HEIGHT/2), mats['shell'], 0.8)
    box('SHELL_SEAM', (WIDTH-0.5, 0.10, HEIGHT-0.5), (0, 0, HEIGHT/2), mats['dark'], 0.1)
    box('LABEL_RECESS', (48, 0.14, 40.3), (0, 3.11, 26.5), mats['edge'], 0.25)
    box('BACK_INSET', (43, 0.2, 30), (0, -3.12, 30), mats['edge'], 0.4)
    box('TOP_GRIP', (37, 0.6, 3.5), (0, 3.08, 50.5), mats['edge'], 0.35)


def create_grips(mats):
    """Baut seitliche Führung und Griffstruktur. Parameter: mats – Materialverzeichnis."""
    for side in [-1, 1]:
        box('SIDE_RAIL_'+str(side), (1.5, 0.5, 40), (side*26.4, 3.10, 25), mats['edge'], 0.2)
        for i in range(5):
            box('GRIP_%s_%s' % (side, i), (5.5, 0.5, 0.65),
                (side*23.7, 3.1, 48.6+i*0.9), mats['edge'], 0.12)


def create_contacts(mats):
    """Baut stilisierte Leiterplatte und Kontaktfinger. Parameter: mats – Materialverzeichnis."""
    box('CONNECTOR_RECESS', (39, 0.12, 5.5), (0, -3.13, 3.5), mats['dark'], 0.3)
    box('CONNECTOR_BOARD', (36, 0.15, 4.3), (0, -3.22, 3.4), mats['pcb'], 0.1)
    for i in range(20):
        box('CONTACT_%02d' % i, (1.1, 0.06, 3.4), (-16.6+i*1.75, -3.33, 3.3), mats['gold'], 0.04)


def create_brand(mats):
    """Ergänzt die plastische Fantasiemarke. Parameter: mats – Materialverzeichnis."""
    bpy.ops.object.text_add(location=(0, 3.44*MM, 49.5*MM))
    text = bpy.context.object
    text.name = 'BENTENDO_EMBOSS'
    text.data.body = 'BENTENDO'
    text.data.align_x = 'CENTER'
    text.data.size = 2.1*MM
    text.data.extrude = 0.025*MM
    text.rotation_euler = (math.pi/2, 0, math.pi)
    register(text, mats['shell'])
    bpy.ops.object.convert(target='MESH')


def create_anchors():
    """Ergänzt stabile Anker für Griff, Kontaktkante und Etikett."""
    for name, position in [('CONTACT_ANCHOR', (0, 0, 0)),
                           ('GRIP_ANCHOR', (0, 0, HEIGHT)),
                           ('LABEL_ANCHOR', (0, DEPTH/2, 26.5))]:
        obj = bpy.data.objects.new(name, None)
        COLLECTION.objects.link(obj)
        obj.parent = ROOT
        obj.location = tuple(value*MM for value in position)


def create_model(cover):
    """Baut das vollständige eigenständige Modul. Parameter: cover – Bildpfad."""
    create_root()
    mats = create_materials()
    create_body(mats)
    create_grips(mats)
    create_contacts(mats)
    create_brand(mats)
    create_label(cover)
    create_anchors()


def create_scene():
    """Erzeugt eine separate Szene mit zurückhaltender Studiobeleuchtung."""
    scene = bpy.data.scenes.new('DUNGEON_WANTED_Cartridge')
    scene.collection.children.link(COLLECTION)
    scene.world = bpy.data.worlds.new('Cartridge_Studio')
    configure_world(scene.world)
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 48
    scene.render.resolution_x = scene.render.resolution_y = 1000
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.film_transparent = True
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.exposure = 0
    scene.view_settings.gamma = 1
    return scene


def aim_camera(scene, position):
    """Richtet die Kamera aus. Parameter: scene – Szene; position – Kameraposition."""
    scene.camera.location = position
    scene.camera.rotation_euler = (Vector((0, 0, 0.027))-scene.camera.location).to_track_quat('-Z', 'Y').to_euler()


def create_camera(scene):
    """Initialisiert auch manuelle F12-Render. Parameter: scene – Szene."""
    camera = bpy.data.objects.new('Cartridge_Camera', bpy.data.cameras.new('Cartridge_Camera'))
    scene.collection.objects.link(camera)
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = 0.08
    camera.data.clip_start = 0.001
    camera.data.clip_end = 10
    scene.camera = camera
    aim_camera(scene, (0.09, 0.17, 0.09))


def create_lights(scene):
    """Ergänzt schwache Flächenlichter. Parameter: scene – Szene."""
    for name, location, energy, size in [('Key', (0.07, 0.12, 0.14), 0.35, 0.12),
                                          ('Fill', (-0.10, 0.06, 0.06), 0.12, 0.10),
                                          ('Rim', (0.03, -0.10, 0.12), 0.20, 0.08)]:
        data = bpy.data.lights.new(name, 'AREA')
        data.energy, data.shape, data.size = energy, 'DISK', size
        light = bpy.data.objects.new(name, data)
        scene.collection.objects.link(light)
        light.location = location
        light.rotation_euler = (Vector((0, 0, 0.027))-light.location).to_track_quat('-Z', 'Y').to_euler()


def project_candidates():
    """Sammelt reale und virtuelle Blender-Pfade ohne feste Verzeichnistiefe."""
    candidates = [Path.cwd()]
    script = globals().get('__file__')
    text = getattr(getattr(bpy.context, 'space_data', None), 'text', None)
    for value in [script, text.filepath if text else None, bpy.data.filepath]:
        if value:
            candidates.append(Path(bpy.path.abspath(value)).expanduser().resolve().parent)
    return candidates


def find_project_root():
    """Sucht die aktuelle Projektstruktur ohne Indexzugriff auf parents."""
    for candidate in project_candidates():
        for folder in (candidate, *candidate.parents):
            if (folder/'assets/cartridge/dungeon-wanted.png').is_file():
                return folder
    return None


def create_collection():
    """Erzeugt eine eigene Modellsammlung und erhält vorhandene Szenen."""
    global COLLECTION
    COLLECTION = bpy.data.collections.new('B2_Cartridge_'+datetime.now().strftime('%H%M%S_%f'))
    bpy.context.scene.collection.children.link(COLLECTION)
    return bpy.context.scene


def export_model(scene, prefix):
    """Exportiert nur das Modul. Parameter: scene – Szene; prefix – Ausgabestamm."""
    bpy.context.window.scene = scene
    bpy.ops.object.select_all(action='DESELECT')
    for obj in COLLECTION.objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = ROOT
    bpy.ops.export_scene.gltf(filepath=str(prefix.with_suffix('.glb')), export_format='GLB',
                              use_selection=True, export_apply=True, export_extras=True,
                              export_yup=True, export_animations=False,
                              export_cameras=False, export_lights=False)
    bpy.ops.wm.save_as_mainfile(filepath=str(prefix.with_suffix('.blend')))


def save_poses(prefix):
    """Dokumentiert Welt- und zentrierte Gerätepositionen. Parameter: prefix – Ausgabestamm."""
    poses = {'title': 'DUNGEON WANTED', 'origin': 'bottom_center',
             'model_dimensions_mm': [WIDTH, DEPTH, HEIGHT],
             'poses_blender_world_m': {'seated': [0, 0.0152, 0.0932], 'three_quarters': [0, 0.0152, 0.1075]},
             'poses_gltf_world_m': {'seated': [0, 0.0932, -0.0152], 'three_quarters': [0, 0.1075, -0.0152]},
             'poses_gltf_device_local_m': {'seated': [0, 0.0192, -0.0152], 'three_quarters': [0, 0.0335, -0.0152]}}
    prefix.with_suffix('.json').write_text(json.dumps(poses, indent=2), encoding='utf-8')


def render_previews(scene, prefix):
    """Rendert drei Kontrollansichten. Parameter: scene – Szene; prefix – Ausgabestamm."""
    for name, position in [('label', (0, 0.18, 0.027)), ('angle', (0.09, 0.17, 0.09)),
                           ('back', (0, -0.18, 0.027))]:
        aim_camera(scene, position)
        scene.render.filepath = str(prefix)+'_'+name+'.png'
        bpy.ops.render.render(write_still=True, scene=scene.name)
    aim_camera(scene, (0.09, 0.17, 0.09))


def generate(cover, output, render=False):
    """Erzeugt Modell und Dateien. Parameter: cover – Bild; output – Ordner; render – Vorschauen."""
    cover, output = Path(cover).expanduser().resolve(), Path(output).expanduser().resolve()
    if not cover.is_file():
        raise FileNotFoundError('Cover fehlt: %s' % cover)
    output.mkdir(parents=True, exist_ok=True)
    prefix = output/('dungeon-wanted_'+datetime.now().strftime('%Y%m%d_%H%M%S_%f'))
    original_scene = create_collection()
    create_model(cover)
    scene = create_scene()
    create_camera(scene)
    create_lights(scene)
    original_scene.collection.children.unlink(COLLECTION)
    export_model(scene, prefix)
    save_poses(prefix)
    if render:
        render_previews(scene, prefix)
    print('Cartridge erstellt:', prefix.with_suffix('.glb'))


class B2_OT_cartridge_cover(bpy.types.Operator):
    """Öffnet die Coverauswahl auch aus einem ungespeicherten Textblock."""
    bl_idname = 'b2.choose_cartridge_cover'
    bl_label = 'Cartridge-Cover auswählen'
    filepath: bpy.props.StringProperty(subtype='FILE_PATH')
    filter_glob: bpy.props.StringProperty(default='*.png;*.jpg;*.jpeg;*.webp', options={'HIDDEN'})
    output_directory: bpy.props.StringProperty()
    render_preview: bpy.props.BoolProperty(default=False)

    def invoke(self, context, event):
        """Öffnet den Dateidialog. Parameter: context – Blender-Kontext; event – Ereignis."""
        context.window_manager.fileselect_add(self)
        return {'RUNNING_MODAL'}

    def execute(self, context):
        """Übernimmt das gewählte Cover. Parameter: context – Blender-Kontext."""
        cover = Path(bpy.path.abspath(self.filepath))
        output = Path(self.output_directory) if self.output_directory else cover.parent/'Cartridge_Output'
        generate(cover, output, self.render_preview)
        self.report({'INFO'}, 'Cartridge erstellt: %s' % output)
        return {'FINISHED'}


def choose_cover(output, render):
    """Registriert die interaktive Auswahl. Parameter: output – Zielordner; render – Vorschauen."""
    previous = getattr(bpy.types, 'B2_OT_cartridge_cover', None)
    if previous:
        bpy.utils.unregister_class(previous)
    bpy.utils.register_class(B2_OT_cartridge_cover)
    bpy.ops.b2.choose_cartridge_cover('INVOKE_DEFAULT', output_directory=str(output) if output else '',
                                      render_preview=render)


def arguments():
    """Liest ausschließlich Argumente nach Blenders doppeltem Bindestrich."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cover', type=Path)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--render', action='store_true')
    return parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])


def main():
    """Startet den Generator mit Projektpfad oder Coverauswahl."""
    if bpy.app.version < (4, 2, 0):
        raise RuntimeError('Bitte Blender 4.2 oder neuer verwenden.')
    args, base = arguments(), find_project_root()
    cover = args.cover or (base/'assets/cartridge/dungeon-wanted.png' if base else None)
    output = args.output or (base/'assets/models/cartridge' if base else None)
    if cover:
        generate(cover, output or cover.expanduser().resolve().parent/'Cartridge_Output', args.render)
    elif bpy.app.background:
        raise RuntimeError('Projekt nicht gefunden. Bitte --cover "C:/Pfad/Cover.png" angeben.')
    else:
        choose_cover(output, args.render)


if __name__ == '__main__':
    main()
