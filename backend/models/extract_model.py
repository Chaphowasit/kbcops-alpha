import os

from utils.directory_utils import get_path
from utils.exceptions import FileException


def save_axioms(ontology_name, axioms):
    """Save axioms to a file

    Args:
        id (str): The id of the ontology
        axioms (list): The list of axioms to save
    Returns:
        list: The list of axioms saved to the file
    """
    try:
        path = get_path(ontology_name, "axioms.txt")
        with open(path, "w", encoding="utf-8") as f:
            for axiom in axioms:
                f.write("%s\n" % axiom)
        return axioms
    except Exception as e:
        raise FileException(f"Error saving axioms: {str(e)}")


def save_classes(ontology_name, classes):
    """Save classes to a file

    Args:
        id (str): The id of the ontology
        classes (list): The list of classes to save
    Returns:
        list: The list of classes saved to the file
    """
    try:
        path = get_path(ontology_name, "classes.txt")
        with open(path, "w", encoding="utf-8") as f:
            for cl in classes:
                f.write("%s\n" % cl)
        return classes
    except Exception as e:
        raise FileException(f"Error saving classes: {str(e)}")


def save_individuals(ontology_name, individuals):
    """Save individuals to a file

    Args:
        id (str): The id of the ontology
        individuals (list): The list of individuals to save
    Returns:
        list: The list of individuals saved to the file
    """
    try:
        path = get_path(ontology_name, "individuals.txt")
        with open(path, "w", encoding="utf-8") as f:
            for individual in individuals:
                f.write("%s\n" % individual)
        return individuals
    except Exception as e:
        raise FileException(f"Error saving individuals: {str(e)}")


def save_annotations(ontology_name, annotations, projection):
    """Save annotations to a file

    Args:
        id (str): The id of the ontology
        annotations (list): The list of annotations to save
        projection (Projection): The projection object
    Returns:
        list: The list of annotations saved to the file
    """
    try:
        lines = []

        # uri label
        path = get_path(ontology_name, "uri_labels.txt")
        with open(path, "w", encoding="utf-8") as f:
            for e in projection.entityToPreferredLabels:
                for v in projection.entityToPreferredLabels[e]:
                    f.write("%s %s\n" % (e, v))
        with open(path, "r", encoding="utf-8") as file:
            lines += file.readlines()

        # annotation
        path = get_path(ontology_name, "annotations.txt")
        with open(path, "w", encoding="utf-8") as f:
            for a in annotations:
                f.write("%s\n" % " ".join(a))
        with open(path, "r", encoding="utf-8") as file:
            lines += file.readlines()

        return lines
    except Exception as e:
        raise FileException(f"Error saving annotations: {str(e)}")

def load_multi_input_files(ontology_name, files_list):
    """Load multiple input files

    Args:
        ontology_name (str): The name of the ontology
        input_file (str): The name of the input file
    Returns:
        list: The list of axioms loaded from the file
    """
    try:
        files_dict = dict()
        for file in files_list:
            tmp = load_input_file(ontology_name, file)
            files_dict[file] = tmp
        return files_dict
    except Exception as e:
        raise FileException(f"Error loading multiple input files: {str(e)}")
     

def load_input_file(ontology_name, input_file):
    """Load single the input file

    Args:
        ontology_name (str): The name of the ontology
        input_file (str): The name of the input file
    Returns:
        list: The list of axioms loaded from the file
    """
    try:
        path = get_path(ontology_name, input_file + '.txt')
        if not os.path.exists(path):
            raise FileException(f"Input file not found: {input_file}")
        return [line.strip() for line in open(path, 'r', encoding='utf-8').readlines()]
    except FileException as e:
        raise e
    except Exception as e:
        raise FileException(f"Error loading input file: {str(e)}")


def save_infer(ontology_name, infers):
    """Save inferred ancestors to a file

    Args:
        id (str): The id of the ontology
        infers (list): The list of inferred ancestors to save
    Returns:
        list: The list of inferred ancestors saved to the file
    """
    try:
        path = get_path(ontology_name, "inferred_ancestors.txt")
        with open(path, "w", encoding="utf-8") as f:
            for result in infers:
                f.write(result + "\n")
        return infers
    except Exception as e:
        raise FileException(f"Error saving inferred ancestors: {str(e)}")


def load_train_test_validation(ontology_name, type=0):
    """Load train, validation, and test files.

    Args:
        ontology_name (str): The name of the ontology.
        type (int): Type of inference for train (0, 1)
    Returns:
        tuple: Tuple containing train, validation, and test samples as lists.
    """
    try:
        file_path = get_path(ontology_name)
        train_path = os.path.join(file_path, f"train-infer-{type}.csv")
        valid_path = os.path.join(file_path, "valid.csv")
        test_path = os.path.join(file_path, "test.csv")

        train_samples = [line.strip().split(",") for line in open(train_path).readlines()]
        valid_samples = [line.strip().split(",") for line in open(valid_path).readlines()]
        test_samples = [line.strip().split(",") for line in open(test_path).readlines()]

        return train_samples, valid_samples, test_samples
    except Exception as e:
        raise FileException(f"Error loading train/test/validation files: {str(e)}")