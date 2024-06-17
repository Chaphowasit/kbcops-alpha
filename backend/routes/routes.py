import os
import time
from controllers.graph_controller import create_graph
from controllers.evaluator import predict_func
from controllers.embed_controller import embed_func
from controllers.extract_controller import extract_data
from flask import jsonify, request, Blueprint  # type: ignore
from controllers.ontology_controller import getAll_ontology, upload_ontology


ontology_blueprint = Blueprint("ontology", __name__)


@ontology_blueprint.route("/upload", methods=["POST"])
def upload():
    if "owl_file" not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files["owl_file"]
    id = request.form.get("onto_id")

    if file.filename == "":
        return jsonify({"message": "No selected file"}), 400

    if not id:
        return jsonify({"message": "No id provided"}), 400

    path = upload_ontology(file, id)
    if path:
        return (
            jsonify({"message": "File uploaded successfully", "onto_id": id[:-4]}),
            200,
        )
    else:
        return jsonify({"message": "File upload failed"}), 500


@ontology_blueprint.route("/extract/<ontology>", methods=["GET"])
def extract(ontology):
    if ontology.endswith(".owl"):
        ontology = ontology[:-4]

    data = extract_data(ontology)
    if data:
        return jsonify({"message": "Extraction successfully", "data": data}), 200
    else:
        return jsonify({"message": "Extraction failed"}), 500


@ontology_blueprint.route("/ontology", methods=["GET"])
def list_ontologies():
    ontologies = getAll_ontology()
    return (
        jsonify({"message": "Ontologies listed successfully", "onto_list": ontologies}),
        200,
    )


@ontology_blueprint.route("/embed/<ontology>", methods=["GET"])
def embed_route(ontology):
    algorithm = request.args.get("algo")
    print(f"Ontology: {ontology}, Algorithm: {algorithm}")

    # check if system have ontology file and algorithm so that it can directly return the result
    if os.path.exists(f"backend/storage/{ontology}/{algorithm}/model"):
        result = f"{algorithm} model already exists for {ontology} ontology"
        print(result, f"{algorithm}")
        return jsonify({"message": result, "model_id": f"{algorithm}"})

    # if not then call the embed_func to generate the model
    result = embed_func(ontology_name=ontology, algorithm=algorithm)
    print(result, f"{algorithm}")
    return jsonify({"message": result, "model_id": f"{algorithm}"})


@ontology_blueprint.route("/evaluate/<ontology>/<model_id>", methods=["GET"])
def predict_route(ontology, model_id):

    result = predict_func(ontology_file=ontology, model_id=model_id)
    return jsonify({"message": result})

@ontology_blueprint.route("/graph/<ontology>", methods=["GET"])
def predict_route(ontology):

    result = create_graph(ontology_file=ontology)
    return jsonify({"message": result})
