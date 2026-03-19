import xml.etree.ElementTree as ET
import numpy as np
import json
import csv
from absl import app, flags

# Define flags
flags.DEFINE_string('xml_smpl', 'smpl.xml', 'Path to the SMPL XML file')
flags.DEFINE_string('annotation_file', 'annotation.json', 'Path to the annotation JSON file')
flags.DEFINE_bool('csv', False, 'Output in CSV format instead of XML')

actions = [
   { "id": 1, "name": "Head" },
  { "id": 2, "name": "UpperBody" },
  { "id": 3, "name": "RightHand" },
  { "id": 4, "name": "LeftHand" },
  { "id": 5, "name": "LowerBody" },
  { "id": 6, "name": "OwnBody" },
  { "id": 7, "name": "Ring" },
  { "id": 8, "name": "Unclass" }
]

outcomes = [
    {"id": 0, "name": "Move"},
    {"id": 1, "name": "Punch landed on torso (body shot)"},
    {"id": 2, "name": "Punch blocked"},
    {"id": 3, "name": "Punch avoided - Missed due to defensive action"},
    {"id": 4, "name": "Air punch (missed, don’t touching the opponent)"},
    {"id": 5, "name": "Punch landed on head"}
]

postures = [
    {"id": 0, "name": "High guard"},
    {"id": 1, "name": "Low hands"},
    {"id": 2, "name": "Southpaw stance"},
    {"id": 3, "name": "Orthodox stance"},
    {"id": 4, "name": "Squared"},
    {"id": 5, "name": "Balance"}
]

action_dict = {item["id"]: item["name"] for item in actions}
outcome_dict = {item["id"]: item["name"] for item in outcomes}
posture_dict = {item["id"]: item["name"] for item in postures}

def load_annotation_data(annotation_file):
    with open(annotation_file, 'r') as f:
        annotation_data = json.load(f)
    return annotation_data

def write_smpl_with_annotations(data, annotation_data, filename='smpl_annot.xml'):
    root = ET.Element("mocap")
    shapes_dict = {}
    shape_matrices, matrices = data
    skill_annotation_list = annotation_data["annotation"]["skillAnnotationList"]
    
    for person_id, person_data in sorted(matrices.items()):
        poses = person_data[:, 6:]
        global_orient = person_data[:, 3:6]
        transl = person_data[:, :3]
        betas = shape_matrices[person_id]

        shapes_dict[person_id] = betas.tolist()
        
        # Initialize action annotations for the current person
        actions = {}
        for annotation in skill_annotation_list:
            if annotation["person"] == person_id:
                start_frame = int(annotation["start"] * 6)
                end_frame = int(annotation["end"] * 6)
                action_id = annotation["action"]
                outcome_id = annotation["outcome"]
                posture_id = annotation["posture"]
                actions.update({
                    frame: {
                        "action_id": action_dict.get(action_id, "Unknown"),
                        "outcome": outcome_dict.get(outcome_id, "Unknown"),
                        "posture": posture_dict.get(posture_id, "Unknown")
                    }
                    for frame in range(start_frame, end_frame + 1)
                })

        previous_action = None
        previous_outcome = None
        previous_posture = None

        for frame, v in enumerate(poses):
            keyframe = ET.SubElement(root, "keyframe", key="{:06}".format(frame))
            person_key = ET.SubElement(keyframe, "key")
            person_key.set("personID", str(person_id))

            Th_str = " ".join(f"{float(r):.7f}" for r in transl[frame])
            Rh_str = " ".join(f"{float(r):.7f}" for r in global_orient[frame])
            poses_str = f"{Th_str} {Rh_str} {' '.join(f'{pose:.7f}' for pose in v)}"
            person_key.set("poses", poses_str)

            # Add action annotation if available for this frame
            if frame in actions and "action_id" in actions[frame]:
                action_name = actions[frame]["action_id"]
                outcome_name = actions[frame]["outcome"]
                posture_name = actions[frame]["posture"]
                person_key.set("action", action_name)
                person_key.set("outcome", outcome_name)
                person_key.set("posture", posture_name)

                previous_action = action_name
                previous_outcome = outcome_name
                previous_posture = posture_name
            else:
                # If no action is defined for this frame, use the previous one
                if previous_action:
                    person_key.set("action", previous_action)
                    person_key.set("outcome", previous_outcome)
                    person_key.set("posture", previous_posture)

        shapes_str = " ".join([f"{shape:.7f}" for shape in shapes_dict[person_id]])
        root.set(f"shape_{person_id}", shapes_str)

    # Convert XML tree to string with line breaks after each keyframe
    xml_string = ET.tostring(root, encoding="utf-8")
    xml_string_with_linebreaks = xml_string.replace(b'<keyframe', b'\n<keyframe')

    # Write to file
    with open(filename, 'wb') as f:
        f.write(xml_string_with_linebreaks)

def write_csv_with_annotations(data, annotation_data, filename='smpl_annot.csv'):
    shape_matrices, matrices = data
    skill_annotation_list = annotation_data["annotation"]["skillAnnotationList"]
    csv_rows = []
    
    for person_id, person_data in sorted(matrices.items()):
        poses = person_data[:, 6:]
        global_orient = person_data[:, 3:6]
        transl = person_data[:, :3]
        betas = shape_matrices[person_id].tolist()
        
        # Initialize action annotations for the current person
        actions = {}
        for annotation in skill_annotation_list:
            if annotation["person"] == person_id:
                start_frame = int(annotation["start"] * 6)
                end_frame = int(annotation["end"] * 6)
                action_id = annotation["action"]
                outcome_id = annotation["outcome"]
                posture_id = annotation["posture"]
                actions.update({
                    frame: {
                        "action_id": action_dict.get(action_id, "Unknown"),
                        "outcome": outcome_dict.get(outcome_id, "Unknown"),
                        "posture": posture_dict.get(posture_id, "Unknown")
                    }
                    for frame in range(start_frame, end_frame + 1)
                })

        previous_action = None
        previous_outcome = None
        previous_posture = None

        for frame, v in enumerate(poses):
            row = {
                "frame": frame,
                "person_id": person_id,
                "Th_x": transl[frame][0],
                "Th_y": transl[frame][1],
                "Th_z": transl[frame][2],
                "Rh_x": global_orient[frame][0],
                "Rh_y": global_orient[frame][1],
                "Rh_z": global_orient[frame][2],
                "poses": list(v),
                "action": None,
                "outcome": None,
                "posture": None
            }

            # Add action annotation if available for this frame
            if frame in actions and "action_id" in actions[frame]:
                row["action"] = actions[frame]["action_id"]
                row["outcome"] = actions[frame]["outcome"]
                row["posture"] = actions[frame]["posture"]

                previous_action = row["action"]
                previous_outcome = row["outcome"]
                previous_posture = row["posture"]
            else:
                # If no action is defined for this frame, use the previous one
                row["action"] = previous_action
                row["outcome"] = previous_outcome
                row["posture"] = previous_posture

            csv_rows.append(row)
        
    # Write CSV file
    with open(filename, 'w', newline='') as csvfile:
        fieldnames = [
            "frame", "person_id", "Th_x", "Th_y", "Th_z", 
            "Rh_x", "Rh_y", "Rh_z", "poses", "action", 
            "outcome", "posture"
        ]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()
        for row in csv_rows:
            # Flatten poses for CSV output
            row["poses"] = " ".join(f"{pose:.7f}" for pose in row["poses"])
            writer.writerow(row)

def read_smpl(xml_smpl):
    tree = ET.parse(xml_smpl)
    root = tree.getroot()
    shape_matrices = []
    shape_index = 0
    while True:
        shape_attr = f'shape_{shape_index}'
        if shape_attr in root.attrib:
            shape_matrix = np.fromstring(root.attrib[shape_attr], sep=' ')
            shape_matrices.append(shape_matrix)
            shape_index += 1
        else:
            break

    keyframes = root.findall('keyframe')
    person_data = {}

    for keyframe in keyframes:
        keys = keyframe.findall('key')
        for key_data in keys:
            person_id = int(key_data.attrib['personID'])
            poses = np.fromstring(key_data.attrib['poses'], sep=' ')
            if person_id not in person_data:
                person_data[person_id] = []

            person_data[person_id].append(poses)

    matrices = {}
    for person_id, pose_list in person_data.items():
        matrices[person_id] = np.array(pose_list)

    return shape_matrices, matrices
def main(argv):
    flags.FLAGS(argv)

    data = read_smpl(flags.FLAGS.xml_smpl)

    annotation_data = load_annotation_data(flags.FLAGS.annotation_file)

    if flags.FLAGS.csv:
        write_csv_with_annotations(data, annotation_data)
    else:
        write_smpl_with_annotations(data, annotation_data)

if __name__ == "__main__":
    app.run(main)